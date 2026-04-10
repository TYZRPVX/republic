// ==UserScript==
// @name         X Hack CSS
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Common utilities + CSS platform injection + read mode
// @author       X
// @match        http://*/*
// @match        https://*/*
// @run-at       document-start
// @icon         https://cdn1.iconfinder.com/data/icons/logotypes/32/badge-css-3-128.png
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @require      https://cdn.jsdelivr.net/gh/TYZRPVX/republic@main/js/x_common.js
// ==/UserScript==

// DEV: @require file:///<local-path>/x_common.js

// ── Logging ──────────────────────────────────────────────

var logBinder = console.log.bind(console);
var isDebug = true;
var debug = isDebug ? console.log.bind(console) : function () { };

function log(message) {
	logBinder("[AllInOne] " + message);
}

// ── Site Context ─────────────────────────────────────────

const X = {
	get site() {
		return window.location.href;
	},
	get platform() {
		return navigator.userAgentData.platform;
	},
	get isWeekend() {
		const day = new Date().getDay();
		return day === 0 || day === 6;
	}
};

// ── Cookie Helpers ───────────────────────────────────────

function setCookie(name, value, millis) {
	var exdate = new Date();
	exdate.setTime(exdate.getTime() + millis);
	var cookieValue = encodeURIComponent(value) + ((millis == null) ? "" : "; expires=" + exdate.toUTCString());
	document.cookie = name + "=" + cookieValue;
}

function getCookie(name) {
	var cookies = document.cookie.split(";");
	for (var i = 0; i < cookies.length; i++) {
		var key = cookies[i].substr(0, cookies[i].indexOf("=")).replace(/^\s+|\s+$/g, "");
		if (key === name) {
			var rawValue = cookies[i].substr(cookies[i].indexOf("=") + 1);
			try {
				return decodeURIComponent(rawValue);
			} catch (e) {
				return rawValue;
			}
		}
	}
}

// ── Read Mode ────────────────────────────────────────────

function readModeCss(op) {
	setCookie('read-mode', op, 30 * 24 * 60 * 60 * 1000);
	if (op === "+") {
		document.documentElement.classList.add('read-mode');
	} else {
		document.documentElement.classList.remove('read-mode');
	}
}

// ── Navigation ───────────────────────────────────────────

function redirectTo(url) {
	window.location.href = url;
}

// ── UI Helpers ───────────────────────────────────────────

function showToast(message) {
	const el = document.createElement('div');
	el.style.cssText = `
		position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
		background-color: #333; color: #fff; padding: 10px 20px;
		border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.3);
		z-index: 9999; opacity: 0; transition: opacity 0.5s ease-in-out;
	`;
	el.innerText = message;
	document.body.appendChild(el);
	el.offsetHeight;
	el.style.opacity = '1';
	setTimeout(() => { el.style.opacity = '0'; }, 2000);
	setTimeout(() => { document.body.removeChild(el); }, 2500);
}

function setZoom(level) {
	document.body.style.zoom = level + "%";
}

function hideSelector(selector) {
	document.querySelectorAll(selector).forEach(el => {
		el.style.display = 'none';
	});
}

// ── Favicon & Title ──────────────────────────────────────

function changeFaviconWithRegex(siteRegex, faviconUrl) {
	if (siteRegex.test(window.location.href)) {
		var link = document.querySelector('link[rel="icon"]') || document.createElement('link');
		link.type = 'image/x-icon';
		link.rel = 'icon';
		link.href = faviconUrl;
		document.head.appendChild(link);
	}
}

function changeTitleWithRegex(siteRegex, prefix, title) {
	if (siteRegex.test(window.location.href) && !title.startsWith(prefix)) {
		document.title = `${prefix}${title}`;
		log(`title: ${title}`);
	}
}

// ── Theme Color (PWA) ────────────────────────────────────

function changeThemeColor(color) {
	let meta = document.querySelector('meta[name="theme-color"]');
	if (meta) {
		meta.setAttribute('content', color);
	} else {
		meta = document.createElement('meta');
		meta.setAttribute('name', 'theme-color');
		meta.setAttribute('content', color);
		document.head.appendChild(meta);
	}
}

// ── x_hack_css.js (merged) ──────────────────────────────
// Platform class injection + read mode toggle menu

function main() {
	document.documentElement.classList.add(X.platform);

	if (typeof GM_registerMenuCommand !== 'undefined') {
		GM_registerMenuCommand("[+] Read Mode On", () => readModeCss("+"));
		GM_registerMenuCommand("[-] Read Mode Off", () => readModeCss("-"));
	}
}
