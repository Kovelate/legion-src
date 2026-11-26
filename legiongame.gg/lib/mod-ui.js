(() => {
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
	const when = (t) =>
		t
			? new Date(t).toLocaleString("ru-RU", {
					day: "2-digit",
					month: "2-digit",
					year: "2-digit",
					hour: "2-digit",
					minute: "2-digit",
				})
			: "";
	const hm = (t) =>
		t
			? new Date(t).toLocaleTimeString("ru-RU", {
					hour: "2-digit",
					minute: "2-digit",
				})
			: "";
	const day = (t) =>
		t
			? new Date(t).toLocaleDateString("ru-RU", {
					day: "2-digit",
					month: "2-digit",
					year: "numeric",
				})
			: "-";
	const age = (t) => {
		if (!t) return "неизвестно";
		const d = Math.floor((Date.now() - t) / 864e5);
		return d < 1
			? "меньше суток"
			: d < 60
				? `${d} дн.`
				: d < 730
					? `${Math.floor(d / 30)} мес.`
					: `${Math.floor(d / 365)} г.`;
	};
	const until = (t) => (t == null || t === 0 ? "бессрочно" : `до ${when(t)}`);
	const KIND = {
		ban: "бан аккаунта на канале",
		unban: "снят бан аккаунта",
		pban: "бан во всей игре",
		punban: "снят бан во всей игре",
		mute: "мут",
		unmute: "снят мут / бан чата",
		chatban: "бан чата",
		purge: "удалены сообщения",
		dmban: "закрыта личка",
		undmban: "открыта личка",
		twmodoff: "снят модератор Twitch",
		twmodon: "возвращён модератор Twitch",
	};
	const ROOM = {
		city: "Город",
		trade: "Торговля",
		mine: "Шахта",
		dm: "Личные",
	};
	const ROLE = {
		pa: "админ игры",
		owner: "стример",
		admin: "админ канала",
		mod: "модератор",
	};
	const SPAM = {
		mass: "рассылка",
		net: "сеть ботов",
		known: "известный спам",
		ad: "реклама контактов",
	};
	const XK = { trade: "обмен", fcoin: "монета дня", auction: "аукцион" };
	const ERR = {
		no_rights: "Нет доступа.",
		cabinet_closed: "Окно модерации пока открыто только каналам-тестерам.",
		login_required: "Войдите через Twitch.",
		rate_limited: "Слишком часто - подождите минуту.",
		no_channel: "Канал не найден.",
	};

	const TABS = [
		["mod", "Модерация"],
		["req", "Запросы на снятие блокировки"],
		["com", "Сообщество"],
		["log", "Журнал"],
		["sus", "Подозрительные", "pa"],
		["claw", "Изъятие", "own"],
	];
	const ICO = {
		mod: "🛡",
		req: "📨",
		com: "👥",
		log: "📜",
		sus: "🤖",
		claw: "💰",
		chat: "💬",
	};

	const STEPS = [
		{ op: "purge", t: "Удалить сообщения" },
		{ op: "mute", min: 1, t: "Мут 1 мин" },
		{ op: "mute", min: 5, t: "Мут 5 мин" },
		{ op: "mute", min: 10, t: "Мут 10 мин" },
		{ op: "mute", min: 30, t: "Мут 30 мин" },
		{ op: "mute", min: 60, t: "Мут 1 ч" },
		{ op: "mute", min: 360, t: "Мут 6 ч" },
		{ op: "mute", min: 1440, t: "Мут 24 ч" },
		{ op: "mute", min: 10080, t: "Мут 7 дней" },
		{ op: "ban", t: "Бан чата" },
	];
	const MUTES = [
		[5, "5 мин"],
		[30, "30 мин"],
		[60, "1 ч"],
		[360, "6 ч"],
		[1440, "24 ч"],
		[10080, "7 дней"],
	];
	const BAN_H = [
		[1, "1 ч"],
		[24, "24 ч"],
		[168, "7 дней"],
		[720, "30 дней"],
		[0, "навсегда"],
	];
	const WAIT_MS = 4000;
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
		let s = "";
		try {
			s = String(
				(window.MDDoodle && window.MDDoodle.active) ||
					(window.LG_STYLES && window.LG_STYLES[0]) ||
					"",
			);
		} catch (e) {
			s = "";
		}
		return GST.includes(s) ? s : "legion";
	};
	const nickColor = (l) => {
		let h = 2166136261;
		const t = String(l || "");
		for (let i = 0; i < t.length; i++) {
			h ^= t.charCodeAt(i);
			h = Math.imul(h, 16777619);
		}
		return NICK_COLORS[(h >>> 0) % NICK_COLORS.length];
	};

	const REG = {};
	function addTab(id, def) {
		REG[id] = def;
	}

	const ME = {};
	async function modc(ch, path, opt) {
		const r = await fetch(`/c/${encodeURIComponent(ch)}/api/modc${path}`, {
			credentials: "same-origin",
			...(opt || {}),
		});
		const j = await r.json().catch(() => ({}));
		if (!r.ok || j.ok === false) {
			const e = new Error(ERR[j.error] || j.error || `ошибка ${r.status}`);
			e.status = r.status;
			e.code = j.error;
			throw e;
		}
		return j;
	}

	function allowed(ctx) {
		const ch = ctx.ch;
		if (!ME[ch])
			ME[ch] = modc(ch, "/me").catch((e) => {
				if (e.status !== 403 && e.status !== 401)
					console.warn("[модерация] окно недоступно", e);
				if (e.status !== 403 && e.status !== 401) delete ME[ch];
				return null;
			});
		return ME[ch];
	}

	let toasts = null;
	function pending(ctx, m, st) {
		if (!toasts) {
			toasts = document.createElement("div");
			toasts.className = "mw-toasts gw-tok gw-dk";
			toasts.setAttribute("role", "status");
			toasts.setAttribute("aria-live", "polite");
			document.body.appendChild(toasts);
		}
		toasts.dataset.gst = gst();
		const el = document.createElement("div");
		el.className = "mw-toast" + (st.op === "ban" ? " bad" : "");
		el.innerHTML = `<span><b>${esc(st.t)}</b> · ${esc(m.n || m.l)}</span><i class="mw-tbar" style="animation-duration:${WAIT_MS}ms"></i><button type="button">Отменить</button>`;
		toasts.appendChild(el);
		let done = false;
		const t = setTimeout(async () => {
			done = true;
			el.classList.add("go");
			el.querySelector("button").remove();
			const ok = await ctx.act(st.op, {
				login: m.l,
				n: m.n || m.l,
				min: st.min,
				id: m.id,
				rm: m.rm,
				sure: true,
			});
			el.querySelector("span").insertAdjacentHTML(
				"beforeend",
				ok ? " - готово" : " - не вышло",
			);
			setTimeout(() => el.remove(), 1500);
		}, WAIT_MS);
		el.querySelector("button").onclick = () => {
			if (done) return;
			clearTimeout(t);
			el.remove();
		};
	}

	function slide(e, li, m, ctx) {
		if (e.button !== 0 || !m || !ctx.canMod(m)) return;
		e.preventDefault();
		e.stopPropagation();
		const h = e.target.closest(".mw-sl");
		if (!h) return;
		try {
			h.setPointerCapture(e.pointerId);
		} catch (x) {
			console.warn("[модерация] захват указателя", x);
		}
		const r = li.getBoundingClientRect(),
			x0 = e.clientX,
			W = Math.max(16, (r.width - 44) / STEPS.length);
		const lab = document.createElement("div");
		lab.className = "mw-sll";
		document.body.appendChild(lab);
		li.classList.add("mw-sling");
		let idx = -1,
			gone = false;
		const show = (cx) => {
			const dx = Math.max(0, Math.min(r.width - 28, cx - x0));
			idx =
				dx < 12 ? -1 : Math.min(STEPS.length - 1, Math.floor((dx - 12) / W));
			li.style.setProperty("--mw-dx", dx + "px");
			li.dataset.sl = idx < 0 ? "" : STEPS[idx].op;
			lab.textContent = idx < 0 ? "Тяни вправо" : STEPS[idx].t;
			lab.className =
				"mw-sll" +
				(idx < 0
					? " idle"
					: STEPS[idx].op === "ban"
						? " bad"
						: STEPS[idx].op === "purge"
							? " del"
							: "");
			const lr = lab.getBoundingClientRect();
			lab.style.left =
				Math.round(
					Math.max(
						4,
						Math.min(
							innerWidth - lr.width - 4,
							r.left + dx - lr.width / 2 + 14,
						),
					),
				) + "px";
			lab.style.top = Math.round(Math.max(4, r.top - lr.height - 6)) + "px";
		};

		const pid = e.pointerId;
		let dog = 0;
		const end = (apply) => {
			if (gone) return;
			gone = true;
			clearInterval(dog);
			h.removeEventListener("pointermove", mv);
			h.removeEventListener("lostpointercapture", cancel);
			removeEventListener("pointermove", mvW, true);
			removeEventListener("pointerup", upW, true);
			removeEventListener("pointercancel", cancelW, true);
			removeEventListener("blur", cancel);
			document.removeEventListener("keydown", key, true);
			li.classList.remove("mw-sling");
			li.style.removeProperty("--mw-dx");
			delete li.dataset.sl;
			lab.remove();
			if (apply && idx >= 0 && li.isConnected) pending(ctx, m, STEPS[idx]);
		};
		const mv = (ev) => show(ev.clientX);
		const mvW = (ev) => {
			if (ev.pointerId === pid && !h.isConnected) show(ev.clientX);
		};
		const upW = (ev) => {
			if (ev.pointerId === pid) end(true);
		};
		const cancelW = (ev) => {
			if (ev.pointerId === pid) end(false);
		};
		const cancel = () => end(false);
		const key = (ev) => {
			if (ev.key === "Escape") {
				ev.preventDefault();
				ev.stopPropagation();
				end(false);
			}
		};
		h.addEventListener("pointermove", mv);
		h.addEventListener("lostpointercapture", cancel);
		addEventListener("pointermove", mvW, true);
		addEventListener("pointerup", upW, true);
		addEventListener("pointercancel", cancelW, true);
		addEventListener("blur", cancel);
		document.addEventListener("keydown", key, true);
		dog = setInterval(() => {
			if (!li.isConnected || !lab.isConnected) end(false);
		}, 500);
		show(x0);
	}

	function bindSlider(list, ctx, find) {
		if (list.dataset.mwSl) return;
		list.dataset.mwSl = "1";
		list.addEventListener("pointerdown", (e) => {
			if (!e.target.closest || !e.target.closest(".mw-sl")) return;
			const li = e.target.closest("li[data-mid]");
			if (!li) return;
			slide(e, li, find(li.dataset.mid), ctx);
		});
	}
	const handle = (ctx, m) =>
		ctx.canMod(m)
			? '<i class="mw-sl" title="Потяни вправо: удалить сообщения → мут → бан чата" aria-hidden="true"></i>'
			: "";

	let W = null;
	function close() {
		if (!W) return;
		const w = W;
		W = null;
		w.unsub();
		w.el.remove();
		document.removeEventListener("keydown", w.key, true);
		document.body.classList.remove("mw-on");
		if (w.from && w.from.isConnected)
			try {
				w.from.focus({ preventScroll: true });
			} catch (e) {
				console.warn("[модерация] фокус", e);
			}
	}
	async function open(ctx, o) {
		o = o || {};
		if (W) {
			if (o.l) {
				tab("mod");
				card({ l: o.l });
			}
			return true;
		}
		const me = await allowed(ctx);
		if (!me) return false;
		const pa = me.role === "pa";
		const el = document.createElement("div");
		el.className = "mw gw-tok gw-dk";
		el.dataset.gst = gst();
		el.setAttribute("role", "dialog");
		el.setAttribute("aria-modal", "true");
		el.setAttribute("aria-label", "Окно модерации");
		const tabs = TABS.filter(
			(t) => !t[2] || pa || (t[2] === "own" && me.role === "owner"),
		);
		el.innerHTML = `<div class="mw-w">
      <header class="mw-h"><b>Модерация</b><span class="mw-who">${esc(ctx.ch)} · ${esc(me.me)} · ${esc(ROLE[me.role] || me.role)}${me.src === "twitch" ? " (Twitch)" : me.src === "chat" ? " (чат)" : ""}</span>
        <a class="mw-full" href="/c/${encodeURIComponent(ctx.ch)}/mod" target="_blank" rel="noopener">На весь экран ↗</a><button type="button" class="mw-x" aria-label="Закрыть окно модерации" title="Закрыть (Esc)">×</button></header>
      <div class="mw-b">
        <nav class="mw-tabs" role="tablist" aria-orientation="vertical" aria-label="Разделы модерации">
          <button type="button" role="tab" data-t="chat" class="mw-ph-only"><i aria-hidden="true">${ICO.chat}</i><span>Чат</span></button>
          ${tabs.map(([id, t]) => `<button type="button" role="tab" data-t="${id}"><i aria-hidden="true">${ICO[id]}</i><span>${esc(t)}</span></button>`).join("")}
        </nav>
        <section class="mw-chat" aria-label="Чат канала"><div class="mw-ch">Чат канала <small>тяни ручку ⋮ вправо - наказать</small></div><ol class="mw-cl" role="log"></ol></section>
        <section class="mw-main" aria-live="polite"></section>
      </div></div>`;
		document.body.appendChild(el);
		document.body.classList.add("mw-on");
		const key = (e) => {
			if (
				e.key === "Escape" &&
				!document.querySelector(".mw-sll") &&
				!document.querySelector('.cy-nm[role="menu"]')
			) {
				e.preventDefault();
				close();
			}
		};
		document.addEventListener("keydown", key, true);
		W = {
			el,
			ctx,
			me,
			key,
			from: o.from || null,
			tab: "",
			seq: 0,
			feedNext: null,
			unsub: () => {},
		};
		el.querySelector(".mw-x").onclick = close;
		el.addEventListener("pointerdown", (e) => {
			if (e.target === el) close();
		});
		el.querySelector(".mw-tabs").addEventListener("click", (e) => {
			const b = e.target.closest("[data-t]");
			if (b) tab(b.dataset.t);
		});
		el.querySelector(".mw-main").addEventListener("click", onMain);
		el.querySelector(".mw-main").addEventListener("submit", onSubmit);

		el.querySelector(".mw-main").addEventListener("change", (e) => {
			if (!e.target.matches('[data-v="act"]')) return;
			const r = e.target.form.querySelector('[data-v="reason"]');
			r.hidden = !/^(cban|pban)/.test(e.target.value);
			if (!r.hidden) r.focus();
		});

		el.addEventListener("click", (e) => {
			const x = e.target.closest("[data-open]");
			if (x && W) {
				tab("mod");
				card({ l: x.dataset.open, uid: x.dataset.uid });
			}
		});

		const cl = el.querySelector(".mw-cl");
		bindSlider(cl, ctx, (id) =>
			ctx.list().find((m) => String(m.id) === String(id)),
		);
		cl.addEventListener("click", (e) => {
			const b = e.target.closest("b[data-nick]");
			if (b) {
				tab("mod");
				card({ l: b.dataset.nick });
			}
		});
		cl.addEventListener("contextmenu", (e) => {
			const b =
				e.target.closest("b[data-nick]") ||
				(e.target.closest("li") &&
					e.target.closest("li").querySelector("b[data-nick]"));
			if (!b) return;
			e.preventDefault();
			ctx.menu(b.dataset.nick, b.textContent, e.clientX, e.clientY, b);
		});
		let rt = 0;
		W.unsub = ctx.sub(() => {
			if (!rt)
				rt = setTimeout(() => {
					rt = 0;
					chat();
				}, 150);
		});
		chat(true);
		tab(window.matchMedia("(max-width: 720px)").matches ? "chat" : "mod");
		if (o.l) card({ l: o.l });
		try {
			el.querySelector(".mw-x").focus({ preventScroll: true });
		} catch (e) {
			console.warn("[модерация] фокус", e);
		}
		return true;
	}

	function chat(toEnd) {
		if (!W) return;
		const l = W.el.querySelector(".mw-cl"),
			ctx = W.ctx;
		const end = toEnd || l.scrollHeight - l.scrollTop - l.clientHeight < 40;
		const L = ctx.list().slice(-120);
		l.innerHTML = L.length
			? L.map(
					(m) =>
						`<li data-mid="${esc(m.id)}"${m.r ? ' class="md"' : ""} title="${esc(hm(m.at))}${m.rm === "mine" ? " · шахта" : m.k === "tr" ? " · торговля" : ""}">${handle(ctx, m)}<span class="mw-tm">${esc(hm(m.at))}</span>${m.rm === "mine" ? '<i class="mw-rm">⛏</i>' : m.k === "tr" ? '<i class="mw-rm">💱</i>' : ""}${m.gt ? `<i class="mw-gt">[${esc(m.gt)}]</i>` : ""}<b data-nick="${esc(m.l)}" tabindex="0" style="--nc:${nickColor(m.l)}">${esc(m.n || m.l)}</b> <span class="mw-t">${esc(m.t)}</span></li>`,
				).join("")
			: '<li class="mw-0">Сообщений пока нет.</li>';
		if (end) l.scrollTop = l.scrollHeight;
	}

	function tab(t) {
		if (!W) return;
		W.tab = t;
		for (const b of W.el.querySelectorAll(".mw-tabs [data-t]")) {
			const on = b.dataset.t === t;
			b.classList.toggle("on", on);
			b.setAttribute("aria-selected", String(on));
		}
		W.el.classList.toggle("mw-tchat", t === "chat");
		const box = W.el.querySelector(".mw-main");
		if (t === "chat") {
			chat(true);
			return;
		}
		if (t === "mod") {
			box.innerHTML = modHtml();
			restr();
			return;
		}
		if (t === "log") {
			box.innerHTML = logHtml();
			loadFeed(false);
			return;
		}

		if (REG[t]) {
			box.innerHTML = "";
			const tb = document.createElement("div");
			tb.className = "mw-tab";
			box.appendChild(tb);
			try {
				REG[t].render(tb, tabApi());
			} catch (e) {
				console.error("[модерация] вкладка " + t, e);
				box.innerHTML = `<p class="mw-muted">Вкладка не открылась: ${esc(e.message)}</p>`;
			}
			return;
		}
		const SOON = {
			req: [
				"Запросы на снятие блокировки",
				"Здесь будут обжалования игроков (кнопка «Обжаловать» в чате, в тюрьме и на странице бана) и жалобы игроков - «Снять» или «Отклонить» с ответом.",
			],
			com: [
				"Сообщество",
				"Здесь будет список игроков по разделам: модераторы, админы, стримеры, игроки - с поиском по нику. Админу игры - «Мой канал», «Другие стримеры», «Вся игра».",
			],
			sus: [
				"Подозрительные",
				"Здесь будут боты и частые нарушители: оценка «бот» (шахта, признаки автомайнера), связи аккаунтов по передачам. Только подсвечивает - решает человек.",
			],
			claw: [
				"Изъятие",
				"Здесь будет изъятие: что и за какой период → пробный прогон «было → станет» → «Изъять», номер операции и «Откатить». Пока - команды clawback / clawback-undo на сервере.",
			],
		}[t];
		if (SOON && !REG[t])
			box.innerHTML = `<h2>${esc(SOON[0])}</h2><p class="mw-soon">${esc(SOON[1])}</p><p class="mw-muted">Раздел появится в следующей части этапа 2 (docs/moderation-cabinet.md, «Порядок работ»).</p>`;
	}

	function modHtml() {
		return `<form class="mw-f" data-f="search" role="search"><input name="q" type="search" placeholder="Ник или Twitch ID" aria-label="Ник или Twitch ID" autocomplete="off" maxlength="25"><button type="submit">Найти</button></form>
      <ul class="mw-list mw-res"></ul><div class="mw-card"></div>
      <div class="mw-restr"><p class="mw-muted">Загружаю, кто ограничен…</p></div>${massHtml()}`;
	}

	function massHtml() {
		if (!W || W.me.role === "mod") return "";
		const opts = [
			["chatban", "Бан чата"],
			["mute:1440", "Мут 24 ч"],
			["mute:10080", "Мут 7 дней"],
			...BAN_H.map(([h, t]) => ["cban:" + h, "Тюрьма " + t]),
			...(W.me.role === "pa" ? [["pban", "Бан во всей игре"]] : []),
		];
		return `<details class="mw-mass"><summary>Массово - до 50 ников</summary>
      <form data-f="mass"><textarea name="list" rows="3" placeholder="ники через пробел, запятую или с новой строки" aria-label="Список ников"></textarea>
      <div class="mw-acts"><select name="op" aria-label="Наказание">${opts.map(([v, t]) => `<option value="${v}">${esc(t)}</option>`).join("")}</select>
      <input name="reason" maxlength="200" placeholder="причина" aria-label="Причина"><button type="submit">Проверить</button></div></form>
      <div class="mw-massr"></div></details>`;
	}
	async function mass(f, go) {
		const [op0, n0] = String(f.elements.op.value).split(":"),
			n = +n0 || 0,
			box = f.parentNode.querySelector(".mw-massr");
		const body = {
			list: f.elements.list.value,
			op: op0,
			...(op0 === "mute" ? { min: n } : op0 === "cban" ? { hours: n } : {}),
			reason: String(f.elements.reason.value || "").trim(),
			dry: !go,
		};
		const label = f.elements.op.selectedOptions[0].textContent;
		if (
			go &&
			!(await window.LGSiteUi.ask({
				title: `${label} - всем из списка (${go})?`,
				yes: label,
				danger: true,
			}))
		)
			return;
		box.innerHTML = '<p class="mw-muted">…</p>';
		try {
			const r = await tabApiPost("/mass", body);
			if (!W || !box.isConnected) return;
			if (r.dry) {
				const ok = r.rows.filter((x) => x.found && !x.prot);
				box.innerHTML = `<ul class="mw-list">${r.rows.map((x) => `<li><span class="mw-l" data-open="${esc(x.l)}" role="button" tabindex="0">${esc(x.l)}</span>${!x.found ? ' <span class="mw-tag bad">не найден</span>' : x.prot ? ' <span class="mw-tag">роль в канале - пропустим</span>' : ""}${x.has ? ` <span class="mw-tag warn">уже: ${esc(x.has)}</span>` : ""}</li>`).join("")}</ul>
          ${r.bad.length ? `<p class="mw-muted">Не ники: ${r.bad.map(esc).join(", ")}</p>` : ""}${r.over ? `<p class="mw-muted">Больше ${r.max} - лишние ${r.over} отброшены.</p>` : ""}
          ${ok.length ? `<button type="button" class="bad" data-a="massgo" data-n="${ok.length}">${esc(label)} - наказать ${ok.length}</button>` : '<p class="mw-muted">Наказывать некого.</p>'}`;
			} else {
				box.innerHTML = `<p>Готово: <b>${r.n}</b> из ${r.done.length}.</p><ul class="mw-list">${r.done
					.filter((x) => !x.ok)
					.map((x) => `<li>${esc(x.l)} - ${esc(x.error || "не вышло")}</li>`)
					.join("")}</ul>`;
				restr();
			}
		} catch (e) {
			box.innerHTML = `<p class="mw-msg bad">${esc(e.message)}</p>`;
		}
	}
	const tabApiPost = (path, body) =>
		modc(W.ctx.ch, path, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});
	async function restr() {
		const box = W && W.el.querySelector(".mw-restr");
		if (!box) return;
		const r = await W.ctx.info();
		if (!W || !box.isConnected) return;
		if (!r || !r.ok) {
			box.innerHTML = `<p class="mw-muted">${esc((r && r.error) || "не загрузилось")}</p>`;
			return;
		}
		const bans = (r.bans || [])
			.map(
				(
					x,
				) => `<li><span class="mw-l" data-open="${esc(x.l)}" role="button" tabindex="0">${esc(x.l)}</span> <span class="mw-tag ${x.until ? "warn" : "bad"}">${x.until ? "мут " + esc(until(x.until)) : "бан чата"}</span>${x.by ? ` <span class="mw-muted">· ${esc(x.by)}</span>` : ""}${x.reason ? ` <span class="mw-muted mw-why">· причина: ${esc(x.reason)}</span>` : ""}
      <button type="button" data-a="unban" data-l="${esc(x.l)}">Снять</button></li>`,
			)
			.join("");
		const mods =
			r.role === "own"
				? `<h3>Модераторы чата</h3><ul class="mw-list">${(r.mods || []).map((x) => `<li><span class="mw-l" data-open="${esc(x)}" role="button" tabindex="0">${esc(x)}</span><button type="button" data-a="unmod" data-l="${esc(x)}" aria-label="Снять модератора ${esc(x)}">Снять</button></li>`).join("") || '<li class="mw-muted">Пока никого. Модераторы канала на Twitch - модераторы и здесь.</li>'}</ul>
      <form class="mw-f" data-f="addmod"><input name="l" placeholder="ник модератора" aria-label="Ник нового модератора" autocomplete="off" maxlength="26"><button type="submit">Добавить</button></form>`
				: "";
		box.innerHTML = `<h3>Сейчас ограничены в чате</h3><ul class="mw-list">${bans || '<li class="mw-muted">Никто не ограничен.</li>'}</ul>${mods}`;
	}
	async function search(q) {
		const box = W.el.querySelector(".mw-res");
		box.innerHTML = '<li class="mw-muted">Ищу…</li>';
		try {
			const j = await modc(W.ctx.ch, "/search?q=" + encodeURIComponent(q));
			if (!W) return;
			box.innerHTML = j.list.length
				? j.list
						.map(
							(
								p,
							) => `<li class="mw-pick" data-open="${esc(p.login)}" data-uid="${esc(p.uid)}" tabindex="0" role="button"><b>${esc(p.login)}</b>
        ${p.hero ? '<span class="mw-tag">герой здесь</span>' : ""}${p.cban ? '<span class="mw-tag bad">бан аккаунта</span>' : ""}${p.pban ? '<span class="mw-tag bad">бан во всей игре</span>' : ""}
        <div class="mw-when">Twitch ID ${esc(p.uid)} · был ${esc(when(p.seen))}</div></li>`,
						)
						.join("")
				: '<li class="mw-muted">Никого не нашли. Ник - с начала, Twitch ID - целиком.</li>';
			if (j.list.length === 1) card({ uid: j.list[0].uid, l: j.list[0].login });
		} catch (e) {
			box.innerHTML = `<li class="mw-muted">${esc(e.message)}</li>`;
		}
	}
	async function card(o) {
		if (!W) return;
		if (W.tab !== "mod") tab("mod");
		const seq = ++W.seq,
			box = W.el.querySelector(".mw-card");
		if (!box) return;
		box.innerHTML = '<p class="mw-muted">Загрузка карточки…</p>';
		const qs = o.uid
			? "uid=" + encodeURIComponent(o.uid)
			: "l=" + encodeURIComponent(o.l || "");
		try {
			const c = await modc(W.ctx.ch, "/card?" + qs);
			if (!W || seq !== W.seq) return;
			W.card = c;
			box.innerHTML = cardHtml(c);
			box.scrollIntoView({ block: "start", behavior: "smooth" });
		} catch (e) {
			if (W && seq === W.seq)
				box.innerHTML = `<p class="mw-muted">${esc(e.message)}</p>`;
		}
	}

	function actsHtml(c) {
		const me = W.me,
			ctx = W.ctx,
			mine = c.login === me.me,
			chan = c.login === String(ctx.ch).toLowerCase();
		if (mine || chan)
			return `<p class="mw-muted">${mine ? "Это вы." : "Это хозяин канала."}</p>`;
		const chat = ctx.role()
			? [
					["purge", "Удалить сообщения"],
					...MUTES.map(([k, t]) => ["mute:" + k, "Мут " + t]),
					["ban", "Бан чата"],
				]
			: [];

		const acc = (
			me.role === "mod"
				? BAN_H.filter(([h]) => h && h <= (me.maxH || 24))
				: BAN_H
		).map(([h, t]) => ["cban:" + h, "Тюрьма " + t]);
		const all =
			me.role === "pa" && !c.now.pban
				? BAN_H.map(([h, t]) => ["pban:" + h, "Бан во всей игре " + t])
				: [];
		const grp = (name, L) =>
			L.length
				? `<optgroup label="${name}">${L.map(([v, t]) => `<option value="${v}">${esc(t)}</option>`).join("")}</optgroup>`
				: "";
		if (!chat.length && !acc.length && !all.length) return "";
		return `<form class="mw-acts" data-f="act" data-l="${esc(c.login)}">
      <select data-v="act" aria-label="Наказание"><option value="">Наказать…</option>${grp("Чат", chat)}${grp("Аккаунт на канале", acc)}${grp("Вся игра", all)}</select>
      <input data-v="reason" maxlength="200" placeholder="причина" aria-label="Причина" hidden>
      <button type="submit">Применить</button>
      <p class="mw-msg" role="status"></p></form>`;
	}
	function cardHtml(c) {
		const can = W.me.can,
			out = [];
		out.push(
			`<div class="mw-name">${esc(c.name)} <span class="mw-muted">@${esc(c.login)}</span></div>`,
		);
		out.push(actsHtml(c));
		out.push(`<dl class="mw-kv"><dt>Twitch ID</dt><dd>${c.uid ? esc(c.uid) : "неизвестен (не входил на сайт и не писал в чат)"}</dd>
      ${
				c.tw
					? `<dt>Аккаунт Twitch</dt><dd>${c.tw.created ? `создан ${esc(day(c.tw.created))} (${esc(age(c.tw.created))})` : "дата создания неизвестна"}</dd>
      <dt>На платформе</dt><dd>с ${esc(day(c.tw.first))}, был ${esc(when(c.tw.seen))}</dd>`
					: ""
			}</dl>`);
		if (c.names.length > 1)
			out.push(
				`<h3>Ники этого Twitch ID</h3><div>${c.names.map((n) => `<span class="mw-tag" title="${esc(day(n.from))} - ${esc(day(n.to))}">${esc(n.l)}</span>`).join("")}</div>`,
			);
		const now = [],
			un = (a) =>
				`<button type="button" class="mw-un" data-a="${a}" data-l="${esc(c.login)}">Снять</button>`;
		if (c.now.cban)
			now.push(
				`<li><span class="mw-tag bad">тюрьма</span> ${esc(until(c.now.cban.until))}${c.now.cban.reason ? ` - ${esc(c.now.cban.reason)}` : ""}${un("cunban")}<div class="mw-when">выдал ${esc(c.now.cban.by || ROLE[c.now.cban.role] || "модератор")} · ${esc(when(c.now.cban.at))}</div></li>`,
			);
		if (c.now.pban)
			now.push(
				`<li><span class="mw-tag bad">бан во всей игре</span> ${esc(until(c.now.pban.until))}${c.now.pban.reason ? ` - ${esc(c.now.pban.reason)}` : ""}${W.me.role === "pa" ? un("punban") : ""}<div class="mw-when">${c.now.pban.by ? "выдал " + esc(c.now.pban.by) + " · " : ""}${esc(when(c.now.pban.at))}</div></li>`,
			);
		if (c.now.mute)
			now.push(
				`<li><span class="mw-tag warn">${c.now.mute.until ? "мут" : "бан чата"}</span> ${esc(until(c.now.mute.until))}${c.now.mute.by ? ` · выдал ${esc(c.now.mute.by)}` : ""}${c.now.mute.reason ? ` - ${esc(c.now.mute.reason)}` : ""}${W.ctx.role() ? un("unban") : ""}</li>`,
			);
		out.push(
			`<h3>Наказания сейчас</h3>${now.length ? `<ul class="mw-list">${now.join("")}</ul>` : '<p class="mw-muted">Нет.</p>'}`,
		);
		if (c.otherBans.active || c.otherBans.total)
			out.push(
				`<p>На других каналах: банов сейчас <b>${c.otherBans.active}</b>, всего за 180 дней <b>${c.otherBans.total}</b>${can.otherChannels ? "" : ' <span class="mw-muted">(подробности - только админу игры)</span>'}</p>`,
			);
		if (c.bot && !c.bot.err && !c.bot.none)
			out.push(
				`<h3>Оценка «бот» (шахта, ${esc(c.bot.date)})</h3><div class="mw-bot${c.bot.s >= 60 ? " hi" : ""}"><b>${esc(c.bot.s)}</b> из 100${c.bot.why.length ? ` - ${c.bot.why.map(esc).join("; ")}` : ""}<div class="mw-when">Оценка только подсвечивает: решает человек.</div></div>`,
			);
		const H = (h) =>
			`<li><b>${esc(h.ch)}</b> · ${esc(h.login)} <span class="mw-tag">ур. ${esc(h.level)}</span>${h.dead ? '<span class="mw-tag warn">призрак</span>' : ""} <span class="mw-muted">монеты ${esc(h.money)} · вещей ${esc(h.items)}</span></li>`;
		out.push("<h3>Герои</h3>");
		out.push(
			c.heroes.here.length
				? `<ul class="mw-list">${c.heroes.here.map(H).join("")}</ul>`
				: '<p class="mw-muted">На этом канале героя нет.</p>',
		);
		if (c.heroes.other) {
			if (c.heroes.other.length)
				out.push(`<ul class="mw-list">${c.heroes.other.map(H).join("")}</ul>`);
		} else if (c.heroes.otherN)
			out.push(`<p>Героев на других каналах: <b>${c.heroes.otherN}</b></p>`);
		if (c.xfer && c.xfer.n)
			out.push(
				`<h3>Передачи за ${c.xfer.days} дней</h3><div class="mw-scroll"><table class="mw-tbl"><tr><th>с кем</th><th>раз</th><th>монет →/←</th><th>вещей →/←</th></tr>${c.xfer.sum
					.slice(0, 20)
					.map(
						(s) =>
							`<tr><td><span class="mw-l" data-open="${esc(s.who)}" role="button" tabindex="0">${esc(s.who)}</span></td><td>${s.n}</td><td>${s.cOut} / ${s.cIn}</td><td>${s.iOut} / ${s.iIn}</td></tr>`,
					)
					.join("")}</table></div>`,
			);
		out.push("<h3>История наказаний</h3>");
		out.push(
			c.history.length
				? `<ul class="mw-list">${c.history.map(logLi).join("")}</ul>`
				: '<p class="mw-muted">Пусто (журнал хранится 180 дней).</p>',
		);
		out.push("<h3>Сообщения в чатах сайта</h3>");
		out.push(
			c.chat.length
				? `<ul class="mw-list">${c.chat.map((m) => `<li><span class="mw-when">${esc(when(m.at))} · ${esc(ROOM[m.room] || m.room)}${m.to ? " → " + esc(m.to) : ""}</span><div class="mw-t">${esc(m.t)}</div></li>`).join("")}</ul>`
				: '<p class="mw-muted">Нет (хранятся 30 дней).</p>',
		);
		return out.join("");
	}
	function logLi(x) {
		const who = x.by
			? `${esc(x.by)}${x.role ? " (" + esc(ROLE[x.role] || x.role) + ")" : ""}`
			: esc(ROLE[x.role] || "модератор");
		return `<li><b>${esc(KIND[x.kind] || x.kind)}</b> <span class="mw-l" data-open="${esc(x.l)}" role="button" tabindex="0">${esc(x.l)}</span>${x.until ? " · " + esc(until(x.until)) : ""}${x.room ? " · " + esc(ROOM[x.room] || x.room) : ""}${x.pl ? ' <span class="mw-tag">вся игра</span>' : ""}
      ${x.reason ? `<div class="mw-t">${esc(x.reason)}</div>` : ""}<div class="mw-when">${esc(when(x.at))} · ${who}</div></li>`;
	}

	function logHtml() {
		return `<h2>Журнал</h2><form class="mw-f mw-fl" data-f="feed">
      <select name="src" aria-label="Что показать"><option value="">всё</option><option value="mod">действия модераторов</option><option value="spam">спам-фильтр</option><option value="report">жалобы</option><option value="chat">сообщения чатов</option></select>
      <input name="login" placeholder="игрок" aria-label="Игрок" maxlength="25"><input name="by" placeholder="модератор" aria-label="Модератор" maxlength="25">
      <select name="h" aria-label="За какое время"><option value="1">1 ч</option><option value="24" selected>24 ч</option><option value="168">7 дней</option><option value="">всё</option></select>
      <button type="submit">Показать</button></form><ul class="mw-list mw-feed"></ul><button type="button" class="mw-more" data-a="more" hidden>Ещё</button>`;
	}
	function feedLi(x) {
		if (x.src === "mod") return logLi(x);
		if (x.src === "report")
			return `<li><b>жалоба</b> на <span class="mw-l" data-open="${esc(x.l)}" role="button" tabindex="0">${esc(x.l)}</span> от ${esc(x.to)} <span class="mw-tag${x.st === "new" ? " warn" : ""}">${x.st === "new" ? "новая" : "разобрана"}</span>${x.reason ? `<div class="mw-t">${esc(x.reason)}</div>` : ""}<div class="mw-when">${esc(when(x.at))}</div></li>`;
		if (x.src === "spam")
			return `<li><b>спам-фильтр</b>: ${esc(SPAM[x.kind] || x.kind)} · <span class="mw-l" data-open="${esc(x.l)}" role="button" tabindex="0">${esc(x.l)}</span>${x.until ? " · блок " + esc(until(x.until)) : ""}${x.t ? `<div class="mw-t">${esc(x.t)}</div>` : ""}<div class="mw-when">${esc(when(x.at))}</div></li>`;
		return `<li><span class="mw-when">${esc(when(x.at))} · ${esc(ROOM[x.room] || x.room)}</span> <span class="mw-l" data-open="${esc(x.l)}" role="button" tabindex="0">${esc(x.l)}</span><div class="mw-t">${esc(x.t)}</div></li>`;
	}
	async function loadFeed(more) {
		if (!W) return;
		const f = W.el.querySelector('[data-f="feed"]'),
			box = W.el.querySelector(".mw-feed"),
			mb = W.el.querySelector(".mw-more");
		if (!f || !box) return;
		const p = new URLSearchParams();
		for (const k of ["src", "login", "by", "h"]) {
			const v = String(f.elements[k].value || "").trim();
			if (v) p.set(k, v);
		}
		if (more && W.feedNext) p.set("before", W.feedNext);
		if (!more) box.innerHTML = '<li class="mw-muted">Загрузка…</li>';
		try {
			const j = await modc(W.ctx.ch, "/feed?" + p);
			if (!W || !box.isConnected) return;
			const h = j.list.map(feedLi).join("");
			if (more) box.insertAdjacentHTML("beforeend", h);
			else box.innerHTML = h || '<li class="mw-muted">Пусто.</li>';
			W.feedNext = j.next;
			mb.hidden = !j.more;
		} catch (e) {
			box.innerHTML = `<li class="mw-muted">${esc(e.message)}</li>`;
		}
	}

	async function modAct(body) {
		const r = await fetch(`/c/${encodeURIComponent(W.ctx.ch)}/api/mod/act`, {
			method: "POST",
			credentials: "same-origin",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});
		const j = await r.json().catch(() => ({}));
		return r.ok && j.ok !== false
			? { ok: true }
			: {
					ok: false,
					error:
						j.error === "moderation_closed"
							? "бан аккаунта кнопкой пока открыт только каналам-тестерам"
							: j.error || `ошибка ${r.status}`,
				};
	}
	async function onMain(e) {
		const b = e.target.closest("[data-a]");
		if (!b || !W) return;
		const a = b.dataset.a,
			ctx = W.ctx,
			l = b.dataset.l;
		if (a === "more") {
			loadFeed(true);
			return;
		}
		if (a === "massgo") {
			const f = b.closest(".mw-mass").querySelector('[data-f="mass"]');
			mass(f, +b.dataset.n || 1);
			return;
		}
		if (!l) return;
		b.disabled = true;
		let ok = false;
		try {
			if (a === "unban" || a === "unmod")
				ok = await ctx.act(a, { login: l, n: l, sure: true });
			else if (a === "cunban" || a === "punban") {
				const r = await modAct({
					op: a === "cunban" ? "unban" : "punban",
					login: l,
				});
				ok = r.ok;
				if (!ok) window.LGSiteUi.toast(r.error || "Не вышло", true);
			}
		} finally {
			b.disabled = false;
		}
		if (ok) {
			restr();
			if (W && W.card && W.card.login === l) card({ l });
		}
	}

	async function act(f) {
		const l = f.dataset.l,
			v = f.querySelector('[data-v="act"]').value,
			why = String(f.querySelector('[data-v="reason"]').value || "").trim(),
			msg = f.querySelector(".mw-msg");
		const say = (t, bad) => {
			msg.textContent = t;
			msg.classList.toggle("bad", !!bad);
		};
		if (!v) {
			say("Выберите наказание.", true);
			return;
		}
		const [k, n0] = v.split(":"),
			n = +n0 || 0,
			label = f.querySelector('[data-v="act"]').selectedOptions[0].textContent;
		if (
			(k === "ban" || k === "cban" || k === "pban") &&
			!(await window.LGSiteUi.ask({
				title: `${label} - «${l}»?`,
				yes: label,
				danger: true,
			}))
		)
			return;
		const btn = f.querySelector("button");
		btn.disabled = true;
		let ok = false,
			err = "";
		try {
			if (k === "purge" || k === "mute" || k === "ban")
				ok = await W.ctx.act(k, {
					login: l,
					n: l,
					min: k === "mute" ? n : undefined,
					sure: true,
				});
			else {
				const r = await modAct(
					k === "cban"
						? { op: "ban", login: l, hours: n, reason: why }
						: { op: "pban", login: l, hours: n, reason: why },
				);
				ok = r.ok;
				err = r.error || "";
			}
		} finally {
			btn.disabled = false;
		}
		say(
			ok ? `${label} - готово.` : err || "Не вышло - смотри сообщение в чате.",
			!ok,
		);
		if (ok) {
			restr();
			setTimeout(() => {
				if (W && W.card && W.card.login === l) card({ l });
			}, 600);
		}
	}
	function onSubmit(e) {
		const f = e.target.closest("[data-f]");
		if (!f || !W) return;
		e.preventDefault();
		if (f.dataset.f === "act") {
			act(f);
			return;
		}
		if (f.dataset.f === "mass") {
			mass(f, 0);
			return;
		}
		if (f.dataset.f === "search") {
			const q = String(f.elements.q.value || "")
				.trim()
				.replace(/^@/, "");
			if (q.length >= 2) search(q);
		} else if (f.dataset.f === "feed") loadFeed(false);
		else if (f.dataset.f === "addmod") {
			const l = String(f.elements.l.value || "")
				.trim()
				.replace(/^@/, "")
				.toLowerCase();
			if (l)
				W.ctx.act("mod", { login: l, n: l, sure: true }).then(() => {
					f.reset();
					restr();
				});
		}
	}

	function tabApi() {
		return {
			ch: W.ctx.ch,
			me: W.me,
			ctx: W.ctx,
			esc,
			when,
			day,
			until,
			ROLE,
			KIND,
			modc: (path, opt) => modc(W.ctx.ch, path, opt),
			post: (path, body) =>
				modc(W.ctx.ch, path, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(body || {}),
				}),
			modAct,
			card: (o) => card(o),
			alive: (box) => !!W && box.isConnected,
			nick: (l) =>
				`<span class="mw-l" data-open="${esc(l)}" role="button" tabindex="0">${esc(l)}</span>`,
		};
	}
	window.LGModWin = {
		allowed,
		open,
		close,
		isOpen: () => !!W,
		slide,
		bindSlider,
		handle,
		STEPS,
		addTab,
	};
})();

(() => {
	const WHAT = [
		["coins", "монеты"],
		["items", "вещи"],
		["ore", "руда"],
		["mine-week", "вклад недели в шахте"],
		["board", "места в итогах недели"],
		["hall", "доска почёта Ратуши"],
	];
	const SRC = [
		["mine", "шахта"],
		["hall", "Ратуша"],
		["auction", "аукцион"],
		["trade", "обмен"],
		["friend", "монета дня"],
		["quest", "поход"],
		["shop", "лавка"],
		["ach", "достижения"],
		["other", "прочее"],
	];
	const SRC_RU = Object.fromEntries([
		...SRC,
		["admin", "ведущий"],
		["store", "склад"],
		["chain", "пришло по цепочке"],
	]);
	const HOW = {
		"auction-sell": "аукцион",
		"auction-buy": "аукцион",
		trade: "обмен",
		friend: "монета дня",
	};
	const W_ON = { on: " (надета)", vault: " (склад)" };

	window.LGModWin.addTab("claw", {
		render(box, api) {
			const { esc, when } = api,
				pa = api.me.role === "pa";
			const S = { plan: null, q: null };
			const num = (n) => (Number(n) || 0).toLocaleString("ru-RU");
			const nick = (l) => api.nick(l);
			box.innerHTML = `<h2>Изъятие</h2>
        <p class="mw-muted">Снять нечестно добытое: монеты, вещи, руду, вклад в шахте. Сначала посмотрите «След» или сделайте пробный прогон - он ничего не меняет.${pa ? "" : " Вам доступны только «След» и пробный прогон своего канала - изымает админ игры."}</p>
        <form class="mw-claw-f" data-claw>
          <label class="mw-claw-w">Ники<input name="logins" placeholder="ник1, ник2 (до 50)" autocomplete="off" required></label>
          <div class="mw-claw-row"><span class="mw-claw-l">За какое время</span>
            <select name="days" aria-label="Период">${[
							[1, "сутки"],
							[3, "3 дня"],
							[7, "7 дней"],
							[14, "14 дней"],
							[30, "30 дней"],
							["", "свои даты"],
						]
							.map(
								([v, t]) =>
									`<option value="${v}"${v === 7 ? " selected" : ""}>${t}</option>`,
							)
							.join("")}</select>
            <span class="mw-claw-dates" hidden><input name="from" placeholder="с: 07.11 00:00" aria-label="С (МСК)"><input name="to" placeholder="по: 08.11 23:59" aria-label="По (МСК)"></span></div>
          <div class="mw-claw-row"><span class="mw-claw-l">Что изымать</span>${WHAT.map(([v, t]) => `<label class="mw-claw-c"><input type="checkbox" name="what" value="${v}" checked>${t}</label>`).join("")}</div>
          <details class="mw-claw-more"><summary>Откуда (по умолчанию - всё)</summary><div class="mw-claw-row">${SRC.map(([v, t]) => `<label class="mw-claw-c"><input type="checkbox" name="src" value="${v}" checked>${t}</label>`).join("")}</div></details>
          <div class="mw-claw-row"><label class="mw-claw-c" title="Скидывали ли ворованное другим: аукцион, обмен, монета дня. Отмечено - у получателей снимется только пришедшее от этих ников"><input type="checkbox" name="follow">по следу денег (и у тех, кому передали)</label>
            ${pa ? '<label class="mw-claw-c"><input type="checkbox" name="all">все каналы</label>' : ""}</div>
          ${pa ? '<label class="mw-claw-w">Причина (увидит игрок в журнале героя)<input name="why" maxlength="120" placeholder="нечестная добыча"></label>' : ""}
          <div class="mw-claw-row mw-claw-btns"><button type="button" data-c="trace">След</button><button type="button" data-c="to" title="Кто переводил этим никам - поиск «копилки»">Кто им переводил</button><button type="submit">Пробный прогон</button></div>
        </form>
        <div class="mw-claw-out" aria-live="polite"></div>
        <h3>Последние операции</h3><ul class="mw-list mw-claw-ops"><li class="mw-muted">Загрузка…</li></ul>`;
			const f = box.querySelector("[data-claw]"),
				out = box.querySelector(".mw-claw-out");
			f.days.addEventListener("change", () => {
				box.querySelector(".mw-claw-dates").hidden = f.days.value !== "";
			});
			const query = () => {
				const all = [...f.querySelectorAll('input[name="what"]')],
					src = [...f.querySelectorAll('input[name="src"]')];
				const pick = (L) =>
					L.every((x) => x.checked)
						? []
						: L.filter((x) => x.checked).map((x) => x.value);
				return {
					logins: f.logins.value,
					...(f.days.value
						? { days: +f.days.value }
						: { from: f.from.value.trim(), to: f.to.value.trim() }),
					what: pick(all),
					src: pick(src),
					follow: f.follow.checked,
					all: !!(f.all && f.all.checked),
					why: f.why ? f.why.value.trim() : "",
				};
			};
			const busy = (t) => {
				out.innerHTML = `<p class="mw-muted">${esc(t)}</p>`;
			};
			const fail = (e) => {
				out.innerHTML = `<p class="mw-claw-err">${esc(e.message || e)}</p>`;
			};

			async function doTrace(toMode) {
				const q = query();
				if (!q.logins.trim()) {
					fail("Укажите ник");
					return;
				}
				busy(
					"Смотрю журнал за период… (до полуминуты: спрашиваю комнаты каналов)",
				);
				try {
					const r = await api.post("/trace", { ...q, toMode });
					if (api.alive(box)) out.innerHTML = traceHtml(r);
				} catch (e) {
					if (api.alive(box)) fail(e);
				}
			}
			function moves(L, n, dir) {
				if (!L.length) return "";
				return `<div class="mw-claw-mv"><b>${dir === "out" ? "Отдал" : "Получил"}</b> (${n})<ul>${L.map((m) => `<li>${esc(when(m.at))} · ${esc(SRC_RU[m.src] || m.src)} · ${dir === "out" ? "→" : "←"} ${m.who ? nick(m.who) : ""} ${m.c ? num(m.c) + " монет" : ""} ${m.what ? "«" + esc(m.what) + "»" : ""}</li>`).join("")}</ul></div>`;
			}
			function flowsHtml(L, title) {
				return L.length
					? `<h4>${esc(title)}</h4><ul class="mw-claw-flow">${L.map((x) => `<li>${nick(x.from)} → ${nick(x.to)}${x.inList === false ? ' <span class="mw-tag warn">не в списке</span>' : ""}: ${x.c ? num(x.c) + " монет" : ""}${x.items && x.items.length ? " " + x.items.map((i) => "«" + esc(i) + "»").join(", ") : ""} <span class="mw-when">${esc(HOW[x.how] || x.how)}, ${esc(when(x.at))}${x.depth ? ", шаг " + x.depth : ""}</span></li>`).join("")}</ul>`
					: "";
			}
			function traceHtml(r) {
				const o = [
					`<h3>${r.toMode ? "Кто переводил" : "След"}: ${r.logins.map(nick).join(", ")} <span class="mw-muted">${esc(when(r.from))} - ${esc(when(r.to))}</span></h3>`,
				];
				if (!r.chans.length)
					o.push(
						'<p class="mw-muted">За этот период ничего: записей в журнале и героев нет.</p>',
					);
				for (const c of r.chans) {
					o.push(
						`<div class="mw-claw-ch"><div class="mw-claw-chh">Канал <b>${esc(c.ch)}</b>${c.room ? "" : ' <span class="mw-tag warn">комната не ответила - только журнал</span>'}</div>`,
					);
					if (r.toMode)
						o.push(
							flowsHtml(c.inbound, "Переводы этим никам") ||
								'<p class="mw-muted">Переводов нет.</p>',
						);
					else {
						for (const h of c.heroes) {
							const ins = Object.entries(h.coins || {})
								.filter(([, v]) => v.in > 0)
								.sort((a, b) => b[1].in - a[1].in);
							o.push(`<div class="mw-claw-h"><div>${nick(h.l)} <span class="mw-muted">записей ${h.n}${h.money != null ? ` · в кошельке ${num(h.money)}` : ""}</span>${h.audits.length ? ` <span class="mw-tag">уже изымали: ${h.audits.map((a) => esc(a.id)).join(", ")}</span>` : ""}</div>
                ${ins.length ? `<div>Монеты пришли: ${ins.map(([k, v]) => `${esc(SRC_RU[k] || k)} <b>+${num(v.in)}</b>`).join(" · ")}</div>` : '<div class="mw-muted">Монет не получал.</div>'}
                ${h.itemsN ? `<div>Вещи (${h.itemsN}): ${h.items.map((x) => "«" + esc(x.name) + "»").join(", ")}${h.itemsN > h.items.length ? " …" : ""}</div>` : ""}
                ${h.lots.length ? `<div>На аукционе: ${h.lots.map(esc).join(", ")}</div>` : ""}
                ${moves(h.gave, h.gaveN, "out")}${moves(h.got, h.gotN, "in")}</div>`);
						}
						o.push(flowsHtml(c.flows, "Кому ушли деньги и вещи"));
						if (c.recv.length)
							o.push(
								`<p>Получатели не из списка: ${c.recv.map((x) => `${nick(x.l)} (${num(x.in)} монет${x.items ? ", вещей " + x.items : ""})`).join(", ")} - изъять у них пришедшее можно с отметкой «по следу денег».</p>`,
							);
					}
					o.push("</div>");
				}
				return o.join("");
			}

			async function doDry() {
				const q = query();
				if (!q.logins.trim()) {
					fail("Укажите ник");
					return;
				}
				busy("Считаю план… (до полуминуты)");
				try {
					const r = await api.post("/claw", { ...q, dry: true });
					if (!api.alive(box)) return;
					S.plan = r;
					S.q = q;
					out.innerHTML = planHtml(r);
				} catch (e) {
					if (api.alive(box)) fail(e);
				}
			}
			function rowHtml(x) {
				if (x.noHero)
					return `<tr class="mw-claw-dim"><td>${nick(x.l)}</td><td colspan="4">героя на канале нет</td></tr>`;
				const ore = x.ore
					.map((o) => `${esc(o.k)} ${o.have} → ${Math.max(0, o.have - o.take)}`)
					.join(", ");
				return `<tr${x.done ? ' class="mw-claw-dim"' : ""}><td>${nick(x.l)}${x.recv ? `<div class="mw-when">получил от ${x.recv.map(esc).join(", ")}</div>` : ""}${x.done ? `<div class="mw-when">уже изъято этой операцией${x.done.undone ? ", отменено" : ""}</div>` : ""}${x.overlap.length ? '<div class="mw-tag warn">уже изымали за этот период</div>' : ""}</td>
          <td class="n">${num(x.before)} → <b class="${x.after < 0 ? "mw-claw-neg" : ""}">${num(x.after)}</b>${x.after < 0 ? '<div class="mw-when">уйдёт в долг</div>' : ""}</td>
          <td>${x.items.length ? x.items.map((i) => "«" + esc(i.name) + "»" + (W_ON[i.w] || "")).join(", ") : "-"}${x.itemsMiss.length ? `<div class="mw-when">уже нет у героя: ${x.itemsMiss.length}</div>` : ""}</td>
          <td>${[ore, x.bagC ? "монеты сумки " + num(x.bagC) : "", x.wk ? `вклад недели ${num(x.wk)} → 0` : "", x.hist.length ? "итоги недель: " + x.hist.length : "", x.hall ? `доска Ратуши ${num(x.donors)} → ${num(Math.max(0, x.donors - x.hall))}` : ""].filter(Boolean).map(esc).join("<br>") || "-"}</td></tr>`;
			}
			function planHtml(r) {
				const s = r.sum,
					o = [];
				o.push(
					`<h3>${r.applied ? "Изъято" : "Пробный прогон"} <span class="mw-muted">операция ${esc(r.id)} · ${esc(when(r.from))} - ${esc(when(r.to))}</span></h3>`,
				);
				if (!r.applied)
					o.push('<p class="mw-muted">Это план - ничего не изменено.</p>');
				if (s.dead.length)
					o.push(
						`<p class="mw-claw-err">Комната не ответила: ${s.dead.map(esc).join(", ")} - план только по журналу, изъять там сейчас нельзя.</p>`,
					);
				for (const c of r.chans) {
					const rows = r.rows.filter((x) => x.ch === c.ch);
					o.push(`<div class="mw-claw-ch"><div class="mw-claw-chh">Канал <b>${esc(c.ch)}</b>${c.error ? ` <span class="mw-claw-err">${esc(c.error)}</span>` : ""}</div>
            ${rows.length ? `<div class="mw-scroll"><table class="mw-tbl mw-claw-t"><tr><th>игрок</th><th>монеты: было → станет</th><th>вещи</th><th>шахта и Ратуша</th></tr>${rows.map(rowHtml).join("")}</table></div>` : '<p class="mw-muted">Нечего изымать.</p>'}
            ${flowsHtml(c.flows, r.follow ? "След денег (снимается и у получателей)" : "Передачи между этими никами")}
            ${c.done ? `<ul class="mw-claw-flow">${c.done.map((x) => `<li>${nick(x.l)}: ${x.again ? "уже было - ничего не сделано" : x.skip ? "пропущен - " + esc(x.skip) : `снято монет ${num(x.took)}, вещей ${x.items}`}</li>`).join("")}</ul>` : ""}</div>`);
				}
				o.push(
					`<div class="mw-claw-sum">Итого: игроков <b>${s.players}</b> · монет <b>${num(s.coins)}</b> · вещей <b>${s.items}</b>${s.debt ? ` · в долг уйдут <b>${s.debt}</b>` : ""}</div>`,
				);
				if (r.applied)
					o.push(
						`<div class="mw-claw-row"><button type="button" class="bad" data-c="undo" data-id="${esc(r.id)}">Откатить</button><span class="mw-muted">Вернёт снятое этой операцией.</span></div>`,
					);
				else if (pa && s.players && !s.dead.length)
					o.push(
						`<div class="mw-claw-row">${s.overlap ? '<label class="mw-claw-c"><input type="checkbox" data-again>снять ещё раз (уже изымали за этот период)</label>' : ""}<button type="button" class="bad" data-c="apply">Изъять</button></div>`,
					);
				return o.join("");
			}
			async function doApply(btn) {
				const r = S.plan;
				if (!r || !S.q) return;
				const again = !!out.querySelector("[data-again]:checked");
				if (r.sum.overlap && !again) {
					fail(
						"У части игроков уже было изъятие за этот период - отметьте «снять ещё раз» или поменяйте период",
					);
					return;
				}
				if (
					!(await window.LGSiteUi.ask({
						title: `Изъять у ${r.sum.players} игроков: монет ${num(r.sum.coins)}, вещей ${r.sum.items}?`,
						text: `Операция ${r.id} - её можно откатить.`,
						yes: "Изъять",
						danger: true,
					}))
				)
					return;
				btn.disabled = true;
				busy("Изымаю через комнаты каналов…");
				try {
					const x = await api.post("/claw", {
						...S.q,
						dry: false,
						id: r.id,
						again,
					});
					if (!api.alive(box)) return;
					S.plan = x;
					out.innerHTML = planHtml(x);
					ops();
				} catch (e) {
					if (api.alive(box)) fail(e);
				}
			}
			async function doUndo(id, btn) {
				if (
					!(await window.LGSiteUi.ask({
						title: `Откатить изъятие ${id}?`,
						text: "Снятое вернётся игрокам.",
						yes: "Откатить",
					}))
				)
					return;
				if (btn) btn.disabled = true;
				try {
					const x = await api.post("/claw-undo", { id });
					if (!api.alive(box)) return;
					out.innerHTML = `<h3>Откат ${esc(x.id)}</h3>${x.chans.map((c) => `<div class="mw-claw-ch"><div class="mw-claw-chh">Канал <b>${esc(c.ch)}</b>${c.error ? ` <span class="mw-claw-err">${esc(c.error)}</span>` : ""}</div><ul class="mw-claw-flow">${c.hero.map((h) => `<li>${nick(h.l)}: ${h.again ? "уже возвращено" : `вернулось монет ${num(h.coins)}, вещей ${h.items}`}</li>`).join("")}${c.mine.map((m) => `<li>шахта, ${nick(m.l)}: ${m.again ? "уже возвращено" : esc(m.sum || "нечего")}</li>`).join("")}</ul></div>`).join("")}`;
					ops();
				} catch (e) {
					if (api.alive(box)) fail(e);
					if (btn) btn.disabled = false;
				}
			}
			async function ops() {
				const L = box.querySelector(".mw-claw-ops");
				try {
					const x = await api.modc("/claw-ops");
					if (!api.alive(box)) return;
					L.innerHTML = x.list.length
						? x.list
								.map(
									(
										o,
									) => `<li><b>${esc(o.id)}</b> ${o.logins.slice(0, 8).map(nick).join(", ")}${o.logins.length > 8 ? " …" : ""} · монет ${num(o.coins)}${o.undone ? ' <span class="mw-tag">отменено</span>' : ""}
            ${pa && !o.undone ? `<button type="button" data-c="undo" data-id="${esc(o.id)}">Откатить</button>` : ""}<div class="mw-when">${esc(when(o.at))} · ${esc(o.by)} · ${o.chans.map(esc).join(", ")}${o.why ? " · " + esc(o.why) : ""}</div></li>`,
								)
								.join("")
						: '<li class="mw-muted">Изъятий ещё не было.</li>';
				} catch (e) {
					L.innerHTML = `<li class="mw-muted">${esc(e.message)}</li>`;
				}
			}
			f.addEventListener("submit", (e) => {
				e.preventDefault();
				doDry();
			});
			box.addEventListener("click", (e) => {
				const b = e.target.closest("[data-c]");
				if (!b) return;
				if (b.dataset.c === "trace") doTrace(false);
				else if (b.dataset.c === "to") doTrace(true);
				else if (b.dataset.c === "apply") doApply(b);
				else if (b.dataset.c === "undo") doUndo(b.dataset.id, b);
			});
			ops();
		},
	});
})();

(() => {
	const SCOPES = [
		["channel", "Мой канал"],
		["others", "Другие стримеры"],
		["all", "Вся игра"],
	];
	const SECS = [
		["mods", "Модераторы"],
		["admins", "Админы"],
		["streamers", "Стримеры"],
		["players", "Игроки"],
	];
	const SRC = {
		site: "назначен на сайте",
		chat: "модератор чата",
		twitch: "модератор Twitch",
	};
	const ROLE = { pa: "админ игры", admin: "админ канала", mod: "модератор" };

	window.LGModWin.addTab("com", {
		render(box, api) {
			const esc = api.esc,
				pa = api.me.role === "pa";
			const S = {
				scope: "channel",
				sec: "mods",
				q: "",
				ch: "",
				next: null,
				seq: 0,
			};
			box.innerHTML = `<h2>Сообщество</h2>
        ${pa ? `<div class="mw-com-seg" role="tablist" aria-label="Чьи игроки">${SCOPES.map(([k, t]) => `<button type="button" role="tab" data-scope="${k}">${esc(t)}</button>`).join("")}</div>` : ""}
        <div class="mw-com-ch" hidden></div>
        <div class="mw-com-seg mw-com-secs" role="tablist" aria-label="Раздел">${SECS.map(([k, t]) => `<button type="button" role="tab" data-sec="${k}">${esc(t)}</button>`).join("")}</div>
        <form class="mw-f mw-com-q" role="search"><input type="search" placeholder="Поиск по нику" aria-label="Поиск по нику" maxlength="25" autocomplete="off"><button type="submit">Найти</button></form>
        <div class="mw-com-add" hidden></div>
        <ul class="mw-list mw-com-list"></ul><button type="button" class="mw-more" data-com-more hidden>Ещё</button><p class="mw-msg" role="status"></p>`;
			const $ = (s) => box.querySelector(s),
				list = $(".mw-com-list"),
				more = $("[data-com-more]"),
				msg = $(".mw-msg");
			const say = (t, bad) => {
				msg.textContent = t || "";
				msg.classList.toggle("bad", !!bad);
			};

			function marks() {
				for (const b of box.querySelectorAll("[data-scope]")) {
					const on = b.dataset.scope === S.scope;
					b.classList.toggle("on", on);
					b.setAttribute("aria-selected", String(on));
				}
				for (const b of box.querySelectorAll("[data-sec]")) {
					const on = b.dataset.sec === S.sec;
					b.classList.toggle("on", on);
					b.setAttribute("aria-selected", String(on));
				}

				$(".mw-com-secs").hidden = S.scope === "others" && !S.ch;
				const chb = $(".mw-com-ch");
				chb.hidden = !(S.scope === "others" && S.ch);
				if (!chb.hidden)
					chb.innerHTML = `<button type="button" data-com-back>← Все стримеры</button> <b>${esc(S.ch)}</b>`;
			}
			const seen = (t) => (t ? `был ${esc(api.when(t))}` : "");
			function row(x, r) {
				if (r.scope === "others" && !r.ch)
					return `<li class="mw-pick" data-com-ch="${esc(x.ch)}" tabindex="0" role="button"><b>${esc(x.name || x.l)}</b> <span class="mw-tag">игроков ${esc(x.n)}</span></li>`;
				const tags = [];
				if (x.hero)
					tags.push(`<span class="mw-tag">ур. ${esc(x.hero.lv)}</span>`);
				if (x.role)
					tags.push(
						`<span class="mw-tag">${esc(ROLE[x.role] || x.role)}</span>`,
					);
				for (const s of x.src || [])
					tags.push(`<span class="mw-tag">${esc(SRC[s] || s)}</span>`);
				if (x.off) tags.push('<span class="mw-tag bad">снят стримером</span>');
				if (x.ban)
					tags.push('<span class="mw-tag bad">бан во всей игре</span>');
				if (x.ch && r.scope === "all")
					tags.push(`<span class="mw-tag">${esc(x.ch)}</span>`);

				const btn = [];
				if (r.sec === "mods" && r.can && r.can.manage) {
					if ((x.src || []).includes("chat"))
						btn.push(
							`<button type="button" data-com-a="unmod" data-l="${esc(x.l)}">Снять модератора чата</button>`,
						);
					if ((x.src || []).includes("twitch") && x.uid)
						btn.push(
							`<button type="button" data-com-a="tw" data-uid="${esc(x.uid)}" data-off="${x.off ? 0 : 1}">${x.off ? "Вернуть права" : "Снять права"}</button>`,
						);
				}
				return `<li>${api.nick(x.l)}${x.name && x.name.toLowerCase() !== x.l ? ` <span class="mw-muted">${esc(x.name)}</span>` : ""} ${tags.join(" ")}${btn.join("")}${x.seen ? `<div class="mw-when">${seen(x.seen)}</div>` : ""}</li>`;
			}
			async function load(add) {
				const seq = ++S.seq;
				const p = new URLSearchParams({ scope: S.scope, sec: S.sec });
				if (S.q) p.set("q", S.q);
				if (S.ch) p.set("ch", S.ch);
				if (add && S.next) p.set("after", S.next);
				if (!add) list.innerHTML = '<li class="mw-muted">Загрузка…</li>';
				try {
					const r = await api.modc("/community?" + p);
					if (seq !== S.seq || !api.alive(box)) return;
					const h = r.list.map((x) => row(x, r)).join("");
					if (add) list.insertAdjacentHTML("beforeend", h);
					else
						list.innerHTML =
							h ||
							`<li class="mw-muted">${S.q ? "Никого с таким началом ника." : "Пусто."}</li>`;
					if (
						!add &&
						r.sec === "mods" &&
						r.scope === "channel" &&
						r.twitch === false
					)
						list.insertAdjacentHTML(
							"beforeend",
							'<li class="mw-muted">Список модераторов Twitch не получен: стример не дал игре право читать модераторов (moderation:read) или список ещё не обновился.</li>',
						);
					S.next = r.next;
					more.hidden = !r.next;

					const addb = $(".mw-com-add");
					addb.hidden = !(
						r.sec === "mods" &&
						r.scope === "channel" &&
						r.can &&
						r.can.manage &&
						api.ctx.role() === "own"
					);
					if (!addb.hidden && !addb.firstChild)
						addb.innerHTML =
							'<form class="mw-f" data-com-addf><input placeholder="ник нового модератора чата" aria-label="Ник нового модератора чата" maxlength="26" autocomplete="off"><button type="submit">Назначить</button></form>';
				} catch (e) {
					if (seq === S.seq && api.alive(box)) {
						list.innerHTML = `<li class="mw-muted">${esc(e.message)}</li>`;
						more.hidden = true;
					}
				}
			}
			function go() {
				S.next = null;
				marks();
				load(false);
			}

			box.addEventListener("click", async (e) => {
				const sc = e.target.closest("[data-scope]");
				if (sc) {
					S.scope = sc.dataset.scope;
					S.ch = "";
					if (S.scope === "all" && S.sec === "mods") S.sec = "players";
					go();
					return;
				}
				const se = e.target.closest("[data-sec]");
				if (se) {
					S.sec = se.dataset.sec;
					go();
					return;
				}
				const ch = e.target.closest("[data-com-ch]");
				if (ch) {
					S.ch = ch.dataset.comCh;
					S.sec = "players";
					go();
					return;
				}
				if (e.target.closest("[data-com-back]")) {
					S.ch = "";
					go();
					return;
				}
				if (e.target.closest("[data-com-more]")) {
					load(true);
					return;
				}
				const a = e.target.closest("[data-com-a]");
				if (!a) return;
				a.disabled = true;
				try {
					if (a.dataset.comA === "unmod") {
						const ok = await api.ctx.act("unmod", {
							login: a.dataset.l,
							n: a.dataset.l,
							sure: true,
						});
						say(
							ok ? `${a.dataset.l} больше не модератор чата` : "Не вышло",
							!ok,
						);
					} else {
						await api.post("/team", {
							uid: a.dataset.uid,
							off: a.dataset.off === "1",
						});
						say(
							a.dataset.off === "1"
								? "Права модератора Twitch на сайте сняты"
								: "Права модератора Twitch возвращены",
						);
					}
					go();
				} catch (err) {
					say(err.message, true);
					a.disabled = false;
				}
			});
			box.addEventListener("keydown", (e) => {
				if (
					e.key === "Enter" &&
					e.target.matches &&
					e.target.matches("[data-com-ch]")
				)
					e.target.click();
			});
			box.addEventListener("submit", async (e) => {
				e.preventDefault();
				e.stopPropagation();
				const f = e.target;
				if (f.matches("[data-com-addf]")) {
					const l = String(f.querySelector("input").value || "")
						.trim()
						.replace(/^@/, "")
						.toLowerCase();
					if (!l) return;
					const ok = await api.ctx.act("mod", { login: l, n: l, sure: true });
					say(ok ? `${l} - модератор чата` : "Не вышло", !ok);
					if (ok) {
						f.reset();
						go();
					}
					return;
				}
				S.q = String($(".mw-com-q input").value || "")
					.trim()
					.replace(/^@/, "")
					.toLowerCase();
				go();
			});
			go();
		},
	});
})();

(() => {
	const KR = {
		chat: "бан чата",
		channel: "тюрьма канала",
		platform: "бан во всей игре",
	};
	const ST = { new: "новое", lifted: "бан снят", rejected: "отказано" };
	const RK = { dm: "личка", name: "название гильдии", chat: "чат гильдии" };
	const S = { sec: "ap", st: "new" };

	function render(box, api) {
		const esc = api.esc;
		box.innerHTML = `<h2>Запросы на снятие блокировки</h2>
      <div class="mw-req-bar"><div class="mw-req-seg" role="tablist" aria-label="Раздел">
        <button type="button" data-sec="ap" role="tab">Обжалования</button><button type="button" data-sec="rp" role="tab">Жалобы</button></div>
        <div class="mw-req-seg" role="tablist" aria-label="Какие"><button type="button" data-st="new" role="tab">Новые</button><button type="button" data-st="done" role="tab">Разобранные</button></div></div>
      <ul class="mw-list mw-req-l"><li class="mw-muted">Загрузка…</li></ul><p class="mw-msg mw-req-msg" role="status"></p>`;
		const list = box.querySelector(".mw-req-l"),
			msg = box.querySelector(".mw-req-msg");
		const say = (t, bad) => {
			msg.textContent = t || "";
			msg.classList.toggle("bad", !!bad);
		};
		const seg = () => {
			for (const b of box.querySelectorAll("[data-sec]")) {
				const on = b.dataset.sec === S.sec;
				b.classList.toggle("on", on);
				b.setAttribute("aria-selected", String(on));
			}
			for (const b of box.querySelectorAll("[data-st]")) {
				const on = b.dataset.st === S.st;
				b.classList.toggle("on", on);
				b.setAttribute("aria-selected", String(on));
			}
		};
		const apLi = (a) => {
			const head = `<div class="mw-req-h"><span class="mw-tag ${a.kind === "platform" ? "bad" : "warn"}">${esc(KR[a.kind] || a.kind)}</span> ${api.nick(a.l)}${a.ch && a.ch !== api.ch ? ` <span class="mw-tag">${esc(a.ch)}</span>` : ""}
        ${a.st !== "new" ? `<span class="mw-tag${a.st === "lifted" ? " ok" : ""}">${esc(ST[a.st] || a.st)}</span>` : ""}<span class="mw-when">${esc(api.when(a.at))}</span></div>`;
			const body = `<div class="mw-t mw-req-q">${esc(a.text)}</div>${a.kind === "channel" && a.st === "new" && "until" in a ? `<div class="mw-when">тюрьма ${esc(api.until(a.until))}</div>` : ""}`;
			if (a.st !== "new")
				return `<li class="mw-req-i">${head}${body}${a.answer ? `<div><b>Ответ:</b> ${esc(a.answer)}</div>` : ""}<div class="mw-when">${a.by ? "решил " + esc(a.by) + " · " : ""}${esc(api.when(a.done))}</div></li>`;
			if (!a.can)
				return `<li class="mw-req-i">${head}${body}<div class="mw-muted">${a.kind === "platform" ? "Бан во всей игре снимает только админ игры." : "Этот бан снимает стример или админ канала."}</div></li>`;
			return `<li class="mw-req-i" data-ap="${esc(a.id)}">${head}${body}
        <form class="mw-req-f" data-f="ap"><input name="answer" maxlength="300" placeholder="ответ игроку (для отказа - обязательно)" aria-label="Ответ игроку">
        <button type="submit" data-op="lift">Снять бан</button><button type="submit" class="bad" data-op="reject">Отказать</button></form></li>`;
		};
		const snapHtml = (r) => {
			const L = Array.isArray(r.snap)
				? r.snap
				: r.snap && Array.isArray(r.snap.list)
					? r.snap.list
					: [];
			const one = (x) =>
				`<li><b>${esc(x.fl || x.l || x.from_login || x.n || "")}</b> ${esc(x.t || x.text || "")}</li>`;
			if (r.src === "guild" && r.kind === "name" && r.snap)
				return `<div class="mw-when">название: «${esc(r.snap.name || "")}»${r.snap.tag ? " [" + esc(r.snap.tag) + "]" : ""}</div>`;
			return L.length
				? `<details><summary>Переписка (${L.length})</summary><ul class="mw-req-snap">${L.map(one).join("")}</ul></details>`
				: "";
		};
		const rpLi = (r) => {
			const head = `<div class="mw-req-h"><span class="mw-tag">${esc(RK[r.kind] || r.kind)}${r.guild ? " · " + esc(r.guild) : ""}</span> на ${r.l ? api.nick(r.l) : "-"} от ${esc(r.from)}
        ${r.st === "done" ? `<span class="mw-tag${r.res === "done" ? " ok" : ""}">${r.res === "reject" ? "отклонена" : "приняты меры"}</span>` : r.taken ? `<span class="mw-tag warn">взял ${esc(r.taken.by)}</span>` : ""}<span class="mw-when">${esc(api.when(r.at))}</span></div>`;
			const body = `${r.reason ? `<div class="mw-t">${esc(r.reason)}</div>` : ""}${snapHtml(r)}`;
			if (r.st === "done")
				return `<li class="mw-req-i">${head}${body}${r.note ? `<div><b>Заметка:</b> ${esc(r.note)}</div>` : ""}<div class="mw-when">${r.doneBy ? esc(r.doneBy) + " · " : ""}${esc(api.when(r.done))}</div></li>`;
			return `<li class="mw-req-i" data-rp="${esc(r.id)}" data-src="${esc(r.src)}">${head}${body}
        <form class="mw-req-f" data-f="rp">${r.taken && r.taken.by === api.me.me ? "" : '<button type="button" data-op="take">Взять</button>'}<input name="note" maxlength="200" placeholder="заметка" aria-label="Заметка">
        <button type="submit" data-op="done">Принять меры</button><button type="submit" class="bad" data-op="reject">Отклонить</button></form></li>`;
		};
		async function load() {
			seg();
			say("");
			list.innerHTML = '<li class="mw-muted">Загрузка…</li>';
			try {
				const j = await api.modc(
					(S.sec === "ap" ? "/appeals" : "/reports") + "?st=" + S.st,
				);
				if (!api.alive(list)) return;
				list.innerHTML = j.list.length
					? j.list.map(S.sec === "ap" ? apLi : rpLi).join("")
					: `<li class="mw-muted">${S.st === "new" ? (S.sec === "ap" ? "Новых обжалований нет." : "Новых жалоб нет.") : "Пусто."}</li>`;
			} catch (e) {
				if (api.alive(list))
					list.innerHTML = `<li class="mw-muted">${esc(e.message)}</li>`;
			}
		}
		box.addEventListener("click", (e) => {
			const s = e.target.closest("[data-sec]"),
				t = e.target.closest("[data-st]");
			if (s) {
				S.sec = s.dataset.sec;
				load();
				return;
			}
			if (t) {
				S.st = t.dataset.st;
				load();
				return;
			}
			const tk = e.target.closest('[data-op="take"]');
			if (tk) {
				const li = tk.closest("[data-rp]");
				act(
					{ src: li.dataset.src, id: li.dataset.rp, op: "take" },
					tk,
					"/reports",
				);
			}
		});
		box.addEventListener("submit", (e) => {
			const f = e.target.closest(".mw-req-f");
			if (!f) return;
			e.preventDefault();
			const op = (e.submitter && e.submitter.dataset.op) || "done",
				btn = e.submitter || f.querySelector('button[type="submit"]');
			if (f.dataset.f === "ap") {
				const li = f.closest("[data-ap]"),
					answer = String(f.elements.answer.value || "").trim();
				if (op === "reject" && !answer) {
					say("Напиши игроку, почему отказ.", true);
					f.elements.answer.focus();
					return;
				}
				act({ id: li.dataset.ap, op, answer }, btn, "/appeals");
			} else {
				const li = f.closest("[data-rp]");
				act(
					{
						src: li.dataset.src,
						id: li.dataset.rp,
						op,
						note: String(f.elements.note.value || "").trim(),
					},
					btn,
					"/reports",
				);
			}
		});
		async function act(body, btn, path) {
			if (btn) btn.disabled = true;
			try {
				await api.post(path, body);
				say(
					{
						lift: "Бан снят, игрок увидит ответ.",
						reject:
							path === "/appeals"
								? "Отказано, игрок увидит ответ."
								: "Жалоба отклонена.",
						take: "Жалоба взята.",
						done: "Отмечено: приняты меры.",
					}[body.op] || "Готово.",
				);
				await load();
			} catch (e) {
				say(e.message, true);
				if (btn) btn.disabled = false;
			}
		}
		load();
	}
	window.LGModWin.addTab("req", { render });
})();

(() => {
	const SEEN_KEY = "lgModSusSeen";
	const SUBS = [
		["bots", "Боты"],
		["repeat", "Частые нарушители"],
		["links", "Связи"],
	];
	const KIND = {
		mute: "мут",
		chatban: "бан чата",
		dmban: "закрыта личка",
		purge: "удалены сообщения",
		ban: "тюрьма",
		pban: "бан во всей игре",
		spam: "спам-фильтр",
	};
	const S = { sub: "bots", all: false, days: 30, seq: 0 };
	const seenGet = () => {
		try {
			return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || "[]"));
		} catch (e) {
			console.warn("[модерация] список просмотренных недоступен", e);
			return new Set();
		}
	};
	const seenPut = (set) => {
		try {
			localStorage.setItem(SEEN_KEY, JSON.stringify([...set].slice(-500)));
		} catch (e) {
			console.warn("[модерация] список просмотренных не сохранился", e);
		}
	};

	function render(box, api) {
		const esc = api.esc;
		box.innerHTML = `<div class="mw-sus-h"><h2>Подозрительные</h2><span class="mw-sus-new" hidden></span></div>
      <p class="mw-muted">Только подсвечивает - решает человек: откройте карточку игрока и посмотрите сами.</p>
      <div class="mw-sus-subs" role="tablist" aria-label="Что показать">${SUBS.map(([k, t]) => `<button type="button" role="tab" data-sub="${k}" aria-selected="${S.sub === k}">${esc(t)}</button>`).join("")}</div>
      <form class="mw-f mw-sus-f">
        <select name="ch" aria-label="Канал"><option value="">этот канал</option><option value="*"${S.all ? " selected" : ""}>все каналы</option></select>
        <select name="days" aria-label="За какое время" ${S.sub === "repeat" ? "" : "hidden"}>${[7, 30, 90, 180].map((d) => `<option value="${d}"${S.days === d ? " selected" : ""}>${d} дн.</option>`).join("")}</select>
        <button type="submit">Показать</button>
      </form>
      <div class="mw-sus-out"><p class="mw-muted">Загрузка…</p></div>`;
		box.querySelector(".mw-sus-subs").addEventListener("click", (e) => {
			const b = e.target.closest("[data-sub]");
			if (!b) return;
			S.sub = b.dataset.sub;
			for (const x of box.querySelectorAll("[data-sub]"))
				x.setAttribute("aria-selected", String(x === b));
			box.querySelector('[name="days"]').hidden = S.sub !== "repeat";
			load(box, api);
		});
		box.querySelector(".mw-sus-f").addEventListener("submit", (e) => {
			e.preventDefault();
			const f = e.target;
			S.all = f.elements.ch.value === "*";
			S.days = +f.elements.days.value || 30;
			load(box, api);
		});
		load(box, api);
	}

	async function load(box, api) {
		const out = box.querySelector(".mw-sus-out"),
			seq = ++S.seq;
		out.innerHTML = `<p class="mw-muted">${S.sub === "bots" && S.all ? "Спрашиваю комнаты каналов…" : "Загрузка…"}</p>`;
		try {
			const j = await api.modc(
				`/suspects?view=${S.sub}${S.all ? "&ch=*" : ""}${S.sub === "repeat" ? "&days=" + S.days : ""}`,
			);
			if (seq !== S.seq || !api.alive(box)) return;
			out.innerHTML =
				S.sub === "bots"
					? bots(j, api, box)
					: S.sub === "repeat"
						? repeat(j, api)
						: links(j, api);
		} catch (e) {
			if (seq === S.seq && api.alive(box))
				out.innerHTML = `<p class="mw-muted">${api.esc(e.message)}</p>`;
		}
	}

	function bots(j, api, box) {
		const esc = api.esc,
			seen = seenGet(),
			fresh = (j.hi || []).filter((l) => !seen.has(l));
		const nb = box.querySelector(".mw-sus-new");
		nb.hidden = !fresh.length;
		nb.textContent = `новых с 60+: ${fresh.length}`;

		if (fresh.length) {
			for (const l of fresh) seen.add(l);
			seenPut(seen);
		}
		const head =
			`<p class="mw-muted">Оценка «бот» шахты${j.date ? ` за сутки ${esc(j.date)}` : ""}: 30-59 - присмотреться, 60+ - похоже на бота.${j.chans && j.chans.length > 1 ? ` Каналы: ${j.chans.map(esc).join(", ")}.` : ""}${j.limited ? " Показаны не все активные каналы." : ""}</p>` +
			(j.errors && j.errors.length
				? `<p class="mw-muted">Нет данных: ${j.errors.map(esc).join("; ")}</p>`
				: "");
		if (!j.rows.length)
			return head + '<p class="mw-muted">Никого с оценкой 30+.</p>';
		return (
			head +
			`<ul class="mw-list mw-sus-l">${j.rows
				.map(
					(x) => `<li class="${x.hi ? "hi" : ""}">
      <b class="mw-sus-s${x.hi ? " hi" : ""}" title="оценка «бот» из 100">${esc(x.s)}</b>${api.nick(x.l)}
      ${fresh.includes(x.l) ? '<span class="mw-tag warn">новый</span>' : ""}${x.sure ? '<span class="mw-tag bad">похож наверняка</span>' : ""}${x.flagged ? '<span class="mw-tag bad">отмечен «бот»</span>' : ""}${x.human ? '<span class="mw-tag">«Это человек»</span>' : ""}
      <span class="mw-muted">${esc(String(x.h).replace(".", ","))} ч${x.chans.length > 1 || S.all ? " · " + x.chans.map(esc).join(", ") : ""}</span>
      ${x.why.length ? `<div class="mw-t">${x.why.map(esc).join("; ")}</div>` : ""}</li>`,
				)
				.join("")}</ul>`
		);
	}

	function repeat(j, api) {
		const esc = api.esc;
		const head = `<p class="mw-muted">Наказания из журнала модерации${S.all ? " всех каналов" : " этого канала"} и сработки спам-фильтра этого канала за ${esc(j.days)} дн. (снятия не считаются).${j.full ? " Записей много - показаны последние." : ""}</p>`;
		if (!j.rows.length)
			return head + '<p class="mw-muted">Повторных нарушителей нет.</p>';
		const c = (n, t, cls) =>
			n ? `<span class="mw-tag${cls ? " " + cls : ""}">${t} ${n}</span>` : "";
		return (
			head +
			`<ul class="mw-list mw-sus-l">${j.rows
				.map(
					(x) => `<li>
      <b class="mw-sus-s" title="записей">${esc(x.n)}</b>${api.nick(x.l)}${c(x.ban, "тюрьма / бан", "bad")}${c(x.mute, "мут / бан чата", "warn")}${c(x.purge, "удалены", "")}${c(x.spam, "спам", "")}
      ${x.chans.length ? `<span class="mw-muted">каналов: ${x.chans.length}${x.chans.length <= 4 ? " (" + x.chans.map(esc).join(", ") + ")" : ""}</span>` : ""}
      <div class="mw-when">последнее: ${esc(KIND[x.last.kind] || x.last.kind)} · ${esc(api.when(x.last.at))}${x.last.reason ? " · " + esc(x.last.reason) : ""}</div></li>`,
				)
				.join("")}</ul>`
		);
	}

	function links(j, api) {
		const esc = api.esc,
			out = [];
		out.push(
			`<p class="mw-muted">Журнал передач (обмен, монета дня, аукцион) за ${esc(j.days)} дн.${S.all ? ", все каналы" : ", этот канал"}: ${esc(j.n)} передач${j.full ? " (показаны последние)" : ""}. Только игровые признаки.</p>`,
		);
		out.push(
			"<h3>Копилки - много разных отправителей у одного получателя</h3>",
		);
		out.push(
			j.piggy.length
				? `<ul class="mw-list mw-sus-l">${j.piggy
						.map(
							(
								x,
							) => `<li><b class="mw-sus-s" title="разных отправителей">${esc(x.senders)}</b>${api.nick(x.l)}${x.isNew != null ? '<span class="mw-tag warn">новый аккаунт</span>' : ""}
      <div class="mw-t">${esc(x.why)}</div><div class="mw-when">от: ${x.from.map((l) => api.nick(l)).join(", ")}</div></li>`,
						)
						.join("")}</ul>`
				: '<p class="mw-muted">Нет.</p>',
		);
		out.push("<h3>Пары - часто передают друг другу</h3>");
		out.push(
			j.pairs.length
				? `<ul class="mw-list mw-sus-l">${j.pairs
						.map(
							(
								x,
							) => `<li><b class="mw-sus-s" title="передач">${esc(x.n)}</b>${api.nick(x.a)} ↔ ${api.nick(x.b)}${x.oneWay ? '<span class="mw-tag bad">в одну сторону</span>' : ""}${x.isNew ? '<span class="mw-tag warn">новый аккаунт</span>' : ""}
      <div class="mw-t">${esc(x.why)}</div></li>`,
						)
						.join("")}</ul>`
				: '<p class="mw-muted">Нет.</p>',
		);
		out.push("<h3>Новые аккаунты Twitch среди участников передач</h3>");
		out.push(
			j.fresh.length
				? `<ul class="mw-list mw-sus-l">${j.fresh.map((x) => `<li><b class="mw-sus-s" title="дней аккаунту">${esc(x.days)}д</b>${api.nick(x.l)}<div class="mw-t">${esc(x.why)}</div></li>`).join("")}</ul>`
				: '<p class="mw-muted">Нет.</p>',
		);
		return out.join("");
	}

	window.LGModWin.addTab("sus", { render });
})();
