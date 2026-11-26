((root, factory) => {
	const M = factory();
	if (typeof module === "object" && module.exports) module.exports = M;
	else root.LGMineShares = M;
})(typeof self !== "undefined" ? self : this, () => {
	function splitShards(T, ls, ok) {
		ls = ls.filter(([, w]) => w > 0);
		const n = ls.length,
			out = {};
		if (!n || !(T > 0)) return out;
		const W = ls.reduce((a, x) => a + x[1], 0),
			q = ls.map(([, w]) => (T * w) / W),
			a = q.map((x) => Math.floor(x + 1e-9));
		const gu = (k) => !ok || ok.has(ls[k][0]);
		let need = 0;
		for (let k = 0; k < n; k++) if (gu(k) || a[k] >= 1) need++;
		if (T >= need) for (let k = 0; k < n; k++) if (a[k] < 1 && gu(k)) a[k] = 1;
		let A = a.reduce((s, x) => s + x, 0);
		const tie = (x, y) =>
			ls[y][1] - ls[x][1] ||
			(ls[x][0] < ls[y][0] ? -1 : ls[x][0] > ls[y][0] ? 1 : 0);
		if (A < T) {
			const ord = ls
				.map((_, k) => k)
				.sort((x, y) => q[y] - a[y] - (q[x] - a[x]) || tie(x, y));
			for (let j = 0; A < T; j = (j + 1) % n) {
				a[ord[j]]++;
				A++;
			}
		}
		while (A > T) {
			let best = -1;
			for (let k = 0; k < n; k++)
				if (
					a[k] > 1 &&
					(best < 0 ||
						a[k] - q[k] - (a[best] - q[best]) > 1e-12 ||
						(Math.abs(a[k] - q[k] - (a[best] - q[best])) <= 1e-12 &&
							tie(best, k) < 0))
				)
					best = k;
			if (best < 0) break;
			a[best]--;
			A--;
		}
		for (let k = 0; k < n; k++) if (a[k] > 0) out[ls[k][0]] = a[k];
		return out;
	}

	function projectAll(o) {
		const by = { ...(o.by || {}) },
			left = Math.max(0, +o.left || 0),
			dig = (o.dig || []).filter(([, p]) => p > 0);
		const sum = dig.reduce((a, x) => a + x[1], 0);
		if (sum > 0)
			for (const [l, p] of dig) by[l] = (by[l] || 0) + (left * p) / sum;
		const ls = Object.entries(by).filter(([, w]) => w > 0),
			out = {};
		for (const [k, T] of Object.entries(o.loot || {})) {
			const rest = Math.max(0, (+T || 0) - (+(o.paid || {})[k] || 0));
			if (!(rest > 0)) continue;
			for (const [l, v] of Object.entries(splitShards(rest, ls, o.ok || null)))
				if (v > 0) (out[l] || (out[l] = {}))[k] = v;
		}
		return out;
	}

	function project(o) {
		const me = String(o.me || ""),
			dig = (o.dig || []).filter(([, p]) => p > 0);
		if (me && !dig.some(([l]) => l === me) && o.pw > 0) dig.push([me, +o.pw]);
		return (
			projectAll({ ...o, dig, ok: o.ok ? new Set([...o.ok, me]) : null })[me] ||
			{}
		);
	}
	return { splitShards, project, projectAll };
});

((root, factory) => {
	const M = factory();
	if (typeof module === "object" && module.exports) module.exports = M;
	else root.LGMineDig = M;
})(typeof self !== "undefined" ? self : this, () => {
	const r2 = (x) => Math.round(x * 100) / 100;
	const CAP_EPS = 1000;

	function dayMin(u, cap) {
		const c = Math.max(0, +cap || 0);
		return Math.floor(
			(c > 0 && u >= c - CAP_EPS ? Math.max(u, c) : u) / 60000 + 1e-9,
		);
	}

	const coins = (x) => ({ c: Math.floor(x), cx: r2(x) });

	const qpView = (k, p) =>
		k === "res" ? Math.floor(p * 100 + 1e-6) : Math.floor(p);

	function perMin(dg) {
		const u = Math.max(0, +dg.r || 0) * Math.max(0, +dg.s || 0),
			w0 = u / (+dg.k || 1);
		return {
			u,
			w0,
			coin: w0 * (+dg.c || 0),
			xp: Math.max(w0, 1) * (+dg.x || 0),
		};
	}

	const minOf = (dg, now) =>
		Math.max(0, Math.min(+now || 0, +dg.e || 0) - (+dg.t || 0)) / 60000;

	function grow(dg, now) {
		const b = dg.b || {},
			dt = minOf(dg, now),
			R = perMin(dg),
			out = {
				d: (+b.d || 0) + dt * 60000,
				c: (+b.c || 0) + R.coin * dt,
				m: (+b.m || 0) + R.xp * dt,
				u: (+b.u || 0) + (dg.w ? R.u * dt : 0),
				qp: {},
			};
		if (b.n != null) out.n = +b.n + R.coin * dt;
		if (b.cm != null) out.cm = +b.cm + (dg.q ? R.u * dt : 0);
		for (const [L, id, k, p] of b.qp || [])
			out.qp[L + ":" + id] =
				+p +
				(dg.q
					? k === "min"
						? dt
						: k === "work"
							? R.u * dt
							: k === "sh"
								? R.u * (+dg.h || 0) * dt
								: 0
					: 0);
		return out;
	}

	function view(me, now) {
		const dg = me && me.dr;
		if (!dg || typeof dg !== "object" || !dg.b) return me;
		const g = grow(dg, now),
			o = { ...me };
		o.day = dayMin(g.d, dg.cp);
		if (me.bag) o.bag = { ...me.bag, ...coins(g.c) };
		if (me.mx) {
			const need = +me.mx.need || 0;
			o.mx = { ...me.mx, xp: Math.floor(need > 0 ? Math.min(need, g.m) : g.m) };
		}
		if (dg.w) o.wk = Math.round(g.u);
		if (me.news && g.n != null) o.news = { ...me.news, ...coins(g.n) };
		if (me.q) {
			const q = { ...me.q },
				it = (L) => (x) => {
					const v = x && !x.done ? g.qp[L + ":" + x.id] : undefined;
					return v != null
						? { ...x, p: qpView(x.k, Math.min(+x.g || 0, v)) }
						: x;
				};
			if (Array.isArray(me.q.d)) q.d = me.q.d.map(it("d"));
			if (Array.isArray(me.q.w)) q.w = me.q.w.map(it("w"));
			if (me.q.c && g.cm != null) {
				const m = Math.floor(g.cm);
				q.c = { ...me.q.c, me: m };
				if (m >= (+me.q.c.min || 0)) q.c.ok = 1;
				else delete q.c.ok;
			}
			o.q = q;
		}
		return o;
	}
	return { view, grow, perMin, dayMin, coins, qpView, CAP_EPS };
});

((root, factory) => {
	const M = factory();
	if (typeof module === "object" && module.exports) module.exports = M;
	else root.LGMineDelta = M;
})(typeof self !== "undefined" ? self : this, () => {
	const MAPS = ["bl", "dg"];
	const SKIP = new Set(["dug", "bl", "dg", "fl", "dl", "town", "gv"]);
	const FSKIP = new Set(["c"]);
	const same = (a, b) => a === b || JSON.stringify(a) === JSON.stringify(b);
	const own = (o) => (o && typeof o === "object" ? o : {});

	function fields(a, b, skip) {
		const k = {},
			gone = [];
		for (const key of new Set([
			...Object.keys(own(a)),
			...Object.keys(own(b)),
		])) {
			if (skip.has(key)) continue;
			const x = a[key],
				y = b[key];
			if (y === undefined) {
				if (x !== undefined) gone.push(key);
				continue;
			}
			if (!same(x, y)) k[key] = y;
		}
		return {
			k: Object.keys(k).length ? k : null,
			x: gone.length ? gone : null,
		};
	}

	function flDiff(a, b) {
		if (same(a, b)) return null;
		if (!a || !b || !Array.isArray(a.c) || !Array.isArray(b.c))
			return { all: b == null ? null : b };
		const f = {},
			F = fields(a, b, FSKIP);
		if (F.k) f.k = F.k;
		if (F.x) f.x = F.x;
		const ra = new Map(a.c.map((r) => [r[0], r])),
			rb = new Map(b.c.map((r) => [r[0], r]));
		const c = [],
			cx = [];
		for (const [i, r] of rb) if (!ra.has(i) || !same(ra.get(i), r)) c.push(r);
		for (const i of ra.keys()) if (!rb.has(i)) cx.push(i);
		if (c.length) f.c = c;
		if (cx.length) f.cx = cx;
		return Object.keys(f).length ? f : null;
	}
	function flApply(fl, f) {
		if (!f) return fl;
		if ("all" in f) return f.all;
		const out = { ...own(fl) };
		if (f.x) for (const key of f.x) delete out[key];
		if (f.k) Object.assign(out, f.k);
		if (f.c || f.cx) {
			const m = new Map(
				(Array.isArray(out.c) ? out.c : []).map((r) => [r[0], r]),
			);
			for (const i of f.cx || []) m.delete(i);
			for (const r of f.c || []) m.set(r[0], r);
			out.c = [...m.values()].sort((p, q) => p[0] - q[0]);
		}
		return out;
	}
	function flMerge(f1, f2) {
		if (!f1) return f2;
		if (!f2) return f1;
		if ("all" in f2) return f2;
		if ("all" in f1) return { all: flApply(f1.all, f2) };
		const out = {},
			K = merge({ k: f1.k, x: f1.x }, { k: f2.k, x: f2.x });
		if (K.k) out.k = K.k;
		if (K.x) out.x = K.x;
		const m = new Map((f1.c || []).map((r) => [r[0], r])),
			gone = new Set(f1.cx || []);
		for (const i of f2.cx || []) {
			m.delete(i);
			gone.add(i);
		}
		for (const r of f2.c || []) {
			m.set(r[0], r);
			gone.delete(r[0]);
		}
		if (m.size) out.c = [...m.values()];
		if (gone.size) out.cx = [...gone];
		return out;
	}

	function diff(a, b) {
		const d = {};
		const k = {},
			gone = [];
		for (const key of new Set([
			...Object.keys(own(a)),
			...Object.keys(own(b)),
		])) {
			if (SKIP.has(key)) continue;
			const x = a[key],
				y = b[key];
			if (y === undefined) {
				if (x !== undefined) gone.push(key);
				continue;
			}
			if (!same(x, y)) k[key] = y;
		}
		if (Object.keys(k).length) d.k = k;
		if (gone.length) d.x = gone;
		const da = typeof a.dug === "string" ? a.dug : "",
			db = typeof b.dug === "string" ? b.dug : "";
		if (da !== db) {
			if (da.length !== db.length) d.dug = db;
			else {
				const ch = [];
				for (let i = 0; i < db.length; i++)
					if (da.charCodeAt(i) !== db.charCodeAt(i)) {
						ch.push([i, db[i]]);
						if (ch.length > db.length / 8) break;
					}
				d.dug = ch.length > db.length / 8 ? db : ch;
			}
		}
		for (const m of MAPS) {
			const x = own(a[m]),
				y = own(b[m]),
				o = {};
			for (const key of new Set([...Object.keys(x), ...Object.keys(y)])) {
				if (!(key in y)) o[key] = null;
				else if (!same(x[key], y[key])) o[key] = y[key];
			}
			if (Object.keys(o).length) d[m] = o;
		}
		if (a.fl !== undefined || b.fl !== undefined) {
			const f = flDiff(a.fl, b.fl);
			if (f) d.f = f;
		}
		return Object.keys(d).length ? d : null;
	}

	function apply(st, d) {
		if (!d) return st;
		const out = { ...st };
		if (d.x) for (const key of d.x) delete out[key];
		if (d.k) for (const [key, v] of Object.entries(d.k)) out[key] = v;
		if (d.dug != null) {
			if (typeof d.dug === "string") out.dug = d.dug;
			else {
				const a = String(out.dug || "").split("");
				for (const [i, c] of d.dug) a[i] = c;
				out.dug = a.join("");
			}
		}
		for (const m of MAPS) {
			if (!d[m]) continue;
			const o = { ...own(out[m]) };
			for (const [key, v] of Object.entries(d[m])) {
				if (v === null) delete o[key];
				else o[key] = v;
			}
			out[m] = o;
		}
		if (d.f) out.fl = flApply(out.fl, d.f);
		return out;
	}

	function merge(d1, d2) {
		if (!d1) return d2;
		if (!d2) return d1;
		const out = {};
		const x2 = new Set(d2.x || []),
			k = { ...(d1.k || {}) };
		for (const key of x2) delete k[key];
		Object.assign(k, d2.k || {});
		const x = [
			...new Set([
				...(d1.x || []).filter((key) => !(d2.k && key in d2.k)),
				...x2,
			]),
		];
		if (Object.keys(k).length) out.k = k;
		if (x.length) out.x = x;
		if (d1.dug != null || d2.dug != null) {
			if (typeof d2.dug === "string") out.dug = d2.dug;
			else if (d2.dug == null) out.dug = d1.dug;
			else if (typeof d1.dug === "string") {
				const a = d1.dug.split("");
				for (const [i, c] of d2.dug) a[i] = c;
				out.dug = a.join("");
			} else {
				const m = new Map(d1.dug || []);
				for (const [i, c] of d2.dug) m.set(i, c);
				out.dug = [...m];
			}
		}
		for (const m of MAPS)
			if (d1[m] || d2[m]) out[m] = { ...(d1[m] || {}), ...(d2[m] || {}) };
		if (d1.f || d2.f) out.f = flMerge(d1.f, d2.f);
		return out;
	}

	return { diff, apply, merge };
});

(() => {
	const CW = () => window.LGCraftWorld;
	const esc = window.LGSiteUi.esc;
	const GW = 7,
		GH = 12,
		SPEED = 260;
	let S = null,
		X = null,
		C = "mine";

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

	const gwRoot = (el) => {
		el.classList.add("gw-tok", "gw-dk");
		el.dataset.gst = gst();
		return el;
	};

	const TAB = (() => {
		try {
			const a = new Uint8Array(8);
			crypto.getRandomValues(a);
			return [...a].map((b) => b.toString(16).padStart(2, "0")).join("");
		} catch (e) {
			return (Date.now().toString(36) + Math.random().toString(36).slice(2, 12))
				.replace(/[^a-z0-9]/g, "")
				.slice(0, 24);
		}
	})();

	const CT = {
		mine: {
			to: "К скупщику",
			place: "Шахта",
			fl: "этаж",
			mast: "Горное дело",
			seller: "Скупщик Гром",
			sellerOf: "скупщика Грома",
			hello:
				"Сдавай руду — заплачу за работу, а руду отправлю в казну Ратуши на развитие города.",
			pick: "Выбери камень, чтобы копать",
			doing: "Копаешь",
			stop: "Перестать копать",
			stopTip: "Герой отложил кирку",
			bagEmpty: "Рудная сумка пуста — накопай руды.",
			done: "Камень выкопан — выбери следующий",
			broke: "Камень разбит!",
			rare: "Ты вскрыл редкую жилу",
			wall: "Скалу не разбить — обойди",
			far: "К этому камню пока не подойти — сначала расчисти путь",
			fresh: "новая шахта",
			here: "В шахте",
			today: "Сегодня в шахте",
			work: "копают",
			unitN: "Выкопано камней",
			idle: "Герой выкопал свой камень и ждёт — выбери ему новый.",
			busy: "Герой всё ещё копает свой камень.",
			board: "Итоги шахты",
			best: "Лучшие копатели недели",
			sold: "Скупщик принял руду",
			b: {
				rock: "камень",
				hard: "твёрдая порода",
				ore: "руда",
				rare: "редкая жила",
				chest: "окаменевший сундук",
				prize: "окаменевший сундук",
			},
			sp: {
				vein: "богатая жила",
				flood: "затопленная штольня",
				den: "логово крота",
			},
		},
	};
	const tx = () => CT.mine;

	const EYE_ICO =
		'<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/><path class="mn-eye-x" d="M3 3l18 18"/></svg>';

	const OUT_ICO =
		'<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h8"/><path d="M10 12h10M17 8l4 4-4 4"/></svg>';
	const CUP_ICO =
		'<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3"/><path d="M12 14v3M8 20h8M9 17h6"/></svg>';

	const mine2On = () => !!(S && S.me && S.me.fx && S.me.fx.m2);

	const art2On = () => mine2On() && !S.safe;

	const buyerOn = () => !!(S && S.me && S.me.fx && S.me.fx.b) && mine2On();

	const pickOn = () => !!(S && S.me && S.me.fx && S.me.fx.pk) && buyerOn();
	const SUP = "Снабженец Кремень";
	const SUP_SUB = "Торговец снаряжением";

	const BIO_JS =
		window.LG_CITYV && window.LG_CITYV.mb
			? "/site/mine-biome.js?v=" + window.LG_CITYV.mb
			: (
					(document.currentScript && document.currentScript.src) ||
					"/site/mine.js"
				).replace(/mine\.js(\?.*)?$/, "mine-biome.js");
	let bioLd = 0;
	const biome = () => {
		if (window.LGMineBiome) return window.LGMineBiome;
		if (!bioLd) {
			bioLd = 1;
			const sc = document.createElement("script");
			sc.src = BIO_JS;
			sc.onload = () => {
				if (S && S.st && !S.failed) {
					S.svgKey = "";
					try {
						draw();
					} catch (e) {
						recover(e, draw);
					}
				}
			};
			document.head.appendChild(sc);
		}
		return null;
	};

	const M3_JS =
		window.LG_CITYV && window.LG_CITYV.m3
			? "/site/mine3.js?v=" + window.LG_CITYV.m3
			: (
					(document.currentScript && document.currentScript.src) ||
					"/site/mine.js"
				).replace(/mine\.js(\?.*)?$/, "mine3.js");
	let m3Ld = 0;

	let m3Err = 0;
	const m3lib = () => {
		if (window.LGMine3) return window.LGMine3;
		if (!m3Ld) {
			m3Ld = 1;
			const sc = document.createElement("script");
			sc.src =
				M3_JS + (m3Err ? (M3_JS.includes("?") ? "&" : "?") + "r=" + m3Err : "");
			sc.onload = () => {
				m3Err = 0;
				if (S && S.st) {
					const st = S.st;
					S.F = floorOf(st);
					S.svgKey = "";
					try {
						pos3();
						draw();
						panel();
						fit(true);
					} catch (e) {
						recover(e, draw);
					}
				}
			};
			sc.onerror = () => {
				sc.remove();
				m3Err++;
				if (S) tip("Рисунки шахты не загрузились - пробую снова…");
				setTimeout(
					() => {
						m3Ld = 0;
						if (S && S.st && S.st.fl && S.st.fl.v3 && !window.LGMine3) m3lib();
					},
					Math.min(30000, 2000 * 2 ** (m3Err - 1)),
				);
			};
			document.head.appendChild(sc);
		}
		return null;
	};
	const V3 = () => !!(S && S.F && S.F.v3);

	const GX = () => (V3() ? window.LGWorldLib.mine3(S.F) : CW());

	const pos3 = () => {
		if (!V3() || !S.pos) return;
		const g = GX(),
			c = g.cellAt(S.pos.x, S.pos.y);
		if (c < 0 || !(g.inHall(c) || (S.dug && S.dug[c]))) {
			S.pos = spawnPt();
			S.path = null;
			S.want = null;
		}
	};

	const BIO_RU = {
		mount: "горы",
		ash: "пепел",
		forest: "лес",
		taiga: "тайга",
		ice: "лёд",
		meadow: "луга",
		swamp: "болото",
		blight: "порча",
		coast: "побережье",
		desert: "пустыня",
		ruin: "руины",
	};
	const stars = (d) => "★".repeat(Math.max(1, Math.min(5, +d || 1)));
	const q = () => `?c=${encodeURIComponent(C)}`;
	const CB = () => C.split(".")[0];

	const host = () => document.fullscreenElement || document.body;
	const rehost = () => {
		for (const el of document.querySelectorAll(".mn, .mn-board-w"))
			if (el.parentNode !== host()) host().appendChild(el);
	};
	document.addEventListener("fullscreenchange", rehost);

	function floorKey(st) {
		const base = st.seed + "." + st.n;
		if (!st.fl || !st.fl.v3) return base;
		const d =
			typeof st.dug === "string"
				? st.dug
				: Array.isArray(st.dug)
					? st.dug.join("")
					: "";
		let n = 0;
		for (let i = d.indexOf("1"); i >= 0; i = d.indexOf("1", i + 1)) n++;
		return base + "." + n;
	}
	function floorOf(st) {
		if (!st || !st.fl) return null;
		if (st.fl.v3) {
			const L3 = m3lib();
			biome();
			return L3 ? L3.floorOf(st) : null;
		}
		const cells = st.fl.c.map(([t, lv, r, a]) => ({
			t,
			lv,
			r: r || null,
			a,
			k: t === "entry" || t === "wall" || t === "void" ? 0 : 1,
		}));
		return {
			n: st.n,
			craft: "mine",
			biome: st.biome || "mount",
			danger: st.danger || 1,
			gem: st.gem || null,
			special: st.fl.special,
			coal: st.fl.coal || null,
			exit: st.fl.exit,
			entry: st.fl.entry,
			cells,
			done: false,
		};
	}
	const dugArr = (st) =>
		st && st.dug ? st.dug.split("").map((c) => (c === "1" ? 1 : 0)) : [];

	const MW = () =>
		V3() ? window.LGWorldLib.mine3(S.F) : window.LGWorldLib.mine;
	const walkable = (i) => MW().walkable(S.dug, i);
	const cellOfPt = (x, y) => MW().cellOfPt(x, y);
	const centerOf = (i) => MW().centerOf(i);
	const pathTo = (from, to) => MW().pathTo(S.dug, from, to);

	const digSpot = (i) => MW().digSpot(S.dug, i);

	const ft = () => (S && S.ft) || GX().feet({ lamp: true });
	const freePt = (p, stop = true) => GX().free(p.x, p.y, ft(), stop);
	const zoneY = () => (V3() ? Infinity : CW().Y0 + GH * CW().RH);

	const spawnPt = () => {
		const h = hashL(X.login());
		return V3()
			? GX().spawn(h % 21)
			: freePt({ x: 290 + (h % 110), y: 2372 + ((h >>> 7) % 60) });
	};
	const inZone = (c) => (V3() ? GX().inHall(c) : c >= GW * GH);

	function way(pts) {
		if (V3()) {
			const g = GX(),
				inH = (p) => g.inHall(g.cellAt(p.x, p.y)),
				out = [pts[0]];
			for (let k = 1; k < pts.length; k++) {
				const a = out[out.length - 1],
					b = pts[k];
				if (inH(a) && inH(b)) out.push(...g.route(a, b, ft()));
				else out.push(b);
			}
			return out;
		}
		const yb = zoneY(),
			q = pts.filter(
				(p, k) =>
					!(
						k > 0 &&
						k < pts.length - 1 &&
						p.y >= yb &&
						pts[k - 1].y >= yb &&
						pts[k + 1].y >= yb
					),
			),
			out = [q[0]];
		for (let k = 1; k < q.length; k++)
			out.push(...CW().route(out[out.length - 1], q[k], ft()));
		return out;
	}

	function open(x, c) {
		X = x;
		if (S) close();
		B.lines.clear();
		B.wait = null;
		B.said = null;
		C = /^[a-z0-9_-]{1,24}(\.[1-9][0-9]{0,2})?$/.test(String(c || ""))
			? String(c)
			: "home";
		const el = document.createElement("div");
		el.className = "mn gw-tok gw-dk";
		el.dataset.gst = gst();
		el.setAttribute("role", "dialog");
		el.setAttribute("aria-label", "Шахта");
		el.innerHTML = `<div class="mn-view" tabindex="0"><div class="mn-world"><svg class="mn-bg" aria-hidden="true"></svg><div class="mn-bars"></div><div class="mn-heroes"></div><div class="mn-labels" aria-hidden="true"></div></div><div class="mn-nowl" hidden role="status"><b data-mn-nt></b><em data-mn-left></em><button type="button" class="mn-nowx" data-mn-stop title="Перестать копать" aria-label="Перестать копать">Стоп</button><span class="mn-nowex" data-mn-ex hidden></span></div></div>
      <div class="mn-win" role="dialog" aria-label="Окно" hidden><button type="button" class="mn-win-x" data-mn-wx aria-label="Закрыть" title="Закрыть">×</button><div class="mn-pb" data-mn="body"></div></div>
      <header class="mn-top"><div class="mn-tl"><div class="mn-ttl"><b data-mn="name">Шахта</b><span data-mn="floor"></span><span class="mn-cnt" data-mn="cnt" hidden></span><small class="mn-reset" data-mn="reset"></small></div></div><div class="mn-tr"><div class="mn-tb"><button type="button" class="mn-cb mn-out" data-mn-out title="Выйти из шахты в город" aria-label="В город">${OUT_ICO}<span>В город</span></button><button type="button" class="mn-cb mn-info" data-mn-info title="Как устроена шахта" aria-label="Как устроена шахта" aria-haspopup="dialog">i</button><button type="button" class="mn-cb mn-hide" data-mn-hide aria-pressed="false" title="Скрыть других игроков" aria-label="Скрыть других игроков">${EYE_ICO}</button><button type="button" class="mn-cb" data-mn-board title="Итоги шахты" aria-label="Итоги шахты" aria-haspopup="dialog">${CUP_ICO}</button></div><section class="mn-wg" aria-label="Заработок и поручения"></section></div></header>
      <div class="mn-hat" role="status" hidden></div>
      <div class="mn-zoom" role="group" aria-label="Масштаб"><button type="button" class="btn ghost sm" data-mn-z="-1" aria-label="Отдалить">−</button><button type="button" class="btn ghost sm" data-mn-z="1" aria-label="Приблизить">+</button></div>
      <div class="mn-other" hidden><p>Шахта открыта в другой вкладке или окне - копать можно только в одной. Работой управляет та вкладка.</p><div class="mn-btns"><button type="button" class="btn primary" data-mn-here>Копать здесь</button><button type="button" class="btn ghost mn-exit" data-mn-exit>В город</button></div></div>
      <div class="mn-tip" role="status" hidden></div>${window.LGChat ? window.LGChat.html({ name: "Чат шахты", ph: "Написать в чат шахты…", log: "Журнал", logTitle: "Твой журнал в шахте" }) : ""}`;
		host().appendChild(el);
		document.body.classList.add("mn-on");
		S = {
			el,
			view: el.querySelector(".mn-view"),
			world: el.querySelector(".mn-world"),
			svg: el.querySelector(".mn-bg"),
			bars: el.querySelector(".mn-bars"),
			heroes: el.querySelector(".mn-heroes"),
			labels: el.querySelector(".mn-labels"),
			st: null,
			F: null,
			dug: [],
			me: null,
			pos: null,
			path: null,
			hovI: -1,
			others: new Map(),
			z: 1,
			zk: 1,
			tx: 0,
			ty: 0,
			raf: 0,
			pollT: 0,
			pingT: 0,
			myI: -1,
			sel: -1,
			at0: Date.now(),
			sentAt: 0,
			npcOpen: false,
			sid: "",
			want: null,
			looks: new Map(),
			lookAt: new Map(),
			lkWant: new Set(),
			lkAt: 0,
			svgKey: "",
			barKey: "",
			hide: false,
			qq: [],
		};
		try {
			S.hide = localStorage.getItem("lgMineHide") === "1";
		} catch (e) {}

		el.addEventListener(
			"pointerdown",
			(e) => {
				if (
					S &&
					!(e.target && e.target.closest && e.target.closest(".mn-news-w"))
				)
					S.acted = Date.now();
			},
			true,
		);
		el.querySelector("[data-mn-wx]").onclick = () => winClose();

		el.querySelector(".mn-other [data-mn-exit]").onclick = exit;
		el.querySelector("[data-mn-board]").onclick = () => {
			try {
				board({ api: X.api, login: X.login, mines: X.mines || (() => []) }, C);
			} catch (e) {}
		};

		el.querySelector("[data-mn-out]").onclick = exit;
		el.querySelector("[data-mn-info]").onclick = () => {
			try {
				help();
			} catch (e) {
				console.warn("шахта: окно «Как устроена шахта»", e);
			}
		};
		el.querySelector(".mn-nowl [data-mn-stop]").onclick = (e) => {
			if (e.detail === 0) stopDig();
		};
		el.querySelector("[data-mn-here]").onclick = () => {
			el.querySelector(".mn-other").hidden = true;
			enter(true);
		};

		const hb = el.querySelector("[data-mn-hide]");
		const hideUi = () => {
			const t = S.hide ? "Показать других игроков" : "Скрыть других игроков";
			hb.setAttribute("aria-pressed", String(S.hide));
			hb.classList.toggle("off", S.hide);
			hb.title = t;
			hb.setAttribute("aria-label", t);
		};
		hideUi();
		hb.onclick = () => {
			S.hide = !S.hide;
			try {
				localStorage.setItem("lgMineHide", S.hide ? "1" : "0");
			} catch (e) {}
			hideUi();
			heroes();
		};
		el.querySelectorAll("[data-mn-z]").forEach((b) => {
			b.onclick = () => {
				S.zk = Math.max(
					0.6,
					Math.min(1.8, S.zk * (b.dataset.mnZ === "1" ? 1.2 : 1 / 1.2)),
				);
				fit();
			};
		});
		el.querySelector(".mn-wg").addEventListener("click", wgClick);

		el.querySelector(".mn-win").addEventListener("pointerdown", (e) =>
			e.stopPropagation(),
		);
		bindCamera();
		bindHover();
		bindExHover();
		window.addEventListener("resize", fit);
		window.addEventListener("resize", winRefit);
		chatWatch();

		el.addEventListener("cy-chat-size", chatSized);

		{
			const tb = el.querySelector(".cy-chat-tabs");
			if (tb)
				tb.addEventListener("click", () => {
					clearTimeout(S.chatFitT);
					S.chatFitT = setTimeout(chatFit, 30);
				});
		}
		document.addEventListener("visibilitychange", vis);
		tlOn();
		document.addEventListener("keydown", key);
		document.addEventListener("pointerdown", outDown, true);
		kwBind();
		enter().catch(fail);
	}

	function fail(e) {
		try {
			console.error("[шахта]", e);
		} catch (x) {}
		if (!S) return;
		S.failed = String((e && e.message) || e || "").slice(0, 200);
		S.svgKey = "";

		const me0 = S,
			auto = (S.failN = (S.failN || 0) + 1) <= 2;
		winMsg(
			`<div class="mn-err" role="alert"><p>Шахта не нарисовалась на этом устройстве - ошибка: <code>${esc(S.failed || "неизвестно")}</code></p><p class="muted">${auto ? "Пробую ещё раз сам через 3 с." : "Нажми «Ещё раз» или «В город»."} Если повторяется - «Отправить баг» с этим текстом.</p><div class="mn-btns"><button type="button" class="btn primary" data-mn-retry>Ещё раз</button><button type="button" class="btn ghost mn-exit" data-mn-exit>В город</button></div></div>`,
		);
		const again = () => {
			if (!S || S !== me0) return;
			clearTimeout(S.failT);
			S.safe = true;
			S.svgKey = "";
			S.failed = "";
			S.npcOpen = false;
			S.el.querySelector(".mn-win").hidden = true;
			enter(true).catch(fail);
		};
		const rb = S.el.querySelector("[data-mn-retry]");
		if (rb) rb.onclick = again;
		clearTimeout(S.failT);
		if (auto)
			S.failT = setTimeout(() => {
				if (S === me0 && S.failed) again();
			}, 3000);
	}

	function winMsg(h) {
		const body = S.el.querySelector('[data-mn="body"]'),
			w = S.el.querySelector(".mn-win");
		if (!body || !w) return;
		body.innerHTML = h;
		S.bodyHtml = "";
		S.bodyParts = null;
		w.hidden = false;
		w.dataset.k = "err";
		w.classList.remove("tl", "dn");
		w.style.transform = `translate(${Math.max(8, (S.view.clientWidth - w.offsetWidth) / 2).toFixed(0)}px, ${Math.max(8, (S.view.clientHeight - w.offsetHeight) / 2).toFixed(0)}px)`;
		const xb = body.querySelector("[data-mn-exit]");
		if (xb) xb.onclick = exit;
	}

	let CHM = null;
	const chatX = () => {
		if (!X || !S) return X;
		if (!S.chatX)
			S.chatX = {
				...X,
				api: (p, b) =>
					X.api(
						/^\/api\/mine\/chat/.test(p)
							? p + `?c=${encodeURIComponent(CB())}`
							: p,
						b,
					),
			};
		return S.chatX;
	};

	const mchat = () =>
		CHM ||
		(CHM = window.LGChat
			? window.LGChat.make({
					state: () => S,
					X: chatX,
					base: "/api/mine/chat",
					say: "/api/mine/chat/say",
					key: "lgMineChat",
					win: { key: "lgMineChatWin" },
					name: "Чат шахты",
					ph: "Написать в чат шахты…",
					where: "в чате шахты",
					log: () => myLog(),
					logEmpty:
						"Пока пусто - здесь будут твои камни, добыча, находки и вклады.",

					flags: (h) => ({
						on: !!(S && S.mchatOn && mine2On()),
						tr: false,
						dm: !!(window.LGDm && h && h.cd),
					}),
					trade: false,
					here: () => !!(S && S.st),
					joining: "подключаемся к шахте…",
					rejoin: () => enter(true),
					onError: (er) => {
						if (/не в шахте/.test(er) && S) enter(true);
					},
				})
			: null);

	const one = () => !!(window.LGChatOne && window.LGChatOne.on());
	function mchatIn(r) {
		if (!S || !r || !r.mchat) return;
		if (one()) {
			window.LGChatOne.dock("mine", S.el);
			window.LGChatOne.enterFeed("mine", r.mchat);
			if (S.chatMo) S.chatMo.disconnect();
			chatWatch();
			chatFit();
			return;
		}
		const c = mchat();
		if (!c) return;
		S.mchatOn = true;
		c.init();
		c.enter(r.mchat);
		panel();
	}

	function exit() {
		try {
			close(true);
		} finally {
			try {
				if (X && X.close) X.close();
			} catch (e) {}
		}
	}
	function close(out) {
		if (!S) return;
		liftMenu(false);
		try {
			X.api(
				"/api/mine/leave" + q(),
				out === true ? { out: 1, sid: S.sid || undefined } : {},
			);
		} catch (e) {}
		cancelAnimationFrame(S.raf);
		clearInterval(S.pollT);
		clearInterval(S.pingT);
		if (S.chatMo) S.chatMo.disconnect();
		clearTimeout(S.chatFitT);
		clearTimeout(S.chatT);
		clearTimeout(S.failT);
		clearTimeout(S.entT);
		clearTimeout(S.cntT);
		clearTimeout(S.gdT);
		clearInterval(S.rideT);
		clearTimeout(S.rideTO);
		clearTimeout(S.rideOffT);
		if (S.chatRo) S.chatRo.disconnect();
		clearTimeout(S.chatHT);
		if (S.viewRo) S.viewRo.disconnect();
		window.removeEventListener("resize", fit);
		window.removeEventListener("resize", winRefit);
		clearTimeout(S.toastT);
		document.removeEventListener("visibilitychange", vis);
		document.removeEventListener("keydown", key);
		document.removeEventListener("pointerdown", outDown, true);
		tlOff();
		try {
			if (CHM) CHM.menuClose();
		} catch (e) {}
		if (BD && BD.mine && BD.d.isConnected)
			try {
				BD.shut();
			} catch (e) {
				BD.d.remove();
			}
		for (const h of document.querySelectorAll(".mn-help")) h.remove();
		S.el.remove();
		document.body.classList.remove("mn-on");
		S = null;

		if (window.LGChatOne) setTimeout(() => window.LGChatOne.place(), 0);
	}

	const OUT_OK =
		".mn-win, .mn-lm, .mn-inv2-w, .cy-chat, .mn-wg, .mn-zoom, .mn-board-w, .mn-news-w, .mn-news, .mn-other, input, textarea, select";
	function outOwn(t) {
		const o =
			t && t.closest ? t.closest("[data-npc],[data-obj],[data-drill]") : null;
		if (!o) return false;
		const k = S.lm ? S.lmK : S.npcOpen;
		if (k === "buy" || k === "lamp") return o.dataset.npc === k;
		if (k === "quests") return o.dataset.obj === "board";
		if (k === "lift") return o.dataset.obj === "lift";
		if (k === "drill") return o.dataset.drill === S.drillK;
		return false;
	}
	function outDown(e) {
		if (
			!S ||
			!(S.lm || S.npcOpen) ||
			!e.isPrimary ||
			(e.pointerType === "mouse" && e.button !== 0)
		)
			return;
		const t = e.target;
		if (!t || !t.closest || !S.el.contains(t) || t.closest(OUT_OK) || outOwn(t))
			return;
		e.stopPropagation();
		e.preventDefault();
		if (S.lm) liftMenu(false);
		if (S.npcOpen) winClose();
		const eat = (ev) => {
			ev.stopPropagation();
			ev.preventDefault();
			stop();
		};
		const stop = () => {
			clearTimeout(S.eatT);
			document.removeEventListener("click", eat, true);
		};
		stop();
		document.addEventListener("click", eat, true);
		S.eatT = setTimeout(stop, 400);
	}
	const key = (e) => {
		if (
			e.key === "Escape" &&
			S &&
			!(
				e.target &&
				e.target.closest &&
				e.target.closest("input, textarea, select, .cy-nm")
			)
		) {
			if (document.querySelector(".mn-board-w")) return;
			if (S.el.querySelector(".mn-inv2-w")) bagClose();
			else if (S.lm) liftMenu(false);
			else if (S.npcOpen) winClose();
			else exit();
		}
	};

	function vis() {
		if (!S) return;
		if (document.hidden) {
			cancelAnimationFrame(S.raf);
			S.hidAt = Date.now();
			S.hidDig = S.myI >= 0;
			return;
		}
		S.last = 0;
		step();

		if (S.st && S.F) {
			S.barKey = "";
			S.barReset = true;
			try {
				bars();
			} catch (e) {
				console.error("[шахта] полоски при возврате", e);
			}
		}
		const away = S.hidAt ? Date.now() - S.hidAt : 0,
			dug = S.hidDig;
		S.hidAt = 0;
		poll(false, true)
			.then(() => {
				if (S && dug && away > 60000) backTip();
			})
			.catch((e) => console.error("[шахта] возврат", e));
	}
	function backTip() {
		if (!S || !S.el.querySelector(".mn-other").hidden) return;
		tip(
			S.myI >= 0
				? "Пока вкладка была в фоне, герой копал - работа идёт"
				: "Пока вкладка была в фоне, герой докопал камень - выбери следующий",
		);
	}

	async function enter(again, ride) {
		const start = again && S.pos ? { x: S.pos.x, y: S.pos.y } : spawnPt();
		const me0 = S;
		const r = await X.api("/api/mine/enter" + q(), { ...start, tab: TAB });
		if (!S || S !== me0) return;

		if (r && !r.ok && r.error === "mine_closed") {
			try {
				if (X.toast)
					X.toast(
						"В эту шахту - через портал в её городе. Возвращаю в город" +
							((window.LGSiteUi &&
								window.LGSiteUi.closedCode &&
								window.LGSiteUi.closedCode(r)) ||
								""),
						true,
					);
			} catch (e) {}
			exit();
			return;
		}

		if (!r || !r.ok) {
			const net = !r || /нет связи/.test(r.error || ""),
				n = (S.entN = (S.entN || 0) + 1),
				auto = net && n <= 4,
				wait = 2 ** n;
			winMsg(
				`<p class="empty">${net ? "Нет связи с игрой - шахта не открылась." : esc((r && r.error) || "Шахта не открылась.")}${auto ? ` Пробую снова через ${wait} с…` : ""}</p><div class="mn-btns"><button type="button" class="btn primary" data-mn-retry>Ещё раз</button><button type="button" class="btn ghost mn-exit" data-mn-exit>В город</button></div>`,
			);
			const redo = () => {
				if (!S || S !== me0) return;
				clearTimeout(S.entT);
				S.el.querySelector(".mn-win").hidden = true;
				enter(again).catch(fail);
			};
			const rb = S.el.querySelector("[data-mn-retry]");
			if (rb) rb.onclick = redo;
			clearTimeout(S.entT);
			if (auto) S.entT = setTimeout(redo, wait * 1000);
			return;
		}
		S.entN = 0;
		S.sid = r.sid || "";
		if (!again) S.pos = { x: start.x, y: start.y };
		hereOf(r);
		presence(r, true);
		clk(r);
		take(r.st, r.me, r.lk);
		if (!S || S !== me0) return;
		if (!ride) {
			try {
				mchatIn(r);
			} catch (e) {
				console.error("[шахта] чат", e);
			}
		}
		pos3();
		if (!again) fit(true);
		clearInterval(S.pollT);
		clearInterval(S.pingT);

		S.pollT = setInterval(() => {
			meTick();
			poll();
		}, 3000);
		S.pingT = setInterval(() => {
			if (!document.hidden) X.api("/api/mine/ping" + q(), {});
		}, 60000);
	}

	function otherTab(on) {
		if (!S) return;
		S.el.querySelector(".mn-other").hidden = !on;
		if (on) {
			S.want = null;
		}
	}

	let pollN = 0;
	let pollAt = 0,
		pollB = null;

	const mnHeld = () => {
		const U = window.LGSiteUi;
		return U && U.hold ? U.hold.left() : 0;
	};

	function clk(r) {
		if (S && r && Number.isFinite(+r.now) && +r.now > 0)
			S.dt = Date.now() - +r.now;
	}
	const srvNow = () => Date.now() - ((S && S.dt) || 0);
	async function poll(full, force) {
		if (!S || (document.hidden && !full)) return;
		const liveNow = X.live && X.live(),
			polling = !liveNow && (!X.pollOk || X.pollOk());
		if (!full && !force && mnHeld()) return;
		if (!pollB) {
			const U = window.LGSiteUi;
			pollB =
				U && U.backoff
					? U.backoff({ steps: U.POLL_STEPS, jitter: 0.5, up: true })
					: { next: () => 10000, peek: () => 10000, reset() {} };
		}
		if (!full && !force && polling && !S.lkWant.size && Date.now() < pollAt)
			return;

		pollN++;
		if (
			!full &&
			!force &&
			!polling &&
			pollN % (window.LGPushOn && window.LGPushOn("mine") ? 100 : 10) &&
			!S.lkWant.size
		)
			return;
		if (polling) pollAt = Date.now() + pollB.peek();

		const sid0 = S.sid,
			c0 = C;

		const st0 = S.ride ? null : S.st,
			have =
				!full && st0
					? `&v=${encodeURIComponent(st0.v)}&f=${encodeURIComponent(floorKey(st0))}`
					: "";

		const lk = [...S.lkWant].slice(0, 60);
		S.lkWant.clear();
		if (lk.length) {
			S.lkAt = Date.now();
			for (const l of lk) if (S.looks.has(l)) S.lookAt.set(l, S.lkAt);
		}
		const mc =
			S.chat && S.chat.on && !(X.live && X.live())
				? `&mc=${S.chat.c || 0}`
				: "";
		const r = await X.api(
			"/api/mine/state" +
				q() +
				have +
				(S.sid ? `&sid=${S.sid}` : "") +
				(lk.length ? `&lk=${encodeURIComponent(lk.join(","))}` : "") +
				mc,
		);

		if (S && r && !r.ok && r.error === "mine_closed") {
			try {
				if (X.toast)
					X.toast(
						"Шахта закрыта: доступа сюда больше нет - возвращаю в город" +
							((window.LGSiteUi &&
								window.LGSiteUi.closedCode &&
								window.LGSiteUi.closedCode(r)) ||
								""),
						true,
					);
			} catch (e) {}
			exit();
			return;
		}
		if (polling) {
			if (r && r.ok) pollB.reset();
			else pollB.next();
			pollAt = Date.now() + Math.max(pollB.peek(), mnHeld());
		}
		if (!S || !r || !r.ok) return;

		if (C !== c0) return;
		if (r.mchat && S.chat && S.chat.on) mchat().apply(r.mchat);

		if (S.sid === sid0) otherTab(!!r.other);

		if (r.n == null && !r.other && Date.now() - (S.rejoinAt || 0) > 15000) {
			S.rejoinAt = Date.now();
			enter(true);
		}
		hereOf(r);
		presence(r);
		clk(r);
		take(r.st, r.me, r.lk);
	}

	function onEvent(d) {
		if (!S || !d) return;
		if (d.chatRoom === "mine") {
			if (S.chat && S.chat.on) mchat().apply(d);
			return;
		}
		if (d.c && d.c !== C) return;
		if (d.here != null) {
			hereOf(d);
			if (!d.st && !d.a && !d.m && !d.g && d.n == null) return;
		}

		if (d.q != null) {
			const st = chainTake(d);
			if (st && !document.hidden) {
				clk(d);
				take(st, null);
			}
			presence(d);
			return;
		}
		if (d.st && !document.hidden) {
			clk(d);
			take(d.st, null);
		}
		presence(d);
	}
	function chainTake(d) {
		const MD = window.LGMineDelta;
		if (d.st) {
			S.ch = { q: +d.q, st: d.st };
			S.chWait = false;
			return d.st;
		}
		if (!MD || !S.ch || +d.b !== S.ch.q) {
			S.ch = null;
			if (!S.chWait) {
				S.chWait = true;
				if (!S.full) {
					S.full = true;
					poll(true).finally(() => {
						if (S) S.full = false;
					});
				}
			}
			return null;
		}
		const st = MD.apply(S.ch.st, d.d || null);
		S.ch = { q: +d.q, st };
		return d.dl !== undefined ? { ...st, dl: d.dl } : st;
	}
	function hereOf(d) {
		if (!S || !d || d.here == null) return;
		S.here = +d.here || 0;
		S.hw = d.hw != null ? +d.hw || 0 : null;
		S.hg = d.hg != null ? +d.hg || 0 : null;
		if (d.hm) S.hm = +d.hm || 0;
		try {
			cnt();
		} catch (e) {
			console.error("[шахта] счётчик", e);
		}
	}

	function take(st, me, lk) {
		if (!S) return;
		try {
			take0(st, me, lk);
		} catch (e) {
			recover(e, () => take0(st, me, lk));
		}
	}
	function recover(e, redo) {
		if (!S) return;
		if (!S.safe && mine2On()) {
			try {
				console.error("[шахта] рисунки обновления", e);
			} catch (x) {}
			S.safe = true;
			S.svgKey = "";
			S.barKey = "";
			S.bodyHtml = "";
			try {
				if (window.LGMineBiome) window.LGMineBiome.off(S);
				for (const d of [...S.heroes.children]) d.remove();
				if (S.F && S.st) {
					draw();
					panel();
					fit(true);
				} else redo();
				return;
			} catch (e2) {
				e = e2;
			}
		}
		fail(e);
	}
	function take0(st, me, lk) {
		if (me) S.me = me;
		else {
			try {
				const h = X.hero();
				if (h && h.mn && h.mn[C]) S.me = h.mn[C];
			} catch (e) {}
		}
		meNow();
		if (lk)
			for (const [l, v] of Object.entries(lk)) {
				S.looks.set(l, v);
				S.lookAt.set(l, Date.now());
			}

		{
			const lt = !!(S.me && S.me.fx && S.me.fx.lt);
			if (S.el.classList.contains("mn-lite") !== lt)
				S.el.classList.toggle("mn-lite", lt);
		}

		{
			const gd = !!(S.me && S.me.fx && S.me.fx.gd);
			if (S.el.classList.contains("mn-gpu") !== gd) {
				S.el.classList.toggle("mn-gpu", gd);
				if (S.tx != null) apply();
			}
		}
		const m2 = mine2On() ? "1" : "0";
		if (S.el.dataset.m2 !== m2) {
			S.el.dataset.m2 = m2;
			if (S.mchatOn && CHM) CHM.init();
		}

		if (S.ride) {
			if (!st || st.n !== S.ride.f) return;
		} else if (
			st &&
			S.st &&
			st.v < S.st.v &&
			st.v > S.st.v - 500 &&
			st.week === S.st.week
		)
			st = null;

		if (st && S.st && st.cr && S.st.week != null && st.week !== S.st.week) {
			try {
				if (X.toast)
					X.toast(
						"Шахта обновилась: новые жилы и этажи. Добытое - в сумке, возвращаю в город",
						true,
					);
			} catch (e) {}
			exit();
			return;
		}
		if (
			st &&
			st.cr &&
			st.reset > Date.now() &&
			st.reset - Date.now() <= 3600e3 &&
			S.rsWarn !== st.week
		) {
			S.rsWarn = st.week;
			try {
				if (X.toast)
					X.toast(
						`Через ${Math.max(1, Math.ceil((st.reset - Date.now()) / 60000))} мин шахта обновится - кто будет внутри, выйдет в город`,
						false,
					);
			} catch (e) {}
		}

		if (!st) {
			panel();
			newsCheck();
			return;
		}

		if (!st.fl) {
			if (S.st && S.st.fl && S.st.seed === st.seed && S.st.n === st.n)
				st = { ...st, fl: S.st.fl };
			else {
				if (!S.full) {
					S.full = true;
					poll(true).finally(() => {
						if (S) S.full = false;
					});
				}
				return;
			}
		}

		if (follow3(st)) return;
		const newFloor = !S.st || S.st.n !== st.n || S.st.seed !== st.seed;
		const prevDug = S.dug,
			prevDg = (S.st && S.st.dg) || {},
			prevMy = S.myI;
		S.st = st;
		S.F = floorOf(st);
		S.dug = dugArr(st);
		S.stAt = Date.now();

		if (!S.F && st.fl && st.fl.v3) {
			S.burst = null;
			if (newFloor) {
				S.path = null;
				S.want = null;
				S.qq = [];
			}
			return;
		}

		const gotOf = (i) => {
			const d = (st.dl || []).find((x) => x[0] === i && x[1] === st.n);
			if (!d) return null;
			const m = d[4] || d[3] || {},
				v = m[X.login()] || 0;
			return {
				r: d[2],
				q: d[4] ? v : Math.round(v * 100),
				any: d[6] != null ? +d[6] || 0 : Object.keys(m).length,
				loot: (d[5] || {})[X.login()] || null,
			};
		};
		if (!newFloor && prevDug.length)
			S.burst = S.dug
				.map((d, i) => (d && !prevDug[i] ? i : -1))
				.filter((i) => i >= 0)
				.map((i) => ({
					i,
					mine: i === prevMy || (prevDg[i] || []).includes(X.login()),
					got: gotOf(i),
				}));

		const mine = Object.entries(st.dg || {}).find(([, ls]) =>
				ls.includes(X.login()),
			),
			mb =
				S.me && S.me.i >= 0 && !(st.fl && st.fl.v3 && S.me.f && S.me.f !== st.n)
					? (st.bl || {})[S.me.i]
					: null;
		S.myI = mine
			? +mine[0]
			: mb &&
					st.dug[S.me.i] !== "1" &&
					(mb[3] || 0) > ((st.dg || {})[S.me.i] || []).length
				? S.me.i
				: -1;

		if (S.left) {
			if (S.myI >= 0 && S.myI === S.left.i && !(S.left.ok && mine)) {
				S.myI = -1;
				if (
					Date.now() - (S.left.sent || S.left.at) > 30000 &&
					Date.now() - S.left.at < 30 * 60000
				) {
					S.left.sent = Date.now();
					X.api("/api/mineStop", { c: C, sid: S.sid });
				}
			} else if (S.myI >= 0 || Date.now() - S.left.at > 30 * 60000)
				S.left = null;
			else if (Date.now() - S.left.at > 3000) S.left.ok = true;
		}

		if (S.want) {
			const w = S.want,
				old = Date.now() - w.at > 15000 || newFloor;
			if (old || (w.i >= 0 ? S.myI === w.i || st.dug[w.i] === "1" : S.myI < 0))
				S.want = null;
			else S.myI = w.i;
		}

		for (const ls of Object.values(st.dg || {}))
			for (const l of ls.filter((x) => x !== X.login()).slice(0, 4))
				if (
					!S.others.has(l) &&
					(!S.looks.has(l) || Date.now() - (S.lookAt.get(l) || 0) > LOOK_MS)
				)
					S.lkWant.add(l);
		if (S.lkWant.size && Date.now() - S.lkAt > 5000) {
			S.lkAt = Date.now();
			setTimeout(() => poll(), 50);
		}
		if (newFloor && S.pos && S.F) {
			S.pos = spawnPt();
			S.path = null;
			S.want = null;
			S.qq = [];
		}
		draw();
		panel();

		logNow();
		toastFromLog();
		if (newFloor) fit(true);

		if (S.ride && st.n === S.ride.f) rideEnd();

		if (
			S.myI >= 0 &&
			S.pos &&
			!S.path &&
			!atRock(S.myI) &&
			!(S.want && S.want.i < 0)
		) {
			const sp = digSpot(S.myI);
			if (sp != null && pathTo(cellOfPt(S.pos.x, S.pos.y), sp)) walkTo(sp);
		}
		if (S.me && S.me.fx && S.me.fx.sh) sfxArt();
		if (S.burst && S.burst.length) {
			for (const b of S.burst) burst(b);
			S.burst = null;
		}

		if (S.F && !S.atF) S.atF = Date.now();
		if (!S.pickTip && S.F && newsFresh()) {
			S.pickTip = 1;
			if (S.myI < 0 && !(S.me && S.me.news)) tip(tx().pick);
		}
		newsCheck();
	}
	const newsFresh = () => Date.now() - (S.atF || S.at0) < 15000;

	function newsCheck() {
		if (
			!S ||
			!S.me ||
			!S.me.news ||
			S.newsShown ||
			NEWS_SEEN[C] === newsKey(S.me.news)
		)
			return;

		if (newsFresh()) {
			if (!S.acted) news(S.me.news);
		} else {
			S.newsShown = true;
			NEWS_SEEN[C] = newsKey(S.me.news);
			try {
				X.api("/api/mineSeen", { c: C });
			} catch (e) {}
		}
	}

	function newsHero() {
		if (!S || !S.me || S.me.news || S.newsShown) return;
		let m = null;
		try {
			const h = X.hero();
			m = h && h.mn && h.mn[C];
		} catch (e) {
			m = null;
		}
		if (m && m.news) {
			S.me = { ...S.me, news: m.news };
			newsCheck();
		}
	}

	function burst(b) {
		const W = GX(),
			c = W.cellXY(b.i),
			cell = S.F.cells[b.i],
			col = (CW().RES || {})[cell.r] || "#9a8e80",
			deb = (S.Wd && S.Wd.debris) || ["#8e7f70", "#8e7f70"];

		if (!b.mine) {
			if (!inCam(c.x, c.y, 120)) return;
			if (
				S.heroes.querySelectorAll(":scope > .mn-burst:not(.mn-my)").length >=
				BURST_MAX
			)
				return;
		}
		const el = document.createElement("div");
		el.className = "mn-burst";
		el.style.left = c.x + "px";
		el.style.top = c.y - 40 + "px";
		el.style.zIndex = String(Math.round(c.y) + 5);
		let h = "";
		for (let k = 0; k < 9; k++) {
			const a = (k / 9) * Math.PI * 2 + Math.random() * 0.5,
				d = 40 + Math.random() * 40;
			h += `<i style="--dx:${(Math.cos(a) * d).toFixed(0)}px;--dy:${(Math.sin(a) * d - 30).toFixed(0)}px;--r:${(Math.random() * 360).toFixed(0)}deg;background:${k % 3 ? deb[k % 2] : col}"></i>`;
		}
		const g = b.got,
			mineGot = !!(g && g.q > 0);

		const lootT =
			b.mine && g && g.loot
				? "Сундук: " +
					Object.entries(g.loot)
						.filter(([, v]) => v > 0)
						.map(([k, v]) => gotText(v, k))
						.join(", ")
				: "";
		const sfx = b.mine ? shardFx(cell, g, mineGot, lootT) : "";
		if (sfx) h += sfx;
		else if (lootT) h += `<b class="mn-loot">${esc(lootT)}</b>`;
		else if (b.mine && cell.r && mineGot)
			h += `<b>${esc(gotText(g.q, cell.r))}</b>`;
		else if (b.mine) h += `<b>${esc(tx().broke)}</b>`;
		if (b.mine) el.classList.add("mn-my");
		el.innerHTML = h;
		S.heroes.appendChild(el);
		setTimeout(() => el.remove(), 1500);
		if (sfx)
			el.addEventListener("animationend", (e) => {
				if (e.target.classList && e.target.classList.contains("mn-sfx-p"))
					e.target.remove();
			});
		if (!b.mine) return;
		ding();
		try {
			dugToast(b, cell, g);
		} catch (e) {
			console.error("[шахта] тост добычи", e);
		}
		const other =
			cell.r && g && !mineGot && g.any
				? ` ${resName(cell.r)} досталась другим копавшим (по вкладу) — тебе монеты за работу.`
				: "";
		tip(
			cell.t === "rare"
				? mineGot
					? cell.r === S.st.gem
						? `Самоцвет! ${resName(cell.r)} — такой есть только в шахтах этой природы`
						: `${tx().rare}: ${resName(cell.r)}!`
					: `Жила вскрыта.${other}`
				: cell.t === "chest"
					? lootT
						? `${lootT}. Загляни в журнал — вдруг там ещё и приз`
						: "Клад вскрыт! Загляни в журнал — вдруг там приз"
					: tx().done + (other ? "." + other : ""),
		);
	}

	const SFX_MAX = 12,
		SFX_GEM = new Set([
			"adamant",
			"fire_opal",
			"emerald",
			"amber",
			"sapphire",
			"topaz",
			"malachite",
			"morion",
			"aquamarine",
			"ruby",
			"runestone",
		]),
		SFX_RARE = new Set(["gold", "crystal", "silver", "relic"]);

	const SFX_SVG = {
		gem: '<path class="b" d="M12 1.6 20.6 9 12 22.4 3.4 9Z"/><path class="l" d="M12 1.6 3.4 9h8.6Z"/><path class="d" d="M12 9h8.6L12 22.4Z"/><path class="ln" d="M3.4 9h17.2M12 9v13.4M7.2 9 12 1.6l4.8 7.4"/><path class="sp" d="M19.6 1.4l.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9Z"/>',
		rare: '<path class="b" d="M5.2 8.6 10.4 3.4l7.4 1.6 3.6 6.8-2.8 7.6-8 2.2-6.6-4.8Z"/><path class="d" d="M21.4 11.8l-2.8 7.6-8 2.2 1.8-6.4Z"/><path class="l" d="M10.4 3.4l7.4 1.6-4.2 4.2-6.6-.2Z"/><path class="gl" d="M8.2 11.6q.6-2.6 3-3.4"/><path class="sp" d="M17.6 7.2l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6Z"/>',
		rock: '<path class="b" d="M3.6 13.4 7.4 5.6l8.6-1.8 4.8 7.2-2.4 8.4-9.2 1.4Z"/><path class="l" d="M7.4 5.6l8.6-1.8 4.8 7.2-7.6-1.8Z"/><path class="d" d="M13.2 9.2l7.6 1.8-2.4 8.4-9.2 1.4Z"/>',
	};
	const sfxKind = (r) =>
		SFX_GEM.has(r) || (r && S.st && r === S.st.gem)
			? "gem"
			: SFX_RARE.has(r)
				? "rare"
				: "rock";

	const SA_JS =
		window.LG_CITYV && window.LG_CITYV.sa
			? "/site/shard-art.js?v=" + window.LG_CITYV.sa
			: (
					(document.currentScript && document.currentScript.src) ||
					"/site/mine.js"
				).replace(/mine\.js(\?.*)?$/, "shard-art.js");
	let saLd = 0;
	const sfxArt = () => {
		if (window.LGShardArt) return window.LGShardArt;
		if (!saLd) {
			saLd = 1;
			const sc = document.createElement("script");
			sc.src = SA_JS;
			sc.onerror = () => {
				saLd = 0;
			};
			document.head.appendChild(sc);
		}
		return null;
	};
	const sfxIcon = (r, cls) => {
		const k = sfxKind(r),
			A = sfxArt(),
			own = !!(A && A.KIND && A.KIND[r]),
			col = (CW().RES || {})[r] || "#9a8e80";
		return `<span class="${cls} mn-sfx-${k}" data-r="${esc(r)}"${own ? ' data-art="1"' : ""} style="--c:${col}"><svg viewBox="${own ? A.VB : "0 0 24 24"}" aria-hidden="true">${own ? A.inner(r) : SFX_SVG[k]}</svg></span>`;
	};
	function shardFx(cell, g, mineGot, lootT) {
		if (!(S && S.me && S.me.fx && S.me.fx.sh)) return "";
		const loot =
			lootT && g && g.loot
				? Object.entries(g.loot).filter(([, v]) => v > 0)
				: [];
		if (!loot.length && !(cell.r && mineGot)) return "";
		const res = loot.length ? loot.map(([k, v]) => [k, v]) : [[cell.r, g.q]];

		let room =
				document.visibilityState === "visible" &&
				!(
					window.matchMedia &&
					matchMedia("(prefers-reduced-motion: reduce)").matches
				)
					? SFX_MAX - S.heroes.querySelectorAll(".mn-sfx-p").length
					: 0,
			h = "",
			k = 0;
		const n0 = (q) => (q >= 100 ? 3 : q >= 34 ? 2 : 1);
		for (const [r, q] of res.slice(0, 4))
			for (
				let j = 0, n = loot.length ? Math.min(2, n0(q)) : n0(q);
				j < n && room > 0;
				j++, k++, room--
			) {
				const side = k % 2 ? 1 : -1,
					dx = side * (34 + Math.random() * 34 + (k >> 1) * 14),
					up = -(30 + Math.random() * 26),
					t = 0.9 + Math.random() * 0.3,
					rot = side * (200 + Math.random() * 260);
				h += `<span class="mn-sfx-p" style="--dx:${dx.toFixed(0)}px;--up:${up.toFixed(0)}px;--rot:${rot.toFixed(0)}deg;--t:${t.toFixed(2)}s;--dl:${(k * 0.06).toFixed(2)}s">${sfxIcon(r, "mn-sfx-s")}</span>`;
			}
		const ic = res
			.slice(0, 4)
			.map(([r]) => sfxIcon(r, "mn-sfx-ic"))
			.join("");
		return (
			h +
			(loot.length
				? `<b class="mn-loot mn-sfx-t">${ic}<span>${esc(lootT)}</span></b>`
				: `<b class="mn-sfx-t">${ic}<span>${esc(gotText(g.q, cell.r))}</span></b>`)
		);
	}

	let actx = null;
	function ding() {
		if (!(S && S.me && S.me.fx && S.me.fx.snd)) return;
		try {
			actx = actx || new (window.AudioContext || window.webkitAudioContext)();
			const t = actx.currentTime;
			for (const [f, d] of [
				[880, 0],
				[1320, 0.09],
			]) {
				const o = actx.createOscillator(),
					g = actx.createGain();
				o.type = "triangle";
				o.frequency.value = f;
				g.gain.setValueAtTime(0.0001, t + d);
				g.gain.exponentialRampToValueAtTime(0.18, t + d + 0.01);
				g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.25);
				o.connect(g).connect(actx.destination);
				o.start(t + d);
				o.stop(t + d + 0.3);
			}
		} catch (e) {}
	}

	const NEWS_SEEN = {},
		newsKey = (nw) => `${nw.b || 0}:${nw.at || 0}:${nw.f || 0}`;
	function news(nw) {
		S.newsShown = true;
		const res = resList(nw),
			idle = S.myI < 0;
		const d = document.createElement("div");
		d.className = "mn-news panel";
		d.setAttribute("role", "dialog");
		d.setAttribute("aria-label", "Пока тебя не было");

		d.innerHTML = `<h3 class="h3">Пока тебя не было</h3><ul><li>Камней: <b>${nw.b || 0}</b>${nw.f ? ` · находок: <b>${nw.f}</b>` : ""} · ${buyerOn() ? "оплата" : "заработок"} <b>+${coins(nw.cx != null ? nw.cx : nw.c)}</b></li>${
			res.length
				? `<li>${res
						.slice(0, 4)
						.map(([k, n, p]) => `${esc(resName(k))} <b>${esc(qty(n, p))}</b>`)
						.join(", ")}${res.length > 4 ? "…" : ""}</li>`
				: ""
		}</ul>
      <p class="muted">${esc(idle ? "Герой ждёт - выбери ему камень." : "Герой всё ещё копает.")}</p><div class="mn-btns"><button type="button" class="btn primary sm" data-ok>Понятно</button></div>`;

		const w = document.createElement("div");
		w.className = "mn-news-w";
		w.appendChild(d);
		S.el.appendChild(w);
		w.addEventListener("pointerdown", (e) => {
			if (e.target === w) d.querySelector("[data-ok]").click();
		});
		d.querySelector("[data-ok]").onclick = () => {
			w.remove();
			NEWS_SEEN[C] = newsKey(nw);
			X.api("/api/mineSeen", { c: C });
		};
		try {
			d.querySelector("[data-ok]").focus({ preventScroll: true });
		} catch (e) {}
	}

	function draw() {
		if (!S.F && S.st && S.st.fl && S.st.fl.v3) S.F = floorOf(S.st);

		if (S.F && !S.atF) {
			S.atF = Date.now();
			newsCheck();
		}
		if (V3()) return draw3();
		const W = CW(),
			F = S.F;
		if (!F) return;

		if (S.m3) {
			S.m3.el.remove();
			S.m3 = null;
			S.svg.classList.remove("v3");
			S.view.style.background = "";
			const mm = S.el.querySelector(".mn-mm");
			if (mm) mm.remove();
		}
		const front = new Set(S.st.front || []);
		const lampMan =
			pickOn() ||
			S.st.n >= (S.st.lampFrom || 4) ||
			(S.st.rec || 0) >= (S.st.lampFrom || 4);
		S.dark = S.st.n >= (S.st.darkFrom || 5) && !lampOn();

		const art = art2On() && window.LGMineArt ? window.LGMineArt : null;
		const B = art2On() ? biome() : null;
		const key = [
			S.st.seed,
			S.st.n,
			S.st.dug,
			(S.st.front || []).join("."),
			lampMan ? 1 : 0,
			pickOn() ? 1 : 0,
			S.dark ? 1 : 0,
			S.st.biome,
			B ? 1 : 0,
			art ? 2 : 1,
		].join("|");
		if (key === S.svgKey) {
			bars();
			heroes();
			return;
		}
		S.svgKey = key;
		F.done = S.dug.every((d, i) => d || F.cells[i].t === "wall");

		const BP = art && B && B.palette ? B.palette(S.st) : null;
		const rockPal =
			BP && BP.rock
				? (c, L) =>
						c.t === "wall"
							? BP.wall
								? [BP.wall, art.mix(BP.wall, "#ffffff", 0.18)]
								: null
							: c.t === "hard"
								? BP.hard || BP.rock
								: BP.rock
				: null;
		const Wd = W.build(F, {
			dug: S.dug,
			front,
			prog: {},
			special: F.special ? specialName(F.special) : "",
			lampMan,
			trader: pickOn(),
			bare: !!B,
			art,
			rockPal,
		});
		if (pickOn() && Wd.lampNpc) Wd.lampNpc = { ...Wd.lampNpc, name: SUP };
		S.Wd = Wd;
		S.svg.setAttribute("viewBox", `${Wd.VX0} 0 ${Wd.VW} ${Wd.H}`);
		S.svg.setAttribute("width", Wd.VW);
		S.svg.setAttribute("height", Wd.H);
		S.svg.style.left = Wd.VX0 + "px";
		S.world.style.width = Wd.W + "px";
		S.world.style.height = Wd.H + "px";
		const props = Wd.props.slice().sort((a, b) => a.y - b.y);

		const lbl = [],
			occ = [];

		const npcG = (n, id, seed) => {
			if (!n) return "";
			const nk = 0.8,
				sv = still(
					X.doodle(
						seed,
						n.look || { look: { hat: "none" }, minerHat: true },
						"happy",
						"peace",
					),
				);
			lbl.push(
				`<span class="mn-lbl" data-for="${id}" style="left:${n.x}px;top:${(n.y - 170 * nk - 2).toFixed(0)}px">${esc(n.name)}</span>`,
			);
			occ.push({
				k: id === "buy" ? "npcBuy" : "npcLamp",
				svg: figSvg(n.x, n.y, sv, nk),
				z: Math.round(n.y),
			});
			return `<g data-npc="${id}" class="mn-npc">${figSvg(n.x, n.y, sv, nk)}</g>`;
		};
		let npcSvg =
			npcG(Wd.npc, "buy", "npc:skupshik:" + (S.st.biome || "")) +
			npcG(Wd.lampNpc, "lamp", "npc:fonarshik");

		if (S.dark)
			npcSvg += `<g class="mn-dark"><rect x="${Wd.VX0}" y="0" width="${Wd.VW}" height="${Wd.Y0 + Wd.GRID_H + 10}" fill="#05030a" opacity=".93"/><text x="${Wd.W / 2}" y="${Wd.Y0 + Wd.GRID_H - 140}" text-anchor="middle" font-family="Golos Text, Arial" font-weight="800" font-size="34" fill="#ffe27a">Темно — ничего не видно</text><text x="${Wd.W / 2}" y="${Wd.Y0 + Wd.GRID_H - 96}" text-anchor="middle" font-family="Golos Text, Arial" font-weight="700" font-size="24" fill="#cfc4b0">Надень «Каску шахтёра» (кнопка «Сумка») или купи у ${pickOn() ? "Снабженца" : "Фонарщика"}</text></g>`;

		S.svg.innerHTML =
			GLOW +
			Wd.back +
			props
				.map((p) =>
					p.i != null
						? `<g data-i="${p.i}"${front.has(p.i) ? ' class="open"' : S.F.cells[p.i].t === "wall" ? "" : ' class="far"'}>${p.svg}</g>`
						: p.obj
							? `<g data-obj="${p.obj}" class="mn-obj${OBJ[p.obj] && (p.obj !== "lamp" || Wd.lampNpc) ? " act" : ""}">${p.svg}</g>`
							: p.svg,
				)
				.join("") +
			npcSvg;
		S.labels.innerHTML = lbl.join("") + '<span class="mn-hl" hidden></span>';
		occlude(Wd, props, occ);
		if (B) B.paint(S, Wd);
		else if (window.LGMineBiome) window.LGMineBiome.off(S);
		S.barKey = "";
		bars();
		heroes();
		S.failed = "";
	}

	const tmrTxt = (ms) => {
		const m = Math.max(1, Math.ceil(ms / 60000));
		return m < 60 ? `${m} мин` : `${Math.floor(m / 60)} ч ${m % 60} мин`;
	};
	function tmrDraw() {
		if (!S || !S.st || !V3() || !S.m3 || !S.m3.G) return;
		const host = S.labels.querySelector(".mn-tmrs");
		if (!host) return;
		const G = S.m3.G,
			st = S.st,
			el = Date.now() - (S.stAt || Date.now()),
			list = [],
			L = st.lift || {};
		if (L.st === "up" && st.n >= (st.deep || st.n)) {
			const ms = L.left != null ? L.left - el : (L.at || 0) - Date.now();
			if (ms > 0) {
				const [hx, hy] = G.hall;
				list.push([
					G.liftX || hx + 326,
					hy - 64,
					`Этаж ${(st.deep || st.n) + 1} через ${tmrTxt(ms)}`,
					"lift",
				]);
			}
		}
		for (const d of st.drills || []) {
			if (d[3] !== "build") continue;
			const ms = d[7] - el;
			if (!(ms > 0)) continue;
			const p = G.cellXY(d[2]);
			list.push([
				p.cx,
				p.y - 150 - Math.max(1, d[4]) * 26,
				`Ур. ${d[4] + 1} через ${tmrTxt(ms)}`,
				"drill",
			]);
		}
		const k = list.map((q) => q.join("|")).join(";");
		if (k === S.tmrK) return;
		S.tmrK = k;
		host.innerHTML = list
			.map(
				([x, y, t, c]) =>
					`<span class="mn-lchip mn-tmr mn-tmr-${c}" style="left:${x.toFixed(0)}px;top:${y.toFixed(0)}px">${esc(t)}</span>`,
			)
			.join("");
	}

	function draw3() {
		const L3 = window.LGMine3,
			A = window.LGMineArt,
			F = S.F;
		if (!L3 || !A || !F) return;
		const front = new Set(S.st.front || []);
		S.dark = S.st.n >= (S.st.darkFrom || 5) && !lampOn();

		const deep3 = S.st.deep || S.st.n,
			onDeep = S.st.n >= deep3;

		const Lf = S.st.lift || { st: "dig" },
			lch = !onDeep
				? `этажи 1-${deep3}`
				: Lf.st === "fund"
					? `сбор ${Math.floor(Lf.need ? Math.min(100, (Lf.c / Lf.need) * 100) : 0)}%`
					: Lf.st === "up"
						? "лифт улучшается"
						: "ищем шахту лифта";
		const key = [
			"v3",
			lch,
			(S.st.drills || []).map((d) => d[0] + d[3] + d[4]).join(","),
			S.st.seed,
			S.st.n,
			S.st.dug,
			(S.st.front || []).join("."),
			S.dark ? 1 : 0,
			(S.st.fl.c || []).length,
			pickOn() ? 1 : 0,
			window.LGMineBiome ? 1 : 0,
		].join("|");
		drillMenuFill();
		tmrDraw();
		if (key === S.svgKey) {
			bars();
			heroes();
			mmap();
			return;
		}
		const forced = !S.svgKey;
		S.svgKey = key;

		if (window.LGMineBiome && (S.mnb || S.world.querySelector(".mnb-bg"))) {
			window.LGMineBiome.off(S);
			S.world.querySelectorAll(".mnb-bg").forEach((e) => e.remove());
		}
		if (!S.m3) {
			S.m3 = L3.scene(S);
			S.world.insertBefore(S.m3.el, S.world.firstChild);
		}
		const Wd = S.m3.update(F, {
			dug: S.dug,
			front,
			dark: S.dark,
			lampMan: true,
			trader: pickOn(),
			lift: { ...(S.st.lift || {}), deep: S.st.deep || S.st.n },
		});
		if (Wd.lampNpc)
			Wd.lampNpc = {
				...Wd.lampNpc,
				name: pickOn() ? SUP : "Фонарщик",
				...(pickOn() && A.TRADER_LOOK ? { look: A.TRADER_LOOK } : {}),
			};
		S.Wd = Wd;
		S.svg.setAttribute("viewBox", `0 0 ${Wd.W} ${Wd.H}`);
		S.svg.setAttribute("width", Wd.W);
		S.svg.setAttribute("height", Wd.H);
		S.svg.style.left = "0px";
		S.svg.classList.add("v3");
		S.world.style.width = Wd.W + "px";
		S.world.style.height = Wd.H + "px";
		S.view.style.background = Wd.theme.wallD;

		const hallK = [
			Wd.W,
			Wd.H,
			F.n,
			S.st.seed,
			S.st.biome,
			S.dark ? 1 : 0,
			pickOn() ? 1 : 0,
			lch,
			onDeep ? 1 : 0,
			JSON.stringify(S.st.lift || {}),
			S.st.deep || 0,
			window.LGMineBiome ? 1 : 0,
			window.LGPickArt ? 1 : 0,
			A.TRADER_LOOK ? 1 : 0,
		].join("|");
		if (
			!forced &&
			hallK === S.hallK &&
			S.svg.firstChild &&
			S.heroes.querySelector(".mn-oc")
		) {
			S.barKey = "";
			bars();
			heroes();
			mmap();
			S.failed = "";
			return;
		}
		S.hallK = hallK;
		const lbl = [],
			occ = [];
		const npcG = (n, id, seed) => {
			if (!n) return "";
			const nk = 0.8,
				sv = still(
					X.doodle(
						seed,
						n.look || { look: { hat: "none" }, minerHat: true },
						"happy",
						"peace",
					),
				);
			lbl.push(
				`<span class="mn-lbl" data-for="${id}" style="left:${n.x}px;top:${(n.y - 170 * nk - 2).toFixed(0)}px">${esc(n.name)}</span>`,
			);
			occ.push({
				k: id === "buy" ? "npcBuy" : "npcLamp",
				svg: figSvg(n.x, n.y, sv, nk),
				z: Math.round(n.y),
			});
			return `<g data-npc="${id}" class="mn-npc">${figSvg(n.x, n.y, sv, nk)}</g>`;
		};
		let npcSvg =
			npcG(Wd.npc, "buy", "npc:skupshik:" + (S.st.biome || "")) +
			npcG(Wd.lampNpc, "lamp", "npc:fonarshik");

		if (S.dark) {
			const [hx, hy, hw, hh] = GX().hall;
			npcSvg += `<g class="mn-dark"><path d="M0 0H${Wd.W}V${Wd.H}H0Z M${hx} ${hy}V${hy + hh}H${hx + hw}V${hy}Z" fill="#05030a" fill-rule="evenodd" opacity=".93"/><text x="${hx + hw / 2}" y="${hy - 60}" text-anchor="middle" font-family="Golos Text, Arial" font-weight="800" font-size="30" fill="#ffe7a0">Темно - нужна каска с фонарём</text></g>`;
		}
		const props = Wd.props.slice().sort((a, b) => a.y - b.y);
		S.svg.innerHTML =
			GLOW +
			props
				.map(
					(p) =>
						`<g data-obj="${p.obj}" class="mn-obj${OBJ[p.obj] && (p.obj !== "lamp" || Wd.lampNpc) ? " act" : ""}">${p.svg}</g>`,
				)
				.join("") +
			npcSvg;

		{
			const [hx, hy] = GX().hall;
			if (Lf.st !== "up" || !onDeep)
				lbl.push(
					`<span class="mn-lchip mn-lchip-${esc(onDeep ? Lf.st : "fl")}" style="left:${GX().liftX || hx + 326}px;top:${hy - 64}px">${esc(lch)}</span>`,
				);
		}
		S.labels.innerHTML =
			lbl.join("") +
			'<span class="mn-hl" hidden></span><span class="mn-tmrs"></span>';
		S.tmrK = "";
		tmrDraw();
		occlude(Wd, props, occ);
		S.barKey = "";
		bars();
		heroes();
		mmap();
		S.failed = "";
	}

	function mmap() {
		if (!V3() || !S.m3) return;

		let el = S.el.querySelector(".mn-mm");
		if (!el) {
			el = document.createElement("div");
			el.className = "mn-mm";
			el.setAttribute("aria-label", "Карта этажа");
			(S.el.querySelector(".mn-tl") || S.el).appendChild(el);
		}
		const me = S.pos ? GX().cellAt(S.pos.x, S.pos.y) : null,
			k = [S.svgKey, me].join("|");
		if (el.dataset.k === k) return;
		el.dataset.k = k;
		el.innerHTML = '<div class="mn-mm-t">Карта этажа</div>' + S.m3.minimap(me);
	}

	function occlude(Wd, props, npcs) {
		S.ft = GX().feet({ lamp: !!Wd.lampNpc });
		for (const e of S.heroes.querySelectorAll(".mn-oc")) e.remove();
		const box = (k) => {
			const f = GX().FOOT.find((x) => x.k === k);
			return f
				? [f.s[0] - 60, f.z - 340, f.s[2] - f.s[0] + 120, f.s[3] - f.z + 360]
				: null;
		};
		let h = "";
		for (const o of [
			...props.filter((p) => p.obj).map((p) => ({ k: p.obj, svg: p.svg })),
			...npcs,
		]) {
			const b = box(o.k),
				f = GX().FOOT.find((x) => x.k === o.k);
			if (!b) continue;
			h += `<svg class="mn-oc" data-oc="${o.k}" aria-hidden="true" focusable="false" overflow="visible" width="${b[2]}" height="${b[3]}" viewBox="${b.join(" ")}" style="position:absolute;left:${b[0]}px;top:${b[1]}px;z-index:${o.z || f.z};pointer-events:none;overflow:visible">${o.svg}</svg>`;
		}
		S.heroes.insertAdjacentHTML("afterbegin", h);
	}

	const OBJ = {
		lift: () => (V3() ? "Лифт - этажи и выход в город" : "В город - подъёмник"),
		buyer: "Скупщик Гром - сдать руду",
		board: "Поручения скупщика",
		lamp: () =>
			pickOn()
				? SUP + " - кирки, рудная сумка, каска"
				: "Фонарщик - каска шахтёра",
		up: () => upText(),
	};
	const objText = (k) =>
		typeof OBJ[k] === "function" ? OBJ[k]() : OBJ[k] || "";

	function upText() {
		if (!S || !S.st || !S.F) return "";
		const n = S.st.n,
			left = (S.dug || []).filter(
				(d, i) => !d && S.F.cells[i] && S.F.cells[i].t !== "wall",
			).length;
		const from = n > 1 ? `Отсюда спустились с этажа ${n - 1}. ` : "";
		return left
			? `${from}Спуск на этаж ${n + 1} откроется, когда выкопают все камни этажа (осталось ${left})`
			: `${from}Этаж расчищен - спуск на этаж ${n + 1} начнётся сам`;
	}
	const NPC_OBJ = { buy: "buyer", lamp: "lamp" };

	const GLOW =
		'<defs><filter id="mnGlow" x="-12%" y="-12%" width="124%" height="124%"><feMorphology in="SourceAlpha" operator="dilate" radius="4" result="d"/><feFlood flood-color="#ffe27a"/><feComposite in2="d" operator="in" result="o"/><feGaussianBlur in="o" stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="o"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>';

	const LAMP_ID = "miner_helmet";
	const heroItems = () => {
		try {
			const h = X.hero();
			return (h && h.items) || [];
		} catch (e) {
			return [];
		}
	};

	const heroKnown = () => {
		try {
			const h = X.hero();
			return !!(h && Array.isArray(h.items) && h.items.length);
		} catch (e) {
			return false;
		}
	};
	const lampOn = () =>
		heroKnown()
			? heroItems().some((it) => it && it.id === LAMP_ID && it.on)
			: !!(S.me && S.me.lamp);
	const lampHave = () => heroItems().find((it) => it.id === LAMP_ID) || null;
	const specialName = (k) => tx().sp[k] || "";
	const still = (svg) =>
		String(svg || "").replace(
			/<(animate|animateTransform|animateMotion|set)\b[^>]*?(\/>|>[\s\S]*?<\/\1>)/g,
			"",
		);

	const figSvg = (x, y, svg, k) =>
		`<g transform="translate(${x - 60 * k} ${y - 170 * k + 6}) scale(${k})"><rect x="-20" y="-40" width="160" height="230" fill="transparent"/>${String(svg).replace(/<svg /, '<svg width="120" height="170" style="width:120px;height:170px" overflow="visible" ')}</g>`;

	setInterval(() => {
		if (S && !document.hidden) tmrDraw();
	}, 30000);
	const leftTxt = (ms) => {
		const m = Math.ceil(ms / 60000);
		return ms <= 0
			? "почти"
			: m < 60
				? `ещё ${m} мин`
				: `ещё ${Math.floor(m / 60)} ч ${m % 60} мин`;
	};

	const GONE_MS = 165000;
	const LOOK_MS = 60000;
	setInterval(() => {
		if (!S) return;
		const old = Date.now() - GONE_MS;
		let n = 0;
		for (const [l, o] of S.others)
			if ((o.t0 || 0) - (o.dt || 0) < old) {
				S.others.delete(l);
				n++;
			}
		if (n && S.st) heroes();
	}, 20000);

	function meNow() {
		const D = window.LGMineDig;
		if (!S || !S.me || !S.me.dr || !D) return false;
		const m = D.view(S.me, srvNow());
		S.me = m;
		return true;
	}
	function meTick() {
		if (!S || !S.st || document.hidden) return;
		const U = window.LGSiteUi;
		try {
			if (U && U.bg && U.bg.state() === "hidden") return;
		} catch (e) {}

		try {
			const h = X.hero(),
				m = h && h.mn && h.mn[C];
			if (m && m.dr && (!S.me || !S.me.dr || +m.dr.t > +S.me.dr.t))
				S.me = S.me && S.me.qq && !m.qq ? { ...m, qq: S.me.qq } : m;
		} catch (e) {}
		if (meNow()) panel();
	}
	setInterval(() => {
		if (!S || document.hidden) return;
		S.el
			.querySelectorAll(".mn-bar em[data-left], [data-mn-left][data-left]")
			.forEach((e) => {
				const t = leftTxt(+e.dataset.left - Date.now());
				if (e.textContent !== t) e.textContent = t;
			});
		if (S.digL && S.digL.length && window.LGMineArt) {
			const t = (srvNow() - (S.st.at || srvNow())) / 60000;
			for (const b of S.digL)
				b.p = 1 - Math.max(0, b.l - b.rate * Math.max(0, t)) / b.w;
			window.LGMineArt.cracks(S.bars, S.digL);
		}
	}, 20000);

	const hx2 = (c) => [1, 3, 5].map((k) => parseInt(c.slice(k, k + 2), 16));
	const mixC = (a, b, k) => {
		const A = hx2(a),
			B = hx2(b);
		return (
			"#" +
			A.map((v, j) =>
				Math.round(v + (B[j] - v) * k)
					.toString(16)
					.padStart(2, "0"),
			).join("")
		);
	};
	const hpCol = (r) =>
		r > 0.5
			? mixC("#ffd23f", "#5fd35f", (r - 0.5) * 2)
			: mixC("#ff4d3d", "#ffd23f", Math.max(0, r) * 2);

	function hpGo(el, rem, eta) {
		if (!(eta > 0 && rem > 0)) return;
		const D = eta / rem;

		void getComputedStyle(el).transform;
		el.style.transition = `transform ${eta.toFixed(1)}s linear`;
		el.style.transform = "translateX(-100%)";

		el.style.setProperty("--hpD", D.toFixed(1) + "s");
		el.style.setProperty("--hpL", (-(D - eta)).toFixed(1) + "s");
		el.style.backgroundColor = "#ff4d3d";
		el.classList.add("hp");
	}

	function nowDraw() {
		const el = S.el.querySelector(".mn-nowl");
		if (!el) return;
		const i = S.myI,
			on = i >= 0 && !!S.F && !!S.F.cells[i] && !S.dark;
		exDraw();
		if (!on) {
			S.nowA = null;
			if (!el.hidden) el.hidden = true;
			return;
		}
		const W = GX(),
			c = W.cellXY(i),
			cell = S.F.cells[i],
			sc = 1.0 + Math.max(0, (cell.lv || S.F.n) - S.F.n) * 0.1;
		S.nowA = { x: c.x, y: c.y - 70 * sc };
		const t = blockTitle(cell),
			T = t[0].toUpperCase() + t.slice(1),
			nt = el.querySelector("[data-mn-nt]");
		if (nt.textContent !== T) nt.textContent = T;
		const b = (S.st.bl || {})[i],
			lt = el.querySelector("[data-mn-left]");
		if (b && b[2] > 0) {
			const eta =
					Math.max(
						0,
						b[0] / b[2] - (srvNow() - (S.st.at || srvNow())) / 60000,
					) * 60000,
				v = String(Date.now() + eta);
			lt.dataset.left = v;
			const tx2 = leftTxt(eta);
			if (lt.textContent !== tx2) lt.textContent = tx2;
		} else if (lt.textContent) {
			lt.textContent = "";
			delete lt.dataset.left;
		}
		nowEx(el, i);
		if (el.hidden) el.hidden = false;
		S.nowWH = null;
		nowPlace();
	}
	function nowPlace() {
		const el = S.el.querySelector(".mn-nowl"),
			a = S.nowA;
		if (!el || !a || el.hidden) return;

		if (!S.nowWH) S.nowWH = [el.offsetWidth, el.offsetHeight];
		const [w, h] = S.nowWH,
			vw = vSize().w,
			x = Math.max(4, Math.min(vw - w - 4, S.tx + a.x * S.z - w / 2)),
			y = Math.max(4, S.ty + a.y * S.z - 6 - h);
		el.style.transform = `translate(${x.toFixed(0)}px, ${y.toFixed(0)}px)`;
	}
	async function stopDig() {
		if (S.myI < 0 || S.stopping) return;
		S.stopping = 1;
		S.left = { i: S.myI, at: Date.now() };
		S.want = { i: -1, at: Date.now() };
		S.qq = [];
		const r = await X.api("/api/mineStop", { c: C, sid: S.sid });
		if (!S) return;
		S.stopping = 0;
		if (r && r.ok) {
			S.myI = -1;
			S.barKey = "";
			bars();
			heroes();
			panel();
			tip(tx().stopTip);
		} else {
			S.want = null;
			if (r && r.other) otherTab(true);
			tip((r && r.error) || "Не получилось");
		}
	}
	function bars() {
		const W = GX(),
			st = S.st,
			now = srvNow();
		const h = "";
		const myQ = (S.me && S.me.qq) || S.qq || [];
		const m3 = V3() && S.m3 ? S.m3 : null,
			inV = (i) => !m3 || i === S.myI || m3.cellIn(i);
		const key = JSON.stringify([
			st.bl,
			S.myI,
			myQ,
			S.dark,
			m3 ? m3.viewKey() : "",
		]);
		if (key === S.barKey) return;
		S.barKey = key;

		const want = [];

		myQ.forEach((i, k) => {
			const c = W.cellXY(i),
				x = c.x - 14,
				y = c.y - 70;
			want.push([
				"q" + k,
				`${x}|${y}|${k}`,
				() =>
					`<div class="mn-qn" style="left:${x}px;top:${y}px">${k + 1}</div>`,
			]);
		});
		for (const [k, b] of Object.entries(st.bl || {})) {
			const i = +k,
				[left, w, rate, n] = b;
			if (!w || (S.dark && i !== S.myI) || !inV(i)) continue;
			const age = (now - (st.at || now)) / 60000,
				l2 = Math.max(0, left - rate * Math.max(0, age)),
				p = Math.max(0, Math.min(1, 1 - l2 / w)),
				eta = rate > 0 ? (l2 / rate) * 60 : 0;
			const c = W.cellXY(i),
				cell = S.F.cells[i],
				sc = 1.0 + Math.max(0, (cell.lv || S.F.n) - S.F.n) * 0.1,
				me = i === S.myI;

			const sig = [
				c.x,
				(c.y - 70 * sc).toFixed(1),
				me ? 1 : 0,
				n > 4 ? n - 4 : 0,
				rate,
				rate > 0 ? Math.round((now + eta * 1000) / 2000) : (1 - p).toFixed(3),
			].join("|");

			want.push([
				"b" + i,
				sig,
				() =>
					`<div class="mn-bar${me ? " me" : ""}" style="left:${c.x - 44}px;top:${c.y - 70 * sc}px"><s class="mn-hpt"><i style="width:${((1 - p) * 100).toFixed(1)}%;background-color:${hpCol(1 - p)}" data-eta="${eta.toFixed(1)}" data-rem="${(1 - p).toFixed(4)}"></i></s>${n > 4 ? `<b>+${n - 4}</b>` : ""}</div>`,
			]);
		}

		const A = S.Wd && S.Wd.rk && !S.dark ? window.LGMineArt : null;
		S.digL = [];
		const rkWant = [];
		if (A) {
			for (const [k, b] of Object.entries(st.bl || {})) {
				const i = +k,
					[left, w, rate, n] = b;
				if (!w || !S.Wd.rk[i] || !inV(i)) continue;
				const l2 = Math.max(
						0,
						left - rate * Math.max(0, (now - (st.at || now)) / 60000),
					),
					cell = S.F.cells[i],
					c = W.cellXY(i);
				S.digL.push({
					i,
					x: c.x,
					y: c.y,
					s:
						1.0 +
						Math.max(0, (cell.lv || S.F.n) - S.F.n) * 0.1 +
						(cell.t === "hard" ? 0.05 : 0),
					p: 1 - l2 / w,
					n: n || ((st.dg || {})[i] || []).length,
					w,
					l: left,
					rate,
				});
			}

			for (const b of S.digL)
				rkWant.push(["r" + b.i, [b.x, b.y, b.s, b.n > 0 ? 1 : 0].join("|"), b]);
		}
		barsSync(A, rkWant, want);
		const dk = S.digL.map((b) => b.i).join(",");
		if (dk !== S.dgK || S.barReset) {
			S.dgK = dk;
			S.world
				.querySelectorAll("[data-i].dg")
				.forEach((g) => g.classList.remove("dg"));
			for (const b of S.digL) {
				const g = S.world.querySelector(`[data-i="${b.i}"]`);
				if (g) g.classList.add("dg");
			}
		}
		S.barReset = false;
		nowDraw();
	}

	function barsSync(A, rkWant, want) {
		const host = S.bars,
			have = new Map(),
			reset = !!S.barReset;
		for (const el of [...host.childNodes]) {
			if (el.nodeType === 1 && el.classList.contains("mna-defs")) continue;
			if (reset || !el._bk) {
				el.remove();
				continue;
			}
			have.set(el._bk, el);
		}
		const parse = (h) => {
			const t = document.createElement("template");
			t.innerHTML = h;
			return t.content;
		};
		const stOf = (el) => {
			const g = el.querySelector(".mn-crk");
			return g ? g.dataset.st : "";
		};
		const out = [],
			fresh = [];
		for (const [k, sig, b] of rkWant) {
			const old = have.get(k),
				body = S.Wd.rk[b.i];
			if (
				old &&
				old._bs === sig &&
				old._body === body &&
				(!A.stageOf || stOf(old) === String(A.stageOf(b.p)))
			) {
				out.push(old);
				have.delete(k);
				continue;
			}
			const frag = parse(A.digging(S.Wd.rk, [b]));

			for (const d of [...frag.querySelectorAll(".mna-defs")]) {
				let keep = host.querySelector(":scope > .mna-defs");
				if (!keep) {
					keep = d;
					host.insertBefore(d, host.firstChild);
					continue;
				}
				const kd = keep.querySelector("defs") || keep;
				for (const s of [...(d.querySelector("defs") || d).children])
					if (!s.id || !kd.querySelector(`[id="${CSS.escape(s.id)}"]`))
						kd.appendChild(s);
				d.remove();
			}
			const el = frag.firstElementChild;
			if (!el) continue;
			el._bk = k;
			el._bs = sig;
			el._body = body;
			out.push(el);
		}
		for (const [k, sig, mk] of want) {
			const old = have.get(k);
			if (old && old._bs === sig) {
				out.push(old);
				have.delete(k);
				continue;
			}
			const el = parse(mk()).firstElementChild;
			el._bk = k;
			el._bs = sig;
			out.push(el);
			if (el.classList.contains("mn-bar")) fresh.push(el);
		}
		for (const el of have.values()) el.remove();

		let at = host.firstElementChild;
		while (at && at.classList.contains("mna-defs")) at = at.nextElementSibling;
		for (const el of out) {
			if (el === at) {
				at = at.nextElementSibling;
				continue;
			}
			host.insertBefore(el, at);
		}
		if (fresh.length)
			requestAnimationFrame(() => {
				if (!S) return;
				for (const b of fresh) {
					const el = b.querySelector("i[data-eta]");
					if (el && el.isConnected) hpGo(el, +el.dataset.rem, +el.dataset.eta);
				}
			});
	}

	const heroOf = (v) => ({
		look: (v && v.lk) || null,
		gear: (v && v.g) || {},
		ghost: !!(v && v.gh),
		minerHat: !!(v && v.g && v.g.h === "miner"),
	});
	const lookKey = (v) => {
		try {
			return JSON.stringify([v && v.lk, v && v.g, v && v.gh, v && v.pk]);
		} catch (e) {
			return "";
		}
	};
	const hashL = (s) => {
		let h = 0;
		for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
		return h;
	};
	function heroEl(login, v, cls) {
		const d = document.createElement("div");
		d.className = "mn-h " + (cls || "");
		d.dataset.l = login;
		const dig = cls && cls.includes("dig") && login !== X.login(),
			mine = login === X.login();

		const DA =
				art2On() && window.LGMineArt && window.LGMineArt.digFig
					? window.LGMineArt
					: null,
			df =
				DA && (dig || mine)
					? DA.digFig(login, v, {
							minerHat: heroOf(v).minerHat,
							...(v && v.pk != null ? { pick: v.pk } : {}),
						})
					: "";
		const fig =
			df && dig
				? ""
				: X.fig
					? X.fig(login, v, { minerHat: heroOf(v).minerHat })
					: still(X.doodle(login, heroOf(v), "walk", "peace"));
		d.innerHTML = `<div class="mn-fig${df ? " has-d" : ""}">${fig}${df}</div>${dig || mine ? "" : `<span class="mn-nm2">${esc(login)}</span>`}`;
		d.dataset.lk = lookKey(v);
		const hs = hashL(login);
		d.style.setProperty("--dd", (1.05 + (hs % 41) / 100).toFixed(2) + "s");
		d.style.setProperty("--dl", (-((hs >>> 6) % 140) / 100).toFixed(2) + "s");
		d.style.setProperty("--nmy", String(hashL(login) % 3));
		if (dig && login[0] !== "~") d.title = login;
		return d;
	}

	function place(d, x, y) {
		const tr = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
		d._x = x;
		d._y = y;
		if (d._tr !== tr) {
			d._tr = tr;
			d.style.transform = tr;
		}
		if (!(d._zTo > Date.now())) {
			const z = String(Math.round(y));
			if (d.style.zIndex !== z) d.style.zIndex = z;
		}
	}

	const HERO_KEEP = new Set(["mn-off", "nb"]);
	function heroCls(d, cls) {
		const want = "mn-h " + cls,
			keep =
				d.dataset.k === "me" || !/(^| )dig( |$)/.test(cls)
					? []
					: [...d.classList].filter((c) => HERO_KEEP.has(c)),
			to = keep.length ? want + " " + keep.join(" ") : want;
		if (d.className !== to) {
			d.className = to;

			if (!/(^| )dig( |$)/.test(cls)) {
				const f = d.querySelector(".mn-fig");
				if (f && f.style.translate) f.style.translate = "";
			}
		}
	}

	function meNm() {
		if (!S || !S.pos) return;
		const nm = S.heroes.querySelector(".mn-menm");
		if (!nm) return;
		const d = S.heroes.querySelector('[data-k="me"]'),
			f = d && d.classList.contains("dig") ? d.querySelector(".mn-fig") : null;
		const m =
				f &&
				/^\s*(-?[\d.]+)px(?:\s+(-?[\d.]+)px)?/.exec(f.style.translate || ""),
			ox = m ? +m[1] : 0,
			oy = m && m[2] ? +m[2] : 0;
		const tr = `translate(${(S.pos.x + ox).toFixed(1)}px, ${(S.pos.y - 112 + oy).toFixed(1)}px) translateX(-50%)`;
		if (nm._tr !== tr) {
			nm._tr = tr;
			nm.style.transform = tr;
		}
	}

	const walkPt = (p, stop = true) => MW().walkPt(S.dug, p, stop, ft());

	function digAt(d, i) {
		const v = i >= 0 ? String(i) : "";
		if ((d.dataset.ri || "") !== v) {
			if (v) d.dataset.ri = v;
			else delete d.dataset.ri;
		}
	}
	function heroes() {
		const st = S.st,
			me = X.login(),
			have = new Map();
		for (const d of S.heroes.children)
			if (d.dataset.k) have.set(d.dataset.k, d);
		const want = new Set();
		const put = (k, login, v, cls, x, y) => {
			want.add(k);
			let d = have.get(k);
			if (d && d.dataset.lk !== lookKey(v)) {
				d.remove();
				d = null;
			}
			if (!d) {
				d = heroEl(login, v, cls);
				d.dataset.k = k;
				S.heroes.appendChild(d);
			}
			heroCls(d, cls);
			place(d, x, y);
			return d;
		};
		const vOf = (l) => {
			const o = S.others.get(l);
			return (o && o.v) || S.looks.get(l) || null;
		};

		const showOthers = !S.hide && !S.dark;

		if (showOthers)
			for (const [k, ls] of Object.entries(st.dg || {})) {
				const i = +k,
					sp = digSpot(i);
				if (sp == null) continue;
				const c = centerOf(sp),
					r = GX().cellXY(i),
					dx = r.x - c.x;
				const OFF = [
					[-24, 0],
					[24, 4],
					[-8, 22],
					[14, -16],
				];
				const up = Math.abs(dx) < 20 && r.y < c.y;
				ls.forEach((l, j) => {
					if (l === me) return;
					const [ox, oy] = OFF[j % 4];
					digAt(
						put(
							"d:" + l,
							l,
							vOf(l),
							"dig" + (dx < 0 ? " fl" : "") + (up ? " up" : ""),
							c.x + ox + (dx ? Math.sign(dx) * 18 : 0),
							c.y + oy - 10,
						),
						i,
					);
				});
			}

		const digging = new Set(Object.values(st.dg || {}).flat());

		if (showOthers)
			for (const [l, o] of S.others) {
				if (digging.has(l) || l === me) continue;
				const p = walkPt({ x: o.tx, y: o.ty });
				const d = put(
					"w:" + l,
					l,
					o.v,
					"walk" + (o.tx < o.x - 2 ? " fl" : ""),
					p.x,
					p.y,
				);
				if (d.dataset.mv !== String(o.t0)) {
					d.dataset.mv = String(o.t0);
					walkAnim(d, o);
				}
			}

		if (S.pos) {
			const digI = S.myI >= 0 && !S.path && atRock(S.myI) ? S.myI : -1,
				nx = S.path && S.path.length ? S.path[0].x : null;
			const d = put(
				"me",
				me,
				myView(),
				"me" + (digI >= 0 ? " dig" : ""),
				S.pos.x,
				S.pos.y,
			);
			digAt(d, digI);
			if (digI >= 0) {
				const r = GX().cellXY(digI);
				d.classList.toggle("fl", r.x < S.pos.x - 4);
				d.classList.toggle("up", Math.abs(r.x - S.pos.x) < 30 && r.y < S.pos.y);
			} else if (nx != null) d.classList.toggle("fl", nx < S.pos.x - 2);

			let nm = S.heroes.querySelector(".mn-menm");
			if (!nm) {
				nm = document.createElement("span");
				nm.className = "mn-menm";
				nm.textContent = "Ты";
				S.heroes.appendChild(nm);
			}
		}
		for (const [k, d] of have) if (!want.has(k)) d.remove();
		cullHeroes();
		if (art2On() && window.LGMineArt && window.LGMineArt.digSync)
			window.LGMineArt.digSync(S.heroes, S.bars);
		meNm();
		mmap();
	}

	const CULL = 320;

	const BURST_MAX = 10;
	function inCam(x, y, m) {
		if (!S || !S.z || !S.view) return true;
		const v = vSize(),
			x0 = -S.tx / S.z - m,
			y0 = -S.ty / S.z - m;
		return (
			x >= x0 &&
			y >= y0 &&
			x <= x0 + v.w / S.z + 2 * m &&
			y <= y0 + v.h / S.z + 2 * m
		);
	}
	function cullHeroes() {
		if (!S || !S.heroes || !S.z) return 0;
		const v = vSize(),
			x0 = -S.tx / S.z - CULL,
			y0 = -S.ty / S.z - CULL,
			x1 = x0 + v.w / S.z + 2 * CULL,
			y1 = y0 + v.h / S.z + 2 * CULL;
		let shown = 0;
		for (const d of S.heroes.children) {
			if (d._x == null || !d.classList.contains("dig") || d.dataset.k === "me")
				continue;
			const off = d._x < x0 || d._x > x1 || d._y < y0 || d._y > y1;
			if (off !== d.classList.contains("mn-off")) {
				d.classList.toggle("mn-off", off);
				if (!off) {
					shown++;
					d._vis = (d._vis || 0) + 1;
				}
			}
		}
		return shown;
	}

	function vSize(fresh) {
		if (fresh || !S.vsz)
			S.vsz = { w: S.view.clientWidth, h: S.view.clientHeight };
		if (!S.viewRo && window.ResizeObserver) {
			S.viewRo = new ResizeObserver(() => {
				if (S) S.vsz = null;
			});
			S.viewRo.observe(S.view);
		}
		return S.vsz;
	}

	function atRock(i) {
		if (!S.pos || i < 0 || S.dug[i]) return false;
		const c = GX().cellXY(i);
		return Math.hypot(S.pos.x - c.cx, S.pos.y - c.cy) <= MW().REACH;
	}

	const myView = () => {
		try {
			const h = X.hero();
			if (!h) return null;
			const cur =
				h.wardrobe && h.wardrobe.cur && Object.keys(h.wardrobe.cur).length
					? h.wardrobe.cur
					: h.look;
			return {
				lk: cur || null,
				g: { ...(h.gear || {}), ...(lampOn() ? { h: "miner" } : {}) },
				gh: h.ghost ? 1 : 0,
				...(pickOn() && S.me && S.me.pkx ? { pk: S.me.pkx.lv } : {}),
			};
		} catch (e) {
			return null;
		}
	};
	function walkAnim(d, o) {
		if (d._a) {
			try {
				d._a.cancel();
			} catch (e) {}
			d._a = null;
		}
		const el = Date.now() - o.t0 + (o.dt || 0);
		if (!(el < o.dur) || !d.animate) return;
		const from = walkPt({ x: o.x, y: o.y }, false),
			to = walkPt({ x: o.tx, y: o.ty }),
			a = cellOfPt(from.x, from.y),
			b = cellOfPt(to.x, to.y);
		let pts = [from];
		const pth = a >= 0 && b >= 0 && a !== b ? pathTo(a, b) : null;
		if (pth) for (const i of pth.slice(1, -1)) pts.push(centerOf(i));
		pts.push(to);
		pts = way(pts);
		const L = [0];
		for (let k = 1; k < pts.length; k++)
			L.push(
				L[k - 1] + Math.hypot(pts[k].x - pts[k - 1].x, pts[k].y - pts[k - 1].y),
			);
		const tot = L[L.length - 1];
		if (!tot) return;
		const dur = Math.max(o.dur, (tot / SPEED) * 1000);
		try {
			d._a = d.animate(
				pts.map((q, k) => ({
					transform: `translate(${q.x.toFixed(1)}px, ${q.y.toFixed(1)}px)`,
					offset: L[k] / tot,
				})),
				{ duration: dur, easing: "linear" },
			);
			d._a.currentTime = Math.min(el, dur - 1);
		} catch (e) {
			d._a = null;
		}
		zSteps(d, pts, L, tot, dur, el);
	}

	function zSteps(d, pts, L, tot, dur, el) {
		for (const t of d._zt || []) clearTimeout(t);
		d._zt = [];
		const ev = [];
		for (let k = 1; k < pts.length; k++) {
			const a = pts[k - 1],
				b = pts[k];
			if (a.y === b.y) continue;
			for (const f of ft()) {
				const u = (f.z - a.y) / (b.y - a.y);
				if (u > 0 && u < 1)
					ev.push([
						((L[k - 1] + u * (L[k] - L[k - 1])) / tot) * dur,
						b.y > a.y ? f.z + 1 : f.z - 1,
					]);
			}
		}
		ev.sort((p, q) => p[0] - q[0]);
		ev.push([dur, Math.round(pts[pts.length - 1].y)]);
		let z = Math.round(pts[0].y);
		for (const [t, zz] of ev) {
			if (t <= el) z = zz;
			else
				d._zt.push(
					setTimeout(() => {
						d.style.zIndex = String(zz);
					}, t - el),
				);
		}
		d._zTo = Date.now() + Math.max(0, dur - el);
		d.style.zIndex = String(z);
	}
	function posOf(o) {
		const t = Math.min(
			1,
			(Date.now() - o.t0 + (o.dt || 0)) / Math.max(1, o.dur),
		);
		return { x: o.x + (o.tx - o.x) * t, y: o.y + (o.ty - o.y) * t };
	}
	function presence(d, snap) {
		if (!d) return;
		if (snap) S.others.clear();
		for (const a of d.a || [])
			S.others.set(a.l, {
				v: { lk: a.lk, g: a.g, gh: a.gh },
				lk: a.lk,
				x: a.x,
				y: a.y,
				tx: a.tx,
				ty: a.ty,
				t0: Date.now(),
				dt: a.dt || 0,
				dur: (Math.hypot(a.tx - a.x, a.ty - a.y) / SPEED) * 1000,
			});
		for (const [l, x, y, tx, ty, dt] of d.m || []) {
			const o = S.others.get(l) || {};
			S.others.set(l, {
				...o,
				x,
				y,
				tx,
				ty,
				t0: Date.now(),
				dt: dt || 0,
				dur: (Math.hypot(tx - x, ty - y) / SPEED) * 1000,
			});
		}

		for (const [l, v] of d.u || []) {
			const o = S.others.get(l);
			if (o && v)
				S.others.set(l, { ...o, v: { lk: v.lk, g: v.g, gh: v.gh }, lk: v.lk });
		}
		for (const l of d.g || []) S.others.delete(l);
		if (d.n != null && S.nOthers !== d.n) {
			S.nOthers = d.n;
			try {
				cnt();
			} catch (e) {
				console.error("[шахта] счётчик", e);
			}
		}
		if (S.st) {
			try {
				heroes();
			} catch (e) {
				recover(e, heroes);
			}
			anim();
		}
	}

	function walkTo(cell, then, pt) {
		const from = cellOfPt(S.pos.x, S.pos.y),
			p = pathTo(from, cell);
		if (!p) {
			tip("Туда не пройти — сначала расчисти путь");
			return false;
		}
		const pts = [S.pos, ...p.slice(1).map(centerOf)];
		if (pt) pts.push(pt);
		S.path = pts.length > 1 ? way(pts).slice(1) : [];
		S.then = then || null;
		const last = S.path.length ? S.path[S.path.length - 1] : S.pos;
		npcGo(last);
		try {
			X.api("/api/mine/go" + q(), {
				x: last.x,
				y: last.y,
				fx: S.pos.x,
				fy: S.pos.y,
			});
		} catch (e) {}
		if (!S.path.length) {
			S.path = null;
			if (then) then();
			return true;
		}
		heroes();
		anim();
		return true;
	}

	const KW_D = {
		KeyW: [0, -1],
		ArrowUp: [0, -1],
		KeyS: [0, 1],
		ArrowDown: [0, 1],
		KeyA: [-1, 0],
		ArrowLeft: [-1, 0],
		KeyD: [1, 0],
		ArrowRight: [1, 0],
	};

	const KW_TAP = 36,
		KW_GO = 800,
		KW_STOP = 750;

	const KW = {
		keys: new Map(),
		tap: new Map(),
		bound: false,
		raf: 0,
		last: 0,
		on: false,
		sent: null,
		at: 0,
		t: 0,
		side: 0,
	};
	const kwOk = () =>
		!!(S && S.st && S.pos && X.hero && X.hero() && X.hero().kw && !S.dark);
	const kwTyping = (t) =>
		!!(
			t &&
			t.closest &&
			t.closest('input, textarea, select, [contenteditable="true"]')
		);
	const kwBusy = () =>
		!!(
			S &&
			(S.el.querySelector(".mn-inv2-w:not([hidden])") ||
				S.npcOpen ||
				S.lm ||
				document.querySelector(".mn-board-w, .lgi-qty, dialog[open]"))
		);

	function kwDirs() {
		const ks = [
			...KW.keys.keys(),
			...[...KW.tap.keys()].filter((k) => !KW.keys.has(k)),
		];
		let dx = 0,
			dy = 0;
		for (const k of ks) {
			const d = KW_D[k];
			if (d) {
				dx += d[0];
				dy += d[1];
			}
		}
		if (!dx && !dy) return null;
		const out = [];
		for (let i = ks.length - 1; i >= 0; i--) {
			const d = KW_D[ks[i]];
			if (!d) continue;
			const hor = !!d[0],
				sg = d[0] || d[1];
			if (
				(hor ? Math.sign(dx) : Math.sign(dy)) === sg &&
				!out.some((o) => o.hor === hor)
			)
				out.push({ hor, sg });
		}
		return out.length ? out : null;
	}
	const kwFree = (x, y) => {
		const c = cellOfPt(x, y);
		if (c < 0 || !walkable(c)) return false;
		if (!inZone(c)) {
			const L = centerOf(c);
			return Math.abs(x - L.x) < 1.5 || Math.abs(y - L.y) < 1.5;
		}
		const f = freePt({ x, y });
		return Math.hypot(f.x - x, f.y - y) < 1;
	};

	function kwAxis(o, len) {
		const W = GX(),
			cw = W.CW || 128,
			rh = W.RH || 128,
			x0 = S.pos.x,
			y0 = S.pos.y,
			c = cellOfPt(x0, y0);
		if (c < 0) return 0;
		let x = x0,
			y = y0,
			left = len;
		if (inZone(c)) {
			const nx = x + (o.hor ? o.sg * left : 0),
				ny = y + (o.hor ? 0 : o.sg * left);
			if (kwFree(nx, ny)) {
				S.pos = { x: nx, y: ny };
				return left;
			}

			const k = left * 0.7;
			for (const sd of KW.side ? [KW.side, -KW.side] : [1, -1]) {
				const px = x + (o.hor ? o.sg * k : sd * k),
					py = y + (o.hor ? sd * k : o.sg * k);
				if (kwFree(px, py)) {
					KW.side = sd;
					S.pos = { x: px, y: py };
					return left;
				}
			}
			const ahead = cellOfPt(
				x + (o.hor ? (o.sg * cw) / 2 : 0),
				y + (o.hor ? 0 : (o.sg * rh) / 2),
			);
			if (ahead >= 0 && walkable(ahead) && !inZone(ahead)) {
				const L = centerOf(ahead),
					off = o.hor ? L.y - y : L.x - x,
					m = Math.min(Math.abs(off), left);
				const px = o.hor ? x : x + Math.sign(off) * m,
					py = o.hor ? y + Math.sign(off) * m : y;
				if (m > 0.01 && kwFree(px, py)) {
					S.pos = { x: px, y: py };
					return m;
				}
			}
			return 0;
		}

		const L = centerOf(c),
			at = o.hor ? x : y,
			mid = o.hor ? L.x : L.y;
		const nb = o.hor
				? cellOfPt(L.x + o.sg * cw, L.y)
				: cellOfPt(L.x, L.y + o.sg * rh),
			open = nb >= 0 && walkable(nb);
		if (!open && (o.sg > 0 ? at >= mid - 0.01 : at <= mid + 0.01)) return 0;
		const off = o.hor ? L.y - y : L.x - x;
		if (Math.abs(off) > 0.01) {
			const m = Math.min(Math.abs(off), left);
			if (o.hor) y += Math.sign(off) * m;
			else x += Math.sign(off) * m;
			left -= m;
		}
		let to = at + o.sg * left;
		if (!open) to = o.sg > 0 ? Math.min(to, mid) : Math.max(to, mid);
		if (o.hor) x = to;
		else y = to;
		const c2 = cellOfPt(x, y);
		if (c2 < 0 || !walkable(c2) || (inZone(c2) && !kwFree(x, y))) return 0;
		S.pos = { x, y };
		return Math.hypot(x - x0, y - y0);
	}

	function kwCam() {
		const v = vSize();
		if (!v || !v.w || !S.z) return;
		const sx = S.tx + S.pos.x * S.z,
			sy = S.ty + S.pos.y * S.z;
		let mv = false;
		if (S.Wd && S.Wd.v3) {
			if (sx < v.w * 0.3) {
				S.tx += v.w * 0.3 - sx;
				mv = true;
			} else if (sx > v.w * 0.7) {
				S.tx -= sx - v.w * 0.7;
				mv = true;
			}
		}
		if (sy < v.h * 0.3) {
			S.ty += v.h * 0.3 - sy;
			mv = true;
		} else if (sy > v.h * 0.72) {
			S.ty -= sy - v.h * 0.72;
			mv = true;
		}
		if (mv) {
			clampY();
			apply();
		}
	}
	function kwSync(stop) {
		if (!S || !S.pos || !KW.sent) return;
		const x = Math.round(S.pos.x),
			y = Math.round(S.pos.y);
		if (x === KW.sent.x && y === KW.sent.y) return;
		const wait = (stop ? KW_STOP : KW_GO) - (Date.now() - KW.at);
		if (wait > 0) {
			if (stop && !KW.t)
				KW.t = setTimeout(() => {
					KW.t = 0;
					if (S && !KW.on) kwSync(true);
				}, wait);
			return;
		}
		clearTimeout(KW.t);
		KW.t = 0;
		const from = KW.sent;
		KW.sent = { x, y };
		KW.at = Date.now();
		try {
			X.api("/api/mine/go" + q(), { x, y, fx: from.x, fy: from.y });
		} catch (e) {
			console.warn("[шахта] шаг", e);
		}
	}
	function kwHalt() {
		if (!KW.on) return;
		KW.on = false;
		KW.last = 0;
		KW.side = 0;
		if (S && S.pos) {
			heroes();
			exDraw();
			kwSync(true);
		}
	}
	function kwFrame(t) {
		KW.raf = 0;
		if (!S) return;
		const dt = KW.last ? Math.min(0.1, (t - KW.last) / 1000) : 1 / 60;
		KW.last = t;
		const ds = kwOk() && !kwBusy() && !document.hidden ? kwDirs() : null;
		if (!ds) {
			KW.tap.clear();
			kwHalt();
			return;
		}
		if (!KW.on) {
			KW.on = true;
			S.path = null;
			S.then = null;
			S.sel = -1;
			if (!KW.sent || Date.now() - KW.at > KW_GO * 4)
				KW.sent = { x: Math.round(S.pos.x), y: Math.round(S.pos.y) };
		}
		const x0 = S.pos.x,
			len = SPEED * dt;

		let gone = 0;
		if (ds.length > 1 && inZone(cellOfPt(S.pos.x, S.pos.y))) {
			const k = len / Math.SQRT2;
			gone = kwAxis(ds[0], k) + kwAxis(ds[1], k);
		}
		if (!gone)
			for (const o of ds) {
				gone = kwAxis(o, len);
				if (gone) break;
			}
		if (gone) {
			const d = S.heroes.querySelector('[data-k="me"]');
			if (d) {
				place(d, S.pos.x, S.pos.y);
				if (Math.abs(S.pos.x - x0) > 0.01)
					d.classList.toggle("fl", S.pos.x < x0);
			}
			meNm();
			kwCam();
			npcFar();
			leaveRock(cellOfPt(S.pos.x, S.pos.y), S.pos);
			kwSync(false);
		}

		for (const [k, r] of KW.tap) {
			if (KW.keys.has(k)) continue;
			const left = gone ? r - gone : 0;
			if (left > 0.5) KW.tap.set(k, left);
			else KW.tap.delete(k);
		}
		KW.raf = requestAnimationFrame(kwFrame);
	}
	const kwRun = () => {
		if (!KW.raf) {
			KW.last = 0;
			KW.raf = requestAnimationFrame(kwFrame);
		}
	};
	function kwBind() {
		if (KW.bound) return;
		KW.bound = true;
		document.addEventListener("keydown", (e) => {
			if (
				!KW_D[e.code] ||
				e.ctrlKey ||
				e.metaKey ||
				e.altKey ||
				!kwOk() ||
				kwTyping(e.target) ||
				kwBusy()
			)
				return;
			e.preventDefault();
			if (KW.keys.has(e.code)) return;
			KW.tap.delete(e.code);
			KW.keys.set(e.code, { x: S.pos.x, y: S.pos.y });
			kwRun();
		});
		document.addEventListener("keyup", (e) => {
			const p0 = KW.keys.get(e.code);
			if (p0 == null) return;
			KW.keys.delete(e.code);

			const d = KW_D[e.code],
				went =
					S && S.pos
						? (S.pos.x - p0.x) * d[0] + (S.pos.y - p0.y) * d[1]
						: KW_TAP;
			if (went < KW_TAP - 0.5) {
				KW.tap.set(e.code, KW_TAP - Math.max(0, went));
				kwRun();
			}
		});
		window.addEventListener("blur", () => {
			KW.keys.clear();
			KW.tap.clear();
		});
	}
	function anim() {
		if (!S || S.raf || document.hidden) return;
		S.last = 0;
		S.raf = requestAnimationFrame(step);
	}
	function step(t) {
		if (!S) return;
		S.raf = 0;
		const dt = S.last ? Math.min(0.1, (t - S.last) / 1000) : 0;
		S.last = t;
		let moving = false;
		if (S.path && S.path.length) {
			moving = true;
			let left = SPEED * dt;
			while (left > 0 && S.path.length) {
				const p = S.path[0],
					dx = p.x - S.pos.x,
					dy = p.y - S.pos.y,
					L = Math.hypot(dx, dy);
				if (L <= left) {
					S.pos = { x: p.x, y: p.y };
					S.path.shift();
					left -= L;
				} else {
					S.pos = {
						x: S.pos.x + (dx / L) * left,
						y: S.pos.y + (dy / L) * left,
					};
					left = 0;
				}
			}
			if (!S.path.length) {
				S.path = null;
				const f = S.then;
				S.then = null;
				if (f) f();
				heroes();
				if (S) exDraw();
			} else {
				const d = S.heroes.querySelector('[data-k="me"]');
				if (d) place(d, S.pos.x, S.pos.y);
			}
			if (S) npcFar();
		}
		meNm();
		if (moving) S.raf = requestAnimationFrame(step);
	}

	function worldPt(e) {
		const r = S.view.getBoundingClientRect();
		return {
			x: (e.clientX - r.left - S.tx) / S.z,
			y: (e.clientY - r.top - S.ty) / S.z,
		};
	}
	function click(e) {
		if (!S.st || !S.pos) return;
		if (e.target.closest && e.target.closest(".mn-nowl [data-mn-stop]")) {
			stopDig();
			return;
		}

		if (S.npcOpen && !NPC_AT[S.npcOpen]) winClose();
		const t =
			e.target.closest &&
			e.target.closest("[data-i],[data-npc],[data-obj],[data-drill]");
		if (t && t.dataset.npc) {
			goNpc(t.dataset.npc);
			return;
		}

		if (t && t.dataset.drill) {
			S.drillK = t.dataset.drill;
			if (V3()) liftMenu(true, "drill");
			else openPanel("drill");
			return;
		}
		if (t && t.dataset.obj && useObj(t.dataset.obj)) return;
		if (S.dark && GX().cellAt(worldPt(e).x, worldPt(e).y) >= 0) {
			tip(
				"Темно — без каски с фонарём не видно, куда бить. Фонарщик — у входа",
			);
			return;
		}
		const p = worldPt(e);

		if (V3() && S.st.n < (S.st.deep || S.st.n)) {
			const sc = GX().cellAt(p.x, p.y);
			if (sc >= 0 && sc === S.F.shaft) {
				liftMenu(true, "shaft");
				return;
			}
		}
		const i = t && t.dataset.i != null ? +t.dataset.i : GX().cellAt(p.x, p.y);
		if (i >= 0 && !S.dug[i]) return clickRock(i, e.shiftKey || e.long, p, e.tr);
		const c = cellOfPt(p.x, p.y);
		if (c >= 0 && walkable(c)) {
			const at = inZone(c) ? freePt(p) : null;
			S.sel = -1;
			leaveRock(c, at);
			walkTo(c, null, at);
		}
	}

	function leaveRock(c, at) {
		if (S.myI < 0) return;
		const sp = digSpot(S.myI),
			rc = GX().cellXY(S.myI);
		if (
			c === sp &&
			!(at && Math.hypot(at.x - rc.cx, at.y - rc.cy) > MW().REACH)
		)
			return;
		S.left = { i: S.myI, at: Date.now() };
		S.want = { i: -1, at: Date.now() };
		S.myI = -1;
		S.qq = [];
		X.api("/api/mineStop", { c: C, sid: S.sid });
		heroes();
		panel();
		tip("Герой отошёл от камня и отложил кирку");
	}

	const bwOf = (pt, tr) => ({
		...(pt ? { pt: [Math.round(pt.x), Math.round(pt.y)] } : {}),
		tl: tele(tr === false),
	});

	const TL = { ti: 0, rv: 0, on: false };
	const tlIn = (e) => {
		if (e.isTrusted) TL.ti++;
	};
	function tlOn() {
		if (TL.on) return;
		TL.on = true;
		TL.ti = 0;
		TL.rv = 0;
		document.addEventListener("pointerdown", tlIn, {
			capture: true,
			passive: true,
		});
		document.addEventListener("keydown", tlIn, {
			capture: true,
			passive: true,
		});
	}
	function tlOff() {
		if (!TL.on) return;
		TL.on = false;
		document.removeEventListener("pointerdown", tlIn, { capture: true });
		document.removeEventListener("keydown", tlIn, { capture: true });
	}
	const natv = (f) => {
		try {
			return (
				typeof f === "function" &&
				/\{\s*\[native code\]\s*\}\s*$/.test(
					Function.prototype.toString.call(f),
				)
			);
		} catch (e) {
			return true;
		}
	};

	function tlHp() {
		try {
			for (const k of ["hidden", "visibilityState"]) {
				if (Object.getOwnPropertyDescriptor(document, k)) return 1;
				const d = Object.getOwnPropertyDescriptor(Document.prototype, k);
				if (!d || !natv(d.get)) return 1;
			}
			if (
				Object.hasOwn(document, "hasFocus") ||
				!natv(Document.prototype.hasFocus)
			)
				return 1;
		} catch (e) {
			return 0;
		}
		return 0;
	}

	function tlFrame() {
		if (document.visibilityState !== "visible") return;
		let f = 0;
		const id = requestAnimationFrame(() => {
			f = 1;
		});
		setTimeout(() => {
			if (!f) {
				TL.rv = 1;
				cancelAnimationFrame(id);
			}
		}, 1500);
	}

	const ghostM = () => {
		try {
			return (
				!!S &&
				(!S.el.isConnected ||
					!S.el.getClientRects().length ||
					getComputedStyle(S.el).visibility === "hidden")
			);
		} catch (e) {
			return false;
		}
	};

	function tlPi() {
		let b = 0;
		try {
			const F = window.LG_FETCH,
				fOwn = !!(F && window.fetch === F.w && F.n);
			if (typeof window.fetch === "function" && !natv(window.fetch) && !fOwn)
				b |= 1;
			if (
				typeof window.requestAnimationFrame === "function" &&
				!natv(window.requestAnimationFrame)
			)
				b |= 2;
			const M = window.LGMine,
				B = window.LGMineBiome;
			if (
				(M && (M.open !== open || M.onEvent !== onEvent)) ||
				(B && typeof B.own === "function" && !B.own())
			)
				b |= 4;
		} catch (e) {
			return 0;
		}
		return b;
	}
	function tele(ut) {
		const pi = tlPi(),
			o = {
				ti: TL.ti,
				...(ut ? { ut: 1 } : {}),
				...(TL.rv ? { rv: 1 } : {}),
				...(tlHp() ? { hp: 1 } : {}),
				...(ghostM() ? { gm: 1 } : {}),
				...(pi ? { pi } : {}),
			};
		TL.ti = 0;
		TL.rv = 0;
		tlFrame();
		return o;
	}
	async function queueRock(i, pt, tr) {
		if (S.myI < 0) return false;
		if (i === S.myI) return true;
		const cur = ((S.me && S.me.qq) || S.qq || []).filter((x) => x !== i);
		const qq = [...cur, i].slice(-2);
		const sp = centerOf(digSpot(S.myI) ?? cellOfPt(S.pos.x, S.pos.y));
		const r = await X.api("/api/mineDig", {
			i: S.myI,
			c: C,
			sid: S.sid,
			x: sp.x,
			y: sp.y,
			q: qq,
			...bwOf(pt, tr),
		});
		if (!S) return true;
		if (!r || !r.ok) {
			tip((r && r.error) || "Не получилось");
			return true;
		}
		S.qq = qq;
		if (S.me) S.me = { ...S.me, qq };
		S.barKey = "";
		bars();
		tip(
			`В очереди камней: ${qq.length} — герой возьмёт их сам, когда докопает этот`,
		);
		return true;
	}
	function clickRock(i, toQueue, pt, tr) {
		const cell = S.F.cells[i];
		if (S.dark)
			return tip(
				"Темно — без каски с фонарём не видно, куда бить. Фонарщик — у входа",
			);
		if (cell.t === "wall") return tip(tx().wall);
		if (!(S.st.front || []).includes(i)) return tip(tx().far);
		if (S.me && S.me.cap > 0 && S.me.day >= S.me.cap)
			return tip(
				`На сегодня хватит: ${mmss(S.me.cap)} работы. Новые сутки - в 05:00`,
			);
		if (toQueue && S.me && S.me.fx && S.me.fx.q && S.myI >= 0) {
			queueRock(i, pt, tr);
			return;
		}
		const sp = digSpot(i);
		if (sp == null) return tip("Не подойти");

		S.want = { i, at: Date.now() };
		S.qq = [];
		S.left = null;
		walkTo(sp, async () => {
			if (!S || !S.want || S.want.i !== i) return;
			const at = centerOf(sp);
			const r = await X.api("/api/mineDig", {
				i,
				c: C,
				sid: S.sid,
				x: at.x,
				y: at.y,
				...(V3() && S.st ? { n: S.st.n } : {}),
				...bwOf(pt, tr),
			});
			if (!S) return;
			if (!r || !r.ok) {
				if (S.want && S.want.i === i) S.want = null;
				if (r && r.other) otherTab(true);
				tip((r && r.error) || "Не получилось");
				S.myI = -1;
				heroes();
				panel();
				return;
			}

			if (S.want && S.want.i < 0) {
				X.api("/api/mineStop", { c: C, sid: S.sid });
				return;
			}
			S.want = { i, at: Date.now() };
			S.myI = i;
			S.barKey = "";
			bars();
			heroes();
			panel();
			tip(
				`${tx().doing}: ${blockTitle(cell)} — герой будет работать, пока не закончит (даже если закроешь сайт)`,
			);
		});
	}

	const keyOf = (f, deep) => (f >= deep ? CB() : `${CB()}.${f}`);
	function follow3(st) {
		if (!(st.fl && st.fl.v3) || !S.me || !(S.me.at >= 1) || S.me.at === st.n)
			return false;
		if (S.rideAt && Date.now() - S.rideAt < 60000) return false;
		const k = keyOf(S.me.at, st.deep || st.n);
		if (k === C) return false;
		S.rideAt = Date.now();
		const x = X;
		setTimeout(() => {
			if (S && x === X) open(x, k);
		}, 0);
		return true;
	}

	const RIDE_MS = 15000,
		RIDE_MIN = 450;
	async function ride(f) {
		const st = S.st,
			deep = (st && (st.deep || st.n)) || 1;
		f = Math.max(1, Math.min(deep, Math.floor(+f) || 1));
		if (S.busyOp || S.ride) return;
		S.busyOp = 1;

		const me0 = S;
		winClose();
		liftMenu(false);
		S.el.dataset.ride = f < ((st && st.n) || f) ? "up" : "dn";
		rideCover(true, `Лифт едет на этаж ${f}…`);
		const r = await X.api("/api/mineRide", { c: CB(), n: f });
		if (!S || S !== me0) return;
		S.busyOp = 0;
		if (!r || !r.ok) {
			rideCover(false);
			tip((r && r.error) || "Лифт не поехал");
			return;
		}
		S.rideAt = Date.now();
		rideGo(f, keyOf(f, deep));
	}
	function rideCover(on, t) {
		let el = S.el.querySelector(".mn-ride");
		if (on) {
			if (!el) {
				el = document.createElement("div");
				el.className = "mn-ride";
				el.setAttribute("role", "status");
				el.innerHTML =
					'<div class="mn-ride-b"><i class="mn-ride-c" aria-hidden="true"></i><b></b></div>';
				S.el.appendChild(el);
				void el.offsetWidth;
			}
			el.querySelector("b").textContent = t;
			el.classList.remove("off");
			el.classList.add("on");
			S.el.classList.add("mn-riding");
			clearTimeout(S.rideOffT);
			return;
		}
		if (!el) return;
		S.el.classList.remove("mn-riding");
		el.classList.remove("on");
		el.classList.add("off");
		clearTimeout(S.rideOffT);
		const me0 = S;
		S.rideOffT = setTimeout(() => {
			if (S === me0 && el.classList.contains("off")) el.remove();
		}, 400);
	}
	function rideGo(f, k) {
		const from = C,
			me0 = S;
		S.ride = { f, k, from, at: Date.now() };

		S.path = null;
		S.then = null;
		S.want = null;
		S.qq = [];
		C = k;
		clearInterval(S.rideT);
		S.rideT = setInterval(() => {
			if (S === me0 && S.ride) poll(false, true);
		}, 1500);
		clearTimeout(S.rideTO);
		S.rideTO = setTimeout(() => {
			if (S === me0 && S.ride) rideFail();
		}, RIDE_MS);
		enter(false, true).catch(fail);
	}
	function rideEnd() {
		if (!S || !S.ride) return;
		const wait = Math.max(0, RIDE_MIN - (Date.now() - S.ride.at)),
			me0 = S;
		S.ride = null;
		clearInterval(S.rideT);
		clearTimeout(S.rideTO);

		setTimeout(() => {
			if (S === me0 && !S.ride) rideCover(false);
		}, wait);
	}
	function rideFail() {
		const R = S.ride;
		if (!R) return;
		S.ride = null;
		clearInterval(S.rideT);
		clearTimeout(S.rideTO);
		C = R.from;
		tip("Лифт не доехал - попробуй ещё раз");
		enter(false, true)
			.then(() => {
				if (S) rideCover(false);
			})
			.catch(fail);
	}
	async function liftFund(coins, lines) {
		if (S.busyOp) return;
		S.busyOp = 1;
		const r = await X.api("/api/mineLift", {
			c: CB(),
			coins,
			...(lines ? { lines } : {}),
		});
		if (!S) return;
		S.busyOp = 0;
		if (!r || !r.ok) {
			tip((r && r.error) || "Вклад не принят");
			return;
		}
		const gave = oreGave(lines);
		tip(
			gave
				? `Вклад принят - из сумки ушло: ${gave}. Полоса сбора обновится через пару секунд`
				: "Вклад принят - спасибо! Полоса сбора обновится через пару секунд",
		);
	}
	const hm = (ms) => {
		const m = Math.max(0, Math.round(ms / 60000));
		return m >= 60 ? `${Math.floor(m / 60)} ч ${m % 60} мин` : `${m} мин`;
	};
	function liftHtml(st) {
		const L = st.lift || { st: "dig" },
			deep = st.deep || st.n,
			money = (n) => (X.money ? X.money(n) : String(n));
		const fl = [];
		for (let f = deep; f >= 1; f--)
			fl.push(
				`<button type="button" class="btn ${f === st.n ? "primary" : "ghost"} sm" data-mn-ride="${f}"${f === st.n ? ' aria-current="true" disabled' : ""}>${f}</button>`,
			);
		let stage = "";
		if (L.st === "dig")
			stage = `<p>Этаж ${deep + 1}: сначала докопайтесь до <b>шахты лифта</b> на этаже ${deep} - она далеко от лифта, под туманом. Потом - сбор ${money(L.need || 0)} и таймер ${hm(L.ms || 0)}.</p>`;
		else if (L.st === "fund") {
			const p = L.need ? Math.min(100, (L.c / L.need) * 100) : 0,
				left = Math.max(0, (L.need || 0) - (L.c || 0));
			const ore = oreRows(st, "data-mn-lore");
			stage = `<p>Шахта лифта найдена! Скидываемся на этаж ${deep + 1} - монетами и рудой (руда - по цене скупщика, уходит в казну Ратуши).</p>
        <div class="mn-lbar" role="progressbar" aria-valuemin="0" aria-valuemax="${L.need}" aria-valuenow="${L.c}"><i style="width:${p.toFixed(1)}%"></i><span>${money(L.c || 0)} из ${money(L.need || 0)}</span></div>
        <div class="mn-btns">${[100, 500, 1000]
					.filter((v) => v < left)
					.map(
						(v) =>
							`<button type="button" class="btn ghost sm" data-mn-lfund="${v}">${money(v)}</button>`,
					)
					.join(
						"",
					)}${left > 0 ? `<button type="button" class="btn primary sm" data-mn-lfund="${left}">Весь остаток ${money(left)}</button>` : ""}</div>
        ${ore ? `<h4>Руда из сумки</h4>${ORE_NOTE}<ul class="mn-lore">${ore}</ul>` : ""}`;
		} else
			stage = `<p>Собрали! Лифт улучшается: этаж ${deep + 1} откроется через <b>${hm(L.left != null ? L.left - (Date.now() - (S.stAt || Date.now())) : (L.at || 0) - Date.now())}</b>. Копать можно.</p>`;
		const by = (L.by || []).length
			? `<h4>Скинулись</h4><ol class="mn-lby">${L.by.map(([l, v]) => `<li><span>${esc(l)}</span><b>${money(v)}</b></li>`).join("")}</ol>`
			: "";
		return `<div class="mn-npc-p mn-lift"><h3 class="h3">Лифт</h3><p class="muted">Ты на этаже ${st.n}. Открыто этажей: ${deep}.</p><div class="mn-lfl" role="group" aria-label="Этажи">${fl.join("")}</div>${stage}${by}
      <div class="mn-btns"><button type="button" class="btn ghost" data-mn-lcity>В город</button><button type="button" class="btn ghost" data-mn-back>Назад</button></div></div>`;
	}

	async function drillFund(k, coins, lines) {
		if (S.busyOp) return;
		S.busyOp = 1;
		const r = await X.api("/api/mineDrill", {
			c: CB(),
			k,
			coins,
			...(lines ? { lines } : {}),
		});
		if (!S) return;
		S.busyOp = 0;
		if (!r || !r.ok) {
			tip((r && r.error) || "Вклад не принят");
			return;
		}
		const gave = oreGave(lines);
		tip(
			gave
				? `Вклад в буровую принят - из сумки ушло: ${gave}`
				: "Вклад в буровую принят - спасибо!",
		);
	}

	const ORE_ASK_MS = 8000,
		ORE_ASK_MIN = 350;
	const ORE_NOTE =
		'<p class="muted mn-onote">Руда уходит из твоей сумки в казну Ратуши - отдаётся вся кучка. Нажми «Отдать», потом подтверди.</p>';
	const oreAsked = (uid) =>
		!!(
			S.oreAsk &&
			S.oreAsk.uid === uid &&
			Date.now() - S.oreAsk.at < ORE_ASK_MS
		);

	function oreGave(lines) {
		if (!lines || !lines.length) return "";
		const g = S.oreGone || (S.oreGone = new Map()),
			its = oreItems(),
			out = [];
		for (const [uid, q] of lines) {
			const it = its.find((x) => x.uid === uid);
			g.set(uid, Date.now());
			if (it) out.push(`${it.name} ${oskQ(q)}`);
		}
		oreRedraw();
		return out.join(", ");
	}
	const oreGone = (uid) => {
		const t = S.oreGone && S.oreGone.get(uid);
		return !!(t && Date.now() - t < 60000);
	};
	function oreRows(st, oreAttr, max = 8) {
		const money = (n) => (X.money ? X.money(n) : String(n)),
			P = st.bp || {};
		return oreItems()
			.filter((it) => +P[it.res] > 0 && !oreGone(it.uid))
			.slice(0, max)
			.map((it) => {
				const ask = oreAsked(it.uid),
					v = money(Math.floor((it.q * P[it.res]) / 100));
				return `<li><span>${esc(it.name)} <small>${esc(oskQ(it.q))}</small></span><button type="button" class="btn ${ask ? "primary" : "ghost"} sm" ${oreAttr}="${esc(it.uid)}" data-q="${it.q}"${ask ? ` aria-label="Точно отдать ${esc(it.name)} ${esc(oskQ(it.q))}?"` : ""}>${ask ? `Точно отдать ${esc(oskQ(it.q))}?` : `Отдать ≈${v}`}</button></li>`;
			})
			.join("");
	}

	function oreRedraw() {
		S.bodyHtml = "";
		panel();
		drillMenuFill();
	}

	function oreAsk(uid, send) {
		const a = S.oreAsk,
			dt = a && a.uid === uid ? Date.now() - a.at : -1;
		if (dt >= ORE_ASK_MIN && dt < ORE_ASK_MS) {
			S.oreAsk = null;
			oreRedraw();
			send();
			return;
		}

		if (dt >= 0 && dt < ORE_ASK_MIN) return;
		S.oreAsk = { uid, at: Date.now() };
		oreRedraw();
		const x = X;
		setTimeout(() => {
			if (S && x === X && S.oreAsk && S.oreAsk.uid === uid) {
				S.oreAsk = null;
				oreRedraw();
			}
		}, ORE_ASK_MS + 50);
	}
	function fundBlock(c, need, attr, oreAttr, st, maxOre = 8) {
		const money = (n) => (X.money ? X.money(n) : String(n)),
			p = need ? Math.min(100, (c / need) * 100) : 0,
			left = Math.max(0, need - c);
		const ore = oreRows(st, oreAttr, maxOre);
		return `<div class="mn-lbar" role="progressbar" aria-valuemin="0" aria-valuemax="${need}" aria-valuenow="${c}"><i style="width:${p.toFixed(1)}%"></i><span>${money(c)} из ${money(need)}</span></div>
      <div class="mn-btns">${[100, 500, 1000]
				.filter((v) => v < left)
				.map(
					(v) =>
						`<button type="button" class="btn ghost sm" ${attr}="${v}">${money(v)}</button>`,
				)
				.join(
					"",
				)}${left > 0 ? `<button type="button" class="btn primary sm" ${attr}="${left}">Весь остаток ${money(left)}</button>` : ""}</div>
      ${ore ? `<h4>Руда из сумки</h4>${ORE_NOTE}<ul class="mn-lore">${ore}</ul>` : ""}`;
	}
	function drillHtml(st) {
		const d = (st.drills || []).find((x) => x[0] === S.drillK);
		if (!d)
			return `<div class="mn-npc-p"><h3 class="h3">Буровая</h3><p>Буровой здесь нет.</p><div class="mn-btns"><button type="button" class="btn ghost" data-mn-back>Назад</button></div></div>`;
		const [k, , , stg, lv, c, need, left, out, cap, rate, res, by] = d,
			money = (n) => (X.money ? X.money(n) : String(n)),
			nm = esc(resName(res));
		const head =
			stg === "site"
				? `<p>Жила «${nm}» почти выкопана - здесь можно поставить буровую. Она сама добывает руду жилы: 70% - в казну Ратуши, 30% - тем, кто копал в шахте за последний час. Строителям - бонус рудой.</p>`
				: stg === "build"
					? `<p>Стройка ур. ${lv + 1}: готово через <b>${hm(left - (Date.now() - (S.stAt || Date.now())))}</b>.${lv ? ` Пока строится - добывает как ур. ${lv}.` : ""}</p>`
					: stg === "dry"
						? `<p>Жила иссякла - буровая добыла всё, что могла (${val(out)} шт.).</p>`
						: `<p>Буровая ур. ${lv}: ${val(rate)} шт./ч руды «${nm}». Добыто ${val(out)} из ${val(cap)} шт.</p>`;
		const prog =
			lv && stg !== "dry"
				? `<div class="mn-lbar mn-dbar"><i style="width:${cap ? Math.min(100, (out / cap) * 100).toFixed(1) : 0}%"></i><span>добыто ${val(out)} из ${val(cap)} шт.</span></div>`
				: "";
		const fund =
			(stg === "site" || stg === "work") && lv < 3
				? `<h4>${lv ? `На ур. ${lv + 1}` : "На постройку"}</h4>${fundBlock(c, need, "data-mn-dfund", "data-mn-dore", st)}`
				: "";
		const who = (by || []).length
			? `<h4>Скинулись</h4><ol class="mn-lby">${by.map(([l, v]) => `<li><span>${esc(l)}</span><b>${money(v)}</b></li>`).join("")}</ol>`
			: "";
		return `<div class="mn-npc-p mn-lift"><h3 class="h3">Буровая · ${nm}</h3>${head}${prog}${fund}${who}<div class="mn-btns"><button type="button" class="btn ghost" data-mn-back>Назад</button></div></div>`;
	}
	function liftBind(el) {
		el.querySelectorAll("[data-mn-dfund]").forEach((b) => {
			b.onclick = () => drillFund(S.drillK, +b.dataset.mnDfund);
		});
		el.querySelectorAll("[data-mn-dore]").forEach((b) => {
			b.onclick = () => {
				const k = S.drillK,
					ln = [[b.dataset.mnDore, +b.dataset.q]];
				oreAsk(b.dataset.mnDore, () => drillFund(k, 0, ln));
			};
		});
		el.querySelectorAll("[data-mn-ride]").forEach((b) => {
			b.onclick = () => ride(+b.dataset.mnRide);
		});
		el.querySelectorAll("[data-mn-lfund]").forEach((b) => {
			b.onclick = () => liftFund(+b.dataset.mnLfund);
		});
		el.querySelectorAll("[data-mn-lore]").forEach((b) => {
			b.onclick = () => {
				const ln = [[b.dataset.mnLore, +b.dataset.q]];
				oreAsk(b.dataset.mnLore, () => liftFund(0, ln));
			};
		});
		const c = el.querySelector("[data-mn-lcity]");
		if (c) c.onclick = exit;
	}
	function useObj(k) {
		if (k === "lift") {
			if (V3()) {
				liftMenu(!S.lm);
				return true;
			}
			exit();
			return true;
		}
		if (k === "buyer") {
			goNpc("buy");
			return true;
		}
		if (k === "lamp" && S.Wd.lampNpc) {
			goNpc("lamp");
			return true;
		}
		if (k === "board") {
			goBoard();
			return true;
		}
		if (k === "up") {
			tip(upText());
			return true;
		}
		return false;
	}

	function bubbleAnchor() {
		if (S.lmK === "shaft") {
			if (!S.m3 || !(S.F.shaft >= 0)) return null;
			const p = S.m3.G.cellXY(S.F.shaft);
			return { x: p.cx, up: p.cy - 90, dn: p.cy + 50 };
		}
		if (S.lmK === "drill") {
			const d = (S.st.drills || []).find((x) => x[0] === S.drillK);
			if (!d || !S.m3) return null;
			const p = S.m3.G.cellXY(d[2]);
			return {
				x: p.cx,
				up: p.y - (96 + Math.max(1, d[4]) * 26) - 18,
				dn: p.y + 34,
			};
		}
		const L = S.Wd && S.Wd.props && S.Wd.props.find((q) => q.obj === "lift");
		return L ? { x: L.x, up: L.y - 160, dn: L.y + 14 } : null;
	}
	function liftPlace() {
		const m = S && S.lm;
		if (!m) return;
		const a = bubbleAnchor();
		if (!a) {
			liftMenu(false);
			return;
		}
		const vw = S.view.clientWidth,
			vh = S.view.clientHeight - padB(),
			top0 = (S.topPad || 0) + 4,
			room = Math.max(120, vh - top0 - 4);

		m.style.maxHeight = "";
		m.style.overflowY = "";
		if (m.offsetHeight > room) {
			m.style.maxHeight = room + "px";
			m.style.overflowY = "auto";
		}
		const w = m.offsetWidth,
			h = m.offsetHeight;
		const ax = S.tx + a.x * S.z,
			up = S.ty + a.up * S.z - 14,
			dn = S.ty + a.dn * S.z;
		const above = up - h >= top0,
			y = Math.max(top0, Math.min(vh - h - 4, above ? up - h : dn)),
			x = Math.max(8, Math.min(vw - w - 8, ax - w / 2));
		m.style.transform = `translate(${x.toFixed(0)}px, ${y.toFixed(0)}px)`;
		m.classList.toggle("dn", !above);
		m.style.setProperty(
			"--tail",
			Math.max(18, Math.min(w - 18, ax - x)).toFixed(0) + "px",
		);
	}

	function drillMenuHtml() {
		const st = S.st,
			d = (st.drills || []).find((x) => x[0] === S.drillK);
		if (!d) return "";
		const [, , , stg, lv, c, need, left, out, cap, rate, res, by] = d,
			money = (n) => (X.money ? X.money(n) : String(n)),
			nm = esc(resName(res));
		const sub =
			stg === "site"
				? "Площадка: жила почти выкопана. Буровая добывает 70% в казну, 30% - копавшим за час."
				: stg === "build"
					? `Стройка ур. ${lv + 1}: готово через <b>${hm(left - (Date.now() - (S.stAt || Date.now())))}</b>.`
					: stg === "dry"
						? `Жила иссякла, добыто ${val(out)} шт.`
						: `${val(rate)} шт./ч. Добыто ${val(out)} из ${val(cap)}. 70% - в казну, 30% - копавшим.`;
		const fund =
			(stg === "site" || stg === "work") && lv < 3
				? `<div class="mn-lm-h">${lv ? `На ур. ${lv + 1}` : "На постройку"}</div>${fundBlock(c, need, "data-mn-dfund", "data-mn-dore", st, 3)}`
				: "";
		const who = (by || []).length
			? `<p class="mn-lm-by">Скинулись: ${by
					.slice(0, 3)
					.map(([l, v]) => `<b>${esc(l)}</b> ${money(v)}`)
					.join(", ")}${by.length > 3 ? ` и ещё ${by.length - 3}` : ""}</p>`
			: "";
		return `<div class="mn-lm-t">Буровая · ${nm}${lv ? ` · ур. ${lv}` : ""}</div><p class="mn-lm-s">${sub}</p>${fund}${who}<div class="mn-btns"><button type="button" class="btn ghost" data-mn-lm="more">Подробнее</button></div>`;
	}
	function drillMenuFill() {
		if (!S || !S.lm || S.lmK !== "drill") return;
		const h = drillMenuHtml();
		if (!h) {
			liftMenu(false);
			return;
		}
		if (h !== S.lmH) {
			S.lmH = h;
			S.lm.innerHTML = h;
			liftPlace();
		}
	}
	function liftMenu(on, kind) {
		if (!S) return;
		if (S.lm) {
			S.lm.remove();
			S.lm = null;
			S.lmK = null;
			S.lmH = "";
		}
		if (!on || !V3()) return;
		const m = document.createElement("div");
		m.className = "mn-lm" + (kind === "drill" ? " mn-lmd" : "");
		m.setAttribute("role", kind === "drill" ? "dialog" : "menu");
		S.lmK = kind === "drill" || kind === "shaft" ? kind : "lift";
		S.lm = m;
		if (kind === "shaft") {
			m.className = "mn-lm mn-lmd";
			m.setAttribute("role", "dialog");
			m.innerHTML =
				'<p class="mn-lm-s">Это шахта лифта - чтобы спуститься ниже, воспользуйся лифтом.</p><div class="mn-btns"><button type="button" class="btn primary" data-mn-lm="tolift">К лифту</button></div>';
		} else if (kind === "drill") {
			S.lmH = drillMenuHtml();
			if (!S.lmH) {
				S.lm = null;
				S.lmK = null;
				return;
			}
			m.innerHTML = S.lmH;
		} else
			m.innerHTML =
				'<button type="button" class="btn primary" data-mn-lm="city" role="menuitem">В город</button><button type="button" class="btn ghost" data-mn-lm="floors" role="menuitem">Этажи</button>';
		m.addEventListener("pointerdown", (e) => e.stopPropagation());
		m.addEventListener("click", (e) => {
			const f = e.target.closest("[data-mn-dfund]");
			if (f) {
				drillFund(S.drillK, +f.dataset.mnDfund);
				return;
			}
			const o = e.target.closest("[data-mn-dore]");
			if (o) {
				const k = S.drillK,
					ln = [[o.dataset.mnDore, +o.dataset.q]];
				oreAsk(o.dataset.mnDore, () => drillFund(k, 0, ln));
				return;
			}
			const b = e.target.closest("[data-mn-lm]");
			if (!b) return;
			const k = b.dataset.mnLm;
			liftMenu(false);
			if (k === "tolift") {
				const [hx, hy] = GX().hall,
					at = freePt({ x: GX().liftX || hx + 326, y: hy + 200 });
				leaveRock(cellOfPt(at.x, at.y), at);
				walkTo(cellOfPt(at.x, at.y), null, at);
				return;
			}
			if (k === "city") exit();
			else if (k === "floors") openPanel("lift");
			else if (k === "more") openPanel("drill");
		});
		S.view.appendChild(m);
		liftPlace();
		if (kind !== "drill") {
			const first = m.querySelector("button");
			if (first) first.focus({ preventScroll: true });
		}
	}
	function openPanel(kind) {
		bagClose();
		liftMenu(false);
		if (S.wgOpen) {
			S.wgOpen = false;
			S.wgH = "";
		}
		const was = S.npcOpen;
		S.npcOpen = kind;
		npcArm(kind);
		if (was !== kind) S.bodyHtml = "";
		panel();
		const w = S.el.querySelector(".mn-win");
		if (w) w.scrollTop = 0;
	}

	const NPC_FAR = 2.5 * 128,
		NPC_AT = { buy: "buyer", lamp: "lamp" };
	function npcArm(kind) {
		const k = NPC_AT[kind];
		S.npcAt = k ? { kind, at: frontOf(k), on: false } : null;
	}

	function npcGo(to) {
		const a = S && S.npcAt;
		if (a && to && Math.hypot(to.x - a.at.x, to.y - a.at.y) > NPC_FAR)
			a.on = true;
	}
	function npcFar() {
		const a = S.npcAt;
		if (!a || !S.pos) return;
		if (S.npcOpen !== a.kind) {
			S.npcAt = null;
			return;
		}
		const d = Math.hypot(S.pos.x - a.at.x, S.pos.y - a.at.y);
		if (d <= NPC_FAR) {
			a.on = true;
			return;
		}
		if (!a.on) return;
		S.npcAt = null;
		S.npcOpen = false;
		const back = a.kind === "buy" && B.lines.size && !B.wait;
		if (back) B.lines.clear();
		panel();
		if (back) tip("Отошёл от скупщика - окно закрыто, руда снова в сумке");
	}

	function goNpc(kind = "buy") {
		const n = kind === "lamp" ? S.Wd.lampNpc : S.Wd.npc;
		if (!n) return;
		const at = frontOf(kind === "lamp" ? "lamp" : "buyer"),
			c = cellOfPt(at.x, at.y);
		openPanel(kind);
		leaveRock(c, at);
		walkTo(c, null, at);
	}

	function goBoard() {
		openPanel("quests");
		if (S.myI >= 0) return;
		const at = frontOf("board");
		walkTo(cellOfPt(at.x, at.y), null, at);
	}

	const frontOf = (k) => {
		const f = GX().FOOT.find((x) => x.k === k);
		return f && f.at ? freePt({ x: f.at[0], y: f.at[1] }) : spawnPt();
	};

	function bindHover() {
		let cur = null;
		const off = () => {
			if (!cur) return;
			for (const g of cur) g.classList.remove("hl");
			cur = null;
			const h = S && S.labels.querySelector(".mn-hl");
			if (h) h.hidden = true;
		};
		S.svg.addEventListener("pointerover", (e) => {
			if (e.pointerType !== "mouse" || !mine2On()) return;
			const t = e.target.closest("[data-npc],[data-obj].act");
			if (!t) return off();
			const k = t.dataset.npc ? NPC_OBJ[t.dataset.npc] : t.dataset.obj;
			if (cur && cur.includes(t)) return;
			off();
			cur = [
				...S.svg.querySelectorAll(
					`[data-obj="${k}"].act` +
						(k === "buyer"
							? ',[data-npc="buy"]'
							: k === "lamp"
								? ',[data-npc="lamp"]'
								: ""),
				),
			];
			if (!cur.length) cur = [t];
			for (const g of cur) g.classList.add("hl");
			const h = S.labels.querySelector(".mn-hl");
			if (!h) return;
			try {
				const b = t.getBBox();
				const tt = objText(k);
				h.textContent = tt;
				h.style.left = (b.x + b.width / 2).toFixed(0) + "px";
				h.style.top =
					(k === "up" ? b.y + b.height + 8 : b.y - 6).toFixed(0) + "px";
				h.hidden = !tt;
				h.classList.toggle("long", tt.length > 40);
				h.classList.toggle("dn", k === "up");
			} catch (x) {}
		});
		S.svg.addEventListener("pointerleave", off);
		S.view.addEventListener("pointerdown", off);
	}

	const blockName = (t) =>
		tx().b[t] || (t === "prize" ? tx().b.chest : tx().b.rock);
	const blockTitle = (c) =>
		`${blockName(c.t)} ${c.lv} ур.${c.r && (c.t === "ore" || c.t === "rare") ? " · " + resName(c.r) : ""}`;

	const RES = {
		stone: "камень",
		basalt: "базальт",
		coal: "уголь",
		iron: "железо",
		silver: "серебро",
		gold: "золото",
		crystal: "кристаллы",
		sulfur: "сера",
		obsidian: "обсидиан",
		wood: "дерево",
		pine: "сосна",
		resin: "смола",
		moss: "мох",
		oak: "крепкий дуб",
		heartwood: "редкая древесина",
		spiritwood: "дерево духов",
		furs: "меха",
		cedar: "кедр",
		grain: "зерно",
		flax: "лён",
		wool: "шерсть",
		honey: "мёд",
		seeds: "редкие семена",
		golden_wheat: "золотая пшеница",
		herbs: "травы",
		blight_herbs: "гнилые травы",
		mushrooms: "грибы",
		peat: "торф",
		poison_root: "ядовитые корни",
		moonflower: "лунный цветок",
		witch_bloom: "ведьмин цвет",
		bone_dust: "костяная пыль",
		black_lotus: "чёрный лотос",
		fish: "рыба",
		ice_fish: "северная рыба",
		salt: "соль",
		shells: "раковины",
		amber: "янтарь",
		pearl: "жемчуг",
		black_pearl: "чёрный жемчуг",
		fish_oil: "рыбий жир",
		seal_hide: "тюленьи шкуры",
		walrus_tusk: "моржовый клык",
		ice_amber: "ледяной янтарь",
		clay: "глина",
		rubble: "щебень",
		glass: "стекло",
		relic: "древности",
		scarab: "золотой скарабей",
		statue_shard: "осколки статуй",
		crown: "древняя корона",
		copper: "медь",
		frost_stone: "мёрзлый камень",
		limestone: "известняк",
		sandstone: "песчаник",
		adamant: "адамантит",
		fire_opal: "огненный опал",
		emerald: "изумруд",
		sapphire: "сапфир",
		topaz: "топаз",
		malachite: "малахит",
		morion: "морион",
		aquamarine: "аквамарин",
		ruby: "рубин",
		runestone: "рунный камень",
	};
	const resName = (k) => RES[k] || k;

	const RESG = {
		stone: "камня",
		basalt: "базальта",
		coal: "угля",
		iron: "железа",
		silver: "серебра",
		gold: "золота",
		crystal: "кристаллов",
		sulfur: "серы",
		obsidian: "обсидиана",
		wood: "дерева",
		pine: "сосны",
		resin: "смолы",
		moss: "мха",
		oak: "крепкого дуба",
		heartwood: "редкой древесины",
		spiritwood: "дерева духов",
		furs: "мехов",
		cedar: "кедра",
		grain: "зерна",
		flax: "льна",
		wool: "шерсти",
		honey: "мёда",
		seeds: "редких семян",
		golden_wheat: "золотой пшеницы",
		herbs: "трав",
		blight_herbs: "гнилых трав",
		mushrooms: "грибов",
		peat: "торфа",
		poison_root: "ядовитых корней",
		moonflower: "лунного цветка",
		witch_bloom: "ведьмина цвета",
		bone_dust: "костяной пыли",
		black_lotus: "чёрного лотоса",
		fish: "рыбы",
		ice_fish: "северной рыбы",
		salt: "соли",
		shells: "раковин",
		amber: "янтаря",
		pearl: "жемчуга",
		black_pearl: "чёрного жемчуга",
		fish_oil: "рыбьего жира",
		seal_hide: "тюленьих шкур",
		walrus_tusk: "моржового клыка",
		ice_amber: "ледяного янтаря",
		clay: "глины",
		rubble: "щебня",
		glass: "стекла",
		relic: "древностей",
		scarab: "золотого скарабея",
		statue_shard: "осколков статуй",
		crown: "древней короны",
		copper: "меди",
		frost_stone: "мёрзлого камня",
		limestone: "известняка",
		sandstone: "песчаника",
		adamant: "адамантита",
		fire_opal: "огненного опала",
		emerald: "изумруда",
		sapphire: "сапфира",
		topaz: "топаза",
		malachite: "малахита",
		morion: "мориона",
		aquamarine: "аквамарина",
		ruby: "рубина",
		runestone: "рунного камня",
	};
	const oskW = (n) => {
		const a = n % 10,
			b = n % 100;
		return a === 1 && b !== 11
			? "осколок"
			: a >= 2 && a <= 4 && (b < 12 || b > 14)
				? "осколка"
				: "осколков";
	};
	const qty = (n, p) =>
		n && p ? `${n} шт. + ${p} ${oskW(p)}` : n ? `${n} шт.` : `${p} ${oskW(p)}`;

	const resList = (b) => {
		const r = (b && b.r) || {},
			p = (b && b.p) || {};
		return [...new Set([...Object.keys(r), ...Object.keys(p)])]
			.map((k) => [k, +r[k] || 0, +p[k] || 0])
			.filter(([, n, x]) => n > 0 || x > 0);
	};
	const gotText = (v, k) => {
		const n = Math.floor(v / 100),
			p = v % 100;
		return n
			? `+${n} ${resName(k)}${p ? ` и ${p} ${oskW(p)}` : ""}`
			: `+${p} ${oskW(p)} ${RESG[k] || resName(k)}`;
	};
	let tipT = 0;
	function tip(t) {
		const el = S && S.el.querySelector(".mn-tip");
		if (!el) return;
		el.textContent = t;
		el.hidden = false;
		clearTimeout(tipT);
		tipT = setTimeout(() => {
			el.hidden = true;
		}, 4200);
	}

	const coins = (x) => {
		const v = Math.max(0, +x || 0),
			n = Math.floor(v + 1e-9);
		if (v - n < 0.05 || n >= 10) return X.money ? X.money(n) : String(n);
		const t = v.toFixed(v < 1 ? 2 : 1).replace(".", ",");
		return n
			? `${X.money ? X.money(n) : n} <small class="mn-frac">(${t})</small>`
			: X.money
				? X.money(1).replace(">1<", `>${t}<`)
				: t;
	};
	const mmss = (min) => {
		const m = Math.max(0, Math.round(min));
		return m >= 60 ? `${Math.floor(m / 60)} ч ${m % 60} мин` : `${m} мин`;
	};

	const CNT_MS = 8000;
	function cnt() {
		if (!S || !S.st) return;
		const ce = S.el.querySelector('[data-mn="cnt"]');
		if (!ce) return;
		if (!mine2On()) {
			if (!ce.hidden) {
				ce.hidden = true;
				ce.textContent = "";
			}
			return;
		}
		const w = S.hw != null ? S.hw : S.st.working || 0,
			all = S.here != null ? Math.max(S.here, w) : w + (S.nOthers || 0);
		if (!ce.firstChild)
			ce.innerHTML =
				'<b data-cn="ht" title="Сейчас в шахте">👥 <i>В шахте </i><span class="mn-num" data-cn="here"></span></b><b data-cn="wt" title="Сейчас копают">⛏ <i>копают </i><span class="mn-num" data-cn="w"></span></b><b title="Гуляют по шахте (с открытым сайтом)" data-cn="gt" hidden>🚶 <i>гуляют </i><span class="mn-num" data-cn="g"></span></b>';

		const fl = S.st.deep != null ? ` На этом этаже: ${S.st.working || 0}.` : "";
		const ht =
				(S.hm
					? `Были в шахте за последние ${S.hm} мин (вся шахта).`
					: "Сейчас в шахте (вся шахта).") + fl,
			hb = ce.querySelector('[data-cn="ht"]');
		if (hb && hb.title !== ht) hb.title = ht;
		const wt = "Сейчас копают (вся шахта)." + fl,
			wb = ce.querySelector('[data-cn="wt"]');
		if (wb && wb.title !== wt) wb.title = wt;

		const g = S.hg != null ? Math.max(0, S.hg - 1) : S.nOthers || 0,
			gt = ce.querySelector('[data-cn="gt"]');

		const vals = [
				["here", all],
				["w", w],
				["g", g],
			],
			el = (k) => ce.querySelector(`[data-cn="${k}"]`);
		const diff =
			(gt && gt.hidden !== !g) ||
			vals.some(([k, v]) => {
				const e = el(k);
				return e && e.dataset.v !== String(v);
			});
		if (diff) {
			const wait = (S.cntAt || 0) + CNT_MS - Date.now();
			if (wait > 0) {
				if (!S.cntT) {
					const me0 = S;
					S.cntT = setTimeout(() => {
						if (S !== me0) return;
						S.cntT = 0;
						cnt();
					}, wait);
				}
			} else {
				S.cntAt = Date.now();
				if (gt && gt.hidden !== !g) gt.hidden = !g;
				for (const [k, v] of vals) {
					const e = el(k);
					if (e && e.dataset.v !== String(v)) {
						e.dataset.v = String(v);
						e.textContent = String(v);
						e.setAttribute("aria-label", String(v));
					}
				}
			}
		}
		ce.hidden = false;
	}
	function panel() {
		if (!S || !S.st || S.failed) return;
		const st = S.st,
			me = S.me || {
				day: 0,
				cap: 480,
				bag: { c: 0, r: {} },
				mx: { lv: 1, xp: 0, need: 60 },
				wk: 0,
			};
		const setT = (sel, t) => {
			const e = S.el.querySelector(sel);
			if (e && e.textContent !== t) e.textContent = t;
		};

		setT(
			'[data-mn="name"]',
			st.name && st.id !== "home" ? `Шахта · ${st.name}` : "Шахта",
		);
		setT(
			'[data-mn="floor"]',
			`${stars(st.danger)} ${BIO_RU[st.biome] || ""} · этаж ${st.n}${st.rec > st.n ? ` · рекорд ${st.rec}` : ""}`,
		);

		{
			const fe = S.el.querySelector('[data-mn="floor"]'),
				cb = fe.parentNode.querySelector(".mn-coal"),
				on = !!(S.F && S.F.coal && S.F.coal.length);
			if (on && !cb)
				fe.insertAdjacentHTML(
					"afterend",
					'<span class="mn-coal" title="На этом этаже - кучи угля, вокруг каждой жила угольных камней (5-9). Такой этаж - один из каждых десяти">Угольный этаж</span>',
				);
			else if (!on && cb) cb.remove();
		}
		const left = st.reset - Date.now(),
			dd = Math.floor(left / 864e5),
			hh = Math.floor((left % 864e5) / 36e5);
		setT(
			'[data-mn="reset"]',
			left > 0 ? `новая шахта через ${dd ? dd + " д " : ""}${hh} ч` : "",
		);
		cnt();
		const bag = me.bag || { c: 0, r: {} },
			res = resList(bag);

		const bagHtml = buyerOn()
			? `<div class="mn-bag mb-earn"><div class="mn-bag-c"><span>Оплата за работу — сразу в кошелёк, после каждого камня</span><b>${coins(bag.cx != null ? bag.cx : bag.c)}</b></div>${res.length ? `<p class="mb-wait">Сумка и склад полны — ждёт в шахте: ${res.map(([k, n, p]) => `${esc(resName(k))} ${esc(qty(n, p))}`).join(", ")}. Освободи место — перенесём сами.</p>` : ""}</div>`
			: `<div class="mn-bag"><div class="mn-bag-c"><span>Заработок — выдаст ${esc(tx().seller.split(" ")[0].toLowerCase())}</span><b>${coins(bag.cx != null ? bag.cx : bag.c)}</b></div>${res.length ? `<ul class="mn-res">${res.map(([k, n, p]) => `<li><i style="background:${(CW().RES || {})[k] || "#999"}"></i><span>${esc(resName(k))}</span><b>${esc(qty(n, p))}</b></li>`).join("")}</ul>${res.some(([, , p]) => p) ? '<p class="muted mn-osk">100 осколков - 1 шт.; скупщик сложит сам и примет остаток</p>' : ""}` : `<p class="muted">${esc(tx().bagEmpty)}</p>`}</div>`;
		const mx = me.mx || { lv: 1, xp: 0, need: 60 };
		const q = me.q || { d: [], w: [] };

		if (S.claimed && Date.now() - S.claimed > 60000) S.claimed = 0;

		const qc = qcOf(me),
			qcReady = !!(qc && qc.done && qc.ok && !qc.cl);
		const canClaim =
			!S.claimed && ([...q.d, ...q.w].some((x) => x.done && !x.cl) || qcReady);

		const quests = mine2On() ? questsHtml(q, qc) : questsOld(q, qc, canClaim);
		const have = lampHave();
		wgDraw(me, mx, bag, res, canClaim);
		hatLine(have);
		pinDraw();

		const body = !S.npcOpen
			? ""
			: S.npcOpen === "lift" && V3()
				? liftHtml(st)
				: S.npcOpen === "drill" && V3()
					? drillHtml(st)
					: S.npcOpen === "quests"
						? boardHtml(st, me, quests)
						: S.npcOpen === "log"
							? `<div class="mn-npc-p mn-log"><h3 class="h3">Твой журнал в шахте</h3><ul>${
									myLog()
										.slice(0, 12)
										.map((e) => `<li>${esc(e.t)}</li>`)
										.join("") ||
									'<li class="muted">Пока пусто - здесь будут твои камни, добыча, находки и вклады</li>'
								}</ul></div>`
							: S.npcOpen === "bag"
								? bagPanel()
								: S.npcOpen === "buy" && buyerOn()
									? buyerHtml(st)
									: S.npcOpen === "lamp" && pickOn()
										? supHtml(st, have)
										: S.npcOpen === "lamp"
											? `<div class="mn-npc-p"><h3 class="h3">Фонарщик</h3>${lampOn() ? "<p>«Каска шахтёра» на тебе — фонарь светит на любом этаже.</p>" : !have && S.lampBought && Date.now() - S.lampBought < 60000 ? "<p>Каска куплена — несу в сумку, через пару секунд появится.</p>" : have ? `<p>«Каска шахтёра» у тебя в сумке — надень её, и фонарь загорится.</p><div class="mn-btns"><button type="button" class="btn primary" data-mn-wear="${esc(have.uid)}">Надеть каску</button></div>` : `<p>Дальше — темнота: с ${st.darkFrom || 5}-го этажа без света ничего не видно и копать нельзя. «Каска шахтёра» — обычная вещь в сумку: надел — светит; можно снять и убрать на склад.</p><div class="mn-btns"><button type="button" class="btn primary" data-mn-lamp>Купить каску — ${X.money ? X.money(st.lampPrice || 150) : st.lampPrice}</button></div>`}</div>`
											: `<div class="mn-npc-p"><h3 class="h3">${esc(tx().seller)}</h3><p>${esc(tx().hello)}</p>${bagHtml}<div class="mn-btns"><button type="button" class="btn primary" data-mn-sell>Сдать всё</button></div>${quests}</div>`;
		const el = S.el.querySelector('[data-mn="body"]'),
			win = S.el.querySelector(".mn-win");
		if (!body) {
			if (!win.hidden) {
				win.hidden = true;
				el.innerHTML = "";
				S.bodyHtml = "";
				S.bodyParts = null;
			}
			buyInv();
			return;
		}

		if (body === S.bodyHtml && el.firstChild && !win.hidden) {
			buyInv();
			return;
		}
		const first = win.hidden;
		win.hidden = false;
		win.dataset.k = S.npcOpen;

		const tp = document.createElement("template");
		tp.innerHTML = body;
		const nw = [...tp.content.children],
			parts = nw.map((n) => n.outerHTML);
		if (
			!first &&
			S.bodyParts &&
			el.children.length === S.bodyParts.length &&
			parts.length === S.bodyParts.length &&
			el.firstChild
		)
			nw.forEach((n, k) => {
				if (
					parts[k] !== S.bodyParts[k] &&
					!(S.npcOpen === "buy" && buyMorph(el.children[k], n))
				)
					el.children[k].replaceWith(n);
			});
		else el.innerHTML = body;
		S.bodyHtml = body;
		S.bodyParts = parts;
		if (first) win.scrollTop = 0;
		const b1 = el.querySelector("[data-mn-sell]");
		if (b1) b1.onclick = sell;
		el.querySelectorAll("[data-mn-back]").forEach((b) => {
			b.onclick = () => winClose();
		});
		el.querySelectorAll("[data-mn-bt]").forEach((b) => {
			b.onclick = () => {
				S.qTab = b.dataset.mnBt;
				S.bodyHtml = "";
				panel();
			};
		});

		el.querySelectorAll("[data-mn-qx]").forEach((b) => {
			b.onclick = () => {
				const id = b.dataset.mnQx;
				if (!S.qOpen) S.qOpen = new Set();
				if (S.qOpen.has(id)) S.qOpen.delete(id);
				else S.qOpen.add(id);
				S.bodyHtml = "";
				panel();
			};
		});
		const b5 = el.querySelector("[data-mn-claim]");
		if (b5)
			b5.onclick = async () => {
				if (S.busyOp) return;
				S.busyOp = 1;
				b5.disabled = true;
				const r = await X.api("/api/mineClaim", { c: C });
				if (!S) return;
				S.busyOp = 0;
				if (r && r.ok) {
					S.claimed = Date.now();
					tip("Награда за поручения — монеты придут через пару секунд");
					if (S.me && S.me.q) {
						for (const x of [...S.me.q.d, ...S.me.q.w]) if (x.done) x.cl = 1;
						const qc0 = qcOf(S.me);
						if (S.me.q.c && qc0 && qc0.done && qc0.ok) S.me.q.c.cl = 1;
					}
					panel();
				} else {
					b5.disabled = false;
					tip((r && r.error) || "Не получилось");
				}
			};
		el.querySelectorAll("[data-mn-wear]").forEach(
			(b) => (b.onclick = () => wear(b, b.dataset.mnWear)),
		);
		el.querySelectorAll("[data-mn-off]").forEach(
			(b) => (b.onclick = () => takeOff(b, b.dataset.mnOff)),
		);
		const b6 = el.querySelector("[data-mn-lamp]");
		if (b6)
			b6.onclick = async () => {
				if (S.busyOp) return;
				S.busyOp = 1;
				b6.disabled = true;
				const r = await X.api("/api/mineLamp", { c: C });
				if (!S) return;
				S.busyOp = 0;
				if (r && r.ok) {
					S.lampBought = Date.now();
					tip("«Каска шахтёра» в сумке — сейчас появится, тогда надень её");
					panel();
				} else {
					b6.disabled = false;
					tip((r && r.error) || "Не получилось");
				}
			};
		buyBind(el);
		supBind(el);
		liftBind(el);
		winPlace();
	}

	function qcOf(me) {
		const c = me && me.q && me.q.c;
		if (!c) return null;
		const sh = S && S.st && S.st.qc;
		if (sh && (c.w == null || sh.w === c.w))
			return { ...c, p: sh.p, n: sh.n, ...(sh.done ? { done: 1 } : {}) };
		return c.p != null ? c : { ...c, p: 0, n: 0 };
	}
	const pc1 = (a, b) => (b ? Math.min(100, (a / b) * 100) : 100).toFixed(1);
	function wgDraw(me, mx, bag, res, canClaim) {
		const el = S.el.querySelector(".mn-wg");
		if (!el) return;
		const phone = window.LGSiteUi.is("phone"),
			open = !phone || !!S.wgOpen,
			earn = coins(bag.cx != null ? bag.cx : bag.c),
			qc = qcOf(me);
		const row = (k, v, bar, cls) =>
			`<div class="mn-wg-r${cls ? " " + cls : ""}"><span>${k}</span><b>${v}</b>${bar != null ? `<i class="mn-wg-b"><i style="width:${bar}%"></i></i>` : ""}</div>`;
		let h = phone
			? `<button type="button" class="mn-wg-t" data-wg="tog" aria-expanded="${open}"><span>${earn}</span><span>ур. ${mx.lv}</span>${canClaim ? '<em class="mn-wg-dot" aria-label="награда готова"></em>' : ""}<i aria-hidden="true"></i></button>`
			: "";
		if (open) {
			h += '<div class="mn-wg-in">';
			h += row(
				buyerOn() ? "Заработок" : "Заработок <small>у скупщика</small>",
				earn,
				null,
				"mn-wg-e",
			);
			if (res.length && buyerOn())
				h += `<p class="mn-wg-w">Сумка и склад полны - руда ждёт в шахте</p>`;
			else if (res.length)
				h += `<p class="mn-wg-w">В рудной сумке: ${res
					.slice(0, 3)
					.map(([k, n, p]) => `${esc(resName(k))} ${esc(qty(n, p))}`)
					.join(", ")}${res.length > 3 ? "…" : ""}</p>`;
			h += row(
				"Сегодня",
				`${mmss(me.day)}${me.cap > 0 ? ` <small>из ${mmss(me.cap)}</small>` : ""}`,
				me.cap > 0 ? pc1(me.day, me.cap) : null,
				"mn-wg-day",
			);
			h += row(esc(tx().mast), `ур. ${mx.lv}`, pc1(mx.xp, mx.need), "mn-wg-xp");
			if (qc)
				h += row(
					"Общее поручение",
					`${qc.p} <small>из ${qc.g}</small>`,
					pc1(qc.p, Math.max(1, qc.g)),
					"mn-wg-qc",
				);
			h += `<div class="mn-wg-a"><button type="button" data-wg="quests" data-mn-quests>Поручения${canClaim ? '<em class="mn-wg-dot" aria-label="награда готова"></em>' : ""}</button><button type="button" data-wg="bag" data-mn-bag>Сумка</button>${S.mchatOn && mine2On() ? "" : '<button type="button" data-wg="log" data-mn-log>Журнал</button>'}</div></div>`;
		}
		if (h === S.wgH) return;
		S.wgH = h;
		el.innerHTML = h;
		el.classList.toggle("open", open);
	}
	function wgClick(e) {
		const b = e.target.closest("[data-wg]");
		if (!b || !S) return;
		const k = b.dataset.wg;
		if (k === "tog") {
			S.wgOpen = !S.wgOpen;
			S.wgH = "";
			panel();
			return;
		}
		if (k === "quests") {
			if (S.npcOpen === "quests") winClose();
			else {
				S.qTab = "q";
				openPanel("quests");
			}
			return;
		}
		if (k === "log") {
			if (S.npcOpen === "log") winClose();
			else openPanel("log");
			return;
		}
		if (k === "bag") {
			if (S.wgOpen && window.LGSiteUi.is("phone")) {
				S.wgOpen = false;
				S.wgH = "";
				panel();
			}
			if (mine2On()) bag2();
			else if (S.npcOpen === "bag") winClose();
			else openPanel("bag");
		}
	}

	function hatLine(have) {
		const el = S.el.querySelector(".mn-hat");
		if (!el) return;
		const need = S.st.n >= (S.st.darkFrom || 5) && !lampOn();
		const t = !need
			? ""
			: have
				? "Нужна каска шахтёра - она в сумке, надень её"
				: `Нужна каска шахтёра - купи у ${pickOn() ? "Снабженца" : "Фонарщика"}`;
		if (el.textContent !== t) el.textContent = t;
		if (el.hidden !== !t) el.hidden = !t;
	}

	function boardHtml(st, me, quests) {
		const tab = S.qTab === "hon" ? "hon" : "q";
		const tabs = `<div class="sp-tabs mn-bt" role="tablist" aria-label="Доска">${[
			["q", "Поручения"],
			["hon", "Доска почёта"],
		]
			.map(
				([k, t]) =>
					`<button type="button" role="tab" class="sp-tab" data-mn-bt="${k}" aria-selected="${tab === k}">${t}</button>`,
			)
			.join("")}</div>`;

		if (tab === "q")
			return `<div class="mn-npc-p"><h3 class="h3">Поручения скупщика</h3>${tabs}${mine2On() ? "" : `<p class="muted">Награду выдаёт ${esc(tx().seller)} - «Забрать награду», когда поручение готово.</p>`}${quests}</div>`;
		const ml = X.login(),
			top = st.top || [],
			k = top.findIndex(([l]) => l === ml),
			h0 = st.hist && st.hist[0];
		const row = (l, u, i) =>
			`<li class="${l === ml ? "me" : ""}"><span>${i + 1}</span><b>${esc(l === ml ? l + " (ты)" : l)}</b><em>${u}</em></li>`;
		return `<div class="mn-npc-p mn-hon"><h3 class="h3">Доска почёта</h3>${tabs}
      <div class="mn-hon-me"><span>Твой вклад за неделю</span><b>${me.wk || 0}</b>${k >= 0 ? `<small>${k + 1}-е место</small>` : ""}</div>
      <h4>Лучшие копатели недели</h4><ol class="mn-bd-top">${top.map(([l, u], i) => row(l, u, i)).join("") || '<li class="muted">Пока никто не копал</li>'}</ol>
      ${
				h0
					? `<h4>Прошлая неделя - до этажа ${h0.floor}</h4><ol class="mn-bd-top">${(
							h0.top || []
						)
							.slice(0, 3)
							.map((x, i) => row(x.l, x.u, i))
							.join("")}</ol>`
					: ""
			}
      <p class="muted">Вклад - сколько работы вложил герой. Каждую субботу в 18:00 - новая шахта.</p></div>`;
	}

	function questsOld(q, qc, canClaim) {
		const qli = (x) =>
			`<li class="${x.done ? "done" : ""}${x.cl ? " cl" : ""}"><span>${esc(x.t)}${x.h ? `<small style="display:block;font-size:11px;opacity:.7">Где: ${esc(x.h)}</small>` : ""}</span><b>${x.cl ? "получено" : x.done ? "готово" : `${x.p} / ${x.g}`}</b><em>+${X.money ? X.money(x.c) : x.c}</em></li>`;
		const qcHtml = qc
			? `<h4>Общее поручение шахты</h4><div class="mn-qc${qc.done ? " done" : ""}"><span class="mn-qt">${esc(qc.t)}<small>Награда +${X.money ? X.money(qc.c) : qc.c} каждому, кто вложил от ${qc.min}. Твой вклад: ${qc.me}${qc.ok ? " - хватает" : ` - ещё ${Math.max(0, qc.min - qc.me)}`}. Участников: ${qc.n || 0}</small></span><span class="mn-qx"><b class="mn-qp">${qc.cl ? "получено" : qc.done ? (qc.ok ? "готово" : "выполнено") : `${qc.p} / ${qc.g}`}</b></span><span class="m2-mini"><i style="width:${Math.min(100, (qc.p / Math.max(1, qc.g)) * 100).toFixed(1)}%"></i></span></div>`
			: "";
		return `<div class="mn-q"><h4>Поручения на сегодня</h4><ul>${q.d.map(qli).join("")}</ul><h4>Поручения недели</h4><ul>${q.w.map(qli).join("")}</ul>${qcHtml}${canClaim ? '<button type="button" class="btn primary" data-mn-claim>Забрать награду</button>' : ""}</div>`;
	}

	const qPlain = (n) =>
		String(X.money ? X.money(n) : n)
			.replace(/<[^>]+>/g, "")
			.replace(/\s+/g, " ")
			.trim();

	function qCoins(n, cls, lbl = "награда") {
		const P = window.LGSiteUi.moneyParts
			? window.LGSiteUi.moneyParts(n)
			: [["b", Math.max(0, Math.floor(+n || 0))]];
		return `<span class="mn-qc2${cls ? " " + cls : ""}" role="img" aria-label="${esc(lbl + " " + qPlain(n))}" title="${esc(qPlain(n))}">${P.map(([k, v]) => `<i class="mn-cn ${k}"></i>${v}`).join(" ")}</span>`;
	}

	const qUp = (s) => s.charAt(0).toUpperCase() + s.slice(1);
	function qSplit(t) {
		const cm =
			/^Общее поручение шахты: всей шахтой наработайте (\d+) за неделю$/.exec(
				String(t || ""),
			);
		if (cm)
			return [
				`Всей шахтой: наработать ${(+cm[1]).toLocaleString("ru-RU").replace(/\s/g, " ")}`,
				"За неделю",
			];
		t = qUp(String(t || "").replace(/^Общее поручение шахты:\s*/, ""));
		const k = t.indexOf(" - "),
			tail = k > 0 ? t.slice(k + 3) : "";
		if (tail && !/\d/.test(tail)) return [t.slice(0, k), qUp(tail)];
		const c = t.indexOf(": "),
			head = c > 0 ? t.slice(0, c) : "",
			rest = c > 0 ? t.slice(c + 2) : "";
		if (head && !/\d/.test(head) && rest.length > 28) return [head, qUp(rest)];
		return [t, ""];
	}
	const qPct = (p, g) =>
		Math.max(
			0,
			Math.min(100, ((+p || 0) / Math.max(1, +g || 0)) * 100),
		).toFixed(1);

	function qRow(id, t, more, p, g, c, st) {
		const [nm, tail] = qSplit(t),
			open = !!(S.qOpen && S.qOpen.has(id)),
			det = [tail, ...more].filter(Boolean);
		const tag =
			st === "ok"
				? '<b class="mn-qs-st">готово</b>'
				: st === "cl"
					? '<b class="mn-qs-st">получено</b>'
					: st === "no"
						? '<b class="mn-qs-st">выполнено</b>'
						: `<b class="mn-qs-n">${p} / ${g}</b>`;
		const bar =
			st === "cl"
				? ""
				: `<span class="mn-qs-bar" aria-hidden="true"><i style="transform:scaleX(${(qPct(st === "go" ? p : g, g) / 100).toFixed(3)})"></i></span>`;

		return `<li class="mn-qs-r ${st}${open ? " open" : ""}"><button type="button" class="mn-qs-h" data-mn-qx="${esc(id)}" aria-expanded="${open}" title="${esc(nm)}"><span class="mn-qs-t">${esc(nm)}</span>${qCoins(c, st === "cl" ? "mute" : "")}${bar}${tag}</button>${open && det.length ? `<p class="mn-qs-d">${det.map(esc).join("<br>")}</p>` : ""}</li>`;
	}
	function questsHtml(q, qc) {
		const ord = { ok: 0, go: 1, no: 2, cl: 3 },
			stOf = (x) => (x.cl ? "cl" : x.done ? "ok" : "go");

		const sec = (title, list, pre) => {
			const rows = list
				.map((x, k) => ({ x, k, s: stOf(x) }))
				.sort((a, b) => ord[a.s] - ord[b.s] || a.k - b.k);
			const n = list.filter((x) => x.done).length;
			return `<section class="mn-qs-s"><h4>${title}<small>${n} из ${list.length}</small></h4><ul>${rows.map(({ x, s }) => qRow(pre + (x.id || x.t), x.t, x.h ? [`Где: ${x.h}`] : [], x.p, x.g, x.c, s)).join("")}</ul></section>`;
		};
		let cHtml = "";
		if (qc) {
			const s = qc.cl ? "cl" : qc.done ? (qc.ok ? "ok" : "no") : "go";

			const info = `Награда - каждому с вкладом от ${qc.min}; твой вклад ${qc.me}${qc.ok ? " - хватает" : ` - ещё ${Math.max(0, qc.min - qc.me)}`}; участников ${qc.n || 0}`;
			cHtml = `<section class="mn-qs-s mn-qs-c"><h4>Общее поручение шахты</h4><ul>${qRow("#c", qc.t, [], qc.p, qc.g, qc.c, s)}</ul><p class="mn-qs-i${qc.ok ? " ok" : ""}">${esc(info)}</p></section>`;
		}
		const ready = [...q.d, ...q.w].filter((x) => x.done && !x.cl),
			cOk = !!(qc && qc.done && qc.ok && !qc.cl);
		const nR = ready.length + (cOk ? 1 : 0),
			sum = ready.reduce((a, x) => a + (+x.c || 0), 0) + (cOk ? +qc.c || 0 : 0);
		const claim =
			!S.claimed && nR
				? `<div class="mn-qs-cl"><span class="mn-qs-cn" title="Готово ${nR} ${nR === 1 ? "поручение" : nR < 5 ? "поручения" : "поручений"}">Готово: ${nR}</span>${qCoins(sum)}<button type="button" class="btn primary" data-mn-claim>Забрать${nR > 1 ? " всё" : ""}</button></div>`
				: `<p class="mn-qs-cl0">Награду выдаёт ${esc(tx().seller)}, когда поручение готово - кнопка «Забрать» появится здесь.</p>`;
		return `<div class="mn-qs">${claim}${sec("На сегодня", q.d, "d:")}${sec("На неделю", q.w, "w:")}${cHtml}</div>`;
	}

	const WIN_AT = { buy: "buyer", lamp: "lamp", quests: "board", lift: "lift" };
	function winAnchor(kind) {
		if (kind === "drill") {
			const d = S.st && (S.st.drills || []).find((x) => x[0] === S.drillK);
			if (!d || !S.m3) return null;
			const p = S.m3.G.cellXY(d[2]);
			return { x: p.cx, up: p.y - (96 + Math.max(1, d[4]) * 26), dn: p.y + 34 };
		}
		const f = WIN_AT[kind] && GX().FOOT.find((x) => x.k === WIN_AT[kind]);
		if (!f) return null;
		return { x: (f.s[0] + f.s[2]) / 2, up: f.s[1] - 10, dn: f.z + 14 };
	}
	function winPlace() {
		const m = S && S.el.querySelector(".mn-win");
		if (!m || m.hidden) return;
		const vw = S.view.clientWidth,
			vh = S.view.clientHeight,
			top0 = Math.max((S.topPad || 0) + 4, 8),
			phone = vw < 721,
			cap = phone ? vh * 0.62 : 560;
		const a = S.npcOpen ? winAnchor(S.npcOpen) : null;
		const ax = a ? S.tx + a.x * S.z : vw / 2,
			up = a ? S.ty + a.up * S.z - 14 : 0,
			dn = a ? S.ty + a.dn * S.z + 12 : 0;
		const vis = !!a && ax > 0 && ax < vw && dn > 0 && up < vh;

		const roomUp = up - top0,
			roomDn = vh - 8 - dn,
			above = !vis || roomUp >= roomDn,
			room =
				vis && Math.max(roomUp, roomDn) >= 260
					? Math.max(roomUp, roomDn)
					: vh - top0 - 12;
		m.style.maxHeight = Math.max(180, Math.min(cap, room)) + "px";
		const w = m.offsetWidth,
			h = m.offsetHeight;
		let x, y;
		if (!vis) {
			x = (vw - w) / 2;
			y = Math.max(top0, (vh - h) / 2);
		} else {
			y = Math.max(top0, Math.min(vh - h - 8, above ? up - h : dn));
			x = ax - w / 2;
		}
		x = Math.max(8, Math.min(vw - w - 8, x));
		m.style.transform = `translate(${x.toFixed(0)}px, ${y.toFixed(0)}px)`;
		m.classList.toggle("dn", vis && !above);
		m.classList.toggle("tl", vis);
		m.style.setProperty(
			"--tail",
			Math.max(18, Math.min(w - 18, ax - x)).toFixed(0) + "px",
		);
	}
	function winClose() {
		if (!S) return;
		if (S.npcOpen === "buy" && B.lines.size && !B.wait) B.lines.clear();
		S.npcOpen = false;
		S.npcAt = null;
		panel();
	}

	const tipOff = () => {
		try {
			if (X.tipHide) X.tipHide();
		} catch (e) {}
	};

	const bagData = () => {
		const h = X.hero() || {};
		return {
			hero: h,
			items: h.items || [],
			...(+h.ob > 0 ? { obCap: +h.ob } : {}),
			pins: X.pins ? X.pins(h) : [],
		};
	};
	function bag2() {
		if (!S) return;
		let w = S.el.querySelector(".mn-inv2-w");
		if (w) {
			bagClose();
			return;
		}
		if (!window.LGInventory) {
			S.npcOpen = "bag";
			panel();
			return;
		}
		w = document.createElement("div");
		w.className = "mn-inv2-w";
		w.innerHTML = '<section class="mn-inv2" aria-label="Сумка"></section>';
		S.el.appendChild(w);
		S.el.classList.add("bag-on");

		{
			let b = 0;
			for (const e of S.el.querySelectorAll(".mn-wg, .mn-pkpin")) {
				const r = e.getBoundingClientRect();
				if (r.height) b = Math.max(b, r.bottom);
			}
			const t0 = S.el.getBoundingClientRect().top;
			if (b && !window.LGSiteUi.is("phone"))
				w.style.setProperty("--mn-bagt", Math.round(b - t0 + 6) + "px");
		}
		S.bag = window.LGInventory.mount(w.firstChild, {
			variant: "compact",
			mode: "equip",
			data: bagData(),
			actions: {
				equip: (uid) => wear(null, uid),
				unequip: (slot) => takeOff(null, slot),
				close: () => bagClose(),
			},
			options: {
				title: "Сумка",
				role: "dialog",
				storeKey: "lgMineBag",
				esc: false,
				say: (t) => tip(t),
				art: X.art ? (it) => X.art(it) : null,
				figure: (h) => {
					const st = h.stats || {},
						hpMax = +st.hp || 0,
						hpNow = h.hpNow != null ? +h.hpNow : hpMax;
					return still(
						X.doodle(
							X.login(),
							X.heroLook ? X.heroLook(h) : h,
							hpMax && hpNow / hpMax < 0.3 ? "hurt" : "stern",
							h.ghost ? undefined : "battle",
						),
					);
				},
				money: (n) => (X.money ? X.money(n) : String(n)),
				cardTip: X.cardTip ? (el, it) => X.cardTip(el, it, X.hero()) : null,
				tipHide: tipOff,
				pinTip: X.pinTip ? (el, p) => X.pinTip(el, p) : null,
				labels: {
					noUse: "Во вкладке «Персонаж»",
					cantUse:
						"Это не надеть - еда, зелья и склад во вкладке «Персонаж» и в «Городе»",
				},
			},
		});
		try {
			bagDeco(w);
		} catch (e) {
			console.error("[шахта] окно сумки: перенос / свернуть", e);
		}
	}
	function bagClose() {
		const w = S && S.el.querySelector(".mn-inv2-w");
		if (!w) return;
		if (S.bag) {
			try {
				S.bag.destroy();
			} catch (e) {}
			S.bag = null;
		}
		tipOff();
		w.remove();
		S.el.classList.remove("bag-on", "bag-fold");
	}
	function bagDraw() {
		if (S && S.bag) S.bag.update(bagData());
	}

	const B = { lines: new Map(), wait: null, said: null };

	const SH = 100;
	const oreItems = () => {
		const h = (X && X.hero && X.hero()) || {};
		return (h.items || []).filter((it) => it && it.qty && it.q > 0);
	};
	const bpOf = () => (S && S.st && S.st.bp) || {};
	const priceOf = (lines) => {
		const P = bpOf();
		let t = 0;
		for (const [uid, q] of lines) {
			const it = oreItems().find((x) => x.uid === uid);
			if (it) t += q * (+P[it.res] || 0);
		}
		return Math.floor(t / 100 + 1e-9);
	};

	function buyTidy() {
		const its = new Map(oreItems().map((it) => [it.uid, it]));
		for (const [uid, q] of [...B.lines]) {
			const it = its.get(uid);
			if (!it) B.lines.delete(uid);
			else if (q > it.q) B.lines.set(uid, it.q);
		}
	}
	const oskQ = (q) =>
		window.LGInventory && window.LGInventory.oreQty
			? window.LGInventory.oreQty(q)
			: qty(Math.floor(q / 100), q % 100);
	const val = (x) => {
		const v = Math.round(x * 10) / 10;
		return String(v).replace(".", ",");
	};
	function buyerHtml(st) {
		buyTidy();
		const P = st.bp || {},
			its = oreItems(),
			lines = [...B.lines]
				.map(([uid, q]) => [its.find((x) => x.uid === uid), q])
				.filter(([it]) => it),
			price = priceOf(B.lines),
			wait = !!B.wait;

		const row = ([it, q]) => {
			const mx = Math.floor(it.q / SH),
				n = Math.floor(q / SH);
			const num =
				mx >= 1
					? `<span class="mb-num"><button type="button" class="mb-nb" data-mb-d="-1"${q <= SH || wait ? " disabled" : ""} aria-label="Меньше на 1 шт.">−</button><input type="text" inputmode="numeric" class="mb-ni" data-mb-n value="${n}"${wait ? " disabled" : ""} aria-label="Сколько штук: ${esc(it.name)}, есть ${mx} шт." title="Целых штук на прилавке (есть ${mx})"><button type="button" class="mb-nb" data-mb-d="1"${(n + 1) * SH > it.q || wait ? " disabled" : ""} aria-label="Больше на 1 шт.">+</button></span>`
					: "";
			return (
				`<li class="mb-ln" data-mb-uid="${esc(it.uid)}"><span class="mb-ic">${X.art ? X.art(it) : ""}</span><span class="mb-nm"><b>${esc(it.name)}</b><small>${esc(oskQ(q))}${q < it.q ? ` из ${esc(oskQ(it.q))}` : ""}</small></span><em class="mb-v" title="Столько это стоит у скупщика">≈ ${val((q * (+P[it.res] || 0)) / 100)}</em>` +
				`<span class="mb-lb">${num}<button type="button" class="btn ghost sm" data-mb-half${mx < 2 || wait ? " disabled" : ""} title="Половину кучки (целыми штуками)">½</button><button type="button" class="btn ghost sm" data-mb-all${q >= it.q || wait ? " disabled" : ""} title="Всю кучку">Всё</button><button type="button" class="btn ghost sm mb-x" data-mb-x${wait ? " disabled" : ""} aria-label="Убрать с прилавка">×</button></span></li>`
			);
		};
		const thx =
			B.said && !lines.length && Date.now() - B.said.at < 120000
				? B.said
				: null;
		const say = thx
			? esc(thx.t).replace(
					/\{coins\}/g,
					X.money ? X.money(thx.c) : String(thx.c),
				)
			: !lines.length
				? "Клади руду на прилавок - скажу, сколько дам."
				: price > 0
					? `Дам за это ${X.money ? X.money(price) : price}.`
					: "За это и медяка не дам - добавь ещё.";
		const pl = Object.entries(P)
			.filter(([k]) => its.some((it) => it.res === k))
			.sort((a, b) => b[1] - a[1]);

		const fine =
			window.matchMedia && window.matchMedia("(pointer: fine)").matches;
		return `<section class="m2-card mb-head"><div class="mb-who"><h3 class="h3">${esc(tx().seller)}</h3><p class="mb-say${thx ? " thx" : ""}" aria-live="polite">«${say}»</p></div></section>
      <section class="m2-card mb-counter${lines.length ? "" : " empty"}" data-igdrop="buy" aria-label="Прилавок скупщика"><div class="m2-k">Прилавок <small>${lines.length ? `${lines.length} ${lines.length === 1 ? "вид" : lines.length < 5 ? "вида" : "видов"}` : "пусто"}</small></div>
        ${lines.length ? `<ul class="mb-lines">${lines.map(row).join("")}</ul>` : `<p class="mb-empty">Нажми на руду ниже${fine ? " или перетащи сюда" : ""}</p>`}
        <div class="mb-deal"><div class="mb-offer${price > 0 ? " on" : ""}"><span>Даст:</span><b>${qCoins(price, "", "скупщик даст")}</b></div>${lines.length ? `<button type="button" class="btn ghost sm mb-back" data-mb-back${wait ? " disabled" : ""} title="Убрать всё с прилавка обратно в сумку">Забрать</button>` : ""}<button type="button" class="btn primary" data-mb-go${!(price > 0) || wait ? " disabled" : ""}>${wait ? "Считает…" : "Обменять"}</button></div></section>
      <section class="m2-card mb-inv"><div class="m2-k">Руда в сумке <small>100 осколков = 1 шт.</small></div><div class="mb-grid" data-mn-buyinv></div></section>
      <section class="mb-foot">${pl.length ? `<details class="mb-prices"><summary>Цены скупщика</summary><ul>${pl.map(([k, v]) => `<li><span>${esc(resName(k))}</span><b>${val(v)}</b></li>`).join("")}</ul><p class="muted">монет за 1 шт.; осколки - долей</p></details>` : ""}
        <p class="muted">Купленное скупщик отправит в казну Ратуши - на развитие города.</p><div class="mn-btns"><button type="button" class="btn ghost" data-mn-back>Назад</button></div></section>`;
	}

	const buyData = () => {
		const h = (X.hero && X.hero()) || {};
		const items = oreItems()
			.map((it) => {
				const on = B.lines.get(it.uid) || 0;
				return on ? { ...it, q: it.q - on } : it;
			})
			.filter((it) => it.q > 0);
		return { hero: h, items };
	};
	function buyInv() {
		if (!S) return;
		const host =
			S.npcOpen === "buy" && buyerOn()
				? S.el.querySelector("[data-mn-buyinv]")
				: null;
		if (!host) {
			if (S.buyInv) {
				try {
					S.buyInv.destroy();
				} catch (e) {}
				S.buyInv = null;
			}
			return;
		}
		if (S.buyInv && S.buyInv.el === host && host.__lgi) {
			S.buyInv.update(buyData());
			return;
		}
		if (S.buyInv) {
			try {
				S.buyInv.destroy();
			} catch (e) {}
			S.buyInv = null;
		}
		if (!window.LGInventory) {
			host.innerHTML =
				'<p class="muted">Сумка не загрузилась - обнови страницу.</p>';
			return;
		}
		S.buyInv = window.LGInventory.mount(host, {
			variant: "full",
			mode: "pick",
			data: buyData(),
			actions: { pick: (it) => buyPut(it), drop: (it) => buyPut(it) },
			options: {
				header: false,
				vitals: false,
				detail: false,
				doll: false,
				filters: false,
				sort: false,
				hint: false,
				art: X.art ? (it) => X.art(it) : null,
				storeKey: "lgMineBuy",
				dragRoot: S.el.querySelector(".mn-win"),
				dropSel: '[data-igdrop="buy"]',
				can: () => (B.wait ? "Скупщик считает прошлое" : true),
				labels: {
					empty: "Руды в сумке нет - накопай в шахте или забери со склада.",
				},
				cardTip: X.cardTip ? (c, it) => X.cardTip(c, it, X.hero()) : null,
				tipHide: tipOff,
				say: (t) => tip(t),
			},
		});
	}
	function buyPut(it) {
		if (!it || B.wait) return;
		const full = oreItems().find((x) => x.uid === it.uid);
		if (!full) return;
		if (!B.lines.has(it.uid) && B.lines.size >= 30) {
			tip("На прилавке не больше 30 видов за раз");
			return;
		}
		B.lines.set(it.uid, full.q);
		B.said = null;
		tipOff();
		S.bodyHtml = "";
		panel();
	}
	function buyBind(el) {
		buyInv();
		const box = el.querySelector(".mb-counter");
		if (!box) return;
		box.onclick = (e) => {
			const b = e.target.closest("button");
			if (!b || b.disabled) return;
			const li = b.closest("[data-mb-uid]"),
				uid = li && li.dataset.mbUid,
				it = uid && oreItems().find((x) => x.uid === uid);
			if (b.hasAttribute("data-mb-x") && uid) B.lines.delete(uid);
			else if (b.hasAttribute("data-mb-half") && it)
				B.lines.set(uid, Math.max(1, Math.floor(it.q / SH / 2)) * SH);
			else if (b.hasAttribute("data-mb-all") && it) B.lines.set(uid, it.q);
			else if (b.hasAttribute("data-mb-d") && it) {
				const q = B.lines.get(uid) || 0,
					up = b.dataset.mbD === "1",
					nv = up
						? (Math.floor(q / SH) + 1) * SH
						: Math.max(1, Math.ceil(q / SH) - 1) * SH;
				if (nv > it.q) {
					tip(`Больше нет: в сумке ${oskQ(it.q)}`);
					return;
				}
				B.lines.set(uid, nv);
			} else if (b.hasAttribute("data-mb-back")) {
				B.lines.clear();
				tip("Руда снова в сумке");
			} else if (b.hasAttribute("data-mb-go")) {
				buyGo();
				return;
			} else return;
			S.bodyHtml = "";
			panel();
		};

		box.oninput = (e) => {
			const f = e.target.closest("[data-mb-n]");
			if (!f || B.wait) return;
			const v = buyNum(f);
			f.classList.toggle("bad", !v.ok && f.value.trim() !== "");
			if (v.ok && v.q !== B.lines.get(v.uid)) {
				B.lines.set(v.uid, v.q);
				buyRedraw();
			}
		};
		box.onchange = (e) => {
			const f = e.target.closest("[data-mb-n]");
			if (!f || B.wait) return;
			const v = buyNum(f);
			if (!v.ok) {
				if (v.error) tip(v.error);
				const li = f.closest("[data-mb-uid]");
				f.value = String(
					Math.floor((B.lines.get(li && li.dataset.mbUid) || 0) / SH),
				);
				f.classList.remove("bad");
				return;
			}
			if (v.q !== B.lines.get(v.uid)) {
				B.lines.set(v.uid, v.q);
				S.bodyHtml = "";
				panel();
			}
		};
		box.onkeydown = (e) => {
			const f = e.target.closest("[data-mb-n]");
			if (f && e.key === "Enter") {
				e.preventDefault();
				f.blur();
			}
		};
	}

	function buyNum(f) {
		const li = f.closest("[data-mb-uid]"),
			uid = li && li.dataset.mbUid,
			it = uid && oreItems().find((x) => x.uid === uid);
		if (!it) return { ok: false, error: "" };
		const t = String(f.value || "").trim(),
			mx = Math.floor(it.q / SH);
		if (!t) return { ok: false, error: "" };
		if (!/^\d+$/.test(t))
			return { ok: false, error: "Только целые штуки: 1, 2, 5…" };
		const n = Number(t);
		if (n < 1)
			return { ok: false, error: "Хотя бы 1 шт. - или убери с прилавка (×)" };
		if (n > mx) return { ok: false, error: `Столько нет: в сумке ${mx} шт.` };
		return { ok: true, uid, q: n * SH };
	}

	function buyRedraw() {
		S.bodyHtml = "";
		panel();
	}

	function buyMorph(old, nw) {
		const f = document.activeElement;
		if (!f || !f.matches || !f.matches("[data-mb-n]") || !old.contains(f))
			return false;
		const same = (a, b) => {
			if (!b || a.nodeType !== b.nodeType || a.nodeName !== b.nodeName)
				return false;
			if (a === f || !a.contains(f)) return true;
			if (a.childNodes.length !== b.childNodes.length) return false;
			return [...a.childNodes].every((c, k) => same(c, b.childNodes[k]));
		};
		if (!same(old, nw)) return false;
		const attrs = (a, b, keep) => {
			for (const n of [...a.attributes])
				if (!b.hasAttribute(n.name) && !keep.includes(n.name))
					a.removeAttribute(n.name);
			for (const n of [...b.attributes])
				if (!keep.includes(n.name) && a.getAttribute(n.name) !== n.value)
					a.setAttribute(n.name, n.value);
		};
		const go = (a, b) => {
			attrs(a, b, a === f ? ["value", "class"] : []);
			if (a === f) return;
			[...a.childNodes].forEach((c, k) => {
				const d = b.childNodes[k];
				if (c === f || (c.nodeType === 1 && c.contains(f))) go(c, d);
				else c.replaceWith(d.cloneNode(true));
			});
		};
		go(old, nw);
		return true;
	}
	async function buyGo() {
		buyTidy();
		const lines = [...B.lines].filter(([, q]) => q > 0),
			price = priceOf(lines);
		if (!lines.length || !(price > 0) || B.wait) return;
		B.wait = { at: Date.now(), price };
		S.bodyHtml = "";
		panel();
		const r = await X.api("/api/mineBuy", { c: C, lines, price });
		if (!S) return;
		if (!r || !r.ok) {
			B.wait = null;
			tip((r && r.error) || "Не получилось");
			S.bodyHtml = "";
			panel();
			return;
		}
		B.wait.id = r.id;
		setTimeout(() => {
			if (S && B.wait && B.wait.id === r.id) {
				B.wait = null;
				S.bodyHtml = "";
				panel();
			}
		}, 25000);
	}

	function result(x) {
		const r = x && x.x;
		if (!r) return;
		if (r.op === "mineBuy") {
			const mineW = !!(B.wait && (!B.wait.id || B.wait.id === x.id));
			if (mineW) B.wait = null;
			if (x.ok) {
				B.lines.clear();
				if (r.t) B.said = { t: String(r.t), c: r.c || 0, at: Date.now() };
				if (S && (!r.t || S.npcOpen !== "buy"))
					tip(
						`${tx().seller.split(" ")[1] || "Скупщик"} заплатил ${r.c || 0} — монеты в кошельке, руда ушла в казну Ратуши`,
					);
				else if (window.LGMine && X && X.toast)
					X.toast(`Скупщик заплатил ${r.c || 0}`);
			} else if (S) tip((x.error || "Скупщик не взял") + (r.c ? "" : ""));
			if (S) {
				S.bodyHtml = "";
				panel();
			}
			return;
		}
		if (r.op === "minePick" || r.op === "mineOreBag") {
			supResult(x, r);
			return;
		}
		if (!x.ok && S) tip(x.error || "Не вышло");
	}

	const PK = { tab: "pick", wait: null, no: new Set(), ladder: false };

	function pickPay(s, opt, have, use) {
		const out = { ...(s || {}) },
			used = {};
		for (const [r, a] of Object.entries(opt || {})) {
			if (!use.includes(r)) continue;
			const t = a[0],
				k = +a[1] || 1,
				need = out[t] || 0,
				u = Math.min(
					Math.max(0, Math.floor(+have[r] || 0)),
					Math.ceil(need / k),
				);
			if (!(u > 0)) continue;
			out[t] = Math.max(0, need - u * k);
			if (!out[t]) delete out[t];
			out[r] = (out[r] || 0) + u;
			used[r] = u;
		}
		return { s: out, used };
	}
	const pkT = (x) => (x && Array.isArray(x.t) ? x.t : []);
	const pkName = (k) => {
		const t = pkT(S && S.me && S.me.pkx)[k];
		return t
			? t[0]
			: ((window.LGMineArt && window.LGMineArt.PICK_NAMES) || [])[k] || "Кирка";
	};
	const pkMul = (x, k) => {
		const t = pkT(x)[k];
		return t ? +t[1] : 1;
	};

	const pkIcon = (k, z) =>
		window.LGPickArt && window.LGPickArt.icon
			? window.LGPickArt.icon(k, z)
			: window.LGMineArt && window.LGMineArt.pickIcon
				? window.LGMineArt.pickIcon(k, z)
				: "";
	const bagIcon = (z) =>
		window.LGPickArt && window.LGPickArt.oreBag
			? window.LGPickArt.oreBag(z)
			: "🎒";
	const pct = (m) => `+${Math.round((m - 1) * 100)}%`;

	const oreHave = () => {
		const o = {};
		for (const it of oreItems()) o[it.res] = (o[it.res] || 0) + (+it.q || 0);
		return o;
	};
	const pcs = (q) => {
		const v = Math.floor(q) / 100;
		return (
			Number.isInteger(v) ? String(v) : v.toFixed(2).replace(/0$/, "")
		).replace(".", ",");
	};
	function supHtml(st, have) {
		const x = (S.me && S.me.pkx) || null,
			mx = (S.me && S.me.mx) || { lv: 1 },
			h = (X.hero && X.hero()) || {},
			money = Math.max(0, Math.floor(+h.money || 0));
		const tab = ["pick", "bag", "lamp"].includes(PK.tab) ? PK.tab : "pick",
			T = pkT(x),
			lv = x ? x.lv : 0,
			nx = lv + 1 < T.length ? lv + 1 : -1;
		const tabs = `<div class="sp-tabs" role="tablist" aria-label="Товары Снабженца">${[
			["pick", "Кирка"],
			["bag", "Рудная сумка"],
			["lamp", "Каска"],
		]
			.map(
				([k, t]) =>
					`<button type="button" role="tab" class="sp-tab" data-sp-tab="${k}" aria-selected="${tab === k}">${t}</button>`,
			)
			.join("")}</div>`;

		const row = (ic, name, hv, need, ok, hint, lbl = "нужно") =>
			`<li class="sp-req${ok ? " ok" : " no"}"><span class="sp-ri">${ic}</span><span class="sp-rn"><span class="sp-rt" title="${name}">${name}</span>${
				hint
					? `<small title="${String(hint)
							.replace(/<[^>]*>/g, "")
							.replace(/"/g, "&quot;")}">${hint}</small>`
					: ""
			}</span><b class="sp-rv"><em><i class="sp-rk" role="img" aria-label="${ok ? "хватает" : "не хватает"}">${ok ? "✓" : "✗"}</i>${lbl} ${need}</em><span>${hv}</span></b></li>`;
		const cIc = (n) => qCoins(n, "sp-mc", "монеты");
		const coinRow = (need) =>
			row(
				'<span class="sp-ix">●</span>',
				"Монеты",
				money >= need ? "хватает" : `есть ${cIc(money)}`,
				cIc(need),
				money >= need,
				"",
			);
		const mRow = (need) =>
			row(
				'<span class="sp-ix">⛏</span>',
				"Горное дело",
				`есть ур. ${mx.lv || 1}`,
				`ур. ${need}`,
				(mx.lv || 1) >= need,
				"",
			);
		let body = "";
		if (tab === "pick") {
			if (!x)
				body =
					'<p class="muted">Снабженец раскладывает товар - загляни через пару секунд.</p>';
			else {
				const cur = T[lv] || ["Кирка", 1];

				const now = `<div class="sp-now"><span class="sp-pic">${pkIcon(lv, 40)}</span><div><p class="sp-nm" title="${esc(cur[0])}">${esc(cur[0])}</p><p class="sp-mul">×${val(+cur[1])}${lv ? ` (${pct(+cur[1])})` : ""}</p></div></div>`;
				if (nx < 0)
					body = `<div class="sp-step">${now}</div><p class="sp-max">Лучше кирки не бывает - у тебя адамантитовая.</p>`;
				else {
					const N = T[nx],
						hv = oreHave(),
						wait = !!PK.wait,
						reqs = [];
					let ok = (mx.lv || 1) >= N[2];
					reqs.push(mRow(N[2]));
					if (N[3] > 0) {
						ok = ok && money >= N[3];
						reqs.push(coinRow(N[3]));
					}

					const opt = N[5] || {},
						can = Object.keys(opt).filter((r) => (hv[r] || 0) > 0),
						use = can.filter((r) => !PK.no.has(r)),
						pay = pickPay(N[4] || {}, opt, hv, use);

					const oreIc = (r) => {
						const it = oreItems().find((x) => x.res === r) || {
							id: "ore_" + r,
							res: r,
							qty: 100,
							q: 100,
							name: resName(r),
							slot: "material",
							mat: "ore",
						};
						let a = "";
						try {
							a = X.art ? X.art(it) : "";
						} catch (e) {
							console.warn("[шахта] значок руды", e);
						}
						if (!a && window.LGInventory && window.LGInventory.art)
							a = window.LGInventory.art(it);
						return a || "";
					};
					const Up = (r) =>
						esc(resName(r)[0].toUpperCase() + resName(r).slice(1));

					const cover = (r, q) =>
						Math.min(q * (+opt[r][1] || 1), (N[4] || {})[opt[r][0]] || 0);
					for (const [r, need] of Object.entries(pay.s)) {
						const got = hv[r] || 0,
							o2 = got >= need,
							base = (N[4] || {})[r] || 0;
						ok = ok && o2;
						if (pay.used[r]) {
							reqs.push(
								row(
									oreIc(r),
									Up(r),
									`есть ${pcs(Math.min(got, 1e9))}`,
									pcs(need),
									o2,
									`скидка: вместо ${pcs(cover(r, pay.used[r]))} ${esc(RESG[opt[r][0]] || resName(opt[r][0]))}`,
									"отдашь",
								),
							);
							continue;
						}
						const hint =
							base > need
								? `скидка закрыла ${pcs(base - need)} из ${pcs(base)}${o2 ? "" : ` · не хватает ${pcs(need - got)}`}`
								: !o2
									? `не хватает ${pcs(need - got)}`
									: "";
						reqs.push(
							row(
								oreIc(r),
								Up(r),
								`есть ${pcs(Math.min(got, 1e9))}`,
								pcs(need),
								o2,
								hint,
							),
						);
					}

					const cheap = can.length
						? `<div class="sp-cheap"><div class="m2-k">Можно дешевле</div>${can.map((r) => `<label class="sp-opt"><input type="checkbox" data-sp-use="${esc(r)}"${use.includes(r) ? " checked" : ""}${wait ? " disabled" : ""}><span class="sp-ri">${oreIc(r)}</span><span>${Up(r)}: 1 шт. вместо ${val(+opt[r][1])} шт. ${esc(RESG[opt[r][0]] || resName(opt[r][0]))} <small>есть ${pcs(hv[r])} - закроют ${pcs(cover(r, Math.floor(hv[r] || 0)))} из ${pcs((N[4] || {})[opt[r][0]] || 0)}</small></span></label>`).join("")}</div>`
						: "";
					body = `<div class="sp-step">${now}<span class="sp-arr" aria-label="улучшить до">→</span><div class="sp-up"><span class="sp-pic">${pkIcon(nx, 40)}</span><div><p class="sp-nm">${esc(N[0])}</p><p class="sp-gain">${pct(+N[1])}<small> к удару</small></p></div></div></div>
            <ul class="sp-reqs">${reqs.join("")}</ul>
            <div class="sp-go"><button type="button" class="btn primary" data-sp-pick="${nx}"${!ok || wait ? " disabled" : ""}>${wait ? "Снабженец работает…" : "Улучшить"}</button>${pinBtn()}</div>${cheap}
            <p class="sp-note">Навсегда и только твоя. Руда - из сумки и рудной сумки, 100 осколков = 1 шт. Камни копаются быстрее, оплата за время работы та же.</p>`;
				}
				body += `<details class="sp-ladder"${PK.ladder ? " open" : ""}><summary>Все кирки</summary><ol>${T.map((t, k) => `<li class="${k <= lv ? "got" : ""}${k === nx ? " nx" : ""}"><span class="sp-pic">${pkIcon(k, 28)}</span><span>${esc(t[0])}</span><b>×${val(+t[1])}</b><small>${k ? `мастерство ${t[2]}` : "у всех"}</small></li>`).join("")}</ol></details>`;
			}
		} else if (tab === "bag") {
			const ob = x && x.ob;
			if (ob)
				body = `<div class="sp-step"><div class="sp-now"><span class="sp-pic sp-bagi">${bagIcon(36)}</span><div><p class="sp-nm">Рудная сумка у тебя</p><p class="sp-mul">${ob.used} / ${ob.cap} ячеек</p></div></div></div><p class="sp-note">Новая руда ложится в неё, а не в сумку героя; полна - в сумку, потом на склад. Перекладывать - на «Складе» в «Городе».</p>`;
			else if (x) {
				const wait = !!PK.wait,
					mOk = (mx.lv || 1) >= x.obL,
					cOk = money >= x.obP;
				body = `<div class="sp-step"><div class="sp-up"><span class="sp-pic sp-bagi">${bagIcon(36)}</span><div><p class="sp-nm">Рудная сумка</p><p class="sp-gain">${x.obC} ячеек для руды <small>одна кучка на вид = одна ячейка</small></p></div></div></div>
          <ul class="sp-reqs">${mRow(x.obL)}${x.obP > 0 ? coinRow(x.obP) : ""}</ul>
          <div class="sp-go"><button type="button" class="btn primary" data-sp-bag${!mOk || !cOk || wait ? " disabled" : ""}>${wait ? "Снабженец работает…" : "Купить"}</button></div>
          <p class="sp-note">Навсегда и только твоя: руда из шахты ложится в неё, не в сумку героя. Скупщик и кирка берут руду и отсюда.</p>`;
			}
		} else {
			const hat = (t, sub) =>
				`<div class="sp-step"><div class="sp-now"><span class="sp-pic sp-bagi">⛑</span><div><p class="sp-nm">${t}</p>${sub ? `<p class="sp-mul">${sub}</p>` : ""}</div></div></div>`;
			body = lampOn()
				? `${hat("Каска шахтёра на тебе", "фонарь светит на любом этаже")}`
				: !have && S.lampBought && Date.now() - S.lampBought < 60000
					? `${hat("Каска куплена", "несу в сумку - через пару секунд появится")}`
					: have
						? `${hat("Каска шахтёра в сумке", "надень её - и фонарь загорится")}<div class="sp-go"><button type="button" class="btn primary" data-mn-wear="${esc(have.uid)}">Надеть каску</button></div>`
						: `${hat("Каска шахтёра", `с ${st.darkFrom || 5}-го этажа без света не видно и копать нельзя`)}<div class="sp-go"><button type="button" class="btn primary" data-mn-lamp>Купить каску - ${X.money ? X.money(st.lampPrice || 150) : st.lampPrice}</button></div><p class="sp-note">Обычная вещь в сумку: надел - светит; можно снять и убрать на склад.</p>`;
		}
		return `<section class="m2-card mb-head sp-head"><div class="mb-who"><h3 class="h3">${esc(SUP)} <small class="sp-sub">${esc(SUP_SUB)}</small></h3><p class="mb-say">«${esc(PK.say && Date.now() - PK.say.at < 60000 ? PK.say.t : "Хорошая кирка - полдела.")}»</p></div>${tabs}</section>
      <section class="m2-card sp-body" role="tabpanel">${body}</section>
      <section class="mb-foot"><div class="mn-btns"><button type="button" class="btn ghost" data-mn-back>Назад</button></div></section>`;
	}
	function supBind(el) {
		const ld = el.querySelector("details.sp-ladder");
		if (ld)
			ld.ontoggle = () => {
				PK.ladder = ld.open;
			};
		el.querySelectorAll("[data-sp-tab]").forEach(
			(b) =>
				(b.onclick = () => {
					PK.tab = b.dataset.spTab;
					S.bodyHtml = "";
					panel();
					const t = S.el.querySelector(`[data-sp-tab="${PK.tab}"]`);
					if (t) t.focus();
				}),
		);
		el.querySelectorAll("[data-sp-use]").forEach(
			(b) =>
				(b.onchange = () => {
					if (b.checked) PK.no.delete(b.dataset.spUse);
					else PK.no.add(b.dataset.spUse);
					S.bodyHtml = "";
					panel();
				}),
		);
		const bp = el.querySelector("[data-sp-pick]");
		if (bp)
			bp.onclick = () =>
				supGo("/api/minePick", {
					c: C,
					to: +bp.dataset.spPick,
					use: [...el.querySelectorAll("[data-sp-use]:checked")].map(
						(b) => b.dataset.spUse,
					),
				});
		const bb = el.querySelector("[data-sp-bag]");
		if (bb) bb.onclick = () => supGo("/api/mineOreBag", { c: C });
		el.querySelectorAll("[data-mn-pin]").forEach((b) => {
			b.onclick = () => pinSet(!pinOn());
		});
	}
	async function supGo(url, body) {
		if (PK.wait || S.busyOp) return;
		PK.wait = { at: Date.now() };
		S.bodyHtml = "";
		panel();
		const r = await X.api(url, body);
		if (!S) return;
		if (!r || !r.ok) {
			PK.wait = null;
			tip((r && r.error) || "Не получилось");
			S.bodyHtml = "";
			panel();
			return;
		}
		if (PK.wait) PK.wait.id = r.id;
		setTimeout(() => {
			if (S && PK.wait && PK.wait.id === r.id) {
				PK.wait = null;
				S.bodyHtml = "";
				panel();
			}
		}, 25000);
	}
	function supResult(x, r) {
		if (PK.wait && (!PK.wait.id || PK.wait.id === x.id)) PK.wait = null;
		if (x.ok) {
			if (r.op === "minePick") {
				if (S && S.me && S.me.pkx) S.me.pkx = { ...S.me.pkx, lv: r.to };
				PK.say = {
					t: `Держи - ${pkName(r.to).toLowerCase()} кирка. Бей смело!`,
					at: Date.now(),
				};
				tip(`Кирка улучшена: ${pkName(r.to)}`);
				if (S) heroes();
			} else {
				if (S && S.me && S.me.pkx && !S.me.pkx.ob)
					S.me.pkx = { ...S.me.pkx, ob: { cap: S.me.pkx.obC || 10, used: 0 } };
				PK.say = {
					t: "Рудная сумка твоя - руда теперь ляжет в неё.",
					at: Date.now(),
				};
				tip("Рудная сумка куплена");
			}
		} else if (S) tip(x.error || "Снабженец отказал");
		if (S) {
			S.bodyHtml = "";
			panel();
		}
	}

	const SLOT_RU = {
		weapon: "оружие",
		shield: "щит",
		armor: "доспех",
		helmet: "шлем",
		trinket: "амулет",
	};
	function bagPanel() {
		const items = heroItems(),
			on = items.filter((it) => it.on),
			bag = items.filter((it) => !it.on && it.wearable);
		const row = (it, worn) =>
			`<li class="${it.id === LAMP_ID ? "lamp" : ""}"><span>${esc(it.name)}<small>${esc(SLOT_RU[it.slot] || "")}</small></span>${worn ? `<button type="button" class="btn ghost sm" data-mn-off="${esc(it.slot)}">Снять</button>` : `<button type="button" class="btn primary sm" data-mn-wear="${esc(it.uid)}">Надеть</button>`}</li>`;
		return `<div class="mn-npc-p mn-inv"><h3 class="h3">Сумка</h3><h4>Надето</h4><ul>${on.map((it) => row(it, true)).join("") || '<li class="muted">Ничего</li>'}</ul><h4>В сумке</h4><ul>${bag.map((it) => row(it, false)).join("") || '<li class="muted">Нечего надеть</li>'}</ul>
      <p class="muted">Еда, зелья и склад — во вкладке «Персонаж» и в «Городе».</p><div class="mn-btns"><button type="button" class="btn ghost" data-mn-back>Назад</button></div></div>`;
	}
	async function wear(b, uid) {
		if (b) b.disabled = true;
		const r = X.equip ? await X.equip(uid) : await X.api("/api/equip", { uid });
		if (!S) return;
		if (!r || !r.ok) {
			if (b) b.disabled = false;
			tip((r && r.error) || "Не получилось");
			return;
		}
		tip("Надето");
		draw();
		panel();
		bagDraw();
	}
	async function takeOff(b, slot) {
		if (b) b.disabled = true;
		const r = X.unequip
			? await X.unequip(slot)
			: await X.api("/api/unequip", { slot });
		if (!S) return;
		if (!r || !r.ok) {
			if (b) b.disabled = false;
			tip((r && r.error) || "Не получилось");
			return;
		}
		tip("Снято");
		draw();
		panel();
		bagDraw();
	}
	async function sell(e) {
		const b = e.currentTarget;
		b.disabled = true;
		const r = await X.api("/api/mineSell", { c: C });
		if (!S) return;
		if (!r || !r.ok) {
			b.disabled = false;
			tip((r && r.error) || "Не получилось");
			return;
		}
		tip(`${tx().sold} — монеты придут через пару секунд`);
		if (S.me) S.me = { ...S.me, bag: { c: 0, r: {}, p: {} } };
		panel();
	}

	const PRIZE_RU = {
		enchant_star: "Счастливая звезда",
		enchant_sphere: "Сфера сохранения",
	};

	const lootText = (s) =>
		Object.entries(s || {})
			.filter(([, v]) => v > 0)
			.sort((a, b) => b[1] - a[1])
			.map(([k, v]) => gotText(v, k))
			.join(", ");
	const oreQty = (s) =>
		Object.entries(s || {})
			.filter(([, v]) => v > 0)
			.map(([k, v]) => `${resName(k)} ${oskQ(v)}`)
			.join(", ");
	function logLine(e) {
		const L = lootText(e.s),
			nm = String(tx().b[e.t] || tx().b.rock),
			b =
				e.t === "chest" || e.t === "prize"
					? "Сундук"
					: `${nm[0].toUpperCase() + nm.slice(1)}${e.lv ? ` ${e.lv} ур.` : ""}`;
		switch (e.k) {
			case "dug":
				return L
					? `${b}: ${L}`
					: `${b} выкопан - добыча другим по вкладу, тебе оплата за работу`;
			case "part":
				return L
					? `Ушёл от камня (${e.lv || ""} ур.) с долей: ${L}`
					: "Ушёл от камня";
			case "rare":
				return `Жила твоя: ${resName(e.r)}`;
			case "prize":
				return `Приз сундука: ${PRIZE_RU[e.p] || e.p}`;
			case "sell":
				return `Скупщик: заработок ${e.c || 0}${oreQty(e.s) ? ` · сдано: ${oreQty(e.s)}` : ""}`;
			case "buy":
				return `Скупщик купил: ${oreQty(e.s) || "руду"}`;
			case "lift":
				return `Вклад в лифт: ${e.c || 0}`;
			case "drill":
				return `Вклад в буровую${e.r ? ` (${resName(e.r)})` : ""}: ${e.c || 0}`;
			case "claim":
				return `Награда за поручения: ${e.c || 0}`;
			default:
				return "";
		}
	}

	const lgLocal = () => (S && S.lgLocal) || [];
	const sameDug = (a, b) =>
		a && b && a.k === "dug" && b.k === "dug" && a.n === b.n && a.i === b.i;
	function lgAll() {
		const L = S && S.me && Array.isArray(S.me.lg) ? S.me.lg : [];
		const loc = lgLocal().filter((e) => !L.some((x) => sameDug(x, e)));
		return loc.length
			? [...loc, ...L].sort((a, b) => (+b.at || 0) - (+a.at || 0)).slice(0, 12)
			: L;
	}

	function myLog() {
		return lgAll()
			.map((e) => ({ t: logLine(e || {}), at: +(e && e.at) || 0 }))
			.filter((e) => e.t);
	}
	const logKey = () => {
		const L = lgAll();
		return L.length + ":" + ((L[0] || {}).at || 0) + ":" + lgLocal().length;
	};
	function logNow() {
		const lk = logKey();
		if (lk === S.logK) return;
		S.logK = lk;
		if (S.chat && S.chat.on && S.chat.open && S.chat.tab === "lg" && CHM)
			CHM.render();
		if (S.npcOpen === "log") {
			S.bodyHtml = "";
			panel();
		}
	}

	function lootOfCell(i) {
		const c = S.F && S.F.cells[i];
		if (!c) return {};
		if (c.r && c.a > 0) return { [c.r]: Math.round(c.a * 100) };
		if (c.t === "chest" || c.t === "prize") {
			const ch = S.st && S.st.fl && S.st.fl.ch;
			const m = ch && (ch[i] || ch[String(i)]);
			return m ? { ...m } : {};
		}
		return {};
	}
	function expectOf(i) {
		const L = window.LGMineShares;
		if (!L || !S || !S.st || !S.F || i < 0 || S.dug[i]) return null;
		const loot = lootOfCell(i);
		if (!Object.keys(loot).length) return { s: {}, exact: true, none: true };
		const me = S.me || {},
			ml = X.login(),
			st = S.st;

		if (
			me.ex &&
			me.ex[1] === i &&
			(!(st.fl && st.fl.v3) || me.ex[0] === st.n) &&
			S.myI === i
		)
			return {
				s: me.ex[2] || {},
				exact: !((st.bl || {})[i] && st.bl[i][3] > 1),
				game: true,
			};
		const b = (st.bl || {})[i],
			pw = +me.pw || 1;
		if (!b)
			return {
				s: L.project({ loot, by: {}, left: 1, dig: [], me: ml, pw }),
				exact: true,
			};
		const [left, , rate, n, U = 0, P = 0, pd = 0] = b,
			age = Math.max(0, (srvNow() - (st.at || srvNow())) / 60000),
			l2 = Math.max(0, left - rate * age);
		const tot = Object.values(loot).reduce((a, v) => a + v, 0),
			paid = {};
		if (pd > 0 && tot > 0)
			for (const [k, v] of Object.entries(loot))
				paid[k] = Math.round((pd * v) / tot);
		const done = Math.max(0, left - l2),
			mine = S.myI === i;

		const oP = Math.max(0, P - (mine ? pw : 0)),
			by = { "~": U + done * (oP / Math.max(1e-9, P || 1)) },
			dig = oP > 0 ? [["~", oP]] : [];
		if (mine) by[ml] = done * (pw / Math.max(1e-9, P || pw));
		return {
			s: L.project({ loot, paid, by, left: l2, dig, me: ml, pw }),
			exact: !(U > 0) && !(n - (mine ? 1 : 0) > 0),
		};
	}

	const veinNote = () => {
		const p = S && S.me ? +S.me.vn : 0;
		return p > 0
			? ` <small class="mn-vein" title="Навык гильдии «Рудная жила»">шанс ${Math.round(p * 10) / 10}% - вдвое</small>`
			: "";
	};
	const exHtml = (x) =>
		!x
			? ""
			: x.none
				? "без руды - только оплата за работу"
				: Object.keys(x.s).length
					? `${x.exact ? "" : "≈ "}${esc(lootText(x.s))}${veinNote()}`
					: "тебе - только оплата (руда - другим по вкладу)";

	function nowEx(el, i) {
		const e = el.querySelector("[data-mn-ex]");
		if (!e) return;
		const x = i >= 0 ? expectOf(i) : null,
			h = x ? `<i>Получишь:</i> ${exHtml(x)}` : "";
		if (e.innerHTML !== h) {
			e.innerHTML = h;
			S.nowWH = null;
		}
		e.hidden = !h;
	}

	function exAt() {
		if (!S || !S.st || !S.F || S.dark) return -1;
		if (S.hovI >= 0 && !S.dug[S.hovI]) return S.hovI;
		if (S.myI >= 0 || S.path || !S.pos) return -1;
		let best = -1,
			bd = Infinity;
		const R = MW().REACH;
		for (const i of S.st.front || []) {
			if (S.dug[i]) continue;
			const c = GX().cellXY(i),
				d = Math.hypot(S.pos.x - c.cx, S.pos.y - c.cy);
			if (d <= R && d < bd) {
				bd = d;
				best = i;
			}
		}
		return best;
	}
	function exDraw() {
		if (!S || !S.view) return;
		let el = S.el.querySelector(".mn-exh");
		const i = exAt(),
			cell = i >= 0 ? S.F.cells[i] : null,
			x = cell && cell.t !== "wall" ? expectOf(i) : null;
		if (!x) {
			S.exA = null;
			if (el && !el.hidden) el.hidden = true;
			return;
		}
		if (!el) {
			el = document.createElement("div");
			el.className = "mn-exh";
			el.setAttribute("role", "status");
			el.setAttribute("aria-live", "polite");
			S.view.appendChild(el);
		}
		const t = blockTitle(cell),
			h = `<b>${esc(t[0].toUpperCase() + t.slice(1))}</b><span><i>Получишь:</i> ${exHtml(x)}</span>`;
		if (el.innerHTML !== h) {
			el.innerHTML = h;
			S.exWH = null;
		}
		const c = GX().cellXY(i),
			sc = 1.0 + Math.max(0, (cell.lv || S.F.n) - S.F.n) * 0.1;
		S.exA = { x: c.x, y: c.y - 74 * sc };
		if (el.hidden) el.hidden = false;
		exPlace();
	}
	function exPlace() {
		const el = S && S.el.querySelector(".mn-exh"),
			a = S && S.exA;
		if (!el || !a || el.hidden) return;
		if (!S.exWH) S.exWH = [el.offsetWidth, el.offsetHeight];
		const [w, h] = S.exWH,
			v = vSize(),
			top0 = (S.topPad || 0) + 4,
			ax = S.tx + a.x * S.z,
			ay = S.ty + a.y * S.z;

		const off = ax < 0 || ax > v.w || ay < 0 || ay > v.h + 60;
		if (el.classList.contains("off") !== off) el.classList.toggle("off", off);
		if (off) return;
		const x = Math.max(4, Math.min(v.w - w - 4, ax - w / 2)),
			y = Math.max(top0, Math.min(v.h - h - 4, ay - 6 - h));
		el.style.transform = `translate(${x.toFixed(0)}px, ${y.toFixed(0)}px)`;
	}
	function bindExHover() {
		S.view.addEventListener(
			"pointermove",
			(e) => {
				if (e.pointerType !== "mouse" || !S || !S.st || !S.F) return;
				if (e.buttons) {
					if (S.hovI >= 0) {
						S.hovI = -1;
						exDraw();
					}
					return;
				}
				const p = worldPt(e),
					c = GX().cellAt(p.x, p.y),
					i = c >= 0 && !S.dug[c] && (S.st.front || []).includes(c) ? c : -1;
				if (i === S.hovI) return;
				S.hovI = i;
				exDraw();
			},
			{ passive: true },
		);
		S.view.addEventListener("pointerleave", () => {
			if (S && S.hovI >= 0) {
				S.hovI = -1;
				exDraw();
			}
		});
	}

	function lootToast(s, head, sub) {
		if (!S) return;
		let el = S.el.querySelector(".mn-toast");
		if (!el) {
			el = document.createElement("div");
			el.className = "mn-toast";
			el.setAttribute("role", "status");
			el.setAttribute("aria-live", "polite");
			S.el.appendChild(el);
		}
		const rows = Object.entries(s || {})
			.filter(([, v]) => v > 0)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 6);
		el.innerHTML = `<b class="mn-toast-h">${esc(head)}</b>${rows.length ? `<ul>${rows.map(([k, v]) => `<li>${sfxIcon(k, "mn-toast-ic")}<span>${esc(gotText(v, k))}</span></li>`).join("")}</ul>` : ""}${sub ? `<small>${esc(sub)}</small>` : ""}`;
		el.classList.remove("on");
		void el.offsetWidth;
		el.classList.add("on");
		el.hidden = false;
		clearTimeout(S.toastT);
		const me0 = S;
		S.toastT = setTimeout(() => {
			if (S === me0 && el.isConnected) {
				el.classList.remove("on");
				el.hidden = true;
			}
		}, 4500);
	}

	function dugToast(b, cell, g) {
		const t = blockTitle(cell),
			head =
				cell.t === "chest" || cell.t === "prize"
					? "Сундук вскрыт!"
					: `Выкопан: ${t}`;
		const s =
			g && g.loot
				? { ...g.loot }
				: g && cell.r && g.q > 0
					? { [cell.r]: g.q }
					: null;
		if (s && Object.keys(s).length) {
			lootToast(s, head, "Добыча - в сумке");
			(S.lgLocal || (S.lgLocal = [])).unshift({
				at: Date.now(),
				k: "dug",
				n: S.st.n,
				i: b.i,
				t: cell.t,
				lv: cell.lv || S.st.n,
				s,
			});
			if (S.lgLocal.length > 12) S.lgLocal.length = 12;
			logNow();
			return;
		}
		if (g && g.any && cell.r) {
			lootToast(
				null,
				head,
				`${resName(cell.r)} досталась другим копавшим по вкладу - тебе оплата за работу`,
			);
			return;
		}
		if (
			!(cell.r && cell.a > 0) &&
			!(cell.t === "chest" || cell.t === "prize")
		) {
			lootToast(null, head, "Руды в камне не было - оплата за работу");
			return;
		}

		S.toastWant = { n: S.st.n, i: b.i, at: Date.now(), head };
	}

	function toastFromLog() {
		const w = S && S.toastWant;
		if (!w) return;
		if (Date.now() - w.at > 90000) {
			S.toastWant = null;
			return;
		}
		const e = ((S.me && S.me.lg) || []).find(
			(x) =>
				x &&
				x.k === "dug" &&
				x.i === w.i &&
				x.n === w.n &&
				x.at >= w.at - 120000,
		);
		if (!e) return;
		S.toastWant = null;
		lootToast(
			e.s,
			w.head,
			Object.keys(e.s || {}).length
				? "Добыча - в сумке"
				: "Добыча - другим по вкладу, тебе оплата за работу",
		);
	}

	const WIN_KEY = (k) => `lgMineWin:${(X && X.login && X.login()) || ""}:${k}`;
	function winMem(k, v) {
		try {
			if (v === undefined) {
				const o = JSON.parse(localStorage.getItem(WIN_KEY(k)) || "null");
				return o && typeof o === "object" ? o : null;
			}
			if (v === null) localStorage.removeItem(WIN_KEY(k));
			else localStorage.setItem(WIN_KEY(k), JSON.stringify(v));
		} catch (e) {
			if (v === undefined) return null;
		}
		return null;
	}

	const winWide = (w) => !S || w.offsetWidth >= S.el.clientWidth - 24;

	function winPut(w, x, y) {
		const W = S.el.clientWidth,
			H = S.el.clientHeight,
			ww = w.offsetWidth,
			hh = w.offsetHeight;

		const nx = Math.round(Math.max(4, Math.min(W - ww - 4, x))),
			ny = Math.round(Math.max(4, Math.min(H - Math.min(hh, 160) - 4, y)));
		w.style.left = nx + "px";
		w.style.top = ny + "px";
		w.style.right = "auto";
		w.style.bottom = "auto";
		w.style.maxHeight = Math.max(120, H - ny - 8) + "px";
		w.classList.add("mn-moved");
		return { x: nx, y: ny };
	}
	function winRestore(w, k) {
		if (winWide(w)) {
			w.classList.remove("mn-moved");
			w.style.left =
				w.style.top =
				w.style.right =
				w.style.bottom =
				w.style.maxHeight =
					"";
			return;
		}
		const v = winMem(k);
		if (v && Number.isFinite(+v.x) && Number.isFinite(+v.y))
			winPut(w, +v.x, +v.y);
	}
	function winDrag(w, grip, k) {
		let d = null;
		const noGrip = (t) =>
			!!(
				t &&
				t.closest &&
				t.closest("button:not([data-bx]), .lgi-x, input, select, a, [data-ig]")
			);
		grip.addEventListener("pointerdown", (e) => {
			if (
				(e.pointerType === "mouse" && e.button !== 0) ||
				noGrip(e.target) ||
				winWide(w)
			)
				return;
			const r = w.getBoundingClientRect(),
				r0 = S.el.getBoundingClientRect();
			d = {
				id: e.pointerId,
				sx: e.clientX,
				sy: e.clientY,
				x0: r.left - r0.left,
				y0: r.top - r0.top,
				mv: false,
			};
			window.addEventListener("pointermove", mv);
			window.addEventListener("pointerup", up);
			window.addEventListener("pointercancel", up);
		});
		const mv = (e) => {
			if (!d || e.pointerId !== d.id) return;
			const dx = e.clientX - d.sx,
				dy = e.clientY - d.sy;
			if (!d.mv) {
				if (Math.abs(dx) + Math.abs(dy) < 6) return;
				d.mv = true;
				w.classList.add("mn-dragging");
			}
			e.preventDefault();
			d.at = winPut(w, d.x0 + dx, d.y0 + dy);
		};
		const up = (e) => {
			if (!d || e.pointerId !== d.id) return;
			const was = d.mv,
				at = d.at;
			d = null;
			w.classList.remove("mn-dragging");
			window.removeEventListener("pointermove", mv);
			window.removeEventListener("pointerup", up);
			window.removeEventListener("pointercancel", up);
			if (!was) return;

			const eat = (ev) => {
				ev.stopPropagation();
				ev.preventDefault();
			};
			w.addEventListener("click", eat, true);
			setTimeout(() => w.removeEventListener("click", eat, true), 0);
			if (at) winMem(k, at);
		};

		grip.addEventListener("dblclick", (e) => {
			if (noGrip(e.target) || winWide(w)) return;
			winMem(k, null);
			w.classList.remove("mn-moved");
			w.style.left =
				w.style.top =
				w.style.right =
				w.style.bottom =
				w.style.maxHeight =
					"";
		});
	}
	const FOLD_ICO =
		'<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 12h12"/></svg>';
	const UNFOLD_ICO =
		'<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><rect x="5" y="5" width="14" height="14" rx="2"/></svg>';
	const bagFolded = () => {
		const v = winMem("bagFold");
		return !!(v && v.on);
	};
	function bagFold(w, on) {
		w.classList.toggle("mn-fold", on);
		if (S) S.el.classList.toggle("bag-fold", on);
		const b = w.querySelector("[data-mn-fold]");
		if (b) {
			b.innerHTML = on ? UNFOLD_ICO : FOLD_ICO;
			const t = on ? "Развернуть сумку" : "Свернуть сумку";
			b.title = t;
			b.setAttribute("aria-label", t);
			b.setAttribute("aria-expanded", String(!on));
		}
		if (S && S.bag) {
			const g = w.querySelector(".lgi-h");
			if (g) g.title = on ? "Сумка свёрнута - нажми «развернуть»" : "";
		}
	}

	function bagDeco(w) {
		const h = w.querySelector(".lgi-h");
		if (!h) return;
		if (!h.querySelector("[data-mn-fold]")) {
			const b = document.createElement("button");
			b.type = "button";
			b.className = "mn-foldb";
			b.dataset.mnFold = "1";
			const x = h.querySelector(".lgi-x");
			h.insertBefore(b, x || null);
			b.addEventListener("click", (e) => {
				e.stopPropagation();
				const on = !w.classList.contains("mn-fold");
				bagFold(w, on);
				winMem("bagFold", on ? { on: 1 } : null);
				if (S.bag && !on) bagDraw();
				if (!winWide(w) && w.classList.contains("mn-moved")) {
					const r = w.getBoundingClientRect(),
						r0 = S.el.getBoundingClientRect();
					winPut(w, r.left - r0.left, r.top - r0.top);
				}
			});

			h.addEventListener(
				"click",
				(e) => {
					if (
						!w.classList.contains("mn-fold") ||
						!e.target.closest("[data-bx]") ||
						e.target.closest(".lgi-x, [data-mn-fold]")
					)
						return;
					e.stopPropagation();
					e.preventDefault();
					b.click();
				},
				true,
			);
		}
		h.classList.add("mn-grip");
		bagFold(w, bagFolded());
		winDrag(w, h, "bag");
		winRestore(w, "bag");
	}

	function winRefit() {
		if (!S) return;
		for (const [sel, k] of [[".mn-inv2-w", "bag"]]) {
			const w = S.el.querySelector(sel);
			if (w && w.classList.contains("mn-moved")) {
				if (winWide(w)) winRestore(w, k);
				else {
					const r = w.getBoundingClientRect(),
						r0 = S.el.getBoundingClientRect();
					winPut(w, r.left - r0.left, r.top - r0.top);
				}
			} else if (w) winRestore(w, k);
		}
		exPlace();
	}

	const PIN_ICO =
		'<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6l-1 6 4 3v2H6v-2l4-3z"/><path d="M12 14v7"/></svg>';
	const pinOn = () => {
		const v = winMem("pickPin");
		return !!(v && v.on);
	};
	function pinSet(on) {
		winMem("pickPin", on ? { on: 1 } : null);
		S.bodyHtml = "";
		panel();
		pinDraw();
	}
	const pinBtn = (cls) => {
		const on = pinOn(),
			t = on
				? "Открепить окно с ресурсами для кирки"
				: "Закрепить на экране: что нужно для новой кирки";
		return `<button type="button" class="mn-pinb${on ? " on" : ""}${cls ? " " + cls : ""}" data-mn-pin aria-pressed="${on}" title="${t}" aria-label="${t}">${PIN_ICO}<span>${on ? "Закреплено" : "Закрепить"}</span></button>`;
	};

	function pickNeed() {
		const x = S && S.me && S.me.pkx;
		if (!x) return null;
		const T = pkT(x),
			lv = x.lv || 0,
			nx = lv + 1 < T.length ? lv + 1 : -1;
		if (nx < 0) return { name: "", max: true, rows: [], ok: true };
		const N = T[nx],
			mx = (S.me && S.me.mx) || { lv: 1 },
			h = (X.hero && X.hero()) || {},
			money = Math.max(0, Math.floor(+h.money || 0)),
			hv = oreHave();
		const rows = [
			["Горное дело", `ур. ${mx.lv || 1}`, `ур. ${N[2]}`, (mx.lv || 1) >= N[2]],
		];

		if (N[3] > 0)
			rows.push([
				"Монеты",
				qPlain(money),
				qPlain(N[3]),
				money >= N[3],
				qCoins(money, "", "есть"),
				qCoins(N[3], "", "нужно"),
			]);
		const opt = N[5] || {},
			can = Object.keys(opt).filter((r) => (hv[r] || 0) > 0),
			use = can.filter((r) => !PK.no.has(r)),
			pay = pickPay(N[4] || {}, opt, hv, use);
		for (const [r, need] of Object.entries(pay.s)) {
			const got = hv[r] || 0;
			rows.push([
				resName(r).replace(/^./, (c) => c.toUpperCase()),
				pcs(Math.min(got, 1e9)),
				pcs(need),
				got >= need,
			]);
		}
		return { name: N[0], rows, ok: rows.every((q) => q[3]) };
	}
	function pinDraw() {
		if (!S) return;
		let el = S.el.querySelector(".mn-pkpin");
		const on = pinOn() && pickOn(),
			P = on ? pickNeed() : null;
		if (!P) {
			if (el) el.remove();
			return;
		}
		if (!el) {
			el = document.createElement("section");
			el.className = "mn-pkpin";
			el.setAttribute("aria-label", "Новая кирка: что нужно");
			const tr = S.el.querySelector(".mn-tr");
			(tr || S.el).appendChild(el);
			el.addEventListener("click", (e) => {
				if (e.target.closest("[data-mn-pin]")) pinSet(false);
				else if (e.target.closest("[data-mn-pkgo]")) goNpc("lamp");
			});
		}
		const done = P.rows.filter((q) => q[3]).length;
		const h = P.max
			? `<div class="mn-pk-h"><b>Кирка - лучшая</b>${pinBtn("sm")}</div>`
			: `<div class="mn-pk-h"><b title="${esc(P.name)}">${esc(P.name)} кирка</b><small>${done} / ${P.rows.length}</small>${pinBtn("sm")}</div><ul>${P.rows.map(([n, hv, nd, ok, hh, nh]) => `<li class="${ok ? "ok" : "no"}"><i role="img" aria-label="${ok ? "хватает" : "не хватает"}">${ok ? "✓" : "✗"}</i><span title="${esc(n)}">${esc(n)}</span><b title="${esc(hv)} / ${esc(nd)}">${hh ? `${hh} / ${nh}` : `${esc(hv)} / ${esc(nd)}`}</b></li>`).join("")}</ul>${P.ok ? '<button type="button" class="mn-pk-go" data-mn-pkgo>Всё есть - к Снабженцу</button>' : ""}`;
		if (el.dataset.h !== h) {
			el.dataset.h = h;
			el.innerHTML = h;
		}
	}

	function zFor(zk) {
		const W = S.Wd,
			{ w: vw, h: vh } = vSize();
		if (W.v3) {
			const phone = vw < 720,
				z0 = phone
					? vw / (7.2 * W.CW)
					: Math.min(1, vw / (15 * W.CW), vh / (6.5 * W.RH));

			const zmin = Math.min(
				1.6,
				Math.max(0.2, (vw - 2 * camM()) / Math.max(1, floorW())),
			);
			return Math.max(zmin, Math.min(1.6, z0 * zk));
		}

		const gridW = W.CW * GW + 24;

		const z0 = Math.min(1, vw < W.W ? vw / gridW : vw / W.W, vh / (W.RH * 9));
		return Math.max(0.25, Math.min(1.6, z0 * zk));
	}
	function fit(reset) {
		if (!S || !S.Wd) return;
		vSize(true);
		if (S.Wd.v3) return fit3(reset);
		const W = S.Wd,
			vw = S.vsz.w,
			vh = S.vsz.h;

		S.z = zFor(S.zk || 1);
		S.tx = (vw - W.W * S.z) / 2;
		if (reset === true) S.ty = vh - W.H * S.z - padB();
		clampY();
		apply();
		S.el.style.setProperty("--mnb-ts", (200 * S.z).toFixed(1) + "px");
		chatFit();
	}

	const shown = (e) => !!e && !e.hidden && e.getClientRects().length > 0;

	function dockFit() {
		if (!S || !S.Wd || !S.view) return;
		if (S.el.dataset.m2 === "1") {
			const t0 = S.view.getBoundingClientRect().top;
			let b = 0;
			for (const e of S.el.querySelectorAll(".mn-ttl, .mn-tb")) {
				const r = e.getBoundingClientRect();
				if (r.height) b = Math.max(b, r.bottom - t0);
			}
			S.topPad = Math.round(b + 6);
		} else S.topPad = 0;
	}
	function chatFit() {
		if (!S || !S.view || !S.Wd || S.inFit) return;
		S.inFit = 1;
		try {
			chatFit0();
		} finally {
			if (S) S.inFit = 0;
		}
	}

	function txFull() {
		const W = S.Wd,
			vw = S.view.clientWidth,
			vh = S.view.clientHeight + (S.res || 0),
			gridW = W.CW * GW + 24;
		const z = Math.max(
			0.25,
			Math.min(
				1.6,
				Math.min(1, vw < W.W ? vw / gridW : vw / W.W, vh / (W.RH * 9)) *
					(S.zk || 1),
			),
		);
		return (vw - W.W * z) / 2;
	}

	const pcChat = () =>
		!window.LGSiteUi.is("phone") &&
		!(window.LGSiteUi.is("nohover") && window.LGSiteUi.is("touch"));
	const chatSize = () => {
		const c = one() ? window.LGChatOne : CHM;
		if (c && c.size) c.size();
	};
	function chatFit0() {
		dockFit();
		const box = S.el.querySelector(".cy-chat"),
			m2 = S.el.dataset.m2 === "1",
			phone = window.LGSiteUi.is("phone"),
			pc = pcChat();

		if (phone && S.el.dataset.chat && S.el.classList.contains("bag-on")) return;
		let dock = "",
			room = false;
		if (m2 && shown(box)) {
			const free = Math.floor(txFull() - 24);
			if (pc) {
				room = free >= 280;
				dock = box.classList.contains("open") ? "free" : "tab";
				if (room) box.style.setProperty("--mn-chw", Math.min(360, free) + "px");
				else box.style.removeProperty("--mn-chw");
				S.chatDx = room
					? Math.max(12, Math.round(S.tx - 16 - Math.min(360, free)))
					: 12;
			} else if (free >= 240) {
				const w = Math.min(360, free);
				dock = "side";
				box.style.setProperty("--mn-chw", w + "px");
				box.style.setProperty(
					"--mn-chx",
					Math.max(12, Math.round(S.tx - 16 - w)) + "px",
				);
			} else {
				dock = "band";
				box.style.removeProperty("--mn-chw");
				box.style.removeProperty("--mn-chx");
			}
		}
		if (S.el.dataset.chat !== dock) S.el.dataset.chat = dock;

		const tp = String(S.topPad || 0);
		if (S.el.dataset.chatTop !== tp) S.el.dataset.chatTop = tp;
		let res = 0,
			padC = 0,
			padA = 0;
		if (dock === "free") {
			const cx = (S.chatDx || 12) + "px";
			if (box.style.getPropertyValue("--mn-cfx") !== cx)
				box.style.setProperty("--mn-cfx", cx);
			chatSize();

			const w = box.offsetWidth,
				h = box.offsetHeight,
				x =
					(S.chatDx || 12) +
					(parseFloat(box.style.getPropertyValue("--cy-dx")) || 0),
				b = 64 - (parseFloat(box.style.getPropertyValue("--cy-dy")) || 0);
			if (x < S.tx + S.Wd.W * S.z && x + w > S.tx)
				padA = Math.max(0, Math.round(b + h + 6));
		} else chatSize();
		if (dock === "band" || (dock === "tab" && !room)) {
			const top0 = S.el.getBoundingClientRect().top,
				h = S.el.clientHeight;
			let top = h;
			for (const e of [box, S.el.querySelector(".mn-zoom")])
				if (shown(e)) top = Math.min(top, e.getBoundingClientRect().top - top0);
			res = Math.max(0, Math.round(h - top + 6));

			if (!box.classList.contains("open")) {
				padC = res;
				res = 0;
			} else if (phone) {
				res = 0;
				padC = Math.round(64 + box.offsetHeight + 6);
			}
		}

		{
			const up =
				phone && m2 && shown(box) && box.classList.contains("open")
					? Math.round(64 + box.offsetHeight + 8) + "px"
					: "";
			if ((S.el.style.getPropertyValue("--mn-chb") || "") !== up) {
				if (up) S.el.style.setProperty("--mn-chb", up);
				else S.el.style.removeProperty("--mn-chb");
			}
		}
		if (
			res === (S.res || 0) &&
			padC === (S.padC || 0) &&
			padA === (S.padA || 0)
		)
			return;

		const atB =
			(res !== (S.res || 0) || padC !== (S.padC || 0)) &&
			S.ty <= S.view.clientHeight - S.Wd.H * S.z - padB() + 2;
		S.res = res;
		S.padC = padC;
		S.padA = padA;
		S.view.style.bottom = res ? res + "px" : "";
		fit(atB ? true : undefined);
	}
	function chatWatch() {
		if (!S || S.chatMo || !window.MutationObserver) return;
		const mo = new MutationObserver(() => {
			clearTimeout(S.chatFitT);
			S.chatFitT = setTimeout(chatFit, 30);
		});
		const box = S.el.querySelector(".cy-chat");
		if (box)
			mo.observe(box, {
				attributes: true,
				attributeFilter: ["class", "hidden"],
			});
		mo.observe(S.el, {
			attributes: true,
			attributeFilter: ["class", "data-m2"],
		});
		S.chatMo = mo;
	}

	function chatSized(e) {
		if (!S || S.el.dataset.chat !== "free" || !(e && e.detail && e.detail.end))
			return;
		chatFit();
	}

	const padB = () => (S && S.padC) || 0;

	const padX = () => Math.max(padB(), (S && S.padA) || 0);

	function clampY() {
		if (S.Wd && S.Wd.v3) return clamp3();
		const vh = vSize().h,
			H = S.Wd.H * S.z;
		S.ty = Math.min(S.topPad || 0, Math.max(vh - H - padX(), S.ty));
	}

	function fit3(reset) {
		const { w: vw, h: vh } = vSize(true);
		S.z = zFor(S.zk || 1);
		if (reset === true || S.tx == null) {
			const p = S.pos || spawnPt();
			S.tx = vw / 2 - p.x * S.z;
			S.ty = (vh - padB()) / 2 - (p.y - 60) * S.z;
		}
		clamp3();
		apply();
		chatFit();
	}

	const floorW = () => {
		const W = S.Wd,
			G3 = W && W.G;
		return W ? W.W - 2 * (G3 ? G3.X0 : 0) : 1;
	};

	function camM() {
		const { w: vw, h: vh } = vSize();
		return vw < 720
			? Math.round(Math.max(56, Math.min(140, Math.min(vw, vh) * 0.22)))
			: 400;
	}
	const clampN = (v, a, b) => Math.min(b, Math.max(a, v));
	function clamp3() {
		const W = S.Wd,
			G3 = W.G || {},
			v = vSize(),
			vw = v.w,
			vh = v.h,
			z = S.z,
			m = camM();
		const X0 = G3.X0 || 0,
			Y0 = G3.Y0 || 0,
			fx = X0 * z,
			fy = Y0 * z,
			fw = W.W * z - 2 * fx,
			fh = W.H * z - 2 * fy;

		if (S.m3 && S.m3.outFit)
			S.m3.outFit(
				(Math.max(m, (vw - fw) / 2, (vh - fh) / 2) + 8) / z - X0 + W.CW,
			);

		S.tx =
			fw + 2 * m <= vw
				? (vw - fw) / 2 - fx
				: clampN(S.tx + fx, vw - fw - m, m) - fx;
		S.ty =
			fh + 2 * m <= vh
				? (vh - fh) / 2 - fy
				: clampN(S.ty + fy, vh - fh - m, m) - fy;
	}

	function camMoved() {
		if (!S || S.camRaf) return;
		S.camRaf = requestAnimationFrame(() => {
			if (!S) return;
			S.camRaf = 0;
			vSize();
			let re = false;
			if (V3() && S.m3) {
				const vk = S.m3.viewKey();
				if (vk !== S.camVK) {
					S.camVK = vk;
					S.m3.ensure();
					if (S.st && S.F) {
						bars();
						re = true;
					}
				}
			}
			if (
				(cullHeroes() || re) &&
				art2On() &&
				window.LGMineArt &&
				window.LGMineArt.digSync
			)
				window.LGMineArt.digSync(S.heroes, S.bars);
		});
	}

	function apply() {
		S.world.style.transform = S.el.classList.contains("mn-gpu")
			? `translate3d(${S.tx.toFixed(1)}px, ${S.ty.toFixed(1)}px, 0) scale(${S.z})`
			: `translate(${S.tx.toFixed(1)}px, ${S.ty.toFixed(1)}px) scale(${S.z})`;
		if (S.lm) liftPlace();
		if (S.nowA) nowPlace();
		if (S.exA) exPlace();
		if (S.npcOpen) winPlace();
		camMoved();
	}
	const WHEEL_OWN =
		".mn-win, .mn-wg, .cy-chat, .mn-lm, input, textarea, select, [data-wheel]";

	function zoomWheel(k, mx, my) {
		if (!S || !S.Wd) return;

		if (Math.abs(S.z - zFor(S.zk || 1)) > 1e-3) fit();
		const z0 = S.z,
			zk0 = S.zk || 1,
			zk1 = Math.max(0.6, Math.min(1.8, zk0 * k)),
			z1 = zFor(zk1);

		if (Math.abs(z1 - z0) < 1e-4) return;
		const wx = (mx - S.tx) / z0,
			wy = (my - S.ty) / z0;
		S.zk = zk1;
		S.z = z1;
		S.tx = mx - wx * z1;
		S.ty = my - wy * z1;
		if (!S.Wd.v3) S.tx = (vSize().w - S.Wd.W * S.z) / 2;
		clampY();
		if (!S.lm) {
			S.world.classList.add("zm");
			clearTimeout(S.zmT);
			S.zmT = setTimeout(() => {
				if (S && S.world) S.world.classList.remove("zm");
			}, 180);
		}
		apply();
		clearTimeout(S.zfT);
		S.zfT = setTimeout(() => {
			if (!S) return;
			S.el.style.setProperty("--mnb-ts", (200 * S.z).toFixed(1) + "px");
			dockFit();
			chatFit();
		}, 160);
	}

	function dragOn(on) {
		if (!S || !S.world) return;
		const v = on && S.el.classList.contains("mn-lite");
		if (S.world.classList.contains("mn-drag") !== v)
			S.world.classList.toggle("mn-drag", v);
		gpuDrag(on);
	}

	const GPU_SIDE = 8192,
		GPU_AREA = 4096 * 4096,
		GPU_OFF = 400;
	function gpuFits() {
		if (!S.Wd || !S.z) return false;
		const d = window.devicePixelRatio || 1,
			w = S.Wd.W * S.z * d,
			h = S.Wd.H * S.z * d;
		return w <= GPU_SIDE && h <= GPU_SIDE && w * h <= GPU_AREA;
	}
	function gpuDrag(on) {
		const W = S.world,
			has = W.classList.contains("mn-gdrag");
		clearTimeout(S.gdT);
		S.gdT = 0;
		if (on) {
			const v = S.el.classList.contains("mn-gpu") && gpuFits();
			if (has !== v) W.classList.toggle("mn-gdrag", v);
			return;
		}
		if (!has) return;
		const me0 = S;
		S.gdT = setTimeout(() => {
			if (S === me0) {
				S.gdT = 0;
				S.world.classList.remove("mn-gdrag");
			}
		}, GPU_OFF);
	}
	function bindCamera() {
		const v = S.view;
		let drag = null;

		const fingers = new Map();
		const pinchOf = () => {
			const [a, b] = [...fingers.values()],
				r = v.getBoundingClientRect();
			return {
				d: Math.max(10, Math.hypot(a.x - b.x, a.y - b.y)),
				mx: (a.x + b.x) / 2 - r.left,
				my: (a.y + b.y) / 2 - r.top,
			};
		};
		const pzOn = () => {
			try {
				const h = X.hero();
				return !!(h && h.pz);
			} catch (e) {
				return false;
			}
		};
		function pinchFrame() {
			const P = S && S.pinch;
			if (!P) return;
			S.pinchRaf = 0;
			if (fingers.size !== 2 || !S.Wd) return;
			const q = pinchOf();
			if (Math.abs(S.z - zFor(S.zk || 1)) > 1e-3) fit();

			const z0 = S.z,
				zk1 = Math.max(S.Wd.v3 ? 0.6 : 1, Math.min(1.8, (P.zk0 * q.d) / P.d0)),
				z1 = zFor(zk1);
			const wx = (P.mx - S.tx) / z0,
				wy = (P.my - S.ty) / z0;
			S.zk = zk1;
			S.z = z1;
			S.tx = q.mx - wx * z1;
			S.ty = q.my - wy * z1;
			P.mx = q.mx;
			P.my = q.my;
			if (!S.Wd.v3) S.tx = (vSize().w - S.Wd.W * S.z) / 2;
			clampY();
			apply();
			clearTimeout(S.zfT);
			S.zfT = setTimeout(() => {
				if (!S) return;
				S.el.style.setProperty("--mnb-ts", (200 * S.z).toFixed(1) + "px");
				dockFit();
				chatFit();
			}, 160);
		}
		const unfinger = (e) => {
			if (!fingers.delete(e.pointerId)) return;
			if (fingers.size < 2 && S && S.pinch) {
				S.pinch = null;
				S.pinchEnd = Date.now();
				dragOn(false);
			}
		};
		v.addEventListener(
			"pointerdown",
			(e) => {
				if (e.pointerType === "touch" && pzOn()) {
					fingers.set(e.pointerId, { x: e.clientX, y: e.clientY });
					if (fingers.size === 2) {
						const q = pinchOf();
						S.pinch = { d0: q.d, zk0: S.zk || 1, mx: q.mx, my: q.my };
						drag = null;
						dragOn(true);
						return;
					}
					if (fingers.size > 2) return;
				}
				drag = {
					x: e.clientX,
					y: e.clientY,
					tx: S.tx,
					ty: S.ty,
					moved: false,
					id: e.pointerId,
					at: Date.now(),
				};
			},
			{ passive: true },
		);

		v.addEventListener(
			"pointermove",
			(e) => {
				if (fingers.has(e.pointerId)) {
					fingers.set(e.pointerId, { x: e.clientX, y: e.clientY });
					if (S.pinch) {
						if (!S.pinchRaf) S.pinchRaf = requestAnimationFrame(pinchFrame);
						return;
					}
				}
				if (!drag) return;
				const v3 = !!(S.Wd && S.Wd.v3),
					dx = v3 ? e.clientX - drag.x : 0,
					dy = e.clientY - drag.y;
				if (Math.hypot(dx, dy) > 6) {
					drag.moved = true;
					try {
						v.setPointerCapture(drag.id);
					} catch (x) {}
				}
				if (drag.moved) {
					dragOn(true);
					if (v3) S.tx = drag.tx + dx;
					S.ty = drag.ty + dy;
					clampY();
					apply();
				}
			},
			{ passive: true },
		);
		v.addEventListener("pointerup", (e) => {
			unfinger(e);
			const d = drag;
			drag = null;
			dragOn(false);
			if (d && !d.moved)
				click({
					target: e.target,
					clientX: e.clientX,
					clientY: e.clientY,
					shiftKey: e.shiftKey,
					long: Date.now() - d.at > 550,
					tr: e.isTrusted,
				});
		});
		v.addEventListener("pointercancel", (e) => {
			unfinger(e);
			drag = null;
			dragOn(false);
		});

		v.addEventListener(
			"click",
			(e) => {
				if (S && S.pinchEnd && Date.now() - S.pinchEnd < 400) {
					e.stopPropagation();
					e.preventDefault();
				}
			},
			true,
		);

		v.addEventListener(
			"wheel",
			(e) => {
				if (e.target.closest && e.target.closest(WHEEL_OWN)) return;
				e.preventDefault();

				if (!S.vr) {
					S.vr = v.getBoundingClientRect();
					requestAnimationFrame(() => {
						if (S) S.vr = null;
					});
				}
				const r = S.vr,
					mx = e.clientX - r.left,
					my = e.clientY - r.top,
					px = e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? 400 : 1,
					dy = e.deltaY * px,
					dx0 = e.deltaX * px;
				if (e.ctrlKey || e.metaKey) {
					zoomWheel(Math.exp(-Math.max(-60, Math.min(60, dy)) * 0.01), mx, my);
					return;
				}
				if (e.shiftKey || Math.abs(dx0) > Math.abs(dy)) {
					if (S.Wd && S.Wd.v3) {
						S.tx -= e.shiftKey ? dy || dx0 : dx0;
						clampY();
						apply();
					}
					return;
				}

				zoomWheel(
					Math.exp(-Math.max(-120, Math.min(120, dy)) * 0.0018),
					mx,
					my,
				);
			},
			{ passive: false },
		);

		S.el.addEventListener("contextmenu", (e) => {
			if (
				e.target.closest &&
				e.target.closest("input, textarea, select, a, [contenteditable]")
			)
				return;
			e.preventDefault();
		});
	}

	const HELP = (v) => ({
		title: "Как устроена шахта",
		parts: [
			[
				"Копать",
				[
					`Нажми на камень ${v.v3 ? "в жёлтом круге" : "рядом с выкопанным"}, и герой докопает его сам, даже если ты закроешь сайт.`,
					"Число на камне - его уровень: чем он выше, тем дольше копать. Несколько героев на одном камне копают быстрее.",
					...(v.v3
						? [
								"Этаж большой и скрыт туманом, так что прокапывай проходы и ищи жилы, особые залы и шахту лифта. Карта этажа висит слева сверху.",
							]
						: []),
					"Чем больше ты копаешь, тем выше мастерство «Горное дело», и тем сильнее бьёт герой.",
					v.cap > 0
						? `За сутки можно копать до ${v.capT} на все шахты вместе, новые сутки начинаются в 05:00 МСК.`
						: "Время копания за сутки считается с 05:00 МСК.",
				],
			],
			[
				"Руда и скупщик",
				[
					"Добыча с камня делится между всеми, кто его копал, по вкладу - то есть по тому, сколько работы вложил каждый. Руда считается осколками: 100 осколков = 1 штука.",
					"Если отойдёшь от недокопанного камня, свою долю руды ты получишь сразу.",
					v.buyer
						? "Оплата за работу сразу приходит в кошелёк, а руда - в сумку героя. Продай её Скупщику Грому: монеты получишь ты, а руда уйдёт в казну Ратуши."
						: "Монеты и руда копятся в рудной сумке у скупщика. Сдай её: монеты получишь ты, а руда уйдёт в казну Ратуши.",
					"Редкая жила и окаменевший сундук дают бонус всем, кто их копал, а из сундука одному ещё может выпасть сфера или звезда.",
					...(v.v3
						? ["Из казны Ратуши стример и мэр улучшают здания города."]
						: []),
				],
			],
			[
				"Каска и кирка",
				[
					`С ${v.darkFrom}-го этажа без надетой каски темно, и копать нельзя. ${v.pick ? "Каску продаёт Снабженец Кремень" : `Каску продаёт Фонарщик, он приходит в шахту с ${v.lampFrom}-го этажа`}, а надевается она через кнопку «Сумка».`,
					...(v.pick
						? [
								`Кирка - твоя навсегда, и Снабженец улучшает её за монеты и руду, если хватает «Горного дела». Адамантитовая бьёт на ${v.pickTop}% сильнее деревянной.`,
								`Рудную сумку продаёт Снабженец с ${v.obL}-го уровня «Горного дела». Руда в ней не занимает места в сумке героя.`,
							]
						: []),
				],
			],
			...(v.v3
				? [
						[
							"Лифт",
							[
								"Чтобы открыть новый этаж, найдите на самом глубоком шахту лифта и докопайтесь до неё.",
								"Потом все скидываются монетами или рудой по цене скупщика, и чем глубже этаж, тем больше нужно.",
								"Когда всё собрано, лифт улучшается по таймеру, а копать в это время можно. Лифт возит на любой открытый этаж и в город.",
							],
						],
						[
							"Буровые",
							[
								`Жила, выкопанная на ${v.drSite}%, даёт площадку для буровой. На этаже может быть не больше ${v.drMax} буровых.`,
								"Буровую строят по таймеру на общие монеты и руду, до 3-го уровня, а строители получают бонус рудой жилы.",
								`Буровая сама добывает руду, пока жила не кончится: ${v.drTr}% идёт в казну Ратуши, а ${100 - v.drTr}% делят те, кто копал в шахте за последний час.`,
							],
						],
					]
				: [
						[
							"Этажи",
							[
								"Когда все камни этажа выкопаны, шахта спускается ниже: там камни крепче, а глубже идёт другая руда.",
								"В каждом десятке этажей один угольный, на нём лежат кучи угля и рядом камни с углём.",
							],
						],
					]),
			[
				"Поручения и доска почёта",
				[
					"На доске у скупщика висят поручения: 3 на день и 2 на неделю. Награду за выполненные забирай там же.",
					...(v.qc
						? [
								`Общее поручение шахты на неделю приносит ${v.qc.c} монет каждому, кто вложил в него не меньше ${v.qc.min}.`,
							]
						: []),
					"Вкладка «Доска почёта» показывает твой вклад за неделю и лучших копателей.",
				],
			],
			[
				"Неделя",
				[
					`Каждую субботу в 18:00 МСК начинается новая шахта с 1-го этажа, а ${v.pick ? "кирка, сумка" : "сумка"}, казна и мастерство остаются.`,
					`Если твой вклад за неделю не меньше 60 (около часа копания), ты получишь награду за глубину: ${v.week}. Между этими этажами она растёт плавно.`,
					"С 30-го этажа к награде добавляется сфера, а с 60-го - ещё и звезда.",
				],
			],
		],
	});

	const helpHm = (min) => {
		const m = Math.max(0, Math.round(min));
		return m >= 60
			? `${Math.floor(m / 60)} ч${m % 60 ? ` ${m % 60} мин` : ""}`
			: `${m} мин`;
	};
	const helpPct = (x, d) =>
		x != null && x !== "" && Number.isFinite(+x) && +x >= 0
			? Math.round(+x * 100)
			: d;
	function help() {
		if (document.querySelector(".mn-help")) return;
		const st = (S && S.st) || {},
			me = (S && S.me) || {},
			cap = +me.cap || 0,
			dk = st.dk || {},
			pk = me.pkx || {};

		const wka =
			Array.isArray(st.wka) && st.wka.length
				? st.wka
				: [
						[0, 0],
						[10, 80],
						[20, 200],
						[30, 400],
						[40, 550],
						[60, 900],
					];
		const week =
			wka
				.filter(([f, c]) => f > 0 && c > 0)
				.map(([f, c], k) => `${f}-й${k ? "" : " этаж"} - ${c}`)
				.join(", ") + " монет";
		const top =
			Array.isArray(pk.t) && pk.t.length ? +pk.t[pk.t.length - 1][1] : 1.7;
		const qc =
			me.q && me.q.c ? { c: +me.q.c.c || 0, min: +me.q.c.min || 0 } : null;
		const H = HELP({
			lampFrom: st.lampFrom || 4,
			darkFrom: st.darkFrom || 5,
			cap,
			capT: helpHm(cap),
			week,
			pick: pickOn(),
			buyer: buyerOn(),
			v3: V3(),
			qc,
			pickTop: helpPct(top - 1, 70),
			obL: pk.obL != null && Number.isFinite(+pk.obL) ? +pk.obL : 2,
			drSite: helpPct(dk.site, 70),
			drTr: helpPct(dk.tr, 70),
			drMax: dk.max != null && Number.isFinite(+dk.max) ? +dk.max : 2,
		});
		const d = document.createElement("div");
		d.className = "mn-board-w mn-help";
		gwRoot(d);
		d.setAttribute("role", "dialog");
		d.setAttribute("aria-modal", "true");
		d.setAttribute("aria-labelledby", "mn-help-h");
		d.innerHTML = `<div class="mn-board panel"><div class="mn-help-hd"><h3 class="h3" id="mn-help-h">${esc(H.title)}</h3><button type="button" class="mn-help-x" data-x aria-label="Закрыть" title="Закрыть">×</button></div>
      ${H.parts.map(([h, li]) => `<h4>${esc(h)}</h4><ul class="mn-help-l">${li.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`).join("")}
      <button type="button" class="btn primary" data-x>Понятно</button></div>`;
		host().appendChild(d);
		const from = document.activeElement;
		const shut = () => {
			d.remove();
			document.removeEventListener("keydown", k2, true);
			try {
				if (from && from.isConnected) from.focus({ preventScroll: true });
			} catch (e) {}
		};
		const k2 = (e) => {
			if (e.key === "Escape") {
				e.preventDefault();
				e.stopPropagation();
				shut();
			}
		};
		document.addEventListener("keydown", k2, true);
		d.addEventListener("pointerdown", (e) => {
			if (e.target === d) shut();
		});
		d.querySelectorAll("[data-x]").forEach((b) => {
			b.onclick = shut;
		});
		try {
			d.querySelector(".mn-help-x").focus({ preventScroll: true });
		} catch (e) {}
	}

	let BD = null;
	async function board(Y, c0) {
		if (BD && BD.d.isConnected) {
			if (c0) BD.show(c0);
			try {
				BD.d.querySelector("button").focus();
			} catch (e) {}
			return;
		}
		const d = document.createElement("div");
		d.className = "mn-board-w";
		gwRoot(d);
		d.setAttribute("role", "dialog");
		d.setAttribute("aria-label", "Итоги шахт");
		d.innerHTML =
			'<div class="mn-board panel"><p class="muted">Смотрю доску…</p></div>';
		host().appendChild(d);

		const M = S && S.el ? S : null;

		const shut = window.LGSiteUi.layer(d, {});
		const list = (Y.mines && Y.mines()) || [];
		async function show(c) {
			const r = await Y.api(`/api/mine/state?c=${encodeURIComponent(c)}`);
			if (!d.isConnected) return;
			const st = r && r.st;
			const me = Y.login(),
				row = (l, u, i) =>
					`<li class="${l === me ? "me" : ""}"><span>${i + 1}</span><b>${esc(l === me ? l + " (ты)" : l)}</b><em>${u}</em></li>`;
			const h0 = st && st.hist && st.hist[0];
			const tabs =
				list.length > 1
					? `<div class="mn-bd-tabs" role="tablist">${list.map((m) => `<button type="button" role="tab" class="btn ${m.id === c ? "primary" : "ghost"} sm" aria-selected="${m.id === c}" data-bt="${esc(m.id)}">${esc(m.id === "home" ? "Домашняя" : m.nm)} ${stars(m.dg)}</button>`).join("")}</div>`
					: "";
			const title =
				st && st.name && st.id !== "home"
					? `Итоги шахты · ${st.name}`
					: "Итоги шахты";
			d.querySelector(".mn-board").innerHTML = !st
				? `${tabs}<p>${esc((r && r.error) || "Доска пока пуста — шахта ещё не открылась.")}</p><button type="button" class="btn primary" data-x>Закрыть</button>`
				: `<h3 class="h3">${esc(title)}</h3>${tabs}<p class="muted">${stars(st.danger)} · ${esc(BIO_RU[st.biome] || "")}${st.gem ? ` · самоцвет — ${esc(resName(st.gem))}` : ""}</p>
          <div class="mn-bd-sum"><div><b>${st.n}</b><span>этаж сейчас</span></div><div><b>${st.rec || st.n}</b><span>рекорд</span></div><div><b>${st.working || 0}</b><span>копают</span></div></div>
          <h4>Лучшие копатели недели</h4><ol class="mn-bd-top">${(st.top || []).map(([l, u], i) => row(l, u, i)).join("") || '<li class="muted">Пока никто не копал</li>'}</ol>
          ${
						h0
							? `<h4>Прошлая неделя — до этажа ${h0.floor}, копателей: ${h0.players}</h4><ol class="mn-bd-top">${(
									h0.top || []
								)
									.slice(0, 5)
									.map((x, i) => row(x.l, x.u, i))
									.join("")}</ol>`
							: ""
					}
          <p class="muted">Вклад — сколько работы вложил герой. Каждую субботу в 18:00 — новая шахта.</p><button type="button" class="btn primary" data-x>Закрыть</button>`;
			d.querySelector("[data-x]").onclick = shut;
			d.querySelectorAll("[data-bt]").forEach((b) => {
				b.onclick = () => show(b.dataset.bt);
			});
		}
		BD = { d, shut, show, mine: !!M };
		show(c0 || (list[0] && list[0].id) || "home");
	}

	const cam = (x, y, z) => {
		if (!S || !S.view) return false;
		S.z = Math.max(0.2, Math.min(2, +z || S.z));
		S.tx = S.view.clientWidth / 2 - x * S.z;
		S.ty = S.view.clientHeight / 2 - y * S.z;
		apply();
		return true;
	};

	window.LGMine = {
		cam,
		open,
		close,
		exit,
		onEvent,
		board,
		host,
		result,
		hero: () => {
			bagDraw();
			if (S && S.buyInv) buyInv();
			if (S) pinDraw();
			newsHero();
		},
		get on() {
			return !!S;
		},

		dbg: () =>
			S
				? {
						at0: S.at0,
						atF: S.atF || 0,
						now: Date.now(),
						F: !!S.F,
						st: !!S.st,
						news: S.me && S.me.news ? newsKey(S.me.news) : "",
						newsShown: !!S.newsShown,
						seen: NEWS_SEEN[C] || "",
					}
				: null,
	};
})();
