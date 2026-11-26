((root, factory) => {
	if (typeof module === "object" && module.exports) module.exports = factory();
	else root.LGDistrictRules = factory();
})(typeof self !== "undefined" ? self : this, () => {
	const FIELD_MUL = 1.5;
	const MARK_MAX = 5;
	const STACK_MAX = 5;
	const MARK_ICONS = Object.freeze([
		"flag",
		"swords",
		"warn",
		"shield",
		"star",
		"eye",
	]);
	const MARK_NAME_MAX = 24;
	const LEAD_ROLES = Object.freeze(["leader", "lead", "officer"]);
	const PASS = ".=";

	const isPack = (n) => !!n && (n.kind === "pack" || n.kind === "elite");
	const tierOf = (n) => (n.kind === "elite" ? "elite" : n.tier);

	const iconTier = (n) =>
		n.kind === "elite" ? "elite" : n.escort ? "escort" : n.tier;

	function hash(s) {
		let h = 2166136261;
		for (const c of String(s)) {
			h ^= c.codePointAt(0);
			h = Math.imul(h, 16777619);
		}
		return h >>> 0;
	}

	function rng(seed) {
		let a = seed >>> 0;
		return () => {
			a = (a + 0x6d2b79f5) >>> 0;
			let t = a;
			t = Math.imul(t ^ (t >>> 15), t | 1);
			t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
	}

	const biomeOf = (best, biome) =>
		best && best.biomes
			? best.biomes[biome] || best.biomes.meadow || null
			: null;
	function stackFor(best, biome, star, n, r) {
		const b = biomeOf(best, biome);
		if (!b || !n) return null;
		if (n.kind === "elite") {
			const l = [].concat(b.elite || []);
			return l.length ? l[Math.floor(r() * l.length)] : null;
		}
		if (n.escort) return b.escort || null;
		const l = b[n.tier] || [];
		if (!l.length) return null;
		const w = ((best.starWeights || {})[star] || [34, 33, 33]).slice(
			0,
			l.length,
		);
		let x = r() * w.reduce((a, c) => a + c, 0);
		for (let k = 0; k < l.length; k++) {
			x -= w[k];
			if (x <= 0) return l[k];
		}
		return l[l.length - 1];
	}

	function stacksOf(best, sch, salt) {
		const r = rng(hash(`district-stack:${sch.id}:${salt || 1}`)),
			out = {};
		for (const n of sch.nodes || [])
			if (isPack(n)) out[n.id] = stackFor(best, sch.biome, sch.star, n, r);
		return out;
	}

	function lvlOf(level, n) {
		const L = Math.max(1, Math.round(+level || 1));
		if (n.kind === "lair") return L + 3;
		if (n.kind === "elite" || n.escort) return L + 2;
		return Math.max(1, L + ({ weak: -1, mid: 0, strong: 1 }[n.tier] || 0));
	}
	const lvlHard = (l, hero) => {
		const d = l - hero;
		return d <= -1 ? "easy" : d >= 2 ? "hard" : "even";
	};

	function gridOf(sch) {
		const g = sch && sch.grid;
		return g && g.rows && g.rows.length
			? { cell: g.cell, x0: g.x0, y0: g.y0, w: g.w, h: g.h, rows: g.rows }
			: null;
	}
	const chAt = (G, i, j) => (G && G.rows[j] ? G.rows[j][i] || " " : " ");
	const pass = (G, i, j) =>
		!!G &&
		i >= 0 &&
		j >= 0 &&
		i < G.w &&
		j < G.h &&
		PASS.includes(chAt(G, i, j));
	const cellOf = (G, p) => ({
		i: Math.floor((p.x - G.x0) / G.cell),
		j: Math.floor((p.y - G.y0) / G.cell),
	});
	const cellPt = (G, i, j) => ({
		x: G.x0 + (i + 0.5) * G.cell,
		y: G.y0 + (j + 0.5) * G.cell,
	});
	const keyOf = (G, c) => c.j * G.w + c.i;

	function nearPass(G, p, R = 4) {
		const c = cellOf(G, p);
		for (let r = 0; r < R; r++)
			for (let dj = -r; dj <= r; dj++)
				for (let di = -r; di <= r; di++)
					if (
						Math.max(Math.abs(di), Math.abs(dj)) === r &&
						pass(G, c.i + di, c.j + dj)
					)
						return { i: c.i + di, j: c.j + dj };
		return null;
	}

	function fieldK(G, a, b, mul = FIELD_MUL) {
		if (!G || mul === 1) return 1;
		const c = cellOf(G, { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
		return chAt(G, c.i, c.j) === "." ? 1 / mul : 1;
	}

	function pathTime(G, pts, speed, mul = FIELD_MUL) {
		let s = 0;
		for (let q = 1; q < pts.length; q++)
			s +=
				Math.hypot(pts[q].x - pts[q - 1].x, pts[q].y - pts[q - 1].y) /
				fieldK(G, pts[q - 1], pts[q], mul);
		return s / Math.max(1e-6, speed);
	}

	function flockCells(G, flocks) {
		const m = new Map();
		for (const f of flocks || [])
			if (f.alive) m.set(keyOf(G, cellOf(G, f)), { place: f.place, i: f.i });
		return m;
	}

	function cellAct(G, flocks, c) {
		if (!pass(G, c.i, c.j)) {
			const ch = chAt(G, c.i, c.j);
			return {
				act: "no",
				why: ch === "~" ? "water" : ch === " " ? "edge" : "wood",
			};
		}
		const f = flockCells(G, flocks).get(keyOf(G, c));
		return f ? { act: "attack", place: f.place, i: f.i } : { act: "walk" };
	}

	function gridRoute(G, from, to, shut, o = {}) {
		if (!G) return null;
		const s = nearPass(G, from),
			t = nearPass(G, to);
		if (!s || !t) return null;
		const W = G.w,
			N = W * G.h,
			D = new Float64Array(N).fill(Infinity),
			P = new Int32Array(N).fill(-1),
			done = new Uint8Array(N);
		const s0 = s.j * W + s.i,
			s1 = t.j * W + t.i,
			S = shut || new Map();
		const h = (k) => Math.hypot((k % W) - t.i, Math.floor(k / W) - t.j);
		const hp = [],
			hf = [];
		const push = (k, f) => {
			hp.push(k);
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
		const shutAt = (k) => (k !== s1 && k !== s0 && S.has(k) ? S.get(k) : null);
		D[s0] = 0;
		push(s0, h(s0));
		while (hp.length) {
			const u = pop();
			if (u === s1) break;
			if (done[u]) continue;
			done[u] = 1;
			const ui = u % W,
				uj = Math.floor(u / W);
			for (let dj = -1; dj <= 1; dj++)
				for (let di = -1; di <= 1; di++) {
					if (!di && !dj) continue;
					const vi = ui + di,
						vj = uj + dj;
					if (
						!pass(G, vi, vj) ||
						(di && dj && (!pass(G, ui + di, uj) || !pass(G, ui, uj + dj)))
					)
						continue;
					const v = vj * W + vi;
					if (done[v]) continue;
					const sh = shutAt(v);
					if (sh && !o.soft) continue;
					const g = D[u] + (di && dj ? Math.SQRT2 : 1) + (sh ? 1e4 : 0);
					if (g < D[v]) {
						D[v] = g;
						P[v] = u;
						push(v, g + h(v));
					}
				}
		}
		if (!Number.isFinite(D[s1])) return null;
		const cells = [];
		for (let k = s1; k !== -1; k = P[k]) cells.unshift(k);
		const through = [];
		for (const k of cells) {
			const g = shutAt(k);
			if (g && !through.includes(g)) through.push(g);
		}
		const pts = cells.map((k) => cellPt(G, k % W, Math.floor(k / W)));
		const los = (a, b) => {
			const n = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / (G.cell * 0.4));
			for (let q = 1; q < n; q++) {
				const c = cellOf(G, {
					x: a.x + ((b.x - a.x) * q) / n,
					y: a.y + ((b.y - a.y) * q) / n,
				});
				if (!pass(G, c.i, c.j) || shutAt(keyOf(G, c))) return false;
			}
			return true;
		};
		const out = [{ x: from.x, y: from.y }];
		let cur = pts[0],
			k = 0;
		while (k < pts.length - 1) {
			let far = k + 1;
			for (let q = pts.length - 1; q > k + 1; q--)
				if (los(cur, pts[q])) {
					far = q;
					break;
				}
			cur = pts[far];
			out.push(cur);
			k = far;
		}
		out[out.length - 1] = { x: to.x, y: to.y };
		let d = 0;
		for (let q = 1; q < out.length; q++)
			d += Math.hypot(out[q].x - out[q - 1].x, out[q].y - out[q - 1].y);
		return { path: out, d, through, cells };
	}

	const canMark = (role) => LEAD_ROLES.includes(String(role || ""));
	const markName = (s, ic) =>
		String(s == null ? "" : s)
			.replace(/[\u0000-\u001f<>]/g, "")
			.trim()
			.slice(0, MARK_NAME_MAX) || null;
	function markAdd(marks, m, role) {
		if (!canMark(role))
			return { ok: false, error: "Метки ставят глава и руководство гильдии" };
		const L = Array.isArray(marks) ? marks : [];
		if (L.length >= MARK_MAX)
			return { ok: false, error: `Уже ${MARK_MAX} меток - сними одну` };
		if (!m || !Number.isFinite(+m.x) || !Number.isFinite(+m.y))
			return { ok: false, error: "Нет места для метки" };
		const ic = MARK_ICONS.includes(m.ic) ? m.ic : MARK_ICONS[0];
		return {
			ok: true,
			marks: L.concat([
				{
					x: +m.x,
					y: +m.y,
					ic,
					name: markName(m.name) || "Метка",
					by: String(m.by || ""),
				},
			]),
		};
	}
	function markEdit(marks, k, ch, role) {
		if (!canMark(role))
			return { ok: false, error: "Метки меняют глава и руководство гильдии" };
		if (!marks || !marks[k]) return { ok: false, error: "Метки нет" };
		const L = marks.slice(),
			m = { ...L[k] };
		if (ch && ch.ic != null && MARK_ICONS.includes(ch.ic)) m.ic = ch.ic;
		if (ch && ch.name != null) m.name = markName(ch.name) || m.name;
		L[k] = m;
		return { ok: true, marks: L };
	}
	function markDel(marks, k, role) {
		if (!canMark(role))
			return { ok: false, error: "Метки снимают глава и руководство гильдии" };
		if (!marks || !marks[k]) return { ok: false, error: "Метки нет" };
		return { ok: true, marks: marks.filter((_, x) => x !== k) };
	}

	const plural = (n, a, b, c) => {
		const m = n % 10,
			h = n % 100;
		return m === 1 && h !== 11
			? a
			: m >= 2 && m <= 4 && (h < 10 || h >= 20)
				? b
				: c;
	};
	const groupsLabel = (n) => `${n} ${plural(n, "группа", "группы", "групп")}`;
	function crowds(groups, max = STACK_MAX) {
		const by = new Map();
		for (const g of groups || []) {
			if (!g || g.cell == null) continue;
			if (!by.has(g.cell)) by.set(g.cell, []);
			by.get(g.cell).push(g);
		}
		const out = [];
		for (const [cell, all] of by) {
			if (all.length <= max) continue;
			const L = all.slice().sort((a, b) => (b.mine ? 1 : 0) - (a.mine ? 1 : 0));
			out.push({
				cell,
				all: L,
				shown: L.slice(0, max),
				hidden: L.slice(max),
				ours: L.filter((g) => g.guild === "ours").length,
				label: groupsLabel(L.length),
			});
		}
		return out;
	}

	const bossOpen = (alive) => !(alive > 0);

	function bakePick(man, id, sk, ver, bad) {
		const e = man && man.v === 1 && man.districts ? man.districts[id] : null;
		if (!e || !sk || man.ver !== ver || e.sk !== sk || (bad && bad.has(id)))
			return null;
		const any = Object.values(e.tiles || {}).some(
			(tl) => tl && Object.keys(tl).length,
		);
		return any ? e : null;
	}

	function bakeBadRead(raw, v) {
		const m = /^([^|]*)\|(.*)$/.exec(String(raw || ""));
		return new Set(
			m && m[1] === String(v || "")
				? m[2].split(",").filter((x) => /^[\w-]{1,32}$/.test(x))
				: [],
		);
	}
	const bakeBadWrite = (bad, v) =>
		`${v || ""}|${[...bad].slice(-200).join(",")}`;

	function bakeProbe(e, L) {
		const tl = e && e.tiles && e.tiles[String(L)];
		const k = tl ? Object.keys(tl).sort()[0] : null;
		return k ? tl[k] : null;
	}

	return {
		FIELD_MUL,
		MARK_MAX,
		STACK_MAX,
		MARK_ICONS,
		MARK_NAME_MAX,
		LEAD_ROLES,
		PASS,
		isPack,
		tierOf,
		iconTier,
		hash,
		rng,
		biomeOf,
		stackFor,
		stacksOf,
		lvlOf,
		lvlHard,
		gridOf,
		chAt,
		pass,
		cellOf,
		cellPt,
		keyOf,
		nearPass,
		fieldK,
		pathTime,
		flockCells,
		cellAct,
		gridRoute,
		canMark,
		markName,
		markAdd,
		markEdit,
		markDel,
		plural,
		groupsLabel,
		crowds,
		bossOpen,
		bakePick,
		bakeBadRead,
		bakeBadWrite,
		bakeProbe,
	};
});

window.LGDistrictWin = (() => {
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
	const TEMPLATE = (
		g,
	) => `<div class="gl-win" role="dialog" aria-modal="true" aria-label="Карта округа">
    <button type="button" class="gl-x" id="dm-close" aria-label="Закрыть" title="Закрыть (Esc)">×</button>
    <header class="hd">
      <div class="ttl"><h2 id="dm-title"></h2><div class="chips" id="dm-chips"></div></div>
      <div class="hdc">
        <select id="dm-dsel" aria-label="Округ" hidden></select>
        <button type="button" class="gl-mini" id="dm-sideBtn" aria-pressed="false" hidden title="Отладка: настройки прототипа">Настройки</button>
        <button type="button" class="gl-mini" id="dm-guideBtn" aria-pressed="false" hidden title="Глава и руководство гильдии">Руководство</button>
      </div>
    </header>
    <div class="bd" id="dm-bd">
      <div class="vp" id="dm-vp">
        <div class="cam" id="dm-cam"><svg id="dm-map" xmlns="http://www.w3.org/2000/svg"></svg></div>
        <div class="ctl">
          <button type="button" id="dm-zin" title="Приблизить" aria-label="Приблизить">+</button>
          <button type="button" id="dm-zout" title="Отдалить" aria-label="Отдалить">−</button>
          <button type="button" id="dm-zall" title="Весь округ" aria-label="Весь округ"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button>
          <button type="button" id="dm-znear" title="К ближайшей живой стае" aria-label="К ближайшей живой стае"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 5l14 14M19 5L5 19"/><circle cx="12" cy="12" r="3.2" fill="currentColor"/></svg></button>
          <button type="button" id="dm-zme" title="К моей группе" aria-label="К моей группе"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="12" cy="12" r="5"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg></button>
        </div>
        <div class="mm" id="dm-mm" title="Мини-карта: нажми - камера перейдёт сюда"><svg id="dm-mini" xmlns="http://www.w3.org/2000/svg"></svg><div class="cap">весь округ</div></div>
        <div class="grp" id="dm-grp"></div>
        <div class="hint" id="dm-hint" role="status"></div>
        <div class="prog" id="dm-prog"></div>
      </div>
      <aside class="side" id="dm-side"></aside>
    </div>
  </div>
  <div class="dlg" id="dm-dlg" hidden><div class="gl-win" role="dialog"><button type="button" class="gl-x" id="dm-dlgx" aria-label="Закрыть">×</button><div id="dm-dlgb"></div></div></div>
  <div class="gl-toast" id="dm-toast" data-gst="${g}"></div>`;

	function boot(HOST, DATA, X) {
		const Q = new URLSearchParams(X.debug ? location.search : "");
		let DEAD = false;
		const offs = [];
		const listen = (t, ev, fn, o) => {
			t.addEventListener(ev, fn, o);
			offs.push(() => t.removeEventListener(ev, fn, o));
		};
		const DG = window.LGDistrictGen,
			WL = window.LGWorldLib,
			F = window.LGFlocks,
			RL = window.LGDistrictRules,
			K = DG.VIEW_K;

		const Z = (z) => (z * 2.95) / K;
		const $ = (id) => document.getElementById("dm-" + id);
		const esc = (s) =>
			String(s).replace(
				/[&<>"]/g,
				(c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
			);
		const MIN = 60e3;
		const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
		const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
		const mmss = (ms) => {
			const s = Math.max(0, Math.ceil(ms / 1000));
			return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
		};
		const secs = (s) =>
			s < 60
				? `${Math.ceil(s)} с`
				: `${Math.floor(s / 60)} мин ${Math.ceil(s % 60)} с`;
		const pl = (n, a, b, c) => {
			const m = n % 10,
				h = n % 100;
			return m === 1 && h !== 11
				? a
				: m >= 2 && m <= 4 && (h < 10 || h >= 20)
					? b
					: c;
		};
		const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

		const STYLES = [
			["legion", "Легион"],
			["cats", "Котики"],
			["monkeys", "Обезьяны"],
			["veggies", "Овощи"],
			["42brothers", "42 Братухи"],
			["cherts", "Чертики"],
			["ugabugi", "Уга-Буги"],
		];
		const BIO = {
			meadow: {
				land: "#a5c96f",
				edge: "#5f7f3a",
				tree: "#5b8f3c",
				tree2: "#3f6f2a",
				trail: "#c8a66a",
				tract: "#e2d3ac",
				clear: "#c5dd8e",
				out: "#2f4a2c",
				shape: "round",
			},
			forest: {
				land: "#6f9f52",
				edge: "#3a5a2a",
				tree: "#3f7a33",
				tree2: "#2a5a24",
				trail: "#b89060",
				tract: "#ddcfa6",
				clear: "#a8c97a",
				out: "#1f3320",
				shape: "round",
			},
			ice: {
				land: "#e3edf2",
				edge: "#7f9cb0",
				tree: "#5f8a8a",
				tree2: "#3f6a70",
				trail: "#b8c7d2",
				tract: "#f7f3e8",
				clear: "#f6fbff",
				out: "#3a4f60",
				shape: "pine",
			},
			taiga: {
				land: "#7f9f62",
				edge: "#4a6a3a",
				tree: "#3d6a3a",
				tree2: "#2a4a2a",
				trail: "#b89a70",
				tract: "#ddd0aa",
				clear: "#a9c48a",
				out: "#22352a",
				shape: "pine",
			},
			mount: {
				land: "#b5ad9c",
				edge: "#6e6658",
				tree: "#5d7a4e",
				tree2: "#3f5a36",
				trail: "#c9b48c",
				tract: "#e8dcc0",
				clear: "#cfc6b2",
				out: "#3e3a34",
				shape: "pine",
			},
			swamp: {
				land: "#7f9462",
				edge: "#4e5e3a",
				tree: "#4e6a3a",
				tree2: "#33482a",
				trail: "#a89070",
				tract: "#d6c9a0",
				clear: "#9fb07e",
				out: "#25301f",
				shape: "round",
			},
			desert: {
				land: "#e6cf98",
				edge: "#a8905a",
				tree: "#8fa05a",
				tree2: "#5e6e3a",
				trail: "#cfae74",
				tract: "#f2e4c0",
				clear: "#f0dcb0",
				out: "#5a4a30",
				shape: "round",
			},
			ash: {
				land: "#8a7d72",
				edge: "#4e443c",
				tree: "#4e4640",
				tree2: "#2e2824",
				trail: "#a89080",
				tract: "#cbbcae",
				clear: "#a2958a",
				out: "#2a2420",
				shape: "pine",
			},
			coast: {
				land: "#a9cf7e",
				edge: "#5f8a4a",
				tree: "#5b8f3c",
				tree2: "#3f6f2a",
				trail: "#d6b47a",
				tract: "#ece0bc",
				clear: "#cde39a",
				out: "#2a4a5a",
				shape: "round",
			},
			ruin: {
				land: "#9a9680",
				edge: "#5e5a48",
				tree: "#5e7048",
				tree2: "#3e4a30",
				trail: "#b8a078",
				tract: "#dcd0b0",
				clear: "#b0ab94",
				out: "#2e2c24",
				shape: "round",
			},
			blight: {
				land: "#8a7a92",
				edge: "#54465c",
				tree: "#5a4a62",
				tree2: "#3a2e42",
				trail: "#a890a0",
				tract: "#d0c0cc",
				clear: "#a496aa",
				out: "#2a2030",
				shape: "pine",
			},
		};
		const bio = (b) => BIO[b] || BIO.meadow;
		const MONS = {
			meadow: [
				["Волчата", "Полевые крысы", "Шакалы"],
				["Стая волков", "Кабаны", "Разбойники", "Дикие псы"],
				["Матёрые волки", "Шайка атамана", "Секачи"],
			],
			forest: [
				["Лесные пауки", "Кикиморы", "Барсуки-шатуны"],
				["Лешаки", "Паучий выводок", "Вепри", "Лесные тати"],
				["Древни", "Пауки-королевы", "Медведь-шатун"],
			],
			ice: [
				["Снежные лисы", "Ледяные духи", "Песцы"],
				["Ледяные волки", "Йети", "Мёрзлые мертвецы"],
				["Снежные тролли", "Морозные великаны", "Белый медведь"],
			],
		};
		const ELITE = {
			meadow: "Одноглазый вожак",
			forest: "Лесной кошмар",
			ice: "Вьюжный ярл",
		};
		const BOSS = {
			meadow: "Вожак Серой стаи",
			forest: "Хозяин Чащи",
			ice: "Ледяной король",
		};
		const BOSS_N = [0, 10, 20, 30, 45, 60];
		const TIER = {
			weak: { n: "слабая", c: "#7bc96f", pips: 1, base: 0.95, gold: 10 },
			mid: { n: "обычная", c: "#f2c14e", pips: 2, base: 0.72, gold: 20 },
			strong: { n: "сильная", c: "#ef7b55", pips: 3, base: 0.5, gold: 35 },
			elite: { n: "элитный", c: "#b06ae0", pips: 3, base: 0.4, gold: 90 },
		};
		const GUILD = {
			ours: { n: "Знамя", c: "#3d7be0" },
			enemy: { n: "Чёрный ворон", c: "#8a2fb0" },
		};
		const KIND = {
			town: "город",
			gate: "ворота",
			exit: "выход к соседу",
			tract: "тракт",
			cross: "Перепутье",
			pack: "стоянка",
			elite: "элитный",
			dungeon: "вход в данж",
			lair: "логово босса",
			spot: "поляна",
			way: "точка пути",
		};
		const DAILY = F.FLOCK.DAILY;

		const SLOT = [
			[[0, 0]],
			[
				[-7.5, 0],
				[7.5, 0],
			],
			[
				[-8, 4],
				[8, 4],
				[0, -8],
			],
		];

		const ME = DATA.me || {};
		const S = {
			fieldMul: +Q.get("field") || RL.FIELD_MUL,
			lead: !!ME.lead,
			marks: [],
			queue: [],
			di: 0,
			size: Math.max(1, Math.min(5, +Q.get("size") || 1)),
			squad: false,
			squadN: 12,
			secPer100: 5,
			walkMul: 1,
			timeMul: 1,
			clickGo: true,
			art: DATA.art && Q.get("art") !== "stub" ? "real" : "stub",
			guide: false,
			follow: false,
			showGrid: Q.has("grid"),
			daily: 0,
			gold: 0,
			plan: null,
			sel: null,
			hl: [],
			now: Date.now(),
			debug: !!X.debug,
			heroLvl: ME.lvl >= 1 ? +ME.lvl : null,
		};
		const C = { x: 0, y: 0, z: 1 };
		let me = null;

		const isPack = (n) => n && (n.kind === "pack" || n.kind === "elite");
		const tierOf = (n) => (n.kind === "elite" ? "elite" : n.tier);

		const BEST = DATA.best;
		const bestBiome = () =>
			BEST && (BEST.biomes[S.d.biome] || BEST.biomes.meadow);
		void bestBiome;
		const monName = (id) =>
			BEST && BEST.monsters[id] ? BEST.monsters[id].name : id;
		const iconTier = (n) =>
			n.kind === "elite" ? "elite" : n.escort ? "escort" : n.tier;

		const hasMon = (id) => !!(id && window.LGMon && LGMon.has(id));
		function monSyms() {
			if (!window.LGMon) return "";
			const need = new Set();
			for (const P_ of S.P.values()) {
				const n = S.N.get(P_.id),
					lead = P_.stack && P_.stack.squad[0].mon;
				if (hasMon(lead)) need.add(lead + "|" + iconTier(n));
			}
			const boss = S.bossMon;
			if (hasMon(boss)) need.add(boss + "|boss");
			return [...need]
				.map((k) => {
					const [id, t] = k.split("|");
					return `<symbol id="dmmi-${id}-${t}" viewBox="0 0 128 128">${LGMon.iconInner(id, t)}</symbol>`;
				})
				.join("");
		}
		const monUse = (id, t, R) =>
			`<use href="#dmmi-${id}-${t}" x="${-R * 1.5}" y="${-R * 1.5}" width="${R * 3}" height="${R * 3}"/>`;
		const district = () => ({ owned: S.owner !== "none", boss: bossLive() });
		function bossLive() {
			return S.owner === "none";
		}
		function respawnMin() {
			return F.backMin(district());
		}
		const pst = (id) => F.placeState(S.P.get(id).fl, S.now);
		const placeLive = (id) => !F.passable(S.P.get(id).fl, S.now);
		function liveSet() {
			const s = new Set();
			for (const id of S.P.keys()) if (placeLive(id)) s.add(id);
			return s;
		}
		const idsOf = (w) =>
			Array.from(
				{ length: w.mine ? S.size : w.size },
				(_, k) => `${w.id}:${k}`,
			);
		const groupOf = (w) => ({ gid: w.id, guild: w.guild, ids: idsOf(w) });
		const wName = (gid) => {
			const w = S.W.find((x) => x.id === gid);
			return w ? (w.mine ? "моя группа" : w.name) : "группа";
		};
		function nodeName(n) {
			if (!n) return "";
			if (isPack(n)) return S.P.get(n.id).name;
			if (n.kind === "exit")
				return `${n.trail ? "Просёлок" : "Выход"}: ${S.d.nb[n.to] || n.to}`;
			if (n.kind === "town") return `Город ${S.d.town}`;
			if (n.kind === "gate") return `Ворота ${S.d.town}`;
			if (n.kind === "lair") return `Логово: ${S.bossName}`;
			if (n.kind === "spot")
				return S.ev.has(n.id) ? "Поляна с путником" : "Поляна";
			if (n.kind === "dungeon") return "Вход в данж";
			if (n.kind === "cross") return "Перепутье";
			if (n.kind === "way") return n.name || "Точка пути";
			return "Тракт";
		}
		function targetName(t) {
			return t && t.id ? nodeName(S.N.get(t.id)) : "квадрат на карте";
		}

		function load(i) {
			const d = DATA.districts[i];
			S.di = i;
			S.d = d;
			const sch = (S.sch = d.sch);
			S.N = new Map(sch.nodes.map((n) => [n.id, n]));
			S.A = new Map(sch.nodes.map((n) => [n.id, []]));
			S.L = new Map();
			for (const e of sch.edges) {
				S.A.get(e.a).push(e.b);
				S.A.get(e.b).push(e.a);
				S.L.set(e.a + "|" + e.b, e.d);
				S.L.set(e.b + "|" + e.a, e.d);
			}
			const xs = [],
				ys = [];
			const c = sch.contour || sch.nodes.flatMap((n) => [n.x, n.y]);
			for (let k = 0; k < c.length; k += 2) {
				xs.push(c[k]);
				ys.push(c[k + 1]);
			}
			const M = 70;
			S.B = {
				x0: Math.min(...xs) - M,
				y0: Math.min(...ys) - M,
				x1: Math.max(...xs) + M,
				y1: Math.max(...ys) + M,
			};
			S.B.w = S.B.x1 - S.B.x0;
			S.B.h = S.B.y1 - S.B.y0;
			S.gate = sch.nodes.find((n) => n.kind === "gate");
			S.lair = sch.nodes.find((n) => n.kind === "lair");
			S.town = sch.nodes.find((n) => n.kind === "town");
			S.owner = d.owner;
			S.bossName = BOSS[d.biome] || "Хозяин округа";
			S.bossMon = null;
			{
				const bb = BEST && (BEST.biomes[d.biome] || BEST.biomes.meadow);
				if (bb && bb.boss) {
					S.bossName = bb.boss.name;
					S.bossMon = bb.boss.squad[0].mon;
				}
			}
			const r = WL.rng(WL.hash("district-look:" + d.id)),
				stacks = RL.stacksOf(BEST, sch);
			const mons = MONS[d.biome] || MONS.meadow;
			S.P = new Map();
			S.fights = new Map();
			for (const n of sch.nodes) {
				if (!isPack(n)) continue;
				const t = tierOf(n),
					list = mons[t === "weak" ? 0 : t === "mid" ? 1 : 2];
				const stack = stacks[n.id] || null,
					name = stack
						? stack.name + (n.escort ? " (свита)" : "")
						: n.kind === "elite"
							? ELITE[d.biome] || "Элитный"
							: list[Math.floor(r() * list.length)] +
								(n.escort ? " (свита)" : "");
				const fl = F.makePlace(n);

				if (S.debug && n.kind === "pack" && !n.main && !n.escort)
					for (const f of fl)
						if (r() < 0.22) {
							f.alive = false;
							f.back = S.now + Math.round((5 + r() * 50) * MIN);
						}
				S.P.set(n.id, {
					id: n.id,
					name,
					stack,
					fl,
					mark: null,
					wd: fl.map(() => Math.floor(r() * 4)),
					dl: fl.map(() => -(r() * 8).toFixed(2)),
				});
			}
			const spots = sch.nodes.filter((n) => n.kind === "spot");
			S.ev = new Set(
				S.debug ? spots.filter((_, k) => k % 3 === 0).map((n) => n.id) : [],
			);
			buildGrid();
			S.marks = [];
			S.queue = [];
			S.gath = null;
			makeRes();
			const tr = sch.nodes
				.filter((n) => n.kind === "tract")
				.sort((a, b) => dist(a, S.gate) - dist(b, S.gate));
			const exits = sch.nodes
				.filter((n) => n.kind === "exit" && !n.trail)
				.sort((a, b) => dist(b, S.gate) - dist(a, S.gate));
			S.W = [];

			me = mkW({
				id: "me",
				name: "моя группа",
				leader: ME.name || ME.login || "я",
				short: "1",
				guild: "ours",
				size: S.size,
				at: S.gate.id,
				mine: true,
			});

			if (S.debug)
				[
					["g2", 4, "Ратибор"],
					["g3", 5, "Mirra_ttv"],
					["g4", 3, "Северянин"],
				].forEach(([id, sz, ld], k) =>
					mkW({
						id,
						name: `группа ${ld}`,
						leader: ld,
						short: String(k + 2),
						guild: "ours",
						size: sz,
						at: (tr[k] || S.gate).id,
					}),
				);
			if (S.debug)
				mkW({
					id: "en",
					name: "группа Ворон_77 («Чёрный ворон»)",
					leader: "Ворон_77",
					label: "Ворон_77 · «Чёрный ворон»",
					short: "В",
					guild: "enemy",
					size: 3,
					at: (exits[0] || S.gate).id,
					ai: true,
					idle: 1.5,
				});
			closePop();
			S.plan = null;
			S.sel = null;
			S.selFlock = null;
			S.hl = [];
			S.follow = false;
			S.preview = null;
			S.previewPath = null;
			S.flag = null;
			drawMap();
			drawMini();
			header();
			renderSide();
			hint(null);
			centerOn(me, Z(HOST.classList.contains("ph") ? 0.6 : 0.85), false);
		}
		function mkW(o) {
			const w = Object.assign(
				{ state: "idle", pts: null, seg: 0, t: 0, x: 0, y: 0, glades: [] },
				o,
			);
			const n = S.N.get(w.at);
			w.x = n.x;
			w.y = n.y;
			S.W.push(w);
			return w;
		}

		let G = null;
		function buildGrid() {
			const g = S.sch.grid;
			G =
				g && g.rows && DG.gridRoute
					? {
							real: true,
							cell: g.cell,
							x0: g.x0,
							y0: g.y0,
							w: g.w,
							h: g.h,
							rows: g.rows,
						}
					: null;
		}
		const gPass = (i, j) =>
			!!G &&
			i >= 0 &&
			j >= 0 &&
			i < G.w &&
			j < G.h &&
			".=".includes(G.rows[j][i]);
		const gladeAt = (i, j) => (G ? DG.gladeOf(S.sch, i, j) || null : null);
		const cellOf = (p) => ({
			i: Math.floor((p.x - G.x0) / G.cell),
			j: Math.floor((p.y - G.y0) / G.cell),
		});
		const cellPt = (i, j) => ({
			x: G.x0 + (i + 0.5) * G.cell,
			y: G.y0 + (j + 0.5) * G.cell,
		});

		function nearPass(p) {
			const c = cellOf(p);
			for (let r = 0; r < 4; r++)
				for (let dj = -r; dj <= r; dj++)
					for (let di = -r; di <= r; di++)
						if (
							Math.max(Math.abs(di), Math.abs(dj)) === r &&
							gPass(c.i + di, c.j + dj)
						)
							return { i: c.i + di, j: c.j + dj };
			return null;
		}

		function gridRoute(from, to, blocked, o = {}) {
			if (!G) return null;

			const shut = new Map();
			for (const id of blocked) {
				const n = S.N.get(id);
				if (!n || !S.P.has(id)) continue;
				flockPts(n).forEach((fp, i) => {
					if (F.stateOf(S.P.get(id).fl[i], S.now).alive)
						shut.set(RL.keyOf(G, cellOf(fp)), id);
				});
			}
			const r = RL.gridRoute(G, from, to, shut, { soft: !!o.soft });
			if (!r) return null;

			const own = new Set([o.target, o.start].filter(Boolean)),
				glades = [];
			const s = nearPass(from);
			if (s) {
				const sg = gladeAt(s.i, s.j);
				if (sg) own.add(sg);
			}
			if (o.target === undefined) {
				const t = nearPass(to);
				if (t) {
					const tg = gladeAt(t.i, t.j);
					if (tg) own.add(tg);
				}
			}
			for (const k of r.cells) {
				const g = gladeAt(k % G.w, Math.floor(k / G.w));
				if (g && !own.has(g) && !glades.includes(g)) glades.push(g);
			}
			return { path: r.path, d: r.d, through: r.through, glades };
		}

		function dijkstra(from, blocked, packCost) {
			const D = new Map([[from, 0]]),
				P = new Map(),
				done = new Set();
			for (;;) {
				let u = null,
					m = Infinity;
				for (const [k, v] of D)
					if (!done.has(k) && v < m) {
						m = v;
						u = k;
					}
				if (u == null) break;
				done.add(u);
				if (!packCost && u !== from && blocked.has(u)) continue;
				for (const v of S.A.get(u)) {
					const nd =
						m +
						S.L.get(u + "|" + v) +
						(packCost && blocked.has(v) ? packCost : 0);
					if (!D.has(v) || nd < D.get(v)) {
						D.set(v, nd);
						P.set(v, u);
					}
				}
			}
			return { D, P };
		}
		const pathTo = (P, from, to) => {
			const p = [to];
			while (p[0] !== from) {
				const q = P.get(p[0]);
				if (q == null) return null;
				p.unshift(q);
			}
			return p;
		};
		function blockersOf(from, to) {
			const live = liveSet();
			live.delete(to);
			const { P } = dijkstra(from, live, 1e5);
			const p = pathTo(P, from, to);
			return p
				? p.filter((id) => id !== from && id !== to && live.has(id))
				: [];
		}

		function wPos(w) {
			if (w.state !== "walk" || !w.pts) return { x: w.x, y: w.y };
			const a = w.pts[w.seg],
				b = w.pts[w.seg + 1];
			return { x: a.x + (b.x - a.x) * w.t, y: a.y + (b.y - a.y) * w.t };
		}

		function go(w, target, o = {}) {
			if (w.state === "fight") return "идёт бой - бой не прерывается";
			w.stay = false;
			const live = liveSet();
			let pts = null,
				glades = [];
			const standing = w.state !== "walk" && w.at;
			if (standing && target.id === w.at) return "группа уже здесь";
			if (standing && target.id) {
				const r = DG.route(S.sch, w.at, target.id, live);
				if (r)
					pts = r.path.map((id) => {
						const n = S.N.get(id);
						return { x: n.x, y: n.y, id };
					});
			}
			if (!pts) {
				const from = wPos(w);
				const r = gridRoute(from, target, live, {
					target: target.id || undefined,
					start: standing ? w.at : null,
				});
				if (r) {
					pts = r.path;
					glades = r.glades;
					if (target.id) pts[pts.length - 1].id = target.id;
				}
			}
			if (!pts) return "blocked";

			if (pts.length < 2) {
				const from = wPos(w);
				pts = [
					{ x: from.x, y: from.y },
					pts[0] || { x: target.x, y: target.y, id: target.id },
				];
			}
			if (pts.length === 2 && dist(pts[0], pts[1]) < 0.5 && !target.id)
				return "группа уже здесь";
			leavePlace(w);
			if (w.mine && w.pend && (!target.id || target.id !== w.pend.id))
				w.pend = null;
			w.state = "walk";
			w.pts = pts;
			w.seg = 0;
			w.t = 0;
			w.target = target;
			w.glades = glades;
			w.autoFight = !!o.autoFight;
			w.from = w.at;
			w.at = null;
			if (w.mine) {
				hint(null);
				S.hl = [];
				drawHl();
			}
			return true;
		}

		function leavePlace(w) {
			if (!w.at || !S.P.has(w.at)) return;
			const pl_ = S.P.get(w.at);
			pl_.fl.forEach((f, i) => {
				if (
					(f.busy && f.busy.gid === w.id && !f.busy.fight) ||
					(f.wait || []).some((x) => x.gid === w.id)
				) {
					const r = F.leave(f, w.id);
					if (r.ok) pl_.fl[i] = r.flock;
				}
			});
			w.waitKey = null;
		}

		function pathLeft(w) {
			if (w.state !== "walk" || !w.pts) return 0;
			let s =
				((1 - w.t) * dist(w.pts[w.seg], w.pts[w.seg + 1])) /
				segK(w.pts[w.seg], w.pts[w.seg + 1]);
			for (let i = w.seg + 1; i + 1 < w.pts.length; i++)
				s += dist(w.pts[i], w.pts[i + 1]) / segK(w.pts[i], w.pts[i + 1]);
			return s;
		}
		const speed = () => (100 / S.secPer100) * S.walkMul;

		function segK(a, b) {
			return G ? RL.fieldK(G, a, b, S.fieldMul) : 1;
		}

		function clickNode(id) {
			const n = S.N.get(id);
			S.sel = id;
			S.flag = null;
			if (S.guide && isPack(n)) {
				renderSide();
				drawMarks();
				return;
			}
			if (!S.clickGo && S.preview !== id) {
				S.preview = id;
				previewRoute({ x: n.x, y: n.y, id });
				renderSide();
				drawMarks();
				return;
			}
			S.preview = null;
			S.previewPath = null;
			walkTo(id);
		}
		function clickGround(p) {
			const c = cellOf(p);
			if (G && me.state !== "walk") {
				const mc = cellOf(me),
					ex = exitNear(me);
				if (ex && mc.i === c.i && mc.j === c.j) {
					exitDlg(ex);
					return;
				}
			}
			if (!G) {
				toast("В схеме нет сетки квадратов - ходьба только по местам", true);
				return;
			}
			if (!gPass(c.i, c.j)) {
				const ch = G && G.rows[c.j] ? G.rows[c.j][c.i] : " ";
				toast(
					ch === "~"
						? "Там вода - не пройти"
						: ch === " " || ch === undefined
							? "Это уже не наш округ"
							: "Там чаща - не пройти",
					true,
				);
				return;
			}
			const g = gladeAt(c.i, c.j);
			if (g && S.P.has(g) && placeLive(g)) {
				const n = S.N.get(g),
					act = RL.cellAct(
						G,
						flockPts(n).map((fp, i) => ({
							place: g,
							i,
							x: fp.x,
							y: fp.y,
							alive: F.stateOf(S.P.get(g).fl[i], S.now).alive,
						})),
						c,
					);
				if (act.act === "attack") {
					openPop(g, act.i);
					return;
				}
			}

			if (S.shift && (me.state === "walk" || S.queue.length)) {
				S.queue.push(cellPt(c.i, c.j));
				drawRoute();
				toast(
					`Точка ${S.queue.length + (me.state === "walk" ? 1 : 0)} пути добавлена`,
				);
				return;
			}
			if (!S.shift) S.queue = [];
			const key = `${c.i},${c.j}`;
			if (!S.clickGo && S.preview !== key) {
				S.preview = key;
				previewRoute(cellPt(c.i, c.j));
				return;
			}
			S.preview = null;
			S.previewPath = null;
			const t = cellPt(c.i, c.j);
			if (me.state === "fight") {
				toast("Идёт бой - дождись конца", true);
				return;
			}
			const r = go(me, t);
			if (r === true) {
				S.sel = null;
				S.flag = t;
				drawFlag();
				me.hunt = null;
			} else if (r === "blocked") showBlocked(t);
			else toast(r, true);
			renderSide();
			drawRoute();
			drawMarks();
		}
		function walkTo(id) {
			let n = S.N.get(id);
			if (n.kind === "town") {
				toast(
					bossLive()
						? "Город держат монстры - войти нельзя. Группа идёт к воротам."
						: `Город ${S.d.town}: вход для хозяев и гостей (окно города - не в прототипе)`,
					bossLive(),
				);
				id = S.gate.id;
				n = S.gate;
			}
			if (me.at === id && me.state !== "walk") {
				renderSide();
				return;
			}
			if (me.state === "fight") {
				toast("Идёт бой - дождись конца", true);
				return;
			}
			const r = go(me, { x: n.x, y: n.y, id });
			if (r === true) {
				S.sel = id;
				S.flag = null;
				drawFlag();
			}
			if (r === "blocked") showBlocked({ x: n.x, y: n.y, id });
			else if (r !== true) toast(r, true);
			renderSide();
			drawRoute();
			drawMarks();
		}
		function showBlocked(t) {
			const live = liveSet();
			if (t.id) live.delete(t.id);
			let bl = [];
			if (me.state !== "walk" && me.at && t.id) bl = blockersOf(me.at, t.id);
			if (!bl.length) {
				const r = gridRoute(wPos(me), t, live, {
					soft: true,
					target: t.id || undefined,
					start: me.at,
				});
				if (r) bl = r.through;
			}
			S.hl = bl;
			drawHl();
			const nm = t.id ? `«${esc(nodeName(S.N.get(t.id)))}»` : "этого квадрата";
			if (!bl.length) {
				hint(`Дороги до ${nm} нет: чаща или вода.`);
				return;
			}
			const first = S.N.get(bl[0]),
				p = S.P.get(bl[0]),
				ps = pst(bl[0]);
			hint(`<b>Путь закрывает стая «${esc(p.name)}»</b> (${TIER[tierOf(first)].n}). Обойди её или нападай его стаи.${bl.length > 1 ? ` До ${nm} на пути ещё ${bl.length - 1} ${pl(bl.length - 1, "стоянка", "стоянки", "стоянок")}.` : ""}
        <br><button class="gl-mini" data-act="toBl">Идти к «${esc(p.name)}»</button><button class="gl-mini" data-act="showBl">Показать</button><button class="gl-mini" data-act="hintx">Понятно</button>`);
			S.blocked = { target: t, list: bl };
			showSpots([{ x: me.x, y: me.y }].concat(bl.map((id) => S.N.get(id))));
		}
		function showSpots(pts) {
			const top = $("hint").classList.contains("on")
				? $("hint").offsetHeight + 50
				: 40;
			const vis = (n) => {
				const sx = C.x + (n.x - S.B.x0) * K * C.z,
					sy = C.y + (n.y - S.B.y0) * K * C.z;
				return sx > 40 && sx < vpW() - 70 && sy > top && sy < vpH() - 40;
			};
			if (pts.every(vis)) return;
			let x0 = Infinity,
				y0 = Infinity,
				x1 = -Infinity,
				y1 = -Infinity;
			for (const p of pts) {
				x0 = Math.min(x0, p.x);
				x1 = Math.max(x1, p.x);
				y0 = Math.min(y0, p.y);
				y1 = Math.max(y1, p.y);
			}
			S.follow = false;
			C.z = clamp(
				Math.min(
					Z(0.85),
					(vpW() - 140) / Math.max(1, (x1 - x0) * K),
					(vpH() - top - 70) / Math.max(1, (y1 - y0) * K),
				),
				zMin(),
				zMax(),
			);
			C.x = vpW() / 2 - ((x0 + x1) / 2 - S.B.x0) * K * C.z;
			C.y = (vpH() + top - 30) / 2 - ((y0 + y1) / 2 - S.B.y0) * K * C.z;
			applyCam(true);
		}

		function chance(n, fighters) {
			const t = TIER[tierOf(n)];
			return clamp(
				t.base - (S.d.star - 1) * 0.06 + (fighters - 1) * 0.09,
				0.05,
				0.98,
			);
		}
		const fKey = (place, i) => `${place}:${i}`;

		function besideFlock(n, fp, side) {
			const cell = (G && G.cell) || (S.sch.gap || 60) / 4;
			let dx = n.x - fp.x,
				dy = n.y - fp.y,
				L = Math.hypot(dx, dy);
			if (L < 1) {
				dx = 0;
				dy = 1;
				L = 1;
			}
			const a = Math.atan2(dy, dx) + (side ? 1.3 : 0);
			return {
				x: fp.x + Math.cos(a) * cell * 1.15,
				y: fp.y + Math.sin(a) * cell * 1.15,
			};
		}
		function flockPts(n) {
			const P_ = S.P.get(n.id),
				k = P_.fl.length;
			if (P_.pts) return P_.pts;
			if (Array.isArray(n.at) && n.at.length >= k)
				P_.pts = n.at.slice(0, k).map(([x, y]) => ({ x, y }));
			else if (k === 1) P_.pts = [{ x: n.x, y: n.y }];
			else {
				const R = (S.sch.gap || 75) * 0.45,
					a0 = ((WL.hash("fl:" + n.id) % 360) / 180) * Math.PI;
				P_.pts = Array.from({ length: k }, (_, i) => ({
					x: n.x + Math.cos(a0 + (i * 2 * Math.PI) / k) * R,
					y: n.y + Math.sin(a0 + (i * 2 * Math.PI) / k) * R,
				}));
			}
			return P_.pts;
		}

		function attack(w, place, i) {
			const P_ = S.P.get(place);
			let f = F.refresh(P_.fl[i], S.now);
			if (!(f.busy && f.busy.gid === w.id)) {
				const r = F.arrive(f, groupOf(w), S.now);
				if (!r.ok || r.how !== "take") return r.error || "стая занята";
				f = r.flock;
			}
			const s = F.startFight(f, w.id);
			if (!s.ok) return s.error;
			P_.fl[i] = s.flock;
			S.fights.set(fKey(place, i), {
				place,
				i,
				ws: [w],
				t: 0,
				dur: w.mine ? 2.4 : w.guild === "enemy" ? 9 : 7,
			});
			{
				const nn = S.N.get(place);
				w.x = nn.x;
				w.y = nn.y;
				w.stay = false;
			}
			w.state = "fight";
			w.fk = fKey(place, i);
			w.waitKey = null;
			drawMarks();
			renderSide();
			return true;
		}

		function joinFight(w, key) {
			const fi = S.fights.get(key);
			if (!fi) return "боя уже нет";
			const P_ = S.P.get(fi.place);
			const r = F.help(P_.fl[fi.i], groupOf(w));
			if (!r.ok) return r.error;
			P_.fl[fi.i] = r.flock;
			fi.ws.push(w);
			fi.dur = Math.max(fi.t + 1.2, fi.t + (fi.dur - fi.t) * 0.6);
			{
				const nn = S.N.get(S.fights.get(key).place);
				w.x = nn.x;
				w.y = nn.y;
				w.stay = false;
			}
			w.state = "fight";
			w.fk = key;
			w.waitKey = null;
			drawMarks();
			renderSide();
			return true;
		}
		function endFight(key) {
			const fi = S.fights.get(key);
			S.fights.delete(key);
			const P_ = S.P.get(fi.place),
				n = S.N.get(fi.place),
				f = P_.fl[fi.i];
			const ids = f.busy ? f.busy.ids : [];
			const mine = fi.ws.includes(me);
			const win =
				Math.random() <
				(mine || fi.ws.some((w) => w.guild === "ours")
					? chance(n, ids.length)
					: 0.75);
			const r = F.endFight(f, win, S.now, district());
			if (!r.ok || !r.flock) console.warn("endFight", r && r.error);
			P_.fl[fi.i] = r.flock || f;

			{
				const fp = flockPts(n)[fi.i] || n,
					gap = S.sch.gap || 75;
				fi.ws.forEach((w, ix) => {
					const q = besideFlock(n, fp, ix);
					w.x = q.x;
					w.y = q.y;
					w.stay = true;
					void gap;
				});
			}
			for (const w of fi.ws) {
				w.state = "idle";
				w.fk = null;
				if (w.ai) w.idle = 2;
			}
			if (win) {
				if (mine) reward(n, r.ids, fi.ws);
				if ((r.gone || []).includes("me")) {
					me.waitKey = null;
					hint(null);
					toast(
						`Стаю «${P_.name}» убила ${wName(fi.ws[0].id)}. Вернётся через ${respawnMin()} мин.`,
						true,
					);
				}
			} else {
				if (mine) {
					toast(
						`Не вышло: стая «${P_.name}» отбилась. Группа отступила.`,
						true,
					);
					for (const w of fi.ws)
						if (w.from) go(w, { ...S.N.get(w.from), id: w.from });
				}
				const nb = P_.fl[fi.i].busy;
				if (nb && nb.gid === "me") {
					me.waitKey = null;
					hint(null);
					toast(
						`${cap(wName(fi.ws[0].id))} отступила - стая наша, можно нападать.`,
					);
				}
			}
			if (
				P_.fl.every((x) => !F.stateOf(x, S.now).alive) &&
				S.hl.includes(fi.place)
			) {
				S.hl = S.hl.filter((x) => x !== fi.place);
				drawHl();
			}
			drawMarks();
			drawMini();
			header();
			renderSide();
		}
		function reward(n, ids, ws) {
			const full = TIER[tierOf(n)].gold * S.d.star;
			const lim = S.daily < DAILY;
			if (lim) S.daily++;
			const split = F.splitReward({ gold: full }, ids);
			const got = lim ? (split["me:0"] || {}).gold || 0 : 0;
			S.gold += got;
			S.last = {
				name: S.P.get(n.id).name,
				full,
				fighters: ids.length,
				groups: ws.length,
				got,
				lim,
			};

			toast(
				S.debug
					? lim
						? `Стая убита! +${got} монет (заглушка)${ids.length > 5 ? ` (5 долей на ${ids.length})` : ""}`
						: `Стая убита. Награды за сегодня кончились (${DAILY} из ${DAILY}).`
					: `Стая «${S.P.get(n.id).name.replace(" (свита)", "")}» убита! Награды пока нет - бои на карте округа в разработке.`,
			);
		}

		function exitNear(w) {
			const n = w.at ? S.N.get(w.at) : null;
			if (n && n.kind === "exit") return n;
			return (
				S.sch.nodes
					.filter(
						(x) => x.kind === "exit" && dist(x, w) < (G ? G.cell * 1.1 : 12),
					)
					.sort((a, b) => dist(a, w) - dist(b, w))[0] || null
			);
		}
		function districtIdx(id) {
			const i = DATA.districts.findIndex((x) => x.id === id);
			if (i >= 0) return i;
			const t = (DATA.W.territories || []).find((x) => x.id === id);
			if (!t) return -1;
			const sch = DG.generate({ W: DATA.W, id });
			if (!sch) return -1;
			const nb = {};
			for (const n of sch.nodes)
				if (n.kind === "exit") {
					const x = DATA.W.territories.find((q) => q.id === n.to);
					nb[n.to] = x ? x.name : n.to;
				}
			DATA.districts.push({
				id,
				level: DATA.levels[id] || +t.recLevel || 1,
				name: t.name,
				star: sch.star,
				biome: t.biome,
				biomeName: (DATA.W.biomes || {})[t.biome] || t.biome,
				town: (t.town && t.town.name) || "город",
				owner: "none",
				nb,
				nbs: [],
				sch,
				gen: true,
			});
			return DATA.districts.length - 1;
		}
		function exitDlg(ex) {
			const to = ex.to,
				name = S.d.nb[to] || to,
				t = (DATA.W.territories || []).find((x) => x.id === to),
				have = DATA.districts.find((x) => x.id === to);
			const star = have ? have.star : (t && t.star) || null,
				lv = have ? have.level : DATA.levels[to];
			dlg(
				`Перейти в округ «${name}»?`,
				`<p>${ex.trail ? "Просёлок" : "Тракт"} уходит в соседний округ${star ? ` ${"★".repeat(star)}` : ""}${lv ? `, монстры от ур. ${lv}` : ""}.</p><p class="mute">Отряд окажется у указателя на этой стороне границы.</p>`,
				[
					{ t: "Перейти", fn: () => goDistrict(to, S.d.id) },
					{ t: "Остаться", cls: "ghost" },
				],
			);
		}

		let going = false;
		function goDistrict(to, from) {
			if (X.refill && !DATA.districts.some((x) => x.id === to && x.full)) {
				if (going) return;
				going = true;
				toast("Переходим в соседний округ...");
				X.refill(to).then(
					(dd) => {
						going = false;
						if (DEAD) return;
						if (!dd) {
							toast("Соседний округ не загрузился - проверь связь", true);
							return;
						}
						const k = DATA.districts.findIndex((x) => x.id === to);
						if (k >= 0) DATA.districts[k] = dd;
						else DATA.districts.push(dd);
						enterDistrict(to, from);
					},
					(e) => {
						going = false;
						console.warn("[карта округа] сосед", e);
						toast("Соседний округ не загрузился", true);
					},
				);
				return;
			}
			enterDistrict(to, from);
		}
		function enterDistrict(to, from) {
			const i = districtIdx(to);
			if (i < 0) {
				toast("Схему округа построить не вышло", true);
				return;
			}
			load(i);
			const back = S.sch.nodes.find((n) => n.kind === "exit" && n.to === from);
			if (back) {
				putAt(me, back.id);
				S.sel = back.id;
				centerOn(back, Z(1));
				drawWalkers(true);
				drawMarks();
				renderSide();
			}
			toast(`Вы в округе «${S.d.name}»`);
		}
		function arrive(w) {
			const id = w.at,
				n = id ? S.N.get(id) : null;
			if (w.mine && S.queue.length) {
				const t = S.queue.shift();
				const r = go(me, t);
				if (r === true) {
					S.flag = t;
					drawFlag();
					drawRoute();
					renderSide();
					return;
				}
				S.queue = [];
				toast("Дальше по точкам не пройти - путь закрыт", true);
			}
			if (w.mine && w.enter) {
				w.enter = false;
				if (id === S.gate.id && !bossLive()) {
					enterTown();
					return;
				}
			}
			if (w.mine && w.gather != null) {
				const gi = w.gather;
				w.gather = null;
				gather(gi);
			}
			if (w.mine) {
				const ex = exitNear(w);
				if (ex) {
					S.sel = ex.id;
					S.flag = null;
					drawFlag();
					renderSide();
					exitDlg(ex);
					return;
				}
			}
			if (w.mine) {
				S.sel = id;
				S.flag = null;
				drawFlag();
				if (w.pend) {
					const pd = w.pend;
					w.pend = null;
					if (pd.id === id && S.P.has(id)) {
						flockClick(id, pd.i);
						return;
					}
				}
				if (isPack(n)) {
					const ps = pst(id),
						pk = F.pickFlock(S.P.get(id).fl, S.now);
					if (ps.passable)
						toast(
							`Стоянка «${S.P.get(id).name}» пуста - все стаи убиты, вернутся через ${mmss(ps.backIn)}`,
						);
					else if (pk.i === null) busyHint(id);
					else toast(`Пришли. Свободных стай: ${ps.free} из ${ps.n} - нападай`);
				} else if (n && n.kind === "spot" && S.ev.has(id)) eventDlg(id);
				else if (n && n.kind === "way")
					toast(`${n.name}: здесь тихо. Позже - события и путники.`);
				else if (n && n.kind === "lair")
					toast("У логова. «Сбор у логова» - в панели.");
				renderSide();
				drawMarks();
				return;
			}
			if (isPack(n)) {
				const pk = F.pickFlock(S.P.get(id).fl, S.now);
				if (pk.i !== null && (w.autoFight || w.ai)) {
					attack(w, id, pk.i);
					return;
				}
			}
			if (w.ai) w.idle = 1;
		}
		function busyHint(id) {
			const P_ = S.P.get(id);
			const fights = P_.fl
				.map((f, i) => ({ f, i }))
				.filter((x) => x.f.busy && F.stateOf(x.f, S.now).alive);
			const ours = fights.find(
				(x) =>
					x.f.busy.guild === "ours" &&
					x.f.busy.fight &&
					F.canHelp(x.f, idsOf(me)).ok,
			);
			const who = fights
				.map((x) => `${wName(x.f.busy.gid)} (${x.f.busy.ids.length})`)
				.join(", ");
			hint(`<b>Все живые стаи стоянки «${esc(P_.name)}» заняты:</b> ${esc(who)}.
        ${ours ? "Своя гильдия в бою - можно вступить в бой: награда 5 долей на всех." : "Ждать или уйти к другой стае. Напасть на чужую группу - с этапа 4."}
        <br>${ours ? `<button class="gl-mini" data-act="help" data-v="${fKey(id, ours.i)}">Вступить в бой</button>` : ""}<button class="gl-mini" data-act="wait" data-v="${fights[0] ? fights[0].i : 0}">Ждать</button><button class="gl-mini" data-act="leave">Уйти к другой стае</button>`);
		}
		function eventDlg(id) {
			dlg(
				"Путник на поляне",
				`<p>«Помоги, добрый человек: телега увязла, а волки близко!»</p><p class="mute">Заглушка под будущие случайные события и микро-квесты (идея стримера 21.11). Здесь - сразу награда.</p>`,
				[
					{
						t: "Помочь",
						fn: () => {
							S.ev.delete(id);
							S.gold += 15;
							toast("Путник благодарит: +15 монет (заглушка)");
							drawMarks();
							renderSide();
							setTimeout(() => {
								const sp = S.sch.nodes.filter(
									(n) => n.kind === "spot" && !S.ev.has(n.id) && n.id !== id,
								);
								if (sp.length) {
									S.ev.add(sp[Math.floor(Math.random() * sp.length)].id);
									drawMarks();
								}
							}, 20000);
						},
					},
					{ t: "Мимо", cls: "ghost" },
				],
			);
		}

		function nearestFree(w, taken) {
			const live = liveSet();
			const from = w.at || null;
			if (!from) return null;
			const { D } = dijkstra(from, live);
			let best = null,
				bd = Infinity;
			for (const [id, p] of S.P) {
				const n = S.N.get(id);
				if (
					n.kind === "elite" ||
					n.escort ||
					p.mark === "leave" ||
					(id === from && false)
				)
					continue;
				const free =
					pst(id).free -
					(taken ? taken.get(id) || 0 : 0) -
					S.W.filter(
						(x) =>
							x !== w && x.state === "walk" && x.target && x.target.id === id,
					).length;
				if (free <= 0) continue;
				const d = D.get(id);
				if (d == null) continue;
				const score = d - (p.mark === "first" ? 4000 : 0);
				if (score < bd) {
					bd = score;
					best = id;
				}
			}
			return best;
		}

		let lastT = performance.now(),
			uiT = 0;
		function step(dt) {
			S.now += dt * 1000 * S.timeMul;
			let ch = false;
			for (const [id, P_] of S.P) {
				let back = false;
				P_.fl.forEach((f, i) => {
					if (!f.alive && f.back <= S.now) {
						P_.fl[i] = F.refresh(f, S.now);
						back = true;
					}
				});
				if (!back) continue;
				ch = true;
				for (const w of S.W)
					if (w.state === "walk" && w.pts) {
						const ahead =
							w.pts.slice(w.seg + 1, -1).some((p) => p.id === id) ||
							(w.glades || []).includes(id);
						if (!ahead || (w.target && w.target.id === id)) continue;
						const r = go(w, w.target, { autoFight: w.autoFight });
						if (r !== true) {
							w.pts = w.pts.slice(0, w.seg + 2);
							if (w.mine)
								toast(`Стая «${P_.name}» вернулась и закрыла дорогу`, true);
						}
					}
			}
			if (ch) {
				drawMarks();
				drawMini();
				header();
			}
			const v = speed();
			for (const w of S.W) {
				if (w.state === "walk") {
					let tm = dt;
					while (tm > 0 && w.state === "walk") {
						const a = w.pts[w.seg],
							b = w.pts[w.seg + 1],
							d = Math.max(1e-6, dist(a, b)),
							sv = v * segK(a, b);
						const left = (1 - w.t) * d,
							mv = sv * tm;
						if (mv < left) {
							w.t += mv / d;
							tm = 0;
						} else {
							tm -= left / sv;
							w.seg++;
							w.t = 0;
							if (w.seg >= w.pts.length - 1) {
								const last = w.pts[w.pts.length - 1];
								w.at = last.id || null;
								w.x = last.x;
								w.y = last.y;
								w.state = "idle";
								w.pts = null;
								w.target = null;
								w.glades = [];
								arrive(w);
								if (w.mine && w.hunt) {
									toast(
										`Дошли до ${wName(w.hunt)}. Нападение на группу - бой групп этапа 4 (в прототипе заглушка)`,
										true,
									);
									w.hunt = null;
								}
							}
						}
					}
					S._rt = true;
				} else if (w.ai && w.state === "idle") {
					w.idle -= dt * S.walkMul;
					if (w.idle <= 0) {
						const t = w.at && nearestFree(w);
						if (t) {
							const n = S.N.get(t);
							if (go(w, { x: n.x, y: n.y, id: t }) !== true) w.idle = 3;
						} else w.idle = 3;
					}
				}
				const p = wPos(w);
				w.x = p.x;
				w.y = p.y;
			}
			if (S._rt) {
				drawRoute();
				S._rt = S.W.some((w) => w.state === "walk");
			}
			for (const [key, fi] of S.fights) {
				fi.t += dt * S.walkMul;
				if (fi.t >= fi.dur) endFight(key);
			}
			drawWalkers();
			if (S.follow) {
				const tx = vpW() / 2 - (me.x - S.B.x0) * K * C.z,
					ty = vpH() / 2 - (me.y - S.B.y0) * K * C.z;
				const k = Math.min(1, dt * 3);
				C.x += (tx - C.x) * k;
				C.y += (ty - C.y) * k;
				applyCam();
			}
			uiT += dt;
			if (uiT > 0.25) {
				uiT = 0;
				liveUi();
				gatherTick();
				drawProg();
				if (S.pop && S.pop.res != null) renderPop();
				if ((S.res || []).some((r) => r.back > S.now)) drawResLayer();
			}
		}
		function frame(t) {
			const dt = Math.min(0.1, (t - lastT) / 1000);
			lastT = t;
			if (DEAD) return;
			if (!document.hidden) step(dt);
			requestAnimationFrame(frame);
		}

		function circ(cx, cy, r) {
			return `M${(cx - r).toFixed(1)} ${cy.toFixed(1)}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0z`;
		}
		function segD(p, a, b) {
			const dx = b.x - a.x,
				dy = b.y - a.y,
				L = dx * dx + dy * dy;
			const t = L ? clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / L, 0, 1) : 0;
			return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy);
		}

		function trees(poly, b, seed, st, keep, avoid) {
			const r = WL.rng(WL.hash(seed)),
				B = S.B;
			let crown = "",
				shade = "",
				light = "";
			for (let y = B.y0 - 200; y < B.y1 + 200; y += st)
				for (let x = B.x0 - 200; x < B.x1 + 200; x += st) {
					const p = {
						x: x + (r() - 0.5) * st * 0.9,
						y: y + (r() - 0.5) * st * 0.9,
					};
					if (r() > keep) continue;
					if (poly && !DG.inPoly(poly, p.x, p.y)) continue;
					if (avoid && avoid(p)) continue;
					const s = 4 + r() * 3.5;
					if (b.shape === "pine") {
						shade += `M${(p.x - s * 0.9).toFixed(1)} ${(p.y + s * 0.9).toFixed(1)}h${(s * 1.8).toFixed(1)}l${(-s * 0.9).toFixed(1)} ${(-s * 2.6).toFixed(1)}z`;
						crown += `M${(p.x - s * 0.75).toFixed(1)} ${(p.y + s * 0.6).toFixed(1)}h${(s * 1.4).toFixed(1)}l${(-s * 0.7).toFixed(1)} ${(-s * 2.4).toFixed(1)}z`;
					} else {
						shade += circ(p.x + 1.2, p.y + 1.6, s);
						crown += circ(p.x, p.y, s);
						light += circ(p.x - s * 0.3, p.y - s * 0.35, s * 0.35);
					}
				}
			return `<path d="${shade}" fill="rgba(0,0,0,.18)"/><path d="${crown}" fill="${b.tree}" stroke="${b.tree2}" stroke-width=".8"/><path d="${light}" fill="rgba(255,255,255,.18)"/>`;
		}

		function neighborsArt() {
			const B = S.B,
				M = 260;
			let s = "";
			for (const nb of S.d.nbs || []) {
				const b = bio(nb.biome),
					c = nb.contour;
				let inBox = false;
				for (let k = 0; k < c.length; k += 2)
					if (
						c[k] > B.x0 - M &&
						c[k] < B.x1 + M &&
						c[k + 1] > B.y0 - M &&
						c[k + 1] < B.y1 + M
					) {
						inBox = true;
						break;
					}
				if (!inBox) continue;
				s +=
					`<polygon points="${c.join(" ")}" fill="${b.land}" stroke="${b.edge}" stroke-width="4"/>` +
					trees(c, b, "nb:" + nb.id, 26, 0.5, null);
			}
			s += `<rect x="${B.x0 - 3000}" y="${B.y0 - 3000}" width="${B.w + 6000}" height="${B.h + 6000}" fill="#e8eef0" opacity=".5"/>`;

			for (const n of S.sch.nodes)
				if (n.kind === "exit" && !n.trail) {
					const c = { x: (S.B.x0 + S.B.x1) / 2, y: (S.B.y0 + S.B.y1) / 2 },
						L = Math.hypot(n.x - c.x, n.y - c.y) || 1;
					const x = n.x + ((n.x - c.x) / L) * 46,
						y = n.y + ((n.y - c.y) / L) * 46;
					s += `<text x="${x.toFixed(0)}" y="${y.toFixed(0)}" class="lbl nbl">${esc(S.d.nb[n.to] || n.to)}</text>`;
				}
			return s;
		}
		function stubArt() {
			const sch = S.sch,
				b = bio(S.d.biome),
				B = S.B,
				N = S.N;
			const poly = sch.contour ? sch.contour.join(" ") : "";
			const segs = sch.edges.map((e) => [N.get(e.a), N.get(e.b), e]);
			const avoid = (p) => {
				for (const n of sch.nodes) {
					const lim =
						n.kind === "town"
							? 70
							: n.kind === "spot" || isPack(n)
								? 22
								: n.kind === "tract"
									? 12
									: 18;
					if (dist(n, p) < lim) return true;
				}
				for (const m of sch.marks || []) if (dist(m, p) < m.r + 6) return true;
				for (const [u, v, e] of segs)
					if (segD(p, u, v) < (e.tract ? 14 : e.trail ? 8 : 10)) return true;
				return false;
			};

			let gridWater = "",
				gridWood = "";
			if (G && G.real) {
				for (let j = 0; j < G.h; j++)
					for (let i = 0; i < G.w; i++) {
						const ch = G.rows[j][i],
							x = G.x0 + i * G.cell,
							y = G.y0 + j * G.cell;
						if (ch === "~")
							gridWater += `M${x} ${y}h${G.cell}v${G.cell}h${-G.cell}z`;
						else if (ch === "#")
							gridWood += `M${x} ${y}h${G.cell}v${G.cell}h${-G.cell}z`;
					}
			}
			const avoidT =
				G && G.real
					? (p) => {
							const c = cellOf(p);
							return !G.rows[c.j] || G.rows[c.j][c.i] !== "#";
						}
					: avoid;
			let trails = "",
				roads = "",
				tract = "";
			for (const [u, v, e] of segs) {
				if (u.kind === "town" || v.kind === "town") continue;
				const d = `M${u.x} ${u.y}L${v.x} ${v.y}`;
				if (e.tract) tract += d;
				else if (e.trail) trails += d;
				else roads += d;
			}
			let clear = "";
			for (const n of sch.nodes)
				if (n.kind === "spot") clear += circ(n.x, n.y, 15);
				else if (isPack(n)) clear += circ(n.x, n.y, 13 + (n.n || 1) * 2);
				else if (n.kind === "way") clear += circ(n.x, n.y, 10);
			let lakes = "",
				rocks = "";
			for (const m of sch.marks || []) {
				if (m.kind === "lake") lakes += circ(m.x, m.y, m.r);
				else rocks += circ(m.x, m.y, m.r * 0.8);
			}
			const t = S.town,
				g = S.gate,
				ang = Math.atan2(g.y - t.y, g.x - t.x),
				R = 36;
			let wall = "",
				towers = "";
			for (let k = 0; k <= 12; k++) {
				const a = ang + (k / 12) * Math.PI * 2;
				wall += `${k ? "L" : "M"}${(t.x + Math.cos(a) * R).toFixed(1)} ${(t.y + Math.sin(a) * R).toFixed(1)}`;
				if (k < 12)
					towers += circ(t.x + Math.cos(a) * R, t.y + Math.sin(a) * R, 4.2);
			}
			const r = WL.rng(WL.hash("town:" + sch.id));
			let houses = "";
			for (let k = 0; k < 16; k++) {
				const a = r() * Math.PI * 2,
					L = r() * 26;
				const hx = t.x + Math.cos(a) * L,
					hy = t.y + Math.sin(a) * L;
				houses += `M${(hx - 4).toFixed(1)} ${(hy - 3).toFixed(1)}h8v6h-8z`;
			}
			const L = S.lair;
			return `<rect x="${B.x0 - 3000}" y="${B.y0 - 3000}" width="${B.w + 6000}" height="${B.h + 6000}" fill="${b.out}"/>${neighborsArt()}
        ${poly ? `<polygon points="${poly}" fill="${b.land}" stroke="${b.edge}" stroke-width="5" stroke-linejoin="round"/>` : ""}
        <path d="${clear}" fill="${b.clear}" opacity=".75"/><path d="${circ(L.x, L.y, 30)}" fill="#5a4636" opacity=".45"/>
        <path d="${lakes}" fill="#5ab4d2" stroke="#3f8fb8" stroke-width="3"/><path d="${rocks}" fill="#a39a8c" stroke="#6e5852" stroke-width="3"/>
        <path d="${trails}" stroke="${b.trail}" stroke-width="2.6" stroke-linecap="round" fill="none" stroke-dasharray="5 3"/>
        <path d="${roads}" stroke="#7a5a32" stroke-width="7" stroke-linecap="round" fill="none" opacity=".55"/><path d="${roads}" stroke="${b.trail}" stroke-width="4.5" stroke-linecap="round" fill="none"/>
        <path d="${tract}" stroke="#6b5a40" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="${tract}" stroke="${b.tract}" stroke-width="8.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <path d="${tract}" stroke="#b9a57a" stroke-width="1" stroke-dasharray="3 6" fill="none"/><path d="M${t.x} ${t.y}L${g.x} ${g.y}" stroke="${b.tract}" stroke-width="8"/>
        <path d="${gridWood}" fill="${b.tree2}" opacity=".35"/><path d="${gridWater}" fill="#5ab4d2"/>
        ${trees(sch.contour, b, "art:" + sch.id, 22, G && G.real ? 0.85 : 0.65, avoidT)}
        <path d="${circ(t.x, t.y, R)}" fill="#cdb894"/><path d="${houses}" fill="#b0583a" stroke="#4a2f22" stroke-width=".8"/>
        <path d="${wall}" fill="none" stroke="#6e6258" stroke-width="5.5" stroke-linejoin="round"/><path d="${towers}" fill="#8a7d70" stroke="#3e352e" stroke-width="1"/>`;
		}

		const ART_LIVE_K = 0.6,
			schCache = new Map();
		function schOf(id) {
			if (!schCache.has(id)) {
				const d = DATA.districts.find((x) => x.id === id);
				schCache.set(id, d ? d.sch : DG.generate({ W: DATA.W, id }));
			}
			return schCache.get(id);
		}
		function liveArt(d) {
			if (
				d.bake ||
				d.art ||
				d._artBusy ||
				!window.LGDistrictArt ||
				!window.LGTownKitArt
			)
				return;
			d._artBusy = true;
			toast(`Рисую карту округа «${d.name}»...`);
			setTimeout(() => {
				try {
					const t = DATA.W.territories.find((x) => x.id === d.id),
						nb = ((t && t.nb) || []).map(schOf).filter(Boolean);
					const r = LGDistrictArt.draw(d.sch, {
						A: LGTownKitArt,
						town: DATA.towns[d.id] || null,
						towns: DATA.towns,
						names: d.nb,
						neighbors: nb,
					});

					const blob = URL.createObjectURL(
							new Blob([r.svg], { type: "image/svg+xml" }),
						),
						box = {
							x0: r.x0,
							y0: r.y0,
							w: r.W / r.k,
							h: r.H / r.k,
							live: true,
						};
					const done = (img, how) => {
						d.art = { img, ...box, how };
						d._artBusy = false;
						if (S.d === d) {
							drawMap();
							toast("Рисунок округа готов");
						}
					};
					const toCanvas = (src, next) => {
						const img = new Image();
						img.onload = () => {
							try {
								const cv = document.createElement("canvas");
								cv.width = Math.round(r.W * ART_LIVE_K);
								cv.height = Math.round(r.H * ART_LIVE_K);
								cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
								const out = cv.toDataURL("image/webp", 0.8);
								if (out.length < 1000) throw new Error("пустой canvas");
								URL.revokeObjectURL(blob);
								done(out, "canvas");
							} catch (e) {
								console.warn("рисунок округа: canvas", e);
								next();
							}
						};
						img.onerror = (e) => {
							console.warn(
								"рисунок округа: картинка не загрузилась",
								src.slice(0, 30),
								e,
							);
							next();
						};
						img.src = src;
					};

					const first = window.__inline ? (src, next) => next() : toCanvas;
					first(
						"data:image/svg+xml;charset=utf-8," + encodeURIComponent(r.svg),
						() =>
							first(blob, () => {
								URL.revokeObjectURL(blob);
								d.art = {
									inline: r.svg
										.replace(/^<svg[^>]*>/, "")
										.replace(/<\/svg>\s*$/, ""),
									vw: r.W,
									vh: r.H,
									...box,
									how: "inline",
								};
								d._artBusy = false;
								if (S.d === d) {
									drawMap();
									toast("Рисунок округа готов");
								}
							}),
					);
				} catch (e) {
					d._artBusy = false;
					toast("Рисунок не вышел: " + e.message, true);
				}
			}, 60);
		}

		function bakeLevel(b) {
			const L = (b.levels || [])
				.map(Number)
				.filter((x) => x > 0 && b.tiles && b.tiles[String(x)])
				.sort((x, y) => x - y);
			if (!L.length) return null;
			const need =
				(K * C.z * Math.min(2, window.devicePixelRatio || 1)) / (+b.k || K);
			return L.find((x) => x >= need * 0.9) || L[L.length - 1];
		}
		function bakeArt(b) {
			const L = bakeLevel(b);
			if (L == null) return null;
			const T = +b.T || 512,
				k = +b.k || K,
				ws = T / (k * L),
				px = ws / T,
				tiles = b.tiles[String(L)];
			let s = "";
			for (const [ij, f] of Object.entries(tiles)) {
				const [i, j] = ij.split(",").map(Number);
				if (!Number.isFinite(i) || !Number.isFinite(j) || !/^[\w.-]+$/.test(f))
					continue;

				s += `<image href="/site/districtbake/${f}" x="${(b.x0 + i * ws - px).toFixed(3)}" y="${(b.y0 + j * ws - px).toFixed(3)}" width="${(ws + 2 * px).toFixed(3)}" height="${(ws + 2 * px).toFixed(3)}" preserveAspectRatio="none"/>`;
			}
			S.bakeL = L;
			return s;
		}
		let bakeT = 0;
		function bakeCheck() {
			if (!S.d || !S.d.bake || S.artPref !== "real") return;
			clearTimeout(bakeT);
			bakeT = setTimeout(() => {
				if (DEAD || !S.d.bake) return;
				if (bakeLevel(S.d.bake) !== S.bakeL) {
					const g = $("art");
					if (g) g.innerHTML = realArt() || "";
				}
			}, 250);
		}

		function bakeFail(d, f) {
			if (!d || !d.bake || DEAD) return;
			console.warn(
				"[карта округа] плитки не загрузились - рисуем сами",
				d.id,
				f || "",
			);
			d.bake = null;
			bakeBadAdd(d.id);
			if (S.d === d) drawMap();
		}
		function bakeProbe(d) {
			if (!d.bake || d._bakeProbe) return;
			const f = RL.bakeProbe(d.bake, bakeLevel(d.bake));
			if (!f) return;
			d._bakeProbe = true;
			const img = new Image();
			img.onerror = () => bakeFail(d, f);
			img.src = "/site/districtbake/" + f;
		}
		const mapEl = $("map");
		if (mapEl && mapEl.addEventListener)
			listen(
				mapEl,
				"error",
				(e) => {
					const t = e.target,
						h = t && t.getAttribute ? t.getAttribute("href") || "" : "";
					if (h.startsWith("/site/districtbake/")) bakeFail(S.d, h);
				},
				true,
			);
		function realArt() {
			if (S.d.bake) {
				const t = bakeArt(S.d.bake);
				if (t) {
					bakeProbe(S.d);
					const B = S.B;
					return `<rect x="${B.x0 - 3000}" y="${B.y0 - 3000}" width="${B.w + 6000}" height="${B.h + 6000}" fill="#2f4a2c"/>${t}`;
				}
			}
			const a = S.d.art;
			if (!a) return null;

			const B = S.B;
			return `<rect x="${B.x0 - 3000}" y="${B.y0 - 3000}" width="${B.w + 6000}" height="${B.h + 6000}" fill="#2f4a2c"/>${a.inline ? `<svg x="${a.x0}" y="${a.y0}" width="${a.w}" height="${a.h}" viewBox="0 0 ${a.vw} ${a.vh}" preserveAspectRatio="none">${a.inline}</svg>` : `<image href="${a.img}" x="${a.x0}" y="${a.y0}" width="${a.w}" height="${a.h}" preserveAspectRatio="none"/>`}
  `;
		}
		const DEFS = `<defs>
      <symbol id="dmi-fang" viewBox="-10 -10 20 20"><path d="M-5-3l2 7 2-5 1 5 2-5 1 5 2-7z" fill="#fff" stroke="#2b1d18" stroke-width="1.2" stroke-linejoin="round"/></symbol>
      <symbol id="dmi-skull" viewBox="-10 -10 20 20"><path d="M-5 1a5 5.5 0 1 1 10 0v2h-2v2h-6v-2h-2z" fill="#fff" stroke="#2b1d18" stroke-width="1.2"/><circle cx="-2" cy="0" r="1.4" fill="#2b1d18"/><circle cx="2" cy="0" r="1.4" fill="#2b1d18"/></symbol>
      <symbol id="dmi-swords" viewBox="-10 -10 20 20"><path d="M-6-6l11 11M6-6l-11 11" stroke="#2b1d18" stroke-width="4" stroke-linecap="round"/><path d="M-6-6l11 11M6-6l-11 11" stroke="#fff" stroke-width="2" stroke-linecap="round"/></symbol>
      <pattern id="dmhatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="rgba(20,15,10,.28)"/><path d="M0 0V6" stroke="rgba(255,255,255,.55)" stroke-width="1.6"/></pattern>
    </defs>`;
		function drawMap() {
			const B = S.B,
				svg = $("map");
			svg.setAttribute("width", (B.w * K).toFixed(0));
			svg.setAttribute("height", (B.h * K).toFixed(0));
			svg.setAttribute("viewBox", `${B.x0} ${B.y0} ${B.w} ${B.h}`);
			if (S.artPref == null)
				S.artPref =
					S.art === "stub" && Q.get("art") === "stub" ? "stub" : "real";
			if (S.artPref === "real" && !S.d.art) liveArt(S.d);
			const art = S.artPref === "real" ? realArt() : null;
			S.art = art ? "real" : "stub";
			svg.innerHTML =
				DEFS.replace("</defs>", monSyms() + "</defs>") +
				`<g id="dm-art">${art || stubArt()}</g><g id="dm-grid"></g><g id="dm-hl"></g><g id="dm-plan"></g><g id="dm-route"></g><g id="dm-flag"></g><g id="dm-csel" pointer-events="none"></g><g id="dm-hovn" opacity="0" pointer-events="none"></g><rect id="dm-hov" x="0" y="0" width="1" height="1" opacity="0" pointer-events="none"/><g id="dm-lres"></g><g id="dm-marks"></g><g id="dm-walk"></g><g id="dm-lstack"></g><g id="dm-lmarks"></g>`;
			drawGrid();
			drawResLayer();
			drawMarks();
			drawHl();
			drawRoute();
			drawPlan();
			drawFlag();
			drawWalkers(true);
			drawMarkLayer();
			drawProg();
		}

		function drawGrid() {
			const g = $("grid");
			if (!g) return;
			if (!S.showGrid || !G) {
				g.innerHTML = "";
				return;
			}
			let bad = "",
				shut = "",
				lines = "";
			const live = liveSet();
			for (let j = 0; j < G.h; j++)
				for (let i = 0; i < G.w; i++) {
					const ch = G.rows[j][i];
					if (ch === " ") continue;
					const x = G.x0 + i * G.cell,
						y = G.y0 + j * G.cell;
					if (!".=".includes(ch))
						bad += `M${x} ${y}h${G.cell}v${G.cell}h${-G.cell}z`;
					else {
						const gl = gladeAt(i, j);
						if (gl && live.has(gl))
							shut += `M${x} ${y}h${G.cell}v${G.cell}h${-G.cell}z`;
					}
					lines += `M${x} ${y}h${G.cell}M${x} ${y}v${G.cell}`;
				}
			g.innerHTML = `<path d="${bad}" fill="url(#dmhatch)"/><path d="${shut}" fill="rgba(226,57,43,.22)"/><path d="${lines}" stroke="rgba(255,255,255,.45)" stroke-width=".5" fill="none"/>`;
		}
		function flockSvg(n, P_, i, R, x, y) {
			const f = P_.fl[i],
				st = F.stateOf(f, S.now),
				t = TIER[tierOf(n)];
			let s = `<g transform="translate(${x},${y})">`;
			if (st.alive) {
				s += `<g class="wd w${P_.wd[i]}" style="animation-delay:${(P_.dl[i] - performance.now() / 1000).toFixed(2)}s"><ellipse cx="0" cy="${R * 0.8}" rx="${R * 0.9}" ry="${R * 0.35}" fill="rgba(0,0,0,.25)"/>
          ${hasMon(P_.stack && P_.stack.squad[0].mon) ? monUse(P_.stack.squad[0].mon, iconTier(n), R) : `<circle r="${R}" fill="${t.c}" stroke="#2b1d18" stroke-width="1.5"/>`}${n.escort ? `<path d="M${-R * 0.8} ${-R * 0.55}l${R * 0.4} ${-R * 0.75} ${R * 0.4} ${R * 0.45} ${R * 0.4} ${-R * 0.6} ${R * 0.4} ${R * 0.6} ${R * 0.4} ${-R * 0.45} ${R * 0.4} ${R * 0.75}z" fill="#ffd34a" stroke="#2b1d18" stroke-width=".9"/>` : ""}
          ${hasMon(P_.stack && P_.stack.squad[0].mon) ? "" : `<use href="${n.kind === "elite" ? "#dmi-skull" : "#dmi-fang"}" x="${-R * 0.75}" y="${-R * 0.75}" width="${R * 1.5}" height="${R * 1.5}"/>`}</g>`;
				if (f.busy) {
					const by = S.W.find((w) => w.id === f.busy.gid);
					const col = by ? (by.mine ? "#ffcf4a" : GUILD[by.guild].c) : "#888";
					s += `<g transform="translate(${R * 0.85},${-R * 0.85})"><g class="${f.busy.fight ? "clash" : ""}"><circle r="4.2" fill="${col}" stroke="#2b1d18" stroke-width="1"/><use href="#dmi-swords" x="-3.3" y="-3.3" width="6.6" height="6.6"/></g></g>${(+f.busy.parts || 1) > 1 ? `<g transform="translate(${-R * 0.85},${-R * 0.85})"><circle r="4" fill="#3d7be0" stroke="#2b1d18" stroke-width="1"/><text y="2.2" style="font:900 5.5px system-ui;text-anchor:middle;fill:#fff">2</text></g>` : ""}`;
				}
			} else
				s += `<circle r="${R * 0.82}" fill="#8d8478" stroke="#3e352e" stroke-width="1.1" opacity=".9"/><path d="M-2.6-2.6l5.2 5.2M2.6-2.6l-5.2 5.2" stroke="#3e352e" stroke-width="1.5" stroke-linecap="round"/>`;
			s += lvlBadge(lvlOf(n), -R * 0.95, R * 0.85, !st.alive);

			if (st.alive && x === 0 && y === 0)
				s += `<text class="lbl m mn" y="${(R + (S.fights.has(fKey(n.id, i)) ? 10.5 : 7)).toFixed(1)}">${esc(P_.name.replace(" (свита)", ""))}</text>`;
			const fi = S.fights.get(fKey(n.id, i));
			if (fi && x === 0 && y === 0)
				s += `<g transform="translate(${-R},${R + 2.5})"><rect width="${2 * R}" height="2.6" rx="1.3" fill="rgba(0,0,0,.45)"/><rect data-fb="${fKey(n.id, i)}" width="${2 * R}" height="2.6" rx="1.3" fill="#ffcf4a" transform="scale(${(fi.t / fi.dur).toFixed(3)},1)"/></g>`;
			return s + "</g>";
		}

		function packMap(n, isSel) {
			const P_ = S.P.get(n.id),
				k = P_.fl.length,
				pts = flockPts(n),
				R = n.kind === "elite" ? 9 : n.escort ? 7.5 : 7,
				ps = pst(n.id);
			let s = `<g class="nd" data-id="${n.id}"><title>${esc(nodeName(n))}</title>`;
			if (k > 1)
				s += `<circle cx="${n.x}" cy="${n.y}" r="${((S.sch.gap || 75) * 0.45).toFixed(1)}" fill="none" stroke="rgba(43,29,24,.35)" stroke-width="1.2" stroke-dasharray="3 3"/>`;
			pts.forEach((p, i) => {
				const fsel = isSel && (S.selFlock == null || S.selFlock === i);
				s += `<g data-f="${n.id}:${i}" transform="translate(${p.x.toFixed(1)},${p.y.toFixed(1)})"><g class="sc">${fsel ? `<circle class="pulse" r="${R + 5}" fill="none" stroke="#fff" stroke-width="2"/>` : ""}${flockSvg(n, P_, i, R, 0, 0)}</g></g>`;
			});
			s += `<g transform="translate(${n.x},${n.y})"><g class="sc">`;
			if (ps.passable)
				s += `<text class="lbl tm" y="${k > 1 ? 3 : R + 9}" data-tm="${n.id}">${mmss(ps.backIn)}</text>`;
			else if (k > 1)
				s += `<rect x="-6.5" y="-4.5" width="13" height="8" rx="3" fill="#2b1d18"/><text y="1.9" style="font:800 5.4px system-ui;text-anchor:middle;fill:#fff">${ps.alive}/${k}</text>`;
			if (P_.mark === "first")
				s += `<g transform="translate(${k > 1 ? -2 : -R - 6},${k > 1 ? -8 : -R - 4})"><path d="M0 6V-6" stroke="#2b1d18" stroke-width="1.2"/><path d="M0-6h7l-2 2.5 2 2.5h-7z" fill="#e2392b" stroke="#2b1d18" stroke-width=".8"/></g>`;
			if (P_.mark === "leave")
				s += `<g transform="translate(${k > 1 ? 0 : -R - 6},${k > 1 ? -10 : -R - 3})"><circle r="4" fill="#3d7be0" stroke="#2b1d18" stroke-width=".9"/><path d="M-2.2 0h4.4" stroke="#fff" stroke-width="1.6"/></g>`;
			return s + "</g></g></g>";
		}
		function packSvg(n) {
			const P_ = S.P.get(n.id),
				k = P_.fl.length,
				R = n.kind === "elite" ? 9 : k > 1 ? 5.8 : n.escort ? 7.5 : 7,
				ps = pst(n.id);
			let s = "";
			P_.fl.forEach((_, i) => {
				const [x, y] = SLOT[k - 1][i];
				s += flockSvg(n, P_, i, R, x, y);
			});
			if (ps.passable)
				s += `<text class="lbl tm" y="${R + 9}" data-tm="${n.id}">${mmss(ps.backIn)}</text>`;
			else if (k > 1)
				s += `<g transform="translate(${k === 3 ? 12 : 13},${k === 3 ? -9 : -7})"><rect x="-6" y="-4.5" width="12" height="8" rx="3" fill="#2b1d18"/><text y="1.9" style="font:800 5.4px system-ui;text-anchor:middle;fill:#fff">${ps.alive}/${k}</text></g>`;
			if (P_.mark === "first")
				s += `<g transform="translate(${-R - 8},${-R - 4})"><path d="M0 6V-6" stroke="#2b1d18" stroke-width="1.2"/><path d="M0-6h7l-2 2.5 2 2.5h-7z" fill="#e2392b" stroke="#2b1d18" stroke-width=".8"/></g>`;
			if (P_.mark === "leave")
				s += `<g transform="translate(${-R - 7},${-R - 3})"><circle r="4" fill="#3d7be0" stroke="#2b1d18" stroke-width=".9"/><path d="M-2.2 0h4.4" stroke="#fff" stroke-width="1.6"/></g>`;
			return s;
		}
		function nodeSvg(n) {
			const k = n.kind;
			if (isPack(n)) return packSvg(n);
			if (k === "lair") {
				const esc_ = S.A.get(n.id).filter((id) => S.P.has(id)),
					ea = esc_.filter((id) => placeLive(id)).length;
				return `${bossLive() && hasMon(S.bossMon) ? monUse(S.bossMon, "boss", 15) : `<circle r="15" fill="${bossLive() ? "#5a2a22" : "#7a7066"}" stroke="#2b1d18" stroke-width="2"/><use href="#dmi-skull" x="-10" y="-10" width="20" height="20"/>`}${bossLive() ? lvlBadge(lvlOf(n), -14, 11) : '<path d="M-10-10l20 20" stroke="#fff" stroke-width="2.5"/>'}
          <text class="lbl big" y="25">${bossLive() ? esc(S.bossName) : "Логово (босс побеждён)"}</text>${bossLive() && esc_.length ? `<text class="lbl m" y="32">свита: ${ea} из ${esc_.length}</text>` : ""}`;
			}
			if (k === "town")
				return `<circle class="hit" r="30"/><text class="lbl big" y="-2" style="font-size:8.5px">${esc(S.d.town)}</text><text class="lbl" y="6" style="${bossLive() ? "fill:#8a1f12" : "fill:#1f5a2a"}">${bossLive() ? "город держат монстры" : "город открыт"}</text>`;
			const real = S.art === "real";
			if (k === "gate")
				return `<rect x="-6" y="-6" width="12" height="12" rx="2" fill="#a8916c" stroke="#2b1d18" stroke-width="1.4"/><path d="M-3 6v-5a3 3 0 0 1 6 0v5" fill="#3e2a1a"/>${real ? "" : '<text class="lbl m" y="14">Ворота</text>'}`;
			if (k === "exit")
				return n.trail
					? `<path d="M0 6V-6" stroke="#5a3e24" stroke-width="1.5"/><path d="M-1-7h9l3 3-3 3h-9z" fill="#e8d4a2" stroke="#2b1d18" stroke-width="1"/>${real ? "" : `<text class="lbl m" y="13">просёлок → ${esc(S.d.nb[n.to] || n.to)}</text>`}`
					: `<path d="M0 8V-8" stroke="#5a3e24" stroke-width="2"/><path d="M-1-9h12l4 4-4 4h-12z" fill="#e8d4a2" stroke="#2b1d18" stroke-width="1.2"/><path d="M3-5h7" stroke="#2b1d18" stroke-width="1.2"/>${real ? "" : `<text class="lbl big" y="18">→ ${esc(S.d.nb[n.to] || n.to)}</text>`}`;
			if (k === "tract")
				return `<circle r="3.2" fill="#f4ead2" stroke="#6b5a40" stroke-width="1"/><circle class="hit" r="8"/>`;
			if (k === "cross")
				return `<path d="M-10 6l10-15 10 15z" fill="#e8b04a" stroke="#2b1d18" stroke-width="1.4"/><path d="M-3 6l3-6 3 6z" fill="#5a3e24"/><text class="lbl m" y="15">Перепутье</text>`;
			if (k === "dungeon")
				return `<path d="M-9 7v-8a9 9 0 0 1 18 0v8z" fill="#5d5c66" stroke="#2b1d18" stroke-width="1.4"/><path d="M-4 7v-6a4 4 0 0 1 8 0v6z" fill="#1d1a22"/><text class="lbl m" y="16">Данж</text>`;
			if (k === "way")
				return `<circle r="3.6" fill="#fff8e8" stroke="#2b1d18" stroke-width="1.1"/><path d="M0-3.6V-13" stroke="#2b1d18" stroke-width="1"/><path d="M0-13h7l-2 2 2 2h-7z" fill="#5fa8d0" stroke="#2b1d18" stroke-width=".7"/><circle class="hit" r="9"/><text class="lbl m" y="10">${esc(n.name || "")}</text>`;
			if (k === "spot") {
				if (!S.ev.has(n.id))
					return `<circle r="5" fill="none" stroke="rgba(60,40,20,.35)" stroke-width="1" stroke-dasharray="2 2"/><circle class="hit" r="10"/>`;
				return `<g class="bob"><circle cx="0" cy="-3" r="2.6" fill="#f2d2a8" stroke="#2b1d18" stroke-width=".8"/><path d="M-3 6l1-7h4l1 7z" fill="#8a6a3a" stroke="#2b1d18" stroke-width=".8"/><circle cx="7" cy="-9" r="4.6" fill="#ffcf4a" stroke="#2b1d18" stroke-width="1"/><text x="7" y="-6.6" style="font:900 7px system-ui;text-anchor:middle;fill:#2b1d18">!</text></g><circle class="hit" r="11"/>`;
			}
			return "";
		}
		function drawMarks() {
			drawMarks0();
			if (S.hotId)
				HOST.querySelectorAll(`.nd[data-id="${S.hotId}"]`).forEach((e) =>
					e.classList.add("hot"),
				);
		}

		function shown(n) {
			return n.kind === "way" || n.kind === "tract"
				? false
				: n.kind === "spot"
					? S.ev.has(n.id)
					: true;
		}
		function drawMarks0() {
			const g = $("marks");
			if (!g) return;
			const order = {
				tract: 0,
				way: 1,
				spot: 1,
				gate: 2,
				cross: 2,
				dungeon: 2,
				exit: 3,
				town: 3,
				pack: 4,
				elite: 4,
				lair: 5,
			};
			let s = "";
			for (const n of S.sch.nodes
				.slice()
				.sort((a, b) => order[a.kind] - order[b.kind])) {
				const isSel = S.sel === n.id || S.preview === n.id;
				if (isPack(n)) {
					s += packMap(n, isSel);
					continue;
				}
				if (!shown(n)) continue;
				const sel = isSel
					? `<circle class="pulse" r="${n.kind === "lair" ? 20 : 11}" fill="none" stroke="#fff" stroke-width="2"/>`
					: "";
				s += `<g class="nd" data-id="${n.id}" transform="translate(${n.x},${n.y})"><title>${esc(nodeName(n))}</title><g class="sc">${sel}${nodeSvg(n)}</g></g>`;
			}
			g.innerHTML = s;
			if (S.showGrid) drawGrid();
		}
		function drawHl() {
			const g = $("hl");
			if (!g) return;
			g.innerHTML = S.hl
				.map((id) => {
					const n = S.N.get(id);
					return `<g transform="translate(${n.x},${n.y})"><g class="sc"><circle r="16" fill="rgba(226,57,43,.3)" stroke="#e2392b" stroke-width="2.5"/><circle class="pulse" r="21" fill="none" stroke="#e2392b" stroke-width="2"/></g></g>`;
				})
				.join("");
		}
		function polyOf(w) {
			if (w.state !== "walk" || !w.pts) return "";
			const pts = [`${w.x.toFixed(1)},${w.y.toFixed(1)}`];
			for (let i = w.seg + 1; i < w.pts.length; i++)
				pts.push(`${w.pts[i].x.toFixed(1)},${w.pts[i].y.toFixed(1)}`);
			return pts.join(" ");
		}
		const LINE = { me: "#ffcf4a", ally: "#3d7be0", enemy: "#e2392b" };
		function drawRoute() {
			const g = $("route");
			if (!g) return;
			let s = "";

			const line = (pts, c, k = 1) =>
				`<polyline points="${pts}" fill="none" stroke="#2b1d18" stroke-width="${7 * k}" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/><polyline points="${pts}" fill="none" stroke="${c}" stroke-width="${3.6 * k}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="7 5"/>`;
			const mc = cellOf(
				me.state === "walk" && me.pts ? me.pts[me.pts.length - 1] : me,
			);
			for (const w of S.W) {
				if (w.mine || w.state !== "walk" || !w.pts) continue;
				const c = cellOf(w.pts[w.pts.length - 1]);
				if (Math.abs(c.i - mc.i) <= 1 && Math.abs(c.j - mc.j) <= 1)
					s += line(
						polyOf(w),
						w.guild === "ours" ? LINE.ally : LINE.enemy,
						0.85,
					);
			}
			if (me.state === "walk")
				s += line(polyOf(me), me.hunt ? LINE.enemy : LINE.me);
			else if (S.previewPath)
				s += `<polyline points="${S.previewPath}" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="4 4" opacity=".9"/>`;
			s += queueSvg();
			g.innerHTML = s;
		}

		function drawFlag() {
			const g = $("flag");
			if (!g) return;
			const f = S.flag;
			g.innerHTML = f
				? `<g transform="translate(${f.x},${f.y})"><g class="sc"><rect x="${-G.cell / 2}" y="${-G.cell / 2}" width="${G.cell}" height="${G.cell}" fill="rgba(255,207,74,.25)" stroke="#ffcf4a" stroke-width="1.5" transform="scale(${1 / Math.max(1, msNow())})"/><path d="M0 0V-12" stroke="#2b1d18" stroke-width="1.3"/><path d="M0-12h8l-2 2.5 2 2.5h-8z" fill="#ffcf4a" stroke="#2b1d18" stroke-width=".8"/></g></g>`
				: "";
		}
		function previewRoute(t) {
			const live = liveSet();
			let pts = null;
			if (t.id && me.at && me.state !== "walk") {
				const r = DG.route(S.sch, me.at, t.id, live);
				if (r) pts = r.path.map((id) => S.N.get(id));
			}
			if (!pts) {
				const r = gridRoute(wPos(me), t, live, {
					target: t.id || undefined,
					start: me.at,
				});
				if (r) pts = r.path;
			}
			S.previewPath = pts ? pts.map((p) => `${p.x},${p.y}`).join(" ") : null;
			if (!pts) showBlocked(t);
			else {
				hint(null);
				toast("Путь показан - нажми ещё раз, чтобы идти");
			}
			drawRoute();
		}
		function drawPlan() {
			const g = $("plan");
			if (!g) return;
			if (!S.plan || !S.guide) {
				g.innerHTML = "";
				return;
			}
			const cnt = new Map();
			g.innerHTML = S.plan
				.map((a) => {
					const pts = a.path
							.map((id) => {
								const n = S.N.get(id);
								return `${n.x},${n.y}`;
							})
							.join(" "),
						t = S.N.get(a.target),
						k = cnt.get(a.target) || 0;
					cnt.set(a.target, k + 1);
					return `<polyline points="${pts}" fill="none" stroke="#2b1d18" stroke-width="6" opacity=".4" stroke-linejoin="round"/><polyline points="${pts}" fill="none" stroke="${a.c}" stroke-width="3.2" stroke-dasharray="6 4" stroke-linejoin="round"/>
          <g transform="translate(${t.x},${t.y})"><g class="sc"><circle class="pulse" r="${17 + k * 4}" fill="none" stroke="${a.c}" stroke-width="3"/><g transform="translate(${k * 28 - 0},${-25})"><rect x="${-(6 + a.lead.length * 2.1).toFixed(1)}" y="-6" width="${(12 + a.lead.length * 4.2).toFixed(1)}" height="11" rx="3" fill="${a.c}" stroke="#2b1d18" stroke-width="1"/><text y="2.6" style="font:800 7px system-ui;text-anchor:middle;fill:#fff">${esc(a.lead)}</text></g></g></g>`;
				})
				.join("");
		}
		function walkerSvg(w) {
			const col = w.mine ? "#ffcf4a" : GUILD[w.guild].c,
				tx = w.mine ? "#2b1d18" : "#fff";
			const n = w.mine ? S.size : w.size;
			let heroes = "";
			for (let k = 0; k < n; k++) {
				const a = (k / n) * Math.PI * 2 + 0.6;
				heroes += `<circle cx="${(Math.cos(a) * 6).toFixed(1)}" cy="${(4 + Math.sin(a) * 3).toFixed(1)}" r="2.6" fill="${col}" stroke="#2b1d18" stroke-width=".9"/>`;
			}
			return `${w.mine ? '<circle class="pulse" r="13" fill="none" stroke="#ffcf4a" stroke-width="2.2"/>' : ""}<ellipse cy="6" rx="10" ry="3.5" fill="rgba(0,0,0,.3)"/>${heroes}
        <path d="M0 3V-21" stroke="#5a3e24" stroke-width="1.8"/><path d="M-1.8-21.6h3.6l-1.8-2.8z" fill="#e8c35a" stroke="#2b1d18" stroke-width=".6"/>
        <path d="M1-20c5-1.7 10 1.7 15 0l-4.2 5.3 4.2 5.3c-5 1.7-10-1.7-15 0z" fill="${col}" stroke="#2b1d18" stroke-width="1.1" stroke-linejoin="round"/><path d="M6-19.4v9.6" stroke="rgba(0,0,0,.18)" stroke-width="1.8"/>
        <text x="7.2" y="-12.9" style="font:900 6.4px system-ui;text-anchor:middle;fill:${tx}">${n}</text>
        <text class="lbl${w.mine ? "" : " m"}" y="-26" style="${w.mine ? "font-weight:800" : ""}">${esc(w.mine ? `${w.leader} (ты)` : w.label || w.leader || cap(w.name))}</text>`;
		}
		const msNow = () => clamp(0.8 / (C.z / Z(1)), 2.95 / K, 2.8);
		function drawWalkers(full) {
			const g = $("walk");
			if (!g) return;
			const sig = S.W.map((w) => (w.mine ? S.size : w.size)).join();
			if (full || g.childElementCount !== S.W.length || sig !== S.Wsig) {
				g.innerHTML = S.W.slice()
					.sort((x, y) => (x.mine ? 1 : 0) - (y.mine ? 1 : 0))
					.map(
						(w) =>
							`<g data-w="${w.id}" style="pointer-events:none"><g class="sc">${walkerSvg(w)}</g></g>`,
					)
					.join("");
				S.Wsig = sig;
			}

			const cnt = new Map(),
				at = new Map();
			for (const w of S.W)
				if (w.state !== "walk" && w.at) cnt.set(w.at, (cnt.get(w.at) || 0) + 1);
			const ms = msNow();
			S._taken = new Map();
			for (const w of S.W) {
				let ox = 0,
					oy = 0;
				if (w.state !== "walk" && w.at && !(w.stay && w.state !== "fight")) {
					const node = S.N.get(w.at),
						k = at.get(w.at) || 0,
						m = cnt.get(w.at),
						lair = node.kind === "lair",
						big = lair || isPack(node);
					at.set(w.at, k + 1);
					if (w.state === "fight" && w.fk && isPack(node)) {
						const fi = S.fights.get(w.fk),
							fp = fi ? flockPts(node)[fi.i] : node,
							ix = fi ? fi.ws.indexOf(w) : 0;

						const q = besideFlock(node, fp, ix);
						ox = (q.x - node.x) / ms;
						oy = (q.y - node.y) / ms;
					} else if (
						big &&
						k === 0 &&
						!lair &&
						!(
							isPack(node) &&
							flockPts(node).some(
								(fp, fi_) =>
									Math.hypot(fp.x - node.x, fp.y - node.y) < 2 &&
									F.stateOf(S.P.get(node.id).fl[fi_], S.now).alive,
							)
						)
					) {
						ox = 0;
						oy = 0;
					} else if (big) {
						const R = lair
								? 30
								: isPack(node) && S.P.get(node.id).fl.length > 1
									? ((S.sch.gap || 75) * 0.45) / ms + 15
									: 21,
							taken = S._taken || (S._taken = new Map());
						const busy = taken.get(w.at) || [];
						const near = S.sch.nodes.filter(
							(q) => q !== node && dist(q, node) < 140,
						);
						let best = 0,
							bs = -Infinity;
						for (let q = 0; q < 16; q++) {
							const a = (q / 16) * Math.PI * 2,
								px = node.x + Math.cos(a) * R * ms,
								py = node.y + Math.sin(a) * R * ms;
							let sc = 0;
							for (const o of near)
								sc += -1 / Math.max(4, Math.hypot(o.x - px, o.y - py));
							for (const t of busy)
								sc +=
									-2.2 /
									Math.max(
										0.3,
										Math.abs(Math.atan2(Math.sin(a - t), Math.cos(a - t))),
									);
							if (isPack(node))
								for (const fp of flockPts(node))
									sc += -1.5 / Math.max(4, Math.hypot(fp.x - px, fp.y - py));
							if (sc > bs) {
								bs = sc;
								best = a;
							}
						}
						busy.push(best);
						taken.set(w.at, busy);
						ox = Math.cos(best) * R;
						oy = Math.sin(best) * R;
					} else if (m > 1) {
						const a = Math.PI / 2 + (k - (m - 1) / 2) * 1.25;
						ox = Math.cos(a) * 22;
						oy = Math.sin(a) * 15;
					}
				}
				(S._wdraw || (S._wdraw = new Map())).set(w.id, {
					x: w.x + ox * ms,
					y: w.y + oy * ms,
				});
				const el = g.querySelector(`[data-w="${w.id}"]`);
				if (el)
					el.setAttribute(
						"transform",
						`translate(${(w.x + ox * ms).toFixed(1)},${(w.y + oy * ms).toFixed(1)})${w.state === "fight" ? " scale(.78)" : ""}`,
					);
			}
			if (me && me.state === "walk") drawMini.me();
			else if (S.W.some((w) => w.state === "walk")) drawMini.w();
			stackGroups();
			for (const w of S.W) {
				const el = g.querySelector(`[data-w="${w.id}"]`);
				if (el) el.style.display = w.hid ? "none" : "";
			}
		}

		const MARK_IC = {
			flag: {
				c: "#3d7be0",
				n: "Сбор",
				d: '<path d="M-3 5V-6M-3-5.5h7l-2 2.6 2 2.6h-7" fill="#fff" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/>',
			},
			swords: {
				c: "#e2392b",
				n: "Атака",
				d: '<path d="M-5-5l10 10M5-5l-10 10" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>',
			},
			warn: {
				c: "#f2a33a",
				n: "Осторожно",
				d: '<path d="M0-5.5v6.5" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><circle cx="0" cy="4.6" r="1.4" fill="#fff"/>',
			},
			shield: {
				c: "#3e9a4a",
				n: "Оборона",
				d: '<path d="M0-6l5 2v3c0 3.4-2.2 5.4-5 6.6C-2.8 4.4-5 2.4-5-1v-3z" fill="#fff"/>',
			},
			star: {
				c: "#d9a514",
				n: "Цель",
				d: '<path d="M0-6l1.8 3.8 4.1.5-3 2.9.8 4.1L0 3.3l-3.7 2 .8-4.1-3-2.9 4.1-.5z" fill="#fff"/>',
			},
			eye: {
				c: "#8a4fc4",
				n: "Разведка",
				d: '<path d="M-6 0c3-4.5 9-4.5 12 0-3 4.5-9 4.5-12 0z" fill="#fff"/><circle r="2" fill="#8a4fc4"/>',
			},
		};
		const MARK_MAX = RL.MARK_MAX;
		const role = () => (S.lead ? "lead" : "");
		const markIco = (k, r = 7) =>
			`<circle r="${r}" fill="${MARK_IC[k].c}" stroke="#2b1d18" stroke-width="1.2"/><g transform="scale(${(r / 7).toFixed(2)})">${MARK_IC[k].d}</g>`;
		function markAt(sx, sy) {
			const h = hitAt(sx, sy);
			if (h && h.mark != null) {
				S.pop = { medit: h.mark, ic: S.marks[h.mark].ic };
				renderPop();
				return;
			}
			const p = toWorld(sx, sy),
				c = cellOf(p);
			if (!G || !gPass(c.i, c.j)) {
				toast("Метку - только на клетку, куда можно пройти", true);
				return;
			}
			if (S.marks.length >= MARK_MAX) {
				toast(`Уже ${MARK_MAX} меток - сними одну (ПКМ по метке)`, true);
				return;
			}
			const q = cellPt(c.i, c.j);
			S.pop = { mnew: { x: q.x, y: q.y }, ic: "flag" };
			renderPop();
			const inp = $("pop").querySelector("input");
			if (inp) {
				inp.focus();
				inp.select();
			}
		}
		function markForm(name, ic, edit) {
			return `<button class="gl-x pop-x" data-pact="close" aria-label="Закрыть">×</button><h3>${edit ? "Метка" : "Новая метка"}</h3>
        <input class="mname" maxlength="24" value="${esc(name)}" placeholder="Название метки" aria-label="Название метки">
        <div class="mics">${Object.keys(MARK_IC)
					.map(
						(k) =>
							`<button class="mic ${k === ic ? "on" : ""}" data-pact="mic" data-v="${k}" title="${MARK_IC[k].n}" aria-label="${MARK_IC[k].n}"><svg viewBox="-9 -9 18 18">${markIco(k)}</svg></button>`,
					)
					.join("")}</div>
        <button class="gl-btn wide" data-pact="mset">${edit ? "Сохранить" : "Поставить"}</button>${edit ? '<button class="gl-btn ghost wide" data-pact="mdel">Снять метку</button>' : ""}
        <div class="mute">Видят все группы гильдии · меток ${S.marks.length} из ${MARK_MAX}</div>`;
		}

		const NODE_D = {
			gate: "Ворота города. Отсюда идёт тракт, слабые стаи - рядом.",
			cross: "Перепутье - лагерь у дороги, стай здесь нет.",
			dungeon: "Вход в данж - особо опасная локация (заглушка).",
			tract: "Тракт - стай на нём нет.",
			spot: "Поляна.",
			exit: "",
			lair: "",
		};
		function cellMenu(sx, sy) {
			const h = hitAt(sx, sy),
				p = toWorld(sx, sy),
				c = cellOf(p),
				q = cellPt(c.i, c.j),
				here = cellOf(me);
			const ch = G && G.rows[c.j] ? G.rows[c.j][c.i] : " ",
				pass = G && gPass(c.i, c.j);
			let o = null;
			if (h) {
				o = { ...h };
				if (o.id && isPack(S.N.get(o.id)) && o.i == null) o.i = 0;
			} else {
				const w = S.W.find(
					(x) =>
						!x.mine &&
						!x.hid &&
						x.state !== "walk" &&
						cellOf(x).i === c.i &&
						cellOf(x).j === c.j,
				);
				if (w) o = { gid: w.id };
				if (!o) {
					const k = S.marks.findIndex(
						(m) => cellOf(m).i === c.i && cellOf(m).j === c.j,
					);
					if (k >= 0) o = { mark: k };
				}
				if (!o) {
					const k = (S.res || []).findIndex(
						(r) => cellOf(r).i === c.i && cellOf(r).j === c.j,
					);
					if (k >= 0) o = { res: k };
				}
				if (!o)
					for (const P_ of S.P.values())
						flockPts(S.N.get(P_.id)).forEach((fp, i) => {
							if (!o && cellOf(fp).i === c.i && cellOf(fp).j === c.j)
								o = { id: P_.id, i };
						});
				if (!o) {
					const n = S.sch.nodes.find(
						(x) =>
							shown(x) &&
							!isPack(x) &&
							cellOf(x).i === c.i &&
							cellOf(x).j === c.j,
					);
					if (n) o = { id: n.id, i: null };
				}
			}
			S.pop = {
				cell: {
					x: q.x,
					y: q.y,
					i: c.i,
					j: c.j,
					ch,
					pass,
					mine: here.i === c.i && here.j === c.j,
				},
				o,
			};
			renderPop();
		}
		function cellPop() {
			const { cell, o } = S.pop,
				busy = me.state === "fight",
				B = (act, t, cls = "") =>
					`<button class="gl-btn ${cls} wide" data-pact="${act}" ${busy && act !== "cmark" && act !== "cmedit" ? "disabled" : ""}>${t}</button>`;
			const terr =
				{
					".": "поле",
					"=": "дорога",
					"#": "чаща - не пройти",
					"~": "вода - не пройти",
					" ": "за краем округа",
				}[cell.ch] || "поле";
			let t = "Клетка",
				d = `<div class="mute">${terr}${cell.mine ? " · здесь моя группа" : ""}</div>`,
				btn = "",
				live = false;
			if (o && o.gid) {
				const w = S.W.find((x) => x.id === o.gid),
					ours = w.guild === "ours";
				t = cap(w.label || w.leader || w.name);
				d += `<p>${ours ? "Группа своей гильдии" : `Группа чужой гильдии «${esc(GUILD.enemy.n)}»`}: ${w.size} ${pl(w.size, "боец", "бойца", "бойцов")}.</p>`;
				btn += ours
					? B("cgcome", "Подойти к ней")
					: B("cgatk", "Атаковать") + B("cgcome", "Подойти", "ghost");
				live = !ours;
			} else if (o && o.mark != null) {
				const m = S.marks[o.mark];
				t = m.name;
				d += `<p>Метка руководства (${MARK_IC[m.ic].n.toLowerCase()}), поставил ${esc(m.by)}.</p>`;
				btn +=
					B("cmgo", "Идти к метке") +
					(S.lead ? B("cmedit", "Изменить метку", "ghost") : "");
			} else if (o && o.res != null) {
				const r = S.res[o.res],
					R = RES[r.k];
				t = r.name;
				d += `<p>${esc(R.prof)}: ${esc(R.d)}${r.back > S.now ? ` Собрано - вырастет через ${mmss(r.back - S.now)}.` : ""}</p>`;
				if (!(r.back > S.now)) btn += B("cgath", "Собрать");
			} else if (o && o.id) {
				const n = S.N.get(o.id);
				t = nodeName(n);
				if (isPack(n) && o.i != null) {
					const P_ = S.P.get(n.id),
						f = P_.fl[o.i],
						st = F.stateOf(f, S.now),
						l = lvlOf(n);
					t = P_.name.replace(" (свита)", "");
					if (P_.stack && hasMon(P_.stack.squad[0].mon))
						d =
							`<div style="float:right;margin:-4px 0 4px 6px">${LGMon.icon(P_.stack.squad[0].mon, iconTier(n), 56)}</div>` +
							d;
					d += `<p>${TIER[tierOf(n)].n}${n.escort ? ", свита логова" : ""}, <b>ур. ${l}</b> ${lvlWord(l)}. Состав: ${squadOf(
						n,
						o.i,
					)
						.map(([nm, k]) => esc(nm) + (k > 1 ? " ×" + k : ""))
						.join(
							", ",
						)}.</p><p class="st">${st.alive ? (f.busy ? `занята: ${esc(wName(f.busy.gid))}` : "жива, свободна") : `убита - вернётся через ${mmss(st.backIn)}`}</p>`;
					if (st.alive && !f.busy) {
						btn += B("catk", "Атаковать");
						live = true;
					} else if (st.alive && f.busy)
						btn += B("cflock", "Подробнее", "ghost");
					else live = false;
				} else if (n.kind === "town") {
					d += `<p>${bossLive() ? "Город держат монстры - откроется после победы над боссом." : S.owner === "enemy" ? "Чужой город - войти гостем." : "Наш город: лавка, кузня, ратуша, здание гильдии."}</p>`;
					btn += bossLive()
						? B("cgo", "Идти к городу")
						: B("ctown", "Войти в город");
				} else if (n.kind === "exit") {
					d += `<p>${n.trail ? "Просёлок" : "Тракт"} в соседний округ «${esc(S.d.nb[n.to] || n.to)}»${DATA.levels[n.to] ? `, монстры от ур. ${DATA.levels[n.to]}` : ""}.</p>`;
					btn += B("cexit", "Перейти в округ");
				} else if (n.kind === "lair") {
					d += `<p>${bossLive() ? (packsLeft() ? `Босс ${esc(S.bossName)}. Вход - когда все стаи округа зачищены (осталось ${packsLeft()}).` : `Босс ${esc(S.bossName)}. Все стаи зачищены - можно собираться.`) : "Босс побеждён."}</p>`;
					if (bossLive() && !packsLeft()) btn += B("crally", "Сбор у логова");
				} else if (n.kind === "spot" && S.ev.has(n.id)) {
					d +=
						"<p>На поляне путник с «!» - просит о помощи (заглушка событий).</p>";
					btn += B("cnode", "Поговорить");
				} else d += `<p>${NODE_D[n.kind] || ""}</p>`;
			}
			if (
				cell.pass &&
				!live &&
				!cell.mine &&
				!(o && o.id && S.N.get(o.id).kind === "town")
			)
				btn += B("cgo", "Идти сюда", btn ? "ghost" : "");
			if (S.lead && cell.pass && !(o && o.mark != null))
				btn +=
					S.marks.length < MARK_MAX
						? B("cmark", "Поставить метку", "ghost")
						: `<div class="mute">Меток ${MARK_MAX} из ${MARK_MAX} - сними одну, чтобы поставить новую.</div>`;
			if (!btn) btn = '<div class="mute">Здесь ничего не сделать.</div>';
			return `<button class="gl-x pop-x" data-pact="close" aria-label="Закрыть">×</button><h3>${esc(t)}</h3>${d}${btn}`;
		}

		function cellAct(a) {
			const { cell, o } = S.pop,
				fake = (pact, pop) => {
					S.pop = pop;
					renderPop();
					onPopAct({ target: { closest: () => ({ dataset: { pact } }) } });
				};
			if (a === "cgo") {
				closePop();
				const t = { x: cell.x, y: cell.y },
					r = go(me, t);
				if (r === true) {
					S.queue = [];
					me.hunt = null;
					S.flag = t;
					drawFlag();
				} else if (r === "blocked") showBlocked(t);
				else toast(r, true);
				renderSide();
				drawRoute();
				return;
			}
			if (a === "catk") return fake("go", { id: o.id, i: o.i });
			if (a === "cflock") {
				openPop(o.id, o.i);
				return;
			}
			if (a === "cgatk") return fake("gatk", { gid: o.gid });
			if (a === "cgcome") return fake("gcome", { gid: o.gid });
			if (a === "cmgo") return fake("mgo", { mark: o.mark });
			if (a === "cmedit") {
				S.pop = { medit: o.mark, ic: S.marks[o.mark].ic };
				renderPop();
				return;
			}
			if (a === "cgath") return fake("gath", { res: o.res });
			if (a === "ctown") return fake("tenter", { id: o.id, town: true });
			if (a === "cexit") {
				closePop();
				const n = S.N.get(o.id);
				if (exitNear(me) === n && me.state !== "walk") exitDlg(n);
				else walkTo(n.id);
				return;
			}
			if (a === "crally") return fake("rally", { id: o.id, i: 0 });
			if (a === "cnode") {
				closePop();
				clickNode(o.id);
				return;
			}
			if (a === "cmark") {
				S.pop = { mnew: { x: cell.x, y: cell.y }, ic: "flag" };
				renderPop();
				const inp = $("pop").querySelector("input");
				if (inp) {
					inp.focus();
					inp.select();
				}
			}
		}
		function drawMarkLayer() {
			const g = $("lmarks");
			if (!g) return;
			g.innerHTML = S.marks
				.map(
					(m) =>
						`<g transform="translate(${m.x},${m.y})"><g class="sc"><circle class="pulse" r="11" fill="none" stroke="${MARK_IC[m.ic].c}" stroke-width="2"/><ellipse cx="0" cy="1.5" rx="5" ry="2" fill="rgba(0,0,0,.3)"/><path d="M0 1V-9" stroke="#2b1d18" stroke-width="1.6"/><g transform="translate(0,-15)">${markIco(m.ic)}</g><text class="lbl" y="9" style="font-weight:800">${esc(m.name)}</text></g></g>`,
				)
				.join("");
		}

		const RES = {
			herb: {
				prof: "Травничество",
				d: "Можно собрать травы.",
				names: ["Зверобой", "Полынь", "Ромашка", "Кровохлёбка", "Чабрец"],
				c: "#7fbf4a",
			},
			wood: {
				prof: "Лесное дело",
				d: "Сухие стволы и сучья у опушки.",
				names: ["Валежник", "Сухостой", "Берёзовая кора"],
				c: "#a8743a",
			},
			dig: {
				prof: "Раскопки",
				d: "Из земли торчат старые камни.",
				names: ["Старый курган", "Битые черепки", "Каменная россыпь"],
				c: "#9a8f80",
			},
		};
		const RES_SEC = 20,
			RES_BACK = 30 * MIN;
		function makeRes() {
			S.res = [];
			if (!G) return;
			const r = WL.rng(WL.hash("res:" + S.d.id)),
				want = 5 + S.d.star * 2,
				near = (x, y, R) => S.sch.nodes.some((n) => dist(n, { x, y }) < R);
			for (let t = 0; t < 900 && S.res.length < want; t++) {
				const i = Math.floor(r() * G.w),
					j = Math.floor(r() * G.h);
				if (G.rows[j][i] !== ".") continue;
				const p = cellPt(i, j);
				if (
					near(p.x, p.y, G.cell * 1.8) ||
					S.res.some((q) => dist(q, p) < G.cell * 6)
				)
					continue;
				const wood = [
					[1, 0],
					[-1, 0],
					[0, 1],
					[0, -1],
				].some(([a, b]) => (G.rows[j + b] || "")[i + a] === "#");
				const k = wood && r() < 0.7 ? "wood" : r() < 0.6 ? "herb" : "dig",
					L = RES[k].names;
				S.res.push({
					x: p.x,
					y: p.y,
					k,
					name: L[Math.floor(r() * L.length)],
					back: 0,
				});
			}
		}
		function resSvg(rr) {
			const c = RES[rr.k].c,
				back = rr.back > S.now,
				op = back ? ' opacity=".45"' : "";
			const ic =
				rr.k === "herb"
					? `<path d="M0 3C-1-2-5-4-6-8M0 3C1-3 4-5 6-9M0 3V-7" stroke="#2f5a1f" stroke-width="1.4" fill="none"/><circle cx="-6" cy="-8" r="2" fill="#f2e05a"/><circle cx="6" cy="-9" r="2" fill="#c45ad0"/><circle cx="0" cy="-7" r="2" fill="#fff"/>`
					: rr.k === "wood"
						? `<rect x="-7" y="-3" width="14" height="4" rx="2" fill="#a8743a" stroke="#2b1d18" stroke-width=".8" transform="rotate(-12)"/><rect x="-6" y="-7" width="12" height="4" rx="2" fill="#c08a4a" stroke="#2b1d18" stroke-width=".8" transform="rotate(10)"/>`
						: `<path d="M-7 3l2-7 4-2 3 3 4-1 1 7z" fill="#b8ad9c" stroke="#2b1d18" stroke-width=".9"/><path d="M-2-2l1 3" stroke="#2b1d18" stroke-width=".7"/>`;
			return `<g transform="translate(${rr.x},${rr.y})"><g class="sc"${op}><circle r="9" fill="rgba(255,248,230,.75)" stroke="${c}" stroke-width="1.6"/>${ic}${back ? `<text class="lbl tm" y="16">${mmss(rr.back - S.now)}</text>` : `<text class="lbl m mn" y="16">${esc(rr.name)}</text>`}</g></g>`;
		}
		function drawResLayer() {
			const g = $("lres");
			if (g) g.innerHTML = (S.res || []).map(resSvg).join("");
		}
		function gather(i) {
			if (S.gath) {
				toast("Уже собираем", true);
				return;
			}
			S.gath = { i, end: S.now + RES_SEC * 1000 };
			toast(`Собираем: ${S.res[i].name} (${RES_SEC} с, заглушка)`);
		}
		function gatherTick() {
			if (!S.gath) return;
			if (me.state === "walk" || me.state === "fight") {
				S.gath = null;
				toast("Сбор прерван - группа ушла", true);
				renderPop();
				return;
			}
			if (S.now >= S.gath.end) {
				const r = S.res[S.gath.i];
				r.back = S.now + RES_BACK;
				S.gath = null;
				toast(
					`+1 ${r.name} (${RES[r.k].prof}, заглушка). Вырастет через 30 мин`,
				);
				drawResLayer();
				renderPop();
			}
		}

		function enterTown() {
			const guest = S.owner === "enemy";

			if (X.openTown) {
				const tid = S.d.id === "edge" ? "fair" : S.d.id;
				closeAll();
				X.openTown(tid, guest ? "guest" : "owned");
				return;
			}
			dlg(
				`Город ${S.d.town}`,
				`<p>${guest ? "Вы вошли гостем." : "Вы в своём городе."} В игре здесь откроется окно «Город» сайта - тот же город, что с карты мира: лавка, кузня, рынок${guest ? "" : ", ратуша и здание гильдии"}.</p><p class="mute">Выход из города вернёт отряд на карту округа к воротам города.</p>`,
				[{ t: "Выйти из города", fn: () => toast("Отряд у ворот города") }],
			);
		}

		function queueSvg() {
			if (!S.queue.length) return "";
			const start =
				me.state === "walk" && me.pts ? me.pts[me.pts.length - 1] : me;
			const pts = [start, ...S.queue]
				.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
				.join(" ");
			return (
				`<polyline points="${pts}" fill="none" stroke="#ffcf4a" stroke-width="2" stroke-dasharray="3 4" opacity=".85"/>` +
				S.queue
					.map(
						(p, k) =>
							`<g transform="translate(${p.x},${p.y})"><g class="sc"><circle r="5.5" fill="#ffcf4a" stroke="#2b1d18" stroke-width="1.2"/><text y="2.3" style="font:900 6px system-ui;text-anchor:middle;fill:#2b1d18">${k + (me.state === "walk" ? 2 : 1)}</text></g></g>`,
					)
					.join("")
			);
		}

		function nearestFlock() {
			let best = null,
				bd = Infinity;
			for (const P_ of S.P.values()) {
				const n = S.N.get(P_.id);
				flockPts(n).forEach((fp, i) => {
					const f = P_.fl[i];
					if (!F.stateOf(f, S.now).alive || f.busy) return;
					const d = dist(fp, me);
					if (d < bd) {
						bd = d;
						best = { id: P_.id, i };
					}
				});
			}
			if (!best) {
				toast("Живых свободных стай нет");
				return;
			}
			const fp = flockPts(S.N.get(best.id))[best.i];
			S.follow = false;
			centerOn(fp, Math.max(C.z, Z(1)), true);
			openPop(best.id, best.i);
		}

		function drawProg() {
			const el = $("prog");
			if (!el) return;
			let tot = 0,
				dead = 0;
			for (const P_ of S.P.values())
				for (const f of P_.fl) {
					tot++;
					if (!F.stateOf(f, S.now).alive) dead++;
				}
			const left = tot - dead,
				open = left === 0;
			el.innerHTML = `<div class="pt"><b>Зачищено ${dead} из ${tot}</b><span>${bossLive() ? (open ? "логово открыто!" : `до босса: ${left} ${pl(left, "стая", "стаи", "стай")}`) : "босс побеждён"}</span></div><span class="bar sm"><i style="--w:${(dead / Math.max(1, tot)).toFixed(3)}"></i></span>`;
			el.classList.toggle("done", open);
		}

		const STACK_MAX = RL.STACK_MAX;
		function stackGroups() {
			const by = new Map();
			for (const w of S.W) {
				w.hid = false;
				if (w.state === "walk") continue;
				const c = cellOf(w),
					k = c.i + "," + c.j;
				if (!by.has(k)) by.set(k, []);
				by.get(k).push(w);
			}
			let s = "";
			for (const ws of by.values()) {
				if (ws.length <= STACK_MAX) continue;
				ws.sort((a, b) => (b.mine ? 1 : 0) - (a.mine ? 1 : 0));
				ws.slice(STACK_MAX).forEach((w) => {
					w.hid = true;
				});
				const c = cellOf(ws[0]),
					p = cellPt(c.i, c.j),
					ours = ws.filter((w) => w.guild === "ours").length;
				s += `<g transform="translate(${p.x},${p.y})"><g class="sc"><g transform="translate(0,-40)"><rect x="-22" y="-7" width="44" height="13" rx="6" fill="#2b1d18" stroke="#fff8e6" stroke-width="1"/><text y="2.6" style="font:800 7px system-ui;text-anchor:middle;fill:#fff">${ws.length} ${pl(ws.length, "группа", "группы", "групп")}</text></g>${ours < ws.length ? `<text class="lbl m" y="-28">своих ${ours}, чужих ${ws.length - ours}</text>` : ""}</g></g>`;
			}
			const g = $("lstack");
			if (g && g.dataset.s !== s) {
				g.innerHTML = s;
				g.dataset.s = s;
			}
		}

		function drawMini() {
			const B = S.B,
				svg = $("mini"),
				b = bio(S.d.biome),
				sch = S.sch;
			svg.setAttribute("viewBox", `${B.x0} ${B.y0} ${B.w} ${B.h}`);
			let roads = "",
				tract = "";
			for (const e of sch.edges) {
				const u = S.N.get(e.a),
					v = S.N.get(e.b);
				const d = `M${u.x} ${u.y}L${v.x} ${v.y}`;
				if (e.tract) tract += d;
				else roads += d;
			}
			let dots = "";
			for (const n of sch.nodes) {
				if (isPack(n)) {
					const ps = pst(n.id);
					dots += `<circle cx="${n.x}" cy="${n.y}" r="${n.kind === "elite" ? 16 : 10 + ps.n * 2}" fill="${ps.passable ? "#777" : TIER[tierOf(n)].c}" stroke="#2b1d18" stroke-width="3"/>`;
				} else if (n.kind === "lair")
					dots += `<circle cx="${n.x}" cy="${n.y}" r="26" fill="${bossLive() ? "#5a2a22" : "#777"}" stroke="#fff" stroke-width="5"/>`;
				else if (n.kind === "town")
					dots += `<circle cx="${n.x}" cy="${n.y}" r="34" fill="#cdb894" stroke="#3e352e" stroke-width="8"/>`;
				else if (n.kind === "exit")
					dots += `<path d="M${n.x - 14} ${n.y + 14}L${n.x} ${n.y - 16}L${n.x + 14} ${n.y + 14}z" fill="#e8d4a2" stroke="#2b1d18" stroke-width="3"/>`;
			}
			let lakes = "";
			for (const m of sch.marks || [])
				if (m.kind === "lake") lakes += circ(m.x, m.y, m.r);
			svg.innerHTML = `<rect x="${B.x0}" y="${B.y0}" width="${B.w}" height="${B.h}" fill="${b.out}"/>${sch.contour ? `<polygon points="${sch.contour.join(" ")}" fill="${b.land}" stroke="${b.edge}" stroke-width="10"/>` : ""}
        <path d="${lakes}" fill="#5ab4d2"/><path d="${roads}" stroke="${b.trail}" stroke-width="6" fill="none"/><path d="${tract}" stroke="#f4ead2" stroke-width="13" fill="none"/>${dots}
        ${S.marks.map((m) => `<path d="M${m.x} ${m.y}v-70h46l-10 14 10 14h-46" fill="${MARK_IC[m.ic].c}" stroke="#2b1d18" stroke-width="6"/>`).join("")}<g id="dm-mmw"></g>
        <circle id="dm-mmme" r="24" fill="#ffcf4a" stroke="#2b1d18" stroke-width="7"/><rect id="dm-mmfr" fill="none" stroke="#fff" stroke-width="12" rx="10"/>`;
			drawMini.me();
			updFrame();
		}
		drawMini.me = () => {
			const c = $("mmme");
			if (c && me) {
				c.setAttribute("cx", me.x.toFixed(0));
				c.setAttribute("cy", me.y.toFixed(0));
			}
			drawMini.w();
		};

		drawMini.w = () => {
			const g = $("mmw");
			if (!g) return;
			g.innerHTML = S.W.filter((w) => !w.mine)
				.map(
					(w) =>
						`<circle cx="${w.x.toFixed(0)}" cy="${w.y.toFixed(0)}" r="18" fill="${w.guild === "ours" ? "#3d7be0" : "#e2392b"}" stroke="#fff" stroke-width="5"/>`,
				)
				.join("");
		};
		function updFrame() {
			const r = $("mmfr");
			if (!r) return;
			r.setAttribute("x", (S.B.x0 - C.x / (K * C.z)).toFixed(0));
			r.setAttribute("y", (S.B.y0 - C.y / (K * C.z)).toFixed(0));
			r.setAttribute("width", (vpW() / (K * C.z)).toFixed(0));
			r.setAttribute("height", (vpH() / (K * C.z)).toFixed(0));
		}

		const vp = $("vp"),
			cam = $("cam");
		const vpW = () => vp.clientWidth,
			vpH = () => vp.clientHeight;
		const zFit = () => Math.min(vpW() / (S.B.w * K), vpH() / (S.B.h * K));
		const zMin = () => zFit() * 0.9,
			zMax = () => Z(1.8);
		function clampCam() {
			const mw = S.B.w * K * C.z,
				mh = S.B.h * K * C.z,
				W = vpW(),
				H = vpH(),
				pad = 80;
			C.x = mw + 2 * pad <= W ? (W - mw) / 2 : clamp(C.x, W - mw - pad, pad);
			C.y = mh + 2 * pad <= H ? (H - mh) / 2 : clamp(C.y, H - mh - pad, pad);
		}
		function applyCam(anim) {
			clampCam();
			cam.classList.toggle("anim", !!anim && !S.noAnim);
			cam.style.transform = `translate(${C.x.toFixed(1)}px,${C.y.toFixed(1)}px) scale(${C.z.toFixed(4)})`;
			$("map").style.setProperty("--ms", msNow().toFixed(3));
			vp.classList.toggle("far", C.z < Z(0.6));
			updFrame();
			placePop();
			if (S.hovC) hoverCell(S.hovC);
			bakeCheck();
		}
		function centerOn(p, z, anim) {
			if (z) C.z = clamp(z, zMin(), zMax());
			C.x = vpW() / 2 - (p.x - S.B.x0) * K * C.z;
			C.y = vpH() / 2 - (p.y - S.B.y0) * K * C.z;
			applyCam(anim);
		}
		function zoomAt(f, sx, sy, anim) {
			const z2 = clamp(C.z * f, zMin(), zMax()),
				k = z2 / C.z;
			C.x = sx - (sx - C.x) * k;
			C.y = sy - (sy - C.y) * k;
			C.z = z2;
			applyCam(anim);
		}
		function fitAll(anim) {
			C.z = zFit() * 0.96;
			C.x = 0;
			C.y = 0;
			S.follow = false;
			applyCam(anim);
		}

		const HIT = {
			lair: 30,
			town: 26,
			tract: 14,
			spot: 18,
			way: 20,
			exit: 22,
			gate: 22,
			cross: 22,
			dungeon: 22,
			pack: 22,
			elite: 24,
		};
		function hitAt(sx, sy) {
			const sp = (p) => ({
				x: C.x + (p.x - S.B.x0) * K * C.z,
				y: C.y + (p.y - S.B.y0) * K * C.z,
			});
			const kz = Math.max(1, (msNow() * K * C.z) / 2.95);
			let best = null,
				bq = 1;
			const test = (p, R, hit) => {
				const q = sp(p),
					d = Math.hypot(q.x - sx, q.y - sy) / (R * kz);
				if (d <= bq) {
					bq = d;
					best = hit;
				}
			};
			for (const w of S.W)
				if (!w.mine && !w.hid) {
					const p = (S._wdraw && S._wdraw.get(w.id)) || wPos(w);
					test(p, 18, { gid: w.id });
				}
			S.marks.forEach((m, i) => test({ x: m.x, y: m.y - 10 }, 14, { mark: i }));
			(S.res || []).forEach((r, i) => test(r, 14, { res: i }));
			for (const n of S.sch.nodes) {
				if (isPack(n)) {
					const pts = flockPts(n);
					pts.forEach((p, i) =>
						test(p, 20, { id: n.id, i: pts.length > 1 ? i : null }),
					);
					if (pts.length > 1) test(n, 12, { id: n.id, i: null });
				} else if (shown(n)) test(n, HIT[n.kind] || 20, { id: n.id, i: null });
			}
			return best;
		}
		function clickAt(sx, sy) {
			const h = hitAt(sx, sy);
			if (
				S.pop &&
				(!h ||
					(h.gid || null) !== (S.pop.gid || null) ||
					(!h.gid && (h.id !== S.pop.id || (h.i ?? 0) !== S.pop.i)))
			) {
				closePop();
				if (!h) return;
			}
			if (!h) {
				clickGround(toWorld(sx, sy));
				return;
			}
			if (h.gid) {
				S.pop = { gid: h.gid };
				renderPop();
				return;
			}
			if (h.mark != null) {
				S.pop = { mark: h.mark };
				renderPop();
				return;
			}
			if (h.res != null) {
				S.pop = { res: h.res };
				renderPop();
				return;
			}
			if (h.id && S.N.get(h.id) && S.N.get(h.id).kind === "town" && !S.guide) {
				S.pop = { id: h.id, town: true };
				renderPop();
				return;
			}
			const n = S.N.get(h.id);
			if (!n) return;

			if (((isPack(n) && S.P.has(h.id)) || n.kind === "lair") && !S.guide) {
				openPop(h.id, h.i ?? 0);
				return;
			}

			if (n.kind === "exit" && me.state !== "walk" && exitNear(me) === n) {
				S.sel = n.id;
				renderSide();
				drawMarks();
				exitDlg(n);
				return;
			}
			S.selFlock = h.i;
			clickNode(h.id);
		}

		const distLvl = () => +S.d.level || 1;
		function lvlOf(n) {
			if (n.kind === "lair") return distLvl() + 3;
			if (n.kind === "elite") return distLvl() + 2;
			if (n.escort) return distLvl() + 2;
			return Math.max(1, distLvl() + { weak: -1, mid: 0, strong: 1 }[n.tier]);
		}
		const heroLvl = () => (S.heroLvl != null ? S.heroLvl : distLvl());
		function lvlCol(l) {
			const d = l - heroLvl();
			return d <= -1 ? "#5cbf60" : d >= 2 ? "#e2392b" : "#f2c14e";
		}

		const lvlTag = (l) => {
			const c = lvlCol(l);
			return c === "#e2392b"
				? "background:#d5301f;color:#fff"
				: `background:${c};color:#2b1d18`;
		};
		const lvlWord = (l) => {
			const d = l - heroLvl();
			return d <= -1 ? "легко" : d >= 2 ? "тяжело" : "вровень";
		};

		function lvlBadge(l, x, y, faded) {
			const c = lvlCol(l),
				w = l >= 10 ? 9.6 : 7.4;
			return `<g transform="translate(${x},${y})"${faded ? ' opacity=".55"' : ""}><rect x="${-w / 2}" y="-3.7" width="${w}" height="7.4" rx="3.7" fill="${c}" stroke="#2b1d18" stroke-width=".9"/><text y="2.1" style="font:900 5.4px system-ui;text-anchor:middle;fill:${c === "#f2c14e" ? "#2b1d18" : "#fff"}">${l}</text></g>`;
		}

		const UNITS = {
			meadow: [
				["Волчонок", "Полевая крыса", "Шакал"],
				["Волк", "Кабан", "Разбойник"],
				["Матёрый волк", "Секач", "Атаман"],
			],
			forest: [
				["Лесной паук", "Кикимора", "Барсук"],
				["Лешак", "Паук-ткач", "Вепрь"],
				["Древень", "Паучиха", "Медведь"],
			],
			ice: [
				["Снежная лиса", "Ледяной дух", "Песец"],
				["Ледяной волк", "Йети", "Мертвец"],
				["Снежный тролль", "Великан", "Белый медведь"],
			],
		};

		function squadOf(n, i) {
			{
				const P_ = S.P.get(n.id);
				if (P_ && P_.stack)
					return P_.stack.squad.map((q) => [monName(q.mon), q.n]);
			}
			const t = tierOf(n),
				u = UNITS[S.d.biome] || UNITS.meadow,
				r = WL.rng(WL.hash(`sq:${n.id}:${i}`));
			if (n.kind === "elite")
				return [
					[ELITE[S.d.biome] || "Элитный", 1],
					[u[2][Math.floor(r() * 3)], 2],
				];
			const lo = t === "weak" ? 0 : t === "mid" ? 1 : 2,
				cnt =
					t === "weak"
						? 2 + Math.floor(r() * 2)
						: t === "mid"
							? 3 + Math.floor(r() * 2)
							: 4 + Math.floor(r() * 2);
			const m = new Map();
			for (let k = 0; k < cnt; k++) {
				const tier = k === 0 && lo < 2 && r() < 0.4 ? lo + 1 : lo,
					nm = u[tier][Math.floor(r() * 3)];
				m.set(nm, (m.get(nm) || 0) + 1);
			}
			return [...m];
		}
		const forGroup = (n) =>
			n.kind === "elite"
				? "сбор 3-10 бойцов"
				: n.escort
					? "по силам группе из 5"
					: {
							weak: "по силам одному",
							mid: "по силам группе из 3",
							strong: "по силам группе из 4-5",
						}[n.tier];
		function openPop(id, i) {
			S.pop = { id, i };
			S.sel = id;
			S.selFlock = i;
			drawMarks();
			renderPop();
			renderSide();
		}
		function closePop() {
			S.pop = null;
			const el = $("pop");
			if (el) el.hidden = true;
			drawCsel();
		}

		function drawCsel() {
			const g = $("csel");
			if (!g) return;
			const c = S.pop && S.pop.cell;
			g.innerHTML =
				c && G
					? `<rect x="${G.x0 + c.i * G.cell}" y="${G.y0 + c.j * G.cell}" width="${G.cell}" height="${G.cell}" fill="rgba(255,248,214,.38)" stroke="#fff3c4" stroke-width="1.6" rx="1.5"/><rect x="${G.x0 + c.i * G.cell}" y="${G.y0 + c.j * G.cell}" width="${G.cell}" height="${G.cell}" fill="none" stroke="#2b1d18" stroke-width=".6" stroke-dasharray="2 2" rx="1.5"/>`
					: "";
		}
		function popAnchor() {
			if (S.pop.cell) return S.pop.cell;
			if (S.pop.mnew) return S.pop.mnew;
			if (S.pop.medit != null) return S.marks[S.pop.medit] || me;
			if (S.pop.mark != null) return S.marks[S.pop.mark] || me;
			if (S.pop.res != null) return S.res[S.pop.res];
			if (S.pop.town) return S.N.get(S.pop.id);
			if (S.pop.gid) {
				const w = S.W.find((x) => x.id === S.pop.gid);
				return (S._wdraw && S._wdraw.get(w.id)) || wPos(w);
			}
			const n = S.N.get(S.pop.id);
			return n.kind === "lair" ? n : flockPts(n)[S.pop.i] || n;
		}
		function renderPop() {
			let el = $("pop");
			if (!el) {
				el = document.createElement("div");
				el.id = "dm-pop";
				el.className = "pop";
				el.setAttribute("role", "dialog");
				vp.appendChild(el);
				el.addEventListener("click", onPopAct);
				el.addEventListener("pointerdown", (e) => e.stopPropagation());
			}
			if (!S.pop) {
				el.hidden = true;
				return;
			}
			const X = `<button class="gl-x pop-x" data-pact="close" aria-label="Закрыть">×</button>`;
			drawCsel();
			if (S.pop.cell) {
				el.innerHTML = cellPop();
				el.hidden = false;
				el.dataset.key = popKey();
				placePop();
				return;
			}
			if (S.pop.mnew || S.pop.medit != null) {
				const m = S.pop.mnew ? null : S.marks[S.pop.medit];
				if (S.pop.medit != null && !m) {
					el.hidden = true;
					return;
				}
				const keep = el.querySelector("input.mname"),
					nm =
						S.pop.nm != null
							? S.pop.nm
							: keep && el.dataset.key && el.dataset.key[0] === "f"
								? keep.value
								: m
									? m.name
									: MARK_IC[S.pop.ic].n;
				el.innerHTML = markForm(nm, S.pop.ic, !!m);
				el.hidden = false;
				el.dataset.key = popKey();
				placePop();
				el.querySelector("input.mname").onkeydown = (e) => {
					if (e.key === "Enter") el.querySelector('[data-pact="mset"]').click();
					e.stopPropagation();
				};
				return;
			}
			if (S.pop.mark != null) {
				const m = S.marks[S.pop.mark];
				if (!m) {
					el.hidden = true;
					return;
				}
				el.innerHTML =
					X +
					`<h3><svg viewBox="-9 -9 18 18" width="20" height="20" style="vertical-align:-4px">${markIco(m.ic)}</svg> ${esc(m.name)}</h3><div class="mute">метка руководства · поставил ${esc(m.by)} · видят все группы гильдии</div>
          <button class="gl-btn wide" data-pact="mgo" ${me.state === "fight" ? "disabled" : ""}>Идти к метке</button>${S.lead ? '<button class="gl-btn ghost wide" data-pact="medit">Изменить</button>' : ""}`;
				el.hidden = false;
				el.dataset.key = popKey();
				placePop();
				return;
			}
			if (S.pop.res != null) {
				const r = S.res[S.pop.res],
					R = RES[r.k],
					back = r.back > S.now,
					cur = S.gath && S.gath.i === S.pop.res;
				el.innerHTML =
					X +
					`<h3>${esc(r.name)}</h3><div class="mute">${esc(R.prof)} · место сбора · заглушка профессий</div>
          <p class="st">${cur ? `собираем... <b data-live="gath">${secs(Math.max(0, S.gath.end - S.now) / 1000)}</b>` : back ? `собрано - вырастет через <b data-live="rback">${mmss(r.back - S.now)}</b>` : esc(R.d)}</p>
          ${!back && !cur ? `<button class="gl-btn wide" data-pact="gath" ${me.state === "fight" ? "disabled" : ""}>Собрать (${RES_SEC} с)</button>` : ""}`;
				el.hidden = false;
				el.dataset.key = popKey();
				placePop();
				return;
			}
			if (S.pop.town) {
				const n = S.N.get(S.pop.id),
					here = (me.at === n.id || me.at === S.gate.id) && me.state !== "walk";
				const open = !bossLive(),
					guest = S.owner === "enemy";
				el.innerHTML =
					X +
					`<h3>${esc(S.d.town)}</h3><div class="mute">город округа · ${open ? (guest ? `гильдия «${esc(GUILD.enemy.n)}» - войти гостем` : `наша гильдия «${esc(GUILD.ours.n)}»`) : "держат монстры"}</div>
          <p>${open ? (guest ? "Чужой город: лавка, кузня и рынок открыты, здание чужой гильдии - нет." : "Город открыт: лавка, кузня, ратуша, здание гильдии.") : "Пока босс жив, ворота закрыты. Победите босса округа - город откроется."}</p>
          ${open ? `<button class="gl-btn wide" data-pact="tenter" ${me.state === "fight" ? "disabled" : ""}>${here ? "Войти в город" : "Идти и войти в город"}</button>` : `<button class="gl-btn ghost wide" data-pact="come">Подойти к городу</button>`}`;
				el.hidden = false;
				el.dataset.key = popKey();
				placePop();
				return;
			}
			if (S.pop.gid) {
				const w = S.W.find((x) => x.id === S.pop.gid);
				if (!w) {
					el.hidden = true;
					return;
				}
				const ours = w.guild === "ours",
					where =
						w.state === "walk"
							? "идёт"
							: w.state === "fight"
								? "в бою со стаей"
								: w.at
									? `стоит: ${esc(nodeName(S.N.get(w.at)))}`
									: "стоит в поле";
				el.innerHTML = `<button class="gl-x pop-x" data-pact="close" aria-label="Закрыть">×</button>
          <h3>${esc(cap(w.label || w.name))}</h3>
          <div class="mute">${ours ? "своя гильдия" : "чужая гильдия"} · ${w.mine ? S.size : w.size} ${pl(w.mine ? S.size : w.size, "боец", "бойца", "бойцов")} · ур. героев ~${heroLvl()} (заглушка)</div>
          <p class="st">${where}</p>
          ${!ours ? `<button class="gl-btn wide" data-pact="gatk" ${me.state === "fight" ? "disabled" : ""}>Напасть</button>` : ""}
          <button class="gl-btn ${ours ? "" : "ghost "}wide" data-pact="gcome" ${me.state === "fight" ? "disabled" : ""}>Подойти к ней</button>
          ${!ours ? '<div class="mute">Нападение на группу - бой групп этапа 4; в прототипе - заглушка.</div>' : ""}`;
				el.hidden = false;
				el.dataset.key = "g" + w.id + w.state + w.at;
				placePop();
				return;
			}
			const n = S.N.get(S.pop.id),
				here = me.at === n.id && me.state !== "walk";
			let h = `<button class="gl-x pop-x" data-pact="close" aria-label="Закрыть">×</button>`;
			if (n.kind === "lair") {
				const need = BOSS_N[S.d.star],
					esc_ = S.A.get(n.id).filter((x) => S.P.has(x)),
					ea = esc_.reduce((t, x) => t + pst(x).alive, 0),
					l = lvlOf(n);
				h += `<h3>${esc(S.bossName)}</h3><div class="mute">логово босса · ★${S.d.star} · <b class="lv" style="${lvlTag(l)}">ур. ${l}</b> ${lvlWord(l)} <span title="заглушка: уровень округа +3">*</span></div>
          <p>${bossLive() ? `Рассчитан на <b>${need}</b> бойцов. Свита на подходах: живых стай ${ea} - войдут в бой с боссом.` : "Босс побеждён - земля занята."}</p>
          <p class="mute">Награда: земля и город гильдии (заглушка).</p>
          ${bossLive() ? `<button class="gl-btn wide" data-pact="rally">${here ? "Открыть сбор" : "Сбор у логова"}</button>` : ""}`;
			} else {
				const P_ = S.P.get(n.id),
					f = P_.fl[S.pop.i],
					st = F.stateOf(f, S.now),
					k = P_.fl.length,
					full = TIER[tierOf(n)].gold * S.d.star,
					l = lvlOf(n);
				let state,
					btn = "";
				const b = st.alive ? f.busy : null;
				if (!st.alive) {
					state = `убита - вернётся через <b data-live="pback">${mmss(st.backIn)}</b>`;

					P_.fl.forEach((g, gi) => {
						if (gi !== S.pop.i && F.stateOf(g, S.now).alive && !g.busy)
							btn += `<button class="gl-btn wide" data-pact="go" data-fi="${gi}">Напасть на стаю ${gi + 1}</button>`;
					});
				} else if (!b) {
					state = "жива, свободна";
					btn = `<button class="gl-btn wide" data-pact="go" ${n.kind === "elite" && S.size < 3 ? "disabled" : ""}>Напасть</button>`;
				} else if (b.gid === "me")
					state = b.fight ? "<b>бьётся моя группа</b>" : "держит моя группа";
				else {
					const fi = S.fights.get(fKey(n.id, S.pop.i)),
						mineIn = fi && fi.ws.includes(me),
						ch = F.canHelp(f, idsOf(me));
					state = `${b.fight ? "в бою" : "занята"}: ${esc(wName(b.gid))}${mineIn ? " + моя группа" : ""} (${b.ids.length} ${pl(b.ids.length, "боец", "бойца", "бойцов")})`;
					if (!mineIn && me.state !== "fight")
						btn =
							b.guild === "ours" && b.fight
								? `<button class="gl-btn wide" data-pact="go" ${ch.ok ? "" : "disabled"}>Вступить в бой</button>${ch.ok ? "" : `<div class="mute">${esc(ch.error)}</div>`}`
								: `<button class="gl-btn ghost wide" data-pact="go">Ждать</button>`;
				}
				const fi = S.fights.get(fKey(n.id, S.pop.i));
				const lead = P_.stack && P_.stack.squad[0].mon;
				h += `<h3>${hasMon(lead) ? LGMon.icon(lead, iconTier(n), 40) : ""}${esc(P_.name.replace(" (свита)", ""))}</h3>
          <div class="mute">${TIER[tierOf(n)].n}${n.escort ? ", свита логова" : ""} · <b class="lv" style="${lvlTag(l)}">ур. ${l}</b> ${lvlWord(l)}${k > 1 ? ` · стая ${S.pop.i + 1} из ${k} на стоянке` : ""}</div>
          <ul class="sq">${squadOf(n, S.pop.i)
						.map(([nm, c]) => `<li>${esc(nm)}${c > 1 ? ` ×${c}` : ""}</li>`)
						.join("")}</ul>
          <p class="st">${state}</p>${fi ? `<span class="bar sm"><i data-live="pbar" style="--w:${(fi.t / fi.dur).toFixed(3)}"></i></span>` : ""}
          <p class="mute">${forGroup(n)} · награда ${full} монет (до 5 бойцов - каждому целиком)</p>
          ${n.kind === "elite" && S.size < 3 && !b ? '<div class="warn">Элитный - сбор 3-10: группа побольше.</div>' : ""}
          ${btn}${btn && !here ? '<div class="mute">Группа дойдёт и начнёт сама.</div>' : ""}
          ${st.alive ? "" : '<button class="gl-btn ghost wide" data-pact="come">Подойти сюда</button>'}`;
			}
			el.innerHTML = h;
			el.hidden = false;
			el.dataset.key = popKey();
			placePop();
		}
		const popKey = () => {
			if (!S.pop) return "";
			if (S.pop.cell)
				return (
					"c" +
					me.state +
					S.marks.length +
					(S.pop.o ? JSON.stringify(S.pop.o) : "")
				);
			if (S.pop.mnew || S.pop.medit != null)
				return "f" + S.pop.ic + (S.pop.medit ?? "") + S.marks.length;
			if (S.pop.mark != null) return "m" + S.pop.mark + S.marks.length;
			if (S.pop.res != null) {
				const r = S.res[S.pop.res];
				return (
					"r" +
					(r.back > S.now) +
					(me.gather === S.pop.res) +
					me.state +
					(S.gath && S.gath.i)
				);
			}
			if (S.pop.town) return "t" + S.owner + me.at + me.state;
			if (S.pop.gid) {
				const w = S.W.find((x) => x.id === S.pop.gid);
				return w ? "g" + w.id + w.state + w.at : "";
			}
			const n = S.N.get(S.pop.id);
			if (n.kind === "lair") return "l" + me.at + me.state + heroLvl();
			const f = S.P.get(n.id).fl[S.pop.i];
			return [
				F.stateOf(f, S.now).alive,
				f.busy && f.busy.gid,
				f.busy && f.busy.fight,
				f.busy && f.busy.ids.length,
				me.at,
				me.state,
				heroLvl(),
			].join("|");
		};

		function placePop() {
			const el = $("pop");
			if (!el || el.hidden || !S.pop) return;
			if (HOST.classList.contains("ph")) {
				el.style.transform = "";
				return;
			}
			const p = popAnchor(),
				sx = C.x + (p.x - S.B.x0) * K * C.z,
				sy = C.y + (p.y - S.B.y0) * K * C.z;
			const w = el.offsetWidth,
				h = el.offsetHeight,
				W = vpW(),
				H = vpH(),
				gapPx = 26;
			let x = sx - w / 2,
				y = sy - h - gapPx;
			if (y < 8) y = sy + gapPx;
			x = clamp(x, 8, W - w - 60);
			y = clamp(y, 8, H - h - 8);
			el.style.transform = `translate(${x.toFixed(0)}px,${y.toFixed(0)}px)`;
		}
		function onPopAct(e) {
			const b = e.target.closest("[data-pact]");
			if (!b) return;
			const a = b.dataset.pact,
				pop = S.pop;
			if (a === "close") {
				closePop();
				return;
			}
			if (pop && pop.cell) {
				cellAct(a);
				return;
			}
			if (a === "mgo") {
				const m = S.marks[pop.mark];
				closePop();
				const t = cellPt(cellOf(m).i, cellOf(m).j),
					r = go(me, t);
				if (r === true) {
					S.queue = [];
					me.hunt = null;
					S.flag = t;
					drawFlag();
				} else toast(r === "blocked" ? "Туда не пройти: путь закрыт" : r, true);
				renderSide();
				drawRoute();
				return;
			}
			if (a === "mic") {
				S.pop.nm = $("pop").querySelector("input.mname").value;
				S.pop.ic = b.dataset.v;
				renderPop();
				return;
			}
			if (a === "medit") {
				S.pop = { medit: pop.mark, ic: S.marks[pop.mark].ic };
				renderPop();
				return;
			}
			if (a === "mset") {
				const nm =
					($("pop").querySelector("input.mname").value || "").trim() ||
					MARK_IC[pop.ic].n;

				const r = pop.mnew
					? RL.markAdd(
							S.marks,
							{
								x: pop.mnew.x,
								y: pop.mnew.y,
								ic: pop.ic,
								name: nm,
								by: me.leader,
							},
							role(),
						)
					: RL.markEdit(S.marks, pop.medit, { ic: pop.ic, name: nm }, role());
				if (!r.ok) {
					toast(r.error, true);
					return;
				}
				S.marks = r.marks;
				closePop();
				drawMarkLayer();
				drawMini();
				toast(
					pop.mnew
						? `Метка «${nm}» поставлена (${S.marks.length} из ${MARK_MAX})`
						: "Метка изменена",
				);
				return;
			}
			if (a === "mdel") {
				const r = RL.markDel(
					S.marks,
					pop.medit != null ? pop.medit : pop.mark,
					role(),
				);
				if (!r.ok) {
					toast(r.error, true);
					return;
				}
				S.marks = r.marks;
				closePop();
				drawMarkLayer();
				drawMini();
				toast("Метка снята");
				return;
			}
			if (a === "gath") {
				const i = pop.res,
					r = S.res[i],
					mc = cellOf(me),
					rc = cellOf(r);
				if (me.state !== "walk" && mc.i === rc.i && mc.j === rc.j) {
					gather(i);
					renderPop();
					return;
				}
				const q = go(me, { x: r.x, y: r.y });
				if (q === true) {
					me.gather = i;
					S.flag = { x: r.x, y: r.y };
					drawFlag();
					toast("Группа идёт к месту сбора - соберёт сама");
				} else toast(q === "blocked" ? "Туда не пройти: путь закрыт" : q, true);
				renderPop();
				drawRoute();
				return;
			}
			if (a === "tenter") {
				const n = S.N.get(pop.id);
				closePop();
				if ((me.at === n.id || me.at === S.gate.id) && me.state !== "walk")
					enterTown();
				else {
					walkTo(n.id);
					me.enter = true;
				}
				return;
			}
			if (a === "gcome" || a === "gatk") {
				const w = S.W.find((x) => x.id === pop.gid);
				closePop();
				if (!w) return;
				const p = wPos(w),
					t =
						w.state !== "walk" && w.at
							? { ...S.N.get(w.at), id: w.at }
							: { x: p.x, y: p.y };
				const r = go(me, t);
				if (r === true) {
					S.flag = { x: t.x, y: t.y };
					drawFlag();
					if (a === "gatk") {
						me.hunt = w.id;
						toast(`Идём нападать на ${wName(w.id)} (бой групп - заглушка)`);
					} else toast(`Идём к ${wName(w.id)}`);
				} else toast(r === "blocked" ? "Туда не пройти: путь закрыт" : r, true);
				renderSide();
				drawRoute();
				return;
			}
			if (a === "rally") {
				closePop();
				if (me.at === S.lair.id) {
					S.sel = S.lair.id;
					renderSide();
				} else {
					walkTo(S.lair.id);
					if (S.guide) rally();
				}
				return;
			}
			if (a === "come") {
				const p = popAnchor();
				closePop();
				const r = pop.town ? walkTo(pop.id) : go(me, { x: p.x, y: p.y });
				if (r === true) {
					S.flag = { x: p.x, y: p.y };
					drawFlag();
				} else if (r)
					toast(r === "blocked" ? "Туда не пройти: путь закрыт" : r, true);
				renderSide();
				drawRoute();
				return;
			}
			if (a === "go" && b.dataset.fi != null) pop.i = +b.dataset.fi;
			if (a === "go") {
				closePop();
				if (me.at === pop.id && me.state !== "walk") {
					flockClick(pop.id, pop.i);
					return;
				}
				me.pend = { id: pop.id, i: pop.i };
				S.selFlock = pop.i;
				walkTo(pop.id);
				if (me.state !== "walk") me.pend = null;
				else toast("Группа идёт к стае - дойдёт и начнёт сама");
			}
		}

		function flockClick(id, i) {
			S.sel = id;
			S.selFlock = i;
			const f = S.P.get(id).fl[i],
				st = F.stateOf(f, S.now);
			if (!st.alive)
				toast(`Стая ${i + 1} убита - вернётся через ${mmss(st.backIn)}`);
			else if (me.state === "fight") toast("Идёт бой - дождись конца", true);
			else if (!f.busy || f.busy.gid === "me") {
				const r = attack(me, id, i);
				if (r !== true) toast(r, true);
			} else if (f.busy.guild === "ours" && f.busy.fight) {
				const r = joinFight(me, fKey(id, i));
				toast(
					r === true ? "Вступили в бой: награда - 5 долей на всех бойцов" : r,
					r !== true,
				);
			} else {
				const r = F.wait(f, groupOf(me), S.now);
				if (r.ok) {
					S.P.get(id).fl[i] = r.flock;
					me.waitKey = fKey(id, i);
					toast(`Стаю держит ${wName(f.busy.gid)} - ждём в очереди`);
				} else toast(r.error, true);
			}
			drawMarks();
			renderSide();
		}
		const toWorld = (sx, sy) => ({
			x: S.B.x0 + (sx - C.x) / (K * C.z),
			y: S.B.y0 + (sy - C.y) / (K * C.z),
		});
		const ptrs = new Map();
		let drag = null,
			pinch = null;
		vp.addEventListener("pointerdown", (e) => {
			if (e.target.closest(".ctl, .mm, .hint, .pop")) return;
			if (e.button === 2) return;
			vp.setPointerCapture(e.pointerId);
			ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
			if (ptrs.size === 1)
				drag = {
					x: e.clientX,
					y: e.clientY,
					cx: C.x,
					cy: C.y,
					moved: false,
					tgt: e.target.closest && e.target.closest("[data-id]"),
				};
			else if (ptrs.size === 2) {
				const [a, b] = [...ptrs.values()];
				pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), z: C.z };
				if (drag) drag.moved = true;
			}
		});

		const HOV_R = 1;
		function hoverRing(c, ok) {
			const g = $("hovn");
			if (!g) return;
			if (!c || !ok) {
				g.setAttribute("opacity", 0);
				return;
			}
			if (!g.childNodes.length || g.dataset.cell !== String(G.cell)) {
				let h = "";
				for (let dj = -HOV_R; dj <= HOV_R; dj++)
					for (let di = -HOV_R; di <= HOV_R; di++) {
						if (!di && !dj) continue;
						if (di && dj) continue;
						const d = Math.max(Math.abs(di), Math.abs(dj)),
							a = d === 1 ? 0.22 : 0;
						h += `<rect data-di="${di}" data-dj="${dj}" x="${di * G.cell}" y="${dj * G.cell}" width="${G.cell}" height="${G.cell}" fill="#fff" fill-opacity="${a}" stroke="#fff" stroke-opacity="${a * 0.9}" stroke-width="0.6"/>`;
					}
				g.innerHTML = h;
				g.dataset.cell = String(G.cell);
			}
			for (const r of g.childNodes) {
				const i = c.i + +r.dataset.di,
					j = c.j + +r.dataset.dj;
				r.style.display = gPass(i, j) ? "" : "none";
			}
			g.setAttribute(
				"transform",
				`translate(${G.x0 + c.i * G.cell},${G.y0 + c.j * G.cell})`,
			);
			g.setAttribute("opacity", 1);
		}
		function hoverCell(c) {
			const r = $("hov");
			if (!r) return;
			if (
				!c ||
				!G ||
				c.i < 0 ||
				c.j < 0 ||
				c.i >= G.w ||
				c.j >= G.h ||
				G.rows[c.j][c.i] === " "
			) {
				r.setAttribute("opacity", 0);
				hoverRing(null);
				vp.classList.remove("nogo");
				S.hovC = null;
				return;
			}
			const ok = gPass(c.i, c.j);
			hoverRing(c, ok);
			S.hovC = c;
			r.setAttribute("width", G.cell);
			r.setAttribute("height", G.cell);
			r.setAttribute(
				"transform",
				`translate(${G.x0 + c.i * G.cell},${G.y0 + c.j * G.cell})`,
			);
			r.setAttribute("class", ok ? "ok" : "no");
			r.setAttribute("opacity", 1);
			vp.classList.toggle("nogo", !ok);
		}

		function hotObj(id) {
			if (S.hotId === id) return;
			if (S.hotId)
				HOST.querySelectorAll(`.nd.hot`).forEach((e) =>
					e.classList.remove("hot"),
				);
			S.hotId = id || null;
			if (id)
				HOST.querySelectorAll(`.nd[data-id="${id}"]`).forEach((e) =>
					e.classList.add("hot"),
				);
		}
		function hoverAt(sx, sy) {
			const h = hitAt(sx, sy);
			vp.classList.toggle("onmark", !!h);
			hotObj(h ? h.id : null);
			hoverCell(cellOf(toWorld(sx, sy)));
		}
		vp.addEventListener("pointermove", (e) => {
			if (
				e.pointerType === "mouse" &&
				!ptrs.size &&
				!e.target.closest(".ctl, .mm, .hint, .pop")
			) {
				const r = vp.getBoundingClientRect();
				hoverAt(e.clientX - r.left, e.clientY - r.top);
			}
		});
		vp.addEventListener("pointerleave", () => {
			hoverCell(null);
			hotObj(null);
			vp.classList.remove("onmark");
		});
		vp.addEventListener("pointerdown", (e) => {
			if (e.pointerType !== "mouse") hoverCell(null);
		});
		vp.addEventListener("pointermove", (e) => {
			if (!ptrs.has(e.pointerId)) return;
			ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
			const r = vp.getBoundingClientRect();
			if (pinch && ptrs.size >= 2) {
				const [a, b] = [...ptrs.values()],
					d = Math.hypot(a.x - b.x, a.y - b.y);
				zoomAt(
					(pinch.z * d) / pinch.d / C.z,
					(a.x + b.x) / 2 - r.left,
					(a.y + b.y) / 2 - r.top,
				);
			} else if (drag) {
				const dx = e.clientX - drag.x,
					dy = e.clientY - drag.y;
				if (!drag.moved && Math.hypot(dx, dy) > 6) {
					drag.moved = true;
					vp.classList.add("drag");
					S.follow = false;
					hoverCell(null);
				}
				if (drag.moved) {
					C.x = drag.cx + dx;
					C.y = drag.cy + dy;
					applyCam();
				}
			}
		});
		function up(e) {
			if (!ptrs.has(e.pointerId)) return;
			ptrs.delete(e.pointerId);
			if (ptrs.size < 2) pinch = null;
			if (drag && ptrs.size === 0) {
				if (!drag.moved && e.button === 0) {
					const r = vp.getBoundingClientRect();
					S.shift = e.shiftKey;
					clickAt(e.clientX - r.left, e.clientY - r.top);
					S.shift = false;
				}
				drag = null;
				vp.classList.remove("drag");
			}
		}
		$("sideBtn").onclick = () => {
			const on = $("bd").classList.toggle("open");
			$("sideBtn").setAttribute("aria-pressed", on);
		};
		$("znear").onclick = nearestFlock;

		vp.addEventListener("contextmenu", (e) => {
			e.preventDefault();
			const r = vp.getBoundingClientRect();
			cellMenu(e.clientX - r.left, e.clientY - r.top);
		});
		vp.addEventListener("pointerup", up);
		vp.addEventListener("pointercancel", up);
		vp.addEventListener(
			"wheel",
			(e) => {
				e.preventDefault();
				const r = vp.getBoundingClientRect();
				S.follow = false;
				zoomAt(
					Math.exp(-e.deltaY * 0.0015),
					e.clientX - r.left,
					e.clientY - r.top,
				);
				drawFlag();
			},
			{ passive: false },
		);
		$("zin").onclick = () => zoomAt(1.35, vpW() / 2, vpH() / 2, true);
		$("zout").onclick = () => zoomAt(1 / 1.35, vpW() / 2, vpH() / 2, true);
		$("zall").onclick = () => fitAll(true);
		$("zme").onclick = () => {
			S.follow = me.state === "walk";
			centerOn(me, Math.max(C.z, Z(0.85)), true);
		};
		function miniGo(e) {
			const svg = $("mini"),
				pt = svg.createSVGPoint();
			pt.x = e.clientX;
			pt.y = e.clientY;
			const p = pt.matrixTransform(svg.getScreenCTM().inverse());
			S.follow = false;
			centerOn(p, null, e.type === "click");
		}
		$("mm").addEventListener("click", miniGo);
		$("mm").addEventListener("pointermove", (e) => {
			if (e.buttons === 1) miniGo(e);
		});

		function header() {
			const d = S.d;
			let live = 0,
				tot = 0;
			for (const id of S.P.keys()) {
				const ps = pst(id);
				live += ps.alive;
				tot += ps.n;
			}
			$("title").textContent = `${d.name} ${"★".repeat(d.star)}`;
			const own =
				S.owner === "none"
					? '<span class="chip warn">ничья земля - босс жив</span>'
					: S.owner === "ours"
						? `<span class="chip ok">земля нашей гильдии «${GUILD.ours.n}»</span>`
						: `<span class="chip">земля гильдии «${GUILD.enemy.n}»</span>`;
			$("chips").innerHTML =
				`<span class="chip opt">${esc(d.biomeName)}</span><span class="chip opt">город ${esc(d.town)}</span>${own}
        <span class="chip hi">стай живы ${live} из ${tot}</span><span class="chip opt">возврат ${respawnMin()} мин</span><span class="chip proto">в разработке</span>`;
			const sel = $("dsel");
			sel.hidden = !S.debug;
			if (sel.options.length !== DATA.districts.length)
				sel.innerHTML = DATA.districts
					.map(
						(x, i) =>
							`<option value="${i}">${esc(x.name)} ${"★".repeat(x.star)}</option>`,
					)
					.join("");
			sel.value = String(S.di);
		}
		function statusOf(w) {
			if (w.state === "walk")
				return `идёт к «${esc(targetName(w.target))}» - <b data-live="eta">${secs(pathLeft(w) / speed())}</b>`;
			if (w.state === "fight") {
				const fi = S.fights.get(w.fk);
				return `бой со стаей «${esc(S.P.get(fi.place).name)}»${fi.ws.length > 1 ? `, ${fi.ws.length} группы` : ""}`;
			}
			if (w.waitKey) return `ждёт стаю у «${esc(S.P.get(w.at).name)}»`;
			return `стоит: ${w.at ? esc(nodeName(S.N.get(w.at))) : "в поле"}`;
		}
		function iconOf(n) {
			return `<span class="ic"><svg viewBox="-16 -16 32 32">${n.kind === "lair" ? '<g transform="scale(.9)">' : '<g transform="scale(1.3)">'}${nodeSvg(
				n,
			)
				.replace(/<text[^]*?<\/text>/g, "")
				.replace(/class="wd[^"]*"/g, "")}</g></svg></span>`;
		}

		function flockRows(n, here) {
			const P_ = S.P.get(n.id),
				full = TIER[tierOf(n)].gold * S.d.star;
			let h = '<ul class="fl">';
			P_.fl.forEach((f, i) => {
				const st = F.stateOf(f, S.now),
					b = st.alive ? f.busy : null;
				let txt,
					btn = "";
				if (!st.alive)
					txt = `убита - вернётся через <b data-live="back" data-id="${n.id}" data-i="${i}">${mmss(st.backIn)}</b>`;
				else if (!b) {
					txt = "жива, свободна";
					if (here && me.state !== "fight")
						btn = `<button class="gl-mini on" data-act="attack" data-v="${i}" ${n.kind === "elite" && S.size < 3 ? "disabled" : ""}>Напасть</button>`;
				} else if (b.gid === "me") {
					txt = b.fight
						? `<b>бьётся моя группа</b>${(+b.parts || 1) > 1 ? " с подмогой" : ""}`
						: "держит моя группа";
					if (!b.fight && here)
						btn = `<button class="gl-mini on" data-act="attack" data-v="${i}">Напасть</button>`;
				} else {
					const fi = S.fights.get(fKey(n.id, i));
					const mineIn = fi && fi.ws.includes(me);
					txt = `${b.fight ? "бьётся" : "держит"} ${esc(wName(b.gid))}${mineIn ? " + <b>моя группа</b>" : ""} (${b.ids.length} ${pl(b.ids.length, "боец", "бойца", "бойцов")})`;
					if (here && !mineIn && me.state !== "fight") {
						const ch = F.canHelp(f, idsOf(me));
						if (b.guild === "ours" && b.fight && ch.ok)
							btn = `<button class="gl-mini on" data-act="help" data-v="${fKey(n.id, i)}">Вступить в бой</button>`;
						else if (b.guild === "ours" && b.fight)
							btn = `<span class="mute">${esc(ch.error)}</span>`;
						else if (!(f.wait || []).some((x) => x.gid === "me"))
							btn = `<button class="gl-mini" data-act="wait" data-v="${i}">Ждать</button>`;
						else btn = '<span class="mute">ждём</span>';
					}
				}
				const fi = S.fights.get(fKey(n.id, i));
				h += `<li${S.selFlock === i ? ' class="on"' : ""}><span class="ic" style="width:18px;height:18px"><svg viewBox="-10 -10 20 20"><circle r="7" fill="${st.alive ? TIER[tierOf(n)].c : "#8d8478"}" stroke="#2b1d18" stroke-width="1.6"/></svg></span><span>Стая ${i + 1}: ${txt}${fi ? `<span class="bar sm"><i data-live="fbar" data-k="${fKey(n.id, i)}" style="--w:${(fi.t / fi.dur).toFixed(3)}"></i></span>` : ""}</span>${btn}</li>`;
			});
			h += "</ul>";
			if (here) {
				const f = S.size,
					ch = chance(n, f);
				h += `<div class="mute">Бойцов в группе: ${f}, шанс ~${Math.round(ch * 100)}%. Награда стаи - ${full} монет: до 5 бойцов - каждому целиком, больше (с подмогой) - 5 долей на всех.</div>`;
				if (n.kind === "elite" && f < 3)
					h +=
						'<div class="warn">Элитный - сбор 3-10: собери группу побольше.</div>';
			}
			return h;
		}
		function placeCard() {
			const id = S.sel || me.at;
			if (!id)
				return me.state === "walk"
					? `<h3>Квадрат на карте</h3><p>Группа идёт в квадрат напрямик по свободным клеткам: поле и дороги, мимо чащи, воды и полян с живыми стаями.</p><div class="okm">В пути - <b data-live="eta">${secs(pathLeft(me) / speed())}</b></div>`
					: `<h3>Поле</h3><p>Группа стоит в квадрате поля. Отсюда можно идти в любой свободный квадрат или к месту.</p>`;
			const n = S.N.get(id),
				here = me.at === id && me.state !== "walk";
			let h = `<h3>${iconOf(n)}<span>${esc(nodeName(n))}</span>${isPack(n) || n.kind === "lair" ? `<b class="lv" style="${lvlTag(lvlOf(n))}">ур. ${lvlOf(n)}</b>` : ""}</h3><div class="mute">${KIND[n.kind]}${n.kind === "pack" ? `, ${TIER[n.tier].n}, стай ${S.P.get(id).fl.length}${n.escort ? ", свита логова" : ""}${n.main ? ", главная дорога" : ""}` : ""}${n.kind === "exit" ? ` - округ «${esc(S.d.nb[n.to] || n.to)}»${n.trail ? ", мимо тракта" : ""}` : ""}</div>`;
			if (isPack(n)) {
				const ps = pst(id);
				h +=
					`<p>${ps.passable ? "Все стаи убиты - стоянку можно пройти." : `Живых стай ${ps.alive} из ${ps.n}. Пройти можно, когда убиты все.`}</p>` +
					flockRows(n, here);
				if (S.guide) {
					const p = S.P.get(id);
					h += `<div class="sep"></div><div class="mute">Метка руководства:</div><div class="row"><button class="gl-mini ${p.mark === "first" ? "on" : ""}" data-act="mark" data-v="first">Чистить первой</button><button class="gl-mini ${p.mark === "leave" ? "on" : ""}" data-act="mark" data-v="leave">Оставить</button>${p.mark ? '<button class="gl-mini" data-act="mark" data-v="">Снять</button>' : ""}</div>`;
				}
			} else if (n.kind === "lair") h += lairCard(here);
			else if (n.kind === "town")
				h += `<p>${bossLive() ? "В ничьём округе город держат монстры: войти нельзя, со стен стреляют." : "Округ занят: в городе безопасно, вход и выход для хозяев и гостей."}</p>`;
			else if (n.kind === "exit") {
				const nb = DATA.districts.findIndex((x) => x.id === n.to);
				h += `<p>${n.trail ? "Просёлок к соседу мимо тракта." : "Тракт уходит к соседу. Стай на тракте нет."}</p>${here ? `<button class="gl-btn wide" data-act="nb" data-v="${esc(n.to)}">Перейти в «${esc(S.d.nb[n.to] || n.to)}»</button>` : ""}`;
			} else if (n.kind === "spot")
				h += S.ev.has(id)
					? `<p>На поляне путник с «!» - заглушка под события и микро-квесты.</p>${here ? '<button class="gl-btn wide" data-act="ev">Поговорить</button>' : ""}`
					: '<p class="mute">Поляна без стай. Сюда позже придут события и путники.</p>';
			else if (n.kind === "way")
				h += `<p>Точка пути без стай: можно просто прийти, оглядеться. Позже - события, путники, тайники.</p>`;
			else if (n.kind === "dungeon")
				h += `<p>Вход в данж - группа из 5.</p>${here ? `<button class="gl-btn wide" data-act="dun" ${S.size < 5 ? "disabled" : ""}>Войти (заглушка)</button>${S.size < 5 ? '<p class="mute">Нужно 5 бойцов.</p>' : ""}` : ""}`;
			else if (n.kind === "cross")
				h +=
					"<p>Лагерь новичков и тех, у кого нет города (шаг 3.1). Здесь - заглушка.</p>";
			else if (n.kind === "gate")
				h +=
					"<p>Отсюда идёт тракт. Слабые стаи - в одном переходе от ворот.</p>";
			else h += '<p class="mute">Точка тракта - стай здесь нет.</p>';
			if (!here && me.state === "walk" && me.target && me.target.id === id)
				h += `<div class="sep"></div><div class="okm">Группа идёт сюда - <b data-live="eta">${secs(pathLeft(me) / speed())}</b></div>`;
			else if (!here && n.kind !== "town") {
				const live = liveSet();
				let d = null,
					hops = null;
				if (me.at && me.state !== "walk") {
					const r = DG.route(S.sch, me.at, id, live);
					if (r) {
						d = r.d;
						hops = r.path.length - 1;
					}
				}
				if (d == null) {
					const r = gridRoute(wPos(me), n, live, { target: id, start: me.at });
					if (r) d = r.d;
				}
				if (d != null)
					h += `<div class="sep"></div><div class="row"><span>${hops ? `${hops} ${pl(hops, "переход", "перехода", "переходов")}` : "по квадратам"}, ~${secs(d / speed())}</span><span class="sp"></span><button class="gl-btn" data-act="go">Идти</button></div>`;
				else
					h +=
						'<div class="warn">Дорогу закрывают живые стаи - нажми на место, покажу какие.</div>';
			}
			return h;
		}
		function atLair() {
			let n = 0;
			const who = [];
			for (const w of S.W)
				if (w.guild === "ours" && w.at === S.lair.id && w.state !== "walk") {
					const k = w.mine ? S.size : w.size;
					n += k;
					who.push(`${w.mine ? "моя группа" : w.name} (${k})`);
				}
			if (S.squad && n) {
				n += S.squadN;
				who.push(`ещё бойцы гильдии (${S.squadN})`);
			}
			return { n, who };
		}
		const packsLeft = () =>
			[...S.P.values()].reduce(
				(t, p) => t + p.fl.filter((f) => F.stateOf(f, S.now).alive).length,
				0,
			);
		function lairCard(here) {
			if (!bossLive())
				return `<p>Босса нет: ${S.owner === "ours" ? "земля наша" : `земля гильдии «${GUILD.enemy.n}»`}. Землю бросят - босс вернётся через срок.</p><p class="mute">Чужую землю берут осадой города (р. 20), а не через логово.</p>`;
			const need = BOSS_N[S.d.star],
				{ n, who } = atLair();
			const esc_ = S.A.get(S.lair.id)
				.filter((id) => S.P.has(id))
				.map((id) => ({ id, p: S.P.get(id), ps: pst(id) }));
			const alive = esc_.filter((x) => !x.ps.passable);
			let h = `<p>Босс «${esc(S.bossName)}» рассчитан на <b>${need}</b> бойцов (★${S.d.star}).</p>
        <div class="row"><b>Сбор у логова: ${n} из ${need}</b></div><div class="bar boss"><i style="--w:${Math.min(1, n / need).toFixed(3)}"></i></div>
        ${who.length ? `<div class="mute">У логова: ${esc(who.join(", "))}</div>` : '<div class="mute">У логова пока никого.</div>'}
        <div class="sep"></div><div><b>Свита</b> - стоянки на подходах:</div><ul class="esc">${esc_.map((x) => `<li><span class="ic" style="width:16px;height:16px"><svg viewBox="-10 -10 20 20"><circle r="7" fill="${x.ps.passable ? "#8d8478" : TIER.strong.c}" stroke="#2b1d18" stroke-width="1.6"/></svg></span><span>${esc(x.p.name.replace(" (свита)", ""))} - ${x.ps.passable ? "убита" : `<b>живы ${x.ps.alive} из ${x.ps.n}: войдут в бой с боссом</b>`}</span></li>`).join("")}</ul>`;
			const left = packsLeft();
			if (left)
				h += `<div class="warn">К боссу - только когда зачищены все стаи округа: осталось ${left}.</div>`;
			if (false)
				h +=
					'<div class="warn">Все подходы закрыты свитой: к логову не подойти, пока не убита хотя бы одна стоянка.</div>';
			if (here)
				h += `<button class="gl-btn wide bad" data-act="boss" ${n < need || left ? "disabled" : ""}>Бой с боссом${alive.length ? ` (+${alive.reduce((s, x) => s + x.ps.alive, 0)} стай свиты)` : ""}</button>${n < need ? `<p class="mute">Нужно ещё ${need - n}. «Сбор у логова» зовёт группы гильдии.</p>` : ""}`;
			return h;
		}
		function guideCard() {
			let h = `<h3>Руководство</h3><p class="mute">В игре - глава и офицеры. Групп гильдии в округе: ${S.W.filter((w) => w.guild === "ours").length}.</p>
        <div class="row"><button class="gl-btn" data-act="split">Разойтись по стаям</button><button class="gl-btn ghost" data-act="rally">Сбор у логова</button></div>
        <div class="row"><button class="gl-mini" data-act="markroad">Дорогу к логову - чистить первой</button><button class="gl-mini" data-act="unmark">Снять метки</button></div>`;
			if (S.plan) {
				h += `<ul class="plan">${S.plan.map((a) => `<li><i style="background:${a.c}"></i><span>${esc(cap(a.name))} (${a.size}) → «${esc(S.P.get(a.target).name)}», ${a.path.length - 1} ${pl(a.path.length - 1, "переход", "перехода", "переходов")}${S.P.get(a.target).mark === "first" ? ", <b>первая</b>" : ""}</span></li>`).join("")}</ul>
          <button class="gl-btn wide" data-act="send">Отправить группы</button><p class="mute">На стоянке с 2-3 стаями - по группе на стаю. «Оставить» не предлагается, «чистить первой» - в начале.</p>`;
			} else
				h +=
					'<p class="mute">Нажми на стоянку - метки «чистить первой» / «оставить».</p>';
			return h;
		}

		function drawGrp() {
			const el = $("grp");
			if (!el || !me) return;
			const h = `<b>${esc(me.leader)} (ты)</b> · ${S.size} ${pl(S.size, "герой", "героя", "героев")}<div data-live="status">${statusOf(me)}</div><div class="mute">Бои сегодня: ${S.daily} из ${DAILY}${S.debug ? ` · монеты: ${S.gold}` : ""}${S.gath ? " · собираем..." : ""}</div>`;
			if (el.dataset.h !== h) {
				el.innerHTML = h;
				el.dataset.h = h;
			}
		}
		function renderSide() {
			drawGrp();
			let h = `<section class="card hi"><h3>Моя группа</h3>
        ${S.debug ? `<div class="row"><button class="gl-mini" data-act="sz" data-v="-1" ${S.size <= 1 ? "disabled" : ""} aria-label="Меньше">−</button><span class="num">${S.size}</span><button class="gl-mini" data-act="sz" data-v="1" ${S.size >= 5 ? "disabled" : ""} aria-label="Больше">+</button><span>${pl(S.size, "герой", "героя", "героев")} (до 5)</span></div>` : ""}
        <div data-live="status">${statusOf(me)}</div>
        <div class="mute">Бои сегодня: ${S.daily} из ${DAILY}${S.debug ? ` · монеты: ${S.gold}` : ""}</div>
        ${S.last ? `<div class="mute">Последняя: «${esc(S.last.name)}» - ${S.last.lim ? `+${S.last.got} из ${S.last.full}${S.last.fighters > 5 ? `, 5 долей на ${S.last.fighters} бойцов (${S.last.groups} группы)` : ", целиком"}` : "без награды (предел)"}</div>` : ""}
        </section>`;
			h += `<section class="card place">${placeCard()}</section>`;
			if (S.guide) h += `<section class="card">${guideCard()}</section>`;
			if (S.debug)
				h += `<details class="card" ${Q.get("open") === "set" ? "open" : ""}><summary>Настройки (отладка)</summary>
        <div class="row"><label><input type="checkbox" data-act="grid" ${S.showGrid ? "checked" : ""}> показать квадраты</label></div>
        <div class="row"><span>Сек на 100 единиц</span><input type="range" min="1" max="20" step="1" value="${S.secPer100}" data-act="spd"><b data-live="spdv">${S.secPer100}</b></div>
        <div class="mute">Обычный переход 70-80 единиц - ${(S.secPer100 * 0.75).toFixed(1).replace(".", ",")} с.</div>
        <div class="row"><span>Уровень героев группы</span><button class="gl-mini" data-act="hl" data-v="-1">−</button><span class="num">${heroLvl()}</span><button class="gl-mini" data-act="hl" data-v="1">+</button></div>
        <div class="mute">Цвет плашек уровня: зелёный - легко (ниже на 1+), жёлтый - вровень, красный - тяжело (выше на 2+). Округ - ур. ${distLvl()}.</div>
        <div class="row"><span>Поле медленнее дороги</span>${[1, 1.5, 2].map((v) => `<button class="gl-mini ${S.fieldMul === v ? "on" : ""}" data-act="fm" data-v="${v}">×${String(v).replace(".", ",")}</button>`).join("")}</div>
        <div class="mute">Решение 22.11: поле медленнее; по умолчанию ×1,5 (черновое число).</div>
        <div class="row"><span>Ходьба и бой</span><button class="gl-mini ${S.walkMul === 1 ? "on" : ""}" data-act="wm" data-v="1">×1</button><button class="gl-mini ${S.walkMul === 5 ? "on" : ""}" data-act="wm" data-v="5">×5</button></div>
        <div class="row"><span>Время возврата</span>${[1, 60, 600].map((v) => `<button class="gl-mini ${S.timeMul === v ? "on" : ""}" data-act="tm" data-v="${v}">×${v}</button>`).join("")}</div>
        <div class="row"><span>Моя роль</span><button class="gl-mini ${S.lead ? "on" : ""}" data-act="lead" data-v="1">руководство</button><button class="gl-mini ${!S.lead ? "on" : ""}" data-act="lead" data-v="0">игрок</button></div>
        <div class="mute">Метки (ПКМ по клетке) ставят и меняют только глава и руководство гильдии.</div>
        <div class="row"><span>Земля</span>${[
					["none", "ничья"],
					["ours", "наша"],
					["enemy", "чужая"],
				]
					.map(
						([v, t]) =>
							`<button class="gl-mini ${S.owner === v ? "on" : ""}" data-act="own" data-v="${v}">${t}</button>`,
					)
					.join("")}</div>
        <div class="row"><span>Клик</span><button class="gl-mini ${S.clickGo ? "on" : ""}" data-act="cg" data-v="1">сразу идти</button><button class="gl-mini ${!S.clickGo ? "on" : ""}" data-act="cg" data-v="0">сначала путь</button></div>
        <div class="row"><span>Рисунок</span><button class="gl-mini ${S.art === "stub" ? "on" : ""}" data-act="art" data-v="stub">заглушка</button><button class="gl-mini ${S.art === "real" ? "on" : ""}" data-act="art" data-v="real" ${DATA.art ? "" : "disabled"}>настоящий</button></div>
        <div class="row"><label><input type="checkbox" data-act="squad" ${S.squad ? "checked" : ""}> ещё бойцы гильдии у логова</label><button class="gl-mini" data-act="sq" data-v="-1">−</button><span class="num">${S.squadN}</span><button class="gl-mini" data-act="sq" data-v="1">+</button></div>
        <div class="row"><span>Стиль окна</span><select data-act="gst">${STYLES.map(([v, t]) => `<option value="${v}" ${HOST.dataset.gst === v ? "selected" : ""}>${t}</option>`).join("")}</select></div>
        <div class="row"><button class="gl-mini" data-act="reset">Начать округ заново</button></div>
        <div class="mute">Сборка ${esc(DATA.built)}, схема v${S.sch.gen}, VIEW_K ${K}, квадрат ${G ? G.cell : "-"} ед. (${G && G.real ? "сетка генератора" : "временная сетка"}).</div></details>`;
			h += `<details class="card" ${Q.get("open") === "how" ? "open" : ""}><summary>Как это работает</summary><ul class="l">
        <li>Нажми на место - группа идёт по дорогам. Нажми в поле - идёт в этот квадрат напрямик по свободным клеткам.</li>
        <li>Чаща, скалы, вода - не пройти. Поляну с живыми стаями - тоже.</li>
        <li>Стоянка - 1-3 стаи. Каждую бьёт своя группа, одновременно. Пройти можно, когда убиты все.</li>
        <li>Своя группа уже в бою - можно вступить в бой: до 2 групп и 10 бойцов, награда - 5 долей на всех.</li>
        <li>Чужая группа заняла все стаи - ждать или уйти. Бой не прерывается.</li>
        <li>Убитая стая возвращается через 60 мин, пока жив босс, в занятом округе - через 20.</li>
        <li>Логово в тупике, подходов несколько. Живая свита входит в бой с боссом.</li>
        <li>Точки пути - пустые места: у озера, брод, старый дуб. Позже там события.</li>
        <li><b>Прототип:</b> бой, награды, путники, чужая группа, сетка квадратов - заглушки.</li></ul>
        <div class="leg">${legend()}</div></details>`;
			$("side").innerHTML = h;
			liveUi();
		}
		function legend() {
			const ic = (svg, t) =>
				`<span><svg viewBox="-12 -12 24 24">${svg}</svg>${t}</span>`;
			const pk = (c) =>
				`<circle r="7" fill="${c}" stroke="#2b1d18" stroke-width="1.6"/><use href="#dmi-fang" x="-5" y="-5" width="10" height="10"/>`;
			return (
				ic(pk(TIER.weak.c), "слабая стая") +
				ic(pk(TIER.mid.c), "обычная") +
				ic(pk(TIER.strong.c), "сильная") +
				ic(
					`<circle cx="-5" cy="2" r="4.5" fill="${TIER.mid.c}" stroke="#2b1d18"/><circle cx="5" cy="2" r="4.5" fill="${TIER.mid.c}" stroke="#2b1d18"/><circle cx="0" cy="-5" r="4.5" fill="${TIER.mid.c}" stroke="#2b1d18"/>`,
					"стоянка 3 стаи",
				) +
				ic(
					`<circle r="8" fill="${TIER.elite.c}" stroke="#2b1d18" stroke-width="1.6"/><use href="#dmi-skull" x="-6" y="-6" width="12" height="12"/>`,
					"элитный",
				) +
				ic(
					'<circle r="6" fill="#8d8478" stroke="#3e352e" stroke-width="1.2"/><path d="M-3-3l6 6M3-3l-6 6" stroke="#3e352e" stroke-width="1.6"/>',
					"убита, ждёт",
				) +
				ic(
					'<circle r="4" fill="#fff8e8" stroke="#2b1d18"/><path d="M0-4V-11" stroke="#2b1d18"/><path d="M0-11h7l-2 2 2 2h-7z" fill="#5fa8d0" stroke="#2b1d18" stroke-width=".7"/>',
					"точка пути",
				) +
				ic(
					'<circle r="9" fill="#5a2a22" stroke="#2b1d18" stroke-width="1.6"/><use href="#dmi-skull" x="-7" y="-7" width="14" height="14"/>',
					"логово",
				) +
				ic(
					'<circle r="4.6" fill="#ffcf4a" stroke="#2b1d18"/><use href="#dmi-swords" x="-3.5" y="-3.5" width="7" height="7"/>',
					"бой",
				) +
				ic(
					'<circle r="4.5" fill="#3d7be0" stroke="#2b1d18"/><text y="2.5" style="font:900 6px system-ui;text-anchor:middle;fill:#fff">2</text>',
					"подмога",
				) +
				ic(
					'<rect x="-8" y="-8" width="16" height="16" fill="url(#dmhatch)" stroke="#2b1d18" stroke-width=".6"/>',
					"не пройти",
				) +
				ic(
					'<path d="M0 8V-6" stroke="#2b1d18"/><path d="M0-6h8l-2 2.5 2 2.5h-8z" fill="#ffcf4a" stroke="#2b1d18"/>',
					"цель в квадрате",
				)
			);
		}
		function liveUi() {
			drawGrp();
			const side = $("side");
			for (const el of side.querySelectorAll('[data-live="back"]')) {
				const f = S.P.get(el.dataset.id).fl[+el.dataset.i];
				const st = F.stateOf(f, S.now);
				el.textContent = st.alive ? "вернулась" : mmss(st.backIn);
			}
			for (const eta of side.querySelectorAll('[data-live="eta"]'))
				eta.textContent = secs(pathLeft(me) / speed());
			for (const el of side.querySelectorAll('[data-live="fbar"]')) {
				const fi = S.fights.get(el.dataset.k);
				el.style.setProperty("--w", fi ? (fi.t / fi.dur).toFixed(3) : 1);
			}
			const st = side.querySelector('[data-live="status"]');
			if (
				st &&
				st.dataset.s !== me.state + (me.target && me.target.x) + me.waitKey
			) {
				st.dataset.s = me.state + (me.target && me.target.x) + me.waitKey;
				st.innerHTML = statusOf(me);
			}
			if (S.pop) {
				const el = $("pop");
				if (el && el.dataset.key !== popKey()) renderPop();
				else if (el) {
					const pb = el.querySelector('[data-live="pback"]');
					if (pb && S.P.has(S.pop.id)) {
						const st = F.stateOf(S.P.get(S.pop.id).fl[S.pop.i], S.now);
						pb.textContent = mmss(st.backIn);
					}
					const bar = el.querySelector('[data-live="pbar"]');
					const fi = S.fights.get(fKey(S.pop.id, S.pop.i));
					if (bar && fi)
						bar.style.setProperty("--w", (fi.t / fi.dur).toFixed(3));
					placePop();
				}
			}
			for (const r of HOST.querySelectorAll("#dm-marks [data-fb]")) {
				const fi = S.fights.get(r.dataset.fb);
				if (fi)
					r.setAttribute("transform", `scale(${(fi.t / fi.dur).toFixed(3)},1)`);
			}
			for (const t of HOST.querySelectorAll("#dm-marks [data-tm]")) {
				const ps = pst(t.dataset.tm);
				if (ps.passable) t.textContent = mmss(ps.backIn);
			}
			const key =
				me.state +
				me.at +
				S.fights.size +
				[...S.fights.values()].map((f) => f.ws.length).join();
			if (S.stateKey !== key) {
				S.stateKey = key;
				renderSide();
			}
		}

		function split() {
			const groups = S.W.filter(
				(w) => w.guild === "ours" && w.state === "idle" && w.at,
			);
			const taken = new Map(),
				plan = [],
				cols = ["#ffcf4a", "#3d7be0", "#2fae6a", "#e07a3d"];
			groups.forEach((w, k) => {
				const t = nearestFree(w, taken);
				if (!t) return;
				taken.set(t, (taken.get(t) || 0) + 1);
				const r = DG.route(S.sch, w.at, t, liveSet());
				if (r)
					plan.push({
						w,
						name: w.mine ? "моя группа" : w.name,
						short: w.short,
						lead: w.leader || w.short,
						size: w.mine ? S.size : w.size,
						target: t,
						path: r.path,
						c: cols[k % 4],
					});
			});
			S.plan = plan;
			drawPlan();
			renderSide();
			if (!plan.length)
				toast("Свободных стай, до которых можно дойти, нет", true);
			else
				toast(
					`Предложено: ${plan.length} ${pl(plan.length, "группа", "группы", "групп")} - каждой ближайшая свободная стая`,
				);
		}
		function sendPlan() {
			if (!S.plan) return;
			for (const a of S.plan) {
				const n = S.N.get(a.target);
				go(a.w, { x: n.x, y: n.y, id: a.target }, { autoFight: !a.w.mine });
			}
			S.plan = null;
			drawPlan();
			renderSide();
			drawRoute();
			toast("Группы пошли. Моя группа - нападай сама, когда дойдёт.");
		}
		function rally() {
			let sent = 0,
				bl = null;
			for (const w of S.W) {
				if (w.guild !== "ours" || w.at === S.lair.id || w.state === "fight")
					continue;
				const r = go(w, { x: S.lair.x, y: S.lair.y, id: S.lair.id });
				if (r === true) sent++;
				else if (r === "blocked" && !bl && w.at)
					bl = blockersOf(w.at, S.lair.id);
			}
			if (bl && bl.length) {
				S.hl = bl;
				drawHl();
				hint(
					`<b>Сбор у логова:</b> дорогу закрывает стоянка «${esc(S.P.get(bl[0]).name)}»${bl.length > 1 ? ` и ещё ${bl.length - 1}` : ""}. Сначала расчистите путь.<br><button class="gl-mini" data-act="markroad">Отметить «чистить первой»</button><button class="gl-mini" data-act="hintx">Понятно</button>`,
				);
			} else
				toast(
					`Сбор у логова: ${sent} ${pl(sent, "группа идёт", "группы идут", "групп идут")}`,
				);
			renderSide();
			drawRoute();
		}
		function markRoad() {
			const bl = blockersOf(S.gate.id, S.lair.id);
			for (const id of bl) S.P.get(id).mark = "first";
			drawMarks();
			renderSide();
			toast(
				bl.length
					? `Дорога к логову: ${bl.length} ${pl(bl.length, "стоянка", "стоянки", "стоянок")} - «чистить первой»`
					: "Дорога к логову уже чиста",
			);
		}
		function killPlace(id) {
			const P_ = S.P.get(id);
			P_.fl = P_.fl.map((f) => ({
				...f,
				alive: false,
				back: F.backAt(S.now, district()),
				busy: null,
				wait: [],
			}));
		}
		function bossFight() {
			if (packsLeft()) {
				toast(
					`Сначала зачистить все стаи округа: осталось ${packsLeft()}`,
					true,
				);
				return;
			}
			const need = BOSS_N[S.d.star],
				{ n } = atLair(),
				esc_ = S.A.get(S.lair.id).filter((id) => S.P.has(id)),
				ea = esc_.reduce((s, id) => s + pst(id).alive, 0);
			const p = clamp(0.55 + (n - need) * 0.03 - ea * 0.06, 0.05, 0.95);
			if (Math.random() < p) {
				S.owner = "ours";
				for (const id of esc_) if (placeLive(id)) killPlace(id);
				dlg(
					"Земля взята!",
					`<p>Босс «${esc(S.bossName)}» побеждён. Округ - гильдии «${GUILD.ours.n}», город ${esc(S.d.town)} освобождён.</p><p class="mute">Теперь стаи возвращаются через 20 минут. Заглушка: в игре - шаг 3.6.6.</p>`,
					[{ t: "Ура" }],
				);
			} else
				toast(
					`Отряд не выстоял${ea ? ` (стай свиты: ${ea})` : ""}. Босс восстановился.`,
					true,
				);
			drawMarks();
			drawMini();
			header();
			renderSide();
		}

		function onAct(e) {
			const el = e.target.closest("[data-act]");
			if (!el) return;
			const a = el.dataset.act,
				v = el.dataset.v;
			if (
				el.tagName === "INPUT" &&
				e.type === "click" &&
				el.type !== "checkbox"
			)
				return;
			if (
				el.tagName === "INPUT" &&
				el.type === "checkbox" &&
				e.type !== "change"
			)
				return;
			if (el.tagName === "SELECT" && e.type !== "change") return;
			if (a === "sz") {
				if (me.state === "fight") {
					toast("В бою состав не меняется", true);
					return;
				}
				S.size = clamp(S.size + +v, 1, 5);
				me.size = S.size;
				drawWalkers(true);
			} else if (a === "squad") S.squad = el.checked;
			else if (a === "sq") S.squadN = clamp(S.squadN + +v, 1, 90);
			else if (a === "grid") {
				S.showGrid = el.checked;
				drawGrid();
			} else if (a === "attack") {
				const r = attack(me, me.at, +v);
				if (r !== true) toast(r, true);
				hint(null);
				return;
			} else if (a === "help") {
				const r = joinFight(me, v);
				if (r !== true) toast(r, true);
				else {
					hint(null);
					toast("Вступили в бой: награда - 5 долей на всех бойцов");
				}
				return;
			} else if (a === "wait") {
				const P_ = S.P.get(me.at),
					i = +v || 0;
				const r = F.wait(P_.fl[i], groupOf(me), S.now);
				if (r.ok) {
					P_.fl[i] = r.flock;
					me.waitKey = fKey(me.at, i);
					hint(null);
					toast(`Ждём в очереди (${r.place}-я)`);
				} else toast(r.error, true);
			} else if (a === "leave") {
				hint(null);
				leavePlace(me);
				const f = nearestFree(me);
				if (f) {
					walkTo(f);
					toast("Идём к ближайшей свободной стае");
				} else toast("Свободных стай, до которых можно дойти, нет", true);
				return;
			} else if (a === "go") {
				S.preview = null;
				S.previewPath = null;
				walkTo(S.sel);
				return;
			} else if (a === "mark") {
				S.P.get(S.sel).mark = v || null;
				drawMarks();
			} else if (a === "split") {
				split();
				return;
			} else if (a === "send") {
				sendPlan();
				return;
			} else if (a === "rally") {
				rally();
				return;
			} else if (a === "markroad") {
				markRoad();
				hint(null);
				return;
			} else if (a === "unmark") {
				for (const p of S.P.values()) p.mark = null;
				drawMarks();
			} else if (a === "boss") {
				bossFight();
				return;
			} else if (a === "ev") {
				eventDlg(me.at);
				return;
			} else if (a === "dun") {
				toast("Данж - отдельное окно (генератор данжа), в прототипе нет");
				return;
			} else if (a === "nb") {
				goDistrict(v, S.d.id);
				return;
			} else if (a === "spd") {
				S.secPer100 = +el.value;
				const b = HOST.querySelector('[data-live="spdv"]');
				if (b) b.textContent = el.value;
				if (e.type === "change") renderSide();
				return;
			} else if (a === "wm") S.walkMul = +v;
			else if (a === "fm") S.fieldMul = +v;
			else if (a === "lead") {
				S.lead = v === "1";
				closePop();
			} else if (a === "hl") {
				S.heroLvl = clamp(heroLvl() + +v, 1, 60);
				drawMarks();
				if (S.pop) renderPop();
			} else if (a === "tm") S.timeMul = +v;
			else if (a === "own") {
				S.owner = v;
				drawMarks();
				drawMini();
				header();
			} else if (a === "cg") {
				S.clickGo = v === "1";
				S.previewPath = null;
				S.preview = null;
				drawRoute();
			} else if (a === "art" && (S.artPref = v)) {
				S.art = v;
				drawMap();
			} else if (a === "gst") {
				setGst(el.value);
				return;
			} else if (a === "reset") {
				load(S.di);
				return;
			} else if (a === "toBl") {
				hint(null);
				walkTo(S.blocked.list[0]);
				return;
			} else if (a === "showBl") {
				const n = S.N.get(S.blocked.list[0]);
				S.follow = false;
				centerOn(n, Math.max(C.z, Z(0.8)), true);
				return;
			} else if (a === "hintx") {
				hint(null);
				S.hl = [];
				drawHl();
				return;
			} else return;
			renderSide();
		}
		$("side").addEventListener("click", onAct);
		$("side").addEventListener("input", onAct);
		$("side").addEventListener("change", onAct);
		$("hint").addEventListener("click", onAct);
		$("dsel").onchange = (e) => load(+e.target.value);

		$("guideBtn").hidden = !S.lead;
		$("guideBtn").onclick = () => {
			S.guide = !S.guide;
			$("guideBtn").classList.toggle("on", S.guide);
			$("guideBtn").setAttribute("aria-pressed", S.guide);
			$("bd").classList.toggle(
				"open",
				S.guide || $("sideBtn").getAttribute("aria-pressed") === "true",
			);
			if (!S.guide) S.plan = null;
			drawPlan();
			drawMarks();
			renderSide();
		};
		$("sideBtn").hidden = !S.debug;
		$("close").onclick = () => closeAll();
		function hint(html) {
			const h = $("hint");
			h.innerHTML = html || "";
			h.classList.toggle("on", !!html);
		}
		let tt = 0;
		function toast(t, bad) {
			const el = $("toast");
			el.textContent = t;
			el.classList.toggle("bad", !!bad);
			el.classList.add("on");
			clearTimeout(tt);
			tt = setTimeout(() => el.classList.remove("on"), 3200);
		}
		function dlg(title, body, btns) {
			$("dlgb").innerHTML =
				`<h2>${esc(title)}</h2>${body}<div class="btns">${(btns || []).map((b, i) => `<button class="gl-btn ${b.cls || ""}" data-i="${i}">${esc(b.t)}</button>`).join("")}</div>`;
			$("dlg").hidden = false;
			$("dlgb").onclick = (e) => {
				const b = e.target.closest("[data-i]");
				if (!b) return;
				closeDlg();
				const f = btns[+b.dataset.i].fn;
				if (f) f();
			};
		}
		function closeDlg() {
			$("dlg").hidden = true;
		}
		$("dlgx").onclick = closeDlg;

		listen(
			document,
			"keydown",
			(e) => {
				if (e.key !== "Escape") return;
				e.stopPropagation();
				if (!$("dlg").hidden) closeDlg();
				else if (S.pop) closePop();
				else if ($("hint").classList.contains("on")) hint(null);
				else closeAll();
			},
			true,
		);
		function setGst(s) {
			HOST.dataset.gst = s;
			$("toast").dataset.gst = s;
		}
		listen(document, "visibilitychange", () =>
			HOST.classList.toggle("paused", document.hidden),
		);
		function layout() {
			HOST.classList.toggle("ph", innerWidth <= 720 || Q.has("phone"));
		}
		listen(window, "resize", () => {
			if (DEAD) return;
			layout();
			applyCam();
		});

		layout();
		if (Q.get("gst")) setGst(Q.get("gst"));
		load(0);
		function sim(sec) {
			for (let t = 0; t < sec; t += 0.05) step(0.05);
		}
		const fixRnd = (f) => {
			const r = Math.random;
			Math.random = () => 0.01;
			try {
				f();
			} finally {
				Math.random = r;
			}
		};

		function standNear(n, from) {
			const { D } = dijkstra(from || me.at, liveSet());
			return [...S.P.keys()]
				.filter(
					(id) =>
						D.has(id) &&
						S.P.get(id).fl.length >= n &&
						!S.N.get(id).escort &&
						pst(id).free === S.P.get(id).fl.length,
				)
				.sort((a, b) => D.get(a) - D.get(b))[0];
		}
		function putAt(w, id) {
			w.at = id;
			w.state = "idle";
			w.pts = null;
			const n = S.N.get(id);
			w.x = n.x;
			w.y = n.y;
		}
		const st = Q.get("state");
		S.noAnim = true;
		setTimeout(() => {
			S.noAnim = false;
		}, 1500);
		if (st === "walk") {
			S.showGrid = !Q.has("nogrid");
			const cand = [];
			for (let j = 0; j < G.h; j++)
				for (let i = 0; i < G.w; i++)
					if (G.rows[j][i] === "=" && !gladeAt(i, j)) {
						const p = cellPt(i, j),
							d = dist(p, me);
						if (d > 160 && d < 300) cand.push(p);
					}
			const live = liveSet();
			const t = cand.find((p) => gridRoute(me, p, live, { start: me.at }));
			if (t) {
				go(me, t);
				S.flag = t;
				S.sel = null;
				sim(Math.min(4, (pathLeft(me) / speed()) * 0.35));
			}
			drawMap();
			renderSide();
			if (t)
				showSpots([
					{ x: me.x, y: me.y },
					t,
					{ x: me.x + 60, y: me.y + 60 },
					{ x: me.x - 60, y: me.y - 60 },
				]);
			else centerOn(me, Z(0.8));
		} else if (st === "blocked") {
			S.sel = S.lair.id;
			walkTo(S.lair.id);
			renderSide();
			drawMarks();
		} else if (st === "stand") {
			const id = standNear(3);
			const g2 = S.W.find((w) => w.id === "g2");
			putAt(me, id);
			putAt(g2, id);
			attack(g2, id, 0);
			attack(me, id, 1);
			for (const fi of S.fights.values()) fi.dur = 600;
			sim(0.6);
			S.sel = id;
			drawMarks();
			renderSide();
			centerOn(S.N.get(id), Z(1.25));
		} else if (st === "help" || st === "helped") {
			const id = standNear(1);
			const g2 = S.W.find((w) => w.id === "g2");
			putAt(g2, id);
			attack(g2, id, 0);
			for (const fi of S.fights.values()) fi.dur = 600;
			const others = S.P.get(id)
				.fl.map((_, i) => i)
				.slice(1);
			for (const i of others) {
				const P_ = S.P.get(id);
				P_.fl[i] = { ...P_.fl[i], alive: false, back: S.now + 25 * MIN };
			}
			putAt(me, id);
			S.sel = id;
			if (st === "helped") joinFight(me, fKey(id, 0));
			sim(0.6);
			drawMarks();
			renderSide();
			centerOn(S.N.get(id), Z(1.25));
			if (st === "help") busyHint(id);
		} else if (st === "busy") {
			const id = standNear(1),
				en = S.W.find((w) => w.guild === "enemy");
			putAt(en, id);
			en.ai = true;
			S.P.get(id).fl.forEach((_, i) => {
				if (i === 0) attack(en, id, 0);
				else {
					const P_ = S.P.get(id);
					P_.fl[i] = { ...P_.fl[i], alive: false, back: S.now + 30 * MIN };
				}
			});
			for (const fi of S.fights.values()) fi.dur = 600;
			walkTo(id);
			sim(pathLeft(me) / speed() + 0.3);
			const tn = S.N.get(id);
			C.z = Z(1);
			C.x = vpW() / 2 - (tn.x - S.B.x0) * K * C.z;
			C.y = (vpH() + $("hint").offsetHeight) / 2 - (tn.y - S.B.y0) * K * C.z;
			S.follow = false;
			applyCam();
		} else if (st === "ways") {
			const { D } = dijkstra(me.at, liveSet());
			const w = S.sch.nodes
				.filter((n) => n.kind === "way" && D.has(n.id))
				.sort((a, b) => D.get(a.id) - D.get(b.id))[0];
			if (w) {
				walkTo(w.id);
				sim(pathLeft(me) / speed() + 0.3);
			}
			S.sel = w ? w.id : null;
			drawMarks();
			renderSide();
			centerOn(me, Z(0.7));
		} else if (st === "lair") {
			for (const id of blockersOf(S.gate.id, S.lair.id)) killPlace(id);
			for (const w of S.W.filter((x) => x.guild === "ours").slice(0, 3))
				putAt(w, S.lair.id);
			S.sel = S.lair.id;
			drawMarks();
			drawMini();
			header();
			renderSide();
			drawWalkers(true);
			centerOn(S.lair, Z(0.95));
		} else if (st === "guide") {
			S.guide = true;
			$("guideBtn").classList.add("on");
			const bl = blockersOf(S.gate.id, S.lair.id);
			if (bl[0]) S.P.get(bl[0]).mark = "first";
			split();
			S.sel = S.plan && S.plan[1] ? S.plan[1].target : null;
			const ps = S.plan.flatMap((a) => a.path.map((id) => S.N.get(id)));
			if (ps.length) {
				const cx = ps.reduce((s, n) => s + n.x, 0) / ps.length,
					cy = ps.reduce((s, n) => s + n.y, 0) / ps.length;
				centerOn({ x: cx, y: cy }, Z(0.7));
			}
			drawMarks();
			renderSide();
		} else if (st === "pop" || st === "hover" || st === "levels") {
			const id = [...S.P.values()]
				.filter(
					(p) =>
						p.fl.length >= 1 &&
						pst(p.id).free === p.fl.length &&
						!S.N.get(p.id).escort,
				)
				.map((p) => p.id)
				.sort((a, b) => dist(S.N.get(a), me) - dist(S.N.get(b), me))[0];
			const g2 = S.W.find((w) => w.id === "g2");
			putAt(g2, id);
			attack(g2, id, 0);
			for (const fi of S.fights.values()) fi.dur = 600;
			const n = S.N.get(id);
			centerOn(
				st === "levels" ? me : { x: (n.x + me.x) / 2, y: (n.y + me.y) / 2 },
				Z(st === "levels" ? 0.75 : 1.1),
			);
			sim(0.5);
			if (st === "pop") {
				const id2 = [...S.P.keys()]
					.filter((k) => k !== id && pst(k).free)
					.sort((a, b) => dist(S.N.get(a), me) - dist(S.N.get(b), me))[0];
				openPop(id2, 0);
			} else if (st === "hover") {
				S.showGrid = true;
				drawGrid();
				const sx = vpW() * (+Q.get("hx") || 0.62),
					sy = vpH() * (+Q.get("hy") || 0.42);
				hoverAt(sx, sy);
				const tip = document.createElement("div");
				tip.className = "fakecur";
				tip.style.transform = `translate(${sx}px,${sy}px)`;
				vp.appendChild(tip);
			}
		} else if (st === "lines") {
			const t = { x: me.x + G.cell * 3, y: me.y - G.cell * 2 };
			go(me, t);
			const g2 = S.W.find((w) => w.id === "g2"),
				en = S.W.find((w) => w.id === "en");
			en.ai = false;
			go(g2, {
				x: me.pts[me.pts.length - 1].x + G.cell,
				y: me.pts[me.pts.length - 1].y,
			});
			putAt(en, S.gate.id);
			en.x += G.cell * 6;
			en.y += G.cell * 4;
			en.at = null;
			go(en, {
				x: me.pts[me.pts.length - 1].x,
				y: me.pts[me.pts.length - 1].y + G.cell,
			});
			S.walkMul = 0.0001;
			drawRoute();
			centerOn(me, Z(0.8));
		} else if (st === "exit") {
			const ex = S.sch.nodes
				.filter((n) => n.kind === "exit")
				.sort((a, b) => dist(b, S.gate) - dist(a, S.gate))[0];
			walkTo(ex.id);
			sim(pathLeft(me) / speed() + 0.5);
			centerOn(ex, Z(1));
		} else if (st === "crowd") {
			const nm = [
				"Ярополк",
				"Ведана",
				"Kot_Bayun",
				"Горыня",
				"Lada_TV",
				"Ворон_12",
				"Молчун",
			];
			nm.forEach((ld, k) =>
				mkW({
					id: "x" + k,
					name: `группа ${ld}`,
					leader: ld,
					short: "x",
					guild: k === 5 ? "enemy" : "ours",
					size: 3,
					at: S.gate.id,
				}),
			);
			S.marks.push(
				{
					x: me.x + G.cell * 4,
					y: me.y - G.cell * 2,
					ic: "flag",
					name: "Сбор",
					by: "Lievkaz",
				},
				{
					x: me.x - G.cell * 5,
					y: me.y + G.cell * 3,
					ic: "swords",
					name: "Бьём волков",
					by: "Lievkaz",
				},
			);
			drawMarkLayer();
			drawMini();
			drawWalkers(true);
			centerOn(me, Z(0.9));
		} else if (st === "mark") {
			const tc = cellPt(cellOf(me).i + 4, cellOf(me).j - 1);
			centerOn(tc, Z(1.1));
			S.marks.push({
				x: me.x - G.cell * 4,
				y: me.y + G.cell * 2,
				ic: "swords",
				name: "Бьём волков",
				by: "Lievkaz",
			});
			drawMarkLayer();
			S.pop = { mnew: { x: tc.x, y: tc.y }, ic: "flag" };
			renderPop();
		} else if (st === "rmb") {
			const P_ = [...S.P.values()]
					.filter(
						(p) =>
							!S.N.get(p.id).escort &&
							F.stateOf(p.fl[0], S.now).alive &&
							!p.fl[0].busy,
					)
					.sort((a, b) => dist(S.N.get(a.id), me) - dist(S.N.get(b.id), me))[0],
				fp = flockPts(S.N.get(P_.id))[0];
			centerOn(fp, Z(1.2));
			cellMenu(
				C.x + (fp.x - S.B.x0) * K * C.z,
				C.y + (fp.y - S.B.y0) * K * C.z,
			);
		} else if (st === "live") {
			if (Q.get("inline")) window.__inline = 1;
			goDistrict(Q.get("to") || "d07", S.d.id);
			fitAll();
		} else if (st === "whole") fitAll();
		else if (st === "minimap") {
			const ex = S.sch.nodes
				.filter((n) => n.kind === "exit")
				.sort((a, b) => dist(b, S.gate) - dist(a, S.gate))[0];
			S.sel = ex.id;
			renderSide();
			drawMarks();
			centerOn(ex, Z(1.3));
		} else if (st === "grid") {
			S.showGrid = true;
			drawGrid();
			centerOn(me, Z(0.7));
			renderSide();
		}

		if (X.selftest || Q.has("selftest")) {
			X.refill = null;
			const log = [],
				ok = (c, m) => log.push((c ? "OK   " : "FAIL ") + m);
			try {
				for (let i = 0; i < DATA.districts.length; i++) {
					load(i);
					S.daily = 0;
					const d = S.d;
					ok(
						S.P.size > 10,
						`${d.id}: стоянок ${S.P.size}, стай ${[...S.P.values()].reduce((s, p) => s + p.fl.length, 0)}, сетка ${G.w}×${G.h} (${G.real ? "генератор" : "временная"})`,
					);
					walkTo(S.lair.id);
					ok(
						me.state === "walk",
						`${d.id}: к логову можно дойти полем (стаи обходят, 22.11)`,
					);
					hint(null);
					sim(pathLeft(me) / speed() + 0.5);
					putAt(me, S.gate.id);

					let gp = null;
					for (let j = 0; j < G.h && !gp; j++)
						for (let k = 0; k < G.w && !gp; k++)
							if (
								G.rows[j][k] === "=" &&
								!gladeAt(k, j) &&
								dist(cellPt(k, j), me) > 120 &&
								gridRoute(me, cellPt(k, j), liveSet(), { start: me.at })
							)
								gp = cellPt(k, j);
					ok(!!gp, `${d.id}: есть свободный квадрат`);
					if (gp) {
						clickGround(gp);
						ok(me.state === "walk", `${d.id}: идём в квадрат`);
						sim(pathLeft(me) / speed() + 0.5);
						ok(!me.at && dist(me, gp) < 1, `${d.id}: стоим в квадрате`);
					}

					{
						const st = [...S.P.keys()]
							.map((id) => S.N.get(id))
							.find(
								(n) =>
									flockPts(n).length >= 2 &&
									placeLive(n.id) &&
									flockPts(n).every((fp) => {
										const a = cellOf(fp),
											b = cellOf(n);
										return a.i !== b.i || a.j !== b.j;
									}),
							);
						if (st) {
							closePop();
							const before = me.state;
							clickGround({ x: st.x, y: st.y });
							const cc = cellOf(st);
							ok(
								!S.pop && me.state === "walk",
								`${d.id}: середина стоянки - идём, без окна (было ${before}, окно ${!!S.pop}, клетка ${G.rows[cc.j][cc.i]}, хозяин ${gladeAt(cc.i, cc.j)}/${st.id}, ${me.state})`,
							);
							sim(pathLeft(me) / speed() + 0.5);
							closePop();
							const fp = flockPts(st)[0];
							clickGround({ x: fp.x, y: fp.y });
							ok(
								!!S.pop && S.pop.id === st.id && me.state !== "walk",
								`${d.id}: клетка стаи - окно стаи, не идём`,
							);
							closePop();
						}
					}

					const t = standNear(1, S.gate.id);
					walkTo(t);
					if (me.state !== "walk") {
						const tn = S.N.get(t),
							live = liveSet(),
							soft = gridRoute(wPos(me), tn, live, { soft: true, target: t }),
							free = gridRoute(wPos(me), tn, new Set(), { target: t });
						log.push(
							`  отладка: мягкий путь через ${soft ? soft.through.join(",") : "нет"}; без стай ${free ? "есть" : "нет"}; клетка ${JSON.stringify(cellOf(me))} ${JSON.stringify(nearPass(me))}`,
						);
					}
					ok(
						me.state === "walk",
						`${d.id}: из поля к стоянке «${S.P.get(t).name}»`,
					);
					sim(pathLeft(me) / speed() + 0.5);
					ok(me.at === t, `${d.id}: пришли`);
					const n = S.P.get(t).fl.length;
					fixRnd(() => {
						for (let k = 0; k < n; k++) {
							attack(me, t, k);
							sim(3);
						}
					});
					ok(
						pst(t).passable,
						`${d.id}: стоянка из ${n} стай расчищена, возврат ${mmss(pst(t).backIn)}`,
					);

					const t2 = standNear(1, S.gate.id),
						g2 = S.W.find((w) => w.id === "g2");
					putAt(g2, t2);
					attack(g2, t2, 0);
					putAt(me, t2);
					const r = joinFight(me, fKey(t2, 0));
					ok(r === true, `${d.id}: подмога в бою: ${r}`);
					const g3 = S.W.find((w) => w.id === "g3");
					putAt(g3, t2);
					const r3 = joinFight(g3, fKey(t2, 0));
					ok(r3 !== true, `${d.id}: третья группа не влезла: ${r3}`);
					fixRnd(() => sim(10));
					ok(
						!F.stateOf(S.P.get(t2).fl[0], S.now).alive &&
							S.last &&
							S.last.fighters === S.size + 4,
						`${d.id}: награда 5 долей на ${S.last && S.last.fighters}: +${S.last && S.last.got}`,
					);

					for (const id of blockersOf(me.at, S.lair.id)) killPlace(id);
					walkTo(S.lair.id);
					sim(pathLeft(me) / speed() + 0.5);
					ok(me.at === S.lair.id, `${d.id}: у логова`);
					S.guide = true;
					rally();
					sim(150);
					ok(
						atLair().n >= S.size,
						`${d.id}: сбор у логова ${atLair().n} из ${BOSS_N[d.star]}`,
					);
					load(i);
					S.guide = true;
					split();
					ok(S.plan.length > 0, `${d.id}: разойтись - ${S.plan.length}`);
					sendPlan();
					sim(40);
					const before = [...S.P.keys()].reduce(
						(x, id) => x + pst(id).alive,
						0,
					);
					S.timeMul = 600;
					sim(8);
					S.timeMul = 1;
					const after = [...S.P.keys()].reduce((x, id) => x + pst(id).alive, 0);
					ok(
						after > before,
						`${d.id}: время ×600 - живых стай было ${before}, стало ${after}`,
					);
					S.guide = false;
				}
				load(0);
				for (const v of ["ours", "enemy", "none"]) {
					S.owner = v;
					header();
					renderSide();
					drawMarks();
				}
				for (const [v] of STYLES) setGst(v);
				setGst("legion");
				S.art = "stub";
				drawMap();
				S.art = DATA.art ? "real" : "stub";
				drawMap();
				S.showGrid = true;
				drawGrid();
				S.showGrid = false;
				drawGrid();
				fitAll();
				zoomAt(1.5, 100, 100);
				centerOn(me, Z(1));

				load(0);
				centerOn(S.gate, Z(1));
				const gs = {
					x: C.x + (S.gate.x - S.B.x0) * K * C.z,
					y: C.y + (S.gate.y - S.B.y0) * K * C.z,
				};
				let cl = null;
				for (let a = 0; a < 16 && !cl; a++) {
					const sx = gs.x + Math.cos((a / 16) * 6.283) * 45,
						sy = gs.y + Math.sin((a / 16) * 6.283) * 45,
						w = toWorld(sx, sy),
						c = cellOf(w);
					if (
						gPass(c.i, c.j) &&
						!hitAt(sx, sy) &&
						!(gladeAt(c.i, c.j) && S.P.has(gladeAt(c.i, c.j)))
					)
						cl = { sx, sy };
				}
				ok(!!cl, "есть свободная клетка в 45 px от ворот");
				if (cl) {
					clickAt(cl.sx, cl.sy);
					ok(
						me.state === "walk" && !me.target.id,
						`клик в 45 px от ворот - идём в клетку (${me.target && me.target.id ? "место " + me.target.id : "клетка"})`,
					);
				}
				load(0);
				{
					const tg = S.sch.nodes.find((n) => n.kind === "way");
					centerOn(tg, Z(1));
					const sx = C.x + (tg.x - S.B.x0) * K * C.z,
						sy = C.y + (tg.y - S.B.y0) * K * C.z,
						h = hitAt(sx, sy);
					ok(
						!h || h.id !== tg.id,
						"точка пути на карте не видна и не цель клика",
					);
					ok(
						!HOST.querySelector(`#dm-marks .nd[data-id="${tg.id}"]`),
						"значка точки пути нет",
					);
					const es = S.sch.nodes.find(
						(n) => n.kind === "spot" && !S.ev.has(n.id),
					);
					ok(
						!es || !HOST.querySelector(`#dm-marks .nd[data-id="${es.id}"]`),
						"пустой поляны на карте нет",
					);
				}

				load(0);
				const sn = [...S.P.values()].find(
						(p) =>
							p.fl.length >= 1 &&
							pst(p.id).free === p.fl.length &&
							!S.N.get(p.id).escort,
					),
					snode = S.N.get(sn.id);
				putAt(me, sn.id);
				centerOn(snode, Z(1.2));
				const fix = flockPts(snode).length > 1 ? 1 : 0,
					fp = flockPts(snode)[fix];
				clickAt(
					C.x + (fp.x - S.B.x0) * K * C.z,
					C.y + (fp.y - S.B.y0) * K * C.z,
				);
				ok(
					S.pop && S.pop.i === fix && me.state !== "fight",
					`клик по значку стаи 2 стоянки - окно стаи 2, бой не начат (точек: ${flockPts(snode).length})`,
				);
				$("pop").querySelector('[data-pact="go"]').click();
				ok(
					me.state === "fight" && S.fights.has(fKey(sn.id, fix)),
					"группа у стоянки: «Напасть» в окне - сразу бой со стаей 2",
				);

				load(0);
				{
					const sn2 = [...S.P.values()]
							.filter(
								(p) =>
									p.fl.length >= 1 &&
									pst(p.id).free === p.fl.length &&
									!S.N.get(p.id).escort &&
									DG.route(S.sch, me.at, p.id, liveSet()),
							)
							.sort(
								(a, b) => dist(S.N.get(a.id), me) - dist(S.N.get(b.id), me),
							)[0],
						n2 = S.N.get(sn2.id),
						fx2 = flockPts(n2).length > 1 ? 1 : 0,
						fp2 = flockPts(n2)[fx2];
					centerOn(fp2, Z(1));
					const sx = C.x + (fp2.x - S.B.x0) * K * C.z,
						sy = C.y + (fp2.y - S.B.y0) * K * C.z;
					clickAt(sx, sy);
					ok(
						S.pop && S.pop.i === fx2 && !$("pop").hidden && me.state !== "walk",
						"клик по стае - окно над ней, группа стоит",
					);
					ok(
						/ур\. \d+/.test($("pop").textContent) &&
							(fx2 === 0 || /стая 2 из/.test($("pop").textContent)),
						`в окне - уровень, состав, «стая 2 из N»: ${$("pop").querySelector(".mute").textContent}`,
					);
					clickAt(5, vpH() - 5);
					ok(
						!S.pop && me.state !== "walk",
						"клик мимо - окно закрыто, группа стоит",
					);
					clickAt(sx, sy);
					$("pop").querySelector('[data-pact="go"]').click();
					ok(
						me.state === "walk" && me.pend && me.pend.i === fx2,
						"«Напасть» - группа идёт к стае",
					);
					fixRnd(() => sim(pathLeft(me) / speed() + 0.6));
					ok(
						me.state === "fight" && S.fights.has(fKey(sn2.id, fx2)),
						"дошла - бой именно со стаей 2",
					);

					centerOn(S.lair, Z(1));
					clickAt(
						C.x + (S.lair.x - S.B.x0) * K * C.z,
						C.y + (S.lair.y - S.B.y0) * K * C.z,
					);
					ok(
						S.pop && /Сбор у логова|Открыть сбор/.test($("pop").textContent),
						"клик по логову - окно со «Сбор у логова»",
					);
					closePop();
					ok(
						HOST.querySelectorAll("#dm-marks [data-f] text").length >=
							[...S.P.values()].reduce((t, p) => t + p.fl.length, 0),
						"у каждой стаи - плашка уровня",
					);
				}

				for (const kind of [
					"gate",
					"exit",
					"way",
					"cross",
					"town",
					"tract",
					"spot",
				]) {
					load(0);
					const nd = S.sch.nodes.find((n) => n.kind === kind);
					if (!nd) continue;
					centerOn(nd, Z(1));
					let done = 0,
						err = null;
					for (let a = 0; a < 24; a++) {
						const sx =
								C.x +
								(nd.x - S.B.x0) * K * C.z +
								Math.cos((a / 24) * 6.283) * (30 + a * 2),
							sy =
								C.y +
								(nd.y - S.B.y0) * K * C.z +
								Math.sin((a / 24) * 6.283) * (30 + a * 2);
						try {
							hoverAt(sx, sy);
							if (!hitAt(sx, sy)) {
								clickAt(sx, sy);
								done++;
							}
						} catch (e) {
							err =
								e.message +
								" @ " +
								(e.stack || "")
									.split("\n")
									.slice(1, 4)
									.map((x) => x.trim().replace(/\(?file:[^)]*html:/, ""))
									.join(" < ");
							break;
						}
					}
					ok(
						!err,
						`клики и наведение у «${kind}»: ${done} клеток${err ? ", ошибка " + err : ""}`,
					);
				}
				load(0);
				S.clickGo = false;
				clickNode(
					S.sch.nodes.find(
						(n) =>
							n.kind === "cross" || n.kind === "dungeon" || n.kind === "gate",
					).id,
				);
				ok(me.state !== "walk", "сначала путь: не пошли");
				S.clickGo = true;

				load(0);
				{
					const ex =
							S.sch.nodes.find(
								(n) =>
									n.kind === "exit" &&
									!DATA.districts.some((x) => x.id === n.to),
							) || S.sch.nodes.find((n) => n.kind === "exit"),
						from = S.d.id;
					walkTo(ex.id);
					sim(pathLeft(me) / speed() + 0.5);
					ok(
						!$("dlg").hidden && /Перейти в округ/.test($("dlgb").textContent),
						`дошли до указателя - окно «${$("dlgb").querySelector("h2") && $("dlgb").querySelector("h2").textContent}»`,
					);
					$("dlgb").querySelector('[data-i="0"]').click();
					ok(
						S.d.id === ex.to,
						`перешли в ${S.d.id} (${S.d.gen ? "схема сгенерирована в браузере" : "готовый округ"})`,
					);
					ok(
						me.at &&
							S.N.get(me.at).kind === "exit" &&
							S.N.get(me.at).to === from,
						"отряд у указателя обратно",
					);
					{
						const bx = S.N.get(me.at);
						centerOn(bx, Z(1));
						clickAt(
							C.x + (bx.x - S.B.x0) * K * C.z,
							C.y + (bx.y - S.B.y0) * K * C.z,
						);
						ok(
							!$("dlg").hidden && /Перейти в округ/.test($("dlgb").textContent),
							"стоим у указателя, клик по нему - снова окно перехода",
						);
						closeDlg();
					}
					walkTo(S.gate.id);
					sim(pathLeft(me) / speed() + 0.5);
					ok(me.at === S.gate.id, "в новом округе дошли до ворот");
					load(0);
				}

				load(0);
				ok(S.fieldMul === 1.5, "поле медленнее дороги ×1,5 по умолчанию");
				ok(S.res.length >= 5, `места сбора профессий: ${S.res.length}`);
				{
					const rr = S.res[0],
						i0 = 0;
					centerOn(rr, Z(1));
					clickAt(
						C.x + (rr.x - S.B.x0) * K * C.z,
						C.y + (rr.y - S.B.y0) * K * C.z,
					);
					ok(S.pop && S.pop.res === i0, "клик по месту сбора - окно");
					$("pop").querySelector('[data-pact="gath"]').click();
					fixRnd(() => sim(pathLeft(me) / speed() + 0.6));
					ok(!!S.gath, "дошли - сбор идёт");
					S.now += RES_SEC * 1000 + 10;
					gatherTick();
					ok(rr.back > S.now, "собрано - место ждёт возврата");
					closePop();
				}
				load(0);
				{
					const nm = ["a1", "a2", "a3", "a4", "a5", "a6"];
					nm.forEach((ld, k) =>
						mkW({
							id: "y" + k,
							name: ld,
							leader: ld,
							short: "y",
							guild: "ours",
							size: 3,
							at: me.at,
						}),
					);
					drawWalkers(true);
					ok(
						S.W.filter((w) => w.hid).length ===
							S.W.filter((w) => w.at === me.at && w.state !== "walk").length -
								5 && /групп/.test($("lstack").textContent),
						`больше 5 групп в клетке - лишние скрыты, надпись «${$("lstack").textContent.trim()}»`,
					);
				}
				load(0);
				{
					const tc = cellPt(cellOf(me).i + 3, cellOf(me).j),
						sp = (p) => [
							C.x + (p.x - S.B.x0) * K * C.z,
							C.y + (p.y - S.B.y0) * K * C.z,
						];
					centerOn(tc, Z(1));
					cellMenu(...sp(tc));
					ok(
						S.pop &&
							S.pop.cell &&
							/Идти сюда/.test($("pop").textContent) &&
							/Поставить метку/.test($("pop").textContent),
						"ПКМ по пустой клетке - окно: «Идти сюда», «Поставить метку»",
					);
					$("pop").querySelector('[data-pact="cmark"]').click();
					ok(S.pop && S.pop.mnew, "из окна клетки - окошко новой метки");
					$("pop").querySelector("input.mname").value = "Тут ждём";
					$("pop").querySelector('[data-v="shield"]').click();
					ok(
						S.pop.ic === "shield" &&
							$("pop").querySelector("input.mname").value === "Тут ждём",
						"выбор значка - название не сбрасывается",
					);
					$("pop").querySelector('[data-pact="mset"]').click();
					ok(
						S.marks.length === 1 &&
							S.marks[0].name === "Тут ждём" &&
							S.marks[0].ic === "shield",
						"метка поставлена с названием и значком",
					);
					for (let k = 1; k <= 4; k++) {
						const q = cellPt(cellOf(me).i + 3, cellOf(me).j + k * 2);
						if (gPass(cellOf(q).i, cellOf(q).j)) {
							markAt(...sp(q));
							if (S.pop && S.pop.mnew)
								$("pop").querySelector('[data-pact="mset"]').click();
						}
					}
					const n0 = S.marks.length;
					for (let k = 0; S.marks.length < MARK_MAX && k < 40; k++) {
						const q = cellPt(cellOf(me).i - 2 - k, cellOf(me).j);
						if (!gPass(cellOf(q).i, cellOf(q).j)) continue;
						markAt(...sp(q));
						if (S.pop && S.pop.mnew)
							$("pop").querySelector('[data-pact="mset"]').click();
					}
					const q6 = cellPt(cellOf(me).i, cellOf(me).j + 1);
					markAt(...sp(q6));
					ok(
						S.marks.length === MARK_MAX && !(S.pop && S.pop.mnew),
						`больше ${MARK_MAX} меток нельзя (было ${n0})`,
					);
					closePop();
					const m = S.marks[0];
					centerOn(m, Z(1));
					markAt(...sp({ x: m.x, y: m.y - 10 }));
					ok(S.pop && S.pop.medit === 0, "ПКМ по метке - изменить");
					$("pop").querySelector('[data-pact="mdel"]').click();
					ok(S.marks.length === MARK_MAX - 1, "метка снята");
					const m2 = S.marks[0];
					clickAt(...sp({ x: m2.x, y: m2.y - 10 }));
					ok(
						S.pop &&
							S.pop.mark === 0 &&
							/Идти к метке/.test($("pop").textContent),
						"клик по метке - окно «Идти к метке»",
					);
					closePop();
				}

				load(0);
				{
					const n =
						S.sch.nodes.find(
							(x) => x.kind === "cross" || x.kind === "dungeon",
						) || S.town;
					centerOn(n, Z(1));
					const r = vp.getBoundingClientRect(),
						cx = r.left + C.x + (n.x - S.B.x0) * K * C.z,
						cy = r.top + C.y + (n.y - S.B.y0) * K * C.z,
						o = {
							bubbles: true,
							clientX: cx,
							clientY: cy,
							button: 2,
							pointerId: 7,
							pointerType: "mouse",
						};
					vp.dispatchEvent(new PointerEvent("pointerdown", o));
					vp.dispatchEvent(new PointerEvent("pointerup", o));
					vp.dispatchEvent(new MouseEvent("contextmenu", o));
					ok(
						me.state !== "walk" && S.pop && S.pop.cell,
						"ПКМ по объекту - только окно, отряд стоит",
					);
					ok(!!$("csel").innerHTML, "клетка ПКМ подсвечена");
					closePop();
					ok(!$("csel").innerHTML, "окно закрыто - подсветки нет");
				}

				load(0);
				S.lead = false;
				{
					const tc = cellPt(cellOf(me).i + 3, cellOf(me).j);
					centerOn(tc, Z(1));
					cellMenu(
						C.x + (tc.x - S.B.x0) * K * C.z,
						C.y + (tc.y - S.B.y0) * K * C.z,
					);
					ok(
						S.pop && S.pop.cell && !/метк/i.test($("pop").textContent),
						"игрок: в окне клетки нет «Поставить метку»",
					);
					closePop();
				}
				S.lead = true;

				load(0);
				{
					const sp = (p) => [
						C.x + (p.x - S.B.x0) * K * C.z,
						C.y + (p.y - S.B.y0) * K * C.z,
					];
					const P_ = [...S.P.values()].find(
							(p) =>
								!S.N.get(p.id).escort &&
								F.stateOf(p.fl[0], S.now).alive &&
								!p.fl[0].busy,
						),
						fp = flockPts(S.N.get(P_.id))[0];
					centerOn(fp, Z(1));
					cellMenu(...sp(fp));
					ok(
						S.pop &&
							S.pop.cell &&
							/Атаковать/.test($("pop").textContent) &&
							/ур\. \d+/.test($("pop").textContent) &&
							!/Идти сюда/.test($("pop").textContent),
						"ПКМ по стае - описание, уровень и «Атаковать», без «Идти сюда»",
					);
					$("pop").querySelector('[data-pact="catk"]').click();
					ok(
						me.state === "walk" && me.pend,
						"«Атаковать» из окна клетки - группа идёт к стае",
					);
					closePop();
					load(0);
					centerOn(S.town, Z(1));
					cellMenu(...sp(S.town));
					ok(
						S.pop && /город/i.test($("pop").textContent),
						"ПКМ по городу - описание города",
					);
					closePop();
					const en = S.W.find((w) => w.guild === "enemy");
					en.ai = false;
					putAt(
						en,
						S.sch.nodes.find((n) => n.kind === "cross" || n.kind === "gate").id,
					);
					drawWalkers(true);
					centerOn(en, Z(1));
					drawWalkers(true);
					cellMenu(...sp((S._wdraw && S._wdraw.get(en.id)) || en));
					ok(
						S.pop && S.pop.cell && /Атаковать/.test($("pop").textContent),
						"ПКМ по чужой группе - «Атаковать»",
					);
					closePop();
				}
				load(0);
				nearestFlock();
				ok(
					S.pop && S.pop.id && S.P.has(S.pop.id),
					"кнопка «к ближайшей стае» - окно стаи",
				);
				closePop();
				load(0);
				{
					const a = cellPt(cellOf(me).i + 3, cellOf(me).j),
						b = cellPt(cellOf(me).i + 3, cellOf(me).j + 3);
					clickGround(a);
					S.shift = true;
					clickGround(b);
					S.shift = false;
					ok(S.queue.length === 1, "Shift + клик - точка в очереди");
					fixRnd(() => sim(60));
					const mc = cellOf(me),
						bc = cellOf(b);
					ok(
						S.queue.length === 0 &&
							Math.abs(mc.i - bc.i) + Math.abs(mc.j - bc.j) <= 1,
						"прошли обе точки по очереди",
					);
				}
				load(0);
				S.owner = "ours";
				clickAt(
					C.x + (S.town.x - S.B.x0) * K * C.z,
					C.y + (S.town.y - S.B.y0) * K * C.z,
				);
				centerOn(S.town, Z(1));
				clickAt(
					C.x + (S.town.x - S.B.x0) * K * C.z,
					C.y + (S.town.y - S.B.y0) * K * C.z,
				);
				ok(
					S.pop && S.pop.town && /[Вв]ойти/.test($("pop").textContent),
					"город открыт - кнопка «Войти»",
				);
				$("pop").querySelector('[data-pact="tenter"]').click();
				fixRnd(() => sim(pathLeft(me) / speed() + 0.6));
				closePop();
				if (me.at === S.gate.id && !$("dlg").hidden) {
					ok(
						/Город/.test($("dlgb").textContent),
						"дошли до ворот - сразу окно города",
					);
					closeDlg();
					S.pop = { id: S.town.id, town: true };
					renderPop();
					$("pop").querySelector('[data-pact="tenter"]').click();
					ok(
						!$("dlg").hidden && /Город/.test($("dlgb").textContent),
						"вошли в город - окно города",
					);
					closeDlg();
				} else
					ok(
						false,
						"до города не дошли: " +
							me.state +
							" " +
							me.at +
							" " +
							(me.target && me.target.id) +
							" " +
							pathLeft(me),
					);
				load(0);
				{
					const g = S.W.find((w) => w.guild === "enemy");
					S.pop = { gid: g.id };
					renderPop();
					$("pop").querySelector('[data-pact="gatk"]').click();
					ok(
						me.hunt === g.id && /e2392b/.test($("route").innerHTML),
						"идём нападать на группу - линия красная",
					);
				}
				ok(true, "земля, стили, рисунок, квадраты, камера");
			} catch (e) {
				ok(
					false,
					"исключение: " +
						e.message +
						" " +
						(e.stack || "").split("\n").slice(1, 3).join(" | "),
				);
			}
			const pre = document.createElement("pre");
			pre.id = "selftest";
			pre.textContent = log.join("\n");
			document.body.appendChild(pre);
		}
		requestAnimationFrame(frame);
		function closeAll() {
			if (DEAD) return;
			DEAD = true;
			clearTimeout(tt);
			for (const f of offs) {
				try {
					f();
				} catch (e) {
					console.warn("[карта округа] слушатель", e);
				}
			}
			HOST.remove();
			document.documentElement.classList.remove("gl-open");
		}
		return {
			close: closeAll,
			get S() {
				return S;
			},
		};
	}

	const DG_ = () => window.LGDistrictGen;
	function districtOf(r) {
		const W = r.w,
			d = r.d,
			DG = DG_();
		const sch = DG.generate({
			W,
			id: d.id,
			...(r.hand ? { hand: r.hand } : {}),
		});
		if (!sch) return null;
		const nb = {};
		for (const [k, v] of Object.entries(d.nb || {})) nb[k] = v.name;
		for (const n of sch.nodes)
			if (n.kind === "exit" && !nb[n.to]) {
				const x = W.territories.find((q) => q.id === n.to);
				nb[n.to] = x ? x.name : n.to;
			}
		const nbs = Object.keys(d.nb || {})
			.map((k) => {
				const x = W.territories.find((q) => q.id === k),
					c = x && DG.ringOf ? DG.ringOf(W, k) : null;
				return x && c
					? { id: k, name: x.name, biome: x.biome, contour: c }
					: null;
			})
			.filter(Boolean);
		return {
			id: d.id,
			level: d.level,
			name: d.name,
			star: sch.star,
			biome: d.biome,
			biomeName: d.biomeName,
			town: d.town,
			owner: d.owner || "none",
			nb,
			nbs,
			sch,
			full: true,
		};
	}
	function mergeData(DATA, r) {
		DATA.W = r.w;
		DATA.me = r.me || DATA.me;
		for (const [k, v] of Object.entries(r.d.nb || {})) DATA.levels[k] = v.level;
		DATA.levels[r.d.id] = r.d.level;
		if (r.best) {
			if (!DATA.best)
				DATA.best = {
					starWeights: r.best.starWeights,
					biomes: {},
					monsters: {},
				};
			Object.assign(DATA.best.biomes, r.best.biomes);
			Object.assign(DATA.best.monsters, r.best.monsters);
		}
	}

	let manP = null;
	function bakeMan() {
		if (manP) return manP;
		let off = false;
		try {
			off =
				/[?&]districtbake=0/.test(location.search) ||
				localStorage.lgDistrictBake === "0";
		} catch (e) {
			off = false;
		}
		if (off) return (manP = Promise.resolve(null));
		const v = dbkV();
		manP = fetch(
			"/site/districtbake/index.json" +
				(v ? "?v=" + encodeURIComponent(v) : ""),
			{ credentials: "same-origin" },
		)
			.then((r) => (r.ok ? r.json() : null))
			.then((m) => (m && m.v === 1 && m.districts ? m : null))
			.catch((e) => {
				console.warn("[карта округа] запечённого нет - рисуем сами", e);
				return null;
			});
		return manP;
	}
	function bakeOf(man, d) {
		const e = man && man.districts && man.districts[d.id];
		if (
			!e ||
			!window.LGDistrictArt ||
			typeof LGDistrictArt.artKey !== "function" ||
			typeof LGDistrictArt.h64 !== "function"
		)
			return null;

		return window.LGDistrictRules.bakePick(
			man,
			d.id,
			LGDistrictArt.h64(JSON.stringify(d.sch)),
			LGDistrictArt.VER,
			bakeBad(),
		);
	}

	const BAKE_BAD = "lgDistrictBakeBad";
	let badSet = null;
	const dbkV = () =>
		(window.LG_WORLDV || {}).dbk ||
		(window.LG_SITEF || {})["districtbake"] ||
		"";
	function bakeBad() {
		if (badSet) return badSet;
		let raw = "";
		try {
			raw = sessionStorage.getItem(BAKE_BAD) || "";
		} catch (e) {
			raw = "";
		}
		return (badSet = window.LGDistrictRules.bakeBadRead(raw, dbkV()));
	}
	function bakeBadAdd(id) {
		const s = bakeBad();
		s.add(id);
		try {
			sessionStorage.setItem(
				BAKE_BAD,
				window.LGDistrictRules.bakeBadWrite(s, dbkV()),
			);
		} catch (e) {
			console.warn(
				"[карта округа] список округов без плиток - только в этой странице",
				e,
			);
		}
	}

	let CUR = null,
		busy = false;

	async function open(id, X, data) {
		if (busy) return false;
		busy = true;
		try {
			const r =
				data || (await X.api("/api/district?id=" + encodeURIComponent(id)));
			if (!r || r.ok === false) {
				if (X.toast)
					X.toast(
						(r && r.error) || "Карта округа не загрузилась - проверь связь",
						true,
					);
				return false;
			}
			const d = districtOf(r);
			if (!d) {
				if (X.toast) X.toast("Карту этого округа построить не вышло", true);
				return false;
			}
			const man = await bakeMan();
			d.bake = bakeOf(man, d);
			const DATA = {
				districts: [d],
				W: r.w,
				levels: {},
				towns: {},
				best: null,
				me: r.me || {},
				art: true,
				built: "",
				man,
			};
			mergeData(DATA, r);
			close();
			const host = document.createElement("div");
			host.className = "gl-modal gw-tok gw-dk dmw";
			host.dataset.gst = gst();
			host.innerHTML = TEMPLATE(host.dataset.gst);
			(document.fullscreenElement || document.body).appendChild(host);
			document.documentElement.classList.add("gl-open");
			const XX = {
				...X,
				refill: async (to) => {
					const q = await X.api("/api/district?id=" + encodeURIComponent(to));
					if (!q || q.ok === false) return null;
					const dd = districtOf(q);
					if (!dd) return null;
					dd.bake = bakeOf(man, dd);
					mergeData(DATA, q);
					return dd;
				},
			};
			CUR = boot(host, DATA, XX);
			return true;
		} catch (e) {
			console.warn("[карта округа] не открылась", e);
			if (X.toast) X.toast("Карта округа не открылась", true);
			return false;
		} finally {
			busy = false;
		}
	}
	function close() {
		if (CUR) {
			const c = CUR;
			CUR = null;
			c.close();
		}
	}
	return {
		open,
		close,
		isOpen: () => !!CUR,
		_cur: () => CUR,
		_districtOf: districtOf,
	};
})();
