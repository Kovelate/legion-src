((root) => {
	const MAX = 8,
		NICK = /^[a-z0-9_]{1,25}$/,
		KEEP = 200;
	const esc = (s) =>
		String(s ?? "").replace(
			/[&<>"']/g,
			(c) =>
				({
					"&": "&amp;",
					"<": "&lt;",
					">": "&gt;",
					'"': "&quot;",
					"'": "&#39;",
				})[c],
		);
	const S = {
		ctx: null,
		me: "",
		ch: "",
		tabs: [],
		active: null,
		fold: false,
		conv: new Map(),
		more: new Map(),
		un: new Map(),
		names: new Map(),
		dmBan: null,
		docks: new Map(),
		el: null,
		fl: null,
		host: null,
		pend: false,
		shut: false,
		listen: new Map(),
		sending: false,
		rep: false,
		blk: new Set(),
	};
	const key = () => `lgDm:${S.ch}:${S.me}`;
	const nick = (x) => {
		const l = String(x ?? "")
			.toLowerCase()
			.replace(/^@/, "")
			.trim();
		return NICK.test(l) ? l : null;
	};

	function save() {
		if (!S.me) return;
		try {
			root.localStorage.setItem(
				key(),
				JSON.stringify({
					tabs: S.tabs,
					active: S.active,
					...(S.fold ? { fold: 1 } : {}),
				}),
			);
		} catch (e) {}
	}
	function restore() {
		let v = null;
		try {
			v = JSON.parse(root.localStorage.getItem(key()) || "null");
		} catch (e) {
			v = null;
		}
		const tabs =
			v && Array.isArray(v.tabs)
				? [...new Set(v.tabs.map(nick).filter((x) => x && x !== S.me))].slice(
						0,
						MAX,
					)
				: [];
		S.tabs = tabs;
		S.active =
			v && tabs.includes(nick(v.active)) ? nick(v.active) : tabs[0] || null;
		S.fold = !!(v && v.fold);
	}

	function init(ctx) {
		S.ctx = ctx || S.ctx;
		const me = nick(S.ctx && S.ctx.me && S.ctx.me()) || "",
			ch = String((S.ctx && S.ctx.ch) || "").toLowerCase();
		if (me === S.me && ch === S.ch && S.inited) {
			place();
			return;
		}
		S.me = me;
		S.ch = ch;
		S.inited = true;
		S.conv = new Map();
		S.more = new Map();
		S.un = new Map();
		S.names = new Map();
		S.dmBan = null;
		S.blk = new Set();
		S.pat = null;
		S.syncAt = 0;
		if (!me) {
			S.tabs = [];
			S.active = null;
			place();
			return;
		}
		restore();
		if (S.active) load(S.active);
		place();
		fire();
	}

	function open(login, o = {}) {
		const l = nick(login);
		if (!l || !S.me || l === S.me) return false;
		if (o.name) S.names.set(l, String(o.name).slice(0, 40));
		if (!S.tabs.includes(l)) {
			S.tabs.push(l);
			while (S.tabs.length > MAX) {
				let i = S.tabs.findIndex((x) => x !== l && x !== S.active);
				if (i < 0) i = S.tabs.findIndex((x) => x !== l);
				const [gone] = S.tabs.splice(i, 1);
				S.conv.delete(gone);
				S.more.delete(gone);
				S.un.delete(gone);
			}
		}
		if (o.bg) {
			if (!S.active) S.active = l;
		} else {
			S.active = l;
			S.un.delete(l);
		}
		if (!S.more.has(l)) load(l);
		save();
		if (!o.bg) S.shut = false;
		if (o.show !== false && !o.bg) {
			S.fold = false;

			if (!S.listen.size && one()) {
				S.pend = true;
				if (S.ctx && S.ctx.showOne)
					try {
						S.ctx.showOne();
					} catch (e) {}
			}
			for (const f of S.listen.values())
				try {
					f("show");
				} catch (e) {}
		}
		place();
		render();
		fire();
		return true;
	}
	function close(login) {
		const l = nick(login),
			i = S.tabs.indexOf(l);
		if (i < 0) return;
		if (S.pat) S.pat.set(l, Math.max(S.pat.get(l) || 0, lastAt(l)));
		S.tabs.splice(i, 1);
		S.un.delete(l);
		S.conv.delete(l);
		S.more.delete(l);
		if (S.active === l)
			S.active = S.tabs[Math.min(i, S.tabs.length - 1)] || null;
		save();
		place();
		render();
		fire();
	}
	function setActive(login) {
		const l = nick(login);
		if (!l || !S.tabs.includes(l)) return;
		S.active = l;
		S.un.delete(l);
		if (!S.more.has(l)) load(l);
		save();
		render(true);
		fire();
	}
	const unread = () => {
		let n = 0;
		for (const v of S.un.values()) n += v;
		return n;
	};

	function on(k, fn) {
		if (fn) {
			S.listen.set(k, fn);
			if (S.pend) {
				S.pend = false;
				setTimeout(() => {
					try {
						fn("show");
					} catch (e) {}
				}, 0);
			}
		} else S.listen.delete(k);
	}
	function fire() {
		for (const f of S.listen.values())
			try {
				f("change");
			} catch (e) {}
	}

	const add = (l, list, front) => {
		const L = S.conv.get(l) || [],
			ids = new Set(L.map((m) => m.id)),
			nw = list.filter((m) => m && m.id && !ids.has(m.id));
		const all = front ? [...nw, ...L] : [...L, ...nw];
		S.conv.set(l, all.slice(-KEEP));
		return nw.length;
	};
	async function load(l, older) {
		if (!S.ctx || !S.ctx.api) return;
		const L = S.conv.get(l),
			before = older && L && L.length ? L[0].id : "";
		const r = await S.ctx.api(
			`/api/dm?with=${encodeURIComponent(l)}${before ? "&before=" + encodeURIComponent(before) : ""}`,
		);
		if (!r || !r.ok) {
			if (S.active === l) err((r && r.error) || "переписка не загрузилась");
			return;
		}
		if (r.with && r.with.name) S.names.set(l, r.with.name);
		if (r.blocked) S.blk.add(l);
		else if (r.blocked === false) S.blk.delete(l);
		if (!S.conv.has(l)) S.conv.set(l, []);
		const n = add(l, r.list || [], !!older);
		S.more.set(l, !!r.more);
		if (S.active === l) render(!older);
		return n;
	}
	async function send(text) {
		const l = S.active,
			t = String(text || "").trim();
		if (!l || !t || S.sending || !S.ctx) return false;
		S.sending = true;
		const r = await S.ctx.api("/api/dm/say", { to: l, text: t });
		S.sending = false;
		if (r && r.ok && r.msg) {
			add(l, [r.msg]);
			render(true);
			return true;
		}
		const e = (r && r.error) || "не отправилось - нет связи";
		if (/закрыл тебе личку/.test(e)) S.dmBan = S.dmBan || { until: 0 };
		err(e);
		return false;
	}
	async function report(l, reason) {
		const r = await S.ctx.api("/api/dm/report", {
			login: l,
			reason: String(reason || "").slice(0, 300),
		});
		if (r && r.ok) {
			S.ctx.toast && S.ctx.toast("Жалоба отправлена модераторам канала");
			return true;
		}
		err((r && r.error) || "не вышло");
		return false;
	}

	function onEvent(d) {
		if (!d || !S.me) return;
		if (d.me && "dmBan" in d.me) {
			S.dmBan = d.me.dmBan || null;
			err(
				S.dmBan ? "Модератор закрыл тебе личку" : "Личка снова открыта",
				!S.dmBan,
			);
			render();
		}
		const m = d.m;
		if (!m || !m.id) return;
		const mine = String(m.fl).toLowerCase() === S.me,
			l = nick(mine ? m.tl : m.fl);
		if (!l) return;
		if (!mine) S.names.set(l, String(m.fn || l));
		if (!mine) S.shut = false;
		if (S.pat) S.pat.set(l, Math.max(S.pat.get(l) || 0, +m.at || 0));
		const isNew = !S.tabs.includes(l);
		if (isNew) open(l, { bg: true });
		const n = add(l, [m]);
		if (n && !mine && !(S.active === l && visible()))
			S.un.set(l, (S.un.get(l) || 0) + 1);
		render(S.active === l);
		fire();
	}

	function lastAt(l) {
		const L = S.conv.get(l);
		return L && L.length ? +L[L.length - 1].at || 0 : 0;
	}
	async function resync() {
		if (!S.ctx || !S.ctx.api || !S.me) return false;
		const B = root.LGSiteUi && root.LGSiteUi.bg;
		if (B && B.state && B.state() === "hidden") {
			if (!S.bgOff && B.on)
				S.bgOff = B.on((st) => {
					if (st === "hidden") return;
					const off = S.bgOff;
					S.bgOff = null;
					if (off) off();
					resync();
				});
			return false;
		}
		if (S.syncing || Date.now() - (S.syncAt || 0) < 3000) return false;
		S.syncAt = Date.now();
		S.syncing = true;
		try {
			const me = S.me,
				r = await S.ctx.api("/api/dm/peers");
			if (!r || !r.ok || !Array.isArray(r.peers) || me !== S.me) return false;
			const ban = r.dmBan ? { until: +r.dmBan.until || 0 } : null;
			if (!!ban !== !!S.dmBan) S.dmBan = ban;
			const first = !S.pat,
				pat = S.pat || new Map(),
				want = [];
			for (const p of r.peers) {
				const l = nick(p && p.login);
				if (!l || l === S.me) continue;
				const at = +p.at || 0,
					mine = !!(p.last && p.last.mine),
					was = pat.get(l) || 0;
				pat.set(l, Math.max(was, at));
				if (p.name && !S.names.has(l))
					S.names.set(l, String(p.name).slice(0, 40));
				if (S.tabs.includes(l)) {
					if (S.conv.has(l) && at > lastAt(l)) want.push(l);
					continue;
				}
				if (first || mine || at <= was || S.blk.has(l)) continue;
				S.shut = false;
				open(l, { bg: true });
				S.un.set(l, (S.un.get(l) || 0) + 1);
			}
			S.pat = pat;
			for (const l of want) {
				const ids = new Set((S.conv.get(l) || []).map((m) => m.id));
				if (!(await load(l))) continue;
				const n = (S.conv.get(l) || []).filter(
					(m) => !ids.has(m.id) && String(m.fl).toLowerCase() !== S.me,
				).length;
				if (n) {
					S.shut = false;
					if (!(S.active === l && visible()))
						S.un.set(l, (S.un.get(l) || 0) + n);
				}
			}
			place();
			render();
			fire();
			return true;
		} finally {
			S.syncing = false;
		}
	}

	const D = () => root.document;

	const one = () => {
		try {
			return !!(S.ctx && S.ctx.one && S.ctx.one());
		} catch (e) {
			return false;
		}
	};
	const visible = () =>
		!!(
			S.el &&
			S.el.isConnected &&
			S.el.getClientRects &&
			S.el.getClientRects().length &&
			!(S.host === "float" && S.fold)
		);
	let HM = null;
	const hm = (t) => {
		try {
			HM =
				HM ||
				new Intl.DateTimeFormat("ru-RU", {
					hour: "2-digit",
					minute: "2-digit",
				});
			return HM.format(new Date(t));
		} catch (e) {
			return "";
		}
	};
	function build() {
		if (S.el || !D()) return S.el;
		const el = D().createElement("div");
		el.className = "dm";
		el.setAttribute("role", "region");
		el.setAttribute("aria-label", "Личные сообщения");
		el.innerHTML = `<div class="dm-tabs" role="tablist" aria-label="Собеседники"></div>
      <div class="dm-h" hidden><b class="dm-who"></b><span class="dm-acts"><button type="button" data-dma="report">Пожаловаться</button><button type="button" data-dma="block">Заблокировать</button></span></div>
      <form class="dm-rep" hidden autocomplete="off"><input type="text" maxlength="300" placeholder="Что случилось (не обязательно)" aria-label="Причина жалобы"><button type="submit">Отправить</button><button type="button" data-dma="repx">Отмена</button></form>
      <ol class="dm-l" role="log" aria-label="Переписка"></ol>
      <p class="dm-e" role="status"></p>
      <form class="dm-f" autocomplete="off"><input type="text" maxlength="200" enterkeyhint="send" placeholder="Лично…" aria-label="Личное сообщение"><button type="submit" aria-label="Отправить">➤</button></form>`;

		el.querySelector(".dm-tabs").addEventListener(
			"wheel",
			(e) => {
				const t = e.currentTarget;
				if (
					t.scrollWidth <= t.clientWidth ||
					Math.abs(e.deltaY) <= Math.abs(e.deltaX)
				)
					return;
				t.scrollLeft += e.deltaY;
				e.preventDefault();
			},
			{ passive: false },
		);
		el.querySelector(".dm-tabs").addEventListener("click", (e) => {
			const x = e.target.closest("[data-dmx]");
			if (x) {
				e.stopPropagation();
				close(x.dataset.dmx);
				return;
			}
			const b = e.target.closest("[data-dmt]");
			if (b) setActive(b.dataset.dmt);
		});
		el.querySelector(".dm-h").addEventListener("click", (e) => {
			const b = e.target.closest("[data-dma]");
			if (!b || !S.active) return;
			if (b.dataset.dma === "report") {
				S.rep = true;
				render();
				try {
					el.querySelector(".dm-rep input").focus({ preventScroll: true });
				} catch (e2) {}
			}
			if (b.dataset.dma === "block") block(S.active);
		});
		el.querySelector(".dm-rep").addEventListener("click", (e) => {
			if (e.target.closest('[data-dma="repx"]')) {
				S.rep = false;
				render();
			}
		});
		el.querySelector(".dm-rep").onsubmit = async (e) => {
			e.preventDefault();
			const i = e.target.querySelector("input");
			if (await report(S.active, i.value)) {
				i.value = "";
				S.rep = false;
				render();
			}
		};
		const f = el.querySelector(".dm-f"),
			inp = f.querySelector("input");

		const sent = (empty) => {
			try {
				inp.dispatchEvent(
					new CustomEvent("lg-chat-sent", {
						bubbles: true,
						...(empty ? { detail: { empty: true } } : {}),
					}),
				);
			} catch (er) {
				console.warn("личка: событие отправки", er);
			}
		};
		const keep =
			root.LGSiteUi && root.LGSiteUi.keepField
				? root.LGSiteUi.keepField(f, inp)
				: () => {};
		const go = () => {
			if (!String(inp.value || "").trim()) {
				sent(true);
				return;
			}
			const had = D().activeElement === inp;
			send(inp.value)
				.then((ok) => {
					if (ok) {
						inp.value = "";
						sent();
					}
				})
				.finally(() => keep(had));
		};
		f.onsubmit = (e) => {
			e.preventDefault();
			go();
		};
		inp.addEventListener("keydown", (e) => {
			if (
				e.key === "Enter" &&
				!e.shiftKey &&
				!e.isComposing &&
				e.keyCode !== 229
			) {
				e.preventDefault();
				e.stopPropagation();
				go();
			}
		});
		el.querySelector(".dm-l").addEventListener("click", (e) => {
			if (e.target.closest("[data-dmold]") && S.active) load(S.active, true);
		});
		S.el = el;
		return el;
	}

	async function block(l, on = !S.blk.has(l)) {
		if (!S.ctx || !S.ctx.api || !l) return false;
		const nm = S.names.get(l) || l;
		if (
			on &&
			root.confirm &&
			!root.confirm(
				`Заблокировать ${nm}? Он не сможет писать тебе в личку и звать в друзья, дружба и заявки между вами пропадут. Снять - здесь же или в «Друзьях».`,
			)
		)
			return false;
		const r = await S.ctx.api("/api/dm/block", { login: l, on });
		if (!r || !r.ok) {
			err((r && r.error) || "не вышло");
			return false;
		}
		if (r.blocked) S.blk.add(l);
		else S.blk.delete(l);
		err(
			r.blocked
				? `${nm} заблокирован - его личные больше не придут`
				: `${nm} разблокирован`,
			true,
		);
		render();
		return true;
	}
	function err(t, ok) {
		const e = S.el && S.el.querySelector(".dm-e");
		if (!e) {
			if (S.ctx && S.ctx.toast && t) S.ctx.toast(t, !ok);
			return;
		}
		e.textContent = t || "";
		e.classList.toggle("ok", !!ok);
		clearTimeout(S.errT);
		S.errT = setTimeout(() => {
			e.textContent = "";
		}, 4000);
	}
	const NICK_COLORS = [
		"#ffc94d",
		"#ff8a80",
		"#ffab6e",
		"#f4ff81",
		"#b9f6ca",
		"#69f0ae",
		"#84ffff",
		"#80d8ff",
		"#9fa8ff",
		"#b388ff",
		"#ea80fc",
		"#ff80ab",
		"#ffd180",
		"#a7ffeb",
		"#ccff90",
		"#ffcdd2",
	];
	const nickColor = (l) => {
		let h = 2166136261;
		const t = String(l || "");
		for (let i = 0; i < t.length; i++) {
			h ^= t.charCodeAt(i);
			h = Math.imul(h, 16777619);
		}
		return NICK_COLORS[(h >>> 0) % NICK_COLORS.length];
	};
	function render(toEnd) {
		const el = S.el;
		if (!el) return;
		const tabs = el.querySelector(".dm-tabs"),
			sl = tabs.scrollLeft;
		tabs.innerHTML = S.tabs
			.map((l) => {
				const u = S.un.get(l) || 0,
					nm = S.names.get(l) || l;
				return `<span class="dm-tab${S.active === l ? " on" : ""}"><button type="button" role="tab" data-dmt="${esc(l)}" aria-selected="${S.active === l}" style="color:${nickColor(l)}">${esc(nm)}${u ? `<b class="dm-un">${u > 99 ? "99+" : u}</b>` : ""}</button><button type="button" class="dm-x" data-dmx="${esc(l)}" aria-label="Закрыть переписку с ${esc(nm)}" title="Закрыть">×</button></span>`;
			})
			.join("");

		tabs.scrollLeft = sl;
		if (S.shown !== S.active && tabs.clientWidth) {
			S.shown = S.active;
			const on = tabs.querySelector(".dm-tab.on");
			if (on && on.scrollIntoView)
				on.scrollIntoView({ inline: "nearest", block: "nearest" });
		}
		const l = S.active,
			h = el.querySelector(".dm-h"),
			list = el.querySelector(".dm-l"),
			f = el.querySelector(".dm-f"),
			inp = f.querySelector("input");
		h.hidden = !l;
		el.querySelector(".dm-rep").hidden = !l || !S.rep;
		if (l) {
			el.querySelector(".dm-who").textContent = S.names.get(l) || l;
			const bb = el.querySelector('[data-dma="block"]');
			bb.textContent = S.blk.has(l) ? "Разблокировать" : "Заблокировать";
			bb.setAttribute("aria-pressed", String(S.blk.has(l)));
		}
		if (S.dmBan && S.dmBan.until && S.dmBan.until <= Date.now()) S.dmBan = null;
		inp.disabled = !l || !!S.dmBan;
		inp.placeholder = S.dmBan
			? "Модератор закрыл тебе личку"
			: l
				? `Лично для ${S.names.get(l) || l}…`
				: "Выбери собеседника: меню ника → «Написать»";

		if (!l) {
			list.innerHTML =
				'<li class="dm-0">Личных пока нет. Нажми на ник в чате правой кнопкой (на телефоне - подержи) → «Написать». Или «Написать» у друга в «Друзьях».</li>';
			return;
		}
		const end =
			toEnd || list.scrollHeight - list.scrollTop - list.clientHeight < 40;

		const L = S.conv.get(l);
		list.innerHTML = !L
			? '<li class="dm-0">Загружаю…</li>'
			: (S.more.get(l)
					? '<li class="dm-old"><button type="button" data-dmold>Раньше…</button></li>'
					: "") +
				(L.length
					? L.map((m) => {
							const me = String(m.fl).toLowerCase() === S.me;
							return `<li class="${me ? "me" : ""}" title="${esc(hm(m.at))}"><b style="color:${nickColor(m.fl)}">${esc(me ? "Ты" : m.fn || m.fl)}</b> <span>${window.LGChat && window.LGChat.emoText ? window.LGChat.emoText(m.t) : esc(m.t)}</span></li>`;
						}).join("")
					: '<li class="dm-0">Здесь пока пусто - напиши первым. Читаете только вы двое.</li>');
		if (end) list.scrollTop = list.scrollHeight;
		if (visible() && S.un.get(l)) {
			S.un.delete(l);
			fire();
		}
		floatBadge();
	}

	function dock(k, sec, box) {
		S.docks.delete(k);
		if (sec && box) S.docks.set(k, { sec, box });
		place();
	}

	const covered = () =>
		!!(D() && D().documentElement.classList.contains("gu-wopen"));
	const shown = (x) =>
		!covered() &&
		!!(x && x.isConnected && x.getClientRects && x.getClientRects().length);
	function place() {
		if (!D()) return;

		let d = null;
		for (const [k, x] of [...S.docks].reverse()) {
			if (shown(x.sec)) {
				d = x;
				break;
			}
		}
		const el = build();
		if (d) {
			if (el.parentNode !== d.box) {
				d.box.appendChild(el);
				S.shown = null;
			}
			S.host = "dock";
			if (S.fl) S.fl.hidden = true;
			render();
			return;
		}
		if (one()) {
			if (S.fl) S.fl.hidden = true;
			if (el.parentNode && !el.parentNode.classList.contains("cy-chat-dmx"))
				el.remove();
			S.host = null;
			return;
		}
		if (!S.tabs.length || !S.me || S.shut) {
			if (S.fl) S.fl.hidden = true;
			if (
				el.parentNode &&
				el.parentNode !== (S.fl && S.fl.querySelector(".dm-fb"))
			)
				el.remove();
			S.host = null;
			return;
		}
		const fl = floatEl();
		fl.hidden = false;
		fl.classList.toggle("fold", S.fold);
		const fb = fl.querySelector(".dm-fb");
		if (el.parentNode !== fb) {
			fb.appendChild(el);
			S.shown = null;
		}
		S.host = "float";
		render();
	}
	function floatEl() {
		if (S.fl) return S.fl;
		const fl = D().createElement("section");
		fl.className = "dm-float";
		fl.setAttribute("aria-label", "Личные сообщения");
		fl.hidden = true;
		fl.innerHTML =
			'<div class="dm-fh"><button type="button" class="dm-ft" aria-expanded="true"><span aria-hidden="true">✉</span> Личные<b class="dm-fn" hidden></b></button><button type="button" class="dm-fx" aria-label="Закрыть личные сообщения" title="Закрыть">×</button></div><div class="dm-fb"></div>';
		fl.querySelector(".dm-ft").onclick = () => {
			S.fold = !S.fold;
			save();
			fl.classList.toggle("fold", S.fold);
			fl.querySelector(".dm-ft").setAttribute("aria-expanded", String(!S.fold));
			render(true);
		};

		fl.querySelector(".dm-fx").onclick = () => {
			S.shut = true;
			place();
		};
		D().body.appendChild(fl);
		S.fl = fl;
		return fl;
	}
	function floatBadge() {
		if (!S.fl) return;
		const n = unread(),
			b = S.fl.querySelector(".dm-fn");
		b.hidden = !n;
		b.textContent = n > 99 ? "99+" : String(n);
	}

	root.LGDm = {
		init,
		open,
		close,
		setActive,
		onEvent,
		resync,
		send,
		report,
		load,
		block,
		blocked: (l) => S.blk.has(nick(l)),
		dock,
		place,
		on,
		unread,
		tabs: () => S.tabs.slice(),
		active: () => S.active,
		has: (l) => S.tabs.includes(nick(l)),
		conv: (l) => (S.conv.get(nick(l)) || []).slice(),
		MAX,
	};
})(typeof self !== "undefined" ? self : this);
