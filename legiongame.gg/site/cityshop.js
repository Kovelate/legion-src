(() => {
	window.LGCityShop = (C) => {
		const esc = C.esc,
			ART = C.ART,
			still = C.still,
			scopeIds = C.scopeIds,
			npcAs = C.npcAs,
			ROOM = C.ROOM;
		const hwDead = () => C.hwDead(),
			csOn = () => C.csOn(),
			msOn = () => C.msOn(),
			inTown = () => C.inTown(),
			homeHere = () => C.homeHere(),
			foreignK = () => C.foreignK();
		const streetBg = () => C.streetBg();

		const shopTiles = (inn, st, h) => C.bld("shop").tiles(inn, st, h),
			tentHots = (inn, st, pos) => C.bld("tent").hots(inn, st, pos);

		const FULL = { forge: 1, magic: 1, tent: 1, shop: 1 };
		let STOCK = null;
		const loadStock = () =>
			STOCK
				? Promise.resolve(STOCK)
				: C.X.api("/api/city/stock")
						.then((r) => {
							if (r && r.ok) STOCK = r;
							return STOCK;
						})
						.catch(() => null);

		const WALL_UP = 2400;
		const ROOM_HEAD = 64;
		const WALL_S = (WALL_UP + 4) / 2,
			WALL_TY = -WALL_UP - 4 * WALL_S;

		const OL_DEFS =
			"<defs>" +
			[
				["cy-itol", "#ffe9a0", 0.55],
				["cy-itol2", "#ffc94d", 0.8],
			]
				.map(
					([id, c, o]) =>
						`<filter id="${id}" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB"><feComponentTransfer in="SourceAlpha" result="a"><feFuncA type="discrete" tableValues="0 1"/></feComponentTransfer><feMorphology class="cy-olm" in="a" operator="dilate" radius="4" result="d"/><feFlood flood-color="${c}"/><feComposite in2="d" operator="in" result="o"/><feGaussianBlur in="o" stdDeviation="4" result="b"/><feComponentTransfer in="b" result="g"><feFuncA type="linear" slope="${o}"/></feComponentTransfer><feMerge><feMergeNode in="g"/><feMergeNode in="o"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`,
				)
				.join("") +
			"</defs>";
		const doodSize = (r, street) =>
			r
				.querySelectorAll(
					street ? ".cy-rbg svg svg.jl-doodle" : ".cy-rbg svg.jl-doodle",
				)
				.forEach((d) => {
					const w = d.getAttribute("width"),
						hh = d.getAttribute("height");
					if (w) d.style.width = parseFloat(w) + "px";
					if (hh) d.style.height = parseFloat(hh) + "px";
					if (street) {
						d.style.position = "static";
						d.style.filter = "none";
					}
				});
		function roomSvg(id) {
			const inner = OL_DEFS + roomBg(id);
			if (!ROOM[id] || !ROOM[id].fit) return inner;
			return (
				`<defs><clipPath id="cy-wall-top" clipPathUnits="userSpaceOnUse"><rect x="0" y="4" width="1920" height="2"/></clipPath></defs>` +
				`<g id="cy-room-scene">${inner}</g><use href="#cy-room-scene" clip-path="url(#cy-wall-top)" transform="translate(0 ${WALL_TY}) scale(1 ${WALL_S})"/>`
			);
		}
		function roomBg(id) {
			const R = ROOM[id],
				L = C.S.L;
			if (R.art === "street") return streetBg();
			try {
				if (
					!R.art &&
					L.rooms &&
					L.rooms[id] &&
					typeof L.rooms[id].svg === "function"
				) {
					const st =
						shopView(id, stockOf(id)) ||
						(id === "forge" || id === "magic"
							? { stands: [], shelf1: [], shelf2: [], case: [], mats: [] }
							: { booths: [], amulets: [] });
					C.S.itemPos = {};
					return (
						`<rect width="1920" height="1080" fill="${esc(L.rooms[id].artBg || "#1d1626")}"/>` +
						scopeIds(
							still(
								npcAs(hwDead() ? "ghost" : "", () =>
									L.rooms[id].svg(st, C.S.itemPos),
								),
							),
							"cyr-",
						)
					);
				}
			} catch (e) {
				console.warn("[город] интерьер", id, e);
			}
			return scopeIds(ART.room(C.S.st, R.art || "plain"), "cyr-");
		}

		function fitRoom() {
			if (!C.S || !C.S.panelId) return;
			const r = C.S.room,
				inn = r.querySelector(".cy-rin"),
				ui = r.querySelector(".cy-rui"),
				R = ROOM[C.S.panelId];
			if (!inn || !ui) return;
			const vw = r.clientWidth || innerWidth,
				vh = r.clientHeight || innerHeight,
				ur = ui.getBoundingClientRect(),
				mob = vw <= 720 || vh <= 500;
			if (FULL[C.S.panelId]) {
				fitFull(r, inn, vw, vh, mob, R);
				popPlace();
				return;
			}
			let x0 = 0,
				x1 = vw,
				y1 = vh;
			if (mob) y1 = Math.max(160, vh - ur.height);
			else if (R.ui === "l") x0 = ur.right;
			else if (R.ui === "r") x1 = ur.left;
			let k = mob
				? Math.max(y1 / 1080, vw / 1920)
				: Math.max(vw / 1920, vh / 1080);
			let left, top;

			if (R.fit && !mob) {
				k = Math.max(Math.min(k, (x1 - x0) / 1920), (0.6 * vh) / 1080);
				const w = 1920 * k;
				left =
					w <= x1 - x0
						? x0 + (x1 - x0 - w) / 2
						: Math.min(x0, Math.max(x1 - w, (x0 + x1) / 2 - R.focus * k));
				top = y1 - 1080 * k;
			} else {
				left = (x0 + x1) / 2 - R.focus * k;
				left = Math.min(0, Math.max(vw - 1920 * k, left));
				top = Math.min(0, y1 - 1080 * k);
				if (R.keep) top = Math.min(0, Math.max(top, ROOM_HEAD - R.keep * k));

				if (R.top != null && !mob) top = Math.min(0, Math.max(top, -R.top * k));
			}

			let bg =
				R.fit &&
				!mob &&
				top > 0 &&
				((C.S.L.rooms &&
					C.S.L.rooms[C.S.panelId] &&
					C.S.L.rooms[C.S.panelId].artBg) ||
					"");
			if (R.fit && !mob && top > 0 && !bg) {
				const rc = r.querySelector('.cy-rbg rect[width="1920"]'),
					f = rc && rc.getAttribute("fill");
				if (f && /^#[\da-f]{3,8}$/i.test(f)) bg = f;
			}
			r.classList.toggle("cy-fit", !!bg);
			r.style.setProperty("--cy-fitbg", bg || "transparent");
			panRoom(r, inn, k, left, top, 0, vw, R.keep ? ROOM_HEAD : 0, y1, vw, vh);

			if (R.box && !mob) {
				const m = /translate\(([-\d.]+)px, ([-\d.]+)px\)/.exec(
						inn.style.transform || "",
					),
					rs = r.querySelector(".cy-rs");
				const sx = (m ? +m[1] : left) - (rs ? rs.scrollLeft : 0),
					sy = (m ? +m[2] : top) - (rs ? rs.scrollTop : 0);
				const [bx0, by0, bx1, by1] = R.box,
					t = Math.max(ROOM_HEAD + 12, sy + by0 * k),
					b = Math.min(vh - 8, sy + by1 * k),
					l = Math.max(8, sx + bx0 * k),
					rr = Math.min(vw - 8, sx + bx1 * k);
				Object.assign(ui.style, {
					top: t.toFixed(0) + "px",
					height: Math.max(160, b - t).toFixed(0) + "px",
					bottom: "auto",
					left: l.toFixed(0) + "px",
					width: Math.max(280, rr - l).toFixed(0) + "px",
					transform: "none",
				});
			} else if (ui.style.transform === "none")
				Object.assign(ui.style, {
					top: "",
					height: "",
					bottom: "",
					left: "",
					width: "",
					transform: "",
				});
		}

		function panRoom(r, inn, k, left, top, x0, x1, y0, y1, vw, vh) {
			const rs = r.querySelector(".cy-rs"),
				sz = r.querySelector(".cy-rsz"),
				w = 1920 * k,
				h = 1080 * k;
			const ox = Math.min(0, left - x0),
				oy = Math.min(0, top - y0);
			const bx = left - ox,
				by = top - oy;

			const sx0 = Math.max(0, Math.max(bx + w - x1, -ox)),
				sy0 = Math.max(0, Math.max(by + h - y1, -oy));
			const sx = sx0 < 24 ? 0 : sx0,
				sy = sy0 < 24 ? 0 : sy0;
			const pan = sx > 1 || sy > 1;
			if (rs) {
				rs.classList.toggle("cy-pan", pan);
				rs.style.overflowX = pan && !sx ? "hidden" : "";
				rs.style.overflowY = pan && !sy ? "hidden" : "";
			}
			if (!pan || !rs || !sz) {
				if (sz) {
					sz.style.width = "0";
					sz.style.height = "0";
				}
				inn.style.transform = `translate(${left.toFixed(1)}px, ${top.toFixed(1)}px) scale(${k.toFixed(4)})`;
				return;
			}
			sz.style.width = Math.ceil(vw + sx) + "px";
			sz.style.height = Math.ceil(vh + sy) + "px";
			inn.style.transform = `translate(${bx.toFixed(1)}px, ${by.toFixed(1)}px) scale(${k.toFixed(4)})`;
			if (!C.S.roomUser) {
				rs.scrollLeft = Math.round(-ox);
				rs.scrollTop = Math.round(-oy);
			}
		}

		function roomHead(r) {
			const rr = r.getBoundingClientRect();
			let b = 0;
			for (const el of r.querySelectorAll(".cy-rh, .cy-rui.cy-rbar .cy-bar2")) {
				const q = el.getBoundingClientRect();
				if (q.height) b = Math.max(b, q.bottom - rr.top);
			}
			return Math.round(b + 6);
		}

		function roomCols(id) {
			const pos = C.S.itemPos || {},
				st = stockOf(id) || {},
				groups = [];
			const at = (list) =>
				(list || []).map((it) => it && pos[it.id]).filter(Boolean);
			for (const s of st.stands || [])
				groups.push(
					at([...(s.top || []), ...(s.mid || []), ...(s.case || [])]),
				);
			const cols = groups
				.filter((g) => g.length)
				.map((g) => [
					Math.min(...g.map((p) => p.x)) - 150,
					Math.max(...g.map((p) => p.x)) + 150,
				]);
			return cols
				.map(([a, b]) => [Math.max(0, a), Math.min(1920, b)])
				.sort((a, b) => a[0] - b[0]);
		}

		const STRIP_W = 640;

		const PSTAND = {
			legionary: "Легионер",
			archer: "Лучник",
			magic: "Маг · Жрец",
		};
		function portShop(r, inn, vw, head, bottom) {
			const id = C.S.panelId,
				st = stockOf(id),
				rs = r.querySelector(".cy-rs"),
				sz = r.querySelector(".cy-rsz"),
				svg = inn.querySelector(".cy-rbg");
			if (
				!(id === "forge" || id === "magic") ||
				!st ||
				!(st.stands || []).length ||
				!rs ||
				!svg
			)
				return false;
			const pos = C.S.itemPos || {},
				h = C.X.hero(),
				names = (C.X.names && C.X.names()) || {},
				RL = names.roles || {};
			svg.id = "cy-pscene";
			const tile = (it) => {
				const p = pos[it.id];
				if (!p) return "";
				const c = coinsFor(it, h),
					lk = lockedHere(it),
					nm = C.X.itemName(it.id) || it.name || it.id;
				const vb = `${Math.round(p.x - 76)} ${Math.round(p.y - 52)} 152 150`;
				return (
					`<button type="button" class="cy-hot cy-ptile${lk ? " lock" : ""}" data-good="${esc(it.id)}" data-r="${esc(it.rarity || "common")}" aria-label="${esc(nm)} - ${c ? esc(plainMoney(c)) : "купить на стриме"}">` +
					`<svg class="cy-pti" viewBox="${vb}" aria-hidden="true"><use href="#cy-pscene"/></svg><b>${esc(nm)}</b><span class="cy-ptp">${lk ? "🔒" : c ? esc(plainMoney(c)) : "-"}</span></button>`
				);
			};
			const ttl = (S0) => RL[S0.key] || PSTAND[S0.key] || S0.name || "";
			const box = document.createElement("div");
			box.className = "cy-pshop";
			box.style.top = head + "px";
			box.style.paddingBottom = Math.ceil(bottom) + "px";
			box.innerHTML = st.stands
				.map((S0) => {
					const sh = [S0.top || [], S0.mid || []]
							.map((l) => l.map(tile).join(""))
							.filter(Boolean),
						cs = (S0.case || []).map(tile).join("");
					return `<section class="cy-pst" data-k="${esc(S0.key || "")}"><h3>${esc(ttl(S0))}</h3>${sh.map((x) => `<div class="cy-pshelf">${x}</div>`).join("")}${cs ? `<div class="cy-pcase">${cs}</div>` : ""}</section>`;
				})
				.join("");
			rs.appendChild(box);
			box
				.querySelectorAll("[data-good]")
				.forEach((el) => bindGood(el, id, el.dataset.good));
			inn.style.visibility = "hidden";
			r.classList.add("cy-striped", "cy-port");
			r.style.setProperty("--cy-phead", head + "px");
			rs.classList.add("cy-pan");
			rs.classList.remove("cy-snap");
			rs.style.overflowX = "hidden";
			rs.style.overflowY = "auto";
			if (sz) {
				sz.style.width = vw + "px";
				sz.style.height = "0";
			}
			const sn = rs.querySelector(".cy-snaps");
			if (sn) sn.innerHTML = "";
			return true;
		}
		function stripsOff(r) {
			const ps = r && r.querySelector(".cy-pshop");
			if (ps) {
				ps.remove();
				r.classList.remove("cy-port");
				const iv = r.querySelector(".cy-rin");
				if (iv) iv.style.visibility = "";
				r.classList.remove("cy-striped");
			}
			const box = r && r.querySelector(".cy-strips");
			if (!box) return;
			box.querySelectorAll(".cy-sin .cy-hots > *").forEach((el) => {
				if (el._cyHome && el._cyHome.isConnected) el._cyHome.appendChild(el);
			});
			box.remove();
			const inn = r.querySelector(".cy-rin");
			if (inn) inn.style.visibility = "";
			r.classList.remove("cy-striped");
		}
		function stripChunks(id, hots) {
			let cols = roomCols(id);
			if (cols.length > 1) return cols;
			const xs = hots
				.map((b) => parseFloat(b.style.left) + b.offsetWidth / 2)
				.filter((x) => Number.isFinite(x));
			if (!xs.length) return [];
			const a = Math.max(0, Math.min(...xs) - 110),
				b = Math.min(1920, Math.max(...xs) + 110),
				n = Math.max(1, Math.ceil((b - a) / STRIP_W)),
				w = (b - a) / n;
			cols = [];
			for (let i = 0; i < n; i++) cols.push([a + i * w, a + (i + 1) * w]);
			return cols;
		}
		function stripsOn(r, inn, vw, head, bottom) {
			const rs = r.querySelector(".cy-rs"),
				sz = r.querySelector(".cy-rsz"),
				svg = inn.querySelector(".cy-rbg");
			if (!rs || !svg) return false;
			const hots = [...inn.querySelectorAll(".cy-hots > *")],
				cols = stripChunks(C.S.panelId, hots);
			if (cols.length < 2) return false;
			const k = (vw - 12) / Math.max(...cols.map(([a, b]) => b - a)),
				box = document.createElement("div");
			box.className = "cy-strips";
			let y = head;
			for (const [a, b] of cols) {
				const mine = hots.filter((el) => {
					const x = parseFloat(el.style.left) + el.offsetWidth / 2;
					return x >= a && x < b;
				});
				const ys = mine
					.map((el) => parseFloat(el.style.top))
					.filter((v) => Number.isFinite(v));
				const y0 = ys.length ? Math.max(0, Math.min(...ys) - 140) : 0,
					y1 = ys.length
						? Math.min(
								1080,
								Math.max(...ys) +
									Math.max(...mine.map((el) => el.offsetHeight || 0)) +
									70,
							)
						: 1080;
				const st = document.createElement("div");
				st.className = "cy-strip";
				const w = (b - a) * k,
					h = (y1 - y0) * k;
				Object.assign(st.style, {
					left: ((vw - w) / 2).toFixed(1) + "px",
					top: y.toFixed(1) + "px",
					width: w.toFixed(1) + "px",
					height: h.toFixed(1) + "px",
				});
				const sin = document.createElement("div");
				sin.className = "cy-sin";
				sin.style.transform = `translate(${(-a * k).toFixed(1)}px, ${(-y0 * k).toFixed(1)}px) scale(${k.toFixed(4)})`;
				const cl = svg.cloneNode(true);
				cl.removeAttribute("id");
				sin.appendChild(cl);
				const hb = document.createElement("div");
				hb.className = "cy-hots";
				sin.appendChild(hb);
				for (const el of mine) {
					el._cyHome = el.parentNode;
					hb.appendChild(el);
				}
				st.appendChild(sin);
				box.appendChild(st);
				y += h + 10;
			}
			rs.appendChild(box);
			inn.style.visibility = "hidden";
			r.classList.add("cy-striped");
			rs.classList.add("cy-pan");
			rs.classList.remove("cy-snap");
			rs.style.overflowX = "hidden";
			rs.style.overflowY = "auto";
			if (sz) {
				sz.style.width = vw + "px";
				sz.style.height = Math.ceil(y + bottom) + "px";
			}
			C.S.roomK = { k, k0: k, left: 0, top: head };
			const sn = rs.querySelector(".cy-snaps");
			if (sn) sn.innerHTML = "";
			return true;
		}
		function fitFull(r, inn, vw, vh, mob, R) {
			const rs = r.querySelector(".cy-rs"),
				sz = r.querySelector(".cy-rsz");
			const bg =
				(C.S.L.rooms &&
					C.S.L.rooms[C.S.panelId] &&
					C.S.L.rooms[C.S.panelId].artBg) ||
				(
					r.querySelector('.cy-rbg rect[width="1920"]') || {
						getAttribute: () => "",
					}
				).getAttribute("fill") ||
				"#15122e";
			r.classList.add("cy-fit");
			r.style.setProperty(
				"--cy-fitbg",
				/^#[\da-f]{3,8}$/i.test(bg) ? bg : "#15122e",
			);
			const head = roomHead(r),
				avail = Math.max(120, vh - head),
				zr = C.S.roomZ || 1;
			const port = mob && vh > vw;
			stripsOff(r);
			const say = r.querySelector(".cy-rsay2"),
				sayH =
					say && !say.classList.contains("off")
						? say.getBoundingClientRect().height + 16
						: 0;
			const SP = !!(C.X.hero() && C.X.hero().sp);
			document.documentElement.classList.toggle("sp-on", SP);
			if (
				SP &&
				port &&
				zr === 1 &&
				(portShop(r, inn, vw, head, sayH) || stripsOn(r, inn, vw, head, sayH))
			)
				return;
			if (rs) {
				rs.style.overflowX = "";
				rs.style.overflowY = "";
			}
			let k,
				cols = [];
			if (port) {
				k = Math.max(avail / 1080, vw / 1920);
				cols = roomCols(C.S.panelId);
				const cw = cols.length ? Math.max(...cols.map((c) => c[1] - c[0])) : 0;
				if (cw && cw * k > vw - 12) k = Math.max(vw / 1920, (vw - 12) / cw);
			} else if (mob && SP) k = vw / 1920;
			else k = Math.min(vw / 1920, avail / 1080);
			const k0 = k;
			k *= zr;
			const w = 1920 * k,
				h = 1080 * k;
			const left = w < vw ? (vw - w) / 2 : 0,
				top = head + Math.max(0, (avail - h) / 2);
			const pan =
				w > vw + 1 || top + h + (SP && mob && !port ? sayH : 0) > vh + 1;
			if (rs) {
				rs.classList.toggle("cy-pan", pan);
				rs.classList.toggle("cy-snap", port && zr === 1 && cols.length > 1);
			}
			if (sz) {
				sz.style.width = (pan ? Math.ceil(Math.max(vw, left + w)) : 0) + "px";
				sz.style.height =
					(pan
						? Math.ceil(Math.max(vh, top + h + (SP && mob && !port ? sayH : 0)))
						: 0) + "px";
			}
			inn.style.transform = `translate(${left.toFixed(1)}px, ${top.toFixed(1)}px) scale(${k.toFixed(4)})`;
			C.S.roomK = { k, k0, left, top };

			if (rs) {
				let sn = rs.querySelector(".cy-snaps");
				if (!sn) {
					sn = document.createElement("div");
					sn.className = "cy-snaps";
					sn.setAttribute("aria-hidden", "true");
					rs.appendChild(sn);
				}
				sn.innerHTML =
					port && zr === 1
						? cols
								.map(
									([a, b]) =>
										`<i style="left:${Math.round(left + a * k)}px;width:${Math.round((b - a) * k)}px"></i>`,
								)
								.join("")
						: "";
			}
			if (rs && C.S.roomScroll == null) {
				C.S.roomScroll = 1;
				rs.scrollLeft =
					port && cols.length
						? Math.max(
								0,
								Math.round(
									cols[0][0] * k - (vw - (cols[0][1] - cols[0][0]) * k) / 2,
								),
							)
						: 0;
				rs.scrollTop = 0;
			}
		}

		function roomZoom(z, cx, cy) {
			const rs = C.S.room.querySelector(".cy-rs"),
				K = C.S.roomK;
			if (!rs || !K) return;
			z = Math.max(1, Math.min(3, z));
			if (Math.abs(z - (C.S.roomZ || 1)) < 0.005) return;
			const rr = rs.getBoundingClientRect(),
				mx = cx - rr.left,
				my = cy - rr.top;
			const sx = (rs.scrollLeft + mx - K.left) / K.k,
				sy = (rs.scrollTop + my - K.top) / K.k;
			C.S.roomZ = z;
			C.S.roomUser = true;
			fitRoom();
			const N = C.S.roomK;
			rs.scrollLeft = Math.round(sx * N.k + N.left - mx);
			rs.scrollTop = Math.round(sy * N.k + N.top - my);
		}
		function roomPinch(rs) {
			let P = null;
			const dist = (t) =>
				Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
			rs.addEventListener(
				"touchstart",
				(e) => {
					if (e.touches.length === 2)
						P = { d: dist(e.touches), z: C.S.roomZ || 1 };
				},
				{ passive: true },
			);
			rs.addEventListener(
				"touchmove",
				(e) => {
					if (!P || e.touches.length !== 2 || !C.S) return;
					e.preventDefault();
					roomZoom(
						(P.z * dist(e.touches)) / P.d,
						(e.touches[0].clientX + e.touches[1].clientX) / 2,
						(e.touches[0].clientY + e.touches[1].clientY) / 2,
					);
				},
				{ passive: false },
			);
			rs.addEventListener(
				"touchend",
				(e) => {
					if (e.touches.length < 2) P = null;
				},
				{ passive: true },
			);

			rs.addEventListener(
				"wheel",
				(e) => {
					if (
						!C.S ||
						!FULL[C.S.panelId] ||
						!C.S.roomK ||
						e.shiftKey ||
						(!(e.ctrlKey || e.metaKey) &&
							Math.abs(e.deltaX) > Math.abs(e.deltaY))
					)
						return;
					e.preventDefault();
					const dy =
						e.deltaY * (e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? 400 : 1);
					roomZoom(
						(C.S.roomZ || 1) *
							Math.exp(
								-Math.max(-120, Math.min(120, dy)) *
									(e.ctrlKey || e.metaKey ? 0.01 : 0.0018),
							),
						e.clientX,
						e.clientY,
					);
				},
				{ passive: false },
			);
		}
		window.addEventListener("resize", () => fitRoom());

		document.addEventListener("scroll", () => popPlace(), {
			capture: true,
			passive: true,
		});

		const TH = {
			k: (h) => (window.LGThief ? window.LGThief.k(h) : 1),
			price: (h, b) => (window.LGThief ? window.LGThief.price(h, b) : b),
			note: (h) => (window.LGThief ? window.LGThief.note(h) : ""),
			arm: (b, h, base) =>
				window.LGThief ? window.LGThief.arm(b, h, base) : true,
		};

		const WEARS = ["weapon", "armor", "shield", "helmet", "trinket"];

		const stockOf = (id) => {
			if (!STOCK) return null;
			if (id === "magic") return STOCK.magic || null;
			if (id === "forge")
				return (msOn() && STOCK.forgeM) || STOCK.forge || null;
			if (id === "tent") return (msOn() && STOCK.tentM) || STOCK.tent || null;
			if (id === "shop") return STOCK.rows || null;
			return null;
		};
		const goodsOf = (id, st) =>
			!st
				? []
				: id === "tent"
					? st.amulets || []
					: id === "shop"
						? [...(st.potions || []), ...(st.food || [])]
						: [
								...(st.shelf1 || []),
								...(st.shelf2 || []),
								...(st.case || []),
								...(st.mats || []),
							];

		const coinsFor = (it, h) => {
			const b = it.mat ? 0 : +it.coins || 0;
			return b > 0 ? Math.round(TH.price(h, b) * foreignK()) : 0;
		};
		const topIds = () => {
			const o = new Set();
			for (const k of ["forge", "forgeM", "magic"])
				for (const x of (STOCK && STOCK[k] && STOCK[k].stands) || [])
					for (const it of x.top || []) o.add(it.id);
			return o;
		};
		const lockedHere = (it) =>
			foreignK() > 1 &&
			!homeHere() &&
			!!it &&
			(!!it.mat ||
				["epic", "legendary"].includes(it.rarity) ||
				topIds().has(it.id));
		const LOCK_T = "Откроется после захвата";
		const plainMoney = (n) => {
			const d = document.createElement("div");
			d.innerHTML = C.X.money(n);
			return d.textContent.replace(/\s+/g, " ").trim();
		};
		const shortMoney = (n) => {
			n = Math.max(0, Math.floor(+n || 0));
			const g = Math.floor(n / 10000),
				s2 = Math.floor(n / 100) % 100,
				b = n % 100;
			return [g && g + "з", s2 && s2 + "с", (b || (!g && !s2)) && b + "м"]
				.filter(Boolean)
				.join(" ");
		};

		function shopView(id, st) {
			if (!st || !csOn()) return st;
			const h = C.X.hero(),
				conv = (it) => {
					if (it && it.mat) return { ...it, priceText: "Не продаётся" };
					if (lockedHere(it)) return { ...it, priceText: "🔒" };
					const c = coinsFor(it, h);
					return c ? { ...it, price: c, priceText: shortMoney(c) } : it;
				};

			const lvB =
				inTown() &&
				C.TOWN.meta &&
				C.TOWN.meta.lv3 &&
				window.LGTownGen &&
				window.LGTownGen.goodsOk
					? +((C.TOWN.meta.levels || {})[id] || 1)
					: 0;
			const keep = (it) =>
				!lvB ||
				!it ||
				it.mat ||
				window.LGTownGen.goodsOk(it.id, it.rarity, lvB);
			const L2 = (a) => (a || []).filter(keep).map(conv);
			return {
				...st,
				stands: (st.stands || []).map((x) => ({
					...x,
					top: L2(x.top),
					mid: L2(x.mid),
					case: L2(x.case),
				})),
				shelf1: L2(st.shelf1),
				shelf2: L2(st.shelf2),
				case: L2(st.case),
				mats: L2(st.mats),
				amulets: L2(st.amulets),
			};
		}

		const RAR_RU = window.LGGameData.rarityNames();
		const SLOT_RU = window.LGGameData.slotNames();
		const placeName = (b) =>
			b === "magic"
				? msOn()
					? String(C.X.hero().ms)
					: "магической лавке"
				: b === "tent"
					? "Шатре"
					: b === "shop"
						? "Торговых рядах"
						: "Кузне";
		function cardHtml(it, b, h) {
			const nm = C.X.itemName(it.id) || it.name,
				c = coinsFor(it, h),
				body = C.X.cardTip
					? ""
					: it.desc
						? `<p class="d-desc">${esc(it.desc)}</p>`
						: "";
			const k = TH.k(h);
			const price = lockedHere(it)
				? `<p class="cy-icp pts">🔒 ${LOCK_T}</p>`
				: csOn() && c
					? `<p class="cy-icp">${C.X.money(c)}${k > 1 ? ` <small class="thiefl">для вора ×${String(k).replace(".", ",")}</small>` : ""}${foreignK() > 1 ? ` <small class="thiefl">${homeHere() ? "край" : "чужой округ"} ×${String(foreignK()).replace(".", ",")}</small>` : ""}</p>`
					: `<p class="cy-icp pts">${+it.coins > 0 ? C.X.money(+it.coins) : ""} <small>в ${esc(placeName(b))}, за монеты${it.rank ? `, звание не ниже «${esc(it.rank)}»` : ""}</small></p>`;
			return `<div class="cy-ich"><b data-r="${esc(it.rarity || "common")}">${esc(nm)}</b><small>${RAR_RU[it.rarity] || ""}${SLOT_RU[it.slot] ? " · " + SLOT_RU[it.slot] : ""}</small></div>${body}${price}<p class="cy-ichint">${touchy() ? "Нажми на вещь ещё раз — купить" : "Двойной клик — купить"}</p><button type="button" class="btn primary sm wide cy-icbuy" data-cardbuy>Купить…</button>`;
		}
		const touchy = () =>
			!!((C.S && C.S.touch) || window.LGSiteUi.is("nohover"));

		const goodsHelp = (h) =>
			`<p class="note cy-gh">${csOn() ? "Покупки — за монеты героя, в любое время: двойной клик по товару (на телефоне — нажми дважды) и «Да»." : "Покупки за монеты в «Городе» тебе пока закрыты. Здесь — посмотреть, что даёт вещь (наведи или нажми)."}</p>${csOn() ? TH.note(h) : ""}`;
		let GSEL = null;
		const card = () => {
			let c = C.S.room.querySelector(".cy-icard");
			if (!c) {
				c = document.createElement("div");
				c.className = "cy-icard panel";
				c.setAttribute("role", "tooltip");
				C.S.room.appendChild(c);
			}
			return c;
		};
		function cardShow(el, it, b, pinned) {
			const h = C.X.hero();
			if (C.X.cardTip) {
				try {
					C.X.cardTip(el, tipItem(it), h);
				} catch (e) {}
			}
			if (!pinned && C.X.cardTip) return;
			const c = card();
			c.innerHTML = cardHtml(it, b, h);
			c.classList.add("on");
			c.classList.toggle("pin", !!pinned);
			const cb = c.querySelector("[data-cardbuy]");
			if (cb) cb.onclick = () => buyAsk(it, b, el);
			if (pinned) {
				const x = document.createElement("button");
				x.type = "button";
				x.className = "cy-icx";
				x.setAttribute("aria-label", "Закрыть");
				x.textContent = "×";
				x.onclick = (e) => {
					e.stopPropagation();
					unselect();
				};
				c.appendChild(x);
			}

			const rr = C.S.room.getBoundingClientRect(),
				w = c.offsetWidth;
			c.style.top = "auto";
			c.style.bottom = rr.width <= 720 ? "8px" : "16px";
			c.style.left =
				(rr.width <= 720 ? Math.max(8, (rr.width - w) / 2) : 16) + "px";
		}
		const cardHide = () => {
			const c = C.S && C.S.room && C.S.room.querySelector(".cy-icard");
			if (c && !c.classList.contains("pin")) c.classList.remove("on");
		};
		const cardDrop = () => {
			if (C.X && C.X.tipHide) C.X.tipHide();
			const c = C.S && C.S.room && C.S.room.querySelector(".cy-icard");
			if (c) c.classList.remove("on", "pin");
		};
		const tipItem = (it) => ({
			...it,
			name: C.X.itemName(it.id) || it.name,
			stats: it.stats || {},
			wearable: WEARS.includes(it.slot),
			on: false,
			uids: [],
		});
		const findGood = (b, id) =>
			goodsOf(b, stockOf(b)).find((x) => x.id === id) || null;

		function bindGood(el, b, id) {
			el.addEventListener("pointerenter", (e) => {
				if (
					e.pointerType !== "mouse" ||
					!C.S ||
					C.S.panelId == null ||
					buyOpen() ||
					(GSEL && GSEL.id === id)
				)
					return;
				const it = findGood(b, id);
				if (!it) return;
				if (C.X.cardTip) C.X.cardTip(el, tipItem(it), C.X.hero());
				else cardShow(el, it, b, false);
			});
			el.addEventListener("pointerleave", (e) => {
				if (e.pointerType !== "mouse") return;
				if (C.X.tipHide) C.X.tipHide();
				if (!(GSEL && GSEL.id === id)) cardHide();
			});

			el.addEventListener("contextmenu", (e) => {
				if (!popOn(b)) return;
				e.preventDefault();
				popPick(el, b, id, false);
			});
			el.addEventListener("click", (e) => {
				if (popOn(b)) {
					popPick(el, b, id, e.detail === 0);
					return;
				}
				const it = findGood(b, id);
				if (!it) return;
				if (C.X.tipHide) C.X.tipHide();
				if (GSEL && GSEL.id === id && GSEL.b === b) {
					buyAsk(it, b, el);
					return;
				}
				GSEL = { b, id };
				C.S.room
					.querySelectorAll(".cy-hot.on, .cy-good.on")
					.forEach((x) => x.classList.remove("on"));
				el.classList.add("on");
				cardShow(el, it, b, true);
			});
			el.addEventListener("dblclick", (e) => {
				e.preventDefault();
				const it = findGood(b, id);
				if (it && !buyOpen()) buyAsk(it, b, el);
			});
		}

		const popOn = (b) =>
			(b === "forge" || b === "magic") && !!(C.X.hero() && C.X.hero().bp);

		let POP = null;
		function popClose() {
			if (POP && POP.q) POP.q.remove();
			POP = null;
		}
		function popHtml(it, h) {
			const nm = C.X.itemName(it.id) || it.name,
				c = coinsFor(it, h);
			let price = "",
				st = "";
			if (lockedHere(it)) price = `🔒 ${LOCK_T}`;
			else if (it.mat) price = "Не продаётся";
			else if (csOn() && c > 0) {
				price = C.X.money(c);
				if (h && !h.ghost) {
					const have = +h.money || 0;
					st =
						have >= c
							? '<p class="cy-bps ok">Монет хватает</p>'
							: `<p class="cy-bps no">Не хватает: ${C.X.money(c - have)}</p>`;
				}
			} else price = +it.coins > 0 ? C.X.money(+it.coins) : "Пока не продаётся";
			return `<b class="cy-bpn" data-r="${esc(it.rarity || "common")}">${esc(nm)}</b><p class="cy-bpp">${price}</p>${st}<button type="button" class="btn primary sm cy-bpb" data-popbuy>Купить?</button><i class="cy-bpa" aria-hidden="true"></i>`;
		}

		function popPlace() {
			if (!POP || !C.S || !C.S.room) return;
			const { q, el } = POP,
				rr = C.S.room.getBoundingClientRect(),
				r = el.getBoundingClientRect();
			if (
				!el.isConnected ||
				!(r.width > 0) ||
				r.bottom < rr.top + 40 ||
				r.top > rr.bottom - 20 ||
				r.right < rr.left + 10 ||
				r.left > rr.right - 10
			) {
				popClose();
				return;
			}
			const w = q.offsetWidth,
				hh = q.offsetHeight,
				m = 10,
				top0 = Math.max(8, roomHead(C.S.room) - 4);
			const cx =
				(Math.max(r.left, rr.left) + Math.min(r.right, rr.right)) / 2 - rr.left;
			let y = r.top - rr.top - hh - m,
				up = true;
			if (y < top0) {
				y = r.bottom - rr.top + m;
				up = false;
			}

			if (!up && y + hh > rr.height - 8) {
				y = Math.max(top0, Math.min(rr.height - hh - 8, r.top - rr.top + 8));
				up = null;
			}
			const x = Math.max(8, Math.min(rr.width - w - 8, cx - w / 2));
			q.classList.toggle("up", up === true);
			q.classList.toggle("dn", up === false);
			q.style.setProperty(
				"--ax",
				Math.round(Math.max(16, Math.min(w - 16, cx - x))) + "px",
			);
			q.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
		}
		function popPick(el, b, id, kb) {
			const it = findGood(b, id);
			if (!it || buyOpen()) return;
			const h = C.X.hero();
			GSEL = { b, id };
			C.S.room
				.querySelectorAll(".cy-hot.on, .cy-good.on")
				.forEach((x) => x.classList.remove("on"));
			el.classList.add("on");
			cardDrop();
			if (!POP || POP.el !== el) {
				popClose();
				const q = document.createElement("div");
				q.className = "cy-bpop";
				q.setAttribute("role", "dialog");
				q.setAttribute("aria-label", "Купить?");
				q.innerHTML = popHtml(it, h);
				C.S.room.appendChild(q);
				POP = { q, el, b, id };
				q.querySelector("[data-popbuy]").onclick = () => {
					const g = findGood(b, id);
					if (g) buyAsk(g, b, el);
				};
			}
			popPlace();
			void POP.q.offsetWidth;
			POP.q.classList.add("on");

			if (C.X.cardTip) {
				try {
					C.X.cardTip(el, tipItem(it), h);
				} catch (e) {}
			}
			if (kb) {
				try {
					POP.q.querySelector("[data-popbuy]").focus();
				} catch (e) {}
			}
		}

		document.addEventListener("keydown", (e) => {
			if (e.key !== "Escape" || !POP || buyOpen()) return;
			const el = POP.el;
			unselect();
			try {
				el.focus();
			} catch (x) {}
		});

		function goodsHots(id) {
			GSEL = null;
			cardDrop();
			buyClose();
			popClose();
			stripsOff(C.S.room);
			const inn = C.S.room.querySelector(".cy-rin");
			if (!inn) return;
			inn.querySelectorAll(".cy-hots").forEach((x) => x.remove());
			requestAnimationFrame(() => {
				if (C.S && C.S.panelId === id) fitRoom();
			});
			if (!(id === "forge" || id === "magic" || id === "tent" || id === "shop"))
				return;
			const st = stockOf(id),
				h = C.X.hero();
			if (id === "shop" && FULL.shop) {
				shopTiles(inn, st, h);
				return;
			}
			const pos = C.S.itemPos || {},
				list = goodsOf(id, st).filter((it) => pos[it.id]);
			if (id === "tent" && FULL.tent) tentHots(inn, st, pos);
			if (!list.length) return;
			const box = document.createElement("div");
			box.className = "cy-hots";
			box.innerHTML = list
				.map((it) => {
					const p = pos[it.id],
						c = coinsFor(it, h);
					return `<button type="button" class="cy-hot${lockedHere(it) ? " lock" : ""}" data-good="${esc(it.id)}" style="left:${Math.round(p.x - 64)}px;top:${Math.round(p.y - 92)}px" aria-label="${esc(C.X.itemName(it.id) || it.name)} — ${csOn() && c ? esc(plainMoney(c)) : "купить на стриме"}"></button>`;
				})
				.join("");
			inn.appendChild(box);
			box
				.querySelectorAll("[data-good]")
				.forEach((el) => bindGood(el, id, el.dataset.good));
			olHots(box);
		}

		const dIt = (id) => String(id).replace(/[^\w:.-]/g, "_");
		function olHots(box) {
			const svg = C.S && C.S.room && C.S.room.querySelector(".cy-rbg");
			if (!svg || !box.isConnected) return;
			const k = () => {
				const r = svg.getBoundingClientRect();
				return r.width > 0 ? r.width / 1920 : 0;
			};
			const olR = () => {
				const kk = k();
				if (!kk) return;
				const r = Math.min(9, Math.max(3, 2.6 / kk));
				svg
					.querySelectorAll("#cy-itol .cy-olm, #cy-itol2 .cy-olm")
					.forEach((m, i) =>
						m.setAttribute("radius", (i ? r * 1.35 : r).toFixed(1)),
					);
			};

			const place = () => {
				const kk = k(),
					sr = svg.getBoundingClientRect();
				if (!kk) return;
				box.querySelectorAll(".cy-hot.ol").forEach((el) => {
					const r = el._ol.getBoundingClientRect();
					if (!(r.width > 0 && r.height > 0)) return;
					const d =
							el._z ||
							(el._z = [
								el.offsetLeft,
								el.offsetTop,
								el.offsetLeft + el.offsetWidth,
								el.offsetTop + el.offsetHeight,
							]),
						p = 8;
					let L = Math.max(d[0], (r.left - sr.left) / kk - p),
						T = Math.max(d[1], (r.top - sr.top) / kk - p),
						R = Math.min(d[2], (r.right - sr.left) / kk + p),
						B = Math.min(d[3], (r.bottom - sr.top) / kk + p);
					if (R - L < 24 || B - T < 24) return;
					const mw = Math.min(56, d[2] - d[0]),
						mh = Math.min(56, d[3] - d[1]);
					if (R - L < mw) {
						const c = (L + R) / 2;
						L = c - mw / 2;
						R = c + mw / 2;
					}
					if (B - T < mh) {
						const c = (T + B) / 2;
						T = c - mh / 2;
						B = c + mh / 2;
					}
					Object.assign(el.style, {
						left: Math.round(L) + "px",
						top: Math.round(T) + "px",
						width: Math.round(R - L) + "px",
						height: Math.round(B - T) + "px",
					});
				});
			};
			box.querySelectorAll("[data-good], [data-smp]").forEach((el) => {
				const g = svg.querySelector(
						`[data-it="${dIt(el.dataset.good || el.dataset.smp).replace(/["\\]/g, "")}"]`,
					),
					a = g && g.querySelector(":scope > [data-ia]");
				if (!a) return;
				el._ol = a;
				el.classList.add("ol");
				const hl = (on) => {
					if (on) olR();
					g.classList.toggle("cy-olh", on);
				};
				el.addEventListener("pointerenter", () => hl(true));
				el.addEventListener("pointerleave", () => hl(false));
				el.addEventListener("focus", () => hl(true));
				el.addEventListener("blur", () => hl(false));
			});

			const sync = () =>
				box.querySelectorAll(".cy-hot.ol").forEach((el) => {
					const g = el._ol.parentNode,
						on = el.classList.contains("on");
					if (on) olR();
					if (g.classList.contains("cy-olo") !== on)
						g.classList.toggle("cy-olo", on);
				});
			new MutationObserver(sync).observe(box, {
				subtree: true,
				attributes: true,
				attributeFilter: ["class"],
			});
			place();
			olR();
			if (!k())
				requestAnimationFrame(() => {
					place();
					olR();
				});
		}

		function cardPlace(c, el) {
			const rr = C.S.room.getBoundingClientRect(),
				r = el.getBoundingClientRect(),
				w = c.offsetWidth,
				hh = c.offsetHeight;
			if (rr.width <= 720) {
				c.style.left = Math.max(8, (rr.width - w) / 2) + "px";
				c.style.top = "auto";
				c.style.bottom = "8px";
				return;
			}
			c.style.bottom = "";
			let x = r.right - rr.left + 10;
			if (x + w > rr.width - 8) x = r.left - rr.left - w - 10;
			c.style.left = Math.max(8, x) + "px";
			c.style.top =
				Math.max(
					64,
					Math.min(rr.height - hh - 8, r.top - rr.top + r.height / 2 - hh / 2),
				) + "px";
		}
		const buyOpen = () =>
			!!(C.S && C.S.room && C.S.room.querySelector(".cy-buyq"));
		function buyClose() {
			const q = C.S && C.S.room && C.S.room.querySelector(".cy-buyq");
			if (q) q.remove();
		}

		document.addEventListener(
			"pointerdown",
			(e) => {
				if (!GSEL || !C.S || !C.S.room || C.S.room.hidden) return;
				if (
					e.target.closest &&
					e.target.closest(".cy-icard, .cy-hot, .cy-good, .cy-buyq, .cy-bpop")
				)
					return;
				unselect();
			},
			{ capture: true, passive: true },
		);
		function unselect() {
			buyClose();
			popClose();
			cardDrop();
			GSEL = null;
			if (C.S && C.S.room)
				C.S.room
					.querySelectorAll(".cy-hot.on, .cy-good.on")
					.forEach((x) => x.classList.remove("on"));
		}

		function buyAsk(it, b, from) {
			buyClose();
			popClose();
			const h = C.X.hero(),
				nm = C.X.itemName(it.id) || it.name;
			if (lockedHere(it)) {
				const q = document.createElement("div");
				q.className = "cy-buyq";
				q.setAttribute("role", "dialog");
				q.setAttribute("aria-modal", "true");
				q.setAttribute("aria-label", "Покупка");
				q.innerHTML = `<div class="cy-buyb panel"><p class="lead">🔒 «${esc(nm)}» — ${LOCK_T.toLowerCase()}</p><p class="note">Этот округ не принадлежит каналу: лучшие вещи торговец бережёт для своих. Захватите округ на стриме — откроется всё и по обычной цене.</p><div class="cy-buyr"><button type="button" class="btn primary" data-no>Понятно</button></div></div>`;
				C.S.room.appendChild(q);
				const no = q.querySelector("[data-no]");
				no.onclick = () => {
					unselect();
					try {
						from && from.focus();
					} catch {}
				};
				q.addEventListener("click", (e) => {
					if (e.target === q) unselect();
				});
				try {
					no.focus();
				} catch {}
				return;
			}

			if (it.mat) {
				const q = document.createElement("div");
				q.className = "cy-buyq";
				q.setAttribute("role", "dialog");
				q.setAttribute("aria-modal", "true");
				q.setAttribute("aria-label", "Покупка");
				q.innerHTML = `<div class="cy-buyb panel"><p class="lead">«${esc(nm)}» - не продаётся</p><p class="note">Звёзды и сферы находят в походе, у боссов, в Шахте, на рыбалке и за ежедневные задания.</p><div class="cy-buyr"><button type="button" class="btn primary" data-no>Понятно</button></div></div>`;
				C.S.room.appendChild(q);
				const no = q.querySelector("[data-no]");
				no.onclick = () => {
					unselect();
					try {
						from && from.focus();
					} catch {}
				};
				q.addEventListener("click", (e) => {
					if (e.target === q) unselect();
				});
				try {
					no.focus();
				} catch {}
				return;
			}
			const c = coinsFor(it, h);
			const can = !!h && csOn() && c > 0;

			const qmax =
				!it.mat &&
				h &&
				+h.bq > 1 &&
				c > 0 &&
				(b === "shop" || it.slot === "food" || it.slot === "potion")
					? Math.max(1, Math.min(+h.bq, Math.floor((+h.money || 0) / c)))
					: 1;
			let qn = 1;
			const q = document.createElement("div");
			q.className = "cy-buyq";
			q.setAttribute("role", "dialog");
			q.setAttribute("aria-modal", "true");
			q.setAttribute("aria-label", "Покупка");

			const poor = !!h && !h.ghost && (+h.money || 0) < c;
			const why = !h
				? "Героя пока нет."
				: h.ghost
					? "Призраку не продают."
					: poor
						? "Не хватает монет"
						: "";
			q.innerHTML = `<div class="cy-buyb panel">${
				can
					? `<p class="lead">Купить «${esc(nm)}» за <span data-qt>${C.X.money(c)}</span>?</p>${qmax > 1 ? `<div class="cy-qty" role="group" aria-label="Сколько штук"><button type="button" class="btn ghost" data-q="-1" aria-label="Меньше">−</button><b data-qn aria-live="polite">1</b><button type="button" class="btn ghost" data-q="1" aria-label="Больше">+</button><small>шт., до ${qmax}</small></div>` : ""}${TH.k(h) > 1 ? `<p class="note thiefl">Для тебя за воровство цена ×${String(TH.k(h)).replace(".", ",")}.</p>` : ""}${why && !poor ? `<p class="note cy-warn">${why}</p>` : h && C.X.bal ? C.X.bal(c, h.money, "cy-lack") : poor ? `<p class="note cy-warn">${why}</p>` : ""}<div class="cy-buyr"><button type="button" class="btn primary" data-yes${why ? " disabled" : ""}>Да</button><button type="button" class="btn ghost" data-no>Нет</button></div>`
					: `<p class="lead">«${esc(nm)}» — сейчас не купить</p><p class="note">Покупки в «Городе» тебе пока закрыты.</p><div class="cy-buyr"><button type="button" class="btn primary" data-no>Понятно</button></div>`
			}</div>`;
			C.S.room.appendChild(q);
			const no = q.querySelector("[data-no]"),
				yes = q.querySelector("[data-yes]");
			q.querySelectorAll("[data-q]").forEach(
				(bt) =>
					(bt.onclick = () => {
						qn = Math.max(1, Math.min(qmax, qn + +bt.dataset.q));
						q.querySelector("[data-qn]").textContent = String(qn);
						q.querySelector("[data-qt]").innerHTML = C.X.money(c * qn);
					}),
			);
			q.addEventListener("click", (e) => {
				if (e.target === q) unselect();
			});
			q.addEventListener("keydown", (e) => {
				if (e.key === "Escape") {
					e.stopPropagation();
					unselect();
					try {
						from && from.focus();
					} catch {}
				}
			});
			no.onclick = () => {
				unselect();
				try {
					from && from.focus();
				} catch {}
			};
			if (yes)
				yes.onclick = () => {
					buyClose();
					cardDrop();
					GSEL = null;
					const btn =
						from && from.classList && from.classList.contains("btn")
							? from
							: null;
					C.X.act(
						"/api/cityBuy",
						{
							item: it.id,
							price: c,
							...(qn > 1 ? { n: qn } : {}),
							...(inTown() ? { town: C.TOWN.id } : {}),
						},
						`Куплено: «${nm}»${qn > 1 ? ` ×${qn}` : ""} — сейчас будет в сумке`,
						btn,
					);
				};
			try {
				(yes || no).focus();
			} catch {}
		}

		function shopBar(h, extra) {
			if (!h)
				return `<div class="cy-bar2"><span class="cy-bnote">Героя пока нет — он появится, когда ты напишешь в чат на стриме.</span></div>`;
			const G = h.sg,
				n = (h.items || []).filter((x) => !x.on).length,
				k = TH.k(h);
			const bag = G ? `${G.used} / ${G.cap}` : String(n),
				full = !!(G && G.used >= G.cap);
			return `<div class="cy-bar2"><span class="cy-wal" title="Кошелёк героя">у тебя ${C.X.money(+h.money || 0)}</span><span class="cy-bagc${full ? " full" : ""}" title="${full ? "Сумка полна — разгрузи на склад" : "Сумка"}">🎒 Сумка ${bag}</span>${k > 1 ? `<span class="cy-thk thiefl" title="Тебя ловили на краже — торговцы продают дороже">для тебя цены ×${String(k).replace(".", ",")}</span>` : ""}${foreignK() > 1 ? (homeHere() ? `<span class="cy-thk thiefl" title="Край отряда: пока не побеждён босс округа, торговцы продают дороже (продажа - как обычно)">край: цены ×${String(foreignK()).replace(".", ",")} до победы над боссом округа</span>` : `<span class="cy-thk thiefl" title="Округ не принадлежит каналу: лучшие вещи закрыты, остальное дороже">чужой округ: цены ×${String(foreignK()).replace(".", ",")}, лучшее — после захвата</span>`) : ""}${extra || ""}</div>`;
		}

		return {
			FULL,
			loadStock,
			stockOf,
			goodsOf,
			coinsFor,
			lockedHere,
			plainMoney,
			shortMoney,
			shopView,
			TH,
			get STOCK() {
				return STOCK;
			},

			get GSEL() {
				return GSEL;
			},
			set GSEL(v) {
				GSEL = v;
			},

			roomSvg,
			doodSize,
			fitRoom,
			roomPinch,

			goodsHots,
			bindGood,
			olHots,
			card,
			cardShow,
			cardHide,
			cardDrop,
			cardPlace,
			touchy,
			goodsHelp,
			buyAsk,
			buyOpen,
			buyClose,
			unselect,
			shopBar,
		};
	};
})();
