(() => {
	(window.LGCityBuildings = window.LGCityBuildings || {}).trainer = (C, SH) => {
		const say = (t) => C.say(t),
			rerenderUi = (id) => C.rerender(id);

		let skWait = null;
		function skLoad() {
			if (skWait || typeof window.LGSiteLazy !== "function") return;
			skWait = window.LGSiteLazy("skills").then((ok) => {
				skWait = null;
				if (ok && window.LGSkills) rerenderUi("trainer");
			});
		}
		function trainerBody(h) {
			if (h.sk && !window.LGSkills && typeof window.LGSiteLazy === "function") {
				skLoad();
				return `${say("Сейчас, разложу свитки с приёмами…")}<p class="note" role="status">Загружаю дерево навыков…</p>`;
			}
			if (!h.sk || !window.LGSkills)
				return `${say("Тренер скоро начнёт обучение. Приходи позже — покажу пару приёмов.")}<p class="note">Дерево навыков пока открыто только тестерам.</p>`;
			return `<div class="cy-sk sk-wrap">${window.LGSkills.html(
				h,
				C.X.skx(() => rerenderUi("trainer")),
				{ tree: true },
			)}</div>`;
		}
		function trainerAfter(h) {
			if (h && h.sk && window.LGSkills)
				window.LGSkills.bind(
					C.S.panel,
					C.X.skx(() => rerenderUi("trainer")),
				);
		}

		return { body: (h) => trainerBody(h), after: (h) => trainerAfter(h) };
	};
})();
