((root, factory) => {
	if (typeof module === "object" && module.exports)
		module.exports = factory(require("./index.js"));
	else root.LGDistrictGen = factory(root.LGWorldLib);
})(typeof self !== "undefined" ? self : this, (WL) => {
	const VER = 4;
	const KINDS = Object.freeze([
		"town",
		"gate",
		"exit",
		"tract",
		"cross",
		"pack",
		"elite",
		"dungeon",
		"lair",
		"spot",
		"way",
	]);
	const TIERS = Object.freeze(["weak", "mid", "strong"]);
	const TRACT_KINDS = Object.freeze(["gate", "exit", "tract"]);

	const PACK_N = Object.freeze([0, 85, 105, 135, 165, 195]);

	const STAND_MAX = 3;

	const STAND_GEN = 1;

	const WAY_N = Object.freeze([0, 18, 20, 22, 24, 26]);
	const MARK_N = 3;
	const MAIN_PLACES_MAX = 10;
	const WEAK_PLACES = 4;
	const ELITE_N = Object.freeze([0, 1, 1, 2, 2, 3]);
	const DUNGEON_N = 1;

	const SPOT_N = Object.freeze([0, 6, 7, 8, 9, 10]);
	const ESCORT_N = 3;
	const MAIN_SHARE = 0.25;
	const SHARE_TOL = 0.1;
	const BYPASS_K = 0.6;
	const MID_SHARE = 0.55;

	const SPECIAL_AREA_PER_PACK = 7000;
	const MIN_SEP = 24;

	const VIEW_K = 4.4;
	const TRIES = 60;

	const MARK_BY_BIOME = {
		meadow: "lake",
		forest: "lake",
		taiga: "lake",
		swamp: "lake",
		coast: "lake",
		ice: "rock",
		mount: "rock",
		desert: "rock",
		ash: "rock",
		ruin: "ruin",
		blight: "ruin",
	};
	const MARK_WAY = {
		lake: ["У озера", "Берег", "Мостки", "Камыши"],
		rock: ["У скал", "Под утёсом", "Каменный карман"],
		ruin: ["Развалины", "Обломки стены", "Старый подвал"],
	};
	const WAY_NAMES = {
		meadow: [
			"Старый дуб",
			"Опушка",
			"Брод",
			"Пастушья тропа",
			"Валуны",
			"Родник",
			"Межа",
			"Стог",
			"Кривая берёза",
			"Овражек",
		],
		forest: [
			"Старый дуб",
			"Бурелом",
			"Опушка",
			"Лесной родник",
			"Муравейник",
			"Поваленная ель",
			"Грибная поляна",
			"Овражек",
			"Дупло",
		],
		taiga: [
			"Ельник",
			"Медвежий след",
			"Распадок",
			"Сухостой",
			"Родник",
			"Каменная гряда",
			"Заимка",
			"Брусничник",
		],
		ice: [
			"Наст",
			"Сугробы",
			"Ледяной валун",
			"Застывший ручей",
			"Снежный карман",
			"Ледяная арка",
		],
		mount: [
			"Осыпь",
			"Карниз",
			"Перевальчик",
			"Горный родник",
			"Пещерка",
			"Каменный идол",
		],
		swamp: [
			"Кочки",
			"Гать",
			"Гнилой пень",
			"Трясинка",
			"Сухой островок",
			"Туман",
			"Утопленная лодка",
		],
		desert: [
			"Бархан",
			"Сухое русло",
			"Каменный столб",
			"Кости",
			"Колодец",
			"Тень скалы",
		],
		ash: [
			"Пепелище",
			"Остывшая лава",
			"Обгорелый лес",
			"Трещина",
			"Серный ключ",
			"Шлак",
		],
		coast: [
			"Отмель",
			"Дюна",
			"Плавник",
			"Старая лодка",
			"Маячный камень",
			"Сети",
		],
		ruin: [
			"Сожжённый дом",
			"Колодец",
			"Обрушенная арка",
			"Пустой двор",
			"Площадь",
			"Погреб",
		],
		blight: [
			"Чёрное древо",
			"Ядовитый туман",
			"Кости",
			"Гнилая поляна",
			"Курган",
			"Сухое русло",
		],
	};

	const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
	const pt = (x, y) => ({ x, y });
	function inPoly(poly, x, y) {
		if (!poly || poly.length < 6) return true;
		let c = false;
		for (let i = 0, j = poly.length - 2; i < poly.length; j = i, i += 2) {
			const xi = poly[i],
				yi = poly[i + 1],
				xj = poly[j],
				yj = poly[j + 1];
			if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
				c = !c;
		}
		return c;
	}
	function segDist(p, a, b) {
		const dx = b.x - a.x,
			dy = b.y - a.y,
			L = dx * dx + dy * dy;
		const t = L
			? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / L))
			: 0;
		return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
	}
	function polyEdgeDist(poly, p) {
		if (!poly || poly.length < 6) return Infinity;
		let m = Infinity;
		for (let i = 0, j = poly.length - 2; i < poly.length; j = i, i += 2)
			m = Math.min(
				m,
				segDist(p, pt(poly[j], poly[j + 1]), pt(poly[i], poly[i + 1])),
			);
		return m;
	}
	const orient = (a, b, c) =>
		Math.sign((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x));

	function cross(a, b, c, d) {
		if (a === c || a === d || b === c || b === d) return false;
		if (
			(a.x === c.x && a.y === c.y) ||
			(a.x === d.x && a.y === d.y) ||
			(b.x === c.x && b.y === c.y) ||
			(b.x === d.x && b.y === d.y)
		)
			return false;
		const o1 = orient(a, b, c),
			o2 = orient(a, b, d),
			o3 = orient(c, d, a),
			o4 = orient(c, d, b);
		return (
			o1 !== o2 && o3 !== o4 && o1 !== 0 && o2 !== 0 && o3 !== 0 && o4 !== 0
		);
	}
	function polyArea(poly) {
		let s = 0;
		for (let i = 0, j = poly.length - 2; i < poly.length; j = i, i += 2)
			s += poly[j] * poly[i + 1] - poly[i] * poly[j + 1];
		return Math.abs(s / 2);
	}

	function ringOf(W, id) {
		const segs = (W.chains || [])
			.filter((c) => c.l === id || c.r === id)
			.map((c) => c.p.slice());
		if (!segs.length) return null;
		const key = (x, y) => `${x},${y}`;
		let ring = segs.shift();
		let guard = 0;
		while (segs.length && guard++ < 1000) {
			const ex = ring[ring.length - 2],
				ey = ring[ring.length - 1];
			let k = segs.findIndex((s) => key(s[0], s[1]) === key(ex, ey));
			if (k >= 0) {
				ring = ring.concat(segs.splice(k, 1)[0].slice(2));
				continue;
			}
			k = segs.findIndex(
				(s) => key(s[s.length - 2], s[s.length - 1]) === key(ex, ey),
			);
			if (k >= 0) {
				const s = segs.splice(k, 1)[0],
					r = [];
				for (let i = s.length - 2; i >= 0; i -= 2) r.push(s[i], s[i + 1]);
				ring = ring.concat(r.slice(2));
				continue;
			}
			return null;
		}
		if (
			ring.length > 4 &&
			ring[0] === ring[ring.length - 2] &&
			ring[1] === ring[ring.length - 1]
		)
			ring = ring.slice(0, -2);
		return ring.length >= 6 ? ring : null;
	}
	const chainMid = (p) => chainAt(p, 0.5);
	function chainAt(p, frac) {
		let L = 0;
		for (let i = 2; i < p.length; i += 2)
			L += Math.hypot(p[i] - p[i - 2], p[i + 1] - p[i - 1]);
		let half = L * frac;
		for (let i = 2; i < p.length; i += 2) {
			const s = Math.hypot(p[i] - p[i - 2], p[i + 1] - p[i - 1]);
			if (half <= s && s > 0) {
				const t = half / s;
				return pt(
					p[i - 2] + (p[i] - p[i - 2]) * t,
					p[i - 1] + (p[i + 1] - p[i - 1]) * t,
				);
			}
			half -= s;
		}
		return pt(p[0], p[1]);
	}
	function inputOf(W, id) {
		const t = (W.territories || []).find((x) => x.id === id);
		if (!t) return null;
		const contour = ringOf(W, id);
		const c = pt(t.c[0], t.c[1]);
		const exits = [];
		for (const nb of t.nb || []) {
			const ch = (W.chains || []).filter(
				(x) => (x.l === id && x.r === nb) || (x.r === id && x.l === nb),
			);
			if (!ch.length) continue;
			const longest = ch.reduce((a, b) => (b.p.length > a.p.length ? b : a));
			const m = chainMid(longest.p);

			const k = Math.min(1, (t.rad * 0.06) / Math.max(1, dist(m, c)));
			const alt = [0.22, 0.78].map((f) => {
				const q = chainAt(longest.p, f),
					kk = Math.min(1, (t.rad * 0.06) / Math.max(1, dist(q, c)));
				return {
					x: Math.round(q.x + (c.x - q.x) * kk),
					y: Math.round(q.y + (c.y - q.y) * kk),
				};
			});
			exits.push({
				to: nb,
				x: Math.round(m.x + (c.x - m.x) * k),
				y: Math.round(m.y + (c.y - m.y) * k),
				alt,
			});
		}
		return {
			id: t.id,
			star: +t.danger || 1,
			biome: t.biome,
			c,
			rad: +t.rad || 300,
			area: contour ? polyArea(contour) : +t.area || Math.PI * t.rad * t.rad,
			town: t.town ? pt(t.town.x, t.town.y) : c,
			contour,
			exits,
			lair: !!t.lair,
			special: t.gate ? "gate" : t.grand ? "grand" : null,
		};
	}

	function counts(star, o = {}, inp = null) {
		const s = Math.max(1, Math.min(5, Math.round(+star) || 1));
		let packs = o.packs != null ? +o.packs : PACK_N[s];
		if (o.packs == null && inp && inp.special && inp.area > 0)
			packs = Math.max(
				Math.round(PACK_N[1] * 0.6),
				Math.min(packs, Math.floor(inp.area / SPECIAL_AREA_PER_PACK)),
			);

		const tight = !!(
			inp &&
			inp.area > 0 &&
			(inp.special || inp.area / packs < 4000)
		);
		const ways =
			o.ways != null
				? +o.ways
				: tight
					? Math.min(WAY_N[s], Math.max(4, Math.round(inp.area / 40000)))
					: WAY_N[s];
		const spots =
			o.spots != null ? +o.spots : tight ? Math.min(SPOT_N[s], 4) : SPOT_N[s];
		return {
			star: s,
			packs,
			elites: o.elites != null ? +o.elites : ELITE_N[s],
			dungeons: o.dungeons != null ? +o.dungeons : DUNGEON_N,
			escort: o.escort != null ? +o.escort : ESCORT_N,
			spots,
			ways,
			marks: o.marks != null ? +o.marks : MARK_N,
			weak: WEAK_PLACES,
			main: Math.max(2, Math.round(packs * MAIN_SHARE)),
		};
	}

	function attemptOf(inp, n, attempt, opts = {}) {
		const r = WL.rng(WL.hash(`district:${inp.id}:${VER}:${attempt}`));
		const poly = inp.contour;
		const total =
			n.packs / (STAND_GEN === 1 ? 1 : 2.1) +
			n.elites +
			n.dungeons +
			n.escort +
			n.spots +
			n.ways +
			inp.exits.length * 4 +
			10;
		const gap = Math.max(
			36,
			Math.min(150, (opts.gapK || 0.55) * Math.sqrt(inp.area / total)),
		);
		const nodes = [],
			edges = [];
		let seq = 0;
		const townClr = 0.8;
		const IDX = new Map();
		const add = (kind, x, y, extra) => {
			const nd = {
				id: `n${seq++}`,
				kind,
				x: Math.round(x),
				y: Math.round(y),
				...(extra || {}),
			};
			nodes.push(nd);
			IDX.set(nd.id, nd);
			return nd;
		};
		const link = (a, b, tract) => {
			const e = { a: a.id, b: b.id, d: Math.round(dist(a, b)) };
			if (tract) e.tract = true;
			edges.push(e);
			a.deg = (a.deg || 0) + 1;
			b.deg = (b.deg || 0) + 1;
			return e;
		};
		const byId = (id) => IDX.get(id);

		let qx0 = inp.c.x - inp.rad,
			qx1 = inp.c.x + inp.rad,
			qy0 = inp.c.y - inp.rad,
			qy1 = inp.c.y + inp.rad;
		if (poly) {
			qx0 = Infinity;
			qx1 = -Infinity;
			qy0 = Infinity;
			qy1 = -Infinity;
			for (let i = 0; i < poly.length; i += 2) {
				qx0 = Math.min(qx0, poly[i]);
				qx1 = Math.max(qx1, poly[i]);
				qy0 = Math.min(qy0, poly[i + 1]);
				qy1 = Math.max(qy1, poly[i + 1]);
			}
		}
		const anyPt = () => pt(qx0 + r() * (qx1 - qx0), qy0 + r() * (qy1 - qy0));
		const marks = [];
		const packsAt = (x) => (x.kind === "pack" ? x.n || 1 : 0);
		const packSum = () => nodes.reduce((m, x) => m + packsAt(x), 0);
		const pickN = () => {
			if (STAND_GEN === 1) return 1;
			const q = r();
			return q < 0.25 ? 1 : q < 0.7 ? 2 : 3;
		};
		const inside = (p, m) =>
			inPoly(poly, p.x, p.y) && polyEdgeDist(poly, p) >= m;

		function roadOk(a, b, skip) {
			const bx0 = Math.min(a.x, b.x),
				bx1 = Math.max(a.x, b.x),
				by0 = Math.min(a.y, b.y),
				by1 = Math.max(a.y, b.y);
			for (const e of edges) {
				const p = byId(e.a),
					q = byId(e.b);
				if (
					Math.max(p.x, q.x) < bx0 ||
					Math.min(p.x, q.x) > bx1 ||
					Math.max(p.y, q.y) < by0 ||
					Math.min(p.y, q.y) > by1
				)
					continue;
				if (cross(a, b, p, q)) return false;
			}
			const pad = gap * 0.85;
			for (const x of nodes) {
				if (
					x === a ||
					x === b ||
					x.x < bx0 - pad ||
					x.x > bx1 + pad ||
					x.y < by0 - pad ||
					x.y > by1 + pad ||
					(skip && skip.includes(x))
				)
					continue;
				if (segDist(x, a, b) < gap * (x.kind === "town" ? townClr : 0.3))
					return false;
			}
			for (const m of marks)
				if (segDist(m, a, b) < m.r + gap * 0.25) return false;
			return true;
		}
		function spotOk(p, from, sep = 0.8) {
			if (!inside(p, gap * 0.35)) return false;
			for (const x of nodes) if (dist(x, p) < gap * sep) return false;
			for (const m of marks) if (dist(m, p) < m.r + gap * 0.4) return false;
			return !from || roadOk(from, p);
		}

		function near(anchor, kind, extra, opt = {}) {
			for (let i = 0; i < (opt.tries || 36); i++) {
				const a =
					opt.dir != null
						? opt.dir + (r() - 0.5) * (opt.spread || Math.PI)
						: r() * Math.PI * 2;
				const L = gap * (1 + r() * 0.6);
				const p = pt(anchor.x + Math.cos(a) * L, anchor.y + Math.sin(a) * L);
				if (!spotOk(p, anchor)) continue;
				const nd = add(kind, p.x, p.y, extra);
				link(anchor, nd);
				return nd;
			}
			return null;
		}

		function chain(from, to, k, kind, extra) {
			let cur = from;
			const out = [];
			for (let i = 0; i < k; i++) {
				const left = k - i + 1,
					D = dist(cur, to),
					want = D / left;
				const base = Math.atan2(to.y - cur.y, to.x - cur.x);
				let placed = null;
				for (let t = 0; t < 60 && !placed; t++) {
					const s = Math.max(gap * 1.02, want) * (1 + r() * 0.25);
					const dev =
						want >= s
							? (r() - 0.5) * 0.9
							: Math.acos(Math.max(-1, Math.min(1, want / s))) *
									(r() < 0.5 ? -1 : 1) +
								(r() - 0.5) * 0.5;
					const a =
						base + dev * (1 + t / 30) + (t > 30 ? (r() - 0.5) * 1.2 : 0);
					const p = pt(cur.x + Math.cos(a) * s, cur.y + Math.sin(a) * s);
					if (dist(p, to) < gap * 0.9 && i < k - 1) continue;
					if (!spotOk(p, cur)) continue;
					placed = add(kind, p.x, p.y, extra ? { ...extra } : undefined);
					link(cur, placed);
				}
				if (!placed) return null;
				out.push(placed);
				cur = placed;
			}
			if (!roadOk(cur, to)) return null;
			link(cur, to);
			return out;
		}

		function plan(a, b) {
			const cs = gap * 0.4;
			let bx0 = Infinity,
				by0 = Infinity,
				bx1 = -Infinity,
				by1 = -Infinity;
			if (poly)
				for (let i = 0; i < poly.length; i += 2) {
					bx0 = Math.min(bx0, poly[i]);
					bx1 = Math.max(bx1, poly[i]);
					by0 = Math.min(by0, poly[i + 1]);
					by1 = Math.max(by1, poly[i + 1]);
				}
			else {
				bx0 = inp.c.x - inp.rad * 1.3;
				bx1 = inp.c.x + inp.rad * 1.3;
				by0 = inp.c.y - inp.rad * 1.3;
				by1 = inp.c.y + inp.rad * 1.3;
			}
			const GW = Math.ceil((bx1 - bx0) / cs) + 1,
				GH = Math.ceil((by1 - by0) / cs) + 1;
			const cx = (i) => bx0 + (i % GW) * cs,
				cy = (i) => by0 + Math.floor(i / GW) * cs;
			const cell = (p) =>
				Math.max(0, Math.min(GH - 1, Math.round((p.y - by0) / cs))) * GW +
				Math.max(0, Math.min(GW - 1, Math.round((p.x - bx0) / cs)));
			const blocked = new Uint8Array(GW * GH);
			const freeA = (q) => dist(q, a) < gap * 0.75 || dist(q, b) < gap * 0.75;
			for (let i = 0; i < GW * GH; i++) {
				const q = pt(cx(i), cy(i));
				if (!freeA(q) && !inside(q, gap * 0.3)) blocked[i] = 1;
			}
			const stamp = (x0, y0, x1, y1, test) => {
				const i0 = Math.max(0, Math.floor((x0 - bx0) / cs)),
					i1 = Math.min(GW - 1, Math.ceil((x1 - bx0) / cs));
				const j0 = Math.max(0, Math.floor((y0 - by0) / cs)),
					j1 = Math.min(GH - 1, Math.ceil((y1 - by0) / cs));
				for (let j = j0; j <= j1; j++)
					for (let i = i0; i <= i1; i++) {
						const k = j * GW + i;
						if (blocked[k]) continue;
						const q = pt(cx(k), cy(k));
						if (!freeA(q) && test(q)) blocked[k] = 1;
					}
			};
			for (const x of nodes) {
				if (x === a || x === b) continue;
				const R = gap * 0.7;
				stamp(x.x - R, x.y - R, x.x + R, x.y + R, (q) => dist(x, q) < R);
			}
			for (const m of marks) {
				const R = m.r + gap * 0.3;
				stamp(m.x - R, m.y - R, m.x + R, m.y + R, (q) => dist(m, q) < R);
			}
			for (const e of edges) {
				const u = byId(e.a),
					v = byId(e.b),
					R = gap * 0.45;
				stamp(
					Math.min(u.x, v.x) - R,
					Math.min(u.y, v.y) - R,
					Math.max(u.x, v.x) + R,
					Math.max(u.y, v.y) + R,
					(q) => segDist(q, u, v) < R,
				);
			}
			const s0 = cell(a),
				s1 = cell(b),
				G = new Float64Array(GW * GH).fill(Infinity),
				P = new Int32Array(GW * GH).fill(-1),
				done = new Uint8Array(GW * GH);
			const h = (i) => Math.hypot(cx(i) - b.x, cy(i) - b.y);

			const hp = [],
				hf = [];
			const push = (i, f) => {
				hp.push(i);
				hf.push(f);
				let c = hp.length - 1;
				while (c > 0) {
					const p = (c - 1) >> 1;
					if (hf[p] <= hf[c]) break;
					[hp[p], hp[c]] = [hp[c], hp[p]];
					[hf[p], hf[c]] = [hf[c], hf[p]];
					c = p;
				}
			};
			const pop = () => {
				const top = hp[0],
					li = hp.pop(),
					lf = hf.pop();
				if (hp.length) {
					hp[0] = li;
					hf[0] = lf;
					let c = 0;
					for (;;) {
						const l = 2 * c + 1,
							rr = l + 1;
						let m = c;
						if (l < hp.length && hf[l] < hf[m]) m = l;
						if (rr < hp.length && hf[rr] < hf[m]) m = rr;
						if (m === c) break;
						[hp[m], hp[c]] = [hp[c], hp[m]];
						[hf[m], hf[c]] = [hf[c], hf[m]];
						c = m;
					}
				}
				return top;
			};
			G[s0] = 0;
			push(s0, h(s0));
			while (hp.length) {
				const u = pop();
				if (u === s1) break;
				if (done[u]) continue;
				done[u] = 1;
				const ux = u % GW,
					uy = Math.floor(u / GW);
				for (let dy = -1; dy <= 1; dy++)
					for (let dx = -1; dx <= 1; dx++) {
						if (!dx && !dy) continue;
						const vx = ux + dx,
							vy = uy + dy;
						if (vx < 0 || vy < 0 || vx >= GW || vy >= GH) continue;
						const v = vy * GW + vx;
						if (blocked[v] || done[v]) continue;
						const g = G[u] + (dx && dy ? 1.4142 : 1) * cs * (1 + r() * 0.15);
						if (g < G[v]) {
							G[v] = g;
							P[v] = u;
							push(v, g + h(v));
						}
					}
			}
			if (!Number.isFinite(G[s1])) return null;
			const out = [];
			for (let i = s1; i !== -1; i = P[i]) out.unshift(pt(cx(i), cy(i)));
			out[0] = pt(a.x, a.y);
			out[out.length - 1] = pt(b.x, b.y);
			return out;
		}

		function chainOn(from, to, kMin, kMax, kind, extra) {
			const way = plan(from, to);
			if (!way) return null;
			const acc = [0];
			for (let i = 1; i < way.length; i++)
				acc.push(acc[i - 1] + dist(way[i - 1], way[i]));
			const L = acc[acc.length - 1];
			const at = (s) => {
				let i = 1;
				while (i < acc.length - 1 && acc[i] < s) i++;
				const t = (s - acc[i - 1]) / Math.max(1e-9, acc[i] - acc[i - 1]);
				return pt(
					way[i - 1].x + (way[i].x - way[i - 1].x) * t,
					way[i - 1].y + (way[i].y - way[i - 1].y) * t,
				);
			};
			const dirAt = (s) => {
				const a = at(Math.max(0, s - 2)),
					b = at(Math.min(L, s + 2));
				const D = Math.max(1e-9, dist(a, b));
				return pt((b.x - a.x) / D, (b.y - a.y) / D);
			};
			for (
				let k = Math.min(kMax, Math.floor(L / (gap * 0.75)) - 1);
				k >= kMin;
				k--
			) {
				const step = L / (k + 1);

				const amp =
					step >= gap * 0.95
						? 0
						: Math.sqrt(Math.max(0, (gap * 0.95) ** 2 - step * step)) / 2;
				for (let tr = 0; tr < 8; tr++) {
					const pts = [],
						sg = r() < 0.5 ? 1 : -1;
					for (let i = 1; i <= k; i++) {
						const sAt = step * (i + (amp ? 0 : (r() - 0.5) * 0.3)),
							q = at(sAt),
							d = dirAt(sAt),
							o = amp ? amp * (i % 2 ? sg : -sg) * (1 + (r() - 0.5) * 0.2) : 0;
						pts.push(pt(q.x - d.y * o, q.y + d.x * o));
					}
					const seqP = [from, ...pts, to];
					let good = true;
					for (let i = 0; i < pts.length && good; i++) {
						if (
							!inside(pts[i], gap * 0.3) ||
							nodes.some((x) => dist(x, pts[i]) < gap * 0.75) ||
							marks.some((m) => dist(m, pts[i]) < m.r + gap * 0.4)
						)
							good = false;
						for (let j = 0; j < i && good; j++)
							if (dist(pts[i], pts[j]) < gap * 0.75) good = false;
					}
					for (let i = 0; i + 1 < seqP.length && good; i++) {
						const u = seqP[i],
							v = seqP[i + 1];
						if (edges.some((e) => cross(u, v, byId(e.a), byId(e.b))))
							good = false;
						for (let j = 0; j + 1 < i && good; j++)
							if (cross(u, v, seqP[j], seqP[j + 1])) good = false;
						if (
							good &&
							nodes.some(
								(x) => x !== from && x !== to && segDist(x, u, v) < gap * 0.3,
							)
						)
							good = false;
					}
					if (!good) continue;
					let prev = from;
					const out = [];
					for (const p of pts) {
						const nd = add(kind, p.x, p.y, extra ? { ...extra } : undefined);
						link(prev, nd);
						out.push(nd);
						prev = nd;
					}
					link(prev, to);
					return out;
				}
			}
			return null;
		}

		const town = add("town", inp.town.x, inp.town.y);
		let dg = Math.atan2(inp.c.y - town.y, inp.c.x - town.x);
		if (dist(town, inp.c) < gap * 0.5) dg = Math.PI / 2;
		let gate = null;
		for (let i = 0; i < 12 && !gate; i++) {
			const a = dg + (i ? (i % 2 ? 1 : -1) * Math.ceil(i / 2) * 0.35 : 0),
				p = pt(
					town.x + Math.cos(a) * gap * 0.9,
					town.y + Math.sin(a) * gap * 0.9,
				);
			if (inside(p, gap * 0.2)) gate = add("gate", p.x, p.y);
		}
		if (!gate) return null;
		link(town, gate);

		const exits = inp.exits.map((e) => add("exit", e.x, e.y, { to: e.to }));
		const tractNodes = [gate];

		function legPts(from, ex, via) {
			const way = via ? [from, via, ex] : [from, ex],
				pts = [];
			for (let w = 0; w + 1 < way.length; w++) {
				const u = way[w],
					v = way[w + 1],
					D = dist(u, v),
					k = Math.max(0, Math.round(D / (gap * 1.5)) - 1);
				for (let i = 1; i <= k; i++) {
					const t = i / (k + 1),
						j = (r() - 0.5) * gap * 0.4,
						nx = -(v.y - u.y) / D,
						ny = (v.x - u.x) / D;
					let p = pt(
						u.x + (v.x - u.x) * t + nx * j,
						u.y + (v.y - u.y) * t + ny * j,
					);
					for (let g = 0; g < 8 && !inside(p, gap * 0.15); g++)
						p = pt(p.x + (inp.c.x - p.x) * 0.15, p.y + (inp.c.y - p.y) * 0.15);
					pts.push(p);
				}
				if (w === 0 && via) pts.push(via);
			}
			const seqP = [from, ...pts, ex];
			for (let i = 0; i + 1 < seqP.length; i++)
				if (!roadOk(seqP[i], seqP[i + 1], [from, ex])) return null;
			for (let i = 0; i < pts.length; i++) {
				if (!inside(pts[i], gap * 0.1)) return null;
				if (
					nodes.some(
						(x) => x !== from && x !== ex && dist(x, pts[i]) < gap * 0.6,
					)
				)
					return null;
				for (let j = 0; j < i; j++)
					if (dist(pts[i], pts[j]) < gap * 0.6) return null;
			}
			return pts;
		}
		let left = exits.slice().sort((a, b) => dist(a, gate) - dist(b, gate));
		for (let round = 0; round < 3 && left.length; round++) {
			const later = [];
			for (const ex of left) {
				const cand = tractNodes
					.slice()
					.sort(
						(a, b) =>
							dist(a, ex) +
							0.35 * dist(a, gate) -
							(dist(b, ex) + 0.35 * dist(b, gate)),
					);
				let pts = null,
					from = null;
				for (const f of cand) {
					pts = legPts(f, ex);
					if (pts) {
						from = f;
						break;
					}
				}

				for (const f of cand.slice(0, 4)) {
					if (pts) break;
					const D = dist(f, ex),
						base = Math.atan2(ex.y - f.y, ex.x - f.x);
					for (const th of [0.6, -0.6, 1.0, -1.0, 1.4, -1.4]) {
						const L = (D * 0.5) / Math.cos(Math.min(1.2, Math.abs(th))),
							via = pt(
								f.x + Math.cos(base + th) * L,
								f.y + Math.sin(base + th) * L,
							);
						if (!inside(via, gap * 0.3)) continue;
						pts = legPts(f, ex, via);
						if (pts) {
							from = f;
							break;
						}
					}
				}
				if (!pts) {
					later.push(ex);
					continue;
				}
				let prev = from;
				for (const p of pts) {
					const nd = add("tract", p.x, p.y);
					link(prev, nd, true);
					tractNodes.push(nd);
					prev = nd;
				}
				link(prev, ex, true);
				tractNodes.push(ex);
			}
			left = later;
		}
		if (left.length) return null;

		const tractSegs = () =>
			edges.filter((e) => e.tract).map((e) => [byId(e.a), byId(e.b)]);

		let lair = null,
			best = -1;
		for (let i = 0; i < 260; i++) {
			const p = anyPt();
			if (!spotOk(p, null, 1.2) || polyEdgeDist(poly, p) < gap * 1.2) continue;
			let m = dist(p, gate) * 0.6;
			for (const [u, v] of tractSegs()) m = Math.min(m, segDist(p, u, v));
			m = Math.min(m, gap * 4) + r() * gap * 0.5;
			for (const ex of exits) m = Math.min(m, dist(p, ex) * 0.8);
			if (m > best) {
				best = m;
				lair = p;
			}
		}
		if (!lair || best < gap * 1.6) return null;

		const hand = inp.hand || null;
		if (hand && Array.isArray(hand.lair)) {
			const hp = pt(+hand.lair[0], +hand.lair[1]);
			if (!spotOk(hp, null, 1.2)) return null;
			lair = hp;
		}
		lair = add(
			"lair",
			lair.x,
			lair.y,
			hand && hand.boss ? { boss: String(hand.boss) } : undefined,
		);

		const escorts = [];
		const toGate = Math.atan2(gate.y - lair.y, gate.x - lair.x);
		const angs = [0, 1.25, -1.25, 2.4, -2.4];
		for (let i = 0; i < angs.length && escorts.length < n.escort; i++) {
			for (let t = 0; t < 10; t++) {
				const a = toGate + angs[i] + (r() - 0.5) * 0.4,
					L = gap * (1.05 + r() * 0.3),
					p = pt(lair.x + Math.cos(a) * L, lair.y + Math.sin(a) * L);
				if (!spotOk(p, lair)) continue;
				const nd = add("pack", p.x, p.y, { tier: "strong", escort: true });
				link(lair, nd);
				escorts.push(nd);
				break;
			}
		}
		if (escorts.length < Math.min(2, n.escort)) return null;

		const mainPlaces = Math.max(
			3,
			Math.min(
				MAIN_PLACES_MAX,
				Math.round(n.main / (STAND_GEN === 1 ? 1 : 2.5)),
			),
		);
		const kLo = Math.max(1, Math.ceil(mainPlaces * 0.7) - 1);
		const main =
			chainOn(gate, escorts[0], kLo, mainPlaces - 1, "pack", { main: true }) ||
			chain(gate, escorts[0], mainPlaces - 1, "pack", { main: true });
		if (!main) return null;
		escorts[0].main = true;
		lair.main = true;

		if (STAND_GEN > 1) {
			const mw = main.concat([escorts[0]]);
			for (const x of mw) x.n = 2;
			let sum = mw.length * 2,
				g = 0;
			while (sum < n.main && g++ < 100) {
				const x = mw[Math.floor(r() * mw.length)];
				if (x.n < STAND_MAX) {
					x.n++;
					sum++;
				}
			}
		}

		const tractOnly = tractNodes.filter((x) => x !== gate);
		const from2 = (tractOnly.length ? tractOnly : [gate])
			.slice()
			.sort((a, b) => dist(a, escorts[1]) - dist(b, escorts[1]));
		let ok2 = false;
		for (const f of from2.slice(0, 6)) {
			const k = Math.max(
				mainPlaces - 2,
				Math.min(
					mainPlaces + 2,
					Math.round(dist(f, escorts[1]) / (gap * 1.3)) - 1,
				),
			);
			const before = nodes.length,
				beforeE = edges.length;
			if (
				chainOn(
					f,
					escorts[1],
					Math.max(1, mainPlaces - 3),
					mainPlaces + 2,
					"pack",
					{ appr: true },
				) ||
				chain(f, escorts[1], k, "pack", { appr: true })
			) {
				ok2 = true;
				break;
			}

			for (const e of edges.splice(beforeE)) {
				byId(e.a).deg--;
				byId(e.b).deg--;
			}
			nodes.splice(before);
			seq = nodes.length ? +nodes[nodes.length - 1].id.slice(1) + 1 : 0;
		}
		if (!ok2) return null;

		for (const es of escorts.slice(2)) {
			const cand = nodes
				.filter(
					(x) =>
						(x.kind === "pack" || x.kind === "tract") &&
						!x.main &&
						!x.escort &&
						!x.appr,
				)
				.sort((a, b) => dist(a, es) - dist(b, es));
			let done = false;

			for (const f of cand.slice(0, 10)) {
				const before = nodes.length,
					beforeE = edges.length;
				if (
					chainOn(f, es, Math.max(1, mainPlaces - 3), mainPlaces + 1, "pack", {
						appr: true,
					})
				) {
					done = true;
					break;
				}
				for (const e of edges.splice(beforeE)) {
					byId(e.a).deg--;
					byId(e.b).deg--;
				}
				nodes.splice(before);
				seq = nodes.length ? +nodes[nodes.length - 1].id.slice(1) + 1 : 0;
			}
			if (!done) return null;
		}

		if (STAND_GEN > 1)
			for (const x of nodes)
				if (x.kind === "pack" && !x.n)
					x.n = x.escort ? 2 : 2 + (r() < 0.4 ? 1 : 0);

		if (n.star === 1) {
			const cand = tractNodes
				.filter((x) => x !== gate && x.kind !== "exit")
				.concat(tractNodes.filter((x) => x.kind === "exit"));
			let cr = null;
			for (const a of cand) {
				cr = near(a, "cross", null, { tries: 24 });
				if (cr) break;
			}
			if (!cr) cr = near(gate, "cross", null, { tries: 24 });
			if (!cr) return null;
		}

		main[0].tier = "weak";
		let weakN = 1;
		for (let i = 1; i < n.weak; i++) {
			const nd = near(
				gate,
				"pack",
				{ tier: "weak", n: STAND_GEN > 1 ? 2 + (r() < 0.5 ? 1 : 0) : 1 },
				{ tries: 60 },
			);
			if (nd) weakN++;
		}
		let packN = packSum();
		if (weakN < 2) return null;

		const anchorOk = (x) =>
			(x.kind === "pack" &&
				!x.escort &&
				!x.main &&
				!x.appr &&
				x.tier !== "weak") ||
			x.kind === "tract" ||
			(x.kind === "pack" && x.main && r() < 0.25 && x !== main[0]);
		let guard = 0;
		while (packN < n.packs && guard++ < n.packs * 30) {
			const pool = nodes.filter(anchorOk);
			if (!pool.length) return null;

			let anchor = null,
				dense = Infinity;
			for (let t = 0; t < 5; t++) {
				const a = pool[Math.floor(r() * pool.length)];
				const k =
					nodes.reduce((m, x) => m + (dist(x, a) < gap * 2.6 ? 1 : 0), 0) +
					r() * 0.5;
				if (k < dense) {
					dense = k;
					anchor = a;
				}
			}
			if ((anchor.deg || 0) >= 4) continue;
			const nd = near(
				anchor,
				"pack",
				{ n: Math.min(pickN(), n.packs - packN) },
				{ tries: 12 },
			);
			if (!nd) continue;
			packN += nd.n;
			if (r() < 0.22) {
				const q = nodes
					.filter(
						(x) =>
							x !== nd &&
							x !== anchor &&
							x.kind === "pack" &&
							!x.main &&
							!x.escort &&
							!x.appr &&
							dist(x, nd) < gap * 1.7,
					)
					.sort((a, b) => dist(a, nd) - dist(b, nd))[0];
				if (
					q &&
					roadOk(nd, q) &&
					!edges.some(
						(e) =>
							(e.a === nd.id && e.b === q.id) ||
							(e.a === q.id && e.b === nd.id),
					)
				)
					link(nd, q);
			}
		}
		if (packN < n.packs) return null;

		const far = hops(nodes, edges, gate.id, lair.id);
		const leafy = () =>
			nodes
				.filter(
					(x) =>
						x.kind === "pack" &&
						!x.main &&
						!x.escort &&
						!x.appr &&
						x.tier !== "weak",
				)
				.sort((a, b) => (far.get(b.id) || 0) - (far.get(a.id) || 0));
		for (const [kind, k] of [
			["elite", n.elites],
			["dungeon", n.dungeons],
		]) {
			for (let i = 0; i < k; i++) {
				let nd = null;
				for (const a of leafy()) {
					if ((a.deg || 0) >= 4) continue;
					nd = near(a, kind, null, { tries: 16 });
					if (nd) break;
				}
				if (!nd) return null;
			}
		}

		const mk = MARK_BY_BIOME[inp.biome] || "lake";
		const allSegs = () => edges.map((e) => [byId(e.a), byId(e.b)]);
		for (let i = 0; i < n.marks; i++) {
			let best = null,
				bd = 0;
			const segsNow = allSegs();
			for (let t = 0; t < 220; t++) {
				const p = anyPt();
				if (!inside(p, gap * 1.4)) continue;
				let m = Infinity;
				for (const x of nodes) m = Math.min(m, dist(x, p));
				for (const [u, v] of segsNow) {
					if (m <= bd) break;
					m = Math.min(m, segDist(p, u, v) * 1.2);
				}
				for (const q of marks) m = Math.min(m, dist(q, p) - q.r);
				if (m > bd) {
					bd = m;
					best = p;
				}
			}
			if (!best || bd < gap * 1.25) break;
			const rr = Math.min(bd - gap * 0.45, gap * (0.55 + r() * 0.4));
			if (rr < gap * 0.4) break;
			marks.push({
				kind: mk,
				x: Math.round(best.x),
				y: Math.round(best.y),
				r: Math.round(rr),
			});
		}

		const names = (WAY_NAMES[inp.biome] || WAY_NAMES.meadow).slice();
		const used = new Set();
		const nameOf = (list) => {
			const free = list.filter((x) => !used.has(x));
			const v = free.length
				? free[Math.floor(r() * free.length)]
				: list[Math.floor(r() * list.length)];
			used.add(v);
			return v;
		};
		const netOk = (x) =>
			(x.kind === "pack" && !x.main && !x.escort && !x.appr) ||
			x.kind === "tract" ||
			x.kind === "way";
		const hasEdge = (a, b) =>
			edges.some(
				(e) => (e.a === a.id && e.b === b.id) || (e.a === b.id && e.b === a.id),
			);
		function joinWay(w, k) {
			const c = nodes
				.filter((x) => x !== w && netOk(x) && dist(x, w) < gap * 2.8)
				.sort((a, b) => dist(a, w) - dist(b, w));
			let got = 0;
			for (const x of c) {
				if (got >= k) break;
				if (hasEdge(w, x) || !roadOk(w, x)) continue;
				const e = link(w, x);
				e.trail = true;
				got++;
			}
			return got;
		}
		let wayN = 0;
		for (const m of marks) {
			for (let j = 0; j < 2 && wayN < n.ways; j++) {
				for (let t = 0; t < 14; t++) {
					const a = r() * Math.PI * 2,
						p = pt(
							m.x + Math.cos(a) * (m.r + gap * 0.55),
							m.y + Math.sin(a) * (m.r + gap * 0.55),
						);
					if (!spotOk(p, null, 0.6)) continue;
					const w = add("way", p.x, p.y, { name: nameOf(MARK_WAY[m.kind]) });
					if (joinWay(w, 2)) {
						wayN++;
						break;
					}
					nodes.pop();
					seq--;
				}
			}
		}
		for (let t = 0; t < n.ways * 30 && wayN < n.ways; t++) {
			let best = null,
				bd = 0;
			for (let k = 0; k < 40; k++) {
				const p = anyPt();
				if (!spotOk(p, null, 0.62)) continue;
				const m = nodes.reduce((acc, x) => Math.min(acc, dist(x, p)), Infinity);
				if (m > bd) {
					bd = m;
					best = p;
				}
			}
			if (!best) continue;
			const w = add("way", best.x, best.y, { name: nameOf(names) });
			if (bd <= gap * 2.6) {
				if (joinWay(w, 2)) wayN++;
				else {
					nodes.pop();
					seq--;
				}
				continue;
			}

			const c = nodes
				.filter((x) => x !== w && netOk(x))
				.sort((a, b) => dist(a, w) - dist(b, w))
				.slice(0, 4);
			let ok = false;
			for (const a of c) {
				const e0 = edges.length,
					made = chainOn(
						a,
						w,
						0,
						Math.max(0, Math.min(6, n.ways - wayN - 1)),
						"way",
						{ name: "" },
					);
				if (made) {
					for (const e of edges.slice(e0)) e.trail = true;
					for (const x of made) {
						x.name = nameOf(names);
						wayN++;
					}
					wayN++;
					ok = true;
					break;
				}
			}
			if (!ok) {
				nodes.pop();
				seq--;
			}
		}
		if (wayN < Math.ceil(n.ways / 3)) return null;

		{
			const pool = nodes.filter(netOk);
			let added = 0,
				want = Math.round(pool.length * 0.12);
			for (let t = 0; t < want * 12 && added < want; t++) {
				const a = pool[Math.floor(r() * pool.length)];
				const b = pool
					.filter((x) => x !== a && !hasEdge(a, x) && dist(a, x) < gap * 2.0)
					.sort((p, q) => dist(p, a) - dist(q, a))[0];
				if (!b || !roadOk(a, b)) continue;
				const e = link(a, b);
				e.trail = true;
				added++;
			}
		}

		for (const ex of inp.exits) {
			for (const q of ex.alt || []) {
				const p = pt(q.x, q.y);
				if (
					nodes.some(
						(x) =>
							x.kind === "exit" && x.to === ex.to && dist(x, p) < gap * 2.5,
					)
				)
					continue;
				if (
					!inPoly(poly, p.x, p.y) ||
					nodes.some((x) => dist(x, p) < gap * 0.7) ||
					marks.some((m) => dist(m, p) < m.r + gap * 0.4)
				)
					continue;
				const to = nodes
					.filter((x) => netOk(x) && x.kind !== "tract" && roadOk(x, p))
					.sort((a, b) => dist(a, p) - dist(b, p))[0];
				if (!to || dist(to, p) > gap * 2.6) continue;
				const nd = add("exit", p.x, p.y, { to: ex.to, trail: true });
				const e = link(to, nd);
				e.trail = true;
				break;
			}
		}

		const H = hops(nodes, edges, gate.id, lair.id);
		const rest = nodes
			.filter((x) => x.kind === "pack" && !x.tier)
			.sort(
				(a, b) => H.get(a.id) - H.get(b.id) || dist(a, gate) - dist(b, gate),
			);
		const midN = Math.round(rest.length * MID_SHARE);
		rest.forEach((x, i) => {
			x.tier = i < midN ? "mid" : "strong";
		});

		let spotN = 0;
		for (let t = 0; t < n.spots * 25 && spotN < n.spots; t++) {
			const pool = nodes.filter(
				(x) =>
					(x.kind === "tract" ||
						x.kind === "way" ||
						(x.kind === "pack" && !x.main && !x.escort && !x.appr)) &&
					(x.deg || 0) < 4,
			);
			if (!pool.length) break;
			let anchor = null,
				dense = Infinity;
			for (let k = 0; k < 6; k++) {
				const a = pool[Math.floor(r() * pool.length)];
				const m =
					nodes.reduce((acc, x) => acc + (dist(x, a) < gap * 2.6 ? 1 : 0), 0) +
					r() * 0.5;
				if (m < dense) {
					dense = m;
					anchor = a;
				}
			}
			if (near(anchor, "spot", null, { tries: 10 })) spotN++;
		}
		if (spotN < Math.min(2, n.spots)) return null;

		for (const hp of (hand && hand.places) || []) {
			const kind =
				KINDS.includes(hp.kind) &&
				!["town", "gate", "lair", "exit", "tract"].includes(hp.kind)
					? hp.kind
					: "spot";
			const p = pt(+hp.x, +hp.y);
			if (!spotOk(p, null, 0.6)) return null;
			const extra = { hand: true };
			if (hp.name) extra.name = String(hp.name);
			if (kind === "pack")
				extra.tier = TIERS.includes(hp.tier) ? hp.tier : "mid";
			const nd = add(kind, p.x, p.y, extra);

			const cand = nodes
				.filter(
					(x) =>
						x !== nd &&
						(x.kind === "tract" ||
							x.kind === "way" ||
							(x.kind === "pack" && !x.main && !x.escort && !x.appr)),
				)
				.sort((a, b) => dist(a, p) - dist(b, p));
			let ok = false;
			for (const c of cand.slice(0, 8)) {
				const e0 = edges.length;
				if (chainOn(c, nd, 0, 10, "way", { name: "Тропа", hand: true })) {
					for (const e of edges.slice(e0)) e.trail = true;
					ok = true;
					break;
				}
			}
			if (!ok) return null;
		}

		for (const x of nodes) {
			if (x.kind !== "pack" || (x.n || 1) < 2) continue;
			const inc = edges
				.filter((e) => e.a === x.id || e.b === x.id)
				.map((e) => {
					const o = byId(e.a === x.id ? e.b : e.a);
					return Math.atan2(o.y - x.y, o.x - x.x);
				});
			const angDist = (a, b) => {
				const d = Math.abs(
					((((a - b) % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI)) - Math.PI,
				);
				return d;
			};
			const at = [],
				used = inc.slice();
			for (let k = 0; k < x.n; k++) {
				let best = null,
					bs = -1;
				for (const rad of [0.42, 0.34, 0.26]) {
					for (let t = 0; t < 24; t++) {
						const a = (t / 24) * 2 * Math.PI + r() * 0.1,
							q = pt(
								x.x + Math.cos(a) * gap * rad,
								x.y + Math.sin(a) * gap * rad,
							);
						if (
							!inPoly(poly, q.x, q.y) ||
							marks.some((m) => dist(m, q) < m.r + gap * 0.15)
						)
							continue;
						if (
							nodes.some(
								(y) =>
									y !== x && dist(y, q) < gap * (y.kind === "town" ? 0.8 : 0.3),
							)
						)
							continue;
						if (
							edges.some(
								(e) =>
									e.a !== x.id &&
									e.b !== x.id &&
									segDist(q, byId(e.a), byId(e.b)) < gap * 0.3,
							)
						)
							continue;
						const sc =
							used.reduce((m, b) => Math.min(m, angDist(a, b)), Math.PI) + rad;
						if (sc > bs) {
							bs = sc;
							best = { a, q };
						}
					}
					if (best) break;
				}
				if (!best) {
					const a = (k / x.n) * 2 * Math.PI;
					best = {
						a,
						q: pt(x.x + Math.cos(a) * gap * 0.2, x.y + Math.sin(a) * gap * 0.2),
					};
				}
				used.push(best.a);
				at.push([Math.round(best.q.x), Math.round(best.q.y)]);
			}
			x.at = at;
		}

		for (const x of nodes) {
			delete x.deg;
			delete x.appr;
			if (x.kind === "pack" && x.n === 1) delete x.n;
		}
		return { nodes, edges, marks, gap: Math.round(gap) };
	}

	function hops(nodes, edges, from, skip) {
		const A = adjOf(nodes, edges),
			H = new Map([[from, 0]]),
			q = [from];
		while (q.length) {
			const u = q.shift();
			for (const v of A.get(u) || [])
				if (!H.has(v) && v !== skip) {
					H.set(v, H.get(u) + 1);
					q.push(v);
				}
		}
		return H;
	}
	function adjOf(nodes, edges) {
		const A = new Map(nodes.map((x) => [x.id, []]));
		for (const e of edges) {
			if (A.has(e.a)) A.get(e.a).push(e.b);
			if (A.has(e.b)) A.get(e.b).push(e.a);
		}
		return A;
	}

	const GRID_K = 4;
	const ROAD_W = { tract: 0.24, path: 0.16, trail: 0.14 };
	const GLADE_R = {
		pack: 0.46,
		elite: 0.44,
		lair: 0.55,
		cross: 0.5,
		spot: 0.36,
		way: 0.32,
		dungeon: 0.34,
		gate: 0.36,
		exit: 0.3,
		tract: 0.28,
	};
	const gladeR = (x, gap) =>
		gap * (x.kind === "pack" && (x.n || 1) > 1 ? 0.34 : GLADE_R[x.kind] || 0.3);

	const discsOf = (x, gap) => {
		const d = [{ x: x.x, y: x.y, r: gladeR(x, gap) }];
		if (x.kind === "pack" && Array.isArray(x.at))
			for (const [px, py] of x.at) d.push({ x: px, y: py, r: gap * 0.3 });
		return d;
	};
	const discR = (x, gap) =>
		discsOf(x, gap).reduce((m, c) => Math.max(m, dist(c, x) + c.r), 0);

	const ZONE_R = 0;
	const OBST_SHARE = 0.3;
	const inZone = (sch, q) => {
		const l = sch.nodes.find((x) => x.kind === "lair");
		return !!l && dist(l, q) <= (sch.gap || 60) * ZONE_R;
	};
	const PASS = new Set([".", "="]);
	const roadHW = (e, gap, cell) =>
		Math.max(
			gap * (e.tract ? ROAD_W.tract : e.trail ? ROAD_W.trail : ROAD_W.path),
			cell * 0.75,
		);

	function buildGrid(sch, clear = 1) {
		const gap = sch.gap || 60,
			cell = Math.max(8, Math.round(gap / GRID_K));
		const xs = [],
			ys = [];
		const P = sch.contour || [];
		for (let i = 0; i < P.length; i += 2) {
			xs.push(P[i]);
			ys.push(P[i + 1]);
		}
		for (const x of sch.nodes) {
			xs.push(x.x);
			ys.push(x.y);
		}
		const x0 = Math.floor(Math.min(...xs) - gap),
			y0 = Math.floor(Math.min(...ys) - gap);
		const w = Math.ceil((Math.max(...xs) + gap - x0) / cell),
			h = Math.ceil((Math.max(...ys) + gap - y0) / cell);
		const g = new Array(w * h);
		const cx = (i) => x0 + (i + 0.5) * cell,
			cy = (j) => y0 + (j + 0.5) * cell;
		const lairN = sch.nodes.find((x) => x.kind === "lair"),
			ZR = gap * ZONE_R;
		const zone = (q) => !!lairN && dist(lairN, q) <= ZR;
		for (let j = 0; j < h; j++)
			for (let i = 0; i < w; i++) {
				const q = pt(cx(i), cy(j));
				g[j * w + i] =
					P.length && !inPoly(P, q.x, q.y) ? " " : zone(q) ? "#" : ".";
			}
		const stamp = (bx0, by0, bx1, by1, f) => {
			const i0 = Math.max(0, Math.floor((bx0 - x0) / cell)),
				i1 = Math.min(w - 1, Math.floor((bx1 - x0) / cell));
			const j0 = Math.max(0, Math.floor((by0 - y0) / cell)),
				j1 = Math.min(h - 1, Math.floor((by1 - y0) / cell));
			for (let j = j0; j <= j1; j++)
				for (let i = i0; i <= i1; i++) f(j * w + i, pt(cx(i), cy(j)));
		};
		const N = new Map(sch.nodes.map((x) => [x.id, x]));

		const EH = sch.edges.map((e) => ({
			e,
			u: N.get(e.a),
			v: N.get(e.b),
			hw: roadHW(e, gap, cell),
		}));
		for (const x of sch.nodes) {
			if (x.kind === "town") continue;
			const R = discR(x, gap) + cell * 0.35;
			if (!lairN || dist(lairN, x) > ZR + R) continue;
			const D = discsOf(x, gap);
			const foreign = EH.filter(
				(o) =>
					o.e.a !== x.id &&
					o.e.b !== x.id &&
					segDist(x, o.u, o.v) < R + o.hw + cell * 2,
			);

			const nbs = new Set(
				sch.edges
					.filter((e) => e.a === x.id || e.b === x.id)
					.map((e) => (e.a === x.id ? e.b : e.a)),
			);
			const others = sch.nodes.filter(
				(y) =>
					y !== x &&
					y.kind !== "town" &&
					!nbs.has(y.id) &&
					dist(x, y) < R + discR(y, gap) + cell * 3,
			);
			stamp(x.x - R, x.y - R, x.x + R, x.y + R, (k, q) => {
				const dx = dist(q, x);
				if (!D.some((c) => dist(q, c) <= c.r + cell * 0.35) || g[k] === "=")
					return;
				for (const o of foreign)
					if (segDist(q, o.u, o.v) <= o.hw + cell * 1.2) return;
				for (const y of others) if (dist(q, y) - dx < cell * 1.5) return;
				g[k] = ".";
			});
		}

		{
			const rr = WL.rng(WL.hash(`obst:${sch.id}:${sch.gen || 0}`));
			const open = [];
			for (let k = 0; k < g.length; k++) if (g[k] === ".") open.push(k);
			const want = Math.round(open.length * OBST_SHARE);
			const free = (q) => {
				if (zone(q)) return false;
				for (const o of EH)
					if (segDist(q, o.u, o.v) <= o.hw + cell * 1.6) return false;
				for (const x of sch.nodes)
					for (const c of discsOf(x, gap))
						if (dist(q, c) <= c.r + cell * (x.kind === "town" ? 6 : 1.4))
							return false;
				for (const m of sch.marks || [])
					if (dist(q, m) <= m.r + cell) return false;
				return true;
			};
			let got = 0;
			for (let t = 0; t < 4000 && got < want && open.length; t++) {
				const k0 = open[Math.floor(rr() * open.length)],
					c0 = pt(cx(k0 % w), cy(Math.floor(k0 / w)));
				if (!free(c0)) continue;
				const blobs = [];
				const nb = 2 + Math.floor(rr() * 4);
				for (let b = 0; b < nb; b++)
					blobs.push({
						x: c0.x + (rr() - 0.5) * gap * 1.2,
						y: c0.y + (rr() - 0.5) * gap * 1.2,
						r: gap * (0.35 + rr() * 0.55),
					});
				const R = gap * 1.6;
				stamp(c0.x - R, c0.y - R, c0.x + R, c0.y + R, (k, q) => {
					if (g[k] !== "." || !blobs.some((b) => dist(q, b) <= b.r) || !free(q))
						return;
					g[k] = "#";
					got++;
				});
			}
		}

		if (clear > 0)
			for (const x of sch.nodes) {
				if (x.kind !== "way" && x.kind !== "spot") continue;
				if (!lairN || dist(lairN, x) > ZR + gap) continue;
				const rr = WL.rng(WL.hash(`clear:${sch.id}:${x.id}`)),
					R0 = gap * (0.55 + rr() * 0.35) * clear,
					ph = rr() * 6.28,
					amp = 0.25 + rr() * 0.2;
				const R = R0 * (1 + amp);
				const nbs = new Set(
					sch.edges
						.filter((e) => e.a === x.id || e.b === x.id)
						.map((e) => (e.a === x.id ? e.b : e.a)),
				);
				const packsNear = sch.nodes.filter(
					(y) =>
						y.kind === "pack" &&
						!nbs.has(y.id) &&
						dist(x, y) < R + gladeR(y, gap) + cell * 3,
				);
				stamp(x.x - R, x.y - R, x.x + R, x.y + R, (k, q) => {
					if (g[k] !== "#") return;
					const a = Math.atan2(q.y - x.y, q.x - x.x),
						lim = R0 * (1 + amp * Math.sin(a * 3 + ph) * Math.cos(a * 2 - ph));
					if (dist(q, x) > lim) return;
					if (!zone(q)) return;
					for (const y of packsNear)
						if (discsOf(y, gap).some((c) => dist(q, c) <= c.r + cell * 1.5))
							return;
					g[k] = ".";
				});
			}

		for (const e of sch.edges) {
			const u = N.get(e.a),
				v = N.get(e.b),
				hw = roadHW(e, gap, cell);
			stamp(
				Math.min(u.x, v.x) - hw,
				Math.min(u.y, v.y) - hw,
				Math.max(u.x, v.x) + hw,
				Math.max(u.y, v.y) + hw,
				(k, q) => {
					if (segDist(q, u, v) <= hw) g[k] = "=";
				},
			);
		}

		for (const m of sch.marks || []) {
			stamp(m.x - m.r, m.y - m.r, m.x + m.r, m.y + m.r, (k, q) => {
				if (dist(q, m) <= m.r && g[k] !== "=")
					g[k] = m.kind === "lake" ? "~" : "#";
			});
		}

		for (const x of sch.nodes)
			if (x.kind === "town") {
				const R = gap * 0.6;
				stamp(x.x - R, x.y - R, x.x + R, x.y + R, (k, q) => {
					if (dist(q, x) <= R) g[k] = "#";
				});
			}
		const rows = [];
		for (let j = 0; j < h; j++) rows.push(g.slice(j * w, (j + 1) * w).join(""));
		return { cell, x0, y0, w, h, rows };
	}

	const GCACHE = new WeakMap();
	function gridOf(sch) {
		if (!sch || !sch.grid) return null;
		let G = GCACHE.get(sch);
		if (G && G.grid === sch.grid) return G;
		const gr = sch.grid,
			{ w, h, cell, x0, y0 } = gr,
			gap = sch.gap || cell * GRID_K;
		const ch = new Array(w * h);
		for (let j = 0; j < h; j++)
			for (let i = 0; i < w; i++) ch[j * w + i] = gr.rows[j][i];
		const N = new Map(sch.nodes.map((x) => [x.id, x]));

		const ids = sch.nodes.map((x) => x.id),
			idx = new Map(ids.map((id, i) => [id, i]));
		const road = new Int32Array(w * h).fill(-1),
			own = new Int32Array(w * h).fill(-1),
			owd = new Float64Array(w * h).fill(Infinity);
		const cx = (i) => x0 + (i + 0.5) * cell,
			cy = (j) => y0 + (j + 0.5) * cell;
		const hasGlade = (x) => x.kind !== "town" && x.kind !== "tract";
		sch.edges.forEach((e, ei) => {
			const u = N.get(e.a),
				v = N.get(e.b),
				hw = roadHW(e, gap, cell);
			const dx = v.x - u.x,
				dy = v.y - u.y,
				L2 = dx * dx + dy * dy || 1;
			const i0 = Math.max(0, Math.floor((Math.min(u.x, v.x) - hw - x0) / cell)),
				i1 = Math.min(w - 1, Math.floor((Math.max(u.x, v.x) + hw - x0) / cell));
			const j0 = Math.max(0, Math.floor((Math.min(u.y, v.y) - hw - y0) / cell)),
				j1 = Math.min(h - 1, Math.floor((Math.max(u.y, v.y) + hw - y0) / cell));
			for (let j = j0; j <= j1; j++)
				for (let i = i0; i <= i1; i++) {
					const q = pt(cx(i), cy(j));
					if (segDist(q, u, v) > hw) continue;
					const k = j * w + i;
					road[k] = ei;
					const t = ((q.x - u.x) * dx + (q.y - u.y) * dy) / L2,
						end = t < 0.5 ? u : v;
					if (hasGlade(end) && PASS.has(ch[k])) {
						const d = dist(q, end);
						if (d < owd[k]) {
							own[k] = idx.get(end.id);
							owd[k] = d;
						}
					}
				}
		});
		sch.nodes.forEach((x, xi) => {
			if (!hasGlade(x)) return;
			const R = discR(x, gap) + cell * 0.35,
				D = discsOf(x, gap);
			const i0 = Math.max(0, Math.floor((x.x - R - x0) / cell)),
				i1 = Math.min(w - 1, Math.floor((x.x + R - x0) / cell));
			const j0 = Math.max(0, Math.floor((x.y - R - y0) / cell)),
				j1 = Math.min(h - 1, Math.floor((x.y + R - y0) / cell));
			for (let j = j0; j <= j1; j++)
				for (let i = i0; i <= i1; i++) {
					const k = j * w + i,
						q = pt(cx(i), cy(j));
					let d = Infinity;
					for (const c of D) {
						const dc = dist(q, c);
						if (dc <= c.r + cell * 0.35) d = Math.min(d, dc);
					}
					if (d === Infinity || !PASS.has(ch[k]) || d >= owd[k]) continue;
					const re = road[k];
					if (re >= 0) {
						const e = sch.edges[re];
						if (e.a !== x.id && e.b !== x.id) continue;
					}
					own[k] = xi;
					owd[k] = d;
				}
		});
		G = {
			grid: gr,
			w,
			h,
			cell,
			x0,
			y0,
			ch,
			own,
			ids,
			N,
			idx,
			cellOf: (x, y) => {
				const i = Math.floor((x - x0) / cell),
					j = Math.floor((y - y0) / cell);
				return i < 0 || j < 0 || i >= w || j >= h ? -1 : j * w + i;
			},
			center: (k) => [
				x0 + ((k % w) + 0.5) * cell,
				y0 + (Math.floor(k / w) + 0.5) * cell,
			],
		};
		GCACHE.set(sch, G);
		return G;
	}

	function gladeOf(sch, i, j) {
		const G = gridOf(sch);
		if (!G || i < 0 || j < 0 || i >= G.w || j >= G.h) return null;
		const o = G.own[j * G.w + i];
		return o >= 0 ? G.ids[o] : null;
	}

	function walkable(sch, i, j, blocked) {
		const G = gridOf(sch);
		if (!G || i < 0 || j < 0 || i >= G.w || j >= G.h) return false;
		const k = j * G.w + i;
		if (!PASS.has(G.ch[k])) return false;
		const o = G.own[k];
		return !(o >= 0 && blocked && blocked.has(G.ids[o]));
	}

	function gridSearch(G, s0, goal, cost) {
		const D = new Float64Array(G.w * G.h).fill(Infinity),
			P = new Int32Array(G.w * G.h).fill(-1),
			hp = [],
			hf = [];
		const push = (i, f) => {
			hp.push(i);
			hf.push(f);
			let c = hp.length - 1;
			while (c > 0) {
				const p = (c - 1) >> 1;
				if (hf[p] <= hf[c]) break;
				[hp[p], hp[c]] = [hp[c], hp[p]];
				[hf[p], hf[c]] = [hf[c], hf[p]];
				c = p;
			}
		};
		const pop = () => {
			const top = hp[0],
				li = hp.pop(),
				lf = hf.pop();
			if (hp.length) {
				hp[0] = li;
				hf[0] = lf;
				let c = 0;
				for (;;) {
					const l = 2 * c + 1,
						rr = l + 1;
					let m = c;
					if (l < hp.length && hf[l] < hf[m]) m = l;
					if (rr < hp.length && hf[rr] < hf[m]) m = rr;
					if (m === c) break;
					[hp[m], hp[c]] = [hp[c], hp[m]];
					[hf[m], hf[c]] = [hf[c], hf[m]];
					c = m;
				}
			}
			return top;
		};
		D[s0] = 0;
		push(s0, 0);
		while (hp.length) {
			const u = pop();
			if (goal(u)) return { D, P, end: u };
			const ux = u % G.w,
				uy = Math.floor(u / G.w);
			for (let dy = -1; dy <= 1; dy++)
				for (let dx = -1; dx <= 1; dx++) {
					if (!dx && !dy) continue;
					const vx = ux + dx,
						vy = uy + dy;
					if (vx < 0 || vy < 0 || vx >= G.w || vy >= G.h) continue;
					const v = vy * G.w + vx;
					if (
						dx &&
						dy &&
						(cost(uy * G.w + vx, u) === Infinity ||
							cost(vy * G.w + ux, u) === Infinity)
					)
						continue;
					const c = cost(v, u);
					if (c === Infinity) continue;
					const nd = D[u] + c;
					if (nd < D[v]) {
						D[v] = nd;
						P[v] = u;
						push(v, nd);
					}
				}
		}
		return { D, P, end: -1 };
	}

	function gridRoute(sch, a, b, blocked) {
		const G = gridOf(sch);
		if (!G) return null;
		const B = blocked instanceof Set ? blocked : new Set(blocked || []);
		const s0 = G.cellOf(a.x, a.y),
			s1 = G.cellOf(b.x, b.y);
		if (s0 < 0 || s1 < 0 || !PASS.has(G.ch[s1])) return null;
		const oa = G.own[s0],
			ob = G.own[s1];
		const cost = (v, u) => {
			if (!PASS.has(G.ch[v])) return Infinity;
			const o = G.own[v];
			if (o >= 0 && o !== oa && o !== ob && B.has(G.ids[o])) return Infinity;
			return (
				(v % G.w !== u % G.w && Math.floor(v / G.w) !== Math.floor(u / G.w)
					? 1.4142
					: 1) * G.cell
			);
		};
		const r = gridSearch(G, s0, (k) => k === s1, cost);
		if (r.end < 0) return null;
		const cells = [];
		for (let k = r.end; k !== -1; k = r.P[k]) cells.unshift(k);
		const path = cells.map((k) => G.center(k));
		path[0] = [a.x, a.y];
		path[path.length - 1] = [b.x, b.y];
		return { path, d: Math.round(r.D[r.end]) };
	}

	function gridMinPacks(sch, a, b) {
		const G = gridOf(sch);
		if (!G) return null;
		const A = G.N.get(a),
			Bn = G.N.get(b),
			s0 = G.cellOf(A.x, A.y),
			bi = G.idx.get(b);
		const cost = (v, u) => {
			if (!PASS.has(G.ch[v])) return Infinity;
			const o = G.own[v];
			if (o < 0 || o === G.own[u] || o === bi) return 0;
			const x = G.N.get(G.ids[o]);
			return x.kind === "pack" ? x.n || 1 : 0;
		};

		const r = gridSearch(
			G,
			s0,
			(k) => G.own[k] === bi || k === G.cellOf(Bn.x, Bn.y),
			cost,
		);
		return r.end < 0 ? Infinity : r.D[r.end];
	}

	function zoneMain(sch) {
		const l = sch.nodes.find((x) => x.kind === "lair"),
			R = (sch.gap || 60) * ZONE_R;
		return sch.nodes
			.filter((x) => x.kind === "pack" && x.main && l && dist(l, x) <= R)
			.reduce((m, x) => m + (x.n || 1), 0);
	}

	function checkGrid(sch, err) {
		const gr = sch.grid;
		if (
			!gr ||
			!Array.isArray(gr.rows) ||
			gr.rows.length !== gr.h ||
			gr.rows.some((r) => typeof r !== "string" || r.length !== gr.w)
		) {
			err.push("сетка: размеры не сходятся");
			return;
		}
		const G = gridOf(sch);
		const gate = sch.nodes.find((x) => x.kind === "gate"),
			lair = sch.nodes.find((x) => x.kind === "lair");
		const s0 = G.cellOf(gate.x, gate.y);
		if (s0 < 0 || !PASS.has(G.ch[s0])) {
			err.push("сетка: ворота непроходимы");
			return;
		}
		const free = gridSearch(
			G,
			s0,
			() => false,
			(v) => (PASS.has(G.ch[v]) ? 1 : Infinity),
		).D;
		for (const x of sch.nodes) {
			if (x.kind === "town") continue;
			const k = G.cellOf(x.x, x.y);
			if (k < 0 || !PASS.has(G.ch[k]))
				err.push(`сетка: ${x.id} (${x.kind}) в непроходимой клетке`);
			else if (!Number.isFinite(free[k]))
				err.push(`сетка: до ${x.id} (${x.kind}) не дойти`);
		}
		if (ZONE_R > 0) {
			const packs = new Set(
				sch.nodes.filter((x) => x.kind === "pack").map((x) => x.id),
			);
			if (gridRoute(sch, gate, lair, packs))
				err.push("сетка: при живых стаях к логову можно пройти");
			const zm = zoneMain(sch),
				need = gridMinPacks(sch, gate.id, lair.id);
			if (need < Math.floor(zm * BYPASS_K))
				err.push(
					`сетка: к логову через ${need} стай, на главной дороге в крепи ${zm} - обход слишком дешёвый`,
				);
		}
	}

	function generate(inp, opts = {}) {
		if (inp && inp.W) {
			const h = inp.hand;
			inp = inputOf(inp.W, inp.id);
			if (inp && h) inp.hand = h;
		}
		if (!inp) return null;
		if (opts.hand) inp = { ...inp, hand: opts.hand };

		if (inp.hand && inp.hand.schema) {
			const hs = inp.hand.schema;
			return check(hs, { nb: inp.exits.map((e) => e.to) }).length ? null : hs;
		}
		const n = counts(inp.star, opts, inp);
		for (let attempt = 0; attempt < (opts.tries || TRIES); attempt++) {
			const g = attemptOf(inp, n, attempt, {
				gapK: 0.7 - (attempt % 5) * 0.04,
			});
			if (!g) continue;
			const sch = {
				v: 1,
				gen: VER,
				id: inp.id,
				star: n.star,
				biome: inp.biome || null,
				attempt,
				gap: g.gap,
				contour: inp.contour || null,
				nodes: g.nodes,
				edges: g.edges,
				marks: g.marks,
			};
			if (check(sch, { counts: n, nb: inp.exits.map((e) => e.to) }).length)
				continue;

			for (const k of [1, 0.6, 0]) {
				sch.grid = buildGrid(sch, k);
				const ge = [];
				checkGrid(sch, ge);
				if (!ge.length) return sch;
			}
			delete sch.grid;
		}
		return null;
	}

	function check(sch, o = {}) {
		const err = [];
		if (!sch || sch.v !== 1) return ["схема: нет v: 1"];
		if (!Array.isArray(sch.nodes) || !Array.isArray(sch.edges))
			return ["схема: нет nodes или edges"];
		const N = new Map();
		for (const x of sch.nodes) {
			if (!x || typeof x.id !== "string" || !x.id) {
				err.push("место без id");
				continue;
			}
			if (N.has(x.id)) err.push(`${x.id}: id повторяется`);
			N.set(x.id, x);
			if (!KINDS.includes(x.kind))
				err.push(`${x.id}: неизвестный вид ${x.kind}`);
			if (!Number.isFinite(x.x) || !Number.isFinite(x.y))
				err.push(`${x.id}: нет координат`);
			if (x.kind === "pack" && !TIERS.includes(x.tier))
				err.push(`${x.id}: у стаи нет сложности (tier)`);
			if (
				x.kind === "pack" &&
				x.n != null &&
				!(Number.isInteger(x.n) && x.n >= 1 && x.n <= STAND_MAX)
			)
				err.push(`${x.id}: стай на месте ${x.n}, можно 1-${STAND_MAX}`);
			if (
				x.kind === "pack" &&
				(x.n || 1) > 1 &&
				!(Array.isArray(x.at) && x.at.length === x.n)
			)
				err.push(`${x.id}: у стоянки нет точки на каждую стаю (at)`);
			if (x.kind === "exit" && !x.to)
				err.push(`${x.id}: у выхода нет соседа (to)`);
		}
		const seen = new Set();
		for (const e of sch.edges) {
			if (!e || !N.has(e.a) || !N.has(e.b)) {
				err.push(`дорога ${e && e.a}-${e && e.b}: нет такого места`);
				continue;
			}
			if (e.a === e.b) err.push(`дорога ${e.a}: в себя`);
			const k = e.a < e.b ? `${e.a}|${e.b}` : `${e.b}|${e.a}`;
			if (seen.has(k)) err.push(`дорога ${e.a}-${e.b}: повторяется`);
			seen.add(k);
			if (!(e.d > 0)) err.push(`дорога ${e.a}-${e.b}: нет длины`);
			if (
				e.tract &&
				!(
					TRACT_KINDS.includes(N.get(e.a).kind) &&
					TRACT_KINDS.includes(N.get(e.b).kind)
				)
			)
				err.push(`дорога ${e.a}-${e.b}: на тракте не место тракта`);
		}
		if (err.length) return err;
		const of = (k) => sch.nodes.filter((x) => x.kind === k);
		const one = (k, name) => {
			const a = of(k);
			if (a.length !== 1)
				err.push(`${name}: должно быть одно, есть ${a.length}`);
			return a[0];
		};
		const gate = one("gate", "ворота"),
			lair = one("lair", "логово");
		one("town", "город");
		if (!gate || !lair) return err;
		const A = adjOf(sch.nodes, sch.edges);
		const reach = (from, ban) => {
			const S = new Set([from]),
				q = [from];
			while (q.length) {
				const u = q.shift();
				for (const v of A.get(u))
					if (!S.has(v) && !(ban && ban.has(v))) {
						S.add(v);
						q.push(v);
					}
			}
			return S;
		};

		const all = reach(gate.id);
		for (const x of sch.nodes)
			if (!all.has(x.id)) err.push(`${x.id} (${x.kind}): недостижимо`);
		const noLair = reach(gate.id, new Set([lair.id]));
		for (const x of sch.nodes)
			if (x !== lair && !noLair.has(x.id))
				err.push(`${x.id}: доступно только через логово - логово не в тупике`);

		for (const x of sch.nodes) {
			if (x === gate || x === lair || !all.has(x.id)) continue;
			if (!reach(gate.id, new Set([x.id])).has(lair.id)) {
				err.push(`к логову одна дорога: всё идёт через ${x.id}`);
				break;
			}
		}

		const ln = A.get(lair.id).map((id) => N.get(id));
		if (ln.length < 2)
			err.push(`к логову подходов ${ln.length}, нужно хотя бы 2`);
		for (const x of ln)
			if (!(x.kind === "pack" && x.escort))
				err.push(`у логова ${x.id} (${x.kind}) - не свита`);

		const tractA = new Map(
			sch.nodes
				.filter((x) => TRACT_KINDS.includes(x.kind))
				.map((x) => [x.id, []]),
		);
		for (const e of sch.edges)
			if (e.tract) {
				tractA.get(e.a).push(e.b);
				tractA.get(e.b).push(e.a);
			}
		const tr = new Set([gate.id]),
			q = [gate.id];
		while (q.length) {
			const u = q.shift();
			for (const v of tractA.get(u))
				if (!tr.has(v)) {
					tr.add(v);
					q.push(v);
				}
		}
		for (const x of of("exit"))
			if (!x.trail && !tr.has(x.id)) err.push(`выход к ${x.to} не на тракте`);
		for (const x of of("exit"))
			if (x.trail && !sch.edges.some((e) => e.a === x.id || e.b === x.id))
				err.push(`выход просёлком к ${x.to} без дороги`);
		if (o.nb)
			for (const nb of o.nb)
				if (!of("exit").some((x) => x.to === nb && !x.trail))
					err.push(`нет выхода тракта к соседу ${nb}`);
		for (const x of of("tract"))
			if (!tr.has(x.id)) err.push(`${x.id}: точка тракта не на тракте`);
		const crs = of("cross");
		const star = +sch.star || 1;
		if (star === 1 && crs.length !== 1)
			err.push(`★1: Перепутий ${crs.length}, нужно одно`);
		if (star > 1 && crs.length)
			err.push(`★${star}: Перепутье бывает только в ★1`);
		for (const c of crs)
			if (!A.get(c.id).some((id) => TRACT_KINDS.includes(N.get(id).kind)))
				err.push(`${c.id}: Перепутье не у тракта`);
		for (const x of of("spot"))
			if (A.get(x.id).length !== 1)
				err.push(`${x.id}: поляна должна быть тупиком (одна дорога)`);

		for (const x of of("pack"))
			if (x.tier === "weak" && !A.get(gate.id).includes(x.id))
				err.push(`${x.id}: слабая стая не у ворот`);

		const packs = of("pack");
		const nOf = (x) => x.n || 1,
			sumOf = (a) => a.reduce((m, x) => m + nOf(x), 0),
			packTotal = sumOf(packs);
		const mains = sch.nodes.filter((x) => x.main && x.kind === "pack");
		if (!mains.length) err.push("нет главной дороги к логову (main)");
		else {
			const mset = new Set([gate.id, lair.id, ...mains.map((x) => x.id)]);
			if (
				!reach(
					gate.id,
					new Set(sch.nodes.filter((x) => !mset.has(x.id)).map((x) => x.id)),
				).has(lair.id)
			)
				err.push("главная дорога не ведёт от ворот к логову");
			const share = sumOf(mains) / Math.max(1, packTotal);
			if (STAND_GEN > 1 && Math.abs(share - MAIN_SHARE) > SHARE_TOL + 1e-9)
				err.push(
					`на главной дороге ${sumOf(mains)} стай из ${packTotal} - доля ${share.toFixed(2)}, нужно около ${MAIN_SHARE}`,
				);
		}

		if (o.counts) {
			const c = o.counts;
			if (packTotal !== c.packs)
				err.push(`стай ${packTotal}, нужно ${c.packs}`);
			const wy = of("way").filter((x) => !x.hand).length;
			if (c.ways != null && (wy > c.ways || wy < Math.ceil(c.ways / 3)))
				err.push(`точек пути ${wy}, нужно ${Math.ceil(c.ways / 3)}-${c.ways}`);
			if (of("elite").length !== c.elites)
				err.push(`элитных ${of("elite").length}, нужно ${c.elites}`);
			if (of("dungeon").length !== c.dungeons)
				err.push(`данжей ${of("dungeon").length}, нужно ${c.dungeons}`);
			const sp = of("spot").filter((x) => !x.hand).length;
			if (c.spots != null && (sp > c.spots || sp < Math.min(2, c.spots)))
				err.push(
					`полян без стай ${sp}, нужно ${Math.min(2, c.spots)}-${c.spots}`,
				);
		}
		for (const m of sch.marks || []) {
			if (!Number.isFinite(m.x) || !Number.isFinite(m.y) || !(m.r > 0)) {
				err.push("ориентир без координат или размера");
				continue;
			}
			for (const x of sch.nodes)
				if (dist(x, m) < m.r)
					err.push(`${x.id}: место в ориентире (${m.kind})`);
			for (const e of sch.edges)
				if (segDist(m, N.get(e.a), N.get(e.b)) < m.r * 0.9)
					err.push(`дорога ${e.a}-${e.b} идёт через ${m.kind}`);
		}
		if (sch.grid) checkGrid(sch, err);

		if (sch.contour)
			for (const x of sch.nodes)
				if (x.kind !== "exit" && !inPoly(sch.contour, x.x, x.y))
					err.push(`${x.id}: вне округа`);
		for (let i = 0; i < sch.nodes.length; i++)
			for (let j = i + 1; j < sch.nodes.length; j++)
				if (dist(sch.nodes[i], sch.nodes[j]) < MIN_SEP)
					err.push(`${sch.nodes[i].id} и ${sch.nodes[j].id}: вплотную`);
		const E = sch.edges.map((e) => [N.get(e.a), N.get(e.b), e]);
		for (let i = 0; i < E.length; i++)
			for (let j = i + 1; j < E.length; j++)
				if (cross(E[i][0], E[i][1], E[j][0], E[j][1]))
					err.push(
						`дороги ${E[i][2].a}-${E[i][2].b} и ${E[j][2].a}-${E[j][2].b} пересекаются`,
					);
		return err;
	}

	function minPacks(sch, a, b) {
		const A = adjOf(sch.nodes, sch.edges),
			N = new Map(sch.nodes.map((x) => [x.id, x]));
		const w = (id) => (N.get(id).kind === "pack" ? N.get(id).n || 1 : 0);
		const D = new Map([[a, 0]]),
			dq = [a];
		while (dq.length) {
			const u = dq.shift();
			for (const v of A.get(u)) {
				const nd = D.get(u) + (v === b ? 0 : w(v));
				if (!D.has(v) || nd < D.get(v)) {
					D.set(v, nd);
					if (w(v)) dq.push(v);
					else dq.unshift(v);
				}
			}
		}
		return D.has(b) ? D.get(b) : Infinity;
	}

	function route(sch, a, b, blocked) {
		const A = adjOf(sch.nodes, sch.edges),
			B = blocked instanceof Set ? blocked : new Set(blocked || []);
		const len = new Map();
		for (const e of sch.edges) {
			len.set(`${e.a}|${e.b}`, e.d);
			len.set(`${e.b}|${e.a}`, e.d);
		}
		const D = new Map([[a, 0]]),
			P = new Map(),
			done = new Set();
		while (true) {
			let u = null,
				m = Infinity;
			for (const [k, v] of D)
				if (!done.has(k) && v < m) {
					m = v;
					u = k;
				}
			if (u == null) return null;
			if (u === b) break;
			done.add(u);
			if (u !== a && B.has(u)) continue;
			for (const v of A.get(u) || []) {
				const nd = m + len.get(`${u}|${v}`);
				if (!D.has(v) || nd < D.get(v)) {
					D.set(v, nd);
					P.set(v, u);
				}
			}
		}
		const path = [b];
		while (path[0] !== a) path.unshift(P.get(path[0]));
		return { path, d: D.get(b) };
	}

	function stats(sch) {
		const by = {};
		for (const x of sch.nodes) {
			const k =
				x.kind === "pack" ? `pack:${x.escort ? "escort" : x.tier}` : x.kind;
			by[k] = (by[k] || 0) + 1;
		}
		const gate = sch.nodes.find((x) => x.kind === "gate"),
			lair = sch.nodes.find((x) => x.kind === "lair");
		const P = sch.nodes.filter((x) => x.kind === "pack"),
			sum = (a) => a.reduce((m, x) => m + (x.n || 1), 0);
		return {
			id: sch.id,
			star: sch.star,
			nodes: sch.nodes.length,
			edges: sch.edges.length,
			packs: sum(P),
			places: P.length,
			main: sum(P.filter((x) => x.main)),
			ways: sch.nodes.filter((x) => x.kind === "way").length,
			trails: sch.edges.filter((e) => e.trail).length,
			marks: (sch.marks || []).length,
			minPacks: gate && lair ? minPacks(sch, gate.id, lair.id) : null,
			by,
		};
	}

	return {
		VER,
		VIEW_K,
		KINDS,
		TIERS,
		TRACT_KINDS,
		PACK_N,
		STAND_MAX,
		WAY_N,
		MARK_N,
		ELITE_N,
		DUNGEON_N,
		SPOT_N,
		SPECIAL_AREA_PER_PACK,
		ESCORT_N,
		MAIN_SHARE,
		SHARE_TOL,
		BYPASS_K,
		MAIN_PLACES_MAX,
		MIN_SEP,
		counts,
		inputOf,
		ringOf,
		generate,
		check,
		route,
		minPacks,
		stats,
		inPoly,
		GRID_K,
		ZONE_R,
		OBST_SHARE,
		buildGrid,
		gladeOf,
		walkable,
		gridRoute,
		gridMinPacks,
		zoneMain,
	};
});
