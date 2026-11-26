((root) => {
	const H = {
		get el() {
			return (S.box && S.box.parentNode) || S.hold;
		},
		chat: null,
	};
	const S = {
		hold: null,
		box: null,
		ctx: null,
		inst: null,
		docks: new Map(),
		fl: null,
		place: "",
		c: { city: null, mine: null },
		watchT: 0,
		pollT: 0,
		cntT: 0,
		watching: "",
		loaded: { city: false, mine: false },
		syncAt: 0,
		hidAt: 0,
		fullT: 0,
	};
	const tagM = (m) => ({ ...m, id: "m:" + m.id, rm: "mine" });
	const flags = (h) => ({
		on: !!(h && h.c1 && (h.cc || h.mc)),
		g: !!(h && h.cc),
		tr: !!(h && h.cc && h.ct),
		dm: !!(window.LGDm && h && h.cd),
		mn: !!(h && h.mc),
		gl: !!(h && h.gch),
	});
	const on = () => !!(S.inst && H.chat && H.chat.on);
	const rooms = () => {
		const F = flags(S.ctx && S.ctx.hero());
		return [...(F.g ? ["city"] : []), ...(F.mn ? ["mine"] : [])];
	};
	const D = () => root.document;

	function make() {
		if (S.inst || !root.LGChat || !D()) return S.inst;
		S.hold = D().createElement("div");
		S.hold.className = "co-host";
		S.hold.innerHTML = root.LGChat.html({
			name: "Чат",
			ph: "Написать в чат города…",
			one: true,
		});
		S.box = S.hold.querySelector(".cy-chat");
		S.inst = root.LGChat.make({
			one: true,
			state: () => H,
			X: () => S.ctx,
			key: "lgChatOne",
			name: "Чат",
			ph: "Написать в чат города…",
			where: "в чате",
			base: "/api/city/chat",
			baseFor: (rm) => (rm === "mine" ? "/api/mine/chat" : "/api/city/chat"),
			say: "/api/chat/say",
			sayTo: (tab) => ({
				url: "/api/chat/say",
				body:
					tab === "mn"
						? { room: "mine" }
						: { room: "city", ...(tab === "tr" ? { k: "tr" } : {}) },
			}),
			tag: (m, rm) => (rm === "mine" ? tagM(m) : m),

			older: async (tab, before) => {
				const room = tab === "mn" ? "mine" : "city",
					r = await S.ctx.api(
						`/api/chat/feed?room=${room}&before=${encodeURIComponent(before)}${tab === "tr" ? "&k=tr" : ""}`,
					);
				if (!r || !r.ok) return null;
				return {
					chat: (r.chat || []).map((m) =>
						room === "mine" ? tagM(m) : tab === "tr" ? { ...m, k: "tr" } : m,
					),
					more: !!r.more,
				};
			},
			flags,
			trade: true,

			win: { key: "lgChatOneWin" },
			bubble: (l, t, id) => {
				if (String(id).startsWith("m:")) return;
				const C = root.LGCity;
				if (C && C.bubble) C.bubble(l, t, id);
			},
			unbubble: (id) => {
				const C = root.LGCity;
				if (C && C.unbubble) C.unbubble(id);
			},
		});
		return S.inst;
	}

	function init(ctx) {
		S.ctx = ctx;
		if (!make()) return;
		S.inst.init();
		setsAdd();
		if (!on()) {
			hide();
			stopAll();
			return;
		}
		const box = S.box;
		if (box && !box.dataset.coBound) {
			box.dataset.coBound = "1";

			new MutationObserver(() => sync()).observe(box, {
				attributes: true,
				attributeFilter: ["class"],
			});
		}
		place();
		sync();

		if (!S.onSent) {
			S.onSent = true;
			root.dispatchEvent(new root.CustomEvent("lg-chatone-on"));
		}
	}

	function setsAdd() {
		const L = root.LGSettings;
		if (!L || !L.add || S.setsOn) return;
		S.setsOn = true;
		L.add({
			id: "chat",
			title: "Чат",
			when: () => on(),
			render(el) {
				const draw = (msg) => {
					const own = !!(S.inst && S.inst.tabsSaved());
					el.innerHTML =
						`<p class="co-set-t">Вкладки чата можно менять местами: потяни вкладку (на телефоне - подержи) или Alt+стрелка. «Общий» всегда первый.</p>` +
						`<button type="button" class="btn ghost sm" data-a="tabs-reset"${own ? "" : " disabled"}>Сбросить порядок вкладок</button>` +
						`<p class="co-set-m" role="status">${msg || (own ? "" : "Сейчас порядок по умолчанию.")}</p>`;
					el.querySelector('[data-a="tabs-reset"]').onclick = () => {
						if (S.inst) S.inst.tabsReset();
						draw("Порядок вкладок сброшен.");
					};
				};
				draw("");
			},
		});
	}
	function hide() {
		if (S.fl) S.fl.hidden = true;
	}
	function stopAll() {
		clearInterval(S.watchT);
		clearInterval(S.pollT);
		clearInterval(S.cntT);
		S.watchT = S.pollT = S.cntT = 0;
		if (S.watching) {
			S.watching = "";
			S.ctx && S.ctx.api("/api/chat/watch", { on: false });
		}
	}

	async function feed(room, since) {
		S.syncAt = Date.now();
		const c = S.c[room],
			r = await S.ctx.api(
				`/api/chat/feed?room=${room}${since && c != null ? "&c=" + c : ""}`,
			);
		if (!r || !r.ok) {
			if (r && r.error === "чат пока закрыт") S.loaded[room] = false;
			return;
		}

		if (since && c != null && r.c != null && +r.c < +c) {
			S.loaded[room] = false;
			return feed(room, false);
		}
		if (!since) {
			S.inst.enter(
				{
					...r,
					chat: (r.chat || []).map((m) => (room === "mine" ? tagM(m) : m)),
				},
				room,
			);
			S.loaded[room] = true;
		} else
			S.inst.apply(
				{
					chat: (r.chat || []).map((m) => (room === "mine" ? tagM(m) : m)),
					chatDel: (r.chatDel || []).map((id) =>
						room === "mine" ? "m:" + id : id,
					),
				},
				room,
			);
		if (r.c != null)
			S.c[room] = since ? Math.max(+S.c[room] || 0, +r.c || 0) : +r.c || 0;
	}

	async function watchNow(R, force) {
		const c = {};
		for (const room of R)
			if (S.loaded[room] && S.c[room] != null) c[room] = S.c[room];
		const r = await S.ctx.api("/api/chat/watch", {
			on: true,
			rooms: R,
			...(Object.keys(c).length ? { c } : {}),
		});
		if (!on() || !isOpen() || S.watching !== R.join(",")) return;
		for (const room of R) {
			if (!r || !r.ok) {
				if (force) feed(room, S.loaded[room]);
				continue;
			}
			const last = r.last ? r.last[room] : null;
			if (last != null && S.c[room] != null && +last < +S.c[room]) {
				S.loaded[room] = false;
				feed(room, false);
				continue;
			}

			const miss =
				!!(r.miss && r.miss[room] > 0) &&
				!(last != null && S.c[room] != null && +S.c[room] >= +last);
			if (force || miss || !S.loaded[room]) feed(room, S.loaded[room]);
		}
	}

	function resync() {
		if (!on() || !S.ctx) return;
		if (Date.now() - S.syncAt < 3000) return;
		S.syncAt = Date.now();
		if (isOpen()) {
			const R = rooms();
			if (R.length && S.watching === R.join(",")) watchNow(R, false);
			else sync();
		} else count();
	}
	if (root.document && root.document.addEventListener)
		root.document.addEventListener("visibilitychange", () => {
			if (root.document.hidden) {
				S.hidAt = Date.now();
				return;
			}
			if (S.hidAt && Date.now() - S.hidAt > 20000) resync();
			S.hidAt = 0;
		});

	function onFeed(room, d) {
		if (!on() || !d) return;
		const mine = room === "mine";

		if (d.c != null && S.c[room] != null && +d.c < +S.c[room] && !S.fullT)
			S.fullT = setTimeout(() => {
				S.fullT = 0;
				if (on() && isOpen()) {
					S.loaded[room] = false;
					feed(room, false);
				}
			}, 1500);
		S.inst.apply(
			{
				...(d.chat ? { chat: d.chat.map((m) => (mine ? tagM(m) : m)) } : {}),
				...(d.chatDel
					? { chatDel: d.chatDel.map((id) => (mine ? "m:" + id : id)) }
					: {}),
				...(d.chatMe ? { chatMe: d.chatMe } : {}),
			},
			room,
		);
		if (d.c != null) S.c[room] = Math.max(+S.c[room] || 0, +d.c || 0);
	}

	function enterFeed(room, r) {
		if (!on() || !r) return;
		S.inst.enter(
			{
				...r,
				chat: (r.chat || []).map((m) => (room === "mine" ? tagM(m) : m)),
			},
			room,
		);
		S.loaded[room] = true;
		if (r.c != null) S.c[room] = +r.c || 0;
	}
	const isOpen = () => !!(H.chat && H.chat.open);
	function sync() {
		if (!on()) {
			stopAll();
			return;
		}
		const R = rooms(),
			key = isOpen() ? R.join(",") : "";
		if (key !== S.watching) {
			S.watching = key;
			clearInterval(S.watchT);
			clearInterval(S.pollT);
			clearInterval(S.cntT);
			S.watchT = S.pollT = S.cntT = 0;
			if (key) {
				const w = () => {
					if (!root.document || !root.document.hidden) watchNow(R, false);
				};
				S.watchT = setInterval(w, +root.LG_CHAT_WATCH_MS || 60_000);

				S.syncAt = Date.now();
				watchNow(R, true);

				const U = root.LGSiteUi,
					B =
						U && U.backoff
							? U.backoff({ steps: U.POLL_STEPS, jitter: 0.5, up: true })
							: null;
				let at = Date.now() + (B ? B.peek() : 10000);
				S.pollT = setInterval(() => {
					if (S.ctx.live && S.ctx.live()) return;
					if (root.document && root.document.hidden) return;
					if (S.ctx.pollOk && !S.ctx.pollOk()) return;
					if ((U && U.hold && U.hold.left()) || Date.now() < at) return;
					at = Date.now() + (B ? B.peek() : 10000);
					for (const room of R) feed(room, S.loaded[room]);
				}, 5000);
			} else {
				S.ctx.api("/api/chat/watch", { on: false });
				S.cntT = setInterval(count, 60_000);
			}
		}
	}

	async function count() {
		if (!on() || isOpen() || (root.document && root.document.hidden)) return;
		const q = [
			S.c.city != null ? "city=" + S.c.city : "",
			S.c.mine != null ? "mine=" + S.c.mine : "",
		]
			.filter(Boolean)
			.join("&");
		if (!q) return;
		const r = await S.ctx.api("/api/chat/count?" + q);
		if (!r || !r.ok) return;
		if (r.city) {
			S.inst.unAdd("g", r.city.g);
			S.inst.unAdd("tr", r.city.tr);
			S.c.city = r.city.c;
			S.loaded.city = true;
		}
		if (r.mine) {
			S.inst.unAdd("mn", r.mine.g);
			S.c.mine = r.mine.c;
			S.loaded.mine = true;
		}

		if (r.city) S.loaded.city = false;
		if (r.mine) S.loaded.mine = false;
	}

	function dock(k, sceneRoot) {
		S.docks.delete(k);
		if (sceneRoot) S.docks.set(k, sceneRoot);
		place();
	}

	const covered = () =>
		!!(D() && D().documentElement.classList.contains("gu-wopen"));
	const shown = (x) =>
		!covered() &&
		!!(x && x.isConnected && x.getClientRects && x.getClientRects().length);
	function place() {
		if (!S.inst || !S.box) return;
		const box = S.box;
		if (!on()) {
			hide();
			return;
		}

		const l0 = box.querySelector(".cy-chat-l"),
			par0 = box.parentNode;
		const sv =
			l0 && l0.clientHeight
				? {
						end: l0.scrollHeight - l0.scrollTop - l0.clientHeight < 40,
						top: l0.scrollTop,
					}
				: S.sv || null;
		if (sv) S.sv = sv;
		let at = null,
			k0 = "";

		for (const [k, x] of [...S.docks].reverse()) {
			if (!x.isConnected) {
				S.docks.delete(k);
				continue;
			}
			if (shown(x) && (k !== "city" || !at)) {
				if (k === "city") {
					if (!at) {
						at = x;
						k0 = k;
					}
					continue;
				}
				at = x;
				k0 = k;
				break;
			}
		}

		const leave = (to) => {
			if (!par0 || to === par0 || (to && to.contains(par0))) return;
			let from = null;
			for (const x of S.docks.values())
				if (x !== to && x.contains(box)) {
					from = x;
					break;
				}
			if (!from) return;
			const ph = D().createElement("div");
			ph.className = "cy-chat co-slot";
			ph.hidden = true;
			ph.setAttribute("aria-hidden", "true");
			box.before(ph);
		};
		if (at) {
			leave(at);
			const slot = [...at.querySelectorAll(".cy-chat")].find((x) => x !== box);
			if (slot) {
				slot.replaceWith(box);
			} else if (!at.contains(box)) at.appendChild(box);
			if (S.fl) S.fl.hidden = true;
		} else {
			const fl = floatEl();
			if (box.parentNode !== fl) {
				leave(fl);
				fl.appendChild(box);
			}
			fl.hidden = false;
		}

		const want =
			k0 === "mine"
				? "mn"
				: k0 === "city"
					? "g"
					: k0 === "guildhall" && H.chat && H.chat.gl
						? "gl"
						: "";
		const auto =
			H.chat &&
			(H.chat.tab === "g" ||
				H.chat.tab === "mn" ||
				(H.chat.tab === "gl" && S.place === "gl"));
		if (want && want !== S.place && auto && H.chat.tab !== want)
			S.inst.tab(want);
		S.place = want;
		const back = () => {
			const l = box.querySelector(".cy-chat-l");
			if (!l || !sv || !l.clientHeight) return;
			l.scrollTop = sv.end ? l.scrollHeight : sv.top;
		};
		const moved = box.parentNode !== par0;
		if (moved) back();
		S.inst.render();
		S.inst.size();
		if (moved) {
			back();
			(root.requestAnimationFrame || setTimeout)(back);
		}
		if (root.LGDm) root.LGDm.place();
	}
	function floatEl() {
		if (S.fl) return S.fl;
		const fl = D().createElement("div");
		fl.className = "co-float";
		fl.hidden = true;
		D().body.appendChild(fl);
		S.fl = fl;
		return fl;
	}

	root.LGChatOne = {
		init,
		on,
		dock,
		place,
		onFeed,
		enterFeed,
		sync,
		resync,
		state: () => H.chat,
		rooms,
		tabsReset: () => {
			if (S.inst) S.inst.tabsReset();
		},
		size: () => {
			if (S.inst) S.inst.size();
		},
	};
})(typeof self !== "undefined" ? self : this);
