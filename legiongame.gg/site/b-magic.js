(() => {
	(window.LGCityBuildings = window.LGCityBuildings || {}).magic = (C, SH) => {
		const { shopBar, stockOf } = SH;
		function magicBody(h) {
			return shopBar(
				h,
				stockOf("magic")
					? ""
					: '<span class="cy-bnote">Чародей раскладывает товар…</span>',
			);
		}

		return { body: (h) => magicBody(h) };
	};
})();
