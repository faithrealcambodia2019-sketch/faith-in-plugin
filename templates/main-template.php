<?php
/**
 * Public shortcode template for Curated Vault.
 * Keep this as a fragment. WordPress already renders <html>, <head>, and <body>.
 */
if (!defined('ABSPATH')) {
    exit;
}
?>
<style id="cv-standalone-theme-chrome-killer">
    /* v5.5.94 - Standalone Faith In app/login page. Remove WordPress theme header/footer chrome even when body_class/page detection misses. */
    html.cv-faith-in-app-page,
    html.cv-faith-in-app-page body,
    html:has(body .curated-vault-premium-wrap),
    html:has(body #cv-root),
    html:has(body #cv-social-mvp),
    body:has(.curated-vault-premium-wrap),
    body:has(#cv-root),
    body:has(#cv-social-mvp) {
        margin: 0 !important;
        margin-top: 0 !important;
        padding: 0 !important;
        padding-top: 0 !important;
        width: 100% !important;
        max-width: none !important;
        overflow-x: hidden !important;
        background: #fff !important;
    }

    body:has(.curated-vault-premium-wrap) > header,
    body:has(.curated-vault-premium-wrap) > footer,
    body:has(.curated-vault-premium-wrap) #masthead,
    body:has(.curated-vault-premium-wrap) #colophon,
    body:has(.curated-vault-premium-wrap) .site-header,
    body:has(.curated-vault-premium-wrap) .site-footer,
    body:has(.curated-vault-premium-wrap) .entry-header,
    body:has(.curated-vault-premium-wrap) .page-header,
    body:has(.curated-vault-premium-wrap) .entry-title,
    body:has(.curated-vault-premium-wrap) .page-title,
    body:has(.curated-vault-premium-wrap) .wp-block-template-part,
    body:has(.curated-vault-premium-wrap) .wp-block-site-logo,
    body:has(.curated-vault-premium-wrap) .wp-block-site-title,
    body:has(.curated-vault-premium-wrap) .wp-block-navigation,
    body:has(.curated-vault-premium-wrap) .site-branding,
    body:has(.curated-vault-premium-wrap) .main-navigation,
    body:has(.curated-vault-premium-wrap) .primary-navigation,
    body:has(.curated-vault-premium-wrap) .secondary-navigation,
    body:has(.curated-vault-premium-wrap) .custom-logo-link,
    body:has(.curated-vault-premium-wrap) .menu-toggle,
    body:has(#cv-social-mvp) > header,
    body:has(#cv-social-mvp) > footer,
    body:has(#cv-social-mvp) #masthead,
    body:has(#cv-social-mvp) #colophon,
    body:has(#cv-social-mvp) .site-header,
    body:has(#cv-social-mvp) .site-footer,
    body:has(#cv-social-mvp) .entry-header,
    body:has(#cv-social-mvp) .page-header,
    body:has(#cv-social-mvp) .entry-title,
    body:has(#cv-social-mvp) .page-title,
    body:has(#cv-social-mvp) .wp-block-template-part,
    body:has(#cv-social-mvp) .wp-block-site-logo,
    body:has(#cv-social-mvp) .wp-block-site-title,
    body:has(#cv-social-mvp) .wp-block-navigation,
    body:has(#cv-social-mvp) .site-branding,
    body:has(#cv-social-mvp) .main-navigation,
    body:has(#cv-social-mvp) .primary-navigation,
    body:has(#cv-social-mvp) .secondary-navigation,
    body:has(#cv-social-mvp) .custom-logo-link,
    body:has(#cv-social-mvp) .menu-toggle {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        min-height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        border: 0 !important;
        overflow: hidden !important;
    }

    body:has(.curated-vault-premium-wrap) .wp-site-blocks > *:not(:has(.curated-vault-premium-wrap)):not(:has(#cv-root)):not(#wpadminbar),
    body:has(#cv-social-mvp) .wp-site-blocks > *:not(:has(#cv-social-mvp)):not(#wpadminbar),
    html.cv-faith-in-app-page .cv-theme-chrome-hidden {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        min-height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        border: 0 !important;
        overflow: hidden !important;
    }

    html.cv-faith-in-app-page .wp-site-blocks,
    html.cv-faith-in-app-page .site,
    html.cv-faith-in-app-page .site-content,
    html.cv-faith-in-app-page .content-area,
    html.cv-faith-in-app-page main,
    html.cv-faith-in-app-page article,
    html.cv-faith-in-app-page .entry-content,
    html.cv-faith-in-app-page .wp-block-post-content,
    body:has(.curated-vault-premium-wrap) .wp-site-blocks,
    body:has(.curated-vault-premium-wrap) .site,
    body:has(.curated-vault-premium-wrap) .site-content,
    body:has(.curated-vault-premium-wrap) .content-area,
    body:has(.curated-vault-premium-wrap) main,
    body:has(.curated-vault-premium-wrap) article,
    body:has(.curated-vault-premium-wrap) .entry-content,
    body:has(.curated-vault-premium-wrap) .wp-block-post-content,
    body:has(#cv-social-mvp) .wp-site-blocks,
    body:has(#cv-social-mvp) .site,
    body:has(#cv-social-mvp) .site-content,
    body:has(#cv-social-mvp) .content-area,
    body:has(#cv-social-mvp) main,
    body:has(#cv-social-mvp) article,
    body:has(#cv-social-mvp) .entry-content,
    body:has(#cv-social-mvp) .wp-block-post-content {
        margin: 0 !important;
        padding: 0 !important;
        max-width: none !important;
        width: 100% !important;
    }

    html.cv-faith-in-app-page .curated-vault-premium-wrap,
    body:has(.curated-vault-premium-wrap) .curated-vault-premium-wrap,
    html.cv-faith-in-app-page #cv-social-mvp,
    body:has(#cv-social-mvp) #cv-social-mvp {
        margin: 0 !important;
        padding: 0 !important;
        max-width: none !important;
        width: 100% !important;
        min-height: 100vh !important;
    }

    /* v5.5.149 - remove admin-bar/blank top strip above the app header. */
    html.cv-faith-in-app-page #wpadminbar,
    body:has(.curated-vault-premium-wrap) #wpadminbar,
    body:has(#cv-root) #wpadminbar,
    body:has(#cv-social-mvp) #wpadminbar {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        min-height: 0 !important;
        max-height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
    }

    html.cv-faith-in-app-page .glass-nav.cv-fixed-clean-nav,
    body:has(.curated-vault-premium-wrap) .glass-nav.cv-fixed-clean-nav,
    body:has(#cv-root) #cv-root .glass-nav.cv-fixed-clean-nav,
    body:has(#cv-social-mvp) #cv-social-mvp .glass-nav.cv-fixed-clean-nav {
        top: 0 !important;
    }


    /* v5.5.149 - compact header spacing fallback. */
    html,
    html.cv-faith-in-app-page,
    html:has(body .curated-vault-premium-wrap),
    html:has(body #cv-root),
    html:has(body #cv-social-mvp),
    body.cv-faith-in-platform,
    body:has(.curated-vault-premium-wrap),
    body:has(#cv-root),
    body:has(#cv-social-mvp) {
        margin-top: 0 !important;
        padding-top: 0 !important;
    }
    #wpadminbar {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        min-height: 0 !important;
        max-height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
    }
    .glass-nav.cv-fixed-clean-nav,
    .cv-fixed-clean-nav,
    #cv-root .glass-nav.cv-fixed-clean-nav,
    #cv-social-mvp .glass-nav.cv-fixed-clean-nav,
    .curated-vault-premium-wrap .glass-nav.cv-fixed-clean-nav {
        top: 0 !important;
        margin-top: 0 !important;
        padding-top: 0 !important;
        min-height: 58px !important;
        height: 58px !important;
        max-height: 58px !important;
    }
    .curated-vault-premium-wrap,
    #cv-root,
    #cv-social-mvp {
        padding-top: 58px !important;
    }
    .glass-nav.cv-fixed-clean-nav .cv-nav-shell,
    #cv-root .cv-react-nav-shell,
    #cv-social-mvp .cv-nav-shell,
    .curated-vault-premium-wrap .cv-nav-shell {
        height: 58px !important;
        min-height: 58px !important;
        max-height: 58px !important;
        padding-top: 0 !important;
        padding-bottom: 0 !important;
        align-items: center !important;
    }


    /* v5.5.149 - zero top-space nav hard fallback. */
    html.cv-faith-in-app-page,
    html:has(body .curated-vault-premium-wrap),
    html:has(body #cv-root),
    html:has(body #cv-social-mvp),
    body.cv-faith-in-platform,
    body:has(.curated-vault-premium-wrap),
    body:has(#cv-root),
    body:has(#cv-social-mvp) {
        margin: 0 !important;
        margin-top: 0 !important;
        padding: 0 !important;
        padding-top: 0 !important;
        top: 0 !important;
        width: 100% !important;
        max-width: none !important;
        overflow-x: hidden !important;
    }
    #wpadminbar,
    html.cv-faith-in-app-page #wpadminbar,
    body.cv-faith-in-platform #wpadminbar,
    body:has(.curated-vault-premium-wrap) #wpadminbar,
    body:has(#cv-root) #wpadminbar,
    body:has(#cv-social-mvp) #wpadminbar {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        min-height: 0 !important;
        max-height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        border: 0 !important;
        overflow: hidden !important;
    }
    .glass-nav.cv-fixed-clean-nav,
    .cv-fixed-clean-nav,
    .cv-react-global-nav,
    #cv-root .glass-nav.cv-fixed-clean-nav,
    #cv-social-mvp .glass-nav.cv-fixed-clean-nav,
    .curated-vault-premium-wrap .glass-nav.cv-fixed-clean-nav {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: auto !important;
        width: 100% !important;
        max-width: 100vw !important;
        margin: 0 !important;
        margin-top: 0 !important;
        padding: 0 !important;
        padding-top: 0 !important;
        min-height: 58px !important;
        height: 58px !important;
        max-height: 58px !important;
        transform: none !important;
        z-index: 999999 !important;
        overflow: visible !important;
    }
    .curated-vault-premium-wrap,
    #cv-root,
    #cv-social-mvp {
        margin-top: 0 !important;
        padding-top: 58px !important;
    }
    .glass-nav.cv-fixed-clean-nav .cv-nav-shell,
    .cv-fixed-clean-nav .cv-nav-shell,
    #cv-root .cv-react-nav-shell,
    #cv-social-mvp .cv-nav-shell,
    .curated-vault-premium-wrap .cv-nav-shell {
        height: 58px !important;
        min-height: 58px !important;
        max-height: 58px !important;
        margin-top: 0 !important;
        padding-top: 0 !important;
        padding-bottom: 0 !important;
        align-items: center !important;
    }
    .cv-faith-in-kill-space,
    .cv-theme-chrome-hidden,
    .cv-theme-top-spacer-hidden {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        min-height: 0 !important;
        max-height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        border: 0 !important;
        overflow: hidden !important;
    }



    /* v5.5.149 - mobile no-space override: header starts immediately at the top on phones. */
    @media (max-width: 900px), (hover: none) and (pointer: coarse) {
        html.cv-faith-in-app-page,
        html:has(body .curated-vault-premium-wrap),
        html:has(body #cv-root),
        html:has(body #cv-social-mvp),
        body.cv-faith-in-platform,
        body:has(.curated-vault-premium-wrap),
        body:has(#cv-root),
        body:has(#cv-social-mvp),
        .curated-vault-premium-wrap,
        #cv-root,
        #cv-social-mvp {
            margin-top: 0 !important;
            padding-top: 0 !important;
            top: 0 !important;
        }
        .glass-nav.cv-fixed-clean-nav,
        .cv-fixed-clean-nav,
        .cv-react-global-nav,
        #cv-root .glass-nav.cv-fixed-clean-nav,
        #cv-social-mvp .glass-nav.cv-fixed-clean-nav,
        .curated-vault-premium-wrap .glass-nav.cv-fixed-clean-nav {
            position: sticky !important;
            top: 0 !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            margin: 0 !important;
            padding: 0 !important;
        }
        .glass-nav.cv-fixed-clean-nav .cv-nav-shell,
        #cv-root .cv-react-nav-shell,
        #cv-social-mvp .cv-nav-shell,
        .curated-vault-premium-wrap .cv-nav-shell {
            display: none !important;
            height: 0 !important;
            min-height: 0 !important;
            max-height: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: hidden !important;
        }
        .cv-nav-mobile-wrap,
        #cv-root .cv-react-mobile-top,
        #cv-social-mvp .cv-react-mobile-top,
        .curated-vault-premium-wrap .cv-react-mobile-top {
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
            border-top: 0 !important;
        }
    }

</style>
<script id="cv-standalone-theme-chrome-killer-js">
(function () {
    function hasFaithInApp(element) {
        return !!(element && element.querySelector && element.querySelector('.curated-vault-premium-wrap, #cv-root, #cv-social-mvp'));
    }

    function hideElement(element) {
        if (!element || element.id === 'wpadminbar') { return; }
        element.classList.add('cv-theme-chrome-hidden');
        element.setAttribute('aria-hidden', 'true');
        element.style.setProperty('display', 'none', 'important');
        element.style.setProperty('visibility', 'hidden', 'important');
        element.style.setProperty('height', '0', 'important');
        element.style.setProperty('min-height', '0', 'important');
        element.style.setProperty('margin', '0', 'important');
        element.style.setProperty('padding', '0', 'important');
        element.style.setProperty('border', '0', 'important');
        element.style.setProperty('overflow', 'hidden', 'important');
    }

    function looksLikeThemeChrome(element) {
        if (!element || hasFaithInApp(element) || element.id === 'wpadminbar') { return false; }
        var ident = ((element.id || '') + ' ' + (element.className || '') + ' ' + (element.getAttribute('role') || '')).toLowerCase();
        var text = (element.innerText || '').replace(/\s+/g, ' ').trim();
        if (/(masthead|colophon|site-header|site-footer|site-branding|main-navigation|primary-navigation|secondary-navigation|wp-block-template-part|wp-block-navigation|wp-block-site-logo|wp-block-site-title|entry-header|page-header|site-title|custom-logo|menu-toggle)/.test(ident)) {
            return true;
        }
        if (/^(Faith\s*In\.?|FaithIn\.?)$/i.test(text)) { return true; }
        if (/Designed with WordPress/i.test(text)) { return true; }
        if (/Location/i.test(text) && /Hours/i.test(text) && /Contact/i.test(text)) { return true; }
        return false;
    }

    function cleanFaithInPage() {

        function cvForceHeaderToViewportTopInline() {
            var app = document.querySelector('.curated-vault-premium-wrap, #cv-root, #cv-social-mvp');
            if (!app || !document.body) { return; }
            document.documentElement.classList.add('cv-faith-in-app-page');
            document.body.classList.add('cv-faith-in-platform');
            document.documentElement.style.setProperty('margin-top', '0', 'important');
            document.documentElement.style.setProperty('padding-top', '0', 'important');
            document.body.style.setProperty('margin', '0', 'important');
            document.body.style.setProperty('padding', '0', 'important');
            document.querySelectorAll('#wpadminbar').forEach(function (bar) {
                bar.classList.add('cv-theme-top-spacer-hidden');
                bar.setAttribute('aria-hidden', 'true');
                bar.style.setProperty('display', 'none', 'important');
                bar.style.setProperty('visibility', 'hidden', 'important');
                bar.style.setProperty('height', '0', 'important');
                bar.style.setProperty('min-height', '0', 'important');
                bar.style.setProperty('max-height', '0', 'important');
                bar.style.setProperty('margin', '0', 'important');
                bar.style.setProperty('padding', '0', 'important');
                bar.style.setProperty('border', '0', 'important');
                bar.style.setProperty('overflow', 'hidden', 'important');
            });
            document.querySelectorAll('.glass-nav.cv-fixed-clean-nav, .cv-fixed-clean-nav, .cv-react-global-nav').forEach(function (nav) {
                nav.style.setProperty('position', 'fixed', 'important');
                nav.style.setProperty('top', '0', 'important');
                nav.style.setProperty('left', '0', 'important');
                nav.style.setProperty('right', '0', 'important');
                nav.style.setProperty('bottom', 'auto', 'important');
                nav.style.setProperty('width', '100%', 'important');
                nav.style.setProperty('max-width', '100vw', 'important');
                nav.style.setProperty('margin', '0', 'important');
                nav.style.setProperty('padding', '0', 'important');
                nav.style.setProperty('min-height', '58px', 'important');
                nav.style.setProperty('height', '58px', 'important');
                nav.style.setProperty('max-height', '58px', 'important');
                nav.style.setProperty('transform', 'none', 'important');
                nav.style.setProperty('z-index', '999999', 'important');
            });
            document.querySelectorAll('.curated-vault-premium-wrap, #cv-root, #cv-social-mvp').forEach(function (node) {
                node.style.setProperty('margin-top', '0', 'important');
                node.style.setProperty('padding-top', '58px', 'important');
            });
            var node = app;
            while (node && node !== document.body && node !== document.documentElement) {
                var parent = node.parentElement;
                if (parent) {
                    parent.style.setProperty('margin-top', '0', 'important');
                    parent.style.setProperty('padding-top', '0', 'important');
                    parent.style.setProperty('border-top', '0', 'important');
                    Array.prototype.slice.call(parent.children).forEach(function (sibling) {
                        if (sibling === node || sibling.contains(app) || sibling.tagName === 'SCRIPT' || sibling.tagName === 'STYLE') { return; }
                        var isBefore = !!(sibling.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING);
                        if (isBefore) {
                            sibling.classList.add('cv-theme-top-spacer-hidden');
                            sibling.setAttribute('aria-hidden', 'true');
                            sibling.style.setProperty('display', 'none', 'important');
                            sibling.style.setProperty('visibility', 'hidden', 'important');
                            sibling.style.setProperty('height', '0', 'important');
                            sibling.style.setProperty('min-height', '0', 'important');
                            sibling.style.setProperty('max-height', '0', 'important');
                            sibling.style.setProperty('margin', '0', 'important');
                            sibling.style.setProperty('padding', '0', 'important');
                            sibling.style.setProperty('border', '0', 'important');
                            sibling.style.setProperty('overflow', 'hidden', 'important');
                        }
                    });
                }
                node = parent;
            }
        }
        cvForceHeaderToViewportTopInline();
        var app = document.querySelector('.curated-vault-premium-wrap, #cv-root, #cv-social-mvp');
        if (!app || !document.body) { return; }
        document.documentElement.classList.add('cv-faith-in-app-page');
        document.body.classList.add('cv-faith-in-platform');
        document.documentElement.style.setProperty('margin-top', '0', 'important');
        document.documentElement.style.setProperty('padding-top', '0', 'important');
        document.body.style.setProperty('margin-top', '0', 'important');
        document.body.style.setProperty('padding-top', '0', 'important');
        var cvAdminBar = document.getElementById('wpadminbar');
        if (cvAdminBar) {
            cvAdminBar.setAttribute('aria-hidden', 'true');
            cvAdminBar.style.setProperty('display', 'none', 'important');
            cvAdminBar.style.setProperty('visibility', 'hidden', 'important');
            cvAdminBar.style.setProperty('height', '0', 'important');
            cvAdminBar.style.setProperty('min-height', '0', 'important');
            cvAdminBar.style.setProperty('max-height', '0', 'important');
            cvAdminBar.style.setProperty('margin', '0', 'important');
            cvAdminBar.style.setProperty('padding', '0', 'important');
            cvAdminBar.style.setProperty('overflow', 'hidden', 'important');
        }

        var directSelectors = [
            'body > header', 'body > footer', '#masthead', '#colophon', '.site-header', '.site-footer',
            '.entry-header', '.page-header', '.entry-title', '.page-title', '.wp-block-template-part',
            '.wp-block-site-logo', '.wp-block-site-title', '.wp-block-navigation', '.site-branding',
            '.main-navigation', '.primary-navigation', '.secondary-navigation', '.custom-logo-link', '.menu-toggle'
        ];
        directSelectors.forEach(function (selector) {
            document.querySelectorAll(selector).forEach(function (element) {
                if (!hasFaithInApp(element)) { hideElement(element); }
            });
        });

        var node = app;
        while (node && node !== document.body) {
            var parent = node.parentElement;
            if (parent) {
                Array.prototype.slice.call(parent.children).forEach(function (sibling) {
                    if (sibling !== node && looksLikeThemeChrome(sibling)) { hideElement(sibling); }
                });
            }
            node = parent;
        }

        document.querySelectorAll('body *').forEach(function (element) {
            if (looksLikeThemeChrome(element)) { hideElement(element); }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', cleanFaithInPage);
    } else {
        cleanFaithInPage();
    }
    window.addEventListener('load', cleanFaithInPage);
    setTimeout(cleanFaithInPage, 50);
    setTimeout(cleanFaithInPage, 300);
})();
</script>
<div class="curated-vault-premium-wrap">
    <div id="cv-root" class="cv-app-shell w-full flex flex-col min-h-screen relative"></div>
    <div id="cv-toast-container" class="fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] flex flex-col gap-2 items-center pointer-events-none w-full max-w-md px-4"></div>
</div>

<script id="cv-body-top-mount-v55146">
(function(){
  function run(){
    var wrap=document.querySelector('.curated-vault-premium-wrap');
    if(!wrap||!document.body) return;
    document.documentElement.classList.add('cv-faith-in-app-page');
    document.body.classList.add('cv-faith-in-platform');
    document.documentElement.style.setProperty('margin','0','important');
    document.documentElement.style.setProperty('padding','0','important');
    document.body.style.setProperty('margin','0','important');
    document.body.style.setProperty('padding','0','important');
    if(wrap.parentElement!==document.body||document.body.firstElementChild!==wrap){
      document.body.insertBefore(wrap, document.body.firstChild || null);
    }
    wrap.classList.add('cv-body-mounted-app');
    wrap.style.setProperty('margin','0','important');
    wrap.style.setProperty('padding','0','important');
    wrap.style.setProperty('padding-top','58px','important');
    wrap.style.setProperty('width','100%','important');
    wrap.style.setProperty('max-width','none','important');
    var bar=document.getElementById('wpadminbar');
    if(bar){bar.classList.add('cv-theme-top-spacer-hidden');bar.style.setProperty('display','none','important');bar.style.setProperty('height','0','important');}
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run); else run();
  window.addEventListener('load',run);
  setTimeout(run,50); setTimeout(run,250); setTimeout(run,900);
})();
</script>

