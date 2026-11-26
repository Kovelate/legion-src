(() => {
	if (window.LGMailWin2) return;
	let X = null,
		W = null,
		data = null,
		FD = null,
		sel = "",
		mode = "view",
		flt = "sys",
		phoneView = "list",
		form = {},
		err = "",
		askState = null,
		gotState = null,
		busy = false,
		lastFocus = null,
		ttm = 0;
	const FL = {};
	const FLP = {};
	let lastView = "";
	const CAT = {};
	const $ = (s, r) => (r || (W && W.el) || document).querySelector(s);
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
	const api = (p, body) => X.api(p, body);
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
		let s = "legion";
		try {
			s = String(
				(window.MDDoodle && window.MDDoodle.active) ||
					(window.LG_STYLES && window.LG_STYLES[0]) ||
					"legion",
			);
		} catch (e) {
			s = "legion";
		}
		return GST.includes(s) ? s : "legion";
	};
	const phone = () => {
		try {
			return window.matchMedia("(max-width: 640px)").matches;
		} catch (e) {
			return window.innerWidth <= 640;
		}
	};
	const DAYS = 864e5;
	const KIND = {
		game: "Игра",
		admin: "Администратор",
		streamer: "Стример",
		guild: "Гильдия",
		player: "Игрок",
	};
	const KC = {
		game: "#ffd24a",
		admin: "#ff9b7a",
		streamer: "#c9a2ff",
		guild: "#8fdc7e",
		player: "#8cc4ff",
	};
	const KI = {
		game: '<svg viewBox="0 0 24 24"><path d="M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6z"/><path d="M9 12l2 2 4-4"/></svg>',
		admin:
			'<svg viewBox="0 0 24 24"><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z"/></svg>',
		streamer:
			'<svg viewBox="0 0 24 24"><rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3"/></svg>',
		guild:
			'<svg viewBox="0 0 24 24"><path d="M5 21V4"/><path d="M5 4h12l-2 4 2 4H5"/></svg>',
	};
	const SW =
		'<svg viewBox="0 0 24 24"><path d="M14.5 17.5L3 6V3h3l11.5 11.5"/><path d="M13 19l6-6M16 16l4 4M19 21l2-2"/><path d="M9.5 6.5L13 3h3v3l-3.5 3.5"/><path d="M5 14l4 4M7 17l-3 3M3 19l2 2"/></svg>';
	const CLIP =
		'<svg viewBox="0 0 24 24"><path d="M15 7l-6.5 6.5a2 2 0 0 0 3 3L18 10a4 4 0 0 0-6-6l-6.5 6.5a6 6 0 0 0 9 9L20 14"/></svg>';
	const RB = {
		common: ["#efe9dc", "#b9ae9c"],
		uncommon: ["#e2f4d9", "#7ad36b"],
		rare: ["#dcebff", "#62aefc"],
		epic: ["#f0e3ff", "#b783ff"],
		legendary: ["#fff0cf", "#ffad45"],
	};
	const RN = {
		common: "обычная",
		uncommon: "необычная",
		rare: "редкая",
		epic: "эпическая",
		legendary: "легендарная",
	};
	const ROLE = {
		legionary: "Легионер",
		paladin: "Паладин",
		rogue: "Разбойник",
		archer: "Лучник",
		mage: "Маг",
		priest: "Жрец",
		necromancer: "Некромант",
		recruit: "Новобранец",
	};
	const TIER = ["слабая стая", "обычная стая", "сильная стая"];
	const TABS = [
		["fight", "Бой"],
		["guild", "Гильдия"],
		["pl", "От игроков"],
		["sys", "Система"],
	];
	const pad = (n) => String(n).padStart(2, "0");
	const pl = (n, a, b, c) => {
		n = Math.abs(Math.floor(+n || 0));
		const m = n % 10,
			h = n % 100;
		return m === 1 && h !== 11
			? a
			: m >= 2 && m <= 4 && (h < 10 || h >= 20)
				? b
				: c;
	};
	const when = (t) => {
		const d = new Date(t),
			n = new Date();
		if (d.toDateString() === n.toDateString())
			return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
		const y = new Date(Date.now() - DAYS);
		if (d.toDateString() === y.toDateString()) return "вчера";
		return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}`;
	};
	const whenFull = (t) => {
		const d = new Date(t);
		return `${pad(d.getDate())}.${pad(d.getMonth() + 1)} в ${pad(d.getHours())}:${pad(d.getMinutes())}`;
	};
	const coinsTxt = (v) => {
		v = Math.max(0, Math.floor(+v || 0));
		const g = Math.floor(v / 10000),
			s = Math.floor(v / 100) % 100,
			b = v % 100,
			o = [];
		if (g) o.push(`${g} зол.`);
		if (s) o.push(`${s} сер.`);
		if (b || !o.length) o.push(`${b} бр.`);
		return o.join(" ");
	};
	const daysLeft = (m) => Math.max(0, Math.ceil((m.exp - Date.now()) / DAYS));

	const fid = (id) => "f:" + id;
	const isF = (k) => String(k || "").startsWith("f:");
	const hasFights = () => !!(data && data.fights);
	const tabOf = (m) =>
		m.k === "fight"
			? "fight"
			: m.k === "guild"
				? "guild"
				: m.k === "player"
					? "pl"
					: "sys";
	const tabs = () => TABS.filter(([k]) => k !== "fight" || hasFights());
	function all() {
		const L = ((data && data.list) || []).slice();
		if (hasFights() && FD && FD.list)
			for (const f of FD.list)
				L.push({ ...f, id: fid(f.id), fidRaw: f.id, k: "fight" });
		return L;
	}
	const inTab = (k) =>
		all()
			.filter((m) => tabOf(m) === k)
			.sort((a, b) => b.at - a.at);
	const cur = () => all().find((m) => m.id === sel) || null;
	const unreadIn = (k) =>
		k === "fight"
			? FD
				? FD.list.filter((m) => !m.read).length
				: data && data.fights
					? data.fights.unread || 0
					: 0
			: inTab(k).filter((m) => !m.read).length;
	const unreadAll = () => tabs().reduce((a, [k]) => a + unreadIn(k), 0);
	const waitOf = (m) => m.att === "wait";

	const itemArt = (id) => {
		const it = CAT[id];
		if (!it) return "";
		try {
			const INV = window.LGInventory;
			return INV && INV.art ? INV.art(it) : "";
		} catch (e) {
			console.warn("[почта] рисунок вещи", id, e);
			return "";
		}
	};
	const mon = (id) => {
		try {
			return window.LGCityMonArt && id ? window.LGCityMonArt.fig(id, {}) : "";
		} catch (e) {
			return "";
		}
	};
	const coinCell = (c) => {
		const G = Math.floor(c / 10000),
			S = Math.floor(c / 100) % 100,
			B = c % 100;
		return `<span class="ai" title="${esc(coinsTxt(c))}"><span class="pic" style="--rb:#fff4d6;--rr:#e0a43a"><span class="coinp">${G ? '<i class="c-g"></i>' : ""}${S ? '<i class="c-s"></i>' : ""}${B || (!G && !S) ? '<i class="c-b"></i>' : ""}</span></span><b>${esc(coinsTxt(c))}</b></span>`;
	};
	const itemCell = (id, n, name) => {
		const it = CAT[id] || { name: name || id, rarity: "common" },
			[b, r] = RB[it.rarity] || RB.common,
			a = itemArt(id);
		return `<span class="ai r-${esc(it.rarity || "common")}" title="${esc(it.name)}${RN[it.rarity] ? ` - ${RN[it.rarity]}` : ""}${it.desc ? ". " + esc(it.desc) : ""}"><span class="pic" style="--rb:${b};--rr:${r}">${a || '<span class="ml2-fb" aria-hidden="true">?</span>'}</span><b>${esc(it.name || name || id)}</b>${n > 1 ? `<span class="q">×${esc(n)}</span>` : ""}</span>`;
	};
	const tokCell = (n) =>
		`<span class="ai" title="Жетоны навыков - мимо недельного предела"><span class="pic" style="--rb:#efe3ff;--rr:#8b5cf6"><span class="tok">✦</span></span><b>Жетоны навыков</b>${n > 1 ? `<span class="q">×${esc(n)}</span>` : ""}</span>`;
	const avatar = (m) =>
		m.k === "fight"
			? `<span class="av" style="--kc:${m.win ? "#8fdc7e" : "#ff8a7a"}" aria-hidden="true">${SW}</span>`
			: `<span class="av" style="--kc:${KC[m.k] || "#ddd"}" aria-hidden="true">${
					KI[m.k] ||
					esc(
						String(m.fn || "?")
							.slice(0, 1)
							.toUpperCase(),
					)
				}</span>`;
	const fightName = (m) => {
		const p = m.place || {};
		const t =
			m.kind === "elite"
				? `Элитный${p.en ? ` «${p.en}»` : ""}`
				: TIER[p.tier == null ? 1 : p.tier] || "стая";
		return t[0].toUpperCase() + t.slice(1);
	};

	function listHtml() {
		const L = inTab(flt);
		const canTake = L.some((m) => !m.read || waitOf(m)),
			canDel = L.some((m) => m.read && !waitOf(m) && m.att !== "busy");
		const row = (m) => {
			const on = m.id === sel && mode === "view";
			if (m.k === "fight") {
				const p = m.place || {};
				return (
					`<li><button type="button" class="mit${on ? " sel" : ""}${m.read ? "" : " new"}" data-open="${esc(m.id)}"${on ? ' aria-current="true"' : ""}>${avatar(m)}<span class="fr"><b>${esc(fightName(m))}</b><small class="${m.win ? "win" : "lose"}">${m.win ? "победа" : "поражение"}</small></span><span class="at">${esc(when(m.at))}</span>` +
					`<span class="tt"><span>${m.read ? "" : '<span class="sr-only">Не прочитано: </span>'}${esc(p.bn || "У стен города")}${p.lvl ? ` · ${esc(p.lvl)} ур.` : ""} · ${m.sq ? `разбито ${esc(m.sq.beat)} из ${esc(m.sq.n)}` : `${esc(m.rounds || 0)} ${pl(m.rounds, "раунд", "раунда", "раундов")}`}</span></span></button></li>`
				);
			}
			const clip =
				m.att === "wait"
					? `<span class="clip">${CLIP}вложение</span>`
					: m.att === "busy"
						? `<span class="clip busy">${CLIP}забирается</span>`
						: m.att === "taken"
							? `<span class="clip done">${CLIP}забрано</span>`
							: "";
			return (
				`<li><button type="button" class="mit${on ? " sel" : ""}${m.read ? "" : " new"}" data-open="${esc(m.id)}"${on ? ' aria-current="true"' : ""}>${avatar(m)}` +
				`<span class="fr"><b>${esc(m.fn)}</b><small>${esc(KIND[m.k] || "")}</small></span><span class="at">${esc(when(m.at))}</span>` +
				`<span class="tt"><span>${m.read ? "" : '<span class="sr-only">Не прочитано: </span>'}${esc(m.title)}</span>${clip}</span></button></li>`
			);
		};
		const empty =
			flt === "fight"
				? "Боёв пока нет. После боя у стен города сюда придёт письмо с итогом и записью боя."
				: !data || !data.list
					? "Загрузка…"
					: "Здесь пока пусто.";
		return (
			`<div class="mfl" role="tablist" aria-label="Разделы почты">${tabs()
				.map(([k, n]) => {
					const c = unreadIn(k);
					return `<button type="button" role="tab" data-f="${k}" aria-selected="${k === flt}" aria-pressed="${k === flt}">${n}${c ? `<span class="nb" aria-label="новых ${c}">${c}</span>` : ""}</button>`;
				})
				.join("")}</div>` +
			(L.length
				? `<ul class="mul">${L.map(row).join("")}</ul>`
				: `<p class="mempty">${esc(empty)}</p>`) +
			`<div class="mbot"><button type="button" class="mlink" data-takeall${canTake ? "" : ' aria-disabled="true"'}><svg viewBox="0 0 24 24"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>Забрать всё</button>` +
			`<button type="button" class="mlink" data-delread${canDel ? "" : ' aria-disabled="true"'}><svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>Удалить прочитанное</button></div>`
		);
	}

	const pct = (v) => `${Math.round(+v || 0)}%`;
	function heroCard(u, i) {
		const hp1 = u.hp1 != null ? u.hp1 : u.hp0,
			st = [
				["Атака", u.mag > u.atk ? null : u.atk],
				["Магия", u.mag > u.atk ? u.mag : null],
				["Броня", u.def],
				["Крит", u.crit != null ? pct(u.crit) : null],
				["Уклон", u.dodge != null ? pct(u.dodge) : null],
				["Удача", u.luck != null ? Math.round(u.luck) : null],
			].filter((x) => x[1] != null);
		return (
			`<li class="fu${i ? "" : " me"}"><div class="fh"><b>${esc(u.name)}</b><span>${esc(ROLE[u.cls] || u.cls || "")}${u.lvl ? `, ${esc(u.lvl)} ур.` : ""}</span></div>` +
			`<div class="fhp"><span>ХП ${esc(u.hp0)}${hp1 !== u.hp0 ? ` → ${esc(hp1)}` : ""} / ${esc(u.hpMax)}${u.fell ? " · пал" : ""}</span><span class="bar"><i style="width:${Math.max(0, Math.min(100, Math.round((100 * hp1) / Math.max(1, u.hpMax))))}%"></i></span></div>` +
			`${i ? "" : `<dl class="fst">${st.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>`}</li>`
		);
	}
	const foeCard = (f) =>
		`<li class="fu foe${f.elite ? " el" : ""}"><span class="fpic" aria-hidden="true">${mon(f.mon)}</span><div><div class="fh"><b>${esc(f.name)}</b><span>${esc(f.lvl)} ур.${f.elite ? " · элитный" : ""}</span></div><p>ХП ${esc(f.hp)} · удар ${esc(f.atk)} · броня ${esc(f.def)}${f.crit ? ` · крит ${pct(f.crit)}` : ""}${f.dodge ? ` · уклон ${pct(f.dodge)}` : ""}</p>${f.tr && f.tr.length ? `<p>${f.tr.map(esc).join(" · ")}</p>` : ""}</div></li>`;
	const CH_RES = {
		win: "отряд разбит",
		wipe: "группа пала",
		limit: "предел раундов - отряд устоял",
	};
	function chainHtml(h) {
		const K = h.sqs || (h.foes || []).length,
			list = h.chain || [];
		return `<ol class="fchain" aria-label="Бои с отрядами">${Array.from(
			{ length: K },
			(_, i) => {
				const c = list.find((x) => x.sq === i + 1);
				if (!c)
					return `<li class="skip">Бой ${i + 1}: отряд ${i + 1} - до него не дошли</li>`;
				return `<li class="${c.res === "win" ? "win" : "lose"}">Бой ${esc(c.n || i + 1)}: ${esc(CH_RES[c.res] || "")}${c.res === "win" ? "" : ` (осталось ${esc(c.s1)} из ${esc(c.smax)} ХП)`} · ${esc(c.rounds || 0)} ${pl(c.rounds || 0, "раунд", "раунда", "раундов")}</li>`;
			},
		).join("")}</ol>`;
	}
	const placeText = (m, p) => {
		p = p || {};
		const where = p.bn || "У стен города";
		return m.kind === "elite"
			? `${where} · элитный${p.en ? ` «${p.en}»` : ""}${p.lvl ? `, ${p.lvl} ур.` : ""} · группа из ${p.n || 1}`
			: `${where} · ${TIER[p.tier == null ? 1 : p.tier] || "стая"}${p.lvl ? `, ${p.lvl} ур.` : ""}`;
	};
	function fightHtml(m) {
		const F = FL[m.fidRaw];
		const back =
			'<button type="button" class="gl-btn ghost mback" data-back>← Бои</button>';
		if (!F && m.loadErr)
			return `${back}<p class="mempty">${esc(m.loadErr)}</p>`;

		if (!F)
			return lastView
				? `<div class="mload" aria-busy="true"><div class="mold" aria-hidden="true">${lastView}</div><p class="mlwait">Загрузка…</p></div>`
				: `${back}<p class="mempty">Загрузка…</p>`;
		const h = F.head || {},
			team = h.team || [],
			foes = h.foes || [],
			me = team[0] || null,
			rw = h.rw || null,
			chain = Array.isArray(h.chain);
		const got = rw
			? rw.over
				? "без награды - бои с наградой на сегодня кончились"
				: [
						rw.coins
							? `${rw.coins} ${pl(rw.coins, "монета", "монеты", "монет")}`
							: "",
						rw.xp ? `${rw.xp} опыта` : "",
						rw.item || rw.gearId ? "трофей" : "",
					]
						.filter(Boolean)
						.join(", ") || "без награды"
			: "без награды";
		const wound =
			!me || me.hp1 == null
				? ""
				: me.fell
					? `герой пал - остался 1 ХП из ${me.hpMax} (не призрак, вещи целы)`
					: me.hp1 < me.hp0
						? `раны: ${me.hp0} → ${me.hp1} ХП из ${me.hpMax}, заживут сами`
						: "без ран";
		return (
			`${back}<div class="fres ${F.win ? "win" : "lose"}" role="status"><h3>${F.win ? "Победа" : "Поражение"}</h3><span>${esc(whenFull(F.at))} · ${esc(h.rounds || 0)} ${pl(h.rounds || 0, "раунд", "раунда", "раундов")}${h.turns ? `, ${esc(h.turns)} ${pl(h.turns, "ход", "хода", "ходов")}` : ""}</span></div>` +
			`<p class="fplace">${esc(placeText(F, h.place))}</p>` +
			`<div class="fcols"><section class="fside ${F.win ? "won" : "lost"}"><h4>Твой отряд <small>${F.win ? "победитель" : "проигравший"}</small></h4><ul>${team.map(heroCard).join("")}</ul></section>` +
			`<section class="fside ${F.win ? "lost" : "won"}"><h4>${chain ? "Отряды элитного" : "Монстры"} <small>${F.win ? "проигравший" : "победитель"}</small></h4><ul>${foes.map(foeCard).join("")}</ul></section></div>` +
			(chain ? chainHtml(h) : "") +
			`<div class="fsum"><span><b>Награда:</b> ${esc(got)}</span>${wound ? `<span><b>Здоровье:</b> ${esc(wound)}</span>` : ""}</div>` +
			`<div class="lacts"><button type="button" class="gl-btn" data-replay>▶ Посмотреть запись боя</button><button type="button" class="gl-btn ghost" data-del>Удалить</button><span class="mute">Удалится через ${daysLeft(F)} ${pl(daysLeft(F), "день", "дня", "дней")}</span></div>`
		);
	}

	function letterHtml(m) {
		if (!m)
			return `<p class="mempty">${inTab(flt).length ? "Выбери письмо слева." : "Писем нет."}</p>`;
		if (m.k === "fight") return fightHtml(m);
		let att = "";
		if (m.att) {
			const cells = [];
			if (m.coins > 0) cells.push(coinCell(m.coins));
			(m.items || []).forEach(([id, n], i) =>
				cells.push(itemCell(id, n, m.names && m.names[i])),
			);
			if (m.tokens > 0) cells.push(tokCell(m.tokens));
			const tk = m.att === "taken";
			att =
				`<div class="att${tk ? " taken" : ""}"><h4>Вложение<span>${tk ? "уже у тебя" : "монеты - в кошелёк, вещи - в сумку, не влезло - на склад"}</span></h4><div class="agrid">${cells.join("")}</div>` +
				`<div class="row">${tk ? '<span class="ok">✓ Забрано</span>' : m.att === "busy" ? '<button type="button" class="gl-btn" disabled>Забирается…</button>' : `<button type="button" class="gl-btn" data-take>Забрать</button>${m.full ? `<span class="why">${esc(m.full)}</span>` : ""}`}</div></div>`;
		}
		const keep = m.att === "wait" || m.att === "busy",
			left = daysLeft(m);
		return (
			`<button type="button" class="gl-btn ghost mback" data-back>← Письма</button>` +
			`<div class="lh">${avatar(m)}<div><h3 tabindex="-1">${esc(m.title)}</h3><div class="from"><span class="kch" style="--kc:${KC[m.k] || "#ddd"}">${esc(KIND[m.k] || "")}</span><b>${esc(m.fn)}</b>${m.fl && m.fl !== String(m.fn).toLowerCase() ? ` @${esc(m.fl)}` : ""} · ${esc(whenFull(m.at))}</div></div></div>` +
			`<span class="term${keep ? " keep" : ""}">${keep ? "Не удалится, пока вложение не забрано" : `Удалится через ${left} ${pl(left, "день", "дня", "дней")}`}</span>` +
			`<div class="lbody">${m.body ? esc(m.body) : '<span class="mute">без текста</span>'}</div>${att}` +
			`<div class="lacts">${m.k === "player" && m.fl ? '<button type="button" class="gl-btn" data-reply>Ответить</button>' : ""}<button type="button" class="gl-btn ghost" data-del${keep ? ' aria-disabled="true" title="Сначала забери вложение"' : ""}>Удалить</button>` +
			`${m.k === "player" ? (m.rep ? '<span class="mute">Жалоба отправлена</span>' : '<button type="button" class="gl-btn ghost bad" data-report>Пожаловаться</button>') : ""}</div>`
		);
	}

	const lim = () => (data && data.lim) || { title: 60, body: 1000 };
	const len = (s) => [...String(s || "")].length;
	function composeHtml() {
		const L = lim(),
			tl = len(form.title),
			bl = len(form.body),
			c = (data && data.can) || {};
		return (
			`<button type="button" class="gl-btn ghost mback" data-back>← Письма</button><form class="cf" data-form="compose" novalidate><h3>Новое письмо</h3>` +
			`<label>Кому (ник игрока)<input name="to" autocomplete="off" spellcheck="false" maxlength="25" value="${esc(form.to || "")}" placeholder="ник"></label>` +
			`<label><span class="ln"><span>Тема</span><em class="${tl > L.title ? "over" : ""}">${tl} / ${L.title}</em></span><input name="title" maxlength="${L.title}" value="${esc(form.title || "")}" placeholder="Идём вечером на рейд?"></label>` +
			`<label><span class="ln"><span>Текст</span><em class="${bl > L.body ? "over" : ""}">${bl} / ${L.body}</em></span><textarea name="body" maxlength="${L.body}" placeholder="Привет! Собираю отряд к восточным воротам...">${esc(form.body || "")}</textarea></label>` +
			(err ? `<p class="err" role="alert">${esc(err)}</p>` : "") +
			`<p class="hint">Только текст - монеты и вещи письмом не передать, ссылки нельзя.${c.dayMax ? ` Сегодня можно отправить ещё ${esc(c.dayLeft)} из ${esc(c.dayMax)}.` : ""}</p>` +
			`<div class="row"><button type="submit" class="gl-btn"${busy ? " disabled" : ""}>Отправить</button><button type="button" class="gl-btn ghost" data-back>Отмена</button></div></form>`
		);
	}
	function streamerHtml() {
		const L = lim(),
			tl = len(form.title),
			bl = len(form.body),
			all = form.who !== "list",
			c = (data && data.can) || {};
		return (
			`<button type="button" class="gl-btn ghost mback" data-back>← Письма</button><form class="cf" data-form="streamer" novalidate><h3>Письмо игрокам канала</h3>` +
			`<div class="who" role="group" aria-label="Кому"><button type="button" data-who="all" aria-pressed="${all}">Всем игрокам канала</button><button type="button" data-who="list" aria-pressed="${!all}">Списком ников</button></div>` +
			(all
				? ""
				: `<label>Ники через запятую или с новой строки<textarea name="to" style="min-height:70px" maxlength="4000" spellcheck="false" placeholder="ник, ник">${esc(form.to || "")}</textarea></label>`) +
			`<label><span class="ln"><span>Тема</span><em class="${tl > L.title ? "over" : ""}">${tl} / ${L.title}</em></span><input name="title" maxlength="${L.title}" value="${esc(form.title || "")}" placeholder="Вечером рейд!"></label>` +
			`<label><span class="ln"><span>Текст</span><em class="${bl > L.body ? "over" : ""}">${bl} / ${L.body}</em></span><textarea name="body" maxlength="${L.body}">${esc(form.body || "")}</textarea></label>` +
			(err ? `<p class="err" role="alert">${esc(err)}</p>` : "") +
			`<p class="hint">Только текст, без вложений. Рассылок сегодня осталось: ${esc(c.streamer || 0)}${c.streamerMax ? ` из ${esc(c.streamerMax)}` : ""}.</p>` +
			`<div class="row"><button type="submit" class="gl-btn"${busy ? " disabled" : ""}>Разослать</button><button type="button" class="gl-btn ghost" data-back>Отмена</button></div></form>`
		);
	}

	function gotHtml() {
		if (!gotState) return "";
		const g = gotState,
			cells = [];
		if (g.coins) cells.push(coinCell(g.coins));
		(g.items || []).forEach(([id, n]) => cells.push(itemCell(id, n)));
		if (g.tokens) cells.push(tokCell(g.tokens));
		return (
			`<div class="mask gotm" data-gotmask><div class="box got" role="alertdialog" aria-modal="true" aria-labelledby="ml2-gott"><span class="rays" aria-hidden="true"></span>` +
			`<b id="ml2-gott">Забрано!</b><p>${esc(g.letters)} ${pl(g.letters, "письмо", "письма", "писем")} · монеты - в кошельке, вещи - в сумке${g.store ? `, на складе - ${esc(g.store)} шт.` : ""}</p>` +
			`<div class="ggrid">${cells.map((c, i) => c.replace('<span class="ai', `<span style="--i:${i}" class="ai`)).join("")}</div>` +
			(g.left
				? `<p class="gleft">Не влезло: ${esc(g.left)} ${pl(g.left, "вложение ждёт", "вложения ждут", "вложений ждут")} в письме${g.why ? ` - ${esc(g.why)}` : ""}</p>`
				: "") +
			`<div class="row"><button type="button" class="gl-btn" data-gotok>Отлично</button></div></div></div>`
		);
	}
	function askHtml() {
		if (!askState) return "";
		const a = askState;
		return (
			`<div class="mask" data-mask><div class="box" role="alertdialog" aria-modal="true" aria-labelledby="ml2-askt"><b id="ml2-askt">${esc(a.title)}</b>${a.text ? `<p>${esc(a.text)}</p>` : ""}${a.input ? `<textarea data-askin maxlength="300" placeholder="${esc(a.ph || "")}"></textarea>` : ""}` +
			`<div class="row"><button type="button" class="gl-btn ghost" data-ask="no">Отмена</button><button type="button" class="gl-btn${a.bad ? " bad" : ""}" data-ask="yes">${esc(a.ok)}</button></div></div></div>`
		);
	}

	function ask(o) {
		return new Promise((res) => {
			if (askState) askState.res(null);
			askState = { ...o, res };
			render();
		});
	}
	function askDone(v) {
		const a = askState;
		if (!a) return;
		askState = null;
		render();
		a.res(v);
	}

	function frame() {
		const el = document.createElement("div");
		el.className = "gl-modal ml2 gw-dk";
		el.innerHTML =
			'<div class="gl-win mw" role="dialog" aria-modal="true" aria-labelledby="ml2-t"></div>';
		(document.fullscreenElement || document.body).appendChild(el);
		el.addEventListener("pointerdown", (e) => {
			if (e.target === el) close();
		});
		el.addEventListener("click", onClick);
		el.addEventListener("input", onInput);
		el.addEventListener("submit", onSubmit);
		document.addEventListener("keydown", onKey, true);
		W = { el, win: el.querySelector(".gl-win") };
	}
	function render() {
		if (!W) return;
		W.el.dataset.gst = gst();
		const M0 = $(".mul"),
			keep = M0 ? M0.scrollTop : 0,
			fa = document.activeElement,
			fn = fa && W.el.contains(fa) && fa.name,
			fpos = fn ? fa.selectionStart : 0;
		const n = data && data.list ? data.list.length : 0,
			u = unreadAll(),
			c = (data && data.can) || {};
		const view =
			mode === "compose"
				? composeHtml()
				: mode === "streamer"
					? streamerHtml()
					: letterHtml(cur());
		if (mode === "view" && !view.startsWith('<div class="mload"') && cur())
			lastView = view;
		const tools =
			(c.send
				? '<button type="button" class="gl-btn" data-compose>Написать</button>'
				: "") +
			(c.streamer != null
				? `<button type="button" class="gl-btn ghost" data-streamer${c.streamer > 0 ? "" : ' aria-disabled="true"'}><span class="lt">Письмо игрокам канала </span><span class="ls">Рассылка </span><small>${esc(c.streamer)}${c.streamerMax ? `/${esc(c.streamerMax)}` : ""}</small></button>`
				: "");
		W.win.innerHTML =
			'<button type="button" class="gl-x" data-x aria-label="Закрыть почту">×</button><div class="gl-body">' +
			`<div class="mh"><h2 id="ml2-t">Почта</h2><span class="cnt">${data ? `${n} из ${esc(data.max || 100)}${u ? ` · новых ${u}` : ""}` : ""}</span><span class="sp"></span><span class="tools" style="display:flex;gap:8px">${tools}</span></div>` +
			`<div class="mmain${phoneView === "view" ? " view" : ""}"><nav class="mlist" aria-label="Письма">${listHtml()}</nav><section class="mview" aria-live="polite">${view}</section></div>` +
			`</div>${askHtml()}${gotHtml()}<div class="atoast" role="status"></div>`;
		const M = $(".mul");
		if (M) M.scrollTop = keep;
		if (fn) {
			const f = W.win.querySelector(`[name="${fn}"]`);
			if (f) {
				f.focus();
				try {
					f.setSelectionRange(fpos, fpos);
				} catch (e) {}
			}
		}
		if (askState) {
			const t = $("[data-askin]") || $('[data-ask="yes"]');
			if (t) t.focus();
		} else if (gotState) {
			const b = $("[data-gotok]");
			if (b) b.focus();
		}
	}
	function toast(s, bad) {
		const t = $(".atoast");
		if (!t) {
			if (X && X.toast) X.toast(s, bad);
			return;
		}
		t.textContent = s;
		t.classList.add("on");
		clearTimeout(ttm);
		ttm = setTimeout(() => {
			const t2 = $(".atoast");
			if (t2) t2.classList.remove("on");
		}, 2600);
	}
	const errOf = (r, d) => (r && r.error) || d || "не вышло";
	const count = () => {
		if (X && X.count && data)
			X.count(
				(data.list || []).filter((m) => !m.read).length,
				(data.list || []).filter(waitOf).length,
			);
	};

	async function load() {
		const r = await api("/api/mail");
		if (!r || !r.ok) {
			data = data || { list: [] };
			render();
			toast(errOf(r, "Почта не загрузилась"), true);
			return false;
		}
		data = r;
		Object.assign(CAT, r.cat || {});
		if (r.fights) await loadFights();
		else FD = null;
		if (!tabs().some(([k]) => k === flt)) flt = "sys";
		if (sel && !cur()) sel = "";
		count();
		return true;
	}
	async function loadFights() {
		const r = await api("/api/mail/fights");
		if (r && r.ok) {
			FD = r;
			if (data && data.fights) data.fights.unread = r.unread || 0;
		} else FD = FD || { list: [] };
		if (FD.list.length) void cmFiles();
	}
	let cmP = null;

	function cmFiles() {
		if (window.LGCityMon && window.LGCityMonArt) return Promise.resolve(true);
		if (cmP) return cmP;
		const V = window.LG_SITEF || {};
		if (
			!document.getElementById("citymonCss") &&
			!document.querySelector('link[href^="/site/citymon.css"]')
		) {
			const l = document.createElement("link");
			l.rel = "stylesheet";
			l.href = `/site/citymon.css?v=${V["citymon.css"] || ""}`;
			document.head.appendChild(l);
		}
		cmP = new Promise((ok) => {
			const s = document.createElement("script");
			s.src = `/site/citymon.js?v=${V["citymon.js"] || ""}`;
			s.onload = () => {
				ok(true);
				if (W && sel && isF(sel)) render();
			};
			s.onerror = () => {
				cmP = null;
				ok(false);
			};
			document.head.appendChild(s);
		});
		return cmP;
	}

	async function openLetter(id, view = true) {
		sel = id;
		mode = "view";
		err = "";
		if (view) phoneView = "view";
		const m = cur();
		render();
		const v = $(".mview");
		if (v) v.scrollTop = 0;
		if (!m) return;
		if (m.k === "fight") {
			const raw = m.fidRaw;
			if (!FL[raw]) {
				const r = await fightGet(raw);
				if (!(r && r.ok)) {
					const f = FD && FD.list.find((x) => x.id === raw);
					if (f) f.loadErr = errOf(r, "письмо не открылось");
				}
				if (sel === id) render();
			}
			void prefetch();
			if (!m.read) {
				const f = FD.list.find((x) => x.id === raw);
				if (f) f.read = true;
				render();
				const r = await api("/api/mail/fights/read", { ids: [raw] });
				if (r && r.ok && data.fights) data.fights.unread = r.unread;
			}
		} else if (!m.read) {
			const x = data.list.find((y) => y.id === id);
			if (x) x.read = true;
			render();
			const r = await api("/api/mail/read", { ids: [id] });
			if (r && r.ok) count();
		}
		const h = $(".mview h3");
		if (h && view && phone()) {
			h.tabIndex = -1;
			h.focus({ preventScroll: true });
		}
	}

	function fightGet(raw) {
		if (FL[raw]) return Promise.resolve(FL[raw]);
		if (!FLP[raw])
			FLP[raw] = api("/api/mail/fight?id=" + encodeURIComponent(raw)).then(
				(r) => {
					delete FLP[raw];
					if (r && r.ok) FL[raw] = r;
					return r;
				},
				(e) => {
					delete FLP[raw];
					throw e;
				},
			);
		return FLP[raw];
	}
	let preBusy = false;

	async function prefetch() {
		if (preBusy || !FD || !FD.list) return;
		preBusy = true;
		try {
			for (const f of FD.list
				.slice()
				.sort((a, b) => b.at - a.at)
				.slice(0, 12)) {
				if (!W || document.hidden) break;
				if (!FL[f.id] && !f.loadErr) await fightGet(f.id);
			}
		} catch (e) {
			console.warn("[mail2] prefetch", e);
		}
		preBusy = false;
	}

	function openTab(k) {
		flt = k;
		mode = "view";
		phoneView = "list";
		err = "";
		const f = inTab(k)[0];
		sel = f ? f.id : "";
		if (f && !phone()) return openLetter(f.id, false);
		render();
	}

	function showGot(g) {
		gotState = g;
		render();
	}
	async function takeOne() {
		const m = cur();
		if (!m || busy) return;
		busy = true;
		m.att = "busy";
		render();
		const r = await api("/api/mail/take", { id: m.id });
		busy = false;
		if (r && r.ok) {
			if (X.hero) X.hero();
			await load();
			if (r.already) {
				render();
				toast("Вложение уже было выдано");
				return;
			}
			return showGot({
				letters: 1,
				coins: m.coins || 0,
				items: m.items || [],
				tokens: m.tokens || 0,
				store: r.store || 0,
				left: 0,
			});
		}
		await load();
		const x = cur();
		if (x && r && r.full) x.full = errOf(r);
		render();
		toast(errOf(r), true);
	}
	async function takeAll() {
		if (busy) return;
		const L = inTab(flt);
		if (!L.some((m) => !m.read || waitOf(m)))
			return toast("Забирать нечего - всё уже у тебя");
		busy = true;
		const acc = {
			letters: 0,
			coins: 0,
			tokens: 0,
			items: new Map(),
			store: 0,
			left: 0,
			why: "",
			read: 0,
		};
		let bad = null;
		for (let k = 0; k < 5; k++) {
			const r = await api("/api/mail/takeall", { tab: flt });
			if (!r || !r.ok) {
				bad = r || {};
				break;
			}
			Object.assign(CAT, r.cat || {});
			acc.read += r.read || 0;
			acc.letters += (r.took || []).length;
			acc.coins += r.coins || 0;
			acc.tokens += r.tokens || 0;
			acc.store += r.store || 0;
			acc.left += r.left || 0;
			if (r.errors && r.errors.length && !acc.why) acc.why = r.errors[0];
			for (const [id, n] of r.items || [])
				acc.items.set(id, (acc.items.get(id) || 0) + n);
			if (!r.more || !(r.took || []).length) break;
		}
		busy = false;
		if (acc.letters && X.hero) X.hero();
		await load();
		if (acc.letters)
			return showGot({
				letters: acc.letters,
				coins: acc.coins,
				tokens: acc.tokens,
				items: [...acc.items],
				store: acc.store,
				left: acc.left,
				why: acc.why,
			});
		render();
		if (bad) return toast(errOf(bad), true);
		toast(
			acc.left
				? `Места нет - вложения ждут в письмах${acc.why ? `: ${acc.why}` : ""}`
				: acc.read
					? "Все письма вкладки прочитаны"
					: "Забирать нечего - всё уже у тебя",
			!!acc.left,
		);
	}
	async function delRead() {
		if (busy) return;
		const L = inTab(flt),
			D = L.filter((m) => m.read && !waitOf(m) && m.att !== "busy"),
			keep = L.filter((m) => m.read && (waitOf(m) || m.att === "busy")).length;
		if (!D.length)
			return toast(
				keep
					? "Прочитанные письма с вложением не удаляются - сначала забери"
					: "Прочитанных писем во вкладке нет",
			);
		const name = (TABS.find((t) => t[0] === flt) || [])[1] || "";
		if (
			!(await ask({
				title: `Удалить прочитанное: ${D.length} ${pl(D.length, "письмо", "письма", "писем")}?`,
				text: `Вкладка «${name}». Восстановить не получится.${keep ? ` Письма с незабранным вложением (${keep}) останутся.` : ""}`,
				ok: "Удалить",
				bad: true,
			}))
		)
			return;
		busy = true;
		const r = await api("/api/mail/delread", { tab: flt });
		busy = false;
		if (!r || !r.ok) return toast(errOf(r), true);
		const gone = (r.gone || []).map((id) =>
			flt === "fight" ? fid(id) : String(id),
		);
		if (gone.includes(sel)) sel = "";
		await load();
		if (!sel) {
			const f = inTab(flt)[0];
			if (f && !phone()) {
				toast(`Удалено: ${gone.length}`);
				return openLetter(f.id, false);
			}
		}
		render();
		toast(`Удалено: ${gone.length}`);
	}
	async function delOne() {
		const m = cur();
		if (!m || busy) return;
		if (waitOf(m) || m.att === "busy") return toast("Сначала забери вложение");
		const what =
			m.k === "fight"
				? `${m.win ? "Победа" : "Поражение"}: ${fightName(m)}`
				: m.title;
		if (
			!(await ask({
				title: "Удалить письмо?",
				text: `«${what}» - восстановить не получится.${m.k === "fight" ? " Запись боя удалится вместе с письмом." : ""}`,
				ok: "Удалить",
				bad: true,
			}))
		)
			return;
		busy = true;
		const r =
			m.k === "fight"
				? await api("/api/mail/fights/del", { ids: [m.fidRaw] })
				: await api("/api/mail/del", { ids: [m.id] });
		busy = false;
		if (!r || !r.ok || !(r.gone || []).length)
			return toast(errOf(r, r && r.note), true);
		if (m.k === "fight") delete FL[m.fidRaw];
		const L = inTab(flt),
			i = L.findIndex((x) => x.id === m.id);
		await load();
		const L2 = inTab(flt),
			nx = L2[Math.min(Math.max(0, i), L2.length - 1)];
		sel = "";
		phoneView = "list";
		toast("Письмо удалено");
		if (nx && !phone()) return openLetter(nx.id, false);
		render();
	}
	async function replay() {
		const m = cur();
		if (!m || m.k !== "fight") return;
		const b = $("[data-replay]");
		if (b) {
			b.disabled = true;
			b.textContent = "Загружаю запись…";
		}
		const [r, ok] = await Promise.all([
			api("/api/mail/fight?rec=1&id=" + encodeURIComponent(m.fidRaw)),
			cmFiles(),
		]);
		const b2 = $("[data-replay]");
		if (b2) {
			b2.disabled = false;
			b2.textContent = "▶ Посмотреть запись боя";
		}
		if (!r || !r.ok) return toast(errOf(r, "запись не открылась"), true);
		if (!ok || !window.LGCityMon || !window.LGCityMon.replay)
			return toast("Поле боя не загрузилось - проверь связь", true);
		try {
			await window.LGCityMon.replay(r.rec, {
				title: `Запись боя - ${r.win ? "победа" : "поражение"}`,
				sub: `${whenFull(r.at)} · ${placeText(r, (r.head || {}).place)}`,
			});
		} catch (e) {
			console.warn("[почта] запись боя", e);
			toast("Запись боя не открылась", true);
		}
	}

	const replayOpen = () => document.querySelector(".cm-dlg.cm-replay");

	function onInput(e) {
		const t = e.target,
			F = t && t.closest && t.closest("form[data-form]");
		if (!F || !t.name) return;
		form[t.name] = t.value;
		const em = t.closest("label") && t.closest("label").querySelector("em");
		if (em) {
			const mx = t.name === "title" ? lim().title : lim().body;
			em.textContent = `${len(t.value)} / ${mx}`;
			em.classList.toggle("over", len(t.value) > mx);
		}
		if (err) {
			err = "";
			const p = F.querySelector(".err");
			if (p) p.remove();
		}
	}
	async function onSubmit(e) {
		const F = e.target.closest("form[data-form]");
		if (!F) return;
		e.preventDefault();
		if (busy) return;
		const st = F.dataset.form === "streamer",
			L = lim(),
			to = String(form.to || "").trim();
		const me = X.me ? X.me() : null;
		if (!st && !to) err = "Укажи ник получателя";
		else if (!st && me && to.replace(/^@/, "").toLowerCase() === me.login)
			err = "Себе написать нельзя";
		else if (st && form.who === "list" && !to) err = "Впиши хотя бы один ник";
		else if (!String(form.title || "").trim()) err = "Напиши тему письма";
		else if (len(form.title) > L.title)
			err = `Тема - не длиннее ${L.title} символов`;
		else if (!String(form.body || "").trim())
			err = "Письмо без текста не отправить";
		else if (len(form.body) > L.body)
			err = `Текст - не длиннее ${L.body} символов`;
		else err = "";
		if (err) {
			render();
			return;
		}
		busy = true;
		render();
		const r = st
			? await api("/api/mail/streamer", {
					to: form.who === "list" ? to : "all",
					title: form.title,
					text: form.body,
				})
			: await api("/api/mail/send", { to, title: form.title, text: form.body });
		busy = false;
		if (!r || !r.ok) {
			err = errOf(r, "не отправлено");
			render();
			return;
		}
		toast(
			st
				? `Разослано: ${r.sent}${r.skipped ? `, без героя или аккаунта - ${r.skipped}` : ""}`
				: `Письмо для ${r.to ? r.to.name || r.to.login : to} отправлено`,
		);
		mode = "view";
		form = {};
		phoneView = "list";
		await load();
		render();
	}
	async function onClick(e) {
		const t = e.target,
			b = t.closest && t.closest("button, [data-gotmask], [data-mask]");
		if (!b || !W.el.contains(b)) return;
		if (b.matches("[data-gotmask]")) {
			if (t === b) {
				gotState = null;
				render();
			}
			return;
		}
		if (b.matches("[data-mask]")) {
			if (t === b) askDone(null);
			return;
		}
		if (b.disabled) return;
		const D = b.dataset;
		if ("x" in D) return close();
		if ("ask" in D) {
			const a = askState;
			return askDone(
				D.ask === "yes"
					? a && a.input
						? (($("[data-askin]") || {}).value || "").trim()
						: true
					: null,
			);
		}
		if ("gotok" in D) {
			gotState = null;
			return render();
		}
		if ("f" in D) {
			if (D.f !== flt) openTab(D.f);
			return;
		}
		if ("open" in D) return openLetter(D.open);
		if ("back" in D) {
			if (mode !== "view") {
				mode = "view";
				err = "";
			}
			phoneView = "list";
			return render();
		}
		if ("compose" in D) {
			mode = "compose";
			form = {};
			err = "";
			phoneView = "view";
			render();
			const f = $('[name="to"]');
			if (f) f.focus();
			return;
		}
		if ("streamer" in D) {
			const c = data.can || {};
			if (!(c.streamer > 0)) return toast("Рассылок на сегодня больше нет");
			mode = "streamer";
			form = { who: "all" };
			err = "";
			phoneView = "view";
			render();
			const f = $('[name="title"]');
			if (f) f.focus();
			return;
		}
		if ("who" in D) {
			form.who = D.who;
			return render();
		}
		if ("reply" in D) {
			const m = cur();
			if (!m) return;
			mode = "compose";
			form = {
				to: m.fl,
				title: ("Re: " + m.title).slice(0, lim().title),
				body: "",
			};
			err = "";
			phoneView = "view";
			render();
			const f = $('[name="body"]');
			if (f) f.focus();
			return;
		}
		if ("replay" in D) return replay();
		if (
			b.getAttribute("aria-disabled") === "true" &&
			!("del" in D) &&
			!("takeall" in D) &&
			!("delread" in D)
		)
			return;
		if ("takeall" in D) return takeAll();
		if ("delread" in D) return delRead();
		if ("take" in D) return takeOne();
		if ("del" in D) return delOne();
		if ("report" in D) {
			const m = cur();
			if (!m || busy) return;
			const why = await ask({
				title: "Пожаловаться на письмо",
				text: "Письмо увидят модераторы канала. Жалобу на одно письмо можно отправить один раз.",
				ok: "Отправить жалобу",
				bad: true,
				input: true,
				ph: "Что не так (необязательно)",
			});
			if (why == null) return;
			busy = true;
			const r = await api("/api/mail/report", { id: m.id, reason: why });
			busy = false;
			if (!r || !r.ok) return toast(errOf(r), true);
			m.rep = true;
			render();
			toast("Жалоба отправлена модераторам");
		}
	}
	function onKey(e) {
		if (!W || e.key !== "Escape") return;
		if (replayOpen()) {
			e.stopPropagation();
			e.preventDefault();
			try {
				window.LGCityMon.close();
			} catch (er) {
				const d = replayOpen();
				if (d) d.remove();
			}
			return;
		}
		e.stopPropagation();
		e.preventDefault();
		if (gotState) {
			gotState = null;
			return render();
		}
		if (askState) return askDone(null);
		if (mode !== "view") {
			mode = "view";
			err = "";
			return render();
		}
		if (phoneView === "view" && phone()) {
			phoneView = "list";
			return render();
		}
		close();
	}

	let wopen = false;
	function chatPlace(on) {
		const R = document.documentElement;
		if (on) {
			wopen = !R.classList.contains("gu-wopen") && R.classList.contains("gu");
			if (wopen) R.classList.add("gu-wopen");
		} else if (wopen) {
			wopen = false;
			if (!document.querySelector(".tab.gu-win"))
				R.classList.remove("gu-wopen");
		}
		setTimeout(() => {
			try {
				if (window.LGDm) window.LGDm.place();
				if (window.LGChatOne) window.LGChatOne.place();
			} catch (er) {}
		}, 0);
	}
	async function open(hooks, o) {
		X = hooks;
		if (W) {
			render();
			return;
		}
		lastFocus = document.activeElement;
		frame();
		document.documentElement.classList.add("ml2-open");
		chatPlace(true);
		mode = "view";
		phoneView = "list";
		gotState = null;
		askState = null;
		err = "";
		form = {};
		render();
		setTimeout(() => {
			const x = $("[data-x]");
			if (x && W) x.focus({ preventScroll: true });
		}, 0);
		await load();
		if (!W) return;
		if (o && o.compose) {
			mode = "compose";
			form = { to: String(o.compose) };
			phoneView = "view";
			render();
			const f = $('[name="title"]');
			if (f) f.focus();
			return;
		}

		const k = (tabs().find(([t]) => unreadIn(t) > 0) || ["sys"])[0];
		openTab(k);
	}
	function close() {
		if (!W) return;
		if (askState) {
			const a = askState;
			askState = null;
			a.res(null);
		}
		document.removeEventListener("keydown", onKey, true);
		W.el.remove();
		W = null;
		gotState = null;
		document.documentElement.classList.remove("ml2-open");
		chatPlace(false);
		if (lastFocus && lastFocus.focus) {
			try {
				lastFocus.focus({ preventScroll: true });
			} catch (e) {}
		}
	}

	function onEvent() {
		if (W && mode === "view" && !askState && !gotState && !busy)
			void load().then(() => render());
	}
	window.LGMailWin2 = { open, close, onEvent, isOpen: () => !!W };
})();
