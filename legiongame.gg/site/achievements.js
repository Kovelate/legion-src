(() => {
	let CAT = null,
		loading = false,
		failed = false;
	let sec = null,
		sel = null,
		flt = "all";
	try {
		flt = localStorage.getItem("lgAcF") || "all";
		sec = localStorage.getItem("lgAcS") || null;
	} catch {}
	const GLYPH =
		"ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ012345789Z:・=*+<>";
	const TIER = ["бронза", "серебро", "золото"],
		TROM = ["I", "II", "III"];
	const RAR = {
		О: "обычное",
		Н: "необычное",
		Р: "редкое",
		Э: "эпическое",
		Л: "легендарное",
		F: "скрытое",
		Z: "особое",
	};
	const RCOL = {
		О: "common",
		Н: "uncommon",
		Р: "rare",
		Э: "epic",
		Л: "legendary",
		F: "common",
		Z: "common",
	};

	const TREE = {
		hero: {
			rows: [
				{ n: ["ГП-01", "ГП-02#0", "ГП-02#1", "ГП-02#2"] },
				{ n: ["ГП-06", "ГП-08"] },
				{ at: 1, n: ["ГП-23"] },
				{ n: ["ГП-13#0", "ГП-13#1", "ГП-13#2"] },
				{ n: ["ГП-19#0", "ГП-19#1", "ГП-19#2"] },
				{ n: ["ГП-22"] },
			],
			e: [["ГП-06", "ГП-23"]],
		},
		gear: {
			rows: [
				{ n: ["СЛ-01", "СЛ-02", "СЛ-04"] },
				{ n: ["СЛ-11#0", "СЛ-11#1", "СЛ-11#2"] },
				{ n: ["ЗМ-09", "ЗМ-08#0", "ЗМ-08#1", "ЗМ-08#2"] },
				{ n: ["ЗМ-01", "ЗМ-02#0", "ЗМ-02#1", "ЗМ-02#2"] },
				{ at: 1, n: ["ЗМ-04"] },
			],
			e: [["ЗМ-01", "ЗМ-04"]],
		},
		fight: {
			rows: [
				{ n: ["ПБ-01", "ПБ-02#0", "ПБ-02#1", "ПБ-02#2"] },
				{ n: ["БО-03", "ПБ-03#0", "ПБ-03#1", "ПБ-03#2"] },
				{ n: ["БО-14#0", "БО-14#1", "БО-14#2"] },
				{ n: ["БО-16"] },
				{ n: ["КН-06#0", "КН-06#1", "КН-06#2"] },
			],
			e: [
				["ПБ-01", "БО-03"],
				["БО-14#0", "БО-16"],
			],
		},
		road: {
			rows: [
				{ n: ["ПБ-18#0", "ПБ-18#1", "ПБ-18#2"] },
				{ n: ["ЛС-19#0", "ЛС-19#1", "ЛС-19#2"] },
				{ n: ["ПБ-21#0", "ПБ-21#1", "ПБ-21#2"] },
				{ n: ["ПБ-22", "СП-08"], solo: true },
				{ n: ["ПБ-23#0", "ПБ-23#1", "СП-02"] },
				{ n: ["ПБ-24", "ПБ-20", "ДН-02"], solo: true },
			],
			e: [
				["ПБ-21#0", "ПБ-22"],
				["ПБ-21#0", "СП-08"],
				["ПБ-23#0", "ПБ-24"],
			],
		},
		fair: {
			rows: [
				{ n: ["ЯТ-06#0", "ЯТ-06#1", "ЯТ-06#2"] },
				{ n: ["ЯТ-07", "ЯТ-16"] },
				{ n: ["ЯТ-10", "ХР-05"], solo: true },
			],
			e: [["ЯТ-06#0", "ЯТ-07"]],
		},

		craft: {
			rows: [
				{ n: ["РМ-01", "РМ-02#0", "РМ-02#1", "РМ-02#2"] },
				{ n: ["РМ-05#0", "РМ-05#1", "РМ-05#2", "РМ-30"] },
				{ n: ["РМ-23#0", "РМ-23#1", "РМ-23#2", "РМ-23#3"] },
				{ n: ["РМ-03#0", "РМ-03#1", "РМ-03#2", "РМ-35"] },
				{ n: ["РМ-28#0", "РМ-28#1", "РМ-28#2", "РМ-29"], cut: [3] },
				{ n: ["РМ-24#0", "РМ-24#1", "РМ-24#2", "РМ-06"], cut: [3] },
				{ n: ["РМ-25#0", "РМ-25#1", "РМ-25#2", "РМ-34"], cut: [3] },
				{ n: ["РМ-07#0", "РМ-07#1", "РМ-07#2", "РМ-09"], cut: [3] },
				{ n: ["РМ-26#0", "РМ-26#1", "РМ-26#2", "РМ-10"], cut: [3] },
				{ n: ["РМ-08#0", "РМ-08#1", "РМ-08#2", "РМ-32"], cut: [3] },
				{ n: ["РМ-22#0", "РМ-22#1", "РМ-22#2"] },
				{ n: ["РМ-27#0", "РМ-27#1", "РМ-27#2"] },
				{ n: ["РМ-04#0", "РМ-04#1", "РМ-21#0", "РМ-21#1"], cut: [2] },
				{ n: ["РМ-31#0", "РМ-31#1", "РМ-33#0", "РМ-33#1"], cut: [2] },
			],
			e: [["РМ-22#0", "РМ-27#0"]],
		},
		soc: {
			rows: [
				{ n: ["СР-02#0", "СР-02#1", "СР-02#2"] },
				{ n: ["СР-03#0", "СР-03#1", "СР-03#2", "СР-04"] },
				{ at: 1, n: ["СР-05"] },
			],
			e: [
				["СР-03#2", "СР-04"],
				["СР-03#0", "СР-05"],
			],
		},
	};
	const CW = 72,
		RH = 80,
		M = 56;
	function scramble(seed, n) {
		let h = 2166136261;
		for (const c of String(seed)) {
			h ^= c.codePointAt(0);
			h = Math.imul(h, 16777619);
		}
		let s = "";
		for (let i = 0; i < n; i++) {
			h ^= h << 13;
			h ^= h >>> 17;
			h ^= h << 5;
			s += i && i % 7 === 0 ? " " : GLYPH[(h >>> 0) % GLYPH.length];
		}
		return s;
	}
	function load(X) {
		if (CAT || loading) return;
		loading = true;
		failed = false;
		X.api(window.LGBoot ? window.LGBoot.url("ach") : "/api/ach").then((r) => {
			loading = false;
			if (r && r.ok && Array.isArray(r.list)) CAT = r;
			else failed = true;
			X.rerender();
		});
	}
	const tiersOf = (d) => (Array.isArray(d.tiers) ? d.tiers.length : 1);
	const byId = () => Object.fromEntries((CAT.list || []).map((d) => [d.id, d]));
	const split = (k) => {
		const [id, t] = String(k).split("#");
		return [id, t == null ? 0 : +t];
	};

	function nodeOf(k, D, ac) {
		const [id, t] = split(k),
			d = D[id];
		if (!d) return null;
		const got = ((ac.g && ac.g[id]) || []).includes(t),
			lk = new Set(ac.lk || []);
		const H = d.hidden ? ac.h && ac.h[id] : null;
		const enc = !!(d.sys && lk.has(d.sys) && !got),
			hid = !!(d.hidden && !H);
		const steps = d.tiers || (d.need ? [d.need] : null),
			p = ac.p && ac.p[id] != null ? +ac.p[id] : null;
		return {
			k,
			id,
			t,
			d,
			got,
			enc,
			hid,
			H,
			name: H ? H.name : d.name,
			desc: H ? H.desc : d.desc,
			icon: H ? H.icon : d.icon,
			rar: d.rar[Math.min(t, d.rar.length - 1)],
			coins: (d.coins || [])[t] || 0,
			goal: steps ? steps[Math.min(t, steps.length - 1)] : null,
			p,
			tw: tiersOf(d) > 1 ? (d.tn ? d.tn[t] : TIER[t]) : "",
			at: got && ac.at && ac.at[id] ? ac.at[id][t] : 0,
		};
	}

	function layout(cat, D) {
		const T = TREE[cat] || { rows: [], e: [] },
			pos = {},
			edges = [];
		const rows = T.rows
			.map((r) => ({ ...r, n: r.n.filter((k) => D[split(k)[0]]) }))
			.filter((r) => r.n.length);

		const placed = new Set(rows.flatMap((r) => r.n.map((k) => split(k)[0])));
		for (const d of CAT.list)
			if (d.cat === cat && !placed.has(d.id))
				rows.push({
					n: tiersOf(d) > 1 ? d.tiers.map((_, i) => d.id + "#" + i) : [d.id],
				});
		let cols = 1;
		rows.forEach((r, y) =>
			r.n.forEach((k, i) => {
				const x = (r.at || 0) + i;
				pos[k] = { x, y };
				cols = Math.max(cols, x + 1);
				if (i && !r.solo && !(r.cut && r.cut.includes(i)))
					edges.push([r.n[i - 1], k]);
			}),
		);
		for (const [a, b] of T.e || []) if (pos[a] && pos[b]) edges.push([a, b]);
		return { pos, edges, cols, rows: rows.length };
	}
	const cx = (q) => q.x * CW + M / 2 + 4,
		cy = (q) => q.y * RH + M / 2 + 4;
	function medal(X, nd, state, dim) {
		const cls = `ac-m ${nd.got ? "got" : state}${nd.enc ? " enc" : ""}${nd.hid ? " hid" : ""}${dim ? " dim" : ""}${sel === nd.k ? " sel" : ""}`;
		const face = nd.enc
			? `<span class="ac-g" aria-hidden="true">${X.esc(scramble(nd.id, 3))}</span>`
			: nd.hid
				? '<span class="ac-q" aria-hidden="true">?</span>'
				: window.LGPickArt && window.LGPickArt.ach(nd.id, 34)
					? `<span class="ac-e" aria-hidden="true">${window.LGPickArt.ach(nd.id, 34)}</span>`
					: `<span class="ac-e" aria-hidden="true">${X.esc(nd.icon || "🏅")}</span>`;
		const tb =
			nd.tw && !nd.hid && !nd.enc
				? `<span class="ac-tb" aria-hidden="true">${TROM[nd.t] || ""}</span>`
				: "";
		const label = nd.enc
			? "Зашифровано — откроется позже"
			: nd.hid
				? "Скрытое достижение"
				: `${nd.name}${nd.tw ? " (" + nd.tw + ")" : ""}${nd.got ? " — открыто" : ""}`;
		const tip = nd.enc
			? `<b>${X.esc(scramble(nd.id, 10))}</b>Откроется позже`
			: nd.hid
				? "<b>???</b>Скрытое — откроется, когда случится"
				: `<b>${X.esc(nd.name)}${nd.tw ? " · " + X.esc(nd.tw) : ""}</b>${X.esc(nd.desc || "")}`;
		return `<button type="button" class="${cls}" data-r="${RCOL[nd.rar] || "common"}" data-ack="${X.esc(nd.k)}" aria-label="${X.esc(label)}" aria-pressed="${sel === nd.k}">${face}${tb}<span class="ac-tip" role="tooltip">${tip}</span></button>`;
	}
	function branch(X, cat, title, D, ac) {
		const L = layout(cat, D),
			W = L.cols * CW,
			Hh = L.rows * RH;
		const nodes = {};
		for (const k of Object.keys(L.pos)) nodes[k] = nodeOf(k, D, ac);

		const prev = {};
		for (const [a, b] of L.edges) (prev[b] || (prev[b] = [])).push(a);
		const state = (k) =>
			nodes[k].got
				? "got"
				: !prev[k] || prev[k].some((a) => nodes[a] && nodes[a].got)
					? "next"
					: "far";
		const pass = (k) => {
			const n = nodes[k];
			if (flt === "got") return n.got;
			if (flt === "prog")
				return (
					!n.got &&
					!n.enc &&
					!n.hid &&
					(n.p > 0 || (state(k) === "next" && (prev[k] || []).length > 0))
				);
			return true;
		};
		const lines = L.edges
			.map(([a, b]) => {
				const A = L.pos[a],
					B = L.pos[b],
					lit = nodes[a].got && nodes[b].got,
					half = nodes[a].got && !nodes[b].got;
				return `<line class="ac-l${lit ? " lit" : half ? " half" : ""}" data-e="${X.esc(a)}>${X.esc(b)}" x1="${cx(A)}" y1="${cy(A)}" x2="${cx(B)}" y2="${cy(B)}"/>`;
			})
			.join("");
		const items = Object.entries(L.pos)
			.map(
				([k, q]) =>
					`<div class="ac-n" style="left:${q.x * CW + 4}px;top:${q.y * RH + 4}px">${medal(X, nodes[k], state(k), !pass(k))}</div>`,
			)
			.join("");
		const got = Object.values(nodes).filter((n) => n.got).length,
			all = Object.keys(nodes).length;
		return `<section class="ac-br${sec === cat ? " on" : ""}" data-acsec="${X.esc(cat)}" aria-label="${X.esc(title)}">
      <header class="ac-bh"><h3>${X.esc(title)}</h3><span class="muted">${got} / ${all}</span></header>
      <div class="ac-sc"><div class="ac-tree" style="width:${W + 8}px;height:${Hh + 8}px"><svg class="ac-svg" width="${W + 8}" height="${Hh + 8}" aria-hidden="true">${lines}</svg>${items}</div></div></section>`;
	}
	function detail(X, ac) {
		if (!sel || !CAT)
			return '<p class="ac-dh muted">Выбери значок — здесь условие, прогресс и награда.</p>';
		const D = byId(),
			nd = nodeOf(sel, D, ac);
		if (!nd) return "";
		const close =
			'<button type="button" class="ac-x" data-acclose aria-label="Закрыть">×</button>';
		if (nd.enc)
			return `${close}<div class="ac-dt"><span class="ac-m enc big" aria-hidden="true"><span class="ac-g">${X.esc(scramble(nd.id, 3))}</span></span><div><h4 class="ac-enc-t">${X.esc(scramble(nd.id, 14))}</h4><p>Откроется позже · ${X.esc((CAT.sys && CAT.sys[nd.d.sys]) || "новая система")}</p></div></div>`;
		if (nd.hid)
			return `${close}<div class="ac-dt"><span class="ac-m hid big" aria-hidden="true"><span class="ac-q">?</span></span><div><h4>???</h4><p>Скрытое достижение — откроется, когда случится. Название и условие узнаешь, когда получишь.</p></div></div>`;
		const steps = nd.d.tiers || (nd.d.need ? [nd.d.need] : null);

		const unit = nd.d.unit ? " " + X.esc(nd.d.unit) : "";
		const prog =
			steps && nd.p != null && !nd.got
				? nd.p >= nd.goal
					? `<div class="ac-pr"><div class="bar"><i style="width:100%"></i></div><span>${nd.p}${unit} - выполнено, засчитается при следующей проверке</span></div>`
					: `<div class="ac-pr"><div class="bar"><i style="width:${Math.max(0, Math.min(100, (nd.p / nd.goal) * 100)).toFixed(1)}%"></i></div><span>${nd.p} / ${nd.goal}${unit}</span></div>`
				: "";
		const tiers = nd.tw
			? `<ol class="ac-ts">${nd.d.tiers.map((t, i) => `<li class="${((ac.g && ac.g[nd.id]) || []).includes(i) ? "on" : ""}${i === nd.t ? " cur" : ""}" data-r="${RCOL[nd.d.rar[i]] || "common"}">${X.esc(nd.d.tn ? nd.d.tn[i] : TIER[i])} · ${t}</li>`).join("")}</ol>`
			: "";
		const shown = (ac.sh || []).includes(nd.id);
		return `${close}<div class="ac-dt"><span class="ac-m big ${nd.got ? "got" : "next"}" data-r="${RCOL[nd.rar] || "common"}" aria-hidden="true"><span class="ac-e">${X.esc(nd.icon || "🏅")}</span></span>
      <div><h4>${X.esc(nd.name)}${nd.tw ? ` <em>${X.esc(nd.tw)}</em>` : ""}</h4><p class="ac-r" data-r="${RCOL[nd.rar] || "common"}">${RAR[nd.rar] || ""}</p></div></div>
      <p>${X.esc(nd.desc || "")}</p>${tiers}${prog}
      <dl class="ac-dl"><div><dt>Награда</dt><dd>${nd.coins > 0 ? `+${nd.coins} бронзы` : "без монет"}</dd></div><div><dt>Получено</dt><dd>${nd.got ? (nd.at ? new Date(nd.at).toLocaleDateString("ru-RU", { day: "numeric", month: "long" }) : "да") : "ещё нет"}</dd></div></dl>
      ${nd.got ? `<button type="button" class="btn sm ghost" data-acpin="${X.esc(nd.id)}" aria-pressed="${shown}">${shown ? "Убрать из витрины" : "В витрину (до 3)"}</button>` : ""}`;
	}
	function html(h, X) {
		const ac = h.ac;
		if (!ac) return '<p class="empty">Достижения пока закрыты</p>';
		load(X);
		if (!CAT)
			return `<p class="empty">${failed ? "Не удалось загрузить достижения — обнови страницу чуть позже." : "Открываю достижения…"}</p>`;
		const D = byId(),
			list = CAT.list || [],
			total = list.reduce((a, d) => a + tiersOf(d), 0);
		const cats = (CAT.cats || []).filter(([k]) =>
			list.some((d) => d.cat === k),
		);
		if (!sec || !cats.some(([k]) => k === sec))
			sec = cats[0] ? cats[0][0] : null;
		if (sel && !nodeOf(sel, D, ac)) sel = null;
		let coins = 0;
		for (const [id, ts] of Object.entries(ac.g || {}))
			for (const t of ts) coins += ((D[id] && D[id].coins) || [])[t] || 0;
		const per = cats.map(([k, title]) => {
			const ds = list.filter((d) => d.cat === k),
				all = ds.reduce((a, d) => a + tiersOf(d), 0),
				got = ds.reduce((a, d) => a + ((ac.g && ac.g[d.id]) || []).length, 0);
			return [k, title, got, all];
		});
		const sh = (ac.sh || []).map((id) => D[id]).filter(Boolean),
			tl = ac.tl || [];
		const icon = (d) =>
				d.hidden ? ((ac.h && ac.h[d.id]) || {}).icon || "?" : d.icon,
			nm = (d) =>
				d.hidden ? ((ac.h && ac.h[d.id]) || {}).name || "???" : d.name;
		return `<div class="ac2 f-${flt}">
      <header class="ac-sum">
        <div class="ac-tot"><b>${ac.n || 0}</b><span>из ${total} открыто</span><em>+${coins} бронзы</em></div>
        <div class="ac-secs" role="tablist" aria-label="Разделы">${per.map(([k, title, got, all]) => `<button type="button" role="tab" data-acs="${X.esc(k)}" aria-selected="${sec === k}"><span>${X.esc(title)}</span><i class="bar"><i style="width:${all ? ((got / all) * 100).toFixed(1) : 0}%"></i></i><em>${got}/${all}</em></button>`).join("")}</div>
        <div class="ac-tools">
          <div class="filters" role="group" aria-label="Что показать">${[
						["all", "Все"],
						["got", "Открытые"],
						["prog", "В процессе"],
					]
						.map(
							([k, l]) =>
								`<button type="button" data-acf="${k}" aria-pressed="${flt === k}">${l}</button>`,
						)
						.join("")}</div>
          <div class="ac-sh" aria-label="Витрина">${[0, 1, 2].map((i) => (sh[i] ? `<span class="ac-sb" title="${X.esc(nm(sh[i]))}">${X.esc(icon(sh[i]))}</span>` : '<span class="ac-sb empty" aria-hidden="true"></span>')).join("")}</div>
          ${tl.length ? `<label class="ac-tt"><span class="muted">Титул</span><select data-actitle><option value="">—</option>${tl.map((t) => `<option${ac.t === t ? " selected" : ""}>${X.esc(t)}</option>`).join("")}</select></label>` : ""}
        </div>
        <p class="ac-note muted">Счёт — с ${ac.since ? new Date(ac.since).toLocaleDateString("ru-RU", { day: "numeric", month: "long" }) : "открытия"}: прошлое не засчитывается.</p>
      </header>
      <div class="ac-body"><div class="ac-brs">${cats.map(([k, title]) => branch(X, k, title, D, ac)).join("")}</div>
        <aside class="ac-det${sel ? " open" : ""}" aria-label="Достижение" aria-live="polite">${detail(X, ac)}</aside></div>
    </div>`;
	}
	function bind(el, X, h) {
		const ac = h && h.ac;
		if (!ac) return;
		const root = el.querySelector(".ac2");
		if (!root) return;
		const det = root.querySelector(".ac-det");
		const pick = (k) => {
			sel = k;
			root.querySelectorAll("[data-ack]").forEach((b) => {
				const on = b.dataset.ack === k;
				b.classList.toggle("sel", on);
				b.setAttribute("aria-pressed", String(on));
			});
			det.innerHTML = detail(X, ac);
			det.classList.toggle("open", !!k);
			bindDet();
		};
		function bindDet() {
			const c = det.querySelector("[data-acclose]");
			if (c) c.onclick = () => pick(null);
			const p = det.querySelector("[data-acpin]");
			if (p)
				p.onclick = () => {
					const id = p.dataset.acpin,
						cur = (ac.sh || []).slice(),
						i = cur.indexOf(id);
					if (i >= 0) cur.splice(i, 1);
					else {
						if (cur.length >= 3) cur.shift();
						cur.push(id);
					}
					X.act("/api/achPick", { show: cur }, "Витрина обновлена", p);
				};
		}
		root
			.querySelectorAll("[data-ack]")
			.forEach(
				(b) =>
					(b.onclick = () =>
						pick(sel === b.dataset.ack ? null : b.dataset.ack)),
			);
		root.querySelectorAll("[data-acs]").forEach(
			(b) =>
				(b.onclick = () => {
					sec = b.dataset.acs;
					try {
						localStorage.setItem("lgAcS", sec);
					} catch {}
					root
						.querySelectorAll("[data-acs]")
						.forEach((x) => x.setAttribute("aria-selected", String(x === b)));
					root
						.querySelectorAll("[data-acsec]")
						.forEach((x) => x.classList.toggle("on", x.dataset.acsec === sec));
					const br = root.querySelector(`[data-acsec="${CSS.escape(sec)}"]`);
					if (br && window.LGSiteUi.is("(min-width: 900px)"))
						br.scrollIntoView({ behavior: "smooth", block: "nearest" });
				}),
		);
		root.querySelectorAll("[data-acf]").forEach(
			(b) =>
				(b.onclick = () => {
					flt = b.dataset.acf;
					try {
						localStorage.setItem("lgAcF", flt);
					} catch {}
					X.rerender();
				}),
		);
		const s = root.querySelector("[data-actitle]");
		if (s)
			s.onchange = () =>
				X.act(
					"/api/achPick",
					{ title: s.value || null },
					s.value ? `Титул: «${s.value}»` : "Титул снят",
				);
		root.onkeydown = (e) => {
			if (e.key === "Escape" && sel) pick(null);
		};
		bindDet();
	}

	function plate(h, X) {
		const ac = h && h.ac;
		if (!ac) return "";
		const sh = (ac.sh || [])
			.map((id) => {
				const d = CAT && CAT.list.find((x) => x.id === id);
				const H = ac.h && ac.h[id];
				return d
					? {
							icon: d.hidden ? (H && H.icon) || "?" : d.icon,
							name: d.hidden ? (H && H.name) || "???" : d.name,
						}
					: null;
			})
			.filter(Boolean);
		if (!CAT && (ac.sh || []).length) load(X);
		return `${ac.t ? `<div class="ac-ttl">«${X.esc(ac.t)}»</div>` : ""}${sh.length ? `<div class="ac-pl" aria-label="Витрина достижений">${sh.map((x) => `<span title="${X.esc(x.name)}">${X.esc(x.icon)}</span>`).join("")}</div>` : ""}`;
	}

	const W2 = (() => {
		const RC = {
			О: "#c9c1b2",
			Н: "#7ad36b",
			Р: "#62aefc",
			Э: "#c08bff",
			Л: "#ffad45",
			F: "#d98a7a",
			Z: "#e8d27a",
		};
		const TC = ["#d08a4a", "#c3ccd6", "#f5c93c", "#7fe3e0"];
		const TNAME = ["Бронза", "Серебро", "Золото", "Алмаз"],
			TR = ["I", "II", "III", "IV"];
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
		const Q = {
			p: "(max-width: 640px)",
			l: "(max-height: 460px) and (min-width: 641px)",
		};
		const mq = (q) => {
			try {
				return !!(window.matchMedia && window.matchMedia(q).matches);
			} catch (e) {
				return false;
			}
		};
		const fmt = (n) => Number(n || 0).toLocaleString("ru-RU");
		const dt = (t) => {
			if (!t) return "";
			try {
				return new Date(+t)
					.toLocaleDateString("ru-RU", { day: "numeric", month: "short" })
					.replace(".", "");
			} catch (e) {
				return "";
			}
		};
		let tmenu = false,
			cur = null;
		let wired = false;

		function model(ac) {
			const D = byId(),
				list = CAT.list || [];
			const G = ac.g || {},
				P = ac.p || {},
				AT = ac.at || {},
				LK = ac.lk || [],
				HH = ac.h || {};
			const nT = (d) => (Array.isArray(d.tiers) ? d.tiers.length : 1);
			const has = (id, t) => (G[id] || []).includes(t);
			const rarAt = (d, i) =>
				(d.rar || ["О"])[Math.min(i, (d.rar || ["О"]).length - 1)];
			const titleAt = (d, i) =>
				(Array.isArray(d.title)
					? d.title[Math.min(i, d.title.length - 1)]
					: d.title) || "";
			const goal = (d, t) => (d.tiers ? d.tiers[t] : d.need || 0);
			const lastAt = (d) =>
				Math.max(0, ...Object.values(AT[d.id] || {}).map(Number));
			const now = Date.now(),
				isNew = (id, t) => {
					const a = +((AT[id] || {})[t] || 0);
					return a > 0 && now - a < 864e5;
				};
			const enc = (d) => !!(d.sys && LK.includes(d.sys));

			const info = (d) => {
				const H = d.hidden ? HH[d.id] : null;
				return d.hidden
					? {
							name: H ? H.name : "",
							desc: H ? H.desc : "",
							icon: H ? H.icon || "🏅" : "?",
						}
					: { name: d.name, desc: d.desc, icon: d.icon || "🏅" };
			};
			const fmtGoal = (d, t) => (d.tn ? d.tn[t] : fmt(goal(d, t)));
			const cats = (CAT.cats || []).filter(([k]) =>
				list.some((d) => d.cat === k),
			);
			return {
				D,
				list,
				G,
				P,
				AT,
				LK,
				nT,
				has,
				rarAt,
				titleAt,
				goal,
				lastAt,
				isNew,
				enc,
				info,
				fmtGoal,
				cats,
				CATN: Object.fromEntries(CAT.cats || []),
				SYSN: CAT.sys || {},
				RN: CAT.rarNames || RAR,
			};
		}

		function lay(M, cat) {
			const T = TREE[cat] || { rows: [], e: [] };
			const rows = T.rows
				.map((r) => ({ ...r, n: r.n.filter((k) => M.D[split(k)[0]]) }))
				.filter((r) => r.n.length);
			const placed = new Set(rows.flatMap((r) => r.n.map((k) => split(k)[0])));
			for (const d of M.list)
				if (d.cat === cat && !placed.has(d.id))
					rows.push({
						n: M.nT(d) > 1 ? d.tiers.map((_, i) => d.id + "#" + i) : [d.id],
					});
			const pos = {},
				segs = [],
				links = [];
			let cols = 1;
			rows.forEach((r, y) =>
				r.n.forEach((k, i) => {
					const x = (r.at || 0) + i;
					pos[k] = { x, y };
					cols = Math.max(cols, x + 1);
					if (i && !r.solo && !(r.cut && r.cut.includes(i)))
						segs.push([r.n[i - 1], k]);
				}),
			);
			for (const [a, b] of T.e || []) if (pos[a] && pos[b]) links.push([a, b]);
			return { rows, pos, segs, links, cols };
		}

		function stOf(M, k, prev) {
			const [id, t] = split(k),
				d = M.D[id];
			if (M.has(id, t)) return "got";
			if (M.enc(d)) return "enc";
			if (d.hidden) return "hid";
			return !prev[k] ||
				prev[k].some((a) => {
					const [pi, pt] = split(a);
					return M.has(pi, pt);
				})
				? "next"
				: "far";
		}

		function fill(M, a, b) {
			const [ia, ta] = split(a),
				[ib, tb] = split(b),
				db = M.D[ib];
			if (!M.has(ia, ta)) return 0;
			if (M.has(ib, tb)) return 1;
			const p = +M.P[ib] || 0,
				g = M.goal(db, tb);
			if (!g) return 0;
			const lo = ia === ib ? M.goal(db, ta) : 0;
			return Math.max(0, Math.min(1, (p - lo) / Math.max(1, g - lo)));
		}

		let bw = 0;
		function geo(cols) {
			const B = mq(Q.p)
				? { cw: 92, m: 46, lab: 30, rh: 112, min: 62 }
				: mq(Q.l)
					? { cw: 96, m: 44, lab: 30, rh: 114, min: 70 }
					: { cw: 128, m: 56, lab: 34, rh: 128, min: 92 };
			const cw =
				bw > 0
					? Math.max(
							B.min,
							Math.min(B.cw, Math.floor(bw / Math.max(1, cols || 4))),
						)
					: B.cw;
			return { cw, m: Math.min(B.m, cw - 20), lab: B.lab, rh: B.rh };
		}
		function medal(M, X, k, st) {
			const [id, t] = split(k),
				d = M.D[id],
				n = M.nT(d),
				r = st === "hid" || st === "enc" ? "F" : M.rarAt(d, t),
				I = M.info(d);
			let art = "";
			try {
				art =
					st !== "hid" && st !== "enc" && window.LGPickArt
						? window.LGPickArt.ach(id, 30) || ""
						: "";
			} catch (e) {
				art = "";
			}
			let face = art
					? `<span class="aw-e aw-art">${art}</span>`
					: `<span class="aw-e">${X.esc(I.icon)}</span>`,
				badge = "";
			if (st === "hid" || (d.hidden && st !== "got")) face = "?";
			else if (st === "enc") face = X.esc(scramble(id, 3));
			else if (n > 1)
				badge = `<b class="aw-tr" style="--tc:${TC[t] || TC[0]}">${TR[t] || t + 1}</b>`;
			else if (st === "got") badge = '<b class="aw-ok">✓</b>';
			return `<span class="aw-md" style="--rc:${RC[r] || RC["О"]}" aria-hidden="true">${face}${badge}</span>`;
		}

		function branch(M, X) {
			const L = lay(M, sec),
				G = geo(L.cols),
				W = L.cols * G.cw,
				H = L.rows.length * G.rh;
			const prev = {};
			L.segs
				.concat(L.links)
				.forEach(([a, b]) => (prev[b] || (prev[b] = [])).push(a));
			const st = {};
			Object.keys(L.pos).forEach((k) => {
				st[k] = stOf(M, k, prev);
			});
			const cx = (q) => q.x * G.cw + G.cw / 2,
				cy = (q) => q.y * G.rh + G.lab + 6 + G.m / 2;
			const pass = (k) => {
				const [id] = split(k),
					d = M.D[id];
				if (flt === "got") return st[k] === "got";
				if (flt === "prog")
					return (
						st[k] === "next" &&
						!d.hidden &&
						((+M.P[id] || 0) > 0 || (prev[k] || []).length > 0)
					);
				return true;
			};
			let svg = "";
			L.segs.forEach(([a, b]) => {
				const A = L.pos[a],
					B = L.pos[b],
					x1 = cx(A) + G.m / 2,
					x2 = cx(B) - G.m / 2,
					y = cy(A),
					f = fill(M, a, b);
				svg += `<line class="aw-seg" x1="${x1}" y1="${y}" x2="${x2}" y2="${y}"/>${f ? `<line class="aw-segf" data-e="${X.esc(a)}>${X.esc(b)}" x1="${x1}" y1="${y}" x2="${(x1 + (x2 - x1) * f).toFixed(1)}" y2="${y}"/>` : ""}`;
			});
			L.links.forEach(([a, b]) => {
				const A = L.pos[a],
					B = L.pos[b],
					on = st[a] === "got" && st[b] === "got";
				const p =
					A.x === B.x
						? `M${cx(A)} ${cy(A) + G.m / 2 + 20} V${cy(B) - G.m / 2 - 4}`
						: `M${cx(A)} ${cy(A) + G.m / 2 + 20} V${cy(B)} H${cx(B) - G.m / 2 - 4}`;
				svg += `<path class="aw-lnk${on ? " on" : ""}" data-e="${X.esc(a)}>${X.esc(b)}" d="${p}"/>`;
			});

			let lbl = "";
			L.rows.forEach((r, y) => {
				let i = 0;
				while (i < r.n.length) {
					const [id] = split(r.n[i]);
					let j = i;
					while (j + 1 < r.n.length && split(r.n[j + 1])[0] === id) j++;
					const q = L.pos[r.n[i]],
						d = M.D[id],
						s0 = st[r.n[i]],
						I = M.info(d);
					const name =
						s0 === "enc"
							? scramble(id, 9)
							: d.hidden && !I.name
								? "Скрытое"
								: I.name;
					const dim = !r.n.slice(i, j + 1).some(pass);
					lbl += `<div class="aw-lbl${s0 === "enc" ? " cph" : ""}${dim ? " dim" : ""}" style="left:${q.x * G.cw}px;top:${y * G.rh}px;width:${(j - i + 1) * G.cw}px;height:${G.lab}px"><span>${X.esc(name)}</span></div>`;
					i = j + 1;
				}
			});

			const nodes = Object.entries(L.pos)
				.map(([k, q]) => {
					const [id, t] = split(k),
						d = M.D[id],
						s = st[k],
						n = M.nT(d),
						I = M.info(d);
					let th = "";
					if (s === "got")
						th = `<span class="aw-th got">${n > 1 ? "✓ " + X.esc(M.fmtGoal(d, t)) : X.esc(dt((M.AT[id] || {})[t]))}</span>`;
					else if (s !== "hid" && s !== "enc" && M.goal(d, t)) {
						const isCur =
							(M.G[id] || []).length === t &&
							(s === "next" || (+M.P[id] || 0) > 0);
						th =
							isCur && !d.tn
								? `<span class="aw-th cur">${fmt(Math.min(+M.P[id] || 0, M.goal(d, t)))} / ${fmt(M.goal(d, t))}</span>`
								: `<span class="aw-th">${X.esc(M.fmtGoal(d, t))}</span>`;
					}
					const nm =
						s === "enc"
							? "Зашифровано - откроется позже"
							: s === "hid"
								? "Скрытое достижение"
								: `${I.name}${n > 1 ? " - " + (TNAME[t] || "") : ""}${s === "got" ? " - открыто" : ""}`;
					return `<button type="button" class="aw-nd st-${s}${sel === k ? " sel" : ""}${pass(k) ? "" : " dim"}" data-awk="${X.esc(k)}" aria-label="${X.esc(nm)}" aria-pressed="${sel === k}" style="left:${cx(q) - G.cw / 2}px;top:${q.y * G.rh + G.lab + 6}px;width:${G.cw}px">${M.isNew(id, t) ? '<span class="aw-new">новое</span>' : ""}${medal(M, X, k, s)}${th}</button>`;
				})
				.join("");
			const got = Object.keys(st).filter((k) => st[k] === "got").length;
			return `<div class="aw-bh"><h3>${X.esc(M.CATN[sec] || "")}</h3><span>${got} / ${Object.keys(st).length}</span></div>
        <div class="aw-tree" style="width:${W}px;height:${H}px;--m:${G.m}px"><svg width="${W}" height="${H}" aria-hidden="true">${svg}</svg>${lbl}${nodes}</div>`;
		}

		function sumBlocks(M, X, ac) {
			const total = M.list.reduce((a, d) => a + M.nT(d), 0),
				gotN = M.list.reduce((a, d) => a + (M.G[d.id] || []).length, 0);
			let coins = 0;
			M.list.forEach((d) =>
				(M.G[d.id] || []).forEach((t) => {
					coins += (d.coins || [])[t] || 0;
				}),
			);
			const sh = ac.sh || [],
				tl = ac.tl || [];
			const slots = [0, 1, 2]
				.map((i) => {
					const id = sh[i],
						d = id && M.D[id];
					if (!d)
						return '<button type="button" class="aw-sl empty" data-awpickshow title="Пустое место витрины" aria-label="Пустое место витрины">+</button>';
					const I = M.info(d);
					return `<button type="button" class="aw-sl" data-awgo="${X.esc(d.id)}" style="--rc:${RC[M.rarAt(d, Math.max(0, (M.G[d.id] || [1]).length - 1))] || RC["О"]}" title="${X.esc(I.name)}" aria-label="Витрина: ${X.esc(I.name)}">${X.esc(I.icon)}</button>`;
				})
				.join("");
			return {
				tot: `<div class="aw-tot"><b>${gotN}</b><span>из ${total} открыто</span><em>+${fmt(coins)} бронзы</em></div>`,
				fl: `<div class="aw-fl" role="group" aria-label="Что показать">${[
					["all", "Все"],
					["got", "Открытые"],
					["prog", "В процессе"],
				]
					.map(
						([k, n]) =>
							`<button type="button" data-awf="${k}" aria-pressed="${k === flt}">${n}</button>`,
					)
					.join("")}</div>`,
				shw: `<div class="aw-shw" aria-label="Витрина"><small>Витрина</small>${slots}</div>`,
				ttl: `<div class="aw-ttl"><small>Титул</small><button type="button" class="aw-tb" data-awtmenu aria-haspopup="menu" aria-expanded="${tmenu}"${tl.length ? "" : " disabled"}><b>${ac.t ? X.esc(ac.t) : tl.length ? "Без титула" : "Титулов пока нет"}</b><span class="aw-ch" aria-hidden="true">▾</span></button>
          ${tmenu && tl.length ? `<div class="aw-tmenu" role="menu"><button type="button" role="menuitemradio" aria-checked="${!ac.t}" data-awtpick="">Без титула</button>${tl.map((t) => `<button type="button" role="menuitemradio" aria-checked="${ac.t === t}" data-awtpick="${X.esc(t)}">${X.esc(t)}</button>`).join("")}</div>` : ""}</div>`,
			};
		}
		function detail(M, X, ac) {
			const S = sumBlocks(M, X, ac),
				sumt = `<div class="aw-sumt">${S.tot}${S.ttl}${S.shw}${S.fl}</div>`;
			const x =
				'<button type="button" class="aw-x2" data-awclose aria-label="Закрыть">×</button>';
			if (!sel) {
				const near = M.list
					.filter(
						(d) =>
							!M.enc(d) &&
							!d.hidden &&
							M.goal(d, (M.G[d.id] || []).length) &&
							(M.G[d.id] || []).length < M.nT(d),
					)
					.map((d) => {
						const t = (M.G[d.id] || []).length,
							lo = t && d.tiers ? d.tiers[t - 1] : 0,
							g = M.goal(d, t);
						return {
							d,
							t,
							g,
							f: ((+M.P[d.id] || 0) - lo) / Math.max(1, g - lo),
						};
					})
					.filter((q) => q.f > 0 && q.f < 1)
					.sort((a, b) => b.f - a.f)
					.slice(0, 4);
				const rec = M.list
					.filter((d) => (M.G[d.id] || []).length)
					.sort((a, b) => M.lastAt(b) - M.lastAt(a))
					.slice(0, 3);
				const key = (d, t) => (M.nT(d) > 1 ? d.id + "#" + t : d.id);
				return `${sumt}<h5>Ближе всего</h5>${near.length ? `<div class="aw-rec">${near.map((q) => `<button type="button" class="st-next" data-awgo="${X.esc(q.d.id)}" data-awt="${q.t}">${medal(M, X, key(q.d, q.t), "next")}<span class="aw-q"><b>${X.esc(q.d.name)}</b><span>${fmt(+M.P[q.d.id] || 0)} / ${fmt(q.g)} ${X.esc(q.d.unit || "")}</span><span class="aw-bar"><i style="width:${Math.round(Math.max(0, q.f) * 100)}%"></i></span></span></button>`).join("")}</div>` : '<p class="aw-note">Начни любую цепочку - здесь появится, что ближе всего.</p>'}
          <h5>Недавно получены</h5>${
						rec.length
							? `<div class="aw-rec">${rec
									.map((d) => {
										const t = (M.G[d.id] || []).length - 1,
											I = M.info(d);
										return `<button type="button" class="st-got" data-awgo="${X.esc(d.id)}" data-awt="${t}">${medal(M, X, key(d, t), "got")}<span class="aw-q"><b>${X.esc(I.name)}</b><span>${X.esc(dt(M.lastAt(d)))}</span></span></button>`;
									})
									.join("")}</div>`
							: '<p class="aw-note">Пока ничего - первое достижение появится здесь.</p>'
					}
          <h5>Цвет кольца - редкость</h5><div class="aw-leg">${["О", "Н", "Р", "Э", "Л", "F"].map((r) => `<span><i style="--rc:${RC[r]}"></i>${X.esc(M.RN[r] || RAR[r])}</span>`).join("")}</div>`;
			}
			const [id, t] = split(sel),
				d = M.D[id],
				k = (M.G[id] || []).length,
				n = M.nT(d),
				I = M.info(d);
			const st = M.has(id, t)
				? "got"
				: M.enc(d)
					? "enc"
					: d.hidden
						? "hid"
						: "next";
			if (st === "enc")
				return `${x}<div class="aw-dh st-enc">${medal(M, X, sel, "enc")}<div><h4 class="aw-cphh">${X.esc(scramble(id, 12))}</h4><div class="aw-sub">${X.esc(M.CATN[d.cat] || "")}</div></div></div><p class="aw-dsc">Зашифровано. Откроется вместе с системой «${X.esc(M.SYSN[d.sys] || "новая система")}».</p>`;
			if (st === "hid")
				return `${x}<div class="aw-dh st-hid">${medal(M, X, sel, "hid")}<div><h4>Скрытое достижение</h4><div class="aw-sub">${X.esc(M.CATN[d.cat] || "")}</div></div></div><p class="aw-dsc">Откроется, когда случится. Название и условие узнаешь, когда получишь.</p><div class="aw-vt"><div class="aw-vs"><span class="aw-tp"></span><span class="aw-tn">Награда</span><span class="aw-sst"></span><span class="aw-rw"><span class="aw-chip" style="--rc:${RC.F}">${X.esc(M.RN.F || "скрытое")}</span>${(d.coins || [])[0] ? `<span class="aw-coin">${fmt(d.coins[0])}</span>` : "<span>без монет</span>"}</span></div></div>`;

			let pb = "";
			if (k < n && M.goal(d, k) && M.P[id] != null) {
				const g = M.goal(d, k),
					p = +M.P[id] || 0,
					u = d.unit ? " " + X.esc(d.unit) : "";
				pb =
					p >= g
						? `<div class="aw-pbx"><div class="aw-bar"><i style="width:100%"></i></div><div class="aw-row"><span>${fmt(p)}${u} - выполнено, засчитается при следующей проверке</span></div></div>`
						: `<div class="aw-pbx"><div class="aw-row"><span>${n > 1 ? `До ступени «${TNAME[k] || ""}»` : "Прогресс"}</span><b>${fmt(p)} / ${fmt(g)}${u}</b></div><div class="aw-bar"><i style="width:${Math.max(0, Math.min(100, Math.round((p / g) * 100)))}%"></i></div></div>`;
			}
			const steps = Array.from({ length: n }, (_, i) => {
				const g = M.has(id, i),
					tt = M.titleAt(d, i),
					at = (M.AT[id] || {})[i],
					r = M.rarAt(d, i);
				return `<div class="aw-vs${g ? " got" : ""}${i === k ? " cur" : ""}"><span class="aw-tp" style="--tc:${n > 1 ? TC[i] || TC[0] : RC[r]}">${n > 1 ? TR[i] || i + 1 : g ? "✓" : ""}</span><span class="aw-tn">${n > 1 ? `${TNAME[i] || ""} <span>· ${X.esc(d.tn ? d.tn[i] : fmt(d.tiers[i]) + (d.unit ? " " + d.unit : ""))}</span>` : "Награда"}</span><span class="aw-sst">${g ? "✓ " + X.esc(dt(at)) : i === k ? "цель" : ""}</span>
          <span class="aw-rw"><span class="aw-chip" style="--rc:${RC[r] || RC["О"]}">${X.esc(M.RN[r] || RAR[r] || "")}</span>${(d.coins || [])[i] ? `<span class="aw-coin">${fmt(d.coins[i])}</span>` : "<span>без монет</span>"}${tt ? `<span class="aw-tag">титул «${X.esc(tt)}»</span>` : ""}</span></div>`;
			}).join("");
			const sh = ac.sh || [],
				inSh = sh.includes(id),
				myT = Array.from({ length: n }, (_, i) =>
					M.has(id, i) ? M.titleAt(d, i) : "",
				).filter(Boolean),
				tt = myT[myT.length - 1];
			let acts = "";
			if (k) {
				acts += inSh
					? `<button type="button" class="aw-btn ghost" data-awunshow="${X.esc(id)}">Убрать из витрины</button>`
					: `<button type="button" class="aw-btn" data-awshow="${X.esc(id)}">В витрину</button>`;
				if (!inSh && sh.length >= 3)
					acts += '<p class="aw-note">В витрине уже 3 - первое уйдёт.</p>';
				if (tt && (ac.tl || []).includes(tt))
					acts +=
						ac.t === tt
							? `<p class="aw-note">Титул «${X.esc(tt)}» - носишь сейчас.</p>`
							: `<button type="button" class="aw-btn ghost" data-awtitle="${X.esc(tt)}">Носить титул «${X.esc(tt)}»</button>`;
			} else
				acts =
					'<p class="aw-note">Получи первую ступень - и сможешь поставить в витрину.</p>';
			return `${x}<div class="aw-dh st-${st}">${medal(M, X, sel, st)}<div><h4>${X.esc(I.name)}</h4><div class="aw-sub">${X.esc(M.CATN[d.cat] || "")}${d.sys ? " · " + X.esc(M.SYSN[d.sys] || "") : ""}</div></div></div>
        <p class="aw-dsc">${X.esc(I.desc || "")}</p>${pb}<div class="aw-vt">${steps}</div><div class="aw-acts">${acts}</div>`;
		}

		function html(h, X) {
			const ac = h.ac;
			load(X);
			if (!CAT)
				return `<div class="acw gw-dk acw-wait" data-gst="${gst()}"><p>${failed ? "Не удалось загрузить достижения - обнови страницу чуть позже." : "Открываю достижения…"}</p></div>`;
			const M = model(ac);
			if (!sec || !M.cats.some(([k]) => k === sec))
				sec = M.cats[0] ? M.cats[0][0] : null;
			if (!["all", "got", "prog"].includes(flt)) flt = "all";
			if (sel && !M.D[split(sel)[0]]) sel = null;
			const S = sumBlocks(M, X, ac);
			const secs = M.cats
				.map(([k, nm]) => {
					const ds = M.list.filter((d) => d.cat === k),
						all = ds.reduce((a, d) => a + M.nT(d), 0),
						got = ds.reduce((a, d) => a + (M.G[d.id] || []).length, 0),
						nw = ds.some((d) =>
							(M.G[d.id] || []).some((t) => M.isNew(d.id, t)),
						);
					return `<button type="button" class="aw-sc" data-awsec="${X.esc(k)}" aria-pressed="${k === sec}"><span class="aw-r1"><b>${X.esc(nm)}</b>${nw ? '<span class="aw-dotn">новое</span>' : ""}<span class="aw-n">${got}/${all}</span></span><span class="aw-bar"><i style="width:${all ? Math.round((got / all) * 100) : 0}%"></i></span></button>`;
				})
				.join("");
			const since = ac.since
				? new Date(ac.since).toLocaleDateString("ru-RU", {
						day: "numeric",
						month: "long",
					})
				: "открытия";
			return `<div class="acw gw-dk" data-gst="${gst()}" role="region" aria-label="Достижения">
        <div class="aw-sum">${S.tot}<span class="aw-sp"></span>${S.shw}${S.ttl}${S.fl}</div>
        <div class="aw-main"><nav class="aw-secs" aria-label="Разделы">${secs}<p class="aw-since">Счёт - с ${X.esc(since)}: прошлое не засчитывается.</p></nav>
          <div class="aw-brw">${sec ? branch(M, X) : ""}</div>
          <aside class="aw-aside${sel ? " open" : ""}" aria-label="Достижение" aria-live="polite">${detail(M, X, ac)}</aside></div>
        <div class="aw-shade${sel ? " on" : ""}" data-awclose></div>
      </div>`;
		}

		function paint() {
			if (!cur || !cur.el) return;
			const old = cur.el.querySelector(".acw");
			if (!old || !old.isConnected) return;
			const B = old.querySelector(".aw-brw"),
				SC = old.querySelector(".aw-secs"),
				A = old.querySelector(".aw-aside");

			const ae = document.activeElement,
				fk =
					ae && old.contains(ae)
						? [...ae.attributes].find((a) => /^data-aw/.test(a.name))
						: null;
			const keep = [
				B ? B.scrollTop : 0,
				B ? B.scrollLeft : 0,
				SC ? SC.scrollLeft : 0,
				SC ? SC.scrollTop : 0,
				A ? A.scrollTop : 0,
			];
			const tmp = document.createElement("div");
			tmp.innerHTML = html(cur.h, cur.X);
			const nw = tmp.firstElementChild;
			if (!nw) return;
			old.replaceWith(nw);
			const B2 = nw.querySelector(".aw-brw"),
				S2 = nw.querySelector(".aw-secs"),
				A2 = nw.querySelector(".aw-aside");
			if (B2) {
				B2.scrollTop = keep[0];
				B2.scrollLeft = keep[1];
			}
			if (S2) {
				S2.scrollLeft = keep[2];
				S2.scrollTop = keep[3];
			}
			if (A2 && cur.keepAside) A2.scrollTop = keep[4];
			cur.keepAside = false;
			bind(cur.el, cur.X, cur.h);
			if (fk) {
				const n = [...nw.querySelectorAll(`[${fk.name}]`)].find(
					(x) => x.getAttribute(fk.name) === fk.value,
				);
				if (n)
					try {
						n.focus({ preventScroll: true });
					} catch (e) {}
			}
		}
		const save = () => {
			try {
				localStorage.setItem("lgAcS", sec || "");
				localStorage.setItem("lgAcF", flt);
			} catch (e) {}
		};
		function goTo(M, id, t) {
			const d = M.D[id];
			if (!d) return;
			sec = d.cat;
			sel =
				M.nT(d) > 1
					? `${id}#${t == null ? Math.min((M.G[id] || []).length, M.nT(d) - 1) : t}`
					: id;
			tmenu = false;
			save();
			paint();
		}
		function wire() {
			if (wired) return;
			wired = true;

			try {
				for (const q of [Q.p, Q.l]) {
					const m = window.matchMedia(q);
					const f = () => {
						if (cur && cur.el && cur.el.querySelector(".acw")) paint();
					};
					if (m.addEventListener) m.addEventListener("change", f);
					else if (m.addListener) m.addListener(f);
				}
			} catch (e) {}

			document.addEventListener(
				"keydown",
				(e) => {
					if (e.key !== "Escape" || !(tmenu || sel) || !cur || !cur.el) return;
					const r = cur.el.querySelector(".acw");
					if (!r || !r.isConnected || !r.offsetParent) return;
					if (tmenu) tmenu = false;
					else sel = null;
					e.stopImmediatePropagation();
					e.preventDefault();
					paint();
				},
				true,
			);
			document.addEventListener("click", (e) => {
				if (!tmenu || !cur || !cur.el) return;
				const t = e.target;
				if (t && t.closest && t.closest(".aw-ttl")) return;
				tmenu = false;
				paint();
			});
		}
		function bind(el, X, h) {
			const ac = h && h.ac;
			if (!ac || !CAT) return;
			const root = el.querySelector(".acw");
			if (!root || root.classList.contains("acw-wait")) return;
			cur = { el, X, h };
			wire();
			const M = model(ac);
			const on = (sel2, f) =>
				root.querySelectorAll(sel2).forEach((b) => {
					b.onclick = (e) => f(b, e);
				});
			on("[data-awk]", (b) => {
				sel = sel === b.dataset.awk ? null : b.dataset.awk;
				tmenu = false;
				paint();
			});
			on("[data-awgo]", (b) =>
				goTo(M, b.dataset.awgo, b.dataset.awt == null ? null : +b.dataset.awt),
			);
			on("[data-awsec]", (b) => {
				sec = b.dataset.awsec;
				sel = null;
				save();
				paint();
				const B = el.querySelector(".acw .aw-brw");
				if (B) {
					B.scrollTop = 0;
					B.scrollLeft = 0;
				}
			});
			on("[data-awf]", (b) => {
				flt = b.dataset.awf;
				save();
				paint();
			});
			on("[data-awclose]", () => {
				sel = null;
				paint();
			});
			on("[data-awtmenu]", (b, e) => {
				e.stopPropagation();
				tmenu = !tmenu;
				cur.keepAside = true;
				paint();
			});
			on("[data-awtpick]", (b) => {
				const t = b.dataset.awtpick;
				tmenu = false;
				X.act(
					"/api/achPick",
					{ title: t || null },
					t ? `Титул: «${t}»` : "Титул снят",
				);
			});
			on("[data-awpickshow]", () => {
				flt = "got";
				save();
				paint();
				try {
					window.LGSiteUi.toast("Выбери открытое и нажми «В витрину»");
				} catch (e) {}
			});
			on("[data-awshow]", (b) => {
				const id = b.dataset.awshow,
					a = (ac.sh || []).filter((x) => x !== id);
				if (a.length >= 3) a.shift();
				a.push(id);
				X.act("/api/achPick", { show: a }, "Витрина обновлена", b);
			});
			on("[data-awunshow]", (b) => {
				const id = b.dataset.awunshow;
				X.act(
					"/api/achPick",
					{ show: (ac.sh || []).filter((x) => x !== id) },
					"Убрано из витрины",
					b,
				);
			});
			on("[data-awtitle]", (b) => {
				const t = b.dataset.awtitle;
				X.act("/api/achPick", { title: t }, `Титул: «${t}»`, b);
			});

			const B = root.querySelector(".aw-brw");
			if (B) {
				const w = B.clientWidth - 8;
				if (w > 0 && Math.abs(w - bw) > 4) {
					const L = lay(M, sec),
						was = geo(L.cols).cw;
					bw = w;
					if (geo(L.cols).cw !== was) {
						paint();
						return;
					}
				}
			}

			const SC = root.querySelector(".aw-secs"),
				onb = SC && SC.querySelector('.aw-sc[aria-pressed="true"]');
			if (
				onb &&
				SC.scrollWidth > SC.clientWidth + 1 &&
				(onb.offsetLeft < SC.scrollLeft ||
					onb.offsetLeft + onb.offsetWidth > SC.scrollLeft + SC.clientWidth)
			)
				SC.scrollLeft = onb.offsetLeft - 8;
		}
		return { html, bind, gst, geo };
	})();

	const w2 = (h) => !!(h && h.ac && h.ac.w2);
	window.LGAch = {
		html: (h, X) => (w2(h) ? W2.html(h, X) : html(h, X)),
		bind: (el, X, h) => (w2(h) ? W2.bind(el, X, h) : bind(el, X, h)),
		plate,
		w2gst: W2.gst,
		w2geo: W2.geo,
		scramble,
		TREE,
		layout: (cat) => (CAT ? layout(cat, byId()) : null),
		select: (k) => {
			sel = k;
		},
		reset: () => {
			CAT = null;
			sel = null;
		},
	};
})();
