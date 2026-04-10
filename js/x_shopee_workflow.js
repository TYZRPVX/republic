// ==UserScript==
// @name         X Shopee WorkFlow
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Auto-login and UI tweaks for Shopee internal tools
// @author       X
// @match        *://*.shopee.io/*
// @match        *://*.seatalkweb.com/*
// @match        *://accounts.google.com/*
// @run-at       document-end
// @icon         https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/shopee-icon.png
// @grant        unsafeWindow
// @grant        GM_setClipboard
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @require      https://cdn.jsdelivr.net/gh/TYZRPVX/republic@main/js/x_common.js
// @require      https://cdn.jsdelivr.net/gh/TYZRPVX/republic@main/js/x_shopee_workflow.js
// ==/UserScript==

// ── Auto Login ───────────────────────────────────────────

function autoLoginWithCookie(cookieName, selector, getUrl) {
	var attempts = getCookie(cookieName) || 0;
	attempts++;
	if (attempts < 3) {
		setTimeout(() => {
			const url = getUrl(selector);
			if (url) redirectTo(url);
		}, 500);
	} else {
		alert("Login attempts: " + attempts);
	}
	setCookie(cookieName, attempts, 60 * 1000);
}

function autoClick() {
	const url = window.location.href;

	if (/confluence\.shopee\.io\/login\.action/.test(url)) {
		autoLoginWithCookie("confluence-login", "#use_idp_button_js", (sel) => {
			const el = document.getElementById(sel.replace('#', ''));
			return el?.href;
		});
	}

	if (/accounts\.google\.com/.test(url) && (/shopee|seatalk/.test(url))) {
		setTimeout(() => {
			const el = document.querySelector('[data-email$="@shopee.com"]');
			if (el) el.click();
		}, 500);
	}

	if (/jira\.shopee\.io\/login\.jsp/.test(url)) {
		autoLoginWithCookie("jira-login", "#login-form .buttons-container button", (sel) => {
			const el = document.querySelector(sel);
			return el?.getAttribute("data-authurl");
		});
	}
}

// ── SeaTalk ──────────────────────────────────────────────

function hackSeaTalk() {
	if (!/seatalkweb/.test(X.site)) return;

	const main = document.querySelector("#root .home-main-window");
	if (main) {
		main.style.width = "100%";
		main.style.height = "100%";
	}
	hideSelector(".ant-notification");
}

// ── Confluence ───────────────────────────────────────────

function hackConfluence() {
	if (!/confluence/.test(X.site)) return;
	try {
		hideSelector("#wm");
	} catch (_) {}
}

// ── Alert Platform ───────────────────────────────────────

function betterAlertPlatform() {
	if (!/monitoring\.infra\..+\.shopee\.io/.test(X.site)) return;

	const TITLE_MAP = {
		"/alert-rules": "Alert Rules",
		"/alerts": "Alerts List",
		"/mute-strategies": "Mute Strategies",
	};

	for (const [path, subtitle] of Object.entries(TITLE_MAP)) {
		if (X.site.includes(path)) {
			document.title = `${subtitle} - Alert Platform`;
			break;
		}
	}
}

// ── Entry Point ──────────────────────────────────────────

function main() {
	autoClick();
	setTimeout(() => {
		hackSeaTalk();
		hackConfluence();
		betterAlertPlatform();
	}, 1400);
}
