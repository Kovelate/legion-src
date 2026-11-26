window.LGArena = (() => {
	const SU = window.LGSiteUi,
		esc = SU.esc;
	const ROLE = {
		legionary: "Легионер",
		paladin: "Паладин",
		rogue: "Разбойник",
		recruit: "Новобранец",
		archer: "Лучник",
		mage: "Маг",
		necromancer: "Некромант",
		priest: "Жрец",
	};
	const LINE = ["Впереди", "Середина", "Сзади"];
	let X = null,
		root = null,
		S = null,
		player = null,
		wedgeApi = null;
	const F = () => window.LGArenaField;

	const dt = (t) => {
		try {
			return new Date(t).toLocaleString("ru-RU", {
				day: "numeric",
				month: "short",
				hour: "2-digit",
				minute: "2-digit",
			});
		} catch (e) {
			return "";
		}
	};
	const rounds = (n) => `${n} ${SU.plural(n, "раунд", "раунда", "раундов")}`;
	const errText = (r) => (r && r.error) || "Не вышло - попробуй ещё раз";
	const prize = (coins, xp) =>
		[coins > 0 ? "+" + X.money(coins) : "", xp > 0 ? `+${xp} опыта` : ""]
			.filter(Boolean)
			.join(", ");
	const hm = (ms) => {
		const m = Math.max(1, Math.ceil(ms / 60000)),
			h = Math.floor(m / 60);
		return h ? `${h} ч ${m % 60} мин` : `${m} мин`;
	};
	const signed = (n) => (n > 0 ? "+" + n : n < 0 ? "−" + Math.abs(n) : "0");

	let onFocus = null;

	const swDrag = { skip: false };
	function panelDrag() {
		const box = root && root.querySelector(".ar-sw");
		if (!box) return;
		const m = S.v && S.v.duel && S.v.duel.me;
		if (!m || !m.squad) return;
		const heroes = [...box.querySelectorAll(".ar-sw-h[data-hero]")];
		let st = null;
		const slotAt = (x, y) => {
			if (st && st.g) st.g.style.visibility = "hidden";
			const el = document.elementFromPoint(x, y);
			if (st && st.g) st.g.style.visibility = "";
			const h = el && el.closest ? el.closest(".ar-sw-h[data-slot]") : null;
			return h && box.contains(h) ? +h.dataset.slot : -1;
		};
		const mark = (t) => {
			box
				.querySelectorAll(".ar-sw-h.over")
				.forEach((e) => e.classList.remove("over"));
			if (t >= 0 && t !== st.i) {
				const e = box.querySelector(`.ar-sw-h[data-slot="${t}"]`);
				if (e) e.classList.add("over");
			}
		};
		const begin = (b, x, y) => {
			const f = b.querySelector(".ar-sw-f") || b,
				r = f.getBoundingClientRect(),
				g = f.cloneNode(true);
			g.classList.add("ar-sw-drg");
			g.style.width = r.width + "px";
			g.style.height = r.height + "px";
			g.style.left = r.left + "px";
			g.style.top = r.top + "px";
			(box.closest(".arb") || document.body).appendChild(g);
			st.g = g;
			st.ox = x;
			st.oy = y;
			st.on = true;
			b.classList.add("drag");
			box.classList.add("aw-dz");
		};
		const move = (x, y) => {
			st.g.style.transform = `translate(${x - st.ox}px, ${y - st.oy}px) scale(1.08)`;
			mark(slotAt(x, y));
		};
		const finish = (x, y) => {
			const s0 = st;
			st = null;
			if (!s0) return;
			clearTimeout(s0.tt);
			if (!s0.on) return;
			s0.g.remove();
			s0.b.classList.remove("drag");
			box.classList.remove("aw-dz");
			box
				.querySelectorAll(".ar-sw-h.over")
				.forEach((e) => e.classList.remove("over"));
			swDrag.skip = true;
			setTimeout(() => {
				swDrag.skip = false;
			}, 0);
			const t = x == null ? -1 : slotAt(x, y);
			if (t >= 0 && t !== s0.i) void panelSwap(s0.i, t);
		};
		for (const b of heroes) {
			b.addEventListener("pointerdown", (e) => {
				if (
					e.pointerType !== "mouse" ||
					e.button !== 0 ||
					box.getAttribute("aria-busy") === "true"
				)
					return;
				st = { b, i: +b.dataset.slot, x: e.clientX, y: e.clientY, on: false };
				const mv = (ev) => {
					if (!st) return;
					if (!st.on) {
						if (Math.hypot(ev.clientX - st.x, ev.clientY - st.y) < 8) return;
						begin(b, st.x, st.y);
					}
					move(ev.clientX, ev.clientY);
				};
				const up = (ev) => {
					window.removeEventListener("pointermove", mv);
					window.removeEventListener("pointerup", up);
					window.removeEventListener("pointercancel", up);
					finish(ev.type === "pointerup" ? ev.clientX : null, ev.clientY);
				};
				window.addEventListener("pointermove", mv);
				window.addEventListener("pointerup", up);
				window.addEventListener("pointercancel", up);
			});
			b.addEventListener(
				"touchstart",
				(e) => {
					if (
						e.touches.length !== 1 ||
						box.getAttribute("aria-busy") === "true"
					)
						return;
					const t0 = e.touches[0];
					st = {
						b,
						i: +b.dataset.slot,
						x: t0.clientX,
						y: t0.clientY,
						on: false,
						touch: true,
					};
					const s1 = st;
					s1.tt = setTimeout(() => {
						if (st === s1 && !s1.on) {
							begin(b, s1.x, s1.y);
							move(s1.x, s1.y);
						}
					}, 400);
				},
				{ passive: true },
			);
			b.addEventListener(
				"touchmove",
				(e) => {
					if (!st || !st.touch) return;
					const t0 = e.touches[0];
					if (!st.on) {
						if (Math.hypot(t0.clientX - st.x, t0.clientY - st.y) > 8) {
							clearTimeout(st.tt);
							st = null;
						}
						return;
					}
					e.preventDefault();
					move(t0.clientX, t0.clientY);
				},
				{ passive: false },
			);
			b.addEventListener("touchend", (e) => {
				if (!st || !st.touch) return;
				const t0 = e.changedTouches[0];
				if (st.on) e.preventDefault();
				finish(t0 ? t0.clientX : null, t0 ? t0.clientY : null);
			});
			b.addEventListener("touchcancel", () => finish(null, null));
			b.addEventListener("contextmenu", (e) => {
				if (st && st.touch) e.preventDefault();
			});
		}
	}
	async function panelSwap(a, b) {
		const d = S.v && S.v.duel,
			m = d && d.me;
		if (!m || !m.squad) return;
		const cur = swSlots(m).map((h) => (h ? h.login : null));
		[cur[a], cur[b]] = [cur[b], cur[a]];
		const full = !!m.squad.full;

		m.forms = m.forms || {};
		if (full) {
			m.forms.def = { slots: cur.slice(), auto: false };
			m.forms.atk = { slots: cur.slice(), auto: false };
		} else m.forms.pre = cur.slice();
		render();
		const bx = root.querySelector(".ar-sw");
		if (bx) bx.setAttribute("aria-busy", "true");
		let ok;
		if (full) {
			const r1 = await post({ op: "form", kind: "def", slots: cur }, null);
			ok = r1 && (await post({ op: "form", kind: "atk", slots: cur }, null));
		} else ok = await post({ op: "form", kind: "pre", slots: cur }, null);
		const bx2 = root && root.querySelector(".ar-sw");
		if (bx2) bx2.removeAttribute("aria-busy");
		if (!ok) {
			void load();
			return;
		}
		X.toast(
			full
				? "Порядок сохранён - так отряд встанет в обороне и при нападении"
				: "Места в клине сохранены",
		);
	}

	function askLeave(btn) {
		const m = S.v && S.v.duel && S.v.duel.me,
			sq = m && m.squad;
		if (!sq) return;
		const lead = sq.members.find((h) => h.login === sq.lead),
			title = `Отряд ${(lead && lead.name) || sq.lead}`,
			isLead = sq.lead === m.login;
		modalClose();
		window.LGSiteUi.ask({
			title: `Покинуть отряд ${title.replace(/^Отряд /, "")}?`,
			text: `${isLead && sq.members.length > 1 ? "Ты глава - главой станет следующий по вступлению. " : ""}Вернуться можно по новому приглашению или через поиск.`,
			yes: "Покинуть",
			danger: true,
		}).then((ok) => {
			if (ok) void act({ op: "sqleave" }, btn && btn.isConnected ? btn : null);
		});
	}

	async function load() {
		if (!S || S.busy) return;
		S.busy = true;
		let r = null;
		try {
			r = await X.api("/api/arena");
		} finally {
			if (S) S.busy = false;
		}
		if (!S) return;
		if (!r || !r.ok) {
			S.err = errText(r);
			render();
			return;
		}
		S.err = "";
		S.at = Date.now();
		S.v = r;
		chestBadge();

		if (r.duel && r.duel.v2 && window.LGArena2 && S.screen === "main") {
			S.v2 = true;
			window.LGArena2.open(root, X, r);
			return;
		}
		if (S.screen === "main") render();
	}
	async function post(body, btn) {
		if (btn) btn.disabled = true;
		root.querySelector(".ar") &&
			root.querySelector(".ar").setAttribute("data-busy", "1");
		const r = await X.api("/api/arena/act", body);
		if (btn) btn.disabled = false;
		const a = root.querySelector(".ar");
		if (a) a.removeAttribute("data-busy");
		if (!r || !r.ok) {
			X.toast(errText(r), true);

			if (
				r &&
				(r.inSquad || /в отряде|не в отряде/.test(String(r.error || "")))
			)
				void load().then(() => {
					if (modal && modal.kind === "inv") openInvite(null);
				});
			return null;
		}
		return r;
	}
	async function act(body, btn) {
		const r = await post(body, btn);
		if (!r) return;
		const T = {
			invite: "Приглашение отправлено - ждём ответа",
			accept: "Ты в отряде",
			decline: "Приглашение отклонено",
			sqleave: "Ты вышел из отряда",
			kick: "Игрок исключён из отряда",
			refresh: "Список соперников обновлён",
			call: "Зов отправлен - отряд виден всем на вкладке «Арена», зрители пишут в чат «вотряд» и ник",
			ask: "Готово - приглашение пришло, прими его в блоке «Отряд»",
			buy: "Бой куплен - можно нападать",
			lfg: body.on
				? "Ты в списке «Ищут отряд» - главы отрядов увидят тебя"
				: "Ты убран из списка «Ищут отряд»",
			recruit: body.on ? "Набор открыт - отряд виден в поиске" : "Набор закрыт",
			sqjoin: "Ты в отряде",
			pull: "Игрок в твоём отряде",
		};
		if (T[body.op]) X.toast(T[body.op]);
		if (r.steps && r.steps.length)
			X.toast(
				r.steps
					.map(
						(st) =>
							`${st.wins} ${SU.plural(st.wins, "победа", "победы", "побед")} за день: ${stepGift(st)} - получено`,
					)
					.join("; "),
			);
		if (body.op === "invite" && S.fr)
			S.fr.sent = { ...(S.fr.sent || {}), [body.login]: true };
		await load();
		if (modal && modal.kind === "inv") openInvite(null);
		if (body.op === "invite" && S.fr && S.fr.open) void loadFriends();
	}
	async function openFight(id) {
		S.screen = "fight";
		S.fight = { id, busy: true };
		render();
		const r = await X.api("/api/arena/fight?id=" + encodeURIComponent(id));
		if (!S || !S.fight || S.fight.id !== id) return;
		S.fight = r && r.ok ? { id, f: r.fight } : { id, err: errText(r) };
		render();
	}
	function toMain() {
		if (player) {
			player.destroy();
			player = null;
		}
		wedgeApi = null;
		S.screen = "main";
		S.fight = null;
		S.target = null;
		render();
		void load();
		top();
	}
	function top() {
		const w = root.closest(".gu-win") || document.scrollingElement;
		try {
			if (w) w.scrollTop = 0;
		} catch (e) {}
	}

	async function revenge(id, btn) {
		const r = await post({ op: "revenge", id: String(id) }, btn);
		if (!r) return;
		modalClose();
		S.screen = "fight";
		S.fight = { id: r.id, f: r.fight };
		render();
		void load();
	}

	const moneyTxt = (n) => String(X.money(n)).replace(/<[^>]+>/g, "");
	function stepGift(st) {
		return [
			st.coins > 0 ? moneyTxt(st.coins) : "",
			st.tokens > 0
				? `${st.tokens} ${SU.plural(st.tokens, "жетон", "жетона", "жетонов")}`
				: "",
			st.spheres > 0
				? `${st.spheres} ${SU.plural(st.spheres, "сфера", "сферы", "сфер")}`
				: "",
		]
			.filter(Boolean)
			.join(", ");
	}

	const hms = (ms) => {
		const s0 = Math.max(0, Math.ceil(ms / 1000)),
			d = Math.floor(s0 / 86400),
			h = Math.floor((s0 % 86400) / 3600),
			m = Math.floor((s0 % 3600) / 60),
			sec = s0 % 60;
		return d
			? `${d} д ${h} ч ${m} мин`
			: `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
	};

	let clkT = 0;
	function clkTick() {
		clearTimeout(clkT);
		clkT = 0;
		const els = [
			...((root && root.querySelectorAll(".arb-clk[data-until]")) || []),
			...((modal && modal.w.querySelectorAll(".arb-clk[data-until]")) || []),
		];
		if (!els.length) return;
		let done = false;
		for (const el of els) {
			const left = +el.dataset.until - Date.now();
			if (left <= 0) done = true;
			el.textContent = hms(left);
		}
		if (done && S && S.screen === "main") {
			void load();
			return;
		}
		const BG = SU.bg,
			hidden = !!(BG && BG.state && BG.state() === "hidden");
		clkT = setTimeout(clkTick, hidden ? 5000 : 1000);
	}

	async function loadFriends() {
		if (!S.fr) return;
		S.fr.busy = true;
		renderFriends();
		const r = await X.api("/api/arena/friends");
		if (!S || !S.fr) return;
		S.fr.busy = false;
		S.fr.r = r && r.ok ? r : { err: errText(r) };
		renderFriends();
	}
	function friendsHtml() {
		const F0 = S.fr;
		if (!F0 || !F0.open) return "";
		let body;
		if (F0.busy && !F0.r) body = SU.note("Загружаем друзей…");
		else if (!F0.r || F0.r.err)
			body = SU.note((F0.r && F0.r.err) || "Не вышло");
		else if (F0.r.closed)
			body = SU.note("Друзья пока закрыты - позови игрока по нику.");
		else if (!F0.r.list.length)
			body = SU.note(
				"Друзей пока нет - добавь их через меню ника, кнопка «Друзья».",
			);
		else
			body = `${F0.r.why ? `<p class="ar-why">${esc(F0.r.why)}</p>` : ""}<ul class="ar-frl">${F0.r.list
				.map((f) => {
					const on = f.on
						? `<span class="ar-on${f.on.here ? " here" : ""}">${f.on.here ? "онлайн здесь" : esc(f.on.t || "онлайн")}</span>`
						: '<span class="ar-off0">не в сети</span>';
					const sent = F0.sent && F0.sent[f.login];
					const why = sent ? "приглашение отправлено" : f.ok ? "" : f.why;
					return `<li class="ar-fr${f.ok && !sent ? "" : " no"}" data-login="${esc(f.login)}"><span class="ar-frn"><b class="ar-n">${esc(f.name)}</b>${on}</span>
        <span class="muted ar-frw">${f.level ? `${esc(ROLE[f.role] || f.role || "")}, ${f.level} ур.` : ""}${why ? `${f.level ? " · " : ""}${esc(why)}` : ""}</span>
        <button type="button" class="arb-btn sm" data-frinv="${esc(f.login)}"${f.ok && !sent && F0.r.can ? "" : " disabled"}>Позвать</button></li>`;
				})
				.join("")}</ul>`;
		return `<div class="ar-frbox" role="region" aria-label="Пригласить друга"><div class="ar-frh"><b>Друзья</b><span class="muted">онлайн - сверху</span></div>${body}</div>`;
	}
	function renderFriends() {
		const box =
			(modal && modal.w.querySelector(".ar-frslot")) ||
			(root && root.querySelector(".ar-frslot"));
		if (!box) return;
		box.innerHTML = friendsHtml();
		box.querySelectorAll("[data-frinv]").forEach((b) => {
			b.onclick = () => act({ op: "invite", login: b.dataset.frinv }, b);
		});
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

	const IC = {
		cup: '<path d="M8 4h8v5a4 4 0 0 1-8 0V4zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8M10 17h4"/>',
		swords:
			'<path d="M4 4l10 10M4 4h4M4 4v4M20 4L10 14M20 4h-4M20 4v4M7 17l-3 3M17 17l3 3M8 13l3 3M16 13l-3 3"/>',
		refresh:
			'<path d="M20 11a8 8 0 0 0-14.6-4.5M4 4v4h4M4 13a8 8 0 0 0 14.6 4.5M20 20v-4h-4"/>',
		plus: '<path d="M12 5v14M5 12h14"/>',
		shield:
			'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/>',
		scroll:
			'<path d="M7 4h11a2 2 0 0 1 2 2v1h-4M7 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8M7 4a2 2 0 0 1 2 2v12M11 10h5M11 14h5"/>',
		wedge:
			'<path d="M12 4v4M6 9v4M18 9v4M4 15v4M20 15v4"/><circle cx="12" cy="10" r="2"/><circle cx="6" cy="15" r="2"/><circle cx="18" cy="15" r="2"/>',
		bot: '<rect x="5" y="8" width="14" height="11" rx="2"/><path d="M12 4v4M9 13h.01M15 13h.01M9 16h6"/>',
	};
	const ic = (k, s = 20) =>
		`<svg class="arb-i" viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[k] || ""}</svg>`;
	const mmss = (ms) => {
		const s = Math.max(0, Math.ceil(ms / 1000));
		return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
	};
	const ago = (t) => {
		const m = Math.max(0, Math.floor((Date.now() - t) / 60000));
		if (m < 1) return "только что";
		if (m < 60) return `${m} мин`;
		const h = Math.floor(m / 60);
		return h < 24 ? `${h} ч` : `${Math.floor(h / 24)} дн`;
	};
	const big = (n) =>
		String(Math.round(+n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

	function render() {
		if (!root || !S) return;
		if (player && S.screen !== "fight") {
			player.destroy();
			player = null;
		}
		if (S.screen === "fight") {
			renderFight();
			return;
		}
		if (S.screen === "def" || S.screen === "atk") {
			renderForm();
			return;
		}
		const v = S.v,
			d = v && v.duel;
		root.innerHTML = `<div class="ar ar2 arb gw-dk" data-gst="${gst()}">
      ${headHtml(d)}
      ${S.err ? SU.note(S.err, "empty ar-err") : ""}
      ${
				v
					? `${oppHtml(d)}
        <div class="arb-row ar-cols">
          <section class="arb-panel arb-rank ar-rate ar-week" aria-label="Рейтинг недели">${weekHtml(d)}</section>
          <section class="arb-panel arb-def ar-squad" aria-label="Состав обороны и атаки">${defHtml(d)}</section>
          <section class="arb-panel arb-log" aria-label="Журнал битв">${logHtml(d, v)}</section>
        </div>${botsHtml(v)}${lockHtml(d)}`
					: S.err
						? ""
						: SU.note("Загружаем арену…")
			}
    </div>`;
		bind();
		fitNames();
		refTick();
		clkTick();
	}

	function headHtml(d) {
		const m = d && d.me,
			t = (m && m.today) || {};
		return `<header class="arb-top">
      <div class="arb-tl">${m ? `<span class="arb-chip" title="Рейтинг арены${m.place ? ` - место ${m.place}` : ""}">${ic("cup")}Рейтинг <b class="ar-big">${m.rating}</b></span>` : ""}
        <button type="button" class="arb-btn cream sm" data-ar="top" aria-haspopup="dialog">${ic("cup", 18)}Топ арены</button></div>
      <h2 class="arb-h ar-h">Арена 5×5</h2>
      ${m && t.max != null ? `<span class="arb-chip light ar-fights${t.left <= 0 ? " out" : ""}" data-fights="${t.n}/${t.max}" title="Боёв сегодня осталось ${t.left} из ${t.max}: считаются нападения, оборона не тратит">${ic("swords", 18)}Осталось боёв: <b>${t.left}</b></span>` : "<span></span>"}
    </header>`;
	}

	function oppHtml(d) {
		const m = d && d.me;
		if (!m) return "";
		const t = m.today || {};
		const hint = !m.canAttack
			? m.limit
				? m.hero
					? ""
					: `Бои закончились - новые через ${hm(t.resetIn)}, в 00:00 по Москве`
				: m.whyShort || m.why || ""
			: "";
		const L = window.LGArenaLocs,
			loc = L && L.has(d.loc) ? d.loc : "colosseum",
			bg = L ? L.bg(loc, "stage") || "" : "";
		const card = (
			o,
		) => `<li class="arb-panel arb-card ar-off" data-off="${esc(o.login)}">
      <div class="arb-ch ar-oh"><b class="ar-n arb-cn">${esc(o.title || o.name)}</b><span class="arb-chip sm" title="рейтинг">${ic("cup", 16)}<span class="ar-or">${o.rating}</span></span></div>
      <button type="button" class="arb-scene arb-sbtn" data-squad="${esc(o.login)}" aria-haspopup="dialog" aria-label="${esc(o.title || o.name)}: герои, снаряжение и навыки">${bg}${miniWedge(o.def && o.def.length ? o.def : [])}</button>
      ${
				o.test
					? `<div class="ar-gain arb-gain"><span class="muted">${o.bot ? "Отряд ботов · " : "В твоём отряде боты · "}тестовый бой, без рейтинга</span></div>`
					: `<div class="ar-gain arb-gain"><span class="up">Победа: +${o.win}</span><span class="dn">Поражение: −${o.lose}</span></div>`
			}
      <div class="arb-cf"><span class="arb-pow">Сила <b>${big(o.power)}</b></span>
        <button type="button" class="arb-btn red ar-go" data-atk="${esc(o.login)}"${m.canAttack ? "" : ` disabled aria-describedby="arh-${esc(o.login)}"`}>${ic("swords")}<span>Атака</span></button></div>
      ${hint ? `<p class="ar-hint" id="arh-${esc(o.login)}">${esc(hint)}</p>` : ""}</li>`;
		const ghost = (i) =>
			`<li class="arb-panel arb-card ar-off ar-off-ghost" aria-hidden="true"><div class="arb-ch ar-oh"><b class="ar-n">Соперник ${i}</b><span class="arb-chip sm"><span class="ar-or">-</span></span></div><div class="arb-scene">${bg}${miniWedge([null, null, null, null, null])}</div></li>`;
		const list = d.offers || [];
		const wait = m.refreshIn > 0 ? Date.now() + m.refreshIn : 0;
		return `<section class="arb-opp ar-offers" aria-label="Соперники">
      <div class="arb-oh"><h3 class="arb-pt arb-plate">${ic("swords", 22)}Выбери соперника</h3>
        <button type="button" class="arb-btn cream sm ar-ref" data-ar="refresh"${wait ? ` data-until="${wait}" disabled` : ""}${m.hero ? "" : " disabled"}>${ic("refresh", 18)}<span class="arb-rt">${wait ? `через ${mmss(m.refreshIn)}` : "Обновить"}</span></button></div>
      ${stepsHtml(d)}
      ${m.limit && m.hero && !canPlayWhy(d) ? buyHtml(d) : m.why && !(m.hero && !(m.squad && m.squad.full) && !canPlayLv(d)) ? `<p class="arb-plate arb-why ar-why">${esc(m.why)}</p>` : ""}
      ${
				list.length
					? `<ul class="arb-cards ar-offs">${list.map(card).join("")}</ul>`
					: `<ul class="arb-cards ar-offs ar-offs-empty">${[1, 2, 3].map(ghost).join("")}</ul>
        <p class="arb-plate ar-pr ar-empty">Собранных отрядов на канале пока нет - соперники появятся, когда игроки соберут отряды из 5. Зови друзей собирать свои.</p>`
			}
      ${callsHtml(d)}
    </section>`;
	}

	const canPlayLv = (d) => /уровня/.test(String(d.me.whyShort || ""));
	const canPlayWhy = (d) => {
		const m = d.me;
		return (
			!m.hero ||
			m.whyShort === "нужен герой канала" ||
			/уровня|отряд из 5/.test(m.whyShort || "")
		);
	};

	const CHEST = `<svg class="arb-chs" viewBox="0 0 64 56" aria-hidden="true">
    <ellipse class="ch-sh" cx="32" cy="53" rx="25" ry="3"/>
    <g class="ch-body"><rect class="ch-w" x="7" y="26" width="50" height="25" rx="3"/><path class="ch-pl" d="M7 34h50M7 42h50"/>
      <rect class="ch-m" x="7" y="26" width="6" height="25"/><rect class="ch-m" x="51" y="26" width="6" height="25"/><rect class="ch-m" x="7" y="47" width="50" height="4"/>
      <circle class="ch-rv" cx="10" cy="30" r="1.2"/><circle class="ch-rv" cx="54" cy="30" r="1.2"/><circle class="ch-rv" cx="10" cy="46" r="1.2"/><circle class="ch-rv" cx="54" cy="46" r="1.2"/>
      <path class="ch-in" d="M10 26h44v3H10z"/><g class="ch-gl"><circle cx="32" cy="22" r="10"/><path d="M26 18l3 4-4 2zM38 18l-3 4 4 2zM32 12v5"/></g></g>
    <g class="ch-lid"><path class="ch-w" d="M7 26V18q0-12 25-12t25 12v8z"/><path class="ch-pl" d="M9 17q2-8 23-8t23 8"/>
      <rect class="ch-m" x="7" y="22" width="50" height="4"/><path class="ch-m" d="M13 26V14q0-5 4-6v18zM51 26V14q0-5-4-6v18z"/></g>
    <g class="ch-lock"><rect class="ch-m" x="27" y="22" width="10" height="11" rx="2"/><path class="ch-kh" d="M32 26.5a1.6 1.6 0 1 0 0.01 0M31.3 28h1.4v2.6h-1.4z"/></g></svg>`;
	function stepsHtml(d) {
		const m = d.me,
			t = m.today || {},
			steps = (d.rules && d.rules.winSteps) || [];
		if (!m.hero || !steps.length) return "";
		const got = new Set(t.got || []),
			w = Math.min(5, t.wins || 0),
			max = steps[steps.length - 1].wins || 5,
			ready = steps.filter((x) => w >= x.wins && !got.has(x.wins)).length;
		const chest = (x) => {
			const state = got.has(x.wins) ? "open" : w >= x.wins ? "ready" : "lock";
			const lbl =
				state === "open"
					? "открыт"
					: state === "ready"
						? "можно забрать"
						: `ещё ${x.wins - w} ${SU.plural(x.wins - w, "победа", "победы", "побед")}`;
			return `<li class="arb-cst ${state}" style="left:${(x.wins / max) * 100}%"><button type="button" class="arb-chb" data-chest="${x.wins}" aria-label="Сундук за ${x.wins} ${SU.plural(x.wins, "победу", "победы", "побед")}: ${lbl}">${CHEST}</button>
        <span class="arb-chn">${x.wins}</span></li>`;
		};
		return `<div class="arb-plate arb-steps" role="group" aria-label="Сундуки за победы сегодня: побед ${t.wins || 0}">
      <span class="arb-stl">Победы сегодня: <b>${t.wins || 0}</b>${ready ? `<span class="arb-stok" data-chready="${ready}">Можно забрать: ${ready}</span>` : ""}</span>
      <div class="arb-bar"><span class="arb-barf" style="transform:scaleX(${w / max})"></span><ol class="arb-chl">${steps.map(chest).join("")}</ol></div>
      <div class="arb-chp" role="status" aria-live="polite" hidden></div></div>`;
	}

	async function chestClick(btn) {
		const d = S.v && S.v.duel,
			t = (d && d.me && d.me.today) || {},
			k = +btn.dataset.chest,
			st = ((d && d.rules && d.rules.winSteps) || []).find((x) => x.wins === k);
		if (!st) return;
		const li = btn.closest(".arb-cst"),
			pop = root.querySelector(".arb-chp");
		const show = (html) => {
			if (!pop) return;
			pop.innerHTML = html;
			pop.hidden = false;
			pop.style.setProperty("--x", li.style.left);
			clearTimeout(chestClick.t);
			chestClick.t = setTimeout(() => {
				pop.hidden = true;
			}, 6000);
		};
		if (li.classList.contains("lock")) {
			const need = k - (t.wins || 0);
			show(
				`<b>Что внутри:</b> ${esc(stepGift(st))}<br>Ещё ${need} ${SU.plural(need, "победа", "победы", "побед")} при нападении`,
			);
			return;
		}
		if (li.classList.contains("open")) {
			show(`<b>Получено:</b> ${esc(stepGift(st))}`);
			return;
		}
		if (btn.getAttribute("aria-busy") === "true") return;
		btn.setAttribute("aria-busy", "true");
		const r = await post({ op: "chest", wins: k }, null);
		btn.removeAttribute("aria-busy");
		if (!r) {
			void load();
			return;
		}
		li.classList.remove("ready");
		li.classList.add("opening");
		if (S.v && S.v.duel && S.v.duel.me) S.v.duel.me.today = r.today;
		show(`<b>Выпало:</b> ${esc(stepGift(r.chest))}`);
		setTimeout(() => {
			if (li.isConnected) {
				li.classList.remove("opening");
				li.classList.add("open");
			}
			chestBadge();
			const sp = root && root.querySelector(".arb-stl");
			if (sp && S.v) {
				const tmp = document.createElement("div");
				tmp.innerHTML = stepsHtml(S.v.duel);
				const n = tmp.querySelector(".arb-stl");
				if (n) sp.replaceWith(n);
			}
		}, 700);
	}

	function chestBadge() {
		try {
			const t = S && S.v && S.v.duel && S.v.duel.me && S.v.duel.me.today,
				n = t && Array.isArray(t.ready) ? t.ready.length : 0;

			const bd = S && S.v && S.v.duel && S.v.duel.bdg;
			if (bd && window.LGArenaN) {
				bd.ch = n;
				if (window.LGArenaN.view(S.v, S.screen === "main")) {
					document
						.querySelectorAll('[data-gu="arena"][data-arb-n]')
						.forEach((b) => {
							delete b.dataset.arbN;
						});
					return;
				}
			}
			document.querySelectorAll('[data-gu="arena"]').forEach((b) => {
				if (n) {
					b.dataset.arbN = String(n);
					b.setAttribute("aria-description", `сундуков можно забрать: ${n}`);
				} else {
					delete b.dataset.arbN;
					b.removeAttribute("aria-description");
				}
			});
		} catch (e) {}
	}

	function buyHtml(d) {
		const t = d.me.today || {},
			price = +t.price || 0;
		return `<div class="arb-plate arb-buy ar-why" role="status"><span class="arb-buyt"><b>Бои закончились, новые в 00:00 по Москве</b><span>через <span class="arb-clk" data-until="${Date.now() + (+t.resetIn || 0)}">${hms(+t.resetIn || 0)}</span>${t.buy ? ` · куплено сегодня: ${t.buy}` : ""}</span></span>
      ${price > 0 ? `<button type="button" class="arb-btn sm" data-ar="buy" data-price="${price}">${ic("plus", 18)}Купить бой · ${esc(moneyTxt(price))}</button>` : ""}</div>`;
	}

	let refT = 0;
	function refTick() {
		clearTimeout(refT);
		refT = 0;
		const b = root && root.querySelector('[data-ar="refresh"][data-until]');
		if (!b) return;
		const left = +b.dataset.until - Date.now(),
			t = b.querySelector(".arb-rt");
		if (left <= 0) {
			delete b.dataset.until;
			b.disabled = !(S.v && S.v.duel && S.v.duel.me && S.v.duel.me.hero);
			if (t) t.textContent = "Обновить";
			return;
		}
		if (t) t.textContent = `через ${mmss(left)}`;
		const BG = SU.bg,
			hidden = !!(BG && BG.state && BG.state() === "hidden");
		refT = setTimeout(
			refTick,
			hidden
				? Math.max(1000, left)
				: Math.min(1000, left - Math.floor(left / 1000) * 1000 || 1000),
		);
	}

	const prizeText = (p) =>
		p
			? [
					...(p.items || []).map(
						(x) => `${x.name}${x.n > 1 ? ` ×${x.n}` : ""}`,
					),
					p.tokens
						? `${p.tokens} ${SU.plural(p.tokens, "жетон", "жетона", "жетонов")}`
						: "",
				]
					.filter(Boolean)
					.join(", ")
			: "";
	function weekHtml(d) {
		const W = d && d.week;
		if (!W) return `<h3 class="arb-pt">${ic("cup", 22)}Рейтинг недели</h3>`;
		const by = Object.fromEntries((W.list || []).map((r) => [r.place, r]));
		const row = (P) => {
			const r = by[P.place];
			return `<li class="arb-rk${r && r.me ? " me" : ""}"><span class="arb-medal g${P.place}">${P.place}</span><span class="arb-rn"><b class="ar-n">${r ? esc(r.name) : "место свободно"}</b>
      <small>${r && r.squad ? `<span class="arb-wsq">${esc(r.squad)}</span> · ` : ""}${r ? `очки ${signed(r.pts)} · ${r.w}/${r.l} · ` : ""}<span class="arb-prz">${esc(prizeText(P))}${P.half ? " · отряду 50%" : ""}</span></small></span></li>`;
		};
		const me = W.me,
			mine =
				me && !(W.list || []).some((r) => r.me)
					? `<span class="arb-rk arb-me"><span class="arb-medal">${me.place || "-"}</span><span class="arb-rn"><b>${me.place ? `Ты - ${me.place} место` : "Ты - ещё без боёв на этой неделе"}</b><small>очки ${signed(me.pts)} · побед ${me.w}, поражений ${me.l}</small></span></span>`
					: "";
		return `<h3 class="arb-pt">${ic("cup", 22)}Рейтинг недели</h3>
      <p class="arb-mute arb-wend">Итог через <span class="arb-clk" data-until="${Date.now() + (+W.endIn || 0)}">${hms(+W.endIn || 0)}</span> · награды - лично игрокам 1-3 места</p>
      <button type="button" class="arb-pbtn" data-ar="week" aria-haspopup="dialog" aria-label="Рейтинг недели целиком">
      <ol class="arb-rks">${(W.prizes || []).map(row).join("")}</ol>${mine}</button>
      <button type="button" class="arb-btn cream sm arb-topall" data-ar="top" aria-haspopup="dialog">${ic("cup", 18)}Топ арены</button>`;
	}

	const shortNick = (n) => {
		const t = String(n || "");
		return t.length > 8 ? t.slice(0, 7) + "…" : t;
	};
	function miniTeam(team, who) {
		if (!Array.isArray(team) || !team.length)
			return '<span class="arb-mute">без отряда</span>';
		return `<span class="arb-mt" role="list" aria-label="Отряд">${team
			.map(
				(
					h,
				) => `<span class="arb-mh${h.login === who ? " me" : ""}" role="listitem" title="${esc(`${h.name} - ${ROLE[h.role] || h.role}, ${h.level} ур.${h.lead ? ", глава" : ""}`)}">
      <span class="arb-mhf" aria-hidden="true">${F() && F().figure ? F().figure(h) : ""}</span>
      <span class="arb-mhm"><span class="ar-ico r-${esc(h.role)}" aria-hidden="true"></span><b>${h.level}</b></span>
      <span class="arb-mhn">${esc(shortNick(h.name))}</span><span class="sr-only">${esc(`${h.name}, ${ROLE[h.role] || h.role}, ${h.level} ур.`)}</span></span>`,
			)
			.join("")}</span>`;
	}
	function weekWinHtml(W) {
		const P = Object.fromEntries((W.prizes || []).map((p) => [p.place, p]));
		const row = (r) => {
			const pz = r.place && P[r.place];
			return `<li class="arb-wr${r.me ? " me" : ""}"><span class="arb-wp">${r.place ? `<span class="arb-medal${r.place <= 3 ? ` g${r.place}` : ""}">${r.place}</span>` : '<span class="arb-medal">-</span>'}</span>
        <span class="arb-wn"><b class="ar-n">${esc(r.name)}</b>${r.me ? ' <span class="ar-you">ты</span>' : ""}${r.squad ? `<small class="arb-wsq">${esc(r.squad)}</small>` : ""}</span>
        <span class="arb-wt">${miniTeam(r.team, r.login)}</span>
        <span class="arb-wo" title="очки недели"><b>${signed(r.pts)}</b><small>очки</small></span><span class="arb-wl" title="побед / поражений">${r.w}/${r.l}</span>
        <span class="arb-wz">${pz ? `<span class="arb-prz">${esc(prizeText(pz))}</span>${pz.half ? `<small class="arb-half">отряду 50%: ${esc(prizeText(pz.half))}</small>` : ""}` : ""}</span></li>`;
		};
		const list = W.list || [],
			me = W.me,
			out = me && !list.some((r) => r.me);
		const last =
			W.last && W.last.top && W.last.top.length
				? `<p class="arb-mute ar-pr">Прошлая неделя: ${W.last.top.map((t) => `${t.place}. ${esc(t.name || t.title || "")}`).join(", ")}</p>`
				: "";
		const free = [1, 2, 3]
			.filter((p) => !list.some((r) => r.place === p))
			.map(
				(p) =>
					`<li class="arb-wr free"><span class="arb-wp"><span class="arb-medal g${p}">${p}</span></span><span class="arb-wn"><span class="arb-mute">место свободно</span></span><span class="arb-wt"></span><span class="arb-wo"></span><span class="arb-wl"></span><span class="arb-wz"><span class="arb-prz">${esc(prizeText(P[p]))}</span>${P[p] && P[p].half ? `<small class="arb-half">отряду 50%: ${esc(prizeText(P[p].half))}</small>` : ""}</span></li>`,
			)
			.join("");
		return `${mHead("Рейтинг недели", `игроков: ${W.total || 0} · итог через <span class="arb-clk" data-until="${Date.now() + (+W.endIn || 0)}">${hms(+W.endIn || 0)}</span>`)}
      <div class="ar-tw arb-wkw"><div class="arb-wh" aria-hidden="true"><span>#</span><span>Игрок</span><span>Отряд</span><span>Очки</span><span>П/П</span><span>Награда</span></div>
      <ol class="arb-wkl" aria-label="Игроки недели">${list.map(row).join("")}${free}${out ? `<li class="arb-wgap" aria-hidden="true">…</li>${row(me)}` : ""}</ol></div>
      <p class="arb-mute ar-pr">Очки - сумма изменений твоего рейтинга за неделю: твои нападения и оборона, когда напали на тебя. Итог - в понедельник в 00:00 по Москве: награда места - игроку 1-3 места лично, его отряду - 50% (вниз; несколько мест в одном отряде - 50% от лучшего). Всё приходит в сумку, бои с ботами не в счёт.${+W.reset ? ` Рейтинг сбрасывается к ${+W.reset} каждый понедельник после итогов.` : ""}</p>${last}`;
	}
	async function openWeek(from) {
		const w = modalOpen(
			`${mHead("Рейтинг недели")}${SU.note("Загружаем рейтинг недели…")}`,
			"Рейтинг недели",
			from,
		);
		modal.kind = "week";
		w.classList.add("top", "week");
		if (window.LGArenaN) window.LGArenaN.week();
		const r = await X.api("/api/arena/top");
		if (!modal || modal.w !== w) return;
		const W = (r && r.ok && r.week) || (S.v && S.v.duel && S.v.duel.week);
		modalSet(
			W ? weekWinHtml(W) : `${mHead("Рейтинг недели")}${SU.note(errText(r))}`,
		);
		const me = w.querySelector(".arb-wr.me");
		if (me && me.scrollIntoView) me.scrollIntoView({ block: "nearest" });
		clkTick();
	}

	const SW_ORDER = [3, 4, 1, 2, 0];
	function swSlots(m) {
		const sq = m.squad;
		if (!sq)
			return [m.self ? { ...m.self, me: true } : null, null, null, null, null];
		const by = Object.fromEntries(sq.members.map((h) => [h.login, h]));
		const fd = m.forms && m.forms.def;
		if (
			sq.full &&
			fd &&
			Array.isArray(fd.slots) &&
			fd.slots.every((l) => by[l])
		)
			return fd.slots.map((l) => by[l]);

		const pre = m.forms && m.forms.pre;
		if (
			!sq.full &&
			Array.isArray(pre) &&
			pre.length === 5 &&
			sq.members.every((h) => pre.includes(h.login)) &&
			pre.filter(Boolean).every((l) => by[l])
		)
			return pre.map((l) => (l ? by[l] : null));
		const lead = by[sq.lead] || sq.members[0];
		return [
			lead,
			...sq.members.filter((h) => h !== lead),
			null,
			null,
			null,
			null,
		].slice(0, 5);
	}
	function defHtml(d) {
		const m = d && d.me;
		if (!m)
			return `<h3 class="arb-pt">${ic("shield", 22)}Состав обороны и атаки</h3>`;
		const sq = m.squad,
			team = (d.rules && d.rules.team) || 5,
			n = sq ? sq.members.length : 0;
		const canInv = (!sq || !sq.full) && m.hero;
		const L = window.LGArenaLocs,
			loc = L && L.has(d.loc) ? d.loc : "colosseum",
			bg = L ? L.bg(loc, "stage") || "" : "";
		const slots = swSlots(m);
		const fig = (h, i) => {
			if (!h)
				return `<button type="button" class="ar-sw-h ar-sw-ghost p${i}" data-ar="invslot" data-slot="${i}"${canInv ? "" : " disabled"} aria-label="Свободное место - пригласить игрока">
        <span class="ar-sw-f"><span class="arb-tok" aria-hidden="true">${ic("plus", 30)}</span></span><span class="ar-sw-lb"><span class="ar-sw-n">Пригласить</span></span></button>`;
			const role = ROLE[h.role] || h.role;
			return `<button type="button" class="ar-sw-h p${i}${h.me ? " me" : ""}${h.lead ? " ld" : ""}${h.bot ? " bot" : ""}" data-hero="${esc(h.login)}" data-slot="${i}" aria-haspopup="dialog"
        aria-label="${esc(h.name)} - ${esc(role)}, ${h.level} ур.${h.lead ? ", глава" : ""}${h.me ? ", это ты" : ""}. Снаряжение и навыки">
        <span class="ar-sw-f">${F() && F().figure ? F().figure(h) : `<span class="ar-ico r-${esc(h.role)}"></span>`}</span>
        <span class="ar-sw-lb"><b class="ar-sw-lv" title="уровень">${h.level}</b><span class="ar-sw-n" title="${esc(h.name)}">${esc(h.name)}</span>${h.me ? '<span class="ar-sw-tag">ты</span>' : h.bot ? '<span class="ar-sw-tag">бот</span>' : ""}</span></button>`;
		};
		const inv = (m.invites || [])
			.map(
				(
					v,
				) => `<li class="ar-inv"><span><b>${esc(v.fromName)}</b> зовёт в отряд (${v.n} из ${team})</span>
      <span class="ar-btns"><button type="button" class="arb-btn sm" data-acc="${esc(v.sq)}">Принять</button><button type="button" class="arb-btn cream sm" data-dec="${esc(v.sq)}">Отказаться</button></span></li>`,
			)
			.join("");
		const full = !!(sq && sq.full),
			fd = m.forms && m.forms.def;

		return `<div class="arb-dh"><h3 class="arb-pt">${ic("shield", 22)}Состав обороны и атаки <span class="arb-n">${n} из ${team}</span></h3>
        <span class="ar-btns">${sq ? '<button type="button" class="arb-btn cream sm ar-leave" data-ar="sqleave">Покинуть отряд</button>' : m.hero ? `<button type="button" class="arb-btn cream sm" data-ar="find" aria-haspopup="dialog">Найти отряд</button>` : ""}<button type="button" class="arb-btn sm" data-ar="invite"${m.hero ? "" : " disabled"} aria-haspopup="dialog">${ic("plus", 18)}Пригласить</button></span></div>
      ${inv ? `<ul class="ar-invs">${inv}</ul>` : ""}
      <div class="ar-sw arb-scene" data-loc="${esc(loc)}" data-squad="" role="group" aria-label="Отряд клином: передний в центре, по двое по бокам - нажми, чтобы открыть отряд">${bg}
        <div class="ar-sw-in">${SW_ORDER.map((i) => fig(slots[i], i)).join("")}</div>
        ${L ? `<span class="ar-sw-loc">${esc(L.name(loc))}</span>` : ""}</div>
      <div class="arb-df">
        <span class="arb-mute">${!sq ? "Ты пока не в отряде - позови игроков канала." : !full ? `Нужно ещё ${team - n} - оборону ставит полный отряд.` : fd && fd.auto ? "Оборона стоит автостроем - расставь её сам." : "Оборона сохранена. Нажми на героя - снаряжение и навыки."}</span>
        <button type="button" class="arb-btn cream sm ar-defbtn" data-ar="def"${full ? "" : " disabled"}>${ic("wedge", 18)}Расставить</button></div>`;
	}

	function logList(d, v) {
		const q = ((v && v.mine) || []).map((f) => ({ ...f, queue: true }));
		return [...((d && d.mine) || []), ...q].sort((a, b) => b.at - a.at);
	}

	const rvBtn = (f) =>
		`<button type="button" class="arb-btn red sm arb-rv" data-rv="${esc(String(f.id))}" aria-label="Месть отряду ${esc(f.atkName)} - ответный бой, тратит бой дня">${ic("swords", 16)}Месть</button>`;
	function logHtml(d, v) {
		const list = logList(d, v);
		const row = (f) => {
			if (f.queue) {
				const w = f.my && f.my.win;
				return `<li><button type="button" class="arb-lr ar-row" data-fight="${esc(String(f.id))}"><b class="${w ? "win ar-win" : "lose ar-lose"}">${f.my ? (w ? "Победа" : "Поражение") : "Бой"}</b><span class="arb-lt">командный бой (прежняя очередь)</span><span class="arb-lw">${ago(f.at)}</span></button></li>`;
			}
			const atk = f.side === "atk",
				w = !!f.win;
			const res = atk
				? w
					? "Победа"
					: "Поражение"
				: w
					? "Отбились"
					: "Не устояли";
			const txt = atk
				? `ты напал на отряд ${f.defName}`
				: `на тебя напал ${f.atkName}`;
			return `<li><button type="button" class="arb-lr ar-row" data-fight="${esc(String(f.id))}" aria-label="${esc(res)}: ${esc(txt)}, ${f.test ? "тестовый бой" : `рейтинг ${signed(f.d)}`} - смотреть повтор"><b class="${w ? "win ar-win" : "lose ar-lose"}">${res}</b><span class="arb-lt">${esc(txt)}</span><b class="${f.test ? "arb-lw" : w ? "win" : "lose"}">${f.test ? "тест" : signed(f.d)}</b><span class="arb-lw" title="${esc(dt(f.at))}">${ago(f.at)}</span></button>${f.rv ? rvBtn(f) : ""}</li>`;
		};
		return `<h3 class="arb-pt">${ic("scroll", 22)}Журнал битв</h3>
      ${
				!d || !d.me
					? ""
					: list.length
						? `<ul class="arb-logs ar-list">${list.slice(0, 6).map(row).join("")}</ul>
        <button type="button" class="arb-btn cream sm arb-topall" data-ar="log" aria-haspopup="dialog">${ic("scroll", 18)}Весь журнал</button>`
						: '<p class="arb-mute ar-pr">Нападений и обороны пока не было.</p>'
			}`;
	}

	function lockHtml(d) {
		const m = d && d.me;
		if (!m) return "";
		const min = (d.rules && d.rules.minLevel) || 5,
			lv = m.self ? +m.self.level || 0 : 0;
		if (m.hero && lv >= min) return "";
		return `<div class="arb-lock" role="note"><p class="arb-plate">Арена открывается с ${min} уровня${m.hero ? ` - у тебя ${lv}` : ""}</p></div>`;
	}

	function squadOf(login) {
		const d = S.v && S.v.duel,
			m = d && d.me;
		if (!login) {
			if (!m) return null;
			const sq = m.squad,
				slots = swSlots(m).filter(Boolean);
			return {
				own: true,
				title: "Состав обороны и атаки",
				lead: sq ? sq.lead : "",
				heroes: slots,
				full: !!(sq && sq.full),
				slots: slots.map((h) => h.login),
				n: sq ? sq.members.length : slots.length,
			};
		}
		const o = ((d && d.offers) || []).find((x) => x.login === login);
		if (!o) return null;
		return {
			own: false,
			title: o.title || o.name,
			heroes: o.def || [],
			full: true,
			slots: (o.def || []).map((h) => h.login),
			rating: o.rating,
			n: (o.def || []).length,
		};
	}
	async function openSquad(login, from, pick) {
		const q = squadOf(login);
		if (!q) {
			X.toast("Этого отряда уже нет в списке - обнови соперников", true);
			return;
		}
		const team = (S.v.duel.rules && S.v.duel.rules.team) || 5;
		const edit = q.own && q.full;
		const html = `${mHead(esc(q.title), `${q.n} из ${team}${q.rating != null ? ` · рейтинг ${q.rating}` : ""} · ${edit ? "перетащи героя на другое место - так отряд встанет в бою" : "нажми на героя - снаряжение и навыки"}`)}
      <div class="ar-bw ar-wedge"></div>
      ${edit || (q.own && q.n) ? `<div class="ar-btns">${edit ? '<button type="button" class="arb-btn sm" data-ar="sqsave" disabled>Сохранить порядок</button><span class="arb-mute ar-sqsn">Порядок - для обороны и нападения</span>' : ""}${q.own && S.v.duel.me.squad ? '<button type="button" class="arb-btn cream sm ar-leave" data-ar="sqleave">Покинуть отряд</button>' : ""}</div>` : ""}
      <ul class="ar-bl" aria-label="Герои отряда">${q.heroes.map((h) => `<li><button type="button" class="ar-blh" data-pick="${esc(h.login)}" aria-pressed="false"><b class="ar-sw-lv">${h.level}</b><span class="ar-blm"><b>${esc(h.name)}</b><small>${esc(ROLE[h.role] || h.role)}${h.lead ? " · глава" : ""}${h.me ? " · ты" : ""}</small></span></button></li>`).join("")}</ul>
      <div class="ar-bc" aria-live="polite"></div>`;
		const w = modalOpen(html, q.title, from);
		modal.kind = "squad";
		w.classList.add("squad");
		let slots = q.slots.slice();
		const L = window.LGArenaLocs,
			dl = S.v.duel.loc,
			loc = L && L.has(dl) ? dl : "colosseum";
		F().wedge(w.querySelector(".ar-bw"), {
			heroes: q.heroes,
			slots,
			title: q.own ? "Клин твоего отряда" : `Клин: ${q.title}`,
			readonly: !edit,
			mirror: !q.own,
			skin: true,
			bg: L ? L.bg(loc, "stage") : "",
			onChange: (sl) => {
				slots = sl;
				const b = w.querySelector('[data-ar="sqsave"]');
				if (b) b.disabled = false;
			},
		});
		w.querySelectorAll('[data-ar="sqleave"]').forEach((b) => {
			b.onclick = () => askLeave(null);
		});
		const save = w.querySelector('[data-ar="sqsave"]');
		if (save)
			save.onclick = async () => {
				if (save.getAttribute("aria-busy") === "true") return;
				save.setAttribute("aria-busy", "true");
				const a = await post({ op: "form", kind: "def", slots }, null);
				const b = a
					? await post({ op: "form", kind: "atk", slots }, null)
					: null;
				save.removeAttribute("aria-busy");
				if (!a || !b) return;
				save.disabled = true;
				X.toast(
					"Порядок сохранён - так отряд встанет в обороне и при нападении",
				);
				void load();
			};
		const showHero = async (l, btn) => {
			w.querySelectorAll("[data-pick]").forEach((x) =>
				x.setAttribute("aria-pressed", String(x.dataset.pick === l)),
			);
			const box = w.querySelector(".ar-bc");
			box.innerHTML = SU.note("Загружаем героя…");
			const r = await X.api("/api/arena/hero?login=" + encodeURIComponent(l));
			if (!modal || modal.w !== w) return;
			box.innerHTML = r && r.ok ? cardBody(r.hero) : SU.note(errText(r));
			box.querySelectorAll("[data-kick]").forEach((b) => {
				b.onclick = () => {
					modalClose();
					void act({ op: "kick", login: b.dataset.kick }, null);
				};
			});
			if (btn && box.scrollIntoView) box.scrollIntoView({ block: "nearest" });
		};
		w.querySelectorAll("[data-pick]").forEach((b) => {
			b.onclick = () => void showHero(b.dataset.pick, b);
		});
		const first =
			pick && q.heroes.some((h) => h.login === pick)
				? pick
				: q.heroes[0] && q.heroes[0].login;
		if (first) void showHero(first, null);
	}

	function openLog(from) {
		const v = S.v,
			d = v && v.duel,
			list = logList(d, v);
		const row = (f) => {
			const atk = f.side === "atk",
				w0 = f.queue ? !!(f.my && f.my.win) : !!f.win;
			const res = f.queue
				? w0
					? "Победа"
					: "Поражение"
				: atk
					? w0
						? "Победа"
						: "Поражение"
					: w0
						? "Отбились"
						: "Не устояли";
			const txt = f.queue
				? "командный бой (прежняя очередь)"
				: atk
					? `ты напал на отряд ${f.defName}`
					: `на тебя напал ${f.atkName}`;
			return `<li class="ar-lgr"><b class="${w0 ? "win" : "lose"}">${res}</b><span class="ar-lgt"><span>${esc(txt)}</span><small>${esc(dt(f.at))} · ${rounds(f.rounds)}${f.queue ? "" : f.test ? " · тестовый бой" : ` · рейтинг ${signed(f.d)}`}</small></span>
        ${f.rv ? rvBtn(f) : f.rvUsed ? '<span class="arb-mute arb-rvd">отомщено</span>' : ""}<button type="button" class="arb-btn cream sm" data-fight="${esc(String(f.id))}">Смотреть</button></li>`;
		};
		const w = modalOpen(
			`${mHead("Журнал битв", `боёв: ${list.length} · повтор - пока запись хранится`)}${list.length ? `<ul class="ar-lgl">${list.map(row).join("")}</ul>` : SU.note("Нападений и обороны пока не было.")}`,
			"Журнал битв",
			from,
		);
		modal.kind = "log";
		w.classList.add("log");
		w.querySelectorAll("[data-fight]").forEach((b) => {
			b.onclick = () => {
				const id = b.dataset.fight;
				modal.back = null;
				modalClose();
				void openFight(id);
			};
		});
		w.querySelectorAll("[data-rv]").forEach((b) => {
			b.onclick = () => void revenge(b.dataset.rv, b);
		});
	}

	function callsHtml(d) {
		const list = (d && d.calls) || [],
			m = d && d.me;
		if (!list.length || !m) return "";
		return `<div class="arb-plate ar-calls"><h4 class="ar-h4">Отряды зовут</h4><ul class="ar-list">${list
			.map(
				(
					c,
				) => `<li class="ar-call"><span><b>Отряд ${esc(c.leadName)}</b> ищет ${c.need} ${SU.plural(c.need, "игрока", "игроков", "игроков")}</span>
      <button type="button" class="arb-btn cream sm" data-ask="${esc(c.sq)}"${c.asked || (m.squad && m.squad.members.length) || !m.hero ? " disabled" : ""}>${c.asked ? "Приглашение пришло" : "Хочу в отряд"}</button></li>`,
			)
			.join("")}</ul>
      <p class="arb-mute ar-pr">В чате Twitch - «вотряд» и ник главы.</p></div>`;
	}

	function botsHtml(v) {
		const b = v && v.bots;
		if (!b) return "";
		const room = Math.max(0, (b.max || 3) - (b.squads || 0));
		return `<section class="arb-panel ar-bots" aria-label="Тестовые боты"><h3 class="arb-pt">${ic("bot", 22)}Тестовые боты <span class="arb-n">только админу</span></h3>
      <p class="arb-mute ar-pr">Ботов: ${b.n || 0}, отрядов ботов: ${b.squads || 0} из ${b.max || 3}. Сила - как у твоего героя. Бой с ботами - тестовый: рейтинг и бои за сутки не меняются, игроки ботов не видят.</p>
      <div class="ar-btns"><label class="sr-only" for="arBotN">Отрядов-соперников</label><select id="arBotN" class="ar-botn">${[0, 1, 2, 3].map((n) => `<option value="${n}"${n === Math.min(2, room) ? " selected" : ""}${n > room ? " disabled" : ""}>${n ? `+${n} ${SU.plural(n, "отряд", "отряда", "отрядов")}` : "только свой отряд"}</option>`).join("")}</select>
        <button type="button" class="arb-btn sm" data-ar="botsadd">Добавить ботов</button>
        <button type="button" class="arb-btn cream sm" data-ar="botsclear"${b.n ? "" : " disabled"}>Убрать ботов</button></div></section>`;
	}
	async function bots(body, btn) {
		if (btn) btn.disabled = true;
		const r = await X.api("/api/arena/bots", body);
		if (btn) btn.disabled = false;
		if (!r || !r.ok) {
			X.toast(errText(r), true);
			return;
		}
		X.toast(
			body.op === "clear"
				? `Тестовые боты убраны: ${r.removed}`
				: `Ботов добавлено: ${r.added}${r.note ? " - " + r.note : ""}`,
		);
		await load();
	}

	const INV_TABS = [
		["nick", "По нику"],
		["fr", "Друзья"],
		["find", "Поиск"],
	];
	function inviteHtml() {
		const d = S.v && S.v.duel,
			m = d && d.me;
		if (!m)
			return `${mHead("Пригласить в отряд")}${SU.note("Войди через Twitch.")}`;
		const sq = m.squad,
			team = (d.rules && d.rules.team) || 5,
			can = (!sq || !sq.full) && m.hero,
			tab = S.invTab || "nick";
		const tabs = `<div class="arb-tabs" role="tablist" aria-label="Как позвать">${INV_TABS.map(([k, t]) => `<button type="button" role="tab" class="arb-tab${k === tab ? " on" : ""}" id="arTab-${k}" data-invtab="${k}" aria-selected="${k === tab}" aria-controls="arTabP" tabindex="${k === tab ? 0 : -1}">${t}</button>`).join("")}</div>`;
		let body;
		if (tab === "find") body = finderHtml(d);
		else if (!can)
			body = `<p class="arb-mute ar-pr">${!m.hero ? "Нужен герой этого канала - сначала сходи в поход." : "В отряде уже 5 игроков."}</p>`;
		else
			body = `<form class="ar-invite" data-ar="invform"><label class="sr-only" for="arInv">Ник игрока</label><input id="arInv" name="login" autocomplete="off" maxlength="26" placeholder="ник игрока канала" required>
        <button type="submit" class="arb-btn sm">Позвать</button></form>
        ${
					tab === "fr"
						? '<div class="ar-frslot"></div>'
						: sq
							? `<div class="ar-btns ar-frbtns"><button type="button" class="arb-btn cream sm" data-ar="call"${m.callIn > 0 ? ` disabled title="Снова позвать можно через ${esc(hm(m.callIn))}"` : ""}>${m.call ? "Зов отправлен" : "Позвать зрителей"}</button></div>
        <p class="arb-mute ar-pr ar-callnote">${m.call ? `Отряд виден всем на вкладке «Арена»; откликнулись: ${m.call.n}.` : "Или напиши в чат Twitch «отряд» - зрители ответят «вотряд" + " " + esc(sq.lead) + "» и получат приглашение."}</p>`
							: ""
				}`;
		return `${mHead("Пригласить в отряд", sq ? `в отряде ${sq.members.length} из ${team}` : "отряд появится с первым, кто примет приглашение")}
      ${tabs}<div class="arb-tabp" id="arTabP" role="tabpanel" aria-labelledby="arTab-${tab}">${body}</div>
      ${m.sent && m.sent.length ? `<p class="arb-mute ar-pr">Ждём ответа: ${m.sent.map((x) => esc(x.name)).join(", ")}</p>` : ""}
      ${sq ? '<button type="button" class="arb-btn cream sm ar-leave" data-ar="sqleave">Покинуть отряд</button>' : ""}`;
	}
	function finderHtml(d) {
		const m = d.me,
			f = d.finder || { lf: [], open: [], mine: {} },
			mi = f.mine || {},
			sq = m.squad,
			full = !!(sq && sq.full);
		const lead = !!(sq && sq.lead === m.login),
			canPull = m.hero && (!sq || (lead && !full));
		const sw = (k, on, text, dis, note) =>
			`<label class="arb-sw${dis ? " dis" : ""}"><input type="checkbox" role="switch" data-fsw="${k}"${on ? " checked" : ""}${dis ? " disabled" : ""}><span class="arb-swk" aria-hidden="true"></span><span>${text}${note ? `<small>${esc(note)}</small>` : ""}</span></label>`;
		const lf = (
			x,
		) => `<li class="ar-fr"><span class="ar-frn"><b class="ar-n">${esc(x.name)}</b><span class="muted">${esc(ROLE[x.role] || x.role)}, ${x.level} ур.${x.power ? ` · сила ${big(x.power)}` : ""}</span></span><span class="muted ar-frw">${ago(x.at)}</span>
      <button type="button" class="arb-btn sm" data-pull="${esc(x.login)}"${canPull ? "" : " disabled"}>Позвать</button></li>`;
		const op = (
			x,
		) => `<li class="ar-fr"><span class="ar-frn"><b class="ar-n">${esc(x.title)}</b><span class="muted">уровни ${x.levels.join(", ")}</span></span><span class="muted ar-frw">${x.free} ${SU.plural(x.free, "место", "места", "мест")}</span>
      <button type="button" class="arb-btn sm" data-sqjoin="${esc(x.sq)}"${!sq && m.hero ? "" : " disabled"}>Вступить</button></li>`;
		return `<div class="arb-sws">${sw("lfg", mi.lf, "Я ищу отряд", !!sq || !m.hero, sq ? "ты уже в отряде" : "тебя увидят главы отрядов")}
      ${sw("recruit", mi.open, "Открыть набор", !lead || full, !sq ? "сначала собери отряд" : !lead ? "открывает глава отряда" : full ? "отряд собран" : "отряд увидят игроки без отряда")}</div>
      <h4 class="ar-h4">Ищут отряд <span class="arb-n">${f.lf.length}</span></h4>
      ${f.lf.length ? `<ul class="ar-frl">${f.lf.map(lf).join("")}</ul>` : '<p class="arb-mute ar-pr">Пока никто - включи «Я ищу отряд», чтобы тебя нашли.</p>'}
      ${canPull ? "" : `<p class="arb-mute ar-pr">${sq && !lead ? "Звать из поиска может глава отряда." : full ? "Отряд собран." : ""}</p>`}
      <h4 class="ar-h4">Набирают в отряд <span class="arb-n">${f.open.length}</span></h4>
      ${f.open.length ? `<ul class="ar-frl">${f.open.map(op).join("")}</ul>` : '<p class="arb-mute ar-pr">Открытых наборов нет - главы отрядов открывают его здесь же.</p>'}`;
	}
	function openInvite(from, friends, tab) {
		if (tab) S.invTab = tab;
		else if (friends) S.invTab = "fr";
		else if (!(modal && modal.kind === "inv") && !S.invTab) S.invTab = "nick";
		if (!(modal && modal.kind === "inv")) {
			const h0 = inviteHtml();
			modalOpen(h0, "Пригласить в отряд", from);
			modal.kind = "inv";
			modal.html = h0;

			const w0 = modal.w;
			void load().then(() => {
				if (modal && modal.w === w0) openInvite(null);
			});
		} else {
			const h1 = inviteHtml();
			if (h1 === modal.html) return;

			const i0 = modal.w.querySelector("#arInv"),
				val = i0 ? i0.value : "",
				foc = !!(i0 && document.activeElement === i0);
			modalSet(h1);
			modal.html = h1;
			const i1 = modal.w.querySelector("#arInv");
			if (i1 && val) i1.value = val;
			if (i1 && foc) i1.focus();
		}
		const w = modal.w;
		w.querySelectorAll('form[data-ar="invform"]').forEach((f) => {
			f.onsubmit = (e) => {
				e.preventDefault();
				const v = f.login.value.trim();
				if (v) void act({ op: "invite", login: v }, f.querySelector("button"));
			};
		});
		w.querySelectorAll('[data-ar="call"]').forEach((b) => {
			b.onclick = () => void act({ op: "call" }, b);
		});
		w.querySelectorAll('[data-ar="sqleave"]').forEach((b) => {
			b.onclick = () => askLeave(null);
		});
		const tabsEl = [...w.querySelectorAll("[data-invtab]")];
		tabsEl.forEach((b, i) => {
			b.onclick = () => {
				S.invTab = b.dataset.invtab;
				openInvite(null);
				const n = modal && modal.w.querySelector(`[data-invtab="${S.invTab}"]`);
				if (n) n.focus();
			};
			b.onkeydown = (e) => {
				const k = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
				if (!k) return;
				e.preventDefault();
				tabsEl[(i + k + tabsEl.length) % tabsEl.length].click();
			};
		});
		w.querySelectorAll("[data-fsw]").forEach((c) => {
			c.onchange = () => void act({ op: c.dataset.fsw, on: c.checked }, c);
		});
		w.querySelectorAll("[data-pull]").forEach((b) => {
			b.onclick = () => void act({ op: "pull", login: b.dataset.pull }, b);
		});
		w.querySelectorAll("[data-sqjoin]").forEach((b) => {
			b.onclick = () => void act({ op: "sqjoin", sq: b.dataset.sqjoin }, b);
		});
		if (S.invTab === "fr") {
			if (!(S.fr && S.fr.open)) {
				S.fr = { open: true, sent: {} };
				void loadFriends();
			} else renderFriends();
		}
		const i = w.querySelector("#arInv");
		if (i && from) i.focus();
	}

	let modal = null;
	function modalOpen(html, label, from) {
		modalClose();
		const w = document.createElement("div");
		w.className = "ar-mw8 arb gw-dk";
		w.dataset.gst = gst();
		w.innerHTML = `<div class="ar-dlg" role="dialog" aria-modal="true" aria-label="${esc(label)}" tabindex="-1">${html}</div>`;
		document.body.appendChild(w);
		const back = from && from.isConnected ? from : null;
		const key = (e) => {
			if (e.key === "Escape") {
				e.preventDefault();
				modalClose();
			}
		};
		w.addEventListener("click", (e) => {
			if (
				e.target === w ||
				(e.target.closest && e.target.closest('[data-ar="mx"]'))
			)
				modalClose();
		});
		document.addEventListener("keydown", key);
		modal = { w, back, key };
		const x = w.querySelector('[data-ar="mx"]');
		(x || w.querySelector(".ar-dlg")).focus();
		return w;
	}
	function modalSet(html) {
		if (!modal) return null;
		const d = modal.w.querySelector(".ar-dlg");
		d.innerHTML = html;
		const x = d.querySelector('[data-ar="mx"]');
		if (x) x.focus();
		return d;
	}
	function modalClose() {
		if (!modal) return;
		const m = modal;
		modal = null;
		document.removeEventListener("keydown", m.key);
		m.w.remove();
		if (m.back)
			try {
				m.back.focus();
			} catch (e) {}
	}
	const mHead = (title, sub) =>
		`<header class="ar-dh"><div class="ar-dt">${title}${sub ? `<span class="arb-mute">${sub}</span>` : ""}</div><button type="button" class="arb-btn cream sm ar-dx" data-ar="mx" aria-label="Закрыть">Закрыть</button></header>`;

	const GSLOTS = [
		["helmet", "Шлем"],
		["weapon", "Оружие"],
		["armor", "Доспех"],
		["shield", "Вторая рука"],
		["trinket", "Амулет"],
	];
	const RAR = {
		common: "обычное",
		uncommon: "необычное",
		rare: "редкое",
		epic: "эпическое",
		legendary: "легендарное",
	};
	function itemArt(it, sl) {
		const INV = window.LGInventory;
		try {
			if (INV && INV.art)
				return it
					? INV.art(it)
					: INV.EMPTY && INV.EMPTY[sl]
						? INV.art(INV.EMPTY[sl], "sil")
						: "";
		} catch (e) {}
		return "";
	}
	function cardHtml(h) {
		return `${mHead(esc(h.name), `${esc(h.roleName || ROLE[h.role] || h.role)}, ${h.level} ур. · рейтинг ${h.rating}${h.lead ? " · глава отряда" : ""}${h.bot ? " · тестовый бот" : ""}`)}${cardBody(h, true)}`;
	}
	function cardBody(h, noHead) {
		const m = S.v && S.v.duel && S.v.duel.me,
			my = m && m.squad;
		const by = {};
		for (const it of h.items || []) if (!by[it.slot]) by[it.slot] = it;
		const slots = GSLOTS.map(([sl, ru]) => {
			const it = by[sl];
			return `<div class="ar-gs${it ? " full" : ""}" data-gslot="${sl}"${it ? ` data-r="${esc(it.rarity)}"` : ""}>
        <span class="ar-gs-a" aria-hidden="true">${itemArt(it, sl)}${it && it.en > 0 ? `<i class="ar-gs-en">+${+it.en}</i>` : ""}</span>
        <span class="ar-gs-t"><span class="ar-gs-l">${ru}</span><b class="ar-gs-n">${it ? esc(it.name) : "пусто"}</b>${it ? `<span class="ar-gs-r">${esc(RAR[it.rarity] || "")}</span>` : ""}</span></div>`;
		}).join("");
		const sk = h.sk,
			T = sk && sk.tree;
		let skills;
		if (h.bot)
			skills =
				'<p class="muted ar-pr">Тестовый бот: вещей и навыков нет - сила как у героя администратора.</p>';
		else if (!T) skills = '<p class="muted ar-pr">Навыков пока нет.</p>';
		else {
			const rk = sk.t || {},
				spent = Object.values(rk).reduce((a, b) => a + (+b || 0), 0);
			const br = T.branches
				.map((B) => {
					const pts = B.nodes.reduce((a, n) => a + (+rk[n.id] || 0), 0);
					const ns = [...B.nodes]
						.sort((a, b) => (a.req || 0) - (b.req || 0))
						.map((n) => {
							const r = +rk[n.id] || 0;
							return `<li class="ar-skn${r ? " has" : ""}${r >= n.max ? " max" : ""}" title="${esc(n.name)}: ранг ${r} из ${n.max}"><span class="ar-skn-n">${esc(n.name)}</span><span class="ar-skn-r" aria-label="ранг ${r} из ${n.max}">${Array.from({ length: n.max }, (_, i) => `<i${i < r ? ' class="f"' : ""}></i>`).join("")}</span></li>`;
						})
						.join("");
					return `<section class="ar-skb${pts ? " on" : ""}" aria-label="Ветка ${esc(B.name)}"><h5 class="ar-skbh">${B.icon ? `<span aria-hidden="true">${esc(B.icon)}</span>` : ""}${esc(B.name)}<b>${pts}</b></h5><ul>${ns}</ul></section>`;
				})
				.join("");
			skills = `<p class="muted ar-pr">Дерево «${esc(T.name)}» · вложено очков: <b>${spent}</b>${spent ? "" : " - навыки не выбраны"}</p><div class="ar-skt">${br}</div>`;
		}
		const kick =
			my &&
			my.lead === m.login &&
			h.login !== m.login &&
			my.members.some((x) => x.login === h.login);
		return `${noHead ? "" : `<h4 class="ar-h4 ar-bch">${esc(h.name)} <span class="arb-mute">${esc(h.roleName || ROLE[h.role] || h.role)}, ${h.level} ур. · рейтинг ${h.rating}${h.bot ? " · тестовый бот" : ""}</span></h4>`}
      <div class="ar-hc"><div class="ar-hcf" aria-hidden="true">${F() && F().figure ? F().figure(h) : ""}</div>
        <section class="ar-hcg" aria-label="Снаряжение"><h4 class="ar-h4">Снаряжение</h4><div class="ar-gss">${slots}</div></section></div>
      ${h.arena ? `<p class="ar-pr arb-hst"><b>На Арене:</b> здоровье ${big(h.arena.hp)}, атака ${big(h.arena.atk)}, магия ${big(h.arena.mag)}, броня ${big(h.arena.def)} <span class="arb-mute">· еда, зелья, свитки и другие временные баффы на Арене не действуют</span></p>` : ""}
      <section class="ar-hcs" aria-label="Навыки"><h4 class="ar-h4">Навыки</h4>${skills}</section>
      ${kick ? `<div class="ar-btns"><button type="button" class="arb-btn cream sm" data-kick="${esc(h.login)}">Исключить из отряда</button></div>` : ""}`;
	}
	async function openCard(login, from) {
		const w = modalOpen(
			`${mHead("Герой")}${SU.note("Загружаем героя…")}`,
			"Герой",
			from,
		);
		const r = await X.api("/api/arena/hero?login=" + encodeURIComponent(login));
		if (!modal || modal.w !== w) return;
		const d = modalSet(
			r && r.ok ? cardHtml(r.hero) : `${mHead("Герой")}${SU.note(errText(r))}`,
		);
		if (!d) return;
		d.setAttribute("aria-label", r && r.ok ? `Герой ${r.hero.name}` : "Герой");
		d.querySelectorAll("[data-kick]").forEach((b) => {
			b.onclick = () => {
				modalClose();
				void act({ op: "kick", login: b.dataset.kick }, null);
			};
		});
	}

	function topHtml(r) {
		const row = (t) =>
			`<tr${t.me ? ' class="me"' : ""}><td>${t.place || "-"}</td><td class="ar-n">${esc(t.name)}${t.me ? ' <span class="ar-you">ты</span>' : ""}${t.squad ? `<span class="muted ar-tsq">${esc(t.squad)}</span>` : ""}</td><td class="ar-tr">${t.r}</td><td>${t.w}/${t.l}</td></tr>`;
		const list = r.list || [],
			me = r.me,
			inList = me && list.some((t) => t.me);
		const body = list.length
			? list.map(row).join("")
			: '<tr><td colspan="4" class="muted">В рейтинге пока никого - стань первым.</td></tr>';
		const mine =
			me && !inList
				? `<tbody class="ar-tme"><tr class="gap" aria-hidden="true"><td colspan="4">…</td></tr>${row(me)}</tbody>`
				: "";
		return `${mHead("Топ арены", `игроков в рейтинге: ${r.total || 0}`)}
      <div class="ar-tw"><table class="ar-top ar-topw"><thead><tr><th>#</th><th>Игрок и отряд</th><th>Рейтинг</th><th>П/П</th></tr></thead><tbody>${body}</tbody>${mine}</table></div>
      ${me && !me.place ? '<p class="muted ar-pr">Ты ещё не бился на арене - место появится после первого боя.</p>' : ""}`;
	}
	async function openTop(from) {
		const w = modalOpen(
			`${mHead("Топ арены")}${SU.note("Загружаем рейтинг…")}`,
			"Топ арены",
			from,
		);
		w.classList.add("top");
		const r = await X.api("/api/arena/top");
		if (!modal || modal.w !== w) return;
		modalSet(
			r && r.ok ? topHtml(r) : `${mHead("Топ арены")}${SU.note(errText(r))}`,
		);
		const me = w.querySelector("tr.me");
		if (me && me.scrollIntoView) me.scrollIntoView({ block: "nearest" });
	}

	const MW_ORDER = [3, 4, 1, 2, 0],
		MW_COLS = [3, 1, 0, 2, 4];

	const nameBr = (n) =>
		esc(n)
			.replace(/([_\-.])(?=.)/g, "$1<wbr>")
			.replace(/([a-zа-яё\d])(?=[A-ZА-ЯЁ])/g, "$1<wbr>");

	let mwRo = null;
	function fitBand(b) {
		const w = b.clientWidth,
			ns = [...b.querySelectorAll(".ar-mw-n")];
		if (!w || !ns.length || +b.dataset.fw === w) return;
		b.dataset.fw = String(w);
		const phone =
				window.matchMedia && window.matchMedia("(max-width: 600px)").matches,
			max = phone ? 12 : 13,
			min = phone ? 9 : 10;
		ns.forEach((n) => {
			n.classList.remove("w2", "w2c", "cut");
			n.textContent = n.title;
		});
		const wide = () => ns.some((n) => n.scrollWidth > n.clientWidth + 0.5);
		let f = max;
		b.style.setProperty("--nf", f + "px");
		while (f > min && wide()) {
			f -= 0.5;
			b.style.setProperty("--nf", f + "px");
		}

		const tall = (n) => {
			n.style.display = "block";
			n.style.maxHeight = "none";
			const h = n.scrollHeight,
				lh = parseFloat(getComputedStyle(n).lineHeight) || 15;
			n.style.display = "";
			n.style.maxHeight = "";
			return h > lh * (n.closest(".arb-card") ? 3 : 2) + 1;
		};
		for (const n of ns)
			if (n.scrollWidth > n.clientWidth + 0.5) {
				n.innerHTML = nameBr(n.title);
				n.classList.add("w2");
				if (tall(n)) n.classList.add("w2c");
				if (tall(n)) n.classList.add("cut");
			}
	}
	function fitNames() {
		if (mwRo) {
			mwRo.disconnect();
			mwRo = null;
		}
		const bands = root ? [...root.querySelectorAll(".ar-mw-lbs")] : [];
		if (!bands.length) return;
		bands.forEach(fitBand);
		if (window.ResizeObserver) {
			mwRo = new ResizeObserver((es) => es.forEach((e) => fitBand(e.target)));
			bands.forEach((b) => mwRo.observe(b));
		}
	}
	function miniWedge(def) {
		const cls = (i) => `d${i === 0 ? 0 : i < 3 ? 1 : 2} p${i}`;
		const fig = (h, i) =>
			h
				? `<span class="ar-mw-h ${cls(i)}${i === 2 || i === 4 ? " r" : ""}" data-slot="${i}" title="${esc(h.name)} - ${esc(ROLE[h.role] || h.role)}, ${h.level} ур."><span class="ar-mw-f">${F() && F().figure ? F().figure(h) : `<span class="ar-ico r-${esc(h.role)}"></span>`}</span></span>`
				: `<span class="ar-mw-h ${cls(i)} ar-mw-ghost" data-slot="${i}" aria-hidden="true"><span class="ar-mw-f"><span class="ar-sil"></span></span></span>`;
		const lb = (i) => {
			const h = def[i];
			return h
				? `<span class="ar-mw-lb${h.lead ? " ar-mw-ld" : ""}" data-slot="${i}" aria-hidden="true"><b class="ar-mw-lv">${h.level}</b><span class="ar-mw-n" title="${esc(h.name)}">${esc(h.name)}</span></span>`
				: '<span class="ar-mw-lb" aria-hidden="true"></span>';
		};
		return `<div class="ar-mw" role="img" aria-label="${
			def.length
				? "Клин обороны: " +
					esc(
						def
							.filter(Boolean)
							.map((h) => `${h.name} (${ROLE[h.role] || h.role}, ${h.level})`)
							.join(", "),
					)
				: "Пусто"
		}"><div class="ar-mw-in">${MW_ORDER.map((i) => fig(def[i], i)).join("")}</div>${def.some(Boolean) ? `<div class="ar-mw-lbs">${MW_COLS.map(lb).join("")}</div>` : ""}</div>`;
	}

	function renderForm() {
		const d = S.v && S.v.duel,
			m = d && d.me;
		if (!m || !m.squad || !m.squad.full) {
			S.screen = "main";
			render();
			return;
		}
		const kind = S.screen === "def" ? "def" : "atk",
			f = m.forms[kind];
		const o =
			kind === "atk"
				? (d.offers || []).find((x) => x.login === S.target)
				: null;
		if (kind === "atk" && !o) {
			X.toast("Этого соперника уже нет в списке", true);
			S.screen = "main";
			render();
			return;
		}
		const slots = S.slots && S.slots.kind === kind ? S.slots.list : f.slots;

		const L = window.LGArenaLocs,
			loc = L && L.has(d.loc) ? d.loc : "colosseum";
		root.innerHTML = `<div class="ar ar2 arb gw-dk ar-form" data-gst="${gst()}"><button type="button" class="arb-btn cream sm ar-back" data-ar="back">← К арене</button>
      <header class="arb-panel ar-head arb-fh"><h2 class="arb-pt ar-h">${kind === "def" ? `${ic("shield", 24)}Состав обороны` : `${ic("swords", 24)}Нападение на ${esc(o.title || o.name)}`}</h2>
        <p class="arb-mute">${kind === "def" ? "Так твой отряд встретит тех, кто нападёт. Сила героев берётся в момент боя." : `Рейтинг соперника ${o.rating}: победа +${o.win}, поражение −${o.lose}.`}
        ${f.auto && !(S.slots && S.slots.kind === kind) ? " Сейчас стоит автострой - поменяй героев местами, как считаешь лучше." : ""}</p></header>
      ${kind === "atk" ? `<section class="arb-panel ar-foe"><h3 class="arb-pt">${ic("swords", 20)}Отряд соперника</h3><ul class="ar-mini wide">${o.squad.map((h) => `<li><span class="ar-ico r-${esc(h.role)}" aria-hidden="true"></span><b class="ar-n">${esc(h.name)}</b><span>${esc(ROLE[h.role] || h.role)}, ${h.level} ур.</span></li>`).join("")}</ul></section>` : ""}
      <section class="arb-panel ar-fsec"><h3 class="arb-pt">${ic("wedge", 20)}${kind === "def" ? "Клин обороны" : "Твой клин"} <span class="arb-n">впереди - ближе к врагу</span></h3><div class="ar-wedge"></div>
        <div class="ar-btns ar-fbtns"><button type="button" class="arb-btn cream" data-ar="auto">Автострой</button>
        ${kind === "def" ? '<button type="button" class="arb-btn" data-ar="save">Сохранить оборону</button>' : `<button type="button" class="arb-btn red ar-fight-go" data-ar="go">${ic("swords")}В бой</button>`}</div></section>
    </div>`;
		wedgeApi = F().wedge(root.querySelector(".ar-wedge"), {
			heroes: m.squad.members,
			slots,
			title: kind === "def" ? "Клин обороны" : "Клин нападения",
			skin: true,
			bg: L ? L.bg(loc, "stage") : "",
			onChange: (s) => {
				S.slots = { kind, list: s };
			},
		});
		root.querySelector('[data-ar="back"]').onclick = () => {
			S.slots = null;
			toMain();
		};
		root.querySelector('[data-ar="auto"]').onclick = () => {
			const kr = { melee: 0, ranged: 1, magic: 2, heal: 3 };
			const list = m.squad.members
				.map((h, i) => ({
					l: h.login,
					r: kr[F().KIND[h.role]] ?? 0,
					lv: h.level,
					i,
				}))
				.sort((a, b) => a.r - b.r || b.lv - a.lv || a.i - b.i)
				.map((x) => x.l);
			S.slots = { kind, list };
			wedgeApi.set(list);
		};
		const save = root.querySelector('[data-ar="save"]');
		if (save)
			save.onclick = async () => {
				const r = await post(
					{ op: "form", kind: "def", slots: wedgeApi.slots() },
					save,
				);
				if (!r) return;
				X.toast("Оборона сохранена - на тебя нападут против этого состава");
				S.slots = null;
				toMain();
			};
		const go = root.querySelector('[data-ar="go"]');
		if (go)
			go.onclick = async () => {
				const r = await post(
					{ op: "attack", target: o.login, slots: wedgeApi.slots() },
					go,
				);
				if (!r) return;
				S.slots = null;
				S.screen = "fight";
				S.fight = { id: r.id, f: r.fight };
				render();
				void load();
			};
		top();
	}

	function renderFight() {
		const Fi = S.fight,
			back =
				'<button type="button" class="btn ghost sm ar-back" data-ar="back">← К арене</button>';
		if (Fi.busy || Fi.err || !Fi.f || !Fi.f.log) {
			const body = Fi.busy
				? SU.note("Загружаем бой…")
				: Fi.err
					? SU.note(Fi.err)
					: Fi.f && Array.isArray(Fi.f.sides)
						? fightHtml(Fi.f)
						: SU.note("Запись боя больше не хранится");
			root.innerHTML = `<div class="ar ar2">${back}${body}</div>`;
			root.querySelector('[data-ar="back"]').onclick = toMain;
			return;
		}
		if (player && root.querySelector(".ar-play")) return;
		const f = Fi.f;
		const head =
			f.kind === "duel"
				? f.me === "def"
					? `${esc(f.atkName)} напал на твой отряд`
					: `Нападение на отряд ${esc(f.defName)}`
				: `Командный бой №${f.id}`;
		root.innerHTML = `<div class="ar ar2 ar-fightv">${back}<header class="ar-head"><h2 class="ar-h">${head}</h2><p class="muted">${dt(f.at)} · повтор по записи боя</p></header><div class="ar-play"></div></div>`;
		root.querySelector('[data-ar="back"]').onclick = toMain;
		const labels =
			f.kind === "queue"
				? { atk: "Первая команда", def: "Вторая команда" }
				: null;
		player = F().play(root.querySelector(".ar-play"), f, {
			onClose: toMain,
			...(labels ? { labels } : {}),
		});
		top();

		if (window.innerHeight < 900) {
			const a = root.querySelector(".af-top");
			if (a && a.scrollIntoView)
				setTimeout(() => a.scrollIntoView({ block: "start" }), 0);
		}
	}

	function fightHtml(f) {
		const me = f.sides.find((h) => h.me);
		const head = me
			? me.side === f.winner
				? '<b class="ar-win">Победа</b>'
				: '<b class="ar-lose">Поражение</b>'
			: `<b>Победила ${f.winner === "a" ? "первая" : "вторая"} команда</b>`;
		const why =
			f.why === "wipe"
				? "пала вся команда"
				: `предел раундов - больше здоровья осталось у ${f.winner === "a" ? "первой" : "второй"}`;
		const team = (side) => {
			const hs = f.sides.filter((h) => h.side === side);
			const lines = [0, 1, 2]
				.map(
					(li) =>
						`<div class="ar-line"><span class="ar-ln">${LINE[li]}</span><ul>${hs
							.filter((h) => h.line === li)
							.map(hero)
							.join("")}</ul></div>`,
				)
				.join("");
			return `<section class="ar-team${side === f.winner ? " won" : ""}"><h3 class="ar-h3">${side === "a" ? "Первая" : "Вторая"} команда${side === f.winner ? " - победа" : ""} <span class="muted">здоровье ${Math.round(f.hp[side] || 0)}%</span></h3>${lines}</section>`;
		};
		const hero = (
			h,
		) => `<li class="ar-hero${h.fell ? " fell" : ""}${h.me ? " me" : ""}"><b class="ar-n">${esc(h.name)}</b>
      <span class="muted">${esc(ROLE[h.role] || h.role)}, ${h.level} ур.${h.guildName ? " · " + esc(h.guildName) : ""}${h.shadow ? " · тень" : ""}${h.fell ? " · пал" : ""}</span>
      <span class="ar-nums">урон ${h.dealt}${h.healed ? ` · лечение ${h.healed}` : ""}${h.kills ? ` · сразил ${h.kills}` : ""}${h.shadow ? "" : h.capped ? " · без награды" : prize(h.coins, h.xp) ? " · " + prize(h.coins, h.xp) : ""}</span></li>`;
		const track = (f.track || [])
			.map(
				(t) =>
					`<li><span class="muted">р. ${t.r}</span> ${t.a ? `${esc(t.a)} сразил ${esc(t.d)}` : `${esc(t.d)} пал от яда`}</li>`,
			)
			.join("");
		return `<article class="ar-fight" aria-label="Итог боя"><header class="ar-fh">${head}<span class="muted">Бой №${f.id} · ${dt(f.at)} · ${rounds(f.rounds)} · ${why}</span></header>
      <div class="ar-teams">${team("a")}${team("b")}</div>
      ${track ? `<section class="ar-card"><h3 class="ar-h3">Ход боя</h3><ol class="ar-track">${track}</ol></section>` : ""}</article>`;
	}
	function bind() {
		const q = (s) => root.querySelectorAll(s);
		q('[data-ar="refresh"]').forEach((b) => {
			b.onclick = () => act({ op: "refresh" }, b);
		});

		q('[data-ar="botsadd"]').forEach((b) => {
			b.onclick = () => {
				const sel = root.querySelector(".ar-botn");
				void bots({ op: "add", n: sel ? +sel.value || 0 : 2 }, b);
			};
		});
		q('[data-ar="botsclear"]').forEach((b) => {
			b.onclick = () => void bots({ op: "clear" }, b);
		});
		q('[data-ar="def"]').forEach((b) => {
			b.onclick = () => {
				S.screen = "def";
				S.slots = null;
				render();
			};
		});
		q("[data-atk]").forEach((b) => {
			b.onclick = () => {
				S.screen = "atk";
				S.target = b.dataset.atk;
				S.slots = null;
				render();
			};
		});
		q("[data-acc]").forEach((b) => {
			b.onclick = () => act({ op: "accept", sq: b.dataset.acc }, b);
		});
		q("[data-dec]").forEach((b) => {
			b.onclick = () => act({ op: "decline", sq: b.dataset.dec }, b);
		});
		q("[data-ask]").forEach((b) => {
			b.onclick = () => act({ op: "ask", sq: b.dataset.ask }, b);
		});
		q("[data-fight]").forEach((b) => {
			b.onclick = () => openFight(b.dataset.fight);
		});

		q('[data-ar="top"]').forEach((b) => {
			b.onclick = () => void openTop(b);
		});
		q('[data-ar="invite"]').forEach((b) => {
			b.onclick = () => openInvite(b);
		});
		q('[data-ar="invslot"]').forEach((b) => {
			b.onclick = (e) => {
				e.stopPropagation();
				if (swDrag.skip) return;
				openInvite(b, true);
			};
		});

		q("[data-hero]").forEach((b) => {
			b.onclick = (e) => {
				e.stopPropagation();
				if (swDrag.skip) return;
				void openSquad("", b, b.dataset.hero);
			};
		});
		panelDrag();
		q(".ar-sw[data-squad]").forEach((el) => {
			el.onclick = (e) => {
				if ((e.target.closest && e.target.closest("button")) || swDrag.skip)
					return;
				void openSquad("", el);
			};
		});
		q("button[data-squad]").forEach((b) => {
			b.onclick = () => void openSquad(b.dataset.squad, b);
		});
		q('[data-ar="log"]').forEach((b) => {
			b.onclick = () => openLog(b);
		});

		q('[data-ar="week"]').forEach((b) => {
			b.onclick = () => openWeek(b);
		});
		q("[data-chest]").forEach((b) => {
			b.onclick = () => void chestClick(b);
		});
		q("[data-rv]").forEach((b) => {
			b.onclick = (e) => {
				e.stopPropagation();
				void revenge(b.dataset.rv, b);
			};
		});

		q('[data-ar="sqleave"]').forEach((b) => {
			b.onclick = () => askLeave(b);
		});
		q('[data-ar="find"]').forEach((b) => {
			b.onclick = () => openInvite(b, false, "find");
		});
		q('[data-ar="buy"]').forEach((b) => {
			b.onclick = () => {
				const p = +b.dataset.price || 0;
				window.LGSiteUi.ask({
					title: "Купить бой?",
					text: `Один бой арены за ${moneyTxt(p)}. Следующая докупка сегодня - вдвое дороже, в 00:00 по Москве цены сбросятся.`,
					yes: `Купить за ${moneyTxt(p)}`,
				}).then((ok) => {
					if (ok) void act({ op: "buy", price: p }, b);
				});
			};
		});
	}

	return {
		back(v) {
			if (!S) return;
			if (window.LGArena2) window.LGArena2.close();
			S.v2 = false;
			S.v = v;
			S.screen = "main";
			render();
		},
		open(el, x) {
			X = x;
			root = el;
			if (S && S.v2 && window.LGArena2) {
				window.LGArena2.open(el, x);
				return;
			}
			if (!S)
				S = {
					v: null,
					err: "",
					busy: false,
					fight: null,
					at: 0,
					screen: "main",
					slots: null,
					target: null,
					fr: null,
				};
			if (S.screen === "fight" && !player) S.screen = "main";
			render();
			void load();

			if (!onFocus) {
				onFocus = () => {
					if (S && S.screen === "main" && Date.now() - (S.at || 0) > 15e3)
						void load();
				};
				window.addEventListener("focus", onFocus);
			}
		},
		close() {
			if (window.LGArena2) window.LGArena2.close();
			if (onFocus) {
				window.removeEventListener("focus", onFocus);
				onFocus = null;
			}
			modalClose();
			clearTimeout(refT);
			refT = 0;
			clearTimeout(clkT);
			clkT = 0;
			if (mwRo) {
				mwRo.disconnect();
				mwRo = null;
			}
			if (player) {
				player.destroy();
				player = null;
			}
			if (S && S.screen === "fight") S.screen = "main";
		},
	};
})();
