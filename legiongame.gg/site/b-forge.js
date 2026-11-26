(() => {
	(window.LGCityBuildings = window.LGCityBuildings || {}).forge = (C, SH) => {
		const esc = C.esc,
			still = C.still,
			reduce = () => C.reduce(),
			isCamp = () => C.isCamp(),
			say = (t) => C.say(t),
			IGW = () => C.IGW();
		const shopBar = (h, extra) => SH.shopBar(h, extra);

		const goAnvil = () =>
			isCamp()
				? '<span class="cy-bnote">Заточка - в городе канала, после пролога</span>'
				: '<button type="button" class="btn primary sm cy-goanvil" data-goanvil>🔨 К наковальне — заточка</button>';
		function forgeShop(h) {
			const st = SH.STOCK && SH.STOCK.forge;
			if (!st)
				return shopBar(
					h,
					`<span class="cy-bnote">Кузнец раскладывает товар…</span>${goAnvil()}`,
				);

			return shopBar(h, `${goAnvil()}`);
		}

		function forgeBody(h) {
			const rp = C.X.repBlock ? C.X.repBlock(h) : "";
			if (!h.ef)
				return `${say("Чиню снаряжение после походов. А заточку открою позже — загляни!")}${rp}<p class="note">Заточка пока открыта только тестерам.</p>`;

			if (v3(h))
				return `<div class="cyf-wrap cyf-i2 cyf-v3">
      <div class="cyf-anvbox" aria-live="polite"></div>
      <div class="cyf-bagbox"></div>
      <div class="cyf-ctl"><p class="note cyf-hint">${window.LGSiteUi.is("touch") ? "Нажми на вещь - она ляжет на наковальню. Усилитель - нажми на ячейку справа. Обратно - удерживай и перетащи в сумку или на героя." : "Перетащи вещь на наковальню или просто нажми на неё. Усилитель - в ячейку справа (перетащи или нажми на ячейку). Обратно - перетащи в сумку или на героя."}</p></div>
    </div>${rp}`;
			return `<div class="cyf-wrap">
      <div class="cyf-anvbox" aria-live="polite"></div>
      <div class="cyf-dollbox" role="group" aria-label="Надето"></div>
      <div class="cyf-bagbox"></div>
      <div class="cyf-matbox"></div>
      <div class="cyf-ctl"><p class="note cyf-hint">${IGW() && window.LGSiteUi.is("touch") ? "Нажми на вещь на герое или в сумке — кузнец положит её на наковальню. Или удерживай и перетащи." : "Перетащи вещь с героя или из сумки на наковальню — или просто нажми на неё."}</p></div>
    </div>${rp}`;
		}
		let IGD = null;
		const igOff = () => {
			if (RO) {
				RO.disconnect();
				RO = null;
			}
			if (IGD) {
				IGD.off();
				IGD = null;
			}
			if (FGI) {
				try {
					FGI.destroy();
				} catch (e) {}
				FGI = null;
			}
		};

		let FGI = null;
		const fgInv2 = (h) => !!(h && h.i2 && window.LGInventory);

		const v3 = (h) => !!(h && h.av && fgInv2(h));
		const v3on = (P) => !!(P && P.querySelector(".cyf-wrap.cyf-v3"));
		const BOOST = {
			star: "Счастливая звезда",
			sphere: "Сфера сохранения",
			seal: "Печать Ауруса",
		};
		const BART = {
			star: { slot: "material", mat: "star", rarity: "uncommon" },
			sphere: { slot: "material", mat: "sphere", rarity: "rare" },
			seal: { slot: "material", mat: "seal", seal: 5, rarity: "epic" },
		};
		const isBoost = (it) =>
			!!(it && !it.on && BOOST[it.mat] && (it.mat !== "seal" || it.seal));

		function boostItem(h, way) {
			const own = ((h && h.items) || []).filter(
				(x) => isBoost(x) && x.mat === way,
			);
			if (way !== "seal") return own[0] || null;
			const E = (C.X.ench && C.X.ench()) || {},
				main = itemOf(h, FX.uid),
				min = Math.max(((main && +main.en) || 0) + 1, +E.sealMin || 0);
			const by = own.slice().sort((a, b) => a.seal - b.seal);
			return by.find((x) => x.seal >= min) || by[0] || null;
		}
		const boostN = (h, way) =>
			((h && h.items) || []).filter((x) => isBoost(x) && x.mat === way).length;

		const awayUids = (h) =>
			[FX.uid, FX.boost ? (boostItem(h, FX.boost) || {}).uid : null].filter(
				Boolean,
			);

		const GEARK = {
			weapon: ["w", "wr", "wg"],
			shield: ["s", "sr"],
			armor: ["a", "ar", "am"],
			helmet: ["h", "hr"],
			trinket: ["t", "tr", "tc"],
		};
		function gearAway(h, away) {
			const off = (h.items || []).filter(
				(x) => x.on && away.includes(x.uid) && GEARK[x.slot],
			);
			if (!off.length) return h.gear;
			const g = { ...(h.gear || {}) };
			for (const x of off) for (const k of GEARK[x.slot]) delete g[k];
			return g;
		}
		function fgMount2(h, box, P) {
			const bb = box.querySelector(".cyf-bagbox");
			if (!bb) return;
			const V = v3on(P),
				away = V ? awayUids(h) : [];

			const its = V
				? (h.items || []).filter((x) => !away.includes(x.uid))
				: h.items || [];
			const data = {
				hero:
					V && away.length ? { ...h, items: its, gear: gearAway(h, away) } : h,
				items: its,
				stack: h.sg ? h.sg.bs : 20,
				bagCap: h.sg ? h.sg.cap : null,
			};
			if (FGI && FGI.el.isConnected && bb.contains(FGI.el)) {
				FGI.update(data);
				FGI.select(V ? "" : FX.uid || "");
				return;
			}
			if (FGI) {
				try {
					FGI.destroy();
				} catch (e) {}
			}
			bb.innerHTML = '<div class="cyf-inv2"></div>';
			bb.dataset.k = "";

			const put = (it) =>
				V && isBoost(it) ? setBoost(it.mat, P) : pickForge(it.uid, P);
			FGI = window.LGInventory.mount(bb.firstChild, {
				variant: "full",
				mode: "pick",
				data,
				actions: { pick: put, drop: put },
				options: {
					header: false,
					vitals: false,
					detail: false,
					art: C.X.art,
					storeKey: "lgInv2Fg",
					dragRoot: P,
					dropSel: V
						? '[data-igdrop="anvil"], [data-igdrop="boost"]'
						: '[data-igdrop="anvil"]',
					dropOk: (it, t) =>
						!FX.busy &&
						(!V || isBoost(it) || !t || t.dataset.igdrop === "anvil"),
					can: (it) => {
						const hh = C.X.hero() || {};
						return V && isBoost(it)
							? hh.ghost
								? "Призрак не точит"
								: true
							: !C.X.canEnch(it)
								? "Это не точится"
								: hh.ghost
									? "Призрак не точит"
									: hh.busy
										? "Идёт бой - заточка после боя"
										: true;
					},
					figure: (hh) =>
						C.X.still && C.X.doodle
							? C.X.still(
									C.X.doodle(
										C.X.login(),
										C.X.heroLook ? C.X.heroLook(hh) : hh,
										"stern",
										"battle",
									),
								)
							: "",
					cardTip: C.X.cardTip
						? (el, it) => C.X.cardTip(el, it, C.X.hero())
						: null,
					tipHide: C.X.tipHide ? () => C.X.tipHide() : null,
					sel: FX.uid || "",
				},
			});
		}
		const itemOf = (h, uid) =>
			(h && (h.items || []).find((x) => x.uid === uid)) || null;

		function anvilHtml(h) {
			const it = itemOf(h, FX.uid) || FX.keep,
				gone = !!it && it === FX.keep;
			const cls = FX.busy
				? " work"
				: FX.anim && FX.anim.t > Date.now()
					? " " + FX.anim.c
					: "";
			return `<div class="cyf-anv${it ? " full" : ""}" data-igdrop="anvil">
      <div class="cyf-anvslot cy-sc${gone ? " gone" : ""}${cls}" style="--n:${FX.n || 2}" data-r="${esc((it && it.rarity) || "common")}">${it ? `${gone ? "" : `<button type="button" class="cyf-anvit" data-ig="${esc(it.uid)}" aria-label="На наковальне: ${esc(it.name)}">`}<span class="cy-gi">${C.X.art(it)}</span>${it.en > 0 ? `<i class="en">+${+it.en}</i>` : ""}${it.dur != null ? `<i class="du${+it.dur <= (C.X.durLow ? C.X.durLow() : 30) ? " br" : ""}">${+it.dur}%</i>` : ""}${gone ? "" : "</button>"}` : '<span class="cyf-anvph" aria-hidden="true">+</span>'}</div>
      <div class="cyf-anvsvg" aria-hidden="true">${anvilSvg()}</div>
      <div class="cyf-anvn">${it ? `<b data-r="${esc(it.rarity)}">${esc(it.name)}</b><small>${gone ? "сломалась" : it.on ? "надето" : "из сумки"}</small>` : "<b>Наковальня пуста</b><small>положи сюда вещь</small>"}${FX.last && it ? `<small class="cyf-anvres ${FX.last.c}" role="status">${esc(FX.last.t)}</small>` : ""}
        ${it && !FX.busy ? '<button type="button" class="btn ghost sm" data-anvoff>Убрать</button>' : ""}${it && !gone ? '<button type="button" class="btn ghost sm cyf-toctl" data-anvgo>К заточке ↓</button>' : ""}</div>
    </div>`;
		}

		function anvil3Html(h) {
			const it = itemOf(h, FX.uid) || FX.keep,
				gone = !!it && it === FX.keep;
			const cls = FX.busy
				? " work"
				: FX.anim && FX.anim.t > Date.now()
					? " " + FX.anim.c
					: "";
			const main = `<div class="cyf-anvslot cy-sc${gone ? " gone" : ""}${cls}" style="--n:${FX.n || 2}" data-r="${esc((it && it.rarity) || "common")}">${it ? `${gone ? "" : `<button type="button" class="cyf-anvit" data-ig="${esc(it.uid)}"${FX.busy ? "" : ' data-igdrag="1"'} aria-label="На наковальне: ${esc(it.name)}">`}<span class="cy-gi">${C.X.art(it)}</span>${it.en > 0 ? `<i class="en">+${+it.en}</i>` : ""}${it.dur != null ? `<i class="du${+it.dur <= (C.X.durLow ? C.X.durLow() : 30) ? " br" : ""}">${+it.dur}%</i>` : ""}${gone ? "" : "</button>"}` : '<span class="cyf-anvph" aria-hidden="true">+</span>'}</div>`;
			const b = FX.boost ? boostItem(h, FX.boost) : null,
				bn = b ? boostN(h, FX.boost) : 0,
				bnm = b
					? b.mat === "seal"
						? `${BOOST.seal} ${+b.seal}`
						: BOOST[b.mat]
					: "";
			const boost = b
				? `<button type="button" class="cyf-anvslot cyf-bslot cy-sc" data-anvboost data-ig="${esc(b.uid)}"${FX.busy ? "" : ' data-igdrag="1"'} data-r="${esc(b.rarity || "common")}" aria-haspopup="menu" aria-expanded="${!!FX.pk}" aria-label="Усилитель: ${esc(bnm)}, есть ${bn}. Нажми - выбрать другой"><span class="cy-gi">${C.X.art(b)}</span>${bn > 1 ? `<i class="n">${bn}</i>` : ""}</button>`
				: `<button type="button" class="cyf-anvslot cyf-bslot cy-sc e" data-anvboost aria-haspopup="menu" aria-expanded="${!!FX.pk}" aria-label="Усилитель (необязательно): нажми - выбрать"><span class="cyf-anvph" aria-hidden="true">+</span></button>`;
			const E = (C.X.ench && C.X.ench()) || {};
			const beff = !b
				? ""
				: b.mat === "star"
					? `+${+E.star || 0}% к шансу`
					: b.mat === "sphere"
						? "при неудаче вещь цела, заточка -1"
						: `успех 100% до +${+b.seal}`;
			return `<div class="cyf-anv cyf-anv3${it ? " full" : ""}">
      <div class="cyf-cells">
        <div class="cyf-cell cyf-cmain" data-igdrop="anvil">${main}<small class="cyf-cl">Вещь</small></div>
        <div class="cyf-cell cyf-cboost${b ? " full" : ""}" data-igdrop="boost">${boost}<small class="cyf-cl">Усилитель</small></div>
      </div>
      <div class="cyf-anvsvg" aria-hidden="true">${anvilSvg()}</div>
      <div class="cyf-anvn">${it ? `<b data-r="${esc(it.rarity)}">${esc(it.name)}</b><small>${gone ? "сломалась" : it.on ? "надето" : "из сумки"}</small>` : "<b>Наковальня пуста</b><small>положи сюда вещь</small>"}${b ? `<small class="cyf-bnm">${esc(bnm)}: ${esc(beff)}</small>` : '<small class="cyf-bnm">усилитель - по желанию</small>'}${FX.last && it ? `<small class="cyf-anvres ${FX.last.c}" role="status">${esc(FX.last.t)}</small>` : ""}
        ${it && !FX.busy ? '<button type="button" class="btn ghost sm" data-anvoff>Убрать</button>' : ""}${it && !gone ? '<button type="button" class="btn ghost sm cyf-toctl" data-anvgo>К заточке ↓</button>' : ""}</div>
      ${FX.pk ? boostPickHtml(h) : ""}
    </div>`;
		}

		function boostPickHtml(h) {
			const m = C.X.mats(h),
				E = (C.X.ench && C.X.ench()) || {},
				seals = Object.keys(m.seals)
					.map(Number)
					.sort((a, b) => a - b),
				nS = seals.reduce((a, n) => a + m.seals[n], 0);
			const row = (way, n, eff, where) =>
				`<button type="button" role="menuitemradio" class="cyf-bp${n ? "" : " none"}" data-bway="${way}" aria-checked="${FX.boost === way}"${n ? "" : " disabled"}><span class="cy-gi">${C.X.art(BART[way])}</span><b>${esc(BOOST[way])} <i>×${n}</i></b><small>${esc(n ? eff : where)}</small></button>`;
			return (
				`<div class="cyf-bpick" role="menu" aria-label="Усилитель заточки - один на выбор">` +
				row(
					"star",
					m.star,
					`+${+E.star || 0}% к шансу`,
					"Нет - не продаются: находят в походе, у боссов, в Шахте и на рыбалке",
				) +
				row(
					"sphere",
					m.sphere,
					"при неудаче вещь не сломается, заточка -1",
					"Нет - не продаются: находят в походе, у боссов, в Шахте и на рыбалке",
				) +
				row(
					"seal",
					nS,
					`успех 100% (уровни: ${seals.join(", ")})`,
					"Нет - только выпадает: босс, данж, сокровищницы",
				) +
				(FX.boost
					? '<button type="button" role="menuitem" class="cyf-bp cyf-bpoff" data-bway=""><b>Без усилителя</b></button>'
					: "") +
				"</div>"
			);
		}

		function setBoost(way, P = C.S && C.S.panel) {
			if (FX.busy) return;
			const h = C.X.hero();
			if (way && !boostItem(h, way)) return;
			FX.boost = way || null;
			FX.pk = false;
			if (C.X.forgeWay) C.X.forgeWay(FX.boost || "plain");
			forgeList(h, P);
		}

		function anvClear(P) {
			if (FX.busy) return;
			FX.uid = null;
			FX.keep = null;
			FX.last = null;
			C.X.forgeClose && C.X.forgeClose();
			forgeList(C.X.hero(), P);
			FX.item(null);
		}

		let RO = null;
		function anvAlign(box) {
			const a = box && box.querySelector(".cyf-anvbox"),
				g = box && box.querySelector('.cyf-bagbox [data-lgi="grid-bag"]');
			if (!a) return;
			const wide = !!(
				window.matchMedia && window.matchMedia("(min-width: 1100px)").matches
			);
			if (!wide || !g) {
				if (a.style.marginTop) a.style.marginTop = "";
				return;
			}
			const top =
					g.getBoundingClientRect().top - box.getBoundingClientRect().top,
				off = Math.max(
					0,
					Math.round(top + (g.offsetHeight - a.offsetHeight) / 2),
				);
			const v = off + "px";
			if (a.style.marginTop !== v) a.style.marginTop = v;
		}
		function matsHtml(h) {
			const m = C.X.mats(h),
				seals = Object.keys(m.seals)
					.map(Number)
					.sort((a, b) => a - b);
			const one = (it, n, nm) =>
				`<span class="cyf-mat${n ? "" : " none"}" title="${esc(nm)}: ${n}"><span class="cy-gi">${C.X.art(it)}</span><b>×${n}</b><small>${esc(nm)}</small></span>`;
			return (
				`<div class="cyf-mats" role="group" aria-label="Материалы заточки" title="Звёзды и сферы не продаются - их находят в походе, у боссов, в Шахте и на рыбалке">${one({ slot: "material", mat: "star", rarity: "uncommon" }, m.star, "Счастливая звезда")}${one({ slot: "material", mat: "sphere", rarity: "rare" }, m.sphere, "Сфера сохранения")}` +
				`${seals.length ? seals.map((n) => one({ slot: "material", mat: "seal", seal: n, rarity: "epic" }, m.seals[n], `Печать Ауруса ${n}`)).join("") : one({ slot: "material", mat: "seal", seal: 5, rarity: "epic" }, 0, "Печать Ауруса")}</div>`
			);
		}

		function forgeList(h, P = C.S && C.S.panel) {
			const box = P && P.querySelector(".cyf-wrap");
			if (!box || !h || !IGW()) return;
			if (IGD && IGD.active()) {
				FX.later(() => forgeList(C.X.hero(), P), 400);
				return;
			}
			if (FX.uid && !itemOf(h, FX.uid) && !FX.busy) FX.uid = null;
			const L = IGW(),
				can = (it) => C.X.canEnch(it),
				drag = (it) => can(it) && !h.ghost && !h.busy;
			const put = (sel, html) => {
				const e = box.querySelector(sel);
				if (e && e.dataset.k !== html) {
					e.innerHTML = html;
					e.dataset.k = html;
				}
			};

			if (box.classList.contains("cyf-v3")) {
				if (FX.boost && !FX.busy && !boostItem(h, FX.boost)) {
					FX.boost = null;
					FX.pk = false;
					if (C.X.forgeWay) C.X.forgeWay("plain");
				}
				put(".cyf-anvbox", anvil3Html(h));
				fgMount2(h, box, P);
				anvAlign(box);
				if (!RO && typeof ResizeObserver === "function") {
					const bb = box.querySelector(".cyf-bagbox");
					if (bb) {
						RO = new ResizeObserver(() => anvAlign(box));
						RO.observe(bb);
					}
				}
				return;
			}
			put(".cyf-anvbox", anvilHtml(h));
			box.classList.toggle("cyf-i2", fgInv2(h));
			if (fgInv2(h)) {
				put(".cyf-dollbox", "");
				fgMount2(h, box, P);
				put(".cyf-matbox", matsHtml(h));
				forgeAway(box);
				return;
			}
			put(
				".cyf-dollbox",
				!C.X.doll
					? ""
					: C.X.doll(h, {
							forge: true,
							sel: FX.uid,
							can,
							still: true,
							kit: "battle",
						}),
			);
			const cs = L.cells(h.items || [], h.sg ? h.sg.bs : 20);
			put(
				".cyf-bagbox",
				`<div class="cy-sth"><h3 class="h3">Сумка</h3>${h.sg ? `<span class="cy-cnt${h.sg.used >= h.sg.cap ? " full" : ""}">${h.sg.used} / ${h.sg.cap}</span>` : ""}</div>` +
					L.grid(cs, {
						art: C.X.art,
						cap: h.sg ? h.sg.cap : 20,
						label: "Сумка",
						on: (c) => c.uids.includes(FX.uid),
						drag: (c) => drag(c.it),
						off: (c) => !can(c.it),
					}),
			);
			put(".cyf-matbox", matsHtml(h));
			forgeAway(box);
		}

		const AWAY_I =
			'<span class="cyf-awayi" aria-hidden="true"><svg viewBox="-80 -60 160 80"><path d="M-70 -50 H50 Q78 -50 78 -38 Q60 -34 44 -30 V-22 H-44 V-30 Q-62 -34 -70 -50 Z M-30 -22 H30 L38 10 H-38 Z" fill="currentColor"/></svg></span>';
		function forgeAway(box) {
			const uid = FX.uid ? String(FX.uid) : "";
			box
				.querySelectorAll(".cyf-dollbox [data-ig], .cyf-bagbox [data-ig]")
				.forEach((el) => {
					const on = !!uid && el.dataset.ig === uid,
						was = el.classList.contains("cyf-away");
					if (on === was) return;
					el.classList.toggle("cyf-away", on);
					const ic = el.querySelector(":scope > .cyf-awayi");
					if (ic) ic.remove();
					if (on) {
						el.insertAdjacentHTML("beforeend", AWAY_I);
						el.dataset.al = el.getAttribute("aria-label") || "";
						el.setAttribute(
							"aria-label",
							`${el.dataset.al.split(" — ")[0]} - сейчас на наковальне`,
						);
					} else if (el.dataset.al != null) {
						el.setAttribute("aria-label", el.dataset.al);
						delete el.dataset.al;
					}
				});
		}
		function forgeAfter(h, P = C.S && C.S.panel) {
			try {
				if (C.X.repBind && P) C.X.repBind(P);
			} catch (e) {}
			igOff();
			if (!h || !h.ef || !IGW() || !P) return;
			forgeList(h, P);
			if (P.dataset.igb) return;
			P.dataset.igb = "1";
			let pt = "mouse";
			if (v3on(P)) v3After(P, () => pt);
			IGD =
				IGD ||
				(fgInv2(h)
					? null
					: IGW().drag(P, {
							ok: (src, t) => t.dataset.igdrop === "anvil" && !FX.busy,
							onStart: () => C.X.tipHide && C.X.tipHide(),
							onDrop: (src) => pickForge(src.dataset.ig, P),

							tap: (src) => {
								const hh = C.X.hero(),
									it = itemOf(hh, src.dataset.ig);
								if (!it) return;
								if (!src.classList.contains("cyf-anvit") && C.X.canEnch(it))
									pickForge(it.uid, P);
								if (pt !== "mouse" && C.X.cardTip) {
									const el =
										P.querySelector(
											`[data-ig="${String(it.uid).replace(/["\\]/g, "")}"]${src.classList.contains("cyf-anvit") ? ".cyf-anvit" : ""}`,
										) || src;
									C.X.cardTip(el, it, hh);
								}
							},
						}));
			P.addEventListener("pointerdown", (e) => {
				pt = e.pointerType || "mouse";
				if (C.X.tipHide && !e.target.closest("[data-ig]")) C.X.tipHide();
			});

			const tipEl = (e) => e.target.closest && e.target.closest("[data-ig]");
			P.addEventListener("pointerover", (e) => {
				if (e.pointerType !== "mouse" || (IGD && IGD.active())) return;
				const el = tipEl(e);
				if (el && C.X.cardTip && C.X.tipFor() !== el)
					C.X.cardTip(el, itemOf(C.X.hero(), el.dataset.ig), C.X.hero());
			});
			P.addEventListener("pointerout", (e) => {
				const f = C.X.tipFor && C.X.tipFor();
				if (
					f &&
					P.contains(f) &&
					(!e.relatedTarget || !f.contains(e.relatedTarget))
				)
					C.X.tipHide();
			});
			P.addEventListener("focusin", (e) => {
				const el = tipEl(e);
				if (el && el.matches(":focus-visible") && C.X.cardTip)
					C.X.cardTip(el, itemOf(C.X.hero(), el.dataset.ig), C.X.hero());
			});
			P.addEventListener("focusout", () => {
				const f = C.X.tipFor && C.X.tipFor();
				if (f && P.contains(f)) C.X.tipHide();
			});
			P.addEventListener(
				"scroll",
				() => {
					const f = C.X.tipFor && C.X.tipFor();
					if (f && P.contains(f)) C.X.tipHide();
				},
				{ passive: true, capture: true },
			);
			P.addEventListener("click", (e) => {
				if (e.target.closest("[data-anvoff]")) {
					if (FX.busy) return;
					FX.uid = null;
					FX.keep = null;
					FX.last = null;
					C.X.forgeClose && C.X.forgeClose();
					forgeList(C.X.hero(), P);
					FX.item(null);
					return;
				}
				if (e.target.closest("[data-anvgo]")) {
					const c = P.querySelector(".cyf-ctl");
					if (c)
						c.scrollIntoView({
							behavior: reduce() ? "auto" : "smooth",
							block: "start",
						});
				}
			});
		}

		function v3After(P, ptOf) {
			const hero = () => C.X.hero() || {};
			IGD = IGW().drag(P, {
				src: ".cyf-anvbox [data-igdrag]",
				tapSel: ".cyf-anvbox .cyf-anvit",
				drop: '.cyf-inv2 [data-lgi="g-bag"], .cyf-inv2 .lgi-slot',
				snap: true,
				ok: (src, t) => {
					const h = hero(),
						it = itemOf(h, src.dataset.ig);
					if (!it || FX.busy) return false;
					if (t.classList.contains("lgi-slot"))
						return (
							!isBoost(it) &&
							!!it.wearable &&
							t.dataset.slot === it.slot &&
							(it.on || (!h.busy && !h.ghost))
						);

					return !(it.on && !isBoost(it) && (h.busy || h.ghost));
				},
				onStart: () => {
					if (C.X.tipHide) C.X.tipHide();
					if (FX.pk) {
						FX.pk = false;
						forgeList(C.X.hero(), P);
					}
				},
				onDrop: (src, t) => {
					const it = itemOf(hero(), src.dataset.ig);
					if (!it) return;
					if (src.hasAttribute("data-anvboost")) {
						setBoost(null, P);
						return;
					}
					const slot = t.classList.contains("lgi-slot");
					anvClear(P);
					if (slot && !it.on && C.X.act)
						C.X.act("/api/equip", { uid: it.uid }, "Надето");
					else if (!slot && it.on && C.X.act)
						C.X.act("/api/unequip", { slot: it.slot }, "Снято");
				},
				tap: (src) => {
					const it = itemOf(hero(), src.dataset.ig);
					if (it && ptOf() !== "mouse" && C.X.cardTip)
						C.X.cardTip(src, it, hero());
				},
			});

			P.addEventListener(
				"contextmenu",
				(e) => {
					if (
						!v3on(P) ||
						(e.target.closest && e.target.closest("input, textarea, select"))
					)
						return;
					e.preventDefault();
					const c = e.target.closest && e.target.closest("[data-ig]");
					if (c && !c.closest("[data-lgi-id]") && C.X.cardTip) {
						const it = itemOf(hero(), c.dataset.ig);
						if (it) C.X.cardTip(c, it, hero());
					}
				},
				true,
			);
			P.addEventListener("keydown", (e) => {
				if (e.key === "Escape" && FX.pk) {
					e.stopPropagation();
					FX.pk = false;
					forgeList(C.X.hero(), P);
					const b = P.querySelector("[data-anvboost]");
					if (b) b.focus();
				}
			});
			P.addEventListener("click", (e) => {
				if (e.defaultPrevented) return;
				const bw = e.target.closest("[data-bway]");
				if (bw) {
					if (!bw.disabled) setBoost(bw.dataset.bway || null, P);
					return;
				}
				if (e.target.closest("[data-anvboost]")) {
					if (FX.busy) return;
					FX.pk = !FX.pk;
					forgeList(C.X.hero(), P);
					const f =
						FX.pk && P.querySelector(".cyf-bpick [data-bway]:not([disabled])");
					if (f) f.focus();
					return;
				}
				if (FX.pk && !e.target.closest(".cyf-bpick")) {
					FX.pk = false;
					forgeList(C.X.hero(), P);
				}
			});
		}
		function pickForge(uid, P = C.S && C.S.panel) {
			const h = C.X.hero(),
				it = itemOf(h, uid);
			if (!it || FX.busy || !C.X.canEnch(it) || !P) return;
			FX.uid = uid;
			FX.keep = null;
			FX.anim = null;
			FX.last = null;
			forgeList(h, P);
			FX.item(it);

			const host = P.querySelector(".cyf-ctl");
			if (host) {
				if (v3on(P)) C.X.forgeOpen(uid, host, { way: FX.boost || "plain" });
				else C.X.forgeOpen(uid, host);
			}

			try {
				if (host && window.LGSiteUi.is("narrow") && host.scrollIntoView)
					host.scrollIntoView({ behavior: "auto", block: "start" });
			} catch (e) {}
		}

		const forgeStage = () =>
			`<div class="cyf-out" style="transform:translate(${960 - 1620}px, ${660 - 944}px)">` +
			forgeStage0() +
			"</div>";
		const forgeStage0 = () =>
			`<div class="cyf-stage cyf-r" aria-hidden="true"><div class="cyf-anvil">${anvilSvg()}</div><div class="cyf-item"><i class="cyf-glow"></i><div class="cyf-ia"></div><div class="cyf-ia2"></div><i class="cyf-crack"></i></div><div class="cyf-ham">${hammerSvg()}</div><div class="cyf-sparks"></div><div class="cyf-big"></div><div class="cyf-flash"></div></div>`;
		const anvilSvg = () =>
			`<svg viewBox="-80 -60 160 80" width="180" height="90"><path d="M-70 -50 H50 Q78 -50 78 -38 Q60 -34 44 -30 V-22 H-44 V-30 Q-62 -34 -70 -50 Z" fill="#5a5768" stroke="#f5f2ff" stroke-width="4" stroke-linejoin="round"/><path d="M-30 -22 H30 L38 10 H-38 Z" fill="#4a4759" stroke="#f5f2ff" stroke-width="4" stroke-linejoin="round"/><path d="M-60 -46 H40" stroke="#8b8796" stroke-width="4"/></svg>`;

		const hammerSvg = () =>
			`<svg viewBox="-150 -30 160 60" width="160" height="60"><rect x="-112" y="-5" width="116" height="10" rx="4" fill="#8a5a2b" stroke="#f5f2ff" stroke-width="3"/><rect x="-142" y="-24" width="40" height="48" rx="6" fill="#a9b1b6" stroke="#f5f2ff" stroke-width="4"/><path d="M-134 -16 V16" stroke="#6e7a80" stroke-width="3"/></svg>`;

		const FX = {
			uid: null,
			busy: false,
			T: [],
			res: null,
			done: false,
			keep: null,
			anim: null,
			cur: null,
			n: 0,
			boost: null,
			pk: false,
			q: (s) => C.S && C.S.room.querySelector(s),
			reset() {
				ANI.stop();
				FX.T.forEach(clearTimeout);
				FX.T = [];
				FX.busy = false;
				FX.res = null;
				FX.uid = null;
				FX.keep = null;
				FX.anim = null;
				FX.cur = null;
				FX.last = null;
				FX.boost = null;
				FX.pk = false;
			},
			slot: () => C.S && C.S.panel && C.S.panel.querySelector(".cyf-anvslot"),
			later(fn, ms) {
				FX.T.push(setTimeout(fn, ms));
			},
			item(it) {
				const ia = FX.q(".cyf-ia"),
					st = FX.q(".cyf-stage");
				if (!ia || !st) return;
				if (!it) {
					ia.innerHTML = "";
					const b = FX.q(".cyf-ia2");
					if (b) b.innerHTML = "";
					st.classList.remove("ok", "bad", "save", "work", "gone");
					return;
				}
				ia.innerHTML = C.X.art(it);
				st.dataset.r = it.rarity || "common";
				const ia2 = FX.q(".cyf-ia2");
				if (ia2) ia2.innerHTML = ia.innerHTML;
				st.style.setProperty(
					"--glow",
					String(Math.min(1, 0.15 + ((+it.en || 0) / 15) * 0.85)),
				);
				st.classList.remove("ok", "bad", "save", "work", "gone");
				const big = FX.q(".cyf-big");
				if (big) big.textContent = "";
			},

			start(it, tg) {
				const st = FX.q(".cyf-stage");
				if (!st) return;
				FX.T.forEach(clearTimeout);
				FX.T = [];
				FX.busy = true;
				FX.res = null;
				FX.done = false;
				st.classList.remove("ok", "bad", "save", "gone");
				st.classList.add("work");
				const big = FX.q(".cyf-big");
				if (big) big.textContent = "";
				const n = tg <= 3 ? 2 : tg <= 6 ? 3 : tg <= 10 ? 4 : 5,
					beat = reduce() ? 250 : 620;
				FX.cur = it ? { ...it } : null;
				FX.n = n;
				FX.anim = null;
				FX.last = null;
				const sl = FX.slot();
				if (sl) {
					sl.classList.remove("ok", "bad", "save");
					sl.style.setProperty("--n", n);
					sl.classList.add("work");
				}
				if (C.S && C.S.panel) {
					const off = C.S.panel.querySelector("[data-anvoff]");
					if (off) off.hidden = true;
				}
				const g0 = Math.min(1, 0.15 + ((tg - 1) / 15) * 0.85);
				for (let i = 0; i < n; i++)
					FX.later(() => FX.strike(g0 + ((i + 1) / n) * 0.5), i * beat);
				FX.later(
					() => {
						FX.done = true;
						if (FX.res && !ANI.on) FX.show(FX.res);
						else if (!FX.res) st.classList.add("wait");
					},
					n * beat + 120,
				);
			},
			strike(g) {
				const st = FX.q(".cyf-stage"),
					sp = FX.q(".cyf-sparks");
				if (!st || !sp) return;
				st.style.setProperty("--glow", String(Math.min(1.4, g)));
				const ham = FX.q(".cyf-ham");
				if (ham) {
					ham.classList.remove("hit");
					void ham.offsetWidth;
					ham.classList.add("hit");
				}

				const sm = FX.q("[data-smith]");
				if (sm && !reduce())
					try {
						sm.beginElement();
					} catch {}
				if (reduce()) return;

				const big = st.classList.contains("cyf-r") ? 2.2 : 1;
				let s = "";
				for (let i = 0; i < 8; i++) {
					const a = -160 + i * 20 + Math.random() * 14,
						d = (50 + Math.random() * 60) * big;
					s += `<i style="--dx:${(Math.cos((a * Math.PI) / 180) * d).toFixed(0)}px;--dy:${(Math.sin((a * Math.PI) / 180) * d).toFixed(0)}px;animation-delay:${(0.27 + Math.random() * 0.05).toFixed(2)}s"></i>`;
				}
				sp.innerHTML = s;
				FX.later(() => {
					if (sp.isConnected) sp.innerHTML = "";
				}, 1000);
			},

			result(x) {
				FX.res = x;
				if (ANI.want(x)) {
					ANI.play(x, () => FX.show(x));
					return;
				}
				if (FX.done || !FX.busy) FX.show(x);
			},
			show(x) {
				const st = FX.q(".cyf-stage"),
					big = FX.q(".cyf-big");
				FX.busy = false;
				if (!st || !big) return;
				st.classList.remove("work", "wait");

				const c = x.out === "up" ? "ok" : x.out === "broken" ? "bad" : "save";
				FX.anim = { c, t: Date.now() + 1500 };
				if (x.out === "broken") FX.keep = FX.cur;
				FX.last = {
					c,
					t:
						x.out === "up"
							? `Удалось: +${x.to}`
							: x.out === "broken"
								? "Не выдержала заточки"
								: x.out === "down"
									? "Не вышло — сфера сберегла, −1"
									: "Не вышло — вещь цела",
				};
				const sl = FX.slot();
				if (sl) {
					sl.classList.remove("work", "ok", "bad", "save");
					void sl.offsetWidth;
					sl.classList.add(c);
				}
				if (C.S && C.S.panel) forgeList(C.X.hero());
				if (x.out === "up") {
					st.classList.add("ok");
					big.textContent = "+" + x.to;
					st.style.setProperty(
						"--glow",
						String(Math.min(1.4, 0.4 + x.to / 15)),
					);
				} else if (x.out === "broken") {
					st.classList.add("bad");
					big.textContent = "Сломалось";
					FX.later(() => st.classList.add("gone"), reduce() ? 0 : 900);
				} else if (x.out === "down") {
					st.classList.add("save");
					big.textContent = "−1";
				} else {
					st.classList.add("save");
					big.textContent = "Цела";
				}
			},
		};

		const MAGIC_ROLES = ["mage", "necromancer", "priest"];

		function kindOf(it) {
			if (!it) return "metal";
			if (it.slot === "trinket") return "magic";
			if (it.slot === "weapon")
				return MAGIC_ROLES.includes(it.role)
					? "magic"
					: it.role === "archer"
						? "light"
						: "metal";
			if (it.slot === "shield") return "metal";
			return it.gear === "cloth"
				? "magic"
				: it.gear === "heavy"
					? "metal"
					: "light";
		}
		const SKIPK = "lgAnvSkip";
		const RUNES = () => {
			let s = "";
			for (let i = 0; i < 8; i++) {
				const a = i * 45;
				s += `<g transform="rotate(${a}) translate(0 -62)"><path d="M-5 -6 L5 6 M5 -6 L-5 6 M0 -8 V8" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" fill="none"/></g>`;
			}
			return `<svg viewBox="-80 -80 160 160" width="200" height="200"><circle r="62" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="10 7"/><circle r="48" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".6"/>${s}</svg>`;
		};
		const ANI = {
			on: false,
			T: [],
			x: null,
			done: null,
			el: null,
			kind: "",
			step: "",

			want(x) {
				const P = C.S && C.S.panel;
				if (!P || !v3on(P) || !x || !x.out || ANI.on) return false;
				if (reduce()) return false;
				try {
					if (
						C.X.animSkip ? C.X.animSkip() : localStorage.getItem(SKIPK) === "1"
					)
						return false;
				} catch (e) {
					return true;
				}
				return true;
			},
			later(fn, ms) {
				ANI.T.push(setTimeout(fn, ms * ANI.k));
			},
			set(step) {
				ANI.step = step;
				if (ANI.el) ANI.el.dataset.step = step;
			},
			play(x, done) {
				const P = C.S.panel,
					wrap = P.querySelector(".cyf-wrap");
				if (!wrap) {
					done();
					return;
				}
				const h = C.X.hero(),
					it = FX.cur || itemOf(h, x.uid) || FX.keep || itemOf(h, FX.uid);
				const kind = kindOf(it),
					tg = +x.target || ((it && +it.en) || 0) + 1,
					slow = tg >= 10,
					way = x.way || FX.boost || "plain";
				const mob = !!(window.LGSiteUi && window.LGSiteUi.is("narrow"));
				ANI.k = Math.max(0.2, +window.LGAnvAniK || 1);
				ANI.stop();
				ANI.on = true;
				ANI.x = x;
				ANI.done = done;
				ANI.kind = kind;

				if (getComputedStyle(P).position === "static")
					P.style.position = "relative";
				const el = document.createElement("div");
				el.className = `cyf-ani k-${kind}${slow ? " slow" : ""}${mob ? " mob" : ""}`;
				el.dataset.r = (it && it.rarity) || "common";
				el.style.top = P.scrollTop + "px";
				el.style.height = P.clientHeight + "px";
				el.setAttribute("role", "status");
				el.setAttribute("aria-live", "polite");
				const bst =
					way === "star" || way === "both"
						? "star"
						: way === "sphere"
							? "sphere"
							: way === "seal"
								? "seal"
								: "";
				const bArt = bst ? C.X.art(BART[bst]) : "";
				el.innerHTML = `<div class="ca-card${bst ? " b-" + bst : ""}${way === "both" ? " b-sphere2" : ""}">
        <div class="ca-stage" aria-hidden="true">
          <i class="ca-glow"></i>
          <div class="ca-runes">${kind === "magic" ? RUNES() : ""}</div>
          <div class="ca-anv">${anvilSvg()}</div>
          <div class="ca-it"><i class="ca-heat"></i><span class="ca-art ca-l">${it ? C.X.art(it) : ""}</span><span class="ca-art ca-r">${it ? C.X.art(it) : ""}</span><svg class="ca-crack" viewBox="0 0 100 100"><path d="M52 4 L44 26 L58 40 L42 58 L56 74 L48 96" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/></svg></div>
          ${bst === "star" ? `<div class="ca-star">${bArt}</div>` : ""}${bst === "sphere" || way === "both" ? '<i class="ca-bub"></i>' : ""}${bst === "seal" ? `<div class="ca-seal">${bArt}</div>` : ""}
          ${kind === "magic" ? "" : `<div class="ca-ham">${hammerSvg()}</div>`}
          <div class="ca-sparks"></div><div class="ca-steam"><i></i><i></i><i></i></div><div class="ca-shards"></div>
          <i class="ca-flash"></i><b class="ca-big"></b>
        </div>
        <p class="ca-t"></p>
        <button type="button" class="btn ghost sm ca-skip" data-aniskip>Пропустить</button>
      </div>`;
				P.appendChild(el);
				ANI.el = el;
				el.querySelector("[data-aniskip]").addEventListener("click", () =>
					ANI.finish(),
				);
				wrap.classList.add("cyf-focus");
				const say = (t) => {
					const p = el.querySelector(".ca-t");
					if (p) p.textContent = t;
				};
				const beat = slow ? 820 : 560;
				let t = 60;
				ANI.later(() => {
					el.classList.add("in");
					ANI.set("in");
				}, 0);

				if (bst) {
					t += 260;
					ANI.later(() => {
						ANI.set("boost");
						el.classList.add("boost");
						say(
							bst === "star"
								? "Счастливая звезда падает на вещь…"
								: bst === "sphere"
									? "Сфера сохранения окутывает вещь…"
									: "Печать Ауруса ставит оттиск…",
						);
					}, t);
					t += 650;
				}

				ANI.later(() => {
					ANI.set(kind === "magic" ? "rise" : "heat");
					el.classList.add(kind === "magic" ? "rise" : "heat");
					say(
						kind === "magic"
							? "Вещь поднимается, руны загораются…"
							: kind === "light"
								? "Кузнец прогревает вещь…"
								: "Вещь раскаляется…",
					);
				}, t);
				t += kind === "magic" ? 600 : 650;
				for (let i = 0; i < 3; i++) {
					ANI.later(() => {
						ANI.set("hit" + (i + 1));
						el.dataset.n = String(i + 1);
						ANI.hit(kind, mob);
						say(
							kind === "magic"
								? `Пульс энергии ${i + 1} из 3`
								: `Удар ${i + 1} из 3`,
						);
					}, t);
					t += beat;
				}
				if (kind !== "magic") {
					ANI.later(() => {
						ANI.set("quench");
						el.classList.add("quench");
						say("Закалка в воде…");
					}, t);
					t += 700;
				}
				if (slow) {
					ANI.later(() => {
						ANI.set("tense");
						el.classList.add("tense");
						say("Ещё мгновение…");
					}, t);
					t += 450;
				}
				ANI.later(() => ANI.res(say), t);
				ANI.later(() => ANI.finish(), t + 1500);
			},

			hit(kind, mob) {
				const el = ANI.el;
				if (!el) return;
				el.classList.remove("beat");
				void el.offsetWidth;
				el.classList.add("beat");
				if (kind === "magic") return;
				const sp = el.querySelector(".ca-sparks");
				if (!sp) return;
				const n = mob ? 4 : kind === "light" ? 5 : 8;
				let s = "";
				for (let i = 0; i < n; i++) {
					const a = -170 + i * (160 / n) + Math.random() * 12,
						d = 50 + Math.random() * 60;
					s += `<i style="--dx:${(Math.cos((a * Math.PI) / 180) * d).toFixed(0)}px;--dy:${(Math.sin((a * Math.PI) / 180) * d).toFixed(0)}px"></i>`;
				}
				sp.innerHTML = s;
			},

			res(say) {
				const el = ANI.el,
					x = ANI.x;
				if (!el || !x) return;
				const r =
					x.out === "up"
						? "up"
						: x.out === "broken"
							? "broken"
							: x.out === "down"
								? "down"
								: "same";
				ANI.set("r-" + r);
				el.classList.add("res", "r-" + r);
				const big = el.querySelector(".ca-big");
				if (r === "broken") {
					const sh = el.querySelector(".ca-shards");
					if (sh) {
						let s = "";
						const n = el.classList.contains("mob") ? 6 : 10;
						for (let i = 0; i < n; i++) {
							const a = i * (360 / n) + Math.random() * 20,
								d = 40 + Math.random() * 50;
							s += `<i style="--dx:${(Math.cos((a * Math.PI) / 180) * d).toFixed(0)}px;--dy:${(Math.sin((a * Math.PI) / 180) * d + 30).toFixed(0)}px;--rz:${Math.round(Math.random() * 180 - 90)}deg"></i>`;
						}
						sh.innerHTML = s;
					}
				}
				if (big)
					big.textContent =
						r === "up"
							? `+${+x.to}`
							: r === "broken"
								? "Сломалась"
								: r === "down"
									? x.to
										? `+${+x.to}`
										: "+0"
									: "Не вышло";
				say(
					r === "up"
						? `Удалось: +${+x.to}`
						: r === "broken"
							? "Вещь не выдержала заточки"
							: r === "down"
								? "Сфера лопнула и сберегла вещь: заточка -1"
								: "Не вышло - вещь цела",
				);
			},

			finish() {
				if (!ANI.on) return;
				const done = ANI.done;
				ANI.stop();
				if (done) done();
			},
			stop() {
				ANI.T.forEach(clearTimeout);
				ANI.T = [];
				const was = ANI.on;
				ANI.on = false;
				ANI.done = null;
				ANI.step = "";
				if (ANI.el) {
					ANI.el.remove();
					ANI.el = null;
				}
				if (was && C.S && C.S.panel) {
					const w = C.S.panel.querySelector(".cyf-wrap");
					if (w) w.classList.remove("cyf-focus");
				}
			},
			k: 1,
		};

		const shopAfter = () => {
			const g = C.S.panel.querySelector("[data-goanvil]");
			if (g) g.onclick = () => C.goBuilding("anvil");
		};

		return {
			shop: (h) => forgeShop(h),
			shopAfter,
			body: (h) => forgeBody(h),
			after: (h, P) => forgeAfter(h, P),
			list: (h, P) => forgeList(h, P),
			pick: (uid, P) => pickForge(uid, P),
			stage: () => forgeStage(),
			igOff: () => igOff(),
			FX,
			ANI,
			kindOf,
		};
	};
})();
