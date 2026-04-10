// ==UserScript==
// @name         X Copy MarkDown
// @namespace    https://gist.github.com/vhxubo/e94b0cceadf0291050f05ab1c0bb19c9
// @homepage     https://gist.github.com/vhxubo/e94b0cceadf0291050f05ab1c0bb19c9
// @version      0.6
// @description  Copy page title & URL in various formats (Markdown, Rich, Plain)
// @author       X
// @match        http://*/*
// @match        https://*/*
// @icon         https://cdn.iconscout.com/icon/free/png-128/markdown-486861-2364930.png
// @grant        GM_registerMenuCommand
// @grant        GM_setClipboard
// @run-at       document-idle
// @require      https://cdn.jsdelivr.net/gh/TYZRPVX/republic@main/js/x_common.js
// @require      https://cdn.jsdelivr.net/gh/TYZRPVX/republic@main/js/x_copy_markdown.js
// ==/UserScript==

// DEV: @require file:///<local-path>/x_common.js
// DEV: @require file:///<local-path>/x_copy_markdown.js

// ── Format Definitions ──────────────────────────────────

const FORMAT = {
	MARKDOWN:   "MarkDown",
	TITLE_ONLY: "TitleOnly",
	URL_ONLY:   "UrlOnly",
	TITLE_URL:  "TitleUrl",
	RICH_TITLE: "RichTitle",
};

// ── Copy Logic ───────────────────────────────────────────

function getSiteName(url) {
	let hostname = new URL(url).hostname.replace(/^www\./, '');
	return hostname.split('.')[0];
}

function copyAs(format) {
	const title = document.title;
	const url = document.URL;
	const site = getSiteName(url);
	let text = "";

	switch (format) {
		case FORMAT.MARKDOWN:
			text = (title.search("[|-]") === -1)
				? `[${title} - ${site}](${url})`
				: `[${title}](${url})`;
			GM_setClipboard(text);
			break;

		case FORMAT.TITLE_ONLY:
			text = title;
			GM_setClipboard(text, 'text');
			break;

		case FORMAT.URL_ONLY:
			text = url;
			GM_setClipboard(text, 'text');
			break;

		case FORMAT.RICH_TITLE:
			GM_setClipboard(`<a href="${url}">${title}</a>`, 'html');
			text = `//  ${title}  //`;
			break;

		case FORMAT.TITLE_URL:
			text = `${title} - ${url}`;
			GM_setClipboard(text);
			break;
	}

	showToast(text);
}

// ── Popup Menu ───────────────────────────────────────────

function createCopyMenu() {
	const items = [
		{ label: 'MarkDown [Title](URL)', format: FORMAT.MARKDOWN,   key: 'K' },
		{ label: 'Title with URL',        format: FORMAT.TITLE_URL,  key: 'U' },
		{ label: 'Rich Title (HTML)',      format: FORMAT.RICH_TITLE, key: ''  },
		{ label: 'Only Plain Title',       format: FORMAT.TITLE_ONLY, key: ''  },
		{ label: 'Only URL',              format: FORMAT.URL_ONLY,   key: ''  },
	];

	let selected = 0;
	let menuEl = null;

	function show() {
		if (menuEl) return;

		menuEl = document.createElement('div');
		menuEl.style.cssText = `
			position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%);
			background: #2b2b2b; border: 2px solid #555; border-radius: 8px;
			padding: 10px; z-index: 999999; box-shadow: 0 4px 20px rgba(0,0,0,0.5);
			font-family: monospace; min-width: 300px;
		`;

		const header = document.createElement('div');
		header.textContent = 'Copy Format';
		header.style.cssText = 'color:#fff; font-weight:bold; padding:8px; border-bottom:1px solid #555; margin-bottom:5px;';
		menuEl.appendChild(header);

		items.forEach((item, i) => {
			const row = document.createElement('div');
			row.textContent = `${item.label}${item.key ? ' (Alt+' + item.key + ')' : ''}`;
			row.style.cssText = 'padding:8px 12px; color:#ddd; cursor:pointer; border-radius:4px; margin:2px 0;';
			row.dataset.index = i;
			row.onmouseover = () => { selected = i; highlight(); };
			row.onclick = () => execute(item.format);
			menuEl.appendChild(row);
		});

		document.body.appendChild(menuEl);
		highlight();
	}

	function highlight() {
		if (!menuEl) return;
		menuEl.querySelectorAll('div[data-index]').forEach((el, i) => {
			el.style.background = (i === selected) ? '#0078d4' : 'transparent';
			el.style.color = (i === selected) ? '#fff' : '#ddd';
		});
	}

	function hide() {
		if (menuEl) { menuEl.remove(); menuEl = null; }
	}

	function execute(format) {
		hide();
		copyAs(format);
	}

	function onKey(e) {
		if (!menuEl) return;
		switch (e.key) {
			case 'ArrowDown': e.preventDefault(); selected = (selected + 1) % items.length; highlight(); break;
			case 'ArrowUp':   e.preventDefault(); selected = (selected - 1 + items.length) % items.length; highlight(); break;
			case 'Enter':     e.preventDefault(); execute(items[selected].format); break;
			case 'Escape':    e.preventDefault(); hide(); break;
		}
	}

	return { show, hide, onKey };
}

// ── Entry Point ──────────────────────────────────────────

function main() {
	if (window.top !== window.self) return;

	const menu = createCopyMenu();

	GM_registerMenuCommand("MarkDown [Title](URL)", () => copyAs(FORMAT.MARKDOWN));
	GM_registerMenuCommand("Rich Title (HTML)",     () => copyAs(FORMAT.RICH_TITLE));
	GM_registerMenuCommand("Title with URL",        () => copyAs(FORMAT.TITLE_URL));
	GM_registerMenuCommand("Only Plain Title",      () => copyAs(FORMAT.TITLE_ONLY));

	document.addEventListener("keydown", (e) => {
		menu.onKey(e);

		const key = e.key.toLowerCase();
		if (e.altKey && e.shiftKey && key === "k") {
			e.preventDefault();
			menu.show();
			return;
		}
		if (e.altKey && !e.shiftKey && key === "k") copyAs(FORMAT.MARKDOWN);
		if (e.altKey && !e.shiftKey && key === "u") copyAs(FORMAT.TITLE_URL);
	});
}
