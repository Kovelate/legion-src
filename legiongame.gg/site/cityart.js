(() => {
	const PAL = {
		legion: {
			line: "#f5f2ff",
			ink: "#15122e",
			wall: "#4d4a5c",
			wallD: "#3d3a4c",
			tower: "#5a5768",
			roof: "#a3122a",
			roof2: "#b5533c",
			plaster: "#ead9b8",
			stone: "#8b8796",
			timber: "#6b4423",
			ground: "#3a3748",
			ground2: "#4a4759",
			glass: "#ffd76a",
			sign: "#7a0f1d",
			signTx: "#ffc94d",
			wood: "#a0703a",
			woodD: "#6b4423",
			water: "#4ab0ff",
			waterD: "#2a6fb0",
			flag: "#ffc94d",
			sky: "linear-gradient(#0d0b22, #2b2150)",
			banner: "КВАРТАЛ ГИЛЬДИЙ",
			ground_kind: "cobble",
			back: "wall",
		},

		veggies: {
			line: "#2b2118",
			ink: "#2b2118",
			wall: "#8a5a2b",
			wallD: "#6a4420",
			tower: "#a0703a",
			roof: "#4f9a3a",
			roof2: "#e8892a",
			plaster: "#fff3dc",
			stone: "#a89070",
			timber: "#8a5a2b",
			ground: "#8a6a48",
			ground2: "#5e4630",
			glass: "#ffe08a",
			sign: "#3f7a2a",
			signTx: "#fff0a8",
			wood: "#c8894a",
			woodD: "#8a5a2b",
			woodL: "#e8b070",
			water: "#5ac0ff",
			waterD: "#2a6fb0",
			flag: "#e8455c",
			sky: "linear-gradient(#0d0b22, #2b2150)",
			banner: "ОГОРОДНЫЙ КВАРТАЛ",
			ground_kind: "cobble",
			back: "garden",
			sprout: true,
			trees: "tree",
			apples: true,
			cross: "tools",
			bulbs: ["#e8402f", "#ff9a2a", "#6fdc6f", "#ffd84a", "#b06bff"],
			column: "#fff3dc",
			columnL: "#ffffff",
		},

		"42brothers": {
			line: "#1c1022",
			ink: "#1c1022",
			wall: "#2a1a3a",
			wallD: "#1e1230",
			tower: "#3a2a4a",
			roof: "#ff5fa2",
			roof2: "#4a3a5a",
			plaster: "#3a2a4a",
			stone: "#5a4a6a",
			timber: "#ffc83d",
			ground: "#2e2440",
			ground2: "#1c1022",
			groundL: "#3e3254",
			glass: "#5ad1ff",
			sign: "#1c1022",
			signTx: "#ff5fa2",
			wood: "#8a5a3a",
			woodD: "#5a3a2a",
			woodL: "#b07a52",
			water: "#5ad1ff",
			waterD: "#2a5ab0",
			waterL: "#e8fbff",
			flag: "#ffc83d",
			sky: "linear-gradient(#0d0b22, #2b2150)",
			banner: "РАЙОН БРАТУХ",
			ground_kind: "tiles",
			back: "city",
			neon: true,
			trees: "palm",
			roofK: "flat",
			cross: "bats",
			bulbs: ["#ff5fa2", "#5ad1ff", "#ffc83d", "#b06bff"],
			column: "#c9ced6",
			columnL: "#ffffff",
		},

		ugabugi: {
			line: "#2a1a12",
			ink: "#2a1a12",
			wall: "#5e584e",
			wallD: "#4a453d",
			tower: "#8a8478",
			roof: "#c9955a",
			roof2: "#8a5a2a",
			plaster: "#b8b0a2",
			stone: "#8a8478",
			timber: "#8a5a2a",
			ground: "#a88a5a",
			ground2: "#6a5236",
			glass: "#ffd27a",
			sign: "#5a3a1e",
			signTx: "#f3e6c8",
			wood: "#a8743a",
			woodD: "#6a4420",
			woodL: "#c9955a",
			water: "#5ab8c8",
			waterD: "#2a6a7a",
			flag: "#e8402a",
			sky: "linear-gradient(#0d0b22, #2b2150)",
			banner: "СТОЙБИЩЕ",
			ground_kind: "cobble",
			back: "cave",
			horns: true,
			trees: "palm",
			roofK: "flat",
			cross: "clubs",
			bulbs: ["#ffd27a", "#ff8a2a", "#f3e6c8", "#e8402a"],
			column: "#b8b0a2",
			columnL: "#d8d0c2",
		},
		cats: {
			line: "#2b1d18",
			ink: "#2b1d18",
			wall: "#3a2f5e",
			wallD: "#2a2350",
			tower: "#a9503c",
			roof: "#5a3a5a",
			roof2: "#8a4a7a",
			plaster: "#f2d4a8",
			stone: "#a9503c",
			timber: "#6e4a2f",
			ground: "#c8664a",
			ground2: "#8f3f2c",
			groundL: "#e08a68",
			glass: "#ffd76a",
			sign: "#6a2a5a",
			signTx: "#ffcf4a",
			wood: "#a8754f",
			woodD: "#6e4a2f",
			water: "#7fc8ff",
			waterD: "#3a6aa8",
			flag: "#ff8fa3",
			sky: "linear-gradient(#0f0d2a 0%, #1d1a4a 40%, #3a2f6e 75%, #5a3a7a 100%)",
			banner: "КОШАЧИЙ КВАРТАЛ",
			ground_kind: "tiles",
			back: "roofs",
			ears: true,
		},
		monkeys: {
			line: "#2a1a12",
			ink: "#2a1a12",
			wall: "#6b4f8a",
			wallD: "#59437a",
			tower: "#7a5230",
			roof: "#3f8f3a",
			roof2: "#56a843",
			plaster: "#e2b678",
			stone: "#9a6a3c",
			timber: "#7a5230",
			ground: "#c99a5e",
			ground2: "#8a5a32",
			groundL: "#e2b678",
			glass: "#fff59a",
			sign: "#7a4a1a",
			signTx: "#ffe39a",
			wood: "#c99a5e",
			woodD: "#8a5a32",
			water: "#6ad0e0",
			waterD: "#2a8a9a",
			flag: "#ffd84a",
			sky: "linear-gradient(#241a4e 0%, #4a2f72 34%, #9a4f7a 66%, #f0905a 100%)",
			banner: "ВЕРХНИЙ КВАРТАЛ",
			ground_kind: "deck",
			back: "jungle",
			leaves: true,
		},

		cherts: {
			line: "#2a0d14",
			ink: "#2a0d14",
			wall: "#2e2228",
			wallD: "#241a1e",
			tower: "#3a3346",
			roof: "#6a1020",
			roof2: "#3a3346",
			plaster: "#4a4458",
			stone: "#3a3346",
			timber: "#2a2236",
			ground: "#2a1e22",
			ground2: "#1a1014",
			glass: "#ffb347",
			sign: "#2a0d14",
			signTx: "#ffc83d",
			wood: "#6a3a2a",
			woodD: "#3a1e16",
			woodL: "#8a5038",
			water: "#ff7a1a",
			waterD: "#a8200e",
			waterL: "#fff1a0",
			flag: "#ffc83d",
			sky: "linear-gradient(#0e0306 0%, #2a0a10 45%, #5a1418 80%, #8a2a1a 100%)",
			banner: "КОТЕЛЬНЫЙ КВАРТАЛ",
			ground_kind: "cobble",
			back: "cliffs",
			horns: true,
			hell: true,
			iron: true,
			bulbs: ["#ff5a1a", "#ffc83d", "#ff8a2a", "#e8203a", "#ffe27a"],
			column: "#3a2c34",
			columnL: "#6a5460",
		},
	};
	const f1 = (v) => +(+v).toFixed(1);

	const GLW = [
		[" .,!:;", 0.3],
		["IJ1-", 0.47],
		["ГЕЁЗСТЭCEFLTZ235679«»", 0.64],
		["ДЦЪU", 0.8],
		["МФM", 0.9],
		["ЖШЩЫЮW", 1.04],
	];
	const glw = (c) => {
		for (const [s, w] of GLW) if (s.includes(c)) return w;
		return 0.75;
	};
	const fitSize = (t, size, maxW, ls = 3) => {
		const ch = [...String(t)],
			em = ch.reduce((a, c) => a + glw(c), 0);
		return f1(Math.min(size, (maxW - ls * (ch.length - 1)) / (em + 1 / 7)));
	};

	const neonL = (d, c, w = 5) =>
		`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w * 2.6}" stroke-linecap="round" opacity=".28"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#ffffff" stroke-width="${f1(w * 0.36)}" stroke-linecap="round" opacity=".8"/>`;

	const ROOMX = {
		veggies: {
			wall: "#c8894a",
			wallD: "#8a5a2b",
			floor: "#6a4a2a",
			back: (K) => {
				let d = "";
				for (let x = 0; x <= 1920; x += 64) d += `M${x} 0 V900 `;
				let k = "";
				for (let x = 32; x < 1920; x += 128)
					k += `M${x} ${80 + (x % 5) * 120} h0.1 M${x + 64} ${300 + (x % 7) * 70} h0.1 `;
				return `<path d="${d}" stroke="#8a5a2b" stroke-width="5"/><path d="${k}" stroke="#8a5a2b" stroke-width="12" stroke-linecap="round" opacity=".6"/><path d="M0 120 H1920" stroke="${K.ink}" stroke-width="22"/><path d="M0 120 H1920" stroke="#6a4420" stroke-width="16"/>`;
			},
			win: (x, y, O) =>
				`<rect x="${x}" y="${y}" width="170" height="220" rx="12" fill="#1e1c40" ${O(6)}/><path d="M${x + 6} ${y + 214} Q${x + 60} ${y + 140} ${x + 164} ${y + 170} V${y + 214} Z" fill="#2e5232"/><circle cx="${x + 120}" cy="${y + 60}" r="22" fill="#f3efd8"/><path d="M${x + 85} ${y} V${y + 220} M${x} ${y + 110} H${x + 170}" stroke="#2b2118" stroke-width="6"/>`,
			plain: (O) =>
				[300, 520, 1400, 1620]
					.map(
						(x, i) =>
							`<path d="M${x} 120 V${200 + (i % 2) * 40}" stroke="#2b2118" stroke-width="3"/>` +
							[0, 1, 2, 3]
								.map(
									(k) =>
										`<ellipse cx="${x + (k % 2 ? 10 : -10)}" cy="${222 + (i % 2) * 40 + k * 24}" rx="15" ry="17" fill="${i % 2 ? "#f3e6c8" : "#e8892a"}" ${O(3)}/>`,
								)
								.join(""),
					)
					.join("") +
				`<rect x="840" y="260" width="240" height="300" rx="10" fill="#e8b070" ${O(6)}/><rect x="862" y="282" width="196" height="256" fill="#fff3dc"/><path d="M960 330 q-40 120 0 180 q40 -60 0 -180 Z" fill="#ff9a2a" ${O(4)}/><path d="M960 330 q-20 -40 -40 -40 M960 330 q4 -44 26 -50 M960 330 q20 -30 46 -24" stroke="#4caf50" stroke-width="9" stroke-linecap="round" fill="none"/>` +
				[
					[560, 900],
					[640, 905],
					[1300, 900],
				]
					.map(
						([x, y]) =>
							`<path d="M${x - 40} ${y} q-8 -60 12 -84 q-8 -14 6 -18 h44 q14 4 6 18 q20 24 12 84 Z" fill="#d9c08a" ${O(4)}/><path d="M${x - 14} ${y - 84} q14 8 28 0" stroke="#2b2118" stroke-width="3" fill="none"/>`,
					)
					.join(""),
		},
		"42brothers": {
			wall: "#2a1a3a",
			wallD: "#1e1230",
			floor: "#1c1022",
			back: (K) =>
				`<path d="M0 160 H1920 M0 820 H1920" stroke="#ff5fa2" stroke-width="18" opacity=".28"/><path d="M0 160 H1920 M0 820 H1920" stroke="#ff5fa2" stroke-width="6"/><path d="M0 172 H1920" stroke="#5ad1ff" stroke-width="4"/>` +
				(() => {
					let d = "";
					for (let x = 0; x <= 1920; x += 160) d += `M${x} 180 V810 `;
					return `<path d="${d}" stroke="#3a2a4a" stroke-width="10"/>`;
				})(),
			floor2: (K) => {
				let g = "";
				for (let r = 0, y = 900; y < 1080; r++) {
					const h = 36 + r * 6;
					for (let c = 0, x = 0; x < 1920; c++, x += 120)
						if ((r + c) % 2) g += `M${x} ${y} h120 v${h} h-120 Z `;
					y += h;
				}
				return `<rect x="0" y="900" width="1920" height="180" fill="#f3efe6"/><path d="${g}" fill="#1c1022"/>`;
			},
			win: (x, y, O) =>
				`<rect x="${x}" y="${y}" width="170" height="220" rx="12" fill="#14102a" ${O(6)}/>` +
				[
					[10, 90, 40],
					[56, 60, 34],
					[96, 110, 30],
					[130, 40, 34],
				]
					.map(
						([a, h, w]) =>
							`<rect x="${x + a}" y="${y + 220 - h - 40}" width="${w}" height="${h + 40}" fill="#2a1a3a"/><path d="M${x + a + 8} ${y + 230 - h} h8 M${x + a + 8} ${y + 250 - h} h8" stroke="#ffd76a" stroke-width="5"/>`,
					)
					.join("") +
				`<path d="M${x + 85} ${y} V${y + 220} M${x} ${y + 110} H${x + 170}" stroke="#1c1022" stroke-width="6"/>`,
			plain: (O) =>
				neonL("M820 300 L780 380 H840 M840 300 V420", "#ff5fa2", 10) +
				neonL(
					"M890 330 Q910 290 950 316 Q964 350 890 420 H960",
					"#ff5fa2",
					10,
				) +
				`<circle cx="1200" cy="140" r="56" fill="#c9ced6" ${O(5)}/>` +
				[0, 1, 2, 3]
					.map(
						(k) =>
							`<path d="M${1144 + k * 28} ${100 + (k % 2) * 6} V${180 - (k % 2) * 6}" stroke="#8a8ea0" stroke-width="3"/>`,
					)
					.join("") +
				`<path d="M1200 0 V84" stroke="#1c1022" stroke-width="5"/>` +
				`<rect x="1460" y="760" width="300" height="100" rx="40" fill="#ff5fa2" ${O(6)}/><rect x="1440" y="700" width="60" height="160" rx="26" fill="#d84a8a" ${O(5)}/><rect x="1720" y="700" width="60" height="160" rx="26" fill="#d84a8a" ${O(5)}/><path d="M1480 900 v-40 M1740 900 v-40" stroke="#ffc83d" stroke-width="10"/>` +
				`<path d="M380 900 h80 l-10 -30 h-60 Z M400 870 v-60 h40 v60 M380 790 q0 -60 40 -60 q40 0 40 60 Z" fill="#ffc83d" ${O(4)}/>`,
		},
		ugabugi: {
			wall: "#7a7468",
			wallD: "#5e584e",
			floor: "#8a6a48",
			back: (K) => {
				let d = "";
				for (const [x, y, r] of [
					[120, 140, 60],
					[420, 300, 80],
					[760, 120, 70],
					[1100, 260, 90],
					[1460, 140, 70],
					[1760, 320, 80],
					[260, 600, 90],
					[960, 560, 70],
					[1640, 640, 80],
				])
					d += `M${x - r} ${y} q${r * 0.3} ${-r * 0.9} ${r} ${-r * 0.75} q${r * 0.8} ${r * 0.1} ${r} ${r * 0.75} q${-r * 0.2} ${r * 0.8} ${-r} ${r * 0.7} q${-r * 0.9} ${-r * 0.1} ${-r} ${-r * 0.7} Z `;
				return `<path d="${d}" fill="#6a645a" stroke="#5e584e" stroke-width="4"/><g stroke="#c8643a" stroke-width="7" fill="none" stroke-linecap="round" opacity=".8"><path d="M560 420 q60 -60 160 -14 q30 14 14 74 M590 494 v56 M650 494 v56 M710 494 v56 M736 434 q44 14 34 74"/><path d="M1260 470 l30 -44 l30 44 M1290 426 v-44 M1276 516 l14 -44 l14 44"/></g>`;
			},
			win: (x, y, O) =>
				`<path d="M${x} ${y + 220} V${y + 80} Q${x + 85} ${y - 20} ${x + 170} ${y + 80} V${y + 220} Z" fill="#1e1c40" ${O(6)}/><circle cx="${x + 120}" cy="${y + 80}" r="20" fill="#f3efd8"/><path d="M${x + 6} ${y + 220} L${x + 60} ${y + 150} L${x + 100} ${y + 180} L${x + 164} ${y + 140} V${y + 220} Z" fill="#3a352e"/>`,
			plain: (O) =>
				`<path d="M680 160 q280 -60 560 0 l-40 60 q-240 -40 -480 0 Z" fill="#c9955a" ${O(5)}/>` +
				[740, 960, 1180]
					.map(
						(x) =>
							`<circle cx="${x}" cy="${x === 960 ? 150 : 170}" r="10" fill="#f3e6c8" ${O(3)}/>`,
					)
					.join("") +
				[460, 1460]
					.map(
						(x) =>
							`<circle cx="${x}" cy="420" r="90" fill="url(#rmGlow)"/><path d="M${x} 560 V440" stroke="#6a4420" stroke-width="14"/><path d="M${x} 450 c-22 -4 -24 -32 0 -60 c4 22 18 22 14 38 c10 0 8 18 -14 22 Z" fill="#ff8a2a" ${O(3)}/>`,
					)
					.join("") +
				`<g transform="translate(1600 900)"><path d="M-110 0 Q-120 -150 0 -170 Q120 -150 110 0 Z" fill="#f3e6c8" ${O(5)}/><circle cx="-40" cy="-100" r="20" fill="#2a1a12"/><circle cx="40" cy="-100" r="20" fill="#2a1a12"/><path d="M-60 -40 q-90 20 -80 -120 M60 -40 q90 20 80 -120" stroke="#2a1a12" stroke-width="22" fill="none" stroke-linecap="round"/><path d="M-60 -40 q-90 20 -80 -120 M60 -40 q90 20 80 -120" stroke="#f3e6c8" stroke-width="14" fill="none" stroke-linecap="round"/></g>` +
				`<path d="M200 900 q60 -40 160 -20 q40 10 60 20 Z" fill="#c9955a" ${O(4)}/>`,
		},
	};

	const SHOP_SHELF = { x: 40, w: 780, y: [340, 580], tw: 120, th: 150, gap: 8 };
	const SHOP_NAILS = [70, 235, 400, 565, 730];
	const SHOP_HANG = ["herbs", "sausage", "lamp", "onion", "sausage"];
	const SHOP_SIGN = { x: 960, y: 92, w: 320 };

	const SHOP_FLAG_T = [0.26, 0.42, 0.58, 0.74];
	function shopTopBoxes() {
		const L = SHOP_NAILS.map((x, i) => ({ x, k: SHOP_HANG[i] })),
			R = L.map((p) => ({ x: 1920 - p.x, k: p.k })),
			out = [];
		const ext = {
			herbs: [22, 62, 152],
			sausage: [14, 64, 164],
			lamp: [32, 112, 154],
			onion: [22, 62, 158],
		};
		for (const p of [...L, ...R]) {
			const [hw, y0, y1] = ext[p.k];
			out.push({ id: p.k + "@" + p.x, x0: p.x - hw, y0, x1: p.x + hw, y1 });
		}
		for (const side of [L, R])
			for (let i = 0; i + 1 < side.length; i++) {
				const a = Math.min(side[i].x, side[i + 1].x),
					b = Math.max(side[i].x, side[i + 1].x);
				out.push({
					id: "flags@" + a,
					x0: a + SHOP_FLAG_T[0] * (b - a) - 11,
					y0: 24,
					x1: a + SHOP_FLAG_T[SHOP_FLAG_T.length - 1] * (b - a) + 11,
					y1: 24 + 25 + 28,
				});
			}
		out.push({
			id: "sign",
			x0: SHOP_SIGN.x - SHOP_SIGN.w / 2,
			y0: SHOP_SIGN.y - 40,
			x1: SHOP_SIGN.x + SHOP_SIGN.w / 2,
			y1: SHOP_SIGN.y + 40,
		});
		return out;
	}
	function shopTop(K, O, sign) {
		const ink = K.ink,
			FL = ["#e8455c", "#ffd76a", "#6fdc6f", "#4ab0ff"];
		const L = SHOP_NAILS.map((x, i) => ({ x, k: SHOP_HANG[i] })),
			R = L.map((p) => ({ x: 1920 - p.x, k: p.k })).reverse();
		let glow = "",
			rope = "",
			flags = "",
			hang = "";
		const item = {
			lamp: (x) => {
				glow += `<circle cx="${x}" cy="160" r="130" fill="url(#rmGlow)"/>`;
				return `<path d="M${x} 0 V112" stroke="${ink}" stroke-width="5"/><path d="M${x - 30} 112 h60 l-12 42 h-36 Z" fill="${K.glass}" ${O(4)}/><path d="M${x - 14} 154 h28" stroke="#fff6c8" stroke-width="4" stroke-linecap="round" opacity=".8"/>`;
			},
			sausage: (x) =>
				`<path d="M${x} 24 V66" stroke="${ink}" stroke-width="3"/>` +
				[82, 114, 146]
					.map(
						(y) =>
							`<ellipse cx="${x}" cy="${y}" rx="12" ry="17" fill="#b8573e" ${O(3)}/><path d="M${x - 4} ${y - 9} q-2 6 0 12" stroke="#e08a6a" stroke-width="3" fill="none" stroke-linecap="round"/>`,
					)
					.join("") +
				`<path d="M${x - 5} 98 h10 M${x - 5} 130 h10" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>`,
			onion: (x) =>
				`<path d="M${x} 24 V62 M${x} 62 q-10 26 2 48 q10 22 -4 44" stroke="#c9a25a" stroke-width="5" fill="none" stroke-linecap="round"/>` +
				[
					[x - 10, 90],
					[x + 9, 116],
					[x - 7, 142],
				]
					.map(
						([cx, cy]) =>
							`<path d="M${cx} ${cy - 16} q14 6 13 18 q-1 13 -13 13 q-12 0 -13 -13 q-1 -12 13 -18 Z" fill="#e8b04a" ${O(3)}/><path d="M${cx - 4} ${cy - 6} q-2 8 0 14" stroke="#fff0b8" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
					)
					.join(""),
			herbs: (x) =>
				`<path d="M${x} 24 V66" stroke="${ink}" stroke-width="3"/>` +
				[-15, -5, 5, 15]
					.map(
						(d, i) =>
							`<path d="M${x} 70 q${d * 0.4} 30 ${d} ${70 + (i % 2) * 10} q${d > 0 ? 6 : -6} -30 ${-d} ${-(70 + (i % 2) * 10)} Z" fill="${i % 2 ? "#4caf50" : "#6fdc6f"}" ${O(3)}/>`,
					)
					.join("") +
				`<rect x="${x - 9}" y="62" width="18" height="10" rx="3" fill="#c8643a" ${O(3)}/>`,
		};
		for (const side of [L, R]) {
			for (let i = 0; i + 1 < side.length; i++) {
				const a = side[i].x,
					b = side[i + 1].x,
					m = (a + b) / 2;
				rope += `M${a} 24 Q${m} 74 ${b} 24 `;
				SHOP_FLAG_T.forEach((t, j) => {
					const x = a + (b - a) * t,
						y = 24 + 100 * t * (1 - t);
					flags += `<path d="M${(x - 11).toFixed(1)} ${y.toFixed(1)} h22 l-11 28 Z" fill="${FL[(i * 4 + j + side[0].x) % FL.length]}" ${O(3)}/>`;
				});
			}
			for (const p of side)
				hang +=
					item[p.k](p.x) +
					(p.k === "lamp"
						? ""
						: `<circle cx="${p.x}" cy="24" r="5" fill="${K.woodD}" ${O(2)}/>`);
		}
		const sg = SHOP_SIGN,
			chain = `<path d="M${sg.x - 110} 0 V${sg.y - 40} M${sg.x + 110} 0 V${sg.y - 40}" stroke="${ink}" stroke-width="4" stroke-dasharray="7 4"/>`;
		return (
			glow +
			`<path d="${rope}" stroke="${ink}" stroke-width="3" fill="none"/>` +
			flags +
			hang +
			chain +
			sign(sg.x, sg.y, sg.w, "ЛАВКА")
		);
	}

	function shopCounter(K, O) {
		const jar = (x, y, c) =>
			`<path d="M${x - 18} ${y} V${y - 46} q0 -10 10 -10 h16 q10 0 10 10 V${y} Z" fill="${c}" ${O(4)}/><rect x="${x - 12}" y="${y - 66}" width="24" height="12" rx="3" fill="${K.woodD}" ${O(3)}/>`;
		const bottle = (x, y, c) =>
			`<path d="M${x - 6} ${y - 58} V${y - 40} C${x - 26} ${y - 30} ${x - 26} ${y} ${x} ${y} C${x + 26} ${y} ${x + 26} ${y - 30} ${x + 6} ${y - 40} V${y - 58} Z" fill="${c}" ${O(4)}/>`;
		let s = `<rect x="1060" y="760" width="760" height="150" rx="10" fill="${K.wood}" ${O(6)}/><rect x="1040" y="740" width="800" height="30" rx="8" fill="${K.woodD}" ${O(5)}/>`;
		for (let i = 0; i < 5; i++)
			s += `<path d="M${1100 + i * 150} 780 V890" stroke="${K.woodD}" stroke-width="5" opacity=".6"/>`;
		return (
			s +
			jar(1110, 740, "#ffd76a") +
			`<ellipse cx="1220" cy="728" rx="40" ry="16" fill="#d9993f" ${O(4)}/>` +
			bottle(1740, 740, "#e8455c")
		);
	}
	const roomK = (style) => {
		let K = PAL[style] || PAL.legion;
		if (K.hell || ROOMX[style]) K = { ...K, line: K.ink };
		return K;
	};

	function roomFront(style, kind) {
		if (kind !== "shop") return "";
		const K = roomK(style),
			O = (w = 5) =>
				`stroke="${K.line}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
		return shopCounter(K, O);
	}
	function room(style, kind) {
		let K = PAL[style] || PAL.legion;
		const HELL = !!K.hell,
			RX = ROOMX[style];
		if (HELL || RX) K = { ...K, line: K.ink };
		const O = (w = 5) =>
			`stroke="${K.line}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
		const wall = RX
			? RX.wall
			: HELL
				? "#3a3346"
				: style === "cats"
					? "#b9845a"
					: style === "monkeys"
						? "#8a6a3c"
						: style === "veggies"
							? "#5a6a48"
							: "#3d3550";
		const wallD = RX
			? RX.wallD
			: HELL
				? "#2a2236"
				: style === "cats"
					? "#8a5a38"
					: style === "monkeys"
						? "#6e4a2f"
						: style === "veggies"
							? "#46543a"
							: "#2a2440";
		const floor = RX
			? RX.floor
			: HELL
				? "#2a1e22"
				: style === "cats"
					? "#c8664a"
					: style === "monkeys"
						? "#c99a5e"
						: "#6b4a2a";
		const txt = (x, y, t, size, fill = K.signTx) =>
			`<text x="${x}" y="${y}" text-anchor="middle" font-family="Russo One, Arial Black, sans-serif" font-size="${size}" fill="${fill}" stroke="${K.ink}" stroke-width="${Math.max(3, size / 7)}" paint-order="stroke" letter-spacing="3">${t}</text>`;

		const sign = (x, y, w, t) => {
			const fs = fitSize(t, 42, w - 47);
			return `<rect x="${x - w / 2}" y="${y - 40}" width="${w}" height="80" rx="14" fill="${K.sign}" ${O(6)}/><rect data-sign="1" x="${x - w / 2 + 10}" y="${y - 30}" width="${w - 20}" height="60" rx="9" fill="none" stroke="${K.signTx}" stroke-width="3"/>${txt(x, f1(y + fs * 0.38), t, fs)}`;
		};
		let s = `<defs><radialGradient id="rmL" cx=".5" cy=".3" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></radialGradient>
      <radialGradient id="rmGlow"><stop offset="0" stop-color="#ffe59a" stop-opacity=".85"/><stop offset="1" stop-color="#ffbe5a" stop-opacity="0"/></radialGradient></defs>`;
		s += `<rect width="1920" height="1080" fill="${wall}"/>`;
		if (style === "monkeys")
			for (let x = 0; x < 1920; x += 64)
				s += `<path d="M${x} 0 V900" stroke="${wallD}" stroke-width="5"/>`;
		else if (RX) s += RX.back(K);
		else if (K.iron) {
			let d = "",
				r = "";
			for (let x = 0; x <= 1920; x += 240) d += `M${x} 0 V900 `;
			for (let y = 0; y <= 900; y += 180) d += `M0 ${y} H1920 `;
			for (let x = 0; x <= 1920; x += 240)
				for (let y = 14; y < 900; y += 30)
					r += `M${x - 12} ${y} h0.1 M${x + 12} ${y} h0.1 `;
			s += `<path d="${d}" stroke="${wallD}" stroke-width="8"/><path d="${r}" stroke="#6a6480" stroke-width="7" stroke-linecap="round"/>`;
			s +=
				`<path d="M0 40 H1920 M0 86 H1920" stroke="${K.ink}" stroke-width="30"/><path d="M0 40 H1920 M0 86 H1920" stroke="#8a4a2a" stroke-width="20"/><path d="M0 34 H1920 M0 80 H1920" stroke="#c87a4a" stroke-width="4" opacity=".6"/>` +
				[300, 1000, 1640]
					.map(
						(x) =>
							`<rect x="${x - 16}" y="20" width="32" height="88" rx="6" fill="#5a5470" stroke="${K.ink}" stroke-width="4"/>`,
					)
					.join("");
		} else
			for (let r = 0; r < 15; r++)
				for (let c = 0; c < 18; c++)
					s += `<rect x="${c * 112 + (r % 2) * 56 - 30}" y="${r * 60}" width="104" height="52" rx="7" fill="none" stroke="${K.ink}" stroke-width="2" opacity="${HELL ? ".5" : ".2"}"/>`;
		s += `<rect width="1920" height="1080" fill="url(#rmL)"/>`;
		if (HELL) {
			s += `<rect x="0" y="900" width="1920" height="180" fill="#ff5a1a"/>`;
			let g = "";
			for (let y = 900, i = 0; y < 1080; i++) {
				const h = 30 + i * 8;
				for (let x = -(i % 2) * 40; x < 1920; x += 80 + i * 6)
					g += `M${x + 6} ${y + 5} h${68 + i * 6} v${h - 10} h${-68 - i * 6} Z `;
				y += h;
			}
			s += `<path d="${g}" fill="#3a3346" stroke="${K.ink}" stroke-width="3"/><path d="M0 900 H1920" stroke="${K.line}" stroke-width="6"/>`;
		} else if (RX && RX.floor2)
			s +=
				RX.floor2(K) +
				`<path d="M0 900 H1920" stroke="${K.line}" stroke-width="6"/>`;
		else {
			s += `<rect x="0" y="900" width="1920" height="180" fill="${floor}"/><path d="M0 900 H1920" stroke="${K.line}" stroke-width="6"/>`;
			for (let i = 0; i < 12; i++)
				s += `<path d="M${i * 170} 900 L${i * 170 - 60} 1080" stroke="${K.ink}" stroke-width="3" opacity=".35"/>`;
		}
		const STORAGE_SIGN_Y = 300;
		const lamp = (x) =>
			`<circle cx="${x}" cy="200" r="120" fill="url(#rmGlow)"/><path d="M${x} 0 V150" stroke="${K.ink}" stroke-width="5"/><path d="M${x - 30} 150 h60 l-12 46 h-36 Z" fill="${K.glass}" ${O(4)}/>`;
		const win = (x, y) =>
			RX
				? RX.win(x, y, O)
				: HELL
					? `<rect x="${x}" y="${y}" width="170" height="220" rx="12" fill="#6a1a18" ${O(6)}/><path d="M${x + 6} ${y + 214} L${x + 70} ${y + 120} L${x + 96} ${y + 140} L${x + 164} ${y + 214} Z" fill="#2a0d14"/><path d="M${x + 82} ${y + 130} l-6 40 l10 44" stroke="#ff7a1a" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M${x + 85} ${y} V${y + 220} M${x} ${y + 110} H${x + 170}" stroke="${K.line}" stroke-width="6"/>`
					: `<rect x="${x}" y="${y}" width="170" height="220" rx="12" fill="#1e1c40" ${O(6)}/><path d="M${x + 85} ${y} V${y + 220} M${x} ${y + 110} H${x + 170}" stroke="${K.line}" stroke-width="6"/><circle cx="${x + 120}" cy="${y + 60}" r="22" fill="#f3efd8"/>`;
		const shelf = (x, y, w) =>
			`<rect x="${x}" y="${y}" width="${w}" height="18" rx="4" fill="${K.wood}" ${O(4)}/>`;
		const jar = (x, y, c) =>
			`<path d="M${x - 18} ${y} V${y - 46} q0 -10 10 -10 h16 q10 0 10 10 V${y} Z" fill="${c}" ${O(4)}/><rect x="${x - 12}" y="${y - 66}" width="24" height="12" rx="3" fill="${K.woodD}" ${O(3)}/>`;
		const bottle = (x, y, c) =>
			`<path d="M${x - 6} ${y - 58} V${y - 40} C${x - 26} ${y - 30} ${x - 26} ${y} ${x} ${y} C${x + 26} ${y} ${x + 26} ${y - 30} ${x + 6} ${y - 40} V${y - 58} Z" fill="${c}" ${O(4)}/>`;
		if (kind === "shop") {
			s += win(875, 160);
			for (const [x, y, w] of [
				[SHOP_SHELF.x, SHOP_SHELF.y[0], SHOP_SHELF.w],
				[SHOP_SHELF.x, SHOP_SHELF.y[1], SHOP_SHELF.w],
				[1300, SHOP_SHELF.y[0], 560],
				[1600, SHOP_SHELF.y[1], 260],
			]) {
				s += shelf(x, y, w);

				if (x === SHOP_SHELF.x) continue;

				for (let i = 0; i < Math.floor((w - 8) / 92); i++) {
					const cx = x + 50 + i * 92,
						c = [
							"#e8455c",
							"#4ab0ff",
							"#6fdc6f",
							"#b06bff",
							"#ffd76a",
							"#ff8a5c",
						][(i + y) % 6];
					s += i % 2 ? bottle(cx, y, c) : jar(cx, y, c);
				}
			}
			s += shopTop(K, O, sign);
			s += shopCounter(K, O);
		} else if (kind === "trainer") {
			s += lamp(260) + lamp(1660);

			s += `<rect x="40" y="380" width="300" height="420" rx="10" fill="${K.woodD}" ${O(6)}/>`;
			const D = window.MDDoodle;
			try {
				["sword", "spear", "bow", "staff", "mace"].forEach((k, i) => {
					s += `<g transform="translate(${80 + i * 56} 760) scale(2.2)">${D.weaponArt(k, "common")}</g>`;
				});
			} catch (e) {}

			const target = (x, y, r) =>
				`<circle cx="${x}" cy="${y}" r="${r}" fill="#f3efd8" ${O(5)}/><circle cx="${x}" cy="${y}" r="${r * 0.66}" fill="#e8455c"/><circle cx="${x}" cy="${y}" r="${r * 0.33}" fill="#f3efd8"/>`;
			s += target(1760, 300, 70) + target(1640, 520, 50);
			const dummy = (x) =>
				`<path d="M${x} 900 V700" stroke="${K.woodD}" stroke-width="14"/><path d="M${x - 80} 740 H${x + 80}" stroke="${K.woodD}" stroke-width="12" stroke-linecap="round"/><ellipse cx="${x}" cy="760" rx="54" ry="74" fill="#e8c95a" ${O(5)}/><circle cx="${x}" cy="650" r="40" fill="#e8c95a" ${O(5)}/><path d="M${x - 16} 646 l10 10 M${x - 6} 646 l-10 10 M${x + 8} 646 l10 10 M${x + 18} 646 l-10 10" stroke="${K.ink}" stroke-width="4"/>`;
			s += dummy(1500) + dummy(1780);
			if (HELL)
				for (const x of [1500, 1780])
					s +=
						`<ellipse cx="${x}" cy="598" rx="34" ry="9" fill="none" stroke="#ffd76a" stroke-width="7"/>` +
						[-1, 1]
							.map(
								(d) =>
									`<path d="M${x + d * 50} 740 q${d * 60} -60 ${d * 40} -110 q${d * -10} 40 ${d * -40} 60 q${d * 20} 0 ${d * 0} 50 Z" fill="#f3efd8" stroke="${K.ink}" stroke-width="4"/>`,
							)
							.join("");

			s += `<rect x="400" y="60" width="1080" height="760" rx="18" fill="${K.woodD}" ${O(7)}/><rect x="430" y="90" width="1020" height="700" rx="10" fill="#26352c"/>`;
			s += sign(940, 40, 360, "ТРЕНЕР");
			s += `<rect x="560" y="920" width="760" height="120" rx="20" fill="${K.sign}" opacity=".55"/>`;
		} else if (kind === "board") {
			s += lamp(160) + lamp(1760);
			s += `<rect x="140" y="70" width="1640" height="800" rx="18" fill="${K.woodD}" ${O(8)}/><rect x="170" y="100" width="1580" height="740" rx="10" fill="#c49a62"/>`;
			for (let i = 0; i < 120; i++)
				s += `<circle cx="${180 + ((i * 137) % 1560)}" cy="${110 + ((i * 89) % 720)}" r="3" fill="#a07a48"/>`;

			s += sign(960, 60, 580, "ДОСКА ОБЪЯВЛЕНИЙ");
		} else if (kind === "storage") {
			s += lamp(560) + lamp(1360);
			const box = (x, y, w, h, c = K.wood) =>
				`<rect x="${x}" y="${y - h}" width="${w}" height="${h}" fill="${c}" ${O(4)}/><path d="M${x} ${y - h} L${x + w} ${y} M${x + w} ${y - h} L${x} ${y}" stroke="${K.woodD}" stroke-width="3" opacity=".7"/>`;
			const sack = (x, y, c = "#d9c08a") =>
				`<path d="M${x - 34} ${y} q-6 -50 10 -70 q-8 -14 6 -18 h36 q14 4 6 18 q16 20 10 70 Z" fill="${c}" ${O(4)}/><path d="M${x - 14} ${y - 70} q14 8 28 0" stroke="${K.ink}" stroke-width="3" fill="none"/>`;
			const barrel = (x, y) =>
				`<rect x="${x - 40}" y="${y - 100}" width="80" height="102" rx="16" fill="${K.wood}" ${O(5)}/><path d="M${x - 40} ${y - 72} H${x + 40} M${x - 40} ${y - 28} H${x + 40}" stroke="${K.woodD}" stroke-width="7"/>`;
			for (const [x0, w] of [
				[40, 520],
				[1360, 520],
			]) {
				s += `<path d="M${x0 + 10} 900 V140 M${x0 + w - 10} 900 V140" stroke="${K.woodD}" stroke-width="16"/>`;
				for (const y of [330, 560, 790]) {
					s += shelf(x0, y, w);
					for (let i = 0; i < 5; i++) {
						const bw = 70 + ((i * 37 + y) % 3) * 14,
							bx = x0 + 24 + i * 98;
						s +=
							(i + y / 10) % 4 === 1
								? jar(
										bx + 30,
										y,
										["#e8455c", "#4ab0ff", "#6fdc6f"][(i + y) % 3],
									)
								: box(
										bx,
										y,
										bw,
										60 + ((i + y) % 2) * 26,
										(i + y) % 3 ? K.wood : "#c79a62",
									);
					}
				}
			}

			s +=
				`<path d="M860 0 V${STORAGE_SIGN_Y - 40} M1060 0 V${STORAGE_SIGN_Y - 40}" stroke="${K.ink}" stroke-width="4" opacity=".75"/>` +
				sign(960, STORAGE_SIGN_Y, 320, "СКЛАД");
			s +=
				sack(640, 905) +
				sack(700, 912, "#c8ab72") +
				sack(1250, 905) +
				barrel(1120, 905) +
				barrel(800, 908);
			s +=
				`<path d="M1500 900 L1440 380 M1560 900 L1500 380" stroke="${K.woodD}" stroke-width="10"/>` +
				[0, 1, 2, 3, 4, 5, 6]
					.map(
						(i) =>
							`<path d="M${1494 - i * 8.5} ${830 - i * 70} H${1554 - i * 8.5}" stroke="${K.woodD}" stroke-width="8"/>`,
					)
					.join("");
			s += `<rect x="760" y="720" width="400" height="30" rx="8" fill="${K.wood}" ${O(5)}/><path d="M800 750 V900 M1120 750 V900" stroke="${K.woodD}" stroke-width="14"/>`;
			s += `<rect x="820" y="676" width="110" height="44" rx="4" fill="#f3efd8" ${O(3)}/><path d="M832 690 H916 M832 704 H900" stroke="${K.ink}" stroke-width="2.5" opacity=".5"/>`;
		} else if (RX) {
			s += win(260, 160) + win(1480, 160) + lamp(960) + RX.plain(O);
			s += `<rect x="760" y="720" width="400" height="30" rx="8" fill="${K.wood}" ${O(5)}/><path d="M800 750 V900 M1120 750 V900" stroke="${K.woodD}" stroke-width="14"/><path d="M820 718 l20 -40 h60 l20 40 Z" fill="#f3efd8" ${O(4)}/>`;
		} else if (HELL) {
			const banner = (x) =>
				`<path d="M${x - 70} 120 H${x + 70} V420 L${x} 380 L${x - 70} 420 Z" fill="#8a1424" ${O(5)}/><path d="M${x - 70} 120 H${x + 70}" stroke="#ffc83d" stroke-width="10"/>` +
				`<path d="M${x - 30} 250 q-26 -10 -24 -60 q10 34 34 44 Z M${x + 30} 250 q26 -10 24 -60 q-10 34 -34 44 Z" fill="#ffc83d" ${O(3)}/><circle cx="${x}" cy="262" r="26" fill="#ffc83d" ${O(3)}/><path d="M${x - 10} 258 h0.1 M${x + 10} 258 h0.1" stroke="${K.ink}" stroke-width="7" stroke-linecap="round"/>`;
			const flame = (x, y, k = 1) =>
				`<path d="M${x} ${y} c${-14 * k} ${-3 * k} ${-16 * k} ${-22 * k} 0 ${-40 * k} c${3 * k} ${15 * k} ${13 * k} ${16 * k} ${10 * k} ${26 * k} c${6 * k} 0 ${5 * k} ${11 * k} ${-10 * k} ${14 * k} Z" fill="#ff9a2a" ${O(3)}/><path d="M${x} ${y - 3 * k} c${-6 * k} ${-3 * k} ${-6 * k} ${-13 * k} 0 ${-20 * k} c${5 * k} ${8 * k} ${6 * k} ${16 * k} 0 ${20 * k} Z" fill="#ffe27a"/>`;
			s += win(260, 160) + win(1480, 160) + banner(640) + banner(1280);
			s +=
				`<circle cx="960" cy="230" r="170" fill="url(#rmGlow)"/><path d="M960 0 V150" stroke="${K.ink}" stroke-width="6"/><path d="M820 210 Q960 290 1100 210" stroke="${K.ink}" stroke-width="12" fill="none"/><path d="M820 210 Q960 290 1100 210" stroke="#5a5470" stroke-width="6" fill="none"/><path d="M960 150 L830 205 M960 150 L1090 205 M960 150 V252" stroke="${K.ink}" stroke-width="4"/>` +
				[830, 895, 960, 1025, 1090]
					.map(
						(x, i) =>
							`<rect x="${x - 10}" y="${[200, 232, 246, 232, 200][i] - 24}" width="20" height="24" fill="#f3efd8" ${O(3)}/>` +
							flame(x, [200, 232, 246, 232, 200][i] - 24, 0.8),
					)
					.join("");
			s += `<rect x="1460" y="560" width="300" height="340" rx="40" fill="#5a5470" ${O(6)}/><circle cx="1610" cy="730" r="70" fill="#ff7a1a" ${O(6)}/><circle cx="1610" cy="730" r="44" fill="#ffe27a"/><path d="M1540 730 h140 M1610 660 v140" stroke="${K.ink}" stroke-width="6"/><path d="M1560 560 V420 H1700 V0" stroke="${K.ink}" stroke-width="34" fill="none"/><path d="M1560 560 V420 H1700 V0" stroke="#8a4a2a" stroke-width="22" fill="none"/><circle cx="1500" cy="600" r="30" fill="#f3efd8" ${O(5)}/><path d="M1500 600 L1516 582" stroke="#c8102e" stroke-width="4" stroke-linecap="round"/>`;
			s +=
				`<rect x="740" y="720" width="440" height="34" rx="6" fill="#2a2236" ${O(5)}/><path d="M780 754 V900 M1140 754 V900" stroke="${K.ink}" stroke-width="18"/><path d="M780 754 V900 M1140 754 V900" stroke="#5a5470" stroke-width="10"/>` +
				`<path d="M820 718 l20 -40 h60 l20 40 Z" fill="#e8d0a0" ${O(4)}/><rect x="1060" y="680" width="22" height="40" fill="#f3efd8" ${O(3)}/>` +
				flame(1071, 680, 0.6) +
				`<path d="M960 720 V650 M940 650 h40" stroke="#ffc83d" stroke-width="8" stroke-linecap="round"/>`;
		} else {
			s += win(260, 160) + win(1480, 160) + lamp(960);
			s += `<rect x="760" y="720" width="400" height="30" rx="8" fill="${K.wood}" ${O(5)}/><path d="M800 750 V900 M1120 750 V900" stroke="${K.woodD}" stroke-width="14"/>`;
			s += `<path d="M820 718 l20 -40 h60 l20 40 Z" fill="#f3efd8" ${O(4)}/>`;
		}
		return s;
	}
	window.LGCityArt = { room, roomFront, PAL, SHOP_SHELF, shopTopBoxes };
})();
