(() => {
	const $ = (s, r = document) => r.querySelector(s);
	const esc = (s) =>
		String(s == null ? "" : s).replace(
			/[&<>"]/g,
			(c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
		);
	const fmt = (n) => Number(n || 0).toLocaleString("ru-RU");
	const RC = {
		О: "#c9c1b2",
		Н: "#7ad36b",
		Р: "#62aefc",
		Э: "#c08bff",
		Л: "#ffad45",
		F: "#d98a7a",
		Z: "#e8d27a",
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
	const gst = () => {
		const s = String(style());
		return GST.includes(s) ? s : "legion";
	};
	const CLS = [
		["legionary", "Легионер"],
		["paladin", "Паладин"],
		["rogue", "Разбойник"],
		["archer", "Лучник"],
		["mage", "Маг"],
		["priest", "Жрец"],
		["necromancer", "Некромант"],
		["recruit", "Новобранец"],
	];
	const COVERS = [
		["style", "var(--gw-acc)"],
		["sky", "#8cc4ff"],
		["mint", "#8fdc7e"],
		["teal", "#6fd6c8"],
		["lav", "#c9a2ff"],
		["berry", "#d97aa6"],
		["slate", "#9aa7b8"],
	];

	const PCOV = {
		sunset: [1, "Закат"],
		sea: [1, "Море"],
		forest: [1, "Лес"],
		royal: [1, "Королевская"],
		aurora: [2, "Северное сияние"],
		clouds: [2, "Облака"],
		meteors: [2, "Звездопад"],
	};
	const PAT = {
		none: "none",
		stripe:
			"repeating-linear-gradient(45deg, #fff 0 10px, transparent 10px 24px)",
		dots: "radial-gradient(#fff 22%, transparent 24%) 0 0 / 22px 22px",
		wave: "radial-gradient(circle at 50% 120%, transparent 40%, #fff 41% 46%, transparent 47%) 0 0 / 40px 24px",
	};
	const PATN = {
		none: "Без узора",
		stripe: "Полосы",
		dots: "Горошек",
		wave: "Волны",
	};
	const TIERN = { 1: "Премиум", 2: "Премиум+" };
	const NICK_COLORS = {
		gold: "#f2c14e",
		red: "#ff5a5f",
		green: "#3ecf8e",
		blue: "#4aa3ff",
		violet: "#b07cff",
		orange: "#ff9f43",
		pink: "#ff7eb6",
		teal: "#2ec4b6",
	};
	const NICK_GRADS = {
		fire: ["#ffb347", "#ff3d6e", "Огонь"],
		sea: ["#4aa3ff", "#2ec4b6", "Море"],
		aurora: ["#3ecf8e", "#b07cff", "Сияние"],
		royal: ["#f2c14e", "#ff7eb6", "Королевский"],
	};
	const HERO_FRAMES = {
		gold: [1, "Золотая", "#ffd23f"],
		silver: [1, "Серебряная", "#dfe7f1"],
		leaf: [1, "Листва", "#5fd38d"],
		ember: [2, "Угли", "#ff7a2f"],
		star: [2, "Звёздная", "#b9a2ff"],
	};
	const AVATAR_ANIMS = {
		bob: [1, "Покачивание"],
		wave: [1, "Привет рукой"],
		glow: [2, "Сияние"],
		sparkle: [2, "Искры"],
	};
	const WBG = {
		parch: [1, "Пергамент", 0],
		grid: [1, "Клетка", 0],
		leaf: [1, "Листва", 0],
		sky: [1, "Лазурь", 0],
		night: [2, "Звёздная ночь", 1],
		snow: [2, "Снегопад", 1],
		ember: [2, "Угли", 1],
	};
	const UNDERLAYS = {
		parch: [1, "Пергамент"],
		wood: [1, "Дерево"],
		marble: [1, "Мрамор"],
		leather: [1, "Кожа"],
		velvet: [2, "Бархат"],
		night: [2, "Звёздная ночь"],
		gold: [2, "Золото ✦"],
		aurora: [2, "Сияние ✦"],
	};

	const BADGES = {
		founder: [
			"Основатель",
			"В игре с первой недели - один из первых 100 игроков канала",
			"#ffcf4a",
			"★",
		],
		streamer: [
			"Стример канала",
			"Владелец канала, на котором идёт поход",
			"#c9a2ff",
			"▶",
		],
		mod: [
			"Модератор",
			"Помогает следить за порядком на канале",
			"#62aefc",
			"⚑",
		],
		tester: [
			"Тестировщик",
			"Проверял новинки до выхода (betaTesters)",
			"#7ad36b",
			"⚙",
		],
		vet1: [
			"Ветеран сезона 1",
			"Прошёл весь первый сезон похода",
			"#d08a4a",
			"I",
		],
		halloween: [
			"Хэллоуин 2026",
			"Победитель ивента «Ночь тыкв»",
			"#ff8a3a",
			"🎃",
		],
		arena1: [
			"Чемпион Арены",
			"Первое место недели на Арене 5×5",
			"#ff5a7a",
			"⚔",
		],
		helper: ["Добрый лекарь", "Вылечил союзников 1 000 раз", "#5fd3a0", "✚"],
		top10: [
			"Топ-10 соц. рейтинга",
			"Был в десятке соц. рейтинга канала",
			"#ffd24a",
			"♛",
		],
	};
	const ST = [
		["won", "побед в боях"],
		["boss", "главных врагов"],
		["fire", "у последнего костра"],
		["caught", "рыбы поймано"],
		["ore", "камней добыто"],
		["sells", "вещей продано"],
		["thief", "краж"],
		["ach", "достижений"],
	];
	const nickStyle = (n) => {
		if (NICK_GRADS[n])
			return `background-image:linear-gradient(90deg,${NICK_GRADS[n][0]},${NICK_GRADS[n][1]},${NICK_GRADS[n][0]});-webkit-background-clip:text;background-clip:text;color:transparent`;
		if (NICK_COLORS[n]) return `color:${NICK_COLORS[n]}`;
		return "";
	};
	const okTier = (need, t) => (t || 0) >= need;
	const day = (t) => {
		try {
			return new Date(+t).toLocaleDateString("ru-RU", {
				day: "numeric",
				month: "long",
			});
		} catch (e) {
			return "";
		}
	};
	const ago = (t) => {
		const d0 = new Date();
		d0.setHours(0, 0, 0, 0);
		const x = +t;
		if (x >= +d0) return "сегодня";
		if (x >= +d0 - 864e5) return "вчера";
		try {
			return new Date(x)
				.toLocaleDateString("ru-RU", { day: "numeric", month: "short" })
				.replace(".", "");
		} catch (e) {
			return "";
		}
	};

	let crN = 0;
	function crown(t, h = 24) {
		const q = "pfcr" + ++crN,
			L =
				'stroke="#3a2410" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"';
		const gold =
			`<linearGradient id="${q}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2a8"/><stop offset=".45" stop-color="#ffcc3d"/><stop offset="1" stop-color="#d98a12"/></linearGradient>` +
			`<linearGradient id="${q}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd85a"/><stop offset="1" stop-color="#b8700c"/></linearGradient>`;
		if (+t === 1)
			return `<svg class="crown t1" viewBox="0 0 64 48" height="${h}" role="img" aria-label="Премиум"><title>Премиум</title><defs>${gold}</defs>
      <path d="M10 35 L6 15 L20 25 L32 9 L44 25 L58 15 L54 35 Z" fill="url(#${q}g)" ${L}/>
      <path d="M12.5 31 L10 19.5 L19.5 26.5" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/>
      <rect x="9" y="34" width="46" height="9" rx="3" fill="url(#${q}b)" ${L}/>
      <circle cx="6" cy="14" r="3.6" fill="#fff4c8" ${L}/><circle cx="32" cy="8" r="3.8" fill="#fff4c8" ${L}/><circle cx="58" cy="14" r="3.6" fill="#fff4c8" ${L}/>
      <circle cx="20" cy="38.5" r="2.4" fill="#e8455c" stroke="#3a2410" stroke-width="1.4"/><path d="M32 35.6 L34.6 38.5 L32 41.4 L29.4 38.5 Z" fill="#4aa3ff" stroke="#3a2410" stroke-width="1.4" stroke-linejoin="round"/><circle cx="44" cy="38.5" r="2.4" fill="#e8455c" stroke="#3a2410" stroke-width="1.4"/>
      <circle cx="19.4" cy="37.8" r=".8" fill="#fff" opacity=".9"/><circle cx="43.4" cy="37.8" r=".8" fill="#fff" opacity=".9"/></svg>`;
		const star = (x, y, r, c) =>
			`<path d="M${x} ${y - r} L${x + r * 0.28} ${y - r * 0.28} L${x + r} ${y} L${x + r * 0.28} ${y + r * 0.28} L${x} ${y + r} L${x - r * 0.28} ${y + r * 0.28} L${x - r} ${y} L${x - r * 0.28} ${y - r * 0.28} Z" fill="${c}" stroke="#3a2410" stroke-width="1.1" stroke-linejoin="round"/>`;
		return `<svg class="crown t2" viewBox="0 0 72 52" height="${h * 1.08}" role="img" aria-label="Премиум+"><title>Премиум+</title><defs>${gold}
      <linearGradient id="${q}v" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3dcff"/><stop offset=".45" stop-color="#a45cff"/><stop offset="1" stop-color="#4b1890"/></linearGradient></defs>
      ${star(9, 7, 5, "#fff6c8")}${star(63, 9, 4, "#e8d2ff")}
      <path d="M12 38 L7 16 L19 26 L25 11 L36 23 L47 11 L53 26 L65 16 L60 38 Z" fill="url(#${q}g)" ${L}/>
      <path d="M14.5 34 L11 21.5 L18.5 27.5" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/>
      <rect x="11" y="37" width="50" height="9" rx="3" fill="url(#${q}b)" ${L}/>
      <circle cx="7" cy="15" r="3.3" fill="#fff4c8" ${L}/><circle cx="25" cy="10" r="3.3" fill="#fff4c8" ${L}/><circle cx="47" cy="10" r="3.3" fill="#fff4c8" ${L}/><circle cx="65" cy="15" r="3.3" fill="#fff4c8" ${L}/>
      <path d="M36 15 L43 24 L36 33 L29 24 Z" fill="url(#${q}v)" ${L}/><path d="M36 15 L36 33 M29 24 L43 24" stroke="#fff" stroke-width="1.2" opacity=".55"/><path d="M31.5 22 L36 17 L38 19" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".9"/>
      <circle cx="22" cy="41.5" r="2.3" fill="#a45cff" stroke="#3a2410" stroke-width="1.4"/><circle cx="36" cy="41.5" r="2.3" fill="#e8455c" stroke="#3a2410" stroke-width="1.4"/><circle cx="50" cy="41.5" r="2.3" fill="#a45cff" stroke="#3a2410" stroke-width="1.4"/>
      <circle cx="62" cy="43" r="7.5" fill="#7a2fe0" stroke="#3a2410" stroke-width="2.2"/><path d="M62 39 V47 M58 43 H66" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/></svg>`;
	}
	const HEART = (on) =>
		`<svg class="hrt" viewBox="0 0 24 22" aria-hidden="true"><path d="M12 20.5 C5 15.5 1.5 11.6 1.5 7.4 C1.5 4.1 4 1.6 7.1 1.6 C9.2 1.6 11 2.8 12 4.6 C13 2.8 14.8 1.6 16.9 1.6 C20 1.6 22.5 4.1 22.5 7.4 C22.5 11.6 19 15.5 12 20.5 Z" fill="${on ? "#ff4d6d" : "none"}" stroke="${on ? "#8a1a2e" : "currentColor"}" stroke-width="2.2" stroke-linejoin="round"/>${on ? '<path d="M6.5 5.5 C5.2 6 4.4 7.2 4.5 8.6" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>' : ""}</svg>`;
	function badge(id, h = 30) {
		const b = BADGES[id];
		if (!b) return "";
		return `<svg class="bdg" viewBox="0 0 40 46" height="${h}" role="img" aria-label="${esc(b[0])}"><title>${esc(b[0])} - ${esc(b[1])}</title>
      <path d="M20 2 L36 8 V22 C36 33 28 40 20 44 C12 40 4 33 4 22 V8 Z" fill="${b[2]}" stroke="#241a14" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M20 6.5 L32 11 V22 C32 30 26 35.5 20 39" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".45"/>
      <text x="20" y="27.5" text-anchor="middle" font-size="${/[\u{1F300}-\u{1FAFF}]/u.test(b[3]) ? 15 : 17}" font-weight="900" fill="#241a14" font-family="Nunito, system-ui, sans-serif">${b[3]}</text></svg>`;
	}

	function fig(login, look) {
		const D = window.MDDoodle;
		if (!D || !D.jDoodle) return "";
		try {
			let lk = look || null;
			if (!lk && D.defaultsFor) {
				const raw = D.defaultsFor(login, style());
				lk = raw
					? Object.fromEntries(
							Object.entries(raw).map(([k, o]) => [
								k,
								o && typeof o === "object" && "v" in o ? o.v : o,
							]),
						)
					: null;
			}
			return String(
				D.jDoodle(D.jhash ? D.jhash(login) : 1, "happy", null, null, lk) || "",
			);
		} catch (e) {
			console.warn("[профиль] человечек", e);
			return "";
		}
	}
	const avBg = (login) => {
		const h =
			[...login].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7) % 360;
		return `hsl(${h} 32% 24%)`;
	};
	const pl = (n, a, b, c) => {
		const m = n % 10,
			h = n % 100;
		return m === 1 && h !== 11
			? a
			: m >= 2 && m <= 4 && (h < 10 || h >= 20)
				? b
				: c;
	};

	let X = null,
		D0 = null,
		root = null,
		bgOff = null,
		ttm = 0;
	let more = false,
		stranger = false,
		pop = null,
		aboutEd = false,
		abErr = "",
		abDraft = null,
		rep = null,
		tryOn = null,
		likers = null,
		busy = false;
	const ME = () => !!(D0 && D0.me);
	const phone = () => window.innerWidth <= 640;
	const E = () => ME() && !stranger;

	const P = () => {
		if (!ME() || !tryOn) return D0;
		const q = {
			...D0,
			pm: Math.max(D0.pm || 0, tryOn.need),
			pf: { ...(D0.pf || {}) },
		};
		if (tryOn.key === "cover") q.cover = tryOn.v;
		else q.pf[tryOn.key] = tryOn.v;
		return q;
	};
	const tier = () => (ME() ? +D0.tier || 0 : 0);
	const full = (p) => (ME() ? !stranger || p.vis === "all" : !!p.full);
	const AB = () =>
		Object.fromEntries(
			((D0.own && D0.own.got) || [])
				.concat(D0.show || [])
				.map((a) => [a.id, a]),
		);

	function head(p) {
		const cv = (COVERS.find((c) => c[0] === p.cover) || COVERS[0])[1],
			cname = (CLS.find((c) => c[0] === p.cls) || [, ""])[1];
		let acts;
		const likeMe = `<button type="button" class="likec${pop && pop.k === "likes" ? " open" : ""}"${stranger ? " disabled" : ' data-ed="likes" aria-haspopup="dialog"'} title="${stranger ? "Лайки профиля" : "Кто поставил лайк"}">${HEART(true)}<b>${fmt(p.likes)}</b></button>`;
		if (ME())
			acts =
				likeMe +
				(stranger
					? '<button type="button" class="gl-btn" data-stranger>Вернуться к своему виду</button>'
					: `<button type="button" class="gl-btn ghost" data-ed="priv" aria-haspopup="dialog">🔒 ${p.vis === "all" ? "Видят все" : "Только друзья"}</button><button type="button" class="gl-btn ghost" data-stranger>Как видят другие</button>`);
		else
			acts = `<button type="button" class="gl-btn ghost like${p.liked ? " on" : ""}" data-like aria-pressed="${!!p.liked}" aria-label="${p.liked ? "Убрать лайк" : "Поставить лайк"}, сейчас ${p.likes}">${HEART(p.liked)}<b>${fmt(p.likes)}</b></button>${p.blocked ? "" : p.friend ? '<button type="button" class="gl-btn ghost" data-unfriend>✓ В друзьях</button>' : `<button type="button" class="gl-btn" data-friend ${p.sent ? 'aria-disabled="true"' : ""}>${p.sent ? "Заявка отправлена" : "Добавить в друзья"}</button>`}
      ${p.blocked ? "" : '<button type="button" class="gl-btn ghost" data-mail>Написать письмо</button>'}<button type="button" class="gl-btn ghost" data-more aria-haspopup="menu" aria-expanded="${more}">Ещё ▾</button>
      ${more ? `<div class="more" role="menu">${p.blocked ? "" : '<button type="button" role="menuitem" data-m="squad">Пригласить в отряд</button><button type="button" role="menuitem" data-m="trade">Предложить обмен</button>'}<button type="button" role="menuitem" data-m="gift">${crown(1, 18)} Подарить Премиум</button><button type="button" role="menuitem" class="bad" data-m="report">Пожаловаться…</button><button type="button" role="menuitem" class="bad" data-m="block">${p.blocked ? "Разблокировать" : "Заблокировать"}</button></div>` : ""}`;
		const A = avaParts(p),
			e = E(),
			on = (k) => (pop && pop.k === k ? " open" : "");
		const pc =
			PCOV[p.cover] && okTier(PCOV[p.cover][0], p.pm || (ME() ? tier() : 0))
				? p.cover
				: "";
		return `<div class="cover${p.cover === "none" ? " off" : ""}${pc ? " pcv pcv-" + pc : ""}${e ? " edz" + on("cover") : ""}" style="--cv:${pc ? "transparent" : cv};--cvp:${pc ? "none" : PAT[p.pat] || "none"}"${e ? ' data-ed="cover" role="button" tabindex="0" aria-label="Изменить обложку"' : ""}>${pc ? '<i class="cl1"></i><i class="cl2"></i>' + (pc === "meteors" ? '<i class="mt m1"></i><i class="mt m2"></i><i class="mt m3"></i>' : "") : ""}${e ? `<span class="pen pc">✎ Обложка</span><button type="button" class="pen pc pbg${on("bg")}" data-ed="bg" aria-label="Фон окна">✎ Фон окна</button>` : ""}</div>
      <div class="ph"><div class="avw">${e ? `<button type="button" class="edw avb${on("ava")}" data-ed="ava" aria-label="Рамка и живой аватар">${A.ava}<span class="pen pa">✎</span></button>` : A.ava}</div>
        <h2 class="pnm">${e ? `<button type="button" class="edw nkb${on("nick")}" data-ed="nick" aria-label="Цвет ника">${A.nick}<span class="pen">✎</span></button>` : A.nick}</h2>
        <div class="pid"><div class="trow"><span class="lvchip" title="Уровень ${p.lvl}"><b>${p.lvl}</b> ур.</span>${e ? `<button type="button" class="tchip edw${on("title")}" data-ed="title" aria-label="Титул">🏷 ${p.title ? esc(p.title) : "Выбрать титул"} <span class="pen in">✎</span></button>` : p.title ? `<span class="tchip">🏷 ${esc(p.title)}</span>` : ""}${(
					p.pin || []
				)
					.filter((b) => BADGES[b])
					.map(
						(b) =>
							`<span class="bpin" title="${esc(BADGES[b][0] + " - " + BADGES[b][1])}">${badge(b, 26)}</span>`,
					)
					.join("")}</div>
          <div class="meta">${p.where && !(ME() && stranger) ? `<span class="on"><i></i>${esc(p.where)}</span>` : ""}${cname ? `<span><b>${esc(cname)}</b></span>` : ""}${p.gt ? `<span>Гильдия <b>[${esc(p.gt)}]</b></span>` : "<span>Без гильдии</span>"}${full(p) && p.since ? `<span>В игре с ${esc(day(p.since))}</span>` : ""}</div></div>
        <div class="pact">${acts}</div></div>`;
	}
	function avaParts(p) {
		const t = p.pm || 0,
			pf = p.pf || {},
			hf =
				HERO_FRAMES[pf.hf] &&
				okTier(HERO_FRAMES[pf.hf][0], t || (ME() ? tier() : 0))
					? pf.hf
					: "",
			av =
				AVATAR_ANIMS[pf.av] &&
				okTier(AVATAR_ANIMS[pf.av][0], t || (ME() ? tier() : 0))
					? pf.av
					: "";
		const tt = t || (ME() ? tier() : 0),
			grad = NICK_GRADS[pf.n] && tt >= 2,
			nk = (NICK_COLORS[pf.n] && tt >= 1) || grad ? nickStyle(pf.n) : "";
		return {
			ava: `<div class="ava${hf ? " hf hf-" + hf : ""}${av ? " av-" + av : ""}" style="--av:${avBg(p.login)}${hf ? ";--hf:" + HERO_FRAMES[hf][2] : ""}" title="${hf ? "Рамка «" + HERO_FRAMES[hf][1] + "»" : ""}"><span class="fig">${fig(p.login, p.look)}</span>${av === "sparkle" ? '<i class="sp s1"></i><i class="sp s2"></i><i class="sp s3"></i>' : ""}</div>`,
			nick: `${p.gt ? `<span class="tag">[${esc(p.gt)}]</span>` : ""}<span class="nk${grad ? " shim" : ""}" style="${nk}" title="${esc(p.nick)}">${esc(p.nick)}</span>${t ? crown(t, 24) : ""}`,
		};
	}

	function viewHtml(p) {
		const ab = AB(),
			show = ME()
				? D0.showIds || (D0.show || []).map((a) => a.id)
				: (p.show || []).map((a) => a.id);
		const mx = p.mx || {},
			cls = CLS.filter(([k]) => mx[k]).sort(
				(a, b) => mx[b[0]][0] - mx[a[0]][0],
			);
		const showN = [0, 1, 2]
			.map((i) => {
				const a = ab[show[i]],
					tag = E()
						? `button type="button" data-ed="slot" data-slot="${i}" aria-label="Место витрины ${i + 1}"`
						: "div",
					end = E() ? "button" : "div",
					op = pop && pop.k === "slot" && pop.slot === i ? " open" : "";
				return a
					? `<${tag} class="sh${E() ? " edw" + op : ""}" title="${esc(a.name + ": " + a.desc)}"><span class="md" style="--rc:${RC[a.rar] || RC["Р"]}">${esc(a.icon)}</span><b>${esc(a.name)}</b><small>${esc(a.desc)}</small>${E() ? '<span class="pen in">✎</span>' : ""}</${end}>`
					: `<${tag} class="sh empty${E() ? " edw" + op : ""}">${E() ? "＋ Выбрать достижение" : "Пусто"}</${end}>`;
			})
			.join("");
		const s = p.stats || {},
			FRo = p.friends || { total: 0, list: [] },
			FR = FRo.list || [],
			onl = FR.filter((f) => f.on).length,
			F = full(p);
		const uw =
			UNDERLAYS[(p.pf || {}).w] &&
			okTier(UNDERLAYS[p.pf.w][0], p.pm || (ME() ? tier() : 0))
				? p.pf.w
				: "";
		const lock = (what) =>
			`<section class="card locked"><span class="lk">🔒</span><div><b>${esc(what)}</b><span>${ME() ? "Так твой профиль видят игроки не из друзей." : `${esc(p.nick)} показывает это только друзьям.`}</span></div>${ME() || p.friend || p.blocked ? "" : `<button type="button" class="gl-btn" data-friend ${p.sent ? 'aria-disabled="true"' : ""}>${p.sent ? "Заявка отправлена" : "Добавить в друзья"}</button>`}</section>`;
		const tryb =
			ME() && tryOn
				? `<div class="tryb">👀 <span><b>Примерка: ${esc(tryOn.name)}</b> - видно только тебе. Применить можно с подпиской «${TIERN[tryOn.need]}».</span><button type="button" class="gl-btn" data-prem>${crown(tryOn.need, 18)} Оформить</button><button type="button" class="gl-btn ghost" data-tryoff>Снять</button></div>`
				: "";
		const blkb =
			!ME() && p.blocked
				? `<div class="blkb">⛔ <span><b>Ты заблокировал ${esc(p.nick)}.</b> Он не может писать тебе, звать в друзья и в отряд. Профиль ты видишь как все - по его настройкам приватности.</span><button type="button" class="gl-btn ghost" data-m="block">Разблокировать</button></div>`
				: "";
		const bdg = (p.badges || []).filter(([b]) => BADGES[b]);
		const badgesCard = `<section class="card"><h3>Значки <span>${bdg.length}</span>${E() && bdg.length ? '<button type="button" class="lnk" data-ed="badges">✎ Закрепить</button>' : ""}</h3>${bdg.length ? `<div class="bgl">${bdg.map(([b, at]) => `<div class="bgi${(p.pin || []).includes(b) ? " pin" : ""}" title="${esc(BADGES[b][1])}">${badge(b, 38)}<span><b>${esc(BADGES[b][0])}</b><small>${esc(day(at))}</small></span></div>`).join("")}</div>` : '<p class="about empty">Пусто</p>'}</section>`;
		const abT = abDraft != null ? abDraft : p.about || "";
		const soc = p.soc || { score: 0, place: 0, total: 0 },
			ach = p.ach || [0, 0];
		return `${tryb}${blkb}${ME() && stranger ? `<div class="strb">👁 Так твой профиль видят игроки не из друзей${p.vis === "all" ? " - выбрано «Профиль видят: все игроки», скрыто только «где я сейчас»" : " - выбрано «Профиль видят: только друзья»"}</div>` : ""}<div class="pb"><div class="col">
        ${F ? "" : lock("О себе, статистика, классы и друзья")}
        ${F ? `<section class="card"><h3>О себе ${E() && !aboutEd ? '<button type="button" class="lnk" data-ed="about">✎ Изменить</button>' : ""}</h3>${aboutEd ? `<label class="abed"><textarea data-about maxlength="300" placeholder="Кто ты в Легионе, чем занимаешься, кого ищешь в отряд">${esc(abT)}</textarea><span class="abr"><em>${abT.length} / 300</em><button type="button" class="gl-btn ghost" data-abcancel>Отмена</button><button type="button" class="gl-btn" data-absave>Сохранить</button></span>${abErr ? `<span class="aberr" role="alert">${esc(abErr)}</span>` : '<span class="abhint">Без ссылок, @упоминаний и мата - текст видят все игроки. По жалобам модератор канала может его скрыть.</span>'}</label>` : `<p class="about${p.about ? "" : " empty"}">${p.about ? esc(p.about) : ME() ? "Расскажи о себе - нажми «Изменить»." : "Игрок пока ничего о себе не написал."}</p>`}</section>` : ""}
        <section class="card${uw ? " uw uw-" + uw : ""}">${uw === "gold" || uw === "aurora" ? '<i class="uwfx" aria-hidden="true"></i>' : ""}<h3>Витрина достижений ${E() ? '<button type="button" class="lnk sm" data-ed="uw">✎ Подложка</button>' : ""}${F ? `<button type="button" class="lnk${E() ? " sm" : ""}" data-ach>Все достижения ${ach[0]} / ${ach[1]}</button>` : ""}</h3><div class="show">${showN}</div></section>
        ${
					F
						? `<section class="card"><h3>Статистика</h3><div class="stats">${ST.map(([k, n]) => `<div class="st"><b>${fmt(s[k] || 0)}</b><span>${n}</span></div>`).join("")}</div></section>
        <section class="card"><h3>Классы <span>мастерство</span></h3>${cls.length ? `<div class="cls">${cls.map(([k, n]) => `<div class="cl${k === p.cls ? " main" : ""}"><b>${n}</b><span class="bar"><i style="width:${mx[k][1]}%"></i></span><span class="num">${mx[k][0]} ур.</span></div>`).join("")}</div>` : '<p class="about empty">Пусто</p>'}</section>`
						: ""
				}
      </div><div class="col">
        ${badgesCard}
        <section class="card"><h3>Соц. рейтинг</h3><div class="soc"><span class="big">${fmt(soc.score)}</span><span class="pl">${soc.place ? `место <b>${soc.place}</b> из ${fmt(soc.total)}<br>на канале` : "пока без места<br>в рейтинге"}</span></div>
          ${ME() ? "" : '<div class="vote"><button type="button" class="gl-btn ghost" data-vote="1">👍 Соц+</button><button type="button" class="gl-btn ghost" data-vote="-1">👎 Соц-</button></div>'}</section>
        <section class="card"><h3>Арена 5×5</h3><div class="kv"><span>Неделя</span><b>${p.arena ? p.arena.place + "-е место" : "-"}</b></div><div class="kv"><span>Лига</span><b>${p.arena ? esc(p.arena.league) : "Пусто"}</b></div><div class="kv"><span>Побед за неделю</span><b>${p.arena ? p.arena.wins : 0}</b></div></section>
        ${
					F
						? `<section class="card"><h3>Друзья <span>${FRo.total} · в сети ${onl}</span></h3>${
								FR.length
									? `<div class="fr">${FR.slice(0, 8)
											.map(
												(f) =>
													`<button type="button" class="fi" data-fr="${esc(f.login)}" title="${esc(f.name)}"><span class="fa" style="--av:${avBg(f.login)}"><span class="fig">${fig(f.login)}</span>${f.on ? '<i aria-label="в сети"></i>' : ""}</span><span>${esc(f.name)}</span></button>`,
											)
											.join("")}</div>`
									: '<p class="about empty">Пусто</p>'
							}</section>`
						: ""
				}
        ${E() ? '<p class="priv">✎ Нажми на обложку, аватар, ник, титул или место витрины, чтобы изменить. Сохраняется сразу.</p>' : ""}
      </div></div>`;
	}

	const POPT = {
		badges: "Значки у ника",
		bg: "Фон окна",
		likes: "Лайки профиля",
		cover: "Обложка",
		ava: "Аватар",
		nick: "Цвет ника",
		title: "Титул",
		uw: "Подложка витрины",
		slot: "Место витрины",
		priv: "Приватность",
	};
	function popHtml() {
		if (!pop) return "";
		const p = D0,
			k = pop.k,
			t = tier();
		let body = "",
			needPrem = false;
		const row = (label, key, opts, dots) => {
			if (opts.some((o) => !okTier(o[2], t))) needPrem = true;
			return optRow(label, key, opts, dots);
		};
		const curCover = (D0.row && D0.row.cover) || p.cover;
		if (k === "badges")
			body = `<p class="priv">До 3 значков у ника - их видно сразу под именем.</p><div class="plist">${(
				p.badges || []
			)
				.filter(([b]) => BADGES[b])
				.map(
					([b]) =>
						`<button type="button" role="menuitemcheckbox" data-bpin="${b}" aria-checked="${(p.pin || []).includes(b)}">${badge(b, 26)}${esc(BADGES[b][0])}</button>`,
				)
				.join("")}</div>`;
		else if (k === "likes")
			body =
				likers == null
					? '<p class="priv">Загружаю…</p>'
					: `<p class="priv lkh">${likers.length ? `Последние ${likers.length} из ${fmt(p.likes)} · новые сверху` : "Лайков пока нет"}</p><div class="plist lk">${likers.map((x) => `<button type="button" data-fr="${esc(x.login)}" title="${esc(x.name)}"><span class="fa" style="--av:${avBg(x.login)}"><span class="fig">${fig(x.login)}</span></span>${esc(x.name)}<small>${ago(x.at)}</small></button>`).join("")}</div><p class="priv">Лайк ставит каждый игрок один раз. Число видят все, список - только ты.</p>`;
		else if (k === "cover") {
			if (Object.values(PCOV).some((c) => !okTier(c[0], t))) needPrem = true;
			const sel = tryOn && tryOn.key === "cover" ? tryOn.v : curCover;
			body = `<div class="seg" role="group" aria-label="Обложка"><button type="button" data-cv="${curCover === "none" ? "style" : curCover}" aria-pressed="${curCover !== "none"}">Показывать</button><button type="button" data-cv="none" aria-pressed="${curCover === "none"}">Без обложки</button></div>${curCover === "none" ? '<p class="priv">Обложка выключена - шапка начинается сразу с аватара.</p>' : ""}<div class="cvopt"${curCover === "none" ? " hidden" : ""}><span class="ol">Обложки подписки</span><div class="pcl">${Object.entries(
				PCOV,
			)
				.map(([x, c]) => {
					const lk = !okTier(c[0], t);
					return `<button type="button" data-pcv="${x}" data-need="${c[0]}" aria-pressed="${sel === x}" class="pcv pcv-${x}${lk ? " lkd" : ""}" title="${c[1]} · ${TIERN[c[0]]}"><i class="cl1"></i><i class="cl2"></i>${x === "meteors" ? '<i class="mt m1"></i>' : ""}<span>${c[1]}${c[0] === 2 ? " ✦" : ""}</span>${lk ? '<b class="lkb">🔒</b>' : ""}</button>`;
				})
				.join(
					"",
				)}</div><span class="ol">Цвет</span><div class="swatch" role="group" aria-label="Цвет">${COVERS.map(([c, v]) => `<button type="button" data-cv="${c}" style="--c:${v}" aria-pressed="${curCover === c}" title="${c === "style" ? "Цвет стиля канала" : ""}" aria-label="${c === "style" ? "Цвет стиля канала" : "Цвет"}">${c === "style" ? "✦" : ""}</button>`).join("")}</div><p class="priv">✦ - цвет стиля канала, меняется вместе со стилем.</p><span class="ol">Узор</span><div class="seg" role="group">${Object.keys(
				PAT,
			)
				.map(
					(x) =>
						`<button type="button" data-pat="${x}" aria-pressed="${p.pat === x}">${PATN[x]}</button>`,
				)
				.join("")}</div></div>`;
		} else if (k === "ava")
			body =
				row(
					"Рамка",
					"hf",
					[["", "Без рамки", 0]].concat(
						Object.entries(HERO_FRAMES).map(([x, f]) => [
							x,
							f[1],
							f[0],
							`--dot:${f[2]}`,
						]),
					),
				) +
				row(
					"Живой аватар",
					"av",
					[["", "Неподвижный", 0]].concat(
						Object.entries(AVATAR_ANIMS).map(([x, a]) => [x, a[1], a[0]]),
					),
				) +
				'<p class="priv">Сам герой меняется в «Облике».</p>';
		else if (k === "nick")
			body = row(
				"",
				"n",
				[["", "Обычный", 0, ""]].concat(
					Object.entries(NICK_COLORS).map(([x, c]) => [
						x,
						"",
						1,
						`background:${c}`,
					]),
					Object.entries(NICK_GRADS).map(([x, g]) => [
						x,
						g[2] + " (переливается)",
						2,
						`background:linear-gradient(90deg,${g[0]},${g[1]})`,
					]),
				),
				true,
			);
		else if (k === "bg")
			body =
				row(
					"",
					"bg",
					[["", "Стиль канала", 0, ""]].concat(
						Object.entries(WBG).map(([x, b]) => [
							x,
							b[1] + (b[0] === 2 ? " ✦" : ""),
							b[0],
							`--bgp:${x}`,
						]),
					),
				) +
				'<p class="priv">✦ - живой фон: звёзды мерцают, падает снег, летят искры.</p>';
		else if (k === "uw")
			body = row(
				"",
				"w",
				[["", "Без подложки", 0]].concat(
					Object.entries(UNDERLAYS).map(([x, a]) => [x, a[1], a[0]]),
				),
			);
		else if (k === "title") {
			const tl = (D0.own && D0.own.titles) || [];
			body = tl.length
				? `<div class="plist" role="menu">${[""]
						.concat(tl)
						.map(
							(x) =>
								`<button type="button" role="menuitemradio" data-tpick="${esc(x)}" aria-checked="${(p.title || "") === x}">${x ? esc(x) : "Без титула"}</button>`,
						)
						.join("")}</div>`
				: '<p class="priv">Титулы дают достижения - пока ни одного нет.</p>';
		} else if (k === "slot") {
			const ids = D0.showIds || (D0.show || []).map((a) => a.id),
				cur = ids[pop.slot],
				got = (D0.own && D0.own.got) || [];
			body = got.length
				? `<div class="plist" role="menu">${got
						.map((a) => {
							const at = ids.indexOf(a.id);
							return `<button type="button" role="menuitemradio" data-spick="${esc(a.id)}" aria-checked="${cur === a.id}"><span class="md" style="--rc:${RC[a.rar] || RC["Р"]}">${esc(a.icon)}</span>${esc(a.name)}${at >= 0 && at !== pop.slot ? `<small>место ${at + 1}</small>` : ""}</button>`;
						})
						.join(
							"",
						)}</div>${cur ? '<button type="button" class="gl-btn ghost" data-sclear>Убрать с этого места</button>' : ""}`
				: '<p class="priv">Пока нет открытых достижений - витрина ждёт первое.</p>';
		} else if (k === "priv")
			body = `<span class="ol">Профиль видят</span><div class="seg" role="group"><button type="button" data-vis="all" aria-pressed="${p.vis === "all"}">Все игроки</button><button type="button" data-vis="friends" aria-pressed="${p.vis === "friends"}">Только друзья</button></div>
      <label class="tgl"><input type="checkbox" data-online ${p.online ? "checked" : ""}> Показывать друзьям, где я сейчас</label>
      <div class="vtab"><div><b>Видят все</b><ul><li>герой, ник, уровень, класс</li><li>титул, гильдия</li><li>подписка</li><li>витрина</li><li>соц. рейтинг, Арена</li></ul></div><div><b>${p.vis === "friends" ? "Только друзья" : "Тоже все"}</b><ul><li>«О себе»</li><li>статистика</li><li>все классы</li><li>друзья</li><li>«В игре с …»</li></ul></div></div>`;
		return `<div class="pop${pop.side ? " side" : ""}" role="dialog" aria-label="${POPT[k]}" style="left:${pop.x}px;top:${pop.y}px"><div class="poph"><b>${POPT[k]}${k === "slot" ? " " + (pop.slot + 1) : ""}</b><button type="button" class="popx" data-popx aria-label="Закрыть">×</button></div>${body}
      ${needPrem && t < 2 ? '<p class="priv">🔒 - можно примерить: нажми, и увидишь на своём профиле.</p>' : ""}${needPrem && t < 2 ? `<button type="button" class="gl-btn ghost premb" data-prem>${crown(t ? 2 : 1, 20)} ${t ? "Перейти на Премиум+" : "Оформить Премиум"}</button>` : ""}</div>`;
	}
	function optRow(label, key, opts, dots) {
		const t = tier(),
			cur =
				tryOn && tryOn.key === key
					? tryOn.v
					: key === "w" || key === "bg"
						? (D0.row || {})[key === "w" ? "uw" : "bg"] || ""
						: (D0.pf || {})[key] || "";
		return `<div class="opt">${label ? `<span class="ol">${label}</span>` : ""}<div class="${dots ? "dots" : "pick"}">${opts
			.map(([id, n, need, st]) => {
				const lk = !okTier(need, t);
				return `<button type="button" data-pf="${key}" data-v="${id}" data-need="${need}" aria-pressed="${cur === id}"${lk ? ' class="lkd"' : ""} ${st ? `style="${st}"` : ""} title="${esc(n || id)}${need ? " · " + TIERN[need] : ""}">${dots ? (id ? "" : "Аа") : `${st && st.startsWith("--dot") ? '<i class="dot"></i>' : ""}${st && st.startsWith("--bgp") ? `<i class="bgsw bg-${st.slice(6)}"></i>` : ""}${esc(n)}`}${lk ? '<span class="lkb">🔒</span>' : ""}</button>`;
			})
			.join("")}</div></div>`;
	}
	function openPop(el, k, slot) {
		const W = $(".gl-win", root),
			wr = W.getBoundingClientRect(),
			r = el.getBoundingClientRect(),
			side = k === "ava";
		pop = {
			k,
			slot,
			side,
			x: Math.round((side ? r.right + 10 : r.left) - wr.left),
			y: Math.round((side ? r.top : r.bottom + 8) - wr.top),
			at: [r.top - wr.top, r.bottom - wr.top],
		};
		more = false;
		render();
		fitPop();
		if (k === "likes") loadLikers();
	}
	function fitPop() {
		const Pp = $(".pop", root),
			W = $(".gl-win", root);
		if (!Pp || !W || window.innerWidth <= 640) return;
		const ww = W.clientWidth,
			wh = W.clientHeight,
			pw = Pp.offsetWidth,
			ph = Pp.offsetHeight;
		let x = Math.min(pop.x, ww - pw - 10),
			y = pop.y;
		if (y + ph > wh - 10)
			y = pop.side
				? Math.max(10, wh - ph - 10)
				: Math.max(10, pop.at[0] - ph - 8);
		Pp.style.left = Math.max(10, x) + "px";
		Pp.style.top = y + "px";
	}
	async function loadLikers() {
		likers = null;
		const r = await X.api(
			"/api/profile/" + encodeURIComponent(D0.login) + "/likes",
		);
		if (!pop || pop.k !== "likes") return;
		if (r && r.ok) {
			likers = r.list || [];
			D0.likes = r.n;
		} else {
			likers = [];
			toast((r && r.error) || "Список не загрузился");
		}
		render();
	}

	function render() {
		if (!root) return;
		const B = $(".gl-body", root),
			keep = B ? B.scrollTop : 0,
			fa =
				document.activeElement &&
				document.activeElement.dataset &&
				"about" in document.activeElement.dataset,
			pos = fa ? document.activeElement.selectionStart : 0;
		const p = P(),
			tt = p.pm || (ME() ? tier() : 0);
		const bgid =
				WBG[(p.pf || {}).bg] && okTier(WBG[p.pf.bg][0], tt) ? p.pf.bg : "",
			bgc = bgid ? ` wbgon bg-${bgid} ${WBG[bgid][2] ? "wbd" : "wbl"}` : "";
		root.dataset.gst = gst();
		root.innerHTML = `<div class="gl-win pw${bgc}" role="dialog" aria-modal="true" aria-label="Профиль ${esc(p.nick)}">
      ${bgid ? '<div class="wbg" aria-hidden="true"><i class="l1"></i><i class="l2"></i></div>' : ""}<button type="button" class="gl-x" data-x aria-label="Закрыть профиль">×</button>
      <div class="gl-body">${head(p)}${viewHtml(p)}</div>${pop ? '<div class="popsh" data-popx></div>' : ""}${popHtml()}${
				rep
					? `<div class="pmask"><div class="pbox" role="alertdialog" aria-modal="true" aria-labelledby="pfrept"><b id="pfrept">Пожаловаться на профиль ${esc(p.nick)}</b><span class="priv">Что не так? Жалобу увидят модераторы канала.</span>
        <div class="repl">${[
					["about", "Текст «О себе»"],
					["nick", "Ник"],
					["look", "Оформление: аватар, обложка, фон"],
					["other", "Другое"],
				]
					.map(
						([v, n]) =>
							`<label class="tgl"><input type="radio" name="pfrep" value="${v}"> ${n}</label>`,
					)
					.join("")}</div>
        <textarea maxlength="300" placeholder="Подробности (необязательно)"></textarea><span class="reperr" role="alert" hidden>Выбери, на что жалоба</span>
        <div class="abr"><button type="button" class="gl-btn ghost" data-repno>Отмена</button><button type="button" class="gl-btn" data-repgo>Отправить жалобу</button></div></div></div>`
					: ""
			}<div class="atoast" role="status"></div></div>`;
		const B2 = $(".gl-body", root);
		if (B2) B2.scrollTop = keep;
		if (fa) {
			const t = $("[data-about]", root);
			if (t) {
				t.focus();
				t.setSelectionRange(pos, pos);
			}
		}

		if (pop) {
			fitPop();
			const B3 = $(".gl-body", root);
			if (B3) {
				const y0 = B3.scrollTop;
				setTimeout(() => {
					B3.onscroll = () => {
						if (
							pop &&
							window.innerWidth > 640 &&
							Math.abs(B3.scrollTop - y0) > 24
						) {
							pop = null;
							render();
						}
					};
				}, 0);
			}
		}
		bind();
		fitNick();
		fitWatch();
	}

	function fitNick() {
		const nk = root && $(".ph .pnm .nk", root);
		if (!nk) return;
		nk.style.fontSize = "";
		const sw = nk.scrollWidth,
			cw = nk.clientWidth;
		if (!cw || sw <= cw + 1) return;
		const f = parseFloat(getComputedStyle(nk).fontSize) || 0;
		if (f)
			nk.style.fontSize =
				Math.max(f * 0.6, Math.floor(((f * cw) / sw) * 10) / 10) + "px";
	}

	let fitRo = null;
	function onFit() {
		if (root) fitNick();
	}
	function fitWatch() {
		const h = root && $(".ph .pnm", root);
		if (fitRo) fitRo.disconnect();
		if (h && window.ResizeObserver) {
			if (!fitRo) fitRo = new ResizeObserver(onFit);
			fitRo.observe(h);
		}
	}
	function toast(s) {
		const t = root && $(".atoast", root);
		if (!t) {
			if (X) X.toast(s);
			return;
		}
		t.textContent = s;
		t.classList.add("on");
		clearTimeout(ttm);
		ttm = setTimeout(() => t.classList.remove("on"), 2200);
	}

	async function save(patch, ok) {
		if (busy) return false;
		busy = true;
		try {
			const r = await X.api("/api/profile/save", patch);
			if (!r || !r.ok) {
				toast((r && r.error) || "Не сохранилось - попробуй ещё раз");
				return false;
			}
			const s = r.saved || {};
			for (const k of ["about", "pat", "vis", "online", "pin"])
				if (k in s) D0[k] = s[k];
			D0.row = {
				...(D0.row || {}),
				...("cover" in s ? { cover: s.cover } : {}),
				...("bg" in s ? { bg: s.bg } : {}),
				...("uw" in s ? { uw: s.uw } : {}),
			};
			if ("cover" in s) D0.cover = s.cover;
			D0.pf = { ...(D0.pf || {}) };
			if ("bg" in s) {
				if (s.bg) D0.pf.bg = s.bg;
				else delete D0.pf.bg;
			}
			if ("uw" in s) {
				if (s.uw) D0.pf.w = s.uw;
				else delete D0.pf.w;
			}
			if (ok) toast(ok);
			return true;
		} finally {
			busy = false;
		}
	}

	async function savePrefs(key, v) {
		const k = key === "n" ? "nc" : key;
		const r = await X.api("/api/premium/prefs", { [k]: v });
		if (!r || !r.ok) {
			toast((r && r.error) || "Не сохранилось");
			return;
		}
		D0.pf = { ...(D0.pf || {}) };
		if (v) D0.pf[key] = v;
		else delete D0.pf[key];
		render();
	}
	async function achPick(b, okText) {
		const r = await X.api("/api/achPick", b);
		if (!r || r.ok === false) {
			toast((r && r.error) || "Не вышло");
			return false;
		}
		if (okText) toast(okText);
		X.reload();
		return true;
	}
	function bind() {
		const w = root,
			on = (sel, f) =>
				w.querySelectorAll(sel).forEach((b) => {
					b.onclick = (e) => f(b, e);
				});
		on("[data-x]", () => close());
		const ta = $("[data-about]", w);
		if (ta)
			ta.oninput = () => {
				abDraft = ta.value;
				if (abErr) {
					abErr = "";
					const e2 = ta.closest("label").querySelector(".aberr");
					if (e2)
						e2.outerHTML =
							'<span class="abhint">Без ссылок, @упоминаний и мата - текст видят все игроки.</span>';
				}
				const em = ta.closest("label").querySelector("em");
				if (em) em.textContent = `${ta.value.length} / 300`;
			};
		on("[data-cv]", async (b) => {
			const v = b.dataset.cv;
			if (tryOn && tryOn.key === "cover") tryOn = null;
			if (await save({ cover: v })) render();
		});
		on("[data-pcv]", async (b) => {
			const need = +b.dataset.need;
			if (!okTier(need, tier())) {
				tryOn = {
					key: "cover",
					v: b.dataset.pcv,
					need,
					name: "обложка «" + PCOV[b.dataset.pcv][1] + "»",
				};
				if (phone()) pop = null;
				render();
				return;
			}
			tryOn = null;
			if (await save({ cover: b.dataset.pcv })) render();
		});
		on("[data-pat]", async (b) => {
			if (await save({ pat: b.dataset.pat })) render();
		});
		on("[data-pf]", async (b) => {
			const need = +b.dataset.need,
				k = b.dataset.pf,
				v = b.dataset.v;
			if (!okTier(need, tier())) {
				tryOn = {
					key: k,
					v,
					need,
					name:
						(POPT[pop && pop.k] || "оформление").toLowerCase() +
						" «" +
						b.title.split(" · ")[0] +
						"»",
				};
				if (phone()) pop = null;
				render();
				return;
			}
			if (tryOn && tryOn.key === k) tryOn = null;
			if (k === "w" || k === "bg") {
				if (await save({ [k === "w" ? "uw" : "bg"]: v })) render();
				return;
			}
			if (!tier() && v) {
				toast("Нужна подписка");
				return;
			}
			savePrefs(k, v);
		});
		on("[data-tryoff]", () => {
			tryOn = null;
			render();
		});
		on("[data-bpin]", async (b) => {
			const id = b.dataset.bpin,
				pin = [...(D0.pin || [])],
				i = pin.indexOf(id);
			if (i >= 0) pin.splice(i, 1);
			else if (pin.length < 3) pin.push(id);
			else {
				toast("У ника уже 3 значка - сними один");
				return;
			}
			if (await save({ pin })) render();
		});
		on("[data-repgo]", async () => {
			const r0 = $('[name="pfrep"]:checked', w);
			if (!r0) {
				const e2 = $(".reperr", w);
				if (e2) e2.hidden = false;
				return;
			}
			const txt = ($(".pbox textarea", w) || {}).value || "";
			const r = await X.api("/api/profile/report", {
				login: D0.login,
				why: r0.value,
				text: txt,
			});
			if (!r || !r.ok) {
				toast((r && r.error) || "Жалоба не ушла");
				return;
			}
			rep = null;
			render();
			toast("Жалоба отправлена модераторам канала");
		});
		w.querySelectorAll('[name="pfrep"]').forEach((x) => {
			x.onchange = () => {
				const e2 = $(".reperr", w);
				if (e2) e2.hidden = true;
			};
		});
		on("[data-repno]", () => {
			rep = null;
			render();
		});
		on("[data-ed]", (b, e) => {
			e.stopPropagation();
			const k = b.dataset.ed;
			if (k === "about") {
				aboutEd = true;
				pop = null;
				render();
				const t = $("[data-about]", root);
				if (t) t.focus();
				return;
			}
			const sl = b.dataset.slot != null ? +b.dataset.slot : undefined;
			if (pop && pop.k === k && pop.slot === sl) {
				pop = null;
				render();
				return;
			}
			openPop(k === "cover" ? b.querySelector(".pen") || b : b, k, sl);
		});
		on("[data-popx]", () => {
			pop = null;
			render();
		});
		on("[data-spick]", async (b) => {
			const id = b.dataset.spick,
				i = pop.slot,
				ids = D0.showIds || (D0.show || []).map((a) => a.id),
				at = ids.indexOf(id),
				sh = [ids[0], ids[1], ids[2]];
			if (at >= 0) sh[at] = sh[i];
			sh[i] = id;
			const next = sh.filter(Boolean);
			if (await achPick({ show: next }, "Витрина обновлена")) {
				D0.showIds = next;
				pop = null;
				render();
			}
		});
		on("[data-sclear]", async () => {
			const ids = D0.showIds || (D0.show || []).map((a) => a.id),
				sh = [ids[0], ids[1], ids[2]];
			sh[pop.slot] = undefined;
			const next = sh.filter(Boolean);
			if (await achPick({ show: next }, "Витрина обновлена")) {
				D0.showIds = next;
				pop = null;
				render();
			}
		});
		w.querySelectorAll("[data-tpick]").forEach((b) => {
			b.onclick = async () => {
				const t = b.dataset.tpick;
				if (
					await achPick(
						{ title: t || null },
						t ? `Титул: «${t}»` : "Титул снят",
					)
				) {
					D0.title = t;
					pop = null;
					render();
				}
			};
		});
		on("[data-absave]", async () => {
			const t = $("[data-about]", w),
				v = t ? t.value.trim() : D0.about;
			const r = await X.api("/api/profile/save", { about: v });
			if (!r || !r.ok) {
				abErr = (r && r.error) || "Не сохранилось";
				abDraft = t ? t.value : v;
				render();
				const t2 = $("[data-about]", root);
				if (t2) t2.focus();
				return;
			}
			D0.about = r.saved && r.saved.about != null ? r.saved.about : v;
			aboutEd = false;
			abErr = "";
			abDraft = null;
			render();
			toast("«О себе» сохранено");
		});
		on("[data-abcancel]", () => {
			aboutEd = false;
			abErr = "";
			abDraft = null;
			render();
		});
		on("[data-prem]", () => {
			const pr = window.LGPremium;
			if (pr && pr.open) {
				close();
				pr.open();
			} else
				toast(
					"Подписку выдаёт администратор игры - окно «Премиум» в меню ника",
				);
		});
		on("[data-stranger]", () => {
			stranger = !stranger;
			more = false;
			pop = null;
			aboutEd = false;
			render();
			const B = $(".gl-body", root);
			if (B) B.scrollTop = 0;
		});
		on("[data-vis]", async (b) => {
			if (await save({ vis: b.dataset.vis })) render();
		});
		const ol = $("[data-online]", w);
		if (ol)
			ol.onchange = async () => {
				if (await save({ online: ol.checked })) render();
				else render();
			};
		on("[data-friend]", async () => {
			if (D0.sent || D0.friend) return;
			const r = await X.api("/api/friends", { op: "add", login: D0.login });
			if (!r || !r.ok) {
				toast((r && r.error) || "Заявка не ушла");
				return;
			}
			if (r.state === "friends") D0.friend = true;
			else D0.sent = true;
			render();
			toast(D0.friend ? "Теперь вы друзья" : "Заявка в друзья отправлена");
		});
		on("[data-unfriend]", () =>
			toast("Удалить из друзей можно в окне «Друзья»"),
		);
		on("[data-mail]", () => {
			const M = window.LGMail;
			if (M && M.open) {
				close();
				M.open({ compose: D0.login });
			} else toast("Почта пока закрыта");
		});
		on("[data-more]", (b, e) => {
			e.stopPropagation();
			more = !more;
			render();
		});
		on("[data-m]", async (b) => {
			const m = b.dataset.m;
			more = false;
			if (m === "block") {
				const want = !D0.blocked;
				const r = await X.api("/api/friends", {
					op: want ? "block" : "unblock",
					login: D0.login,
				});
				if (!r || !r.ok) {
					toast((r && r.error) || "Не вышло");
					render();
					return;
				}
				D0.blocked = want;
				if (want) {
					D0.friend = false;
					D0.sent = false;
				}
				render();
				toast(want ? `${D0.nick} заблокирован` : `${D0.nick} разблокирован`);
				return;
			}
			if (m === "report") {
				rep = true;
				render();
				return;
			}
			render();
			toast(
				{
					squad: "Позвать в отряд - в окне «Арена»: «Пригласить»",
					trade: "Обмен - в «Городе»: нажми на героя → «Предложить обмен»",
					gift: "Подарок подписки - скоро",
				}[m],
			);
		});
		on("[data-like]", async () => {
			const want = !D0.liked;
			const r = await X.api("/api/profile/like", { login: D0.login, on: want });
			if (!r || !r.ok) {
				toast((r && r.error) || "Не вышло");
				return;
			}
			D0.liked = !!r.liked;
			D0.likes = +r.n || 0;
			render();
			const n = $("[data-like]", root);
			if (n && D0.liked) n.classList.add("bump");
			toast(
				D0.liked
					? `Лайк поставлен - ${D0.nick} увидит это в своём профиле`
					: "Лайк убран",
			);
		});
		on("[data-vote]", (b) =>
			toast(
				`Голос - в чате стрима, пока идёт эфир: «соц${+b.dataset.vote > 0 ? "+" : "-"} @${D0.login}»`,
			),
		);
		on("[data-ach]", () =>
			toast("Все достижения - в окне «Герой», вкладка «Достижения»"),
		);
		on("[data-fr]", (b) => {
			const l = b.dataset.fr;
			if (l && window.LGProfile) window.LGProfile.open(l);
		});
	}
	function onDoc(e) {
		if (!root) return;
		if (more && !e.target.closest(".pact")) {
			more = false;
			render();
		}
		if (pop && !e.target.closest(".pop") && !e.target.closest("[data-ed]")) {
			pop = null;
			render();
		}
	}
	function onKey(e) {
		if (e.key !== "Escape" || !root) return;
		e.preventDefault();
		e.stopPropagation();
		if (rep) rep = null;
		else if (pop) pop = null;
		else if (aboutEd) aboutEd = false;
		else if (more) more = false;
		else if (stranger) stranger = false;
		else {
			close();
			return;
		}
		render();
	}
	function onBack(e) {
		if (root && e.target === root) close();
	}
	function close() {
		if (!root) return;
		document.removeEventListener("click", onDoc);
		document.removeEventListener("keydown", onKey, true);
		window.removeEventListener("resize", onFit);
		if (fitRo) {
			fitRo.disconnect();
			fitRo = null;
		}
		try {
			if (document.fonts)
				document.fonts.removeEventListener("loadingdone", onFit);
		} catch (e) {
			console.warn("[профиль] шрифты", e);
		}
		if (bgOff) {
			bgOff();
			bgOff = null;
		}
		root.remove();
		root = null;
		D0 = null;
		tryOn = null;
	}
	function open(x, data) {
		if (root) close();
		X = x;
		D0 = { ...data };
		more = false;
		stranger = false;
		pop = null;
		aboutEd = false;
		abErr = "";
		abDraft = null;
		rep = null;
		tryOn = null;
		likers = null;
		root = document.createElement("div");
		root.className = "gl-modal pfm gw-tok gw-dk";
		root.addEventListener("click", onBack);
		document.body.appendChild(root);
		document.addEventListener("click", onDoc);
		document.addEventListener("keydown", onKey, true);
		window.addEventListener("resize", onFit);

		try {
			if (document.fonts) {
				document.fonts.addEventListener("loadingdone", onFit);
				document.fonts.ready.then(onFit, () => {});
			}
		} catch (e) {
			console.warn("[профиль] шрифты", e);
		}

		const B = window.LGSiteUi && window.LGSiteUi.bg;
		const still = () => {
			if (root)
				root.classList.toggle("pf-still", !!(B && B.state() === "hidden"));
		};
		if (B && B.on) bgOff = B.on(still);
		render();
		still();
		const x0 = $(".gl-x", root);
		if (x0) x0.focus({ preventScroll: true });
	}
	window.LGProfileWin = { open, close, isOpen: () => !!root };
})();
