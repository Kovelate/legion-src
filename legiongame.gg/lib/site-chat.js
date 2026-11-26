(() => {
	const esc = window.LGSiteUi.esc;

	const EMO = {
		e: null,
		v: "",
		at: 0,
		busy: false,
		failAt: 0,
		subs: new Set(),
	};
	const EMO_MS = 15 * 60000;
	const EMO_ID = /^[0-9A-Za-z]{20,32}$/;
	const hasOwn = Object.prototype.hasOwnProperty;
	function emoHtml(t, e, base) {
		const s = String(t == null ? "" : t);
		if (!e) return esc(s);
		const b = esc(String(base || ""));
		return s
			.split(/(\s+)/)
			.map((w) => {
				const id = w && hasOwn.call(e, w) ? e[w] : null;
				if (!id || !EMO_ID.test(id)) return esc(w);
				const u = `${b}/api/emote/7tv/${id}/`;
				return `<img class="cy-emo" src="${u}1x.webp" srcset="${u}1x.webp 1x, ${u}2x.webp 2x" alt="${esc(w)}" title="${esc(w)}" loading="lazy" decoding="async" draggable="false" style="height:1.75em;width:auto;max-width:7em;vertical-align:middle;margin:-.3em 0">`;
			})
			.join("");
	}
	const emoText = (t) => emoHtml(t, EMO.e, window.LG_BASE || "");

	const EMO_BUB = 8;
	function emoFill(el, t, e, base) {
		const s = String(t == null ? "" : t),
			d = el.ownerDocument || document;
		const dict = e === undefined ? EMO.e : e,
			b = String(base === undefined ? window.LG_BASE || "" : base);
		const B = window.LGSiteUi && window.LGSiteUi.bg,
			hid = (B && B.state && B.state() === "hidden") || d.hidden === true;
		el.textContent = "";
		if (!dict || hid) {
			el.textContent = s;
			return 0;
		}
		let n = 0,
			acc = "";
		for (const w of s.split(/(\s+)/)) {
			const id = w && n < EMO_BUB && hasOwn.call(dict, w) ? dict[w] : null;
			if (!id || !EMO_ID.test(id)) {
				acc += w;
				continue;
			}
			if (acc) {
				el.appendChild(d.createTextNode(acc));
				acc = "";
			}
			const im = d.createElement("img");
			im.className = "cy-emo";
			im.alt = w;
			im.decoding = "async";
			im.draggable = false;
			im.src = `${b}/api/emote/7tv/${id}/1x.webp`;
			el.appendChild(im);
			n++;
		}
		if (acc) el.appendChild(d.createTextNode(acc));
		return n;
	}

	function emoLoad(api, hero) {
		if (!(hero && hero.e7)) {
			if (EMO.e) {
				EMO.e = null;
				EMO.v = "";
				EMO.at = 0;
			}
			return;
		}
		const now = Date.now(),
			B = window.LGSiteUi.bg;
		if (
			EMO.busy ||
			(EMO.at && now - EMO.at < EMO_MS) ||
			now < EMO.failAt ||
			(B && B.state && B.state() === "hidden")
		)
			return;
		EMO.busy = true;
		Promise.resolve(api("/api/emotes"))
			.then(
				(r) => {
					if (!(r && r.ok && r.e && typeof r.e === "object")) {
						EMO.failAt = Date.now() + 60000;
						return;
					}
					const e = Object.create(null);
					let n = 0;
					for (const k of Object.keys(r.e)) {
						const id = String(r.e[k]);
						if (EMO_ID.test(id)) {
							e[k] = id;
							n++;
						}
					}
					const was = EMO.v;
					EMO.e = n ? e : null;
					EMO.v = String(r.v || "") + ":" + n;
					EMO.at = Date.now();
					if (was !== EMO.v)
						for (const f of [...EMO.subs]) {
							try {
								f();
							} catch (x) {
								console.warn("[чат] смайлы: перерисовка", x);
							}
						}
				},
				(x) => {
					console.warn("[чат] смайлы: словарь", x);
					EMO.failAt = Date.now() + 60000;
				},
			)
			.finally(() => {
				EMO.busy = false;
			});
	}

	const TABS = [
		["g", "Общий"],
		["tr", "Торговля"],
		["mn", "Ремёсла"],
		["gl", "Гильдия"],
		["dm", "Личные"],
	];
	const SEND_ICO =
		'<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false"><path d="M3 10h11M10 5l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
	const tabBtn = (t, name, on, title) =>
		`<button type="button" role="tab" data-tab="${t}" aria-selected="${on}" tabindex="${on ? 0 : -1}"${on ? "" : " hidden"}${title ? ` title="${esc(title)}"` : ""}><span>${esc(name)}</span><b class="cy-chat-tn" hidden></b></button>`;
	const html = (
		K,
	) => `<section class="cy-chat" hidden aria-label="${esc(K.name || "Чат")}">
          <button type="button" class="cy-chat-t" aria-expanded="false">Чат<b class="cy-chat-n" hidden></b></button>
          <div class="cy-chat-b" hidden>
            <div class="cy-chat-h"><div class="cy-chat-tabs" role="tablist" aria-label="Вкладки чата" aria-description="Порядок вкладок: перетащи вкладку (на телефоне - подержи) или Alt+стрелка. «Общий» всегда первый">${TABS.map(([t, n]) => tabBtn(t, n, t === "g")).join("")}${K.log ? tabBtn("lg", K.log, false, K.logTitle || "События шахты") : ""}</div><span class="cy-chat-sr" role="status" aria-live="polite"></span><button type="button" class="cy-chat-sh" hidden aria-pressed="false" aria-label="Модерация чата" title="Модерация чата">⚙︎</button><button type="button" class="cy-chat-x" aria-label="Свернуть чат" title="Свернуть чат"><i aria-hidden="true"></i></button></div>
            <div class="cy-chat-w">
              <div class="cy-chat-p" hidden></div>
              <ol class="cy-chat-l" role="log" aria-label="Сообщения"></ol>
              <div class="cy-chat-dmx" hidden></div>
              <div class="cy-chat-to" hidden></div>
              <p class="cy-chat-e" role="status"></p>
              <button type="button" class="cy-chat-ap" hidden>Обжаловать бан чата</button>
              <form class="cy-chat-f" autocomplete="off"><button type="button" class="cy-emo-b" aria-label="Смайлы и стикеры" title="Смайлы и стикеры" aria-expanded="false" hidden>☺</button><input type="text" maxlength="200" enterkeyhint="send" placeholder="${esc(K.ph || "Написать в чат…")}" aria-label="Сообщение в чат"><button type="submit" aria-label="Отправить" title="Отправить">${SEND_ICO}</button></form>
            </div>
          </div>
        </section>`;
	function make(K) {
		let X = null;
		const St = () => {
			X = K.X();
			return K.state();
		};
		EMO.subs.add(() => {
			const s0 = St();
			if (s0 && s0.chat && s0.el && s0.el.querySelector(".cy-chat"))
				chatRender();
		});

		const CHAT_N = 300,
			CHAT_NGL = 80;
		const tabMax = (t) => (t === "gl" ? CHAT_NGL : CHAT_N);
		const CHAT_ERR = {
			rate_limited: "не так быстро",
			forbidden: "нет прав",
			city_closed: "Город закрыт",
			login_required: "войди через Twitch",
		};

		const chatErrOf = (r, d) =>
			(r &&
				(CHAT_ERR[r.error]
					? CHAT_ERR[r.error] +
						(window.LGSiteUi.closedCode ? window.LGSiteUi.closedCode(r) : "")
					: r.error)) ||
			d;
		const chatPref = () => {
			try {
				const v = localStorage.getItem(K.key);
				if (v === "1" || v === "0") return v === "1";
			} catch {}
			return !window.LGSiteUi.is("(max-width: 720px), (max-height: 480px)");
		};

		const MUTES = [
			[5, "5 мин"],
			[30, "30 мин"],
			[60, "1 ч"],
			[1440, "1 день"],
			[10080, "7 дней"],
		];
		const MUTE_MENU = [
			[1, "1 мин"],
			[5, "5 мин"],
			[10, "10 мин"],
			[30, "30 мин"],
			[60, "1 ч"],
			[360, "6 ч"],
			[1440, "24 ч"],
			[10080, "7 дней"],
		];
		const ROLE_ICO = {
			own: ["👑", "админ чата"],
			mod: ["🛡", "модератор чата"],
		};

		const noEv = (L) => (L || []).filter((m) => !(m && m.ev));
		const tabOf = (m) =>
			m.tb ||
			(m.rm === "mine"
				? "mn"
				: m.k === "tr"
					? "tr"
					: m.k === "dm"
						? "dm"
						: "g");
		const TAB_EMPTY = {
			g: "Здесь пока тихо - напиши первым.",
			tr: "Здесь объявления: куплю, продам, меняю. Ссылки нельзя.",
			mn: "Здесь пока тихо - напиши первым.",
			dm: "Личных пока нет. Нажми на ник правой кнопкой (на телефоне - подержи) → «Написать».",
			gl: "Чат твоей гильдии - здесь пишут только её участники.",
		};
		const TAB_PH = {
			g: K.ph || "Написать в чат…",
			tr: "Куплю / продам / меняю…",
			mn: "Написать в чат шахты…",
			dm: "Лично…",
			gl: "Написать гильдии…",
		};
		const leftT = (ms) => {
			const m = Math.max(1, Math.ceil(ms / 60000));
			return m < 60
				? `${m} мин`
				: m < 1440
					? `${Math.ceil(m / 60)} ч`
					: `${Math.ceil(m / 1440)} дн`;
		};

		const tabRoom = (t) => (t === "mn" ? "mine" : "city");

		const tabOn = (C, t) =>
			t === "g" ||
			((t === "tr" || t === "dm" || t === "mn" || t === "lg" || t === "gl") &&
				!!C[t]);
		const baseOf = (rm) => (K.baseFor ? K.baseFor(rm || "city") : K.base);
		const setMuted = (rm, v) => {
			const C = St().chat;
			if (K.one) {
				C.mutes[rm || "city"] = v;
				if (tabRoom(C.tab) === (rm || "city")) C.muted = v;
			} else C.muted = v;
		};

		const rzPc = () =>
			!window.LGSiteUi.is("phone") &&
			!(window.LGSiteUi.is("nohover") && window.LGSiteUi.is("touch"));
		const W0 = 280,
			H0 = 180;
		const wKey = () =>
			K.win ? (typeof K.win.key === "function" ? K.win.key() : K.win.key) : "";
		const wMem = {};
		const num = (v) => (Number.isFinite(+v) ? +v : 0);
		function wGet() {
			const k = wKey();
			if (!k) return null;
			if (!(k in wMem)) {
				let v = null;
				try {
					const o = JSON.parse(localStorage.getItem(k) || "null");
					if (
						o &&
						typeof o === "object" &&
						Number.isFinite(o.x) &&
						Number.isFinite(o.y)
					)
						v = {
							x: +o.x,
							y: +o.y,
							w: Math.max(0, num(o.w)),
							h: Math.max(0, num(o.h)),
						};
				} catch (e) {
					v = null;
				}
				wMem[k] = v;
			}
			return wMem[k];
		}
		function wPut(v) {
			const k = wKey();
			if (!k) return;
			wMem[k] = v;
			try {
				if (v) localStorage.setItem(k, JSON.stringify(v));
				else localStorage.removeItem(k);
			} catch (e) {
				console.warn("[чат] место окна не сохранилось", e);
			}
		}
		const clampN = (v, a, b) => Math.max(a, Math.min(b, v));
		const wLim = () => ({
			w1: Math.max(W0, Math.floor(Math.min(720, innerWidth - 16))),
			h1: Math.max(H0, Math.floor(innerHeight - 16)),
		});
		const wCur = (box) => ({
			x: parseFloat(box.style.getPropertyValue("--cy-dx")) || 0,
			y: parseFloat(box.style.getPropertyValue("--cy-dy")) || 0,
		});
		function wShift(box, x, y) {
			const dx = Math.round(x) + "px",
				dy = Math.round(y) + "px";
			if (box.style.getPropertyValue("--cy-dx") !== dx)
				box.style.setProperty("--cy-dx", dx);
			if (box.style.getPropertyValue("--cy-dy") !== dy)
				box.style.setProperty("--cy-dy", dy);
		}

		function wClamp(r, cur, x, y) {
			const x0 = r.left - cur.x,
				y0 = r.top - cur.y;
			return {
				x: Math.max(-x0, Math.min(innerWidth - r.width - x0, x - x0)),
				y: Math.max(-y0, Math.min(innerHeight - r.height - y0, y - y0)),
			};
		}

		const cls = (box, k, on) => {
			if (box.classList.contains(k) !== on) box.classList.toggle(k, on);
		};
		function wOff(box, b) {
			cls(box, "cy-mv", false);
			if (box.style.getPropertyValue("--cy-dx"))
				box.style.removeProperty("--cy-dx");
			if (box.style.getPropertyValue("--cy-dy"))
				box.style.removeProperty("--cy-dy");
			if (box.style.width) box.style.width = "";
			if (b && b.style.height) b.style.height = "";
		}

		function winFit(box) {
			box = box || (St() && St().el.querySelector(".cy-chat"));
			if (!box || !K.win) return;

			if (box._lgDrag) return;
			const b = box.querySelector(".cy-chat-b");
			if (!b) return;
			const on = rzPc() && box.classList.contains("open") && !b.hidden;
			cls(box, "cy-rz", on);
			const v = on ? wGet() : null;
			if (!v) {
				wOff(box, b);
				return;
			}
			const L = wLim(),
				w = v.w ? Math.round(clampN(v.w, W0, L.w1)) + "px" : "",
				h = v.h ? Math.round(clampN(v.h, H0, L.h1)) + "px" : "";
			if (box.style.width !== w) box.style.width = w;
			if (b.style.height !== h) b.style.height = h;
			cls(box, "cy-mv", true);

			if (box._lgRo && box.parentNode && box._lgRoAt !== box.parentNode) {
				if (box._lgRoAt) box._lgRo.unobserve(box._lgRoAt);
				box._lgRoAt = box.parentNode;
				box._lgRo.observe(box.parentNode);
			}
			const c = wClamp(box.getBoundingClientRect(), wCur(box), v.x, v.y);
			wShift(box, c.x, c.y);
		}
		const wSaid = (box, end) => {
			try {
				box.dispatchEvent(
					new CustomEvent("cy-chat-size", {
						bubbles: true,
						detail: { end: !!end },
					}),
				);
			} catch (e) {
				console.error("[чат] размер", e);
			}
		};

		const noGrip = (t) =>
			!!(
				t &&
				t.closest &&
				t.closest('input, textarea, select, a, button:not([role="tab"])')
			);
		function winBind(box) {
			const b = box.querySelector(".cy-chat-b"),
				hd = box.querySelector(".cy-chat-h");
			if (!b || !hd || !K.win) return;
			const g = document.createElement("i");
			g.className = "cy-chat-rz";
			g.dataset.rz = "se";
			g.title = "Потянуть - размер окна";
			g.setAttribute("aria-hidden", "true");
			b.appendChild(g);
			let d = null,
				raf = 0,
				ate = 0;
			const frame = () => {
				raf = 0;
				if (!d) return;
				if (d.rz) {
					const L = wLim(),
						w = Math.round(
							clampN(
								d.w + d.px - d.sx,
								W0,
								Math.min(L.w1, innerWidth - d.r.left),
							),
						),
						h = Math.round(
							clampN(
								d.h + d.py - d.sy,
								H0,
								Math.min(L.h1, innerHeight - d.r.top - (d.r.height - d.h)),
							),
						);
					box.style.width = w + "px";
					b.style.height = h + "px";
					const r = box.getBoundingClientRect(),
						cur = wCur(box);
					wShift(box, cur.x, cur.y + d.r.top - r.top);
					d.v = { x: Math.round(d.r.left), y: Math.round(d.r.top), w, h };
				} else {
					const c = wClamp(
						d.r,
						d.c0,
						d.r.left + d.px - d.sx,
						d.r.top + d.py - d.sy,
					);
					wShift(box, c.x, c.y);
					d.v = {
						...d.v,
						x: Math.round(d.r.left + c.x - d.c0.x),
						y: Math.round(d.r.top + c.y - d.c0.y),
					};
				}
				wSaid(box, false);
			};

			const grab = () => {
				if (!d || d.cap) return;
				d.cap = true;
				try {
					d.el.setPointerCapture(d.id);
				} catch (x) {}
			};
			const down = (e, rz) => {
				if (e.button !== 0 || !box.classList.contains("cy-rz")) return;
				if (d) end(null);
				const r = box.getBoundingClientRect(),
					v0 = wGet() || { w: 0, h: 0 };
				d = {
					id: e.pointerId,
					el: e.currentTarget || box,
					cap: false,
					rz,
					sx: e.clientX,
					sy: e.clientY,
					px: e.clientX,
					py: e.clientY,
					r,
					c0: wCur(box),
					w: r.width,
					h: b.getBoundingClientRect().height,
					moved: !!rz,
					v: { ...v0, x: Math.round(r.left), y: Math.round(r.top) },
				};
				box._lgDrag = true;
				if (rz) {
					e.preventDefault();
					e.stopPropagation();
					cls(box, "cy-mv", true);
					cls(box, "cy-rzing", true);
					grab();
				}

				window.addEventListener("pointermove", move);
				window.addEventListener("pointerup", up);
				window.addEventListener("pointercancel", up);
				window.addEventListener("blur", up);
			};
			const move = (e) => {
				if (!d || e.pointerId !== d.id) return;
				d.px = e.clientX;
				d.py = e.clientY;
				if (!d.moved) {
					if (Math.abs(d.px - d.sx) + Math.abs(d.py - d.sy) < 5) return;
					d.moved = true;
					cls(box, "cy-mv", true);
					cls(box, "cy-rzing", true);
					grab();
				}
				e.preventDefault();
				if (!raf) raf = requestAnimationFrame(frame);
			};

			const end = (e) => {
				if (raf) {
					cancelAnimationFrame(raf);
					raf = 0;
					frame();
				}
				const was = d.moved,
					rz = d.rz,
					v = d.v;
				if (d.cap) {
					try {
						d.el.releasePointerCapture(d.id);
					} catch (x) {}
				}
				d = null;
				box._lgDrag = false;
				cls(box, "cy-rzing", false);
				window.removeEventListener("pointermove", move);
				window.removeEventListener("pointerup", up);
				window.removeEventListener("pointercancel", up);
				window.removeEventListener("blur", up);
				if (!was) {
					winFit(box);
					return;
				}
				if (e && e.type === "pointerup" && !rz) ate = Date.now();
				wPut(v);
				winFit(box);
				wSaid(box, true);
			};
			const up = (e) => {
				if (!d || (e.type !== "blur" && e.pointerId !== d.id)) return;
				end(e);
			};
			g.addEventListener("pointerdown", (e) => down(e, true));

			for (const side of ["l", "r", "b", "t"]) {
				const eg = document.createElement("i");
				eg.className = "cy-chat-eg";
				eg.dataset.e = side;
				eg.title = "Потянуть - перенести окно чата";
				eg.setAttribute("aria-hidden", "true");
				b.appendChild(eg);
				eg.addEventListener("pointerdown", (e) => {
					e.preventDefault();
					down(e, false);
				});
			}

			const onTabs = (t) => {
				const tb = t && t.closest && t.closest(".cy-chat-tabs");
				return (
					!!tb &&
					(!!t.closest('[role="tab"]') || tb.scrollWidth > tb.clientWidth)
				);
			};
			hd.addEventListener("pointerdown", (e) => {
				if (!noGrip(e.target) && !onTabs(e.target)) down(e, false);
			});
			hd.addEventListener(
				"click",
				(e) => {
					if (ate && Date.now() - ate < 400) {
						ate = 0;
						e.stopImmediatePropagation();
						e.preventDefault();
					}
				},
				true,
			);

			hd.addEventListener("dblclick", (e) => {
				if (noGrip(e.target) || !rzPc()) return;
				wPut(null);
				winFit(box);
				wSaid(box, true);
			});

			let t = 0;
			const refit = () => {
				if (t || d) return;
				t = requestAnimationFrame(() => {
					t = 0;
					if (
						!d &&
						St() &&
						St().chat &&
						St().chat.open &&
						St().el.contains(box)
					)
						winFit(box);
				});
			};
			window.addEventListener("resize", refit);
			window.addEventListener(
				"scroll",
				() => {
					if (box.classList.contains("cy-mv")) refit();
				},
				{ passive: true },
			);
			if (window.ResizeObserver) {
				const ro = new ResizeObserver(() => {
					if (box.classList.contains("cy-mv")) refit();
				});
				ro.observe(document.documentElement);
				box._lgRo = ro;
			}
		}

		const tKey = () => (K.key ? K.key + "Tabs" : "");
		const PIN = "g";
		const tName = (b) =>
			((b.querySelector("span") || b).textContent || "").trim();
		function tabsLoad() {
			const k = tKey();
			if (!k) return null;
			try {
				const v = JSON.parse(localStorage.getItem(k) || "null");
				return Array.isArray(v)
					? v.filter((x) => typeof x === "string" && x !== PIN)
					: null;
			} catch (e) {
				return null;
			}
		}
		function tabsSave(v) {
			const k = tKey();
			if (!k) return;
			try {
				if (v) localStorage.setItem(k, JSON.stringify(v));
				else localStorage.removeItem(k);
			} catch (e) {
				console.warn("[чат] порядок вкладок не сохранился", e);
			}
		}

		function tabsApply(box, order) {
			const bar = box.querySelector(".cy-chat-tabs");
			if (!bar) return;
			const all = [...bar.querySelectorAll("[data-tab]")];
			if (!box._lgTabDef) box._lgTabDef = all.map((b) => b.dataset.tab);
			const def = box._lgTabDef,
				O = order || [];
			const rk = (t) =>
				t === PIN ? -1 : O.includes(t) ? O.indexOf(t) : 1000 + def.indexOf(t);
			const want = [...all].sort(
				(a, b) => rk(a.dataset.tab) - rk(b.dataset.tab),
			);
			if (want.every((b, i) => b === all[i])) return;
			for (const b of want) bar.appendChild(b);
		}
		const tabsVis = (bar) =>
			[...bar.querySelectorAll("[data-tab]")].filter((x) => !x.hidden);

		const tabsKeep = (bar) =>
			tabsSave(
				tabsVis(bar)
					.map((b) => b.dataset.tab)
					.filter((t) => t !== PIN),
			);
		const tabsSay = (box, t) => {
			const s = box.querySelector(".cy-chat-sr");
			if (s) {
				s.textContent = "";
				setTimeout(() => {
					s.textContent = t;
				}, 30);
			}
		};
		const tabsPlace = (bar, b) => {
			const vs = tabsVis(bar);
			return `«${tName(b)}» - на ${vs.indexOf(b) + 1} месте из ${vs.length}`;
		};
		function tabsReset(box) {
			tabsSave(null);
			if (!box) return;
			tabsApply(box, null);
			const bar = box.querySelector(".cy-chat-tabs");
			if (bar) bar.scrollLeft = 0;
			tabsSay(box, "Порядок вкладок - по умолчанию");
		}
		function tabsBind(box) {
			const bar = box.querySelector(".cy-chat-tabs");
			if (!bar) return;
			tabsApply(box, tabsLoad());
			const pin = bar.querySelector(`[data-tab="${PIN}"]`);
			if (pin && !pin.title) pin.title = "Закреплена первой";
			let p = null,
				eat = false,
				raf = 0;
			const vib = (ms) => {
				if (navigator.vibrate)
					try {
						navigator.vibrate(ms);
					} catch (x) {}
			};
			const eatClick = () => {
				eat = true;
				setTimeout(() => {
					eat = false;
				}, 0);
			};
			const scrolls = () => bar.scrollWidth > bar.clientWidth;
			const clearT = () => {
				if (p && p.t) {
					clearTimeout(p.t);
					p.t = 0;
				}
			};
			const cap = () => {
				if (p && !p.cap) {
					p.cap = true;
					try {
						bar.setPointerCapture(p.id);
					} catch (x) {}
				}
			};

			function lift() {
				clearT();
				if (!p || p.mode) return;
				const vs = tabsVis(bar),
					i0 = vs.indexOf(p.tab);
				if (i0 < 0) {
					p.mode = "none";
					return;
				}
				const br = bar.getBoundingClientRect(),
					sl = bar.scrollLeft;
				const R = vs.map((b) => {
					const r = b.getBoundingClientRect();
					return { l: r.left - br.left + sl, w: r.width };
				});
				const gap = R.length > 1 ? Math.max(0, R[1].l - R[0].l - R[0].w) : 2;
				Object.assign(p, {
					mode: "reo",
					vs,
					i0,
					R,
					gap,
					j: i0,
					s0: sl,
					min: vs[0] && vs[0].dataset.tab === PIN ? 1 : 0,
					out: false,
				});
				cap();
				bar.classList.add("reo");
				p.tab.classList.add("cy-tab-lift");
				if (p.type !== "mouse") vib(15);
				window.addEventListener("keydown", esc, true);
				window.addEventListener("blur", cancel);
				if (!raf) raf = requestAnimationFrame(frame);
			}
			function frame() {
				raf = 0;
				if (!p || p.mode !== "reo") return;
				const br = bar.getBoundingClientRect(),
					E = 28;

				let v = 0;
				if (p.px < br.left + E)
					v = -Math.min(14, Math.ceil((br.left + E - p.px) / 2));
				else if (p.px > br.right - E)
					v = Math.min(14, Math.ceil((p.px - br.right + E) / 2));
				if (v) bar.scrollLeft += v;
				const { R, i0, gap, vs } = p,
					me = R[i0],
					lo = R[p.min].l,
					hi = R[R.length - 1].l + R[R.length - 1].w - me.w;
				const dx =
					Math.max(
						lo,
						Math.min(hi, me.l + (p.px - p.x) + (bar.scrollLeft - p.s0)),
					) - me.l;
				p.out =
					p.py < br.top - 48 ||
					p.py > br.bottom + 48 ||
					p.px < br.left - 80 ||
					p.px > br.right + 80;

				const a = me.l + dx,
					z = a + me.w;
				let j = i0;
				for (let k = 0; k < i0; k++)
					if (a < R[k].l + R[k].w / 2) {
						j = k;
						break;
					}
				for (let k = R.length - 1; k > i0; k--)
					if (z > R[k].l + R[k].w / 2) {
						j = k;
						break;
					}
				j = Math.max(p.min, j);
				p.j = p.out ? i0 : j;
				for (let k = 0; k < vs.length; k++) {
					if (k === i0) continue;
					const sh = p.out
						? 0
						: k > i0 && k <= p.j
							? -(me.w + gap)
							: k < i0 && k >= p.j
								? me.w + gap
								: 0;
					const tf = sh ? `translateX(${sh}px)` : "";
					if (vs[k].style.transform !== tf) vs[k].style.transform = tf;
				}
				p.tab.style.transform = `translateX(${Math.round(dx)}px)`;
				p.tab.classList.toggle("cy-tab-out", p.out);
				raf = requestAnimationFrame(frame);
			}

			function drop(ok) {
				if (raf) {
					cancelAnimationFrame(raf);
					raf = 0;
				}
				window.removeEventListener("keydown", esc, true);
				window.removeEventListener("blur", cancel);
				const q = p;
				p = null;
				if (!q) return;
				const { vs, i0, tab } = q,
					j = ok && !q.out ? q.j : i0,
					moved = j !== i0;
				const was = tab.getBoundingClientRect().left;
				if (moved) {
					bar.classList.add("reo-snap");
					for (const b of vs) b.style.transform = "";
					const rest = vs.filter((b) => b !== tab),
						ref = rest[j];
					bar.insertBefore(
						tab,
						ref ||
							(rest[rest.length - 1]
								? rest[rest.length - 1].nextSibling
								: null),
					);
					tab.style.transform = `translateX(${Math.round(was - tab.getBoundingClientRect().left)}px)`;
					void tab.offsetWidth;
					bar.classList.remove("reo-snap");
					tabsKeep(bar);
					tabsSay(box, tabsPlace(bar, tab));
				} else if (ok === false) tabsSay(box, "Перестановка отменена");
				tab.classList.remove("cy-tab-out");
				requestAnimationFrame(() => {
					for (const b of vs) b.style.transform = "";
					tab.classList.remove("cy-tab-lift");
				});
				setTimeout(() => {
					if (!p || p.mode !== "reo") bar.classList.remove("reo");
				}, 220);
				if (q.cap)
					try {
						bar.releasePointerCapture(q.id);
					} catch (x) {}
			}
			const cancel = () => {
				if (p && p.mode === "reo") drop(false);
			};
			const esc = (e) => {
				if (e.key === "Escape" && p && p.mode === "reo") {
					e.preventDefault();
					e.stopPropagation();
					drop(false);
				}
			};
			bar.addEventListener("pointerdown", (e) => {
				if (e.button !== 0 || !e.isPrimary) return;
				if (p) {
					if (p.mode === "reo") drop(false);
					else {
						clearT();
						p = null;
					}
				}
				const tab = e.target.closest && e.target.closest('[role="tab"]');
				p = {
					id: e.pointerId,
					type: e.pointerType,
					x: e.clientX,
					y: e.clientY,
					px: e.clientX,
					py: e.clientY,
					s: bar.scrollLeft,
					tab,
					mode: null,
					t: 0,
					cap: false,
				};
				eat = false;
				if (!tab) return;
				if (tab.dataset.tab === PIN) {
					p.t = setTimeout(
						() => {
							if (p && !p.mode) {
								p.mode = "pin";
								bar.classList.add("pin");
								tabsSay(box, "«Общий» закреплён на первом месте");
							}
						},
						p.type === "mouse" ? 300 : 400,
					);
					return;
				}
				p.t = setTimeout(lift, p.type === "mouse" ? 300 : 400);
			});
			bar.addEventListener("pointermove", (e) => {
				if (!p || e.pointerId !== p.id) return;
				p.px = e.clientX;
				p.py = e.clientY;
				const dx = e.clientX - p.x,
					dy = e.clientY - p.y;
				if (p.mode === "reo") {
					e.preventDefault();
					if (!raf) raf = requestAnimationFrame(frame);
					return;
				}
				if (p.mode === "scroll") {
					bar.scrollLeft = p.s - dx;
					e.preventDefault();
					return;
				}
				if (p.mode && p.mode !== "pin") return;
				if (p.type !== "mouse") {
					if (Math.abs(dx) + Math.abs(dy) > 8) {
						clearT();
						p.mode = "native";
					}
					return;
				}
				if (Math.max(Math.abs(dx), Math.abs(dy)) < 5) return;
				if (p.tab && p.tab.dataset.tab !== PIN && Math.abs(dy) > Math.abs(dx)) {
					lift();
					e.preventDefault();
					return;
				}
				clearT();
				bar.classList.remove("pin");
				if (scrolls() && Math.abs(dx) >= 5) {
					p.mode = "scroll";
					bar.classList.add("drag");
					cap();
					bar.scrollLeft = p.s - dx;
					e.preventDefault();
				} else p.mode = "none";
			});
			const end = (e) => {
				if (!p || (e && e.pointerId !== p.id)) return;
				if (p.mode === "reo") {
					const mv = Math.abs(p.px - p.x) + Math.abs(p.py - p.y) > 4;
					drop(e && e.type === "pointerup" ? true : false);
					if (mv) eatClick();
					return;
				}
				clearT();
				if (p.mode === "scroll") eatClick();
				bar.classList.remove("drag", "pin");
				if (p.cap)
					try {
						bar.releasePointerCapture(p.id);
					} catch (x) {}
				p = null;
			};
			bar.addEventListener("pointerup", end);
			bar.addEventListener("pointercancel", end);
			bar.addEventListener("lostpointercapture", (e) => {
				if (p && p.cap && e.pointerId === p.id && p.mode !== "reo") end(e);
			});

			bar.addEventListener(
				"touchmove",
				(e) => {
					if (p && p.mode === "reo" && e.cancelable) e.preventDefault();
				},
				{ passive: false },
			);
			bar.addEventListener("contextmenu", (e) => {
				if (p && e.target.closest && e.target.closest('[role="tab"]'))
					e.preventDefault();
			});
			bar.addEventListener(
				"click",
				(e) => {
					if (eat) {
						eat = false;
						e.stopImmediatePropagation();
						e.preventDefault();
					}
				},
				true,
			);
			bar.addEventListener(
				"wheel",
				(e) => {
					if (
						!scrolls() ||
						!e.deltaY ||
						Math.abs(e.deltaX) > Math.abs(e.deltaY)
					)
						return;
					bar.scrollLeft += e.deltaY;
					e.preventDefault();
				},
				{ passive: false },
			);

			bar.addEventListener("keydown", (e) => {
				if (
					(e.key !== "ArrowLeft" && e.key !== "ArrowRight") ||
					!(e.altKey || (e.ctrlKey && e.shiftKey))
				)
					return;
				const b = e.target.closest && e.target.closest("[data-tab]");
				if (!b) return;
				e.preventDefault();
				e.stopImmediatePropagation();
				if (b.dataset.tab === PIN) {
					tabsSay(box, "«Общий» закреплён на первом месте");
					return;
				}
				const vs = tabsVis(bar),
					i = vs.indexOf(b),
					min = vs[0] && vs[0].dataset.tab === PIN ? 1 : 0,
					j = i + (e.key === "ArrowRight" ? 1 : -1);
				if (j < min || j >= vs.length) {
					tabsSay(
						box,
						j < min && min
							? "Левее - «Общий», он закреплён"
							: tabsPlace(bar, b),
					);
					return;
				}
				bar.insertBefore(b, e.key === "ArrowRight" ? vs[j].nextSibling : vs[j]);
				tabsKeep(bar);
				try {
					b.focus({ preventScroll: true });
				} catch (x) {
					console.warn("[чат] фокус вкладки", x);
				}
				const l = b.offsetLeft - bar.offsetLeft,
					r = l + b.offsetWidth;
				if (l < bar.scrollLeft) bar.scrollLeft = Math.max(0, l - 4);
				else if (r > bar.scrollLeft + bar.clientWidth)
					bar.scrollLeft = r - bar.clientWidth + 4;
				tabsSay(box, tabsPlace(bar, b));
			});
		}
		function chatInit() {
			if (!St()) return;
			const h = X.hero(),
				box = St().el.querySelector(".cy-chat");
			if (!box) return;
			const F = K.flags(h) || {},
				on = !!F.on;
			if (!St().chat)
				St().chat = {
					on,
					list: [],
					c: 0,
					mod: null,
					muted: null,
					open: chatPref(),
					unread: 0,
					panel: false,
					info: null,
					tab: K.lastTab || "g",
					un: { g: 0, tr: 0, dm: 0, mn: 0, gl: 0 },
					peer: null,
					ign: new Set(),
					mutes: { city: null, mine: null },
				};
			St().chat.on = on;
			box.hidden = !on;
			St().chat.tr = !!F.tr;
			St().chat.dm = !!F.dm;

			St().chat.mn = !!F.mn;
			St().chat.g = F.g !== false;
			St().chat.lg = !!K.log;

			{
				const C0 = St().chat,
					f = !!F.gl;
				if (C0.glOv && (C0.glOv.on === f || Date.now() - C0.glOv.at > 120000))
					C0.glOv = null;
				const gOn = C0.glOv ? C0.glOv.on : f;
				if (C0.gl && !gOn) glDrop(C0);
				C0.gl = gOn;
				if (gOn) glStart();
				else glStop();
			}
			if (!tabOn(St().chat, St().chat.tab)) St().chat.tab = "g";
			if (St().chat.tab === "g" && !St().chat.g && St().chat.mn)
				St().chat.tab = "mn";
			if (!on || box.dataset.bound) {
				if (on) chatRender();
				return;
			}
			box.dataset.bound = "1";
			winBind(box);

			if (window.LGDm) {
				window.LGDm.dock(K.key, box, box.querySelector(".cy-chat-dmx"));
				window.LGDm.on(K.key, (why) => {
					if (!St() || !St().chat || !St().el.contains(box)) return;
					if (why === "show" && St().chat.dm) {
						if (!St().chat.open) chatOpen(true);
						chatTab("dm", true);
					} else chatBadges(box, St().chat);
				});
			}
			const f = box.querySelector(".cy-chat-f"),
				inp = f.querySelector("input"),
				l = box.querySelector(".cy-chat-l"),
				pn = box.querySelector(".cy-chat-p");

			if (K.older) {
				l.addEventListener(
					"scroll",
					() => {
						if (l.scrollTop < 40) chatOlder();
					},
					{ passive: true },
				);
				l.addEventListener(
					"wheel",
					(e) => {
						if (e.deltaY < 0 && l.scrollTop <= 0) chatOlder();
					},
					{ passive: true },
				);
			}
			box.querySelector(".cy-chat-t").onclick = () => chatOpen(!St().chat.open);

			emoBind(box, f, inp);
			box.querySelector(".cy-chat-x").onclick = () => {
				chatOpen(false);
				try {
					box.querySelector(".cy-chat-t").focus({ preventScroll: true });
				} catch {}
			};

			box.querySelector(".cy-chat-sh").onclick = (e) => {
				if (St().chat.panel) {
					chatPanel(false);
					return;
				}
				modOpen({ from: e.currentTarget });
			};

			let tabTyping = false;
			box.querySelector(".cy-chat-tabs").addEventListener(
				"pointerdown",
				() => {
					const a = document.activeElement;
					tabTyping = !!(a && box.contains(a) && a.matches("input, textarea"));
				},
				true,
			);
			box.querySelector(".cy-chat-tabs").addEventListener("click", (e) => {
				const b = e.target.closest("[data-tab]");
				if (b) chatTab(b.dataset.tab, tabTyping);
				tabTyping = false;
			});

			tabsBind(box);

			box.querySelector(".cy-chat-tabs").addEventListener("keydown", (e) => {
				const b = e.target.closest && e.target.closest("[data-tab]");
				if (!b || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key))
					return;
				const bs = [...box.querySelectorAll(".cy-chat-tabs [data-tab]")].filter(
						(x) => !x.hidden,
					),
					i = bs.indexOf(b);
				if (!bs.length) return;
				e.preventDefault();
				e.stopPropagation();
				const nx =
					bs[
						e.key === "Home"
							? 0
							: e.key === "End"
								? bs.length - 1
								: (i + (e.key === "ArrowRight" ? 1 : bs.length - 1)) % bs.length
					];
				chatTab(nx.dataset.tab);
				try {
					nx.focus({ preventScroll: true });
				} catch (x) {
					console.warn("[чат] фокус вкладки", x);
				}
			});
			box.querySelector(".cy-chat-to").addEventListener("click", (e) => {
				const p = e.target.closest("[data-peer]"),
					ig = e.target.closest("[data-ign]");
				if (p) {
					St().chat.peer = p.dataset.peer || null;
					St().chat.ren = null;
					chatRender(true);
				}
				if (ig) chatIgnore(ig.dataset.ign, ig.dataset.on === "1");
			});

			const keep =
				window.LGSiteUi && window.LGSiteUi.keepField
					? window.LGSiteUi.keepField(f, inp)
					: () => {};
			const send = () => {
				const had = document.activeElement === inp,
					t0 = inp.value.trim();
				return chatSend(inp).finally(() => {
					if (t0) keep(had);
				});
			};
			f.onsubmit = (e) => {
				e.preventDefault();
				send();
			};

			box.querySelector(".cy-chat-ap").onclick = () => appealOpen();

			l.addEventListener("click", (e) => {
				const b = e.target.closest && e.target.closest("b[data-nick]");
				if (!b || inp.disabled || selIn(l)) return;
				const nk = b.dataset.nick;
				if (!nk || nk === X.login()) return;
				if (St().chat.tab === "dm") {
					chatPeer(nk);
					return;
				}
				chatReply(nk);
			});

			l.addEventListener("contextmenu", (e) => {
				const onNick = !!(e.target.closest && e.target.closest("b[data-nick]"));
				if (!onNick && (selIn(l) || St().chatPt === "touch")) return;
				const li = e.target.closest && e.target.closest("li");
				if (li && l.contains(li)) e.preventDefault();
				const b =
					e.target.closest &&
					(e.target.closest("b[data-nick]") ||
						(li && li.querySelector("b[data-nick]")));
				if (!b) return;
				e.preventDefault();
				if (St().chatLpT === -1) return;

				if (St().chatLpT) {
					clearTimeout(St().chatLpT);
					St().chatLpT = -1;
				}
				const r = b.getBoundingClientRect();
				nickMenu(
					b.dataset.nick,
					b.textContent,
					e.clientX || r.left,
					e.clientY || r.bottom,
					b,
				);
			});
			l.addEventListener("keydown", (e) => {
				const b = e.target.closest && e.target.closest("b[data-nick]");
				if (!b) return;
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					b.click();
				}
			});
			l.addEventListener("pointerdown", (e) => {
				if (St().chatLpT === -1) St().chatLpT = 0;
				St().chatPt = e.pointerType;
				if (e.pointerType !== "touch") return;
				const b = e.target.closest && e.target.closest("b[data-nick]");
				if (!b) return;
				clearTimeout(St().chatLpT);
				St().chatLpT = setTimeout(() => {
					St().chatLpT = -1;
					const r = b.getBoundingClientRect();
					nickMenu(b.dataset.nick, b.textContent, r.left, r.bottom, b);
				}, 500);
			});

			l.addEventListener("pointerdown", (e) => {
				if (
					!e.target.closest ||
					!e.target.closest(".mw-sl") ||
					!window.LGModWin
				)
					return;
				const li = e.target.closest("li[data-mid]");
				if (!li) return;
				const m = St().chat.list.find((x) => String(x.id) === li.dataset.mid);
				window.LGModWin.slide(e, li, m, modCtx());
			});
			const lpEnd = () => {
				if (St().chatLpT && St().chatLpT !== -1) clearTimeout(St().chatLpT);
			};
			l.addEventListener("pointerup", lpEnd);
			l.addEventListener("pointercancel", lpEnd);
			l.addEventListener("pointermove", (e) => {
				if (
					e.pointerType === "touch" &&
					Math.abs(e.movementX) + Math.abs(e.movementY) > 6
				)
					lpEnd();
			});
			l.addEventListener(
				"click",
				(e) => {
					if (St().chatLpT === -1) {
						St().chatLpT = 0;
						e.stopImmediatePropagation();
						e.preventDefault();
					}
				},
				true,
			);

			inp.addEventListener("keydown", (e) => {
				if (e.key === "Escape") {
					inp.blur();
					chatOpen(false);
					return;
				}
				if (
					e.key === "Enter" &&
					!e.shiftKey &&
					!e.altKey &&
					!e.ctrlKey &&
					!e.metaKey
				) {
					if (e.isComposing || e.keyCode === 229) return;
					e.preventDefault();
					e.stopPropagation();
					send();
				}
			});
			l.addEventListener("click", (e) => {
				const m = e.target.closest("[data-cmod]"),
					a = e.target.closest("[data-cact]");
				if (m) {
					const li = m.closest("li"),
						was = li.classList.contains("mm");
					l.querySelectorAll("li.mm").forEach((x) => x.classList.remove("mm"));
					if (!was) li.classList.add("mm");
					return;
				}
				if (a)
					chatAct(a.dataset.cact, {
						id: a.dataset.id,
						login: a.dataset.l,
						min: +a.dataset.min || undefined,
						n: a.dataset.n,
						rm: a.closest("li") && a.closest("li").dataset.rm,
					});
			});
			pn.addEventListener("click", (e) => {
				const a = e.target.closest("[data-cact]");
				if (a) chatAct(a.dataset.cact, { login: a.dataset.l, n: a.dataset.l });
				if (e.target.closest("[data-pback]")) chatPanel(false);
			});
			pn.addEventListener("keydown", (e) => {
				if (
					e.key !== "Enter" ||
					e.isComposing ||
					e.keyCode === 229 ||
					!e.target.matches(".cy-chat-pf input")
				)
					return;
				e.preventDefault();
				e.stopPropagation();
				const fm = e.target.form;
				if (fm) {
					if (fm.requestSubmit) fm.requestSubmit();
					else
						fm.dispatchEvent(
							new Event("submit", { bubbles: true, cancelable: true }),
						);
				}
			});
			pn.addEventListener("submit", (e) => {
				e.preventDefault();
				const fm = e.target,
					nick = (fm.querySelector("input").value || "")
						.trim()
						.replace(/^@/, "")
						.toLowerCase();
				if (!nick) return;
				if (fm.matches("[data-pmod]"))
					chatAct("mod", { login: nick, n: nick }, () => {
						fm.reset();
					});
				else {
					const v = fm.querySelector("select").value;
					chatAct(
						v === "ban" ? "ban" : "mute",
						{ login: nick, n: nick, min: +v || undefined, reason: "" },
						() => {
							fm.reset();
						},
					);
				}
			});
			chatRender(true);
		}

		function chatReply(nk) {
			const inp = St().el.querySelector(".cy-chat-f input");
			if (!inp || inp.disabled || !nk || nk === X.login()) return;
			const rest = inp.value.replace(/^@[\w]+\s*/, "");
			inp.value = `@${nk} ${rest}`;
			inp.focus();
			try {
				inp.setSelectionRange(inp.value.length, inp.value.length);
			} catch {}
		}

		function nickMenuClose(back) {
			const m = St() && St().nickM;
			if (!m) return;
			St().nickM = null;
			m.el.remove();
			document.removeEventListener("pointerdown", m.out, true);
			document.removeEventListener("keydown", m.key, true);
			if (back && m.from && m.from.isConnected)
				try {
					m.from.focus({ preventScroll: true });
				} catch {}
		}
		function nickMenu(nk, name, cx, cy, from) {
			nickMenuClose();
			if (!nk) return;
			const me = nk === X.login(),
				h = X.hero(),
				C = St().chat;
			const items = [];

			const gl = C.tab === "gl",
				mm = !me && !gl && modTarget(nk);
			const glLi =
				gl && from && from.closest ? from.closest("li[data-mid]") : null;
			const glMid =
				glLi && /^g\d+$/.test(glLi.dataset.mid || "")
					? glLi.dataset.mid.slice(1)
					: "";
			if (window.LGProfile && window.LGProfile.on() !== false)
				items.push(["pf", "Профиль"]);
			if (!me) items.push(["reply", "Ответить"]);
			if (!me && C.dm)
				items.push(["dm", window.LGDm ? "Написать" : "Написать в личку"]);
			if (!me && !gl && C.dm && window.LGDm)
				items.push(["dmrep", "Пожаловаться"]);
			if (!me && K.trade && h && h.tr && window.LGTrade)
				items.push(["trade", "Предложить обмен"]);
			if (!me && window.LGFriends)
				for (const it of window.LGFriends.menuItems(nk)) items.push(it);
			if (!me && window.LGCityMon && window.LGCityMon.menuItems)
				for (const it of window.LGCityMon.menuItems(nk)) items.push(it);
			if (!me && gl && glMid)
				items.push(["gl-rep", "Пожаловаться на сообщение"]);
			if (gl && glMid && !C.glMod && C.glLead)
				items.push(["gl-del", "🧹 Удалить сообщение"]);
			if (!me && gl && C.glMod) {
				if (glMid) items.push(["gl-del", "🧹 Удалить сообщение"]);
				items.push(
					["gl-mute", "🔇 Мут в чатах гильдий: 1 ч"],
					["gl-ban", "⛔ Бан в чатах гильдий"],
				);
				if (window.LGGuilds && window.LGGuilds.mod)
					items.push(["gl-modwin", "🛡 Модерация гильдий"]);
			}
			if (mm) {
				items.push(
					["md-purge", "🧹 Удалить сообщения"],
					["md-mute", "🔇 Мут…"],
					["md-ban", "⛔ Бан чата"],
				);
				if (C.modUi) items.push(["md-open", "🛡 Открыть в модерации"]);
			}

			const gi = me ? null : ginvFor(nk);
			if (gi && gi.show) items.splice(1, 0, ["g-inv", "Пригласить в гильдию"]);
			if (!items.length) return;
			const el = document.createElement("div");
			el.className = "cy-nm";
			el.setAttribute("role", "menu");
			el.setAttribute("aria-label", `Ник ${name || nk}`);
			el.innerHTML =
				`<div class="cy-nm-h">${esc(name || nk)}</div>` +
				items
					.map(
						([k, t]) =>
							`<button type="button" role="menuitem" data-nm="${k}">${t}</button>`,
					)
					.join("");
			document.body.appendChild(el);
			const [x, y] = window.LGSiteUi.clampXY(el, cx, cy + 4);
			el.style.left = Math.round(x) + "px";
			el.style.top = Math.round(y) + "px";
			const out = (e) => {
				if (!el.contains(e.target)) nickMenuClose();
			};
			const key = (e) => {
				if (e.key === "Escape") {
					e.preventDefault();
					e.stopPropagation();
					nickMenuClose(true);
					return;
				}
				if (e.key === "Tab") {
					nickMenuClose();
					return;
				}
				if (e.key === "ArrowDown" || e.key === "ArrowUp") {
					e.preventDefault();
					const bs = [...el.querySelectorAll("button")],
						i = bs.indexOf(document.activeElement);
					bs[
						(i + (e.key === "ArrowDown" ? 1 : bs.length - 1)) % bs.length
					].focus();
				}
			};
			St().nickM = { el, out, key, from };

			setTimeout(() => {
				if (St() && St().nickM && St().nickM.el === el)
					document.addEventListener("pointerdown", out, true);
			}, 0);
			document.addEventListener("keydown", key, true);
			el.addEventListener("click", (e) => {
				const b = e.target.closest("[data-nm]");
				if (!b) return;
				const k = b.dataset.nm;
				nickMenuClose();
				if (k === "pf")
					window.LGProfile.open(nk).then((ok) => {
						if (!ok && window.LGProfile.on() === false) {
							if (window.LGSiteUi && window.LGSiteUi.toast)
								window.LGSiteUi.toast("Профиль - скоро");
							else chatErr("Профиль - скоро", true);
						}
					});
				else if (k === "reply") {
					if (C.tab === "dm") chatTab("g");
					chatReply(nk);
				} else if (k === "dm") chatPeer(nk);
				else if (k === "dmrep")
					window.LGSiteUi.askInput({
						title: `Пожаловаться на ${name || nk}?`,
						text: "Модераторы канала увидят последние 30 сообщений вашей переписки.",
						placeholder: "Что случилось (можно пусто)",
						yes: "Пожаловаться",
					}).then((why) => {
						if (why !== null) window.LGDm.report(nk, why);
					});
				else if (k === "trade") window.LGTrade.invite(nk, X);
				else if (k === "g-inv") ginvSend(nk, name);
				else if (k.startsWith("fr-") && window.LGFriends)
					window.LGFriends.menuAct(k, nk);
				else if (
					k.startsWith("cmp-") &&
					window.LGCityMon &&
					window.LGCityMon.menuAct
				)
					window.LGCityMon.menuAct(k, nk, name);
				else if (k === "md-purge")
					chatAct("purge", {
						login: nk,
						n: name || nk,
						id: mm && mm.id,
						rm: mm && mm.rm,
					});
				else if (k === "md-ban")
					chatAct("ban", {
						login: nk,
						n: name || nk,
						id: mm && mm.id,
						rm: mm && mm.rm,
					});
				else if (k === "md-open") modOpen({ l: nk, from });
				else if (k.startsWith("gl-")) glModAct(k, nk, name, glMid);
				else if (k === "md-mute") {
					const r0 =
						from && from.isConnected ? from.getBoundingClientRect() : null;
					muteMenu(nk, name, r0 ? r0.left : cx, r0 ? r0.bottom : cy, from, mm);
				}
			});
			try {
				el.querySelector("button").focus({ preventScroll: true });
			} catch {}
			if (gi && gi.then)
				gi.then((r) => {
					if (
						!r ||
						!r.show ||
						!St() ||
						!St().nickM ||
						St().nickM.el !== el ||
						el.querySelector('[data-nm="g-inv"]')
					)
						return;
					const b = document.createElement("button");
					b.type = "button";
					b.setAttribute("role", "menuitem");
					b.dataset.nm = "g-inv";
					b.textContent = "Пригласить в гильдию";
					const first = el.querySelector("[data-nm]");
					el.insertBefore(b, first ? first.nextSibling : null);
				});
		}

		const GINV = { m: new Map(), no: 0 };
		function ginvFor(nk) {
			const h = X.hero(),
				C = St().chat;
			if (
				!nk ||
				nk === X.login() ||
				!h ||
				!(h.gt || h.gch) ||
				Date.now() < GINV.no
			)
				return null;
			for (let i = C.list.length - 1; i >= 0; i--) {
				const m = C.list[i];
				if (m && m.l === nk && !m.sys) {
					if (m.gt) return null;
					break;
				}
			}
			const c = GINV.m.get(nk);
			if (c && Date.now() - c.at < 45000) return c.p || c.r;
			const p = X.api(
				"/api/guilds/invitable?login=" + encodeURIComponent(nk),
			).then(
				(r) => {
					const v = r && r.ok ? r : { show: false };
					if (r && r.ok && r.me === false) GINV.no = Date.now() + 60000;
					GINV.m.set(nk, { at: Date.now(), r: v });
					if (GINV.m.size > 300) GINV.m.delete(GINV.m.keys().next().value);
					return v;
				},
				(e) => {
					console.warn("[чат] гильдия: пункт меню", e);
					GINV.m.delete(nk);
					return null;
				},
			);
			GINV.m.set(nk, { at: Date.now(), p });
			return p;
		}
		async function ginvSend(nk, name) {
			const c = GINV.m.get(nk),
				g = c && c.r && c.r.guild;
			if (!g) {
				chatErr("Пригласить не вышло - попробуй ещё раз");
				GINV.m.delete(nk);
				return;
			}
			const r = await X.api("/api/guilds/act", {
				op: "invite",
				guild: String(g.id),
				login: nk,
			}).catch((e) => {
				console.warn("[чат] гильдия: приглашение", e);
				return null;
			});
			GINV.m.delete(nk);
			if (!St() || !St().chat) return;
			if (r && r.ok) {
				GINV.m.set(nk, { at: Date.now(), r: { show: false } });
				chatErr(`Приглашение отправлено: ${name || nk}`, true);
			} else
				chatErr(
					`Пригласить ${name || nk} не вышло - ${(r && r.error) || "нет связи"}`,
				);
		}

		function ginvShow(d) {
			if (!d || !/^\d{1,19}$/.test(String(d.g || ""))) return;
			let el = document.getElementById("cy-ginv");
			if (el) el.remove();
			const nm = `${d.tag ? `[${d.tag}] ` : ""}${d.name || "гильдия"}`;
			el = document.createElement("div");
			el.id = "cy-ginv";
			el.className = "cy-ginv";
			el.setAttribute("role", "alertdialog");
			el.setAttribute("aria-label", "Приглашение в гильдию");
			el.innerHTML =
				`<p>Гильдия <b>${esc(nm)}</b> приглашает тебя${d.by ? ` <small>(${esc(d.by)})</small>` : ""}</p><p class="cy-ginv-e" role="status"></p>` +
				'<div><button type="button" data-gi="join">Принять</button><button type="button" data-gi="refuse" class="ghost">Отклонить</button><button type="button" data-gi="x" class="x" aria-label="Закрыть" title="Закрыть (приглашение останется в окне «Гильдии»)">×</button></div>';
			document.body.appendChild(el);
			el.addEventListener("click", async (e) => {
				const b = e.target.closest("[data-gi]");
				if (!b || el.classList.contains("busy")) return;
				if (b.dataset.gi === "x") {
					el.remove();
					return;
				}
				el.classList.add("busy");
				const r = await X.api("/api/guilds/act", {
					op: b.dataset.gi,
					guild: String(d.g),
				}).catch((er) => {
					console.warn("[чат] гильдия: ответ на приглашение", er);
					return null;
				});
				el.classList.remove("busy");
				if (!r || !r.ok) {
					el.querySelector(".cy-ginv-e").textContent =
						(r && r.error) || "не вышло - нет связи";
					return;
				}
				el.remove();
				const t =
					b.dataset.gi === "join"
						? `Ты в гильдии ${nm}`
						: "Приглашение отклонено";
				if (window.LGSiteUi && window.LGSiteUi.toast) window.LGSiteUi.toast(t);
				else chatErr(t, true);
				try {
					if (window.LGGuilds && window.LGGuilds.refresh)
						window.LGGuilds.refresh();
				} catch (er) {
					console.warn("[чат] гильдия: счётчик", er);
				}
			});
			try {
				el.querySelector("button").focus({ preventScroll: true });
			} catch (er) {
				console.warn("[чат] фокус плашки", er);
			}
		}

		function muteMenu(nk, name, cx, cy, from, mm) {
			nickMenuClose();
			const el = document.createElement("div");
			el.className = "cy-nm";
			el.setAttribute("role", "menu");
			el.setAttribute("aria-label", `Мут: ${name || nk}`);
			el.innerHTML =
				`<div class="cy-nm-h">Мут: ${esc(name || nk)}</div>` +
				MUTE_MENU.map(
					([k, t]) =>
						`<button type="button" role="menuitem" data-min="${k}">${t}</button>`,
				).join("");
			document.body.appendChild(el);
			const [x, y] = window.LGSiteUi.clampXY(el, cx, cy + 4);
			el.style.left = Math.round(x) + "px";
			el.style.top = Math.round(y) + "px";
			const out = (e) => {
				if (!el.contains(e.target)) nickMenuClose();
			};
			const key = (e) => {
				if (e.key === "Escape") {
					e.preventDefault();
					e.stopPropagation();
					nickMenuClose(true);
					return;
				}
				if (e.key === "Tab") {
					nickMenuClose();
					return;
				}
				if (e.key === "ArrowDown" || e.key === "ArrowUp") {
					e.preventDefault();
					const bs = [...el.querySelectorAll("button")],
						i = bs.indexOf(document.activeElement);
					bs[
						(i + (e.key === "ArrowDown" ? 1 : bs.length - 1)) % bs.length
					].focus();
				}
			};
			St().nickM = { el, out, key, from };
			setTimeout(() => {
				if (St() && St().nickM && St().nickM.el === el)
					document.addEventListener("pointerdown", out, true);
			}, 0);
			document.addEventListener("keydown", key, true);
			el.addEventListener("click", (e) => {
				const b = e.target.closest("[data-min]");
				if (!b) return;
				nickMenuClose();
				chatAct("mute", {
					login: nk,
					n: name || nk,
					min: +b.dataset.min,
					id: mm && mm.id,
					rm: mm && mm.rm,
				});
			});
			try {
				el.querySelector("button").focus({ preventScroll: true });
			} catch (e) {
				console.warn("[чат] фокус меню мута", e);
			}
		}

		function modTarget(nk) {
			const C = St().chat;
			if (!C || !C.mod || !nk || nk === X.login() || nk === chanLogin())
				return null;
			for (let i = C.list.length - 1; i >= 0; i--) {
				const m = C.list[i];
				if (m && !m.sys && m.k !== "dm" && m.tb !== "gl" && m.l === nk)
					return canMod(m) ? m : null;
			}

			return { l: nk, id: null, rm: K.one ? tabRoom(C.tab) : "city" };
		}

		const modSubs = new Set();
		const modNotify = () => {
			for (const f of modSubs) {
				try {
					f();
				} catch (e) {
					console.error("[чат] окно модерации", e);
				}
			}
		};
		let MODC = null;
		function modCtx() {
			if (!MODC)
				MODC = {
					ch: chanLogin(),
					me: () => X.login(),
					role: () => (St() && St().chat ? St().chat.mod : null),
					list: () =>
						St() && St().chat
							? St().chat.list.filter(
									(m) => m && !m.sys && !m.ev && m.k !== "dm" && m.tb !== "gl",
								)
							: [],
					canMod: (m) => !!(m && St() && St().chat && !m.sys && canMod(m)),
					act: (op, o) => chatAct(op, o || {}).then((r) => !!r),
					sub: (f) => {
						modSubs.add(f);
						return () => modSubs.delete(f);
					},
					info: () => X.api(baseOf(K.one ? "city" : "city") + "/mod"),
					menu: (nk, name, x, y, from) => nickMenu(nk, name, x, y, from),
					api: (u, b) => X.api(u, b),
				};
			return MODC;
		}

		let MODL = null;
		function modLoad() {
			if (window.LGModWin) return Promise.resolve(true);
			if (!MODL) {
				const v = window.LG_MODV || {};
				const add = (tag, attrs) =>
					new Promise((ok, bad) => {
						const x = document.createElement(tag);
						Object.assign(x, attrs);
						x.onload = () => ok();
						x.onerror = bad;
						document.head.appendChild(x);
					});
				MODL = Promise.all([
					add("link", {
						rel: "stylesheet",
						href: "/lib/mod-ui.css" + (v.css ? "?v=" + v.css : ""),
					}),
					add("script", { src: "/lib/mod-ui.js" + (v.js ? "?v=" + v.js : "") }),
				]).then(
					() => !!window.LGModWin,
					(e) => {
						MODL = null;
						console.warn("[чат] окно модерации не загрузилось", e);
						return false;
					},
				);
			}
			return MODL;
		}

		function modCheck() {
			const C = St() && St().chat;
			if (!C || !C.mod || C.modUi != null) return;
			C.modUi = false;
			modLoad()
				.then((ok) => (ok ? window.LGModWin.allowed(modCtx()) : null))
				.then((me) => {
					const C2 = St() && St().chat;
					if (!C2) return;
					C2.modUi = !!me;
					if (me) {
						C2.ren = null;
						chatRender();
					}
				})
				.catch((e) => console.warn("[чат] проверка окна модерации", e));
		}
		async function modOpen(o) {
			const ok =
				(await modLoad()) && (await window.LGModWin.open(modCtx(), o || {}));
			if (!ok && St() && St().chat && !o.l) chatPanel(true);
		}

		const GL_FAST = 60000,
			GL_SLOW = 120000,
			GL_LFAST = 60000,
			GL_LSLOW = 180000;
		const GL_BACK = [5000, 10000, 30000, 60000];
		let glFails = 0;
		const glJit = (ms) => Math.round(ms * (0.8 + 0.4 * Math.random()));
		const glLiveOk = () => {
			try {
				return !!(window.LGLive && window.LGLive());
			} catch (e) {
				return false;
			}
		};

		function glDrop(C) {
			C.list = C.list.filter((m) => m.tb !== "gl");
			C.glLast = null;
			C.glInit = false;
			C.glG = null;
			C.glName = null;
			C.glMute = null;
			C.glLead = null;
			C.un.gl = 0;
			if (C.tab === "gl") C.tab = "g";
			C.ren = null;
		}
		function glLive(d) {
			if (d && d.k === "inv") {
				St();
				if (X) ginvShow(d);
				return;
			}
			const C = St() && St().chat;
			if (!C || !d || typeof d !== "object") return;
			if (d.k === "re") {
				if (C.gl) glSchedule(500 + Math.round(Math.random() * 10000));
				return;
			}
			if (d.k === "in") {
				C.glOv = { on: true, at: Date.now() };
				if (C.gl && C.glG && C.glG !== String(d.g)) glDrop(C);
				C.gl = true;
				glSchedule(0);
				chatRender();
				return;
			}
			if (d.k === "out") {
				if (C.glG && d.g && C.glG !== String(d.g)) return;
				C.glOv = { on: false, at: Date.now() };
				if (C.gl) glDrop(C);
				C.gl = false;
				glStop();
				if (C.on) chatRender();
				return;
			}
			if (!C.gl) return;
			if (d.k === "msgs") {
				if (!C.glInit || (C.glG && String(d.g) !== C.glG)) {
					glSchedule(0);
					return;
				}
				const L = (Array.isArray(d.msgs) ? d.msgs : [])
					.filter((x) => x && x.id && (!C.glLast || +x.id > +C.glLast))
					.map(glMsg);
				for (const m of L)
					if (!C.glLast || +m.gid > +C.glLast) C.glLast = m.gid;

				let pd = false;
				for (const m of L) {
					const i = C.list.findIndex(
						(x) => x.pend && x.l === m.l && x.t === m.t,
					);
					if (i >= 0) {
						C.list.splice(i, 1);
						C.ren = null;
						pd = true;
					}
				}
				if (L.length) chatApply({ chat: L });
				if (pd) chatRender();
				return;
			}
			if (d.k === "del") {
				chatApply({ chatDel: ["g" + String(d.id)] });
				return;
			}
			if (d.k === "drop") {
				const n = C.list.length;
				C.list = C.list.filter((m) => !(m.tb === "gl" && m.l === String(d.l)));
				if (C.list.length !== n) {
					C.ren = null;
					chatRender();
				}
				return;
			}
			if (d.k === "mute") {
				C.glMute =
					d.mute && typeof d.mute === "object"
						? {
								until: +d.mute.until || 0,
								...(d.mute.gmute ? { gmute: true } : {}),
								...(d.mute.reason ? { reason: String(d.mute.reason) } : {}),
							}
						: null;
				if (C.glMute && C.tab === "gl")
					chatErr(
						(C.glMute.gmute
							? "Руководство гильдии запретило тебе писать в чат гильдии"
							: "Модератор запретил тебе писать в чаты гильдий") +
							whyTail(C.glMute),
					);
				chatRender();
			}
		}
		window.addEventListener("lg-gchat", (e) => {
			try {
				glLive(e.detail);
			} catch (er) {
				console.error("[чат] гильдия: живое событие", er);
			}
		});
		let glT = 0;

		const glMsg = (x) =>
			String(x.tid) === "0"
				? {
						id: "g" + String(x.id),
						gid: String(x.id),
						sys: true,
						gsys: true,
						t: String(x.t || ""),
						at: +x.at || Date.now(),
						tb: "gl",
					}
				: {
						id: "g" + String(x.id),
						gid: String(x.id),
						s: 0,
						l: String(x.l || "").toLowerCase(),
						n: String(x.n || x.l || ""),
						t: String(x.t || ""),
						at: +x.at || Date.now(),
						tb: "gl",
					};
		function glSchedule(ms) {
			clearTimeout(glT);
			glT = setTimeout(glPoll, ms);
		}
		function glStart() {
			if (!glT) glSchedule(300);
		}
		function glStop() {
			clearTimeout(glT);
			glT = 0;
		}
		async function glPoll() {
			glT = 0;
			const C = St() && St().chat;
			if (!C || !C.on || !C.gl) return;
			if (!document.hidden || !C.glInit) {
				const r = await X.api(
					"/api/guilds/chat" +
						(C.glLast ? "?after=" + encodeURIComponent(C.glLast) : ""),
				).catch((e) => {
					console.warn("[чат] гильдия", e);
					return null;
				});
				const C2 = St() && St().chat;
				if (!C2 || !C2.gl) return;
				if (r && r.ok) {
					if (C2.glG && r.guild && String(r.guild) !== C2.glG) {
						glDrop(C2);
						C2.gl = true;
						C2.glG = String(r.guild);
						glSchedule(0);
						chatRender();
						return;
					}
					if (r.guild) C2.glG = String(r.guild);
					C2.glName = r.name
						? { name: String(r.name), tag: r.tag ? String(r.tag) : "" }
						: null;
					C2.glLead = r.lead || null;
					C2.glMute = r.mute || null;
					C2.glMod = !!r.mod;
					const L = (r.msgs || [])
						.map(glMsg)
						.filter((m) => !C2.list.some((x) => x.id === m.id));
					if (r.last && (!C2.glLast || +r.last > +C2.glLast))
						C2.glLast = String(r.last);
					if (!C2.glInit) {
						C2.glInit = true;
						C2.list.push(...L);
						chatTrim();
						chatRender();
					} else if (L.length) chatApply({ chat: L });
				} else if (r && (r.closed || r.unavailable)) {
					C2.gl = false;
					chatRender();
					return;
				}

				if (r && r.ok) glFails = 0;
				else glFails++;
			}
			const C3 = St() && St().chat,
				lv = glLiveOk();
			const base =
				C3 && C3.open && C3.tab === "gl"
					? lv
						? GL_LFAST
						: GL_FAST
					: lv
						? GL_LSLOW
						: GL_SLOW;
			const back = glFails
				? GL_BACK[Math.min(glFails - 1, GL_BACK.length - 1)]
				: 0;
			if (C3 && C3.gl && !glT) glSchedule(glJit(Math.max(base, back)));
		}

		async function glModAct(k, nk, name, mid) {
			if (k === "gl-modwin") {
				window.LGGuilds.mod();
				return;
			}
			const who = name || nk;
			let b = null;
			if (k === "gl-rep") {
				const why = await window.LGSiteUi.askInput({
					title: `Пожаловаться на сообщение ${who}?`,
					text: "Модераторы канала увидят 10 последних сообщений чата гильдии до него.",
					placeholder: "Что случилось (можно пусто)",
					yes: "Пожаловаться",
				});
				if (why === null) return;
				b = { op: "report", kind: "chat", msg: mid, reason: why };
			} else if (k === "gl-del") b = { op: "chatDel", msg: mid };
			else if (k === "gl-mute") {
				const w = await askWhy({ n: who, what: "мут в чатах гильдий на 1 ч" });
				if (w === null) return;
				b = { op: "chatMute", login: nk, min: 60, ...(w ? { reason: w } : {}) };
			} else if (k === "gl-ban") {
				if (
					!(await window.LGSiteUi.ask({
						title: `Забанить ${who} во всех чатах гильдий альянса?`,
						text: "Его сообщения удалятся.",
						yes: "Забанить",
						danger: true,
					}))
				)
					return;
				b = { op: "chatBan", login: nk };
			}
			if (!b) return;
			const r = await X.api("/api/guilds/mod", b).catch((e) => {
				console.warn("[чат] модерация гильдии", e);
				return null;
			});
			const C = St() && St().chat;
			if (!C) return;
			if (!r || !r.ok) {
				chatErr((r && r.error) || "не вышло - нет связи");
				return;
			}
			if (k === "gl-del") C.list = C.list.filter((m) => m.id !== "g" + mid);
			if (k === "gl-ban")
				C.list = C.list.filter((m) => !(m.tb === "gl" && m.l === nk));
			chatErr(
				k === "gl-rep"
					? "Жалоба отправлена - модераторы посмотрят"
					: k === "gl-del"
						? "Сообщение удалено"
						: k === "gl-mute"
							? `${who}: не пишет в чаты гильдий 1 ч`
							: `${who}: бан в чатах гильдий`,
				true,
			);
			C.ren = null;
			chatRender(true);
		}
		function chatPeer(nk) {
			if (!St().chat.dm || !nk || nk === X.login()) return;
			if (window.LGDm) {
				window.LGDm.open(nk);
				chatTab("dm", true);
				return;
			}
			St().chat.peer = nk;
			chatTab("dm", true);
		}
		async function chatIgnore(nk, on) {
			const r = await X.api(baseOf("city") + "/ignore", { login: nk, on });
			if (!St() || !St().chat) return;
			if (!r || !r.ok) {
				chatErr(chatErrOf(r, "не вышло"));
				return;
			}
			St().chat.ign = new Set(r.ign || []);
			chatErr(
				on
					? `${nk}: в игноре - не видно и не пишет тебе лично`
					: `${nk}: игнор снят`,
				true,
			);
			St().chat.ren = null;
			chatRender(true);
		}

		function chatTab(t, focus) {
			const C = St().chat;
			if (!tabOn(C, t)) t = "g";
			if (K.one) C.muted = C.mutes[tabRoom(t)] || null;

			if (C.panel) C.panel = false;
			C.tab = t;
			K.lastTab = t;
			C.un[t] = 0;
			C.ren = null;
			chatRender(true);
			if (t === "gl") glSchedule(0);
			if (!focus) return;
			const i = St().el.querySelector(
				St().chat.tab === "dm" && window.LGDm
					? ".cy-chat-dmx .dm-f input"
					: ".cy-chat-f input",
			);
			if (i && !window.LGSiteUi.is("touch"))
				try {
					i.focus({ preventScroll: true });
				} catch {}
		}
		function chatOpen(on) {
			St().chat.open = on;
			if (on) {
				St().chat.unread = 0;
				St().chat.un[St().chat.tab] = 0;
			}
			try {
				localStorage.setItem(K.key, on ? "1" : "0");
			} catch {}
			chatRender(true);
			if (on && !St().chat.panel) {
				const i = St().el.querySelector(
					St().chat.tab === "dm" && window.LGDm
						? ".cy-chat-dmx .dm-f input"
						: ".cy-chat-f input",
				);
				if (i && !window.LGSiteUi.is("touch"))
					try {
						i.focus({ preventScroll: true });
					} catch {}
			}
		}
		function chatEnter(r, rm) {
			if (!St().chat || !St().chat.on) return;
			St().chat.mod = r.mod === "own" || r.mod === "mod" ? r.mod : null;
			setMuted(rm, r.muted || null);
			if (!St().chat.mod) St().chat.panel = false;
			if (Array.isArray(r.chat)) {
				St().chat.oldEnd = {};
				const nw = noEv(r.chat).filter(
					(m) => !(m && m.k === "dm" && window.LGDm),
				);

				if (K.one) {
					const keep = St().chat.list.filter(
						(m) => m.tb === "gl" || (m.rm || "city") !== (rm || "city"),
					);
					St().chat.list = [...keep, ...nw].sort(
						(a, b) => (a.at || 0) - (b.at || 0),
					);
					chatTrim();
				} else {
					const keepGl = St().chat.list.filter((m) => m.tb === "gl");
					St().chat.list = [...nw, ...keepGl];
					chatTrim();
					St().chat.unread = 0;
					St().chat.un = { g: 0, tr: 0, dm: 0, mn: 0, gl: 0 };
				}
			}
			if (Array.isArray(r.ign)) St().chat.ign = new Set(r.ign);
			if (r.c != null) St().chat.c = +r.c || 0;
			chatRender(true);
			modCheck();
		}
		function chatApply(d, rm) {
			if (!St().chat || !St().chat.on) return;
			let ch = false;
			for (const m of d.chat || []) {
				if (!m || !m.id || St().chat.list.some((x) => x.id === m.id)) continue;

				if (m.l === String(X.login() || "").toLowerCase()) {
					const L = St().chat.list,
						i = L.findIndex(
							(x) =>
								x.pend &&
								x.tb !== "gl" &&
								x.l === m.l &&
								x.t === m.t &&
								x.tb === tabOf(m),
						);
					if (i >= 0) {
						L.splice(i, 1);
						St().chat.ren = null;
						ch = true;
					}
				}
				if (m.k === "dm" && window.LGDm) continue;
				if (m.ev) continue;
				St().chat.list.push(m);
				ch = true;
				const tb = tabOf(m);
				if (St().chat.ign.has(m.l)) continue;
				if (m.l !== X.login() && !St().chat.open) St().chat.unread++;
				if (m.l !== X.login() && !(St().chat.open && St().chat.tab === tb))
					St().chat.un[tb] = (St().chat.un[tb] || 0) + 1;
				if (tb !== "dm" && tb !== "gl") {
					if (K.bubble) {
						emoLoad(X.api, X.hero());
						K.bubble(m.l, String(m.t || ""), m.id);
					}
				}
			}
			chatTrim();
			for (const id of d.chatDel || []) {
				const n = St().chat.list.length;
				St().chat.list = St().chat.list.filter((x) => x.id !== id);
				if (St().chat.list.length !== n) ch = true;
				if (K.unbubble) K.unbubble(id);
			}
			if (d.c != null) St().chat.c = Math.max(St().chat.c, +d.c || 0);

			if (d.chatMe) {
				if ("muted" in d.chatMe) {
					setMuted(rm, d.chatMe.muted || null);
					if (d.chatMe.muted)
						chatErr(
							(St().chat.muted.until
								? `Модератор запретил тебе писать на ${leftT(St().chat.muted.until - Date.now())}`
								: "Модератор запретил тебе писать в чат") +
								whyTail(d.chatMe.muted),
						);
				}
				if ("mod" in d.chatMe && St().chat.mod !== "own") {
					St().chat.mod = d.chatMe.mod || null;
					if (!St().chat.mod) {
						St().chat.panel = false;
						St().chat.modUi = null;
					} else modCheck();
				}
				ch = true;
			}
			if (ch) {
				if (d.chatDel || d.chatMe) chatRender();
				else chatAppendSoon();
				modNotify();
			}
		}

		function chatTrim() {
			const L = St().chat.list,
				n = {};
			for (const m of L) {
				const t = tabOf(m);
				n[t] = (n[t] || 0) + 1;
			}
			if (!Object.keys(n).some((t) => n[t] > tabMax(t))) return;
			St().chat.list = L.filter((m) => {
				const t = tabOf(m);
				if (n[t] > tabMax(t)) {
					n[t]--;
					return false;
				}
				return true;
			});
		}

		const OLD_TABS = ["g", "tr", "mn"];
		async function chatOlder() {
			const C = St() && St().chat;
			if (
				!K.older ||
				!C ||
				!C.on ||
				!C.open ||
				C.panel ||
				C.oldBusy ||
				!OLD_TABS.includes(C.tab)
			)
				return;
			const tab = C.tab;
			C.oldEnd = C.oldEnd || {};
			if (C.oldEnd[tab]) return;
			let min = Infinity;
			for (const m of C.list)
				if (tabOf(m) === tab && !m.sys && !m.pend && +m.s > 0 && +m.s < min)
					min = +m.s;
			if (!Number.isFinite(min)) return;
			C.oldBusy = true;
			let r = null;
			try {
				r = await K.older(tab, min);
			} catch (e) {
				console.warn("[чат] ранние сообщения", e);
			}
			const C2 = St() && St().chat;
			if (!C2) return;
			C2.oldBusy = false;
			if (C2 !== C || !r || !Array.isArray(r.chat)) return;
			if (!r.more) C2.oldEnd[tab] = true;
			const have = new Set(C2.list.map((m) => m.id)),
				add = noEv(r.chat).filter((m) => m && m.id && !have.has(m.id));
			if (!add.length) return;
			C2.list = [...add, ...C2.list];
			if (C2.tab === tab) chatRender();
		}
		const chatVis = () => {
			const C = St().chat;
			return C.list.filter(
				(m) =>
					tabOf(m) === C.tab &&
					!C.ign.has(m.l) &&
					(C.tab !== "dm" ||
						!C.peer ||
						m.sys ||
						m.l === C.peer ||
						m.to === C.peer),
			);
		};

		function chatTo(box, C) {
			const el = box.querySelector(".cy-chat-to"),
				on = C.tab === "dm" && !C.panel && !window.LGDm;
			el.hidden = !on;
			if (!on) return;
			const me = X.login(),
				peers = [];
			for (let i = C.list.length - 1; i >= 0 && peers.length < 8; i--) {
				const m = C.list[i];
				if (m.k !== "dm") continue;
				const p = m.l === me ? m.to : m.l;
				if (p && !peers.includes(p) && !C.ign.has(p)) peers.push(p);
			}
			if (C.peer && !peers.includes(C.peer)) peers.unshift(C.peer);
			const chip = (p) =>
				`<button type="button" data-peer="${esc(p)}" aria-pressed="${String(C.peer === p)}" style="color:${nickColor(p)}">${esc(p)}</button>`;
			el.innerHTML =
				(peers.length
					? `<button type="button" data-peer="" aria-pressed="${String(!C.peer)}">Все</button>${peers.map(chip).join("")}`
					: "") +
				(C.peer
					? `<span class="cy-chat-tw">Кому: <b>${esc(C.peer)}</b></span><button type="button" class="bad" data-ign="${esc(C.peer)}" data-on="1">Игнор</button>`
					: peers.length
						? '<span class="cy-chat-tw">Выбери, кому писать</span>'
						: "") +
				[...C.ign]
					.slice(0, 5)
					.map(
						(p) =>
							`<button type="button" data-ign="${esc(p)}" data-on="0" title="Снять игнор">🚫 ${esc(p)} ×</button>`,
					)
					.join("");
		}
		function chatAppendSoon() {
			if (!St().chatT)
				St().chatT = setTimeout(() => {
					if (St()) {
						St().chatT = 0;
						chatAppend();
					}
				}, 250);
		}
		function chatAppend() {
			const box = St().el.querySelector(".cy-chat"),
				C = St().chat;
			if (!box || !C || !C.on) return;
			if (!C.open || C.panel || !C.ren) {
				chatRender();
				return;
			}
			chatBadges(box, C);
			const V = chatVis(),
				l = box.querySelector(".cy-chat-l"),
				ids = V.map((m) => m.id),
				k = C.ren.indexOf(ids[0]);
			const keep = k < 0 ? -1 : C.ren.length - k;
			if (
				keep <= 0 ||
				keep > ids.length ||
				C.ren.slice(k).some((id, i) => id !== ids[i]) ||
				l.children.length !== C.ren.length
			) {
				chatRender();
				return;
			}
			const end = l.scrollHeight - l.scrollTop - l.clientHeight < 40,
				a = end ? null : anchorOf(l);
			for (let i = 0; i < k; i++) l.firstElementChild.remove();
			const add = V.slice(keep).map(chatLi);
			l.insertAdjacentHTML("beforeend", add.join(""));
			C.ren = ids;
			C.liS = (C.liS || []).slice(k).concat(add);
			if (end) l.scrollTop = l.scrollHeight;
			else anchorBack(l, a);
		}

		function selIn(l) {
			const s = window.getSelection ? window.getSelection() : null;
			return (
				!!s &&
				!s.isCollapsed &&
				!!String(s).trim() &&
				l.contains(s.anchorNode) &&
				l.contains(s.focusNode)
			);
		}
		function anchorOf(l) {
			const t0 = l.getBoundingClientRect().top;
			for (const li of l.children) {
				if (!li.dataset || !li.dataset.mid) continue;
				const r = li.getBoundingClientRect();
				if (r.bottom > t0 + 1) return { id: li.dataset.mid, off: r.top - t0 };
			}
			return null;
		}
		function anchorBack(l, a) {
			if (!a) return;
			const li = [...l.children].find(
				(x) => x.dataset && x.dataset.mid === a.id,
			);
			if (li)
				l.scrollTop +=
					li.getBoundingClientRect().top -
					l.getBoundingClientRect().top -
					a.off;
		}
		let HM = null;
		const hm = (t) => {
			try {
				HM =
					HM ||
					new Intl.DateTimeFormat("ru-RU", {
						hour: "2-digit",
						minute: "2-digit",
					});
				return HM.format(new Date(t));
			} catch {
				return "";
			}
		};

		const tentMine = () => {
			const me = String((X && X.login && X.login()) || "").toLowerCase();
			return !!me && me === chanLogin();
		};
		const chanLogin = () => {
			const m0 = /\/c\/([\w]+)/.exec(location.pathname);
			return m0 ? m0[1].toLowerCase() : "";
		};

		const CLS_ICO = {
			legionary: "⚔️",
			archer: "🏹",
			mage: "🔮",
			priest: "✨",
			rogue: "🗡️",
			necromancer: "💀",
			paladin: "☀️",
			recruit: "🌱",
		};

		const EMO_FACE = (inner, bg = "#ffd23f", ln = "#8a5a00") =>
			`<circle cx="12" cy="12" r="10" fill="${bg}" stroke="${ln}" stroke-width="1.4"/>${inner}`;
		const EYE =
			'<circle cx="8.5" cy="10" r="1.4" fill="#3a2600"/><circle cx="15.5" cy="10" r="1.4" fill="#3a2600"/>';
		const PEMO = {
			smile: [
				"Улыбка",
				EMO_FACE(
					EYE +
						'<path d="M7.5 14q4.5 4 9 0" fill="none" stroke="#3a2600" stroke-width="1.6" stroke-linecap="round"/>',
				),
				"bob",
			],
			lol: [
				"Смех",
				EMO_FACE(
					'<path d="M6.8 10.5l1.7-1.6 1.7 1.6M13.8 10.5l1.7-1.6 1.7 1.6" fill="none" stroke="#3a2600" stroke-width="1.5" stroke-linecap="round"/><path d="M7 13.5h10q-1 5-5 5t-5-5z" fill="#7a1c1c"/>',
				),
				"shake",
			],
			sad: [
				"Грусть",
				EMO_FACE(
					EYE +
						'<path d="M8 17q4-3.5 8 0" fill="none" stroke="#3a2600" stroke-width="1.6" stroke-linecap="round"/><path d="M16.3 12.3q1.2 2 0 3t-1.2-.9z" fill="#59b6ff"/>',
				),
				"drop",
			],
			wow: [
				"Ого",
				EMO_FACE(
					'<circle cx="8.5" cy="9.5" r="1.8" fill="#fff" stroke="#3a2600"/><circle cx="15.5" cy="9.5" r="1.8" fill="#fff" stroke="#3a2600"/><ellipse cx="12" cy="16" rx="2.2" ry="2.8" fill="#3a2600"/>',
				),
				"pop",
			],
			love: [
				"Любовь",
				EMO_FACE(
					'<path d="M6.5 9.5c0-1.6 2.2-2 2.6-.4.4-1.6 2.6-1.2 2.6.4 0 1.4-2.6 3-2.6 3s-2.6-1.6-2.6-3zM12.3 9.5c0-1.6 2.2-2 2.6-.4.4-1.6 2.6-1.2 2.6.4 0 1.4-2.6 3-2.6 3s-2.6-1.6-2.6-3z" fill="#e2264d"/><path d="M8 15q4 3.5 8 0" fill="none" stroke="#3a2600" stroke-width="1.6" stroke-linecap="round"/>',
				),
				"beat",
			],
			angry: [
				"Злость",
				EMO_FACE(
					'<path d="M6.5 7.8l3.6 1.6M17.5 7.8l-3.6 1.6" stroke="#3a2600" stroke-width="1.6" stroke-linecap="round"/>' +
						EYE +
						'<path d="M8.5 16.5q3.5-2.4 7 0" fill="none" stroke="#3a2600" stroke-width="1.6" stroke-linecap="round"/>',
					"#ff7a4d",
					"#8a2a00",
				),
				"shake",
			],
			cool: [
				"Круто",
				EMO_FACE(
					'<path d="M5 9h14v1.6q-.6 3-3.5 3t-3-2.4h-1q-.1 2.4-3 2.4T5 10.6z" fill="#1b1b2e"/><path d="M8.5 16q3.5 2 7 0" fill="none" stroke="#3a2600" stroke-width="1.6" stroke-linecap="round"/>',
				),
				"tilt",
			],
			gg: [
				"GG",
				'<rect x="2" y="5" width="20" height="14" rx="4" fill="#3ecf8e" stroke="#11663f" stroke-width="1.4"/><text x="12" y="16" text-anchor="middle" font-size="9" font-weight="900" fill="#fff" font-family="system-ui">GG</text>',
				"pop",
			],

			fire: [
				"Огонь",
				'<path d="M12 2.5c1.2 3.6 5.8 5.6 5.8 11 0 3.6-2.6 6.3-5.8 6.3s-5.8-2.7-5.8-6.3c0-2.6 1.4-4.4 2.6-5.6.2 1.8 1 2.8 2 3.2-.6-3 .2-6.2 1.2-8.6z" fill="#ff7a1a" stroke="#a83a00" stroke-width="1.2"/><path d="M12 11c.6 1.8 2.6 2.6 2.6 5a2.6 2.6 0 01-5.2 0c0-1.4.8-2.4 1.4-3 .2.8.6 1.2 1 1.4-.2-1.2 0-2.4.2-3.4z" fill="#ffd23f"/>',
				"flick",
				1,
			],
			party: [
				"Праздник",
				EMO_FACE(
					EYE +
						'<path d="M8 14.5q4 3.5 8 0" fill="none" stroke="#3a2600" stroke-width="1.6" stroke-linecap="round"/>',
				) +
					'<path d="M8 3.5L12-.5 16 3.5z" fill="#b07cff" stroke="#5b2fa8" transform="translate(0 2)"/><circle cx="12" cy="1.8" r="1.2" fill="#ffd23f"/>',
				"bob",
				1,
			],
			sword: [
				"Меч",
				'<path d="M17.8 2.5l3.7 3.7-9.3 9.3-3.7-3.7z" fill="#dfe6f0" stroke="#6b7a90" stroke-width="1.2"/><path d="M6.4 12.2l5.4 5.4-1.8 1.8-5.4-5.4z" fill="#c9a33a" stroke="#7a5a10" stroke-width="1"/><path d="M5.5 16.7l1.8 1.8-3.4 3.4-1.8-1.8z" fill="#6b4423"/>',
				"swing",
				1,
			],
			crown: [
				"Корона",
				'<path d="M3 18V8l4.5 4L12 5l4.5 7L21 8v10z" fill="#f2c14e" stroke="#8a5a00" stroke-width="1.3" stroke-linejoin="round"/><circle cx="12" cy="14.5" r="1.6" fill="#e2264d"/>',
				"beat",
				1,
			],
		};
		const emoSvg = (k, ani) => {
			const e = PEMO[k];
			return e
				? `<i class="emo${ani ? " ani emo-" + e[2] : ""}" title=":${k}: - ${e[0]}" role="img" aria-label="${e[0]}"><svg viewBox="0 0 24 24">${e[1]}</svg></i>`
				: "";
		};

		const STK_CLS = {
			leg: [
				"#a3122a",
				'<path d="M42 30q18-14 36 0v8H42z" fill="#c9a33a"/><path d="M58 14h4v14h-4z" fill="#e2264d"/>',
			],
			arch: [
				"#2f7a3a",
				'<path d="M86 40q14 22 0 44" fill="none" stroke="#8a5a2a" stroke-width="4"/><path d="M86 40v44" stroke="#eee" stroke-width="1.5"/>',
			],
			mage: [
				"#5b3aa8",
				'<path d="M40 34L60 4l20 30z" fill="#5b3aa8" stroke="#ffd23f" stroke-width="2"/><circle cx="60" cy="16" r="3" fill="#ffd23f"/>',
			],
			priest: [
				"#c98a1a",
				'<ellipse cx="60" cy="18" rx="16" ry="4" fill="none" stroke="#ffd23f" stroke-width="3"/>',
			],
			rogue: [
				"#3a3a4a",
				'<path d="M38 40q22-30 44 0v6q-22-10-44 0z" fill="#26262f"/>',
			],
			necro: [
				"#3f2a5a",
				'<g transform="translate(78 60)"><circle r="8" fill="#eee"/><circle cx="-3" cy="-1" r="2" fill="#222"/><circle cx="3" cy="-1" r="2" fill="#222"/></g>',
			],
			pal: [
				"#d8a020",
				'<g transform="translate(84 30)" fill="#ffd23f"><circle r="7"/><path d="M0-13v5M0 8v5M-13 0h5M8 0h5" stroke="#ffd23f" stroke-width="2.5"/></g>',
			],
			recruit: [
				"#6b8a3a",
				'<path d="M60 14q-6-8-12-4 6 2 12 4zM60 14q6-8 12-4-6 2-12 4zM59 14h2v10h-2z" fill="#3ecf8e"/>',
			],
		};
		const STK = {
			leg_hi: ["leg", "Привет!"],
			arch_gg: ["arch", "GG"],
			mage_wow: ["mage", "Ого!"],
			priest_heal: ["priest", "Лечу!"],
			leg_win: ["leg", "Победа!"],
			arch_miss: ["arch", "Мимо..."],
			mage_boom: ["mage", "Бум!"],
			priest_pray: ["priest", "Помолимся"],
			rogue_sneak: ["rogue", "Тсс..."],
			necro_boo: ["necro", "Бу!"],
			pal_shine: ["pal", "Сияю!"],
			recruit_lol: ["recruit", "Ахаха"],
		};
		const STK_FREE = ["leg_hi", "arch_gg", "mage_wow", "priest_heal"];
		const stkSvg = (id) => {
			const s = STK[id],
				c = s && STK_CLS[s[0]];
			if (!c) return "";
			const w = Math.max(44, s[1].length * 8 + 16);
			return (
				`<svg class="stk" viewBox="0 0 120 120" role="img" aria-label="Стикер: ${esc(s[1])}"><ellipse cx="60" cy="112" rx="30" ry="5" fill="#000" opacity=".25"/><rect x="40" y="58" width="40" height="48" rx="14" fill="${c[0]}" stroke="#1a1020" stroke-width="3"/>` +
				`<circle cx="60" cy="44" r="20" fill="#f6d2b0" stroke="#1a1020" stroke-width="3"/><circle cx="53" cy="44" r="2.6" fill="#1a1020"/><circle cx="67" cy="44" r="2.6" fill="#1a1020"/><path d="M53 52q7 6 14 0" fill="none" stroke="#1a1020" stroke-width="2.6" stroke-linecap="round"/>${c[1]}` +
				`<g transform="translate(${118 - w} 4)"><rect width="${w}" height="24" rx="10" fill="#fff8e8" stroke="#1a1020" stroke-width="2.5"/><text x="${w / 2}" y="17" text-anchor="middle" font-size="13" font-weight="800" fill="#1a1020" font-family="system-ui">${esc(s[1])}</text></g></svg>`
			);
		};

		const msgBody = (m) => {
			if (m.st && STK[m.st])
				return `<span class="stk-w">${stkSvg(m.st)}</span>`;
			const pe = (h) =>
				h.replace(/:([a-z]{2,6}):/g, (all, k) =>
					PEMO[k] && (!PEMO[k][3] || m.pe) ? emoSvg(k, !!m.pe) : all,
				);

			if (!EMO.e) return pe(esc(m.t));
			return String(m.t == null ? "" : m.t)
				.split(/(\s+)/)
				.map((w) => {
					const h = emoHtml(w, EMO.e, window.LG_BASE || "");
					return h.startsWith("<img") ? h : pe(h);
				})
				.join("");
		};

		const gtTag = (m) =>
			m.gt
				? `<i class="cy-gt" title="Гильдия [${esc(m.gt)}]">[${esc(m.gt)}]</i>`
				: "";
		const clsIco = (m) =>
			m.c
				? `<i class="cy-cls" title="${esc(m.cn || m.c)}" aria-label="${esc(m.cn || m.c)}">${CLS_ICO[m.c] || "◆"}</i>`
				: "";

		const NICK_COLORS = [
			"#ffc94d",
			"#ff8a80",
			"#ffab6e",
			"#f4ff81",
			"#b9f6ca",
			"#69f0ae",
			"#84ffff",
			"#80d8ff",
			"#9fa8ff",
			"#b388ff",
			"#ea80fc",
			"#ff80ab",
			"#ffd180",
			"#a7ffeb",
			"#ccff90",
			"#ffcdd2",
		];
		const nickColor = (l) => {
			let h = 2166136261;
			const t = String(l || "");
			for (let i = 0; i < t.length; i++) {
				h ^= t.charCodeAt(i);
				h = Math.imul(h, 16777619);
			}
			return NICK_COLORS[(h >>> 0) % NICK_COLORS.length];
		};
		const canMod = (m) =>
			m.k !== "dm" &&
			m.tb !== "gl" &&
			St().chat.mod &&
			m.l !== X.login() &&
			(St().chat.mod === "own" || !m.r);

		function chatBadges(box, C) {
			const du = C.dm && window.LGDm ? window.LGDm.unread() : 0,
				nu = C.unread + (C.open ? 0 : du);
			const n = box.querySelector(".cy-chat-n");
			n.hidden = !nu;
			n.textContent = nu > 99 ? "99+" : String(nu);
			const tabs = box.querySelector(".cy-chat-tabs");
			for (const tb of tabs.querySelectorAll("[data-tab]")) {
				const t = tb.dataset.tab,
					u = t === "dm" && window.LGDm ? du : C.un[t] || 0,
					bn = tb.querySelector(".cy-chat-tn"),
					on = C.tab === t;
				const hid = t === "g" ? !!K.one && !C.g : !C[t];
				if (tb.hidden !== hid) tb.hidden = hid;
				if (tb.getAttribute("aria-selected") !== String(on))
					tb.setAttribute("aria-selected", String(on));
				if (tb.tabIndex !== (on ? 0 : -1)) tb.tabIndex = on ? 0 : -1;
				bn.hidden = !u || on;
				bn.textContent = u > 99 ? "99+" : String(u);

				if (t === "gl") {
					const gn = C.glName,
						lb = gn
							? gn.tag
								? `[${gn.tag}] Гильдия`
								: gn.name.length > 16
									? gn.name.slice(0, 15) + "…"
									: gn.name
							: "Гильдия",
						sp = tb.querySelector("span"),
						ti = gn ? `Чат гильдии «${gn.name}»` : "Чат гильдии";
					if (sp && sp.textContent !== lb) sp.textContent = lb;
					if (tb.title !== ti) tb.title = ti;
				}
			}

			const over = tabs.scrollWidth > tabs.clientWidth + 1,
				want = over ? C.tab : "";
			if (box._lgTabSeen === want) return;
			box._lgTabSeen = want;
			if (over) {
				const on = tabs.querySelector('[aria-selected="true"]');
				if (on && on.offsetParent) {
					const l = on.offsetLeft - tabs.offsetLeft,
						r = l + on.offsetWidth;
					if (l < tabs.scrollLeft) tabs.scrollLeft = Math.max(0, l - 4);
					else if (r > tabs.scrollLeft + tabs.clientWidth)
						tabs.scrollLeft = r - tabs.clientWidth + 4;
				}
			}
		}

		function emoBind(box, f, inp) {
			const btn = f.querySelector(".cy-emo-b");
			if (!btn) return;
			const pf = () => {
				const h = X.hero && X.hero();
				return (h && typeof h.pf === "string" && h.pf) || "";
			};
			const prem = () => {
				const h = X.hero && X.hero();
				return !!(h && h.pm && h.pm.t > 0);
			};
			const sync = () => {
				btn.hidden = !/[es]/.test(pf());
			};
			sync();
			setInterval(sync, 5000);
			let pop = null;
			const close = () => {
				if (pop) {
					pop.remove();
					pop = null;
					btn.setAttribute("aria-expanded", "false");
				}
			};
			btn.onclick = () => {
				if (pop) {
					close();
					return;
				}
				const e = pf().includes("e") && prem(),
					s = pf().includes("s"),
					P = prem();
				pop = document.createElement("div");
				pop.className = "cy-emo-p";
				pop.setAttribute("role", "dialog");
				pop.setAttribute("aria-label", "Смайлы и стикеры");
				pop.innerHTML =
					`<div class="cy-emo-g" aria-label="Смайлы">${Object.keys(PEMO)
						.map((k) => {
							const lock = PEMO[k][3] && !e;
							return `<button type="button" data-emo="${k}"${lock ? ' disabled title="Особые смайлы - у подписчиков"' : ` title=":${k}:"`}>${emoSvg(k, e)}</button>`;
						})
						.join("")}</div>` +
					(s
						? `<div class="cy-emo-s" aria-label="Стикеры">${Object.keys(STK)
								.map((id) => {
									const lock = !STK_FREE.includes(id) && !P;
									return `<button type="button" data-stk="${id}"${lock ? ' disabled title="Расширенная коллекция - у подписчиков"' : ""}>${stkSvg(id)}${lock ? "<b>🔒</b>" : ""}</button>`;
								})
								.join("")}</div>`
						: "") +
					(!P
						? '<p class="cy-emo-h">Анимированные смайлы и вся коллекция стикеров - у подписки «Премиум»</p>'
						: "");
				f.appendChild(pop);
				btn.setAttribute("aria-expanded", "true");
				pop.addEventListener("click", (ev) => {
					const a = ev.target.closest("[data-emo]"),
						b = ev.target.closest("[data-stk]");
					if (a && !a.disabled) {
						const v = inp.value,
							add =
								(v && !/\s$/.test(v) ? " " : "") + ":" + a.dataset.emo + ": ";
						inp.value = (v + add).slice(0, 200);
						try {
							inp.focus({ preventScroll: true });
						} catch (er) {}
					}
					if (b && !b.disabled) {
						const was = inp.value;
						inp.value = ":st-" + b.dataset.stk + ":";
						close();
						f.requestSubmit
							? f.requestSubmit()
							: f.dispatchEvent(new Event("submit", { cancelable: true }));
						setTimeout(() => {
							if (!inp.value) inp.value = was;
						}, 0);
					}
				});
			};
			document.addEventListener("pointerdown", (ev) => {
				if (pop && !pop.contains(ev.target) && ev.target !== btn) close();
			});
			f.addEventListener("keydown", (ev) => {
				if (ev.key === "Escape" && pop) {
					ev.stopPropagation();
					close();
				}
			});
		}
		function chatRender(toEnd) {
			const box = St() && St().el.querySelector(".cy-chat");
			if (!box || !St().chat || !St().chat.on) return;
			const C = St().chat,
				b = box.querySelector(".cy-chat-b"),
				n = box.querySelector(".cy-chat-n"),
				l = box.querySelector(".cy-chat-l"),
				inp = box.querySelector(".cy-chat-f input"),
				sh = box.querySelector(".cy-chat-sh");
			box
				.querySelector(".cy-chat-t")
				.setAttribute("aria-expanded", String(C.open));
			b.hidden = !C.open;
			box.classList.toggle("open", C.open);

			if (box.dataset.szo !== String(C.open)) {
				box.dataset.szo = String(C.open);
				winFit(box);
			}
			chatBadges(box, C);
			chatTo(box, C);
			if (K.one) C.muted = C.mutes[tabRoom(C.tab)] || null;

			if (C.muted && C.muted.until && C.muted.until <= Date.now()) {
				C.muted = null;
				if (K.one) C.mutes[tabRoom(C.tab)] = null;
			}
			clearTimeout(St().chatMuteT);
			if (C.muted && C.muted.until)
				St().chatMuteT = setTimeout(
					() => chatRender(),
					Math.min(C.muted.until - Date.now() + 500, 60000),
				);

			const apB = box.querySelector(".cy-chat-ap"),
				perm = !!C.muted && !C.muted.until;
			if (perm && C.apOn == null) {
				C.apOn = false;
				X.api("/api/appeal/me").then((r) => {
					if (St() && St().chat) {
						St().chat.apOn = !!(r && r.ok && r.on);
						chatRender();
					}
				});
			}
			if (!perm) C.apOn = null;
			if (apB) apB.hidden = !(perm && C.apOn);
			if (C.tab === "gl") {
				const gm =
					C.glMute && (!C.glMute.until || C.glMute.until > Date.now())
						? C.glMute
						: null;
				inp.disabled = !!gm;
				inp.placeholder = gm
					? (gm.gmute
							? `Запрет руководства: ещё ${leftT(gm.until - Date.now())}`
							: gm.until
								? `Запрет модератора: ещё ${leftT(gm.until - Date.now())}`
								: "Бан в чатах гильдий") + whyTail(gm)
					: TAB_PH.gl;
				inp.title = gm
					? (gm.gmute
							? "Руководство гильдии запретило тебе писать в чат гильдии"
							: "Модератор запретил тебе писать в чаты гильдий") + whyTail(gm)
					: "";
			} else {
				inp.disabled = !!C.muted || (C.tab === "dm" && !C.peer);
				const ti = C.muted
					? (C.muted.until
							? `Мут ещё ${leftT(C.muted.until - Date.now())}`
							: "Модератор запретил тебе писать") + whyTail(C.muted)
					: "";
				if (inp.title !== ti) inp.title = ti;
			}
			if (C.tab !== "gl")
				inp.placeholder = C.muted
					? C.muted.until
						? `Мут ещё ${leftT(C.muted.until - Date.now())}${whyTail(C.muted)}`
						: `Модератор запретил тебе писать${whyTail(C.muted)}`
					: C.tab === "dm"
						? C.peer
							? `Лично для ${C.peer}…`
							: "Выбери собеседника: меню ника → «Написать»"
						: C.mod && C.tab === "g"
							? "Написать… (/help — команды)"
							: TAB_PH[C.tab] || TAB_PH.g;
			sh.hidden = !C.mod;
			sh.setAttribute("aria-pressed", String(!!C.panel));
			box.classList.toggle("pnl", !!C.panel);
			const dmx = box.querySelector(".cy-chat-dmx"),
				dmOn = C.tab === "dm" && !!window.LGDm && !!dmx;

			box.querySelector(".cy-chat-p").hidden = !C.panel;
			l.hidden = !!C.panel || dmOn;
			box.querySelector(".cy-chat-f").hidden =
				!!C.panel || C.tab === "lg" || dmOn;
			if (dmx) {
				dmx.hidden = !dmOn || !!C.panel;
				if (window.LGDm) window.LGDm.place();
			}
			if (C.open) emoLoad(X.api, X.hero());
			if (!C.open || C.panel || dmOn) return;
			const end = toEnd || l.scrollHeight - l.scrollTop - l.clientHeight < 40;

			if (C.tab === "lg") {
				const L = (K.log() || []).slice().reverse(),
					h = L.length
						? L.map(
								(e) =>
									`<li class="cy-chat-lg" title="${esc(hm(e.at))}">${esc(e.t)}</li>`,
							).join("")
						: `<li class="cy-chat-0">${esc(K.logEmpty || "Пока тихо.")}</li>`;
				if (C.lgH !== h || !l.firstChild) {
					C.lgH = h;
					l.innerHTML = h;
				}
				C.ren = null;
				if (end) l.scrollTop = l.scrollHeight;
				return;
			}
			C.lgH = "";
			const V = chatVis(),
				a = end ? null : anchorOf(l),
				LS = V.map(chatLi);

			if (
				C.ren &&
				C.liS &&
				l.children.length === LS.length &&
				C.liS.length === LS.length &&
				LS.every((x, i) => x === C.liS[i])
			) {
				if (end) l.scrollTop = l.scrollHeight;
				return;
			}
			l.innerHTML = V.length
				? LS.join("")
				: `<li class="cy-chat-0">${esc(TAB_EMPTY[C.tab] || TAB_EMPTY.g)}</li>`;
			C.ren = V.length ? V.map((m) => m.id) : null;
			C.liS = V.length ? LS : null;
			if (end) l.scrollTop = l.scrollHeight;
			else anchorBack(l, a);
		}

		function menuHint() {
			let touch = false;
			try {
				touch = !!(
					window.matchMedia &&
					window.matchMedia("(hover: none) and (pointer: coarse)").matches
				);
			} catch (x) {}
			return touch ? "долгое нажатие - меню" : "ПКМ - меню";
		}
		function chatLi(m) {
			const C = St().chat;
			if (m.sys)
				return `<li class="cy-chat-sys${m.gsys ? " cy-chat-gsys" : ""}">${esc(m.t)}</li>`;
			const nm = esc(m.n || m.l),
				ri = ROLE_ICO[m.r],
				role = ri
					? `<i class="cy-chat-r" title="${ri[1]}" aria-label="${ri[1]}">${ri[0]}</i>`
					: "";
			const mod = canMod(m)
				? `<button type="button" class="cy-chat-m" data-cmod aria-label="Модерация: ${nm}">⋯</button><span class="cy-chat-mm">` +
					`<button type="button" data-cact="del" data-id="${esc(m.id)}">Удалить</button>` +
					`<span class="cy-chat-mt">Мут:${MUTES.map(([k, t]) => `<button type="button" data-cact="mute" data-l="${esc(m.l)}" data-n="${nm}" data-min="${k}">${t}</button>`).join("")}</span>` +
					`<button type="button" class="bad" data-cact="ban" data-l="${esc(m.l)}" data-n="${nm}">Бан</button>` +
					(C.mod === "own"
						? m.r === "mod"
							? `<button type="button" data-cact="unmod" data-l="${esc(m.l)}" data-n="${nm}">Снять модератора</button>`
							: m.r
								? ""
								: `<button type="button" data-cact="mod" data-l="${esc(m.l)}" data-n="${nm}">Сделать модератором</button>`
						: "") +
					"</span>"
				: "";
			const me0 = String(X.login() || "").toLowerCase(),
				pinged =
					me0 &&
					m.l !== me0 &&
					new RegExp("(^|\\s)@" + me0 + "(\\b|$)", "i").test(String(m.t || ""));
			const cls = [
				m.l === X.login() ? "me" : "",
				m.l === chanLogin() ? "st" : m.r ? "md" : "",
				pinged ? "ping" : "",
				m.pend ? "pend" : "",
			]
				.filter(Boolean)
				.join(" ");
			const sl =
				C.modUi && window.LGModWin && canMod(m)
					? window.LGModWin.handle(modCtx(), m)
					: "";
			const cls2a = sl ? (cls ? cls + " mw-has" : "mw-has") : cls;

			const cls2 = [
				cls2a,
				m.pm && /^[a-z]{2,10}$/.test(m.pm) ? "pmf pmf-" + m.pm : "",
			]
				.filter(Boolean)
				.join(" ");
			const pnc = m.pn && /^[a-z]{2,10}$/.test(m.pn) ? ` pnc pnc-${m.pn}` : "";
			return `<li${cls2 ? ` class="${cls2}"` : ""}${m.rm ? ` data-rm="${esc(m.rm)}"` : ""}${m.id != null ? ` data-mid="${esc(m.id)}"` : ""} title="${esc(hm(m.at))}">${sl}${role}${clsIco(m)}${gtTag(m)}<b data-nick="${esc(m.l)}" tabindex="0" title="${m.k === "dm" ? "Переписка" : "Ответить"} (${menuHint()})"${pnc ? ` class="${pnc.trim()}"` : ` style="color:${nickColor(m.l)}"`}>${nm}</b>${m.k === "dm" && m.l === X.login() && m.to ? ` → <b data-nick="${esc(m.to)}" style="color:${nickColor(m.to)}">${esc(m.to)}</b>` : ""}${X.awb ? X.awb(m.aw) : ""} <span>${msgBody(m)}</span>${m.pend ? '<i class="cy-chat-pd" title="отправляется" aria-label="отправляется">…</i>' : ""}${mod}</li>`;
		}

		async function chatPanel(on) {
			St().chat.panel = on && !!St().chat.mod;
			chatRender();
			if (!St().chat.panel) {
				chatRender(true);
				return;
			}
			const pn = St().el.querySelector(".cy-chat-p");
			pn.innerHTML = '<p class="cy-chat-pl">Загружаю…</p>';
			const r = await X.api(baseOf(tabRoom(St().chat.tab)) + "/mod");
			if (!St() || !St().chat || !St().chat.panel) return;
			if (!r || !r.ok) {
				pn.innerHTML = `<p class="cy-chat-pl">${esc(chatErrOf(r, "не загрузилось"))}</p><button type="button" class="cy-chat-pb" data-pback>← К чату</button>`;
				return;
			}
			St().chat.info = r;
			if (r.role === "own" || r.role === "mod") St().chat.mod = r.role;
			const bans = (r.bans || [])
				.map(
					(x) =>
						`<li><b>${esc(x.l)}</b> <span>${x.until ? `мут до ${esc(hm(x.until))}${x.until - Date.now() > 864e5 ? ` (${leftT(x.until - Date.now())})` : ""}` : "бан"}${x.by ? ` · ${esc(x.by)}` : ""}</span><button type="button" data-cact="unban" data-l="${esc(x.l)}">Снять</button></li>`,
				)
				.join("");
			const mods =
				r.role === "own"
					? `<h4>Модераторы чата</h4><ul class="cy-chat-pu">${(r.mods || []).map((x) => `<li><b>${esc(x)}</b><button type="button" data-cact="unmod" data-l="${esc(x)}" aria-label="Снять модератора ${esc(x)}">×</button></li>`).join("") || '<li class="cy-chat-pl">Пока никого. Модераторы канала на платформе модерируют чат и без этого списка.</li>'}</ul>
        <form class="cy-chat-pf" data-pmod><input type="text" maxlength="26" placeholder="ник модератора" aria-label="Ник нового модератора" autocomplete="off"><button type="submit">Добавить</button></form>`
					: "";
			pn.innerHTML = `<form class="cy-chat-pf" data-pban><input type="text" maxlength="26" placeholder="ник" aria-label="Ник, кого ограничить" autocomplete="off"><select aria-label="Срок">${MUTES.map(([k, t]) => `<option value="${k}">мут ${t}</option>`).join("")}<option value="ban">бан</option></select><button type="submit">Ок</button></form>
        <h4>Мут и бан</h4><ul class="cy-chat-pu">${bans || '<li class="cy-chat-pl">Никто не ограничен.</li>'}</ul>${mods}
        <button type="button" class="cy-chat-pb" data-pback>← К чату</button>`;
		}

		async function appealOpen() {
			const SU = window.LGSiteUi,
				r = await X.api("/api/appeal/me");
			if (!St()) return;
			if (!r || !r.ok || !r.on || !r.chat) {
				chatErr("обжалование пока не открыто");
				return;
			}
			const k = r.chat,
				a = k.appeal,
				ST = {
					new: "на рассмотрении",
					lifted: "бан снят",
					rejected: "отказано",
				};
			const info = a
				? `<p>Твоё обжалование - <b>${esc(ST[a.st] || a.st)}</b></p><p class="q">${esc(a.text)}</p>${a.answer ? `<p><b>Ответ:</b> ${esc(a.answer)}</p>` : ""}`
				: "";
			if (!k.can) {
				SU.askText({
					title: "Обжаловать бан чата",
					info: info + (k.why ? `<p>${esc(k.why)}</p>` : ""),
					field: false,
				});
				return;
			}
			SU.askText({
				title: "Обжаловать бан чата",
				info,
				hint: "Напиши, почему бан стоит снять. Модераторы канала прочитают и ответят - ответ будет здесь же.",
				max: r.max || 500,
				empty: "Напиши, почему бан стоит снять.",
				send: (text) =>
					X.api("/api/appeal", { kind: "chat", text }).then((x) => {
						if (x && x.ok) chatErr("Обжалование отправлено", true);
						return x;
					}),
			});
		}
		function chatErr(t, ok) {
			const e = St() && St().el.querySelector(".cy-chat-e");
			if (!e) return;
			e.textContent = CHAT_ERR[t] || t;
			e.classList.toggle("ok", !!ok);
			clearTimeout(St().chatErrT);
			St().chatErrT = setTimeout(() => {
				e.textContent = "";
			}, 4000);
		}

		const CHAT_HELP = "/mute ник [минут] [причина] · /ban ник · /unban ник";
		async function chatCmd(t) {
			const [cmd0, nick0, arg] = t.slice(1).trim().split(/\s+/),
				cmd = String(cmd0 || "").toLowerCase(),
				nick = String(nick0 || "")
					.replace(/^@/, "")
					.toLowerCase();
			const C = St().chat;
			if (!C.mod) {
				chatErr("команды — только модераторам чата");
				return false;
			}
			const own = C.mod === "own",
				needNick = () => {
					if (!/^[a-z0-9_]{1,25}$/.test(nick)) {
						chatErr(`укажи ник: /${cmd} ник`);
						return false;
					}
					return true;
				};
			if (cmd === "help" || cmd === "помощь") {
				chatSys(
					own
						? `Команды: /mod ник · /unmod ник · /mods · ${CHAT_HELP}`
						: `Команды: ${CHAT_HELP}`,
				);
				return true;
			}
			if (cmd === "mods") {
				if (!own) {
					chatErr("список модераторов — у админа чата");
					return false;
				}
				const r = await X.api(baseOf("city") + "/mod");
				if (!St() || !St().chat) return false;
				if (!r || !r.ok) {
					chatErr(chatErrOf(r, "не вышло"));
					return false;
				}
				chatSys(
					(r.mods || []).length
						? `Модераторы чата (${r.mods.length}): ${r.mods.join(", ")}`
						: "Модераторов чата пока нет. Назначить: /mod ник",
				);
				return true;
			}
			if (cmd === "mod" || cmd === "unmod") {
				if (!own) {
					chatErr("назначать модераторов может только админ чата");
					return false;
				}
				if (!needNick()) return false;
				return chatAct(cmd, { login: nick, n: nick });
			}

			if (cmd === "mute") {
				if (!needNick()) return false;
				const m = arg == null ? 30 : Math.round(+arg);
				if (!(m >= 1 && m <= 10080)) {
					chatErr("срок мута — от 1 до 10080 минут (7 дней)");
					return false;
				}
				const why = t
					.slice(1)
					.trim()
					.split(/\s+/)
					.slice(3)
					.join(" ")
					.slice(0, 200);
				return chatAct("mute", { login: nick, n: nick, min: m, reason: why });
			}
			if (cmd === "ban" || cmd === "unban") {
				if (!needNick()) return false;
				return chatAct(cmd, { login: nick, n: nick, sure: cmd === "ban" });
			}
			chatErr(`нет такой команды: /${cmd}. Список — /help`);
			return false;
		}

		function chatSys(t) {
			St().chat.list.push({
				id: "sys" + Date.now() + Math.random().toString(36).slice(2, 6),
				sys: true,
				t,
				at: Date.now(),
				tb: St().chat.tab,
			});
			chatTrim();
			chatRender(true);
		}

		const PEND_TABS = ["g", "tr", "mn"];
		function pendAdd(t, tab) {
			const C = St().chat,
				me = String(X.login() || "").toLowerCase(),
				h = X.hero ? X.hero() : null,
				pid =
					"cp" +
					Date.now().toString(36) +
					Math.random().toString(36).slice(2, 6);
			C.list.push({
				id: pid,
				pend: true,
				s: 0,
				l: me,
				n: (h && h.name) || me,
				t,
				at: Date.now(),
				tb: tab,
				...(tab === "mn" && K.one ? { rm: "mine" } : {}),
				...(tab === "tr" ? { k: "tr" } : {}),
			});
			chatTrim();
			chatRender(true);
			return pid;
		}
		async function chatSend(inp) {
			const t = inp.value.trim();

			if (!t) {
				try {
					inp.dispatchEvent(
						new CustomEvent("lg-chat-sent", {
							bubbles: true,
							detail: { empty: true },
						}),
					);
				} catch (e) {
					console.warn("чат: событие пустой отправки", e);
				}
				return;
			}

			if (
				!St().chat ||
				(St().chat.sending &&
					!PEND_TABS.includes(St().chat.tab) &&
					St().chat.tab !== "gl")
			)
				return;
			if (t.startsWith("/") && St().chat.tab === "g") {
				St().chat.sending = true;
				const ok = await chatCmd(t);
				if (!St() || !St().chat) return;
				St().chat.sending = false;
				if (ok) inp.value = "";
				return;
			}

			if (St().chat.tab === "gl") {
				const C0 = St().chat,
					pid =
						"gp" +
						Date.now().toString(36) +
						Math.random().toString(36).slice(2, 6),
					me = String(X.login() || "").toLowerCase();
				C0.list.push({
					id: pid,
					pend: true,
					s: 0,
					l: me,
					n: me,
					t,
					at: Date.now(),
					tb: "gl",
				});
				inp.value = "";
				chatTrim();
				chatRender(true);
				const r = await X.api("/api/guilds/say", { t });
				if (!St() || !St().chat) return;
				const C1 = St().chat;
				C1.list = C1.list.filter((m) => m.id !== pid);
				C1.ren = null;
				if (r && r.ok && r.msg) {
					const gm = glMsg(r.msg);
					if (gm.gid && (!C1.glLast || +gm.gid > +C1.glLast))
						C1.glLast = gm.gid;
					chatApply({ chat: [gm] });
					chatRender(true);
					try {
						inp.dispatchEvent(
							new CustomEvent("lg-chat-sent", { bubbles: true }),
						);
					} catch (e) {
						console.warn("чат: событие отправки", e);
					}
					return;
				}
				if (!inp.value) inp.value = t;
				if (r && r.until != null)
					C1.glMute = {
						until: +r.until || 0,
						...(r.gmute ? { gmute: true } : {}),
						...(r.reason ? { reason: String(r.reason) } : {}),
					};
				chatRender();
				chatErr((r && r.error) || "не отправилось - нет связи");
				return;
			}
			if (K.here && !K.here()) {
				chatErr(K.joining || "подключаемся…");
				if (K.rejoin) K.rejoin();
				return;
			}

			if (St().chat.tab === "dm" && !St().chat.peer) {
				chatErr("кому? меню ника в ленте → «Написать»");
				return;
			}

			const tab0 = St().chat.tab,
				dest = K.sayTo ? K.sayTo(tab0) : null;

			const pid = PEND_TABS.includes(tab0) ? pendAdd(t, tab0) : "";
			if (pid) inp.value = "";
			else St().chat.sending = true;
			let r = await X.api(dest ? dest.url : K.say, {
				text: t,
				...(dest
					? dest.body
					: tab0 === "tr"
						? { k: "tr" }
						: tab0 === "dm"
							? { to: St().chat.peer }
							: {}),
			});
			if (r && r.ok && r.msg && K.tag)
				r = { ...r, msg: K.tag(r.msg, tabRoom(tab0)) };
			if (!St() || !St().chat) return;
			if (pid) {
				const C1 = St().chat,
					n = C1.list.length;
				C1.list = C1.list.filter((m) => m.id !== pid);
				if (C1.list.length !== n) C1.ren = null;
			} else St().chat.sending = false;
			if (r && r.ok && r.msg) {
				if (!pid) inp.value = "";
				chatApply({ chat: [r.msg] });
				chatRender(true);
				try {
					inp.dispatchEvent(new CustomEvent("lg-chat-sent", { bubbles: true }));
				} catch (e) {
					console.warn("чат: событие отправки", e);
				}
				return;
			}
			if (pid) {
				if (!inp.value) inp.value = t;
				chatRender();
			}
			const er = (r && r.error) || "не отправилось — нет связи";
			if (/запретил/.test(er)) {
				setMuted(tabRoom(St().chat.tab), St().chat.muted || { until: 0 });
				chatRender();
			}
			if (K.onError) K.onError(er);
			chatErr(er);
		}

		const muteWhat = (min) =>
			"мут " +
			(MUTES.find((x) => x[0] === min) ||
				MUTE_MENU.find((x) => x[0] === min) || [0, leftT(min * 60000)])[1];
		const askWhy = (o) =>
			window.LGSiteUi && window.LGSiteUi.askReason
				? window.LGSiteUi.askReason({
						who: o.n || o.login,
						what: o.what || muteWhat(o.min),
					})
				: Promise.resolve("");
		const whyTail = (m) => (m && m.reason ? `. Причина: ${m.reason}` : "");
		async function chatAct(op, o, done) {
			if (
				op === "ban" &&
				!o.sure &&
				!(await window.LGSiteUi.ask({
					title: `Забанить «${o.n || o.login}» ${K.where || "в чате"}?`,
					text: "Все его сообщения пропадут у всех.",
					yes: "Забанить",
					danger: true,
				}))
			)
				return false;
			if (op === "mute" && o.reason === undefined) {
				const w = await askWhy(o);
				if (w === null) return false;
				o = { ...o, reason: w };
			}
			if (!St() || !St().chat) return false;
			const rm = o.rm || (K.one ? tabRoom(St().chat.tab) : "city");
			const r = await X.api(baseOf(rm) + "/mod", {
				op,
				id:
					o.id && rm === "mine"
						? String(o.id).replace(/^m:/, "")
						: (o.id ?? undefined),
				login: o.login,
				min: o.min,
				...(op === "mute" && o.reason ? { reason: o.reason } : {}),
			});
			if (!St() || !St().chat) return;
			if (!r || !r.ok) {
				chatErr(chatErrOf(r, "не вышло"));
				return false;
			}
			const pre = (id) => (K.one && rm === "mine" ? "m:" + id : id);
			if (op === "del") chatApply({ chatDel: [pre(r.id)] });
			if (r.gone && r.gone.length) chatApply({ chatDel: r.gone.map(pre) });
			const who = o.n || o.login || "";
			chatErr(
				{
					purge: `${who}: сообщения удалены`,
					del: "Сообщение удалено",
					mute: `${who}: мут ${(MUTES.find((x) => x[0] === o.min) || [0, leftT(o.min * 60000)])[1]}`,
					ban: `${who}: бан в чате`,
					unban: `${who}: снова может писать`,
					mod: `${who} — модератор чата`,
					unmod: `${who} больше не модератор`,
				}[op] || "Готово",
				true,
			);
			if (op === "mod" || op === "unmod")
				for (const m of St().chat.list)
					if (m.l === r.login) m.r = op === "mod" ? "mod" : undefined;
			if (done) done();
			if (St().chat.panel) chatPanel(true);
			else chatRender();
			modNotify();
			return true;
		}

		function kbFit() {
			const vv = window.visualViewport;
			if (!vv) return;
			for (const box of document.querySelectorAll(".cy-chat")) {
				const on =
					box.classList.contains("open") &&
					window.LGSiteUi.is("phone") &&
					box.contains(document.activeElement) &&
					/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName);
				if (!on) {
					if (box.classList.contains("cy-kb")) {
						box.classList.remove("cy-kb");
						box.style.removeProperty("--cy-kb");
					}
					continue;
				}

				const cur = +(box.style.getPropertyValue("--cy-kb") || 0),
					bottom = box.getBoundingClientRect().bottom + cur,
					up = Math.max(0, Math.round(bottom - (vv.offsetTop + vv.height) + 6));
				box.classList.add("cy-kb");
				if (String(up) !== String(cur))
					box.style.setProperty("--cy-kb", String(up));
			}
		}
		if (!kbFit.on && window.visualViewport) {
			kbFit.on = 1;
			window.visualViewport.addEventListener("resize", kbFit);
			window.visualViewport.addEventListener("scroll", kbFit);
			document.addEventListener("focusin", () => setTimeout(kbFit, 60));
			document.addEventListener("focusout", () => setTimeout(kbFit, 60));
		}

		return {
			init: () => {
				St();
				chatInit();
			},
			enter: (r, rm) => {
				St();
				chatEnter(r, rm);
			},
			apply: (d, rm) => {
				St();
				chatApply(d, rm);
			},
			tab: (t) => {
				St();
				if (St() && St().chat) chatTab(t);
			},
			unAdd: (t, n) => {
				St();
				const C = St() && St().chat;
				if (!C || !n) return;
				C.un[t] = (C.un[t] || 0) + n;
				C.unread += n;
				const box = St().el.querySelector(".cy-chat");
				if (box) chatBadges(box, C);
			},
			render: (e) => {
				St();
				chatRender(e);
			},
			open: (on) => {
				St();
				chatOpen(on);
			},
			menuClose: () => {
				St();
				nickMenuClose();
			},

			size: () => {
				if (St()) winFit();
			},

			tabsSaved: () => !!tabsLoad(),
			tabsReset: () => {
				const s = St();
				tabsReset(s && s.el ? s.el.querySelector(".cy-chat") : null);
			},
		};
	}

	window.LGChat = { make, html, emoText, emoHtml, emoFill };
})();
