(function () {
    'use strict';

    const root = document.getElementById('cv-social-mvp');
    if (!root || typeof cvSocialMvp === 'undefined') {
        return;
    }

    const state = {
        view: 'feed',
        posts: [],
        notifications: [],
        notificationCount: 0,
        messageUnreadCount: 0,
        threads: [],
        comments: {},
        currentUser: cvSocialMvp.currentUser || null,
    };

    const $ = (selector, context = root) => context.querySelector(selector);
    const $$ = (selector, context = root) => Array.from(context.querySelectorAll(selector));

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>'"]/g, function (char) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' })[char];
        });
    }

    function safeCss(value) {
        const raw = String(value || '');
        if (window.CSS && typeof window.CSS.escape === 'function') {
            return window.CSS.escape(raw);
        }
        return raw.replace(/[^a-zA-Z0-9_-]/g, '\\$&');
    }

    function actionIcon(name) {
        const icons = {
            amen: '<svg class="cv-social-action-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 11v9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 21h5.2a2.6 2.6 0 0 0 2.55-2.12l1.02-5.45A2.6 2.6 0 0 0 18.22 10H15V5.8A2.8 2.8 0 0 0 12.2 3h-.4l-1.2 6.15L7 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 10.5h4v10H3a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
            comment: '<svg class="cv-social-action-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-12.3 7.6L3 21l1.9-5.4A8.5 8.5 0 1 1 21 11.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            share: '<svg class="cv-social-action-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="18" cy="5" r="3" stroke="currentColor" stroke-width="2"/><circle cx="6" cy="12" r="3" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="19" r="3" stroke="currentColor" stroke-width="2"/><path d="m8.7 10.7 6.6-4.4M8.7 13.3l6.6 4.4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
        };
        return icons[name] || '';
    }

    function postPermalink(post) {
        const base = window.location.href.split('#')[0];
        return base + '#faithin-post-' + encodeURIComponent(post && post.id ? post.id : '');
    }

    function copyToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        }
        return new Promise((resolve, reject) => {
            const input = document.createElement('textarea');
            input.value = text;
            input.setAttribute('readonly', 'readonly');
            input.style.position = 'fixed';
            input.style.left = '-9999px';
            document.body.appendChild(input);
            input.select();
            try {
                document.execCommand('copy') ? resolve() : reject(new Error('Copy failed.'));
            } catch (error) {
                reject(error);
            } finally {
                document.body.removeChild(input);
            }
        });
    }


    if (!cvSocialMvp.isLoggedIn) {
        root.innerHTML = `
            <section class="cv-members-gate cv-members-gate--clean cv-social-public-gate" aria-label="Members only access">
                <div class="cv-members-gate__ambient" aria-hidden="true">
                    <span class="cv-members-gate__orb cv-members-gate__orb--one"></span>
                    <span class="cv-members-gate__orb cv-members-gate__orb--two"></span>
                    <span class="cv-members-gate__orb cv-members-gate__orb--three"></span>
                </div>
                <div class="cv-members-gate__card cv-members-gate__card--animated">
                    <div class="cv-members-gate__card-top">
                        <div class="cv-members-gate__badge">✨</div>
                        <div class="cv-members-gate__chip">Members only</div>
                    </div>
                    <p class="cv-members-gate__eyebrow">Clean private experience</p>
                    <h1>Welcome to a calm, protected community</h1>
                    <p class="cv-members-gate__text">Messages, notifications, posts, profiles, recommendations, jobs, library items, and Bible tools are available after you create an account or log in.</p>
                    <div class="cv-members-gate__feature-grid">
                        <div class="cv-members-gate__feature"><strong>Private by default</strong><span>Only members can browse content.</span></div>
                        <div class="cv-members-gate__feature"><strong>Faster access</strong><span>Simple sign-in with a smoother card layout.</span></div>
                        <div class="cv-members-gate__feature"><strong>Clean visual style</strong><span>Soft background and gentle motion.</span></div>
                    </div>
                    <div class="cv-members-gate__actions">
                        <a class="cv-members-gate__primary" href="${escapeHtml(cvSocialMvp.loginUrl)}">Create account</a>
                        <a class="cv-members-gate__secondary" href="${escapeHtml(cvSocialMvp.loginUrl)}">Log in</a>
                    </div>
                    <div class="cv-members-gate__note"><span>🛡️</span><span>Your community is protected while members get a cleaner entry screen.</span></div>
                </div>
            </section>`;
        return;
    }

    function setStatus(message, isError) {
        const node = $('[data-cv-status]');
        if (!node) return;
        node.textContent = message || '';
        node.classList.toggle('is-error', !!isError);
    }

    async function api(path, options = {}) {
        const response = await fetch(cvSocialMvp.root + path, {
            method: options.method || 'GET',
            headers: Object.assign({
                'Content-Type': 'application/json',
                'X-WP-Nonce': cvSocialMvp.nonce,
            }, options.headers || {}),
            credentials: 'same-origin',
            body: options.body ? JSON.stringify(options.body) : undefined,
        });
        const json = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(json.message || 'Request failed.');
        }
        return json;
    }

    function avatar(user) {
        const name = user && user.name ? user.name : 'User';
        if (user && user.avatar_url) {
            return `<img class="cv-social-avatar" src="${escapeHtml(user.avatar_url)}" alt="${escapeHtml(name)}">`;
        }
        return `<span class="cv-social-avatar cv-social-avatar-fallback">${escapeHtml(name.charAt(0).toUpperCase())}</span>`;
    }

    function renderCompose() {
        const node = $('[data-cv-compose]');
        if (!node) return;
        if (!cvSocialMvp.isLoggedIn) {
            node.innerHTML = `<p>Please sign in to post, react, comment, follow, or send messages.</p><a class="cv-social-button" href="${escapeHtml(cvSocialMvp.loginUrl)}">Sign in</a>`;
            return;
        }
        node.innerHTML = `
            <div class="cv-social-compose-row">
                ${avatar(state.currentUser)}
                <textarea data-cv-post-content rows="3" placeholder="Share an update with the community..."></textarea>
            </div>
            <div class="cv-social-compose-actions">
                <input type="url" data-cv-media-url placeholder="Optional image/video URL">
                <select data-cv-media-type>
                    <option value="none">No media</option>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                </select>
                <button type="button" data-cv-create-post class="cv-social-button">Post</button>
            </div>`;
    }

    function renderPost(post) {
        const media = post.media_url ? (post.media_type === 'video'
            ? `<video class="cv-social-media" src="${escapeHtml(post.media_url)}" controls playsinline preload="metadata"></video>`
            : `<img class="cv-social-media" src="${escapeHtml(post.media_url)}" alt="" loading="lazy">`) : '';
        const reacted = post.user_reacted ? 'is-active' : '';
        const reactionCount = Number(post.reaction_count || 0);
        const commentCount = Number(post.comment_count || 0);
        return `<article class="cv-social-card cv-social-post" id="faithin-post-${escapeHtml(post.id)}" data-post-id="${escapeHtml(post.id)}">
            <header class="cv-social-post-header">
                ${avatar(post.author)}
                <div><strong>${escapeHtml(post.author && post.author.name ? post.author.name : 'User')}</strong><small>${escapeHtml(post.created_at || '')}</small></div>
            </header>
            <div class="cv-social-post-content">${post.content || ''}</div>
            ${media}
            <footer class="cv-social-post-actions" aria-label="Post actions">
                <button type="button" class="${reacted}" data-cv-react="${escapeHtml(post.id)}" aria-pressed="${post.user_reacted ? 'true' : 'false'}">
                    ${actionIcon('amen')}<span class="cv-social-action-label">Amen</span><span class="cv-social-action-count" data-cv-action-count>${reactionCount}</span>
                </button>
                <button type="button" data-cv-load-comments="${escapeHtml(post.id)}" aria-expanded="false">
                    ${actionIcon('comment')}<span class="cv-social-action-label">Comment</span><span class="cv-social-action-count" data-cv-comment-count>${commentCount}</span>
                </button>
                <button type="button" data-cv-share="${escapeHtml(post.id)}" data-cv-share-url="${escapeHtml(postPermalink(post))}">
                    ${actionIcon('share')}<span class="cv-social-action-label">Share</span>
                </button>
            </footer>
            <div class="cv-social-comments" data-comments-for="${escapeHtml(post.id)}" hidden></div>
        </article>`;
    }

    function renderFeed() {
        renderCompose();
        const node = $('[data-cv-content]');
        node.innerHTML = state.posts.length ? state.posts.map(renderPost).join('') : '<div class="cv-social-card">No posts yet. Be the first to share an update.</div>';
    }

    function notificationType(type) {
        const raw = String(type || '').toLowerCase();
        if (raw === 'reaction' || raw === 'like' || raw === 'love' || raw === 'support' || raw === 'celebrate') return 'reaction';
        if (raw === 'new_post' || raw === 'post') return 'new_post';
        return raw || 'bell';
    }

    function notificationLabel(item) {
        if (item && item.message) return item.message;
        return ({ reaction: 'reacted to your post', comment: 'commented on your post', reply: 'replied to your comment', follow: 'started following you', message: 'sent you a message', new_post: 'shared a new post' })[notificationType(item && item.type)] || 'sent you a notification';
    }

    function renderNotifications() {
        $('[data-cv-compose]').innerHTML = '';
        const node = $('[data-cv-content]');
        node.innerHTML = state.notifications.length ? `<section class="cv-feed-notifications-list cv-feed-notifications-list--inline">${state.notifications.map((item) => {
            const unread = !Number(item.is_read || 0);
            const type = notificationType(item.type);
            const name = item.actor && item.actor.name ? item.actor.name : 'Someone';
            return `<button type="button" class="cv-feed-notification-item ${unread ? 'is-new' : ''}" data-cv-inline-notification="${escapeHtml(item.id || '')}" data-cv-inline-notification-type="${escapeHtml(type)}" data-cv-inline-notification-object="${escapeHtml(item.object_id || '')}">
                <div class="cv-feed-notification-avatar">${avatar(item.actor)}<span class="cv-feed-notification-badge is-${type === 'reaction' ? 'like' : type}">●</span></div>
                <div class="cv-feed-notification-copy"><p><strong>${escapeHtml(name)}</strong> ${escapeHtml(notificationLabel(item))}</p><small>${escapeHtml(item.created_at || '')}</small></div>
                ${unread ? '<span class="cv-feed-notification-dot" aria-label="Unread"></span>' : ''}
            </button>`;
        }).join('')}</section>` : '<div class="cv-feed-notification-empty"><strong>No notifications yet.</strong><span>You are all caught up.</span></div>';
    }

    function renderMessages() {
        // Legacy recipient-ID message composer removed. The real user-to-user
        // messenger below now owns this view and uses the LinkedIn-style UI.
        $('[data-cv-compose]').innerHTML = '';
        $('[data-cv-content]').innerHTML = `
            <section class="cv-social-card cv-linkedin-message-inline">
                <div class="cv-linkedin-message-inline-icon" aria-hidden="true">
                    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5A8.48 8.48 0 0 1 21 11v.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </div>
                <h3>Messaging</h3>
                <p>Use the Messaging button to open the LinkedIn-style chat, search members, and start a direct conversation.</p>
                <button type="button" class="cv-social-button" data-cv-open-embedded-messenger>Open Messaging</button>
            </section>`;
    }

    function renderNav() {
        $$('[data-cv-view]').forEach((button) => {
            button.classList.toggle('is-active', button.dataset.cvView === state.view);
            const baseLabel = button.dataset.cvLabel || button.textContent.replace(/\s*\d+\s*$/, '');
            button.dataset.cvLabel = baseLabel;
            const count = button.dataset.cvView === 'notifications' ? state.notificationCount : (button.dataset.cvView === 'messages' ? state.messageUnreadCount : 0);
            button.innerHTML = escapeHtml(baseLabel) + (count ? ' <span class="cv-social-nav-badge">' + escapeHtml(count > 99 ? '99+' : count) + '</span>' : '');
        });
    }

    function render() {
        renderNav();
        if (state.view === 'notifications') renderNotifications();
        else if (state.view === 'messages') renderMessages();
        else renderFeed();
    }

    async function loadFeed() {
        setStatus('');
        const data = await api('/social/feed');
        state.posts = data.items || [];
        render();
    }

    async function loadNotifications() {
        if (!cvSocialMvp.isLoggedIn) return;
        const data = await api('/social/notifications');
        state.notifications = data.items || [];
        state.notificationCount = Number(data.unread_count || 0);
        state.messageUnreadCount = Number(data.message_unread_count || 0);
        render();
    }

    async function loadThreads() {
        if (!cvSocialMvp.isLoggedIn) return;
        const data = await api('/social/messages/threads');
        state.threads = data.items || [];
        state.messageUnreadCount = state.threads.reduce((sum, item) => sum + Number(item.unread_count || 0), 0);
        render();
    }

    async function loadNotificationCount() {
        if (!cvSocialMvp.isLoggedIn) return;
        try {
            const data = await api('/social/notifications/count');
            state.notificationCount = Number(data.unread_count || 0);
            state.messageUnreadCount = Number(data.message_unread_count || 0);
            renderNav();
        } catch (error) {}
    }

    root.addEventListener('click', async function (event) {
        const viewButton = event.target.closest('[data-cv-view]');
        if (viewButton) {
            state.view = viewButton.dataset.cvView;
            if (state.view === 'notifications') await loadNotifications();
            else if (state.view === 'messages') await loadThreads();
            else render();
            return;
        }

        const inlineNotification = event.target.closest('[data-cv-inline-notification]');
        if (inlineNotification) {
            const id = inlineNotification.dataset.cvInlineNotification || '';
            const type = inlineNotification.dataset.cvInlineNotificationType || '';
            const objectId = inlineNotification.dataset.cvInlineNotificationObject || '';
            if (id) api('/social/notifications/read', { method: 'POST', body: { id: Number(id) } }).catch(() => {});
            state.notifications = state.notifications.map((item) => String(item.id) === String(id) ? Object.assign({}, item, { is_read: 1 }) : item);
            if (type !== 'message') state.notificationCount = Math.max(0, state.notificationCount - 1);
            render();
            if (type === 'message' && objectId && typeof window.cvOpenSocialMvpMessageThread === 'function') window.cvOpenSocialMvpMessageThread(objectId);
            else if (objectId) {
                const post = root.querySelector(`[data-post-id="${safeCss(objectId)}"]`);
                if (post) post.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        if (event.target.closest('[data-cv-open-embedded-messenger]')) {
            if (typeof window.cvOpenSocialMvpMessenger === 'function') window.cvOpenSocialMvpMessenger();
            else {
                const toggle = root.querySelector('[data-cv-msg-toggle]');
                if (toggle) toggle.click();
            }
            return;
        }

        const createPostButton = event.target.closest('[data-cv-create-post]');
        if (createPostButton) {
            try {
                const contentInput = $('[data-cv-post-content]');
                const mediaInput = $('[data-cv-media-url]');
                const mediaTypeInput = $('[data-cv-media-type]');
                const content = contentInput ? contentInput.value.trim() : '';
                const mediaUrl = mediaInput ? mediaInput.value.trim() : '';
                const mediaType = mediaTypeInput ? mediaTypeInput.value : 'none';
                if (!content && !mediaUrl) {
                    setStatus('Write something or attach media first.', true);
                    return;
                }
                createPostButton.disabled = true;
                createPostButton.classList.add('is-loading');
                setStatus('Posting...');
                const data = await api('/social/feed', { method: 'POST', body: { content, media_url: mediaUrl, media_type: mediaType } });
                state.posts.unshift(data.post);
                setStatus('Posted successfully.');
                renderFeed();
            } catch (error) {
                setStatus(error.message, true);
                createPostButton.disabled = false;
                createPostButton.classList.remove('is-loading');
            }
            return;
        }

        const reactButton = event.target.closest('[data-cv-react]');
        if (reactButton) {
            try {
                const id = reactButton.dataset.cvReact;
                reactButton.disabled = true;
                const data = await api(`/social/posts/${id}/react`, { method: 'POST', body: { reaction: 'support' } });
                const post = state.posts.find((item) => String(item.id) === String(id));
                if (post) {
                    post.reaction_count = Number(data.reaction_count || 0);
                    post.user_reacted = !!data.reacted;
                }
                reactButton.classList.toggle('is-active', !!data.reacted);
                reactButton.setAttribute('aria-pressed', data.reacted ? 'true' : 'false');
                const count = reactButton.querySelector('[data-cv-action-count]');
                if (count) count.textContent = String(Number(data.reaction_count || 0));
                setStatus('');
            } catch (error) {
                setStatus(error.message, true);
            } finally {
                reactButton.disabled = false;
            }
            return;
        }

        const shareButton = event.target.closest('[data-cv-share]');
        if (shareButton) {
            const url = shareButton.dataset.cvShareUrl || window.location.href;
            try {
                if (navigator.share) {
                    await navigator.share({ title: 'FaithIn post', url });
                    setStatus('Post shared.');
                } else {
                    await copyToClipboard(url);
                    setStatus('Post link copied.');
                }
                shareButton.classList.add('is-copied');
                setTimeout(() => shareButton.classList.remove('is-copied'), 1200);
            } catch (error) {
                if (!String(error && error.name).includes('Abort')) {
                    setStatus('Could not share this post. Please try again.', true);
                }
            }
            return;
        }

        const commentsButton = event.target.closest('[data-cv-load-comments]');
        if (commentsButton) {
            const id = commentsButton.dataset.cvLoadComments;
            const commentsWrap = $(`[data-comments-for="${safeCss(id)}"]`);
            if (!commentsWrap) return;
            const isOpen = commentsWrap.classList.contains('is-open');
            if (isOpen) {
                commentsWrap.classList.remove('is-open');
                commentsWrap.hidden = true;
                commentsButton.setAttribute('aria-expanded', 'false');
                return;
            }
            commentsButton.disabled = true;
            try {
                const data = await api(`/social/posts/${id}/comments`);
                commentsWrap.innerHTML = `${(data.items || []).map((comment) => `
                    <div class="cv-social-comment">${avatar(comment.author)}<p><strong>${escapeHtml(comment.author && comment.author.name ? comment.author.name : 'User')}</strong><br>${escapeHtml(comment.content)}</p></div>`).join('') || '<div class="cv-social-comment-empty">No comments yet. Be the first to comment.</div>'}
                    ${cvSocialMvp.isLoggedIn ? `<div class="cv-social-comment-form"><input type="text" data-cv-comment-input="${escapeHtml(id)}" placeholder="Write a comment"><button type="button" data-cv-create-comment="${escapeHtml(id)}">Reply</button></div>` : ''}`;
                commentsWrap.hidden = false;
                commentsWrap.classList.add('is-open');
                commentsButton.setAttribute('aria-expanded', 'true');
                const input = commentsWrap.querySelector(`[data-cv-comment-input="${safeCss(id)}"]`);
                if (input) input.focus();
            } catch (error) {
                setStatus(error.message, true);
            } finally {
                commentsButton.disabled = false;
            }
            return;
        }

        const commentButton = event.target.closest('[data-cv-create-comment]');
        if (commentButton) {
            try {
                const id = commentButton.dataset.cvCreateComment;
                const input = $(`[data-cv-comment-input="${safeCss(id)}"]`);
                if (!input || !input.value.trim()) return;
                commentButton.disabled = true;
                await api(`/social/posts/${id}/comments`, { method: 'POST', body: { content: input.value.trim() } });
                input.value = '';
                const post = state.posts.find((item) => String(item.id) === String(id));
                if (post) post.comment_count = Number(post.comment_count || 0) + 1;
                const count = $(`[data-cv-load-comments="${safeCss(id)}"] [data-cv-comment-count]`);
                if (count && post) count.textContent = String(post.comment_count);
                const commentsWrap = $(`[data-comments-for="${safeCss(id)}"]`);
                if (commentsWrap) commentsWrap.classList.remove('is-open');
                const loadButton = $(`[data-cv-load-comments="${safeCss(id)}"]`);
                if (loadButton) loadButton.click();
            } catch (error) {
                setStatus(error.message, true);
                commentButton.disabled = false;
            }
            return;
        }
    });

    renderCompose();
    loadFeed().catch((error) => setStatus(error.message, true));
    loadNotificationCount().catch(() => {});
    setInterval(() => loadNotificationCount().catch(() => {}), 20000);
}());

/* Embedded Messenger inside the social feed - no separate page */
(function () {
    'use strict';
    if (window.__cvFeedMessengerReady) return;
    window.__cvFeedMessengerReady = true;

    const wrap = document.getElementById('cv-social-mvp');
    if (!wrap || typeof cvSocialMvp === 'undefined') return;
    if (!cvSocialMvp.isLoggedIn) return;
    const holder = wrap.querySelector('[data-cv-feed-messenger]') || wrap;

    const state = { open:false, conversations:[], activeThreadId:null, activeUser:null, messages:[], searchResults:[], attachment:null, error:'', sending:false };
    const rootUrl = cvSocialMvp.root;
    const restNonce = cvSocialMvp.nonce || '';
    const isLoggedIn = !!cvSocialMvp.isLoggedIn;
    const loginUrl = cvSocialMvp.loginUrl || '/wp-login.php';

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
    async function api(path, options={}){ const r=await fetch(rootUrl+path,{method:options.method||'GET',headers:{'Content-Type':'application/json','X-WP-Nonce':restNonce},credentials:'same-origin',body:options.body?JSON.stringify(options.body):undefined}); const j=await r.json().catch(()=>({})); if(!r.ok) throw new Error(j.message||'Request failed.'); return j; }
    function unread(){ return state.conversations.reduce((s,t)=>s+Number(t.unread_count||0),0); }
    function isVisible(node){ return !!(node && (node.offsetWidth || node.offsetHeight || node.getClientRects().length)); }
    function mountHolder(){}

    function list(){
        if(!isLoggedIn) return `<div class="cv-feed-msg-empty"><strong>Messaging</strong><p>Please sign in to chat.</p><a class="cv-social-button" href="${e(loginUrl)}">Sign in</a></div>`;
        const search = state.searchResults.length ? `<div class="cv-feed-msg-search-results"><div class="cv-feed-msg-list-title"><span>People</span><em>${state.searchResults.length}</em></div>${state.searchResults.map(u=>`<button type="button" class="cv-feed-msg-user-result" data-cv-msg-user="${e(u.id)}" data-cv-msg-user-name="${e(u.name||'User')}">${av(u)}<span><strong>${e(u.name||'User')}</strong><small>${e(handle(u))}</small></span></button>`).join('')}</div>` : '';
        const conv = state.conversations.length ? state.conversations.map(t=>{
            const u=t.other_user||{name:'User'};
            const n=Number(t.unread_count||0);
            const when=lastActivity(t);
            const active=String(state.activeThreadId)===String(t.id);
            return `<button type="button" class="cv-feed-msg-thread ${active?'is-active':''} ${n?'has-unread':''}" data-cv-msg-thread="${e(t.id)}"><span class="cv-feed-msg-avatar-wrap">${av(u)}${n?'<i aria-hidden="true"></i>':''}</span><span class="cv-feed-msg-thread-main"><span class="cv-feed-msg-thread-top"><strong>${e(u.name||'User')}</strong>${when?`<small class="cv-feed-msg-time">${e(when)}</small>`:''}</span><small class="cv-feed-msg-preview">${e(t.last_message||handle(u))}</small></span>${n?`<em aria-label="${e(n)} unread messages">${n>99?'99+':n}</em>`:''}</button>`;
        }).join('') : '<div class="cv-feed-msg-empty small"><strong>No conversations yet</strong><p>Search for a member or choose New Conversation to start messaging.</p></div>';
        return `<div class="cv-feed-msg-list"><div class="cv-feed-msg-sidebar-top"><div class="cv-feed-msg-search"><span class="cv-feed-msg-search-icon">${msgIcon('search',18)}</span><input type="search" data-cv-msg-search placeholder="Search messages or people"></div><button type="button" class="cv-feed-msg-new" data-cv-msg-new>${msgIcon('plus',18)}<span>New Conversation</span></button></div>${search}<div class="cv-feed-msg-list-title"><span>Conversations</span><em>${state.conversations.length}</em></div><div class="cv-feed-msg-thread-list">${conv}</div></div>`;
    }
    function composer(){
        const preview = state.attachment ? `<div class="cv-feed-msg-attachment-preview">${msgIcon(state.attachment.type==='image'?'image':(state.attachment.type==='video'?'film':'file'),16)}<span>${e(state.attachment.name||'attachment')}</span><button type="button" data-cv-msg-clear-attachment aria-label="Remove attachment">${msgIcon('close',14)}</button></div>` : '';
        const err = state.error ? `<div class="cv-feed-msg-error"><button type="button" data-cv-msg-clear-error>${msgIcon('close',13)}</button><span>${e(state.error)}</span></div>` : '';
        return `<div class="cv-feed-msg-composer-wrap">${err}<form class="cv-feed-msg-form" data-cv-msg-form>${preview}<textarea rows="1" data-cv-msg-body placeholder="Write a message..." autocomplete="off"></textarea><div class="cv-feed-msg-composer-bar"><div class="cv-feed-msg-tools"><button type="button" class="cv-feed-msg-tool" data-cv-msg-attach="image" title="Attach image">${msgIcon('image',20)}</button><button type="button" class="cv-feed-msg-tool" data-cv-msg-attach="video" title="Attach video">${msgIcon('film',20)}</button><button type="button" class="cv-feed-msg-tool" data-cv-msg-attach="file" title="Attach file">${msgIcon('paperclip',20)}</button></div><button type="submit" class="cv-feed-msg-send is-disabled ${state.sending?'is-sending':''}" aria-label="Send message">${state.sending?'Sending…':'Send'}</button></div><input hidden type="file" accept="image/*" data-cv-msg-file-input="image"><input hidden type="file" accept="video/*" data-cv-msg-file-input="video"><input hidden type="file" data-cv-msg-file-input="file"></form></div>`;
    }
    function chat(){
        if(!state.activeThreadId&&!state.activeUser) return `<div class="cv-feed-msg-welcome"><div class="cv-feed-msg-welcome-icon cv-linkedin-empty-bubble">${msgIcon('message',56)}</div><strong>Welcome to Messaging</strong><p>Choose a conversation, search for a member, or start a new chat in a cleaner professional workspace.</p><div class="cv-feed-msg-welcome-points"><span>${msgIcon('message',16)} Direct chat</span><span>${msgIcon('image',16)} Photo sharing</span><span>${msgIcon('film',16)} Video sharing</span><span>${msgIcon('file',16)} File sharing</span></div></div>`;
        const u=state.activeUser||{name:'Chat'};
        const bubbles=state.messages.length?state.messages.map(m=>`<div class="cv-feed-msg-row ${m.mine?'mine':'theirs'}"><div class="cv-feed-msg-bubble ${m.mine?'mine':'theirs'}">${renderAttachment(m.attachment,m.mine)}${m.body?`<p dir="auto">${e(m.body||'')}</p>`:''}<small><span>${e(timeLabel(m.created_at)||m.created_at||'')}</span>${m.mine?`<span class="cv-feed-msg-checks">${msgIcon('checkcheck',14)}</span>`:''}</small></div></div>`).join(''):`<div class="cv-feed-msg-empty small cv-feed-msg-start"><span class="cv-feed-msg-start-icon">${msgIcon('message',32)}</span><strong>No messages yet</strong><p>Say hello and start the conversation.</p></div>`;
        return `<div class="cv-feed-msg-chat"><div class="cv-feed-msg-chat-head"><button type="button" data-cv-msg-back class="cv-feed-msg-back" aria-label="Back to conversations">${msgIcon('back',18)}</button>${av(u)}<div class="cv-feed-msg-chat-title"><strong>${e(u.name||'Chat')}</strong><small>${e(handle(u))} · Direct message</small></div><div class="cv-feed-msg-chat-actions"><button type="button" class="cv-feed-msg-chat-action" data-cv-msg-focus-search title="Search people">${msgIcon('search',20)}</button><button type="button" class="cv-feed-msg-chat-action cv-feed-msg-phone-action" data-cv-msg-call="audio" title="Voice call">${msgIcon('phone',20)}</button><button type="button" class="cv-feed-msg-chat-action cv-feed-msg-video-action" data-cv-msg-call="video" title="Video call">${msgIcon('video',20)}</button><button type="button" class="cv-feed-msg-chat-action" title="More options">${msgIcon('more',20)}</button></div></div><div class="cv-feed-msg-bubbles" data-cv-msg-bubbles role="log" aria-live="polite" aria-relevant="additions text">${bubbles}</div>${composer()}<p class="cv-feed-msg-hint">Press Enter to send. Use Shift + Enter for a new line.</p></div>`;
    }
    function syncComposerHeight(scope){
        const target = (scope && scope.querySelector) ? scope.querySelector("[data-cv-msg-body]") : null;
        if(!target) return;
        target.style.height = 'auto';
        const next = Math.max(44, Math.min(target.scrollHeight || 44, 138));
        target.style.height = next + 'px';
    }
    function focusMessengerPrimaryField(){
        const body = holder.querySelector("[data-cv-msg-body]");
        if(body){ body.focus(); syncComposerHeight(holder); return; }
        const search = holder.querySelector("[data-cv-msg-search]");
        if(search) search.focus();
    }
    function render(){ mountHolder(); const n=unread(); const badge=n?`<em>${n>99?'99+':n}</em>`:''; const hasActiveChat=!!(state.activeThreadId||state.activeUser); holder.innerHTML=`<button type="button" class="cv-feed-messenger-button" data-cv-msg-toggle aria-label="Messages" aria-expanded="${state.open?'true':'false'}" title="Messages"><span class="cv-feed-messenger-button-icon">${msgIcon('message',20)}</span><strong>Messaging</strong>${badge}</button><section class="cv-feed-messenger-panel cv-linkedin-chat-panel cv-react-exact-ui ${state.open?'is-open':''} ${hasActiveChat?'cv-chat-active':''}" aria-label="Messaging" role="dialog" aria-modal="true"><header class="cv-feed-msg-header"><div><strong>Messaging</strong><small>Professional, secure conversations</small></div><button type="button" data-cv-msg-close aria-label="Close messaging">${msgIcon('close',20)}</button></header><div class="cv-feed-msg-body">${list()}${chat()}</div></section>`;  const b=holder.querySelector('[data-cv-msg-bubbles]'); if(b) b.scrollTop=b.scrollHeight; syncComposerHeight(holder); updateSendState(); if(state.open) setTimeout(focusMessengerPrimaryField, 0); }
    window.cvOpenSocialMvpMessenger = function(){ state.open = true; render(); load().catch(()=>{}); };

    async function load(options){ if(!isLoggedIn) return; const d=await api('/social/messages/threads'); state.conversations=d.items||[]; const activeInput=holder.querySelector('[data-cv-msg-body]'); const userTyping=!!(options&&options.quiet&&activeInput&&document.activeElement===activeInput&&activeInput.value.trim()); if(!userTyping) render(); }
    async function openThread(id){ state.activeThreadId=id; state.activeUser=null; state.messages=[]; state.attachment=null; render(); const d=await api(`/social/messages/threads/${id}`); state.messages=d.items||[]; state.activeUser=d.other_user||null; await load(); state.activeThreadId=id; render(); }
    async function search(q){ const term=(q||'').trim(); const d=await api('/social/users/search?q='+encodeURIComponent(term)); state.searchResults=d.items||[]; render(); const input=holder.querySelector('[data-cv-msg-search]'); if(input){input.value=term;input.focus();} }
    function cleanAttachment(att){ if(!att) return null; return { type:att.type||'file', name:att.name||'attachment', data_url:att.dataUrl||att.data_url||'' }; }
    async function send(body, attachment){ const text=(body||'').trim(); const file=cleanAttachment(attachment); if(!text&&!file) return; const payload={body:text}; if(file) payload.attachment=file; if(state.activeThreadId){ await api(`/social/messages/threads/${state.activeThreadId}`,{method:'POST',body:payload}); await openThread(state.activeThreadId); } else if(state.activeUser&&state.activeUser.id){ payload.recipient_id=state.activeUser.id; const d=await api('/social/messages/threads',{method:'POST',body:payload}); await openThread(d.thread_id); } }
    function showError(msg){ state.error=msg||'Attachment failed.'; render(); }
    function showCallNotice(){ if(typeof window.showToast==='function') window.showToast('Voice and video calls need a real-time calling server. Messaging is connected and ready.', 'info'); else showError('Voice and video calls need a real-time calling server. Messaging is connected and ready.'); }
    function fileSelected(input,type){ const file=input.files&&input.files[0]; if(!file) return; if(file.size>500*1024){ input.value=''; showError('File too large. Max 500KB allowed.'); return; } const reader=new FileReader(); reader.onload=function(ev){ state.attachment={type:type||'file', name:file.name, dataUrl:ev.target.result}; state.error=''; render(); }; reader.onerror=function(){ showError('Could not read this file.'); }; reader.readAsDataURL(file); input.value=''; }

    let timer=null;
    function updateSendState(){ const input=holder.querySelector('[data-cv-msg-body]'); const sendBtn=holder.querySelector('.cv-feed-msg-send'); const disabled = !!state.sending || !((input&&input.value.trim())||state.attachment); if(sendBtn){ sendBtn.classList.toggle('is-disabled', disabled); sendBtn.disabled = disabled; } }
    holder.addEventListener('input', ev=>{ if(ev.target.matches('[data-cv-msg-search]')){ const qv=ev.target.value; clearTimeout(timer); timer=setTimeout(()=>search(qv).catch(()=>{}),250); return; } if(ev.target.matches('[data-cv-msg-body]')){ syncComposerHeight(holder); updateSendState(); return; } if(ev.target.matches('[data-cv-msg-file-input]')) fileSelected(ev.target, ev.target.dataset.cvMsgFileInput||'file'); });
    holder.addEventListener('click', ev=>{ if(ev.target.closest('[data-cv-msg-toggle]')){ state.open=!state.open; render(); if(state.open) load().catch(()=>{}); return; } if(ev.target.closest('[data-cv-msg-close]')){ state.open=false; render(); return; } if(ev.target.closest('[data-cv-msg-focus-search]')){ const input=holder.querySelector('[data-cv-msg-search]'); if(input){ input.focus(); input.select && input.select(); } return; } if(ev.target.closest('[data-cv-msg-new]')){ const input=holder.querySelector('[data-cv-msg-search]'); if(input){ input.focus(); input.select && input.select(); } search('').catch(()=>{}); return; } if(ev.target.closest('[data-cv-msg-back]')){ state.activeThreadId=null; state.activeUser=null; state.messages=[]; state.attachment=null; render(); return; } if(ev.target.closest('[data-cv-msg-clear-attachment]')){ state.attachment=null; render(); return; } if(ev.target.closest('[data-cv-msg-clear-error]')){ state.error=''; render(); return; } if(ev.target.closest('[data-cv-msg-call]')){ showCallNotice(); return; } const attach=ev.target.closest('[data-cv-msg-attach]'); if(attach){ const input=holder.querySelector(`[data-cv-msg-file-input="${attach.dataset.cvMsgAttach}"]`); if(input) input.click(); return; } const th=ev.target.closest('[data-cv-msg-thread]'); if(th){ openThread(th.dataset.cvMsgThread).catch(()=>{}); return; } const ub=ev.target.closest('[data-cv-msg-user]'); if(ub){ const found=state.searchResults.find(u=>String(u.id)===String(ub.dataset.cvMsgUser)); state.activeThreadId=null; state.activeUser=found||{id:Number(ub.dataset.cvMsgUser),name:ub.dataset.cvMsgUserName||'User'}; state.messages=[]; state.searchResults=[]; state.attachment=null; render(); return; } });
    holder.addEventListener('keydown', ev=>{ if(ev.key==='Escape' && state.open){ state.open=false; render(); return; } if(!ev.target.matches('[data-cv-msg-body]')) return; if(ev.key==='Enter' && !ev.shiftKey){ ev.preventDefault(); const form=ev.target.closest('[data-cv-msg-form]'); if(form) form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit', {cancelable:true, bubbles:true})); } });
    holder.addEventListener('submit', ev=>{ if(!ev.target.matches('[data-cv-msg-form]')) return; ev.preventDefault(); if(state.sending) return; const input=holder.querySelector('[data-cv-msg-body]'); const value=input?input.value:''; const attachment=state.attachment; if(!value.trim()&&!attachment) return; state.sending=true; updateSendState(); send(value, attachment).then(()=>{ state.sending=false; state.attachment=null; state.error=''; render(); }).catch(err=>{ state.sending=false; showError(err.message||'Could not send message.'); const fresh=holder.querySelector('[data-cv-msg-body]'); if(fresh){ fresh.value=value; fresh.focus(); syncComposerHeight(holder); updateSendState(); } }); });
    render(); load().catch(()=>{}); setInterval(()=>load({quiet:true}).catch(()=>{}),30000);
}());


