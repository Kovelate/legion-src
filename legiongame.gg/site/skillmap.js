(() => {
	const I = () => (window.LGSkills && window.LGSkills.ico) || {};
	const esc = (s) =>
		String(s == null ? "" : s).replace(
			/[&<>"]/g,
			(c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
		);
	const svgI = (p) =>
		I().svg
			? I().svg(p || "")
			: `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${p || ""}</svg>`;
	const tokArt = (n) => (I().tokArt ? I().tokArt(n) : "");
	const tokName = (n) => (I().tokName ? I().tokName(n) : "жетонов навыков");
	const tokTitle = () => (I().tokTitle ? I().tokTitle() : "Жетон навыков");
	const txt = (n, r) => (I().txt ? I().txt(n, r) : String(n.text || ""));
	const plural = (n, a, b, c) => {
		const x = Math.abs(n) % 100,
			y = x % 10;
		return x > 10 && x < 20 ? c : y === 1 ? a : y >= 2 && y <= 4 ? b : c;
	};
	const TK = (s) =>
		esc(s).replace(/⟡/g, `<span class="tki">${tokArt(18)}</span>`);
	const setH = (el, h) => {
		if (el && el.__h !== h) {
			el.innerHTML = h;
			el.__h = h;
		}
	};
	const setA = (el, k, v) => {
		if (el && el.getAttribute(k) !== v) el.setAttribute(k, v);
	};

	const CFG = new Map();
	const LIVE = new Set();
	let SEQ = 0;

	const ME = {
		cls: null,
		view: { s: 1, x: 0, y: 0, fit: true },
		vc: {},
		lg: false,
	};
	try {
		ME.cls = localStorage.getItem("lgSkCls") || null;
	} catch (e) {}
	let TIP = null,
		TOAST = null,
		TOAST_T = 0;
	function tipEl() {
		if (!TIP || !TIP.isConnected) {
			TIP = document.createElement("div");
			TIP.className = "skm-tip";
			TIP.hidden = true;
			document.body.append(TIP);
		}
		return TIP;
	}
	function hideTip() {
		if (TIP) TIP.hidden = true;
	}
	function toast(t, bad) {
		if (!TOAST || !TOAST.isConnected) {
			TOAST = document.createElement("div");
			TOAST.className = "skm-toast";
			TOAST.setAttribute("role", "status");
			TOAST.setAttribute("aria-live", "polite");
			document.body.append(TOAST);
		}
		TOAST.innerHTML = TK(t);
		TOAST.classList.toggle("bad", !!bad);
		TOAST.hidden = false;
		clearTimeout(TOAST_T);
		TOAST_T = setTimeout(() => {
			if (TOAST) TOAST.hidden = true;
		}, 2600);
	}

	function showTip(t, extra) {
		const v = t.getAttribute("data-tip");
		if (!v) {
			hideTip();
			return;
		}
		const tip = tipEl(),
			bc = getComputedStyle(t).getPropertyValue("--bc").trim();
		tip.style.setProperty("--tc", bc || "");
		const nx = (s) => {
			const j = s.indexOf("\n§");
			if (j < 0) return TK(s);
			const [h1, b1] = s.slice(j + 2).split("|");
			return `${TK(s.slice(0, j))}<span class="nx"><b>${TK(h1)}</b>${b1 ? `<span>${TK(b1)}</span>` : ""}</span>`;
		};
		const i = v.indexOf("\n");
		setH(
			tip,
			(i < 0
				? nx(v)
				: `<b class="th">${TK(v.slice(0, i))}</b>${nx(v.slice(i + 1))}`) +
				(extra || ""),
		);
		tip.hidden = false;
		const r = t.getBoundingClientRect(),
			w = tip.offsetWidth,
			hh = tip.offsetHeight;
		let top = r.bottom + (t.matches(".skm-nd") ? 20 : 8);
		if (top + hh > innerHeight - 6) top = Math.max(6, r.top - hh - 8);
		tip.style.left =
			Math.round(
				Math.min(innerWidth - w - 8, Math.max(8, r.left + r.width / 2 - w / 2)),
			) + "px";
		tip.style.top = Math.round(top) + "px";
	}
	const instOf = (n) => {
		const r = n && n.closest && n.closest(".skmw");
		return r && r.__sm && !r.__sm.dead ? r.__sm : null;
	};
	let HOVER = null;
	document.addEventListener("mouseover", (e) => {
		const S = instOf(e.target);
		const nd =
			e.target.closest && e.target.closest(".skmw [data-n], .skmw [data-ab]");
		if (nd !== HOVER) {
			const P = instOf(HOVER);
			HOVER = nd;
			if (P) P.clearPath();
			if (S && nd && !S.ad) S.cost = S.showPath(nd.dataset.n || nd.dataset.ab);
			else if (S) S.cost = 0;
		}
		const t =
			e.target.closest &&
			e.target.closest(".skmw [data-tip], .skm-side [data-tip]");
		if (!t || (S && S.sel && t.matches(".sel"))) {
			hideTip();
			return;
		}
		const S2 = instOf(t);
		const extra =
			S2 && S2.cost > 1 && t.matches("[data-n], [data-ab]")
				? `<span class="pc">Путь до него подсвечен: нужно ${S2.cost} ${plural(S2.cost, "очко", "очка", "очков")}${!S2.ro && S2.cost > S2.free() ? ` - у тебя ${S2.free()}` : ""}</span>`
				: "";
		showTip(t, extra);
	});
	document.addEventListener("click", (e) => {
		for (const S of [...LIVE]) {
			if (S.dead || !S.root.isConnected) {
				S.kill();
				continue;
			}
			S.docClick(e);
		}
	});
	document.addEventListener("keydown", (e) => {
		if (e.key !== "Escape") return;
		for (const S of LIVE) S.esc();
	});

	addEventListener("pointerup", (e) => {
		for (const S of LIVE) S.upOut(e);
	});
	let RSZ = 0;
	addEventListener("resize", () => {
		cancelAnimationFrame(RSZ);
		RSZ = requestAnimationFrame(() => {
			for (const S of [...LIVE]) {
				if (!S.root.isConnected) {
					S.kill();
					continue;
				}
				S.resized();
			}
		});
	});

	function mk(root, c0) {
		const own = root.dataset.smid === "me";
		const S = {
			root,
			c: c0,
			ro: !!c0.ro,
			dead: false,
			own,
			cls: null,
			V: null,
			C: null,
			L: null,
			built: "",
			els: {},
			sel: null,
			pick: null,
			rename: -1,
			arm: 0,
			armT: 0,
			cf: null,
			cfT: 0,
			busy: false,
			view: own ? ME.view : { s: 1, x: 0, y: 0, fit: true },
			size: [0, 0],
			m: "",
			cost: 0,
			ad: null,
			drg: { on: false, moved: false },
			pts: new Map(),
			pinch: null,
			loadAt: 0,
			loading: "",
			nTry: null,
		};
		const X = () => S.c.X;
		const list = () =>
			(S.c.list || (S.c.tree && S.c.tree.classes) || []).filter((x) => x.map);
		const vc = own ? ME.vc : {};
		const brColor = (B, bi) =>
			I().brC ? I().brC(B, bi) : ["#5cc8ff", "#ff9466", "#c4a0ff"][bi % 3];
		const bcOf = (bi) =>
			S.C && S.C.branches[bi] ? brColor(S.C.branches[bi], bi) : "#6b6478";
		S.free = () => Math.max(0, +(S.V && S.V.free) || 0);
		const tokN = () => Math.max(0, +(S.V && S.V.n) || 0);
		const stepCost = (r) => {
			const a = (S.V && S.V.step) || [3, 4, 5, 6];
			return +a[Math.min(a.length - 1, Math.max(0, r - 1))] || r + 2;
		};
		const isOpen = (id) =>
			id === "hub" || +(S.V.st.n || {})[id] > 0 || !!(S.V.st.a || {})[id];
		const nbrs = (id) =>
			S.L.E.filter((e) => e[3] !== "q" && (e[0] === id || e[1] === id)).map(
				(e) => (e[0] === id ? e[1] : e[0]),
			);
		const stop = () =>
			S.ro ||
			S.busy ||
			!!(S.V && (S.V.busy || S.V.dead)) ||
			!!(S.c.h && (S.c.h.busy || S.c.h.ghost));
		const canOpen = (id) =>
			!stop() && S.free() > 0 && !isOpen(id) && nbrs(id).some(isOpen);
		const nodeOf = (id) => {
			for (const B of S.C.branches) {
				const n = B.nodes.find((x) => x.id === id);
				if (n) return [B, n];
			}
			return [null, null];
		};
		const abOf = (key) => {
			const [bid, k] = String(key).split(":"),
				A = ((S.V.ab && S.V.ab.br) || []).find((x) => x.id === bid);
			return (A && A[k]) || null;
		};
		const clsQ = () =>
			(S.C.actions || []).find((a) => a.unlock && a.unlock.mastery != null) ||
			null;
		const qOpenM = () =>
			(+(S.V.cnt || {})[S.cls] || 0) >= (+S.V.classOpen || 0);
		const clsName = (id) => {
			const C = list().find((x) => x.id === id);
			return X().roleOf ? X().roleOf(id, C ? C.name : id) : C ? C.name : id;
		};
		const lc = (s) =>
			String(s || "")
				.replace(/\s\u2014\s/g, " - ")
				.replace(/^./, (ch) => ch.toLowerCase());

		function setV(v, keepSel) {
			if (!v || !v.cls) return;
			vc[v.cls] = v;
			if (v.cls !== S.cls) return;
			S.V = v;
			if (!keepSel && S.sel && S.sel.ab && !abOf(S.sel.ab)) S.sel = null;
			draw();
			if (own && v.cls === v.cur) dots(S.free());
		}
		function load(force) {
			if (S.ro) return;
			const cls = S.cls;
			if (S.loading === cls && !force) return;
			S.loading = cls;
			S.loadAt = Date.now();
			X()
				.api("/api/skmap?cls=" + encodeURIComponent(cls || ""))
				.then((r) => {
					if (S.loading === cls) S.loading = "";
					if (S.dead) return;
					if (r && r.ok && r.cls) {
						if (!S.cls) S.cls = r.cls;
						setV(r, true);
					} else if (!S.V)
						wait(
							r && r.closed
								? "Новое древо навыков пока закрыто."
								: `Карта навыков не загрузилась${r && r.error ? ` - ${r.error}` : ""}. Обнови страницу.`,
						);
					else toast((r && r.error) || "не загрузилось", true);
				});
		}
		function act(body, ok) {
			if (S.ro || S.busy) return;
			S.busy = true;
			X()
				.api("/api/skmap/act", { ...body, cls: S.cls })
				.then((r) => {
					S.busy = false;
					if (S.dead) return;
					if (r && r.ok) {
						if (r.view) setV(r.view);
						const m = typeof ok === "function" ? ok(r) : ok;
						if (m) toast(m);
					} else {
						toast((r && r.error) || "не вышло", true);
						draw();
					}
				});
		}
		function wait(t) {
			S.root.innerHTML = `<p class="skm-wait">${esc(t)}</p>`;
			S.built = "";
			S.els = {};
		}

		function dots(f) {
			for (const t of document.querySelectorAll(
				'.tabs [data-tab="hero"], .views [data-view="skills"]',
			)) {
				let d = t.querySelector(".skm-dot");
				if (!f) {
					if (d) d.remove();
					continue;
				}
				if (!d) {
					d = document.createElement("i");
					d.className = "skm-dot";
					t.append(d);
				}
				if (d.textContent !== String(f)) d.textContent = String(f);
				setA(d, "aria-label", `свободных очков навыков: ${f}`);
			}
		}

		function shell() {
			S.root.innerHTML = `<div class="skm-bh"></div><div class="skm-bar" hidden></div><div class="skm-bb"><div class="skm-map" tabindex="-1">
          <div class="skm-world"></div>
          <div class="skm-hero"><div class="skm-hh"></div><div class="skm-fig"></div><div class="skm-slots"><div class="skm-sh">Навыки Арены</div><div class="skm-row2"></div><div class="skm-stabs"></div></div><div class="skm-stl"></div></div>
          <button type="button" class="skm-lgbtn" aria-expanded="false" aria-label="Как читать карту"><span class="lt">? Как читать карту</span><span class="ls">?</span></button>
          <div class="skm-lg" hidden></div>
          <div class="skm-zoom"><button type="button" data-z="1.2" aria-label="Приблизить">＋</button><button type="button" data-z="0.83" aria-label="Отдалить">－</button><button type="button" data-z="0" aria-label="Вся карта">⌂</button></div>
        </div><aside class="skm-side" hidden></aside></div>`;
			const q = (s) => S.root.querySelector(s);
			S.els = {
				bh: q(".skm-bh"),
				bar: q(".skm-bar"),
				bb: q(".skm-bb"),
				map: q(".skm-map"),
				world: q(".skm-world"),
				hero: q(".skm-hero"),
				hh: q(".skm-hh"),
				fig: q(".skm-fig"),
				row2: q(".skm-row2"),
				stabs: q(".skm-stabs"),
				stl: q(".skm-stl"),
				lgbtn: q(".skm-lgbtn"),
				lg: q(".skm-lg"),
				side: q(".skm-side"),
			};
			S.built = "";
			S.figKey = "";
			wire();
		}

		function build() {
			const C = S.C,
				L = S.L,
				E = S.els,
				IC = I(),
				NI = IC.NI || {},
				BI = IC.BI || {},
				CLI = IC.CLI || {};
			const pt = (id) => (id === "hub" ? { x: 0, y: 0 } : L.P[id]);
			const lines = L.E.map(([a, b, bi, q]) => {
				const A = pt(a),
					B = pt(b);
				if (!A || !B) return "";
				return `<line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" data-e="${esc(a)}|${esc(b)}"${q ? ' class="q"' : ""} style="--bc:${bcOf(bi)}"/>`;
			}).join("");
			const nodes = Object.entries(L.P)
				.map(([id, o]) => {
					const pos = `left:${o.x}px;top:${o.y}px;--bc:${bcOf(o.bi)}`;
					if (o.ab)
						return `<button type="button" class="skm-mn skm-ab" data-ab="${esc(id)}" style="${pos}"><span class="c"><span class="ic"></span><b></b></span><span class="pl" data-pla="${esc(id)}" role="button" hidden></span></button>`;
					if (o.q) {
						const a = (C.actions || []).find((x) => x.id === o.q);
						if (!a) return "";
						return `<span class="skm-mn skm-q" data-q="${esc(o.q)}" style="left:${o.x}px;top:${o.y}px"><span class="c">⚡</span><span class="w">${esc(a.word)}</span></span>`;
					}
					const [B, n] = nodeOf(id);
					if (!n) return "";
					const ic = (IC.branchIcons ? IC.branchIcons(B) : {})[n.id];
					return `<button type="button" class="skm-mn skm-nd${n.kind === "cap" ? " cap" : ""}" data-n="${esc(id)}" style="${pos}"><span class="c">${svgI(NI[ic] || BI[B.id] || IC.DIAM)}</span><span class="sd2"></span><span class="pl" data-pl="${esc(id)}" role="button" hidden></span></button>`;
				})
				.join("");
			const RAD = 450,
				ANG = [-90, 30, 150];
			const labels = C.branches
				.slice(0, 3)
				.map((B, bi) => {
					const a = (ANG[bi] * Math.PI) / 180,
						up = Math.sin(a) < 0;
					return `<span class="skm-blab" data-bl="${esc(B.id)}" style="left:${Math.round(Math.cos(a) * RAD)}px;top:${Math.round(Math.sin(a) * RAD + (up ? -62 : 62))}px;--bc:${bcOf(bi)}"><span class="bi">${svgI(BI[B.id] || IC.DIAM)}</span>${esc(B.name)} <b></b></span>`;
				})
				.join("");
			E.world.style.opacity = "";
			E.world.innerHTML = `<svg class="skm-ln" viewBox="-600 -600 1200 1200" width="1200" height="1200" aria-hidden="true">${lines}</svg>
        <button type="button" class="skm-hub" style="--c:${esc(C.color || "#ffd24a")}" aria-label="Умение класса">${svgI(NI[CLI[S.cls]] || IC.DIAM)}</button>${nodes}${labels}`;

			S.nd = {};
			S.ln = [];
			S.lnBy = new Map();
			E.world
				.querySelectorAll("[data-n], [data-ab], [data-q]")
				.forEach((el) => {
					S.nd[el.dataset.n || el.dataset.ab || "q:" + el.dataset.q] = el;
				});
			E.world.querySelectorAll("line[data-e]").forEach((l) => {
				const [a, b] = l.dataset.e.split("|");
				const o = { l, a, b, q: l.classList.contains("q") };
				S.ln.push(o);
				for (const k of [a, b]) {
					if (!S.lnBy.has(k)) S.lnBy.set(k, []);
					S.lnBy.get(k).push(o);
				}
			});
			S.hub = E.world.querySelector(".skm-hub");
			S.blab = {};
			E.world.querySelectorAll("[data-bl]").forEach((b) => {
				S.blab[b.dataset.bl] = b.querySelector("b");
			});
			S.built = S.cls + "|" + ((S.c.tree && S.c.tree.v) || "");
			S.view.fit = true;
			S.size = [0, 0];
		}

		function mode() {
			const w = S.root.clientWidth || innerWidth;
			return w < 700
				? "p"
				: innerHeight < 520 && innerWidth > innerHeight
					? "l"
					: "d";
		}
		function layoutCam(force) {
			const E = S.els;
			if (!E.map || !E.map.clientWidth) return;
			const M = mode();
			if (S.m !== M) {
				S.m = M;
				S.root.dataset.m = M;
			}
			const W = E.map.clientWidth;
			const top =
				E.map.getBoundingClientRect().top + (S.own ? window.scrollY || 0 : 0);

			const cs = getComputedStyle(S.root),
				below =
					(parseFloat(cs.paddingBottom) || 0) +
					(parseFloat(cs.borderBottomWidth) || 0) +
					(parseFloat(cs.marginBottom) || 0) +
					(M === "d" ? 8 : 2) +
					(M === "p" && S.own ? 54 : 0);
			const H = Math.round(
				Math.max(M === "d" ? 480 : 200, innerHeight - top - below),
			);
			if (
				!force &&
				Math.abs(W - S.size[0]) <= 2 &&
				Math.abs(H - S.size[1]) <= 2
			)
				return;
			S.size = [W, H];
			if (E.map.style.height !== H + "px") E.map.style.height = H + "px";
			E.map.style.setProperty("--smh", H + "px");
			const V = S.view;
			if (V.fit) {
				const HW = M === "d" ? (W > 900 ? 330 : 0) : M === "l" ? 380 : 0,
					HT = M === "p" ? 262 : 0;
				V.s = Math.min(
					(W - HW) / (M === "d" ? 1060 : M === "l" ? 1000 : 930),
					(H - HT) / (M === "l" ? 1150 : M === "d" ? 1060 : 930),
				);
				V.s = Math.max(0.3, Math.min(2.2, V.s));
				V.x =
					M === "d" && HW
						? Math.min(W / 2 + 150, HW + (W - HW) / 2)
						: HW + (W - HW) / 2;
				V.y = HT + (H - HT) / 2 + (M === "d" ? 10 : 6);
			}
			apply();
		}
		function apply() {
			const V = S.view,
				t = `translate(${Math.round(V.x)}px,${Math.round(V.y)}px) scale(${Math.round(V.s * 1000) / 1000})`;
			if (S.els.world && S.els.world.style.transform !== t)
				S.els.world.style.transform = t;
			if (S.sel) placeSide();
		}
		const zoomAt = (z, cx, cy) => {
			const V = S.view,
				ns = Math.min(2.2, Math.max(0.35, V.s * z)),
				k = ns / V.s;
			V.x = cx - (cx - V.x) * k;
			V.y = cy - (cy - V.y) * k;
			V.s = ns;
			V.fit = false;
		};

		function nextTip(n, r) {
			if (S.ro) return "";
			if (!r)
				return canOpen(n.id)
					? "\n§＋ Открыть - 1 очко"
					: stop()
						? ""
						: nbrs(n.id).some(isOpen) && !S.free()
							? "\nНет свободных очков"
							: !nbrs(n.id).some(isOpen)
								? "\nСначала открой соседний навык - тот, что соединён с ним линией"
								: "";
			if (r >= n.max)
				return n.max > 1
					? "\nМаксимальная ступень"
					: "\nЭтот навык не усиливается";
			const c = stepCost(r),
				have = tokN();
			return `\n§＋ Ступень ${r + 1} - ${c} ⟡${have < c ? ` (у тебя ${have})` : ""}|${txt(n, r + 1)}`;
		}
		function updNodes() {
			const V = S.V,
				st = V.st;
			for (const [id, el] of Object.entries(S.nd)) {
				if (el.dataset.n) {
					const [, n] = nodeOf(id);
					if (!n) continue;
					const r = Math.min(n.max, +st.n[id] || 0),
						can = canOpen(id);
					el.classList.toggle("has", r > 0);
					el.classList.toggle("can", can);
					el.classList.toggle("sel", !!(S.sel && S.sel.n === id));
					setH(
						el.querySelector(".sd2"),
						r && n.max > 1
							? Array.from(
									{ length: n.max },
									(_, k) => `<i${k < r ? ' class="f"' : ""}></i>`,
								).join("")
							: "",
					);
					const pl = el.querySelector(".pl"),
						cost = r && r < n.max ? stepCost(r) : 0,
						show = !S.ro && !stop() && (r ? r < n.max : can);
					pl.hidden = !show;
					pl.classList.toggle("cf", !!(S.cf && S.cf.k === "pl:" + id));
					pl.classList.toggle("stp2", !!r);
					pl.classList.toggle("no", !!r && tokN() < cost);
					setA(
						pl,
						"aria-label",
						r
							? `Ступень ${r + 1}: ${n.name}, ${cost} ${tokName(cost)}`
							: `Открыть: ${n.name}`,
					);
					setA(
						el,
						"aria-label",
						`${n.name}${r ? `, ступень ${r} из ${n.max}` : ", не открыт"}`,
					);
					setA(
						el,
						"data-tip",
						`${n.name}${r ? ` · ступень ${r} из ${n.max}` : ""}:\n${txt(n, Math.max(1, r))}${nextTip(n, r)}`,
					);
				} else if (el.dataset.ab) {
					const x = abOf(id),
						k = id.split(":")[1];
					el.hidden = !x;
					if (!x) continue;
					const op = !!st.a[id],
						eq = st.eq[k] === id,
						can = canOpen(id);
					el.classList.toggle("has", op);
					el.classList.toggle("act", eq);
					el.classList.toggle("can", can);
					el.classList.toggle("sel", !!(S.sel && S.sel.ab === id));
					setH(
						el.querySelector(".ic"),
						esc(x.icon || (k === "ult" ? "★" : "◆")),
					);
					setH(el.querySelector("b"), op ? String((x.up && x.up.lv) || 1) : "");
					{
						const pl = el.querySelector(".pl");
						pl.hidden = !can;
						pl.classList.toggle("cf", !!(S.cf && S.cf.k === "pla:" + id));
					}
					const need = k === "ult" ? V.ab.ultLvl : V.ab.abLvl;
					setA(
						el,
						"aria-label",
						`${x.name}, ${k === "ab" ? "способность" : "ульта"}${op ? "" : ", не открыта"}`,
					);
					setA(
						el,
						"data-tip",
						`${x.name}${op ? ` · ступень ${(x.up && x.up.lv) || 1}` : ""}\n${k === "ab" ? "Способность, каждый 3-й ход на Арене" : "Ульта, каждый 5-й ход на Арене"}: ${x.text}.${need && V.lvl < need ? ` В бою - с ${need} уровня героя.` : ""}${eq ? " Стоит в гнезде." : op && !S.ro ? " Перетащи в гнездо под героем или нажми." : ""}${can ? "\n§＋ Открыть - 1 очко" : ""}`,
					);
				} else {
					const qid = id.slice(2),
						a = (S.C.actions || []).find((x) => x.id === qid),
						p = S.L.P[id];
					if (!a || !p) continue;
					const op = isOpen(p.host);
					el.classList.toggle("on", op);
					setA(
						el,
						"data-tip",
						`⚡ В походе ${op ? "открыт" : "откроется"} дополнительный навык «${a.name}»:\n${lc(a.text)}`,
					);
				}
			}
			for (const o of S.ln) {
				let on;
				if (o.q) {
					const p = S.L.P[o.b];
					on = !!p && isOpen(p.host);
				} else on = isOpen(o.a) && isOpen(o.b);
				if (o.l.classList.contains("on") !== on) {
					o.l.classList.toggle("on", on);
					o.l.classList.toggle(
						"fresh",
						on && !!S.fresh && (S.fresh === o.a || S.fresh === o.b),
					);
				}
			}
			const q = clsQ(),
				hub = S.hub;
			hub.classList.toggle("on", !!q && qOpenM());
			hub.classList.toggle("sel", !!(S.sel && S.sel.hub));
			setA(
				hub,
				"data-tip",
				q
					? `${q.name} · умение класса\n${qOpenM() ? "Открыто" : `Откроется с ${V.classOpen} открытых навыков класса`} - нажми, чтобы прочитать`
					: `${clsName(S.cls)}`,
			);
			for (const B of S.C.branches)
				if (S.blab[B.id])
					setH(
						S.blab[B.id],
						`${B.nodes.filter((n) => +st.n[n.id] > 0).length}/${B.nodes.length}`,
					);
		}
		function pop(id) {
			const el = S.nd[id];
			if (!el) return;
			el.classList.remove("popn");
			void el.offsetWidth;
			el.classList.add("popn");
			setTimeout(() => {
				el.classList.remove("popn");
				if (S.fresh === id) S.fresh = null;
			}, 800);
		}

		S.showPath = (id) => {
			S.clearPath();
			if (!S.V || !S.L || !id || isOpen(id)) return 0;
			const adj = new Map();
			for (const e of S.L.E) {
				if (e[3] === "q") continue;
				for (const [a, b] of [
					[e[0], e[1]],
					[e[1], e[0]],
				]) {
					if (!adj.has(a)) adj.set(a, []);
					adj.get(a).push(b);
				}
			}
			const dist = new Map([["hub", 0]]),
				prev = new Map(),
				Q = [["hub", 0]];
			while (Q.length) {
				Q.sort((x, y) => x[1] - y[1]);
				const [u, d] = Q.shift();
				if (d > dist.get(u)) continue;
				if (u === id) break;
				for (const v of adj.get(u) || []) {
					const nd = d + (isOpen(v) ? 0 : 1);
					if (nd < (dist.has(v) ? dist.get(v) : 1e9)) {
						dist.set(v, nd);
						prev.set(v, u);
						Q.push([v, nd]);
					}
				}
			}
			if (!dist.has(id)) return 0;
			const P = [id];
			let c = id;
			while (prev.has(c)) {
				c = prev.get(c);
				P.push(c);
			}
			const set = new Set(P);
			for (const o of S.ln)
				if (
					!o.q &&
					set.has(o.a) &&
					set.has(o.b) &&
					(!isOpen(o.a) || !isOpen(o.b))
				)
					o.l.classList.add("path");
			for (const n of P)
				if (!isOpen(n) && S.nd[n]) S.nd[n].classList.add("path");
			S.pathOn = true;
			return dist.get(id);
		};
		S.clearPath = () => {
			if (!S.pathOn) return;
			S.pathOn = false;
			S.root
				.querySelectorAll(".path")
				.forEach((x) => x.classList.remove("path"));
		};

		function head() {
			const V = S.V,
				IC = I(),
				NI = IC.NI || {},
				CLI = IC.CLI || {},
				f = S.free(),
				h = S.c.h || {};
			const L0 = S.ro
				? list().filter((c) => c.id === S.cls)
				: list().filter(
						(x) =>
							!x.beta || (h.sk && h.sk.cb) || x.id === V.cur || x.id === S.cls,
					);
			const cl = L0.map((c) => {
				const mine = c.id === V.cur,
					n = +(V.cnt || {})[c.id] || 0;
				return `<button type="button" class="skm-cl${c.id === S.cls ? " on" : ""}${mine ? " mine" : ""}" data-cl="${esc(c.id)}" style="--c:${esc(c.color || "#ffd24a")}" aria-pressed="${c.id === S.cls}" data-tip="${esc(clsName(c.id))}\n${mine ? "Класс героя - оружие в руках." : "Можно смотреть и вкладывать - работает, когда в руках оружие класса."} Открыто навыков: ${n}">${mine ? '<span class="mk">в руках</span>' : ""}<span class="ci">${svgI(NI[CLI[c.id]] || IC.DIAM)}</span><span class="cn">${esc(clsName(c.id))}</span></button>`;
			}).join("");
			const ptsTip =
				V.md === "class"
					? `Очки навыков - по уровню мастерства класса (${V.pts}). Одно очко открывает один навык.`
					: `Очки навыков - по 1 за уровень героя (${V.lvl} ур.). Одно очко открывает один навык в любой ветке.`;
			const spent = +(V.cnt || {})[S.cls] || 0,
				canReset = !S.ro && !stop() && (spent > 0 || +V.back > 0);
			const rp = +V.rp || 0,
				price = rp ? (X().money ? X().money(rp) : String(rp)) : "бесплатно";
			const priceT = String(price)
				.replace(/<[^>]+>/g, " ")
				.replace(/\s+/g, " ")
				.trim();
			setH(
				S.els.bh,
				`<div class="skm-cls" role="group" aria-label="Класс">${cl}</div><span class="sp"></span>
        ${S.ro ? "" : `<span class="skm-pill pts${f ? "" : " zero"}" data-tip="${esc(ptsTip)}"><b>${f}</b><span class="lt"> ${plural(f, "свободное очко", "свободных очка", "свободных очков")}</span><span class="ls"> очк.</span></span>`}
        ${S.ro ? "" : `<span class="skm-pill tokp" data-tip="${esc(tokTitle())}: ${tokN()}\nНужны для ступеней навыков и улучшения способностей Арены"><span class="tki">${tokArt(30)}</span><b>${tokN()}</b></span>`}
        ${S.ro ? "" : `<button type="button" class="skm-ghost${S.arm ? " arm" : ""}" data-rst aria-label="Сбросить очки"${canReset ? "" : " disabled"} data-tip="${esc(`Сбросить очки навыков класса «${clsName(S.cls)}»\nВернутся все очки${+V.back ? ` и ${V.back} ⟡` : ""}. Цена: ${priceT}`)}">${S.arm ? `<span class="lt">Точно сбросить? · ${price}</span><span class="ls">Точно?</span>` : '<span class="lt">Сбросить очки</span><span class="ls">↺</span>'}</button>`}`,
			);
			const h0 = S.c.h || {},
				bar =
					V.dead || h0.ghost
						? "Призрак не учится - после воскрешения"
						: V.busy || h0.busy
							? "Идёт бой - навыки после боя"
							: V.own && V.own !== S.cls && !S.ro
								? `Очки уже в древе «${clsName(V.own)}» - сбрось очки там, чтобы открыть этот класс`
								: "";
			S.els.bar.hidden = !bar;
			setH(S.els.bar, esc(bar));
		}

		function hero() {
			const V = S.V,
				h = S.c.h || {},
				IC = I(),
				NI = IC.NI || {},
				CLI = IC.CLI || {},
				C = S.C;
			setH(
				S.els.hh,
				`<div class="hn">${esc(h.name || h.login || "")}</div><div class="hc" style="--c:${esc(C.color || "#ffd24a")}"><span class="ci">${svgI(NI[CLI[S.cls]] || IC.DIAM)}</span>${esc(clsName(S.cls))} · ${+V.lvl || +h.level || 1} ур.</div>${S.cls !== V.cur ? '<div class="hw">не в руках - работает с оружием класса</div>' : ""}`,
			);
			const fk = `${h.login}|${JSON.stringify(h.equip || "")}|${h.ghost ? 1 : 0}`;
			if (S.figKey !== fk) {
				S.figKey = fk;
				let f = "";
				try {
					f = X().fig ? String(X().fig(h) || "") : "";
				} catch (e) {
					f = "";
				}

				S.els.fig.innerHTML = f.replace(
					/<(animate|animateTransform|animateMotion|set)\b[^>]*?(\/>|>[\s\S]*?<\/\1>)/g,
					"",
				);
			}
			const brIx = (key) =>
				C.branches.findIndex((b) => b.id === String(key).split(":")[0]);
			const slot = (k) => {
				const key = V.st.eq[k],
					x = key && V.st.a[key] ? abOf(key) : null,
					bi = x ? brIx(key) : -1;
				const opts = Object.keys(V.st.a).filter(
					(q) => q.endsWith(":" + k) && abOf(q),
				);
				return `<div class="skm-sk${x ? "" : " nil"}${S.pick === k ? " open" : ""}" data-drop="${k}" style="--bc:${bi >= 0 ? bcOf(bi) : "#6b6478"}">
          <button type="button" class="sock" data-slot="${k}" aria-label="${k === "ab" ? "Гнездо способности" : "Гнездо ульты"}: ${x ? esc(x.name) : "пусто"}" data-tip="${x ? `${esc(x.name)} · ступень ${(x.up && x.up.lv) || 1}\n${k === "ab" ? "Способность, каждый 3-й ход" : "Ульта, каждый 5-й ход"}: ${esc(x.text)}.` : S.ro ? "Пусто" : "Пусто - перетащи сюда ромб с карты или нажми, чтобы выбрать"}"><span class="gem">${x ? `<span>${esc(x.icon || "◆")}</span><b>${(x.up && x.up.lv) || 1}</b>` : "<span>+</span>"}</span></button>
          <small>${k === "ab" ? "Способность (3-й ход)" : "Ульта (5-й ход)"}</small><b class="snm">${x ? esc(x.name) : "пусто"}</b>
          ${
						S.pick === k && !S.ro
							? `<div class="opts" role="listbox">${
									opts.length
										? opts
												.map((q) => {
													const y = abOf(q),
														qb = brIx(q);
													return `<button type="button" class="op${q === key ? " on" : ""}" data-eq="${esc(q)}" role="option" aria-selected="${q === key}" style="--bc:${bcOf(qb)}"><span class="si">${esc(y.icon || "◆")}</span><span><b>${esc(y.name)}</b><small>${esc((C.branches[qb] || {}).name || "")} · ступень ${(y.up && y.up.lv) || 1}</small></span></button>`;
												})
												.join("") +
											(
												key
													? `<button type="button" class="op" data-eq="" data-slot2="${k}"><span class="si">✕</span><span><b>Убрать из гнезда</b></span></button>`
													: ""
											)
										: '<div class="nt">Открытых пока нет - открой ромб на карте</div>'
								}</div>`
							: ""
					}</div>`;
			};
			setH(S.els.row2, slot("ab") + slot("ult"));

			const sets = V.st.s || [],
				si = V.st.si || 0,
				cur = JSON.stringify(eqOnly(V.st.eq)),
				dirty =
					!S.ro && JSON.stringify(eqOnly(sets[si] && sets[si].eq)) !== cur;
			const nm = (x) =>
				x && x.eq
					? ["ab", "ult"]
							.map((q) => (x.eq[q] && abOf(x.eq[q]) ? abOf(x.eq[q]).name : "-"))
							.join(" + ")
					: "Пусто";
			setH(
				S.els.stabs,
				sets
					.map(
						(x, k) =>
							`<span class="st${k === si ? " on" : ""}" data-st="${k}" role="button" tabindex="0" aria-pressed="${k === si}" data-tip="${esc(x.nm)}\n${esc(nm(x))}\nНабор запоминает только навыки Арены в гнёздах">${
								S.rename === k
									? `<input class="rn" maxlength="16" value="${esc(x.nm)}" aria-label="Название набора">`
									: `<b>${esc(x.nm)}</b>${k === si && dirty ? '<i class="dirty" aria-label="есть несохранённое">●</i>' : ""}${S.ro ? "" : `<button type="button" class="ren" data-rn="${k}" aria-label="Переименовать «${esc(x.nm)}»">✎</button>`}`
							}</span>`,
					)
					.join("") +
					(S.ro
						? ""
						: `<button type="button" class="sv${dirty ? " need" : ""}" data-sv data-tip="Запомнить, что сейчас стоит в гнёздах Арены, в «${esc((sets[si] || {}).nm || "")}»">Сохранить</button>`),
			);
			if (S.rename >= 0) {
				const r = S.els.stabs.querySelector(".rn");
				if (r && document.activeElement !== r) {
					r.focus();
					r.select();
				}
				wireRename();
			}
			setH(
				S.els.stl,
				`<div class="sh2">Что дают открытые навыки</div>${statList()}`,
			);
		}
		const eqOnly = (e) => ({ ab: (e && e.ab) || "", ult: (e && e.ult) || "" });

		function statList() {
			const M2 = new Map(),
				L2 = [];
			S.C.branches.forEach((B, bi) =>
				B.nodes.forEach((n) => {
					const r = Math.min(n.max, +S.V.st.n[n.id] || 0);
					if (!r) return;
					const t = txt(n, r),
						m = /^([А-Яа-яЁё. ]{3,26}?) ?([+−-])(\d+(?:,\d+)?)(%?)$/.exec(t);
					if (!m) return;
					const k = m[1].trim() + m[2] + m[4],
						v = parseFloat(m[3].replace(",", "."));
					if (M2.has(k)) {
						const o = M2.get(k);
						o.v += v;
						o.names.push(n.name);
						return;
					}
					const o = {
						pre: m[1].trim(),
						sg: m[2],
						suf: m[4],
						v,
						bc: bcOf(bi),
						names: [n.name],
					};
					M2.set(k, o);
					L2.push(o);
				}),
			);
			if (!L2.length) return '<div class="nt">Пока ничего не открыто</div>';
			const fmt = (v) => String(Math.round(v * 10) / 10).replace(".", ",");
			return `<ul class="sg">${L2.map((o) => `<li style="--bc:${o.bc}" data-tip="${esc(o.pre)}\n${esc(o.names.join(", "))}"><span class="k">${esc(o.pre)}</span><b>${o.sg}${fmt(o.v)}${o.suf}</b></li>`).join("")}</ul>`;
		}

		function legend() {
			const b1 = bcOf(0),
				b2 = bcOf(1);
			setH(
				S.els.lg,
				`<h4>Как читать карту</h4>
        <div class="li"><i class="lgn" style="--bc:${b1}"></i><span><b>Круг - пассивный навык.</b> Делает героя сильнее всегда: и в походе, и на Арене. Открывается за 1 очко, потом усиливается: ${esc(tokTitle().toLowerCase())} - за ступень.</span></div>
        <div class="li"><i class="lgd" style="--bc:${b2}"></i><span><b>Ромб - навык для Арены.</b> Герой бьёт им сам. После открытия перетащи его в гнездо под героем: 1 способность и 1 ульта.</span></div>
        <div class="li"><i class="lgq">⚡</i><span><b>Молния - умение похода.</b> Второе действие героя в походе, слово в чате.</span></div>
        <div class="li"><i class="lgn can" style="--bc:${b1}"></i><span><b>Золотое свечение и «+»</b> - можно открыть сейчас. Открывается только то, что соединено линией с открытым.</span></div>
        <div class="li"><i class="lgp"></i><span><b>Розовый «+»</b> - следующая ступень за ⟡, <b>серый</b> - не хватает.</span></div>
        <div class="li"><i class="lgs"><b></b><b></b><b></b></i><span><b>Кружки под навыком</b> - ступени: насколько он усилен.</span></div>`.replace(
					/⟡/g,
					`<span class="tki">${tokArt(16)}</span>`,
				),
			);
			S.els.lg.hidden = !(own ? ME.lg : S.lgOpen);
			setA(S.els.lgbtn, "aria-expanded", String(!S.els.lg.hidden));
		}

		function side() {
			const el = S.els.side,
				sel = S.sel,
				V = S.V,
				C = S.C;
			if (!sel) {
				if (!el.hidden) {
					el.hidden = true;
					setH(el, "");
				}
				return;
			}
			let html = "";
			if (sel.ab) {
				const key = sel.ab,
					[bid, k] = key.split(":"),
					bi = C.branches.findIndex((b) => b.id === bid),
					x = abOf(key);
				if (!x) {
					S.sel = null;
					side();
					return;
				}
				const op = !!V.st.a[key],
					eq = V.st.eq[k] === key,
					mx = V.ab.max || {},
					have = tokN();
				const why =
					op || S.ro
						? ""
						: stop()
							? ""
							: !nbrs(key).some(isOpen)
								? "Сначала открой соседний навык - тот, что соединён с ней линией"
								: !S.free()
									? "Свободных очков нет"
									: "";
				const need = k === "ult" ? V.ab.ultLvl : V.ab.abLvl;
				const rows =
					op && x.names
						? ["lv", "pow", "eff", "dur"]
								.filter((q) => mx[q])
								.map((q) => {
									const cur = (x.up && x.up[q]) || 0,
										from = q === "lv" ? 1 : 0,
										of = mx[q],
										cost = x.next && x.next[q],
										top =
											cost == null ||
											(q === "lv" ? cur >= of : cur - from >= of);
									return `<div class="upr"><span class="stp"><b>${esc(x.names[q] || q)}</b><span class="rk">${q === "lv" ? cur : cur - from} из ${of}</span><span class="sd">${Array.from({ length: of }, (_, i) => `<i${i < (q === "lv" ? cur : cur - from) ? ' class="f"' : ""}></i>`).join("")}</span></span><span class="d">${esc((x.nodes || {})[q] || "")}</span>${top ? '<span class="tg">макс.</span>' : S.ro || V.ab.off ? "" : `<button type="button" class="skm-gold${S.cf && S.cf.k === "up:" + q ? " cf" : ""}" data-up="${q}"${have < cost || stop() ? " disabled" : ""} aria-label="Улучшить: ${esc(x.names[q] || q)}, ${cost} ${tokName(cost)}">${S.cf && S.cf.k === "up:" + q ? `Ещё раз · ${cost} ⟡` : `${cost} ⟡`}</button>`}</div>`;
								})
								.join("")
						: "";
				html = `<div class="big" style="--bc:${bcOf(bi)}"><span class="c ab">${esc(x.icon || "◆")}</span><div><h3>${esc(x.name)}</h3><div class="mt">${k === "ab" ? "Способность · каждый 3-й ход" : "Ульта · каждый 5-й ход"} · ветка ${esc((C.branches[bi] || {}).name || "")}</div></div></div>
          <div class="eff">${esc(x.text)}</div>
          ${need && V.lvl < need ? `<div class="hnt">В бою сработает с ${need} уровня героя (сейчас ${V.lvl})</div>` : ""}
          ${
						S.ro
							? op
								? `<div class="tg">${eq ? "В гнезде" : "Открыта"}</div>`
								: '<div class="tg">Не открыта</div>'
							: !op
								? `<button type="button" class="skm-gold${S.cf && S.cf.k === "abopen" ? " cf" : ""}" data-abopen${why || stop() ? " disabled" : ""}>${S.cf && S.cf.k === "abopen" ? "Ещё раз - подтвердить" : "＋ Открыть · 1 очко"}</button>${why ? `<div class="why">${esc(why)}</div>` : ""}`
								: eq
									? '<div class="tg on">В гнезде</div>'
									: `<button type="button" class="skm-gold" data-abeq${stop() ? " disabled" : ""}>В гнездо «${k === "ab" ? "Способность" : "Ульта"}»</button>`
					}
          ${rows ? `<div class="ups">${rows}</div>${S.ro ? "" : `<div class="hnt">${esc(tokTitle())}: ${have}</div>`}` : ""}
          ${op && V.ab.off && !S.ro ? '<div class="hnt">Улучшения за жетоны откроются вместе со способностями Арены</div>' : ""}`;
			} else if (sel.hub) {
				const q = clsQ();
				if (!q) {
					S.sel = null;
					side();
					return;
				}
				const op = qOpenM();
				html = `<div class="big" style="--bc:${esc(C.color || "#ffd24a")}"><span class="c ab">⚡</span><div><h3>${esc(q.name)}</h3><div class="mt">Умение класса · в походе · ${op ? "открыто" : `откроется с ${V.classOpen} открытых навыков (сейчас ${+(V.cnt || {})[S.cls] || 0})`}</div></div></div>
          <div class="eff">⚡ В походе ${op ? "открыт" : "откроется"} дополнительный навык «${esc(q.name)}»:<br>${esc(lc(q.text))}</div><div class="hnt">В чате похода: «${esc(q.word)}»</div>`;
			}
			el.hidden = false;
			setH(
				el,
				`<button type="button" class="x" data-sx aria-label="Закрыть">✕</button>${html}`.replace(
					/⟡/g,
					`<span class="tki">${tokArt(20)}</span>`,
				),
			);
			placeSide();
		}
		function placeSide() {
			const el = S.els.side,
				sel = S.sel;
			if (!sel || el.hidden) return;
			if (S.m !== "d") {
				el.style.left = "";
				el.style.top = "";
				return;
			}
			const tgt = sel.hub ? S.hub : S.nd[sel.ab];
			if (!tgt) return;
			const bb = S.els.bb.getBoundingClientRect(),
				r0 = tgt.getBoundingClientRect(),
				W = el.offsetWidth || 330,
				Hh = el.offsetHeight,
				g = 14;
			const bi = sel.hub
					? 1
					: Math.max(
							0,
							S.C.branches.findIndex((b) => b.id === sel.ab.split(":")[0]),
						),
				ang = [-90, 30, 150][bi] || 30;
			const cx = r0.left + r0.width / 2 - bb.left,
				cy = r0.top + r0.height / 2 - bb.top;
			let L0, T0;
			if (ang === -90) {
				L0 = cx - W / 2;
				T0 = r0.bottom - bb.top + g;
			} else if (Math.cos((ang * Math.PI) / 180) < 0) {
				L0 = r0.right - bb.left + g;
				T0 = cy - Hh / 2;
			} else {
				L0 = r0.left - bb.left - W - g;
				T0 = cy - Hh / 2;
			}
			el.style.left =
				Math.round(Math.max(0, Math.min(L0, bb.width - W))) + "px";
			el.style.top =
				Math.round(Math.max(0, Math.min(T0, bb.height - Hh))) + "px";
		}

		function draw() {
			if (S.dead) return;
			if (!S.V) {
				if (!S.root.querySelector(".skm-wait"))
					wait("Загружаем карту навыков…");
				return;
			}
			const C = list().find((x) => x.id === S.cls);
			if (!C || !C.map) {
				wait("Карта этого класса пока не готова.");
				return;
			}
			S.C = C;
			S.L = C.map;
			if (!S.els.map || !S.els.map.isConnected) shell();
			const nb = S.built !== S.cls + "|" + ((S.c.tree && S.c.tree.v) || "");
			if (nb) build();
			head();
			layoutCam(nb);
			updNodes();
			hero();
			legend();
			side();
			if (S.ro) S.root.classList.add("ro");
		}

		const noHover = () => matchMedia("(hover: none)").matches;
		function cfPaint() {
			updNodes();
			if (S.sel) side();
		}
		function clearCf() {
			if (!S.cf) return;
			S.cf = null;
			clearTimeout(S.cfT);
			if (S.V) cfPaint();
		}
		function ask(key, show) {
			if (!noHover()) return true;
			if (S.cf && S.cf.k === key) {
				S.cf = null;
				clearTimeout(S.cfT);
				return true;
			}
			S.cf = { k: key };
			clearTimeout(S.cfT);
			S.cfT = setTimeout(clearCf, 3000);
			if (show) show();
			else hideTip();
			cfPaint();
			return false;
		}
		const cfKey = (t) => {
			const a = t.closest("[data-pl]"),
				b = t.closest("[data-pla]"),
				c = t.closest("[data-abopen]"),
				d = t.closest("[data-up]");
			return a
				? "pl:" + a.dataset.pl
				: b
					? "pla:" + b.dataset.pla
					: c
						? "abopen"
						: d
							? "up:" + d.dataset.up
							: "";
		};
		function plus(id) {
			const [, n] = nodeOf(id);
			if (!n || S.ro) return;
			const r = +S.V.st.n[id] || 0;
			if (!r) {
				if (!canOpen(id)) return;
				S.fresh = id;
				act({ op: "open", id }, () => {
					pop(id);
					return `«${n.name}» открыт`;
				});
				return;
			}
			if (r >= n.max || stop()) return;
			const c = stepCost(r);
			if (tokN() < c) {
				toast(`Не хватает: нужно ${c} ⟡, есть ${tokN()}`, true);
				return;
			}
			act({ op: "step", id }, () => {
				pop(id);
				return `«${n.name}» - ступень ${r + 1} за ${c} ⟡`;
			});
		}
		function abOpen(key) {
			if (!canOpen(key)) return;
			const x = abOf(key),
				k = key.split(":")[1];
			S.fresh = key;
			act({ op: "open", id: key }, (r) => {
				pop(key);
				return `«${x ? x.name : ""}» открыта${r.view && r.view.st.eq[k] === key ? " и стоит в гнезде" : " - перетащи в гнездо"}`;
			});
		}
		function eq(slot, id) {
			if (S.ro) return;
			const x = id ? abOf(id) : null;
			act(
				{ op: "eq", slot, id },
				id
					? `В гнезде «${slot === "ab" ? "Способность" : "Ульта"}» теперь «${x ? x.name : ""}»`
					: "Гнездо пусто",
			);
		}
		function selectCls(id) {
			if (id === S.cls || S.ro) return;
			S.cls = id;
			S.sel = null;
			S.pick = null;
			S.arm = 0;
			S.rename = -1;
			if (own) {
				ME.cls = id;
				try {
					localStorage.setItem("lgSkCls", id);
				} catch (e) {}
			}
			S.V = vc[id] || null;
			S.built = "";
			S.view.fit = true;
			if (S.V) draw();
			else {
				if (S.els.world) S.els.world.style.opacity = ".4";
			}
			load(!!S.V);
		}

		function wire() {
			const E = S.els,
				map = E.map;
			S.root.addEventListener(
				"click",
				(e) => {
					if (S.cf && S.cf.k !== cfKey(e.target)) clearCf();
				},
				true,
			);
			S.root.addEventListener("click", (e) => {
				const t = e.target;
				if (t.closest("[data-cl]")) {
					selectCls(t.closest("[data-cl]").dataset.cl);
					return;
				}
				if (t.closest("[data-rst]")) {
					const b = t.closest("[data-rst]");
					if (b.disabled || S.ro) return;
					if (!S.arm) {
						S.arm = 1;
						clearTimeout(S.armT);
						S.armT = setTimeout(() => {
							S.arm = 0;
							if (S.V) head();
						}, 3000);
						head();
						return;
					}
					S.arm = 0;
					clearTimeout(S.armT);
					act({ op: "reset" }, (r) =>
						r.tokens
							? `Навыки сброшены · вернулось ${r.tokens} ⟡`
							: "Очки навыков сброшены - открывай заново",
					);
					return;
				}
				if (t.closest("[data-sx]")) {
					S.sel = null;
					draw();
					return;
				}
				if (t.closest("[data-abopen]")) {
					if (!ask("abopen")) return;
					abOpen(S.sel.ab);
					S.sel = null;
					return;
				}
				if (t.closest("[data-abeq]")) {
					const k = S.sel.ab.split(":")[1];
					eq(k, S.sel.ab);
					return;
				}
				if (t.closest("[data-up]")) {
					const q = t.closest("[data-up]").dataset.up,
						[br, slot] = S.sel.ab.split(":"),
						x = abOf(S.sel.ab);
					if (!ask("up:" + q)) return;
					act(
						{ op: "abUp", br, slot, kind: q },
						(r) =>
							`«${x && x.names ? x.names[q] : q}» улучшено${r.price ? ` за ${r.price} ⟡` : ""}`,
					);
					return;
				}
			});
			map.addEventListener("click", (e) => {
				const t = e.target;
				if (S.drg.moved) return;
				if (t.closest(".skm-lgbtn")) {
					e.stopPropagation();
					const o = E.lg.hidden;
					if (own) ME.lg = o;
					else S.lgOpen = o;
					legend();
					return;
				}
				const z = t.closest("[data-z]");
				if (z) {
					const k = +z.dataset.z;
					if (!k) {
						S.view.fit = true;
						layoutCam(true);
					} else {
						zoomAt(k, map.clientWidth / 2, map.clientHeight / 2);
						apply();
					}
					return;
				}
				const p0 = t.closest("[data-pl]");
				if (p0) {
					e.stopPropagation();
					hideTip();
					if (
						!ask("pl:" + p0.dataset.pl, () => showTip(p0.closest("[data-n]")))
					)
						return;
					plus(p0.dataset.pl);
					return;
				}
				const pa = t.closest("[data-pla]");
				if (pa) {
					e.stopPropagation();
					hideTip();
					if (
						!ask("pla:" + pa.dataset.pla, () =>
							showTip(pa.closest("[data-ab]")),
						)
					)
						return;
					abOpen(pa.dataset.pla);
					return;
				}
				const ab = t.closest("[data-ab]");
				if (ab) {
					S.sel =
						S.sel && S.sel.ab === ab.dataset.ab ? null : { ab: ab.dataset.ab };
					hideTip();
					draw();
					return;
				}
				if (t.closest(".skm-hub")) {
					if (!clsQ()) return;
					S.sel = S.sel && S.sel.hub ? null : { hub: 1 };
					hideTip();
					draw();
					return;
				}
				const nd = t.closest("[data-n], [data-q], [data-tip]");
				if (
					nd &&
					matchMedia("(hover: none)").matches &&
					!t.closest(".skm-hero button, .skm-hero [data-st]")
				) {
					showTip(nd);
				}
				if (S.ro) return;
				const so = t.closest("[data-slot]");
				if (so) {
					S.pick = S.pick === so.dataset.slot ? null : so.dataset.slot;
					hero();
					return;
				}
				const op = t.closest("[data-eq]");
				if (op) {
					const id = op.dataset.eq,
						k = id ? id.split(":")[1] : op.dataset.slot2;
					S.pick = null;
					eq(k, id);
					return;
				}
				if (t.closest("[data-rn]")) {
					e.stopPropagation();
					S.rename = +t.closest("[data-rn]").dataset.rn;
					hero();
					return;
				}
				if (t.closest("[data-sv]")) {
					const i = S.V.st.si || 0;
					act(
						{ op: "setSave", i },
						`Сохранено в «${(S.V.st.s[i] || {}).nm || ""}»`,
					);
					return;
				}
				const st = t.closest("[data-st]");
				if (st && !t.closest(".rn")) {
					const i = +st.dataset.st;
					if (i === (S.V.st.si || 0)) return;
					const x = S.V.st.s[i] || {};
					act({ op: "setLoad", i }, () =>
						x.eq
							? `Включён набор «${x.nm}»`
							: `«${x.nm}» пуст - поставь навыки Арены в гнёзда и нажми «Сохранить»`,
					);
				}
			});
			map.addEventListener("keydown", (e) => {
				const st = e.target.closest && e.target.closest("[data-st]");
				if (
					st &&
					(e.key === "Enter" || e.key === " ") &&
					!e.target.closest(".rn")
				) {
					e.preventDefault();
					st.click();
				}
			});
			map.addEventListener(
				"wheel",
				(e) => {
					e.preventDefault();
					const r = map.getBoundingClientRect();
					zoomAt(
						e.deltaY < 0 ? 1.12 : 0.89,
						e.clientX - r.left,
						e.clientY - r.top,
					);
					apply();
				},
				{ passive: false },
			);
			map.addEventListener("pointerdown", (e) => {
				S.pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
				if (S.pts.size === 2) {
					const [a, b] = [...S.pts.values()];
					S.pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, s: S.view.s };
					if (S.ad) dropAd(null);
					S.drg.on = false;
					return;
				}
				if (e.button && e.pointerType === "mouse") return;
				const an = e.target.closest(".skm-ab.has");
				if (an && !S.ro && !e.target.closest("[data-pla]")) {
					const A = {
						key: an.dataset.ab,
						el: an,
						x0: e.clientX,
						y0: e.clientY,
						moved: false,
						g: null,
						wait: e.pointerType === "touch",
					};
					if (A.wait) {
						A.t = setTimeout(() => {
							A.wait = false;
							if (navigator.vibrate) navigator.vibrate(15);
							an.classList.add("lift");
						}, 300);
					}
					S.ad = A;
					S.drg = {
						on: false,
						moved: false,
						x0: e.clientX,
						y0: e.clientY,
						vx: S.view.x,
						vy: S.view.y,
					};
					return;
				}
				if (e.target.closest(".skm-zoom, .skm-hero, .skm-lgbtn, .skm-lg"))
					return;
				S.drg = {
					on: true,
					moved: false,
					x0: e.clientX,
					y0: e.clientY,
					vx: S.view.x,
					vy: S.view.y,
				};
			});
			map.addEventListener("pointermove", (e) => {
				if (S.pts.has(e.pointerId))
					S.pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
				if (S.pinch && S.pts.size === 2) {
					const [a, b] = [...S.pts.values()],
						r = map.getBoundingClientRect(),
						z =
							(S.pinch.s * Math.hypot(a.x - b.x, a.y - b.y)) /
							S.pinch.d /
							S.view.s;
					zoomAt(z, (a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top);
					S.drg.moved = true;
					apply();
					return;
				}
				const A = S.ad;
				if (A && A.wait) {
					if (Math.hypot(e.clientX - A.x0, e.clientY - A.y0) > 8) {
						clearTimeout(A.t);
						S.ad = null;
						S.drg.on = true;
					} else return;
				}
				if (S.ad) {
					if (e.pointerType === "mouse" && !(e.buttons & 1)) {
						dropAd(null);
						return;
					}
					const k = A.key.split(":")[1];
					if (!A.moved && Math.hypot(e.clientX - A.x0, e.clientY - A.y0) < 6)
						return;
					if (!A.moved) {
						A.moved = true;
						S.drg.moved = true;
						hideTip();
						S.clearPath();
						const x = abOf(A.key),
							bi = S.C.branches.findIndex((b) => b.id === A.key.split(":")[0]);
						A.g = document.createElement("div");
						A.g.className = "skm-ghost2";
						A.g.style.setProperty("--bc", bcOf(bi));
						A.g.innerHTML = `<span>${esc((x && x.icon) || "◆")}</span>`;
						document.body.append(A.g);
						S.root
							.querySelectorAll("[data-drop]")
							.forEach((d) =>
								d.classList.add(d.dataset.drop === k ? "want" : "no"),
							);
					}
					A.g.style.transform = `translate(${Math.round(e.clientX - 27)}px,${Math.round(e.clientY - 27)}px) rotate(45deg)`;
					const over = document.elementFromPoint(e.clientX, e.clientY),
						d = over && over.closest("[data-drop]");
					S.root
						.querySelectorAll("[data-drop]")
						.forEach((x2) =>
							x2.classList.toggle("hot", x2 === d && x2.dataset.drop === k),
						);
					return;
				}
				const D = S.drg;
				if (!D.on) return;
				if (e.pointerType === "mouse" && !(e.buttons & 1)) {
					endDrag();
					return;
				}
				const dx = e.clientX - D.x0,
					dy = e.clientY - D.y0;
				if (!D.moved && Math.hypot(dx, dy) < 5) return;
				if (!D.moved) {
					D.moved = true;
					map.classList.add("drag");
					hideTip();
				}
				S.view.x = D.vx + dx;
				S.view.y = D.vy + dy;
				S.view.fit = false;
				apply();
			});
			const up = (e) => {
				S.pts.delete(e.pointerId);
				if (S.pts.size < 2) S.pinch = null;
				const A = S.ad;
				if (A && A.wait) {
					clearTimeout(A.t);
					S.ad = null;
					return;
				}
				if (A) {
					dropAd(e);
					return;
				}
				endDrag();
			};
			map.addEventListener("pointerup", up);
			map.addEventListener("pointercancel", up);
		}
		function endDrag() {
			S.drg.on = false;
			S.els.map && S.els.map.classList.remove("drag");
			setTimeout(() => {
				S.drg.moved = false;
			}, 0);
		}
		function dropAd(e) {
			const A = S.ad;
			if (!A) return;
			S.ad = null;
			clearTimeout(A.t);
			if (A.el) A.el.classList.remove("lift");
			if (A.g) A.g.remove();
			S.root
				.querySelectorAll("[data-drop]")
				.forEach((x) => x.classList.remove("want", "no", "hot"));
			if (!A.moved) return;
			const over = e && document.elementFromPoint(e.clientX, e.clientY),
				d = over && over.closest("[data-drop]"),
				k = A.key.split(":")[1];
			if (d && d.dataset.drop === k && S.root.contains(d)) eq(k, A.key);
			else if (d)
				toast(
					k === "ab"
						? "Это способность - её место в гнезде «Способность»"
						: "Это ульта - её место в гнезде «Ульта»",
					true,
				);
			setTimeout(() => {
				S.drg.moved = false;
			}, 0);
		}
		function wireRename() {
			const r = S.els.stabs.querySelector(".rn");
			if (!r) return;
			const i = S.rename;
			const done = (ok) => {
				if (S.rename !== i) return;
				const v = r.value.trim();
				S.rename = -1;
				if (ok && v && v !== (S.V.st.s[i] || {}).nm)
					act({ op: "setName", i, name: v }, "Переименовано");
				else hero();
			};
			r.onkeydown = (e) => {
				e.stopPropagation();
				if (e.key === "Enter") done(true);
				if (e.key === "Escape") done(false);
			};
			r.onblur = () => done(true);
		}

		S.docClick = (e) => {
			if (!S.els.map) return;
			const t = e.target;
			if (!t.isConnected) return;
			if (S.cf && !S.root.contains(t)) clearCf();
			const lgOpen = !S.els.lg.hidden;
			if (lgOpen && !t.closest(".skm-lgbtn")) {
				if (own) ME.lg = false;
				else S.lgOpen = false;
				legend();
			}
			if (
				S.sel &&
				!t.closest(".skm-side, [data-ab], .skm-hub, .skm-cl, [data-rst]")
			) {
				S.sel = null;
				draw();
			}
			if (S.pick && !t.closest(".skm-sk")) {
				S.pick = null;
				hero();
			}
		};
		S.esc = () => {
			if (S.sel || S.pick || S.rename >= 0) {
				S.sel = null;
				S.pick = null;
				S.rename = -1;
				draw();
			} else if (S.els.lg && !S.els.lg.hidden) {
				if (own) ME.lg = false;
				else S.lgOpen = false;
				legend();
			}
		};
		S.upOut = (e) => {
			if (S.ad && !S.root.contains(e.target)) dropAd(e);
			if (S.drg.on && !(S.els.map && S.els.map.contains(e.target))) endDrag();
			S.pts.delete(e.pointerId);
			if (S.pts.size < 2) S.pinch = null;
		};
		S.resized = () => {
			if (!S.els.map || !S.V) return;
			layoutCam(false);
		};
		S.kill = () => {
			S.dead = true;
			LIVE.delete(S);
			if (S.ad) dropAd(null);
		};
		S.upd = (c) => {
			S.c = c;
			if (!S.ro && S.V && c.h && c.h.sk) {
				const key = `${c.h.sk.f}|${c.h.sk.ab ? c.h.sk.ab.n : ""}|${c.h.level}`,
					mine = vc[S.V.cur];
				const stale =
					mine &&
					((c.h.sk.f != null && +c.h.sk.f !== +mine.free) ||
						(c.h.sk.ab && +c.h.sk.ab.n !== +S.V.n) ||
						+c.h.level !== +S.V.lvl);
				if (
					stale &&
					S.nTry !== key &&
					!S.busy &&
					Date.now() - S.loadAt > 3000
				) {
					S.nTry = key;
					load(true);
				}
			}
			draw();
		};
		S.start = () => {
			if (S.ro) {
				const v = S.c.data && S.c.data.view;
				S.cls = v && v.cls;
				S.V = v || null;
				if (!S.V) {
					wait("Нет данных героя.");
					return;
				}
				draw();
				return;
			}
			const h = S.c.h || {},
				L0 = list();
			S.cls =
				own && ME.cls && L0.some((c) => c.id === ME.cls)
					? ME.cls
					: (h.sk && h.sk.c) || (L0[0] && L0[0].id);
			if (!L0.some((c) => c.id === S.cls)) S.cls = L0[0] && L0[0].id;
			S.V = vc[S.cls] || null;
			draw();
			load(!!S.V);
		};
		return S;
	}

	function html(h, X, o = {}) {
		const ro = !!o.readonly,
			id = ro ? "ro" + ++SEQ : "me";
		const tree = o.tree || (o.data && o.data.tree) || null;
		CFG.set(id, { h, X, tree, list: o.list || null, ro, data: o.data || null });
		return `<section class="skmw${ro ? " ro" : ""}" data-smid="${id}" aria-label="${ro ? "Навыки героя" : "Навыки"}"><p class="skm-wait">Загружаем карту навыков…</p></section>`;
	}
	function bind(el) {
		const roots =
			el && el.matches && el.matches(".skmw")
				? [el]
				: el
					? [...el.querySelectorAll(".skmw")]
					: [];
		if (!roots.length) return false;
		for (const r of roots) {
			const c = CFG.get(r.dataset.smid);
			if (!c) continue;
			let S = r.__sm;
			if (!S || S.dead) {
				S = r.__sm = mk(r, c);
				LIVE.add(S);
				S.start();
			} else S.upd(c);
			if (r.dataset.smid !== "me") CFG.delete(r.dataset.smid);
		}
		for (const S of [...LIVE]) if (!S.root.isConnected) S.kill();
		return true;
	}
	window.LGSkillMap = {
		html,
		bind,
		reset: () => {
			for (const k of Object.keys(ME.vc)) delete ME.vc[k];
			for (const S of [...LIVE]) S.kill();
		},
	};
})();
