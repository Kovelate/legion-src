(() => {
	(window.LGCityBuildings = window.LGCityBuildings || {}).shop = (C, SH) => {
		const esc = C.esc,
			npc = (...a) => C.npc(...a),
			say = (t) => C.say(t),
			csOn = () => C.csOn(),
			msOn = () => C.msOn(),
			rerenderUi = (id) => C.rerender(id);
		const {
			FULL,
			TH,
			stockOf,
			shopBar,
			goodsHelp,
			coinsFor,
			lockedHere,
			plainMoney,
			shortMoney,
			bindGood,
			buyAsk,
			buyOpen,
			cardShow,
			cardHide,
		} = SH;

		const ROWS = {
			potion_small: "Малое зелье здоровья",
			potion_hp: "Большое зелье здоровья",
			apple: "Яблоко",
			pretzel: "Баранка",
			bread: "Хлеб",
			cheese: "Сыр",
			pie: "Пирог",
			ham: "Окорок",
			roast: "Жареный гусь",
			honey_cake: "Медовая лепёшка",
			sage_tea: "Шалфейный отвар",
			spicy_stew: "Острая похлёбка",
		};

		const gNow = () =>
			typeof window.LGGameNow === "function" ? window.LGGameNow() : Date.now();
		let PANTRY = false;
		function shopBody(h) {
			if (FULL.shop) {
				const mine = h
					? (h.items || []).filter(
							(it) =>
								!it.on &&
								(it.slot === "food" || it.slot === "potion") &&
								it.effect &&
								!it.effect.revive,
						)
					: [];
				const seen = new Set(),
					stack = [];
				for (const it of mine) {
					if (seen.has(it.id)) {
						stack.find((x) => x.id === it.id).n++;
						continue;
					}
					seen.add(it.id);
					stack.push({ ...it, n: 1 });
				}
				const cd = h && h.eatUntil && h.eatUntil > gNow();
				const list = PANTRY
					? `<div class="cy-pantry panel">${stack.length ? `<ul class="cy-goods">${stack.map((it) => `<li><span class="cy-gi">${C.X.art(it)}</span><span><b>${esc(it.name)}</b>${it.n > 1 ? ` <small>×${it.n}</small>` : ""}<em>${esc(C.X.eff(it))}</em></span><button type="button" class="btn ghost sm" data-use="${esc(it.uid)}" data-ok="${it.slot === "potion" || it.drink ? "Выпито" : "Съедено"}"${cd || h.ghost ? " disabled" : ""}>${it.slot === "potion" || it.drink ? "Выпить" : "Съесть"}</button></li>`).join("")}</ul>${cd ? '<p class="note">Еда и зелья ещё не готовы — пауза после прошлого.</p>' : ""}` : '<p class="note">Припасов нет.</p>'}</div>`
					: "";
				return (
					shopBar(
						h,
						h
							? `<button type="button" class="btn ghost sm" data-pantry aria-expanded="${PANTRY}">🍎 Мои припасы (${mine.length})</button>`
							: "",
					) + list
				);
			}
			return shopBody0(h);
		}
		function shopBody0(h) {
			const mine = (h.items || []).filter(
				(it) =>
					!it.on &&
					(it.slot === "food" || it.slot === "potion") &&
					it.effect &&
					!it.effect.revive,
			);
			const seen = new Set(),
				stack = [];
			for (const it of mine) {
				if (seen.has(it.id)) {
					stack.find((x) => x.id === it.id).n++;
					continue;
				}
				seen.add(it.id);
				stack.push({ ...it, n: 1 });
			}
			const cd = h.eatUntil && h.eatUntil > gNow();
			const rs = stockOf("shop"),
				goods = rs
					? [...(rs.potions || []), ...(rs.food || [])]
					: Object.keys(ROWS).map((id) => ({
							id,
							slot: /^potion/.test(id) ? "potion" : "food",
							name: C.X.itemName(id) || ROWS[id],
						}));
			const m = C.X.mats(h);
			return `<div class="cy-shop">
      <div class="cy-soon">${npc("Лавочница", "happy", {}, { hat: "chef" })}<div>${say(csOn() ? "Еда лечит раны, зелья — быстрее. Нажми на товар — расскажу, дважды — продам за монеты." : "Еда лечит раны, зелья — быстрее. Купить можно на стриме — в Торговых рядах за баллы канала.")}</div></div>
      <h3 class="h3">Твои припасы</h3>
      ${stack.length ? `<ul class="cy-goods">${stack.map((it) => `<li><span class="cy-gi">${C.X.art(it)}</span><span><b>${esc(it.name)}</b>${it.n > 1 ? ` <small>×${it.n}</small>` : ""}<em>${esc(C.X.eff(it))}</em></span><button type="button" class="btn ghost sm" data-use="${esc(it.uid)}" data-ok="${it.slot === "potion" || it.drink ? "Выпито" : "Съедено"}"${cd || h.ghost ? " disabled" : ""}>${it.slot === "potion" || it.drink ? "Выпить" : "Съесть"}</button></li>`).join("")}</ul>${cd ? '<p class="note">Еда и зелья ещё не готовы — пауза после прошлого.</p>' : ""}` : '<p class="note">Припасов нет.</p>'}
      <h3 class="h3">На прилавке</h3>
      <ul class="cy-goods cy-goods-c">${goods.map((it) => `<li><button type="button" class="cy-good" data-good="${esc(it.id)}" aria-label="${esc(C.X.itemName(it.id) || it.name)} — ${csOn() && it.coins ? esc(plainMoney(TH.price(h, it.coins))) : "купить на стриме"}"><span class="cy-gi">${C.X.art(it)}</span><span><b>${esc(C.X.itemName(it.id) || it.name)}</b><em>${csOn() && it.coins ? C.X.money(TH.price(h, it.coins)) : "на стриме"}</em></span></button></li>`).join("")}</ul>
      ${goodsHelp(h)}
      ${h.ef ? `<h3 class="h3">Для заточки</h3><div class="cy-mats"><span>Звёзд: <b>${m.star}</b> · сфер: <b>${m.sphere}</b></span></div><p class="note cy-matfind">Звёзды и сферы не продаются - их находят в походе, у боссов, в Шахте, на рыбалке и за ежедневные задания.</p>` : ""}
    </div>`;
		}

		const SHELF0 = { x: 40, w: 780, y: [340, 580], tw: 120, th: 150, gap: 8 };
		const shelfOf = () => (C.ART && C.ART.SHOP_SHELF) || SHELF0;

		function fitNames(box) {
			box.querySelectorAll(".cy-tile b").forEach((b) => {
				b.style.fontSize = "";
				let fs = parseFloat(getComputedStyle(b).fontSize) || 13;
				const over = () =>
					b.scrollWidth > b.clientWidth + 1 ||
					b.offsetHeight > fs * 1.15 * 2 + 2;
				for (let n = 0; n < 12 && fs > 10 && over(); n++) {
					fs -= 0.5;
					b.style.fontSize = fs + "px";
				}
			});
		}
		function shopTiles(inn, st, h) {
			const goods = st ? [...(st.potions || []), ...(st.food || [])] : [];
			if (!goods.length) return;
			const tile = (it, x, y) => {
				const c = coinsFor(it, h),
					nm = C.X.itemName(it.id) || it.name,
					pr =
						csOn() && c
							? shortMoney(c)
							: it.price
								? (+it.price).toLocaleString("ru-RU") + " б."
								: "";
				return `<button type="button" class="cy-hot cy-tile${lockedHere(it) ? " lock" : ""}" data-good="${esc(it.id)}" data-r="${esc(it.rarity || "common")}" style="left:${x}px;top:${y - SH0.th}px" aria-label="${esc(nm)} — ${csOn() && c ? esc(plainMoney(c)) : "купить на стриме"}"><span class="cy-gi">${C.X.art(it)}</span><b>${esc(nm)}</b><i>${esc(pr)}</i></button>`;
			};
			const box = document.createElement("div");
			box.className = "cy-hots";
			const SH0 = shelfOf(),
				step = SH0.tw + SH0.gap,
				x0 = SH0.x + Math.round((SH0.w - 6 * SH0.tw - 5 * SH0.gap) / 2);
			box.innerHTML = goods
				.slice(0, 12)
				.map((it, i) => tile(it, x0 + (i % 6) * step, SH0.y[i < 6 ? 0 : 1]))
				.join("");
			inn.appendChild(box);
			fitNames(box);
			if (document.fonts && document.fonts.ready)
				document.fonts.ready.then(() => {
					if (box.isConnected) fitNames(box);
				});
			box
				.querySelectorAll("[data-good]")
				.forEach((el) => bindGood(el, "shop", el.dataset.good));
		}

		function shopAfter(h) {
			C.S.panel
				.querySelectorAll("[data-good]")
				.forEach((b) => bindGood(b, "shop", b.dataset.good));
			{
				const pb = C.S.panel.querySelector("[data-pantry]");
				if (pb)
					pb.onclick = () => {
						PANTRY = !PANTRY;
						rerenderUi("shop");
					};
			}
			C.S.panel
				.querySelectorAll("[data-use]")
				.forEach(
					(b) =>
						(b.onclick = () =>
							C.X.act(
								"/api/use",
								{ uid: b.dataset.use },
								b.dataset.ok || "Готово",
								b,
							)),
				);
		}

		return {
			body: (h) => shopBody(h),
			after: (h) => shopAfter(h),
			tiles: (inn, st, h) => shopTiles(inn, st, h),
		};
	};
})();
