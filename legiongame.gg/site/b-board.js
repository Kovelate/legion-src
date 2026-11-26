(() => {
	(window.LGCityBuildings = window.LGCityBuildings || {}).board = (C, SH) => {
		const esc = C.esc;

		const NEWS_TAGS = {
			update: "Обновление",
			balance: "Баланс",
			event: "Событие",
			fix: "Исправления",
		};

		const newsTags = (p) =>
			(Array.isArray(p.tags) ? p.tags : p.tag ? [p.tag] : []).filter(
				(k, i, a) => NEWS_TAGS[k] && a.indexOf(k) === i,
			);
		let NEWS = [];
		const newsDay = (t) =>
			t
				? new Date(t).toLocaleDateString("ru-RU", {
						day: "numeric",
						month: "long",
					})
				: "";

		const newsText = (html) => {
			const d = document.createElement("template");
			d.innerHTML = html || "";
			d.content.querySelectorAll("figure").forEach((f) => f.remove());
			return (d.content.textContent || "").replace(/\s+/g, " ").trim();
		};
		async function loadNews() {
			const box = C.S.panel.querySelector(".cy-news");
			if (!box) return;
			let r = null;
			try {
				r = await (
					await fetch((window.LG_BASE || "") + "/api/news", {
						credentials: "same-origin",
					})
				).json();
			} catch {}
			if (!C.S || C.S.panelId !== "board") return;
			box.removeAttribute("aria-busy");
			newsBoard(box, (r && r.list) || []);
		}
		function newsBoard(box, list) {
			NEWS = list.slice(0, 10);
			if (!NEWS.length) {
				box.innerHTML = '<p class="note">На доске пока пусто.</p>';
				return;
			}
			box.innerHTML =
				`<ul class="cy-notes">${NEWS.slice(0, 6)
					.map((p, i) => {
						const t = newsText(p.html),
							tag = newsTags(p)
								.map((k) => NEWS_TAGS[k])
								.join(" · ");

						return `<li class="cy-note" data-read="${i}" style="--r:${[-1.5, 1, -0.5, 1.5, -1, 0.5][i]}deg"><div class="cy-nin"><span class="cy-ntop">${tag ? `<em>${esc(tag)}</em>` : ""}<time>${esc(newsDay(p.at))}</time></span><b id="cyn-${i}">${esc(p.title)}</b><p>${esc(t.length > 140 ? t.slice(0, 138) + "…" : t)}</p><button type="button" class="cy-nr" aria-describedby="cyn-${i}">Читать полностью</button></div></li>`;
					})
					.join("")}</ul>` +
				`<div class="cy-nbtn"><button type="button" class="btn primary" data-read="0">Читать на весь экран</button><button type="button" class="btn ghost" data-news>Все новости</button></div>`;

			box.querySelectorAll("[data-read]").forEach((b) => {
				b.onclick = () =>
					newsRead(+b.dataset.read, b.querySelector(".cy-nr") || b);
			});
			box.querySelector("[data-news]").onclick = () => C.X && C.X.tab("news");
		}

		let readEl = null,
			readBack = null;
		function newsRead(i, from) {
			if (!NEWS.length) return;
			i = (i + NEWS.length) % NEWS.length;
			const p = NEWS[i],
				html = p.html || "",
				m = /<figure class="nw-fig">[\s\S]*?<\/figure>/.exec(html);
			const cover = m
					? m[0].replace(
							'<figure class="nw-fig">',
							'<figure class="nw-fig nw-cover">',
						)
					: "",
				bodyHtml = m
					? (
							html.slice(0, m.index) + html.slice(m.index + m[0].length)
						).replace(/^\s+/, "")
					: html;
			if (!readEl) {
				readBack = from || document.activeElement;
				readEl = document.createElement("div");
				readEl.className = "cy-read";
				readEl.setAttribute("role", "dialog");
				readEl.setAttribute("aria-modal", "true");
				readEl.setAttribute("aria-labelledby", "cyr-t");
				(document.fullscreenElement || document.body).appendChild(readEl);
				document.documentElement.classList.add("cy-reading");
				readEl.addEventListener("keydown", newsKeys);
			}
			readEl.dataset.i = String(i);
			readEl.innerHTML =
				`<div class="cy-rd-top"><b>Доска объявлений</b><span>${i + 1} из ${NEWS.length}</span><button type="button" class="cy-rd-x" aria-label="Закрыть"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>` +
				`<div class="cy-rd-in">${NEWS.length > 1 ? `<nav class="cy-rd-list" aria-label="Новости на доске">${NEWS.map((x, k) => `<button type="button" data-go="${k}"${k === i ? ' aria-current="true"' : ""}><time>${esc(newsDay(x.at))}</time>${esc(x.title)}</button>`).join("")}</nav>` : ""}` +
				`<article class="cy-rd-paper">${cover}<div class="nw-meta">${newsTags(p)
					.map(
						(k) =>
							`<span class="nw-tag" data-tag="${esc(k)}">${esc(NEWS_TAGS[k])}</span>`,
					)
					.join(
						"",
					)}<time>${esc(newsDay(p.at))}</time></div><h2 class="nw-t" id="cyr-t">${esc(p.title)}</h2><div class="nw-body">${bodyHtml}</div>` +
				`<div class="cy-rd-nav">${NEWS.length > 1 ? `<button type="button" class="btn ghost" data-go="${i - 1}">← Новее</button><button type="button" class="btn ghost" data-go="${i + 1}">Старее →</button>` : ""}<button type="button" class="btn ghost" data-talk>Обсудить в «Новостях»</button></div></article></div>`;
			readEl.querySelector(".cy-rd-x").onclick = newsClose;
			readEl.onclick = (e) => {
				if (e.target === readEl || e.target.classList.contains("cy-rd-in"))
					newsClose();
			};
			readEl.querySelectorAll("[data-go]").forEach((b) => {
				b.onclick = () => newsRead(+b.dataset.go);
			});
			readEl.querySelector("[data-talk]").onclick = () => {
				newsClose();
				if (C.X) C.X.tab("news");
			};
			const paper = readEl.querySelector(".cy-rd-paper");
			if (paper) paper.scrollTop = 0;
			readEl.querySelector(".cy-rd-in").scrollTop = 0;
			readEl.querySelector(".cy-rd-x").focus();
		}
		function newsKeys(e) {
			if (e.key === "Escape") {
				e.preventDefault();
				newsClose();
				return;
			}
			if (
				(e.key === "ArrowLeft" || e.key === "ArrowRight") &&
				NEWS.length > 1 &&
				!/^(INPUT|TEXTAREA)$/.test((e.target && e.target.tagName) || "")
			) {
				e.preventDefault();
				newsRead(+readEl.dataset.i + (e.key === "ArrowLeft" ? -1 : 1));
				return;
			}
			if (e.key === "Tab") {
				const f = [...readEl.querySelectorAll("button, a[href]")].filter(
					(x) => x.offsetParent !== null,
				);
				if (!f.length) return;
				const a = f[0],
					z = f[f.length - 1];
				if (e.shiftKey && document.activeElement === a) {
					e.preventDefault();
					z.focus();
				} else if (!e.shiftKey && document.activeElement === z) {
					e.preventDefault();
					a.focus();
				}
			}
		}
		function newsClose() {
			if (!readEl) return;
			readEl.remove();
			readEl = null;
			document.documentElement.classList.remove("cy-reading");
			try {
				if (readBack && readBack.isConnected) readBack.focus();
			} catch {}
			readBack = null;
		}

		const api = (b) =>
			C.X && C.X.api
				? C.X.api("/api/dailies/act", b)
				: fetch((window.LG_BASE || "") + "/api/dailies/act", {
						credentials: "same-origin",
						method: "POST",
						headers: { "content-type": "application/json" },
						body: JSON.stringify(b),
					}).then(
						(r) => r.json().catch(() => ({ ok: false, error: "не вышло" })),
						() => ({ ok: false, error: "нет связи" }),
					);
		let TB = null,
			pickSel = null;
		async function loadTasks(b) {
			const box = C.S && C.S.panel && C.S.panel.querySelector(".cy-tasks");
			if (!box) return;
			let r = null;
			try {
				r = await api(b || { op: "board" });
			} catch (e) {
				r = null;
			}
			if (!C.S || C.S.panelId !== "board" || !box.isConnected) return;
			if (!r || !r.ok || !r.board) {
				if (b && r && r.error && C.X && C.X.toast) C.X.toast(r.error, true);
				if (!b) box.hidden = true;
				if (!TB) return;
			} else TB = r.board;
			box.hidden = false;
			tasksRender(box);
		}
		function tasksRender(box) {
			const B = TB;
			if (!B) return;
			const li = (x, i) =>
				`<li class="cy-note cy-task${x.done ? " done" : ""}" style="--r:${[-1, 1, -0.5][i % 3]}deg"><div class="cy-nin"><b>${esc(x.t)}</b><p>${x.took ? `${x.got} / ${x.n} ${esc(x.u)}` : `нужно: ${x.n} ${esc(x.u)}`}</p>` +
				(x.done
					? '<span class="cy-tk-ok">Выполнено</span>'
					: x.took
						? ""
						: `<button type="button" class="btn primary" data-take="${esc(x.id)}">Взять</button>`) +
				"</div></li>";
			let h =
				`<h3 class="cy-tk-h">Задания дня города</h3><p class="note">${B.chosen ? `Выбрал${B.by ? ": " + esc(B.by) : "о руководство"}.` : "Руководство ещё не выбрало - задания выпали сами."} Награда - монеты, опыт, жетоны; казна города получает сверху.</p>` +
				`<ul class="cy-notes">${B.list.map(li).join("")}</ul>`;
			if (B.can && Array.isArray(B.offer)) {
				if (!pickSel)
					pickSel = new Set(B.chosen ? B.list.map((x) => x.id) : []);
				h +=
					`<details class="cy-tk-pick"><summary>Выбрать задания на сегодня (${B.list.length})</summary><div class="cy-tk-opts">${B.offer.map((x) => `<label><input type="checkbox" data-pick="${esc(x.id)}"${pickSel.has(x.id) ? " checked" : ""}> ${esc(x.t)} - ${x.n} ${esc(x.u)}</label>`).join("")}</div>` +
					`<button type="button" class="btn primary" data-pick-ok>Повесить на доску</button></details>`;
			}
			box.innerHTML = h;
			box.querySelectorAll("[data-take]").forEach((b) => {
				b.onclick = () => {
					b.disabled = true;
					loadTasks({ op: "boardTake", id: b.dataset.take });
				};
			});
			box.querySelectorAll("[data-pick]").forEach((c) => {
				c.onchange = () => {
					if (c.checked) pickSel.add(c.dataset.pick);
					else pickSel.delete(c.dataset.pick);
				};
			});
			const ok = box.querySelector("[data-pick-ok]");
			if (ok)
				ok.onclick = () => {
					ok.disabled = true;
					loadTasks({ op: "boardPick", ids: [...pickSel] });
				};
		}

		return {
			body: () =>
				`<div class="cy-tasks" hidden></div><div class="cy-news" aria-busy="true"><p class="note">Срываем свежие листки с доски…</p></div>`,
			after: () => {
				TB = null;
				pickSel = null;
				loadTasks();
				loadNews();
			},
			render: (box, list) => newsBoard(box, list),
			read: (i) => newsRead(i),
			close: () => newsClose(),
		};
	};
})();
