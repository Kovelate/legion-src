((root, factory) => {
	const api = factory();
	if (typeof module === "object" && module.exports) module.exports = api;
	else if (root) {
		root.LGGuard = api;
		api.install(root);
	}
})(typeof self !== "undefined" ? self : this, () => {
	const HDR = "X-Legion-Guard";
	const under = new WeakMap();
	let home = null;
	let cur = null;
	let solved = 0;

	function kind(res) {
		let v = "";
		try {
			v = String(
				(res &&
					res.headers &&
					typeof res.headers.get === "function" &&
					res.headers.get(HDR)) ||
					"",
			);
		} catch (e) {
			return null;
		}
		const p = v.split(":");
		if (p[0] === "ban") return "ban";
		if (p[0] === "captcha" && p[1] !== "solved") return "captcha";
		return null;
	}

	const is = (v, C) => typeof C === "function" && v instanceof C;

	function reusable(input, init) {
		const b = init ? init.body : undefined;
		if (b === undefined || b === null)
			return !(
				typeof Request === "function" &&
				input instanceof Request &&
				input.body
			);
		return (
			typeof b === "string" ||
			is(b, typeof FormData !== "undefined" && FormData) ||
			is(b, typeof Blob !== "undefined" && Blob) ||
			is(b, typeof URLSearchParams !== "undefined" && URLSearchParams) ||
			is(b, typeof ArrayBuffer !== "undefined" && ArrayBuffer) ||
			(typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView(b))
		);
	}

	const NEVER = new Promise(() => {});

	function upper(win) {
		let found = null,
			w = win;
		for (let i = 0; i < 20; i++) {
			let p = null,
				g = null;
			try {
				p = w.parent;
				if (!p || p === w) break;
				g = p.LGGuard;
				if (
					!g ||
					g === api ||
					typeof g.open !== "function" ||
					typeof g.passed !== "function"
				)
					g = null;
			} catch (e) {
				break;
			}
			if (g) found = g;
			w = p;
		}
		return found;
	}

	function open(k, win) {
		win = win || home || (typeof window !== "undefined" ? window : null);
		if (k !== "captcha" && k !== "ban") return Promise.resolve();
		const up = win ? upper(win) : null;
		if (up) {
			if (k === "ban") {
				up.open("ban");
				return NEVER;
			}
			return typeof up.wait === "function"
				? viaUpper(up, win)
				: up.open("captcha");
		}
		if (k === "ban") {
			show("ban", win);
			return NEVER;
		}
		return new Promise((r) => {
			wait(r, win);
		});
	}

	function wait(fn, win) {
		const w = show("captcha", win);
		if (!w || w.kind === "ban") {
			fn();
			return () => {};
		}
		w.waiting.add(fn);
		return () => {
			w.waiting.delete(fn);
		};
	}

	function viaUpper(up, win) {
		return new Promise((ok) => {
			let fired = false,
				off = null;

			const gone = (e) => {
				if (e && e.persisted) return;
				win.removeEventListener("pagehide", gone);
				if (off) off();
				off = null;
			};
			off = up.wait(() => {
				fired = true;
				win.removeEventListener("pagehide", gone);
				ok();
			});
			if (!fired) win.addEventListener("pagehide", gone);
		});
	}

	function show(k, win) {
		win = win || home || (typeof window !== "undefined" ? window : null);
		if (cur) {
			if (k === "ban" && cur.kind !== "ban") banMode(cur);
			return cur;
		}
		const d = win && win.document;
		if (!d) return null;
		const dlg = d.createElement("dialog");
		const modal = typeof dlg.showModal === "function";
		const el = modal ? dlg : d.createElement("div"),
			box = d.createElement("div"),
			fr = d.createElement("iframe");
		const phone = !!(
			win.matchMedia && win.matchMedia("(max-width: 520px)").matches
		);
		const still = !!(
			win.matchMedia &&
			win.matchMedia("(prefers-reduced-motion: reduce)").matches
		);
		el.setAttribute("data-lg-guard", k);

		el.style.cssText =
			"position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;" +
			"margin:0;padding:0;border:0;width:100%;height:100%;max-width:none;max-height:none;overflow:hidden;color:inherit;" +
			"background:rgba(10,6,4,.55);opacity:0;" +
			(still ? "" : "transition:opacity .18s ease-out");
		if (modal) backdrop(d, win);

		box.style.cssText =
			"position:relative;width:calc(100% - " +
			(phone ? 12 : 16) +
			"px);height:calc(100% - " +
			(phone ? 12 : 16) +
			"px);" +
			(phone ? "" : "max-width:440px;max-height:560px;") +
			"transform:scale(.97);" +
			(still ? "" : "transition:transform .18s ease-out");
		fr.src = "/guard";
		fr.title = "Проверка";
		fr.style.cssText =
			"display:block;width:100%;height:100%;border:0;border-radius:12px;background:transparent";
		box.appendChild(fr);
		el.appendChild(box);
		const prev = d.activeElement;

		const shut = [];
		let watch = null;
		const lock = (c) => {
			if (c !== el && c.nodeType === 1 && !c.inert) {
				c.inert = true;
				shut.push(c);
			}
		};
		function manual() {
			if (watch || !d.body) return;
			el.setAttribute("role", "dialog");
			el.setAttribute("aria-modal", "true");
			for (const c of Array.prototype.slice.call(d.body.children)) lock(c);
			if (typeof win.MutationObserver === "function") {
				watch = new win.MutationObserver((recs) => {
					for (const r of recs)
						for (const n of Array.prototype.slice.call(r.addedNodes)) lock(n);
				});
				watch.observe(d.body, { childList: true });
			}
		}

		function onKey(e) {
			if (e.key === "Escape" || e.key === "Esc") {
				e.preventDefault();
				e.stopImmediatePropagation();
			}
		}
		function onCancel(e) {
			e.preventDefault();
		}
		function onClose() {
			if (cur !== w || el.open || !el.isConnected) return;
			if (!raise()) manual();
			fr.focus();
		}
		function raise() {
			try {
				el.showModal();
				return true;
			} catch (e) {
				return false;
			}
		}

		function onFocus(e) {
			if (e.target !== fr && !el.contains(e.target)) fr.focus();
		}
		const w = { kind: k, el, win, waiting: new Set(), end: null };
		function onMsg(e) {
			if (e.source !== fr.contentWindow || e.origin !== win.location.origin)
				return;

			if (!e.data || e.data.lgGuard !== "ok") return;
			solved++;
			w.end();
		}
		w.end = () => {
			if (cur !== w) return;
			cur = null;
			win.removeEventListener("message", onMsg);
			win.removeEventListener("keydown", onKey, true);
			d.removeEventListener("focusin", onFocus, true);
			if (watch) watch.disconnect();
			for (const c of shut) c.inert = false;
			if (modal) {
				el.removeEventListener("cancel", onCancel);
				el.removeEventListener("close", onClose);
				if (el.open) el.close();
			}
			if (el.parentNode) el.parentNode.removeChild(el);
			if (prev && typeof prev.focus === "function" && prev.isConnected)
				prev.focus();
			release(w);
		};
		win.addEventListener("message", onMsg);
		win.addEventListener("keydown", onKey, true);
		d.addEventListener("focusin", onFocus, true);
		cur = w;
		(d.body || d.documentElement).appendChild(el);
		if (modal) {
			el.addEventListener("cancel", onCancel);
			el.addEventListener("close", onClose);
		}
		if (!(modal && raise())) manual();
		fr.focus();
		void el.offsetWidth;
		el.style.opacity = "1";
		box.style.transform = "none";
		return w;
	}

	const lit = new WeakSet();
	function backdrop(d, win) {
		if (lit.has(d)) return;
		lit.add(d);
		try {
			const sh = new win.CSSStyleSheet();
			sh.replaceSync("dialog[data-lg-guard]::backdrop{background:transparent}");
			d.adoptedStyleSheets = Array.prototype.concat.call(
				Array.from(d.adoptedStyleSheets || []),
				[sh],
			);
		} catch (e) {}
	}

	function release(w) {
		const fns = Array.from(w.waiting);
		w.waiting.clear();
		for (const fn of fns) {
			try {
				fn();
			} catch (e) {
				if (typeof console !== "undefined" && console.warn)
					console.warn("LGGuard: ждавший окно упал", e);
			}
		}
	}

	function banMode(w) {
		const was = w.kind;
		w.kind = "ban";
		w.el.setAttribute("data-lg-guard", "ban");
		if (was !== "ban") {
			const fr = w.el.querySelector("iframe");
			if (fr) fr.src = "/guard";
			release(w);
		}
	}

	const RETRY_MS = 20000;
	const isTimeout = (r) => !!r && r.name === "TimeoutError";
	function signalOf(input, init) {
		if (init && init.signal) return init.signal;
		return typeof Request === "function" && input instanceof Request
			? input.signal
			: null;
	}

	function waitFor(p, sig) {
		if (!sig) return p;
		return new Promise((ok, no) => {
			const off = () => sig.removeEventListener("abort", on);
			function on() {
				if (!isTimeout(sig.reason)) {
					off();
					no(sig.reason);
				}
			}
			if (sig.aborted && !isTimeout(sig.reason)) {
				no(sig.reason);
				return;
			}
			sig.addEventListener("abort", on);
			p.then(() => {
				off();
				ok();
			});
		});
	}

	function retryInit(sig, init) {
		if (!sig || !sig.aborted) return init;
		if (!isTimeout(sig.reason)) throw sig.reason;
		const fresh =
			typeof AbortSignal !== "undefined" &&
			typeof AbortSignal.timeout === "function"
				? AbortSignal.timeout(RETRY_MS)
				: null;
		return Object.assign({}, init || {}, { signal: fresh });
	}

	function install(win) {
		if (!win || typeof win.fetch !== "function" || under.has(win.fetch)) return;
		const base = win.fetch;
		home = win;
		const passes = () => {
			const up = upper(win);
			return up && typeof up.passed === "function" ? up.passed() : solved;
		};
		const guarded = function fetch(input, init) {
			const seen = passes();
			return base.call(win, input, init).then((res) => {
				const k = kind(res);
				if (!k) return res;
				if (k === "ban") {
					open("ban", win);
					return res;
				}
				if (!reusable(input, init)) return res;

				const sig = signalOf(input, init);
				const ready =
					passes() !== seen ? Promise.resolve() : open("captcha", win);
				return waitFor(ready, sig)
					.then(() => base.call(win, input, retryInit(sig, init)))
					.then((again) => {
						if (kind(again) === "ban") open("ban", win);
						return again;
					});
			});
		};
		under.set(guarded, base);
		win.fetch = guarded;
	}

	const api = {
		install,
		kind,
		open,
		wait: (fn) => wait(fn),
		passed: () => solved,
		under: (fn) => under.get(fn) || null,
	};
	return api;
});
