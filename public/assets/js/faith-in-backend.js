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
 * the `action`, and fulfils it against Firebase Auth and Cloud Firestore from
 * the browser. It returns exactly the `{ success, data }` envelope the
 * application already expects, so no calling code had to change.
 *
 * File uploads are the exception: they POST to /api/upload, which stores them
 * in Vercel Blob. Firebase Cloud Storage was dropped because publishing its
 * rules requires the Firebase CLI or Console, and uploads failed with
 * `storage/unauthorized` until they were.
 *
 * Authorisation for Firestore is enforced by the security rules, not here —
 * this file cannot grant itself access it does not have. Uploads are
 * authorised server-side in the route, which verifies the member's Firebase
 * ID token and namespaces files under their uid.
 *
 * Load order: after jQuery, before faith-in-app.js.
 */

(function () {
    'use strict';

    var SDK = '10.14.1';
    var MAX_MEDIA_BYTES = 25 * 1024 * 1024; // Must stay in step with app/api/upload/route.ts.
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
            import('https://www.gstatic.com/firebasejs/' + SDK + '/firebase-firestore.js')
            // firebase-storage is intentionally not loaded: uploads go through
            // /api/upload to Vercel Blob.
        ]).then(function (mods) {
            var appMod = mods[0], authMod = mods[1], dbMod = mods[2];
            // Reuse the app the auth code already created so there is a single
            // auth state, rather than initialising a second Firebase app.
            var name = 'faith-in-auth';
            var app = appMod.getApps().find(function (a) { return a.name === name; })
                || appMod.initializeApp(config, name);
            return {
                app: app,
                auth: authMod.getAuth(app),
                db: dbMod.getFirestore(app),
                authMod: authMod,
                dbMod: dbMod
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

    function isFirestoreIndexError(error) {
        var code = text(error && error.code).toLowerCase();
        var message = text(error && error.message).toLowerCase();
        return code === 'failed-precondition' || message.indexOf('requires an index') !== -1;
    }

    function publicErrorMessage(error) {
        var code = text(error && error.code).toLowerCase();
        var message = text(error && error.message, 500);
        if (code === 'permission-denied') return 'You do not have permission to complete that action.';
        if (code === 'unavailable' || code === 'deadline-exceeded') return 'Faith In could not reach the service. Please check your connection and try again.';
        if (isFirestoreIndexError(error)) return 'We could not prepare this content right now. Please try again shortly.';
        if (/https?:\/\/|firebase|firestore|googleapis| at |\bcode\s*:/i.test(message)) {
            return 'Something went wrong. Please try again.';
        }
        return message || 'Something went wrong. Please try again.';
    }

    function httpsUrl(value) {
        var url = text(value, 2048);
        return /^https:\/\/[^\s]+$/i.test(url) ? url : '';
    }

    function emailAddress(value) {
        var email = text(value, 320);
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
    }

    function normalizeMediaItem(item) {
        if (!item || typeof item !== 'object') return null;
        var url = text(item.url || item.local_url || item.preview_url, 2048);
        var isPreset = /^\/assets\/audio\/blessings\/[a-z0-9-]+\.mp3$/i.test(url);
        if (!isPreset) url = httpsUrl(url);
        if (!url) return null;
        var mime = text(item.mime, 120).toLowerCase();
        var type = text(item.type, 20).toLowerCase();
        if (['image', 'video', 'audio', 'file'].indexOf(type) === -1) type = 'file';
        return {
            url: url,
            local_url: url,
            preview_url: url,
            drive_url: '',
            type: type,
            mime: mime,
            name: text(item.name, 160),
            size: Math.max(0, parseInt(item.size || 0, 10) || 0),
            path: text(item.path, 500),
            is_blessing_music: item.is_blessing_music === true
        };
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

    function publicProfileDocument(b, user, data) {
        var source = data || {};
        var email = text(user.email || source.email);
        var name = text(source.displayName || user.displayName || (email ? email.split('@')[0] : '') || 'Faith In Member', 120);
        return {
            uid: user.uid,
            displayName: name,
            photoURL: text(source.photoURL || user.photoURL, 2048),
            coverURL: text(source.coverURL, 2048),
            bio: text(source.bio, 1000),
            role: text(source.role, 160),
            gender: text(source.gender, 80),
            location: text(source.location, 160),
            industry: text(source.industry, 160),
            church: text(source.church, 200),
            ministry: text(source.ministry, 200),
            appUserId: parseInt(source.appUserId || numericId(user.uid), 10),
            verification: source.verification || null,
            createdAt: source.createdAt || b.dbMod.serverTimestamp(),
            updatedAt: b.dbMod.serverTimestamp()
        };
    }

    function syncPublicProfile(b, user, data) {
        return b.dbMod.setDoc(
            b.dbMod.doc(b.db, 'publicProfiles', user.uid),
            publicProfileDocument(b, user, data),
            { merge: true }
        );
    }

    // Transitional compatibility for the safe two-phase rollout. Before the
    // new rules are deployed, /publicProfiles is denied and the existing
    // signed-in directory still lives in /users. After the rules deploy, the
    // public query succeeds and the private /users fallback is never used.
    function getMemberSnapshot(b) {
        var publicQuery = b.dbMod.query(b.dbMod.collection(b.db, 'publicProfiles'), b.dbMod.limit(200));
        return b.dbMod.getDocs(publicQuery).catch(function () {
            var legacyQuery = b.dbMod.query(b.dbMod.collection(b.db, 'users'), b.dbMod.limit(200));
            return b.dbMod.getDocs(legacyQuery);
        });
    }

    function getMemberDocument(b, uid) {
        var publicRef = b.dbMod.doc(b.db, 'publicProfiles', uid);
        return b.dbMod.getDoc(publicRef).then(function (snap) {
            if (snap.exists()) return snap;
            return b.dbMod.getDoc(b.dbMod.doc(b.db, 'users', uid));
        }).catch(function () {
            return b.dbMod.getDoc(b.dbMod.doc(b.db, 'users', uid));
        });
    }

    /** Reads the user's profile document, creating it on first sign-in. */
    function loadProfile(b, user) {
        var ref = b.dbMod.doc(b.db, 'users', user.uid);
        return b.dbMod.getDoc(ref).then(function (snap) {
            if (snap.exists()) {
                // Touch lastLoginAt; failure here must not block sign-in.
                b.dbMod.updateDoc(ref, { lastLoginAt: b.dbMod.serverTimestamp() }).catch(function () {});
                var existing = snap.data();
                return syncPublicProfile(b, user, existing)
                    .catch(function () {})
                    .then(function () { return profileFor(user, existing); });
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
                return syncPublicProfile(b, user, fresh)
                    .catch(function () {})
                    .then(function () { return profileFor(user, fresh); });
            });
        });
    }

    // ---------------------------------------------------------------------
    // Media upload
    // ---------------------------------------------------------------------

    /**
     * Uploads through /api/upload, which stores files in Vercel Blob.
     *
     * Previously this wrote straight to Firebase Cloud Storage, which failed
     * with `storage/unauthorized` because publishing Storage rules needs the
     * Firebase CLI or Console. Vercel Blob needs neither. The route verifies
     * the member's Firebase ID token server-side and namespaces every file
     * under their uid.
     */
    function uploadAll(b, user, files, onProgress) {
        var list = Array.prototype.slice.call(files || []).slice(0, MAX_MEDIA_FILES);
        if (!list.length) return Promise.resolve([]);

        var oversize = list.find(function (f) { return f.size > MAX_MEDIA_BYTES; });
        if (oversize) {
            return Promise.reject(new Error(
                '"' + (oversize.name || 'file') + '" is ' + Math.ceil(oversize.size / 1048576) +
                'MB. The limit is 25MB — please choose a smaller file.'
            ));
        }

        return user.getIdToken().then(function (token) {
            var form = new FormData();
            list.forEach(function (file) { form.append('files', file); });

            return new Promise(function (resolve, reject) {
                var xhr = new XMLHttpRequest();
                xhr.open('POST', '/api/upload', true);
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);

                if (xhr.upload && onProgress) {
                    xhr.upload.onprogress = function (event) {
                        if (event.lengthComputable && event.total) {
                            onProgress(event.loaded / event.total);
                        }
                    };
                }

                xhr.onload = function () {
                    var body = null;
                    try { body = JSON.parse(xhr.responseText); } catch (e) { body = null; }
                    if (xhr.status >= 200 && xhr.status < 300 && body && body.success) {
                        if (onProgress) onProgress(1);
                        resolve((body.data && body.data.items) || []);
                        return;
                    }
                    // Only surface `data` when it is actually a message. On a
                    // non-2xx response it can still be the success-shaped
                    // object, which would render as "[object Object]".
                    var message = (body && typeof body.data === 'string' && body.data)
                        ? body.data
                        : 'Upload failed. Please check your connection and try again.';
                    reject(new Error(message));
                };
                xhr.onerror = function () {
                    reject(new Error('Upload failed. Please check your connection and try again.'));
                };

                xhr.send(form);
            });
        });
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
                    var media = staged.concat(uploaded).map(normalizeMediaItem).filter(Boolean).slice(0, MAX_MEDIA_FILES);

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
            if (!user) return { items: [] };
            var publicQuery = b.dbMod.query(
                b.dbMod.collection(b.db, 'posts'),
                b.dbMod.where('visibility', '==', 'public'),
                b.dbMod.orderBy('createdAt', 'desc'),
                b.dbMod.limit(FEED_PAGE_SIZE)
            );
            var ownQuery = b.dbMod.query(
                b.dbMod.collection(b.db, 'posts'),
                b.dbMod.where('authorUid', '==', user.uid),
                b.dbMod.orderBy('createdAt', 'desc'),
                b.dbMod.limit(FEED_PAGE_SIZE)
            );
            function shapeSnapshots(snapshots) {
                var byId = {};
                snapshots.forEach(function (snap) {
                    snap.forEach(function (d) { byId[d.id] = d.data(); });
                });
                var items = Object.keys(byId).map(function (id) { return shapePost(b, id, byId[id], user); });
                items.sort(function (a, c) { return String(c.created_at || '').localeCompare(String(a.created_at || '')); });
                return { items: items };
            }

            return Promise.all([b.dbMod.getDocs(publicQuery), b.dbMod.getDocs(ownQuery)]).then(shapeSnapshots).catch(function (error) {
                if (!isFirestoreIndexError(error)) throw error;

                // Production may briefly run before a newly declared composite
                // index is available. Use the existing single-field index and
                // filter the bounded result in memory until Firestore catches up.
                var compatibilityQuery = b.dbMod.query(
                    b.dbMod.collection(b.db, 'posts'),
                    b.dbMod.orderBy('createdAt', 'desc'),
                    b.dbMod.limit(FEED_PAGE_SIZE)
                );
                return b.dbMod.getDocs(compatibilityQuery).then(function (snapshot) {
                    var visible = [];
                    snapshot.forEach(function (d) {
                        var data = d.data() || {};
                        if (visibilityOf(data.visibility) === 'public' || data.authorUid === user.uid) {
                            visible.push({ id: d.id, data: function () { return data; } });
                        }
                    });
                    return shapeSnapshots([{ forEach: function (callback) { visible.forEach(callback); } }]);
                });
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

    actions.cv_update_post = function (b, params) {
        var id = text(params.post_id || params.id);
        if (!id) throw new Error('That post could not be found.');
        return requireUser(b).then(function () {
            var update = { updatedAt: b.dbMod.serverTimestamp() };
            if (params.content !== undefined) update.content = text(params.content);
            if (params.title !== undefined) update.title = text(params.title, 300);
            if (params.post_visibility !== undefined) update.visibility = visibilityOf(params.post_visibility);
            return b.dbMod.updateDoc(b.dbMod.doc(b.db, 'posts', id), update).then(function () {
                return { id: id, updated: true };
            });
        });
    };

    /** Bumps a numeric counter on a post (shares, reposts). */
    function bumpPostCounter(b, params, field) {
        var id = text(params.post_id || params.id);
        if (!id) throw new Error('That post could not be found.');
        return requireUser(b).then(function () {
            var update = {};
            update[field] = b.dbMod.increment(1);
            return b.dbMod.updateDoc(b.dbMod.doc(b.db, 'posts', id), update).then(function () {
                return { id: id, ok: true };
            });
        });
    }

    actions.cv_share_post = function (b, params) { return bumpPostCounter(b, params, 'share_count'); };
    actions.cv_repost_post = function (b, params) { return bumpPostCounter(b, params, 'repost_count'); };

    // ---------------------------------------------------------------------
    // Resource library
    // ---------------------------------------------------------------------

    function shapeResource(id, data, viewer) {
        var author = data.author || {};
        return {
            id: id,
            title: text(data.title),
            description: text(data.description),
            category: text(data.category || 'Bible Study'),
            format: text(data.format || 'pdf'),
            type: text(data.format || 'pdf'),
            author: text(author.name || 'Faith In Member'),
            author_avatar: text(author.avatar_url),
            author_title: text(author.role),
            contributor_title: text(author.role),
            country: text(data.country),
            file_url: httpsUrl(data.file_url),
            url: httpsUrl(data.file_url),
            download_url: httpsUrl(data.file_url),
            open_url: httpsUrl(data.file_url),
            filename: text(data.filename),
            external: false,
            source: 'faithin',
            cover_image_url: httpsUrl(data.thumbnail_url),
            image_url: httpsUrl(data.thumbnail_url),
            thumbnail_url: httpsUrl(data.thumbnail_url),
            downloads: parseInt(data.download_count || 0, 10),
            download_count: parseInt(data.download_count || 0, 10),
            views: parseInt(data.view_count || 0, 10),
            view_count: parseInt(data.view_count || 0, 10),
            time: relativeTime(toDate(data.createdAt)),
            can_edit: !!(viewer && data.authorUid === viewer.uid),
            can_delete: !!(viewer && data.authorUid === viewer.uid)
        };
    }

    actions.cv_get_resources = function (b) {
        return currentUser(b).then(function (user) {
            var q = b.dbMod.query(
                b.dbMod.collection(b.db, 'resources'),
                b.dbMod.orderBy('createdAt', 'desc'),
                b.dbMod.limit(FEED_PAGE_SIZE)
            );
            return b.dbMod.getDocs(q).then(function (snap) {
                var items = [];
                snap.forEach(function (d) { items.push(shapeResource(d.id, d.data(), user)); });
                return { items: items };
            });
        });
    };

    actions.cv_upload_resource = function (b, params, files, onProgress) {
        return requireUser(b).then(function (user) {
            return loadProfile(b, user).then(function (profile) {
                var main = files.resource_file || files.file || [];
                var thumb = files.thumbnail || files.thumbnail_file || [];
                var title = text(params.title || params.res_title, 300);
                if (!title) throw new Error('Give the resource a title before publishing.');
                if (!main.length) throw new Error('Choose a file to publish.');

                return uploadAll(b, user, main, onProgress).then(function (uploaded) {
                    return uploadAll(b, user, thumb).then(function (thumbs) {
                        var doc = {
                            authorUid: user.uid,
                            author: {
                                uid: user.uid,
                                name: text(params.contributor_name || profile.name),
                                avatar_url: profile.avatar_url,
                                role: text(params.contributor_role || profile.role),
                                church: text(params.contributor_church || profile.church),
                                ministry: text(params.contributor_ministry || profile.ministry)
                            },
                            title: title,
                            description: text(params.description, 2000),
                            category: text(params.category || params.res_category || 'Bible Study'),
                            format: text(params.format || params.res_format || 'pdf'),
                            country: text(params.country),
                            file_url: uploaded.length ? uploaded[0].url : '',
                            filename: uploaded.length ? uploaded[0].name : '',
                            thumbnail_url: thumbs.length ? thumbs[0].url : '',
                            allow_download: String(params.allow_download) !== '0',
                            download_count: 0,
                            view_count: 0,
                            createdAt: b.dbMod.serverTimestamp(),
                            updatedAt: b.dbMod.serverTimestamp()
                        };
                        return b.dbMod.addDoc(b.dbMod.collection(b.db, 'resources'), doc).then(function (ref) {
                            doc.createdAt = new Date();
                            return { id: ref.id, resource: shapeResource(ref.id, doc, user) };
                        });
                    });
                });
            });
        });
    };

    actions.cv_delete_resource = function (b, params) {
        var id = text(params.resource_id || params.id);
        if (!id) throw new Error('That resource could not be found.');
        return requireUser(b).then(function () {
            return b.dbMod.deleteDoc(b.dbMod.doc(b.db, 'resources', id)).then(function () {
                return { deleted: true, id: id };
            });
        });
    };

    actions.cv_download_resource = function (b, params) {
        var id = text(params.resource_id || params.id);
        if (!id) throw new Error('That resource could not be found.');
        return currentUser(b).then(function () {
            var ref = b.dbMod.doc(b.db, 'resources', id);
            return b.dbMod.getDoc(ref).then(function (snap) {
                if (!snap.exists()) throw new Error('That resource is no longer available.');
                b.dbMod.updateDoc(ref, { download_count: b.dbMod.increment(1) }).catch(function () {});
                return { id: id, url: httpsUrl(snap.data().file_url), download_url: httpsUrl(snap.data().file_url) };
            });
        });
    };

    // ---------------------------------------------------------------------
    // Prayer requests
    // ---------------------------------------------------------------------

    function shapePrayer(id, data, viewer) {
        var prayed = data.prayed || {};
        return {
            id: id,
            content: text(data.content),
            author: text((data.author || {}).name || 'Faith In Member'),
            author_avatar: text((data.author || {}).avatar_url),
            urgent: !!data.urgent,
            prayed_count: Object.keys(prayed).length,
            has_prayed: !!(viewer && prayed[viewer.uid]),
            time: relativeTime(toDate(data.createdAt)),
            can_edit: !!(viewer && data.authorUid === viewer.uid),
            can_delete: !!(viewer && data.authorUid === viewer.uid)
        };
    }

    actions.cv_get_prayers = function (b) {
        return currentUser(b).then(function (user) {
            var q = b.dbMod.query(
                b.dbMod.collection(b.db, 'prayers'),
                b.dbMod.orderBy('createdAt', 'desc'),
                b.dbMod.limit(FEED_PAGE_SIZE)
            );
            return b.dbMod.getDocs(q).then(function (snap) {
                var items = [];
                snap.forEach(function (d) { items.push(shapePrayer(d.id, d.data(), user)); });
                return { items: items };
            });
        });
    };

    actions.cv_create_prayer = function (b, params) {
        var body = text(params.content || params.prayer, 4000);
        if (!body) throw new Error('Write your prayer request first.');
        return requireUser(b).then(function (user) {
            return loadProfile(b, user).then(function (profile) {
                var doc = {
                    authorUid: user.uid,
                    author: { uid: user.uid, name: profile.name, avatar_url: profile.avatar_url },
                    content: body,
                    urgent: String(params.urgent) === '1' || params.urgent === true,
                    prayed: {},
                    createdAt: b.dbMod.serverTimestamp()
                };
                return b.dbMod.addDoc(b.dbMod.collection(b.db, 'prayers'), doc).then(function (ref) {
                    doc.createdAt = new Date();
                    return { id: ref.id, prayer: shapePrayer(ref.id, doc, user) };
                });
            });
        });
    };

    actions.cv_update_prayer = function (b, params) {
        var id = text(params.prayer_id || params.id);
        var body = text(params.content, 4000);
        if (!id) throw new Error('That prayer request could not be found.');

        return requireUser(b).then(function (user) {
            var ref = b.dbMod.doc(b.db, 'prayers', id);
            // No content means "I prayed for this" — a toggle on the member's
            // own key in the prayed map.
            if (!body) {
                return b.dbMod.getDoc(ref).then(function (snap) {
                    if (!snap.exists()) throw new Error('That prayer request is no longer available.');
                    var prayed = snap.data().prayed || {};
                    var next = Object.assign({}, prayed);
                    var had = !!next[user.uid];
                    if (had) delete next[user.uid]; else next[user.uid] = true;
                    var update = {};
                    update['prayed.' + user.uid] = had ? b.dbMod.deleteField() : true;
                    return b.dbMod.updateDoc(ref, update).then(function () {
                        return { id: id, prayed_count: Object.keys(next).length, has_prayed: !had };
                    });
                });
            }
            return b.dbMod.updateDoc(ref, { content: body }).then(function () {
                return { id: id, updated: true };
            });
        });
    };

    actions.cv_delete_prayer = function (b, params) {
        var id = text(params.prayer_id || params.id);
        if (!id) throw new Error('That prayer request could not be found.');
        return requireUser(b).then(function () {
            return b.dbMod.deleteDoc(b.dbMod.doc(b.db, 'prayers', id)).then(function () {
                return { deleted: true, id: id };
            });
        });
    };

    // ---------------------------------------------------------------------
    // Ministry jobs
    // ---------------------------------------------------------------------

    function shapeJob(id, data, viewer) {
        return {
            id: id,
            title: text(data.title),
            organization: text(data.organization),
            location: text(data.location),
            job_type: text(data.job_type || 'Full-time'),
            description: text(data.description),
            apply_url: httpsUrl(data.apply_url),
            contact_email: emailAddress(data.contact_email),
            featured: !!data.featured,
            is_promoted: !!data.featured,
            promoted: !!data.featured,
            time: relativeTime(toDate(data.createdAt)),
            can_edit: !!(viewer && data.authorUid === viewer.uid),
            can_delete: !!(viewer && data.authorUid === viewer.uid)
        };
    }

    function jobDoc(b, params, user) {
        return {
            authorUid: user.uid,
            title: text(params.job_title || params.title, 300),
            organization: text(params.job_organization || params.organization, 300),
            location: text(params.job_location || params.location, 300),
            job_type: text(params.job_type || 'Full-time'),
            description: text(params.job_description || params.description, 8000),
            apply_url: httpsUrl(params.job_apply_url || params.apply_url),
            contact_email: emailAddress(params.job_contact_email || params.contact_email),
            featured: false
        };
    }

    actions.cv_get_jobs = function (b) {
        return currentUser(b).then(function (user) {
            var q = b.dbMod.query(
                b.dbMod.collection(b.db, 'jobs'),
                b.dbMod.orderBy('createdAt', 'desc'),
                b.dbMod.limit(FEED_PAGE_SIZE)
            );
            return b.dbMod.getDocs(q).then(function (snap) {
                var items = [];
                snap.forEach(function (d) { items.push(shapeJob(d.id, d.data(), user)); });
                return { items: items };
            });
        });
    };

    actions.cv_create_job = function (b, params) {
        return requireUser(b).then(function (user) {
            var doc = jobDoc(b, params, user);
            if (!doc.title) throw new Error('Give the role a title.');
            if (!doc.organization) throw new Error('Add the church or organisation name.');
            if (!doc.apply_url && !doc.contact_email) throw new Error('Add a secure application link or a valid contact email.');
            doc.createdAt = b.dbMod.serverTimestamp();
            doc.updatedAt = b.dbMod.serverTimestamp();
            return b.dbMod.addDoc(b.dbMod.collection(b.db, 'jobs'), doc).then(function (ref) {
                doc.createdAt = new Date();
                return { id: ref.id, job: shapeJob(ref.id, doc, user) };
            });
        });
    };

    actions.cv_update_job = function (b, params) {
        var id = text(params.job_id || params.id);
        if (!id) throw new Error('That job could not be found.');
        return requireUser(b).then(function (user) {
            var doc = jobDoc(b, params, user);
            delete doc.authorUid;
            delete doc.featured;
            doc.updatedAt = b.dbMod.serverTimestamp();
            return b.dbMod.updateDoc(b.dbMod.doc(b.db, 'jobs', id), doc).then(function () {
                return { id: id, updated: true };
            });
        });
    };

    actions.cv_delete_job = function (b, params) {
        var id = text(params.job_id || params.id);
        if (!id) throw new Error('That job could not be found.');
        return requireUser(b).then(function () {
            return b.dbMod.deleteDoc(b.dbMod.doc(b.db, 'jobs', id)).then(function () {
                return { deleted: true, id: id };
            });
        });
    };

    // ---------------------------------------------------------------------
    // Members and following
    // ---------------------------------------------------------------------

    function followId(followerUid, targetUid) {
        return followerUid + '__' + targetUid;
    }

    function shapeMember(uid, data, viewer, following) {
        var name = text(data.displayName || 'Faith In Member');
        return {
            id: parseInt(data.appUserId || numericId(uid), 10),
            uid: uid,
            name: name,
            displayName: name,
            avatar_url: text(data.photoURL),
            avatar: text(data.photoURL),
            headline: text(data.bio || data.role),
            subtitle: text(data.role),
            role: text(data.role),
            church: text(data.church),
            ministry: text(data.ministry),
            location: text(data.location),
            bio: text(data.bio),
            verification: data.verification || null,
            is_self: !!(viewer && viewer.uid === uid),
            is_following: !!(following && following[uid]),
            counts: {},
            mutual_count: 0
        };
    }

    /** Set of uids the viewer follows, for is_following flags. */
    function followingMap(b, user) {
        if (!user) return Promise.resolve({});
        var q = b.dbMod.query(
            b.dbMod.collection(b.db, 'follows'),
            b.dbMod.where('followerUid', '==', user.uid),
            b.dbMod.limit(500)
        );
        return b.dbMod.getDocs(q).then(function (snap) {
            var map = {};
            snap.forEach(function (d) { map[d.data().targetUid] = true; });
            return map;
        }).catch(function () { return {}; });
    }

    function listMembers(b, matcher) {
        return currentUser(b).then(function (user) {
            return followingMap(b, user).then(function (following) {
                return getMemberSnapshot(b).then(function (snap) {
                    var items = [];
                    snap.forEach(function (d) {
                        var data = d.data();
                        if (user && d.id === user.uid) return;
                        if (matcher && !matcher(data)) return;
                        items.push(shapeMember(d.id, data, user, following));
                    });
                    return { items: items };
                });
            });
        });
    }

    actions.cv_find_users = function (b, params) {
        var term = text(params.search || params.query || params.s).toLowerCase();
        if (!term) return listMembers(b, null);
        return listMembers(b, function (data) {
            return [data.displayName, data.email, data.church, data.ministry, data.role, data.location]
                .some(function (field) {
                    return String(field || '').toLowerCase().indexOf(term) !== -1;
                });
        });
    };

    actions.cv_get_suggested_users = function (b) {
        return listMembers(b, null).then(function (result) {
            // Suggest people the member is not already following.
            var items = result.items.filter(function (u) { return !u.is_following; });
            return { items: items.slice(0, 12) };
        });
    };

    function setFollow(b, params, follow) {
        var targetUid = text(params.target_uid || params.uid);
        var targetId = text(params.user_id || params.id);

        return requireUser(b).then(function (user) {
            var resolve = targetUid
                ? Promise.resolve(targetUid)
                : getMemberSnapshot(b)
                    .then(function (snap) {
                        var found = '';
                        snap.forEach(function (d) {
                            if (!found && String(d.data().appUserId) === targetId) found = d.id;
                        });
                        if (!found) throw new Error('That member could not be found.');
                        return found;
                    });

            return resolve.then(function (uid) {
                if (uid === user.uid) throw new Error('You cannot follow your own account.');
                var ref = b.dbMod.doc(b.db, 'follows', followId(user.uid, uid));
                if (!follow) {
                    return b.dbMod.deleteDoc(ref).then(function () {
                        return { following: false, uid: uid, user_id: targetId };
                    });
                }
                return b.dbMod.setDoc(ref, {
                    followerUid: user.uid,
                    targetUid: uid,
                    createdAt: b.dbMod.serverTimestamp()
                }).then(function () {
                    return { following: true, uid: uid, user_id: targetId };
                });
            });
        });
    }

    actions.cv_social_follow_user = function (b, params) { return setFollow(b, params, true); };
    actions.cv_social_unfollow_user = function (b, params) { return setFollow(b, params, false); };

    function followList(b, field, otherField) {
        return requireUser(b).then(function (user) {
            var q = b.dbMod.query(
                b.dbMod.collection(b.db, 'follows'),
                b.dbMod.where(field, '==', user.uid),
                b.dbMod.limit(200)
            );
            return b.dbMod.getDocs(q).then(function (snap) {
                var uids = [];
                snap.forEach(function (d) { uids.push(d.data()[otherField]); });
                if (!uids.length) return { items: [] };
                return followingMap(b, user).then(function (following) {
                    return Promise.all(uids.map(function (uid) {
                        return getMemberDocument(b, uid)
                            .then(function (s) { return s.exists() ? shapeMember(uid, s.data(), user, following) : null; })
                            .catch(function () { return null; });
                    })).then(function (items) {
                        return { items: items.filter(Boolean) };
                    });
                });
            });
        });
    }

    actions.cv_social_get_followers = function (b) { return followList(b, 'targetUid', 'followerUid'); };
    actions.cv_social_get_following = function (b) { return followList(b, 'followerUid', 'targetUid'); };

    // ---------------------------------------------------------------------
    // Bookmarks, settings, verification, Bible notes
    // ---------------------------------------------------------------------

    actions.cv_toggle_bookmark = function (b, params) {
        var id = text(params.post_id || params.object_id || params.id);
        if (!id) throw new Error('That item could not be found.');
        return requireUser(b).then(function (user) {
            var ref = b.dbMod.doc(b.db, 'users', user.uid, 'bookmarks', id);
            return b.dbMod.getDoc(ref).then(function (snap) {
                if (snap.exists()) {
                    return b.dbMod.deleteDoc(ref).then(function () {
                        return { id: id, bookmarked: false };
                    });
                }
                return b.dbMod.setDoc(ref, {
                    objectId: id,
                    objectType: text(params.object_type || 'post'),
                    createdAt: b.dbMod.serverTimestamp()
                }).then(function () {
                    return { id: id, bookmarked: true };
                });
            });
        });
    };

    actions.cv_update_user_settings = function (b, params) {
        return requireUser(b).then(function (user) {
            var settings = {
                theme: text(params.theme) === 'dark' ? 'dark' : 'light',
                lang: text(params.lang) || 'English',
                notifications: String(params.notifications) !== '0'
            };
            return b.dbMod.updateDoc(b.dbMod.doc(b.db, 'users', user.uid), {
                settings: settings,
                updatedAt: b.dbMod.serverTimestamp()
            }).then(function () {
                return { saved: true, settings: settings };
            });
        });
    };

    var VERIFICATION_TIERS = [
        { type: 'blue', label: 'Verified member', note: 'Identity confirmed.' },
        { type: 'yellow', label: 'Verified church or ministry', note: 'Registered organisation.' },
        { type: 'purple', label: 'Verified leader', note: 'Recognised pastor or teacher.' }
    ];

    actions.cv_get_verification_status = function (b) {
        return currentUser(b).then(function (user) {
            if (!user) return { verification: null, request: null, tiers: VERIFICATION_TIERS };
            return b.dbMod.getDoc(b.dbMod.doc(b.db, 'users', user.uid)).then(function (snap) {
                var data = snap.exists() ? snap.data() : {};
                return {
                    verification: data.verification || null,
                    request: data.verificationRequest || null,
                    tiers: VERIFICATION_TIERS
                };
            });
        });
    };

    actions.cv_request_verification = function (b, params) {
        return requireUser(b).then(function (user) {
            var request = {
                status: 'pending',
                note: text(params.note, 1000),
                requestedAt: new Date().toISOString()
            };
            return b.dbMod.updateDoc(b.dbMod.doc(b.db, 'users', user.uid), {
                verificationRequest: request,
                updatedAt: b.dbMod.serverTimestamp()
            }).then(function () {
                return { request: request, tiers: VERIFICATION_TIERS };
            });
        });
    };

    actions.cv_bible_save_notes = function (b, params) {
        return requireUser(b).then(function (user) {
            var notes = {};
            try {
                notes = params.notes ? JSON.parse(params.notes) : {};
            } catch (e) {
                notes = { Doctrine: text(params.Doctrine), Encouragement: text(params.Encouragement), Application: text(params.Application) };
            }
            var ref = b.dbMod.doc(b.db, 'users', user.uid, 'bible', 'sermonNotes');
            return b.dbMod.setDoc(ref, { notes: notes, updatedAt: b.dbMod.serverTimestamp() })
                .then(function () { return { saved: true, notes: notes }; });
        });
    };

    actions.cv_bible_get_notes = function (b) {
        return requireUser(b).then(function (user) {
            return b.dbMod.getDoc(b.dbMod.doc(b.db, 'users', user.uid, 'bible', 'sermonNotes'))
                .then(function (snap) {
                    return { notes: snap.exists() ? (snap.data().notes || {}) : {} };
                });
        });
    };

    actions.cv_bible_save_typing_score = function (b, params) {
        return requireUser(b).then(function (user) {
            var ref = b.dbMod.doc(b.db, 'users', user.uid, 'bible', 'typing');
            return b.dbMod.setDoc(ref, {
                lastScore: parseInt(params.score || 0, 10) || 0,
                updatedAt: b.dbMod.serverTimestamp()
            }, { merge: true }).then(function () { return { saved: true }; });
        });
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
                            var message = publicErrorMessage(err);
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
