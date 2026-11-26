window.LGArenaLocs = (() => {
	const r = (v) => Math.round(v * 10) / 10;
	const nz = (i, k = 4.1) => {
		const x = Math.sin(i * 12.9898 + k) * 43758.5453;
		return x - Math.floor(x);
	};
	const O = "#22161a";
	const HZ = 210;
	const NAMES = {
		colosseum: "Колизей",
		glade: "Лесная поляна",
		winter: "Зимний двор крепости",
		desert: "Пустынная арена",
		night: "Ночной двор",
		ruins: "Руины подземелья",
	};
	const IDS = ["colosseum", "glade", "winter", "desert", "night"];
	const lg = (id, stops, x2 = 0, y2 = 1) =>
		`<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join("")}</linearGradient>`;
	const rg = (id, stops) =>
		`<radialGradient id="${id}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ""}/>`).join("")}</radialGradient>`;

	function persp(stroke, op, n = 8, step = 200) {
		let d = "";
		for (let t = 1; t <= n; t++) {
			const y = r(HZ + (1000 - HZ) * (t / (n + 0.4)) ** 1.5);
			d += `M0 ${y}H1600`;
		}
		for (let xb = -1200; xb <= 2800; xb += step) {
			const xt = 800 + (xb - 800) * 0.18;
			d += `M${r(xt)} ${HZ}L${xb} 1000`;
		}
		return `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="2.4" opacity="${op}"/>`;
	}

	const glow = (x, y, R, c, k = 1) =>
		`<g fill="${c}"><ellipse cx="${r(x)}" cy="${r(y)}" rx="${r(R)}" ry="${r(R * k)}" opacity=".08"/><ellipse cx="${r(x)}" cy="${r(y)}" rx="${r(R * 0.62)}" ry="${r(R * 0.62 * k)}" opacity=".1"/><ellipse cx="${r(x)}" cy="${r(y)}" rx="${r(R * 0.32)}" ry="${r(R * 0.32 * k)}" opacity=".14"/></g>`;
	const flame = (x, y, s = 1, c1 = "#ffb347", c2 = "#fff1c4") =>
		`<path d="M${r(x)} ${r(y - 34 * s)}q${r(13 * s)} ${r(15 * s)} ${r(10 * s)} ${r(25 * s)}q${r(-2 * s)} ${r(10 * s)} ${r(-10 * s)} ${r(10 * s)}q${r(-8 * s)} 0 ${r(-10 * s)} ${r(-10 * s)}q${r(-3 * s)} ${r(-10 * s)} ${r(10 * s)} ${r(-25 * s)}z" fill="${c1}" stroke="${O}" stroke-width="3" stroke-linejoin="round"/><path d="M${r(x)} ${r(y - 17 * s)}q${r(6 * s)} ${r(8 * s)} ${r(4 * s)} ${r(12 * s)}q${r(-1 * s)} ${r(4 * s)} ${r(-4 * s)} ${r(4 * s)}q${r(-3 * s)} 0 ${r(-4 * s)} ${r(-4 * s)}q${r(-1 * s)} ${r(-4 * s)} ${r(4 * s)} ${r(-12 * s)}z" fill="${c2}"/>`;

	const torch = (x, y, s = 1, pole = true) =>
		glow(x, y - 30 * s, 150 * s, "#ffb347") +
		(pole
			? `<path d="M${r(x - 5 * s)} ${r(y)}V${r(y + 150 * s)}h${r(10 * s)}V${r(y)}z" fill="#5a3a26" stroke="${O}" stroke-width="3"/><path d="M${r(x - 22 * s)} ${r(y + 150 * s)}h${r(44 * s)}l${r(-8 * s)} ${r(-14 * s)}h${r(-28 * s)}z" fill="#5a3a26" stroke="${O}" stroke-width="3"/>`
			: "") +
		`<path d="M${r(x - 14 * s)} ${r(y - 4 * s)}h${r(28 * s)}l${r(-6 * s)} ${r(18 * s)}h${r(-16 * s)}z" fill="#3b2a24" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>` +
		flame(x, y - 4 * s, 1.3 * s);
	const stone = (x, y, w, h, c) =>
		`<path d="M${r(x - w / 2)} ${r(y)}q${r(w * 0.06)} ${r(-h)} ${r(w * 0.45)} ${r(-h)}q${r(w * 0.5)} ${r(h * 0.1)} ${r(w * 0.55)} ${r(h)}z" fill="${c}" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>`;
	const tuft = (x, y, s, c) =>
		`<path d="M${r(x - 9 * s)} ${r(y)}l${r(3 * s)} ${r(-14 * s)}M${r(x)} ${r(y)}v${r(-18 * s)}M${r(x + 9 * s)} ${r(y)}l${r(-3 * s)} ${r(-14 * s)}" stroke="${c}" stroke-width="${r(3.5 * s)}" stroke-linecap="round" fill="none"/>`;
	const pine = (x, y, s, c, cs) =>
		`<path d="M${r(x - 6 * s)} ${r(y)}v${r(-22 * s)}h${r(12 * s)}v${r(22 * s)}z" fill="#4a3426" stroke="${O}" stroke-width="3"/><path d="M${r(x)} ${r(y - 150 * s)}l${r(36 * s)} ${r(52 * s)}h${r(-16 * s)}l${r(34 * s)} ${r(44 * s)}h${r(-18 * s)}l${r(38 * s)} ${r(42 * s)}h${r(-148 * s)}l${r(38 * s)} ${r(-42 * s)}h${r(-18 * s)}l${r(34 * s)} ${r(-44 * s)}h${r(-16 * s)}z" fill="${c}" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>${cs ? `<path d="M${r(x)} ${r(y - 150 * s)}l${r(18 * s)} ${r(26 * s)}l${r(-10 * s)} ${r(-4 * s)}l${r(-8 * s)} ${r(8 * s)}l${r(-8 * s)} ${r(-8 * s)}l${r(-10 * s)} ${r(4 * s)}z" fill="${cs}"/>` : ""}`;
	const banner = (x, y, w, h, c, c2) =>
		`<path d="M${r(x)} ${r(y)}h${r(w)}v${r(h)}l${r(-w / 2)} ${r(-h * 0.18)}l${r(-w / 2)} ${r(h * 0.18)}z" fill="${c}" stroke="${O}" stroke-width="3" stroke-linejoin="round"/><path d="M${r(x + w * 0.22)} ${r(y + h * 0.2)}h${r(w * 0.56)}M${r(x + w * 0.5)} ${r(y + h * 0.12)}v${r(h * 0.5)}" stroke="${c2}" stroke-width="5" stroke-linecap="round"/><path d="M${r(x - 8)} ${r(y)}h${r(w + 16)}" stroke="${O}" stroke-width="6" stroke-linecap="round"/>`;

	function colosseum() {
		let tiers = "";

		const wallY = (x) => 50 + ((x - 800) / 800) ** 2 * 40;
		let face = `M-10 ${HZ}`;
		for (let x = -10; x <= 1610; x += 40) face += `L${x} ${r(wallY(x))}`;
		face += `L1610 ${HZ}z`;
		for (let row = 0; row < 3; row++) {
			for (let x = 0; x < 1600; x += 64) {
				const top = wallY(x + 32) + 14 + row * 44,
					h = 30,
					w = 34;
				if (top + h > HZ - 8) continue;
				tiers += `<path d="M${r(x + 15)} ${r(top + h)}v${r(-h * 0.5)}a${r(w / 2)} ${r(h * 0.5)} 0 0 1 ${w} 0v${r(h * 0.5)}z" fill="${row === 0 ? "#3a2430" : "#4a2c32"}" stroke="${O}" stroke-width="2.5"/>`;
			}
		}
		let cornice = "";
		for (let row = 0; row < 3; row++) {
			let d = "";
			for (let x = -10; x <= 1610; x += 40)
				d += `${x === -10 ? "M" : "L"}${x} ${r(wallY(x) + 8 + row * 44)}`;
			cornice += `<path d="${d}" fill="none" stroke="#f3d9b0" stroke-width="6" opacity=".55"/><path d="${d}" fill="none" stroke="${O}" stroke-width="2" opacity=".5"/>`;
		}
		let flags = "";
		for (let i = 0; i < 9; i++) {
			const x = 90 + i * 178,
				y = wallY(x) - 4;
			flags += `<path d="M${x} ${r(y)}v-46" stroke="${O}" stroke-width="5"/><path d="M${x} ${r(y - 46)}h40l-10 12 10 12h-40z" fill="${i % 2 ? "#d9534f" : "#f2c14e"}" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>`;
		}

		let shields = "";
		for (let i = 0; i < 8; i++) {
			const x = 100 + i * 200;
			shields += `<rect x="${x - 22}" y="${HZ - 58}" width="44" height="52" rx="9" fill="${i % 2 ? "#b33a3a" : "#c79a3a"}" stroke="${O}" stroke-width="3"/><circle cx="${x}" cy="${HZ - 32}" r="8" fill="#f3d9b0" stroke="${O}" stroke-width="2.5"/>`;
		}

		let rake = "";
		for (let i = 0; i < 26; i++) {
			const y = r(HZ + 40 + i * 30 + nz(i) * 10);
			rake += `M${r(40 + nz(i + 3) * 200)} ${y}q${r(120 + nz(i + 9) * 80)} ${r(-6)} ${r(260 + nz(i + 4) * 160)} 0`;
			rake += `M${r(1200 + nz(i + 5) * 200)} ${y}q${r(120)} ${r(-6)} ${r(240 + nz(i + 6) * 120)} 0`;
		}
		let pebbles = "";
		for (let i = 0; i < 14; i++) {
			const x = 40 + nz(i + 40) * 1520,
				y = HZ + 60 + nz(i + 60) * 720;
			if (Math.abs(x - 800) < 380 && Math.abs(y - 560) < 240) continue;
			pebbles += stone(x, y, 18 + nz(i) * 16, 8 + nz(i + 1) * 6, "#b98e5e");
		}
		const sideCol = (x, flip) =>
			`<g${flip ? ` transform="translate(${2 * x} 0) scale(-1 1)"` : ""}><path d="M${x - 40} 1000V360l14-18h52l14 18V1000z" fill="#e7cfa4" stroke="${O}" stroke-width="4"/><path d="M${x - 20} 380V990M${x} 380V990M${x + 20} 380V990" stroke="#b9996c" stroke-width="5"/><rect x="${x - 58}" y="326" width="116" height="22" rx="4" fill="#e7cfa4" stroke="${O}" stroke-width="4"/><rect x="${x - 50}" y="306" width="100" height="22" rx="4" fill="#d6ba8a" stroke="${O}" stroke-width="4"/>${banner(x - 34, 400, 68, 170, "#b33a3a", "#f2c14e")}</g>`;
		return `<defs>${lg("al-col-sky", [
			[0, "#f6b26b"],
			[1, "#ffe2a8"],
		])}${lg("al-col-sand", [
			[0, "#c9955e"],
			[0.35, "#deb07a"],
			[1, "#c48a52"],
		])}${rg("al-col-c", [
			[0, "#f6d29a", 0.55],
			[1, "#f6d29a", 0],
		])}</defs>
      <rect width="1600" height="${HZ}" fill="url(#al-col-sky)"/>
      <path d="${face}" fill="#c99a6a" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>${tiers}${cornice}${flags}
      <rect x="-10" y="${HZ - 70}" width="1620" height="72" fill="#a8744a" stroke="${O}" stroke-width="4"/>${shields}
      <rect x="0" y="${HZ}" width="1600" height="${1000 - HZ}" fill="url(#al-col-sand)"/>
      <ellipse cx="800" cy="580" rx="700" ry="300" fill="url(#al-col-c)"/>
      <path d="${rake}" fill="none" stroke="#a87444" stroke-width="3" opacity=".45" stroke-linecap="round"/>
      <ellipse cx="800" cy="575" rx="430" ry="170" fill="none" stroke="#f6e2bc" stroke-width="7" opacity=".55"/><ellipse cx="800" cy="575" rx="430" ry="170" fill="none" stroke="#8a5a34" stroke-width="2" opacity=".35" stroke-dasharray="18 14"/>
      <path d="M800 ${HZ + 4}V990" stroke="#f6e2bc" stroke-width="5" opacity=".3" stroke-dasharray="22 18"/>
      ${pebbles}${sideCol(60, false)}${sideCol(1540, true)}
      <g transform="translate(250 890)"><path d="M-70 0l60-110M-20 0l70-120" stroke="#5a3a26" stroke-width="8" stroke-linecap="round"/><path d="M-14 -116l8-26 10 24zM46 -126l10-24 6 26z" fill="#cfd6de" stroke="${O}" stroke-width="3"/><ellipse cx="-30" cy="-18" rx="44" ry="20" fill="#b33a3a" stroke="${O}" stroke-width="3"/></g>
      <g transform="translate(1330 890)"><rect x="-50" y="-70" width="70" height="70" rx="6" fill="#8a5a34" stroke="${O}" stroke-width="3"/><path d="M-50 -48h70M-50 -24h70" stroke="${O}" stroke-width="2.5"/><circle cx="50" cy="-26" r="26" fill="#c79a3a" stroke="${O}" stroke-width="3"/><circle cx="50" cy="-26" r="8" fill="#f3d9b0" stroke="${O}" stroke-width="2"/></g>`;
	}

	function glade() {
		let far = `M-10 ${HZ}V120`;
		for (let x = -10, i = 0; x < 1620; x += 60, i++)
			far += `Q${x + 30} ${r(60 + nz(i) * 40)} ${x + 60} ${r(110 + nz(i + 5) * 24)}`;
		far += `V${HZ}z`;
		let mid = "";
		for (let i = 0; i < 22; i++)
			mid += pine(
				i * 78 + nz(i + 2) * 30,
				HZ + 6,
				0.62 + nz(i + 8) * 0.3,
				i % 3 ? "#2f6a3e" : "#2a5c38",
			);
		let flowers = "",
			grass = "";
		for (let i = 0; i < 70; i++) {
			const x = 30 + nz(i + 100) * 1540,
				y = HZ + 30 + nz(i + 200) * 750;
			if (((x - 800) / 520) ** 2 + ((y - 590) / 250) ** 2 < 1) continue;
			if (i % 4 === 0)
				flowers += `<circle cx="${r(x)}" cy="${r(y)}" r="${r(6 + nz(i) * 3)}" fill="${["#ffd166", "#ff8fa3", "#ffffff", "#b9a2ff"][i % 4 === 0 ? (i / 4) % 4 : 0]}" stroke="${O}" stroke-width="2"/><circle cx="${r(x)}" cy="${r(y)}" r="2.4" fill="${O}" opacity=".6"/>`;
			else grass += tuft(x, y, 0.9 + nz(i + 7) * 0.7, "#3c7a32");
		}
		const stump = `<g transform="translate(1300 870)"><path d="M-60 0v-70q60 -18 120 0v70z" fill="#7a5034" stroke="${O}" stroke-width="4"/><ellipse cx="0" cy="-70" rx="60" ry="16" fill="#c99a6a" stroke="${O}" stroke-width="4"/><ellipse cx="0" cy="-70" rx="34" ry="8" fill="none" stroke="#8a5a34" stroke-width="3"/><path d="M-60 0q-20 6 -36 2M60 0q22 4 34 -4" stroke="${O}" stroke-width="5" fill="none" stroke-linecap="round"/></g>`;
		const log = `<g transform="translate(260 900)"><rect x="-190" y="-54" width="300" height="54" rx="26" fill="#7a5034" stroke="${O}" stroke-width="4"/><ellipse cx="110" cy="-27" rx="20" ry="27" fill="#c99a6a" stroke="${O}" stroke-width="4"/><path d="M-150 -40h80M-120 -18h120" stroke="#5a3a26" stroke-width="4" stroke-linecap="round"/><path d="M-40 -54q6 -22 24 -26" stroke="#3c7a32" stroke-width="6" fill="none" stroke-linecap="round"/><ellipse cx="-80" cy="-58" rx="24" ry="8" fill="#5f9a3e" stroke="${O}" stroke-width="2.5"/></g>`;
		const shroom = (x, y, s) =>
			`<g transform="translate(${x} ${y}) scale(${s})"><path d="M-6 0v-22h12v22z" fill="#f3efd9" stroke="${O}" stroke-width="3"/><path d="M-26 -20q26 -36 52 0z" fill="#d9534f" stroke="${O}" stroke-width="3"/><circle cx="-8" cy="-28" r="4" fill="#fff"/><circle cx="9" cy="-25" r="3" fill="#fff"/></g>`;
		const bigTree = (x, flip) =>
			`<g${flip ? ` transform="translate(${2 * x} 0) scale(-1 1)"` : ""}><path d="M${x - 24} 1000V420h48V1000z" fill="#6a4630" stroke="${O}" stroke-width="4"/><path d="M${x - 24} 600q-40 -20 -60 -60M${x + 24} 520q34 -10 50 -44" stroke="#6a4630" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M${x} 130q120 10 130 130q60 70 -10 160q-40 90 -120 90q-110 10 -130 -90q-70 -80 -10 -160q10 -120 140 -130z" fill="#3f8a46" stroke="${O}" stroke-width="4"/><path d="M${x - 60} 260q40 -60 110 -40M${x - 80} 380q50 -40 120 -10" stroke="#5fae5a" stroke-width="12" fill="none" stroke-linecap="round" opacity=".7"/></g>`;
		return `<defs>${lg("al-gl-sky", [
			[0, "#9fd8f0"],
			[1, "#e4f6e0"],
		])}${lg("al-gl-g", [
			[0, "#5a9a44"],
			[0.4, "#6eae4c"],
			[1, "#4f8a3c"],
		])}${rg("al-gl-c", [
			[0, "#b99a62", 0.55],
			[0.75, "#a8945a", 0.35],
			[1, "#a8945a", 0],
		])}</defs>
      <rect width="1600" height="${HZ}" fill="url(#al-gl-sky)"/>
      <ellipse cx="1240" cy="70" rx="46" ry="46" fill="#fff6c4" stroke="${O}" stroke-width="3" opacity=".9"/>
      <path d="${far}" fill="#4f8a5a" stroke="${O}" stroke-width="3" stroke-linejoin="round" opacity=".85"/>${mid}
      <rect x="0" y="${HZ}" width="1600" height="${1000 - HZ}" fill="url(#al-gl-g)"/>
      <ellipse cx="800" cy="590" rx="560" ry="260" fill="url(#al-gl-c)"/>
      <path d="M560 ${HZ + 10}q120 140 240 160q120 30 260 160" stroke="#b99a62" stroke-width="40" fill="none" opacity=".35" stroke-linecap="round"/>
      ${grass}${flowers}
      ${stone(470, 470, 60, 26, "#8e9aa0")}${stone(1150, 420, 44, 20, "#8e9aa0")}${stone(980, 860, 50, 22, "#8e9aa0")}
      ${shroom(1420, 760, 1)}${shroom(1450, 772, 0.7)}${shroom(170, 700, 0.8)}
      ${stump}${log}${bigTree(70, false)}${bigTree(1530, true)}`;
	}

	function winter() {
		let merlons = "";
		for (let x = -20; x < 1620; x += 56)
			merlons += `<rect x="${x}" y="58" width="34" height="34" fill="#8a94a8" stroke="${O}" stroke-width="3"/><rect x="${x - 2}" y="54" width="38" height="10" rx="5" fill="#f4f8ff"/>`;
		let bricks = "";
		for (let y = 104, row = 0; y < HZ - 6; y += 26, row++) {
			bricks += `M0 ${y}H1600`;
			for (let x = (row % 2) * 40; x < 1600; x += 80) bricks += `M${x} ${y}v26`;
		}
		const tower = (x) =>
			`<rect x="${x - 70}" y="20" width="140" height="${HZ - 18}" fill="#7a8498" stroke="${O}" stroke-width="4"/>${[0, 1, 2].map((k) => `<rect x="${x - 76 + k * 52}" y="2" width="36" height="30" fill="#7a8498" stroke="${O}" stroke-width="3"/><rect x="${x - 78 + k * 52}" y="-2" width="40" height="10" rx="5" fill="#f4f8ff"/>`).join("")}<path d="M${x - 16} 120v-28a16 16 0 0 1 32 0v28z" fill="#1d2433" stroke="${O}" stroke-width="3"/><path d="M${x - 16} 104h32" stroke="#ffcf6a" stroke-width="4" opacity=".55"/>${banner(x - 30, 130, 60, 66, "#3a5a9a", "#f4f8ff")}`;
		const gate = `<path d="M720 ${HZ}V140a80 70 0 0 1 160 0V${HZ}z" fill="#2a2430" stroke="${O}" stroke-width="4"/><path d="M736 ${HZ}V148a64 56 0 0 1 128 0V${HZ}" fill="none" stroke="#6a5040" stroke-width="10"/>${[0, 1, 2, 3].map((k) => `<path d="M${748 + k * 34} 108V${HZ}" stroke="#55505a" stroke-width="6"/>`).join("")}<path d="M736 150H864M736 182H864" stroke="#55505a" stroke-width="6"/>`;
		let drifts = "",
			prints = "",
			flakes = "";
		for (let i = 0; i < 9; i++) {
			const x = nz(i + 30) * 1600,
				y = HZ + 20 + nz(i + 31) * 40;
			drifts += `<path d="M${r(x - 120)} ${r(y + 20)}q60 -40 120 -36q70 4 120 36z" fill="#ffffff" stroke="#b8c6dc" stroke-width="3"/>`;
		}
		const trail = (x0, y0, x1, y1, n) => {
			const a = Math.atan2(y1 - y0, x1 - x0);
			for (let i = 0; i < n; i++) {
				const t = i / (n - 1),
					sd = i % 2 ? 10 : -10;
				prints += `<ellipse cx="${r(x0 + (x1 - x0) * t - Math.sin(a) * sd)}" cy="${r(y0 + (y1 - y0) * t + Math.cos(a) * sd)}" rx="7" ry="11" transform="rotate(${r(a * 57.3 + 90)} ${r(x0 + (x1 - x0) * t - Math.sin(a) * sd)} ${r(y0 + (y1 - y0) * t + Math.cos(a) * sd)})" fill="#a9b8d0" opacity=".55"/>`;
			}
		};
		trail(800, HZ + 20, 640, 980, 16);
		trail(240, 520, 600, 640, 8);
		trail(1400, 540, 1010, 660, 8);
		for (let i = 0; i < 60; i++) {
			const x = nz(i + 300) * 1600,
				y = nz(i + 400) * 1000;
			const s = 2 + nz(i + 500) * 3.5;
			flakes += `<circle cx="${r(x)}" cy="${r(y)}" r="${r(s)}" fill="#fff" opacity="${r(0.5 + nz(i) * 0.4)}"/>`;
		}
		const brazier = (x, y) =>
			glow(x, y - 40, 170, "#ffb347", 0.55) +
			`<path d="M${x - 46} ${y - 40}h92l-16 34h-60z" fill="#4a4048" stroke="${O}" stroke-width="4" stroke-linejoin="round"/><path d="M${x - 24} ${y - 6}l-14 50M${x + 24} ${y - 6}l14 50M${x} ${y - 6}v50" stroke="${O}" stroke-width="7" stroke-linecap="round"/>` +
			flame(x - 18, y - 40, 1.2) +
			flame(x + 16, y - 40, 1.5) +
			flame(x, y - 36, 1);
		const barrel = (x, y) =>
			`<g transform="translate(${x} ${y})"><path d="M-36 0q-8 -50 0 -100h72q8 50 0 100z" fill="#8a5a34" stroke="${O}" stroke-width="4"/><path d="M-40 -28h80M-40 -72h80" stroke="#4a4048" stroke-width="6"/><path d="M-38 -100q38 -24 76 0q-4 6 -10 6h-56q-6 0 -10 -6z" fill="#fff" stroke="#b8c6dc" stroke-width="3"/></g>`;
		const snowman = `<g transform="translate(1440 850)"><circle cx="0" cy="-40" r="52" fill="#fff" stroke="${O}" stroke-width="4"/><circle cx="0" cy="-122" r="36" fill="#fff" stroke="${O}" stroke-width="4"/><circle cx="-12" cy="-128" r="4" fill="${O}"/><circle cx="12" cy="-128" r="4" fill="${O}"/><path d="M0 -118l26 8-26 4z" fill="#ff8a3a" stroke="${O}" stroke-width="2"/><path d="M-32 -96q32 16 64 0" stroke="#d9534f" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M-26 -152h52l-8 -30h-36z" fill="#3a3a48" stroke="${O}" stroke-width="3"/></g>`;
		return `<defs>${lg("al-wi-sky", [
			[0, "#a9c4e8"],
			[1, "#e8f1ff"],
		])}${lg("al-wi-g", [
			[0, "#d6e2f2"],
			[0.4, "#eef4ff"],
			[1, "#d2deef"],
		])}</defs>
      <rect width="1600" height="${HZ}" fill="url(#al-wi-sky)"/>
      <rect x="-10" y="88" width="1620" height="${HZ - 86}" fill="#8a94a8" stroke="${O}" stroke-width="4"/>
      <path d="${bricks}" stroke="#6a7488" stroke-width="2.5" fill="none"/>${merlons}
      ${gate}${tower(170)}${tower(1430)}
      <path d="M-10 ${HZ - 8}q400 -22 810 -6t810 6V${HZ + 6}H-10z" fill="#fff" stroke="#b8c6dc" stroke-width="3"/>
      <rect x="0" y="${HZ}" width="1600" height="${1000 - HZ}" fill="url(#al-wi-g)"/>
      ${persp("#b8c6dc", 0.45, 7, 240)}
      <ellipse cx="800" cy="600" rx="520" ry="230" fill="#c9d6ea" opacity=".45"/>
      ${drifts}${prints}
      ${brazier(170, 640)}${brazier(1430, 640)}${barrel(300, 880)}${barrel(380, 910)}${snowman}${flakes}`;
	}

	function desert() {
		let dunes = `M-10 ${HZ}V130`;
		for (let i = 0; i < 6; i++)
			dunes += `Q${r(i * 300 + 140)} ${r(70 + nz(i) * 40)} ${r(i * 300 + 290)} ${r(124 + nz(i + 3) * 20)}`;
		dunes += `V${HZ}z`;
		let wall = "";
		for (let x = 0; x < 1600; x += 100) {
			const h = 60 + (x % 300 === 0 ? 30 : 0);
			wall += `<path d="M${x} ${HZ}V${HZ - h}l10 -8h80l10 8V${HZ}z" fill="#d9a066" stroke="${O}" stroke-width="3"/><path d="M${x + 20} ${HZ - h + 16}h60" stroke="#b0723e" stroke-width="4"/>`;
		}
		const obelisk = (x) =>
			`<path d="M${x - 22} ${HZ - 2}l8 -150l14 -22l14 22l8 150z" fill="#e8b878" stroke="${O}" stroke-width="4" stroke-linejoin="round"/><path d="M${x - 6} ${HZ - 120}h12M${x - 8} ${HZ - 90}h16M${x - 6} ${HZ - 60}l6 -10 6 10" stroke="#9a5a2e" stroke-width="3.5" fill="none"/>`;
		const palm = (x, flip) =>
			`<g${flip ? ` transform="translate(${2 * x} 0) scale(-1 1)"` : ""}><path d="M${x - 10} 1000q-20 -260 30 -560l22 4q-46 300 -28 556z" fill="#9a6a3e" stroke="${O}" stroke-width="4"/>${[0, 1, 2, 3, 4, 5].map((k) => `<path d="M${x + 30} 440q${[-150, -110, -40, 60, 130, 160][k]} ${[-30, -90, -130, -120, -70, 10][k]} ${[-230, -200, -100, 90, 210, 230][k]} ${[60, -60, -170, -160, -40, 90][k]}q${[90, 70, 30, -20, -60, -100][k]} ${[-50, 10, 60, 60, 20, -40][k]} ${[230, 200, 100, -90, -210, -230][k]} ${[-60, 60, 170, 160, 40, -90][k]}z" fill="${k % 2 ? "#4f8a3c" : "#5fae5a"}" stroke="${O}" stroke-width="3.5" stroke-linejoin="round"/>`).join("")}<circle cx="${x + 22}" cy="452" r="12" fill="#8a5a34" stroke="${O}" stroke-width="3"/><circle cx="${x + 44}" cy="458" r="12" fill="#8a5a34" stroke="${O}" stroke-width="3"/></g>`;
		let ripples = "";
		for (let i = 0; i < 40; i++) {
			const x = nz(i + 600) * 1600,
				y = HZ + 30 + nz(i + 700) * 740;
			if (((x - 800) / 480) ** 2 + ((y - 590) / 230) ** 2 < 1) continue;
			ripples += `M${r(x - 60)} ${r(y)}q30 -10 60 0t60 0`;
		}
		let ring = "";
		for (let i = 0; i < 26; i++) {
			const a = (i / 26) * Math.PI * 2;
			ring += stone(
				800 + Math.cos(a) * 520,
				600 + Math.sin(a) * 250,
				30 + nz(i) * 14,
				14 + nz(i + 1) * 8,
				i % 3 ? "#c48a52" : "#b0723e",
			);
		}
		const skull = `<g transform="translate(1190 850)"><path d="M-40 6l80 -22" stroke="#f3efd9" stroke-width="10" stroke-linecap="round"/><path d="M60 -10q0 -30 30 -30t30 30v14h-60z" fill="#f3efd9" stroke="${O}" stroke-width="3"/><circle cx="80" cy="-14" r="6" fill="${O}"/><circle cx="100" cy="-14" r="6" fill="${O}"/></g>`;
		const pot = (x, y) =>
			`<g transform="translate(${x} ${y})"><path d="M-30 0q-26 -40 0 -80h-6v-16h72v16h-6q26 40 0 80z" fill="#c4683a" stroke="${O}" stroke-width="4"/><path d="M-36 -40h72" stroke="#f2c14e" stroke-width="6"/></g>`;
		return `<defs>${lg("al-de-sky", [
			[0, "#f28c5a"],
			[0.6, "#f9c27a"],
			[1, "#ffe2a8"],
		])}${lg("al-de-g", [
			[0, "#e0a868"],
			[0.4, "#ebba7a"],
			[1, "#d49a5c"],
		])}${rg("al-de-c", [
			[0, "#f6d29a", 0.5],
			[1, "#f6d29a", 0],
		])}</defs>
      <rect width="1600" height="${HZ}" fill="url(#al-de-sky)"/>
      <circle cx="380" cy="100" r="60" fill="#fff0b0" stroke="${O}" stroke-width="3"/>
      <path d="${dunes}" fill="#e7a564" stroke="${O}" stroke-width="3" stroke-linejoin="round" opacity=".9"/>
      ${wall}${obelisk(560)}${obelisk(1040)}
      <rect x="0" y="${HZ}" width="1600" height="${1000 - HZ}" fill="url(#al-de-g)"/>
      <ellipse cx="800" cy="600" rx="600" ry="280" fill="url(#al-de-c)"/>
      <path d="${ripples}" fill="none" stroke="#b0723e" stroke-width="3" opacity=".45" stroke-linecap="round"/>
      ${ring}<path d="M610 820l40 -20 30 14 40 -26M980 380l-30 16 -26 -8" stroke="#a8693a" stroke-width="3" fill="none" opacity=".6"/>
      ${skull}${pot(260, 900)}${pot(330, 920)}${palm(80, false)}${palm(1520, true)}`;
	}

	function night() {
		let stars = "";
		for (let i = 0; i < 46; i++)
			stars += `<circle cx="${r(nz(i + 900) * 1600)}" cy="${r(nz(i + 950) * 150)}" r="${r(1.6 + nz(i + 990) * 2.2)}" fill="#fff6d6" opacity="${r(0.5 + nz(i) * 0.5)}"/>`;
		const castle = `M-10 ${HZ}V120h60v-26h30v26h60V60h24v-20h40v20h24v60h70v-30h30v30h80V96h40v-40l40 -40l40 40v40h40v24h120V70h30v-24h46v24h30v50h80V96h30v24h90V50h28v-16h40v16h28v70h60v-24h30v24h70V70h40v-40l36 -30l36 30v40h40v50h40V${HZ}z`;
		let win = "";
		for (let i = 0; i < 14; i++) {
			const x = 70 + i * 112 + nz(i + 10) * 30,
				y = 120 + nz(i + 20) * 50;
			win += `<rect x="${r(x)}" y="${r(y)}" width="16" height="24" rx="8" fill="${nz(i + 30) > 0.35 ? "#ffcf6a" : "#2a2448"}" stroke="${O}" stroke-width="2"/>`;
		}

		let cob = "";
		for (let row = 0; row < 16; row++) {
			const t = row / 15,
				y = HZ + 20 + t ** 1.35 * (1000 - HZ - 10),
				h = 8 + t * 26,
				w = 22 + t * 64;
			for (let x = (row % 2) * w * 0.5 - w; x < 1600 + w; x += w)
				cob += `<ellipse cx="${r(x + nz(row * 31 + x) * 6)}" cy="${r(y)}" rx="${r(w * 0.44)}" ry="${r(h * 0.42)}"/>`;
		}
		const well = `<g transform="translate(1330 870)"><ellipse cx="0" cy="-10" rx="90" ry="30" fill="#4a4a62" stroke="${O}" stroke-width="4"/><path d="M-90 -10v-60h180v60" fill="#5a5a74" stroke="${O}" stroke-width="4"/><ellipse cx="0" cy="-70" rx="90" ry="28" fill="#3a3a52" stroke="${O}" stroke-width="4"/><ellipse cx="0" cy="-70" rx="66" ry="18" fill="#141428"/><path d="M-80 -70V-190M80 -70V-190M-100 -190h200l-40 -50h-120z" stroke="${O}" stroke-width="5" fill="#6a4630" stroke-linejoin="round"/></g>`;
		const crates = `<g transform="translate(250 900)"><rect x="-80" y="-80" width="80" height="80" fill="#6a4630" stroke="${O}" stroke-width="4"/><path d="M-80 -80l80 80M0 -80l-80 80" stroke="#4a3020" stroke-width="5"/><rect x="0" y="-60" width="64" height="60" fill="#7a5034" stroke="${O}" stroke-width="4"/><path d="M0 -30h64" stroke="#4a3020" stroke-width="5"/></g>`;
		return `<defs>${lg("al-ni-sky", [
			[0, "#0e1030"],
			[1, "#2a2a5a"],
		])}${lg("al-ni-g", [
			[0, "#2c2c44"],
			[0.5, "#3a3a56"],
			[1, "#26263c"],
		])}</defs>
      <rect width="1600" height="${HZ}" fill="url(#al-ni-sky)"/>${stars}
      ${glow(1180, 64, 120, "#fff6d6")}<circle cx="1180" cy="64" r="40" fill="#fff6d6" stroke="${O}" stroke-width="3"/><circle cx="1166" cy="56" r="8" fill="#e6dcb4"/><circle cx="1192" cy="76" r="6" fill="#e6dcb4"/>
      <path d="${castle}" fill="#2c2a50" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>${win}
      <rect x="-10" y="${HZ - 40}" width="1620" height="44" fill="#3a3650" stroke="${O}" stroke-width="4"/><path d="M0 ${HZ - 20}H1600" stroke="#2a2640" stroke-width="3"/>
      <rect x="0" y="${HZ}" width="1600" height="${1000 - HZ}" fill="url(#al-ni-g)"/>
      <g fill="#4a4a66" stroke="#1c1a30" stroke-width="2.5" opacity=".8">${cob}</g>
      <ellipse cx="800" cy="600" rx="560" ry="250" fill="#ffcf6a" opacity=".06"/>
      ${glow(150, 600, 190, "#ffb347", 0.45)}${glow(1450, 600, 190, "#ffb347", 0.45)}
      ${torch(400, HZ - 70, 0.7, false)}${torch(1200, HZ - 70, 0.7, false)}${torch(800, HZ - 92, 0.6, false)}
      ${torch(150, 470, 1.1)}${torch(1450, 470, 1.1)}${well}${crates}`;
	}

	const DRAW = { colosseum, glade, winter, desert, night };
	const CACHE = {};

	const SQ = 0.55,
		FY0 = Math.round(HZ * (1 - SQ));
	const GROUND = `<rect x="0" y="${HZ}" width="1600"`;

	function bg(id, mode) {
		if (!DRAW[id]) return null;
		const key = id + (mode === "stage" ? ":s" : "");
		if (!CACHE[key]) {
			let sc = DRAW[id],
				vb = "0 0 1600 1000";
			sc = sc();
			if (mode !== "stage") {
				const i = sc.indexOf(GROUND);
				if (i > 0) {
					sc = `<g transform="matrix(1 0 0 ${SQ} 0 ${FY0})">${sc.slice(0, i)}</g>${sc.slice(i)}`;
					vb = `0 ${FY0} 1600 ${1000 - FY0}`;
				}
			}
			CACHE[key] =
				`<div class="af-bg af-loc" data-loc="${id}" aria-hidden="true"><svg class="al-scene" viewBox="${vb}" preserveAspectRatio="xMidYMin slice" focusable="false">${sc}</svg><div class="af-vig al-vig"></div></div>`;
		}
		return CACHE[key];
	}
	return {
		IDS,
		NAMES,
		name: (id) => NAMES[id] || "",
		bg,
		has: (id) => !!DRAW[id],
		HZ: HZ / 1000,
		FY0: FY0 / 1000,
	};
})();
