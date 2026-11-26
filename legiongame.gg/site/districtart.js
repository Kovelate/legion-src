((root, factory) => {
	if (typeof module === "object" && module.exports)
		module.exports = factory(
			require("./index.js"),
			require("./districtgen.js"),
		);
	else root.LGDistrictArt = factory(root.LGWorldLib, root.LGDistrictGen);
})(typeof self !== "undefined" ? self : this, (WL, DG) => {
	const VER = 2;

	let K = (DG && DG.VIEW_K) || 2.95;
	const PAD_PX = 150;
	const NB_PX = 1000;
	const SEA = { deep: "#3f86a8", mid: "#5aa6c4", shallow: "#86c9d8" };
	const ROAD = { tract: 54, trail: 22, town: 34, lane: 13 };
	const EDGE = 10;
	const MARGIN = 6;

	const NAT = {
		meadow: { tree: 5, blossom: 2, pine: 2 },
		forest: { tree: 6, pine: 3, birch: 1 },
		taiga: { pine: 7, birch: 1, tree: 1 },
		ice: { snowpine: 5, pine: 2 },
		swamp: { willow: 4, tree: 2, dark: 2, deadtree: 1 },
		desert: { palm: 3, cactus: 4 },
		ash: { deadtree: 5, dark: 2 },
		blight: { deadtree: 2, dark: 4 },
		mount: { pine: 6, tree: 2 },
		coast: { tree: 4, blossom: 1, pine: 1 },
		ruin: { tree: 4, dark: 2 },
	};
	const THIN = { desert: 0.72, ash: 0.38 };
	const FOREST = {
		meadow: 0.5,
		forest: 0.4,
		taiga: 0.36,
		ice: 0.56,
		swamp: 0.48,
		desert: 0.66,
		ash: 0.58,
		blight: 0.42,
		mount: 0.52,
		coast: 0.56,
		ruin: 0.5,
	};
	const PONDS = {
		meadow: 3,
		forest: 3,
		taiga: 3,
		ice: 3,
		swamp: 9,
		desert: 1,
		ash: 3,
		blight: 4,
		mount: 2,
		coast: 3,
		ruin: 2,
	};
	const WALL = {
		desert: "adobe",
		swamp: "stakes",
		ash: "iron",
		blight: "iron",
		ice: "stone",
		mount: "stone",
		ruin: "stone",
	};
	const NOFLOWER = { ash: 1, blight: 1, ice: 1, desert: 1 };
	const wallOfBig = (b) =>
		({ desert: "adobe", ash: "iron", blight: "iron" })[b] || "stone";
	const ROCKY = { mount: 1, ice: 1, desert: 1, ash: 1, ruin: 1 };
	const TOWER_LAIR = { ash: 1, blight: 1, swamp: 1, ruin: 1 };

	const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
	function segD(px, py, ax, ay, bx, by) {
		const dx = bx - ax,
			dy = by - ay,
			L = dx * dx + dy * dy;
		const t = L ? clamp(((px - ax) * dx + (py - ay) * dy) / L, 0, 1) : 0;
		return Math.hypot(px - ax - dx * t, py - ay - dy * t);
	}
	const rectD = (b, x, y) =>
		Math.hypot(
			Math.max(b[0] - x, 0, x - b[2]),
			Math.max(b[1] - y, 0, y - b[3]),
		);
	function inPoly(P, x, y) {
		let c = false;
		for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
			const [xi, yi] = P[i],
				[xj, yj] = P[j];
			if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
				c = !c;
		}
		return c;
	}
	function polyEdgeD(P, x, y) {
		let m = Infinity;
		for (let i = 0, j = P.length - 1; i < P.length; j = i++)
			m = Math.min(m, segD(x, y, P[j][0], P[j][1], P[i][0], P[i][1]));
		return m;
	}
	const bez = (p0, p1, p2, p3, t) => {
		const u = 1 - t;
		return [
			u * u * u * p0[0] +
				3 * u * u * t * p1[0] +
				3 * u * t * t * p2[0] +
				t * t * t * p3[0],
			u * u * u * p0[1] +
				3 * u * u * t * p1[1] +
				3 * u * t * t * p2[1] +
				t * t * t * p3[1],
		];
	};

	function frameOf(sch, padPx = PAD_PX, k = K) {
		const pad = padPx / k;
		let x0 = Infinity,
			y0 = Infinity,
			x1 = -Infinity,
			y1 = -Infinity;
		const c =
			sch.contour && sch.contour.length >= 6
				? sch.contour
				: sch.nodes.flatMap((n) => [n.x, n.y]);
		for (let i = 0; i < c.length; i += 2) {
			x0 = Math.min(x0, c[i]);
			x1 = Math.max(x1, c[i]);
			y0 = Math.min(y0, c[i + 1]);
			y1 = Math.max(y1, c[i + 1]);
		}
		return {
			X0: x0 - pad,
			Y0: y0 - pad,
			W: Math.ceil((x1 - x0 + pad * 2) * k),
			H: Math.ceil((y1 - y0 + pad * 2) * k),
			cw: x1 - x0,
			ch: y1 - y0,
			pad,
			k,
		};
	}

	function Grid(cell) {
		const m = new Map();
		const key = (i, j) => i * 100003 + j;
		return {
			add(x, y, r, v) {
				for (
					let i = Math.floor((x - r) / cell);
					i <= Math.floor((x + r) / cell);
					i++
				)
					for (
						let j = Math.floor((y - r) / cell);
						j <= Math.floor((y + r) / cell);
						j++
					) {
						const k = key(i, j);
						let a = m.get(k);
						if (!a) m.set(k, (a = []));
						a.push(v);
					}
			},
			near(b) {
				const out = new Set();
				for (let i = Math.floor(b[0] / cell); i <= Math.floor(b[2] / cell); i++)
					for (
						let j = Math.floor(b[1] / cell);
						j <= Math.floor(b[3] / cell);
						j++
					)
						for (const v of m.get(key(i, j)) || []) out.add(v);
				return out;
			},
		};
	}

	function Clear(roads, places, water) {
		const RG = Grid(96),
			PG = Grid(160),
			WG = Grid(160);
		for (const rd of roads)
			for (const p of rd.pts)
				RG.add(p[0], p[1], rd.w / 2 + 2, [p[0], p[1], rd.w / 2]);
		for (const p of places) PG.add(p.x, p.y, p.r, p);
		for (const w of water || []) WG.add(w.x, w.y, w.r, w);

		const road = (b, m) => {
			for (const [x, y, hw] of RG.near([
				b[0] - m - 40,
				b[1] - m - 40,
				b[2] + m + 40,
				b[3] + m + 40,
			]))
				if (rectD(b, x, y) < hw + m + 5) return false;
			return true;
		};
		const place = (b, m) => {
			for (const p of PG.near([
				b[0] - m - 10,
				b[1] - m - 10,
				b[2] + m + 10,
				b[3] + m + 10,
			]))
				if (rectD(b, p.x, p.y) < p.r + m) return false;
			return true;
		};
		const wet = (b, m) => {
			for (const w of WG.near([b[0] - m, b[1] - m, b[2] + m, b[3] + m]))
				if (rectD(b, w.x, w.y) < w.r + m) return false;
			return true;
		};
		return {
			road,
			place,
			wet,
			ok: (b, m = MARGIN) => road(b, m) && place(b, m),
		};
	}

	function gridOf(sch, F) {
		const g = sch && sch.grid;
		if (!g || !Array.isArray(g.rows) || !(+g.cell > 0)) return null;
		const cell = +g.cell;
		const at = (x, y) => {
			const wx = x / K + F.X0,
				wy = y / K + F.Y0,
				i = Math.floor((wx - g.x0) / cell),
				j = Math.floor((wy - g.y0) / cell);
			const row = g.rows[j];
			return row && i >= 0 && i < row.length ? row[i] : null;
		};
		const cells = (ch) => {
			const out = [];
			g.rows.forEach((row, j) => {
				for (let i = 0; i < row.length; i++)
					if (row[i] === ch)
						out.push([
							(g.x0 + (i + 0.5) * cell - F.X0) * K,
							(g.y0 + (j + 0.5) * cell - F.Y0) * K,
						]);
			});
			return out;
		};
		return { at, cells, px: cell * K };
	}

	function wayKind(name) {
		const s = String(name || "").toLowerCase();
		if (/колодец/.test(s)) return "well";
		if (/родник|ключ|ручей/.test(s)) return "spring";
		if (/брод|мостки|гать/.test(s)) return "planks";
		if (/стог/.test(s)) return "hay";
		if (/лодк/.test(s)) return "boat";
		if (/камыш|кочки|трясин|берег|отмель|сети|туман/.test(s)) return "reeds";
		if (/кост|курган/.test(s)) return "bones";
		if (/муравейник/.test(s)) return "ants";
		if (/пень|поваленн|бурелом|плавник|сухостой/.test(s)) return "log";
		if (
			/развалин|обломк|подвал|сожж|погреб|двор|площадь|арка|идол|столб/.test(s)
		)
			return "ruin";
		if (/пепелищ|лава|трещин|шлак|обгорел|серн/.test(s)) return "ash";
		if (
			/валун|камен|гряда|осыпь|карниз|утёс|скал|карман|бархан|дюна|наст|сугроб|перевал|пещерк|тень/.test(
				s,
			)
		)
			return "stones";
		if (/чёрное древо/.test(s)) return "dead";
		if (/берёз/.test(s)) return "birch";
		if (/дуб|древо|дупло|ельник|опушка|ель/.test(s)) return "tree";
		return "post";
	}
	function wayMark(A, n, x, y, biome) {
		const { P, O, f1 } = A,
			k = wayKind(n.name),
			sd = Math.round(x * 3 + y) >>> 0,
			R = WL.rng(sd);
		switch (k) {
			case "well":
				return A.ITEM.well
					? `<g transform="translate(${f1(x)} ${f1(y)}) scale(.5) translate(${f1(-x)} ${f1(-y)})">${A.ITEM.well({ x, y }).svg}</g>`
					: "";
			case "spring": {
				let g = `<ellipse cx="${f1(x)}" cy="${f1(y - 8)}" rx="30" ry="16" fill="${P.water}" ${O(3)}/><path d="M${f1(x - 14)} ${f1(y - 10)} q14 -6 28 0" stroke="${P.waterL}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
				for (let i = 0; i < 8; i++) {
					const a = (i / 8) * Math.PI * 2;
					g += `<ellipse cx="${f1(x + Math.cos(a) * 32)}" cy="${f1(y - 8 + Math.sin(a) * 18)}" rx="8" ry="6" fill="${P.rock}" ${O(2.4)}/>`;
				}
				return g;
			}
			case "planks":
				return `<path d="M${f1(x - 46)} ${f1(y - 2)} Q${f1(x - 22)} ${f1(y - 14)} ${f1(x)} ${f1(y - 6)} T${f1(x + 46)} ${f1(y - 8)}" fill="none" stroke="${P.sand}" stroke-width="34" stroke-linecap="round"/><path d="M${f1(x - 46)} ${f1(y - 2)} Q${f1(x - 22)} ${f1(y - 14)} ${f1(x)} ${f1(y - 6)} T${f1(x + 46)} ${f1(y - 8)}" fill="none" stroke="${P.water}" stroke-width="22" stroke-linecap="round"/><rect x="${f1(x - 34)}" y="${f1(y - 16)}" width="68" height="20" rx="5" fill="${P.wood}" ${O(3)}/><path d="M${f1(x - 18)} ${f1(y - 14)} v16 M${f1(x)} ${f1(y - 14)} v16 M${f1(x + 18)} ${f1(y - 14)} v16" stroke="${P.woodD}" stroke-width="2.4"/><path d="M${f1(x - 44)} ${f1(y + 8)} q10 -6 20 0 M${f1(x + 24)} ${f1(y + 10)} q10 -6 20 0" stroke="${P.waterL}" stroke-width="3" fill="none"/>`;
			case "hay":
				return `<g transform="translate(${f1(x)} ${f1(y)}) scale(.55) translate(${f1(-x)} ${f1(-y)})">${A.ITEM.haystack({ x, y }).svg}</g>`;
			case "boat":
				return `<path d="M${f1(x - 40)} ${f1(y - 18)} H${f1(x + 40)} Q${f1(x + 34)} ${f1(y + 2)} ${f1(x + 20)} ${f1(y + 4)} H${f1(x - 22)} Q${f1(x - 36)} ${f1(y + 2)} ${f1(x - 40)} ${f1(y - 18)} Z" fill="${P.wood}" ${O(3)}/><path d="M${f1(x - 30)} ${f1(y - 12)} H${f1(x + 30)}" stroke="${P.woodD}" stroke-width="3"/>`;
			case "reeds":
				return (
					A.ITEM.reeds({ x: x - 16, y }).svg +
					A.ITEM.reeds({ x: x + 18, y: y + 6 }).svg
				);
			case "bones":
				return bones(x - 12, y - 4, 0.9, R) + skull(A, x + 18, y + 2, 0.75);
			case "ants":
				return `<path d="M${f1(x - 30)} ${f1(y)} Q${f1(x)} ${f1(y - 50)} ${f1(x + 30)} ${f1(y)} Z" fill="${P.woodD}" ${O(3)}/><path d="M${f1(x - 14)} ${f1(y - 14)} l4 -2 M${f1(x + 6)} ${f1(y - 24)} l4 2 M${f1(x + 10)} ${f1(y - 8)} l-3 -3" stroke="${P.woodL}" stroke-width="3" stroke-linecap="round"/>`;
			case "log":
				return stump(A, x + 10, y, 0.6);
			case "ruin":
				return wreck(A, x, y, 0.45, R);
			case "ash":
				return (
					`<path d="M${f1(x - 36)} ${f1(y - 4)} L${f1(x - 10)} ${f1(y - 8)} L${f1(x + 4)} ${f1(y + 2)} L${f1(x + 34)} ${f1(y - 6)}" stroke="#2a0d14" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M${f1(x - 36)} ${f1(y - 4)} L${f1(x - 10)} ${f1(y - 8)} L${f1(x + 4)} ${f1(y + 2)} L${f1(x + 34)} ${f1(y - 6)}" stroke="#ff6a1a" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` +
					A.deadTree(x + 30, y - 2, 0.45, sd)
				);
			case "stones":
				return crag(A, x, y, 0.38, R, biome);
			case "dead":
				return A.deadTree(x, y, 0.62, sd);
			case "birch":
				return A.birch(x, y, 0.62, sd);
			case "tree":
				return A.natureSvg(
					biome === "taiga" || biome === "ice"
						? "pine"
						: biome === "desert"
							? "palm"
							: "tree",
					x,
					y,
					0.66,
					sd,
				);
			default:
				return `<path d="M${f1(x - 9)} ${f1(y)} V${f1(y - 38)} Q${f1(x)} ${f1(y - 48)} ${f1(x + 9)} ${f1(y - 38)} V${f1(y)} Z" fill="${P.rock}" ${O(3)}/><path d="M${f1(x - 4)} ${f1(y - 30)} h8" stroke="${P.rockD}" stroke-width="2.4"/>`;
		}
	}

	function lie(A, x, y, R, tier, r) {
		const { P, f1 } = A;
		let g = `<path d="${A.blob(x, y, R, R * 0.62, r, 9, 0.2)}" fill="${P.pathD}" opacity="${tier === "weak" ? 0.28 : 0.42}"/>`;
		if (tier === "strong") g += bones(x + R * 0.2, y - R * 0.1, 0.55, r);
		else
			g += `<path d="${A.blob(x - R * 0.2, y, R * 0.42, R * 0.24, r, 7, 0.2)}" fill="${tier === "mid" ? "#b8865a" : P.grassD}" opacity=".85"/>`;
		return g;
	}

	function layer(sch, F, o, A, opt = {}) {
		const bare = !!opt.bare,
			T = bare ? (o.towns && o.towns[sch.id]) || null : o.town || null,
			biome = sch.biome && A.BIOME[sch.biome] ? sch.biome : "meadow";
		A.reset(biome);
		const P = A.P,
			INK = A.INK,
			O = A.O,
			f1 = A.f1,
			blob = A.blob,
			smooth = A.smooth;
		const r = WL.rng(WL.hash(`district-art:${sch.id}:${VER}`));
		const W = F.W,
			H = F.H;
		const px = (x, y) => [(x - F.X0) * K, (y - F.Y0) * K];
		const gap = (+sch.gap || 70) * K;
		const GR = gridOf(sch, F);
		const N = new Map(
			sch.nodes.map((n) => {
				const [x, y] = px(n.x, n.y);
				return [n.id, { ...n, x, y }];
			}),
		);
		const nodes = [...N.values()];
		const C = [];
		if (sch.contour && sch.contour.length >= 6)
			for (let i = 0; i < sch.contour.length; i += 2)
				C.push(px(sch.contour[i], sch.contour[i + 1]));
		else C.push([0, 0], [W, 0], [W, H], [0, H]);
		let bx0 = Infinity,
			by0 = Infinity,
			bx1 = -Infinity,
			by1 = -Infinity;
		for (const [x, y] of C) {
			bx0 = Math.min(bx0, x);
			by0 = Math.min(by0, y);
			bx1 = Math.max(bx1, x);
			by1 = Math.max(by1, y);
		}
		const OUT = opt.out || null;
		const inside = (x, y, m = 0) =>
			inPoly(C, x, y) && (m <= 0 || polyEdgeD(C, x, y) >= m);
		const shown = OUT
			? (x, y) =>
					x > -60 && y > -60 && x < W + 60 && y < H + 60 && !inPoly(OUT, x, y)
			: () => true;
		const nature = (T && T.nature) || NAT[biome] || NAT.meadow,
			thin = T && T.thin != null ? +T.thin : THIN[biome] || 0;
		const big = o.townKind === "capital" || o.townKind === "grandcapital";
		const wallK =
			(T && T.wall && A.WALLK[T.wall.k] && T.wall.k) ||
			(big && wallOfBig(biome)) ||
			WALL[biome] ||
			"palisade";
		const roofPal = A.ROOF[(T && T.wall && T.wall.roof) || ""] || A.ROOF.red;

		const R0 = clamp(gap * 0.36, 50, 105);
		const WANT = {
			town: gap * 0.6,
			gate: gap * 0.22,
			cross: R0 * 1.35,
			elite: R0 * 1.2,
			dungeon: R0 * 1.1,
			lair: R0 * 1.55,
			spot: R0 * 0.9,
			way: 22,
			exit: 0,
			tract: 0,
		};
		const tierK = { weak: 0.85, mid: 1, strong: 1.05 };
		for (const n of nodes) {
			let near = Infinity;
			for (const q of nodes)
				if (
					q !== n &&
					q.kind !== "gate" &&
					n.kind !== "gate" &&
					q.kind !== "way" &&
					!(n.kind === "town" || q.kind === "town")
				)
					near = Math.min(near, Math.hypot(q.x - n.x, q.y - n.y));
			const stand =
				n.kind === "pack" ? 1 + 0.22 * (clamp(+n.n || 1, 1, 3) - 1) : 1;
			const want =
				n.kind === "pack"
					? R0 * stand * (n.escort ? 1.05 : tierK[n.tier] || 1)
					: WANT[n.kind] != null
						? WANT[n.kind]
						: R0;
			n.r =
				n.kind === "town" ||
				n.kind === "gate" ||
				n.kind === "lair" ||
				n.kind === "way"
					? want
					: Math.min(want, near * (n.kind === "pack" ? 0.6 : 0.56));
		}
		const town = nodes.find((n) => n.kind === "town"),
			gateN = nodes.find((n) => n.kind === "gate");

		const inc = new Map(nodes.map((n) => [n.id, []]));
		const clsOf = (e) =>
			e.tract
				? "tract"
				: N.get(e.a).kind === "town" || N.get(e.b).kind === "town"
					? "town"
					: e.trail
						? "lane"
						: "trail";
		const E = sch.edges.map((e) => ({
			...e,
			A: N.get(e.a),
			B: N.get(e.b),
			cls: clsOf(e),
		}));
		for (const e of E) {
			inc.get(e.a).push(e);
			inc.get(e.b).push(e);
		}
		const unit = (x, y) => {
			const L = Math.hypot(x, y) || 1;
			return [x / L, y / L];
		};
		function tangent(n, e) {
			const other = e.a === n.id ? e.B : e.A,
				d = unit(other.x - n.x, other.y - n.y);
			const same = inc.get(n.id).filter((q) => q.cls === e.cls);
			if (
				same.length !== 2 ||
				!["tract", "pack", "spot", "exit", "way"].includes(n.kind)
			)
				return d;
			const q = same[0] === e ? same[1] : same[0],
				o2 = q.a === n.id ? q.B : q.A,
				t = unit(other.x - o2.x, other.y - o2.y);
			return unit(d[0] + t[0], d[1] + t[1]);
		}
		const roads = [];
		const roadD = { tract: "", trail: "", town: "", lane: "" };
		const addRoad = (cls, p0, p1, p2, p3, a, b) => {
			const L = Math.hypot(p3[0] - p0[0], p3[1] - p0[1]),
				n = Math.max(2, Math.ceil(L / 9)),
				pts = [];
			for (let i = 0; i <= n; i++) pts.push(bez(p0, p1, p2, p3, i / n));
			roads.push({ w: ROAD[cls] + EDGE, cls, pts, a, b });
			roadD[cls] +=
				`M${f1(p0[0])} ${f1(p0[1])} C${f1(p1[0])} ${f1(p1[1])} ${f1(p2[0])} ${f1(p2[1])} ${f1(p3[0])} ${f1(p3[1])} `;
		};
		for (const e of E) {
			const a = e.A,
				b = e.B,
				L = Math.hypot(b.x - a.x, b.y - a.y),
				ta = tangent(a, e),
				tb = tangent(b, e);
			addRoad(
				e.cls,
				[a.x, a.y],
				[a.x + (ta[0] * L) / 3, a.y + (ta[1] * L) / 3],
				[b.x + (tb[0] * L) / 3, b.y + (tb[1] * L) / 3],
				[b.x, b.y],
				e.a,
				e.b,
			);
		}

		const signs = [],
			NB = opt.nbs || [];
		for (const ex of nodes.filter((n) => n.kind === "exit")) {
			const e =
				inc.get(ex.id).find((q) => q.cls === "tract") || inc.get(ex.id)[0];
			if (!e) continue;
			const cls = ex.trail ? "lane" : "tract";
			const from = e.a === ex.id ? e.B : e.A,
				d = unit(ex.x - from.x, ex.y - from.y);
			const nb = NB.find((s) => s.id === ex.to),
				back =
					(nb &&
						nb.nodes.find(
							(q) =>
								q.kind === "exit" &&
								q.to === sch.id &&
								!!q.trail === !!ex.trail,
						)) ||
					(nb && nb.nodes.find((q) => q.kind === "exit" && q.to === sch.id));
			if (bare) {
			} else if (back) {
				const [qx, qy] = px(back.x, back.y),
					D = Math.hypot(qx - ex.x, qy - ex.y);
				const nbFrom = nb.edges.find((q) => q.a === back.id || q.b === back.id),
					nf =
						nbFrom &&
						nb.nodes.find(
							(q) => q.id === (nbFrom.a === back.id ? nbFrom.b : nbFrom.a),
						);
				const d2 = nf
					? unit(qx - (nf.x - F.X0) * K, qy - (nf.y - F.Y0) * K)
					: unit(ex.x - qx, ex.y - qy);
				addRoad(
					cls,
					[ex.x, ex.y],
					[ex.x + (d[0] * D) / 3, ex.y + (d[1] * D) / 3],
					[qx + (d2[0] * D) / 3, qy + (d2[1] * D) / 3],
					[qx, qy],
					ex.id,
					null,
				);
			} else {
				const L = polyEdgeD(C, ex.x, ex.y) + 200,
					q2 = [ex.x + d[0] * L, ex.y + d[1] * L];
				addRoad(
					cls,
					[ex.x, ex.y],
					[ex.x + (d[0] * L) / 3, ex.y + (d[1] * L) / 3],
					[ex.x + (d[0] * L * 2) / 3, ex.y + (d[1] * L * 2) / 3],
					q2,
					ex.id,
					null,
				);
			}
			if (bare || ex.trail) continue;
			const nx = -d[1],
				ny = d[0],
				s1 = [ex.x + nx * 70, ex.y + ny * 70],
				s2 = [ex.x - nx * 70, ex.y - ny * 70];
			const sp =
				inside(s1[0], s1[1]) &&
				(!inside(s2[0], s2[1]) ||
					polyEdgeD(C, s1[0], s1[1]) >= polyEdgeD(C, s2[0], s2[1]))
					? s1
					: s2;
			signs.push({ x: sp[0], y: sp[1], to: ex.to, dir: d[0] >= 0 ? "E" : "W" });
		}

		const ways = [];
		if (!bare)
			for (const n of nodes.filter((q) => q.kind === "way")) {
				let sx = 0,
					sy = 0;
				for (const e of inc.get(n.id)) {
					const q = e.a === n.id ? e.B : e.A,
						u = unit(q.x - n.x, q.y - n.y);
					sx += u[0];
					sy += u[1];
				}
				let u = unit(-sx || 1, -sy || 0.3);
				if (Math.hypot(sx, sy) < 0.3)
					u = unit(
						-(inc.get(n.id)[0]
							? inc.get(n.id)[0].a === n.id
								? inc.get(n.id)[0].B.y - n.y
								: inc.get(n.id)[0].A.y - n.y
							: 1),
						1,
					);

				const lakes = (sch.marks || [])
					.filter((m) => m.kind === "lake")
					.map((m) => {
						const [x, y] = px(m.x, m.y);
						return [x, y, (+m.r || 30) * K];
					});
				const cand = [u, [-u[1], u[0]], [u[1], -u[0]], [-u[0], -u[1]]].map(
					(v) => [n.x + v[0] * 48, n.y + v[1] * 40 + 14],
				);
				const dry = (c) =>
					Math.min(
						Infinity,
						...lakes.map(([x, y, rr]) => Math.hypot(c[0] - x, c[1] - y) - rr),
					);
				const best =
					cand.find((c) => dry(c) > 60) ||
					cand.sort((a, b) => dry(b) - dry(a))[0];
				ways.push({ n, x: best[0], y: best[1] });
			}

		for (const n of nodes)
			if (n.kind === "pack" && Array.isArray(n.at) && n.at.length >= 2) {
				n.pts = n.at.map(([x, y]) => px(x, y));
				let md = Infinity;
				for (let i = 0; i < n.pts.length; i++)
					for (let j = 0; j < i; j++)
						md = Math.min(
							md,
							Math.hypot(n.pts[i][0] - n.pts[j][0], n.pts[i][1] - n.pts[j][1]),
						);
				n.pr = Math.max(26, Math.min(R0 * 0.62, md * 0.5));
				n.r = 22;
			}
		const places = nodes
			.filter((n) => n.r > 0)
			.map((n) => ({
				id: n.id,
				kind: n.kind,
				x: n.x,
				y: n.kind === "town" ? n.y - n.r * 0.12 : n.y,
				r: n.r,
			}));
		for (const n of nodes)
			if (n.pts)
				n.pts.forEach(([x, y], i) =>
					places.push({ id: n.id + ":" + i, kind: "pack", x, y, r: n.pr }),
				);
		for (const s of signs)
			places.push({
				id: "sign:" + s.to,
				kind: "sign",
				x: s.x,
				y: s.y - 30,
				r: 46,
			});
		for (const w of ways)
			places.push({
				id: "way:" + w.n.id,
				kind: "top",
				x: w.x,
				y: w.y - 22,
				r: 48,
			});
		if (!bare)
			for (const n of nodes)
				if (n.kind === "lair" || n.kind === "dungeon" || n.kind === "cross")
					places.push({
						id: "top:" + n.id,
						kind: "top",
						x: n.x,
						y: n.y - n.r * (n.kind === "lair" ? 0.95 : 0.6),
						r: n.r * (n.kind === "lair" ? 0.95 : 0.7),
					});

		const marks = (sch.marks || []).map((m) => {
			const [x, y] = px(m.x, m.y);
			return { kind: m.kind, x, y, r: (+m.r || 30) * K };
		});
		const markPl = marks
			.filter((m) => m.kind !== "lake")
			.map((m, i) => ({
				id: "mark:" + i,
				kind: "mark",
				x: m.x,
				y: m.y - m.r * 0.3,
				r: m.r,
			}));
		const CL = Clear(roads, places.concat(markPl), null);

		const water = [];
		for (const m of marks)
			if (m.kind === "lake") {
				const R = m.r * 0.84,
					poly = [];
				for (let i = 0; i < 13; i++) {
					const a = (i / 13) * Math.PI * 2,
						q = 0.84 + r() * 0.16;
					poly.push([
						m.x + Math.cos(a) * R * q,
						m.y + Math.sin(a) * R * 0.8 * q,
					]);
				}
				water.push({
					x: m.x,
					y: m.y,
					r: R + 16,
					poly,
					lava: biome === "ash",
					mark: true,
				});
			}
		const gridWater = GR ? GR.cells("~") : [];
		if (!GR)
			for (
				let t = 0, want = PONDS[biome] || 2;
				t < 400 && water.filter((w) => !w.mark).length < want;
				t++
			) {
				const rad = 30 + r() * (biome === "swamp" ? 34 : 22),
					x = bx0 + r() * (bx1 - bx0),
					y = by0 + r() * (by1 - by0);
				if (!inside(x, y, rad + 40) || !shown(x, y)) continue;
				const b = [
					x - rad - 30,
					y - rad * 0.75 - 30,
					x + rad + 30,
					y + rad * 0.75 + 30,
				];
				if (
					!CL.road(b, 110) ||
					!CL.place(b, 60) ||
					water.some((w) => Math.hypot(w.x - x, w.y - y) < w.r + rad + 120)
				)
					continue;
				const poly = [];
				for (let i = 0; i < 11; i++) {
					const a = (i / 11) * Math.PI * 2,
						q = 0.78 + r() * 0.3;
					poly.push([
						x + Math.cos(a) * rad * q,
						y + Math.sin(a) * rad * 0.72 * q,
					]);
				}
				water.push({ x, y, r: rad + 30, poly, lava: biome === "ash" });
			}

		for (const [x, y] of gridWater) {
			let r = GR.px * 0.75;
			for (const rd of roads)
				for (const p of rd.pts)
					r = Math.min(r, Math.hypot(p[0] - x, p[1] - y) - rd.w / 2 - 2);
			for (const p of places)
				r = Math.min(r, Math.hypot(p.x - x, p.y - y) - p.r - 2);
			if (r >= GR.px * 0.3) water.push({ x, y, r, grid: true });
		}

		for (let i = water.length - 1; i >= 0; i--) {
			const w = water[i];
			if (w.grid) continue;
			let r = w.r;
			for (const rd of roads)
				for (const p of rd.pts)
					r = Math.min(r, Math.hypot(p[0] - w.x, p[1] - w.y) - rd.w / 2 - 2);
			for (const p of places)
				r = Math.min(r, Math.hypot(p.x - w.x, p.y - w.y) - p.r - 2);
			if (r >= w.r) continue;
			if (r < 24) {
				water.splice(i, 1);
				continue;
			}
			const k = r / w.r;
			if (w.poly)
				w.poly = w.poly.map(([x, y]) => [
					w.x + (x - w.x) * k,
					w.y + (y - w.y) * k,
				]);
			w.r = r;
		}
		const CW = Clear(roads, places.concat(markPl), water);

		const fogC = A.mix(
			P.forest,
			"#e6ece8",
			biome === "ash" || biome === "blight" ? 0.3 : 0.45,
		);
		const landD = smooth(C);
		let ground = `<path d="${landD}" fill="${P.grass}"/>`;
		const area = Math.max(1, (bx1 - bx0) * (by1 - by0));
		let mott = "";
		for (let i = 0; i < Math.round(area / 260000); i++) {
			const x = bx0 + r() * (bx1 - bx0),
				y = by0 + r() * (by1 - by0),
				k = 80 + r() * 160;
			mott += blob(x, y, k, k * 0.7, r, 9, 0.2) + " ";
		}
		let mott2 = "";
		for (let i = 0; i < Math.round(area / 320000); i++) {
			const x = bx0 + r() * (bx1 - bx0),
				y = by0 + r() * (by1 - by0),
				k = 60 + r() * 140;
			mott2 += blob(x, y, k, k * 0.7, r, 9, 0.2) + " ";
		}
		const clipId = A.uid("dgLand");
		ground += `<clipPath id="${clipId}"><path d="${landD}"/></clipPath><g clip-path="url(#${clipId})"><path d="${mott}" fill="${P.grassD}" opacity=".35"/><path d="${mott2}" fill="${P.grassL}" opacity=".4"/></g>`;

		const NG = 260,
			nw = Math.ceil(W / NG) + 2,
			nh = Math.ceil(H / NG) + 2,
			NV = Array.from({ length: nw * nh }, () => r());
		const NG2 = 110,
			nw2 = Math.ceil(W / NG2) + 2,
			nh2 = Math.ceil(H / NG2) + 2,
			NV2 = Array.from({ length: nw2 * nh2 }, () => r());
		const sm = (t) => t * t * (3 - 2 * t);
		const vn = (V, g, w, x, y) => {
			const gx = x / g,
				gy = y / g,
				i = Math.floor(gx),
				j = Math.floor(gy),
				fx = sm(gx - i),
				fy = sm(gy - j),
				v = (a, b) => V[clamp(b, 0, 1e9) * w + clamp(a, 0, w - 1)] || 0;
			return (
				(v(i, j) * (1 - fx) + v(i + 1, j) * fx) * (1 - fy) +
				(v(i, j + 1) * (1 - fx) + v(i + 1, j + 1) * fx) * fy
			);
		};
		const noise = (x, y) =>
			vn(NV, NG, nw, x, y) * 0.65 + vn(NV2, NG2, nw2, x, y) * 0.35;
		const thr = FOREST[biome] || 0.5;
		const wood = (x, y) => (GR ? GR.at(x, y) === "#" : noise(x, y) > thr);
		const props = [],
			decor = [];
		const treeBox = (k, x, y, s) =>
			k === "palm"
				? [x - 90 * s, y - 200 * s, x + 90 * s, y + 6]
				: k === "cactus"
					? [x - 60 * s, y - 150 * s, x + 60 * s, y + 6]
					: k === "pine" || k === "snowpine"
						? [x - 68 * s, y - 182 * s, x + 68 * s, y + 4]
						: [x - 76 * s, y - 166 * s, x + 76 * s, y + 6];
		const natureOf = () => A.natureTree(nature, r);
		const dune = (x, y, q) => {
			const b = [x - 90 * q, y - 40 * q, x + 90 * q, y + 4];
			if (!CW.ok(b) || !CW.wet(b, 4)) return;
			const dd = { k: "dune", x, y, box: b };
			props.push({
				y,
				d: dd,
				svg: `<path d="M${f1(x - 90 * q)} ${f1(y)} Q${f1(x - 20 * q)} ${f1(y - 46 * q)} ${f1(x + 90 * q)} ${f1(y)} Z" fill="${P.grassD}"/><path d="M${f1(x - 60 * q)} ${f1(y - 8 * q)} Q${f1(x - 14 * q)} ${f1(y - 38 * q)} ${f1(x + 40 * q)} ${f1(y - 20 * q)}" stroke="${P.grassL}" stroke-width="5" fill="none" stroke-linecap="round"/>`,
			});
			decor.push(dd);
		};
		let forestBase = "",
			rockCells = "";
		const GX = 50,
			GY = 42,
			band = !bare && !opt.hasNb;
		const yA = Math.max(-3 * GY, (band ? 0 : by0) - 3 * GY),
			yB = Math.min(H + 4 * GY, (band ? H : by1) + 4 * GY),
			xA = Math.max(-2 * GX, (band ? 0 : bx0) - 2 * GX),
			xB = Math.min(W + 2 * GX, (band ? W : bx1) + 2 * GX);
		for (let j = Math.floor(yA / GY), y = j * GY; y < yB; j++, y += GY)
			for (
				let x = (j & 1 ? GX / 2 : 0) + Math.floor(xA / GX) * GX;
				x < xB;
				x += GX
			) {
				const tx = x + (r() - 0.5) * GX * 0.7,
					ty = y + (r() - 0.5) * GY * 0.7,
					inL = inside(tx, ty);
				if (!shown(tx, ty)) continue;
				const out = !inL;
				if (out && !band) continue;
				if (out && GR && GR.at(tx, ty) && GR.at(tx, ty) !== " ") continue;
				const edge = out ? polyEdgeD(C, tx, ty) : 0;
				if (out && edge > 260) continue;
				const forest = out
					? edge > 30 || noise(tx, ty) > thr - 0.1
					: wood(tx, ty);
				if (!forest) continue;

				if (GR && !out && ROCKY[biome] && noise(tx + 777, ty) > 0.52) {
					rockCells += `M${f1(tx - 34)} ${f1(ty - 18)} a34 24 0 1 0 68 0 a34 24 0 1 0 -68 0 `;
					if (r() < 0.3) {
						const q = 0.36 + r() * 0.2,
							b2 = [tx - 110 * q, ty - 120 * q, tx + 110 * q, ty + 8];
						if (CW.ok(b2) && CW.wet(b2, 4)) {
							const d = { k: "crag", x: tx, y: ty, box: b2 };
							decor.push(d);
							props.push({
								y: ty,
								d,
								svg:
									biome === "ruin"
										? wreck(A, tx, ty, q * 1.4, r)
										: crag(A, tx, ty, q, r, biome),
							});
						}
					}
					continue;
				}
				const s = 0.44 + r() * 0.14,
					kind = natureOf(),
					box = treeBox(kind, tx, ty, s);
				if (!CW.ok(box) || !CW.wet(box, 4)) {
					if (GR && !out && biome !== "desert" && biome !== "ash") {
						const q = 0.5 + r() * 0.2,
							b2 = [tx - 46 * q, ty - 52 * q, tx + 46 * q, ty + 4];
						if (CW.ok(b2) && CW.wet(b2, 4)) {
							const d = { k: "bush", x: tx, y: ty, box: b2 };
							decor.push(d);
							props.push({
								y: ty,
								d,
								svg: A.bush(tx, ty, q, Math.round(tx * 7 + ty) >>> 0, [
									P.forestD || P.leafD,
									P.leafD,
									P.leaf,
								]),
							});
						}
					}
					continue;
				}
				if (thin && r() < (GR && !out ? thin * 0.55 : thin)) {
					const q0 = r();
					if (q0 < (GR && !out ? 0.45 : 0.1)) {
						const q = 0.5 + r() * 0.4,
							b2 = [tx - 54 * q, ty - 40 * q, tx + 54 * q, ty + 4];
						if (CW.ok(b2)) {
							const it = A.ITEM.rock({ x: tx, y: ty, s: q }),
								d = { k: "rock", x: tx, y: ty, box: b2 };
							props.push({ y: ty, d, svg: it.svg });
							decor.push(d);
						}
					} else if (q0 < 0.3) dune(tx, ty, 0.6 + r() * 0.6);
					continue;
				}
				forestBase += `M${f1(tx - 46)} ${f1(ty - 26)} a46 34 0 1 0 92 0 a46 34 0 1 0 -92 0 `;
				const deep =
					!out &&
					(GR
						? ["#", "#", "#", "#"].every(
								(_, q) =>
									GR.at(
										tx + [1, -1, 0, 0][q] * GR.px,
										ty + [0, 0, 1, -1][q] * GR.px,
									) === "#",
							)
						: noise(tx, ty) > thr + 0.12);
				if (deep && r() < (GR ? 0.12 : 0.45)) continue;
				const d = { k: "tree", kind, x: tx, y: ty, box };
				decor.push(d);
				props.push({
					y: ty,
					d,
					svg: A.natureSvg(kind, tx, ty, s, Math.round(tx * 3 + ty) >>> 0),
				});
			}

		for (let t = 0; t < Math.round(area / 26000); t++) {
			const x = bx0 + r() * (bx1 - bx0),
				y = by0 + r() * (by1 - by0);
			if (!inside(x, y, 20) || !shown(x, y) || wood(x, y)) continue;
			if (GR && GR.at(x, y) !== ".") continue;
			const q = r(),
				s = 0.45 + r() * 0.2;
			let k, box, svg;
			if (q < 0.22 && !thin && !GR) {
				k = natureOf();
				box = treeBox(k, x, y, s);
				svg = A.natureSvg(k, x, y, s, Math.round(x + y * 3) >>> 0);
				k = "tree";
			} else if (q < 0.62 && biome !== "desert" && biome !== "ash") {
				const sb = GR ? s * 0.62 : s;
				box = [x - 46 * sb, y - 52 * sb, x + 46 * sb, y + 4];
				svg = A.bush(x, y, sb, Math.round(x * 7 + y) >>> 0);
				k = "bush";
			} else if (thin && q < 0.85) {
				dune(x, y, 0.6 + r() * 0.6);
				continue;
			} else {
				const s2 =
					s *
					(biome === "ice" || biome === "desert" || biome === "ash"
						? 1.2
						: 0.8);
				box = [x - 54 * s2, y - 50 * s2, x + 54 * s2, y + 4];
				svg = A.ITEM.rock({ x, y, s: s2 }).svg;
				k = "rock";
			}
			if (!CW.ok(box) || !CW.wet(box, 4)) continue;
			const d = { k, x, y, box, open: true };
			decor.push(d);
			props.push({ y, d, svg });
		}

		const clearUnder = (box) => {
			for (let i = decor.length - 1; i >= 0; i--) {
				const d = decor[i];
				if (
					d.box[2] > box[0] &&
					d.box[0] < box[2] &&
					d.box[3] > box[1] &&
					d.box[1] < box[3]
				) {
					const pi = props.findIndex((p) => p.d === d);
					if (pi < 0) continue;
					decor.splice(i, 1);
					props.splice(pi, 1);
				}
			}
		};

		for (const m of marks) {
			if (m.kind === "lake") continue;
			const R = WL.rng(Math.round(m.x * 5 + m.y)),
				q = clamp(m.r / 110, 0.6, 1.6);
			const parts =
				m.r > 90
					? [
							[-0.42, 0.1],
							[0.38, 0.18],
							[0, -0.22],
						]
					: [[0, 0]];
			for (const [dx, dy] of parts) {
				const x = m.x + dx * m.r,
					y = m.y + dy * m.r * 0.7,
					box = [x - 110 * q, y - 120 * q, x + 110 * q, y + 8];
				clearUnder(box);
				props.push({
					y,
					svg:
						m.kind === "ruin"
							? wreck(A, x, y, q, R)
							: crag(A, x, y, q, R, biome),
				});
			}
		}

		const MARK =
			!GR &&
			{ mount: "crag", ice: "crag", ruin: "wreck", desert: "crag" }[biome];
		for (
			let t = 0, n = 0;
			MARK &&
			t < 600 &&
			n <
				Math.round(
					area /
						(MARK === "wreck" ? 300000 : biome === "mount" ? 220000 : 600000),
				);
			t++
		) {
			const x = bx0 + r() * (bx1 - bx0),
				y = by0 + r() * (by1 - by0),
				q = 0.9 + r() * 0.6;
			const box =
				MARK === "crag"
					? [x - 110 * q, y - 120 * q, x + 110 * q, y + 8]
					: [x - 90 * q, y - 90 * q, x + 90 * q, y + 8];
			if (
				!inside(x, y, 60) ||
				!shown(x, y) ||
				!CW.ok(box) ||
				!CW.wet(box, 4) ||
				decor.some(
					(d) =>
						d.k !== "tree" &&
						d.k !== "bush" &&
						d.k !== "dune" &&
						Math.hypot(d.x - x, d.y - y) < 140,
				)
			)
				continue;
			clearUnder(box);
			const d = { k: MARK, x, y, box };
			decor.push(d);
			props.push({
				y,
				d,
				svg:
					MARK === "crag" ? crag(A, x, y, q, r, biome) : wreck(A, x, y, q, r),
			});
			n++;
		}

		const br = { tuft: "", leaf: "", fl: ["", "", "", ""], st: "", hum: "" },
			FLC = ["#fff4e0", "#ffd0dc", "#ffe27a", "#c9b6ff"];
		for (let t = 0; t < Math.round(area / 1500); t++) {
			const x = bx0 + r() * (bx1 - bx0),
				y = by0 + r() * (by1 - by0);
			if (!inside(x, y, 6) || !shown(x, y)) continue;
			const b = [x - 8, y - 12, x + 8, y + 2];
			if (!CW.road(b, 0) || !CW.wet(b, 0)) continue;
			const k = r();
			if (k < 0.6)
				br.tuft += `M${f1(x - 7)} ${f1(y)} l3 -9 M${f1(x)} ${f1(y)} l0 -12 M${f1(x + 7)} ${f1(y)} l-3 -9 `;
			else if (k < 0.8)
				br.leaf += `M${f1(x - 12)} ${f1(y)} q12 -14 24 0 q-12 6 -24 0 Z `;
			else if (k < 0.93) {
				if (!NOFLOWER[biome])
					br.fl[Math.floor(r() * 4)] +=
						`M${f1(x + 4)} ${f1(y)} a4 4 0 1 0 -8 0 a4 4 0 1 0 8 0 `;
			} else if (k < 0.97 || !GR)
				br.st += `M${f1(x - 6)} ${f1(y)} q6 -8 12 0 q-6 4 -12 0 Z `;
			else br.hum += `M${f1(x - 16)} ${f1(y)} q16 -18 32 0 Z `;
		}

		let clear = "";
		const flat = [];
		if (!bare) {
			const spotG = (n, k, rimOp = 0.55) => {
				const R = n.r,
					rr = WL.rng(WL.hash(sch.id + n.id));
				const e = blob(n.x, n.y, R, R * 0.8, rr, 13, 0.12),
					mid = blob(n.x, n.y + 2, R * 0.86, R * 0.68, rr, 12, 0.12);
				return (
					`<path d="${e}" fill="none" stroke="${P.forestD || P.forest}" stroke-width="${f1(R * 0.22)}" stroke-linejoin="round" opacity="${rimOp * 0.6}"/><path d="${e}" fill="${P.grassD}"/><path d="${mid}" fill="${P.grassL}"/>` +
					(k > 0
						? `<path d="${blob(n.x, n.y + 4, R * 0.62, R * 0.42, rr, 11, 0.16)}" fill="${P.path}" opacity="${k}"/><path d="${blob(n.x + 4, n.y + 6, R * 0.32, R * 0.18, rr, 9, 0.2)}" fill="${P.pathD}" opacity="${k * 0.5}"/>`
						: "")
				);
			};
			for (const n of nodes) {
				if (n.kind === "pack" && n.pts) {
					const k = n.escort
							? 0.85
							: n.tier === "strong"
								? 0.72
								: n.tier === "mid"
									? 0.5
									: 0.32,
						rr = WL.rng(WL.hash("lie" + sch.id + n.id));
					clear += `<path d="${blob(n.x, n.y, 26, 18, rr, 9, 0.2)}" fill="${P.path}" opacity=".5"/>`;
					n.pts.forEach(([x, y], i) => {
						const q = { id: n.id + ":" + i, x, y, r: n.pr };
						clear += spotG(q, k, n.tier === "weak" ? 0.4 : 0.6);
						flat.push(
							lie(A, x, y + 2, n.pr * 0.5, n.escort ? "strong" : n.tier, rr),
						);
					});
				} else if (n.kind === "pack") {
					clear += spotG(
						n,
						n.escort
							? 0.85
							: n.tier === "strong"
								? 0.72
								: n.tier === "mid"
									? 0.5
									: 0.32,
						n.tier === "weak" ? 0.4 : 0.6,
					);
					const cnt = clamp(+n.n || 1, 1, 3),
						rr = WL.rng(WL.hash("lie" + sch.id + n.id)),
						a0 = rr() * Math.PI * 2;
					if (cnt === 1) {
						if (n.tier === "strong" || n.escort)
							flat.push(
								bones(n.x - n.r * 0.45, n.y + n.r * 0.3, 0.8, r) +
									bones(n.x + n.r * 0.4, n.y - n.r * 0.25, 0.65, r),
							);
					} else
						for (let i = 0; i < cnt; i++) {
							const a = a0 + (i / cnt) * Math.PI * 2;
							flat.push(
								lie(
									A,
									n.x + Math.cos(a) * n.r * 0.46,
									n.y + Math.sin(a) * n.r * 0.36,
									n.r * 0.3,
									n.escort ? "strong" : n.tier,
									rr,
								),
							);
						}
				} else if (n.kind === "spot") {
					clear += spotG(n, 0.18, 0.35);
					flat.push(flowers(n, r));
				} else if (n.kind === "elite") clear += spotG(n, 0.78, 0.7);
				else if (n.kind === "cross") clear += spotG(n, 0.6, 0.5);
				else if (n.kind === "dungeon") clear += spotG(n, 0.45, 0.6);
				else if (n.kind === "lair") clear += spotG(n, 0.8, 0.75);
			}
			if (town)
				props.push({
					y: town.y + town.r * 0.7,
					svg: townSvg(A, town, gateN, wallK, roofPal, r, o.townKind),
				});
			for (const n of nodes) {
				const s = n.r;
				if (n.kind === "cross")
					props.push({ y: n.y, svg: campSvg(A, n.x, n.y, s / 95, r) });
				else if (n.kind === "dungeon")
					props.push({
						y: n.y + s * 0.15,
						svg: dungeonSvg(A, n.x, n.y + s * 0.15, s / 120),
					});
				else if (n.kind === "lair")
					props.push({
						y: n.y + s * 0.1,
						svg: (TOWER_LAIR[biome] ? towerLair : caveLair)(
							A,
							n.x,
							n.y + s * 0.1,
							s / 135,
							biome,
							n.boss,
						),
					});
				else if (n.kind === "elite")
					for (let i = 0; i < 7; i++) {
						const a = -Math.PI / 2 + (i / 7) * Math.PI * 2 + 0.2,
							x = n.x + Math.cos(a) * s * 0.86,
							y = n.y + Math.sin(a) * s * 0.7 + 10;
						props.push({ y, svg: menhir(A, x, y, 0.55 + r() * 0.2, i) });
					}
				else if (n.kind === "pack" && n.escort)
					for (const a of [-2.4, -0.7]) {
						const c = n.pts ? { x: n.pts[0][0], y: n.pts[0][1], r: n.pr } : n,
							x = c.x + Math.cos(a) * c.r * 0.82,
							y = c.y + Math.sin(a) * c.r * 0.66 + 8;
						props.push({ y, svg: skullStake(A, x, y, 0.6) });
					}
				else if (n.kind === "spot") {
					const x = n.x + n.r * 0.55,
						y = n.y - n.r * 0.35;
					props.push({ y, svg: stump(A, x, y, 0.6) });
					if (n.hand && n.name)
						props.push({
							y: n.y - n.r * 0.45,
							svg: nameBoard(A, n.x - n.r * 0.3, n.y - n.r * 0.45, n.name),
						});
				}
			}
			for (const w of ways)
				props.push({ y: w.y, svg: wayMark(A, w.n, w.x, w.y, biome) });
			for (const sg of signs)
				props.push({
					y: sg.y,
					svg: `<g transform="translate(${f1(sg.x)} ${f1(sg.y)}) scale(.62) translate(${f1(-sg.x)} ${f1(-sg.y)})">${A.signpost(sg.x, sg.y, [[nameOf(o.names, sg.to), sg.dir]])}</g>`,
				});
		}
		props.sort((a, b) => a.y - b.y);

		let ponds = "",
			pondDeco = "";
		const Gs = {
			big: (pass, box, svg) => {
				pondDeco += svg;
			},
			put: (pass, x, y, svg) => {
				pondDeco += svg;
			},
		};
		water
			.filter((w) => !w.grid)
			.forEach((w, i) => {
				ponds += A.pondBase(w);
				A.pondDeco(Gs, w, 501 + i);
				if (biome === "swamp" || w.mark)
					for (let k = 0; k < (w.mark ? 4 : 3); k++) {
						const a = r() * Math.PI * 2,
							x = w.x + Math.cos(a) * (w.r - 18),
							y = w.y + Math.sin(a) * (w.r - 18) * 0.72;
						pondDeco += A.ITEM.reeds({ x, y }).svg;
					}
			});
		if (gridWater.length) {
			let d = "";
			for (const w of water)
				if (w.grid) {
					const R = w.r * 0.96;
					d += `M${f1(w.x - R)} ${f1(w.y)} a${f1(R)} ${f1(R)} 0 1 0 ${f1(2 * R)} 0 a${f1(R)} ${f1(R)} 0 1 0 ${f1(-2 * R)} 0 `;
				}
			ponds += `<path d="${d}" fill="${P.sand}" stroke="${P.sand}" stroke-width="24"/><path d="${d}" fill="${biome === "ash" ? "#e8572a" : P.water}"/>`;
		}

		const rd = (d, w, c, op = 1, extra = "") =>
			d
				? `<path d="${d}" fill="none" stroke="${c}" stroke-width="${f1(w)}" stroke-linecap="round" stroke-linejoin="round"${op < 1 ? ` opacity="${op}"` : ""}${extra}/>`
				: "";
		const roadsSvg =
			rd(
				roadD.tract,
				ROAD.tract + EDGE + 8,
				INK,
				biome === "ice" ? 0.3 : 0.18,
			) +
			rd(
				roadD.trail + roadD.town,
				ROAD.trail + EDGE + 4,
				INK,
				biome === "ice" ? 0.24 : 0.13,
			) +
			rd(roadD.tract, ROAD.tract + EDGE, P.pathD) +
			rd(roadD.trail, ROAD.trail + EDGE, P.pathD, 0.9) +
			rd(roadD.town, ROAD.town + EDGE, P.paveD) +
			rd(roadD.lane, ROAD.lane + EDGE * 0.6, P.pathD, 0.45) +
			rd(roadD.tract, ROAD.tract, P.path) +
			rd(roadD.trail, ROAD.trail, P.path) +
			rd(roadD.town, ROAD.town, P.pave) +
			rd(roadD.lane, ROAD.lane, P.path, 0.75, ' stroke-dasharray="26 9"') +
			rd(
				roadD.tract,
				ROAD.tract * 0.62,
				P.pathD,
				0.28,
				' stroke-dasharray="40 26"',
			) +
			rd(roadD.tract, ROAD.tract * 0.3, P.pathL, 0.55) +
			rd(roadD.trail, ROAD.trail * 0.3, P.pathL, 0.5);
		const brush =
			`<path d="${br.tuft}" fill="none" stroke="${P.grassD}" stroke-width="3" stroke-linecap="round"/><path d="${br.leaf}" fill="${P.grassL}" opacity=".9"/>` +
			br.fl
				.map((d, i) =>
					d
						? `<path d="${d}" fill="${FLC[i]}" stroke="${INK}" stroke-width="1.6"/>`
						: "",
				)
				.join("") +
			(br.st
				? `<path d="${br.st}" fill="${P.rockL}" stroke="${INK}" stroke-width="2"/>`
				: "") +
			(br.hum
				? `<path d="${br.hum}" fill="${P.grassD}" stroke="${INK}" stroke-width="2" stroke-linejoin="round" opacity=".85"/>`
				: "");

		const townPl = places.find((p) => p.kind === "town");
		if (GR) {
			const R = GR.px * 0.78;
			for (const [x, y] of GR.cells("#"))
				if (
					shown(x, y) &&
					!(town && Math.hypot(x - town.x, y - town.y) < town.r * 1.3) &&
					!(ROCKY[biome] && noise(x + 777, y) > 0.52)
				)
					forestBase += `M${f1(x - R)} ${f1(y)} a${f1(R)} ${f1(R)} 0 1 0 ${f1(2 * R)} 0 a${f1(R)} ${f1(R)} 0 1 0 ${f1(-2 * R)} 0 `;
		}
		const under =
			ground +
			(rockCells
				? `<path d="${rockCells}" fill="${A.mix(P.rock, P.grass, 0.45)}"/>`
				: "") +
			(forestBase
				? `<path d="${forestBase}" fill="${thin ? A.mix(P.forest, P.grass, 0.5) : P.forest}"/>`
				: "") +
			ponds +
			roadsSvg +
			clear +
			brush +
			flat.join("") +
			pondDeco;
		const body = under + props.map((p) => p.svg).join("");
		return {
			body,
			under,
			props,
			C,
			landD,
			sand: P.sand,
			fogC,
			bg: A.mix(P.forest, P.forestD, 0.5),
			roads,
			places,
			decor,
			water,
		};
	}

	function draw(sch, o = {}) {
		const A = o.A || (typeof window !== "undefined" && window.LGTownKitArt);
		if (!A) throw new Error("districtart: нет набора деталей townkit (o.A)");
		if (!sch || !Array.isArray(sch.nodes))
			throw new Error("districtart: нет схемы");
		K = +o.viewK || (DG && DG.VIEW_K) || 2.95;
		const f1 = A.f1,
			nbs = (o.neighbors || []).filter(
				(s) => s && Array.isArray(s.nodes) && s.id !== sch.id,
			);
		const F = frameOf(sch, nbs.length ? NB_PX : PAD_PX),
			W = F.W,
			H = F.H;
		A.reset(sch.biome && A.BIOME[sch.biome] ? sch.biome : "meadow");
		const C0 = [];
		if (sch.contour && sch.contour.length >= 6)
			for (let i = 0; i < sch.contour.length; i += 2)
				C0.push([(sch.contour[i] - F.X0) * K, (sch.contour[i + 1] - F.Y0) * K]);
		const nbArt = nbs.map((s) =>
			layer(s, F, o, A, { bare: true, out: C0.length ? C0 : null }),
		);
		const L = layer(sch, F, o, A, { nbs, hasNb: nbs.length > 0 });
		const outD = `M-10 -10 H${W + 10} V${H + 10} H-10 Z ${L.landD}`;
		let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${A.glowDef("dgGlow", "#ffcf6a", 0.9)}${A.glowDef("dgRed", "#ff5a3a", 0.85)}</defs>`;

		if (nbArt.length)
			svg +=
				`<rect x="0" y="0" width="${W}" height="${H}" fill="${SEA.deep}"/>` +
				`<path d="${L.landD}" fill="none" stroke="${SEA.mid}" stroke-width="520" stroke-linejoin="round" opacity=".55"/>` +
				`<path d="${L.landD}" fill="none" stroke="${SEA.shallow}" stroke-width="250" stroke-linejoin="round"/>` +
				`<path d="${L.landD}" fill="none" stroke="#ffffff" stroke-width="330" stroke-linejoin="round" stroke-dasharray="14 70" opacity=".22"/>` +
				`<path d="${L.landD}" fill="none" stroke="#ffffff" stroke-width="170" stroke-linejoin="round" stroke-dasharray="24 50" opacity=".3"/>` +
				`<path d="${L.landD}" fill="none" stroke="${A.mix(L.sand, "#ffffff", 0.25)}" stroke-width="112" stroke-linejoin="round"/>` +
				`<path d="${L.landD}" fill="none" stroke="${L.sand}" stroke-width="84" stroke-linejoin="round"/>`;
		else svg += `<rect x="0" y="0" width="${W}" height="${H}" fill="${L.bg}"/>`;
		if (nbArt.length) {
			svg += `<clipPath id="dgOut"><path d="${outD}" clip-rule="evenodd"/></clipPath><g clip-path="url(#dgOut)">${nbArt.map((a) => a.under).join("")}</g>`;

			const FOG_K = [
				1.6, 1.3, 1.05, 0.85, 0.68, 0.54, 0.42, 0.32, 0.24, 0.17, 0.11, 0.06,
				0.03,
			];
			svg += `<mask id="dgFogM" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect x="0" y="0" width="${W}" height="${H}" fill="#fff"/>${FOG_K.map((k) => `<path d="${L.landD}" fill="none" stroke="#000" stroke-width="${f1(NB_PX * k)}" stroke-linejoin="round" opacity=".24"/>`).join("")}</mask>`;
			svg +=
				L.under +
				[L.props, ...nbArt.map((a) => a.props)]
					.flat()
					.sort((a, b) => a.y - b.y)
					.map((p) => p.svg)
					.join("") +
				`<g clip-path="url(#dgOut)"><rect x="0" y="0" width="${W}" height="${H}" fill="${L.fogC}" opacity=".8" mask="url(#dgFogM)"/></g>` +
				`<path d="${L.landD}" fill="none" stroke="${A.mix(L.fogC, "#ffffff", 0.4)}" stroke-width="6" opacity=".45" stroke-dasharray="2 18" stroke-linecap="round"/>`;
		} else {
			svg +=
				L.body +
				`<path d="${outD}" fill="${L.fogC}" fill-rule="evenodd" opacity=".62"/>` +
				`<path d="${L.landD}" fill="none" stroke="${L.fogC}" stroke-width="110" opacity=".22" stroke-linejoin="round"/><path d="${L.landD}" fill="none" stroke="${L.fogC}" stroke-width="48" opacity=".3" stroke-linejoin="round"/>` +
				`<path d="${L.landD}" fill="none" stroke="${A.mix(L.fogC, "#ffffff", 0.4)}" stroke-width="6" opacity=".35" stroke-dasharray="2 18" stroke-linecap="round"/>`;
		}
		svg += "</svg>";
		A.reset(sch.biome && A.BIOME[sch.biome] ? sch.biome : "meadow");
		return {
			svg,
			W,
			H,
			k: K,
			x0: F.X0,
			y0: F.Y0,
			pad: F.pad,
			ver: VER,
			id: sch.id,
			roads: L.roads.map(({ w, cls, pts }) => ({ w, cls, pts })),
			places: L.places,
			decor: L.decor,
			water: L.water
				.filter((w) => !w.grid)
				.map(({ x, y, r: rad, poly, mark }) => ({
					x,
					y,
					r: rad,
					poly,
					mark: !!mark,
				})),
		};
	}

	const nameOf = (names, id) =>
		String((names && names[id]) || id)
			.toUpperCase()
			.slice(0, 22);

	function crag(A, x, y, q, r, biome) {
		const { P, O, f1 } = A,
			C =
				biome === "desert"
					? [P.rock, P.rockD, P.rockL]
					: [P.mrock || P.rock, P.mrockD || P.rockD, P.mrockL || P.rockL];
		let g = `<ellipse cx="${f1(x + 10)}" cy="${f1(y + 2)}" rx="${f1(110 * q)}" ry="${f1(18 * q)}" fill="${A.INK}" opacity=".2"/>`;
		const parts = [
			[-56, 0, 50, 70],
			[44, 0, 56, 60],
			[-6, -20, 62, 110],
		].sort((a, b) => a[1] - b[1]);
		for (const [dx, dy, w, h] of parts) {
			const bx = x + dx * q,
				by = y + dy * q,
				ww = w * q,
				hh = h * q * (0.85 + r() * 0.3),
				tx = bx + (r() - 0.5) * ww * 0.5;
			g += `<path d="${A.poly([
				[bx - ww, by],
				[bx - ww * 0.7, by - hh * 0.6],
				[tx, by - hh],
				[bx + ww * 0.75, by - hh * 0.55],
				[bx + ww, by],
			])}" fill="${C[0]}" ${O(3.4)}/>`;
			g += `<path d="${A.poly([
				[tx, by - hh],
				[bx + ww * 0.75, by - hh * 0.55],
				[bx + ww, by],
				[tx + ww * 0.1, by],
			])}" fill="${C[1]}" opacity=".55"/><path d="M${f1(bx - ww * 0.6)} ${f1(by - hh * 0.55)} L${f1(tx - 4)} ${f1(by - hh + 8)}" stroke="${C[2]}" stroke-width="${f1(6 * q)}" stroke-linecap="round" opacity=".85"/>`;
			if (biome === "ice")
				g += `<path d="M${f1(tx - ww * 0.4)} ${f1(by - hh * 0.75)} L${f1(tx)} ${f1(by - hh)} L${f1(tx + ww * 0.42)} ${f1(by - hh * 0.72)} Q${f1(tx)} ${f1(by - hh * 0.82)} ${f1(tx - ww * 0.4)} ${f1(by - hh * 0.75)} Z" fill="#f6fbff" ${O(2.4)}/>`;
		}
		return g;
	}

	function wreck(A, x, y, q, r) {
		const { P, O, f1 } = A,
			w = Math.round(120 * q),
			cid = A.uid("dgWr");
		let tp = `M${f1(x - w / 2)} ${f1(y + 10)} V${f1(y - 70 * q)}`;
		for (let i = 1; i <= 6; i++)
			tp += ` L${f1(x - w / 2 + (w * i) / 6)} ${f1(y - (40 + r() * 70) * q)}`;
		tp += ` V${f1(y + 10)} Z`;
		let g = `<clipPath id="${cid}"><path d="${tp}"/></clipPath><g clip-path="url(#${cid})">${A.stoneWall(Math.round(x - w / 2), Math.round(x + w / 2), Math.round(y - 120 * q), Math.round(y))}</g>`;
		const cx = x + w / 2 + 34 * q,
			ch = (60 + r() * 50) * q;
		g += `<rect x="${f1(cx - 14 * q)}" y="${f1(y - ch)}" width="${f1(28 * q)}" height="${f1(ch)}" fill="${P.rockL}" ${O(3)}/><path d="M${f1(cx - 5 * q)} ${f1(y - ch + 6)} V${f1(y - 6)} M${f1(cx + 5 * q)} ${f1(y - ch + 6)} V${f1(y - 6)}" stroke="${P.rockD}" stroke-width="2.4" opacity=".7"/><rect x="${f1(cx - 20 * q)}" y="${f1(y - 10 * q)}" width="${f1(40 * q)}" height="${f1(12 * q)}" rx="3" fill="${P.rock}" ${O(3)}/>`;
		for (let i = 0; i < 4; i++)
			g += `<path d="${A.blob(x - w / 2 - 20 * q + r() * (w + 40 * q), y + 4 + r() * 10, (8 + r() * 8) * q, (5 + r() * 5) * q, r, 6, 0.25)}" fill="${P.rock}" ${O(2.4)}/>`;
		return g;
	}
	function bones(x, y, s, r) {
		const b = (x0, y0, x1, y1) =>
			`<path d="M${x0.toFixed(1)} ${y0.toFixed(1)} L${x1.toFixed(1)} ${y1.toFixed(1)}" stroke="#2b1d18" stroke-width="${(9 * s).toFixed(1)}" stroke-linecap="round"/><path d="M${x0.toFixed(1)} ${y0.toFixed(1)} L${x1.toFixed(1)} ${y1.toFixed(1)}" stroke="#f2e6c8" stroke-width="${(5 * s).toFixed(1)}" stroke-linecap="round"/>`;
		const a = r() * Math.PI,
			L = 22 * s;
		return (
			b(
				x - Math.cos(a) * L,
				y - Math.sin(a) * L * 0.5,
				x + Math.cos(a) * L,
				y + Math.sin(a) * L * 0.5,
			) + b(x - 10 * s, y + 8 * s, x + 14 * s, y + 2 * s)
		);
	}
	function flowers(n, r) {
		let d = "";
		const c = ["#fff4e0", "#ffd0dc", "#ffe27a"][Math.floor(r() * 3)];
		for (let i = 0; i < 16; i++) {
			const a = r() * Math.PI * 2,
				q = Math.sqrt(r()) * n.r * 0.75,
				x = n.x + Math.cos(a) * q,
				y = n.y + Math.sin(a) * q * 0.78;
			d += `M${(x + 5).toFixed(1)} ${y.toFixed(1)} a5 5 0 1 0 -10 0 a5 5 0 1 0 10 0 `;
		}
		return `<path d="${d}" fill="${c}" stroke="#2b1d18" stroke-width="1.6"/>`;
	}
	function stump(A, x, y, s) {
		const { P, O, f1 } = A,
			w = 30 * s,
			h = 26 * s;
		return (
			`<ellipse cx="${f1(x + 4)}" cy="${f1(y + 2)}" rx="${f1(w + 8)}" ry="${f1(8 * s)}" fill="${A.INK}" opacity=".2"/><path d="M${f1(x - w)} ${f1(y)} V${f1(y - h)} H${f1(x + w)} V${f1(y)} Q${f1(x)} ${f1(y + 8 * s)} ${f1(x - w)} ${f1(y)} Z" fill="${P.wood}" ${O(3)}/>` +
			`<ellipse cx="${f1(x)}" cy="${f1(y - h)}" rx="${f1(w)}" ry="${f1(10 * s)}" fill="${P.woodL}" ${O(3)}/><ellipse cx="${f1(x)}" cy="${f1(y - h)}" rx="${f1(w * 0.5)}" ry="${f1(5 * s)}" fill="none" stroke="${P.woodD}" stroke-width="2"/>` +
			`<rect x="${f1(x - w * 3.2)}" y="${f1(y - 12 * s)}" width="${f1(w * 1.9)}" height="${f1(16 * s)}" rx="${f1(8 * s)}" fill="${P.woodD}" ${O(3)}/>`
		);
	}
	function nameBoard(A, x, y, name) {
		const t = String(name).slice(0, 26),
			w = Math.max(90, t.length * 13 + 30);
		return (
			`<path d="M${x} ${y} V${y - 70}" stroke="${A.INK}" stroke-width="9" stroke-linecap="round"/><path d="M${x} ${y} V${y - 70}" stroke="${A.P.wood}" stroke-width="4.5" stroke-linecap="round"/>` +
			A.board(x, y - 78, t, 16, { w, h: 30 })
		);
	}
	function menhir(A, x, y, s, i) {
		const { P, O, f1 } = A,
			w = 20 * s,
			h = (70 + (i % 3) * 14) * s,
			lean = (i % 2 ? 1 : -1) * 5 * s;
		return (
			`<ellipse cx="${f1(x + 6)}" cy="${f1(y + 2)}" rx="${f1(w * 1.6)}" ry="${f1(7 * s)}" fill="${A.INK}" opacity=".22"/><path d="M${f1(x - w)} ${f1(y)} L${f1(x - w * 0.8 + lean)} ${f1(y - h + 10 * s)} Q${f1(x + lean)} ${f1(y - h - 8 * s)} ${f1(x + w * 0.8 + lean)} ${f1(y - h + 12 * s)} L${f1(x + w)} ${f1(y)} Z" fill="${P.rock}" ${O(3)}/>` +
			`<path d="M${f1(x - w * 0.45 + lean)} ${f1(y - h + 18 * s)} L${f1(x - w * 0.5)} ${f1(y - 8 * s)}" stroke="${P.rockL}" stroke-width="${f1(5 * s)}" stroke-linecap="round" opacity=".8"/><path d="M${f1(x - w * 0.3)} ${f1(y - h * 0.55)} l${f1(w * 0.5)} ${f1(-6 * s)} l${f1(-w * 0.2)} ${f1(14 * s)}" stroke="#8a6aff" stroke-width="${f1(3 * s)}" fill="none" opacity=".7"/>`
		);
	}
	function skullStake(A, x, y, s) {
		const { P, O, f1 } = A,
			h = 70 * s;
		return (
			`<path d="M${f1(x)} ${f1(y)} V${f1(y - h)}" stroke="${A.INK}" stroke-width="${f1(10 * s)}" stroke-linecap="round"/><path d="M${f1(x)} ${f1(y)} V${f1(y - h)}" stroke="${P.woodD}" stroke-width="${f1(5 * s)}" stroke-linecap="round"/>` +
			skull(A, x, y - h - 4 * s, s)
		);
	}
	function skull(A, x, y, s) {
		const { O, f1 } = A,
			c = "#f2e6c8";
		return (
			`<path d="M${f1(x - 16 * s)} ${f1(y)} Q${f1(x - 18 * s)} ${f1(y - 30 * s)} ${f1(x)} ${f1(y - 30 * s)} Q${f1(x + 18 * s)} ${f1(y - 30 * s)} ${f1(x + 16 * s)} ${f1(y)} L${f1(x + 9 * s)} ${f1(y + 10 * s)} H${f1(x - 9 * s)} Z" fill="${c}" ${O(3)}/>` +
			`<circle cx="${f1(x - 6 * s)}" cy="${f1(y - 10 * s)}" r="${f1(4.5 * s)}" fill="#2b1d18"/><circle cx="${f1(x + 6 * s)}" cy="${f1(y - 10 * s)}" r="${f1(4.5 * s)}" fill="#2b1d18"/><path d="M${f1(x - 5 * s)} ${f1(y + 5 * s)} v4 M${f1(x)} ${f1(y + 5 * s)} v4 M${f1(x + 5 * s)} ${f1(y + 5 * s)} v4" stroke="#2b1d18" stroke-width="2"/>`
		);
	}

	function campfire(A, x, y, s) {
		const { O, f1 } = A;
		let g = `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(110 * s)}" ry="${f1(60 * s)}" fill="url(#dgGlow)" opacity=".6"/>`;
		for (let i = 0; i < 8; i++) {
			const a = (i / 8) * Math.PI * 2;
			g += `<ellipse cx="${f1(x + Math.cos(a) * 26 * s)}" cy="${f1(y + Math.sin(a) * 12 * s)}" rx="${f1(8 * s)}" ry="${f1(6 * s)}" fill="${A.P.rock}" ${O(2.4)}/>`;
		}
		g += `<path d="M${f1(x - 22 * s)} ${f1(y + 2 * s)} L${f1(x + 20 * s)} ${f1(y - 10 * s)} M${f1(x - 20 * s)} ${f1(y - 10 * s)} L${f1(x + 22 * s)} ${f1(y + 2 * s)}" stroke="${A.INK}" stroke-width="${f1(11 * s)}" stroke-linecap="round"/><path d="M${f1(x - 22 * s)} ${f1(y + 2 * s)} L${f1(x + 20 * s)} ${f1(y - 10 * s)} M${f1(x - 20 * s)} ${f1(y - 10 * s)} L${f1(x + 22 * s)} ${f1(y + 2 * s)}" stroke="${A.P.wood}" stroke-width="${f1(6 * s)}" stroke-linecap="round"/>`;
		const fl = (w, h, c) =>
			`<path d="M${f1(x - w * s)} ${f1(y - 4 * s)} Q${f1(x - w * 1.2 * s)} ${f1(y - h * 0.5 * s)} ${f1(x - w * 0.2 * s)} ${f1(y - h * s)} Q${f1(x + w * 0.1 * s)} ${f1(y - h * 0.6 * s)} ${f1(x + w * 0.5 * s)} ${f1(y - h * 0.8 * s)} Q${f1(x + w * 1.3 * s)} ${f1(y - h * 0.4 * s)} ${f1(x + w * s)} ${f1(y - 4 * s)} Z" fill="${c}"${c === "#ff7a2a" ? ` ${O(3)}` : ""}/>`;
		return (
			g + fl(18, 54, "#ff7a2a") + fl(12, 38, "#ffb43a") + fl(6, 22, "#fff0a0")
		);
	}

	function tent(A, x, y, s, c, cD) {
		const { O, f1 } = A,
			w = 46 * s,
			h = 62 * s,
			d = 30 * s;
		return (
			`<ellipse cx="${f1(x + d * 0.5)}" cy="${f1(y + 2)}" rx="${f1(w + d)}" ry="${f1(10 * s)}" fill="${A.INK}" opacity=".2"/>` +
			`<path d="M${f1(x)} ${f1(y - h)} L${f1(x + d)} ${f1(y - h - 10 * s)} L${f1(x + w + d)} ${f1(y - 10 * s)} L${f1(x + w)} ${f1(y)} Z" fill="${cD}" ${O(3)}/>` +
			`<path d="M${f1(x - w)} ${f1(y)} L${f1(x)} ${f1(y - h)} L${f1(x + w)} ${f1(y)} Z" fill="${c}" ${O(3.4)}/><path d="M${f1(x - 13 * s)} ${f1(y)} L${f1(x)} ${f1(y - h * 0.6)} L${f1(x + 13 * s)} ${f1(y)} Z" fill="#3a2826" ${O(2.4)}/>` +
			`<path d="M${f1(x)} ${f1(y - h)} V${f1(y - h - 14 * s)} M${f1(x - w)} ${f1(y)} l${f1(-16 * s)} ${f1(6 * s)} M${f1(x + w)} ${f1(y)} l${f1(14 * s)} ${f1(6 * s)}" stroke="${A.INK}" stroke-width="2.6" stroke-linecap="round"/>`
		);
	}

	function campSvg(A, x, y, s, r) {
		const T2 = [
			["#e8d4a8", "#c8ad7a"],
			["#d9a066", "#a8743f"],
			["#c9b6a0", "#9e8a74"],
		];
		const items = [
			[-80, -30, 0],
			[72, -36, 1],
			[-4, -76, 2],
		].map(([dx, dy, i]) => ({
			y: y + dy * s,
			svg: tent(A, x + dx * s, y + dy * s, s * 0.95, T2[i][0], T2[i][1]),
		}));
		const fx = x + 4 * s,
			fy = y + 18 * s;
		items.push({ y: fy, svg: campfire(A, fx, fy, s * 0.9) });
		items.push({
			y: fy + 26 * s,
			svg: `<rect x="${A.f1(fx - 40 * s)}" y="${A.f1(fy + 18 * s)}" width="${A.f1(56 * s)}" height="${A.f1(14 * s)}" rx="${A.f1(7 * s)}" fill="${A.P.woodD}" ${A.O(3)}/>`,
		});
		const bx = x + 70 * s,
			by = y + 4 * s;
		items.push({
			y: by,
			svg: `<path d="M${A.f1(bx)} ${A.f1(by)} V${A.f1(by - 110 * s)}" stroke="${A.INK}" stroke-width="${A.f1(9 * s)}" stroke-linecap="round"/><path d="M${A.f1(bx)} ${A.f1(by)} V${A.f1(by - 110 * s)}" stroke="${A.P.woodL}" stroke-width="${A.f1(4.5 * s)}" stroke-linecap="round"/><path d="M${A.f1(bx + 2)} ${A.f1(by - 106 * s)} h${A.f1(44 * s)} l${A.f1(-10 * s)} ${A.f1(14 * s)} l${A.f1(10 * s)} ${A.f1(14 * s)} h${A.f1(-44 * s)} Z" fill="#c8202a" ${A.O(3)}/><path d="M${A.f1(bx + 14 * s)} ${A.f1(by - 92 * s)} l${A.f1(8 * s)} ${A.f1(-8 * s)} l${A.f1(8 * s)} ${A.f1(8 * s)}" stroke="#ffcf4a" stroke-width="2.4" fill="none"/>`,
		});
		return items
			.sort((a, b) => a.y - b.y)
			.map((i) => i.svg)
			.join("");
	}

	function dungeonSvg(A, x, y, s) {
		const { P, O, f1 } = A,
			R = WL.rng(Math.round(x * 13 + y));
		let g = `<ellipse cx="${f1(x + 8)}" cy="${f1(y + 4)}" rx="${f1(120 * s)}" ry="${f1(20 * s)}" fill="${A.INK}" opacity=".2"/>`;
		g += `<path d="${A.blob(x, y - 40 * s, 112 * s, 56 * s, R, 10, 0.12)}" fill="${P.grassD}" ${O(4)}/><path d="${A.blob(x - 20 * s, y - 56 * s, 70 * s, 30 * s, R, 8, 0.15)}" fill="${P.grass}" opacity=".8"/>`;
		const aw = 46 * s,
			ah = 84 * s;
		g += `<path d="M${f1(x - aw - 16 * s)} ${f1(y)} V${f1(y - ah + 20 * s)} Q${f1(x - aw - 14 * s)} ${f1(y - ah - 24 * s)} ${f1(x)} ${f1(y - ah - 26 * s)} Q${f1(x + aw + 14 * s)} ${f1(y - ah - 24 * s)} ${f1(x + aw + 16 * s)} ${f1(y - ah + 20 * s)} V${f1(y)} Z" fill="${P.rock}" ${O(4)}/>`;
		g += `<path d="M${f1(x - aw)} ${f1(y)} V${f1(y - ah + 24 * s)} Q${f1(x - aw)} ${f1(y - ah - 6 * s)} ${f1(x)} ${f1(y - ah - 8 * s)} Q${f1(x + aw)} ${f1(y - ah - 6 * s)} ${f1(x + aw)} ${f1(y - ah + 24 * s)} V${f1(y)} Z" fill="#140c0e" ${O(3)}/>`;
		let st = "";
		for (let i = 0; i < 4; i++) {
			const yy = y - 6 * s - i * 13 * s,
				w = aw * (0.92 - i * 0.16);
			st += `M${f1(x - w)} ${f1(yy)} H${f1(x + w)} `;
		}
		g += `<path d="${st}" stroke="${P.rockL}" stroke-width="${f1(4 * s)}" opacity=".55" stroke-linecap="round"/>`;
		let bl = "";
		for (let i = 0; i <= 6; i++) {
			const a = Math.PI * (1 - i / 6),
				cx = x + Math.cos(a) * (aw + 8 * s),
				cy = y - ah + 22 * s - Math.sin(a) * 42 * s;
			bl += `M${f1(cx)} ${f1(cy)} l${f1(Math.cos(a) * 9 * s)} ${f1(-Math.sin(a) * 9 * s)} `;
		}
		g += `<path d="${bl}" stroke="${P.rockD}" stroke-width="3" stroke-linecap="round"/><path d="M${f1(x - 9 * s)} ${f1(y - ah - 22 * s)} h${f1(18 * s)} l${f1(-4 * s)} ${f1(16 * s)} h${f1(-10 * s)} Z" fill="${P.rockL}" ${O(2.4)}/>`;
		for (const tx of [x - aw - 34 * s, x + aw + 34 * s])
			g += `<circle cx="${f1(tx)}" cy="${f1(y - 70 * s)}" r="${f1(40 * s)}" fill="url(#dgGlow)" opacity=".8"/><path d="M${f1(tx)} ${f1(y)} V${f1(y - 62 * s)}" stroke="${A.INK}" stroke-width="${f1(8 * s)}" stroke-linecap="round"/><path d="M${f1(tx)} ${f1(y)} V${f1(y - 62 * s)}" stroke="${P.wood}" stroke-width="${f1(4 * s)}" stroke-linecap="round"/><path d="M${f1(tx - 7 * s)} ${f1(y - 62 * s)} Q${f1(tx - 9 * s)} ${f1(y - 78 * s)} ${f1(tx)} ${f1(y - 88 * s)} Q${f1(tx + 9 * s)} ${f1(y - 78 * s)} ${f1(tx + 7 * s)} ${f1(y - 62 * s)} Z" fill="#ffb43a" ${O(2.4)}/>`;
		return g;
	}

	function caveLair(A, x, y, s, biome, boss) {
		const { P, O, f1 } = A,
			R = WL.rng(Math.round(x * 7 + y)),
			rk =
				biome === "desert"
					? [P.rock, P.rockD, P.rockL]
					: [P.mrock || P.rock, P.mrockD || P.rockD, P.mrockL || P.rockL];
		let g = `<ellipse cx="${f1(x + 10)}" cy="${f1(y + 6)}" rx="${f1(170 * s)}" ry="${f1(28 * s)}" fill="${A.INK}" opacity=".25"/>`;
		g += `<path d="${A.poly([
			[x - 170 * s, y + 4],
			[x - 120 * s, y - 110 * s],
			[x - 40 * s, y - 170 * s],
			[x + 40 * s, y - 150 * s],
			[x + 120 * s, y - 100 * s],
			[x + 175 * s, y + 4],
		])}" fill="${rk[2]}" ${O(4)}/>`;
		g += `<path d="${A.poly([
			[x - 40 * s, y - 170 * s],
			[x + 40 * s, y - 150 * s],
			[x + 120 * s, y - 100 * s],
			[x + 175 * s, y + 4],
			[x + 20 * s, y + 4],
		])}" fill="${rk[1]}" opacity=".55"/>`;
		if (biome === "ice")
			g += `<path d="M${f1(x - 120 * s)} ${f1(y - 110 * s)} L${f1(x - 40 * s)} ${f1(y - 170 * s)} L${f1(x + 40 * s)} ${f1(y - 150 * s)} L${f1(x + 120 * s)} ${f1(y - 100 * s)} Q${f1(x + 60 * s)} ${f1(y - 120 * s)} ${f1(x + 30 * s)} ${f1(y - 128 * s)} Q${f1(x - 30 * s)} ${f1(y - 120 * s)} ${f1(x - 70 * s)} ${f1(y - 128 * s)} Q${f1(x - 100 * s)} ${f1(y - 104 * s)} ${f1(x - 120 * s)} ${f1(y - 110 * s)} Z" fill="#f6fbff" ${O(3)}/>`;
		for (let i = 0; i < 5; i++) {
			const bx = x + (R() - 0.5) * 260 * s,
				by = y - 20 * s - R() * 40 * s;
			g += `<path d="${A.blob(bx, by, (18 + R() * 12) * s, (12 + R() * 8) * s, R, 7, 0.2)}" fill="${rk[0]}" ${O(3)}/>`;
		}
		const mw = 70 * s,
			mh = 104 * s;
		g += `<path d="M${f1(x - mw)} ${f1(y)} Q${f1(x - mw - 6 * s)} ${f1(y - mh)} ${f1(x)} ${f1(y - mh - 6 * s)} Q${f1(x + mw + 6 * s)} ${f1(y - mh)} ${f1(x + mw)} ${f1(y)} Z" fill="#120a0c" ${O(5)}/>`;
		let th = "";
		for (let i = 0; i < 6; i++) {
			const tx = x - mw * 0.75 + i * mw * 0.3,
				ty = y - mh * (i === 0 || i === 5 ? 0.7 : 0.92);
			th += `M${f1(tx - 7 * s)} ${f1(ty)} L${f1(tx)} ${f1(ty + 22 * s)} L${f1(tx + 7 * s)} ${f1(ty)} Z `;
		}
		g += `<path d="${th}" fill="#f2e6c8" stroke="${A.INK}" stroke-width="2.4" stroke-linejoin="round"/>`;
		g += `<circle cx="${f1(x)}" cy="${f1(y - mh * 0.45)}" r="${f1(46 * s)}" fill="url(#dgRed)" opacity=".55"/><ellipse cx="${f1(x - 14 * s)}" cy="${f1(y - mh * 0.45)}" rx="${f1(7 * s)}" ry="${f1(4.5 * s)}" fill="#ff5a3a"/><ellipse cx="${f1(x + 14 * s)}" cy="${f1(y - mh * 0.45)}" rx="${f1(7 * s)}" ry="${f1(4.5 * s)}" fill="#ff5a3a"/>`;
		g +=
			bones(x - mw - 30 * s, y - 6 * s, 1.1 * s, R) +
			bones(x + mw + 34 * s, y - 2 * s, 1 * s, R) +
			skull(A, x + mw + 10 * s, y + 2 * s, 0.9 * s);
		if (boss) g += banners(A, x, y, mw + 50 * s, s);
		return g;
	}

	function towerLair(A, x, y, s, biome, boss) {
		const { P, O, f1 } = A,
			R = WL.rng(Math.round(x * 11 + y));
		const glow =
				biome === "swamp"
					? "#8aff6a"
					: biome === "blight"
						? "#b48aff"
						: "#ff6a2a",
			C =
				biome === "swamp"
					? ["#5a5a4a", "#3e3e32", "#76765f"]
					: ["#4e4652", "#34303a", "#6e6672"];
		const w = 56 * s,
			h = 230 * s,
			top = y - h;
		let g = `<ellipse cx="${f1(x + 10)}" cy="${f1(y + 6)}" rx="${f1(130 * s)}" ry="${f1(24 * s)}" fill="${A.INK}" opacity=".25"/>`;
		g += `<path d="M${f1(x - w - 10 * s)} ${f1(y)} L${f1(x - w)} ${f1(top + 30 * s)} L${f1(x - w * 0.5)} ${f1(top + 6 * s)} L${f1(x - w * 0.1)} ${f1(top + 26 * s)} L${f1(x + w * 0.35)} ${f1(top - 10 * s)} L${f1(x + w)} ${f1(top + 40 * s)} L${f1(x + w + 10 * s)} ${f1(y)} Z" fill="${C[0]}" ${O(4)}/>`;
		g += `<path d="M${f1(x + w * 0.35)} ${f1(top - 10 * s)} L${f1(x + w)} ${f1(top + 40 * s)} L${f1(x + w + 10 * s)} ${f1(y)} L${f1(x + w * 0.4)} ${f1(y)} Z" fill="${C[1]}" opacity=".6"/>`;
		let st = "";
		for (let yy = top + 50 * s, row = 0; yy < y - 10 * s; yy += 22 * s, row++)
			for (
				let xx = x - w + (row % 2) * 14 * s;
				xx < x + w - 10 * s;
				xx += 30 * s
			)
				st += `M${f1(xx)} ${f1(yy)} h${f1(22 * s)} `;
		g += `<path d="${st}" stroke="${C[2]}" stroke-width="3" opacity=".55" stroke-linecap="round"/>`;
		for (const [wx, wy] of [
			[x - 16 * s, top + 70 * s],
			[x + 18 * s, top + 120 * s],
			[x - 10 * s, top + 160 * s],
		])
			g += `<circle cx="${f1(wx)}" cy="${f1(wy)}" r="${f1(26 * s)}" fill="url(#dgRed)" opacity=".5"/><path d="M${f1(wx - 8 * s)} ${f1(wy + 12 * s)} V${f1(wy - 4 * s)} Q${f1(wx)} ${f1(wy - 16 * s)} ${f1(wx + 8 * s)} ${f1(wy - 4 * s)} V${f1(wy + 12 * s)} Z" fill="${glow}" ${O(2.6)}/>`;
		g += `<path d="M${f1(x - 26 * s)} ${f1(y)} V${f1(y - 50 * s)} Q${f1(x)} ${f1(y - 78 * s)} ${f1(x + 26 * s)} ${f1(y - 50 * s)} V${f1(y)} Z" fill="#120a0c" ${O(4)}/>`;
		for (let i = 0; i < 6; i++) {
			const bx = x + (R() - 0.5) * 240 * s,
				by = y + (R() - 0.3) * 16 * s;
			if (Math.abs(bx - x) < 40 * s) continue;
			g += `<path d="${A.blob(bx, by - 8 * s, (14 + R() * 10) * s, (9 + R() * 6) * s, R, 6, 0.25)}" fill="${C[0]}" ${O(3)}/>`;
		}
		g += skull(A, x + 46 * s, y + 4 * s, 0.8 * s);
		if (boss) g += banners(A, x, y, w + 44 * s, s);
		return g;
	}

	function banners(A, x, y, dx, s) {
		let g = "";
		for (const bx of [x - dx, x + dx])
			g +=
				`<path d="M${A.f1(bx)} ${A.f1(y)} V${A.f1(y - 130 * s)}" stroke="${A.INK}" stroke-width="${A.f1(10 * s)}" stroke-linecap="round"/><path d="M${A.f1(bx)} ${A.f1(y)} V${A.f1(y - 130 * s)}" stroke="${A.P.woodD}" stroke-width="${A.f1(5 * s)}" stroke-linecap="round"/>` +
				`<path d="M${A.f1(bx - 22 * s)} ${A.f1(y - 124 * s)} H${A.f1(bx + 22 * s)} V${A.f1(y - 60 * s)} L${A.f1(bx)} ${A.f1(y - 74 * s)} L${A.f1(bx - 22 * s)} ${A.f1(y - 60 * s)} Z" fill="#8a1a24" ${A.O(3)}/>` +
				skull(A, bx, y - 84 * s, 0.5 * s);
		return g;
	}

	function townSvg(A, town, gate, wallK, roofPal, r, kind) {
		const { P, O, f1 } = A,
			R = town.r,
			sc = R / 200,
			cx = town.x,
			cy = town.y;
		const RX = 178,
			RY = 140,
			NV = 14,
			ga = gate
				? Math.atan2((gate.y - cy) / sc / (RY / RX), (gate.x - cx) / sc)
				: Math.PI / 2;
		const V = [];
		for (let i = 0; i < NV; i++) {
			const a = ga + Math.PI / NV + (i / NV) * Math.PI * 2;
			V.push([Math.cos(a) * RX, Math.sin(a) * RY]);
		}
		const H2 = 44,
			items = [];
		for (let i = 0; i < NV; i++) {
			let p1 = V[i],
				p2 = V[(i + 1) % NV];
			const gateSeg = i === NV - 1;
			if (p1[0] > p2[0]) [p1, p2] = [p2, p1];
			const dx = p2[0] - p1[0],
				dy = p2[1] - p1[1],
				L = Math.hypot(dx, dy),
				my = (p1[1] + p2[1]) / 2;
			if (gateSeg) {
				const gx = (p1[0] + p2[0]) / 2,
					gy = (p1[1] + p2[1]) / 2;
				items.push({
					y: gy,
					back: gy < 0,
					svg: `<g transform="translate(${f1(gx)} ${f1(gy)}) scale(.36)">${A.woodGate({ id: "gate", pass: [-60, 0, 60, 0], vis: [-60, -150, 60, 0], sign: "ВОРОТА" })}</g>`,
				});
				continue;
			}
			items.push({
				y: my,
				back: my < 0,
				svg: `<g transform="matrix(${f1((dx / L) * 100) / 100} ${f1((dy / L) * 100) / 100} 0 ${f1((H2 / 130) * 100) / 100} ${f1(p1[0])} ${f1(p1[1])})">${A.WALLK[wallK](0, Math.round(L), -130, 0, i + 1)}</g>`,
			});
		}
		for (let i = 0; i < NV; i += 2) {
			if (i === 0 || i === NV - 1) continue;
			const [tx, ty] = V[i];
			items.push({
				y: ty + 0.5,
				back: ty < 0,
				svg: `<g transform="translate(${f1(tx)} ${f1(ty + 4)}) scale(.3)">${A.wallTower(wallK, 0, 0, roofPal)}</g>`,
			});
		}

		const houses = [],
			RF = ["red", "teal", "mustard", "blue", "plum", "pink"],
			keep = kind === "capital" || kind === "grandcapital";
		let hi = 0;
		for (let yy = -88; yy <= 92; yy += 56)
			for (let xx = -128; xx <= 128; xx += 64) {
				const jx = xx + (Math.round(yy / 56) & 1 ? 30 : 0) + (r() - 0.5) * 12,
					jy = yy + (r() - 0.5) * 10;
				if ((jx / (RX - 56)) ** 2 + ((jy + 10) / (RY - 46)) ** 2 > 1) continue;
				const big = Math.abs(jx) < 34 && Math.abs(jy) < 30,
					k = big ? 0.42 : 0.3;
				if (big && keep) {
					houses.push({
						y: jy,
						svg: `<g transform="translate(${f1(jx)} ${f1(jy + 8)}) scale(${kind === "grandcapital" ? 0.62 : 0.5})">${A.wallTower(wallK === "palisade" || wallK === "stakes" ? "stone" : wallK, -40, 0, roofPal)}${A.wallTower(wallK === "palisade" || wallK === "stakes" ? "stone" : wallK, 40, 0, roofPal)}${A.guildFlag ? A.guildFlag(-40, -300, "#c8202a", 1.1) : ""}</g>`,
					});
					continue;
				}
				houses.push({
					y: jy,
					svg: `<g transform="translate(${f1(jx)} ${f1(jy)}) scale(${k})">${A.houseB({ id: "th" + hi++, vis: [-75, -170, 75, 0], door: { x: 0, y: 6 }, roof: big ? "plum" : RF[Math.floor(r() * RF.length)] }, {})}</g>`,
				});
			}
		houses.sort((a, b) => a.y - b.y);
		const back = items.filter((i) => i.back).sort((a, b) => a.y - b.y),
			front = items.filter((i) => !i.back).sort((a, b) => a.y - b.y);
		const ground = `<ellipse cx="6" cy="10" rx="${RX + 26}" ry="${RY + 22}" fill="${A.INK}" opacity=".16"/><ellipse cx="0" cy="0" rx="${RX + 16}" ry="${RY + 14}" fill="${P.paveD}" ${O(4)}/><ellipse cx="0" cy="0" rx="${RX - 4}" ry="${RY - 6}" fill="${P.plaza}"/>`;
		return `<g transform="translate(${f1(cx)} ${f1(cy)}) scale(${f1(sc * 1000) / 1000})">${ground}${back.map((i) => i.svg).join("")}${houses.map((h) => h.svg).join("")}${front.map((i) => i.svg).join("")}</g>`;
	}

	function check(art, m = MARGIN) {
		const out = [],
			CL = Clear(art.roads, art.places, null);
		for (const d of art.decor) {
			if (!CL.road(d.box, m))
				out.push(`${d.k} (${Math.round(d.x)}, ${Math.round(d.y)}) на дороге`);
			else if (!CL.place(d.box, m))
				out.push(`${d.k} (${Math.round(d.x)}, ${Math.round(d.y)}) на месте`);
		}

		for (const w of art.water) {
			const hitR = art.roads.some((rd) =>
				rd.pts.some((p) => Math.hypot(p[0] - w.x, p[1] - w.y) < w.r + rd.w / 2),
			);
			const hitP = art.places.some(
				(p) => Math.hypot(p.x - w.x, p.y - w.y) < w.r + p.r,
			);
			if (hitR || hitP)
				out.push(
					`вода (${Math.round(w.x)}, ${Math.round(w.y)}) на ${hitR ? "дороге" : "месте"}`,
				);
		}
		return out;
	}

	function h64(s) {
		let a = 0xdeadbeef,
			b = 0x41c6ce57;
		for (let i = 0; i < s.length; i++) {
			const c = s.charCodeAt(i);
			a = Math.imul(a ^ c, 2654435761);
			b = Math.imul(b ^ c, 1597334677);
		}
		a =
			Math.imul(a ^ (a >>> 16), 2246822507) ^
			Math.imul(b ^ (b >>> 13), 3266489909);
		b =
			Math.imul(b ^ (b >>> 16), 2246822507) ^
			Math.imul(a ^ (a >>> 13), 3266489909);
		return (
			(b >>> 0).toString(16).padStart(8, "0") +
			(a >>> 0).toString(16).padStart(8, "0")
		);
	}
	const townOf = (t) =>
		t
			? {
					nature: t.nature || null,
					thin: t.thin != null ? +t.thin : null,
					wall: t.wall || null,
				}
			: null;

	function artKey(sch, ver = VER, o = {}) {
		const nbs = (o.neighbors || []).filter(
			(s) => s && Array.isArray(s.nodes) && s.id !== sch.id,
		);
		const names = {};
		for (const n of sch.nodes || [])
			if (n && n.kind === "exit") names[n.to] = nameOf(o.names, n.to);
		const towns = {};
		for (const s of nbs) towns[s.id] = townOf(o.towns && o.towns[s.id]);
		return h64(
			JSON.stringify([
				ver,
				o.print || "",
				+o.viewK || 0,
				o.townKind || "",
				townOf(o.town),
				names,
				towns,
				sch,
				nbs,
			]),
		);
	}

	return {
		VER,
		get K() {
			return K;
		},
		PAD_PX,
		NB_PX,
		ROAD,
		MARGIN,
		NAT,
		frameOf,
		gridOf,
		wayKind,
		draw,
		check,
		Clear,
		artKey,
		h64,
	};
});
