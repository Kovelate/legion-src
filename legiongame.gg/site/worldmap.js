window.LGWorld = (() => {
	const NS = "http://www.w3.org/2000/svg";
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
	const OCEAN = "#6a8daa",
		INK = "#2a2236",
		PAPER = "#f6ecd2";
	const DANGER_RU = [
		"",
		"спокойно",
		"неспокойно",
		"опасно",
		"очень опасно",
		"смертельно",
	];
	const KIND_RU = {
		village: "деревня",
		settle: "посёлок",
		capital: "столица региона",
		grand: "главный город мира",
		fair: "город",
		special: "особое место",
	};
	const WHY_RU = {
		home: "город вашего края — вход открыт",
		left: "отряд стоял здесь, когда ты ушёл — вход открыт",
		owned: "город вашего канала — вход открыт",
		party: "отряд здесь, идёт эфир — вход участникам отряда",
		tester: "тестерам открыты все города",
	};
	const REFRESH_MS = 60000;
	const Z2 = 0.055,
		Z3 = 0.16;

	const CENTER = 0.75;
	let X = null,
		root = null,
		G = null,
		D = null,
		Dkey = "",
		geoP = null,
		S = null,
		timer = 0,
		vis = false,
		loading = null,
		stillRO = null;

	const esc = window.LGSiteUi.esc;
	const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
	const now = () => (X && X.now ? X.now() : Date.now());
	const leftRu = (ms) => {
		const m = Math.max(1, Math.ceil(ms / 60000)),
			d = Math.floor(m / 1440),
			h = Math.floor((m % 1440) / 60),
			mm = m % 60;
		return d ? `${d} д ${h} ч` : h ? `${h} ч ${mm} мин` : `${mm} мин`;
	};
	const dateRu = (t) => {
		try {
			return new Date(t)
				.toLocaleDateString("ru-RU", { day: "numeric", month: "short" })
				.replace(".", "");
		} catch (e) {
			return "";
		}
	};
	const stars = (n) => "★".repeat(n) + "☆".repeat(Math.max(0, 5 - n));
	const hash = (s) => {
		let h = 2166136261;
		for (const c of String(s)) {
			h ^= c.codePointAt(0);
			h = Math.imul(h, 16777619);
		}
		return h >>> 0;
	};

	const DEF_COL = "#5a5a6a",
		COL_RE = /^#[0-9a-f]{3,8}$/i;
	const ownerOf = (d, id) => {
		const s = d && d.t && d.t[id];
		if (!s || s.o == null) return null;
		const c = d.ch[s.o] || [];
		const ch = String(c[0] || "?");
		return {
			ch,
			color: COL_RE.test(String(c[1] || "")) ? c[1] : DEF_COL,
			mine: ch === d.me,
		};
	};

	function squadsBy(d) {
		const out = {};
		if (!d || !Array.isArray(d.sq)) return out;
		for (const r of d.sq) {
			if (!Array.isArray(r) || !G.byId.get(r[1])) continue;
			const ch = String(r[0] || "");
			(out[r[1]] = out[r[1]] || [])[ch === d.me ? "unshift" : "push"]({
				ch,
				color: COL_RE.test(String(r[2] || "")) ? r[2] : DEF_COL,
				mine: ch === d.me,
			});
		}
		return out;
	}
	const kindOf = (t) => {
		const k = t.tw && t.tw.k;
		if (!k) return null;
		if (k === "fair") return "fair";
		if (k === "grandcapital") return "grand";
		if (k === "capital") return "capital";
		if (k === "town") return t.d >= 2 ? "settle" : "village";
		return "special";
	};

	const pairs = (f) => {
		const o = [];
		for (let i = 0; i + 1 < f.length; i += 2) o.push([f[i], f[i + 1]]);
		return o;
	};
	const lineD = (p) => "M" + p.map(([x, y]) => x + " " + y).join("L");
	function pip(rs, x, y) {
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
	function prep(g) {
		const chains = g.chains.map((c) => ({ l: c.l, r: c.r, p: pairs(c.p) }));
		const T = g.t.map((t) => {
			const poly = t.rings.map((ring) => {
				const o = [];
				for (const ref of ring) {
					const c = chains[ref >= 0 ? ref : ~ref],
						p = ref >= 0 ? c.p : c.p.slice().reverse();
					for (let i = o.length ? 1 : 0; i < p.length; i++) o.push(p[i]);
				}
				return o;
			});
			let a = 1e9,
				b = 1e9,
				c = -1e9,
				d = -1e9;
			for (const r of poly)
				for (const [x, y] of r) {
					if (x < a) a = x;
					if (y < b) b = y;
					if (x > c) c = x;
					if (y > d) d = y;
				}
			return {
				...t,
				poly,
				bb: [a, b, c, d],
				dd: poly.map((r) => lineD(r) + "Z").join(""),
			};
		});
		const byId = new Map(T.map((t) => [t.id, t])),
			R = new Map(g.regions.map((r) => [r.id, r]));
		let a = 1e9,
			b = 1e9,
			c = -1e9,
			d = -1e9;
		for (const t of T) {
			a = Math.min(a, t.bb[0]);
			b = Math.min(b, t.bb[1]);
			c = Math.max(c, t.bb[2]);
			d = Math.max(d, t.bb[3]);
		}
		return { g, T, byId, R, chains, land: [a, b, c, d] };
	}

	const GLYPH = {
		meadow:
			'<path d="M-40 30 Q-34 -10 -26 -36 M0 30 Q2 -20 6 -50 M40 30 Q34 -6 26 -32" stroke="#93a65e" stroke-width="12" fill="none" stroke-linecap="round"/>',
		forest:
			'<rect x="-9" y="10" width="18" height="40" fill="#6d5a3c"/><circle cx="0" cy="-12" r="44" fill="#7f9a52"/><circle cx="-14" cy="-24" r="16" fill="#97b066"/>',
		taiga:
			'<rect x="-7" y="30" width="14" height="24" fill="#5e4a32"/><path d="M0 -70 L40 34 L-40 34 Z" fill="#5f7d56"/><path d="M0 -70 L14 -34 L-6 -30 Z" fill="#7a9870"/>',
		ice: '<path d="M-70 40 L-24 -26 L0 4 L28 -44 L80 40 Z" fill="#c6d2e2"/><path d="M28 -44 L44 -18 L24 -10 Z M-24 -26 L-12 -8 L-30 -6 Z" fill="#fff"/>',
		mount:
			'<path d="M-90 50 L-20 -70 L20 -10 L44 -44 L100 50 Z" fill="#958e7a"/><path d="M-20 -70 L-2 -40 L-20 -32 L-34 -46 Z" fill="#f2f0ea"/>',
		swamp:
			'<path d="M-50 30 L-46 -30 M-20 30 L-16 -44 M10 30 L14 -24 M-70 34 Q-10 20 60 34" stroke="#66744a" stroke-width="10" fill="none" stroke-linecap="round"/><ellipse cx="34" cy="-30" rx="10" ry="18" fill="#6a5338"/>',
		desert:
			'<path d="M-80 30 Q-30 -30 20 30 M0 10 Q40 -26 84 22" stroke="#c4a364" stroke-width="12" fill="none" stroke-linecap="round"/>',
		ash: '<path d="M-60 -20 L-20 0 L-34 30 L10 16 L40 40 M-20 0 L20 -30 L60 -24" stroke="#5a4248" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
		coast:
			'<path d="M-60 0 Q-40 -18 -20 0 Q0 18 20 0 Q40 -18 60 0" stroke="#b9b276" stroke-width="10" fill="none" stroke-linecap="round"/>',
		ruin: '<rect x="-50" y="-10" width="22" height="50" fill="#8a7c66"/><rect x="0" y="-40" width="22" height="80" fill="#8a7c66"/><path d="M0 -40 L22 -40 L22 -26 L12 -32 Z" fill="#a0927a"/><rect x="-60" y="36" width="96" height="10" fill="#7a6c58"/>',
		blight:
			'<path d="M0 50 L0 -10 L-30 -50 M0 -10 L26 -44 M0 10 L-24 -6 M0 6 L22 -6" stroke="#4e4256" stroke-width="10" fill="none" stroke-linecap="round"/>',
	};
	function glyphSpots(W) {
		const out = [],
			STEP = 400;
		for (const t of W.T) {
			if (t.gate || t.lair) continue;
			const [a, b, c, d] = t.bb,
				h = hash(t.id);
			for (let y = Math.ceil(b / STEP) * STEP; y < d; y += STEP)
				for (let x = Math.ceil(a / STEP) * STEP; x < c; x += STEP) {
					const k = hash(t.id + ":" + x + ":" + y),
						jx = x + ((k % 200) - 100),
						jy = y + (((k >> 8) % 200) - 100);
					if (((k >> 16) & 7) === 0) continue;
					if (!pip(t.poly, jx, jy)) continue;
					if (Math.hypot(jx - t.c[0], jy - t.c[1]) < 420) continue;
					if (t.tw && Math.hypot(jx - t.tw.x, jy - t.tw.y) < 260) continue;

					if (!pip(t.poly, jx + 70, jy) || !pip(t.poly, jx - 70, jy)) continue;
					out.push([t.b, jx, jy, 0.8 + ((k >> 20) % 5) / 10 + (h % 3) / 20]);
				}
		}
		return out;
	}

	const icon = (x, y, body, cls = "") =>
		`<g class="ic ${cls}" style="transform:translate(${x}px,${y}px) scale(var(--ui))">${body}</g>`;
	const ICON = {
		lock: '<g transform="translate(9 -9)"><rect x="-6" y="-2" width="12" height="10" rx="2" fill="#2a2236"/><path d="M-3.5 -2v-3a3.5 3.5 0 0 1 7 0v3" stroke="#2a2236" stroke-width="2" fill="none"/><circle cx="0" cy="3" r="1.6" fill="#ffd76a"/></g>',
		tower:
			'<path d="M-6 9 L-5 -6 L-8 -6 L-8 -11 L-4 -11 L-4 -8 L-1 -8 L-1 -11 L1 -11 L1 -8 L4 -8 L4 -11 L8 -11 L8 -6 L5 -6 L6 9 Z" fill="#3a2f46" stroke="#f6ecd2" stroke-width="1.4" stroke-linejoin="round"/><rect x="-1.5" y="-2" width="3" height="5" fill="#e0a83a"/>',
		gate: '<path d="M-10 9 L-10 -5 Q0 -14 10 -5 L10 9 L5 9 L5 -1 Q0 -6 -5 -1 L-5 9 Z" fill="#6a5a48" stroke="#f6ecd2" stroke-width="1.4" stroke-linejoin="round"/>',
		flag: '<path d="M-1 10 L-1 -14" stroke="#2a2236" stroke-width="2.4" stroke-linecap="round"/><path d="M0 -14 L14 -9 L0 -4 Z" fill="#c8102e" stroke="#2a2236" stroke-width="1.4" stroke-linejoin="round"/><circle cx="-1" cy="10" r="3" fill="#2a2236"/>',
		swords:
			'<circle r="9" fill="#8a1a2a" stroke="#2a2236" stroke-width="2"/><path d="M-4.5 -4.5 L4 4 M4.5 -4.5 L-4 4 M1.2 4.5 L4.5 1.2 M-1.2 4.5 L-4.5 1.2" stroke="#fff4cc" stroke-width="1.8" stroke-linecap="round"/>',
		restless:
			'<circle r="6" fill="#8a1a2a" stroke="#fff4cc" stroke-width="1.4"/><path d="M0 -3.2 L0 0.8" stroke="#fff4cc" stroke-width="2" stroke-linecap="round"/><circle cy="3.1" r="1.05" fill="#fff4cc"/>',
	};
	const townMark = (t) => {
		const k = t.tw.k;
		if (k === "grandcapital")
			return '<circle r="9" fill="#f6ecd2" stroke="#2a2236" stroke-width="2"/><circle r="5" fill="#c9932e" stroke="#2a2236" stroke-width="1.5"/>';
		if (k === "capital")
			return '<circle r="6.5" fill="#f6ecd2" stroke="#2a2236" stroke-width="2"/><circle r="2.6" fill="#2a2236"/>';
		if (k === "town" || k === "fair")
			return '<rect x="-3.5" y="-3.5" width="7" height="7" rx="1" fill="#f6ecd2" stroke="#2a2236" stroke-width="1.6"/>';
		if (
			k === "gate" ||
			k === "tower" ||
			k === "spire" ||
			k === "citadel" ||
			k === "skull" ||
			k === "bastion" ||
			k === "blacktower"
		)
			return "";
		return '<path d="M0 -5 L5 0 L0 5 L-5 0 Z" fill="#8a1a2a" stroke="#f6ecd2" stroke-width="1.4"/>';
	};

	function baseSvg(W) {
		const g = W.g,
			vb = g.vb;
		const coast = W.chains
			.filter((c) => c.l == null || c.r == null)
			.map((c) => lineD(c.p))
			.join("");
		const isles = g.isles.map((f) => lineD(pairs(f)) + "Z").join("");
		const regionB = W.chains
			.filter(
				(c) =>
					c.l != null && c.r != null && W.byId.get(c.l).r !== W.byId.get(c.r).r,
			)
			.map((c) => lineD(c.p))
			.join("");
		const distB = W.chains
			.filter(
				(c) =>
					c.l != null && c.r != null && W.byId.get(c.l).r === W.byId.get(c.r).r,
			)
			.map((c) => lineD(c.p))
			.join("");
		const rivers = g.rivers
			.map(
				(r) =>
					`<path d="${lineD(pairs(r.p))}" stroke-width="${Math.round((r.w[0] + r.w[1]) / 2)}"/>`,
			)
			.join("");
		const spots = glyphSpots(W);
		const defs =
			Object.entries(GLYPH)
				.map(
					([k, v]) => `<symbol id="wmg-${k}" overflow="visible">${v}</symbol>`,
				)
				.join("") +
			'<pattern id="wm-hatch" patternUnits="userSpaceOnUse" width="90" height="90" patternTransform="rotate(45)"><rect width="90" height="90" fill="#cfc8bc" fill-opacity=".55"/><path d="M0 0 V90" stroke="#5f5a70" stroke-width="26" stroke-opacity=".55"/></pattern>' +
			'<pattern id="wm-fog" patternUnits="userSpaceOnUse" width="240" height="240"><rect width="240" height="240" fill="#ece8f2" fill-opacity=".5"/><circle cx="60" cy="70" r="40" fill="#fff" fill-opacity=".25"/><circle cx="180" cy="170" r="56" fill="#fff" fill-opacity=".2"/></pattern>';
		const labels = [];
		for (const r of g.regions)
			labels.push(
				`<text class="lb lb-r" x="${r.c[0]}" y="${r.c[1]}">${esc(r.n)}</text>`,
			);
		for (const t of W.T) {
			const big = t.grand || t.cap;
			labels.push(
				`<text class="lb lb-d${big ? " lb-cap" : ""}${t.grand ? " lb-grand" : ""}" x="${t.c[0]}" y="${t.c[1]}">${esc(t.n)}<tspan class="st" x="${t.c[0]}" dy="1.25em">${"★".repeat(t.d)}</tspan></text>`,
			);
			if (t.tw && !t.gate && !t.lair) {
				const m = townMark(t);
				if (m)
					labels.push(
						icon(
							t.tw.x,
							t.tw.y,
							m,
							"tm" + (big ? " tm-cap" : "") + (t.grand ? " tm-grand" : ""),
						),
					);
			}
			if (t.lair) labels.push(icon(t.c[0], t.c[1] - 220, ICON.tower, "tm-l"));
			if (t.gate) labels.push(icon(t.c[0], t.c[1] - 200, ICON.gate, "tm-l"));
		}
		return (
			`<svg class="wm-svg z1" xmlns="${NS}" viewBox="${vb.join(" ")}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Карта мира сезона">` +
			`<defs>${defs}</defs>` +
			`<rect x="${vb[0] - 20000}" y="${vb[1] - 20000}" width="${vb[2] + 40000}" height="${vb[3] + 40000}" fill="${OCEAN}"/>` +
			`<path d="${coast}${isles}" fill="none" stroke="#87a9c2" stroke-width="420" stroke-linejoin="round" stroke-opacity=".6"/>` +
			`<path d="${coast}${isles}" fill="none" stroke="#a6c4d6" stroke-width="170" stroke-linejoin="round" stroke-opacity=".75"/>` +
			`<path d="${isles}" fill="${GROUND.coast}"/>` +
			`<g class="wm-land">${W.T.map((t) => `<path data-id="${t.id}" d="${t.dd}" fill="${GROUND[t.b] || GROUND.meadow}" fill-rule="evenodd"/>`).join("")}</g>` +
			`<g class="wm-gl">${spots.map(([b, x, y, k]) => `<use href="#wmg-${b}" transform="translate(${x} ${y}) scale(${k})"/>`).join("")}</g>` +
			`<g class="wm-riv" fill="none" stroke="#7fa6c4" stroke-linecap="round" stroke-linejoin="round">${rivers}</g>` +
			`<path class="wm-wall" d="${lineD(pairs(g.barrier))}"/>` +
			`<path class="wm-b wm-bd" d="${distB}"/><path class="wm-b wm-br" d="${regionB}"/><path class="wm-b wm-bc" d="${coast}${isles}"/>` +
			`<g class="wm-ov"></g>` +
			`<path class="wm-sel" d=""/>` +
			`<g class="wm-lb">${labels.join("")}</g>` +
			`<g class="wm-ic"></g>` +
			`<g class="wm-rt"></g>` +
			`</svg>`
		);
	}

	function overlay() {
		const W = G,
			d = D,
			t0 = now(),
			ov = [],
			ic = [],
			tags = [];

		const known = new Set(
			Object.keys(d.t).filter((id) => d.t[id].c || d.t[id].o != null),
		);
		const open = new Set();
		for (const id of known)
			for (const n of (W.byId.get(id) || { nb: [] }).nb) open.add(n);
		for (const t of W.T) {
			const s = d.t[t.id],
				o = ownerOf(d, t.id);

			if (o) {
				ov.push(
					`<path d="${t.dd}" fill="${o.color}" fill-opacity="${o.mine ? 0.55 : 0.45}" stroke="${o.color}" class="own${o.mine ? " mine" : ""}" data-ch="${esc(o.ch)}"/>`,
				);
				if (!t.gate && !t.lair) tags.push(ownTag(t, o));
			} else if (t.pro) continue;
			else if (!s || !s.c) {
				if (!open.has(t.id))
					ov.push(`<path d="${t.dd}" fill="url(#wm-fog)" class="fog"/>`);
				continue;
			} else ov.push(`<path d="${t.dd}" fill="url(#wm-hatch)" class="ab"/>`);
			if (s && s.rg != null && s.c && !t.pro && t0 >= s.rg) {
				ov.push(`<path d="${t.dd}" class="rs"/>`);
				ic.push(icon(t.c[0] + 260, t.c[1] - 260, ICON.restless, "tm-x"));
			}
		}

		for (const t of W.T) {
			const o = ownerOf(d, t.id);
			if (o && o.mine) ov.push(`<path d="${t.dd}" class="mine-o"/>`);
		}

		for (const t of W.T) {
			if (t.gate) {
				const at = d.gates[t.id];
				if (at == null || t0 < at)
					ic.push(icon(t.c[0], t.c[1] - 200, ICON.lock, "tm-l"));
			}
			if (t.lair && (d.lairsAt == null || t0 < d.lairsAt))
				ic.push(icon(t.c[0], t.c[1] - 220, ICON.lock, "tm-l"));
		}
		const rt = routeNow(d);
		if (d.party && W.byId.get(d.party) && !rt) {
			const t = W.byId.get(d.party);
			ic.push(icon(t.c[0] - 300, t.c[1] - 120, ICON.flag, "tm-p"));
		}

		for (const [id, list] of Object.entries(squadsBy(d))) {
			const t = W.byId.get(id);
			if (!t) continue;
			const L = list.filter((x) => !(x.mine && (d.party === id || rt)));
			if (L.length) tags.push(sqTag(t, L));
		}
		S.svg.querySelector(".wm-ov").innerHTML = ov.join("");
		S.svg.querySelector(".wm-ic").innerHTML = tags.join("") + ic.join("");
		routeDraw(rt);
	}

	function sqTag(t, L) {
		const p = t.tw ? [t.tw.x, t.tw.y] : t.c,
			f = L[0],
			txt =
				(f.mine ? `${f.ch} · ваш канал` : f.ch) +
				(L.length > 1 ? ` +${L.length - 1}` : "");
		return (
			`<g class="ic sqtag${f.mine ? " sqtag-me" : ""}" style="transform:translate(${p[0]}px,${p[1]}px) scale(var(--ui))" aria-label="Отряд канала ${esc(L.map((x) => x.ch).join(", "))}"><g transform="translate(14 -4)">` +
			`<path d="M0 6 L0 -20" stroke="#2a2236" stroke-width="2.4" stroke-linecap="round"/><path d="M1 -20 L15 -15 L1 -10 Z" fill="${f.color}" stroke="#2a2236" stroke-width="1.4" stroke-linejoin="round"/>` +
			`<text class="otx" x="18" y="-12">${esc(txt)}</text></g></g>`
		);
	}

	function ownTag(t, o) {
		const txt = o.mine ? `${o.ch} · ваш канал` : o.ch,
			x0 = -Math.round((txt.length * 6.3 + 14) / 2);
		return (
			`<g class="ic otag${o.mine ? " otag-me" : ""}" style="transform:translate(${t.c[0]}px,${t.c[1]}px) scale(var(--ui))"><g transform="translate(${x0} 36)">` +
			`<path d="M0 4 L0 -12" stroke="#2a2236" stroke-width="2" stroke-linecap="round"/><path d="M1 -12 L12 -8 L1 -4 Z" fill="${o.color}" stroke="#2a2236" stroke-width="1.2" stroke-linejoin="round"/>` +
			`<text class="otx" x="15" y="0">${esc(txt)}</text></g></g>`
		);
	}

	function routeNow(d) {
		const R = d && d.route;
		if (!R || !Array.isArray(R.r) || R.r.length < 2 || !(R.until > now()))
			return null;
		const pts = R.r
			.map((id) => G.byId.get(id))
			.filter(Boolean)
			.map((t) => t.c);
		return pts.length >= 2
			? { ...R, pts, key: R.r.join(">") + "@" + R.at }
			: null;
	}
	function routeDraw(rt) {
		const g = S.svg && S.svg.querySelector(".wm-rt");
		if (!g) return;
		if (!rt) {
			if (g.dataset.k) {
				g.innerHTML = "";
				g.dataset.k = "";
			}
			clearTimeout(S.rtT);
			return;
		}
		if (g.dataset.k === rt.key) return;
		clearTimeout(S.rtT);
		g.dataset.k = rt.key;
		const P = rt.pts,
			dd = P.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" "),
			last = P[P.length - 1];
		g.innerHTML =
			`<path class="wm-rtl" d="${dd}" fill="none" stroke="#2a2236" stroke-linecap="round" stroke-linejoin="round" style="stroke-width:calc(9px * var(--ui))"/>` +
			`<path class="wm-rtl" d="${dd}" fill="none" stroke="#ffd76a" stroke-linecap="round" stroke-linejoin="round" style="stroke-width:calc(4px * var(--ui));stroke-dasharray:calc(14px * var(--ui)) calc(10px * var(--ui))"/>` +
			icon(
				last[0],
				last[1],
				'<circle r="9" fill="none" stroke="#ff3a4a" stroke-width="3"/>',
				"tm-x",
			) +
			`<g class="wm-rtm" aria-label="Отряд вашего канала в пути">${icon(0, 0, ICON.flag, "tm-p")}</g>`;
		const mk = g.querySelector(".wm-rtm"),
			cum = [0];
		for (let i = 1; i < P.length; i++)
			cum.push(
				cum[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]),
			);
		const total = cum[cum.length - 1] || 1,
			span = Math.max(1, rt.until - rt.at);
		const at = (k) => {
			const L = k * total;
			let i = 1;
			while (i < P.length - 1 && cum[i] < L) i++;
			const s0 = cum[i] - cum[i - 1] || 1,
				f = Math.max(0, Math.min(1, (L - cum[i - 1]) / s0));
			return `translate(${P[i - 1][0] + (P[i][0] - P[i - 1][0]) * f}px,${P[i - 1][1] + (P[i][1] - P[i - 1][1]) * f}px)`;
		};
		const kNow = () => Math.max(0, Math.min(1, (now() - rt.at) / span));
		mk.style.transform = at(kNow());
		const seg = () => {
			if (!mk.isConnected) return;
			const k = kNow();
			if (k >= 1) {
				mk.style.transition = "";
				mk.style.transform = at(1);
				return;
			}
			let j = 1;
			while (j < cum.length - 1 && cum[j] / total <= k + 1e-6) j++;
			const kj = cum[j] / total,
				ms = Math.max(0, rt.at + kj * span - now());
			mk.style.transition = `transform ${(ms / 1000).toFixed(2)}s linear`;
			mk.style.transform = at(kj);
			if (kj < 1) S.rtT = setTimeout(seg, ms + 20);
		};
		S.rtT = setTimeout(seg, 60);
	}

	function size() {
		const r = S.map.getBoundingClientRect();
		S.w = Math.max(1, r.width);
		S.h = Math.max(1, r.height);
		S.ins = insets();
	}

	function fitOf(bb, pad = 0.06, sym = false) {
		let I = S.ins || { l: 0, t: 0, r: 0, b: 0 };
		const w = (bb[2] - bb[0]) * (1 + pad * 2) || 1,
			h = (bb[3] - bb[1]) * (1 + pad * 2) || 1;
		const kOf = (J) =>
			Math.min(
				Math.max(1, S.w - J.l - J.r) / w,
				Math.max(1, S.h - J.t - J.b) / h,
			);
		if (sym && I.l !== I.r) {
			const m = Math.max(I.l, I.r),
				J = { ...I, l: m, r: m };
			if (kOf(J) >= kOf(I) * CENTER) I = J;
		}
		const k = kOf(I);
		return {
			cx: (bb[0] + bb[2]) / 2 + (I.r - I.l) / 2 / k,
			cy: (bb[1] + bb[3]) / 2 + (I.b - I.t) / 2 / k,
			k,
		};
	}
	const fitLand = () => fitOf(G.land, 0.06, true);
	const kMin = () => fitLand().k * 0.85,
		kMax = () => Math.max(fitLand().k * 4, 0.45);
	function clampView(v) {
		const k = clamp(v.k, kMin(), kMax()),
			L = G.land,
			hw = S.w / 2 / k,
			hh = S.h / 2 / k,
			I = S.ins || { l: 0, t: 0, r: 0, b: 0 };
		const cx =
			L[2] - L[0] < hw * 2
				? clamp(
						v.cx,
						(L[0] + L[2]) / 2 - I.l / 2 / k,
						(L[0] + L[2]) / 2 + I.r / 2 / k,
					)
				: clamp(v.cx, L[0] + hw * 0.3, L[2] - hw * 0.3);
		const cy =
			L[3] - L[1] < hh * 2
				? clamp(
						v.cy,
						(L[1] + L[3]) / 2 - I.t / 2 / k,
						(L[1] + L[3]) / 2 + I.b / 2 / k,
					)
				: clamp(v.cy, L[1] + hh * 0.3, L[3] - hh * 0.3);
		return { cx, cy, k };
	}

	function preview() {
		const a = S.v,
			b = S.live,
			m = b.k / a.k;
		const tx = S.w / 2 - (m * S.w) / 2 + (a.cx - b.cx) * b.k,
			ty = S.h / 2 - (m * S.h) / 2 + (a.cy - b.cy) * b.k;
		S.svg.style.transform = `translate(${tx}px,${ty}px) scale(${m})`;
	}
	function commit() {
		clearTimeout(S.cT);
		S.cT = 0;
		S.lastCommit = performance.now();
		S.v = S.live = clampView(S.live);
		const { cx, cy, k } = S.v,
			w = S.w / k,
			h = S.h / k;
		S.svg.setAttribute("viewBox", `${cx - w / 2} ${cy - h / 2} ${w} ${h}`);
		S.svg.style.transform = "";
		S.svg.style.setProperty("--u", String(1 / k));
		S.svg.style.setProperty(
			"--ui",
			String((S.w < 600 && k < Z2 ? 0.72 : 1) / k),
		);

		const cls = k < Z2 ? "z1" : k < Z3 ? "z2" : "z3";
		S.svg.classList.toggle("narrow", S.w < 600);
		if (S.z !== cls) {
			S.svg.classList.remove("z1", "z2", "z3");
			S.svg.classList.add(cls);
			S.z = cls;
		}
		if (S.home) S.home.disabled = !homeBox();
	}
	function setLive(v, soon) {
		S.fitted = false;
		S.live = clampView(v);
		preview();
		if (soon === true) commit();
		else if (soon === "drag") {
			if (performance.now() - S.lastCommit > 250) commit();
		} else {
			clearTimeout(S.cT);
			S.cT = setTimeout(commit, 160);
		}
	}
	const toWorld = (px, py, v = S.live) => [
		v.cx + (px - S.w / 2) / v.k,
		v.cy + (py - S.h / 2) / v.k,
	];
	function zoomAt(px, py, f, soon) {
		const v = S.live,
			k = clamp(v.k * f, kMin(), kMax()),
			[wx, wy] = toWorld(px, py, v);
		setLive(
			{ k, cx: wx - (px - S.w / 2) / k, cy: wy - (py - S.h / 2) / k },
			soon,
		);
	}
	function flyTo(bb, pad) {
		const f = fitOf(bb, pad);
		setLive({ cx: f.cx, cy: f.cy, k: Math.min(f.k, kMax()) }, true);
	}

	function bindGestures() {
		const el = S.map,
			P = new Map();
		let start = null,
			moved = 0;
		el.addEventListener("pointerdown", (e) => {
			if (e.target.closest(".wm-card, .wm-ui, .wm-home, .wm-hud")) return;
			el.setPointerCapture && el.setPointerCapture(e.pointerId);
			P.set(e.pointerId, [e.clientX, e.clientY]);
			moved = P.size > 1 ? 99 : 0;
			start = {
				v: { ...S.live },
				pts: [...P.values()].map((p) => p.slice()),
				t: e.target,
			};
		});
		el.addEventListener("pointermove", (e) => {
			if (!P.has(e.pointerId) || !start) return;
			P.set(e.pointerId, [e.clientX, e.clientY]);
			const r = el.getBoundingClientRect(),
				pts = [...P.values()];
			if (pts.length === 1 && start.pts.length === 1) {
				const dx = pts[0][0] - start.pts[0][0],
					dy = pts[0][1] - start.pts[0][1];
				moved = Math.max(moved, Math.hypot(dx, dy));
				if (moved < 5) return;
				setLive(
					{
						k: start.v.k,
						cx: start.v.cx - dx / start.v.k,
						cy: start.v.cy - dy / start.v.k,
					},
					"drag",
				);
			} else if (pts.length >= 2) {
				if (start.pts.length < 2) {
					start = { v: { ...S.live }, pts: pts.map((p) => p.slice()) };
					return;
				}
				const d0 =
						Math.hypot(
							start.pts[0][0] - start.pts[1][0],
							start.pts[0][1] - start.pts[1][1],
						) || 1,
					d1 = Math.hypot(pts[0][0] - pts[1][0], pts[0][1] - pts[1][1]);
				const m0 = [
						(start.pts[0][0] + start.pts[1][0]) / 2 - r.left,
						(start.pts[0][1] + start.pts[1][1]) / 2 - r.top,
					],
					m1 = [
						(pts[0][0] + pts[1][0]) / 2 - r.left,
						(pts[0][1] + pts[1][1]) / 2 - r.top,
					];
				const k = clamp((start.v.k * d1) / d0, kMin(), kMax()),
					[wx, wy] = toWorld(m0[0], m0[1], start.v);
				setLive(
					{ k, cx: wx - (m1[0] - S.w / 2) / k, cy: wy - (m1[1] - S.h / 2) / k },
					"later",
				);
			}
		});
		const up = (e) => {
			if (!P.has(e.pointerId)) return;
			P.delete(e.pointerId);
			if (P.size) {
				start = {
					v: { ...S.live },
					pts: [...P.values()].map((p) => p.slice()),
				};
				return;
			}
			const tap = moved < 5 && start;
			start = null;
			if (S.svg.style.transform) commit();
			if (tap && e.type === "pointerup") {
				const p = document.elementFromPoint(e.clientX, e.clientY),
					id = p && p.closest && p.closest(".wm-land [data-id]");
				pick(id ? id.dataset.id : null);
			}
		};
		el.addEventListener("pointerup", up);
		el.addEventListener("pointercancel", up);
		el.addEventListener(
			"wheel",
			(e) => {
				e.preventDefault();
				const r = el.getBoundingClientRect();
				zoomAt(
					e.clientX - r.left,
					e.clientY - r.top,
					Math.exp(-clamp(e.deltaY, -120, 120) * 0.0022),
				);
			},
			{ passive: false },
		);
		el.addEventListener("keydown", (e) => {
			const st = 80 / S.live.k,
				v = S.live;
			if (e.key === "ArrowLeft") setLive({ ...v, cx: v.cx - st });
			else if (e.key === "ArrowRight") setLive({ ...v, cx: v.cx + st });
			else if (e.key === "ArrowUp") setLive({ ...v, cy: v.cy - st });
			else if (e.key === "ArrowDown") setLive({ ...v, cy: v.cy + st });
			else if (e.key === "+" || e.key === "=") zoomAt(S.w / 2, S.h / 2, 1.4);
			else if (e.key === "-") zoomAt(S.w / 2, S.h / 2, 1 / 1.4);
			else if (e.key === "Escape") pick(null);
			else return;
			e.preventDefault();
		});
	}

	function enterInfo(t) {
		const d = D,
			why = d.enter && d.enter[t.id];
		if (!t.tw) return { html: "" };
		const kind = kindOf(t);
		if (why)
			return {
				ok: true,
				why,
				html: `<p class="wm-en ok">${esc(WHY_RU[why] || "вход открыт")}</p><button type="button" class="btn wm-go" data-go="${esc(t.id)}" data-why="${esc(why)}">Войти в город</button>`,
			};
		if (!d.city)
			return { html: '<p class="wm-en">«Город» вам пока закрыт.</p>' };
		if (!t.city && kind !== "fair")
			return {
				html:
					t.gate || t.lair
						? ""
						: `<p class="wm-en">Войти нельзя: на сайте открыты города только округов ★1–2.</p>`,
			};
		if (!d.city)
			return { html: '<p class="wm-en">«Город» вам пока закрыт.</p>' };
		return {
			html: `<p class="wm-en">Сейчас закрыт: откроется, когда канал захватит округ. На стриме — участникам отряда, пока отряд стоит здесь.</p>`,
		};
	}
	const dmOn = () => {
		try {
			return !!(window.LGDistrictMap && window.LGDistrictMap.on());
		} catch (e) {
			return false;
		}
	};
	function cardHtml(t) {
		const d = D,
			s = d.t[t.id] || null,
			t0 = now(),
			reg = G.R.get(t.r);
		const rows = [];
		rows.push([
			"Опасность",
			`<span class="wm-st" aria-label="${t.d} из 5">${stars(t.d)}</span> <span class="mu">${DANGER_RU[t.d] || ""} · ур. ${t.lv}</span>`,
		]);
		rows.push(["Природа", esc((G.g.biomes || {})[t.b] || t.b)]);
		let own;
		const o = ownerOf(d, t.id);

		if (o)
			own = `<i class="wm-sw" style="background:${esc(o.color)}"></i>${esc(o.ch)}${o.mine ? ' <span class="wm-tag">ваш канал</span>' : ""}`;
		else if (t.pro)
			own = '<span class="mu">Пролог — у каждого канала свой</span>';
		else if (s && s.c) own = '<i class="wm-sw wm-sw-ab"></i>ничей — брошен';
		else own = '<span class="mu">никто не захватил</span>';
		rows.push(["Владелец", own]);
		if (s && s.rg != null && !t.pro)
			rows.push([
				"Сейчас",
				t0 >= s.rg
					? '<b class="wm-rs">снова неспокойно — можно зачистить</b>'
					: `спокойно, восстановится через ${leftRu(s.rg - t0)}`,
			]);
		else if ((!s || !s.c) && !o && !t.pro)
			rows.push(["Сейчас", '<span class="mu">ещё никто не зачищал</span>']);
		if (t.gate) {
			const at = d.gates[t.id];
			rows.push([
				"Врата",
				at == null
					? "закрыты — сезон ещё не начат"
					: t0 < at
						? `закрыты, откроются через ${leftRu(at - t0)}`
						: "открыты",
			]);
		}
		if (t.lair)
			rows.push([
				"Логово",
				d.lairsAt == null
					? "закрыто — сезон ещё не начат"
					: t0 < d.lairsAt
						? `закрыто, откроется через ${leftRu(d.lairsAt - t0)}`
						: "открыто",
			]);
		if (t.tw && !t.gate && !t.lair) {
			const k = kindOf(t);
			rows.push([
				"Город",
				`${esc(t.tw.n)} <span class="mu">· ${esc(KIND_RU[k] || "")}</span>`,
			]);
		}
		const en = enterInfo(t);
		return (
			`<button type="button" class="wm-x" aria-label="Закрыть">×</button>` +
			`<h3>${esc(t.n)}</h3><p class="wm-rg">${esc(reg ? reg.n : "")}${t.grand ? " · главный город мира" : t.cap ? " · столица региона" : t.sp ? " · особое место региона" : ""}</p>` +
			(d.party === t.id
				? '<p class="wm-pt">Здесь отряд вашего канала — идёт поход</p>'
				: "") +
			(t.lo
				? `<p class="wm-lore">${esc(t.lo)}</p>${t.lt && t.lt.length ? `<details class="wm-lt"><summary>Летопись</summary>${t.lt.map((x) => `<p>${esc(x)}</p>`).join("")}</details>` : ""}`
				: "") +
			`<dl>${rows.map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join("")}</dl>` +
			en.html +
			(dmOn()
				? `<button type="button" class="btn wm-go wm-dm" data-dm="${esc(t.id)}">Карта округа</button>`
				: "")
		);
	}
	function pick(id, fromView) {
		S.sel = id || null;
		const card = S.card,
			t = id && G.byId.get(id);
		if (S.art) {
			if (!fromView) {
				S.picking = true;
				try {
					S.view.select(t ? id : null);
				} finally {
					S.picking = false;
				}
			}
		} else S.svg.querySelector(".wm-sel").setAttribute("d", t ? t.dd : "");
		S.wrap.classList.toggle("carded", !!t);
		if (!t) {
			card.hidden = true;
			card.innerHTML = "";
			return;
		}
		card.innerHTML = cardHtml(t);
		card.hidden = false;
		cardPlace();
		card.querySelector(".wm-x").onclick = () => pick(null);
		const go = card.querySelector("[data-go]");
		if (go)
			go.onclick = () => {
				const tid = go.dataset.go;
				X.openTown(tid === "edge" ? "fair" : tid, go.dataset.why);
			};
		const dm = card.querySelector("[data-dm]");
		if (dm)
			dm.onclick = () => {
				if (dmOn())
					window.LGDistrictMap.open(dm.dataset.dm, {
						openTown: (tid, why) => X.openTown(tid, why),
					});
			};
		try {
			S.sr.textContent = `${t.n}: опасность ${t.d} из 5`;
		} catch (e) {}
	}

	function evHtml() {
		const ev = Array.isArray(D.ev) ? D.ev : [];
		if (!ev.length) return "";
		const dm = (s) => {
			const m = /^\d{4}-(\d{2})-(\d{2})/.exec(String(s || ""));
			return m ? `${m[2]}.${m[1]}` : "";
		};
		return `<p class="wm-se wm-ev">${ev.map((e) => `${esc(e.icon || "")} <b>${esc(e.title)}</b> · ${e.live ? (e.to ? "идёт до " + dm(e.to) : "идёт") : `с ${dm(e.from)} по ${dm(e.to)}`}`).join("<br>")}</p>`;
	}
	function seasonHtml() {
		const se = D.season || {},
			t0 = now();
		if (se.startsAt == null)
			return (
				`<p class="wm-se"><b>Сезон ${se.no || 1}</b> · ещё не начат</p>` +
				evHtml()
			);
		const g = Object.values(D.gates || {}).filter((x) => x != null),
			gAt = g.length ? Math.min(...g) : null;
		const left =
			se.endsAt != null
				? se.over
					? "сезон окончен — ждём итогов"
					: `до конца ${leftRu(se.endsAt - t0)}`
				: "";
		return (
			`<p class="wm-se"><b>Сезон ${se.no || 1}</b> · ${dateRu(se.startsAt)}${se.endsAt != null ? " — " + dateRu(se.endsAt) : ""}${left ? " · " + left : ""}` +
			`${gAt != null ? ` · врата ${t0 < gAt ? "откроются через " + leftRu(gAt - t0) : "открыты"}` : ""}</p>${finalHtml()}` +
			evHtml()
		);
	}

	function finalHtml() {
		const f = D.final,
			t0 = now();
		if (!f) return "";
		const cap = esc(f.capital || "Престольград");
		if (f.wait)
			return `<p class="wm-se wm-final"><b>Срок сезона вышел - идёт осада ${cap}.</b> Сезон закроется после её итога.</p>`;
		if (t0 >= f.from)
			return `<p class="wm-se wm-final"><b>Последний штурм!</b> ${cap} даёт бонус Влияния за удержание (весь штурм - ×${esc(f.k)})${f.holder ? " · держит " + esc(f.holder) : ""}.</p>`;
		return `<p class="wm-se">Последний штурм - через ${leftRu(f.from - t0)}.</p>`;
	}
	function sideHtml() {
		const d = D,
			top = d.top || [];
		const list = top.length
			? `<ol class="wm-top">${top.map((r) => `<li${r.ch === d.me ? ' class="me"' : ""}><button type="button" data-ch="${esc(r.ch)}"><span class="wm-pl">${r.place}</span><i class="wm-sw" style="background:${esc(r.color || "#5a5a6a")}"></i><span class="wm-nm">${esc(r.ch)}${r.capital ? ' <span title="Владеет главным городом" aria-label="владеет главным городом">♛</span>' : ""}</span><span class="wm-n"${r.over ? ' title="Земель больше предела - захваты закрыты"' : ""}>${r.held}${r.lim ? "/" + r.lim : ""} окр.</span><span class="wm-inf" title="Влияние${r.storm ? " (из них " + r.storm + " - за удержание Престольграда в Последний штурм)" : ""}">${r.inf}</span></button></li>`).join("")}</ol>`
			: '<p class="mu">Округа ещё никто не захватил.</p>';
		return (
			boxHtml(
				"top",
				"Каналы по землям",
				`${list}<p class="mu wm-fine">${d.lim ? "Земли - сколько держит канал и его предел. Влияние - очки за каждую землю по её звёздам опасности, Престольград даёт больше всех; его держатель в конце сезона получает бонусные награды." : "Влияние — по захваченным округам (чем опаснее, тем больше); главная награда сезона — владельцу Престольграда."}</p>`,
			) +
			boxHtml(
				"leg",
				"Обозначения",
				`<ul class="wm-leg">` +
					`<li><i class="wm-sw wm-sw-me" style="background:${esc(d.color || "#c8102e")}"></i>земли вашего канала (${esc(d.me)})</li>` +
					`<li><i class="wm-sw wm-sw-other"></i>земли других каналов — их цветом</li>` +
					`<li><i class="wm-sw wm-sw-ab"></i>брошенный округ — ничей</li>` +
					`<li><i class="wm-sw wm-sw-fog"></i>туман — ещё никто не зачищал (земли с владельцем — всегда видны)</li>` +
					`<li><svg class="wm-li" viewBox="-10 -10 20 20" aria-hidden="true">${S && S.art ? ICON.swords : ICON.restless}</svg>снова неспокойно — можно отбить</li>` +
					`<li><svg class="wm-li" viewBox="-12 -15 26 28" aria-hidden="true">${ICON.flag}</svg>отряд вашего канала (идёт поход)</li>` +
					(Array.isArray(d.sq)
						? `<li><svg class="wm-li" viewBox="-4 -22 22 30" aria-hidden="true"><path d="M0 6 L0 -20" stroke="#2a2236" stroke-width="2.4" stroke-linecap="round"/><path d="M1 -20 L15 -15 L1 -10 Z" fill="#5a7a9a" stroke="#2a2236" stroke-width="1.4"/></svg>где стоят отряды каналов (флажок цветом канала, ник; ваш - «ваш канал»)</li>`
						: "") +
					`<li><svg class="wm-li" viewBox="-12 -14 30 26" aria-hidden="true">${ICON.tower}${ICON.lock}</svg>логово или врата — закрыты до срока</li>` +
					`<li><span class="wm-st">★★★</span>опасность округа (из 5)</li>` +
					`<li><svg class="wm-li" viewBox="-10 -10 20 20" aria-hidden="true"><rect x="-4" y="-4" width="8" height="8" rx="1" fill="#f6ecd2" stroke="#2a2236" stroke-width="1.8"/></svg>город · <svg class="wm-li" viewBox="-10 -10 20 20" aria-hidden="true"><circle r="7" fill="#f6ecd2" stroke="#2a2236" stroke-width="2"/><circle r="3" fill="#2a2236"/></svg>столица</li>` +
					`</ul>`,
			)
		);
	}

	const BOX_KEY = "lgWmBox";
	function boxOpen(id) {
		try {
			const v = JSON.parse(localStorage.getItem(BOX_KEY) || "{}");
			if (v && typeof v[id] === "number") return !!v[id];
		} catch (e) {}
		const r =
			S && S.map ? S.map.getBoundingClientRect() : { width: 0, height: 0 };
		return r.width >= 1000 && r.height >= 560;
	}
	function boxSet(id, on) {
		try {
			const v = JSON.parse(localStorage.getItem(BOX_KEY) || "{}") || {};
			v[id] = on ? 1 : 0;
			localStorage.setItem(BOX_KEY, JSON.stringify(v));
		} catch (e) {}
	}
	function boxHtml(id, title, body) {
		const on = boxOpen(id);
		return (
			`<section class="wm-box${on ? "" : " shut"}" data-box="${id}"><h3><button type="button" class="wm-bt" aria-expanded="${on}" aria-controls="wm-bb-${id}" title="${on ? "Свернуть" : "Развернуть"}">${esc(title)}<i class="wm-chev" aria-hidden="true"></i></button></h3>` +
			`<div class="wm-bb" id="wm-bb-${id}"${on ? "" : " hidden"}>${body}</div></section>`
		);
	}
	function sideBind() {
		S.side.querySelectorAll("[data-ch]").forEach(
			(b) =>
				(b.onclick = () => {
					const bb = chBox(b.dataset.ch);
					if (bb) {
						if (S.art) S.view.flyBox(bb, 0.25);
						else flyTo(bb, 0.25);
					}
				}),
		);
		S.side.querySelectorAll(".wm-bt").forEach(
			(b) =>
				(b.onclick = () => {
					const box = b.closest(".wm-box"),
						on = box.classList.contains("shut");
					box.classList.toggle("shut", !on);
					b.setAttribute("aria-expanded", String(on));
					b.title = on ? "Свернуть" : "Развернуть";
					const bb = box.querySelector(".wm-bb");
					if (bb) bb.hidden = !on;
					boxSet(box.dataset.box, on);
					relayout();
				}),
		);
	}

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
	const HUD = () =>
		`<div class="wm-hud gw-tok gw-dk" data-gst="${gst()}"><div class="wm-lt"><div class="wm-head"><h2 class="h2">Карта мира</h2><div class="wm-season"></div></div><div class="wm-tools"></div></div>` +
		`<div class="wm-zoom" role="group" aria-label="Масштаб карты"></div>` +
		`<div class="wm-rc"><aside class="wm-side" aria-label="Каналы и обозначения"></aside></div><div class="wm-card" role="region" aria-label="Карточка округа" hidden></div></div>`;
	function hudRefs(el) {
		S.wrap = el.querySelector(".wm-wrap");
		S.map = el.querySelector(".wm-map");
		S.card = el.querySelector(".wm-card");
		S.side = el.querySelector(".wm-side");
		S.seasonEl = el.querySelector(".wm-season");
		S.sr = el.querySelector(".wm-sr");
		S.lt = el.querySelector(".wm-lt");
		S.tools = el.querySelector(".wm-tools");
		S.hud = el.querySelector(".wm-hud");
		S.rc = el.querySelector(".wm-rc");
		S.zoom = el.querySelector(".wm-zoom");
	}

	const SHORT = window.matchMedia
		? window.matchMedia("(max-height: 560px) and (min-width: 700px)")
		: null;
	function toolsPlace() {
		if (!S || !S.tools) return;
		const want = SHORT && SHORT.matches ? S.rc : S.lt;
		if (S.tools.parentElement !== want) want.append(S.tools);
	}

	const chatDock = (c, m) => {
		const ch = document.querySelector(".co-float:not([hidden]) > .cy-chat");
		return !!(
			c &&
			c.width &&
			c.height &&
			ch &&
			getComputedStyle(ch.parentElement).position === "fixed" &&
			c.bottom >= m.bottom - 64 &&
			c.top > m.top &&
			c.left < m.left + m.width / 2
		);
	};
	function zoomPlace() {
		const z = S && S.zoom;
		if (!z || !S.map) return;
		const m = S.map.getBoundingClientRect();
		if (!m.width || !m.height) return;
		const gap =
			parseFloat(getComputedStyle(S.el).getPropertyValue("--wm-gap")) || 12;
		const ch = document.querySelector(".co-float:not([hidden]) > .cy-chat"),
			c = ch && ch.getBoundingClientRect();
		const zw = z.offsetWidth,
			zh = z.offsetHeight,
			r = [
				m.right - gap - zw,
				m.bottom - gap - zh,
				m.right - gap,
				m.bottom - gap,
			];
		const up =
			chatDock(c, m) &&
			c.right > r[0] - gap &&
			c.left < r[2] + gap &&
			c.top < r[3] + gap;
		z.classList.toggle("up", up);
		z.style.bottom = up
			? Math.round(Math.max(gap, m.bottom - c.top + gap)) + "px"
			: "";
		cardPlace();
	}

	const NARROW = window.matchMedia
		? window.matchMedia("(max-width: 699px)")
		: null;
	function cardPlace() {
		const k = S && S.card;
		if (!k || k.hidden || !S.map) return;
		k.style.bottom = "";
		k.style.maxHeight = "";
		if (!NARROW || !NARROW.matches) return;
		const m = S.map.getBoundingClientRect();
		if (!m.width || !m.height) return;
		const gap =
			parseFloat(getComputedStyle(S.el).getPropertyValue("--wm-gap")) || 8;
		const ch = document.querySelector(".co-float:not([hidden]) > .cy-chat"),
			c = ch && ch.getBoundingClientRect(),
			lt = S.lt.getBoundingClientRect();
		const bot =
			chatDock(c, m) && c.right > m.left + m.width / 2
				? Math.max(gap, m.bottom - c.top + gap)
				: gap;
		k.style.bottom = Math.round(bot) + "px";
		k.style.maxHeight =
			Math.max(
				120,
				Math.round(m.bottom - bot - Math.max(m.top, lt.bottom) - gap),
			) + "px";
	}

	function insets() {
		const I = { l: 0, t: 0, r: 0, b: 0 };
		if (!S || !S.map || !S.lt) return I;
		const m = S.map.getBoundingClientRect();
		if (!m.width || !m.height) return I;
		zoomPlace();
		for (const el of [S.lt, S.rc]) {
			const r = el.getBoundingClientRect();
			if (!r.width || !r.height) continue;
			if (el === S.rc && r.height > m.height * 0.35) {
				if (r.left > m.left + m.width * 0.5)
					I.r = Math.max(I.r, m.right - r.left + 8);
				continue;
			}
			I.t = Math.max(I.t, r.bottom - m.top + 8);
		}

		const ch = document.querySelector(".co-float:not([hidden]) > .cy-chat"),
			c = ch && ch.getBoundingClientRect();
		if (
			chatDock(c, m) &&
			c.width > m.width * 0.6 &&
			c.top > m.top + m.height * 0.4 &&
			c.top < m.bottom
		)
			I.b = Math.max(I.b, m.bottom - c.top + 8);

		const z =
			S.zoom &&
			S.zoom.classList.contains("up") &&
			S.zoom.getBoundingClientRect();
		if (I.b && z && z.height && z.top < m.bottom)
			I.b = Math.max(I.b, m.bottom - z.top + 8);
		return I;
	}

	function topY() {
		if (window.scrollY) window.scrollTo(0, 0);
		const R = document.documentElement,
			top = document.querySelector(".top"),
			qb = document.getElementById("qbar");
		let y = 0;
		if (
			top &&
			getComputedStyle(top).display !== "none" &&
			getComputedStyle(top).position !== "fixed"
		)
			y = Math.max(y, top.getBoundingClientRect().bottom);
		if (qb && !qb.hidden && getComputedStyle(qb).display !== "none")
			y = Math.max(y, qb.getBoundingClientRect().bottom);
		R.style.setProperty("--wm-top", Math.max(0, Math.round(y)) + "px");
	}
	function relayout() {
		if (!S || !S.built || !vis) return;
		if (S.art) {
			if (S.view && S.view.relayout) S.view.relayout();
			return;
		}
		const was = S.ins;
		size();
		if (JSON.stringify(was) !== JSON.stringify(S.ins)) {
			const f = fitLand();
			if (S.fitted) {
				S.v = S.live = { cx: f.cx, cy: f.cy, k: f.k };
				commit();
			} else {
				S.live = clampView(S.live);
				commit();
			}
		}
	}
	function layoutBind() {
		topY();
		const els = [
			document.querySelector(".top"),
			document.getElementById("qbar"),
		].filter(Boolean);
		S.topRO = window.ResizeObserver
			? new ResizeObserver(() => {
					if (S && vis) topY();
				})
			: null;
		if (S.topRO) els.forEach((e) => S.topRO.observe(e));
		S.onRs = () => {
			if (S && vis) topY();
		};
		window.addEventListener("resize", S.onRs);

		const soon = () => {
			if (!S || S.hudT) return;
			S.hudT = setTimeout(() => {
				S.hudT = 0;
				relayout();
			}, 60);
		};
		S.hudRO = window.ResizeObserver ? new ResizeObserver(soon) : null;
		if (S.hudRO) {
			S.hudRO.observe(S.lt);
			S.hudRO.observe(S.rc);
		}

		const watchChat = () => {
			const cf = document.querySelector(".co-float");
			if (!cf || cf === S.cf) return;
			S.cf = cf;
			if (S.hudRO) S.hudRO.observe(cf);
			if (S.chatMO)
				S.chatMO.observe(cf, {
					attributes: true,
					attributeFilter: ["hidden", "class", "style"],
					childList: true,
				});
			soon();
		};
		S.chatMO = window.MutationObserver
			? new MutationObserver(() => {
					watchChat();
					soon();
				})
			: null;
		S.bodyMO = window.MutationObserver ? new MutationObserver(watchChat) : null;
		if (S.bodyMO) S.bodyMO.observe(document.body, { childList: true });
		watchChat();
		if (document.readyState !== "complete")
			window.addEventListener("load", soon, { once: true });
		if (document.fonts && document.fonts.ready)
			document.fonts.ready.then(soon, () => {});
		toolsPlace();
		if (SHORT) {
			S.onShort = () => {
				toolsPlace();
				relayout();
			};
			if (SHORT.addEventListener) SHORT.addEventListener("change", S.onShort);
		}
	}
	function homeBox() {
		const d = D;
		if (!d) return null;
		const mine = G.T.filter((t) => {
			const s = d.t[t.id];
			return s && s.o != null && d.ch[s.o] && d.ch[s.o][0] === d.me;
		});
		const at = d.party || d.home,
			list = mine.length ? mine : at && G.byId.get(at) ? [G.byId.get(at)] : [];
		if (!list.length) return null;
		const bb = [1e9, 1e9, -1e9, -1e9];
		for (const t of list) {
			bb[0] = Math.min(bb[0], t.bb[0]);
			bb[1] = Math.min(bb[1], t.bb[1]);
			bb[2] = Math.max(bb[2], t.bb[2]);
			bb[3] = Math.max(bb[3], t.bb[3]);
		}
		return bb;
	}
	function chBox(ch) {
		const i = D.ch.findIndex((c) => c[0] === ch);
		if (i < 0) return null;
		const list = G.T.filter((t) => D.t[t.id] && D.t[t.id].o === i);
		if (!list.length) return null;
		const bb = [1e9, 1e9, -1e9, -1e9];
		for (const t of list) {
			bb[0] = Math.min(bb[0], t.bb[0]);
			bb[1] = Math.min(bb[1], t.bb[1]);
			bb[2] = Math.max(bb[2], t.bb[2]);
			bb[3] = Math.max(bb[3], t.bb[3]);
		}
		return bb;
	}

	const ART = () => !!(X && X.art);
	let artP = null;
	const loadJs = (src) =>
		new Promise((ok, no) => {
			const s = document.createElement("script");
			s.src = src;
			s.onload = ok;
			s.onerror = () => no(new Error("не загрузился " + src));
			document.head.appendChild(s);
		});
	function bakeOff() {
		try {
			if (
				/[?&]worldbake=0/.test(location.search) ||
				localStorage.lgWorldBake === "0"
			)
				return true;
		} catch (e) {
			return false;
		}
		return false;
	}

	function artLoad() {
		if (artP) return artP;
		const V = window.LG_WORLDV || {},
			q = (k) => (V[k] ? "?v=" + encodeURIComponent(V[k]) : "");
		artP = (async () => {
			if (!window.QArt) await loadJs("/site/q/artkit.js" + q("ak"));
			if (!window.QWorldData) await loadJs("/site/worlddata.js" + q("wd"));
			if (!window.QWorldArt) await loadJs("/site/worldart.js" + q("wa"));
			if (!window.QWorldView) await loadJs("/site/worldview.js" + q("wv"));
			let man = null;
			if (V.bk && !bakeOff()) {
				const ac = window.AbortController ? new AbortController() : null,
					to = setTimeout(() => ac && ac.abort(), 8000);
				man = await fetch(
					"/site/worldbake/index.json?v=" + encodeURIComponent(V.bk),
					ac ? { signal: ac.signal } : {},
				)
					.then((r) => (r.ok ? r.json() : null))
					.catch((e) => {
						console.warn("[карта мира] запечённое не пришло - рисуем сами", e);
						return null;
					})
					.finally(() => clearTimeout(to));
			}
			return man;
		})().catch((e) => {
			artP = null;
			throw e;
		});
		return artP;
	}

	function artStates() {
		const d = D,
			st = {},
			info = {},
			known = new Set(
				Object.keys(d.t).filter((id) => d.t[id].c || d.t[id].o != null),
			);
		for (const t of G.T) {
			const s = d.t[t.id],
				o = ownerOf(d, t.id);

			if (o) {
				st[t.id] = "cleared";
				info[t.id] = {
					owner: o.ch,
					color: o.color,
					mine: o.mine,
					gold: o.mine,
					own: 1,
					fillA: o.mine ? 0.5 : 0.4,
					by: [o.ch],
					tag: o.mine ? `${o.ch} · ваш канал` : o.ch,
				};
				if (s.rg != null && s.c && !t.pro) info[t.id].regrowAt = s.rg;
				continue;
			}
			if (t.pro) {
				st[t.id] = "cleared";
				info[t.id] = { plain: true };
				continue;
			}
			if (s && s.c) {
				st[t.id] = "cleared";
				info[t.id] = { color: "#8a8494", hatch: true, fillA: 0.3, by: ["?"] };
				if (s.rg != null) info[t.id].regrowAt = s.rg;
			}
		}
		for (const id of known)
			for (const n of (G.byId.get(id) || { nb: [] }).nb)
				if (!st[n]) st[n] = "open";
		if (d.party && G.byId.get(d.party)) st[d.party] = "current";

		for (const [id, list] of Object.entries(squadsBy(d))) {
			const L = list.filter((x) => !(x.mine && d.party === id));
			if (L.length)
				info[id] = {
					...(info[id] || {}),
					here: L.map((x) => x.ch),
					hereC: L.map((x) => x.color),
					...(L[0].mine ? { hereMe: 1 } : {}),
				};
		}
		return [st, info];
	}
	function artApply() {
		const [st, info] = artStates(),
			v = S.view,
			se = D.season || {};
		v.setSeason({ startsAt: se.startsAt == null ? null : se.startsAt });
		v.setGates(D.gates || {}, D.lairsAt == null ? null : D.lairsAt);
		v.setStates(st, info);
	}
	function artBuild(man) {
		const el = S.el;
		el.innerHTML = `<div class="wm-wrap wm-full"><div class="wm-map wm-art-on"><div class="wm-art"></div><div class="wm-sr" aria-live="polite"></div></div>${HUD()}</div>`;
		hudRefs(el);
		S.built = true;
		S.art = true;
		topY();
		S.side.innerHTML = D ? sideHtml() : "";
		if (D) sideBind();

		const [st0, in0] = D ? artStates() : [{}, {}];
		S.view = window.QWorldView.create(el.querySelector(".wm-art"), {
			states: st0,
			info: in0,
			card: false,
			avail: false,
			legend: false,
			maxDpr: 2,
			cssMove: true,
			fogFast: true,
			bake: man ? { url: "/site/worldbake/", man } : null,
			inset: insets,
			center: CENTER,
			onSelect: (id) => {
				if (!S || S.picking) return;
				pick(id, true);
			},
		});

		const art = el.querySelector(".wm-art"),
			find = art.querySelector(".qwv-find"),
			ui = art.querySelector(".qwv-ui");
		if (find) S.tools.append(find);
		if (ui) S.zoom.append(ui);
		S.tools.insertAdjacentHTML(
			"beforeend",
			'<button type="button" class="wm-home btn sm">К моему каналу</button>',
		);
		S.home = S.tools.querySelector(".wm-home");
		layoutBind();
		S.view.relayout();
		S.home.onclick = () => {
			const bb = homeBox();
			if (bb) S.view.flyBox(bb, 0.2);
			else if (X.toast) X.toast("Канал ещё не на карте мира");
		};
	}

	function geoLoad(v) {
		if (geoP) return geoP;
		geoP = fetch(`/site/worldgeo.json?v=${encodeURIComponent(v || "")}`)
			.then((r) => {
				if (!r.ok) throw new Error("geo " + r.status);
				return r.json();
			})
			.then((g) => (G = prep(g)))
			.catch((e) => {
				geoP = null;
				throw e;
			});
		return geoP;
	}
	function apply(d) {
		const key = JSON.stringify(d);
		if (key === Dkey && S && S.built) {
			S.seasonEl.innerHTML = seasonHtml();
			return;
		}
		Dkey = key;
		D = d;
		if (!S || !S.built) return;
		if (S.art) artApply();
		else overlay();
		S.seasonEl.innerHTML = seasonHtml();
		S.side.innerHTML = sideHtml();
		sideBind();
		if (S.sel) pick(S.sel);
		if (S.home) S.home.disabled = !homeBox();
	}

	let failN = 0,
		failT = 0;
	function soon() {
		if (!S || S.built || !vis || failT) return;
		failT = setTimeout(
			() => {
				failT = 0;
				if (S && !S.built && vis && !document.hidden) refresh();
			},
			Math.min(REFRESH_MS, 1000 * 2 ** Math.min(failN++, 6)),
		);
	}
	async function refresh() {
		if (!S || loading) return loading;
		loading = (async () => {
			const d = await X.api("/api/world");
			if (!d || d.ok === false) {
				if (!D)
					S.msg(
						d && d.error === "world_closed"
							? "Карта мира пока закрыта" +
									((window.LGSiteUi &&
										window.LGSiteUi.closedCode &&
										window.LGSiteUi.closedCode(d)) ||
										"") +
									"."
							: "Карта мира не загрузилась — проверь связь.",
					);
				if (!(d && d.error === "world_closed")) soon();
				return;
			}
			const art = ART();
			const [, man] = await Promise.all([
				geoLoad(d.geo || (window.LG_WORLDV || {}).geo),
				art ? artLoad() : null,
			]);
			if (!S) return;
			if (!S.built) {
				if (art) {
					D = d;
					artBuild(man);
				} else build();
			}
			apply(d);
		})()
			.catch((e) => {
				if (S && !S.built) {
					console.warn("[карта мира] не загрузилась - повторим", e);
					S.msg(
						"Карта мира не загрузилась — проверь связь и открой вкладку ещё раз.",
					);
					soon();
				}
			})
			.finally(() => {
				loading = null;
				if (S && S.built) failN = 0;
			});
		return loading;
	}
	function tick() {
		clearTimeout(timer);
		timer = 0;
		if (!S || !vis) return;
		timer = setTimeout(() => {
			if (S && vis && !document.hidden) refresh();
			tick();
		}, REFRESH_MS);
	}
	function onVis() {
		if (!S || !vis) return;
		if (document.hidden) {
			clearTimeout(timer);
			timer = 0;
		} else {
			if (Date.now() - (S.at || 0) > REFRESH_MS) {
				S.at = Date.now();
				refresh();
			}
			tick();
		}
	}

	function build() {
		const el = S.el;
		el.innerHTML = `<div class="wm-wrap wm-full"><div class="wm-map" tabindex="0" role="application" aria-label="Карта мира. Перетаскивание — сдвиг, колесо или щипок — масштаб, нажатие на округ — карточка. Стрелки, плюс и минус — с клавиатуры.">${baseSvg(G)}<div class="wm-sr" aria-live="polite"></div></div>${HUD()}</div>`;
		hudRefs(el);
		S.svg = el.querySelector(".wm-svg");
		S.zoom.innerHTML = `<div class="wm-ui"><button type="button" data-z="in" aria-label="Приблизить" title="Приблизить">+</button><button type="button" data-z="out" aria-label="Отдалить" title="Отдалить">−</button><button type="button" data-z="fit" aria-label="Весь мир" title="Весь мир"><svg viewBox="0 0 22 22" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.6"><rect x="3.5" y="5.5" width="15" height="11" rx="2"/></svg></button></div>`;
		S.tools.innerHTML = `<button type="button" class="wm-home btn sm">К моему каналу</button>`;
		S.home = S.tools.querySelector(".wm-home");
		S.built = true;
		topY();
		if (D) {
			S.side.innerHTML = sideHtml();
			sideBind();
		}
		size();
		const f = fitLand();
		S.v = S.live = { cx: f.cx, cy: f.cy, k: f.k };
		S.lastCommit = 0;
		S.fitted = true;
		commit();
		layoutBind();
		bindGestures();
		el.querySelectorAll("[data-z]").forEach(
			(b) =>
				(b.onclick = () => {
					const z = b.dataset.z;
					if (z === "fit") {
						const f = fitLand();
						setLive({ cx: f.cx, cy: f.cy, k: f.k }, true);
						S.fitted = true;
					} else zoomAt(S.w / 2, S.h / 2, z === "in" ? 1.6 : 1 / 1.6, true);
				}),
		);
		S.home.onclick = () => {
			const bb = homeBox();
			if (bb) flyTo(bb, 0.2);
			else if (X.toast) X.toast("Канал ещё не на карте мира");
		};

		S.ro = window.ResizeObserver
			? new ResizeObserver(() => {
					if (!S) return;
					const w0 = S.w,
						h0 = S.h;
					size();
					if (Math.abs(w0 - S.w) > 1 || Math.abs(h0 - S.h) > 1) {
						if (S.fitted) {
							const f = fitLand();
							S.live = { cx: f.cx, cy: f.cy, k: f.k };
						} else S.live = { ...S.live, k: S.live.k * (S.w / w0) };
						commit();
					}
				})
			: null;
		if (S.ro) S.ro.observe(S.map);
	}

	return {
		open(el, ctx) {
			X = ctx;
			vis = true;
			if (!S || S.el !== el) {
				S = {
					el,
					built: false,
					at: 0,
					msg: (t) => {
						if (!S.built) el.innerHTML = `<p class="empty">${esc(t)}</p>`;
					},
				};
				el.innerHTML = '<p class="empty">Карта мира разворачивается…</p>';
				document.addEventListener("visibilitychange", onVis);
			} else if (S.built && S.art) {
				topY();
				S.view.setActive(true);
				relayout();
			} else if (S.built) {
				topY();
				relayout();
				size();
				commit();
			}
			S.at = Date.now();
			refresh();
			tick();
		},

		close() {
			vis = false;
			clearTimeout(timer);
			timer = 0;
			if (S && S.art && S.view) S.view.setActive(false);
		},
		refresh,

		async still(el, own, o = {}) {
			await geoLoad(o.geo || (window.LG_WORLDV || {}).geo);
			const W = G,
				me = String(o.me || "").toLowerCase(),
				m = own && typeof own === "object" ? own : {};
			const ov = [],
				top = [];
			for (const t of W.T) {
				const s = m[t.id];
				if (!s || !s.owner) continue;
				const col = /^#[0-9a-f]{3,8}$/i.test(String(s.color || ""))
						? s.color
						: "#5a5a6a",
					mine = !!me && String(s.owner).toLowerCase() === me;
				ov.push(
					`<path d="${t.dd}" fill="${col}" fill-opacity="${mine ? 0.5 : 0.4}" stroke="${col}" class="own${mine ? " mine" : ""}"/>`,
				);
				if (mine) top.push(`<path d="${t.dd}" class="mine-o"/>`);
			}
			el.innerHTML = `<div class="wm-map wm-still" role="img" aria-label="${esc(o.label || "Карта владений на последний день сезона")}">${baseSvg(W)}</div>`;
			const svg = el.querySelector(".wm-svg"),
				box = el.querySelector(".wm-map");
			svg.querySelector(".wm-ov").innerHTML = ov.join("") + top.join("");
			const L = W.land,
				pw = (L[2] - L[0]) * 0.04,
				ph = (L[3] - L[1]) * 0.04,
				vb = [L[0] - pw, L[1] - ph, L[2] - L[0] + pw * 2, L[3] - L[1] + ph * 2];
			svg.setAttribute("viewBox", vb.join(" "));
			const fit = () => {
				const r = box.getBoundingClientRect();
				if (!r.width || !r.height) return;
				const k = Math.min(r.width / vb[2], r.height / vb[3]);
				svg.style.setProperty("--u", String(1 / k));
				svg.style.setProperty("--ui", String((r.width < 600 ? 0.72 : 1) / k));
				svg.classList.toggle("narrow", r.width < 600);
				svg.classList.remove("z1", "z2", "z3");
				svg.classList.add(k < Z2 ? "z1" : k < Z3 ? "z2" : "z3");
			};
			fit();
			if (stillRO) stillRO.disconnect();
			stillRO = window.ResizeObserver ? new ResizeObserver(fit) : null;
			if (stillRO) stillRO.observe(box);
			return {
				name: (id) => {
					const t = W.byId.get(id);
					return t ? t.n : "";
				},
				owner: (id) => (m[id] && m[id].owner) || null,
			};
		},

		_state: () => ({ S, D, G }),
		_card: (id) => (G && D && G.byId.get(id) ? cardHtml(G.byId.get(id)) : ""),
		_art: () => (G && D ? artStates() : null),
	};
})();
