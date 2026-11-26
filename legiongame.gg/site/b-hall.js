(() => {
	(window.LGCityBuildings = window.LGCityBuildings || {}).hall = (C, SH) => {
		const esc = C.esc,
			say = (t) => C.say(t),
			inTown = () => C.inTown();

		function hallBody() {
			if (inTown() && C.TOWN.acc && !C.TOWN.acc.own)
				return `${say("Ратуша закрыта: этот округ не принадлежит каналу. Стража пускает только своих.")}<p class="note">Захватите округ на стриме — Ратуша откроется (и цены в лавках станут обычными).</p>`;
			return `${say("Склад Ратуши: сюда скупщик шахты этого города свозит всё, что сдали игроки. Потратить на город можно будет позже.")}<div class="cy-hall" aria-busy="true"><p class="note">Писарь листает книгу склада…</p></div><p class="note">Скоро: город можно будет укреплять всем каналом — и защищать от набегов.</p>`;
		}

		let hallT = 0;
		async function hallLoad() {
			clearTimeout(hallT);
			const box = C.S && C.S.panel && C.S.panel.querySelector(".cy-hall");
			if (!box) return;

			hall2Wide(hall2On());
			const c = inTown() ? C.TOWN.id : "home";
			try {
				if (C.X.mineFiles) await C.X.mineFiles();
			} catch (e) {}
			const r = await C.X.api("/api/mine/hall?c=" + encodeURIComponent(c));
			if (!C.S || C.S.panelId !== "hall" || !box.isConnected) return;
			box.removeAttribute("aria-busy");
			if (r && r.ok) HV.r = r;
			hall2Wide(!!(r && r.ok && r.hall && hall2On()));

			if (HV.inv && HV.inv.dragging()) HV.later = true;
			else if (
				!(
					box.contains(document.activeElement) &&
					/^(INPUT|SELECT)$/.test(document.activeElement.tagName)
				)
			) {
				box.innerHTML = hallHtml(r && r.ok ? r : null);
				hallBind(box);
				hall2Mount(box);
			}

			if (r && r.hall && hall2On()) {
				const pv = box.previousElementSibling;
				if (pv && !pv.classList.contains("cy-hall")) {
					pv.hidden = true;
					pv.style.display = "none";
				}
			}
			if (r && r.hall) {
				const nx = box.nextElementSibling;
				if (nx && nx.classList.contains("note")) {
					nx.hidden = true;
					nx.style.display = "none";
				}
				const pv = box.previousElementSibling;
				if (pv && !pv.dataset.h3) {
					pv.dataset.h3 = "1";
					const t = pv.querySelector("p") || pv;
					t.textContent = r.hall.w
						? "Ратуша: казна города, Мэр и стройки. Казну пополняют взносы игроков альянса, тратят Мэр, глава гильдии-управляющей и стример."
						: "Ратуша: казна канала, мэр и стройки города. Казну пополняют скупщик, сборы на лифт и буровые и взносы зрителей.";
				}
			}
			hallT = setTimeout(() => {
				if (C.S && C.S.panelId === "hall") hallLoad();
			}, 30000);
		}
		function hallHtml(r) {
			if (!r)
				return '<p class="note">Книга склада не открылась - попробуй ещё раз.</p>';
			const RES = (window.LGCraftWorld && window.LGCraftWorld.RES) || {},
				me = C.X.login();
			const group = (kind, title) => {
				const a = r.res.filter((x) => x.kind === kind);
				return a.length
					? `<h4>${esc(title)}</h4><ul class="cy-hres">${a.map((x) => `<li class="${kind}" data-res="${esc(x.id)}"><i style="background:${esc(RES[x.id] || "#a89c88")}"></i><span>${esc(x.name)}</span><b>${x.q}</b></li>`).join("")}</ul>`
					: "";
			};

			const res = r.rh
				? '<p class="note">Склад видят только стример и мэр.</p>'
				: r.res.length
					? group("gem", "Самоцветы") +
						group("rare", "Редкое") +
						group("ore", "Руда и камень")
					: '<p class="note">Склад пока пуст: сдай руду скупщику в шахте этого города - она приедет сюда.</p>';
			const top = r.gv.length
				? `<h4>Больше всех сдали</h4><ol class="cy-hgv">${r.gv
						.slice(0, 50)
						.map(
							([l, n], i) =>
								`<li class="${l === me ? "me" : ""}"><span>${i + 1}</span><b>${esc(l === me ? l + " (ты)" : l)}</b><em>${n}</em></li>`,
						)
						.join("")}</ol>`
				: "";

			if (r.hall && hall2On()) return hall4Html(r);
			if (r.hall) return hall3Html(r, RES, top, res);
			return `<h3 class="h3">Склад города</h3>${res}${top}`;
		}

		const BLD_NAMES = {
			gate: "Ворота",
			hall: "Ратуша",
			auction: "Аукцион",
			trainer: "Тренер",
			board: "Доска объявлений",
			storage: "Склад",
			anvil: "Наковальня",
			forge: "Кузня",
			tent: "Шатёр",
			shop: "Лавка",
			magic: "Магическая лавка",
			walls: "Стены",
			towers: "Башни",
		};
		function hall3Html(r, RES, top, resList) {
			const H = r.hall,
				role = r.role || "",
				M = (n) => (C.X.money ? C.X.money(n) : String(n)),
				can = !!role,
				now = Date.now();
			const cells = [];
			for (const x of r.res) {
				let q = x.q;
				while (q > 0 && cells.length < 400) {
					const n = Math.min(q, H.stack);
					cells.push([x, n]);
					q -= n;
				}
			}
			const used = cells.length,
				grid = Array.from(
					{ length: Math.max(Math.min(H.slots, 20), used) },
					(_, i) => {
						const c = cells[i];
						return c
							? `<li class="cy-hs ${c[0].kind}${i >= H.slots ? " over" : ""}" title="${esc(c[0].name)} ×${c[1]}"><i style="background:${esc(RES[c[0].id] || "#c8b89a")}"></i><b>${c[1]}</b>${can ? `<button type="button" class="cy-htk" data-htake="${esc(c[0].id)}" data-q="${c[1]}" aria-label="Забрать ${esc(c[0].name)} в сумку">↓</button>` : ""}</li>`
							: '<li class="cy-hs empty"></li>';
					},
				).join("");
			const who = H.mayor
				? `Мэр - <b>${esc(H.mayor)}</b>`
				: H.w
					? `Мэра нет - казной управляют стример <b>${esc(H.ch || "")}</b>${H.guild ? " и глава гильдии-управляющей" : ""}`
					: `Мэра нет - казной управляет стример <b>${esc(H.ch || "")}</b>`;
			let mayorBox = `<p>${who}.${H.mayor ? ` Лимит мэра - ${M(H.lim)} ${H.per === "week" ? "в неделю, на этой неделе" : "в сутки, сегодня"} потрачено ${M(H.sp)}` : ""}</p>`;
			if (role === "streamer" || (H.w && role === "lead"))
				mayorBox += `<div class="cy-hrow"><input class="input" data-hmayor placeholder="ник мэра" maxlength="25" value="${esc(H.mayor)}"><button type="button" class="btn primary sm" data-hset>Назначить</button>${H.mayor ? '<button type="button" class="btn ghost sm" data-hunset>Снять</button>' : ""}</div>`;
			if (role === "streamer")
				mayorBox += `<div class="cy-hrow"><label>Лимит мэра <input class="input" data-hlim type="number" min="0" step="100" value="${H.lim}"></label><select class="input" data-hper><option value="day"${H.per !== "week" ? " selected" : ""}>в сутки</option><option value="week"${H.per === "week" ? " selected" : ""}>в неделю</option></select><button type="button" class="btn ghost sm" data-hlimset>Сохранить</button></div>`;
			let bld = "";
			if (H.town)
				bld = `<h4>Здания города</h4><ul class="cy-hbld">${Object.keys(
					BLD_NAMES,
				)
					.filter((k) => H.lv[k])
					.map((k) => {
						const lv = H.lv[k],
							b = H.b[k],
							to = lv + 1,
							cost = H.cost[to - 2];
						const st =
							b && b.until > now
								? `стройка до ур. ${b.to}: ${Math.ceil((b.until - now) / 3600e3)} ч`
								: lv >= 5
									? "ур. 5 - лучше не бывает"
									: `ур. ${lv} → ${to}: ${M(cost)}, ${H.hours[to - 2]} ч`;
						return `<li><span><b>${esc(BLD_NAMES[k])}</b> · ур. ${lv}</span><em>${st}</em>${can && !(b && b.until > now) && lv < 5 ? `<button type="button" class="btn ghost sm" data-hup="${k}"${cost > H.val ? ' disabled title="в казне не хватает"' : ""}>Улучшить</button>` : ""}</li>`;
					})
					.join("")}</ul>
      <p class="note">Лучше здание - лучше товар: на ур. 5 в лавках появляются эпические вещи.</p>`;
			const ore = can
				? (C.X.hero().items || []).filter(
						(it) => it && it.qty && it.q > 0 && it.res,
					)
				: [];

			const P = r.bp || {},
				mine = (C.X.hero().items || []).filter(
					(it) =>
						it &&
						it.qty &&
						it.q > 0 &&
						it.res &&
						+P[it.res] > 0 &&
						!hallGone(it.uid),
				);
			const give = mine.length
				? `<h4>Взнос в казну</h4><p class="note">Отдай руду городу вместо продажи скупщику - попадёшь на доску почёта. Уходит только та кучка, у которой нажал «Отдать» и подтвердил, - вся целиком.</p><ul class="cy-hput">${mine
						.slice(0, 10)
						.map(
							(it) =>
								`<li><span>${esc(it.name)} <small>${esc(oreQ(it.q))}</small></span><button type="button" class="btn ${hallAsked(it.uid) ? "primary" : "ghost"} sm" data-hgive="${esc(it.uid)}" data-q="${it.q}" data-qt="${esc(oreQ(it.q))}" data-v="${esc(M(Math.floor((it.q * P[it.res]) / 100)))}">${hallAsked(it.uid) ? `Точно отдать ${esc(oreQ(it.q))}?` : `Отдать ≈${M(Math.floor((it.q * P[it.res]) / 100))}`}</button></li>`,
						)
						.join("")}</ul>`
				: "";
			const me0 = C.X.login(),
				board = (H.donors || []).length
					? `<h4>Доска почёта казны</h4><ol class="cy-hgv">${H.donors.map(([l, v], i) => `<li class="${l === me0 ? "me" : ""}"><span>${i + 1}</span><b>${esc(l === me0 ? l + " (ты)" : l)}</b><em>${M(v)}</em></li>`).join("")}</ol>`
					: "";
			const put =
				can && !H.w && ore.length
					? `<h4>Положить из сумки</h4><ul class="cy-hput">${ore
							.slice(0, 12)
							.map(
								(it) =>
									`<li><span>${esc(it.name)}</span><button type="button" class="btn ghost sm" data-hput="${esc(it.uid)}" data-q="${it.q}">Положить</button></li>`,
							)
							.join("")}</ul>`
					: "";
			const log = (H.log || []).length
				? `<details class="cy-hlog"><summary>Журнал Ратуши</summary><ul>${H.log.map((e) => `<li>${esc(e.t)}</li>`).join("")}</ul></details>`
				: "";
			return `${H.w ? `<h3 class="h3">Казна города</h3><p class="note">Казна этого города - взносы игроков альянса. Тратят на здания Мэр, глава гильдии-управляющей и стример. В казне ${M(H.val)}</p>` : `<h3 class="h3">Казна канала</h3><p class="note">Одна на все города канала, не сбрасывается. Сюда - то, что сдают скупщику, руда со сборов на лифт и буровые, доля буровых. В казне руды на ${M(H.val)}</p>`}
      ${
				H.w
					? rsHtml(H) +
						(
							can
								? ""
								: '<p class="note">Тратить казну могут Мэр, глава гильдии-управляющей и стример.</p>'
						)
					: r.rh
						? '<p class="note">Склад Ратуши видят только стример и мэр.</p>'
						: `<div class="m2-k">Склад Ратуши <small>${used} из ${H.slots} ячеек${used > H.slots ? " - склад полон, лишнее лежит во дворе" : ""}${can ? " · ↓ - забрать в сумку" : ""}</small></div><ul class="cy-hgrid">${grid}</ul>
      ${can ? "" : '<p class="note">Брать со склада и тратить казну могут стример и мэр.</p>'}
      <details class="cy-hlist"><summary>Склад города по видам</summary>${resList}</details>`
			}
      ${hallCoinHtml(H)}<h4>Мэр</h4>${mayorBox}${bld}${put}${give}${board}${log}${top}`;
		}

		const HALL_ASK_MS = 8000,
			HALL_ASK_MIN = 350,
			HG = { ask: null, gone: new Map() };
		const oreQ = (q) =>
			window.LGInventory && window.LGInventory.oreQty
				? window.LGInventory.oreQty(q)
				: `${Math.floor(q / 100)} шт.${q % 100 ? ` + ${q % 100} оск.` : ""}`;
		const hallAsked = (uid) =>
			!!(HG.ask && HG.ask.uid === uid && Date.now() - HG.ask.at < HALL_ASK_MS);
		const hallGone = (uid) => {
			const t = HG.gone.get(uid);
			return !!(t && Date.now() - t < 60000);
		};
		function hallGiveAsk(box, b) {
			const uid = b.dataset.hgive,
				a = HG.ask,
				dt = a && a.uid === uid ? Date.now() - a.at : -1;

			const plain = (x) => {
				x.classList.remove("primary");
				x.classList.add("ghost");
				x.innerHTML = `Отдать ≈${x.dataset.v}`;
			};
			if (dt >= HALL_ASK_MIN && dt < HALL_ASK_MS) {
				HG.ask = null;
				b.disabled = true;
				hallAct({ a: "give", lines: [[uid, +b.dataset.q]] }, uid);
				return;
			}

			if (dt >= 0 && dt < HALL_ASK_MIN) return;
			box.querySelectorAll("[data-hgive]").forEach((x) => {
				if (x !== b) plain(x);
			});
			HG.ask = { uid, at: Date.now() };
			b.classList.remove("ghost");
			b.classList.add("primary");
			b.textContent = `Точно отдать ${b.dataset.qt}?`;
			setTimeout(() => {
				if (
					HG.ask &&
					HG.ask.uid === uid &&
					Date.now() - HG.ask.at >= HALL_ASK_MS
				) {
					HG.ask = null;
					if (b.isConnected) plain(b);
				}
			}, HALL_ASK_MS + 50);
		}

		const HC = { ask: null };
		const hallCoinOn = (H) => !!(H && H.w && (C.X.hero() || {}).hc);
		const hallCoinHave = () =>
			Math.max(0, Math.floor(+(C.X.hero() || {}).money || 0));
		function hallCoinHtml(H) {
			if (!hallCoinOn(H)) return "";
			const M = (n) => (C.X.money ? C.X.money(n) : String(n)),
				have = hallCoinHave();
			return (
				`<section class="cy-hcard cy-hcoin" aria-label="Взнос в казну монетами"><h4><span aria-hidden="true">🪙</span> Взнос монетами</h4>` +
				`<p class="note">1 монета = 1 в казне города - на стройки зданий; назад казна монет не отдаёт. Попадёшь на доску почёта. В кошельке ${M(have)}.</p>` +
				(have > 0
					? `<div class="cy-hrow"><input class="input" data-hcoinv type="number" min="1" max="${have}" step="1" inputmode="numeric" placeholder="сколько" aria-label="Сколько монет внести в казну города"><button type="button" class="btn ghost sm" data-hcoinall>Всё</button><button type="button" class="btn primary sm" data-hcoin>Внести</button></div>`
					: '<p class="note">В кошельке пусто - сначала заработай в походе или в шахте.</p>') +
				"</section>"
			);
		}
		function hallCoinBind(box) {
			const inp = box.querySelector("[data-hcoinv]"),
				go = box.querySelector("[data-hcoin]"),
				all = box.querySelector("[data-hcoinall]");
			if (!inp || !go) return;
			const M = (n) => (C.X.money ? C.X.money(n) : String(n));
			const plain = () => {
				HC.ask = null;
				go.innerHTML = "Внести";
			};
			inp.addEventListener("input", plain);
			if (all)
				all.onclick = () => {
					inp.value = String(hallCoinHave());
					plain();
					try {
						inp.focus({ preventScroll: true });
					} catch (e) {}
				};
			go.onclick = () => {
				const n = Math.floor(+inp.value || 0),
					have = hallCoinHave(),
					tell = (t) => {
						if (C.X.toast) C.X.toast(t, true);
					};
				if (!(n >= 1)) {
					tell("Сколько монет внести? Впиши число");
					return;
				}
				if (n > have) {
					tell("Столько монет нет в кошельке");
					return;
				}
				const a = HC.ask,
					dt = a && a.n === n ? Date.now() - a.at : -1;
				if (dt >= HALL_ASK_MIN && dt < HALL_ASK_MS) {
					HC.ask = null;
					go.disabled = true;
					inp.value = "";
					hallAct({ a: "give", coins: n });
					return;
				}
				if (dt >= 0 && dt < HALL_ASK_MIN) return;
				HC.ask = { n, at: Date.now() };
				go.innerHTML = `Точно внести ${M(n)}?`;
				setTimeout(() => {
					if (
						HC.ask &&
						HC.ask.n === n &&
						Date.now() - HC.ask.at >= HALL_ASK_MS &&
						go.isConnected
					)
						plain();
				}, HALL_ASK_MS + 50);
			};
		}

		const HALL_GAP = 1200,
			HALL_RETRY = [1200, 2000, 3000],
			HS = { q: Promise.resolve(), at: 0 };
		const hallWait = (ms) => new Promise((ok) => setTimeout(ok, ms));
		const hallBusy = (r) =>
			!!(
				r &&
				!r.ok &&
				(r.wait || /прошлое ещё не закончено/.test(String(r.error || "")))
			);

		const hallId = () => {
			try {
				const a = new Uint8Array(8);
				crypto.getRandomValues(a);
				return (
					"h" + [...a].map((x) => x.toString(16).padStart(2, "0")).join("")
				);
			} catch (e) {
				return (
					"h" +
					Date.now().toString(36) +
					Math.random().toString(36).slice(2, 10)
				);
			}
		};
		const hallLost = (r, b) =>
			["lim", "mayor", "up"].includes(b.a) &&
			!!(r && !r.ok && /нет связи/.test(String(r.error || "")));
		function hallSend(b) {
			const body = { c: inTown() ? C.TOWN.id : "home", ...b, id: hallId() };
			const run = async () => {
				const gap = HS.at + HALL_GAP - Date.now();
				if (gap > 0) await hallWait(gap);
				let r = await C.X.api("/api/mineHall", body);
				for (const ms of HALL_RETRY) {
					if (!hallBusy(r) && !hallLost(r, body)) break;
					await hallWait(ms);
					r = await C.X.api("/api/mineHall", body);
				}
				if (r && r.ok) HS.at = Date.now();
				return r;
			};
			const p = HS.q.then(run, run);
			HS.q = p.catch((e) => console.warn("[Ратуша]", e));
			return p;
		}
		async function hallAct(b, gaveUid) {
			const r = await hallSend(b);
			const tell = (t, bad) => {
				if (C.X.toast) C.X.toast(t, bad);
			};
			if (!r || !r.ok) {
				tell((r && r.error) || "Не получилось", true);
				if (gaveUid && C.S && C.S.panelId === "hall") hallLoad();
				return;
			}
			if (gaveUid) {
				HG.gone.set(gaveUid, Date.now());
				const box = C.S && C.S.panel && C.S.panel.querySelector(".cy-hall"),
					li =
						box && box.querySelector(`[data-hgive="${CSS.escape(gaveUid)}"]`);
				if (li && li.closest("li")) li.closest("li").remove();
			}
			tell((r.x && r.x.t) || "Готово - Ратуша обновится через пару секунд");
			setTimeout(() => {
				if (C.S && C.S.panelId === "hall") hallLoad();
			}, 2500);
		}
		function hallBind(box) {
			const q = (sel) => box.querySelector(sel);
			box.querySelectorAll("[data-htake]").forEach((b) => {
				b.onclick = () =>
					hallAct({ a: "take", item: b.dataset.htake, n: +b.dataset.q });
			});
			box.querySelectorAll("[data-hup]").forEach((b) => {
				b.onclick = () => hallAct({ a: "up", item: b.dataset.hup });
			});
			box.querySelectorAll("[data-hput]").forEach((b) => {
				b.onclick = () =>
					hallAct({ a: "put", lines: [[b.dataset.hput, +b.dataset.q]] });
			});
			box.querySelectorAll("[data-hgive]").forEach((b) => {
				b.onclick = () => hallGiveAsk(box, b);
			});
			const st = q("[data-hset]");
			if (st)
				st.onclick = () =>
					hallAct({ a: "mayor", item: (q("[data-hmayor]") || {}).value || "" });
			const un = q("[data-hunset]");
			if (un) un.onclick = () => hallAct({ a: "mayor", item: "" });
			const lm = q("[data-hlimset]");
			if (lm)
				lm.onclick = () =>
					hallAct({
						a: "lim",
						n: +((q("[data-hlim]") || {}).value || 0),
						item: (q("[data-hper]") || {}).value || "day",
					});
			hallCoinBind(box);
		}

		const HV = {
			mode: "st",
			inv: null,
			host: null,
			key: "",
			r: null,
			later: false,
			minus: new Map(),
			st: [],
			T: 0,
		};
		const hall2On = () => {
			const h = C.X.hero();
			return !!(h && h.hu && window.LGInventory && window.LGInventory.mount);
		};
		function hall2Wide(on) {
			const P = C.S && C.S.panel;
			if (P && P.classList) P.classList.toggle("cy-hwide", !!on);
		}
		const hall2Can = (r) => !!(r && r.role && !r.rh);
		const hall2Mode = (r) =>
			r && r.hall && r.hall.w ? "give" : hall2Can(r) ? HV.mode : "give";
		const KIND = {
			gem: ["gem", "epic"],
			rare: ["rare", "rare"],
			ore: ["ore", "common"],
		};

		function hall2Store(r) {
			const H = r.hall,
				out = [],
				mine = (C.X.hero() || {}).items || [];
			for (const x of r.res || []) {
				const same = mine.find((it) => it && it.qty && it.res === x.id),
					K = KIND[x.kind] || KIND.ore;
				let q = Math.max(0, Math.floor(+x.q || 0)),
					k = 0;
				while (q > 0 && out.length < 400) {
					const n = Math.min(q, Math.max(1, +H.stack || 10000));
					out.push({
						uid: `h:${x.id}:${k}`,
						id: "ore_" + x.id + (k ? "#" + k : ""),
						res: x.id,
						name: x.name,
						slot: "material",
						mat: "ore",
						ore: same ? same.ore : K[0],
						rarity: same ? same.rarity : K[1],
						qty: 100,
						q: n * 100,
						hall: 1,
					});
					q -= n;
					k++;
				}
			}
			return out;
		}

		function hall2Items() {
			const h = C.X.hero() || {},
				now = Date.now();
			return (h.items || [])
				.map((it) => {
					const m = it && HV.minus.get(it.uid);
					if (!m) return it;
					if (now - m.at > 60000 || +it.q !== m.base) {
						HV.minus.delete(it.uid);
						return it;
					}
					return { ...it, q: Math.max(0, m.base - m.d) };
				})
				.filter((it) => !(it && it.qty && !(+it.q > 0)));
		}
		function hall2Data(r) {
			const h = C.X.hero() || {},
				items = hall2Items(),
				give = hall2Mode(r) === "give";
			const base = {
				hero: h,
				items,
				bagCap: h.sg ? h.sg.cap : null,
				stack: h.sg ? h.sg.bs : 20,
				...(+h.ob > 0 ? { obCap: +h.ob } : {}),
			};

			if (give) {
				const seen = new Set(),
					ph = [];
				for (const it of items)
					if (it && it.qty && it.res && !seen.has(it.id)) {
						seen.add(it.id);
						ph.push({
							uid: "hp:" + it.id,
							id: it.id,
							res: it.res,
							name: it.name,
							slot: "material",
							mat: "ore",
							ore: it.ore,
							qty: 100,
							q: 0,
						});
					}
				return { ...base, storage: ph, storageCap: 0, storageStack: 99 };
			}
			HV.st = hall2Store(r);
			return {
				...base,
				storage: HV.st,
				storageCap: r.hall.slots,
				storageStack: 99,
			};
		}
		const hall2Labels = (give) =>
			give
				? {
						storage: "Приём руды",
						put: "Пожертвовать",
						full: "Казна принимает только руду шахты",
						all: "Всё",
					}
				: {
						storage: "Склад Ратуши",
						put: "На склад Ратуши",
						take: "В сумку",
						full: "На склад Ратуши - только руда шахты",
						all: "Всё",
					};
		function hall2Off() {
			hallQtyClose();
			if (HV.inv) {
				try {
					HV.inv.destroy();
				} catch (e) {
					console.warn("[Ратуша]", e);
				}
			}
			HV.inv = null;
			HV.host = null;
			HV.key = "";
		}
		function hall2Mount(box) {
			const ph = box.querySelector("[data-hinv]"),
				r = HV.r;
			if (!ph || !r || !r.hall) {
				hall2Off();
				return;
			}
			const mode = hall2Mode(r),
				give = mode === "give";
			hall2Bind(box);
			if (HV.inv && HV.key === mode) {
				ph.replaceWith(HV.host);
				HV.inv.update(hall2Data(r));
				hall2Slots();
				return;
			}
			hall2Off();
			HV.host = ph;
			HV.key = mode;
			HV.inv = window.LGInventory.mount(ph, {
				variant: "full",
				mode: "storage",
				data: hall2Data(r),
				actions: { move: (uid, from, to, n, c) => hall2Move(uid, from, c) },
				options: {
					header: false,
					detail: false,
					slots: true,
					qty: false,
					sort: false,
					filters: false,
					...(give ? { hint: false } : {}),
					art: C.X.art,
					label: give ? "Сумка и приём руды" : "Сумка и склад Ратуши",
					cardTip: C.X.cardTip
						? (el, it) => C.X.cardTip(el, it, C.X.hero())
						: null,
					tipHide: C.X.tipHide ? () => C.X.tipHide() : null,
					say: (t) => hall2Msg(t, true),
					labels: hall2Labels(give),
					onDragEnd: () => {
						if (HV.later) {
							HV.later = false;
							hall2Redraw();
						}
					},
				},
			});
			hall2Slots();
		}

		function hall2Redraw() {
			const box = C.S && C.S.panel && C.S.panel.querySelector(".cy-hall");
			if (!box || !HV.r || C.S.panelId !== "hall") return;
			box.innerHTML = hallHtml(HV.r);
			hallBind(box);
			hall2Mount(box);
		}

		function hall2Slots() {
			const host = HV.host,
				r = HV.r;
			if (!host || !r) return;
			const f = host.querySelector('[data-lgi="gf-st"]');
			if (!f) return;
			const give = hall2Mode(r) === "give",
				used = HV.st.length,
				H = r.hall;
			const html = give
				? `<div class="cy-hdrop" data-hdrop><span class="cy-hdi" aria-hidden="true">${HALL_CHEST}</span><b class="cy-hdt">Приём руды</b><span class="cy-hdh">Перетащи сюда руду - она уйдёт в казну города, а ты попадёшь на доску почёта</span><small class="cy-hds">${window.LGSiteUi && window.LGSiteUi.is && window.LGSiteUi.is("touch") ? "Или нажми на руду в сумке и «Пожертвовать»." : "Или выбери руду в сумке и нажми «Пожертвовать»."} Сколько - спросим.</small></div>`
				: used > H.slots
					? '<p class="note cy-hover">Склад Ратуши полон - лишнее лежит во дворе.</p>'
					: "";
			if (f.dataset.k !== html) {
				f.dataset.k = html;
				f.innerHTML = html;
			}
		}
		const HALL_CHEST =
			'<svg viewBox="0 0 64 64" width="56" height="56"><path d="M10 28h44v24a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4Z" fill="#8a5a2b" stroke="#2a1b12" stroke-width="3" stroke-linejoin="round"/><path d="M10 28c0-10 9-16 22-16s22 6 22 16Z" fill="#a8703a" stroke="#2a1b12" stroke-width="3" stroke-linejoin="round"/><path d="M10 28h44v6H10Z" fill="#ffcf6a" stroke="#2a1b12" stroke-width="3"/><rect x="27" y="30" width="10" height="10" rx="2" fill="#ffe9a8" stroke="#2a1b12" stroke-width="2.5"/><circle cx="20" cy="10" r="5" fill="#ffd84a" stroke="#2a1b12" stroke-width="2"/><circle cx="44" cy="7" r="4" fill="#ffd84a" stroke="#2a1b12" stroke-width="2"/><path d="M32 2v6M50 16l-3 3M14 16l3 3" stroke="#ffcf6a" stroke-width="2.5" stroke-linecap="round"/></svg>';
		function hall2Msg(t, bad) {
			const el = C.S && C.S.panel && C.S.panel.querySelector("[data-hmsg]");
			if (!el) return;
			el.textContent = t || "";
			el.classList.toggle("bad", !!bad);
			clearTimeout(HV.T);
			if (t)
				HV.T = setTimeout(() => {
					if (el.isConnected) el.textContent = "";
				}, 6000);
		}

		function hall2Move(uid, from, c) {
			const r = HV.r;
			if (!r || !r.hall) return;
			const give = hall2Mode(r) === "give",
				anchor =
					HV.host &&
					HV.host.querySelector(
						from === "st" ? '[data-lgi="g-bag"]' : '[data-lgi="g-st"]',
					);
			if (from === "st") {
				const it = HV.st.find((x) => x.uid === uid);
				if (!it) return;
				hall2Msg("", false);
				hallQty({
					title: it.name,
					ask: "Сколько забрать в сумку?",
					go: "Забрать",
					max: it.q,
					whole: true,
					at: anchor,
					yes: (q) =>
						hall2Act({ a: "take", item: it.res, n: Math.floor(q / 100) }),
				});
				return;
			}
			const items = hall2Items(),
				it0 = items.find((x) => x && x.uid === uid);
			if (!it0 || !it0.qty || !it0.res) {
				hall2Msg(
					give
						? "Казна принимает только руду шахты - перетащи руду"
						: "На склад Ратуши - только руда шахты",
					true,
				);
				return;
			}
			const heaps = ((c && c.uids) || [uid])
					.map((u) => items.find((x) => x && x.uid === u))
					.filter((x) => x && +x.q > 0),
				max = heaps.reduce((s, x) => s + Math.floor(+x.q), 0);
			if (!(max > 0)) return;
			const P = r.bp || {},
				pr = +P[it0.res] || 0;
			if (give && !(pr > 0)) {
				hall2Msg(
					"За эту руду казна ничего не засчитает - скупщик её не берёт",
					true,
				);
				return;
			}
			hall2Msg("", false);
			hallQty({
				title: it0.name,
				ask: give ? "Сколько пожертвовать?" : "Сколько положить на склад?",
				go: give ? "Пожертвовать" : "Положить",
				max,
				def: Math.min(max, 100),
				price: give ? pr : 0,
				at: anchor,
				yes: (q) => {
					const lines = [];
					let left = q;
					for (const x of heaps) {
						if (left <= 0) break;
						const d = Math.min(left, Math.floor(+x.q));
						lines.push([x.uid, d]);
						left -= d;
					}
					if (lines.length)
						hall2Act({ a: give ? "give" : "put", lines }, heaps);
				},
			});
		}

		function hall2Minus(lines, heaps) {
			const now = Date.now(),
				did = [];
			for (const [u, d] of lines) {
				const x = heaps.find((y) => y.uid === u);
				if (!x) continue;
				const m = HV.minus.get(u);
				HV.minus.set(u, {
					base: m ? m.base : Math.floor(+x.q),
					d: (m ? m.d : 0) + d,
					at: now,
				});
				did.push([u, d]);
			}
			return () => {
				for (const [u, d] of did) {
					const m = HV.minus.get(u);
					if (!m) continue;
					m.d -= d;
					if (!(m.d > 0)) HV.minus.delete(u);
				}
			};
		}
		async function hall2Act(b, heaps) {
			hall2Msg(
				b.a === "give"
					? "Несём руду в казну…"
					: b.a === "put"
						? "Несём руду на склад…"
						: "Несём руду в сумку…",
				false,
			);
			const undo = b.lines && heaps ? hall2Minus(b.lines, heaps) : null;
			if (undo && HV.inv && HV.r) {
				HV.inv.update(hall2Data(HV.r));
				hall2Slots();
			}
			const r = await hallSend(b);
			if (!r || !r.ok) {
				if (undo) {
					undo();
					if (HV.inv && HV.r) {
						HV.inv.update(hall2Data(HV.r));
						hall2Slots();
					}
				}
				hall2Msg((r && r.error) || "Не получилось - попробуй ещё раз", true);
				if (C.X.toast) C.X.toast((r && r.error) || "Не получилось", true);
				return;
			}
			const t =
				(r.x && r.x.t) ||
				(b.a === "give" ? "Спасибо! Руда ушла в казну" : "Готово");
			hall2Msg(t, false);
			if (C.X.toast) C.X.toast(t);
			if (HV.inv && HV.r) {
				HV.inv.update(hall2Data(HV.r));
				hall2Slots();
			}
			for (const ms of [2500, 8000])
				setTimeout(() => {
					if (C.S && C.S.panelId === "hall") hallLoad();
				}, ms);
		}
		function hall2Bind(box) {
			box.querySelectorAll("[data-hmode]").forEach((b) => {
				b.onclick = () => {
					if (HV.mode === b.dataset.hmode) return;
					HV.mode = b.dataset.hmode === "give" ? "give" : "st";
					hallQtyClose();
					hall2Redraw();
				};
			});
		}

		function hall2Hero() {
			if (!C.S || C.S.panelId !== "hall" || !HV.inv || !HV.r) return;
			if (!hall2On()) {
				hall2Off();
				hallLoad();
				return;
			}
			if (HV.inv.dragging()) {
				HV.later = true;
				return;
			}
			HV.inv.update(hall2Data(HV.r));
			hall2Slots();
		}

		function rsHtml(H) {
			if (!Array.isArray(H.rs)) return "";
			const q = (v) =>
				String(+(Math.max(0, Math.floor(+v || 0)) / 100).toFixed(2)).replace(
					".",
					",",
				);
			return `<section class="cy-hcard cy-hrs" aria-label="Склад ресурсов города"><h4>Склад ресурсов города</h4>${
				H.rs.length
					? `<ul class="cy-hres">${H.rs.map(([id, v, nm]) => `<li data-res="${esc(id)}"><span>${esc(nm || id)}</span><b>${q(v)} шт.</b></li>`).join("")}</ul>`
					: '<p class="note">Пока пусто.</p>'
			}<p class="note">Часть улова ремёсел (рыбалка) идёт сюда, за остальное - монеты в казну. На что тратить ресурсы, решит стример.</p></section>`;
		}
		function hall4Html(r) {
			const H = r.hall,
				role = r.role || "",
				W = !!H.w,
				can = W ? !!role : hall2Can(r),
				mode = hall2Mode(r),
				M = (n) => (C.X.money ? C.X.money(n) : String(n)),
				now = Date.now(),
				me = C.X.login();
			const tre = W
				? `<p class="cy-htre"><span class="cy-htri" aria-hidden="true">🏛</span><span>Казна города: <b>${M(H.val)}</b> <small>- взносы игроков альянса; тратят Мэр, глава гильдии-управляющей и стример</small></span></p>`
				: `<p class="cy-htre"><span class="cy-htri" aria-hidden="true">🏛</span><span>Казна канала: руды на <b>${M(H.val)}</b> <small>- одна на все города, не сбрасывается</small></span></p>`;
			const tabs =
				can && !W
					? `<div class="cy-hmode" role="group" aria-label="Что делать с рудой"><button type="button" data-hmode="st" aria-pressed="${mode === "st"}">Склад Ратуши</button><button type="button" data-hmode="give" aria-pressed="${mode === "give"}">Взнос в казну</button></div>`
					: "";
			let mg = "";
			if (can) {
				const who = H.mayor
					? `Мэр - <b>${esc(H.mayor)}</b>`
					: H.w
						? `Мэра нет - казной управляют стример <b>${esc(H.ch || "")}</b>${H.guild ? " и глава гильдии-управляющей" : ""}`
						: `Мэра нет - казной управляет стример <b>${esc(H.ch || "")}</b>`;
				let mb = `<p class="cy-hwho">${who}.${H.mayor ? ` Лимит - ${M(H.lim)} ${H.per === "week" ? "в неделю, на этой неделе" : "в сутки, сегодня"} потрачено ${M(H.sp)}` : ""}</p>`;
				if (role === "streamer" || (W && role === "lead"))
					mb += `<div class="cy-hrow"><input class="input" data-hmayor placeholder="ник мэра" maxlength="25" value="${esc(H.mayor)}" aria-label="Ник мэра"><button type="button" class="btn primary sm" data-hset>Назначить</button>${H.mayor ? '<button type="button" class="btn ghost sm" data-hunset>Снять</button>' : ""}</div>`;
				if (role === "streamer")
					mb += `<div class="cy-hrow"><label class="cy-hlim">Лимит <input class="input" data-hlim type="number" min="0" step="100" value="${H.lim}"></label><select class="input" data-hper aria-label="За какой срок"><option value="day"${H.per !== "week" ? " selected" : ""}>в сутки</option><option value="week"${H.per === "week" ? " selected" : ""}>в неделю</option></select><button type="button" class="btn ghost sm" data-hlimset>Сохранить</button></div>`;
				mg += `<section class="cy-hcard"><h4>Мэр</h4>${mb}</section>`;
				if (H.town)
					mg += `<section class="cy-hcard"><h4>Здания города</h4><ul class="cy-hbld cy-hbld2">${Object.keys(
						BLD_NAMES,
					)
						.filter((k) => H.lv[k])
						.map((k) => {
							const lv = H.lv[k],
								b = H.b[k],
								to = lv + 1,
								cost = H.cost[to - 2];
							const st =
								b && b.until > now
									? `стройка до ур. ${b.to}: ${Math.ceil((b.until - now) / 3600e3)} ч`
									: lv >= 5
										? "лучше не бывает"
										: `→ ур. ${to}: ${M(cost)}, ${H.hours[to - 2]} ч`;
							return `<li><span><b>${esc(BLD_NAMES[k])}</b> <small>ур. ${lv}</small></span><em>${st}</em>${!(b && b.until > now) && lv < 5 ? `<button type="button" class="btn ghost sm" data-hup="${k}"${cost > H.val ? ' disabled title="в казне не хватает"' : ""}>Улучшить</button>` : ""}</li>`;
						})
						.join(
							"",
						)}</ul><p class="note">Лучше здание - лучше товар: на ур. 5 в лавках появляются эпические вещи.</p></section>`;
				mg = `<div class="cy-hmg">${mg}</div>`;
			}
			const D = H.donors || [];
			const board = `<section class="cy-hboard" aria-label="Доска почёта казны"><h4><span aria-hidden="true">🏆</span> Доска почёта</h4>${D.length ? `<ol class="cy-hbd">${D.map(([l, v], i) => `<li class="${i < 3 ? "cy-hp" + (i + 1) : ""}${l === me ? " me" : ""}"><span class="cy-hbn">${i + 1}</span><b>${esc(l)}${l === me ? "<small> (ты)</small>" : ""}</b><em>${M(v)}</em></li>`).join("")}</ol>` : '<p class="note">Пока пусто - отдай руду в казну и стань первым.</p>'}<p class="cy-hbnote">Кто больше всех отдал в казну (по ценам скупщика).</p></section>`;
			const gv = (r.gv || []).length
				? `<details class="cy-hlog"><summary>Больше всех сдали скупщику</summary><ol class="cy-hgv">${r.gv
						.slice(0, 50)
						.map(
							([l, n], i) =>
								`<li class="${l === me ? "me" : ""}"><span>${i + 1}</span><b>${esc(l === me ? l + " (ты)" : l)}</b><em>${n}</em></li>`,
						)
						.join("")}</ol></details>`
				: "";
			const log = (H.log || []).length
				? `<details class="cy-hlog"><summary>Журнал Ратуши</summary><ul>${H.log.map((e) => `<li>${esc(e.t)}</li>`).join("")}</ul></details>`
				: "";
			return `<div class="cy-hall2" data-hm="${mode}">${tre}${W ? rsHtml(H) : ""}${hallCoinHtml(H)}${tabs}<div class="cy-h2"><div class="cy-h2m"><p class="cy-hmsg" data-hmsg role="status" aria-live="polite"></p><div data-hinv></div>${mode === "st" ? mg : ""}</div><aside class="cy-h2b">${board}</aside></div>${mode === "give" ? mg : ""}${log}${gv}</div>`;
		}

		let HQ = null;
		function hallQtyClose() {
			if (!HQ) return;
			const q = HQ;
			HQ = null;
			q.el.remove();
			document.removeEventListener("pointerdown", q.out, true);
			document.removeEventListener("keydown", q.key, true);
			q.pk.off();
		}
		const hqNum = (v) => {
			const n = Math.floor(v / 100),
				p = v % 100;
			return p ? `${n},${String(p).padStart(2, "0")}` : String(n);
		};
		function hallQty(o) {
			hallQtyClose();
			try {
				if (window.LGInventory && window.LGInventory.qtyClose)
					window.LGInventory.qtyClose();
			} catch (e) {
				console.warn("[Ратуша]", e);
			}
			const step = 100,
				max = o.whole
					? Math.floor(o.max / step) * step
					: Math.max(1, Math.floor(o.max));
			if (!(max >= 1)) {
				hall2Msg("Здесь меньше одной штуки - забрать можно только целые", true);
				return;
			}
			const lo = o.whole ? step : 1,
				clamp = (v) => Math.max(lo, Math.min(max, Math.round(+v) || lo));
			let v = clamp(o.def == null ? max : o.def);
			const M = (n) => (C.X.money ? C.X.money(n) : String(n));
			const el = document.createElement("div");
			el.className = "lgi-qty cy-hq";
			el.setAttribute("role", "dialog");
			el.setAttribute("aria-label", `${o.title}: ${o.ask}`);
			el.innerHTML =
				`<p class="lgi-qh"><b>${esc(o.title)}</b><small>есть ${esc(oreQ(max))}</small></p><p class="cy-hqa">${esc(o.ask)}</p>` +
				`<div class="lgi-qn"><button type="button" class="lgi-qb" data-hq="-1" aria-label="Меньше на 1 шт.">−</button><input type="text" inputmode="${o.whole ? "numeric" : "decimal"}" autocomplete="off" aria-label="Сколько штук${o.whole ? "" : " (можно с долями: 1,5)"}"><button type="button" class="lgi-qb" data-hq="1" aria-label="Больше на 1 шт.">+</button></div>` +
				'<p class="cy-hqv" data-hqv aria-live="polite"></p>' +
				'<div class="lgi-qq"><button type="button" class="lgi-qc" data-hq="p1">+1</button><button type="button" class="lgi-qc" data-hq="p5">+5</button><button type="button" class="lgi-qc" data-hq="all">Всё</button></div>' +
				`<button type="button" class="btn primary lgi-btn lgi-qgo" data-hq="go">${esc(o.go)}</button>`;
			document.body.appendChild(el);
			const inp = el.querySelector("input"),
				go = el.querySelector('[data-hq="go"]'),
				out = el.querySelector("[data-hqv]");
			const show = () => {
				out.innerHTML = `= ${esc(oreQ(v))}${o.price > 0 ? ` <span class="cy-hqc">≈ ${M(Math.floor((v * o.price) / 100))}</span>` : ""}`;
				el.querySelector('[data-hq="-1"]').disabled = v <= lo;
				el.querySelector('[data-hq="1"]').disabled =
					el.querySelector('[data-hq="p1"]').disabled =
					el.querySelector('[data-hq="p5"]').disabled =
						v >= max;
				el.querySelector('[data-hq="all"]').setAttribute(
					"aria-pressed",
					String(v === max),
				);
				go.disabled = !inp.value;
			};
			const sync = () => {
				inp.value = hqNum(v);
				show();
			};
			const parse = (s) => {
				const t = String(s).replace(/\s+/g, "").replace(",", ".");
				if (!/^\d*(\.\d{0,2})?$/.test(t) || t === "" || t === ".") return null;
				const n = Math.round(parseFloat(t) * 100);
				return o.whole ? Math.floor(n / step) * step : n;
			};
			const done = () => {
				const k = clamp(parse(inp.value) == null ? v : parse(inp.value));
				hallQtyClose();
				if (o.yes) o.yes(k);
			};

			let r0 = o.at && o.at.isConnected ? o.at.getBoundingClientRect() : null;
			const clip = (C.S && C.S.panel && C.S.panel.getBoundingClientRect()) || {
				top: 0,
				bottom: innerHeight,
			};
			if (
				r0 &&
				(r0.bottom < Math.max(0, clip.top) + 40 ||
					r0.top > Math.min(innerHeight, clip.bottom) - 40)
			) {
				const f = HV.host && HV.host.querySelector(".lgi-a");
				const fr = f && f.getBoundingClientRect();
				r0 =
					fr && fr.height && fr.bottom > 0 && fr.top < innerHeight
						? {
								left: fr.left,
								right: fr.right,
								top: Math.max(8, fr.top - 260),
								bottom: fr.top,
							}
						: null;
			}
			const r = r0 || {
				left: innerWidth / 2,
				right: innerWidth / 2,
				top: innerHeight / 3,
				bottom: innerHeight / 3,
			};
			const w = el.offsetWidth,
				hh = el.offsetHeight,
				vw = document.documentElement.clientWidth,
				vh = window.innerHeight;
			const pos = {
				x: Math.max(8, Math.min(vw - w - 8, (r.left + r.right) / 2 - w / 2)),
				y: Math.max(8, Math.min(vh - hh - 8, Math.max(r.top, 0) + 24)),
			};

			const LI = window.LGInventory || {};
			const pk = LI.popKeep
				? LI.popKeep(el, pos)
				: {
						fit: () => {
							el.style.transform = `translate(${Math.round(pos.x)}px, ${Math.round(pos.y)}px)`;
						},
						on() {},
						off() {},
					};
			if (!LI.popKeep) pk.fit();
			const touch = LI.touchUi
				? LI.touchUi()
				: !!(
						window.LGSiteUi &&
						window.LGSiteUi.is &&
						window.LGSiteUi.is("touch")
					);
			el.addEventListener("click", (e) => {
				const b = e.target.closest("[data-hq]");
				if (!b || b.disabled) return;
				const k = b.dataset.hq;
				if (k === "go") {
					done();
					return;
				}
				const cur = parse(inp.value);
				if (cur != null) v = clamp(cur);
				v =
					k === "all"
						? max
						: clamp(
								v + ({ "-1": -step, 1: step, p1: step, p5: 5 * step }[k] || 0),
							);
				sync();
				try {
					if (!touch) inp.focus({ preventScroll: true });
					else if (document.activeElement === inp || b.disabled)
						go.focus({ preventScroll: true });
				} catch (x2) {}
			});
			inp.addEventListener("input", () => {
				const n = parse(inp.value);
				if (n != null && n > 0) {
					v = clamp(n);
					if (n > max) inp.value = hqNum(v);
				}
				show();
			});
			inp.addEventListener("keydown", (e) => {
				if (e.key === "Enter") {
					e.preventDefault();
					if (inp.value) done();
					return;
				}
				if (e.key === "ArrowUp" || e.key === "ArrowDown") {
					e.preventDefault();
					v = clamp(v + (e.key === "ArrowUp" ? step : -step));
					sync();
				}
			});
			inp.addEventListener("blur", () => {
				if (HQ && HQ.el === el && parse(inp.value) == null) sync();
			});
			const outF = (e) => {
				if (!el.contains(e.target)) hallQtyClose();
			};
			const key = (e) => {
				if (e.key === "Escape") {
					e.preventDefault();
					e.stopPropagation();
					hallQtyClose();
					return;
				}
				if (e.key === "Tab") {
					const f = Array.from(el.querySelectorAll("button, input")).filter(
						(x2) => !x2.disabled,
					);
					const i = f.indexOf(document.activeElement);
					if (
						!el.contains(document.activeElement) ||
						(e.shiftKey && i <= 0) ||
						(!e.shiftKey && i === f.length - 1)
					) {
						e.preventDefault();
						f[e.shiftKey ? f.length - 1 : 0].focus();
					}
				}
			};
			HQ = { el, out: outF, pk, key };
			setTimeout(() => {
				if (HQ && HQ.el === el) {
					document.addEventListener("pointerdown", outF, true);
					pk.on();
				}
			}, 0);
			document.addEventListener("keydown", key, true);
			sync();
			try {
				if (touch) go.focus({ preventScroll: true });
				else {
					inp.focus({ preventScroll: true });
					inp.select();
				}
			} catch (e) {}
		}

		return {
			body: () => hallBody(),
			after: () => hallLoad(),
			hero: () => hall2Hero(),
			off: () => {
				clearTimeout(hallT);
				hall2Off();
				hall2Wide(false);
			},
			send: (b) => hallSend(b),
		};
	};
})();
