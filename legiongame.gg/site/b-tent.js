(() => {
	(window.LGCityBuildings = window.LGCityBuildings || {}).tent = (C, SH) => {
		const esc = C.esc,
			still = C.still,
			D = () => C.D(),
			rerenderUi = (id) => C.rerender(id);
		const {
			FULL,
			shopBar,
			card,
			cardDrop,
			cardHide,
			cardPlace,
			buyAsk,
			buyOpen,
			olHots,
			touchy,
		} = SH;

		const TENT = [
			["shape", "Форма", "shapes"],
			["color", "Цвет", "colors"],
			["eyes", "Глаза", "eyes"],
			["mouth", "Рот", "mouths"],
			["hat", "Шапка", "hats"],
			["acc", "Аксессуар", "acc"],
		];
		let TRY = {},
			TF = "hat";
		function tentBody(h) {
			if (FULL.tent)
				return shopBar(
					h,
					Object.keys(TRY).length
						? '<button type="button" class="btn ghost sm" data-untry>Снять примерку</button>'
						: "",
				);
			return tentBody0(h);
		}
		function tentBody0(h) {
			const W0 = h.wardrobe || { cur: {}, own: {} },
				cur = W0.cur || {},
				own = W0.own || {};
			const C = (D() && D().CATALOG) || {};
			const [f, , cat] = TENT.find((x) => x[0] === TF) || TENT[0];
			const list = (C[cat] || []).filter(([id]) => id !== "none");
			const has = (v) =>
				(own[f] || []).some(
					(x) => String(x).toLowerCase() === String(v).toLowerCase(),
				);
			const worn = (v) =>
				f === "acc"
					? (Array.isArray(cur.acc) ? cur.acc : []).includes(v)
					: String(cur[f] || "").toLowerCase() === String(v).toLowerCase();
			const sel = TRY[f] != null ? (f === "acc" ? TRY.acc[0] : TRY[f]) : null;
			const pick =
				sel != null
					? list.find(
							([id]) => String(id).toLowerCase() === String(sel).toLowerCase(),
						)
					: null;
			const act = pick
				? worn(pick[0])
					? '<p class="note">Уже надето.</p>'
					: has(pick[0])
						? `<button type="button" class="btn primary wide" data-wear="${esc(f)}" data-v="${esc(pick[0])}"${h.busy ? " disabled" : ""}>Надеть «${esc(pick[1])}»</button>`
						: `<p class="note cy-buy">Купить — за монеты, в кабинке «${esc((TENT.find((x) => x[0] === f) || [])[1] || "")}» на сцене Шатра: образец «${esc(pick[1])}».</p>`
				: '<p class="note">Выбери образец — примерим на твоём герое.</p>';

			const fig = `<div class="cy-tryfig" aria-hidden="true">${still(C.X.doodle(C.X.login(), { ...h, look: { ...cur, ...TRY }, gear: {} }, "happy", "peace"))}</div>`;
			return `<div class="cy-tent">
      <div class="cy-trytop">${fig}${Object.keys(TRY).length ? '<button type="button" class="btn ghost sm" data-untry>Снять примерку</button>' : '<p class="note">Примерка — прямо на твоём герое в Шатре.</p>'}</div>
      <div class="cy-try">
        <div class="filters" role="group" aria-label="Что примерить">${TENT.map(([k, l]) => `<button type="button" data-tf="${k}" aria-pressed="${TF === k}">${l}</button>`).join("")}</div>
        <div class="cy-opts">${list.map(([id, nm]) => `<button type="button" class="cy-opt${has(id) ? " own" : ""}${sel != null && String(sel).toLowerCase() === String(id).toLowerCase() ? " on" : ""}" data-try="${esc(id)}" title="${esc(nm)}">${cat === "colors" ? `<i style="background:${esc(id)}"></i>` : ""}${esc(nm)}${has(id) ? "<small>есть</small>" : ""}</button>`).join("")}</div>
        ${act}
      </div>
    </div>`;
		}
		function tentAfter(h) {
			const P = C.S.panel;
			if (FULL.tent) {
				const u0 = P.querySelector("[data-untry]");
				if (u0)
					u0.onclick = () => {
						TRY = {};
						SH.GSEL = null;
						cardDrop();
						rerenderUi("tent");
					};
				return;
			}
			P.querySelectorAll("[data-tf]").forEach(
				(b) =>
					(b.onclick = () => {
						TF = b.dataset.tf;
						rerenderUi("tent");
					}),
			);
			P.querySelectorAll("[data-try]").forEach(
				(b) =>
					(b.onclick = () => {
						const v = b.dataset.try;
						if (TF === "acc") TRY.acc = [v];
						else TRY[TF] = v;
						rerenderUi("tent");
					}),
			);
			const u = P.querySelector("[data-untry]");
			if (u)
				u.onclick = () => {
					TRY = {};
					rerenderUi("tent");
				};
			const w = P.querySelector("[data-wear]");
			if (w)
				w.onclick = () => {
					const f = w.dataset.wear,
						v = w.dataset.v;
					delete TRY[f];
					C.X.act("/api/wear", { field: f, value: v }, "Надето", w);
				};
		}

		const BOOTH_RU = {
			shape: "Форма тела",
			color: "Цвет тела",
			eyes: "Глаза",
			mouth: "Рот",
			blush: "Румянец",
			hat: "Головной убор",
			acc: "Аксессуар",
			aura: "Аура",
		};
		function tentHots(inn, st, pos) {
			const smps = [];
			for (const b of (st && st.booths) || [])
				for (const smp of b.samples || [])
					if (pos[smp.pos]) smps.push([b, smp]);
			if (!smps.length) return;
			const box = document.createElement("div");
			box.className = "cy-hots";
			box.innerHTML = smps
				.map(([b, smp]) => {
					const p = pos[smp.pos];
					return `<button type="button" class="cy-hot sm" data-smp="${esc(smp.pos)}" style="left:${Math.round(p.x - 34)}px;top:${Math.round(p.y - 44)}px" aria-label="${esc(b.title)}: ${esc(smp.name)}"></button>`;
				})
				.join("");
			inn.appendChild(box);
			const valOf = (b, smp) =>
				b.key === "blush" ? String(!!(smp.look && smp.look.blush)) : smp.id;
			const owned = (b, smp) => {
				const h = C.X.hero(),
					own =
						(h && h.wardrobe && h.wardrobe.own && h.wardrobe.own[b.key]) || [];
				const v = valOf(b, smp);
				return own.some(
					(x) => String(x).toLowerCase() === String(v).toLowerCase(),
				);
			};
			const html = (b, smp) =>
				`<div class="cy-ich"><b>${esc(smp.name)}</b><small>${esc(b.title || BOOTH_RU[b.key] || "")} · образец №${smp.n}</small></div><p class="d-desc">Только внешность — на характеристики не влияет. Примерено на твоём герое.</p>` +
				(owned(b, smp)
					? `<p class="cy-icp">Уже есть в гардеробе</p><button type="button" class="btn primary sm wide" data-tentwear>Надеть</button>`
					: `<p class="cy-icp">${C.X.money(+b.price || 0)} <small>кабинка «${esc(b.title || "")}», образец №${smp.n}</small></p><p class="cy-ichint">${touchy() ? "Нажми ещё раз" : "Двойной клик"} — купить</p>`);
			const tryOn = (b, smp) => {
				const f = b.key;
				if (f === "acc") TRY.acc = [smp.id];
				else if (f === "blush") TRY.blush = !!(smp.look && smp.look.blush);
				else TRY[f] = smp.id;
				const fg = C.S.room.querySelector(".cy-fig2.me"),
					h = C.X.hero();
				if (fg && h)
					fg.innerHTML = still(
						C.X.doodle(
							C.X.login(),
							{
								...h,
								look: { ...((h.wardrobe && h.wardrobe.cur) || {}), ...TRY },
								gear: {},
							},
							"happy",
							"peace",
						),
					);
			};
			const ask = (b, smp, el) => {
				if (owned(b, smp)) {
					delete TRY[b.key];
					C.X.act(
						"/api/wear",
						{ field: b.key, value: valOf(b, smp) },
						"Надето",
						null,
					);
					cardDrop();
					return;
				}
				buyAsk(
					{
						id: "look-" + b.key + "-" + String(smp.id).replace(/^#/, ""),
						name: smp.name,
						coins: +b.price || 0,
						look: true,
						pos: smp.pos,
					},
					"tent",
					el,
				);
			};
			box.querySelectorAll("[data-smp]").forEach((el) => {
				const [b, smp] = smps.find(([, x]) => x.pos === el.dataset.smp);
				const show = (pin) => {
					const c = card();
					c.innerHTML = html(b, smp);
					c.classList.add("on");
					c.classList.toggle("pin", pin);
					const w = c.querySelector("[data-tentwear]");
					if (w) w.onclick = () => ask(b, smp, el);
					cardPlace(c, el);
				};
				el.addEventListener("pointerenter", (e) => {
					if (e.pointerType === "mouse" && !buyOpen())
						show(SH.GSEL && SH.GSEL.id === smp.pos);
				});
				el.addEventListener("pointerleave", (e) => {
					if (e.pointerType === "mouse" && !(SH.GSEL && SH.GSEL.id === smp.pos))
						cardHide();
				});
				el.addEventListener("click", () => {
					if (SH.GSEL && SH.GSEL.id === smp.pos) {
						ask(b, smp, el);
						return;
					}
					SH.GSEL = { b: "tent", id: smp.pos };
					box.querySelectorAll(".on").forEach((x) => x.classList.remove("on"));
					el.classList.add("on");
					tryOn(b, smp);
					show(true);
					rerenderUi("tent");
				});
				el.addEventListener("dblclick", (e) => {
					e.preventDefault();
					if (!buyOpen()) ask(b, smp, el);
				});
			});
			olHots(box);
		}

		return {
			body: (h) => tentBody(h),
			after: (h) => tentAfter(h),
			hots: (inn, st, pos) => tentHots(inn, st, pos),
			get TRY() {
				return TRY;
			},
		};
	};
})();
