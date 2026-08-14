/*
 * Faith In — Firebase data backend
 * ================================
 *
 * Background
 * ----------
 * The application was originally a WordPress plugin. Every data operation is
 * still sent as an `action` to `cv_ajax.ajax_url` in the WordPress admin-ajax
 * style. When the app was converted to a standalone Next.js deployment the PHP
 * backend went away and `/api/compat` was left returning HTTP 501 for
 * everything, which is why creating posts, loading the feed, commenting,
 * liking and profile editing all failed.
 *
 * What this file does
 * -------------------
 * Rather than rewriting the 8,000-line application, this module installs a
 * jQuery ajax transport that intercepts requests to `cv_ajax.ajax_url`, reads
 * the `action`, and fulfils it directly against Firebase Auth, Cloud Firestore
 * and Cloud Storage from the browser. It returns exactly the
 * `{ success, data }` envelope the application already expects, so no calling
 * code had to change.
 *
 * Authorisation is enforced by the Firestore and Storage security rules, not
 * here — this file cannot grant itself access it does not have.
 *
 * Load order: after jQuery, before faith-in-app.js.
 */

(function () {
    'use strict';

    var SDK = '10.14.1';
    var MAX_MEDIA_BYTES = 25 * 1024 * 1024; // Must stay in step with storage.rules.
    var MAX_MEDIA_FILES = 10;
    var FEED_PAGE_SIZE = 50;

    var bundlePromise = null;

    // ---------------------------------------------------------------------
    // Firebase bootstrap
    // ---------------------------------------------------------------------

    function firebaseConfig() {
        return (window.cv_ajax && window.cv_ajax.auth && window.cv_ajax.auth.firebase_config) || null;
    }

    function getBundle() {
        if (bundlePromise) return bundlePromise;

        var config = firebaseConfig();
        if (!config || !config.apiKey || !config.projectId) {
            return Promise.reject(new Error('Faith In is not connected to its database yet. Please try again shortly.'));
        }

        bundlePromise = Promise.all([
            import('https://www.gstatic.com/firebasejs/' + SDK + '/firebase-app.js'),
            import('https://www.gstatic.com/firebasejs/' + SDK + '/firebase-auth.js'),
            import('https://www.gstatic.com/firebasejs/' + SDK + '/firebase-firestore.js'),
            import('https://www.gstatic.com/firebasejs/' + SDK + '/firebase-storage.js')
        ]).then(function (mods) {
            var appMod = mods[0], authMod = mods[1], dbMod = mods[2], storageMod = mods[3];
            // Reuse the app the auth code already created so there is a single
            // auth state, rather than initialising a second Firebase app.
            var name = 'faith-in-auth';
            var app = appMod.getApps().find(function (a) { return a.name === name; })
                || appMod.initializeApp(config, name);
            return {
                app: app,
                auth: authMod.getAuth(app),
                db: dbMod.getFirestore(app),
                storage: storageMod.getStorage(app),
                authMod: authMod,
                dbMod: dbMod,
                storageMod: storageMod
            };
        });

        bundlePromise.catch(function () { bundlePromise = null; });
        return bundlePromise;
    }

    /** Resolves with the signed-in user, or null. Waits for auth to settle. */
    function currentUser(b) {
        if (b.auth.currentUser) return Promise.resolve(b.auth.currentUser);
        return new Promise(function (resolve) {
            var stop = b.authMod.onAuthStateChanged(b.auth, function (user) {
                stop();
                resolve(user || null);
            });
            // Never hang the UI if Firebase does not answer.
            setTimeout(function () { resolve(b.auth.currentUser || null); }, 6000);
        });
    }

    function requireUser(b) {
        return currentUser(b).then(function (user) {
            if (!user) throw new Error('Please log in to continue.');
            return user;
        });
    }

    // ---------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------

    /** Stable positive integer id from a uid, for UI code that expects numbers. */
    function numericId(uid) {
        var hash = 0, s = String(uid || '');
        for (var i = 0; i < s.length; i++) {
            hash = ((hash << 5) - hash) + s.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash) || 1;
    }

    function text(value, max) {
        var s = String(value == null ? '' : value).trim();
        return max ? s.slice(0, max) : s;
    }

    function visibilityOf(value) {
        var v = text(value).toLowerCase();
        return (v === 'private' || v === 'followers') ? v : 'public';
    }

    function relativeTime(date) {
        if (!date) return 'just now';
        var secs = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
        if (secs < 60) return 'just now';
        var mins = Math.floor(secs / 60);
        if (mins < 60) return mins + 'm';
        var hours = Math.floor(mins / 60);
        if (hours < 24) return hours + 'h';
        var days = Math.floor(hours / 24);
        if (days < 7) return days + 'd';
        return date.toLocaleDateString();
    }

    function toDate(value) {
        if (!value) return null;
        if (typeof value.toDate === 'function') return value.toDate();
        if (value instanceof Date) return value;
        return null;
    }

    function profileFor(user, doc) {
        var data = doc || {};
        var email = text(user.email || data.email);
        var name = text(data.displayName || user.displayName || (email ? email.split('@')[0] : '') || 'Faith In Member');
        var avatar = text(data.photoURL || user.photoURL);
        return {
            id: numericId(user.uid),
            uid: user.uid,
            logged_in: true,
            name: name,
            displayName: name,
            email: email,
            avatar_url: avatar,
            avatar: avatar,
            photo_url: avatar,
            cover_url: text(data.coverURL),
            bio: text(data.bio),
            role: text(data.role),
            gender: text(data.gender),
            location: text(data.location),
            industry: text(data.industry),
            church: text(data.church),
            ministry: text(data.ministry),
            provider: text(data.provider || 'firebase'),
            followers_count: 0,
            following_count: 0,
            followers: [],
            following: [],
            articles: [],
            resources: [],
            settings: data.settings || { theme: 'light', lang: 'English', notifications: true },
            verification: data.verification || null
        };
    }

    /** Reads the user's profile document, creating it on first sign-in. */
    function loadProfile(b, user) {
        var ref = b.dbMod.doc(b.db, 'users', user.uid);
        return b.dbMod.getDoc(ref).then(function (snap) {
            if (snap.exists()) {
                // Touch lastLoginAt; failure here must not block sign-in.
                b.dbMod.updateDoc(ref, { lastLoginAt: b.dbMod.serverTimestamp() }).catch(function () {});
                return profileFor(user, snap.data());
            }
            var email = text(user.email);
            var name = text(user.displayName || (email ? email.split('@')[0] : '') || 'Faith In Member');
            // Field set and names must match firestore.rules exactly.
            var fresh = {
                uid: user.uid,
                email: email,
                emailLower: email.toLowerCase(),
                displayName: name,
                firstName: name.split(' ')[0] || name,
                lastName: name.split(' ').slice(1).join(' '),
                photoURL: text(user.photoURL),
                provider: 'firebase',
                providers: (user.providerData || []).map(function (p) { return p.providerId; }),
                appUserId: numericId(user.uid),
                siteOrigin: (window.cv_ajax && window.cv_ajax.auth && window.cv_ajax.auth.site_origin) || window.location.origin,
                createdAt: b.dbMod.serverTimestamp(),
                updatedAt: b.dbMod.serverTimestamp(),
                lastLoginAt: b.dbMod.serverTimestamp(),
                status: 'active'
            };
            return b.dbMod.setDoc(ref, fresh).then(function () {
                return profileFor(user, fresh);
            });
        });
    }

    // ---------------------------------------------------------------------
    // Media upload
    // ---------------------------------------------------------------------

    function mediaKind(file) {
        var mime = String(file.type || '').toLowerCase();
        if (mime.indexOf('video/') === 0) return 'video';
        if (mime.indexOf('audio/') === 0) return 'audio';
        if (mime.indexOf('image/') === 0) return 'image';
        return 'file';
    }

    function uploadOne(b, user, file, onProgress) {
        if (file.size > MAX_MEDIA_BYTES) {
            return Promise.reject(new Error(
                '"' + (file.name || 'file') + '" is ' + Math.ceil(file.size / 1048576) +
                'MB. The limit is 25MB — please choose a smaller file.'
            ));
        }
        var safe = String(file.name || 'upload').replace(/[^\w.\-]+/g, '_').slice(-80);
        var path = 'faith-in-uploads/' + user.uid + '/' + Date.now() + '-' +
            Math.random().toString(36).slice(2, 8) + '-' + safe;
        var ref = b.storageMod.ref(b.storage, path);
        var task = b.storageMod.uploadBytesResumable(ref, file, { contentType: file.type || 'application/octet-stream' });

        return new Promise(function (resolve, reject) {
            task.on('state_changed',
                function (snap) {
                    if (onProgress && snap.totalBytes) onProgress(snap.bytesTransferred / snap.totalBytes);
                },
                function (err) {
                    reject(new Error(
                        err && err.code === 'storage/unauthorized'
                            ? 'You do not have permission to upload files. Please log in again.'
                            : 'Upload failed. Please check your connection and try again.'
                    ));
                },
                function () {
                    b.storageMod.getDownloadURL(task.snapshot.ref).then(function (url) {
                        resolve({
                            url: url,
                            local_url: url,
                            preview_url: url,
                            drive_url: '',
                            type: mediaKind(file),
                            mime: file.type || '',
                            name: file.name || '',
                            size: file.size,
                            path: path
                        });
                    }).catch(reject);
                }
            );
        });
    }

    function uploadAll(b, user, files, onProgress) {
        var list = Array.prototype.slice.call(files || []).slice(0, MAX_MEDIA_FILES);
        if (!list.length) return Promise.resolve([]);
        var done = 0;
        return list.reduce(function (chain, file) {
            return chain.then(function (acc) {
                return uploadOne(b, user, file, function (fraction) {
                    if (onProgress) onProgress((done + fraction) / list.length);
                }).then(function (item) {
                    done += 1;
                    if (onProgress) onProgress(done / list.length);
                    return acc.concat([item]);
                });
            });
        }, Promise.resolve([]));
    }

    // ---------------------------------------------------------------------
    // Post shaping
    // ---------------------------------------------------------------------

    function shapePost(b, id, data, viewer) {
        var author = data.author || {};
        var created = toDate(data.createdAt);
        var reactions = data.reactions || {};
        var mine = viewer ? reactions[viewer.uid] : null;
        var media = Array.isArray(data.media_items) ? data.media_items : [];
        var cover = media.length ? (media[0].url || '') : text(data.cover_image_url);

        return {
            id: id,
            type: text(data.type || 'Text'),
            title: text(data.title),
            excerpt: text(data.excerpt),
            content: text(data.content),
            article_title: text(data.article_title),
            article_excerpt: text(data.article_excerpt),
            article_body: text(data.article_body),
            time: relativeTime(created),
            created_at: created ? created.toISOString() : '',
            author: {
                id: author.appUserId || numericId(author.uid),
                uid: author.uid || '',
                name: text(author.name || 'Faith In Member'),
                avatar_url: text(author.avatar_url),
                avatar: text(author.avatar_url),
                role: text(author.role),
                church: text(author.church),
                ministry: text(author.ministry),
                is_following: false,
                counts: {}
            },
            media_items: media,
            cover_image_url: cover,
            cover_media_url: cover,
            visibility: visibilityOf(data.visibility),
            post_visibility: visibilityOf(data.visibility),
            blessing_bg_color: text(data.blessing_bg_color),
            bg_color: text(data.blessing_bg_color),
            allow_download: data.allow_download !== false,
            likes: Object.keys(reactions).length,
            reaction_count: Object.keys(reactions).length,
            user_reaction: mine || null,
            current_user_reaction: mine || null,
            comment_count: parseInt(data.comment_count || 0, 10),
            comments: [],
            recent_comments: [],
            shares: parseInt(data.share_count || 0, 10),
            share_count: parseInt(data.share_count || 0, 10),
            reposts: parseInt(data.repost_count || 0, 10),
            repost_count: parseInt(data.repost_count || 0, 10),
            can_edit: !!(viewer && author.uid === viewer.uid),
            can_delete: !!(viewer && author.uid === viewer.uid)
        };
    }

    // ---------------------------------------------------------------------
    // Actions
    // ---------------------------------------------------------------------

    var actions = {};

    actions.cv_get_session = function (b, params) {
        return currentUser(b).then(function (user) {
            if (!user) return { logged_in: false };
            return loadProfile(b, user);
        });
    };

    actions.cv_firebase_sign_in = function (b) {
        return requireUser(b).then(function (user) { return loadProfile(b, user); });
    };

    actions.cv_logout = function (b) {
        return b.authMod.signOut(b.auth).then(function () { return { logged_out: true }; });
    };

    actions.cv_create_post = function (b, params, files, onProgress) {
        return requireUser(b).then(function (user) {
            return loadProfile(b, user).then(function (profile) {
                var mediaFiles = files['post_media[]'] || [];
                if (files.cover_image && files.cover_image.length) {
                    mediaFiles = mediaFiles.concat(files.cover_image);
                }
                if (files.blessing_music && files.blessing_music.length) {
                    mediaFiles = mediaFiles.concat(files.blessing_music);
                }

                var body = text(params.content || params.post_content);
                var title = text(params.title || params.post_title, 300);
                var staged = [];
                try {
                    staged = params.staged_media ? JSON.parse(params.staged_media) : [];
                } catch (e) { staged = []; }

                if (!body && !title && !mediaFiles.length && !staged.length) {
                    throw new Error('Write something or add a photo or video before posting.');
                }

                return uploadAll(b, user, mediaFiles, onProgress).then(function (uploaded) {
                    var media = staged.concat(uploaded);

                    // Preset blessing music is a static asset, not an upload.
                    var preset = text(params.blessing_preset_music);
                    if (preset) {
                        media.push({
                            url: '/assets/audio/blessings/' + preset + '.mp3',
                            local_url: '/assets/audio/blessings/' + preset + '.mp3',
                            preview_url: '',
                            type: 'audio',
                            mime: 'audio/mpeg',
                            name: text(params.blessing_music_name || 'Christian music'),
                            is_blessing_music: true
                        });
                    }

                    var doc = {
                        authorUid: user.uid,
                        author: {
                            uid: user.uid,
                            appUserId: profile.id,
                            name: profile.name,
                            avatar_url: profile.avatar_url,
                            role: text(params.author_role || profile.role),
                            church: text(params.author_church || profile.church),
                            ministry: text(params.author_ministry || profile.ministry)
                        },
                        type: text(params.post_type || params.type || 'Text'),
                        title: title,
                        excerpt: text(params.excerpt || params.post_excerpt, 600),
                        content: body,
                        article_title: text(params.article_title, 300),
                        article_excerpt: text(params.article_excerpt, 600),
                        article_body: text(params.article_body),
                        media_items: media,
                        cover_image_url: media.length ? (media[0].url || '') : '',
                        visibility: visibilityOf(params.post_visibility || params.visibility),
                        blessing_bg_color: text(params.blessing_bg_color || params.bg_color),
                        allow_download: String(params.allow_download) !== '0',
                        reactions: {},
                        comment_count: 0,
                        share_count: 0,
                        repost_count: 0,
                        createdAt: b.dbMod.serverTimestamp(),
                        updatedAt: b.dbMod.serverTimestamp()
                    };

                    return b.dbMod.addDoc(b.dbMod.collection(b.db, 'posts'), doc).then(function (ref) {
                        doc.createdAt = new Date();
                        return { id: ref.id, post: shapePost(b, ref.id, doc, user) };
                    });
                });
            });
        });
    };

    actions.cv_get_posts = function (b) {
        return currentUser(b).then(function (user) {
            var q = b.dbMod.query(
                b.dbMod.collection(b.db, 'posts'),
                b.dbMod.orderBy('createdAt', 'desc'),
                b.dbMod.limit(FEED_PAGE_SIZE)
            );
            return b.dbMod.getDocs(q).then(function (snap) {
                var items = [];
                snap.forEach(function (d) {
                    var data = d.data();
                    // Private posts are only for their author.
                    if (visibilityOf(data.visibility) === 'private' && (!user || data.authorUid !== user.uid)) return;
                    items.push(shapePost(b, d.id, data, user));
                });
                return { items: items };
            });
        });
    };

    actions.cv_delete_post = function (b, params) {
        var id = text(params.post_id || params.id);
        if (!id) throw new Error('That post could not be found.');
        return requireUser(b).then(function () {
            return b.dbMod.deleteDoc(b.dbMod.doc(b.db, 'posts', id)).then(function () {
                return { deleted: true, id: id };
            });
        });
    };

    actions.cv_like_post = function (b, params) {
        var id = text(params.post_id || params.id);
        var reaction = text(params.reaction || 'like') || 'like';
        if (!id) throw new Error('That post could not be found.');

        return requireUser(b).then(function (user) {
            var ref = b.dbMod.doc(b.db, 'posts', id);
            return b.dbMod.getDoc(ref).then(function (snap) {
                if (!snap.exists()) throw new Error('That post is no longer available.');
                var reactions = snap.data().reactions || {};
                var had = reactions[user.uid];
                // Tapping the same reaction again removes it. Build the
                // resulting map explicitly and take the count from that,
                // rather than doing +1/-1 arithmetic against a snapshot that
                // may alias the document we are about to write.
                var next = Object.assign({}, reactions);
                var removing = (had === reaction);
                if (removing) {
                    delete next[user.uid];
                } else {
                    next[user.uid] = reaction;
                }
                var count = Object.keys(next).length;

                var update = {};
                update['reactions.' + user.uid] = removing ? b.dbMod.deleteField() : reaction;

                return b.dbMod.updateDoc(ref, update).then(function () {
                    return {
                        id: id,
                        likes: count,
                        reaction_count: count,
                        user_reaction: removing ? null : reaction,
                        current_user_reaction: removing ? null : reaction
                    };
                });
            });
        });
    };

    actions.cv_create_post_comment = function (b, params) {
        var id = text(params.post_id || params.id);
        var body = text(params.comment || params.content || params.text, 2000);
        if (!id) throw new Error('That post could not be found.');
        if (!body) throw new Error('Write a comment first.');

        return requireUser(b).then(function (user) {
            return loadProfile(b, user).then(function (profile) {
                var comment = {
                    authorUid: user.uid,
                    author: { uid: user.uid, appUserId: profile.id, name: profile.name, avatar_url: profile.avatar_url },
                    content: body,
                    createdAt: b.dbMod.serverTimestamp()
                };
                return b.dbMod.addDoc(b.dbMod.collection(b.db, 'posts', id, 'comments'), comment).then(function (ref) {
                    b.dbMod.updateDoc(b.dbMod.doc(b.db, 'posts', id), {
                        comment_count: b.dbMod.increment(1)
                    }).catch(function () {});
                    return {
                        id: ref.id,
                        comment: {
                            id: ref.id,
                            content: body,
                            time: 'just now',
                            author: comment.author
                        }
                    };
                });
            });
        });
    };

    actions.cv_stage_post_media = function (b, params, files, onProgress) {
        return requireUser(b).then(function (user) {
            var list = files['post_media[]'] || files['media[]'] || files.file || [];
            return uploadAll(b, user, list, onProgress).then(function (items) {
                return { staged_media: items, items: items, ready: true };
            });
        });
    };

    actions.cv_update_profile = function (b, params, files, onProgress) {
        return requireUser(b).then(function (user) {
            var photos = files.profile_image || files.avatar || [];
            return uploadAll(b, user, photos, onProgress).then(function (uploaded) {
                var ref = b.dbMod.doc(b.db, 'users', user.uid);
                // Only the fields firestore.rules permits on update.
                var update = { updatedAt: b.dbMod.serverTimestamp() };
                var name = text(params.name || params.profile_name, 120);
                if (name) {
                    update.displayName = name;
                    update.firstName = name.split(' ')[0] || name;
                    update.lastName = name.split(' ').slice(1).join(' ');
                }
                if (uploaded.length) update.photoURL = uploaded[0].url;

                return b.dbMod.updateDoc(ref, update)
                    .then(function () { return loadProfile(b, user); });
            });
        });
    };

    actions.cv_get_suggested_users = function () { return Promise.resolve({ items: [] }); };
    actions.cv_find_users = function () { return Promise.resolve({ items: [] }); };
    actions.cv_get_resources = function () { return Promise.resolve({ items: [] }); };
    actions.cv_get_prayers = function () { return Promise.resolve({ items: [] }); };
    actions.cv_get_jobs = function () { return Promise.resolve({ items: [] }); };
    actions.cv_social_get_followers = function () { return Promise.resolve({ items: [] }); };
    actions.cv_social_get_following = function () { return Promise.resolve({ items: [] }); };
    actions.cv_get_verification_status = function () {
        return Promise.resolve({ verification: null, request: null, tiers: [] });
    };
    actions.cv_update_user_settings = function (b, params) {
        return Promise.resolve({ saved: true, settings: params });
    };

    // ---------------------------------------------------------------------
    // jQuery transport
    // ---------------------------------------------------------------------

    /** Splits a jQuery ajax payload into plain params and File lists. */
    function readPayload(settings) {
        var params = {};
        var files = {};

        var data = settings.data;
        if (data instanceof FormData) {
            data.forEach(function (value, key) {
                if (value instanceof File || (typeof Blob !== 'undefined' && value instanceof Blob && value.name)) {
                    (files[key] = files[key] || []).push(value);
                } else {
                    params[key] = value;
                }
            });
        } else if (typeof data === 'string') {
            data.split('&').forEach(function (pair) {
                if (!pair) return;
                var bits = pair.split('=');
                params[decodeURIComponent(bits[0].replace(/\+/g, ' '))] =
                    decodeURIComponent((bits[1] || '').replace(/\+/g, ' '));
            });
        } else if (data && typeof data === 'object') {
            Object.keys(data).forEach(function (key) { params[key] = data[key]; });
        }

        return { params: params, files: files };
    }

    function install($) {
        var handled = false;

        $.ajaxTransport('+*', function (options, originalOptions) {
            var target = (window.cv_ajax && window.cv_ajax.ajax_url) || '/api/compat';
            var url = String(options.url || '');
            // Only intercept the legacy admin-ajax endpoint.
            if (url.indexOf(target) === -1) return;

            var payload = readPayload(originalOptions);
            var action = payload.params.action;
            if (!action) return;

            handled = true;

            return {
                send: function (headers, complete) {
                    var settled = false;
                    function finish(status, body) {
                        if (settled) return;
                        settled = true;
                        complete(status, status === 200 ? 'success' : 'error', { json: body }, '');
                    }

                    // Mirror upload progress back to the caller's xhr hook.
                    var progress = null;
                    if (typeof originalOptions.xhr === 'function') {
                        try {
                            var fake = originalOptions.xhr();
                            if (fake && fake.upload && typeof fake.upload.dispatchEvent !== 'function') fake = null;
                            progress = fake && fake.upload ? function (fraction) {
                                try {
                                    var evt = new ProgressEvent('progress', {
                                        lengthComputable: true,
                                        loaded: Math.round(fraction * 100),
                                        total: 100
                                    });
                                    fake.upload.dispatchEvent(evt);
                                } catch (e) { /* progress is cosmetic */ }
                            } : null;
                        } catch (e) { progress = null; }
                    }

                    getBundle()
                        .then(function (b) {
                            var handler = actions[action];
                            if (!handler) {
                                // Unimplemented feature: answer politely rather
                                // than surfacing a raw 501 to the member.
                                return { __unsupported: true };
                            }
                            return handler(b, payload.params, payload.files, progress);
                        })
                        .then(function (result) {
                            if (result && result.__unsupported) {
                                finish(200, {
                                    success: false,
                                    data: 'This part of Faith In is still being built. Everything else is ready to use.'
                                });
                                return;
                            }
                            finish(200, { success: true, data: result === undefined ? {} : result });
                        })
                        .catch(function (err) {
                            var message = (err && err.message) ? err.message : 'Something went wrong. Please try again.';
                            if (window.console && console.error) console.error('[Faith In] ' + action + ':', err);
                            // 200 with success:false is what the app's handlers expect.
                            finish(200, { success: false, data: message });
                        });
                },
                abort: function () { /* Firebase operations are not cancellable here. */ }
            };
        });

        if (window.console && console.info) {
            console.info('[Faith In] Firebase data backend active (' + Object.keys(actions).length + ' actions).');
        }
        return handled;
    }

    // jQuery is loaded immediately before this file, but guard anyway.
    if (window.jQuery) {
        install(window.jQuery);
    } else {
        var waited = 0;
        var timer = setInterval(function () {
            if (window.jQuery) {
                clearInterval(timer);
                install(window.jQuery);
            } else if ((waited += 50) > 10000) {
                clearInterval(timer);
                if (window.console && console.error) {
                    console.error('[Faith In] jQuery never loaded; the data backend is inactive.');
                }
            }
        }, 50);
    }
})();
