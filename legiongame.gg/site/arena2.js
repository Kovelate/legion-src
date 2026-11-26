window.LGArena2 = (() => {
	const SU = window.LGSiteUi,
		esc = SU.esc;
	const F = () => window.LGArenaField,
		L = () => window.LGArenaLocs;
	const ROLE = {
		legionary: "Легионер",
		paladin: "Паладин",
		rogue: "Разбойник",
		recruit: "Новобранец",
		archer: "Лучник",
		mage: "Маг",
		necromancer: "Некромант",
		priest: "Жрец",
	};
	const RR = {
		common: "обычное",
		uncommon: "необычное",
		rare: "редкое",
		epic: "эпическое",
		legendary: "легендарное",
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
	const BCL = ["#3f8fd2", "#e0703a", "#9a6ad8"];
	const BCLD = ["#9ccdf6", "#ffb690", "#d6bff7"];
	const bcs = (i) => `--bc:${BCL[i] || BCL[0]};--bcd:${BCLD[i] || BCLD[0]}`;
	const plural = (n, a, b, c) => SU.plural(n, a, b, c);
	const signed = (n) => (n > 0 ? "+" + n : n < 0 ? "−" + Math.abs(n) : "0");
	const big = (n) =>
		String(Math.round(+n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
	const errText = (r) => (r && r.error) || "Не вышло - попробуй ещё раз";
	const ago = (t) => {
		const m = Math.max(0, Math.floor((Date.now() - t) / 60000));
		if (m < 1) return "только что";
		if (m < 60) return `${m} мин назад`;
		const h = Math.floor(m / 60);
		if (h < 24) return `${h} ч назад`;
		const d = Math.floor(h / 24);
		return d === 1 ? "вчера" : `${d} ${plural(d, "день", "дня", "дней")} назад`;
	};
	const hms = (ms) => {
		const s0 = Math.max(0, Math.ceil(ms / 1000)),
			d = Math.floor(s0 / 86400),
			h = Math.floor((s0 % 86400) / 3600),
			m = Math.floor((s0 % 3600) / 60),
			sec = s0 % 60;
		return d
			? `${d} д ${h} ч`
			: `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
	};
	const silverOf = (copper) => Math.round((+copper || 0) / 100);
	const SILV =
		'<svg viewBox="0 0 32 32" aria-hidden="true"><ellipse cx="16" cy="18" rx="11" ry="10" fill="#9aa3ad" stroke="#3a2a20" stroke-width="2.2"/><ellipse cx="16" cy="15.5" rx="11" ry="10" fill="#e3e8ee" stroke="#3a2a20" stroke-width="2.2"/><ellipse cx="16" cy="15.5" rx="6.5" ry="5.8" fill="none" stroke="#9aa3ad" stroke-width="1.6"/></svg>';
	const TOK =
		'<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="12" fill="#ffd24a" stroke="#3a2a20" stroke-width="2.5"/><path d="M16 9l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7z" fill="#e0882a" stroke="#3a2a20" stroke-width="1.2"/></svg>';
	const silv = (n) => `<span class="av-rfs">${SILV}</span>${n}`;
	const CHEST = `<svg class="arb-chs" viewBox="0 0 64 56" aria-hidden="true">
    <ellipse class="ch-sh" cx="32" cy="53" rx="25" ry="3"/>
    <g class="ch-body"><rect class="ch-w" x="7" y="26" width="50" height="25" rx="3"/><path class="ch-pl" d="M7 34h50M7 42h50"/>
      <rect class="ch-m" x="7" y="26" width="6" height="25"/><rect class="ch-m" x="51" y="26" width="6" height="25"/><rect class="ch-m" x="7" y="47" width="50" height="4"/>
      <circle class="ch-rv" cx="10" cy="30" r="1.2"/><circle class="ch-rv" cx="54" cy="30" r="1.2"/><circle class="ch-rv" cx="10" cy="46" r="1.2"/><circle class="ch-rv" cx="54" cy="46" r="1.2"/>
      <path class="ch-in" d="M10 26h44v3H10z"/><g class="ch-gl"><circle cx="32" cy="22" r="10"/><path d="M26 18l3 4-4 2zM38 18l-3 4 4 2zM32 12v5"/></g></g>
    <g class="ch-lid"><path class="ch-w" d="M7 26V18q0-12 25-12t25 12v8z"/><path class="ch-pl" d="M9 17q2-8 23-8t23 8"/>
      <rect class="ch-m" x="7" y="22" width="50" height="4"/><path class="ch-m" d="M13 26V14q0-5 4-6v18zM51 26V14q0-5-4-6v18z"/></g>
    <g class="ch-lock"><rect class="ch-m" x="27" y="22" width="10" height="11" rx="2"/><path class="ch-kh" d="M32 26.5a1.6 1.6 0 1 0 0.01 0M31.3 28h1.4v2.6h-1.4z"/></g></svg>`;

	let X = null,
		root = null,
		V = null,
		busy = false,
		opened = false,
		MODE = "";
	const D = () => (V && V.duel) || null,
		ME = () => (D() && D().me) || null;

	const modeNow = () =>
		innerWidth < 700
			? "p"
			: innerHeight < 520 && innerWidth > innerHeight
				? "l"
				: "";
	const PORT = () => MODE === "p";
	function applyMode(el) {
		if (!el) return;
		if (MODE) el.dataset.m = MODE;
		else delete el.dataset.m;
	}
	let rzT = 0;
	function onResize() {
		clearTimeout(rzT);
		rzT = setTimeout(() => {
			const m = modeNow();
			if (m === MODE) return;
			MODE = m;
			applyMode(root && root.querySelector(".av-root"));
			if (W) {
				applyMode(W.dim);
				lockPage();
				if (W.redraw) W.redraw();
			}
		}, 120);
	}

	const DK = [
		"--gw-bg",
		"--gw-card",
		"--gw-soft",
		"--gw-ghost",
		"--gw-tab",
		"--gw-chip",
		"--gw-chip2",
		"--gw-menu",
		"--gw-in",
		"--gw-xpbg",
		"--gw-hi",
		"--gw-ok",
	];

	const isDark = () => document.documentElement.classList.contains("gwdark");
	function tone(el) {
		if (!el) return;
		DK.forEach((k) => el.style.removeProperty(k));
		const s = el.dataset.gst;
		if (s === "42brothers" || s === "cherts" || isDark()) return;
		const cs = getComputedStyle(el),
			line = cs.getPropertyValue("--gw-line").trim() || "#2b1d18";
		DK.forEach((k) => {
			const v = cs.getPropertyValue(k).trim();
			if (v && !/gradient|url/.test(v))
				el.style.setProperty(
					k,
					`color-mix(in srgb, ${v} ${k === "--gw-bg" ? 80 : 86}%, ${line})`,
				);
		});
	}

	let darkWas = isDark(),
		darkMo = null;
	function toneAll() {
		const d = isDark();
		if (d === darkWas) return;
		darkWas = d;
		tone(root && root.querySelector(".av-root"));
		if (W) tone(W.dim);
		tone(TREEW);
	}

	const fig = (h) => {
		try {
			return F() && F().figure ? F().figure(h) : "";
		} catch (e) {
			return "";
		}
	};
	const nm = (h, cls = "") => {
		const n = String(h.name || h.login || ""),
			Lh = n.length,
			fs = Lh <= 8 ? 11.5 : Lh <= 12 ? 10.5 : Lh <= 18 ? 9.5 : 8.5;
		return `<span class="av-nm${h.lead ? " av-ld" : ""}${Lh > 12 ? " av-w2" : ""} ${cls}" style="--fs:${fs}px"><b>${+h.level || 1}</b><span title="${esc(n)}">${esc(n).replace(/_/g, "_<wbr>")}</span></span>`;
	};
	const bgOf = (loc) => {
		const Lc = L();
		const id = Lc && Lc.has(loc) ? loc : "colosseum";
		return Lc ? Lc.bg(id, "stage") || "" : "";
	};
	const dayLoc = () => (D() && D().loc) || "colosseum";

	async function load() {
		if (busy) return;
		busy = true;
		TOPR = null;
		let r = null;
		try {
			r = await X.api("/api/arena");
		} finally {
			busy = false;
		}
		if (!opened) return;
		if (!r || !r.ok) {
			X.toast(errText(r), true);
			return;
		}
		V = r;
		if (!r.duel || !r.duel.v2) {
			if (window.LGArena && window.LGArena.back) window.LGArena.back(r);
			return;
		}
		render();
		chatPoll();
	}
	async function post(body, btn) {
		if (btn) btn.disabled = true;
		let r = await X.api("/api/arena/act", body);

		for (let i = 0; i < 2 && r && !r.ok && r.wait && !r.pend; i++) {
			await new Promise((ok) => setTimeout(ok, 1500));
			r = await X.api("/api/arena/act", body);
		}
		if (btn && btn.isConnected) btn.disabled = false;
		if (!r || !r.ok) {
			X.toast(errText(r), true);
			if (
				r &&
				(r.inSquad || /в отряде|не в отряде/.test(String(r.error || "")))
			)
				void load();
			return null;
		}
		return r;
	}

	const CARDS = new Map(),
		CARDQ = new Map(),
		CARD_ERR_MS = 20e3;

	function cardNow(login) {
		const c = CARDS.get(login);
		if (!c) return null;
		return c.h && c.h.err && Date.now() - c.at >= CARD_ERR_MS ? null : c.h;
	}

	function cardLoad(login, then) {
		if (!CARDQ.has(login)) void card(login).then(then);
	}
	function card(login) {
		const c = CARDS.get(login);
		if (c && Date.now() - c.at < (c.h && c.h.err ? CARD_ERR_MS : 60e3))
			return Promise.resolve(c.h);
		const q = CARDQ.get(login);
		if (q) return q;
		const p = X.api("/api/arena/hero?login=" + encodeURIComponent(login))
			.then((r) => {
				const h = r && r.ok ? r.hero : { err: errText(r) };
				CARDS.set(login, { at: Date.now(), h });
				if (CARDS.size > 80) CARDS.delete(CARDS.keys().next().value);
				return h;
			})
			.finally(() => CARDQ.delete(login));
		CARDQ.set(login, p);
		return p;
	}

	const MW = [3, 4, 1, 2, 0],
		DEP = { 0: "av-d0", 1: "av-d1", 2: "av-d1", 3: "av-d2", 4: "av-d2" };
	function render() {
		if (!root || !V) return;
		const d = D(),
			m = ME();
		root.innerHTML = `<div class="av-root av-wrap arb gw-dk" data-gst="${gst()}">${
			m
				? `${headHtml(d, m)}<section class="av-steps">${stepsHtml(d, m)}</section>
      <ul class="av-offs">${offsHtml(d, m)}</ul>
      <div class="av-rfrow"><button type="button" class="av-btn av-rfb" data-a="refresh"${m.hero ? "" : " disabled"}>${rfLabel(m)}</button></div>
      <div class="av-cols">
        <section class="av-panel av-wkp" role="button" tabindex="0" aria-label="Открыть рейтинг недели">${weekMini(d)}</section>
        <div class="av-midc"><section class="av-panel av-minep av-mineP" role="button" tabindex="0" aria-label="Открыть состав обороны">${mineHtml(d, m)}</section>
          <section class="av-panel av-chatp" aria-label="Чат отряда">${chatHtml(m)}</section></div>
        <section class="av-panel av-logp" role="button" tabindex="0" aria-label="Открыть журнал битв"><h3 class="av-h3">📜 Журнал битв <span class="av-mute">${(d.mine || []).length} последних</span></h3><ol class="av-log">${logMini(d)}</ol></section>
      </div>${botsHtml()}${lockHtml(d, m)}`
				: SU.note("Войди через Twitch, чтобы играть на Арене.")
		}</div>`;
		const R = root.querySelector(".av-root");
		applyMode(R);
		tone(R);
		bindMain();
		clk();
		chatScroll();
		chestBadge();
	}
	function headHtml(d, m) {
		const t = m.today || {},
			left = t.left != null ? t.left : 0,
			max = t.max || 5;
		const buy =
			left <= 0 && m.hero && +t.price > 0
				? `<button type="button" class="av-btn av-gold" data-a="buy" data-price="${+t.price}" data-tip-h="Новые бои бесплатно в 00:00 по Москве - через ${hms(t.resetIn)}. Следующий купленный - ${silverOf(t.price * 2)} серебра${t.buy ? ` · куплено сегодня: ${t.buy}` : ""}">＋ Купить бой · ${silv(silverOf(t.price))}</button>`
				: "";
		return `<header class="av-top">
      <div class="av-l"><span class="av-chip" title="Рейтинг арены${m.place ? ` - место ${m.place}` : ""}">🏆 Рейтинг ${m.rating}</span><button type="button" class="av-btn av-topBtn" data-a="top">🏆 Топ арены</button></div>
      <div class="av-title">Арена 5×5</div>
      <div class="av-r">${buy}<span class="av-chip av-light av-fightsChip${left <= 0 ? " av-zero" : ""}" title="Считаются нападения, оборона не тратит">⚔ Осталось боёв: ${left} из ${max}</span></div>
    </header>`;
	}
	function stepsHtml(d, m) {
		const t = m.today || {},
			steps = (d.rules && d.rules.winSteps) || [];
		if (!m.hero || !steps.length) return "";
		const got = new Set(t.got || []),
			w = Math.min(5, t.wins || 0);
		return `<div class="av-lbl">Победы сегодня: <b>${t.wins || 0}</b> из 5</div>
      <div class="av-bar"><span class="av-fill" style="transform:scaleX(${w / 5})"></span>${steps
				.map((x) => {
					const st = got.has(x.wins)
						? "av-open"
						: w >= x.wins
							? "av-ready"
							: "av-lock";
					return `<div class="av-cst ${st}" style="left:${(x.wins / 5) * 100}%"><button type="button" data-chest="${x.wins}" aria-label="Сундук за ${x.wins} ${plural(x.wins, "победу", "победы", "побед")}">${CHEST}</button><span class="av-n">${x.wins}</span></div>`;
				})
				.join("")}<div class="av-chp" hidden></div></div>`;
	}
	const giftRw = (st) =>
		[
			st.coins > 0 ? ri("silver", silverOf(st.coins)) : "",
			st.tokens > 0 ? ri("tokens", st.tokens) : "",
			st.spheres > 0 ? ri("enchant_sphere", st.spheres) : "",
		].join("");
	const PRZN = {
		silver: ["Серебро", "Монеты героя. 100 меди = 1 серебро.", "common"],
		tokens: ["Жетоны навыков", "Прокачка способностей Арены.", "rare"],
		enchant_sphere: [
			"Сфера сохранения",
			"Материал для заточки: при неудаче вещь не ломается, а теряет один уровень заточки.",
			"rare",
		],
		aurus_seal_5: [
			"Печать Ауруса 5",
			"Материал для заточки: гарантирует успех до +5 включительно.",
			"epic",
		],
	};
	function prizeArt(id) {
		if (id === "silver") return SILV;
		if (id === "tokens") return TOK;
		const INV = window.LGInventory;
		try {
			if (INV && INV.art)
				return INV.art(
					id === "enchant_sphere"
						? { id, slot: "material", mat: "sphere", rarity: "rare" }
						: { id, slot: "material", seal: 5, rarity: "epic" },
				);
		} catch (e) {}
		return "";
	}
	const ri = (id, n) => {
		const p = PRZN[id] || [id, "", "common"];
		return `<span class="av-ri" data-r="${p[2]}" data-tip-h="${esc(p[0])}${p[1] ? ": " + esc(p[1]) : ""}">${prizeArt(id)}<b>${n}</b></span>`;
	};
	const prizeRw = (P) =>
		P
			? [
					...(P.items || []).map((x) => ri(x.id, x.n)),
					P.tokens ? ri("tokens", P.tokens) : "",
				].join("")
			: "";

	function offsHtml(d, m) {
		const list = d.offers || [],
			t = m.today || {},
			can = m.canAttack;
		if (!list.length)
			return (
				[1, 2, 3]
					.map(
						(i) =>
							`<li class="av-panel av-off av-ghost" aria-hidden="true"><div class="av-oh"><span>Соперник ${i}</span><span class="av-chip">🏆 -</span></div><div class="av-scene">${bgOf(dayLoc())}</div></li>`,
					)
					.join("") +
				`<li class="av-offnote"><p class="av-plate">Собранных отрядов на канале пока нет - соперники появятся, когда игроки соберут отряды из 5.</p></li>`
			);
		return list
			.map(
				(
					o,
				) => `<li class="av-panel av-off"><div class="av-oh"><span>${esc(o.title || o.name)}</span><span class="av-chip">🏆 ${o.rating}</span></div>
      <button type="button" class="av-scene" data-sq="${esc(o.login)}" aria-label="Открыть ${esc(o.title || o.name)}">${bgOf(dayLoc())}<span class="av-mw">${MW.map(
				(i) => {
					const h = (o.def || [])[i];
					return h
						? `<span class="av-mh av-p${i} ${DEP[i]}${i === 2 || i === 4 ? " av-r" : ""}"><span class="av-f">${fig(h)}</span>${nm(h)}</span>`
						: "";
				},
			).join("")}</span></button>
      <div class="av-gain">${o.test ? "<span>тестовый бой, без рейтинга</span>" : `<span class="av-up">Победа: +${o.win}</span><span class="av-dn">Поражение: −${o.lose}</span>`}</div>
      <div class="av-cf"><span class="av-pow">Сила <b>${big(o.power)}</b></span><button type="button" class="av-btn av-red" data-atk="${esc(o.login)}"${can ? "" : ` disabled data-tip-h="${esc(m.whyShort || m.why || (t.left <= 0 ? "бои на сегодня кончились" : ""))}"`}>⚔ Атака</button></div></li>`,
			)
			.join("");
	}
	function rfLabel(m) {
		const r = m.refresh || { left: 3, price: 0, free: 3 };
		return `⟳ Другие соперники <span class="av-rfn">${r.price ? silv(silverOf(r.price)) : `бесплатно ${r.left} из ${r.free}`}</span>`;
	}

	function weekMini(d) {
		const W = d.week;
		if (!W) return '<h3 class="av-h3">🏆 Рейтинг недели</h3>';
		const rows = (W.list || []).slice(0, 3);
		return `<h3 class="av-h3">🏆 Рейтинг недели</h3><div class="av-mute">Итог через <span class="av-clk" data-until="${Date.now() + (+W.endIn || 0)}">${hms(+W.endIn || 0)}</span> · наведи на кубок - награды${W.last ? ' · <a href="#" class="av-lnk" data-a="wkprev">итоги прошлой недели</a>' : ""}</div>
      <ol class="av-wk">${rows.length ? rows.map((r, i) => `<li data-wr="${i}" role="button" tabindex="0" aria-label="${esc(r.squad || r.name)}: открыть рейтинг недели"><span class="av-medal av-g${r.place}">${r.place}</span><span><span class="av-nmx">${esc(r.squad || r.name)}</span><small>${esc(r.name)} · очки ${signed(r.pts)}${r.power ? ` · сила ${big(r.power)}` : ""}</small><span class="av-mt">${(r.team || []).map((h) => `<span class="av-f" data-tip-h="${esc(h.name)} · ${h.level} ур.">${fig(h)}</span>`).join("")}</span></span>${cup(r.place)}</li>`).join("") : '<li class="av-empty"><span></span><span class="av-mute">Боёв на этой неделе ещё не было - стань первым.</span></li>'}</ol>
      <button type="button" class="av-btn" data-a="week">Весь рейтинг</button>`;
	}

	function swSlots(m) {
		const sq = m.squad;
		if (!sq)
			return [m.self ? { ...m.self, me: true } : null, null, null, null, null];
		const by = Object.fromEntries(sq.members.map((h) => [h.login, h]));
		const fd = m.forms && m.forms.def;
		if (
			sq.full &&
			fd &&
			Array.isArray(fd.slots) &&
			fd.slots.every((l) => by[l])
		)
			return fd.slots.map((l) => by[l]);
		const pre = m.forms && m.forms.pre;
		if (
			!sq.full &&
			Array.isArray(pre) &&
			pre.length === 5 &&
			sq.members.every((h) => pre.includes(h.login))
		)
			return pre.map((l) => (l ? by[l] : null));
		const lead = by[sq.lead] || sq.members[0];
		return [
			lead,
			...sq.members.filter((h) => h !== lead),
			null,
			null,
			null,
			null,
		].slice(0, 5);
	}
	function mineHtml(d, m) {
		const sq = m.squad,
			n = sq ? sq.members.length : 0,
			slots = swSlots(m);
		const inv = (m.invites || [])
			.map(
				(v) =>
					`<li class="av-invr"><span><b>${esc(v.fromName)}</b> зовёт в отряд (${v.n} из 5)</span><span><button type="button" class="av-btn av-red av-sm" data-acc="${esc(v.sq)}">Принять</button> <button type="button" class="av-btn av-sm" data-dec="${esc(v.sq)}">Отказаться</button></span></li>`,
			)
			.join("");
		return `<h3 class="av-h3">🛡 Состав обороны <span class="av-mute">${n} из 5</span>${sq ? `<span class="av-pow" data-tip-h="Сила твоего отряда - сумма силы 5 героев">Сила <b>${big(sq.power)}</b></span>` : ""}</h3>
      ${inv ? `<ul class="av-invs">${inv}</ul>` : ""}
      <div class="av-mine"><button type="button" class="av-scene av-mineScene" aria-label="Открыть состав обороны">${bgOf(dayLoc())}<span class="av-mw">${MW.map(
				(i) => {
					const h = slots[i];
					return h
						? `<span class="av-mh av-p${i} ${DEP[i]}${i === 2 || i === 4 ? " av-r" : ""}" data-mk="${esc(h.login)}" data-sl="${i}"><span class="av-f">${fig(h)}</span>${nm(h)}</span>`
						: `<span class="av-mh av-p${i} ${DEP[i]} av-mhe" data-sl="${i}"><span class="av-f av-fe">＋</span></span>`;
				},
			).join("")}</span></button>
      <div class="av-mbtns"><button type="button" class="av-btn av-mineBtn" data-a="mine"${sq && sq.full ? "" : " disabled"}>🛡 Расставить</button>${sq ? '<button type="button" class="av-btn av-lv" data-a="leave"><span>Покинуть отряд</span><span>Точно покинуть?</span></button>' : `<button type="button" class="av-btn" data-a="find"${m.hero ? "" : " disabled"}>Найти отряд</button>`}<button type="button" class="av-btn av-red av-invBtn" data-a="inv"${m.hero ? "" : " disabled"}>＋ Пригласить</button></div></div>`;
	}
	function logMini(d) {
		const list = d.mine || [];
		if (!list.length)
			return '<li class="av-empty0"><span class="av-mute">Нападений и обороны пока не было.</span></li>';
		return list
			.slice(0, 30)
			.map((r) => {
				const atk = r.side === "atk",
					k = r.win ? "av-w" : "av-l",
					who = r.sq || (atk ? r.defName : r.atkName);
				return `<li class="av-l1"><span class="${k}">${resText(r)}</span><span class="av-who" data-tip-h="${atk ? "Ты напал на" : "На тебя напал"} ${esc(who)}">${atk ? "→" : "←"} ${esc(who)}</span><b class="${k}">${r.test ? "тест" : signed(r.d)}</b><time>${ago(r.at)}</time></li>`;
			})
			.join("");
	}
	const resText = (r) =>
		r.side === "atk"
			? r.win
				? "Победа"
				: "Поражение"
			: r.win
				? "Отбились"
				: "Не устояли";
	function lockHtml(d, m) {
		const min = (d.rules && d.rules.minLevel) || 5,
			lv = m.self ? +m.self.level || 0 : 0;
		if (m.hero && lv >= min) return "";
		return `<div class="arb-lock" role="note"><p class="arb-plate">Арена открывается с ${min} уровня${m.hero ? ` - у тебя ${lv}` : ""}</p></div>`;
	}
	function botsHtml() {
		const b = V && V.bots;
		if (!b) return "";
		return `<section class="av-panel av-bots" aria-label="Тестовые боты"><h3 class="av-h3">🤖 Тестовые боты <span class="av-mute">только админу · ботов ${b.n || 0}, отрядов ${b.squads || 0} из ${b.max || 3}</span></h3>
      <div class="av-mbtns"><button type="button" class="av-btn" data-bots="add">Добавить ботов</button><button type="button" class="av-btn" data-bots="clear"${b.n ? "" : " disabled"}>Убрать ботов</button></div></section>`;
	}

	const CUPC = {
		1: ["#fff1a0", "#ffc928", "#c98a12", "Золотой кубок"],
		2: ["#ffffff", "#cfd6e2", "#8792a6", "Серебряный кубок"],
		3: ["#ffd2a6", "#e0904e", "#9a5522", "Бронзовый кубок"],
	};
	const CUPO = {
		legion: "#2b1d18",
		cats: "#4a2f22",
		monkeys: "#3a2412",
		veggies: "#2e3b1e",
		"42brothers": "#120a18",
		cherts: "#0e0606",
		ugabugi: "#24201a",
	};
	const CUPS = {
		legion: (
			Lc,
			M,
			Dk,
			o,
			n,
		) => `<g stroke="${o}" stroke-width="2.6" stroke-linejoin="round"><path d="M11 9 C2 9 2 22 13 23 M31 9 C40 9 40 22 29 23" fill="none"/>
    <path d="M9 4 H33 V14 C33 24 27 29 21 29 C15 29 9 24 9 14 Z" fill="${M}"/><path d="M26 5 H32 V14 C32 22 28 27 22 28 C25 25 26 20 26 14 Z" fill="${Dk}" stroke="none"/>
    <path d="M18 29 H24 V36 H18 Z" fill="${Dk}"/><path d="M10 37 H32 L34 45 H8 Z" fill="${M}"/><path d="M8 41 H34" /></g>
    <path d="M13 7 V15" stroke="${Lc}" stroke-width="2.4" stroke-linecap="round"/>${n(21, 20, o)}`,
		cats: (
			Lc,
			M,
			Dk,
			o,
			n,
		) => `<g stroke="${o}" stroke-width="2.4" stroke-linejoin="round"><path d="M9 13 L11 3 L18 10 M24 10 L31 3 L33 13" fill="${M}"/>
    <path d="M8 31 C3 30 3 22 8 20 M34 31 C39 30 39 22 34 20" fill="none"/><path d="M7 11 H35 C36 25 30 33 21 33 C12 33 6 25 7 11 Z" fill="${M}"/>
    <path d="M27 12 H34 C34 24 30 31 23 32 C27 28 28 20 27 12 Z" fill="${Dk}" stroke="none"/><path d="M17 33 H25 V38 H17 Z" fill="${Dk}"/><rect x="9" y="38" width="24" height="8" rx="4" fill="${M}"/></g>
    <g fill="${o}"><circle cx="21" cy="43.5" r="1.8"/><circle cx="17.6" cy="41" r="1"/><circle cx="21" cy="40" r="1"/><circle cx="24.4" cy="41" r="1"/></g>
    <path d="M11 15 C11 20 12 23 14 25" stroke="${Lc}" stroke-width="2.2" fill="none" stroke-linecap="round"/>${n(21, 25, o)}`,
		monkeys: (
			Lc,
			M,
			Dk,
			o,
			n,
		) => `<g stroke="${o}" stroke-width="2.4" stroke-linejoin="round"><path d="M8 11 C1 10 0 20 9 25 C5 20 5 15 8 13 Z M34 11 C41 10 42 20 33 25 C37 20 37 15 34 13 Z" fill="#ffd84a"/>
    <path d="M6 8 H36 C36 22 30 30 21 30 C12 30 6 22 6 8 Z" fill="${M}"/><path d="M28 9 H35 C35 20 31 27 24 29 C27 25 28 17 28 9 Z" fill="${Dk}" stroke="none"/>
    <path d="M7 13 H35" stroke="${o}"/><path d="M18 30 H24 V36 H18 Z" fill="#8a5a2e"/><path d="M6 36 H36 V45 H6 Z" fill="#c99a5e"/><path d="M6 40.5 H36"/></g>
    <g fill="${o}"><circle cx="9.5" cy="38.5" r="1.1"/><circle cx="32.5" cy="38.5" r="1.1"/><circle cx="9.5" cy="43" r="1.1"/><circle cx="32.5" cy="43" r="1.1"/></g>
    <path d="M10 16 C10 20 11 23 13 25" stroke="${Lc}" stroke-width="2.2" fill="none" stroke-linecap="round"/>${n(21, 24, o)}`,
		veggies: (
			Lc,
			M,
			Dk,
			o,
			n,
		) => `<g stroke="${o}" stroke-width="2.4" stroke-linejoin="round"><path d="M21 9 C17 3 12 3 10 4 C12 8 16 10 21 9 Z M21 9 C25 2 30 2 32 3 C30 8 26 10 21 9 Z M21 9 C20 5 21 2 22 1 C24 4 23 7 21 9 Z" fill="#6fae4a"/>
    <path d="M8 10 H34 C36 24 30 32 21 32 C12 32 6 24 8 10 Z" fill="${M}"/><path d="M27 11 H33 C34 22 30 29 23 31 C27 27 28 19 27 11 Z" fill="${Dk}" stroke="none"/>
    <path d="M18 32 H24 V37 H18 Z" fill="${Dk}"/><path d="M9 37 H33 L31 45 H11 Z" fill="${M}"/></g><path d="M12 41 H30" stroke="#6fae4a" stroke-width="2" stroke-dasharray="3 2"/>
    <path d="M11 14 C11 20 12 24 14 26" stroke="${Lc}" stroke-width="2.2" fill="none" stroke-linecap="round"/>${n(21, 24, o)}`,
		"42brothers": (
			Lc,
			M,
			Dk,
			o,
			n,
		) => `<ellipse cx="21" cy="44" rx="17" ry="4.5" fill="none" stroke="#ff5fa8" stroke-width="2.4"/><ellipse cx="21" cy="44" rx="20" ry="5.6" fill="none" stroke="#ff5fa8" stroke-width="1" opacity=".5"/>
    <g stroke="${o}" stroke-width="2.4" stroke-linejoin="round"><path d="M7 4 H35 L25 23 H17 Z" fill="${M}"/><path d="M27 5 H34 L25 22 H22 Z" fill="${Dk}" stroke="none"/>
    <path d="M19.5 23 H22.5 V37 H19.5 Z" fill="${Dk}"/><path d="M11 43 C11 38 31 38 31 43 Z" fill="${M}"/></g>
    <path d="M11 7 L16 17" stroke="${Lc}" stroke-width="2.2" stroke-linecap="round"/>${n(21, 15, o)}`,
		cherts: (
			Lc,
			M,
			Dk,
			o,
			n,
		) => `<path d="M21 1 C24 5 27 6 25 10 C28 9 29 6 29 5 C32 9 30 13 27 14 H15 C12 13 10 9 13 5 C13 7 14 9 17 10 C15 6 18 4 21 1 Z" fill="#ff6a2a" stroke="${o}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M18 9 C19 7 21 6 21 4 C23 7 24 9 23 12 H19 Z" fill="#ffd24a"/>
    <g stroke="${o}" stroke-width="2.4" stroke-linejoin="round"><path d="M9 13 C3 12 2 6 4 2 C5 7 7 9 10 9 Z M33 13 C39 12 40 6 38 2 C37 7 35 9 32 9 Z" fill="#5a1a14"/>
    <path d="M9 11 H33 L31 22 C29 27 25 29 21 29 C17 29 13 27 11 22 Z" fill="${M}"/><path d="M26 12 H32 L30 22 C28 26 25 28 22 28 C25 25 26 19 26 12 Z" fill="${Dk}" stroke="none"/>
    <path d="M18 29 H24 L23 36 H19 Z" fill="${Dk}"/><path d="M8 45 L11 38 H31 L34 45 L29 43 L25 45 L21 43 L17 45 L13 43 Z" fill="${M}"/></g>
    <path d="M12 14 L14 22" stroke="${Lc}" stroke-width="2.2" stroke-linecap="round"/>${n(21, 23, o)}`,
		ugabugi: (
			Lc,
			M,
			Dk,
			o,
			n,
		) => `<g shape-rendering="crispEdges"><path d="M6 6 H36 V9 H39 V18 H36 V21 H33 V24 H30 V27 H27 V30 H15 V27 H12 V24 H9 V21 H6 V18 H3 V9 H6 Z M6 9 V18 H9 V9 Z M33 9 V18 H36 V9 Z" fill="${o}" fill-rule="evenodd"/>
    <path d="M9 9 H33 V21 H30 V24 H27 V27 H15 V24 H12 V21 H9 Z" fill="${M}"/><path d="M27 9 H33 V21 H30 V24 H27 Z" fill="${Dk}"/><path d="M12 12 H15 V21 H12 Z" fill="${Lc}"/>
    <path d="M17 30 H25 V36 H17 Z" fill="${o}"/><path d="M19 30 H23 V36 H19 Z" fill="${Dk}"/>
    <path d="M6 36 H36 V46 H6 Z" fill="${o}"/><path d="M9 38 H33 V44 H9 Z" fill="#a8a090"/><path d="M12 40 H15 V42 H12 Z M24 39 H27 V41 H24 Z M30 41 H32 V43 H30 Z" fill="#6e6658"/></g>${n(21, 21, o, "mono")}`,
	};
	function cupSvg(pl, st) {
		st = CUPS[st] ? st : "legion";
		const C = CUPC[pl];
		if (!C) return "";
		const [Lc, M, Dk] = C,
			o = CUPO[st];
		const n = (x, y, c, f) =>
			`<text x="${x}" y="${y}" text-anchor="middle" font-size="${f ? 9 : 11}" font-weight="900" fill="${c}" font-family="${f ? "monospace" : "var(--gw-bt), sans-serif"}">${pl}</text>`;
		return `<svg viewBox="0 0 42 50" aria-hidden="true">${CUPS[st](Lc, M, Dk, o, n)}</svg>`;
	}
	const cup = (pl) =>
		CUPC[pl]
			? `<button type="button" class="av-cup" data-cup="${pl}" aria-label="${CUPC[pl][3]}: награды">${cupSvg(pl, gst())}</button>`
			: "";
	function cupTip(pl) {
		const W = D() && D().week,
			P = W && (W.prizes || []).find((x) => x.place === pl);
		if (!P) return `<b>${pl} место</b>`;
		return `<div class="av-ctip"><span style="float:right;width:38px;margin-left:8px">${cupSvg(pl, gst())}</span><b>${pl} место · ${CUPC[pl][3]}</b><small>Лично игроку:</small><span class="av-rw">${prizeRw(P)}</span>${P.half ? `<small>Каждому в его отряде - 50%:</small><span class="av-rw">${prizeRw(P.half)}</span>` : ""}<small>Выдаётся в конце недели</small></div>`;
	}

	let CHAT = [],
		chatT = 0,
		chatSq = null,
		CHTAB = "m";
	const ctbOn = () => !!(D() && D().ctb);
	const chSeenKey = () =>
		"lgArChat:" +
		((window.LG_CH && window.LG_CH.login) || "") +
		":" +
		(chatSq || "");
	function chSeen() {
		try {
			const v = JSON.parse(localStorage.getItem(chSeenKey()) || "{}");
			return v && typeof v === "object" ? v : {};
		} catch (e) {
			return {};
		}
	}
	function chSeenSet(v) {
		try {
			localStorage.setItem(chSeenKey(), JSON.stringify(v));
		} catch (e) {}
	}
	const inTab = (x, t) => (t === "s" ? !!x.s : !x.s);

	function chNew(t) {
		const sv = chSeen(),
			list = CHAT.filter((x) => inTab(x, t)),
			last = list.length ? list[list.length - 1].id : 0;
		if (t === CHTAB) {
			if ((+sv[t] || 0) < last) {
				sv[t] = last;
				chSeenSet(sv);
			}
			return 0;
		}
		if (sv[t] == null) {
			sv[t] = last;
			chSeenSet(sv);
			return 0;
		}
		return list.filter((x) => x.id > (+sv[t] || 0)).length;
	}
	const chTabBtn = (t, name) => {
		const n = chNew(t);
		return `<button type="button" class="av-ctab" role="tab" data-ctab="${t}" aria-selected="${CHTAB === t}">${name}${n ? `<b class="av-ctn" aria-label="новых: ${n}">${n > 99 ? "99+" : n}</b>` : ""}</button>`;
	};
	function chatHtml(m) {
		const sq = m.squad;
		if (!sq)
			return '<h3 class="av-h3">💬 Чат отряда</h3><div class="av-mute">Чат появится, когда ты будешь в отряде.</div>';
		if (chatSq !== sq.id) {
			chatSq = sq.id;
			CHAT = [];
		}
		const fresh = D().chat || [];
		if (fresh.length) {
			const ids = new Set(CHAT.map((x) => x.id));
			for (const x of fresh) if (!ids.has(x.id)) CHAT.push(x);
			CHAT.sort((a, b) => a.id - b.id);
			if (CHAT.length > 100) CHAT = CHAT.slice(-100);
		}
		const form = `<form class="av-chatf" data-a="chatf"><label class="sr-only" for="avChatIn">Сообщение отряду</label><input id="avChatIn" maxlength="200" autocomplete="off" placeholder="Напиши отряду…"><button class="av-btn av-red" type="submit">Отправить</button></form>`;
		if (ctbOn())
			return `<h3 class="av-h3">💬 Чат отряда</h3><div class="av-ctabs" role="tablist" aria-label="Чат отряда">${chTabBtn("m", "Общение")}${chTabBtn("s", "Журнал")}</div>
      <ol class="av-chat av-chatt${CHTAB === "s" ? " av-chatj" : ""}" aria-live="polite" role="tabpanel">${chatRows()}</ol>${CHTAB === "m" ? form : ""}`;
		return `<h3 class="av-h3">💬 Чат отряда</h3><div class="av-mute">видят только герои отряда · события отряда - серым</div>
      <ol class="av-chat" aria-live="polite">${chatRows()}</ol>${form}`;
	}
	function chatRows() {
		const m = ME(),
			me = m && m.login,
			by = Object.fromEntries(
				((m && m.squad && m.squad.members) || []).map((h) => [h.login, h]),
			);
		const list = ctbOn() ? CHAT.filter((x) => inTab(x, CHTAB)) : CHAT;
		if (!list.length)
			return `<li class="av-cs">${ctbOn() && CHTAB === "s" ? "Событий отряда пока не было" : "Пока тихо - напиши отряду первым"}</li>`;
		return list
			.map((x) =>
				x.s
					? `<li class="av-cs">${esc(x.t)} · ${ago(x.at)}</li>`
					: `<li class="av-cm${x.l === me ? " av-me" : ""}"><span class="av-f">${fig(by[x.l] || { login: x.l, name: x.n, role: "recruit" })}</span><span class="av-cb"><b>${esc((by[x.l] && by[x.l].name) || x.n || x.l)}</b><time>${ago(x.at)}</time><span>${esc(x.t)}</span></span></li>`,
			)
			.join("");
	}

	function chatTab(t) {
		const P = root && root.querySelector(".av-chatp"),
			m = ME();
		if (!P || !m) return;
		CHTAB = t;
		P.innerHTML = chatHtml(m);
		chatBind(P);
		chatScroll();
	}
	function chatBind(P) {
		P.querySelectorAll("[data-ctab]").forEach((b) => {
			b.onclick = (e) => {
				e.stopPropagation();
				if (b.dataset.ctab !== CHTAB) chatTab(b.dataset.ctab);
			};
		});
		const cf = P.querySelector('[data-a="chatf"]');
		if (cf)
			cf.onsubmit = (e) => {
				e.preventDefault();
				void chatSend(cf);
			};
	}
	function chatTabsDraw() {
		const T = root && root.querySelector(".av-ctabs");
		if (!T) return;
		T.innerHTML = `${chTabBtn("m", "Общение")}${chTabBtn("s", "Журнал")}`;
		chatBind(T);
	}
	function chatScroll() {
		const Lc = root && root.querySelector(".av-chat");
		if (Lc) Lc.scrollTop = Lc.scrollHeight;
	}
	function chatRedraw() {
		const Lc = root && root.querySelector(".av-chat");
		if (!Lc) return;
		const atEnd = Lc.scrollHeight - Lc.scrollTop - Lc.clientHeight < 40;
		Lc.innerHTML = chatRows();
		chatTabsDraw();
		if (atEnd) chatScroll();
	}
	async function chatFetch() {
		const since = CHAT.length ? CHAT[CHAT.length - 1].id : 0;
		const r = await X.api("/api/arena/chat?since=" + since);
		if (r && r.ok && r.sq === chatSq && r.list && r.list.length) {
			const ids = new Set(CHAT.map((x) => x.id));
			for (const x of r.list) if (!ids.has(x.id)) CHAT.push(x);
			if (CHAT.length > 100) CHAT = CHAT.slice(-100);
			chatRedraw();
		}
	}
	async function chatNow() {
		if (!opened || !ME() || !ME().squad) return;
		try {
			await chatFetch();
		} catch (er) {
			console.warn("[арена] чат отряда", er);
		}
		chatPoll();
	}
	function chatPoll() {
		clearTimeout(chatT);
		chatT = 0;
		if (!opened || !ME() || !ME().squad || !X.on || !X.on()) return;
		const BG = SU.bg,
			hidden = document.hidden || !!(BG && BG.state && BG.state() === "hidden");
		chatT = setTimeout(
			async () => {
				if (!opened) return;
				if (!hidden) await chatFetch();
				chatPoll();
			},
			hidden
				? 20000
				: window.LGPushOn && window.LGPushOn("arenaChat")
					? 300000
					: 6000,
		);
	}
	window.addEventListener("lg-snap", (e) => {
		if (e.detail && e.detail.n === "arenaChat" && opened && !document.hidden) {
			clearTimeout(chatT);
			chatT = 0;
			chatNow();
		}
	});
	async function chatSend(f) {
		const i = f.querySelector("input"),
			v = i.value.trim();
		if (!v) return;
		const r = await post({ op: "chat", text: v }, f.querySelector("button"));
		if (!r) return;
		i.value = "";
		if (r.msg && !CHAT.some((x) => x.id === r.msg.id)) CHAT.push(r.msg);
		chatRedraw();
		chatScroll();
	}

	let clkT = 0;
	function clk() {
		clearTimeout(clkT);
		clkT = 0;
		const els = [
			...((root && root.querySelectorAll(".av-clk[data-until]")) || []),
			...((W && W.dim.querySelectorAll(".av-clk[data-until]")) || []),
		];
		if (!els.length || !opened) return;
		let done = false;
		for (const el of els) {
			const left = +el.dataset.until - Date.now();
			if (left <= 0) done = true;
			el.textContent = hms(left);
		}
		if (done && !W) {
			void load();
			return;
		}
		const BG = SU.bg,
			hidden = !!(BG && BG.state && BG.state() === "hidden");
		clkT = setTimeout(clk, hidden ? 5000 : 1000);
	}
	function chestBadge() {
		try {
			const t = ME() && ME().today,
				n = t && Array.isArray(t.ready) ? t.ready.length : 0;

			const bd = D() && D().bdg;
			if (bd && window.LGArenaN) {
				bd.ch = n;
				if (window.LGArenaN.view(V, opened && !!root && root.isConnected)) {
					document
						.querySelectorAll('[data-gu="arena"][data-arb-n]')
						.forEach((b) => {
							delete b.dataset.arbN;
						});
					return;
				}
			}
			document.querySelectorAll('[data-gu="arena"]').forEach((b) => {
				if (n) {
					b.dataset.arbN = String(n);
					b.setAttribute("aria-description", `сундуков можно забрать: ${n}`);
				} else {
					delete b.dataset.arbN;
					b.removeAttribute("aria-description");
				}
			});
		} catch (e) {}
	}

	let NOCLICK = false;
	function bindMain() {
		const R = root.querySelector(".av-root");
		if (!R) return;
		const on = (sel, fn) =>
			R.querySelectorAll(sel).forEach((b) => {
				b.onclick = (e) => {
					e.stopPropagation();
					fn(b, e);
				};
			});
		on('[data-a="top"], [data-a="week"]', () => openWeek());
		on('[data-a="wkprev"]', (b, e) => {
			e.preventDefault();
			openWeek(null, "prev");
		});
		on('[data-a="refresh"]', async (b) => {
			const rf = (ME() && ME().refresh) || {};
			const r = await post(
				{ op: "refresh", ...(rf.price ? { price: rf.price } : {}) },
				b,
			);
			if (!r) return;
			X.toast(
				r.paid
					? `Соперники обновлены за ${silverOf(r.paid)} серебра · следующий раз - ${silverOf(r.refresh.price)}`
					: r.refresh && r.refresh.left
						? `Соперники обновлены · бесплатно осталось ${r.refresh.left} из ${r.refresh.free}`
						: `Соперники обновлены · дальше - за серебро: ${silverOf((r.refresh || {}).price)}`,
			);
			await load();
		});
		on('[data-a="buy"]', async (b) => {
			const p = +b.dataset.price || 0;
			const r = await post({ op: "buy", price: p }, b);
			if (!r) return;
			X.toast(
				`Бой куплен за ${silverOf(r.paid)} серебра · следующий - ${silverOf((r.today || {}).price)}`,
			);
			await load();
		});
		on("[data-chest]", (b) => chestClick(b));
		on("[data-sq]", (b) => openSquad(b.dataset.sq));
		on("[data-atk]", (b) => openFight(b.dataset.atk));
		on('[data-a="inv"]', () => openInv());
		on('[data-a="find"]', () => openInv("find"));
		on('[data-a="mine"]', () => openMine());
		on('[data-a="leave"]', (b) => askLeave(b));
		on("[data-acc]", async (b) => {
			if (await post({ op: "accept", sq: b.dataset.acc }, b)) {
				X.toast("Ты в отряде");
				await load();
			}
		});
		on("[data-dec]", async (b) => {
			if (await post({ op: "decline", sq: b.dataset.dec }, b)) await load();
		});
		on("[data-bots]", async (b) => {
			b.disabled = true;
			const r = await X.api(
				"/api/arena/bots",
				b.dataset.bots === "add" ? { op: "add", n: 2 } : { op: "clear" },
			);
			b.disabled = false;
			if (!r || !r.ok) {
				X.toast(errText(r), true);
				return;
			}
			X.toast(
				b.dataset.bots === "add"
					? `Ботов добавлено: ${r.added}`
					: `Ботов убрано: ${r.removed}`,
			);
			await load();
		});
		const cp = R.querySelector(".av-chatp");
		if (cp) chatBind(cp);

		const wkp = R.querySelector(".av-wkp");
		if (wkp) {
			wkp.onclick = (e) => {
				if (e.target.closest("button, a")) return;
				const li = e.target.closest("[data-wr]");
				openWeek(li ? +li.dataset.wr : null);
			};
			wkp.onkeydown = (e) => {
				if ((e.key === "Enter" || e.key === " ") && e.target === wkp) {
					e.preventDefault();
					openWeek();
				}
			};
		}
		R.querySelectorAll(".av-wk [data-wr]").forEach((li) => {
			li.onkeydown = (e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					e.stopPropagation();
					openWeek(+li.dataset.wr);
				}
			};
		});
		const mp = R.querySelector(".av-mineP");
		if (mp) {
			mp.onclick = (e) => {
				if (NOCLICK) return;
				const b = e.target.closest("button");
				if (b && !b.classList.contains("av-mineScene")) return;
				const m = ME();
				if (m && m.squad && m.squad.full) openMine();
				else if (m && m.hero) openInv();
			};
			mp.onkeydown = (e) => {
				if ((e.key === "Enter" || e.key === " ") && e.target === mp) {
					e.preventDefault();
					openMine();
				}
			};
		}
		const lp = R.querySelector(".av-logp");
		if (lp) {
			lp.onclick = () => openLog();
			lp.onkeydown = (e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					openLog();
				}
			};
		}
		panelDrag(R);
		tips(R);
	}

	async function chestClick(b) {
		const d = D(),
			t = (ME() && ME().today) || {},
			k = +b.dataset.chest,
			st = ((d.rules && d.rules.winSteps) || []).find((x) => x.wins === k);
		if (!st) return;
		const c = b.parentElement,
			p = root.querySelector(".av-chp");
		const show = (h) => {
			p.hidden = false;
			p.dataset.k = String(k);
			p.style.left = (k / 5) * 100 + "%";
			p.innerHTML = h;
		};
		if (
			!p.hidden &&
			p.dataset.k === String(k) &&
			!c.classList.contains("av-ready")
		) {
			chestHide();
			return;
		}
		if (c.classList.contains("av-ready")) {
			if (b.getAttribute("aria-busy") === "true") return;
			b.setAttribute("aria-busy", "true");
			const r = await post({ op: "chest", wins: k }, null);
			b.removeAttribute("aria-busy");
			if (!r) return;
			ME().today = r.today;
			c.classList.remove("av-ready");
			c.classList.add("av-open");
			show(`<b>Получено!</b><div class="av-rw">${giftRw(r.chest)}</div>`);
			chestBadge();
			return;
		}
		show(
			`<b>${k} ${plural(k, "победа", "победы", "побед")}</b><div class="av-rw">${giftRw(st)}</div>${c.classList.contains("av-open") ? "<small>получено</small>" : `<small>ещё ${k - (t.wins || 0)} ${plural(k - (t.wins || 0), "победа", "победы", "побед")} при нападении</small>`}`,
		);
	}

	function chestHide() {
		const p = root && root.querySelector(".av-chp");
		if (p && !p.hidden) {
			p.hidden = true;
			delete p.dataset.k;
			tipHide();
		}
	}
	document.addEventListener(
		"pointerdown",
		(e) => {
			const p = root && root.querySelector(".av-chp");
			if (!p || p.hidden) return;
			if (
				p.contains(e.target) ||
				(e.target.closest && e.target.closest("[data-chest]")) ||
				(TIP && TIP.contains(e.target))
			)
				return;
			chestHide();
		},
		true,
	);
	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape" && !W) chestHide();
	});

	async function askLeave(b) {
		if (b.dataset.arm) {
			clearTimeout(+b.dataset.arm);
			delete b.dataset.arm;
			b.classList.remove("av-arm");
			const r = await post({ op: "sqleave" }, b);
			if (!r) return;
			X.toast("Ты вышел из отряда");
			closeWin();
			await load();
			return;
		}
		b.classList.add("av-arm");
		b.dataset.arm = String(
			setTimeout(() => {
				delete b.dataset.arm;
				b.classList.remove("av-arm");
			}, 3000),
		);
	}

	function panelDrag(R) {
		const sc = R.querySelector(".av-mineScene"),
			m = ME();
		if (!sc || !m || !m.squad) return;
		let MD = null;
		sc.querySelectorAll(".av-mh[data-mk]").forEach((el) =>
			el.addEventListener("pointerdown", (e) => {
				if (e.button !== 0) return;
				MD = {
					el,
					x0: e.clientX,
					y0: e.clientY,
					moved: false,
					hot: null,
					touch: e.pointerType !== "mouse",
					t0: Date.now(),
				};
				try {
					el.setPointerCapture(e.pointerId);
				} catch (er) {}
			}),
		);
		sc.addEventListener("pointermove", (e) => {
			const Dd = MD;
			if (!Dd) return;
			const dx = e.clientX - Dd.x0,
				dy = e.clientY - Dd.y0;
			if (!Dd.moved && Math.hypot(dx, dy) < 6) return;
			if (!Dd.moved && Dd.touch && Date.now() - Dd.t0 < 250) {
				MD = null;
				return;
			}
			if (!Dd.moved) {
				Dd.moved = true;
				Dd.el.classList.add("av-drag");
				sc.classList.add("av-dragging");
				tipHide();
			}
			e.preventDefault();
			Dd.el.style.transform = `translate(${dx}px, ${dy}px) scale(1.08)`;
			let best = null,
				bd = 1e9;
			sc.querySelectorAll(".av-mh").forEach((o) => {
				if (o === Dd.el) return;
				const r = o.querySelector(".av-f").getBoundingClientRect(),
					dd = Math.hypot(
						r.left + r.width / 2 - e.clientX,
						r.top + r.height / 2 - e.clientY,
					);
				if (dd < bd) {
					bd = dd;
					best = o;
				}
			});
			Dd.hot = bd < 70 ? best : null;
			sc.querySelectorAll(".av-mh").forEach((o) =>
				o.classList.toggle("av-hot", o === Dd.hot),
			);
		});
		const end = async () => {
			const Dd = MD;
			MD = null;
			if (!Dd || !Dd.moved) return;
			NOCLICK = true;
			setTimeout(() => {
				NOCLICK = false;
			}, 0);
			if (!Dd.hot) {
				render();
				return;
			}
			const cur = swSlots(m).map((h) => (h ? h.login : null)),
				a = +Dd.el.dataset.sl,
				b = +Dd.hot.dataset.sl;
			[cur[a], cur[b]] = [cur[b], cur[a]];
			const full = !!m.squad.full;
			m.forms = m.forms || {};
			if (full) m.forms.def = { slots: cur.slice(), auto: false };
			else m.forms.pre = cur.slice();
			render();
			const r = await post(
				full
					? { op: "form", kind: "def", slots: cur }
					: { op: "form", kind: "pre", slots: cur },
				null,
			);
			if (!r) {
				void load();
				return;
			}
			X.toast(full ? "Порядок обороны сохранён" : "Места в клине сохранены");
		};
		sc.addEventListener("pointerup", end);
		sc.addEventListener("pointercancel", end);
	}

	let TIP = null,
		TIP2 = null,
		TIPT = 0,
		TIPK = null,
		TIPAT = 0;
	function tipEl() {
		if (!TIP || !TIP.isConnected) {
			TIP = document.createElement("div");
			TIP.className = "av-tip arb gw-dk";
			TIP.hidden = true;
			document.body.appendChild(TIP);
			TIP.addEventListener("mouseenter", () => {
				clearTimeout(TIPT);
			});
			TIP.addEventListener("mouseleave", () => {
				if (!TIP.__pin) tipLater();
			});
			TIP.addEventListener("mouseover", (e) => {
				const t = e.target.closest("[data-tip-h]");
				if (t) tip2(t);
				else tip2Hide();
			});
			TIP.addEventListener("click", (e) => {
				const t = e.target.closest("[data-tip-h]");
				if (t) {
					e.stopPropagation();
					tip2(t);
				}
			});
		}
		TIP.dataset.gst = gst();
		return TIP;
	}
	function tip2(t) {
		if (!TIP2 || !TIP2.isConnected) {
			TIP2 = document.createElement("div");
			TIP2.className = "av-tip av-tip2 arb gw-dk";
			TIP2.hidden = true;
			document.body.appendChild(TIP2);
		}
		TIP2.dataset.gst = gst();
		const n = t.querySelector("b"),
			v = String(t.dataset.tipH || ""),
			i = v.indexOf(": ");
		TIP2.innerHTML = `<b>${esc(i > 0 ? v.slice(0, i) : v)}${n && n.textContent ? ` × ${esc(n.textContent)}` : ""}</b>${i > 0 ? `<span>${esc(v.slice(i + 2))}</span>` : ""}`;
		TIP2.hidden = false;
		tipPlace(TIP2, t);
	}
	function tip2Hide() {
		if (TIP2) TIP2.hidden = true;
	}
	function tipPlace(tip, t) {
		const r = t.getBoundingClientRect(),
			tw = tip.offsetWidth,
			th = tip.offsetHeight;

		tip.style.left = Math.max(6, Math.min(innerWidth - tw - 6, r.left)) + "px";
		tip.style.top =
			Math.max(
				6,
				r.bottom + 8 + th <= innerHeight - 6
					? r.bottom + 8
					: Math.min(innerHeight - th - 6, r.top - th - 8),
			) + "px";
	}
	function tipHide() {
		clearTimeout(TIPT);
		TIPK = null;
		if (TIP) {
			TIP.hidden = true;
			TIP.__pin = false;
			TIP.classList.remove("av-tipi");
		}
		tip2Hide();
	}
	function tipLater() {
		clearTimeout(TIPT);
		TIPT = setTimeout(tipHide, 250);
	}
	function tipShow(t, pin) {
		const tip = tipEl(),
			key = t.dataset.cup ? "c" + t.dataset.cup : null;
		clearTimeout(TIPT);
		if (!(key && TIPK === key && !tip.hidden)) {
			tip2Hide();
			tip.innerHTML = t.dataset.cup
				? cupTip(+t.dataset.cup)
				: t.dataset.gear
					? gearTip(t)
					: t.dataset.skn
						? `<b>${esc(t.dataset.skn)}</b>${esc(t.dataset.skt || "")}`
						: `<b>${esc(t.dataset.tipH)}</b>`;
			tip.classList.toggle("av-tipi", !!key);
			tip.hidden = false;
			tipPlace(tip, t);
			TIPK = key;
			TIPAT = Date.now();
		} else tipPlace(tip, t);
		if (pin) tip.__pin = true;
	}
	function tips(el) {
		if (!el || el.__tips) return;
		el.__tips = true;
		el.addEventListener("mouseover", (e) => {
			const t = e.target.closest(
				"[data-tip-h],[data-gear],[data-cup],[data-skn]",
			);
			if (!t || !el.contains(t)) {
				if (TIP && !TIP.hidden) {
					if (TIPK) {
						if (!TIP.__pin) tipLater();
					} else tipHide();
				}
				return;
			}
			if (TIP && TIP.__pin && TIPK && !t.dataset.cup) return;
			tipShow(t, false);
		});
		el.addEventListener("mouseleave", () => {
			if (TIP && TIPK) {
				if (!TIP.__pin) tipLater();
			} else tipHide();
		});

		el.addEventListener("click", (e) => {
			const c = e.target.closest("[data-cup]");
			if (!c || !el.contains(c)) return;
			e.stopPropagation();
			e.preventDefault();
			const same = TIP && !TIP.hidden && TIPK === "c" + c.dataset.cup;
			if (same && TIP.__pin && Date.now() - TIPAT > 400) {
				tipHide();
				return;
			}
			tipShow(c, true);
		});
	}

	document.addEventListener(
		"pointerdown",
		(e) => {
			if (!TIP || TIP.hidden || !TIPK) return;
			if (
				TIP.contains(e.target) ||
				(e.target.closest && e.target.closest("[data-cup]"))
			)
				return;
			tipHide();
		},
		true,
	);
	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape" && TIP && !TIP.hidden && TIPK) tipHide();
	});

	let W = null;
	function lockPage() {
		document.documentElement.classList.toggle("av-lock", !!(W && MODE));
	}
	function openWin(kind, cls, back) {
		if (W && W.kind === "fight" && W.busy) return null;
		const keep = W && W.dim;
		if (!keep) {
			const dim = document.createElement("div");
			dim.className = "av-root av-dim arb gw-dk";
			dim.dataset.gst = gst();
			dim.innerHTML =
				'<div class="av-win" role="dialog" aria-modal="true" tabindex="-1"></div>';
			document.body.appendChild(dim);
			applyMode(dim);
			tone(dim);
			tips(dim);
			dim.addEventListener("click", (e) => {
				if (e.target === dim && !(W && W.busy)) closeWin();
			});
			W = {
				dim,
				win: dim.querySelector(".av-win"),
				key: (e) => {
					if (e.key === "Escape" && W && !W.busy) {
						if (TREEW) return;
						e.preventDefault();
						closeWin();
					}
				},
			};
			document.addEventListener("keydown", W.key);
			W.back = back && back.isConnected ? back : null;
		} else {
			RPTOK++;
			if (W.player) {
				W.player.destroy();
				W.player = null;
			}
		}
		W.kind = kind;
		W.redraw = null;
		W.busy = false;
		W.win.className = "av-win" + (cls ? " " + cls : "");
		W.win.style.transform = "";
		W.win.style.transition = "";
		W.win.onclick = null;
		lockPage();
		return W.win;
	}
	function closeWin() {
		if (!W) return;
		RPTOK++;
		const w = W;
		W = null;
		if (w.player) {
			try {
				w.player.destroy();
			} catch (e) {}
		}
		document.removeEventListener("keydown", w.key);
		w.dim.remove();
		tipHide();
		lockPage();
		if (w.back)
			try {
				w.back.focus({ preventScroll: true });
			} catch (e) {}
		if (w.reload) void load();
	}
	const wHead = (t, s, extra) =>
		`<div class="av-wh"><div><div class="av-t">${t}</div>${s ? `<div class="av-s">${s}</div>` : ""}</div><span class="av-whb">${extra || ""}<button type="button" class="av-btn" data-x>Закрыть</button></span></div>`;
	const bindX = (w) =>
		w.querySelectorAll("[data-x]").forEach((b) => {
			b.onclick = () => {
				if (!(W && W.busy)) closeWin();
			};
		});
	const lanes = () =>
		["Впереди", "Середина", "Сзади"]
			.map(
				(l, k) =>
					`<div class="av-lane" style="left:${k * 33.333}%;width:33.333%"><span>${l}</span></div>`,
			)
			.join("");

	const SLOTS = [
		["helmet", "Шлем"],
		["weapon", "Оружие"],
		["armor", "Доспех"],
		["shield", "Вторая рука"],
		["trinket", "Амулет"],
	];
	const STN = {
		atk: "Атака",
		mag: "Магия",
		def: "Броня",
		hp: "Здоровье",
		resist: "Сопротивление",
		crit: "Крит, %",
		critDmg: "Сила крита, %",
		luck: "Удача",
		dodge: "Уклонение, %",
		healPow: "Сила лечения",
		pierce: "Пробивание",
	};
	const ITEMS = new Map();
	let itemN = 0;
	function itemArt(it, sl) {
		const INV = window.LGInventory;
		try {
			if (INV && INV.art)
				return it
					? INV.art(it)
					: INV.EMPTY && INV.EMPTY[sl]
						? INV.art(INV.EMPTY[sl], "sil")
						: "";
		} catch (e) {}
		return "";
	}
	function gearTip(t) {
		const it = ITEMS.get(t.dataset.gear);
		if (!it) return "";
		const st = it.stats || {};
		return `<b>${esc(it.name)}${it.en ? " +" + it.en : ""}</b><span class="av-rr">${RR[it.rarity] || ""}${it.en ? ` · заточка +${it.en}` : ""}</span><div class="av-st">${Object.entries(
			st,
		)
			.map(
				([k, v]) => `<span>${STN[k] || esc(k)}</span><span>+${esc(v)}</span>`,
			)
			.join("")}</div>`;
	}
	function pdoll(items, h, flip, sm) {
		const by = {};
		for (const it of items || []) if (it && !by[it.slot]) by[it.slot] = it;
		const tile = (k) => {
			const [sl, ru] = SLOTS[k],
				it = by[sl];
			if (!it)
				return `<span class="av-gt av-empty" style="grid-area:s${k}">${ru}</span>`;
			const id = "g" + ++itemN;
			ITEMS.set(id, it);
			if (ITEMS.size > 400) ITEMS.delete(ITEMS.keys().next().value);
			return `<span class="av-gt" data-r="${esc(it.rarity)}" data-gear="${id}" style="grid-area:s${k}" aria-label="${ru}: ${esc(it.name)}${it.en ? " +" + it.en : ""}">${itemArt(it, sl)}${it.en ? `<i>+${+it.en}</i>` : ""}</span>`;
		};
		return `<div class="av-pd${sm ? " av-sm" : ""}">${[0, 1, 2, 3, 4].map(tile).join("")}<span class="av-pme${flip ? " av-r" : ""}"><span class="av-f">${fig(h)}</span></span></div>`;
	}

	function skillsHtml(ab, login) {
		const lbl = (k, t) => `<small><span>${k}</span><span>${t}</span></small>`;
		const sock = (x, lb) =>
			x
				? `<span class="av-sc2${x.lock ? " av-off" : ""}" style="${bcs(x.bi)}" data-tip-h="${esc(x.name)}${x.text ? ": " + esc(x.text) : ""}${x.lock ? ` (с ${x.lock} уровня)` : ""}"><i>${esc(x.icon || "◆")}</i>${lb}<b>${esc(x.name)}</b></span>`
				: `<span class="av-sc2 av-off"><i>?</i>${lb}<b>пусто</b></span>`;
		return `<div class="av-sc2s">${sock(ab && ab.ab, lbl("Способность", "3-й ход"))}${sock(ab && ab.ult, lbl("Ульта", "5-й ход"))}</div>${login ? `<div class="av-trbw"><button type="button" class="av-btn av-trb" data-tree="${esc(login)}">✦ Древо навыков</button></div>` : ""}`;
	}

	function heroSide(h, tags, flip, sm) {
		const hc = cardNow(h.login);

		const pf =
			window.LGProfile &&
			window.LGProfile.on() !== false &&
			h.login &&
			!(hc && hc.bot);
		const head = `<div class="av-hsh">${pf ? `<button type="button" class="av-hn av-pf" data-apf="${esc(h.login)}" title="Профиль">${esc(h.name)}</button>` : `<b class="av-hn">${esc(h.name)}</b>`}<div class="av-tags">${tags.map((t) => `<span class="av-tag">${esc(t)}</span>`).join("")}</div></div>`;
		if (!hc) {
			cardLoad(h.login, () => {
				if (W && W.redraw) W.redraw();
			});
			return `${head}<div class="av-hint">Загружаем героя…</div>`;
		}
		if (hc.err) return `${head}<div class="av-hint">${esc(hc.err)}</div>`;
		return `${head}${pdoll(hc.items, h, flip, sm)}<div><h6>Навыки Арены</h6>${hc.bot ? '<div class="av-hint">Тестовый бот: вещей и навыков нет</div>' : skillsHtml(hc.ab, h.login)}</div>`;
	}

	let TREEW = null;
	async function openTree(login) {
		const hc = await card(login);
		if (!hc || hc.err) {
			X.toast((hc && hc.err) || "Героя не открыть", true);
			return;
		}
		if (hc.skm && X.lazy) {
			try {
				await X.lazy("skills");
			} catch (e) {}
		}
		const SM = window.LGSkillMap;
		let body = "";
		if (SM && hc.skm) {
			try {
				if (!TREEDATA) {
					const r = await X.api(
						window.LGBoot ? window.LGBoot.url("skills") : "/api/skills",
					);
					if (r && r.ok) TREEDATA = r;
				}
				const cls = hc.skm.cls || hc.role,
					tree =
						TREEDATA &&
						((TREEDATA.tree || {}).classes || []).find((c) => c.id === cls);
				if (tree)
					body = SM.html(
						{ name: hc.name, login, role: hc.role, level: hc.level },
						X,
						{ readonly: true, data: { tree: TREEDATA.tree, view: hc.skm } },
					);
			} catch (e) {
				body = "";
			}
		}

		const isMap = !!body,
			oldH =
				isMap && hc.skm.old && !hc.bot && hc.sk && hc.sk.tree
					? oldTree(hc)
					: "";
		if (!body) body = oldTree(hc);
		const note = oldH
			? `<p class="av-trold"><span>Герой ещё не открывал новое древо - на карте пока ничего не открыто, на Арене он бьётся по прежнему древу.</span><button type="button" class="av-btn av-sm" data-trold aria-pressed="false">Прежнее древо</button></p><div class="av-trprev" hidden>${oldH}</div>`
			: "";
		const d = document.createElement("div");
		d.className = "av-root av-trw arb gw-dk";
		d.dataset.gst = gst();
		applyMode(d);
		d.innerHTML = `<div class="av-trbox" role="dialog" aria-label="Древо навыков">${wHead(`Древо навыков · ${esc(hc.name)}`, `${esc(hc.roleName || ROLE[hc.role] || hc.role)} ${hc.level} ур. · только просмотр`)}${note}<div class="av-trbody">${body}</div></div>`;
		const ob = d.querySelector("[data-trold]");
		if (ob)
			ob.onclick = () => {
				const on = ob.getAttribute("aria-pressed") !== "true";
				ob.setAttribute("aria-pressed", String(on));
				ob.textContent = on ? "Новое древо" : "Прежнее древо";
				d.querySelector(".av-trprev").hidden = !on;
				d.querySelector(".av-trbody").hidden = on;
			};
		document.body.appendChild(d);
		tone(d);
		tips(d);
		TREEW = d;
		const close = () => {
			if (TREEW === d) TREEW = null;
			d.remove();
			document.removeEventListener("keydown", key, true);
			tipHide();
		};
		const key = (e) => {
			if (e.key === "Escape") {
				e.stopImmediatePropagation();
				e.preventDefault();
				close();
			}
		};
		document.addEventListener("keydown", key, true);
		d.querySelectorAll("[data-x]").forEach((b) => {
			b.onclick = close;
		});
		d.onclick = (e) => {
			if (e.target === d) close();
		};
		if (SM && hc.skm && body && SM.bind) {
			try {
				SM.bind(d.querySelector(".av-trbody"), X);
			} catch (e) {}
		}
	}
	let TREEDATA = null;
	function oldTree(h) {
		const sk = h.sk,
			T = sk && sk.tree;
		if (h.bot) return '<p class="av-hint">Тестовый бот: навыков нет.</p>';
		if (!T) return '<p class="av-hint">Навыков пока нет.</p>';
		const rk = sk.t || {},
			spent = Object.values(rk).reduce((a, b) => a + (+b || 0), 0);
		return `<p class="av-mute">Дерево «${esc(T.name)}» · вложено очков: <b>${spent}</b></p>${skillsHtml(h.ab, "")}<div class="av-ot">${(
			T.branches || []
		)
			.map((B, bi) => {
				const pts = B.nodes.reduce((a, n) => a + (+rk[n.id] || 0), 0);
				return `<section class="av-bro" style="${bcs(bi)}"><span class="av-bn">${B.icon ? esc(B.icon) + " " : ""}${esc(B.name)} · ${pts}</span><span class="av-br">${[
					...B.nodes,
				]
					.sort((a, b) => (a.req || 0) - (b.req || 0))
					.map((n) => {
						const r = +rk[n.id] || 0;
						return `<span class="av-sk${r ? " av-has" : ""}" data-skn="${esc(n.name)}" data-skt=": ранг ${r} из ${n.max}">${esc(n.name)}<span class="av-rk">${Array.from({ length: n.max }, (_, q) => `<i${q < r ? ' class="av-f"' : ""}></i>`).join("")}</span></span>`;
					})
					.join("")}</span></section>`;
			})
			.join("")}</div>`;
	}

	document.addEventListener(
		"click",
		(e) => {
			const b = e.target.closest && e.target.closest(".av-root [data-apf]");
			if (!b) return;
			e.stopPropagation();
			e.preventDefault();
			void window.LGProfile.open(b.dataset.apf);
		},
		true,
	);
	document.addEventListener(
		"click",
		(e) => {
			const b = e.target.closest && e.target.closest(".av-root [data-tree]");
			if (!b) return;
			e.stopPropagation();
			e.preventDefault();
			void openTree(b.dataset.tree);
		},
		true,
	);

	const POS = {
		0: [17, 66],
		1: [50, 42],
		2: [50, 86],
		3: [83, 40],
		4: [83, 84],
	};
	const heroBtn = (h, slot, x, y, hw, sel, attr) =>
		`<button type="button" class="av-hero${sel ? " av-sel" : ""}${slot === 2 || slot === 4 ? " av-r" : ""}" ${attr} style="left:${x}%;top:${y}%;--hw:${hw}px" aria-label="${esc(h.name)}, ${esc(ROLE[h.role] || h.role)}, ${h.level} ур."><span class="av-f">${fig(h)}</span>${nm(h)}</button>`;
	function openSquad(login) {
		const o = ((D() && D().offers) || []).find((x) => x.login === login);
		if (!o) {
			X.toast("Этого отряда уже нет в списке - обнови соперников", true);
			return;
		}
		let sel = null;
		const w = openWin("squad", "av-wide");
		if (!w) return;
		const draw = () => {
			const H = o.def || [],
				h = sel != null ? H[sel] : null;
			w.innerHTML =
				wHead(
					esc(o.title || o.name),
					`5 из 5 · рейтинг ${o.rating} · сила ${big(o.power)}${o.ds ? " · вещи запомнены при «Сохранить»" : ""}`,
				) +
				`<div class="av-sqg" style="display:grid;grid-template-columns:540px 1fr;gap:14px">
        <div class="av-field av-fld" style="height:430px"><div class="av-bgc">${bgOf(dayLoc())}</div>${lanes()}${H.map((x, i) => (x ? heroBtn(x, i, POS[i][0], POS[i][1], 100, sel === i, `data-h="${i}"`) : "")).join("")}</div>
        <div class="av-sec" style="display:flex;flex-direction:column;gap:10px">${h ? heroSide(h, [ROLE[h.role] || h.role, `${h.level} ур.`, `рейтинг ${o.rating}`], sel === 2 || sel === 4, false) : '<div class="av-hint" style="margin:auto">Нажми на героя на поле</div>'}</div></div>`;
			bindX(w);
			w.querySelectorAll("[data-h]").forEach((b) => {
				b.onclick = (e) => {
					e.stopPropagation();
					sel = sel === +b.dataset.h ? null : +b.dataset.h;
					draw();
				};
			});
			w.onclick = (e) => {
				if (sel != null && !e.target.closest(".av-hero, .av-sec, .av-wh")) {
					sel = null;
					draw();
				}
			};
		};
		W.redraw = draw;
		draw();
	}

	const KR = { melee: 0, ranged: 1, magic: 2, heal: 3 };
	const autoOrder = (list) =>
		list
			.map((h, i) => ({
				l: h.login,
				r: KR[(F() && F().KIND && F().KIND[h.role]) || "melee"] ?? 0,
				lv: h.level,
				i,
			}))
			.sort((a, b) => a.r - b.r || b.lv - a.lv || a.i - b.i)
			.map((x) => x.l);
	function openMine() {
		const m = ME();
		if (!m || !m.squad || !m.squad.full) {
			openInv();
			return;
		}
		const by = Object.fromEntries(m.squad.members.map((h) => [h.login, h]));
		let order = swSlots(m).map((h) => h.login),
			sel = null;
		const w = openWin("own", "av-wide av-ownwin");
		if (!w) return;
		const draw = () => {
			const h = sel ? by[sel] : null,
				slotOf = (l) => order.indexOf(l);
			w.innerHTML =
				wHead(
					"Состав обороны",
					`${esc(m.squad.title || "Отряд")} · 5 из 5 · сила <b>${big(m.squad.power)}</b> · перетащи героя на другое место - так отряд встанет в бою${m.dsnap ? ` · вещи запомнены ${ago(m.dsnap.at)}` : ""}`,
				) +
				`<div class="av-sqg" style="display:grid;grid-template-columns:540px 1fr;gap:14px;height:460px">
        <div><div class="av-field av-own av-fld" style="height:460px"><div class="av-bgc">${bgOf(dayLoc())}</div>${lanes()}${[0, 1, 2, 3, 4].map((i) => `<span class="av-slotm" data-sl="${i}" style="left:${POS[i][0]}%;top:${POS[i][1] - 3}%"></span>`).join("")}
          ${order.map((l, i) => heroBtn(by[l], i, POS[i][0], POS[i][1], 100, sel === l, `data-k="${esc(l)}"`)).join("")}</div></div>
        <div class="av-sec" style="display:flex;flex-direction:column;gap:10px">${h ? heroSide(h, [ROLE[h.role] || h.role, `${h.level} ур.`, ["впереди", "в середине", "в середине", "сзади", "сзади"][slotOf(h.login)]], false, false) : '<div class="av-hint" style="margin:auto">Нажми на героя - вещи и навыки.<br>Перетащи героя на другое место.<br><br>Так отряд стоит, когда на него нападают.</div>'}</div></div>
      <div class="av-ownb" style="display:flex;gap:10px;justify-content:center;margin-top:12px"><button type="button" class="av-btn" data-a="auto">Авторасстановка</button><button type="button" class="av-btn av-red" data-a="save">Сохранить</button></div>`;
			bindX(w);
			w.querySelector('[data-a="auto"]').onclick = () => {
				order = autoOrder(m.squad.members);
				draw();
				X.toast("Расставлено по классам: ближний бой - вперёд");
			};
			w.querySelector('[data-a="save"]').onclick = async (e) => {
				const r = await post(
					{ op: "form", kind: "def", slots: order, snap: true },
					e.currentTarget,
				);
				if (!r) return;
				m.forms = m.forms || {};
				m.forms.def = { slots: order.slice(), auto: false };
				if (r.snapAt) m.dsnap = { at: r.snapAt };
				W.reload = true;
				X.toast("Оборона сохранена: вещи героев запомнены - в бою будут они");
				draw();
			};
			dragOn(
				w.querySelector(".av-fld"),
				"[data-k]",
				(i) => [POS[i][0], POS[i][1] - 3],
				(k, hot, moved) => {
					if (!moved) {
						sel = sel === k ? null : k;
						draw();
						return;
					}
					if (hot != null) {
						const from = order.indexOf(k),
							other = order[hot];
						order[hot] = k;
						order[from] = other;
					}
					sel = k;
					draw();
				},
			);
			w.onclick = (e) => {
				if (
					sel &&
					!e.target.closest(".av-hero, .av-sec, .av-wh, .av-slotm, .av-btn")
				) {
					sel = null;
					draw();
				}
			};
		};
		W.redraw = draw;
		draw();
	}

	function dragOn(fld, sel, posOf, cb) {
		if (!fld) return;
		let DR = null;
		fld.querySelectorAll(sel).forEach((b) =>
			b.addEventListener("pointerdown", (e) => {
				if (e.button !== 0) return;
				DR = {
					k: b.dataset.k || b.dataset.b,
					b,
					x0: e.clientX,
					y0: e.clientY,
					moved: false,
					fr: fld.getBoundingClientRect(),
					hot: null,
				};
				try {
					b.setPointerCapture(e.pointerId);
				} catch (er) {}
			}),
		);
		fld.addEventListener("pointermove", (e) => {
			const Dd = DR;
			if (!Dd) return;
			const dx = e.clientX - Dd.x0,
				dy = e.clientY - Dd.y0;
			if (!Dd.moved && Math.hypot(dx, dy) < 5) return;
			if (!Dd.moved) {
				Dd.moved = true;
				Dd.b.classList.add("av-drag");
				fld.classList.add("av-dragging");
				tipHide();
			}
			Dd.b.style.transform = `translate(calc(-50% + ${dx}px), calc(-100% + ${dy}px)) scale(1.06)`;
			const px = ((e.clientX - Dd.fr.left) / Dd.fr.width) * 100,
				py = ((e.clientY - Dd.fr.top) / Dd.fr.height) * 100;
			let best = null,
				bd = 1e9;
			for (let i = 0; i < 5; i++) {
				const [x, y] = posOf(i),
					dd = Math.hypot(
						((x - px) * Dd.fr.width) / 100,
						((y - py) * Dd.fr.height) / 100,
					);
				if (dd < bd) {
					bd = dd;
					best = i;
				}
			}
			Dd.hot = bd < 120 ? best : null;
			fld
				.querySelectorAll(".av-slotm")
				.forEach((mm) =>
					mm.classList.toggle("av-hot", +mm.dataset.sl === Dd.hot),
				);
		});
		const end = () => {
			const Dd = DR;
			DR = null;
			if (!Dd) return;
			fld.classList.remove("av-dragging");
			cb(Dd.k, Dd.hot, Dd.moved);
		};
		fld.addEventListener("pointerup", end);
		fld.addEventListener("pointercancel", end);
	}

	const BPOS = {
		0: [40, 66],
		1: [27, 44],
		2: [27, 88],
		3: [12, 42],
		4: [12, 86],
	};
	function bp(slot, foe) {
		const [x, y] = BPOS[slot];
		if (!PORT()) return foe ? [100 - x, y] : [x, y];
		const l = 15 + ((y - 42) / 46) * 70;
		return foe
			? [100 - l, 55 - ((40 - x) * 25) / 28]
			: [l, 72 + ((40 - x) * 23) / 28];
	}
	let FSPD = 1;
	try {
		FSPD = [1, 2, 4].includes(+localStorage.getItem("lgArSpd"))
			? +localStorage.getItem("lgArSpd")
			: 1;
	} catch (e) {
		FSPD = 1;
	}
	function openFight(target, rv) {
		const d = D(),
			m = ME();
		if (!m) return;
		if (!m.canAttack) {
			X.toast(m.why || "Сейчас напасть нельзя", true);
			return;
		}
		const o = rv ? null : (d.offers || []).find((x) => x.login === target);
		if (!rv && !o) {
			X.toast("Этого соперника уже нет в списке - обнови список", true);
			return;
		}
		const foeT = rv
			? (rv.ot || []).map((h) => ({
					login: h.l,
					name: h.n,
					role: h.r,
					level: h.v,
				}))
			: o.def || [];
		const title = rv ? rv.sq || rv.atkName : o.title || o.name;
		const by = Object.fromEntries(m.squad.members.map((h) => [h.login, h]));
		const fa =
			m.forms &&
			m.forms.atk &&
			Array.isArray(m.forms.atk.slots) &&
			m.forms.atk.slots.every((l) => by[l])
				? m.forms.atk.slots
				: swSlots(m).map((h) => h.login);
		let order = fa.slice(),
			sel = null;
		const w = openWin("fight", "av-wide");
		if (!w) return;
		const sub = `перетащи своих героев - так они встанут в нападении${o && !o.test ? ` · на кону: победа +${o.win}, поражение −${o.lose}` : ""} · боёв осталось ${(m.today || {}).left} из ${(m.today || {}).max}`;
		const draw = () => {
			const h = sel ? (sel[0] === "e" ? foeT[sel[1]] : by[sel[1]]) : null;
			const hb = (x, foe, i, key) => {
				const p = bp(i, foe);
				return `<button type="button" class="av-hero${foe ? " av-foe av-r" : ""}${sel && sel[0] === (foe ? "e" : "m") && String(sel[1]) === String(key) ? " av-sel" : ""}" data-b="${foe ? "e" + i : esc(key)}" ${foe ? "" : `data-k="${esc(key)}"`} style="left:${p[0]}%;top:${p[1]}%;--hw:90px"><span class="av-f">${fig(x)}</span>${nm(x)}</button>`;
			};
			w.innerHTML =
				wHead(
					`${rv ? "⚔ Месть: " : "Бой: "}${esc(m.squad.title || "Отряд")} против ${esc(title)}`,
					`${rv ? `они напали на тебя ${ago(rv.at)} - ` : ""}${sub}`,
				) +
				`<div class="av-fgrid" style="display:grid;grid-template-columns:1fr 360px;gap:12px"><div class="av-fcol"><div class="av-field av-bf av-own" style="height:440px"><div class="av-bgc">${bgOf(dayLoc())}</div><span class="av-side" style="left:12px">⚔ ${esc(m.squad.title || "Отряд")} · сила ${big(m.squad.power)}</span><span class="av-side" style="right:12px">🛡 ${esc(title)}${o ? ` · сила ${big(o.power)}` : ""}</span>
          ${[0, 1, 2, 3, 4].map((i) => `<span class="av-slotm" data-sl="${i}" style="left:${bp(i)[0]}%;top:${bp(i)[1] - 3}%"></span>`).join("")}${order.map((l, i) => hb(by[l], false, i, l)).join("")}${foeT.map((x, i) => hb(x, true, i, i)).join("")}<div class="av-res"></div></div>
          <div class="av-fbtns" style="display:flex;gap:10px;justify-content:flex-end;margin-top:12px"><button type="button" class="av-btn" data-a="asdef">Как в обороне</button><button type="button" class="av-btn av-red" data-a="go">⚔ В бой</button></div></div>
          <div class="av-sec av-fside" style="display:flex;flex-direction:column;gap:8px">${h ? heroSide(h, [sel[0] === "e" ? title : "твой отряд", ROLE[h.role] || h.role, `${h.level} ур.`], false, true) : '<div class="av-hint" style="margin:auto">Нажми на любого героя - его снаряжение и навыки.<br><br>Своих героев перетаскивай - так они встанут в нападении.</div>'}</div></div>
        <div class="av-spd av-fspd" style="display:none"><span>Скорость</span>${[1, 2, 4].map((v) => `<button type="button" class="av-btn" data-fsp="${v}" aria-pressed="${FSPD === v}">×${v}</button>`).join("")}</div>`;
			bindX(w);
			w.querySelector('[data-a="asdef"]').onclick = () => {
				order = swSlots(m).map((x) => x.login);
				draw();
			};
			w.querySelector('[data-a="go"]').onclick = (e) =>
				void runFight(e.currentTarget);
			const bf = w.querySelector(".av-bf");
			bf.querySelectorAll(".av-foe").forEach((b) => {
				b.onclick = (e) => {
					e.stopPropagation();
					const i = +b.dataset.b.slice(1);
					sel = sel && sel[0] === "e" && sel[1] === i ? null : ["e", i];
					draw();
				};
			});
			dragOn(
				bf,
				"[data-k]",
				(i) => {
					const p = bp(i);
					return [p[0], p[1] - 3];
				},
				(k, hot, moved) => {
					if (!moved) {
						sel = sel && sel[0] === "m" && sel[1] === k ? null : ["m", k];
						draw();
						return;
					}
					if (hot != null) {
						const from = order.indexOf(k),
							other = order[hot];
						order[hot] = k;
						order[from] = other;
					}
					sel = ["m", k];
					draw();
				},
			);
			w.onclick = (e) => {
				if (sel && !e.target.closest(".av-hero, .av-sec, .av-wh, .av-btn")) {
					sel = null;
					draw();
				}
			};
		};
		async function runFight(btn) {
			if (W.busy) return;
			btn.disabled = true;
			const r = await post(
				rv
					? { op: "revenge", id: String(rv.id), slots: order }
					: { op: "attack", target, slots: order },
				null,
			);
			if (!r) {
				btn.disabled = false;
				return;
			}
			W.busy = true;
			W.reload = true;
			W.redraw = null;
			const Wn = W.win,
				r0 = Wn.getBoundingClientRect();

			const side = Wn.querySelector(".av-fside");
			if (side) side.remove();
			Wn.querySelector(".av-fgrid").style.gridTemplateColumns = "1fr";
			Wn.querySelector(".av-fbtns").style.display = "none";
			const bf = Wn.querySelector(".av-bf");
			bf.style.height = "";
			bf.classList.remove("av-own");
			const sp = Wn.querySelector(".av-fspd");
			sp.style.display = "";
			const s0 = Wn.querySelector(".av-wh .av-s");
			if (s0) s0.textContent = "идёт бой";
			Wn.classList.add("av-full");
			const r1 = Wn.getBoundingClientRect();
			Wn.style.transformOrigin = "0 0";
			Wn.style.transition = "none";
			Wn.style.transform = `translate(${r0.left - r1.left}px, ${r0.top - r1.top}px) scale(${r0.width / Math.max(1, r1.width)}, ${r0.height / Math.max(1, r1.height)})`;
			void Wn.getBoundingClientRect();
			Wn.style.transition = "transform .5s cubic-bezier(.2, .8, .2, 1)";
			Wn.style.transform = "";
			sp.onclick = (e) => {
				const b = e.target.closest("[data-fsp]");
				if (!b) return;
				FSPD = +b.dataset.fsp;
				try {
					localStorage.setItem("lgArSpd", String(FSPD));
				} catch (er) {}
				sp.querySelectorAll("[data-fsp]").forEach((x) =>
					x.setAttribute("aria-pressed", String(x === b)),
				);
				if (W && W.player && W.player.setSpeed) W.player.setSpeed(FSPD);
			};
			await new Promise((res) => setTimeout(res, 500));
			if (!W || W.win !== Wn) return;
			Wn.style.transition = "";
			Wn.style.transformOrigin = "";
			const f = r.fight;
			const host = document.createElement("div");
			host.className = "av-play";
			bf.innerHTML = "";
			bf.appendChild(host);
			const res = document.createElement("div");
			res.className = "av-res";
			bf.appendChild(res);
			W.player = F().play(host, f, {
				speed: FSPD,
				bare: true,
				auto: false,
				onDone: () => fightDone(f, res, r),
			});
			await new Promise((res2) => setTimeout(res2, 1000));
			if (!W || W.win !== Wn || !W.player) return;
			W.player.restart();
		}
		function fightDone(f, res, r) {
			if (!W) return;
			W.busy = false;
			const s1 = W.win.querySelector(".av-wh .av-s");
			if (s1) s1.textContent = "бой окончен";
			const win = f.winner === "atk",
				dR = f.rating && f.rating.atk ? f.rating.atk.d : 0,
				t = (r && r.steps) || [];
			const left = Math.max(
					0,
					((ME() && ME().today && ME().today.left) || 1) - 1,
				),
				max = (ME() && ME().today && ME().today.max) || 5;
			res.innerHTML = `<div><b class="av-t ${win ? "av-w" : "av-l"}">${win ? "Победа!" : "Поражение"}</b><div class="av-rline">${f.test ? "тестовый бой, рейтинг не меняется" : `рейтинг ${signed(dR)}`}${t.length ? ` · сундук за ${t.map((x) => x.wins).join(", ")} ${plural(t[t.length - 1].wins, "победу", "победы", "побед")} - забери на шкале` : ""}</div>
        <div class="av-mute" style="margin-bottom:12px">Осталось боёв: ${left} из ${max}</div><div style="display:flex;gap:8px;justify-content:center"><button type="button" class="av-btn" data-x>Закрыть</button></div></div>`;
			res.classList.add("av-on");
			bindX(res);
		}
		W.redraw = draw;
		draw();
	}

	const figs = (ot) =>
		`<span class="av-ft">${(ot || []).map((h) => `<span class="av-f" data-tip-h="${esc(h.n)} · ${h.v} ур.">${fig({ login: h.l, name: h.n, role: h.r })}</span>`).join("")}</span>`;
	function revBtn(r, bigB) {
		if (r.side === "atk")
			return r.revenge
				? '<span class="av-rvd" data-tip-h="Этот бой - месть">⚔ месть</span>'
				: "";
		if (r.rvUsed)
			return `<span class="av-rvd ${r.rvRes === "w" ? "av-w" : r.rvRes === "l" ? "av-l" : ""}">${r.rvRes === "w" ? "⚔ отомщено ✓" : r.rvRes === "l" ? "⚔ месть не удалась" : "⚔ отомщено"}</span>`;
		if (!r.rv) return "";
		const m = ME(),
			t = (m && m.today) || {},
			no = !(m && m.canAttack);
		return `<button type="button" class="av-btn ${no ? "" : "av-red"} av-rvb${bigB ? " av-big" : ""}" data-rev="${esc(String(r.id))}"${no ? " disabled" : ""} data-tip-h="${no ? esc(m && m.why ? m.why : "Боёв на сегодня не осталось - купи бой или приходи завтра") : `Напасть на ${esc(r.sq || r.atkName)} в ответ · тратит 1 бой из ${t.left}`}">⚔ Отомстить</button>`;
	}
	function openLog() {
		const list = (D() && D().mine) || [];
		const w = openWin("log", "av-wide av-logwin");
		if (!w) return;
		const won = list.filter((x) => x.win).length;
		w.innerHTML =
			wHead(
				"Журнал битв",
				`${list.length} последних боёв · побед ${won}, поражений ${list.length - won}`,
			) +
			`<div class="av-logw"><ol class="av-log">${
				list.length
					? list
							.map((r) => {
								const atk = r.side === "atk",
									k = r.win ? "av-w" : "av-l",
									t = ago(r.at);
								return `<li class="av-lr ${k}"><span class="av-lbt"><button type="button" class="av-btn" data-rep="${esc(String(r.id))}" aria-label="Отчёт о бое"${r.has ? "" : ' disabled data-tip-h="Запись боя больше не хранится"'}>📜<span class="av-lbl"> Отчёт о бое</span></button><button type="button" class="av-btn av-rpb" data-play="${esc(String(r.id))}" data-tip-h="${r.has ? "Посмотреть бой заново" : "Запись боя больше не хранится"}"${r.has ? "" : " disabled"}>▶</button></span><span class="av-op"><span class="av-ar" data-tip-h="${atk ? "Ты напал" : "Напали на тебя"}">${atk ? "⟶" : "⟵"}</span><span><b>${esc(r.sq || (atk ? r.defName : r.atkName))}</b><small class="${k}">${resText(r)}<span class="av-mt2"> · ${t}</span></small></span>${figs(r.ot)}</span><b class="av-dl ${k}">${r.test ? "тест" : signed(r.d)}</b><span class="av-rvc">${revBtn(r)}</span><time>${t}</time></li>`;
							})
							.join("")
					: '<li class="av-empty0"><span class="av-mute">Нападений и обороны пока не было.</span></li>'
			}</ol></div>`;
		bindX(w);
		w.querySelectorAll("[data-rep]").forEach((b) => {
			b.onclick = () => openReport(b.dataset.rep);
		});
		w.querySelectorAll("[data-play]").forEach((b) => {
			b.onclick = () => openReplay(b.dataset.play, "log");
		});
		w.querySelectorAll("[data-rev]").forEach((b) => {
			b.onclick = () => revenge(b.dataset.rev);
		});
	}
	function revenge(id) {
		const r = ((D() && D().mine) || []).find(
			(x) => String(x.id) === String(id),
		);
		if (!r) return;
		const m = ME();
		if (!m || !m.canAttack) {
			X.toast((m && m.why) || "Боёв на сегодня не осталось", true);
			return;
		}
		openFight(null, r);
	}
	const FIGHTS = new Map();
	async function fightOf(id) {
		if (FIGHTS.has(id)) return FIGHTS.get(id);
		const r = await X.api("/api/arena/fight?id=" + encodeURIComponent(id));
		if (!r || !r.ok || !r.fight || !r.fight.log) {
			X.toast(
				errText(r && r.ok ? { error: "Запись боя больше не хранится" } : r),
				true,
			);
			return null;
		}
		FIGHTS.set(id, r.fight);
		if (FIGHTS.size > 12) FIGHTS.delete(FIGHTS.keys().next().value);
		return r.fight;
	}

	async function openReport(id) {
		const f = await fightOf(id);
		if (!f) return;
		const row =
			((D() && D().mine) || []).find((x) => String(x.id) === String(id)) || {};
		const myS = f.me === "def" ? "def" : "atk",
			foS = myS === "atk" ? "def" : "atk";
		const T = { m: f.teams[myS] || [], e: f.teams[foS] || [] };
		const REP = { m: 0, e: 0 };
		const w = openWin("rep", "av-wide av-repwin");
		if (!w) return;
		const title = {
			m: myS === "atk" ? f.atkSq || f.atkName : f.defSq || f.defName,
			e: foS === "atk" ? f.atkSq || f.atkName : f.defSq || f.defName,
		};
		const ORD = [3, 1, 0, 2, 4],
			LIFT = { 0: 0, 1: 16, 2: 16, 3: 32, 4: 32 };
		const statsOf = (sd, k) => {
			const h = T[sd][k],
				inf = (f.info || {})[h.k] || {},
				s = inf.st || {},
				mag = s.main ? s.main === "mag" : s.mag > s.atk;
			return [
				["Здоровье", s.hp || h.hp || 0, "#e0574f"],
				[mag ? "Магия" : "Атака", mag ? s.mag : s.atk, "#f08a24"],
				["Броня", s.def, "#7a8aa6"],
				["Сопрот.", s.resist, "#8e6bd1", "Сопротивление - защита от магии"],
				["Крит", (s.crit || 0) + "%", "#e0a800"],
				["Уклонение", (s.dodge || 0) + "%", "#3fa646"],
			];
		};
		const draw = () => {
			const ok = f.winner === myS;
			const pick = (sd) =>
				`<span class="av-rft">${ORD.map((sl) => {
					const k = T[sd].findIndex((h) => +h.k.slice(1) === sl);
					return k < 0
						? ""
						: `<button type="button" class="av-rf${REP[sd] === k ? " av-sel" : ""}" data-pk="${sd}:${k}" style="margin-bottom:${LIFT[sl]}px" aria-label="${esc(T[sd][k].name)} · ${["впереди", "2 линия", "2 линия", "3 линия", "3 линия"][sl]}"><span class="av-f">${fig(T[sd][k])}</span><span class="av-nm"><b>${T[sd][k].level}</b><span>${esc(T[sd][k].name)}</span></span></button>`;
				}).join("")}</span>`;
			const side = (sd, win, role) =>
				`<div class="av-sd av-rsd ${win ? "av-ok" : "av-bad"}${sd === "e" ? " av-r" : ""}"><div class="av-rh"><span class="av-mk">${win ? "✓" : "✕"}</span><span><b>${esc(title[sd])}</b><small>${win ? "победил" : "проиграл"} · ${role}</small></span></div>${pick(sd)}</div>`;
			const cardH = (sd) => {
				const k = REP[sd],
					h = T[sd][k],
					inf = (f.info || {})[h.k] || {},
					mine = statsOf(sd, k),
					oth = statsOf(sd === "m" ? "e" : "m", REP[sd === "m" ? "e" : "m"]),
					num = (v) => parseFloat(String(v)) || 0;
				return `<div class="av-sec av-rcard"><div class="av-rnav"><button type="button" class="av-btn" data-nv="${sd}:-1" aria-label="Предыдущий герой">‹</button><div><b>${esc(h.name)}</b><div><span class="av-tag">${esc(title[sd])}</span><span class="av-tag">${esc(ROLE[h.role] || h.role)}</span><span class="av-tag">${h.level} ур.</span></div></div><button type="button" class="av-btn" data-nv="${sd}:1" aria-label="Следующий герой">›</button></div>
          <div class="av-rb2${sd === "e" ? " av-r" : ""}"><div class="av-rdl">${pdoll((f.it || {})[h.k] || [], h, sd === "e", true)}<h6>Навыки Арены</h6>${skillsHtml(inf.ab, h.login)}</div>
          <div class="av-hsv">${mine.map(([n, v, c, t], i) => `<span class="${num(v) > num(oth[i] && oth[i][1]) ? "av-up" : ""}" style="--c:${c}"${t ? ` data-tip-h="${t}"` : ""}><small>${n}</small><b>${esc(v)}</b></span>`).join("")}</div></div></div>`;
			};
			const rvb = revBtn(
				{
					...row,
					...(f.row || {}),
					side: f.me,
					id: f.id,
					sq: row.sq || title.e,
				},
				true,
			);
			w.innerHTML =
				wHead(
					"Отчёт о бое",
					`${ago(f.at)} · ${f.me === "atk" ? "ты напал на" : "на тебя напал"} ${esc(title.e)} · рейтинг <b class="${ok ? "av-w" : "av-l"}">${f.test ? "тест" : signed((f.rating[myS] || {}).d || 0)}</b>`,
					`${rvb}<button type="button" class="av-btn av-red" data-a="play">▶ Смотреть бой</button><button type="button" class="av-btn" data-a="back">← Журнал</button>`,
				) +
				`<div class="av-logw"><div class="av-lb" style="display:grid;grid-template-columns:1fr 1fr;gap:12px">${side("m", ok, myS === "atk" ? "напал" : "оборона")}${side("e", !ok, myS === "atk" ? "оборона" : "напал")}</div>
          <div class="av-rcards" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px">${cardH("m")}${cardH("e")}</div></div>`;
			bindX(w);
			w.querySelector('[data-a="back"]').onclick = () => openLog();
			w.querySelector('[data-a="play"]').onclick = () => openReplay(id, "rep");
			const rv = w.querySelector("[data-rev]");
			if (rv) rv.onclick = () => revenge(rv.dataset.rev);
			w.querySelectorAll("[data-pk]").forEach((b) => {
				b.onclick = () => {
					const [sd, k] = b.dataset.pk.split(":");
					REP[sd] = +k;
					draw();
				};
			});
			w.querySelectorAll("[data-nv]").forEach((b) => {
				b.onclick = () => {
					const [sd, dd] = b.dataset.nv.split(":");
					const n = T[sd].length || 5;
					REP[sd] = (REP[sd] + +dd + n) % n;
					draw();
				};
			});
		};
		W.redraw = draw;
		draw();
	}

	let RPTOK = 0,
		RPSPD = 1;
	try {
		RPSPD = [1, 2, 4].includes(+localStorage.getItem("lgArRSpd"))
			? +localStorage.getItem("lgArRSpd")
			: 1;
	} catch (e) {
		RPSPD = 1;
	}
	async function openReplay(id, from) {
		const f = await fightOf(id);
		if (!f) return;
		if (!F() || !F().play) {
			X.toast("Поле боя не загрузилось - открой Арену ещё раз", true);
			return;
		}
		const w = openWin("replay", "av-wide av-rpwin av-full");
		if (!w) return;
		const myS = f.me === "def" ? "def" : "atk",
			ok = f.winner === myS;
		const foeT = f.me === "def" ? f.atkSq || f.atkName : f.defSq || f.defName;
		const res = ok
			? myS === "atk"
				? "Победа"
				: "Отбились"
			: myS === "atk"
				? "Поражение"
				: "Не устояли";
		const dR = f.test ? "тест" : signed((f.rating[myS] || {}).d || 0);
		const draw = () => {
			w.innerHTML =
				wHead(
					"▶ Повтор боя",
					`${ago(f.at)} · ${f.me === "atk" ? "ты напал на" : "на тебя напал"} ${esc(foeT)} · итог <b class="${ok ? "av-w" : "av-l"}">${res} ${dR}</b>`,
					`<button type="button" class="av-btn" data-a="back">${from === "rep" ? "← Отчёт" : "← Журнал"}</button>`,
				) +
				`<div class="av-field av-bf"><div class="av-play"></div><span class="av-rpturn">Ход 1</span><div class="av-res"></div></div>
        <div class="av-rpctl"><button type="button" class="av-btn" data-a="again">⟳ Сначала</button><div class="av-rpbar"><i></i></div><span class="av-spd av-rpSpd">${[1, 2, 4].map((v) => `<button type="button" class="av-btn" data-rsp="${v}" aria-pressed="${RPSPD === v}">×${v}</button>`).join("")}</span><button type="button" class="av-btn" data-a="skip">⏭ Пропустить</button></div>`;
			bindX(w);
			w.querySelector('[data-a="back"]').onclick = () => {
				if (from === "rep") openReport(id);
				else openLog();
			};
			let ended = false;
			const tok = ++RPTOK,
				bar = w.querySelector(".av-rpbar i"),
				turn = w.querySelector(".av-rpturn"),
				rs = w.querySelector(".av-res"),
				skipB = w.querySelector('[data-a="skip"]');
			if (W.player) {
				W.player.destroy();
				W.player = null;
			}
			W.player = F().play(w.querySelector(".av-play"), f, {
				speed: RPSPD,
				bare: true,
				auto: false,
				onStep: (i, n, r) => {
					if (tok !== RPTOK) return;
					bar.style.transform = `scaleX(${n ? Math.min(1, i / n) : 1})`;
					if (r) turn.textContent = `Ход ${r}`;
				},
				onDone: () => {
					if (tok !== RPTOK) return;
					ended = true;
					bar.style.transform = "scaleX(1)";
					skipB.disabled = true;
					turn.textContent = `Ход ${f.rounds}`;
					rs.innerHTML = `<div><b class="av-t ${ok ? "av-w" : "av-l"}">${res}</b><div class="av-rline">рейтинг ${dR} · раундов: ${f.rounds}${f.drift ? " · запись по новым правилам боя - итог из журнала" : ""}</div><div style="display:flex;gap:8px;justify-content:center"><button type="button" class="av-btn" data-a="again2">⟳ Смотреть снова</button><button type="button" class="av-btn av-red" data-a="back2">${from === "rep" ? "📜 К отчёту" : "📜 К журналу"}</button></div></div>`;
					rs.classList.add("av-on");
					rs.querySelector('[data-a="again2"]').onclick = draw;
					rs.querySelector('[data-a="back2"]').onclick = () =>
						w.querySelector('[data-a="back"]').click();
				},
			});
			w.querySelector('[data-a="again"]').onclick = draw;
			skipB.onclick = () => {
				if (W && W.player) W.player.skip();
			};
			w.querySelector(".av-rpSpd").onclick = (e) => {
				const b = e.target.closest("[data-rsp]");
				if (!b) return;
				RPSPD = +b.dataset.rsp;
				try {
					localStorage.setItem("lgArRSpd", String(RPSPD));
				} catch (er) {}
				w.querySelectorAll("[data-rsp]").forEach((x) =>
					x.setAttribute("aria-pressed", String(x === b)),
				);
				if (W && W.player && W.player.setSpeed) W.player.setSpeed(RPSPD);
			};
			setTimeout(() => {
				if (tok === RPTOK && W && W.player && !ended) W.player.restart();
			}, 1000);
		};
		draw();
	}

	let TOPR = null;
	async function openWeek(rowI, tab) {
		let T = tab || "cur",
			sel = null;
		const w = openWin("week", "av-wide");
		if (!w) return;
		if (window.LGArenaN) window.LGArenaN.week();
		w.innerHTML = wHead("Рейтинг недели", "загружаем…");
		bindX(w);

		const r =
			TOPR && Date.now() - TOPR.at < 30e3
				? TOPR
				: await X.api("/api/arena/top");
		if (!W || W.win !== w) return;
		if (r !== TOPR) TOPR = r && r.ok ? { ...r, at: Date.now() } : null;
		const Wk = (TOPR && TOPR.week) || (D() && D().week) || {};
		const draw = () => {
			const prev = T === "prev",
				P = Wk.prev;
			const L0 = prev ? (P && P.list) || [] : Wk.list || [];
			const meRow = prev ? P && P.me : Wk.me;
			const head = prev
				? P
					? `<div class="av-wprev">${meRow && meRow.place <= 3 ? `<span class="av-wpc">${cupSvg(meRow.place, gst())}</span>` : ""}<div><b>Неделя ${new Date(P.start).toLocaleDateString("ru-RU", { day: "numeric", month: "long", timeZone: "Europe/Moscow" })} - ${new Date(P.end - 1).toLocaleDateString("ru-RU", { day: "numeric", month: "long", timeZone: "Europe/Moscow" })} закрыта${meRow ? ` · твоё место ${meRow.place}, очки ${signed(meRow.pts)}` : " · ты не бился на той неделе"}</b>
          ${P.got ? `<div class="av-wpr"><span>${P.got.kind === "full" ? "Тебе выдано:" : `Тебе выдано (50% за ${esc(P.got.of)}, ${P.got.place} место):`}</span><span class="av-rw">${prizeRw(P.got)}</span>${P.half ? `<span>каждому в отряде:</span><span class="av-rw">${prizeRw(P.half)}</span>` : ""}</div>` : '<div class="av-wpr">Награды получили игроки 1-3 места и их отряды (50%)</div>'}
          <small>Награды пришли в сумку в понедельник 00:00 по Москве</small></div></div>`
					: '<p class="av-hint">Итогов прошлой недели пока нет.</p>'
				: "";
			w.innerHTML =
				wHead(
					"Рейтинг недели",
					`${prev ? "итоги прошлой недели · награды выданы" : `игроков: ${Wk.total || 0} · итог через <span class="av-clk" data-until="${Date.now() + (+Wk.endIn || 0)}">${hms(+Wk.endIn || 0)}</span>`} · нажми на героя - вещи и навыки`,
				) +
				`<div class="av-itabs av-wtabs" role="tablist">${[
					["cur", "Эта неделя"],
					["prev", "Прошлая неделя"],
				]
					.map(
						([k, t]) =>
							`<button type="button" role="tab" data-wt="${k}" aria-selected="${T === k}">${t}</button>`,
					)
					.join("")}</div>${head}
        ${!prev && +Wk.reset ? `<p class="av-hint">Рейтинг сбрасывается к ${+Wk.reset} каждый понедельник после итогов</p>` : ""}
        <div class="av-wkh"><span>#</span><span>Игрок</span><span>Отряд</span><span>Очки</span><span></span></div>
        <ol class="av-wkw">${
					L0.map(
						(
							r0,
							ri0,
						) => `<li class="av-wkr${r0.me ? " av-me" : ""}" data-row="${ri0}"><span class="av-medal${r0.place <= 3 ? " av-g" + r0.place : ""}">${r0.place}</span><span class="av-who"><b>${esc(r0.name)}</b><small>${esc(r0.squad || "без отряда")}</small>${r0.power ? `<small class="av-spw">⚔ сила ${big(r0.power)}</small>` : ""}</span>
          <span class="av-team">${(r0.team || []).map((h, hi) => `<button type="button" class="av-th${h.login === r0.login ? " av-me" : ""}${sel && sel[0] === ri0 && sel[1] === hi ? " av-sel" : ""}" data-th="${ri0}:${hi}"><span class="av-f">${fig(h)}</span><span class="av-nm${String(h.name).length > 10 ? " av-w2" : ""}" style="--fs:${String(h.name).length <= 6 ? 10.5 : String(h.name).length <= 10 ? 9.5 : 8.5}px"><b>${h.level}</b><span title="${esc(h.name)}">${esc(h.name).replace(/_/g, "_<wbr>")}</span></span></button>`).join("")}</span>
          <span class="av-pts"><b>${signed(r0.pts)}</b><small>${prev ? "итог" : "очки"}</small></span>
          <span>${cup(r0.place)}${prev && r0.got ? '<small class="av-got">выдано ✓</small>' : ""}</span></li>`,
					).join("") || '<li class="av-hint">Пока никого</li>'
				}</ol><div class="av-wpops"></div>`;
			bindX(w);
			clk();
			w.querySelectorAll("[data-wt]").forEach((b) => {
				b.onclick = (e) => {
					e.stopPropagation();
					if (T !== b.dataset.wt) {
						T = b.dataset.wt;
						sel = null;
						draw();
					}
				};
			});
			w.querySelectorAll("[data-th]").forEach((b) => {
				b.onclick = (e) => {
					e.stopPropagation();
					const [a, c] = b.dataset.th.split(":").map(Number);
					sel = sel && sel[0] === a && sel[1] === c ? null : [a, c];
					draw();
				};
			});
			w.onclick = (e) => {
				if (sel && !e.target.closest(".av-pop, .av-th")) {
					sel = null;
					draw();
				}
			};
			if (sel) {
				const r0 = L0[sel[0]],
					h = r0 && r0.team && r0.team[sel[1]],
					b = w.querySelector(`[data-th="${sel[0]}:${sel[1]}"]`);
				if (h && b) {
					const wr = w.getBoundingClientRect(),
						br = b.getBoundingClientRect(),
						PWW = Math.min(560, wr.width - 20),
						left = Math.max(
							10,
							Math.min(
								wr.width - PWW - 14,
								br.left - wr.left + br.width / 2 - PWW / 2,
							),
						);
					const hc = cardNow(h.login);
					if (!hc)
						cardLoad(h.login, () => {
							if (W && W.win === w) draw();
						});
					w.querySelector(".av-wpops").innerHTML =
						`<div class="av-pop av-wpop" style="width:${PWW}px;left:${left}px;top:${br.bottom - wr.top + w.scrollTop + 6}px"><h6>${esc(h.name)} · ${esc(ROLE[h.role] || h.role)} ${h.level} ур.</h6>${hc ? (hc.err ? `<div class="av-hint">${esc(hc.err)}</div>` : `<div class="av-rbody">${pdoll(hc.items, h, false, true)}<div><h6>Навыки Арены</h6>${skillsHtml(hc.ab, h.login)}</div></div>`) : '<div class="av-hint">Загружаем героя…</div>'}</div>`;
					const pp = w.querySelector(".av-wpop"),
						ph = pp.offsetHeight,
						vis = w.clientHeight;
					if (br.bottom - wr.top + 6 + ph > vis - 8) {
						if (br.top - wr.top - 6 - ph >= 8)
							pp.style.top = br.top - wr.top + w.scrollTop - ph - 6 + "px";
						else pp.scrollIntoView({ block: "nearest" });
					}
				}
			}
		};
		W.redraw = draw;
		draw();
		const el =
			Number.isInteger(rowI) && w.querySelector(`[data-row="${rowI}"]`);
		if (el) {
			el.scrollIntoView({ block: "center" });
			el.classList.add("av-flash");
			setTimeout(() => el.classList.remove("av-flash"), 1600);
		} else {
			const me = w.querySelector(".av-wkr.av-me");
			if (me && me.scrollIntoView) me.scrollIntoView({ block: "nearest" });
		}
	}

	async function openInv(tab0) {
		let tab = tab0 || "nick",
			online = null,
			friends = null;
		const w = openWin("inv", "av-wide av-invwin");
		if (!w) return;
		const loadOnline = async () => {
			const r = await X.api("/api/arena/online");
			online = r && r.ok ? r : { list: [], err: errText(r) };
			if (W && W.win === w) draw();
		};
		const loadFriends = async () => {
			const r = await X.api("/api/arena/friends");
			friends = r && r.ok ? r : { list: [], err: errText(r) };
			if (W && W.win === w) draw();
		};
		const draw = () => {
			const m = ME();
			if (!m) return;
			const sq = m.squad,
				team = sq
					? sq.members
					: m.self
						? [{ ...m.self, me: true, lead: true }]
						: [],
				free = 5 - team.length,
				full = free <= 0,
				lead = sq ? sq.lead === m.login : true;
			const sent = new Set((m.sent || []).map((x) => x.login));
			const member = (h) =>
				`<span class="av-m">${h.lead || (sq && sq.lead === h.login) ? '<span class="av-lead" data-tip-h="Глава отряда">👑</span>' : lead && sq && h.login !== m.login ? `<button type="button" class="av-kick" data-kick="${esc(h.login)}" data-tip-h="Исключить из отряда">✕</button>` : ""}<span class="av-f">${fig(h)}</span>${nm(h)}</span>`;
			const empty = () =>
				'<span class="av-m av-empty"><span class="av-f">+</span><small>свободно</small></span>';
			const row = (h, st, btn, dis) =>
				`<li class="av-irow${dis ? " av-off" : ""}"><span class="av-f">${fig(h)}</span><span><b>${esc(h.name)}</b><small>${esc(ROLE[h.role] || h.role || "")}${h.level ? `, ${h.level} ур.` : ""}${h.power ? ` · сила ${big(h.power)}` : ""}</small></span>${st}${btn}</li>`;
			const callBtn = (login, ok) => {
				const s0 = sent.has(login),
					dis = full || s0 || !ok || !m.hero;
				return `<button type="button" class="av-btn ${dis ? "" : "av-red"}" data-call="${esc(login)}"${dis ? " disabled" : ""}>${s0 ? "Позван" : "Позвать"}</button>`;
			};
			let body;
			if (tab === "nick") {
				if (!online) void loadOnline();
				const N = (online && online.list) || [];
				body = `<form class="av-inick" data-a="invf"><label class="sr-only" for="avInvN">Ник игрока</label><input id="avInvN" placeholder="ник игрока этого канала" maxlength="26" autocomplete="off"${full ? " disabled" : ""}><button class="av-btn av-red" type="submit"${full ? " disabled" : ""}>Позвать</button></form>
          <p class="av-inote">${full ? "Отряд собран - чтобы позвать кого-то, сначала освободи место (✕ у героя сверху)." : "Игрок получит приглашение на вкладке «Арена»."}</p>
          <h4 class="av-ih4"><span class="av-onl"></span> Сейчас в сети и без отряда <span>${online ? N.length : "…"}</span></h4><ul class="av-ilist">${online ? (N.length ? N.map((h) => row(h, `<span class="av-st av-on">${h.lf ? "ищет отряд" : "онлайн здесь"}</span>`, callBtn(h.login, true))).join("") : '<li class="av-inote">Сейчас никого - позови по нику или из друзей.</li>') : '<li class="av-inote">Смотрим, кто в сети…</li>'}</ul>`;
			} else if (tab === "fr") {
				if (!friends) void loadFriends();
				const Fl = (friends && friends.list) || [];
				body = !friends
					? '<p class="av-inote">Загружаем друзей…</p>'
					: friends.closed
						? '<p class="av-inote">Друзья пока закрыты - позови игрока по нику.</p>'
						: !Fl.length
							? '<p class="av-inote">Друзей пока нет - добавь их через меню ника, кнопка «Друзья».</p>'
							: `<p class="av-inote" style="margin:0 2px 8px">Друзья - онлайн сверху</p><ul class="av-ilist">${Fl.map((f) => row({ login: f.login, name: f.name, role: f.role, level: f.level }, `<span class="av-st">${esc(f.ok ? (f.on ? (f.on.here ? "на канале" : "на сайте") : "не в сети") : f.why || "")}</span>`, f.ok ? callBtn(f.login, true) : "", !f.ok)).join("")}</ul>`;
			} else {
				const fd = (D() && D().finder) || { lf: [], open: [], mine: {} },
					mi = fd.mine || {};
				const canPull = m.hero && (!sq || (lead && !full));
				const sw = (k, onv, text, dis, note) =>
					`<label${dis ? ' class="av-dis"' : ""}><input type="checkbox" role="switch" data-fsw="${k}"${onv ? " checked" : ""}${dis ? " disabled" : ""}><span class="av-tg"></span><span>${text}<small>${esc(note)}</small></span></label>`;
				body = `<div class="av-isw">${sw("lfg", mi.lf, "Я ищу отряд", !!sq || !m.hero, sq ? "ты уже в отряде" : "тебя увидят главы отрядов")}${sw("recruit", mi.open, "Открыть набор", !lead || full || !sq, !sq ? "сначала собери отряд" : !lead ? "открывает глава отряда" : full ? "отряд собран" : mi.open ? "отряд видят игроки без отряда" : "отряд увидят игроки без отряда")}</div>
          <h4 class="av-ih4">Ищут отряд <span>${fd.lf.length}</span></h4><ul class="av-ilist">${fd.lf.length ? fd.lf.map((x) => row(x, `<span class="av-st">${ago(x.at)}</span>`, `<button type="button" class="av-btn ${canPull ? "av-red" : ""}" data-pull="${esc(x.login)}"${canPull ? "" : " disabled"}>Позвать</button>`)).join("") : '<li class="av-inote">Пока никто - включи «Я ищу отряд», чтобы тебя нашли.</li>'}</ul>
          <h4 class="av-ih4">Набирают в отряд <span>${fd.open.length}</span></h4><ul class="av-ilist">${fd.open.length ? fd.open.map((x) => `<li class="av-irow"><span class="av-f av-fe">⚑</span><span><b>${esc(x.title)}</b><small>уровни ${x.levels.join(", ")}</small></span><span class="av-st">${x.free} ${plural(x.free, "место", "места", "мест")}</span><button type="button" class="av-btn" data-sqjoin="${esc(x.sq)}"${!sq && m.hero ? "" : ' disabled data-tip-h="Ты уже в отряде"'}>Вступить</button></li>`).join("") : '<li class="av-inote">Открытых наборов нет.</li>'}</ul>`;
			}
			w.innerHTML =
				wHead(
					"Пригласить в отряд",
					`${esc((sq && sq.title) || "Новый отряд")} · в отряде ${team.length} из 5`,
				) +
				`<div class="av-isq">${team.map(member).join("")}${Array.from({ length: Math.max(0, free) }, empty).join("")}</div>
        <div class="av-itabs" role="tablist">${[
					["nick", "По нику"],
					["fr", "Друзья"],
					["find", "Поиск"],
				]
					.map(
						([k, t]) =>
							`<button type="button" role="tab" data-it="${k}" aria-selected="${tab === k}">${t}</button>`,
					)
					.join("")}</div>
        <div class="av-ibody">${body}</div>
        <div class="av-iwait av-iwbox"><span class="av-inote" style="margin:0">Ждём ответа:</span>${(m.sent || []).length ? m.sent.map((x) => `<span class="av-chip2">${esc(x.name)}</span>`).join("") : '<span class="av-inote" style="margin:0">пока никого не позвали</span>'}</div>`;
			bindX(w);
			w.querySelectorAll("[data-it]").forEach((b) => {
				b.onclick = () => {
					tab = b.dataset.it;
					draw();
				};
			});
			w.querySelectorAll("[data-kick]").forEach((b) => {
				b.onclick = async () => {
					if (await post({ op: "kick", login: b.dataset.kick }, b)) {
						X.toast("Игрок исключён из отряда");
						W.reload = true;
						await load();
						draw();
					}
				};
			});
			w.querySelectorAll("[data-call]").forEach((b) => {
				b.onclick = async () => {
					if (await post({ op: "invite", login: b.dataset.call }, b)) {
						X.toast("Приглашение отправлено - ждём ответа");
						await load();
						draw();
					}
				};
			});
			w.querySelectorAll("[data-pull]").forEach((b) => {
				b.onclick = async () => {
					if (await post({ op: "pull", login: b.dataset.pull }, b)) {
						X.toast("Игрок в твоём отряде");
						await load();
						draw();
					}
				};
			});
			w.querySelectorAll("[data-sqjoin]").forEach((b) => {
				b.onclick = async () => {
					if (await post({ op: "sqjoin", sq: b.dataset.sqjoin }, b)) {
						X.toast("Ты в отряде");
						await load();
						draw();
					}
				};
			});
			w.querySelectorAll("[data-fsw]").forEach((c) => {
				c.onchange = async () => {
					if (await post({ op: c.dataset.fsw, on: c.checked }, null)) {
						await load();
						draw();
					} else draw();
				};
			});
			const f = w.querySelector('[data-a="invf"]');
			if (f)
				f.onsubmit = async (e) => {
					e.preventDefault();
					const i = f.querySelector("input"),
						v = i.value.trim();
					if (!v) return;
					if (
						await post({ op: "invite", login: v }, f.querySelector("button"))
					) {
						X.toast("Приглашение отправлено - ждём ответа");
						await load();
						draw();
					}
				};
		};
		W.redraw = draw;
		W.reload = true;
		draw();
	}

	return {
		open(el, x, v) {
			X = x;
			root = el;
			opened = true;
			MODE = modeNow();
			if (v) {
				V = v;
				render();
				chatPoll();
			} else void load();
			addEventListener("resize", onResize);
			darkWas = isDark();
			if (!darkMo && typeof MutationObserver === "function") {
				darkMo = new MutationObserver(toneAll);
				darkMo.observe(document.documentElement, {
					attributes: true,
					attributeFilter: ["class"],
				});
			}
		},
		reload: () => load(),
		close() {
			opened = false;
			closeWin();
			clearTimeout(chatT);
			chatT = 0;
			clearTimeout(clkT);
			clkT = 0;
			tipHide();
			removeEventListener("resize", onResize);
			if (darkMo) {
				darkMo.disconnect();
				darkMo = null;
			}
			if (TREEW) {
				TREEW.remove();
				TREEW = null;
			}
		},
	};
})();
