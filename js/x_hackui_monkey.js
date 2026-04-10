// ==UserScript==
// @name         X HackUI Monkey
// @namespace    http://tampermonkey.net/
// @version      0.6
// @description  UI tweaks for various websites
// @author       X
// @match        *://*.m-team.cc/*
// @match        *://twitter.com/*
// @match        *://*.telegram.org/*
// @match        *://*.oschina.net/*
// @match        *://*.dida365.com/*
// @match        *://*.notion.so/*
// @match        *://*.chatgpt.com/*
// @match        *://*.cloud.tencent.com/*
// @run-at       document-body
// @icon         https://cdn0.iconfinder.com/data/icons/fitness-95/24/weightlifting-128.png
// @grant        unsafeWindow
// @grant        GM_setClipboard
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @require      https://cdn.jsdelivr.net/gh/TYZRPVX/republic@main/js/x_common.js
// @require      https://cdn.jsdelivr.net/gh/TYZRPVX/republic@main/js/x_hackui_monkey.js
// ==/UserScript==

// ── Focus Guard ──────────────────────────────────────────
// Redirect distracting sites to a reading app

function limitVisitSomeSites() {
	const distractors = /douyin|twitter|oschina/;
	if (distractors.test(X.site)) {
		log("distraction blocked: " + X.site);
		setTimeout(() => redirectTo("https://weread.qq.com/web/shelf"), 2000);
	}
}

// ── M-Team ───────────────────────────────────────────────

function handleMTeam() {
	if (!/kp\.m-team\.cc/.test(X.site)) return;

	const dismissModals = () => {
		hideSelector('.ant-modal-mask');
		hideSelector('.ant-modal-wrap');
	};

	dismissModals();

	const enforceHabit = () => {
		if (/usercp/.test(X.site)) {
			if (!X.isWeekend) {
				redirectTo("https://www.notion.so");
			} 
		}
	};

	setInterval(enforceHabit, 10000);
}

// ── Dida365 (TickTick CN) ────────────────────────────────

function handleDida() {
	if (!/dida365/.test(X.site)) return;

	changeThemeColor("#26325c");

	let idleTimer = null;
	const IDLE_TIMEOUT = 3 * 60 * 1000;

	const clickHabitSidebar = () => {
		const icon = document.querySelector('.icon-habit-sidebar');
		if (icon) {
			const target = icon.closest('div, button, a') || icon;
			target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
			log('auto-clicked habit sidebar');
		}
	};

	const resetIdle = () => {
		clearTimeout(idleTimer);
		idleTimer = setTimeout(clickHabitSidebar, IDLE_TIMEOUT);
	};

	['mousemove', 'keydown', 'scroll', 'click'].forEach(evt => {
		document.addEventListener(evt, resetIdle, { passive: true });
	});
	resetIdle();
}

// ── Notion ───────────────────────────────────────────────

function handleNotion() {
	if (!/notion\.so\/.+/.test(X.site)) return;

	changeThemeColor("#dde3e9");

	const cookie = getCookie('read-mode');
	readModeCss(cookie);

	const scrollEl = document.querySelector("#scroll-properties");
	if (scrollEl) scrollEl.textContent = "";

	const hideAd = () => {
		try {
			const adDiv = document.querySelector(".autolayout-fill-width")?.parentElement?.parentElement;
			if (adDiv) adDiv.style.display = 'none';
		} catch (_) {}
	};

	const updateTitle = () => {
		if (X.platform === 'macOS') {
			changeTitleWithRegex(/notion\.so\/.+/, "Playground - ", document.title);
		}
	};

	setInterval(hideAd, 10000);
	setInterval(updateTitle, 10000);
}

// ── ChatGPT ──────────────────────────────────────────────

function handleChatGPT() {
	if (!/chatgpt\.com/.test(X.site)) return;

	const styles = getComputedStyle(document.documentElement);
	const bg = styles.getPropertyValue('--theme-submit-btn-bg');
	changeThemeColor(bg || "#0285ff");
}

// ── Zoom Map ─────────────────────────────────────────────

const URL_ZOOM_MAP = {
	"cloud.tencent.com": 125,
};

function applyZoom() {
	for (const [pattern, level] of Object.entries(URL_ZOOM_MAP)) {
		if (X.site.includes(pattern)) {
			setZoom(level);
			break;
		}
	}
}

// ── Entry Point ──────────────────────────────────────────

function main() {
	limitVisitSomeSites();

	setTimeout(() => {
		handleNotion();
		handleDida();
		handleMTeam();
		handleChatGPT();
		applyZoom();
	}, 3000);
}
