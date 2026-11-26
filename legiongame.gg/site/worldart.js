window.QWorldArt = (() => {
	const A = window.QArt,
		{ INK, f1, rng, smooth, ROCKP, NEEDLE, LEAF } = A;
	const TS = 512,
		LV = [1 / 16, 1 / 8, 1 / 4, 1 / 2, 1],
		CH = 2048;
	const INKW = [24, 13, 7, 4, 2.6];
	const SP = [360, 210, 130, 80, 52];
	const SZ = [5.4, 3.1, 1.85, 1.12, 0.72];
	const OCEAN = "#6a8daa";
	const GROUND = {
		meadow: "#c4ca8c",
		forest: "#a7b878",
		taiga: "#9aac7c",
		ice: "#e3e9f1",
		mount: "#b8b29c",
		swamp: "#929c70",
		desert: "#dcc48a",
		ash: "#80696a",
		coast: "#d0cc94",
		ruin: "#ad9f88",
		blight: "#7a6e7c",
	};
	const GVAR = {
		meadow: ["#b9c47e", "#d8d29a", "#a8bc72", "#cbbf84"],
		forest: ["#93ad66", "#b3c27e", "#86a05a"],
		taiga: ["#8aa070", "#a6b688", "#c4d0bc"],
		ice: ["#f6f8fc", "#d4dce8", "#cad4e2"],
		mount: ["#aaa490", "#c8c2aa", "#9c9686"],
		swamp: ["#7c8a5c", "#a0a674", "#6f7f5a"],
		desert: ["#e8d29c", "#ccb074", "#ecdcae"],
		ash: ["#6a5058", "#8e6e66", "#5c4648"],
		coast: ["#dcd69e", "#c2c98c", "#e6dca6"],
		ruin: ["#9a8a74", "#bcac90", "#7a6a5a"],
		blight: ["#6a5c6c", "#827280", "#5a4c5e"],
	};
	let W = null;

	const pairs = (flat) => {
		const o = [];
		for (let i = 0; i < flat.length; i += 2) o.push([flat[i], flat[i + 1]]);
		return o;
	};
	const bbOf = (pts, pad = 0) => {
		let a = 1e9,
			b = 1e9,
			c = -1e9,
			d = -1e9;
		for (const [x, y] of pts) {
			if (x < a) a = x;
			if (y < b) b = y;
			if (x > c) c = x;
			if (y > d) d = y;
		}
		return [a - pad, b - pad, c + pad, d + pad];
	};
	const hit = (a, b) =>
		a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
	const lineD = (p) => "M" + p.map(([x, y]) => `${x} ${y}`).join("L");
	function dp(p, eps) {
		if (p.length < 3) return p.slice();
		const keep = new Uint8Array(p.length);
		keep[0] = keep[p.length - 1] = 1;
		const st = [[0, p.length - 1]];
		while (st.length) {
			const [a, b] = st.pop();
			const [ax, ay] = p[a],
				[bx, by] = p[b],
				dx = bx - ax,
				dy = by - ay,
				L = Math.hypot(dx, dy);
			let md = -1,
				mi = -1;
			for (let i = a + 1; i < b; i++) {
				const d = L
					? Math.abs(dy * p[i][0] - dx * p[i][1] + bx * ay - by * ax) / L
					: Math.hypot(p[i][0] - ax, p[i][1] - ay);
				if (d > md) {
					md = d;
					mi = i;
				}
			}
			if (md > eps) {
				keep[mi] = 1;
				st.push([a, mi], [mi, b]);
			}
		}
		return p.filter((_, i) => keep[i]);
	}
	function pipRings(rs, x, y) {
		let c = false;
		for (const p of rs)
			for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
				const [xi, yi] = p[i],
					[xj, yj] = p[j];
				if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
					c = !c;
			}
		return c;
	}
	function prep(D) {
		const T = D.territories.map((t, i) => ({ ...t, i })),
			idx = new Map(T.map((t) => [t.id, t.i]));
		const R = D.regions.map((r, i) => ({ ...r, i })),
			ridx = new Map(R.map((r) => [r.id, r.i]));
		const chains = D.chains.map((c) => ({
			l: c.l == null ? -1 : idx.get(c.l),
			r: c.r == null ? -1 : idx.get(c.r),
			p: pairs(c.p),
		}));

		for (const c of chains) {
			c.bb = bbOf(c.p);
			c.coast = c.l < 0 || c.r < 0;
			c.pL = LV.map((s) => dp(c.p, 0.45 / s));
			c.dL = c.pL.map(lineD);
		}
		for (const t of T) {
			t.ri = ridx.get(t.region);
			t.poly = t.rings.map((ring) => {
				const o = [];
				for (const ref of ring) {
					const c = chains[ref >= 0 ? ref : ~ref],
						p = ref >= 0 ? c.p : c.p.slice().reverse();
					for (let i = o.length ? 1 : 0; i < p.length; i++) o.push(p[i]);
				}
				return o;
			});
			t.bb = bbOf(t.poly.flat());
			t.dL = LV.map((_, L) =>
				t.rings
					.map((ring) => {
						const o = [];
						for (const ref of ring) {
							const c = chains[ref >= 0 ? ref : ~ref],
								p = ref >= 0 ? c.pL[L] : c.pL[L].slice().reverse();
							for (let i = o.length ? 1 : 0; i < p.length; i++) o.push(p[i]);
						}
						return lineD(o) + "Z";
					})
					.join(""),
			);
		}
		for (const c of chains) {
			c.region = c.l >= 0 && c.r >= 0 && T[c.l].ri !== T[c.r].ri;
		}
		const rivers = D.rivers.map((R0) => {
			const p = A.dense(pairs(R0.p), 30);
			return { p, w: R0.w, bb: bbOf(p, R0.w[1]) };
		});
		const roads = D.roads.map((R0) => {
			const p = pairs(R0.p);
			return { p, main: R0.main, bb: bbOf(p, 20), a: R0.a, b: R0.b };
		});
		const isles = D.isles.map((f) => {
			const p = pairs(f);
			return { p, bb: bbOf(p, 40) };
		});

		const G = 150,
			gx0 = D.VB[0],
			gy0 = D.VB[1],
			GNX = Math.ceil(D.VB[2] / G),
			GNY = Math.ceil(D.VB[3] / G),
			grid = new Int16Array(GNX * GNY).fill(-3);
		const exact = (x, y) => {
			for (const t of T)
				if (
					x >= t.bb[0] &&
					x <= t.bb[2] &&
					y >= t.bb[1] &&
					y <= t.bb[3] &&
					pipRings(t.poly, x, y)
				)
					return t.i;
			return -1;
		};
		const terrAt = (x, y) => {
			const i = Math.floor((x - gx0) / G),
				j = Math.floor((y - gy0) / G);
			if (i < 0 || j < 0 || i >= GNX || j >= GNY) return -1;
			const k = j * GNX + i;
			let v = grid[k];
			if (v === -3) {
				const a = exact(gx0 + i * G + 1, gy0 + j * G + 1),
					b = exact(gx0 + (i + 1) * G - 1, gy0 + j * G + 1),
					c = exact(gx0 + i * G + 1, gy0 + (j + 1) * G - 1),
					d = exact(gx0 + (i + 1) * G - 1, gy0 + (j + 1) * G - 1),
					m = exact(gx0 + (i + 0.5) * G, gy0 + (j + 0.5) * G);
				v = grid[k] = a === b && b === c && c === d && d === m ? a : -2;
			}
			return v === -2 ? exact(x, y) : v;
		};

		const SG = 400,
			seg = new Map();
		const addSeg = (p, w, kind) => {
			for (let i = 1; i < p.length; i++) {
				const [ax, ay] = p[i - 1],
					[bx, by] = p[i];
				const s = { ax, ay, bx, by, w, kind };
				for (
					let gx = Math.floor((Math.min(ax, bx) - w) / SG);
					gx <= Math.floor((Math.max(ax, bx) + w) / SG);
					gx++
				)
					for (
						let gy = Math.floor((Math.min(ay, by) - w) / SG);
						gy <= Math.floor((Math.max(ay, by) + w) / SG);
						gy++
					) {
						const key = gx * 100003 + gy;
						let l = seg.get(key);
						if (!l) seg.set(key, (l = []));
						l.push(s);
					}
			}
		};
		for (const r of rivers) {
			const n = r.p.length;
			for (let i = 1; i < n; i++)
				addSeg(
					[r.p[i - 1], r.p[i]],
					(r.w[0] + ((r.w[1] - r.w[0]) * i) / n) / 2,
					"river",
				);
		}
		for (const r of roads) addSeg(r.p, 8, "road");
		const clear = (x, y, pad) => {
			const l = seg.get(Math.floor(x / SG) * 100003 + Math.floor(y / SG));
			if (!l) return true;
			for (const s of l) {
				const dx = s.bx - s.ax,
					dy = s.by - s.ay,
					L2 = dx * dx + dy * dy || 1,
					t = Math.max(
						0,
						Math.min(1, ((x - s.ax) * dx + (y - s.ay) * dy) / L2),
					);
				if (Math.hypot(x - s.ax - dx * t, y - s.ay - dy * t) < s.w + pad)
					return false;
			}
			return true;
		};
		const towns = T.map((t) => ({
			id: t.id,
			x: t.town.x,
			y: t.town.y,
			kind: t.town.kind,
			t: t.i,
			cap: !!t.capital,
			grand: !!t.grand,
		}));

		const bar = D.barrier ? pairs(D.barrier) : [],
			arcs = [];

		const gates = (D.gates || []).map((g) => {
			let bi = 0,
				bd = 1e18;
			bar.forEach(([x, y], i) => {
				const d = (x - g.x) ** 2 + (y - g.y) ** 2;
				if (d < bd) {
					bd = d;
					bi = i;
				}
			});
			const a = bar[(bi - 2 + bar.length) % bar.length] || [g.x, g.y],
				b = bar[(bi + 2) % bar.length] || [g.x, g.y];
			return { ...g, vert: Math.abs(b[1] - a[1]) > Math.abs(b[0] - a[0]) };
		});
		if (bar.length) {
			const loop = A.dense([...bar, bar[0]], 20),
				GAP = 250;
			let cur = [];
			loop.forEach((p, i) => {
				const nearGate = gates.some((g) =>
					g.vert
						? Math.abs(g.x - p[0]) < 160 && p[1] > g.y - 230 && p[1] < g.y + 245
						: Math.abs(g.x - p[0]) < GAP && Math.abs(g.y - p[1]) < 400,
				);
				if (nearGate) {
					if (cur.length > 2) arcs.push(cur);
					cur = [];
					return;
				}
				const a = loop[Math.max(0, i - 1)],
					b = loop[Math.min(loop.length - 1, i + 1)],
					dx = b[0] - a[0],
					dy = b[1] - a[1],
					L = Math.hypot(dx, dy) || 1;
				cur.push([p[0], p[1], -dy / L, dx / L]);
			});
			if (cur.length > 2) arcs.push(cur);
			for (const a of arcs) {
				a.bb = bbOf(
					a.map(([x, y]) => [x, y]),
					200,
				);
				a.d = lineD(a.map(([x, y]) => [f1(x), f1(y)]));
				addSeg(
					a.map(([x, y]) => [x, y]),
					260,
					"wall",
				);
			}
		}
		return {
			D,
			T,
			R,
			chains,
			rivers,
			roads,
			isles,
			terrAt,
			clear,
			towns,
			arcs,
			gates,
			vb: D.VB,
		};
	}

	const TPL = new Map();
	let TID = 0;
	let measure = null;
	function bbox(svg) {
		try {
			if (!measure) {
				measure = document.createElementNS("http://www.w3.org/2000/svg", "svg");
				measure.setAttribute(
					"style",
					"position:absolute;left:-9999px;top:0;width:10px;height:10px;visibility:hidden",
				);
				document.body.appendChild(measure);
			}
			measure.innerHTML = `<g>${svg}</g>`;
			const b = measure.firstChild.getBBox();
			return [b.x, b.y, b.x + b.width, b.y + b.height];
		} catch (e) {
			return [-60, -120, 60, 10];
		}
	}

	function tpl(kind, v, fn) {
		const key = kind + "#" + v;
		let t = TPL.get(key);
		if (t) return t;
		A.begin();
		fn(rng(A.hash(key)));
		const o = A.take();
		const id = "w" + (TID++).toString(36);
		let ol = o.map((x) => x.ol).join(""),
			body = o.map((x) => x.body).join("");
		body = body
			.replace(/<animate[^>]*\/>/g, "")
			.replace(/<animate[^>]*>[\s\S]*?<\/animate>/g, "")
			.replace(/id="(q[hl]\d+)"/g, `id="${id}$1"`)
			.replace(/url\(#(q[hl]\d+)\)/g, `url(#${id}$1)`);
		const fam = o[0] ? o[0].fam : null,
			rad = o.reduce((m, x) => Math.max(m, x.rad), 0);
		t = {
			id,
			fam,
			rad,
			ol,
			body,
			bb: bbox(ol + body),
			def: `<g id="${id}o">${ol}</g><g id="${id}b">${body}</g>`,
		};
		TPL.set(key, t);
		return t;
	}
	const NV = 6;
	const T_ = {
		pine: (v, pal) =>
			tpl("pine" + pal, v, (r) =>
				A.treePine(r, 0, 0, 1, NEEDLE[pal], r() < 0.5),
			),
		round: (v, pal) =>
			tpl("round" + pal, v, (r) => A.treeRound(r, 0, 0, 1, LEAF[pal])),
		birch: (v) => tpl("birch", v, (r) => A.treeBirch(r, 0, 0, 1)),
		poplar: (v, pal) =>
			tpl("poplar" + pal, v, (r) => A.treePoplar(r, 0, 0, 1, LEAF[pal])),
		dead: (v, col) => tpl("dead" + col, v, (r) => A.treeDead(r, 0, 0, 1, col)),
		bush: (v, pal) =>
			tpl("bush" + pal, v, (r) => A.bush(r, 0, 0, 1, LEAF[pal])),
		mnt: (v, pal, snow) =>
			tpl("mnt" + pal + snow, v, (r) =>
				A.mountain(r, 0, 0, 1, ROCKP[pal], snow ? { allSnow: true } : {}),
			),
		crag: (v, pal) =>
			tpl("crag" + pal, v, (r) => A.crag(r, 0, 0, 1, ROCKP[pal], r() < 0.15)),
		hill: (v, k) => tpl("hill" + k, v, (r) => A.hill(r, 0, 0, 1, HILLP[k])),
		rock: (v, pal) =>
			tpl("rock" + pal, v, (r) => A.rock(r, 0, 0, 1, ROCKP[pal])),
	};
	const HILLP = {
		green: ["#7f9a52", "#9ab06a", "#c4d48e"],
		dry: ["#a8945a", "#c4b070", "#e0d098"],
		snow: ["#b8c4d4", "#dce4ee", "#f8faff"],
		ash: ["#5a4448", "#7a5e5e", "#9a7a72"],
		dark: ["#5f6a4a", "#7a8458", "#9aa070"],
	};
	NEEDLE.frost = ["#3c6a6c", "#5a8a86", "#d8ecef"];
	ROCKP.ridge = { b: "#6e7388", d: "#4c5068", l: "#9096ac", snow: "#f4f6ff" };
	ROCKP.ridge2 = { b: "#7c7f92", d: "#5a5c72", l: "#a0a2b6", snow: "#f4f6ff" };

	const CHUNKS = new Map();
	const ih = (a, b, c) => {
		let h =
			Math.imul(a | 0, 73856093) ^
			Math.imul(b | 0, 19349663) ^
			Math.imul((c | 0) + 7, 83492791);
		h = Math.imul(h ^ (h >>> 15), 2246822519);
		return (h ^ (h >>> 13)) >>> 0;
	};
	const pk = (r, a) => a[Math.floor(r() * a.length)];

	const VIS = {
		tree: 2,
		dead: 2,
		hill: 1,
		rock: 1,
		mnt: 2,
		wall: 2,
		raw: 9,
		site: 9,
		ground: 2,
		wave: 1,
	};

	const SITEK = [1, 1, 0.78, 0.6, 0.46],
		GRANDK = [1, 1, 0.9, 0.75, 0.62];
	function chunk(l, ci, cj) {
		const key = l + ":" + ci + ":" + cj;
		let c = CHUNKS.get(key);
		if (c) return c;
		c = { objs: [], ground: [] };
		CHUNKS.set(key, c);
		const sp = SP[l],
			s0 = SZ[l],
			gx0 = Math.floor((ci * CH) / sp),
			gx1 = Math.floor(((ci + 1) * CH) / sp),
			gy0 = Math.floor((cj * CH) / sp),
			gy1 = Math.floor(((cj + 1) * CH) / sp);
		const put = (t, x, y, k, kind) =>
			c.objs.push({
				t,
				x,
				y,
				k,
				fam: t.fam || kind,
				kind,
				rad: (t.rad || 20) * k,
				bb: [
					x + t.bb[0] * k,
					y + t.bb[1] * k,
					x + t.bb[2] * k,
					y + t.bb[3] * k,
				],
			});
		for (let gx = gx0; gx < gx1; gx++)
			for (let gy = gy0; gy < gy1; gy++) {
				const r = rng(ih(gx, gy, l)),
					x = (gx + r()) * sp,
					y = (gy + r()) * sp;
				const ti = W.terrAt(x, y);
				if (ti < 0) {
					if (l >= 1 && l <= 2 && r() < 0.06) wave(c, l, x, y, r);
					continue;
				}

				const tj = W.terrAt(
						x + (r() - 0.5) * sp * 2.2,
						y + (r() - 0.5) * sp * 2.2,
					),
					t = W.T[tj >= 0 ? tj : ti];
				if (W.terrAt(x - sp * 0.4, y) < 0 || W.terrAt(x + sp * 0.4, y) < 0)
					continue;
				const T0 = W.D.TILE;
				if (
					x > T0.x - 60 &&
					x < T0.x + T0.w + 60 &&
					y > T0.y - 60 &&
					y < T0.y + T0.h + 60 &&
					l < 3
				)
					continue;
				if (!W.clear(x, y, l <= 1 ? 70 : 30)) continue;
				let near = 0;
				for (const tw of W.towns) {
					const R0 = tw.grand
						? 720
						: tw.cap
							? 380
							: tw.kind === "town"
								? 170
								: 300;
					if (
						Math.abs(tw.x - x) < R0 &&
						Math.abs(tw.y - y) < R0 * 0.8 &&
						(l <= 2 || Math.hypot(tw.x - x, (tw.y - y) * 1.25) < R0 * 0.7)
					) {
						near = tw.kind !== "blacktower" && TOWER_KINDS.has(tw.kind) ? 2 : 1;
						break;
					}
				}
				if (near) {
					if (l >= 3 && near === 1) village(c, l, x, y, r, t);
					continue;
				}
				place(c, put, l, x, y, r, t, s0, sp);
			}

		for (const tw of W.towns) {
			const lv = tw.cap || tw.kind !== "town" ? 0 : 1;
			if (lv !== l) continue;
			if (Math.floor(tw.x / CH) !== ci || Math.floor(tw.y / CH) !== cj)
				continue;
			const t = W.T[tw.t];

			if (tw.kind === "town" || tw.kind === "capital") {
				const st = siteTpl(t, tw);
				c.objs.push({
					t: st,
					x: tw.x,
					y: tw.y,
					k: 1,
					fam: null,
					kind: "site",
					rad: 0,
					bb: [
						tw.x + st.bb[0],
						tw.y + st.bb[1],
						tw.x + st.bb[2],
						tw.y + st.bb[3],
					],
				});
				continue;
			}
			const svg = site(t, tw),
				k = 1,
				big =
					tw.kind === "volcano" ||
					tw.kind === "worldtree" ||
					tw.kind === "abyss" ||
					tw.kind === "pyramids" ||
					tw.kind === "bones",
				K = tw.grand ? GRANDK : SITEK;
			c.objs.push({
				raw: big
					? svg.s
					: (L) =>
							K[L] === 1
								? svg.s
								: `<g transform="translate(${tw.x} ${tw.y}) scale(${K[L]}) translate(${-tw.x} ${-tw.y})">${svg.s}</g>`,
				x: tw.x,
				y: tw.y,
				k,
				fam: null,
				kind: "raw",
				rad: 0,
				bb: [
					tw.x + svg.bb[0],
					tw.y + svg.bb[1],
					tw.x + svg.bb[2],
					tw.y + svg.bb[3],
				],
			});
		}
		if (l === 0)
			for (const e of EXTRA)
				if (Math.floor(e.x / CH) === ci && Math.floor(e.y / CH) === cj)
					c.objs.push({
						raw: e.k
							? (L) =>
									`<g transform="translate(${e.x} ${e.y}) scale(${e.k[L]}) translate(${-e.x} ${-e.y})">${e.s}</g>`
							: e.s,
						x: e.x,
						y: e.y,
						k: 1,
						fam: null,
						kind: "raw",
						rad: 0,
						bb: e.bb,
					});

		if (W.arcs) {
			const step = SP[l] * 0.3;
			W.arcs.forEach((arc, ai) => {
				if (
					!hit(arc.bb, [
						ci * CH - 800,
						cj * CH - 800,
						(ci + 1) * CH + 800,
						(cj + 1) * CH + 800,
					])
				)
					return;
				let acc = step;
				for (let i = 1; i < arc.length; i++) {
					acc += Math.hypot(
						arc[i][0] - arc[i - 1][0],
						arc[i][1] - arc[i - 1][1],
					);
					if (acc < step) continue;
					acc = 0;
					const [x0, y0, nx, ny] = arc[i];
					if (Math.floor(x0 / CH) !== ci || Math.floor(y0 / CH) !== cj)
						continue;
					const r = rng(ih(Math.round(x0), Math.round(y0), l + 40 + ai)),
						v = Math.floor(r() * NV);
					const k = SZ[l] * 1.75 * (0.85 + r() * 0.35),
						off = (r() - 0.5) * SP[l] * 0.25;
					put(
						T_.mnt(v, "ridge", 1),
						x0 + nx * off,
						y0 + ny * off + SZ[l] * 8,
						k,
						"wall",
					);
					if (r() < 0.7) {
						const sd = r() < 0.5 ? -1 : 1,
							o2 = sd * (SP[l] * 0.35 + 60);
						put(
							T_.mnt(Math.floor(r() * NV), "ridge2", r() < 0.5 ? 1 : 0),
							x0 + nx * o2 + (r() - 0.5) * step,
							y0 + ny * o2,
							k * 0.62,
							"wall",
						);
					}
				}
			});
		}

		const o = c.objs,
			n = o.length,
			par = o.map((_, i) => i),
			find = (i) => (par[i] === i ? i : (par[i] = find(par[i])));
		for (let i = 0; i < n; i++) {
			const a = o[i];
			if (!a.fam || a.raw) continue;
			for (let j = i + 1; j < n; j++) {
				const b = o[j];
				if (b.fam !== a.fam || b.raw) continue;
				if (
					Math.abs(a.x - b.x) < (a.rad + b.rad) * 0.95 &&
					Math.abs(a.y - b.y) < (a.rad + b.rad) * 0.7
				)
					par[find(i)] = find(j);
			}
		}
		const gm = new Map();
		o.forEach((x, i) => {
			const k = find(i);
			if (!gm.has(k)) gm.set(k, []);
			gm.get(k).push(x);
		});
		c.groups = [...gm.values()].map((g) => {
			g.sort((a, b) => a.y - b.y);
			const bb = [1e9, 1e9, -1e9, -1e9];
			for (const x of g) {
				bb[0] = Math.min(bb[0], x.bb[0]);
				bb[1] = Math.min(bb[1], x.bb[1]);
				bb[2] = Math.max(bb[2], x.bb[2]);
				bb[3] = Math.max(bb[3], x.bb[3]);
			}
			const tr = (x) =>
				`translate(${f1(x.x)} ${f1(x.y)}) scale(${f1(x.k * 1000) / 1000})`;
			let s;
			const used = new Set();
			if (g[0].raw) {
				const f = g[0].raw;
				s = typeof f === "function" ? f : f;
			} else if (g[0].kind === "site") {
				const x = g[0];
				used.add(x.t);
				s = (L) =>
					`<use href="#${x.t.id}b" transform="translate(${f1(x.x)} ${f1(x.y)}) scale(${SITEK[L]})"/>`;
			} else {
				for (const x of g) used.add(x.t);
				s =
					`<g fill="${INK}" stroke="${INK}" stroke-width="5.2" stroke-linejoin="round" stroke-linecap="round">${g.map((x) => `<use href="#${x.t.id}o" transform="${tr(x)}"/>`).join("")}</g>` +
					g
						.map((x) => `<use href="#${x.t.id}b" transform="${tr(x)}"/>`)
						.join("");
			}
			return {
				key: g[g.length - 1].y + ci * 1e-3 + cj * 1e-6,
				bb,
				s,
				used,
				kind: g[0].kind,
				l,
				m: g[0].raw ? null : g.map((x) => ({ t: x.t, x: x.x, y: x.y, k: x.k })),
			};
		});
		c.objs = null;
		return c;
	}
	function siteTpl(t, tw) {
		const key = "site#" + t.id;
		let tt = TPL.get(key);
		if (tt) return tt;
		const sv = site(t, { ...tw, x: 0, y: 0 }),
			id = "w" + (TID++).toString(36);
		tt = {
			id,
			fam: null,
			rad: 0,
			ol: "",
			body: sv.s,
			bb: sv.bb,
			site: true,
			def: `<g id="${id}o"></g><g id="${id}b">${sv.s}</g>`,
		};
		TPL.set(key, tt);
		return tt;
	}

	const path = (o, k, d) => o[k] || (o[k] = new Path2D(d));
	function stroke(g, p, col, w, a = 1) {
		g.globalAlpha = a;
		g.strokeStyle = col;
		g.lineWidth = w;
		g.lineCap = "round";
		g.lineJoin = "round";
		g.stroke(p);
		g.globalAlpha = 1;
	}
	function fill(g, p, col, a = 1) {
		g.globalAlpha = a;
		g.fillStyle = col;
		g.fill(p);
		g.globalAlpha = 1;
	}
	const prop = (kind, v, fn) => tpl(kind, v, fn);
	const stampG = (c, x, y, k, t, bb) =>
		c.ground.push({ bb, kind: "ground", st: [t, x, y, k] });
	function wave(c, l, x, y, r) {
		const w = SP[l] * 0.5,
			o = {};
		c.ground.push({
			bb: [x - w, y - w, x + w, y + w],
			kind: "wave",
			p: (g, L) =>
				stroke(
					g,
					path(
						o,
						"p",
						`M${f1(x)} ${f1(y)} q${f1(w / 4)} ${f1(-w / 8)} ${f1(w / 2)} 0 t${f1(w / 2)} 0`,
					),
					"#9cbad0",
					INKW[L] * 1.3,
					0.7,
				),
		});
	}

	function place(c, put, l, x, y, r, t, s0, sp) {
		const b = t.biome,
			k = s0 * (0.82 + r() * 0.36),
			mood = A.hash(t.id) % 4,
			v = Math.floor(r() * NV),
			p = r();
		const flat = (fn) => c.ground.push(fn);

		if (l <= 2 && r() < 0.32) {
			const rx = sp * (0.5 + r() * 0.8),
				ry = rx * (0.35 + r() * 0.3),
				col = pk(r, GVAR[b] || GVAR.meadow),
				pts = A.blob(r, x, y, rx, ry, 8, 0.25),
				o = {};
			flat({
				bb: [x - rx, y - ry, x + rx, y + ry],
				kind: "ground",
				p: (g) => fill(g, path(o, "p", smooth(pts, true)), col, 0.5),
			});
		}
		switch (b) {
			case "forest":
			case "taiga": {
				if (p < 0.92)
					for (let q = 0, n = l === 0 ? 5 : l === 1 ? 3 : 2; q < n; q++) {
						const x0 = x,
							y0 = y;
						x = x0 + (q ? (r() - 0.5) * sp * 1.0 : 0);
						y = y0 + (q ? (r() - 0.5) * sp * 0.7 : 0);
						const v = Math.floor(r() * NV),
							k = s0 * (0.8 + r() * 0.4);
						if (q && W.terrAt(x, y) !== W.terrAt(x0, y0)) {
							x = x0;
							y = y0;
							continue;
						}
						if (b === "taiga" || mood === 0)
							put(
								T_.pine(
									v,
									pk(
										r,
										b === "taiga"
											? ["pine", "dark", "frost", "blue"]
											: ["pine", "blue", "dark"],
									),
								),
								x,
								y,
								k,
								"tree",
							);
						else if (mood === 1)
							put(
								r() < 0.6
									? T_.round(v, pk(r, ["autumn", "red", "gold", "autumn"]))
									: T_.pine(v, "pine"),
								x,
								y,
								k,
								"tree",
							);
						else
							put(
								r() < 0.55
									? T_.round(v, pk(r, ["green", "deep", "olive"]))
									: r() < 0.5
										? T_.pine(v, pk(r, ["pine", "dark"]))
										: r() < 0.6
											? T_.birch(v)
											: T_.poplar(v, "green"),
								x,
								y,
								k,
								"tree",
							);
						x = x0;
						y = y0;
					}
				else if (l >= 3 && p < 0.96) put(T_.bush(v, "green"), x, y, k, "tree");
				else if (l <= 2 && p < 0.97)
					put(T_.hill(v, "dark"), x, y, k * 1.1, "hill");
				break;
			}
			case "meadow":
			case "coast": {
				if (p < 0.12) {
					const n = 2 + Math.floor(r() * 3);
					for (let i = 0; i < n; i++)
						put(
							r() < 0.3
								? T_.bush(v, "green")
								: r() < 0.5
									? T_.round(v, pk(r, ["green", "deep", "olive"]))
									: r() < 0.5
										? T_.birch(v)
										: T_.poplar(v, "olive"),
							x + (r() - 0.5) * sp * 0.5,
							y + (r() - 0.5) * sp * 0.25,
							k * 0.9,
							"tree",
						);
				} else if (p < 0.2 && l <= 2)
					put(
						T_.hill(v, b === "coast" ? "dry" : "green"),
						x,
						y,
						k * 1.2,
						"hill",
					);
				else if (
					p < 0.4 &&
					l >= 2 &&
					l <= 3 &&
					W.towns.some(
						(tw) => Math.abs(tw.x - x) < 650 && Math.abs(tw.y - y) < 420,
					)
				)
					field(c, x, y, sp, r, l);
				else if (p < 0.23 && l === 2 && r() < 0.3) field(c, x, y, sp, r, l);
				else if (p < 0.34 && l >= 3)
					put(T_.rock(v, pk(r, ["violet", "brown"])), x, y, k * 0.8, "rock");
				else if (l === 4 && p < 0.5) {
					const fl =
						r() < 0.5
							? null
							: pk(r, ["#e8455c", "#ffc94d", "#f4f1ff", "#7ab0e8"]);
					stampG(
						c,
						x,
						y,
						1,
						fl
							? prop("flower" + fl, 0, () => A.one(0, 0, A.flower(0, 0, fl)))
							: prop("grass", 0, () => A.one(0, 0, A.grass(0, 0, 0.8))),
						[x - 12, y - 12, x + 12, y + 2],
					);
				}
				break;
			}
			case "ice": {
				if (p < 0.24) put(T_.mnt(v, "far", 1), x, y, k * 1.1, "mnt");
				else if (p < 0.4) put(T_.pine(v, "frost"), x, y, k, "tree");
				else if (p < 0.47) put(T_.crag(v, "slate"), x, y, k * 0.9, "mnt");
				else if (p < 0.6 && l <= 3)
					put(T_.hill(v, "snow"), x, y, k * 1.1, "hill");
				else if (l >= 2 && p < 0.7) {
					const o = {};
					flat({
						bb: [x - 40, y - 10, x + 40, y + 10],
						kind: "ground",
						p: (g, L) =>
							stroke(
								g,
								path(
									o,
									L,
									`M${f1(x - ((30 * k) / s0) * SZ[L])} ${f1(y)} l${f1(12 * SZ[L])} ${f1(-3 * SZ[L])} l${f1(10 * SZ[L])} ${f1(4 * SZ[L])} l${f1(14 * SZ[L])} ${f1(-2 * SZ[L])}`,
								),
								"#a8b8cc",
								INKW[L],
							),
					});
				}
				break;
			}
			case "mount": {
				if (p < 0.68)
					put(
						T_.mnt(
							v,
							pk(r, ["slate", "violet", "slate", "brown"]),
							r() < 0.3 ? 1 : 0,
						),
						x,
						y,
						k * (l <= 1 ? 1.25 : 1.05),
						"mnt",
					);
				else if (p < 0.8)
					put(T_.crag(v, pk(r, ["slate", "brown"])), x, y, k, "mnt");
				else if (p < 0.9)
					put(T_.pine(v, pk(r, ["dark", "blue"])), x, y, k * 0.9, "tree");
				else if (l >= 3) put(T_.rock(v, "slate"), x, y, k * 0.8, "rock");
				break;
			}
			case "swamp": {
				if (p < 0.28) put(T_.dead(v, "#5a4a3a"), x, y, k, "dead");
				else if (p < 0.4) put(T_.pine(v, "dark"), x, y, k * 0.9, "tree");
				else if (p < 0.6) pool(c, x, y, sp, r, l);
				else if (l >= 3 && p < 0.8)
					stampG(
						c,
						x,
						y,
						1,
						prop("reeds", v % 4, (q) => A.reeds(q, 0, 0, 1)),
						[x - 14, y - 26, x + 14, y + 2],
					);
				break;
			}
			case "desert": {
				if (p < 0.12) put(T_.crag(v, "ochre"), x, y, k * 1.1, "mnt");
				else if (p < 0.22 && l <= 2)
					put(T_.hill(v, "dry"), x, y, k * 1.25, "hill");
				else if (p < 0.5) {
					const w = sp * (0.4 + r() * 0.4),
						o = {};
					flat({
						bb: [x - w, y - w * 0.4, x + w, y + 4],
						kind: "ground",
						p: (g, L) => {
							stroke(
								g,
								path(
									o,
									"a",
									`M${f1(x - w)} ${f1(y)} Q${f1(x - w * 0.2)} ${f1(y - w * 0.32)} ${f1(x + w)} ${f1(y)}`,
								),
								"#c4a668",
								INKW[L] * 1.4,
							);
							stroke(
								g,
								path(
									o,
									"b",
									`M${f1(x - w * 0.7)} ${f1(y - 2)} Q${f1(x - w * 0.1)} ${f1(y - w * 0.26)} ${f1(x + w * 0.6)} ${f1(y - 2)}`,
								),
								"#f0e2b8",
								INKW[L],
							);
						},
					});
				} else if (p < 0.56 && l >= 3)
					put(T_.rock(v, "ochre"), x, y, k * 0.8, "rock");
				else if (p < 0.58 && l >= 3)
					put(T_.dead(v, "#8a7458"), x, y, k * 0.8, "dead");
				break;
			}
			case "ash":
			case "blight": {
				if (b === "ash" && p < 0.3)
					put(T_.mnt(v, "doom", r() < 0.3 ? 1 : 0), x, y, k * 1.1, "mnt");
				else if (p < (b === "ash" ? 0.48 : 0.42))
					put(T_.dead(v, "#3a2a2a"), x, y, k, "dead");
				else if (p < 0.56) put(T_.rock(v, "doom"), x, y, k * 0.9, "rock");
				else if (p < 0.7 && l <= 3) {
					const w = sp * (0.3 + r() * 0.5),
						pts = [];
					let px = x - w,
						py = y;
					for (let i = 0; i < 5; i++) {
						pts.push([px, py]);
						px += w * 0.4;
						py += (r() - 0.5) * w * 0.5;
					}
					const o = {};
					flat({
						bb: [x - w, y - w, x + w, y + w],
						kind: "ground",
						p: (g, L) => {
							const q = path(o, "p", smooth(pts));
							stroke(g, q, "#2a1a1a", INKW[L] * 2.2);
							stroke(
								g,
								q,
								b === "ash" ? "#ff7a3a" : "#c43a4a",
								INKW[L] * 0.9,
								0.85,
							);
						},
					});
				} else if (b === "blight" && l >= 3 && p < 0.8)
					stampG(
						c,
						x,
						y,
						0.9,
						prop("tomb", v % 6, (q) => A.tomb(q, 0, 0, 1)),
						[x - 14, y - 26, x + 14, y + 4],
					);
				break;
			}
			case "ruin": {
				if (p < 0.25) put(T_.dead(v, "#3a2a2a"), x, y, k, "dead");
				else if (p < 0.45 && l >= 2)
					stampG(
						c,
						x,
						y,
						l >= 3 ? 1 : 1.6,
						prop("ruin", v % 6, (q) =>
							(q() < 0.5 ? A.ruinWall : A.column)(q, 0, 0, 1),
						),
						[x - 80, y - 60, x + 80, y + 4],
					);
				else if (p < 0.55) put(T_.rock(v, "brown"), x, y, k * 0.8, "rock");
				break;
			}
		}
	}

	function field(c, x, y, sp, r, l) {
		const w = sp * (0.7 + r() * 0.5),
			h = w * (0.45 + r() * 0.2),
			rot = f1((r() - 0.5) * 24),
			col = pk(r, ["#e2c86a", "#b8c870", "#d8b46a", "#c8d07a"]);
		const o = {},
			a = (rot * Math.PI) / 180;
		c.ground.push({
			bb: [x - w, y - w, x + w, y + w],
			kind: "ground",
			p: (g, L) => {
				g.save();
				g.translate(x, y);
				g.rotate(a);
				g.translate(-x, -y);
				const q = path(
					o,
					"p",
					`M${f1(x - w / 2)} ${f1(y - h / 2)} l${f1(w)} ${f1(h * 0.04)} l${f1(-w * 0.04)} ${f1(h)} l${f1(-w * 0.94)} ${f1(-h * 0.04)} Z`,
				);
				fill(g, q, col);
				stroke(g, q, INK, INKW[L] * 0.8);
				let d = "";
				for (let k = h / 6; k < h - 2; k += h / 6)
					d += `M${f1(x - w / 2 + w * 0.05)} ${f1(y - h / 2 + k)} h${f1(w * 0.88)}`;
				stroke(g, path(o, "f", d), INK, INKW[L] * 0.45, 0.22);
				g.restore();
			},
		});
	}

	function pool(c, x, y, sp, r, l) {
		const rx = sp * (0.25 + r() * 0.3),
			ry = rx * 0.5,
			pts = A.blob(r, x, y, rx, ry, 9, 0.2);
		const o = {};
		c.ground.push({
			bb: [x - rx, y - ry, x + rx, y + ry],
			kind: "ground",
			p: (g, L) => {
				const q = path(o, "p", smooth(pts, true));
				fill(g, q, A.MURK.b);
				stroke(g, q, INK, INKW[L] * 0.8);
				stroke(
					g,
					path(
						o,
						"h",
						`M${f1(x - rx * 0.4)} ${f1(y - ry * 0.2)} h${f1(rx * 0.5)}`,
					),
					A.MURK.l,
					INKW[L],
				);
			},
		});
	}

	function village(c, l, x, y, r, t) {
		if (r() < 0.55) return;
		const roof = pk(r, ["#b5533c", "#8a5a3a", "#6a6a8a", "#a8743c"]),
			s = l === 4 ? 0.8 : 1.2;
		const wall = t.biome === "ice" ? "#f0f4f8" : "#ead9b8";
		stampG(
			c,
			x,
			y,
			s,
			prop("house" + roof + wall, 0, () =>
				A.one(0, 0, A.house(0, 0, 1, roof, wall)),
			),
			[x - 30, y - 40, x + 30, y + 4],
		);
	}

	function site(t, tw) {
		const r = rng(A.hash(t.id + "#site")),
			roof =
				{
					ice: "#5a6a8a",
					ash: "#5a3a3a",
					desert: "#c48a4a",
					swamp: "#6a5a3a",
					coast: "#3a6a9a",
				}[t.biome] || "#b5533c",
			wall =
				t.biome === "ice"
					? "#f0f4f8"
					: t.biome === "desert"
						? "#f0dcae"
						: "#ead9b8";
		const O = (w) =>
			`stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
		if (tw.kind === "grandcapital") return LMK.grandcapital(tw);
		if (tw.cap) {
			const R = 130,
				pts = [];
			for (let i = 0; i < 9; i++) {
				const a = Math.PI + (i / 8) * Math.PI;
				pts.push([Math.cos(a) * R, Math.sin(a) * R * 0.42 - 10]);
			}
			let s = `<g transform="translate(${tw.x} ${tw.y})"><ellipse cx="0" cy="10" rx="${R + 20}" ry="${R * 0.5}" fill="#000" opacity=".12"/>`;
			s += `<path d="M${-R} -10 Q0 ${R * 0.62} ${R} -10" fill="#c8bca0" ${O(7)}/>`;
			for (let i = 0; i < 7; i++) {
				const hx = -80 + (i % 4) * 52 + (i > 3 ? 26 : 0),
					hy = -40 + (i > 3 ? 34 : 0);
				s += A.house(hx, hy, 1.9, i % 3 ? roof : "#8a5a3a", wall);
			}
			s += `<rect x="-26" y="-130" width="52" height="96" fill="#b8b0a0" ${O(7)}/><path d="M-32 -130 h64 v-16 h-10 v8 h-10 v-8 h-12 v8 h-10 v-8 h-12 v8 h-10 Z" fill="#b8b0a0" ${O(6)}/><rect x="-9" y="-80" width="18" height="30" rx="9" fill="#3a3046"/><path d="M0 -146 V-200" ${O(6)}/><path d="M2 -198 L44 -186 L2 -172 Z" fill="#c8102e" ${O(5)}/>`;
			s += `<path d="${pts.map((p, i) => (i ? "L" : "M") + f1(p[0]) + " " + f1(p[1] + 40)).join("")}" fill="none" stroke="${INK}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/><path d="${pts.map((p, i) => (i ? "L" : "M") + f1(p[0]) + " " + f1(p[1] + 40)).join("")}" fill="none" stroke="#b8b0a0" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>`;
			s += `<path d="M${-R} 30 Q0 ${R * 0.75} ${R} 30" fill="none" stroke="${INK}" stroke-width="22" stroke-linecap="round"/><path d="M${-R} 30 Q0 ${R * 0.75} ${R} 30" fill="none" stroke="#b8b0a0" stroke-width="12" stroke-linecap="round"/>`;
			for (const [x, y] of [
				[-R, 30],
				[R, 30],
				[-R * 0.55, 70],
				[R * 0.55, 70],
				[0, 84],
			])
				s += `<rect x="${f1(x - 15)}" y="${f1(y - 44)}" width="30" height="50" fill="#b8b0a0" ${O(6)}/><path d="M${f1(x - 19)} ${f1(y - 44)} L${f1(x)} ${f1(y - 70)} L${f1(x + 19)} ${f1(y - 44)} Z" fill="${roof}" ${O(6)}/>`;
			return {
				s:
					s.replace(
						`translate(${tw.x} ${tw.y})`,
						`translate(${tw.x} ${tw.y}) scale(1.4)`,
					) + "</g>",
				bb: [(-R - 30) * 1.4, -300, (R + 30) * 1.4, 140],
			};
		}
		const k = tw.kind;
		if (k === "town") {
			let s = `<g transform="translate(${tw.x} ${tw.y})"><ellipse cx="0" cy="6" rx="90" ry="28" fill="#d8b878" fill-opacity=".6"/>`;
			const hs = [
				[-34, 2],
				[0, -14],
				[32, 4],
				[-6, 18],
			]
				.slice(0, 3 + (r() < 0.5 ? 1 : 0))
				.sort((a, b) => a[1] - b[1]);
			for (const [x, y] of hs)
				s += A.house(x * 1.3, y * 1.3, 2.0, r() < 0.7 ? roof : "#8a5a3a", wall);
			if (r() < 0.5)
				s += `<path d="M58 -10 V-74" ${O(5)}/><path d="M59 -72 L88 -63 L59 -54 Z" fill="#c8102e" ${O(4)}/>`;
			return { s: s + "</g>", bb: [-100, -90, 100, 50] };
		}

		if (TOWER_KINDS.has(k) && !t.lair && k !== "blacktower")
			return LMK.stones(tw, r);
		return LMK[k] ? LMK[k](tw, r) : { s: "", bb: [0, 0, 0, 0] };
	}

	const G1 = (k, x, y, body) =>
		`<g transform="translate(${f1(x)} ${f1(y)}) scale(${k})">${body}</g>`;
	const towerShape = (kind) =>
		kind === "spire"
			? `<path d="M-60 0 L-30 -520 L0 -700 L30 -520 L60 0 Z"/><path d="M-110 0 L-80 -220 H80 L110 0 Z"/>`
			: kind === "citadel"
				? `<path d="M-260 0 V-260 H-200 V-300 H-160 V-260 H-100 V-420 H-60 V-460 H-20 V-420 H20 V-460 H60 V-420 H100 V-260 H160 V-300 H200 V-260 H260 V0 Z"/>`
				: kind === "skull"
					? `<path d="M-220 0 Q-260 -300 -140 -420 Q0 -520 140 -420 Q260 -300 220 0 Z"/>`
					: `<path d="M-60 0 V-380 L-90 -400 V-460 H-40 V-520 L0 -560 L40 -520 V-460 H90 V-400 L60 -380 V0 Z"/>`;
	const TOWER_KINDS = new Set([
		"tower",
		"spire",
		"citadel",
		"skull",
		"blacktower",
	]);
	function tower(tw, kind, k) {
		const ey =
				kind === "citadel"
					? -380
					: kind === "skull"
						? -280
						: kind === "spire"
							? -520
							: -470,
			ex = kind === "skull" ? 70 : 18;
		let s = `<ellipse cx="0" cy="0" rx="${kind === "citadel" ? 320 : 200}" ry="70" fill="#2a1a24" opacity=".35"/><g fill="#2e2638" stroke="${INK}" stroke-width="14" stroke-linejoin="round">${towerShape(kind)}</g>`;
		s += `<g fill="none" stroke="#4a4058" stroke-width="8">${kind === "skull" ? "" : `<path d="M-30 -60 H30 M-34 -160 H34 M-40 -260 H40"/>`}</g>`;
		s += `<ellipse cx="0" cy="${ey}" rx="${kind === "skull" ? 200 : 110}" ry="70" fill="#ff3a4a" opacity=".18"/><circle cx="${-ex}" cy="${ey}" r="${kind === "skull" ? 34 : 10}" fill="#ff3a4a"/><circle cx="${ex}" cy="${ey}" r="${kind === "skull" ? 34 : 10}" fill="#ff3a4a"/>`;
		const h = { citadel: 470, skull: 520, spire: 710, tower: 570 }[kind] || 570,
			w = kind === "citadel" ? 330 : 230;
		return {
			s: `<g data-tower="${tw.id}">${G1(k, tw.x, tw.y, s)}</g>`,
			bb: [-w * k, -h * k, w * k, 80 * k],
		};
	}
	const LMK = {
		grandcapital: (tw) => {
			const O = (w) =>
				`stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
			const ring = (rx, ry, y0, w) => {
				let r = `<ellipse cx="0" cy="${y0}" rx="${rx}" ry="${ry}" fill="none" ${O(w + 10)}/><ellipse cx="0" cy="${y0}" rx="${rx}" ry="${ry}" fill="none" stroke="#c8c0ae" stroke-width="${w}"/>`;
				for (let i = 0; i < 10; i++) {
					const a = Math.PI * (0.05 + i * 0.1),
						x = Math.cos(a) * rx,
						y = y0 + Math.sin(a) * ry;
					r += `<rect x="${f1(x - 18)}" y="${f1(y - 60)}" width="36" height="64" fill="#c8c0ae" ${O(8)}/><path d="M${f1(x - 24)} ${f1(y - 60)} L${f1(x)} ${f1(y - 96)} L${f1(x + 24)} ${f1(y - 60)} Z" fill="#3a5a8a" ${O(8)}/>`;
				}
				return r;
			};
			let s = `<ellipse cx="0" cy="40" rx="560" ry="200" fill="#d8c8a0" fill-opacity=".85" ${O(10)}/>`;
			s += ring(520, 170, 20, 26).replace(
				/<rect[^>]*\/><path[^>]*\/>/g,
				(m, i) => m,
			);
			const roofs = ["#b5533c", "#3a5a8a", "#8a5a3a", "#a8743c"];
			for (let i = 0; i < 22; i++) {
				const a = (i / 22) * Math.PI * 2,
					rr = 300 + (i % 3) * 50,
					x = Math.cos(a) * rr,
					y = 10 + Math.sin(a) * rr * 0.3;
				if (y < -60) continue;
				s += A.house(f1(x), f1(y), 2.4, roofs[i % 4], "#f0e2c4");
			}
			s += ring(260, 90, -20, 22);
			s += `<path d="M-200 -40 V-210 H200 V-40 Z" fill="#e8dcc0" ${O(12)}/><path d="M-200 -210 H200" ${O(8)}/>`;
			for (const [x, r0] of [
				[-130, 60],
				[130, 60],
				[0, 100],
			])
				s += `<path d="M${x - r0} -210 Q${x - r0} ${-210 - r0 * 1.5} ${x} ${-210 - r0 * 1.9} Q${x + r0} ${-210 - r0 * 1.5} ${x + r0} -210 Z" fill="#e8b84a" ${O(12)}/><path d="M${x + r0 * 0.15} ${-210 - r0 * 1.8} Q${x + r0 * 0.9} ${-210 - r0 * 1.3} ${x + r0 * 0.85} -214" stroke="#fff0b0" stroke-width="10" fill="none" stroke-linecap="round"/>`;
			s += `<path d="M0 -400 V-560" ${O(12)}/><path d="M4 -556 L110 -526 L4 -496 Z" fill="#c8102e" ${O(10)}/><circle cx="0" cy="-408" r="18" fill="#e8b84a" ${O(8)}/>`;
			for (const x of [-150, -60, 60, 150])
				s += `<rect x="${x - 14}" y="-170" width="28" height="56" rx="14" fill="#3a3046"/>`;
			s += `<path d="M-50 -40 V-120 Q0 -170 50 -120 V-40 Z" fill="#3a3046" ${O(10)}/>`;
			return { s: G1(1, tw.x, tw.y, s), bb: [-600, -580, 600, 260] };
		},
		spire: (tw) => tower(tw, "spire", 1.1),
		citadel: (tw) => tower(tw, "citadel", 1.15),
		skull: (tw) => tower(tw, "skull", 1.0),
		tower: (tw) => tower(tw, "tower", 0.95),

		blacktower: (tw) => {
			let s = `<ellipse cx="0" cy="10" rx="300" ry="80" fill="#2a1a24" opacity=".35"/>`;
			s += `<path d="M-260 20 V-60 H-220 V-90 H-190 V-60 H-150 V-90 H-120 V-60 H120 V-90 H150 V-60 H190 V-90 H220 V-60 H260 V20 Z" fill="#4a4458" stroke="${INK}" stroke-width="14" stroke-linejoin="round"/>`;
			s += `<path d="M-80 -40 L-64 -560 L-110 -600 V-660 H-50 V-720 L0 -790 L50 -720 V-660 H110 V-600 L64 -560 L80 -40 Z" fill="#2e2638" stroke="${INK}" stroke-width="16" stroke-linejoin="round"/>`;
			s += `<path d="M-52 -200 H52 M-56 -380 H56" stroke="#4a4058" stroke-width="9"/><rect x="-14" y="-480" width="28" height="44" rx="14" fill="#ff7a3a"/><rect x="-14" y="-300" width="28" height="44" rx="14" fill="#ff7a3a" opacity=".8"/>`;
			s += `<ellipse cx="0" cy="-640" rx="120" ry="60" fill="#ff3a4a" opacity=".2"/><circle cx="-22" cy="-640" r="12" fill="#ff3a4a"/><circle cx="22" cy="-640" r="12" fill="#ff3a4a"/>`;
			return {
				s: `<g data-tower="${tw.id}">${G1(0.85, tw.x, tw.y, s)}</g>`,
				bb: [-260, -700, 260, 80],
			};
		},

		stones: (tw, r) => {
			let s = `<ellipse cx="0" cy="0" rx="230" ry="80" fill="#3a2a30" opacity=".3"/><ellipse cx="0" cy="-6" rx="70" ry="26" fill="#ff3a4a" opacity=".22"/>`;
			const st = [];
			for (let i = 0; i < 7; i++) {
				const a = (Math.PI * 2 * i) / 7 + 0.3,
					h = 70 + r() * 50;
				st.push([Math.cos(a) * 170, Math.sin(a) * 52 - 6, h]);
			}
			st.sort((a, b) => a[1] - b[1]);
			for (const [x, y, h] of st)
				s += `<path d="M${f1(x - 20)} ${f1(y)} L${f1(x - 15)} ${f1(y - h)} Q${f1(x)} ${f1(y - h - 16)} ${f1(x + 15)} ${f1(y - h)} L${f1(x + 20)} ${f1(y)} Z" fill="#8a8494" stroke="${INK}" stroke-width="9" stroke-linejoin="round"/><path d="M${f1(x - 4)} ${f1(y - h * 0.65)} l8 -10 l-8 -10" stroke="#ff4a3a" stroke-width="5" fill="none" stroke-linecap="round"/>`;
			s += `<path d="M-46 -2 V-34 H46 V-2 Z" fill="#6a6474" stroke="${INK}" stroke-width="9" stroke-linejoin="round"/><circle cx="0" cy="-46" r="12" fill="#ff3a4a"/>`;
			return { s: G1(1.1, tw.x, tw.y, s), bb: [-260, -220, 260, 100] };
		},

		fair: (tw) => {
			let s = "";
			const cols = ["#c8102e", "#e8a33a", "#6a8ac8", "#8a4ac8", "#3a9a5a"];
			[
				[-60, -10],
				[10, -30],
				[70, 0],
				[-20, 30],
				[50, 40],
			].forEach(([x, y], i) => {
				s += A.tent(x, y, cols[i]);
			});
			return { s: G1(1.4, tw.x, tw.y, s), bb: [-140, -90, 140, 80] };
		},
		worldtree: (tw) => {
			const s =
				`<path d="M-200 0 Q-120 -900 -40 -1500 L40 -1500 Q120 -900 220 0 Z" fill="#6b4a32" stroke="${INK}" stroke-width="24"/><path d="M40 -1500 Q120 -900 220 0 H60 Q40 -700 20 -1500 Z" fill="#553a26"/>` +
				`<path d="M-320 20 Q-200 -40 -60 0 M320 20 Q200 -40 60 0 M-240 30 Q-300 60 -380 40" stroke="${INK}" stroke-width="24" fill="none"/>` +
				[
					[0, -1900, 900, 560],
					[-620, -1500, 560, 380],
					[620, -1500, 560, 380],
					[-300, -2300, 600, 380],
					[380, -2300, 560, 360],
				]
					.map(
						([x, y, rx, ry]) =>
							`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#3f7a44" stroke="${INK}" stroke-width="24"/>`,
					)
					.join("") +
				[
					[0, -1950, 760, 440],
					[-640, -1540, 440, 300],
					[600, -1540, 440, 300],
					[-300, -2340, 480, 300],
					[380, -2330, 440, 280],
				]
					.map(
						([x, y, rx, ry]) =>
							`<ellipse cx="${x - 40}" cy="${y - 30}" rx="${rx}" ry="${ry}" fill="#5a9a4e"/>`,
					)
					.join("") +
				`<ellipse cx="-160" cy="-2080" rx="380" ry="190" fill="#8cc47a" opacity=".8"/>` +
				[
					[-300, -1800],
					[200, -2100],
					[400, -1600],
					[-500, -1450],
					[0, -2400],
					[600, -1900],
					[-700, -1700],
				]
					.map(
						([x, y]) =>
							`<circle cx="${x}" cy="${y}" r="44" fill="#ffe08a" stroke="${INK}" stroke-width="8"/>`,
					)
					.join("");
			return {
				s: G1(0.62, tw.x, tw.y, s),
				bb: [-1500 * 0.62, -2700 * 0.62, 1500 * 0.62, 60],
			};
		},
		volcano: (tw) => {
			A.begin();
			const r = rng(77);
			A.mountain(r, 0, 0, 30, ROCKP.doom, { single: true, allSnow: true });
			for (let i = 0; i < 6; i++)
				A.mountain(
					r,
					(r() - 0.5) * 2600,
					120 + r() * 300,
					8 + r() * 5,
					ROCKP.doom,
				);
			const o = A.take();
			o.sort((a, b) => a.y - b.y);
			let s =
				`<g fill="${INK}" stroke="${INK}" stroke-width="16" stroke-linejoin="round">${o.map((x) => x.ol).join("")}</g>${o.map((x) => x.body).join("")}`.replace(
					/<animate[^>]*\/>/g,
					"",
				);
			s += `<path d="M-60 -1700 Q-140 -1200 -260 -700 Q-300 -400 -420 -120" stroke="#2a1a1a" stroke-width="70" fill="none" stroke-linecap="round"/><path d="M-60 -1700 Q-140 -1200 -260 -700 Q-300 -400 -420 -120" stroke="#ff7a3a" stroke-width="34" fill="none" stroke-linecap="round"/><path d="M40 -1650 Q160 -1100 220 -600" stroke="#2a1a1a" stroke-width="56" fill="none" stroke-linecap="round"/><path d="M40 -1650 Q160 -1100 220 -600" stroke="#ffc94d" stroke-width="24" fill="none" stroke-linecap="round"/>`;
			s += [
				[0, -2050, 260],
				[-180, -2350, 340],
				[120, -2700, 420],
			]
				.map(
					([x, y, rr], i) =>
						`<circle cx="${x}" cy="${y}" r="${rr}" fill="#5a4a52" stroke="${INK}" stroke-width="14" opacity="${0.9 - i * 0.2}"/>`,
				)
				.join("");
			return { s: G1(0.9, tw.x, tw.y, s), bb: [-1500, -2700, 1500, 500] };
		},
		burnt: (tw, r) => {
			let c = "";
			for (let i = 0; i < 46; i++) {
				const x = (r() - 0.5) * 1200,
					y = (r() - 0.5) * 520,
					w = 60 + r() * 120,
					h = 60 + r() * 220;
				c += `<path d="M${f1(x)} ${f1(y)} v${f1(-h)} l${f1(w * 0.3)} ${f1(-20 - r() * 40)} l${f1(w * 0.3)} ${f1(30)} l${f1(w * 0.4)} -10 v${f1(h)} Z" fill="${pk(r, ["#b8ae9c", "#9a8e7e", "#c4b8a4"])}" stroke="${INK}" stroke-width="12" stroke-linejoin="round"/><rect x="${f1(x + w * 0.35)}" y="${f1(y - h * 0.6)}" width="${f1(w * 0.25)}" height="${f1(h * 0.25)}" fill="#2a2236"/>`;
			}
			for (let i = 0; i < 6; i++) {
				const x = (r() - 0.5) * 1100,
					y = -200 - r() * 200;
				c += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(70 + r() * 70)}" fill="#6a5a62" opacity=".55"/>`;
			}
			return {
				s: `<g transform="translate(${tw.x} ${tw.y})"><ellipse cx="0" cy="40" rx="760" ry="330" fill="#5a4a44" opacity=".45"/>${c}</g>`,
				bb: [-780, -560, 780, 380],
			};
		},
		pyramids: (tw) => {
			let s = "";
			for (const [x, y, k] of [
				[-500, 100, 0.6],
				[400, -80, 0.75],
				[0, 0, 1],
			])
				s += G1(
					k,
					x,
					y,
					`<path d="M-400 0 L0 -420 L400 0 Z" fill="#d8b46a" stroke="${INK}" stroke-width="16" stroke-linejoin="round"/><path d="M0 -420 L400 0 H120 Z" fill="#a8844a"/><path d="M-250 -150 H250 M-140 -270 H140" stroke="${INK}" stroke-width="6" opacity=".3"/>`,
				);
			return { s: G1(1, tw.x, tw.y, s), bb: [-760, -440, 720, 120] };
		},
		bones: (tw) => ({
			s: G1(
				1,
				tw.x,
				tw.y,
				Array.from(
					{ length: 9 },
					(_, i) =>
						`<path d="M${-500 + i * 120} 0 Q${-480 + i * 120} -260 ${-420 + i * 120} -300" stroke="${INK}" stroke-width="58" fill="none" stroke-linecap="round"/><path d="M${-500 + i * 120} 0 Q${-480 + i * 120} -260 ${-420 + i * 120} -300" stroke="#f0e6d0" stroke-width="40" fill="none" stroke-linecap="round"/>`,
				).join("") +
					`<path d="M-620 0 H520" stroke="${INK}" stroke-width="68" stroke-linecap="round"/><path d="M-620 0 H520" stroke="#f0e6d0" stroke-width="50" stroke-linecap="round"/><ellipse cx="640" cy="-60" rx="160" ry="110" fill="#f0e6d0" stroke="${INK}" stroke-width="12"/><circle cx="600" cy="-80" r="26" fill="${INK}"/>`,
			),
			bb: [-660, -330, 820, 60],
		}),
		abyss: (tw) => ({
			s: G1(
				1,
				tw.x - 700,
				tw.y,
				`<path d="M0 0 l300 -120 l200 160 l340 -200 l260 120 l420 -160 l-380 260 l-260 -60 l-320 200 l-260 -120 Z" fill="#1a0e18" stroke="${INK}" stroke-width="18" stroke-linejoin="round"/><path d="M100 -40 l1600 -220" stroke="#ff4a3a" stroke-width="30" opacity=".6"/><path d="M60 0 l300 -110 l200 150 l340 -190 l260 110" stroke="#ff7a3a" stroke-width="10" fill="none" stroke-opacity=".7"/>`,
			),
			bb: [-700, -340, 900, 220],
		}),
	};

	const EXTRA = [];

	function gateSideSvg() {
		const O = (w) =>
			`stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
		const ST = "#c8c0ae",
			SD = "#a8a090",
			ROOF = "#6a4a5a";
		let s = "";

		const wall = (y0, y1) => {
			let w = `<path d="M-34 ${y0} H34 V${y1} H-34 Z" fill="${ST}"/><path d="M12 ${y0} H34 V${y1} H12 Z" fill="${SD}"/><path d="M-34 ${y0} H34 V${y1} H-34 Z" fill="none" ${O(10)}/>`;
			for (let y = y0 + 10; y < y1 - 22; y += 36)
				w += `<rect x="-50" y="${y}" width="16" height="22" fill="${ST}" ${O(7)}/><rect x="34" y="${y}" width="16" height="22" fill="${SD}" ${O(7)}/>`;
			for (let y = y0 + 28; y < y1; y += 36)
				w += `<path d="M-30 ${y} H30" stroke="${INK}" stroke-width="4" stroke-opacity=".25"/>`;
			return w;
		};
		const tower = (cy, r, h, flag) => {
			let t = `<path d="M${-r} ${cy} V${cy - h} H${r} V${cy} Z" fill="${ST}"/><path d="M${r * 0.2} ${cy} V${cy - h} H${r} V${cy} Z" fill="${SD}"/><path d="M${-r} ${cy} V${cy - h} H${r} V${cy} Z" fill="none" ${O(11)}/>`;
			t += `<path d="M${-r - 12} ${cy - h} L0 ${cy - h - r * 1.5} L${r + 12} ${cy - h} Z" fill="${ROOF}" ${O(11)}/><rect x="-10" y="${cy - h * 0.72}" width="20" height="30" rx="10" fill="#3a3046"/>`;
			if (flag)
				t += `<path d="M0 ${cy - h - r * 1.5} V${cy - h - r * 1.5 - 56}" ${O(8)}/><path d="M2 ${cy - h - r * 1.5 - 54} L50 ${cy - h - r * 1.5 - 38} L2 ${cy - h - r * 1.5 - 22} Z" fill="#c8102e" ${O(7)}/>`;
			return t;
		};
		s += tower(-200, 42, 100, true);
		s += wall(-205, 255);

		s += `<path d="M-84 50 V-60 H84 V50 Z" fill="${ST}"/><path d="M30 50 V-60 H84 V50 Z" fill="${SD}"/><path d="M-84 50 V-60 H84 V50 Z" fill="none" ${O(11)}/>`;
		for (let x = -84; x < 80; x += 28)
			s += `<rect x="${x}" y="-82" width="17" height="22" fill="${x < 30 ? ST : SD}" ${O(8)}/>`;
		s += `<path d="M-170 44 Q-130 40 -84 40 V6 Q-130 6 -170 2 Z M170 44 Q130 40 84 40 V6 Q130 6 170 2 Z" fill="#c8a870" ${O(5)}/><path d="M-160 24 H-96 M96 24 H160" stroke="${INK}" stroke-width="4" stroke-dasharray="6 14" stroke-opacity=".5"/>`;
		s += `<path d="M-84 40 V-8 Q-84 -30 -64 -30 H64 Q84 -30 84 -8 V40 Z" fill="#2a2236" fill-opacity=".85"/><path d="M-84 40 V6 H84 V40 Z" fill="#c8a870" fill-opacity=".55"/>`;
		for (const sd of [-1, 1])
			s += `<path d="M${sd * 84} 40 V-8 Q${sd * 84} -30 ${sd * 64} -30" fill="none" ${O(9)}/><path d="M${sd * 90} -22 V40 M${sd * 78} -28 V40 M${sd * 96} 0 H${sd * 72} M${sd * 96} 22 H${sd * 72}" stroke="#9a8a6a" stroke-width="5"/>`;
		s += `<path d="M-92 -60 H92 V-50 H-92 Z" fill="${ST}" ${O(7)}/>`;
		s += tower(260, 44, 90, false);
		return { s, bb: [-180, -420, 180, 280] };
	}
	function gateSvg(vert) {
		if (vert) return gateSideSvg();
		const O = (w) =>
			`stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
		let s = `<ellipse cx="0" cy="8" rx="300" ry="60" fill="#2a1a24" fill-opacity=".3"/>`;
		if (!vert)
			for (const sd of [-1, 1]) {
				const x0 = sd * 110,
					x1 = sd * 280;
				s += `<path d="M${x0} 0 V-90 H${x1} V0 Z" fill="#b8b0a0" ${O(10)}/>`;
				for (let x = Math.min(x0, x1); x < Math.max(x0, x1) - 10; x += 34)
					s += `<rect x="${x + 4}" y="-112" width="20" height="24" fill="#b8b0a0" ${O(8)}/>`;
				s += `<path d="M${x0} -45 H${x1} M${x0} -20 H${x1}" stroke="${INK}" stroke-width="4" stroke-opacity=".3"/>`;
			}
		for (const sd of [-1, 1]) {
			const cx = sd * 92;
			s += `<rect x="${cx - 42}" y="-230" width="84" height="230" fill="#c8c0ae" ${O(11)}/><path d="M${cx + 4} -230 H${cx + 42} V0 H${cx + 4} Z" fill="#a8a090"/>`;
			s += `<path d="M${cx - 54} -230 L${cx} -320 L${cx + 54} -230 Z" fill="#6a4a5a" ${O(11)}/><path d="M${cx} -320 V-380" ${O(8)}/><path d="M${cx + 2} -378 L${cx + 52} -362 L${cx + 2} -346 Z" fill="#c8102e" ${O(7)}/>`;
			s += `<rect x="${cx - 12}" y="-180" width="24" height="40" rx="12" fill="#3a3046"/><rect x="${cx - 12}" y="-100" width="24" height="34" rx="12" fill="#3a3046"/>`;
		}
		s += `<path d="M-50 0 V-150 H50 V0 Z" fill="#b8b0a0" ${O(11)}/><path d="M-34 0 V-96 Q0 -138 34 -96 V0 Z" fill="#3a3046" ${O(8)}/>`;
		s += `<path d="M-26 -100 V0 M-9 -116 V0 M9 -116 V0 M26 -100 V0 M-34 -70 H34 M-34 -40 H34 M-34 -12 H34" stroke="#9a8a6a" stroke-width="6"/>`;
		s += `<path d="M-60 -150 H60 V-176 H-60 Z" fill="#c8c0ae" ${O(9)}/>`;
		return { s, bb: vert ? [-150, -390, 150, 70] : [-300, -390, 300, 70] };
	}
	function extras() {
		EXTRA.length = 0;
		const add = (x, y, bb, s, k) =>
			EXTRA.push({
				x,
				y,
				bb: [x + bb[0], y + bb[1], x + bb[2], y + bb[3]],
				s,
				k,
			});
		for (const gt of W.gates || []) {
			const g0 = gateSvg(gt.vert);
			add(gt.x, gt.y, g0.bb, G1(1, gt.x, gt.y, g0.s));
		}
		for (const [x, y, k] of [
			[17200, 600, 1],
			[16400, 300, 0.6],
			[18100, 1000, 0.7],
		])
			add(
				x,
				y,
				[-380 * k, -80 * k, 380 * k, 440 * k],
				G1(
					k,
					x,
					y,
					`<path d="M-360 0 Q0 -60 360 0 L180 120 L60 420 L-80 160 L-220 90 Z" fill="#8a7e98" stroke="${INK}" stroke-width="16" stroke-linejoin="round"/><path d="M-360 0 Q0 -60 360 0 Q0 40 -360 0" fill="#9ab06a" stroke="${INK}" stroke-width="12"/><path d="M-120 -16 l-10 -60 l20 0 Z M140 -20 l-8 -46 l16 0 Z" fill="#3f7a44" stroke="${INK}" stroke-width="8"/>`,
				),
			);
		add(
			700,
			9000,
			[-560, -320, 520, 60],
			G1(
				1,
				700,
				9000,
				`<path d="M-500 0 q100 -260 200 0 q100 -260 200 0 q100 -260 200 0" stroke="${INK}" stroke-width="100" fill="none" stroke-linecap="round"/><path d="M-500 0 q100 -260 200 0 q100 -260 200 0 q100 -260 200 0" stroke="#3a7a6a" stroke-width="76" fill="none" stroke-linecap="round"/><circle cx="160" cy="-120" r="18" fill="#ffd27a"/>`,
			),
		);
		add(
			8000,
			11200,
			[-500, -300, 500, 300],
			G1(
				1,
				8000,
				11200,
				Array.from(
					{ length: 5 },
					(_, i) =>
						`<ellipse rx="${80 + i * 80}" ry="${40 + i * 40}" fill="none" stroke="#b4cee0" stroke-width="20" opacity="${0.9 - i * 0.15}" transform="rotate(${i * 25})"/>`,
				).join(""),
			),
		);
	}

	const GS = 1 / 16;
	function groundSvg() {
		const vb = W.vb,
			w = Math.round(vb[2] * GS),
			h = Math.round(vb[3] * GS),
			L = 0;
		const cd = W.chains
				.filter((c) => c.coast)
				.map((c) => c.dL[L])
				.join(""),
			id = W.isles.map((i) => lineD(i.p) + "Z").join("");
		const fills = W.T.map(
			(t) =>
				`<path d="${t.dL[L]}" fill="${GROUND[t.biome]}" stroke="${GROUND[t.biome]}" stroke-width="40" fill-rule="evenodd"/>`,
		).join("");
		const s =
			`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${vb.join(" ")}"><rect x="${vb[0]}" y="${vb[1]}" width="${vb[2]}" height="${vb[3]}" fill="${OCEAN}"/>` +
			`<path d="${cd}${id}" fill="none" stroke="#87a9c2" stroke-width="440" stroke-linejoin="round" stroke-opacity=".55"/><path d="${cd}${id}" fill="none" stroke="#a6c4d6" stroke-width="180" stroke-linejoin="round" stroke-opacity=".7"/>` +
			`<path d="${id}" fill="${GROUND.coast}"/>` +
			fills +
			`<clipPath id="gl">${W.T.map((t) => `<path d="${t.dL[L]}" fill-rule="evenodd"/>`).join("")}</clipPath><filter id="gb" filterUnits="userSpaceOnUse" x="${vb[0]}" y="${vb[1]}" width="${vb[2]}" height="${vb[3]}"><feGaussianBlur stdDeviation="260"/></filter>` +
			`<g clip-path="url(#gl)"><g filter="url(#gb)">${fills}</g></g></svg>`;
		return { svg: s, w, h, vb };
	}

	const pathOf = (o, L, d) =>
		(o.pp || (o.pp = []))[L] ||
		(o.pp[L] = new Path2D(typeof d === "function" ? d() : d));
	function paintBase(g, L, bb) {
		const iw = INKW[L],
			pad = 200,
			big = [bb[0] - pad, bb[1] - pad, bb[2] + pad, bb[3] + pad];
		for (const c of W.chains)
			if (c.coast && hit(c.bb, big))
				stroke(g, pathOf(c, L, c.dL[L]), "#e2d39a", Math.max(64, iw * 3.6));
		for (const i of W.isles)
			if (hit(i.bb, big)) {
				const q = pathOf(i, 0, lineD(i.p) + "Z");
				stroke(g, q, "#e2d39a", Math.max(64, iw * 3.6));
				fill(g, q, GROUND.coast);
				stroke(g, q, INK, iw * 1.2);
			}
	}
	function paintLines(g, L, bb) {
		const iw = INKW[L],
			big = [bb[0] - 50, bb[1] - 50, bb[2] + 50, bb[3] + 50];
		for (const c of W.chains)
			if (c.coast && hit(c.bb, big))
				stroke(g, pathOf(c, L, c.dL[L]), INK, iw * 1.3);

		for (const a of W.arcs || [])
			if (hit(a.bb, bb)) {
				const q = pathOf(a, 0, a.d);
				stroke(g, q, "#9a9284", 520, 0.35);
				stroke(g, q, "#857c80", 300, 0.45);
			}

		for (const R of W.rivers) {
			if (!hit(R.bb, bb)) continue;
			if (!R.poly) {
				const n = R.p.length,
					Lft = [],
					Rgt = [];
				for (let i = 0; i < n; i++) {
					const a = R.p[Math.max(0, i - 1)],
						b = R.p[Math.min(n - 1, i + 1)],
						dx = b[0] - a[0],
						dy = b[1] - a[1],
						len = Math.hypot(dx, dy) || 1,
						w = (R.w[0] + ((R.w[1] - R.w[0]) * i) / (n - 1)) / 2;
					Lft.push([R.p[i][0] - (dy / len) * w, R.p[i][1] + (dx / len) * w]);
					Rgt.push([R.p[i][0] + (dy / len) * w, R.p[i][1] - (dx / len) * w]);
				}
				R.poly = new Path2D(
					"M" +
						[...Lft, ...Rgt.reverse()]
							.map(([x, y]) => `${f1(x)} ${f1(y)}`)
							.join("L") +
						"Z",
				);
				R.mid = new Path2D(lineD(R.p.map(([x, y]) => [f1(x), f1(y)])));
			}
			fill(g, R.poly, "#c8b878", 0.7);
			stroke(g, R.poly, "#c8b878", Math.max(24, iw * 4), 0.7);
			fill(g, R.poly, A.WATER.b);
			stroke(g, R.poly, INK, iw);
			if (L >= 1) {
				stroke(g, R.mid, A.WATER.d, R.w[0] * 0.35, 0.45);
				g.setLineDash([iw * 5, iw * 12]);
				stroke(g, R.mid, A.WATER.l, iw, 0.9);
				g.setLineDash([]);
			}
		}

		if (L >= 1)
			for (const R of W.roads) {
				if (!hit(R.bb, bb)) continue;
				const q = R.pp || (R.pp = new Path2D(smooth(R.p))),
					w = (R.main ? 1.5 : 1.1) * Math.max(iw * 2.4, 7);
				stroke(g, q, "#c8a870", w, 0.9);
				g.setLineDash([iw * 1.2, iw * 4.5]);
				stroke(g, q, INK, iw * 0.8, 0.6);
				g.setLineDash([]);
			}
	}

	const tileSize = (L) => TS / LV[L];
	const tileCount = (L) => [
		Math.ceil(W.vb[2] / tileSize(L)),
		Math.ceil(W.vb[3] / tileSize(L)),
	];

	function tileSel(L, tx, ty) {
		const sz = tileSize(L),
			x0 = W.vb[0] + tx * sz,
			y0 = W.vb[1] + ty * sz,
			bb = [x0, y0, x0 + sz, y0 + sz];
		const M = L <= 1 ? 1600 : 900;
		const groups = [],
			ground = [];
		for (let l = 0; l <= L; l++) {
			for (
				let ci = Math.floor((bb[0] - M) / CH);
				ci <= Math.floor((bb[2] + M) / CH);
				ci++
			)
				for (
					let cj = Math.floor((bb[1] - M) / CH);
					cj <= Math.floor((bb[3] + M * 1.6) / CH);
					cj++
				) {
					const c = chunk(l, ci, cj);
					for (const g of c.groups)
						if (L - l <= (VIS[g.kind] ?? 9) && hit(g.bb, bb)) groups.push(g);
					for (const g of c.ground)
						if (L - l <= (VIS[g.kind] ?? 2) && hit(g.bb, bb)) ground.push(g);
				}
		}
		groups.sort((a, b) => a.key - b.key);
		return { L, sz, x0, y0, bb, groups, ground };
	}
	const head = (x0, y0, sz) =>
		`<svg xmlns="http://www.w3.org/2000/svg" width="${TS}" height="${TS}" viewBox="${x0} ${y0} ${sz} ${sz}">`;

	function tileParts(L, tx, ty) {
		const { sz, x0, y0, bb, groups, ground } = tileSel(L, tx, ty);
		const ops = [["p", (g) => paintBase(g, L, bb)]],
			raw = [];
		for (const it of ground)
			ops.push(
				it.st ? ["s", it.st[0], it.st[1], it.st[2], it.st[3], 0] : ["p", it.p],
			);
		ops.push(["p", (g) => paintLines(g, L, bb)]);
		for (const g of groups) {
			if (!g.m) {
				raw.push(typeof g.s === "function" ? g.s(L) : g.s);
				continue;
			}
			if (g.kind === "site") {
				const x = g.m[0];
				ops.push(["s", x.t, x.x, x.y, SITEK[L], 0]);
				continue;
			}
			for (const x of g.m) ops.push(["s", x.t, x.x, x.y, x.k, 1]);
			for (const x of g.m) ops.push(["s", x.t, x.x, x.y, x.k, 0]);
		}
		return {
			x0,
			y0,
			sz,
			L,
			ops,
			sites: raw.length ? head(x0, y0, sz) + raw.join("") + "</svg>" : null,
			n: groups.length,
		};
	}

	function atlas(list, sc) {
		const pad = Math.ceil(3 * sc) + 2,
			cells = new Map(),
			parts = [];
		let x = 0,
			y = 0,
			rowH = 0,
			W0 = 0;
		for (const t of list)
			for (const ol of t.ol ? [1, 0] : [0]) {
				const w = Math.ceil((t.bb[2] - t.bb[0]) * sc) + pad * 2,
					h = Math.ceil((t.bb[3] - t.bb[1]) * sc) + pad * 2;
				if (x + w > 2048) {
					x = 0;
					y += rowH;
					rowH = 0;
				}
				const ox = -t.bb[0] * sc + pad,
					oy = -t.bb[1] * sc + pad;
				cells.set(t.id + (ol ? "o" : "b"), [x, y, w, h, ox, oy]);
				parts.push(
					`<g transform="translate(${f1(x + ox)} ${f1(y + oy)}) scale(${sc})">${ol ? `<g fill="${INK}" stroke="${INK}" stroke-width="5.2" stroke-linejoin="round" stroke-linecap="round">${t.ol}</g>` : t.body}</g>`,
				);
				x += w;
				rowH = Math.max(rowH, h);
				W0 = Math.max(W0, x);
			}
		const H0 = y + rowH;
		return {
			svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${W0}" height="${H0}" viewBox="0 0 ${W0} ${H0}">${parts.join("")}</svg>`,
			w: W0,
			h: H0,
			cells,
		};
	}

	const FLAG = {
		w: 64,
		h: 92,
		foot: [12, 88],
		pole: "M10.2 10 L13.8 10 L13.8 88 L10.2 88 Z",
		cloth:
			"M13.8 13 C22 9.5 30 16.5 39 13.5 C45 11.5 51 11 60 13 L53.5 27 L60 41 C51 39 45 39.5 39 41.5 C30 44.5 22 37.5 13.8 41 Z",
		fold: "M13.8 28.5 C22 25 30 31.5 39 28.5 C45 26.5 50 26.5 54.5 27.5 L53.6 29.6 C49 28.8 45 29 39 31 C30 34 22 27.8 13.8 31.4 Z",
		shine: "M16.5 16.5 C24 13.8 30 19 38 16.6",
		shield:
			"M26.5 19.5 L36.5 19.5 L36.5 26 C36.5 30.5 33.5 33 31.5 34.2 C29.5 33 26.5 30.5 26.5 26 Z",
		sword: "M31.5 21.3 L31.5 31.2 M29 24.6 L34 24.6",
	};
	const shade = (hex, k) => {
		const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || ""));
		if (!m) return "#7a0a1c";
		const n = parseInt(m[1], 16),
			f = (v) => Math.max(0, Math.min(255, Math.round(v * k)));
		return (
			"#" +
			[n >> 16, (n >> 8) & 255, n & 255]
				.map((v) => f(v).toString(16).padStart(2, "0"))
				.join("")
		);
	};
	const flagColor = (c) =>
		/^#[0-9a-f]{6}$/i.test(String(c || "")) ? c : "#c8102e";

	function flagSvg(color, o = {}) {
		const c = flagColor(color),
			F = FLAG,
			h = o.h || 92,
			w = (h * F.w) / F.h;
		return (
			`<svg class="${o.svgCls || "qwf"}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" viewBox="0 0 ${F.w} ${F.h}" aria-hidden="true">` +
			`<ellipse cx="${F.foot[0] + 3}" cy="${F.foot[1]}" rx="12" ry="3.6" fill="rgba(42,34,54,.38)"/>` +
			`<path d="${F.pole}" fill="#6b4a2b" stroke="#2a2236" stroke-width="1.6" stroke-linejoin="round"/>` +
			`<path d="M11.2 12 L11.2 86" stroke="rgba(255,236,190,.45)" stroke-width="1"/>` +
			`<circle cx="12" cy="8.6" r="4.2" fill="#e8b84a" stroke="#2a2236" stroke-width="1.6"/><circle cx="10.8" cy="7.4" r="1.2" fill="#fff4c8"/>` +
			`<g class="${o.cls || ""}" style="transform-origin:14px 27px">` +
			`<path d="${F.cloth}" fill="${c}" stroke="#2a2236" stroke-width="2" stroke-linejoin="round"/>` +
			`<path d="${F.fold}" fill="${shade(c, 0.62)}" opacity=".55"/>` +
			`<path d="${F.shine}" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="1.8" stroke-linecap="round"/>` +
			`<path d="${F.shield}" fill="#f6e7c8" stroke="#2a2236" stroke-width="1.4" stroke-linejoin="round"/>` +
			`<path d="${F.sword}" stroke="${shade(c, 0.8)}" stroke-width="1.8" stroke-linecap="round"/>` +
			"</g></svg>"
		);
	}

	let FP = null;
	function flagDraw(g, x, y, h, color) {
		const F = FLAG,
			k = (h || 64) / F.h,
			c = flagColor(color);
		if (!FP)
			FP = Object.fromEntries(
				["pole", "cloth", "fold", "shine", "shield", "sword"].map((n) => [
					n,
					new Path2D(F[n]),
				]),
			);
		g.save();
		g.translate(x - F.foot[0] * k, y - F.foot[1] * k);
		g.scale(k, k);
		g.lineJoin = "round";
		g.lineCap = "round";
		g.fillStyle = "rgba(42,34,54,.38)";
		g.beginPath();
		g.ellipse(F.foot[0] + 3, F.foot[1], 12, 3.6, 0, 0, Math.PI * 2);
		g.fill();
		g.strokeStyle = "#2a2236";
		g.lineWidth = 1.6;
		g.fillStyle = "#6b4a2b";
		g.fill(FP.pole);
		g.stroke(FP.pole);
		g.fillStyle = "#e8b84a";
		g.beginPath();
		g.arc(12, 8.6, 4.2, 0, Math.PI * 2);
		g.fill();
		g.stroke();
		g.fillStyle = c;
		g.lineWidth = 2;
		g.fill(FP.cloth);
		g.stroke(FP.cloth);
		g.globalAlpha = 0.55;
		g.fillStyle = shade(c, 0.62);
		g.fill(FP.fold);
		g.globalAlpha = 1;
		g.strokeStyle = "rgba(255,255,255,.5)";
		g.lineWidth = 1.8;
		g.stroke(FP.shine);
		g.fillStyle = "#f6e7c8";
		g.strokeStyle = "#2a2236";
		g.lineWidth = 1.4;
		g.fill(FP.shield);
		g.stroke(FP.shield);
		g.strokeStyle = shade(c, 0.8);
		g.lineWidth = 1.8;
		g.stroke(FP.sword);
		g.restore();
	}
	function init(D) {
		if (W && W.D === D) return W;
		W = prep(D);
		extras();
		CHUNKS.clear();
		return W;
	}

	const COVER = {
		worldtree: {
			k: 0.62,
			e: [
				[0, -1900, 912, 572],
				[-620, -1500, 572, 392],
				[620, -1500, 572, 392],
				[-300, -2300, 612, 392],
				[380, -2300, 572, 372],
			],
			d: ["M-212 6 Q-130 -900 -48 -1512 L48 -1512 Q130 -900 232 6 Z"],
		},
	};
	const covers = () =>
		(W ? W.towns : [])
			.filter((tw) => COVER[tw.kind])
			.map((tw) => ({ x: tw.x, y: tw.y, ...COVER[tw.kind] }));
	return {
		init,
		tileParts,
		covers,
		atlas,
		groundSvg,
		FLAG,
		flagSvg,
		flagDraw,
		flagColor,
		SITEK,
		TOWER_KINDS,
		GATE_H: 390,
		GS,
		tileSize,
		tileCount,
		LV,
		TS,
		INKW,
		GROUND,
		OCEAN,
		get W() {
			return W;
		},
	};
})();
