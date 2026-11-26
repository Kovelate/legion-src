(() => {
	const M = window.LGCityMap,
		ART = window.LGCityArt;

	const SP = () => {
		const C =
			S && S.cats
				? S.kit
					? window.LGTownKitCity
					: window.LGFairCatsCity
				: null;
		return (C && +C.SPEED) || M.SPEED;
	};
	if (!M || !ART) return;

	const CITY_B = ["forge", "tent", "shop", "magic", "hall", "board", "trainer"];
	if (
		!window.LGCityShop ||
		!CITY_B.every(
			(id) => typeof (window.LGCityBuildings || {})[id] === "function",
		)
	) {
		console.warn("[город] нет файлов окон зданий (модуль «Город»)");
		return;
	}
	const TOP = 170;

	let FC_OFF = false;
	const fcWant = () =>
		!FC_OFF && !!(X && X.fcOn && X.fcOn()) && TOWN.id === "fair" && !TOWN.L;
	const topY = () => (WD && WD.cats ? 0 : TOP);
	const IDS = {
		anvil: 1,
		forge: 1,
		tent: 1,
		shop: 1,
		trainer: 1,
		board: 1,
		hall: 1,
		auction: 1,
		gate: 1,
		storage: 1,
		magic: 1,
		mine: 1,
		mineboard: 1,
	};
	IDS.guild = 1;
	IDS.hwshop = 1;
	IDS.hwpass = 1;
	let X = null;

	let TOWN = { id: "fair", L: null, acc: null, meta: null };
	let WD = M;
	let TLIST = null;

	const townLs = () =>
		"lgCityTown@" +
		((/\/c\/([\w]+)/.exec(location.pathname) || [])[1] || "-").toLowerCase();

	const townGet = () => {
		try {
			return (
				sessionStorage.getItem(townLs()) ||
				localStorage.getItem(townLs()) ||
				"fair"
			);
		} catch {
			return "fair";
		}
	};
	const townSet = (id) => {
		try {
			if (id && id !== "fair") sessionStorage.setItem(townLs(), id);
			else sessionStorage.removeItem(townLs());
		} catch {}
		try {
			if (id && id !== "fair") localStorage.setItem(townLs(), id);
			else localStorage.removeItem(townLs());
		} catch {}
	};
	const inTown = () => !!TOWN.L;

	const CAMP = "camp";
	const isCamp = () => TOWN.id === CAMP && !!TOWN.L;

	const cpOn = () =>
		!!(X && X.hero() && (X.hero().cp || (X.hero().hm && X.hero().hm.camp))) &&
		!homeAway();
	const campName = () => {
		try {
			const n = (D().names || {})[X.style()] || {},
				c = n.places && n.places.camp;
			return {
				name: (c && c.name) || "Перепутье",
				sub: (c && c.sub) || "лагерь новобранцев Легиона",
			};
		} catch {
			return { name: "Перепутье", sub: "лагерь новобранцев Легиона" };
		}
	};
	const foreignK = () =>
		inTown() && TOWN.acc && (!TOWN.acc.own || TOWN.acc.home)
			? Math.max(1, +TOWN.acc.k || (TOWN.acc.home ? 1 : 1.5))
			: 1;

	const homeOf = () => (X && X.hero() && X.hero().hm) || null;
	function homePick(hm) {
		if (!hm || !hm.id || hm.none) return null;
		return { id: String(hm.id) };
	}
	const homeHere = () => inTown() && !!(TOWN.acc && TOWN.acc.home);

	const homeAway = () => {
		const hm = homeOf();
		return !!(hm && hm.id && !hm.none && hm.id !== "fair" && hm.id !== CAMP);
	};

	const homeBack = () => {
		const hm = homeOf();
		if (!hm || hm.none || !hm.id) return null;
		if (hm.id === CAMP || hm.camp) return cpOn() ? CAMP : null;
		return String(hm.id);
	};
	const NO_CITY =
		"У канала пока нет своего города - он появится, когда канал займёт округ с городом (после «Жребия края» - город края).";
	let S = null;

	const RM = window.LGSiteUi.media("reduced");
	const reduce = () => !!(RM && RM.matches);
	const esc = window.LGSiteUi.esc;
	const D = () => window.MDDoodle;

	const npcAs = (md, fn) => {
		const d = D();
		if (!d || !md) return fn();
		const was = d.npcGh;
		d.npcGh = md;
		try {
			return fn();
		} finally {
			d.npcGh = was;
		}
	};

	const hwDead = () => {
		try {
			if (isCamp()) return false;
			const c = hwNow();
			return !!(c && c.look);
		} catch {
			return false;
		}
	};
	const ghostSvg = (svg) =>
		String(svg).replace(
			/(<svg class="jl-doodle jd-ghost"[^>]*?) style="[^"]*"/,
			"$1",
		);
	const scopeIds = (svg, p) =>
		svg
			.replace(/id="([^"]+)"/g, `id="${p}$1"`)
			.replace(/url\(#([^)]+)\)/g, `url(#${p}$1)`)
			.replace(/href="#([^"]+)"/g, `href="#${p}$1"`);

	const auOpen = () => !!(X && X.hero() && X.hero().au);

	const stOpen = () => !!(X && X.hero() && X.hero().sg);

	const ghOn = () => {
		const G = window.LGGuildHall;
		try {
			return G && G.on ? G.on() : false;
		} catch {
			return false;
		}
	};
	const soonB = (b) =>
		b.id === "guild"
			? ghOn() === false
			: !!b.soon &&
				!(
					(b.id === "auction" && auOpen()) ||
					(b.id === "storage" && stOpen()) ||
					(b.id === "mine" && mnOn())
				);

	const msOn = () => !!(X && X.hero() && X.hero().ms);
	const csOn = () => !!(X && X.hero() && X.hero().cs);
	const mnOn = () =>
		!!(X && X.hero() && X.hero().mn && Object.keys(X.hero().mn).length);

	const tvOn = () => {
		const T = window.LGTavern;
		try {
			return !!(T && T.on && T.on() === true);
		} catch (e) {
			console.warn("[город] таверна", e);
			return false;
		}
	};
	const bOk = (b) =>
		(!b.magic || msOn()) && (!b.mine || mnOn()) && (!b.tavern || tvOn());

	let hnJs = null;
	const hnLv = () => {
		const h = X && X.hero();
		return h && h.hw ? Math.max(0, Math.min(20, +h.hw.p || 0)) : 0;
	};

	const hnSeen = () => {
		try {
			return sessionStorage.getItem("lgHwNpcIn") === "1";
		} catch (e) {
			return !!(S && S.hnPlayed);
		}
	};
	const hnMark = () => {
		if (S) S.hnPlayed = true;
		try {
			sessionStorage.setItem("lgHwNpcIn", "1");
		} catch (e) {}
	};
	const hnView = () => ({
		x0: S.camX,
		y0: S.camY,
		x1: S.camX + viewW(),
		y1: S.camY + viewH(),
	});
	function hnEntStop() {
		if (S && S.hnEnt) {
			const e = S.hnEnt;
			S.hnEnt = null;
			e.stop();
		}
	}

	function hnNear() {
		const N = window.LGHwNpc,
			L = window.LGCityHW;
		if (!N || !N.inView || !L) return false;
		const v = hnView();
		return L.npcSpots({ fair: true }).some((sp) => N.inView(sp, v, 140));
	}
	function hwNpc(on, wave) {
		if (!S || !S.gl || !S.mk) return;
		S.hnOn = on = !!on && !inTown() && !!window.LGCityHW;
		const N = window.LGHwNpc,
			k = on ? "n" + hnLv() : "";
		if (k === (S.hnK || "")) return;
		if (on && !N) {
			if (!hnJs)
				hnJs = townJs(
					`/site/hwnpc.js?v=${(window.LG_CITYV || {}).hn || ""}`,
				).catch((e) => {
					hnJs = null;
					console.warn("[город] hwnpc.js", e);
				});
			hnJs.then(() => {
				if (S && window.LGHwNpc) hwNpc(S.hnOn, wave);
			});
			return;
		}

		const was = S.hnK || "";
		S.hnK = k;
		S.hnArm = false;
		hnEntStop();
		let ent = false;
		if (on && !was && N.enter && (wave || !hnSeen())) {
			if (hnNear()) ent = true;
			else S.hnArm = true;
		}
		S.gl.dropProps("hwn");
		for (const e of S.el.querySelectorAll(".hwn-live, [data-hwn]")) e.remove();
		let G = [];
		if (on)
			try {
				G = window.LGCityHW.npcSpots({ fair: true })
					.map((sp) => N.geo(sp, { lv: hnLv() }))
					.filter(Boolean);
			} catch (e) {
				console.warn("[город] хэллоуинские НПС", e);
				G = [];
			}
		const B = G.map((g) => g.building),
			props = G.map((g) => ({
				x: g.prop.x,
				y: g.prop.y,
				w: g.prop.w,
				h: g.prop.h,
				z: g.prop.z,
				dx: 0,
				svg: scopeIds(g.prop.svg(), "cyh" + g.building.id + "-"),
			}));
		WD = B.length ? { ...M, BUILDINGS: [...M.BUILDINGS, ...B] } : M;
		S.map = S.mk(B.length ? { hwObst: G.flatMap((g) => g.obst), hwB: B } : {});
		if (S.ol && S.ol.set)
			S.ol.set(
				"hwn",
				props.map((p) => ({ svg: p.svg, dx: 0 })),
			);

		const bar = S.el.querySelector(".cy-bar");
		if (bar)
			for (const b of B)
				bar.insertAdjacentHTML(
					"beforeend",
					`<button type="button" data-b="${b.id}" data-hwn="1"><span aria-hidden="true">${b.icon}</span>${esc(titleOf(b))}</button>`,
				);
		if (G.length && !document.getElementById("hwnLiveCss")) {
			const st = document.createElement("style");
			st.id = "hwnLiveCss";
			st.textContent = N.LIVE_CSS;
			document.head.appendChild(st);
		}

		const host = S.walk || S.cam;
		const show = () => {
			if (!S || S.hnK !== k) return;
			if (props.length) S.gl.addProps(props, "hwn");
			if (host)
				G.forEach((g, gi) =>
					g.live.forEach((l, i) => {
						const d = document.createElement("div");
						d.className = "hwn-live " + l.cls;
						d.setAttribute("aria-hidden", "true");
						d.style.cssText = `left:${l.x}px;top:${l.y}px;width:${l.w}px;height:${l.h}px;z-index:${l.z}`;
						d.innerHTML = scopeIds(l.svg, `cyhl${gi}${i}-`);
						host.appendChild(d);
					}),
				);
			kick();
		};
		if (ent && host && G.length) {
			hnMark();
			const h = N.enter(window.LGCityHW.npcSpots({ fair: true }), {
				host,
				view: hnView(),
				map: S.map,
				lv: hnLv(),
				reduce: reduce(),
				done: () => {
					if (S && S.hnEnt === h) {
						S.hnEnt = null;
						show();
					}
				},
			});
			if (h) {
				S.hnEnt = h;

				for (const t of S.el.querySelectorAll("[data-hwn]"))
					t.animate([{ opacity: 0 }, { opacity: 0 }, { opacity: 1 }], {
						duration: Math.round(h.dur * 1000) + 500,
						fill: "both",
						easing: "linear",
					});
			} else show();
		} else show();

		for (const w of [...S.others.values(), ...(S.me ? [S.me] : [])])
			if (!S.map.free(w.x, w.y)) {
				const [nx, ny] = S.map.nearest(w.x, w.y);
				w.x = nx;
				w.y = ny;
				w.path = null;
				place(w);
			}
		kick();
	}

	async function hwOpen(id) {
		const N = window.LGHwNpc;
		if (!N || !N.open) return;
		const st = await loadStock().catch(() => null);

		N.open(id, {
			hero: () => X.hero(),
			data: (st && st.hw) || null,
			D: window.MDDoodle,
			art: X.art ? (it) => X.art(it) : null,
			tip: X.cardTip ? (el, it) => X.cardTip(el, it, X.hero()) : null,
			tipHide: X.tipHide ? () => X.tipHide() : null,
			login: () => (X.login ? X.login() : ""),
			toast: (t) => X.toast && X.toast(t),
			swap: async (b) => {
				const r = await X.api("/api/hwSwap", b);
				if (!r || !r.ok) {
					if (X.toast) X.toast((r && r.error) || "Обмен не вышел", true);
					throw new Error("swap");
				}
				if (X.toast) X.toast("Обмен принят: монеты придут через пару секунд");
			},

			back: async (b) => {
				const r = await X.api("/api/hwBack", b);
				if (!r || !r.ok) {
					if (X.toast) X.toast((r && r.error) || "Обмен не вышел", true);
					throw new Error("back");
				}
				if (X.toast) X.toast("Обмен принят: конфеты придут через пару секунд");
			},
			buy: async (b) => {
				const r = await X.api("/api/hwBuy", b);
				if (!r || !r.ok) {
					if (X.toast) X.toast((r && r.error) || "Обмен не вышел", true);
					throw new Error((r && r.error) || "buy");
				}
			},

			pick: async (b) => {
				const r = await X.api("/api/hwPick", b);
				if (!r || !r.ok) {
					if (X.toast) X.toast((r && r.error) || "Получить не вышло", true);
					throw new Error((r && r.error) || "pick");
				}
			},
		});
	}
	const titleOf = (b) =>
		b && b.id === "magic" && msOn()
			? String(X.hero().ms)
			: (b && b.title) || "";
	const still = (svg) =>
		String(svg).replace(
			/<(animate|animateTransform|animateMotion|set)\b[^>]*?(\/>|>[\s\S]*?<\/\1>)/g,
			"",
		);

	let GLFAIL = "",
		glWait = false;
	const rmode = () => {
		let m = "";
		try {
			m =
				new URLSearchParams(location.search).get("cityr") ||
				localStorage.getItem("lgCityR") ||
				"";
		} catch {}
		return /^(canvas|webgl)$/.test(m) ? m : "auto";
	};
	const useGL = () => !GLFAIL && !!window.LGCityGL;

	const hideGet = () => {
		try {
			return localStorage.getItem("lgCityHide") === "1";
		} catch {
			return false;
		}
	};

	const capGet = () => {
		try {
			const n = +localStorage.getItem("lgCityCap");
			return [5, 10, 25, 50].includes(n) ? n : 0;
		} catch {
			return 0;
		}
	};
	const capSet = (n) => {
		try {
			if (n) localStorage.setItem("lgCityCap", String(n));
			else localStorage.removeItem("lgCityCap");
		} catch {}
	};

	const frGet = () => {
		try {
			return localStorage.getItem("lgCityFr") === "1";
		} catch {
			return false;
		}
	};
	const frSet = (on) => {
		try {
			if (on) localStorage.setItem("lgCityFr", "1");
			else localStorage.removeItem("lgCityFr");
		} catch {}
	};

	const glGet = () => {
		try {
			return localStorage.getItem("lgCityGl") === "1";
		} catch {
			return false;
		}
	};
	const glSet = (on) => {
		try {
			if (on) localStorage.setItem("lgCityGl", "1");
			else localStorage.removeItem("lgCityGl");
		} catch {}
	};
	const hideSet = (on) => {
		try {
			if (on) localStorage.setItem("lgCityHide", "1");
			else localStorage.removeItem("lgCityHide");
		} catch {}
	};

	const FS_OK = () =>
		!!(
			document.fullscreenEnabled && document.documentElement.requestFullscreen
		);
	const FS_ICO =
		'<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path class="cy-fs-on" d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/><path class="cy-fs-off" d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>';

	const OTH_ICO =
		'<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/><path class="cy-oth-x" d="M3 3l18 18"/></svg>';
	const FR_ICO =
		'<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M3 19c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5"/><circle cx="17" cy="9" r="2.6"/><path d="M16.5 13.6c2.6.2 4.5 2 4.5 4.6"/></svg>';

	const frN = () => {
		const f = window.LGFriends;
		return f && f.n ? f.n() : 0;
	};
	const frHtml = () => {
		if (!window.LGFriends || !window.LGFriends.open) return "";
		const n = frN();
		return `<button type="button" class="cy-fr" title="Друзья" aria-label="${n ? "Друзья, новых заявок: " + n : "Друзья"}">${FR_ICO}<b class="cy-fr-n"${n ? "" : " hidden"}>${n > 99 ? "99+" : n}</b></button>`;
	};
	function frSync() {
		if (!S || !S.el) return;
		let b = S.el.querySelector(".cy-fr");
		if (!b) {
			const h = frHtml(),
				o = S.el.querySelector(".cy-others");
			if (!h || !o) return;
			o.insertAdjacentHTML("beforebegin", h);
			b = S.el.querySelector(".cy-fr");
		}
		const n = frN(),
			c = b.querySelector(".cy-fr-n");
		c.hidden = !n;
		c.textContent = n > 99 ? "99+" : String(n);
		b.setAttribute("aria-label", n ? "Друзья, новых заявок: " + n : "Друзья");
	}

	const FRO_ICO =
		'<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><path class="cy-fro-h" d="M12 15.2l-2.6-2.5a1.6 1.6 0 0 1 2.6-1.9 1.6 1.6 0 0 1 2.6 1.9z" fill="currentColor" stroke-width="1.2"/></svg>';
	const froOk = () =>
		!!(
			X &&
			X.hero() &&
			X.hero().fo &&
			window.LGFriends &&
			window.LGFriends.friends
		);
	const froHtml = () =>
		froOk()
			? `<button type="button" class="cy-fro" aria-pressed="false" aria-label="Скрыть всех, кроме друзей">${FRO_ICO}<span class="cy-tipb" aria-hidden="true"></span></button>`
			: "";
	function froSync() {
		if (!S || !S.el || S.el.querySelector(".cy-fro")) return;
		const h = froHtml(),
			o = S.el.querySelector(".cy-others");
		if (!h || !o) return;
		o.insertAdjacentHTML("afterend", h);
		froBtn();
	}

	window.addEventListener("lgfriends", frSync);
	window.addEventListener("lgfriends", froSync);

	const chatHtml = () =>
		window.LGChat
			? window.LGChat.html({ name: "Чат города", ph: "Написать в чат города…" })
			: "";

	const QL = [
		{
			canvas: [30, 30],
			webgl: [60, 30],
			svg: [30, 20],
			vis: 30,
			lab: 30,
			bob: true,
			res: [null, null],
		},
		{
			canvas: [20, 15],
			webgl: [30, 20],
			svg: [20, 15],
			vis: 20,
			lab: 10,
			bob: false,
			res: [1.25, 2],
		},
		{
			canvas: [15, 12],
			webgl: [20, 15],
			svg: [15, 12],
			vis: 12,
			lab: 5,
			bob: false,
			res: [1, 1.5],
		},
	];
	const qForced = () => {
		try {
			const v = localStorage.getItem("lgCityQ");
			return /^[012]$/.test(v || "") ? +v : null;
		} catch {
			return null;
		}
	};

	const CY_GST = [
		"legion",
		"cats",
		"monkeys",
		"veggies",
		"42brothers",
		"cherts",
		"ugabugi",
	];
	function shellHtml(st, art) {
		return `<div class="cy gw-tok gw-dk" data-st="${esc(st)}" data-gst="${CY_GST.includes(st) ? esc(st) : "legion"}">
      <div class="cy-view" tabindex="0" aria-label="Город: нажми на землю — герой пойдёт туда, на здание — зайдёт внутрь. Стрелки — двигать вид">
        <div class="cy-cam" style="width:${WD.W}px;height:${WD.H}px">
          ${art}
          <div class="cy-ols" aria-hidden="true"></div><div class="cy-hov" aria-hidden="true"><b class="cy-tip"></b></div>
          <div class="cy-tags"></div>
        </div>
        <div class="cy-hud"><span class="cy-on" aria-live="polite"></span><div class="cy-capl"><button type="button" class="cy-cap" aria-haspopup="listbox" aria-expanded="false" title="Кого рисовать на экране (меньше - легче для слабого ПК или телефона)"><span class="cy-capk">Показывать:</span><b class="cy-capv">всех</b><i aria-hidden="true">▾</i></button><div class="cy-capm" role="listbox" aria-label="Кого показывать" hidden></div></div><span class="cy-hint">Нажми на землю — герой пойдёт; на здание — зайдёт</span></div>
        ${frHtml()}<button type="button" class="cy-others" aria-pressed="false">${OTH_ICO}<span class="cy-tipb" aria-hidden="true"></span></button>${froHtml()}
        <button type="button" class="cy-town" hidden aria-haspopup="dialog" aria-expanded="false"><span aria-hidden="true">🏘</span><b></b><i aria-hidden="true">▾</i></button>
        <div class="cy-tp" hidden role="dialog" aria-label="Выбрать город"></div>
        ${FS_OK() ? `<button type="button" class="cy-fs" aria-pressed="false" aria-label="На весь экран" title="На весь экран">${FS_ICO}</button>` : ""}
        <div class="cy-arrows"><button type="button" class="cy-ar l" data-pan="-1" aria-label="Вид влево"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></button><button type="button" class="cy-ar u" data-pany="-1" aria-label="Вид вверх"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></button><button type="button" class="cy-ar d" data-pany="1" aria-label="Вид вниз"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></button><button type="button" class="cy-ar zi" data-zoom="1" aria-label="Приблизить" title="Приблизить"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg></button><button type="button" class="cy-ar zo" data-zoom="-1" aria-label="Отдалить" title="Отдалить"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M5 12h14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg></button><button type="button" class="cy-ar r" data-pan="1" aria-label="Вид вправо"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>
      </div>
      ${chatHtml()}
      <nav class="cy-bar" aria-label="Здания города">${WD.BUILDINGS.filter(bOk)
				.map(
					(b) =>
						`<button type="button" data-b="${b.id}"${soonB(b) ? ' class="soon"' : ""}><span aria-hidden="true">${b.icon}</span>${esc(titleOf(b))}</button>`,
				)
				.join("")}</nav>
      <section class="cy-room" hidden aria-live="polite" role="dialog" aria-label="Здание"></section>
    </div>`;
	}
	function build(root, gl) {
		const st = X.style();
		let L = null;
		try {
			L = D().location("fair", { esc });
		} catch (e) {
			console.warn("[город] нет Ярмарки", e);
		}
		if (!L) {
			root.innerHTML =
				'<div class="panel cy-err"><p class="lead">Город не загрузился — обнови страницу.</p></div>';
			return null;
		}

		if (L.magic && L.magic.room)
			L.rooms = Object.assign({}, L.rooms, { magic: L.magic.room });
		const MS = msOn() && !!L.magic;

		if (TOWN.L)
			return isCamp()
				? buildCamp(root, gl, st, L, MS)
				: gl && TOWN.kit && window.LGTownKitCity
					? buildKit(root, gl, st, L, MS)
					: cityFail(root);
		if (gl && fcWant() && window.LGFairCatsCity)
			return buildCats(root, gl, st, L, msOn());
		return cityFail(root);
	}

	function cityFail(root) {
		const why = GLFAIL ? `<p class="note">Причина: ${esc(GLFAIL)}</p>` : "";
		root.innerHTML = `<div class="panel cy-err cy-fail"><p class="lead">Город не открылся - обнови страницу.</p>${why}<button type="button" class="btn primary cy-reload">Обновить</button></div>`;
		const b = root.querySelector(".cy-reload");
		if (b) b.addEventListener("click", () => location.reload());
		return null;
	}

	function finish(root, el, gl, sc) {
		const { L, map, st, street, sky, qprops, layers, props, skyDead } = sc;
		let G = null;
		if (gl) {
			G = window.LGCityGL.create({
				host: el.querySelector(".cy-view"),
				labelHost: el,
				W: WD.W,
				H: WD.H,
				top: topY(),
				sky,
				skyDead,
				mode: rmode(),
				V: window.LG_CITYV,
				layers,
				props,
				...(WD.ext ? { ext: WD.ext } : {}),
				bake: !!(X.hero() && X.hero().cb),
				onDirty: () => kick(),
				onFail: (why) => glFail(why),
			});
		}

		const ol =
			window.LGCityGL && window.LGCityGL.outliner
				? window.LGCityGL.outliner(
						[...layers, ...props].map((l) => ({ svg: l.svg, dx: l.dx || 0 })),
					)
				: null;

		el.querySelectorAll(".cy-art svg, .cy-prop").forEach((s) => {
			try {
				s.pauseAnimations && s.pauseAnimations();
			} catch {}
		});

		el.querySelectorAll(
			".cy-art svg svg.jl-doodle, .cy-prop svg.jl-doodle",
		).forEach((d) => {
			const w = d.getAttribute("width"),
				h = d.getAttribute("height");
			if (w) d.style.width = parseFloat(w) + "px";
			if (h) d.style.height = parseFloat(h) + "px";
			d.style.position = "static";
			d.style.filter = "none";
		});
		return {
			root,
			el,
			L,
			map,
			st,
			gl: G,
			ol,
			street,
			sky,
			qprops,
			glide: null,
			inFrame: false,
			q: {
				lv: qForced() ?? 0,
				fixed: qForced() != null,
				iv: [],
				at: 0,
				up: 0,
				lock: false,
				lodAt: 0,
				drawAt: 0,
			},
			camMoved: false,
			view: el.querySelector(".cy-view"),
			cam: el.querySelector(".cy-cam"),
			walk: el.querySelector(".cy-walk"),
			names: el.querySelector(".cy-names"),
			room: el.querySelector(".cy-room"),
			panel: null,
			hud: el.querySelector(".cy-on"),
			capV: capGet(),
			onlyFr: frGet(),
			onlyGl: !frGet() && glGet(),
			frs: null,
			frAt: 0,
			z: 0.6,
			camX: 0,
			camY: topY(),
			town: TOWN.id,
			qpfx: inTown() ? "cyt-" : "cyq-",
			camT: null,
			drag: null,
			follow: true,
			camFree: false,
			kw: { keys: new Set(), on: false, last: null, at: 0, dirty: false, t: 0 },
			me: null,
			others: new Map(),
			hidden: hideGet(),
			ghosts: new Map(),
			n: 0,
			inCity: false,
			entering: null,
			goQ: null,
			goAt: 0,
			goT: 0,
			raf: 0,
			last: 0,
			timer: 0,
			tick: 0,
			panelId: null,
			arrive: null,
		};
	}

	function buildCamp(root, gl, st, L, MS) {
		Object.assign(TOWN.L, campName());
		const TL = TOWN.L,
			A = window.LGCampArt.draw(TL, st, {
				guy: smithGuy,
				name: campName(),
				...(MS ? { magic: String(X.hero().ms) } : {}),
			});
		WD = {
			W: TL.W,
			H: TL.H,
			QW: 0,
			AREA: TL.AREA,
			BUILDINGS: TL.BUILDINGS.filter((b) => !b.magic || MS),
			town: TL,
		};
		const map = window.LGCampMap.map(TL, { magic: MS }),
			sky = A.sky;
		const layers = A.layers.map((l) => ({
			x: l.x,
			y: l.y || 0,
			w: l.w,
			h: l.h || TL.H,
			svg: scopeIds(l.svg, "cyt-"),
		}));
		const props = A.props.map((p) => ({
			x: p.x,
			y: p.y,
			w: p.w,
			h: p.h,
			z: p.z,
			dx: 0,
			...(p.flick ? { flick: p.flick } : {}),
			svg: scopeIds(A.defs + p.svg(), "cyt-"),
		}));
		root.innerHTML = shellHtml(
			st,
			gl
				? ""
				: `<div class="cy-art" style="background:${esc(sky)}">
            ${layers.map((l) => `<svg class="cy-tl" style="left:${l.x}px;top:${l.y}px" width="${l.w}" height="${l.h}" viewBox="${l.x} ${l.y} ${l.w} ${l.h}" overflow="visible" aria-hidden="true">${l.svg.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "")}</svg>`).join("")}
          </div>
          <div class="cy-walk">
            ${props.map((p) => `<svg class="cy-prop${p.flick ? " cy-camp-fl" : ""}" style="left:${p.x}px;top:${p.y}px;z-index:${p.z}" width="${p.w}" height="${p.h}" viewBox="${p.x} ${p.y} ${p.w} ${p.h}" overflow="visible" aria-hidden="true">${p.svg}</svg>`).join("")}
          </div>
          <div class="cy-names"></div>`,
		);
		const el = root.querySelector(".cy");
		el.classList.toggle("cy-pixi", !!gl);
		el.dataset.town = CAMP;
		el.dataset.bio = "camp";
		fxLayer(el, A.fx);

		return finish(root, el, gl, {
			L,
			map,
			st,
			street: layers.map((l) => l.svg),
			sky,
			qprops: A.props.map((p) => ({ ...p, svg: () => A.defs + p.svg() })),
			layers,
			props,
		});
	}

	function buildCats(root, gl, st, L, MS) {
		const C = window.LGFairCatsCity.build({
			guy: fcGuy,
			jail: jlOn(),
			magic: MS,
		});

		WD = {
			W: C.map.W,
			H: C.map.H,
			QW: 0,
			AREA: C.map.AREA,
			BUILDINGS: C.map.BUILDINGS,
			cats: true,
			ext: C.ext,
			edge: C.edge,
			...(jlOn() ? { LOW: { jail: window.LGFairCatsCity.JAIL } } : {}),
		};
		root.innerHTML = shellHtml(st, "");
		const el = root.querySelector(".cy");
		el.classList.add("cy-pixi");
		el.dataset.town = "fairc";
		const S2 = finish(root, el, gl, {
			L,
			map: C.map,
			st,
			street: C.near.layers.map((l) => l.svg),
			sky: C.sky,
			qprops: C.near.props.map((p) => ({ ...p, svg: () => p.svg })),
			layers: C.layers,
			props: C.props,
		});
		S2.cats = C;
		return S2;
	}

	function buildKit(root, gl, st, L, MS) {
		const tm = TOWN.meta ? townMeta(TOWN.meta) : {};
		const C = window.LGTownKitCity.build(TOWN.kit, {
			guy: fcGuy,
			magic: MS,
			levels: tm.levels || {},
			building: tm.building || {},
			owner: (TOWN.meta && TOWN.meta.oc) || "",
		});

		WD = {
			W: C.map.W,
			H: C.map.H,
			QW: 0,
			AREA: C.map.AREA,
			BUILDINGS: C.map.BUILDINGS,
			cats: true,
			kit: TOWN.id,
			...(C.ext && C.edge ? { ext: C.ext, edge: C.edge } : {}),
		};
		root.innerHTML = shellHtml(st, "");
		const el = root.querySelector(".cy");
		el.classList.add("cy-pixi");
		el.dataset.town = "n-" + TOWN.id;
		el.dataset.bio = TOWN.kit.biome || "";
		fxLayer(el, C.fx);
		const S2 = finish(root, el, gl, {
			L,
			map: C.map,
			st,
			street: C.near.layers.map((l) => l.svg),
			sky: C.sky,
			qprops: C.near.props.map((p) => ({ ...p, svg: () => p.svg })),
			layers: C.layers,
			props: C.props,
		});
		S2.cats = C;
		S2.kit = TOWN.id;
		return S2;
	}

	function kitDrop(msg) {
		if (!S) return;
		KIT_OFF = true;
		TOWN = { ...TOWN, kit: null };
		const root = S.root;
		leave();
		timers(false);
		if (S.raf) cancelAnimationFrame(S.raf);
		clearTimeout(S.wait);
		S.wait = 0;
		if (S.gl)
			try {
				S.gl.destroy();
			} catch (e) {
				console.warn("[город] новый вид города: Pixi", e);
			}
		S = null;
		if (msg && X && X.toast) X.toast(msg);
		if (root.isConnected && root.classList.contains("on")) open(root, X);
	}

	function fcGuy(seed, look, s, x, base) {
		try {
			const svg = D().jDoodle(D().jhash(seed), "happy", false, {}, look),
				w = 120 * s,
				h = 170 * s;
			return (
				`<g transform="translate(${x} ${base})">` +
				still(svg).replace(
					/<svg class="jl-doodle( jd-ghost)?" viewBox="0 0 120 170"( style="([^"]*)")?/,
					(m, gh, st2, css) =>
						`<svg class="jl-doodle${gh || ""}" x="${-w / 2}" y="${-h}" width="${w}" height="${h}" viewBox="0 0 120 170" overflow="visible" style="${css ? css + ";" : ""}position:static;width:${w}px;height:${h}px;filter:none"`,
				) +
				"</g>"
			);
		} catch (e) {
			console.warn("[город] новая Ярмарка: человечек", e);
			return "";
		}
	}

	let fcJs = null,
		kitP = null,
		KIT_OFF = false;

	const kitPre = () => {
		const V = window.LG_CITYV || {};
		townPre(
			!window.LGTownKitMap && `/site/tk-map.js?v=${V.km || ""}`,
			!window.LGTownKitArt && `/site/tk-art.js?v=${V.ka || ""}`,
			!window.LGTownKitCity && `/site/tk-city.js?v=${V.kc || ""}`,
		);
	};
	const kitJs = () =>
		kitP ||
		(kitP = (() => {
			kitPre();
			const V = window.LG_CITYV || {};
			return (
				window.LGTownKitMap
					? Promise.resolve()
					: townJs(`/site/tk-map.js?v=${V.km || ""}`)
			)
				.then(() =>
					window.LGTownKitArt
						? null
						: townJs(`/site/tk-art.js?v=${V.ka || ""}`),
				)
				.then(() =>
					window.LGTownKitCity
						? null
						: townJs(`/site/tk-city.js?v=${V.kc || ""}`),
				);
		})().catch((e) => {
			kitP = null;
			throw e;
		}));
	function fcPrep(root) {
		root.innerHTML = '<p class="empty">Город строится на глазах…</p>';
		const V = window.LG_CITYV || {};

		if (!fcJs)
			townPre(
				`/site/fc-map.js?v=${V.fm || ""}`,
				`/site/fc-art.js?v=${V.fa || ""}`,
				`/site/fc-city.js?v=${V.fc || ""}`,
			);
		if (!fcJs)
			fcJs = kitJs()
				.then(() => townJs(`/site/fc-map.js?v=${V.fm || ""}`))
				.then(() => townJs(`/site/fc-art.js?v=${V.fa || ""}`))
				.then(() => townJs(`/site/fc-city.js?v=${V.fc || ""}`))
				.then(
					() => !!window.LGFairCatsCity,
					(e) => {
						console.warn("[город] новая Ярмарка не загрузилась", e);
						return false;
					},
				);
		const p = fcJs;
		p.then((ok) => {
			if (!ok && fcJs === p) fcJs = null;
			if (!root.isConnected || !root.classList.contains("on")) return;

			if (!ok) {
				root.innerHTML =
					'<div class="panel cy-err"><p class="lead">Город не загрузился - проверь связь и открой вкладку ещё раз.</p></div>';
				return;
			}
			open(root, X);
		});
	}

	function fcDrop(msg) {
		if (!S) return;
		FC_OFF = true;
		const root = S.root;
		leave();
		timers(false);
		if (S.raf) cancelAnimationFrame(S.raf);
		clearTimeout(S.wait);
		S.wait = 0;
		if (S.gl)
			try {
				S.gl.destroy();
			} catch (e) {
				console.warn("[город] новая Ярмарка: Pixi", e);
			}
		S = null;
		if (msg && X && X.toast) X.toast(msg);
		if (root.isConnected && root.classList.contains("on")) open(root, X);
	}

	function smithGuy(seed, base, cx, s, mood, extra, look, anim) {
		try {
			const svg = D().jDoodle(D().jhash(seed), mood, false, extra, look),
				w = 120 * s,
				h = 170 * s;
			const body = svg.replace(
				'<svg class="jl-doodle" viewBox="0 0 120 170"',
				`<svg class="jl-doodle" x="${-w / 2}" y="${-h}" width="${w}" height="${h}" viewBox="0 0 120 170" overflow="visible"`,
			);
			const sway =
				anim === "smith"
					? '<animateTransform attributeName="transform" type="rotate" values="0;-7;-7;4;0;0" keyTimes="0;.3;.45;.55;.7;1" dur=".9s" repeatCount="indefinite"/>'
					: "";
			return `<g transform="translate(${cx} ${base})"><g>${sway}<g>${body}</g></g></g>`;
		} catch {
			return "";
		}
	}

	function fxLayer(el, kind) {
		if (!kind || reduce()) return;
		const v = el.querySelector(".cy-view");
		if (!v) return;
		const n = kind === "snow" ? 14 : kind === "firefly" ? 8 : 10;
		let h = "";
		for (let i = 0; i < n; i++)
			h += `<i style="left:${(i * 97) % 100}%;animation-delay:${(-i * 1.37).toFixed(2)}s;animation-duration:${(kind === "firefly" ? 5 : 7) + (i % 4) * 1.3}s"></i>`;
		const f = document.createElement("div");
		f.className = "cy-fx";
		f.dataset.fx = kind;
		f.setAttribute("aria-hidden", "true");
		f.innerHTML = h;
		v.appendChild(f);
	}

	function layout() {
		if (!S) return;
		if (S.gl && !S.root.classList.contains("on")) return;
		try {
			const fs = document.fullscreenElement === S.el,
				top = fs ? 0 : S.view.getBoundingClientRect().top + window.scrollY,
				bar = S.el.querySelector(".cy-bar"),
				bh = bar && window.LGSiteUi.is("phone") ? bar.offsetHeight : 0;
			S.view.style.height =
				Math.max(300, Math.round(window.innerHeight - top - bh)) + "px";
		} catch {}
		const vh = S.view.clientHeight || 400,
			vw = S.view.clientWidth || 360;
		S.vw = vw;
		S.vh = vh;
		S.zb = Math.max(0.4, Math.min(1, vh / 1100, vw / 640));
		S.z = zClamp(S.zb * (S.zk || zoomGet()));
		S.cam.style.setProperty("--iz", (1 / S.z).toFixed(3));
		clampCam();
		applyCam();
	}

	const ZK_KEY = "lgCityZoom";
	const zoomGet = () => {
		try {
			const v = +localStorage.getItem(ZK_KEY);
			return v > 0.2 && v < 5 ? v : 1;
		} catch {
			return 1;
		}
	};
	const zoomSave = () => {
		try {
			localStorage.setItem(ZK_KEY, String(+(S.zk || 1).toFixed(3)));
		} catch {}
	};

	const FAIR_H = 1980;
	const zH = () => (isCamp() ? Math.max(WD.H, FAIR_H) : WD.H);
	function zLim() {
		const vh = S.vh || 400,
			vw = S.vw || 360,
			zb = S.zb || 0.6,
			e = edgeW();

		const lo = Math.max(vh / (zH() - topY() + 2 * e), vw / (WD.W + 2 * e), 0.2);
		return [Math.min(lo, zb), zb * 2];
	}

	const WHEEL_OWN =
		".cy-tp, .cy-chat, .cy-room, input, textarea, select, [data-wheel]";
	function zClamp(z) {
		const [a, b] = zLim();
		return Math.max(a, Math.min(b, z));
	}

	function zoomTo(z, sx, sy) {
		z = zClamp(z);
		if (Math.abs(z - S.z) < 1e-4) return;

		if (sx == null) {
			sx = (S.vw || 360) / 2;
			sy = (S.vh || 400) / 2;
		} else S.camFree = true;
		const wx = S.camX + sx / S.z,
			wy = S.camY + sy / S.z;
		S.z = z;
		S.zk = z / (S.zb || z);
		zoomSave();
		S.camX = wx - sx / z;
		S.camY = wy - sy / z;
		S.cam.style.setProperty("--iz", (1 / S.z).toFixed(3));
		S.glide = null;
		clampCam();
		applyCam();
		if (S.hovK) hover(null);
	}

	const viewW = () => (S.vw || 360) / S.z;
	const viewH = () => (S.vh || 400) / S.z;

	function camM() {
		const vw = S.vw || 360,
			vh = S.vh || 400;
		return vw < 720
			? Math.round(Math.max(56, Math.min(140, Math.min(vw, vh) * 0.22)))
			: 400;
	}
	const edgeW = () => (WD.edge ? +WD.edge.cam || 0 : 0);
	const edgeNow = () => (WD.edge ? Math.min(edgeW(), camM() / (S.z || 1)) : 0);
	function clampCam() {
		if (WD.edge) {
			const m = edgeNow(),
				w = viewW(),
				h = viewH(),
				x0 = -m,
				x1 = WD.W + m,
				y0 = topY() - m,
				y1 = WD.H + m;
			S.camX =
				x1 - x0 <= w
					? (x0 + x1 - w) / 2
					: Math.max(x0, Math.min(x1 - w, S.camX));
			S.camY =
				y1 - y0 <= h
					? (y0 + y1 - h) / 2
					: Math.max(y0, Math.min(y1 - h, S.camY));
			return;
		}
		S.camX = Math.max(0, Math.min(WD.W - viewW(), S.camX));
		const span = WD.H - topY() - viewH();

		S.camY =
			span > 0
				? Math.max(topY(), Math.min(WD.H - viewH(), S.camY))
				: isCamp()
					? WD.H - viewH()
					: topY() + span / 2;
	}

	function camDom() {
		S.camDom = false;
		const z = S.z,
			d = S.gl && S.gl.res ? S.gl.res() || 1 : 0;
		const x = d ? Math.round(-S.camX * z * d) / d : +(-S.camX * z).toFixed(1),
			y = d ? Math.round(-S.camY * z * d) / d : +(-S.camY * z).toFixed(1);
		S.cam.style.transform = `translate(${x}px, ${y}px) scale(${z})`;
	}
	function applyCam() {
		S.camMoved = true;
		if (S.gl) {
			S.camDom = true;
			S.gl.view(S.camX, S.camY, S.z, S.vw || 360, S.vh || 400);
			kick();
		} else camDom();

		if (S.hnArm && hnNear()) {
			S.hnArm = false;
			S.hnK = "";
			hwNpc(S.hnOn, true);
		}

		for (const w of S.others.values())
			if (!w.shown && onScreen(w.x, w.y)) {
				place(w);
				w.shown = true;
			}
	}

	function follow(dt) {
		if (!S.me || S.panelId || S.camFree) return false;
		const w = viewW(),
			h = viewH(),
			x = S.me.x,
			y = S.me.y - 60;
		let wx = S.camX,
			wy = S.camY;
		if (x < S.camX + w * 0.32) wx = x - w * 0.32;
		else if (x > S.camX + w * 0.68) wx = x - w * 0.68;
		if (y < S.camY + h * 0.3) wy = y - h * 0.3;
		else if (y > S.camY + h * 0.7) wy = y - h * 0.7;
		const ox = S.camX,
			oy = S.camY;
		S.camX += (wx - S.camX) * Math.min(1, dt * 6);
		S.camY += (wy - S.camY) * Math.min(1, dt * 6);
		clampCam();
		if (Math.abs(S.camX - ox) < 0.3 && Math.abs(S.camY - oy) < 0.3)
			return false;
		applyCam();
		return true;
	}
	function centerOn(x, y) {
		S.camX = x - viewW() / 2;
		if (y != null) S.camY = y - viewH() * 0.6;
		clampCam();
		applyCam();
	}

	function walkerSvg(l, v) {
		if (hwGh()) v = { ...v, gh: 1 };
		if (X.fig) return X.fig(l, v);
		const hero = { look: v.lk || null, gear: v.g || {}, ghost: !!v.gh };
		return still(X.doodle(l, hero, "walk", "peace"));
	}

	const LIFT = new Map();
	let liftBox = null;
	function nameLift(svg, v) {
		const key = svg + "|" + ((v.lk && v.lk.aura) || "");
		if (LIFT.has(key)) return LIFT.get(key);
		let lift = 128;
		try {
			if (!liftBox) {
				liftBox = document.createElementNS("http://www.w3.org/2000/svg", "svg");
				liftBox.setAttribute("aria-hidden", "true");
				liftBox.style.cssText =
					"position:absolute;left:-9999px;top:0;width:120px;height:170px;overflow:hidden;visibility:hidden;pointer-events:none";
				document.body.appendChild(liftBox);
			}
			liftBox.innerHTML = svg
				.replace(/^[\s\S]*?<svg\b[^>]*>/, "")
				.replace(/<\/svg>\s*$/, "");
			liftBox.querySelectorAll(".jd-aura-b").forEach((n) => n.remove());
			if (!(v.lk && v.lk.aura === "halo"))
				liftBox.querySelectorAll(".jd-aura-f").forEach((n) => n.remove());
			const b = liftBox.getBBox();
			if (b.height > 0) lift = Math.max(128, Math.min(200, 170 - b.y + 6));
			liftBox.innerHTML = "";
		} catch {}
		if (LIFT.size > 300) LIFT.clear();
		LIFT.set(key, lift);
		return lift;
	}

	const labOf = (l, v, mine) => ({
		name: String(v.n || l),
		lv: v.lv ? +v.lv : 0,
		aw: Array.isArray(v.aw) ? v.aw : null,
		mine: !!mine,
		gh: !!v.gh,
		...(v.gt ? { gt: String(v.gt) } : {}),
	});
	function addWalker(l, v, x, y, mine) {
		if (S.gl) {
			const svg = walkerSvg(l, v),
				w = {
					l,
					v,
					x,
					y,
					path: null,
					face: 1,
					mine: !!mine,
					sc: 0,
					moving: false,
					lift: nameLift(svg, v),
				};
			S.gl.add(w, svg, labOf(l, v, mine));
			place(w);
			return w;
		}
		const svg = walkerSvg(l, v),
			w = {
				l,
				v,
				x,
				y,
				path: null,
				face: 1,
				mine: !!mine,
				el: document.createElement("div"),
				body: null,
				nm: null,
				sc: 0,
				moving: false,
				lift: nameLift(svg, v),
			};
		w.el.className = "cy-w" + (mine ? " me" : "") + (v.gh ? " gh" : "");
		w.el.innerHTML = `<div class="cy-b">${svg}</div>`;
		w.body = w.el.firstChild;

		w.nm = document.createElement("div");
		w.nm.className = "cy-nm" + (mine ? " me" : "");
		w.nm.innerHTML = `${v.gt ? `<small class="cy-gt">[${esc(v.gt)}]</small> ` : ""}${esc(v.n || l)}${v.lv ? ` <small>${+v.lv}</small>` : ""}${X.awb ? X.awb(v.aw) : ""}`;
		S.walk.appendChild(w.el);
		S.names.appendChild(w.nm);
		place(w);
		return w;
	}

	const scaleAt = (y) =>
		WD && WD.cats
			? (WD.kit ? window.LGTownKitCity : window.LGFairCatsCity).SCALE / HS
			: WD && WD.town && window.LGTownGen
				? window.LGTownGen.scaleAt(WD.town, y)
				: M.scaleAt(y);
	const HS = 1.3;
	function place(w) {
		const sc = scaleAt(w.y) * HS;
		if (w.bub)
			w.bub.style.transform = `translate(${w.x.toFixed(1)}px,${(w.y - (w.lift || 128) * sc - 4).toFixed(1)}px)`;
		if (S.gl) {
			S.gl.place(w, sc);
			w.sc = sc;
			return;
		}
		w.el.style.transform = `translate(${w.x.toFixed(1)}px,${w.y.toFixed(1)}px)`;
		w.el.style.zIndex = String(Math.round(w.y) + (w.mine ? 1 : 0));
		w.nm.style.transform = `translate(${w.x.toFixed(1)}px,${(w.y - (w.lift || 128) * sc - 4).toFixed(1)}px) translate(-50%,-100%)`;
		if (Math.abs(sc - w.sc) > 0.004 || w.faceSet !== w.face) {
			w.body.style.transform = `scale(${(w.face * sc).toFixed(3)},${sc.toFixed(3)})`;
			w.sc = sc;
			w.faceSet = w.face;
		}
	}
	const drop = (w) => {
		if (w.bub) {
			w.bub.remove();
			w.bub = null;
		}
		if (S.gl) {
			S.gl.remove(w);
			return;
		}
		w.el.remove();
		w.nm.remove();
	};

	function walkTo(w, tx, ty) {
		const p = S.map.path([w.x, w.y], [tx, ty]);
		if (!S.map.free(w.x, w.y) || !S.map.clear([w.x, w.y], p[0])) {
			w.x = p[0][0];
			w.y = p[0][1];
		}
		w.path = p.length > 1 ? p.slice(1) : null;
		w.lag = 0;
		setMoving(w, !!w.path);
		kick();
		return p[p.length - 1];
	}

	function chase(w, fx, fy, tx, ty, ago, fresh) {
		const r = M.follow(S.map, [w.x, w.y], [fx, fy], [tx, ty], ago, {
			fresh,
			speed: SP(),
		});
		w.x = r.x;
		w.y = r.y;
		w.path = r.path;
		w.lag = r.lag;
		if (r.fade) {
			fadeIn(w);
			place(w);
		}
		setMoving(w, !!w.path);
		kick();
	}
	const FADE_MS = 260;
	function fadeIn(w) {
		if (reduce()) return;
		w.fadeT = performance.now();
		alpha(w, 0);
	}
	function alpha(w, a) {
		if (S.gl) {
			if (S.gl.alpha) S.gl.alpha(w, a);
		} else if (w.el) {
			const v = a >= 1 ? "" : a.toFixed(2);
			w.el.style.opacity = v;
			w.nm.style.opacity = v;
		}
	}
	function setMoving(w, on) {
		if (w.moving !== on) {
			w.moving = on;
			if (S.gl) S.gl.moving(w, on && !reduce());
			else w.el.classList.toggle("mv", on && !reduce());
		}
	}
	function advance(w, dt) {
		const r = M.stepAlong(w, dt, SP());
		w.x = r.x;
		w.y = r.y;
		w.path = r.path;
		w.lag = r.lag;

		if (r.dx) w.face = r.dx < 0 ? 1 : -1;

		const on = !S.panelId && (w.mine || onScreen(w.x, w.y));
		if (on || w.shown) place(w);
		w.shown = on;
		if (!w.path) {
			setMoving(w, false);
			if (w.mine && S.arrive) {
				const f = S.arrive;
				S.arrive = null;
				f();
			}
		}

		if (w.mine && S && S.kbd) kwHint();
	}
	const onScreen = (x, y) =>
		x > S.camX - 160 &&
		x < S.camX + viewW() + 160 &&
		(y == null || (y > S.camY - 100 && y < S.camY + viewH() + 300));

	function frame(t) {
		try {
			frameStep(t);
			if (S) S.fe = 0;
		} catch (e) {
			console.warn("[город] ошибка кадра", e);
			if (!S) return;
			S.inFrame = false;
			S.raf = 0;
			S.fe = (S.fe || 0) + 1;
			if (S.gl && S.fe >= 3) {
				glFail("ошибка кадра: " + String((e && e.message) || e));
				return;
			}
			if (S.fe < 30) setTimeout(kick, 250);
		}
	}
	function frameStep(t) {
		if (!S) return;
		S.raf = 0;

		const Q = QL[S.q.lv],
			mode = S.gl ? (S.gl.mode === "webgl" ? "webgl" : "canvas") : "svg";

		if (document.hidden) {
			S.last = 0;
			return;
		}
		const fast = !!(
			(S.me && S.me.path) ||
			(S.kw && S.kw.on) ||
			S.glide ||
			S.camMoved ||
			(S.drag && S.drag.moved)
		);
		const BG = window.LGSiteUi && window.LGSiteUi.bg,
			gap = BG
				? BG.gap(1000 / Q[mode][fast ? 0 : 1])
				: 1000 / Q[mode][fast ? 0 : 1];

		const slow = gap >= 60,
			tol = slow ? 17 : 4;
		if (S.last && t - S.last < gap - tol) {
			const w = gap - tol - (t - S.last);
			if (slow && w > 20) {
				frameLater(w);
				return;
			}
			S.raf = requestAnimationFrame(frame);
			return;
		}
		S.camMoved = false;
		S.inFrame = true;

		const chain = !!S.last;
		const real = Math.min(2, (t - (S.last || t)) / 1000),
			dt = Math.min(0.1, real);
		S.last = t;
		let any = false;

		if (S.kw && S.kw.on) any = kwStep(Math.min(0.25, real)) || any;
		for (const w of [S.me, ...S.others.values()])
			if (w && w.path) {
				advance(w, real);
				any = any || !!w.path;
			}
		if (t - S.q.lodAt > 1000) lodPick(t);
		for (const w of S.others.values())
			if (w.fadeT) {
				const a = Math.min(1, (t - w.fadeT) / FADE_MS);
				alpha(w, a);
				if (a >= 1) w.fadeT = 0;
				else any = true;
			}
		let cam = glide(t) || follow(dt || 0.016);
		S.camLast = cam;

		if (S.gl && !S.panelId) cam = S.gl.render(t, reduce()) || cam;
		if (!S) return;
		if (S.camDom) camDom();
		S.inFrame = false;
		qualityTick(t, gap, chain);
		if (any || cam) {
			if (slow) frameLater(gap - tol);
			else S.raf = requestAnimationFrame(frame);
		} else S.last = 0;
	}

	if (window.LGSiteUi && window.LGSiteUi.bg)
		window.LGSiteUi.bg.on((st) => {
			if (st === "on" && S && S.wait) {
				clearTimeout(S.wait);
				S.wait = 0;
				kick();
			}
		});

	function frameLater(w) {
		const S0 = S;
		clearTimeout(S.wait);
		S.wait = setTimeout(
			() => {
				if (S !== S0 || !S.wait) return;
				S.wait = 0;
				if (!S.raf) S.raf = requestAnimationFrame(frame);
			},
			Math.max(0, w),
		);
	}

	function qualityTick(t, gap, chain) {
		const q = S.q;

		if (
			q.fixed ||
			S.panelId ||
			document.hidden ||
			(window.LGSiteUi &&
				window.LGSiteUi.bg &&
				window.LGSiteUi.bg.state() !== "on")
		) {
			q.iv.length = 0;
			q.drawAt = 0;
			return;
		}
		if (S.gl && S.gl.busy && S.gl.busy()) {
			q.drawAt = 0;
			return;
		}
		if (chain && q.drawAt && t - q.drawAt < 400)
			q.iv.push((t - q.drawAt) / gap);
		q.drawAt = t;
		if (q.iv.length > 120) q.iv.shift();
		if (!q.at) q.at = t;
		const n = q.iv.length;
		if (n < 15 || t - q.at < 2500) return;
		let sum = 0;
		const k = Math.min(n, 60);
		for (let i = n - k; i < n; i++) sum += q.iv[i];
		const r = sum / k;
		q.r = r;
		if (r > 1.45 && q.lv < QL.length - 1) {
			if (q.up && t - q.up < 60000) q.lock = true;
			setQuality(q.lv + 1, t);
		} else if (r < 1.12 && q.lv > 0 && !q.lock && t - q.at > 45000) {
			q.up = t;
			setQuality(q.lv - 1, t);
		}
	}
	function setQuality(lv, t) {
		const q = S.q;
		q.lv = Math.max(0, Math.min(QL.length - 1, lv));
		q.iv.length = 0;
		q.at = t || performance.now();
		q.drawAt = 0;
		const Q = QL[q.lv];
		if (S.gl && S.gl.setRes) {
			S.gl.setBob(Q.bob);
			S.gl.setRes(Q.res[S.gl.mode === "webgl" ? 1 : 0] || 4);
		}
		lodPick(performance.now());
		hud();
		kick();
	}

	function lodPick(t) {
		S.q.lodAt = t;
		const Q = QL[S.q.lv];
		let list = [...S.others.values()],
			ch = false;
		const set = (w, cull, nolab) => {
			if (!!w.cull !== cull || !!w.nolab !== nolab) {
				const back = !!w.cull && !cull;
				w.cull = cull;
				w.nolab = nolab;
				ch = true;
				if (!S.gl && w.el) {
					w.el.style.display = cull ? "none" : "";
					w.nm.style.display = cull || nolab ? "none" : "";
				}
				if (cull && w.bub) {
					w.bub.remove();
					w.bub = null;
				}
				if (!cull) {
					place(w);
					w.shown = true;
				}
				if (back) fadeIn(w);
			}
		};

		if (frOn()) {
			if (t - S.frAt > 60000) frLoad(t);
			const fr = S.frs || new Set();
			list = list.filter((w) => {
				const ok = fr.has(String(w.l).toLowerCase());
				if (!ok) set(w, true, true);
				return ok;
			});
		} else if (glOn()) {
			const tg = glTag();
			list = list.filter((w) => {
				const ok = !!(w.v && String(w.v.gt || "") === tg);
				if (!ok) set(w, true, true);
				return ok;
			});
		}
		const vis = S.capV > 0 ? Math.min(Q.vis, S.capV) : Q.vis;
		if (list.length <= Q.lab && list.length <= vis)
			for (const w of list) set(w, false, false);
		else {
			const cx = S.me ? S.me.x : S.camX + viewW() / 2,
				cy = S.me ? S.me.y : S.camY + viewH() / 2;
			list.sort(
				(a, b) =>
					Math.hypot(a.x - cx, (a.y - cy) * 1.5) -
					Math.hypot(b.x - cx, (b.y - cy) * 1.5),
			);
			list.forEach((w, i) => set(w, i >= vis, i >= Q.lab));
		}
		if (ch) {
			if (S.gl) S.gl.dirty();
			hud();
			kick();
		}
		showSync();
	}

	function showSync() {
		if (!S || !S.inCity || S.hidden) return;
		const only = frOn() ? "fr" : glOn() ? "gl" : "",
			fr = only === "fr" ? [...(S.frs || [])].sort() : [],
			key = only + ":" + fr.join(",");
		if (S.shKey === key || (!S.shKey && !only)) return;
		S.shKey = key;
		X.api("/api/city/show", { only, fr }).then(
			(r) => {
				if (S && r && r.ok === false && S.shKey === key) S.shKey = null;
			},
			() => {
				if (S && S.shKey === key) S.shKey = null;
			},
		);
	}
	function kick() {
		if (
			S &&
			!S.raf &&
			!S.wait &&
			!S.inFrame &&
			(!S.gl || S.root.classList.contains("on"))
		) {
			S.last = 0;
			S.raf = requestAnimationFrame(frame);
		}
	}

	function glide(t) {
		const g = S.glide;
		if (!g) return false;
		const a = Math.min(1, Math.max(0, (t - g.t0) / 400)),
			e = 1 - (1 - a) ** 3;
		S.camX = g.x0 + (g.x1 - g.x0) * e;
		S.camY = g.y0 + (g.y1 - g.y0) * e;
		if (a >= 1) S.glide = null;
		applyCam();
		return true;
	}

	function glFail(why) {
		if (GLFAIL) return;
		GLFAIL = why || "ошибка";
		console.warn("[город] Pixi отключён:", GLFAIL);
		if (!S || !S.gl) return;
		const root = S.root;
		savePos();
		leave();
		timers(false);
		if (S.raf) cancelAnimationFrame(S.raf);
		clearTimeout(S.wait);
		S.wait = 0;
		try {
			S.gl.destroy();
		} catch {}
		S = null;
		if (X && root.isConnected && root.classList.contains("on")) open(root, X);
	}

	function qOut(r) {
		if (!(r && r.ok === false && r.quest)) return false;
		if (S) S.inCity = false;
		try {
			if (X.questOut) X.questOut();
		} catch (e) {
			console.warn("Город: заглушка похода", e);
		}
		return true;
	}

	const WW_MAX = 8,
		WW_MS = 1500;
	let WW_N = 0;

	let WW_LATE = null;
	function wwWake() {
		const w = WW_LATE;
		if (!w || S || !X) return false;
		if (
			JSON.stringify(homeOf()) === w.k ||
			!w.root.isConnected ||
			!w.root.classList.contains("on")
		)
			return false;
		WW_LATE = null;
		WW_N = 0;
		open(w.root, X);
		return true;
	}

	const EL_RE =
		/нет связи|rate_limited|много запросов|redis_down|internal|timeout/i;
	let EL_N = 0;
	function enterLater(r) {
		if (!S || (r && (r.closed || !EL_RE.test(String(r.error || ""))))) return;
		const s = S;
		clearTimeout(s.elT);
		s.elT = setTimeout(
			() => {
				if (
					S !== s ||
					s.inCity ||
					(typeof document !== "undefined" && document.hidden) ||
					!s.root.isConnected ||
					!s.root.classList.contains("on")
				)
					return;
				enter();
			},
			Math.min(30000, 3000 * 2 ** Math.min(EL_N++, 4)),
		);
	}
	function worldWait() {
		if (homeOf() || WW_N >= WW_MAX || !S) return false;
		WW_N++;
		const s = S;
		hud("Город открывается…");
		clearTimeout(s.wwT);
		s.wwT = setTimeout(() => {
			if (
				S !== s ||
				s.inCity ||
				!s.root.isConnected ||
				!s.root.classList.contains("on")
			)
				return;
			if (homeOf()) open(s.root, X);
			else enter();
		}, WW_MS);
		return true;
	}
	async function enter() {
		if (!S || S.inCity || S.entering) return;
		S.entering = X.api("/api/city/enter", {
			x: Math.round(S.me.x),
			y: Math.round(S.me.y),
			town: S.kit ? "n-" + S.town : S.cats ? "fairc" : S.town || "fair",
		});
		const r = await S.entering;
		S.entering = null;
		if (!S) return;
		if (qOut(r)) return;

		const nv = !!(r && !r.ok && r.error === "town_closed" && r.nv);
		const cc =
			(window.LGSiteUi &&
				window.LGSiteUi.closedCode &&
				window.LGSiteUi.closedCode(r)) ||
			"";
		if (nv && S.kit) {
			kitDrop("Город сейчас закрыт - обнови страницу" + cc);
			return;
		}
		if (nv && S.cats) {
			fcDrop("Город сейчас закрыт - обнови страницу" + cc);
			return;
		}
		if (r && !r.ok && r.error === "town_closed" && worldWait()) return;

		if (r && !r.ok && r.error === "town_closed") {
			WW_N = 0;
			const bk = homeBack(),
				here = S.town || "fair";
			if (bk && bk !== here)
				townGo(bk, "Этот город сейчас закрыт — ты в городе канала" + cc);
			else
				townShut(
					S.root,
					(here === "fair"
						? "Рябинень сейчас закрыт"
						: "Этот город сейчас закрыт") + cc,
				);
			return;
		}
		if (!r || !r.ok) {
			hud(
				r && r.error
					? "Город без других игроков: " + r.error
					: "Другие игроки пока не видны — нет связи",
			);
			enterLater(r);
			return;
		}
		WW_N = 0;
		EL_N = 0;
		S.inCity = true;
		S.inB = null;
		S.shKey = null;
		for (const w of S.others.values()) drop(w);
		S.others.clear();
		S.ghosts.clear();
		chatEnter(r);

		jailLoad();
		if (window.LGTrade) window.LGTrade.mount(X, S.el);
		apply(r);
		timers(true);
		if (S.goQ) flushGo();
	}
	function leave() {
		if (!S || !S.inCity) return;
		S.inCity = false;
		try {
			fetch((window.LG_BASE || "") + "/api/city/leave", {
				method: "POST",
				keepalive: true,
				headers: { "Content-Type": "application/json" },
				body: "{}",
			});
		} catch {}
		if (window.LGTrade) window.LGTrade.reset();
		for (const w of S.others.values()) drop(w);
		S.others.clear();
		S.ghosts.clear();
		S.n = 0;
		hud();
	}

	function sendGo(tx, ty, from) {
		S.goQ = { x: Math.round(tx), y: Math.round(ty), f: from || null };

		if (!from && S.kw) {
			clearTimeout(S.kw.t);
			S.kw.t = 0;
			S.kw.dirty = false;
		}
		if (!S.inCity) return;
		const wait = 300 - (Date.now() - S.goAt);
		if (wait > 0) {
			clearTimeout(S.goT);
			S.goT = setTimeout(flushGo, wait);
			return;
		}
		flushGo();
	}
	async function flushGo() {
		if (!S || !S.goQ || !S.inCity) return;
		const q = S.goQ;
		S.goQ = null;
		S.goAt = Date.now();
		const r = await X.api("/api/city/go", {
			x: q.x,
			y: q.y,
			fx: Math.round(q.f ? q.f[0] : S.me.x),
			fy: Math.round(q.f ? q.f[1] : S.me.y),
		});
		if (!S || qOut(r)) return;
		if (r && r.ok !== false) savePos();
		if (r && r.ok === false && /не в городе/.test(r.error || "")) {
			S.inCity = false;
			S.goQ = q;
			enter();
		} else if (r && r.ok === false && /быстро|часто/.test(r.error || "")) {
			S.goQ = S.goQ || q;
			clearTimeout(S.goT);
			S.goT = setTimeout(flushGo, 1500);
		}
	}

	function apply(d) {
		if (!S || !d) return;
		if ((d.tr !== undefined || d.trNote || d.trDone) && window.LGTrade) {
			window.LGTrade.mount(X, S.el);
			window.LGTrade.on(d.tr, d);
		}
		if (d.chat || d.chatDel || d.c != null) chatApply(d);
		if (S.hidden) {
			remember(d);
			if (d.n != null) S.n = d.n;
			hud();
			return;
		}
		for (const l of d.g || []) {
			const w = S.others.get(l);
			if (w) {
				drop(w);
				S.others.delete(l);
			}
		}
		let born = false;
		for (const e of d.a || []) {
			if (e.l === X.login()) continue;
			let w = S.others.get(e.l),
				fresh = false;
			if (!w) {
				const [nx, ny] = S.map.nearest(e.x, e.y);
				w = addWalker(e.l, e, nx, ny, false);
				S.others.set(e.l, w);
				fresh = true;
				born = true;
			}
			chase(w, e.x, e.y, e.tx, e.ty, +e.dt || 0, fresh);
		}

		if (born) lodPick(performance.now());
		for (const m of d.m || []) {
			const w = S.others.get(m[0]);
			if (!w) continue;
			chase(w, m[1], m[2], m[3], m[4], +m[5] || 0, false);
		}
		if (d.n != null) S.n = d.n;
		hud();
	}
	function hud(msg) {
		if (!S) return;
		let vis = 0;
		for (const w of S.others.values()) if (!w.cull) vis++;
		const more = Math.max(0, S.n - vis);
		const t =
			msg ||
			(S.inCity
				? `В городе: ${S.n + 1}${S.hidden ? (S.n ? " · другие скрыты" : "") : frOn() ? ` · друзей видно: ${vis}` : glOn() ? ` · гильдии видно: ${vis}` : more ? ` · видно ${vis}, ещё ${more}` : ""}`
				: "Подключаемся к городу…");
		if (S.hud.textContent !== t) S.hud.textContent = t;
	}

	let CH0 = null;
	const CH = () =>
		CH0 ||
		(CH0 = window.LGChat
			? window.LGChat.make({
					state: () => S,
					X: () => X,
					base: "/api/city/chat",
					say: "/api/city/say",
					key: "lgCityChat",
					win: { key: "lgCityChatWin" },
					name: "Чат города",
					ph: "Написать в чат города…",
					where: "в чате города",
					flags: (h) => ({
						on: !!(h && h.cc),
						tr: !!(h && h.ct),
						dm: !!(h && h.cd),
						gl: !!(h && h.gch),
					}),
					trade: true,
					here: () => !!(S && S.inCity),
					joining: "подключаемся к городу…",
					rejoin: () => enter(),
					onError: (er) => {
						if (/не в городе/.test(er) && S) {
							S.inCity = false;
							enter();
						}
					},
					bubble: (l, t, id) => bubble(l, t, id),
					unbubble: (id) => unbubble(id),
				})
			: null);

	const one = () => !!(window.LGChatOne && window.LGChatOne.on());

	window.addEventListener("lg-chatone-on", () => {
		if (S && S.el) window.LGChatOne.dock("city", S.el);
	});
	const chatInit = () => {
		if (one()) {
			if (S) window.LGChatOne.dock("city", S.el);
			return;
		}
		const c = CH();
		if (c) c.init();
	};
	const chatEnter = (r) => {
		if (one()) {
			window.LGChatOne.enterFeed("city", r);
			return;
		}
		const c = CH();
		if (c) c.enter(r);
	};

	const chatApply = (d) => {
		if (one()) return;
		const c = CH();
		if (c) c.apply(d);
	};
	const tentMine = () => {
		const me = String((X && X.login && X.login()) || "").toLowerCase();
		return !!me && me === chanLogin();
	};
	const chanLogin = () => {
		const m0 = /\/c\/([\w]+)/.exec(location.pathname);
		return m0 ? m0[1].toLowerCase() : "";
	};

	function bubble(l, t, id) {
		const w = l === X.login() ? S.me : S.hidden ? null : S.others.get(l);
		if (!w || w.cull) return;
		if (!w.bub) {
			w.bub = document.createElement("div");
			w.bub.className = "cy-bub";
			w.bub.setAttribute("aria-hidden", "true");
			w.bub.innerHTML = "<span></span>";
			S.cam.appendChild(w.bub);
		}

		const tt = [...t].length > 90 ? [...t].slice(0, 89).join("") + "…" : t,
			C7 = window.LGChat;
		w.bub.dataset.id = id;
		if (C7 && C7.emoFill) C7.emoFill(w.bub.firstChild, tt);
		else w.bub.firstChild.textContent = tt;
		place(w);
		clearTimeout(w.bubT);
		w.bubT = setTimeout(
			() => {
				if (w.bub) {
					w.bub.remove();
					w.bub = null;
				}
			},
			Math.min(9000, 4000 + t.length * 50),
		);
	}
	function unbubble(id) {
		for (const w of [S.me, ...S.others.values()])
			if (w && w.bub && w.bub.dataset.id === id) {
				w.bub.remove();
				w.bub = null;
			}
	}

	function remember(d) {
		const now = Date.now();
		for (const l of d.g || []) S.ghosts.delete(l);
		for (const e of d.a || [])
			if (e.l !== X.login())
				S.ghosts.set(e.l, { e: { ...e }, at: now - (+e.dt || 0) });
		for (const m of d.m || []) {
			const g = S.ghosts.get(m[0]);
			if (g) {
				Object.assign(g.e, { x: m[1], y: m[2], tx: m[3], ty: m[4] });
				g.at = now - (+m[5] || 0);
			}
		}
	}
	function setHidden(on) {
		if (!S || S.hidden === on) return;
		S.hidden = on;
		hideSet(on);
		if (on) {
			const now = Date.now();
			for (const [l, w] of S.others) {
				const end = w.path ? w.path[w.path.length - 1] : [w.x, w.y];
				S.ghosts.set(l, {
					e: { ...w.v, l, x: w.x, y: w.y, tx: end[0], ty: end[1] },
					at: now,
				});
				drop(w);
			}
			S.others.clear();
			if (S.gl) S.gl.dirty();
		} else {
			const now = Date.now(),
				a = [...S.ghosts.values()].map((g) => ({
					...g.e,
					dt: Math.max(0, now - g.at),
				}));
			S.ghosts.clear();
			apply({ a });
		}
		othBtn();
		hud();
		kick();
	}

	const frOk = () => !!(window.LGFriends && window.LGFriends.friends);
	const frOn = () => !!(S && S.onlyFr && frOk());

	const glTag = () => {
		const h = X && X.hero && X.hero();
		return h && h.gt
			? String(h.gt)
			: S && S.me && S.me.v && S.me.v.gt
				? String(S.me.v.gt)
				: "";
	};
	const glOk = () => !!glTag() && !!(X && X.hero && X.hero() && X.hero().go);
	const glOn = () => !!(S && S.onlyGl && glOk());
	const capCur = () => (frOn() ? "fr" : glOn() ? "gl" : String(S.capV || 0));
	const capName = (v) =>
		v === "fr" ? "друзей" : v === "gl" ? "гильдию" : v === "0" ? "всех" : v;
	function capOpts() {
		return [{ v: "0", t: "Всех", s: "сколько потянет устройство" }]
			.concat(
				frOk()
					? [{ v: "fr", t: "Только друзей", s: "остальных не видно" }]
					: [],
			)
			.concat(
				glOk()
					? [{ v: "gl", t: "Только гильдию", s: "игроков твоей гильдии" }]
					: [],
			)
			.concat(
				[50, 25, 10, 5].map((n) => ({ v: String(n), t: String(n), n: true })),
			);
	}
	function capBtn() {
		const b = S && S.el.querySelector(".cy-cap");
		if (!b) return;
		b.querySelector(".cy-capv").textContent = capName(capCur());
		b.onclick = () => capMenu(b.getAttribute("aria-expanded") !== "true");
		b.onkeydown = (e) => {
			if (e.key === "ArrowDown" || e.key === "ArrowUp") {
				e.preventDefault();
				capMenu(true);
			}
		};
		if (frOn()) frLoad(performance.now());
		froBtn();
	}
	function capMenu(on) {
		const b = S && S.el.querySelector(".cy-cap"),
			m = S && S.el.querySelector(".cy-capm");
		if (!b || !m) return;
		document.removeEventListener("pointerdown", capOut, true);
		b.setAttribute("aria-expanded", String(!!on));
		m.hidden = !on;
		if (!on) {
			m.innerHTML = "";
			return;
		}
		const cur = capCur(),
			o = capOpts();
		const opt = (x) =>
			`<button type="button" role="option" class="cy-capo${x.n ? " cy-capn" : ""}" data-cap="${x.v}" aria-selected="${x.v === cur}" tabindex="-1"${x.n ? ` aria-label="${x.t} ближайших"` : ""}>${x.n ? x.t : `<b>${x.t}</b><small>${x.s}</small>`}</button>`;
		m.innerHTML =
			o
				.filter((x) => !x.n)
				.map(opt)
				.join("") +
			`<p class="cy-caph" aria-hidden="true">Ближайших:</p><div class="cy-capr" role="group" aria-label="Ближайших игроков">${o
				.filter((x) => x.n)
				.map(opt)
				.join("")}</div>`;
		const all = [...m.querySelectorAll("[data-cap]")];
		for (const x of all) x.onclick = () => capPick(x.dataset.cap);
		m.onkeydown = (e) => {
			const i = all.indexOf(document.activeElement),
				d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
			if (e.key === "Escape") {
				e.preventDefault();
				e.stopPropagation();
				capMenu(false);
				b.focus({ preventScroll: true });
			} else if (d) {
				e.preventDefault();
				e.stopPropagation();
				all[(i + d + all.length) % all.length].focus({ preventScroll: true });
			} else if (e.key === "Home" || e.key === "End") {
				e.preventDefault();
				all[e.key === "Home" ? 0 : all.length - 1].focus({
					preventScroll: true,
				});
			} else if (e.key === "Tab") capMenu(false);
		};
		(all.find((x) => x.dataset.cap === cur) || all[0]).focus({
			preventScroll: true,
		});
		document.addEventListener("pointerdown", capOut, true);
	}
	function capOut(e) {
		if (e.target && e.target.closest && e.target.closest(".cy-capl")) return;
		document.removeEventListener("pointerdown", capOut, true);
		if (S) capMenu(false);
	}
	function capPick(v) {
		if (!S) return;
		capMenu(false);
		S.onlyFr = v === "fr";
		S.onlyGl = v === "gl";
		S.capV = S.onlyFr || S.onlyGl ? 0 : +v || 0;
		capSet(S.capV);
		frSet(S.onlyFr);
		glSet(S.onlyGl);
		const b = S.el.querySelector(".cy-cap");
		if (b) b.focus({ preventScroll: true });
		capBtn();
		lodPick(performance.now());
		if (S.gl) S.gl.dirty();
		hud();
		kick();
	}

	function frLoad(t) {
		if (!frOn()) return;
		S.frAt = t;
		window.LGFriends.friends()
			.then((ls) => {
				if (!S || !S.onlyFr) return;
				S.frs = new Set(ls);
				lodPick(performance.now());
			})
			.catch((e) => console.warn("[город] друзья для «Показывать»", e));
	}
	function othBtn() {
		const b = S.el.querySelector(".cy-others");
		if (!b) return;
		const t = S.hidden ? "Показать других игроков" : "Скрыть других игроков";
		b.setAttribute("aria-pressed", String(S.hidden));
		b.setAttribute("aria-label", t);
		b.classList.toggle("off", S.hidden);
		b.lastChild.textContent = t;
		froBtn();
	}

	function froBtn() {
		const b = S && S.el.querySelector(".cy-fro");
		if (!b) return;
		const on = frOn() && !S.hidden,
			t = on ? "Показать всех игроков" : "Скрыть всех, кроме друзей";
		b.setAttribute("aria-pressed", String(on));
		b.setAttribute("aria-label", t);
		b.classList.toggle("on", on);
		if (!b.classList.contains("said")) b.lastChild.textContent = t;
		S.el.classList.add("cy-wfro");
	}
	function froToggle() {
		if (!S) return;
		const on = !(frOn() && !S.hidden);
		if (on && S.hidden) setHidden(false);
		S.onlyFr = on;
		frSet(on);
		if (on && S.onlyGl) {
			S.onlyGl = false;
			glSet(false);
		}
		capBtn();
		lodPick(performance.now());
		if (S.gl) S.gl.dirty();
		hud();
		kick();
		return on;
	}

	const SUI = () => window.LGSiteUi || null;
	const heldMs = () => {
		const U = SUI();
		return U && U.hold ? U.hold.left() : 0;
	};
	const pollOk = () => !X.pollOk || X.pollOk();
	function timers(on) {
		if (!S) return;
		clearInterval(S.timer);
		S.timer = 0;
		if (!on) return;
		S.tick = 0;
		if (!S.pollB) {
			const U = SUI();
			S.pollB =
				U && U.backoff
					? U.backoff({ steps: U.POLL_STEPS, jitter: 0.5, up: true })
					: {
							next: () => 10000,
							peek: () => 10000,
							reset() {},
							fails: () => 0,
						};
		}
		S.pollAt = Date.now() + S.pollB.peek();
		S.timer = setInterval(async () => {
			if (!S || !S.inCity || document.hidden) return;
			S.tick++;
			if (heldMs()) return;
			if (!X.live() && pollOk() && Date.now() >= S.pollAt) {
				const B = S.pollB;
				S.pollAt = Date.now() + 60000;
				const r = await X.api(
					"/api/city/state" + (S.chat && S.chat.on ? "?c=" + S.chat.c : ""),
				);
				if (!S) return;
				if (r && r.ok) B.reset();
				else B.next();
				S.pollAt = Date.now() + Math.max(B.peek(), heldMs());
				if (qOut(r)) return;
				if (r && r.ok) apply(r);
				else if (r && /не в городе/.test(r.error || "")) {
					S.inCity = false;
					enter();
				}
			}

			if (S.tick % 10 === 0 && !X.live()) {
				if (pollOk()) jailLoad();
			} else if (S.tick % 20 === 0) {
				const r = await X.api("/api/city/ping", {});
				if (qOut(r)) return;
				if (r && r.ok === false && /не в городе/.test(r.error || "")) {
					S.inCity = false;
					enter();
				}
			}
		}, 3000);
	}

	function scenePt(cx, cy) {
		const r = S.view.getBoundingClientRect();
		return [S.camX + (cx - r.left) / S.z, S.camY + (cy - r.top) / S.z];
	}

	function awAt(x, y, pad) {
		return S.gl && S.gl.badgeAt ? S.gl.badgeAt(x, y, pad) : null;
	}
	function awShow(h) {
		if (!X.awPop) return;
		const r = S.view.getBoundingClientRect(),
			cx = r.left + (h.x - S.camX) * S.z,
			cy = r.top + (h.y - S.camY) * S.z,
			d = h.r * S.z + 2;
		X.awPop(
			h.a,
			{ left: cx - d, right: cx + d, top: cy - d, bottom: cy + d },
			"cy:" + h.l + ":" + h.i,
		);
	}

	function wheelOwn(e, v) {
		const t = e.target;
		if (!(t instanceof Element) || t === v || t.closest(".cy-cam"))
			return false;
		for (let n = t; n && n !== v; n = n.parentElement) {
			const cs = getComputedStyle(n);
			if (
				/(auto|scroll)/.test(cs.overflowY + cs.overflowX) &&
				(n.scrollHeight > n.clientHeight + 1 ||
					n.scrollWidth > n.clientWidth + 1)
			) {
				const atEnd =
					e.deltaY > 0
						? n.scrollTop + n.clientHeight >= n.scrollHeight - 1
						: e.deltaY < 0
							? n.scrollTop <= 0
							: false;
				if (atEnd) e.preventDefault();
				return true;
			}
		}
		if (t.closest(".cy-tp")) {
			e.preventDefault();
			return true;
		}
		return false;
	}

	function fishSeg(L, W, x, y) {
		if (!L || !L.canal) return null;
		const [c0, c1] = L.canal;
		if (y < c0 - 6 || y > c1 + 6 || x < 0 || x > W) return null;
		let x0 = 0,
			x1 = W;
		for (const [a, b] of L.bridges || []) {
			if (x >= a - 20 && x <= b + 20) return null;
			if (b < x) x0 = Math.max(x0, b + 20);
			else x1 = Math.min(x1, a - 20);
		}
		return { x0, x1, y0: c0 - 10, y1: c1 + 10 };
	}

	function fishPond(x, y) {
		const F = window.LGFairCats;
		if (!F || !F.POND || !F.inPoly) return null;
		const P = F.PIER;
		if (
			P &&
			((x >= P.x0 && x <= P.x1 && y >= P.y0 && y <= P.y1) ||
				(x >= P.end[0] && x <= P.end[2] && y >= P.end[1] && y <= P.end[3]))
		)
			return null;
		if (!F.inPoly(F.POND, x, y)) return null;
		const xs = F.POND.map((p) => p[0]),
			ys = F.POND.map((p) => p[1]);
		return {
			x0: Math.min(...xs),
			x1: Math.max(...xs),
			y0: Math.min(...ys),
			y1: Math.max(...ys),
			poly: F.POND,
			go: P ? [(P.end[0] + P.end[2]) / 2, (P.end[1] + P.end[3]) / 2] : null,
		};
	}
	function fishWater(x, y) {
		if (isCamp() || meJail() || !window.LGFish2On || !window.LGFish2On())
			return null;
		if (S.cats) return S.kit ? null : fishPond(x, y);
		if (inTown()) return null;
		return fishSeg(WD.LOW, WD.W, x, y);
	}

	const fishHov = (g) => ({
		id: "fish",
		ol: "fish",
		seg: g,
		r: [g.x0, g.x1, g.y0, g.y1],
		tip: "Озерцо - рыбалка",
	});
	function fishGo(x, g) {
		const L = WD.LOW,
			open = () => {
				if (window.LGOpenFish2) window.LGOpenFish2();
			};
		if (!S.me) {
			open();
			return;
		}
		const end =
			g && g.go
				? walkTo(S.me, g.go[0], g.go[1])
				: walkTo(S.me, x, L.canal[0] - 34);
		sendGo(end[0], end[1]);
		closePanel();
		if (!S.me.path) open();
		else S.arrive = open;
	}

	function fishNear() {
		if (
			!S ||
			!S.me ||
			isCamp() ||
			meJail() ||
			!window.LGFish2On ||
			!window.LGFish2On()
		)
			return false;
		if (S.cats) {
			const F = window.LGFairCats,
				P = F && F.PIER;
			if (S.kit || !P || !P.end) return false;
			fishGo(0, { go: [(P.end[0] + P.end[2]) / 2, (P.end[1] + P.end[3]) / 2] });
			return true;
		}
		if (inTown()) return false;
		const L = WD.LOW,
			yc = L && L.canal ? (L.canal[0] + L.canal[1]) / 2 : 0;
		if (!yc) return false;
		for (let d = 0; d <= WD.W; d += 20)
			for (const x of d ? [S.me.x - d, S.me.x + d] : [S.me.x]) {
				const g = fishSeg(L, WD.W, x, yc);
				if (g) {
					fishGo(x, g);
					return true;
				}
			}
		return false;
	}
	function bindInput() {
		const v = S.view;

		const fingers = new Map();

		const pinchOf = (r0) => {
			const [a, b] = [...fingers.values()],
				r = r0 || v.getBoundingClientRect();
			return {
				r,
				d: Math.max(10, Math.hypot(a.x - b.x, a.y - b.y)),
				mx: (a.x + b.x) / 2 - r.left,
				my: (a.y + b.y) / 2 - r.top,
			};
		};
		v.addEventListener("pointerdown", (e) => {
			if (
				e.pointerType === "touch" &&
				!e.target.closest("button, .awb, .cy-capl")
			) {
				fingers.set(e.pointerId, { x: e.clientX, y: e.clientY });
				if (fingers.size === 2) {
					const q = pinchOf();
					S.pinch = { d0: q.d, z0: S.z, mx: q.mx, my: q.my, r: q.r };
					S.drag = null;
					v.classList.remove("cy-dragging");
					return;
				}
				if (fingers.size > 2) return;
			}
			if (
				(e.button !== 0 && e.button !== 2) ||
				e.target.closest("button, .awb, .cy-capl")
			)
				return;
			S.drag = {
				id: e.pointerId,
				x: e.clientX,
				y: e.clientY,
				cam: S.camX,
				camY: S.camY,
				moved: false,
			};
		});
		const unfinger = (e) => {
			if (!fingers.delete(e.pointerId)) return;
			if (fingers.size < 2 && S.pinch) {
				S.pinch = null;
				S.drag = null;
			}
		};
		v.addEventListener("pointerup", unfinger);
		v.addEventListener("pointercancel", unfinger);
		v.addEventListener("pointermove", (e) => {
			if (fingers.has(e.pointerId)) {
				fingers.set(e.pointerId, { x: e.clientX, y: e.clientY });
				if (S.pinch && fingers.size === 2) {
					const P = S.pinch,
						q = pinchOf(P.r);
					S.camX += (P.mx - q.mx) / S.z;
					S.camY += (P.my - q.my) / S.z;
					P.mx = q.mx;
					P.my = q.my;
					zoomTo((P.z0 * q.d) / P.d0, q.mx, q.my);
					clampCam();
					applyCam();
					return;
				}
			}
			const d = S.drag;
			if (!d || d.id !== e.pointerId) return;
			const dx = e.clientX - d.x,
				dy = e.clientY - d.y;
			if (!d.moved && Math.hypot(dx, dy) > 6) {
				d.moved = true;
				try {
					v.setPointerCapture(e.pointerId);
				} catch {}
				v.classList.add("cy-dragging");
			}
			if (d.moved) {
				S.glide = null;
				S.camX = d.cam - dx / S.z;
				S.camY = d.camY - dy / S.z;
				clampCam();
				applyCam();
				S.camFree = true;
			}
		});
		const up = (e) => {
			const d = S.drag;
			if (!d || d.id !== e.pointerId) return;
			S.drag = null;
			v.classList.remove("cy-dragging");
			if (d.moved || e.type === "pointercancel") return;
			const [x, y] = scenePt(e.clientX, e.clientY);
			const ab =
				e.button === 0 ? awAt(x, y, e.pointerType === "mouse" ? 3 : 8) : null;
			if (ab) {
				awShow(ab);
				return;
			}

			if (meJail()) {
				if (inCage(x, y)) {
					jailGo(x, y);
					return;
				}
				const bj = S.map.hoverAt(x, y);
				if (bj && bj.id === "jail") jwOpen();
				else jailGo(x, y);
				return;
			}
			if (jailAt(x, y)) {
				jwOpen();
				return;
			}

			const wh =
				window.LGTrade &&
				((X.hero() && X.hero().tr) ||
					window.LGFriends ||
					(window.LGCityMon &&
						window.LGCityMon.groupOn &&
						window.LGCityMon.groupOn())) &&
				(e.pointerType !== "mouse" || e.button === 2)
					? walkerAt(x, y)
					: null;
			if (wh) {
				window.LGTrade.mount(X, S.el);
				window.LGTrade.menu(wh.l, wh.v, e.clientX, e.clientY);
				return;
			}
			const fw = !S.map.hoverAt(x, y) && fishWater(x, y);
			if (fw) {
				if (e.pointerType !== "mouse") {
					S.touch = true;
					hover(fishHov(fw), x, fw.y0);
					clearTimeout(S.hovT);
					S.hovT = setTimeout(() => hover(null), 1300);
				}
				fishGo(x, fw);
				return;
			}
			const b = S.map.hoverAt(x, y);

			if (b) {
				if (e.pointerType !== "mouse") {
					S.touch = true;
					hover(b, x, y);
					clearTimeout(S.hovT);
					S.hovT = setTimeout(() => hover(null), 1300);
				}
				goBuilding(b.id);
			} else goPoint(x, y);
		};

		v.addEventListener("pointermove", (e) => {
			if (e.pointerType !== "mouse" || (S.drag && S.drag.moved) || S.panelId)
				return;
			const [x, y] = scenePt(e.clientX, e.clientY);
			S.touch = false;

			const ab = awAt(x, y, 3),
				k = ab ? "cy:" + ab.l + ":" + ab.i : "";
			if (k !== (S.awK || "")) {
				S.awK = k;
				v.style.cursor = ab ? "help" : "";
				if (ab) awShow(ab);
				else if (X.awHide) X.awHide("cy:");
			}
			if (ab) {
				hover(null);
				return;
			}

			if (meJail() && inCage(x, y) && !jailAt(x, y)) {
				hover(null);
				return;
			}

			{
				const jw = jailAt(x, y);
				if (jw) {
					const J = WD.LOW.jail;
					hover(
						{
							id: "jail",
							ol: "jail",
							r: [J.c0, J.c1, J.ct - 50, J.fy],
							tip: `${jw.v.n || jw.l} - в тюрьме канала`,
						},
						x,
						jw.y - 150 * scaleAt(jw.y) * HS,
					);
					return;
				}
			}
			{
				const hb = S.map.hoverAt(x, y),
					fw = !hb && fishWater(x, y);
				if (fw) {
					hover(fishHov(fw), x, fw.y0);
					return;
				}
				hover(hb, x, y);
			}
		});
		v.addEventListener("pointerleave", (e) => {
			if (e.pointerType === "mouse") {
				hover(null);
				if (S.awK) {
					S.awK = "";
					v.style.cursor = "";
					if (X.awHide) X.awHide("cy:");
				}
			}
		});
		v.addEventListener("pointerup", up);
		v.addEventListener("pointercancel", up);

		v.addEventListener("contextmenu", (e) => {
			if (e.target.closest("input, textarea, a, [contenteditable]")) return;
			e.preventDefault();
		});

		v.addEventListener(
			"wheel",
			(e) => {
				if (wheelOwn(e, v) || e.target.closest(WHEEL_OWN)) return;
				e.preventDefault();
				S.glide = null;
				const r = v.getBoundingClientRect(),
					mx = e.clientX - r.left,
					my = e.clientY - r.top;
				if (e.ctrlKey || e.metaKey) {
					zoomTo(
						S.z * Math.exp(-Math.max(-60, Math.min(60, e.deltaY)) * 0.01),
						mx,
						my,
					);
					return;
				}
				if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
					const dx = e.shiftKey ? e.deltaY || e.deltaX : e.deltaX;
					S.camX += dx / S.z;
					clampCam();
					applyCam();
					S.camFree = true;
					return;
				}
				const dy =
					e.deltaY * (e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? 400 : 1);
				zoomTo(
					S.z * Math.exp(-Math.max(-120, Math.min(120, dy)) * 0.0018),
					mx,
					my,
				);
			},
			{ passive: false },
		);
		v.addEventListener("keydown", (e) => {
			if (
				e.target.closest &&
				e.target.closest("select, input, textarea, .cy-capl")
			)
				return;
			if (e.key === "+" || e.key === "=" || e.key === "-" || e.key === "_") {
				e.preventDefault();
				zoomTo(S.z * (e.key === "+" || e.key === "=" ? 1.25 : 0.8));
				return;
			}
			const k = {
				ArrowLeft: [-1, 0],
				ArrowRight: [1, 0],
				ArrowUp: [0, -1],
				ArrowDown: [0, 1],
			}[e.key];
			if (k) {
				e.preventDefault();
				pan(k[0], k[1]);
			}
		});
		S.el.addEventListener("click", (e) => {
			if (e.target.closest(".cy-fr")) {
				if (window.LGFriends) window.LGFriends.open();
				return;
			}

			if (e.target.closest(".cy-fro")) {
				const on = froToggle(),
					fb = S.el.querySelector(".cy-fro");
				fb.lastChild.textContent = on
					? "Видно только друзей"
					: "Видно всех игроков";
				fb.classList.add("said");
				clearTimeout(S.froT);
				S.froT = setTimeout(() => {
					if (S) {
						fb.classList.remove("said");
						froBtn();
					}
				}, 1600);
				return;
			}
			if (e.target.closest(".cy-others")) {
				setHidden(!S.hidden);
				const ob = S.el.querySelector(".cy-others");
				ob.lastChild.textContent = S.hidden
					? "Другие игроки скрыты"
					: "Другие игроки видны";
				ob.classList.add("said");
				clearTimeout(S.othT);
				S.othT = setTimeout(() => {
					if (S) {
						ob.classList.remove("said");
						othBtn();
					}
				}, 1600);
				return;
			}
			const zb = e.target.closest("[data-zoom]");
			if (zb) {
				zoomTo(S.z * (+zb.dataset.zoom > 0 ? 1.25 : 0.8));
				return;
			}
			const p = e.target.closest("[data-pan], [data-pany]");
			if (p) {
				pan(+(p.dataset.pan || 0), +(p.dataset.pany || 0));
				return;
			}
			const b = e.target.closest("[data-b]");
			if (b && !e.target.closest(".cy-room")) {
				goBuilding(b.dataset.b);
			}
		});
	}

	function walkerAt(x, y) {
		if (S.hidden) return null;
		let best = null;
		for (const w of S.others.values()) {
			if (w.cull) continue;
			const sc = scaleAt(w.y) * HS;
			if (
				Math.abs(x - w.x) <= 36 * sc &&
				y <= w.y + 8 &&
				y >= w.y - 150 * sc &&
				(!best || w.y > best.y)
			)
				best = w;
		}
		return best;
	}

	const ACT = {
		tavern: "еда, кости, силачи, Гвинт",
		guild: "зал своей гильдии",
		mineboard: "кто копает лучше всех",
		magic: "посохи, мантии, амулеты",
		anvil: "наточить оружие",
		forge: "лавка кузнеца",
		tent: "примерить облик",
		shop: "еда, зелья, материалы",
		trainer: "дерево навыков",
		board: "новости игры",
		gate: "в поход — только на стриме",
		hall: "скоро: оборона города",
		auction: "торговля между игроками",
		storage: "хранение вещей",
		mine: "промысел: руда",
	};
	function hover(t, x, y) {
		const key = t ? t.id + "|" + t.r.join(",") + (t.tip || "") : "";
		if (!S || key === (S.hovK || "")) return;
		S.hovK = key;
		const box = S.el.querySelector(".cy-hov");
		if (!box) return;
		S.view.classList.toggle("hov", !!t);
		outline(t);
		if (!t) {
			box.classList.remove("on");
			return;
		}
		const B = WD.BUILDINGS.find((b) => b.id === t.id) || {},
			[x0, x1, y0] = t.r,
			top = Math.max(y0, S.camY + 20);
		const tip = box.lastChild;
		tip.textContent = t.tip
			? t.tip
			: `${t.what ? t.what + " · " : ""}${titleOf(B)} — ${(t.id === "auction" || t.id === "storage" || t.id === "mine" || t.id === "guild") && soonB(B) ? "скоро: " + (ACT[t.id] || B.sub || "") : ACT[t.id] || B.sub || ""}`;
		tip.style.cssText = `left:${x != null ? x : (x0 + x1) / 2}px;top:${(y != null ? y : top) - 26 / S.z}px`;
		box.classList.add("on");
	}

	function outline(t) {
		const id = t ? t.ol || t.id : "";
		S.olWant = id;
		if (!id || !S.ol) {
			olShow(null);
			return;
		}

		const k = Math.min(
			S.touch ? 1.3 : 2.5,
			Math.max(0.3, S.z * Math.min(4, window.devicePixelRatio || 1)),
		);

		if (t.seg) {
			const g = t.seg,
				sid = `fish:${g.x0}`;
			S.olWant = sid;
			if (!S.ol.shape) {
				olShow(null);
				return;
			}
			const fig = g.poly
				? `<path d="M${g.poly.map((p) => p.join(" ")).join(" L")} Z" fill="#000"/>`
				: `<rect x="${g.x0}" y="${g.y0}" width="${g.x1 - g.x0}" height="${g.y1 - g.y0}" rx="16" fill="#000"/>`;
			S.ol.shape(sid, fig, [g.x0, g.y0, g.x1, g.y1], k, S.z).then((e) => {
				if (S && S.olWant === sid && !S.panelId) olShow(e);
			});
			return;
		}
		S.ol.bake(id, k, S.z).then((e) => {
			if (S && S.olWant === id && !S.panelId) olShow(e);
		});
	}
	function olShow(e) {
		if (S.gl) {
			if (S.gl.outline) {
				S.gl.outline(e);
				kick();
			}
			return;
		}
		const box = S.el.querySelector(".cy-ols");
		if (!box) return;
		for (const c of box.children)
			if (c !== (e && e.c)) {
				c.classList.remove("on");
				setTimeout(() => {
					if (!c.classList.contains("on")) c.remove();
				}, 200);
			}
		if (!e) return;
		const c = e.c;
		if (c.parentNode !== box) {
			c.style.cssText = `left:${e.x}px;top:${e.y}px;width:${c.width / e.k}px;height:${c.height / e.k}px`;
			box.appendChild(c);
			void c.offsetWidth;
		}
		c.classList.add("on");
	}

	function olWarm() {
		if (!S || !S.ol || !window.LGSiteUi.is("hover")) return;
		const s = S,
			go = () => {
				if (S === s)
					try {
						s.ol.prep();
					} catch {}
			};
		setTimeout(
			() =>
				window.requestIdleCallback
					? requestIdleCallback(go, { timeout: 4000 })
					: go(),
			2500,
		);
	}
	function pan(dir, dy = 0) {
		const x0 = S.camX,
			y0 = S.camY;
		S.camX += dir * viewW() * 0.6;
		S.camY += dy * viewH() * 0.6;
		clampCam();
		S.camFree = true;
		if (S.gl) {
			S.glide = { x0, y0, x1: S.camX, y1: S.camY, t0: performance.now() };
			S.camX = x0;
			S.camY = y0;
			kick();
			return;
		}
		S.cam.classList.add("glide");
		applyCam();
		setTimeout(() => S && S.cam.classList.remove("glide"), 420);
	}
	function goPoint(x, y) {
		if (!S.me) return;
		if (meJail()) {
			jailGo(x, y);
			return;
		}
		closePanel();
		S.el.classList.add("went");
		S.arrive = null;
		S.camFree = false;
		const end = walkTo(S.me, x, y);
		sendGo(end[0], end[1]);
		ripple(end[0], end[1]);
	}
	function goBuilding(id) {
		if (id === "jail") {
			jwOpen();
			return;
		}

		if (meJail()) return;
		const B = WD.BUILDINGS.find((b) => b.id === id);
		if (!B || !bOk(B) || !S.me) return;
		S.camFree = false;
		if (id === "mine") {
			const end = walkTo(S.me, B.door.x, B.door.y);
			sendGo(end[0], end[1]);
			closePanel();
			if (!S.me.path) mineOpen();
			else S.arrive = mineOpen;
			return;
		}

		if (id === "guild") {
			const end = walkTo(S.me, B.door.x, B.door.y);
			sendGo(end[0], end[1]);
			closePanel();
			if (!S.me.path) ghOpen();
			else S.arrive = ghOpen;
			return;
		}

		if (id === "tavern") {
			const end = walkTo(S.me, B.door.x, B.door.y);
			sendGo(end[0], end[1]);
			closePanel();
			if (!S.me.path) tvOpen();
			else S.arrive = tvOpen;
			return;
		}

		const bm = buildSay(B);
		if (bm) {
			closePanel();
			const end = walkTo(S.me, B.door.x, B.door.y);
			sendGo(end[0], end[1]);
			S.arrive = null;
			hud(bm);
			if (X.toast) X.toast(bm);
			clearTimeout(S.bmT);
			S.bmT = setTimeout(() => S && hud(), 4000);
			return;
		}
		const end = walkTo(S.me, B.door.x, B.door.y);
		sendGo(end[0], end[1]);
		if (!S.me.path) openPanel(id);
		else {
			closePanel();
			S.arrive = () => openPanel(id);
		}
	}

	const KW = { KeyW: [0, -1], KeyA: [-1, 0], KeyS: [0, 1], KeyD: [1, 0] };
	const KW_GO = 800,
		KW_STOP = 750,
		KW_DOOR = 120;
	const kwOn = () => !!(X && X.hero() && X.hero().kw);

	const KW_DLG = '[role="dialog"], [role="alertdialog"], [aria-modal="true"]';
	const KW_FIELD =
		'input, textarea, select, [contenteditable]:not([contenteditable="false"])';
	function kwSeen(d) {
		if (!d.isConnected || !d.getClientRects().length) return false;

		if (typeof d.checkVisibility === "function") {
			if (
				!d.checkVisibility({ opacityProperty: true, visibilityProperty: true })
			)
				return false;
		} else {
			const cs = getComputedStyle(d);
			if (cs.visibility === "hidden" || +cs.opacity === 0) return false;
		}
		const r = d.getBoundingClientRect();
		return (
			r.width > 1 &&
			r.height > 1 &&
			r.right > 0 &&
			r.bottom > 0 &&
			r.left < innerWidth &&
			r.top < innerHeight
		);
	}
	function kwModal(d) {
		if (S && d === S.room) return false;
		if (d.getAttribute("aria-modal") === "false" || !kwSeen(d)) return false;
		if (d.getAttribute("aria-modal") === "true") return true;

		const r = d.getBoundingClientRect();
		return r.width >= innerWidth * 0.9 && r.height >= innerHeight * 0.9;
	}
	const kwModalOpen = () => {
		for (const d of document.querySelectorAll(KW_DLG))
			if (kwModal(d)) return true;
		return false;
	};
	function kwBusy(e) {
		if (
			!S ||
			!S.me ||
			!S.root ||
			!S.root.isConnected ||
			!S.root.classList.contains("on") ||
			S.panelId ||
			document.hidden
		)
			return true;
		if (e && (e.ctrlKey || e.metaKey || e.altKey)) return true;
		const t = e && e.target;
		if (t && t.closest && (t.closest(KW_FIELD) || t.isContentEditable))
			return true;
		return kwModalOpen();
	}

	function kwNear() {
		if (!S || !S.me || meJail()) return null;
		let best = null,
			bd = KW_DOOR;
		for (const b of WD.BUILDINGS) {
			if (!b.door || !bOk(b)) continue;
			const d = Math.hypot(b.door.x - S.me.x, b.door.y - S.me.y);
			if (d <= bd) {
				bd = d;
				best = b;
			}
		}
		return best;
	}

	function kwHint() {
		if (!S || !S.cam) return;
		const b = S.kbd && !S.panelId ? kwNear() : null,
			id = b ? b.id : "";
		if (id === (S.ehK || "")) return;
		S.ehK = id;
		let el = S.cam.querySelector(".cy-ekey");
		if (!el) {
			el = document.createElement("div");
			el.className = "cy-ekey";
			el.setAttribute("aria-hidden", "true");
			el.innerHTML = "<kbd>E</kbd> - войти";
			S.cam.appendChild(el);
		}
		if (b)
			el.style.transform = `translate(${Math.round(b.door.x)}px,${Math.round(b.door.y)}px) translate(-50%, 40px)`;
		el.classList.toggle("on", !!b);
	}

	function kwStep(dt) {
		const k = S.kw,
			w = S.me;
		if (!w || S.panelId) {
			kwHalt();
			return false;
		}
		let dx = 0,
			dy = 0;
		for (const c of k.keys) {
			const v = KW[c];
			if (v) {
				dx += v[0];
				dy += v[1];
			}
		}
		const len = Math.hypot(dx, dy);
		if (!len) {
			setMoving(w, false);
			return true;
		}
		const s = SP() * dt,
			vx = (dx / len) * s,
			vy = (dy / len) * s,
			x = w.x,
			y = w.y;

		const jl = !!meJail();
		const ok = (a, b) => S.map.free(a, b) && S.map.clear([x, y], [a, b]);
		let nx = x,
			ny = y;
		if (jl) [nx, ny] = jailWalk(x + vx, y + vy);
		else if (ok(x + vx, y + vy)) {
			nx = x + vx;
			ny = y + vy;
		} else if (vx && ok(x + vx, y)) nx = x + vx;
		else if (vy && ok(x, y + vy)) ny = y + vy;
		w.path = null;
		w.lag = 0;
		S.arrive = null;
		if (nx !== x || ny !== y) {
			if (nx !== x) w.face = nx < x ? 1 : -1;
			w.x = nx;
			w.y = ny;
			k.dirty = true;
			setMoving(w, true);
			place(w);
			w.shown = true;
			kwSync(false);
			kwHint();
		} else setMoving(w, false);
		return true;
	}
	function kwHalt() {
		if (!S || !S.kw) return;
		const k = S.kw;
		k.keys.clear();
		if (!k.on) return;
		k.on = false;
		if (S.me && !S.me.path) setMoving(S.me, false);
		kwSync(true);
		kwHint();
	}

	function kwSync(stop) {
		const k = S && S.kw;
		if (!k || !k.dirty || !S.me) return;

		if (meJail()) {
			k.dirty = false;
			return;
		}
		const wait = (stop ? KW_STOP : KW_GO) - (Date.now() - k.at);
		if (wait > 0) {
			if (stop && !k.t)
				k.t = setTimeout(() => {
					k.t = 0;
					if (S && S.kw === k && !k.on) kwSync(true);
				}, wait);
			return;
		}
		clearTimeout(k.t);
		k.t = 0;
		const from = k.last,
			x = Math.round(S.me.x),
			y = Math.round(S.me.y);
		k.last = [x, y];
		k.at = Date.now();
		k.dirty = false;
		sendGo(x, y, from);
	}

	const kwStreet = () =>
		!!(
			S &&
			S.root &&
			S.root.isConnected &&
			S.root.classList.contains("on") &&
			!S.panelId &&
			!document.hidden
		);
	const kwField = (el) =>
		!!(el && el.matches && el.matches("input, textarea, [contenteditable]"));

	document.addEventListener("lg-chat-sent", (e) => {
		if (e.detail && e.detail.empty && kwOn() && kwStreet() && kwField(e.target))
			e.target.blur();
	});

	document.addEventListener(
		"pointerdown",
		(e) => {
			if (!kwOn() || !kwStreet() || !S.root.contains(e.target)) return;
			const t = e.target;
			if (
				t.closest &&
				t.closest(
					`.cy-chat, ${KW_FIELD}, ${KW_DLG}, [role="menu"], [role="listbox"]`,
				)
			)
				return;
			const a = document.activeElement;
			if (kwField(a)) a.blur();
		},
		true,
	);

	const kwCtl = (t) =>
		!!(
			t &&
			t !== document.body &&
			t !== document.documentElement &&
			(!S || t !== S.view) &&
			t.closest &&
			t.closest(
				'button, a[href], summary, [role="button"], [role="tab"], [role="option"], [role="menuitem"], [role="checkbox"], [role="switch"]',
			)
		);
	document.addEventListener("keydown", (e) => {
		if (
			e.key !== "Enter" ||
			e.shiftKey ||
			e.altKey ||
			e.ctrlKey ||
			e.metaKey ||
			e.repeat ||
			!kwOn() ||
			kwCtl(e.target) ||
			kwBusy(e)
		)
			return;
		const f = [...document.querySelectorAll(".cy-chat-f input")].find(
			(x) => x.getClientRects().length && !x.disabled,
		);
		if (f) {
			e.preventDefault();
			f.focus();
		}
	});
	function kwDown(e) {
		const v = KW[e.code];
		if ((!v && e.code !== "KeyE") || !kwOn() || kwBusy(e)) return;
		e.preventDefault();
		S.kbd = true;
		if (e.code === "KeyE") {
			if (e.repeat || meJail()) return;
			const b = kwNear();
			if (b) goBuilding(b.id);
			return;
		}
		const k = S.kw;
		if (!k.on) {
			k.on = true;
			S.me.path = null;
			S.me.lag = 0;
			S.arrive = null;
			S.camFree = false;
			if (!k.dirty) k.last = [Math.round(S.me.x), Math.round(S.me.y)];
			S.el.classList.add("went");
		}
		k.keys.add(e.code);
		kick();
	}
	function kwUp(e) {
		if (!S || !S.kw || !KW[e.code]) return;
		S.kw.keys.delete(e.code);
		if (!S.kw.keys.size) kwHalt();
	}
	document.addEventListener("keydown", kwDown);
	document.addEventListener("keyup", kwUp);

	window.addEventListener("blur", () => kwHalt());
	document.addEventListener("visibilitychange", () => {
		if (document.hidden) kwHalt();
	});

	const ESC_WIN =
		'[role="dialog"], [role="alertdialog"], [aria-modal="true"], [role="menu"], [role="listbox"], .detail.open';

	const ESC_X =
		'[data-cyexit], [data-jw-x], .cy-tpx, [data-x], [data-no], [data-cancel], button[data-close], button[data-fclose], .gl-x, .gd-x, .mn-win-x, .gu-wx, button[aria-label="Закрыть"]';
	const ESC_TOK = ["open", "on", "in", "show", "active"];

	function escPlan(st) {
		if (st.own || st.done) return "";
		if (st.field) return "blur";
		if (st.win) return "win";
		return st.pid ? "exit" : "";
	}
	const escOn = () =>
		!!(
			S &&
			S.root &&
			S.root.isConnected &&
			S.root.classList.contains("on") &&
			!document.hidden
		);
	function escOwn() {
		try {
			const G = window.LGGameUi;
			if (G && typeof G.open === "function" && G.open()) return true;
		} catch (e) {}
		for (const d of document.querySelectorAll(
			"#gu-hud .gu-pop:not([hidden]), .mn",
		))
			if (kwSeen(d)) return true;
		return false;
	}

	function escWins() {
		const out = [];
		for (const d of document.querySelectorAll(ESC_WIN))
			if (!(S && d === S.room) && kwSeen(d)) out.push(d);
		return out.reverse();
	}
	function escClose(d) {
		if (d.matches(".cy-tp")) {
			townPick(false);
			return true;
		}
		if (d.matches(".cy-capm")) {
			capMenu(false);
			try {
				S.el.querySelector(".cy-cap").focus({ preventScroll: true });
			} catch (e) {}
			return true;
		}
		if (S && S.jw && (d === S.jw || S.jw.contains(d))) {
			jwClose();
			return true;
		}
		if (d.matches(".cyf-bpick")) {
			const b = S && S.panel && S.panel.querySelector("[data-anvboost]");
			if (b) {
				b.click();
				return true;
			}
			return false;
		}
		const x = [...d.querySelectorAll(ESC_X)].find(
			(b) =>
				!b.disabled && b.getClientRects().length && b.closest(ESC_WIN) === d,
		);
		if (x) {
			x.click();
			return true;
		}
		return false;
	}

	function escDone(recs) {
		for (const r of recs) {
			if (r.type === "childList") {
				for (const n of r.removedNodes) if (n.nodeType === 1) return true;
				continue;
			}
			const t = r.target,
				a = r.attributeName;
			if (a === "hidden" && r.oldValue === null && t.hasAttribute("hidden"))
				return true;
			if (
				a === "aria-expanded" &&
				r.oldValue === "true" &&
				t.getAttribute("aria-expanded") !== "true"
			)
				return true;
			if (a === "class" && r.oldValue) {
				const was = r.oldValue.split(/\s+/);
				if (ESC_TOK.some((k) => was.includes(k) && !t.classList.contains(k)))
					return true;
			}
		}
		return false;
	}
	let ESC = null;
	function escStop() {
		const st = ESC;
		ESC = null;
		if (st) {
			try {
				st.mo.disconnect();
			} catch (e) {}
		}
		return st;
	}
	window.addEventListener(
		"keydown",
		(e) => {
			escStop();
			if (e.key !== "Escape" || e.repeat || e.isComposing || !escOn()) return;
			const recs = [];
			const mo = new MutationObserver((rs) => {
				recs.push(...rs);
			});
			mo.observe(document.body, {
				subtree: true,
				childList: true,
				attributes: true,
				attributeOldValue: true,
				attributeFilter: ["hidden", "class", "aria-expanded"],
			});
			ESC = { e, mo, recs, own: escOwn(), wins: escWins(), pid: S.panelId };
			setTimeout(() => {
				if (ESC && ESC.e === e) escStop();
			}, 0);
		},
		true,
	);
	window.addEventListener("keydown", (e) => {
		if (!ESC || ESC.e !== e) return;
		const st = ESC;
		st.recs.push(...st.mo.takeRecords());
		escStop();
		if (!escOn()) return;
		const t = e.target,
			field = !!(
				t &&
				t.closest &&
				(t.closest(KW_FIELD) || t.isContentEditable)
			);
		const done =
			e.defaultPrevented ||
			st.pid !== S.panelId ||
			st.wins.some((d) => !kwSeen(d)) ||
			escDone(st.recs);
		const live = st.wins.filter((d) => kwSeen(d));
		const plan = escPlan({
			own: st.own,
			done,
			field,
			win: live.length > 0,
			pid: S.panelId,
		});
		if (plan === "blur") {
			if (document.activeElement === t)
				try {
					t.blur();
				} catch (x) {}
			return;
		}
		if (plan === "win") {
			for (const d of live)
				if (escClose(d)) {
					e.preventDefault();
					return;
				}
		}
		if ((plan === "win" || plan === "exit") && S.panelId) {
			e.preventDefault();
			closePanel();
		}
	});

	function ripple(x, y) {
		if (S.gl) {
			S.gl.ripple(x, y);
			kick();
			return;
		}
		const r = document.createElement("i");
		r.className = "cy-rip";
		r.style.left = x + "px";
		r.style.top = y + "px";
		r.style.zIndex = String(Math.round(y) - 1);
		S.walk.appendChild(r);
		setTimeout(() => r.remove(), 700);
	}

	const SHOP_NPC_UP = { _: 60, legion: 110 };
	const ROOM = {
		forge: { hero: [1872, 1076], k: 1.2, focus: 1300, ui: "l", fit: true },
		magic: { hero: [1872, 1076], k: 1.2, focus: 1300, ui: "l", fit: true },

		anvil: {
			hero: [1470, 1040],
			k: 2,
			focus: 1000,
			ui: "l",
			art: "street",
			say: [1450, 650],
		},
		tent: { hero: [1800, 1074], k: 1.35, focus: 1250, ui: "l", fit: true },
		shop: {
			hero: [880, 1060],
			k: 1.6,
			npc: [1440, 860, "Лавочница", "happy", {}, { hat: "chef" }],
			focus: 1150,
			ui: "l",
			art: "shop",
			fit: true,
			npcUp: SHOP_NPC_UP,
		},
		trainer: {
			hero: [1640, 1040],
			npc: [
				240,
				1040,
				"Тренер",
				"stern",
				{ armed: true, gear: { w: "gladius" } },
				{ hat: "bandana" },
			],
			focus: 960,
			ui: "o",
			art: "trainer",
		},

		board: {
			hero: [1850, 1076],
			k: 1.3,
			focus: 960,
			ui: "o",
			art: "board",
			top: 20,
			box: [185, 112, 1735, 828],
		},
		hall: {
			hero: [760, 1010],
			npc: [1240, 1010, "Мастер-строитель", "happy", {}, { hat: "cap" }],
			focus: 1000,
			ui: "l",
			art: "plain",
		},
		auction: {
			hero: [760, 1010],
			npc: [1240, 1010, "Аукционист", "happy", {}, { hat: "tophat" }],
			focus: 1000,
			ui: "l",
			art: "plain",
		},
		storage: {
			hero: [760, 1010],
			npc: [1260, 1010, "Кладовщик", "happy", {}, { hat: "cap" }],
			focus: 1000,
			ui: "l",
			art: "storage",
			keep: 250,
		},
		gate: {
			hero: [760, 1010],
			npc: [
				1240,
				1010,
				"Страж ворот",
				"stern",
				{ armed: true, gear: { w: "spear", s: "scutum" } },
				{ hat: "legion" },
			],
			focus: 1000,
			ui: "l",
			art: "plain",
		},
	};

	const ANV0 = { ox: M.QW - 330, oy: 430, k: 2 };
	function streetBg() {
		const ANV = S.kit
			? S.cats.anv || ANV0
			: inTown()
				? {
						ox: TOWN.L.anvil.x - 480,
						oy: 430 + (TOWN.L.anvil.oy || 0),
						k: 2,
					}
				: S.cats
					? S.cats.anv
					: ANV0;
		let sky = "";
		try {
			sky =
				window.LGCityGL && window.LGCityGL.skyDef
					? window.LGCityGL.skyDef(S.sky, WD.H)
					: "";
		} catch {}
		const props = (S.qprops || [])
			.filter((p) => p.x < ANV.ox + 960 && p.x + p.w > ANV.ox)
			.map(
				(p) =>
					`<svg x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" viewBox="${p.x} ${p.y} ${p.w} ${p.h}" overflow="visible">${scopeIds(p.svg(), S.qpfx || "cyq-")}</svg>`,
			)
			.join("");

		const SM =
			/<animateTransform attributeName="transform" type="rotate" values="0;-7;-7;4;0;0"[^>]*\/>/;
		const street = S.street.join("").replace(SM, "@@SMITH@@");
		const art = still(street).replace(
			"@@SMITH@@",
			'<animateTransform data-smith="1" attributeName="transform" type="rotate" values="0;-7;-7;4;0;0" keyTimes="0;.3;.45;.55;.7;1" dur=".9s" begin="indefinite" fill="remove"/>',
		);
		return scopeIds(
			`<g transform="scale(${ANV.k}) translate(${-ANV.ox} ${-ANV.oy})">${sky ? `<defs>${sky}</defs><rect x="${ANV.ox}" y="${ANV.oy}" width="960" height="540" fill="url(#cyglsky)"/>` : ""}${art}${props}</g>`,
			"cyr-",
		);
	}
	const fig = (x, y, svg, k = 2, cls = "") =>
		`<div class="cy-fig2 ${cls}" style="left:${x - 60 * k}px;top:${y - 170 * k}px;width:${120 * k}px">${svg}</div>`;

	const INDOOR = {
		forge: 1,
		tent: 1,
		shop: 1,
		storage: 1,
		magic: 1,
		hall: 1,
		auction: 1,
		trainer: 1,
	};
	function inSay(id) {
		const b = id && INDOOR[id] ? id : null;
		if (!S || !S.inCity || (S.inB || null) === b) return;
		S.inB = b;
		try {
			Promise.resolve(X.api("/api/city/in", { b })).catch(() => {});
		} catch {}
	}

	function ghOpen() {
		const G = window.LGGuildHall;
		if (G && G.enter) {
			try {
				G.enter();
				return;
			} catch (e) {
				console.warn("[город] здание гильдий", e);
			}
		}
		const t = "Здание гильдий скоро откроется";
		hud(t);
		if (X.toast) X.toast(t);
		clearTimeout(S.bmT);
		S.bmT = setTimeout(() => S && hud(), 4000);
	}

	function tvOpen() {
		const T = window.LGTavern;
		if (T && T.enter) {
			try {
				T.enter({ town: TOWN && TOWN.id ? String(TOWN.id) : "" });
				return;
			} catch (e) {
				console.warn("[город] таверна", e);
			}
		}
		const t = "Таверна скоро откроется";
		hud(t);
		if (X.toast) X.toast(t);
		clearTimeout(S.bmT);
		S.bmT = setTimeout(() => S && hud(), 4000);
	}
	function closePanel() {
		newsClose();
		if (!S || S.panelId == null) return;
		const was = S.panelId;
		S.panelId = null;
		inSay(null);
		X.forgeClose && X.forgeClose();
		FX.reset();
		if (X.tipHide) X.tipHide();
		igOff();
		ST.off();

		if (was === "hall" && BLD.hall.off) BLD.hall.off();
		if (was === "auction" && window.LGAuction) window.LGAuction.close();
		if (was === "tent" && tentMine()) {
			try {
				X.api("/api/tentShop", { on: false });
			} catch (e) {}
		}
		S.view.style.visibility = "";
		for (const w of [S.me, ...S.others.values()])
			if (w) {
				place(w);
				w.shown = true;
			}
		if (S.gl) {
			S.gl.dirty();
			kick();
		}
		const r = S.room;
		r.classList.remove("in");
		setTimeout(
			() => {
				if (S && S.panelId == null) {
					r.hidden = true;
					r.innerHTML = "";
				}
			},
			reduce() ? 0 : 260,
		);
		try {
			S.view.focus({ preventScroll: true });
		} catch {}
		if (was) kick();
	}
	function openPanel(id) {
		if (!S || !IDS[id]) return;
		{
			const B0 = WD.BUILDINGS.find((b) => b.id === id);
			if (B0 && buildSay(B0)) return;
		}
		if (id === "mine") {
			mineOpen();
			return;
		}
		if (id === "guild") {
			ghOpen();
			return;
		}
		if (id === "tavern") {
			tvOpen();
			return;
		}
		if (id === "hwshop" || id === "hwpass") {
			hwOpen(id);
			return;
		}
		if (id === "mineboard") {
			if (X.openMineBoard) X.openMineBoard();
			return;
		}

		const V = window.LG_VER;
		if (V) {
			if (V.old() && V.reload()) return;
			V.check();
		}
		hover(null);
		const B = WD.BUILDINGS.find((b) => b.id === id),
			h = X.hero(),
			R = ROOM[id];
		if (S.panelId === "anvil" || id === "anvil") {
			FX.reset();
			X.forgeClose && X.forgeClose();
		}
		const fresh = S.panelId == null;
		if (S.panelId === "tent" && id !== "tent" && tentMine()) {
			try {
				X.api("/api/tentShop", { on: false });
			} catch (e) {}
		}
		if (S.panelId === "hall" && id !== "hall" && BLD.hall.off) BLD.hall.off();
		S.panelId = id;
		inSay(id);
		if (id === "tent" && tentMine()) {
			try {
				X.api("/api/tentShop", { on: true });
			} catch (e) {}
		}
		const r = S.room;
		r.dataset.b = id;
		r.dataset.ui = FULL[id] ? "f" : R.ui;

		const gw = id !== "trainer";
		r.classList.toggle("gw-tok", gw);
		r.classList.toggle("gw-dk", gw);
		r.dataset.gst = ROOM_GST.includes(S.st) ? S.st : "legion";
		r.classList.toggle("cy-hwd", hwDead());
		const hero = h
			? fig(
					R.hero[0],
					R.hero[1],
					still(X.doodle(X.login(), X.heroLook(h), "happy", "peace")),
					R.k || 2.1,
					"me",
				)
			: "";
		const npcF = R.npc
			? fig(
					R.npc[0],
					R.npc[1] - (R.npcUp ? (R.npcUp[S.st] ?? R.npcUp._ ?? 0) : 0),
					npc(R.npc[2], R.npc[3], R.npc[4], R.npc[5]),
					2.1,
					"npc",
				)
			: "";

		const front =
			R.npc && R.art && ART.roomFront ? ART.roomFront(S.st, R.art) : "";
		const frontF = front
			? `<svg class="cy-rfg" width="1920" height="1080" viewBox="0 0 1920 1080" style="position:absolute;left:0;top:0;pointer-events:none" aria-hidden="true">${scopeIds(front, "cyf-")}</svg>`
			: "";
		const hello = FULL[id] ? "" : helloOf(id),
			bodyH = body(id, h);
		r.innerHTML = `<div class="cy-rs"><div class="cy-rsz"></div><div class="cy-rin"><svg class="cy-rbg" width="1920" height="1080" viewBox="0 0 1920 1080" overflow="visible" aria-hidden="true">${roomSvg(id)}</svg>${npcF}${frontF}${id === "anvil" ? forgeStage() : ""}${hero}${hello ? `<p class="cy-rsay" style="left:${R.say ? R.say[0] : R.npc ? R.npc[0] : 1400}px;top:${R.say ? R.say[1] : R.npc ? R.npc[1] - 420 : 330}px">${esc(hello)}</p>` : ""}</div></div>
      <header class="cy-rh"><h2><span aria-hidden="true">${B.icon}</span>${esc(titleOf(B))}</h2><button type="button" class="btn cy-exit" data-cyexit>Выйти</button></header>
      ${FULL[id] ? `<div class="cy-rui cy-rbar"><div class="cy-pb">${bodyH}</div></div><p class="cy-rsay2" role="status">${esc(siteSay(id, h))}</p>` : `<div class="cy-rui panel"><div class="cy-pb">${bodyH}</div></div>`}`;
		S.panel = r.querySelector(".cy-rui");
		S.panel.__uiH = `<div class="cy-pb">${bodyH}</div>`;

		doodSize(r, R.art === "street");
		r.hidden = false;
		r.querySelector("[data-cyexit]").onclick = closePanel;
		goodsHots(id);
		if (fresh) {
			void r.offsetWidth;
			r.classList.add("in");
			setTimeout(() => {
				if (S && S.panelId) S.view.style.visibility = "hidden";
			}, 280);
		}
		S.roomScroll = null;
		S.roomUser = false;
		{
			const rs = r.querySelector(".cy-rs");
			if (rs) {
				for (const ev of ["pointerdown", "wheel", "touchstart", "keydown"])
					rs.addEventListener(
						ev,
						() => {
							if (S) S.roomUser = true;
						},
						{ passive: true },
					);
				roomPinch(rs);
			}
		}
		S.roomZ = 1;
		S.roomK = null;
		{
			const sy = r.querySelector(".cy-rsay2");
			if (sy) {
				clearTimeout(S.sayT);
				S.sayT = setTimeout(() => sy.classList.add("off"), 9000);
				sy.onclick = () => sy.classList.add("off");
			}
		}
		r.scrollTop = 0;
		after(id, h);
		fitRoom();

		try {
			if (S.roomRO) S.roomRO.disconnect();
			S.roomRO = new ResizeObserver(() => fitRoom());
			S.roomRO.observe(S.panel);
		} catch {}
		if (fresh)
			try {
				r.querySelector("[data-cyexit]").focus({ preventScroll: true });
			} catch {}

		if (
			!SH.STOCK &&
			(id === "forge" || id === "tent" || id === "magic" || id === "shop")
		)
			loadStock().then((st) => {
				if (st && S && S.panelId === id) {
					const bg = S.room.querySelector(".cy-rbg");
					if (bg && id !== "shop") {
						bg.innerHTML = roomSvg(id);
						doodSize(S.room, false);
					}
					goodsHots(id);
					if (id === "forge" || id === "magic" || id === "shop") rerenderUi(id);
				}
			});
	}

	function helloOf(id) {
		if (id === "anvil") {
			const h = X.hero();
			if (!h || !h.ef)
				return "Скоро открою мастерскую — заточку вещей. Загляни позже!";
			return [
				"Клади на наковальню — подточим!",
				"Звезда — к удаче, сфера — от поломки. Что точим?",
				"Горн разогрет. Выбирай вещь!",
			][Math.floor(Math.random() * 3)];
		}
		const RR = S.L.rooms && S.L.rooms[id],
			pick = (a) =>
				Array.isArray(a) && a.length
					? String(a[Math.floor(Math.random() * a.length)])
					: "";
		const n = (X.hero() && X.hero().name) || X.login();
		const t = RR && pick(RR.hello);
		if (t) return t.replace(/\{n\}/g, n);
		if (id === "auction" && auOpen())
			return `Добро пожаловать, ${n}! Покупай, продавай — монеты продавцу, вещь тебе, всё честно.`;
		if (id === "hall" && inTown() && TOWN.acc && !TOWN.acc.own)
			return "Ратуша не для чужих. Захватите округ — тогда и поговорим.";
		if (id === "storage")
			return stOpen()
				? `Заходи, ${n}! Что положим на полку, что заберём?`
				: "Склад скоро откроется — будет где хранить вещи, когда сумка полна.";
		return (
			{
				shop: `Заходи, ${n}! Еда лечит раны, зелья — быстрее.`,
				hall: "Добро пожаловать в Ратушу! Здесь склад и казна города.",
				auction:
					"Аукцион откроется позже — торговать будем вещами, звёздами и печатями.",
				gate: "В поход отсюда не выйти — отряд собирает стример на стриме.",
			}[id] || ""
		);
	}

	function siteSay(id, h) {
		if (!h)
			return "Героя пока нет — он появится, когда ты напишешь в чат на стриме.";
		if (id === "tent")
			return "Нажми на образец — примерю на тебе. Своё из гардероба — «Надеть», новое купить можно на стриме, за баллы канала.";
		const buy = csOn()
			? "Нажми на вещь — покажу, что даёт; ещё раз (или двойной клик) — «Купить? Да / Нет»."
			: "Нажми на вещь — покажу, что даёт. Купить можно на стриме, за баллы канала.";

		if (h.bp && (id === "forge" || id === "magic")) {
			const t =
				window.LGSiteUi && window.LGSiteUi.is("nohover")
					? "Нажми на вещь - рядом с ней появится «Купить?»."
					: "Наведи на вещь - покажу, что даёт. Нажми на неё (или правой кнопкой) - рядом появится «Купить?».";
			return (
				(id === "forge"
					? "Оружие и доспехи - на стойках. "
					: "Посохи, мантии, амулеты, звёзды и сферы - на полках. ") + t
			);
		}
		if (id === "forge") return "Оружие и доспехи — на стойках. " + buy;
		if (id === "magic")
			return "Посохи, мантии, амулеты, звёзды и сферы — на полках. " + buy;
		return "Еда лечит раны, зелья — быстрее. " + buy;
	}
	const npc = (seed, mood, extra, look) => {
		try {
			const gh = hwDead();
			const v = still(
				D().jDoodle(
					D().jhash(seed),
					mood,
					false,
					gh ? { ...(extra || {}), ghost: true } : extra || {},
					look,
				),
			);
			return gh ? ghostSvg(v) : v;
		} catch {
			return "";
		}
	};
	const say = (t) => `<p class="cy-say">${esc(t)}</p>`;
	const ROOM_GST = [
		"legion",
		"cats",
		"monkeys",
		"veggies",
		"42brothers",
		"cherts",
		"ugabugi",
	];
	function body(id, h) {
		if (id === "hall") return BLD.hall.body(h);
		if (id === "auction" && h && h.au)
			return '<div class="au-root" aria-busy="true"><p class="note">Аукционист раскладывает лоты…</p></div>';
		if (id === "auction")
			return `${say("Аукцион скоро откроется: здесь игроки будут продавать и покупать вещи, звёзды, сферы и печати.")}<p class="note">Пока торговать можно только в лавках города.</p>`;
		if (id === "storage" && !(h && h.sg))
			return `${say("Склад скоро откроется: здесь можно будет хранить вещи, которые не помещаются в сумку.")}<p class="note">Пока сумка без предела — носи всё с собой.</p>`;
		if (id === "gate")
			return `${say("В поход отсюда не выйти — отряд собирает стример на стриме.")}<p class="note">Ворота откроются, когда начнётся поход. А пока — заточи оружие, загляни к Тренеру и в Шатёр.</p>`;
		if (id === "board") return BLD.board.body();
		if (!h)
			return say(
				"Героя пока нет — он появится, когда ты напишешь в чат на стриме.",
			);
		if (id === "trainer") return BLD.trainer.body(h);
		if (id === "anvil") return BLD.forge.body(h);
		if (id === "forge") return BLD.forge.shop(h);
		if (id === "magic") return BLD.magic.body(h);
		if (id === "tent") return BLD.tent.body(h);
		if (id === "shop") return BLD.shop.body(h);
		if (id === "storage") return ST.body(h);
		return "";
	}
	function after(id, h) {
		if (id === "board") BLD.board.after();
		if (id === "hall") BLD.hall.after();
		if (id === "auction" && h && h.au) auctionOpen();
		if (id === "trainer") BLD.trainer.after(h);
		if (id === "anvil") BLD.forge.after(h);
		if (id === "forge") BLD.forge.shopAfter();
		if (id === "tent") BLD.tent.after(h);
		if (id === "storage" && h && h.sg) ST.after(h);
		if (id === "shop") BLD.shop.after(h);
	}

	function rerenderUi(id, soft) {
		if (!S || S.panelId !== id) return;

		if (id === "storage" && ST.hold()) return;

		if (
			window.LGSiteUi &&
			window.LGSiteUi.picking &&
			window.LGSiteUi.picking()
		) {
			clearTimeout(S.uiLater);
			S.uiLater = setTimeout(() => rerenderUi(id), 700);
			return;
		}
		const pb = S.panel.querySelector(".cy-pb"),
			sc = pb ? pb.scrollTop : 0;

		const html = `<div class="cy-pb">${body(id, X.hero())}</div>`;

		if (
			soft &&
			id !== "storage" &&
			id !== "tent" &&
			pb &&
			S.panel.__uiH === html
		)
			return;
		S.panel.__uiH = html;
		ST.quiet(() => {
			S.panel.innerHTML = html;
		});
		after(id, X.hero());
		const pb2 = S.panel.querySelector(".cy-pb");
		if (pb2) pb2.scrollTop = sc;
		if (id === "tent") {
			const f = S.room.querySelector(".cy-fig2.me");
			const h = X.hero();
			if (f && h)
				f.innerHTML = still(
					X.doodle(
						X.login(),
						{
							...h,
							look: {
								...((h.wardrobe && h.wardrobe.cur) || {}),
								...BLD.tent.TRY,
							},
							gear: {},
						},
						"happy",
						"peace",
					),
				);
		}
		fitRoom();
	}

	const hwNow = () => {
		const h = X && X.hero();
		return (h && h.hwc) || null;
	};

	let hwGhK = false;
	const hwGh = () => hwGhK;
	function hwGhSet(on) {
		on = !!on;
		if (on === hwGhK) return;
		hwGhK = on;
		if (!S || !S.gl) return;
		for (const w of [...S.others.values(), ...(S.me ? [S.me] : [])]) {
			if (!w.v) continue;
			const svg = walkerSvg(w.l, w.v);
			S.gl.relook(w, svg, labOf(w.l, w.v, !!w.mine));
		}
		kick();
	}
	let hwJs = null;
	function hwApply() {
		if (!S || !S.gl || S.cats) return;
		const c = isCamp() ? null : hwNow(),
			k = c ? (c.look ? "l" : "") + (c.portal ? "p" : "") : "";
		if (k === (S.hwk || "") || S.hwPlay) {
			if (S.hwk == null) S.hwk = k;
			if (!S.hwPlay) {
				hwGhSet(!!(c && c.portal));
				hwNpc(!!(c && c.look));
			}
			return;
		}
		if (k && !window.LGCityHW) {
			if (!hwJs)
				hwJs = townJs(
					`/site/cityhw.js?v=${(window.LG_CITYV || {}).hw || ""}`,
				).catch((e) => {
					hwJs = null;
					console.warn("[город] Хэллоуин", e);
				});
			hwJs.then(() => {
				if (window.LGCityHW) hwApply();
			});
			return;
		}
		const was = S.hwk;
		S.hwk = k;
		const L = window.LGCityHW,
			sc = { B: WD.BUILDINGS.filter(bOk), AREA: WD.AREA, fair: !inTown() },
			hw = S.L && S.L.hw,
			o = {
				frame: hw && hw.frame,
				decor: hw && hw.decor,
				dx: inTown() ? 0 : M.QW,
			};
		const TC = [0x8e, 0x9a, 0xb8],
			tint = (q) => {
				const v = TC.map((x) => Math.round(255 + (x - 255) * q));
				S.gl.tint(q <= 0 ? null : (v[0] << 16) | (v[1] << 8) | v[2]);
				kick();
			};

		const fire = (on) => {
			for (const e of S.el.querySelectorAll(".cy-camp-fl"))
				e.style.display = on ? "" : "none";
		};

		const stat = () => {
			fire(!(c && c.look));
			hwGhSet(!!(c && c.portal));
			S.gl.dropProps("hw");
			S.gl.dropProps("hwp");
			S.gl.dropProps("hwl");
			if (c && c.look) {
				S.gl.setDeadArt(L.art(sc, { ...o, portal: !!c.portal }));
				S.gl.addProps(L.lampProps(sc), "hwl");
			} else if (c && c.portal) S.gl.addProps(L.portal(sc, o), "hwp");
			S.gl.setDead(!!(c && c.look));
			tint(0);
			hwNpc(!!(c && c.look));

			const fl = S.cam.querySelector(".hwc-fls");
			if (fl) fl.remove();
			if (c && c.look && !reduce()) {
				const f = L.flickers(sc, 3);
				if (f) S.cam.appendChild(f);
			}
		};

		if (
			was != null &&
			!/p/.test(was) &&
			c &&
			c.portal &&
			c.look &&
			c.at &&
			Date.now() - c.at < 20000 &&
			!reduce() &&
			S.cam
		) {
			S.gl.dropProps("hw");
			S.gl.dropProps("hwp");
			S.gl.dropProps("hwl");
			S.gl.setDeadArt(null);
			hwNpc(false);
			setTimeout(() => {
				if (S) fire(false);
			}, 3000);
			S.hwPlay = L.play({
				sc,
				art: o,
				world: S.cam,
				screen: S.view,
				light: true,
				ghosts: () => hwGhSet(true),
				dead: (w) => {
					if (S && S.gl) {
						S.gl.setDead(true, w);
						kick();
					}
				},
				bake: () => {
					if (S && S.gl) {
						S.gl.setDeadArt(L.art(sc, { ...o, portal: true }));
						S.gl.dropProps("hwl");
						S.gl.addProps(L.lampProps(sc), "hwl");
						kick();
					}
				},
				done: () => {
					if (S) {
						S.hwPlay = null;
						hwNpc(!!(hwNow() || {}).look, true);
						const f = L.flickers(sc, 3);
						if (f && !reduce() && !S.cam.querySelector(".hwc-fls"))
							S.cam.appendChild(f);
						kick();
					}
				},
			});
			return;
		}
		stat();
		kick();
	}
	function heroChanged() {
		if (!S) {
			wwWake();
			return;
		}
		hwApply();
		if (window.LGTrade) window.LGTrade.heroChanged();
		chatInit();
		const h = X.hero();
		if (S.me && h) {
			const v = mineView(h);
			if (JSON.stringify(v) !== S.me.vKey) {
				S.me.vKey = JSON.stringify(v);
				S.me.v = v;
				const svg = walkerSvg(X.login(), v);
				S.me.lift = nameLift(svg, v);
				if (S.gl) {
					S.gl.relook(S.me, svg, labOf(X.login(), v, true));
					kick();
				} else {
					S.me.body.innerHTML = svg;
					place(S.me);
				}
			}
		}

		if (FULL[S.panelId] || S.panelId === "storage") rerenderUi(S.panelId, true);
		if (S.panelId === "anvil") BLD.forge.list(h);

		if (S.panelId === "hall" && BLD.hall.hero) BLD.hall.hero(h);
		if (S.panelId === "auction" && window.LGAuction) window.LGAuction.update(h);
	}

	let auLoading = null;
	function auctionOpen() {
		const box = S.panel.querySelector(".au-root");
		if (!box) return;
		if (!auLoading) {
			const V = window.LG_CITYV || {};
			if (!document.getElementById("auCss")) {
				const l = document.createElement("link");
				l.id = "auCss";
				l.rel = "stylesheet";
				l.href = `/site/auction.css?v=${V.auc || ""}`;
				document.head.appendChild(l);
			}
			auLoading = new Promise((ok, no) => {
				const sc = document.createElement("script");
				sc.src = `/site/auction.js?v=${V.au || ""}`;
				sc.onload = ok;
				sc.onerror = no;
				document.head.appendChild(sc);
			}).catch((e) => {
				auLoading = null;
				throw e;
			});
		}
		auLoading
			.then(() => {
				if (S && S.panelId === "auction" && box.isConnected && window.LGAuction)
					window.LGAuction.render(box, X, { fit: fitRoom });
			})
			.catch(() => {
				box.innerHTML =
					'<p class="note">Аукцион не загрузился — проверь связь и зайди ещё раз.</p>';
			});
	}

	const ST = (window.LGCityStore &&
		window.LGCityStore({
			get S() {
				return S;
			},
			get X() {
				return X;
			},
			npc: (...a) => npc(...a),
			say: (t) => say(t),
			IGW: () => IGW(),
			rerender: (id) => rerenderUi(id),
		})) || {
		body: () => '<p class="note">Склад не загрузился - обнови страницу.</p>',
		after() {},
		off() {},
		res() {},
		hold: () => false,
		quiet: (fn) => fn(),
	};

	const IGW = () => window.LGItems;

	const CC = {
		get S() {
			return S;
		},
		get X() {
			return X;
		},
		get TOWN() {
			return TOWN;
		},
		ROOM,
		ART,
		D,
		esc,
		still,
		scopeIds,
		npcAs,
		reduce: () => reduce(),
		hwDead: () => hwDead(),
		isCamp: () => isCamp(),
		csOn: () => csOn(),
		msOn: () => msOn(),
		inTown: () => inTown(),
		homeHere: () => homeHere(),
		foreignK: () => foreignK(),
		npc: (...a) => npc(...a),
		say: (t) => say(t),
		IGW: () => IGW(),
		rerender: (id) => rerenderUi(id),
		goBuilding: (id) => goBuilding(id),
		streetBg: () => streetBg(),
		bld: (id) => BLD[id],
	};
	const SH = window.LGCityShop(CC);
	const BLD = {};
	for (const id of CITY_B) BLD[id] = window.LGCityBuildings[id](CC, SH);
	const { FULL, loadStock, doodSize, roomSvg, fitRoom, roomPinch, goodsHots } =
		SH;
	const FX = BLD.forge.FX,
		forgeStage = () => BLD.forge.stage(),
		forgeBody = (h) => BLD.forge.body(h),
		forgeAfter = (h, P) => BLD.forge.after(h, P),
		pickForge = (uid, P) => BLD.forge.pick(uid, P),
		igOff = () => BLD.forge.igOff();
	const newsClose = () => BLD.board.close(),
		newsBoard = (box, list) => BLD.board.render(box, list),
		newsRead = (i) => BLD.board.read(i);

	const jlOn = () => !!(X && X.jailOn && X.jailOn());
	const meJail = () => (X && X.jail && X.jail()) || null;
	let JAIL = { list: [], n: 0 };
	const jailHere = () =>
		!!(S && !inTown() && jlOn() && WD && WD.LOW && WD.LOW.jail);
	const jailDay = (u) => {
		if (u == null) return "бессрочно";
		try {
			const d = new Date(u);
			return (
				"выйдет " +
				d.toLocaleDateString("ru-RU", {
					day: "numeric",
					month: "long",
					timeZone: "Europe/Moscow",
				}) +
				", " +
				d.toLocaleTimeString("ru-RU", {
					hour: "2-digit",
					minute: "2-digit",
					timeZone: "Europe/Moscow",
				})
			);
		} catch (e) {
			return "";
		}
	};
	async function jailLoad() {
		if (!jailHere()) return;
		const r = await X.api("/api/jail");
		if (r && r.ok) jailSet(r);
	}
	function jailSet(d) {
		if (!d) return;
		JAIL = {
			list: Array.isArray(d.list) ? d.list : [],
			n: +d.n || 0,
			staff: d.staff ? JAIL.staff || !!d.staff : JAIL.staff,
			why: d.why || JAIL.why,
			me: d.me || JAIL.me,
		};
		if (d.staff) {
			JAIL.staff = true;
			JAIL.why = d.why;
		}
		if (!S || !jailHere()) return;
		jailDraw();
		if (S.jw) jwRender();
	}
	function jailDraw() {
		if (!S.jail) S.jail = new Map();
		const J = WD.LOW.jail,
			me = X.login(),
			mj = meJail();
		const show = mj ? [{ self: 1 }] : [];
		for (const e of JAIL.list) {
			if (show.length >= J.seats.length) break;
			if (e.l !== me) show.push(e);
		}
		const keep = new Set();
		show.forEach((e, i) => {
			const [sx, sy] = J.seats[i];

			if (e.self) {
				if (S.me && !inWalk(S.me)) {
					S.me.path = null;
					S.me.x = sx;
					S.me.y = sy;
					S.me.face = i % 2 ? -1 : 1;
					setMoving(S.me, false);
					S.me.sc = 0;
					place(S.me);
				}
				return;
			}
			keep.add(e.l);
			const vk = JSON.stringify([e.n, e.lv, e.lk, e.g, e.gh, e.aw]);
			let w = S.jail.get(e.l);
			if (w && w.vk !== vk) {
				drop(w);
				S.jail.delete(e.l);
				w = null;
			}
			if (!w) {
				w = addWalker(e.l, e, sx, sy, false);
				w.jail = 1;
				w.vk = vk;
				S.jail.set(e.l, w);
			}
			w.x = sx;
			w.y = sy;
			w.face = i % 2 ? -1 : 1;
			w.sc = 0;
			w.u = e.u;
			place(w);
		});
		for (const [l, w] of S.jail)
			if (!keep.has(l)) {
				drop(w);
				S.jail.delete(l);
			}

		const total = JAIL.n + (mj && !JAIL.list.some((e) => e.l === me) ? 1 : 0),
			more = Math.max(0, total - show.length);
		const host = S.walk || S.cam;
		let pl = S.jailPl;
		if (more > 0) {
			if (!pl || !pl.isConnected) {
				pl = S.jailPl = document.createElement("div");
				pl.className = "cy-jmore";
				pl.setAttribute("aria-hidden", "true");
				host.appendChild(pl);
			}
			pl.textContent = "+" + more;

			pl.style.cssText = `left:${J.c1 + 44}px;top:${J.ct + 50}px;z-index:${J.fy + 3}`;
		} else if (pl) {
			pl.remove();
			S.jailPl = null;
		}
		if (!S.sighT && (show.length || mj)) S.sighT = setInterval(jailSigh, 3200);
		kick();
	}

	function jailSigh() {
		if (
			!S ||
			!S.root ||
			!S.root.classList.contains("on") ||
			document.hidden ||
			reduce()
		)
			return;
		const ws = [...(S.jail ? S.jail.values() : [])];
		if (meJail() && S.me) ws.push(S.me);
		if (!ws.length) return;
		const w = ws[Math.floor(Math.random() * ws.length)],
			sc = scaleAt(w.y) * HS;
		if (S.gl) {
			if (w.gl) {
				w.gl.body.scale.set(w.face * sc, sc * 0.94);
				if (S.gl.dirty) S.gl.dirty();
				kick();
			}
		} else if (w.body)
			w.body.style.transform = `scale(${(w.face * sc).toFixed(3)},${(sc * 0.94).toFixed(3)})`;
		setTimeout(() => {
			if (!S) return;
			w.sc = 0;
			place(w);
			kick();
		}, 520);
	}

	const inCage = (x, y) => {
		const J = WD && WD.LOW && WD.LOW.jail;
		return !!J && x >= J.c0 && x <= J.c1 && y >= J.ct - 56 && y <= J.fy + 30;
	};

	const jailWalk = (x, y) =>
		WD && WD.cats && !WD.kit
			? window.LGFairCatsCity.jailWalk(x, y)
			: M.jailWalk(x, y);
	const inWalk = (w) => {
		const q = jailWalk(w.x, w.y);
		return Math.abs(q[0] - w.x) < 0.5 && Math.abs(q[1] - w.y) < 0.5;
	};

	function jailGo(x, y) {
		if (!S || !S.me || !jailHere()) return;
		const w = S.me,
			[tx, ty] = jailWalk(x, y);
		if (!inWalk(w)) {
			const q = jailWalk(w.x, w.y);
			w.x = q[0];
			w.y = q[1];
			place(w);
		}
		if (S.kw && S.kw.on) kwHalt();
		S.el.classList.add("went");
		S.arrive = null;
		S.camFree = false;
		w.path = Math.hypot(tx - w.x, ty - w.y) > 1 ? [[tx, ty]] : null;
		w.lag = 0;
		setMoving(w, !!w.path);
		kick();
		ripple(tx, ty);
	}
	const jailAt = (x, y) => {
		if (!S || !S.jail) return null;
		let best = null;
		for (const w of S.jail.values()) {
			const sc = scaleAt(w.y) * HS;
			if (
				Math.abs(x - w.x) <= 36 * sc &&
				y <= w.y + 8 &&
				y >= w.y - 150 * sc &&
				(!best || w.y > best.y)
			)
				best = w;
		}
		return best;
	};

	function jwOpen() {
		if (!S) return;
		if (!S.jw) {
			const w = (S.jw = document.createElement("div"));
			w.className = "cy-jw";
			w.setAttribute("role", "dialog");
			w.setAttribute("aria-modal", "false");
			w.setAttribute("aria-labelledby", "cyjw-t");
			w.addEventListener("click", (e) => {
				if (e.target.closest("[data-jw-x]")) jwClose();
			});
			w.addEventListener("keydown", (e) => {
				if (e.key === "Escape") jwClose();
			});
			S.el.appendChild(w);
		}
		jwRender();
		jailLoad();
		const x = S.jw.querySelector("[data-jw-x]");
		if (x) x.focus();
	}
	function jwClose() {
		if (S && S.jw) {
			S.jw.remove();
			S.jw = null;
		}
	}
	function jwRender() {
		const w = S && S.jw;
		if (!w) return;
		const me = X.login(),
			mj = meJail(),
			list = JAIL.list.slice();
		if (mj && !list.some((e) => e.l === me))
			list.unshift({
				l: me,
				n: (X.hero() && X.hero().name) || me,
				u: mj.until,
			});
		const row = (e) => {
			const why = JAIL.staff && JAIL.why ? JAIL.why[e.l] : null,
				self = e.l === me;
			return (
				`<li class="${self ? "me" : ""}"><b>${esc(e.n || e.l)}${self ? " (ты)" : ""}</b><span>${esc(jailDay(e.u))}</span>` +
				(self && mj && mj.reason ? `<em>Причина: ${esc(mj.reason)}</em>` : "") +
				(why
					? `<em>${why.reason ? "Причина: " + esc(why.reason) : "Причина не указана"}${why.by ? " · выдал " + esc(why.by) : ""} · ${why.src === "channel" ? "бан канала" : "бан платформы"}</em>`
					: "") +
				"</li>"
			);
		};
		w.innerHTML =
			`<div class="cy-jw-h"><b id="cyjw-t">Тюрьма канала</b><button type="button" class="cy-jw-x" data-jw-x aria-label="Закрыть">×</button></div>` +
			(list.length
				? `<p class="cy-jw-n">Сидят: ${list.length}</p><ul class="cy-jw-l">${list.map(row).join("")}</ul>`
				: '<p class="cy-jw-n">Клетка пуста.</p>') +
			(JAIL.staff
				? '<p class="cy-jw-f">Снять бан - стример или модератор канала.</p>'
				: "");
	}

	function mineView(h) {
		const cur =
			h.wardrobe && h.wardrobe.cur && Object.keys(h.wardrobe.cur).length
				? h.wardrobe.cur
				: h.look;
		return {
			n: h.name || X.login(),
			lv: h.level,
			lk: cur || null,
			g: h.gear || {},
			gh: h.ghost ? 1 : 0,
			aw: h.aw,
		};
	}
	function spawnMe() {
		const h = X.hero();
		if (!h) return;
		const p = posGet();
		const d0 =
			S.kit && S.cats
				? S.cats.spawn
				: inTown()
					? TOWN.L.spawn
					: WD && WD.cats
						? window.LGFairCatsCity.spawn()
						: [M.QW + 660, 1010];
		const [x, y] = S.map.nearest(p ? p[0] : d0[0], p ? p[1] : d0[1]);
		const v = mineView(h);
		S.me = addWalker(X.login(), v, x, y, true);
		S.me.vKey = JSON.stringify(v);
		S.posAt = p && +p[2] > 0 ? +p[2] : Date.now();

		if (meJail() && jailHere()) {
			const J = WD.LOW.jail;
			S.me.x = J.seats[0][0];
			S.me.y = J.seats[0][1];
			place(S.me);
			centerOn((J.c0 + J.c1) / 2, J.fy - 40);
			return;
		}
		centerOn(x, y);
	}
	const posKey = () =>
		"lgCityPos" +
		(S && S.kit
			? ":n-" + S.town
			: S && S.cats
				? ":fairc"
				: S && S.town && S.town !== "fair"
					? ":" + S.town
					: "");

	const POS_DAYS = 30;
	const posLsKey = (k) => k + "@" + (chanLogin() || "-");

	const posSsKey = (k) => (chanLogin() ? posLsKey(k) : k);

	function posGet() {
		const k = posKey();
		let s = null,
			l = null;
		try {
			const v = JSON.parse(sessionStorage.getItem(posSsKey(k)) || "null");
			if (Array.isArray(v) && v.length >= 2) s = v;
		} catch {}
		try {
			const v = JSON.parse(localStorage.getItem(posLsKey(k)) || "null");
			if (
				Array.isArray(v) &&
				v.length >= 2 &&
				!(Date.now() - (+v[2] || 0) > POS_DAYS * 864e5)
			)
				l = v;
		} catch {}
		const b = s && l && +s[2] > 0 && +l[2] > +s[2] ? l : s || l,
			v = srvPos(k);
		if (!v) return b;
		if (!b) return v;
		return +b[2] > 0 && +v[2] > +b[2] + POS_TIE ? v : b;
	}

	const POS_TIE = 2000,
		SRV_MS = 5000,
		SRV_WAIT = 2500;
	let SRV = null,
		srvP = null,
		srvTried = false;
	const srvOn = () =>
		!!(
			X &&
			X.api &&
			(chanLogin() || (window.LG_DEMO && window.LG_DEMO.cityPos))
		);
	const srvKey = (t) => "lgCityPos" + (t === "fair" ? "" : ":" + t);
	function srvLoad(force) {
		if (!srvOn()) return Promise.resolve(SRV);
		if (!force && SRV && Date.now() - SRV.got < SRV_MS)
			return Promise.resolve(SRV);
		if (!srvP) {
			srvP = Promise.resolve(X.api("/api/city/pos"))
				.then((r) => {
					if (!r || !r.ok || !r.pos || typeof r.pos !== "object") return SRV;
					const sk = +r.now > 0 ? +r.now - Date.now() : 0,
						pos = {};
					for (const t of Object.keys(r.pos)) {
						const v = r.pos[t];
						if (
							Array.isArray(v) &&
							v.length >= 3 &&
							Number.isFinite(+v[0]) &&
							Number.isFinite(+v[1]) &&
							+v[2] > 0
						)
							pos[srvKey(t)] = [+v[0], +v[1], +v[2] - sk];
					}
					SRV = { got: Date.now(), pos };
					return SRV;
				})
				.catch((e) => {
					console.warn("[город] место с сервера", e);
					return SRV;
				})
				.finally(() => {
					srvP = null;
				});
		}
		return Promise.race([
			srvP,
			new Promise((ok) => setTimeout(() => ok(SRV), SRV_WAIT)),
		]);
	}

	function srvPos(k) {
		const v = SRV && SRV.pos[k];
		if (!v || Date.now() - v[2] > POS_DAYS * 864e5) return null;
		let f = 0;
		try {
			f = +localStorage.getItem(posLsKey(k) + "!f") || 0;
		} catch {}
		return v[2] > f ? v : null;
	}

	const srvTownOf = (k) => {
		const t = k.slice("lgCityPos".length).replace(/^:/, "");
		return !t || t === "fairc" ? "fair" : t.replace(/^n-/, "");
	};

	function posTownAt(id) {
		let at = 0;
		for (const k of id === "fair"
			? ["lgCityPos", "lgCityPos:fairc"]
			: ["lgCityPos:" + id, "lgCityPos:n-" + id]) {
			try {
				const v = JSON.parse(sessionStorage.getItem(posSsKey(k)) || "null");
				if (Array.isArray(v)) at = Math.max(at, +v[2] || 0);
			} catch {}
			try {
				const v = JSON.parse(localStorage.getItem(posLsKey(k)) || "null");
				if (Array.isArray(v)) at = Math.max(at, +v[2] || 0);
			} catch {}
		}
		return at;
	}

	function srvTown(cur, since) {
		if (!SRV) return null;
		let best = null;
		for (const k of Object.keys(SRV.pos)) {
			const v = srvPos(k);
			if (v && (!best || v[2] > best[1])) best = [k, v[2]];
		}
		if (!best) return null;
		const id = srvTownOf(best[0]);
		return id !== cur &&
			best[1] > Math.max(posTownAt(cur), since || 0) + POS_TIE
			? id
			: null;
	}
	const savePos = () => {
		if (!S || !S.me || meJail()) return;
		const e = S.me.path ? S.me.path[S.me.path.length - 1] : [S.me.x, S.me.y],
			xy = [Math.round(e[0]), Math.round(e[1])],
			k = posKey(),
			at = Date.now();
		S.posAt = at;
		try {
			sessionStorage.setItem(posSsKey(k), JSON.stringify([...xy, at]));
		} catch {}
		try {
			localStorage.setItem(posLsKey(k), JSON.stringify([...xy, Date.now()]));
		} catch {}
	};

	function srvGo() {
		if (!S || !S.me || meJail() || S.panelId || (X.inQuest && X.inQuest()))
			return false;
		const id = srvTown(TOWN.id, S.posAt || 0);
		if (!id) return false;
		townGo(id);
		return true;
	}
	function posCatch() {
		if (!S || !S.me || !S.map || meJail() || S.panelId) return;
		const p = posGet();
		if (!p || !(+p[2] > (S.posAt || 0))) return;
		S.posAt = +p[2];
		const [x, y] = S.map.nearest(p[0], p[1]);
		if (Math.hypot(x - S.me.x, y - S.me.y) < 2) return;
		S.me.path = null;
		S.arrive = null;
		setMoving(S.me, false);
		S.me.x = x;
		S.me.y = y;
		place(S.me);
		S.camFree = false;
		centerOn(x, y);
	}

	function posForget(keys) {
		const at = Date.now();
		for (const k of keys) {
			try {
				sessionStorage.removeItem(posSsKey(k));
			} catch {}
			try {
				localStorage.removeItem(posLsKey(k));
			} catch {}
			try {
				localStorage.setItem(posLsKey(k) + "!f", String(at));
			} catch {}
		}
	}

	let MINE_FROM = null;
	function mineOpen() {
		if (!S) return;
		const say = (m) => {
			hud(m);
			if (X.toast) X.toast(m);
			clearTimeout(S.bmT);
			S.bmT = setTimeout(() => S && hud(), 4000);
		};
		if (!mnOn() || !X.openMine) {
			say("Шахта пока закрыта - откроется скоро");
			return;
		}

		const mn = X.hero().mn || {},
			tc = TOWN.id === "fair" ? "edge" : TOWN.id,
			c = tc && mn[tc] && mn[tc].city ? tc : "home";
		if (!mn[c]) {
			say(
				"Шахта канала откроется, когда у канала появится свой город - захватите округ на стриме",
			);
			return;
		}
		MINE_FROM = TOWN.id;

		if (c === "home" && mn["t-v3"]) {
			X.openMine(null, ["home", "t-v3"]);
			return;
		}
		X.openMine(c);
	}

	const buildSay = (B) =>
		inTown() && B && B.build && window.LGTownGen
			? window.LGTownGen.buildMsg(B, Date.now())
			: "";

	function townMeta(t) {
		const b = (t && t.building) || {},
			now = Date.now(),
			lv = { ...((t && t.levels) || {}) },
			left = {};
		for (const [k, v] of Object.entries(b)) {
			if (v && +v.until > now) left[k] = v;
			else if (v) lv[k] = Math.max(+lv[k] || 0, +v.to || 0) || undefined;
		}
		return { ...t, levels: lv, building: left };
	}
	let BT = 0;
	const ROS = new WeakSet();
	let onResize = null;
	function buildStart() {
		clearInterval(BT);
		BT = 0;
		if (!S || !inTown() || !WD.BUILDINGS.some((b) => b.build)) return;
		buildTick();
		BT = setInterval(buildTick, 1000);
	}
	function buildTick() {
		if (!S || !inTown()) {
			clearInterval(BT);
			BT = 0;
			return;
		}
		if (document.hidden || !S.root.classList.contains("on")) return;
		const box = S.el.querySelector(".cy-tags");
		if (!box) return;
		let done = false;
		for (const B of WD.BUILDINGS)
			if (B.build) {
				const ms = window.LGTownGen.buildLeft(B, Date.now());
				let el = box.querySelector(`.cy-bt[data-bt="${B.id}"]`);
				if (!ms) {
					if (el) {
						el.remove();
						done = true;
					}
					continue;
				}
				if (!el) {
					el = document.createElement("div");
					el.className = "cy-bt";
					el.dataset.bt = B.id;
					el.setAttribute("role", "timer");
					el.style.left = Math.round((B.hit[0] + B.hit[1]) / 2) + "px";
					el.style.top = Math.max(TOP + 60, B.hit[2] + 4) + "px";
					box.appendChild(el);
				}
				const t = `🏗 ${window.LGTownGen.buildClock(ms)}`;
				if (el.textContent !== t) {
					el.textContent = t;
					el.title = buildSay(B);
				}
			}
		if (done) townRefresh();
	}

	function townRefresh() {
		if (!S || !inTown() || !TOWN.meta) return;
		const root = S.root;
		clearInterval(BT);
		BT = 0;
		savePos();
		closePanel();
		leave();
		timers(false);
		if (S.raf) cancelAnimationFrame(S.raf);
		clearTimeout(S.wait);
		S.wait = 0;
		if (S.gl)
			try {
				S.gl.destroy();
			} catch {}
		S = null;
		TOWN = { ...TOWN, L: window.LGTownGen.generate(townMeta(TOWN.meta)) };
		if (root.isConnected && root.classList.contains("on")) open(root, X);
	}

	const BIO_ICO = {
		meadow: "🌾",
		forest: "🌳",
		taiga: "🌲",
		ice: "❄️",
		mount: "⛰️",
		swamp: "🪷",
		ash: "🌋",
		desert: "🏜️",
		coast: "🌊",
		blight: "☠️",
		ruin: "🏚️",
	};
	const BIO_RU = {
		meadow: "луга",
		forest: "лес",
		taiga: "тайга",
		ice: "льды",
		mount: "горы",
		swamp: "болота",
		ash: "пепел",
		desert: "пустыня",
		coast: "побережье",
		blight: "порча",
		ruin: "руины",
	};
	const sizeRu = (t) =>
		t.kind === "capital" ? "столица" : t.danger >= 2 ? "посёлок" : "деревня";
	const WHY_RU = {
		owned: "округ канала",
		home: "город канала",
		party: "отряд в округе",
		tester: "тестерам",
		left: "здесь ты покинул отряд",
	};
	let townInit = false;

	const townJs = (src, n = 0) =>
		new Promise((ok, no) => {
			const sc = document.createElement("script");
			sc.src = src;
			sc.onload = ok;
			sc.onerror = (e) => {
				sc.remove();
				if (n >= 2) {
					no(e);
					return;
				}
				setTimeout(() => townJs(src, n + 1).then(ok, no), 1000 * (n + 1));
			};
			document.head.appendChild(sc);
		});

	const PRE = new Set();
	const townPre = (...l) =>
		l.forEach((src) => {
			if (!src || PRE.has(src)) return;
			PRE.add(src);
			const k = document.createElement("link");
			k.rel = "preload";
			k.as = "script";
			k.href = src;
			k.onerror = () => PRE.delete(src);
			document.head.appendChild(k);
		});
	async function townsLoad() {
		const r = await X.api("/api/city/towns");
		if (r && r.ok) TLIST = r;
		return TLIST;
	}
	async function townPrep(root) {
		const want = TOWN.id;
		root.innerHTML = '<p class="empty">Город строится на глазах…</p>';
		if (want === CAMP) {
			try {
				if (!cpOn()) throw new Error("закрыт");
				const V = window.LG_CITYV || {};
				townPre(
					!window.LGCampMap && `/site/campmap.js?v=${V.cm || ""}`,
					!window.LGCampArt && `/site/campart.js?v=${V.ca || ""}`,
				);
				if (!window.LGCampMap) await townJs(`/site/campmap.js?v=${V.cm || ""}`);
				if (!window.LGCampArt) await townJs(`/site/campart.js?v=${V.ca || ""}`);
				if (TOWN.id !== want) return;
				TOWN = {
					id: CAMP,
					meta: null,
					acc: { own: true, k: 1, why: "camp" },
					L: { ...window.LGCampMap.get(), ...campName() },
				};
			} catch (e) {
				console.warn("[город] лагерь", e);
				const bk = homeBack();
				if (!bk || bk === CAMP) {
					townShut(root, "Лагерь сейчас закрыт");
					return;
				}
				TOWN = { id: bk, L: null, acc: null, meta: null };
				townSet(bk);
				if (X.toast) X.toast("Лагерь сейчас закрыт - ты в городе канала", true);
			}
			if (root.isConnected && root.classList.contains("on")) open(root, X);
			return;
		}
		try {
			const T = await townsLoad(),
				t = T && (T.list || []).find((x) => x.id === want);
			if (!t) throw new Error("закрыт");
			const V = window.LG_CITYV || {};

			const kitOn = t.nw && !KIT_OFF && X.tnOn && X.tnOn() && useGL();

			townPre(!window.LGTownGen && `/site/towngen.js?v=${V.tg || ""}`);
			if (kitOn) {
				kitPre();
				if (!(window.LGTownKitTowns || {})[want])
					townPre(`/site/towns/${encodeURIComponent(want)}.js?v=${V.tk || ""}`);
			}
			if (!window.LGTownGen) await townJs(`/site/towngen.js?v=${V.tg || ""}`);
			await window.LGTownGen.prep(want, (f) => townJs(`${f}?v=${V.vg || ""}`));
			let kit = null;
			if (kitOn)
				try {
					await kitJs();
					if (!(window.LGTownKitTowns || {})[want])
						await townJs(
							`/site/towns/${encodeURIComponent(want)}.js?v=${V.tk || ""}`,
						);
					kit = (window.LGTownKitTowns || {})[want] || null;
				} catch (e) {
					console.warn("[город] новый вид города не загрузился", want, e);
					kit = null;
				}
			if (TOWN.id !== want) return;
			TOWN = {
				id: want,
				meta: t,
				acc: {
					own: !!t.own,
					k: +t.k || 2,
					why: t.why || "",
					...(t.home ? { home: 1 } : {}),
				},
				L: window.LGTownGen.generate(townMeta(t)),
				kit,
			};
		} catch (e) {
			console.warn("[город] город округа", want, e);

			const bk = homeBack();
			if (homeAway() && bk === want) {
				root.innerHTML =
					'<div class="panel cy-err"><p class="lead">Город края не загрузился — обнови страницу.</p></div>';
				return;
			}
			if (!bk || bk === want) {
				townShut(root, "Этот город сейчас закрыт");
				return;
			}
			TOWN = { id: bk, L: null, acc: null, meta: null };
			townSet(bk);
			if (X.toast)
				X.toast("Этот город сейчас закрыт — ты в городе канала", true);
		}
		if (root.isConnected && root.classList.contains("on")) open(root, X);
	}

	function townShut(root, lead) {
		if (S) {
			try {
				savePos();
				closePanel();
				leave();
				timers(false);
				if (S.raf) cancelAnimationFrame(S.raf);
				clearTimeout(S.wait);
				S.wait = 0;
				if (S.gl) S.gl.destroy();
			} catch (e) {
				console.warn("[город] заглушка", e);
			}
			S = null;
		}
		if (!root) return;
		WW_LATE = { root, k: JSON.stringify(homeOf()) };
		root.innerHTML = `<div class="panel cy-err cy-shut"><p class="lead">${esc(lead)}</p><p class="note">Рябинень - город округа «Ярмарочный Край»: открыт своим (кто владеет округом), на стриме - участникам отряда, пока отряд стоит в округе. ${esc(NO_CITY)}</p></div>`;
	}

	function townGo(id, msg) {
		id = id || "fair";
		if ((id === "fair" || id === CAMP) && homeAway()) id = String(homeOf().id);
		if (!S) {
			TOWN = { id, L: null, acc: null, meta: null };
			townSet(id);
			return;
		}
		if (id === TOWN.id && S.town === id) {
			townPick(false);
			return;
		}
		const root = S.root;
		savePos();
		closePanel();
		leave();
		timers(false);
		if (S.raf) cancelAnimationFrame(S.raf);
		clearTimeout(S.wait);
		S.wait = 0;
		if (S.gl)
			try {
				S.gl.destroy();
			} catch {}
		S = null;
		TOWN = { id, L: null, acc: null, meta: null };
		townSet(id);
		if (msg && X.toast) X.toast(msg);
		if (root.isConnected && root.classList.contains("on")) open(root, X);
	}
	function townBtn() {
		const b = S.el.querySelector(".cy-town"),
			h = X.hero();
		if (!b) return;
		b.hidden =
			!((h && (h.tw || h.cp)) || inTown()) || !!(X.inQuest && X.inQuest());
		b.querySelector("b").textContent = inTown() ? TOWN.L.name : "Рябинень";
		b.title = isCamp()
			? `${TOWN.L.name} - ${TOWN.L.sub}`
			: inTown()
				? `${TOWN.L.name} — ${sizeRu(TOWN.meta)}, ${BIO_RU[TOWN.L.biome] || ""}${TOWN.acc && !TOWN.acc.own && foreignK() > 1 ? (homeHere() ? " · край: цены ×" : " · чужой округ: цены ×") + String(foreignK()).replace(".", ",") : ""}`
				: "Выбрать город";
		b.onclick = () => townPick(b.getAttribute("aria-expanded") !== "true");
	}
	async function townPick(on) {
		const b = S && S.el.querySelector(".cy-town"),
			box = S && S.el.querySelector(".cy-tp");
		if (!b || !box) return;
		b.setAttribute("aria-expanded", String(!!on));
		box.hidden = !on;
		if (!on) return;
		box.innerHTML = '<p class="note">Смотрю, какие города открыты…</p>';
		const T = await townsLoad();
		if (!S || box.hidden) return;
		const list = (T && T.list) || [],
			fairOk = !!(T && T.fair);
		const campRow = cpOn()
			? (() => {
					const c = campName();
					return `<button type="button" data-town="${CAMP}"${TOWN.id === CAMP ? ' aria-current="true"' : ""}><span class="cy-tpi" aria-hidden="true">⛺</span><b>${esc(c.name)}</b><small>${esc(c.sub)}</small></button>`;
				})()
			: "";

		const bRow = (t) =>
			`<button type="button" data-build="${esc(t.town)}" aria-disabled="true"><span class="cy-tpi" aria-hidden="true">🏗</span><b>${esc(t.town)}</b><small>${"★".repeat(t.danger)} · ещё строится · ${t.home ? "город канала" : "отряд в округе"}</small></button>`;
		const row = (t) =>
			t.build
				? bRow(t)
				: `<button type="button" data-town="${esc(t.id)}"${t.id === TOWN.id ? ' aria-current="true"' : ""}><span class="cy-tpi" aria-hidden="true">${BIO_ICO[t.biome] || "🏘"}</span><b>${esc(t.town)}</b><small>${"★".repeat(t.danger)} ${sizeRu(t)} · ${esc(BIO_RU[t.biome] || "")}${t.own || (t.home && +t.k <= 1) ? "" : ` · цены ×${String(+t.k || 2).replace(".", ",")}`}${WHY_RU[t.why] ? " · " + WHY_RU[t.why] : ""}</small></button>`;
		box.innerHTML =
			`<div class="cy-tph"><b>Города</b><button type="button" class="cy-tpx" aria-label="Закрыть">×</button></div><div class="cy-tpl">${fairOk ? `<button type="button" data-town="fair"${TOWN.id === "fair" ? ' aria-current="true"' : ""}><span class="cy-tpi" aria-hidden="true">🎪</span><b>Рябинень</b><small>★ · «Ярмарочный Край»${WHY_RU[T.fw] ? " · " + WHY_RU[T.fw] : T.fw === "owned" || T.fw === "home" ? " · город канала" : ""}</small></button>` : ""}${T && T.quest ? "" : campRow}${list.map(row).join("")}</div>` +
			`<p class="note">${list.length ? "" : "Других городов пока нет. "}Здесь только города вашего канала: город округа открывается, когда канал захватит округ; на стриме — пока отряд стоит в округе (участникам отряда).</p>`;
		box.querySelector(".cy-tpx").onclick = () => townPick(false);
		box.querySelectorAll("[data-town]").forEach((x) => {
			x.onclick = () => {
				townPick(false);
				townGo(x.dataset.town);
			};
		});
		box.querySelectorAll("[data-build]").forEach((x) => {
			x.onclick = () => {
				if (X.toast)
					X.toast(
						`Город «${x.dataset.build}» ещё строится - зайти пока нельзя`,
						true,
					);
			};
		});
	}

	const HM_WAIT = 2500;
	let hmWaitT = 0,
		hmWait0 = 0,
		hmGaveUp = false;
	function open(root, ctx) {
		X = ctx;
		const h = X.hero();

		if (!townInit && !S && !SRV && !srvTried && h && !meJail() && srvOn()) {
			srvTried = true;
			root.innerHTML = '<p class="empty">Город строится на глазах…</p>';
			srvLoad().then(() => {
				if (!S && root.isConnected && root.classList.contains("on"))
					open(root, X);
			});
			return;
		}

		if (!townInit && !S && h && h.cy && !h.hm && !meJail() && !hmGaveUp) {
			if (!hmWait0) {
				hmWait0 = Date.now();
				root.innerHTML = '<p class="empty">Город строится на глазах…</p>';
			}
			clearTimeout(hmWaitT);
			hmWaitT = setTimeout(() => {
				hmWaitT = 0;
				const h2 = X.hero();
				if (!(h2 && h2.hm) && Date.now() - hmWait0 >= HM_WAIT) hmGaveUp = true;
				if (!S && root.isConnected && root.classList.contains("on"))
					open(root, X);
			}, 250);
			return;
		}

		if (!townInit) {
			townInit = true;
			let t = townGet();
			{
				const st = !meJail() && !(X.inQuest && X.inQuest()) ? srvTown(t) : null;
				if (st) t = st;
			}
			try {
				const q = new URLSearchParams(location.search).get("town");
				if (q === CAMP) {
					t = CAMP;
					townSet(CAMP);
				}
			} catch {}
			const hp0 = homePick(h && h.hm);
			if (hp0 && hp0.id === CAMP && t === "fair") t = CAMP;
			if (
				t !== "fair" &&
				h &&
				(t === CAMP ? cpOn() : h.tw) &&
				TOWN.id === "fair"
			)
				TOWN = { id: t, L: null, acc: null, meta: null };
		}

		if (meJail() && TOWN.id !== "fair")
			TOWN = { id: "fair", L: null, acc: null, meta: null };
		if (!meJail()) {
			const hp = homePick(h && h.hm);
			if (hp && hp.id !== CAMP && (TOWN.id === "fair" || TOWN.id === CAMP)) {
				TOWN = { id: hp.id, L: null, acc: null, meta: null };
				townSet(hp.id);
			}
		}
		if (TOWN.id !== "fair" && !TOWN.L) {
			townPrep(root);
			return;
		}

		if (
			fcWant() &&
			useGL() &&
			!window.LGFairCatsCity &&
			window.PIXI &&
			window.PIXI.autoDetectRenderer
		) {
			fcPrep(root);
			return;
		}

		if (
			!S ||
			!S.root.isConnected ||
			!(S.el && S.el.isConnected) ||
			S.root !== root ||
			S.st !== X.style() ||
			S.town !== TOWN.id ||
			!!(S.cats && !S.kit) !==
				(fcWant() && useGL() && !!window.LGFairCatsCity) ||
			!!S.kit !== !!(TOWN.kit && useGL())
		) {
			if (useGL() && !(window.PIXI && window.PIXI.autoDetectRenderer)) {
				if (!glWait) {
					glWait = true;
					root.innerHTML = '<p class="empty">Город строится на глазах…</p>';
					window.LGCityGL.load(window.LG_CITYV)
						.catch((e) => {
							GLFAIL = "Pixi не загрузился";
							console.warn("[город]", e);
						})
						.then(() => {
							glWait = false;
							if (root.isConnected && root.classList.contains("on"))
								open(root, X);
						});
				}
				return;
			}
			if (S) {
				leave();
				timers(false);
				clearInterval(S.sighT);
				jwClose();
				if (S.raf) cancelAnimationFrame(S.raf);
				clearTimeout(S.wait);
				S.wait = 0;
				if (S.gl)
					try {
						S.gl.destroy();
					} catch {}
			}
			S = build(root, useGL());
			if (!S) return;
			capBtn();
			bindInput();
			olWarm();
			othBtn();
			fsBtn();
			townBtn();
			if (S.q.lv) setQuality(S.q.lv);

			if (!ROS.has(S.root)) {
				ROS.add(S.root);
				new ResizeObserver(() => layout()).observe(S.root);
			}
			if (!onResize) {
				onResize = () => layout();
				window.addEventListener("resize", onResize);
			}
		}
		document.documentElement.classList.add("cy-full");
		layout();
		chatInit();
		if (!S.me && h) spawnMe();
		else {
			posCatch();
			srvLoad();
		}

		if (S.me && !meJail() && WD && WD.LOW && WD.LOW.jail && !inTown()) {
			const J = WD.LOW.jail;
			if (
				S.me.x >= J.c0 - 10 &&
				S.me.x <= J.c1 + 10 &&
				S.me.y <= J.fy + 4 &&
				S.me.y >= J.back
			) {
				const B = WD.BUILDINGS.find((b) => b.id === "jail");
				const [x, y] = S.map.nearest(
					B ? B.door.x + 120 : J.c0,
					B ? B.door.y : J.fy + 30,
				);
				S.me.x = x;
				S.me.y = y;
				S.me.path = null;
				S.me.face = 1;
				S.me.sc = 0;
				place(S.me);
				S.camFree = false;
				centerOn(x, y);
			}
		}
		if (!h) {
			hud("Героя пока нет — он появится, когда ты напишешь в чат на стриме");
			return;
		}
		hud();
		enter();
		hwApply();
		buildStart();
		setTimeout(() => {
			if (S) S.el.classList.add("went");
		}, 6000);
	}

	function fsBtn() {
		const b = S.el.querySelector(".cy-fs");
		if (!b) return;
		b.onclick = () => {
			try {
				if (document.fullscreenElement) document.exitFullscreen();
				else S.el.requestFullscreen({ navigationUI: "hide" }).catch(() => {});
			} catch {}
		};
	}
	document.addEventListener("fullscreenchange", () => {
		if (!S) return;
		const on = document.fullscreenElement === S.el,
			b = S.el.querySelector(".cy-fs");
		if (b) {
			b.setAttribute("aria-pressed", String(on));
			b.setAttribute(
				"aria-label",
				on ? "Выйти из полноэкранного режима" : "На весь экран",
			);
			b.title = b.getAttribute("aria-label");
		}
		S.el.classList.toggle("cy-fsm", on);
		layout();
	});
	function close() {
		clearInterval(BT);
		BT = 0;
		newsClose();
		if (S) {
			clearInterval(S.sighT);
			S.sighT = 0;
			jwClose();
		}
		document.documentElement.classList.remove("cy-full");
		try {
			if (S && document.fullscreenElement === S.el) document.exitFullscreen();
		} catch {}
		if (!S) return;
		savePos();
		leave();
		timers(false);
		closePanel();
		if (S.raf) cancelAnimationFrame(S.raf);
		clearTimeout(S.wait);
		S.wait = 0;
		S.raf = 0;
	}

	let SLEPT = null;
	function sleep() {
		if (!S || !S.root) return;
		const root = S.root;
		if (document.fullscreenElement && root.contains(document.fullscreenElement))
			return;
		clearInterval(BT);
		BT = 0;
		try {
			savePos();
			closePanel();
			newsClose();
			leave();
			timers(false);
			clearInterval(S.sighT);
			S.sighT = 0;
			jwClose();
		} catch (e) {
			console.warn("[город] sleep", e);
		}
		if (S.raf) cancelAnimationFrame(S.raf);
		clearTimeout(S.wait);
		S.wait = 0;
		if (S.gl)
			try {
				S.gl.destroy();
			} catch {}
		S = null;
		SLEPT = root;
		root.innerHTML = "";

		if (window.LGChatOne) setTimeout(() => window.LGChatOne.place(), 0);
	}
	function wake() {
		const root = SLEPT;
		SLEPT = null;

		if (MINE_FROM && TOWN.id !== MINE_FROM) {
			TOWN = { id: MINE_FROM, L: null, acc: null, meta: null };
			townSet(MINE_FROM);
		}
		MINE_FROM = null;
		if (root && X && !S && root.isConnected && root.classList.contains("on"))
			open(root, X);
	}
	document.addEventListener("visibilitychange", () => {
		if (!S || !S.root.isConnected || !S.root.classList.contains("on")) return;
		if (document.hidden) {
			savePos();
			leave();
			timers(false);
			return;
		}

		srvLoad(true).then(() => {
			if (
				!S ||
				document.hidden ||
				S.inCity ||
				!S.root.isConnected ||
				!S.root.classList.contains("on")
			)
				return;
			if (srvGo()) return;
			posCatch();
			enter();
			kick();
		});
	});
	window.addEventListener("pagehide", () => {
		if (S && S.inCity) {
			savePos();
			leave();
		}
	});
	window.LGCity = {
		jail: (d) => jailSet(d),

		jailOpen: () => jwOpen(),
		board: {
			render: (box, list) => newsBoard(box, list),
			read: (i) => newsRead(i),
		},
		open,
		close,
		sleep,
		wake,

		here: () => (S && S.inCity ? S.town || null : null),

		fishGo: () => fishNear(),

		show: () =>
			S
				? {
						mode: S.hidden ? "none" : frOn() ? "fr" : glOn() ? "gl" : "all",
						cap: +S.capV || 0,
						fr: frOk(),
						gl: glOk(),
					}
				: null,
		showSet: (o) => {
			if (!S || !o) return;
			if (o.mode === "none") setHidden(true);
			else if (o.mode === "all" || o.mode === "fr" || o.mode === "gl") {
				if (S.hidden) setHidden(false);
				const fr = o.mode === "fr" && frOk(),
					gl = o.mode === "gl" && glOk();
				if (!!S.onlyFr !== fr) {
					S.onlyFr = fr;
					frSet(fr);
				}
				if (!!S.onlyGl !== gl) {
					S.onlyGl = gl;
					glSet(gl);
				}
			}
			if (o.cap != null) {
				const n = [5, 10, 25, 50].includes(+o.cap) ? +o.cap : 0;
				S.capV = n;
				capSet(n);
			}
			capBtn();
			othBtn();
			lodPick(performance.now());
			if (S.gl) S.gl.dirty();
			hud();
			kick();
		},
		onEvent: (d) => {
			if (S && S.inCity) apply(d);
		},

		bubble: (l, t, id) => {
			if (S && S.inCity) bubble(l, t, id);
		},
		unbubble: (id) => {
			if (S) unbubble(id);
		},
		heroChanged,
		forgeStart: (it, tg) => {
			if (S && S.panelId === "anvil") FX.start(it, tg);
		},
		forgeFx: (x) => {
			if (S && S.panelId === "anvil") FX.result(x);
		},

		forgeCancel: () => {
			try {
				if (!S || S.panelId !== "anvil") return;
				const st = FX.q(".cyf-stage"),
					sl = FX.slot(),
					it = FX.cur;
				FX.reset();
				if (st) st.classList.remove("work", "wait");
				if (sl) sl.classList.remove("work");
				if (it) FX.item(it);
			} catch (e) {}
		},
		storeRes: (x) => ST.res(x),

		anvil: {
			body: (h) => forgeBody(h),
			mount: (P, ctx) => {
				X = X || ctx;
				forgeAfter(X.hero(), P);
			},
			pick: (uid, P) => pickForge(uid, P),
			uid: () => FX.uid,
			boost: () => FX.boost,
			off: () => igOff(),
			ani: () => {
				const A = BLD.forge.ANI;
				return { on: A.on, kind: A.kind, step: A.step };
			},
			kind: (it) => BLD.forge.kindOf(it),
			aniSkip: () => BLD.forge.ANI.finish(),
		},

		npcs: () => (S && S.gl && S.gl.npcs ? S.gl.npcs() : []),
		room: (id) => openPanel(id),
		debug: () =>
			S && {
				cats: !!S.cats,
				kit: S.kit || null,
				town: S.kit ? "n-" + S.town : S.cats ? "fairc" : S.town,
				jl: jlOn(),
				jb: !!(S.map && S.map.BUILDINGS.some((b) => b.id === "jail")),
				me: S.me && [S.me.x, S.me.y],
				others: [...S.others.keys()],
				hidden: S.hidden,
				ghosts: S.ghosts.size,
				n: S.n,
				camX: S.camX,
				camY: S.camY,
				z: S.z,
				inCity: S.inCity,
				render: S.gl ? S.gl.mode || "pixi…" : "svg",
				fail: GLFAIL,
				lod: {
					lv: S.q.lv,
					r: S.q.r && +S.q.r.toFixed(2),
					lock: S.q.lock,
					res: S.gl && S.gl.res ? S.gl.res() : null,
					cull: [...S.others.values()].filter((w) => w.cull).length,
					nolab: [...S.others.values()].filter((w) => w.nolab).length,
				},
				gl: S.gl && S.gl.stats(),
				ol: S.ol && S.ol.stats(),
				npc: WD.BUILDINGS.filter((b) => b.hw).map((b) => b.id),
				walk: !!(
					(S.me && S.me.path) ||
					(S.kw && S.kw.on) ||
					(S.drag && S.drag.moved) ||
					S.glide
				),
				camMv: !!S.camLast,
				frq: !!(S.raf || S.wait),
			},

		peek: () =>
			S && {
				nf: S.gl ? S.gl.nf || 0 : -1,
				z: S.z,
				w: [...S.others.values()].map((w) => [
					w.l,
					w.x,
					w.y,
					w.path ? 1 : 0,
					w.cull ? 1 : 0,
					w.gl ? (w.gl.root.visible ? 1 : 0) : w.shown ? 1 : 0,
					w.gl ? w.gl.root.alpha : 1,
				]),
			},

		kw: () =>
			S && {
				free: S.me ? S.map.free(S.me.x, S.me.y) : null,
				near: (kwNear() || {}).id || null,
				panel: S.panelId,
				on: !!(S.kw && S.kw.on),
				hint: S.ehK || null,
			},
		hideOthers: (on) => S && setHidden(!!on),

		awb: (l, i = 0) => {
			if (!S) return null;
			const w = l === X.login() ? S.me : S.others.get(l);
			if (!w) return null;
			if (!S.gl) {
				const e = w.nm && w.nm.querySelectorAll(".awb")[i];
				if (!e) return null;
				const r = e.getBoundingClientRect();
				return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
			}
			const h = S.gl.badgeOf && S.gl.badgeOf(w, i);
			if (!h) return null;
			const r = S.view.getBoundingClientRect();
			return {
				x: r.left + (h.x - S.camX) * S.z,
				y: r.top + (h.y - S.camY) * S.z,
			};
		},
		tradeMenu: (l, cx, cy) => {
			const w = S && S.others.get(l);
			if (w && window.LGTrade) {
				window.LGTrade.mount(X, S.el);
				window.LGTrade.menu(l, w.v, cx, cy);
			}
		},
		quality: (lv) => {
			if (!S) return;
			S.q.fixed = lv != null;
			if (lv != null) setQuality(+lv);
		},

		town: (id) => {
			townInit = true;
			townGo(String(id || "fair"));
		},

		leftTo: (id) => {
			id = String(id || "fair");
			townInit = true;
			if (S && S.inCity && S.town === id) return;
			posForget([
				"lgCityPos:" + id,
				"lgCityPos:n-" + id,
				...(id === "fair" ? ["lgCityPos", "lgCityPos:fairc"] : []),
			]);
			townGo(id);
		},

		questChanged: () => {
			try {
				if (S && S.el) {
					townBtn();
					townPick(false);
				}
			} catch (e) {
				console.warn("Город: кнопка выбора города", e);
			}
		},
		towns: () => TLIST,
		where: () => ({
			id: TOWN.id,
			own: TOWN.acc ? !!TOWN.acc.own : true,
			k: foreignK(),
		}),

		spot: (id) => {
			if (!S || !S.inCity || !S.map || !S.view || S.panelId) return null;
			const b = (S.map.BUILDINGS || []).find(
				(x) => x.id === id && x.hit && bOk(x) && !soonB(x),
			);
			if (!b) return null;
			const [x0, x1, y0, y1] = b.hit;
			S.camFree = true;
			S.glide = null;
			centerOn((x0 + x1) / 2, (y0 + y1) / 2 + viewH() * 0.2);
			const r = S.view.getBoundingClientRect(),
				L = r.left + (x0 - S.camX) * S.z,
				T = r.top + (y0 - S.camY) * S.z;
			const R = Math.min(r.right, L + (x1 - x0) * S.z),
				B = Math.min(r.bottom, T + (y1 - y0) * S.z),
				l = Math.max(r.left, L),
				t = Math.max(r.top, T);
			return R - l > 8 && B - t > 8
				? { x: l, y: t, w: R - l, h: B - t, title: titleOf(b) }
				: null;
		},

		hasB: (id) =>
			!!(
				S &&
				S.inCity &&
				S.map &&
				(S.map.BUILDINGS || []).some((x) => x.id === id)
			),
		blist: () =>
			S && S.map
				? (S.map.BUILDINGS || [])
						.filter((x) => bOk(x) && !soonB(x) && x.title)
						.map((x) => titleOf(x))
				: [],

		wall: () => {
			if (!S || !S.inCity || !S.map || !S.cam || S.panelId) return null;
			const b = (S.map.BUILDINGS || []).find((x) => x.id === "gate");
			if (!b) return null;
			const d =
				b.door ||
				(b.hit ? { x: (b.hit[0] + b.hit[1]) / 2, y: b.hit[3] } : null);
			if (!d) return null;

			return {
				cam: S.cam,
				x: d.x,
				y: d.y,
				hit: b.hit || b.vis || null,
				W: WD.W,
				H: WD.H,
				town: S.town || "fair",
				own: TOWN.acc
					? !!(
							TOWN.acc.own ||
							TOWN.acc.home ||
							TOWN.acc.why === "home" ||
							TOWN.acc.why === "camp"
						)
					: true,
				top: !!(S.kit || S.cats),
				z: S.z,
				glade: (S.cats && S.cats.glade) || null,
				X,
			};
		},
		go: (x, y) => S && goPoint(x, y),
		goBuilding: (id) => S && goBuilding(id),
		center: (x, y) => {
			if (S) {
				S.camFree = true;
				centerOn(x, y);
			}
		},
		panel: (id) => S && openPanel(id),
	};
})();
