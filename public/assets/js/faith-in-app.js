// Curated Vault JavaScript
(function($) {
    'use strict';

    // State management
    let state = {
        tab: 'home',
        resources: [],
        resourcesLoading: false,
        resourcesError: '',
        posts: [],
        feedLoading: true,
        authRestoring: cvUsesFirebaseBackend() && cvHasFirebaseConfig(),
        suggestedUsers: [],
        suggestedVisibleCount: 4,
        suggestedUsersLoading: false,
        userSearch: '',
        hiddenNetworkUserIds: [],
        foundUsers: [],
        usersLoading: false,
        usersHasSearched: false,
        prayers: [],
        jobs: [],
        bookmarks: [],
        savedPostsOnly: false,
        downloads: [],
        favorites: [],
        settings: ((cv_ajax.auth && cv_ajax.auth.current_user && cv_ajax.auth.current_user.settings) || { theme: 'light', lang: 'English', notifications: true }),
        feedFilter: 'All',
        exploreSubTab: 'resources',
        exploreSearch: '',
        exploreCat: 'All',
        exploreSort: 'Popular',
        selectedResource: null,
        createMode: 'post',
        createIntent: 'post',
        profileSubTab: 'account',
        bibleSearch: '',
        bibleTopic: 'All',
        dailyBibleVerse: null,
        dailyBibleVerseLoading: false,
        dailyBibleVerseError: '',
        prayerFilter: 'Newest',
        jobSearch: '',
        jobLocation: '',
        jobFilter: 'All',
        showJobForm: false,
        editingJobId: null,
        jobTitle: '',
        jobOrganization: '',
        jobLocationField: '',
        jobType: 'Full-time',
        jobDescription: '',
        jobApplyUrl: '',
        jobContactEmail: '',
        selectedJob: null,
        showNotifs: false,
        postTitle: '',
        postExcerpt: '',
        postContent: '',
        postType: 'Text',
        postAuthorName: '',
        postAuthorRole: '',
        postAuthorChurch: '',
        postAuthorMinistry: '',
        selectedPostCoverName: '',
        selectedPostCoverFile: null,
        postCoverPreviewUrl: '',
        selectedPostMediaFiles: [],
        postMediaPreviewUrls: [],
        postMediaMode: 'none',
        postMediaReadyPercent: 0,
        postMediaReadyStatus: '',
        postMediaUploadInProgress: false,
        postMediaServerReady: false,
        stagedPostMedia: [],
        postAllowDownload: true,
        postVisibility: 'public',
        showPostEmojiPicker: false,
        blessingBgColor: 'blue',
        selectedBlessingMusicFile: null,
        selectedBlessingMusicName: '',
        selectedBlessingPresetMusic: '',
        blessingMusicPreviewUrl: '',
        activeBlessingStoryId: null,
        authMode: (cv_ajax.auth && cv_ajax.auth.mode) || 'open',
        isLoggedIn: !!(cv_ajax.auth && cv_ajax.auth.is_logged_in),
        currentUser: (cv_ajax.auth && cv_ajax.auth.current_user) || null,
        verificationStatus: ((cv_ajax.auth && cv_ajax.auth.verification_status && cv_ajax.auth.verification_status.verification) || (cv_ajax.auth && cv_ajax.auth.current_user && cv_ajax.auth.current_user.verification) || null),
        verificationRequest: ((cv_ajax.auth && cv_ajax.auth.verification_status && cv_ajax.auth.verification_status.request) || null),
        verificationTiers: ((cv_ajax.auth && cv_ajax.auth.verification_status && cv_ajax.auth.verification_status.tiers) || []),
        verificationLoading: false,
        verificationRequesting: false,
        authName: '',
        authFirstName: '',
        authLastName: '',
        authEmail: '',
        authPassword: '',
        authPasswordVisible: false,
        authErrors: {},
        authLoading: false,
        authPhone: '',
        showAuthPanel: false,
        authPanelTitle: 'Log In',
        profileName: ((cv_ajax.auth && cv_ajax.auth.current_user && cv_ajax.auth.current_user.name) || ''),
        profileGender: ((cv_ajax.auth && cv_ajax.auth.current_user && cv_ajax.auth.current_user.gender) || ''),
        profileRole: ((cv_ajax.auth && cv_ajax.auth.current_user && cv_ajax.auth.current_user.role) || ''),
        profileLocation: ((cv_ajax.auth && cv_ajax.auth.current_user && cv_ajax.auth.current_user.location) || ''),
        profileIndustry: ((cv_ajax.auth && cv_ajax.auth.current_user && cv_ajax.auth.current_user.industry) || ''),
        profileChurch: ((cv_ajax.auth && cv_ajax.auth.current_user && cv_ajax.auth.current_user.church) || ''),
        profileMinistry: ((cv_ajax.auth && cv_ajax.auth.current_user && cv_ajax.auth.current_user.ministry) || ''),
        profileBio: ((cv_ajax.auth && cv_ajax.auth.current_user && cv_ajax.auth.current_user.bio) || ''),
        selectedProfileImageName: '',
        selectedProfileImageFile: null,
        profileImagePreviewUrl: '',
        selectedProfileCoverName: '',
        selectedProfileCoverFile: null,
        profileCoverPreviewUrl: '',
        profileArticles: ((cv_ajax.auth && cv_ajax.auth.current_user && cv_ajax.auth.current_user.articles) || []),
        profileResources: ((cv_ajax.auth && cv_ajax.auth.current_user && cv_ajax.auth.current_user.resources) || []),
        profileFollowersCount: parseInt((cv_ajax.auth && cv_ajax.auth.current_user && cv_ajax.auth.current_user.followers_count) || 0, 10),
        profileFollowingCount: parseInt((cv_ajax.auth && cv_ajax.auth.current_user && cv_ajax.auth.current_user.following_count) || 0, 10),
        profileFollowers: ((cv_ajax.auth && cv_ajax.auth.current_user && cv_ajax.auth.current_user.followers) || []),
        profileFollowing: ((cv_ajax.auth && cv_ajax.auth.current_user && cv_ajax.auth.current_user.following) || []),
        isSavingProfile: false,
        resTitle: '',
        resFormat: 'pdf',
        resCategory: 'Bible Study',
        contributorName: '',
        contributorRole: '',
        contributorChurch: '',
        contributorMinistry: '',
        selectedFileName: '',
        selectedResourceFile: null,
        selectedThumbnailName: '',
        selectedThumbnailFile: null,
        thumbnailPreviewUrl: '',
        isUploading: false,
        isPublishingPost: false,
        publishProgress: 0,
        publishStatus: '',
        publishTimer: null,
        followLoadingUserId: null,
        bibleStudio: { activeTool: 5, book: 'John', chapter: '1', version: 'KHMER_OLD_1954', version2: 'KJV', verses: [], verses2: [], dictionaryQuery: '', dictionaryResult: null, quotesType: 'General', quotes: [], media: [], typingRef: 'Psalm 23:1-3', typingInput: '', typingStart: 0, typingFinished: false, sermonNotes: { Doctrine: '', Encouragement: '', Application: '' }, stats: { streak: 5, weeks: 17 }, socialText: 'ព្រះអម្ចាស់ ទ្រង់ជាអ្នកគង្វាលខ្ញុំ ខ្ញុំនឹងមិនខ្វះខាតអ្វីឡើយ។\n(The Lord is my shepherd; I shall not want.)', socialRef: 'ទំនុកដំកើង ២៣:១', socialFontSize: 44, socialFont: 'Koh Santepheap', socialBold: true, socialItalic: false, socialUnderline: false, socialStrike: false, socialUppercase: false, socialLineHeight: 128, socialAlign: 'center', socialColor: '#ffffff', socialBg: 0, socialCustomBg: '', socialAiPrompt: '', socialOverlay: 38, loading: false, error: '' },
        modal: { isOpen: false, type: null, data: null }
    };

    // Static data
    const BIBLE_VERSES = [
        { id: 'v1', text: 'For I know the plans I have for you, declares the Lord...', ref: 'Jeremiah 29:11', topics: ['hope', 'peace'] },
        { id: 'v2', text: 'I can do all this through him who gives me strength.', ref: 'Philippians 4:13', topics: ['faith', 'strength'] },
        { id: 'v3', text: 'Trust in the Lord with all your heart and lean not on your own understanding.', ref: 'Proverbs 3:5', topics: ['faith', 'peace'] },
        { id: 'v4', text: 'He heals the brokenhearted and binds up their wounds.', ref: 'Psalm 147:3', topics: ['healing', 'love'] }
    ];

    const CV_POST_EMOJIS = ['🙏', '❤️', '🙌', '😊', '✨', '🕊️', '📖', '⛪', '💙', '👏', '🔥', '🌿'];
    const CV_RESOURCE_DRAFT_KEY = 'faithin_resource_draft_v1';

    // Utility functions
    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function escapeAttr(value) {
        return escapeHtml(value).replace(/`/g, '&#096;');
    }

    function escapeJsString(value) {
        return String(value == null ? '' : value)
            .replace(/\\/g, '\\\\')
            .replace(/'/g, "\\'")
            .replace(/"/g, '\\"')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r');
    }

    function safeImageUrl(value, fallback) {
        const url = String(value || '').trim();
        if (!url) return fallback;
        if (/^data:image\/(?:png|jpeg|gif|webp);base64,[a-z0-9+/=]+$/i.test(url)) return url;
        try {
            const parsed = new URL(url, window.location.origin);
            if (!['https:', 'blob:'].includes(parsed.protocol)) return fallback;
            if (url.charAt(0) === '/' && url.charAt(1) !== '/') {
                return parsed.pathname + parsed.search + parsed.hash;
            }
            return parsed.href;
        } catch (error) {
            return fallback;
        }
    }

    function hasKhmerText(value) {
        return /[\u1780-\u17FF]/.test(String(value || ''));
    }

    function cvNormalizePostVisibility(value) {
        const normalized = String(value || 'public').trim().toLowerCase();
        return normalized === 'private' ? 'private' : 'public';
    }

    function cvPostVisibilityLabel(value) {
        return cvNormalizePostVisibility(value) === 'private' ? 'Private' : 'Public';
    }

    function cvPostVisibilityIcon(value) {
        return cvNormalizePostVisibility(value) === 'private' ? 'lock' : 'globe-2';
    }

    function cvPostVisibilityPill(value) {
        const visibility = cvNormalizePostVisibility(value);
        return `<span class="cv-post-privacy-pill cv-post-privacy-pill--${visibility}"><i data-lucide="${cvPostVisibilityIcon(visibility)}" class="w-3.5 h-3.5"></i><span>${cvPostVisibilityLabel(visibility)}</span></span>`;
    }

    function cvRenderBlessingIcon(className = '') {
        const extraClass = className ? ` ${escapeAttr(className)}` : '';
        return `<svg class="cv-blessing-svg-icon${extraClass}" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4F5766" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M13 20.5S5 15 5 9.5a4.5 4.5 0 0 1 8.5-2.5 4.5 4.5 0 0 1 3.5 7.5"/><path d="M19 3v6"/><path d="M16 6h6"/><path d="M15 15v4" stroke-width="2"/><path d="M13 17h4" stroke-width="2"/><circle cx="3" cy="17" r="1"/><circle cx="8" cy="22" r="1"/></svg>`;
    }


    const CV_BLESSING_COLOR_PALETTE = [
        { key: 'blue', label: 'Blue', a: '#3157D5', b: '#2B2E9E', c: '#0F172A' },
        { key: 'purple', label: 'Purple', a: '#7C3AED', b: '#4338CA', c: '#111827' },
        { key: 'sunrise', label: 'Sunrise', a: '#F97316', b: '#DB2777', c: '#1E1B4B' },
        { key: 'emerald', label: 'Emerald', a: '#059669', b: '#0F766E', c: '#082F49' },
        { key: 'rose', label: 'Rose', a: '#E11D48', b: '#BE185D', c: '#312E81' },
        { key: 'slate', label: 'Slate', a: '#475569', b: '#1E293B', c: '#020617' }
    ];

    const CV_BLESSING_PRESET_MUSIC = [
        { id: 'grace-morning', title: 'Grace Morning', subtitle: 'gentle worship instrumental', file: 'grace-morning.mp3' },
        { id: 'gentle-hallelujah', title: 'Gentle Hallelujah', subtitle: 'soft praise instrumental', file: 'gentle-hallelujah.mp3' },
        { id: 'peaceful-praise', title: 'Peaceful Praise', subtitle: 'calm reflection instrumental', file: 'peaceful-praise.mp3' },
        { id: 'joyful-light', title: 'Joyful Light', subtitle: 'bright thankful instrumental', file: 'joyful-light.mp3' },
        { id: 'hope-rising', title: 'Hope Rising', subtitle: 'uplifting worship instrumental', file: 'hope-rising.mp3' },
        { id: 'still-waters', title: 'Still Waters', subtitle: 'quiet prayer instrumental', file: 'still-waters.mp3' },
        { id: 'faithful-heart', title: 'Faithful Heart', subtitle: 'warm devotional instrumental', file: 'faithful-heart.mp3' },
        { id: 'worship-glow', title: 'Worship Glow', subtitle: 'modern worship instrumental', file: 'worship-glow.mp3' },
        { id: 'mercy-rain', title: 'Mercy Rain', subtitle: 'peaceful mercy instrumental', file: 'mercy-rain.mp3' },
        { id: 'kingdom-dawn', title: 'Kingdom Dawn', subtitle: 'hopeful praise instrumental', file: 'kingdom-dawn.mp3' }
    ];

    function cvBlessingPresetMusicUrl(item) {
        const base = (window.cv_ajax && window.cv_ajax.asset_base_url) ? String(window.cv_ajax.asset_base_url) : '';
        return base + 'assets/audio/blessings/' + String(item.file || '') + '?v=5.5.204';
    }

    function cvGetBlessingPresetMusic(presetId) {
        const id = String(presetId || '').trim().toLowerCase();
        return CV_BLESSING_PRESET_MUSIC.find(item => item.id === id) || null;
    }

    function cvNormalizeBlessingBgColor(value) {
        const key = String(value || '').trim().toLowerCase();
        return CV_BLESSING_COLOR_PALETTE.some(item => item.key === key) ? key : 'blue';
    }

    function cvBlessingBgMeta(value) {
        const key = cvNormalizeBlessingBgColor(value);
        return CV_BLESSING_COLOR_PALETTE.find(item => item.key === key) || CV_BLESSING_COLOR_PALETTE[0];
    }

    function cvBlessingBgStyle(value) {
        const meta = cvBlessingBgMeta(value);
        return `--cv-blessing-bg-a:${meta.a};--cv-blessing-bg-b:${meta.b};--cv-blessing-bg-c:${meta.c};`;
    }

    function cvGetBlessingBgColor(post) {
        const raw = (post && (post.blessing_bg_color || post.blessingBgColor || post.bg_color || post.excerpt)) || state.blessingBgColor || 'blue';
        return cvNormalizeBlessingBgColor(raw);
    }

    function cvNormalizeBlessingMusicName(value) {
        const cleaned = String(value || '').replace(/[\\/]+/g, ' ').trim();
        return cleaned ? cleaned.slice(0, 80) : 'Christian music';
    }

    function cvGetBlessingMusic(post) {
        if (!post) return null;
        const mediaItems = Array.isArray(post.media_items) ? post.media_items : [];
        const item = mediaItems.find(media => {
            if (!media) return false;
            const type = String(media.type || '').toLowerCase();
            const mime = String(media.mime || '').toLowerCase();
            return !!(media.is_blessing_music || type === 'audio' || mime.indexOf('audio/') === 0) && !!(media.local_url || media.url || media.drive_url || media.preview_url);
        });
        if (!item) return null;
        const url = safeImageUrl(item.local_url || item.url || item.drive_url || item.preview_url, '');
        if (!url) return null;
        return {
            url,
            name: cvNormalizeBlessingMusicName(item.name || item.title || 'Christian music'),
            mime: String(item.mime || 'audio/mpeg')
        };
    }

    function cvRenderBlessingMusicInline(post) {
        // Blessing music should stay inside the Blessing story viewer only.
        // Do not render the audio player directly in the public feed card.
        return '';
    }

    window.cvSetBlessingBgColor = (color) => setState({ blessingBgColor: cvNormalizeBlessingBgColor(color) });


    function cvIsMobileViewport() {
        try {
            return !!(window.matchMedia && window.matchMedia('(max-width: 1024px)').matches);
        } catch (e) {
            return (window.innerWidth || document.documentElement.clientWidth || 1200) <= 1024;
        }
    }

    function renderLocalizedText(value) {
        const source = String(value == null ? '' : value);
        if (!source) return '';
        if (!hasKhmerText(source)) return escapeHtml(source);
        return source
            .split(/([\u1780-\u17FF\u19E0-\u19FF\u17D4-\u17DD\s]+)/)
            .map(segment => {
                if (!segment) return '';
                const escaped = escapeHtml(segment);
                return /[\u1780-\u17FF\u19E0-\u19FF]/.test(segment)
                    ? `<span class="cv-khmer-text" lang="km">${escaped}</span>`
                    : escaped;
            })
            .join('');
    }

    function getInitials(name) {
        const source = String(name || '').trim();
        if (!source) return 'U';
        return source.split(/\s+/).slice(0, 2).map(part => part.charAt(0).toUpperCase()).join('') || 'U';
    }

    function renderProfileAvatar(user, sizeClass = 'w-14 h-14', textClass = 'text-base') {
        const displayName = (user && user.name) || 'User';
        const rawAvatar = user && (user.avatar_url || user.avatar || user.profile_image_url || user.profile_image || user.photo_url || user.photoURL || user.picture || '');
        const avatarUrl = safeImageUrl(rawAvatar, '');
        if (avatarUrl) {
            return `<img src="${escapeAttr(avatarUrl)}" class="${sizeClass} rounded-full object-cover border border-white/80 shadow-sm cv-profile-avatar-img" alt="${escapeAttr(displayName)}" />`;
        }
        return `<div class="${sizeClass} rounded-full border shadow-sm cv-profile-avatar-fallback flex items-center justify-center font-extrabold ${textClass}" aria-label="${escapeAttr(displayName)}">${escapeHtml(getInitials(displayName))}</div>`;
    }


    function getVerificationMeta(user) {
        if (!user || typeof user !== 'object') return null;
        const raw = user.verification && typeof user.verification === 'object' ? user.verification : null;
        if (raw && raw.show) {
            const rawType = raw.type === 'blue' ? 'blue' : (raw.type === 'purple' ? 'purple' : 'yellow');
            return {
                show: true,
                type: rawType,
                label: raw.label || (rawType === 'blue' ? 'Founder' : (rawType === 'purple' ? 'First 25' : 'Gmail')),
                title: raw.title || (rawType === 'blue' ? 'Founder account' : (rawType === 'purple' ? 'First 25 member' : 'Verified Gmail account'))
            };
        }
        return null;
    }


    function getVerificationPayload() {
        if (state.verificationStatus && typeof state.verificationStatus === 'object') {
            return state.verificationStatus;
        }
        if (state.currentUser && state.currentUser.verification && typeof state.currentUser.verification === 'object') {
            return state.currentUser.verification;
        }
        return { show: false, type: 'none', label: 'Standard', settings_label: 'Standard', status_label: 'Standard', title: 'Standard account', description: 'This account is active but does not currently display a public verification badge.' };
    }

    function getVerificationSettingsLabel(payload) {
        const v = payload || getVerificationPayload();
        if (v && typeof v === 'object') {
            if (v.settings_label) return String(v.settings_label);
            if (v.status_label) return String(v.status_label);
            if (v.show && v.type === 'blue') return 'Blue tick';
            if (v.show && v.type === 'purple') return 'Purple tick';
            if (v.show && v.type === 'yellow') return 'Yellow tick';
        }
        const meta = getVerificationMeta(state.currentUser || {});
        if (meta && meta.show) {
            if (meta.type === 'blue') return 'Blue tick';
            if (meta.type === 'purple') return 'Purple tick';
            if (meta.type === 'yellow') return 'Yellow tick';
        }
        return 'Standard';
    }

    function syncVerificationStatus(data) {
        if (!data || typeof data !== 'object') return;
        const next = {};
        if (data.verification) {
            next.verificationStatus = data.verification;
            next.currentUser = { ...(state.currentUser || {}), verification: data.verification };
        }
        if (data.request !== undefined) next.verificationRequest = data.request || null;
        if (Array.isArray(data.tiers)) next.verificationTiers = data.tiers;
        setState(next);
    }

    window.openVerificationSettings = () => {
        if (!state.isLoggedIn) {
            openAuthPanel('signin');
            return;
        }
        const initial = {
            verification: getVerificationPayload(),
            request: state.verificationRequest || null,
            tiers: state.verificationTiers || [],
            loading: true
        };
        setState({ modal: { isOpen: true, type: 'verification', data: initial }, verificationLoading: true });
        ajaxRequest('cv_get_verification_status')
            .done(function(response) {
                if (response && response.success) {
                    const data = response.data || {};
                    syncVerificationStatus(data);
                    setState({ modal: { isOpen: true, type: 'verification', data: { ...data, loading: false } }, verificationLoading: false });
                } else {
                    setState({ modal: { isOpen: true, type: 'verification', data: { ...initial, loading: false, error: response && response.data ? response.data : 'Could not load verification status.' } }, verificationLoading: false });
                }
            })
            .fail(function(xhr) {
                const error = (xhr && xhr.responseJSON && xhr.responseJSON.data) ? xhr.responseJSON.data : 'Could not load verification status.';
                setState({ modal: { isOpen: true, type: 'verification', data: { ...initial, loading: false, error } }, verificationLoading: false });
            });
    };

    window.requestAccountVerification = () => {
        if (state.verificationRequesting) return;
        const noteEl = document.getElementById('cv-verification-note');
        const note = noteEl ? noteEl.value : '';
        setState({ verificationRequesting: true });
        ajaxRequest('cv_request_verification', { requested_for: 'manual_review', note })
            .done(function(response) {
                if (response && response.success) {
                    const data = response.data || {};
                    syncVerificationStatus(data);
                    setState({ modal: { isOpen: true, type: 'verification', data: { ...data, loading: false } }, verificationRequesting: false });
                    window.showToast('Verification request sent.', 'success');
                } else {
                    setState({ verificationRequesting: false });
                    window.showToast((response && response.data) ? response.data : 'Could not send request.', 'error');
                }
            })
            .fail(function(xhr) {
                setState({ verificationRequesting: false });
                window.showToast((xhr && xhr.responseJSON && xhr.responseJSON.data) ? xhr.responseJSON.data : 'Could not send request.', 'error');
            });
    };

    function cvSocialCurrentUserId() {
        return parseInt((state.currentUser && state.currentUser.id) || (cv_ajax.auth && cv_ajax.auth.current_user && cv_ajax.auth.current_user.id) || 0, 10);
    }

    function cvSocialIsSelf(user) {
        const currentId = cvSocialCurrentUserId();
        return !!(user && currentId && parseInt(user.id || 0, 10) === currentId) || !!(user && user.is_self);
    }

    function cvSocialFollowButton(user, extraClass = '') {
        if (!user || !user.id || cvSocialIsSelf(user)) return '';
        const userId = parseInt(user.id, 10);
        const loading = parseInt(state.followLoadingUserId || 0, 10) === userId;
        const following = !!user.is_following;
        const label = loading ? 'Saving...' : (following ? 'Following' : 'Follow');
        const icon = loading
            ? '<span class="cv-social-follow-btn__spinner" aria-hidden="true"></span>'
            : (following
                ? '<span class="cv-social-follow-btn__icon" aria-hidden="true"><i data-lucide="check"></i></span>'
                : '<span class="cv-social-follow-btn__icon" aria-hidden="true"><i data-lucide="plus"></i></span>');
        return `<button type="button" onclick="cvToggleFollow(${userId}, ${following ? 'true' : 'false'})" class="cv-social-follow-btn ${following ? 'is-following' : 'is-not-following'} ${extraClass}" style="box-shadow:none!important;filter:none!important;text-shadow:none!important;outline:none!important;background-clip:padding-box!important;-webkit-tap-highlight-color:transparent!important;" ${loading ? 'disabled' : ''} aria-label="${label}">${icon}<span class="cv-social-follow-btn__label">${label}</span></button>`;
    }

    function cvSocialMoreButton(user, extraClass = '') {
        if (!user || !user.id) return '';
        const userId = parseInt(user.id, 10);
        return `<button type="button" onclick="cvShareMemberProfile(${userId}); return false;" class="cv-social-more-btn ${extraClass}" aria-label="Share ${escapeAttr(user.name || 'member')} profile" data-user-id="${userId}"><i data-lucide="share-2" class="w-5 h-5"></i></button>`;
    }

    window.cvShareMemberProfile = function(userId) {
        const url = window.location.origin + '/app#member-' + encodeURIComponent(String(userId || ''));
        if (navigator.share) {
            navigator.share({ title: 'Faith In member profile', url }).catch(function() {});
            return;
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(function() { window.showToast('Profile link copied.', 'success'); });
            return;
        }
        window.showToast('Profile link: ' + url, 'info');
    };

    function cvSocialCompactNumber(value) {
        const n = parseInt(value || 0, 10);
        if (!n || n < 0) return '0';
        if (n >= 1000000) return (Math.round((n / 1000000) * 10) / 10).toString().replace(/\.0$/, '') + 'M';
        if (n >= 1000) return (Math.round((n / 1000) * 10) / 10).toString().replace(/\.0$/, '') + 'K';
        return String(n);
    }

    function cvSocialUserHeadline(user) {
        if (!user) return '';
        const explicit = user.headline || user.bio || user.description;
        if (explicit) return String(explicit);
        const parts = [user.role, user.ministry, user.church, user.location || user.country, user.handle].filter(Boolean);
        return parts.length ? parts.join(' • ') : 'Faith In community member';
    }

    function cvSocialFollowerLabel(user) {
        const counts = (user && user.counts) || {};
        const raw = (user && (user.followers_count != null ? user.followers_count : (counts.followers != null ? counts.followers : user.followers))) || 0;
        const n = parseInt(raw || 0, 10);
        return `${cvSocialCompactNumber(n)} ${n === 1 ? 'follower' : 'followers'}`;
    }

    function cvSocialMutualCount(user) {
        if (!user) return 0;
        return parseInt(user.mutual || user.mutual_count || user.mutual_connections || 0, 10) || 0;
    }

    function cvSyncFollowUser(userId, isFollowing) {
        const targetId = parseInt(userId || 0, 10);
        const sync = list => Array.isArray(list) ? list.map(u => parseInt(u.id || 0, 10) === targetId ? { ...u, is_following: isFollowing } : u) : [];
        state.profileFollowers = sync(state.profileFollowers);
        state.profileFollowing = sync(state.profileFollowing);
        state.suggestedUsers = Array.isArray(state.suggestedUsers)
            ? (isFollowing
                ? state.suggestedUsers.filter(u => parseInt(u.id || 0, 10) !== targetId)
                : sync(state.suggestedUsers))
            : [];
        if (state.modal && state.modal.data && Array.isArray(state.modal.data.items)) {
            state.modal.data.items = sync(state.modal.data.items);
        }
    }

    window.cvToggleFollow = (userId, currentlyFollowing) => {
        if (!state.isLoggedIn && !(cv_ajax.auth && cv_ajax.auth.is_logged_in)) {
            window.showToast('Please sign in to follow users.', 'info');
            setState({ tab: 'profile', showAuthPanel: true, authPanelTitle: 'Sign In' });
            return;
        }
        const currentId = cvSocialCurrentUserId();
        userId = parseInt(userId || 0, 10);
        if (!userId) return;
        if (currentId && currentId === userId) {
            window.showToast('You cannot follow yourself.', 'info');
            return;
        }

        setState({ followLoadingUserId: userId });
        $.post(cv_ajax.ajax_url, {
            action: currentlyFollowing ? 'cv_social_unfollow_user' : 'cv_social_follow_user',
            nonce: cv_ajax.nonce,
            user_id: userId
        }).done(function(response) {
            if (!response || !response.success) {
                const msg = response && response.data && response.data.message ? response.data.message : 'Could not update follow status.';
                window.showToast(msg, 'error');
                return;
            }
            const data = response.data || {};
            cvSyncFollowUser(userId, !!data.is_following);
            if (data.current_user_counts) {
                state.profileFollowersCount = parseInt(data.current_user_counts.followers || state.profileFollowersCount || 0, 10);
                state.profileFollowingCount = parseInt(data.current_user_counts.following || state.profileFollowingCount || 0, 10);
            }
            if (data.followers) state.profileFollowers = data.followers;
            if (data.following) state.profileFollowing = data.following;
            if (state.modal && state.modal.type === 'publicUserProfile' && state.modal.data && parseInt(state.modal.data.id || 0, 10) === userId) {
                state.modal.data = { ...state.modal.data, is_following: !!data.is_following, counts: (data.target_user && data.target_user.counts) ? data.target_user.counts : state.modal.data.counts };
            }
            (state.posts || []).forEach(post => {
                if (post.author && parseInt(post.author.id || 0, 10) === userId) {
                    post.author.is_following = !!data.is_following;
                    if (data.target_user && data.target_user.counts) post.author.counts = data.target_user.counts;
                }
            });
            window.showToast(data.is_following ? 'You are now following this user.' : 'User unfollowed.', 'success');
        }).fail(function(xhr) {
            let msg = 'Could not update follow. Please refresh and try again.';
            if (xhr && xhr.responseJSON && xhr.responseJSON.data && xhr.responseJSON.data.message) msg = xhr.responseJSON.data.message;
            else if (xhr && xhr.responseText) {
                const t = String(xhr.responseText).trim();
                if (t === '-1' || t === '0') msg = 'Security check failed. Please refresh the page and try again.';
            }
            window.showToast(msg, 'error');
        }).always(function() {
            setState({ followLoadingUserId: null });
        });
    };


    window.cvOpenAuthorProfile = (postId) => {
        const post = (state.posts || []).find(p => String(p.id) === String(postId));
        if (!post || !post.author || !post.author.id) {
            window.showToast('User profile is not available yet.', 'info');
            return;
        }
        setState({ modal: { isOpen: true, type: 'publicUserProfile', data: post.author } });
    };

    window.cvOpenUserProfile = (userId) => {
        userId = parseInt(userId || 0, 10);
        if (!userId) return;
        let found = null;
        const scan = (list) => {
            if (!Array.isArray(list)) return;
            list.forEach(item => {
                if (!found && parseInt(item.id || 0, 10) === userId) found = item;
            });
        };
        scan(state.profileFollowers);
        scan(state.profileFollowing);
        scan(state.suggestedUsers);
        scan(state.foundUsers);
        (state.posts || []).forEach(post => {
            if (!found && post.author && parseInt(post.author.id || 0, 10) === userId) found = post.author;
        });
        if (found) {
            setState({ modal: { isOpen: true, type: 'publicUserProfile', data: found } });
            return;
        }
        ajaxRequest('cv_find_users', { search: '', limit: 50 }).done(function(response) {
            const list = response && response.success && response.data && Array.isArray(response.data.items) ? response.data.items : [];
            const user = list.find(u => parseInt(u.id || 0, 10) === userId);
            if (user) setState({ modal: { isOpen: true, type: 'publicUserProfile', data: user } });
            else window.showToast('User profile is not available yet.', 'info');
        });
    };

    window.cvOpenFollowList = (type) => {
        const userId = cvSocialCurrentUserId();
        const title = type === 'following' ? 'Following' : 'Followers';
        setState({ modal: { isOpen: true, type: 'socialFollowList', data: { title, type, items: [], loading: true } } });
        $.post(cv_ajax.ajax_url, {
            action: type === 'following' ? 'cv_social_get_following' : 'cv_social_get_followers',
            nonce: cv_ajax.nonce,
            user_id: userId
        }).done(function(response) {
            if (response && response.success) {
                const data = response.data || {};
                if (type === 'following') {
                    state.profileFollowing = data.items || [];
                    state.profileFollowingCount = parseInt((data.counts && data.counts.following) || 0, 10);
                } else {
                    state.profileFollowers = data.items || [];
                    state.profileFollowersCount = parseInt((data.counts && data.counts.followers) || 0, 10);
                }
                setState({ modal: { isOpen: true, type: 'socialFollowList', data: { title, type, items: data.items || [], loading: false } } });
            } else {
                setState({ modal: { isOpen: true, type: 'socialFollowList', data: { title, type, items: [], loading: false, error: 'Could not load users.' } } });
            }
        }).fail(function() {
            setState({ modal: { isOpen: true, type: 'socialFollowList', data: { title, type, items: [], loading: false, error: 'Network error.' } } });
        });
    };

    function renderVerificationBadge(user, variant = 'pill') {
        const meta = getVerificationMeta(user);
        if (!meta || !meta.show) return '';
        const isBlue = meta.type === 'blue';
        const isPurple = meta.type === 'purple';
        const colors = isBlue
            ? { shell: 'bg-blue-600 text-white shadow-blue-200/70', ring: 'ring-blue-100', shadow: '0 8px 18px rgba(37,99,235,.22)' }
            : (isPurple
                ? { shell: 'bg-purple-600 text-white shadow-purple-200/70', ring: 'ring-purple-100', shadow: '0 8px 18px rgba(124,58,237,.28)' }
                : { shell: 'bg-amber-400 text-slate-900 shadow-amber-200/70', ring: 'ring-amber-100', shadow: '0 8px 18px rgba(251,191,36,.28)' });
        const isSmall = variant === 'compact' || variant === 'inline' || variant === 'name';
        const iconSize = variant === 'inline' ? 'w-3 h-3' : (isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4');
        const icon = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="${iconSize}" aria-hidden="true"><path d="M9 12.75l2 2 4-4.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 3l2.2 1.1 2.45-.35 1.1 2.2 2.2 1.1-.35 2.45L21 12l-1.1 2.2.35 2.45-2.2 1.1-1.1 2.2-2.45-.35L12 21l-2.2-1.1-2.45.35-1.1-2.2-2.2-1.1.35-2.45L3 12l1.1-2.2-.35-2.45 2.2-1.1 1.1-2.2 2.45.35L12 3z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;
        if (variant === 'inline') {
            return `<span class="cv-verified-inline inline-flex items-center justify-center w-[18px] h-[18px] rounded-full ${colors.shell} ring-2 ring-white/90 shrink-0" style="box-shadow:${colors.shadow};" title="${escapeAttr(meta.title)}" aria-label="${escapeAttr(meta.title)}">${icon}</span>`;
        }
        if (variant === 'compact') {
            return `<span class="inline-flex items-center justify-center w-4 h-4 rounded-full ${colors.shell} shrink-0" title="${escapeAttr(meta.title)}" aria-label="${escapeAttr(meta.title)}">${icon}</span>`;
        }
        if (variant === 'name') {
            return `<span class="inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1 font-extrabold ring-1 ${colors.shell} ${colors.ring}" style="font-size:13px;line-height:1;min-height:28px;transform:translateY(1px);box-shadow:${colors.shadow};" title="${escapeAttr(meta.title)}" aria-label="${escapeAttr(meta.title)}">${icon}<span>${escapeHtml(meta.label)}</span></span>`;
        }
        return `<span class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold ring-1 ${colors.shell} ${colors.ring}" title="${escapeAttr(meta.title)}" aria-label="${escapeAttr(meta.title)}">${icon}<span>${escapeHtml(meta.label)}</span></span>`;
    }

    function setState(newState) {
        state = { ...state, ...newState };
        render();
    }

    window.setState = setState;

    function captureCvFocusedField(root) {
        const active = document.activeElement;
        if (!root || !active || !root.contains(active)) return null;
        if (!/^(INPUT|TEXTAREA|SELECT)$/i.test(active.tagName)) return null;
        if ((active.type || '').toLowerCase() === 'file') return null;
        const fields = Array.prototype.slice.call(root.querySelectorAll('input:not([type="file"]), textarea, select'));
        let selectionStart = null;
        let selectionEnd = null;
        try {
            selectionStart = typeof active.selectionStart === 'number' ? active.selectionStart : null;
            selectionEnd = typeof active.selectionEnd === 'number' ? active.selectionEnd : null;
        } catch (error) {}
        return {
            id: active.id || '',
            name: active.getAttribute('name') || '',
            placeholder: active.getAttribute('placeholder') || '',
            tag: active.tagName,
            type: active.getAttribute('type') || '',
            index: fields.indexOf(active),
            selectionStart,
            selectionEnd
        };
    }

    function restoreCvFocusedField(root, focusInfo) {
        if (!root || !focusInfo) return;
        let field = null;
        if (focusInfo.id) {
            field = root.querySelector('#' + (window.CSS && CSS.escape ? CSS.escape(focusInfo.id) : focusInfo.id.replace(/([ #;?%&,.+*~\\':"!^$[\]()=>|/@])/g, '\\$1')));
        }
        if (!field && focusInfo.name) {
            const escapedName = (window.CSS && CSS.escape) ? CSS.escape(focusInfo.name) : focusInfo.name.replace(/"/g, '\\"');
            field = root.querySelector('[name="' + escapedName + '"]');
        }
        if (!field && focusInfo.index >= 0) {
            const fields = root.querySelectorAll('input:not([type="file"]), textarea, select');
            field = fields[focusInfo.index] || null;
        }
        if (!field || field.disabled || field.readOnly) return;
        try {
            field.focus({ preventScroll: true });
        } catch (error) {
            try { field.focus(); } catch (innerError) {}
        }
        if (typeof field.setSelectionRange === 'function' && focusInfo.selectionStart !== null && focusInfo.selectionEnd !== null) {
            try {
                const max = String(field.value || '').length;
                const start = Math.min(focusInfo.selectionStart, max);
                const end = Math.min(focusInfo.selectionEnd, max);
                field.setSelectionRange(start, end);
            } catch (error) {}
        }
    }

    window.showToast = (message, type = 'info') => {
        const container = document.getElementById('cv-toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        const normalizedType = ['success', 'info', 'error'].includes(type) ? type : 'info';
        const iconMap = {
            success: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>',
            info: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>',
            error: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="m15 9-6 6"></path><path d="m9 9 6 6"></path></svg>'
        };

        toast.className = `cv-toast-pill cv-toast-pill--${normalizedType} toast-animate`;
        toast.setAttribute('role', normalizedType === 'error' ? 'alert' : 'status');
        toast.setAttribute('aria-live', normalizedType === 'error' ? 'assertive' : 'polite');
        toast.innerHTML = `${iconMap[normalizedType]}<span>${escapeHtml(String(message || ''))}</span>`;

        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('is-hiding');
            setTimeout(() => toast.remove(), 260);
        }, 3000);
    };


function showPublishNotification(title, message, type = 'success') {
    const text = message || title || 'Publishing finished.';
    if (window.showToast) window.showToast(text, type);
    try {
        if (state.settings && state.settings.notifications && 'Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification(title || 'Faith In', { body: text });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(function(permission) {
                    if (permission === 'granted') new Notification(title || 'Faith In', { body: text });
                });
            }
        }
    } catch (e) {}
}

function startServerFinishProgress(status) {
    if (state.publishTimer) clearInterval(state.publishTimer);
    const currentStart = Math.max(76, parseInt(state.publishProgress || 0, 10));
    setState({ publishProgress: currentStart, publishStatus: status || 'Processing your upload. Please keep this page open...' });
    const timer = setInterval(function() {
        const current = parseInt(state.publishProgress || 0, 10);
        if (current >= 96) return;
        setState({ publishProgress: current + 1 });
    }, 1200);
    state.publishTimer = timer;
}



function startPublishProgress(status) {
    if (state.publishTimer) {
        clearInterval(state.publishTimer);
    }
    state.publishTimer = null;
    setState({ publishProgress: 6, publishStatus: status || 'Preparing publish...' });
    const timer = setInterval(function() {
        const current = parseInt(state.publishProgress || 0, 10);
        if (current >= 72) return;
        const step = current < 28 ? 4 : (current < 52 ? 3 : 1);
        setState({ publishProgress: Math.min(72, current + step) });
    }, 900);
    state.publishTimer = timer;
}

function updatePublishProgress(percent, status) {
    const incoming = Math.max(0, Math.min(100, Math.round(percent || 0)));
    const current = Math.max(0, Math.min(100, parseInt(state.publishProgress || 0, 10)));
    const next = Math.max(current, incoming);
    const patch = { publishProgress: next };
    if (status && status !== state.publishStatus) patch.publishStatus = status;
    if (next !== current || patch.publishStatus) setState(patch);
}

function finishPublishProgress(status, callback) {
    if (state.publishTimer) clearInterval(state.publishTimer);
    state.publishTimer = null;
    setState({ publishProgress: 100, publishStatus: status || 'Published successfully.' });
    setTimeout(function() {
        setState({ isUploading: false, isPublishingPost: false, publishProgress: 0, publishStatus: '' });
        if (typeof callback === 'function') callback();
    }, 1200);
}

function failPublishProgress(status) {
    if (state.publishTimer) clearInterval(state.publishTimer);
    state.publishTimer = null;
    setState({ isUploading: false, isPublishingPost: false, publishProgress: 0, publishStatus: '' });
    if (status) window.showToast(status, 'error');
}


function authRequired() {
    return state.authMode && state.authMode !== 'open';
}

function cvIsSignedOut() {
    return !state.isLoggedIn;
}


function renderUnifiedAuthCard() {
    const errors = state.authErrors || {};
    const loading = !!state.authLoading;
    const isSignup = cvAuthMode() === 'signup';
    const firstNameValue = escapeAttr(state.authFirstName || '');
    const lastNameValue = escapeAttr(state.authLastName || '');
    const nameValue = escapeAttr(state.authName || '');
    const emailValue = escapeAttr(state.authEmail || '');
    const passwordValue = escapeAttr(state.authPassword || '');
    const submitText = loading ? (isSignup ? 'Creating account...' : 'Signing in...') : (isSignup ? 'Sign Up' : 'Log in');
    const passwordAutocomplete = isSignup ? 'new-password' : 'current-password';
    const buttonDisabled = loading ? 'disabled' : '';
    const signupNameError = errors.name ? `<p id="cv-auth-name-error" class="cv-auth-dream__error">${escapeHtml(errors.name)}</p>` : '';
    return `
        <div class="cv-auth-dream" data-auth-mode="${isSignup ? 'signup' : 'signin'}">
            <section class="cv-auth-dream__left" aria-label="Faith In welcome">
                <div class="cv-auth-dream__hero">
                    <h1>Explore <br />the community <br /><span>you belong to.</span></h1>
                    <p>Prepare bilingual Bible notes. Share posts, blessings and prayer with a community that shares your faith.</p>
                </div>
                <div class="cv-auth-dream__collage" aria-hidden="true">
                    <div class="cv-auth-dream__card cv-auth-dream__card--orange">
                        <div class="cv-auth-dream__tiny-icon">
                            <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="10" r="1.5" fill="currentColor"/><path d="M5 18l4.5-4.5 3 3 2.5-2.5L19 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        </div>
                        <div class="cv-auth-dream__orange-art">
                            <svg viewBox="0 0 24 24"><path d="M12 21s-7-4.4-9.3-8.3C.7 9.2 2.6 5 6.5 5c2.1 0 3.5 1.2 4.2 2.2C11.5 6.2 12.9 5 15 5c3.9 0 5.8 4.2 3.8 7.7C16.5 16.6 12 21 12 21z" fill="currentColor"/></svg>
                        </div>
                    </div>
                    <div class="cv-auth-dream__card cv-auth-dream__card--profile">
                        <div class="cv-auth-dream__profile-top">
                            <div class="cv-auth-dream__star"><svg viewBox="0 0 24 24"><path d="M12 2l2.9 6 6.6.9-4.8 4.7 1.1 6.6L12 17.1l-5.8 3.1 1.1-6.6-4.8-4.7 6.6-.9L12 2z" fill="currentColor"/></svg></div>
                            <div class="cv-auth-dream__avatar"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=FaithIn&backgroundColor=c0aede" alt="Faith In avatar" /></div>
                        </div>
                        <div class="cv-auth-dream__profile-body">
                            <div class="cv-auth-dream__line cv-auth-dream__line--wide"></div>
                            <div class="cv-auth-dream__line cv-auth-dream__line--short"></div>
                            <div class="cv-auth-dream__profile-actions">
                                <span><svg viewBox="0 0 24 24"><path d="M12 21s-7-4.4-9.3-8.3C.7 9.2 2.6 5 6.5 5c2.1 0 3.5 1.2 4.2 2.2C11.5 6.2 12.9 5 15 5c3.9 0 5.8 4.2 3.8 7.7C16.5 16.6 12 21 12 21z" fill="none" stroke="currentColor" stroke-width="2"/></svg></span>
                                <span class="is-purple"><svg viewBox="0 0 24 24"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.8 8.8 0 0 1-3.8-.9L3 21l1.8-4.7A8.3 8.3 0 1 1 21 11.5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg></span>
                            </div>
                        </div>
                    </div>
                    <div class="cv-auth-dream__emoji">🤩</div>
                    <div class="cv-auth-dream__heart"><svg viewBox="0 0 24 24"><path d="M12 21s-7-4.4-9.3-8.3C.7 9.2 2.6 5 6.5 5c2.1 0 3.5 1.2 4.2 2.2C11.5 6.2 12.9 5 15 5c3.9 0 5.8 4.2 3.8 7.7C16.5 16.6 12 21 12 21z" fill="currentColor"/></svg></div>
                    <div class="cv-auth-dream__pill"><svg viewBox="0 0 24 24"><path d="M12 2l1.7 5.2L19 9l-5.3 1.8L12 16l-1.7-5.2L5 9l5.3-1.8L12 2z" fill="currentColor"/></svg><span>16:45</span></div>
                </div>
                <p class="cv-auth-dream__copyright">
                    <a href="/">Home</a> · <a href="/about">About</a> · <a href="/bible-study">Bible Study</a> · <a href="/for-churches">For Churches</a> · <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> · <a href="/contact">Contact</a>
                    <br />© ${new Date().getFullYear()} Faith In Inc.
                </p>
            </section>
            <section class="cv-auth-dream__right" aria-label="Faith In ${isSignup ? 'sign up' : 'login'} form">
                <div class="cv-auth-dream__panel">
                    ${isSignup ? `
                        <div class="cv-auth-dream__form-block cv-auth-dream__animate">
                            <div class="cv-auth-dream__heading">
                                <h2>Sign Up</h2>
                                <p>It's quick and easy.</p>
                            </div>
                            <form class="cv-auth-dream__form" onsubmit="return loginWithEmailPassword(event)" novalidate>
                                <div class="cv-auth-dream__row">
                                    <div class="cv-auth-dream__half cv-auth-dream__field">
                                        <label for="cv-auth-first-name" class="cv-auth-dream__field-label">First name</label>
                                        <input id="cv-auth-first-name" type="text" value="${firstNameValue}" placeholder="Your first name" autocomplete="given-name" required aria-required="true" oninput="cvUpdateSignupName('first', this.value)" aria-invalid="${errors.name ? 'true' : 'false'}" aria-describedby="${errors.name ? 'cv-auth-name-error' : ''}" />
                                    </div>
                                    <div class="cv-auth-dream__half cv-auth-dream__field">
                                        <label for="cv-auth-last-name" class="cv-auth-dream__field-label">Last name</label>
                                        <input id="cv-auth-last-name" type="text" value="${lastNameValue}" placeholder="Your last name" autocomplete="family-name" required aria-required="true" oninput="cvUpdateSignupName('last', this.value)" aria-invalid="${errors.name ? 'true' : 'false'}" aria-describedby="${errors.name ? 'cv-auth-name-error' : ''}" />
                                    </div>
                                </div>
                                ${signupNameError}
                                <label for="cv-auth-name" class="screen-reader-text">Full name</label>
                                <input id="cv-auth-name" type="hidden" value="${nameValue}" autocomplete="name" oninput="cvUpdateAuthField('authName', this.value)" />
                                <div class="cv-auth-dream__field">
                                    <label for="cv-auth-email" class="cv-auth-dream__field-label">Email address</label>
                                    <input id="cv-auth-email" type="email" inputmode="email" value="${emailValue}" placeholder="you@example.com" autocomplete="username email" required aria-required="true" oninput="cvUpdateAuthField('authEmail', this.value)" aria-invalid="${errors.email ? 'true' : 'false'}" aria-describedby="${errors.email ? 'cv-auth-email-error' : ''}" />
                                    ${errors.email ? `<p id="cv-auth-email-error" class="cv-auth-dream__error">${escapeHtml(errors.email)}</p>` : ''}
                                </div>
                                <div class="cv-auth-dream__field">
                                    <label for="cv-auth-password" class="cv-auth-dream__field-label">Create a password</label>
                                    <input id="cv-auth-password" type="password" value="${passwordValue}" placeholder="At least 8 characters" autocomplete="${passwordAutocomplete}" required aria-required="true" oninput="cvUpdateAuthField('authPassword', this.value)" aria-invalid="${errors.password ? 'true' : 'false'}" aria-describedby="${errors.password ? 'cv-auth-password-error' : ''}" />
                                    ${errors.password ? `<p id="cv-auth-password-error" class="cv-auth-dream__error">${escapeHtml(errors.password)}</p>` : ''}
                                </div>
                                <p class="cv-auth-dream__terms">By clicking Sign Up, you agree to our <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>. You may receive notifications from us and can opt out at any time.</p>
                                <button type="submit" class="cv-auth-dream__submit cv-auth-dream__submit--square" ${buttonDisabled}>${submitText}</button>
                            </form>
                            <div class="cv-auth-dream__switch-center cv-auth-dream__switch-center--signup-only">
                                <a href="#" role="button" class="cv-auth-dream__text-link" onclick="return cvSwitchAuthMode('signin', event)">Already have an account?</a>
                            </div>
                        </div>
                    ` : `
                        <div class="cv-auth-dream__form-block cv-auth-dream__animate">
                            <h2 class="cv-auth-dream__login-title">Welcome back</h2>
                            <p class="cv-auth-dream__login-subtitle">Log in to continue to your Faith In community.</p>
                            <form class="cv-auth-dream__form" onsubmit="return loginWithEmailPassword(event)" novalidate>
                                <div class="cv-auth-dream__field">
                                    <label for="cv-auth-email" class="cv-auth-dream__field-label">Email address</label>
                                    <input id="cv-auth-email" type="email" inputmode="email" value="${emailValue}" placeholder="you@example.com" autocomplete="username email" required aria-required="true" oninput="cvUpdateAuthField('authEmail', this.value)" aria-invalid="${errors.email ? 'true' : 'false'}" aria-describedby="${errors.email ? 'cv-auth-email-error' : ''}" />
                                    ${errors.email ? `<p id="cv-auth-email-error" class="cv-auth-dream__error">${escapeHtml(errors.email)}</p>` : ''}
                                </div>
                                <div class="cv-auth-dream__field">
                                    <label for="cv-auth-password" class="cv-auth-dream__field-label">Password</label>
                                    <input id="cv-auth-password" type="password" value="${passwordValue}" placeholder="Enter your password" autocomplete="${passwordAutocomplete}" required aria-required="true" oninput="cvUpdateAuthField('authPassword', this.value)" aria-invalid="${errors.password ? 'true' : 'false'}" aria-describedby="${errors.password ? 'cv-auth-password-error' : ''}" />
                                    ${errors.password ? `<p id="cv-auth-password-error" class="cv-auth-dream__error">${escapeHtml(errors.password)}</p>` : ''}
                                </div>
                                <button type="submit" class="cv-auth-dream__submit" ${buttonDisabled}>${submitText}</button>
                            </form>
                            <div class="cv-auth-dream__forgot"><a href="#" role="button" class="cv-auth-dream__text-link" onclick="return sendFirebasePasswordReset(event)">Forgotten password?</a></div>
                            <div class="cv-auth-dream__divider"><span>Or sign in with</span></div>
                            <div id="cv-google-signin" class="cv-google-signin cv-auth-dream__google cv-auth-dream__google--login"></div>
                            ${cvGithubEnabled() ? `<button type="button" class="cv-faith-google-btn cv-faith-github-btn" onclick="return startFirebaseGithubSignIn(event)" ${buttonDisabled}><span class="cv-faith-google-btn__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .8a11.4 11.4 0 0 0-3.6 22.2c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6a4.7 4.7 0 0 1 1.2-3.2c-.1-.3-.5-1.6.1-3.2 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0C17 4.3 18 4.6 18 4.6c.6 1.6.2 2.9.1 3.2a4.7 4.7 0 0 1 1.2 3.2c0 4.7-2.8 5.7-5.5 6 .4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6A11.4 11.4 0 0 0 12 .8Z"/></svg></span><span>${loading ? 'Opening GitHub...' : 'Continue with GitHub'}</span></button>` : ''}
                            <div class="cv-auth-dream__rule"></div>
                            <button type="button" onclick="return cvOpenRegisterLink(event)" class="cv-auth-dream__create">Create new account</button>
                        </div>
                    `}
                </div>
            </section>
        </div>
    `;
}
function renderMembersOnlyGate() {
    const isDark = state.settings.theme === 'dark';
    return `
        <section class="cv-members-gate cv-members-gate--auth-focused ${isDark ? 'is-dark' : ''}" aria-label="Members only access">
            ${renderUnifiedAuthCard()}
        </section>
    `;
}

function renderSessionLoading() {
    return `
        <section class="cv-session-loading" role="status" aria-live="polite" aria-labelledby="cv-session-loading-title">
            <div class="cv-session-loading__card">
                <div class="cv-session-loading__mark">FaithIn</div>
                <div class="cv-session-loading__spinner" aria-hidden="true"></div>
                <h1 id="cv-session-loading-title">Opening your community</h1>
                <p>Restoring your secure session and preparing your feed…</p>
            </div>
        </section>
    `;
}

// v5.5.151: safety cleanup for cached/older markup. Google/Gmail sign-up is disabled,
// but Google remains available on the Log In screen.
function cvRemoveSignupGoogleUi() {
    const signupRoots = document.querySelectorAll('.cv-auth-dream[data-auth-mode="signup"]');
    signupRoots.forEach(function(root) {
        root.querySelectorAll('.cv-google-signin, .cv-auth-dream__google, .cv-auth-dream__divider, .cv-faith-google-btn').forEach(function(el) {
            el.style.setProperty('display', 'none', 'important');
            el.setAttribute('hidden', 'hidden');
            el.setAttribute('aria-hidden', 'true');
        });
    });
}

function syncAuthUserIntoForms(user) {
    if (!user) return;
    const mergedUser = { ...(state.currentUser || {}), ...user };
    const next = {
        currentUser: mergedUser,
        isLoggedIn: true,
        profileName: mergedUser.name || '',
        profileGender: mergedUser.gender || '',
        profileRole: mergedUser.role || '',
        profileLocation: mergedUser.location || '',
        profileIndustry: mergedUser.industry || '',
        profileChurch: mergedUser.church || '',
        profileMinistry: mergedUser.ministry || '',
        profileBio: mergedUser.bio || '',
        profileCoverPreviewUrl: '',
        selectedProfileCoverName: '',
        selectedProfileCoverFile: null,
        profileArticles: Array.isArray(mergedUser.articles) ? mergedUser.articles : (state.profileArticles || []),
        profileResources: Array.isArray(mergedUser.resources) ? mergedUser.resources : (state.profileResources || []),
        profileFollowersCount: parseInt(mergedUser.followers_count != null ? mergedUser.followers_count : state.profileFollowersCount || 0, 10),
        profileFollowingCount: parseInt(mergedUser.following_count != null ? mergedUser.following_count : state.profileFollowingCount || 0, 10),
        profileFollowers: Array.isArray(mergedUser.followers) ? mergedUser.followers : (state.profileFollowers || []),
        profileFollowing: Array.isArray(mergedUser.following) ? mergedUser.following : (state.profileFollowing || []),
        verificationStatus: mergedUser.verification || state.verificationStatus || null,
        showAuthPanel: false
    };
    if (!state.postAuthorName) next.postAuthorName = mergedUser.name || '';
    if (!state.contributorName) next.contributorName = mergedUser.name || '';
    if (!state.postAuthorRole) next.postAuthorRole = mergedUser.role || '';
    if (!state.contributorRole) next.contributorRole = mergedUser.role || '';
    if (!state.postAuthorChurch) next.postAuthorChurch = mergedUser.church || '';
    if (!state.contributorChurch) next.contributorChurch = mergedUser.church || '';
    if (!state.postAuthorMinistry) next.postAuthorMinistry = mergedUser.ministry || '';
    if (!state.contributorMinistry) next.contributorMinistry = mergedUser.ministry || '';
    setState(next);
}

function cvGoogleClientId() {
    return (typeof cv_ajax !== 'undefined' && cv_ajax.auth && cv_ajax.auth.google_client_id) ? String(cv_ajax.auth.google_client_id) : '';
}

function cvGithubEnabled() {
    return !!(typeof cv_ajax !== 'undefined' && cv_ajax.auth && cv_ajax.auth.github_enabled === true);
}

let cvGoogleIdentityReady = false;
let cvGoogleIdentityScriptPromise = null;

function cvGoogleIdentityAvailable() {
    return !!(window.google && window.google.accounts && window.google.accounts.id);
}

function cvLoadGoogleIdentityScript() {
    if (cvGoogleIdentityAvailable()) return Promise.resolve(true);
    if (cvGoogleIdentityScriptPromise) return cvGoogleIdentityScriptPromise;
    cvGoogleIdentityScriptPromise = new Promise(function(resolve, reject) {
        const existing = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
        const finishIfReady = function() {
            if (cvGoogleIdentityAvailable()) resolve(true);
            else reject(new Error('Google Identity script loaded but did not initialize.'));
        };
        if (existing) {
            existing.addEventListener('load', finishIfReady, { once: true });
            existing.addEventListener('error', function() { reject(new Error('Google Identity script could not load.')); }, { once: true });
            window.setTimeout(function() {
                if (cvGoogleIdentityAvailable()) resolve(true);
            }, 250);
            window.setTimeout(function() {
                if (!cvGoogleIdentityAvailable()) reject(new Error('Google Identity is still loading.'));
            }, 8000);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = finishIfReady;
        script.onerror = function() { reject(new Error('Google Identity script could not load.')); };
        (document.head || document.body || document.documentElement).appendChild(script);
    }).catch(function(error) {
        cvGoogleIdentityScriptPromise = null;
        throw error;
    });
    return cvGoogleIdentityScriptPromise;
}

function cvInitializeGoogleIdentity() {
    if (cvGoogleIdentityReady) return true;
    const clientId = cvGoogleClientId();
    if (!clientId || !cvGoogleIdentityAvailable()) return false;
    window.google.accounts.id.initialize({
        client_id: clientId,
        callback: window.handleGoogleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        use_fedcm_for_prompt: false,
        itp_support: true
    });
    cvGoogleIdentityReady = true;
    return true;
}

function cvGoogleLoadingHtml(message) {
    const text = message || 'Loading Google...';
    return '<button type="button" class="cv-faith-google-btn cv-faith-google-btn--loading" disabled><span class="cv-faith-google-btn__icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg></span><span>' + escapeHtml(text) + '</span></button>';
}

function cvFirebaseGoogleButtonHtml() {
    const disabled = state.authLoading ? ' disabled' : '';
    const label = state.authLoading ? 'Opening Google...' : 'Google';
    return '<button type="button" class="cv-faith-google-btn" onclick="startFirebaseGoogleSignIn(event)"' + disabled + '><span class="cv-faith-google-btn__icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg></span><span>' + label + '</span></button>';
}

function cvRenderNativeGoogleButton(target) {
    if (!target || !window.google || !window.google.accounts || !window.google.accounts.id) return false;
    const width = Math.max(260, Math.min(520, Math.floor(target.getBoundingClientRect().width || target.offsetWidth || 360)));
    target.innerHTML = '<div class="cv-google-native-wrap" aria-label="Continue with Google"></div>';
    const holder = target.querySelector('.cv-google-native-wrap');
    if (!holder) return false;
    try {
        window.google.accounts.id.renderButton(holder, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'pill',
            logo_alignment: 'center',
            width: width
        });
        target.setAttribute('data-google-rendered', 'native');
        return true;
    } catch (error) {
        console.warn('Faith In Google native button render failed', error);
        target.removeAttribute('data-google-rendered');
        const origin = (typeof cv_ajax !== 'undefined' && cv_ajax.auth && cv_ajax.auth.site_origin) ? String(cv_ajax.auth.site_origin) : window.location.origin;
        target.innerHTML = '<div class="cv-google-oauth-setup rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">Google login is not configured for this website origin. Add <code>' + escapeHtml(origin) + '</code> to Authorized JavaScript origins in Google Cloud, then save the matching Client ID in Settings &gt; Faith In.</div>';
        return false;
    }
}

let cvGoogleRenderRetryTimer = null;
let cvGoogleRenderRetryCount = 0;

function cvScheduleGoogleRenderRetry() {
    if (cvGoogleRenderRetryTimer || cvGoogleRenderRetryCount >= 12) return;
    cvGoogleRenderRetryCount += 1;
    cvGoogleRenderRetryTimer = setTimeout(function() {
        cvGoogleRenderRetryTimer = null;
        renderGoogleButtonIfNeeded();
    }, cvGoogleRenderRetryCount <= 3 ? 500 : 1000);
}

function renderGoogleButtonIfNeeded() {
    if (state.isLoggedIn) return;
    const target = document.getElementById('cv-google-signin');
    if (!target) return;
    // v5.5.153: Google/Gmail is a Sign In option only. Never render it on Sign Up.
    if (cvAuthMode() === 'signup') {
        target.innerHTML = '';
        target.setAttribute('hidden', 'hidden');
        target.style.setProperty('display', 'none', 'important');
        return;
    }
    target.removeAttribute('hidden');
    target.style.removeProperty('display');
    const googleDivider = target.parentElement ? target.parentElement.querySelector('.cv-auth-dream__divider') : null;
    if (googleDivider) {
        googleDivider.removeAttribute('hidden');
        googleDivider.style.removeProperty('display');
    }
    const clientId = cvGoogleClientId();
    if (!clientId) {
        // No Google Identity Services client ID is configured — but one is not
        // needed. Firebase Authentication's GoogleAuthProvider runs the whole
        // OAuth flow itself using the OAuth client Firebase creates when Google
        // is enabled as a sign-in provider. So render our own button wired to
        // startFirebaseGoogleSignIn() rather than hiding the option.
        //
        // Requirement: in the Firebase console, enable Authentication →
        // Sign-in method → Google, and add faithin.co under Authorized domains.
        target.innerHTML = cvFirebaseGoogleButtonHtml();
        return;
    }

    // A GIS client ID is configured, so use the official Google Identity
    // Services button instead. Do not use the
    // old google.accounts.id.prompt() fallback because it hangs on mobile and
    // leaves the button at "Opening Google...".
    if (cvInitializeGoogleIdentity() && cvRenderNativeGoogleButton(target)) {
        cvGoogleRenderRetryCount = 0;
        return;
    }

    target.innerHTML = cvGoogleLoadingHtml('Loading Google...');
    cvLoadGoogleIdentityScript()
        .then(function() {
            if (cvInitializeGoogleIdentity() && cvRenderNativeGoogleButton(target)) {
                cvGoogleRenderRetryCount = 0;
                return;
            }
            target.innerHTML = '<div class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">Google login could not load. Please refresh the page and try again.</div>';
        })
        .catch(function() {
            target.innerHTML = '<div class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">Google login could not load. Please check your connection and refresh.</div>';
        });
    cvScheduleGoogleRenderRetry();
}

const CV_FIREBASE_SDK_VERSION = '10.14.1';
let cvFirebaseAuthBundlePromise = null;
let cvFirebaseAppCheck = null;

function cvFirebaseConfig() {
    return (typeof cv_ajax !== 'undefined' && cv_ajax.auth && cv_ajax.auth.firebase_config) ? cv_ajax.auth.firebase_config : {};
}

function cvHasFirebaseConfig() {
    const config = cvFirebaseConfig();
    return !!(config && config.apiKey && config.authDomain && config.projectId && config.appId);
}

function cvUsesFirebaseBackend() {
    return !!(typeof cv_ajax !== 'undefined' && cv_ajax.auth && cv_ajax.auth.backend_mode === 'firebase');
}

function cvFirebaseMissingMessage() {
    return 'Firebase signup/login is not configured yet. Add your Firebase Web App config in Settings > Faith In.';
}

function cvAuthMode() {
    const title = String(state.authPanelTitle || '').toLowerCase();
    return title.indexOf('sign up') !== -1 || title.indexOf('register') !== -1 ? 'signup' : 'signin';
}

function cvGetFirebaseAuthBundle() {
    if (!cvHasFirebaseConfig()) {
        return Promise.reject(new Error(cvFirebaseMissingMessage()));
    }
    if (!cvFirebaseAuthBundlePromise) {
        const appCheckSiteKey = (typeof cv_ajax !== 'undefined' && cv_ajax.auth && cv_ajax.auth.app_check_site_key)
            ? String(cv_ajax.auth.app_check_site_key).trim()
            : '';
        const moduleRequests = [
            import(`https://www.gstatic.com/firebasejs/${CV_FIREBASE_SDK_VERSION}/firebase-app.js`),
            import(`https://www.gstatic.com/firebasejs/${CV_FIREBASE_SDK_VERSION}/firebase-auth.js`),
            import(`https://www.gstatic.com/firebasejs/${CV_FIREBASE_SDK_VERSION}/firebase-firestore.js`)
        ];
        if (appCheckSiteKey) {
            moduleRequests.push(import(`https://www.gstatic.com/firebasejs/${CV_FIREBASE_SDK_VERSION}/firebase-app-check.js`));
        }
        cvFirebaseAuthBundlePromise = Promise.all(moduleRequests).then(function(modules) {
            const appModule = modules[0];
            const authModule = modules[1];
            const firestoreModule = modules[2];
            const appCheckModule = modules[3] || null;
            const appName = 'faith-in-auth';
            const existingApp = appModule.getApps().find(function(app) { return app.name === appName; });
            const app = existingApp || appModule.initializeApp(cvFirebaseConfig(), appName);
            if (appCheckModule && appCheckSiteKey && !cvFirebaseAppCheck) {
                cvFirebaseAppCheck = appCheckModule.initializeAppCheck(app, {
                    provider: new appCheckModule.ReCaptchaEnterpriseProvider(appCheckSiteKey),
                    isTokenAutoRefreshEnabled: true
                });
            }
            const auth = authModule.getAuth(app);
            const db = firestoreModule.getFirestore(app);
            return { app, auth, db, authModule, firestoreModule };
        });
    }
    return cvFirebaseAuthBundlePromise;
}

function cvValidateAuthForm() {
    const email = String(state.authEmail || '').trim();
    const password = String(state.authPassword || '');
    const name = String(state.authName || '').trim();
    const errors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (cvAuthMode() === 'signup' && !name) errors.name = 'Please enter your name.';
    if (!email) errors.email = 'Please enter your email address.';
    else if (!emailPattern.test(email)) errors.email = 'Please enter a valid email address, like user@example.com.';
    if (!password) errors.password = 'Please enter your password.';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters.';
    setState({ authErrors: errors });
    return Object.keys(errors).length === 0;
}

function cvCurrentSiteDomain() {
    const fromWp = (typeof cv_ajax !== 'undefined' && cv_ajax.auth && cv_ajax.auth.site_domain) ? String(cv_ajax.auth.site_domain) : '';
    return fromWp || window.location.hostname || 'your website domain';
}

function cvFirebaseErrorMessage(error) {
    const code = error && error.code ? String(error.code) : '';
    switch (code) {
        case 'auth/user-not-found':
        case 'auth/invalid-credential':
            return 'No account was found for those credentials.';
        case 'auth/wrong-password':
            return 'That password is incorrect.';
        case 'auth/email-already-in-use':
            return 'An account already exists for this email. Please log in instead.';
        case 'auth/account-exists-with-different-credential':
            return 'An account already uses this email. Sign in with the method you originally used, then connect GitHub from your account.';
        case 'auth/weak-password':
            return 'Please choose a stronger password with at least 6 characters.';
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/too-many-requests':
            return 'Too many login attempts. Please try again later or reset your password.';
        case 'auth/popup-closed-by-user':
            return 'Google sign-in was closed before it finished.';
        case 'auth/popup-blocked':
            return 'Your browser blocked the Google popup. Please allow popups and try again.';
        case 'auth/network-request-failed':
            return 'Network error. Please check your connection and try again.';
        case 'auth/unauthorized-domain':
            return 'Social sign-in is not available on this site yet. Please use email and password or contact support.';
        case 'auth/configuration-not-found':
        case 'auth/operation-not-allowed':
            return 'That sign-in method is not available yet. Please use email and password.';
        case 'permission-denied':
        case 'firestore/permission-denied':
            return 'We could not finish setting up your profile. Please try again or contact support.';
        default:
            return 'Login could not be completed. Please try again.';
    }
}

function cvCreateOrUpdateFirestoreUser(bundle, user, options) {
    options = options || {};
    if (!bundle || !bundle.db || !bundle.firestoreModule || !user || !user.uid) {
        return Promise.resolve(null);
    }
    const firestore = bundle.firestoreModule;
    const timestamp = firestore.serverTimestamp();
    const providerData = Array.isArray(user.providerData) ? user.providerData : [];
    const providers = providerData.map(function(item) { return item && item.providerId ? item.providerId : ''; }).filter(Boolean);
    const displayName = String(options.displayName || user.displayName || state.authName || '').trim();
    const email = String(user.email || state.authEmail || '').trim();
    const docData = {
        uid: user.uid,
        email: email,
        emailLower: email.toLowerCase(),
        displayName: displayName || email.split('@')[0] || 'Faith In User',
        firstName: String(options.firstName || '').trim(),
        lastName: String(options.lastName || '').trim(),
        photoURL: user.photoURL || '',
        provider: options.provider || (providers[0] || 'password'),
        providers: providers.length ? providers : [options.provider || 'password'],
        appUserId: email ? Math.abs(cvStringHash(email)) : 0,
        siteOrigin: (typeof cv_ajax !== 'undefined' && cv_ajax.auth && cv_ajax.auth.site_origin) ? cv_ajax.auth.site_origin : window.location.origin,
        updatedAt: timestamp,
        lastLoginAt: timestamp
    };
    if (options.isNew) {
        docData.createdAt = timestamp;
        docData.status = 'active';
    }
    const publicData = {
        uid: user.uid,
        displayName: docData.displayName,
        photoURL: docData.photoURL,
        appUserId: docData.appUserId,
        updatedAt: timestamp
    };
    if (options.isNew) publicData.createdAt = timestamp;

    // Account data (including email and settings) stays private in /users.
    // The member directory reads the deliberately email-free projection.
    return firestore.setDoc(firestore.doc(bundle.db, 'users', user.uid), docData, { merge: true })
        .then(function() {
            return firestore.setDoc(
                firestore.doc(bundle.db, 'publicProfiles', user.uid),
                publicData,
                { merge: true }
            ).catch(function() {
                // The app is deployed before the additive Firestore rules in
                // the safe rollout. Account sign-in must keep working during
                // that short compatibility window.
                console.warn('[Faith In] Public profile sync is pending the database rules update.');
                return null;
            });
        });
}

function cvStringHash(value) {
    let hash = 0;
    const input = String(value || '').toLowerCase();
    for (let i = 0; i < input.length; i++) {
        hash = ((hash << 5) - hash) + input.charCodeAt(i);
        hash |= 0;
    }
    return hash;
}

function cvFirebaseUserProfile(user, provider) {
    const email = String((user && user.email) || state.authEmail || '').trim();
    const name = String((user && user.displayName) || state.authName || (email ? email.split('@')[0] : '') || 'Faith In Member').trim();
    const avatar = (user && user.photoURL) || '';
    return {
        id: email ? Math.abs(cvStringHash(email)) : 0,
        uid: (user && user.uid) || '',
        logged_in: true,
        name: name,
        displayName: name,
        email: email,
        avatar_url: avatar,
        avatar: avatar,
        provider: provider || 'firebase'
    };
}

function cvFirebaseServerLogin(user, provider) {
    if (!user || typeof user.getIdToken !== 'function') {
        return Promise.reject(new Error('Firebase did not return a signed-in user.'));
    }
    if (cvUsesFirebaseBackend()) {
        return Promise.resolve(cvFirebaseUserProfile(user, provider));
    }
    return user.getIdToken(true).then(function(idToken) {
        return new Promise(function(resolve, reject) {
            ajaxRequest('cv_firebase_sign_in', { id_token: idToken, provider: provider || 'firebase' })
                .done(function(response) {
                    if (response && response.success) resolve(response.data || {});
                    else reject(new Error((response && response.data) || 'Could not start your Faith In session.'));
                })
                .fail(function(xhr) {
                    reject(new Error((xhr.responseJSON && xhr.responseJSON.data) ? xhr.responseJSON.data : 'Could not start your Faith In session.'));
                });
        });
    });
}

function cvNormalizeAuthProfile(profile, fallback) {
    const source = (profile && typeof profile === 'object') ? profile : {};
    const fb = (fallback && typeof fallback === 'object') ? fallback : {};
    const email = String(source.email || fb.email || state.authEmail || '').trim();
    const emailName = email ? email.split('@')[0] : '';
    const name = String(source.name || source.displayName || source.display_name || fb.name || state.authName || emailName || 'Faith In Member').trim();
    const avatar = source.avatar_url || source.avatar || source.photo_url || source.photoURL || source.picture || fb.avatar_url || fb.photoURL || '';
    return {
        ...source,
        logged_in: true,
        name: name,
        displayName: source.displayName || source.display_name || name,
        email: email,
        avatar_url: avatar,
        avatar: avatar,
        role: source.role || source.ministry || source.church || source.bio || '',
        settings: source.settings || state.settings || { theme: 'light', lang: 'English', notifications: true }
    };
}

function cvCompleteAuth(profile, options) {
    const normalized = cvNormalizeAuthProfile(profile, options || {});
    if (typeof cv_ajax !== 'undefined') {
        cv_ajax.auth = cv_ajax.auth || {};
        cv_ajax.auth.is_logged_in = true;
        cv_ajax.auth.current_user = normalized;
    }

    syncAuthUserIntoForms(normalized);
    setState({
        tab: 'home',
        selectedResource: null,
        showAuthPanel: false,
        authRestoring: false,
        authLoading: false,
        authErrors: {}
    });

    if (cvUsesFirebaseBackend()) {
        window.setTimeout(function() {
            loadPosts();
            loadResources();
        }, 0);
        return;
    }

    // Load signed-in content immediately after the browser accepts the session cookie.
    window.setTimeout(function() {
        ajaxRequest('cv_get_session')
            .done(function(response) {
                if (response && response.success && response.data && response.data.logged_in) {
                    const sessionProfile = cvNormalizeAuthProfile(response.data, normalized);
                    if (typeof cv_ajax !== 'undefined') {
                        cv_ajax.auth = cv_ajax.auth || {};
                        cv_ajax.auth.is_logged_in = true;
                        cv_ajax.auth.current_user = sessionProfile;
                    }
                    syncAuthUserIntoForms(sessionProfile);
                }
            })
            .always(function() {
                loadPosts();
                loadResources();
            });
    }, 120);
}

function cvRestoreFirebaseSession() {
    if (!cvUsesFirebaseBackend() || !cvHasFirebaseConfig()) return;
    cvGetFirebaseAuthBundle()
        .then(function(bundle) {
            bundle.authModule.onAuthStateChanged(bundle.auth, function(user) {
                if (!user) {
                    if (!state.authLoading && state.isLoggedIn) cvClearLocalAuthState();
                    else setState({ authRestoring: false });
                    return;
                }
                // Active signup/login flows finish their own state transition.
                if (state.authLoading) return;
                cvCreateOrUpdateFirestoreUser(bundle, user, { provider: 'firebase', isNew: false })
                    .catch(function(error) {
                        console.warn('Faith In Firestore session sync failed', error);
                    })
                    .then(function() {
                        cvCompleteAuth(cvFirebaseUserProfile(user, 'firebase'));
                    });
            });
        })
        .catch(function(error) {
            console.warn('Faith In Firebase session restore failed', error);
            setState({ authRestoring: false });
        });
}

function cvRemoveAuthError(key) {
    const id = key === 'name' ? 'cv-auth-name-error' : (key === 'email' ? 'cv-auth-email-error' : (key === 'password' ? 'cv-auth-password-error' : ''));
    if (!id) return;
    const error = document.getElementById(id);
    if (error && error.parentNode) error.parentNode.removeChild(error);
    const fieldIds = key === 'name' ? ['cv-auth-first-name', 'cv-auth-last-name'] : (key === 'email' ? ['cv-auth-email'] : ['cv-auth-password']);
    fieldIds.forEach(function(fieldId) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.setAttribute('aria-invalid', 'false');
            field.removeAttribute('aria-describedby');
        }
    });
}

window.cvUpdateAuthField = (field, value) => {
    // Keep typing local. Re-rendering the whole app on every keystroke can blur
    // mobile/WordPress input fields, making the boxes feel like they cannot type.
    state = { ...state, [field]: value };
    if (state.authErrors && Object.keys(state.authErrors).length) {
        const nextErrors = { ...state.authErrors };
        if (field === 'authName') {
            delete nextErrors.name;
            cvRemoveAuthError('name');
        }
        if (field === 'authEmail') {
            delete nextErrors.email;
            cvRemoveAuthError('email');
        }
        if (field === 'authPassword') {
            delete nextErrors.password;
            cvRemoveAuthError('password');
        }
        state = { ...state, authErrors: nextErrors };
    }
};

window.cvUpdateSignupName = (part, value) => {
    // Do not call setState/render while the user is typing in signup fields.
    const first = part === 'first' ? String(value || '') : String(state.authFirstName || '');
    const last = part === 'last' ? String(value || '') : String(state.authLastName || '');
    const nextName = [first.trim(), last.trim()].filter(Boolean).join(' ');
    state = {
        ...state,
        authFirstName: first,
        authLastName: last,
        authName: nextName
    };
    const hiddenName = document.getElementById('cv-auth-name');
    if (hiddenName) hiddenName.value = nextName;
    if (state.authErrors && Object.keys(state.authErrors).length) {
        const nextErrors = { ...state.authErrors };
        delete nextErrors.name;
        state = { ...state, authErrors: nextErrors };
        cvRemoveAuthError('name');
    }
};

window.startFirebaseGoogleSignIn = (event) => {
    if (event && event.preventDefault) event.preventDefault();
    if (cvAuthMode() === 'signup' || document.querySelector('.cv-auth-dream[data-auth-mode="signup"]')) {
        cvRemoveSignupGoogleUi();
        window.showToast('Google is available on Log In only. Please create your account with email and password.', 'info');
        return false;
    }
    if (state.authLoading) return false;
    setState({ authLoading: true, authErrors: {} });
    cvGetFirebaseAuthBundle()
        .then(function(bundle) {
            const provider = new bundle.authModule.GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });
            return bundle.authModule.signInWithPopup(bundle.auth, provider)
                .then(function(result) { return { bundle: bundle, result: result }; });
        })
        .then(function(payload) {
            return cvCreateOrUpdateFirestoreUser(payload.bundle, payload.result.user, {
                provider: 'google',
                isNew: payload.bundle.authModule.getAdditionalUserInfo ? !!(payload.bundle.authModule.getAdditionalUserInfo(payload.result) || {}).isNewUser : false
            }).catch(function(error) {
                console.warn('Faith In Firestore user sync failed', error);
            }).then(function() {
                return cvFirebaseServerLogin(payload.result.user, 'google');
            });
        })
        .then(function(profile) {
            cvCompleteAuth(profile || {}, { name: profile && profile.name ? profile.name : '', avatar_url: profile && profile.avatar_url ? profile.avatar_url : '' });
            window.showToast('Signed in with Google.', 'success');
        })
        .catch(function(error) {
            const code = (error && error.code) ? String(error.code) : '';

            // The member closed the popup, or a second popup superseded the
            // first. Neither is an error worth showing them.
            if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
                return;
            }

            // Popups are blocked (common on in-app browsers and iOS). Fall back
            // to the full-page redirect flow, which cvRestoreFirebaseSession()
            // picks up via onAuthStateChanged when the browser comes back.
            if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
                window.showToast('Opening Google sign-in...', 'info');
                cvGetFirebaseAuthBundle()
                    .then(function(bundle) {
                        const provider = new bundle.authModule.GoogleAuthProvider();
                        provider.setCustomParameters({ prompt: 'select_account' });
                        return bundle.authModule.signInWithRedirect(bundle.auth, provider);
                    })
                    .catch(function(redirectError) {
                        window.showToast(cvFirebaseErrorMessage(redirectError), 'error');
                    });
                return;
            }

            window.showToast(cvFirebaseErrorMessage(error), 'error');
        })
        .finally(function() {
            setState({ authLoading: false });
        });
    return false;
};

window.startFirebaseGithubSignIn = (event) => {
    if (event && event.preventDefault) event.preventDefault();
    if (!cvGithubEnabled() || state.authLoading) return false;
    setState({ authLoading: true, authErrors: {} });
    cvGetFirebaseAuthBundle()
        .then(function(bundle) {
            const provider = new bundle.authModule.GithubAuthProvider();
            provider.addScope('read:user');
            provider.addScope('user:email');
            return bundle.authModule.signInWithPopup(bundle.auth, provider)
                .then(function(result) { return { bundle: bundle, result: result }; });
        })
        .then(function(payload) {
            const info = payload.bundle.authModule.getAdditionalUserInfo
                ? payload.bundle.authModule.getAdditionalUserInfo(payload.result)
                : null;
            return cvCreateOrUpdateFirestoreUser(payload.bundle, payload.result.user, {
                provider: 'github',
                isNew: !!(info && info.isNewUser)
            }).then(function() {
                return cvFirebaseServerLogin(payload.result.user, 'github');
            });
        })
        .then(function(profile) {
            cvCompleteAuth(profile || {});
            window.showToast('Signed in with GitHub.', 'success');
        })
        .catch(function(error) {
            const code = error && error.code ? String(error.code) : '';
            if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return;
            if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
                return cvGetFirebaseAuthBundle().then(function(bundle) {
                    const provider = new bundle.authModule.GithubAuthProvider();
                    provider.addScope('read:user');
                    provider.addScope('user:email');
                    return bundle.authModule.signInWithRedirect(bundle.auth, provider);
                });
            }
            window.showToast(cvFirebaseErrorMessage(error), 'error');
        })
        .finally(function() {
            setState({ authLoading: false });
        });
    return false;
};

window.startGoogleApiSignIn = (event) => {
    if (event && event.preventDefault) event.preventDefault();
    if (cvAuthMode() === 'signup' || document.querySelector('.cv-auth-dream[data-auth-mode="signup"]')) {
        cvRemoveSignupGoogleUi();
        window.showToast('Google is available on Log In only. Please create your account with email and password.', 'info');
        return false;
    }
    if (state.authLoading) return false;
    const target = document.getElementById('cv-google-signin');
    if (target) target.innerHTML = cvGoogleLoadingHtml('Loading Google...');
    cvLoadGoogleIdentityScript()
        .then(function() {
            if (cvInitializeGoogleIdentity() && target && cvRenderNativeGoogleButton(target)) {
                window.showToast('Tap the Google button to continue.', 'info');
                return;
            }
            window.showToast('Google login could not load. Please refresh and try again.', 'error');
            renderGoogleButtonIfNeeded();
        })
        .catch(function() {
            window.showToast('Google login could not load. Please check your connection and refresh.', 'error');
            renderGoogleButtonIfNeeded();
        });
    return false;
};

window.loginWithEmailPassword = (event) => {
    if (event && event.preventDefault) event.preventDefault();
    if (state.authLoading) return false;
    if (cvAuthMode() === 'signup') {
        return window.createFirebaseAccount(event);
    }
    if (!cvValidateAuthForm()) return false;
    const email = String(state.authEmail || '').trim();
    const password = String(state.authPassword || '');
    setState({ authLoading: true });
    cvGetFirebaseAuthBundle()
        .then(function(bundle) {
            return bundle.authModule.signInWithEmailAndPassword(bundle.auth, email, password)
                .then(function(result) { return { bundle: bundle, result: result }; });
        })
        .then(function(payload) {
            return cvCreateOrUpdateFirestoreUser(payload.bundle, payload.result.user, { provider: 'password', isNew: false })
                .catch(function(error) { console.warn('Faith In Firestore user sync failed', error); })
                .then(function() { return cvFirebaseServerLogin(payload.result.user, 'password'); });
        })
        .then(function(profile) {
            cvCompleteAuth(profile || {}, { email: email });
            window.showToast('Logged in successfully.', 'success');
        })
        .catch(function(error) {
            window.showToast(cvFirebaseErrorMessage(error), 'error');
        })
        .finally(function() {
            setState({ authLoading: false });
        });
    return false;
};

window.createFirebaseAccount = (event) => {
    if (event && event.preventDefault) event.preventDefault();
    if (state.authLoading) return false;
    if (!cvValidateAuthForm()) return false;
    const name = String(state.authName || '').trim();
    const email = String(state.authEmail || '').trim();
    const password = String(state.authPassword || '');
    setState({ authLoading: true });
    cvGetFirebaseAuthBundle()
        .then(function(bundle) {
            return bundle.authModule.createUserWithEmailAndPassword(bundle.auth, email, password)
                .then(function(result) {
                    const profilePromise = name && bundle.authModule.updateProfile
                        ? bundle.authModule.updateProfile(result.user, { displayName: name })
                        : Promise.resolve();
                    return profilePromise.then(function() { return { bundle: bundle, result: result }; });
                });
        })
        .then(function(payload) {
            return cvCreateOrUpdateFirestoreUser(payload.bundle, payload.result.user, {
                displayName: name,
                firstName: String(state.authFirstName || '').trim(),
                lastName: String(state.authLastName || '').trim(),
                provider: 'password',
                isNew: true
            }).then(function() { return payload; });
        })
        .then(function(payload) {
            return cvFirebaseServerLogin(payload.result.user, 'password');
        })
        .then(function(profile) {
            cvCompleteAuth({ ...(profile || {}), name: (profile && profile.name) || name, email: (profile && profile.email) || email }, { name: name, email: email });
            window.showToast('Account created and saved to Firestore.', 'success');
        })
        .catch(function(error) {
            window.showToast(cvFirebaseErrorMessage(error), 'error');
        })
        .finally(function() {
            setState({ authLoading: false });
        });
    return false;
};

window.sendFirebasePasswordReset = (event) => {
    if (event && event.preventDefault) event.preventDefault();
    const email = String(state.authEmail || '').trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailPattern.test(email)) {
        setState({ authErrors: { ...(state.authErrors || {}), email: 'Enter a valid email address first.' } });
        return false;
    }
    cvGetFirebaseAuthBundle()
        .then(function(bundle) {
            return bundle.authModule.sendPasswordResetEmail(bundle.auth, email);
        })
        .then(function() {
            window.showToast('Password reset email sent.', 'success');
        })
        .catch(function(error) {
            window.showToast(cvFirebaseErrorMessage(error), 'error');
        });
    return false;
};

window.cvSwitchAuthMode = (mode, event) => {
    if (event && event.preventDefault) event.preventDefault();
    setState({
        authPanelTitle: mode === 'signup' ? 'Sign Up' : 'Log In',
        authErrors: {},
        authPasswordVisible: false
    });
    return false;
};

window.cvOpenRegisterLink = (event) => {
    return window.cvSwitchAuthMode('signup', event);
};


    function updateTheme() {
        if (state.settings.theme === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }

    // AJAX functions
    function ajaxRequest(action, data = {}) {
        const payload = { ...(data || {}) };
        const timeout = parseInt(payload._timeout || 0, 10) || 0;
        if (Object.prototype.hasOwnProperty.call(payload, '_timeout')) {
            delete payload._timeout;
        }
        const options = {
            url: cv_ajax.ajax_url,
            type: 'POST',
            data: {
                action: action,
                nonce: cv_ajax.nonce,
                ...payload
            }
        };
        if (timeout > 0) {
            options.timeout = timeout;
        }
        return $.ajax(options);
    }


    function faithInRestUrl(path) {
        const root = (typeof cv_ajax !== 'undefined' && cv_ajax.rest_faithin_root)
            ? String(cv_ajax.rest_faithin_root)
            : (window.location.origin.replace(/\/+$/, '') + '/wp-json/faithin/v1');
        return root.replace(/\/+$/, '') + '/' + String(path || '').replace(/^\/+/, '');
    }

    function normalizeDailyBibleVerse(data) {
        if (!data || typeof data !== 'object') return null;
        const khmer = String(data.khmer || data.text || '').trim();
        const english = String(data.english || '').trim();
        const ref = String(data.ref || data.reference || data.passage || 'Verse of the Day').trim();
        const khmerRef = String(data.khmerRef || data.khmer_reference || ref).trim();
        if (!khmer) return null;
        return {
            text: english || khmer,
            khmer: khmer,
            ref: ref,
            khmerRef: khmerRef,
            passage: data.passage || '',
            source: data.source || 'faithin',
            versionName: data.version_name || data.versionName || ''
        };
    }

    function loadDailyBibleVerse(rerender = true) {
        if (state.dailyBibleVerseLoading || state.dailyBibleVerse) {
            return Promise.resolve(state.dailyBibleVerse || null);
        }
        state.dailyBibleVerseLoading = true;
        const url = faithInRestUrl('bible/daily?bible_id=1270');
        return fetch(url, {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json',
                'X-WP-Nonce': (cv_ajax && cv_ajax.rest_nonce) ? cv_ajax.rest_nonce : ''
            }
        })
            .then(function(res) {
                return res.json().catch(function() { return {}; }).then(function(data) {
                    return { ok: res.ok, data: data };
                });
            })
            .then(function(payload) {
                const verse = payload.ok ? normalizeDailyBibleVerse(payload.data) : null;
                if (verse) {
                    if (rerender) setState({ dailyBibleVerse: verse, dailyBibleVerseLoading: false, dailyBibleVerseError: '' });
                    else {
                        state.dailyBibleVerse = verse;
                        state.dailyBibleVerseLoading = false;
                        state.dailyBibleVerseError = '';
                        render();
                    }
                    return verse;
                }
                state.dailyBibleVerseLoading = false;
                state.dailyBibleVerseError = 'Daily Bible Verse could not load.';
                return null;
            })
            .catch(function() {
                state.dailyBibleVerseLoading = false;
                state.dailyBibleVerseError = 'Daily Bible Verse request failed.';
                return null;
            });
    }

    window.loadDailyBibleVerse = loadDailyBibleVerse;

    function loadSuggestedUsers(limit = 16) {
        setState({ suggestedUsersLoading: true });
        return ajaxRequest('cv_get_suggested_users', { limit: limit })
            .done(function(response) {
                if (response && response.success && response.data && Array.isArray(response.data.items)) {
                    const items = response.data.items.map(function(user) {
                        const registeredAt = user && (user.registered_at || user.registered) ? new Date(user.registered_at || user.registered) : null;
                        const ageDays = registeredAt && !Number.isNaN(registeredAt.getTime()) ? Math.floor((Date.now() - registeredAt.getTime()) / 86400000) : 9999;
                        return {
                            ...user,
                            is_new_user: ageDays <= 30
                        };
                    });
                    setState({ suggestedUsers: items, suggestedUsersLoading: false });
                } else {
                    setState({ suggestedUsersLoading: false });
                }
            })
            .fail(function() {
                setState({ suggestedUsersLoading: false });
                // Keep the feed usable if suggestions fail; post authors/comments remain as fallback suggestions.
            });
    }


    let cvFindUsersTimer = null;

    function loadFoundUsers(search = state.userSearch, limit = 24) {
        const term = String(search || '').trim();
        setState({ usersLoading: true, usersHasSearched: true, userSearch: term });
        return ajaxRequest('cv_find_users', { search: term, limit: limit })
            .done(function(response) {
                if (response && response.success && response.data && Array.isArray(response.data.items)) {
                    setState({ foundUsers: response.data.items, usersLoading: false });
                } else {
                    setState({ foundUsers: [], usersLoading: false });
                }
            })
            .fail(function() {
                setState({ foundUsers: [], usersLoading: false });
                window.showToast('Could not find users. Please try again.', 'error');
            });
    }

    window.handleUserSearch = (value) => {
        const userSearch = String(value || '');
        state.userSearch = userSearch;
        state.usersHasSearched = true;
        if (cvFindUsersTimer) window.clearTimeout(cvFindUsersTimer);
        cvFindUsersTimer = window.setTimeout(function() {
            loadFoundUsers(userSearch, 24);
        }, 280);
    };

    window.searchUsersNow = () => loadFoundUsers(state.userSearch, 24);

    window.cvHideNetworkUser = (userId) => {
        const id = parseInt(userId || 0, 10);
        if (!id) return;
        const hidden = Array.isArray(state.hiddenNetworkUserIds) ? state.hiddenNetworkUserIds.slice() : [];
        if (!hidden.includes(id)) hidden.push(id);
        setState({ hiddenNetworkUserIds: hidden });
    };


    let cvResourcesRequestSeq = 0;

    function loadResources() {
        const requestedSearch = state.exploreSearch;
        const requestedCategory = state.exploreCat;
        const requestedSort = state.exploreSort;
        const requestSeq = ++cvResourcesRequestSeq;
        setState({ resourcesLoading: true, resourcesError: '' });

        const isCurrentRequest = function() {
            return requestSeq === cvResourcesRequestSeq
                && String(state.exploreSearch || '') === String(requestedSearch || '')
                && String(state.exploreCat || 'All') === String(requestedCategory || 'All');
        };

        const applyBooksInBackground = function(localItems) {
            const currentItems = Array.isArray(localItems) ? localItems : [];
            if (currentItems.some(cvIsGutendexResource)) {
                return;
            }

            cvFetchGutendexResourcesClient(requestedSearch, requestedCategory, 24)
                .then(function(apiBooks) {
                    if (!isCurrentRequest()) return;
                    const merged = cvMergeResourcesWithBooks(state.resources && state.resources.length ? state.resources : currentItems, apiBooks);
                    setState({ resources: merged, resourcesLoading: false, resourcesError: '' });
                })
                .catch(function() {
                    if (!isCurrentRequest()) return;
                    const current = Array.isArray(state.resources) ? state.resources : [];
                    if (!current.length) {
                        setState({ resources: cvBuildGutendexStarterBooks(requestedCategory, requestedSearch), resourcesLoading: false, resourcesError: '' });
                    } else {
                        setState({ resources: current, resourcesLoading: false, resourcesError: '' });
                    }
                });
        };

        return ajaxRequest('cv_get_resources', {
            search: requestedSearch,
            category: requestedCategory,
            sort: requestedSort,
            limit: 120,
            include_api: '0',
            _timeout: 6000
        }).done(function(response) {
            if (!isCurrentRequest()) return;
            if (response && response.success) {
                const payload = response.data;
                const items = Array.isArray(payload) ? payload : (payload && Array.isArray(payload.items) ? payload.items : []);
                const localItems = cvMergeResourcesWithBooks(items, []);
                setState({ resources: localItems, resourcesLoading: false, resourcesError: '' });
                applyBooksInBackground(localItems);
            } else {
                setState({ resources: [], resourcesLoading: false, resourcesError: '' });
                applyBooksInBackground([]);
            }
        }).fail(function() {
            if (!isCurrentRequest()) return;
            setState({ resources: [], resourcesLoading: false, resourcesError: '' });
            applyBooksInBackground([]);
        });
    }

    window.loadResources = loadResources;
    window.loadPosts = loadPosts;
    function loadBookmarks() {
        if (!state.isLoggedIn) return;
        ajaxRequest('cv_get_bookmarks').done(function(response) {
            if (!response || !response.success) return;
            const payload = response.data || {};
            const items = Array.isArray(payload) ? payload : (Array.isArray(payload.items) ? payload.items : []);
            setState({ bookmarks: items.map(item => String(item.object_id || item.id || '')).filter(Boolean) });
        });
    }
    window.loadBookmarks = loadBookmarks;

    function loadPosts() {
        setState({ feedLoading: true, feedError: '' });
        loadBookmarks();
        return ajaxRequest('cv_get_posts')
            .done(function(response) {
                if (response && response.success) {
                    const payload = response.data;
                    const items = Array.isArray(payload) ? payload : (payload && Array.isArray(payload.items) ? payload.items : []);
                    setState({ posts: items, feedLoading: false, feedError: '' });
                    loadSuggestedUsers();
                } else {
                    setState({ posts: Array.isArray(state.posts) ? state.posts : [], feedLoading: false, feedError: (response && response.data) ? String(response.data) : 'Could not load Social Feed.' });
                }
            })
            .fail(function(xhr) {
                const message = (xhr && xhr.responseJSON && xhr.responseJSON.data) ? xhr.responseJSON.data : 'Could not load Social Feed. Please refresh and try again.';
                setState({ posts: Array.isArray(state.posts) ? state.posts : [], feedLoading: false, feedError: String(message) });
            });
    }

    function loadPrayers() {
        ajaxRequest('cv_get_prayers').done(function(response) {
            if (response.success) {
                setState({ prayers: response.data });
            }
        });
    }

    function loadJobs() {
        ajaxRequest('cv_get_jobs').done(function(response) {
            if (response.success) {
                const payload = response.data;
                const items = Array.isArray(payload) ? payload : (payload && Array.isArray(payload.items) ? payload.items : []);
                setState({ jobs: items });
            } else {
                setState({ jobs: Array.isArray(state.jobs) ? state.jobs : [] });
                window.showToast((response && response.data) ? String(response.data) : 'Could not load jobs.', 'error');
            }
        }).fail(function(xhr) {
            setState({ jobs: Array.isArray(state.jobs) ? state.jobs : [] });
            window.showToast((xhr && xhr.responseJSON && xhr.responseJSON.data) ? xhr.responseJSON.data : 'Could not load jobs.', 'error');
        });
    }

    // Action handlers
    window.setTab = (tab) => {
        const allowedTabs = ['explore', 'home', 'prayer', 'jobs', 'users', 'bible', 'profile', 'create', 'menu'];
        const targetTab = allowedTabs.includes(tab) ? tab : 'home';
        if (targetTab === 'profile' && cvIsSignedOut()) {
            openAuthPanel('signin');
            return;
        }
        const nextState = { tab: targetTab, selectedResource: null, showNotifs: false };
        if (targetTab !== 'profile') nextState.showAuthPanel = targetTab === 'create' ? state.showAuthPanel : false;
        if (targetTab === 'profile') {
            nextState.showAuthPanel = false;
            nextState.profileSubTab = state.profileSubTab || 'account';
        }
        if (targetTab === 'home') {
            nextState.feedError = '';
            nextState.savedPostsOnly = false;
        }
        setState(nextState);
        try {
            const nextHash = targetTab === 'home' ? '#home' : '#' + targetTab;
            if (window.history && window.location.hash !== nextHash) window.history.replaceState(null, '', nextHash);
        } catch (error) {}
        if (targetTab === 'explore') loadResources();
        if (targetTab === 'home') loadPosts();
        if (targetTab === 'prayer') loadPrayers();
        if (targetTab === 'jobs') loadJobs();
        if (targetTab === 'users' && !state.usersHasSearched) loadFoundUsers('', 24);
        if (targetTab === 'bible') loadBibleStudioInitial();
        if (targetTab === 'menu') {
            if (!Array.isArray(state.resources) || !state.resources.length) loadResources();
            if (!Array.isArray(state.prayers) || !state.prayers.length) loadPrayers();
            if (!Array.isArray(state.jobs) || !state.jobs.length) loadJobs();
        }
    };

    window.openProfile = () => {
        if (cvIsSignedOut()) {
            openAuthPanel('signin');
            return false;
        }
        setState({
            tab: 'profile',
            selectedResource: null,
            showNotifs: false,
            showAuthPanel: false,
            profileSubTab: state.profileSubTab || 'account'
        });
        try {
            const appRoot = document.getElementById('cv-root');
            if (appRoot && appRoot.scrollIntoView) appRoot.scrollIntoView({ block: 'start', behavior: 'smooth' });
            if (window.history && window.location.hash !== '#profile') window.history.replaceState(null, '', '#profile');
        } catch (e) {}
        return false;
    };

    window.goBack = () => state.selectedResource ? setState({ selectedResource: null }) : setState({ tab: 'home' });
    window.toggleNotifs = () => setState({ showNotifs: !state.showNotifs });
    window.setFeedFilter = (feedFilter) => setState({ feedFilter });
    window.setExploreCat = (exploreCat) => { setState({ exploreCat }); window.clearTimeout(window.cvExploreReloadTimer); window.cvExploreReloadTimer = window.setTimeout(loadResources, 150); };
    window.setExploreSort = () => setState({ exploreSort: state.exploreSort === 'Popular' ? 'Newest' : 'Popular' });
    window.handleExploreSearch = (val) => { setState({ exploreSearch: val }); window.clearTimeout(window.cvExploreReloadTimer); window.cvExploreReloadTimer = window.setTimeout(loadResources, 250); };
    window.selectResource = (id) => {
        const resource = (state.resources || []).find(r => String(r.id) === String(id));
        if (!resource) return;
        setState({ selectedResource: resource });
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
    };
    window.setProfileSubTab = (val) => setState({ profileSubTab: val });
    window.loadMoreSuggestedUsers = () => {
        const current = Math.max(4, parseInt(state.suggestedVisibleCount || 4, 10));
        const total = Array.isArray(state.suggestedUsers) ? state.suggestedUsers.length : 0;
        if (current < total) {
            setState({ suggestedVisibleCount: Math.min(current + 4, total) });
            return;
        }
        const nextLimit = Math.min(Math.max(total + 8, 16), 32);
        loadSuggestedUsers(nextLimit).always(function() {
            setState({ suggestedVisibleCount: Math.min(current + 4, Math.max(nextLimit, current + 4)) });
        });
    };

    window.refreshSuggestedUsers = () => {
        loadSuggestedUsers(Math.max(16, parseInt((state.suggestedUsers || []).length || 16, 10)));
    };


window.openAuthPanel = (mode) => {
    setState({
        tab: 'profile',
        createMode: 'post',
        showAuthPanel: true,
        authPanelTitle: mode === 'signup' ? 'Sign Up' : 'Log In',
        authPasswordVisible: false,
        authErrors: {},
        selectedResource: null,
        showNotifs: false
    });
};

window.updateAuthField = (field, value) => {
    window.cvUpdateAuthField(field, value);
};

window.toggleAuthPassword = () => {
    setState({ authPasswordVisible: !state.authPasswordVisible });
};

window.submitAuthCard = (event) => window.loginWithEmailPassword(event);


    function openDeleteConfirm(options) {
        const defaults = {
            title: 'Delete item?',
            message: 'This action cannot be undone.',
            itemLabel: 'Selected item',
            confirmText: 'Delete',
            cancelText: 'Keep it',
            onConfirm: function() {}
        };
        setState({ modal: { isOpen: true, type: 'confirmDelete', data: Object.assign(defaults, options || {}) } });
    }

    window.cancelDeleteConfirm = () => {
        setState({ modal: { isOpen: false, type: null, data: null } });
    };

    window.confirmDeleteAction = () => {
        const current = state.modal && state.modal.data ? state.modal.data : null;
        const action = current && typeof current.onConfirm === 'function' ? current.onConfirm : null;
        setState({ modal: { isOpen: false, type: null, data: null } });
        if (action) action();
    };

    window.openUpload = () => {
        if (authRequired() && !state.isLoggedIn) {
            window.showToast('Please sign in before uploading.', 'info');
            openAuthPanel('signin');
            return;
        }
        setState({
            tab: 'create',
            createMode: 'resource',
            showAuthPanel: false,
            selectedResource: null,
            showNotifs: false
        });
    };

    function cvNormalizeResourceDownloadUrl(url) {
        url = String(url || '').trim();
        if (!url) return '';
        try {
            const parsed = new URL(url, window.location.href);
            const host = parsed.hostname.toLowerCase();
            let driveId = '';
            const fileMatch = parsed.pathname.match(/\/file\/d\/([^/]+)/);
            if (fileMatch && fileMatch[1]) driveId = fileMatch[1];
            if (!driveId && parsed.searchParams && parsed.searchParams.get('id')) driveId = parsed.searchParams.get('id');
            if (driveId && host.indexOf('drive.google.com') !== -1) {
                return 'https://drive.google.com/uc?export=download&id=' + encodeURIComponent(driveId);
            }
        } catch (e) {}
        return /^https:\/\/[^\s]+$/i.test(url) ? url : '';
    }

    function cvResourceById(id) {
        return (state.resources || []).find(function(r) { return String(r.id) === String(id); }) || (state.selectedResource && String(state.selectedResource.id) === String(id) ? state.selectedResource : null);
    }

    function cvIsApiLibraryResource(resource) {
        if (!resource) return false;
        const source = String(resource.api_source || resource.source || '').toLowerCase();
        const id = String(resource.id || '').toLowerCase();
        return !!resource.external || source === 'gutendex' || source === 'openlibrary' || id.indexOf('gutendex:') === 0 || id.indexOf('openlibrary:') === 0;
    }

    function cvIsGutendexResource(resource) {
        if (!resource) return false;
        const source = String(resource.api_source || resource.source || '').toLowerCase();
        const id = String(resource.id || '').toLowerCase();
        return source === 'gutendex' || id.indexOf('gutendex:') === 0;
    }

    function cvPickGutendexFormat(formats, preferences) {
        if (!formats || typeof formats !== 'object') return '';
        const entries = Object.keys(formats).map(function(key) {
            return { mime: String(key || '').toLowerCase(), url: String(formats[key] || '') };
        }).filter(function(item) { return !!item.url; });

        for (let i = 0; i < preferences.length; i += 1) {
            const preferred = String(preferences[i] || '').toLowerCase();
            const found = entries.find(function(item) { return item.mime.indexOf(preferred) === 0; });
            if (found) return found.url;
        }
        return '';
    }

    function cvNormalizeGutendexBook(book, categoryOverride, searchTerm) {
        if (!book || !book.id || !book.title) return null;
        const id = parseInt(book.id, 10);
        if (!id) return null;

        const authors = Array.isArray(book.authors)
            ? book.authors.slice(0, 3).map(function(author) { return String((author && author.name) || '').trim(); }).filter(Boolean)
            : [];
        const subjects = Array.isArray(book.subjects)
            ? book.subjects.slice(0, 8).map(function(subject) { return String(subject || '').trim(); }).filter(Boolean)
            : [];
        const shelves = Array.isArray(book.bookshelves)
            ? book.bookshelves.slice(0, 5).map(function(shelf) { return String(shelf || '').trim(); }).filter(Boolean)
            : [];
        const languages = Array.isArray(book.languages)
            ? book.languages.slice(0, 3).map(function(language) { return String(language || '').trim().toUpperCase(); }).filter(Boolean)
            : [];

        const formats = book.formats && typeof book.formats === 'object' ? book.formats : {};
        const coverUrl = cvPickGutendexFormat(formats, ['image/']);
        const readUrl = cvPickGutendexFormat(formats, ['text/html', 'application/pdf', 'text/plain']) || ('https://www.gutenberg.org/ebooks/' + id);
        const downloadUrl = cvPickGutendexFormat(formats, ['application/epub+zip', 'application/x-mobipocket-ebook', 'text/plain', 'text/html', 'application/pdf']) || readUrl;
        const title = String(book.title || 'Untitled book').trim();
        const authorLabel = authors.length ? authors.join(', ') : 'Project Gutenberg';
        const haystack = (subjects.join(' ') + ' ' + shelves.join(' ') + ' ' + title + ' ' + String(searchTerm || '')).toLowerCase();

        let category = 'Books';
        const override = String(categoryOverride || 'All').trim();
        if (haystack.indexOf('bible') !== -1 || haystack.indexOf('theology') !== -1 || haystack.indexOf('christian') !== -1 || haystack.indexOf('religion') !== -1) {
            category = 'Bible Study';
        }
        if (haystack.indexOf('history') !== -1) category = 'History';
        if (override && override.toLowerCase() !== 'all') category = override;

        const description = [
            'Free public-domain ebook from Project Gutenberg via Gutendex.',
            authorLabel !== 'Project Gutenberg' ? ('Author: ' + authorLabel + '.') : '',
            subjects.length ? ('Subject: ' + subjects.slice(0, 3).join(', ') + '.') : '',
            languages.length ? ('Language: ' + languages.join(', ') + '.') : '',
            'Open the book to read or download the available Project Gutenberg format.'
        ].filter(Boolean).join(' ');

        return {
            id: 'gutendex:' + id,
            source: 'gutendex',
            api_source: 'gutendex',
            external: true,
            title: title,
            description: description,
            category: category,
            format: 'Ebook / Read',
            type: 'book',
            size: 'PG #' + id,
            author: authorLabel,
            author_title: 'Project Gutenberg',
            country: languages.length ? languages.join(', ') : 'Global',
            views: 0,
            downloads: parseInt(book.download_count || 0, 10) || 0,
            download_count: parseInt(book.download_count || 0, 10) || 0,
            image_url: coverUrl,
            cover_image_url: coverUrl,
            thumbnail_url: coverUrl,
            file_url: readUrl,
            url: readUrl,
            open_url: readUrl,
            download_url: downloadUrl,
            gutenberg_url: 'https://www.gutenberg.org/ebooks/' + id,
            can_delete: false,
            verification: { show: false, type: 'none', label: '' }
        };
    }

    function cvBuildGutendexUrl(search, category, limit) {
        const url = new URL('https://gutendex.com/books');
        const term = String(search || '').trim();
        const cat = String(category || 'All').trim().toLowerCase();
        if (term) {
            url.searchParams.set('search', term);
        } else if (cat === 'bible study') {
            url.searchParams.set('search', 'bible');
            url.searchParams.set('topic', 'bible');
        } else if (cat === 'history') {
            url.searchParams.set('topic', 'history');
        } else if (cat && cat !== 'all' && cat !== 'books') {
            url.searchParams.set('topic', category);
        } else {
            url.searchParams.set('sort', 'popular');
        }
        if (term && cat === 'bible study') url.searchParams.set('topic', 'bible');
        if (term && cat === 'history') url.searchParams.set('topic', 'history');
        url.searchParams.set('page_size', String(Math.max(1, Math.min(parseInt(limit || 24, 10) || 24, 32))));
        return url.toString();
    }

    function cvMergeResourcesWithBooks(currentResources, apiBooks) {
        const current = Array.isArray(currentResources) ? currentResources : [];
        const books = Array.isArray(apiBooks) ? apiBooks.filter(Boolean) : [];
        if (!books.length) return current;

        const seen = new Set();
        const uniqueCurrent = [];
        current.forEach(function(item) {
            const key = String(item && item.id || '').toLowerCase();
            if (!key || seen.has(key)) return;
            seen.add(key);
            uniqueCurrent.push(item);
        });

        const uniqueBooks = [];
        books.forEach(function(item) {
            const key = String(item && item.id || '').toLowerCase();
            if (!key || seen.has(key)) return;
            seen.add(key);
            uniqueBooks.push(item);
        });

        // Keep existing Faith In resources, but surface API books immediately in the first screen.
        const leadingLocal = uniqueCurrent.filter(function(item) { return !cvIsGutendexResource(item); }).slice(0, 2);
        const trailingLocal = uniqueCurrent.filter(function(item) { return !cvIsGutendexResource(item); }).slice(2);
        const existingApi = uniqueCurrent.filter(cvIsGutendexResource);
        return leadingLocal.concat(uniqueBooks, existingApi, trailingLocal);
    }

    function cvBuildGutendexStarterBooks(category, search) {
        const cat = String(category || 'All').trim();
        const term = String(search || '').trim().toLowerCase();
        const starter = [
            { id: 10, title: 'The King James Version of the Bible', author: 'Project Gutenberg', subjects: ['Bible', 'Christianity'], downloads: 0 },
            { id: 30, title: 'The Bible, King James Version, Complete', author: 'Project Gutenberg', subjects: ['Bible', 'Religion'], downloads: 0 },
            { id: 7016, title: 'The History of the Christian Church', author: 'Philip Schaff', subjects: ['Christian Church', 'History'], downloads: 0 },
            { id: 19187, title: 'A Short History of Christianity', author: 'J. M. Robertson', subjects: ['Christianity', 'History'], downloads: 0 },
            { id: 1583, title: 'The Pilgrim\'s Progress', author: 'John Bunyan', subjects: ['Christian life', 'Allegory'], downloads: 0 },
            { id: 167, title: 'The History of the Peloponnesian War', author: 'Thucydides', subjects: ['History'], downloads: 0 }
        ];
        return starter.filter(function(book) {
            const haystack = (book.title + ' ' + book.author + ' ' + (book.subjects || []).join(' ')).toLowerCase();
            if (term && haystack.indexOf(term) === -1) return false;
            if (String(cat).toLowerCase() === 'bible study') return haystack.indexOf('bible') !== -1 || haystack.indexOf('christian') !== -1 || haystack.indexOf('religion') !== -1 || haystack.indexOf('church') !== -1;
            if (String(cat).toLowerCase() === 'history') return haystack.indexOf('history') !== -1;
            return true;
        }).map(function(book) {
            return cvNormalizeGutendexBook({
                id: book.id,
                title: book.title,
                authors: [{ name: book.author }],
                subjects: book.subjects || [],
                bookshelves: [],
                languages: ['en'],
                download_count: book.downloads || 0,
                formats: { 'text/html': 'https://www.gutenberg.org/ebooks/' + book.id }
            }, cat, search);
        }).filter(Boolean);
    }

    function cvFetchWithTimeout(url, options, timeoutMs) {
        if (typeof fetch !== 'function') {
            return Promise.reject(new Error('Browser fetch is not available'));
        }
        const timeout = Math.max(1500, parseInt(timeoutMs || 4500, 10) || 4500);
        if (typeof AbortController === 'function') {
            const controller = new AbortController();
            const timer = window.setTimeout(function() { controller.abort(); }, timeout);
            const fetchOptions = { ...(options || {}), signal: controller.signal };
            return fetch(url, fetchOptions).then(function(response) {
                window.clearTimeout(timer);
                return response;
            }, function(error) {
                window.clearTimeout(timer);
                throw error;
            });
        }

        return new Promise(function(resolve, reject) {
            const timer = window.setTimeout(function() {
                reject(new Error('Request timed out'));
            }, timeout);
            fetch(url, options || {}).then(function(response) {
                window.clearTimeout(timer);
                resolve(response);
            }, function(error) {
                window.clearTimeout(timer);
                reject(error);
            });
        });
    }

    function cvFetchGutendexResourcesClient(search, category, limit) {
        const url = cvBuildGutendexUrl(search, category, limit || 24);
        return cvFetchWithTimeout(url, { headers: { 'Accept': 'application/json' } }, 4500)
            .then(function(res) {
                if (!res.ok) throw new Error('Gutendex request failed');
                return res.json();
            })
            .then(function(data) {
                const results = data && Array.isArray(data.results) ? data.results : [];
                const normalized = results.map(function(book) {
                    return cvNormalizeGutendexBook(book, category, search);
                }).filter(Boolean);
                return normalized.length ? normalized : cvBuildGutendexStarterBooks(category, search);
            });
    }

    function cvOpenApiLibraryResource(resource) {
        const url = cvNormalizeResourceDownloadUrl(resource && (resource.open_url || resource.file_url || resource.url || resource.download_url || ''));
        if (!url) {
            window.showToast('Book link is not available right now.', 'error');
            return false;
        }
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.style.position = 'fixed';
        a.style.left = '-9999px';
        a.style.top = '0';
        document.body.appendChild(a);
        a.click();
        window.setTimeout(function() {
            try { a.remove(); } catch (e) { if (a.parentNode) a.parentNode.removeChild(a); }
        }, 1200);
        window.showToast('Opening book');
        return true;
    }

    function cvStartResourceDownload(url, filename) {
        url = cvNormalizeResourceDownloadUrl(url);
        if (!url) return false;
        const name = String(filename || 'faith-in-resource').replace(/[\\/:*?"<>|]+/g, '-').trim() || 'faith-in-resource';
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.download = name;
        a.style.position = 'fixed';
        a.style.left = '-9999px';
        a.style.top = '0';
        document.body.appendChild(a);
        a.click();
        window.setTimeout(function() {
            try { a.remove(); } catch (e) { if (a.parentNode) a.parentNode.removeChild(a); }
        }, 1200);
        return true;
    }

    function cvMarkResourceDownloaded(id, count) {
        const sid = String(id);
        const downloads = Array.isArray(state.downloads) ? state.downloads.map(String) : [];
        if (!downloads.includes(sid)) downloads.push(sid);
        const resources = (state.resources || []).map(function(r) {
            if (String(r.id) !== sid) return r;
            return Object.assign({}, r, { downloads: typeof count !== 'undefined' ? count : (parseInt(r.downloads || 0, 10) + 1) });
        });
        const selectedResource = state.selectedResource && String(state.selectedResource.id) === sid
            ? Object.assign({}, state.selectedResource, { downloads: typeof count !== 'undefined' ? count : (parseInt(state.selectedResource.downloads || 0, 10) + 1) })
            : state.selectedResource;
        setState({ downloads, resources, selectedResource });
    }

    window.downloadResource = (id) => {
        const resource = cvResourceById(id);
        if (cvIsApiLibraryResource(resource)) {
            cvOpenApiLibraryResource(resource);
            return;
        }
        const directUrl = resource ? cvNormalizeResourceDownloadUrl(resource.file_url || resource.url || resource.download_url || '') : '';
        const filename = resource ? (resource.title || resource.filename || 'faith-in-resource') : 'faith-in-resource';

        // v5.5.151 mobile fix: start the file open/download synchronously from the tap.
        // iOS Safari can block window.open when it happens only after an AJAX response.
        const startedImmediately = directUrl ? cvStartResourceDownload(directUrl, filename) : false;
        if (startedImmediately) {
            window.showToast('Download started');
            cvMarkResourceDownloaded(id);
        }

        ajaxRequest('cv_download_resource', { resource_id: id }).done(function(response) {
            if (response.success) {
                const payload = response.data || {};
                if (!startedImmediately) {
                    if (cvStartResourceDownload(payload.url, payload.filename || filename)) {
                        window.showToast('Download started');
                    } else {
                        window.showToast('Download link is not available.', 'error');
                    }
                }
                cvMarkResourceDownloaded(id, payload.downloads);
            } else if (!startedImmediately) {
                window.showToast(response.data, 'error');
            }
        }).fail(function(xhr) {
            if (!startedImmediately) {
                const message = (xhr && xhr.responseJSON && xhr.responseJSON.data) ? xhr.responseJSON.data : 'Could not start the download.';
                window.showToast(message, 'error');
            }
        });
    };

    window.toggleBookmark = (id) => {
        ajaxRequest('cv_toggle_bookmark', { resource_id: id }).done(function(response) {
            if (response.success) {
                const bookmarked = !!(response.data && response.data.bookmarked);
                const next = (state.bookmarks || []).map(String).filter(value => value !== String(id));
                if (bookmarked) next.push(String(id));
                setState({ bookmarks: next });
                window.showToast(bookmarked ? 'Saved to your collection.' : 'Removed from saved items.', 'success');
            }
        });
    };

    window.cvTogglePostBookmark = (id) => {
        ajaxRequest('cv_toggle_bookmark', { post_id: id, object_type: 'post' }).done(function(response) {
            if (!response || !response.success) {
                window.showToast((response && response.data) || 'Could not update saved items.', 'error');
                return;
            }
            const bookmarked = !!(response.data && response.data.bookmarked);
            const next = (state.bookmarks || []).map(String).filter(value => value !== String(id));
            if (bookmarked) next.push(String(id));
            setState({ bookmarks: next });
            window.showToast(bookmarked ? 'Post saved.' : 'Post removed from saved items.', 'success');
        }).fail(function() {
            window.showToast('Could not update saved items. Please try again.', 'error');
        });
    };

    window.cvShowSavedPosts = () => {
        setState({ tab: 'home', selectedResource: null, savedPostsOnly: true, feedError: '' });
        loadBookmarks();
    };

    window.deleteResource = (id) => {
        const resource = (state.resources || []).find(r => String(r.id) === String(id)) || state.selectedResource || {};
        openDeleteConfirm({
            title: 'Delete this resource?',
            itemLabel: resource.title || 'Resource',
            message: 'This will permanently remove the resource from your library. This action cannot be undone.',
            confirmText: 'Delete resource',
            onConfirm: function() {
                ajaxRequest('cv_delete_resource', { resource_id: id }).done(function(response) {
                    if (response.success) {
                        window.showToast('Resource deleted successfully', 'success');
                        setState({ selectedResource: null, tab: 'explore' });
                        loadResources();
                    } else {
                        window.showToast(response.data, 'error');
                    }
                }).fail(function(xhr) {
                    window.showToast((xhr.responseJSON && xhr.responseJSON.data) ? xhr.responseJSON.data : 'Could not delete the resource.', 'error');
                });
            }
        });
    };
    window.editPost = (id) => {
        const post = (state.posts || []).find(p => String(p.id) === String(id));
        if (!post || !post.can_edit) {
            window.showToast('You can only edit your own posts.', 'error');
            return;
        }
        const isArticle = String(post.type || '').toLowerCase() === 'article';
        setState({
            modal: {
                isOpen: true,
                type: 'editPost',
                data: {
                    postId: id,
                    isArticle: isArticle,
                    title: post.article_title || post.title || '',
                    excerpt: post.article_excerpt || post.excerpt || '',
                    content: isArticle ? (post.article_body || post.content || '') : (post.content || ''),
                    typeLabel: isArticle ? 'Article' : (post.type || 'Post'),
                    coverImage: post.cover_image_url || '',
                    time: post.time || '',
                    visibility: cvNormalizePostVisibility(post.post_visibility || post.visibility || 'public'),
                    author: post.author || {}
                }
            }
        });
    };

    window.savePostEdit = () => {
        const current = state.modal && state.modal.type === 'editPost' ? state.modal.data : null;
        if (!current) return;
        const titleEl = document.getElementById('cv-edit-post-title');
        const excerptEl = document.getElementById('cv-edit-post-excerpt');
        const contentEl = document.getElementById('cv-edit-post-content');
        const saveBtn = document.getElementById('cv-edit-post-save');
        const title = titleEl ? titleEl.value.trim() : '';
        const excerpt = excerptEl ? excerptEl.value.trim() : '';
        const content = contentEl ? contentEl.value.trim() : '';

        if (current.isArticle && !title) {
            window.showToast('Article title is required.', 'info');
            if (titleEl) titleEl.focus();
            return;
        }
        if (!content) {
            window.showToast(current.isArticle ? 'Article body is required.' : 'Post content is required.', 'info');
            if (contentEl) contentEl.focus();
            return;
        }

        const idleSaveLabel = current.isArticle
            ? '<i data-lucide="badge-check" class="w-5 h-5 shrink-0"></i><span class="cv-edit-post-save-label">Done & Publish</span>'
            : '<i data-lucide="check" class="w-5 h-5 shrink-0"></i><span class="cv-edit-post-save-label">Done</span>';

        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.classList.add('opacity-70', 'cursor-not-allowed');
            saveBtn.innerHTML = '<i data-lucide="loader-2" class="w-5 h-5 animate-spin shrink-0"></i><span class="cv-edit-post-save-label">Publishing</span>';
            if (window.lucide) window.lucide.createIcons();
        }

        const data = { post_id: current.postId, content: content, post_visibility: cvNormalizePostVisibility(current.visibility || 'public') };
        if (current.isArticle) {
            data.title = title;
            data.excerpt = excerpt;
        }

        ajaxRequest('cv_update_post', data).done(function(response) {
            if (response.success) {
                window.showToast(current.isArticle ? 'Article published successfully.' : 'Post updated successfully.', 'success');
                setState({ modal: { isOpen: false, type: null, data: null } });
                loadPosts();
            } else {
                window.showToast(response.data || 'Could not update the post.', 'error');
                if (saveBtn) {
                    saveBtn.disabled = false;
                    saveBtn.classList.remove('opacity-70', 'cursor-not-allowed');
                    saveBtn.innerHTML = idleSaveLabel;
                    if (window.lucide) window.lucide.createIcons();
                }
            }
        }).fail(function(xhr) {
            window.showToast((xhr.responseJSON && xhr.responseJSON.data) ? xhr.responseJSON.data : 'Could not update the post.', 'error');
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.classList.remove('opacity-70', 'cursor-not-allowed');
                saveBtn.innerHTML = idleSaveLabel;
                if (window.lucide) window.lucide.createIcons();
            }
        });
    };

    window.deletePost = (id) => {
        const post = (state.posts || []).find(p => String(p.id) === String(id));
        if (!post || !post.can_delete) {
            window.showToast('You can only delete your own posts.', 'error');
            return;
        }
        openDeleteConfirm({
            title: 'Delete this post?',
            itemLabel: post.article_title || post.title || 'Post',
            message: 'This post will be removed from the network. This action cannot be undone.',
            confirmText: 'Delete post',
            onConfirm: function() {
                ajaxRequest('cv_delete_post', { post_id: id }).done(function(response) {
                    if (response.success) {
                        window.showToast('Post deleted successfully.', 'success');
                        loadPosts();
                    } else {
                        window.showToast(response.data, 'error');
                    }
                }).fail(function(xhr) {
                    window.showToast((xhr.responseJSON && xhr.responseJSON.data) ? xhr.responseJSON.data : 'Could not delete the post.', 'error');
                });
            }
        });
    };

    window.editPrayer = (id) => {
        const prayer = (state.prayers || []).find(p => String(p.id) === String(id));
        if (!prayer || !prayer.can_edit) {
            window.showToast('You can only edit your own prayer requests.', 'error');
            return;
        }
        const newContent = prompt('Edit prayer request:', prayer.content || '');
        if (newContent === null) return;
        if (!newContent.trim()) {
            window.showToast('Prayer request cannot be empty.', 'info');
            return;
        }
        ajaxRequest('cv_update_prayer', { prayer_id: id, content: newContent }).done(function(response) {
            if (response.success) {
                window.showToast('Prayer request updated.');
                loadPrayers();
            } else {
                window.showToast(response.data, 'error');
            }
        }).fail(function(xhr) {
            window.showToast((xhr.responseJSON && xhr.responseJSON.data) ? xhr.responseJSON.data : 'Could not update the prayer request.', 'error');
        });
    };

    window.deletePrayer = (id) => {
        const prayer = (state.prayers || []).find(p => String(p.id) === String(id));
        if (!prayer || !prayer.can_delete) {
            window.showToast('You can only delete your own prayer requests.', 'error');
            return;
        }
        openDeleteConfirm({
            title: 'Delete prayer request?',
            itemLabel: 'Prayer request',
            message: 'This prayer request will be removed from the prayer wall. This action cannot be undone.',
            confirmText: 'Delete request',
            onConfirm: function() {
                ajaxRequest('cv_delete_prayer', { prayer_id: id }).done(function(response) {
                    if (response.success) {
                        window.showToast('Prayer request deleted.', 'success');
                        loadPrayers();
                    } else {
                        window.showToast(response.data, 'error');
                    }
                }).fail(function(xhr) {
                    window.showToast((xhr.responseJSON && xhr.responseJSON.data) ? xhr.responseJSON.data : 'Could not delete the prayer request.', 'error');
                });
            }
        });
    };


window.requestMagicLink = () => {
    const email = (state.authEmail || '').trim();
    if (!email) {
        window.showToast('Enter your email address first.', 'info');
        return;
    }
    ajaxRequest('cv_request_magic_link', { email: email }).done(function(response) {
        if (response.success) {
            window.showToast(response.data, 'success');
        } else {
            window.showToast(response.data, 'error');
        }
    }).fail(function(xhr) {
        window.showToast((xhr.responseJSON && xhr.responseJSON.data) ? xhr.responseJSON.data : 'Could not send the sign-in link.', 'error');
    });
};

window.signUpWithPhone = () => {
    const phone = (state.authPhone || '').trim();
    if (!phone) {
        window.showToast('Enter your phone number first.', 'info');
        return;
    }
    ajaxRequest('cv_phone_sign_up', { phone: phone }).done(function(response) {
        if (response.success) {
            syncAuthUserIntoForms(response.data || {});
            window.showToast('Signed in with phone number.', 'success');
        } else {
            window.showToast(response.data || 'Could not sign up with phone.', 'error');
        }
    }).fail(function(xhr) {
        window.showToast((xhr.responseJSON && xhr.responseJSON.data) ? xhr.responseJSON.data : 'Could not sign up with phone.', 'error');
    });
};

window.startSocialSignup = (provider) => {
    const auth = (typeof cv_ajax !== 'undefined' && cv_ajax.auth) ? cv_ajax.auth : {};
    const label = provider === 'apple' ? 'Apple' : 'TikTok';
    const url = provider === 'apple' ? auth.apple_oauth_url : auth.tiktok_oauth_url;
    if (url) {
        try {
            const target = new URL(String(url), window.location.origin);
            if (target.protocol === 'https:') {
                window.location.assign(target.href);
                return;
            }
        } catch (error) {}
    }
    window.showToast(label + ' sign-up needs OAuth setup in Faith In settings first.', 'info');
};

window.handleGoogleCredentialResponse = (response) => {
    if (cvAuthMode() === 'signup' || document.querySelector('.cv-auth-dream[data-auth-mode="signup"]')) {
        cvRemoveSignupGoogleUi();
        window.showToast('Google is available on Log In only. Please create your account with email and password.', 'info');
        return;
    }
    if (!response || !response.credential) {
        setState({ authLoading: false });
        window.showToast('Google sign-in did not return a credential.', 'error');
        return;
    }
    setState({ authLoading: true, authErrors: {} });
    const googleServerTimeout = window.setTimeout(function() {
        if (state.authLoading) {
            setState({ authLoading: false });
            window.showToast('Google sign-in is taking too long. Please check your connection and try again.', 'error');
        }
    }, 20000);
    ajaxRequest('cv_google_sign_in', { credential: response.credential }).done(function(res) {
        if (res.success) {
            cvCompleteAuth(res.data || {}, { provider: 'google' });
            window.showToast('Signed in with Google.', 'success');
        } else {
            window.showToast(res.data || 'Google sign-in failed.', 'error');
        }
    }).fail(function(xhr) {
        window.showToast((xhr.responseJSON && xhr.responseJSON.data) ? xhr.responseJSON.data : 'Google sign-in failed.', 'error');
    }).always(function() {
        window.clearTimeout(googleServerTimeout);
        setState({ authLoading: false });
    });
};

function cvClearLocalAuthState() {
    if (typeof cv_ajax !== 'undefined' && cv_ajax.auth) {
        cv_ajax.auth.is_logged_in = false;
        cv_ajax.auth.current_user = null;
    }
    setState({
        isLoggedIn: false,
        currentUser: null,
        profileName: '',
        profileGender: '',
        profileRole: '',
        profileLocation: '',
        profileIndustry: '',
        profileChurch: '',
        profileMinistry: '',
        profileBio: '',
        profileArticles: [],
        profileResources: [],
        profileFollowersCount: 0,
        profileFollowingCount: 0,
        profileFollowers: [],
        profileFollowing: [],
        verificationStatus: null,
        verificationRequest: null,
        selectedResource: null,
        showNotifs: false,
        modal: { isOpen: false, type: null, data: null },
        tab: 'profile',
        showAuthPanel: true,
        authPanelTitle: 'Log In',
        authPassword: '',
        authPasswordVisible: false,
        authErrors: {},
        authLoading: false,
        authRestoring: false
    });
}

window.signOut = () => {
    if (state.authLoading) return;

    cvClearLocalAuthState();
    window.showToast('Signed out successfully.');

    if (cvHasFirebaseConfig()) {
        cvGetFirebaseAuthBundle()
            .then(function(bundle) {
                if (bundle && bundle.authModule && bundle.authModule.signOut && bundle.auth) {
                    return bundle.authModule.signOut(bundle.auth);
                }
            })
            .catch(function(error) {
                console.warn('Faith In Firebase sign out warning', error);
            });
    }

    if (!cvUsesFirebaseBackend()) {
        ajaxRequest('cv_logout').fail(function(xhr) {
            console.warn('Faith In server logout warning', xhr);
        });
    }
};

    function cvReactionIconSvg(iconName, extraClass) {
        const cls = extraClass || 'cv-reaction-svg';
        const attrs = `class="${cls}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"`;
        const common = 'stroke="currentColor" stroke-width="2.35" stroke-linecap="round" stroke-linejoin="round"';
        const filled = 'fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
        switch (iconName) {
            case 'sparkles':
                return `<svg ${attrs}><path ${filled} d="M12 2.8l1.55 4.65 4.65 1.55-4.65 1.55L12 15.2l-1.55-4.65L5.8 9l4.65-1.55L12 2.8Z"/><path ${common} d="M19 14v3"/><path ${common} d="M17.5 15.5h3"/><path ${common} d="M5 17v3"/><path ${common} d="M3.5 18.5h3"/></svg>`;
            case 'praying':
                return `<svg ${attrs}><path ${common} d="M8.5 12.5 12 16l3.5-3.5"/><path ${common} d="M7.3 8.7c-1.4 1.5-1.4 3.9.1 5.4L12 18.7l4.6-4.6c1.5-1.5 1.5-3.9.1-5.4-1.3-1.3-3.5-1.3-4.7 0-1.2-1.3-3.4-1.3-4.7 0Z"/><path ${common} d="M9 20h6"/></svg>`;
            case 'heart':
                return `<svg ${attrs}><path ${filled} d="M20.8 5.6c-2-2-5.2-1.8-6.9.4L12 8.3 10.1 6C8.4 3.8 5.2 3.6 3.2 5.6c-2.3 2.3-2.1 6 .5 8.1l8.3 7.1 8.3-7.1c2.6-2.1 2.8-5.8.5-8.1Z"/></svg>`;
            case 'lightbulb':
                return `<svg ${attrs}><path ${filled} d="M9 18h6v1.5A2.5 2.5 0 0 1 12.5 22h-1A2.5 2.5 0 0 1 9 19.5V18Z"/><path ${common} d="M15 14.5c.2-1 .8-1.7 1.5-2.5A6 6 0 1 0 7.5 12c.7.8 1.3 1.5 1.5 2.5"/><path ${common} d="M9 18h6"/></svg>`;
            case 'smile':
                return `<svg ${attrs}><circle cx="12" cy="12" r="9" fill="currentColor" opacity=".34"/><circle cx="9" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="10" r="1" fill="currentColor"/><path ${common} d="M8 14c1 1.3 2.3 2 4 2s3-.7 4-2"/></svg>`;
            case 'thumbs-up':
            default:
                return `<svg ${attrs}><path ${filled} d="M7 10v11H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3Z"/><path ${common} d="M7 10h3.3c.8 0 1.5-.5 1.8-1.2L14.5 3c1.8.2 2.9 2 2.4 3.7L16 10h3.8a2 2 0 0 1 1.9 2.6l-1.8 6A3 3 0 0 1 17 21H7V10Z"/></svg>`;
        }
    }

    function cvReactionVisualHtml(reaction, small) {
        const sizeClass = small ? 'cv-reaction-visual-small' : 'cv-reaction-visual';
        return `<span class="${sizeClass}" style="--cv-reaction-bg:${reaction.badgeBg};--cv-reaction-stroke:${reaction.stroke};--cv-reaction-fill:${reaction.fill}">${cvReactionIconSvg(reaction.iconName)}</span>`;
    }

    const cvPostReactions = {
        like: { key: 'like', label: 'Amen', icon: '👍', iconName: 'thumbs-up', color: '#5b89d6', badgeBg: '#5b89d6', stroke: '#1f4e99', fill: '#9cbbf1', bgColor: '#eff6ff' },
        celebrate: { key: 'celebrate', label: 'Praise', icon: '✦', iconName: 'sparkles', color: '#71a856', badgeBg: '#71a856', stroke: '#285915', fill: '#b4d9a3', bgColor: '#f0fdf4' },
        support: { key: 'support', label: 'Praying', icon: '🤝', iconName: 'praying', color: '#b09ac8', badgeBg: '#b09ac8', stroke: '#4e346e', fill: '#d3c5e3', bgColor: '#faf5ff' },
        love: { key: 'love', label: 'Love', icon: '❤️', iconName: 'heart', color: '#cd6e57', badgeBg: '#cd6e57', stroke: '#732111', fill: '#e8a89b', bgColor: '#fff7ed' },
        insightful: { key: 'insightful', label: 'Inspired', icon: '💡', iconName: 'lightbulb', color: '#eab04d', badgeBg: '#eab04d', stroke: '#7c5108', fill: '#f7d899', bgColor: '#fffbeb' },
        funny: { key: 'funny', label: 'Joy', icon: '😄', iconName: 'smile', color: '#5eb0c3', badgeBg: '#5eb0c3', stroke: '#175c6c', fill: '#a3d8e3', bgColor: '#ecfeff' }
    };
    let cvReactionCloseTimer = null;
    let cvReactionLongPressTimer = null;
    let cvReactionLongPressOpened = false;

    function cvReactionMeta(reaction) {
        return cvPostReactions[reaction] || cvPostReactions.like;
    }

    function cvReactionCount(post) {
        return Number(post && (post.likes || post.reaction_count) ? (post.likes || post.reaction_count) : 0);
    }
    function cvMetric(value) {
        const n = Number(value || 0);
        if (n >= 1000000) return (n / 1000000).toFixed(n % 1000000 ? 1 : 0).replace(/\.0$/, '') + 'M';
        if (n >= 1000) return (n / 1000).toFixed(n % 1000 ? 1 : 0).replace(/\.0$/, '') + 'K';
        return String(n);
    }

    function cvPlural(value, one, many) {
        return Number(value || 0) === 1 ? one : (many || one + 's');
    }

    function cvPostCountLine(post) {
        const reactions = cvReactionCount(post);
        const comments = Number(post && (post.comment_count || post.comments) || 0);
        const reposts = Number(post && (post.repost_count || post.reposts) || 0);
        const shares = Number(post && (post.share_count || post.shares) || 0);
        const reactionIcons = reactions > 0 ? '<span class="cv-stat-reaction-stack" aria-hidden="true">' + ['like','celebrate','support'].map(key => cvReactionVisualHtml(cvPostReactions[key], true)).join('') + '</span><span class="cv-stat-reaction-number">' + cvMetric(reactions) + '</span>' : '';
        const right = [];
        if (comments > 0) right.push(cvMetric(comments) + ' ' + cvPlural(comments, 'comment'));
        if (reposts > 0) right.push(cvMetric(reposts) + ' ' + cvPlural(reposts, 'repost'));
        if (shares > 0) right.push(cvMetric(shares) + ' ' + cvPlural(shares, 'share'));
        if (!reactions && !right.length) return '';
        return '<div class="cv-post-social-stats" aria-label="Post activity"><div class="cv-post-social-stats-left">' + reactionIcons + '</div><div class="cv-post-social-stats-right">' + right.join(' · ') + '</div></div>';
    }

    function cvRenderPostComments(post) {
        const comments = Array.isArray(post && post.recent_comments) ? post.recent_comments : [];
        if (!comments.length) return '';
        return '<div class="cv-post-comments-list">' + comments.map(comment => {
            const author = comment.author || {};
            const mediaUrl = safeImageUrl(comment.media_url || comment.media_drive_url || '', '');
            return '<div class="cv-post-comment-item">'
                + '<div class="cv-post-comment-avatar">' + renderProfileAvatar({ name: author.name || 'Member', avatar_url: author.avatar || author.avatar_url || '' }, 'w-full h-full', 'text-[10px]') + '</div>'
                + '<div class="cv-post-comment-main">'
                    + '<div class="cv-post-comment-head">'
                        + '<div class="cv-post-comment-author"><span class="cv-post-comment-name">' + escapeHtml(author.name || 'Community Member') + '</span>' + (author.handle ? '<span>' + escapeHtml(author.handle) + '</span>' : '') + '</div>'
                        + '<div class="cv-post-comment-tools">' + (comment.time ? '<span class="cv-post-comment-time">' + escapeHtml(comment.time) + '</span>' : '') + cvSocialFollowButton(author, 'cv-comment-follow-btn') + '</div>'
                    + '</div>'
                    + (comment.content ? '<div class="cv-post-comment-text">' + escapeHtml(comment.content || '') + '</div>' : '')
                    + (mediaUrl ? '<img class="cv-post-comment-media" src="' + mediaUrl + '" alt="Comment image" loading="lazy" />' : '')
                    + '<div class="cv-post-comment-actions"><button type="button" class="' + (comment.user_reaction ? 'is-active' : '') + '" onclick="cvToggleCommentReaction(\'' + post.id + '\',\'' + comment.id + '\')" aria-pressed="' + (comment.user_reaction ? 'true' : 'false') + '">' + (comment.user_reaction ? 'Liked' : 'Like') + (Number(comment.reaction_count || comment.reactions || 0) ? ' · ' + Number(comment.reaction_count || comment.reactions || 0) : '') + '</button><button type="button" onclick="cvFocusPostComment(\'' + post.id + '\')">Reply</button></div>'
                + '</div>'
            + '</div>';
        }).join('') + '</div>';
    }


    function cvRenderReactionPicker(postId) {
        return `<div class="cv-reaction-picker" role="menu" aria-label="Choose reaction" data-cv-reaction-picker onpointerdown="cvStartReactionDrag(event, '${postId}')">
            <div class="cv-reaction-options-row">
            ${Object.keys(cvPostReactions).map((key, index) => {
                const reaction = cvPostReactions[key];
                return `<button type="button" class="cv-reaction-option" role="menuitem" title="${reaction.label}" aria-label="React ${reaction.label}" data-cv-reaction-choice="${reaction.key}" onclick="cvSetPostReaction(event, '${postId}', '${reaction.key}')" style="--cv-reaction-index:${index}">
                    ${cvReactionVisualHtml(reaction)}
                    <span class="cv-reaction-tooltip">${reaction.label}</span>
                </button>`;
            }).join('')}
            </div>
        </div>`;
    }

    function cvFindReactionWrap(id) {
        return document.querySelector(`.cv-reaction-wrap[data-post-id="${CSS.escape(String(id))}"]`);
    }

    window.cvOpenReactionPicker = (id) => {
        clearTimeout(cvReactionCloseTimer);
        document.querySelectorAll('.cv-reaction-wrap.is-open').forEach(el => {
            if (el.dataset.postId !== String(id)) el.classList.remove('is-open');
        });
        const wrap = cvFindReactionWrap(id);
        if (wrap) wrap.classList.add('is-open');
    };

    window.cvScheduleReactionClose = (id, delay) => {
        clearTimeout(cvReactionCloseTimer);
        cvReactionCloseTimer = setTimeout(() => {
            const wrap = id ? cvFindReactionWrap(id) : null;
            if (wrap) wrap.classList.remove('is-open');
            if (!id) document.querySelectorAll('.cv-reaction-wrap.is-open').forEach(el => el.classList.remove('is-open'));
        }, delay || 260);
    };

    window.cvCancelReactionClose = () => {
        clearTimeout(cvReactionCloseTimer);
    };

    window.cvStartReactionDrag = (event, id) => {
        if (!event) return;
        if (event.target && event.target.closest && event.target.closest('.cv-reaction-option')) return;
        const wrap = cvFindReactionWrap(id);
        const picker = wrap ? wrap.querySelector("[data-cv-reaction-picker]") : null;
        if (!picker) return;
        event.preventDefault();
        event.stopPropagation();
        clearTimeout(cvReactionCloseTimer);
        const startX = event.clientX || 0;
        const startY = event.clientY || 0;
        const oldX = Number(picker.dataset.dragX || 0);
        const oldY = Number(picker.dataset.dragY || 0);
        let moved = false;
        picker.classList.add("is-dragging");
        try { picker.setPointerCapture(event.pointerId); } catch (e) {}
        const move = (moveEvent) => {
            const dx = (moveEvent.clientX || 0) - startX;
            const dy = (moveEvent.clientY || 0) - startY;
            if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
            const nextX = oldX + dx;
            const nextY = oldY + dy;
            const limitedX = Math.max(-180, Math.min(180, nextX));
            const limitedY = Math.max(-140, Math.min(120, nextY));
            picker.dataset.dragX = String(limitedX);
            picker.dataset.dragY = String(limitedY);
            picker.style.setProperty("--cv-reaction-drag-x", limitedX + "px");
            picker.style.setProperty("--cv-reaction-drag-y", limitedY + "px");
        };
        const up = () => {
            picker.classList.remove("is-dragging");
            picker.dataset.wasDragged = moved ? '1' : '';
            setTimeout(() => { if (picker) picker.dataset.wasDragged = ''; }, 80);
            document.removeEventListener("pointermove", move);
            document.removeEventListener("pointerup", up);
            document.removeEventListener("pointercancel", up);
        };
        document.addEventListener("pointermove", move, { passive: true });
        document.addEventListener("pointerup", up, { once: true });
        document.addEventListener("pointercancel", up, { once: true });
    };

    window.cvStartReactionLongPress = (event, id) => {
        clearTimeout(cvReactionLongPressTimer);
        cvReactionLongPressOpened = false;
        cvReactionLongPressTimer = setTimeout(() => {
            cvReactionLongPressOpened = true;
            window.cvOpenReactionPicker(id);
            if (event && event.cancelable) event.preventDefault();
        }, 430);
    };

    window.cvCancelReactionLongPress = () => {
        clearTimeout(cvReactionLongPressTimer);
    };

    window.cvSetPostReaction = (event, id, reaction) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        if (authRequired() && !state.isLoggedIn) {
            window.showToast('Please sign in to react to posts.', 'info');
            openAuthPanel('signin');
            return;
        }
        ajaxRequest('cv_like_post', { post_id: id, reaction: reaction || 'like' }).done(function(response) {
            if (response.success) {
                const payload = response.data || {};
                const selected = payload.reaction || '';
                state.posts = (state.posts || []).map(post => {
                    if (String(post.id) !== String(id)) return post;
                    return Object.assign({}, post, {
                        likes: Number(payload.likes || 0),
                        current_user_reaction: selected
                    });
                });
                const updatedPost = (state.posts || []).find(post => String(post.id) === String(id));
                const wrap = cvFindReactionWrap(id);
                if (wrap) {
                    const trigger = wrap.querySelector('.cv-reaction-trigger');
                    const meta = cvReactionMeta(selected || 'like');
                    if (trigger) {
                        trigger.classList.toggle('is-active', !!selected);
                        if (selected) {
                            trigger.style.setProperty('--cv-reaction-active-color', meta.color);
                            trigger.style.setProperty('--cv-reaction-active-bg', meta.bgColor || '#eff6ff');
                        } else {
                            trigger.style.removeProperty('--cv-reaction-active-color');
                            trigger.style.removeProperty('--cv-reaction-active-bg');
                        }
                        trigger.setAttribute('aria-label', selected ? ('Remove ' + meta.label + ' reaction') : 'Amen to this post');
                        trigger.innerHTML = selected
                            ? `<span class="cv-action-icon cv-selected-reaction-icon" style="--cv-reaction-color:${meta.color};--cv-reaction-bg-color:${meta.bgColor}">${cvReactionIconSvg(meta.iconName, 'cv-selected-reaction-svg')}</span><span class="cv-action-label">${meta.label}</span>`
                            : `<span class="cv-action-icon cv-like-icon"><i data-lucide="thumbs-up"></i></span><span class="cv-action-label">Amen</span>`;
                    }
                    const shell = document.getElementById('post-' + id);
                    if (shell && updatedPost) {
                        const oldStats = shell.querySelector('.cv-post-social-stats');
                        const nextStats = cvPostCountLine(updatedPost);
                        if (oldStats) oldStats.remove();
                        if (nextStats) shell.insertAdjacentHTML('afterbegin', nextStats);
                    }
                }
                window.cvScheduleReactionClose(null, 1);
                if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
            } else {
                window.showToast(response.data || 'Could not update reaction.', 'error');
            }
        }).fail(function(xhr) {
            window.showToast((xhr.responseJSON && xhr.responseJSON.data) ? xhr.responseJSON.data : 'Could not update reaction.', 'error');
        });
    };

    window.likePost = (id) => {
        if (cvReactionLongPressOpened) {
            cvReactionLongPressOpened = false;
            return;
        }
        window.cvSetPostReaction(null, id, 'like');
    };

    if (!window.cvReactionOutsideClickBound) {
        window.cvReactionOutsideClickBound = true;
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.cv-reaction-wrap')) {
                window.cvScheduleReactionClose(null, 1);
            }
        });
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') window.cvScheduleReactionClose(null, 1);
        });
    }

    window.cvComingSoon = (label) => {
        window.showToast((label || 'This feature') + ' is coming soon.', 'info');
    };

    window.cvFocusPostComment = (id) => {
        const input = document.getElementById('cv-comment-input-' + id);
        if (input) input.focus();
        const post = (state.posts || []).find(item => String(item.id) === String(id));
        if (!post || post.comments_loaded || post.comments_loading) return;
        post.comments_loading = true;
        ajaxRequest('cv_get_post_comments', { post_id: id }).done(function(response) {
            const items = response && response.success && response.data && Array.isArray(response.data.items) ? response.data.items : [];
            state.posts = (state.posts || []).map(item => String(item.id) === String(id)
                ? Object.assign({}, item, { recent_comments: items, comments_loaded: true, comments_loading: false })
                : item);
            render();
            const freshInput = document.getElementById('cv-comment-input-' + id);
            if (freshInput) freshInput.focus();
        }).fail(function() {
            post.comments_loading = false;
            window.showToast('Could not load comments. Please try again.', 'error');
        });
    };

    window.cvToggleCommentReaction = (postId, commentId) => {
        ajaxRequest('cv_toggle_comment_reaction', { post_id: postId, comment_id: commentId }).done(function(response) {
            if (!response || !response.success) {
                window.showToast((response && response.data) || 'Could not update that comment.', 'error');
                return;
            }
            const payload = response.data || {};
            state.posts = (state.posts || []).map(post => {
                if (String(post.id) !== String(postId)) return post;
                const comments = (post.recent_comments || []).map(comment => String(comment.id) === String(commentId)
                    ? Object.assign({}, comment, { reaction_count: Number(payload.reaction_count || 0), reactions: Number(payload.reaction_count || 0), user_reaction: payload.user_reaction || null })
                    : comment);
                return Object.assign({}, post, { recent_comments: comments });
            });
            render();
        });
    };

    window.cvInsertCommentEmoji = (id) => {
        const input = document.getElementById('cv-comment-input-' + id);
        if (!input) return;
        const emojis = ['🙏', '❤️', '🙌', '😊', '✝️', '🕊️'];
        const index = Number(input.dataset.emojiIndex || 0) % emojis.length;
        const start = typeof input.selectionStart === 'number' ? input.selectionStart : input.value.length;
        const end = typeof input.selectionEnd === 'number' ? input.selectionEnd : start;
        input.value = input.value.slice(0, start) + emojis[index] + input.value.slice(end);
        input.dataset.emojiIndex = String(index + 1);
        input.focus();
        input.setSelectionRange(start + emojis[index].length, start + emojis[index].length);
    };

    window.cvSelectCommentImage = (id) => {
        const fileInput = document.getElementById('cv-comment-image-' + id);
        if (fileInput) fileInput.click();
    };

    window.cvCommentImagePicked = (id) => {
        const fileInput = document.getElementById('cv-comment-image-' + id);
        const file = fileInput && fileInput.files && fileInput.files[0];
        if (file) window.showToast('Image ready. Press Enter to post your comment.', 'info');
        const input = document.getElementById('cv-comment-input-' + id);
        if (input) input.focus();
    };

    window.cvSubmitPostComment = (id) => {
        const input = document.getElementById('cv-comment-input-' + id);
        if (!input) return;
        window.cvHandleCommentKey({
            key: 'Enter',
            preventDefault: function() {},
            target: input
        }, id);
    };

    window.cvHandleCommentKey = (event, id) => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        const input = event.target;
        const fileInput = document.getElementById('cv-comment-image-' + id);
        const file = fileInput && fileInput.files && fileInput.files[0];
        const value = (input && input.value ? input.value : '').trim();
        if (!value && !file) return;
        if (authRequired() && !state.isLoggedIn) {
            window.showToast('Please sign in to comment.', 'info');
            openAuthPanel('signin');
            return;
        }
        if (input) input.disabled = true;
        const formData = new FormData();
        formData.append('action', 'cv_create_post_comment');
        formData.append('nonce', cv_ajax.nonce);
        formData.append('post_id', id);
        formData.append('content', value);
        if (file) formData.append('comment_image', file);
        $.ajax({ url: cv_ajax.ajax_url, type: 'POST', data: formData, processData: false, contentType: false }).done(function(response) {
            if (response.success) {
                const payload = response.data || {};
                state.posts = (state.posts || []).map(post => {
                    if (String(post.id) !== String(id)) return post;
                    const nextComments = Array.isArray(post.recent_comments) ? post.recent_comments.slice() : [];
                    if (payload.comment) nextComments.push(payload.comment);
                    const count = Number(payload.comment_count || nextComments.length || 0);
                    return Object.assign({}, post, { comments: count, comment_count: count, recent_comments: nextComments, comments_loaded: true });
                });
                if (input) input.value = '';
                if (fileInput) fileInput.value = '';
                if (payload.drive_warning) window.showToast(payload.drive_warning, 'info');
                render();
            } else {
                window.showToast(response.data || 'Could not save comment.', 'error');
            }
        }).fail(function(xhr) {
            window.showToast((xhr.responseJSON && xhr.responseJSON.data) ? xhr.responseJSON.data : 'Could not save comment.', 'error');
        }).always(function() {
            if (input) input.disabled = false;
        });
    };

    window.cvRepostPost = (id) => {
        if (authRequired() && !state.isLoggedIn) {
            window.showToast('Please sign in to repost.', 'info');
            openAuthPanel('signin');
            return;
        }
        ajaxRequest('cv_repost_post', { post_id: id }).done(function(response) {
            if (response.success) {
                const payload = response.data || {};
                const count = Number(payload.repost_count || 0);
                state.posts = (state.posts || []).map(post => String(post.id) === String(id) ? Object.assign({}, post, { reposts: count, repost_count: count }) : post);
                render();
                window.showToast('Reposted.');
            } else {
                window.showToast(response.data || 'Could not repost.', 'error');
            }
        }).fail(function(xhr) {
            window.showToast((xhr.responseJSON && xhr.responseJSON.data) ? xhr.responseJSON.data : 'Could not repost.', 'error');
        });
    };

    window.cvSharePost = (id) => {
        const shareUrl = window.location.href.split('#')[0] + '#post-' + encodeURIComponent(id);
        if (navigator.share) {
            navigator.share({ title: 'Faith In post', url: shareUrl }).catch(function() {});
        }
        if (authRequired() && !state.isLoggedIn) {
            window.showToast('Please sign in to count your share.', 'info');
            openAuthPanel('signin');
            return;
        }
        ajaxRequest('cv_share_post', { post_id: id }).done(function(response) {
            if (response.success) {
                const payload = response.data || {};
                const count = Number(payload.share_count || 0);
                state.posts = (state.posts || []).map(post => String(post.id) === String(id) ? Object.assign({}, post, { shares: count, share_count: count }) : post);
                render();
            } else {
                window.showToast(response.data || 'Could not update share count.', 'error');
            }
        }).fail(function(xhr) {
            window.showToast((xhr.responseJSON && xhr.responseJSON.data) ? xhr.responseJSON.data : 'Could not update share count.', 'error');
        });
    };

    window.publishPost = () => {
        if (state.isPublishingPost || state.isUploading) return;
        if (authRequired() && !state.isLoggedIn) {
            window.showToast('Please sign in before publishing.', 'info');
            openAuthPanel('signin');
            return;
        }
        if (state.postType === 'Article') {
            if (!state.postTitle.trim()) {
                window.showToast('Please add an article title.', 'info');
                return;
            }
            if (!state.postAuthorName.trim()) {
                window.showToast('Please add the author name.', 'info');
                return;
            }
        }
        // Capture file inputs before setState(), because render() replaces the DOM and clears file input values.
        const coverInputBeforeRender = document.getElementById('post-cover-image');
        const inputFiles = coverInputBeforeRender && coverInputBeforeRender.files ? Array.from(coverInputBeforeRender.files) : [];
        const postMediaFiles = (state.selectedPostMediaFiles && state.selectedPostMediaFiles.length) ? state.selectedPostMediaFiles : inputFiles;
        const coverFile = (state.selectedPostCoverFile || postMediaFiles[0] || null);
        const hasSelectedMedia = !!(postMediaFiles && postMediaFiles.length);
        const hasStagedMedia = !!(state.stagedPostMedia && state.stagedPostMedia.length);
        const isBlessingPublish = state.postType === 'Blessing' || state.createIntent === 'blessing';
        const hasBlessingMusicChoice = !!(state.selectedBlessingMusicFile || state.selectedBlessingPresetMusic || state.blessingMusicPreviewUrl);
        if (hasSelectedMedia && (state.postMediaUploadInProgress || !state.postMediaServerReady || !hasStagedMedia)) {
            window.showToast('Please wait until media upload reaches 100% before publishing.', 'info');
            return;
        }
        if (!state.postContent.trim() && state.postType !== 'Article' && !(postMediaFiles && postMediaFiles.length) && !(isBlessingPublish && hasBlessingMusicChoice)) {
            window.showToast('Please write something, add photos / a Reel, or choose Blessing music.', 'info');
            return;
        }
        if (!state.postContent.trim() && state.postType === 'Article') {
            window.showToast('Please write your article.', 'info');
            return;
        }

        setState({ isPublishingPost: true, publishProgress: 0, publishStatus: 'Preparing your post...' });
        startPublishProgress('Preparing your post...');

        const formData = new FormData();
        formData.append('action', 'cv_create_post');
        formData.append('nonce', cv_ajax.nonce);
        formData.append('type', state.postType.toLowerCase());
        formData.append('content', state.postContent);
        formData.append('title', state.postTitle);
        formData.append('excerpt', isBlessingPublish ? cvNormalizeBlessingBgColor(state.blessingBgColor) : state.postExcerpt);
        formData.append('contributor_name', state.postAuthorName);
        formData.append('contributor_role', state.postAuthorRole);
        formData.append('contributor_church', state.postAuthorChurch);
        formData.append('contributor_ministry', state.postAuthorMinistry);
        formData.append('allow_download', state.postAllowDownload ? '1' : '0');
        formData.append('post_visibility', cvNormalizePostVisibility(state.postVisibility));
        if (isBlessingPublish && state.selectedBlessingMusicFile) {
            formData.append('blessing_music', state.selectedBlessingMusicFile);
            formData.append('blessing_music_name', state.selectedBlessingMusicName || state.selectedBlessingMusicFile.name || 'Christian music');
        } else if (isBlessingPublish && state.selectedBlessingPresetMusic) {
            formData.append('blessing_preset_music', state.selectedBlessingPresetMusic);
            formData.append('blessing_music_name', state.selectedBlessingMusicName || 'Christian music');
        }

        if (state.stagedPostMedia && state.stagedPostMedia.length) {
            formData.append('staged_media', JSON.stringify(state.stagedPostMedia));
            formData.append('post_media_type', state.postMediaMode || 'gallery');
        } else if (postMediaFiles && postMediaFiles.length) {
            postMediaFiles.slice(0, 10).forEach(file => formData.append('post_media[]', file));
            formData.append('post_media_type', state.postMediaMode || (postMediaFiles[0] && /^video\//i.test(postMediaFiles[0].type || '') ? 'reel' : 'gallery'));
        } else if (coverFile) {
            formData.append('cover_image', coverFile);
        }

        $.ajax({
            url: cv_ajax.ajax_url,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            xhr: function() {
                const xhr = $.ajaxSettings.xhr();
                if (xhr.upload) {
                    xhr.upload.addEventListener('progress', function(evt) {
                        if (evt.lengthComputable) {
                            const pct = 12 + ((evt.loaded / evt.total) * 78);
                            updatePublishProgress(pct, 'Uploading content...');
                            if (evt.loaded >= evt.total) startServerFinishProgress('Processing and saving your post...');
                        }
                    }, false);
                }
                return xhr;
            }
        }).done(function(response) {
            if (response.success) {
                updatePublishProgress(94, (state.postType === 'Blessing' || state.createIntent === 'blessing') ? 'Saving to Blessings...' : 'Saving to the community feed...');
                const publishedPostType = state.postType;
                const clearForm = function() {
                    setState({
                        postTitle: '', postExcerpt: '', postContent: '', postType: 'Text', createIntent: 'post', blessingBgColor: 'blue',
                        selectedBlessingMusicFile: null, selectedBlessingMusicName: '', selectedBlessingPresetMusic: '', blessingMusicPreviewUrl: '',
                        postAuthorName: '', postAuthorRole: '', postAuthorChurch: '', postAuthorMinistry: '',
                        selectedPostCoverName: '', selectedPostCoverFile: null, postCoverPreviewUrl: '', selectedPostMediaFiles: [], postMediaPreviewUrls: [], postMediaMode: 'none', postMediaReadyPercent: 0, postMediaReadyStatus: '',
        postMediaUploadInProgress: false,
        postMediaServerReady: false,
        stagedPostMedia: [], postAllowDownload: true, postVisibility: 'public', tab: 'home'
                    });
                    const coverEl = document.getElementById('post-cover-image');
                    if (coverEl) coverEl.value = '';
                    const musicEl = document.getElementById('blessing-music-input');
                    if (musicEl) musicEl.value = '';
                    const isBlessing = publishedPostType === 'Blessing';
                    showPublishNotification(isBlessing ? 'Blessing shared' : 'Published to Faith In', publishedPostType === 'Article' ? 'Article published successfully!' : (isBlessing ? 'Blessing shared successfully!' : 'Post shared successfully!'), 'success');
                    loadPosts();
                };
                finishPublishProgress('Published successfully.', clearForm);
            } else {
                failPublishProgress(response.data || 'Could not publish right now.');
            }
        }).fail(function(xhr) {
            const msg = (xhr.responseJSON && xhr.responseJSON.data) ? xhr.responseJSON.data : 'Could not publish right now.';
            failPublishProgress(msg);
        });
    };

    window.publishResource = () => {
        if (state.isUploading || state.isPublishingPost) return;
        if (authRequired() && !state.isLoggedIn) {
            window.showToast('Please sign in before publishing.', 'info');
            openAuthPanel('signin');
            return;
        }
        if (!state.resTitle.trim()) {
            window.showToast('Please provide a title.', 'info');
            return;
        }
        if (!state.contributorName.trim()) {
            window.showToast('Please enter your name.', 'info');
            return;
        }

        // Capture file inputs before setState(), because render() replaces the DOM and clears file input values.
        const fileInput = document.getElementById('resource-file');
        const thumbInputBeforeRender = document.getElementById('resource-thumbnail');
        const file = (state.selectedResourceFile || (fileInput && fileInput.files && fileInput.files[0])) || null;
        const thumbFile = (state.selectedThumbnailFile || (thumbInputBeforeRender && thumbInputBeforeRender.files && thumbInputBeforeRender.files[0])) || null;

        if (!file) {
            window.showToast('Please select a file to upload.', 'info');
            return;
        }

        setState({ isUploading: true, publishProgress: 0, publishStatus: 'Preparing your resource...' });
        startPublishProgress('Preparing your resource...');

        const formData = new FormData();
        formData.append('action', 'cv_upload_resource');
        formData.append('nonce', cv_ajax.nonce);
        formData.append('title', state.resTitle);
        formData.append('description', 'Newly uploaded resource');
        formData.append('category', state.resCategory);
        formData.append('format', state.resFormat);
        formData.append('contributor_name', state.contributorName);
        formData.append('contributor_role', state.contributorRole);
        formData.append('contributor_church', state.contributorChurch);
        formData.append('contributor_ministry', state.contributorMinistry);
        formData.append('userName', state.contributorName);
        formData.append('role', state.contributorRole);
        formData.append('church', state.contributorChurch);
        formData.append('ministry', state.contributorMinistry);
        formData.append('file', file);

        if (thumbFile) formData.append('thumbnail', thumbFile);

        $.ajax({
            url: cv_ajax.ajax_url,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            xhr: function() {
                const xhr = $.ajaxSettings.xhr();
                if (xhr.upload) {
                    xhr.upload.addEventListener('progress', function(evt) {
                        if (evt.lengthComputable) {
                            const pct = 10 + ((evt.loaded / evt.total) * 82);
                            updatePublishProgress(pct, 'Uploading resource...');
                            if (evt.loaded >= evt.total) startServerFinishProgress('Uploading to Drive and preparing thumbnail...');
                        }
                    }, false);
                }
                return xhr;
            }
        }).done(function(response) {
            if (response.success) {
                updatePublishProgress(99, 'Finalizing resource card...');
                const uploadedPreview = state.thumbnailPreviewUrl || '';
                const returnedResource = response.data && response.data.resource ? response.data.resource : null;
                if (returnedResource && uploadedPreview && !returnedResource.image_url) returnedResource.image_url = uploadedPreview;
                const nextResources = returnedResource ? [returnedResource].concat((state.resources || []).filter(function(r) { return String(r.id) !== String(returnedResource.id); })) : state.resources;
                setState({
                    resources: nextResources,
                    resTitle: '', contributorName: '', contributorRole: '', contributorChurch: '', contributorMinistry: '',
                    selectedFileName: '', selectedResourceFile: null, selectedThumbnailName: '', selectedThumbnailFile: null, thumbnailPreviewUrl: '',
                    exploreSort: 'Newest'
                });
                cvClearResourceDraft();
                const fileNameDisplay = document.getElementById('file-name-display');
                if (fileNameDisplay) fileNameDisplay.textContent = 'No file selected';
                const thumbNameDisplay = document.getElementById('thumbnail-name-display');
                if (thumbNameDisplay) thumbNameDisplay.textContent = 'No custom thumbnail selected';
                finishPublishProgress('Resource published successfully.', function() {
                    const msg = (response.data && response.data.message) ? response.data.message : 'Resource published successfully!';
                    showPublishNotification('Resource published', msg, (response.data && response.data.drive_warning) ? 'info' : 'success');
                    setState({ tab: 'explore' });
                    setTimeout(function() { if (uploadedPreview) URL.revokeObjectURL(uploadedPreview); }, 3000);
                    loadResources();
                });
            } else {
                failPublishProgress(response.data || 'Upload failed.');
            }
        }).fail(function(xhr) {
            const msg = xhr && xhr.responseText ? xhr.responseText.replace(/<[^>]*>/g, '').slice(0, 180) : 'Upload failed. Check file size and server upload limits.';
            failPublishProgress(msg);
        });
    };

    window.submitPrayer = () => {
        const input = document.getElementById('prayer-input').value;
        const isUrgent = document.getElementById('urgent-checkbox').checked;

        if (input.trim()) {
            ajaxRequest('cv_create_prayer', {
                content: input.trim(),
                urgent: isUrgent ? 1 : 0
            }).done(function(response) {
                if (response.success) {
                    setState({ modal: { isOpen: false, type: null, data: null } });
                    window.showToast('Prayer request shared.');
                    loadPrayers();
                } else {
                    window.showToast(response.data, 'error');
                }
            });
        }
    };

    window.setCreateMode = (createMode) => {
        if (createMode === 'resource') {
            const draft = cvReadResourceDraft();
            setState(Object.assign({ createMode: 'resource' }, draft || {}));
            if (draft) window.setTimeout(function() { window.showToast('Your saved resource draft was restored.', 'info'); }, 50);
            return;
        }
        setState({ createMode: 'post' });
    };
    window.cvTogglePostEmojiPicker = () => setState({ showPostEmojiPicker: !state.showPostEmojiPicker });
    window.cvInsertPostEmoji = (index) => {
        const emoji = CV_POST_EMOJIS[parseInt(index, 10)];
        if (!emoji) return;
        const textarea = document.getElementById('post-content-textarea');
        const content = String(state.postContent || '');
        const start = textarea && Number.isInteger(textarea.selectionStart) ? textarea.selectionStart : content.length;
        const end = textarea && Number.isInteger(textarea.selectionEnd) ? textarea.selectionEnd : start;
        const nextContent = content.slice(0, start) + emoji + content.slice(end);
        const nextCaret = start + emoji.length;
        setState({ postContent: nextContent, showPostEmojiPicker: false });
        window.requestAnimationFrame(function() {
            const nextTextarea = document.getElementById('post-content-textarea');
            if (!nextTextarea) return;
            nextTextarea.focus();
            if (nextTextarea.setSelectionRange) nextTextarea.setSelectionRange(nextCaret, nextCaret);
        });
    };
    window.cvPostingOpenMedia = (kind) => {
        const input = document.getElementById('post-cover-image');
        if (!input) return;
        const keepBlessingType = state.createIntent === 'blessing' || state.postType === 'Blessing';
        if (kind === 'reel') {
            input.accept = 'video/*,.mp4,.m4v,.mov,.qt,.webm,.ogv';
            input.multiple = false;
            state.postType = keepBlessingType ? 'Blessing' : 'Video';
        } else {
            input.accept = 'image/*';
            input.multiple = true;
            state.postType = keepBlessingType ? 'Blessing' : 'Image';
        }
        input.click();
    };
    window.cvPostingClearMedia = () => {
        const input = document.getElementById('post-cover-image');
        if (input) {
            input.value = '';
            window.updatePostCoverName(input);
        }
    };
    window.cvPostingOpenBlessingMusic = () => {
        const input = document.getElementById('blessing-music-input');
        if (!input) return;
        input.accept = 'audio/*,.mp3,.m4a,.aac,.wav,.ogg,.oga,.opus';
        input.click();
    };
    window.cvFocusBlessingMusicPanel = () => {
        const panel = document.querySelector('.cv-blessing-music-panel');
        if (panel && panel.scrollIntoView) {
            panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
            panel.classList.add('cv-blessing-music-panel--focus');
            window.setTimeout(() => panel.classList.remove('cv-blessing-music-panel--focus'), 900);
        }
    };
    window.cvRemoveBlessingMusic = () => {
        const input = document.getElementById('blessing-music-input');
        if (input) input.value = '';
        if (state.blessingMusicPreviewUrl && String(state.blessingMusicPreviewUrl).indexOf('blob:') === 0) {
            try { URL.revokeObjectURL(state.blessingMusicPreviewUrl); } catch (e) {}
        }
        setState({ selectedBlessingMusicFile: null, selectedBlessingMusicName: '', selectedBlessingPresetMusic: '', blessingMusicPreviewUrl: '' });
    };
    window.updateBlessingMusicName = (input) => {
        const file = input && input.files && input.files[0] ? input.files[0] : null;
        if (state.blessingMusicPreviewUrl && String(state.blessingMusicPreviewUrl).indexOf('blob:') === 0) {
            try { URL.revokeObjectURL(state.blessingMusicPreviewUrl); } catch (e) {}
        }
        if (!file) {
            setState({ selectedBlessingMusicFile: null, selectedBlessingMusicName: '', selectedBlessingPresetMusic: '', blessingMusicPreviewUrl: '' });
            return;
        }
        const ext = (String(file.name || '').split('.').pop() || '').toLowerCase();
        const isAudio = /^audio\//i.test(file.type || '') || ['mp3','m4a','aac','wav','ogg','oga','opus'].includes(ext);
        if (!isAudio) {
            input.value = '';
            window.showToast('Please choose an audio file for Christian music: MP3, M4A, AAC, WAV, OGG, or OPUS.', 'error');
            setState({ selectedBlessingMusicFile: null, selectedBlessingMusicName: '', selectedBlessingPresetMusic: '', blessingMusicPreviewUrl: '' });
            return;
        }
        const previewUrl = URL.createObjectURL(file);
        setState({
            selectedBlessingMusicFile: file,
            selectedBlessingMusicName: cvNormalizeBlessingMusicName(file.name),
            selectedBlessingPresetMusic: '',
            blessingMusicPreviewUrl: previewUrl,
            postType: 'Blessing',
            createIntent: 'blessing'
        });
    };
    window.cvSelectBlessingPresetMusic = (presetId) => {
        const preset = cvGetBlessingPresetMusic(presetId);
        if (!preset) return;
        const input = document.getElementById('blessing-music-input');
        if (input) input.value = '';
        if (state.blessingMusicPreviewUrl && String(state.blessingMusicPreviewUrl).indexOf('blob:') === 0) {
            try { URL.revokeObjectURL(state.blessingMusicPreviewUrl); } catch (e) {}
        }
        setState({
            selectedBlessingMusicFile: null,
            selectedBlessingMusicName: preset.title,
            selectedBlessingPresetMusic: preset.id,
            blessingMusicPreviewUrl: cvBlessingPresetMusicUrl(preset),
            postType: 'Blessing',
            createIntent: 'blessing'
        });
    };
    window.cvPostingSetPostType = (type) => setState({ postType: type, createIntent: type === 'Blessing' ? 'blessing' : 'post' });
    window.updateFileName = (input) => {
        const file = input.files && input.files[0] ? input.files[0] : null;
        const name = file ? file.name : '';
        state.selectedResourceFile = file;
        state.selectedFileName = name;
        const display = document.getElementById('file-name-display');
        if (display) display.textContent = name || 'No file selected';
    };
    function uploadPostMediaToServer(files, mediaMode) {
        if (!files || !files.length) return;
        const formData = new FormData();
        formData.append('action', 'cv_stage_post_media');
        formData.append('nonce', cv_ajax.nonce);
        formData.append('title', state.postTitle || 'Faith In post media');
        formData.append('allow_download', state.postAllowDownload ? '1' : '0');
        formData.append('post_visibility', cvNormalizePostVisibility(state.postVisibility));
        files.slice(0, 10).forEach(file => formData.append('post_media[]', file));
        setState({
            postMediaUploadInProgress: true,
            postMediaServerReady: false,
            postMediaReadyPercent: 0,
            postMediaReadyStatus: 'Starting upload to server...',
            stagedPostMedia: []
        });
        $.ajax({
            url: cv_ajax.ajax_url,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            xhr: function() {
                const xhr = $.ajaxSettings.xhr();
                if (xhr.upload) {
                    xhr.upload.addEventListener('progress', function(evt) {
                        if (evt.lengthComputable) {
                            const pct = Math.max(1, Math.min(90, Math.round((evt.loaded / evt.total) * 90)));
                            setState({ postMediaReadyPercent: pct, postMediaReadyStatus: 'Uploading to server... ' + pct + '%' });
                        }
                    }, false);
                }
                return xhr;
            }
        }).done(function(response) {
            if (response && response.success && response.data && response.data.media_items) {
                setState({
                    postMediaUploadInProgress: false,
                    postMediaServerReady: true,
                    stagedPostMedia: response.data.media_items || [],
                    postMediaMode: response.data.media_type || mediaMode || state.postMediaMode,
                    postMediaReadyPercent: 100,
                    postMediaReadyStatus: '100% uploaded. Fast preview is ready. You can publish now.'
                });
                window.showToast('Media upload 100% complete. You can publish now.', 'success');
            } else {
                const msg = (response && response.data) ? response.data : 'Server upload failed.';
                setState({ postMediaUploadInProgress: false, postMediaServerReady: false, postMediaReadyPercent: 0, postMediaReadyStatus: '' });
                window.showToast(msg, 'error');
            }
        }).fail(function(xhr) {
            const msg = (xhr.responseJSON && xhr.responseJSON.data) ? xhr.responseJSON.data : 'Server upload failed. Please try again.';
            setState({ postMediaUploadInProgress: false, postMediaServerReady: false, stagedPostMedia: [], postMediaReadyPercent: 0, postMediaReadyStatus: '' });
            window.showToast(msg, 'error');
        });
    }

    window.updatePostCoverName = (input) => {
        const files = Array.from((input && input.files) ? input.files : []);
        const cleanup = () => {
            (state.postMediaPreviewUrls || []).forEach(item => { if (item && item.url) URL.revokeObjectURL(item.url); });
            if (state.postCoverPreviewUrl) URL.revokeObjectURL(state.postCoverPreviewUrl);
        };
        if (!files.length) {
            cleanup();
            state.selectedPostCoverFile = null;
            state.selectedPostCoverName = '';
            state.postCoverPreviewUrl = '';
            state.selectedPostMediaFiles = [];
            state.postMediaPreviewUrls = [];
            state.postMediaMode = 'none';
            state.postMediaReadyPercent = 0;
            state.postMediaReadyStatus = '';
            state.postMediaUploadInProgress = false;
            state.postMediaServerReady = false;
            state.stagedPostMedia = [];
            render();
            return;
        }
        const getFileExt = (file) => { const name = (file && file.name) ? file.name : ''; const parts = name.toLowerCase().split('.'); return parts.length > 1 ? parts.pop() : ''; };
        const isVideoFile = (file) => /^video\//i.test(file.type || '') || ['mp4','m4v','mov','qt','webm','ogv'].includes(getFileExt(file));
        const isImageFile = (file) => /^image\//i.test(file.type || '') || ['jpg','jpeg','jpe','png','gif','webp','heic','heif'].includes(getFileExt(file));
        const videos = files.filter(file => isVideoFile(file));
        const images = files.filter(file => isImageFile(file));
        if (videos.length && images.length) {
            input.value = '';
            window.showToast('Choose either up to 10 photos or one Reel video, not both.', 'error');
            return;
        }
        if (videos.length > 1) {
            input.value = '';
            window.showToast('Only one Reel video is allowed.', 'error');
            return;
        }
        if (!videos.length && !images.length) {
            input.value = '';
            window.showToast('Supported media: up to 10 images, or one Reel video in MP4, MOV, M4V, WEBM, or OGV format.', 'error');
            return;
        }
        if (videos.length === 1) {
            const videoFile = videos[0];
            cleanup();
            const previewUrl = URL.createObjectURL(videoFile);
            state.selectedPostCoverFile = videoFile;
            state.selectedPostCoverName = videoFile.name;
            state.postCoverPreviewUrl = previewUrl;
            state.selectedPostMediaFiles = [videoFile];
            state.postMediaPreviewUrls = [{ url: previewUrl, type: 'video', name: videoFile.name }];
            state.postMediaMode = 'reel';
            state.postMediaReadyPercent = 0;
            state.postMediaReadyStatus = 'Waiting to upload...';
            state.postMediaUploadInProgress = false;
            state.postMediaServerReady = false;
            state.stagedPostMedia = [];
            render();
            uploadPostMediaToServer([videoFile], 'reel');
            return;
        }
        if (images.length > 10) {
            window.showToast('Only the first 10 images were selected.', 'info');
        }
        const selected = images.slice(0, 10);
        cleanup();
        const previews = selected.map(file => ({ url: URL.createObjectURL(file), type: 'image', name: file.name }));
        state.selectedPostCoverFile = selected[0] || null;
        state.selectedPostCoverName = selected.length ? `${selected.length} image${selected.length > 1 ? 's' : ''} selected` : '';
        state.postCoverPreviewUrl = previews[0] ? previews[0].url : '';
        state.selectedPostMediaFiles = selected;
        state.postMediaPreviewUrls = previews;
        state.postMediaMode = selected.length > 1 ? 'gallery' : (selected.length ? 'image' : 'none');
        state.postMediaReadyPercent = selected.length ? 0 : 0;
        state.postMediaReadyStatus = selected.length ? 'Waiting to upload...' : '';
        state.postMediaUploadInProgress = false;
        state.postMediaServerReady = false;
        state.stagedPostMedia = [];
        render();
        if (selected.length) uploadPostMediaToServer(selected, state.postMediaMode);
    };
    window.updateThumbnailName = (input) => {
        const file = input.files && input.files[0] ? input.files[0] : null;
        state.selectedThumbnailFile = file;
        state.selectedThumbnailName = file ? file.name : '';
        if (state.thumbnailPreviewUrl) URL.revokeObjectURL(state.thumbnailPreviewUrl);
        state.thumbnailPreviewUrl = file ? URL.createObjectURL(file) : '';
        const display = document.getElementById('thumbnail-name-display');
        if (display) display.textContent = state.selectedThumbnailName || 'No custom thumbnail selected';
        const preview = document.getElementById('thumbnail-preview');
        if (preview) {
            preview.innerHTML = state.thumbnailPreviewUrl ? `<img src="${state.thumbnailPreviewUrl}" class="w-full h-full object-cover" alt="Thumbnail preview" />` : '<i data-lucide="image" class="w-8 h-8 opacity-40"></i>';
            if(window.lucide) lucide.createIcons();
        }
    };
    function cvIsPostingPublishDisabled() {
        const mediaCount = (state.selectedPostMediaFiles || []).length;
        const hasMedia = mediaCount > 0;
        const mediaReadyPercent = hasMedia ? Math.max(0, Math.min(100, parseInt(state.postMediaReadyPercent || 0, 10))) : 0;
        const mediaReady = !hasMedia || mediaReadyPercent >= 100;
        const needsUploadedMedia = !!(state.selectedPostMediaFiles && state.selectedPostMediaFiles.length);
        const stagedReady = !needsUploadedMedia || (!!state.postMediaServerReady && !!(state.stagedPostMedia && state.stagedPostMedia.length));
        return state.isPublishingPost || state.postMediaUploadInProgress || !mediaReady || !stagedReady || (!String(state.postContent || '').trim() && !hasMedia && state.postType !== 'Article') || (state.postType === 'Article' && !String(state.postContent || '').trim());
    }

    function cvSyncPostingPublishState() {
        const btn = document.querySelector('[data-cv-posting-publish-btn="1"], .cv-posting-publish-btn');
        if (!btn) return;
        btn.disabled = cvIsPostingPublishDisabled();
    }

    window.updatePostForm = (field, val) => {
        state[field] = val;
        if (['postContent', 'postTitle', 'postExcerpt', 'postAllowDownload', 'blessingBgColor'].includes(field)) {
            cvSyncPostingPublishState();
        }
    };

    window.setPostVisibility = (visibility) => {
        const nextVisibility = cvNormalizePostVisibility(visibility);
        setState({ postVisibility: nextVisibility });
    };
    window.setPrayerFilter = (val) => setState({ prayerFilter: val });
    window.handleBibleSearch = (val) => setState({ bibleSearch: val });
    window.setBibleTopic = (val) => setState({ bibleTopic: val });
    window.saveAccountSettings = (nextSettings) => {
        const merged = { ...state.settings, ...nextSettings };
        setState({ settings: merged });
        if (!state.isLoggedIn) return;
        ajaxRequest('cv_update_user_settings', merged).done(function(response) {
            if (response.success) {
                setState({ settings: response.data.settings || merged });
                window.showToast('Settings saved.');
            } else {
                window.showToast(response.data || 'Could not save settings.', 'error');
            }
        }).fail(function(xhr) {
            window.showToast((xhr.responseJSON && xhr.responseJSON.data) ? xhr.responseJSON.data : 'Could not save settings.', 'error');
        });
    };
    window.cvApplyDarkClass = (isDarkMode) => {
        document.documentElement.classList.toggle('dark', !!isDarkMode);
        if (document.body) document.body.classList.toggle('dark', !!isDarkMode);
    };
    window.toggleTheme = () => {
        const nextTheme = state.settings.theme === 'dark' ? 'light' : 'dark';
        window.cvApplyDarkClass(nextTheme === 'dark');
        document.querySelectorAll('[data-cv-setting-value="theme"]').forEach(el => { el.textContent = nextTheme === 'dark' ? 'On' : 'Off'; });
        window.saveAccountSettings({ theme: nextTheme });
    };
    window.toggleSettingNotifs = () => {
        const nextNotifications = !state.settings.notifications;
        document.querySelectorAll('[data-cv-setting-value="notifications"]').forEach(el => { el.textContent = nextNotifications ? 'On' : 'Off'; });
        window.saveAccountSettings({ notifications: nextNotifications });
    };
    window.updateAccountLanguage = (lang) => {
        const nextLang = ['English', 'Khmer'].includes(lang) ? lang : 'English';
        window.saveAccountSettings({ lang: nextLang });
    };
    window.cvOpenLogoutModal = () => {
        const existing = document.querySelector('.cv-logout-modal-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.className = 'cv-logout-modal-overlay cv-logout-modal-open';
        overlay.innerHTML = `
            <div class="cv-logout-modal-backdrop" data-cv-logout-close="1"></div>
            <div class="cv-logout-modal-dialog cv-logout-modal-open" role="dialog" aria-modal="true" aria-labelledby="cv-logout-title">
                <h2 id="cv-logout-title" class="cv-logout-modal-title">faithin.co says</h2>
                <p class="cv-logout-modal-body">Are you sure you want to log out?</p>
                <div class="cv-logout-modal-actions">
                    <button type="button" class="cv-logout-btn cv-logout-btn-cancel" data-cv-logout-close="1">Cancel</button>
                    <button type="button" class="cv-logout-btn cv-logout-btn-ok" data-cv-logout-ok="1">OK</button>
                </div>
            </div>
        `;

        const close = () => {
            overlay.classList.remove('cv-logout-modal-open');
            overlay.classList.add('cv-logout-modal-closed');
            const dialog = overlay.querySelector('.cv-logout-modal-dialog');
            if (dialog) {
                dialog.classList.remove('cv-logout-modal-open');
                dialog.classList.add('cv-logout-modal-closed');
            }
            setTimeout(() => overlay.remove(), 200);
        };

        overlay.addEventListener('click', (event) => {
            if (event.target && event.target.closest('[data-cv-logout-close]')) {
                close();
            }
            if (event.target && event.target.closest('[data-cv-logout-ok]')) {
                close();
                signOut();
            }
        });

        document.body.appendChild(overlay);
    };
    window.cvConfirmSignOut = () => {
        window.cvOpenLogoutModal();
    };
    window.cvApplyDarkClass(state.settings && state.settings.theme === 'dark');
    window.openArticle = (id) => { const post = state.posts.find(p => String(p.id) === String(id)); if (post) { setState({ modal: { isOpen: true, type: 'article', data: post } }); requestAnimationFrame(() => { const articleScroll = document.querySelector('#cv-root .cv-article-scroll'); if (articleScroll) articleScroll.scrollTo({ top: 0, behavior: 'smooth' }); }); } };
    window.openModal = (type, data = null) => { setState({ modal: { isOpen: true, type, data } }); requestAnimationFrame(() => { const activeScroll = document.querySelector('#cv-root .cv-article-scroll'); if (activeScroll) activeScroll.scrollTo({ top: 0, behavior: 'smooth' }); }); };
    window.closeModal = () => { setState({ modal: { isOpen: false, type: null, data: null } }); document.body.style.overflow = 'auto'; };


    window.updateProfileField = (field, val) => { state[field] = val; };
    window.openNameLocationIndustry = () => {
        setState({ profileSubTab: 'profile' });
        requestAnimationFrame(() => {
            const target = document.querySelector('[data-cv-profile-section="identity"]');
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    };
    window.setJobFilter = (jobFilter) => setState({ jobFilter });
    window.handleJobSearch = (jobSearch) => setState({ jobSearch });
    window.handleJobLocation = (jobLocation) => setState({ jobLocation });
    window.updateJobField = (field, value) => { state[field] = value; };
    window.openJobForm = () => {
        if (authRequired() && !state.isLoggedIn) {
            window.showToast('Please sign in before posting a job.', 'info');
            openAuthPanel('signin');
            return;
        }
        setState({ showJobForm: true, editingJobId: null, jobTitle: '', jobOrganization: '', jobLocationField: '', jobType: 'Full-time', jobDescription: '', jobApplyUrl: '', jobContactEmail: '' });
    };
    window.cancelJobForm = () => setState({ showJobForm: false, editingJobId: null });
    window.openJobDetails = (id) => {
        const job = (state.jobs || []).find(item => String(item.id) === String(id));
        if (!job) {
            window.showToast('That job is no longer available.', 'info');
            return;
        }
        setState({ selectedJob: job });
    };
    window.closeJobDetails = () => setState({ selectedJob: null });
    window.editJob = (id) => {
        const job = (state.jobs || []).find(j => String(j.id) === String(id));
        if (!job || !job.can_edit) {
            window.showToast('You can only edit your own job posts.', 'error');
            return;
        }
        setState({
            showJobForm: true,
            editingJobId: job.id,
            jobTitle: job.title || '',
            jobOrganization: job.organization || '',
            jobLocationField: job.location || '',
            jobType: job.job_type || 'Full-time',
            jobDescription: job.description || '',
            jobApplyUrl: job.apply_url || '',
            jobContactEmail: job.contact_email || ''
        });
    };
    window.submitJob = () => {
        if (authRequired() && !state.isLoggedIn) {
            window.showToast('Please sign in before posting a job.', 'info');
            openAuthPanel('signin');
            return;
        }
        if (!state.jobTitle.trim() || !state.jobOrganization.trim() || !state.jobDescription.trim()) {
            window.showToast('Please complete the job title, organization, and description.', 'info');
            return;
        }
        if (!state.jobApplyUrl.trim() && !state.jobContactEmail.trim()) {
            window.showToast('Please add an apply link or contact email.', 'info');
            return;
        }
        const payload = {
            title: state.jobTitle,
            organization: state.jobOrganization,
            location: state.jobLocationField,
            job_type: state.jobType,
            description: state.jobDescription,
            apply_url: state.jobApplyUrl,
            contact_email: state.jobContactEmail
        };
        const action = state.editingJobId ? 'cv_update_job' : 'cv_create_job';
        if (state.editingJobId) payload.job_id = state.editingJobId;
        ajaxRequest(action, payload).done(function(response) {
            if (response.success) {
                window.showToast(state.editingJobId ? 'Job updated successfully' : 'Job posted successfully');
                setState({ showJobForm: false, editingJobId: null, jobTitle: '', jobOrganization: '', jobLocationField: '', jobType: 'Full-time', jobDescription: '', jobApplyUrl: '', jobContactEmail: '' });
                loadJobs();
            } else {
                window.showToast(response.data || 'Could not save job.', 'error');
            }
        }).fail(function(xhr) {
            window.showToast((xhr.responseJSON && xhr.responseJSON.data) ? xhr.responseJSON.data : 'Could not save job.', 'error');
        });
    };
    window.deleteJob = (id) => {
        const job = (state.jobs || []).find(j => String(j.id) === String(id)) || {};
        openDeleteConfirm({
            title: 'Delete this job post?',
            itemLabel: job.title || 'Job post',
            message: 'Applicants will no longer be able to see this job post. This action cannot be undone.',
            confirmText: 'Delete job',
            onConfirm: function() {
                ajaxRequest('cv_delete_job', { job_id: id }).done(function(response) {
                    if (response.success) {
                        window.showToast('Job deleted successfully', 'success');
                        loadJobs();
                    } else {
                        window.showToast(response.data || 'Could not delete job.', 'error');
                    }
                }).fail(function(xhr) {
                    window.showToast((xhr.responseJSON && xhr.responseJSON.data) ? xhr.responseJSON.data : 'Could not delete job.', 'error');
                });
            }
        });
    };

    function cvReadResourceDraft() {
        try {
            const raw = window.localStorage ? window.localStorage.getItem(CV_RESOURCE_DRAFT_KEY) : '';
            const draft = raw ? JSON.parse(raw) : null;
            if (!draft || typeof draft !== 'object') return null;
            return {
                resTitle: String(draft.resTitle || '').slice(0, 300),
                resFormat: ['pdf', 'video', 'audio', 'image', 'zip'].includes(String(draft.resFormat || '').toLowerCase()) ? String(draft.resFormat).toLowerCase() : 'pdf',
                resCategory: String(draft.resCategory || 'Bible Study').slice(0, 100),
                contributorName: String(draft.contributorName || '').slice(0, 200),
                contributorRole: String(draft.contributorRole || '').slice(0, 200),
                contributorChurch: String(draft.contributorChurch || '').slice(0, 200),
                contributorMinistry: String(draft.contributorMinistry || '').slice(0, 200)
            };
        } catch (error) {
            return null;
        }
    }

    function cvClearResourceDraft() {
        try {
            if (window.localStorage) window.localStorage.removeItem(CV_RESOURCE_DRAFT_KEY);
        } catch (error) {}
    }

    window.cvSaveResourceDraft = () => {
        const draft = {
            resTitle: state.resTitle,
            resFormat: state.resFormat,
            resCategory: state.resCategory,
            contributorName: state.contributorName,
            contributorRole: state.contributorRole,
            contributorChurch: state.contributorChurch,
            contributorMinistry: state.contributorMinistry,
            savedAt: new Date().toISOString()
        };
        const meaningfulValues = [draft.resTitle, draft.contributorName, draft.contributorRole, draft.contributorChurch, draft.contributorMinistry];
        if (!meaningfulValues.some(value => String(value || '').trim())) {
            window.showToast('Add some resource details before saving a draft.', 'info');
            return;
        }
        try {
            if (!window.localStorage) throw new Error('Draft storage unavailable');
            window.localStorage.setItem(CV_RESOURCE_DRAFT_KEY, JSON.stringify(draft));
            window.showToast('Draft saved on this device. Choose the files again when you return.', 'success');
        } catch (error) {
            window.showToast('We could not save this draft on your device.', 'error');
        }
    };

    window.updateProfileCover = (input) => {
        const file = input.files && input.files[0] ? input.files[0] : null;
        if (file && !file.type.match(/^image\//)) {
            window.showToast('Please choose a real image file for your cover photo.', 'error');
            input.value = '';
            return;
        }
        state.selectedProfileCoverFile = file || null;
        state.selectedProfileCoverName = file ? file.name : '';
        if (state.profileCoverPreviewUrl) URL.revokeObjectURL(state.profileCoverPreviewUrl);
        state.profileCoverPreviewUrl = file ? URL.createObjectURL(file) : '';
        const coverNodes = document.querySelectorAll('[id="cv-profile-cover-preview"]');
        coverNodes.forEach((cover) => {
            cover.innerHTML = state.profileCoverPreviewUrl ? `<img src="${state.profileCoverPreviewUrl}" class="w-full h-full object-cover" alt="Cover preview" />` : '';
        });
        const labelNodes = document.querySelectorAll('[id="cv-profile-cover-name"]');
        labelNodes.forEach((label) => { label.textContent = state.selectedProfileCoverName || 'Current cover photo'; });
        setState({
            selectedProfileCoverFile: state.selectedProfileCoverFile,
            selectedProfileCoverName: state.selectedProfileCoverName,
            profileCoverPreviewUrl: state.profileCoverPreviewUrl
        });
        if (file) window.showToast('Cover selected. Click Save media to apply.', 'info');
    };

    window.updateProfileImage = (input) => {
        const file = input.files && input.files[0] ? input.files[0] : null;
        if (file && !file.type.match(/^image\//)) {
            window.showToast('Please choose a real image file for your profile photo.', 'error');
            input.value = '';
            return;
        }
        state.selectedProfileImageFile = file || null;
        state.selectedProfileImageName = file ? file.name : '';
        if (state.profileImagePreviewUrl) URL.revokeObjectURL(state.profileImagePreviewUrl);
        state.profileImagePreviewUrl = file ? URL.createObjectURL(file) : '';
        const preview = document.getElementById('cv-profile-editor-preview');
        if (preview) {
            preview.innerHTML = state.profileImagePreviewUrl ? `<img src="${state.profileImagePreviewUrl}" class="w-full h-full object-cover" alt="Profile preview" />` : renderProfileAvatar({ name: state.profileName || (state.currentUser && state.currentUser.name) || 'User' }, 'w-full h-full', 'text-2xl');
        }
        const label = document.getElementById('cv-profile-image-name');
        if (label) label.textContent = state.selectedProfileImageName || 'Current profile image';
        setState({
            selectedProfileImageFile: state.selectedProfileImageFile,
            selectedProfileImageName: state.selectedProfileImageName,
            profileImagePreviewUrl: state.profileImagePreviewUrl
        });
        if (file) window.showToast('Photo selected. Click Save media to apply.', 'info');
    };
    window.saveProfile = () => {
        if (!state.isLoggedIn) {
            openAuthPanel('signin');
            return;
        }
        if (state.isSavingProfile) return;
        const formData = new FormData();
        formData.append('action', 'cv_update_profile');
        formData.append('nonce', cv_ajax.nonce);
        formData.append('display_name', state.profileName || (state.currentUser && state.currentUser.name) || '');
        formData.append('gender', state.profileGender || '');
        formData.append('role', state.profileRole || '');
        formData.append('location', state.profileLocation || '');
        formData.append('industry', state.profileIndustry || '');
        formData.append('church', state.profileChurch || '');
        formData.append('ministry', state.profileMinistry || '');
        formData.append('bio', state.profileBio || '');
        if (state.selectedProfileImageFile) formData.append('profile_image', state.selectedProfileImageFile);
        if (state.selectedProfileCoverFile) formData.append('profile_cover', state.selectedProfileCoverFile);
        setState({ isSavingProfile: true });
        $.ajax({ url: cv_ajax.ajax_url, method: 'POST', data: formData, processData: false, contentType: false })
            .done(function(response) {
                if (response && response.success) {
                    const user = response.data && response.data.user ? response.data.user : null;
                    if (user) syncAuthUserIntoForms(user);
                    setState({
                        currentUser: user || state.currentUser,
                        isLoggedIn: true,
                        isSavingProfile: false,
                        selectedProfileImageFile: null,
                        selectedProfileImageName: '',
                        selectedProfileCoverFile: null,
                        selectedProfileCoverName: '',
                        profileImagePreviewUrl: '',
                        profileCoverPreviewUrl: ''
                    });
                    if (state.tab === 'home' && typeof loadPosts === 'function') {
                        loadPosts();
                    }
                    window.showToast('Success', 'success');
                } else {
                    setState({ isSavingProfile: false });
                    window.showToast('Try Again', 'error');
                }
            })
            .fail(function(xhr) {
                setState({ isSavingProfile: false });
                window.showToast('Try Again', 'error');
            });
    };

    function renderProfile() {
        const isDark = state.settings.theme === 'dark';
        const panel = isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900';
        const softPanel = isDark ? 'bg-slate-800/70 border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-900';
        const mutedText = isDark ? 'text-slate-300' : 'text-slate-500';
if (!state.isLoggedIn) {
    return renderUnifiedAuthCard();
}

const previewUser = { ...(state.currentUser || {}), name: state.profileName || (state.currentUser && state.currentUser.name) || 'User' };
        const previewHtml = state.profileImagePreviewUrl ? `<img src="${state.profileImagePreviewUrl}" class="w-full h-full object-cover" alt="Profile preview" />` : renderProfileAvatar(previewUser, 'w-full h-full', 'text-2xl');
        const currentCoverUrl = state.profileCoverPreviewUrl || (state.currentUser && state.currentUser.cover_url) || '';
        const coverHtml = currentCoverUrl ? `<img src="${safeImageUrl(currentCoverUrl, '')}" class="w-full h-full object-cover" alt="Profile cover" />` : `<img src="https://images.unsplash.com/photo-1519750783826-e2420f4d687f?q=80&w=800&auto=format&fit=crop" class="w-full h-full object-cover" alt="Profile cover" />`;
        const profileArticles = Array.isArray(state.profileArticles) ? state.profileArticles : [];
        const profileResources = Array.isArray(state.profileResources) ? state.profileResources : [];
        const followersCount = state.profileFollowersCount || 0;
        const followingCount = state.profileFollowingCount || 0;
        const profileDisplayName = state.profileName || (state.currentUser && state.currentUser.name) || 'Faith';
        const profileJoined = (state.currentUser && state.currentUser.joined) || 'Member';
        const profileSummary = [state.profileRole, state.profileIndustry, state.profileLocation, state.profileMinistry, state.profileChurch].filter(Boolean).join(' • ') || 'PROFILE / ME';
        const profileStrength = Math.min(100, 55 + (state.profileName ? 10 : 0) + (state.profileBio ? 15 : 0) + (state.profileLocation ? 10 : 0) + ((state.currentUser && state.currentUser.avatar_url) || state.profileImagePreviewUrl ? 5 : 0) + ((state.currentUser && state.currentUser.cover_url) || state.profileCoverPreviewUrl ? 5 : 0));
        const profileStrengthLabel = profileStrength >= 90 ? 'Complete' : (profileStrength >= 75 ? 'Strong' : 'Getting started');
        const ownedPostCount = (Array.isArray(state.posts) ? state.posts : []).filter(post => post && (post.can_edit || post.can_delete)).length;
        const active = state.profileSubTab || 'settings';
        const sideItem = (id, icon, label, danger = false) => {
            const shared = `cv-profile-side-button ${active === id ? 'cv-profile-side-button--active' : ''} ${isDark ? 'cv-profile-side-button--dark' : ''}`;
            if (danger) {
                return `<button type="button" onclick="cvConfirmSignOut()" class="${shared}"><i data-lucide="${icon}" class="w-5 h-5"></i><span>${label}</span></button>`;
            }
            return `<button type="button" onclick="setProfileSubTab('${id}')" class="${shared}"><i data-lucide="${icon}" class="w-5 h-5"></i><span>${label}</span></button>`;
        };

        const accountLang = ['English', 'Khmer'].includes(state.settings.lang) ? state.settings.lang : 'English';
        const accountStatusText = getVerificationSettingsLabel();
        const settingsCard = `<div class="cv-settings-ref ${isDark ? 'cv-settings-ref--dark' : ''}">
            <section class="cv-settings-ref-group">
                <h3 class="cv-settings-ref-heading">Profile information</h3>
                <button type="button" onclick="openNameLocationIndustry()" class="cv-settings-ref-row cv-settings-ref-row--button">
                    <span class="cv-settings-ref-label">Name, location, and industry</span>
                    <span class="cv-settings-ref-trailing"><i data-lucide="chevron-right" class="w-5 h-5"></i></span>
                </button>
                <button type="button" onclick="setProfileSubTab('profile')" class="cv-settings-ref-row cv-settings-ref-row--button">
                    <span class="cv-settings-ref-label">Personal profile info</span>
                    <span class="cv-settings-ref-trailing"><i data-lucide="chevron-right" class="w-5 h-5"></i></span>
                </button>
                <button type="button" onclick="openVerificationSettings()" class="cv-settings-ref-row cv-settings-ref-row--button">
                    <span class="cv-settings-ref-label">Verifications</span>
                    <span class="cv-settings-ref-trailing"><span class="cv-settings-ref-value">${escapeHtml(accountStatusText)}</span><i data-lucide="chevron-right" class="w-5 h-5"></i></span>
                </button>
            </section>

            <section class="cv-settings-ref-group">
                <h3 class="cv-settings-ref-heading">Display</h3>
                <button type="button" onclick="toggleTheme()" data-cv-setting-row="theme" class="cv-settings-ref-row cv-settings-ref-row--button">
                    <span class="cv-settings-ref-label">Dark mode</span>
                    <span class="cv-settings-ref-trailing"><span class="cv-settings-ref-value" data-cv-setting-value="theme">${state.settings.theme === 'dark' ? 'On' : 'Off'}</span><i data-lucide="chevron-right" class="w-5 h-5"></i></span>
                </button>
            </section>

            <section class="cv-settings-ref-group">
                <h3 class="cv-settings-ref-heading">General preferences</h3>
                <label class="cv-settings-ref-row cv-settings-ref-row--select">
                    <span class="cv-settings-ref-label">Language</span>
                    <span class="cv-settings-ref-trailing cv-settings-ref-trailing--select">
                        <select onchange="updateAccountLanguage(this.value)" aria-label="Select interface language" class="cv-settings-ref-select">
                            <option value="English" ${accountLang === 'English' ? 'selected' : ''}>English</option>
                            <option value="Khmer" ${accountLang === 'Khmer' ? 'selected' : ''}>Khmer</option>
                        </select>
                        <i data-lucide="chevron-right" class="w-5 h-5"></i>
                    </span>
                </label>
                <button type="button" onclick="toggleSettingNotifs()" data-cv-setting-row="notifications" class="cv-settings-ref-row cv-settings-ref-row--button">
                    <span class="cv-settings-ref-label">Notifications</span>
                    <span class="cv-settings-ref-trailing"><span class="cv-settings-ref-value" data-cv-setting-value="notifications">${state.settings.notifications ? 'On' : 'Off'}</span><i data-lucide="chevron-right" class="w-5 h-5"></i></span>
                </button>
            </section>

            <section class="cv-settings-ref-group">
                <h3 class="cv-settings-ref-heading">Security</h3>
                <button type="button" onclick="cvConfirmSignOut()" class="cv-settings-ref-row cv-settings-ref-row--button">
                    <span class="cv-settings-ref-label">Log out</span>
                    <span class="cv-settings-ref-trailing"><i data-lucide="chevron-right" class="w-5 h-5"></i></span>
                </button>
            </section>
        </div>`;

        const profileEditor = `<div class="cv-profile-edit-ref ${isDark ? 'cv-profile-edit-ref--dark' : ''}" data-cv-profile-section="identity">
            <div class="cv-profile-edit-ref-head">
                <div>
                    <p class="cv-profile-edit-kicker">Profile Details</p>
                    <h3 class="cv-profile-edit-title">Edit Profile</h3>
                    <p class="cv-profile-edit-subtitle">Update your profile details and photos.</p>
                </div>
                <button type="button" onclick="saveProfile()" ${state.isSavingProfile ? 'disabled' : ''} class="cv-profile-edit-save">${state.isSavingProfile ? 'Saving...' : 'Save changes'}</button>
            </div>
            <div class="cv-profile-edit-body">
                <div class="cv-profile-edit-cover-card">
                    <div id="cv-profile-cover-preview" class="cv-profile-edit-cover-preview">${coverHtml}</div>
                    <div class="cv-profile-edit-cover-footer">
                        <div>
                            <div class="cv-profile-edit-cover-title">Profile cover</div>
                            <div id="cv-profile-cover-name" class="cv-profile-edit-cover-name">${escapeHtml(state.selectedProfileCoverName || ((state.currentUser && state.currentUser.cover_url) ? 'Saved cover photo' : 'No custom cover photo'))}</div>
                        </div>
                        <input type="file" id="cv-profile-cover-input" class="hidden" accept="image/*" onchange="updateProfileCover(this)" />
                        <button type="button" onclick="document.getElementById('cv-profile-cover-input').click()" class="cv-profile-edit-outline-btn">Change cover</button>
                    </div>
                </div>
                <div class="cv-profile-edit-grid">
                    <div class="cv-profile-edit-field"><label>Display Name</label><input type="text" value="${escapeAttr(state.profileName)}" oninput="updateProfileField('profileName', this.value)" /></div>
                    <div class="cv-profile-edit-field"><label>Email</label><input type="text" value="${escapeAttr((state.currentUser && state.currentUser.email) || '')}" disabled /></div>
                    <div class="cv-profile-edit-field"><label>Location</label><input type="text" value="${escapeAttr(state.profileLocation)}" oninput="updateProfileField('profileLocation', this.value)" placeholder="City, country" /></div>
                    <div class="cv-profile-edit-field"><label>Industry</label><input type="text" value="${escapeAttr(state.profileIndustry)}" oninput="updateProfileField('profileIndustry', this.value)" placeholder="Love" /></div>
                    <div class="cv-profile-edit-field"><label>Role</label><input type="text" value="${escapeAttr(state.profileRole)}" oninput="updateProfileField('profileRole', this.value)" placeholder="Content creator, ministry lead..." /></div>
                    <div class="cv-profile-edit-field"><label>Church</label><input type="text" value="${escapeAttr(state.profileChurch)}" oninput="updateProfileField('profileChurch', this.value)" placeholder="Church name" /></div>
                    <div class="cv-profile-edit-field cv-profile-edit-field--wide"><label>Ministry</label><input type="text" value="${escapeAttr(state.profileMinistry)}" oninput="updateProfileField('profileMinistry', this.value)" placeholder="Ministry name" /></div>
                    <div class="cv-profile-edit-field cv-profile-edit-field--wide"><label>Bio</label><textarea oninput="updateProfileField('profileBio', this.value)" placeholder="Tell people about yourself">${escapeHtml(state.profileBio)}</textarea></div>
                </div>
            </div>
        </div>`;

        const dashboardContent = `<div class="cv-profile-dashboard">
            <div class="cv-profile-welcome-card">
                <div>
                    <h3>Welcome back, ${escapeHtml(profileDisplayName)}</h3>
                    <p>Here's what's happening with your profile today.</p>
                </div>
                <button type="button" onclick="cvOpenFeedCreate('text')" class="cv-profile-new-post"><i data-lucide="plus" class="w-5 h-5"></i><span>New Post</span></button>
            </div>
            <div class="cv-profile-metric-grid">
                <div class="cv-profile-metric-card">
                    <div class="cv-profile-metric-head"><span>Published posts</span><i data-lucide="file-text" class="w-5 h-5"></i></div>
                    <div class="cv-profile-metric-main"><strong>${ownedPostCount.toLocaleString()}</strong></div>
                </div>
                <div class="cv-profile-metric-card">
                    <div class="cv-profile-metric-head"><span>Connections</span><i data-lucide="users" class="w-5 h-5"></i></div>
                    <div class="cv-profile-metric-main"><strong>${followingCount.toLocaleString()}</strong></div>
                </div>
            </div>
            <div class="cv-profile-tools-block">
                <h3>Quick Tools</h3>
                <div class="cv-profile-tool-grid">
                    <button type="button" onclick="cvOpenFeedCreate('article')" class="cv-profile-tool-card"><i data-lucide="file-text"></i><span>Write Article</span></button>
                    <button type="button" onclick="setTab('explore')" class="cv-profile-tool-card"><i data-lucide="upload-cloud"></i><span>Upload Resource</span></button>
                    <button type="button" onclick="navigator.clipboard && navigator.clipboard.writeText(window.location.href); window.showToast && window.showToast('Profile link ready', 'success');" class="cv-profile-tool-card"><i data-lucide="share"></i><span>Share Profile</span></button>
                    <button type="button" onclick="navigator.clipboard && navigator.clipboard.writeText(window.location.href); window.showToast && window.showToast('Link copied', 'success');" class="cv-profile-tool-card"><i data-lucide="link-2"></i><span>Copy Link</span></button>
                </div>
            </div>
            <div class="cv-profile-activity-card">
                <div class="cv-profile-activity-head"><h3>Recent Activity</h3></div>
                <div class="cv-profile-activity-empty" role="status">
                    <span aria-hidden="true"><i data-lucide="sparkles"></i></span>
                    <div><strong>Your activity will appear here</strong><p>New posts, resources, and community milestones will be listed as they happen.</p></div>
                </div>
            </div>
        </div>`;

        let mainContent = dashboardContent;
        if (active === 'settings') mainContent = settingsCard;
        if (active === 'profile') mainContent = profileEditor;
        if (active === 'security') mainContent = `<div class="cv-profile-security-card"><div class="cv-settings-ref-heading">Security</div><h3>Account security</h3><p>Your account sign-in is handled securely.</p><button type="button" onclick="cvConfirmSignOut()">Log out</button></div>`;

        return `<div class="cv-profile-modern-page ${isDark ? 'cv-profile-modern-page--dark' : ''} animate-fade-in">
            <div class="cv-profile-modern-layout">
                <aside class="cv-profile-modern-card">
                    <div id="cv-profile-cover-preview" class="cv-profile-modern-cover">${coverHtml}</div>
                    <input type="file" id="cv-profile-cover-input" class="hidden" accept="image/*" onchange="updateProfileCover(this)" />
                    <div class="cv-profile-modern-avatar-wrap">
                        <div class="cv-profile-modern-avatar" id="cv-profile-editor-preview">${previewHtml}</div>
                        <input type="file" id="cv-profile-image-input" class="hidden" accept="image/*" onchange="updateProfileImage(this)" />
                    </div>
                    <div class="cv-profile-modern-media-actions">
                        <button type="button" onclick="document.getElementById('cv-profile-image-input').click()">Change photo</button>
                        <button type="button" onclick="document.getElementById('cv-profile-cover-input').click()">Change cover</button>
                        ${(state.selectedProfileImageFile || state.selectedProfileCoverFile) ? `<button type="button" onclick="saveProfile()" ${state.isSavingProfile ? 'disabled' : ''}>${state.isSavingProfile ? 'Saving...' : 'Save media'}</button>` : ''}
                    </div>
                    <div id="cv-profile-image-name" class="cv-profile-modern-save-text">${escapeHtml(state.selectedProfileImageName || ((state.currentUser && state.currentUser.avatar_url) ? 'Saved profile photo' : 'No custom profile photo'))}</div>
                    <div class="cv-profile-modern-name-row"><h2>${escapeHtml(profileDisplayName)}</h2>${renderVerificationBadge(state.currentUser, 'name')}</div>
                    <p class="cv-profile-modern-subtitle">${escapeHtml(profileSummary)}</p>
                    <div class="cv-profile-modern-follow-row">
                        <button type="button" onclick="cvOpenFollowList('followers')"><strong>${followersCount}</strong><span>${followersCount === 1 ? 'follower' : 'followers'}</span></button>
                        <button type="button" onclick="cvOpenFollowList('following')"><strong>${followingCount}</strong><span>${followingCount === 1 ? 'connection' : 'connections'}</span></button>
                    </div>
                    <div class="cv-profile-strength">
                        <div><span>Profile level: <b>${profileStrengthLabel}</b></span><strong></strong></div>
                        <div class="cv-profile-strength-track" role="progressbar" aria-label="Profile completeness" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${profileStrength}"><i style="width:${profileStrength}%"></i></div>
                    </div>
                    <div class="cv-profile-modern-menu">
                        ${sideItem('settings', 'settings', 'General Settings')}
                        ${sideItem('profile', 'user', 'Edit Profile')}
                        ${sideItem('security', 'lock', 'Security')}
                        ${sideItem('logout', 'log-out', 'Log out', true)}
                    </div>
                </aside>
                <section class="cv-profile-modern-main">
                    <div class="cv-profile-top-stats cv-profile-modern-top-stats">
                        <div class="cv-profile-top-stat ${isDark ? 'cv-profile-top-stat--dark' : ''}"><div class="cv-profile-top-stat__label">Articles</div><div class="cv-profile-top-stat__value">${profileArticles.length}</div></div>
                        <div class="cv-profile-top-stat ${isDark ? 'cv-profile-top-stat--dark' : ''}"><div class="cv-profile-top-stat__label">Resources</div><div class="cv-profile-top-stat__value">${profileResources.length}</div></div>
                        <div class="cv-profile-top-stat ${isDark ? 'cv-profile-top-stat--dark' : ''}"><div class="cv-profile-top-stat__label">Joined</div><div class="cv-profile-top-stat__value cv-profile-top-stat__value--small">${escapeHtml(profileJoined)}</div></div>
                    </div>
                    <div class="cv-profile-modern-tabs">
                        <button type="button" onclick="setProfileSubTab('account')" class="${active === 'account' ? 'is-active' : ''}">Overview</button>
                        <button type="button" onclick="setProfileSubTab('settings')" class="${active === 'settings' ? 'is-active' : ''}">Settings</button>
                    </div>
                    ${mainContent}
                </section>
            </div>
        </div>`;
    }

    // Rendering functions (adapted from original)
    function renderNav() {
        const isDark = state.settings.theme === 'dark';
        const desktopItems = [
            { id: 'home', label: 'Home', icon: 'home' },
            { id: 'explore', label: 'Library', icon: 'book-open' },
            { id: 'users', label: 'Network', icon: 'users' },
            { id: 'jobs', label: 'Jobs', icon: 'briefcase-business' }
        ];
        const mobileItems = [
            { id: 'home', label: 'Home', icon: 'home' },
            { id: 'explore', label: 'Library', icon: 'book-open' },
            { id: 'users', label: 'Network', icon: 'users' },
            { id: 'notifications', label: 'Alerts', icon: 'bell' },
            { id: 'menu', label: 'Menu', icon: 'menu' }
        ];
        const topNavTiles = state.isLoggedIn ? desktopItems.map(item => `
            <button type="button" data-cv-tab="${item.id}" onclick="setTab('${item.id}')" class="cv-top-nav-tile cv-nav-clean-item ${state.tab === item.id ? 'is-active' : ''}" aria-label="${item.label}" title="${item.label}">
                <i data-lucide="${item.icon}" class="cv-top-nav-icon"></i>
                <span class="cv-top-nav-label">${item.label}</span>
            </button>
        `).join('') : '';

        const mobileTiles = state.isLoggedIn ? mobileItems.map(item => {
            if (item.id === 'notifications') {
                return `<button type="button" onclick="document.querySelector('[data-cv-main-notification-toggle]')?.click()" class="cv-mobile-bottom-item" aria-label="Notifications"><i data-lucide="bell"></i><span>Alerts</span></button>`;
            }
            if (item.id === 'menu') {
                return `<button type="button" onclick="setTab('menu')" class="cv-mobile-bottom-item ${state.tab === 'menu' ? 'is-active' : ''}" aria-label="Menu"><i data-lucide="menu"></i><span>Menu</span></button>`;
            }
            const active = state.tab === item.id;
            return `<button type="button" onclick="setTab('${item.id}')" class="cv-mobile-bottom-item ${active ? 'is-active' : ''}" aria-label="${item.label}"><i data-lucide="${item.icon}"></i><span>${item.label}</span></button>`;
        }).join('') : '';

        const messageDesktop = state.isLoggedIn ? '<div id="cv-nav-message-slot-desktop" class="cv-nav-integrated-slot cv-nav-inline-slot cv-nav-message-slot cv-react-round-action-slot"></div>' : '';
        const messageMobile = state.isLoggedIn ? '<div id="cv-nav-message-slot-mobile" class="cv-nav-integrated-slot cv-nav-inline-slot cv-nav-message-slot cv-react-round-action-slot"></div>' : '';
        const notificationDesktop = state.isLoggedIn ? '<div id="cv-nav-notification-slot-desktop" class="cv-nav-integrated-slot cv-nav-inline-slot cv-react-round-action-slot"></div>' : '';
        const notificationMobile = state.isLoggedIn ? '<div id="cv-nav-notification-slot-mobile" class="cv-nav-integrated-slot cv-nav-inline-slot cv-react-round-action-slot"></div>' : '';
        const uploadButton = state.isLoggedIn ? `
            <button type="button" onclick="openUpload()" class="cv-upload-button cv-nav-clean-item cv-react-menu-action" aria-label="Upload">
                <i data-lucide="cloud-upload" class="w-4 h-4"></i>
                <span>Upload</span>
            </button>
        ` : '';
        const studioButton = state.isLoggedIn ? `
            <button type="button" onclick="setTab('bible')" class="cv-studio-button cv-nav-clean-item cv-react-menu-action" aria-label="Social Studio">
                <i data-lucide="layout-dashboard" class="w-4 h-4"></i>
                <span>Studio</span>
            </button>
        ` : '';
        const menuButton = state.isLoggedIn ? `
            <button type="button" onclick="setTab('menu')" class="cv-react-round-action cv-react-nav-menu-button ${state.tab === 'menu' ? 'is-active' : ''}" aria-label="Open all functions">
                <i data-lucide="menu"></i>
            </button>
        ` : '';
        const profileButtonMarkup = state.isLoggedIn ? `
            <button type="button" onclick="openProfile(); return false;" data-cv-profile-trigger="1" class="cv-react-profile-avatar-button" aria-label="Profile account">
                ${renderProfileAvatar(state.currentUser, 'w-full h-full', 'text-xs')}
            </button>
        ` : '';
        const mobileHeaderLinks = state.isLoggedIn ? `
            <div class="cv-mobile-header-links" aria-label="Mobile quick links">
                <button type="button" onclick="cvOpenFeedCreate('text')" class="cv-mobile-header-link cv-mobile-header-library-link" aria-label="Create post">Post</button>
                <button type="button" data-cv-profile-trigger="1" onclick="return openProfile()" class="cv-mobile-header-profile-link ${state.tab === 'profile' ? 'is-active' : ''}" aria-label="Open Profile" title="Profile">
                    ${renderProfileAvatar(state.currentUser, 'cv-mobile-header-avatar-media', 'text-[11px]')}
                </button>
            </div>
        ` : '';
        const loggedOutAction = !state.isLoggedIn ? `
            <a href="/" class="cv-auth-back-link" aria-label="Back to Faith In website">
                <i data-lucide="arrow-left" aria-hidden="true"></i>
                <span>Back to website</span>
            </a>
        ` : '';

        return `
            <nav id="cv-react-global-nav" data-cv-global-nav="1" class="w-full glass-nav fixed top-0 left-0 right-0 z-50 cv-fixed-clean-nav cv-react-global-nav cv-react-social-nav ${isDark ? 'is-dark' : ''}">
                <div class="max-w-[1600px] mx-auto px-4 cv-nav-shell cv-react-nav-shell cv-react-nav-shell-social">
                    <div class="cv-react-nav-left cv-react-social-nav-left">
                        <a href="#" onclick="setTab('home'); return false;" class="cv-brand-name cv-logo-image-link cv-react-wordmark" aria-label="Faith In home">
                            <span class="cv-react-logo-faith">Faith</span><span class="cv-react-logo-in">In</span>
                        </a>
                        ${state.isLoggedIn ? `<label class="cv-global-search cv-react-social-search" aria-label="Search Faith In">
                            <i data-lucide="search"></i>
                            <input type="search" placeholder="Search FaithIn" onkeydown="if(event.key==='Enter'){event.preventDefault(); setTab('users'); setTimeout(function(){ var input=document.getElementById('cv-find-users-search'); if(input){ input.value=this.value; input.dispatchEvent(new Event('input',{bubbles:true})); } }.bind(this),120); }" />
                        </label>` : ''}
                    </div>

                    <div class="cv-nav-desktop-row cv-top-icon-nav cv-react-primary-nav cv-react-social-tabs" aria-label="Primary navigation">
                        ${topNavTiles}
                    </div>

                    <div class="cv-nav-utility-actions cv-react-nav-actions cv-react-social-actions" aria-label="Account actions">
                        ${menuButton}
                        ${messageDesktop}
                        ${notificationDesktop}
                        ${uploadButton}
                        ${studioButton}
                        ${profileButtonMarkup}
                        ${loggedOutAction}
                    </div>
                </div>

                <div class="cv-nav-mobile-wrap cv-react-mobile-top">
                    <div class="cv-nav-mobile-row cv-top-icon-nav cv-top-icon-nav-mobile" aria-label="Mobile top navigation">
                        <a href="#" onclick="setTab('home'); return false;" class="cv-brand-name cv-brand-name-mobile cv-logo-image-link cv-react-wordmark" aria-label="Faith In home">
                            <span class="cv-react-logo-faith">Faith</span><span class="cv-react-logo-in">In</span>
                        </a>
                        ${messageMobile}
                        ${notificationMobile}
                        ${mobileHeaderLinks}
                    </div>
                </div>

                ${state.isLoggedIn ? `<div class="cv-mobile-bottom-nav" aria-label="Mobile bottom navigation">${mobileTiles}</div>` : ''}
            </nav>
        `;
    }


    function cvOpenProfileSettings() {
        setState({ tab: 'profile', profileSubTab: 'settings', selectedResource: null, showAuthPanel: false, showNotifs: false });
    }
    window.cvOpenProfileSettings = cvOpenProfileSettings;

    function cvTriggerMainMessages() {
        const btn = document.querySelector('[data-cv-main-msg-toggle]');
        if (btn) btn.click();
        else window.showToast('Messages are loading. Please try again.', 'info');
    }
    window.cvTriggerMainMessages = cvTriggerMainMessages;

    function cvTriggerMainNotifications() {
        const btn = document.querySelector('[data-cv-main-notification-toggle]');
        if (btn) btn.click();
        else window.showToast('Notifications are loading. Please try again.', 'info');
    }
    window.cvTriggerMainNotifications = cvTriggerMainNotifications;

    function cvGoFunction(action, tab, extra) {
        if (typeof action === 'function') {
            action();
            return;
        }
        if (tab && typeof window.setTab === 'function') window.setTab(tab);
        if (extra === 'resource' && typeof window.openUpload === 'function') window.openUpload();
    }
    window.cvGoFunction = cvGoFunction;

    function cvGetRecentFunctionKeys() {
        try {
            const raw = window.localStorage ? window.localStorage.getItem('faithin_recent_functions') : '';
            const list = raw ? JSON.parse(raw) : [];
            return Array.isArray(list) ? list.filter(Boolean).slice(0, 4) : [];
        } catch (e) { return []; }
    }

    function cvStoreRecentFunctionKey(key) {
        if (!key) return;
        try {
            const recent = cvGetRecentFunctionKeys().filter(x => x !== key);
            recent.unshift(key);
            if (window.localStorage) window.localStorage.setItem('faithin_recent_functions', JSON.stringify(recent.slice(0, 4)));
        } catch (e) {}
    }

    function cvOpenBibleToolFromHub(toolId) {
        const id = parseInt(toolId, 10) || 0;
        state.bibleStudio = Object.assign({}, state.bibleStudio || {}, { activeTool: id, error: '' });
        setState({ tab: 'bible', selectedResource: null, showNotifs: false, showAuthPanel: false });
        if (typeof loadBibleStudioInitial === 'function') loadBibleStudioInitial();
        window.setTimeout(function() {
            if (typeof window.cvBibleTool === 'function') window.cvBibleTool(id);
        }, 80);
    }

    const CV_PRO_FUNCTION_ROUTES = {
        home: function(){ setTab('home'); },
        createPost: function(){ window.cvOpenFeedCreate('text'); },
        createArticle: function(){ window.cvOpenFeedCreate('article'); },
        createVerse: function(){ window.cvOpenFeedCreate('verse'); },
        blessing: function(){ window.cvOpenFeedCreate('blessing'); },
        prayer: function(){ setTab('prayer'); },
        bibleDashboard: function(){ cvOpenBibleToolFromHub(0); },
        bibleReader: function(){ cvOpenBibleToolFromHub(1); },
        parallelBible: function(){ cvOpenBibleToolFromHub(2); },
        concordance: function(){ cvOpenBibleToolFromHub(3); },
        bibleMedia: function(){ cvOpenBibleToolFromHub(4); },
        scriptureDesign: function(){ cvOpenBibleToolFromHub(5); },
        scriptureTyping: function(){ cvOpenBibleToolFromHub(8); },
        sermonPlanner: function(){ cvOpenBibleToolFromHub(9); },
        library: function(){ setTab('explore'); },
        uploadResource: function(){ openUpload(); },
        network: function(){ setTab('users'); },
        messages: function(){ cvTriggerMainMessages(); },
        notifications: function(){ cvTriggerMainNotifications(); },
        jobs: function(){ setTab('jobs'); },
        profile: function(){ openProfile(); },
        settings: function(){ cvOpenProfileSettings(); },
        upload: function(){ openUpload(); }
    };

    window.cvOpenProFunction = function(key) {
        const route = CV_PRO_FUNCTION_ROUTES[key];
        cvStoreRecentFunctionKey(key);
        if (typeof route === 'function') {
            route();
            return;
        }
        window.showToast('This function is being prepared.', 'info');
    };

    window.cvFilterFunctions = function(query) {
        const root = document.querySelector('#cv-root .cv-functions-page');
        if (!root) return;
        const q = String(query || '').trim().toLowerCase();
        const cards = Array.from(root.querySelectorAll('.cv-function-card'));
        let visible = 0;
        cards.forEach(card => {
            const haystack = String(card.getAttribute('data-cv-function-keywords') || card.textContent || '').toLowerCase();
            const show = !q || haystack.indexOf(q) !== -1;
            card.hidden = !show;
            if (show) visible++;
        });
        root.querySelectorAll('.cv-function-section').forEach(section => {
            const sectionCards = Array.from(section.querySelectorAll('.cv-function-card'));
            const hasVisible = sectionCards.some(card => !card.hidden);
            section.hidden = !hasVisible;
        });
        const empty = root.querySelector('[data-cv-function-empty]');
        if (empty) empty.hidden = !!visible;
        const count = root.querySelector('[data-cv-function-count]');
        if (count) count.textContent = visible + ' function' + (visible === 1 ? '' : 's') + ' available';
    };

    function cvFunctionCountLabel(value, fallback) {
        if (value == null || value === '' || value === 0) return fallback || '';
        return String(value);
    }

    function cvGetProfessionalFunctionCatalog() {
        const postCount = Array.isArray(state.posts) ? state.posts.length : 0;
        const resourceCount = Array.isArray(state.resources) ? state.resources.length : 0;
        const prayerCount = Array.isArray(state.prayers) ? state.prayers.length : 0;
        const jobCount = Array.isArray(state.jobs) ? state.jobs.length : 0;
        const userCount = Array.isArray(state.foundUsers) ? state.foundUsers.length : 0;
        const unreadCount = (window.cv_ajax && window.cv_ajax.auth && window.cv_ajax.auth.unread_count) || '';
        return [
            {
                title: 'Community Publishing',
                subtitle: 'Professional tools for posts, stories, prayers, and encouragement.',
                items: [
                    { key: 'home', title: 'Home Feed', meta: 'A polished community feed with posts, reactions, comments, saves, stories, and owner controls.', icon: 'home', count: cvFunctionCountLabel(postCount, 'Live'), badge: 'Core', featured: true, keywords: 'feed home posts reactions comments stories save edit delete community' },
                    { key: 'createPost', title: 'Create Post', meta: 'Create clean text, image, video, article, and ministry updates from one composer.', icon: 'square-pen', badge: 'Composer', keywords: 'create post text image video article composer publish' },
                    { key: 'createArticle', title: 'Article Post', meta: 'Write longer teaching, devotional, announcement, or testimony content.', icon: 'newspaper', badge: 'Long form', keywords: 'article teaching devotional announcement testimony long form' },
                    { key: 'blessing', title: 'Add Blessing', meta: 'Create blessing stories with background colors, music, privacy, and mobile-friendly viewing.', icon: 'heart-handshake', badge: 'Story', featured: true, keywords: 'blessing story music color worship praise autoplay' },
                    { key: 'prayer', title: 'Prayer Wall', meta: 'Collect prayer requests and let members encourage one another in a calm layout.', icon: 'hand-heart', count: cvFunctionCountLabel(prayerCount, 'Ready'), keywords: 'prayer wall requests encourage support amen' }
                ]
            },
            {
                title: 'Bible & Content Studio',
                subtitle: 'Reading, design, study, and sermon preparation tools.',
                items: [
                    { key: 'bibleDashboard', title: 'Bible Studio Dashboard', meta: 'Open the full scripture workspace with reader, design, quotes, typing, and notes.', icon: 'layout-dashboard', badge: 'Studio', featured: true, keywords: 'bible studio dashboard scripture workspace' },
                    { key: 'bibleReader', title: 'Khmer Bible Reader', meta: 'Read Khmer Old 1954 scripture with valid book and chapter controls.', icon: 'book-open-check', badge: '1954', keywords: 'khmer bible reader old version 1954 verses book chapter' },
                    { key: 'parallelBible', title: 'Parallel Bible', meta: 'Compare the same passage across two translations in a cleaner study layout.', icon: 'columns-3', keywords: 'parallel bible compare translations versions study' },
                    { key: 'concordance', title: 'Concordance Search', meta: 'Search keywords, references, and fallback word-study content through the Bible tools.', icon: 'search-check', keywords: 'concordance search word study bible keyword reference' },
                    { key: 'scriptureDesign', title: 'Scripture Design Studio', meta: 'Design social verse images with backgrounds, fonts, spacing, overlays, and download tools.', icon: 'image', badge: 'Design', featured: true, keywords: 'scripture design verse image social studio background font overlay download' },
                    { key: 'scriptureTyping', title: 'Scripture Typing', meta: 'Practice selected passages and track typing activity for spiritual formation.', icon: 'keyboard', keywords: 'scripture typing practice streak passage' },
                    { key: 'sermonPlanner', title: 'Sermon Planner', meta: 'Organize doctrine, encouragement, and application notes in one clean planning page.', icon: 'edit-3', keywords: 'sermon planner notes doctrine encouragement application' }
                ]
            },
            {
                title: 'Library & Resources',
                subtitle: 'Publish and browse books, PDFs, videos, lessons, and ministry materials.',
                items: [
                    { key: 'library', title: 'Library', meta: 'Browse resources, books, videos, and ministry materials with search and categories.', icon: 'library', count: cvFunctionCountLabel(resourceCount, 'Open'), featured: true, keywords: 'library resources books videos materials search category' },
                    { key: 'uploadResource', title: 'Upload Resource', meta: 'Publish PDFs, thumbnails, lessons, media files, and resource information.', icon: 'upload-cloud', badge: 'Publish', keywords: 'upload resource pdf thumbnail video lesson file publish' },
                    { key: 'bibleMedia', title: 'Bible Media Library', meta: 'Open study videos and lessons in the Bible Studio media workspace.', icon: 'video', keywords: 'bible media videos lessons lectures study' },
                    { key: 'upload', title: 'Quick Upload', meta: 'Jump straight into the upload form when you need to add a resource fast.', icon: 'cloud-upload', keywords: 'quick upload resource file add' }
                ]
            },
            {
                title: 'People & Communication',
                subtitle: 'Members, messages, notifications, and opportunities.',
                items: [
                    { key: 'network', title: 'Network', meta: 'Find members, follow users, open profiles, and start conversations.', icon: 'users', count: cvFunctionCountLabel(userCount, 'Find'), featured: true, keywords: 'network people users follow members profile contacts' },
                    { key: 'messages', title: 'Messages', meta: 'Open the professional private messenger for secure member conversations.', icon: 'message-circle', badge: 'Chat', keywords: 'messages messenger chat private conversations' },
                    { key: 'notifications', title: 'Notifications', meta: 'Review reactions, comments, follows, and message alerts from the top bar.', icon: 'bell', count: unreadCount, keywords: 'notifications alerts reactions comments follows messages' },
                    { key: 'jobs', title: 'Jobs', meta: 'Browse and manage ministry jobs or Christian opportunities.', icon: 'briefcase-business', count: cvFunctionCountLabel(jobCount, 'Open'), keywords: 'jobs ministry work opportunity role' }
                ]
            },
            {
                title: 'Account & Professional Setup',
                subtitle: 'Profile, verification, identity, and preferences.',
                items: [
                    { key: 'profile', title: 'Profile', meta: 'View your professional member page, posts, resources, followers, and verification status.', icon: 'circle-user-round', featured: true, keywords: 'profile account member page posts followers verification' },
                    { key: 'settings', title: 'Settings', meta: 'Update profile details, ministry information, photo, preferences, and account controls.', icon: 'settings', badge: 'Manage', keywords: 'settings preferences profile photo ministry account' }
                ]
            }
        ];
    }

    function cvFlattenFunctionCatalog(sections) {
        return (sections || []).reduce((acc, section) => acc.concat(section.items || []), []);
    }

    function cvRenderFunctionCard(item, compact) {
        const count = item.count != null && item.count !== '' ? `<span class="cv-function-card-count">${escapeHtml(item.count)}</span>` : '';
        const meta = item.meta ? `<small>${escapeHtml(item.meta)}</small>` : '';
        const badge = item.badge ? `<span class="cv-function-card-badge">${escapeHtml(item.badge)}</span>` : '';
        const keywords = [item.key, item.title, item.meta, item.badge, item.keywords].filter(Boolean).join(' ');
        return `<button type="button" class="cv-function-card ${item.featured ? 'is-featured' : ''} ${compact ? 'is-compact' : ''}" data-cv-function-key="${escapeAttr(item.key)}" data-cv-function-keywords="${escapeAttr(keywords)}" onclick="cvOpenProFunction('${escapeJsString(item.key)}')" aria-label="Open ${escapeAttr(item.title)}">
            <span class="cv-function-card-icon"><i data-lucide="${escapeAttr(item.icon || 'circle')}"></i></span>
            <span class="cv-function-card-copy"><strong>${escapeHtml(item.title)}</strong>${meta}</span>
            ${count}${badge}<i data-lucide="chevron-right" class="cv-function-card-arrow"></i>
        </button>`;
    }

    function cvRenderFunctionSection(title, subtitle, items) {
        return `<section class="cv-function-section">
            <div class="cv-function-section-head"><div><h3>${escapeHtml(title)}</h3>${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ''}</div><span>${(items || []).length} tools</span></div>
            <div class="cv-function-grid">${(items || []).map(item => cvRenderFunctionCard(item, false)).join('')}</div>
        </section>`;
    }

    function renderFunctionsHub() {
        const sections = cvGetProfessionalFunctionCatalog();
        const allItems = cvFlattenFunctionCatalog(sections);
        const map = allItems.reduce((acc, item) => { acc[item.key] = item; return acc; }, {});
        const recentKeys = cvGetRecentFunctionKeys().filter(key => map[key]);
        const recent = recentKeys.map(key => map[key]);
        const spotlightKeys = ['createPost', 'blessing', 'scriptureDesign', 'library'];
        const spotlight = spotlightKeys.map(key => map[key]).filter(Boolean);
        const total = allItems.length;
        const quick = spotlight.map(item => `<button type="button" onclick="cvOpenProFunction('${escapeJsString(item.key)}')"><i data-lucide="${escapeAttr(item.icon)}"></i><span>${escapeHtml(item.title.replace('Scripture Design Studio', 'Design'))}</span></button>`).join('');
        const recentHtml = recent.length ? `<section class="cv-function-recent"><div class="cv-function-mini-head"><h3>Recent tools</h3><p>Fast access based on your last opened pages.</p></div><div class="cv-function-mini-grid">${recent.map(item => cvRenderFunctionCard(item, true)).join('')}</div></section>` : '';
        return `<div class="cv-functions-page cv-page-shell">
            <header class="cv-functions-hero">
                <div class="cv-functions-hero-copy">
                    <span class="cv-functions-eyebrow"><i data-lucide="sparkles"></i> Professional function hub</span>
                    <h1>All FaithIn functions, organized page by page</h1>
                    <p>Open every major page from one clean dashboard. Each function is grouped by workflow so the app feels easier, faster, and more professional.</p>
                    <div class="cv-functions-search-wrap">
                        <i data-lucide="search"></i>
                        <input type="search" placeholder="Search functions: Bible, post, blessing, message..." oninput="cvFilterFunctions(this.value)" aria-label="Search FaithIn functions">
                        <span data-cv-function-count>${total} functions available</span>
                    </div>
                </div>
                <div class="cv-functions-quick" aria-label="Quick actions">${quick}</div>
            </header>
            <section class="cv-function-workflow" aria-label="Recommended workflow">
                <article><i data-lucide="pen-line"></i><strong>Create</strong><span>Post, article, blessing, or scripture image.</span></article>
                <article><i data-lucide="book-open"></i><strong>Study</strong><span>Read Khmer Bible, compare, search, and plan.</span></article>
                <article><i data-lucide="upload-cloud"></i><strong>Publish</strong><span>Add resources, lessons, media, and library files.</span></article>
                <article><i data-lucide="users"></i><strong>Connect</strong><span>Find members, message, pray, and follow up.</span></article>
            </section>
            ${recentHtml}
            <div class="cv-function-empty" data-cv-function-empty hidden><i data-lucide="search-x"></i><strong>No function found</strong><p>Try another keyword like Bible, blessing, message, upload, prayer, or profile.</p></div>
            ${sections.map(section => cvRenderFunctionSection(section.title, section.subtitle, section.items)).join('')}
        </div>`;
    }

    function cvSidebarVerseOfDay() {
        if (state.dailyBibleVerse && (state.dailyBibleVerse.khmer || state.dailyBibleVerse.text)) {
            return state.dailyBibleVerse;
        }
        const verses = [
            { text: 'For God so loved the world, that he gave his only begotten Son.', khmer: 'ដ្បិតព្រះទ្រង់ស្រឡាញ់មនុស្សលោក ដល់ម៉្លេះបានជាទ្រង់ប្រទានព្រះរាជបុត្រាទ្រង់តែ១ ដើម្បីឲ្យអ្នកណាដែលជឿដល់ព្រះរាជបុត្រានោះ មិនត្រូវវិនាសឡើយ គឺឲ្យមានជីវិតអស់កល្បជានិច្ចវិញ', ref: 'John 3:16', khmerRef: 'យ៉ូហាន ៣:១៦', versionName: 'ព្រះគម្ពីរបរិសុទ្ធ ១៩៥៤ (ពគប)' },
            { text: 'The LORD is my shepherd; I shall not want.', khmer: 'ទំនុកនៃស្តេចដាវីឌ។ ព្រះយេហូវ៉ាទ្រង់ជាអ្នកគង្វាលខ្ញុំ ខ្ញុំនឹងមិនខ្វះអ្វីសោះ', ref: 'Psalm 23:1', khmerRef: 'ទំនុកតម្កើង ២៣:១', versionName: 'ព្រះគម្ពីរបរិសុទ្ធ ១៩៥៤ (ពគប)' },
            { text: 'Rejoicing in hope; patient in tribulation; continuing instant in prayer.', khmer: 'ចូរអរសប្បាយក្នុងសេចក្ដីសង្ឃឹម អត់ធ្មត់ក្នុងសេចក្ដីវេទនា ហើយខ្ជាប់ខ្ជួនក្នុងសេចក្ដីអធិស្ឋាន', ref: 'Romans 12:12', khmerRef: 'រ៉ូម ១២:១២', versionName: 'ព្រះគម្ពីរបរិសុទ្ធ ១៩៥៤ (ពគប)' },
            { text: 'Trust in the LORD with all thine heart.', khmer: 'ចូរទុកចិត្តដល់ព្រះយេហូវ៉ា ឲ្យអស់ពីចិត្ត', ref: 'Proverbs 3:5', khmerRef: 'សុភាសិត ៣:៥', versionName: 'ព្រះគម្ពីរបរិសុទ្ធ ១៩៥៤ (ពគប)' },
            { text: 'I can do all things through Christ which strengtheneth me.', khmer: 'ខ្ញុំអាចនឹងធ្វើគ្រប់ការទាំងអស់បាន ដោយសារព្រះគ្រីស្ទដែលចំរើនកម្លាំងដល់ខ្ញុំ', ref: 'Philippians 4:13', khmerRef: 'ភីលីព ៤:១៣', versionName: 'ព្រះគម្ពីរបរិសុទ្ធ ១៩៥៤ (ពគប)' }
        ];
        const index = Math.abs(Math.floor(Date.now() / 86400000)) % verses.length;
        return verses[index];
    }

    function cvGetSuggestedConnections(limit = 3) {
        const currentId = cvSocialCurrentUserId();
        const seen = new Set();
        const items = [];
        const add = user => {
            if (!user || !user.id) return;
            const id = parseInt(user.id || 0, 10);
            if (!id || id === currentId || seen.has(id) || user.is_self) return;
            seen.add(id);
            const subtitle = user.subtitle || user.role || user.ministry || user.church || user.handle || 'Christian creator';
            items.push({
                id,
                name: user.name || user.display_name || user.username || 'User',
                handle: user.handle || (user.username ? '@' + user.username : ''),
                role: subtitle,
                avatar_url: user.avatar_url || user.avatar || '',
                is_following: !!user.is_following,
                registered_at: user.registered_at || user.registered || '',
                score: Number(user.score || 0)
            });
        };

        (Array.isArray(state.suggestedUsers) ? state.suggestedUsers : []).forEach(add);

        const posts = Array.isArray(state.posts) ? state.posts : [];
        posts.forEach(post => {
            if (!post) return;
            add(post.author || {});
            const comments = Array.isArray(post.recent_comments) ? post.recent_comments : [];
            comments.forEach(comment => add((comment && (comment.author || comment.user)) || {}));
        });
        (Array.isArray(state.profileFollowers) ? state.profileFollowers : []).forEach(add);

        // Do not show sample people. Suggestions must come from real members, posts, comments, or followers.

        return items
            .sort((a, b) => {
                const aFollowing = a.is_following ? 1 : 0;
                const bFollowing = b.is_following ? 1 : 0;
                if (aFollowing !== bFollowing) return bFollowing - aFollowing;
                const aNew = a.is_new_user ? 1 : 0;
                const bNew = b.is_new_user ? 1 : 0;
                if (aNew !== bNew) return bNew - aNew;
                const byScore = Number(b.score || 0) - Number(a.score || 0);
                if (byScore !== 0) return byScore;
                const aTime = a.registered_at ? new Date(a.registered_at).getTime() : 0;
                const bTime = b.registered_at ? new Date(b.registered_at).getTime() : 0;
                return bTime - aTime;
            })
            .slice(0, limit);
    }


    window.cvOpenFeedCreate = (kind = 'text') => {
        const next = { tab: 'create', createMode: 'post', createIntent: 'post' };
        if (kind === 'article') next.postType = 'Article';
        else if (kind === 'verse') next.postType = 'Verse';
        else if (kind === 'blessing') {
            next.postType = 'Blessing';
            next.createIntent = 'blessing';
        } else if (kind === 'photo') {
            next.postType = 'Image';
        } else {
            next.postType = 'Text';
        }
        setState(next);
        if (kind === 'photo' && window.cvPostingOpenMedia) {
            window.cvPostingOpenMedia('image');
        }
    };

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && state.activeBlessingStoryId) {
            window.cvCloseBlessingStory();
        }
    });

    function cvIsBlessingPost(post) {
        return !!(post && String(post.type || '').toLowerCase() === 'blessing');
    }

    function cvVisibleFeedPosts(posts) {
        const visible = (Array.isArray(posts) ? posts : []).filter(post => !cvIsBlessingPost(post));
        if (!state.savedPostsOnly) return visible;
        const saved = new Set((state.bookmarks || []).map(String));
        return visible.filter(post => saved.has(String(post.id)));
    }

    function cvRenderFeedLeftSidebar() {
        const user = state.currentUser || {};
        const emailName = user.email ? String(user.email).split('@')[0] : '';
        const name = user.name || user.displayName || user.display_name || emailName || 'Faith In Member';
        const role = user.role || user.ministry || user.church || user.bio || user.handle || 'Faith In member';
        const followers = parseInt(state.profileFollowersCount || 0, 10);
        const posts = cvVisibleFeedPosts(state.posts).length;
        const impressions = posts ? (posts * 120 + followers) : 0;
        return `
            <aside class="cv-feed-left-sidebar" aria-label="Profile and shortcuts">
                <section class="cv-feed-left-card cv-feed-profile-card cv-react-profile-card">
                    <div class="cv-feed-profile-cover"></div>
                    <div class="cv-feed-profile-main">
                        <button type="button" class="cv-plain-button cv-feed-profile-avatar" onclick="openProfile(); return false;" data-cv-profile-trigger="1" aria-label="Open your profile">
                            <span class="cv-feed-profile-avatar-media">
                                ${renderProfileAvatar(Object.assign({}, user, { name }), 'w-full h-full', 'text-base')}
                            </span>
                            ${getVerificationMeta(user) ? `<span class="cv-feed-profile-avatar-badge">${renderVerificationBadge(user, 'inline')}</span>` : ''}
                        </button>
                        <div class="cv-feed-profile-copy">
                            <button type="button" class="cv-plain-button cv-feed-profile-name" onclick="openProfile(); return false;" data-cv-profile-trigger="1">${escapeHtml(name)}</button>
                            <div class="cv-feed-profile-role">${escapeHtml(role)}</div>
                        </div>
                        <div class="cv-react-profile-metrics">
                            <button type="button" onclick="openProfile(); return false;" data-cv-profile-trigger="1"><span>Profile viewers</span><strong>${followers}</strong></button>
                            <button type="button" onclick="setTab('home')"><span>Post impressions</span><strong>${impressions}</strong></button>
                        </div>
                    </div>
                    <button type="button" class="cv-react-saved-items ${state.savedPostsOnly ? 'is-active' : ''}" onclick="cvShowSavedPosts()" aria-pressed="${state.savedPostsOnly ? 'true' : 'false'}"><i data-lucide="bookmark"></i><span>Saved items</span><strong>${(state.bookmarks || []).length || ''}</strong></button>
                </section>
                <section class="cv-feed-left-card cv-feed-shortcuts-card">
                    <button type="button" class="cv-feed-shortcut ${state.tab === 'home' ? 'is-active' : ''}" onclick="setTab('home')"><i data-lucide="home"></i><span>Home Feed</span></button>
                    <button type="button" class="cv-feed-shortcut ${state.tab === 'profile' ? 'is-active' : ''}" onclick="openProfile(); return false;" data-cv-profile-trigger="1"><i data-lucide="users"></i><span>Profile</span></button>
                    <button type="button" class="cv-feed-shortcut ${state.tab === 'prayer' ? 'is-active' : ''}" onclick="setTab('prayer')"><i data-lucide="heart"></i><span>Prayer Wall</span></button>
                    <button type="button" class="cv-feed-shortcut ${state.tab === 'jobs' ? 'is-active' : ''}" onclick="setTab('jobs')"><i data-lucide="briefcase-business"></i><span>Find Jobs</span></button>
                    <button type="button" class="cv-feed-shortcut ${state.tab === 'users' ? 'is-active' : ''}" onclick="setTab('users')"><i data-lucide="globe"></i><span>Find Users</span></button>
                    <button type="button" class="cv-feed-shortcut ${state.tab === 'explore' ? 'is-active' : ''}" onclick="setTab('explore')"><i data-lucide="book-open"></i><span>Library</span></button>
                    <button type="button" class="cv-feed-shortcut ${state.tab === 'bible' ? 'is-active' : ''}" onclick="setTab('bible')"><i data-lucide="layout-dashboard"></i><span>Social Studio</span></button>
                </section>
            </aside>
        `;
    }

    function cvGetBlessingStoryText(post) {
        return String((post && (post.content || post.article_excerpt || post.excerpt)) || '').trim();
    }

    function cvGetBlessingStoryImage(post) {
        if (!post) return '';
        const mediaItems = Array.isArray(post.media_items) ? post.media_items : [];
        const imageItem = mediaItems.find(item => item && String(item.type || 'image').toLowerCase() === 'image' && (item.url || item.preview_url));
        if (imageItem) return imageItem.url || imageItem.preview_url || '';
        return post.cover_media_url || post.cover_image_url || '';
    }

    function cvGetRecentBlessingStories(limit = 6) {
        const posts = Array.isArray(state.posts) ? state.posts : [];
        return posts
            .filter(cvIsBlessingPost)
            .slice(0, Math.max(1, limit));
    }

    window.cvOpenBlessingStory = (postId) => {
        const id = String(postId || '');
        if (!id) return;
        setState({ activeBlessingStoryId: id });
    };

    window.cvCloseBlessingStory = () => setState({ activeBlessingStoryId: null });

    window.cvFocusBlessingStoryComment = (id) => {
        const viewer = document.querySelector('.cv-blessing-story-viewer');
        if (viewer) viewer.classList.add('show-comments');
        const input = document.getElementById('cv-comment-input-story-' + id) || document.getElementById('cv-comment-input-' + id);
        if (input) window.setTimeout(() => input.focus(), 20);
    };

    window.cvHandleBlessingStoryCommentKey = (event, id) => {
        if (event.key !== 'Enter') return;
        const storyInput = event.target;
        const feedInput = document.getElementById('cv-comment-input-' + id);
        if (!feedInput && storyInput) {
            storyInput.id = 'cv-comment-input-' + id;
            window.cvHandleCommentKey(event, id);
            storyInput.id = 'cv-comment-input-story-' + id;
            return;
        }
        window.cvHandleCommentKey(event, id);
    };

    window.cvSubmitBlessingStoryComment = (id) => {
        const storyInput = document.getElementById('cv-comment-input-story-' + id);
        if (!storyInput) return;
        window.cvHandleBlessingStoryCommentKey({
            key: 'Enter',
            preventDefault: function() {},
            target: storyInput
        }, id);
    };

    window.cvViewBlessingInFeed = (postId) => {
        const id = String(postId || '');
        state.activeBlessingStoryId = null;
        render();
        window.setTimeout(() => {
            const target = document.getElementById('post-' + id);
            if (target && target.scrollIntoView) {
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                target.classList.add('cv-blessing-feed-highlight');
                window.setTimeout(() => target.classList.remove('cv-blessing-feed-highlight'), 1800);
            }
        }, 60);
    };

    function cvRenderBlessingStoryModal() {
        const activeId = String(state.activeBlessingStoryId || '');
        if (!activeId) return '';
        const posts = Array.isArray(state.posts) ? state.posts : [];
        const post = posts.find(item => String(item.id || '') === activeId && String(item.type || '').toLowerCase() === 'blessing');
        if (!post) return '';
        const author = post.author || {};
        const authorName = author.name || 'Faith In Member';
        const text = cvGetBlessingStoryText(post) || 'Shared a blessing with the Faith In community.';
        const imageUrl = cvGetBlessingStoryImage(post);
        const music = cvGetBlessingMusic(post);
        const blessingBgStyle = cvBlessingBgStyle(cvGetBlessingBgColor(post));
        const selectedReaction = post.current_user_reaction || post.user_reaction || '';
        const reactionMeta = cvReactionMeta(selectedReaction || 'like');
        const isLiked = !!selectedReaction;
        return `
            <div class="cv-blessing-story-overlay" role="dialog" aria-modal="true" aria-label="Blessing story" onclick="cvCloseBlessingStory()">
                <article class="cv-blessing-story-viewer ${imageUrl ? 'has-photo' : 'has-text-only'} ${music ? 'has-music' : ''}" onclick="event.stopPropagation()">
                    ${imageUrl ? `<img class="cv-blessing-story-viewer-photo" src="${escapeAttr(imageUrl)}" alt="Blessing photo from ${escapeAttr(authorName)}" loading="lazy" />` : `<span class="cv-blessing-story-viewer-gradient" style="${escapeAttr(blessingBgStyle)}" aria-hidden="true"></span>`}
                    <div class="cv-blessing-story-viewer-shade" aria-hidden="true"></div>
                    <header class="cv-blessing-story-viewer-head">
                        <button type="button" class="cv-blessing-story-author" onclick="event.stopPropagation(); cvOpenAuthorProfile('${post.id}')" aria-label="Open ${escapeAttr(authorName)} profile">
                            <span class="cv-blessing-story-author-avatar">${renderProfileAvatar({ name: authorName, avatar_url: author.avatar || author.avatar_url || '' }, 'w-full h-full', 'text-[10px]')}</span>
                            <span><strong>${escapeHtml(authorName)}</strong><small>${escapeHtml(post.time || 'Just now')}</small></span>
                        </button>
                        <button type="button" class="cv-blessing-story-close" onclick="cvCloseBlessingStory()" aria-label="Close blessing"><i data-lucide="x"></i></button>
                    </header>
                    <div class="cv-blessing-story-copy ${hasKhmerText(text) ? 'cv-article-khmer' : ''}">
                        <p>${escapeHtml(text)}</p>
                    </div>
                    ${music ? `<div class="cv-blessing-story-music" onclick="event.stopPropagation()">
                        <div class="cv-blessing-story-music__label"><i data-lucide="music-2"></i><span>${escapeHtml(music.name)}</span></div>
                        <audio class="cv-blessing-story-audio" controls autoplay playsinline preload="auto" data-cv-blessing-autoplay="1" src="${escapeAttr(music.url)}"><source src="${escapeAttr(music.url)}" type="${escapeAttr(music.mime)}"></audio>
                    </div>` : ''}
                    <div class="cv-blessing-story-comments" onclick="event.stopPropagation()">
                        <div class="cv-blessing-story-comments-list">${cvRenderPostComments(post)}</div>
                        <div class="cv-blessing-story-comment-row">
                            <div class="cv-comment-avatar">${renderProfileAvatar((state.currentUser && state.currentUser.logged_in) ? Object.assign({}, state.currentUser, { name: state.currentUser.name || 'Me' }) : { name: 'Guest' }, 'w-full h-full', 'text-[10px]')}</div>
                            <div class="cv-comment-input-wrap">
                                <input id="cv-comment-input-story-${post.id}" type="text" placeholder="Add a comment..." onkeydown="cvHandleBlessingStoryCommentKey(event, '${post.id}')" aria-label="Add a blessing comment" />
                                <div class="cv-comment-tools" aria-label="Comment tools">
                                    <button type="button" class="cv-comment-send-btn" onclick="cvSubmitBlessingStoryComment('${post.id}')" aria-label="Post comment"><i data-lucide="send"></i></button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <footer class="cv-blessing-story-actions">
                        <button type="button" onclick="event.stopPropagation(); likePost('${post.id}')" class="cv-blessing-story-action ${isLiked ? 'is-active' : ''}" style="${isLiked ? `--cv-reaction-active-color:${reactionMeta.color};--cv-reaction-active-bg:${reactionMeta.bgColor}` : ''}" aria-label="${isLiked ? 'Remove ' + reactionMeta.label + ' reaction' : 'Amen to this blessing'}">
                            <span>${isLiked ? cvReactionIconSvg(reactionMeta.iconName, 'cv-selected-reaction-svg') : '<i data-lucide="thumbs-up"></i>'}</span>${isLiked ? reactionMeta.label : 'Amen'}
                        </button>
                        <button type="button" onclick="event.stopPropagation(); cvFocusBlessingStoryComment('${post.id}')" class="cv-blessing-story-action"><span><i data-lucide="message-circle"></i></span>Comment</button>
                        <button type="button" onclick="event.stopPropagation(); cvSharePost('${post.id}')" class="cv-blessing-story-action"><span><i data-lucide="share-2"></i></span>Share</button>
                    </footer>
                </article>
            </div>
        `;
    }


    function cvInitBlessingStoryAudio() {
        try {
            const activeAudio = document.querySelector('.cv-blessing-story-audio[data-cv-blessing-autoplay="1"]');
            if (!activeAudio) return;
            document.querySelectorAll('audio').forEach(other => {
                if (other !== activeAudio) {
                    try { other.pause(); } catch (e) {}
                }
            });
            activeAudio.muted = false;
            activeAudio.volume = 0.75;
            const attemptPlay = () => {
                try {
                    const playPromise = activeAudio.play();
                    if (playPromise && typeof playPromise.catch === 'function') {
                        playPromise.catch(() => {
                            const box = activeAudio.closest('.cv-blessing-story-music');
                            if (box) box.classList.add('cv-blessing-story-music--tap-to-play');
                        });
                    }
                } catch (e) {
                    const box = activeAudio.closest('.cv-blessing-story-music');
                    if (box) box.classList.add('cv-blessing-story-music--tap-to-play');
                }
            };
            attemptPlay();
            if (window.requestAnimationFrame) requestAnimationFrame(attemptPlay);
            else window.setTimeout(attemptPlay, 0);
        } catch (error) {
            if (window.console && console.warn) console.warn('Faith In Blessing music autoplay failed', error);
        }
    }

    function cvRenderStoriesCarousel() {
        const current = state.currentUser || { name: state.postAuthorName || 'You' };
        const blessings = cvGetRecentBlessingStories(6);
        const prompts = [
            { title: 'Share testimony', text: 'Tell what God has done.' },
            { title: 'Add photo', text: 'Post a worship, church, or ministry moment.' },
            { title: 'Encourage others', text: 'Write a verse or blessing.' }
        ];
        const storyCards = blessings.length ? blessings.map((post, index) => {
            const author = post.author || {};
            const authorName = author.name || 'Faith In Member';
            const imageUrl = cvGetBlessingStoryImage(post);
            const text = cvGetBlessingStoryText(post) || 'Shared a blessing with the community.';
            return `<button type="button" class="cv-react-story-card cv-blessing-story-card cv-react-story-card--${(index % 4) + 1} ${imageUrl ? 'has-photo' : 'has-text'}" onclick="cvOpenBlessingStory('${escapeAttr(post.id)}')" aria-label="Open ${escapeAttr(authorName)} blessing">
                ${imageUrl ? `<img class="cv-react-story-photo" src="${escapeAttr(imageUrl)}" alt="${escapeAttr(authorName)} blessing photo" loading="lazy" />` : `<span class="cv-react-story-gradient" style="${escapeAttr(cvBlessingBgStyle(cvGetBlessingBgColor(post)))}"></span>`}
                <span class="cv-react-story-overlay" aria-hidden="true"></span>
                <span class="cv-react-story-avatar">${renderProfileAvatar({ name: authorName, avatar_url: author.avatar || author.avatar_url || '' }, 'w-full h-full', 'text-[10px]')}</span>
                ${!imageUrl ? `<span class="cv-react-story-text-preview">${escapeHtml(text)}</span>` : ''}
                <strong>${escapeHtml(authorName)}</strong>
            </button>`;
        }).join('') : prompts.map((item, index) => `
            <button type="button" class="cv-react-story-card cv-blessing-story-card cv-blessing-story-prompt cv-react-story-card--${index + 2}" onclick="cvOpenFeedCreate('blessing')" aria-label="${escapeAttr(item.title)}">
                <span class="cv-react-story-gradient" style="${escapeAttr(cvBlessingBgStyle(CV_BLESSING_COLOR_PALETTE[(index + 1) % CV_BLESSING_COLOR_PALETTE.length].key))}"></span>
                <span class="cv-react-story-avatar cv-react-story-avatar--icon">${cvRenderBlessingIcon("cv-blessing-svg-icon--story-avatar")}</span>
                <span class="cv-react-story-text-preview">${escapeHtml(item.text)}</span>
                <strong>${escapeHtml(item.title)}</strong>
            </button>
        `).join('');
        return `
            <section class="cv-react-stories" aria-label="Blessings">
                <button type="button" class="cv-react-story-card cv-react-create-story cv-react-create-blessing" onclick="cvOpenFeedCreate('blessing')" aria-label="Add blessing">
                    <span class="cv-react-story-create-media">${renderProfileAvatar(current, 'w-full h-full', 'text-sm')}</span>
                    <span class="cv-react-story-create-footer">${cvRenderBlessingIcon("cv-blessing-svg-icon--create")}<strong>Add Blessing</strong></span>
                </button>
                ${storyCards}
            </section>
        `;
    }

    function cvRenderFeedComposer() {
        const user = state.currentUser || { name: state.postAuthorName || 'You' };
        return `
            <section class="cv-feed-composer-card cv-react-fb-composer">
                <div class="cv-feed-composer-head">
                    <button type="button" class="cv-feed-composer-avatar cv-plain-button" onclick="openProfile(); return false;" data-cv-profile-trigger="1" aria-label="Open your profile">${renderProfileAvatar(user, 'w-full h-full', 'text-sm')}</button>
                    <button type="button" class="cv-feed-compose-trigger" onclick="cvOpenFeedCreate('blessing')" aria-label="Add Blessing">Share a blessing, testimony, or encouragement...</button>
                </div>
                <div class="cv-feed-composer-actions">
                    <button type="button" class="cv-feed-compose-action cv-feed-compose-action--live" onclick="cvOpenFeedCreate('blessing')">${cvRenderBlessingIcon("cv-blessing-svg-icon--compose")}<span>Add Blessing</span></button>
                    <button type="button" class="cv-feed-compose-action cv-feed-compose-action--text" onclick="cvOpenFeedCreate('photo')"><i data-lucide="image"></i><span>Photo</span></button>
                    <button type="button" class="cv-feed-compose-action cv-feed-compose-action--photo" onclick="setTab('prayer')"><i data-lucide="heart"></i><span>Prayer Req</span></button>
                    <button type="button" class="cv-feed-compose-action cv-feed-compose-action--article" onclick="cvOpenFeedCreate('article')"><i data-lucide="file-text"></i><span>Article</span></button>
                </div>
            </section>
        `;
    }

    function cvRenderFeedRightSidebar() {
        const verse = cvSidebarVerseOfDay();
        const visibleCount = Math.max(4, parseInt(state.suggestedVisibleCount || 4, 10));
        const contacts = cvGetSuggestedConnections(visibleCount).slice(0, 4);
        const renderContactHeadline = user => {
            const headline = user.role || user.headline || user.subtitle || user.ministry || user.church || user.handle || 'Faith In member';
            return String(headline || '').trim() || 'Faith In member';
        };
        const renderContactMessagePayload = user => JSON.stringify({
            id: parseInt(user.id || 0, 10),
            name: user.name || 'Faith In Member',
            handle: user.handle || '',
            avatar_url: user.avatar_url || user.avatar || ''
        });
        return `
            <aside class="cv-feed-right-sidebar cv-ui-right-rail" aria-label="Feed sidebar">
                <section class="cv-feed-side-card cv-feed-right-section cv-verse-card cv-react-verse-card cv-ui-rail-card cv-ui-verse-card">
                    <div class="cv-feed-side-card__heading cv-ui-rail-heading cv-ui-verse-heading">
                        <h3><span>Verse of the Day</span><small>ព្រះគម្ពីរបរិសុទ្ធ ១៩៥៤</small></h3>
                        <i data-lucide="book-open" aria-hidden="true"></i>
                    </div>
                    <blockquote class="cv-verse-box cv-ui-verse-box">
                        <p class="cv-ui-verse-kh">«${escapeHtml(verse.khmer || verse.text)}»</p>
                        ${verse.text && verse.text !== (verse.khmer || verse.text) ? `<p class="cv-ui-verse-en">“${escapeHtml(verse.text)}”</p>` : ''}
                        <strong>${escapeHtml(verse.khmerRef || '')}${verse.khmerRef && verse.ref && verse.khmerRef !== verse.ref ? ' • ' : ''}${verse.ref && verse.khmerRef !== verse.ref ? escapeHtml(verse.ref) : ''}</strong>
                    </blockquote>
                </section>
                <section class="cv-feed-side-card cv-feed-right-section cv-suggested-card cv-react-contacts-card cv-ui-rail-card cv-ui-contacts-card">
                    <div class="cv-feed-side-card__heading cv-react-contacts-heading cv-ui-rail-heading cv-ui-contacts-heading">
                        <h3>Contacts</h3>
                        <div class="cv-ui-contact-tools">
                            <button type="button" onclick="setTab('users')" aria-label="Search contacts" title="Search contacts"><i data-lucide="search"></i></button>
                            <button type="button" onclick="loadMoreSuggestedUsers()" aria-label="More contacts" title="More contacts"><i data-lucide="more-horizontal"></i></button>
                        </div>
                    </div>
                    <div class="cv-suggested-list cv-react-contact-list cv-ui-contact-list">
                        ${state.suggestedUsersLoading && !contacts.length ? '<div class="cv-suggested-empty cv-ui-contact-loading"><span class="cv-social-spinner"></span><p>Loading contacts...</p></div>' : ''}
                        ${contacts.map(user => {
                            const id = parseInt(user.id || 0, 10);
                            const messagePayload = renderContactMessagePayload(user);
                            return `
                                <article class="cv-react-contact-item cv-ui-contact-row" aria-label="${escapeAttr(user.name || 'Faith In member')}">
                                    <button type="button" class="cv-ui-contact-avatar cv-plain-button" ${id > 0 ? `onclick="cvOpenUserProfile(${id})"` : `onclick="cvComingSoon('Contacts')"`} aria-label="Open ${escapeAttr(user.name || 'member')} profile">
                                        ${renderProfileAvatar({ name: user.name, avatar_url: user.avatar_url }, 'w-full h-full', 'text-[10px]')}<i aria-hidden="true"></i>
                                    </button>
                                    <div class="cv-ui-contact-body">
                                        <button type="button" class="cv-ui-contact-name cv-plain-button" ${id > 0 ? `onclick="cvOpenUserProfile(${id})"` : `onclick="cvComingSoon('Contacts')"`}>${escapeHtml(user.name || 'Faith In Member')}</button>
                                        <span class="cv-ui-contact-headline">${escapeHtml(renderContactHeadline(user))}</span>
                                        <button type="button" class="cv-ui-contact-message" ${id > 0 ? `onclick="cvOpenFaithInChat(${escapeAttr(messagePayload)})"` : `onclick="cvComingSoon('Messaging')"`} aria-label="Message ${escapeAttr(user.name || 'member')}"><i data-lucide="message-square"></i><span>Message</span></button>
                                    </div>
                                </article>
                            `;
                        }).join('')}
                        ${!contacts.length && !state.suggestedUsersLoading ? '<div class="cv-suggested-empty cv-ui-contact-empty">Contacts will appear here as members join.</div>' : ''}
                    </div>
                </section>
                <div class="cv-ui-rail-footer" aria-label="Faith In footer">
                    <span><strong>Faith In</strong> Corporation © 2026</span>
                </div>
            </aside>
        `;
    }

    function renderResourceDetail() {
        const isDark = state.settings.theme === 'dark';
        const r = state.selectedResource;
        if (!r) return '';
        const id = escapeAttr(r.id);
        const isDown = (state.downloads || []).map(String).includes(String(r.id));
        const isFav = (state.bookmarks || []).map(String).includes(String(r.id));
        const title = escapeHtml(r.title || 'Untitled resource');
        const category = escapeHtml(String(r.category || 'Library').toUpperCase());
        const formatRaw = String(r.format || r.type || 'FILE');
        const format = escapeHtml(formatRaw.toUpperCase());
        const size = escapeHtml(r.size || 'Unknown size');
        const author = escapeHtml(r.author || 'Faith In Team');
        const authorTitle = escapeHtml(r.author_title || r.contributor_title || r.country || 'Global');
        const description = escapeHtml(r.description || 'No description available for this resource.');
        const imageUrl = safeImageUrl(r.image_url || r.cover_image_url || r.thumbnail_url, '');
        const isApiBook = cvIsApiLibraryResource(r);
        const primaryActionIcon = isApiBook ? 'external-link' : 'download';
        const primaryActionLabel = isApiBook ? 'Open Book' : (isDown ? 'Downloaded' : 'Download Now');
        const primaryActionClass = isApiBook ? '' : (isDown ? 'is-downloaded' : '');
        const saveAction = !isApiBook ? `
                                <button type="button" onclick="toggleBookmark('${id}')" class="cv-library-action cv-library-action--secondary ${isFav ? 'is-saved' : ''}">
                                    <i data-lucide="bookmark" class="${isFav ? 'fill-current' : ''}"></i>
                                    <span>${isFav ? 'Saved' : 'Save'}</span>
                                </button>
        ` : '';
        const iconName = isApiBook ? 'book-open' : (formatRaw.toLowerCase().includes('video') || formatRaw.toLowerCase().includes('mp4') ? 'video' : (formatRaw.toLowerCase().includes('link') || formatRaw.toLowerCase().includes('url') ? 'external-link' : 'file-text'));
        const previewCard = imageUrl ? `
            <div class="cv-library-detail__book-card has-image">
                <img src="${escapeAttr(imageUrl)}" alt="${escapeAttr(r.title || 'Resource preview')}" />
            </div>
        ` : `
            <div class="cv-library-detail__book-card">
                <div class="cv-library-detail__doc-preview">
                    <i data-lucide="${iconName}"></i>
                    <h4>${title}</h4>
                </div>
            </div>
        `;
        const previewBg = imageUrl ? `<img src="${escapeAttr(imageUrl)}" alt="" aria-hidden="true" />` : '';

        return `
            <div class="cv-library-detail-page ${isDark ? 'is-dark' : ''}">
                <div class="cv-library-detail-container">
                    <button type="button" onclick="goBack()" class="cv-library-back-button">
                        <i data-lucide="arrow-left"></i>
                        <span>Back to Library</span>
                    </button>

                    <article class="cv-library-detail-card">
                        <div class="cv-library-detail__preview ${imageUrl ? 'has-image' : ''}">
                            <div class="cv-library-detail__preview-bg">${previewBg}</div>
                            ${previewCard}
                        </div>

                        <div class="cv-library-detail__content">
                            <div class="cv-library-detail__meta">
                                <span>${category}</span>
                                <em aria-hidden="true">•</em>
                                <strong>${format} • ${size}</strong>
                            </div>

                            <h1>${title}</h1>

                            <div class="cv-library-detail__author">
                                <div class="cv-library-detail__avatar">
                                    ${renderProfileAvatar({ name: r.author || 'Faith In Team', avatar_url: r.author_avatar || '' }, 'w-full h-full', 'text-sm')}
                                </div>
                                <div>
                                    <h3>${author} ${renderVerificationBadge(r, 'compact')}</h3>
                                    <p>${authorTitle}</p>
                                </div>
                            </div>

                            <p class="cv-library-detail__description">${description}</p>

                            <div class="cv-library-detail__actions">
                                <button type="button" onclick="downloadResource('${id}')" class="cv-library-action cv-library-action--primary ${primaryActionClass}">
                                    <i data-lucide="${primaryActionIcon}"></i>
                                    <span>${primaryActionLabel}</span>
                                </button>
                                ${saveAction}
                                ${(!isApiBook && r.can_delete) ? `<button type="button" onclick="deleteResource('${id}')" class="cv-library-action cv-owner-action-pill cv-owner-action-pill--delete cv-library-owner-delete" aria-label="Delete resource"><i data-lucide="trash-2"></i><span>Delete</span></button>` : ''}
                            </div>
                        </div>
                    </article>
                </div>
            </div>
        `;
    }


    function renderExplore() {
        const isDark = state.settings.theme === 'dark';
        const resourceCategories = Array.from(new Set((state.resources || []).map(r => String(r.category || '').trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b));
        const baseCategories = ['All', 'Bible Study', 'History'];
        const categories = Array.from(new Set(baseCategories.concat(resourceCategories).filter(Boolean))).filter(function(cat, index, arr) {
            return arr.findIndex(function(other) { return String(other).toLowerCase() === String(cat).toLowerCase(); }) === index;
        });
        const q = String(state.exploreSearch || '').toLowerCase();
        const activeCat = String(state.exploreCat || 'All');

        const filtered = (state.resources || []).filter(r => {
            const title = String(r.title || '').toLowerCase();
            const author = String(r.author || '').toLowerCase();
            const category = String(r.category || '').toLowerCase();
            const description = String(r.description || '').toLowerCase();
            const format = String(r.format || r.type || '').toLowerCase();
            const searchMatch = !q || title.includes(q) || author.includes(q) || category.includes(q) || description.includes(q) || format.includes(q);
            const catMatch = activeCat === 'All' || category === activeCat.toLowerCase();
            return searchMatch && catMatch;
        });

        const renderResourceCard = (res, i) => {
            const id = escapeAttr(res.id);
            const title = escapeHtml(res.title || 'Untitled resource');
            const category = escapeHtml(String(res.category || 'Library').toUpperCase());
            const formatRaw = String(res.format || res.type || 'FILE');
            const format = escapeHtml(formatRaw.toUpperCase());
            const author = escapeHtml(res.author || 'Faith In Team');
            const authorTitle = escapeHtml(res.author_title || res.contributor_title || res.country || 'Global');
            const views = escapeHtml(res.views || res.view_count || '0');
            const downloads = escapeHtml(res.downloads || res.download_count || '0');
            const imageUrl = safeImageUrl(res.image_url || res.cover_image_url || res.thumbnail_url, '');
            const hasImage = !!imageUrl;

            return `
                <article onclick="selectResource('${id}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();selectResource('${id}');}" class="cv-library-card" style="animation-delay:${(i % 20) * 35}ms" tabindex="0" role="button" aria-label="Open ${escapeAttr(res.title || 'resource')}">
                    <div class="cv-library-card__cover ${hasImage ? 'has-image' : 'is-gradient'}">
                        ${hasImage ? `<img src="${escapeAttr(imageUrl)}" alt="${escapeAttr(res.title || 'Resource cover')}" class="cv-library-card__image" loading="lazy" />` : ''}
                        <div class="cv-library-card__image-shade"></div>
                        <h3 class="cv-library-card__cover-title">${title}</h3>
                    </div>
                    <div class="cv-library-card__body">
                        <div class="cv-library-card__meta">${category} <span aria-hidden="true">•</span> ${format}</div>
                        <div class="cv-library-card__author">
                            <div class="cv-library-card__avatar">
                                ${renderProfileAvatar({ name: res.author || 'Faith In Team', avatar_url: res.author_avatar || '' }, 'w-full h-full', 'text-[11px]')}
                            </div>
                            <div class="cv-library-card__author-copy">
                                <p>${author} ${renderVerificationBadge(res, 'compact')}</p>
                                <span>${authorTitle}</span>
                            </div>
                        </div>
                        <div class="cv-library-card__footer">
                            <span><i data-lucide="eye"></i>${views}</span>
                            <span><i data-lucide="download"></i>${downloads}</span>
                        </div>
                    </div>
                </article>
            `;
        };

        let html = `
            <div class="cv-library-page ${isDark ? 'is-dark' : ''}">
                <div class="cv-library-container">
                    <header class="cv-library-header">
                        <h1>Library</h1>
                        <p>Browse and open resources from your FaithIn system.</p>
                    </header>

                    <div class="cv-library-search" role="search">
                        <i data-lucide="search"></i>
                        <input type="text" value="${escapeAttr(state.exploreSearch || '')}" oninput="handleExploreSearch(this.value)" placeholder="Search the library..." aria-label="Search the library" />
                    </div>

                    <div class="cv-library-categories" aria-label="Library categories">
        `;

        categories.forEach(cat => {
            const isActive = activeCat === cat;
            html += `<button type="button" onclick="setExploreCat('${escapeAttr(escapeJsString(cat))}')" class="cv-library-category ${isActive ? 'is-active' : ''}">${escapeHtml(cat)}</button>`;
        });

        html += `
                    </div>
                    <section class="cv-library-grid" aria-label="Library resources">
        `;

        if (state.resourcesLoading) {
            html += `
                <div class="cv-library-empty cv-library-loading" aria-live="polite">
                    <i data-lucide="loader-2"></i>
                    <h3>Loading Library...</h3>
                    <p>Please wait while Faith In loads your resources.</p>
                </div>
            `;
        } else if (state.resourcesError) {
            html += `
                <div class="cv-library-empty cv-library-error" aria-live="polite">
                    <i data-lucide="alert-circle"></i>
                    <h3>Library could not load.</h3>
                    <p>${escapeHtml(state.resourcesError)}</p>
                    <button type="button" onclick="loadResources()" class="cv-library-action cv-library-action--primary"><i data-lucide="refresh-cw"></i><span>Try Again</span></button>
                </div>
            `;
        } else if (!filtered.length) {
            html += `
                <div class="cv-library-empty">
                    <i data-lucide="folder-search"></i>
                    <h3>No resources found.</h3>
                    <p>Try a different search/category, or upload a new Library resource.</p>
                    <button type="button" onclick="openUpload()" class="cv-library-action cv-library-action--primary"><i data-lucide="upload-cloud"></i><span>Upload Resource</span></button>
                </div>
            `;
        } else {
            html += filtered.map(renderResourceCard).join('');
        }

        html += `
                    </section>
                </div>
            </div>
        `;
        return html;
    }


    function cvRenderPostMedia(post, isDark) {
        const items = Array.isArray(post.media_items) ? post.media_items.filter(item => item && String(item.type || '').toLowerCase() !== 'audio' && !item.is_blessing_music && (item.local_url || item.url || item.drive_url || item.preview_url)) : [];
        if (!items.length && post.cover_image_url) items.push({ url: post.cover_image_url, local_url: post.cover_image_url, type: 'image', downloadable: true });
        if (!items.length) return '';
        const canDownload = (item) => item.downloadable !== false && item.allow_download !== false;
        const dl = (item, label) => canDownload(item) ? `<a class="cv-media-download-btn" href="${escapeAttr(safeImageUrl(item.local_url || item.url || item.drive_url, ''))}" download target="_blank" rel="noopener" aria-label="Download ${escapeAttr(label)}"><i data-lucide="download" class="w-4 h-4"></i><span>Download</span></a>` : '';
        const first = items[0] || {};
        if (first.type === 'video') {
            const videoUrl = safeImageUrl(first.local_url || first.url || first.drive_url, '');
            const previewUrl = safeImageUrl(first.preview_url || first.previewUrl || '', '');
            const mime = String(first.mime || '').trim().toLowerCase();
            if (!videoUrl && !previewUrl) return '';
            if (previewUrl && /drive\.google\.com\/file\/d\//i.test(previewUrl)) {
                return `<div class="cv-feed-reel-wrap mt-4 is-ready is-drive-video"><iframe class="cv-feed-reel-video cv-feed-drive-video" src="${escapeAttr(previewUrl)}" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe><span class="cv-reel-badge">Reel</span>${dl(first, 'Reel video')}</div>`;
            }
            const ext = (videoUrl.split('?')[0].split('#')[0].match(/\.([a-z0-9]+)$/i) || [,''])[1].toLowerCase();
            const typeMap = { mp4: 'video/mp4', m4v: 'video/mp4', webm: 'video/webm', ogv: 'video/ogg', ogg: 'video/ogg', mov: 'video/quicktime', qt: 'video/quicktime' };
            const videoType = mime || typeMap[ext] || 'video/mp4';
            return `<div class="cv-feed-reel-wrap mt-4 is-ready is-native-video"><video src="${escapeAttr(videoUrl)}" class="cv-feed-reel-video" data-cv-smooth-video="1" controls playsinline webkit-playsinline preload="auto"><source src="${escapeAttr(videoUrl)}" type="${escapeAttr(videoType)}"></video><span class="cv-reel-badge">Reel</span>${dl(first, 'Reel video')}</div>`;
        }
        const count = items.length;
        const cls = count === 1 ? 'is-one' : (count === 2 ? 'is-two' : 'is-many');
        return `<div class="cv-feed-media-grid ${cls} mt-4">${items.slice(0, 10).map((item, idx) => `<div class="cv-feed-media-item"><img src="${safeImageUrl(item.local_url || item.url || item.drive_url, '')}" alt="Post image ${idx + 1}" loading="eager" decoding="async" fetchpriority="high" />${dl(item, 'image ' + (idx + 1))}${idx === 9 && count > 10 ? `<span class="cv-feed-media-more">+${count - 10}</span>` : ''}</div>`).join('')}</div>`;
    }


    window.cvPlayFeedVideo = (trigger) => {
        const wrap = trigger && trigger.closest ? trigger.closest('.cv-feed-reel-wrap') : null;
        const video = wrap ? wrap.querySelector('video.cv-feed-reel-video') : null;
        if (!video) return;
        cvPrepareFeedVideo(video, true);
        const promise = video.play && video.play();
        if (promise && promise.catch) promise.catch(() => {});
    };

    function cvPrepareFeedVideo(video, eager) {
        if (!video) return;
        const wrap = video.closest('.cv-feed-reel-wrap');
        const src = video.getAttribute('src') || '';
        const dataSrc = video.getAttribute('data-src') || '';
        if (!src && dataSrc) {
            video.src = dataSrc;
            video.preload = eager ? 'auto' : 'metadata';
            video.setAttribute('preload', eager ? 'auto' : 'metadata');
            if (wrap) {
                wrap.classList.add('is-loading');
                wrap.classList.remove('is-slow', 'is-error');
            }
            try { video.load(); } catch (e) {}
        } else if (eager) {
            video.preload = 'auto';
            video.setAttribute('preload', 'auto');
        }
    }

    function cvInitSmoothVideos() {
        const videos = Array.prototype.slice.call(document.querySelectorAll('video.cv-feed-reel-video[data-cv-smooth-video="1"]'));
        if (!videos.length) return;

        const setStatus = (video, status) => {
            const wrap = video.closest('.cv-feed-reel-wrap');
            if (!wrap) return;
            wrap.classList.remove('is-loading', 'is-slow', 'is-error', 'is-ready');
            if (status === 'loading') wrap.classList.add('is-loading');
            if (status === 'slow') wrap.classList.add('is-slow');
            if (status === 'error') wrap.classList.add('is-error');
            if (status === 'ready') wrap.classList.add('is-ready');
        };
        const markReady = (video) => setStatus(video, 'ready');
        const markLoading = (video) => {
            if (video.readyState < 2) setStatus(video, 'loading');
        };

        videos.forEach((video, index) => {
            if (video.dataset.cvSmoothBound === '1') {
                if (index === 0) cvPrepareFeedVideo(video, false);
                return;
            }
            video.dataset.cvSmoothBound = '1';
            video.setAttribute('playsinline', '');
            video.setAttribute('webkit-playsinline', '');
            video.preload = 'metadata';
            video.setAttribute('preload', 'metadata');

            let slowTimer = null;
            const clearSlowTimer = () => {
                if (slowTimer) window.clearTimeout(slowTimer);
                slowTimer = null;
            };
            const armSlowTimer = () => {
                clearSlowTimer();
                slowTimer = window.setTimeout(() => {
                    if (video.readyState < 2 && !video.error) setStatus(video, 'slow');
                }, 4500);
            };

            video.addEventListener('loadstart', () => { markLoading(video); armSlowTimer(); }, { passive: true });
            video.addEventListener('waiting', () => { markLoading(video); armSlowTimer(); }, { passive: true });
            video.addEventListener('stalled', () => { markLoading(video); armSlowTimer(); }, { passive: true });
            video.addEventListener('loadedmetadata', () => { clearSlowTimer(); markReady(video); }, { passive: true });
            video.addEventListener('loadeddata', () => { clearSlowTimer(); markReady(video); }, { passive: true });
            video.addEventListener('canplay', () => { clearSlowTimer(); markReady(video); }, { passive: true });
            video.addEventListener('canplaythrough', () => { clearSlowTimer(); markReady(video); }, { passive: true });
            video.addEventListener('error', () => { clearSlowTimer(); markReady(video); }, { passive: true });
            video.addEventListener('playing', () => {
                clearSlowTimer();
                markReady(video);
                videos.forEach(other => {
                    if (other !== video && !other.paused) {
                        try { other.pause(); } catch (e) {}
                    }
                });
            }, { passive: true });
            video.addEventListener('play', () => cvPrepareFeedVideo(video, true), { passive: true });
            video.addEventListener('mouseenter', () => cvPrepareFeedVideo(video, false), { passive: true });
            video.addEventListener('touchstart', () => cvPrepareFeedVideo(video, false), { passive: true });
            video.addEventListener('click', () => cvPrepareFeedVideo(video, true), { passive: true });
            if (video.readyState >= 1) markReady(video);
        });

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        cvPrepareFeedVideo(entry.target, false);
                        obs.unobserve(entry.target);
                    }
                });
            }, { root: null, rootMargin: '500px 0px', threshold: 0.01 });
            videos.forEach(video => observer.observe(video));
        } else {
            videos.slice(0, 2).forEach(video => cvPrepareFeedVideo(video, false));
        }
        videos.slice(0, 1).forEach(video => cvPrepareFeedVideo(video, false));
    }

    function cvRenderFeedSkeleton() {
        const card = `
            <div class="cv-feed-card cv-feed-skeleton" aria-hidden="true">
                <div class="cv-feed-skeleton__head">
                    <span class="cv-feed-skeleton__avatar"></span>
                    <span class="cv-feed-skeleton__copy">
                        <span class="cv-feed-skeleton__line"></span>
                        <span class="cv-feed-skeleton__line cv-feed-skeleton__line--short"></span>
                    </span>
                </div>
                <div class="cv-feed-skeleton__media"></div>
            </div>`;
        return `<div class="cv-feed-skeleton-group" role="status" aria-live="polite" aria-label="Loading community posts"><span class="screen-reader-text">Loading community posts…</span>${card}${card}</div>`;
    }

    function renderHomeFeed() {
        const isDark = state.settings.theme === 'dark';
        const posts = Array.isArray(state.posts) ? state.posts : [];
        // Blessings behave like stories: keep them in the Blessing carousel/viewer, but do not render them as normal feed cards.
        const filteredPosts = cvVisibleFeedPosts(posts);
        const showDesktopSort = !cvIsMobileViewport();
        const desktopSortToolbar = showDesktopSort ? `
                        <div class="cv-feed-toolbar cv-react-sort-row ${isDark ? 'is-dark' : ''}">
                            <hr />
                            <button type="button" class="cv-feed-toolbar__sort cv-feed-sort-btn">Sort by: <strong>Top</strong> <i data-lucide="chevron-down"></i></button>
                        </div>` : '';

        const savedHeading = state.savedPostsOnly ? `<section class="cv-saved-feed-heading"><div><span>Private collection</span><h1>Saved posts</h1><p>Only you can see the posts you save.</p></div><button type="button" onclick="setTab('home')"><i data-lucide="arrow-left"></i><span>Back to feed</span></button></section>` : '';
        let html = `
            <div class="cv-feed-page cv-feed-page-linkedin cv-react-feed-page max-w-7xl mx-auto w-full px-4 md:px-6 py-8 animate-fade-in pb-32">
                <div class="cv-feed-layout cv-feed-layout--three-col">
                    ${cvRenderFeedLeftSidebar()}
                    <main class="cv-feed-main-column">
                        ${state.savedPostsOnly ? savedHeading : cvRenderStoriesCarousel() + cvRenderFeedComposer()}
                        ${desktopSortToolbar}
                        <div class="space-y-6 cv-feed-stream">
        `;

        if (state.feedLoading) {
            html += cvRenderFeedSkeleton();
        } else if (state.feedError) {
            html += `<div class="cv-feed-load-error" role="status"><strong>Social Feed could not load.</strong><p>${escapeHtml(state.feedError)}</p><button type="button" onclick="loadPosts()">Try again</button></div>`;
        } else if (filteredPosts.length === 0) {
            const hasBlessings = posts.some(cvIsBlessingPost);
            html += `
                <section class="cv-feed-card cv-empty-feed-card" aria-labelledby="cv-empty-feed-title">
                    <div class="cv-empty-feed-card__content">
                        <span class="cv-empty-feed-card__icon" aria-hidden="true"><i data-lucide="message-circle-heart"></i></span>
                        <h2 id="cv-empty-feed-title">${state.savedPostsOnly ? 'No saved posts yet' : (hasBlessings ? 'Your blessings are ready above' : 'Start a meaningful conversation')}</h2>
                        <p>${state.savedPostsOnly ? 'Use the Save button on any post to keep it in this private collection.' : (hasBlessings ? 'Share a post, prayer request, photo, or article to begin your community feed.' : 'Encourage the community with a testimony, prayer request, ministry update, or thoughtful article.')}</p>
                        <div class="cv-empty-feed-card__actions">
                            ${state.savedPostsOnly ? `<button type="button" onclick="setTab('home')"><i data-lucide="arrow-left" aria-hidden="true"></i><span>Browse the feed</span></button>` : `<button type="button" onclick="cvOpenFeedCreate('text')"><i data-lucide="plus" aria-hidden="true"></i><span>Create a post</span></button><button type="button" onclick="setTab('users')"><i data-lucide="users" aria-hidden="true"></i><span>Find people</span></button>`}
                        </div>
                    </div>
                </section>`;
        } else {
            filteredPosts.forEach(post => {
                const selectedReaction = post.current_user_reaction || post.user_reaction || '';
                const reactionMeta = cvReactionMeta(selectedReaction || 'like');
                const isLiked = !!selectedReaction;
                const isSaved = (state.bookmarks || []).map(String).includes(String(post.id));
                const author = post.author || {};
                html += `
                    <article class="cv-feed-card cv-react-post-card p-6 rounded-3xl shadow-sm border transition-shadow hover:shadow-md ${isDark ? 'bg-slate-800 border-slate-700/50' : 'bg-white border-slate-100'}">
                        <div class="cv-feed-card-head flex justify-between items-start mb-5">
                            <div class="cv-feed-author flex items-center gap-3 min-w-0">
                                <button type="button" onclick="cvOpenAuthorProfile(${post.id})" class="cv-plain-button cv-avatar-trigger shrink-0 rounded-full focus:outline-none focus:ring-4 focus:ring-brand-vault/20" title="View profile">
                                    ${renderProfileAvatar({ name: author.name || 'Unknown', avatar_url: author.avatar || author.avatar_url || '' }, 'w-12 h-12', 'text-sm')}
                                </button>
                                <div class="min-w-0">
                                    <button type="button" onclick="cvOpenAuthorProfile(${post.id})" class="cv-plain-button cv-author-trigger cv-feed-author-name-row flex items-center min-w-0 text-left hover:text-brand-vault transition-colors">
                                        <h3 class="inline-flex items-center gap-2 leading-none ${isDark ? 'text-white' : 'text-slate-900'}">
                                            <span class="inline-block leading-none truncate">${escapeHtml(author.name || 'Unknown')}</span>${renderVerificationBadge(author, 'inline')}
                                        </h3>
                                    </button>
                                    <div class="cv-feed-meta cv-feed-meta--privacy-only flex flex-wrap items-center gap-1.5 mt-1.5">
                                        ${cvPostVisibilityPill(post.post_visibility || post.visibility || 'public')}
                                        ${String(post.type || '').toLowerCase() === 'blessing' ? `<span class="cv-blessing-pill">${cvRenderBlessingIcon('cv-blessing-svg-icon--pill')}Blessing</span>` : ''}
                                    </div>
                                </div>
                            </div>
                            <div class="cv-feed-type cv-react-post-menu flex items-center gap-2 text-right shrink-0">
                                ${post.can_delete ? '' : cvSocialFollowButton(author)}
                                ${(post.can_edit || post.can_delete) ? `<div class="cv-post-owner-actions-top cv-owner-action-pills" aria-label="Post owner actions">
                                    ${post.can_edit ? `<button type="button" onclick="editPost('${post.id}')" class="cv-post-owner-btn cv-owner-action-pill cv-owner-action-pill--edit" aria-label="Edit post"><i data-lucide="edit-2"></i><span>Edit</span></button>` : ''}
                                    ${post.can_delete ? `<button type="button" onclick="deletePost('${post.id}')" class="cv-post-owner-btn cv-owner-action-pill cv-owner-action-pill--delete" aria-label="Delete post"><i data-lucide="trash-2"></i><span>Delete</span></button>` : ''}
                                </div>` : ''}
                            </div>
                        </div>

                        <div class="cv-feed-body mb-6 ${isDark ? 'text-slate-200' : 'text-slate-700'}">
                            ${post.type === 'article' ? `
                                <div class="cv-feed-article-box rounded-2xl overflow-hidden ${isDark ? 'bg-slate-900/60 border border-slate-700/60' : 'bg-slate-50 border border-slate-100'}">
                                    ${cvRenderPostMedia(post, isDark)}
                                    <div class="p-5">
                                        <h4 class="cv-feed-article-title ${hasKhmerText(post.article_title || '') ? 'cv-article-title cv-article-khmer' : ''} ${isDark ? 'text-white' : 'text-slate-900'}">${renderLocalizedText(post.article_title || 'Untitled Article')}</h4>
                                        <p class="cv-feed-article-excerpt opacity-70 mb-3 ${hasKhmerText(post.article_excerpt || '') ? 'cv-article-body cv-article-khmer' : ''}">${renderLocalizedText(post.article_excerpt || '')}</p>
                                        <button onclick="openArticle('${post.id}')" class="cv-feed-read-btn">Read article</button>
                                    </div>
                                </div>
                            ` : `
                                <div class="text-[16px] leading-relaxed ${post.type === 'verse' ? 'font-serif text-lg italic' : ''}">
                                    <p>${escapeHtml(post.content || '')}</p>
                                    ${cvRenderPostMedia(post, isDark)}
                                </div>
                            `}
                        </div>

                        <div class="cv-linkedin-post-shell" id="post-${post.id}">
                            ${cvPostCountLine(post)}
                            <div class="cv-linkedin-actions ${isDark ? 'cv-linkedin-actions-dark' : ''}">
                                <div class="cv-reaction-wrap" data-post-id="${post.id}" onmouseenter="cvOpenReactionPicker('${post.id}')" onmouseleave="cvScheduleReactionClose('${post.id}', 320)" onfocusin="cvOpenReactionPicker('${post.id}')" onfocusout="cvScheduleReactionClose('${post.id}', 320)">
                                    ${cvRenderReactionPicker(post.id)}
                                    <button type="button" onclick="likePost('${post.id}')" onpointerdown="cvStartReactionLongPress(event, '${post.id}')" onpointerup="cvCancelReactionLongPress()" onpointerleave="cvCancelReactionLongPress()" oncontextmenu="event.preventDefault(); cvOpenReactionPicker('${post.id}')" class="cv-linkedin-action cv-reaction-trigger ${isLiked ? 'is-active' : ''}" style="${isLiked ? `--cv-reaction-active-color:${reactionMeta.color};--cv-reaction-active-bg:${reactionMeta.bgColor}` : ''}" aria-label="${isLiked ? 'Remove ' + reactionMeta.label + ' reaction' : 'Amen to this post'}" aria-haspopup="menu">
                                        <span class="cv-action-icon ${isLiked ? 'cv-selected-reaction-icon' : 'cv-like-icon'}" style="${isLiked ? `--cv-reaction-color:${reactionMeta.color};--cv-reaction-bg-color:${reactionMeta.bgColor}` : ''}">${isLiked ? cvReactionIconSvg(reactionMeta.iconName, 'cv-selected-reaction-svg') : '<i data-lucide="thumbs-up"></i>'}</span>
                                        <span class="cv-action-label">${isLiked ? reactionMeta.label : 'Amen'}</span>
                                    </button>
                                </div>
                                <button type="button" onclick="cvFocusPostComment('${post.id}')" class="cv-linkedin-action" aria-label="Comment on this post">
                                    <span class="cv-action-icon"><i data-lucide="message-circle"></i></span>
                                    <span class="cv-action-label">Comment</span>
                                </button>
                                <button type="button" onclick="cvSharePost('${post.id}')" class="cv-linkedin-action" aria-label="Share this post">
                                    <span class="cv-action-icon"><i data-lucide="share-2"></i></span>
                                    <span class="cv-action-label">Share</span>
                                </button>
                                <button type="button" onclick="cvTogglePostBookmark('${post.id}')" class="cv-linkedin-action ${isSaved ? 'is-active cv-post-save-active' : ''}" aria-label="${isSaved ? 'Remove this post from saved items' : 'Save this post'}" aria-pressed="${isSaved ? 'true' : 'false'}">
                                    <span class="cv-action-icon"><i data-lucide="bookmark" class="${isSaved ? 'fill-current' : ''}"></i></span>
                                    <span class="cv-action-label">${isSaved ? 'Saved' : 'Save'}</span>
                                </button>
                            </div>
                            <div class="cv-linkedin-comment-row">
                                <div class="cv-comment-avatar">${renderProfileAvatar((state.currentUser && state.currentUser.logged_in) ? Object.assign({}, state.currentUser, { name: state.currentUser.name || 'Me' }) : { name: 'Guest' }, 'w-full h-full', 'text-[10px]')}</div>
                                <div class="cv-comment-input-wrap ${isDark ? 'cv-comment-input-dark' : ''}">
                                    <input id="cv-comment-input-${post.id}" type="text" placeholder="Add a comment..." onkeydown="cvHandleCommentKey(event, '${post.id}')" aria-label="Add a comment" />
                                    <div class="cv-comment-tools" aria-label="Comment tools">
                                        <button type="button" class="cv-comment-tool-btn" onclick="cvInsertCommentEmoji('${post.id}')" aria-label="Insert an emoji" title="Insert emoji"><i data-lucide="smile"></i></button>
                                        <button type="button" class="cv-comment-tool-btn" onclick="cvSelectCommentImage('${post.id}')" aria-label="Add image"><i data-lucide="image"></i></button>
                                        <button type="button" class="cv-comment-send-btn" onclick="cvSubmitPostComment('${post.id}')" aria-label="Post comment"><i data-lucide="send"></i></button>
                                        <input id="cv-comment-image-${post.id}" type="file" accept="image/*" class="cv-comment-image-input" onchange="cvCommentImagePicked('${post.id}')" aria-label="Attach image to comment" />
                                    </div>
                                </div>
                            </div>
                            ${cvRenderPostComments(post)}
                        </div>
                    </article>
                `;
            });
        }
        html += `</div></main>${cvRenderFeedRightSidebar()}</div>${cvRenderBlessingStoryModal()}</div>`;
        return html;
    }


    function renderFindUsers() {
        const isDark = state.settings.theme === 'dark';
        const hidden = new Set((Array.isArray(state.hiddenNetworkUserIds) ? state.hiddenNetworkUserIds : []).map(id => parseInt(id || 0, 10)).filter(Boolean));
        const users = (Array.isArray(state.foundUsers) ? state.foundUsers : []).filter(user => !hidden.has(parseInt(user.id || 0, 10)));
        const query = String(state.userSearch || '');
        const colors = ['slate', 'stone', 'sky', 'indigo', 'emerald', 'cyan', 'rose', 'amber'];

        function networkRole(user) {
            const rawHandle = String(user.handle || user.username || user.user_nicename || user.slug || '').trim();
            const displayHandle = rawHandle ? (rawHandle.charAt(0) === '@' ? rawHandle : '@' + rawHandle) : '';
            return String(user.role || user.ministry || user.church || user.tagline || user.bio || user.description || displayHandle || 'Faith In member').trim();
        }

        function networkConnections(user) {
            const counts = user.counts || {};
            return parseInt(user.mutual || user.mutual_count || user.mutual_connections || counts.mutual || counts.followers || user.followers_count || counts.following || 0, 10) || 0;
        }

        function networkConnectButton(user) {
            const userId = parseInt(user.id || 0, 10);
            const loading = parseInt(state.followLoadingUserId || 0, 10) === userId;
            const following = !!user.is_following;
            if (cvSocialIsSelf(user)) {
                return `<button type="button" onclick="cvOpenUserProfile(${userId})" class="cv-network-connect-btn is-self" aria-label="Open your profile"><i data-lucide="user-check" class="w-4 h-4"></i><span>View Profile</span></button>`;
            }
            return `<button type="button" onclick="cvToggleFollow(${userId}, ${following ? 'true' : 'false'})" class="cv-network-connect-btn ${following ? 'is-pending' : 'is-connect'}" ${loading ? 'disabled' : ''} aria-label="${following ? 'Pending connection with' : 'Connect with'} ${escapeAttr(user.name || 'member')}"><i data-lucide="${following ? 'user-check' : 'user-plus'}" class="w-4 h-4"></i><span>${loading ? 'Saving...' : (following ? 'Pending' : 'Connect')}</span></button>`;
        }

        return `
            <div class="cv-network-page ${isDark ? 'is-dark' : ''}">
                <section class="cv-network-header-card">
                    <div class="cv-network-header-copy">
                        <h1>My Network</h1>
                        <p>Manage your connections and discover new ministry partners.</p>
                    </div>
                    <div class="cv-network-search-wrap">
                        <i data-lucide="search" class="cv-network-search-icon"></i>
                        <input
                            id="cv-find-users-search"
                            type="search"
                            value="${escapeAttr(query)}"
                            oninput="handleUserSearch(this.value)"
                            onkeydown="if(event.key==='Enter'){event.preventDefault();searchUsersNow();}"
                            placeholder="Search by name or role..."
                            class="cv-network-search-input"
                        />
                    </div>
                </section>

                <section class="cv-network-results-card">
                    <header class="cv-network-results-head">
                        <h2>People you may know in your network</h2>
                        <div class="cv-network-head-actions">
                            <button type="button" onclick="loadFoundUsers('', 24)" class="cv-network-refresh-btn">Newest</button>
                            <span>${state.usersLoading ? 'Loading...' : users.length + ' results'}</span>
                        </div>
                    </header>

                    <div class="cv-network-row-wrap">
                        ${state.usersLoading ? `
                            <div class="cv-network-loading"><div class="cv-social-spinner"></div><strong>Finding ministry partners...</strong></div>
                        ` : ''}

                        ${(!state.usersLoading && users.length) ? `
                            <div class="cv-network-scroll-row" aria-label="Network members">
                                ${users.map((user, index) => {
                                    const userId = parseInt(user.id || 0, 10);
                                    const role = networkRole(user);
                                    const connections = networkConnections(user);
                                    const avatarUser = {
                                        name: user.name || 'User',
                                        avatar_url: user.avatar_url || user.avatar || user.profile_image_url || user.profile_image || user.photo_url || user.photoURL || user.picture || ''
                                    };
                                    return `<article class="cv-network-member-card">
                                        <button type="button" onclick="cvHideNetworkUser(${userId})" class="cv-network-dismiss" aria-label="Hide ${escapeAttr(user.name || 'member')}"><i data-lucide="x" class="w-4 h-4"></i></button>
                                        <div class="cv-network-cover cv-network-cover--${colors[index % colors.length]}"></div>
                                        <div class="cv-network-card-body">
                                            <button type="button" onclick="cvOpenUserProfile(${userId})" class="cv-network-avatar-btn cv-plain-button" aria-label="Open ${escapeAttr(user.name || 'member')} profile">
                                                ${renderProfileAvatar(avatarUser, 'cv-network-avatar-media', 'text-3xl')}
                                            </button>
                                            <div class="cv-network-text">
                                                <button type="button" onclick="cvOpenUserProfile(${userId})" class="cv-network-name cv-plain-button">
                                                    <span>${escapeHtml(user.name || 'User')}</span>${renderVerificationBadge(user, 'inline')}
                                                </button>
                                                <p>${escapeHtml(role)}</p>
                                            </div>
                                            <div class="cv-network-mutual">
                                                <i data-lucide="users" class="w-3.5 h-3.5"></i>
                                                <span>${connections ? escapeHtml(connections + ' mutual connections') : 'Faith In member'}</span>
                                            </div>
                                            ${networkConnectButton(user)}
                                        </div>
                                    </article>`;
                                }).join('')}
                            </div>
                        ` : ''}

                        ${(!state.usersLoading && state.usersHasSearched && !users.length) ? `
                            <div class="cv-network-empty">
                                <i data-lucide="users" class="w-12 h-12"></i>
                                <h3>No matches found</h3>
                                <p>Try adjusting your search criteria.</p>
                            </div>
                        ` : ''}
                    </div>
                </section>
            </div>
        `;
    }

    function renderJobs() {
        const filters = ['All', 'Full-time', 'Part-time', 'Volunteer', 'Remote'];
        const quickFilters = [
            { label: 'Jobs', value: 'All' },
            { label: 'Date posted', value: 'All' },
            { label: 'Experience level', value: 'All' },
            { label: 'Remote', value: 'Remote' }
        ];
        const search = String(state.jobSearch || '').toLowerCase().trim();
        const location = String(state.jobLocation || '').toLowerCase().trim();
        const jobs = (Array.isArray(state.jobs) ? state.jobs : []).filter(job => {
            const haystack = [job.title, job.organization, job.description, job.job_type].join(' ').toLowerCase();
            const loc = String(job.location || '').toLowerCase();
            const matchesSearch = !search || haystack.includes(search);
            const matchesLocation = !location || loc.includes(location);
            const filterValue = String(state.jobFilter || 'All').toLowerCase();
            const typeValue = String(job.job_type || '').toLowerCase();
            const matchesType = filterValue === 'all' || typeValue === filterValue || (filterValue === 'remote' && (typeValue.includes('remote') || loc.includes('remote')));
            return matchesSearch && matchesLocation && matchesType;
        });

        const formModal = state.showJobForm ? `
            <div class="cv-job-modal-overlay fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 animate-fade-in duration-200" role="dialog" aria-modal="true" aria-label="${state.editingJobId ? 'Edit job' : 'Post a job'}">
                <div class="cv-job-modal-panel bg-white rounded-lg w-full relative shadow-xl flex flex-col">
                    <div class="cv-job-modal-header flex items-center justify-between p-4 border-b border-[#e0dfdc]">
                        <h2 class="text-xl font-semibold text-black/90">${state.editingJobId ? 'Edit job' : 'Post a job'}</h2>
                        <button type="button" onclick="cancelJobForm()" class="w-8 h-8 rounded-full flex items-center justify-center text-black/60 hover:bg-gray-100 hover:text-black/90 transition-colors" aria-label="Close job form">
                            <i data-lucide="x" class="w-6 h-6"></i>
                        </button>
                    </div>

                    <div class="cv-job-modal-body p-6 overflow-y-auto">
                        <form id="post-job-form" onsubmit="event.preventDefault(); submitJob();" class="cv-job-modal-form space-y-5">
                            <div class="cv-job-modal-stack space-y-4">
                                <div>
                                    <label for="cv-job-title" class="block text-sm font-semibold text-black/90 mb-1">Job title *</label>
                                    <input id="cv-job-title" required type="text" autocomplete="organization-title" value="${escapeAttr(state.jobTitle)}" oninput="updateJobField('jobTitle', this.value)" class="w-full border border-black/60 rounded-md p-2 outline-none focus:border-black/90 focus:ring-1 focus:ring-black/90 transition-all text-black/90 bg-white cv-job-modal-input" />
                                </div>

                                <div>
                                    <label for="cv-job-organization" class="block text-sm font-semibold text-black/90 mb-1">Company / Organization *</label>
                                    <input id="cv-job-organization" required type="text" autocomplete="organization" value="${escapeAttr(state.jobOrganization)}" oninput="updateJobField('jobOrganization', this.value)" class="w-full border border-black/60 rounded-md p-2 outline-none focus:border-black/90 focus:ring-1 focus:ring-black/90 transition-all text-black/90 bg-white cv-job-modal-input" />
                                </div>

                                <div>
                                    <label for="cv-job-type" class="block text-sm font-semibold text-black/90 mb-1">Workplace type</label>
                                    <div class="relative">
                                        <select id="cv-job-type" onchange="updateJobField('jobType', this.value)" class="w-full border border-black/60 rounded-md p-2 outline-none focus:border-black/90 focus:ring-1 focus:ring-black/90 transition-all text-black/90 appearance-none cursor-pointer bg-white cv-job-modal-input">
                                            <option value="On-site" ${state.jobType === 'On-site' ? 'selected' : ''}>On-site</option>
                                            <option value="Hybrid" ${state.jobType === 'Hybrid' ? 'selected' : ''}>Hybrid</option>
                                            <option value="Remote" ${state.jobType === 'Remote' ? 'selected' : ''}>Remote</option>
                                            <option value="Full-time" ${state.jobType === 'Full-time' ? 'selected' : ''}>Full-time</option>
                                            <option value="Part-time" ${state.jobType === 'Part-time' ? 'selected' : ''}>Part-time</option>
                                            <option value="Volunteer" ${state.jobType === 'Volunteer' ? 'selected' : ''}>Volunteer</option>
                                        </select>
                                        <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <svg class="w-4 h-4 text-black/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label for="cv-job-location" class="block text-sm font-semibold text-black/90 mb-1">Job location *</label>
                                    <input id="cv-job-location" required type="text" autocomplete="address-level2" value="${escapeAttr(state.jobLocationField)}" oninput="updateJobField('jobLocationField', this.value)" class="w-full border border-black/60 rounded-md p-2 outline-none focus:border-black/90 focus:ring-1 focus:ring-black/90 transition-all text-black/90 bg-white cv-job-modal-input" />
                                </div>
                            </div>

                            <div class="pt-2">
                                <label for="cv-job-description" class="block text-sm font-semibold text-black/90 mb-1">Job description</label>
                                <textarea id="cv-job-description" required oninput="updateJobField('jobDescription', this.value)" class="w-full border border-black/60 rounded-md p-2 outline-none focus:border-black/90 focus:ring-1 focus:ring-black/90 transition-all text-black/90 h-32 resize-none bg-white cv-job-modal-textarea">${escapeHtml(state.jobDescription)}</textarea>
                            </div>

                            <div class="cv-job-application-fields">
                                <div>
                                    <label for="cv-job-apply-url" class="block text-sm font-semibold text-black/90 mb-1">Secure application link</label>
                                    <input id="cv-job-apply-url" type="url" inputmode="url" value="${escapeAttr(state.jobApplyUrl)}" oninput="updateJobField('jobApplyUrl', this.value)" placeholder="https://example.org/apply" class="w-full border border-black/60 rounded-md p-2 outline-none focus:border-black/90 focus:ring-1 focus:ring-black/90 transition-all text-black/90 bg-white cv-job-modal-input" />
                                </div>
                                <div class="cv-job-field-divider" aria-hidden="true"><span>or</span></div>
                                <div>
                                    <label for="cv-job-contact-email" class="block text-sm font-semibold text-black/90 mb-1">Application email</label>
                                    <input id="cv-job-contact-email" type="email" inputmode="email" value="${escapeAttr(state.jobContactEmail)}" oninput="updateJobField('jobContactEmail', this.value)" placeholder="jobs@example.org" class="w-full border border-black/60 rounded-md p-2 outline-none focus:border-black/90 focus:ring-1 focus:ring-black/90 transition-all text-black/90 bg-white cv-job-modal-input" />
                                </div>
                                <p class="cv-job-application-help">Add at least one application method. FaithIn only accepts secure HTTPS links.</p>
                            </div>
                        </form>
                    </div>

                    <div class="cv-job-modal-footer p-4 border-t border-[#e0dfdc] flex justify-end gap-3 bg-white rounded-b-lg">
                        <button type="button" onclick="cancelJobForm()" class="px-4 py-1.5 rounded-full font-semibold text-sm text-black/60 hover:bg-gray-100 transition-colors">Cancel</button>
                        <button type="submit" form="post-job-form" class="cv-job-primary-btn bg-[#469b76] hover:bg-[#388462] text-white px-5 py-1.5 rounded-full font-semibold text-sm transition-colors"><span class="cv-job-btn-label">${state.editingJobId ? 'Update job' : 'Post job'}</span></button>
                    </div>
                </div>
            </div>` : '';

        const selectedJob = state.selectedJob;
        const selectedJobApplyUrl = selectedJob && /^https:\/\//i.test(String(selectedJob.apply_url || '')) ? String(selectedJob.apply_url) : '';
        const selectedJobEmail = selectedJob && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(selectedJob.contact_email || '')) ? String(selectedJob.contact_email) : '';
        const selectedJobMailHref = selectedJobEmail ? `mailto:${escapeAttr(selectedJobEmail)}?subject=${encodeURIComponent('Application: ' + String((selectedJob && selectedJob.title) || 'FaithIn opportunity'))}` : '';
        const detailsModal = selectedJob ? `
            <div class="cv-job-modal-overlay cv-job-details-overlay fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60" role="dialog" aria-modal="true" aria-labelledby="cv-job-details-title">
                <button type="button" class="cv-job-details-backdrop" onclick="closeJobDetails()" aria-label="Close job details"></button>
                <article class="cv-job-details-panel">
                    <header class="cv-job-details-header">
                        <div class="cv-job-details-icon"><i data-lucide="briefcase-business"></i></div>
                        <div><span>Ministry opportunity</span><h2 id="cv-job-details-title">${escapeHtml(selectedJob.title || 'Untitled job')}</h2><p>${escapeHtml(selectedJob.organization || 'Organization')}</p></div>
                        <button type="button" class="cv-job-details-close" onclick="closeJobDetails()" aria-label="Close job details"><i data-lucide="x"></i></button>
                    </header>
                    <div class="cv-job-details-body">
                        <div class="cv-job-details-meta"><span><i data-lucide="map-pin"></i>${escapeHtml(selectedJob.location || 'Location not listed')}</span><span><i data-lucide="clock-3"></i>${escapeHtml(selectedJob.job_type || 'Full-time')}</span><span><i data-lucide="calendar-clock"></i>${escapeHtml(selectedJob.time || 'Recently')}</span></div>
                        <section><h3>About this role</h3><p>${escapeHtml(selectedJob.description || 'Contact the organization for role details.')}</p></section>
                    </div>
                    <footer class="cv-job-details-actions">
                        <button type="button" class="cv-job-details-secondary" onclick="closeJobDetails()">Close</button>
                        ${selectedJobApplyUrl ? `<a class="cv-job-apply-button" href="${escapeAttr(selectedJobApplyUrl)}" target="_blank" rel="noopener noreferrer"><span>Apply on organization site</span><i data-lucide="external-link"></i></a>` : ''}
                        ${!selectedJobApplyUrl && selectedJobMailHref ? `<a class="cv-job-apply-button" href="${selectedJobMailHref}"><span>Apply by email</span><i data-lucide="mail"></i></a>` : ''}
                    </footer>
                </article>
            </div>` : '';

        let html = `
            <div class="min-h-screen bg-[#f3f2ef] font-sans pt-8 relative animate-fade-in pb-28 cv-job-board-v556 cv-job-board-v557">
                <div class="max-w-4xl mx-auto px-0 md:px-4 pb-6 flex flex-col gap-4">
                    <div class="flex-1">
                        <div class="bg-white rounded-lg border border-[#e0dfdc] overflow-hidden mb-2 mx-4 md:mx-0">
                            <div class="flex flex-col md:flex-row">
                                <div class="flex items-center p-3 flex-1 border-b md:border-b-0 md:border-r border-[#e0dfdc]">
                                    <i data-lucide="search" class="w-5 h-5 text-black/60 mr-2 flex-shrink-0"></i>
                                    <input type="text" value="${escapeAttr(state.jobSearch || 'Christian Jobs & Ministry Roles')}" onfocus="if (this.value === 'Christian Jobs & Ministry Roles') this.value = '';" oninput="handleJobSearch(this.value === 'Christian Jobs & Ministry Roles' ? '' : this.value)" placeholder="Job title, skill, or company" class="w-full outline-none text-black/90 placeholder-black/60 text-sm font-semibold bg-transparent border-none" />
                                </div>
                                <div class="flex items-center p-3 flex-1">
                                    <i data-lucide="map-pin" class="w-5 h-5 text-black/60 mr-2 flex-shrink-0"></i>
                                    <input type="text" value="${escapeAttr(state.jobLocation)}" oninput="handleJobLocation(this.value)" placeholder="City, state, or zip code" class="w-full outline-none text-black/90 placeholder-black/60 text-sm font-semibold bg-transparent border-none" />
                                </div>
                            </div>
                            <div class="p-3 bg-white flex justify-end border-t border-[#e0dfdc]">
                                <button type="button" onclick="loadJobs()" class="cv-job-primary-btn bg-[#469b76] hover:bg-[#388462] text-white px-5 py-1.5 rounded-full font-semibold text-sm transition-colors"><span class="cv-job-btn-label">Search</span></button>
                            </div>
                        </div>

                        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 px-4 md:px-0 gap-4 mt-4">
                            <div class="flex gap-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar w-full md:w-auto">
                                ${quickFilters.map(f => {
                                    const active = (f.label === 'Jobs' && (state.jobFilter || 'All') === 'All') || (f.value === 'Remote' && state.jobFilter === 'Remote');
                                    return `<button type="button" onclick="setJobFilter('${escapeAttr(f.value)}')" class="cv-job-filter-pill ${active ? 'cv-job-filter-active' : 'cv-job-filter-normal'} whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-semibold transition-all shadow-sm border ${active ? 'bg-[#469b76] text-white border-[#469b76] hover:bg-[#388462]' : 'border-black/60 text-black/60 hover:bg-gray-100 hover:text-black/90 hover:border-black/90'}"><span class="cv-job-filter-label">${escapeHtml(f.label)}</span></button>`;
                                }).join('')}
                            </div>
                            <button type="button" onclick="openJobForm()" class="cv-job-outline-btn text-[#469b76] border border-[#469b76] hover:bg-green-50 hover:border-[#388462] px-5 py-1.5 rounded-full text-sm font-semibold transition-colors flex items-center gap-2 flex-shrink-0 w-full md:w-auto justify-center">
                                <span class="cv-job-btn-label">Post a free job</span>
                            </button>
                        </div>

                        <div class="bg-white rounded-lg border border-[#e0dfdc] mx-4 md:mx-0 overflow-hidden">
                            <div class="p-4 border-b border-[#e0dfdc]">
                                <h2 class="text-lg font-semibold text-black/90">Recommended for you</h2>
                                <p class="text-sm text-black/60">Based on your profile and search history</p>
                            </div>
        `;

        if (!jobs.length) {
            html += `
                <div class="text-center py-16 px-6 text-black/60">
                    <i data-lucide="briefcase" class="w-12 h-12 mx-auto mb-4 text-black/40"></i>
                    <h3 class="text-xl font-extrabold mb-2 text-black/90">No jobs found</h3>
                    <p class="text-black/60">Try another search or post the first opportunity.</p>
                </div>`;
        } else {
            jobs.forEach(job => {
                const loc = String(job.location || '');
                const type = String(job.job_type || 'Full-time');
                const isNew = String(job.time || '').toLowerCase().includes('second') || String(job.time || '').toLowerCase().includes('minute') || String(job.time || '').toLowerCase() === 'just now';
                const isPromoted = !!(job.is_promoted || job.promoted || job.featured);
                html += `
                    <div class="cv-job-result-card flex gap-4 p-4 border-b border-[#e0dfdc] cursor-pointer hover:bg-gray-50 transition-colors group last:border-b-0" role="button" tabindex="0" onclick="openJobDetails('${escapeAttr(job.id)}')" onkeydown="if(event.target===this&&(event.key==='Enter'||event.key===' ')){event.preventDefault();openJobDetails('${escapeAttr(job.id)}')}" aria-label="View ${escapeAttr(job.title || 'job')} details">
                        <div class="w-14 h-14 bg-[#f3f2ef] flex-shrink-0 flex items-center justify-center rounded-sm">
                            <i data-lucide="building" class="w-8 h-8 text-black/60"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex justify-between items-start gap-3">
                                <h3 class="cv-job-card-title text-[#469b76] font-semibold text-base group-hover:underline leading-tight mb-0.5 truncate">${escapeHtml(job.title || 'Untitled Job')}</h3>
                            </div>
                            <p class="text-black/90 text-sm truncate">${escapeHtml(job.organization || 'Organization')}</p>
                            <p class="text-black/60 text-sm mb-1 truncate">${escapeHtml(loc || 'Location not listed')}</p>
                            <div class="flex items-center gap-3 mt-2 flex-wrap">
                                <span class="text-black/60 text-xs font-semibold flex items-center gap-1 bg-[#f3f2ef] px-2 py-0.5 rounded-sm">${escapeHtml(type)}</span>
                                ${isNew ? `
                                    <span class="cv-job-new-label text-[#469b76] font-semibold text-xs flex items-center gap-1">
                                        <span class="cv-job-new-check w-3.5 h-3.5 bg-[#469b76] rounded-full flex items-center justify-center text-white text-[8px] font-bold">✓</span>
                                        New Listing
                                    </span>` : `
                                    <span class="text-black/60 text-xs font-semibold flex items-center gap-1">
                                        <i data-lucide="users" class="w-4 h-4"></i> actively recruiting
                                    </span>`}
                            </div>
                            <p class="text-black/60 text-xs mt-3 flex items-center gap-1">
                                ${escapeHtml(job.time || 'Recently')} • ${isPromoted ? 'Promoted' : '<span class="font-semibold text-black/90">Apply now</span>'}
                            </p>
                            ${(job.can_edit || job.can_delete) ? `<div class="cv-owner-action-pills cv-job-owner-tools" aria-label="Job owner actions">
                                ${job.can_edit ? `<button type="button" onclick="event.stopPropagation(); editJob('${job.id}')" class="cv-owner-action-pill cv-owner-action-pill--edit" aria-label="Edit job post"><i data-lucide="edit-2"></i><span>Edit</span></button>` : ''}
                                ${job.can_delete ? `<button type="button" onclick="event.stopPropagation(); deleteJob('${job.id}')" class="cv-owner-action-pill cv-owner-action-pill--delete" aria-label="Delete job post"><i data-lucide="trash-2"></i><span>Delete</span></button>` : ''}
                            </div>` : ''}
                        </div>
                    </div>`;
            });
        }

        html += `
                        </div>
                    </div>
                </div>
                ${formModal}
                ${detailsModal}
            </div>`;
        return html;
    }

    function renderPrayer() {
        const isDark = state.settings.theme === 'dark';
        let sorted = [...state.prayers].sort((a, b) => {
            if (state.prayerFilter === 'Most Prayed') return (b.prayed_count||0) - (a.prayed_count||0);
            if (state.prayerFilter === 'Urgent') return (a.urgent === b.urgent) ? 0 : a.urgent ? -1 : 1;
            return new Date(b.timestamp) - new Date(a.timestamp);
        });

        let html = `
            <div class="max-w-5xl mx-auto w-full px-6 py-10 animate-fade-in">
                <div class="bg-gradient-to-r from-brand-dark to-slate-800 rounded-[2rem] p-10 text-white shadow-2xl mb-10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                    <i data-lucide="globe-2" class="absolute -right-10 -bottom-10 w-64 h-64 text-white opacity-5"></i>
                    <div class="relative z-10 max-w-3xl text-center md:text-left">
                        <div class="inline-flex items-center gap-2 text-brand-vault text-xs font-bold uppercase tracking-widest mb-4 bg-brand-vault/10 px-3 py-1.5 rounded-full"><i data-lucide="users" class="w-4 h-4"></i> Global Network</div>
                        <h2 class="text-4xl font-extrabold mb-4">The Prayer Wall</h2>
                        <p class="text-slate-300 text-lg opacity-90 leading-relaxed">"Carry each other's burdens, and in this way you will fulfill the law of Christ."</p>
                    </div>
                    <div class="relative z-10 w-full md:w-auto">
                        <button onclick="openModal('prayer')" class="w-full md:w-auto bg-brand-vault text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg shadow-brand-vault/30 hover:bg-[#198f75] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                            <i data-lucide="plus-circle" class="w-5 h-5"></i> Share Request
                        </button>
                    </div>
                </div>

                <div class="flex justify-between items-center mb-6 px-2">
                    <h3 class="font-extrabold text-2xl ${isDark ? 'text-white' : 'text-slate-900'}">Recent Requests</h3>
                    <select onchange="setPrayerFilter(this.value)" class="text-sm font-bold border-2 rounded-xl px-4 py-2 outline-none cursor-pointer ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'} shadow-sm">
                        ${['Newest', 'Most Prayed', 'Urgent'].map(f => `<option ${state.prayerFilter === f ? 'selected' : ''}>${f}</option>`).join('')}
                    </select>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        `;

        sorted.forEach(p => {
            const bgClass = p.urgent ? (isDark ? 'bg-rose-950/20 border-rose-900/50' : 'bg-rose-50/50 border-rose-200') : (isDark ? 'bg-slate-800 border-slate-700/50' : 'bg-white border-slate-100');

            html += `
                <div class="p-6 rounded-[2rem] shadow-sm border ${bgClass} transition-all hover:shadow-md flex flex-col">
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-sm text-slate-600 dark:text-slate-300">${(p.author||'A').charAt(0)}</div>
                            <div>
                                <span class="font-bold text-[15px] block leading-none ${isDark ? 'text-white' : 'text-slate-900'}">${p.author}</span>
                                <span class="text-[11px] opacity-60 font-medium">${p.time}</span>
                            </div>
                        </div>
                        ${p.urgent ? '<span class="text-[10px] bg-rose-500 text-white px-2.5 py-1 rounded-md uppercase font-bold tracking-wider">Urgent</span>' : ''}
                    </div>
                    <p class="text-[16px] mb-6 leading-relaxed opacity-90 flex-1 ${isDark ? 'text-slate-200' : 'text-slate-700'}">${escapeHtml(p.content || '')}</p>
                    <div class="flex items-center justify-between border-t pt-4 ${isDark ? 'border-slate-700/50' : 'border-slate-100'}">
                        <span class="text-sm font-bold flex items-center gap-1.5 opacity-70"><i data-lucide="heart" class="w-4 h-4 text-rose-500 fill-rose-500"></i> ${p.prayed_count||0} praying</span>
                        ${(p.can_edit || p.can_delete) ? `<div class="cv-owner-action-pills cv-prayer-owner-tools" aria-label="Prayer request owner actions">
                            ${p.can_edit ? `<button type="button" onclick="editPrayer('${p.id}')" class="cv-owner-action-pill cv-owner-action-pill--edit" aria-label="Edit prayer request"><i data-lucide="edit-2"></i><span>Edit</span></button>` : ''}
                            ${p.can_delete ? `<button type="button" onclick="deletePrayer('${p.id}')" class="cv-owner-action-pill cv-owner-action-pill--delete" aria-label="Delete prayer request"><i data-lucide="trash-2"></i><span>Delete</span></button>` : ''}
                        </div>` : ''}
                    </div>
                </div>
            `;
        });

        html += `</div></div>`;
        return html;
    }

    function renderCreate() {
        const isDark = state.settings.theme === 'dark';
        if(state.isUploading || state.isPublishingPost) {
            const pct = Math.max(0, Math.min(100, parseInt(state.publishProgress || 0, 10)));
            const status = state.publishStatus || 'Publishing smoothly...';
            return `
                <div class="cv-publish-stage w-full flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
                    <div class="cv-publish-loader ${isDark ? 'cv-publish-loader-dark' : ''}">
                        <div class="cv-publish-loader__ring" style="--cv-progress:${pct};">
                            <div class="cv-publish-loader__inner">
                                <span class="cv-publish-loader__percent">${pct}%</span>
                            </div>
                        </div>
                        <h2 class="cv-publish-loader__title ${isDark ? 'text-white' : 'text-brand-dark'}">Publishing</h2>
                        <p class="opacity-70 text-base font-semibold">${escapeHtml(status)}</p>
                        <div class="cv-publish-loader__bar" aria-label="Publishing progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}">
                            <span style="width:${pct}%"></span>
                        </div>
                        <p class="cv-publish-loader__hint">Large videos can take a moment. Keep this page open until it finishes.</p>
                    </div>
                </div>
            `;
        }

        if (state.createMode === 'resource') {
            if (authRequired() && !state.isLoggedIn) {
                return `
                    <div class="min-h-screen bg-[#F3F2EF] py-12 px-4 flex justify-center font-sans animate-fade-in">
                        <div class="w-full max-w-[744px]">${renderUnifiedAuthCard()}</div>
                    </div>
                `;
            }
            return `
                <div class="min-h-screen bg-[#F3F2EF] py-12 px-4 flex justify-center font-sans animate-fade-in">
                    <div class="w-full max-w-[744px] bg-white rounded-lg shadow-sm border border-[#E0DFDC] overflow-hidden self-start">
                        <div class="p-6 border-b border-[#E0DFDC]">
                            <h1 class="text-xl font-semibold text-[rgba(0,0,0,0.9)]">Distribute a Resource</h1>
                            <p class="text-sm text-[rgba(0,0,0,0.6)] mt-1">Share teaching videos, PDF tracts, or lesson bundles with the community.</p>
                        </div>

                        <form class="p-6 space-y-6" onsubmit="event.preventDefault(); publishResource();">
                            <div class="col-span-2">
                                <label class="block text-sm font-semibold text-[rgba(0,0,0,0.9)] mb-1">Resource Title</label>
                                <input
                                    type="text"
                                    id="resource-title-input"
                                    name="resource_title"
                                    value="${escapeAttr(state.resTitle)}"
                                    autocomplete="off"
                                    autocapitalize="sentences"
                                    spellcheck="true"
                                    oninput="updatePostForm('resTitle', this.value)"
                                    placeholder="e.g. Gospel Study Guide"
                                    class="w-full px-3 py-2 text-sm text-[rgba(0,0,0,0.9)] bg-transparent border border-gray-400 rounded hover:bg-gray-50 focus:bg-transparent focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] outline-none transition-all placeholder:text-[rgba(0,0,0,0.6)]"
                                />
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-sm font-semibold text-[rgba(0,0,0,0.9)] mb-1">Name</label>
                                    <input
                                        type="text"
                                        value="${escapeAttr(state.contributorName)}"
                                        oninput="updatePostForm('contributorName', this.value)"
                                        placeholder="Your name"
                                        class="w-full px-3 py-2 text-sm text-[rgba(0,0,0,0.9)] bg-transparent border border-gray-400 rounded hover:bg-gray-50 focus:bg-transparent focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] outline-none transition-all placeholder:text-[rgba(0,0,0,0.6)]"
                                    />
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold text-[rgba(0,0,0,0.9)] mb-1">Role</label>
                                    <input
                                        type="text"
                                        value="${escapeAttr(state.contributorRole)}"
                                        oninput="updatePostForm('contributorRole', this.value)"
                                        placeholder="Pastor, teacher, leader..."
                                        class="w-full px-3 py-2 text-sm text-[rgba(0,0,0,0.9)] bg-transparent border border-gray-400 rounded hover:bg-gray-50 focus:bg-transparent focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] outline-none transition-all placeholder:text-[rgba(0,0,0,0.6)]"
                                    />
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-sm font-semibold text-[rgba(0,0,0,0.9)] mb-1">Church</label>
                                    <input
                                        type="text"
                                        value="${escapeAttr(state.contributorChurch)}"
                                        oninput="updatePostForm('contributorChurch', this.value)"
                                        placeholder="Church name"
                                        class="w-full px-3 py-2 text-sm text-[rgba(0,0,0,0.9)] bg-transparent border border-gray-400 rounded hover:bg-gray-50 focus:bg-transparent focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] outline-none transition-all placeholder:text-[rgba(0,0,0,0.6)]"
                                    />
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold text-[rgba(0,0,0,0.9)] mb-1">Ministry</label>
                                    <input
                                        type="text"
                                        value="${escapeAttr(state.contributorMinistry)}"
                                        oninput="updatePostForm('contributorMinistry', this.value)"
                                        placeholder="Ministry name"
                                        class="w-full px-3 py-2 text-sm text-[rgba(0,0,0,0.9)] bg-transparent border border-gray-400 rounded hover:bg-gray-50 focus:bg-transparent focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] outline-none transition-all placeholder:text-[rgba(0,0,0,0.6)]"
                                    />
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-sm font-semibold text-[rgba(0,0,0,0.9)] mb-1">Format</label>
                                    <div class="relative">
                                        <select onchange="updatePostForm('resFormat', this.value)" class="w-full px-3 py-2 text-sm text-[rgba(0,0,0,0.9)] bg-transparent border border-gray-400 rounded hover:bg-gray-50 focus:bg-transparent focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] outline-none appearance-none transition-all">
                                            <option value="pdf" ${state.resFormat === 'pdf' ? 'selected' : ''}>PDF Tract</option>
                                            <option value="video" ${state.resFormat === 'video' ? 'selected' : ''}>Video Content</option>
                                            <option value="audio" ${state.resFormat === 'audio' ? 'selected' : ''}>Audio Lesson</option>
                                            <option value="zip" ${state.resFormat === 'zip' ? 'selected' : ''}>Lesson Bundle</option>
                                        </select>
                                        <i data-lucide="chevron-down" class="absolute right-3 top-[10px] h-4 w-4 text-[rgba(0,0,0,0.6)] pointer-events-none"></i>
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold text-[rgba(0,0,0,0.9)] mb-1">Category</label>
                                    <div class="relative">
                                        <select onchange="updatePostForm('resCategory', this.value)" class="w-full px-3 py-2 text-sm text-[rgba(0,0,0,0.9)] bg-transparent border border-gray-400 rounded hover:bg-gray-50 focus:bg-transparent focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] outline-none appearance-none transition-all">
                                            <option ${state.resCategory === 'Bible Study' ? 'selected' : ''}>Bible Study</option>
                                            <option ${state.resCategory === 'Leadership' ? 'selected' : ''}>Leadership</option>
                                            <option ${state.resCategory === 'Youth Ministry' ? 'selected' : ''}>Youth Ministry</option>
                                            <option ${state.resCategory === 'Theology' ? 'selected' : ''}>Theology</option>
                                            <option ${state.resCategory === 'Evangelism' ? 'selected' : ''}>Evangelism</option>
                                            <option ${state.resCategory === 'Discipleship' ? 'selected' : ''}>Discipleship</option>
                                        </select>
                                        <i data-lucide="chevron-down" class="absolute right-3 top-[10px] h-4 w-4 text-[rgba(0,0,0,0.6)] pointer-events-none"></i>
                                    </div>
                                </div>
                            </div>

                            <hr class="border-[#E0DFDC] my-6" />

                            <div>
                                <label class="block text-sm font-semibold text-[rgba(0,0,0,0.9)] mb-3">Thumbnail Image <span class="font-normal text-[rgba(0,0,0,0.6)]">(Optional)</span></label>
                                <div class="border border-[#E0DFDC] rounded-lg p-4 flex flex-col sm:flex-row items-center gap-4 bg-[#F9FAFB]">
                                    <div id="thumbnail-preview" class="w-16 h-16 bg-white border border-[#E0DFDC] rounded-md overflow-hidden flex items-center justify-center text-[rgba(0,0,0,0.4)] flex-shrink-0">
                                        ${state.thumbnailPreviewUrl ? `<img src="${escapeAttr(state.thumbnailPreviewUrl)}" class="w-full h-full object-cover" alt="Thumbnail preview" />` : '<i data-lucide="image" class="h-6 w-6"></i>'}
                                    </div>
                                    <div class="flex-1 text-center sm:text-left">
                                        <input type="file" id="resource-thumbnail" class="hidden" accept="image/*" onchange="updateThumbnailName(this)" />
                                        <h4 id="thumbnail-name-display" class="text-sm font-semibold text-[rgba(0,0,0,0.9)]">${state.selectedThumbnailName || 'No custom thumbnail selected'}</h4>
                                        <p class="text-xs text-[rgba(0,0,0,0.6)] mt-1 max-w-[400px]">Leave empty for PDF first-page thumbnail or automatic file thumbnail.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onclick="document.getElementById('resource-thumbnail').click()"
                                        class="mt-3 sm:mt-0 px-4 py-1.5 border border-[#0A66C2] text-[#0A66C2] text-sm font-semibold rounded-full hover:bg-[#EBF4FD] hover:border-[#004182] hover:text-[#004182] transition-colors whitespace-nowrap"
                                    >Choose Thumbnail</button>
                                </div>
                            </div>

                            <div>
                                <label class="block text-sm font-semibold text-[rgba(0,0,0,0.9)] mb-3">Upload File</label>
                                <div onclick="document.getElementById('resource-file').click()" class="border border-dashed border-gray-400 rounded-lg p-8 flex flex-col items-center justify-center text-center bg-[#F9FAFB] hover:bg-[#F3F2EF] transition-colors cursor-pointer group">
                                    <input type="file" id="resource-file" class="hidden" accept="image/*,application/pdf,video/*,audio/*,.zip" onchange="updateFileName(this)" />
                                    <div class="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center mb-4 group-hover:shadow-sm transition-all">
                                        <i data-lucide="upload" class="h-5 w-5 text-[rgba(0,0,0,0.6)]"></i>
                                    </div>
                                    <button
                                        type="button"
                                        onclick="event.stopPropagation(); document.getElementById('resource-file').click()"
                                        class="px-4 py-1.5 border border-[rgba(0,0,0,0.6)] text-[rgba(0,0,0,0.6)] text-sm font-semibold rounded-full group-hover:border-[#0A66C2] group-hover:text-[#0A66C2] transition-colors mb-3"
                                    >Select File</button>
                                    <h4 id="file-name-display" class="text-sm font-semibold text-[rgba(0,0,0,0.9)]">${state.selectedFileName || 'No file selected'}</h4>
                                    <p class="text-xs text-[rgba(0,0,0,0.6)] mt-1">Max upload size: 50MB</p>
                                </div>
                            </div>
                        </form>

                        <div class="p-4 border-t border-[#E0DFDC] bg-white flex justify-end gap-3 rounded-b-lg">
                            <button
                                type="button"
                                onclick="cvSaveResourceDraft()"
                                class="px-4 py-2 rounded-full text-sm font-semibold text-[rgba(0,0,0,0.6)] hover:bg-[#F3F2EF] hover:text-[rgba(0,0,0,0.9)] transition-colors"
                            >Save as draft</button>
                            <button
                                type="button"
                                onclick="publishResource()"
                                ${state.isUploading ? 'disabled' : ''}
                                class="px-5 py-2 rounded-full text-sm font-semibold bg-[#0A66C2] text-white hover:bg-[#004182] transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >Post to Library</button>
                        </div>
                    </div>
                </div>
            `;
        }

        let html = `
            <div class="cv-create-page ${state.createMode === 'post' ? 'cv-create-page--posting' : ''} max-w-5xl mx-auto w-full px-4 md:px-6 py-8 animate-fade-in">
                <div class="cv-create-toggle flex p-1.5 rounded-2xl mb-8 shadow-inner border max-w-sm mx-auto ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}">
                    <button onclick="setCreateMode('post')" class="flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${state.createMode === 'post' ? 'bg-white dark:bg-slate-700 text-brand-vault shadow-md' : 'opacity-60 hover:opacity-100'}">Write Post</button>
                    <button onclick="setCreateMode('resource')" class="flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${state.createMode === 'resource' ? 'bg-white dark:bg-slate-700 text-brand-vault shadow-md' : 'opacity-60 hover:opacity-100'}">Upload Resource</button>
                </div>

                ${authRequired() && !state.isLoggedIn ? `
                        <div class="cv-create-auth-card mb-6">${renderUnifiedAuthCard()}</div>` : ''}
                <div class="cv-create-form-card bg-white dark:bg-slate-800 rounded-[2rem] p-6 md:p-8 shadow-xl border ${isDark ? 'border-slate-700' : 'border-slate-100'}">
        `;

        if (authRequired() && !state.isLoggedIn) {
            html += `</div></div>`;
            return html;
        }

        if (state.createMode === 'post') {
            const mediaCount = (state.selectedPostMediaFiles || []).length;
            const hasMedia = mediaCount > 0;
            const isReel = state.postMediaMode === 'reel';
            const mediaTitle = isReel ? 'Add a Reel' : (hasMedia ? (mediaCount + ' media selected') : 'Add an image');
            const mediaHelp = isReel ? 'Publish one Reel video of any length. Supported files: MP4, MOV, M4V, WEBM, OGV.' : (hasMedia ? 'Upload up to 10 photos, or one Reel video of any length.' : 'Enhance your post with visual content.');
            const mediaLabel = hasMedia ? (isReel ? 'Reel selected' : state.selectedPostCoverName) : 'No media selected';
            const mediaReadyPercent = hasMedia ? Math.max(0, Math.min(100, parseInt(state.postMediaReadyPercent || 0, 10))) : 0;
            const mediaReady = !hasMedia || mediaReadyPercent >= 100;
            const needsUploadedMedia = !!(state.selectedPostMediaFiles && state.selectedPostMediaFiles.length);
            const stagedReady = !needsUploadedMedia || (!!state.postMediaServerReady && !!(state.stagedPostMedia && state.stagedPostMedia.length));
            const isArticleComposer = state.postType === 'Article';
            const isBlessingComposer = state.postType === 'Blessing' || state.createIntent === 'blessing';
            const hasBlessingMusic = !!(state.selectedBlessingMusicFile || state.selectedBlessingPresetMusic || state.blessingMusicPreviewUrl);
            const publishDisabled = state.isPublishingPost || state.postMediaUploadInProgress || !mediaReady || !stagedReady || (!state.postContent.trim() && !hasMedia && state.postType !== 'Article' && !(isBlessingComposer && hasBlessingMusic)) || (state.postType === 'Article' && !state.postContent.trim());
            const blessingBgColor = cvNormalizeBlessingBgColor(state.blessingBgColor);
            const blessingColorPickerHtml = CV_BLESSING_COLOR_PALETTE.map(function(meta) {
                const active = blessingBgColor === meta.key;
                return `<button type="button" class="cv-blessing-color-choice ${active ? 'is-active' : ''}" style="${escapeAttr(cvBlessingBgStyle(meta.key))}" onclick="cvSetBlessingBgColor('${escapeAttr(meta.key)}')" aria-label="Use ${escapeAttr(meta.label)} blessing background" aria-pressed="${active ? 'true' : 'false'}"><span>${active ? '<i data-lucide="check"></i>' : ''}</span></button>`;
            }).join('');
            const blessingPresetMusicHtml = CV_BLESSING_PRESET_MUSIC.map(function(item) {
                const active = state.selectedBlessingPresetMusic === item.id;
                return `<button type="button" class="cv-blessing-preset-music ${active ? 'is-active' : ''}" onclick="cvSelectBlessingPresetMusic('${escapeAttr(item.id)}')" aria-pressed="${active ? 'true' : 'false'}">
                    <span class="cv-blessing-preset-music__icon"><i data-lucide="music-2"></i></span>
                    <span class="cv-blessing-preset-music__copy"><strong>${escapeHtml(item.title)}</strong><small>30s ${escapeHtml(item.subtitle)}</small></span>
                    ${active ? '<span class="cv-blessing-preset-music__check"><i data-lucide="check"></i></span>' : ''}
                </button>`;
            }).join('');
            const blessingMusicPreviewHtml = hasBlessingMusic ? `<div class="cv-blessing-music-preview">
                <div class="cv-blessing-music-preview__top"><i data-lucide="music-2"></i><span>${escapeHtml(state.selectedBlessingMusicName || 'Christian music')}</span><button type="button" onclick="cvRemoveBlessingMusic()" aria-label="Remove Christian music"><i data-lucide="x"></i></button></div>
                <audio controls preload="metadata" src="${escapeAttr(state.blessingMusicPreviewUrl)}"></audio>
            </div>` : '';
            const composerTitle = isArticleComposer ? 'Write an article' : (isBlessingComposer ? 'Add Blessing' : 'Create a post');
            const composerPlaceholder = isArticleComposer ? 'Write your article content here...' : (isBlessingComposer ? 'Share a blessing, testimony, verse, answered prayer, or encouragement...' : 'What do you want to talk about?');
            const composerPublishLabel = isArticleComposer ? 'Publish' : (isBlessingComposer ? 'Share Blessing' : 'Post');
            const postingVisibility = cvNormalizePostVisibility(state.postVisibility);
            const composerPreviewItems = (state.postMediaPreviewUrls && state.postMediaPreviewUrls.length)
                ? state.postMediaPreviewUrls
                : ((state.stagedPostMedia && state.stagedPostMedia.length)
                    ? state.stagedPostMedia.map(function(item) {
                        const rawUrl = item && (item.local_url || item.url || item.drive_url || item.preview_url || item.previewUrl || '');
                        const rawType = String((item && (item.type || item.mime)) || '').toLowerCase();
                        return {
                            url: rawUrl,
                            type: rawType.indexOf('video') !== -1 ? 'video' : 'image',
                            name: (item && (item.name || item.filename || item.title)) || ''
                        };
                    }).filter(function(item) { return !!item.url; })
                    : []);
            const composerImagePreviewHtml = composerPreviewItems.slice(0, 10).map(function(item, idx) {
                return `<img src="${escapeAttr(item.url)}" alt="Post media ${idx + 1}" loading="eager" decoding="async" />`;
            }).join('');
            const composerReelPreviewHtml = composerPreviewItems.slice(0, 1).map(function(item) {
                return `<video src="${escapeAttr(item.url)}" muted playsinline preload="metadata" controls></video>`;
            }).join('');
            html += `
                <div class="cv-modern-compose cv-posting-modal ${isDark ? 'cv-modern-compose-dark' : ''}">
                    <div class="cv-posting-modal__header">
                        <h2>${composerTitle}</h2>
                        <button type="button" class="cv-posting-modal__close" onclick="setTab('home')" aria-label="Close composer"><i data-lucide="x" class="w-7 h-7"></i></button>
                    </div>

                    <div class="cv-posting-modal__body ${hasMedia ? 'has-media' : ''}">
                        <input type="file" id="post-cover-image" class="hidden" accept="image/*,video/*,.mp4,.m4v,.mov,.qt,.webm,.ogv" multiple onchange="updatePostCoverName(this)" />
                        <input type="file" id="blessing-music-input" class="hidden" accept="audio/*,.mp3,.m4a,.aac,.wav,.ogg,.oga,.opus" onchange="updateBlessingMusicName(this)" />

                        <div class="cv-posting-author">
                            <div class="cv-posting-author__avatar">
                                ${renderProfileAvatar(state.currentUser || { name: state.postAuthorName || 'Faith' }, 'w-14 h-14', 'text-base')}
                            </div>
                            <div class="cv-posting-author__meta">
                                <span class="cv-posting-author__name">${escapeHtml((state.currentUser && state.currentUser.name) || state.postAuthorName || 'Faith')}</span>
                                <div class="cv-posting-privacy-toggle" role="group" aria-label="Post visibility">
                                    <button type="button" class="cv-posting-privacy-choice ${postingVisibility === 'public' ? 'is-active' : ''}" onclick="setPostVisibility('public')" aria-pressed="${postingVisibility === 'public' ? 'true' : 'false'}">
                                        <i data-lucide="globe-2" class="w-4 h-4"></i>
                                        <span>Public</span>
                                    </button>
                                    <button type="button" class="cv-posting-privacy-choice ${postingVisibility === 'private' ? 'is-active' : ''}" onclick="setPostVisibility('private')" aria-pressed="${postingVisibility === 'private' ? 'true' : 'false'}">
                                        <i data-lucide="lock" class="w-4 h-4"></i>
                                        <span>Private</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        ${isArticleComposer ? `
                            <div class="cv-posting-article-fields">
                                <input class="cv-posting-article-title" type="text" value="${escapeAttr(state.postTitle)}" oninput="updatePostForm('postTitle', this.value)" placeholder="Article Title" />
                                <div class="cv-posting-article-grid">
                                    <input type="text" value="${escapeAttr(state.postAuthorName)}" oninput="updatePostForm('postAuthorName', this.value)" placeholder="Author name" />
                                    <input type="text" value="${escapeAttr(state.postAuthorRole)}" oninput="updatePostForm('postAuthorRole', this.value)" placeholder="Role" />
                                    <input type="text" value="${escapeAttr(state.postAuthorChurch)}" oninput="updatePostForm('postAuthorChurch', this.value)" placeholder="Church" />
                                    <input type="text" value="${escapeAttr(state.postAuthorMinistry)}" oninput="updatePostForm('postAuthorMinistry', this.value)" placeholder="Ministry" />
                                </div>
                                <textarea class="cv-posting-article-excerpt" oninput="updatePostForm('postExcerpt', this.value)" placeholder="Short article summary or excerpt">${escapeHtml(state.postExcerpt)}</textarea>
                            </div>
                        ` : ''}

                        ${isBlessingComposer ? `
                            <div class="cv-blessing-style-panel" aria-label="Blessing background color">
                                <div class="cv-blessing-style-panel__copy">
                                    <strong>Background color</strong>
                                    <span>Choose a color for your text blessing.</span>
                                </div>
                                <div class="cv-blessing-color-picker" role="group" aria-label="Choose blessing background color">${blessingColorPickerHtml}</div>
                            </div>
                            <div class="cv-blessing-music-panel" aria-label="Christian music">
                                <div class="cv-blessing-style-panel__copy">
                                    <strong>Christian music</strong>
                                    <span>Choose one of 10 free 30-second worship instrumentals, or upload your own permitted audio.</span>
                                </div>
                                <div class="cv-blessing-preset-music-grid" role="group" aria-label="Choose free Blessing music">
                                    ${blessingPresetMusicHtml}
                                </div>
                                <div class="cv-blessing-music-panel__actions">
                                    <button type="button" class="cv-blessing-music-add" onclick="cvPostingOpenBlessingMusic()"><i data-lucide="upload-cloud"></i><span>${hasBlessingMusic ? 'Upload different music' : 'Upload my own music'}</span></button>
                                </div>
                                ${blessingMusicPreviewHtml}
                            </div>
                        ` : ''}

                        <textarea id="post-content-textarea" oninput="updatePostForm('postContent', this.value)" placeholder="${composerPlaceholder}" class="cv-posting-textarea ${isBlessingComposer ? 'cv-posting-textarea--blessing' : ''}">${escapeHtml(state.postContent)}</textarea>

                        ${hasMedia ? `
                            <div class="cv-posting-attachment ${isReel ? 'cv-posting-attachment--reel' : 'cv-posting-attachment--image'} ${mediaCount > 1 ? 'is-grid' : ''}">
                                <button type="button" class="cv-posting-attachment__remove" onclick="cvPostingClearMedia()" aria-label="Remove media"><i data-lucide="x" class="w-5 h-5"></i></button>
                                ${isReel ? `
                                    <div class="cv-posting-reel-preview">
                                        ${composerReelPreviewHtml}
                                        <div class="cv-posting-reel-play"><i data-lucide="play" class="w-7 h-7"></i></div>
                                        <span>Reel Preview</span>
                                    </div>
                                ` : `
                                    <div class="cv-posting-image-preview">
                                        ${composerImagePreviewHtml}
                                    </div>
                                `}
                            </div>
                        ` : ''}

                        ${hasMedia ? `
                            <div class="cv-upload-status-card cv-posting-upload-status-card ${mediaReady ? 'is-complete' : 'is-loading'}">
                                <div class="cv-media-ready cv-posting-media-ready" role="status" aria-live="polite">
                                    <div class="cv-media-ready__top"><span>Upload to server</span><strong>${mediaReadyPercent}% complete</strong></div>
                                    <div class="cv-media-ready__status"><i data-lucide="check-circle-2" class="w-5 h-5"></i><span>${escapeHtml(state.postMediaReadyStatus || 'Media is ready. You can publish now.')}</span></div>
                                    <div class="cv-media-ready__bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${mediaReadyPercent}"><span style="width:${mediaReadyPercent}%"></span></div>
                                </div>
                                <label class="cv-modern-download-option cv-posting-download-option"><span class="cv-modern-download-option__icon"><i data-lucide="download" class="w-5 h-5"></i></span><span class="cv-modern-download-option__copy"><strong>Allow media download</strong><small>Other users can download your image or Reel to share on another platform.</small></span><input class="cv-modern-download-option__toggle" type="checkbox" ${state.postAllowDownload ? 'checked' : ''} onchange="updatePostForm('postAllowDownload', this.checked)" /></label>
                            </div>
                        ` : ''}

                        <div class="cv-posting-smile-row">
                            <button type="button" aria-label="Choose an emoji" aria-expanded="${state.showPostEmojiPicker ? 'true' : 'false'}" aria-controls="cv-post-emoji-picker" onclick="cvTogglePostEmojiPicker()"><i data-lucide="smile" class="w-6 h-6"></i></button>
                            ${state.showPostEmojiPicker ? `<div id="cv-post-emoji-picker" class="cv-post-emoji-picker" role="group" aria-label="Choose an emoji">${CV_POST_EMOJIS.map(function(emoji, index) { return `<button type="button" onclick="cvInsertPostEmoji(${index})" aria-label="Insert ${escapeAttr(emoji)}">${emoji}</button>`; }).join('')}</div>` : ''}
                        </div>
                    </div>

                    <div class="cv-posting-modal__footer">
                        <div class="cv-posting-tools">
                            ${isBlessingComposer ? `
                                <button type="button" class="cv-posting-tool cv-posting-tool--blessing is-active" onclick="cvPostingSetPostType('Blessing')" aria-label="Write blessing text">${cvRenderBlessingIcon("cv-blessing-svg-icon--tool")}<span>Text</span></button>
                                <button type="button" class="cv-posting-tool cv-posting-tool--image ${hasMedia && !isReel ? 'is-active' : ''}" onclick="cvPostingOpenMedia('image')" aria-label="Add a photo"><i data-lucide="image" class="w-6 h-6"></i><span>Add photo</span></button>
                                <button type="button" class="cv-posting-tool cv-posting-tool--music ${hasBlessingMusic ? 'is-active' : ''}" onclick="cvFocusBlessingMusicPanel()" aria-label="Choose Christian music"><i data-lucide="music-2" class="w-6 h-6"></i><span>Music</span></button>
                            ` : `
                                <button type="button" class="cv-posting-tool cv-posting-tool--image ${hasMedia && !isReel ? 'is-active' : ''}" onclick="cvPostingOpenMedia('image')" aria-label="Add a photo"><i data-lucide="image" class="w-6 h-6"></i><span>Add a photo</span></button>
                                <button type="button" class="cv-posting-tool cv-posting-tool--reel ${isReel ? 'is-active' : ''}" onclick="cvPostingOpenMedia('reel')" aria-label="Add a reel"><i data-lucide="clapperboard" class="w-6 h-6"></i><span>Add a reel</span></button>
                                <button type="button" class="cv-posting-tool cv-posting-tool--article ${isArticleComposer ? 'is-active' : ''}" onclick="cvPostingSetPostType('Article')" aria-label="Write article"><i data-lucide="file-text" class="w-6 h-6"></i><span>Write article</span></button>
                            `}
                        </div>

                        <button onclick="publishPost()" ${publishDisabled ? 'disabled' : ''} class="cv-posting-publish-btn" data-cv-posting-publish-btn="1">
                            ${composerPublishLabel}
                        </button>
                    </div>
                </div>
            `;
        } else {
            html += `
                <h2 class="text-2xl font-extrabold mb-1 ${isDark ? 'text-white' : 'text-brand-dark'}">Distribute a Resource</h2>
                <p class="text-base opacity-70 mb-8">Share teaching videos, PDF tracts, or lesson bundles with the community.</p>

                <div class="space-y-6 mb-8">
                    <div>
                        <label class="text-xs font-bold uppercase tracking-wider mb-2 block opacity-70">Resource Title</label>
                        <input type="text" id="resource-title-input" name="resource_title" value="${escapeAttr(state.resTitle)}" autocomplete="off" autocapitalize="sentences" spellcheck="true" oninput="updatePostForm('resTitle', this.value)" class="relative z-10 pointer-events-auto w-full border-2 rounded-xl p-4 text-base font-medium focus:outline-none focus:border-brand-vault transition-colors ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'}" placeholder="e.g. Gospel Study Guide" />
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="text-xs font-bold uppercase tracking-wider mb-2 block opacity-70">Name</label>
                            <input type="text" value="${escapeAttr(state.contributorName)}" oninput="updatePostForm('contributorName', this.value)" class="relative z-10 pointer-events-auto w-full border-2 rounded-xl p-4 text-base font-medium focus:outline-none focus:border-brand-vault transition-colors ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'}" placeholder="Your name" />
                        </div>
                        <div>
                            <label class="text-xs font-bold uppercase tracking-wider mb-2 block opacity-70">Role</label>
                            <input type="text" value="${escapeAttr(state.contributorRole)}" oninput="updatePostForm('contributorRole', this.value)" class="relative z-10 pointer-events-auto w-full border-2 rounded-xl p-4 text-base font-medium focus:outline-none focus:border-brand-vault transition-colors ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'}" placeholder="Pastor, teacher, leader..." />
                        </div>
                        <div>
                            <label class="text-xs font-bold uppercase tracking-wider mb-2 block opacity-70">Church</label>
                            <input type="text" value="${escapeAttr(state.contributorChurch)}" oninput="updatePostForm('contributorChurch', this.value)" class="relative z-10 pointer-events-auto w-full border-2 rounded-xl p-4 text-base font-medium focus:outline-none focus:border-brand-vault transition-colors ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'}" placeholder="Church name" />
                        </div>
                        <div>
                            <label class="text-xs font-bold uppercase tracking-wider mb-2 block opacity-70">Ministry</label>
                            <input type="text" value="${escapeAttr(state.contributorMinistry)}" oninput="updatePostForm('contributorMinistry', this.value)" class="relative z-10 pointer-events-auto w-full border-2 rounded-xl p-4 text-base font-medium focus:outline-none focus:border-brand-vault transition-colors ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'}" placeholder="Ministry name" />
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-6">
                        <div>
                            <label class="text-xs font-bold uppercase tracking-wider mb-2 block opacity-70">Format</label>
                            <select onchange="updatePostForm('resFormat', this.value)" class="w-full border-2 rounded-xl p-4 text-base font-medium focus:outline-none focus:border-brand-vault transition-colors cursor-pointer ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'}">
                                <option value="pdf" ${state.resFormat === 'pdf' ? 'selected' : ''}>PDF Tract</option>
                                <option value="video" ${state.resFormat === 'video' ? 'selected' : ''}>Video</option>
                                <option value="audio" ${state.resFormat === 'audio' ? 'selected' : ''}>Audio</option>
                                <option value="zip" ${state.resFormat === 'zip' ? 'selected' : ''}>Bundle (ZIP)</option>
                            </select>
                        </div>
                        <div>
                            <label class="text-xs font-bold uppercase tracking-wider mb-2 block opacity-70">Category</label>
                            <select onchange="updatePostForm('resCategory', this.value)" class="w-full border-2 rounded-xl p-4 text-base font-medium focus:outline-none focus:border-brand-vault transition-colors cursor-pointer ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'}">
                                <option ${state.resCategory === 'Bible Study' ? 'selected' : ''}>Bible Study</option>
                                <option ${state.resCategory === 'Evangelism' ? 'selected' : ''}>Evangelism</option>
                                <option ${state.resCategory === 'Discipleship' ? 'selected' : ''}>Discipleship</option>
                                <option ${state.resCategory === 'History' ? 'selected' : ''}>History</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label class="text-xs font-bold uppercase tracking-wider mb-2 block opacity-70">Thumbnail Image (Optional)</label>
                        <div class="border-2 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-5 ${isDark ? 'border-slate-600 bg-slate-700/50' : 'border-slate-200 bg-slate-50'}">
                            <div id="thumbnail-preview" class="w-28 h-36 rounded-xl overflow-hidden flex items-center justify-center bg-white/70 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 shadow-sm">
                                ${state.thumbnailPreviewUrl ? `<img src="${state.thumbnailPreviewUrl}" class="w-full h-full object-cover" alt="Thumbnail preview" />` : '<i data-lucide="image" class="w-8 h-8 opacity-40"></i>'}
                            </div>
                            <div class="flex-1 text-center sm:text-left">
                                <input type="file" id="resource-thumbnail" class="hidden" accept="image/*" onchange="updateThumbnailName(this)" />
                                <button type="button" onclick="document.getElementById('resource-thumbnail').click()" class="px-5 py-2.5 bg-brand-dark text-white rounded-xl font-bold shadow-md hover:bg-slate-800 transition-colors mb-3 inline-flex items-center gap-2">
                                    <i data-lucide="image-plus" class="w-5 h-5"></i> Choose Thumbnail
                                </button>
                                <span id="thumbnail-name-display" class="block text-sm font-bold">${state.selectedThumbnailName || 'No custom thumbnail selected'}</span>
                                <span class="block text-xs opacity-60 mt-1">Leave empty for PDF first-page thumbnail or automatic file thumbnail.</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label class="text-xs font-bold uppercase tracking-wider mb-2 block opacity-70">Upload File</label>
                        <div class="border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:bg-brand-vault/5 transition-colors ${isDark ? 'border-slate-600 bg-slate-700/50' : 'border-slate-300 bg-slate-50'}">
                            <input type="file" id="resource-file" class="hidden" accept="image/*,application/pdf,video/*,audio/*,.zip" onchange="updateFileName(this)" />
                            <button type="button" onclick="document.getElementById('resource-file').click()" class="px-5 py-2.5 bg-brand-vault text-white rounded-xl font-bold shadow-md hover:bg-[#198f75] transition-colors mb-3 flex items-center mx-auto gap-2">
                                <i data-lucide="folder-open" class="w-5 h-5"></i> Select File
                            </button>
                            <span id="file-name-display" class="text-lg font-bold mb-1">${state.selectedFileName || 'No file selected'}</span>
                            <span class="text-sm opacity-60 font-medium">Max upload size: 50MB</span>
                        </div>
                    </div>
                </div>
                <button onclick="publishResource()" ${state.isUploading ? 'disabled' : ''} class="w-full bg-brand-vault text-white py-4 rounded-xl text-lg font-bold shadow-lg shadow-brand-vault/30 hover:bg-[#198f75] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                    <i data-lucide="hard-drive-upload" class="w-5 h-5"></i> Publish to Library
                </button>
            `;
        }
        html += `</div></div>`;
        return html;
    }

    function renderModal() {
        if (!state.modal.isOpen) return '';
        const isDark = state.settings.theme === 'dark';
        const m = state.modal;

        let content = '';

        if (m.type === 'confirmDelete' && m.data) {
            const itemLabel = escapeHtml(m.data.itemLabel || 'Selected item');
            content = `
                <div class="text-center">
                    <div class="mx-auto mb-5 w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center shadow-inner dark:bg-rose-950/40">
                        <div class="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center dark:bg-rose-900/60 dark:text-rose-200">
                            <i data-lucide="trash-2" class="w-7 h-7"></i>
                        </div>
                    </div>
                    <h3 class="text-3xl font-extrabold tracking-tight mb-3">${escapeHtml(m.data.title || 'Delete item?')}</h3>
                    <p class="text-base leading-7 opacity-70 max-w-md mx-auto mb-5">${escapeHtml(m.data.message || 'This action cannot be undone.')}</p>
                    <div class="rounded-2xl border px-4 py-3 mb-7 text-left ${isDark ? 'border-slate-700 bg-slate-800/80' : 'border-slate-200 bg-slate-50'}">
                        <div class="text-xs font-black uppercase tracking-[0.18em] opacity-50 mb-1">You are deleting</div>
                        <div class="font-extrabold text-lg truncate">${itemLabel}</div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button type="button" onclick="cancelDeleteConfirm()" class="px-5 py-4 rounded-2xl font-extrabold border-2 transition-all ${isDark ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-50'}">${escapeHtml(m.data.cancelText || 'Keep it')}</button>
                        <button type="button" onclick="confirmDeleteAction()" class="px-5 py-4 rounded-2xl font-extrabold text-white bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/25 transition-all flex items-center justify-center gap-2">
                            <i data-lucide="trash-2" class="w-5 h-5"></i>${escapeHtml(m.data.confirmText || 'Delete')}
                        </button>
                    </div>
                    <p class="mt-4 text-xs opacity-50">You can press Cancel to safely return without deleting.</p>
                </div>
            `;
        } else if (m.type === 'verification') {
            const data = m.data || {};
            const verification = data.verification || getVerificationPayload();
            const request = data.request || state.verificationRequest || null;
            const tiers = (Array.isArray(data.tiers) && data.tiers.length ? data.tiers : (Array.isArray(state.verificationTiers) ? state.verificationTiers : [])).filter(tier => tier && tier.type !== 'none');
            const badgeUser = { ...(state.currentUser || {}), verification };
            const statusLabel = getVerificationSettingsLabel(verification);
            const isVerified = !!(verification && verification.is_verified);
            const canRequest = verification && verification.can_request_review !== false;
            const requestPending = !!(request && request.status === 'pending');
            const requestButtonLabel = state.verificationRequesting ? 'Sending...' : (requestPending ? 'Request pending' : (isVerified ? 'Request review / upgrade' : 'Request verification review'));
            const description = verification && verification.description ? verification.description : 'This account is active but does not currently display a public verification badge.';
            const requirements = Array.isArray(verification && verification.requirements) ? verification.requirements : [];
            const nextSteps = Array.isArray(verification && verification.next_steps) ? verification.next_steps : [];

            content = `
                <div class="cv-verification-modal">
                    <div class="pr-10 mb-6">
                        <div class="text-xs uppercase tracking-[0.22em] font-black opacity-55 mb-2">Account verification</div>
                        <div class="flex flex-wrap items-center gap-3">
                            <h3 class="text-3xl font-extrabold tracking-tight">${escapeHtml(statusLabel)}</h3>
                            ${renderVerificationBadge(badgeUser, 'pill')}
                        </div>
                        <p class="mt-3 text-base leading-7 opacity-70">${escapeHtml(description)}</p>
                    </div>

                    ${data.loading ? `<div class="rounded-3xl p-6 mb-5 text-center border ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-100 bg-slate-50'}"><div class="cv-social-spinner mx-auto mb-3"></div><p class="font-bold opacity-70">Checking verification status...</p></div>` : ''}
                    ${data.error ? `<div class="rounded-2xl p-4 mb-5 bg-rose-50 text-rose-700 font-bold">${escapeHtml(data.error)}</div>` : ''}

                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                        <div class="rounded-3xl p-5 border ${isDark ? 'border-slate-700 bg-slate-800/70' : 'border-slate-100 bg-slate-50'}">
                            <div class="text-xs uppercase tracking-[0.18em] font-black opacity-45 mb-2">Current</div>
                            <div class="font-extrabold text-xl">${escapeHtml(statusLabel)}</div>
                            <p class="mt-2 text-xs leading-5 opacity-60">${isVerified ? 'Badge is active on public profile surfaces.' : 'No public badge is shown yet.'}</p>
                        </div>
                        <div class="rounded-3xl p-5 border ${isDark ? 'border-slate-700 bg-slate-800/70' : 'border-slate-100 bg-slate-50'}">
                            <div class="text-xs uppercase tracking-[0.18em] font-black opacity-45 mb-2">Identity</div>
                            <div class="font-extrabold text-xl">${verification && verification.is_google_verified ? 'Google verified' : 'Standard'}</div>
                            <p class="mt-2 text-xs leading-5 opacity-60">Server-side logic checks the signed-in account provider and email.</p>
                        </div>
                        <div class="rounded-3xl p-5 border ${isDark ? 'border-slate-700 bg-slate-800/70' : 'border-slate-100 bg-slate-50'}">
                            <div class="text-xs uppercase tracking-[0.18em] font-black opacity-45 mb-2">Review</div>
                            <div class="font-extrabold text-xl">${requestPending ? 'Pending' : 'Available'}</div>
                            <p class="mt-2 text-xs leading-5 opacity-60">${requestPending ? 'Your request was saved for admin review.' : 'You can request a manual verification check.'}</p>
                        </div>
                    </div>

                    ${tiers.length ? `<div class="mb-6">
                        <div class="text-xs uppercase tracking-[0.18em] font-black opacity-45 mb-3">Verification levels</div>
                        <div class="space-y-3">${tiers.map(tier => `
                            <div class="flex items-start gap-3 rounded-2xl border p-4 ${verification && verification.type === tier.type ? (isDark ? 'border-emerald-400/30 bg-emerald-400/10' : 'border-emerald-200 bg-emerald-50') : (isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-100 bg-white')}">
                                <div class="mt-0.5">${renderVerificationBadge({ verification: tier }, 'compact') || '<span class="inline-flex w-4 h-4 rounded-full bg-slate-300"></span>'}</div>
                                <div class="min-w-0">
                                    <div class="font-extrabold">${escapeHtml(tier.status_label || tier.label || 'Verification')}</div>
                                    <p class="text-sm leading-6 opacity-65">${escapeHtml(tier.description || '')}</p>
                                </div>
                            </div>
                        `).join('')}</div>
                    </div>` : ''}

                    ${(requirements.length || nextSteps.length) ? `<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                        ${requirements.length ? `<div class="rounded-2xl p-4 border ${isDark ? 'border-slate-700 bg-slate-800/70' : 'border-slate-100 bg-slate-50'}"><div class="font-extrabold mb-2">Requirements</div><ul class="space-y-2 text-sm opacity-70">${requirements.map(item => `<li>• ${escapeHtml(item)}</li>`).join('')}</ul></div>` : ''}
                        ${nextSteps.length ? `<div class="rounded-2xl p-4 border ${isDark ? 'border-slate-700 bg-slate-800/70' : 'border-slate-100 bg-slate-50'}"><div class="font-extrabold mb-2">Next steps</div><ul class="space-y-2 text-sm opacity-70">${nextSteps.map(item => `<li>• ${escapeHtml(item)}</li>`).join('')}</ul></div>` : ''}
                    </div>` : ''}

                    <label class="block mb-4">
                        <span class="text-sm font-extrabold opacity-70">Optional note for admin review</span>
                        <textarea id="cv-verification-note" class="mt-2 w-full h-24 rounded-2xl border-2 p-4 outline-none resize-none ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-400' : 'bg-white border-slate-200 text-slate-900 focus:border-brand-vault'}" placeholder="Tell us why this account should be reviewed..." ${requestPending ? 'disabled' : ''}>${escapeHtml(request && request.note ? request.note : '')}</textarea>
                    </label>

                    <button type="button" onclick="requestAccountVerification()" ${(!canRequest || requestPending || state.verificationRequesting) ? 'disabled' : ''} class="w-full rounded-2xl px-5 py-4 font-extrabold text-white bg-brand-vault hover:bg-[#198f75] disabled:opacity-55 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
                        <i data-lucide="${requestPending ? 'clock' : 'badge-check'}" class="w-5 h-5"></i>
                        <span>${escapeHtml(requestButtonLabel)}</span>
                    </button>
                </div>
            `;
        } else if (m.type === 'editPost' && m.data) {
            const edit = m.data || {};
            const author = edit.author || {};
            const isArticle = !!edit.isArticle;
            const modalTitle = isArticle ? 'Edit article' : 'Edit post';
            const helperText = isArticle
                ? 'Polish the title, summary, and full article body before saving.'
                : 'Update your post content with a cleaner editor.';
            content = `
                <div class="cv-edit-post-modal -m-2 sm:-m-4 rounded-[2rem] ${isDark ? 'bg-slate-900 text-white' : 'bg-white text-brand-dark'} flex flex-col max-h-[calc(100vh-1rem)] sm:max-h-[calc(100vh-3rem)] overflow-hidden">
                    <div class="relative px-5 sm:px-8 pt-8 pb-6 overflow-hidden shrink-0 ${isDark ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950' : 'bg-gradient-to-br from-indigo-50 via-white to-emerald-50'}">
                        <div class="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-brand-vault/15 blur-3xl"></div>
                        <div class="absolute -bottom-24 -left-16 w-52 h-52 rounded-full bg-indigo-500/10 blur-3xl"></div>
                        <div class="relative flex items-start gap-4 pr-12">
                            <div class="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${isDark ? 'bg-indigo-500/20 text-indigo-200 ring-1 ring-indigo-300/20' : 'bg-white text-indigo-600 ring-1 ring-indigo-100'}">
                                <i data-lucide="pen-line" class="w-7 h-7"></i>
                            </div>
                            <div class="min-w-0">
                                <div class="flex flex-wrap items-center gap-2 mb-2">
                                    <span class="text-[11px] font-black uppercase tracking-[0.22em] rounded-full px-3 py-1 ${isDark ? 'bg-white/10 text-indigo-100' : 'bg-indigo-100 text-indigo-700'}">${escapeHtml(edit.typeLabel || 'Post')}</span>
                                    ${edit.time ? `<span class="text-xs opacity-55 font-bold">${escapeHtml(edit.time)}</span>` : ''}
                                </div>
                                <h3 class="text-3xl sm:text-4xl font-black tracking-tight leading-tight">${modalTitle}</h3>
                                <p class="mt-2 text-sm sm:text-base opacity-70 leading-6 max-w-2xl">${helperText}</p>
                            </div>
                        </div>
                    </div>

                    <div class="flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar">
                        <div class="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_16rem] gap-6 p-5 sm:p-8">
                            <div class="space-y-5 min-w-0">
                            ${isArticle ? `
                                <label class="block">
                                    <span class="flex items-center gap-2 text-sm font-extrabold mb-2 opacity-80"><i data-lucide="type" class="w-4 h-4"></i> Article title</span>
                                    <input id="cv-edit-post-title" value="${escapeAttr(edit.title || '')}" class="w-full rounded-2xl border-2 px-5 py-4 text-xl sm:text-2xl font-extrabold outline-none transition-all ${hasKhmerText(edit.title || '') ? 'cv-article-title cv-article-khmer' : ''} ${isDark ? 'bg-slate-800/80 border-slate-700 text-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10' : 'bg-white border-slate-200 text-slate-950 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'}" placeholder="Article title" />
                                </label>
                                <label class="block">
                                    <span class="flex items-center gap-2 text-sm font-extrabold mb-2 opacity-80"><i data-lucide="align-left" class="w-4 h-4"></i> Short summary</span>
                                    <textarea id="cv-edit-post-excerpt" class="w-full h-28 rounded-2xl border-2 px-5 py-4 text-base leading-7 resize-none outline-none transition-all ${hasKhmerText(edit.excerpt || '') ? 'cv-article-body cv-article-khmer' : ''} ${isDark ? 'bg-slate-800/80 border-slate-700 text-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10' : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'}" placeholder="Optional summary for the article card">${escapeHtml(edit.excerpt || '')}</textarea>
                                </label>
                            ` : ''}

                            <label class="block">
                                <span class="flex items-center gap-2 text-sm font-extrabold mb-2 opacity-80"><i data-lucide="file-pen-line" class="w-4 h-4"></i> ${isArticle ? 'Article body' : 'Post content'}</span>
                                <textarea id="cv-edit-post-content" class="w-full ${isArticle ? 'h-80' : 'h-56'} rounded-2xl border-2 px-5 py-4 text-lg leading-8 resize-none outline-none transition-all custom-scrollbar ${hasKhmerText(edit.content || '') ? 'cv-article-body cv-article-khmer' : ''} ${isDark ? 'bg-slate-800/80 border-slate-700 text-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10' : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'}" placeholder="Write your update here...">${escapeHtml(edit.content || '')}</textarea>
                            </label>
                        </div>

                        <aside class="space-y-4">
                            <div class="rounded-3xl p-5 border ${isDark ? 'bg-slate-800/70 border-slate-700' : 'bg-slate-50 border-slate-100'}">
                                <div class="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-3">Preview card</div>
                                ${edit.coverImage ? `<img src="${safeImageUrl(edit.coverImage, '')}" class="w-full h-32 object-cover rounded-2xl mb-4" alt="Post preview" />` : `<div class="w-full h-32 rounded-2xl mb-4 flex items-center justify-center ${isDark ? 'bg-slate-900 text-slate-500' : 'bg-white text-slate-400'}"><i data-lucide="image" class="w-8 h-8"></i></div>`}
                                <div class="flex items-center gap-3 mb-3">
                                    ${renderProfileAvatar({ name: author.name || 'You', avatar_url: author.avatar || author.avatar_url || '' }, 'w-10 h-10', 'text-xs')}
                                    <div class="min-w-0">
                                        <div class="font-extrabold truncate text-sm">${escapeHtml(author.name || 'You')}</div>
                                        <div class="text-xs opacity-55 truncate">${escapeHtml(author.handle || 'Your account')}</div>
                                    </div>
                                </div>
                                <p class="text-sm leading-6 opacity-70">Your edited ${isArticle ? 'article' : 'post'} will refresh in the feed after saving.</p>
                            </div>
                            <div class="rounded-3xl p-5 border ${isDark ? 'bg-indigo-500/10 border-indigo-300/20 text-indigo-100' : 'bg-indigo-50 border-indigo-100 text-indigo-900'}">
                                <div class="flex items-start gap-3">
                                    <i data-lucide="sparkles" class="w-5 h-5 mt-0.5 shrink-0"></i>
                                    <p class="text-sm leading-6 font-semibold">Tip: use a clear title and short paragraphs so Khmer and English content stays easy to read.</p>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>

                    <div class="cv-edit-post-footer flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 sm:px-8 py-5 border-t shrink-0 ${isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-100 bg-slate-50/90'}">
                        <p class="text-xs sm:text-sm opacity-55 font-semibold">${isArticle ? 'Click Done & Publish when you are finished editing. Your article will refresh in the feed.' : 'Click Done when you are finished editing. Your post will refresh in the feed.'}</p>
                        <div class="cv-edit-post-actions flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3">
                            <button onclick="closeModal()" class="cv-edit-post-cancel px-5 py-3 rounded-2xl font-extrabold border-2 transition-all ${isDark ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-200 hover:bg-white'}">Cancel</button>
                            <button id="cv-edit-post-save" onclick="savePostEdit()" style="background:#4f46e5 !important;color:#ffffff !important;border:2px solid #4f46e5 !important;min-width:220px !important;" class="cv-edit-post-save-btn min-w-fit px-6 py-3 rounded-2xl font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2">
                                <i data-lucide="${isArticle ? 'badge-check' : 'check'}" class="w-5 h-5 shrink-0"></i><span class="cv-edit-post-save-label" style="display:inline-block !important;color:#ffffff !important;visibility:visible !important;opacity:1 !important;">${isArticle ? 'Done & Publish' : 'Done'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        } else if (m.type === 'prayer') {
            content = `
                <h3 class="font-extrabold text-2xl mb-6">Request Prayer</h3>
                <textarea id="prayer-input" placeholder="How can the global network pray for you?..." class="w-full h-40 border-2 rounded-2xl p-4 text-base resize-none focus:outline-none focus:border-brand-vault mb-6 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}"></textarea>
                <label class="flex items-center gap-3 mb-8 p-4 rounded-xl border cursor-pointer ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'}">
                    <input type="checkbox" id="urgent-checkbox" class="w-5 h-5 rounded text-brand-vault focus:ring-brand-vault border-slate-300">
                    <span class="font-bold text-base">Mark as Urgent Request</span>
                </label>
                <button onclick="submitPrayer()" class="w-full bg-brand-vault text-white py-4 rounded-xl font-bold shadow-md hover:bg-[#198f75] transition-all text-lg">Share Request</button>
            `;
        } else if (m.type === 'publicUserProfile' && m.data) {
            const user = m.data || {};
            const counts = user.counts || { followers: 0, following: 0 };
            const profileMsgPayload = JSON.stringify({ id: parseInt(user.id || 0, 10), name: user.name || 'User', handle: user.handle || '', avatar_url: user.avatar_url || user.avatar || '' });
            content = `
                <div class="cv-public-user-profile-modal text-center">
                    <div class="mx-auto mb-4 w-24 h-24 rounded-full overflow-hidden shadow-xl border-4 ${isDark ? 'border-slate-700' : 'border-white'}">
                        ${renderProfileAvatar({ name: user.name || 'User', avatar_url: user.avatar_url || user.avatar || '' }, 'w-24 h-24', 'text-xl')}
                    </div>
                    <div class="flex items-center justify-center gap-2 mb-1">
                        <h3 class="text-2xl font-extrabold">${escapeHtml(user.name || 'User')}</h3>
                        ${renderVerificationBadge(user, 'inline')}
                    </div>
                    <p class="text-sm opacity-60 mb-4">${escapeHtml([user.handle, user.role, user.church || user.country, user.ministry].filter(Boolean).join(' • '))}</p>
                    <div class="grid grid-cols-2 gap-3 mb-5">
                        <div class="rounded-2xl p-4 border ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-100 bg-slate-50'}">
                            <div class="text-2xl font-extrabold">${parseInt(counts.followers || 0, 10)}</div>
                            <div class="text-xs font-bold opacity-60">Followers</div>
                        </div>
                        <div class="rounded-2xl p-4 border ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-100 bg-slate-50'}">
                            <div class="text-2xl font-extrabold">${parseInt(counts.following || 0, 10)}</div>
                            <div class="text-xs font-bold opacity-60">Following</div>
                        </div>
                    </div>
                    <div class="cv-public-user-profile-modal__actions">
                        ${cvSocialFollowButton(user, 'cv-public-user-profile-modal__follow')}
                        ${!cvSocialIsSelf(user) ? `<button type="button" onclick="closeModal(); cvOpenFaithInChat(${escapeAttr(profileMsgPayload)});" class="cv-social-follow-btn is-not-following cv-public-user-profile-modal__message"><span class="cv-social-follow-btn__label">Message</span></button>` : ''}
                        ${cvSocialMoreButton(user, 'cv-public-user-profile-modal__more')}
                    </div>
                    ${cvSocialIsSelf(user) ? `<p class="mt-4 text-xs opacity-50">This is your profile.</p>` : `<p class="mt-4 text-xs opacity-50">Users can follow and message each other from this profile card.</p>`}
                </div>
            `;
        } else if (m.type === 'socialFollowList' && m.data) {
            const items = Array.isArray(m.data.items) ? m.data.items : [];
            const title = m.data.title || 'Followers';
            content = `
                <div class="cv-followers-ui ${isDark ? 'is-dark' : ''}">
                    <div class="cv-followers-ui__header">
                        <h2>${escapeHtml(title)}</h2>
                    </div>
                    <div class="cv-followers-ui__body">
                        ${m.data.loading ? `<div class="cv-followers-ui__loading"><div class="cv-social-spinner mx-auto mb-3"></div><p>Loading accounts...</p></div>` : ''}
                        ${m.data.error ? `<div class="cv-followers-ui__error">${escapeHtml(m.data.error)}</div>` : ''}
                        ${(!m.data.loading && !m.data.error && !items.length) ? `<div class="cv-followers-ui__empty">No accounts yet.</div>` : ''}
                        ${items.length ? `<div class="cv-followers-ui__list custom-scrollbar">${items.map((user, index) => {
                            const mutual = cvSocialMutualCount(user);
                            const headline = cvSocialUserHeadline(user);
                            return `
                                <div class="cv-followers-ui__row ${index !== items.length - 1 ? 'has-divider' : ''}">
                                    <button type="button" onclick="cvOpenUserProfile(${parseInt(user.id || 0, 10)})" class="cv-plain-button cv-user-row-trigger cv-followers-ui__profile">
                                        ${renderProfileAvatar({ name: user.name, avatar_url: user.avatar_url || user.avatar }, 'cv-followers-ui__avatar', 'text-sm')}
                                        <span class="cv-followers-ui__info">
                                            <span class="cv-followers-ui__name">${escapeHtml(user.name || 'User')}${renderVerificationBadge(user, 'inline')}</span>
                                            <span class="cv-followers-ui__headline">${escapeHtml(headline)}</span>
                                            <span class="cv-followers-ui__meta">
                                                ${mutual > 0 ? `<span class="cv-followers-ui__mutual"><span class="cv-followers-ui__users-icon" aria-hidden="true"><i data-lucide="users"></i></span>${mutual} mutual connections</span><span class="cv-followers-ui__dot">•</span>` : ''}
                                                <span>${escapeHtml(cvSocialFollowerLabel(user))}</span>
                                            </span>
                                        </span>
                                    </button>
                                    <div class="cv-followers-ui__actions">${cvSocialFollowButton(user, 'cv-followers-ui__follow')}${cvSocialMoreButton(user, 'cv-followers-ui__more')}</div>
                                </div>
                            `;
                        }).join('')}</div>` : ''}
                    </div>
                </div>
            `;
        } else if (m.type === 'article' && m.data) {
            const author = m.data.author || {};
            content = `
                ${m.data.cover_image_url ? `<img src="${safeImageUrl(m.data.cover_image_url, '')}" class="w-full h-64 object-cover rounded-2xl mb-6" alt="${escapeAttr(m.data.article_title || 'Article cover')}" />` : ''}
                <div class="mb-4">
                    <div class="text-xs font-bold uppercase tracking-[0.2em] opacity-60 mb-2">Article</div>
                    <h3 class="font-extrabold text-3xl leading-tight mb-3 ${hasKhmerText(m.data.article_title || '') ? 'cv-article-title cv-article-khmer' : ''}">${renderLocalizedText(m.data.article_title || 'Untitled Article')}</h3>
                    <div class="flex flex-wrap items-center gap-2 text-xs font-bold opacity-70">
                        <span class="inline-flex items-center gap-2 leading-none">
                            <span class="inline-block leading-none">${escapeHtml(author.name || 'Guest Author')}</span>${renderVerificationBadge(author, 'inline')}
                        </span>
                        ${author.role ? `<span>• ${escapeHtml(author.role)}</span>` : ''}
                        ${author.church ? `<span>• ${escapeHtml(author.church)}</span>` : ''}
                        ${author.ministry ? `<span>• ${escapeHtml(author.ministry)}</span>` : ''}
                        <span>• ${m.data.reading_time || 1} min read</span>
                    </div>
                </div>
                ${m.data.article_excerpt ? `<p class="text-base opacity-80 mb-6 leading-relaxed ${hasKhmerText(m.data.article_excerpt || '') ? 'cv-article-body cv-article-khmer' : ''}">${renderLocalizedText(m.data.article_excerpt)}</p>` : ''}
                <div class="leading-8 whitespace-pre-line text-[1.06rem] cv-article-content ${hasKhmerText(m.data.article_body || '') ? 'cv-article-body cv-article-khmer' : ''}">${renderLocalizedText(m.data.article_body || '')}</div>
            `;
        }

        const modalShellClass = (m.type === 'article' || m.type === 'editPost' || m.type === 'verification')
            ? 'items-start overflow-y-auto py-2 sm:py-4'
            : 'items-center';
        const panelClass = m.type === 'article'
            ? `max-w-4xl rounded-[2rem] shadow-2xl animate-slide-up ${isDark ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white text-brand-dark'} z-10 cv-article-modal overflow-hidden`
            : (m.type === 'editPost'
                ? `max-w-6xl rounded-[2rem] p-3 sm:p-6 shadow-2xl animate-slide-up ${isDark ? 'bg-slate-900/95 border border-slate-700 text-white' : 'bg-white/95 text-brand-dark'} z-10 overflow-hidden`
                : (m.type === 'socialFollowList'
                    ? `max-w-2xl rounded-lg p-0 shadow-sm animate-slide-up ${isDark ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white border border-gray-200 text-brand-dark'} z-10 overflow-hidden`
                    : `max-w-${m.type === 'confirmDelete' ? 'xl' : (m.type === 'verification' ? '4xl' : '3xl')} rounded-[2rem] ${m.type === 'verification' ? 'p-4 sm:p-5 cv-verification-panel' : 'p-8'} shadow-2xl animate-slide-up ${isDark ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white text-brand-dark'} z-10`));
        const closeButtonClass = m.type === 'article'
            ? 'absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-20'
            : (m.type === 'editPost'
                ? 'absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-20'
                : (m.type === 'verification'
                    ? 'absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-20'
                    : (m.type === 'socialFollowList'
                        ? 'absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors z-20 text-black/60 hover:text-black/90'
                        : 'absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors')));

        const modalLabel = m.type === 'confirmDelete' ? 'Delete confirmation' : 'Faith In dialog';

        return `
            <div class="fixed inset-0 z-[100] flex justify-center animate-fade-in p-4 ${modalShellClass}" role="dialog" aria-modal="true" aria-label="${modalLabel}">
                <div class="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm" onclick="closeModal()" aria-hidden="true"></div>
                <div class="relative w-full ${panelClass}">
                    <button type="button" onclick="closeModal()" class="${closeButtonClass}" aria-label="Close dialog">
                        <i data-lucide="x" class="w-6 h-6" aria-hidden="true"></i>
                    </button>
                    ${m.type === 'article' ? `<div class="cv-article-scroll p-6 sm:p-8 pt-10 sm:pt-12">${content}</div>` : content}
                </div>
            </div>
        `;
    }


    // Social Studio backend-connected tools
    const CV_BIBLE_PASSAGES = {
        'Psalm 23:1-3': 'The Lord is my shepherd; I shall not want. He makes me lie down in green pastures. He leads me beside still waters. He restores my soul.',
        'Romans 8:28': 'And we know that for those who love God all things work together for good, for those who are called according to his purpose.',
        'John 1:1-5': 'In the beginning was the Word, and the Word was with God, and the Word was God. He was in the beginning with God.'
    };
    const CV_BIBLE_LIBRARY = {
        'Genesis': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50'],
        'Exodus': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40'],
        'Leviticus': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27'],
        'Numbers': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36'],
        'Deuteronomy': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34'],
        'Joshua': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24'],
        'Judges': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21'],
        'Ruth': ['1', '2', '3', '4'],
        '1 Samuel': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'],
        '2 Samuel': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24'],
        '1 Kings': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22'],
        '2 Kings': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25'],
        '1 Chronicles': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29'],
        '2 Chronicles': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36'],
        'Ezra': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
        'Nehemiah': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'],
        'Esther': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
        'Job': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42'],
        'Psalm': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99', '100', '101', '102', '103', '104', '105', '106', '107', '108', '109', '110', '111', '112', '113', '114', '115', '116', '117', '118', '119', '120', '121', '122', '123', '124', '125', '126', '127', '128', '129', '130', '131', '132', '133', '134', '135', '136', '137', '138', '139', '140', '141', '142', '143', '144', '145', '146', '147', '148', '149', '150'],
        'Proverbs': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'],
        'Ecclesiastes': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        'Song of Solomon': ['1', '2', '3', '4', '5', '6', '7', '8'],
        'Isaiah': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '60', '61', '62', '63', '64', '65', '66'],
        'Jeremiah': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52'],
        'Lamentations': ['1', '2', '3', '4', '5'],
        'Ezekiel': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48'],
        'Daniel': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        'Hosea': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14'],
        'Joel': ['1', '2', '3'],
        'Amos': ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
        'Obadiah': ['1'],
        'Jonah': ['1', '2', '3', '4'],
        'Micah': ['1', '2', '3', '4', '5', '6', '7'],
        'Nahum': ['1', '2', '3'],
        'Habakkuk': ['1', '2', '3'],
        'Zephaniah': ['1', '2', '3'],
        'Haggai': ['1', '2'],
        'Zechariah': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14'],
        'Malachi': ['1', '2', '3', '4'],
        'Matthew': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28'],
        'Mark': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'],
        'Luke': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24'],
        'John': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21'],
        'Acts': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28'],
        'Romans': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'],
        '1 Corinthians': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'],
        '2 Corinthians': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'],
        'Galatians': ['1', '2', '3', '4', '5', '6'],
        'Ephesians': ['1', '2', '3', '4', '5', '6'],
        'Philippians': ['1', '2', '3', '4'],
        'Colossians': ['1', '2', '3', '4'],
        '1 Thessalonians': ['1', '2', '3', '4', '5'],
        '2 Thessalonians': ['1', '2', '3'],
        '1 Timothy': ['1', '2', '3', '4', '5', '6'],
        '2 Timothy': ['1', '2', '3', '4'],
        'Titus': ['1', '2', '3'],
        'Philemon': ['1'],
        'Hebrews': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'],
        'James': ['1', '2', '3', '4', '5'],
        '1 Peter': ['1', '2', '3', '4', '5'],
        '2 Peter': ['1', '2', '3'],
        '1 John': ['1', '2', '3', '4', '5'],
        '2 John': ['1'],
        '3 John': ['1'],
        'Jude': ['1'],
        'Revelation': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22'],
    };

    function cvBibleAssetUrl(path) {
        const base = (typeof cv_ajax !== 'undefined' && cv_ajax.asset_base_url) ? String(cv_ajax.asset_base_url) : '';
        if (base) return base.replace(/\/?$/, '/') + String(path).replace(/^\/+/, '');
        return String(path).replace(/^\/+/, '');
    }

    const CV_BIBLE_BACKGROUNDS = [
        cvBibleAssetUrl('assets/images/wallpapers/wallpaper-01.jpg'),
        cvBibleAssetUrl('assets/images/wallpapers/wallpaper-02.jpg'),
        cvBibleAssetUrl('assets/images/wallpapers/wallpaper-03.jpg'),
        cvBibleAssetUrl('assets/images/wallpapers/wallpaper-04.jpg'),
        cvBibleAssetUrl('assets/images/wallpapers/wallpaper-05.jpg'),
        cvBibleAssetUrl('assets/images/wallpapers/wallpaper-06.jpg'),
        cvBibleAssetUrl('assets/images/wallpapers/wallpaper-07.jpg'),
        cvBibleAssetUrl('assets/images/wallpapers/wallpaper-08.jpg')
    ];

    function getBibleBookChapters(book) {
        return CV_BIBLE_LIBRARY[book] || ['1'];
    }

    function bibleCurrentChapters() {
        return getBibleBookChapters((state.bibleStudio && state.bibleStudio.book) || 'John');
    }

    function loadBibleStudioInitial() {
        if (!state.bibleStudio || !state.bibleStudio.verses || !state.bibleStudio.verses.length) loadBibleVerses(false);
        if (!state.bibleStudio.media || !state.bibleStudio.media.length) loadBibleMedia(false);
        if (!state.bibleStudio.quotes || !state.bibleStudio.quotes.length) loadBibleQuotes(false);
        if (state.isLoggedIn) loadBibleNotes(false);
    }

    function biblePatch(patch, rerender = true) {
        state.bibleStudio = Object.assign({}, state.bibleStudio || {}, patch || {});
        if (rerender) render();
    }

    function loadBibleVerses(rerender = true) {
        biblePatch({ loading: true, error: '' }, rerender);
        return ajaxRequest('cv_bible_get_verses', { book: state.bibleStudio.book, chapter: state.bibleStudio.chapter, version: state.bibleStudio.version })
            .done(function(response) {
                if (response && response.success && response.data) biblePatch({ verses: response.data.items || [], loading: false, error: '' });
                else biblePatch({ loading: false, error: 'Could not load verses.' });
            })
            .fail(function() { biblePatch({ loading: false, error: 'Bible API request failed.' }); });
    }

    function loadParallelVerses() {
        biblePatch({ loading: true, error: '' });
        const one = ajaxRequest('cv_bible_get_verses', { book: state.bibleStudio.book, chapter: state.bibleStudio.chapter, version: state.bibleStudio.version });
        const two = ajaxRequest('cv_bible_get_verses', { book: state.bibleStudio.book, chapter: state.bibleStudio.chapter, version: state.bibleStudio.version2 });
        $.when(one, two).done(function(r1, r2) {
            const d1 = r1 && r1[0] && r1[0].success ? r1[0].data.items : [];
            const d2 = r2 && r2[0] && r2[0].success ? r2[0].data.items : [];
            biblePatch({ verses: d1, verses2: d2, loading: false });
        }).fail(function() { biblePatch({ loading: false, error: 'Parallel Bible API request failed.' }); });
    }

    function loadBibleQuotes(rerender = true) {
        biblePatch({ loading: true, error: '' }, rerender);
        return ajaxRequest('cv_bible_get_quotes', { type: state.bibleStudio.quotesType })
            .done(function(response) { biblePatch({ quotes: response && response.success && response.data ? (response.data.items || []) : [], loading: false }); })
            .fail(function() { biblePatch({ loading: false, error: 'Quotes API request failed.' }); });
    }

    function loadBibleMedia(rerender = true) {
        biblePatch({ loading: true, error: '' }, rerender);
        return ajaxRequest('cv_bible_get_media')
            .done(function(response) { biblePatch({ media: response && response.success && response.data ? (response.data.items || []) : [], loading: false }); })
            .fail(function() { biblePatch({ loading: false, error: 'Media API request failed.' }); });
    }

    function loadBibleNotes(rerender = true) {
        if (!state.isLoggedIn) return;
        return ajaxRequest('cv_bible_get_notes')
            .done(function(response) {
                if (response && response.success && response.data) biblePatch({ sermonNotes: response.data.notes || state.bibleStudio.sermonNotes, stats: response.data.stats || state.bibleStudio.stats }, rerender);
            });
    }

    window.cvBibleTool = function(id) {
        biblePatch({ activeTool: parseInt(id, 10) || 0, error: '' });
        const active = state.bibleStudio.activeTool;
        if (active === 1) loadBibleVerses();
        if (active === 2) loadParallelVerses();
        if (active === 4) loadBibleMedia();
        if (active === 6 || active === 7) { state.bibleStudio.quotesType = active === 7 ? 'Preacher' : 'General'; loadBibleQuotes(); }
        if (active === 9) loadBibleNotes();
    };
    window.cvBibleSet = function(key, value) {
        const patch = {};
        if (key === 'book') {
            const chapters = getBibleBookChapters(value);
            patch.book = value;
            patch.chapter = chapters.indexOf(String((state.bibleStudio || {}).chapter || '')) !== -1 ? String((state.bibleStudio || {}).chapter || '') : chapters[0];
        } else {
            patch[key] = value;
        }
        biblePatch(patch, false);
        if (['book','chapter','version'].includes(key)) {
            if (parseInt((state.bibleStudio || {}).activeTool || 0, 10) === 2) loadParallelVerses();
            else loadBibleVerses();
        }
        else if (['version2'].includes(key)) loadParallelVerses();
        else render();
    };
    window.cvBibleSearchDictionary = function() {
        const q = (state.bibleStudio.dictionaryQuery || '').trim();
        if (!q) { window.showToast('Type a word first.', 'info'); return; }
        biblePatch({ loading: true, error: '' });
        ajaxRequest('cv_bible_dictionary', { query: q, version: state.bibleStudio.version || 'KJV' }).done(function(response) {
            biblePatch({ dictionaryResult: response && response.success && response.data ? (response.data.item || null) : null, dictionaryItems: response && response.success && response.data ? (response.data.items || []) : [], loading: false });
        }).fail(function() { biblePatch({ loading: false, error: 'Dictionary API request failed.' }); });
    };
    window.cvBibleCopyQuote = function(index) {
        const q = (state.bibleStudio.quotes || [])[parseInt(index, 10)];
        if (!q) return;
        navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText('"' + q.text + '" — ' + q.author) : null;
        window.showToast('Quote copied.', 'success');
    };
    window.cvBibleTypingInput = function(value) {
        const target = CV_BIBLE_PASSAGES[state.bibleStudio.typingRef] || '';
        if (!state.bibleStudio.typingStart && value.length === 1) state.bibleStudio.typingStart = Date.now();
        const input = String(value).slice(0, target.length);
        const finished = input === target;
        if (finished && !state.bibleStudio.typingFinished && state.isLoggedIn) {
            const minutes = Math.max(1 / 60, (Date.now() - (state.bibleStudio.typingStart || Date.now())) / 60000);
            const wpm = Math.round((target.split(/\s+/).length || 1) / minutes);
            ajaxRequest('cv_bible_save_typing_score', { reference: state.bibleStudio.typingRef, wpm: wpm, accuracy: 100 });
        }
        biblePatch({ typingInput: input, typingFinished: finished });
    };
    window.cvBibleResetTyping = function() { biblePatch({ typingInput: '', typingStart: 0, typingFinished: false }); };
    window.cvBibleNote = function(key, value) {
        const notes = Object.assign({}, state.bibleStudio.sermonNotes || {}); notes[key] = value; biblePatch({ sermonNotes: notes }, false);
    };
    window.cvBibleSaveNotes = function() {
        if (!state.isLoggedIn) { openAuthPanel('signin'); return; }
        ajaxRequest('cv_bible_save_notes', { notes: JSON.stringify(state.bibleStudio.sermonNotes || {}) }).done(function(response) {
            window.showToast(response && response.success ? 'Sermon notes saved.' : 'Could not save notes.', response && response.success ? 'success' : 'error');
        });
    };
    window.cvBibleSocial = function(key, value) {
        const patch = {}; patch[key] = value; biblePatch(patch, false); cvInitBibleStudioAfterRender();
    };
    window.cvBibleUploadPersonalPhoto = function(input) {
        const notify = window.showToast || function() {};
        const file = input && input.files && input.files[0];
        if (!file) return;
        if (!/^image\//i.test(file.type || '')) {
            notify('Please choose an image file.', 'error');
            input.value = '';
            return;
        }
        if (file.size > 8 * 1024 * 1024) {
            notify('Please choose an image under 8 MB.', 'error');
            input.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = function(event) {
            const dataUrl = event && event.target ? event.target.result : '';
            if (!dataUrl) { notify('Could not read this image.', 'error'); return; }
            const patch = { socialCustomBg: dataUrl };
            biblePatch(patch, true);
            notify('Personal photo applied to preview.', 'success');
        };
        reader.onerror = function() { notify('Could not read this image.', 'error'); };
        reader.readAsDataURL(file);
        input.value = '';
    };
    window.cvBibleDownloadCanvas = function() {
        const canvas = document.getElementById('cv-bible-social-canvas');
        if (!canvas) return;
        try {
            const link = document.createElement('a'); link.download = 'faith-in-scripture.png'; link.href = canvas.toDataURL('image/png'); link.click();
        } catch (e) { window.showToast('Download blocked by browser image security. Try another background.', 'error'); }
    };
    window.cvBibleAiImage = function() {
        const prompt = ((document.getElementById('cv-bible-ai-prompt') || {}).value || '').trim();
        if (!prompt) { window.showToast('Enter an image prompt first.', 'info'); return; }
        biblePatch({ loading: true, error: '' }, false);
        ajaxRequest('cv_bible_ai_image', { prompt: prompt }).done(function(response) {
            if (response && response.success && response.data && response.data.image) {
                biblePatch({ socialCustomBg: response.data.image, socialAiPrompt: prompt, loading: false });
                window.showToast(response.data.message || 'Background generated with Gemini.', 'success');
            } else {
                biblePatch({ loading: false, error: (response && response.data && response.data.message) ? response.data.message : 'Gemini image request failed.' });
                window.showToast((response && response.data && response.data.message) ? response.data.message : 'Gemini image request failed.', 'error');
            }
        }).fail(function() {
            biblePatch({ loading: false, error: 'Gemini request failed.' });
            window.showToast('Gemini request failed.', 'error');
        });
    };

    function renderBibleStudio() {
        const b = state.bibleStudio || {};
        const tools = [
            ['Dashboard','home',0], ['Bible Reader','book-open',1], ['Parallel Bible','columns',2], ['Concordance','book-a',3], ['Lectures & Media','video',4], ['Social Studio','image',5], ['General Quotes','quote',6], ['Preacher Quotes','mic',7], ['Scripture Typing','keyboard',8], ['Sermon Planner','edit-3',9]
        ];
        const buttons = tools.map(t => `<button type="button" onclick="cvBibleTool(${t[2]})" class="cv-bible-tool-btn ${parseInt(b.activeTool,10)===t[2]?'is-active':''}"><i data-lucide="${t[1]}" class="cv-bible-tool-icon"></i><span>${escapeHtml(t[0])}</span><i data-lucide="chevron-right" class="cv-bible-tool-chevron"></i></button>`).join('');
        return `<section class="cv-bible-studio"><aside class="cv-bible-sidebar"><div class="cv-bible-logo"><i data-lucide="book-open"></i><strong>Social Studio</strong></div><p class="cv-bible-side-note">Beautiful reading, planning, and design tools for your account.</p>${buttons}</aside><div class="cv-bible-main">${renderBiblePanel()}</div></section>`;
    }

    function renderBibleHero(title, subtitle, actions) {
        return `<div class="cv-bible-hero"><div><h2>${escapeHtml(title)}</h2>${subtitle ? `<p class="cv-bible-muted">${escapeHtml(subtitle)}</p>` : ''}</div>${actions ? `<div class="cv-bible-hero-actions">${actions}</div>` : ''}</div>`;
    }

    const CV_BIBLE_VERSION_OPTIONS = [
        { value: 'KHMER_OLD_1954', label: 'Khmer Old 1954' },
        { value: 'KJV', label: 'KJV' },
        { value: 'WEB', label: 'WEB' },
        { value: 'ESV', label: 'ESV' },
        { value: 'NIV', label: 'NIV' }
    ];

    function bibleVersionOptions(selected) {
        return CV_BIBLE_VERSION_OPTIONS.map(item => `<option value="${escapeAttr(item.value)}" ${selected===item.value?'selected':''}>${escapeHtml(item.label)}</option>`).join('');
    }

    function bibleTopControls(parallel) {
        const b = state.bibleStudio || {};
        const chapters = getBibleBookChapters(b.book || 'John');
        return `<div class="cv-bible-section-card cv-bible-controls-card"><div class="cv-bible-field-grid ${parallel ? 'is-parallel' : ''}"><label class="cv-bible-field"><span>Book</span><select onchange="cvBibleSet('book', this.value)">${Object.keys(CV_BIBLE_LIBRARY).map(x=>`<option value="${escapeAttr(x)}" ${b.book===x?'selected':''}>${escapeHtml(x)}</option>`).join('')}</select></label><label class="cv-bible-field"><span>Chapter</span><select onchange="cvBibleSet('chapter', this.value)">${chapters.map(x=>`<option value="${escapeAttr(x)}" ${String(b.chapter)===String(x)?'selected':''}>${escapeHtml(x)}</option>`).join('')}</select></label><label class="cv-bible-field"><span>Version</span><select onchange="cvBibleSet('version', this.value)">${bibleVersionOptions(b.version || 'KHMER_OLD_1954')}</select></label>${parallel?`<label class="cv-bible-field"><span>Compare With</span><select onchange="cvBibleSet('version2', this.value)">${bibleVersionOptions(b.version2 || 'KJV')}</select></label>`:''}</div></div>`;
    }

    function renderVerses(list) {
        if (state.bibleStudio.loading) return `<div class="cv-bible-loading"><i data-lucide="loader-2"></i> Loading from backend...</div>`;
        if (!list || !list.length) return `<div class="cv-bible-empty"><i data-lucide="book-open"></i><p>No verses loaded yet.</p></div>`;
        return list.map(v => `<p class="cv-bible-verse"><sup>${parseInt(v.v||0,10)}</sup>${renderLocalizedText(v.text||'')}</p>`).join('');
    }

    function renderBiblePanel() {
        const b = state.bibleStudio || {};
        if (b.error) window.setTimeout(function(){ window.showToast(b.error, 'error'); }, 50);
        switch (parseInt(b.activeTool || 5, 10)) {
            case 0: return renderBibleDashboard();
            case 1: return `<div class="cv-bible-page">${renderBibleHero('Library Reader', 'Read Khmer Old Version 1954 scripture cards from the backend, with only supported chapter options shown.')}${bibleTopControls(false)}<div class="cv-bible-reader cv-bible-section-card">${renderVerses(b.verses)}</div></div>`;
            case 2: return `<div class="cv-bible-page">${renderBibleHero('Parallel Analysis', 'Compare the same passage across two translations without clipped labels or hidden words.')}${bibleTopControls(true)}<div class="cv-bible-parallel"><div class="cv-bible-section-card">${renderVerses(b.verses)}</div><div class="cv-bible-section-card">${renderVerses(b.verses2)}</div></div></div>`;
            case 3: return renderBibleDictionary();
            case 4: return renderBibleMedia();
            case 5: return renderBibleSocialStudio();
            case 6: return renderBibleQuotes('General');
            case 7: return renderBibleQuotes('Preacher');
            case 8: return renderBibleTyping();
            case 9: return renderBibleSermonPlanner();
            default: return renderBibleDashboard();
        }
    }

    function renderBibleDashboard() {
        const b = state.bibleStudio || {}, stats = b.stats || {};
        return `<div class="cv-bible-page cv-bible-dashboard">${renderBibleHero('Social Studio', 'A cleaner workspace for reading, comparing, planning, and designing scripture content.')}
            <div class="cv-bible-dashboard-grid">
                <div class="cv-bible-phone-card">
                    <div class="cv-bible-avatar">${state.currentUser && state.currentUser.avatar_url ? `<img src="${escapeAttr(state.currentUser.avatar_url)}" alt="">` : '<i data-lucide="user"></i>'}</div>
                    <h3>${escapeHtml((state.currentUser && state.currentUser.name) || 'Faith In Member')}</h3>
                    <p>Study • Create • Share</p>
                    <div class="cv-bible-stats"><span><i data-lucide="zap"></i> Streak <strong>${parseInt(stats.streak||5,10)}</strong></span><span><i data-lucide="star"></i> Weeks <strong>${parseInt(stats.weeks||17,10)}</strong></span></div>
                </div>
                <div class="cv-bible-overview-cards">
                    <article class="cv-bible-overview-card"><i data-lucide="book-open"></i><h3>Smart reading</h3><p>Only valid local chapters are shown, so your reader stays tidy and useful.</p></article>
                    <article class="cv-bible-overview-card"><i data-lucide="image"></i><h3>Beautiful graphics</h3><p>Create social verse images with improved spacing, cleaner controls, and Gemini image backgrounds.</p></article>
                    <article class="cv-bible-overview-card"><i data-lucide="edit-3"></i><h3>Message notes</h3><p>Write doctrine, encouragement, and application notes and save them to the backend.</p></article>
                </div>
            </div>
        </div>`;
    }

    function renderBibleDictionary() {
        const b = state.bibleStudio || {}, r = b.dictionaryResult, items = b.dictionaryItems || [];
        const searchItems = items.length ? `<div class="cv-bible-section-card cv-bible-search-results">${items.map(x=>`<article><strong>${escapeHtml(x.reference||'')}</strong><p>${escapeHtml(x.text||'')}</p></article>`).join('')}</div>` : '';
        const wordStudy = r ? `<div class="cv-bible-result cv-bible-section-card"><h3>${escapeHtml(b.dictionaryQuery||'')}</h3><p class="cv-bible-blue">${escapeHtml(r.original)} / ${escapeHtml(r.transliteration)}</p><p>${escapeHtml(r.meaning)}</p></div>` : '';
        const empty = (!r && !items.length) ? `<div class="cv-bible-empty cv-bible-section-card"><i data-lucide="search"></i><p>${b.dictionaryQuery ? 'No result found yet. Add API.Bible settings for full concordance search.' : 'Search words like grace, faith, love, peace, or any Bible keyword.'}</p></div>` : '';
        return `<div class="cv-bible-page">${renderBibleHero('Concordance Search', 'Search Bible keywords through your backend. API.Bible results show verses; local word-study fallback shows meanings.')}<div class="cv-bible-search cv-bible-section-card"><input value="${escapeAttr(b.dictionaryQuery||'')}" oninput="cvBibleSet('dictionaryQuery', this.value)" placeholder="Search: grace, love, faith, peace"><button onclick="cvBibleSearchDictionary()"><i data-lucide="search"></i> Search</button></div>${searchItems}${wordStudy}${empty}</div>`;
    }

    function renderBibleMedia() {
        const b = state.bibleStudio || {};
        return `<div class="cv-bible-page">${renderBibleHero('Media Library', 'Keep your study videos and lessons in a cleaner card layout.')}<div class="cv-bible-media-grid">${(b.media||[]).map(v=>`<article class="cv-bible-media"><div style="background-image:url('${escapeAttr(v.image)}')"><button><i data-lucide="play"></i></button><span>${escapeHtml(v.duration)}</span></div><h3>${escapeHtml(v.title)}</h3><p>${escapeHtml(v.speaker)}</p></article>`).join('')}</div></div>`;
    }

    function renderBibleQuotes(type) {
        const b = state.bibleStudio || {};
        return `<div class="cv-bible-page">${renderBibleHero(type + ' Inspiration', 'Copy favorite quotes for sermons, posts, or personal encouragement.')}<div class="cv-bible-quotes">${(b.quotes||[]).map((q,i)=>`<article><div class="cv-bible-quote-head"><span class="cv-bible-status-chip">Quote</span><button onclick="cvBibleCopyQuote(${i})"><i data-lucide="copy"></i></button></div><p>“${escapeHtml(q.text)}”</p><strong>— ${escapeHtml(q.author)}</strong></article>`).join('')}</div></div>`;
    }

    function renderBibleTyping() {
        const b = state.bibleStudio || {}, target = CV_BIBLE_PASSAGES[b.typingRef] || '', input = b.typingInput || '';
        let correct = 0; for (let i=0;i<input.length;i++) if (input[i]===target[i]) correct++;
        const accuracy = input.length ? Math.round((correct/input.length)*100) : 100;
        const minutes = b.typingStart ? Math.max((Date.now()-b.typingStart)/60000, 0.01) : 0.01;
        const wpm = input.length ? Math.round((input.length/5)/minutes) : 0;
        const letters = target.split('').map((ch,i)=>`<span class="${i<input.length?(input[i]===ch?'ok':'bad'):'todo'}">${escapeHtml(ch)}</span>`).join('');
        return `<div class="cv-bible-page">${renderBibleHero('Focus Typing', 'Practice scripture with live speed and accuracy feedback.')}<div class="cv-bible-typing-head cv-bible-section-card"><select onchange="cvBibleSet('typingRef', this.value);cvBibleResetTyping();">${Object.keys(CV_BIBLE_PASSAGES).map(k=>`<option ${b.typingRef===k?'selected':''}>${k}</option>`).join('')}</select><button onclick="cvBibleResetTyping()"><i data-lucide="refresh-cw"></i></button><span>Speed <strong>${wpm}</strong> WPM</span><span>Accuracy <strong>${accuracy}%</strong></span></div><div class="cv-bible-typing-text cv-bible-section-card">${letters}</div><textarea class="cv-bible-typing-input" oninput="cvBibleTypingInput(this.value)" value="${escapeAttr(input)}" placeholder="Start typing here...">${escapeHtml(input)}</textarea>${b.typingFinished?'<div class="cv-bible-success">Masterful work!</div>':''}</div>`;
    }

    function renderBibleSermonPlanner() {
        const notes = (state.bibleStudio && state.bibleStudio.sermonNotes) || {};
        const actions = `<button onclick="cvBibleSaveNotes()"><i data-lucide="save"></i> Save Notes</button>`;
        return `<div class="cv-bible-page">${renderBibleHero('Message Notes', 'Capture your message flow with a cleaner, roomier layout.', actions)}<div class="cv-bible-notes">${['Doctrine','Encouragement','Application'].map(k=>`<article class="cv-bible-note-card"><div class="cv-bible-note-head"><h3>${k}</h3><p>${k==='Doctrine'?'Core biblical truth':(k==='Encouragement'?'Comfort, hope, and inspiration':'Practical response and next steps')}</p></div><textarea oninput="cvBibleNote('${k}', this.value)" placeholder="Start typing...">${escapeHtml(notes[k]||'')}</textarea></article>`).join('')}</div></div>`;
    }

    function renderBibleSocialStudio() {
        const b = state.bibleStudio || {};
        const selectedBgLabel = '8 real photo wallpapers';
        const fontSize = parseFloat(b.socialFontSize || 44) || 44;
        const fontOptions = ['Poppins','Koh Santepheap','Georgia','Playfair Display','Inter','Arial'];
        const active = (key) => b[key] ? 'is-active' : '';
        const socialAssetTab = b.socialAssetTab || 'photos';
        const creativeTools = [
            {
                id: 'shapes',
                label: 'Shapes',
                hint: 'Layer geometric accents',
                status: 'Soon',
                tone: 'shapes',
                icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4 19 18a2 2 0 0 1-1.79 3H6.79A2 2 0 0 1 5 18L12 4Z"/></svg>'
            },
            {
                id: 'graphics',
                label: 'Graphics',
                hint: 'Decorative illustrations',
                status: 'Soon',
                tone: 'graphics',
                icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21V10"/><path d="M8 14c0-1.6 1.3-3 3-3h2"/><path d="M9 18c0-1.7 1.4-3 3-3h1"/><path d="M8 10c-1.7 0-3-1.3-3-3s1.3-3 3-3c.8 0 1.6.3 2.1.9"/><path d="M16 10c1.7 0 3-1.3 3-3s-1.3-3-3-3c-.8 0-1.6.3-2.1.9"/><path d="M7 14c-1.7 0-3 1.3-3 3s1.3 3 3 3c1 0 1.8-.4 2.4-1.1"/><path d="M17 14c1.7 0 3 1.3 3 3s-1.3 3-3 3c-1 0-1.8-.4-2.4-1.1"/></svg>'
            },
            {
                id: 'three-d',
                label: '3D',
                hint: 'Depth-driven objects',
                status: 'Soon',
                tone: 'three-d',
                icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 8 4.5v10L12 21 4 16.5v-10L12 2Z"/><path d="M12 21V11.5"/><path d="M20 6.5 12 11 4 6.5"/></svg>'
            },
            {
                id: 'animations',
                label: 'Animations',
                hint: 'Animated sticker ideas',
                status: 'Soon',
                tone: 'animations',
                icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><path d="M9 10h.01"/><path d="M15 10h.01"/><path d="M8.5 14.5c1 1.2 2.2 1.8 3.5 1.8 1.3 0 2.5-.6 3.5-1.8"/></svg>'
            },
            {
                id: 'photos',
                label: 'Photos',
                hint: 'Wallpapers and uploads',
                status: 'Ready',
                tone: 'photos',
                icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="9" cy="10" r="1.7"/><path d="m21 16-4.8-4.8a1.6 1.6 0 0 0-2.3 0L7 18"/></svg>'
            },
            {
                id: 'frames',
                label: 'Frames',
                hint: 'Photo framing styles',
                status: 'Soon',
                tone: 'frames',
                icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3v6"/><path d="M17 3v6"/><path d="M7 15v6"/><path d="M17 15v6"/><path d="M3 7h6"/><path d="M15 7h6"/><path d="M3 17h6"/><path d="M15 17h6"/></svg>'
            }
        ];
        const activeTool = creativeTools.find((item) => item.id === socialAssetTab) || creativeTools[4];
        const helperText = socialAssetTab === 'photos'
            ? '<strong>Photos is active.</strong> Upload a personal image or choose a real wallpaper below to use it directly in your preview and export.'
            : `<strong>${activeTool.label}</strong> has been added as a category in Social Studio. Photo tools remain available below while this section is prepared for a future release.`;
        return `<div class="cv-bible-page">${renderBibleHero('Social Studio', 'Create clean scripture graphics with elegant typography and real photo nature wallpapers.')}
            <section class="cv-bible-social-toolkit">
                <div class="cv-bible-social-tool-grid">${creativeTools.map((tool)=>`<button type="button" class="cv-bible-social-tool ${socialAssetTab===tool.id?'is-active':''}" onclick="cvBibleSelectCreativeTool('${tool.id}')" data-tone="${tool.tone}"><span class="cv-bible-social-tool-icon cv-bible-social-tool-icon-${tool.tone}" aria-hidden="true">${tool.icon}</span><span class="cv-bible-social-tool-text"><strong>${tool.label}</strong><small>${tool.hint}</small></span><em class="${tool.status==='Ready'?'is-ready':'is-soon'}">${tool.status.toUpperCase()}</em></button>`).join('')}</div>
                <div class="cv-bible-social-tool-banner">${helperText}</div>
            </section>
            <div class="cv-bible-social cv-bible-social-two-col">
                <div class="cv-bible-editor cv-bible-section-card cv-bible-social-left">
                    <div class="cv-bible-editor-stack">
                        <label>Content</label>
                        <textarea oninput="cvBibleSocial('socialText', this.value)" placeholder="Paste your scripture or quote...">${escapeHtml(b.socialText||'')}</textarea>
                        <label>Attribution</label>
                        <input oninput="cvBibleSocial('socialRef', this.value)" value="${escapeAttr(b.socialRef||'')}" placeholder="Psalm 23:1">
                        <div class="cv-bible-upload-panel" data-cv-social-photo-tools>
                            <div class="cv-bible-range-head"><label>Personal Photo</label><span class="cv-bible-status-chip">${b.socialCustomBg ? 'Uploaded photo active' : 'Optional upload'}</span></div>
                            <input id="cv-bible-personal-bg-upload" class="cv-bible-upload-input" type="file" accept="image/*" onchange="cvBibleUploadPersonalPhoto(this)">
                            <div class="cv-bible-upload-actions">
                                <label for="cv-bible-personal-bg-upload" class="cv-bible-upload-button"><i data-lucide="upload"></i> Upload Personal Photo</label>
                                ${b.socialCustomBg ? `<button type="button" class="cv-bible-upload-clear" onclick="cvBibleSocial('socialCustomBg', '')"><i data-lucide="image"></i> Use Gallery Photo</button>` : ''}
                            </div>
                            <p class="cv-bible-upload-note">Choose a photo from your device. It will be used in the preview and exported image.</p>
                        </div>
                        <div class="cv-bible-bg-toolbar">
                            <div class="cv-bible-range-head"><label>Real Photo Wallpaper Gallery</label><span class="cv-bible-status-chip">${escapeHtml(selectedBgLabel)}</span></div>
                            <div class="cv-bible-bg-grid">${CV_BIBLE_BACKGROUNDS.map((url,i)=>`<button type="button" aria-label="Real photo wallpaper ${i+1}" onclick="cvBibleSocial('socialBg', ${i});cvBibleSocial('socialCustomBg', '');" class="${parseInt(b.socialBg||0,10)===i && !b.socialCustomBg?'is-active':''}" style="background-image:url('${url}')"><img src="${escapeAttr(url)}" alt="Real photo wallpaper ${i+1}" loading="lazy"></button>`).join('')}</div>
                        </div>
                        <div class="cv-bible-editor-actions"><button onclick="cvBibleDownloadCanvas()" class="cv-bible-dark cv-bible-export-purple"><i data-lucide="download"></i> Export Image</button></div>
                    </div>
                </div>
                <div class="cv-bible-section-card cv-bible-social-right">
                    <div class="cv-bible-canvas-wrap"><canvas id="cv-bible-social-canvas" width="1080" height="1080"></canvas><p>Canvas Preview - 1080x1080px</p></div>
                    <div class="cv-bible-editor cv-bible-social-controls">
                        <div class="cv-bible-editor-stack">
                            <label>Typography</label>
                            <div class="cv-bible-typebar"><select onchange="cvBibleSocial('socialFont', this.value)">${fontOptions.map(f=>`<option value="${escapeAttr(f)}" ${b.socialFont===f?'selected':''}>${escapeHtml(f)}</option>`).join('')}</select><button type="button" onclick="cvBibleStepFont(-2)">-</button><strong>${fontSize.toFixed(fontSize % 1 ? 1 : 0)}</strong><button type="button" onclick="cvBibleStepFont(2)">+</button><button type="button" class="${active('socialBold')}" onclick="cvBibleSocial('socialBold', !state.bibleStudio.socialBold)"><b>B</b></button><button type="button" class="${active('socialItalic')}" onclick="cvBibleSocial('socialItalic', !state.bibleStudio.socialItalic)"><em>I</em></button><button type="button" class="${active('socialUnderline')}" onclick="cvBibleSocial('socialUnderline', !state.bibleStudio.socialUnderline)"><u>U</u></button><button type="button" class="${active('socialStrike')}" onclick="cvBibleSocial('socialStrike', !state.bibleStudio.socialStrike)"><s>S</s></button><button type="button" class="${active('socialUppercase')}" onclick="cvBibleSocial('socialUppercase', !state.bibleStudio.socialUppercase)">aA</button><button type="button" onclick="cvBibleCycleAlign()"><i data-lucide="align-center"></i></button></div>
                            <div class="cv-bible-range-head"><label>Font Size</label><strong>${parseInt(b.socialFontSize||44,10)} px</strong></div>
                            <input type="range" min="20" max="86" value="${parseInt(b.socialFontSize||44,10)}" oninput="cvBibleSocial('socialFontSize', this.value)">
                            <div class="cv-bible-range-head"><label>Dark Overlay</label><strong>${parseInt(b.socialOverlay||38,10)}%</strong></div>
                            <input type="range" min="0" max="80" value="${parseInt(b.socialOverlay||38,10)}" oninput="cvBibleSocial('socialOverlay', this.value)">
                            <div class="cv-bible-field-grid is-tight"><label class="cv-bible-field"><span>Text Align</span><select onchange="cvBibleSocial('socialAlign', this.value)"><option value="left" ${b.socialAlign==='left'?'selected':''}>Left</option><option value="center" ${b.socialAlign==='center'?'selected':''}>Center</option><option value="right" ${b.socialAlign==='right'?'selected':''}>Right</option></select></label><label class="cv-bible-field"><span>Text Color</span><input type="color" value="${escapeAttr(b.socialColor||'#ffffff')}" oninput="cvBibleSocial('socialColor', this.value)"></label></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    }
    function cvBibleStepFont(delta) {
        const b = state.bibleStudio || {};
        const next = Math.max(20, Math.min(86, (parseFloat(b.socialFontSize || 44) || 44) + delta));
        cvBibleSocial('socialFontSize', next);
    }
    window.cvBibleStepFont = cvBibleStepFont;
    function cvBibleCycleAlign() {
        const b = state.bibleStudio || {};
        const order = ['left','center','right'];
        const current = order.indexOf(b.socialAlign || 'center');
        cvBibleSocial('socialAlign', order[(current + 1 + order.length) % order.length]);
    }
    window.cvBibleCycleAlign = cvBibleCycleAlign;

    function cvBibleSelectCreativeTool(tool) {
        cvBibleSocial('socialAssetTab', tool);
        setTimeout(function () {
            const target = document.querySelector(tool === 'photos' ? '[data-cv-social-photo-tools]' : '.cv-bible-social-tool-feedback');
            if (target && typeof target.scrollIntoView === 'function') {
                target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }, 60);
    }
    window.cvBibleSelectCreativeTool = cvBibleSelectCreativeTool;
    function cvInitBibleStudioAfterRender() {
        const canvas = document.getElementById('cv-bible-social-canvas');
        if (!canvas) return;
        const b = state.bibleStudio || {};
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;
        const url = b.socialCustomBg || CV_BIBLE_BACKGROUNDS[parseInt(b.socialBg || 0, 10)] || CV_BIBLE_BACKGROUNDS[0];

        function wrapParagraphs(fontSize, maxWidth) {
            const font = (b.socialFont || 'Koh Santepheap') + ', Georgia, serif';
            const weight = b.socialBold === false ? '400' : '700';
            const italic = b.socialItalic ? 'italic ' : '';
            ctx.font = italic + weight + ' ' + fontSize + 'px ' + font;
            const rawText = b.socialUppercase ? String(b.socialText || '').toUpperCase() : String(b.socialText || '');
            const paragraphs = rawText.split(/\n/);
            const lines = [];
            paragraphs.forEach(function(par) {
                const words = String(par).split(/\s+/).filter(Boolean);
                if (!words.length) { lines.push(''); return; }
                let line = '';
                words.forEach(function(word) {
                    const test = line ? (line + ' ' + word) : word;
                    if (ctx.measureText(test).width > maxWidth && line) {
                        lines.push(line);
                        line = word;
                    } else {
                        line = test;
                    }
                });
                if (line) lines.push(line);
            });
            return lines;
        }

        function drawTextBlock() {
            const overlay = Math.max(0, Math.min(80, parseInt(b.socialOverlay || 38, 10))) / 100;
            ctx.fillStyle = 'rgba(0,0,0,' + overlay + ')';
            ctx.fillRect(0, 0, W, H);
            const align = b.socialAlign || 'center';
            const x = align === 'left' ? W * 0.11 : (align === 'right' ? W * 0.89 : W / 2);
            const maxWidth = W * 0.76;
            const footerSizeBase = Math.max(22, Math.round((parseInt(b.socialFontSize || 44, 10) || 44) * 0.48));
            let size = parseInt(b.socialFontSize || 44, 10) || 44;
            let lines = wrapParagraphs(size, maxWidth);
            let footerSize = footerSizeBase;
            let lineHeight = size * ((parseInt(b.socialLineHeight || 128, 10) || 128) / 100);
            let totalHeight = lines.length * lineHeight + footerSize * 2.2;
            while ((lines.length > 8 || totalHeight > H * 0.62) && size > 28) {
                size -= 2;
                footerSize = Math.max(20, Math.round(size * 0.48));
                lines = wrapParagraphs(size, maxWidth);
                lineHeight = size * ((parseInt(b.socialLineHeight || 128, 10) || 128) / 100);
                totalHeight = lines.length * lineHeight + footerSize * 2.2;
            }
            const font = (b.socialFont || 'Koh Santepheap') + ', Georgia, serif';
            const weight = b.socialBold === false ? '400' : '700';
            const italic = b.socialItalic ? 'italic ' : '';
            ctx.textAlign = align;
            ctx.textBaseline = 'middle';
            ctx.fillStyle = b.socialColor || '#ffffff';
            ctx.shadowColor = 'rgba(0,0,0,.45)';
            ctx.shadowBlur = 18;
            ctx.shadowOffsetY = 4;
            ctx.font = italic + weight + ' ' + size + 'px ' + font;
            let y = Math.max(H * 0.24, (H - totalHeight) / 2 + size * 0.55);
            lines.forEach(function(line) {
                ctx.fillText(line, x, y, maxWidth);
                if ((b.socialUnderline || b.socialStrike) && line) {
                    const metrics = ctx.measureText(line);
                    const width = Math.min(metrics.width, maxWidth);
                    const startX = align === 'center' ? x - width / 2 : (align === 'right' ? x - width : x);
                    ctx.save();
                    ctx.shadowBlur = 0;
                    ctx.strokeStyle = b.socialColor || '#ffffff';
                    ctx.lineWidth = Math.max(2, size * 0.055);
                    ctx.lineCap = 'round';
                    if (b.socialUnderline) { ctx.beginPath(); ctx.moveTo(startX, y + size * 0.58); ctx.lineTo(startX + width, y + size * 0.58); ctx.stroke(); }
                    if (b.socialStrike) { ctx.beginPath(); ctx.moveTo(startX, y); ctx.lineTo(startX + width, y); ctx.stroke(); }
                    ctx.restore();
                }
                y += lineHeight;
            });
            const ref = String(b.socialRef || '').trim();
            if (ref) {
                ctx.globalAlpha = 0.96;
                ctx.font = italic + '500 ' + footerSize + 'px ' + font;
                ctx.fillText('— ' + ref + ' —', x, Math.min(H * 0.86, y + footerSize));
                ctx.globalAlpha = 1;
            }
        }

        ctx.clearRect(0, 0, W, H);
        const img = new Image();
        if (/^https?:/i.test(url)) img.crossOrigin = 'anonymous';
        img.onload = function() {
            ctx.clearRect(0, 0, W, H);
            const scale = Math.max(W / img.width, H / img.height);
            const w = img.width * scale;
            const h = img.height * scale;
            ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
            drawTextBlock();
        };
        img.onerror = function() {
            ctx.clearRect(0, 0, W, H);
            const gradient = ctx.createLinearGradient(0, 0, W, H);
            gradient.addColorStop(0, '#1f3b62');
            gradient.addColorStop(1, '#0b1726');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, W, H);
            drawTextBlock();
        };
        img.src = url;
    }


    /* v5.5.146 - mount the app at body top and force the global nav to viewport top.
       This avoids WordPress/theme wrappers with padding/transform creating a fake top gap. */
    function cvMountAppAtBodyTop() {
        try {
            var wrap = document.querySelector('.curated-vault-premium-wrap');
            var rootNode = document.getElementById('cv-root');
            if (!wrap || !rootNode || !document.body) { return; }
            document.documentElement.classList.add('cv-faith-in-app-page');
            document.body.classList.add('cv-faith-in-platform');

            document.documentElement.style.setProperty('margin', '0', 'important');
            document.documentElement.style.setProperty('margin-top', '0', 'important');
            document.documentElement.style.setProperty('padding', '0', 'important');
            document.documentElement.style.setProperty('padding-top', '0', 'important');
            document.body.style.setProperty('margin', '0', 'important');
            document.body.style.setProperty('margin-top', '0', 'important');
            document.body.style.setProperty('padding', '0', 'important');
            document.body.style.setProperty('padding-top', '0', 'important');
            document.body.style.setProperty('overflow-x', 'hidden', 'important');

            // Place the app directly under <body> so fixed nav is relative to the viewport, not a transformed theme wrapper.
            if (wrap.parentElement !== document.body || document.body.firstElementChild !== wrap) {
                document.body.insertBefore(wrap, document.body.firstChild || null);
            }
            wrap.classList.add('cv-body-mounted-app');
            wrap.style.setProperty('position', 'relative', 'important');
            wrap.style.setProperty('top', '0', 'important');
            wrap.style.setProperty('left', '0', 'important');
            wrap.style.setProperty('right', '0', 'important');
            wrap.style.setProperty('width', '100%', 'important');
            wrap.style.setProperty('max-width', 'none', 'important');
            wrap.style.setProperty('min-height', '100vh', 'important');
            wrap.style.setProperty('margin', '0', 'important');
            wrap.style.setProperty('margin-top', '0', 'important');
            wrap.style.setProperty('padding', '0', 'important');
            var cvMobileNoTopGap = !!(window.matchMedia && window.matchMedia('(max-width: 900px), (hover: none) and (pointer: coarse)').matches);
            wrap.style.setProperty('padding-top', cvMobileNoTopGap ? '0' : '58px', 'important');
            wrap.style.setProperty('transform', 'none', 'important');
            wrap.style.setProperty('contain', 'none', 'important');
            wrap.style.setProperty('z-index', '1', 'important');
            rootNode.style.setProperty('margin', '0', 'important');
            rootNode.style.setProperty('margin-top', '0', 'important');
            rootNode.style.setProperty('padding', '0', 'important');
            rootNode.style.setProperty('padding-top', '0', 'important');
            rootNode.style.setProperty('width', '100%', 'important');
            rootNode.style.setProperty('max-width', 'none', 'important');

            var navs = Array.prototype.slice.call(document.querySelectorAll('[data-cv-global-nav="1"], #cv-react-global-nav, .cv-react-global-nav, .glass-nav.cv-fixed-clean-nav, .cv-fixed-clean-nav'));
            navs.forEach(function (nav, index) {
                if (!nav || !nav.matches || !nav.matches('[data-cv-global-nav="1"], #cv-react-global-nav, .cv-react-global-nav, .glass-nav.cv-fixed-clean-nav, .cv-fixed-clean-nav')) { return; }
                if (index > 0 && nav.id === 'cv-react-global-nav' && nav.parentNode !== rootNode) {
                    nav.parentNode.removeChild(nav);
                    return;
                }
                var cvMobileNoTopGap = !!(window.matchMedia && window.matchMedia('(max-width: 900px), (hover: none) and (pointer: coarse)').matches);
                nav.style.setProperty('position', cvMobileNoTopGap ? 'sticky' : 'fixed', 'important');
                nav.style.setProperty('top', '0', 'important');
                nav.style.setProperty('left', '0', 'important');
                nav.style.setProperty('right', '0', 'important');
                nav.style.setProperty('bottom', 'auto', 'important');
                nav.style.setProperty('width', '100%', 'important');
                nav.style.setProperty('max-width', '100vw', 'important');
                nav.style.setProperty('height', cvMobileNoTopGap ? 'auto' : '58px', 'important');
                nav.style.setProperty('min-height', cvMobileNoTopGap ? '0' : '58px', 'important');
                nav.style.setProperty('max-height', cvMobileNoTopGap ? 'none' : '58px', 'important');
                nav.style.setProperty('margin', '0', 'important');
                nav.style.setProperty('margin-top', '0', 'important');
                nav.style.setProperty('padding', '0', 'important');
                nav.style.setProperty('padding-top', '0', 'important');
                nav.style.setProperty('transform', 'none', 'important');
                nav.style.setProperty('z-index', '2147483000', 'important');
                nav.style.setProperty('overflow', 'visible', 'important');
                nav.style.setProperty('background', '#ffffff', 'important');
            });
            document.querySelectorAll('#cv-react-global-nav .cv-nav-shell, .cv-react-global-nav .cv-nav-shell, .cv-fixed-clean-nav .cv-nav-shell, #cv-root .cv-react-nav-shell').forEach(function (shell) {
                var cvMobileNoTopGap = !!(window.matchMedia && window.matchMedia('(max-width: 900px), (hover: none) and (pointer: coarse)').matches);
                shell.style.setProperty('height', cvMobileNoTopGap ? '0' : '58px', 'important');
                shell.style.setProperty('min-height', cvMobileNoTopGap ? '0' : '58px', 'important');
                shell.style.setProperty('max-height', cvMobileNoTopGap ? '0' : '58px', 'important');
                if (cvMobileNoTopGap) { shell.style.setProperty('display', 'none', 'important'); }
                shell.style.setProperty('margin', '0 auto', 'important');
                shell.style.setProperty('padding-top', '0', 'important');
                shell.style.setProperty('padding-bottom', '0', 'important');
                shell.style.setProperty('align-items', 'center', 'important');
            });

            // Kill known theme/admin spacers that were leaving the 180px blank strip.
            document.querySelectorAll('#wpadminbar, header, footer, #masthead, #colophon, .site-header, .site-footer, .entry-header, .page-header, .wp-block-template-part, .wp-block-navigation').forEach(function (el) {
                if (!el || el.contains(wrap) || el === wrap) { return; }
                el.classList.add('cv-theme-top-spacer-hidden');
                el.setAttribute('aria-hidden', 'true');
                el.style.setProperty('display', 'none', 'important');
                el.style.setProperty('visibility', 'hidden', 'important');
                el.style.setProperty('height', '0', 'important');
                el.style.setProperty('min-height', '0', 'important');
                el.style.setProperty('max-height', '0', 'important');
                el.style.setProperty('margin', '0', 'important');
                el.style.setProperty('padding', '0', 'important');
                el.style.setProperty('border', '0', 'important');
                el.style.setProperty('overflow', 'hidden', 'important');
            });
        } catch (error) {
            if (window.console && console.warn) console.warn('Faith In top header fix failed', error);
        }
    }


    function cvOptimizeRenderedMedia(root) {
        try {
            if (!root) return;
            root.querySelectorAll('img').forEach(function(img, index) {
                if (!img.hasAttribute('loading') && index > 2) img.setAttribute('loading', 'lazy');
                if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
                if (!img.hasAttribute('draggable')) img.setAttribute('draggable', 'false');
            });
            root.querySelectorAll('video').forEach(function(video) {
                if (!video.hasAttribute('preload')) video.setAttribute('preload', 'metadata');
                if (!video.hasAttribute('playsinline')) video.setAttribute('playsinline', '');
            });
        } catch (error) {}
    }

    function cvRegisterPerformanceGuards() {
        if (window.__cvFaithInPerformanceGuardsReady) return;
        window.__cvFaithInPerformanceGuardsReady = true;
        document.addEventListener('visibilitychange', function() {
            if (!document.hidden) return;
            document.querySelectorAll('#cv-root video, #cv-root audio').forEach(function(media) {
                try { if (!media.paused) media.pause(); } catch (error) {}
            });
        });
        window.addEventListener('pagehide', function() {
            try {
                (state.postMediaPreviewUrls || []).forEach(function(url) { if (url) URL.revokeObjectURL(url); });
                if (state.profileImagePreviewUrl) URL.revokeObjectURL(state.profileImagePreviewUrl);
                if (state.profileCoverPreviewUrl) URL.revokeObjectURL(state.profileCoverPreviewUrl);
                if (state.thumbnailPreviewUrl) URL.revokeObjectURL(state.thumbnailPreviewUrl);
                if (state.blessingMusicPreviewUrl) URL.revokeObjectURL(state.blessingMusicPreviewUrl);
            } catch (error) {}
        }, { once: true });
    }

    function render() {
        updateTheme();
        const root = document.getElementById('cv-root');
        if(!root) return;
        const cvFocusedField = captureCvFocusedField(root);

        let html = renderNav();
        html += `<main class="flex-1 w-full flex flex-col relative">`;

        if (state.authRestoring) {
            html += renderSessionLoading();
        } else if (cvIsSignedOut() && state.tab !== 'profile') {
            html += renderMembersOnlyGate();
        } else if (state.selectedResource) {
            html += renderResourceDetail();
        } else {
            switch (state.tab) {
                case 'home':
                    try {
                        html += renderHomeFeed();
                    } catch (error) {
                        console.error('Curated Vault Social Feed render failed', error);
                        html += `<div class="max-w-4xl mx-auto w-full px-6 py-10"><div class="cv-feed-load-error"><strong>Social Feed render error.</strong><p>Please clear cache and reload. ${escapeHtml(error && error.message ? error.message : 'Unknown error')}</p><button type="button" onclick="loadPosts()">Reload feed</button></div></div>`;
                    }
                    break;
                case 'explore':
                    try {
                        html += renderExplore();
                    } catch (error) {
                        console.error('Curated Vault Library render failed', error);
                        html += `<div class="max-w-4xl mx-auto w-full px-6 py-10"><div class="cv-feed-load-error"><strong>Library render error.</strong><p>Please clear cache and reload. ${escapeHtml(error && error.message ? error.message : 'Unknown error')}</p><button type="button" onclick="setTab('explore')">Reload Library</button></div></div>`;
                    }
                    break;
                case 'create': html += renderCreate(); break;
                case 'prayer': html += renderPrayer(); break;
                case 'jobs': html += renderJobs(); break;
                case 'users': html += renderFindUsers(); break;
                case 'bible': html += renderBibleStudio(); break;
                case 'menu': html += renderFunctionsHub(); break;
                case 'profile':
                    try {
                        html += renderProfile();
                    } catch (error) {
                        console.error('Curated Vault Profile render failed', error);
                        html += `<div class="max-w-4xl mx-auto w-full px-6 py-10"><div class="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-900"><strong>Profile render error.</strong><p>Please refresh and try again. ${escapeHtml(error && error.message ? error.message : 'Unknown error')}</p></div></div>`;
                    }
                    break;
            }
        }

        html += `</main>`;
        html += renderModal();

        root.innerHTML = html;
        cvMountAppAtBodyTop();
        if (window.requestAnimationFrame) requestAnimationFrame(cvMountAppAtBodyTop);
        setTimeout(cvMountAppAtBodyTop, 30);
        const cvHomeFeedDesktop = window.matchMedia ? window.matchMedia('(min-width: 1101px)').matches : true;
        const cvHomeFeedLocked = state.tab === 'home' && !cvIsSignedOut() && !state.selectedResource && cvHomeFeedDesktop;
        const cvBibleStudioLocked = state.tab === 'bible' && !cvIsSignedOut();
        root.classList.toggle('cv-home-feed-locked', cvHomeFeedLocked);
        root.classList.toggle('cv-bible-studio-locked', cvBibleStudioLocked);
        document.body.style.overflow = state.modal && state.modal.isOpen ? 'hidden' : ((cvHomeFeedLocked || cvBibleStudioLocked) ? 'hidden' : 'auto');
        if(window.lucide) lucide.createIcons();
        cvOptimizeRenderedMedia(root);
        cvRegisterPerformanceGuards();
        renderGoogleButtonIfNeeded();
    cvRemoveSignupGoogleUi();
        cvInitSmoothVideos();
        cvInitBibleStudioAfterRender();
        cvInitBlessingStoryAudio();

        // Set textarea value after render without re-rendering on every keystroke.
        const contentTextarea = document.getElementById('post-content-textarea');
        if (contentTextarea) contentTextarea.value = state.postContent;
        restoreCvFocusedField(root, cvFocusedField);
    }

    function cvHandleProfileTrigger(event) {
        const target = event.target && event.target.nodeType === 1 ? event.target : (event.target && event.target.parentElement ? event.target.parentElement : null);
        const trigger = target && target.closest ? target.closest('[data-cv-profile-trigger], .cv-profile-button') : null;
        if (!trigger) return;
        event.preventDefault();
        event.stopPropagation();
        if (event.stopImmediatePropagation) event.stopImmediatePropagation();
        if (typeof window.openProfile === 'function') window.openProfile();
        else if (typeof window.setTab === 'function') window.setTab('profile');
    }

    document.addEventListener('click', function(event) {
        cvHandleProfileTrigger(event);
    }, true);

    document.addEventListener('touchend', function(event) {
        cvHandleProfileTrigger(event);
    }, { capture: true, passive: false });


    let cvLastMobileViewport = cvIsMobileViewport();
    window.addEventListener('resize', function() {
        const nextMobileViewport = cvIsMobileViewport();
        if (nextMobileViewport !== cvLastMobileViewport) {
            cvLastMobileViewport = nextMobileViewport;
            render();
        }
    });

    document.addEventListener('pointerup', function(event) {
        cvHandleProfileTrigger(event);
    }, true);

    document.addEventListener('click', function(event) {
        const tabButton = event.target.closest('[data-cv-tab]');
        if (!tabButton) return;
        const tab = tabButton.getAttribute('data-cv-tab');
        if (!tab || typeof window.setTab !== 'function') return;
        event.preventDefault();
        window.setTab(tab);
    }, false);

    // Initialize
    $(document).ready(function() {
        try {
            const hashTab = String(window.location.hash || '').replace('#', '').trim();
            const hashAllowed = ['explore', 'home', 'prayer', 'jobs', 'users', 'bible', 'profile', 'create', 'menu'];
            if (hashAllowed.includes(hashTab)) state.tab = hashTab;
        } catch (error) {}
        if (state.currentUser) {
            syncAuthUserIntoForms(state.currentUser);
        }
        render();
        loadDailyBibleVerse(false);
        if (!cvIsSignedOut()) {
            loadPosts();
        }
        if (cvUsesFirebaseBackend()) {
            cvRestoreFirebaseSession();
        } else {
            ajaxRequest('cv_get_session').done(function(response) {
                if (response.success && response.data && response.data.logged_in) {
                    const sessionProfile = cvNormalizeAuthProfile(response.data, response.data);
                    if (typeof cv_ajax !== 'undefined') {
                        cv_ajax.auth = cv_ajax.auth || {};
                        cv_ajax.auth.is_logged_in = true;
                        cv_ajax.auth.current_user = sessionProfile;
                    }
                    syncAuthUserIntoForms(sessionProfile);
                    if (state.tab === 'home' && (!Array.isArray(state.posts) || !state.posts.length)) {
                        loadPosts();
                    }
                }
            });
        }
    });

})(jQuery);


/* Curated Vault 5.4.32 smooth button interactions */
(function() {
    if (window.__cvSmoothButtonsReady) return;
    window.__cvSmoothButtonsReady = true;

    document.addEventListener('click', function(event) {
        const root = document.getElementById('cv-root');
        if (!root) return;

        const button = event.target.closest('#cv-root button, #cv-root a[role="button"]');
        if (!button || button.disabled || button.classList.contains('cv-plain-button')) return;

        button.classList.remove('cv-btn-pressed');
        void button.offsetWidth;
        button.classList.add('cv-btn-pressed');

        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height, 44);
        const ripple = document.createElement('span');
        ripple.className = 'cv-btn-ripple';
        ripple.style.width = size + 'px';
        ripple.style.height = size + 'px';
        ripple.style.left = (event.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (event.clientY - rect.top - size / 2) + 'px';

        button.appendChild(ripple);
        window.setTimeout(function() {
            if (ripple && ripple.parentNode) ripple.parentNode.removeChild(ripple);
        }, 650);
    }, true);
})();


/* Embedded Messenger integrated into the main nav */
(function () {
    'use strict';
    if (window.__cvMainFeedMessengerReady) return;
    window.__cvMainFeedMessengerReady = true;
    if (typeof cv_ajax === 'undefined' || !cv_ajax.rest_root) return;

    const wrap = document.querySelector('.curated-vault-premium-wrap');
    if (!wrap) return;
    const holder = document.createElement('div');
    holder.className = 'cv-main-feed-messenger-holder';
    const panelPortal = document.createElement('div');
    panelPortal.className = 'cv-main-feed-messenger-portal';

    const state = { open:false, conversations:[], activeThreadId:null, activeUser:null, messages:[], searchResults:[], attachment:null, error:'', sending:false };
    function isLoggedIn(){ return !!(cv_ajax.auth && cv_ajax.auth.is_logged_in); }
    const loginUrl = '/wp-login.php';

    function e(v){ return String(v||'').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c])); }
    function handle(u){ const raw=(u&&u.handle) || ((u&&u.name) ? '@' + String(u.name).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') : '@user'); return raw || '@user'; }
    function av(u){ const n=(u&&u.name)||'User'; return u&&u.avatar_url ? `<img class="cv-feed-msg-avatar" src="${e(u.avatar_url)}" alt="${e(n)}">` : `<span class="cv-feed-msg-avatar cv-feed-msg-avatar-fallback">${e(n.charAt(0).toUpperCase())}</span>`; }
    function msgIcon(name, size=18){
        const common = `width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"`;
        const icons = {
            search: `<svg ${common}><path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2.35" stroke-linecap="round"/><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="2.35"/></svg>`,
            send: `<svg ${common}><path d="M22 2 11 13" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="m22 2-7 20-4-9-9-4 20-7Z" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
            close: `<svg ${common}><path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>`,
            message: `<svg ${common}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5A8.48 8.48 0 0 1 21 11v.5Z" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
            plus: `<svg ${common}><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.15"/><path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="2.15" stroke-linecap="round"/></svg>`,
            back: `<svg ${common}><path d="m15 18-6-6 6-6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
            image: `<svg ${common}><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="2"/><circle cx="8.5" cy="10" r="1.5" fill="currentColor"/><path d="m21 15-5-5L5 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
            film: `<svg ${common}><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="2"/><path d="M7 5v14M17 5v14M3 9h4M3 15h4M17 9h4M17 15h4" stroke="currentColor" stroke-width="2"/></svg>`,
            paperclip: `<svg ${common}><path d="m21.4 11.6-8.5 8.5a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 1 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
            file: `<svg ${common}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" stroke="currentColor" stroke-width="2"/><path d="M14 2v6h6" stroke="currentColor" stroke-width="2"/></svg>`,
            more: `<svg ${common}><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="19" cy="12" r="1.6" fill="currentColor"/><circle cx="5" cy="12" r="1.6" fill="currentColor"/></svg>`,
            phone: `<svg ${common}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.32 1.78.6 2.63a2 2 0 0 1-.45 2.11L8 9.72a16 16 0 0 0 6.28 6.28l1.26-1.26a2 2 0 0 1 2.11-.45c.85.28 1.73.48 2.63.6A2 2 0 0 1 22 16.92Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
            video: `<svg ${common}><path d="M15 10.2 20.5 7v10L15 13.8V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3.2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
            checkcheck: `<svg ${common}><path d="M3.5 12.5 8 17l9-10" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M13 17l8-10" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
        };
        return icons[name] || '';
    }
    function renderAttachment(att, mine){
        if(!att) return '';
        const type=att.type||'file'; const name=att.name||'attachment'; const data=att.data_url||att.dataUrl||'';
        if(type==='image') return `<div class="cv-feed-msg-attachment"><img class="cv-feed-msg-attachment-image" src="${e(data)}" alt="${e(name)}"></div>`;
        if(type==='video') return `<div class="cv-feed-msg-attachment"><video class="cv-feed-msg-attachment-video" src="${e(data)}" controls></video></div>`;
        return `<div class="cv-feed-msg-attachment"><a class="cv-feed-msg-attachment-file ${mine?'is-mine':''}" href="${e(data)}" download="${e(name)}">${msgIcon('file',20)}<span>${e(name)}</span></a></div>`;
    }
    async function api(path, options={}){
        if(typeof window.cvDataRequest!=='function') throw new Error('Messaging is still connecting. Please try again.');
        const body=options.body||{};
        if(path==='/social/messages/threads' && (options.method||'GET')==='POST') return window.cvDataRequest('cv_social_send_message',body);
        if(path==='/social/messages/threads') return window.cvDataRequest('cv_social_get_message_threads',{});
        if(path.indexOf('/social/messages/threads/')===0){
            const id=decodeURIComponent(path.slice('/social/messages/threads/'.length));
            return (options.method||'GET')==='POST'
                ? window.cvDataRequest('cv_social_send_message',Object.assign({},body,{thread_id:id}))
                : window.cvDataRequest('cv_social_get_message_thread',{thread_id:id});
        }
        if(path.indexOf('/social/users/search')===0){
            const query=path.indexOf('?')>=0 ? new URLSearchParams(path.slice(path.indexOf('?')+1)).get('q')||'' : '';
            return window.cvDataRequest('cv_social_search_message_users',{search:query});
        }
        throw new Error('That messaging function is not available.');
    }
    function unread(){ return state.conversations.reduce((s,t)=>s+Number(t.unread_count||0),0); }
    function timeLabel(value){
        if(!value) return '';
        const raw = String(value);
        const parsed = new Date(raw.replace(' ', 'T'));
        if(Number.isNaN(parsed.getTime())) return raw.replace(/^[A-Za-z]+,?\s*/,'').slice(0, 16);
        const diff = Date.now() - parsed.getTime();
        const abs = Math.abs(diff);
        const minute = 60000, hour = 60 * minute, day = 24 * hour;
        if(abs < minute) return 'now';
        if(abs < hour) return Math.max(1, Math.round(abs / minute)) + 'm';
        if(abs < day) return Math.round(abs / hour) + 'h';
        if(abs < 7 * day) return Math.round(abs / day) + 'd';
        return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
    function lastActivity(thread){ return timeLabel(thread && (thread.last_message_at || thread.updated_at || thread.created_at || thread.created || thread.date)); }
    function isVisible(node){ return !!(node && (node.offsetWidth || node.offsetHeight || node.getClientRects().length)); }
    function findMount(){ const candidates=Array.from(document.querySelectorAll('#cv-nav-message-slot-desktop, #cv-nav-message-slot-mobile')); return candidates.find(isVisible) || candidates[0] || null; }
    function mountHolder(){ const mount=findMount(); if(mount && holder.parentNode!==mount) mount.appendChild(holder); if(document.body && panelPortal.parentNode!==document.body) document.body.appendChild(panelPortal); }
    function q(sel){ return (panelPortal && panelPortal.querySelector(sel)) || holder.querySelector(sel); }

    function list(){
        if(!isLoggedIn()) return `<div class="cv-feed-msg-empty"><strong>Messaging</strong><p>Please sign in to chat.</p><a class="cv-social-button" href="${e(loginUrl)}">Sign in</a></div>`;
        const search = state.searchResults.length ? `<div class="cv-feed-msg-search-results"><div class="cv-feed-msg-list-title"><span>People</span><em>${state.searchResults.length}</em></div>${state.searchResults.map(u=>`<button type="button" class="cv-feed-msg-user-result" data-cv-main-msg-user="${e(u.id)}" data-cv-main-msg-user-name="${e(u.name||'User')}">${av(u)}<span><strong>${e(u.name||'User')}</strong><small>${e(handle(u))}</small></span></button>`).join('')}</div>` : '';
        const conv = state.conversations.length ? state.conversations.map(t=>{
            const u=t.other_user||{name:'User'};
            const n=Number(t.unread_count||0);
            const when=lastActivity(t);
            const active=String(state.activeThreadId)===String(t.id);
            return `<button type="button" class="cv-feed-msg-thread ${active?'is-active':''} ${n?'has-unread':''}" data-cv-main-msg-thread="${e(t.id)}"><span class="cv-feed-msg-avatar-wrap">${av(u)}${n?'<i aria-hidden="true"></i>':''}</span><span class="cv-feed-msg-thread-main"><span class="cv-feed-msg-thread-top"><strong>${e(u.name||'User')}</strong>${when?`<small class="cv-feed-msg-time">${e(when)}</small>`:''}</span><small class="cv-feed-msg-preview">${e(t.last_message||handle(u))}</small></span>${n?`<em aria-label="${e(n)} unread messages">${n>99?'99+':n}</em>`:''}</button>`;
        }).join('') : '<div class="cv-feed-msg-empty small"><strong>No conversations yet</strong><p>Search for a member or choose New Conversation to start messaging.</p></div>';
        return `<div class="cv-feed-msg-list"><div class="cv-feed-msg-sidebar-top"><div class="cv-feed-msg-search"><span class="cv-feed-msg-search-icon">${msgIcon('search',18)}</span><input type="search" data-cv-main-msg-search placeholder="Search messages or people"></div><button type="button" class="cv-feed-msg-new" data-cv-main-msg-new>${msgIcon('plus',18)}<span>New Conversation</span></button></div>${search}<div class="cv-feed-msg-list-title"><span>Conversations</span><em>${state.conversations.length}</em></div><div class="cv-feed-msg-thread-list">${conv}</div></div>`;
    }
    function composer(){
        const preview = state.attachment ? `<div class="cv-feed-msg-attachment-preview">${msgIcon(state.attachment.type==='image'?'image':(state.attachment.type==='video'?'film':'file'),16)}<span>${e(state.attachment.name||'attachment')}</span><button type="button" data-cv-main-msg-clear-attachment aria-label="Remove attachment">${msgIcon('close',14)}</button></div>` : '';
        const err = state.error ? `<div class="cv-feed-msg-error"><button type="button" data-cv-main-msg-clear-error>${msgIcon('close',13)}</button><span>${e(state.error)}</span></div>` : '';
        return `<div class="cv-feed-msg-composer-wrap">${err}<form class="cv-feed-msg-form" data-cv-main-msg-form>${preview}<textarea rows="1" data-cv-main-msg-body placeholder="Write a message..." autocomplete="off"></textarea><div class="cv-feed-msg-composer-bar"><div class="cv-feed-msg-tools"><button type="button" class="cv-feed-msg-tool" data-cv-main-msg-attach="image" title="Attach image">${msgIcon('image',20)}</button><button type="button" class="cv-feed-msg-tool" data-cv-main-msg-attach="video" title="Attach video">${msgIcon('film',20)}</button><button type="button" class="cv-feed-msg-tool" data-cv-main-msg-attach="file" title="Attach file">${msgIcon('paperclip',20)}</button></div><button type="submit" class="cv-feed-msg-send is-disabled ${state.sending?'is-sending':''}" aria-label="Send message">${state.sending?'Sending…':'Send'}</button></div><input hidden type="file" accept="image/*" data-cv-main-msg-file-input="image"><input hidden type="file" accept="video/*" data-cv-main-msg-file-input="video"><input hidden type="file" data-cv-main-msg-file-input="file"></form></div>`;
    }
    function chat(){
        if(!state.activeThreadId&&!state.activeUser) return `<div class="cv-feed-msg-welcome"><div class="cv-feed-msg-welcome-icon cv-linkedin-empty-bubble">${msgIcon('message',56)}</div><strong>Welcome to Messaging</strong><p>Choose a conversation, search for a member, or start a new chat in a cleaner professional workspace.</p><div class="cv-feed-msg-welcome-points"><span>${msgIcon('message',16)} Direct chat</span><span>${msgIcon('image',16)} Photo sharing</span><span>${msgIcon('film',16)} Video sharing</span><span>${msgIcon('file',16)} File sharing</span></div></div>`;
        const u=state.activeUser||{name:'Chat'};
        const bubbles=state.messages.length?state.messages.map(m=>`<div class="cv-feed-msg-row ${m.mine?'mine':'theirs'}"><div class="cv-feed-msg-bubble ${m.mine?'mine':'theirs'}">${renderAttachment(m.attachment,m.mine)}${m.body?`<p dir="auto">${e(m.body||'')}</p>`:''}<small><span>${e(timeLabel(m.created_at)||m.created_at||'')}</span>${m.mine?`<span class="cv-feed-msg-checks">${msgIcon('checkcheck',14)}</span>`:''}</small></div></div>`).join(''):`<div class="cv-feed-msg-empty small cv-feed-msg-start"><span class="cv-feed-msg-start-icon">${msgIcon('message',32)}</span><strong>No messages yet</strong><p>Say hello and start the conversation.</p></div>`;
        return `<div class="cv-feed-msg-chat"><div class="cv-feed-msg-chat-head"><button type="button" data-cv-main-msg-back class="cv-feed-msg-back" aria-label="Back to conversations">${msgIcon('back',18)}</button>${av(u)}<div class="cv-feed-msg-chat-title"><strong>${e(u.name||'Chat')}</strong><small>${e(handle(u))} · Direct message</small></div><div class="cv-feed-msg-chat-actions"><button type="button" class="cv-feed-msg-chat-action" data-cv-msg-focus-search title="Search people">${msgIcon('search',20)}</button><button type="button" class="cv-feed-msg-chat-action cv-feed-msg-phone-action" data-cv-main-msg-call="audio" title="Voice call">${msgIcon('phone',20)}</button><button type="button" class="cv-feed-msg-chat-action cv-feed-msg-video-action" data-cv-main-msg-call="video" title="Video call">${msgIcon('video',20)}</button></div></div><div class="cv-feed-msg-bubbles" data-cv-main-msg-bubbles role="log" aria-live="polite" aria-relevant="additions text">${bubbles}</div>${composer()}<p class="cv-feed-msg-hint">Press Enter to send. Use Shift + Enter for a new line.</p></div>`;
    }
    function syncComposerHeight(scope){
        const target = scope && scope.querySelector ? scope.querySelector("[data-cv-main-msg-body]") : q("[data-cv-main-msg-body]");
        if(!target) return;
        target.style.height = 'auto';
        const next = Math.max(44, Math.min(target.scrollHeight || 44, 138));
        target.style.height = next + 'px';
    }
    function focusMessengerPrimaryField(){
        const body = q("[data-cv-main-msg-body]");
        if(body){ body.focus(); syncComposerHeight(document); return; }
        const search = q("[data-cv-main-msg-search]");
        if(search) search.focus();
    }
    function render(){ mountHolder(); const n=unread(); const badge=n?`<em>${n>99?'99+':n}</em>`:''; const hasActiveChat=!!(state.activeThreadId||state.activeUser); holder.innerHTML=`<button type="button" class="cv-feed-messenger-button cv-nav-clean-item" data-cv-main-msg-toggle aria-label="Messages" aria-expanded="${state.open?'true':'false'}" title="Messages"><span class="cv-feed-nav-action-icon cv-feed-nav-action-icon-message" aria-hidden="true">${msgIcon('message',20)}</span><span class="cv-feed-nav-action-label">Messaging</span>${badge}</button>`; panelPortal.innerHTML=`<div class="cv-feed-msg-backdrop ${state.open?'is-open':''}" data-cv-main-msg-backdrop></div><section class="cv-feed-messenger-panel cv-linkedin-chat-panel cv-react-exact-ui ${state.open?'is-open':''} ${hasActiveChat?'cv-chat-active':''}" aria-label="Messaging" role="dialog" aria-modal="true"><header class="cv-feed-msg-header"><div><strong>Messaging</strong><small>Professional, secure conversations</small></div><button type="button" data-cv-main-msg-close aria-label="Close messaging">${msgIcon('close',22)}</button></header><div class="cv-feed-msg-body">${list()}${chat()}</div></section>`; holder.classList.toggle('is-open', !!state.open); panelPortal.classList.toggle('is-open', !!state.open); const b=q('[data-cv-main-msg-bubbles]'); if(b) b.scrollTop=b.scrollHeight; syncComposerHeight(document); updateSendState(); if(state.open) setTimeout(focusMessengerPrimaryField, 0); }

    async function load(){ if(!isLoggedIn()) return; const d=await api('/social/messages/threads'); state.conversations=d.items||[]; render(); }
    async function openThread(id){ state.activeThreadId=id; state.activeUser=null; state.messages=[]; state.attachment=null; render(); const d=await api(`/social/messages/threads/${id}`); state.messages=d.items||[]; state.activeUser=d.other_user||null; await load(); state.activeThreadId=id; render(); }
    async function search(searchTerm){ const term=(searchTerm||'').trim(); const d=await api('/social/users/search?q='+encodeURIComponent(term)); state.searchResults=d.items||[]; render(); const input=q('[data-cv-main-msg-search]'); if(input){input.value=term;input.focus();} }
    function cleanAttachment(att){ if(!att) return null; return { type:att.type||'file', name:att.name||'attachment', data_url:att.dataUrl||att.data_url||'' }; }
    async function send(body, attachment){ const text=(body||'').trim(); const file=cleanAttachment(attachment); if(!text&&!file) return; const payload={body:text}; if(file) payload.attachment=file; if(state.activeThreadId){ await api(`/social/messages/threads/${state.activeThreadId}`,{method:'POST',body:payload}); await openThread(state.activeThreadId); } else if(state.activeUser&&state.activeUser.id){ payload.recipient_id=state.activeUser.id; const d=await api('/social/messages/threads',{method:'POST',body:payload}); await openThread(d.thread_id); } }
    function showError(msg){ state.error=msg||'Attachment failed.'; render(); }
    function showCallNotice(){ if(typeof window.showToast==='function') window.showToast('Voice and video calls need a real-time calling server. Messaging is connected and ready.', 'info'); else showError('Voice and video calls need a real-time calling server. Messaging is connected and ready.'); }
    function fileSelected(input,type){ const file=input.files&&input.files[0]; if(!file) return; if(file.size>500*1024){ input.value=''; showError('File too large. Max 500KB allowed.'); return; } const reader=new FileReader(); reader.onload=function(ev){ state.attachment={type:type||'file', name:file.name, dataUrl:ev.target.result}; state.error=''; render(); }; reader.onerror=function(){ showError('Could not read this file.'); }; reader.readAsDataURL(file); input.value=''; }

    window.cvOpenFaithInChat = function(userOrId, name){ if(!isLoggedIn()){ if(typeof window.showToast==='function') window.showToast('Please sign in to message members.', 'info'); return; } const user = (typeof userOrId === 'object' && userOrId) ? userOrId : { id: Number(userOrId || 0), name: name || 'User' }; if(!user.id){ if(typeof window.showToast==='function') window.showToast('User not found.', 'error'); return; } state.open = true; state.activeThreadId = null; state.activeUser = user; state.messages = []; state.searchResults = []; state.attachment=null; render(); load().catch(()=>{}); };
    window.cvOpenFaithInMessageThread = function(threadId){ if(!threadId) return; state.open=true; render(); openThread(threadId).catch(err=>showError(err.message||'Could not open that conversation.')); };

    const observer = new MutationObserver(function(){ mountHolder(); }); observer.observe(wrap, { childList:true, subtree:true }); window.addEventListener('resize', mountHolder);
    let timer=null;
    function updateSendState(){ const input=q('[data-cv-main-msg-body]'); const sendBtn=q('.cv-feed-msg-send'); const disabled = !!state.sending || !((input&&input.value.trim())||state.attachment); if(sendBtn){ sendBtn.classList.toggle('is-disabled', disabled); sendBtn.disabled = disabled; } }
    const handleMessengerInput = ev=>{ if(ev.target.matches('[data-cv-main-msg-search]')){ const qv=ev.target.value; clearTimeout(timer); timer=setTimeout(()=>search(qv).catch(()=>{}),250); return; } if(ev.target.matches('[data-cv-main-msg-body]')){ syncComposerHeight(document); updateSendState(); return; } if(ev.target.matches('[data-cv-main-msg-file-input]')) fileSelected(ev.target, ev.target.dataset.cvMainMsgFileInput||'file'); };
    holder.addEventListener('input', handleMessengerInput);
    panelPortal.addEventListener('input', handleMessengerInput);
    const handleMessengerClick = ev=>{ ev.stopPropagation(); if(ev.target.closest('[data-cv-main-msg-backdrop]')){ state.open=false; render(); return; } if(ev.target.closest('[data-cv-main-msg-toggle]')){ state.open=!state.open; render(); if(state.open) load().catch(()=>{}); return; } if(ev.target.closest('[data-cv-main-msg-close]')){ state.open=false; render(); return; } if(ev.target.closest('[data-cv-msg-focus-search]')){ const input=q('[data-cv-main-msg-search]'); if(input){ input.focus(); input.select && input.select(); } return; } if(ev.target.closest('[data-cv-main-msg-new]')){ const input=q('[data-cv-main-msg-search]'); if(input){ input.focus(); input.select && input.select(); } search('').catch(()=>{}); return; } if(ev.target.closest('[data-cv-main-msg-back]')){ state.activeThreadId=null; state.activeUser=null; state.messages=[]; state.attachment=null; render(); return; } if(ev.target.closest('[data-cv-main-msg-clear-attachment]')){ state.attachment=null; render(); return; } if(ev.target.closest('[data-cv-main-msg-clear-error]')){ state.error=''; render(); return; } if(ev.target.closest('[data-cv-main-msg-call]')){ showCallNotice(); return; } const attach=ev.target.closest('[data-cv-main-msg-attach]'); if(attach){ const input=q(`[data-cv-main-msg-file-input="${attach.dataset.cvMainMsgAttach}"]`); if(input) input.click(); return; } const th=ev.target.closest('[data-cv-main-msg-thread]'); if(th){ openThread(th.dataset.cvMainMsgThread).catch(()=>{}); return; } const ub=ev.target.closest('[data-cv-main-msg-user]'); if(ub){ const found=state.searchResults.find(u=>String(u.id)===String(ub.dataset.cvMainMsgUser)); state.activeThreadId=null; state.activeUser=found||{id:Number(ub.dataset.cvMainMsgUser),name:ub.dataset.cvMainMsgUserName||'User'}; state.messages=[]; state.searchResults=[]; state.attachment=null; render(); return; } };
    holder.addEventListener('click', handleMessengerClick);
    panelPortal.addEventListener('click', handleMessengerClick);
    const handleMessengerKeydown = ev=>{ if(ev.key==='Escape' && state.open){ state.open=false; render(); return; } if(!ev.target.matches('[data-cv-main-msg-body]')) return; if(ev.key==='Enter' && !ev.shiftKey){ ev.preventDefault(); const form=ev.target.closest('[data-cv-main-msg-form]'); if(form) form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit', {cancelable:true, bubbles:true})); } };
    holder.addEventListener('keydown', handleMessengerKeydown);
    panelPortal.addEventListener('keydown', handleMessengerKeydown);
    const handleMessengerSubmit = ev=>{ if(!ev.target.matches('[data-cv-main-msg-form]')) return; ev.preventDefault(); if(state.sending) return; const input=q('[data-cv-main-msg-body]'); const value=input?input.value:''; const attachment=state.attachment; if(!value.trim()&&!attachment) return; state.sending=true; updateSendState(); send(value, attachment).then(()=>{ state.sending=false; state.attachment=null; state.error=''; render(); }).catch(err=>{ state.sending=false; showError(err.message||'Could not send message.'); const fresh=q('[data-cv-main-msg-body]'); if(fresh){ fresh.value=value; fresh.focus(); syncComposerHeight(document); updateSendState(); } }); };
    holder.addEventListener('submit', handleMessengerSubmit);
    panelPortal.addEventListener('submit', handleMessengerSubmit);
    document.addEventListener('click', ev=>{ if(!state.open) return; if(holder.contains(ev.target)||panelPortal.contains(ev.target)) return; state.open=false; render(); });
    document.addEventListener('keydown', ev=>{ if(ev.key==='Escape' && state.open){ state.open=false; render(); } });
    render(); load().catch(()=>{});
    // POLLING (v5.5.190): skip the network call when the tab is hidden or the
    // user isn't logged in. Avoids running every 30s in background tabs.
    setInterval(function(){
        if (typeof document !== 'undefined' && document.hidden) return;
        if (!isLoggedIn()) return;
        load().catch(()=>{});
    }, 30000);
}());

/* Social feed all-notifications integrated into the main nav */
(function () {
    'use strict';
    if (window.__cvMainFeedNotificationsReady) return;
    window.__cvMainFeedNotificationsReady = true;
    if (typeof cv_ajax === 'undefined' || !cv_ajax.rest_root) return;

    const wrap = document.querySelector('.curated-vault-premium-wrap');
    if (!wrap) return;

    function isLoggedIn(){ return !!(cv_ajax.auth && cv_ajax.auth.is_logged_in); }
    const holder = document.createElement('div');
    holder.className = 'cv-main-feed-notifications-holder';

    const state = { open:false, unread:0, messageUnread:0, total:0, items:[], filter:'all', firstPoll:true };

    function e(v){ return String(v||'').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c])); }
    function isVisible(node){ return !!(node && (node.offsetWidth || node.offsetHeight || node.getClientRects().length)); }
    function findMount(){ const candidates=Array.from(document.querySelectorAll('#cv-nav-notification-slot-desktop, #cv-nav-notification-slot-mobile')); return candidates.find(isVisible) || candidates[0] || null; }
    function mountHolder(){ const mount=findMount(); if(!mount) return; if(holder.parentNode!==mount) mount.appendChild(holder); }
    async function api(path, options={}){
        if(typeof window.cvDataRequest!=='function') throw new Error('Notifications are still connecting. Please try again.');
        if(path==='/social/notifications/count') return window.cvDataRequest('cv_social_get_notification_count',{});
        if(path==='/social/notifications') return window.cvDataRequest('cv_social_get_notifications',{});
        if(path==='/social/notifications/read') return window.cvDataRequest('cv_social_mark_notifications_read',options.body||{});
        throw new Error('That notification function is not available.');
    }
    function normalizeType(type){
        const raw=String(type||'').toLowerCase();
        if(raw==='reaction'||raw==='like'||raw==='love'||raw==='support'||raw==='celebrate') return 'reaction';
        if(raw==='new_post'||raw==='post') return 'new_post';
        if(raw==='comment') return 'comment';
        if(raw==='reply') return 'reply';
        if(raw==='follow') return 'follow';
        if(raw==='message') return 'message';
        return raw || 'bell';
    }
    function badgeClass(type){ return ({reaction:'like',comment:'comment',reply:'reply',follow:'follow',message:'message',new_post:'post'})[normalizeType(type)] || 'bell'; }
    function badgeIcon(type){
        const icons={
            reaction:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.2-4.35-9.45-9.2C.9 8.25 3.28 4.5 7.05 4.5c2.02 0 3.42 1.05 4.17 2.02C11.97 5.55 13.37 4.5 15.4 4.5c3.77 0 6.15 3.75 4.5 7.3C17.65 16.65 12 21 12 21Z" fill="currentColor"/></svg>',
            comment:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 5.75A3.75 3.75 0 0 1 8.25 2h7.5A3.75 3.75 0 0 1 19.5 5.75v5.5A3.75 3.75 0 0 1 15.75 15H11l-4.45 3.25A.95.95 0 0 1 5 17.48V15.1a3.75 3.75 0 0 1-.5-1.85v-7.5Z" fill="currentColor"/></svg>',
            reply:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.2 6.1a1 1 0 0 1 0 1.4L7.7 10H14a6 6 0 0 1 6 6v1a1 1 0 1 1-2 0v-1a4 4 0 0 0-4-4H7.7l2.5 2.5a1 1 0 0 1-1.4 1.4l-4.2-4.2a1 1 0 0 1 0-1.4l4.2-4.2a1 1 0 0 1 1.4 0Z" fill="currentColor"/></svg>',
            follow:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2C5.9 13 3 15.02 3 17.5V19a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-1.5C16 15.02 13.1 13 9.5 13Zm9-6a1 1 0 0 1 1 1v2h2a1 1 0 1 1 0 2h-2v2a1 1 0 1 1-2 0v-2h-2a1 1 0 1 1 0-2h2V8a1 1 0 0 1 1-1Z" fill="currentColor"/></svg>',
            message:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v7A2.5 2.5 0 0 1 17.5 15H10l-4.3 3.25A1.05 1.05 0 0 1 4 17.42V5.5Z" fill="currentColor"/></svg>',
            new_post:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4.5A2.5 2.5 0 0 1 7.5 2h9A2.5 2.5 0 0 1 19 4.5v15.02a.9.9 0 0 1-1.4.75L12 16.55l-5.6 3.72A.9.9 0 0 1 5 19.52V4.5Z" fill="currentColor"/></svg>',
            bell:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a4.75 4.75 0 0 0-4.75 4.75v1.17c0 .7-.22 1.38-.63 1.95L5.2 12.82A2.5 2.5 0 0 0 7.22 16.8h9.56a2.5 2.5 0 0 0 2.02-3.98l-1.42-1.95a3.35 3.35 0 0 1-.63-1.95V7.75A4.75 4.75 0 0 0 12 3Zm-2.25 15.05a2.25 2.25 0 0 0 4.5 0h-4.5Z" fill="currentColor"/></svg>'
        };
        return icons[normalizeType(type)] || icons.bell;
    }
    function actor(item){ return (item.actor&&item.actor.name) || item.actor_name || item.user_name || item.title || 'Someone'; }
    function avatar(item){ const person=item.actor||{}; const name=actor(item); return person.avatar_url ? `<img class="cv-feed-notification-avatar-img" src="${e(person.avatar_url)}" alt="${e(name)}">` : `<span class="cv-feed-notification-avatar-fallback">${e(name.charAt(0).toUpperCase())}</span>`; }
    function label(item){ if(item.message) return item.message; return ({reaction:'reacted to your post',comment:'commented on your post',reply:'replied to your comment',follow:'started following you',message:'sent you a message',new_post:'shared a new post'})[normalizeType(item.type)] || 'sent you a notification'; }
    function relativeTime(value){
        if(!value) return '';
        const iso=String(value).replace(' ', 'T');
        const t=new Date(iso).getTime();
        if(!t) return e(value);
        const diff=Math.max(0, Date.now()-t);
        const min=Math.floor(diff/60000);
        if(min<1) return 'Just now';
        if(min<60) return min+'m ago';
        const hrs=Math.floor(min/60);
        if(hrs<24) return hrs+'h ago';
        const days=Math.floor(hrs/24);
        if(days<7) return days+'d ago';
        return new Date(t).toLocaleDateString(undefined,{month:'short',day:'numeric'});
    }
    function meta(item){ const pieces=[]; if(item.created_at) pieces.push(relativeTime(item.created_at)); if(item.object_type) pieces.push(e(item.object_type.charAt(0).toUpperCase()+item.object_type.slice(1))); return pieces.join(' · '); }
    function filteredItems(){
        if(state.filter==='unread') return state.items.filter(item=>!Number(item.is_read||0));
        if(state.filter==='messages') return state.items.filter(item=>normalizeType(item.type)==='message');
        if(state.filter==='activity') return state.items.filter(item=>normalizeType(item.type)!=='message');
        return state.items;
    }
    function tab(name,labelText){ return `<button type="button" class="cv-feed-notification-tab ${state.filter===name?'is-active':''}" data-cv-main-notification-filter="${name}">${labelText}</button>`; }
    function renderItem(item){
        const unread=!Number(item.is_read||0);
        const type=normalizeType(item.type);
        return `<button type="button" class="cv-feed-notification-item ${unread?'is-new':''}" data-cv-main-notification-item="${e(item.id||'')}" data-cv-main-notification-type="${e(type)}" data-cv-main-notification-object="${e(item.object_id||'')}" data-cv-main-notification-object-type="${e(item.object_type||'')}"><div class="cv-feed-notification-avatar">${avatar(item)}<span class="cv-feed-notification-badge is-${badgeClass(type)}">${badgeIcon(type)}</span></div><div class="cv-feed-notification-copy"><p><strong>${e(actor(item))}</strong> ${e(label(item))}</p><small>${meta(item)}</small></div>${unread?'<span class="cv-feed-notification-dot" aria-label="Unread"></span>':''}</button>`;
    }
    function render(){
        mountHolder();
        const count=Number(state.total||0);
        const badge=count?`<em>${count>99?'99+':count}</em>`:'';
        const visibleItems=filteredItems();
        const empty=state.filter==='messages'?'No message notifications yet.':(state.filter==='activity'?'No activity notifications yet.':(state.filter==='unread'?'No unread notifications.':'No notifications yet.'));
        const items=visibleItems.length?visibleItems.map(renderItem).join(''):`<div class="cv-feed-notification-empty"><strong>${empty}</strong><span>You are all caught up.</span></div>`;
        holder.innerHTML=`<button type="button" class="cv-feed-notifications-button cv-nav-clean-item" data-cv-main-notification-toggle aria-label="Notifications" aria-expanded="${state.open?'true':'false'}" title="Notifications"><span class="cv-feed-nav-action-icon cv-feed-nav-action-icon-bell" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3.25a4.5 4.5 0 0 0-4.5 4.5v1.03c0 .74-.24 1.46-.68 2.05L5.4 12.7a2.25 2.25 0 0 0 1.8 3.55h9.6a2.25 2.25 0 0 0 1.8-3.55l-1.42-1.87a3.42 3.42 0 0 1-.68-2.05V7.75a4.5 4.5 0 0 0-4.5-4.5Z" fill="currentColor"/><path d="M9.75 18.25a2.25 2.25 0 0 0 4.5 0h-4.5Z" fill="currentColor"/></svg></span><span class="cv-feed-nav-action-label">Notifications</span>${badge}</button><section class="cv-feed-notifications-panel ${state.open?'is-open':''}" role="dialog" aria-label="Notifications"><header class="cv-feed-notification-fb-header"><div><strong>Notifications</strong><small>${count?count+' unread update'+(count===1?'':'s'):'You are up to date'}</small></div><button type="button" data-cv-main-notification-close aria-label="Close notifications">×</button></header><div class="cv-feed-notification-tabs">${tab('all','All')}${tab('unread','Unread')}${tab('messages','Messages')}${tab('activity','Activity')}<button type="button" class="cv-feed-notification-read" data-cv-main-notification-read>Mark all read</button></div><div class="cv-feed-notifications-list">${items}</div></section>`;
    }
    function toast(message){ if(typeof window.showToast==='function'){ window.showToast(message, 'info'); return; } const node=document.createElement('div'); node.className='cv-feed-notification-toast'; node.textContent=message; document.body.appendChild(node); requestAnimationFrame(()=>node.classList.add('is-visible')); setTimeout(()=>{ node.classList.remove('is-visible'); setTimeout(()=>node.remove(),240); },2600); }
    async function poll(){ if(!isLoggedIn()) return; const previous=state.total; const data=await api('/social/notifications/count'); state.unread=Number(data.unread_count||0); state.messageUnread=Number(data.message_unread_count||0); state.total=Number(data.total_unread_count||(state.unread+state.messageUnread)); if(!state.firstPoll&&state.total>previous) toast(state.total-previous===1?'You have a new notification.':'You have new notifications.'); state.firstPoll=false; render(); }
    async function loadNotifications(markAsRead){ if(!isLoggedIn()) return; const data=await api('/social/notifications'); state.items=data.items||[]; state.unread=Number(data.unread_count||0); state.messageUnread=Number(data.message_unread_count||0); state.total=Number(data.total_unread_count||(state.unread+state.messageUnread)); render(); if(markAsRead&&state.items.length){ await api('/social/notifications/read',{method:'POST',body:{}}); state.unread=0; state.total=state.messageUnread; state.items=state.items.map(item=>Object.assign({},item,{is_read:1})); render(); } }
    async function markOneRead(id){ if(!id) return; const item=state.items.find(row=>String(row.id)===String(id)); if(item&&!Number(item.is_read||0)){ item.is_read=1; if(normalizeType(item.type)!=='message') state.unread=Math.max(0, Number(state.unread||0)-1); state.total=Math.max(0, Number(state.unread||0)+Number(state.messageUnread||0)); render(); } await api('/social/notifications/read',{method:'POST',body:{id:String(id)}}).catch(()=>{}); }
    function openPost(objectId){ const post=document.querySelector(`.cv-reaction-wrap[data-post-id="${window.CSS && CSS.escape ? CSS.escape(String(objectId)) : String(objectId).replace(/[^a-zA-Z0-9_-]/g,'\\$&')}"]`) || document.querySelector(`[data-post-id="${window.CSS && CSS.escape ? CSS.escape(String(objectId)) : String(objectId).replace(/[^a-zA-Z0-9_-]/g,'\\$&')}"]`); if(post){ post.scrollIntoView({behavior:'smooth',block:'center'}); const card=post.closest('article, .cv-card, .cv-social-card') || post; card.classList.add('cv-feed-notification-target'); setTimeout(()=>card.classList.remove('cv-feed-notification-target'),1800); } }
    const observer=new MutationObserver(function(){ mountHolder(); });
    observer.observe(wrap,{childList:true,subtree:true});
    window.addEventListener('resize',mountHolder);
    holder.addEventListener('click',function(ev){ ev.stopPropagation(); if(ev.target.closest('[data-cv-main-notification-toggle]')){ state.open=!state.open; render(); if(state.open) loadNotifications(false).catch(()=>{}); return; } const filter=ev.target.closest('[data-cv-main-notification-filter]'); if(filter){ state.filter=filter.dataset.cvMainNotificationFilter||'all'; render(); return; } if(ev.target.closest('[data-cv-main-notification-read]')){ loadNotifications(true).catch(()=>{}); return; } if(ev.target.closest('[data-cv-main-notification-close]')){ state.open=false; render(); return; } const item=ev.target.closest('[data-cv-main-notification-item]'); if(item){ const id=item.dataset.cvMainNotificationItem||''; const type=item.dataset.cvMainNotificationType||''; const objectId=item.dataset.cvMainNotificationObject||''; markOneRead(id).catch(()=>{}); if(type==='message'&&objectId&&typeof window.cvOpenFaithInMessageThread==='function'){ state.open=false; render(); window.cvOpenFaithInMessageThread(objectId); } else if(objectId&&(type==='reaction'||type==='comment'||type==='reply'||type==='new_post')){ state.open=false; render(); openPost(objectId); } } });
    document.addEventListener('click',function(ev){ if(!state.open) return; if(holder.contains(ev.target)) return; state.open=false; render(); });
    document.addEventListener('keydown',function(ev){ if(ev.key==='Escape'&&state.open){ state.open=false; render(); } });
    render();
    poll().catch(()=>{});
    // POLLING (v5.5.190): skip the poll when the tab is hidden. The IIFE
    // already bails for non-logged-in users at the top, so isLoggedIn is true
    // here.
    setInterval(function(){
        if (typeof document !== 'undefined' && document.hidden) return;
        poll().catch(()=>{});
    }, 20000);
}());

/* v5.5.61 reaction popup unclipped positioning + no page reload guard */
(function(){
  function esc(value){
    if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(String(value));
    return String(value).replace(/[^a-zA-Z0-9_-]/g, '\\$&');
  }
  function wrapFor(id){ return document.querySelector('.cv-reaction-wrap[data-post-id="' + esc(id) + '"]'); }
  function positionPicker(id){
    var wrap = wrapFor(id);
    if (!wrap) return;
    var picker = wrap.querySelector('[data-cv-reaction-picker], .cv-reaction-picker');
    if (!picker) return;
    picker.style.setProperty('--cv-reaction-drag-x', '0px');
    picker.style.setProperty('--cv-reaction-drag-y', '0px');
    var rect = wrap.getBoundingClientRect();
    var pickerWidth = Math.max(picker.scrollWidth || 0, picker.offsetWidth || 0, 300);
    var pickerHeight = Math.max(picker.scrollHeight || 0, picker.offsetHeight || 0, 56);
    var margin = 12;
    var left = rect.left + rect.width / 2;
    left = Math.max(margin + pickerWidth / 2, Math.min(window.innerWidth - margin - pickerWidth / 2, left));
    var top = rect.top - pickerHeight - 10;
    if (top < margin) top = rect.bottom + 10;
    top = Math.max(margin, Math.min(window.innerHeight - margin - pickerHeight, top));
    picker.style.setProperty('--cv-reaction-left', left + 'px');
    picker.style.setProperty('--cv-reaction-top', top + 'px');
  }
  var oldOpen = window.cvOpenReactionPicker;
  window.cvOpenReactionPicker = function(id){
    if (typeof oldOpen === 'function') oldOpen(id);
    var wrap = wrapFor(id);
    if (wrap) wrap.classList.add('is-open');
    requestAnimationFrame(function(){ positionPicker(id); });
    setTimeout(function(){ positionPicker(id); }, 80);
  };
  document.addEventListener('click', function(event){
    var option = event.target && event.target.closest && event.target.closest('.cv-reaction-option');
    if (!option) return;
    event.preventDefault();
    event.stopPropagation();
    var wrap = option.closest('.cv-reaction-wrap');
    var postId = wrap && wrap.getAttribute('data-post-id');
    var reaction = option.getAttribute('data-cv-reaction-choice') || option.dataset.cvReactionChoice || 'like';
    if (postId && typeof window.cvSetPostReaction === 'function') window.cvSetPostReaction(event, postId, reaction);
  }, true);
  window.addEventListener('resize', function(){
    document.querySelectorAll('.cv-reaction-wrap.is-open').forEach(function(wrap){ positionPicker(wrap.getAttribute('data-post-id')); });
  }, { passive: true });
  window.addEventListener('scroll', function(){
    document.querySelectorAll('.cv-reaction-wrap.is-open').forEach(function(wrap){ positionPicker(wrap.getAttribute('data-post-id')); });
  }, { passive: true, capture: true });
}());

/* v5.5.61 reaction popup centered above reaction button - final guard */
(function(){
  function esc(value){
    if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(String(value));
    return String(value).replace(/[^a-zA-Z0-9_-]/g, '\\$&');
  }
  function wrapFor(id){ return document.querySelector('.cv-reaction-wrap[data-post-id="' + esc(id) + '"]'); }
  var oldOpen = window.cvOpenReactionPicker;
  window.cvOpenReactionPicker = function(id){
    if (typeof oldOpen === 'function') oldOpen(id);
    var wrap = wrapFor(id);
    if (wrap) {
      wrap.classList.add('is-open');
      var picker = wrap.querySelector('[data-cv-reaction-picker], .cv-reaction-picker');
      if (picker) {
        picker.style.removeProperty('--cv-reaction-left');
        picker.style.removeProperty('--cv-reaction-top');
        picker.style.setProperty('--cv-reaction-drag-x', '0px');
        picker.style.setProperty('--cv-reaction-drag-y', '0px');
      }
    }
  };
  document.addEventListener('click', function(event){
    var option = event.target && event.target.closest && event.target.closest('.cv-reaction-option');
    if (!option) return;
    event.preventDefault();
    event.stopPropagation();
    var wrap = option.closest('.cv-reaction-wrap');
    var postId = wrap && wrap.getAttribute('data-post-id');
    var reaction = option.getAttribute('data-cv-reaction-choice') || option.dataset.cvReactionChoice || 'like';
    if (postId && typeof window.cvSetPostReaction === 'function') {
      window.cvSetPostReaction(event, postId, reaction);
    }
  }, true);
}());


/* v5.5.151 - Mobile no-space header watchdog.
   On iOS/Android the header should be in normal flow at the very top. This avoids
   the large blank strip caused when theme wrappers add padding before a fixed nav. */
(function () {
    function cvIsMobileNoSpace() {
        return !!(window.matchMedia && window.matchMedia('(max-width: 900px), (hover: none) and (pointer: coarse)').matches);
    }
    function cvApplyMobileNoSpace() {
        if (!cvIsMobileNoSpace() || !document.body) { return; }
        var html = document.documentElement;
        var body = document.body;
        html.classList.add('cv-faith-in-app-page', 'cv-mobile-no-top-gap');
        body.classList.add('cv-faith-in-platform', 'cv-mobile-no-top-gap');
        [html, body].forEach(function (node) {
            node.style.setProperty('margin', '0', 'important');
            node.style.setProperty('margin-top', '0', 'important');
            node.style.setProperty('padding', '0', 'important');
            node.style.setProperty('padding-top', '0', 'important');
            node.style.setProperty('top', '0', 'important');
            node.style.setProperty('overflow-x', 'hidden', 'important');
        });
        document.querySelectorAll('#wpadminbar, .cv-faith-in-kill-space, .cv-theme-chrome-hidden, .cv-theme-top-spacer-hidden').forEach(function (el) {
            el.style.setProperty('display', 'none', 'important');
            el.style.setProperty('visibility', 'hidden', 'important');
            el.style.setProperty('height', '0', 'important');
            el.style.setProperty('min-height', '0', 'important');
            el.style.setProperty('max-height', '0', 'important');
            el.style.setProperty('margin', '0', 'important');
            el.style.setProperty('padding', '0', 'important');
            el.style.setProperty('border', '0', 'important');
            el.style.setProperty('overflow', 'hidden', 'important');
        });
        document.querySelectorAll('.curated-vault-premium-wrap, #cv-root, #cv-social-mvp').forEach(function (node) {
            node.style.setProperty('margin', '0', 'important');
            node.style.setProperty('margin-top', '0', 'important');
            node.style.setProperty('padding-top', '0', 'important');
            node.style.setProperty('top', '0', 'important');
            node.style.setProperty('transform', 'none', 'important');
            node.style.setProperty('width', '100%', 'important');
            node.style.setProperty('max-width', 'none', 'important');
        });
        document.querySelectorAll('#cv-react-global-nav, [data-cv-global-nav="1"], .cv-react-global-nav, .glass-nav.cv-fixed-clean-nav, .cv-fixed-clean-nav').forEach(function (nav) {
            nav.style.setProperty('position', 'sticky', 'important');
            nav.style.setProperty('top', '0', 'important');
            nav.style.setProperty('inset', '0 0 auto 0', 'important');
            nav.style.setProperty('left', '0', 'important');
            nav.style.setProperty('right', '0', 'important');
            nav.style.setProperty('width', '100%', 'important');
            nav.style.setProperty('max-width', '100vw', 'important');
            nav.style.setProperty('height', 'auto', 'important');
            nav.style.setProperty('min-height', '0', 'important');
            nav.style.setProperty('max-height', 'none', 'important');
            nav.style.setProperty('margin', '0', 'important');
            nav.style.setProperty('margin-top', '0', 'important');
            nav.style.setProperty('padding', '0', 'important');
            nav.style.setProperty('padding-top', '0', 'important');
            nav.style.setProperty('transform', 'none', 'important');
            nav.style.setProperty('translate', 'none', 'important');
            nav.style.setProperty('background', '#ffffff', 'important');
            nav.style.setProperty('z-index', '2147483000', 'important');
            nav.style.setProperty('overflow', 'visible', 'important');
        });
        document.querySelectorAll('#cv-react-global-nav .cv-nav-shell, [data-cv-global-nav="1"] .cv-nav-shell, .cv-react-global-nav .cv-nav-shell, .cv-fixed-clean-nav .cv-nav-shell, #cv-root .cv-react-nav-shell').forEach(function (shell) {
            shell.style.setProperty('display', 'none', 'important');
            shell.style.setProperty('height', '0', 'important');
            shell.style.setProperty('min-height', '0', 'important');
            shell.style.setProperty('max-height', '0', 'important');
            shell.style.setProperty('padding', '0', 'important');
            shell.style.setProperty('margin', '0', 'important');
            shell.style.setProperty('overflow', 'hidden', 'important');
        });
        document.querySelectorAll('#cv-react-global-nav .cv-react-mobile-top, [data-cv-global-nav="1"] .cv-react-mobile-top, .cv-react-global-nav .cv-react-mobile-top, .cv-fixed-clean-nav .cv-react-mobile-top, #cv-root .cv-react-mobile-top, .cv-nav-mobile-wrap').forEach(function (rowWrap) {
            rowWrap.style.setProperty('display', 'block', 'important');
            rowWrap.style.setProperty('margin', '0', 'important');
            rowWrap.style.setProperty('padding', '0', 'important');
            rowWrap.style.setProperty('border-top', '0', 'important');
            rowWrap.style.setProperty('background', '#ffffff', 'important');
            rowWrap.style.setProperty('overflow', 'visible', 'important');
            rowWrap.style.setProperty('position', 'relative', 'important');
            rowWrap.style.setProperty('z-index', '2147483001', 'important');
        });
        document.querySelectorAll('.cv-nav-mobile-row, .cv-top-icon-nav-mobile').forEach(function (row) {
            row.style.setProperty('min-height', '64px', 'important');
            row.style.setProperty('padding', '0 14px', 'important');
            row.style.setProperty('margin', '0', 'important');
            row.style.setProperty('align-items', 'center', 'important');
            row.style.setProperty('overflow', 'visible', 'important');
            row.style.setProperty('position', 'relative', 'important');
            row.style.setProperty('z-index', '2147483002', 'important');
        });
        document.querySelectorAll('#cv-root .cv-nav-mobile-row .cv-feed-messenger-button, #cv-root .cv-nav-mobile-row .cv-feed-notifications-button, #cv-social-mvp .cv-nav-mobile-row .cv-feed-messenger-button, #cv-social-mvp .cv-nav-mobile-row .cv-feed-notifications-button, .curated-vault-premium-wrap .cv-nav-mobile-row .cv-feed-messenger-button, .curated-vault-premium-wrap .cv-nav-mobile-row .cv-feed-notifications-button').forEach(function (button) {
            button.style.setProperty('overflow', 'visible', 'important');
            button.style.setProperty('position', 'relative', 'important');
            button.style.setProperty('z-index', '2', 'important');
        });
        document.querySelectorAll('#cv-root .cv-nav-mobile-row .cv-feed-messenger-button em, #cv-root .cv-nav-mobile-row .cv-feed-notifications-button em, #cv-social-mvp .cv-nav-mobile-row .cv-feed-messenger-button em, #cv-social-mvp .cv-nav-mobile-row .cv-feed-notifications-button em, .curated-vault-premium-wrap .cv-nav-mobile-row .cv-feed-messenger-button em, .curated-vault-premium-wrap .cv-nav-mobile-row .cv-feed-notifications-button em').forEach(function (badge) {
            badge.style.setProperty('z-index', '99', 'important');
            badge.style.setProperty('top', '-2px', 'important');
            badge.style.setProperty('right', '4px', 'important');
            badge.style.setProperty('box-shadow', '0 5px 12px rgba(225, 29, 72, .35)', 'important');
            badge.style.setProperty('pointer-events', 'none', 'important');
        });
        document.querySelectorAll('#cv-root > main, .curated-vault-premium-wrap > main, #cv-root .cv-react-feed-page, #cv-root .cv-feed-page-linkedin').forEach(function (main) {
            main.style.setProperty('margin-top', '0', 'important');
            main.style.setProperty('padding-top', '0', 'important');
        });
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', cvApplyMobileNoSpace);
    } else {
        cvApplyMobileNoSpace();
    }
    window.addEventListener('load', cvApplyMobileNoSpace);
    window.addEventListener('resize', cvApplyMobileNoSpace);
    window.addEventListener('orientationchange', cvApplyMobileNoSpace);
    [0, 30, 80, 160, 350, 800, 1500, 3000].forEach(function (delay) { setTimeout(cvApplyMobileNoSpace, delay); });
    if (window.MutationObserver) {
        var cvMobileNoSpaceScheduled = false;
        function cvScheduleMobileNoSpace() {
            if (cvMobileNoSpaceScheduled) { return; }
            cvMobileNoSpaceScheduled = true;
            (window.requestAnimationFrame || window.setTimeout)(function () {
                cvMobileNoSpaceScheduled = false;
                cvApplyMobileNoSpace();
            }, 16);
        }
        var observer = new MutationObserver(cvScheduleMobileNoSpace);
        if (document.body) observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
        else document.addEventListener('DOMContentLoaded', function () { observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] }); });
    }
})();


/* v5.5.151 - Sign Up Google cleanup watchdog.
   Removes stale cached sign-up Google/Gmail elements while keeping Sign In Google visible. */
(function () {
    function runCleanup() {
        if (typeof cvRemoveSignupGoogleUi === 'function') cvRemoveSignupGoogleUi();
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runCleanup);
    } else {
        runCleanup();
    }
    try {
        var observer = new MutationObserver(function () { runCleanup(); });
        observer.observe(document.documentElement || document.body, { childList: true, subtree: true });
    } catch (error) {}
})();
