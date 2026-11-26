(() => {
	const LITE = window.LGGuilds && window.LGGuilds.lite ? window.LGGuilds : null;
	if (window.LGGuilds && !LITE) return;
	const PRE = LITE && typeof LITE.take === "function" ? LITE.take() : null;
	const IDX_TTL = 5 * 60e3;
	const base = () => window.LG_BASE || "";
	const esc = (s) =>
		String(s == null ? "" : s).replace(
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

	const ROLE = {
		leader: "глава",
		lead: "руководство",
		trusted: "доверенное лицо",
		novice: "новичок",
		officer: "руководство",
		member: "новичок",
	};
	const ORD = {
		leader: 0,
		lead: 1,
		officer: 1,
		trusted: 2,
		novice: 3,
		member: 3,
	};
	const POW = {
		accept: "принимать заявки",
		invite: "приглашать по нику",
		kick: "исключать участников",
		open: "открывать и закрывать гильдию",
	};
	const KIND = { hunt: "🐺", caravan: "🐫", fort: "🏕", rival: "⚔" };
	const OUT = {
		win: "Победа",
		lose: "Поражение",
		draw: "Ничья",
		failed: "Сорвано",
	};
	const money = (n) => `${Math.round(+n || 0).toLocaleString("ru-RU")} бронзы`;
	const dt = (ms) => {
		try {
			return new Date(+ms).toLocaleString("ru-RU", {
				day: "numeric",
				month: "long",
				hour: "2-digit",
				minute: "2-digit",
			});
		} catch {
			return "";
		}
	};
	const tm = (ms) => {
		try {
			return new Date(+ms).toLocaleTimeString("ru-RU", {
				hour: "2-digit",
				minute: "2-digit",
			});
		} catch {
			return "";
		}
	};

	const style = () => {
		try {
			return (
				(window.MDDoodle && window.MDDoodle.active) ||
				(window.LG_STYLES && window.LG_STYLES[0]) ||
				"legion"
			);
		} catch (e) {
			return "legion";
		}
	};

	const GST = [
		"legion",
		"cats",
		"monkeys",
		"veggies",
		"42brothers",
		"cherts",
		"ugabugi",
	];
	const gst = () => {
		const s = String(style());
		return GST.includes(s) ? s : "legion";
	};
	const emb = (id, size) => {
		const E = window.LGEmblems;
		try {
			return E && E.svg ? E.svg(id || "e1", size || 32, "", style()) : "";
		} catch (e) {
			console.warn("[гильдии] герб", e);
			return "";
		}
	};

	const ICO_FB = {
		main: "🏠",
		run: "🥾",
		gather: "📯",
		daily: "📜",
		gift: "🎁",
		hall: "🏰",
		members: "👥",
		requests: "📨",
		war: "⚔️",
		log: "📖",
		manage: "⚙️",
		crown: "👑",
		lead: "🛡",
		trusted: "🤝",
		novice: "🌱",
		create: "✚",
		search: "🔍",
		invite: "✉",
		leave: "🚪",
	};
	const ico = (name, size) => {
		const E = window.LGEmblems,
			n = size || 22;
		try {
			const v = E && E.icon ? E.icon(name, style(), n) : "";
			if (v) return `<span class="gl-ico" aria-hidden="true">${v}</span>`;
		} catch (e) {
			console.warn("[гильдии] иконка", e);
		}
		return `<span class="gl-ico gl-ico-fb" aria-hidden="true" data-fb="${ICO_FB[name] || ""}" style="font-size:${Math.round(n * 0.8)}px"></span>`;
	};
	const ROLE_ICO = {
		leader: "crown",
		lead: "lead",
		trusted: "trusted",
		novice: "novice",
	};
	const left = (at) => {
		const m = Math.max(1, Math.ceil((+at - Date.now()) / 60e3));
		return m < 60
			? `через ${m} мин`
			: m < 2880
				? `через ${Math.ceil(m / 60)} ч`
				: `через ${Math.ceil(m / 1440)} дн.`;
	};
	const silver = (n) => {
		const b = Math.round(+n || 0);
		return b % 100 === 0
			? `${(b / 100).toLocaleString("ru-RU")} серебра`
			: money(b);
	};
	const TIERS = [
		["leader", "Глава"],
		["lead", "Руководство"],
		["trusted", "Доверенные лица"],
		["novice", "Новички"],
	];
	const tierOf = (r) => ({ officer: "lead", member: "novice" })[r] || r;
	async function j(r) {
		try {
			const x = await r.json();
			return x && typeof x === "object"
				? window.LGSiteUi && window.LGSiteUi.withCode
					? window.LGSiteUi.withCode(x)
					: x
				: { ok: false, error: "нет ответа" };
		} catch {
			return {
				ok: false,
				error:
					r.status === 429 ? "слишком часто - подожди немного" : "нет ответа",
			};
		}
	}
	const NET = { ok: false, error: "нет связи" };

	const BACKOFF = [5e3, 10e3, 30e3, 60e3];
	function backoff(o) {
		const x = o || {},
			steps = x.steps || BACKOFF,
			rnd = x.rnd || Math.random,
			now = x.now || Date.now;
		let n = 0,
			until = 0;
		return {
			fail() {
				const d = Math.round(
					steps[Math.min(n, steps.length - 1)] * (0.8 + 0.4 * rnd()),
				);
				n++;
				until = now() + d;
				return d;
			},
			ok() {
				n = 0;
				until = 0;
			},

			wait() {
				return Math.max(0, until - now());
			},
			fails: () => n,
		};
	}
	const BK = backoff();
	const bad = (st) =>
		st === 429 || st === 502 || st === 503 || st === 504 || st >= 500;
	const waitRes = () => ({
		ok: false,
		error: `канал сейчас не отвечает - попробую снова через ${Math.max(1, Math.ceil(BK.wait() / 1e3))} с`,
		wait: BK.wait(),
	});
	const get = (p) => {
		if (BK.wait() > 0) return Promise.resolve(waitRes());
		return fetch(base() + "/api/guilds" + p, {
			credentials: "same-origin",
		}).then(
			(r) => {
				if (bad(r.status)) BK.fail();
				else BK.ok();
				return j(r);
			},
			() => {
				BK.fail();
				return NET;
			},
		);
	};
	const post = (p, b) =>
		fetch(base() + "/api/guilds" + p, {
			method: "POST",
			credentials: "same-origin",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(b),
		}).then(
			(r) => {
				if (bad(r.status)) BK.fail();
				else BK.ok();
				return j(r);
			},
			() => {
				BK.fail();
				return NET;
			},
		);
	const api = {
		index: (lite) => get(lite ? "?lite=1" : ""),
		badge: () => get("/badge"),
		guild: (id) => get("/guild?id=" + encodeURIComponent(id)),
		act: (b) => post("/act", b),
		levels: () => get("/levels"),
		skills: () => get("/gskills"),
		feed: () => get("/feed"),
		mark: (guild, kind) => post("/mark", { guild, kind }),
		pick: () => get("/pick"),
		recruits: () => get("/recruits"),
		store: () => get("/store"),

		storeAct: (b) => {
			const x = {
				...b,
				id: window.LGActId
					? window.LGActId()
					: Date.now().toString(36) + Math.random().toString(36).slice(2, 10),
			};
			return post("/store", x).then((r) =>
				r === NET || (r && r.ok === false && r.retryAfter)
					? new Promise((ok) => setTimeout(ok, 1200)).then(() =>
							post("/store", x),
						)
					: r,
			);
		},
		tops: (kind, per) =>
			get(
				`/tops?kind=${encodeURIComponent(kind)}&period=${per === "all" ? "all" : "week"}`,
			),

		war: (name, q) =>
			get("/war/" + name + (q ? "?" + new URLSearchParams(q).toString() : "")),
		warAct: (b) => post("/war/act", b),
		log: (before, cat) =>
			get(
				"/log?cat=" +
					encodeURIComponent(cat || "fight") +
					(before ? "&before=" + encodeURIComponent(before) : ""),
			),

		mod: (b) => post("/mod", b),
		modinfo: (q) =>
			get("/modinfo" + (q ? "?" + new URLSearchParams(q).toString() : "")),
		chatOf: (gid) => get("/chat?guild=" + encodeURIComponent(gid)),

		hero: (tid, gid) =>
			get(
				"/hero?tid=" +
					encodeURIComponent(tid) +
					"&guild=" +
					encodeURIComponent(gid),
			),
	};
	const shut = (r) =>
		!!(
			r &&
			!r.ok &&
			(r.closed || r.unavailable || r.error === "войди через Twitch")
		);

	const MEMO = new Map();
	function memo(key, ttl, fn) {
		const x = MEMO.get(key);
		if (x && Date.now() - x.at < ttl) return x.p;
		const p = fn().then(
			(r) => {
				if (!(r && r.ok)) MEMO.delete(key);
				return r;
			},
			(e) => {
				MEMO.delete(key);
				throw e;
			},
		);
		if (MEMO.size > 200) MEMO.clear();
		MEMO.set(key, { at: Date.now(), p });
		return p;
	}

	let IDX = PRE && PRE.IDX ? PRE.IDX : null,
		idxAt = PRE && PRE.IDX ? +PRE.idxAt || 0 : 0,
		idxP = null,
		idxPL = null;

	function index(force, lite) {
		if (IDX && !IDX.ok && !shut(IDX) && !force && BK.wait() > 0)
			return Promise.resolve(IDX);
		const ttl = IDX && !IDX.ok ? (shut(IDX) ? 2 * IDX_TTL : 0) : IDX_TTL;
		if (!force && IDX && Date.now() - idxAt < ttl) return Promise.resolve(IDX);
		if (idxP) return idxP;
		if (lite) {
			if (idxPL) return idxPL;
			idxPL = api.index(true).then((r) => {
				idxPL = null;
				if (r && r.ok && r.lite) {
					const was = IDX && IDX.ok ? IDX : null;
					IDX = {
						...r,
						guilds: (was && was.guilds) || [],
						limit: was ? was.limit : r.limit,
					};
					idxAt = Date.now();
					paintEntry();
					return IDX;
				}
				if (!(r && r.wait && IDX && IDX.ok)) {
					IDX = r;
					idxAt = Date.now();
				}
				paintEntry();
				return r;
			});
			return idxPL;
		}
		idxP = api.index().then((r) => {
			if (!(r && r.wait && IDX && IDX.ok)) {
				IDX = r;
				idxAt = Date.now();
			}
			idxP = null;
			paintEntry();
			return r;
		});
		return idxP;
	}

	const inGuild = () => !!(IDX && IDX.ok && IDX.mine && IDX.mine.member);
	function paintEntry() {
		if (document.hidden || W) return;
		const hud = document.querySelector(".cy-hud");
		if (!hud) return;
		const was = hud.querySelector(".gl-entry");
		if (!IDX || !IDX.ok) {
			if (was && shut(IDX)) was.remove();
			return;
		}
		const label = inGuild() ? "Гильдия" : "Гильдии";
		if (was) {
			const b = was.querySelector("b");
			if (b && b.textContent !== label) b.textContent = label;
			return;
		}
		const b = document.createElement("button");
		b.type = "button";
		b.className = "gl-entry";
		b.title =
			"Гильдии альянса: вступить, создать, своя гильдия, задания наёмников";
		b.innerHTML = `<span aria-hidden="true">🛡</span><b>${label}</b>`;
		b.onclick = (e) => {
			e.stopPropagation();
			open();
		};
		const gd = hud.querySelector(".gh-entry");
		hud.insertBefore(b, gd || null);
	}
	let entryT = 0;
	const entrySoon = () => {
		if (!entryT)
			entryT = setTimeout(() => {
				entryT = 0;
				paintEntry();
			}, 400);
	};
	try {
		new MutationObserver(entrySoon).observe(
			document.body || document.documentElement,
			{ childList: true, subtree: true },
		);
	} catch (e) {
		console.warn("[гильдии] наблюдатель шапки", e);
	}
	document.addEventListener("visibilitychange", () => {
		if (!document.hidden) entrySoon();
	});

	setTimeout(
		() => {
			if (!IDX && !idxP && !idxPL) index(false, true).catch(() => null);
		},
		Math.round(Math.random() * 5e3),
	);

	window.addEventListener("lg-gchat", (e) => {
		const d = e && e.detail;
		if (!d || (d.k !== "in" && d.k !== "out")) return;
		IDX = null;
		LAST = null;
		index(true, true)
			.then(() => {
				paintEntry();
				badgeSoon();
			})
			.catch(() => null);
	});

	let W = null;
	function toast(t, bad) {
		const e = document.createElement("div");
		e.className = "gl-toast gw-dk" + (bad ? " bad" : "");
		e.setAttribute("role", "status");
		e.textContent = t;
		e.dataset.gst = gst();
		document.body.appendChild(e);
		setTimeout(() => e.classList.add("on"), 10);
		setTimeout(() => {
			e.classList.remove("on");
			setTimeout(() => e.remove(), 300);
		}, 2800);
	}

	function ctxOwn(e) {
		const t = e.target;
		if (
			t &&
			t.closest &&
			t.closest(
				'input, textarea, select, a[href], [contenteditable=""], [contenteditable="true"]',
			)
		)
			return true;
		try {
			const sel = window.getSelection && window.getSelection();
			return !!(
				sel &&
				!sel.isCollapsed &&
				String(sel).trim() &&
				t &&
				sel.containsNode(t, true)
			);
		} catch (x) {
			return false;
		}
	}

	function ctxGuard(root) {
		root.addEventListener("contextmenu", (e) => {
			if (!e.defaultPrevented && !ctxOwn(e)) e.preventDefault();
		});
	}

	const menuRow = (t) =>
		t && t.closest
			? t.closest(
					".gl-mem li.gl-hasm[data-hero], .gl-wedge li.gl-hasm[data-hero]",
				)
			: null;
	function frame() {
		if (W) return W;
		const el = document.createElement("div");
		el.className = "gl-modal gw-dk";
		el.dataset.gst = gst();
		el.innerHTML =
			'<div class="gl-win" role="dialog" aria-modal="true" aria-labelledby="glTitle"><button type="button" class="gl-x" aria-label="Закрыть">×</button><div class="gl-body"></div></div>';
		(document.fullscreenElement || document.body).appendChild(el);
		document.documentElement.classList.add("gl-open");
		const close = () => {
			if (W && W.layer) W.layer();
			el.remove();
			document.removeEventListener("keydown", onKey, true);
			document.documentElement.classList.remove("gl-open");
			W = null;
		};
		const onKey = (e) => {
			if (e.key !== "Escape") return;
			e.stopPropagation();
			if (W && W.layer) {
				e.preventDefault();
				W.layer();
				return;
			}
			close();
		};
		document.addEventListener("keydown", onKey, true);
		el.querySelector(".gl-x").onclick = close;
		el.addEventListener("pointerdown", (e) => {
			if (e.target === el) close();
		});
		W = {
			el,
			body: el.querySelector(".gl-body"),
			tab: "main",
			data: null,
			guild: null,
			q: "",
			close,
		};
		W.body.addEventListener("click", onClick);
		W.body.addEventListener("input", (e) => {
			if (e.target && e.target.id === "glQ") {
				W.q = e.target.value;
				listOnly();
			} else if (
				e.target &&
				e.target.closest &&
				e.target.closest("[data-form=ann]")
			)
				W.annDraft = e.target.value;
		});
		W.body.addEventListener("submit", onSubmit);

		let lp = 0,
			lpX = 0,
			lpY = 0;
		W.body.addEventListener("contextmenu", (e) => {
			const li = menuRow(e.target);
			if (!li) return;
			e.preventDefault();
			if (lp > 0) clearTimeout(lp);
			if (lp === -1) {
				lp = 0;
				return;
			}
			lp = 0;
			memMenu(li.dataset.hero, e.clientX, e.clientY, li);
		});
		W.body.addEventListener("pointerdown", (e) => {
			if (e.pointerType !== "touch") return;
			const li = menuRow(e.target);
			if (!li || e.target.closest("button")) return;
			lpX = e.clientX;
			lpY = e.clientY;
			clearTimeout(lp);
			lp = setTimeout(() => {
				lp = -1;
				const rr = li.getBoundingClientRect();
				memMenu(li.dataset.hero, lpX || rr.left, lpY || rr.bottom, li);
			}, 500);
		});
		const lpEnd = () => {
			if (lp > 0) {
				clearTimeout(lp);
				lp = 0;
			}
		};
		W.body.addEventListener("pointerup", lpEnd);
		W.body.addEventListener("pointercancel", lpEnd);
		W.body.addEventListener("pointermove", (e) => {
			if (
				e.pointerType === "touch" &&
				lp > 0 &&
				Math.abs(e.clientX - lpX) + Math.abs(e.clientY - lpY) > 10
			)
				lpEnd();
		});
		W.body.addEventListener("keydown", (e) => {
			const li = menuRow(e.target);
			if (!li || e.target !== li) return;
			if (
				e.key === "Enter" ||
				e.key === "ContextMenu" ||
				(e.key === "F10" && e.shiftKey)
			) {
				e.preventDefault();
				const rr = li.getBoundingClientRect();
				memMenu(li.dataset.hero, rr.left + 16, rr.bottom, li);
			}
		});

		ctxGuard(el);
		return W;
	}
	const busy = (t) => {
		if (W)
			W.body.innerHTML = `<h2 id="glTitle">Гильдии</h2><p class="gl-note">${esc(t)}</p>`;
	};

	const LAST_MS = 120e3;
	let LAST = null;
	const knownGid = () => (inGuild() ? String(IDX.mine.member.guild) : null);

	const WARM_MS = 8e3;
	let WARM = null;
	function warm() {
		const g = knownGid();
		if (!g || W || BK.wait() > 0) return;
		if (WARM && WARM.gid === g && Date.now() - WARM.at < WARM_MS) return;
		WARM = { gid: g, at: Date.now(), p: api.guild(g) };
	}
	for (const ev of ["pointerover", "pointerdown"])
		document.addEventListener(
			ev,
			(e) => {
				const t =
					e.target && e.target.closest
						? e.target.closest('[data-gu="guild"]')
						: null;
				if (t) warm();
			},
			{ passive: true },
		);
	async function open(o) {
		const x = o || {};
		frame();

		W.el.classList.toggle("gl-big", !!x.big);
		W.el.dataset.gst = gst();
		const known = x.view === "pick" || x.view === "mod" ? null : knownGid();
		const pre = known
			? WARM && WARM.gid === known && Date.now() - WARM.at < WARM_MS
				? WARM.p
				: api.guild(known)
			: null;
		WARM = null;

		if (known)
			void giLoad().catch((e) => console.warn("[гильдии] иконки кнопок", e));
		const S = W;
		const swr = !!(
			known &&
			LAST &&
			LAST.gid === known &&
			Date.now() - LAST.at < LAST_MS &&
			LAST.r &&
			LAST.r.me &&
			LAST.data
		);
		if (swr) {
			W.data = LAST.data;
			W.guild = LAST.r;
			paintGuild();
		} else busy("Смотрю гильдии альянса…");
		const r = await index(true, !!known);
		if (!W || W !== S) return;
		liveSoon();
		if (!r || !r.ok) {
			W.body.innerHTML = `<h2 id="glTitle">Гильдии</h2><p class="gl-note">${esc(closedText(r))}</p>`;
			return;
		}
		W.data = r;
		const m = r.mine && r.mine.member;
		if (x.view === "mod" && r.mod) {
			await modPanel("new");
			return;
		}
		if (m && x.view !== "pick") {
			const fight = x.view === "war" || x.view === "run";
			const gath = x.view === "gather";
			if (fight || gath) W.tab = "main";
			await showGuild(
				m.guild,
				false,
				String(m.guild) === known ? pre : null,
				swr,
			);
			if (fight && W && W.guild && W.guild.me) {
				if (W.sumP) await W.sumP;
				if (W) openWin("war", { seg: x.view });
			}
			if (gath && W && W.guild && W.guild.me) {
				if (W.sumP) await W.sumP;
				if (W && !(runGather() && !gatherN())) openWin("gather");
			}
			return;
		}
		if (r.lite) {
			await pickFull();
			return;
		}
		showPick();
	}

	async function pickFull() {
		if (!W) return;
		if (W.data && W.data.lite) {
			busy("Смотрю гильдии альянса…");
			const r = await index(true);
			if (!W) return;
			if (!r || !r.ok) {
				W.body.innerHTML = `<h2 id="glTitle">Гильдии</h2><p class="gl-note">${esc(closedText(r))}</p>`;
				return;
			}
			W.data = r;
		}
		W.guild = null;
		showPick();
	}
	function closedText(r) {
		if (!r) return "не вышло";
		if (r.closed)
			return (
				"Гильдии пока открыты только тестерам" +
				((window.LGSiteUi &&
					window.LGSiteUi.closedCode &&
					window.LGSiteUi.closedCode(r)) ||
					"") +
				"."
			);
		if (r.unavailable)
			return "Гильдий нет в этом сезоне - они есть только в онлайн-сезоне, оффлайн-копии канала и пробной неделе.";
		return r.error || "не вышло";
	}

	const BTN = {
		join: ["Вступить", "join"],
		apply: ["Подать заявку", "apply"],
		cancel: ["Отозвать заявку", "cancel"],
	};
	function rowHtml(g, lim) {
		const b = BTN[g.action];
		const how = g.invited
			? "тебя пригласили"
			: g.open
				? "открыта - вступай сразу"
				: g.applied
					? "заявка подана"
					: "по заявке";
		return (
			`<li class="gl-g${g.free > 0 ? "" : " full"}" data-gid="${esc(g.id)}">` +
			`<span class="gl-emb" aria-hidden="true">${emb(g.emblem, 40)}</span>` +
			`<button type="button" class="gl-gn" data-see="${esc(g.id)}"><b>${g.tag ? `<small class="gl-tg">[${esc(g.tag)}]</small> ` : ""}${esc(g.name)}</b>` +
			`<small>ур. ${g.level} · ${g.count} из ${lim} · ${how}${g.minLevel > 1 ? ` · с ${g.minLevel} ур. героя` : ""}${markTag(g.id)}</small></button>` +
			(b
				? `<button type="button" class="gl-btn${g.action === "cancel" ? " ghost" : ""}" data-op="${b[1]}" data-g="${esc(g.id)}">${b[0]}</button>`
				: g.action === "full"
					? '<span class="gl-tagc">мест нет</span>'
					: g.action === "low"
						? `<span class="gl-tagc">нужен ${g.minLevel} ур. героя</span>`
						: "") +
			"</li>"
		);
	}
	function listOnly() {
		const ul = W && W.body.querySelector(".gl-all");
		if (!ul) return;
		const r = W.data,
			q = W.q.trim().toLowerCase();
		const list = (r.guilds || []).filter(
			(g) =>
				!q ||
				g.name.toLowerCase().includes(q) ||
				(g.tag || "").toLowerCase().includes(q),
		);
		ul.innerHTML = list.length
			? list.map((g) => rowHtml(g, r.limit)).join("")
			: `<li class="gl-note">${(r.guilds || []).length ? "Ничего не нашлось." : "В альянсе пока нет гильдий - создай первую!"}</li>`;
	}
	function showPick() {
		const r = W.data,
			m = r.mine || {},
			inG = m.member,
			cr = m.create || { cost: 1000, level: 2 };
		const inv = (m.invites || [])
			.map(
				(v) =>
					`<li class="gl-inv"><span>Приглашение в <b>${v.tag ? `[${esc(v.tag)}] ` : ""}${esc(v.name)}</b></span><span class="gl-ma"><button type="button" class="gl-btn" data-op="join" data-g="${esc(v.guild)}">Принять</button><button type="button" class="gl-btn ghost" data-op="refuse" data-g="${esc(v.guild)}">Отклонить</button></span></li>`,
			)
			.join("");
		const wait =
			!inG && m.rejoinAt && +m.rejoinAt > Date.now()
				? `<p class="gl-warn">Ты недавно вышел из гильдии - вступить в другую можно ${esc(left(m.rejoinAt))}.</p>`
				: "";
		const top = inG
			? `<p class="gl-note">Ты в гильдии «${esc(inG.name)}». Чтобы вступить в другую, сначала выйди из своей.</p><button type="button" class="gl-btn" data-mine="1">Моя гильдия</button>`
			: m.banned
				? '<p class="gl-warn">Стример этого альянса закрыл тебе вступление в гильдии.</p>'
				: '<p class="gl-note">Гильдия - твоё сообщество в альянсе канала: общие задания, сражения без эфира, своё здание в городе и награды для всех.</p>';
		const createWait =
			m.createAt && +m.createAt > Date.now()
				? `<p class="gl-warn">Ты распустил свою гильдию - новую можно создать ${esc(left(m.createAt))}.</p>`
				: "";
		const embs = (window.LGEmblems && window.LGEmblems.list) || [];
		W.el.classList.remove("gl-wide");
		W.body.innerHTML =
			`<h2 id="glTitle">Гильдии альянса</h2>${top}${wait}${modBtn()}` +
			(inv && !inG
				? `<h3>Тебя приглашают</h3><ul class="gl-invs">${inv}</ul>`
				: "") +
			`<div class="gl-search"><input id="glQ" type="search" placeholder="Поиск по названию или тегу" aria-label="Поиск гильдии" value="${esc(W.q)}" autocomplete="off"></div>` +
			(!inG && !m.banned && r.path
				? '<section class="gl-pick" aria-label="Подобрать гильдию"><h3>Подобрать гильдию</h3><ul class="gl-list gl-pickl"><li class="gl-note">Подбираю…</li></ul></section>'
				: "") +
			'<p class="gl-note gl-sm">Сначала - со свободными местами и самые активные.</p><ul class="gl-list gl-all"></ul>' +
			(!inG && !m.banned
				? `<details class="gl-new"${W.newOpen ? " open" : ""}><summary>Создать гильдию - ${esc(silver(cr.cost))}</summary>${createWait}<form data-form="create">
          <label>Название <input name="name" required minlength="3" maxlength="24" autocomplete="off" placeholder="3-24 знака"></label>
          <label>Тег <input name="tag" maxlength="3" minlength="3" pattern="[A-Za-z]{3}" required autocomplete="off" placeholder="3 латинские буквы, например SOF" class="gl-tagin"></label>
          <p class="gl-note gl-sm">Тег пишется перед ником: <b>[SOF] ник</b>. Название и тег уникальны во всей игре (с учётом больших и маленьких букв).</p>
          ${embs.length ? `<fieldset class="gl-embs"><legend>Герб</legend>${embs.map((e, i) => `<label class="gl-embp" title="${esc(e.name)}"><input type="radio" name="emblem" value="${esc(e.id)}"${i === 0 ? " checked" : ""}><span>${emb(e.id, 44)}</span><small>${esc(e.name)}</small></label>`).join("")}</fieldset>` : ""}
          <label>Описание <textarea name="descr" maxlength="300" rows="3" placeholder="Кто вы, во что играете, кого ждёте (до 300 знаков)"></textarea></label>
          <label class="gl-chk"><input type="checkbox" name="open" checked> Открыта - вступают в один клик (иначе - по заявке)</label>
          <button type="submit" class="gl-btn">Создать за ${esc(silver(cr.cost))}</button>
          <p class="gl-note gl-sm">Нужен герой ${esc(cr.level)}+ уровня. До ${esc(r.limit || 90)} участников, ты станешь главой. Если распустить гильдию, деньги не вернутся.</p></form></details>`
				: "");
		listOnly();
		if (r.feed && !W.marks)
			void marksLoad().then(() => {
				if (W && W.body.querySelector(".gl-list")) listOnly();
			});
		if (!inG && !m.banned && r.path) void pickFill();
	}

	const MARK_RU = { ally: "союзник", enemy: "враг" };
	const markTag = (gid) => {
		const k = W && W.marks && W.marks.get(String(gid));
		return k ? ` · <b class="gl-mk k-${esc(k)}">${MARK_RU[k] || ""}</b>` : "";
	};
	async function marksLoad() {
		const x = await api.feed();
		if (W && x && x.ok)
			W.marks = new Map((x.marks || []).map((m) => [String(m.other), m.kind]));
		return W && W.marks;
	}
	async function markFill(g) {
		if (!W) return;
		if (!W.marks) await marksLoad();
		const box =
			W &&
			W.body.querySelector(
				`.gl-mark[data-markg="${CSS.escape(String(g.id))}"]`,
			);
		if (!box) return;
		const me = W.data && W.data.mine && W.data.mine.member,
			k = (W.marks && W.marks.get(String(g.id))) || "";
		const lead = !!(
			me &&
			String(me.guild) !== String(g.id) &&
			(me.role === "leader" || me.role === "lead")
		);
		if (!lead) {
			box.innerHTML = k
				? `<span class="gl-mk k-${esc(k)}">Для нашей гильдии: ${MARK_RU[k]}</span>`
				: "";
			return;
		}
		box.innerHTML =
			`<span>Метка для нашей гильдии:</span>` +
			[
				["ally", "Союзник"],
				["enemy", "Враг"],
				["", "Без метки"],
			]
				.map(
					([v, t]) =>
						`<button type="button" class="gl-mini${v === k ? " on" : ""}" data-mk="${v}" aria-pressed="${v === k}">${t}</button>`,
				)
				.join("");
		box.onclick = async (e) => {
			const b = e.target && e.target.closest && e.target.closest("[data-mk]");
			if (!b) return;
			e.stopPropagation();
			b.disabled = true;
			const r = await api.mark(String(g.id), b.dataset.mk || null);
			if (!W) return;
			if (r && r.ok) {
				if (!W.marks) W.marks = new Map();
				if (r.kind) W.marks.set(String(g.id), r.kind);
				else W.marks.delete(String(g.id));
				void markFill(g);
			} else {
				b.disabled = false;
				toast((r && r.error) || "не вышло", true);
			}
		};
	}

	async function pickFill() {
		const S = W,
			x = await api.pick();
		const ul = S && S === W && W.body.querySelector(".gl-pickl");
		if (!ul) return;
		const all = new Map(
			((W.data && W.data.guilds) || []).map((g) => [String(g.id), g]),
		);
		const rows =
			x && x.ok
				? (x.guilds || [])
						.map((g) => ({ p: g, g: all.get(String(g.id)) }))
						.filter((v) => v.g)
				: [];
		ul.innerHTML = rows.length
			? rows
					.map((v) =>
						rowHtml(v.g, W.data.limit).replace(
							"</small></button>",
							` · в игре за 3 дня: ${esc(v.p.active)}${v.p.avgLv ? ` · герои ~${esc(Math.round(v.p.avgLv))} ур.` : ""}</small></button>`,
						),
					)
					.join("")
			: `<li class="gl-note">${x && x.ok ? "Сейчас нет открытых гильдий с местами - выбери из списка ниже или создай свою." : esc((x && x.error) || "не вышло")}</li>`;
	}

	async function showGuild(gid, quiet, pre, swr) {
		if (!quiet && !swr) busy("Открываю гильдию…");
		const r = await (pre || api.guild(gid));
		if (!W) return;
		if (r && r.ok && r.me)
			LAST = { gid: String(gid), r, data: W.data, at: Date.now() };

		const sumFresh = () =>
			!!(swr && (W.sumP || (W.sumAt && Date.now() - W.sumAt < 5e3)));
		if (
			swr &&
			r &&
			r.ok &&
			W.guild &&
			JSON.stringify(r) === JSON.stringify(W.guild)
		) {
			if (!sumFresh()) void summary(true);
			return;
		}
		if (!r || !r.ok) {
			W.body.innerHTML = `<h2 id="glTitle">Гильдия</h2><p class="gl-note">${esc((r && r.error) || "не вышло")}</p><button type="button" class="gl-btn ghost" data-back="1">← К списку гильдий</button>`;
			return;
		}
		W.guild = r;
		if (r.gs) {
			W.gsFree = +r.gs.free || 0;
			W.gsMarks = r.gs.marks || null;
		}
		if (!r.me) W.tab = "mem";
		paintGuild();

		if (
			r.me &&
			Array.isArray(r.news) &&
			r.news.length &&
			!W.newsShown &&
			!W.layer
		) {
			W.newsShown = true;
			newsWin(r.news);
		}
		if (!sumFresh()) void summary(true);
	}
	const roleOf = (r) => (r.me ? r.me.role : null);

	function can(r, p) {
		if (r.me && r.me.can) return !!r.me.can[p];
		return roleOf(r) === "leader";
	}

	function lvlOf(r) {
		const g = r.guild,
			st = (r.levels && r.levels.steps) || [],
			max = (r.levels && r.levels.max) || st.length + 1;
		const lv = Math.max(1, +g.level || 1),
			xp = Math.max(0, +g.xp || 0),
			from = lv >= 2 ? st[lv - 2] || 0 : 0,
			to = lv - 1 < st.length ? st[lv - 1] : null;
		const pct =
			to == null
				? 1
				: Math.max(0, Math.min(1, (xp - from) / Math.max(1, to - from)));
		return { lv, xp, to, pct, top: to == null && lv >= max };
	}
	const num = (n) => Math.round(+n || 0).toLocaleString("ru-RU");
	const plural = (n, a, b, c) => {
		const m = n % 100,
			k = n % 10;
		return m > 10 && m < 20 ? c : k === 1 ? a : k > 1 && k < 5 ? b : c;
	};
	function lvlHtml(r) {
		const L = lvlOf(r),
			fill = Math.max(L.pct, 0.03);
		return (
			`<div class="gl-lvl"><div class="gl-lvl-t"><b>Уровень ${L.lv}${L.top ? " - наибольший" : ""}</b><span>${L.to == null ? num(L.xp) : `${num(L.xp)} / ${num(L.to)}`}</span></div>` +
			`<div class="gl-xp" role="progressbar" aria-label="Опыт гильдии" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(L.pct * 100)}"><i style="transform:scaleX(${fill.toFixed(3)})"></i></div></div>`
		);
	}

	const TICO = { main: "main", mem: "members", set: "manage" };
	const hallOn = () => {
		try {
			const H = window.LGGuildHall;
			return !!(
				H &&
				typeof H.open === "function" &&
				!(H.on && H.on() === false)
			);
		} catch (e) {
			return false;
		}
	};
	const reqN = (r) =>
		r.requests ? r.requests.filter((x) => x.kind === "apply").length : 0;
	function guildTabs(r) {
		return [
			["main", "Главная"],
			["mem", "Состав", reqN(r)],
			["set", "Управление"],
		];
	}
	function paintGuild() {
		const r = W.guild,
			g = r.guild,
			me = r.me,
			role = roleOf(r),
			mine = !!me;
		figKeep(r.members);
		figKeep(r.requests);
		W.el.classList.toggle("gl-wide", mine);
		const head =
			`<div class="gl-head"><span class="gl-emb big" aria-hidden="true">${emb(g.emblem, 64)}</span><div class="gl-hn"><h2 id="glTitle">${g.tag ? `<small class="gl-tg">[${esc(g.tag)}]</small> ` : ""}${esc(g.name)}</h2>` +
			(g.descr
				? `<p class="gl-motto" title="${esc(g.descr)}">${esc(g.descr)}</p>`
				: "") +
			`<p class="gl-meta"><span>ур. ${g.level}</span><span>${g.count} из ${g.limit}</span><span>${g.open ? "открыта" : "по заявке"}</span>${mine ? `<span class="gl-role r-${esc(tierOf(role))}">роль: ${ROLE[role] || esc(role)}</span>` : ""}</p></div>` +
			(mine ? lvlHtml(r) : "") +
			"</div>";
		if (!mine) {
			const pk = ((W.data && W.data.guilds) || []).find(
				(x) => String(x.id) === String(g.id),
			);
			const b = pk && BTN[pk.action],
				boss = (r.members || []).find((m) => tierOf(m.role) === "leader"),
				L = lvlOf(r);
			W.el.classList.add("gl-wide");
			const why =
				pk && pk.action === "low"
					? `Нужен ${g.minLevel} уровень героя`
					: pk && pk.action === "full"
						? "Мест нет"
						: "";
			W.body.innerHTML =
				`<div class="gl-see"><aside class="gl-banner" aria-label="Гильдия"><span class="gl-emb gl-emb-xl" aria-hidden="true">${emb(g.emblem, 112)}</span><div class="gl-bn"><h2 id="glTitle">${g.tag ? `<small class="gl-tg">[${esc(g.tag)}]</small> ` : ""}${esc(g.name)}</h2><p class="gl-see-lv">Уровень ${L.lv}</p></div>` +
				`<ul class="gl-meta gl-bl">${boss ? `<li><span>глава:</span> <b>${esc(boss.name || boss.login || "игрок")}</b></li>` : ""}<li><span>участники:</span> <b>${g.count} / ${g.limit}</b></li><li><span>набор:</span> <b>${g.open ? "открыт" : "по заявке"}</b></li>${g.minLevel > 1 ? `<li><span>вступление:</span> <b>с ${g.minLevel} ур. героя</b></li>` : ""}</ul>` +
				`${b ? `<button type="button" class="gl-btn gl-see-go" data-op="${b[1]}" data-g="${esc(g.id)}">${b[0]}</button>` : why ? `<p class="gl-see-no">${esc(why)}</p>` : ""}<button type="button" class="gl-btn ghost gl-see-go" data-back="1">← К списку гильдий</button></aside>` +
				`<div class="gl-see-r">${g.descr ? `<div class="gl-annb"><div class="gl-annh"><b>О гильдии</b></div><p class="gl-annt">${esc(g.descr)}</p></div>` : ""}${seeModHtml(g)}${W.data && W.data.feed ? `<div class="gl-modrow gl-mark" data-markg="${esc(g.id)}"></div>` : ""}${wedgeHtml(r)}${memHtml(r, false)}</div></div>`;
			void markFill(g);
			return;
		}
		const pend = me.pending
			? `<section class="gl-move"><h3>Гильдия сменила альянс</h3><p>Гильдия теперь в другом альянсе. Реши: переехать вместе с гильдией или выйти из неё. Город остаётся прежнему альянсу.</p>` +
				'<div class="gl-btns"><button type="button" class="gl-btn" data-op="moveStay">Переехать с гильдией</button><button type="button" class="gl-btn bad" data-op="moveLeave" data-confirm="Выйти из гильдии?">Выйти из гильдии</button></div></section>'
			: "";
		const tabs = guildTabs(r);
		W.tabKey = tabs.map((t) => t[0]).join(",");
		if (!tabs.some((t) => t[0] === W.tab)) W.tab = "main";
		W.body.innerHTML =
			pend +
			`<div class="gl-tabs gl-tabs1" role="tablist">${tabs.map(([k, t, n]) => `<button type="button" role="tab" aria-selected="${W.tab === k}" data-tab="${k}">${ico(TICO[k], 18)}${t}${n ? ` <b class="gl-badge" aria-label="заявок: ${n}">${n}</b>` : ""}</button>`).join("")}</div><div class="gl-pane"></div>`;
		paintTab();
		void giLoad()
			.then(giFill)
			.catch((e) => console.warn("[гильдии] иконки кнопок", e));
	}
	function paintTab() {
		const pane = W && W.body.querySelector(".gl-pane");
		if (!pane) return;
		const r = W.guild;
		pane.dataset.tab = W.tab;
		if (W.tab === "main") {
			pane.innerHTML = mainHtml();
			giFill();
			runTick();
			if (W.sumDirty || Date.now() - (W.sumMainAt || 0) > SUM_GAP)
				void summary(!!W.sumDirty);
		} else if (W.tab === "set") pane.innerHTML = bannerHtml(true) + setHtml(r);
		else {
			pane.innerHTML = memPane(r);
			recBind(pane);
			void gstBind(pane);
		}
		reMark();
	}

	function memPane(r) {
		const n = reqN(r),
			sub = r.requests && W.memSub === "req" ? "req" : "list";
		const seg = r.requests
			? `<div class="gl-seg" role="tablist" aria-label="Состав"><button type="button" role="tab" data-memsub="list" aria-selected="${sub === "list"}">Участники ${r.guild.count}</button>` +
				`<button type="button" role="tab" data-memsub="req" aria-selected="${sub === "req"}">Заявки${n ? ` <b class="gl-badge">${n}</b>` : ""}</button></div>`
			: "";
		return (
			wedgeHtml(r) +
			seg +
			(sub === "req"
				? reqHtml(r)
				: onlineHtml(r) +
					(can(r, "invite")
						? inviteHtml() + (W.data && W.data.path ? recHtml() : "")
						: "") +
					memHtml(r, true))
		);
	}

	const recHtml = () =>
		'<details class="gl-rec"><summary>Доска новобранцев</summary><ul class="gl-recl"><li class="gl-note">Смотрю, кто без гильдии…</li></ul></details>';
	function recBind(root) {
		const det = root && root.querySelector(".gl-rec");
		if (!det) return;
		det.addEventListener("toggle", async () => {
			if (!det.open || det.dataset.got) return;
			det.dataset.got = "1";
			const x = await api.recruits(),
				ul = det.querySelector(".gl-recl");
			if (!ul) return;
			if (!x || !x.ok) {
				ul.innerHTML = `<li class="gl-note">${esc((x && x.error) || "не вышло")}</li>`;
				det.dataset.got = "";
				return;
			}
			ul.innerHTML = (x.list || []).length
				? x.list
						.map(
							(h) =>
								`<li class="gl-g"><span><b>${esc(h.name)}</b><small> · ${esc(h.level)} ур. · ${esc(CLS_RU[h.role] || h.role)}</small></span>` +
								`<button type="button" class="gl-btn" data-rinv="${esc(h.login)}">Позвать</button></li>`,
						)
						.join("")
				: '<li class="gl-note">Все герои альянса уже в гильдиях.</li>';
		});
		det.addEventListener("click", (e) => {
			const b = e.target && e.target.closest && e.target.closest("[data-rinv]");
			if (!b || !W || !W.guild) return;
			e.stopPropagation();
			act(
				{
					op: "invite",
					guild: String(W.guild.guild.id),
					login: b.dataset.rinv,
				},
				b,
			).then((r) => {
				if (r && r.ok) {
					b.disabled = true;
					b.textContent = "Позвали";
				}
			});
		});
	}

	const GST_SEC = { all: "Общий", lead: "Руководство" };
	function gstHtml(x, open) {
		const items = x.items || [],
			bag = x.bag || [];
		const row = (it) =>
			`<li class="gl-g"><span><b>${esc(it.name)}</b>${it.lvl ? ` +${esc(it.lvl)}` : ""}<small> · ${esc(GST_SEC[it.sec] || "")} · положил ${esc(it.by)}</small></span>` +
			(it.take && !x.wait
				? `<button type="button" class="gl-btn" data-gst="take" data-k="${esc(it.k)}">Взять</button>`
				: "") +
			"</li>";
		const put = x.wait
			? `<p class="gl-note gl-sm">${esc(x.wait)}</p>`
			: bag.length
				? `<form class="gl-row gl-gstput" data-gstput="1"><select name="uid" aria-label="Что положить">${bag.map((b) => `<option value="${esc(b.uid)}">${esc(b.name)}${b.lvl ? ` +${esc(b.lvl)}` : ""}</option>`).join("")}</select>` +
					`<select name="sec" aria-label="Раздел"><option value="all">Общий</option><option value="lead">Руководство</option></select><button type="submit" class="gl-btn">Положить</button></form>`
				: '<p class="gl-note gl-sm">В сумке нет вещей, которые можно положить.</p>';
		return (
			`<details class="gl-gst"${open ? " open" : ""}><summary>Склад гильдии · ${items.length} из ${esc(x.cap)}</summary>` +
			`<ul class="gl-gstl">${items.length ? items.map(row).join("") : '<li class="gl-note">Пока пусто.</li>'}</ul>${put}` +
			`<p class="gl-note gl-sm">Вещи и ингредиенты - для своих. «Руководство» берут глава и руководство. Монеты и руда - в Ратуше.</p>` +
			(x.log && x.log.length
				? `<details class="gl-gstj"><summary>Журнал склада</summary><ul>${x.log
						.slice(0, 30)
						.map(
							(e) =>
								`<li>${esc(e.by)} ${e.op === "put" ? "положил" : "взял"} «${esc(e.name)}»${e.sec === "lead" ? " (руководство)" : ""} <time>${esc(hm(e.at))}</time></li>`,
						)
						.join("")}</ul></details>`
				: "") +
			"</details>"
		);
	}
	let GST_OFF = 0;
	async function gstBind(root) {
		if (Date.now() < GST_OFF) return;
		const x = await memo("gstore", 60e3, () => api.store());
		if (x && x.closed) GST_OFF = Date.now() + 600e3;
		if (!x || !x.ok || !root.isConnected) return;
		let box = root.querySelector(".gl-gstw");
		if (!box) {
			box = document.createElement("div");
			box.className = "gl-gstw";
			root.appendChild(box);
		}
		const paint = (y, open) => {
			box.innerHTML = gstHtml(y, open);
		};
		paint(x, false);
		const run = async (b, btn) => {
			if (btn) btn.disabled = true;
			const r = await api.storeAct(b);
			if (!box.isConnected) return;
			if (r && r.ok) {
				MEMO.delete("gstore");
				paint(r, true);
				toast(
					b.op === "put"
						? "Положено на склад гильдии"
						: "Взято со склада гильдии",
				);
			} else {
				if (btn) btn.disabled = false;
				toast((r && r.error) || "не вышло", true);
			}
		};
		box.onclick = (e) => {
			const b =
				e.target && e.target.closest && e.target.closest('[data-gst="take"]');
			if (!b) return;
			e.stopPropagation();
			void run({ op: "take", k: b.dataset.k }, b);
		};
		box.onsubmit = (e) => {
			const f = e.target;
			if (!f || !f.matches || !f.matches("[data-gstput]")) return;
			e.preventDefault();
			e.stopPropagation();
			const fd = new FormData(f);
			void run(
				{
					op: "put",
					uid: String(fd.get("uid") || ""),
					sec: String(fd.get("sec") || "all"),
				},
				f.querySelector("button"),
			);
		};
	}

	function bannerHtml(strip) {
		const r = W.guild,
			g = r.guild,
			role = roleOf(r),
			lead = (r.members || []).find((m) => tierOf(m.role) === "leader");
		return (
			`<aside class="gl-banner${strip ? " gl-strip" : ""}" aria-label="Гильдия"><span class="gl-emb gl-emb-xl" aria-hidden="true">${emb(g.emblem, strip ? 44 : 112)}</span>` +
			`<div class="gl-bn"><h2 id="glTitle">${g.tag ? `<small class="gl-tg">[${esc(g.tag)}]</small> ` : ""}${esc(g.name)}</h2>${lvlHtml(r)}</div>` +
			`<ul class="gl-meta gl-bl">${lead ? `<li class="b-lead"><span>глава:</span> <b>${esc(lead.name || lead.login || "игрок")}</b></li>` : ""}<li><span>участники:</span> <b data-cnt="count">${g.count} / ${g.limit}</b></li>` +
			`<li class="b-open"><span>набор:</span> <b>${g.open ? "открыт" : "по заявке"}</b></li><li class="gl-role r-${esc(tierOf(role))}"><span>роль:</span> <b>${ROLE[role] || esc(role)}</b></li></ul>${strip ? "" : '<button type="button" class="gl-btn ghost gl-topbtn" data-win="tops">🏆 Топы гильдии</button>'}</aside>`
		);
	}

	const TOPS = [
		["contrib", "Вклад"],
		["mine", "Шахта"],
		["fish", "Рыбалка"],
		["questdmg", "Урон в походе"],
		["questheal", "Лечение в походе"],
	];
	const podArt = (pl) => {
		let v = "";
		try {
			const I = window.LGGuildIcons;
			v = I && I.podium ? I.podium(pl, gst()) : "";
		} catch (e) {
			console.warn("[гильдии] постамент", e);
		}
		return v
			? `<span class="gl-pod-art" role="img" aria-label="${pl} место">${v}</span>`
			: `<span class="gl-pod-b" aria-label="${pl} место">${pl}</span>`;
	};
	function topsWin(S) {
		const kind = TOPS.some((x) => x[0] === W.topKind) ? W.topKind : "contrib",
			per = W.topPer === "all" ? "all" : "week";
		if (!S.body.querySelector(".gl-topw")) {
			S.body.innerHTML =
				`<div class="gl-topw"><div class="gl-seg" role="tablist" aria-label="Топ">${TOPS.map(([k, t]) => `<button type="button" role="tab" data-topk="${k}" aria-selected="${k === kind}">${t}</button>`).join("")}</div>` +
				`<div class="gl-toph"><span class="gl-topcap"></span><div class="gl-seg gl-seg-s" role="tablist" aria-label="Период"><button type="button" role="tab" data-topper="week" aria-selected="${per === "week"}">Неделя</button><button type="button" role="tab" data-topper="all" aria-selected="${per === "all"}">Всё время</button></div></div><div class="gl-pane gl-subpane gl-toplist"><p class="gl-note">Считаю…</p></div></div>`;
			const pick = (e) => {
				const b = e.target.closest("[data-topk], [data-topper]");
				if (b) {
					if (b.getAttribute("aria-selected") === "true") return;
					if (b.dataset.topk) W.topKind = b.dataset.topk;
					else W.topPer = b.dataset.topper;
					S.body
						.querySelectorAll(b.dataset.topk ? "[data-topk]" : "[data-topper]")
						.forEach((x) => x.setAttribute("aria-selected", String(x === b)));
					topsWin(S);
					return;
				}
				const h = e.target.closest("[data-hero]");
				if (h) void heroWin(h.dataset.hero);
			};
			S.body.addEventListener("click", pick);
			S.body.addEventListener("keydown", (e) => {
				if (
					(e.key === "Enter" || e.key === " ") &&
					e.target.matches &&
					e.target.matches("[data-hero]")
				) {
					e.preventDefault();
					pick(e);
				}
			});
		}
		const pane = S.body.querySelector(".gl-toplist");
		if (pane.firstChild) pane.classList.add("gl-wait");
		const seq = (S.topSeq = (S.topSeq || 0) + 1);
		memo(`tops:${kind}:${per}`, 60e3, () => api.tops(kind, per)).then((r) => {
			if (!W || W.sub !== S || !pane.isConnected || S.topSeq !== seq) return;
			pane.classList.remove("gl-wait");
			if (!r || !r.ok) {
				pane.innerHTML = `<p class="gl-note">${esc((r && r.error) || "Топ не открылся - попробуй ещё раз")}</p>`;
				return;
			}
			const me = W.guild.me,
				C = r.cols || [],
				n = C.length;
			S.body.querySelector(".gl-topcap").textContent = r.note || "";
			const tpl = `style="--tc:${n}"`;
			const R = r.rows || [],
				c0 = C[0] || { k: "", name: "" };
			const mine = (x) => (me && String(x.tid) === String(me.tid) ? " me" : "");
			const ped = (x, pl) =>
				x
					? `<li class="gl-pod p${pl}${mine(x)}" data-hero="${esc(x.tid)}" tabindex="0">${pl === 1 ? `<span class="gl-pod-cr" aria-hidden="true">${ico("crown", 26)}</span>` : ""}${heroFig(x.login)}<b>${esc(x.name || x.login || "игрок")}</b><span class="gl-pod-v">${num(r.sname ? x.s : x.v[c0.k])} <small>${esc(String(r.sname || c0.name).toLowerCase())}</small></span>${podArt(pl)}</li>`
					: `<li class="gl-pod p${pl} none">${podArt(pl)}</li>`;
			pane.innerHTML =
				(R.length
					? `<ol class="gl-pods" aria-label="Первые три места">${ped(R[1], 2)}${ped(R[0], 1)}${ped(R[2], 3)}</ol>`
					: '<p class="gl-note">Пока пусто.</p>') +
				(R.length > 3
					? `<ol class="gl-topl" start="4"><li class="gl-toprow hd" ${tpl} aria-hidden="true"><span></span><span></span><span>Участник</span>${C.map((c) => `<span title="${esc(c.title || "")}">${esc(c.name)}</span>`).join("")}</li>` +
						R.slice(3)
							.map(
								(x, j) =>
									`<li class="gl-toprow${mine(x)}" ${tpl} data-hero="${esc(x.tid)}" tabindex="0"><span class="gl-topn">${j + 4}</span>${heroFig(x.login)}<b>${esc(x.name || x.login || "игрок")}</b>${C.map((c, i) => `<span${i === 0 ? ' class="main"' : ""}>${num(x.v[c.k])}</span>`).join("")}</li>`,
							)
							.join("") +
						"</ol>"
					: "");
			pane.scrollTop = 0;
		});
	}

	const isMod = () => !!(W && W.data && W.data.mod);
	const modBtn = () =>
		isMod()
			? '<div class="gl-btns"><button type="button" class="gl-btn ghost" data-gm="panel">🛡 Модерация гильдий</button></div>'
			: "";

	function seeModHtml(g) {
		const me = W.data && W.data.mine && W.data.mine.member,
			own = me && String(me.guild) === String(g.id);
		const out = [];

		if (isMod())
			out.push(
				`<button type="button" class="gl-mini" data-gm="chat" data-g="${esc(g.id)}">Чат гильдии</button>`,
				`<button type="button" class="gl-mini bad" data-gm="reset" data-g="${esc(g.id)}" data-n="${esc(g.name)}">Сбросить название</button>`,
				`<button type="button" class="gl-mini" data-gm="lock" data-g="${esc(g.id)}" data-n="${esc(g.name)}">Запретить переименование</button>`,
			);
		return out.length ? `<div class="gl-modrow">${out.join("")}</div>` : "";
	}

	function askText(o) {
		return new Promise((done) => {
			if (!W) {
				done(null);
				return;
			}
			layerOff();
			const el = document.createElement("div");
			el.className = "gl-cf";
			el.innerHTML =
				`<div class="gl-cfw" role="alertdialog" aria-modal="true" aria-labelledby="glAskT"><h3 id="glAskT">${esc(o.title)}</h3>${o.text ? `<p>${esc(o.text)}</p>` : ""}` +
				`<label class="gl-cfn">${esc(o.label || "Причина (можно пусто)")}<textarea rows="3" maxlength="300" aria-label="${esc(o.label || "Причина")}"></textarea></label>` +
				(o.choices
					? `<div class="gl-btns gl-mins">${o.choices.map(([v, t]) => `<button type="button" class="gl-btn${o.bad ? " bad" : ""}" data-ok="${esc(v)}">${esc(t)}</button>`).join("")}</div>`
					: "") +
				`<div class="gl-btns">${o.choices ? "" : `<button type="button" class="gl-btn${o.bad ? " bad" : ""}" data-ok="1">${esc(o.btn || "Готово")}</button>`}<button type="button" class="gl-btn ghost" data-ok="">Отмена</button></div></div>`;
			W.el.appendChild(el);
			const ta = el.querySelector("textarea");
			const fin = (v) => {
				el.remove();
				document.removeEventListener("keydown", k1, true);
				if (W && W.layer === off) W.layer = null;
				done(v);
			};
			const off = () => fin(null);
			const k1 = (e) => {
				if (e.key === "Escape") {
					e.stopPropagation();
					fin(null);
				}
			};
			W.layer = off;
			document.addEventListener("keydown", k1, true);
			el.addEventListener("click", (e) => {
				const b = e.target.closest("[data-ok]");
				if (b)
					fin(
						b.dataset.ok
							? { v: b.dataset.ok, reason: String(ta.value || "").trim() }
							: null,
					);
				else if (e.target === el) fin(null);
			});
			try {
				ta.focus({ preventScroll: true });
			} catch (x) {
				console.warn("[гильдии] фокус окна", x);
			}
		});
	}
	const MOD_OK = {
		report: "Жалоба отправлена - модераторы посмотрят",
		nameReset: "Название сброшено",
		nameLock: "Готово",
		nameUnlock: "Запрет снят",
		nameNotice: "Уведомление отправлено",
		chatDel: "Сообщение удалено",
		chatMute: "Игрок не пишет в чаты гильдий",
		chatBan: "Игрок забанен в чатах гильдий",
		chatUnmute: "Запрет снят",
		reportDone: "Готово",
	};
	async function modAct(b, btn) {
		if (btn) btn.disabled = true;
		busyOn(true);
		try {
			const r = await api.mod(b);
			if (btn && btn.isConnected) btn.disabled = false;
			if (!r || !r.ok) {
				toast((r && r.error) || "не вышло", true);
				return r;
			}
			toast(r.msg || MOD_OK[b.op] || "Готово");
			return r;
		} finally {
			busyOn(false);
		}
	}
	async function gmClick(d, t) {
		if (W && W.busyN > 0) return;
		const g = d.g,
			n = d.n || "";
		if (d.gm === "panel") {
			await modPanel(W.modF || "new");
			return;
		}
		if (d.gm === "mtab") {
			await modPanel(d.f);
			return;
		}
		if (d.gm === "more") {
			await modPanel(W.modF, true);
			return;
		}
		if (d.gm === "chat") {
			await modChat(g);
			return;
		}
		if (d.gm === "reset") {
			const a = await askText({
				title: `Сбросить название «${n}»?`,
				text: "Гильдия станет «Гильдия #номер» без тега, глава получит запись в журнал. Открытые жалобы на название закроются.",
				bad: true,
				choices: [
					["0", "Сбросить"],
					["7", "Сбросить и запретить на 7 дней"],
					["30", "Сбросить и запретить на 30 дней"],
				],
			});
			if (
				a &&
				(
					await modAct(
						{ op: "nameReset", guild: g, days: +a.v, reason: a.reason },
						t,
					)
				).ok
			)
				await modRefresh(g);
			return;
		}

		if (d.gm === "notice") {
			const a = await askText({
				title: `Отправить уведомление главе «${n}»?`,
				text: "Глава получит уведомление: 24 часа на смену названия (бесплатно и без ожидания). Не сменит - название сбросится само, как кнопкой «Сбросить название».",
				btn: "Отправить",
			});
			if (
				a &&
				(await modAct({ op: "nameNotice", guild: g, reason: a.reason }, t)).ok
			)
				await modRefresh(g);
			return;
		}
		if (d.gm === "lock") {
			const a = await askText({
				title: `Запретить переименовывать «${n}»?`,
				choices: [
					["1", "1 день"],
					["7", "7 дней"],
					["30", "30 дней"],
					["0", "Снять запрет"],
				],
			});
			if (
				a &&
				(
					await modAct(
						{ op: "nameLock", guild: g, days: +a.v, reason: a.reason },
						t,
					)
				).ok
			)
				await modRefresh(g);
			return;
		}
		if (d.gm === "del") {
			if ((await modAct({ op: "chatDel", msg: d.msg }, t)).ok)
				await modRefresh();
			return;
		}
		if (d.gm === "mute") {
			const a = await askText({
				title: `Запретить ${n} писать во всех чатах гильдий альянса?`,
				choices: [
					["60", "1 час"],
					["1440", "1 день"],
					["10080", "7 дней"],
				],
			});
			if (
				a &&
				(
					await modAct(
						{ op: "chatMute", who: d.who, min: +a.v, reason: a.reason },
						t,
					)
				).ok
			)
				await modRefresh();
			return;
		}
		if (d.gm === "ban") {
			const a = await askText({
				title: `Забанить ${n} во всех чатах гильдий альянса?`,
				text: "Бессрочно; его сообщения удалятся из чатов гильдий. Снять - во вкладке «Запреты».",
				bad: true,
				btn: "Забанить",
			});
			if (
				a &&
				(await modAct({ op: "chatBan", who: d.who, reason: a.reason }, t)).ok
			)
				await modRefresh();
			return;
		}
		if (d.gm === "unmute") {
			if ((await modAct({ op: "chatUnmute", who: d.who }, t)).ok)
				await modRefresh();
			return;
		}
		if (d.gm === "done" || d.gm === "reopen") {
			if (
				(
					await modAct(
						{
							op: "reportDone",
							id: d.id,
							status: d.gm === "done" ? "done" : "new",
						},
						t,
					)
				).ok
			)
				await modRefresh();
		}
	}

	async function modRefresh(g) {
		if (!W) return;
		if (W.modF) await modPanel(W.modF);
		else if (W.modChat && W.body.querySelector(".gl-mchat, .gl-mchat-empty"))
			await modChat(W.modChat);
		else if (g && W.guild) await showGuild(g, true);
	}
	const MOD_TABS = [
		["new", "Жалобы"],
		["done", "Рассмотренные"],
		["bans", "Запреты"],
		["log", "Журнал"],
	];
	const LOG_RU = {
		gnamereset: "сбросил название",
		gnamelock: "запретил переименование",
		gnameopen: "снял запрет переименования",
		gchatdel: "удалил сообщение",
		gmute: "мут в чатах гильдий",
		gnamenotice: "отправил уведомление главе",
		gnameauto: "автосброс названия (срок вышел)",
		gnamefixed: "глава сменил название по уведомлению",
		gchatban: "бан в чатах гильдий",
		gunmute: "снял запрет чатов гильдий",
		greport: "закрыл жалобу",
	};

	async function modPanel(f, more) {
		if (!W) return;
		W.modF = f || "new";
		W.guild = null;
		W.el.classList.remove("gl-wide");
		const head =
			`<h2 id="glTitle">Модерация гильдий</h2><div class="gl-tabs" role="tablist">${MOD_TABS.map(([k, t]) => `<button type="button" role="tab" aria-selected="${W.modF === k}" data-gm="mtab" data-f="${k}">${t}</button>`).join("")}</div>` +
			'<div class="gl-btns"><button type="button" class="gl-btn ghost" data-gmback="1">← К списку гильдий</button></div><div class="gl-pane gl-modp"><p class="gl-note">Загружаю…</p></div>';
		W.body.innerHTML = head;
		const q = { f: W.modF === "done" ? "done" : "new" };
		if (more && W.modLast) q.before = W.modLast;
		const r = await api.modinfo(q);
		const pane = W && W.modF && W.body.querySelector(".gl-modp");
		if (!pane) return;
		if (!r || !r.ok) {
			pane.innerHTML = `<p class="gl-note">${esc((r && r.error) || "не вышло")}</p>`;
			return;
		}
		if (W.modF === "bans") {
			pane.innerHTML = bansHtml(r.bans || []);
			return;
		}
		if (W.modF === "log") {
			pane.innerHTML = modLogHtml(r.log || []);
			return;
		}
		const reps = r.reports || [];
		W.modLast = reps.length ? reps[reps.length - 1].id : null;
		pane.innerHTML = reps.length
			? `<ul class="gl-reps">${reps.map(repHtml).join("")}</ul>` +
				(reps.length >= 100
					? '<button type="button" class="gl-btn ghost" data-gm="more">Показать ещё</button>'
					: "")
			: `<p class="gl-note">${W.modF === "done" ? "Рассмотренных жалоб нет." : "Новых жалоб нет."}</p>`;
	}
	function repHtml(x) {
		const s = x.snap || {},
			who = esc(x.bl || "игрок"),
			when = esc(dt(x.at)),
			done = x.status === "done";
		const foot = `<div class="gl-modrow">${done ? `<button type="button" class="gl-mini" data-gm="reopen" data-id="${esc(x.id)}">Вернуть в новые</button>` : `<button type="button" class="gl-mini" data-gm="done" data-id="${esc(x.id)}">Закрыть жалобу</button>`}</div>`;
		if (x.kind === "name") {
			const now = Date.now(),
				pend = x.notice && +x.notice > now,
				locked = x.lock && +x.lock > now;
			const nb = locked
				? `<button type="button" class="gl-mini" data-gm="notice" disabled aria-disabled="true" title="Переименование запрещено - сначала снимите запрет">Отправить уведомление лидеру</button>`
				: `<button type="button" class="gl-mini" data-gm="notice" data-g="${esc(x.guild)}" data-n="${esc(s.name || "")}">Отправить уведомление лидеру</button>`;
			return (
				`<li class="gl-rep"><p><b>Название:</b> «${esc(s.name || "")}»${s.tag ? ` [${esc(s.tag)}]` : ""} <small>· жалоба от ${who} · ${when}</small></p>${x.reason ? `<p class="gl-why">${esc(x.reason)}</p>` : ""}` +
				(x.guild && !done && pend
					? `<p class="gl-warn gl-sm gl-ntc">Уведомление отправлено, срок до ${esc(dt(x.notice))}</p>`
					: "") +
				(x.guild && !done && locked
					? '<p class="gl-note gl-sm gl-ntc">Переименование запрещено - уведомление главе не отправить.</p>'
					: "") +
				(x.guild && !done
					? `<div class="gl-modrow">${nb}<button type="button" class="gl-mini bad" data-gm="reset" data-g="${esc(x.guild)}" data-n="${esc(s.name || "")}">Сбросить название</button><button type="button" class="gl-mini" data-gm="lock" data-g="${esc(x.guild)}" data-n="${esc(s.name || "")}">Запретить переименование</button></div>`
					: "") +
				(done && x.note
					? `<p class="gl-note gl-sm gl-ntc">${esc(x.note)}</p>`
					: "") +
				(x.guild ? "" : '<p class="gl-note gl-sm">Гильдии уже нет.</p>') +
				foot +
				"</li>"
			);
		}
		const L = Array.isArray(s.list) ? s.list : [];
		const lines = L.map(
			(m) =>
				`<li class="${String(m.id) === String(s.msg) ? "hit" : ""}">${String(m.tid) === "0" ? `<i>${esc(m.t)}</i>` : `<b>${esc(m.n || m.l)}</b> ${esc(m.t)}`}</li>`,
		).join("");
		const tl = x.tl || "";
		return (
			`<li class="gl-rep"><p><b>Чат гильдии «${esc(s.name || "")}»:</b> сообщение ${esc(tl)} <small>· жалоба от ${who} · ${when}</small></p>${x.reason ? `<p class="gl-why">${esc(x.reason)}</p>` : ""}` +
			`<ol class="gl-snap">${lines}</ol>` +
			(!done && x.tg
				? `<div class="gl-modrow"><button type="button" class="gl-mini" data-gm="del" data-msg="${esc(s.msg)}">Удалить сообщение</button><button type="button" class="gl-mini" data-gm="mute" data-who="${esc(x.tg)}" data-n="${esc(tl)}">Мут…</button><button type="button" class="gl-mini bad" data-gm="ban" data-who="${esc(x.tg)}" data-n="${esc(tl)}">Бан в чатах гильдий</button></div>`
				: "") +
			foot +
			"</li>"
		);
	}
	function bansHtml(L) {
		if (!L.length)
			return '<p class="gl-note">Запретов в чатах гильдий нет.</p>';
		return `<ul class="gl-mem">${L.map((b) => `<li><span class="gl-mn"><b>${esc(b.l || b.tid)}</b><small>${b.until ? `мут до ${esc(dt(b.until))}` : "бан"}${b.by ? ` · ${esc(b.by)}` : ""}${b.reason ? ` · ${esc(b.reason)}` : ""}</small></span><span class="gl-ma"><button type="button" class="gl-mini" data-gm="unmute" data-who="${esc(b.tid)}">Снять</button></span></li>`).join("")}</ul>`;
	}
	function modLogHtml(L) {
		if (!L.length)
			return '<p class="gl-note">Действий модераторов пока нет.</p>';
		return `<ul class="gl-log">${L.map((e) => `<li class="gl-lg"><span class="gl-lgt"><b>${esc(e.by || "")}</b> ${esc(LOG_RU[e.kind] || e.kind || "")}${e.login ? `: <b>${esc(e.login)}</b>` : ""}${e.reason ? ` - ${esc(e.reason)}` : ""}</span><time>${esc(dt(e.at))}</time></li>`).join("")}</ul>`;
	}

	async function modChat(gid) {
		if (!W) return;
		const r = await api.chatOf(gid);
		if (!W) return;
		const name = (W.guild && W.guild.guild && W.guild.guild.name) || "";
		const L = r && r.ok ? r.msgs || [] : [];
		W.body.innerHTML =
			`<h2 id="glTitle">Чат гильдии${name ? ` «${esc(name)}»` : ""}</h2><div class="gl-btns"><button type="button" class="gl-btn ghost" data-see="${esc(gid)}">← К гильдии</button></div>` +
			(!r || !r.ok
				? `<p class="gl-note">${esc((r && r.error) || "не вышло")}</p>`
				: !L.length
					? '<p class="gl-note gl-mchat-empty">Сообщений нет.</p>'
					: `<ul class="gl-mem gl-mchat">${L.map(
							(m) =>
								`<li><span class="gl-mn">${String(m.tid) === "0" ? `<small>${esc(m.t)}</small>` : `<b>${esc(m.n || m.l)}</b><span>${esc(m.t)}</span><small>${esc(dt(m.at))}</small>`}</span>` +
								(String(m.tid) === "0"
									? ""
									: `<span class="gl-ma"><button type="button" class="gl-mini" data-gm="del" data-msg="${esc(m.id)}">Удалить</button><button type="button" class="gl-mini" data-gm="mute" data-who="${esc(m.tid)}" data-n="${esc(m.n || m.l)}">Мут…</button></span>`) +
								"</li>",
						).join("")}</ul>`);
		W.modChat = gid;
	}

	const LOG_OUT = {
		win: "победа",
		lose: "поражение",
		draw: "ничья",
		failed: "сорвано",
	};
	const LOG_ICO = {
		gmute: "🔇",
		gunmute: "🔈",
		create: "✚",
		join: "➕",
		leave: "🚪",
		kick: "⛔",
		invite: "✉",
		refuse: "✖",
		role: "🛡",
		leader: "👑",
		open: "🔓",
		profile: "🖋",
		rename: "🏷",
		move: "🧭",
		level: "⭐",
		xp: "✨",
		war: "⚔️",
		run: "🥾",
		runplan: "🥾",
		raid: "🐉",
		namereset: "⚖",
	};
	const who = (e) => `<b>${esc(e.n || e.l || "игрок")}</b>`;
	const byW = (e) => (e.by ? `<b>${esc(e.by)}</b>` : "кто-то");

	function logText(e) {
		const d = e.d || {};
		switch (e.k) {
			case "create":
				return `${byW(e)} создал гильдию «${esc(d.name || "")}»${d.tag ? ` [${esc(d.tag)}]` : ""}`;
			case "join":
				return d.via === "apply"
					? `${byW(e)} принял заявку - ${who(e)} в гильдии`
					: d.via === "invite"
						? `${who(e)} вступил по приглашению`
						: `${who(e)} вступил в гильдию`;
			case "leave":
				return d.why === "ban"
					? `${who(e)} покинул гильдию: стример закрыл ему вход в гильдии альянса`
					: d.why === "hero"
						? `${who(e)} покинул гильдию: герой переехал на другой канал`
						: d.why === "move"
							? `${who(e)} не стал переезжать с гильдией и вышел`
							: `${who(e)} вышел из гильдии`;
			case "kick":
				return `${byW(e)} исключил ${who(e)}`;
			case "invite":
				return `${byW(e)} пригласил ${who(e)}`;
			case "refuse":
				return `${who(e)} отказался от приглашения`;
			case "role":
				return `${byW(e)}: ${who(e)} - ${esc(ROLE[d.role] || d.role || "")}`;
			case "leader":
				return d.auto
					? `${who(e)} - новый глава (прежний глава покинул гильдию)`
					: `${byW(e)} передал главу - теперь глава ${who(e)}`;
			case "leaderswap":
				return `${who(e)} - новый глава: прежний глава${d.was ? ` <b>${esc(d.was)}</b>` : ""} не заходил ${Math.round(+d.days || 14)} дн. и перешёл в руководство`;
			case "open":
				return d.open
					? `${byW(e)} открыл набор - вступают в один клик`
					: `${byW(e)} закрыл набор - только по заявке`;
			case "profile":
				return `${byW(e)} обновил ${d.descr && d.emblem ? "описание и герб" : d.emblem ? "герб" : "описание"}`;
			case "rename":
				return `${byW(e)} переименовал гильдию: «${esc(d.was || "")}» → «${esc(d.name || "")}»${d.tag ? ` [${esc(d.tag)}]` : ""}`;
			case "move":
				return `${byW(e)} перевёл гильдию в альянс <b>${esc(d.to || "")}</b>`;
			case "level":
				return `<b>Гильдия получила ${Math.round(+d.level || 0)} уровень!</b>`;
			case "xp":
				return `${who(e)} принёс гильдии <b>${Math.round(+e.xp || 0)}</b> опыта за день`;
			case "war":
				return (
					`Мини-сражение «${esc(d.title || "")}»${d.opp ? ` против: ${esc(d.opp)}` : ""} - <b>${esc(LOG_OUT[d.outcome] || d.outcome || "")}</b>` +
					(d.outcome === "failed"
						? d.reason
							? ` (${esc(d.reason)})`
							: ""
						: `${d.n ? `, бойцов ${Math.round(+d.n)}` : ""}${d.gxp ? `, +${Math.round(+d.gxp)} опыта гильдии` : ""}`)
				);
			case "run":
				return `Вылазка${d.place ? ` «${esc(d.place)}»` : ""} пройдена: ${(d.members || []).map((x) => `<b>${esc(x)}</b>`).join(", ")}${d.full ? " - полным составом" : ""}${d.noDead ? ", без павших" : ""}`;
			case "runplan": {
				const pl = d.place ? ` «${esc(d.place)}»` : "",
					t = esc(dt(d.at));
				return d.op === "plan"
					? `${byW(e)} назначил вылазку${pl} на <b>${t}</b>`
					: d.op === "move"
						? `${byW(e)} перенёс вылазку${pl} на <b>${t}</b>`
						: d.op === "cancel"
							? `${byW(e)} отменил вылазку${pl} (${t})`
							: d.op === "fail"
								? `Вылазка${pl} не состоялась: собралось ${Math.round(+d.n || 0)} из ${Math.round(+d.min || 0)}`
								: "";
			}
			case "raid":
				return `<b>Рейд: босс повержен!</b>${d.n ? ` Участников - ${Math.round(+d.n)}` : ""}`;

			case "city":
				return d.op === "got"
					? `Гильдия управляет городом <b>«${esc(d.name || "")}»</b>`
					: `Гильдия больше не управляет городом <b>«${esc(d.name || "")}»</b>`;
			case "siege":
				return d.phase === "end"
					? `Осада <b>«${esc(d.name || "")}»</b> кончилась${d.outcome ? ` - ${esc(d.outcome === "win" ? "город отстояли" : d.outcome === "lose" ? "город взяли" : d.outcome)}` : ""}`
					: `<b>На наш город идут:</b> «${esc(d.name || "")}»${d.atk ? `, осаждает ${esc(d.atk)}` : ""}`;
			case "mark":
				return `${byW(e)} ${d.kind === "none" ? "снял метку с гильдии" : `отметил гильдию как <b>${d.kind === "ally" ? "союзника" : "врага"}</b>:`} ${d.tag ? `[${esc(d.tag)}] ` : ""}${esc(d.name || "")}`;
			case "cmlobby":
				return `${who(e)} собирает группу на элитного <b>«${esc(d.name || "")}»</b> у стен`;
			case "gmute":
				return `${byW(e)} запретил ${who(e)} писать в чат гильдии на ${esc(minRu(d.min))}${d.reason ? `. Причина: ${esc(d.reason)}` : ""}`;
			case "gunmute":
				return `${byW(e)} снова разрешил ${who(e)} писать в чат гильдии`;
			case "namereset":
				return d.auto
					? `Срок на смену названия «${esc(d.was || "")}» вышел - теперь «${esc(d.name || "")}»`
					: `Модератор сбросил название «${esc(d.was || "")}» - теперь «${esc(d.name || "")}»`;
			default:
				return "";
		}
	}

	const LOG_HIDE = new Set(["xp"]);
	const LOG_CATS = [
		["fight", "Бои", "war"],
		["guild", "Гильдия", "main"],
		["mem", "Участники", "members"],
	];
	const LOG_ICO2 = {
		cmlobby: "📯",
		minlevel: "🚪",
		gstar: "⭐",
		gskill: "⏳",
		gskilldone: "📈",
		city: "🏰",
		siege: "⚔️",
		mark: "🏳",
	};
	function logShort(e) {
		const d = e.d || {};
		switch (e.k) {
			case "create":
				return `Гильдия «${esc(d.name || "")}» создана`;
			case "join":
				return `${who(e)} вступил в гильдию`;
			case "leave":
				return `${who(e)} вышел из гильдии`;
			case "kick":
				return `${who(e)} исключён`;
			case "role":
				return `${who(e)} - теперь ${esc(ROLE[d.role] || d.role || "")}`;
			case "leader":
				return `${who(e)} - новый глава`;
			case "leaderswap":
				return `${who(e)} - новый глава: прежний${d.was ? ` (${esc(d.was)})` : ""} не заходил ${Math.round(+d.days || 14)} дн.`;
			case "open":
				return d.open ? "Набор открыт" : "Набор закрыт - только по заявке";
			case "rename":
				return `Новое название: «${esc(d.name || "")}»`;
			case "move":
				return `Гильдия перешла в альянс <b>${esc(d.to || "")}</b>`;
			case "level":
				return `<b>Гильдия получила ${Math.round(+d.level || 0)} уровень!</b>`;
			case "war":
				return `Мини-сражение «${esc(d.title || "")}» - <b>${esc(LOG_OUT[d.outcome] || d.outcome || "")}</b>`;
			case "run":
				return `Вылазка${d.place ? ` «${esc(d.place)}»` : ""} пройдена`;
			case "runplan": {
				const pl = d.place ? ` «${esc(d.place)}»` : "";
				return d.op === "plan"
					? `Вылазка${pl} назначена на <b>${esc(dt(d.at))}</b>`
					: d.op === "move"
						? `Вылазка${pl} перенесена на <b>${esc(dt(d.at))}</b>`
						: d.op === "cancel"
							? `Вылазка${pl} отменена`
							: d.op === "fail"
								? `Вылазка${pl} не состоялась`
								: "";
			}
			case "raid":
				return "<b>Рейд: босс повержен!</b>";
			case "city":
				return d.op === "got"
					? `Наш город: <b>«${esc(d.name || "")}»</b>`
					: `Город потерян: <b>«${esc(d.name || "")}»</b>`;
			case "siege":
				return d.phase === "end"
					? `Осада «${esc(d.name || "")}» кончилась`
					: `<b>На наш город идут:</b> «${esc(d.name || "")}»`;
			case "mark":
				return `Метка: ${esc(d.name || "")} - ${d.kind === "ally" ? "союзник" : d.kind === "enemy" ? "враг" : "снята"}`;
			case "namereset":
				return `Название сброшено - теперь «${esc(d.name || "")}»`;
			case "cmlobby":
				return `${who(e)} собирает группу на элитного «${esc(d.name || "")}»`;
			case "minlevel":
				return `Вступление - с ${Math.round(+d.level || 1)} уровня героя`;

			case "gstar":
				return `<b>Гильдия получила Звезду гильдии № ${Math.round(+d.n || 0)}</b>`;
			case "gskill":
				return `${byW(e)} поставил навык «${esc(d.name || "")}» на улучшение до ${Math.round(+d.to || 0)} ур.`;
			case "gskilldone":
				return `Навык «${esc(d.name || "")}» улучшен до <b>${Math.round(+d.lv || 0)} ур.</b>`;
			case "invite":
				return `${byW(e)} пригласил ${who(e)}`;
			case "refuse":
				return `${who(e)} отказался от приглашения`;
			case "profile":
				return "Описание гильдии обновлено";
			case "gmute":
				return `${who(e)} - запрет чата гильдии на ${esc(minRu(d.min))}`;
			case "gunmute":
				return `${who(e)} снова пишет в чат гильдии`;
			default:
				return "";
		}
	}
	const minRu = (m) => {
		m = Math.round(+m || 0);
		return m < 60
			? `${m} мин`
			: m < 1440
				? `${Math.round(m / 60)} ч`
				: `${Math.round(m / 1440)} дн.`;
	};
	const dayKey = (ms) => {
		const x = new Date(+ms);
		return `${x.getFullYear()}-${x.getMonth()}-${x.getDate()}`;
	};
	function dayName(ms) {
		const k = dayKey(ms),
			now = Date.now();
		if (k === dayKey(now)) return "Сегодня";
		if (k === dayKey(now - 864e5)) return "Вчера";
		try {
			return new Date(+ms).toLocaleDateString("ru-RU", {
				day: "numeric",
				month: "long",
			});
		} catch {
			return "";
		}
	}
	const hm = (ms) => {
		try {
			return new Date(+ms).toLocaleTimeString("ru-RU", {
				hour: "2-digit",
				minute: "2-digit",
			});
		} catch {
			return "";
		}
	};
	function logHtml(L) {
		let out = "",
			day = "";
		for (const e of L.rows) {
			const t = LOG_HIDE.has(e.k) ? "" : logShort(e);
			if (!t) continue;
			const k = dayKey(e.at);
			if (k !== day) {
				if (day) out += "</ul>";
				day = k;
				out += `<h3 class="gl-logd">${esc(dayName(e.at))}</h3><ul class="gl-log">`;
			}
			out += `<li class="gl-lg k-${esc(e.k)}"><span class="gl-lgi" aria-hidden="true">${LOG_ICO[e.k] || LOG_ICO2[e.k] || "•"}</span><span class="gl-lgt">${t}</span><time>${esc(hm(e.at))}</time></li>`;
		}
		if (day) out += "</ul>";
		if (!out)
			out = `<p class="gl-note">${({ fight: "Боёв пока не было: здесь появятся мини-сражения, вылазки, рейды и сборы на элитных.", guild: "Событий гильдии пока нет: здесь появятся новые уровни, смена названия и набора.", mem: "Пока пусто: здесь видно, кто вступил, вышел, кого исключили и повысили." })[L.cat] || "В журнале пока пусто."}</p>`;
		return (
			out +
			(L.more
				? `<button type="button" class="gl-btn ghost" data-logmore="1"${L.busy ? " disabled" : ""}>Показать ещё</button>`
				: "")
		);
	}
	async function logTab(pane, more) {
		const gid = W.guild && String(W.guild.guild.id);
		if (!more || !W.log || W.log.gid !== gid) {
			W.log = {
				gid,
				cat: W.logCat || "fight",
				rows: [],
				more: false,
				busy: true,
			};

			const was = W.logC && W.logC[gid + "|" + W.log.cat];
			if (was) {
				pane.innerHTML = logHtml({ ...was, busy: true });
				pane.scrollTop = 0;
			} else if (pane.firstChild) pane.classList.add("gl-wait");
			else pane.innerHTML = '<p class="gl-note">Открываю журнал…</p>';
		}
		const L = W.log;
		L.busy = true;
		const r = await api.log(
			more && L.rows.length ? L.rows[L.rows.length - 1].id : "",
			L.cat,
		);
		if (!W || W.log !== L) return;
		L.busy = false;
		const p = subPane("log");
		if (!p) return;
		if (!r || !r.ok) {
			p.classList.remove("gl-wait");
			p.innerHTML = `<p class="gl-note">${esc((r && r.error) || "Журнал не открылся - попробуй ещё раз")}</p>`;
			return;
		}
		L.rows = more ? L.rows.concat(r.log || []) : r.log || [];
		L.more = !!r.more;
		(W.logC || (W.logC = {}))[gid + "|" + L.cat] = {
			cat: L.cat,
			rows: L.rows,
			more: L.more,
		};
		const top = more ? p.scrollTop : 0;
		p.classList.remove("gl-wait");
		p.innerHTML = logHtml(L);
		p.scrollTop = top;
	}

	const runOn = () => !!(W && W.runOk);
	let runP = null;
	function runLoad() {
		if (window.LGGuildRun) return Promise.resolve();
		if (runP) return runP;
		const v = (n) => (window.LG_SITEF || {})[n] || "";
		runP = new Promise((ok, no) => {
			if (!document.querySelector("link[data-gr]")) {
				const l = document.createElement("link");
				l.rel = "stylesheet";
				l.href = `/site/guildrun.css?v=${v("guildrun.css")}`;
				l.dataset.gr = "1";
				document.head.appendChild(l);
			}
			const sc = document.createElement("script");
			sc.src = `/site/guildrun.js?v=${v("guildrun.js")}`;
			sc.onload = () => ok();
			sc.onerror = (e) => {
				runP = null;
				no(e);
			};
			document.head.appendChild(sc);
		});
		return runP;
	}
	function runTab(pane) {
		pane.innerHTML = '<p class="gl-note">Смотрю вылазки…</p>';
		runLoad()
			.then(() => {
				if (W && pane.isConnected) window.LGGuildRun.tab(pane);
			})
			.catch(() => {
				pane.innerHTML =
					'<p class="gl-note">Вылазки не загрузились - попробуй ещё раз.</p>';
			});
	}

	let raidP = null;
	function raidLoad() {
		if (window.LGGuildRaid) return Promise.resolve();
		if (raidP) return raidP;
		const v = (n) => (window.LG_SITEF || {})[n] || "";
		raidP = new Promise((ok, no) => {
			if (!document.querySelector("link[data-grd]")) {
				const l = document.createElement("link");
				l.rel = "stylesheet";
				l.href = `/site/guildraid.css?v=${v("guildraid.css")}`;
				l.dataset.grd = "1";
				document.head.appendChild(l);
			}
			const sc = document.createElement("script");
			sc.src = `/site/guildraid.js?v=${v("guildraid.js")}`;
			sc.onload = () => ok();
			sc.onerror = (e) => {
				raidP = null;
				no(e);
			};
			document.head.appendChild(sc);
		});
		return raidP;
	}

	const SUM_GAP = 90e3;
	const xget = (p) =>
		fetch(base() + p, { credentials: "same-origin" }).then((x) => x.json());
	const xpost = (p, b) =>
		fetch(base() + p, {
			method: "POST",
			credentials: "same-origin",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(b),
		})
			.then(
				(x) => x.json(),
				() => NET,
			)
			.catch(() => NET);
	async function runView() {
		try {
			const r = await xget("/api/guildrun");
			if (!W) return;
			W.runOk = !!(r && r.ok);
			W.runView = W.runOk ? r : null;
			W.runN = W.runOk && r.plan ? 1 : 0;
		} catch (e) {
			if (W && W.runOk === undefined) W.runOk = false;
		}
	}
	async function raidView() {
		try {
			const r = await xget("/api/guildraid");
			if (!W) return;
			W.raidOk = !!(r && r.ok && r.guild);
			W.raidView = W.raidOk ? r : null;
		} catch (e) {}
	}

	async function cmView() {
		try {
			const r = await xpost("/api/citymon/act", { op: "elist" });
			if (!W) return;
			W.cmOk = !!(r && r.ok && r.guild);
			W.cmList = W.cmOk ? (r.list || []).filter((L) => L.st === "open") : [];
			W.cmMine = W.cmOk ? r.mine || null : null;
		} catch (e) {}
	}
	async function warView() {
		if (W) W.warE = null;
	}
	async function gqView() {
		if (!(window.LGDailies && window.LGDailies.open)) {
			W.gq = null;
			return;
		}
		try {
			const r = await xget("/api/dailies");
			if (W) {
				W.dl = r && r.ok ? r : null;
				W.gq =
					r && r.ok && r.gq
						? { guild: r.gq.guild || [], mine: r.gq.mine || [] }
						: null;
			}
		} catch (e) {}
	}
	const runGather = () => {
		const P = W && W.runView && W.runView.plan;
		return P && P.st === "gather" ? P : null;
	};
	const cmOn = () => !!(W && W.cmOk);
	const gatherN = () => (W ? (W.cmList || []).length : 0);
	const sumKey = () => {
		const R = W.raidView,
			E = W.warE;
		return JSON.stringify([
			W.runOk,
			W.runView && W.runView.plan,
			W.raidOk,
			R && [R.st, R.plan && R.plan.at, R.joined, R.me],
			W.cmOk,
			W.cmList,
			W.cmMine,
			E && [E.entry, E.signed, E.count, E.canSign],
			W.gq,
			giftCnt(),
		]);
	};
	const typing = () =>
		!!(
			W &&
			(W.layer ||
				(document.activeElement &&
					W.el.contains(document.activeElement) &&
					/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)))
		);

	function summary(force) {
		if (!W || !W.guild || !W.guild.me) return Promise.resolve();
		if (W.sumP) return W.sumP;

		if (W.tab !== "main") {
			W.sumDirty = true;
			return Promise.resolve();
		}
		W.sumDirty = false;
		const main = W.tab === "main";
		if (
			!force &&
			Date.now() - (main ? W.sumMainAt || 0 : W.sumAt || 0) < SUM_GAP
		)
			return Promise.resolve();
		const was = W.sumAt ? sumKey() : "";
		const jobs = [
			runView(),
			raidView(),
			cmView(),
			...(main ? [warView(), gqView()] : []),
		];
		const S = W;
		S.sumP = Promise.all(
			jobs.map((p) => p.catch((e) => console.warn("[гильдии] сводка", e))),
		).then(() => {
			S.sumP = null;
			S.sumAt = Date.now();
			if (main) S.sumMainAt = S.sumAt;
			if (W !== S || !W.guild) return;
			if (sumKey() !== was) repaintSum();
		});
		return S.sumP;
	}
	function repaintSum() {
		if (!W || !W.guild || !W.guild.me) return;
		if (W.tab === "main" && !typing()) paintTab();
	}

	let sumT = 0;
	window.addEventListener("lg-gchat", (e) => {
		const d = e && e.detail;
		if (
			!W ||
			!W.guild ||
			!W.guild.me ||
			!d ||
			d.k !== "msgs" ||
			!(Array.isArray(d.msgs) && d.msgs.some((m) => m && String(m.tid) === "0"))
		)
			return;
		if (sumT) return;
		sumT = setTimeout(
			() => {
				sumT = 0;
				if (
					W &&
					!document.hidden &&
					W.tab === "main" &&
					Date.now() - (W.sumAt || 0) > 15e3
				)
					void summary(true);
			},
			2e3 + Math.round(Math.random() * 3e3),
		);
	});

	let cmP = null;
	function cmLoad() {
		if (window.LGCityMon) return Promise.resolve();
		if (cmP) return cmP;
		const v = (n) => (window.LG_SITEF || {})[n] || "";
		cmP = new Promise((ok, no) => {
			if (!document.querySelector("link[data-cm]")) {
				const l = document.createElement("link");
				l.rel = "stylesheet";
				l.href = `/site/citymon.css?v=${v("citymon.css")}`;
				l.dataset.cm = "1";
				document.head.appendChild(l);
			}
			const sc = document.createElement("script");
			sc.src = `/site/citymon.js?v=${v("citymon.js")}`;
			sc.onload = () => ok();
			sc.onerror = (e) => {
				cmP = null;
				no(e);
			};
			document.head.appendChild(sc);
		});
		return cmP;
	}
	function cmTab(pane, inWin) {
		const P = runGather();
		pane.innerHTML =
			(P ? '<div class="gl-cm-run"></div>' : "") +
			(W.cmOk
				? '<div class="gl-cm-el"><p class="gl-note">Смотрю сборы…</p></div>'
				: "") +
			(!P && !W.cmOk ? '<p class="gl-note">Активных сборов нет.</p>' : "");
		const rs = pane.querySelector(".gl-cm-run");
		if (rs)
			runLoad()
				.then(() => {
					if (rs.isConnected && window.LGGuildRun.banner)
						window.LGGuildRun.banner(rs, W.runView);
				})
				.catch(() => rs.remove());
		const el = pane.querySelector(".gl-cm-el");
		if (!el) return;
		cmLoad()
			.then(() =>
				W && (inWin || W.tab === "cm") && el.isConnected
					? window.LGCityMon.lobbies(el, { open: true })
					: null,
			)
			.then((n) => {
				if (!W || n == null) return;
				void cmView().then(() => repaintSum());
			})
			.catch(() => {
				el.innerHTML =
					'<p class="gl-note">Сборы не загрузились - попробуй ещё раз.</p>';
			});
	}

	const FIGS = new Map(),
		FIGC = new Map();
	const figKeep = (list) => {
		for (const x of list || []) {
			const l = String((x && x.login) || "").toLowerCase(),
				h = x && x.hero;
			if (!l || !h) continue;
			const k = JSON.stringify([h.look || null, h.gear || null]),
				was = FIGS.get(l);
			if (!was || was.k !== k) {
				FIGS.set(l, { k, look: h.look || null, gear: h.gear || null });
				for (const st of GST) FIGC.delete(st + "|" + l);
			}
		}
	};
	const heroFig = (login) => {
		const l = String(login || "").toLowerCase(),
			ck = gst() + "|" + l;
		if (l && FIGC.has(ck)) return FIGC.get(ck);
		let out = "";
		try {
			const D = window.MDDoodle;
			if (D && D.jDoodle && l) {
				const f = FIGS.get(l) || {},
					seed = D.jhash ? D.jhash(l) : 1;
				const svg = String(
					D.jDoodle(
						seed,
						"stern",
						false,
						{ alive: true, armed: true, gear: f.gear || {}, who: l },
						f.look || null,
					) || "",
				).replace(
					/<(animate|animateTransform|animateMotion|set)\b[^>]*?(\/>|>[\s\S]*?<\/\1>)/g,
					"",
				);
				if (svg) out = `<span class="gl-hf">${svg}</span>`;
			}
		} catch (e) {
			console.warn("[гильдии] человечек героя", e);
		}
		if (!out) return `<span class="gl-hf gl-hf0">${ico("novice", 30)}</span>`;
		if (FIGC.size > 600) FIGC.clear();
		FIGC.set(ck, out);
		return out;
	};
	const monFig = (eid) => {
		let v = "";
		try {
			const A = window.LGCityMonArt;
			v = A && A.fig ? A.fig(eid, {}) : "";
		} catch (e) {
			console.warn("[гильдии] монстр", e);
		}
		return v || ico("war", 60);
	};
	const leftM = (at) => {
		const m = Math.max(1, Math.ceil((+at - Date.now()) / 60e3));
		return m < 60 ? `${m} мин` : `${Math.ceil(m / 60)} ч`;
	};
	function gatherCard(o) {
		const heroes =
			o.members
				.map(
					(m) =>
						`<li class="${m.login === o.leader ? "lead" : ""}${m.me ? " me" : ""}">${heroFig(m.login)}<b>${esc(m.name || m.login)}</b><small>${m.login === o.leader ? "собирает" : m.level ? `${m.level} ур.` : "в отряде"}</small></li>`,
				)
				.join("") +
			Array.from(
				{ length: Math.max(0, o.max - o.members.length) },
				(_, i) =>
					`<li class="empty"><span class="gl-hf gl-hf0" aria-hidden="true">+</span><small>${o.members.length + i < o.min ? "нужен" : "свободно"}</small></li>`,
			).join("");
		const lead = o.members.find((m) => m.login === o.leader) || {
			name: o.leader,
		};
		return (
			`<article class="gl-gc${o.mine ? " mine" : ""}" data-gc="${esc(o.key)}"${o.hint ? ` title="${esc(o.hint)}"` : ""}><div class="gl-gc-pic${o.elite ? " elite" : ""}">${o.pic}</div>` +
			`<div class="gl-gc-main"><small class="gl-gc-k">${esc(o.kind)}</small><h4>${esc(o.title)}${o.sub ? ` <span>${esc(o.sub)}</span>` : ""}</h4>` +
			`<p class="gl-gc-lead">Собирает <b>${ico("crown", 16)}${esc(lead.name || o.leader)}</b></p></div>` +
			`<div class="gl-gc-side"><b class="gl-gc-n">${o.members.length} из ${o.max}</b><small>${esc(o.when)}</small></div>` +
			`<ul class="gl-gc-heroes" aria-label="Кто в сборе">${heroes}</ul><div class="gl-gc-btns">${o.btns}</div></article>`
		);
	}
	async function gatherFill(pane) {
		if (!pane.querySelector(".gl-gcs"))
			pane.innerHTML = '<p class="gl-note">Смотрю сборы…</p>';
		const cm = await xpost("/api/citymon/act", { op: "elist" });
		if (!W || !pane.isConnected) return;
		const myLogin = String(
				(W.guild.me && W.guild.me.login) || "",
			).toLowerCase(),
			cards = [];
		const list =
			cm && cm.ok && cm.guild
				? (cm.list || []).filter((L) => L.st === "open")
				: [];
		for (const L of list) {
			const mem = L.members.map((m) => ({
				...m,
				me: String(m.login).toLowerCase() === myLogin,
			}));
			cards.push(
				gatherCard({
					key: L.id,
					elite: true,
					kind: `Элитный монстр · ${L.lvl} ур.`,
					title: L.name,
					sub: L.tier != null ? "☠".repeat(L.tier + 1) : "",
					pic: monFig(L.eid),
					leader: L.leader,
					members: mem,
					max: L.max,
					min: L.min,
					mine: L.mine,
					when: `распустится через ${leftM(L.until)}`,
					hint: L.hint,
					btns: L.mine
						? L.lead
							? `<button type="button" class="gl-btn" data-cm="estart"${L.members.length >= L.min ? "" : " disabled"}>Начать бой</button><button type="button" class="gl-btn ghost" data-cm="edisband">Распустить</button>`
							: '<button type="button" class="gl-btn ghost" data-cm="eleave">Выйти из сбора</button>'
						: cm.mine
							? "<small>ты уже в другом сборе</small>"
							: `<button type="button" class="gl-btn" data-cm="ejoin" data-id="${esc(L.id)}"${L.members.length >= L.max ? " disabled" : ""}>Присоединиться</button>`,
				}),
			);
		}
		W.cmOk = !!(cm && cm.ok && cm.guild);
		W.cmList = list;
		W.cmMine = W.cmOk ? cm.mine || null : null;
		pane.innerHTML = `<div class="gl-gcs">${cards.join("") || '<p class="gl-note">Активных сборов нет. Собрать группу на элитного - кликни по нему у стен города.</p>'}</div>`;
		pane.onclick = async (e) => {
			const b = e.target.closest("[data-cm]");
			if (!b || b.disabled) return;
			b.disabled = true;
			const r = await xpost(
				"/api/citymon/act",
				b.dataset.cm === "ejoin"
					? { op: "ejoin", id: b.dataset.id }
					: { op: b.dataset.cm },
			);
			if (!r || !r.ok) {
				toast((r && r.error) || "не вышло", true);
				if (b.isConnected) b.disabled = false;
				return;
			}
			if (r.msg) toast(r.msg);
			if (W && pane.isConnected) {
				await gatherFill(pane);
				const sb = W.sub && W.sub.el.querySelector('[data-seg="cm"]');
				if (sb) {
					const n = gatherN(),
						bd = sb.querySelector(".gl-badge");
					if (bd) bd.remove();
					if (n)
						sb.insertAdjacentHTML("beforeend", ` <b class="gl-badge">${n}</b>`);
				}
			}
		};
	}

	const hLeft = (ms) => {
		const m = Math.max(1, Math.ceil(ms / 60e3));
		return m < 60
			? `${m} мин`
			: `${Math.floor(m / 60)} ч${m % 60 ? ` ${m % 60} мин` : ""}`;
	};
	function gskillTab(pane) {
		const paint = (r) => {
			if (!W || !pane.isConnected) return;
			if (!r || !r.ok) {
				pane.innerHTML = `<p class="gl-note">${esc((r && r.error) || "Навыки не открылись - попробуй ещё раз")}</p>`;
				return;
			}
			W.gsFree = +r.free || 0;
			pane._gs = r;
			const P = r.point,
				D = r.donate || {},
				U = r.up,
				M = r.marks || { own: 1, common: 5 };
			const left = Math.max(0, (D.max || 0) - (D.mine || 0));
			const pc = (x) => Math.max(0, Math.min(1, x.have / Math.max(1, x.need)));
			const side = (cls, lab, x, hint) =>
				`<div class="gl-gsl ${cls}${x.have >= x.need ? " full" : ""}"><b>${lab}</b><span>${x.have >= x.need ? "✓ " : ""}${num(Math.min(x.have, x.need))} / ${num(x.need)}${x.have > x.need ? ` <em title="Запас перейдёт в шкалу следующей звезды">+${num(x.have - x.need)} в запас</em>` : ""}</span><small>${hint}</small></div>`;
			const STAR =
				'<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 4 L29.6 17 L43.6 18.4 L33 27.8 L36.2 41.6 L24 34.4 L11.8 41.6 L15 27.8 L4.4 18.4 L18.4 17 Z" fill="#ffd24a" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M24 10 L27 19 L20 19 Z" fill="#fff" opacity=".6"/></svg>';
			const top =
				`<section class="gl-gst"><div class="gl-gst-h"><b>${P ? `Звезда гильдии № ${P.n}` : "Все звёзды гильдии получены"}</b><span class="gl-uptr">Свободных звёзд <b>${num(r.free)}</b></span></div>` +
				(P
					? `<div class="gl-gsduo${P.coins.have >= P.coins.need && P.marks.have >= P.marks.need ? " done" : ""}" role="img" aria-label="Монеты: ${num(P.coins.have)} из ${num(P.coins.need)}, знаки гильдии: ${num(P.marks.have)} из ${num(P.marks.need)}">` +
						`<span class="gl-gsh l"><i style="transform:scaleX(${Math.max(pc(P.coins), 0.015).toFixed(3)})"></i></span><span class="gl-gsc">${STAR}</span><span class="gl-gsh r"><i style="transform:scaleX(${Math.max(pc(P.marks), 0.015).toFixed(3)})"></i></span></div>` +
						`<div class="gl-gsls">${side("l", "Монеты", P.coins, `жертвуют участники: по ${num(D.per)} бронзы, до ${D.max} раз в день`)}${side("r", "Знаки гильдии", P.marks, `за задания гильдии: личное - ${M.own}, общее - ${M.common}`)}</div>` +
						`<div class="gl-gsd"><button type="button" class="gl-btn" data-gdon="1"${left > 0 ? "" : " disabled"}>${ico("gift", 18)}${left > 0 ? `Пожертвовать ${num(D.per)} бронзы` : "На сегодня всё"}</button>${P.coins.have >= P.coins.need ? "<span>монеты на эту звезду собраны - лишнее идёт в запас</span>" : ""}<span class="gl-gsd-all">гильдия сегодня: ${num(D.today)} бронзы</span></div>` +
						'<p class="gl-cs">Обе шкалы дошли до звезды - гильдия получает Звезду гильдии, шкалы начинаются заново. Звезда открывает или улучшает один навык.</p>'
					: "") +
				"</section>";
			const card = (u) => {
				const full = u.lv >= u.max,
					mine = U && U.id === u.id;
				const btn = full
					? '<span class="gl-upmax">максимум</span>'
					: mine
						? `<div class="gl-gsup"><b>Улучшается до ${U.to} ур.</b><span class="gl-bar"><i style="transform:scaleX(${Math.max(0.02, 1 - (U.endAt - Date.now()) / (U.hours * 3600e3)).toFixed(3)})"></i></span><small>осталось ${esc(hLeft(U.endAt - Date.now()))}</small></div>`
						: r.can
							? `<button type="button" class="gl-btn" data-gskill="${esc(u.id)}"${r.free > 0 && !U ? "" : " disabled"}>${u.lv ? "Улучшить" : "Открыть"}</button><small>${U ? "идёт другое улучшение" : r.free > 0 ? `1 звезда · ${u.hours} ч` : `нужна звезда · ${u.hours} ч`}</small>`
							: `<small>ставит глава или руководство · ${u.hours} ч</small>`;
				return (
					`<li class="gl-gsk${u.lv ? "" : " zero"}${mine ? " busy" : ""}${full ? " full" : ""}"><span class="gl-upi gl-upi-art" aria-hidden="true">${gi("sk_" + u.id, 76) && window.LGGuildIcons && window.LGGuildIcons.svg("sk_" + u.id, gst(), 76) ? window.LGGuildIcons.svg("sk_" + u.id, gst(), 76) : esc(u.ico || "⭐")}</span>` +
					`<div class="gl-upm"><div class="gl-uph"><b>${esc(u.name)}</b><span class="gl-uplv">${u.lv ? `ур. ${u.lv} из ${u.max}` : "не открыт"}</span></div><span class="gl-uppips" aria-hidden="true">${Array.from({ length: u.max }, (_, i) => `<i${i < u.lv ? ' class="on"' : ""}></i>`).join("")}</span>` +
					`<p>${esc(u.desc)}</p><p class="gl-upfx"><span>Сейчас: <b>${esc(u.now)}</b></span>${full ? "" : `<span>Дальше: <b>${esc(u.next)}</b></span>`}</p></div><div class="gl-upa">${btn}</div></li>`
				);
			};
			pane.innerHTML =
				top + `<ul class="gl-gsks">${(r.skills || []).map(card).join("")}</ul>`;
		};
		pane.innerHTML = '<p class="gl-note">Смотрю навыки…</p>';
		api.skills().then(paint);
		pane.onclick = async (e) => {
			const b = e.target.closest("[data-gskill], [data-gdon]");
			if (!b || b.disabled) return;
			b.disabled = true;
			const was = pane._gs,
				from = b.getBoundingClientRect();
			const r = await api.act(
				b.dataset.gdon
					? { op: "gdonate" }
					: { op: "gskillUp", id: b.dataset.gskill },
			);
			if (!r || !r.ok) {
				toast((r && r.error) || "не вышло", true);
				if (b.isConnected) b.disabled = false;
				return;
			}
			const nr = await api.skills();
			let reduce = false;
			try {
				reduce = !!(
					window.matchMedia &&
					window.matchMedia("(prefers-reduced-motion: reduce)").matches
				);
			} catch (x) {
				reduce = false;
			}
			const fill = pane.querySelector(".gl-gsh.l i"),
				duo = pane.querySelector(".gl-gsduo");
			if (
				!b.dataset.gdon ||
				reduce ||
				!fill ||
				!fill.animate ||
				!was ||
				!was.point ||
				!nr ||
				!nr.ok
			) {
				if (r.msg) toast(r.msg);
				paint(nr);
				return;
			}

			const star = nr.earned > was.earned,
				need = was.point.coins.need,
				p1 = star
					? 1
					: Math.min(1, (nr.point ? nr.point.coins.have : need) / need);
			const br = fill.parentNode.getBoundingClientRect(),
				tx = br.left + br.width * Math.max(0.03, p1) - 4,
				ty = br.top + br.height / 2,
				root = W.sub ? W.sub.el : W.el,
				N = 7,
				FLY = 620,
				GAP = 55;
			for (let k = 0; k < N; k++) {
				const o = document.createElement("i");
				o.className = "gl-xpo gl-coin";
				o.setAttribute("aria-hidden", "true");
				const x0 = from.left + from.width * (0.2 + 0.6 * Math.random()),
					y0 = from.top + from.height * 0.4;
				o.style.left = `${x0}px`;
				o.style.top = `${y0}px`;
				root.appendChild(o);
				const dx = tx - x0,
					dy = ty - y0,
					up = 46 + 30 * Math.random();
				const fr = Array.from({ length: 9 }, (_, j) => {
					const t = j / 8;
					return {
						transform: `translate(${(dx * t).toFixed(1)}px, ${(dy * t - Math.sin(t * Math.PI) * up).toFixed(1)}px) scale(${(1.1 - 0.4 * t).toFixed(2)}) rotate(${Math.round(t * 540)}deg)`,
						opacity: j === 0 ? 0 : j === 8 ? 0.3 : 1,
					};
				});
				o.animate(fr, {
					duration: FLY,
					delay: k * GAP,
					easing: "cubic-bezier(.4, 0, .6, 1)",
					fill: "both",
				}).onfinish = () => o.remove();
			}
			setTimeout(
				() => {
					if (!pane.isConnected || !fill.isConnected) return;
					fill.style.transform = `scaleX(${Math.max(p1, 0.015).toFixed(3)})`;
					fill.parentNode.animate(
						[
							{ transform: "scaleY(1)" },
							{ transform: "scaleY(1.35)" },
							{ transform: "scaleY(1)" },
						],
						{ duration: 240, iterations: 2 },
					);
					if (!star) {
						setTimeout(() => {
							if (r.msg) toast(r.msg);
							if (pane.isConnected) paint(nr);
						}, 520);
						return;
					}

					setTimeout(() => {
						if (!duo.isConnected) return;
						duo.classList.add("done", "ignite");
						const c = duo.querySelector(".gl-gsc").getBoundingClientRect(),
							cx = c.left + c.width / 2,
							cy = c.top + c.height / 2;
						for (let k = 0; k < 14; k++) {
							const o = document.createElement("i");
							o.className = "gl-xpo gl-ray";
							o.style.left = `${cx}px`;
							o.style.top = `${cy}px`;
							root.appendChild(o);
							const a = (Math.PI * 2 * k) / 14 + Math.random() * 0.3,
								d = 54 + 46 * Math.random();
							o.animate(
								[
									{ transform: "translate(0, 0) scale(.4)", opacity: 0 },
									{
										transform: `translate(${(Math.cos(a) * d * 0.5).toFixed(1)}px, ${(Math.sin(a) * d * 0.5).toFixed(1)}px) scale(1.2)`,
										opacity: 1,
										offset: 0.35,
									},
									{
										transform: `translate(${(Math.cos(a) * d).toFixed(1)}px, ${(Math.sin(a) * d).toFixed(1)}px) scale(.2)`,
										opacity: 0,
									},
								],
								{
									duration: 900,
									delay: 120 + k * 12,
									easing: "ease-out",
									fill: "both",
								},
							).onfinish = () => o.remove();
						}
						toast(r.msg || "Гильдия получила Звезду гильдии!");
						setTimeout(() => {
							if (pane.isConnected) paint(nr);
						}, 1900);
					}, 420);
				},
				FLY + (N - 1) * GAP * 0.4,
			);
		};
	}

	function hallTab(pane) {
		pane.innerHTML = `<div class="gl-stub">${gi("hall", 120)}<h4>Улучшения здания - позже</h4><p class="gl-cs">Здесь появятся улучшения здания гильдии. Пока в зал гильдии можно зайти с карты - кликни по зданию гильдии в городе.</p></div>`;
		giFill();
	}

	const cdHtml = (at, pre) =>
		`<time data-cd="${+at}" data-pre="${esc(pre || "")}">${esc((pre || "") + left(at))}</time>`;

	function clocks() {
		if (!W) return;
		W.body.querySelectorAll("time[data-cd]").forEach((t) => {
			const at = +t.dataset.cd;
			t.textContent = at > Date.now() ? t.dataset.pre + left(at) : "сейчас";
		});
	}

	function cmPick() {
		const L = W.cmList || [];
		if (!L.length) return null;
		const mine = L.find((x) => x.mine);
		if (mine) return mine;
		const free = L.filter((x) => x.members.length < x.max);
		if (!free.length) return null;
		return free
			.slice()
			.sort(
				(a, b) =>
					(b.min - b.members.length > 0) - (a.min - a.members.length > 0) ||
					a.max - a.members.length - (b.max - b.members.length) ||
					(a.until || 0) - (b.until || 0),
			)[0];
	}

	function heroPick() {
		const t = Date.now(),
			R = W.raidOk ? W.raidView : null;
		if (R && R.plan && (R.st === "open" || R.st === "fight")) {
			const n = (R.joined || []).length,
				min = (R.rules && R.rules.min) || 0,
				j = !!(R.me && R.me.joined);
			return {
				k: "raid",
				kick:
					R.st === "fight"
						? "Сейчас · рейд идёт"
						: "Скоро · вход в рейд открыт",
				title: `Рейд: ${R.plan.name || "босс гильдии"}`,
				when:
					R.st === "fight"
						? "<time>идёт бой</time>"
						: cdHtml(R.plan.at, "начало "),
				cnt: min ? `вошли ${n} из ${min}` : `вошли ${n}`,
				btn: j ? "Вернуться" : "Войти",
			};
		}
		const E = W.warE;
		if (E && E.entry && !E.signed && E.canSign && t < (+E.entry.closeAt || 0)) {
			const x = E.entry;
			return {
				k: "war",
				kick: "Скоро · мини-сражение",
				title: `${KIND[x.kind] || "⚔"} ${x.title}${x.name ? `: ${x.name}` : ""}`,
				when: `${cdHtml(x.battleAt, "бой ")} · запись до ${esc(tm(x.closeAt))}`,
				cnt: `записались ${E.count || 0} из ${E.min || 0}`,
				btn: "Записаться",
			};
		}
		const L = cmPick();
		if (L) {
			const n = L.members.length,
				need = Math.max(0, L.min - n);
			return {
				k: "cm",
				id: L.id,
				mine: !!L.mine,
				kick: "Сейчас · сбор у стен",
				title: `Элитный «${L.name}»${need ? ` - нужно ещё ${need}` : ""}`,
				when: cdHtml(L.until, "распустится "),
				cnt: `в группе ${n} из ${L.max}, начать можно от ${L.min}`,
				btn: L.mine ? "Открыть сбор" : "Присоединиться",
			};
		}
		const P = runGather();
		if (P)
			return {
				k: "run",
				joined: !!P.joined,
				kick: "Сейчас · сбор на вылазку",
				title: `Вылазка «${P.place || ""}»`,
				when: cdHtml(P.until, "выход "),
				cnt: `в отряде ${P.n || 0} из ${P.min || 0}`,
				btn: P.joined ? "Вернуться в сбор" : "Присоединиться",
			};
		return null;
	}
	const HICO = { raid: "war", war: "war", cm: "gather", run: "run" };
	function heroHtml() {
		const h = heroPick();
		if (!h) return "";
		return (
			`<div class="gl-hero k-${h.k}" role="region" aria-label="Главное сейчас">${ico(HICO[h.k], 36)}<div class="gl-hero-t"><small class="gl-hero-k">${esc(h.kick)}</small><b>${esc(h.title)}</b>` +
			`<span class="gl-hero-m">${h.when} · ${esc(h.cnt)}</span></div><button type="button" class="gl-btn gl-hero-b" data-hero="${h.k}"${h.id ? ` data-id="${esc(h.id)}"` : ""}${h.mine ? ' data-hmine="1"' : ""}${h.joined ? ' data-joined="1"' : ""}>${esc(h.btn)}</button></div>`
		);
	}

	const giftList = () =>
		W && W.dl && W.dl.gq && Array.isArray(W.dl.gq.gift) ? W.dl.gq.gift : null;
	const giftCnt = () => {
		const L = giftList();
		return L ? L.length : giftN();
	};

	const GB = [
		["war", "Бой"],
		["skills", "Навыки гильдии"],
		["gift", "Подарок"],
		["hall", "Здание гильдии"],
		["log", "Журнал"],
		["tasks", "Задания"],
	];
	let giP = null;
	function giLoad() {
		if (window.LGGuildIcons) return Promise.resolve();
		if (giP) return giP;
		const v = (window.LG_SITEF || {})["guildicons.js"] || "";
		giP = new Promise((ok, no) => {
			const sc = document.createElement("script");
			sc.src = `/site/guildicons.js?v=${v}`;
			sc.onload = () => ok();
			sc.onerror = (e) => {
				giP = null;
				no(e);
			};
			document.head.appendChild(sc);
		});
		return giP;
	}

	const gi = (name, size) => {
		let v = "";
		try {
			const I = window.LGGuildIcons;
			v = I && I.svg ? I.svg(name, gst(), size) : "";
		} catch (e) {
			console.warn("[гильдии] иконка кнопки", e);
		}
		return `<span class="gl-gi" data-gi="${name}" data-gs="${size}" aria-hidden="true">${v}</span>`;
	};
	function giFill() {
		const I = window.LGGuildIcons;
		if (!W || !I) return;
		W.el.querySelectorAll(".gl-gi[data-gi]").forEach((x) => {
			if (!x.firstChild)
				x.innerHTML = I.svg(x.dataset.gi, gst(), +x.dataset.gs || 96);
		});
	}

	function gbBadge(k) {
		if (k === "war") {
			const h = heroPick();
			if (h && (h.k === "raid" || h.k === "war")) return ["!", true];
			const n = gatherN();
			return n ? [String(n), true] : null;
		}
		if (k === "gift") {
			const n = giftCnt();
			return n ? [String(n), true] : null;
		}
		if (k === "skills") {
			return W.gsFree > 0 && can(W.guild, "profile")
				? [String(W.gsFree), true]
				: null;
		}
		if (k === "tasks") {
			const Q = W.gq,
				mine = Q ? Q.mine : [];
			return Q && mine.length
				? [`${mine.filter((x) => x.done).length}/${mine.length}`, false]
				: null;
		}
		return null;
	}
	const GB_SAY = {
		war: "активных сборов",
		skills: "свободных звёзд гильдии",
		gift: "сундуков ждут",
		tasks: "выполнено",
	};
	function annHtml() {
		const r = W.guild,
			g = r.guild,
			ed = can(r, "profile");
		if (ed && W.annEdit)
			return (
				`<form class="gl-annb" data-form="ann"><div class="gl-annh"><b>Объявление гильдии</b></div><textarea name="descr" maxlength="300" rows="3" aria-label="Объявление гильдии" placeholder="Что важно знать участникам (до 300 знаков)">${esc(W.annDraft != null ? W.annDraft : g.descr || "")}</textarea>` +
				'<div class="gl-btns"><button type="submit" class="gl-btn">Сохранить</button><button type="button" class="gl-btn ghost" data-ann="cancel">Отмена</button></div></form>'
			);
		return (
			`<div class="gl-annb"><div class="gl-annh"><b>Объявление гильдии</b>${ed ? '<button type="button" class="gl-pen" data-ann="edit" aria-label="Изменить объявление" title="Изменить объявление">✎</button>' : ""}</div>` +
			`<p class="gl-annt${g.descr ? "" : " none"}">${g.descr ? esc(g.descr) : ed ? "Объявления пока нет - нажми карандаш и напиши участникам главное." : "Объявления пока нет."}</p></div>`
		);
	}

	const p2 = (n) => String(n).padStart(2, "0");
	const cdSeg = (at) => {
		let x = Math.max(0, Math.floor((+at - Date.now()) / 1000));
		const d = Math.floor(x / 86400);
		x -= d * 86400;
		const h = Math.floor(x / 3600);
		x -= h * 3600;
		const m = Math.floor(x / 60),
			sc = x - m * 60;
		return (
			d
				? [
						[d, "дн"],
						[h, "ч"],
						[m, "мин"],
						[sc, "с"],
					]
				: [
						[h, "ч"],
						[m, "мин"],
						[sc, "с"],
					]
		)
			.map(([v, u]) => `<span><b>${p2(v)}</b><small>${u}</small></span>`)
			.join("");
	};
	const RUN_ABOUT =
		"Общий поход гильдии: сбор, тропа с событиями и бой с монстрами.";
	function runBoxHtml() {
		if (!W || !W.runOk || !W.runView) return "";
		const V = W.runView,
			P = V.plan,
			lead = !!(V.guild && V.guild.lead);
		const tools =
			lead && P && P.st === "plan" && !W.runEdit
				? `<span class="gl-runt"><button type="button" class="gl-runi" data-run="edit" aria-label="Перенести вылазку" title="Перенести">✎</button><button type="button" class="gl-runi bad" data-run="cancel" aria-label="Отменить вылазку" title="Отменить">✕</button></span>`
				: "";
		const head = `<div class="gl-runh"><span class="gl-runico" aria-hidden="true">${ico("run", 34)}</span><div><small>особое событие</small><h3>Вылазка гильдии</h3></div></div>`;
		const about = `<p class="gl-runa">${RUN_ABOUT}</p>`;
		if (W.runEdit && lead) {
			const t0 = new Date(P && P.st === "plan" ? +P.at : Date.now() + 864e5),
				dv = `${t0.getFullYear()}-${p2(t0.getMonth() + 1)}-${p2(t0.getDate())}`,
				now = new Date(),
				mn = `${now.getFullYear()}-${p2(now.getMonth() + 1)}-${p2(now.getDate())}`;
			return (
				`<div class="gl-runb edit">${head}<form data-form="runplan" class="gl-runf"><label>Дата<input type="date" name="d" required min="${mn}" value="${dv}"></label><label>Время<input type="time" name="t" required value="${P && P.st === "plan" ? `${p2(t0.getHours())}:${p2(t0.getMinutes())}` : "20:00"}"></label>` +
				`<div class="gl-runbtns"><button type="submit" class="gl-btn">${P ? "Перенести" : "Назначить"}</button><button type="button" class="gl-btn ghost" data-run="noedit">Отмена</button></div></form><p class="gl-runn">Время - твоё местное, не раньше чем через ${(V.rules && V.rules.leadMin) || 30} мин.</p></div>`
			);
		}

		const R = V.run && V.run.st !== "done" ? V.run : null,
			LA = V.last;
		if (P && P.st === "run") {
			const of = R && Array.isArray(R.steps) ? R.steps.length : 0,
				i = R ? Math.max(0, +R.i || 0) : 0,
				mine = !!(P.joined || (R && R.mine));
			return (
				`<div class="gl-runb hot go">${head}<p class="gl-runw"><b>Вылазка идёт</b>${P.place ? ` · «${esc(P.place)}»` : ""}</p>` +
				(of
					? `<div class="gl-runp"><span class="gl-bar"><i style="transform:scaleX(${Math.max(0.03, Math.min(1, i / of)).toFixed(3)})"></i></span><small>этап ${Math.min(i + 1, of)} из ${of} · в отряде ${num(P.n)}</small></div>`
					: `<p class="gl-runn gl-runm">в отряде <b>${num(P.n)}</b></p>`) +
				`<div class="gl-runbtns"><button type="button" class="gl-btn" data-run="open">${mine ? "Вернуться в вылазку" : "Смотреть вылазку"}</button></div></div>`
			);
		}

		const lastAt = LA ? +LA.ended || +LA.at || 0 : 0;
		const lastHtml =
			LA && lastAt && Date.now() - lastAt < 3 * 864e5
				? `<p class="gl-runl ${LA.failed ? "l" : LA.win ? "w" : "l"}">Прошлая вылазка${LA.place ? ` «${esc(LA.place)}»` : ""}: <b>${LA.failed ? "не состоялась" : LA.win ? "пройдена" : "не пройдена"}</b>${LA.failed ? ` · пришли ${num(LA.n)} из ${num(LA.min)}` : ` · в отряде ${num(LA.n)}`}</p>` +
					(V.run && V.run.st === "done"
						? '<div class="gl-runbtns gl-runres"><button type="button" class="gl-btn ghost" data-run="open">Итог вылазки</button></div>'
						: "")
				: "";
		if (P && P.st === "gather")
			return (
				`<div class="gl-runb hot">${head}<p class="gl-runw"><b>Сбор идёт</b> - до выхода</p><div class="gl-rcd" data-at="${+P.until}" role="timer">${cdSeg(P.until)}</div><p class="gl-runn gl-runm">в отряде <b>${P.n}</b>, нужно хотя бы ${P.min}${P.n < P.min ? " - иначе вылазка не состоится" : ""}</p>` +
				`<div class="gl-runbtns"><button type="button" class="gl-btn${P.joined ? " on" : ""}" data-run="${P.joined ? "leave" : "join"}">${P.joined ? "✓ Ты в отряде" : "Присоединиться"}</button>${lead ? `<span class="gl-runt"><button type="button" class="gl-runi" data-run="start" aria-label="Отправиться сейчас" title="Отправиться сейчас"${P.n >= P.min ? "" : " disabled"}>▶</button></span>` : ""}</div></div>`
			);
		if (P) {
			const at = new Date(+P.at);
			return (
				`<div class="gl-runb">${head}${about}<p class="gl-runw">${esc(at.toLocaleDateString("ru-RU", { day: "numeric", month: "long", weekday: "short" }))} в <b>${p2(at.getHours())}:${p2(at.getMinutes())}</b></p><div class="gl-rcd" data-at="${+P.at}" role="timer" aria-label="До вылазки">${cdSeg(P.at)}</div><p class="gl-runn gl-runm">${P.place ? `«${esc(P.place)}» · ` : ""}назначил ${esc(P.by || "")} · пойдут: <b>${num(P.will)}</b></p>` +
				`<div class="gl-runbtns"><button type="button" class="gl-btn${P.iWill ? " on" : ""}" data-run="will" data-on="${P.iWill ? "0" : "1"}">${P.iWill ? "✓ Я пойду" : "Я пойду"}</button>${tools}</div></div>`
			);
		}
		return `<div class="gl-runb none">${head}${about}${lastHtml}<p class="gl-runw">Вылазка пока не назначена.</p>${lead ? '<div class="gl-runbtns"><button type="button" class="gl-btn" data-run="edit">Назначить дату и время</button></div>' : '<p class="gl-runn">Дату и время назначает глава или руководство.</p>'}</div>`;
	}

	function runTick() {
		if (!W) return;
		clearInterval(W.runT);
		if (!W.body.querySelector(".gl-rcd")) return;
		const S = W;
		S.runT = setInterval(() => {
			if (W !== S) {
				clearInterval(S.runT);
				return;
			}
			if (document.hidden) return;
			const el = S.body.querySelector(".gl-rcd");
			if (!el) {
				clearInterval(S.runT);
				return;
			}
			const at = +el.dataset.at;
			el.innerHTML = cdSeg(at);
			if (at <= Date.now()) {
				clearInterval(S.runT);
				void runView().then(() => {
					if (W === S && S.tab === "main") paintTab();
				});
			}
		}, 1000);
	}
	async function runBoxAct(t, body) {
		const k = t ? t.dataset.run : "plan";
		if (k === "edit" || k === "noedit") {
			W.runEdit = k === "edit";
			paintTab();
			return;
		}
		const openRun = () =>
			runLoad()
				.then(() => window.LGGuildRun.open())
				.catch(() => toast("Вылазка не загрузилась - попробуй ещё раз"));
		if (k === "open") {
			void openRun();
			return;
		}
		if (
			k === "cancel" &&
			!(await askG({
				title: "Отменить вылазку?",
				text: "Назначенная вылазка будет снята, отметки «Я пойду» пропадут.",
				yes: "Отменить вылазку",
				no: "Не отменять",
				danger: true,
			}))
		)
			return;
		if (!W) return;
		if (t) t.disabled = true;
		const r = await xpost(
			"/api/guildrun/act",
			body ||
				(k === "will" ? { op: "will", on: t.dataset.on === "1" } : { op: k }),
		);
		if (!W) return;
		if (!r || !r.ok) {
			toast((r && r.error) || "не вышло", true);
			if (t && t.isConnected) t.disabled = false;
			return;
		}
		toast(
			k === "plan"
				? "Вылазка назначена"
				: k === "cancel"
					? "Вылазка отменена"
					: k === "join"
						? "Ты в отряде"
						: k === "leave"
							? "Ты вышел из отряда"
							: k === "start"
								? "Отряд вышел"
								: body
									? "Вылазка назначена"
									: t.dataset.on === "1"
										? "Отмечено: ты пойдёшь"
										: "Отметка снята",
		);
		W.runEdit = false;
		await runView();
		if (W && W.tab === "main") paintTab();
		if (W && (k === "join" || k === "start")) void openRun();
	}
	function mainHtml() {
		const btns = GB.map(([k, t]) => {
			const b = gbBadge(k);
			return `<button type="button" class="gl-gb${b && b[1] ? " hot" : ""}" data-win="${k}"${b ? ` aria-label="${t}: ${b[0]}${GB_SAY[k] ? " - " + GB_SAY[k] : ""}"` : ""}>${gi(k, 112)}<span class="gl-gb-l">${t}</span>${b ? `<b class="gl-gb-n${b[1] ? " hot" : ""}">${esc(b[0])}</b>` : ""}</button>`;
		}).join("");
		return `<div class="gl-gm"><div class="gl-ml">${bannerHtml(false)}${runBoxHtml()}</div><div class="gl-mr">${annHtml()}${heroHtml()}<div class="gl-grid gl-grid6">${btns}</div></div></div>`;
	}

	function subWin(k, title) {
		layerOff();
		const el = document.createElement("div");
		el.className = "gl-sub";
		el.dataset.win = k;
		el.innerHTML = `<div class="gl-subw" role="dialog" aria-modal="true" aria-labelledby="glSubT"><div class="gl-subh"><h3 id="glSubT">${esc(title)}</h3><button type="button" class="gl-x gl-subx" aria-label="Закрыть">×</button></div><div class="gl-subb"></div></div>`;
		W.el.appendChild(el);
		const off = () => {
			el.remove();
			if (W && W.layer === off) W.layer = null;
			if (W) {
				W.sub = null;
				if (W.tab === "main" && !typing()) paintTab();
			}
		};
		W.layer = off;
		el.addEventListener("click", (e) => {
			if (e.target === el || e.target.closest(".gl-subx")) off();
		});
		try {
			el.querySelector(".gl-subx").focus({ preventScroll: true });
		} catch (x) {
			console.warn("[гильдии] фокус окна", x);
		}
		const S = { k, el, body: el.querySelector(".gl-subb"), close: off };
		W.sub = S;
		return S;
	}

	function openWin(k, o) {
		if (!W || !W.guild) return;
		if (k === "tasks") {
			const S = subWin("tasks", "Задания гильдии");
			tasksFill(S, true);
			return;
		}
		if (k === "gift") {
			const S = subWin("gift", "Подарок");
			giftFill(S);
			return;
		}
		if (k === "tops") {
			const S = subWin("tops", "Топы гильдии");
			topsWin(S);
			return;
		}
		if (k === "skills") {
			const S = subWin("skills", "Навыки гильдии");
			S.body.innerHTML =
				'<div class="gl-pane gl-subpane" data-tab="skills"></div>';
			gskillTab(S.body.firstChild);
			return;
		}
		if (k === "gather" || k === "cm") {
			openWin("war", { seg: "cm" });
			return;
		}
		if (k === "hall") {
			const S = subWin("hall", "Здание гильдии");
			S.body.innerHTML =
				'<div class="gl-pane gl-subpane" data-tab="hall"></div>';
			hallTab(S.body.firstChild);
			S.body.addEventListener("click", subClick);
			return;
		}
		if (k === "log") {
			const S = subWin("log", "Журнал гильдии");
			const cat = W.logCat || "fight";
			S.body.innerHTML = `<div class="gl-seg gl-logseg" role="tablist" aria-label="Журнал">${LOG_CATS.map(([k, t, ic]) => `<button type="button" role="tab" data-logcat="${k}" aria-selected="${k === cat}">${ico(ic, 16)}${t}</button>`).join("")}</div><div class="gl-pane gl-subpane" data-tab="log"></div>`;
			logTab(S.body.querySelector(".gl-pane"));
			S.body.addEventListener("click", subClick);
			S.body.addEventListener("click", (e) => {
				const b = e.target.closest("[data-logcat]");
				if (!b || b.getAttribute("aria-selected") === "true") return;
				W.logCat = b.dataset.logcat;
				S.body
					.querySelectorAll("[data-logcat]")
					.forEach((x) => x.setAttribute("aria-selected", String(x === b)));
				logTab(S.body.querySelector(".gl-pane"));
			});
			return;
		}
		if (k === "war") {
			const S = subWin("war", "Бой");
			S.body.addEventListener("click", subClick);
			S.seg = o && o.seg ? o.seg : "war";
			warWin(S);
		}
	}

	function warWin(S) {
		const segs = [["cm", "Сборы"], ...(W.raidOk ? [["raid", "Рейд"]] : [])];
		if (!segs.some((x) => x[0] === S.seg)) S.seg = "cm";
		S.body.innerHTML =
			(segs.length > 1
				? `<div class="gl-seg" role="tablist" aria-label="Бой">${segs.map(([k, t]) => `<button type="button" role="tab" data-seg="${k}" aria-selected="${S.seg === k}">${ico(k === "war" ? "war" : k === "run" ? "run" : k === "cm" ? "gather" : "war", 16)}${t}${k === "cm" && gatherN() ? ` <b class="gl-badge">${gatherN()}</b>` : ""}</button>`).join("")}</div>`
				: "") + `<div class="gl-pane gl-subpane" data-tab="${S.seg}"></div>`;
		const pane = S.body.querySelector(".gl-pane");
		if (S.seg === "run") runTab(pane);
		else if (S.seg === "cm") void gatherFill(pane);
		else if (S.seg === "raid") pane.innerHTML = raidHtml();
		else {
			pane.innerHTML = '<p class="gl-note">Смотрю доску заданий…</p>';
			void war();
		}
	}

	function raidHtml() {
		const R = W.raidView;
		if (!R || !R.plan)
			return '<p class="gl-note">Рейд гильдии не назначен.</p>';
		const ST = {
			plan: "назначен",
			open: "вход открыт",
			fight: "идёт бой",
			done: "закончился",
		};
		return (
			`<div class="gl-card${R.st === "open" || R.st === "fight" ? " hot" : ""}"><p class="gl-lbl">${ico("war", 18)}Рейд: ${esc(R.plan.name || "босс гильдии")}</p>` +
			`<p class="gl-cs">${esc(ST[R.st] || R.st || "")}${R.plan.at ? ` · начало ${esc(dt(R.plan.at))}` : ""} · вошли ${(R.joined || []).length}${R.rules && R.rules.min ? ` из ${R.rules.min}` : ""}</p>` +
			'<button type="button" class="gl-btn" data-raid="open">Открыть рейд</button></div>'
		);
	}

	const subPane = (k, seg) => {
		const S = W && W.sub;
		if (!S || S.k !== k || (seg && S.seg !== seg) || !S.el.isConnected)
			return null;
		return S.body.querySelector(".gl-pane");
	};

	function subClick(e) {
		const t = e.target && e.target.closest ? e.target.closest("button") : null;
		if (!t || !W || t.disabled) return;
		const d = t.dataset;
		if (d.confirm && !d.sure) {
			askG({
				title: d.confirm,
				yes: t.textContent.trim(),
				danger: t.classList.contains("bad"),
			}).then((ok) => {
				if (ok && t.isConnected) {
					d.sure = "1";
					t.click();
					delete d.sure;
				}
			});
			return;
		}
		if (d.seg && W.sub && W.sub.k === "war") {
			W.sub.seg = d.seg;
			warWin(W.sub);
			return;
		}
		if (d.res) {
			void result(d.res);
			return;
		}
		if (d.raid) {
			raidLoad()
				.then(() => {
					if (W) W.close();
					window.LGGuildRaid.open();
				})
				.catch(() => toast("Рейд не загрузился - попробуй ещё раз"));
			return;
		}
		if (d.hall) {
			const g = d.hall;
			W.close();
			try {
				window.LGGuildHall.open(g);
			} catch (x) {}
			return;
		}
		if (d.logmore) {
			t.disabled = true;
			const p = subPane("log");
			if (p) void logTab(p, true);
			return;
		}
		if (d.war) warClick(t, d);
	}

	const nextDay = () => {
		const MSK = 3 * 3600e3,
			t = Date.now() + MSK,
			d = new Date(t);
		let at =
			Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 5) - MSK;
		if (at <= Date.now()) at += 864e5;
		return at;
	};

	const seenKey = () => {
		let ch = "";
		try {
			ch = (window.LG_CH && window.LG_CH.login) || "";
		} catch (e) {
			ch = "";
		}
		return `lg-gxp:${ch}:${W.guild.guild.id}`;
	};
	function seenGet() {
		try {
			const v = JSON.parse(localStorage.getItem(seenKey()) || "null");
			return v && Number.isFinite(+v.lv) && Number.isFinite(+v.xp)
				? { lv: +v.lv, xp: +v.xp }
				: null;
		} catch (e) {
			return null;
		}
	}
	function seenSet(x) {
		try {
			localStorage.setItem(seenKey(), JSON.stringify({ lv: x.lv, xp: x.xp }));
		} catch (e) {}
	}

	function lvlAt(lv, xp) {
		const r = W.guild,
			st = (r.levels && r.levels.steps) || [],
			from = lv >= 2 ? st[lv - 2] || 0 : 0,
			to = lv - 1 < st.length ? st[lv - 1] : null;
		return {
			lv,
			xp,
			to,
			pct:
				to == null
					? 1
					: Math.max(0, Math.min(1, (xp - from) / Math.max(1, to - from))),
		};
	}
	function tasksFill(S, opening) {
		const r = W.guild,
			g = r.guild,
			D = W.dl,
			q = D && D.gq;
		const bar = (n, of) => {
			const p = Math.max(0, Math.min(1, (+n || 0) / Math.max(1, +of || 1)));
			return `<span class="gl-bar"><i style="transform:scaleX(${Math.max(p, 0.03).toFixed(3)})"></i></span>`;
		};
		const gifts = (q && q.gift) || [];

		const CH = { 1: "деревянный", 2: "серебряный", 3: "золотой" };

		const MK = W.gsMarks,
			znak = (n) =>
				`${n} ${n % 10 === 1 && n % 100 !== 11 ? "знак" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? "знака" : "знаков"}`;
		const mk = (x, take) => {
			const n = MK ? Math.round(+(take ? MK.common : MK.own) || 0) : 0;
			return n > 0
				? `<span class="gl-qmk${x.done ? " got" : ""}" title="Знаки гильдии - шкала Звезды гильдии в окне «Навыки гильдии»">${x.done ? "✓ " : "+"}${znak(n)}</span>`
				: "";
		};
		const row = (x, take) => {
			if (x.old && !x.done)
				return `<li class="old"><span class="gl-q-t"><span>${esc(x.t)}</span><span>снято</span></span></li>`;
			const c = take && x.done ? gifts.find((y) => y.why === x.t) : null;

			return (
				`<li class="gl-qc${x.done ? " done" : ""}${c ? " take" : ""}"><div class="gl-qc-m"><span class="gl-q-t"><span>${esc(x.t)}</span><span>${num(Math.min(x.n, x.of))} / ${num(x.of)}</span></span>${mk(x, take)}${bar(x.n, x.of)}</div>` +
				`<div class="gl-qc-a">${c ? `<button type="button" class="gl-btn gl-take" data-take="${esc(c.i)}">Забрать</button>` : x.done ? '<span class="gl-qc-ok">✓ выполнено</span>' : take && x.lv ? `<span class="gl-qc-rw"><i class="gl-q-lv l${+x.lv}" aria-hidden="true"></i>${esc(CH[x.lv] || "")} сундук</span>` : ""}</div></li>`
			);
		};
		const list = (h, L, take) =>
			L && L.length
				? `<h4 class="gl-qh">${h} <small>${L.filter((x) => x.done).length} / ${L.length}</small></h4><ul class="gl-q">${L.map((x) => row(x, take)).join("")}</ul>`
				: "";
		const right = !D
			? `<p class="gl-cs">${window.LGDailies ? "Загружаю задания…" : "Задания пока недоступны."}</p>`
			: `<p class="gl-cs">Обновятся ${esc(left(nextDay()))} (в 05:00 по Москве).</p>` +
				list("Вместе с гильдией", q && q.guild, true) +
				list("Мои задания гильдии", q && q.mine, false) +
				(q ? "" : '<p class="gl-cs">Задания гильдии откроются позже.</p>');
		S.body.innerHTML =
			`<div class="gl-tw"><div class="gl-tlw"><h3 class="gl-tlh" aria-hidden="true">Задания гильдии</h3><div class="gl-tl"><span class="gl-emb big" aria-hidden="true">${emb(g.emblem, 72)}</span><b class="gl-tn">${g.tag ? `<small class="gl-tg">[${esc(g.tag)}]</small> ` : ""}${esc(g.name)}</b>` +
			`${lvlHtml(r)}<p class="gl-cs">Опыт гильдии - за задания участников и мини-сражения.</p></div><div class="gl-trw"></div></div><div class="gl-tr">${right}</div></div>`;
		rwFill(S);
		S.body.onclick = (e) => {
			const b = e.target.closest("[data-take]");
			if (b && !b.disabled) void giftAct(b, +b.dataset.take, S);
		};
		if (opening) {
			const now = xpNow(),
				was = seenGet();
			if (was && (now.lv > was.lv || (now.lv === was.lv && now.xp > was.xp)))
				xpAnim(S.el, lvlAt(was.lv, was.xp), now);
			seenSet(now);
		}
	}

	function giftFill(S, got) {
		const L = giftList() || [],
			n = L.length;
		const CH = {
			1: "Деревянный сундук",
			2: "Серебряный сундук",
			3: "Золотой сундук",
		};
		const keep = (c) => {
			const d = Math.floor((+c.left || 0) / 864e5),
				h = Math.ceil(((+c.left || 0) % 864e5) / 3600e3);
			return d ? `ещё ${d} дн.` : `ещё ${Math.max(1, h)} ч`;
		};
		const row = (c) =>
			`<li class="gl-chest t${+c.t || 1}"><span class="gl-chi" aria-hidden="true">${ico("gift", 44)}</span>` +
			`<div class="gl-chm"><b>${esc(CH[c.t] || "Сундук")}</b><small>за «${esc(c.why || "")}»</small><small class="gl-chk">${esc(keep(c))}</small></div>` +
			`<button type="button" class="gl-btn" data-take="${esc(c.i)}">Забрать</button></li>`;
		S.body.innerHTML =
			`<div class="gl-giftw">` +
			(n
				? `<ul class="gl-chests">${L.map(row).join("")}</ul>`
				: `${ico("gift", 64)}<p class="gl-big-n"><span>сундуков нет</span></p><p class="gl-cs">Сундуки - за общие задания гильдии, каждому участнику.</p>`) +
			(got ? `<p class="gl-got" role="status">${got}</p>` : "") +
			(n > 1
				? `<button type="button" class="gl-btn gl-takeall" data-take="all">Забрать все (${n})</button>`
				: "") +
			"</div>";
		S.body.onclick = (e) => {
			const b = e.target.closest("[data-take]");
			if (b && !b.disabled)
				void giftAct(b, b.dataset.take === "all" ? "all" : +b.dataset.take, S);
		};
	}

	async function giftAct(btn, i, S) {
		if (!W || W.busyN > 0) return;
		btn.disabled = true;
		busyOn(true);
		try {
			const was = xpNow();
			const li = btn.closest("li"),
				src = S.k === "tasks" && li ? li.getBoundingClientRect() : null;
			const r = await xpost("/api/dailies/act", { op: "gift", i });
			if (!W) return;
			if (!r || !r.ok) {
				toast((r && r.error) || "не вышло", true);
				if (btn.isConnected) btn.disabled = false;
				return;
			}
			W.dl = r;
			W.gq = r.gq ? { guild: r.gq.guild || [], mine: r.gq.mine || [] } : W.gq;
			const got = r.got || [],
				coins = got.reduce((s, x) => s + (+x.coins || 0), 0);
			const msg = `Из ${got.length > 1 ? got.length + " сундуков" : "сундука"}: ${money(coins)}`;
			toast(msg);

			const gv = r.guild;
			if (
				gv &&
				W.guild &&
				(+gv.xp !== +W.guild.guild.xp || +gv.level !== +W.guild.guild.level)
			) {
				W.guild.guild.xp = +gv.xp;
				W.guild.guild.level = +gv.level;
			}
			const now = xpNow();
			if (S.k === "tasks") {
				tasksFill(S);
				if (now.xp > was.xp || now.lv > was.lv) xpFly(S.el, src, was, now);
				seenSet(now);
			} else giftFill(S, msg);
			const head = W.body.querySelector(".gl-banner .gl-lvl");
			if (head) head.outerHTML = lvlHtml(W.guild);
		} finally {
			busyOn(false);
		}
	}
	const xpNow = () => {
		const L = lvlOf(W.guild);
		return { lv: L.lv, xp: L.xp, to: L.to, pct: L.pct };
	};

	function xpFly(root, src, a, b) {
		const box = root.querySelector(".gl-tl .gl-lvl"),
			bar = box && box.querySelector(".gl-xp"),
			fill = bar && bar.querySelector("i");
		let reduce = false;
		try {
			reduce = !!(
				window.matchMedia &&
				window.matchMedia("(prefers-reduced-motion: reduce)").matches
			);
		} catch (e) {
			reduce = false;
		}
		if (!bar || !src || reduce || !fill.animate) {
			xpAnim(root, a, b);
			return;
		}

		const lab = box.querySelector(".gl-lvl-t span"),
			ttl = box.querySelector(".gl-lvl-t b");
		fill.style.transition = "none";
		fill.style.transform = `scaleX(${Math.max(a.pct, 0.03).toFixed(3)})`;
		lab.textContent = a.to == null ? num(a.xp) : `${num(a.xp)} / ${num(a.to)}`;
		ttl.textContent = `Уровень ${a.lv}`;
		const br = bar.getBoundingClientRect(),
			tx =
				br.left +
				br.width * Math.max(0.06, Math.min(0.97, b.lv > a.lv ? 1 : b.pct)),
			ty = br.top + br.height / 2;
		const N = 14,
			FLY = 720,
			GAP = 45;
		for (let k = 0; k < N; k++) {
			const o = document.createElement("i");
			o.className = "gl-xpo";
			o.setAttribute("aria-hidden", "true");
			const x0 = src.left + src.width * (0.15 + 0.6 * Math.random()),
				y0 = src.top + src.height * (0.3 + 0.4 * Math.random());
			o.style.left = `${x0}px`;
			o.style.top = `${y0}px`;
			root.appendChild(o);

			const dx = tx - x0,
				dy = ty - y0,
				len = Math.hypot(dx, dy) || 1,
				nx = -dy / len,
				ny = dx / len,
				amp = (k % 2 ? 1 : -1) * (18 + 14 * Math.random());
			const fr = Array.from({ length: 9 }, (_, j) => {
				const t = j / 8,
					w = Math.sin(t * Math.PI * 2) * amp * (1 - t);
				return {
					transform: `translate(${(dx * t + nx * w).toFixed(1)}px, ${(dy * t + ny * w).toFixed(1)}px) scale(${(1.15 - 0.55 * t).toFixed(2)})`,
					opacity: j === 0 ? 0 : j === 8 ? 0.2 : 1,
				};
			});
			const an = o.animate(fr, {
				duration: FLY,
				delay: k * GAP,
				easing: "cubic-bezier(.45, .05, .55, .95)",
				fill: "both",
			});
			an.onfinish = () => o.remove();
		}
		setTimeout(() => {
			if (!box.isConnected) return;
			xpAnim(root, a, b);
			bar.animate(
				[
					{ transform: "scale(1)" },
					{ transform: "scale(1.04, 1.5)" },
					{ transform: "scale(1)" },
				],
				{ duration: 260, iterations: 3 },
			);
			const gain = b.lv > a.lv ? 0 : b.xp - a.xp;
			if (gain > 0) {
				const f = document.createElement("span");
				f.className = "gl-xpgain";
				f.textContent = `+${num(gain)} опыта`;
				box.appendChild(f);
				f.animate(
					[
						{ transform: "translateY(6px)", opacity: 0 },
						{ transform: "translateY(-10px)", opacity: 1, offset: 0.25 },
						{ transform: "translateY(-14px)", opacity: 1, offset: 0.75 },
						{ transform: "translateY(-26px)", opacity: 0 },
					],
					{ duration: 1500, fill: "both" },
				).onfinish = () => f.remove();
			}
		}, FLY + 40);
	}
	function xpAnim(root, a, b) {
		const box = root.querySelector(".gl-tl .gl-lvl");
		if (!box) return;
		const i = box.querySelector(".gl-xp i"),
			lab = box.querySelector(".gl-lvl-t span"),
			ttl = box.querySelector(".gl-lvl-t b");
		const sx = (p) => `scaleX(${Math.max(p, 0.03).toFixed(3)})`,
			fmt = (x, L) => (L.to == null ? num(x) : `${num(x)} / ${num(L.to)}`);
		let reduce = false;
		try {
			reduce = !!(
				window.matchMedia &&
				window.matchMedia("(prefers-reduced-motion: reduce)").matches
			);
		} catch (e) {
			reduce = false;
		}
		if (reduce) return;
		const MS = 750;
		box.dataset.anim = "1";
		const count = (from, to, L) => {
			const t0 = Date.now();
			const step = () => {
				const k = Math.min(1, (Date.now() - t0) / MS),
					e = 1 - (1 - k) ** 3;
				lab.textContent = fmt(Math.round(from + (to - from) * e), L);
				if (k < 1) setTimeout(step, 40);
			};
			step();
		};
		const run = (p0, p1, done) => {
			i.style.transition = "none";
			i.style.transform = sx(p0);
			void i.getBoundingClientRect();
			i.style.transition = `transform ${MS}ms ease-out`;
			i.style.transform = sx(p1);
			setTimeout(done, MS + 30);
		};
		const fin = () => {
			delete box.dataset.anim;
			i.style.transition = "";
		};
		if (b.lv > a.lv) {
			ttl.textContent = `Уровень ${a.lv}`;
			count(a.xp, a.to == null ? a.xp : a.to, a);
			run(a.pct, 1, () => {
				const f = document.createElement("span");
				f.className = "gl-lvup";
				f.textContent = `Уровень ${b.lv}`;
				box.appendChild(f);
				setTimeout(() => f.classList.add("on"), 20);
				setTimeout(() => {
					f.classList.remove("on");
					setTimeout(() => f.remove(), 400);
				}, 1100);
				ttl.textContent = `Уровень ${b.lv}`;
				count(a.to == null ? b.xp : a.to, b.xp, b);
				run(0, b.pct, fin);
			});
			return;
		}
		count(a.xp, b.xp, b);
		run(a.pct, b.pct, fin);
	}

	const rk = (x) => (ORD[x] == null ? 9 : ORD[x]);

	function memCommon(r, m) {
		if (!r.memMenu || !r.me) return [];
		const self = String(m.tid) === String(r.me.tid),
			nk = String(m.login || "").toLowerCase(),
			out = [["prof", "Профиль"]];
		if (self || !nk) return out;
		try {
			if (window.LGMail && window.LGMail.on && window.LGMail.on())
				out.push(["mail", "Написать письмо"]);
		} catch (e) {
			console.warn("[гильдии] почта", e);
		}
		try {
			if (window.LGCityMon && window.LGCityMon.menuItems)
				for (const [k, t, off] of window.LGCityMon.menuItems(nk))
					if (k === "cmp-inv" && !off) out.push([k, t]);
		} catch (e) {
			console.warn("[гильдии] группа", e);
		}
		try {
			if (window.LGFriends && window.LGFriends.menuItems)
				for (const [k, t, off] of window.LGFriends.menuItems(nk))
					if ((k === "fr-add" || k === "fr-acc") && !off) out.push([k, t]);
		} catch (e) {
			console.warn("[гильдии] друзья", e);
		}
		return out;
	}

	const memHas = (r, m) =>
		memCommon(r, m).length > 0 || memActs(r, m).length > 0;
	function memActs(r, m) {
		const me = r.me;
		if (!me || m.tid === me.tid) return [];
		const role = tierOf(roleOf(r)),
			lead = role === "leader",
			mr = rk(m.role),
			out = [];
		if (lead && mr >= 2) out.push(["up-lead", "Повысить: в руководство"]);
		if (can(r, "role") && mr === 3)
			out.push(["up-trusted", "Повысить: доверенным"]);
		if (lead && mr === 1) out.push(["down-trusted", "Понизить: в доверенные"]);
		if (can(r, "role") && mr === 2 && (lead || rk(role) < 2))
			out.push(["down-novice", "Понизить: в новички"]);
		if (lead && m.role !== "leader")
			out.push(["transfer", "Передать главу", 1]);
		if (can(r, "kick") && rk(role) < mr)
			out.push(["kick", "Исключить из гильдии", 1]);

		if (can(r, "mute") && rk(role) < mr)
			out.push(
				m.mutedUntil && +m.mutedUntil > Date.now()
					? ["gunmute", "Разрешить писать в чат гильдии"]
					: ["gmute", "Запретить писать в чат гильдии…"],
			);
		return out;
	}

	const seenTxt = (m) => {
		if (m.online) return "в сети";
		if (!m.seenAt) return "";
		const mn = Math.max(1, Math.round((Date.now() - +m.seenAt) / 60e3));
		return `был ${mn < 60 ? `${mn} мин` : mn < 1440 ? `${Math.round(mn / 60)} ч` : `${Math.round(mn / 1440)} дн.`} назад`;
	};

	const onlineHtml = (r) =>
		r.me && Array.isArray(r.members)
			? `<p class="gl-onl" aria-live="polite">В сети: <b>${r.members.filter((m) => m.online).length}</b> из ${r.members.length}</p>`
			: "";
	const seenHtml = (m) => {
		const t = seenTxt(m);
		return t
			? `<small class="gl-seen${m.online ? " on" : !m.online && m.seenAt && Date.now() - +m.seenAt > 7 * 864e5 ? " old" : ""}">${esc(t)}</small>`
			: "";
	};
	const memHero = (m) => {
		const h = m.hero;
		if (!h) return '<small class="gl-mh none">героя нет</small>';
		const role = /^[a-z]{1,20}$/.test(String(h.role || ""))
				? h.role
				: "recruit",
			nm = h.roleName || CLS_RU[role] || role;
		return `<small class="gl-mh"><span class="gl-mh-l">${Math.max(1, Math.floor(+h.level || 1))} ур.</span><span class="gl-mh-c"><i class="gl-cls r-${esc(role)}" aria-hidden="true"></i>${esc(nm)}</span><span class="gl-mh-p" title="Сила героя">⚔ ${num(h.power)}</span></small>`;
	};

	function wedgeHtml(r) {
		const by = (a, b) => (a.joinedAt || 0) - (b.joinedAt || 0);
		const boss = r.members.find((m) => tierOf(m.role) === "leader"),
			leads = r.members
				.filter((m) => tierOf(m.role) === "lead")
				.sort(by)
				.slice(0, 4);
		const slot = (m, pos, cap) =>
			m
				? `<li class="p${pos}${r.me && m.tid === r.me.tid ? " me" : ""}${memHas(r, m) ? " gl-hasm" : ""}" data-hero="${esc(m.tid)}" tabindex="0" title="Нажми - вещи и характеристики${memHas(r, m) ? "; правая кнопка мыши - действия" : ""}">${heroFig(m.login)}<b>${pos === 0 ? ico("crown", 18) : ""}${esc(m.name || m.login)}</b><small><span class="gl-wg-r">${cap}${m.hero ? " · " : ""}</span>${m.hero ? `${Math.floor(+m.hero.level || 1)} ур.` : ""}</small></li>`
				: `<li class="p${pos} empty"><span class="gl-hf gl-hf0" aria-hidden="true"></span><small>место в руководстве</small></li>`;

		return `<ul class="gl-wedge" aria-label="Руководство гильдии">${[
			[leads[2], 2],
			[leads[0], 1],
			[boss, 0],
			[leads[1], 1],
			[leads[3], 2],
		]
			.map(([m, pos]) => slot(m, pos, pos ? "руководство" : "глава"))
			.join("")}</ul>`;
	}

	const RAR_RU = {
		common: "обычная",
		uncommon: "необычная",
		rare: "редкая",
		epic: "эпическая",
		legendary: "легендарная",
	};
	const HSLOTS = [
		["helmet", "Шлем", "s0"],
		["weapon", "Оружие", "s2"],
		["shield", "Щит", "s1"],
		["armor", "Доспех", "s4"],
		["trinket", "Амулет", "s3"],
	];
	const HSTAT = [
		["power", "Сила", "#e0a12a"],
		["hp", "Здоровье", "#d9534f"],
		["atk", "Атака", "#e07a2a"],
		["mag", "Магия", "#7a5ad6"],
		["def", "Броня", "#4a8fd6"],
	];
	const SLOT_FB = {
		helmet: "⛑",
		weapon: "⚔",
		shield: "🛡",
		armor: "🥋",
		trinket: "📿",
	};
	const itArt = (it) => {
		let v = "";
		try {
			const INV = window.LGInventory;
			v = INV && INV.art ? INV.art(it) : "";
		} catch (e) {
			console.warn("[гильдии] рисунок вещи", e);
		}
		return (
			v ||
			`<span class="gl-gt-fb" aria-hidden="true">${SLOT_FB[it.slot] || "◆"}</span>`
		);
	};
	const itStats = (it) =>
		Object.entries(it.stats || {})
			.filter(([, v]) => +v)
			.map(
				([k, v]) =>
					`+${num(v)} ${({ hp: "здоровье", atk: "атака", mag: "магия", def: "броня" })[k] || k}`,
			)
			.join(", ");

	function itTip(el, it) {
		itTipOff();
		const t = document.createElement("div");
		t.className = "gl-ittip gw-dk";
		t.dataset.gst = gst();
		t.setAttribute("role", "tooltip");
		t.innerHTML = `<b data-r="${esc(it.rarity || "common")}">${esc(it.name)}${it.en > 0 ? ` +${+it.en}` : ""}</b><small>${esc((HSLOTS.find((x) => x[0] === it.slot) || [])[1] || "")} · ${esc(RAR_RU[it.rarity] || "обычная")}</small><p>${esc(itStats(it) || "без прибавок")}</p>`;
		W.el.appendChild(t);
		const r = el.getBoundingClientRect(),
			tr = t.getBoundingClientRect();
		let x = r.left + r.width / 2 - tr.width / 2,
			y = r.top - tr.height - 8;
		if (y < 8) y = r.bottom + 8;
		t.style.left = `${Math.max(8, Math.min(innerWidth - tr.width - 8, x))}px`;
		t.style.top = `${Math.max(8, y)}px`;
		t._for = el;
	}
	function itTipOff() {
		const t = W && W.el.querySelector(".gl-ittip");
		if (t) t.remove();
	}

	const RW_SVG = {
		coins:
			'<svg viewBox="0 0 32 32" aria-hidden="true"><ellipse cx="16" cy="21" rx="11" ry="6" fill="#b8791e" stroke="#3a2412" stroke-width="2"/><ellipse cx="16" cy="17" rx="11" ry="6" fill="#e0a23a" stroke="#3a2412" stroke-width="2"/><ellipse cx="16" cy="12" rx="11" ry="6" fill="#ffd24a" stroke="#3a2412" stroke-width="2"/><ellipse cx="13" cy="10.5" rx="5" ry="2" fill="#fff" opacity=".55"/></svg>',
		tokens:
			'<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3 L27 9.5 L27 22.5 L16 29 L5 22.5 L5 9.5 Z" fill="#7a5ad6" stroke="#2a1a4a" stroke-width="2" stroke-linejoin="round"/><path d="M16 7 L23.5 11.5 L23.5 20.5 L16 25 L8.5 20.5 L8.5 11.5 Z" fill="#9a7cf0"/><path d="M16 10 L17.8 14.2 L22.2 14.6 L18.8 17.4 L19.9 21.8 L16 19.4 L12.1 21.8 L13.2 17.4 L9.8 14.6 L14.2 14.2 Z" fill="#ffe27a" stroke="#2a1a4a" stroke-width="1.4" stroke-linejoin="round"/></svg>',
	};
	const RW_FB = { potion: "🧪", star: "⭐", sphere: "🔮", seal: "🔖" };

	const RW_POT = {
		potion_small: ["Малое зелье здоровья", 10],
		potion_hp: ["Большое зелье здоровья", 25],
	};
	const RW_IT = {
		potion: (id) => ({
			id: RW_POT[id] ? id : "potion_small",
			slot: "potion",
			rarity: "common",
			effect: { heal: (RW_POT[id] || RW_POT.potion_small)[1] },
		}),
		star: () => ({
			id: "enchant_star",
			slot: "material",
			mat: "star",
			rarity: "uncommon",
		}),
		sphere: () => ({
			id: "enchant_sphere",
			slot: "material",
			mat: "sphere",
			rarity: "rare",
		}),
		seal: (n) => ({
			id: "aurus_seal_" + n,
			slot: "material",
			mat: "seal",
			seal: n,
			rarity: n >= 10 ? "legendary" : "epic",
		}),
	};
	function rwArt(k, n) {
		if (RW_SVG[k]) return RW_SVG[k];
		let v = "";
		try {
			const INV = window.LGInventory;
			v = INV && INV.art && RW_IT[k] ? INV.art(RW_IT[k](n)) : "";
		} catch (e) {
			console.warn("[гильдии] рисунок награды", e);
		}
		return (
			v || `<span class="gl-gt-fb" aria-hidden="true">${RW_FB[k] || "◆"}</span>`
		);
	}
	const RW_DESC = {
		coins: "Монеты героя - на покупки, заточку и ремонт.",
		tokens: "Прокачка способностей героя на Арене.",
		potion: "Расходник: восстанавливает здоровье героя.",
		star: "Материал Кузни: повышает шанс заточки вещи.",
		sphere: "Материал Кузни: сохраняет вещь при неудачной заточке.",
		seal: "Материал Кузни: гарантирует успех заточки до уровня печати.",
	};
	const rwChip = (k, title, text, how, n) =>
		`<span class="gl-rwc" tabindex="0" data-rwt="${esc(title)}" data-rwq="${esc(how)}" data-rwd="${esc(RW_DESC[k] || "")}"><span class="gl-rwi">${rwArt(k, n)}</span><b>${esc(text)}</b></span>`;
	const pcs = (n) => `${num(n)} шт.`;
	const rwChips = (x) => {
		const c = Math.max(0, Math.round(+x.coins || 0)),
			q = (v) => Math.max(0, Math.round(+v || 0));
		return (
			(c
				? rwChip(
						"coins",
						"Монеты",
						silver(c).replace(" серебра", " сер.").replace(" бронзы", " бр."),
						silver(c),
					)
				: "") +
			(q(x.tokens)
				? rwChip(
						"tokens",
						"Жетоны навыков",
						`×${q(x.tokens)}`,
						pcs(q(x.tokens)),
					)
				: "") +
			(q(x.potions)
				? rwChip(
						"potion",
						(RW_POT[x.potionId] || ["Зелье лечения"])[0],
						`×${q(x.potions)}`,
						pcs(q(x.potions)),
						x.potionId,
					)
				: "") +
			(q(x.stars)
				? rwChip("star", "Звезда заточки", `×${q(x.stars)}`, pcs(q(x.stars)))
				: "") +
			(q(x.spheres)
				? rwChip(
						"sphere",
						"Сфера сохранения",
						`×${q(x.spheres)}`,
						pcs(q(x.spheres)),
					)
				: "") +
			(x.seal && q(x.seal.n)
				? rwChip(
						"seal",
						`Печать Ауруса ${q(x.seal.n)}`,
						`${q(x.seal.n)}${q(x.seal.qty) > 1 ? ` ×${q(x.seal.qty)}` : ""}`,
						pcs(Math.max(1, q(x.seal.qty))),
						q(x.seal.n),
					)
				: "")
		);
	};

	function rwTips(root) {
		if (root._rwTips) return;
		root._rwTips = true;
		const show = (el) => {
			itTipOff();
			const t = document.createElement("div");
			t.className = "gl-ittip gw-dk";
			t.dataset.gst = gst();
			t.setAttribute("role", "tooltip");
			t.innerHTML = `<b>${esc(el.dataset.rwt)}</b><small>${esc(el.dataset.rwq)} каждому участнику</small><p>${esc(el.dataset.rwd)}</p>`;
			W.el.appendChild(t);
			const r = el.getBoundingClientRect(),
				tr = t.getBoundingClientRect();
			let y = r.top - tr.height - 8;
			if (y < 8) y = r.bottom + 8;
			t.style.left = `${Math.max(8, Math.min(innerWidth - tr.width - 8, r.left + r.width / 2 - tr.width / 2))}px`;
			t.style.top = `${Math.max(8, y)}px`;
			t._for = el;
		};
		const of = (e) =>
			e.target.closest ? e.target.closest("[data-rwt]") : null;
		root.addEventListener("pointerover", (e) => {
			if (e.pointerType === "touch") return;
			const c = of(e);
			if (c) show(c);
		});
		root.addEventListener("pointerout", (e) => {
			if (e.pointerType !== "touch" && of(e)) itTipOff();
		});
		root.addEventListener("focusin", (e) => {
			const c = of(e);
			if (c) show(c);
		});
		root.addEventListener("focusout", itTipOff);
		root.addEventListener("click", (e) => {
			const c = of(e);
			if (c) show(c);
			else itTipOff();
		});
	}

	function rwFill(S) {
		const box = S.body.querySelector(".gl-trw");
		if (!box) return;
		const lvNow = lvlOf(W.guild).lv;
		const paint = (r) => {
			if (!W || !box.isConnected || !r || !r.ok) return;
			const L = lvlOf(W.guild),
				cur = (r.rewards || []).find((x) => x.lv === L.lv),
				nx = (r.rewards || []).find((x) => x.lv === L.lv + 1);
			box.innerHTML =
				(cur && r.curMine != null && r.level === L.lv
					? `<section class="gl-rwb ${r.curMine === false ? "miss" : "got"}"><h4>Награда за ${L.lv} уровень <small>${r.curMine === false ? "ты вступил позже" : "✓ получена"}</small></h4><div class="gl-rws">${rwChips(cur)}</div></section>`
					: "") +
				(nx
					? `<section class="gl-rwb next"><h4>Награда за ${L.lv + 1} уровень <small>${L.to != null ? `ещё ${num(Math.max(0, L.to - L.xp))} опыта` : ""}</small></h4><div class="gl-rws">${rwChips(nx)}</div></section>`
					: '<section class="gl-rwb"><h4>Наибольший уровень</h4><p class="gl-cs">Все награды получены.</p></section>') +
				'<p class="gl-cs gl-rwnote">Награду получают те, кто был в гильдии в момент, когда она взяла уровень.</p>';
		};
		rwTips(box);
		if (W.lvlRw && W.lvlRw.lv === lvNow) {
			paint(W.lvlRw.r);
			return;
		}
		api.levels().then((r) => {
			if (W && r && r.ok) W.lvlRw = { lv: lvNow, r };
			paint(r);
		});
	}

	const NEWS_ROW = {
		level: (x) =>
			`<li class="lv"><span class="gl-nwi" aria-hidden="true">⭐</span><div><b>Гильдия получила ${Math.round(+x.lv)} уровень!</b>${x.mine && x.reward ? `<small>Твоя награда уже в сумке:</small><div class="gl-rws">${rwChips(x.reward)}</div>` : "<small>Награду получили те, кто был в гильдии в этот момент.</small>"}</div></li>`,
		leader: (x) =>
			`<li><span class="gl-nwi" aria-hidden="true">👑</span><div><b>${x.me ? "Ты - новый глава гильдии" : `Новый глава гильдии - ${esc(x.name)}`}</b>${x.auto ? `<small>Прежний глава не заходил в игру${+x.days > 0 ? ` ${Math.round(+x.days)} дн.` : ""} и перешёл в руководство.</small>` : ""}</div></li>`,
		star: (x) =>
			`<li><span class="gl-nwi" aria-hidden="true">🌟</span><div><b>Получена Звезда гильдии № ${Math.round(+x.n)}</b><small>Глава или руководство может открыть или улучшить навык.</small></div></li>`,
		skill: (x) =>
			`<li><span class="gl-nwi" aria-hidden="true">📈</span><div><b>Навык «${esc(x.name)}» улучшен до ${Math.round(+x.lv)} ур.</b></div></li>`,
		run: (x) =>
			`<li><span class="gl-nwi" aria-hidden="true">🥾</span><div><b>Назначена вылазка гильдии</b><small>${esc(dt(x.at))}${x.place ? ` · «${esc(x.place)}»` : ""}${x.by ? ` · назначил ${esc(x.by)}` : ""}</small></div></li>`,
	};
	function newsWin(news) {
		if (!W) return;
		const rows = news
			.map((x) => (x && Object.hasOwn(NEWS_ROW, x.k) ? NEWS_ROW[x.k](x) : ""))
			.join("");
		if (!rows) {
			void api.act({ op: "newsSeen" });
			return;
		}
		const el = document.createElement("div");
		el.className = "gl-askm gl-newsm";
		el.innerHTML = `<div class="gl-askw gl-newsw" role="dialog" aria-modal="true" aria-labelledby="glNwT"><h3 id="glNwT">Новости гильдии</h3><ul class="gl-news">${rows}</ul><div class="gl-askb"><button type="button" class="gl-btn" data-yes="1">Понятно</button></div></div>`;
		W.el.appendChild(el);
		rwTips(el);
		const prev = W.layer,
			off = () => {
				if (W && W.layer === off) W.layer = prev || null;
				itTipOff();
				el.remove();
				void api.act({ op: "newsSeen" });
			};
		W.layer = off;
		el.addEventListener("click", (e) => {
			if (e.target === el || e.target.closest("[data-yes]")) off();
		});
		try {
			el.querySelector("[data-yes]").focus({ preventScroll: true });
		} catch (e) {
			console.warn("[гильдии] фокус новостей", e);
		}
	}

	function skillsHtml(h) {
		const sk = h.sk,
			T = sk && sk.tree;
		if (!T) return '<p class="gl-note">Навыков пока нет.</p>';
		const rk = sk.t || {},
			spent = Object.values(rk).reduce((x, y) => x + (+y || 0), 0);
		const br = T.branches
			.map((B) => {
				const pts = B.nodes.reduce((x, n) => x + (+rk[n.id] || 0), 0);
				const ns = [...B.nodes]
					.sort((x, y) => (x.req || 0) - (y.req || 0))
					.map((n) => {
						const r = +rk[n.id] || 0;
						return `<li class="${r ? "has" : ""}${r >= n.max ? " max" : ""}" title="${esc(n.name)}: ранг ${r} из ${n.max}"><span>${esc(n.name)}</span><span class="gl-skr" aria-label="ранг ${r} из ${n.max}">${Array.from({ length: n.max }, (_, i) => `<i${i < r ? ' class="f"' : ""}></i>`).join("")}</span></li>`;
					})
					.join("");
				return `<section class="gl-skb${pts ? " on" : ""}" aria-label="Ветка ${esc(B.name)}"><h4>${B.icon ? `<span aria-hidden="true">${esc(B.icon)}</span>` : ""}${esc(B.name)}<b>${pts}</b></h4><ul>${ns}</ul></section>`;
			})
			.join("");
		return `<p class="gl-cs">Дерево «${esc(T.name)}» · вложено очков: <b>${spent}</b>${spent ? "" : " - навыки не выбраны"}</p><div class="gl-skt">${br}</div>`;
	}

	const BRC = ["#ff8a4a", "#5ab8ff", "#8fdc5a"];
	const abOf = (h, slot) => (h.ab && h.ab[slot]) || null;

	function slotsHtml(h) {
		const one = (cap, a, need) => {
			const on = !!(a && !a.lock);
			return `<span class="gl-sc2${on ? "" : " off"}" style="--bc:${on ? BRC[a.bi] || BRC[0] : "var(--gw-sep)"}" tabindex="0" data-tipt="${esc(on ? a.name : cap)}" data-tipd="${esc(on ? a.text || "" : a ? `Откроется на ${a.lock || need} уровне героя.` : "Способности Арены у героя пока нет.")}"><i aria-hidden="true">${on ? esc(a.icon || "✦") : "🔒"}</i><small>${cap}</small><b>${on ? esc(a.name) : a ? `с ${a.lock} ур.` : "нет"}</b></span>`;
		};
		return `<div class="gl-sc2s">${one("способность", abOf(h, "ab"), 5)}${one("ульта", abOf(h, "ult"), 15)}</div>`;
	}

	function treeHtml(h) {
		const sk = h.sk,
			T = sk && sk.tree;
		if (!T) return "";
		const rk = sk.t || {},
			CX = 500,
			CY = 440,
			ANG = [-90, 180, 0],
			lv = Math.floor(+h.level || 1);
		const slotIn = (slot, bi) => {
			const a = abOf(h, slot);
			return a && a.bi === bi ? a : null;
		};
		let lines = "",
			nodes = "";
		T.branches.slice(0, 3).forEach((B, bi) => {
			const a = (ANG[bi] * Math.PI) / 180,
				ux = Math.cos(a),
				uy = Math.sin(a),
				px = -uy,
				py = ux,
				col = BRC[bi];
			const tiers = [...new Set(B.nodes.map((n) => n.req || 0))].sort(
					(x, y) => x - y,
				),
				pts = B.nodes.reduce((x, n) => x + (+rk[n.id] || 0), 0);
			let prev = [{ x: CX, y: CY, off: 0, on: true }];
			tiers.forEach((rq, ti) => {
				const L = B.nodes.filter((n) => (n.req || 0) === rq),
					R = 96 + ti * 58,
					cur = [];
				L.forEach((n, i) => {
					const off = (i - (L.length - 1) / 2) * 62,
						x = CX + ux * R + px * off,
						y = CY + uy * R + py * off,
						r = +rk[n.id] || 0;
					const near = Math.min(...prev.map((q) => Math.abs(q.off - off))),
						par = prev.filter(
							(q) => Math.abs(q.off - off) <= Math.max(near, 34),
						);
					for (const q of par)
						lines += `<line x1="${q.x.toFixed(1)}" y1="${q.y.toFixed(1)}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"${r && q.on ? ` class="on" style="--bc:${col}"` : ""}/>`;
					nodes += `<g class="tn${r ? " on" : ""}${r >= n.max ? " max" : ""}" style="--bc:${col}" tabindex="0" data-tipt="${esc(n.name)}" data-tipd="Ветка «${esc(B.name)}» · ранг ${r} из ${n.max}${rq ? ` · открывается с ${rq} очков в ветке` : ""}"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="21"/><text x="${x.toFixed(1)}" y="${(y + 5).toFixed(1)}" text-anchor="middle">${r}/${n.max}</text></g>`;
					cur.push({ x, y, off, on: r > 0 });
				});
				prev = cur;
			});

			[
				[slotIn("ab", bi), 5, -40, "Способность"],
				[slotIn("ult", bi), 15, 40, "Ульта"],
			].forEach(([ab, need, off, cap]) => {
				if (!ab) return;
				const R = 96 + tiers.length * 58 + 6,
					x = CX + ux * R + px * off,
					y = CY + uy * R + py * off,
					on = !ab.lock;
				for (const q of prev)
					lines += `<line x1="${q.x.toFixed(1)}" y1="${q.y.toFixed(1)}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"${on && q.on ? ` class="on" style="--bc:${col}"` : ""}/>`;
				nodes += `<g class="td${on ? " on" : ""}" style="--bc:${col}" tabindex="0" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})" data-tipt="${esc(cap)}: ${esc(ab.name)}" data-tipd="${esc(ab.text || "")}${on ? "" : ` · с ${ab.lock || need} уровня героя`}"><rect x="-21" y="-21" width="42" height="42" rx="7" transform="rotate(45)"/><text text-anchor="middle" y="6">${esc(ab.icon || "✦")}</text></g>`;
			});
			const lb =
				bi === 0
					? [CX + 104, CY - 96 - tiers.length * 58 + 12, "start"]
					: [CX + ux * (96 + tiers.length * 58 + 6), CY - 92, "middle"];
			nodes += `<text class="tbl" style="--bc:${col}" x="${lb[0].toFixed(1)}" y="${lb[1].toFixed(1)}" text-anchor="${lb[2]}">${esc(B.name)} · ${pts}</text>`;
		});
		const hub = `<g class="th"><circle cx="${CX}" cy="${CY}" r="38"/><text x="${CX}" y="${CY + 2}" text-anchor="middle">${lv}</text><text class="s" x="${CX}" y="${CY + 19}" text-anchor="middle">уровень</text></g>`;
		return `<div class="gl-trmap"><svg viewBox="0 0 1000 540" role="img" aria-label="Древо навыков: ${esc(T.name)}">${lines}${nodes}${hub}</svg><div class="gl-trs"><h6>Способности на Арене</h6>${slotsHtml(h)}</div></div>`;
	}

	function treeTips(root) {
		if (root._tt) return;
		root._tt = 1;
		const show = (el) => {
			itTipOff();
			const t = document.createElement("div");
			t.className = "gl-ittip";
			t.setAttribute("role", "tooltip");
			t.innerHTML = `<b>${esc(el.dataset.tipt)}</b><p>${esc(el.dataset.tipd)}</p>`;
			W.el.appendChild(t);
			const r = el.getBoundingClientRect(),
				tr = t.getBoundingClientRect();
			let y = r.top - tr.height - 8;
			if (y < 8) y = r.bottom + 8;
			t.style.left = `${Math.max(8, Math.min(innerWidth - tr.width - 8, r.left + r.width / 2 - tr.width / 2))}px`;
			t.style.top = `${Math.max(8, y)}px`;
		};
		const of = (e) =>
			e.target.closest ? e.target.closest("[data-tipt]") : null;
		root.addEventListener("pointerover", (e) => {
			if (e.pointerType === "touch") return;
			const c = of(e);
			if (c) show(c);
		});
		root.addEventListener("pointerout", (e) => {
			if (e.pointerType !== "touch" && of(e)) itTipOff();
		});
		root.addEventListener("focusin", (e) => {
			const c = of(e);
			if (c) show(c);
		});
		root.addEventListener("click", (e) => {
			const c = of(e);
			if (c) show(c);
		});
	}
	async function heroWin(tid) {
		if (!W || !W.guild) return;
		const rq = (W.guild.requests || []).find(
			(x) => x.kind === "apply" && String(x.tid) === String(tid),
		);
		const m = W.guild.members.find((x) => String(x.tid) === String(tid)) || rq;
		if (!m) return;
		const nick = m.name || m.login || "игрок",
			acts =
				!rq &&
				(memActs(W.guild, m).length > 0 || memCommon(W.guild, m).length > 1),
			rqOk = !!rq && can(W.guild, "accept");
		const S = subWin(
			"hero",
			rq
				? "Заявка на вступление"
				: ROLE[m.role]
					? ROLE[m.role][0].toUpperCase() + ROLE[m.role].slice(1)
					: "Герой",
		);
		S.body.innerHTML = '<p class="gl-note">Смотрю героя…</p>';
		const r = await memo(`hero:${W.guild.guild.id}:${tid}`, 60e3, () =>
			api.hero(tid, W.guild.guild.id),
		);
		if (!W || W.sub !== S) return;
		if (!r || !r.ok || !r.hero) {
			S.body.innerHTML = `<p class="gl-note">${esc((r && r.error) || "У игрока пока нет героя.")}</p>`;
			return;
		}
		const h = r.hero,
			by = {};
		for (const it of h.items || []) if (!by[it.slot]) by[it.slot] = it;
		const tile = ([sl, ru, area]) => {
			const it = by[sl];
			return it
				? `<button type="button" class="gl-gt" style="grid-area:${area}" data-r="${esc(it.rarity || "common")}" data-it="${sl}" aria-label="${esc(ru)}: ${esc(it.name)}, ${esc(itStats(it))}">${itArt(it)}${it.en > 0 ? `<i>+${+it.en}</i>` : ""}</button>`
				: `<span class="gl-gt empty" style="grid-area:${area}">${esc(ru)}<br>пусто</span>`;
		};
		const st = { power: h.power, ...(h.st || {}) };
		const role = /^[a-z]{1,20}$/.test(String(h.role || ""))
			? h.role
			: "recruit";
		const main = () => {
			S.body.innerHTML =
				`<div class="gl-hw"><div class="gl-pd">${HSLOTS.map(tile).join("")}<div class="gl-pme">${heroFig(m.login)}</div>` +
				`<div class="gl-pnm"><b>${esc(nick)}</b><span><span class="gl-mh-l">${Math.floor(+h.level || 1)} ур.</span><span class="gl-mh-c"><i class="gl-cls r-${esc(role)}" aria-hidden="true"></i>${esc(h.roleName || CLS_RU[role] || role)}</span></span></div></div>` +
				`<div class="gl-hw-r"><h4 class="gl-hw-h">Характеристики</h4><div class="gl-hst">${HSTAT.map(([k, ru, c]) => `<span style="--c:${c}"${k === "power" ? ' class="wide"' : ""}><small>${ru}</small><b>${num(st[k])}</b></span>`).join("")}</div>` +
				`<h4 class="gl-hw-h">Способности на Арене</h4>${slotsHtml(h)}` +
				`<button type="button" class="gl-btn" data-hsk="1">${ico("trusted", 18)}Древо навыков</button>` +
				(acts
					? `<button type="button" class="gl-btn ghost" data-hacts="1">Действия…</button>`
					: "") +
				(rqOk
					? `<div class="gl-hw-rq"><button type="button" class="gl-btn" data-hreq="accept">Принять</button><button type="button" class="gl-btn bad" data-hreq="decline">Отклонить</button></div>`
					: "") +
				"</div></div>";
		};
		main();
		treeTips(S.body);
		const tipOf = (e) => {
			const b = e.target.closest && e.target.closest("[data-it]");
			return b && by[b.dataset.it] ? b : null;
		};
		S.body.addEventListener("pointerover", (e) => {
			if (e.pointerType === "touch") return;
			const b = tipOf(e);
			if (b) itTip(b, by[b.dataset.it]);
		});
		S.body.addEventListener("pointerout", (e) => {
			if (e.pointerType !== "touch" && tipOf(e)) itTipOff();
		});
		S.body.addEventListener("focusin", (e) => {
			const b = tipOf(e);
			if (b) itTip(b, by[b.dataset.it]);
		});
		S.body.addEventListener("focusout", itTipOff);
		const off0 = S.close;
		S.close = () => {
			itTipOff();
			off0();
		};
		S.el.addEventListener(
			"click",
			(e) => {
				if (!e.target.closest("[data-it]")) itTipOff();
				if (e.target === S.el || e.target.closest(".gl-subx")) itTipOff();
			},
			true,
		);
		S.body.onclick = (e) => {
			const q = e.target.closest("[data-hreq]");
			if (q) {
				const op = q.dataset.hreq;
				S.close();
				const rb =
					W &&
					W.body.querySelector(
						`[data-op="${op}"][data-who="${CSS.escape(String(tid))}"]`,
					);
				if (rb) rb.click();
				return;
			}
			const a = e.target.closest("[data-hacts]");
			if (a) {
				const rr = a.getBoundingClientRect();
				S.close();
				memMenu(tid, rr.left, rr.top, null);
				return;
			}
			if (e.target.closest("[data-hsk]")) {
				S.body.innerHTML = `<div class="gl-skw"><div class="gl-skhd"><button type="button" class="gl-mini" data-hback="1">← К герою</button><b>${esc(nick)}</b><span class="gl-mh-c"><i class="gl-cls r-${esc(role)}" aria-hidden="true"></i>${esc(h.roleName || CLS_RU[role] || role)}, ${Math.floor(+h.level || 1)} ур.</span></div>${treeHtml(h)}<div class="gl-sklist">${skillsHtml(h)}</div></div>`;
				S.el.dataset.view = "sk";
				treeTips(S.body);
				return;
			}
			if (e.target.closest("[data-hback]")) {
				delete S.el.dataset.view;
				main();
				return;
			}
			const b = e.target.closest("[data-it]");
			if (!b) return;
			const t = W.el.querySelector(".gl-ittip");
			if (t && t._for === b && e.detail) {
			} else itTip(b, by[b.dataset.it]);
		};
	}

	function askG(o) {
		return new Promise((res) => {
			if (!W) {
				res(false);
				return;
			}
			const el = document.createElement("div");
			el.className = "gl-askm";
			el.innerHTML =
				`<div class="gl-askw" role="alertdialog" aria-modal="true" aria-labelledby="glAskT"><h3 id="glAskT">${esc(o.title || "")}</h3>${o.text ? `<p>${esc(o.text)}</p>` : ""}` +
				`<div class="gl-askb"><button type="button" class="gl-btn ghost" data-no="1">${esc(o.no || "Отмена")}</button><button type="button" class="gl-btn${o.danger ? " bad" : ""}" data-yes="1">${esc(o.yes || "Да")}</button></div></div>`;
			W.el.appendChild(el);
			const prev = W.layer;
			const done = (v) => {
				if (W && W.layer === off) W.layer = prev || null;
				el.remove();
				res(v);
			};
			const off = () => done(false);
			W.layer = off;
			el.addEventListener("click", (e) => {
				if (e.target === el || e.target.closest("[data-no]")) done(false);
				else if (e.target.closest("[data-yes]")) done(true);
			});
			try {
				el.querySelector("[data-no]").focus({ preventScroll: true });
			} catch (x) {
				console.warn("[гильдии] фокус подтверждения", x);
			}
		});
	}
	function memHtml(r, acts) {
		const me = r.me;
		const row = (m) => {
			const self = me && m.tid === me.tid,
				nick = m.name || m.login || "игрок",
				has = acts && memHas(r, m);
			return (
				`<li class="${self ? "me" : ""}${has ? " gl-hasm" : ""}" data-mtid="${esc(m.tid)}" data-hero="${esc(m.tid)}" tabindex="0" title="Нажми - вещи и характеристики${has ? "; правая кнопка мыши (на телефоне - подержать) - действия" : ""}">` +
				`${heroFig(m.login)}<span class="gl-mn"><b>${tierOf(m.role) === "leader" ? ico("crown", 16) : ""}${esc(nick)}${self ? " <small>(ты)</small>" : ""}</b>${memHero(m)}${seenHtml(m)}` +
				`${m.pending || (m.mutedUntil && +m.mutedUntil > Date.now()) ? `<small>${m.pending ? "ждёт решения о переезде" : ""}${m.mutedUntil && +m.mutedUntil > Date.now() ? `${m.pending ? " · " : ""}<span class="gl-muted"${m.mutedWhy ? ` title="Причина: ${esc(m.mutedWhy)}"` : ""}>не пишет в чат ${esc(left(m.mutedUntil).replace("через", "ещё"))}</span>` : ""}</small>` : ""}<small class="gl-st" aria-live="polite"></small></span>` +
				(has
					? `<button type="button" class="gl-more${r.memMenu ? " on" : ""}" data-more="${esc(m.tid)}" aria-label="Действия: ${esc(nick)}" aria-haspopup="menu">⋯</button>`
					: "") +
				"</li>"
			);
		};

		const SEC = [
			["lead", "Руководство", ["leader", "lead"]],
			["trusted", "Доверенные лица", ["trusted"]],
			["novice", "Новички", ["novice"]],
		];
		const pw = (m) => (m.hero ? +m.hero.power || 0 : -1);
		return SEC.map(([t, name, tiers]) => {
			const L = r.members
				.filter((m) => tiers.includes(tierOf(m.role)))
				.sort(
					(a, b) =>
						(tierOf(b.role) === "leader") - (tierOf(a.role) === "leader") ||
						pw(b) - pw(a),
				);
			return L.length
				? `<section class="gl-msec t-${t}"><h3 class="gl-tier">${ico(ROLE_ICO[t], 20)}${name} <small>${L.length}</small></h3><ul class="gl-mem gl-mem2">${L.map(row).join("")}</ul></section>`
				: "";
		}).join("");
	}

	function memMenu(tid, cx, cy, from) {
		if (!W || !W.guild) return;
		layerOff();
		const r = W.guild,
			m = r.members.find((x) => String(x.tid) === String(tid));
		if (!m) return;
		if (AQ.keys.has("mem:" + tid)) return;
		const com = memCommon(r, m),
			acts = memActs(r, m);
		if (!com.length && !acts.length) return;
		const nick = m.name || m.login || "игрок",
			nk = String(m.login || "").toLowerCase();
		const el = document.createElement("div");
		el.className = "gl-menu";
		el.setAttribute("role", "menu");
		el.setAttribute("aria-label", `Действия: ${nick}`);
		const btn = ([k, t, bad]) =>
			`<button type="button" role="menuitem" data-mk="${k}"${bad ? ' class="bad"' : ""}>${esc(t)}</button>`;
		el.innerHTML =
			`<div class="gl-menu-h">${esc(nick)} <small>${esc(ROLE[m.role] || "")}</small></div>` +
			com.map(btn).join("") +
			(com.length && acts.length
				? '<div class="gl-menu-sep" role="separator"></div>'
				: "") +
			acts.map(btn).join("");
		W.el.appendChild(el);

		const clamp = (x, y) => {
			const rr = el.getBoundingClientRect(),
				w = rr.width,
				h = rr.height;
			let yy = y;
			if (yy + h > innerHeight - 8) yy = Math.max(8, y - 8 - h);
			return [
				Math.max(8, Math.min(innerWidth - w - 8, x)),
				Math.max(8, Math.min(innerHeight - h - 8, yy)),
			];
		};
		const pos =
			window.LGSiteUi && window.LGSiteUi.clampXY
				? window.LGSiteUi.clampXY(el, cx, cy + 4)
				: clamp(cx, cy + 4);
		el.style.left = Math.round(pos[0]) + "px";
		el.style.top = Math.round(pos[1]) + "px";
		const out = (e) => {
			if (!el.contains(e.target)) layerOff();
		};
		const key = (e) => {
			if (e.key === "ArrowDown" || e.key === "ArrowUp") {
				e.preventDefault();
				const bs = [...el.querySelectorAll("button")],
					i = bs.indexOf(document.activeElement);
				bs[
					(i + (e.key === "ArrowDown" ? 1 : bs.length - 1)) % bs.length
				].focus();
			} else if (e.key === "Home" || e.key === "End") {
				e.preventDefault();
				const bs = [...el.querySelectorAll("button")];
				bs[e.key === "Home" ? 0 : bs.length - 1].focus();
			} else if (e.key === "Tab") layerOff();
		};

		const roll = (e) => {
			if (!el.contains(e.target)) layerOff();
		};
		const off = () => {
			el.remove();
			document.removeEventListener("pointerdown", out, true);
			document.removeEventListener("scroll", roll, true);
			window.removeEventListener("resize", layerOff);
			el.removeEventListener("keydown", key);
			if (W && W.layer === off) W.layer = null;
			if (from && from.isConnected)
				try {
					from.focus({ preventScroll: true });
				} catch (x) {}
		};
		W.layer = off;
		setTimeout(() => {
			if (W && W.layer === off) {
				document.addEventListener("pointerdown", out, true);
				document.addEventListener("scroll", roll, {
					capture: true,
					passive: true,
				});
				window.addEventListener("resize", layerOff);
			}
		}, 0);
		el.addEventListener("keydown", key);
		el.addEventListener("click", (e) => {
			const b = e.target.closest("[data-mk]");
			if (!b) return;
			const k = b.dataset.mk;
			layerOff();

			if (k === "prof") {
				const P = window.LGProfile;
				if (P && P.on() !== false)
					void P.open(nk).then((ok) => {
						if (!ok) void heroWin(m.tid);
					});
				else void heroWin(m.tid);
				return;
			}
			if (k === "mail") {
				try {
					void window.LGMail.open({ compose: nk });
				} catch (x) {
					toast("Почта не открылась", true);
				}
				return;
			}
			if (k.startsWith("cmp-")) {
				try {
					window.LGCityMon.menuAct(k, nk, nick);
				} catch (x) {
					toast("Не вышло позвать в группу", true);
				}
				return;
			}
			if (k.startsWith("fr-")) {
				try {
					void window.LGFriends.menuAct(k, nk);
				} catch (x) {
					toast("Друзья не открылись", true);
				}
				return;
			}
			if (k.startsWith("up-") || k.startsWith("down-"))
				memJob({ op: "role", who: String(m.tid), role: k.split("-")[1] });
			else if (k === "kick")
				sure({
					title: `Исключить ${nick} из гильдии?`,
					text: `${nick} сможет вступить в другую гильдию через 30 минут.`,
					btn: "Исключить",
				}).then((ok) => {
					if (ok) memJob({ op: "kick", who: String(m.tid) });
				});
			else if (k === "gmute")
				pickMin(nick).then(async (min) => {
					if (!min) return;
					const why =
						window.LGSiteUi && window.LGSiteUi.askReason
							? await window.LGSiteUi.askReason({
									who: nick,
									what: `чат гильдии: ${minRu(min)}`,
								})
							: "";
					if (why === null) return;
					memJob({
						op: "gmute",
						who: String(m.tid),
						min,
						...(why ? { reason: why } : {}),
					});
				});
			else if (k === "gunmute") memJob({ op: "gunmute", who: String(m.tid) });
			else if (k === "transfer")
				sure({
					title: `Передать главу игроку ${nick}?`,
					text: "Вы станете руководством. Вернуть главу может только новый глава.",
					btn: "Передать главу",
					need: nick,
				}).then((ok) => {
					if (ok) act({ op: "transfer", who: String(m.tid) });
				});
		});
		try {
			el.querySelector("button").focus({ preventScroll: true });
		} catch (x) {
			console.warn("[гильдии] фокус меню", x);
		}
	}

	const MUTE_MINS = [
		[15, "15 мин"],
		[60, "1 час"],
		[360, "6 часов"],
		[1440, "1 день"],
		[10080, "7 дней"],
	];
	function pickMin(nick) {
		return new Promise((done) => {
			if (!W) {
				done(null);
				return;
			}
			layerOff();
			const el = document.createElement("div");
			el.className = "gl-cf";
			el.innerHTML =
				`<div class="gl-cfw" role="alertdialog" aria-modal="true" aria-labelledby="glMuT"><h3 id="glMuT">Запретить ${esc(nick)} писать в чат гильдии</h3>` +
				"<p>Только в чат вашей гильдии: общий чат, торговля и личные сообщения - как раньше. Снять запрет можно в любой момент.</p>" +
				`<div class="gl-btns gl-mins">${MUTE_MINS.map(([v, t]) => `<button type="button" class="gl-btn" data-min="${v}">${t}</button>`).join("")}</div>` +
				'<div class="gl-btns"><button type="button" class="gl-btn ghost" data-min="0">Отмена</button></div></div>';
			W.el.appendChild(el);
			const fin = (v) => {
				el.remove();
				document.removeEventListener("keydown", esc1, true);
				if (W && W.layer === off) W.layer = null;
				done(v);
			};
			const off = () => fin(null);
			const esc1 = (e) => {
				if (e.key === "Escape") {
					e.stopPropagation();
					fin(null);
				}
			};
			W.layer = off;
			document.addEventListener("keydown", esc1, true);
			el.addEventListener("click", (e) => {
				const b = e.target.closest("[data-min]");
				if (b) fin(+b.dataset.min || null);
				else if (e.target === el) fin(null);
			});
			try {
				el.querySelector("[data-min]").focus({ preventScroll: true });
			} catch (x) {
				console.warn("[гильдии] фокус окна", x);
			}
		});
	}
	function layerOff() {
		if (W && W.layer) W.layer();
	}

	function sure(o) {
		return new Promise((done) => {
			if (!W) {
				done(false);
				return;
			}
			layerOff();
			const el = document.createElement("div");
			el.className = "gl-cf";
			el.innerHTML =
				`<div class="gl-cfw" role="alertdialog" aria-modal="true" aria-labelledby="glCfT"><h3 id="glCfT">${esc(o.title)}</h3><p>${esc(o.text)}</p>` +
				(o.need
					? `<label class="gl-cfn">Чтобы подтвердить, впишите ник: <b>${esc(o.need)}</b><input type="text" autocomplete="off" aria-label="Ник для подтверждения"></label>`
					: "") +
				`<div class="gl-btns"><button type="button" class="gl-btn${o.good ? "" : " bad"}" data-cf="1" disabled>${esc(o.btn)}${o.wait === 0 ? "" : " (2)"}</button><button type="button" class="gl-btn ghost" data-cf="0">Отмена</button></div></div>`;
			W.el.appendChild(el);
			const go = el.querySelector('[data-cf="1"]'),
				inp = el.querySelector("input");
			let left = o.wait == null ? 2 : o.wait,
				ready = false;
			const fit = () => {
				go.disabled =
					!ready ||
					(!!o.need &&
						String(inp.value).trim().toLowerCase() !==
							String(o.need).toLowerCase());
			};
			let t = 0;
			const tick = () => {
				left--;
				if (left > 0) {
					go.textContent = `${o.btn} (${left})`;
					t = setTimeout(tick, 1000);
					return;
				}
				go.textContent = o.btn;
				ready = true;
				fit();
			};
			if (left > 0) t = setTimeout(tick, 1000);
			else {
				left = 1;
				tick();
			}
			const end = (v) => {
				clearTimeout(t);
				el.remove();
				if (W && W.layer === off) W.layer = null;
				done(v);
			};
			const off = () => end(false);
			W.layer = off;
			if (inp) inp.addEventListener("input", fit);
			el.addEventListener("click", (e) => {
				const b = e.target.closest("[data-cf]");
				if (e.target === el) {
					end(false);
					return;
				}
				if (!b || b.disabled) return;
				end(b.dataset.cf === "1");
			});
			try {
				(inp || el.querySelector('[data-cf="0"]')).focus({
					preventScroll: true,
				});
			} catch (x) {
				console.warn("[гильдии] фокус подтверждения", x);
			}
		});
	}
	const inviteHtml = () =>
		'<form class="gl-row" data-form="invite"><input name="login" placeholder="Ник игрока на Twitch" aria-label="Ник для приглашения" autocomplete="off" required maxlength="26"><button type="submit" class="gl-btn">Пригласить</button></form><p class="gl-note gl-sm">Приглашённый вступает и в гильдию «по заявке».</p>';

	const CLS_RU = {
		legionary: "Легионер",
		paladin: "Паладин",
		rogue: "Разбойник",
		recruit: "Новобранец",
		archer: "Лучник",
		mage: "Маг",
		necromancer: "Некромант",
		priest: "Жрец",
	};
	function reqHero(x) {
		if (x.hero === undefined) return "";
		if (!x.hero) return '<small class="gl-hc none">нет героя</small>';
		const role = /^[a-z]{1,20}$/.test(String(x.hero.role || ""))
				? x.hero.role
				: "recruit",
			nm = x.hero.roleName || CLS_RU[role] || role,
			lv = Math.max(1, Math.floor(+x.hero.level || 1));
		return `<small class="gl-hc" title="${esc(nm)}, ${lv} уровень"><i class="gl-cls r-${esc(role)}" aria-hidden="true"></i><span class="gl-hcn">${esc(nm)}</span> <span class="gl-hcl">· ${lv} ур.</span></small>`;
	}
	function reqHtml(r) {
		const ap = (r.requests || []).filter((x) => x.kind === "apply"),
			iv = (r.requests || []).filter((x) => x.kind === "invite");
		const ok = can(r, "accept");
		const all =
			ok && ap.length > 1
				? '<span class="gl-ma"><button type="button" class="gl-mini" data-all="accept">Принять всех</button><button type="button" class="gl-mini bad" data-all="decline">Отклонить всех</button></span>'
				: "";
		return (
			`<div class="gl-reqh"><h3>Заявки на вступление</h3>${all}</div>${ap.length ? `<ul class="gl-mem gl-mem2 gl-reqs">${ap.map((x) => `<li data-req="${esc(x.tid)}"${x.hero ? ` data-hero="${esc(x.tid)}" tabindex="0" title="Нажми - вещи и характеристики"` : ""}>${heroFig(x.login)}<span class="gl-mn"><b>${esc(x.name || x.login || "игрок")}</b>${x.hero && x.hero.power != null ? memHero({ hero: x.hero }) : reqHero(x)}<small class="gl-rqat">${esc(dt(x.at))}</small><small class="gl-st" aria-live="polite"></small></span>${ok ? `<span class="gl-ma"><button type="button" class="gl-mini" data-op="accept" data-who="${esc(x.tid)}">Принять</button><button type="button" class="gl-mini bad" data-op="decline" data-who="${esc(x.tid)}">Отклонить</button></span>` : ""}</li>`).join("")}</ul>` : '<p class="gl-note">Заявок нет.</p>'}` +
			(iv.length
				? `<h3>Отправленные приглашения</h3><ul class="gl-mem">${iv.map((x) => `<li><span class="gl-mn"><b>${esc(x.name || x.login || "игрок")}</b><small>${esc(dt(x.at))}</small></span></li>`).join("")}</ul>`
				: "")
		);
	}

	function setHtml(r) {
		const g = r.guild,
			lead = tierOf(roleOf(r)) === "leader",
			out = [];
		if (can(r, "open"))
			out.push(`<section><h3>Набор</h3><p>${g.open ? "Гильдия открыта - вступают в один клик." : "По заявке - вступают после одобрения или по приглашению."}</p><button type="button" class="gl-btn" data-op="setOpen" data-open="${g.open ? "0" : "1"}">${g.open ? "Только по заявке" : "Открыть для всех"}</button>
      <form data-form="minlvl" class="gl-row gl-minl"><label for="glMinL">Вступить и подать заявку можно с уровня героя</label><input id="glMinL" name="level" type="number" min="1" max="60" step="1" value="${Math.max(1, +g.minLevel || 1)}" inputmode="numeric"><button type="submit" class="gl-btn ghost">Сохранить</button></form><p class="gl-note gl-sm">1 - без ограничения. Приглашённых по нику условие не касается.</p></section>`);
		if (can(r, "profile")) {
			const embs = (window.LGEmblems && window.LGEmblems.list) || [];
			out.push(`<section><h3>${lead ? "Описание и герб" : "Описание"}</h3><form data-form="profile" class="gl-col">
        <label>Описание <textarea name="descr" maxlength="300" rows="3">${esc(g.descr || "")}</textarea></label>
        ${!lead ? '<p class="gl-note gl-sm">Герб гильдии меняет только глава.</p>' : embs.length ? `<fieldset class="gl-embs"><legend>Герб</legend>${embs.map((e) => `<label class="gl-embp" title="${esc(e.name)}"><input type="radio" name="emblem" value="${esc(e.id)}"${(g.emblem || "e1") === e.id ? " checked" : ""}><span>${emb(e.id, 44)}</span><small>${esc(e.name)}</small></label>`).join("")}</fieldset>` : ""}
        <button type="submit" class="gl-btn">Сохранить</button><p class="gl-note gl-sm">Бесплатно, в любой момент.</p></form></section>`);
		}
		if (lead && can(r, "rename")) {
			const wait = g.renameAt && +g.renameAt > Date.now();

			out.push(
				`<section><h3>Название и тег</h3>${g.notice ? `<p class="gl-warn gl-ntc">Модератор: название гильдии нарушает правила. Смени название до ${esc(dt(g.notice))} - бесплатно и без ожидания, иначе оно будет заменено случайным.</p>` : ""}${g.needTag ? '<p class="gl-warn">Нужен тег из 3 латинских букв - первый раз бесплатно.</p>' : ""}` +
					(wait
						? `<p class="gl-note">Сменить можно ${esc(left(g.renameAt))} (раз в 7 дней).</p>`
						: "") +
					`<form data-form="rename" class="gl-col"><label>Название <input name="name" minlength="3" maxlength="24" value="${esc(g.name)}" autocomplete="off"></label>
        <label>Тег <input name="tag" minlength="3" maxlength="3" pattern="[A-Za-z]{3}" value="${esc(g.tag || "")}" autocomplete="off" class="gl-tagin"></label>
        <button type="submit" class="gl-btn"${wait ? " disabled" : ""}>Сменить${g.renameCost ? ` за ${esc(silver(g.renameCost))}` : " бесплатно"}</button>
        <p class="gl-note gl-sm">Раз в 7 дней. Деньги - с кошелька твоего героя на этом канале.</p></form></section>`,
			);
		}
		if (lead && can(r, "move")) {
			const mv = g.movedAt ? g.movedAt + 7 * 864e5 - Date.now() : 0;
			out.push(
				`<section><h3>Сменить альянс</h3><p class="gl-note">Гильдия переходит к другому стримеру этого сезона - раз в неделю и не во время боя. Каждый участник сам решит: переехать или выйти.</p>` +
					(mv > 0
						? `<p class="gl-warn">Следующая смена - не раньше ${esc(dt(g.movedAt + 7 * 864e5))}.</p>`
						: "") +
					'<form class="gl-row" data-form="move"><input name="to" placeholder="Ник канала нового альянса" aria-label="Канал нового альянса" autocomplete="off" required maxlength="26"><button type="submit" class="gl-btn">Сменить</button></form></section>',
			);
		}
		const alone = g.count <= 1;

		if (lead && +r.awayDays > 0)
			out.push(
				`<section class="gl-away"><h3>Если глава пропал</h3><p class="gl-note">Глава не заходит в игру ${Math.round(+r.awayDays)} дн. подряд - главой становится случайный участник из руководства, а прежний глава переходит в руководство. Если в руководстве некому - главой становится случайный из доверенных лиц. Нет и таких - всё остаётся как есть. Запись об этом появится в журнале.</p></section>`,
			);
		if (lead && can(r, "disband"))
			out.push(`<section><h3>Распустить гильдию</h3><p class="gl-note">Гильдия удаляется полностью: уровень и опыт гильдии пропадут. Все участники выйдут, города альянса гильдия потеряет. Деньги за создание не вернутся; новую гильдию можно будет создать через 24 ч.</p>
      <form class="gl-row" data-form="disband"><input name="name" placeholder="Впиши название: ${esc(g.name)}" aria-label="Название гильдии для подтверждения" autocomplete="off" required><button type="submit" class="gl-btn bad">Распустить</button></form></section>`);
		if (!lead || alone)
			out.push(
				`<section><h3>Выйти из гильдии</h3><p class="gl-note">Вступить в другую гильдию этого канала можно будет через 30 минут.</p><button type="button" class="gl-btn bad" data-op="leave" data-confirm="${lead ? "Ты последний в гильдии - она будет распущена. Выйти?" : "Выйти из гильдии?"}">Выйти</button></section>`,
			);
		else
			out.push(
				'<section><h3>Выйти из гильдии</h3><p class="gl-note">Глава уходит последним: сначала передай главу во вкладке «Состав» или распусти гильдию.</p></section>',
			);
		return out.join("");
	}

	async function war() {
		const [b, e, h] = await Promise.all([
			api.war("board"),
			api.war("entry"),
			api.war("results", { limit: 10 }),
		]);
		const pane = subPane("war", "war");
		if (!pane) return;
		if (!b || !b.ok) {
			pane.innerHTML = `<p class="gl-note">${esc(b && b.closed ? "Мини-сражения гильдий пока открыты только тестерам" + ((window.LGSiteUi && window.LGSiteUi.closedCode && window.LGSiteUi.closedCode(b)) || "") + "." : b && b.unavailable ? "Мини-сражений нет в этом сезоне." : (b && b.error) || "не вышло")}</p>`;
			return;
		}
		const out = [];
		const cl = b.closed;
		out.push(
			`<p class="gl-meta"><span>Сражение: ${esc(dt(b.battleAt))}</span><span>${cl ? "запись закрыта - новая доска завтра" : `запись до ${esc(tm(b.closeAt))}`}</span></p>`,
		);

		if (e && e.ok && e.entry) {
			const x = e.entry;
			out.push(
				`<section class="gl-task"><h3>${KIND[x.kind] || "📜"} Задание гильдии: ${esc(x.title)}${x.name ? `: ${esc(x.name)}` : ""}</h3><p>${x.place ? esc(x.place) + " · " : ""}бой ${esc(dt(x.battleAt))} · записалось ${e.count} из минимума ${e.min}${e.signed ? " · <b>ты записан</b>" : ""}</p>` +
					(e.signups.length
						? `<ul class="gl-sg">${e.signups.map((s) => `<li>${esc(s.name || s.login)}${s.level ? ` <small>ур. ${s.level}</small>` : ""}</li>`).join("")}</ul>`
						: "") +
					`<div class="gl-btns">${e.canSign ? '<button type="button" class="gl-btn" data-war="sign">Записаться</button>' : ""}${e.signed && Date.now() < (+x.closeAt || 0) ? '<button type="button" class="gl-btn ghost" data-war="unsign">Выписаться</button>' : ""}${e.canDrop ? '<button type="button" class="gl-btn bad" data-war="drop" data-confirm="Отказаться от задания? Записавшиеся будут сняты.">Отказаться от задания</button>' : ""}</div></section>`,
			);
		}
		const lead = b.guild && b.guild.canTake;
		out.push(
			`<h3>Доска заданий наёмников</h3><p class="gl-note gl-sm">Задания обновляются раз в день; берёт глава или помощник. В гильдии нужно не меньше ${b.rules.min} участников, бойцы - от ${b.rules.minLevel} уровня и в гильдии не меньше ${b.rules.joinHours} ч. Опыта меньше, чем на эфире.</p>`,
		);
		out.push(
			`<ul class="gl-board">${b.contracts
				.map(
					(k) =>
						`<li class="${k.mine ? "mine" : ""}"><b>${KIND[k.kind] || "📜"} ${esc(k.title)}: ${esc(k.name)}</b><small>${esc(k.place || "")}</small>${k.desc ? `<p>${esc(k.desc)}</p>` : ""}` +
						`<p class="gl-sm">Соперник: ${k.enemy === "guild" ? "гильдия - кто возьмёт" : "отряд НИП"} · победа: ${k.win.xp} опыта, ${esc(money(k.win.coins))}, +${k.win.gxp} гильдии · поражение: ${k.lose.xp} опыта, ${esc(money(k.lose.coins))}</p>` +
						`<p class="gl-sm">Взяли гильдий: ${k.taken}${k.mine ? " · <b>задание гильдии</b>" : ""}</p>${lead && !cl ? `<button type="button" class="gl-btn" data-war="take" data-cid="${esc(k.cid)}">Взять задание</button>` : ""}</li>`,
				)
				.join("")}</ul>`,
		);
		if (h && h.ok && h.results.length) {
			out.push(
				`<h3>Сражения гильдии</h3><ul class="gl-mem">${h.results.map((x) => `<li><span class="gl-mn"><b>${OUT[x.outcome] || esc(x.status)}</b><span>${esc(x.title)}${x.name ? `: ${esc(x.name)}` : ""}</span><small>${esc(dt(x.battleAt))}${x.opp ? ` · против: ${esc(x.opp.name)}` : ""}${x.reason ? ` · ${esc(x.reason)}` : ""}${x.gxp ? ` · опыт гильдии +${x.gxp}` : ""}${x.my ? ` · тебе: ${x.my.xp} опыта, ${esc(money(x.my.coins))}` : ""}</small></span>${x.outcome && x.outcome !== "failed" ? `<span class="gl-ma"><button type="button" class="gl-mini" data-res="${esc(x.id)}">Итог</button></span>` : ""}</li>`).join("")}</ul>`,
			);
		}
		pane.innerHTML = out.join("");
	}
	async function result(id) {
		const pane = subPane("war", "war");
		if (!pane) return;
		pane.innerHTML = '<p class="gl-note">Открываю итог…</p>';
		const r = await api.war("result", { id });
		if (!W || !pane.isConnected) return;
		if (!r || !r.ok) {
			pane.innerHTML = `<p class="gl-note">${esc((r && r.error) || "не вышло")}</p><button type="button" class="gl-btn ghost" data-seg="war">← К заданиям</button>`;
			return;
		}
		const x = r.result,
			tr = x.track || [],
			frac = (v) => (Math.max(0, Math.min(100, +v || 0)) / 100).toFixed(3);

		const bars = tr.length
			? `<div class="gl-track">${tr.map((t) => `<div class="gl-rd"><small>${t[0]}</small><i style="--w:${frac(t[1])}"></i><i class="foe" style="--w:${frac(t[2])}"></i></div>`).join("")}</div>`
			: "";
		pane.innerHTML =
			`<button type="button" class="gl-btn ghost gl-sm" data-seg="war">← К заданиям</button><h3>${OUT[x.outcome] || esc(x.status)}: ${esc(x.title)}${x.name ? `: ${esc(x.name)}` : ""}</h3>` +
			`<p class="gl-meta"><span>${esc(dt(x.battleAt))}</span><span>раундов: ${x.rounds}</span><span>гильдия: ${x.count} бойцов, сила ${x.hp ?? "-"}%</span><span>соперник${x.opp ? ` «${esc(x.opp.name)}»` : ""}: ${x.enemies ?? "-"}, сила ${x.enemyHp ?? "-"}%</span></p>` +
			(bars
				? `<p class="gl-note gl-sm">Сила по раундам: гильдия - сверху, соперник - снизу.</p>${bars}`
				: "") +
			`<table class="gl-tbl"><thead><tr><th>Боец</th><th>Урон</th><th></th><th>Опыт</th><th>Бронза</th></tr></thead><tbody>${(x.heroes || []).map((h) => `<tr><td>${esc(h.name || h.login)}</td><td>${h.dealt}</td><td>${h.fell ? "пал" : "устоял"}</td><td>${h.xp}</td><td>${h.coins}</td></tr>`).join("")}</tbody></table>`;
	}

	const OK = {
		create: "Гильдия создана - ты её глава",
		join: "Ты вступил в гильдию",
		apply: "Заявка подана",
		cancel: "Заявка отозвана",
		accept: "Игрок принят",
		decline: "Заявка отклонена",
		refuse: "Приглашение отклонено",
		gmute: "Участник не сможет писать в чат гильдии",
		gunmute: "Участник снова может писать в чат гильдии",
		invite: "Приглашение отправлено",
		leave: "Ты вышел из гильдии",
		kick: "Игрок исключён",
		role: "Роль изменена",
		powers: "Полномочия сохранены",
		transfer: "Глава передана",
		setOpen: "Готово",
		rename: "Название и тег изменены",
		profile: "Сохранено",
		disband: "Гильдия распущена",
		move: "Гильдия сменила альянс - участники решат, переехать ли с ней",
		moveStay: "Ты переезжаешь вместе с гильдией",
		moveLeave: "Ты вышел из гильдии",
	};
	const WOK = {
		take: "Задание взято",
		drop: "Задание снято",
		sign: "Ты записан на бой",
		unsign: "Ты выписан",
	};

	const SETTLE_MS = 1000;
	const AQ = {
		jobs: [],
		keys: new Set(),
		on: false,
		cur: null,
		t: 0,
		settling: false,
		dirty: false,
		last: 0,
		n: 0,
	};
	const qBusy = () => !!(AQ.on || AQ.jobs.length || AQ.t || AQ.settling);
	function busyMark() {
		if (!W) return;
		if (qBusy() || W.busyN > 0) W.el.dataset.busy = "1";
		else delete W.el.dataset.busy;
	}

	const busyOn = (on) => {
		if (W) {
			W.busyN = Math.max(0, (W.busyN || 0) + (on ? 1 : -1));
			busyMark();
		}
	};

	function enqueue(job) {
		const keys = job.keys || [];
		if (keys.some((k) => AQ.keys.has(k))) return Promise.resolve(null);
		for (const k of keys) AQ.keys.add(k);
		clearTimeout(AQ.t);
		AQ.t = 0;
		return new Promise((done) => {
			job.done = done;
			AQ.jobs.push(job);
			try {
				if (job.mark) job.mark();
			} catch (e) {
				console.warn("[гильдии] очередь: строка", e);
			}
			busyMark();
			void pump();
		});
	}
	async function pump() {
		if (AQ.on) return;
		AQ.on = true;
		try {
			while (AQ.jobs.length) {
				const j = AQ.jobs.shift();
				AQ.cur = j;
				try {
					if (j.start) j.start();
				} catch (e) {
					console.warn("[гильдии] очередь: строка", e);
				}
				const t0 = Date.now();
				let r;
				try {
					r = await (j.send ? j.send() : api.act(j.b));
				} catch (e) {
					r = NET;
				}
				AQ.last = Date.now() - t0;
				AQ.n++;
				try {
					if (r && r.ok) {
						if (j.ok) await j.ok(r);
					} else if (j.bad) await j.bad(r);
					else toast(errText(r), true);
				} catch (e) {
					console.warn("[гильдии] очередь: ответ", e);
				}
				for (const k of j.keys || []) AQ.keys.delete(k);
				AQ.cur = null;
				j.done(r);
			}
		} finally {
			AQ.on = false;
			AQ.cur = null;
		}
		if (AQ.dirty && W) AQ.t = setTimeout(settle, SETTLE_MS);
		busyMark();
	}

	async function settle() {
		AQ.t = 0;
		if (!W || !W.guild || AQ.on || AQ.jobs.length) {
			busyMark();
			return;
		}
		if (typing()) {
			AQ.t = setTimeout(settle, SETTLE_MS);
			return;
		}
		AQ.dirty = false;
		AQ.settling = true;
		const gid = String(W.guild.guild.id);
		try {
			const g = await api.guild(gid);
			if (W && W.guild && String(W.guild.guild.id) === gid && g && g.ok) {
				if (AQ.on || AQ.jobs.length || typing()) {
					W.guild = g;
					AQ.dirty = true;
				} else {
					W.guild = g;
					paintGuild();
				}
				badgeFrom(g);
			}
		} catch (e) {
			console.warn("[гильдии] окно: перечитать", e);
		} finally {
			AQ.settling = false;
			if (AQ.dirty && !AQ.on && !AQ.jobs.length && W)
				AQ.t = setTimeout(settle, SETTLE_MS);
			busyMark();
		}
	}

	function reMark() {
		for (const j of AQ.jobs) {
			try {
				if (j.mark) j.mark();
			} catch (e) {
				console.warn("[гильдии] очередь: строка", e);
			}
		}
		if (AQ.cur) {
			try {
				if (AQ.cur.mark) AQ.cur.mark();
				if (AQ.cur.start) AQ.cur.start();
			} catch (e) {
				console.warn("[гильдии] очередь: строка", e);
			}
		}
	}

	function errText(r) {
		const e = (r && r.error) || "не вышло";
		if (/нет мест/.test(e) && W && W.guild)
			return `гильдия полна ${W.guild.guild.count}/${W.guild.guild.limit || 90}`;
		return (
			e +
			(r && r.rejoinAt
				? ` - можно ${left(r.rejoinAt)}`
				: r && r.renameAt
					? ` - можно ${left(r.renameAt)}`
					: r && r.createAt
						? ` - можно ${left(r.createAt)}`
						: "")
		);
	}
	const sameG = (gid) =>
		!!(W && W.guild && String(W.guild.guild.id) === String(gid));
	const reqRow = (tid) =>
		W ? W.body.querySelector(`li[data-req="${esc(tid)}"]`) : null;
	const memRow = (tid) =>
		W ? W.body.querySelector(`li[data-mtid="${esc(tid)}"]`) : null;

	function rowSt(li, st, text) {
		if (!li) return;
		li.classList.toggle("gl-pend", st === "wait");
		li.classList.toggle("gl-done", st === "done");
		li.classList.toggle("gl-rerr", st === "err");
		if (st) li.dataset.st = st;
		else delete li.dataset.st;
		li.setAttribute("aria-busy", String(st === "wait"));
		li.querySelectorAll("button").forEach((b) => {
			b.disabled = st === "wait" || st === "done";
		});
		const s0 = li.querySelector(".gl-st");
		if (s0) s0.textContent = text || "";
	}

	function paintCounts() {
		if (!W || !W.guild) return;
		const r = W.guild,
			n = reqN(r),
			g = r.guild;
		const badge = (el) => {
			if (!el) return;
			let b = el.querySelector(".gl-badge");
			if (!n) {
				if (b) b.remove();
				return;
			}
			if (!b) {
				b = document.createElement("b");
				b.className = "gl-badge";
				el.appendChild(document.createTextNode(" "));
				el.appendChild(b);
			}
			b.textContent = String(n);
			b.setAttribute("aria-label", `заявок: ${n}`);
		};
		badge(W.body.querySelector(".gl-tabs [data-tab=mem]"));
		badge(W.body.querySelector("[data-memsub=req]"));
		const ls = W.body.querySelector("[data-memsub=list]");
		if (ls) ls.textContent = `Участники ${g.count}`;
		W.body.querySelectorAll("[data-cnt=count]").forEach((b) => {
			b.textContent = `${g.count} / ${g.limit}`;
		});
		badgeFrom(r);
	}

	function badgeFrom(g) {
		if (!g || !g.me || !g.me.can || !g.me.can.accept || !g.requests) return;
		const n = g.requests.filter((x) => x.kind === "apply").length + giftN();
		if (n !== BADGE) {
			BADGE = n;
			try {
				window.dispatchEvent(new CustomEvent("lgguilds", { detail: { n } }));
			} catch (e) {
				console.warn("[гильдии] счётчик", e);
			}
		}
	}

	function patchReq(tid, op) {
		const r = W.guild,
			list = r.requests || [];
		const i = list.findIndex(
				(x) => x.kind === "apply" && String(x.tid) === String(tid),
			),
			x = i >= 0 ? list.splice(i, 1)[0] : null;
		if (
			op === "accept" &&
			!r.members.some((m) => String(m.tid) === String(tid))
		) {
			r.members.push({
				guild: r.guild.id,
				tid: String(tid),
				role: "novice",
				joinedAt: Date.now(),
				login: x ? x.login : null,
				name: x ? x.name || x.login : null,
			});
			r.guild.count = (+r.guild.count || 0) + 1;
		}
	}

	function reqJob(op, tid) {
		if (!W || !W.guild) return Promise.resolve(null);
		const gid = String(W.guild.guild.id),
			acc = op === "accept";
		return enqueue({
			keys: ["req:" + tid],
			b: { op, guild: gid, who: String(tid) },
			mark: () => rowSt(reqRow(tid), "wait", "в очереди…"),
			start: () => rowSt(reqRow(tid), "wait", acc ? "принимаю…" : "отклоняю…"),
			ok: (r) => {
				AQ.dirty = true;
				if (!sameG(gid)) return;
				patchReq(tid, op);
				rowSt(
					reqRow(tid),
					"done",
					acc ? (r.already ? "уже принят" : "принят") : "заявка отклонена",
				);
				paintCounts();
			},
			bad: (r) => {
				AQ.dirty = true;
				if (sameG(gid)) rowSt(reqRow(tid), "err", errText(r));
			},
		});
	}

	async function allJob(kind) {
		if (!W || !W.guild) return;
		const r = W.guild,
			gid = String(r.guild.id),
			acc = kind === "accept";
		const tids = (r.requests || [])
			.filter((x) => x.kind === "apply" && !AQ.keys.has("req:" + x.tid))
			.map((x) => String(x.tid))
			.filter((t) => {
				const li = reqRow(t);
				return !li || li.dataset.st !== "done";
			});
		if (!tids.length || AQ.keys.has("all")) return;
		const free = Math.max(0, (+r.guild.limit || 90) - (+r.guild.count || 0)),
			n = tids.length;
		const ok = await sure(
			acc
				? {
						title: "Точно принять всех?",
						text: `Заявок: ${n}. Свободных мест: ${free}${n > free ? ` - примем первых ${free}, остальные останутся в заявках` : ""}.`,
						btn: "Принять всех",
						wait: 0,
						good: true,
					}
				: {
						title: "Точно отклонить все заявки?",
						text: `Заявок: ${n}. Все будут отклонены.`,
						btn: "Отклонить всех",
						wait: 0,
					},
		);
		if (!ok || !sameG(gid)) return;
		const allBtns = (on) =>
			W &&
			W.body.querySelectorAll("[data-all]").forEach((b) => {
				b.disabled = on;
			});
		return enqueue({
			keys: ["all", ...tids.map((t) => "req:" + t)],
			b: { op: acc ? "acceptAll" : "declineAll", guild: gid, whos: tids },
			mark: () => {
				allBtns(true);
				for (const t of tids) rowSt(reqRow(t), "wait", "в очереди…");
			},
			start: () => {
				for (const t of tids)
					rowSt(reqRow(t), "wait", acc ? "принимаю…" : "отклоняю…");
			},
			ok: (x) => {
				AQ.dirty = true;
				allBtns(false);
				if (!sameG(gid)) return;
				const done = acc ? x.accepted || [] : x.declined || [],
					sk = acc ? x.skipped || [] : [];
				for (const t of done) {
					patchReq(t, kind);
					rowSt(reqRow(t), "done", acc ? "принят" : "заявка отклонена");
				}
				if (acc && x.count != null) W.guild.guild.count = +x.count;
				for (const s0 of sk)
					rowSt(
						reqRow(s0.who),
						"err",
						/нет мест/.test(s0.error || "")
							? `нет мест: ${W.guild.guild.count}/${W.guild.guild.limit || 90}`
							: s0.error,
					);
				for (const t of tids)
					if (!done.includes(t) && !sk.some((s0) => String(s0.who) === t))
						rowSt(reqRow(t), "", "");
				paintCounts();
				toast(
					acc
						? `Принято: ${done.length}${sk.length ? ` - осталось ${sk.length}${x.full ? ", мест нет" : ""}` : ""}`
						: `Отклонено: ${done.length}`,
					acc && sk.length > 0,
				);
			},
			bad: (x) => {
				AQ.dirty = true;
				allBtns(false);
				if (!sameG(gid)) return;
				for (const t of tids) rowSt(reqRow(t), "err", errText(x));
				toast(errText(x), true);
			},
		});
	}
	const MEM_DO = {
		role: "меняю роль…",
		kick: "исключаю…",
		gmute: "запрещаю чат…",
		gunmute: "разрешаю чат…",
	};

	function memJob(b) {
		if (!W || !W.guild) return Promise.resolve(null);
		const gid = String(W.guild.guild.id),
			tid = String(b.who);
		return enqueue({
			keys: ["mem:" + tid],
			b,
			mark: () => rowSt(memRow(tid), "wait", "в очереди…"),
			start: () => rowSt(memRow(tid), "wait", MEM_DO[b.op] || "…"),
			ok: (r) => {
				AQ.dirty = true;
				if (!sameG(gid)) return;
				const G0 = W.guild,
					m = G0.members.find((x) => String(x.tid) === tid);
				let t = OK[b.op] || "готово";
				if (b.op === "role" && m) {
					m.role = b.role;
					t = `теперь: ${ROLE[b.role] || b.role}`;
				} else if (b.op === "kick") {
					G0.members = G0.members.filter((x) => String(x.tid) !== tid);
					G0.guild.count = Math.max(0, (+G0.guild.count || 1) - 1);
					t = "исключён";
				} else if (b.op === "gmute" && m) {
					m.mutedUntil = r.until || Date.now() + (b.min || 0) * 60e3;
					if (b.reason) m.mutedWhy = b.reason;
					t = "не пишет в чат гильдии";
				} else if (b.op === "gunmute" && m) {
					delete m.mutedUntil;
					delete m.mutedWhy;
					t = "снова пишет в чат";
				}
				rowSt(memRow(tid), "done", t);
				paintCounts();
			},
			bad: (r) => {
				AQ.dirty = true;
				if (sameG(gid)) rowSt(memRow(tid), "err", errText(r));
				toast(errText(r), true);
			},
		});
	}

	function act(b, btn) {
		return enqueue({
			keys: ["act:" + b.op + ":" + (b.who || b.guild || "")],
			b,
			mark: () => {
				if (btn) btn.disabled = true;
			},
			ok: async (r) => {
				if (btn) btn.disabled = false;
				toast(r.dissolved ? "Гильдия распущена" : OK[b.op] || "Готово");
				IDX = null;
				await after(b.op);
			},
			bad: (r) => {
				if (btn) btn.disabled = false;
				toast(errText(r), true);
			},
		});
	}
	async function after(op) {
		LAST = null;
		MEMO.clear();

		const r = await index(true, !!(W && W.guild && W.guild.me));
		if (!W) return;
		if (!r || !r.ok) {
			W.body.innerHTML = `<h2 id="glTitle">Гильдии</h2><p class="gl-note">${esc(closedText(r))}</p>`;
			return;
		}
		W.data = r;
		const m = r.mine && r.mine.member;
		if (m && ["create", "join"].includes(op)) {
			W.tab = "main";
			await showGuild(m.guild);
			return;
		}
		if (m && W.guild && String(W.guild.guild.id) === String(m.guild)) {
			await showGuild(m.guild, true);
			return;
		}
		await pickFull();
		badgeSoon();
	}

	function heroAct(d, btn) {
		if (!W) return;
		const k = d.hero;
		if (k === "raid") {
			raidLoad()
				.then(() => {
					if (W) W.close();
					window.LGGuildRaid.open();
				})
				.catch(() => toast("Рейд не загрузился - попробуй ещё раз"));
			return;
		}
		if (k === "cm" && d.hmine) {
			openWin("gather");
			return;
		}
		if (k === "run" && d.joined) {
			runLoad()
				.then(() => window.LGGuildRun.open())
				.catch(() => toast("Вылазка не загрузилась - попробуй ещё раз"));
			return;
		}
		void enqueue({
			keys: ["hero:" + k],
			send: () =>
				k === "war"
					? api.warAct({ op: "sign" })
					: k === "cm"
						? xpost("/api/citymon/act", { op: "ejoin", id: d.id })
						: xpost("/api/guildrun/act", { op: "join" }),
			mark: () => {
				btn.disabled = true;
			},
			bad: (r) => {
				toast((r && r.error) || "не вышло", true);
				if (btn.isConnected) btn.disabled = false;
			},
			ok: async () => {
				toast(
					k === "war"
						? WOK.sign
						: k === "cm"
							? "Ты в сборе группы"
							: "Ты в отряде вылазки",
				);
				if (k === "run")
					runLoad()
						.then(() => window.LGGuildRun.open())
						.catch(() => toast("Вылазка не загрузилась - попробуй ещё раз"));
				if (W && W.sumP) await W.sumP;
				await summary(true);
			},
		});
	}

	function warClick(t, d) {
		if (!W) return;
		void enqueue({
			keys: ["war:" + d.war + ":" + (d.cid || "")],
			send: () => api.warAct({ op: d.war, ...(d.cid ? { cid: d.cid } : {}) }),
			mark: () => {
				t.disabled = true;
			},
			bad: (r) => {
				t.disabled = false;
				toast((r && r.error) || "не вышло", true);
			},
			ok: async (r) => {
				t.disabled = false;
				toast(
					d.war === "take" && r.signError
						? `Задание взято, но записаться не вышло: ${r.signError}`
						: WOK[d.war] || "Готово",
					d.war === "take" && !!r.signError,
				);
				if (subPane("war", "war")) await war();
				void summary(true);
			},
		});
	}
	function onClick(e) {
		const hh =
			e.target && e.target.closest ? e.target.closest("[data-hero]") : null;
		if (
			hh &&
			W &&
			!e.target.closest("button") &&
			!W.el.querySelector(".gl-menu")
		) {
			heroWin(hh.dataset.hero);
			return;
		}
		const t = e.target && e.target.closest ? e.target.closest("button") : null;
		if (!t || !W || t.disabled) return;
		const d = t.dataset;
		if (d.confirm && !d.sure) {
			askG({
				title: d.confirm,
				yes: t.textContent.trim(),
				danger: t.classList.contains("bad"),
			}).then((ok) => {
				if (ok && t.isConnected) {
					d.sure = "1";
					t.click();
					delete d.sure;
				}
			});
			return;
		}
		if (d.tab) {
			W.tab = d.tab;
			W.body
				.querySelectorAll(".gl-tabs [data-tab]")
				.forEach((x) =>
					x.setAttribute("aria-selected", String(x.dataset.tab === W.tab)),
				);
			const tb = W.body.querySelector('.gl-tabs [aria-selected="true"]');
			if (tb && tb.scrollIntoView && !t.closest(".gl-tabs"))
				try {
					tb.scrollIntoView({ block: "nearest", inline: "nearest" });
				} catch (x) {}
			paintTab();
			return;
		}
		if (d.memsub) {
			W.memSub = d.memsub;
			paintTab();
			return;
		}
		if (d.ann) {
			W.annEdit = d.ann === "edit";
			W.annDraft = null;
			paintTab();
			if (W.annEdit) {
				const ta = W.body.querySelector("[data-form=ann] textarea");
				if (ta)
					try {
						ta.focus();
					} catch (x) {}
			}
			return;
		}
		if (d.see) {
			W.tab = "mem";
			W.modChat = null;
			showGuild(d.see);
			return;
		}
		if (d.back) {
			void pickFull();
			return;
		}
		if (d.gmback) {
			W.modF = null;
			void pickFull();
			return;
		}
		if (d.mine) {
			const m = W.data && W.data.mine && W.data.mine.member;
			if (m) {
				W.tab = "main";
				showGuild(m.guild);
			}
			return;
		}
		if (d.hall) {
			const g = d.hall;
			W.close();
			try {
				window.LGGuildHall.open(g);
			} catch (x) {}
			return;
		}
		if (d.res) {
			result(d.res);
			return;
		}
		if (d.gm) {
			gmClick(d, t);
			return;
		}
		if (d.more) {
			const rr = t.getBoundingClientRect();
			memMenu(d.more, rr.left, rr.bottom, t);
			return;
		}
		if (d.go === "daily") {
			openWin("tasks");
			return;
		}
		if (d.hero) {
			void heroAct(d, t);
			return;
		}
		if (d.run) {
			void runBoxAct(t);
			return;
		}
		if (d.win) {
			openWin(d.win);
			return;
		}
		if (d.go === "raid") {
			raidLoad()
				.then(() => {
					W.close();
					window.LGGuildRaid.open();
				})
				.catch(() => toast("Рейд не загрузился - попробуй ещё раз"));
			return;
		}
		if (d.go === "gift") {
			if (giftOn()) {
				W.close();
				window.LGDailies.gift();
			} else
				toast("Подарок - скоро: награды всей гильдии за активность участников");
			return;
		}

		if (d.war) {
			warClick(t, d);
			return;
		}
		if (d.all) {
			void allJob(d.all);
			return;
		}
		if ((d.op === "accept" || d.op === "decline") && d.who) {
			void reqJob(d.op, d.who);
			return;
		}
		if (d.op) {
			const b = { op: d.op };
			const gid = d.g || (W.guild && W.guild.guild.id);
			if (
				gid &&
				![
					"leave",
					"moveStay",
					"moveLeave",
					"role",
					"powers",
					"transfer",
					"setOpen",
					"kick",
					"rename",
					"profile",
					"disband",
				].includes(d.op)
			)
				b.guild = String(gid);
			if (d.op === "accept" || d.op === "decline" || d.op === "invite")
				b.guild = String(W.guild.guild.id);
			if (d.who) b.who = d.who;
			if (d.role) b.role = d.role;
			if (d.open != null) b.open = d.open === "1";
			act(b, t);
		}
	}
	function onSubmit(e) {
		const f = e.target;
		if (!f || !f.dataset || !f.dataset.form || !W) return;
		e.preventDefault();
		const k = f.dataset.form,
			fd = new FormData(f),
			btn = f.querySelector("[type=submit]");
		if (k === "create") {
			W.newOpen = true;
			const descr = String(fd.get("descr") || "").trim(),
				emblem = String(fd.get("emblem") || "");

			const nm = String(fd.get("name") || "").trim(),
				tg = String(fd.get("tag") || "").trim(),
				C = (W.data && W.data.mine && W.data.mine.create) || {};
			askG({
				title: `Создать гильдию «${nm}»${tg ? ` [${tg}]` : ""}${C.cost ? ` за ${silver(C.cost)}` : ""}?`,
				text: "Плата за создание не возвращается, даже если гильдию распустить.",
				yes: "Создать",
				no: "Отмена",
			}).then((ok) => {
				if (ok && W && btn.isConnected)
					act(
						{
							op: "create",
							name: nm,
							tag: tg,
							open: !!fd.get("open"),
							...(descr ? { descr } : {}),
							...(emblem ? { emblem } : {}),
						},
						btn,
					);
			});
		} else if (k === "minlvl")
			act(
				{
					op: "setMinLevel",
					level: Math.max(1, Math.floor(+fd.get("level") || 1)),
				},
				btn,
			);
		else if (k === "runplan") {
			const at = new Date(`${fd.get("d")}T${fd.get("t")}`).getTime();
			if (!Number.isFinite(at)) {
				toast("Укажи дату и время", true);
				return;
			}
			void runBoxAct(null, { op: "plan", at });
		} else if (k === "ann") {
			const descr = String(fd.get("descr") || "").trim();
			act({ op: "profile", descr }, btn).then((r) => {
				if (r && r.ok && W) {
					W.annEdit = false;
					W.annDraft = null;
					if (W.tab === "main") paintTab();
				}
			});
		} else if (k === "profile")
			act(
				{
					op: "profile",
					descr: String(fd.get("descr") || "").trim(),
					...(fd.get("emblem") ? { emblem: String(fd.get("emblem")) } : {}),
				},
				btn,
			);
		else if (k === "rename") {
			const g = W.guild.guild,
				name = String(fd.get("name") || "").trim(),
				tag = String(fd.get("tag") || "").trim(),
				b = { op: "rename" };
			if (name && name !== g.name) b.name = name;
			if (tag && tag !== g.tag) b.tag = tag;
			if (!b.name && !b.tag) {
				toast("Название и тег не изменились", true);
				return;
			}
			askG({
				title: `Сменить ${b.name && b.tag ? "название и тег" : b.name ? "название" : "тег"}${g.renameCost ? ` за ${silver(g.renameCost)}` : ""}?`,
				text: "Следующая смена - через 7 дней.",
				yes: "Сменить",
			}).then((ok) => {
				if (ok) act(b, btn);
			});
		} else if (k === "disband") {
			const name = String(fd.get("name") || "").trim();
			if (name !== W.guild.guild.name) {
				toast("Впиши название гильдии точно", true);
				return;
			}
			askG({
				title: `Распустить гильдию «${name}»?`,
				text: "Это нельзя отменить.",
				yes: "Распустить",
				danger: true,
			}).then((ok) => {
				if (ok) act({ op: "disband", name }, btn);
			});
		} else if (k === "invite")
			act(
				{
					op: "invite",
					guild: String(W.guild.guild.id),
					login: String(fd.get("login") || "")
						.trim()
						.replace(/^@/, ""),
				},
				btn,
			).then((r) => {
				if (r && r.ok) f.reset();
			});
		else if (k === "powers")
			act({ op: "powers", can: fd.getAll("can").map(String) }, btn);
		else if (k === "move") {
			const to = String(fd.get("to") || "")
				.trim()
				.replace(/^@/, "");
			if (!to) return;
			askG({
				title: `Перевести гильдию в альянс канала ${to}?`,
				text: "Сменить альянс снова можно будет только через неделю.",
				yes: "Перевести",
			}).then((ok) => {
				if (ok) act({ op: "move", to }, btn);
			});
		}
	}

	const giftOn = () =>
		!!(
			window.LGDailies &&
			typeof window.LGDailies.gift === "function" &&
			window.LGDailies.giftOn &&
			window.LGDailies.giftOn()
		);
	const giftN = () =>
		window.LGDailies && window.LGDailies.giftCount
			? +window.LGDailies.giftCount() || 0
			: 0;

	let BADGE = PRE ? +PRE.BADGE || 0 : 0,
		badgeT = 0,
		badgeAt = PRE ? +PRE.badgeAt || 0 : 0;
	async function badgeNow() {
		badgeAt = Date.now();
		let n = 0;

		const b = await api.badge();
		const old =
			!(b && b.ok) &&
			b &&
			/маршрут с сайта не вызывается|нет такого метода|нет такого/.test(
				String(b.error || ""),
			);
		if (b && b.ok) {
			n = Math.max(0, +b.n || 0) + (b.member ? giftN() : 0);
			void index(false, true).catch(() => null);
			if (window.LGGuildGather) window.LGGuildGather(b.gather);
			if (window.LGGuildAlert) window.LGGuildAlert(b.alerts);
		}
		const r = old ? await index() : null;
		if (r && r.ok) {
			const m = r.mine || {};
			if (!m.member) n = (m.invites || []).length;
			else {
				const g = await api.guild(m.member.guild);
				if (g && g.ok && g.requests && g.me && g.me.can && g.me.can.accept)
					n = g.requests.filter((x) => x.kind === "apply").length;
				n += giftN();
			}
		}
		if (n !== BADGE) {
			BADGE = n;
			try {
				window.dispatchEvent(new CustomEvent("lgguilds", { detail: { n } }));
			} catch (e) {
				console.warn("[гильдии] счётчик", e);
			}
		}
		return n;
	}
	function badgeSoon(ms) {
		clearTimeout(badgeT);
		badgeT = setTimeout(
			() => {
				badgeNow().catch((e) => console.warn("[гильдии] счётчик", e));
			},
			ms == null ? 300 : ms,
		);
	}

	function badgeTick() {
		if (
			!document.hidden &&
			document.querySelector('[data-gu="guild"]') &&
			Date.now() - badgeAt >
				(window.LGPushOn && window.LGPushOn("guildBadge") ? 300e3 : 55e3)
		)
			badgeSoon();
	}
	setInterval(badgeTick, 5e3);
	window.addEventListener("lg-snap", (e) => {
		if (
			e.detail &&
			e.detail.n === "guildBadge" &&
			document.querySelector('[data-gu="guild"]')
		)
			badgeSoon(30);
	});

	const OPEN_MS = [20e3, 30e3];
	let liveT = 0;

	const openGap = () =>
		window.LGPushOn && window.LGPushOn("guildView")
			? 300e3
			: OPEN_MS[0] + Math.round(Math.random() * (OPEN_MS[1] - OPEN_MS[0]));
	function liveSoon() {
		clearTimeout(liveT);
		liveT = setTimeout(liveTick, Math.max(openGap(), BK.wait()));
	}
	window.addEventListener("lg-snap", (e) => {
		const d = e.detail;
		if (!d || d.n !== "guildView" || !W || document.hidden) return;
		const own = W.guild && W.guild.guild ? String(W.guild.guild.id) : "";
		if (d.g && own && String(d.g) !== own) return;
		clearTimeout(liveT);
		liveT = setTimeout(liveTick, 30);
	});
	async function liveTick() {
		liveT = 0;
		if (!W) return;
		if (
			document.hidden ||
			W.layer ||
			qBusy() ||
			(document.activeElement &&
				W.el.contains(document.activeElement) &&
				/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName))
		) {
			liveSoon();
			return;
		}
		try {
			const own = W.guild && W.guild.me ? String(W.guild.guild.id) : "";
			W.liveN = (W.liveN || 0) + 1;
			const was = JSON.stringify(IDX && IDX.mine);
			const r =
				own && W.liveN % 4
					? { ok: true, mine: { member: { guild: own } }, skip: true }
					: await index(true, !!own);
			if (W && r && r.ok && !r.skip && JSON.stringify(r.mine) !== was) {
				await after("");
			} else if (
				W &&
				r &&
				r.ok &&
				W.guild &&
				r.mine &&
				r.mine.member &&
				String(r.mine.member.guild) === String(W.guild.guild.id)
			) {
				const g = await api.guild(r.mine.member.guild);
				if (W && g && g.ok && !g.me && W.guild && W.guild.me) {
					await after("");
					if (W) liveSoon();
					return;
				}
				if (
					W &&
					g &&
					g.ok &&
					W.guild &&
					JSON.stringify(g) !== JSON.stringify(W.guild) &&
					!W.layer &&
					!qBusy() &&
					!(
						document.activeElement &&
						W.el.contains(document.activeElement) &&
						/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)
					)
				) {
					W.guild = g;
					paintGuild();
				}

				if (W && W.guild && W.guild.me && W.tab === "main") await summary();
				clocks();
			}
		} catch (e) {
			console.warn("[гильдии] окно: освежить", e);
		}
		if (W) liveSoon();
	}

	window.LGGuilds = {
		pick: () => open({ view: "pick" }),

		mod: () => open({ view: "mod" }),
		open: (o) => open(o),
		close: () => {
			if (W) W.close();
		},
		gst,
		index,

		n: () => BADGE,
		refresh: () => badgeNow(),

		backoff,

		wait: () => BK.wait(),

		queue: () => ({
			n: AQ.jobs.length + (AQ.cur ? 1 : 0),
			busy: qBusy(),
			last: AQ.last,
			done: AQ.n,
		}),
		state: () =>
			W
				? {
						tab: W.tab,
						guild: W.guild ? W.guild.guild.id : null,
						pick: !!W.body.querySelector(".gl-list"),
					}
				: null,
	};
})();
