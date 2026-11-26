window.QWorldView = (() => {
	const NS = "qwv";
	const ST_RU = {
		hidden: "Не исследована (под туманом)",
		open: "Открыта — ещё не пройдена",
		cleared: "Зачищен",
		current: "Отряд здесь",
	};

	const FOG_A = 0.62,
		HID_A = 0.5;
	const DANGER_RU = [
		"",
		"Спокойно",
		"Неспокойно",
		"Опасно",
		"Очень опасно",
		"Смертельно",
	];

	const money = (n) => {
		n = Math.max(0, Math.floor(+n || 0));
		const g = Math.floor(n / 10000),
			sv = Math.floor(n / 100) % 100,
			b = n % 100,
			o = [];
		if (g) o.push("🟡" + g);
		if (sv) o.push("⚪" + sv);
		if (b || !o.length) o.push("🟤" + b);
		return o.join(" ");
	};
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
	const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
	const sstep = (a, b, x) => {
		const t = clamp((x - a) / (b - a), 0, 1);
		return t * t * (3 - 2 * t);
	};

	const leftRu = (ms) => {
		const m = Math.max(1, Math.ceil(ms / 60000)),
			d = Math.floor(m / 1440),
			h = Math.floor((m % 1440) / 60),
			mm = m % 60;
		return d ? `${d} д ${h} ч` : h ? `${h} ч ${mm} мин` : `${mm} мин`;
	};
	function regrowNote(i, now = Date.now()) {
		if (!i || i.regrowAt == null) return null;
		if (now < i.regrowAt)
			return {
				state: "calm",
				text: `восстановится через ${leftRu(i.regrowAt - now)}`,
			};
		return {
			state: "restless",
			text: "Снова неспокойно — можно зачистить",
			end: i.owner
				? i.mine
					? `Гарнизон канала ${i.owner} (ваш — без боя, в конце уход)`
					: `Гарнизон канала ${i.owner}`
				: "Главный враг округа",
		};
	}
	let css = false;
	function addCss() {
		if (css) return;
		css = true;
		const s = document.createElement("style");
		s.id = "qwv-css";
		s.textContent = `
.qwv{position:relative;overflow:hidden;background:#6a8daa;touch-action:none;user-select:none;-webkit-user-select:none;font-family:'Golos Text',system-ui,sans-serif;color:#2a2236;outline:none}
.qwv canvas{position:absolute;left:0;top:0;display:block;transform-origin:0 0}.qwv.qwv-move canvas{will-change:transform}.qwv.qwv-move .qwv-pulse{animation:none}
.qwv .qwv-pulse{pointer-events:none;animation:qwvPulse 2.4s ease-in-out 3 both}
.qwv.qwv-paused .qwv-pulse{animation-play-state:paused}
@keyframes qwvPulse{0%{opacity:1}35%{opacity:.35}70%,100%{opacity:1}}
@media (prefers-reduced-motion:reduce){.qwv .qwv-pulse{animation:none;opacity:.8}}
.qwv-ui{position:absolute;left:12px;bottom:12px;display:flex;flex-direction:column;gap:6px;z-index:3}
.qwv-ui button{width:44px;height:44px;border-radius:10px;border:2px solid #2a2236;background:#f6ecd2;color:#2a2236;font:700 22px/1 'Golos Text',system-ui,sans-serif;cursor:pointer;box-shadow:0 2px 0 #2a2236;transition:background .2s,transform .2s}
.qwv-ui button:hover{background:#ffe7a8}.qwv-ui button:active{transform:translateY(2px);box-shadow:none}
.qwv-ui button:focus-visible,.qwv-card button:focus-visible,.qwv-find:focus-visible,.qwv:focus-visible{outline:3px solid #ffd76a;outline-offset:2px}
.qwv-ui button svg{display:block;margin:auto}
.qwv-find{position:absolute;left:12px;top:12px;z-index:3;max-width:min(260px,calc(100% - 24px));height:40px;border-radius:10px;border:2px solid #2a2236;background:#f6ecd2;color:#2a2236;font:600 15px 'Golos Text',system-ui,sans-serif;padding:0 8px}
.qwv-tip{position:absolute;z-index:4;pointer-events:none;padding:5px 10px;border-radius:8px;background:rgba(42,34,54,.92);color:#f6ecd2;font:600 14px 'Golos Text',system-ui,sans-serif;white-space:nowrap;transform:translate(-50%,-130%);opacity:0;transition:opacity .2s}
.qwv-tip.on{opacity:1}
.qwv-card{position:absolute;right:12px;top:12px;z-index:3;width:300px;max-width:calc(100% - 24px);max-height:calc(100% - 24px);overflow:auto;box-sizing:border-box;padding:16px 16px 14px;border-radius:12px;background:#f6ecd2;border:3px solid #2a2236;box-shadow:0 6px 0 rgba(42,34,54,.35);opacity:0;transform:translateY(-8px);transition:opacity .25s,transform .25s;pointer-events:none}
.qwv-card.on{opacity:1;transform:none;pointer-events:auto}.qwv-card.qwv-nocard{display:none}
.qwv-card h3{text-transform:none;letter-spacing:0;margin:0 32px 2px 0;font:400 22px/1.15 'Russo One','Golos Text',sans-serif;color:#2a2236}
.qwv-card .rg{margin:0 0 10px;font:600 14px 'Golos Text',sans-serif;color:#6a5a48}
.qwv-card dl{margin:0;display:grid;grid-template-columns:auto 1fr;gap:6px 12px;font:500 14px/1.35 'Golos Text',sans-serif}
.qwv-card .own{display:inline-block;width:12px;height:12px;border-radius:3px;border:2px solid #2a2236;margin-right:6px;vertical-align:-2px}
.qwv-card .dz{color:#c9932e;font-weight:400}.qwv-card .dz0{color:#cfc4ae;font-weight:400}
.qwv-card dt{color:#6a5a48}.qwv-card .mu{font-weight:500;color:#6a5a48}.qwv-card dd{margin:0;font-weight:700}
.qwv-card .st{display:inline-block;padding:2px 8px;border-radius:6px;font-weight:700}
.qwv-card .st.hidden{background:#d8d4e0;color:#4a4458}.qwv-card .st.open{background:#e6edd2;color:#3f5a2a}.qwv-card .st.cleared{background:#c8102e;color:#fff}.qwv-card .st.current{background:#ffd76a;color:#3b2a1a}
.qwv-card .av{margin:10px 0 0;padding:8px 10px;border-radius:8px;background:#fff4cc;border:2px dashed #c9932e;font:600 14px/1.3 'Golos Text',sans-serif}
.qwv-card .nb{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.qwv-card .nb button{border:2px solid #2a2236;border-radius:8px;background:#fffaf0;padding:5px 8px;font:600 13px 'Golos Text',sans-serif;color:#2a2236;cursor:pointer;min-height:32px;transition:background .2s}
.qwv-card .nb button:hover{background:#ffe7a8}.qwv-card .nb button.h{color:#5f5a70;border-style:dashed}.qwv-card .nb button:active,.qwv-card .x:active{transform:translateY(1px)}
.qwv-card .x{position:absolute;right:8px;top:8px;width:36px;height:36px;border:0;border-radius:8px;background:transparent;font:700 22px/1 sans-serif;color:#2a2236;cursor:pointer}
.qwv-card .x:hover{background:rgba(42,34,54,.1)}
.qwv-card .gt{font-weight:500;color:#6a5a48}
.qwv-card .rg2{font-weight:500;color:#6a5a48;font-size:13px}.qwv-card .st.restless{background:#8a1a2a;color:#fff4cc}
.qwv-card .dr{margin-top:8px;font:500 12px 'Golos Text',sans-serif;color:#6a5a48}
.qwv.narrow .qwv-card .nb button{min-height:40px}
.qwv.narrow .qwv-card{left:8px;right:8px;top:auto;bottom:8px;width:auto;max-height:55%}
.qwv.narrow .qwv-card.on~.qwv-ui{opacity:0;pointer-events:none}
.qwv-leg{position:absolute;left:12px;top:60px;z-index:3;max-width:min(240px,calc(100% - 24px));padding:8px 10px;border-radius:10px;border:2px solid #2a2236;background:rgba(246,236,210,.94);color:#2a2236;font:600 13px/1.35 'Golos Text',system-ui,sans-serif;pointer-events:none}
.qwv-leg[hidden]{display:none}.qwv-leg b{display:block;margin-bottom:4px;font-weight:700}.qwv-leg i{display:inline-block;width:12px;height:12px;border-radius:3px;border:2px solid #2a2236;margin-right:6px;vertical-align:-2px}
.qwv-leg div{overflow-wrap:anywhere}.qwv-leg.cin{left:40px;top:40px;font-size:20px;padding:12px 16px;max-width:360px}.qwv-leg.cin i{width:18px;height:18px}
.qwv.narrow .qwv-leg{top:auto;bottom:12px;left:68px}
.qwv-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
`;
		document.head.appendChild(s);
	}

	let FOGTEX = null,
		FOG_T = 0.35;
	function fogTex() {
		if (FOGTEX) return FOGTEX;
		const N = 256,
			c = document.createElement("canvas");
		c.width = c.height = N;
		const g = c.getContext("2d"),
			im = g.createImageData(N, N);
		const rnd = window.QArt.rng(424242),
			oct = [
				[8, 0.5],
				[16, 0.28],
				[32, 0.14],
				[64, 0.08],
			].map(([n, a]) => {
				const v = new Float32Array(n * n);
				for (let i = 0; i < v.length; i++) v[i] = rnd();
				return { n, a, v };
			});
		let ts = 0;
		for (let y = 0; y < N; y++)
			for (let x = 0; x < N; x++) {
				let s = 0;
				for (const o of oct) {
					const fx = (x / N) * o.n,
						fy = (y / N) * o.n,
						xi = Math.floor(fx),
						yi = Math.floor(fy),
						tx = fx - xi,
						ty = fy - yi,
						u = tx * tx * (3 - 2 * tx),
						w = ty * ty * (3 - 2 * ty),
						V = (i, j) =>
							o.v[(((j % o.n) + o.n) % o.n) * o.n + (((i % o.n) + o.n) % o.n)];
					s +=
						o.a *
						((V(xi, yi) * (1 - u) + V(xi + 1, yi) * u) * (1 - w) +
							(V(xi, yi + 1) * (1 - u) + V(xi + 1, yi + 1) * u) * w);
				}
				const k = (y * N + x) * 4,
					t = clamp((s - 0.3) * 1.6, 0, 1);
				ts += t;
				im.data[k] = 186 + t * 48;
				im.data[k + 1] = 182 + t * 48;
				im.data[k + 2] = 200 + t * 40;
				im.data[k + 3] = 255;
			}
		FOG_T = ts / (N * N);
		g.putImageData(im, 0, 0);
		return (FOGTEX = c);
	}

	function fogSea(ocean) {
		fogTex();
		const o = [1, 3, 5].map((i) => parseInt(ocean.slice(i, i + 2), 16)),
			f = [186 + FOG_T * 48, 182 + FOG_T * 48, 200 + FOG_T * 40];
		return `rgb(${o.map((v, i) => Math.round(v * (1 - FOG_A) + f[i] * FOG_A)).join(",")})`;
	}

	const SPRITES = {
		map: new Map(),
		px: 0,
		q: Promise.resolve(),
		users: 0,
		dropT: 0,
	};
	function create(host, opt = {}) {
		addCss();
		const D = opt.data || window.QWorldData,
			WA = window.QWorldArt,
			W = WA.init(D),
			LV = WA.LV,
			TS = WA.TS;
		const MODE = opt.mode || "interactive",
			INTER = MODE === "interactive";

		const BK = opt.bake && opt.bake.man && opt.bake.man.tiles ? opt.bake : null,
			bkStat = { hit: 0, miss: 0, bytes: 0, empty: 0 };

		let pageK = 1;
		const DPR = () =>
			Math.min(opt.maxDpr || 2, (window.devicePixelRatio || 1) * pageK);
		host.classList.add(NS);
		if (INTER) {
			host.tabIndex = 0;
			host.setAttribute("role", "application");
			host.setAttribute(
				"aria-label",
				"Карта мира Легиона. Стрелки — сдвиг, плюс и минус — масштаб, Enter — выбрать округ под центром.",
			);
		}
		const cv = document.createElement("canvas"),
			g = cv.getContext("2d");
		const pc = document.createElement("canvas");
		pc.className = "qwv-pulse";
		const pg = pc.getContext("2d");
		host.append(cv, pc);
		const fogC = document.createElement("canvas"),
			fg = fogC.getContext("2d");
		let tip = null,
			card = null,
			ui = null,
			find = null,
			live = null;

		const leg = document.createElement("div");
		leg.className = "qwv-leg" + (INTER ? "" : " cin");
		leg.hidden = true;
		if (opt.legend !== false) host.append(leg);
		if (INTER) {
			tip = document.createElement("div");
			tip.className = "qwv-tip";
			card = document.createElement("div");
			card.className = "qwv-card" + (opt.card === false ? " qwv-nocard" : "");
			card.setAttribute("role", "region");
			card.setAttribute("aria-label", "Карточка округа");
			ui = document.createElement("div");
			ui.className = "qwv-ui";
			const icon = (d) =>
				`<svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">${d}</svg>`;
			ui.innerHTML = `<button type="button" data-z="in" aria-label="Приблизить" title="Приблизить">${icon('<path d="M11 4v14M4 11h14"/>')}</button><button type="button" data-z="out" aria-label="Отдалить" title="Отдалить">${icon('<path d="M4 11h14"/>')}</button><button type="button" data-z="fit" aria-label="Весь мир" title="Весь мир">${icon('<rect x="3.5" y="5.5" width="15" height="11" rx="2"/>')}</button>`;
			find = document.createElement("select");
			find.className = "qwv-find";
			find.setAttribute("aria-label", "Перейти к округу");
			live = document.createElement("div");
			live.className = "qwv-sr";
			live.setAttribute("aria-live", "polite");
			host.append(tip, card, ui, find, live);
		}

		const T = W.T,
			R = W.R,
			byId = new Map(T.map((t) => [t.id, t]));
		let states = {},
			info = {},
			avail = new Set(),
			sel = -1,
			hov = -1,
			stVer = 0,
			pulseKey = "",
			lastDraw = 0,
			tileT = 0;
		let vw = 0,
			vh = 0,
			cx = W.vb[0] + W.vb[2] / 2,
			cy = W.vb[1] + W.vb[3] / 2,
			S = 0.08;
		let anim = null,
			raf = 0,
			dirty = true,
			alive = true,
			visible = !document.hidden,
			onScreen = true,
			act = opt.active !== false;

		const on = () => alive && visible && onScreen && act;
		let waiters = [];
		const whenOn = () =>
			on() || !alive
				? Promise.resolve()
				: new Promise((ok) => waiters.push(ok));

		const FOGX = INTER && !!opt.inset && !!opt.fogFast;
		const ME = INTER ? 3000 : 0,
			LB = (() => {
				let a = 1e9,
					b = 1e9,
					c = -1e9,
					d = -1e9;
				for (const t of W.T) {
					a = Math.min(a, t.bb[0]);
					b = Math.min(b, t.bb[1]);
					c = Math.max(c, t.bb[2]);
					d = Math.max(d, t.bb[3]);
				}
				const p = 600;
				return [a - p, b - p, c + p, d + p];
			})();

		let ins = { l: 0, t: 0, r: 0, b: 0 },
			fitted = true;
		const insOf = () => {
			if (!INTER || !opt.inset) return { l: 0, t: 0, r: 0, b: 0 };
			try {
				const o = opt.inset() || {},
					f = (v, m) => clamp(+v || 0, 0, m);
				return {
					l: f(o.l, vw * 0.6),
					t: f(o.t, vh * 0.6),
					r: f(o.r, vw * 0.6),
					b: f(o.b, vh * 0.6),
				};
			} catch (e) {
				return { l: 0, t: 0, r: 0, b: 0 };
			}
		};
		const ew = () => Math.max(1, vw - ins.l - ins.r),
			eh = () => Math.max(1, vh - ins.t - ins.b);
		const zCover = () => Math.max(ew() / W.vb[2], eh() / W.vb[3]);

		const SEA = FOGX ? clamp(+opt.sea || 0, 0, 0.25) : 0,
			LW = (LB[2] - LB[0]) * (1 + 2 * SEA),
			LH = (LB[3] - LB[1]) * (1 + 2 * SEA);

		const zFree = () => Math.min(zCover(), ew() / LW, eh() / LH);
		const fitIns = () => {
			if (!FOGX || !opt.center || ins.l === ins.r) return ins;
			const m = Math.max(ins.l, ins.r),
				J = { ...ins, l: m, r: m },
				z = Math.min(zCover(), Math.max(1, vw - 2 * m) / LW, eh() / LH);
			return z >= zFree() * clamp(+opt.center || 0, 0, 1) ? J : ins;
		};
		const zFit = () => {
			const f = fitIns();
			return f === ins
				? zFree()
				: Math.min(zCover(), Math.max(1, vw - f.l - f.r) / LW, eh() / LH);
		};
		const zMin = () =>
			INTER
				? Math.min(
						Math.max(
							zFree(),
							FOGX
								? 0
								: Math.max(vw / (W.vb[2] + 2 * ME), vh / (W.vb[3] + 2 * ME)),
						),
						FOGX ? zFit() : Infinity,
					)
				: Math.min(vw / (W.vb[2] * 0.82), vh / (W.vb[3] * 0.86));

		const seaBox = () => {
			if (!SEA) return W.vb;
			const px = (SEA * ew()) / S,
				py = (SEA * eh()) / S,
				a = Math.min(W.vb[0], LB[0] - px),
				b = Math.min(W.vb[1], LB[1] - py);
			return [
				a,
				b,
				Math.max(W.vb[0] + W.vb[2], LB[2] + px) - a,
				Math.max(W.vb[1] + W.vb[3], LB[3] + py) - b,
			];
		};
		const zMax = () => (INTER ? 1.1 : 4);
		const stOf = (t) => states[t.id] || "hidden";

		const mine = (t) => !info[t.id] || info[t.id].mine !== false;

		const colorOf = (t) => {
			const i = info[t.id];
			return i ? i.color || (i.owner ? "#c8102e" : "#8a8494") : "#c8102e";
		};
		let marks = {};

		const gatesD = (D.gates || []).map((g) => ({
			...g,
			d: byId.get(g.district || g.inner).i,
		}));
		let season = { ...(D.season || {}), ...(opt.season || {}) };
		const opensAt = (g) =>
			g.opensAt != null
				? g.opensAt
				: season.startsAt != null
					? season.startsAt + (season.gateDays ?? 7) * 864e5
					: null;
		const gateOpen = (g, now = Date.now()) => {
			const t = opensAt(g);
			return t != null && now >= t;
		};
		const gateOf = (i, j) => gatesD.find((g) => g.d === i || g.d === j) || null;
		const left = (ms) => {
			const m = Math.max(1, Math.ceil(ms / 60000)),
				d = Math.floor(m / 1440),
				h = Math.floor((m % 1440) / 60),
				mm = m % 60;
			return d ? `${d} д ${h} ч` : h ? `${h} ч ${mm} мин` : `${mm} мин`;
		};
		const gateText = (g) => {
			const t = opensAt(g),
				now = Date.now();
			return t == null
				? "Закрыты до начала сезона"
				: now >= t
					? "Открыты"
					: `Откроются через ${left(t - now)}`;
		};

		const lairsD = T.filter((t) => t.lair && !t.prologue);
		const LAIR_H = { spire: 780, citadel: 540, skull: 520, tower: 545 };
		let lairsOver;
		const lairOpensAt = () => {
			if (lairsOver !== undefined) return lairsOver;
			let m = null;
			for (const g of gatesD) {
				const t = opensAt(g);
				if (t != null && (m == null || t < m)) m = t;
			}
			return m != null
				? m
				: !gatesD.length && season.startsAt != null
					? season.startsAt + (season.gateDays ?? 7) * 864e5
					: null;
		};
		const lairOpen = (now = Date.now()) => {
			const t = lairOpensAt();
			return t != null && now >= t;
		};
		const lairShut = (t) => !!t && !!t.lair && !t.prologue && !lairOpen();
		const lairText = () => {
			const t = lairOpensAt(),
				now = Date.now();
			return t == null
				? "Закрыто до начала сезона"
				: now >= t
					? "Открыто"
					: `Откроется через ${left(t - now)}`;
		};

		const P2 = T.map((t) => {
			const p = new Path2D();
			for (const ring of t.poly) {
				ring.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y)));
				p.closePath();
			}
			return p;
		});
		const chainP = (list) => {
			const p = new Path2D();
			for (const c of list)
				c.p.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y)));
			return p;
		};
		const zoneOfT = (i) => T[i].zone || "outer",
			isG = (i) => i >= 0 && T[i].zone === "gate";

		const regionBorders = chainP(
				W.chains.filter(
					(c) =>
						c.region && !isG(c.l) && !isG(c.r) && zoneOfT(c.l) === zoneOfT(c.r),
				),
			),
			districtBorders = chainP(
				W.chains.filter((c) => !c.coast && (!c.region || isG(c.l) || isG(c.r))),
			);

		const coverClips = (WA.covers ? WA.covers() : []).flatMap((c) => {
			const m = new DOMMatrix([c.k, 0, 0, c.k, c.x, c.y]),
				out = [];
			const hole = (add) => {
				const p = new Path2D();
				p.rect(W.vb[0] - 1e4, W.vb[1] - 1e4, W.vb[2] + 2e4, W.vb[3] + 2e4);
				const q = new Path2D();
				add(q);
				p.addPath(q, m);
				out.push(p);
			};
			for (const [x, y, rx, ry] of c.e || [])
				hole((q) => q.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2));
			for (const d of c.d || []) hole((q) => q.addPath(new Path2D(d)));
			return out;
		});
		const underCovers = () => {
			for (const p of coverClips) g.clip(p, "evenodd");
		};

		function bakeImg(f) {
			return fetch(BK.url + f)
				.then((r) => {
					if (!r.ok) throw new Error("HTTP " + r.status);
					return r.blob();
				})
				.then((b) => {
					bkStat.bytes += b.size;
					return window.createImageBitmap
						? createImageBitmap(b)
						: new Promise((ok, no) => {
								const u = URL.createObjectURL(b),
									im = new Image();
								im.onload = () => {
									URL.revokeObjectURL(u);
									ok(im);
								};
								im.onerror = (e) => {
									URL.revokeObjectURL(u);
									no(e);
								};
								im.src = u;
							});
				});
		}
		const bakedOf = (q) => {
			if (!BK) return undefined;
			const l = BK.man.tiles[q.L];
			return l ? l[q.tx + "," + q.ty] : undefined;
		};
		let ground = null;
		(function makeGround() {
			if (BK && BK.man.ground) {
				bakeImg(BK.man.ground).then(
					(c) => {
						ground = c;
						dirty = true;
						kick();
					},
					(e) => {
						console.warn("[карта мира] запечённая основа", e);
						BK.man.ground = null;
						makeGround();
					},
				);
				return;
			}
			const G0 = WA.groundSvg(),
				u = URL.createObjectURL(new Blob([G0.svg], { type: "image/svg+xml" })),
				im = new Image();
			im.onload = () => {
				try {
					const c = document.createElement("canvas");
					c.width = G0.w;
					c.height = G0.h;
					c.getContext("2d").drawImage(im, 0, 0);
					ground = c;
					dirty = true;
					kick();
				} catch (e) {
					console.warn("[карта мира] основа", e);
				}
				URL.revokeObjectURL(u);
			};
			im.onerror = () => URL.revokeObjectURL(u);
			im.src = u;
		})();
		const tiles = new Map();
		let queue = [],
			busy = 0,
			frameNo = 0,
			made = 0,
			madeMs = 0,
			held = false;
		const key = (L, x, y) => L + ":" + x + ":" + y;

		const BUDGET = 28e6;
		const CAP = () =>
			Math.max(
				BK ? 24 : 40,
				Math.floor(BUDGET / (TS * TS)),
				Math.ceil(
					((vw * DPR()) / TS + 2) * ((vh * DPR()) / TS + 2) * (BK ? 1.5 : 2.4),
				) + 8,
			);
		function want(L, tx, ty, pri, keep) {
			const k = key(L, tx, ty);
			const t = tiles.get(k);
			if (t) {
				t.used = frameNo;
				return t;
			}
			queue.push({ L, tx, ty, k, pri, keep });
			return null;
		}
		function pump() {
			const par = BK ? 4 : 2;
			if (!on() || held || busy >= par || !queue.length) return;
			queue.sort((a, b) => a.pri - b.pri);
			const q = queue.shift();
			if (tiles.has(q.k)) {
				pump();
				return;
			}
			const rec = { st: 1, c: null, used: frameNo, L: q.L };
			tiles.set(q.k, rec);
			busy++;
			setTimeout(async () => {
				if (!alive) return;
				await whenOn();
				if (!alive) return;
				const t0 = performance.now(),
					bf = bakedOf(q);

				const job =
					bf === 0
						? (bkStat.empty++, Promise.resolve(null))
						: bf
							? bakeImg(bf).then(
									(c) => {
										bkStat.hit++;
										return c;
									},
									(e) => {
										console.warn("[карта мира] запечённая плитка", q.k, e);
										bkStat.miss++;
										return renderTile(q);
									},
								)
							: (BK && bkStat.miss++, renderTile(q));
				job
					.then(
						(c) => {
							rec.c = c;
							rec.st = 2;
							made++;
							madeMs += performance.now() - t0;
						},
						(e) => {
							console.warn("[карта мира] плитка", e);
							rec.st = 3;
						},
					)
					.then(() => {
						busy--;
						tileReady();
						setTimeout(pump, 0);
					});
			}, 0);
			if (busy < par) setTimeout(pump, 0);
		}

		const raster = (svg, w, h) =>
			new Promise((ok, no) => {
				const u = URL.createObjectURL(
						new Blob([svg], { type: "image/svg+xml" }),
					),
					im = new Image();
				im.onload = () => {
					try {
						const c = document.createElement("canvas");
						c.width = w;
						c.height = h;
						c.getContext("2d").drawImage(im, 0, 0);
						ok(c);
					} catch (e) {
						no(e);
					}
					URL.revokeObjectURL(u);
				};
				im.onerror = (e) => {
					URL.revokeObjectURL(u);
					no(e);
				};
				im.src = u;
			});
		const BKT = [0.125, 0.25, 0.5, 1, 2, 2.83];
		const bucketOf = (n) =>
			BKT.find((b) => b >= n * 0.98) || BKT[BKT.length - 1];

		const SP = SPRITES;
		SP.users++;
		clearTimeout(SP.dropT);
		const sprites = SP.map;
		const prof = {
			parts: 0,
			atlas: 0,
			base: 0,
			stamps: 0,
			sites: 0,
			draw: 0,
			frames: 0,
		};
		function buildAtlas(list, b) {
			const A0 = WA.atlas(list, b);
			if (A0.h > 2048 && list.length > 1) {
				const h = list.length >> 1;
				return buildAtlas(list.slice(0, h), b).then(() =>
					buildAtlas(list.slice(h), b),
				);
			}
			return raster(A0.svg, Math.max(1, A0.w), Math.max(1, A0.h)).then((c) => {
				SP.px += c.width * c.height;
				for (const [k, cell] of A0.cells)
					sprites.set(k + "@" + b, {
						c,
						x: cell[0],
						y: cell[1],
						w: cell[2],
						h: cell[3],
						ox: cell[4],
						oy: cell[5],
					});
			});
		}
		function ensureSprites(ops, L) {
			return (SP.q = SP.q
				.then(() => {
					const need = new Map();
					for (const o of ops) {
						if (o[0] !== "s") continue;
						const t = o[1],
							b = bucketOf(o[4] * LV[L]);
						if (sprites.has(t.id + "b@" + b)) continue;
						let set = need.get(b);
						if (!set) need.set(b, (set = new Set()));
						set.add(t);
					}
					let p = Promise.resolve();
					for (const [b, set] of need)
						p = p.then(whenOn).then(() => buildAtlas([...set], b));
					return p;
				})
				.catch((e) => console.warn("[карта мира] заготовки", e)));
		}
		async function renderTile(q) {
			const T0 = performance.now(),
				P = WA.tileParts(q.L, q.tx, q.ty),
				S0 = LV[q.L],
				T1 = performance.now();
			await ensureSprites(P.ops, q.L);
			await whenOn();
			const T2 = performance.now(),
				c = document.createElement("canvas");
			c.width = c.height = TS;
			const t = c.getContext("2d");
			t.imageSmoothingQuality = "high";
			const world = () => t.setTransform(S0, 0, 0, S0, -P.x0 * S0, -P.y0 * S0);
			let inWorld = false;
			for (const o of P.ops) {
				if (o[0] === "p") {
					if (!inWorld) {
						world();
						inWorld = true;
					}
					o[1](t, q.L);
					continue;
				}
				if (inWorld) {
					t.setTransform(1, 0, 0, 1, 0, 0);
					inWorld = false;
				}
				const [, tp, x, y, k, ol] = o,
					n = k * S0,
					b = bucketOf(n),
					sp = sprites.get(tp.id + (ol ? "o" : "b") + "@" + b);
				if (!sp) continue;
				const f = n / b;
				t.drawImage(
					sp.c,
					sp.x,
					sp.y,
					sp.w,
					sp.h,
					(x - P.x0) * S0 - sp.ox * f,
					(y - P.y0) * S0 - sp.oy * f,
					sp.w * f,
					sp.h * f,
				);
			}
			t.setTransform(1, 0, 0, 1, 0, 0);
			const T3 = performance.now();
			prof.parts += T1 - T0;
			prof.atlas += T2 - T1;
			prof.base += T3 - T2;
			if (P.sites) {
				await whenOn();
				t.drawImage(await raster(P.sites, TS, TS), 0, 0);
			}
			prof.sites += performance.now() - T3;
			return c;
		}

		function tileReady() {
			if (tileT) return;
			const wait = Math.max(0, 120 - (performance.now() - lastDraw));
			tileT = setTimeout(() => {
				tileT = 0;
				dirty = true;
				kick();
			}, wait);
		}
		function evict() {
			const cap = CAP();
			if (tiles.size <= cap) return;

			const list = [...tiles.entries()]
				.filter(([, t]) => t.st !== 1 && t.L > 0 && t.used !== frameNo)
				.sort(
					(a, b) =>
						(a[1].seen || 0) - (b[1].seen || 0) || a[1].used - b[1].used,
				);
			for (let i = 0; i < list.length && tiles.size > cap; i++) {
				const c = list[i][1].c;
				if (c && c.close) c.close();
				tiles.delete(list[i][0]);
			}
		}

		let bias = 0;
		const levelFor = (s, b = bias) => {
			const d = (s * DPR()) / 2 ** b;
			for (let L = 0; L < LV.length; L++) if (LV[L] >= d * 0.85) return L;
			return LV.length - 1;
		};

		const MK = 1 / 32,
			MB = [W.vb[0] - ME, W.vb[1] - ME, W.vb[2] + 2 * ME, W.vb[3] + 2 * ME],
			mask = document.createElement("canvas");
		mask.width = Math.ceil(MB[2] * MK);
		mask.height = Math.ceil(MB[3] * MK);
		let fogAny = true,
			maskKey = "",
			maskDirty = false,
			mtmp = null,
			fogImg = null;

		function buildMask(force) {
			let k = "";
			for (const t of T) {
				const s = stOf(t);
				k += s === "hidden" ? "0" : s === "open" ? "1" : "2";
			}
			fogAny = k.includes("0");
			if (k === maskKey && !force) return;
			if (!on()) {
				maskDirty = true;
				return;
			}
			maskKey = k;
			maskDirty = false;
			const m = mask.getContext("2d"),
				blurOk = "filter" in m;
			if (!mtmp) {
				mtmp = document.createElement("canvas");
				mtmp.width = mask.width;
				mtmp.height = mask.height;
			}
			const q = mtmp.getContext("2d"),
				toWorld = () => q.setTransform(MK, 0, 0, MK, -MB[0] * MK, -MB[1] * MK),
				clr = () => {
					q.setTransform(1, 0, 0, 1, 0, 0);
					q.clearRect(0, 0, mtmp.width, mtmp.height);
				};
			m.setTransform(1, 0, 0, 1, 0, 0);
			m.globalCompositeOperation = "source-over";
			m.filter = "none";
			m.clearRect(0, 0, mask.width, mask.height);
			m.fillStyle = "#000";
			m.fillRect(0, 0, mask.width, mask.height);

			clr();
			toWorld();
			q.fillStyle = q.strokeStyle = "#000";
			q.lineJoin = "round";
			q.lineWidth = 900;
			for (const t of T)
				if (stOf(t) !== "hidden") {
					q.fill(P2[t.i]);
					q.stroke(P2[t.i]);
				}
			m.globalCompositeOperation = "destination-out";
			if (blurOk) m.filter = "blur(4px)";
			m.drawImage(mtmp, 0, 0);
			clr();
			toWorld();
			q.fillStyle = "#000";
			for (const t of T) if (stOf(t) === "hidden") q.fill(P2[t.i]);
			q.fillStyle = "rgba(0,0,0,.22)";
			for (const t of T) if (stOf(t) === "open") q.fill(P2[t.i]);
			m.globalCompositeOperation = "source-over";
			if (blurOk) m.filter = "blur(2.5px)";
			m.drawImage(mtmp, 0, 0);
			if (blurOk) m.filter = "none";

			if (opt.fogFast) {
				if (!fogImg) {
					fogImg = document.createElement("canvas");
					fogImg.width = mask.width;
					fogImg.height = mask.height;
				}
				const f = fogImg.getContext("2d");
				f.globalCompositeOperation = "source-over";
				f.clearRect(0, 0, fogImg.width, fogImg.height);
				f.fillStyle = f.createPattern(fogTex(), "repeat");
				f.fillRect(0, 0, fogImg.width, fogImg.height);
				f.globalCompositeOperation = "destination-in";
				f.drawImage(mask, 0, 0);
				f.globalCompositeOperation = "source-over";
			}
		}
		function computeAvail() {
			avail = new Set();
			if (opt.avail === false) return;

			const hasCur = T.some((t) => stOf(t) === "current");
			for (const t of T) {
				const s = stOf(t);
				if (hasCur ? s === "current" : s === "cleared")
					for (const o of t.nb) {
						const u = byId.get(o),
							gt = u && gateOf(t.i, u.i);
						if (
							u &&
							stOf(u) === "open" &&
							(!gt || gateOpen(gt)) &&
							!lairShut(u)
						)
							avail.add(u.i);
					}
			}
		}

		const mcache = new Map();
		const measure = (font, text) => {
			const k = font + "|" + text;
			let w = mcache.get(k);
			if (w == null) {
				g.font = font;
				w = g.measureText(text).width;
				mcache.set(k, w);
			}
			return w;
		};
		const F_REG = (px) => `400 ${px}px 'Russo One','Golos Text',sans-serif`,
			F_D = (px) => `700 ${px}px 'Golos Text',system-ui,sans-serif`,
			F_T = (px) => `600 ${px}px 'Golos Text',system-ui,sans-serif`;

		function label(L, text, x, y, font, px, fill, stroke, alpha, pad = 3, alt) {
			if (alpha < 0.03) return false;
			const w = measure(font, text);
			let box = null;
			for (const dy of alt || [0]) {
				const yy = y + dy * px,
					b0 = [
						x - w / 2 - pad,
						yy - px * 0.8 - pad,
						x + w / 2 + pad,
						yy + px * 0.3 + pad,
					];
				if (b0[0] < 2 || b0[2] > vw - 2 || b0[1] < 2 || b0[3] > vh - 2)
					continue;
				if (
					L.some(
						(b) => b0[0] < b[2] && b0[2] > b[0] && b0[1] < b[3] && b0[3] > b[1],
					)
				)
					continue;
				box = b0;
				y = yy;
				break;
			}
			if (!box) return false;
			L.push(box);
			g.globalAlpha = alpha;
			g.font = font;
			g.textAlign = "center";
			g.textBaseline = "alphabetic";
			g.lineJoin = "round";
			g.lineWidth = Math.max(3, px * 0.32);
			g.strokeStyle = stroke;
			g.strokeText(text, x, y);
			g.fillStyle = fill;
			g.fillText(text, x, y);
			g.globalAlpha = 1;
			return true;
		}

		let hatchC = null;
		function hatchOf(px) {
			if (!hatchC) {
				hatchC = document.createElement("canvas");
				hatchC.width = hatchC.height = 16;
				const h = hatchC.getContext("2d");
				h.strokeStyle = "rgba(95,90,112,.55)";
				h.lineWidth = 4;
				h.beginPath();
				h.moveTo(-4, 4);
				h.lineTo(4, -4);
				h.moveTo(0, 16);
				h.lineTo(16, 0);
				h.moveTo(12, 20);
				h.lineTo(20, 12);
				h.stroke();
			}
			const p = g.createPattern(hatchC, "repeat");
			if (p.setTransform) p.setTransform(new DOMMatrix([px, 0, 0, px, 0, 0]));
			return p;
		}

		const toS = (x, y) => [(x - cx) * S + vw / 2, (y - cy) * S + vh / 2];
		const toW = (sx, sy) => [(sx - vw / 2) / S + cx, (sy - vh / 2) / S + cy];

		const CSSM = !!opt.cssMove;
		let dv = null,
			gest = false,
			bgNow = "",
			fogSeaC = "";
		if (CSSM) host.classList.add("qwv-move");
		function preview() {
			if (!dv) return false;
			const m = S / dv.S,
				tx = vw / 2 - (m * vw) / 2 + (dv.cx - cx) * S,
				ty = vh / 2 - (m * vh) / 2 + (dv.cy - cy) * S,
				tr = `translate(${tx}px,${ty}px) scale(${m})`;
			cv.style.transform = pc.style.transform = tr;
			return true;
		}
		function draw() {
			frameNo++;
			lastDraw = performance.now();
			if (CSSM) {
				dv = { cx, cy, S };
				if (cv.style.transform) cv.style.transform = pc.style.transform = "";
			}
			if (maskDirty) buildMask(true);
			if (INTER) {
				const bg =
					fogAny && opt.fog !== false
						? fogSeaC || (fogSeaC = fogSea(WA.OCEAN))
						: WA.OCEAN;
				if (bg !== bgNow) host.style.backgroundColor = bgNow = bg;
			}
			const dpr = DPR(),
				bw = Math.round(vw * dpr),
				bh = Math.round(vh * dpr);
			if (cv.width !== bw || cv.height !== bh) {
				cv.width = pc.width = fogC.width = bw;
				cv.height = pc.height = fogC.height = bh;
				cv.style.width = pc.style.width = vw + "px";
				cv.style.height = pc.style.height = vh + "px";
			}
			g.setTransform(dpr, 0, 0, dpr, 0, 0);
			g.imageSmoothingEnabled = true;
			g.imageSmoothingQuality = "high";
			const x0 = cx - vw / 2 / S,
				y0 = cy - vh / 2 / S,
				x1 = cx + vw / 2 / S,
				y1 = cy + vh / 2 / S;
			g.fillStyle = WA.OCEAN;
			g.fillRect(0, 0, vw, vh);

			if (ground) {
				const k = WA.GS,
					sx = (x0 - W.vb[0]) * k,
					sy = (y0 - W.vb[1]) * k,
					sw = (x1 - x0) * k,
					sh = (y1 - y0) * k;
				drawSub(ground, sx, sy, sw, sh, 0, 0, vw, vh);
			}

			const L = levelFor(S),
				sz = WA.tileSize(L),
				[nx, ny] = WA.tileCount(L);
			const tx0 = clamp(Math.floor((x0 - W.vb[0]) / sz), 0, nx - 1),
				tx1 = clamp(Math.floor((x1 - W.vb[0]) / sz), 0, nx - 1),
				ty0 = clamp(Math.floor((y0 - W.vb[1]) / sz), 0, ny - 1),
				ty1 = clamp(Math.floor((y1 - W.vb[1]) / sz), 0, ny - 1);
			queue = queue.filter((q) => q.keep && !tiles.has(q.k));
			const [n0x, n0y] = WA.tileCount(0);
			for (let x = 0; x < n0x; x++)
				for (let y = 0; y < n0y; y++) want(0, x, y, -1);
			for (let tx = tx0; tx <= tx1; tx++)
				for (let ty = ty0; ty <= ty1; ty++) {
					const wx = W.vb[0] + tx * sz,
						wy = W.vb[1] + ty * sz,
						[sx, sy] = toS(wx, wy),
						d = sz * S;
					const t = want(
						L,
						tx,
						ty,
						Math.hypot(wx + sz / 2 - cx, wy + sz / 2 - cy) / sz,
					);
					if (t && t.st === 2) {
						t.seen = 1;
						drawTile(t.c, 0, 0, TS, sx, sy, d);
						continue;
					}
					if (bakedOf({ L, tx, ty }) === 0) continue;

					const fine = fineN(L, tx, ty);
					if (fine < 4)
						for (let up = 1; up <= L; up++) {
							const f = 2 ** up,
								a = tiles.get(key(L - up, tx >> up, ty >> up));
							if (a && a.st === 2) {
								a.used = frameNo;
								const sub = TS / f;
								drawTile(a.c, (tx % f) * sub, (ty % f) * sub, sub, sx, sy, d);
								break;
							}
						}
					if (fine) fineDraw(L, tx, ty, sx, sy, d);
				}

			if (INTER && !(anim && anim.s0 !== anim.s1)) {
				let room =
					CAP() - tiles.size - queue.filter((q) => !tiles.has(q.k)).length;
				for (let tx = tx0 - 1; tx <= tx1 + 1; tx++)
					for (let ty = ty0 - 1; ty <= ty1 + 1; ty++)
						if (
							(tx < tx0 || tx > tx1 || ty < ty0 || ty > ty1) &&
							tx >= 0 &&
							ty >= 0 &&
							tx < nx &&
							ty < ny
						) {
							const k2 = key(L, tx, ty);
							if (tiles.has(k2)) want(L, tx, ty, 50);
							else if (room > 0 && bakedOf({ L, tx, ty }) !== 0) {
								room--;
								want(L, tx, ty, 50);
							}
						}
			}
			setTimeout(pump, 0);
			evict();

			g.save();
			g.setTransform(
				dpr * S,
				0,
				0,
				dpr * S,
				dpr * (vw / 2 - cx * S),
				dpr * (vh / 2 - cy * S),
			);
			const px = 1 / S,
				vis = (t) =>
					t.bb[0] < x1 && t.bb[2] > x0 && t.bb[1] < y1 && t.bb[3] > y0;
			const tierD = sstep(0.1, 0.16, S);
			for (const t of T) {
				if (!vis(t)) continue;
				const s = stOf(t);

				if (s === "current") {
					g.fillStyle = "rgba(255,215,106,.16)";
					g.fill(P2[t.i]);
				}
				if (
					(s === "cleared" ||
						(s === "current" && info[t.id] && info[t.id].color)) &&
					!(info[t.id] && info[t.id].plain)
				) {
					const c = colorOf(t),
						ia = info[t.id];
					g.globalAlpha = ia && ia.fillA != null ? ia.fillA : 0.2;
					g.fillStyle = c;
					g.fill(P2[t.i]);
					g.globalAlpha = 1;
					if (ia && ia.hatch) {
						g.fillStyle = hatchOf(px);
						g.fill(P2[t.i]);
					}
				}
			}
			g.save();
			underCovers();
			if (tierD > 0.02) {
				g.globalAlpha = 0.75 * tierD;
				g.strokeStyle = "#2a2236";
				g.lineWidth = 1.5 * px;
				g.setLineDash([5 * px, 6 * px]);
				g.lineCap = "round";
				g.stroke(districtBorders);
				g.setLineDash([]);
				g.globalAlpha = 1;
			}
			g.lineJoin = "round";
			g.strokeStyle = "rgba(246,231,200,.75)";
			g.lineWidth = 7 * px;
			g.stroke(regionBorders);
			g.strokeStyle = "#2a2236";
			g.lineWidth = 3 * px;
			g.stroke(regionBorders);

			for (const t of T) {
				if (!vis(t)) continue;
				const s = stOf(t),
					ia = info[t.id];
				if ((s !== "cleared" && s !== "current") || (ia && ia.plain)) continue;
				const my = s === "current" || mine(t);
				g.save();
				g.clip(P2[t.i]);

				if (ia && ia.own) {
					if (ia.gold) {
						g.strokeStyle = "#ffcf4a";
						g.globalAlpha = 0.95;
						g.lineWidth = 17 * px;
						g.stroke(P2[t.i]);
					}
					g.strokeStyle = colorOf(t);
					g.globalAlpha = 0.95;
					g.lineWidth = 10 * px;
					g.stroke(P2[t.i]);
					g.globalAlpha = 1;
					g.restore();
					continue;
				}
				g.strokeStyle =
					s === "current" || (ia && ia.gold) ? "#ffcf4a" : colorOf(t);
				g.globalAlpha = my ? 0.85 : 0.65;
				g.lineWidth = (my ? 6 : 4.5) * px;
				g.stroke(P2[t.i]);
				g.restore();
			}
			g.restore();
			g.restore();

			if (fogAny && opt.fog !== false && opt.fogFast && fogImg) {
				g.globalAlpha = FOG_A;
				const fb = FOGX ? fogBox() : null;
				if (fb) {
					g.save();
					g.beginPath();
					g.rect(fb[0], fb[1], fb[2] - fb[0], fb[3] - fb[1]);
					g.clip();
				}
				drawSub(
					fogImg,
					(x0 - MB[0]) * MK,
					(y0 - MB[1]) * MK,
					(x1 - x0) * MK,
					(y1 - y0) * MK,
					0,
					0,
					vw,
					vh,
				);
				if (fb) {
					g.restore();
					fogBands(fb);
				}
				g.globalAlpha = 1;
			} else if (fogAny && opt.fog !== false) {
				fg.setTransform(1, 0, 0, 1, 0, 0);
				fg.globalCompositeOperation = "source-over";
				fg.clearRect(0, 0, bw, bh);
				const pat = fg.createPattern(fogTex(), "repeat"),
					ks = clamp(S * 46, 1.2, 4) * dpr;
				if (pat.setTransform)
					pat.setTransform(
						new DOMMatrix([
							ks,
							0,
							0,
							ks,
							(dpr * (vw / 2 - cx * S)) % (256 * ks),
							(dpr * (vh / 2 - cy * S)) % (256 * ks),
						]),
					);
				fg.fillStyle = pat;
				fg.fillRect(0, 0, bw, bh);
				fg.globalCompositeOperation = "destination-in";
				fg.imageSmoothingEnabled = true;
				const k = MK,
					sx = (x0 - MB[0]) * k,
					sy = (y0 - MB[1]) * k;
				fg.setTransform(dpr, 0, 0, dpr, 0, 0);
				drawSub(mask, sx, sy, (x1 - x0) * k, (y1 - y0) * k, 0, 0, vw, vh, fg);
				g.setTransform(1, 0, 0, 1, 0, 0);
				g.globalAlpha = FOG_A;
				g.drawImage(fogC, 0, 0);
				g.globalAlpha = 1;
				g.setTransform(dpr, 0, 0, dpr, 0, 0);
			}

			g.save();
			g.setTransform(
				dpr * S,
				0,
				0,
				dpr * S,
				dpr * (vw / 2 - cx * S),
				dpr * (vh / 2 - cy * S),
			);
			g.lineJoin = "round";
			if (hov >= 0 && hov !== sel) {
				g.fillStyle = "rgba(255,250,235,.16)";
				g.fill(P2[hov]);
				g.strokeStyle = "rgba(255,250,235,.95)";
				g.lineWidth = 3 * px;
				g.stroke(P2[hov]);
			}
			if (sel >= 0) {
				g.strokeStyle = "#2a2236";
				g.lineWidth = 7 * px;
				g.stroke(P2[sel]);
				g.strokeStyle = "#ffd76a";
				g.lineWidth = 4 * px;
				g.stroke(P2[sel]);
			}
			g.restore();
			labels(x0, y0, x1, y1);
			drawRestless();
			drawMarks();

			const pk = `${cx}|${cy}|${S}|${vw}|${vh}|${stVer}`;
			if (pk !== pulseKey) {
				pulseKey = pk;
				drawPulse(x0, y0, x1, y1);
			}
			if (opt.onFrame)
				try {
					opt.onFrame({ S, cx, cy, L });
				} catch (e) {}
		}

		function fogBox() {
			const k = (2 * S) / MK,
				ax = vw / 2 + (MB[0] - cx) * S,
				ay = vh / 2 + (MB[1] - cy) * S;
			return [
				Math.ceil(ax + k),
				Math.ceil(ay + k),
				Math.floor(ax + MB[2] * S - k),
				Math.floor(ay + MB[3] * S - k),
			];
		}
		function fogBands([ax, ay, bx, by]) {
			if (ax <= 0 && ay <= 0 && bx >= vw && by >= vh) return;
			const pat = g.createPattern(fogTex(), "repeat"),
				k = S / MK;
			if (!pat) return;
			if (pat.setTransform)
				pat.setTransform(
					new DOMMatrix([
						k,
						0,
						0,
						k,
						vw / 2 + (MB[0] - cx) * S,
						vh / 2 + (MB[1] - cy) * S,
					]),
				);
			g.fillStyle = pat;
			const t = clamp(ay, 0, vh),
				b = clamp(by, 0, vh);
			if (t > 0) g.fillRect(0, 0, vw, t);
			if (b < vh) g.fillRect(0, b, vw, vh - b);
			if (ax > 0) g.fillRect(0, t, Math.min(ax, vw), b - t);
			if (bx < vw) g.fillRect(Math.max(bx, 0), t, vw - Math.max(bx, 0), b - t);
		}
		function drawSub(img, sx, sy, sw, sh, dx, dy, dw, dh, ctx = g) {
			const iw = img.width,
				ih = img.height,
				cx0 = Math.max(0, sx),
				cy0 = Math.max(0, sy),
				cx1 = Math.min(iw, sx + sw),
				cy1 = Math.min(ih, sy + sh);
			if (cx1 <= cx0 || cy1 <= cy0) return;
			const kx = dw / sw,
				ky = dh / sh;
			ctx.drawImage(
				img,
				cx0,
				cy0,
				cx1 - cx0,
				cy1 - cy0,
				dx + (cx0 - sx) * kx,
				dy + (cy0 - sy) * ky,
				(cx1 - cx0) * kx,
				(cy1 - cy0) * ky,
			);
		}

		const fineN = (L, tx, ty) => {
			if (L + 1 >= LV.length) return 0;
			let n = 0;
			for (let i = 0; i < 4; i++) {
				const t = tiles.get(key(L + 1, tx * 2 + (i & 1), ty * 2 + (i >> 1)));
				if (t && t.st === 2) n++;
			}
			return n;
		};
		function fineDraw(L, tx, ty, x, y, d) {
			const h = d / 2;
			for (let i = 0; i < 4; i++) {
				const t = tiles.get(key(L + 1, tx * 2 + (i & 1), ty * 2 + (i >> 1)));
				if (t && t.st === 2) {
					t.used = frameNo;
					drawTile(t.c, 0, 0, TS, x + (i & 1) * h, y + (i >> 1) * h, h);
				}
			}
		}
		function drawTile(c, sx, sy, ss, x, y, d) {
			if (!c) return;
			g.drawImage(c, sx, sy, ss, ss, x - 0.35, y - 0.35, d + 0.7, d + 0.7);
		}
		function labels() {
			const B = [],
				z = S;
			const aReg = 1 - sstep(0.12, 0.18, z),
				aD = sstep(0.13, 0.18, z),
				aT = sstep(0.22, 0.32, z),
				aCap = 1 - sstep(0.2, 0.28, z);

			const order = T.slice().sort((a, b) => pr(b) - pr(a));
			function pr(t) {
				const s = stOf(t);
				return (
					(t.i === sel ? 100 : 0) +
					(s === "current"
						? 50
						: s === "cleared"
							? 20
							: s === "open"
								? 10
								: 0) +
					(t.capital ? 5 : 0) +
					t.area / 3e6
				);
			}
			if (opt.avoid) for (const a of opt.avoid) B.push(a.slice());

			if (opt.avoidWorld)
				for (const a of opt.avoidWorld) {
					const [p0, q0] = toS(a[0], a[1]),
						[p1, q1] = toS(a[2], a[3]);
					B.push([
						p0 - (a[4] || 0),
						q0 - (a[5] || 0),
						p1 + (a[4] || 0),
						q1 + (a[5] || 0),
					]);
				}

			if (opt.squad !== false)
				for (const t of T)
					if (stOf(t) === "current") {
						const [x, y] = toS(t.town.x, t.town.y);
						flag(x, y);
						B.push([x - 12, y - 72, x + 40, y + 4]);
					}

			const gK = 1,
				near = z >= 0.13;
			for (const gt of gatesD) {
				const [x, y] = toS(gt.x, gt.y);
				if (x < -60 || x > vw + 60 || y < -60 || y > vh + 60) continue;
				const vert =
						WA.W.gates && WA.W.gates.some((q) => q.id === gt.id && q.vert),
					hTop = (vert ? 420 : WA.GATE_H || 390) * gK * z;
				const open = gateOpen(gt),
					r0 = near ? 12 : 9;
				const by = near ? y - hTop * 0.97 - r0 : y - hTop * 0.42;
				lock(x, by, r0, open);
				if (near) {
					label(
						B,
						gateText(gt),
						x,
						by - r0 - 7,
						F_T(12),
						12,
						open ? "#2f6a2a" : "#f6ecd2",
						open ? "rgba(246,236,210,.95)" : "rgba(42,34,54,.9)",
						1,
						2,
					);
					label(
						B,
						gt.name,
						x,
						by - r0 - 26,
						F_D(13),
						13,
						"#2a2236",
						"rgba(246,236,210,.95)",
						1,
						2,
					);
				} else
					label(
						B,
						gt.name,
						x,
						Math.min(by - r0 - 4, y - hTop - 3),
						F_D(12),
						12,
						"#2a2236",
						"rgba(246,236,210,.95)",
						1,
						2,
						[0, -0.6],
					);
				B.push([x - r0 - 2, by - r0 - 2, x + r0 + 2, by + r0 + 2]);
			}

			for (const t of lairsD) {
				const [x, y] = toS(t.town.x, t.town.y);
				if (x < -60 || x > vw + 60 || y < -60 || y > vh + 60) continue;
				const L = levelFor(S),
					hTop = (LAIR_H[t.town.kind] || 545) * (WA.SITEK[L] ?? 1) * z,
					open = lairOpen(),
					r0 = near ? 12 : 9;
				const by = y - hTop - r0 - 2,
					hid = stOf(t) === "hidden" && !opt.showAllNames;
				lock(x, by, r0, open);
				if (near) {
					label(
						B,
						lairText(),
						x,
						by - r0 - 7,
						F_T(12),
						12,
						open ? "#2f6a2a" : "#f6ecd2",
						open ? "rgba(246,236,210,.95)" : "rgba(42,34,54,.9)",
						1,
						2,
					);
					if (
						label(
							B,
							t.name,
							x,
							by - r0 - 26,
							F_D(13),
							13,
							"#2a2236",
							"rgba(246,236,210,.95)",
							hid ? HID_A : 1,
							2,
						) &&
						!hid
					) {
						badge(B, `ур. ${t.recLevel}`, x, y + 16, 0.9, t.danger);
						specialMark(x - measure(F_D(13), t.name) / 2 - 13, by - r0 - 30, 1);
					}
				} else
					label(
						B,
						t.name,
						x,
						by - r0 - 4,
						F_D(12),
						12,
						"#2a2236",
						"rgba(246,236,210,.95)",
						hid ? HID_A : 1,
						2,
						[0, -0.6],
					);
				B.push([x - r0 - 2, by - r0 - 2, x + r0 + 2, by + r0 + 2]);
			}

			if (aReg > 0.03)
				for (const rg of R) {
					const ds = rg.districts.map((id) => byId.get(id)),
						known = ds.some((t) => stOf(t) !== "hidden");
					const [x, y] = toS(rg.c[0], rg.c[1]),
						px = clamp(
							Math.sqrt(ds.reduce((s, t) => s + t.area, 0)) *
								Math.min(z, 0.1) *
								0.075,
							15,
							24,
						);
					label(
						B,
						rg.name,
						x,
						y,
						F_REG(px),
						px,
						"#2a2236",
						"rgba(246,236,210,.92)",
						aReg * (known || opt.showAllNames ? 1 : HID_A),
						6,
						[0, 1.4, -1.4, 2.6, -2.6],
					);
				}

			for (const t of T)
				if (t.grand) {
					const [x, y] = toS(t.town.x, t.town.y);
					label(
						B,
						t.town.name,
						x,
						y + clamp(300 * z, 16, 110),
						F_REG(17),
						17,
						"#2a2236",
						"rgba(255,231,168,.95)",
						1,
						3,
						[0, 1.2],
					);
				}
			if (aCap > 0.03)
				for (const rg of R) {
					if (rg.capital.district && byId.get(rg.capital.district).grand)
						continue;
					const t = byId.get(rg.capital.district),
						hid = stOf(t) === "hidden" && !opt.showAllNames;
					const [x, y] = toS(rg.capital.x, rg.capital.y);
					label(
						B,
						rg.capital.name,
						x,
						y + 16,
						F_T(13),
						13,
						"#f6ecd2",
						"rgba(42,34,54,.9)",
						aCap * (hid ? HID_A : 1),
					);
				}

			for (const t of T) {
				const ia = info[t.id],
					here = ia && ia.here;
				if (!here || !here.length || !t.town) continue;
				const [hx, hy] = toS(t.town.x, t.town.y);
				if (hx < -60 || hx > vw + 60 || hy < -60 || hy > vh + 60) continue;
				otherFlag(
					B,
					hx + 18,
					hy - 6,
					here,
					1,
					(ia.hereC || [])[0],
					!!ia.hereMe,
				);
			}

			if (aD > 0.03 || aT > 0.03)
				for (const t of order) {
					const s = stOf(t),
						[x, y] = toS(t.c[0], t.c[1]),
						size = t.rad * z;
					if (x < -200 || x > vw + 200 || y < -100 || y > vh + 100) continue;

					const hid = s === "hidden" && !opt.showAllNames,
						ka = hid ? HID_A : 1;
					const px = clamp(size * 0.16, 12, 17);
					if (t.gate || (t.lair && !t.prologue)) continue;
					if (
						aD > 0.03 &&
						(size > 22 || t.i === sel) &&
						label(
							B,
							t.name,
							x,
							y,
							F_D(px),
							px,
							"#2a2236",
							"rgba(246,236,210,.92)",
							aD * ka * (s === "open" ? 0.85 : 1),
						) &&
						t.recLevel &&
						!hid
					) {
						badge(
							B,
							`ур. ${t.recLevel}`,
							x,
							y + px * 0.55 + 9,
							aD * 0.9,
							t.danger,
						);
						if (t.special)
							specialMark(
								x - measure(F_D(px), t.name) / 2 - 13,
								y - px * 0.3,
								aD,
							);
					}
					if (aT > 0.03 && t.town.kind !== "fair" && !t.grand) {
						const [tx, ty] = toS(t.town.x, t.town.y),
							off = clamp(70 * z * (t.capital ? 1.5 : 1), 10, 34);
						label(
							B,
							t.town.name,
							tx,
							ty + off,
							F_T(12),
							12,
							"#f6ecd2",
							"rgba(42,34,54,.88)",
							aT * ka,
						);
					}

					const tg = info[t.id] && info[t.id].tag;
					if (tg && aD > 0.03 && (size > 22 || t.i === sel))
						ownerTag(
							B,
							x,
							y + px * 0.55 + 34,
							String(tg),
							colorOf(t),
							aD,
							!!info[t.id].gold,
						);
				}
		}

		function drawMarks() {
			for (const [id, n] of Object.entries(marks)) {
				const t = byId.get(id);
				if (!t) continue;
				const [x, y] = toS(t.town.x, t.town.y - 60);
				if (x < -30 || x > vw + 30 || y < -30 || y > vh + 30) continue;
				g.save();
				g.translate(x, y);
				g.fillStyle = "#ffd76a";
				g.strokeStyle = "#2a2236";
				g.lineWidth = 4;
				g.beginPath();
				g.arc(0, 0, 19, 0, Math.PI * 2);
				g.fill();
				g.stroke();
				g.fillStyle = "#2a2236";
				g.font = F_REG(22);
				g.textAlign = "center";
				g.textBaseline = "middle";
				g.fillText(String(n), 0, 1);
				g.restore();
			}
		}

		function drawRestless() {
			const now = Date.now(),
				r0 = clamp(S * 90, 8, 12);
			for (const t of T) {
				const i = info[t.id];
				if (
					!i ||
					i.regrowAt == null ||
					now < i.regrowAt ||
					stOf(t) === "hidden"
				)
					continue;
				const [x, y0] = toS(t.c[0], t.c[1]),
					y = y0 - clamp(t.rad * S * 0.16, 12, 17) - r0 - 4;
				if (x < -20 || x > vw + 20 || y < -20 || y > vh + 20) continue;
				if (
					opt.avoid &&
					opt.avoid.some(
						(b) =>
							x + r0 > b[0] && x - r0 < b[2] && y + r0 > b[1] && y - r0 < b[3],
					)
				)
					continue;
				swords(x, y, r0);
			}
		}
		function swords(x, y, r0) {
			g.save();
			g.translate(x, y);
			g.scale(r0 / 11, r0 / 11);
			g.fillStyle = "#8a1a2a";
			g.strokeStyle = "#2a2236";
			g.lineWidth = 2.5;
			g.beginPath();
			g.arc(0, 0, 11, 0, Math.PI * 2);
			g.fill();
			g.stroke();
			g.strokeStyle = "#fff4cc";
			g.lineCap = "round";
			g.lineWidth = 2.2;
			g.beginPath();
			g.moveTo(-5.5, -5.5);
			g.lineTo(5, 5);
			g.moveTo(5.5, -5.5);
			g.lineTo(-5, 5);
			g.moveTo(1.5, 5.5);
			g.lineTo(5.5, 1.5);
			g.moveTo(-1.5, 5.5);
			g.lineTo(-5.5, 1.5);
			g.stroke();
			g.restore();
		}

		function lock(x, y, r0, open) {
			g.save();
			g.translate(x, y);
			g.scale(r0 / 13, r0 / 13);
			g.lineWidth = 3;
			g.strokeStyle = "#2a2236";
			g.fillStyle = open ? "#4f8a4a" : "#3a3046";
			g.beginPath();
			g.arc(0, 0, 13, 0, Math.PI * 2);
			g.fill();
			g.stroke();
			g.strokeStyle = "#ffd76a";
			g.fillStyle = "#ffd76a";
			g.lineWidth = 2.4;
			g.beginPath();
			if (open) {
				g.arc(-3, -3, 4.5, Math.PI, Math.PI * 1.9);
			} else {
				g.arc(0, -3, 4.5, Math.PI, 0);
			}
			g.stroke();
			g.fillRect(-6, -1, 12, 8);
			g.restore();
		}

		function specialMark(x, y, alpha) {
			g.save();
			g.globalAlpha = alpha;
			g.translate(x, y);
			g.rotate(Math.PI / 4);
			g.fillStyle = "#8a1a2a";
			g.strokeStyle = "#2a2236";
			g.lineWidth = 2;
			g.beginPath();
			g.rect(-6.5, -6.5, 13, 13);
			g.fill();
			g.stroke();
			g.rotate(-Math.PI / 4);
			g.fillStyle = "#fff4cc";
			g.font = F_D(11);
			g.textAlign = "center";
			g.textBaseline = "middle";
			g.fillText("!", 0, 0.5);
			g.restore();
		}

		const DZC = [
			"#6a8a4a",
			"#6a8a4a",
			"#8a8a3a",
			"#b0782a",
			"#b04a2a",
			"#8a1a2a",
		];
		function badge(Bx, text, x, y, alpha, dz) {
			const f = F_T(11),
				w = measure(f, text) + 10,
				box = [x - w / 2, y - 8, x + w / 2, y + 7];
			for (const b of Bx)
				if (box[0] < b[2] && box[2] > b[0] && box[1] < b[3] && box[3] > b[1])
					return;
			Bx.push(box);
			g.globalAlpha = alpha;
			g.fillStyle = DZC[dz] || DZC[1];
			g.beginPath();
			if (g.roundRect) g.roundRect(box[0], box[1], w, 15, 7);
			else g.rect(box[0], box[1], w, 15);
			g.fill();
			g.fillStyle = "#fff8e6";
			g.font = f;
			g.textAlign = "center";
			g.textBaseline = "middle";
			g.fillText(text, x, y);
			g.textBaseline = "alphabetic";
			g.globalAlpha = 1;
		}

		function ownerTag(Bx, x, y, txt, col, alpha, me) {
			const f = F_T(12),
				w = measure(f, txt) + 16,
				x0 = x - w / 2;
			const box = [x0 - 3, y - 13, x0 + w + 3, y + 8];

			if (box[0] < 2 || box[2] > vw - 2 || box[1] < 2 || box[3] > vh - 2)
				return false;
			if (
				Bx.some(
					(b) =>
						box[0] < b[2] && box[2] > b[0] && box[1] < b[3] && box[3] > b[1],
				)
			)
				return false;
			Bx.push(box);
			g.save();
			g.globalAlpha = alpha;
			g.translate(x0, y);
			g.lineJoin = "round";
			g.strokeStyle = "#2a2236";
			g.lineWidth = 2;
			g.beginPath();
			g.moveTo(1, 6);
			g.lineTo(1, -13);
			g.stroke();
			g.fillStyle = col;
			g.lineWidth = 1.4;
			g.beginPath();
			g.moveTo(2, -13);
			g.lineTo(13, -9);
			g.lineTo(2, -5);
			g.closePath();
			g.fill();
			g.stroke();
			g.font = f;
			g.textAlign = "left";
			g.textBaseline = "middle";
			g.lineWidth = 3.5;
			g.strokeStyle = me ? "rgba(255,231,168,.95)" : "rgba(246,236,210,.95)";
			g.strokeText(txt, 16, -2);
			g.fillStyle = me ? "#5a3a00" : "#2a2236";
			g.fillText(txt, 16, -2);
			g.textBaseline = "alphabetic";
			g.restore();
			return true;
		}
		function otherFlag(Bx, x, y, names, alpha, col, me) {
			const txt =
					(me ? `${names[0]} · ваш канал` : names[0]) +
					(names.length > 1 ? ` +${names.length - 1}` : ""),
				f = F_T(11),
				w = measure(f, txt);
			const box = [x - 2, y - 30, x + 14 + w, y + 2];
			if (box[0] < 2 || box[2] > vw - 2 || box[1] < 2 || box[3] > vh - 2)
				return;
			if (
				Bx.some(
					(b) =>
						box[0] < b[2] && box[2] > b[0] && box[1] < b[3] && box[3] > b[1],
				)
			)
				return;
			Bx.push(box);
			g.save();
			g.globalAlpha = alpha;
			g.translate(x, y);
			g.lineJoin = "round";
			g.strokeStyle = "#2a2236";
			g.lineWidth = 2.5;
			g.beginPath();
			g.moveTo(0, 0);
			g.lineTo(0, -26);
			g.stroke();
			g.fillStyle = /^#[0-9a-f]{6}$/i.test(String(col || "")) ? col : "#5a7a9a";
			g.lineWidth = 2;
			g.beginPath();
			g.moveTo(1, -26);
			g.lineTo(14, -21);
			g.lineTo(1, -16);
			g.closePath();
			g.fill();
			g.stroke();
			g.font = f;
			g.textAlign = "left";
			g.textBaseline = "middle";
			g.lineWidth = 3;
			g.strokeStyle = me ? "rgba(255,231,168,.95)" : "rgba(246,236,210,.9)";
			g.strokeText(txt, 16, -12);
			g.fillStyle = me ? "#5a3a00" : "#2a2236";
			g.fillText(txt, 16, -12);
			g.textBaseline = "alphabetic";
			g.restore();
		}

		function flag(x, y) {
			const me = Object.values(info).find((v) => v && v.mine && v.color);
			WA.flagDraw(g, x, y, 70, opt.flagColor || (me && me.color) || null);
		}

		function drawPulse() {
			const dpr = DPR();
			pg.setTransform(1, 0, 0, 1, 0, 0);
			pg.clearRect(0, 0, pc.width, pc.height);
			if (!avail.size && !T.some((t) => stOf(t) === "current")) return;
			pg.setTransform(
				dpr * S,
				0,
				0,
				dpr * S,
				dpr * (vw / 2 - cx * S),
				dpr * (vh / 2 - cy * S),
			);
			pg.lineJoin = "round";
			const px = 1 / S;
			for (const i of avail) {
				pg.save();
				pg.clip(P2[i]);
				pg.fillStyle = "rgba(255,215,106,.16)";
				pg.fill(P2[i]);
				pg.strokeStyle = "rgba(255,215,106,.85)";
				pg.lineWidth = 6 * px;
				pg.stroke(P2[i]);
				pg.restore();
				pg.strokeStyle = "rgba(255,215,106,.9)";
				pg.lineWidth = 1.6 * px;
				pg.setLineDash([8 * px, 6 * px]);
				pg.stroke(P2[i]);
				pg.setLineDash([]);
			}
		}

		function kick() {
			if (!raf && on()) raf = requestAnimationFrame(loop);
		}
		function loop(now) {
			raf = 0;
			if (!alive) return;
			if (anim) {
				const k = clamp((now - anim.t0) / anim.dur, 0, 1),
					e = anim.ease(k);
				S = Math.exp(anim.s0 + (anim.s1 - anim.s0) * e);
				cx = anim.x0 + (anim.x1 - anim.x0) * e;
				cy = anim.y0 + (anim.y1 - anim.y0) * e;
				if (INTER) bound();
				dirty = true;
				if (k >= 1) {
					const f = anim.done;
					anim = null;
					f && f();
				}
			}
			if (
				dirty &&
				CSSM &&
				(anim || inertia || gest) &&
				performance.now() - lastDraw < 250 &&
				preview()
			) {
			} else if (dirty) {
				dirty = false;
				const t0 = performance.now();
				try {
					draw();
				} catch (e) {
					console.warn("[карта мира] кадр", e);
				}
				prof.draw += performance.now() - t0;
				prof.frames++;
			}
			if (anim || inertia) {
				if (inertia) stepInertia();
				raf = requestAnimationFrame(loop);
			}
		}

		const axis = (c, a, len, half) =>
			len > half * 2 ? clamp(c, a + half, a + len - half) : a + len / 2;
		function bound() {
			S = clamp(S, zMin(), zMax());

			if (FOGX && opt.center && fitted) return;
			const ox = (ins.l - ins.r) / 2 / S,
				oy = (ins.t - ins.b) / 2 / S;
			const B = seaBox();
			cx = axis(cx + ox, B[0], B[2], ew() / 2 / S) - ox;
			cy = axis(cy + oy, B[1], B[3], eh() / 2 / S) - oy;
		}
		const easeIO = (x) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2),
			easeO = (x) => 1 - (1 - x) ** 3;
		let fitNow = false;
		function flyTo(x, y, s, dur = 600, done) {
			fitted = fitNow;
			const rm =
				window.matchMedia &&
				matchMedia("(prefers-reduced-motion: reduce)").matches;
			if (rm || dur <= 0) {
				cx = x;
				cy = y;
				S = s;
				if (INTER) bound();
				dirty = true;
				kick();
				done && done();
				return;
			}
			anim = {
				t0: performance.now(),
				dur,
				ease: dur > 900 ? easeIO : easeO,
				s0: Math.log(S),
				s1: Math.log(s),
				x0: cx,
				y0: cy,
				x1: x,
				y1: y,
				done,
			};
			kick();
		}
		function zoomAt(f, sx, sy, dur = 220) {
			const ns = clamp((anim ? Math.exp(anim.s1) : S) * f, zMin(), zMax()),
				[wx, wy] = toW(sx, sy);

			const nx = wx - (sx - vw / 2) / ns,
				ny = wy - (sy - vh / 2) / ns;
			if (dur) flyTo(nx, ny, ns, dur);
			else {
				fitted = false;
				S = ns;
				cx = nx;
				cy = ny;
				bound();
				dirty = true;
				kick();
			}
		}

		const fit = (dur = 500) => {
			const z = zFit(),
				f = fitIns();
			fitNow = true;
			if (INTER)
				flyTo(
					(LB[0] + LB[2]) / 2 + (f.r - f.l) / 2 / z,
					(LB[1] + LB[3]) / 2 + (f.b - f.t) / 2 / z,
					z,
					dur,
				);
			else
				flyTo(
					W.vb[0] + W.vb[2] / 2,
					W.vb[1] + W.vb[3] / 2 + 150,
					zMin() * 1.02,
					dur,
				);
			fitNow = false;
			fitted = true;
		};

		let inertia = null;
		function stepInertia() {
			if (!inertia) return;
			cx -= inertia.vx / S;
			cy -= inertia.vy / S;
			inertia.vx *= 0.9;
			inertia.vy *= 0.9;
			bound();
			dirty = true;
			if (Math.hypot(inertia.vx, inertia.vy) < 0.3) inertia = null;
		}
		const pts = new Map();
		let drag = null,
			pinch = null,
			moved = 0;
		function pick(sx, sy) {
			const [x, y] = toW(sx, sy);
			const i = W.terrAt(x, y);
			return i;
		}
		if (INTER) {
			host.addEventListener(
				"wheel",
				(e) => {
					e.preventDefault();
					setHover(-1);
					const r = host.getBoundingClientRect(),
						f = Math.exp(
							-clamp(e.deltaY * (e.deltaMode ? 33 : 1), -300, 300) * 0.0022,
						);
					inertia = null;
					zoomAt(f, e.clientX - r.left, e.clientY - r.top, 160);
				},
				{ passive: false },
			);
			host.addEventListener("pointerdown", (e) => {
				if (e.target !== cv && e.target !== pc && e.target !== host) return;
				host.setPointerCapture(e.pointerId);
				pts.set(e.pointerId, [e.clientX, e.clientY]);
				anim = null;
				inertia = null;
				moved = 0;
				if (pts.size === 1)
					drag = {
						x: e.clientX,
						y: e.clientY,
						t: performance.now(),
						vx: 0,
						vy: 0,
					};
				gest = true;
				if (pts.size === 2) {
					const [a, b] = [...pts.values()];
					pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), s: S };
					drag = null;
				}
			});
			host.addEventListener("pointermove", (e) => {
				const r = host.getBoundingClientRect();
				if (!pts.has(e.pointerId)) {
					if (e.pointerType === "mouse") {
						const i = pick(e.clientX - r.left, e.clientY - r.top);
						setHover(i, e.clientX - r.left, e.clientY - r.top);
					}
					return;
				}
				const prev = pts.get(e.pointerId);
				pts.set(e.pointerId, [e.clientX, e.clientY]);
				if (pinch && pts.size >= 2) {
					const [a, b] = [...pts.values()],
						d = Math.hypot(a[0] - b[0], a[1] - b[1]),
						mx = (a[0] + b[0]) / 2 - r.left,
						my = (a[1] + b[1]) / 2 - r.top;
					const f = (pinch.s * d) / pinch.d / S;
					const pmx = mx - (e.clientX - prev[0]) / 2,
						pmy = my - (e.clientY - prev[1]) / 2;
					zoomAt(f, mx, my, 0);
					cx -= (mx - pmx) / S;
					cy -= (my - pmy) / S;
					bound();
					moved += 10;
					return;
				}
				if (drag) {
					const dx = e.clientX - prev[0],
						dy = e.clientY - prev[1];
					moved += Math.abs(dx) + Math.abs(dy);
					if (dx || dy) fitted = false;
					cx -= dx / S;
					cy -= dy / S;
					bound();
					const now = performance.now(),
						dt = Math.max(1, now - drag.t);
					drag.vx = (dx / dt) * 16;
					drag.vy = (dy / dt) * 16;
					drag.t = now;
					dirty = true;
					kick();
					if (moved > 6) setHover(-1);
				}
			});
			const up = (e) => {
				if (!pts.has(e.pointerId)) return;
				pts.delete(e.pointerId);
				if (!pts.size && gest) {
					gest = false;
					dirty = true;
					kick();
				}
				if (pinch && pts.size < 2) {
					pinch = null;
					const rest = [...pts.values()][0];
					drag = rest
						? { x: rest[0], y: rest[1], t: performance.now(), vx: 0, vy: 0 }
						: null;
					return;
				}
				if (drag && !pts.size) {
					if (moved < 6 && e.type === "pointerup") {
						const r = host.getBoundingClientRect();
						select(pick(e.clientX - r.left, e.clientY - r.top), true);
					} else if (Math.hypot(drag.vx, drag.vy) > 2) {
						inertia = { vx: drag.vx, vy: drag.vy };
						kick();
					}
					drag = null;
				}
			};
			host.addEventListener("pointerup", up);
			host.addEventListener("pointercancel", up);
			host.addEventListener("pointerleave", (e) => {
				if (e.pointerType === "mouse") setHover(-1);
			});
			host.addEventListener("dblclick", (e) => {
				const r = host.getBoundingClientRect();
				zoomAt(2.2, e.clientX - r.left, e.clientY - r.top, 350);
			});
			host.addEventListener("keydown", (e) => {
				if (e.target !== host) return;
				const step = 80 / S,
					k = e.key;
				if (k === "ArrowLeft") cx -= step;
				else if (k === "ArrowRight") cx += step;
				else if (k === "ArrowUp") cy -= step;
				else if (k === "ArrowDown") cy += step;
				else if (k === "+" || k === "=") {
					zoomAt(1.6, vw / 2, vh / 2, 250);
					e.preventDefault();
					return;
				} else if (k === "-" || k === "_") {
					zoomAt(1 / 1.6, vw / 2, vh / 2, 250);
					e.preventDefault();
					return;
				} else if (k === "Enter" || k === " ") {
					select(pick(vw / 2, vh / 2), false);
					e.preventDefault();
					return;
				} else if (k === "Escape") {
					select(-1);
					return;
				} else return;
				e.preventDefault();
				fitted = false;
				bound();
				dirty = true;
				kick();
			});
			ui.addEventListener("click", (e) => {
				const b = e.target.closest("button");
				if (!b) return;
				const z = b.dataset.z;
				if (z === "in") zoomAt(1.8, vw / 2, vh / 2, 300);
				else if (z === "out") zoomAt(1 / 1.8, vw / 2, vh / 2, 300);
				else fit();
			});
			find.addEventListener("change", () => {
				const t = byId.get(find.value);
				if (t) {
					select(t.i, false);
					focusOn(t);
				}
				find.value = "";
			});
			card.addEventListener("click", (e) => {
				const b = e.target.closest("button");
				if (!b) return;
				if (b.classList.contains("x")) {
					select(-1);
					host.focus();
					return;
				}
				const t = byId.get(b.dataset.id);
				if (t) {
					select(t.i, false);
					focusOn(t);
				}
			});
		}
		function focusOn(t) {
			const s = Math.max(S, clamp(Math.min(vw, vh) / (t.rad * 7), 0.12, 0.5));
			flyTo(t.c[0], t.c[1], s, 700);
		}
		function setHover(i, sx, sy) {
			if (i === hov) {
				if (i >= 0 && tip) {
					tip.style.left = clamp(sx, 90, vw - 90) + "px";
					tip.style.top = Math.max(sy, 44) + "px";
				}
				return;
			}
			hov = i;
			dirty = true;
			kick();
			if (!tip) return;
			if (sx != null) {
				sx = clamp(sx, 90, vw - 90);
				sy = Math.max(sy, 44);
			}
			if (i < 0) {
				tip.classList.remove("on");
				host.style.cursor = "";
				return;
			}
			const t = T[i],
				s = stOf(t);
			tip.textContent = s === "hidden" ? `${t.name} — не исследован` : t.name;
			tip.style.left = sx + "px";
			tip.style.top = sy + "px";
			tip.classList.add("on");
			host.style.cursor = "pointer";
		}
		function select(i, fromClick, quiet) {
			sel = i;
			dirty = true;
			kick();
			if (opt.onSelect && !quiet)
				try {
					opt.onSelect(i >= 0 ? T[i].id : null);
				} catch (e) {}
			if (!card || opt.card === false) return;
			if (i < 0) {
				card.classList.remove("on");
				return;
			}
			const t = T[i],
				s = stOf(t),
				rg = R[t.ri],
				hidden = false,
				unexpl = s === "hidden",
				by = info[t.id] && info[t.id].by;
			const stars = `<b class="dz">${"★".repeat(t.danger)}</b><b class="dz0">${"★".repeat(5 - t.danger)}</b>`;
			card.innerHTML =
				`<button type="button" class="x" aria-label="Закрыть">×</button>` +
				`<h3>${esc(t.name)}</h3><p class="rg">${esc(rg.name)}${t.capital ? " · столица региона" : ""}${t.special ? " · особое место региона" : ""}${unexpl ? " · ещё не исследован" : ""}</p>` +
				`<dl><dt>Состояние</dt><dd><span class="st ${s}">${ST_RU[s]}</span></dd>` +
				(hidden
					? ""
					: `<dt>Зона</dt><dd>${t.zone === "inner" ? "Внутренняя — за стеной" : t.zone === "gate" ? "Проход сквозь хребет" : "Внешняя"}</dd>${
							t.gate
								? (
										() => {
											const gt = gatesD.find((q) => q.d === t.i);
											return gt
												? `<dt>Врата</dt><dd>${esc(gateText(gt))}</dd>`
												: "";
										}
									)()
								: ""
						}${t.lair && !t.prologue ? `<dt>Логово</dt><dd>${esc(lairText())}</dd>` : ""}<dt>Природа</dt><dd>${esc(D.biomes[t.biome] || t.biome)}</dd><dt>Опасность</dt><dd title="${DANGER_RU[t.danger]}"><span aria-hidden="true">${stars}</span> ${DANGER_RU[t.danger]}</dd><dt>Уровень героев</dt><dd>от ${t.recLevel} <span class="mu">(рекомендуемый средний; сила отряда ${t.power})</span></dd><dt>${t.town.kind === "capital" ? "Столица" : "Поселение"}</dt><dd>${esc(t.town.name)}</dd>`) +
				(info[t.id] && info[t.id].owner
					? `<dt>Владелец</dt><dd><span class="own" style="background:${esc(colorOf(t))}"></span>Зачищен стримером ${esc(info[t.id].owner)}</dd>`
					: s === "cleared" && info[t.id] && by && by.length
						? `<dt>Владелец</dt><dd><span class="own" style="background:${esc(colorOf(t))}"></span>Ничей — от него отказались</dd>`
						: "") +
				(() => {
					const rn = regrowNote(info[t.id]);
					if (!rn || t.prologue) return "";
					return rn.state === "calm"
						? `<dt>Спокойно</dt><dd class="rg2">${esc(rn.text)}</dd>`
						: `<dt>Округ</dt><dd><span class="st restless">⚔ ${esc(rn.text)}</span></dd><dt>В конце карты</dt><dd>${esc(rn.end)}</dd>`;
				})() +
				(info[t.id] && info[t.id].owner && info[t.id].active != null
					? `<dt>Доход</dt><dd>${esc(money(info[t.id].income))}/ч <span class="mu">(активных игроков: ${info[t.id].active}) — в эфир владельца, в казну его столицы</span></dd>`
					: "") +
				(info[t.id] && info[t.id].treasury
					? `<dt>Клад</dt><dd>${esc(money(info[t.id].treasury))} <span class="mu">— достанется новому владельцу</span></dd>`
					: "") +
				(by && by.length > 1
					? `<dt>Зачищали</dt><dd>${by.map(esc).join(", ")}</dd>`
					: "") +
				"</dl>" +
				(avail.has(t.i)
					? `<p class="av">Доступна для похода: граничит с землями Легиона</p>`
					: "") +
				(hidden
					? ""
					: `<div class="nb" aria-label="Соседние округа">${t.nb
							.map((id) => {
								const u = byId.get(id),
									h = stOf(u) === "hidden",
									gt = gateOf(t.i, u.i);
								return `<button type="button" data-id="${esc(id)}" class="${h ? "h" : ""}" title="${h ? "не исследован" : ""}">${esc(u.name)}${gt ? ` <span class="gt">· ${esc(gt.name)}: ${gateOpen(gt) ? "открыты" : "закрыты"}</span>` : ""}${u.lair && !u.prologue ? ` <span class="gt">· логово ${lairOpen() ? "открыто" : "закрыто"}</span>` : ""}</button>`;
							})
							.join("")}</div>`) +
				(t.nameDraft && !hidden ? `<p class="dr">Название черновое</p>` : "");
			card.classList.add("on");
			if (live) live.textContent = `${t.name}, ${ST_RU[s]}`;
			if (!fromClick) {
			}
		}
		function fillFind() {
			if (!find) return;
			const opts = ['<option value="">Перейти к округу…</option>'];
			for (const rg of R) {
				const ds = rg.districts.map((id) => byId.get(id));
				opts.push(
					`<optgroup label="${esc(rg.name)}">${ds.map((t) => `<option value="${esc(t.id)}">${esc(t.name)}</option>`).join("")}</optgroup>`,
				);
			}
			find.innerHTML = opts.join("");
		}

		function resize() {
			const r = host.getBoundingClientRect(),
				nw = host.offsetWidth || Math.round(r.width),
				nh = host.offsetHeight || Math.round(r.height);
			if (!nw || !nh) return;
			const pk = Math.max(1, Math.min(2, r.width / nw || 1));
			if (nw === vw && nh === vh && pk === pageK) return;
			pageK = pk;
			const first = !vw,
				refit = INTER && !first && fitted;
			vw = nw;
			vh = nh;
			host.classList.toggle("narrow", vw < 620);
			ins = insOf();
			if (first) {
				S = zMin();
			}
			if (refit) fit(0);
			if (INTER) bound();
			dirty = true;
			kick();
		}
		const ro = window.ResizeObserver ? new ResizeObserver(resize) : null;
		if (ro) ro.observe(host);
		else window.addEventListener("resize", resize);
		const io = window.IntersectionObserver
			? new IntersectionObserver((es) => {
					onScreen = es.some((e) => e.isIntersecting);
					pause();
				})
			: null;
		if (io) io.observe(host);
		const vis = () => {
			visible = !document.hidden;
			pause();
		};
		document.addEventListener("visibilitychange", vis);
		function pause() {
			const o = on();
			host.classList.toggle("qwv-paused", !o);

			if (o) {
				const w = waiters;
				waiters = [];
				w.forEach((f) => f());
				gateOn();
				if (anim || inertia || maskDirty) dirty = true;
				kick();
				setTimeout(pump, 0);
				return;
			}
			if (raf) {
				cancelAnimationFrame(raf);
				raf = 0;
			}
			if (tileT) {
				clearTimeout(tileT);
				tileT = 0;
			}
			gateOff();
		}
		resize();

		const restlessN = () => {
			const now = Date.now();
			let n = 0;
			for (const k in info) {
				const i = info[k];
				if (i && i.regrowAt != null && now >= i.regrowAt) n++;
			}
			return n;
		};
		let restlessWas = restlessN();
		let gateTimer = 0;
		const gateOn = () => {
				if (!gateTimer && alive) gateTimer = setInterval(gateTick, 30000);
			},
			gateOff = () => {
				if (gateTimer) {
					clearInterval(gateTimer);
					gateTimer = 0;
				}
			};
		function gateTick() {
			if (!on()) return;
			if (gatesD.some((g) => opensAt(g) != null && !gateOpen(g))) {
				const was = avail.size;
				computeAvail();
				if (avail.size !== was) stVer++;
				dirty = true;
				kick();
			}
			const rn = restlessN();
			if (rn !== restlessWas) {
				restlessWas = rn;
				dirty = true;
				kick();
			}
			if (
				sel >= 0 &&
				card &&
				info[T[sel].id] &&
				info[T[sel].id].regrowAt != null
			)
				select(sel, true, true);
		}
		if (on()) gateOn();

		function legend() {
			const own = new Map();
			let none = 0;
			for (const t of T) {
				if (t.prologue || stOf(t) === "hidden") continue;
				const i = info[t.id];
				if (!i) continue;
				if (i.owner) {
					const o = own.get(i.owner) || {
						n: 0,
						c: i.color || "#c8102e",
						mine: !!i.mine,
					};
					o.n++;
					own.set(i.owner, o);
				} else if (i.by && i.by.length) none++;
			}
			if (!own.size && !none) {
				leg.hidden = true;
				return;
			}
			const nf = (n) =>
				`${n} ${n % 10 === 1 && n % 100 !== 11 ? "округ" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? "округа" : "округов"}`;
			leg.innerHTML =
				"<b>Земли каналов</b>" +
				[...own.entries()]
					.sort((a, b) => b[1].n - a[1].n)
					.slice(0, 6)
					.map(
						([ch, o]) =>
							`<div><i style="background:${esc(o.c)}"></i>${esc(ch)}${o.mine ? " (вы)" : ""} — ${nf(o.n)}</div>`,
					)
					.join("") +
				(own.size > 6 ? `<div>…и ещё ${own.size - 6}</div>` : "") +
				(none
					? `<div><i style="background:#8a8494"></i>ничьи — ${nf(none)}</div>`
					: "");
			leg.hidden = false;
		}
		function setStates(st, inf) {
			states = { ...(st || {}) };
			info = inf || {};
			stVer++;
			restlessWas = -1;
			computeAvail();
			buildMask();
			fillFind();
			try {
				legend();
			} catch (e) {
				leg.hidden = true;
			}
			pc.style.animation = "none";
			void pc.offsetWidth;
			pc.style.animation = "";
			if (sel >= 0) select(sel, true);
			dirty = true;
			kick();
		}
		setStates(opt.states || {}, opt.info);
		if (INTER && opt.start !== false) fit(0);

		const api = {
			setStates,

			setGates(gm, lairsAt) {
				for (const g of gatesD) {
					const v = gm && gm[g.district || g.inner];
					g.opensAt = v == null ? undefined : v;
				}
				lairsOver = lairsAt === undefined ? undefined : lairsAt;
				computeAvail();
				stVer++;
				dirty = true;
				kick();
			},

			flyBox(bb, pad = 0.15) {
				const w = (bb[2] - bb[0]) * (1 + pad * 2) || 1,
					h = (bb[3] - bb[1]) * (1 + pad * 2) || 1,
					s = clamp(Math.min(ew() / w, eh() / h), zMin(), 0.5);
				flyTo(
					(bb[0] + bb[2]) / 2 + (ins.r - ins.l) / 2 / s,
					(bb[1] + bb[3]) / 2 + (ins.b - ins.t) / 2 / s,
					s,
					700,
				);
			},

			relayout() {
				if (!INTER || !vw) return;
				const was = fitted;
				ins = insOf();
				if (was) fit(250);
				else {
					bound();
					dirty = true;
					kick();
				}
			},
			bakeStats: () => ({ on: !!BK, ...bkStat }),

			_tile: (L, tx, ty) => renderTile({ L, tx, ty }),
			_ground: () =>
				new Promise((ok, no) => {
					const G0 = WA.groundSvg();
					raster(G0.svg, G0.w, G0.h).then(ok, no);
				}),
			setSeason(v) {
				season = { ...season, ...(v || {}) };
				computeAvail();
				stVer++;
				if (sel >= 0) select(sel, true);
				dirty = true;
				kick();
			},
			setMarks(m) {
				marks = { ...(m || {}) };
				dirty = true;
				kick();
			},
			setNames(v) {
				opt.showAllNames = !!v;
				fillFind();
				if (sel >= 0) select(sel, true);
				dirty = true;
				kick();
			},
			hold(v) {
				held = !!v;
				bias = held && !INTER ? 1 : 0;
				if (!held) {
					dirty = true;
					kick();
					setTimeout(pump, 0);
				}
			},
			setView(x, y, w) {
				cx = x;
				cy = y;
				S = vw / w;
				dirty = true;
			},
			renderNow() {
				if (raf) {
					cancelAnimationFrame(raf);
					raf = 0;
				}
				dirty = false;
				draw();
			},
			fit,
			flyTo: (id, dur) => {
				const t = byId.get(id);
				if (t) focusOn(t);
			},
			select: (id) =>
				select(id == null ? -1 : (byId.get(id) || { i: -1 }).i, true),

			idAt: (sx, sy) => {
				const i = pick(sx, sy);
				return i >= 0 && T[i] ? T[i].id : null;
			},
			hover: (id) => setHover(id == null ? -1 : (byId.get(id) || { i: -1 }).i),

			preload(views, ms = 8000, b = bias) {
				const need = [],
					seen = new Set();
				for (const v of views) {
					const s = vw / v.w,
						L = levelFor(s, b),
						sz = WA.tileSize(L),
						[nx, ny] = WA.tileCount(L),
						x0 = v.x - v.w / 2,
						y0 = v.y - (v.w * vh) / vw / 2,
						x1 = v.x + v.w / 2,
						y1 = v.y + (v.w * vh) / vw / 2;
					for (
						let tx = clamp(Math.floor((x0 - W.vb[0]) / sz), 0, nx - 1);
						tx <= clamp(Math.floor((x1 - W.vb[0]) / sz), 0, nx - 1);
						tx++
					)
						for (
							let ty = clamp(Math.floor((y0 - W.vb[1]) / sz), 0, ny - 1);
							ty <= clamp(Math.floor((y1 - W.vb[1]) / sz), 0, ny - 1);
							ty++
						) {
							const k = key(L, tx, ty);
							if (!seen.has(k)) {
								seen.add(k);
								need.push([L, tx, ty]);
							}
						}
				}
				const [n0x, n0y] = WA.tileCount(0);
				for (let x = 0; x < n0x; x++)
					for (let y = 0; y < n0y; y++)
						if (!seen.has(key(0, x, y))) {
							seen.add(key(0, x, y));
							need.push([0, x, y]);
						}
				need.forEach(([L, tx, ty], i) =>
					want(L, tx, ty, (L === 0 ? -200 : -100) + i * 0.01, true),
				);
				setTimeout(pump, 0);
				const t0 = performance.now();
				return new Promise((ok) => {
					const chk = () => {
						const left = need.filter(([L, tx, ty]) => {
							const t = tiles.get(key(L, tx, ty));
							return !t || t.st < 2;
						}).length;
						if ((!left && ground) || performance.now() - t0 > ms || !alive)
							ok(left);
						else setTimeout(chk, 60);
					};
					chk();
				});
			},
			get view() {
				return { cx, cy, S, w: vw / S, L: levelFor(S) };
			},
			stats: () => ({
				tiles: [...tiles.values()].filter((t) => t.st === 2).length,
				made,
				avgMs: made ? Math.round(madeMs / made) : 0,
				mb: Math.round(
					([...tiles.values()].filter((t) => t.st === 2).length * TS * TS * 4 +
						SP.px * 4 +
						(ground ? ground.width * ground.height * 4 : 0) +
						mask.width * mask.height * 4 +
						cv.width * cv.height * 12) /
						1048576,
				),
			}),
			spriteMB: () => Math.round((SP.px * 4) / 1048576),
			tileMap: () => tiles,
			prof: () =>
				Object.fromEntries(
					Object.entries(prof).map(([k, v]) => [k, Math.round(v)]),
				),

			cam: () => ({
				cx,
				cy,
				S,
				vw,
				vh,
				ins: { ...ins },
				fitted,
				zMin: zMin(),
				zCover: zCover(),
				vb: W.vb.slice(),
				land: LB.slice(),
				sea: SEA,
				box: seaBox().slice(),
				fitIns: { ...fitIns() },
				view: [
					cx - vw / 2 / S,
					cy - vh / 2 / S,
					cx + vw / 2 / S,
					cy + vh / 2 / S,
				],
			}),
			debug: () => ({
				frames: frameNo,
				q: queue.length,
				busy,
				ground: !!ground,
				held,
				visible,
				onScreen,
				act,
				vw,
				vh,
				alive,
				tiles: tiles.size,
				raf: !!raf,
				gate: !!gateTimer,
				tileT: !!tileT,
				waiters: waiters.length,
				maskDirty,
			}),

			setActive(v) {
				v = !!v;
				if (v === act) return;
				act = v;
				pause();
			},
			get active() {
				return on();
			},
			destroy() {
				if (alive) {
					SP.users--;
					if (!SP.users)
						SP.dropT = setTimeout(() => {
							if (!SP.users) {
								SP.map.clear();
								SP.px = 0;
							}
						}, 120000);
				}
				alive = false;
				gateOff();
				cancelAnimationFrame(raf);
				if (tileT) clearTimeout(tileT);
				{
					const w = waiters;
					waiters = [];
					w.forEach((f) => f());
				}
				if (ro) ro.disconnect();
				if (io) io.disconnect();
				document.removeEventListener("visibilitychange", vis);
				tiles.clear();
				host.innerHTML = "";
				host.classList.remove(NS, "narrow", "qwv-paused", "qwv-move");
			},
		};
		create.last = api;
		return api;
	}

	function prologueStates(D = window.QWorldData) {
		const st = {};
		for (const t of D.territories)
			if (t.prologue) st[t.id] = t.lair ? "current" : "cleared";
		for (const t of D.territories)
			if (t.prologue) for (const o of t.nb) if (!st[o]) st[o] = "open";
		return st;
	}
	return { create, prologueStates, regrowNote, money };
})();
