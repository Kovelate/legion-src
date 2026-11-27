(() => {
	if (window.LGDailiesWin) return;
	let H = null;
	const $ = (s, r = document) => r.querySelector(s);
	const esc = (s) =>
		String(s == null ? "" : s).replace(
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
	const base = () => window.LG_BASE || "";
	async function j(r) {
		try {
			const x = await r.json();
			return x && typeof x === "object"
				? window.LGSiteUi && window.LGSiteUi.withCode
					? window.LGSiteUi.withCode(x)
					: x
				: { ok: false, error: "нет ответа" };
		} catch {
			return {
				ok: false,
				error:
					r.status === 429 ? "слишком часто - подожди немного" : "нет ответа",
			};
		}
	}
	const apiGet = () =>
		fetch(base() + "/api/dailies", { credentials: "same-origin" }).then(
			j,
			() => ({ ok: false, error: "нет связи" }),
		);
	const apiAct = (b) =>
		fetch(base() + "/api/dailies/act", {
			method: "POST",
			credentials: "same-origin",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(b),
		}).then(j, () => ({ ok: false, error: "нет связи" }));
	const money = (n) =>
		H && typeof H.money === "function" ? H.money(n) : esc(n) + " бронзы";
	const toast = (t, bad) => {
		if (H && typeof H.toast === "function") H.toast(t, bad);
	};
	const days = (n) => {
		const a = n % 10,
			b = n % 100;
		return (
			n +
			" " +
			(a === 1 && b !== 11
				? "день"
				: a >= 2 && a <= 4 && (b < 12 || b > 14)
					? "дня"
					: "дней")
		);
	};
	const ITEM_RU = {
		enchant_sphere: "Сфера сохранения",
		enchant_star: "Счастливая звезда",
	};

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

	let card = null,
		anchor = null,
		err = null,
		busy = false;
	const barEl = () => (H && H.bar ? H.bar() : null);
	const ICO = () => (H && H.ico) || {};

	function rowHtml(t) {
		const top = t.st[t.st.length - 1],
			nx = t.st.find((x) => t.n < x) || top,
			multi = t.of > 1;
		const pips = multi
			? `<span class="dlc-pp" aria-hidden="true">${t.st.map((x, k) => `<i class="${k < t.s ? "on" : ""}" title="${esc(x)}"></i>`).join("")}</span>`
			: "";
		const prog = t.done
			? '<span class="dlc-n is-ok">готово</span>'
			: `<span class="dlc-n">${esc(Math.min(t.n, nx))} / ${esc(nx)}</span>`;
		const steps = multi
			? ` <small>${t.st.map((x) => esc(x)).join(" / ")}${t.u ? " " + esc(t.u) : ""}</small>`
			: "";
		return (
			`<li class="dlc-t${t.done ? " is-done" : ""}"><span class="dlc-ck" aria-hidden="true">${t.done ? "✓" : ""}</span><span class="dlc-tt">${esc(t.t)}${steps}</span>${pips}${prog}` +
			`<span class="sr-only">${multi ? `ступеней ${t.s} из ${t.of}` : t.done ? "выполнено" : "не выполнено"}</span></li>`
		);
	}
	function fill() {
		if (!card || card.hidden) return;
		const body = $(".dlc-body", card);
		const data = err || (H && H.data ? H.data() : null);
		if (!data) {
			body.innerHTML = '<p class="dlc-sub">Загрузка…</p>';
			return;
		}
		if (!data.ok || !data.on) {
			body.innerHTML = `<p class="dlc-err">${esc((data && data.error) || "Задания дня пока недоступны")}</p>`;
			return;
		}

		const rs = $(".dlc-rs", card);
		if (rs && +data.reset > 0)
			rs.textContent = `новые в ${new Date(+data.reset + 3 * 3600e3).toISOString().slice(11, 16)} МСК`;
		const mk = (data.marks || [])
			.map((m) => {
				const ico = m.st === 2 ? ICO().ok : m.it ? ICO().i : ICO().c,
					what = `${money(m.c)}${m.it ? ` + ${esc(ITEM_RU[m.it] || m.it)}` : ""}`;
				return (
					`<li class="dlc-m is-${["off", "ready", "got"][m.st] || "off"}"><span class="dlm-m is-${["off", "ready", "got"][m.st] || "off"}">${ico}</span><b>${esc(m.p)}%</b><span class="dlc-mw">${what}</span>` +
					(m.st === 1
						? `<button type="button" class="dlc-get" data-dl-claim="${esc(m.i)}">Забрать</button>`
						: `<span class="dlc-ms">${m.st === 2 ? "забрано" : ""}</span>`) +
					"</li>"
				);
			})
			.join("");
		const c = data.coins || {};
		body.innerHTML =
			`<p class="dlc-sub">Каждая ступень - шаг шкалы. Полная шкала - ${esc(data.need)} из ${esc(data.all)} шагов.${data.full ? " <b>Шкала заполнена!</b>" : ""}</p>` +
			`<ul class="dlc-ts">${(data.tasks || []).map(rowHtml).join("")}</ul>` +
			`<ul class="dlc-mks" aria-label="Награды шкалы">${mk}</ul>` +
			`<p class="dlc-ft">Серия входов: <b>${days(+data.streak || 0)}</b>${data.today ? "" : " (сегодня ещё не засчитан)"} · вход +${money(c.login)} · каждые ${esc(data.streakDays || 7)} дней - ${esc(ITEM_RU.enchant_star)}${c.pct ? ` · гильдия: +${esc(c.pct)}% к монетам` : ""}</p>`;
	}
	function position() {
		if (!card || card.hidden || !anchor || !anchor.isConnected) return;
		const inBar = anchor === barEl(),
			r = (
				inBar ? $(".dlb-in", barEl()) || barEl() : anchor
			).getBoundingClientRect(),
			W = document.documentElement.clientWidth;
		const w = Math.min(460, W - 16),
			left = Math.min(Math.max(8, r.left), W - w - 8);
		card.classList.toggle("is-fixed", !inBar);
		card.style.width = w + "px";
		card.style.left = (inBar ? left + window.scrollX : left) + "px";
		card.style.top = (inBar ? r.bottom + window.scrollY : r.bottom + 6) + "px";
	}
	function openCard(at) {
		if (!card) {
			card = document.createElement("div");
			card.className = "dlc gw-tok gw-dk";
			card.id = "dlCard";
			card.hidden = true;
			card.setAttribute("role", "region");
			card.setAttribute("aria-label", "Задания дня - подробно");
			card.innerHTML = `<div class="dlc-hd"><b>Задания дня</b><span class="dlc-rs">новые в 00:00 МСК</span><button type="button" class="dlc-x" data-dl-close aria-label="Свернуть">×</button></div><div class="dlc-body"></div>`;
			card.addEventListener("click", onCard);
			document.body.appendChild(card);
			window.addEventListener("resize", position);
			document.addEventListener("keydown", (e) => {
				if (e.key === "Escape" && card && !card.hidden) {
					close();
				}
			});
			document.addEventListener(
				"pointerdown",
				(e) => {
					if (
						card &&
						!card.hidden &&
						!card.contains(e.target) &&
						!(anchor && anchor.contains(e.target))
					)
						close();
				},
				true,
			);
		}
		anchor = at || barEl();
		err = null;
		card.setAttribute("data-gst", gst());
		card.hidden = false;
		if (H) H.redraw();
		position();
		fill();
		apiGet().then((r) => {
			if (r && r.ok) {
				err = null;
				if (H) H.take(r);
			} else {
				err = r;
				fill();
			}
			position();
		});
	}
	function close() {
		if (!card || card.hidden) return;
		card.hidden = true;
		const a = anchor;
		anchor = null;
		if (H) H.redraw();
		if (a && a.focus && a !== barEl()) a.focus();
	}
	function toggle(at) {
		if (card && !card.hidden && anchor === (at || barEl())) close();
		else openCard(at);
	}
	function onCard(e) {
		const c = e.target.closest("[data-dl-claim]");
		if (c) {
			e.stopPropagation();
			if (H && H.claim) H.claim(+c.getAttribute("data-dl-claim"), c);
			return;
		}
		if (e.target.closest("[data-dl-close]")) close();
	}

	const KIND_RU = {
		wood: "Деревянный сундук",
		silver: "Серебряный сундук",
		gold: "Золотой сундук",
	};
	const KIND_C = {
		wood: ["#b9773f", "#7a4a22", "#e2b07a"],
		silver: ["#c9d2da", "#7d8a96", "#f4f8fb"],
		gold: ["#f2c443", "#a8741a", "#fff0a8"],
	};

	function chestSvg(k, size = 40) {
		const [a, b, l] = KIND_C[k] || KIND_C.wood;
		return (
			`<svg class="gq-chest" width="${size}" height="${size}" viewBox="0 0 40 40" aria-hidden="true"><path d="M5 17h30v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" fill="${a}" stroke="#2b1d18" stroke-width="2.5" stroke-linejoin="round"/>` +
			`<path d="M5 17c0-7 5-11 15-11s15 4 15 11z" fill="${l}" stroke="#2b1d18" stroke-width="2.5" stroke-linejoin="round"/><path d="M5 17h30" stroke="#2b1d18" stroke-width="2.5"/>` +
			`<path d="M11 8v27M29 8v27" stroke="${b}" stroke-width="3"/><rect x="16.5" y="15" width="7" height="8" rx="1.5" fill="${b}" stroke="#2b1d18" stroke-width="2"/><circle cx="20" cy="19" r="1.4" fill="#2b1d18"/></svg>`
		);
	}
	const leftTxt = (ms) => {
		const h = Math.floor(ms / 3600e3);
		return h >= 24
			? `ещё ${Math.floor(h / 24)} д ${h % 24} ч`
			: h >= 1
				? `ещё ${h} ч`
				: `ещё ${Math.max(1, Math.round(ms / 60e3))} мин`;
	};
	let gdlg = null,
		gres = null,
		gdata = null;
	function giftFill() {
		if (!gdlg) return;
		const body = $(".dl-body", gdlg),
			q = gdata && gdata.ok ? gdata.gq : null;
		if (!gdata) {
			body.innerHTML = '<p class="dl-err">Загрузка…</p>';
			return;
		}
		if (!q) {
			body.innerHTML = `<p class="dl-err">${esc((gdata && gdata.error) || "Подарок - только в гильдии")}</p>`;
			return;
		}
		const list = q.gift || [];
		body.innerHTML =
			`<p class="dl-sub">Сундуки за общие задания гильдии. Лежат ${esc(q.days)} дн. - потом пропадают.</p>` +
			(gres ? `<div class="gq-got" role="status">${gres}</div>` : "") +
			(list.length
				? `<ul class="gq-list">${list.map((c) => `<li class="gq-c gq-${esc(c.k)}">${chestSvg(c.k, 52)}<span class="gq-ct"><b>${esc(KIND_RU[c.k] || "Сундук")}</b><small>${esc(c.why)}</small><small class="gq-left">${leftTxt(+c.left || 0)}</small></span><button type="button" class="dl-b" data-gq-open="${esc(c.i)}">Открыть</button></li>`).join("")}</ul>` +
					(list.length > 1
						? '<button type="button" class="dl-b gq-all" data-gq-open="all">Открыть всё</button>'
						: "")
				: '<p class="gq-empty">Сундуков пока нет. Выполняйте общие задания гильдии - сундук получит каждый.</p>');
	}
	function openGift() {
		if (!gdlg) {
			gdlg = document.createElement("dialog");
			gdlg.className = "dl-dlg gq-dlg gw-tok gw-dk";
			gdlg.setAttribute("aria-labelledby", "gqTitle");
			gdlg.innerHTML =
				'<div class="dl-hd"><h2 id="gqTitle">Подарок гильдии</h2><button type="button" class="dl-x" data-dl-close aria-label="Закрыть">×</button></div><div class="dl-body"></div>';
			gdlg.addEventListener("click", onGift);
			document.body.appendChild(gdlg);
		}
		gdlg.setAttribute("data-gst", gst());
		gres = null;
		giftFill();
		if (typeof gdlg.showModal === "function") {
			if (!gdlg.open) gdlg.showModal();
		} else gdlg.setAttribute("open", "");
		apiGet().then((r) => {
			gdata = r;
			giftFill();
		});
	}
	function onGift(e) {
		if (e.target === gdlg || e.target.closest("[data-dl-close]")) {
			if (gdlg.close) gdlg.close();
			else gdlg.removeAttribute("open");
			return;
		}
		const b = e.target.closest("[data-gq-open]");
		if (!b || busy) return;
		busy = true;
		b.disabled = true;
		const i = b.getAttribute("data-gq-open");
		apiAct({ op: "gift", i: i === "all" ? "all" : +i }).then((r) => {
			busy = false;
			if (r && r.ok) {
				gdata = r;
				const got = r.got || [],
					coins = got.reduce((s, x) => s + (+x.coins || 0), 0),
					its = got.flatMap((x) => x.items || []);
				gres = `<b>Из ${got.length > 1 ? got.length + " сундуков" : "сундука"}:</b> ${money(coins)}${its.length ? ", " + its.map((x) => esc(ITEM_RU[x.id] || x.id) + (x.ok ? "" : " (не влезло в сумку)")).join(", ") : ""}`;
				giftFill();
				toast("Сундук открыт");
			} else {
				toast((r && r.error) || "не вышло", true);
				b.disabled = false;
			}
		});
	}
	window.LGDailiesWin = {
		toggle(h, at) {
			if (h) H = h;
			toggle(at);
		},
		open(h, at) {
			if (h) H = h;
			openCard(at);
		},
		close,

		gift(h) {
			if (h) H = h;
			openGift();
		},

		refill() {
			err = null;
			fill();
			position();
		},
		state: () => ({
			card: !!(card && !card.hidden),
			atBar: !!(card && !card.hidden && anchor && anchor === barEl()),
			gift: !!(gdlg && gdlg.open),
		}),
	};
})();
