(() => {
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
	const esc = (v) =>
		String(v == null ? "" : v).replace(
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
	const left = (ms) => {
		const s = Math.max(0, Math.ceil(ms / 1000));
		const m = Math.floor(s / 60);
		return m >= 60
			? `${Math.floor(m / 60)} ч ${m % 60} мин`
			: `${m}:${String(s % 60).padStart(2, "0")}`;
	};
	const bgOn = () => {
		const B = window.LGSiteUi && window.LGSiteUi.bg;
		try {
			return (B ? B.state() : document.hidden ? "hidden" : "on") !== "hidden";
		} catch (e) {
			return true;
		}
	};
	const rid = () =>
		Math.random().toString(36).slice(2) + Date.now().toString(36);

	let O = null,
		root = null,
		data = null,
		lands = null,
		raid = null,
		tab = "call",
		tick = 0,
		skew = 0,
		busy = false;

	function close() {
		if (tick) {
			clearInterval(tick);
			tick = 0;
		}
		document.removeEventListener("keydown", onKey);
		if (root) root.remove();
		root = null;
		O = null;
		data = null;
		lands = null;
		raid = null;
	}
	const onKey = (e) => {
		if (e.key === "Escape") close();
	};

	async function load() {
		const r = await O.api(
			"/api/world/siege?space=" + encodeURIComponent(O.space),
		);
		if (!r || !r.ok) {
			data = { err: (r && r.error) || "Осада сейчас недоступна" };
			paint();
			return;
		}
		data = r;
		skew = Date.now() - (+r.now || Date.now());
		if (O.district && r.gathers.some((g) => g.district === O.district))
			tab = "gather";
		else if (O.district && r.sieges.some((s) => s.district === O.district))
			tab = "sieges";
		paint();
	}

	async function loadLands() {
		let r = null;
		try {
			r = await O.api("/api/world/lands?space=" + encodeURIComponent(O.space));
		} catch (e) {
			r = null;
		}
		lands = r && r.ok ? r : null;
		paint();
	}

	async function loadRaid() {
		let r = null;
		try {
			r = await O.api("/api/world/raid?space=" + encodeURIComponent(O.space));
		} catch (e) {
			r = null;
		}
		raid = r && r.ok ? r : null;
		if (
			raid &&
			O.district &&
			(raid.gathers.some((g) => g.district === O.district) ||
				raid.raids.some((x) => x.district === O.district))
		)
			tab = "raid";
		paint();
	}
	async function raidAct(cmd, district) {
		if (busy) return;
		busy = true;
		paint();
		let r = null;
		try {
			r = await O.api("/api/world/raid", {
				space: O.space,
				cmd,
				district,
				req: rid(),
			});
		} finally {
			busy = false;
		}
		const okText = {
			call: "Набег объявлен - зовите своих в группу",
			join: "Вы в группе",
			defend: "Вы в обороне",
		};
		if (r && r.ok) O.toast(okText[cmd]);
		else O.toast((r && r.error) || "Не вышло - попробуйте ещё раз", true);
		await loadRaid();
	}
	function raidBanner() {
		const A = raid && raid.alerts;
		if (!A || !A.length) return "";
		return A.map(
			(a) =>
				`<p class="gs-alert">На наш город идут: округ ${esc(a.district)} - ${
					a.phase === "prep"
						? `набег через <span class="gs-time" data-until="${+a.until}">${esc(left(+a.until - (Date.now() - skew)))}</span>`
						: "набег идёт"
				}${a.phase === "start" ? ` ${btn("В оборону", `data-r="defend" data-d="${esc(a.district)}"`, true)}` : ""}</p>`,
		).join("");
	}
	function raidTab() {
		const R = raid,
			me = R && R.me;
		if (!me) return '<p class="gs-note">Вы не в гильдии этого мира.</p>';
		const ft = R.ft
			? `<p class="gs-mute">Силы ${+R.ft.p} из ${+R.ft.max} · набег стоит сил</p>`
			: "";
		const ok = (R.targets || []).filter((t) => t.can && t.can.ok);
		const tg = ok.length
			? `<ul class="gs-list">${ok.map((t) => `<li class="gs-row"><div class="gs-t"><b>Округ ${esc(t.district)}</b><span class="gs-mute">город гильдии ${esc(t.owner)}</span></div>${btn("Набег", `data-r="call" data-d="${esc(t.district)}"`, true)}</li>`).join("")}</ul>`
			: `<p class="gs-note">${(R.targets || []).length ? esc(((R.targets[0] || {}).can || {}).error || "Сейчас набег некуда") : "Рядом нет чужих городов."}</p>`;
		const mine = (R.gathers || []).filter((g) => g.guild === me.guild);
		const gt = mine.length
			? `<ul class="gs-list">${mine
					.map((g) => {
						const inSq = (g.squad || []).includes(me.login);
						return `<li class="gs-row gs-own"><div class="gs-t"><b>Сбор: округ ${esc(g.district)}</b><span class="gs-mute">в группе ${(g.squad || []).length} из 5 · <span class="gs-time" data-until="${+g.until}">${esc(left(+g.until - (Date.now() - skew)))}</span></span></div>${inSq ? '<span class="gs-chip gs-hi">вы в группе</span>' : btn("В группу", `data-r="join" data-d="${esc(g.district)}"`, true)}</li>`;
					})
					.join("")}</ul>`
			: "";
		const rs = (R.raids || []).filter(
			(x) => x.guild === me.guild || x.owner === me.guild,
		);
		const rt = rs.length
			? `<ul class="gs-list">${rs.map((x) => `<li class="gs-row${x.guild === me.guild ? " gs-own" : ""}"><div class="gs-t"><b>Набег: округ ${esc(x.district)}</b><span class="gs-mute">${x.battle != null ? `бой №${+x.battle}` : "начинается"} · итог - в ленте гильдии</span></div></li>`).join("")}</ul>`
			: "";
		return `${ft}${gt}${rt}${tg}`;
	}
	const CONFIRM = {
		leave:
			"Оставить этот округ? Если на город уже идут - это сдача: казна делится, как при захвате.",
	};
	async function landAct(cmd, district) {
		if (busy) return;
		if (CONFIRM[cmd]) {
			const ok =
				window.LGSiteUi && window.LGSiteUi.ask
					? await window.LGSiteUi.ask({
							title: CONFIRM[cmd],
							yes: "Оставить",
							danger: true,
						})
					: false;
			if (!ok) return;
		}
		busy = true;
		paint();
		let r = null;
		try {
			r = await O.api("/api/world/lands", {
				space: O.space,
				cmd,
				district,
				req: rid(),
			});
		} finally {
			busy = false;
		}
		const okText = {
			capital: "Столица выбрана",
			camp: "Лагерь поставлен",
			leave: "Округ оставлен",
			shield: "Щит включён на 8 часов",
			unshield: "Щит снят",
		};
		if (r && r.ok)
			O.toast(okText[cmd] + (r.paid ? ` - из казны ${r.paid}` : ""));
		else O.toast((r && r.error) || "Не вышло - попробуйте ещё раз", true);
		await loadLands();
	}
	function landsTab() {
		const L = lands,
			me = L && L.me;
		if (!me) return '<p class="gs-note">Вы не в гильдии этого мира.</p>';
		const lim = L.limit || {},
			st = L.standing;
		const head =
			`<p class="gs-mute">Земель ${(L.lands || []).length}${lim.limit != null ? ` из ${+lim.limit}` : ""}${lim.over ? " - больше предела" : ""}` +
			`${st ? ` · Влияние ${+st.influence} · ${+st.place}-е место` : ""}${L.field ? ` · походная казна ${+L.field}` : ""}</p>`;
		if (!(L.lands || []).length) {
			const camp = L.camp ? `Лагерь - округ ${esc(L.camp.id)}.` : "Лагеря нет.";
			const can =
				me.lead && O.district
					? btn(
							"Поставить лагерь здесь",
							`data-l="camp" data-d="${esc(O.district)}"`,
							true,
						)
					: "";
			return `${head}<p class="gs-note">У гильдии нет земли. ${camp} «Свои и соседние» округа считаются от лагеря.</p>${can}`;
		}
		const sh = new Map((L.shields || []).map((x) => [x.district, x]));
		const now = Date.now() - skew;
		return `${head}<ul class="gs-list">${L.lands
			.map((id) => {
				const x = sh.get(id),
					cap = L.capital === id,
					acts = [];
				if (x && x.until > now)
					acts.push(
						`<span class="gs-chip gs-hi">щит <span class="gs-time" data-until="${+x.until}">${esc(left(x.until - now))}</span></span>`,
					);
				if (me.lead && x && !(x.until > now) && x.canBuy && !x.throne)
					acts.push(btn("Щит", `data-l="shield" data-d="${esc(id)}"`));
				if (me.lead && x && x.until > now)
					acts.push(btn("Снять щит", `data-l="unshield" data-d="${esc(id)}"`));
				if (me.leader && x && !cap)
					acts.push(btn("Столица", `data-l="capital" data-d="${esc(id)}"`));
				if (me.leader)
					acts.push(btn("Оставить", `data-l="leave" data-d="${esc(id)}"`));
				return `<li class="gs-row${cap ? " gs-own" : ""}"><div class="gs-t"><b>Округ ${esc(id)}${cap ? " · столица" : ""}</b><span class="gs-mute">${x ? "город" : "без города"}</span></div><div class="gs-acts">${acts.join("")}</div></li>`;
			})
			.join("")}</ul>`;
	}
	async function act(cmd, district, side) {
		if (busy) return;
		busy = true;
		paint();
		let r = null;
		try {
			r = await O.api("/api/world/siege", {
				space: O.space,
				cmd,
				district,
				side,
				req: rid(),
			});
		} finally {
			busy = false;
		}
		if (r && r.ok)
			O.toast(
				cmd === "call"
					? "Клич объявлен - зовите своих «В строй»"
					: cmd === "enlist"
						? "Вы в строю"
						: "Отряд вступил в осаду",
			);
		else O.toast((r && r.error) || "Не вышло - попробуйте ещё раз", true);
		await load();
	}

	const btn = (t, attrs, main) =>
		`<button class="gs-b${main ? " gs-main" : ""}" ${attrs}${busy ? " disabled" : ""}>${esc(t)}</button>`;
	function callTab() {
		const me = data.me;
		if (!me)
			return '<p class="gs-note">Вы не в гильдии этого мира. Клич объявляет руководство гильдии.</p>';
		if (!data.targets.length)
			return `<p class="gs-note">${me.cities.length ? "У дома нет чужих городов - осаждать некого." : "У гильдии нет городов: дом - свои города и соседние округа."}</p>`;
		return `<ul class="gs-list">${data.targets
			.map((t) => {
				const cd = +t.cooldownUntil - (Date.now() - skew);
				const right = !me.lead
					? '<span class="gs-chip">клич - руководство</span>'
					: cd > 0
						? `<span class="gs-chip">перерыв ${esc(left(cd))}</span>`
						: btn("Клич", `data-a="call" data-d="${esc(t.district)}"`, true);
				return `<li class="gs-row"><div class="gs-t"><b>${esc(t.town || t.name)}</b><span class="gs-mute">${esc(t.name)} · ${esc(t.ownerName)}${t.capital ? " · столица" : ""}</span></div>${right}</li>`;
			})
			.join("")}</ul>`;
	}
	function gatherTab() {
		if (!data.gathers.length)
			return '<p class="gs-note">Сборов нет. Клич объявляют на вкладке «Клич».</p>';
		return `<ul class="gs-list">${data.gathers
			.map((g) => {
				const ms = +g.until - (Date.now() - skew);
				const right = g.mine
					? g.me
						? '<span class="gs-chip gs-hi">вы в строю</span>'
						: btn(
								"В строй",
								`data-a="enlist" data-d="${esc(g.district)}"`,
								true,
							)
					: "";
				return `<li class="gs-row${g.mine ? " gs-own" : ""}"><div class="gs-t"><b>${esc(g.guildName)} → ${esc(g.ownerName)}</b>
        <span class="gs-mute">округ ${esc(g.district)} · в строю ${+g.n} · <span class="gs-time" data-until="${+g.until}">${esc(left(ms))}</span></span></div>${right}</li>`;
			})
			.join("")}</ul>`;
	}
	function siegesTab() {
		if (!data.sieges.length)
			return '<p class="gs-note">Осад гильдий сейчас нет.</p>';
		const lead = !!(data.me && data.me.lead);
		return `<ul class="gs-list">${data.sieges
			.map((s) => {
				const own = data.me && data.me.guild === s.owner;
				const right = !lead
					? '<span class="gs-chip">вступает руководство</span>'
					: own
						? btn(
								"За оборону",
								`data-a="join" data-d="${esc(s.district)}" data-s="def"`,
								true,
							)
						: `${btn("За осаду", `data-a="join" data-d="${esc(s.district)}" data-s="atk"`, true)}${btn("За оборону", `data-a="join" data-d="${esc(s.district)}" data-s="def"`)}`;
				return `<li class="gs-row${own ? " gs-own" : ""}"><div class="gs-t"><b>Осада: ${esc(s.ownerName)}</b><span class="gs-mute">округ ${esc(s.district)} · бой №${+s.battle}</span></div><div class="gs-acts">${right}</div></li>`;
			})
			.join("")}</ul>`;
	}
	function paint() {
		if (!root) return;
		const win = root.querySelector(".gs-body");
		if (!data) {
			win.innerHTML = '<p class="gs-note">Загружаем…</p>';
			return;
		}
		if (data.err) {
			win.innerHTML = `<p class="gs-note">${esc(data.err)}</p>`;
			return;
		}
		const n = {
			call: data.targets.length,
			gather: data.gathers.length,
			sieges: data.sieges.length,
			lands: lands && lands.lands ? lands.lands.length : 0,
			raid: raid ? (raid.gathers || []).length + (raid.raids || []).length : 0,
		};
		const tabs = [
			["call", "Клич"],
			["gather", "Сбор"],
			["sieges", "Осады"],
			...(raid ? [["raid", "Набег"]] : []),
			...(lands ? [["lands", "Земли"]] : []),
		]
			.map(
				([k, t]) =>
					`<button class="gs-tab${tab === k ? " on" : ""}" data-tab="${k}">${t}${n[k] ? ` <i>${n[k]}</i>` : ""}</button>`,
			)
			.join("");
		win.innerHTML = `${raidBanner()}<div class="gs-tabs">${tabs}</div>${tab === "call" ? callTab() : tab === "gather" ? gatherTab() : tab === "lands" && lands ? landsTab() : tab === "raid" && raid ? raidTab() : siegesTab()}
      ${data.pending && data.pending.length ? `<p class="gs-foot">Пока без: ${esc(data.pending.join(", "))}</p>` : ""}`;
	}
	function onClick(e) {
		const t = e.target.closest("button");
		if (!t || !root.contains(t)) return;
		if (t.classList.contains("gs-x")) {
			close();
			return;
		}
		if (t.dataset.tab) {
			tab = t.dataset.tab;
			paint();
			return;
		}
		if (t.dataset.a) act(t.dataset.a, t.dataset.d, t.dataset.s);
		else if (t.dataset.l) landAct(t.dataset.l, t.dataset.d);
		else if (t.dataset.r) raidAct(t.dataset.r, t.dataset.d);
	}
	function step() {
		if (!root || !bgOn()) return;
		for (const el of root.querySelectorAll(".gs-time"))
			el.textContent = left(+el.dataset.until - (Date.now() - skew));
	}

	function open(o) {
		close();
		O = o;
		tab = "call";
		data = null;
		lands = null;
		raid = null;
		root = document.createElement("div");
		root.className = "gl-modal gs-modal";
		root.innerHTML = `<div class="gs-win gw-tok gw-dk" data-gst="${gst()}" role="dialog" aria-label="Гильдия: осады и земли">
      <div class="gs-hd"><h3>Осады и земли</h3><button class="gs-x" aria-label="Закрыть">×</button></div><div class="gs-body"></div></div>`;
		root.addEventListener("click", (e) => {
			if (e.target === root) close();
			else onClick(e);
		});
		document.addEventListener("keydown", onKey);
		document.body.appendChild(root);
		paint();
		tick = setInterval(step, 1000);
		load().catch(() => {
			data = { err: "Нет связи" };
			paint();
		});
		loadLands();
		loadRaid();
	}

	window.LGGuildSiege = { open, close };
})();
