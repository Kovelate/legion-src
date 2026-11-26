((root) => {
	const INK = "#2b1d18",
		SW = 4.5;
	const o = (w = SW) =>
		`stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

	const eye = (x, y, r = 6.5, c = "#f2b544", look = 0, slit = false) =>
		`<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 1.08}" fill="${c}" ${o(Math.max(1.6, r * 0.4))}/>` +
		(slit
			? `<ellipse cx="${x + look}" cy="${y}" rx="${r * 0.22}" ry="${r * 0.8}" fill="${INK}"/>`
			: `<ellipse cx="${x + look}" cy="${y + r * 0.1}" rx="${r * 0.56}" ry="${r * 0.66}" fill="${INK}"/>`) +
		`<circle cx="${x + look - r * 0.28}" cy="${y - r * 0.3}" r="${r * 0.26}" fill="#fff"/><circle cx="${x + look + r * 0.22}" cy="${y + r * 0.3}" r="${r * 0.11}" fill="#fff"/>`;

	const glowEye = (x, y, r = 5, c = "#9ff3ff") =>
		`<circle cx="${x}" cy="${y}" r="${r * 1.7}" fill="${c}" opacity=".35"/><ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.8}" fill="${c}" ${o(1.6)}/><circle cx="${x - r * 0.3}" cy="${y - r * 0.25}" r="${r * 0.3}" fill="#fff"/>`;
	const shadow = (x, y, rx) =>
		`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${rx * 0.22}" fill="rgba(43,29,24,.22)"/>`;

	const shine = (d, c = "rgba(255,255,255,.55)", w = 3) =>
		`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
	const mix = (a, b, t) => {
		const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
		const A = p(a),
			B = p(b);
		return (
			"#" +
			A.map((v, i) =>
				Math.round(v + (B[i] - v) * t)
					.toString(16)
					.padStart(2, "0"),
			).join("")
		);
	};
	const dk = (c, t = 0.3) => mix(c, "#1a1210", t),
		lt = (c, t = 0.35) => mix(c, "#ffffff", t);

	const TIER = {
		weak: ["#7bc96f", "#3f8a35", "#e9f2d6"],
		mid: ["#f2c14e", "#b8862a", "#f6eccd"],
		strong: ["#ef7b55", "#b0452a", "#f6e0d2"],
		elite: ["#b06ae0", "#6e3a99", "#ece0f4"],
		escort: ["#e0954a", "#8a4a1e", "#f3e2cc"],
		boss: ["#3a2a2e", "#e8c35a", "#e9dcc6"],
	};
	function medal(inner, tier = "mid") {
		const [c, d, bg] = TIER[tier] || TIER.mid;
		let s = `<circle cx="64" cy="68" r="56" fill="rgba(43,29,24,.35)"/><circle cx="64" cy="64" r="56" fill="${c}" ${o(5)}/>`;
		if (tier === "boss")
			s += `<circle cx="64" cy="64" r="51" fill="none" stroke="${d}" stroke-width="3"/>`;
		s += `<circle cx="64" cy="64" r="45" fill="${bg}" stroke="${d}" stroke-width="3"/><path d="M30 34 A45 45 0 0 1 98 34" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="${tier === "boss" ? 0.25 : 0.55}"/>`;

		s += inner;
		if (tier === "boss")
			s += `<path d="M46 12 l6 8 6-10 6 10 6-10 6 10 6-8 -2 12 h-32 z" fill="#e8c35a" ${o(3)}/>`;
		if (tier === "elite")
			s += `<path d="M64 6 l5 7 8 1 -6 6 2 8 -9 -4 -9 4 2 -8 -6 -6 8 -1 z" fill="#d9b8f2" ${o(2.6)}/>`;
		if (tier === "escort")
			s += `<path d="M50 10 l7 7 7-9 7 9 7-7 -3 11 h-22 z" fill="#f2c14e" ${o(2.6)}/>`;
		return s;
	}
	const M = {};
	const LGMon = {
		INK,
		SW,
		o,
		eye,
		glowEye,
		shadow,
		shine,
		mix,
		dk,
		lt,
		TIER,
		medal,
		M,
		add(id, def) {
			M[id] = def;
		},
		has: (id) => !!M[id],

		art: (id, w = 300, h = 260) =>
			M[id]
				? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 260" width="${w}" height="${h}">${M[id].art()}</svg>`
				: "",
		icon: (id, tier = "mid", size = 40) =>
			M[id]
				? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="${size}" height="${size}">${medal(M[id].face(), tier)}</svg>`
				: "",
		iconInner: (id, tier = "mid") => (M[id] ? medal(M[id].face(), tier) : ""),
	};
	root.LGMon = LGMon;
	if (typeof module === "object" && module.exports) module.exports = LGMon;
})(typeof self !== "undefined" ? self : this);

(() => {
	const { INK, SW, o, eye, glowEye, shadow, shine, dk, lt } = LGMon;
	const T = (x, y, s, g, r = 0) =>
		`<g transform="translate(${x},${y})${r ? ` rotate(${r})` : ""} scale(${s})">${g}</g>`;
	const MIR = (g) => `<g transform="scale(-1,1)">${g}</g>`;
	const both = (g) => g + MIR(g);

	const limb = (d, c, w = 8) =>
		`<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + SW * 2}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

	const FL = [
		"M0 0 C-14 0 -17 -12 -11 -22 C-10 -16 -6 -14 -5 -17 C-7 -27 -1 -34 2 -42 C4 -32 12 -28 9 -18 C12 -20 13 -23 13 -26 C19 -16 15 0 0 0 Z",
		"M0 -3 C-8 -3 -10 -10 -6 -17 C-4 -13 -2 -13 -1 -15 C-2 -22 1 -27 3 -32 C4 -24 9 -20 7 -12 C9 -14 10 -16 10 -18 C13 -10 9 -3 0 -3 Z",
		"M1 -5 C-3 -5 -5 -9 -3 -13 C-1 -11 0 -12 1 -16 C3 -13 6 -11 5 -8 C5 -6 4 -5 1 -5 Z",
	];
	const FIRE = ["#e8502a", "#ff9a2a", "#ffe066"];
	const flame = (x, y, s, r = 0, c = FIRE, ow = SW) =>
		T(
			x,
			y,
			s,
			`<path d="${FL[0]}" fill="${c[0]}" ${o(ow / s)}/><path d="${FL[1]}" fill="${c[1]}"/><path d="${FL[2]}" fill="${c[2]}"/>`,
			r,
		);

	const crack = (d, w = 3.2) =>
		`<path d="${d}" fill="none" stroke="#ff7a2a" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#ffe066" stroke-width="${w * 0.4}" stroke-linecap="round" stroke-linejoin="round"/>`;
	const sparks = (pts) =>
		pts
			.map(
				([x, y, r]) =>
					`<circle cx="${x}" cy="${y}" r="${r}" fill="#ffb030"/><circle cx="${x}" cy="${y}" r="${r * 0.45}" fill="#fff3b0"/>`,
			)
			.join("");
	const smoke = (d) =>
		`<path d="${d}" fill="none" stroke="rgba(90,80,86,.45)" stroke-width="5" stroke-linecap="round"/>`;

	function ember(fs = 1.3) {
		let g =
			flame(-15, -12, fs * 0.55, -28) +
			flame(15, -12, fs * 0.55, 28) +
			flame(0, -16, fs);
		g += `<ellipse cx="-14" cy="22" rx="9" ry="6" fill="#3a3036" ${o()}/><ellipse cx="14" cy="22" rx="9" ry="6" fill="#3a3036" ${o()}/>`;
		g += `<path d="M-30 14 C-37 2 -32 -15 -16 -21 C-6 -25 8 -25 18 -21 C33 -15 37 2 30 14 C20 25 -20 25 -30 14 Z" fill="#4a3f47" ${o()}/>`;
		g += `<path d="M-25 -10 L-13 -18 L1 -20 L-5 -11 Z" fill="#685b63"/><path d="M8 -19 L22 -13 L27 -2 L14 -9 Z" fill="#5a4e55"/>`;
		g += `<path d="M-28 11 C-18 20 18 20 28 11 C22 21 -22 22 -28 11 Z" fill="#2f272c"/>`;
		g +=
			crack("M-27 4 L-21 0 L-23 -6") +
			crack("M25 3 L19 7 L21 13") +
			crack("M-5 17 L0 13 L5 18");
		g += `<ellipse cx="-19" cy="6" rx="5" ry="3" fill="#ff7a3a" opacity=".75"/><ellipse cx="19" cy="6" rx="5" ry="3" fill="#ff7a3a" opacity=".75"/>`;
		g += eye(-10, -4, 7.4, "#ffd35a") + eye(10, -4, 7.4, "#ffd35a");
		g += `<path d="M-5 7 Q0 12 5 7" fill="none" ${o(2.4)}/>`;
		g += shine("M-21 -13 C-15 -18 -9 -19 -5 -20", "rgba(255,255,255,.35)");
		return g;
	}
	LGMon.add("ember", {
		art: () =>
			shadow(150, 220, 46) +
			T(150, 182, 1.65, ember()) +
			sparks([
				[100, 90, 3],
				[206, 78, 2.6],
				[214, 128, 2],
				[92, 140, 2.2],
				[160, 52, 2],
			]),
		face: () => T(64, 78, 0.92, ember(1.05)),
	});

	const IMP = { c: "#d9453a", d: "#a8302a", l: "#f08a5a", horn: "#f0dcb4" };
	function impHead() {
		let g = both(
			`<path d="M-25 -26 L-47 -34 L-40 -23 L-47 -14 L-25 -11 Z" fill="${IMP.c}" ${o()}/><path d="M-29 -24 L-40 -28 L-36 -22 L-39 -17 L-29 -16 Z" fill="${IMP.d}"/>`,
		);
		g += both(
			`<path d="M-14 -39 C-21 -49 -19 -58 -10 -65 C-11 -56 -8 -48 -3 -43 Z" fill="${IMP.horn}" ${o()}/><path d="M-15 -49 L-9 -47 M-13 -56 L-8 -54" stroke="${dk(IMP.horn, 0.35)}" stroke-width="1.8" stroke-linecap="round"/>`,
		);
		g += `<path d="M0 -44 C20 -44 30 -32 30 -18 C30 -4 18 4 0 4 C-18 4 -30 -4 -30 -18 C-30 -32 -20 -44 0 -44 Z" fill="${IMP.c}" ${o()}/>`;
		g += `<path d="M-21 -36 C-11 -44 11 -44 21 -36 C11 -38 4 -35 0 -29 C-4 -35 -11 -38 -21 -36 Z" fill="${IMP.d}"/>`;
		g += `<path d="M-19 -9 C-15 -17 15 -17 19 -9 C15 1 -15 1 -19 -9 Z" fill="${IMP.l}"/>`;
		g +=
			eye(-11, -21, 7, "#ffe066", 0.8, true) +
			eye(11, -21, 7, "#ffe066", 0.8, true);
		g += both(
			`<path d="M-19 -31 L-5 -26" stroke="${INK}" stroke-width="2.8" stroke-linecap="round"/>`,
		);
		g += `<circle cx="-2.5" cy="-13" r="1.2" fill="${INK}"/><circle cx="2.5" cy="-13" r="1.2" fill="${INK}"/>`;
		g += `<path d="M-12 -8 Q0 0 13 -9 Q2 7 -12 -8 Z" fill="#6a1a1a" ${o(2.2)}/><path d="M-8 -5.5 L-6.5 -1.5 L-4.5 -4.4 Z M7 -6 L8 -2 L9.6 -6.6 Z" fill="#fff" stroke="${INK}" stroke-width="1"/>`;
		g += shine("M-20 -34 C-14 -39 -8 -41 -3 -41", "rgba(255,255,255,.45)");
		return g;
	}
	function impBody() {
		let g = both(
			`<path d="M-10 6 C-26 -6 -42 -12 -50 -4 C-44 -2 -42 2 -44 7 C-38 5 -34 8 -34 12 C-28 8 -22 10 -14 15 Z" fill="#8a2a2a" ${o()}/><path d="M-14 9 L-44 -2 M-16 12 L-38 8" stroke="#5e1a1a" stroke-width="2" stroke-linecap="round"/>`,
		);
		g +=
			limb("M8 32 C26 40 38 30 32 18", IMP.c, 4.5) +
			`<path d="M26 18 L35 8 L39 20 Z" fill="${IMP.d}" ${o(3)}/>`;
		g += limb("M-6 34 L-8 42", IMP.c, 7) + limb("M6 34 L8 42", IMP.c, 7);
		g += `<path d="M-14 44 L-14 40 Q-8 37 -2 40 L-2 44 Z" fill="#3a2226" ${o(3)}/><path d="M2 44 L2 40 Q8 37 14 40 L14 44 Z" fill="#3a2226" ${o(3)}/>`;
		g += `<path d="M-12 4 C-17 16 -15 30 -11 37 L11 37 C15 30 17 16 12 4 Z" fill="${IMP.c}" ${o()}/>`;
		g += `<ellipse cx="0" cy="24" rx="7" ry="9" fill="${IMP.l}"/><path d="M-4 22 H4 M-4 27 H4" stroke="${dk(IMP.l, 0.25)}" stroke-width="1.6" stroke-linecap="round"/>`;
		g += limb("M-11 12 L-21 21 L-13 27", IMP.c, 6);
		return g;
	}
	LGMon.add("imp", {
		art: () =>
			shadow(150, 224, 42) +
			T(
				150,
				160,
				1.4,
				impBody() +
					impHead() +
					limb("M11 10 L30 4 L37 -6", IMP.c, 6) +
					flame(38, -8, 0.62),
			) +
			sparks([
				[214, 92, 2.4],
				[228, 116, 1.8],
				[98, 120, 2],
			]),
		face: () => T(64, 88, 1.05, impHead()),
	});

	const RAT = { c: "#7d7478", d: "#5a5256", l: "#b9afb0", pink: "#e6a2a0" };
	function ratHead() {
		let g = both(
			`<circle cx="-20" cy="-34" r="13" fill="${RAT.c}" ${o()}/><circle cx="-20" cy="-34" r="7.5" fill="${RAT.pink}"/><path d="M-27 -42 C-25 -45 -21 -46 -18 -46" fill="none" stroke="${RAT.l}" stroke-width="2.2" stroke-linecap="round"/>`,
		);
		g += `<path d="M-7 -30 L-4 -27" stroke="#ff7a2a" stroke-width="2"/>`;
		g += `<path d="M0 -40 C14 -40 23 -30 23 -18 C23 -8 11 4 0 8 C-11 4 -23 -8 -23 -18 C-23 -30 -14 -40 0 -40 Z" fill="${RAT.c}" ${o()}/>`;
		g += `<path d="M-14 -34 C-6 -40 6 -40 14 -34 C8 -34 4 -31 0 -26 C-4 -31 -8 -34 -14 -34 Z" fill="${RAT.d}"/>`;
		g += `<path d="M-14 -6 C-10 -14 10 -14 14 -6 C10 2 4 6 0 7 C-4 6 -10 2 -14 -6 Z" fill="${RAT.l}"/>`;
		g +=
			`<path d="M14 -30 C17 -28 18 -25 17 -22 L13 -24 Z" fill="#3a3236"/>` +
			`<circle cx="16" cy="-27" r="1.4" fill="#ff8a3a"/>`;
		g += eye(-9, -20, 6.2, "#ff7a3a") + eye(9, -20, 6.2, "#ff7a3a");
		g += `<path d="M-3.5 3 Q0 1 3.5 3 Q2 7 0 7 Q-2 7 -3.5 3 Z" fill="${RAT.pink}" ${o(1.8)}/>`;
		g += `<path d="M-2.6 8.5 h5.2 v4 h-5.2 Z" fill="#fff6e0" ${o(1.6)}/><path d="M0 8.6 v3.8" stroke="${INK}" stroke-width="1"/>`;
		g += both(
			`<path d="M-8 2 L-22 -1 M-8 5 L-22 6" stroke="${INK}" stroke-width="1.4" stroke-linecap="round"/>`,
		);
		return g;
	}
	function ratBody() {
		let g =
			limb("M16 34 C38 40 50 26 44 12 C40 4 44 -6 50 -9", "#b08a86", 6) +
			`<path d="M44 0 L48 -6" stroke="#5a3a36" stroke-width="2.4"/>` +
			flame(51, -8, 0.42, 30);
		g += `<path d="M-20 38 C-27 20 -20 -1 0 -3 C20 -1 27 20 20 38 Z" fill="${RAT.c}" ${o()}/>`;
		g += `<path d="M-11 36 C-14 22 -9 8 0 6 C9 8 14 22 11 36 Z" fill="${RAT.l}"/>`;
		g += `<path d="M14 10 C18 14 19 20 17 24 C13 20 12 15 14 10 Z" fill="#3a3236"/><circle cx="16" cy="18" r="1.6" fill="#ff8a3a"/><circle cx="-15" cy="26" r="1.4" fill="#ff8a3a"/>`;
		g += both(
			`<ellipse cx="-12" cy="39" rx="7" ry="4" fill="${RAT.pink}" ${o(3.4)}/>`,
		);
		g += both(
			`<path d="M-9 10 C-12 14 -10 19 -5 19" fill="none" stroke="${INK}" stroke-width="${6 + SW * 2}" stroke-linecap="round"/><path d="M-9 10 C-12 14 -10 19 -5 19" fill="none" stroke="${RAT.c}" stroke-width="6" stroke-linecap="round"/><circle cx="-4" cy="19" r="3" fill="${RAT.pink}"/>`,
		);
		return g;
	}
	LGMon.add("ashrat", {
		art: () =>
			shadow(152, 222, 44) +
			T(150, 168, 1.38, ratBody() + ratHead()) +
			smoke("M226 96 C232 86 224 78 230 68"),
		face: () => T(64, 86, 1.12, ratHead()),
	});

	const SAL = { c: "#e8622e", d: "#b0401f", l: "#ffcf6a", spot: "#ffd35a" };
	function salamander() {
		let g = "";
		for (const [x, s] of [
			[-44, 0.5],
			[-28, 0.62],
			[-10, 0.72],
			[8, 0.7],
			[26, 0.6],
			[42, 0.48],
			[58, 0.38],
		])
			g += flame(x, -16, s, (x - 8) * 0.3);
		g +=
			limb("M-34 8 L-44 22 L-52 26", SAL.d, 8) +
			limb("M38 8 L46 22 L54 24", SAL.d, 8);
		g += `<path d="M-96 4 C-96 -10 -82 -18 -64 -16 C-50 -24 -20 -26 4 -22 C28 -18 46 -10 58 -2 C72 6 88 2 98 -10 C100 6 84 20 60 16 C40 14 20 14 0 14 C-24 16 -44 16 -60 14 C-78 18 -96 16 -96 4 Z" fill="${SAL.c}" ${o()}/>`;
		g += `<path d="M-62 13 C-40 6 0 5 54 12 C30 16 -30 16 -62 13 Z" fill="${SAL.l}"/>`;
		g += `<path d="M-50 -18 C-30 -23 0 -23 20 -18 C0 -16 -30 -15 -50 -18 Z" fill="${SAL.d}"/>`;
		g += [
			[-40, -8, 4],
			[-20, -4, 3.4],
			[-2, -10, 4.4],
			[18, -4, 3.2],
			[36, -6, 3],
			[62, 4, 2.6],
			[78, 2, 2.2],
		]
			.map(
				([x, y, r]) =>
					`<circle cx="${x}" cy="${y}" r="${r}" fill="${SAL.spot}" stroke="${SAL.d}" stroke-width="1.4"/>`,
			)
			.join("");
		g +=
			limb("M-48 8 L-56 24 L-66 27", SAL.c, 8) +
			limb("M24 8 L30 24 L22 28", SAL.c, 8);
		g += `<path d="M-72 27 L-66 22 M-64 30 L-62 24 M18 32 L22 26 M26 32 L25 26" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`;
		g += `<path d="M-94 6 Q-82 11 -68 8" fill="none" ${o(2.2)}/><circle cx="-90" cy="-3" r="1.4" fill="${INK}"/>`;
		g += eye(-74, -8, 7, "#ffe066", -1, true);
		g +=
			shine("M-84 -14 C-76 -17 -68 -17 -62 -16") +
			shine("M-30 -22 C-10 -24 6 -23 18 -20", "rgba(255,255,255,.4)");
		return g;
	}
	function salFace() {
		let g =
			flame(-20, -18, 0.62, -30) +
			flame(20, -18, 0.62, 30) +
			flame(0, -22, 0.78);
		g += both(
			`<path d="M-38 6 L-50 0 L-44 10 L-52 16 L-38 16 Z" fill="${SAL.d}" ${o(3.6)}/>`,
		);
		g += `<path d="M0 -26 C22 -26 38 -14 40 2 C42 18 24 28 0 28 C-24 28 -42 18 -40 2 C-38 -14 -22 -26 0 -26 Z" fill="${SAL.c}" ${o()}/>`;
		g += `<path d="M-30 14 C-18 24 18 24 30 14 C22 27 -22 27 -30 14 Z" fill="${SAL.l}"/>`;
		g += both(`<circle cx="-19" cy="-12" r="11" fill="${SAL.c}" ${o()}/>`);
		g +=
			eye(-19, -12, 7.6, "#ffe066", 0, true) +
			eye(19, -12, 7.6, "#ffe066", 0, true);
		g += `<path d="M-26 8 Q0 20 26 8" fill="none" ${o(2.6)}/><circle cx="-5" cy="2" r="1.6" fill="${INK}"/><circle cx="5" cy="2" r="1.6" fill="${INK}"/>`;
		g += [
			[-30, -2, 3],
			[30, -2, 3],
			[-8, -20, 2.6],
			[8, -20, 2.6],
		]
			.map(
				([x, y, r]) =>
					`<circle cx="${x}" cy="${y}" r="${r}" fill="${SAL.spot}" stroke="${SAL.d}" stroke-width="1.2"/>`,
			)
			.join("");
		return g;
	}
	LGMon.add("salamander", {
		art: () =>
			shadow(152, 218, 96) +
			T(150, 194, 1.2, salamander()) +
			sparks([
				[96, 118, 2],
				[196, 104, 2.4],
				[230, 140, 1.8],
			]),
		face: () => T(64, 72, 1.0, salFace()),
	});

	const HH = { c: "#3b3236", d: "#28211f", l: "#5d5055", glow: "#ffb030" };
	function hound() {
		let g = flame(58, -10, 1.0, 70) + flame(56, -16, 0.7, 40);
		g +=
			limb("M34 8 L40 26 L36 40", HH.d, 9) +
			limb("M-28 8 L-34 26 L-30 40", HH.d, 9);
		for (const [x, y, s, r] of [
			[-14, -24, 0.8, 10],
			[2, -24, 0.65, 20],
		])
			g += flame(x, y, s, r);
		g += `<path d="M-40 -10 C-30 -26 20 -28 40 -18 C52 -12 54 4 46 12 C30 18 -20 18 -36 10 C-44 4 -46 -4 -40 -10 Z" fill="${HH.c}" ${o()}/>`;
		g += `<path d="M-30 10 C-10 16 20 16 40 10 C20 18 -10 18 -30 10 Z" fill="${HH.d}"/>`;
		g +=
			crack("M-10 -14 L-4 -6 L-8 2") +
			crack("M20 -16 L24 -8 L18 -2") +
			crack("M38 -8 L42 0");
		g += `<path d="M-40 -8 C-46 -22 -46 -34 -42 -44 L-28 -38 C-28 -28 -26 -18 -22 -12 Z" fill="${HH.c}" ${o()}/>`;
		for (const [x, y, s, r] of [
			[-26, -18, 0.8, 30],
			[-30, -30, 0.85, 22],
			[-34, -42, 0.8, 12],
			[-40, -50, 0.62, 0],
		])
			g += flame(x, y, s, r);
		g += `<path d="M-50 -52 L-38 -74 L-32 -48 Z" fill="${HH.c}" ${o()}/><path d="M-46 -54 L-38 -68 L-36 -52 Z" fill="#7a3a2a"/>`;
		g += `<path d="M-36 -48 C-46 -58 -62 -56 -70 -48 L-88 -44 C-94 -40 -92 -32 -86 -31 L-80 -30 L-82 -24 L-68 -26 C-56 -22 -42 -26 -36 -34 Z" fill="${HH.c}" ${o()}/>`;
		g += `<path d="M-86 -31 L-70 -31 L-66 -27" fill="none" ${o(2)}/><path d="M-82 -31 L-80 -27 L-78 -31 M-74 -31 L-72 -27 L-70 -31" fill="#fff" stroke="${INK}" stroke-width="1"/>`;
		g += `<ellipse cx="-90" cy="-41" rx="3.4" ry="2.6" fill="${INK}"/>`;
		g +=
			glowEye(-62, -44, 4.6, HH.glow) +
			`<path d="M-70 -50 L-55 -47" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`;
		g +=
			limb("M-40 8 L-46 26 L-46 40", HH.c, 9) +
			limb("M26 10 L28 26 L22 40", HH.c, 9);
		g += `<path d="M-52 42 L-50 38 M-46 43 L-46 39 M16 42 L18 38 M22 43 L22 39" stroke="${HH.glow}" stroke-width="2.4" stroke-linecap="round"/>`;
		g +=
			shine("M-30 -20 C-10 -26 10 -27 30 -22", "rgba(255,255,255,.22)") +
			shine("M-66 -52 C-58 -56 -50 -56 -44 -52", "rgba(255,255,255,.25)");
		return g;
	}
	function houndFace() {
		let g = "";
		for (const r of [-64, -34, 0, 34, 64])
			g += flame(
				Math.sin((r * Math.PI) / 180) * 20,
				4 - Math.cos((r * Math.PI) / 180) * 16,
				0.62,
				r,
			);
		g += both(
			`<path d="M-16 -22 L-30 -50 L-4 -28 Z" fill="${HH.c}" ${o()}/><path d="M-16 -26 L-26 -44 L-9 -29 Z" fill="#7a3a2a"/>`,
		);
		g += `<path d="M0 -30 C17 -30 28 -20 28 -5 L19 15 C13 26 6 31 0 31 C-6 31 -13 26 -19 15 L-28 -5 C-28 -20 -17 -30 0 -30 Z" fill="${HH.c}" ${o()}/>`;
		g += `<path d="M-10 2 C-10 -4 10 -4 10 2 L8 19 C5 25 -5 25 -8 19 Z" fill="${HH.l}"/>`;
		g +=
			crack("M-20 -16 L-14 -10 L-18 -4", 2.6) + crack("M18 -18 L13 -12", 2.6);
		g += glowEye(-12, -8, 5.4, HH.glow) + glowEye(12, -8, 5.4, HH.glow);
		g += both(
			`<path d="M-21 -18 L-6 -12" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,
		);
		g += `<path d="M-6 8 Q0 5 6 8 Q5 13 0 14 Q-5 13 -6 8 Z" fill="${INK}"/>`;
		g += `<path d="M-11 18 Q0 26 11 18 Q0 31 -11 18 Z" fill="#7a2020" ${o(2)}/><path d="M-8 19 L-6.5 24 L-5 19.6 M5 19.6 L6.5 24 L8 19" fill="#fff" stroke="${INK}" stroke-width="1"/>`;
		return g;
	}
	LGMon.add("hellhound", {
		art: () =>
			shadow(146, 224, 76) +
			T(150, 176, 1.2, hound()) +
			sparks([
				[226, 70, 2.4],
				[70, 70, 2],
				[240, 110, 1.8],
			]),
		face: () => T(64, 70, 1.05, houndFace()),
	});

	const CH = {
		c: "#3a2e2c",
		d: "#251c1b",
		l: "#5a4844",
		rag: "#6b4a35",
		glow: "#ffa030",
	};
	function charredHead(light = false) {
		let g = `<path d="M-6 -70 C8 -70 16 -60 16 -50 C16 -40 10 -34 4 -32 L-14 -32 C-22 -36 -26 -44 -26 -52 C-26 -64 -18 -70 -6 -70 Z" fill="${light ? "#6e5a54" : CH.c}" ${o()}/>`;
		g += `<path d="M-22 -58 C-18 -66 -6 -68 4 -66 C-4 -64 -8 -60 -10 -56 Z" fill="${light ? "#9a8478" : CH.l}"/>`;
		g += light
			? crack("M4 -69 L-1 -62 L5 -57 L2 -52", 3) +
				crack("M-25 -49 L-19 -46 L-21 -41", 2.8) +
				crack("M12 -44 L8 -40", 2.6)
			: crack("M4 -68 L0 -62 L5 -58", 2.4) + crack("M-24 -48 L-19 -46", 2.2);
		g += `<path d="M-17 -34 L-15 -24 L5 -24 L7 -34 Z" fill="${CH.d}" ${o(3.6)}/><path d="M-14 -32 L-14 -29 M-9 -32 L-9 -28 M-4 -32 L-4 -28 M1 -32 L1 -29" stroke="#e8dcc4" stroke-width="2.2" stroke-linecap="round"/>`;
		g += `<ellipse cx="-14" cy="-51" rx="7" ry="6" fill="${CH.d}"/><ellipse cx="4" cy="-51" rx="7" ry="6" fill="${CH.d}"/>`;
		g += glowEye(-14, -51, 4.4, CH.glow) + glowEye(4, -51, 4.4, CH.glow);
		g += `<path d="M-6 -44 L-8 -40 L-4 -40 Z" fill="${CH.d}"/>`;
		return g;
	}
	function charred() {
		let g =
			smoke("M-4 -76 C-10 -86 0 -92 -6 -104") +
			smoke("M10 -72 C16 -80 8 -88 14 -96");
		g +=
			limb("M14 -24 L2 -6 L-24 -2", CH.d, 9) +
			`<path d="M-26 -6 L-34 -8 M-26 0 L-34 2" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
		g +=
			limb("M-10 8 L-16 26 L-14 40", CH.c, 10) +
			limb("M12 8 L18 26 L18 40", CH.c, 10);
		g += `<path d="M-24 42 L-12 42 M10 42 L24 42" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`;
		g += `<path d="M-18 -30 C-8 -40 14 -38 20 -26 L22 8 C16 14 -14 14 -20 8 Z" fill="${CH.c}" ${o()}/>`;
		g += `<path d="M-12 -22 C-6 -24 4 -24 10 -22 M-12 -14 C-6 -16 4 -16 10 -14 M-12 -6 C-6 -8 4 -8 10 -6" fill="none" stroke="${CH.d}" stroke-width="2.6" stroke-linecap="round"/>`;
		g +=
			crack("M14 -30 L10 -20 L16 -12 L12 -2") +
			crack("M-16 -10 L-10 -4 L-14 4");
		g += `<path d="M-22 2 L22 2 L24 20 L16 15 L10 24 L2 15 L-6 24 L-12 15 L-22 21 Z" fill="${CH.rag}" ${o()}/><path d="M-18 6 L18 6" stroke="${dk(CH.rag, 0.3)}" stroke-width="2"/>`;
		g += charredHead();
		g +=
			limb("M-14 -26 L-36 -14 L-52 -16", CH.c, 9) +
			`<path d="M-54 -20 L-62 -22 M-55 -15 L-63 -14 M-53 -11 L-60 -7" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>` +
			crack("M-30 -18 L-24 -14", 2.4);
		return g;
	}
	LGMon.add("charred", {
		art: () =>
			shadow(152, 220, 46) +
			T(156, 164, 1.3, charred()) +
			sparks([
				[110, 70, 2],
				[196, 60, 2.2],
				[210, 120, 1.6],
			]),
		face: () => T(72, 146, 1.58, charredHead(true)),
	});

	const GOL = { c: "#4a3c3c", d: "#2f2626", l: "#6e5c5a" };
	function golem() {
		let g = "";
		g += both(
			`<path d="M-30 12 L-34 40 L-8 40 L-10 12 Z" fill="${GOL.d}" ${o()}/><path d="M-36 40 L-6 40" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`,
		);
		g += `<path d="M-46 -50 C-30 -64 30 -64 46 -50 L52 -10 C46 10 30 18 0 18 C-30 18 -46 10 -52 -10 Z" fill="${GOL.c}" ${o()}/>`;
		g += `<path d="M-40 -48 C-26 -58 -4 -60 10 -58 L-6 -44 L-30 -40 Z" fill="${GOL.l}"/><path d="M-50 -6 C-40 10 -20 16 0 16 C30 16 46 8 50 -6 C40 4 20 10 0 10 C-20 10 -40 4 -50 -6 Z" fill="${GOL.d}"/>`;
		g += `<circle cx="0" cy="-24" r="14" fill="#ff7a2a" ${o()}/><circle cx="0" cy="-24" r="8" fill="#ffd35a"/><circle cx="-3" cy="-27" r="3" fill="#fff6c0"/>`;
		g +=
			crack("M-14 -24 L-26 -18 L-30 -4 L-40 2") +
			crack("M14 -24 L26 -30 L34 -20 L44 -16") +
			crack("M2 -10 L6 2 L0 12") +
			crack("M-6 -38 L-12 -50");
		g += `<path d="M-16 -56 C-16 -76 16 -76 16 -56 L14 -46 L-14 -46 Z" fill="${GOL.c}" ${o()}/><path d="M-12 -66 L12 -66 L10 -60 L-10 -60 Z" fill="${GOL.d}"/>`;
		g +=
			glowEye(-6, -60, 3.4, "#ffcf40") +
			glowEye(6, -60, 3.4, "#ffcf40") +
			crack("M-6 -52 L6 -52", 2.4);
		g += both(
			`<path d="M-66 -36 L-74 -4 L-56 0 L-50 -32 Z" fill="${GOL.c}" ${o()}/>` +
				crack("M-64 -26 L-60 -14", 2.6),
		);
		g += both(
			`<path d="M-70 -66 C-58 -72 -40 -66 -36 -52 C-36 -40 -48 -32 -62 -34 C-74 -38 -78 -58 -70 -66 Z" fill="${GOL.c}" ${o()}/><path d="M-66 -62 C-58 -66 -48 -64 -44 -58" fill="none" stroke="${GOL.l}" stroke-width="3.4" stroke-linecap="round"/>` +
				crack("M-60 -50 L-52 -44 L-54 -38", 2.6),
		);
		g += both(
			`<path d="M-80 -6 C-88 8 -86 30 -72 36 C-56 40 -48 28 -50 6 C-52 -4 -70 -10 -80 -6 Z" fill="${GOL.c}" ${o()}/><path d="M-76 26 L-66 22 M-70 34 L-62 28 M-60 32 L-56 24" stroke="${GOL.d}" stroke-width="2.6" stroke-linecap="round"/>` +
				crack("M-80 4 L-72 10 L-74 18", 2.6),
		);
		g += `<path d="M44 -2 C46 4 44 10 44 14" stroke="#ff7a2a" stroke-width="4" stroke-linecap="round"/><circle cx="44" cy="17" r="2.4" fill="#ff9a2a"/>`;
		return g;
	}
	function golemFace() {
		let g = `<path d="M-36 -28 L-14 -40 L18 -38 L38 -24 L42 8 L30 32 L-24 34 L-42 10 Z" fill="#7a6664" ${o()}/>`;
		g += `<path d="M-30 -24 L-12 -34 L14 -33 L4 -24 L-20 -18 Z" fill="#a08a84"/><path d="M-38 10 L-24 30 L30 28 L38 10 L26 22 L-22 24 Z" fill="${GOL.c}"/>`;
		g += `<path d="M-30 -12 L-4 -6 L-4 2 L-30 -2 Z M30 -12 L4 -6 L4 2 L30 -2 Z" fill="${GOL.d}"/>`;
		g += `<path d="M-30 -16 L-2 -8" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><path d="M30 -16 L2 -8" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
		g += glowEye(-15, -3, 5.4, "#ffcf40") + glowEye(15, -3, 5.4, "#ffcf40");
		g += `<path d="M-16 16 L-8 12 L0 17 L8 12 L16 16 L10 22 L-10 22 Z" fill="#ff7a2a" ${o(3)}/><path d="M-10 17 L10 17" stroke="#ffe066" stroke-width="2.4" stroke-linecap="round"/>`;
		g +=
			crack("M-14 -38 L-18 -26 L-30 -22", 4) +
			crack("M24 -34 L22 -22 L34 -14", 4) +
			crack("M-38 4 L-28 12 L-30 22", 4) +
			crack("M36 2 L28 14", 4);
		return g;
	}
	LGMon.add("lavagolem", {
		art: () =>
			shadow(150, 222, 84) +
			T(150, 176, 1.15, golem()) +
			sparks([
				[60, 90, 2.4],
				[240, 80, 2],
				[250, 150, 1.8],
				[104, 54, 1.8],
			]),
		face: () => T(64, 66, 1.0, golemFace()),
	});

	function dragonHead(p, boss = false, mini = false) {
		let g = "";
		if (boss)
			for (const [x, y, r, h] of mini
				? [
						[-14, -26, -40, 11],
						[14, -26, 40, 11],
						[-23, -20, -62, 10],
						[23, -20, 62, 10],
					]
				: [
						[-12, -30, -18, 20],
						[0, -32, 0, 24],
						[12, -30, 18, 20],
						[-22, -24, -38, 16],
						[22, -24, 38, 16],
					])
				g += `<g transform="translate(${x},${y}) rotate(${r})"><path d="M-5 4 L0 ${-h} L5 4 Z" fill="${p.horn}" ${o(3.4)}/></g>`;
		g += both(
			`<path d="M-30 -2 L-50 -10 L-42 2 L-52 10 L-32 12 Z" fill="${p.d}" ${o()}/>`,
		);
		g += both(
			`<path d="M-18 -22 C-28 -30 -38 -36 -42 -48 C-32 -42 -24 -38 -10 -30 Z" fill="${p.horn}" ${o()}/><path d="M-28 -34 L-25 -38 M-35 -40 L-32 -44" stroke="${dk(p.horn, 0.35)}" stroke-width="2" stroke-linecap="round"/>`,
		);
		g += `<path d="M0 -30 C20 -30 32 -18 32 -2 C32 10 26 18 20 22 C14 32 6 34 0 34 C-6 34 -14 32 -20 22 C-26 18 -32 10 -32 -2 C-32 -18 -20 -30 0 -30 Z" fill="${p.c}" ${o()}/>`;
		g += `<path d="M-8 -28 L0 -18 L8 -28 C4 -30 -4 -30 -8 -28 Z" fill="${p.d}"/>`;
		g += `<path d="M-14 10 C-14 2 14 2 14 10 L12 24 C8 32 -8 32 -12 24 Z" fill="${p.l}"/><path d="M-10 16 H10 M-9 22 H9" stroke="${dk(p.l, 0.2)}" stroke-width="1.6" stroke-linecap="round"/>`;
		g += `<ellipse cx="-5" cy="12" rx="2" ry="3" fill="${INK}"/><ellipse cx="5" cy="12" rx="2" ry="3" fill="${INK}"/>`;
		if (boss)
			g += glowEye(-13, -6, 6, "#ff9a2a") + glowEye(13, -6, 6, "#ff9a2a");
		else
			g +=
				eye(-13, -6, 6.6, "#ffe066", 0, true) +
				eye(13, -6, 6.6, "#ffe066", 0, true);
		g += both(
			`<path d="M-23 -16 L-5 -12" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/>`,
		);
		g += `<path d="M-14 28 L-11 33 L-8 29 M8 29 L11 33 L14 28" fill="#fff" stroke="${INK}" stroke-width="1.4"/>`;
		if (boss)
			g +=
				`<path d="M18 -18 L26 -4 M22 -20 L29 -9" stroke="${p.l}" stroke-width="2" stroke-linecap="round"/>` +
				crack("M-24 6 L-18 14 L-22 20", 2.6);
		g += shine("M-18 -24 C-12 -28 -6 -29 -2 -29", "rgba(255,255,255,.4)");
		return g;
	}

	const DR = {
		c: "#c8402e",
		d: "#8a2a20",
		l: "#f2b45a",
		horn: "#f0dcb4",
		mem: "#e8783a",
	};
	function drake() {
		let g = `<path d="M10 -28 L14 -80 L30 -66 L44 -84 L50 -58 L64 -60 L54 -30 Z" fill="${dk(DR.mem, 0.3)}" ${o()}/>`;
		g += `<path d="M28 12 C50 20 70 16 84 4 L98 -2 L90 12 C72 28 44 30 24 22 Z" fill="${DR.c}" ${o()}/><path d="M84 4 L98 -2 L90 12 Z" fill="${DR.d}"/>`;
		g += limb("M22 14 L30 30 L26 40", DR.d, 9);
		g += `<path d="M-20 -20 C-10 -36 18 -36 30 -20 C40 -6 36 16 20 22 C4 26 -14 20 -20 6 Z" fill="${DR.c}" ${o()}/>`;
		g += `<path d="M-16 -8 C-12 6 0 18 16 20 C4 22 -12 16 -18 4 Z" fill="${DR.l}"/>`;
		g += `<path d="M-14 -20 C-24 -36 -30 -48 -36 -54 L-26 -62 C-18 -52 -6 -40 2 -30 Z" fill="${DR.c}" ${o()}/>`;
		g += `<path d="M-14 -22 C-20 -32 -24 -40 -30 -48 L-26 -50 C-20 -42 -16 -34 -10 -26 Z" fill="${DR.l}"/>`;
		for (const [x, y] of [
			[-30, -60],
			[-22, -50],
			[-10, -36],
			[8, -34],
			[22, -28],
		])
			g += `<path d="M${x - 4} ${y + 2} L${x + 2} ${y - 8} L${x + 5} ${y + 3} Z" fill="${DR.horn}" ${o(2.4)}/>`;
		g += `<path d="M-38 -70 L-22 -84 L-30 -64 Z" fill="${DR.horn}" ${o(3.4)}/>`;
		g += `<path d="M-30 -62 C-36 -72 -52 -74 -62 -68 L-78 -62 C-82 -58 -80 -52 -74 -52 L-56 -50 C-46 -48 -34 -50 -28 -56 Z" fill="${DR.c}" ${o()}/>`;
		g += `<path d="M-76 -54 L-56 -52 L-50 -55" fill="none" ${o(2)}/><path d="M-72 -54 L-70 -50 L-68 -54 M-62 -53 L-60 -49 L-58 -53" fill="#fff" stroke="${INK}" stroke-width="1"/>`;
		g +=
			`<circle cx="-76" cy="-61" r="1.6" fill="${INK}"/>` +
			flame(-86, -60, 0.32, -110) +
			`<circle cx="-96" cy="-64" r="2" fill="#ffb030"/><circle cx="-100" cy="-58" r="1.4" fill="#ffb030"/>`;
		g +=
			eye(-52, -63, 5.4, "#ffe066", -0.6, true) +
			`<path d="M-60 -70 L-46 -67" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`;
		g +=
			limb("M4 10 L-2 28 L4 40", DR.c, 11) +
			`<path d="M-4 42 L-6 46 M2 43 L1 47 M8 42 L10 46" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`;
		g += limb("M-12 -8 L-24 2 L-30 -2", DR.c, 6);
		g += `<path d="M4 -28 L-6 -96 L18 -76 L36 -104 L46 -70 L70 -76 L58 -36 C40 -38 20 -34 4 -28 Z" fill="${DR.mem}" ${o()}/>`;
		g += `<path d="M6 -30 L-6 -96 M8 -32 L36 -104 M10 -32 L70 -76" fill="none" stroke="${DR.d}" stroke-width="3.4" stroke-linecap="round"/>`;
		g += `<path d="M-2 -86 L18 -76 L28 -88" fill="none" stroke="${lt(DR.mem, 0.3)}" stroke-width="2.4" stroke-linecap="round"/>`;
		g += shine("M-10 -28 C0 -32 12 -32 22 -26", "rgba(255,255,255,.4)");
		return g;
	}
	LGMon.add("drake", {
		art: () =>
			shadow(158, 224, 72) +
			T(150, 175, 1.15, drake()) +
			sparks([
				[44, 90, 1.8],
				[236, 160, 2],
			]),
		face: () => T(64, 70, 0.92, dragonHead(DR)),
	});

	const DM = {
		c: "#a8322e",
		d: "#6e1e22",
		l: "#d9604a",
		horn: "#3a3036",
		wing: "#4a2a34",
	};
	function demonHead() {
		let g = both(
			`<path d="M-24 -60 L-36 -64 L-26 -52 Z" fill="${DM.c}" ${o(3.4)}/>`,
		);
		g += `<path d="M0 -78 C15 -78 23 -67 23 -55 C23 -44 13 -35 0 -35 C-13 -35 -23 -44 -23 -55 C-23 -67 -15 -78 0 -78 Z" fill="${DM.c}" ${o()}/>`;
		g += `<path d="M-18 -68 C-8 -76 8 -76 18 -68 C8 -70 4 -66 0 -60 C-4 -66 -8 -70 -18 -68 Z" fill="${DM.d}"/>`;
		g += both(
			`<path d="M-15 -71 C-28 -88 -50 -84 -48 -63 C-46 -50 -34 -49 -33 -57 C-38 -58 -39 -65 -35 -69 C-31 -73 -24 -71 -19 -62 Z" fill="${DM.horn}" ${o()}/><path d="M-26 -79 L-24 -74 M-36 -80 L-33 -75 M-44 -74 L-40 -71" stroke="#6a5c62" stroke-width="2.2" stroke-linecap="round"/>`,
		);
		g += glowEye(-9, -57, 5, "#ffe066") + glowEye(9, -57, 5, "#ffe066");
		g += both(
			`<path d="M-18 -64 L-3 -59" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/>`,
		);
		g += `<path d="M-12 -45 Q0 -40 12 -45 Q0 -36 -12 -45 Z" fill="#4a0e10" ${o(2.2)}/><path d="M-9 -45 L-7 -40 L-5 -44 M5 -44 L7 -40 L9 -45" fill="#fff" stroke="${INK}" stroke-width="1"/>`;
		g += `<path d="M-6 -36 L0 -30 L6 -36 Z" fill="${DM.d}" ${o(2.4)}/>`;
		g += shine("M-14 -72 C-8 -76 -2 -77 3 -76", "rgba(255,255,255,.4)");
		return g;
	}
	function demon() {
		let g = both(
			`<path d="M-26 -40 L-84 -90 L-80 -64 L-104 -56 L-84 -40 L-98 -18 L-70 -22 L-62 2 L-30 -14 Z" fill="${DM.wing}" ${o()}/><path d="M-28 -36 L-84 -88 M-30 -30 L-102 -56 M-30 -24 L-96 -18" stroke="#2a1820" stroke-width="2.6" stroke-linecap="round"/>`,
		);
		g +=
			limb("M14 4 C40 20 52 6 48 -8", DM.d, 5) +
			`<path d="M42 -8 L50 -20 L56 -6 Z" fill="${DM.d}" ${o(3)}/>`;
		g += both(
			`<path d="M-18 4 L-26 22 L-18 38 L-14 38 L-12 22 L-4 6 Z" fill="${DM.c}" ${o()}/><path d="M-26 38 L-24 46 L-8 46 L-10 38 Z" fill="#2a2024" ${o()}/><path d="M-17 39 L-17 45" stroke="#6a5c62" stroke-width="2"/>`,
		);
		g += `<path d="M-20 0 L20 0 L22 14 L10 10 L0 18 L-10 10 L-22 14 Z" fill="#3a2a2a" ${o()}/>`;
		g += `<path d="M-34 -40 C-30 -54 30 -54 34 -40 L28 0 C20 8 -20 8 -28 0 Z" fill="${DM.c}" ${o()}/>`;
		g += `<path d="M-14 -36 C-8 -32 -2 -32 0 -30 C2 -32 8 -32 14 -36 M-12 -20 H-2 M2 -20 H12 M-10 -10 H-2 M2 -10 H10 M0 -30 V0" fill="none" stroke="${DM.d}" stroke-width="2.4" stroke-linecap="round"/>`;
		g +=
			crack("M-24 -30 L-20 -22 L-24 -14", 2.4) + crack("M22 -16 L18 -8", 2.4);
		g += both(
			`<circle cx="-34" cy="-38" r="12" fill="${DM.c}" ${o()}/>` +
				limb("M-38 -30 L-46 -6 L-42 12", DM.c, 12) +
				`<circle cx="-42" cy="16" r="9" fill="${DM.c}" ${o()}/><path d="M-47 13 L-41 13 M-47 18 L-41 18" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/>`,
		);
		g += both(
			`<path d="M-30 -44 C-34 -46 -38 -44 -40 -40" fill="none" stroke="${DM.l}" stroke-width="3" stroke-linecap="round"/>`,
		);
		g += demonHead();
		return g;
	}
	LGMon.add("demon", {
		art: () =>
			shadow(150, 224, 58) +
			T(150, 164, 1.3, demon()) +
			sparks([
				[44, 150, 2],
				[258, 140, 2.2],
				[150, 40, 1.8],
			]),
		face: () => T(64, 66 + 56 * 1.22, 1.22, demonHead()),
	});

	function elemHead() {
		let g = `<path d="M-18 -58 L-2 -66 L16 -60 L20 -40 L10 -26 L-12 -26 L-22 -40 Z" fill="#4a3a3a" ${o()}/>`;
		g += `<path d="M-14 -56 L-2 -62 L12 -58 L4 -52 L-10 -50 Z" fill="#6e5a56"/>`;
		g += glowEye(-9, -44, 4.6, "#fff3b0") + glowEye(9, -44, 4.6, "#fff3b0");
		g += `<path d="M-8 -32 Q0 -28 8 -32" fill="none" stroke="#ffe066" stroke-width="3" stroke-linecap="round"/>`;
		return g + crack("M-16 -54 L-10 -50", 2.2) + crack("M14 -56 L10 -50", 2.2);
	}
	function firelem(mode = "art") {
		let g = `<ellipse cx="0" cy="40" rx="44" ry="9" fill="#ff7a2a" opacity=".35"/>`;

		g += `<path d="M-30 4 C-26 22 -10 30 0 46 C2 34 14 24 30 4 Z" fill="#e8502a" ${o()}/><path d="M-20 6 C-16 18 -6 24 0 36 C2 26 10 18 20 6 Z" fill="#ff9a2a"/><path d="M-8 8 C-6 14 -2 18 0 24 C2 18 6 14 8 8 Z" fill="#ffe066"/>`;
		g += `<path d="M-26 14 C-10 20 14 16 26 10 M-18 26 C-6 30 8 28 16 22 M-8 36 C-2 38 4 37 8 34" fill="none" stroke="#ffe066" stroke-width="2.6" stroke-linecap="round"/>`;
		g += flame(-22, 6, 0.7, -30) + flame(22, 6, 0.7, 30);

		for (const sx of [-1, 1]) {
			const d = `M${sx * 28} -26 L${sx * 48} -10 L${sx * 54} 10`;
			g +=
				limb(d, "#ff7a2a", 13) +
				`<path d="${d}" fill="none" stroke="#ffd35a" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
			g += flame(sx * 40, -16, 0.55, sx * 70) + flame(sx * 54, 12, 1.0, 0);
			g +=
				`<circle cx="${sx * 54}" cy="12" r="8" fill="#4a3a3a" ${o(3.4)}/>` +
				crack(`M${sx * 51} 9 L${sx * 56} 14`, 2);
		}

		g += `<path d="M-36 -30 C-22 -40 22 -40 36 -30 L26 4 C14 12 -14 12 -26 4 Z" fill="#e8502a" ${o()}/>`;
		g += `<path d="M-26 -28 C-14 -34 14 -34 26 -28 L18 0 C10 6 -10 6 -18 0 Z" fill="#ff9a2a"/><path d="M-12 -20 C-6 -24 6 -24 12 -20 L8 -2 C4 2 -4 2 -8 -2 Z" fill="#ffe066"/>`;
		g += `<path d="M-12 -14 L0 -22 L12 -14 L8 2 L-8 2 Z" fill="#4a3a3a" ${o(3.4)}/><path d="M-5 -12 L0 -16 L5 -12 L3 -4 L-3 -4 Z" fill="#ffe066"/>`;

		g += both(
			`<path d="M-42 -34 L-30 -42 L-18 -36 L-22 -24 L-38 -22 Z" fill="#4a3a3a" ${o()}/><path d="M-38 -32 L-30 -38 L-22 -34" fill="none" stroke="#6e5a56" stroke-width="2.6" stroke-linecap="round"/>` +
				crack("M-34 -30 L-28 -26", 2),
		);
		g += flame(-30, -38, 0.6, -20) + flame(30, -38, 0.6, 20);

		g += T(
			0,
			6,
			1,
			flame(-16, -50, 0.8, -28) +
				flame(16, -50, 0.8, 28) +
				flame(0, -58, 0.95) +
				elemHead(),
		);
		if (mode === "art") {
			g +=
				`<path d="M-70 -50 L-60 -58 L-52 -50 L-58 -40 Z" fill="#4a3a3a" ${o(3.4)}/>` +
				crack("M-62 -52 L-58 -46", 1.8);
			g +=
				`<path d="M58 -66 L70 -70 L74 -58 L62 -54 Z" fill="#4a3a3a" ${o(3.4)}/>` +
				crack("M64 -66 L68 -60", 1.8);
			g += `<path d="M60 6 L70 0 L76 10 L66 14 Z" fill="#4a3a3a" ${o(3.4)}/>`;
		}
		return g;
	}
	LGMon.add("firelem", {
		art: () =>
			shadow(150, 222, 64) +
			T(150, 168, 1.2, firelem()) +
			sparks([
				[86, 64, 2.6],
				[218, 50, 2.2],
				[236, 120, 2],
				[72, 128, 1.8],
				[150, 26, 2],
			]),
		face: () =>
			flame(64, 102, 2.0) +
			flame(36, 92, 0.9, -48) +
			flame(92, 92, 0.9, 48) +
			T(
				64,
				112,
				1.15,
				flame(-15, -50, 0.6, -30) + flame(15, -50, 0.6, 30) + elemHead(),
			),
	});

	const FG = {
		c: "#4a4550",
		d: "#2e2a33",
		l: "#77707e",
		gold: "#d9902a",
		cape: "#9a2a24",
	};
	function guardHelm() {
		let g =
			flame(0, -76, 0.9) + flame(-7, -74, 0.55, -24) + flame(7, -74, 0.55, 24);
		g += `<path d="M-20 -54 C-20 -72 20 -72 20 -54 L18 -36 C10 -30 -10 -30 -18 -36 Z" fill="${FG.c}" ${o()}/>`;
		g += `<path d="M0 -72 V-36" stroke="${FG.gold}" stroke-width="4"/><path d="M-20 -54 L20 -54" stroke="${FG.gold}" stroke-width="3"/>`;
		g += `<path d="M-14 -50 H14 L12 -44 H2 V-36 H-2 V-44 H-12 Z" fill="${INK}"/>`;
		g += `<path d="M-12 -48 H12 M0 -44 V-37" stroke="#ff9a2a" stroke-width="3" stroke-linecap="round"/><path d="M-10 -48 H10" stroke="#ffe066" stroke-width="1.2" stroke-linecap="round"/>`;
		g += shine("M-14 -62 C-10 -67 -4 -69 0 -69", "rgba(255,255,255,.4)");
		return g;
	}
	function guard() {
		let g = `<path d="M-22 -32 L22 -32 L34 34 L22 28 L14 36 L4 28 L-6 36 L-16 28 L-30 34 Z" fill="${FG.cape}" ${o()}/>`;
		g += both(
			`<path d="M-16 6 L-18 36 L-6 36 L-4 6 Z" fill="${FG.c}" ${o()}/><path d="M-20 36 L-20 44 L-2 44 L-4 36 Z" fill="${FG.d}" ${o()}/><path d="M-17 20 L-5 20" stroke="${FG.gold}" stroke-width="3"/>`,
		);
		g += `<path d="M-22 -34 C-14 -40 14 -40 22 -34 L18 4 C10 10 -10 10 -18 4 Z" fill="${FG.c}" ${o()}/>`;
		g += `<path d="M-14 -30 C-6 -34 6 -34 14 -30 L12 -10 C4 -6 -4 -6 -12 -10 Z" fill="${FG.l}"/><path d="M-6 -24 L0 -16 L6 -24" fill="none" stroke="${FG.gold}" stroke-width="3" stroke-linecap="round"/>`;
		g += `<path d="M-19 0 H19" stroke="${FG.gold}" stroke-width="4"/>`;
		g += guardHelm();
		g += limb("M22 -28 L32 -8 L36 -2", FG.c, 10);
		g += `<path d="M34 4 L44 -62" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="M34 4 L44 -62" stroke="#c9c2cc" stroke-width="5" stroke-linecap="round"/>`;
		for (const [y, s] of [
			[-14, 0.5],
			[-30, 0.6],
			[-46, 0.55],
			[-60, 0.45],
		])
			g += flame(38 + -y * 0.15 + 4, y + 4, s, 8);
		g += `<path d="M28 -2 L44 0" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><path d="M28 -2 L44 0" stroke="${FG.gold}" stroke-width="4" stroke-linecap="round"/><circle cx="35" cy="-2" r="5" fill="${FG.c}" ${o(3)}/>`;
		g += both(
			`<path d="M-34 -40 C-28 -46 -16 -44 -14 -34 L-18 -24 C-26 -22 -34 -28 -34 -40 Z" fill="${FG.l}" ${o()}/><path d="M-30 -34 C-26 -30 -20 -28 -17 -29" fill="none" stroke="${FG.gold}" stroke-width="2.6"/>`,
		);
		g += limb("M-24 -28 L-36 -10", FG.c, 10);
		g += `<path d="M-56 -30 C-44 -36 -28 -36 -20 -30 L-22 2 C-26 18 -38 26 -38 26 C-38 26 -52 18 -56 2 Z" fill="${FG.d}" ${o()}/>`;
		g += `<path d="M-51 -26 C-42 -30 -32 -30 -25 -26 L-27 0 C-30 12 -38 19 -38 19 C-38 19 -48 12 -50 0 Z" fill="none" stroke="${FG.gold}" stroke-width="3"/>`;
		g += flame(-38, 8, 0.62);
		return g;
	}
	LGMon.add("flameguard", {
		art: () =>
			shadow(150, 224, 52) +
			T(152, 168, 1.28, guard()) +
			sparks([
				[226, 46, 2.2],
				[98, 56, 1.8],
			]),
		face: () => T(64, 66 + 54 * 1.3, 1.3, guardHelm()),
	});

	const AD = { c: "#5e565a", d: "#3d3639", l: "#b5a69a", horn: "#e6d8c0" };
	function ashdragon() {
		let g =
			smoke("M-60 -96 C-66 -106 -58 -114 -64 -124") +
			smoke("M70 -90 C76 -100 68 -108 74 -118");
		g += both(
			`<path d="M-26 -36 L-128 -92 L-116 -62 L-142 -48 L-112 -34 L-130 -6 L-92 -10 L-84 18 L-40 0 Z" fill="#4a4246" ${o()}/><path d="M-30 -30 L-126 -88 M-32 -24 L-138 -48 M-34 -16 L-126 -8 M-36 -8 L-86 14" stroke="${AD.d}" stroke-width="3" stroke-linecap="round"/><path d="M-60 -50 L-70 -42 M-90 -40 L-100 -30" stroke="#ff7a2a" stroke-width="2" stroke-linecap="round"/>`,
		);
		g +=
			limb("M30 34 C60 44 74 30 66 16", AD.c, 9) +
			`<path d="M60 16 L70 2 L76 18 Z" fill="${AD.d}" ${o(3)}/>`;
		g += both(
			`<path d="M-30 6 C-52 8 -58 32 -44 46 L-20 46 Z" fill="${AD.c}" ${o()}/><path d="M-48 46 L-50 50 M-40 47 L-41 51 M-32 47 L-32 51" stroke="${AD.horn}" stroke-width="3" stroke-linecap="round"/>`,
		);
		g += `<path d="M-38 44 C-48 4 -34 -40 0 -44 C34 -40 48 4 38 44 Z" fill="${AD.c}" ${o()}/>`;
		g += `<path d="M-20 42 C-26 10 -18 -24 0 -28 C18 -24 26 10 20 42 Z" fill="${AD.l}"/>`;
		g += [-16, -6, 4, 14, 24, 34]
			.map(
				(y) =>
					`<path d="M${-17 - (y + 28) * 0.03} ${y} H${17 + (y + 28) * 0.03}" stroke="${dk(AD.l, 0.3)}" stroke-width="2"/>`,
			)
			.join("");
		g +=
			crack("M-6 -18 L2 -8 L-4 4 L4 16 L0 28", 3.6) +
			crack("M10 -14 L14 -4", 2.6) +
			`<circle cx="0" cy="4" r="5" fill="#ff9a2a" opacity=".6"/>`;
		g += `<path d="M24 -30 L32 -16 M28 -32 L36 -20" stroke="${AD.l}" stroke-width="2.4" stroke-linecap="round"/>`;
		g += both(
			limb("M-30 -20 L-36 6 L-26 34", AD.c, 11) +
				`<path d="M-34 38 L-34 44 M-26 39 L-26 45 M-18 38 L-17 44" stroke="${AD.horn}" stroke-width="3" stroke-linecap="round"/>`,
		);
		g += T(0, -70, 1.0, dragonHead(AD, true));
		return g;
	}
	LGMon.add("ashdragon", {
		art: () =>
			shadow(150, 222, 90) +
			T(150, 172, 0.98, ashdragon()) +
			sparks([
				[30, 160, 2.2],
				[270, 150, 2],
				[150, 30, 1.8],
				[52, 70, 1.6],
				[250, 60, 1.8],
			]),
		face: () => T(64, 74, 0.9, dragonHead(AD, true, true)),
	});
})();

(() => {
	const { INK, SW, o, eye, glowEye, shadow, shine, dk, lt } = LGMon;
	const T = (x, y, s, g, r = 0) =>
		`<g transform="translate(${x},${y})${r ? ` rotate(${r})` : ""} scale(${s})">${g}</g>`;
	const MIR = (g) => `<g transform="scale(-1,1)">${g}</g>`;
	const both = (g) => g + MIR(g);
	const limb = (d, c, w = 8) =>
		`<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + SW * 2}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
	const GLOW = "#b8ff5a";
	const G = { c: "#8fb83a", d: "#5f8a2a", l: "#c8e070" };
	const P = { c: "#6a3f7a", d: "#43264f", l: "#9a6aaa" };

	const spores = (pts) =>
		pts
			.map(
				([x, y, r]) =>
					`<circle cx="${x}" cy="${y}" r="${r}" fill="#d8e86a" stroke="${G.d}" stroke-width="1.2"/>`,
			)
			.join("");

	const pus = (x, y, r) =>
		`<circle cx="${x}" cy="${y}" r="${r}" fill="#d8d86a" stroke="${INK}" stroke-width="${Math.max(1.4, r * 0.4)}"/><circle cx="${x - r * 0.3}" cy="${y - r * 0.3}" r="${r * 0.3}" fill="#fff"/>`;
	const stitch = (d) =>
		`<path d="${d}" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`;
	const goo = (x, y, rx) =>
		`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${rx * 0.24}" fill="${G.d}" ${o(3)}/><ellipse cx="${x - rx * 0.2}" cy="${y - rx * 0.05}" rx="${rx * 0.4}" ry="${rx * 0.08}" fill="${G.l}"/>`;

	function slime() {
		let g = `<path d="M-42 20 C-46 0 -32 -30 0 -32 C30 -30 46 0 42 20 C34 27 -34 27 -42 20 Z" fill="${G.c}" ${o()}/>`;
		g += `<path d="M-40 14 C-30 22 30 22 40 14 C38 22 30 25 0 25 C-30 25 -38 22 -40 14 Z" fill="${G.d}"/>`;
		g += `<path d="M10 8 L24 0" stroke="#e8dcc0" stroke-width="4" stroke-linecap="round" opacity=".8"/><circle cx="9" cy="10" r="3" fill="#e8dcc0" opacity=".8"/><circle cx="8" cy="5" r="3" fill="#e8dcc0" opacity=".8"/><circle cx="25" cy="3" r="3" fill="#e8dcc0" opacity=".8"/><circle cx="23" cy="-2" r="3" fill="#e8dcc0" opacity=".8"/>`;
		g += `<path d="M-30 -2 C-26 -10 -18 -10 -16 -4 C-20 2 -28 4 -30 -2 Z" fill="${P.l}" opacity=".8"/><circle cx="28" cy="-12" r="4" fill="${P.l}" opacity=".8"/>`;
		g += `<circle cx="-24" cy="10" r="3" fill="none" stroke="${G.l}" stroke-width="1.8"/><circle cx="30" cy="12" r="2.2" fill="none" stroke="${G.l}" stroke-width="1.6"/><circle cx="-6" cy="-24" r="2.4" fill="none" stroke="${G.l}" stroke-width="1.6"/>`;
		g += eye(-12, -10, 8, "#f2e86a") + eye(12, -8, 6, "#f2e86a", -0.6);
		g += `<path d="M-12 6 Q0 12 10 5 Q2 16 -12 6 Z" fill="#3a4a1a" ${o(2.2)}/><path d="M4 10 C5 16 3 20 5 24" fill="none" stroke="${G.l}" stroke-width="3" stroke-linecap="round"/>`;
		g +=
			shine("M-28 -16 C-22 -24 -14 -28 -6 -29", "rgba(255,255,255,.55)", 3.6) +
			`<circle cx="-32" cy="-6" r="2" fill="#fff" opacity=".6"/>`;
		return g;
	}
	LGMon.add("rotslime", {
		art: () =>
			goo(150, 214, 62) +
			T(150, 186, 1.45, slime()) +
			`<circle cx="96" cy="150" r="5" fill="none" stroke="${G.d}" stroke-width="2.4"/><circle cx="206" cy="134" r="3.6" fill="none" stroke="${G.d}" stroke-width="2"/><circle cx="214" cy="160" r="2.4" fill="${G.c}" ${o(1.6)}/>`,
		face: () => T(64, 70, 1.0, slime()),
	});

	const FLY = { c: "#3a4a3e", d: "#26302a", l: "#5f7a5a", eye: "#c8343a" };
	function fly(legs = true) {
		let g = both(
			`<path d="M-8 -10 C-30 -40 -60 -40 -62 -24 C-62 -10 -36 -4 -10 -2 Z" fill="rgba(210,230,235,.7)" ${o(3.4)}/><path d="M-12 -6 L-56 -26 M-24 -6 L-46 -34 M-34 -6 L-58 -16" stroke="rgba(43,29,24,.45)" stroke-width="1.6" stroke-linecap="round"/>`,
		);
		if (legs)
			g += both(
				limb("M-12 16 L-24 30 L-22 40", FLY.d, 2.6) +
					limb("M-8 20 L-14 34 L-10 44", FLY.d, 2.6) +
					limb("M-14 10 L-30 18 L-34 28", FLY.d, 2.6),
			);
		g += `<path d="M0 6 C18 6 24 22 22 34 C20 46 10 52 0 52 C-10 52 -20 46 -22 34 C-24 22 -18 6 0 6 Z" fill="${FLY.c}" ${o()}/>`;
		g += `<path d="M-20 26 C-10 30 10 30 20 26 M-21 38 C-10 42 10 42 21 38" fill="none" stroke="${FLY.d}" stroke-width="3" stroke-linecap="round"/><path d="M-12 14 C-14 22 -14 30 -12 40" fill="none" stroke="${G.c}" stroke-width="2.6" stroke-linecap="round" opacity=".7"/>`;
		g += `<path d="M-20 -6 C-20 -18 20 -18 20 -6 C20 6 12 12 0 12 C-12 12 -20 6 -20 -6 Z" fill="${FLY.l}" ${o()}/>`;
		g += both(
			`<path d="M-8 -16 L-6 -22 M-14 -12 L-15 -18" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/>`,
		);
		g += both(
			`<ellipse cx="-17" cy="-28" rx="15" ry="16" fill="${FLY.eye}" ${o()}/><path d="M-27 -32 h5 M-24 -24 h5 M-16 -36 h5 M-14 -28 h5 M-20 -18 h5" stroke="#8a1e24" stroke-width="2.2" stroke-linecap="round"/><ellipse cx="-22" cy="-35" rx="4.4" ry="3.2" fill="#fff" opacity=".85"/><circle cx="-13" cy="-24" r="1.6" fill="#fff" opacity=".8"/>`,
		);
		g += `<path d="M0 -36 C8 -36 10 -26 6 -18 L-6 -18 C-10 -26 -8 -36 0 -36 Z" fill="${FLY.c}" ${o(3.4)}/>`;
		g += `<path d="M-2 -18 L-3 -8 Q0 -4 3 -8 L2 -18 Z" fill="${FLY.d}" ${o(2.6)}/>`;
		g += both(
			`<path d="M-3 -36 L-6 -46" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`,
		);
		g += shine("M-12 12 C-8 9 -4 8 0 8", "rgba(255,255,255,.35)");
		return g;
	}
	LGMon.add("corpsefly", {
		art: () =>
			shadow(150, 222, 34) +
			T(150, 132, 1.5, fly()) +
			`<path d="M74 130 q6 -6 12 0 t12 0 M206 108 q6 -6 12 0 t12 0" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round" opacity=".4"/>`,
		face: () => T(64, 74, 0.95, fly(false)),
	});

	const CU = { c: "#5a3a6a", d: "#3a2346", l: "#7e5a8e", skin: "#cfc4a8" };
	function cultHood() {
		let g = `<path d="M0 -76 C22 -76 32 -56 30 -36 C28 -26 22 -22 14 -22 L-14 -22 C-22 -22 -28 -26 -30 -36 C-32 -56 -22 -76 0 -76 Z" fill="${CU.c}" ${o()}/>`;
		g += `<path d="M0 -76 C10 -70 14 -60 12 -50" fill="none" stroke="${CU.d}" stroke-width="3" stroke-linecap="round"/>`;
		g += `<path d="M-18 -26 C-22 -40 -14 -56 0 -56 C14 -56 22 -40 18 -26 C12 -22 -12 -22 -18 -26 Z" fill="#1e1424" ${o(3)}/>`;
		g += glowEye(-7, -40, 4.2, GLOW) + glowEye(7, -40, 4.2, GLOW);
		g += shine("M-18 -60 C-12 -68 -6 -72 0 -73", "rgba(255,255,255,.3)");
		return g;
	}
	function cultist() {
		let g = `<path d="M-14 -28 C-30 -10 -34 20 -32 38 L32 38 C34 20 30 -10 14 -28 Z" fill="${CU.c}" ${o()}/>`;
		g += `<path d="M-30 30 L-24 38 M-16 32 L-14 38 M0 33 V38 M14 32 L16 38" stroke="${CU.d}" stroke-width="2.4" stroke-linecap="round"/>`;
		g += `<path d="M-26 6 C-10 12 10 12 26 6" fill="none" stroke="#b8945a" stroke-width="4" stroke-linecap="round"/><path d="M-26 6 C-10 12 10 12 26 6" fill="none" stroke="${INK}" stroke-width="1.4" stroke-dasharray="3 4"/>`;
		g += `<path d="M10 10 L8 24 M12 10 L16 22" stroke="#b8945a" stroke-width="3" stroke-linecap="round"/>`;
		g += cultHood();
		g += limb("M-18 -16 L-10 10", CU.l, 9) + limb("M18 -16 L10 10", CU.l, 9);
		g += `<rect x="-6" y="-8" width="12" height="20" rx="3" fill="#e8e0b8" ${o(3)}/><path d="M-3 -3 V6" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/>`;
		g += `<path d="M0 -8 C-6 -13 -2 -20 0 -23 C2 -20 6 -13 0 -8 Z" fill="${GLOW}" ${o(2)}/>`;
		g += `<circle cx="-8" cy="10" r="5" fill="${CU.skin}" ${o(2.6)}/><circle cx="8" cy="10" r="5" fill="${CU.skin}" ${o(2.6)}/>`;
		return g;
	}
	LGMon.add("cultist", {
		art: () =>
			shadow(150, 222, 40) +
			T(150, 168, 1.4, cultist()) +
			`<circle cx="150" cy="100" r="26" fill="${GLOW}" opacity=".12"/>`,
		face: () => T(64, 66 + 48 * 1.25, 1.25, cultHood()),
	});

	const BW = {
		c: "#7a876a",
		d: "#4f5a44",
		l: "#a7b292",
		rib: "#e6dcc0",
		raw: "#7a3a4a",
	};
	function bwolf() {
		let g = `<path d="M44 -10 C60 -16 70 -30 78 -26 C72 -16 64 -4 46 2 Z" fill="${BW.d}" ${o()}/>`;
		g +=
			limb("M34 8 L42 24 L38 40", BW.d, 8) +
			limb("M-24 8 L-30 24 L-28 40", BW.d, 8);
		g += `<path d="M-40 -12 C-30 -28 20 -30 42 -18 C52 -12 54 4 46 12 C30 18 -18 18 -34 10 C-42 4 -46 -6 -40 -12 Z" fill="${BW.c}" ${o()}/>`;
		g += `<path d="M-30 8 C-10 14 20 14 40 8 C20 16 -10 16 -30 8 Z" fill="${BW.d}"/>`;
		g += `<path d="M-6 -16 C2 -20 16 -20 22 -14 C24 -4 20 6 12 8 C2 8 -6 4 -8 -4 Z" fill="${BW.raw}" ${o(3)}/><path d="M-4 -12 C2 -10 8 -10 14 -14 M-4 -4 C4 -2 12 -2 18 -6 M0 4 C6 5 12 4 16 0" fill="none" stroke="${BW.rib}" stroke-width="3" stroke-linecap="round"/>`;
		g += pus(30, -8, 3.6) + pus(-24, -4, 3) + pus(36, 4, 2.4);
		g += `<path d="M10 -30 C10 -38 24 -40 26 -32 Z" fill="${P.l}" ${o(2.6)}/><path d="M18 -32 V-24" stroke="#e8dcc0" stroke-width="3"/><path d="M28 -28 C28 -34 38 -34 38 -28 Z" fill="${P.l}" ${o(2.4)}/><path d="M33 -28 V-22" stroke="#e8dcc0" stroke-width="2.4"/>`;
		g += `<path d="M-40 -8 C-46 -22 -46 -34 -42 -44 L-28 -38 C-28 -28 -26 -18 -22 -12 Z" fill="${BW.c}" ${o()}/>`;
		g += `<path d="M-48 -54 L-42 -72 L-34 -50 Z" fill="${BW.c}" ${o()}/><path d="M-42 -72 L-40 -64 L-44 -62" fill="none" stroke="${INK}" stroke-width="2"/>`;
		g += `<path d="M-36 -48 C-46 -58 -62 -56 -70 -48 L-88 -44 C-94 -40 -92 -32 -86 -31 L-82 -24 L-68 -26 C-56 -22 -42 -26 -36 -34 Z" fill="${BW.c}" ${o()}/>`;
		g += `<path d="M-86 -31 L-68 -30 L-64 -27 L-80 -24 Z" fill="#5a1e2a" ${o(2)}/><path d="M-84 -31 L-83 -27 L-81 -31 M-76 -30 L-75 -26 L-73 -30" fill="#fff" stroke="${INK}" stroke-width="1"/><path d="M-78 -24 C-78 -20 -80 -16 -78 -12" fill="none" stroke="${G.l}" stroke-width="2.6" stroke-linecap="round"/>`;
		g += `<ellipse cx="-90" cy="-41" rx="3.4" ry="2.6" fill="${INK}"/>`;
		g +=
			glowEye(-62, -44, 4.4, GLOW) +
			`<path d="M-70 -50 L-55 -47" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`;
		g +=
			limb("M-38 8 L-44 26 L-46 40", BW.c, 8) +
			limb("M26 10 L30 26 L24 40", BW.c, 8);
		g += shine("M-28 -22 C-10 -27 6 -27 20 -24", "rgba(255,255,255,.3)");
		return g;
	}
	function bwolfFace() {
		let g = `<path d="M-14 -22 L-30 -52 L-4 -28 Z" fill="${BW.c}" ${o()}/><path d="M-15 -27 L-25 -45 L-8 -29 Z" fill="${BW.raw}"/>`;
		g += `<path d="M14 -22 L24 -44 L30 -40 L28 -50 L4 -28 Z" fill="${BW.c}" ${o()}/>`;
		g += `<path d="M0 -30 C17 -30 28 -20 28 -6 L32 0 L26 4 L20 16 C13 26 6 31 0 31 C-6 31 -13 26 -20 16 L-26 4 L-32 0 L-28 -6 C-28 -20 -17 -30 0 -30 Z" fill="${BW.c}" ${o()}/>`;
		g += `<path d="M-22 -16 C-12 -28 12 -28 22 -16 C14 -20 6 -18 3 -11 L0 -4 L-3 -11 C-6 -18 -14 -20 -22 -16 Z" fill="${BW.d}"/>`;
		g += `<path d="M-10 2 C-10 -4 10 -4 10 2 L8 19 C5 25 -5 25 -8 19 Z" fill="${BW.l}"/>`;
		g += glowEye(-12, -7, 5.6, GLOW) + glowEye(12, -7, 5.6, GLOW);
		g += both(
			`<path d="M-21 -17 L-6 -11" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,
		);
		g += `<path d="M-6 6 Q0 3 6 6 Q5 11 0 12 Q-5 11 -6 6 Z" fill="${INK}"/>`;
		g += `<path d="M-11 17 Q0 25 11 17 Q0 30 -11 17 Z" fill="#5a1e2a" ${o(2)}/><path d="M-8 18 L-6.5 23 L-5 18.6 M5 18.6 L6.5 23 L8 18" fill="#fff" stroke="${INK}" stroke-width="1"/><path d="M6 24 C6 28 5 30 6 33" fill="none" stroke="${G.l}" stroke-width="2.6" stroke-linecap="round"/>`;
		g += pus(20, 8, 3.4) + pus(-22, -2, 2.6);
		g += `<path d="M-30 -2 L-20 -4" stroke="#e8dcc0" stroke-width="2" stroke-linecap="round"/>`;
		return g;
	}
	LGMon.add("blightwolf", {
		art: () =>
			shadow(146, 224, 74) +
			T(152, 176, 1.2, bwolf()) +
			spores([
				[70, 80, 2.4],
				[236, 70, 2],
				[222, 110, 1.6],
			]),
		face: () => T(64, 72, 1.02, bwolfFace()),
	});

	const SP = {
		cap: "#8a4a9a",
		capd: "#5e2e6e",
		spot: "#e6d8a8",
		stem: "#e8dcc0",
		stemd: "#bfae8e",
	};
	function sporeCap(withFace = true) {
		let g = `<path d="M-30 6 C-34 26 -24 40 0 40 C24 40 34 26 30 6 Z" fill="${SP.stem}" ${o()}/>`;
		g += `<path d="M-26 8 C-28 22 -22 32 -12 36 C-20 28 -22 18 -20 8 Z" fill="${SP.stemd}"/>`;
		if (withFace) {
			g += eye(-11, 18, 6.6, "#9ad84a") + eye(11, 18, 6.6, "#9ad84a");
			g += `<path d="M-5 30 Q0 34 5 30" fill="none" ${o(2.2)}/><ellipse cx="-19" cy="27" rx="4" ry="2.4" fill="${SP.cap}" opacity=".4"/><ellipse cx="19" cy="27" rx="4" ry="2.4" fill="${SP.cap}" opacity=".4"/>`;
		}
		g += `<path d="M-48 8 C-50 -20 -26 -40 0 -40 C26 -40 50 -20 48 8 C40 14 24 10 16 12 C8 14 -8 14 -16 12 C-24 10 -40 14 -48 8 Z" fill="${SP.cap}" ${o()}/>`;
		g += `<path d="M-44 4 C-36 8 -24 6 -16 8 C-8 10 8 10 16 8 C24 6 36 8 44 4 C40 10 26 9 16 11 C6 13 -6 13 -16 11 C-26 9 -40 10 -44 4 Z" fill="${SP.capd}"/>`;
		g += [
			[-24, -18, 7],
			[4, -28, 6],
			[26, -12, 6.4],
			[-6, -8, 4.4],
			[-38, -2, 3.6],
			[38, 0, 3.4],
		]
			.map(
				([x, y, r]) =>
					`<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.8}" fill="${SP.spot}" ${o(2)}/>`,
			)
			.join("");
		g += shine(
			"M-36 -14 C-30 -26 -20 -33 -10 -36",
			"rgba(255,255,255,.45)",
			3.6,
		);
		return g;
	}
	function sporeling() {
		let g =
			limb("M-12 38 L-16 52", SP.stemd, 9) + limb("M12 38 L16 52", SP.stemd, 9);
		g += `<path d="M-24 54 L-8 54 M8 54 L24 54" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`;
		g +=
			limb("M-28 22 L-42 30 L-44 40", SP.stem, 6) +
			limb("M28 22 L40 16 L46 6", SP.stem, 6);
		g += sporeCap();
		return g;
	}
	const puff = (x, y, s) =>
		T(
			x,
			y,
			s,
			`<path d="M-12 4 C-16 -4 -8 -10 -2 -6 C0 -12 10 -12 10 -4 C16 -4 16 6 10 6 L-8 6 C-12 6 -14 5 -12 4 Z" fill="#d8e86a" ${o(2.4 / s)} opacity=".9"/>`,
		);
	LGMon.add("sporeling", {
		art: () =>
			shadow(150, 222, 46) +
			T(150, 140, 1.45, sporeling()) +
			puff(76, 80, 1.1) +
			puff(224, 64, 0.9) +
			spores([
				[90, 110, 2.6],
				[212, 100, 2.2],
				[236, 136, 1.8],
				[64, 140, 2],
			]),
		face: () => T(64, 62, 0.9, sporeCap()),
	});

	const TN = { c: "#7a4a9a", d: "#4f2a6a", l: "#a37ac0", suck: "#f0b8c8" };

	const TPTS = [
		[0, 40],
		[-6, 24],
		[-13, 8],
		[-12, -10],
		[-2, -26],
		[10, -40],
		[14, -56],
		[8, -70],
		[-2, -74],
		[-10, -68],
		[-9, -58],
		[-2, -56],
		[1, -61],
	];
	function tentLine() {
		const P = TPTS,
			out = [];
		for (let i = 0; i < P.length - 1; i++) {
			const p0 = P[Math.max(0, i - 1)],
				p1 = P[i],
				p2 = P[i + 1],
				p3 = P[Math.min(P.length - 1, i + 2)];
			for (let k = 0; k < 6; k++) {
				const t = k / 6,
					t2 = t * t,
					t3 = t2 * t;
				out.push(
					[0, 1].map(
						(j) =>
							0.5 *
							(2 * p1[j] +
								(-p0[j] + p2[j]) * t +
								(2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 +
								(-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3),
					),
				);
			}
		}
		out.push(P[P.length - 1]);
		return out.map((p, i, a) => {
			const q = a[Math.min(a.length - 1, i + 1)],
				r = a[Math.max(0, i - 1)];
			const dx = q[0] - r[0],
				dy = q[1] - r[1],
				L = Math.hypot(dx, dy) || 1,
				f = i / (a.length - 1);
			return {
				x: p[0],
				y: p[1],
				nx: -dy / L,
				ny: dx / L,
				w: 15 * (1 - f) + 1.6 * f,
				f,
			};
		});
	}
	function tentacle(withHole = true) {
		const C = tentLine(),
			f1 = (v) => v.toFixed(1);
		const side = (k) =>
			C.map((c) => `${f1(c.x + c.nx * c.w * k)} ${f1(c.y + c.ny * c.w * k)}`);
		const body = `M${side(1).join(" L")} L${side(-1).reverse().join(" L")} Z`;
		let g = "";
		if (withHole)
			g += `<ellipse cx="0" cy="38" rx="34" ry="9" fill="#1e1424" ${o()}/><path d="M-34 38 L-44 34 M34 38 L46 42 M-18 46 L-24 53" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
		g += `<path d="${body}" fill="${TN.c}" ${o()}/>`;

		const dk1 = C.filter((c) => c.f < 0.7);
		g += `<path d="M${dk1.map((c) => `${f1(c.x - c.nx * c.w * 0.92)} ${f1(c.y - c.ny * c.w * 0.92)}`).join(" L")} L${dk1
			.slice()
			.reverse()
			.map(
				(c) => `${f1(c.x - c.nx * c.w * 0.35)} ${f1(c.y - c.ny * c.w * 0.35)}`,
			)
			.join(" L")} Z" fill="${TN.d}"/>`;

		for (let i = 2; i < C.length * 0.78; i += 4) {
			const c = C[i],
				r = Math.max(1.6, c.w * 0.34);
			g += `<ellipse cx="${f1(c.x + c.nx * c.w * 0.5)}" cy="${f1(c.y + c.ny * c.w * 0.5)}" rx="${f1(r)}" ry="${f1(r * 0.85)}" fill="${TN.suck}" stroke="${INK}" stroke-width="1.8"/><circle cx="${f1(c.x + c.nx * c.w * 0.5)}" cy="${f1(c.y + c.ny * c.w * 0.5)}" r="${f1(r * 0.38)}" fill="${dk(TN.suck, 0.35)}"/>`;
		}
		const sh = C.filter((c) => c.f > 0.25 && c.f < 0.55);
		g += shine(
			`M${sh.map((c) => `${f1(c.x - c.nx * c.w * 0.55)} ${f1(c.y - c.ny * c.w * 0.55)}`).join(" L")}`,
			"rgba(255,255,255,.4)",
		);
		g +=
			`<ellipse cx="-8" cy="-2" rx="9" ry="8.4" fill="${TN.d}"/>` +
			eye(-8, -2, 7, GLOW, 0, true);
		if (withHole)
			g += `<path d="M-34 38 C-20 47 20 47 34 38 C26 44 -26 44 -34 38 Z" fill="${G.d}" opacity=".9"/><path d="M-24 41 C-18 44 -12 45 -6 45" stroke="${G.l}" stroke-width="2.4" stroke-linecap="round"/>`;
		return g;
	}
	LGMon.add("tentacle", {
		art: () =>
			shadow(150, 220, 60) +
			T(150, 176, 1.4, tentacle()) +
			T(
				84,
				204,
				0.5,
				`<path d="M-14 30 C-16 10 -4 -6 4 -18 C8 -8 10 14 14 30 Z" fill="${TN.c}" ${o(SW / 0.5)}/>`,
			) +
			T(
				220,
				206,
				0.45,
				`<path d="M-14 30 C-16 10 4 -10 -2 -24 C10 -8 10 14 14 30 Z" fill="${TN.c}" ${o(SW / 0.45)}/>`,
			),
		face: () => T(64, 80, 0.88, tentacle(false)),
	});

	const AB = { c: "#c48a92", d: "#8f5a66", l: "#e6b8bc", patch: "#9aae6a" };
	function aboHead() {
		let g = `<path d="M-22 -60 C-20 -78 22 -78 24 -60 C26 -48 18 -40 0 -40 C-18 -40 -24 -48 -22 -60 Z" fill="${AB.c}" ${o()}/>`;
		g +=
			`<path d="M2 -76 C10 -76 20 -70 22 -60 L8 -58 Z" fill="${AB.patch}"/>` +
			stitch("M2 -77 L8 -58 M0 -72 L6 -73 M2 -66 L8 -67 M4 -61 L10 -62");
		g +=
			eye(-10, -60, 6.4, "#f2e86a") +
			eye(12, -64, 4.4, "#f2e86a", 0.5) +
			eye(-2, -70, 3.4, "#f2e86a");
		g += `<path d="M-14 -50 Q2 -42 16 -50 Q2 -38 -14 -50 Z" fill="#4a1a24" ${o(2)}/><path d="M-10 -49 L-8 -45 L-6 -48 M4 -47 L6 -43 L8 -47 M10 -49 L12 -46" fill="#fff" stroke="${INK}" stroke-width="1"/>`;
		return g;
	}
	function abomination() {
		let g = limb("M-22 10 L-26 36", AB.d, 14) + limb("M22 10 L26 36", AB.d, 14);
		g += `<path d="M-38 40 L-14 40 M14 40 L38 40" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>`;
		g += `<path d="M-44 -30 C-50 -60 -20 -66 0 -64 C24 -66 52 -58 48 -28 C54 0 40 22 0 22 C-40 22 -54 0 -44 -30 Z" fill="${AB.c}" ${o()}/>`;
		g += `<path d="M-40 4 C-30 18 30 18 42 4 C36 18 20 22 0 22 C-20 22 -36 18 -40 4 Z" fill="${AB.d}"/>`;
		g +=
			`<path d="M-30 -40 C-24 -46 -14 -46 -10 -38 C-14 -28 -26 -28 -30 -40 Z" fill="${AB.patch}"/>` +
			stitch(
				"M-30 -40 C-24 -46 -14 -46 -10 -38 M-26 -45 L-24 -40 M-19 -46 L-18 -41 M-13 -43 L-14 -38",
			);
		g +=
			`<path d="M0 -36 C4 -20 4 -4 -2 12" fill="none" stroke="${AB.d}" stroke-width="3"/>` +
			stitch("M-4 -30 L4 -28 M-3 -20 L5 -18 M-3 -10 L5 -8 M-5 0 L3 2");
		g += pus(26, -20, 4) + pus(32, -8, 3) + pus(-36, -10, 3.4);
		g += `<path d="M-46 -24 L-58 -10 L-60 6" fill="none" stroke="#7a7068" stroke-width="3" stroke-dasharray="4 3"/>`;
		g +=
			limb("M-40 -36 L-58 -16 L-56 4", AB.c, 9) +
			`<circle cx="-56" cy="8" r="6" fill="${AB.c}" ${o()}/>`;
		g += T(0, -8, 1, T(0, -58, 1.35, T(0, 58, 1, aboHead())));
		g += `<path d="M58 -64 L84 -40 L76 -32 L58 -46 Z" fill="#c9c2cc" ${o()}/><path d="M60 -60 L80 -42" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/><path d="M66 -46 L70 -50 M72 -42 L76 -46" stroke="#8a2a2a" stroke-width="2.4"/>`;
		g += `<path d="M58 -46 L48 -34" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M58 -46 L48 -34" stroke="#6b4a35" stroke-width="4" stroke-linecap="round"/>`;
		g += `<path d="M34 -50 C50 -62 66 -50 62 -30 C60 -18 48 -12 40 -18 Z" fill="${AB.c}" ${o()}/>`;
		g +=
			`<path d="M38 -22 C46 -14 58 -18 62 -28" fill="none" stroke="${AB.d}" stroke-width="3" stroke-linecap="round"/>` +
			stitch("M42 -52 L48 -38 M44 -50 L48 -52 M45 -45 L50 -47 M47 -40 L52 -42");
		g += `<circle cx="48" cy="-36" r="10" fill="${AB.c}" ${o()}/><path d="M42 -38 H54 M42 -33 H54" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/>`;
		g += shine("M-34 -50 C-26 -58 -14 -60 -6 -60", "rgba(255,255,255,.45)");
		return g;
	}
	LGMon.add("abomination", {
		art: () => shadow(150, 222, 70) + T(146, 178, 1.2, abomination()),
		face: () => T(64, 66 + 59 * 1.7, 1.7, aboHead()),
	});

	function watcher(tents = true) {
		let g = "";
		if (tents)
			for (const [x, c] of [
				[-22, "M-22 22 C-30 36 -18 44 -26 58"],
				[-8, "M-8 26 C-12 40 -2 48 -8 62"],
				[8, "M8 26 C12 40 2 46 10 60"],
				[22, "M22 22 C30 34 20 42 28 54"],
			])
				g += limb(c, P.c, 5);
		g += `<circle cx="0" cy="0" r="34" fill="#efe4d0" ${o()}/>`;
		g += `<path d="M-30 14 C-24 6 -20 10 -14 4 M28 16 C22 8 16 12 12 6 M-28 -16 C-22 -12 -18 -16 -14 -10 M30 -12 C24 -8 22 -12 16 -8" fill="none" stroke="#c84a4a" stroke-width="1.8" stroke-linecap="round"/>`;
		g += `<circle cx="2" cy="2" r="17" fill="#7ac04a" ${o(3)}/><circle cx="2" cy="2" r="11" fill="#4f8a2a"/><ellipse cx="2" cy="2" rx="4" ry="12" fill="${INK}"/>`;
		g += `<circle cx="-5" cy="-6" r="4.6" fill="#fff"/><circle cx="8" cy="9" r="2" fill="#fff"/>`;
		g += `<path d="M-38 -6 C-30 -36 30 -36 38 -6 C26 -20 -26 -20 -38 -6 Z" fill="${P.c}" ${o()}/><path d="M-26 -22 C-14 -28 0 -29 10 -27" fill="none" stroke="${P.l}" stroke-width="3" stroke-linecap="round"/>`;
		g += `<path d="M-36 8 C-24 34 24 34 36 8 C24 22 -24 22 -36 8 Z" fill="${P.c}" ${o()}/>`;
		g += both(
			`<path d="M-24 -18 L-28 -26 M-12 -21 L-14 -30" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`,
		);
		g += pus(-24, 20, 2.6) + pus(30, -18, 2.2);
		return g;
	}
	LGMon.add("watcher", {
		art: () =>
			shadow(150, 222, 38) +
			T(150, 116, 1.75, watcher()) +
			`<circle cx="150" cy="116" r="76" fill="none" stroke="${GLOW}" stroke-width="2" stroke-dasharray="2 10" opacity=".7"/>`,
		face: () => T(64, 66, 1.12, watcher(false)),
	});

	const PP = {
		c: "#36423a",
		d: "#222a25",
		l: "#56665a",
		mask: "#e0d6bc",
		maskd: "#b0a488",
	};
	function priestHead() {
		let g = `<path d="M-38 -70 C-30 -76 30 -76 38 -70 C32 -64 -32 -64 -38 -70 Z" fill="${PP.d}" ${o()}/>`;
		g += `<path d="M-16 -70 L-14 -96 C-6 -100 6 -100 14 -96 L16 -70 Z" fill="${PP.d}" ${o()}/><path d="M-15 -78 H15" stroke="#7a3a4a" stroke-width="4"/>`;
		g += `<path d="M-18 -66 C-20 -50 -14 -40 -2 -38 L-30 -14 C-24 -12 -10 -18 10 -36 C18 -44 20 -56 18 -66 Z" fill="${PP.mask}" ${o()}/>`;
		g += `<path d="M-6 -40 L-28 -16 M-10 -44 L-20 -32" stroke="${PP.maskd}" stroke-width="2.4" stroke-linecap="round"/><path d="M-14 -36 L-12 -32" stroke="${INK}" stroke-width="2"/>`;
		g += `<circle cx="-8" cy="-56" r="7" fill="${GLOW}" ${o(3.4)}/><circle cx="10" cy="-56" r="6" fill="${GLOW}" ${o(3.4)}/><circle cx="-10" cy="-58" r="2.2" fill="#fff"/><circle cx="8" cy="-58" r="2" fill="#fff"/>`;
		return g;
	}
	function priest() {
		let g = `<path d="M-22 -40 C-34 -10 -38 20 -36 40 L34 40 C36 20 32 -10 22 -40 Z" fill="${PP.c}" ${o()}/>`;
		g += `<path d="M-2 -36 L-6 40 M-30 30 L-24 40 M24 30 L20 40" stroke="${PP.d}" stroke-width="3" stroke-linecap="round"/>`;
		g += `<path d="M-24 -42 C-14 -48 14 -48 24 -42 L28 -26 C14 -30 -14 -30 -28 -26 Z" fill="${PP.l}" ${o()}/>`;
		g +=
			limb("M-44 -66 L-40 40", "#6b4a35", 4) +
			`<path d="M-50 -76 L-38 -76 L-44 -62 Z" fill="${PP.mask}" ${o(3)}/>`;
		g += limb("M-24 -30 L-40 -10", PP.c, 9);
		g += priestHead();
		g += limb("M22 -30 L34 -12 L38 -14", PP.c, 9);
		g += `<path d="M40 -14 L44 12" stroke="#8a8078" stroke-width="2.4" stroke-dasharray="3 2"/>`;
		g += `<path d="M34 14 C34 8 54 8 54 14 L52 24 C48 28 40 28 36 24 Z" fill="#8a7a5a" ${o()}/><path d="M38 18 H50" stroke="${INK}" stroke-width="1.8"/><circle cx="44" cy="20" r="2.4" fill="${GLOW}"/>`;
		g += `<path d="M48 10 C58 2 50 -10 60 -18 C66 -24 60 -34 68 -40" fill="none" stroke="${G.c}" stroke-width="6" stroke-linecap="round" opacity=".6"/><circle cx="66" cy="-46" r="5" fill="${G.c}" opacity=".5"/>`;
		return g;
	}
	LGMon.add("plaguepriest", {
		art: () =>
			shadow(146, 222, 50) +
			T(144, 172, 1.25, priest()) +
			spores([
				[236, 80, 2.2],
				[254, 110, 1.8],
			]),
		face: () => T(70, 113, 0.95, priestHead()),
	});

	const TR = {
		c: "#6a5a48",
		d: "#463a2e",
		l: "#8e7c66",
		rot: "#7a4a8a",
		moss: "#7a9a3a",
	};
	function treeFace() {
		let g = `<path d="M-30 -40 C-28 -54 -10 -60 0 -58 C14 -60 30 -52 30 -40 L28 10 L-28 10 Z" fill="${TR.c}" ${o()}/>`;
		g += `<path d="M-22 -44 C-20 -30 -24 -10 -20 6 M16 -48 C20 -30 14 -12 20 6 M-6 -54 C-4 -44 -8 -36 -6 -30" fill="none" stroke="${TR.d}" stroke-width="3" stroke-linecap="round"/>`;
		g += `<path d="M-26 -10 C-20 -16 -10 -14 -8 -6 C-14 0 -24 0 -26 -10 Z" fill="${TR.rot}" opacity=".85"/>`;
		g += `<path d="M-20 -36 C-14 -42 -4 -40 -4 -32 C-8 -26 -18 -26 -20 -36 Z M20 -36 C14 -42 4 -40 4 -32 C8 -26 18 -26 20 -36 Z" fill="#1e1612" ${o(3)}/>`;
		g += glowEye(-12, -33, 4.4, GLOW) + glowEye(12, -33, 4.4, GLOW);
		g += `<path d="M-22 -44 L-4 -38 M22 -44 L4 -38" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`;
		g += `<path d="M-14 -16 C-6 -22 8 -20 14 -14 C8 -6 6 0 0 -2 C-6 0 -8 -6 -14 -16 Z" fill="#1e1612" ${o(3)}/><path d="M-10 -15 L-8 -10 L-5 -16 M4 -16 L6 -10 L9 -14" fill="none" stroke="${TR.l}" stroke-width="2" stroke-linecap="round"/>`;
		g += `<path d="M18 -10 C18 -16 32 -16 32 -10 Z" fill="${SP.cap}" ${o(2.4)}/><path d="M20 -2 C20 -8 32 -8 32 -2 Z" fill="${SP.cap}" ${o(2.4)}/>`;
		return g;
	}
	function blighttree() {
		let g = "";
		g +=
			limb("M-20 -44 C-40 -60 -50 -80 -44 -100", TR.c, 12) +
			limb("M-42 -78 L-62 -86", TR.c, 6) +
			limb("M-46 -96 L-56 -110", TR.c, 5) +
			limb("M-44 -100 L-36 -114", TR.c, 4);
		g +=
			limb("M20 -46 C40 -56 56 -70 60 -92", TR.c, 12) +
			limb("M50 -66 L72 -66", TR.c, 6) +
			limb("M60 -92 L72 -104", TR.c, 5) +
			limb("M60 -92 L54 -108", TR.c, 4);
		g += limb("M-4 -56 L-6 -86 L4 -98", TR.c, 8);
		g += `<path d="M-60 -86 C-60 -76 -58 -70 -60 -62 M70 -66 C70 -58 72 -52 70 -46 M-34 -82 C-34 -74 -32 -70 -34 -64" fill="none" stroke="${TR.moss}" stroke-width="3.4" stroke-linecap="round"/>`;
		g +=
			limb("M-24 6 C-40 14 -48 28 -60 36", TR.d, 10) +
			limb("M24 6 C40 14 50 26 62 34", TR.d, 10) +
			limb("M-8 10 L-14 38", TR.d, 10) +
			limb("M8 10 L16 38", TR.d, 10);
		g += `<path d="M-34 -40 C-30 -60 -8 -66 0 -62 C10 -66 32 -60 34 -40 L32 14 C20 20 -20 20 -32 14 Z" fill="${TR.c}" ${o()}/>`;
		g += T(0, 4, 1, treeFace().replace(/<path d="M-30 -40[^>]*>/, ""));
		g += `<path d="M-30 4 C-18 10 18 10 30 4 L32 14 C20 20 -20 20 -32 14 Z" fill="${TR.d}"/>`;
		g += `<path d="M-30 -20 C-28 -6 -26 2 -28 10" fill="none" stroke="${TR.moss}" stroke-width="4" stroke-linecap="round"/>`;
		g += `<path d="M-38 -40 C-40 -48 -24 -50 -24 -42 Z" fill="${SP.cap}" ${o(2.6)}/><circle cx="-31" cy="-45" r="1.6" fill="${SP.spot}"/>`;
		g += pus(22, -24, 3.4) + pus(-12, 8, 2.6);
		g += `<path d="M4 -4 C4 4 2 8 4 12" fill="none" stroke="${G.l}" stroke-width="3" stroke-linecap="round"/>`;
		g += shine("M-26 -50 C-20 -58 -10 -60 -4 -60", "rgba(255,255,255,.3)");
		return g;
	}
	LGMon.add("blighttree", {
		art: () =>
			goo(150, 216, 70) +
			T(150, 178, 1.15, blighttree()) +
			spores([
				[70, 70, 2.4],
				[228, 50, 2],
				[244, 140, 2],
				[56, 130, 1.8],
			]),
		face: () =>
			T(
				64,
				66,
				1,
				limb("M-24 -46 L-40 -62 L-40 -76", TR.c, 9) +
					limb("M24 -46 L40 -62 L42 -74", TR.c, 9) +
					T(0, 26, 1.05, treeFace()),
			),
	});

	const FN = {
		skin: "#c9bfae",
		skind: "#9a8f80",
		mask: "#5a5458",
		sash: "#8a2a4a",
		tat: "#6a3f7a",
	};
	function fanMask() {
		let g = both(
			`<path d="M-16 -66 L-24 -84 L-10 -72 Z" fill="#c9c2cc" ${o(3)}/><path d="M-20 -54 L-34 -60 L-21 -46 Z" fill="#c9c2cc" ${o(3)}/>`,
		);
		g += `<path d="M0 -78 L6 -92 L8 -76 Z" fill="#c9c2cc" ${o(3)}/>`;
		g += `<path d="M-20 -62 C-20 -78 20 -78 20 -62 L18 -36 C10 -30 -10 -30 -18 -36 Z" fill="${FN.mask}" ${o()}/>`;
		g += `<path d="M-18 -66 C-10 -72 10 -72 18 -66" fill="none" stroke="#7e767c" stroke-width="3" stroke-linecap="round"/>`;
		g += `<path d="M-14 -54 L14 -54 L12 -48 L-12 -48 Z" fill="${INK}"/><path d="M-11 -51 H11" stroke="${GLOW}" stroke-width="3" stroke-linecap="round"/>`;
		g += `<path d="M0 -44 V-34 M-6 -42 V-35 M6 -42 V-35" stroke="${INK}" stroke-width="2"/>`;
		g += `<path d="M-8 -64 L0 -58 L8 -64" fill="none" stroke="${FN.sash}" stroke-width="3" stroke-linecap="round"/>`;
		g += `<circle cx="-14" cy="-40" r="2" fill="#a8a0a6"/><circle cx="14" cy="-40" r="2" fill="#a8a0a6"/>`;
		return g;
	}
	function fanatic() {
		let g = `<path d="M-22 4 L22 4 L30 36 L16 32 L8 40 L0 32 L-8 40 L-16 32 L-30 36 Z" fill="${FN.sash}" ${o()}/>`;
		g += both(
			limb("M-12 30 L-14 42", FN.skind, 10) +
				`<path d="M-22 44 L-8 44" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`,
		);
		g += `<path d="M-26 -34 C-16 -42 16 -42 26 -34 L22 6 C12 10 -12 10 -22 6 Z" fill="${FN.skin}" ${o()}/>`;
		g += `<path d="M-14 -22 C-8 -18 -2 -18 0 -16 C2 -18 8 -18 14 -22 M0 -16 V2" fill="none" stroke="${FN.skind}" stroke-width="2.4" stroke-linecap="round"/>`;
		g += `<path d="M-8 -6 L0 -14 L8 -6 L0 2 Z" fill="none" stroke="${FN.tat}" stroke-width="2.6"/><circle cx="0" cy="-6" r="2" fill="${FN.tat}"/><path d="M-20 -28 L-14 -24 L-18 -18 M20 -28 L14 -24 L18 -18" fill="none" stroke="${FN.tat}" stroke-width="2.4" stroke-linecap="round"/>`;
		g += `<path d="M-26 -34 L22 6" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M-26 -34 L22 6" stroke="#6b4a35" stroke-width="4" stroke-linecap="round"/>`;
		g += `<path d="M-22 2 H22" stroke="#4a3a3e" stroke-width="5"/>`;
		g +=
			limb("M-26 -30 L-38 -10 L-30 6", FN.skin, 10) +
			`<path d="M-34 -2 L-26 -2" stroke="${INK}" stroke-width="2"/>`;
		g += fanMask();
		g += limb("M26 -30 L40 -18 L46 -30", FN.skin, 10);
		g += `<path d="M44 -26 L50 -96 L56 -88 L58 -78 L54 -72 L58 -62 L54 -54 L58 -44 L52 -26 Z" fill="#a8a2ac" ${o()}/><path d="M50 -88 L48 -34" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".6"/><path d="M55 -60 L53 -50" stroke="#8a2a2a" stroke-width="2.6" stroke-linecap="round"/>`;
		g += `<path d="M38 -26 L60 -24" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M38 -26 L60 -24" stroke="#6a5a48" stroke-width="4" stroke-linecap="round"/>`;
		g += `<circle cx="46" cy="-28" r="6" fill="${FN.skin}" ${o(3)}/>`;
		return g;
	}
	LGMon.add("fanatic", {
		art: () => shadow(148, 224, 50) + T(144, 168, 1.28, fanatic()),
		face: () => T(64, 66 + 58 * 1.25, 1.25, fanMask()),
	});

	const HR = { c: "#8a2a4a", d: "#5a1a32", l: "#b8506e", vein: GLOW };
	function heart(roots = true, mini = false) {
		let g = "";
		if (roots) {
			g +=
				limb("M-30 20 C-50 30 -66 26 -80 40", P.d, 8) +
				limb("M30 20 C50 28 66 24 82 38", P.d, 8) +
				limb("M-14 30 C-20 40 -30 42 -36 48", P.d, 7) +
				limb("M14 30 C20 40 32 42 38 48", P.d, 7);
			g +=
				limb(
					"M-34 -24 C-60 -40 -70 -20 -84 -30 C-92 -36 -92 -46 -84 -50",
					P.c,
					7,
				) + limb("M36 -20 C60 -34 74 -14 86 -26 C94 -34 92 -44 84 -46", P.c, 7);
			g += `<circle cx="-84" cy="-50" r="5" fill="${P.l}" ${o(3)}/><circle cx="84" cy="-46" r="5" fill="${P.l}" ${o(3)}/>`;
		}
		for (const [x, y, r, h] of mini
			? [
					[-26, -36, -40, 10],
					[26, -36, 40, 10],
					[-38, -24, -62, 9],
					[38, -24, 62, 9],
				]
			: [
					[-22, -40, -30, 18],
					[-8, -46, -10, 22],
					[8, -46, 10, 22],
					[22, -40, 30, 18],
					[-34, -30, -50, 14],
					[34, -30, 50, 14],
				])
			g += `<g transform="translate(${x},${y}) rotate(${r})"><path d="M-5 4 L0 ${-h} L5 4 Z" fill="#e8dcc0" ${o(3.4)}/></g>`;
		if (!mini)
			g += `<path d="M-10 -44 L-6 -60 L4 -60 L8 -44 Z" fill="${HR.d}" ${o()}/><path d="M12 -42 L20 -56 L28 -52 L22 -38 Z" fill="${HR.d}" ${o()}/>`;
		g += `<path d="M0 -26 C-8 -46 -42 -50 -44 -20 C-46 4 -22 24 0 40 C22 24 46 4 44 -20 C42 -50 8 -46 0 -26 Z" fill="${HR.c}" ${o()}/>`;
		g += `<path d="M-36 -12 C-34 6 -18 22 0 34 C-14 20 -28 6 -30 -12 Z" fill="${HR.d}"/><path d="M-32 -32 C-26 -40 -16 -40 -10 -34" fill="none" stroke="${HR.l}" stroke-width="4" stroke-linecap="round"/>`;
		const v =
			"M0 -26 C-2 -14 -10 -8 -18 -6 C-24 -4 -28 2 -30 8 M-2 -16 C4 -6 14 -4 22 -8 C28 -10 32 -4 34 2 M0 -10 C2 4 -4 14 0 26 M16 -6 C18 6 12 14 14 22";
		g += `<path d="${v}" fill="none" stroke="${HR.d}" stroke-width="6" stroke-linecap="round"/><path d="${v}" fill="none" stroke="${HR.vein}" stroke-width="2.6" stroke-linecap="round"/>`;
		g +=
			`<ellipse cx="-14" cy="-14" rx="10" ry="9" fill="${HR.d}"/>` +
			eye(-14, -14, 7.6, "#f2e86a", 0, true);
		g +=
			`<ellipse cx="18" cy="-20" rx="6" ry="5.4" fill="${HR.d}"/>` +
			eye(18, -20, 4.6, "#f2e86a", 0, true);
		g +=
			`<ellipse cx="6" cy="12" rx="5" ry="4.6" fill="${HR.d}"/>` +
			eye(6, 12, 3.8, "#f2e86a", 0, true);
		g += pus(-26, 4, 3.2) + pus(28, -4, 2.6);
		g += `<path d="M-4 38 C-4 44 -6 48 -4 52" fill="none" stroke="${G.l}" stroke-width="3" stroke-linecap="round"/>`;
		return g;
	}
	LGMon.add("blightheart", {
		art: () =>
			goo(150, 214, 92) +
			T(150, 152, 1.55, heart()) +
			`<circle cx="150" cy="140" r="96" fill="none" stroke="${GLOW}" stroke-width="2" stroke-dasharray="2 12" opacity=".7"/>` +
			spores([
				[44, 70, 2.6],
				[256, 60, 2.4],
				[30, 150, 2],
				[270, 160, 2],
				[150, 26, 2.2],
			]),
		face: () => T(64, 70, 0.96, heart(false, true)),
	});
})();

(() => {
	const { INK, SW, o, eye, glowEye, shadow, shine, dk, lt } = LGMon;
	const L = (d, c, w = 8) =>
		`<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 9}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
	const P = (d, c, w = SW) => `<path d="${d}" fill="${c}" ${o(w)}/>`;
	const F = (d, c) => `<path d="${d}" fill="${c}"/>`;
	const E = (x, y, rx, ry, c, w = SW) =>
		`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c}" ${o(w)}/>`;
	const S = (d, c, w = 2.2) =>
		`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
	const G = (x, y, s, inner, extra = "") =>
		`<g transform="translate(${x},${y}) scale(${s})${extra}">${inner}</g>`;
	const dots = (arr, c, sw = 0) =>
		arr
			.map(
				([x, y, r]) =>
					`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"${sw ? ` stroke="${INK}" stroke-width="${sw}"` : ""}/>`,
			)
			.join("");
	const pincer = (c, d, l) =>
		P(
			"M-14 0 C-14 -13 0 -16 10 -11 L29 -15 C28 -6 21 -3 13 -3 L27 3 C23 12 8 14 -2 12 C-10 11 -14 6 -14 0 Z",
			c,
		) +
		S("M-8 -7 C-4 -10 2 -11 7 -9", l, 3) +
		S("M-6 7 C0 9 6 8 10 6", d, 2.4);

	const waves = (w, y, c = "#4f9fc4", foam = "#e8f6fb") => {
		let d = `M${-w} ${y}`;
		for (let x = -w; x < w; x += 24)
			d += ` Q${x + 6} ${y - 12} ${x + 12} ${y - 4} Q${x + 18} ${y + 4} ${x + 24} ${y - 2}`;
		return (
			P(d + ` L${w} ${y + 22} Q0 ${y + 30} ${-w} ${y + 22} Z`, c, 3.6) +
			S(
				`M${-w + 10} ${y + 8} Q${-w + 30} ${y + 4} ${-w + 50} ${y + 10} M${w - 60} ${y + 10} Q${w - 40} ${y + 4} ${w - 16} ${y + 9}`,
				foam,
				3,
			)
		);
	};

	const HC = {
		c: "#e0573c",
		dk: "#a8381f",
		lt: "#f59a7a",
		shell: "#f2d4b0",
		shellDk: "#c48e62",
		shellLt: "#fff3e2",
	};
	function hermit(p, face = false) {
		let g = "";

		g += P("M-14 -26 C-22 -82 34 -108 64 -78 C88 -52 74 -12 42 -8 Z", p.shell);
		if (!face)
			g +=
				P("M30 -98 L36 -112 L42 -96 Z", p.shell, 3) +
				P("M54 -88 L66 -96 L64 -80 Z", p.shell, 3) +
				P("M70 -62 L84 -62 L74 -50 Z", p.shell, 3);
		g += S(
			"M34 -52 C40 -54 42 -46 36 -44 C26 -42 24 -58 36 -62 C50 -66 60 -50 52 -36 C44 -22 18 -24 12 -40 C6 -58 18 -78 38 -80",
			p.shellDk,
			3.4,
		);
		g += S("M-6 -60 C0 -78 18 -90 34 -92", p.shellLt, 3.4);

		if (!face)
			for (const sx of [-1, 1])
				for (let i = 0; i < 2; i++)
					g += L(
						`M${sx * (14 + i * 8)} -16 L${sx * (32 + i * 10)} -20 L${sx * (36 + i * 10)} -2`,
						p.dk,
						5,
					);

		g += E(-4, -24, 28, 18, p.c) + S("M-24 -32 Q-10 -40 6 -38", p.lt, 3);

		g += L("M-14 -36 L-18 -58", p.c, 5) + L("M6 -36 L10 -58", p.c, 5);
		g += eye(-19, -64, 8, "#fff1c8", 0.8) + eye(11, -64, 8, "#fff1c8", -0.8);
		g += S("M-10 -18 Q-4 -13 2 -18", INK, 2.4);

		const cx = face ? 38 : 50;
		g +=
			L(`M-26 -20 Q${-cx + 8} -14 ${-cx} -24`, p.c, 7) +
			G(
				-cx - 2,
				-32,
				0.8,
				pincer(p.c, p.dk, p.lt),
				" scale(-1,1) rotate(-100)",
			);
		g +=
			L(`M18 -18 Q${cx - 8} -12 ${cx} -24`, p.c, 8) +
			G(cx + 2, -36, 1.05, pincer(p.c, p.dk, p.lt), " rotate(-84)");
		return g;
	}

	const GL = {
		c: "#f6f4ee",
		dk: "#b9bfc6",
		wing: "#9aa4ae",
		wingDk: "#5d6670",
		beak: "#f2b33a",
		leg: "#ef9a3a",
		band: "#d63c3c",
		bandDk: "#9a2424",
	};
	function gullHead(p) {
		let g = "";

		g +=
			P("M20 -14 C34 -16 42 -8 44 2 C36 -2 30 -4 24 -2 Z", p.band, 3.4) +
			P("M20 -8 C30 -2 34 8 32 16 C26 8 22 4 18 2 Z", p.bandDk, 3.4);
		g += P(
			"M0 -26 C18 -26 28 -14 28 2 C28 18 16 28 0 28 C-16 28 -26 18 -26 2 C-26 -14 -16 -26 0 -26 Z",
			p.c,
		);

		g += P(
			"M-26 -4 C-26 -22 -14 -30 2 -30 C18 -30 30 -20 28 -4 C14 -12 -12 -12 -26 -4 Z",
			p.band,
		);
		g += dots(
			[
				[-12, -20, 2.4],
				[4, -24, 2.4],
				[16, -16, 2.4],
				[-2, -14, 2],
			],
			"#fff",
		);
		g += S("M-22 -6 C-10 -12 10 -12 26 -6", p.bandDk, 2.4);

		g += eye(-6, 2, 7, "#fff1c8", -1.2);
		g += S("M-15 -6 L1 -4", INK, 3);
		g += S("M8 -10 L26 8", INK, 2.6) + E(14, 2, 6, 5.5, INK, 2);

		g +=
			P("M-14 8 L-48 14 C-46 20 -40 22 -14 20 Z", p.beak) +
			S("M-46 15 L-16 15", INK, 2) +
			P("M-48 14 L-52 18 L-44 19 Z", "#d5422c", 2);
		g +=
			P(
				"M-34 18 C-36 30 -30 38 -22 40 C-26 32 -26 26 -24 20 Z",
				"#7fb8d0",
				2.6,
			) +
			P("M-22 40 L-14 46 L-26 46 Z", "#7fb8d0", 2.4) +
			`<circle cx="-30" cy="24" r="1.6" fill="${INK}"/>`;
		return g;
	}
	function gull(p) {
		let g = shadow(0, 0, 50);

		for (const x of [-8, 10])
			g +=
				L(`M${x} -30 L${x} -6`, p.leg, 4) +
				P(`M${x - 9} 0 L${x} -8 L${x + 9} 0 Q${x} -2 ${x - 9} 0 Z`, p.leg, 3);

		g +=
			P("M30 -46 L64 -40 L58 -32 L66 -26 L32 -28 Z", p.wing) +
			F("M56 -40 L64 -40 L58 -32 L66 -26 L58 -27 Z", p.wingDk);

		g += P(
			"M-28 -56 C-30 -76 0 -80 20 -66 C36 -56 40 -36 28 -28 C14 -20 -20 -20 -30 -34 C-34 -42 -32 -50 -28 -56 Z",
			p.c,
		);
		g += F("M-22 -34 C-12 -26 12 -26 24 -32 C12 -22 -12 -22 -22 -34 Z", p.dk);

		g += P(
			"M-6 -60 C10 -70 30 -64 36 -50 C40 -40 34 -34 24 -36 L30 -44 L18 -44 L22 -52 L8 -52 Z",
			p.wing,
		);
		g += F(
			"M24 -36 L30 -44 L18 -44 L22 -52 L30 -50 C36 -46 34 -38 24 -36 Z",
			p.wingDk,
		);
		g += S("M-2 -60 C10 -66 22 -64 30 -58", "#cfd6dc", 3);
		g += G(-26, -84, 0.95, gullHead(p));
		return g;
	}

	const JL = {
		c: "#e59ad6",
		dk: "#b2609f",
		lt: "#f9d4f0",
		in: "#f3bfe6",
		tent: "#c46ab0",
		glow: "#ffe0fb",
	};
	function jelly(p, face = false) {
		let g = "";

		const T = face
			? [
					[-20, 26],
					[-7, 32],
					[7, 30],
					[20, 26],
				]
			: [
					[-26, 70],
					[-12, 84],
					[2, 78],
					[16, 86],
					[28, 66],
				];
		for (const [x, len] of T)
			g +=
				S(
					`M${x} 0 C${x - 8} ${len * 0.3} ${x + 8} ${len * 0.6} ${x} ${len}`,
					INK,
					8,
				) +
				S(
					`M${x} 0 C${x - 8} ${len * 0.3} ${x + 8} ${len * 0.6} ${x} ${len}`,
					p.tent,
					3.6,
				);
		if (!face)
			g +=
				S("M-6 2 C-14 20 0 34 -8 50", INK, 12) +
				S("M-6 2 C-14 20 0 34 -8 50", p.lt, 7) +
				S("M8 2 C14 18 4 30 12 46", INK, 12) +
				S("M8 2 C14 18 4 30 12 46", p.lt, 7);

		g += `<circle cx="0" cy="-20" r="${face ? 44 : 50}" fill="${p.glow}" opacity=".35"/>`;
		g += P(
			"M-40 2 C-46 -40 -24 -60 0 -60 C24 -60 46 -40 40 2 L32 -2 L26 4 L18 -2 L10 4 L0 -2 L-10 4 L-18 -2 L-26 4 L-32 -2 Z",
			p.c,
		);
		g += F(
			"M-28 -6 C-30 -32 -16 -48 0 -48 C16 -48 30 -32 28 -6 C16 -12 -16 -12 -28 -6 Z",
			p.in,
		);
		g +=
			S("M-28 -36 C-22 -48 -12 -54 -2 -55", "#fff", 3.4) +
			dots(
				[
					[18, -44, 3],
					[26, -34, 2],
				],
				"#fff",
			);
		g += eye(-11, -22, 6.4, "#5a2a6a") + eye(11, -22, 6.4, "#5a2a6a");
		g += `<ellipse cx="-21" cy="-10" rx="5" ry="3" fill="#ff7aa8" opacity=".6"/><ellipse cx="21" cy="-10" rx="5" ry="3" fill="#ff7aa8" opacity=".6"/>`;
		g += S("M-4 -10 Q0 -6 4 -10", INK, 2.2);
		return g;
	}

	const FM = {
		c: "#4a8aa8",
		dk: "#2f6380",
		lt: "#7cb8d0",
		belly: "#bfe2e2",
		fin: "#e07a4a",
		finDk: "#a8502a",
		kelp: "#4f8a3a",
	};
	function fishHead(p) {
		let g = "";

		g +=
			P("M-14 -26 L-8 -48 L0 -36 L8 -52 L14 -34 L22 -42 L20 -22 Z", p.fin) +
			S("M-6 -40 L-2 -28 M8 -44 L8 -28", p.finDk, 2);
		for (const sx of [-1, 1])
			g +=
				P(
					`M${sx * 28} -6 L${sx * 46} -18 L${sx * 42} -4 L${sx * 48} 8 L${sx * 28} 6 Z`,
					p.fin,
				) +
				S(
					`M${sx * 32} -4 L${sx * 42} -10 M${sx * 32} 2 L${sx * 42} 4`,
					p.finDk,
					2,
				);
		g += P(
			"M0 -28 C20 -28 30 -14 30 2 C30 20 18 28 0 28 C-18 28 -30 20 -30 2 C-30 -14 -20 -28 0 -28 Z",
			p.c,
		);
		g += dots(
			[
				[-14, -18, 2.4],
				[0, -21, 2.4],
				[14, -18, 2.4],
				[-7, -12, 2],
				[7, -12, 2],
			],
			p.dk,
		);
		g += F(
			"M-22 8 C-14 2 14 2 22 8 C20 22 10 26 0 26 C-10 26 -20 22 -22 8 Z",
			p.belly,
		);

		g += eye(-14, -4, 9, "#ffe066", 0) + eye(14, -4, 9, "#ffe066", 0);

		g +=
			P("M-18 12 Q0 22 18 12 Q0 16 -18 12 Z", "#5a1e2a", 2.6) +
			F("M-12 13.4 l2 4 l2 -3.6 M8 13.4 l2 3.6 l2 -4", "#fff");
		g += S("M-26 4 l-3 6 M-24 0 l-3 6 M26 4 l3 6 M24 0 l3 6", p.dk, 2);
		return g;
	}
	const trident = (c = "#c9ced6") =>
		L("M0 0 L0 -150", "#7a5a3a", 5) +
		P("M-16 -150 L16 -150 L16 -156 L-16 -156 Z", c, 3) +
		P("M-16 -156 L-16 -178 L-20 -172 Z", c, 3) +
		P("M16 -156 L16 -178 L20 -172 Z", c, 3) +
		P("M-4 -156 L0 -186 L4 -156 Z", c, 3);
	function fishman(p) {
		let g = shadow(0, 0, 54);
		g += G(46, -2, 1, trident());
		for (const sx of [-1, 1])
			g +=
				P(
					`M${sx * 6} -56 L${sx * 8} -10 L${sx * 2} 0 L${sx * 28} 0 L${sx * 22} -10 L${sx * 24} -56 Z`,
					p.c,
				) +
				S(
					`M${sx * 12} 0 L${sx * 12} -6 M${sx * 20} 0 L${sx * 18} -6`,
					INK,
					1.8,
				);
		g += P(
			"M-30 -98 C-38 -122 -22 -134 0 -134 C22 -134 38 -122 30 -98 L28 -52 L-28 -52 Z",
			p.c,
		);
		g += F("M-16 -120 C-8 -124 8 -124 16 -120 L14 -60 L-14 -60 Z", p.belly);
		g += S("M-14 -104 H14 M-14 -90 H14 M-14 -76 H14", dk(p.belly, 0.2), 2);

		g += P(
			"M-30 -62 L-34 -30 L-24 -40 L-16 -24 L-8 -40 L0 -26 L8 -40 L16 -24 L24 -40 L34 -30 L30 -62 Z",
			p.kelp,
		);

		g +=
			L("M-28 -124 Q-50 -108 -46 -84", p.c, 12) +
			P("M-52 -84 L-46 -72 L-40 -84 L-46 -88 Z", p.c, 3);
		g += P("M-48 -110 L-62 -104 L-50 -98 Z", p.fin, 2.6);
		g += L("M28 -124 Q48 -112 46 -96", p.c, 12) + E(46, -94, 8, 7, p.c, 3.2);
		g += G(0, -158, 1, fishHead(p));
		return g;
	}

	const PI = {
		skin: "#e2a878",
		skinDk: "#b57a4e",
		band: "#d63c3c",
		bandDk: "#9a2424",
		shirt: "#f4efe4",
		stripe: "#3a5a9a",
		vest: "#7a4a2a",
		pants: "#3e3a4a",
		beard: "#5a3a26",
	};
	function pirateHead(p) {
		let g = "";
		g +=
			P("M18 -18 C30 -20 38 -10 40 0 C32 -4 26 -6 20 -6 Z", p.band, 3.4) +
			P("M18 -12 C28 -6 30 4 28 12 C22 4 18 0 14 -2 Z", p.bandDk, 3.4);
		g += P(
			"M0 -28 C18 -28 27 -16 27 0 C27 18 16 28 0 28 C-16 28 -27 18 -27 0 C-27 -16 -18 -28 0 -28 Z",
			p.skin,
		);
		g += P(
			"M-28 -4 C-28 -24 -14 -32 0 -32 C14 -32 28 -24 28 -4 C14 -12 -14 -12 -28 -4 Z",
			p.band,
		);
		g += dots(
			[
				[-14, -20, 2.4],
				[2, -25, 2.4],
				[14, -18, 2.4],
			],
			"#fff",
		);

		g += S("M-26 -12 L24 6", INK, 2.6) + E(11, 0, 7, 6.4, INK, 2);
		g += eye(-11, 0, 6.4, "#8a5a2a");
		g += S("M-19 -9 L-4 -7", INK, 3);

		g += P("M-3 4 Q2 10 -2 13 Q-6 12 -5 10", p.skinDk, 2);
		g += F(
			"M-20 10 C-14 26 14 26 20 10 C16 22 8 28 0 28 C-8 28 -16 22 -20 10 Z",
			p.beard,
		);
		g += S("M-8 17 Q0 20 8 15", INK, 2.6) + F("M2 17.4 l2 3 l2 -3.6 Z", "#fff");
		g += `<circle cx="-27" cy="8" r="4" fill="none" stroke="#e8c35a" stroke-width="2.8"/>`;
		return g;
	}
	const cutlass = (c = "#dfe4ea") =>
		P("M-4 0 C-6 -20 -2 -44 10 -60 C12 -40 8 -20 6 0 Z", c, 3.4) +
		S("M0 -8 C0 -24 2 -40 8 -52", "#fff", 2) +
		P("M-10 0 Q0 10 12 0 Q14 6 10 8 Q0 14 -12 6 Z", "#e8c35a", 3) +
		P("M-3 6 H5 V18 Q1 21 -3 18 Z", "#6b3f22", 3);
	function pirate(p) {
		let g = shadow(0, 0, 50);

		g +=
			P(
				"M-24 -56 L-24 -8 Q-24 0 -16 0 L-2 0 Q2 0 0 -6 L-6 -8 L-8 -56 Z",
				p.pants,
			) + E(-12, -3, 12, 6, "#3a2620");
		g +=
			P("M8 -56 L24 -56 L20 -30 L10 -30 Z", p.pants) +
			P("M12 -30 L18 -30 L17 0 L13 0 Z", "#b0824e", 3.4);

		g += P(
			"M-30 -56 C-36 -96 -24 -112 0 -112 C24 -112 36 -96 30 -56 Z",
			p.shirt,
		);
		for (const y of [-100, -88, -76, -64]) g += S(`M-30 ${y} H30`, p.stripe, 4);
		g +=
			P("M-30 -56 C-36 -96 -24 -112 -12 -112 L-10 -56 Z", p.vest) +
			P("M30 -56 C36 -96 24 -112 12 -112 L10 -56 Z", p.vest);
		g +=
			P("M-32 -62 H32 V-52 H-32 Z", "#3a2a22", 3) +
			P("M-6 -63 H6 V-51 H-6 Z", "#e8c35a", 2.6);

		g += G(-56, -110, 1, cutlass(), " rotate(-16)");
		g +=
			L("M-26 -104 Q-48 -96 -54 -112", p.shirt, 12) +
			E(-55, -114, 7, 7, p.skin, 3);
		g +=
			L("M26 -104 Q44 -88 32 -66", p.shirt, 12) + E(30, -64, 7, 6.5, p.skin, 3);
		g += G(0, -136, 1, pirateHead(p));
		return g;
	}

	const EL = {
		c: "#7f9a3a",
		dk: "#55702a",
		lt: "#b4cc66",
		spot: "#3a4e1e",
		belly: "#e0d98a",
		rock: "#8a8f98",
		rockDk: "#5d626b",
	};
	function eelHead(p) {
		let g = "";

		g += P(
			"M34 -2 C10 0 -20 0 -46 8 L-42 24 C-14 16 14 12 34 10 Z",
			"#5a1e2a",
			3,
		);
		g +=
			P("M34 8 C16 12 -14 16 -44 22 C-32 30 0 28 30 20 Z", p.c) +
			S("M-30 26 C-10 26 10 23 26 18", p.belly, 3.4);
		g += P(
			"M36 -4 C34 -20 8 -24 -18 -20 C-34 -18 -46 -12 -54 -6 C-40 -2 -24 -2 0 -2 C16 -2 26 -2 36 -4 Z",
			p.c,
		);
		for (let i = 0; i < 5; i++) {
			const x = -40 + i * 12;
			g += `<path d="M${x} -3 l3 7 l3 -7 Z" fill="#fff" stroke="${INK}" stroke-width="1.2"/>`;
		}
		for (let i = 0; i < 4; i++) {
			const x = -36 + i * 12,
				y = 21 - i * 2.4;
			g += `<path d="M${x} ${y} l3 -7 l3 7 Z" fill="#fff" stroke="${INK}" stroke-width="1.2"/>`;
		}
		g += dots(
			[
				[10, -16, 3],
				[22, -11, 2.4],
				[-2, -18, 2.2],
				[24, -18, 2],
			],
			p.spot,
		);
		g += eye(-16, -12, 6, "#f2e04a", -1.4);
		g += S("M-26 -20 L-8 -18", INK, 3.2);
		g += `<circle cx="-46" cy="-8" r="1.8" fill="${INK}"/>`;
		return g;
	}

	function eelFace(p) {
		let g = "";
		g += P(
			"M64 18 C80 18 86 36 86 56 C86 80 78 100 64 106 C50 100 42 80 42 56 C42 36 48 18 64 18 Z",
			p.c,
		);
		g += S("M52 26 C56 22 62 20 68 21", p.lt, 3);
		g += dots(
			[
				[56, 34, 2.6],
				[74, 32, 2.4],
				[80, 62, 2.4],
				[46, 60, 2.2],
				[64, 28, 2],
			],
			p.spot,
		);
		g += P("M58 20 l-2 -7 l5 1 Z", p.c, 2) + P("M70 20 l2 -7 l-5 1 Z", p.c, 2);

		g += P(
			"M50 66 C50 56 78 56 78 66 L75 96 C71 104 57 104 53 96 Z",
			"#5a1e2a",
			3,
		);
		for (let i = 0; i < 4; i++) {
			const y = 64 + i * 8;
			g += `<path d="M${51 + i * 0.6} ${y} l7 2.6 l-6.4 3 Z" fill="#fff" stroke="${INK}" stroke-width="1.2"/><path d="M${77 - i * 0.6} ${y} l-7 2.6 l6.4 3 Z" fill="#fff" stroke="${INK}" stroke-width="1.2"/>`;
		}
		g += F("M58 92 C60 86 68 86 70 92 C68 98 60 98 58 92 Z", "#a83a4a");
		g +=
			eye(50, 46, 7.4, "#f2e04a", 0.8, true) +
			eye(78, 46, 7.4, "#f2e04a", -0.8, true);
		g += S("M40 36 L58 42", INK, 3.4) + S("M88 36 L70 42", INK, 3.4);
		return g;
	}
	function eel(p) {
		let g = shadow(0, 0, 80);
		g += L("M10 -20 C36 -60 -30 -80 -6 -128", p.c, 34);
		g += S("M30 -40 C34 -60 0 -72 -4 -96", p.belly, 6);
		g += dots(
			[
				[-10, -54, 3.4],
				[6, -66, 3],
				[-14, -84, 3],
				[8, -40, 2.6],
				[-20, -64, 2.4],
				[12, -86, 2.4],
			],
			p.spot,
		);

		g += S("M-24 -56 C-34 -70 -30 -90 -24 -110", p.dk, 4);

		g += P(
			"M-70 0 C-74 -24 -50 -34 -32 -24 C-22 -40 6 -40 14 -24 C26 -34 56 -30 60 -10 C70 -8 74 0 70 0 Z",
			p.rock,
		);
		g +=
			S(
				"M-56 -20 C-48 -26 -40 -26 -34 -22 M4 -32 C10 -32 14 -28 16 -24",
				"#b8bdc4",
				3,
			) + S("M-20 -10 L-14 -2 M30 -14 L36 -4", p.rockDk, 2.4);
		g +=
			F("M-60 -6 C-56 -10 -48 -10 -44 -6 Z", "#5e9a4a") +
			F("M40 -4 C44 -8 52 -8 56 -4 Z", "#5e9a4a");
		g += G(-2, -140, 1.05, eelHead(p), " rotate(-10)");
		return g;
	}

	LGMon.add("crab", {
		art: () => shadow(150, 212, 70) + G(146, 210, 1.3, hermit(HC)),
		face: () => G(56, 106, 0.76, hermit(HC, true)),
	});
	LGMon.add("gull", {
		art: () => G(160, 214, 1.4, gull(GL)),
		face: () => G(78, 62, 1.06, gullHead(GL)),
	});
	LGMon.add("jelly", {
		art: () => shadow(150, 222, 40) + G(150, 126, 1.25, jelly(JL)),
		face: () => G(64, 78, 1.0, jelly(JL, true)),
	});
	LGMon.add("fishman", {
		art: () => G(146, 222, 1.02, fishman(FM)),
		face: () => G(64, 70, 1.1, fishHead(FM)),
	});
	LGMon.add("pirate", {
		art: () => G(154, 220, 1.2, pirate(PI)),
		face: () => G(62, 68, 1.3, pirateHead(PI)),
	});
	LGMon.add("eel", {
		art: () => G(154, 220, 1.1, eel(EL)),
		face: () => eelFace(EL),
	});

	const SH = {
		c: "#6f8fa8",
		dk: "#4a6680",
		lt: "#a4bed0",
		belly: "#eef2f2",
		gum: "#8a2a3a",
		band: "#c4423a",
	};
	function sharkHead(p) {
		let g = "";
		g +=
			P("M-6 -26 C-2 -46 10 -58 22 -60 C16 -48 14 -36 16 -24 Z", p.c) +
			S("M2 -34 C6 -44 12 -50 18 -54", p.lt, 2.6);
		g += P(
			"M0 -28 C24 -28 36 -14 36 4 C36 22 22 32 0 32 C-22 32 -36 22 -36 4 C-36 -14 -24 -28 0 -28 Z",
			p.c,
		);
		g += F(
			"M-30 8 C-20 0 20 0 30 8 C28 26 14 30 0 30 C-14 30 -28 26 -30 8 Z",
			p.belly,
		);
		g += S("M28 -6 l4 8 M24 -8 l4 8 M20 -10 l4 8", p.dk, 2.4);
		g += S("M-20 -22 C-10 -27 2 -28 12 -26", p.lt, 3);

		g += eye(-15, -8, 5.4, "#e8483a") + eye(15, -8, 5.4, "#e8483a");
		g += S("M-24 -17 L-8 -12", INK, 3.4) + S("M24 -17 L8 -12", INK, 3.4);

		g += P("M-26 6 Q0 34 26 6 Q0 14 -26 6 Z", p.gum, 2.8);
		for (let i = 0; i < 7; i++) {
			const x = -22 + i * 7.3,
				y = 8 + Math.sin((i / 6) * Math.PI) * 4;
			g += `<path d="M${x - 3} ${y - 0.6} L${x} ${y + 6} L${x + 3} ${y - 0.6} Z" fill="#fff" stroke="${INK}" stroke-width="1.3"/>`;
		}
		for (let i = 0; i < 5; i++) {
			const x = -14 + i * 7,
				y = 18 + Math.sin((i / 4) * Math.PI) * 4;
			g += `<path d="M${x - 2.6} ${y + 2} L${x} ${y - 4} L${x + 2.6} ${y + 2} Z" fill="#fff" stroke="${INK}" stroke-width="1.2"/>`;
		}

		g +=
			S("M-30 -14 L-18 4", "#e8eef2", 2.6) +
			S("M-28 -8 l-4 2 M-24 -3 l-4 2", "#e8eef2", 2);
		return g;
	}
	function sharkman(p) {
		let g = shadow(0, 0, 64);

		g += P(
			"M20 -56 C40 -60 56 -74 62 -90 C66 -70 60 -50 50 -40 C60 -34 64 -24 62 -14 C52 -24 38 -32 24 -36 Z",
			p.dk,
		);
		for (const sx of [-1, 1])
			g += P(
				`M${sx * 8} -60 L${sx * 6} -8 Q${sx * 6} 0 ${sx * 14} 0 L${sx * 30} 0 Q${sx * 34} -4 ${sx * 28} -10 L${sx * 30} -60 Z`,
				p.c,
			);
		g +=
			P("M-34 -66 H34 L32 -46 Q0 -38 -32 -46 Z", "#3e3a4a") +
			P("M-36 -70 H36 V-60 H-36 Z", p.band, 3);

		g += P("M-42 -66 C-56 -110 -40 -146 0 -146 C40 -146 56 -110 42 -66 Z", p.c);
		g += F("M-24 -128 C-12 -134 12 -134 24 -128 L20 -70 L-20 -70 Z", p.belly);
		g += S(
			"M-14 -116 Q-7 -110 0 -116 Q7 -110 14 -116 M-12 -100 H12 M-12 -86 H12",
			dk(p.belly, 0.25),
			2.2,
		);
		g += shine(
			"M-36 -110 C-34 -126 -24 -138 -10 -142",
			"rgba(255,255,255,.4)",
			3.4,
		);

		for (const sx of [-1, 1]) {
			g += L(`M${sx * 38} -136 Q${sx * 66} -122 ${sx * 60} -92`, p.c, 17);
			g += P(`M${sx * 58} -126 L${sx * 76} -132 L${sx * 64} -112 Z`, p.dk, 3);
			g +=
				E(sx * 60, -86, 12, 11, p.c, 3.6) +
				S(`M${sx * 52} -92 h${sx * 14} M${sx * 52} -86 h${sx * 14}`, INK, 2) +
				P(`M${sx * 50} -96 h${sx * 20} v-5 h${-sx * 20} Z`, "#c9ced6", 2.4);
		}
		g += G(0, -168, 1.05, sharkHead(p));
		return g;
	}

	const SI = {
		skin: "#8fd0c4",
		skinDk: "#5aa094",
		hair: "#3f8a5a",
		hairDk: "#2a6040",
		hairLt: "#6cba82",
		tail: "#4a7fc4",
		tailDk: "#2f5a98",
		tailLt: "#86b4ea",
		top: "#e07a8a",
		shell: "#f6d6c0",
		glow: "#e8fff4",
		rock: "#8a8f98",
		rockDk: "#5d626b",
	};
	function sirenHead(p, face = false) {
		let g = "";

		g += P(
			`M-30 -10 C-40 -40 -20 -50 0 -50 C20 -50 40 -40 30 -10 C40 10 ${face ? "38 26 30 36 C24 32 22 28 20 22 L-20 22 C-22 28 -24 32 -30 36 C-38 26 -40 10 -30 -10" : "44 40 40 76 C30 64 26 48 22 30 L-22 30 C-26 48 -30 64 -40 76 C-44 40 -40 10 -30 -10"} Z`,
			p.hair,
		);
		g += S(
			"M-34 0 C-38 20 -36 40 -32 56 M34 0 C38 20 36 40 32 56",
			p.hairDk,
			2.6,
		);

		for (const sx of [-1, 1])
			g +=
				P(
					`M${sx * 24} -4 L${sx * 42} -16 L${sx * 36} 0 L${sx * 42} 10 Z`,
					p.tailLt,
					3,
				) +
				S(
					`M${sx * 28} -2 L${sx * 38} -8 M${sx * 28} 2 L${sx * 38} 6`,
					p.tail,
					1.8,
				);
		g += P(
			"M0 -28 C18 -28 26 -16 26 0 C26 18 14 28 0 28 C-14 28 -26 18 -26 0 C-26 -16 -18 -28 0 -28 Z",
			p.skin,
		);

		g += P(
			"M-28 -4 C-30 -30 -10 -38 4 -36 C20 -34 32 -22 28 -2 C22 -14 14 -18 6 -18 C2 -10 -8 -8 -12 -16 C-18 -12 -24 -8 -28 -4 Z",
			p.hair,
		);
		g += S("M-18 -28 C-10 -33 0 -34 8 -32", p.hairLt, 3);

		g +=
			P("M-14 -36 C-14 -46 -4 -48 -4 -38 Z", p.shell, 2.6) +
			P("M-5 -38 C-5 -52 7 -52 7 -38 Z", p.shell, 2.6) +
			P("M6 -37 C6 -46 16 -45 15 -35 Z", p.shell, 2.6);
		g += `<circle cx="-11" cy="-2" r="10" fill="${p.glow}" opacity=".45"/><circle cx="11" cy="-2" r="10" fill="${p.glow}" opacity=".45"/>`;
		g +=
			eye(-11, -2, 6.4, "#bff7ff", 0, true) +
			eye(11, -2, 6.4, "#bff7ff", 0, true);
		g += S("M-18 -11 L-5 -9", INK, 2.6) + S("M18 -11 L5 -9", INK, 2.6);
		g +=
			P("M-8 13 Q0 20 8 13 Q0 17 -8 13 Z", "#3a1a2a", 2.2) +
			F("M-5 14 l1.4 3 l1.4 -2.6 M2.6 14.4 l1.4 2.6 l1.4 -3 Z", "#fff");
		g += S("M-18 4 l2 3 M18 4 l-2 3", p.skinDk, 2);
		return g;
	}
	const note = (x, y, k, c) =>
		`<g transform="translate(${x},${y}) scale(${k})">` +
		`<path d="M5 2 V-22 C10 -18 16 -16 16 -8 C14 -12 10 -14 5 -15" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 2 V-22 C10 -18 16 -16 16 -8 C14 -12 10 -14 5 -15" fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>` +
		`<ellipse cx="0" cy="3" rx="6.4" ry="4.8" transform="rotate(-20)" fill="${c}" ${o(2.6)}/></g>`;
	const spark = (x, y, r, c) =>
		`<path d="M${x} ${y - r} Q${x + r * 0.2} ${y - r * 0.2} ${x + r} ${y} Q${x + r * 0.2} ${y + r * 0.2} ${x} ${y + r} Q${x - r * 0.2} ${y + r * 0.2} ${x - r} ${y} Q${x - r * 0.2} ${y - r * 0.2} ${x} ${y - r} Z" fill="${c}" stroke="${INK}" stroke-width="1.3" stroke-linejoin="round"/>`;
	function siren(p) {
		let g = shadow(0, 0, 84);

		g += P(
			"M-74 0 C-80 -30 -56 -54 -24 -54 C0 -62 30 -56 44 -40 C66 -40 82 -20 76 0 Z",
			p.rock,
		);
		g +=
			S("M-60 -30 C-50 -44 -36 -50 -22 -50", "#b8bdc4", 3.4) +
			S("M10 -30 L18 -16 M-40 -18 L-32 -8", p.rockDk, 2.6);
		g +=
			F("M-70 -6 C-64 -14 -50 -14 -44 -6 Z", "#5e9a4a") +
			F("M50 -6 C56 -12 66 -12 70 -4 Z", "#5e9a4a");
		g += P(
			"M-46 -30 L-43 -22 L-35 -22 L-41 -17 L-39 -9 L-46 -14 L-53 -9 L-51 -17 L-57 -22 L-49 -22 Z",
			"#f0905a",
			2.2,
		);

		g += P(
			"M-24 -62 C-28 -40 0 -36 28 -40 C48 -42 60 -30 56 -14 L48 -16 C48 -26 40 -30 28 -28 C0 -24 -36 -30 -32 -66 Z",
			p.tail,
		);
		g +=
			P(
				"M52 -18 C56 -4 72 2 82 -4 C74 -10 70 -16 70 -24 C66 -14 60 -12 52 -18 Z",
				p.tailLt,
			) + P("M52 -18 C48 -2 54 12 64 16 C62 6 62 -2 64 -10 Z", p.tailLt);
		for (const [x, y] of [
			[-14, -46],
			[0, -42],
			[14, -40],
			[28, -38],
			[-4, -52],
			[8, -50],
			[40, -34],
			[-22, -54],
		])
			g += S(`M${x - 5} ${y} Q${x} ${y + 4} ${x + 5} ${y}`, p.tailDk, 2.2);
		g += S("M-16 -54 C-6 -48 10 -46 26 -46", p.tailLt, 3);

		g += P(
			"M-22 -60 C-28 -90 -18 -104 0 -104 C18 -104 28 -90 22 -60 Z",
			p.skin,
		);
		g +=
			P(
				"M-22 -96 C-12 -100 12 -100 22 -96 L22 -78 C12 -74 -12 -74 -22 -78 Z",
				p.top,
			) +
			S("M0 -98 V-76", dk(p.top, 0.3), 2.2) +
			S("M-18 -92 C-10 -96 -2 -96 4 -95", lt(p.top, 0.4), 2.6);
		g += P("M-24 -64 H24 V-56 H-24 Z", p.tailDk, 3);
		for (let i = 0; i < 7; i++) {
			const t = i / 6,
				x = -14 + t * 28,
				y = -100 + Math.sin(t * Math.PI) * 7;
			g += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6" fill="#fff8ee" stroke="${INK}" stroke-width="1.3"/>`;
		}
		g += P("M0 -90 L4 -86 L0 -81 L-4 -86 Z", "#f2d0f0", 1.8);

		g +=
			L("M-20 -96 Q-40 -80 -38 -60", p.skin, 10) + E(-38, -58, 7, 5, p.skin, 3);
		g +=
			L("M20 -96 Q38 -110 24 -126", p.skin, 10) +
			E(32, -112, 5, 4, "#e8c35a", 2) +
			E(22, -128, 6.4, 6, p.skin, 3);

		g += `<path d="M20 -136 C40 -160 70 -130 86 -160 C96 -178 116 -170 124 -186" fill="none" stroke="${p.glow}" stroke-width="10" stroke-linecap="round" opacity=".55"/>`;
		g += S(
			"M20 -136 C40 -160 70 -130 86 -160 C96 -178 116 -170 124 -186",
			p.tailLt,
			2.6,
		);
		g +=
			note(50, -146, 1, p.tailLt) +
			note(84, -176, 1.15, p.top) +
			note(112, -160, 0.9, p.tailLt);
		g +=
			spark(36, -170, 5, "#fff") +
			spark(100, -196, 4.4, p.glow) +
			spark(126, -150, 4, "#fff");
		g += G(0, -130, 1, sirenHead(p));
		return g;
	}

	const GC = {
		c: "#8a3048",
		dk: "#5a1a2e",
		lt: "#c25a72",
		belly: "#e8b0a0",
		barn: "#e8e2d2",
		barnDk: "#a8a090",
		moss: "#5e8a3a",
	};
	function giantcrab(p, face = false) {
		let g = "";
		if (!face)
			for (const sx of [-1, 1])
				for (let i = 0; i < 3; i++)
					g +=
						L(
							`M${sx * (30 + i * 6)} -26 L${sx * (60 + i * 12)} -40 L${sx * (70 + i * 12)} -2`,
							i === 1 ? p.c : p.dk,
							8,
						) +
						P(
							`M${sx * (58 + i * 12)} -44 l${sx * 6} -8 l${sx * 2} 10 Z`,
							p.dk,
							2,
						);

		g += P(
			"M-58 -36 L-66 -50 L-52 -50 C-46 -76 -20 -86 0 -86 C20 -86 46 -76 52 -50 L66 -50 L58 -36 C54 -16 30 -10 0 -10 C-30 -10 -54 -16 -58 -36 Z",
			p.c,
		);
		for (const x of [-30, -12, 8, 26])
			g += P(
				`M${x - 5} ${-80 + Math.abs(x) * 0.12} L${x} ${-94 + Math.abs(x) * 0.2} L${x + 5} ${-80 + Math.abs(x) * 0.12} Z`,
				p.c,
				3,
			);
		g += S("M-40 -64 C-28 -78 -10 -82 6 -82", p.lt, 4);
		g += F(
			"M-38 -26 C-20 -16 20 -16 38 -26 C30 -14 -30 -14 -38 -26 Z",
			p.belly,
		);

		g += F("M22 -76 C30 -82 44 -78 46 -66 C38 -70 30 -70 22 -76 Z", p.moss);
		g +=
			dots(
				[
					[34, -60, 5],
					[44, -52, 3.6],
					[-42, -46, 4.4],
					[26, -66, 2.8],
				],
				p.barn,
				2,
			) +
			dots(
				[
					[34, -60, 1.6],
					[44, -52, 1.2],
					[-42, -46, 1.4],
				],
				p.barnDk,
			);

		g += L("M-12 -78 L-16 -100", p.c, 6) + L("M12 -78 L16 -100", p.c, 6);
		g +=
			eye(-17, -106, 8.4, "#ffd23a", 0.6) + eye(17, -106, 8.4, "#ffd23a", -0.6);
		g += S("M-28 -118 L-10 -112", INK, 3.4) + S("M28 -118 L10 -112", INK, 3.4);
		g += S("M-18 -30 Q-10 -26 -6 -32 Q0 -26 6 -32 Q10 -26 18 -30", INK, 2.6);

		g +=
			S("M-30 -70 L-16 -48", p.belly, 3) +
			S("M-28 -62 l-5 2 M-24 -55 l-5 2", p.belly, 2.2);

		const k = face ? 0.8 : 1;
		g +=
			L(`M-48 -40 Q-66 -50 ${-64 * k} -66`, p.c, 12) +
			G(
				-64 * k,
				-78,
				1.1 * k,
				pincer(p.c, p.dk, p.lt),
				" scale(-1,1) rotate(-96)",
			);
		g +=
			L(`M48 -40 Q74 -52 ${76 * k} -76`, p.c, 15) +
			G(80 * k, -96, 1.75 * k, pincer(p.c, p.dk, p.lt), " rotate(-104)");
		g += dots(
			[
				[80 * k, -88, 3.4],
				[74 * k, -100, 2.4],
			],
			p.barn,
			1.6,
		);
		return g;
	}

	function giantFace(p) {
		let g = "";

		g +=
			L("M42 86 Q26 84 26 70", p.c, 10) +
			G(26, 60, 0.85, pincer(p.c, p.dk, p.lt), " scale(-1,1) rotate(-90)");

		g += P(
			"M22 84 L16 74 L28 74 C32 56 48 50 60 50 C72 50 88 56 92 74 L104 74 L98 84 C94 100 78 106 60 106 C42 106 26 100 22 84 Z",
			p.c,
		);
		for (const x of [44, 60, 76])
			g += P(`M${x - 4} 54 L${x} 44 L${x + 4} 54 Z`, p.c, 2.6);
		g +=
			S("M32 70 C40 60 50 56 60 56", p.lt, 3.4) +
			dots(
				[
					[84, 86, 4.4],
					[90, 76, 3],
				],
				p.barn,
				1.6,
			);
		g += L("M52 60 L48 42", p.c, 6) + L("M68 60 L72 42", p.c, 6);
		g += eye(47, 34, 9.4, "#ffd23a", 0.8) + eye(73, 34, 9.4, "#ffd23a", -0.8);
		g += S("M34 22 L54 28", INK, 3.6) + S("M86 22 L66 28", INK, 3.6);
		g += S("M44 92 Q52 98 56 90 Q60 98 64 90 Q68 98 76 92", INK, 2.8);
		g += S("M36 66 L46 84", p.belly, 3);
		g +=
			L("M90 82 Q106 76 104 60", p.c, 13) +
			G(100, 46, 1.2, pincer(p.c, p.dk, p.lt), " rotate(-104)");
		return g;
	}

	const SE = {
		c: "#2e6a8a",
		dk: "#1e4a64",
		lt: "#5a9ab8",
		belly: "#bfe0c8",
		fin: "#5ab0c8",
		finDk: "#2f8098",
		glow: "#ffe066",
		gold: "#e8c35a",
	};
	function serpHead(p) {
		let g = "";

		for (const sx of [-1, 1])
			g +=
				P(
					`M${sx * 12} -24 L${sx * 24} -50 L${sx * 26} -38 L${sx * 38} -44 L${sx * 28} -18 Z`,
					p.fin,
				) + S(`M${sx * 20} -26 L${sx * 24} -40`, p.finDk, 2);
		for (const sx of [-1, 1])
			g +=
				P(
					`M${sx * 26} -6 L${sx * 48} -12 L${sx * 40} 0 L${sx * 48} 12 L${sx * 28} 8 Z`,
					p.fin,
				) +
				S(
					`M${sx * 30} -2 L${sx * 42} -4 M${sx * 30} 4 L${sx * 42} 8`,
					p.finDk,
					2,
				);
		g += P(
			"M0 -28 C20 -28 30 -14 30 2 C30 22 18 34 0 34 C-18 34 -30 22 -30 2 C-30 -14 -20 -28 0 -28 Z",
			p.c,
		);
		g += dots(
			[
				[-14, -18, 2.4],
				[0, -22, 2.6],
				[14, -18, 2.4],
			],
			p.dk,
		);

		g +=
			P(
				"M-16 -28 L-18 -42 L-9 -35 L0 -46 L9 -35 L18 -42 L16 -28 Z",
				p.gold,
				3,
			) +
			`<circle cx="0" cy="-34" r="3" fill="#3ad0c0" stroke="${INK}" stroke-width="1.4"/>`;
		g += F(
			"M-20 10 C-12 4 12 4 20 10 C18 26 10 32 0 32 C-10 32 -18 26 -20 10 Z",
			p.belly,
		);
		g += `<circle cx="-12" cy="-6" r="11" fill="${p.glow}" opacity=".35"/><circle cx="12" cy="-6" r="11" fill="${p.glow}" opacity=".35"/>`;
		g += eye(-12, -6, 7, p.glow, 0, true) + eye(12, -6, 7, p.glow, 0, true);
		g += S("M-22 -15 L-5 -10", INK, 3.4) + S("M22 -15 L5 -10", INK, 3.4);
		g += `<circle cx="-4" cy="10" r="1.6" fill="${INK}"/><circle cx="4" cy="10" r="1.6" fill="${INK}"/>`;
		g +=
			P("M-16 16 Q0 34 16 16 Q0 22 -16 16 Z", "#5a1e2a", 2.6) +
			P("M-12 17 L-9 26 L-6 19 Z", "#fff", 1.4) +
			P("M12 17 L9 26 L6 19 Z", "#fff", 1.4);
		return g;
	}
	function serpent(p) {
		let g = "";

		g +=
			L("M-110 0 C-100 -40 -70 -40 -60 0", p.c, 22) +
			P("M-92 -36 L-86 -50 L-80 -36 Z", p.fin, 2.6);
		g +=
			L("M60 0 C70 -46 104 -46 112 0", p.c, 22) +
			P("M80 -42 L86 -58 L92 -42 Z", p.fin, 2.6) +
			P("M96 -36 L104 -48 L106 -30 Z", p.fin, 2.6);

		g += L("M-30 6 C-34 -40 30 -60 10 -120", p.c, 34);
		g += S("M-12 -6 C-14 -40 34 -60 22 -104", p.belly, 10);
		for (let i = 0; i < 5; i++) {
			const y = -10 - i * 20,
				x = -14 + i * 6 + (i > 2 ? -4 * (i - 2) : 0);
			g += S(`M${x} ${y} l8 2`, dk(p.belly, 0.3), 2);
		}
		for (const [x, y] of [
			[-44, -30],
			[-34, -60],
			[-14, -84],
			[-6, -108],
		])
			g += P(
				`M${x} ${y} L${x - 12} ${y - 10} L${x + 2} ${y - 14} Z`,
				p.fin,
				2.6,
			);
		g += waves(126, 0);
		g += `<circle cx="10" cy="-144" r="56" fill="${p.glow}" opacity=".08"/>`;
		g += G(10, -144, 1.08, serpHead(p));
		return g;
	}

	const CP = {
		skin: "#9fc4b4",
		skinDk: "#6e9a88",
		coat: "#7a2a3a",
		coatDk: "#4e1624",
		coatLt: "#a84a5a",
		gold: "#e8c35a",
		hat: "#2e2a36",
		hatLt: "#4e4858",
		kelp: "#4f8a3a",
		kelpDk: "#2f6024",
		glow: "#7dfcd8",
		shirt: "#e8e0cc",
	};
	function captainHead(p) {
		let g = "";
		g += P(
			"M0 -28 C18 -28 27 -16 27 0 C27 18 16 28 0 28 C-16 28 -27 18 -27 0 C-27 -16 -18 -28 0 -28 Z",
			p.skin,
		);

		g += P(
			"M-24 6 C-24 22 -18 40 -10 48 L-6 36 L0 52 L6 36 L10 48 C18 40 24 22 24 6 C16 16 -16 16 -24 6 Z",
			p.kelp,
		);
		g += S("M-14 18 L-10 38 M0 22 L0 42 M14 18 L10 38", p.kelpDk, 2.4);
		g += P("M-10 14 Q0 22 10 14 Q0 18 -10 14 Z", "#1a2a24", 2.2);

		g += P(
			"M-46 -12 C-36 -20 -26 -18 -20 -22 C-18 -44 18 -44 20 -22 C26 -18 36 -20 46 -12 C30 -6 16 -14 0 -14 C-16 -14 -30 -6 -46 -12 Z",
			p.hat,
		);
		g +=
			S("M-44 -12 C-30 -6 -16 -14 0 -14 C16 -14 30 -6 44 -12", p.gold, 3) +
			S("M-14 -34 C-6 -38 4 -38 10 -36", p.hatLt, 3);
		g +=
			E(0, -26, 5.6, 5, "#f2ead6", 2) +
			`<circle cx="-2" cy="-27" r="1.3" fill="${INK}"/><circle cx="2" cy="-27" r="1.3" fill="${INK}"/>` +
			S("M-6 -19 L6 -15 M6 -19 L-6 -15", "#f2ead6", 2);
		g += glowEye(-10, -2, 5.6, p.glow) + glowEye(10, -2, 5.6, p.glow);
		g += S("M-18 -10 L-4 -6", INK, 3) + S("M18 -10 L4 -6", INK, 3);

		g += dots(
			[
				[20, 6, 3.4],
				[16, 12, 2.4],
			],
			"#e8e2d2",
			1.4,
		);
		return g;
	}
	function captain(p) {
		let g = shadow(0, 0, 60);
		for (const sx of [-1, 1])
			g += P(
				`M${sx * 6} -56 L${sx * 6} -10 L${sx * 4} 0 L${sx * 26} 0 Q${sx * 30} -4 ${sx * 24} -10 L${sx * 24} -56 Z`,
				"#2e2a36",
			);

		g += P(
			"M-34 -128 C-46 -100 -48 -60 -46 -26 L-36 -34 L-30 -20 L-22 -32 L-14 -48 L14 -48 L22 -32 L30 -20 L36 -34 L46 -26 C48 -60 46 -100 34 -128 Z",
			p.coat,
		);
		g +=
			P("M-14 -128 L-12 -50 L12 -50 L14 -128 Z", p.shirt, 3) +
			S("M-6 -120 L6 -112 M-6 -106 L6 -98 M-6 -92 L6 -84", p.coatDk, 2.4);
		g +=
			S("M-36 -116 C-42 -90 -42 -60 -40 -36", p.coatLt, 3) +
			dots(
				[
					[-24, -110, 2.6],
					[-24, -96, 2.6],
					[24, -110, 2.6],
					[24, -96, 2.6],
				],
				p.gold,
				1.4,
			);
		g +=
			P("M-34 -74 H34 V-64 H-34 Z", "#3a2a22", 3) +
			P("M-6 -75 H6 V-63 H-6 Z", p.gold, 2.6);

		for (const sx of [-1, 1])
			g +=
				P(
					`M${sx * 22} -132 C${sx * 34} -136 ${sx * 46} -130 ${sx * 46} -120 L${sx * 24} -120 Z`,
					p.gold,
					3,
				) +
				S(
					`M${sx * 28} -120 v6 M${sx * 34} -120 v7 M${sx * 40} -120 v6`,
					p.gold,
					2.4,
				);

		g +=
			L("M38 -124 Q58 -104 52 -82", p.coat, 13) +
			P("M46 -84 H58 V-76 H46 Z", p.gold, 2.6) +
			S("M52 -76 V-66 C52 -56 40 -56 40 -66", INK, 7) +
			S("M52 -76 V-66 C52 -56 40 -56 40 -66", "#c9ced6", 3.4);
		g += G(
			-64,
			-118,
			1.1,
			P("M-4 0 C-6 -22 -2 -48 12 -66 C14 -44 10 -22 6 0 Z", "#c9d4d0", 3.4) +
				S("M0 -8 C0 -26 2 -44 10 -58", "#fff", 2) +
				P("M-10 0 Q0 10 12 0 Q14 6 10 8 Q0 14 -12 6 Z", p.gold, 3) +
				P("M-3 6 H5 V18 Q1 21 -3 18 Z", "#3a2a22", 3),
			" rotate(-20)",
		);
		g +=
			L("M-36 -124 Q-58 -110 -62 -124", p.coat, 13) +
			E(-63, -124, 7.4, 7, p.skin, 3);

		g +=
			S("M-40 -40 C-44 -30 -38 -22 -42 -12", p.kelp, 4) +
			S("M30 -120 C34 -110 28 -100 32 -92", p.kelp, 3.4);
		g += `<circle cx="0" cy="-150" r="60" fill="${p.glow}" opacity=".08"/>`;
		g += G(0, -152, 1.08, captainHead(p));
		return g;
	}

	const DG = {
		armor: "#2f4a6a",
		armorDk: "#1c2e46",
		armorLt: "#5a7ea4",
		skin: "#3e7a8a",
		coral: "#e8705a",
		glow: "#7dfce8",
		lure: "#fff07a",
		gold: "#d8b44a",
	};
	function deepHead(p) {
		let g = "";

		g +=
			S("M0 -34 C4 -56 22 -62 30 -50", INK, 7) +
			S("M0 -34 C4 -56 22 -62 30 -50", p.armorLt, 3);
		g +=
			`<circle cx="31" cy="-44" r="14" fill="${p.lure}" opacity=".35"/>` +
			E(31, -44, 7, 7, p.lure, 3) +
			`<circle cx="29" cy="-46" r="2" fill="#fff"/>`;

		for (const sx of [-1, 1])
			g +=
				P(
					`M${sx * 26} -10 L${sx * 46} -22 L${sx * 40} -6 L${sx * 46} 8 L${sx * 28} 6 Z`,
					p.coral,
				) +
				S(
					`M${sx * 30} -6 L${sx * 40} -12 M${sx * 30} 2 L${sx * 40} 4`,
					dk(p.coral, 0.3),
					2,
				);
		g += P(
			"M0 -34 C22 -34 32 -18 32 2 C32 22 20 32 0 32 C-20 32 -32 22 -32 2 C-32 -18 -22 -34 0 -34 Z",
			p.armor,
		);
		g += S("M-22 -26 C-12 -32 2 -33 12 -31", p.armorLt, 3.4);
		g += P("M-4 -34 L0 -40 L4 -34 L4 -14 L-4 -14 Z", p.gold, 2.4);

		g += F(
			"M-24 -10 C-12 -16 12 -16 24 -10 L22 6 C10 2 -10 2 -22 6 Z",
			"#0e1824",
		);
		g += glowEye(-10, -4, 5.6, p.glow) + glowEye(10, -4, 5.6, p.glow);
		g += S("M-18 14 H18 M-16 20 H16 M-12 26 H12", p.armorDk, 2.6);
		g += dots(
			[
				[-24, 18, 2.2],
				[24, 18, 2.2],
			],
			p.gold,
			1.2,
		);
		return g;
	}
	function deepguard(p) {
		let g = shadow(0, 0, 64);

		g += G(54, -2, 1.1, trident("#d8b44a"));
		for (const sx of [-1, 1])
			g +=
				P(
					`M${sx * 6} -60 L${sx * 6} -8 Q${sx * 6} 0 ${sx * 14} 0 L${sx * 30} 0 Q${sx * 34} -4 ${sx * 28} -10 L${sx * 28} -60 Z`,
					p.armor,
				) + P(`M${sx * 4} -40 H${sx * 30} V-28 H${sx * 4} Z`, p.armorLt, 3);
		g += P(
			"M-36 -132 C-48 -100 -44 -70 -36 -56 L36 -56 C44 -70 48 -100 36 -132 Z",
			p.armor,
		);
		g += P(
			"M-26 -124 C-16 -130 16 -130 26 -124 L22 -76 Q0 -66 -22 -76 Z",
			p.armorLt,
			3,
		);
		g +=
			S("M-20 -110 Q0 -100 20 -110 M-20 -94 Q0 -84 20 -94", p.armorDk, 2.6) +
			`<circle cx="0" cy="-116" r="6" fill="${p.glow}" stroke="${INK}" stroke-width="2.2"/>`;
		g += P("M-38 -62 H38 V-52 H-38 Z", p.gold, 3);

		for (const sx of [-1, 1])
			g +=
				P(
					`M${sx * 20} -136 C${sx * 30} -150 ${sx * 56} -146 ${sx * 56} -122 C${sx * 46} -118 ${sx * 30} -118 ${sx * 20} -124 Z`,
					p.coral,
				) +
				S(
					`M${sx * 30} -140 L${sx * 34} -122 M${sx * 42} -142 L${sx * 44} -120`,
					dk(p.coral, 0.3),
					2.2,
				);
		g +=
			L("M40 -122 Q58 -106 54 -88", p.armor, 13) + E(54, -86, 8, 7, p.skin, 3);

		g += L("M-40 -122 Q-56 -110 -52 -92", p.armor, 13);
		g += P(
			"M-58 -126 C-90 -124 -96 -86 -88 -64 C-80 -46 -64 -40 -56 -40 C-48 -40 -32 -46 -26 -64 C-20 -86 -28 -124 -58 -126 Z",
			"#f0d0b0",
		);
		g += S(
			"M-58 -120 L-58 -44 M-74 -116 L-66 -46 M-42 -116 L-50 -46 M-86 -96 L-70 -50 M-30 -96 L-46 -50",
			"#c49a72",
			2.4,
		);
		g += P("M-64 -60 C-64 -70 -52 -70 -52 -60 Z", p.gold, 2.4);
		g += G(0, -162, 1.05, deepHead(p));
		return g;
	}

	const KR = {
		c: "#8a3a6e",
		dk: "#5c2048",
		lt: "#c06a9e",
		sucker: "#f2c4d8",
		glow: "#ffd23a",
		barn: "#e8e2d2",
		coral: "#e8705a",
	};
	const tent = (d, p, w = 18) => L(d, p.c, w) + S(d, p.lt, 3);
	function krakenHead(p, face = false) {
		let g = "";
		g += P(
			"M0 -56 C34 -56 46 -26 44 4 C42 26 26 36 0 36 C-26 36 -42 26 -44 4 C-46 -26 -34 -56 0 -56 Z",
			p.c,
		);
		g += S("M-30 -38 C-20 -50 -6 -54 6 -54", p.lt, 4);

		g +=
			P("M-20 -52 L-26 -70 L-18 -64 L-12 -78 L-6 -60 Z", p.coral, 3) +
			P("M6 -60 L12 -78 L18 -64 L26 -70 L20 -52 Z", p.coral, 3) +
			E(0, -58, 7, 6, p.barn, 2.6);
		g += dots(
			[
				[-30, -16, 4],
				[32, -26, 3.4],
				[28, -14, 2.4],
			],
			p.barn,
			1.6,
		);

		g +=
			S("M24 -44 L14 -20", p.sucker, 3) +
			S("M22 -38 l5 2 M18 -30 l5 2", p.sucker, 2.2);

		g += `<circle cx="-16" cy="-6" r="16" fill="${p.glow}" opacity=".3"/><circle cx="16" cy="-6" r="16" fill="${p.glow}" opacity=".3"/>`;
		g += eye(-16, -6, 10, p.glow, 0, true) + eye(16, -6, 10, p.glow, 0, true);
		g += S("M-32 -22 L-6 -14", INK, 4) + S("M32 -22 L6 -14", INK, 4);
		g += P("M-14 18 Q0 28 14 18 Q0 22 -14 18 Z", p.dk, 2.6);

		if (face)
			for (const sx of [-1, 1])
				g +=
					tent(
						`M${sx * 24} 26 C${sx * 30} 44 ${sx * 46} 44 ${sx * 50} 30`,
						p,
						10,
					) +
					tent(`M${sx * 8} 32 C${sx * 8} 46 ${sx * 18} 50 ${sx * 24} 44`, p, 9);
		return g;
	}
	function kraken(p) {
		let g = "";

		g += tent(
			"M-40 -40 C-90 -60 -110 -130 -80 -160 C-70 -170 -56 -160 -64 -150",
			p,
			18,
		);
		g += tent(
			"M40 -40 C96 -50 116 -120 90 -150 C80 -160 64 -152 72 -142",
			p,
			18,
		);
		g += tent("M-50 -10 C-100 -10 -130 -60 -116 -90", p, 16);

		g +=
			P("M98 -64 L132 -138 L140 -134 L106 -60 Z", "#9a6a3a", 3.4) +
			P(
				"M112 -110 C124 -104 136 -96 140 -84 L124 -78 C120 -90 114 -100 106 -104 Z",
				"#e8e0cc",
				3,
			);
		g += tent(
			"M50 -10 C100 -14 120 -60 110 -96 C104 -110 92 -100 98 -92",
			p,
			16,
		);
		for (const [x, y] of [
			[-96, -110],
			[-104, -136],
			[100, -110],
			[106, -128],
			[-120, -60],
			[118, -60],
		])
			g += E(x, y, 3.4, 2.8, p.sucker, 1.4);
		g += G(0, -78, 1.2, krakenHead(p));

		g +=
			tent("M-26 -40 C-40 -10 -70 -8 -76 -30", p, 14) +
			tent("M26 -40 C40 -10 70 -8 76 -30", p, 14);
		g += waves(140, -14, "#3f8fb4");
		return g;
	}

	LGMon.add("sharkman", {
		art: () => G(150, 222, 0.9, sharkman(SH)),
		face: () => G(64, 74, 1.06, sharkHead(SH)),
	});
	LGMon.add("siren", {
		art: () => G(144, 222, 1.04, siren(SI)),
		face: () => G(64, 66, 1.0, sirenHead(SI, true)),
	});
	LGMon.add("giantcrab", {
		art: () => shadow(146, 222, 100) + G(140, 220, 1.12, giantcrab(GC)),
		face: () => G(64, 72, 0.9, giantFace(GC), " translate(-64,-66)"),
	});
	LGMon.add("e_serpent", {
		art: () => G(150, 214, 0.96, serpent(SE)),
		face: () => G(64, 72, 0.96, serpHead(SE)),
	});
	LGMon.add("captain", {
		art: () => G(150, 222, 0.98, captain(CP)),
		face: () => G(64, 66, 1.08, captainHead(CP)),
	});
	LGMon.add("deepguard", {
		art: () => G(156, 222, 0.94, deepguard(DG)),
		face: () => G(62, 72, 1.04, deepHead(DG)),
	});
	LGMon.add("kraken", {
		art: () => G(150, 224, 0.92, kraken(KR)),
		face: () => G(64, 74, 0.86, krakenHead(KR, true)),
	});
})();

(() => {
	const { INK, SW, o, eye, glowEye, shadow, shine, dk, lt } = LGMon;

	const L = (d, c, w = 8) =>
		`<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 9}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
	const P = (d, c, w = SW) => `<path d="${d}" fill="${c}" ${o(w)}/>`;
	const F = (d, c) => `<path d="${d}" fill="${c}"/>`;
	const E = (x, y, rx, ry, c, w = SW) =>
		`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c}" ${o(w)}/>`;
	const S = (d, c, w = 2.2) =>
		`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
	const G = (x, y, s, inner, extra = "") =>
		`<g transform="translate(${x},${y}) scale(${s})${extra}">${inner}</g>`;
	const brows = (x, y, dx, w = 2.6, k = 4) =>
		S(`M${x - dx - 7} ${y - k} L${x - dx + 6} ${y}`, INK, w) +
		S(`M${x + dx + 7} ${y - k} L${x + dx - 6} ${y}`, INK, w);

	const SC = {
		c: "#d39443",
		dk: "#9a6127",
		lt: "#f0c27a",
		face: "#f3d9a4",
		sting: "#f4ead6",
	};
	const KS = {
		c: "#7a2a3c",
		dk: "#4c1625",
		lt: "#b4566a",
		face: "#c98290",
		sting: "#ff6a4a",
	};

	const pincer = (c, d, l) =>
		P(
			"M-14 0 C-14 -13 0 -16 10 -11 L29 -15 C28 -6 21 -3 13 -3 L27 3 C23 12 8 14 -2 12 C-10 11 -14 6 -14 0 Z",
			c,
		) +
		S("M-8 -7 C-4 -10 2 -11 7 -9", l, 3) +
		S("M-6 7 C0 9 6 8 10 6", d, 2.4);
	function scorp(p, k = {}) {
		let g = "";

		if (k.face)
			g += '<g transform="translate(8,-40) scale(.72) translate(-8,40)">';
		const seg = [
			[8, -50, 14],
			[16, -68, 13],
			[26, -84, 12],
			[40, -95, 11],
			[55, -98, 10],
			[68, -92, 9],
		];
		for (const [x, y, r] of seg)
			g +=
				E(x, y, r, r * 0.86, p.c) +
				S(
					`M${x - r * 0.5} ${y - r * 0.45} Q${x} ${y - r * 0.75} ${x + r * 0.45} ${y - r * 0.5}`,
					p.lt,
					2.4,
				);
		if (k.crown)
			for (const [x, y, r] of seg.slice(0, 5))
				g += S(
					`M${x - r * 0.8} ${y + r * 0.3} Q${x} ${y + r * 0.85} ${x + r * 0.8} ${y + r * 0.3}`,
					"#e8c35a",
					3,
				);
		if (k.glow)
			g += `<circle cx="78" cy="78" r="14" fill="${p.sting}" opacity=".3"/>`;
		g +=
			P(
				"M70 -90 C82 -88 86 -76 80 -66 L76 -72 C78 -78 76 -82 70 -82 Z",
				p.sting,
			) + E(73, -86, 7, 6, p.dk);
		if (k.face) g += "</g>";

		if (!k.face)
			for (const sx of [-1, 1])
				for (let i = 0; i < 3; i++) {
					const bx = sx * (16 + i * 6),
						by = -20 + i * 3,
						kx = sx * (44 + i * 9),
						ky = -36 + i * 7,
						fx = sx * (54 + i * 9);
					g += L(
						`M${bx} ${by} Q${kx * 0.8} ${ky - 6} ${kx} ${ky} L${fx} -3`,
						i === 1 ? p.c : p.dk,
						6,
					);
				}

		for (const sx of [-1, 1]) {
			if (k.face) {
				g += L(`M${sx * 22} -30 Q${sx * 36} -34 ${sx * 38} -50`, p.c, 9);
				g += G(
					sx * 40,
					-62,
					1,
					pincer(p.c, p.dk, p.lt),
					` scale(${sx},1) rotate(-96)`,
				);
				continue;
			}
			g += L(`M${sx * 22} -32 Q${sx * 44} -36 ${sx * 50} -54`, p.c, 9);
			g += G(
				sx * 54,
				-66,
				1,
				pincer(p.c, p.dk, p.lt),
				` scale(${sx},1) rotate(-102)`,
			);
		}

		g +=
			E(0, -30, 33, 23, p.c) +
			S("M-26 -40 Q0 -54 26 -40", p.lt, 3) +
			S("M-28 -22 Q0 -12 28 -22", p.dk, 2.4);
		g += F(
			"M-21 -32 C-21 -42 21 -42 21 -32 C21 -20 12 -14 0 -14 C-12 -14 -21 -20 -21 -32 Z",
			p.face,
		);
		g +=
			P("M-6 -16 Q-9 -8 -3 -7 L-1 -15 Z", p.dk, 2) +
			P("M6 -16 Q9 -8 3 -7 L1 -15 Z", p.dk, 2);
		g +=
			eye(-10, -31, 7.4, k.eyeC || "#2b1d18", 0) +
			eye(10, -31, 7.4, k.eyeC || "#2b1d18", 0);
		if (k.brow) g += brows(0, -40, 10, 3, 5);
		if (k.scar)
			g +=
				S("M-18 -44 L-4 -22", "#f0d0c0", 2.6) +
				S("M-15 -39 l-4 2 M-11 -33 l-4 2", "#f0d0c0", 2);
		if (k.crown)
			g +=
				P(
					"M-16 -50 L-18 -64 L-9 -57 L0 -68 L9 -57 L18 -64 L16 -50 Z",
					"#e8c35a",
					3,
				) +
				`<circle cx="0" cy="-56" r="3" fill="#e2474a"/>` +
				S("M-12 -53 H12", "#b88a2a", 2);
		if (k.crown)
			g +=
				P("M-24 -28 L-31 -24 L-28 -18 Z", "#e8c35a", 2) +
				P("M24 -28 L31 -24 L28 -18 Z", "#e8c35a", 2);
		return g;
	}

	function scorpFace(p, k = {}) {
		let g = "";
		if (k.glow)
			g += `<circle cx="96" cy="26" r="14" fill="${p.sting}" opacity=".35"/>`;
		for (const [x, y, r] of [
			[64, 50, 12],
			[70, 34, 11],
			[80, 22, 10],
			[92, 18, 9],
		])
			g +=
				E(x, y, r, r * 0.86, p.c) +
				S(
					`M${x - r * 0.5} ${y - r * 0.45} Q${x} ${y - r * 0.75} ${x + r * 0.45} ${y - r * 0.5}`,
					p.lt,
					2.4,
				);
		if (k.crown)
			for (const [x, y, r] of [
				[64, 50, 12],
				[70, 34, 11],
				[80, 22, 10],
			])
				g += S(
					`M${x - r * 0.8} ${y + r * 0.3} Q${x} ${y + r * 0.85} ${x + r * 0.8} ${y + r * 0.3}`,
					"#e8c35a",
					3,
				);
		g +=
			P(
				"M98 14 C110 18 112 30 104 38 L100 32 C102 28 100 24 96 22 Z",
				p.sting,
			) + E(96, 18, 6, 5.4, p.dk);
		for (const sx of [-1, 1]) {
			g += L(
				`M${64 + sx * 26} 84 Q${64 + sx * 40} 84 ${64 + sx * 38} 70`,
				p.c,
				10,
			);
			g += G(
				64 + sx * 37,
				60,
				1.0,
				pincer(p.c, p.dk, p.lt),
				` scale(${sx},1) rotate(-84)`,
			);
		}
		g += E(64, 80, 34, 25, p.c) + S("M38 70 Q64 56 90 70", p.lt, 3.4);
		g += F(
			"M42 80 C42 66 86 66 86 80 C86 94 76 102 64 102 C52 102 42 94 42 80 Z",
			p.face,
		);
		g +=
			P("M58 99 Q54 108 61 108 L62 100 Z", p.dk, 2) +
			P("M70 99 Q74 108 67 108 L66 100 Z", p.dk, 2);
		g +=
			eye(52, 80, 9.6, k.eyeC || "#2b1d18") +
			eye(76, 80, 9.6, k.eyeC || "#2b1d18");
		if (k.brow)
			g += S("M40 66 L58 71", INK, 3.6) + S("M88 66 L70 71", INK, 3.6);
		if (k.scar)
			g +=
				S("M42 62 L58 92", "#f0d0c0", 3) +
				S("M45 69 l-5 2 M50 78 l-5 2", "#f0d0c0", 2.4);
		if (k.crown)
			g +=
				P(
					"M48 62 L45 44 L56 52 L64 38 L72 52 L83 44 L80 62 Z",
					"#e8c35a",
					3.4,
				) +
				`<circle cx="64" cy="54" r="3.6" fill="#e2474a" stroke="${INK}" stroke-width="1.6"/>`;
		return g;
	}

	const HY = {
		fur: "#cfa66a",
		dk: "#8f6b3c",
		spot: "#6e4f2c",
		mane: "#55391f",
		belly: "#efdfbd",
		ear: "#d98f86",
	};
	function hyHead(p) {
		let g = "";
		for (const sx of [-1, 1])
			g +=
				`<g transform="translate(${sx * 22},-24) rotate(${sx * 22})">` +
				E(0, 0, 11, 14, p.fur) +
				`<ellipse cx="0" cy="2" rx="6" ry="8" fill="${p.ear}"/></g>`;
		g += P("M-4 -27 L-2 -40 L3 -29 L8 -38 L9 -26 Z", p.mane, 3);
		g += P(
			"M0 -28 C20 -28 31 -16 31 0 C31 18 18 30 0 30 C-18 30 -31 18 -31 0 C-31 -16 -20 -28 0 -28 Z",
			p.fur,
		);
		g += [
			[-18, -12, 3],
			[18, -14, 2.6],
			[-22, 6, 2.6],
			[22, 4, 3],
			[-8, -20, 2],
			[10, -21, 2.2],
		]
			.map(
				([x, y, r]) =>
					`<circle cx="${x}" cy="${y}" r="${r}" fill="${p.spot}"/>`,
			)
			.join("");
		g += F(
			"M-17 6 C-14 -2 14 -2 17 6 C18 20 10 27 0 27 C-10 27 -18 20 -17 6 Z",
			p.belly,
		);
		g += F("M-8 2 C-6 -4 6 -4 8 2 L4 10 L-4 10 Z", p.spot);
		g += eye(-12, -6, 6.2, "#f2b544", 0.8) + eye(12, -6, 6.2, "#f2b544", 0.8);
		g += S("M-19 -15 L-6 -12", INK, 2.6) + S("M19 -15 L6 -12", INK, 2.6);
		g += P("M-6 4 Q0 1 6 4 Q5 9 0 10 Q-5 9 -6 4 Z", INK, 1.6);

		g +=
			P("M-15 13 Q0 32 15 13 Q0 19 -15 13 Z", "#8a2f2f", 2.4) +
			F(
				"M-11 15 l2 4 l2 -3.4 M-3 17.5 l1.6 3.6 l1.6 -3.6 M5 17 l2 3.4 l2 -4",
				"#fff",
			) +
			P("M-6 22 Q0 28 6 22 Q0 24 -6 22 Z", "#e2747a", 1.2);
		return g;
	}
	function hyena(p) {
		let g = shadow(0, 0, 70);

		g +=
			P("M-14 -30 L-16 -4 Q-16 0 -11 0 L-6 0 Q-3 0 -4 -4 L-2 -30 Z", p.dk) +
			P("M44 -34 L50 -4 Q50 0 46 0 L40 0 Q37 0 38 -4 L32 -30 Z", p.dk);

		g +=
			L("M48 -46 Q62 -44 66 -30", p.fur, 7) +
			P("M60 -36 C70 -38 76 -28 72 -18 C66 -20 60 -26 60 -36 Z", p.mane, 3);

		g += P(
			"M-44 -70 C-22 -88 26 -72 48 -52 C60 -40 56 -22 42 -18 L-26 -18 C-48 -24 -56 -56 -44 -70 Z",
			p.fur,
		);
		g += F(
			"M-30 -20 C-20 -30 20 -30 38 -22 C20 -18 -10 -16 -30 -20 Z",
			p.belly,
		);
		g += [
			[-6, -56, 4],
			[10, -50, 3.6],
			[26, -44, 3.4],
			[-14, -40, 3.4],
			[4, -36, 3],
			[36, -34, 3],
			[18, -30, 2.6],
		]
			.map(
				([x, y, r]) =>
					`<circle cx="${x}" cy="${y}" r="${r}" fill="${p.spot}"/>`,
			)
			.join("");
		g += P(
			"M-40 -74 L-34 -86 L-28 -76 L-20 -88 L-14 -78 L-4 -86 L2 -76 L12 -80 L14 -72 C0 -78 -20 -78 -40 -70 Z",
			p.mane,
			3,
		);
		g += shine("M-36 -62 C-26 -72 -6 -74 10 -70", "rgba(255,255,255,.4)", 3);

		g +=
			P(
				"M-36 -30 L-36 -5 Q-36 0 -30 0 L-24 0 Q-20 0 -21 -5 L-22 -30 Z",
				p.fur,
			) + S("M-31 0 V-4 M-26 0 V-4", INK, 1.6);
		g +=
			P("M26 -36 L32 -5 Q33 0 28 0 L22 0 Q18 0 19 -5 L14 -30 Z", p.fur) +
			S("M23 0 V-4 M28 0 V-4", INK, 1.6);
		g += G(-42, -84, 0.95, hyHead(p), " rotate(-8)");
		return g;
	}

	const SB = {
		c: "#2f8f86",
		dk: "#1d5f5a",
		lt: "#6cc9bb",
		gold: "#e8c35a",
		head: "#245f6a",
	};
	function scarab(p, ball = true) {
		let g = "";
		if (ball)
			g +=
				E(58, -18, 18, 17, "#d8b674") +
				S("M48 -26 Q56 -32 64 -30", "#f2dca6", 3) +
				`<circle cx="62" cy="-12" r="2.4" fill="#b08a4c"/><circle cx="52" cy="-10" r="1.8" fill="#b08a4c"/>`;
		for (const sx of [-1, 1])
			for (let i = 0; i < 3; i++) {
				const by = -30 + i * 8;
				g +=
					L(
						`M${sx * 26} ${by} L${sx * (46 + i * 4)} ${by - 10 + i * 4} L${sx * (52 + i * 5)} -2`,
						p.dk,
						5,
					) +
					S(`M${sx * (40 + i * 4)} ${by - 8 + i * 4} l${sx * 4} -5`, INK, 2.6);
			}

		g +=
			P("M0 -82 C-26 -82 -42 -64 -40 -38 C-38 -24 -22 -18 0 -18 Z", p.c) +
			P("M0 -82 C26 -82 42 -64 40 -38 C38 -24 22 -18 0 -18 Z", p.c);
		g +=
			S("M-6 -76 C-22 -74 -32 -62 -34 -46", p.lt, 4) +
			S("M6 -76 C22 -74 32 -62 34 -46", "rgba(255,255,255,.35)", 3);
		g +=
			S("M-12 -60 C-20 -52 -22 -42 -20 -32", p.dk, 2.4) +
			S("M12 -60 C20 -52 22 -42 20 -32", p.dk, 2.4);
		g += S("M-38 -40 C-34 -26 -20 -20 0 -20 C20 -20 34 -26 38 -40", p.gold, 3);

		g += P(
			"M-24 -30 L-26 -42 L-18 -38 L-12 -46 L-6 -40 L0 -48 L6 -40 L12 -46 L18 -38 L26 -42 L24 -30 C22 -14 12 -8 0 -8 C-12 -8 -22 -14 -24 -30 Z",
			p.head,
		);
		g += S(
			"M-18 -36 L-12 -40 L-6 -35 L0 -42 L6 -35 L12 -40 L18 -36",
			p.gold,
			2.4,
		);
		g += eye(-10, -25, 6.8, "#f2b544") + eye(10, -25, 6.8, "#f2b544");
		g += S("M-4 -13 Q0 -10 4 -13", INK, 2);
		return g;
	}

	const SW_ = {
		c: "#d6a866",
		dk: "#9c7240",
		lt: "#f0cf93",
		mouth: "#7a2430",
		sand: "#e6cb8c",
	};
	function sandworm(p) {
		let g = shadow(0, 0, 84);
		g += L("M-12 -34 C-24 -54 34 -62 22 -104", p.c, 52);
		g +=
			S("M-40 -14 C-26 -22 -6 -22 8 -14", p.dk, 3) +
			S("M-42 -36 C-28 -42 -6 -40 6 -32", p.dk, 3) +
			S("M-28 -56 C-12 -62 10 -58 22 -50", p.dk, 3) +
			S("M-6 -76 C8 -80 30 -76 44 -66", p.dk, 3);
		g += S("M-38 -24 C-38 -40 -22 -52 -6 -60", "rgba(255,255,255,.35)", 3);

		g +=
			P(
				"M-84 0 C-70 -20 -50 -24 -40 -14 C-30 -24 10 -26 16 -14 C28 -24 66 -22 84 0 Z",
				p.sand,
			) +
			S("M-66 -10 Q-56 -18 -46 -16", "#f6e3b0", 3) +
			S("M24 -14 Q40 -20 56 -14", "#f6e3b0", 3);

		g +=
			E(22, -118, 36, 31, p.c) +
			E(22, -116, 29, 24, p.lt, 3) +
			E(22, -115, 22, 18, p.mouth, 3);
		for (let i = 0; i < 12; i++) {
			const a = (i / 12) * Math.PI * 2,
				cx = 22 + Math.cos(a) * 21,
				cy = -115 + Math.sin(a) * 17,
				ix = 22 + Math.cos(a) * 12,
				iy = -115 + Math.sin(a) * 9.5;
			const nx = -Math.sin(a) * 4,
				ny = Math.cos(a) * 3.4;
			g += `<path d="M${(cx + nx).toFixed(1)} ${(cy + ny).toFixed(1)} L${ix.toFixed(1)} ${iy.toFixed(1)} L${(cx - nx).toFixed(1)} ${(cy - ny).toFixed(1)} Z" fill="#fff6e0" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/>`;
		}
		g += E(22, -114, 7, 5.5, "#3d0f18", 2);
		g += eye(6, -146, 6, "#f2b544", 0.6) + eye(38, -146, 6, "#f2b544", -0.6);

		g += [
			[-40, -30, 3],
			[60, -10, 2.6],
			[70, -30, 2],
			[-58, -14, 2.4],
			[50, -140, 2],
			[-14, -150, 2.4],
		]
			.map(
				([x, y, r]) =>
					`<circle cx="${x}" cy="${y}" r="${r}" fill="${p.sand}" stroke="${INK}" stroke-width="1.4"/>`,
			)
			.join("");
		return g;
	}
	function wormFace(p) {
		let g =
			E(64, 64, 44, 38, p.c) +
			E(64, 66, 36, 30, p.lt, 3) +
			E(64, 67, 27, 22, p.mouth, 3);
		for (let i = 0; i < 10; i++) {
			const a = (i / 10) * Math.PI * 2 + 0.3,
				cx = 64 + Math.cos(a) * 26,
				cy = 67 + Math.sin(a) * 21,
				ix = 64 + Math.cos(a) * 13,
				iy = 67 + Math.sin(a) * 10.5;
			const nx = -Math.sin(a) * 5.4,
				ny = Math.cos(a) * 4.4;
			g += `<path d="M${(cx + nx).toFixed(1)} ${(cy + ny).toFixed(1)} L${ix.toFixed(1)} ${iy.toFixed(1)} L${(cx - nx).toFixed(1)} ${(cy - ny).toFixed(1)} Z" fill="#fff6e0" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>`;
		}
		g += E(64, 68, 8, 6.5, "#3d0f18", 2.4);
		g += eye(44, 30, 7, "#f2b544", 0.6) + eye(84, 30, 7, "#f2b544", -0.6);
		g +=
			P("M22 108 C30 94 46 92 56 98 C66 90 92 92 106 108 Z", p.sand, 3.4) +
			S("M32 102 Q40 97 48 98", "#f6e3b0", 2.6);
		return g;
	}

	const NM = {
		robe: "#dcc59a",
		robeDk: "#a8915f",
		cloak: "#3d4f8f",
		cloakDk: "#28366a",
		cloakLt: "#6276b8",
		skin: "#b5794f",
		sash: "#c4423a",
	};
	const blade = (c = "#dfe4ea") =>
		P("M0 0 C8 -22 6 -48 -16 -68 C-6 -44 -10 -22 -8 0 Z", c, 3.4) +
		S("M-2 -8 C2 -26 0 -44 -10 -58", "#fff", 2) +
		P("M-14 0 H6 Q8 4 4 5 H-12 Q-16 4 -14 0 Z", "#e8c35a", 3) +
		P("M-8 5 H0 V18 Q-4 21 -8 18 Z", "#6b3f22", 3);
	function nomadHead(p, angry = true) {
		let g = "";
		g += P("M18 -10 C30 0 34 18 28 36 C22 22 16 10 12 4 Z", p.cloak);
		g += P(
			"M0 -30 C18 -30 28 -18 28 0 C28 18 18 28 0 28 C-18 28 -28 18 -28 0 C-28 -18 -18 -30 0 -30 Z",
			p.skin,
		);

		g += P(
			"M-30 -2 C-34 -26 -16 -40 0 -40 C16 -40 34 -26 30 -2 C20 -8 -20 -8 -30 -2 Z",
			p.cloak,
		);
		g +=
			S("M-26 -16 C-10 -24 12 -24 26 -14", p.cloakDk, 3) +
			S("M-22 -28 C-8 -34 8 -34 20 -28", p.cloakDk, 3) +
			S("M-18 -34 C-8 -38 6 -38 12 -36", p.cloakLt, 3);
		g += P("M-4 -12 L0 -20 L4 -12 L0 -6 Z", "#e8c35a", 2.4);

		g += P(
			"M-29 6 C-20 2 20 2 29 6 C28 22 16 30 0 30 C-16 30 -28 22 -29 6 Z",
			p.cloak,
		);
		g +=
			S("M-20 14 Q0 20 20 14", p.cloakDk, 2.6) +
			S("M-14 22 Q0 26 14 22", p.cloakDk, 2.4);
		g += eye(-11, -4, 5.6, "#e9b54a", 0) + eye(11, -4, 5.6, "#e9b54a", 0);
		if (angry) g += S("M-19 -12 L-5 -8", INK, 3) + S("M19 -12 L5 -8", INK, 3);
		return g;
	}
	function nomad(p) {
		let g = shadow(0, 0, 54);
		g += E(-14, -4, 12, 7, "#5e3a22") + E(14, -4, 12, 7, "#5e3a22");
		g +=
			P("M-30 -84 L-40 -8 Q0 2 40 -8 L30 -84 Z", p.robe) +
			S("M-16 -70 L-20 -10 M10 -72 L14 -8", p.robeDk, 2.6);

		g +=
			P("M-30 -118 L-50 -14 Q-40 -8 -30 -12 L-26 -84 Z", p.cloakDk) +
			P("M30 -118 L48 -14 Q40 -8 30 -12 L26 -84 Z", p.cloakDk);
		g += P(
			"M-30 -84 C-34 -114 -22 -128 0 -128 C22 -128 34 -114 30 -84 Z",
			p.cloak,
		);
		g +=
			S("M-12 -124 L-8 -86 M12 -124 L8 -86", p.cloakDk, 2.4) +
			S("M-24 -110 C-22 -120 -14 -124 -6 -125", p.cloakLt, 3);
		g +=
			P("M-32 -88 H32 V-76 H-32 Z", p.sash, 3.4) +
			P("M20 -78 L26 -60 L18 -62 L14 -78 Z", p.sash, 3);

		g +=
			L("M28 -116 Q44 -100 30 -86", p.cloak, 13) + E(28, -84, 7, 6, p.skin, 3);
		g +=
			P("M-4 -82 L-10 -60 L-4 -56 L2 -80 Z", "#dfe4ea", 2.6) +
			P("M-8 -86 H4 V-80 H-8 Z", "#e8c35a", 2.4);

		g += G(-60, -128, 1, blade(), " rotate(14)");
		g +=
			L("M-28 -116 Q-52 -110 -58 -132", p.cloak, 13) +
			E(-59, -134, 7, 7, p.skin, 3);
		g += G(0, -154, 1, nomadHead(p));
		return g;
	}

	LGMon.add("scorpion", {
		art: () => shadow(146, 214, 76) + G(146, 212, 1.15, scorp(SC)),
		face: () => scorpFace(SC),
	});
	LGMon.add("kingscorp", {
		art: () =>
			shadow(146, 222, 98) +
			G(
				146,
				220,
				1.42,
				scorp(KS, { crown: 1, brow: 1, scar: 1, glow: 1, eyeC: "#ffb02e" }),
			),
		face: () =>
			scorpFace(KS, { crown: 1, brow: 1, scar: 1, glow: 1, eyeC: "#ffb02e" }),
	});
	LGMon.add("hyena", {
		art: () => G(156, 212, 1.4, hyena(HY)),
		face: () => G(64, 70, 1.25, hyHead(HY)),
	});
	LGMon.add("scarab", {
		art: () => shadow(140, 212, 70) + G(136, 210, 1.3, scarab(SB)),
		face: () => G(64, 106, 0.84, scarab(SB, false)),
	});
	LGMon.add("sandworm", {
		art: () => G(146, 222, 1.12, sandworm(SW_)),
		face: () => wormFace(SW_),
	});
	LGMon.add("nomad", {
		art: () => G(156, 218, 1.05, nomad(NM)),
		face: () => G(64, 70, 1.28, nomadHead(NM)),
	});

	const MU = {
		c: "#e6dbbd",
		dk: "#b3a582",
		lt: "#fff8e6",
		gap: "#3a2a22",
		glow: "#a6ff6e",
	};
	const PH = {
		c: "#d9c9a0",
		dk: "#a8966a",
		lt: "#f4ead0",
		gap: "#2a1e1a",
		glow: "#4dffd2",
		gold: "#e8c35a",
		goldDk: "#b8892a",
		blue: "#2f5aa8",
		blueDk: "#1f3d78",
	};
	function mummyHead(p, k = {}) {
		let g = "";
		if (k.pharaoh) {
			g += P(
				"M-30 -16 C-34 -44 -18 -54 0 -54 C18 -54 34 -44 30 -16 L46 40 L22 40 L18 6 L-18 6 L-22 40 L-46 40 Z",
				p.gold,
			);
			for (const y of [12, 22, 32])
				g +=
					S(
						`M${-24 - (y - 6) * 0.42} ${y} L${-20 - (y - 6) * 0.08} ${y}`,
						p.blue,
						5,
					) +
					S(
						`M${24 + (y - 6) * 0.42} ${y} L${20 + (y - 6) * 0.08} ${y}`,
						p.blue,
						5,
					);
			for (const y of [-6, 2])
				g +=
					S(`M-31 ${y} L-25 ${y}`, p.blue, 4) +
					S(`M31 ${y} L25 ${y}`, p.blue, 4);
			g +=
				S("M-22 -40 Q0 -52 22 -40", p.blue, 5) +
				S("M-28 -28 Q0 -42 28 -28", p.blue, 5);
		}
		g += P(
			"M0 -30 C18 -30 27 -18 27 0 C27 20 16 30 0 30 C-16 30 -27 20 -27 0 C-27 -18 -18 -30 0 -30 Z",
			p.c,
		);
		g +=
			S("M-26 -10 C-10 -20 12 -22 26 -16", p.dk, 2.6) +
			S("M-27 10 C-10 4 10 2 27 8", p.dk, 2.6) +
			S("M-22 20 C-8 16 8 16 22 22", p.dk, 2.4) +
			S("M-18 -24 C-6 -30 8 -30 18 -26", p.dk, 2.4);
		g += S("M-20 -20 C-12 -26 -4 -27 4 -27", p.lt, 3);

		g += F("M-23 -9 C-12 -15 12 -15 23 -8 L21 4 C10 -1 -10 -1 -22 3 Z", p.gap);
		g +=
			glowEye(-10, -4, 5.4, p.glow) +
			(k.oneEye
				? `<path d="M3 -8 C8 -11 16 -11 20 -8 L20 0 C14 -3 8 -3 3 -2 Z" fill="${p.c}" ${o(2)}/>` +
					S("M4 -4 L19 -6", p.dk, 2)
				: glowEye(10, -4, 5.4, p.glow));
		g += F("M-8 14 L-4 18 L0 14 L4 18 L8 14 L6 20 L-6 20 Z", p.gap);
		if (k.pharaoh) {
			g += P(
				"M-29 -18 C-14 -26 14 -26 29 -18 L28 -10 C14 -17 -14 -17 -28 -10 Z",
				p.gold,
				3,
			);
			g +=
				P(
					"M0 -34 C-6 -34 -7 -26 -3 -22 L-2 -14 L2 -14 L3 -22 C7 -26 6 -34 0 -34 Z",
					p.gold,
					2.6,
				) + `<circle cx="0" cy="-28" r="2" fill="#e2474a"/>`;
			g +=
				P("M-6 28 L6 28 L4 50 Q0 54 -4 50 Z", p.gold, 3) +
				S("M-5 36 H5 M-4 43 H4", p.blue, 3);
		} else {
			g += P("M24 6 C34 10 36 22 30 32 C28 24 24 18 20 14 Z", p.c, 3);
		}
		return g;
	}
	function mummyBody(p, k = {}) {
		let g = shadow(0, 0, k.pharaoh ? 62 : 50);

		for (const sx of [-1, 1])
			g +=
				P(
					`M${sx * 6} -60 L${sx * 6} -4 Q${sx * 6} 0 ${sx * 11} 0 L${sx * 22} 0 Q${sx * 26} 0 ${sx * 25} -6 L${sx * 24} -60 Z`,
					p.c,
				) +
				S(
					`M${sx * 7} -40 L${sx * 24} -46 M${sx * 7} -22 L${sx * 24} -28`,
					p.dk,
					2.4,
				);
		if (k.pharaoh)
			g +=
				P("M-30 -66 L-34 -20 L0 -12 L34 -20 L30 -66 Z", p.lt) +
				P("M-10 -64 L-14 -14 L14 -14 L10 -64 Z", p.gold, 3) +
				S("M-12 -48 H12 M-13 -34 H13", p.blue, 4);

		g += P("M-28 -62 C-32 -100 -22 -118 0 -118 C22 -118 32 -100 28 -62 Z", p.c);
		g +=
			S("M-28 -76 L28 -92 M-30 -96 L26 -108 M-26 -66 L26 -78", p.dk, 2.6) +
			S("M-22 -106 C-16 -112 -8 -115 0 -115", p.lt, 3);
		g += P("M18 -66 L30 -36 L24 -36 L14 -64 Z", p.c, 3);
		if (k.pharaoh) {
			g += P(
				"M-34 -112 C-20 -96 20 -96 34 -112 C30 -86 -30 -86 -34 -112 Z",
				p.gold,
			);
			g +=
				S("M-30 -106 C-16 -94 16 -94 30 -106", p.blue, 4) +
				S("M-26 -98 C-12 -90 12 -90 26 -98", "#c4423a", 3);
		}

		for (const sx of [-1, 1]) {
			g += L(`M${sx * 24} -108 Q${sx * 50} -104 ${sx * 60} -118`, p.c, 14);
			g += S(
				`M${sx * 38} -114 l${sx * 2} 10 M${sx * 50} -116 l${sx * 4} 9`,
				p.dk,
				2.2,
			);
			if (k.pharaoh)
				g += P(
					`M${sx * 52} -124 L${sx * 58} -108 L${sx * 66} -112 L${sx * 60} -127 Z`,
					p.gold,
					2.6,
				);
			else
				g += P(
					`M${sx * 54} -112 L${sx * 58} -86 L${sx * 52} -88 L${sx * 48} -110 Z`,
					p.c,
					2.6,
				);
			g +=
				E(sx * 62, -122, 8, 7.5, p.c, 3.4) +
				S(
					`M${sx * 58} -128 l${sx * 2} -6 M${sx * 64} -128 l${sx * 1} -7 M${sx * 69} -125 l${sx * 2} -5`,
					INK,
					3.4,
				);
		}
		if (k.pharaoh) {
			g +=
				L("M-62 -122 L-62 -30", p.gold, 6) +
				S(
					"M-62 -110 V-100 M-62 -88 V-78 M-62 -66 V-56 M-62 -44 V-36",
					p.blue,
					6.5,
				) +
				L("M-62 -122 C-62 -150 -86 -150 -86 -132", p.gold, 6);
			g +=
				L("M62 -122 L80 -152", p.gold, 6) +
				L("M80 -152 L96 -136 M80 -152 L92 -130 M80 -152 L86 -128", p.blue, 4);
			g += `<circle cx="0" cy="-150" r="64" fill="${p.glow}" opacity=".10"/>`;
		}
		g += G(0, -146, k.pharaoh ? 1.05 : 1, mummyHead(p, k));
		return g;
	}

	const AN = {
		head: "#3a3540",
		headDk: "#25212a",
		headLt: "#5e5868",
		skin: "#8a5a3c",
		gold: "#e8c35a",
		goldDk: "#b8892a",
		blue: "#2f5aa8",
		kilt: "#f2ead6",
		ear: "#c79a3a",
	};
	function anubisHead(p) {
		let g = "";
		for (const sx of [-1, 1])
			g +=
				P(`M${sx * 10} -26 L${sx * 24} -64 L${sx * 30} -18 Z`, p.head) +
				F(`M${sx * 14} -28 L${sx * 23} -54 L${sx * 26} -22 Z`, p.ear);
		g += P(
			"M0 -32 C16 -32 26 -20 24 -4 C22 8 14 14 12 22 C10 32 6 36 0 36 C-6 36 -10 32 -12 22 C-14 14 -22 8 -24 -4 C-26 -20 -16 -32 0 -32 Z",
			p.head,
		);
		g += S("M-16 -26 C-8 -31 2 -32 10 -29", p.headLt, 3);
		g += P(
			"M-26 -12 C-14 -18 14 -18 26 -12 L24 -6 C12 -11 -12 -11 -24 -6 Z",
			p.gold,
			2.6,
		);

		g += S("M-22 0 L-28 4", p.gold, 2.6) + S("M22 0 L28 4", p.gold, 2.6);
		g +=
			eye(-11, 0, 5.8, "#ffcc33", 0, true) +
			eye(11, 0, 5.8, "#ffcc33", 0, true);
		g += S("M-18 -8 L-5 -5", INK, 3) + S("M18 -8 L5 -5", INK, 3);
		g += E(0, 30, 6, 4, INK, 2) + S("M-4 30 Q0 27 3 29", "#7a7480", 1.6);
		g += S("M-6 20 L0 24 L6 20", p.headLt, 2);
		return g;
	}
	function anubis(p) {
		let g = shadow(0, 0, 60);

		g +=
			L("M48 -4 L48 -196", "#7a4a2a", 6) +
			P(
				"M48 -222 C56 -212 58 -200 52 -192 L44 -192 C38 -200 40 -212 48 -222 Z",
				"#dfe4ea",
				3.4,
			) +
			P("M38 -192 H58 V-186 H38 Z", p.gold, 2.6);
		for (const sx of [-1, 1])
			g +=
				P(
					`M${sx * 6} -64 L${sx * 6} -6 Q${sx * 6} 0 ${sx * 12} 0 L${sx * 24} 0 Q${sx * 26} -4 ${sx * 23} -8 L${sx * 22} -64 Z`,
					p.skin,
				) + P(`M${sx * 6} -16 H${sx * 22} V-8 H${sx * 6} Z`, p.gold, 2.4);

		g +=
			P("M-30 -84 L-36 -46 Q0 -38 36 -46 L30 -84 Z", p.kilt) +
			P("M-8 -82 L-12 -42 L12 -42 L8 -82 Z", p.gold, 3) +
			S("M-10 -66 H10 M-11 -54 H11", p.blue, 4);
		g += S("M-24 -76 L-28 -50 M22 -76 L26 -50", "#c9bc9a", 2.4);

		g += P(
			"M-32 -84 C-40 -120 -24 -136 0 -136 C24 -136 40 -120 32 -84 Z",
			p.skin,
		);
		g +=
			S("M-12 -106 Q-6 -100 0 -106 Q6 -100 12 -106", dk(p.skin, 0.3), 2.4) +
			S("M-8 -92 H8", dk(p.skin, 0.3), 2.2);
		g += P("M-34 -88 H34 V-80 H-34 Z", p.gold, 3);

		g += P(
			"M-36 -130 C-22 -110 22 -110 36 -130 C32 -102 -32 -102 -36 -130 Z",
			p.gold,
		);
		g +=
			S("M-32 -124 C-18 -110 18 -110 32 -124", p.blue, 4.4) +
			S("M-28 -116 C-14 -106 14 -106 28 -116", "#c4423a", 3);

		g +=
			L("M30 -126 Q52 -116 48 -96", p.skin, 12) +
			P("M42 -104 H54 V-92 H42 Z", p.gold, 2.6) +
			E(48, -88, 8, 7, p.skin, 3.2);
		g +=
			L("M-30 -126 Q-52 -112 -50 -88", p.skin, 12) +
			P("M-56 -104 H-44 V-94 H-56 Z", p.gold, 2.6);
		g +=
			P(
				"M-50 -86 L-50 -70 C-50 -56 -66 -52 -72 -62 C-64 -60 -58 -64 -58 -72 L-58 -86 Z",
				"#dfe4ea",
				3,
			) +
			S("M-53 -82 L-53 -70", "#fff", 2) +
			E(-50, -88, 7.5, 7, p.skin, 3.2);
		g += G(0, -166, 1.02, anubisHead(p));
		return g;
	}

	const BA = {
		c: "#5f9a4a",
		dk: "#3c6a2f",
		lt: "#9bcf72",
		belly: "#e6dc9a",
		crest: "#d8442f",
		crestDk: "#9a2a1e",
		glow: "#fff066",
	};
	function basHead(p) {
		let g = "";

		g +=
			P(
				"M-22 -18 L-30 -46 L-14 -30 L-8 -56 L0 -32 L8 -56 L14 -30 L30 -46 L22 -18 Z",
				p.crest,
			) + S("M-8 -48 L-4 -32 M8 -48 L4 -32", p.crestDk, 2.4);

		for (const sx of [-1, 1])
			g +=
				P(
					`M${sx * 24} -10 L${sx * 46} -18 L${sx * 40} -4 L${sx * 48} 6 L${sx * 36} 10 L${sx * 42} 20 L${sx * 24} 14 Z`,
					p.crest,
				) +
				S(
					`M${sx * 28} -4 L${sx * 40} -10 M${sx * 28} 6 L${sx * 40} 8`,
					p.crestDk,
					2,
				);
		g += P(
			"M0 -26 C20 -26 30 -14 30 2 C30 18 20 28 0 28 C-20 28 -30 18 -30 2 C-30 -14 -20 -26 0 -26 Z",
			p.c,
		);
		g += [
			[-14, -18],
			[0, -21],
			[14, -18],
			[-7, -12],
			[7, -12],
		]
			.map(
				([x, y]) =>
					`<path d="M${x - 4} ${y} Q${x} ${y - 4} ${x + 4} ${y}" fill="none" stroke="${p.dk}" stroke-width="2"/>`,
			)
			.join("");
		g += F(
			"M-20 8 C-12 4 12 4 20 8 C18 22 10 26 0 26 C-10 26 -18 22 -20 8 Z",
			p.belly,
		);

		g += `<circle cx="-12" cy="-4" r="11" fill="${p.glow}" opacity=".35"/><circle cx="12" cy="-4" r="11" fill="${p.glow}" opacity=".35"/>`;
		g += eye(-12, -4, 7, p.glow, 0, true) + eye(12, -4, 7, p.glow, 0, true);
		g += S("M-21 -13 L-5 -9", INK, 3.2) + S("M21 -13 L5 -9", INK, 3.2);
		g += `<circle cx="-4" cy="8" r="1.6" fill="${INK}"/><circle cx="4" cy="8" r="1.6" fill="${INK}"/>`;
		g +=
			P("M-16 14 Q0 24 16 14 Q0 30 -16 14 Z", "#7a1f28", 2.4) +
			F("M-11 16 l2 4 l2 -3 M7 16 l2 3 l2 -4", "#fff");
		g +=
			L("M0 24 L0 34", "#d84a6a", 2.5) +
			S("M0 34 L-4 40 M0 34 L4 40", "#d84a6a", 2.5);
		return g;
	}
	function basilisk(p) {
		let g = shadow(0, 0, 90);

		g +=
			L("M40 -24 C80 -20 96 -50 76 -68 C64 -78 50 -66 58 -56", p.c, 18) +
			S("M50 -26 C76 -26 90 -44 80 -60", p.lt, 3);
		for (const [x, y] of [
			[66, -26],
			[84, -40],
			[86, -60],
		])
			g += P(
				`M${x - 4} ${y - 6} L${x + 2} ${y - 16} L${x + 6} ${y - 4} Z`,
				p.crest,
				2.4,
			);

		g +=
			L("M28 -28 L40 -12 L34 0", p.dk, 10) +
			L("M-30 -30 L-44 -14 L-40 0", p.dk, 10);

		g += P(
			"M-50 -50 C-40 -72 30 -76 52 -50 C62 -36 54 -18 36 -16 L-36 -16 C-54 -20 -60 -36 -50 -50 Z",
			p.c,
		);
		g += F(
			"M-40 -20 C-20 -30 24 -30 44 -20 C20 -16 -20 -14 -40 -20 Z",
			p.belly,
		);
		g += [
			[-24, -58],
			[-6, -62],
			[12, -60],
			[30, -54],
			[-16, -44],
			[4, -46],
			[22, -42],
		]
			.map(
				([x, y]) =>
					`<path d="M${x - 6} ${y} Q${x} ${y - 6} ${x + 6} ${y}" fill="none" stroke="${p.dk}" stroke-width="2.4"/>`,
			)
			.join("");
		for (const [x, y] of [
			[-30, -66],
			[-12, -72],
			[8, -72],
			[28, -66],
			[44, -56],
		])
			g += P(
				`M${x - 6} ${y + 4} L${x} ${y - 10} L${x + 6} ${y + 4} Z`,
				p.crest,
				2.6,
			);
		g += shine("M-40 -56 C-24 -68 0 -70 16 -68", "rgba(255,255,255,.4)", 3);

		for (const x of [-24, 34])
			g +=
				L(`M${x} -28 L${x - 6} -10 L${x - 2} -2`, p.c, 12) +
				S(`M${x - 10} 2 l-3 2 M${x - 3} 3 l0 3 M${x + 4} 2 l3 2`, INK, 2.6);
		g += G(-58, -66, 1.05, basHead(p), " rotate(-6)");
		return g;
	}

	const DJ = {
		skin: "#d79a52",
		dk: "#9c6430",
		lt: "#f2c486",
		sand: "#e6c27e",
		sandLt: "#f6e0ac",
		sandDk: "#b48a4a",
		goldDk: "#b8892a",
		glow: "#5ff2e0",
		gold: "#e8c35a",
		vest: "#7a3a8a",
		hair: "#3a2420",
	};
	function djinnHead(p) {
		let g = "";

		g +=
			P(
				"M-4 -28 C-14 -44 -4 -58 10 -62 C4 -54 6 -48 14 -44 C22 -52 30 -50 34 -44 C24 -40 22 -32 12 -26 Z",
				p.sand,
			) + S("M2 -40 C6 -48 12 -52 18 -52", p.sandDk, 2.4);
		g += P("M-8 -34 H8 V-26 H-8 Z", p.gold, 2.6);
		for (const sx of [-1, 1])
			g +=
				P(`M${sx * 24} -8 L${sx * 38} -18 L${sx * 30} 2 Z`, p.skin) +
				`<circle cx="${sx * 29}" cy="10" r="5.4" fill="none" stroke="${INK}" stroke-width="5.4"/><circle cx="${sx * 29}" cy="10" r="5.4" fill="none" stroke="${p.gold}" stroke-width="2.6"/>`;
		g += P(
			"M0 -30 C18 -30 28 -18 28 -2 C28 16 18 28 0 28 C-18 28 -28 16 -28 -2 C-28 -18 -18 -30 0 -30 Z",
			p.skin,
		);
		g += S("M-16 -22 C-8 -27 2 -28 10 -26", p.lt, 3);
		g += glowEye(-11, -4, 6, p.glow) + glowEye(11, -4, 6, p.glow);
		g += S("M-20 -14 L-4 -9", INK, 3.2) + S("M20 -14 L4 -9", INK, 3.2);
		g += S("M-8 12 Q0 16 8 12", INK, 2.6);

		g += P("M-6 22 C-6 34 4 40 8 34 C4 34 2 30 4 24 Z", p.hair, 2.6);
		return g;
	}
	const star = (x, y, r, c) =>
		`<path d="M${x} ${y - r} Q${x + r * 0.2} ${y - r * 0.2} ${x + r} ${y} Q${x + r * 0.2} ${y + r * 0.2} ${x} ${y + r} Q${x - r * 0.2} ${y + r * 0.2} ${x - r} ${y} Q${x - r * 0.2} ${y - r * 0.2} ${x} ${y - r} Z" fill="${c}" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/>`;
	const cuffs = (x, y, n = 2) => {
		let g = "";
		for (let i = 0; i < n; i++)
			g += E(x, y + i * 6 - (n - 1) * 3, 10, 3.6, "#e8c35a", 2.4);
		return g;
	};
	function djinn(p) {
		let g = shadow(0, 0, 56);

		g += `<ellipse cx="0" cy="-70" rx="74" ry="26" fill="${p.glow}" opacity=".12"/>`;
		g += L("M-60 -58 C-70 -88 70 -96 62 -66", p.sandLt, 5);

		g += P(
			"M-48 -98 C-44 -70 -22 -50 -10 -30 C-6 -20 -12 -10 -4 -2 C4 4 12 -4 8 -14 C16 -30 32 -60 48 -98 Z",
			p.sand,
		);
		g +=
			F(
				"M-46 -92 C-20 -82 18 -82 46 -92 L42 -82 C16 -72 -16 -72 -42 -82 Z",
				p.sandLt,
			) +
			F(
				"M-34 -68 C-14 -60 12 -60 32 -70 L28 -60 C10 -52 -10 -52 -28 -60 Z",
				p.sandLt,
			) +
			F(
				"M-20 -46 C-8 -40 8 -40 18 -48 L14 -40 C4 -34 -6 -34 -16 -40 Z",
				p.sandLt,
			) +
			F("M-8 -26 C-2 -22 4 -22 10 -28 L8 -20 C2 -16 -4 -16 -8 -20 Z", p.sandLt);
		g +=
			S("M-40 -78 C-16 -70 16 -72 40 -82", p.sandDk, 2.6) +
			S("M-26 -54 C-10 -48 10 -50 24 -58", p.sandDk, 2.6) +
			S("M-14 -34 C-4 -30 6 -32 14 -38", p.sandDk, 2.4);

		g +=
			L("M-62 -60 C-50 -40 40 -40 58 -64", p.sandLt, 5) +
			L("M-40 -30 C-24 -14 20 -16 34 -34", p.sandLt, 4);
		g +=
			star(-62, -84, 6, p.glow) +
			star(58, -40, 5, p.glow) +
			star(-44, -20, 4, "#fff6c8") +
			star(66, -86, 4, "#fff6c8");
		g += [
			[-56, -46, 2.6],
			[50, -54, 2.4],
			[-30, -8, 2],
			[26, -12, 2.2],
			[70, -66, 2],
			[-72, -72, 2],
		]
			.map(
				([x, y, r]) =>
					`<circle cx="${x}" cy="${y}" r="${r}" fill="${p.sand}" stroke="${INK}" stroke-width="1.4"/>`,
			)
			.join("");

		g += P(
			"M30 -98 C46 -96 60 -84 66 -70 C56 -76 48 -78 40 -78 C44 -70 44 -62 40 -56 C34 -66 30 -78 24 -92 Z",
			p.vest,
			3.4,
		);

		g += P(
			"M-34 -96 C-46 -132 -30 -152 0 -152 C30 -152 46 -132 34 -96 Z",
			p.skin,
		);
		g +=
			S("M-12 -132 Q-6 -126 0 -132 Q6 -126 12 -132", p.dk, 2.4) +
			S("M-8 -116 H8 M-7 -106 H7", p.dk, 2.2);
		g += S("M-26 -140 C-20 -146 -12 -149 -4 -150", p.lt, 3);
		g +=
			P(
				"M-36 -146 C-30 -120 -22 -104 -16 -96 L-34 -96 C-42 -114 -44 -134 -36 -146 Z",
				p.vest,
				3,
			) +
			P(
				"M36 -146 C30 -120 22 -104 16 -96 L34 -96 C42 -114 44 -134 36 -146 Z",
				p.vest,
				3,
			);
		g +=
			S("M-34 -142 C-28 -120 -22 -106 -17 -98", p.gold, 2.6) +
			S("M34 -142 C28 -120 22 -106 17 -98", p.gold, 2.6);

		g +=
			S("M-18 -148 Q0 -132 18 -148", p.gold, 3.4) +
			P("M0 -140 L5 -134 L0 -127 L-5 -134 Z", p.glow, 2);
		g +=
			P("M-38 -104 H38 V-92 H-38 Z", p.gold, 3) +
			S("M-30 -98 H-10 M10 -98 H30", p.goldDk, 2) +
			`<circle cx="0" cy="-98" r="5" fill="#e2474a" stroke="${INK}" stroke-width="2"/>`;

		g +=
			L("M-32 -142 Q-62 -130 -46 -104", p.skin, 15) +
			G(-52, -132, 1, cuffs(0, 0, 2), " rotate(-50)") +
			G(-47, -112, 1, cuffs(0, 0, 3), " rotate(20)");
		g +=
			L("M32 -144 Q58 -150 62 -176", p.skin, 15) +
			G(48, -149, 1, cuffs(0, 0, 2), " rotate(80)") +
			G(61, -168, 1, cuffs(0, 0, 3), " rotate(-10)");
		g +=
			`<circle cx="64" cy="-198" r="24" fill="${p.glow}" opacity=".3"/>` +
			E(64, -198, 14, 14, p.sand, 3.4);
		g +=
			S(
				"M54 -202 C58 -210 70 -210 74 -202 C76 -194 66 -190 62 -196",
				p.sandDk,
				2.4,
			) + S("M54 -192 C60 -186 68 -188 74 -194", "#fff", 2);
		g +=
			star(40, -214, 5, p.glow) +
			star(88, -186, 4.4, "#fff6c8") +
			star(84, -218, 3.6, p.glow);
		g += E(63, -181, 8, 7, p.skin, 3.2);
		g += G(0, -180, 1.05, djinnHead(p));
		return g;
	}

	const SP = {
		mane: "#b5622c",
		maneDk: "#8a4420",
		c: "#d8b46a",
		dk: "#a07c3c",
		lt: "#f2d898",
		belly: "#f2e2b8",
		gold: "#e8c35a",
		goldDk: "#b8892a",
		blue: "#2f5aa8",
		blueDk: "#1f3d78",
		wing: "#3a8a9a",
		wingLt: "#7cc4c8",
		glow: "#4dffd2",
	};
	function sphinxHead(p) {
		let g = "";

		let d = "";
		for (let i = 0; i < 18; i++) {
			const a = (i / 18) * Math.PI * 2 - Math.PI / 2,
				r = i % 2 ? 34 : 46;
			d +=
				(i ? "L" : "M") +
				(Math.cos(a) * r).toFixed(1) +
				" " +
				(4 + Math.sin(a) * r * 0.96).toFixed(1) +
				" ";
		}
		g +=
			P(d + "Z", p.mane) + `<circle cx="0" cy="4" r="33" fill="${p.maneDk}"/>`;
		g += S(
			"M-30 -22 L-38 -30 M30 -22 L38 -30 M-36 8 L-44 10 M36 8 L44 10",
			p.maneDk,
			3,
		);

		g += P(
			"M0 -30 C20 -30 28 -14 28 4 C28 22 16 32 0 32 C-16 32 -28 22 -28 4 C-28 -14 -20 -30 0 -30 Z",
			p.c,
		);

		g +=
			P(
				"M-29 -18 C-14 -27 14 -27 29 -18 L28 -10 C14 -18 -14 -18 -28 -10 Z",
				p.gold,
				3,
			) + S("M-20 -17 H-12 M12 -17 H20", p.blue, 3);
		g +=
			P(
				"M0 -42 C-8 -42 -9 -32 -4 -26 L-3 -18 L3 -18 L4 -26 C9 -32 8 -42 0 -42 Z",
				p.gold,
				2.6,
			) + `<circle cx="0" cy="-34" r="2.4" fill="#e2474a"/>`;
		g += F(
			"M-16 6 C-12 -2 12 -2 16 6 C16 20 8 26 0 26 C-8 26 -16 20 -16 6 Z",
			p.belly,
		);
		g += `<circle cx="-11" cy="-4" r="11" fill="${p.glow}" opacity=".3"/><circle cx="11" cy="-4" r="11" fill="${p.glow}" opacity=".3"/>`;
		g += S("M-20 -4 L-26 0", INK, 2.8) + S("M20 -4 L26 0", INK, 2.8);
		g += eye(-11, -4, 6.4, p.glow, 0, true) + eye(11, -4, 6.4, p.glow, 0, true);
		g += S("M-19 -13 L-5 -9", INK, 3.2) + S("M19 -13 L5 -9", INK, 3.2);
		g += P("M-6 6 L6 6 L0 12 Z", "#7a4a3a", 2);
		g += S("M0 12 V15 M-7 18 Q-3 21 0 16 Q3 21 7 18", INK, 2.2);
		g += S("M14 -30 L18 -22 L14 -16 L19 -10", p.dk, 2.2);
		g +=
			P("M-6 28 L6 28 L5 46 Q0 51 -5 46 Z", p.gold, 3) +
			S("M-5 35 H5 M-5 41 H5", p.blue, 3);
		return g;
	}
	function sphinx(p) {
		let g = shadow(0, 0, 104);

		for (const sx of [-1, 1]) {
			g += P(
				`M${sx * 20} -120 C${sx * 60} -170 ${sx * 112} -170 ${sx * 124} -150 C${sx * 112} -140 ${sx * 112} -126 ${sx * 118} -112 C${sx * 104} -110 ${sx * 98} -98 ${sx * 102} -86 C${sx * 88} -86 ${sx * 80} -76 ${sx * 80} -64 C${sx * 60} -70 ${sx * 40} -80 ${sx * 26} -90 Z`,
				p.wing,
			);
			g += P(
				`M${sx * 30} -118 C${sx * 62} -152 ${sx * 100} -156 ${sx * 114} -146 C${sx * 80} -140 ${sx * 50} -124 ${sx * 34} -104 Z`,
				p.gold,
				3,
			);
			g += S(
				`M${sx * 40} -104 L${sx * 108} -116 M${sx * 40} -94 L${sx * 94} -90 M${sx * 36} -84 L${sx * 76} -70`,
				p.wingLt,
				3,
			);
		}

		g +=
			L("M44 -14 C76 -10 86 -30 78 -48", p.c, 9) +
			P("M72 -46 C70 -60 82 -66 88 -56 C88 -48 82 -44 72 -46 Z", p.dk, 3);

		g += P(
			"M-58 -4 C-70 -40 -50 -96 0 -98 C50 -96 70 -40 58 -4 Q0 6 -58 -4 Z",
			p.c,
		);
		g += P("M-26 -6 C-32 -40 -20 -74 0 -76 C20 -74 32 -40 26 -6 Z", p.belly, 0);
		g += S(
			"M-52 -40 C-56 -26 -56 -14 -52 -6 M52 -40 C56 -26 56 -14 52 -6",
			p.dk,
			3,
		);
		g += S("M-16 -40 L-10 -30 L-14 -22", p.dk, 2.2);

		g +=
			P("M-46 -96 C-30 -70 30 -70 46 -96 C40 -60 -40 -60 -46 -96 Z", p.gold) +
			S("M-42 -88 C-24 -68 24 -68 42 -88", p.blue, 5) +
			S("M-36 -78 C-20 -66 20 -66 36 -78", "#c4423a", 3.4);

		for (const sx of [-1, 1])
			g +=
				P(
					`M${sx * 12} -60 L${sx * 12} -10 Q${sx * 12} 2 ${sx * 24} 2 L${sx * 36} 2 Q${sx * 46} 2 ${sx * 42} -10 L${sx * 38} -60 Z`,
					p.c,
				) +
				S(`M${sx * 22} 2 V-5 M${sx * 30} 2 V-5 M${sx * 37} 1 V-5`, INK, 2) +
				P(`M${sx * 13} -30 H${sx * 39} V-22 H${sx * 13} Z`, p.gold, 2.6);
		g += shine(
			"M-50 -60 C-46 -76 -34 -88 -20 -92",
			"rgba(255,255,255,.4)",
			3.4,
		);
		g += `<circle cx="0" cy="-144" r="66" fill="${p.glow}" opacity=".08"/>`;
		g += G(0, -146, 1.32, sphinxHead(p));
		return g;
	}

	LGMon.add("mummy", {
		art: () => G(150, 220, 1.14, mummyBody(MU, { oneEye: 1 })),
		face: () => G(64, 68, 1.3, mummyHead(MU, { oneEye: 1 })),
	});
	LGMon.add("e_pharaoh", {
		art: () => G(150, 222, 1.0, mummyBody(PH, { pharaoh: 1 })),
		face: () => G(64, 68, 0.96, mummyHead(PH, { pharaoh: 1 })),
	});
	LGMon.add("anubis", {
		art: () => G(146, 222, 0.92, anubis(AN)),
		face: () => G(64, 82, 1.0, anubisHead(AN)),
	});
	LGMon.add("basilisk", {
		art: () => G(160, 214, 1.15, basilisk(BA)),
		face: () => G(64, 74, 0.98, basHead(BA)),
	});
	LGMon.add("djinn", {
		art: () => G(140, 220, 0.9, djinn(DJ)),
		face: () => G(64, 78, 1.14, djinnHead(DJ)),
	});
	LGMon.add("sphinx", {
		art: () => G(150, 230, 0.84, sphinx(SP)),
		face: () => G(64, 62, 0.9, sphinxHead(SP)),
	});
})();

(() => {
	const { INK, SW, o, eye, glowEye, shadow, shine, dk, lt } = LGMon;
	const ln = (d, c = INK, w = 2.2) =>
		`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
	const G = (x, y, s, inner, rot = 0) =>
		`<g transform="translate(${x},${y})${rot ? ` rotate(${rot})` : ""} scale(${s})">${inner}</g>`;

	const limb = (d, c, w = 8) =>
		`<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 4.5}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
	const scar = (d, w = 3) => ln(d, INK, w + 2.2) + ln(d, "#d9776a", w);
	const claws = (pts, c = "#f4ecd6") =>
		pts
			.map(
				([x, y, a]) =>
					`<path d="M${x - 2.4} ${y} L${x + Math.cos(a) * 9} ${y + Math.sin(a) * 9} L${x + 2.4} ${y} Z" fill="${c}" ${o(1.8)}/>`,
			)
			.join("");
	const leafBlob = (x, y, r, c) =>
		`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" ${o()}/>`;

	const SP = {
		spider: {
			body: "#7a6448",
			dk: "#4f3f2c",
			lt: "#a88e6a",
			leg: "#5f4c36",
			mark: "#c9a86a",
			eye: "#f2b544",
		},
		brood: {
			body: "#6c4f86",
			dk: "#45325a",
			lt: "#9a7cb6",
			leg: "#523c68",
			mark: "#e0c6f0",
			eye: "#ff6a4a",
		},
		queen: {
			body: "#2f2a3a",
			dk: "#1a1722",
			lt: "#5a5070",
			leg: "#26222f",
			mark: "#d8333a",
			eye: "#ff3a3a",
		},
	};
	function spider(p, f = {}) {
		let g = "";
		const LG = [
			[12, 0, 36, -26, 50, 58],
			[14, 6, 52, -14, 68, 58],
			[14, 12, 58, 2, 80, 60],
			[12, 18, 50, 22, 62, 62],
		];
		const legs = (k) =>
			LG.map(([ax, ay, kx, ky, fx, fy], i) => {
				if (f.face) {
					kx *= 0.74;
					fx *= 0.5;
					fy = 24 + i * 4;
				}
				const d = `M${ax} ${ay} L${kx} ${ky} L${fx} ${fy}`,
					d2 = `M${-ax} ${ay} L${-kx} ${ky} L${-fx} ${fy}`;
				return (
					limb(d, p.leg, f.legW || 5) +
					limb(d2, p.leg, f.legW || 5) +
					(f.spikes
						? ln(`M${kx} ${ky} l4-8 M${-kx} ${ky} l-4-8`, INK, 2.4)
						: "")
				);
			}).join("");
		if (!f.noShadow) g += shadow(0, 60, 74);

		g += `<ellipse cx="0" cy="-20" rx="${f.big ? 40 : 33}" ry="${f.big ? 34 : 29}" fill="${p.body}" ${o()}/>`;
		if (f.hourglass)
			g += `<path d="M-10-40 L10-40 L2-24 L10-8 L-10-8 L-2-24 Z" fill="${p.mark}" ${o(2.4)}/>`;
		else
			g += `<path d="M-14-38 Q0-44 14-38 M-20-26 Q0-34 20-26 M-22-12 Q0-20 22-12" fill="none" stroke="${p.mark}" stroke-width="3.4" stroke-linecap="round"/>`;
		g += shine(
			f.big ? "M-28-36 C-20-48 -6-52 6-52" : "M-22-34 C-16-44 -6-47 4-47",
			p.lt,
			3.4,
		);
		if (f.eggs)
			for (const [x, y, r] of [
				[-22, -46, 9],
				[-8, -52, 10],
				[8, -51, 9],
				[22, -44, 8],
				[-14, -40, 7],
				[14, -40, 7],
				[0, -42, 8],
			])
				g += `<circle cx="${x}" cy="${y}" r="${r}" fill="#f2ecdc" ${o(2.4)}/><circle cx="${x - r * 0.3}" cy="${y - r * 0.3}" r="${r * 0.28}" fill="#fff"/>`;
		if (f.eggs)
			g += ln("M-30-40 Q-40-30 -34-18 M30-38 Q40-28 34-18", "#f2ecdc", 2);
		g += legs();

		g += `<ellipse cx="0" cy="12" rx="${f.big ? 25 : 22}" ry="${f.big ? 20 : 18}" fill="${p.body}" ${o()}/>`;
		g += `<path d="M-16 2 C-8-6 8-6 16 2 C8 0 -8 0 -16 2 Z" fill="${p.dk}"/>`;

		g += `<path d="M-9 24 C-12 32 -8 38 -3 38 C-4 34 -4 30 -2 27 Z" fill="${p.dk}" ${o(2.6)}/><path d="M9 24 C12 32 8 38 3 38 C4 34 4 30 2 27 Z" fill="${p.dk}" ${o(2.6)}/>`;

		if (f.glow)
			g +=
				glowEye(-8, 12, 6, p.eye) +
				glowEye(8, 12, 6, p.eye) +
				glowEye(-17, 3, 3, p.eye) +
				glowEye(17, 3, 3, p.eye) +
				glowEye(-6, 0, 2.6, p.eye) +
				glowEye(6, 0, 2.6, p.eye);
		else {
			g += eye(-8, 12, 6.4, p.eye) + eye(8, 12, 6.4, p.eye);
			for (const [x, y, r] of [
				[-17, 4, 2.6],
				[17, 4, 2.6],
				[-5, 1, 2.2],
				[5, 1, 2.2],
			])
				g += `<circle cx="${x}" cy="${y}" r="${r}" fill="${INK}"/><circle cx="${x - 0.8}" cy="${y - 0.8}" r="${r * 0.35}" fill="#fff"/>`;
		}
		if (f.angry) g += ln("M-16 3 L-3 7", INK, 2.8) + ln("M16 3 L3 7", INK, 2.8);
		if (f.crown)
			g += `<path d="M-16-2 L-18-22 L-9-12 L0-28 L9-12 L18-22 L16-2 Z" fill="#e8c35a" ${o(3)}/><circle cx="0" cy="-12" r="3.4" fill="#d8333a" ${o(1.6)}/><circle cx="-11" cy="-8" r="2.2" fill="#6ac0e0"/><circle cx="11" cy="-8" r="2.2" fill="#6ac0e0"/>`;
		return g;
	}

	const web = (x, y, r) => {
		let s = "";
		for (let i = 0; i < 8; i++) {
			const a = (i * Math.PI) / 4;
			s += `M${x} ${y} L${(x + Math.cos(a) * r).toFixed(1)} ${(y + Math.sin(a) * r).toFixed(1)} `;
		}
		let rings = "";
		for (const k of [0.4, 0.7, 1]) {
			rings += "M";
			for (let i = 0; i <= 8; i++) {
				const a = (i * Math.PI) / 4;
				rings += `${(x + Math.cos(a) * r * k).toFixed(1)} ${(y + Math.sin(a) * r * k).toFixed(1)} ${i < 8 ? "L" : ""}`;
			}
		}
		return ln(s + rings, "rgba(255,255,255,.7)", 1.6);
	};
	LGMon.add("spider", {
		art: () => G(150, 150, 0.95, spider(SP.spider)),
		face: () => G(64, 70, 0.88, spider(SP.spider, { noShadow: 1, face: 1 })),
	});
	LGMon.add("broodmother", {
		art: () =>
			G(150, 146, 1.15, spider(SP.brood, { eggs: 1, angry: 1, legW: 6 })) +
			G(62, 196, 0.32, spider(SP.spider)) +
			G(244, 200, 0.28, spider(SP.spider)),
		face: () =>
			G(
				64,
				74,
				0.82,
				spider(SP.brood, { eggs: 1, angry: 1, legW: 6, noShadow: 1, face: 1 }),
			),
	});
	LGMon.add("spiderqueen", {
		art: () =>
			web(150, 96, 92) +
			G(
				150,
				144,
				1.3,
				spider(SP.queen, {
					big: 1,
					hourglass: 1,
					glow: 1,
					crown: 1,
					spikes: 1,
					legW: 6.5,
				}),
			),
		face: () =>
			G(
				64,
				74,
				0.8,
				spider(SP.queen, {
					big: 1,
					hourglass: 1,
					glow: 1,
					crown: 1,
					spikes: 1,
					legW: 6.5,
					noShadow: 1,
					face: 1,
				}),
			),
	});

	function shroom(bust) {
		let g = bust ? "" : shadow(0, 60, 44);
		if (bust)
			g += `<path d="M-19-6 C-22 10 -22 26 -18 34 C-8 40 8 40 18 34 C22 26 22 10 19-6 Z" fill="#f6efdf" ${o()}/>`;
		else {
			g += `<ellipse cx="-13" cy="56" rx="11" ry="6" fill="#efe6d2" ${o()}/><ellipse cx="13" cy="56" rx="11" ry="6" fill="#efe6d2" ${o()}/>`;
			g +=
				limb("M-18 18 L-32 30", "#efe6d2", 7) +
				limb("M18 18 L30 4", "#efe6d2", 7);
			g += `<path d="M-19-6 C-22 20 -24 38 -20 52 L20 52 C24 38 22 20 19-6 Z" fill="#f6efdf" ${o()}/>`;
			g += `<path d="M-21 18 C-10 24 10 24 21 18 L24 26 C10 34 -10 34 -24 26 Z" fill="#e9dfc8" ${o(3)}/>`;
			g += ln("M-12 36 V48 M0 38 V50 M12 36 V48", "#d9ccb2", 2);
		}
		g += `<path d="M-52-2 C-52-40 -26-60 0-60 C26-60 52-40 52-2 C32 6 -32 6 -52-2 Z" fill="#d8392b" ${o()}/>`;
		g += `<path d="M-46 0 C-28 6 28 6 46 0 C30 10 -30 10 -46 0 Z" fill="#f0e2c4" ${o(2.6)}/>`;
		for (const [x, y, rx, ry] of [
			[-30, -28, 7, 5],
			[-6, -46, 8, 5.5],
			[20, -36, 7, 5],
			[36, -14, 5, 4],
			[-40, -10, 4.5, 3.4],
			[2, -22, 5.5, 4],
			[-20, -48, 4, 3],
		])
			g += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#fff8ec" ${o(2)}/>`;
		g += shine("M-38-30 C-30-46 -16-54 -4-56", "#ff8a70", 3.4);
		g += eye(-8, 6, 5.4, "#7a3a2a") + eye(8, 6, 5.4, "#7a3a2a");
		g += ln("M-15-1 L-3 2", INK, 2.8) + ln("M15-1 L3 2", INK, 2.8);
		g += `<path d="M-6 14 Q0 10 6 14" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`;
		return g;
	}
	function toadstool(bust) {
		let g = bust ? "" : shadow(0, 60, 40);
		if (bust)
			g += `<path d="M-17-4 C-20 12 -20 28 -16 36 C-8 42 8 42 16 36 C20 28 20 12 17-4 Z" fill="#eef0da" ${o()}/>`;
		else {
			g += `<ellipse cx="-11" cy="56" rx="9" ry="5.5" fill="#dfe0c4" ${o()}/><ellipse cx="11" cy="56" rx="9" ry="5.5" fill="#dfe0c4" ${o()}/>`;
			g +=
				limb("M-15 14 C-26 22 -30 32 -28 40", "#e4e6cc", 6) +
				limb("M15 14 C26 22 30 32 28 40", "#e4e6cc", 6);
			g += `<path d="M-15-4 C-18 20 -18 40 -16 52 L16 52 C18 40 18 20 15-4 Z" fill="#eef0da" ${o()}/>`;
		}

		if (!bust)
			g += `<path transform="translate(0,14)" d="M-18 14 C-8 18 8 18 18 14 L22 24 L16 22 L14 30 L8 24 L2 32 L-4 24 L-10 30 L-12 22 L-20 26 Z" fill="#dcdcb8" ${o(2.6)}/>`;
		g += `<path d="M-46 2 C-44-26 -18-62 0-66 C18-62 44-26 46 2 C26 10 -26 10 -46 2 Z" fill="#a9bd5c" ${o()}/>`;
		g += `<path d="M-30-30 C-18-60 18-60 30-30 C18-38 -18-38 -30-30 Z" fill="#6f8a34"/>`;
		g +=
			`<path d="M-40 4 C-22 10 22 10 40 4 C24 14 -24 14 -40 4 Z" fill="#8a7a9a" ${o(2.6)}/>` +
			ln(
				"M-28 8 L-26 12 M-14 10 L-13 14 M0 11 V15 M14 10 L13 14 M28 8 L26 12",
				"#5a4a6a",
				1.6,
			);
		g += shine("M-30-20 C-24-36 -14-50 -4-56", "#eef4c8", 3.4);
		for (const [x, y, r] of [
			[-22, -16, 4.4],
			[10, -26, 3.6],
			[28, -10, 3.4],
			[-6, -44, 3],
		])
			g += `<circle cx="${x}" cy="${y}" r="${r}" fill="#e3ecb0" ${o(1.8)}/>`;

		g += `<path d="M38 8 Q34 16 38 20 Q42 16 38 8 Z M-34 10 Q-38 18 -34 22 Q-30 18 -34 10 Z" fill="#9be05a" ${o(1.8)}/>`;

		const er = bust ? 6.4 : 5;
		for (const sx of [-1, 1])
			g +=
				eye(sx * 7.5, 17, er, "#7ac83a") +
				`<path d="M${sx * 7.5 - er - 1} 15 Q${sx * 7.5} ${13 - er} ${sx * 7.5 + er + 1} 15 L${sx * 7.5 + er + 1} ${12 - er} L${sx * 7.5 - er - 1} ${12 - er} Z" fill="#eef0da"/>` +
				ln(
					`M${sx * 7.5 - er} 15 Q${sx * 7.5} 13 ${sx * 7.5 + er} 15`,
					INK,
					2.6,
				);
		g +=
			ln("M-6 28 Q-3 26 0 28 Q3 30 6 27", INK, 2.2) +
			`<ellipse cx="4" cy="31" rx="1.8" ry="2.6" fill="#9be05a" ${o(1)}/>`;
		return g;
	}
	LGMon.add("shroom", {
		art: () => G(150, 148, 1.08, shroom()),
		face: () => G(64, 74, 0.88, shroom(1)),
	});
	LGMon.add("toadstool", {
		art: () => G(150, 146, 1.08, toadstool(), -4),
		face: () => G(64, 76, 0.9, toadstool(1)),
	});

	const BD = {
		fur: "#8a8a8e",
		dk: "#5c5c62",
		lt: "#b4b4b8",
		white: "#f4f0e6",
		black: "#2e2a2c",
	};
	function bHead() {
		let g = "";
		g += `<circle cx="-24" cy="-18" r="9" fill="${BD.black}" ${o()}/><circle cx="24" cy="-18" r="9" fill="${BD.black}" ${o()}/><circle cx="-24" cy="-18" r="4" fill="${BD.white}"/><circle cx="24" cy="-18" r="4" fill="${BD.white}"/>`;
		g += `<path d="M0-30 C22-30 34-16 34 0 L38 6 L32 10 C28 24 14 34 0 36 C-14 34 -28 24 -32 10 L-38 6 L-34 0 C-34-16 -22-30 0-30 Z" fill="${BD.white}" ${o()}/>`;

		g += `<path d="M-6-29 C-12-28 -18-24 -22-12 C-24-2 -22 10 -14 18 C-12 12 -11 4 -8-6 C-6-14 -5-22 -6-29 Z" fill="${BD.black}"/><path d="M6-29 C12-28 18-24 22-12 C24-2 22 10 14 18 C12 12 11 4 8-6 C6-14 5-22 6-29 Z" fill="${BD.black}"/>`;

		g += `<path d="M-8-28 L-12-40 L-3-31 L0-44 L4-31 L12-40 L8-28 Z" fill="${BD.white}" ${o(3)}/>`;
		g += eye(-13, -2, 5.6, "#e8503a") + eye(13, -2, 5.6, "#e8503a");
		g += ln("M-22-12 L-6-6", "#fff", 3) + ln("M22-12 L6-6", "#fff", 3);
		g += `<path d="M-7 18 Q0 14 7 18 Q6 24 0 25 Q-6 24 -7 18 Z" fill="${INK}"/><ellipse cx="-2" cy="18.4" rx="1.8" ry="1" fill="#8a7a72"/>`;
		g += `<path d="M-8 28 Q0 25 8 28 Q5 34 0 34 Q-5 34 -8 28 Z" fill="#8a2f2f" ${o(1.8)}/><path d="M-5 28 L-4 31 L-3 28 M3 28 L4 31 L5 28" fill="#fff" stroke="${INK}" stroke-width="1"/>`;
		return g;
	}
	function badger() {
		let g = shadow(6, 60, 66);
		g += `<path d="M48-2 C60-4 66 4 62 12 C56 10 52 8 46 8 Z" fill="${BD.lt}" ${o()}/>`;

		const lgF = (x, c, step = 0) => {
			const px = x + step,
				py = 60 - Math.abs(step) * 0.3;
			return (
				`<path d="M${x - 9} 16 Q${x - 15 + step * 0.4} 36 ${px - 6} ${py - 7} L${px + 7} ${py - 7} Q${x + 7 + step * 0.4} 34 ${x + 9} 16 Z" fill="${c}" ${o()}/>` +
				`<path d="M${px - 11} ${py} Q${px - 11} ${py - 9} ${px} ${py - 9} Q${px + 9} ${py - 9} ${px + 9} ${py} Z" fill="${c}" ${o()}/>` +
				claws([
					[px - 9, py - 2, Math.PI * 0.97],
					[px - 6, py - 0.5, Math.PI * 0.9],
					[px - 2, py, Math.PI * 0.8],
				])
			);
		};
		const lgH = (x, c, step = 0) => {
			const px = x + step - 2,
				py = 60 - Math.abs(step) * 0.3;
			return (
				`<path d="M${x - 13} 10 C${x - 16} 26 ${x - 6} 32 ${px - 6} ${py - 7} L${px + 7} ${py - 7} L${x + 9} 38 C${x + 14} 30 ${x + 14} 18 ${x + 11} 10 Z" fill="${c}" ${o()}/>` +
				`<path d="M${px - 10} ${py} Q${px - 10} ${py - 9} ${px} ${py - 9} Q${px + 9} ${py - 9} ${px + 9} ${py} Z" fill="${c}" ${o()}/>` +
				claws([
					[px - 8, py - 1, Math.PI * 0.95],
					[px - 4, py, Math.PI * 0.85],
				])
			);
		};
		g += lgF(-14, "#1f1b1d", 6) + lgH(40, "#1f1b1d", -6);
		g += `<path d="M-42 6 C-46-20 -20-30 8-30 C36-30 56-20 56 4 C56 24 44 32 30 32 L-24 32 C-38 32 -42 22 -42 6 Z" fill="${BD.fur}" ${o()}/>`;

		g += `<path d="M-24-24 L-20-36 L-12-28 L-6-40 L2-30 L10-40 L16-30 L26-38 L30-28 L40-34 L42-22 C20-28 -4-28 -24-24 Z" fill="${BD.fur}" ${o(3)}/>`;
		g += `<path d="M-30 30 C-12 22 20 22 40 30 Z" fill="${BD.black}"/>`;
		g +=
			ln("M0-20 l-3 8 M14-22 l-3 8 M28-20 l-3 8 M40-14 l-3 7", BD.dk, 2.4) +
			shine("M-6-24 C8-26 22-26 34-22", BD.lt, 3);
		g += lgF(-30, BD.black, -10) + lgH(26, BD.black, 8);
		g += G(-40, -4, 0.92, bHead(), -10);
		return g;
	}
	LGMon.add("badger", {
		art: () => G(146, 146, 1.08, badger()),
		face: () => G(64, 64, 1.12, bHead()),
	});

	const BR = {
		fur: "#7a4e30",
		dk: "#523320",
		lt: "#a8764e",
		belly: "#c79a6a",
		muzzle: "#e0c09a",
		ear: "#c98a6a",
	};
	function brHead(p = BR) {
		let g = "";
		g += `<circle cx="-25" cy="-22" r="12" fill="${p.fur}" ${o()}/><circle cx="25" cy="-22" r="12" fill="${p.fur}" ${o()}/><circle cx="-25" cy="-22" r="6" fill="${p.ear}"/><circle cx="25" cy="-22" r="6" fill="${p.ear}"/>`;
		g += `<path d="M0-32 C24-32 36-18 36 2 C36 22 22 33 0 33 C-22 33 -36 22 -36 2 C-36-18 -24-32 0-32 Z" fill="${p.fur}" ${o()}/>`;
		g +=
			`<path d="M-22-22 C-12-30 12-30 22-22 C12-24 -12-24 -22-22 Z" fill="${p.dk}"/>` +
			shine("M-16-26 C-8-29 0-29 6-28", p.lt, 3);
		g += `<ellipse cx="0" cy="14" rx="18" ry="14" fill="${p.muzzle}" ${o(3)}/>`;
		g += eye(-14, -4, 5.4, "#e8a83a") + eye(14, -4, 5.4, "#e8a83a");
		g += ln("M-22-13 L-7-8", INK, 3) + ln("M22-13 L7-8", INK, 3);
		g += `<path d="M-8 6 Q0 2 8 6 Q7 12 0 13 Q-7 12 -8 6 Z" fill="${INK}"/><ellipse cx="-2.4" cy="6.6" rx="2" ry="1.1" fill="#8a7a72"/>`;
		g += `<path d="M-10 18 Q0 15 10 18 Q7 28 0 28 Q-7 28 -10 18 Z" fill="#8a2f2f" ${o(2)}/><path d="M-8 18 L-6 23 L-4 18 Z M4 18 L6 23 L8 18 Z" fill="#fff" stroke="${INK}" stroke-width="1.1"/>`;
		return g;
	}
	function bear() {
		let g = shadow(0, 60, 60);
		g +=
			`<ellipse cx="-22" cy="54" rx="17" ry="8" fill="${BR.dk}" ${o()}/><ellipse cx="22" cy="54" rx="17" ry="8" fill="${BR.dk}" ${o()}/>` +
			claws([
				[-34, 56, Math.PI * 0.8],
				[-28, 58, Math.PI * 0.7],
				[34, 56, Math.PI * 0.2],
				[28, 58, Math.PI * 0.3],
			]);
		g += `<path d="M0-44 C32-44 48-18 48 14 C48 42 30 54 0 54 C-30 54 -48 42 -48 14 C-48-18 -32-44 0-44 Z" fill="${BR.fur}" ${o()}/>`;
		g +=
			`<ellipse cx="0" cy="20" rx="27" ry="30" fill="${BR.belly}"/>` +
			ln("M-12 6 l3 4 M8 0 l3 4 M-4 24 l3 4 M10 30 l3 4", dk(BR.belly, 0.2), 2);
		g += shine("M-36-14 C-32-28 -22-38 -10-41", BR.lt, 3.4);

		g +=
			limb("M-38-20 C-56-28 -64-46 -60-62", BR.fur, 15) +
			`<ellipse cx="-60" cy="-66" rx="12" ry="11" fill="${BR.fur}" ${o()}/>` +
			claws([
				[-68, -72, -Math.PI * 0.75],
				[-62, -76, -Math.PI * 0.6],
				[-55, -76, -Math.PI * 0.45],
			]);
		g +=
			limb("M40-16 C54-4 58 12 54 26", BR.fur, 15) +
			`<ellipse cx="54" cy="30" rx="11" ry="10" fill="${BR.fur}" ${o()}/>` +
			claws([
				[48, 38, Math.PI * 0.6],
				[54, 39, Math.PI * 0.5],
				[60, 38, Math.PI * 0.4],
			]);
		g += G(0, -50, 1, brHead());
		return g;
	}
	LGMon.add("bear", {
		art: () => G(150, 146, 1.08, bear()),
		face: () => G(64, 66, 1.12, brHead()),
	});

	const WW = {
		fur: "#5a5266",
		dk: "#36303f",
		lt: "#857c94",
		belly: "#a89cb2",
		ear: "#b97a86",
		eye: "#ffd23a",
		pants: "#3e5578",
	};
	function wwHead(p = WW) {
		let g = "";

		g += `<path d="M-30-20 L-48-26 L-40-10 L-54-2 L-40 6 L-48 20 L-30 18 L-26 34 L-14 26 L0 40 L14 26 L26 34 L30 18 L48 20 L40 6 L54-2 L40-10 L48-26 L30-20 Z" fill="${p.dk}" ${o()}/>`;
		g += `<path d="M-22-14 L-28-54 L-20-46 L-18-52 Q-8-40 -6-24 Z" fill="${p.fur}" ${o()}/><path d="M22-14 L28-54 Q10-42 6-24 Z" fill="${p.fur}" ${o()}/>`;
		g += `<path d="M-21-20 L-24-44 Q-15-38 -12-26 Z M21-20 L24-44 Q15-38 12-26 Z" fill="${p.ear}"/>`;
		g += `<path d="M0-32 C18-32 30-20 30-4 C30 8 24 18 16 24 L12 36 C6 42 -6 42 -12 36 L-16 24 C-24 18 -30 8 -30-4 C-30-20 -18-32 0-32 Z" fill="${p.fur}" ${o()}/>`;
		g += `<path d="M-12 4 C-12-4 12-4 12 4 L13 30 C8 36 -8 36 -13 30 Z" fill="${p.belly}"/>`;
		g += `<path d="M-24-16 C-14-28 14-28 24-16 C14-20 6-18 3-10 L0 0 L-3-10 C-6-18 -14-20 -24-16 Z" fill="${p.dk}"/>`;
		g += glowEye(-12, -6, 5.4, p.eye) + glowEye(12, -6, 5.4, p.eye);
		g += ln("M-22-16 L-5-9", INK, 3.4) + ln("M22-16 L5-9", INK, 3.4);
		g +=
			`<path d="M-7 12 Q0 8 7 12 Q6 18 0 19 Q-6 18 -7 12 Z" fill="${INK}"/>` +
			ln("M-6 5 l-4-3 M6 5 l4-3", p.dk, 2);
		g += `<path d="M-13 22 Q0 19 13 22 L11 36 Q0 42 -11 36 Z" fill="#6a1f2a" ${o(2.4)}/>`;
		g += `<path d="M-11 22 L-8 31 L-5 22 Z M5 22 L8 31 L11 22 Z M-9 38 L-6 31 L-3 37 Z M3 37 L6 31 L9 38 Z" fill="#fff" stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"/>`;
		g += scar("M10-26 L20-2", 2.6);
		return g;
	}
	function werewolf() {
		let g = shadow(0, 60, 54);

		g +=
			limb("M-14 18 L-22 38 L-14 56", WW.fur, 13) +
			limb("M14 18 L22 38 L14 56", WW.fur, 13);
		g +=
			`<path d="M-24 56 L-6 56 L-8 60 L-28 60 Z M24 56 L6 56 L8 60 L28 60 Z" fill="${WW.dk}" ${o(3)}/>` +
			claws([
				[-26, 60, Math.PI * 0.9],
				[-20, 61, Math.PI * 0.75],
				[26, 60, Math.PI * 0.1],
				[20, 61, Math.PI * 0.25],
			]);
		g += `<path d="M-26 10 L-30 34 L-24 30 L-20 38 L-14 32 L-6 36 L0 24 L6 36 L14 32 L20 38 L24 30 L30 34 L26 10 Z" fill="${WW.pants}" ${o()}/>`;

		g += `<path d="M-40-30 C-30-42 30-42 40-30 C44-14 34 4 24 12 L-24 12 C-34 4 -44-14 -40-30 Z" fill="${WW.fur}" ${o()}/>`;
		g +=
			`<path d="M-18-24 C-8-30 8-30 18-24 C20-10 14 4 0 8 C-14 4 -20-10 -18-24 Z" fill="${WW.belly}"/>` +
			ln("M0-22 V4 M-12-10 Q-6-6 0-10 Q6-6 12-10", dk(WW.belly, 0.25), 2);
		g += shine("M-34-30 C-28-36 -18-39 -8-40", WW.lt, 3);

		g +=
			limb("M-36-28 C-54-26 -64-40 -66-58", WW.fur, 13) +
			claws([
				[-72, -62, -Math.PI * 0.8],
				[-67, -66, -Math.PI * 0.6],
				[-61, -66, -Math.PI * 0.42],
			]) +
			`<circle cx="-66" cy="-60" r="9" fill="${WW.dk}" ${o()}/>`;
		g +=
			limb("M36-28 C54-26 64-40 66-58", WW.fur, 13) +
			claws([
				[72, -62, -Math.PI * 0.2],
				[67, -66, -Math.PI * 0.4],
				[61, -66, -Math.PI * 0.58],
			]) +
			`<circle cx="66" cy="-60" r="9" fill="${WW.dk}" ${o()}/>`;
		g += G(0, -50, 0.92, wwHead());
		return g;
	}
	LGMon.add("werewolf", {
		art: () =>
			`<circle cx="214" cy="62" r="34" fill="#f4efd8" ${o(3)}/><circle cx="204" cy="56" r="6" fill="#e2dcc0"/><circle cx="222" cy="72" r="4" fill="#e2dcc0"/>` +
			G(146, 146, 1.12, werewolf()),
		face: () => G(64, 66, 0.92, wwHead()),
	});

	const WD = {
		bark: "#7a5a3a",
		dk: "#4f3a26",
		lt: "#a8845a",
		ring: "#d9b98a",
		moss: "#6aa040",
		mossDk: "#47782c",
		glow: "#b8ff6a",
	};
	function leshakHead(p = WD) {
		let g = `<path d="M-30 40 L-28-6 C-28-18 28-18 28-6 L30 40 Z" fill="${p.bark}" ${o()}/>`;
		g += leshakTop(p) + leshakFace(p, 6);
		return g;
	}
	function leshakTop(p) {
		let g = `<path d="M-14-14 C-18-26 -24-34 -32-40 M-22-26 L-34-28 M14-14 C16-28 24-36 34-40 M22-28 L32-24" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M-14-14 C-18-26 -24-34 -32-40 M-22-26 L-34-28 M14-14 C16-28 24-36 34-40 M22-28 L32-24" fill="none" stroke="${p.lt}" stroke-width="3" stroke-linecap="round"/>`;
		g += `<path d="M-34-40 q-6-6 2-10 q6 4 -2 10 Z M34-40 q6-6 -2-10 q-6 4 2 10 Z" fill="${p.moss}" ${o(2)}/>`;
		g +=
			`<ellipse cx="0" cy="-8" rx="28" ry="9" fill="${p.ring}" ${o()}/>` +
			`<ellipse cx="0" cy="-8" rx="17" ry="5" fill="none" stroke="${dk(p.ring, 0.2)}" stroke-width="1.8"/><ellipse cx="0" cy="-8" rx="8" ry="2.4" fill="none" stroke="${dk(p.ring, 0.2)}" stroke-width="1.8"/>`;
		g += `<path d="M-30-6 C-30-2 -26 8 -22 4 C-20 12 -14 10 -12 4 C-8 10 -2 4 -2 0 L-26-4 Z" fill="${p.moss}" ${o(2.6)}/><path d="M30-6 C30 0 26 10 22 4 C18 10 14 6 14 2 L26-4 Z" fill="${p.moss}" ${o(2.6)}/>`;
		return g;
	}
	function leshakFace(p, y) {
		let g = `<ellipse cx="-11" cy="${y + 8}" rx="8" ry="9" fill="${INK}"/><ellipse cx="11" cy="${y + 8}" rx="8" ry="9" fill="${INK}"/>`;
		g += glowEye(-11, y + 8, 4.4, p.glow) + glowEye(11, y + 8, 4.4, p.glow);
		g += `<path d="M-8 ${y + 22} Q0 ${y + 18} 8 ${y + 22} Q4 ${y + 30} 0 ${y + 30} Q-4 ${y + 30} -8 ${y + 22} Z" fill="${INK}"/>`;
		g += ln(
			`M-22 ${y + 4} L-22 ${y + 24} M22 ${y + 2} L21 ${y + 20} M-4 ${y - 2} L-3 ${y + 2}`,
			p.dk,
			2,
		);
		return g;
	}
	function leshak(p = WD) {
		let g = shadow(0, 60, 50);

		g += `<path d="M-30 46 C-38 52 -44 56 -48 60 L-30 60 L-20 50 Z M30 46 C38 52 44 56 48 60 L30 60 L20 50 Z M-8 50 L-12 60 L0 60 L4 50 Z" fill="${p.dk}" ${o()}/>`;

		g +=
			limb("M-26 14 L-44 4 L-50-8", p.bark, 6) +
			limb("M-44 4 L-56 6", p.bark, 4) +
			limb("M26 16 L44 22 L52 12", p.bark, 6);
		g += `<path d="M-52-10 q-8-4 -4-12 q8 2 4 12 Z M54 10 q8-4 4-12 q-8 2 -4 12 Z" fill="${p.moss}" ${o(2)}/>`;
		g += `<path d="M-30 52 L-28-6 C-28-18 28-18 28-6 L30 52 Z" fill="${p.bark}" ${o()}/>`;
		g += ln("M-20 30 L-21 48 M18 30 L20 50 M-6 36 L-4 50 M6 34 V46", p.dk, 2.2);
		g += shine("M-23 0 L-24 40", p.lt, 3);

		g += `<path d="M26 34 L36 34 L34 44 L28 44 Z" fill="#f2e6cc" ${o(2.4)}/><path d="M22 36 C22 26 40 26 40 36 Z" fill="#c9752e" ${o(2.4)}/>`;
		g += leshakTop(p) + leshakFace(p, 2);
		return g;
	}
	LGMon.add("leshak", {
		art: () => G(150, 150, 1.12, leshak()),
		face: () => G(64, 70, 1.05, leshakHead()),
	});

	const TR = {
		bark: "#6e5038",
		dk: "#47321f",
		lt: "#9a7652",
		leaf: "#5d9a3a",
		leafDk: "#3f7426",
		leafLt: "#8cc45a",
		glow: "#ffc94a",
	};
	function trCrown(p = TR) {
		let g = "";
		for (const [x, y, r] of [
			[-44, -40, 22],
			[44, -40, 22],
			[-26, -64, 26],
			[26, -64, 26],
			[0, -78, 28],
			[-50, -16, 16],
			[50, -16, 16],
		])
			g += leafBlob(x, y, r, p.leafDk);
		for (const [x, y, r] of [
			[-22, -60, 18],
			[20, -66, 16],
			[0, -80, 18],
			[-40, -40, 12],
			[42, -42, 12],
		])
			g += `<circle cx="${x}" cy="${y}" r="${r}" fill="${p.leaf}"/>`;
		g +=
			shine("M-34-76 C-26-90 -10-98 6-98", p.leafLt, 3.4) +
			shine("M30-80 C36-76 40-70 42-62", p.leafLt, 3);
		return g;
	}
	function trFace(p = TR) {
		let g = `<path d="M-26-12 C-20-20 -6-18 -4-8 C-8-2 -22-2 -26-12 Z" fill="${INK}"/><path d="M26-12 C20-20 6-18 4-8 C8-2 22-2 26-12 Z" fill="${INK}"/>`;
		g += glowEye(-15, -10, 4.4, p.glow) + glowEye(15, -10, 4.4, p.glow);
		g += `<path d="M-30-24 L-2-14 M30-24 L2-14" stroke="${p.dk}" stroke-width="5" stroke-linecap="round"/>`;
		g += `<path d="M-4-6 C-6 2 -2 8 2 8 C6 6 4 0 4-6 Z" fill="${p.lt}" ${o(2.4)}/>`;
		g += `<path d="M-16 14 C-8 10 8 10 16 14 C12 24 -12 24 -16 14 Z" fill="${INK}"/><path d="M-10 13 L-8 18 L-6 12 M6 12 L8 18 L10 13" fill="${p.lt}" stroke="none"/>`;
		return g;
	}
	function treant(p = TR) {
		let g = shadow(0, 60, 64);

		g +=
			limb("M-26-26 C-46-30 -62-24 -70-6 M-50-28 L-64-46", p.bark, 10) +
			limb("M26-26 C46-34 60-30 70-14 M54-30 L62-50", p.bark, 10);
		for (const [x, y, r] of [
			[-72, -2, 14],
			[-64, -50, 12],
			[72, -10, 14],
			[62, -54, 12],
		])
			g += leafBlob(x, y, r, p.leaf);

		g += `<path d="M-34 60 L-56 60 C-44 54 -36 46 -32 36 L-30-30 C-30-44 30-44 30-30 L32 36 C36 46 44 54 56 60 L34 60 L22 52 L12 60 L-12 60 L-22 52 Z" fill="${p.bark}" ${o()}/>`;
		g += ln(
			"M-20 20 C-22 32 -20 44 -24 52 M18 24 C20 36 18 44 22 52 M-6 30 V48 M8 34 V46 M-18-30 C-20-24 -20-18 -18-14 M20-30 C22-22 20-18 18-14",
			p.dk,
			2.6,
		);
		g += shine("M-24-28 L-25 30", p.lt, 3);

		g += `<path d="M-30 30 C-24 34 -16 40 -14 46" fill="none" stroke="#6aa040" stroke-width="6" stroke-linecap="round"/>`;
		g += trCrown(p);
		g += G(0, 6, 1, trFace(p));
		return g;
	}
	LGMon.add("treant", {
		art: () => G(150, 150, 0.98, treant()),
		face: () => {
			let g = "";
			for (const [x, y, r] of [
				[30, 56, 13],
				[98, 56, 13],
				[40, 36, 17],
				[88, 36, 17],
				[64, 26, 19],
			])
				g += leafBlob(x, y, r, TR.leafDk);
			for (const [x, y, r] of [
				[42, 34, 10],
				[64, 24, 11],
				[86, 34, 10],
			])
				g += `<circle cx="${x}" cy="${y}" r="${r}" fill="${TR.leaf}"/>`;
			g += `<path d="M34 54 C34 44 94 44 94 54 L93 90 C90 106 38 106 35 90 Z" fill="${TR.bark}" ${o()}/>`;
			g += ln(
				"M40 58 C38 70 40 84 42 94 M88 58 C90 70 88 84 86 94",
				TR.dk,
				2.4,
			);
			g += `<path d="M38 60 L60 66 M90 60 L68 66" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
			g += `<ellipse cx="51" cy="71" rx="10.5" ry="8.5" fill="${INK}"/><ellipse cx="77" cy="71" rx="10.5" ry="8.5" fill="${INK}"/>`;
			g += glowEye(51, 71, 5.6, TR.glow) + glowEye(77, 71, 5.6, TR.glow);
			g += `<path d="M61 76 C59 82 62 86 64 86 C67 86 69 82 67 76 Z" fill="${TR.lt}" ${o(2.4)}/>`;
			g += `<path d="M48 90 C56 86 72 86 80 90 C76 100 52 100 48 90 Z" fill="${INK}"/><path d="M54 89 L56 94 L58 88 M70 88 L72 94 L74 89" fill="${TR.lt}"/>`;
			return g;
		},
	});

	const LS = {
		bark: "#6a5236",
		dk: "#463422",
		lt: "#987650",
		skin: "#9a8a5a",
		beard: "#a8c47a",
		beardDk: "#6f9248",
		leaf: "#5f9a3a",
		glow: "#b8ff6a",
		antler: "#c9b088",
	};
	function lsAntlers(p = LS) {
		const d =
			"M-14-26 C-22-40 -30-50 -42-58 M-26-44 L-40-40 M-34-52 L-36-66 M14-26 C22-40 30-50 42-58 M26-44 L40-40 M34-52 L36-66";
		return (
			`<path d="${d}" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${p.antler}" stroke-width="4.5" stroke-linecap="round"/>` +
			`<path d="M-44-58 q-8-2 -6-10 q8 0 6 10 Z M44-58 q8-2 6-10 q-8 0 -6 10 Z M-40-40 q-8 2 -10-4 q6-4 10 4 Z M40-40 q8 2 10-4 q-6-4 -10 4 Z" fill="${p.leaf}" ${o(2)}/>`
		);
	}
	function lsHead(p = LS) {
		let g = lsAntlers(p);

		g += `<path d="M-30 0 C-36-20 -24-36 0-36 C24-36 36-20 30 0 L36 10 L26 8 L28 20 L-28 20 L-26 8 L-36 10 Z" fill="${p.leaf}" ${o()}/>`;
		g += `<path d="M0-30 C18-30 26-18 26-2 C26 14 16 22 0 22 C-16 22 -26 14 -26-2 C-26-18 -18-30 0-30 Z" fill="${p.skin}" ${o()}/>`;
		g += ln(
			"M-18-20 Q-10-24 -4-20 M6-24 Q12-26 18-20 M-20 2 L-22 12",
			dk(p.skin, 0.25),
			1.8,
		);

		g += `<path d="M-24 4 C-26 22 -20 38 -8 46 L-6 38 L0 50 L4 38 L10 46 C20 38 26 22 24 4 C14 12 -14 12 -24 4 Z" fill="${p.beard}" ${o()}/>`;
		g += ln(
			"M-14 18 Q-12 28 -8 34 M0 18 V36 M12 18 Q10 28 8 34",
			p.beardDk,
			2.2,
		);
		g += `<path d="M-14 8 C-8 4 -2 8 0 10 C2 8 8 4 14 8 C10 14 4 12 0 12 C-4 12 -10 14 -14 8 Z" fill="${p.beardDk}" ${o(2)}/>`;
		g += glowEye(-10, -6, 5, p.glow) + glowEye(10, -6, 5, p.glow);
		g += `<path d="M-22-16 C-16-20 -8-18 -3-12 L-6-11 C-10-15 -16-15 -22-14 Z M22-16 C16-20 8-18 3-12 L6-11 C10-15 16-15 22-14 Z" fill="${p.beard}" ${o(2)}/>`;
		g += `<path d="M0-6 C-4 0 -5 4 -2 6 L2 6 C5 4 4 0 0-6 Z" fill="${dk(p.skin, 0.15)}" ${o(2.2)}/>`;
		return g;
	}
	function leshy(p = LS) {
		let g = shadow(0, 60, 56);

		g +=
			limb("M44 60 L50-50", p.bark, 6) +
			`<path d="M50-50 C40-58 42-70 50-74 C58-70 60-58 50-50 Z" fill="${p.leaf}" ${o(3)}/>`;
		g += `<circle cx="50" cy="-82" r="14" fill="${p.glow}" opacity=".3"/><circle cx="50" cy="-82" r="7" fill="${p.glow}" ${o(2.4)}/><circle cx="48" cy="-84" r="2.4" fill="#fff"/>`;

		g += `<path d="M-20-24 C-36-20 -44 10 -46 56 L-30 52 L-22 60 L-10 52 L0 60 L10 52 L22 60 L30 52 L46 56 C44 10 36-20 20-24 Z" fill="${p.bark}" ${o()}/>`;
		g += `<path d="M-30-14 L-40 2 L-26-2 L-34 18 L-20 8 M30-14 L40 2 L26-2 L34 18 L20 8" fill="${p.leaf}" ${o(2.4)}/>`;
		g +=
			ln(
				"M-26 20 L-30 46 M-12 24 L-14 50 M14 24 L14 50 M28 20 L32 46",
				p.dk,
				2.4,
			) + shine("M-34 0 C-38 18 -40 34 -40 48", p.lt, 3);

		g += `<path d="M-34 14 C-12 22 12 22 34 14" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M-34 14 C-12 22 12 22 34 14" fill="none" stroke="#6aa040" stroke-width="3.4" stroke-linecap="round"/>`;

		g +=
			limb("M24-16 C36-10 44-8 48-6", p.bark, 9) +
			`<circle cx="48" cy="-6" r="7" fill="${p.skin}" ${o(3)}/>`;
		g +=
			limb("M-24-16 C-38-8 -50-12 -58-22", p.bark, 9) +
			`<path d="M-58-22 L-70-28 M-58-22 L-68-18 M-58-22 L-64-34" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="M-58-22 L-70-28 M-58-22 L-68-18 M-58-22 L-64-34" stroke="${p.antler}" stroke-width="2.6" stroke-linecap="round"/>`;
		g += G(0, -50, 1, lsHead(p));

		for (const [x, y] of [
			[-64, -60],
			[-76, 10],
			[70, 20],
			[-50, 40],
		])
			g += `<circle cx="${x}" cy="${y}" r="5" fill="${p.glow}" opacity=".35"/><circle cx="${x}" cy="${y}" r="2.2" fill="${p.glow}"/>`;
		return g;
	}
	LGMon.add("e_leshy", {
		art: () =>
			`<circle cx="150" cy="110" r="84" fill="#d8f5a8" opacity=".3"/>` +
			G(148, 148, 1.12, leshy()),
		face: () => G(64, 66, 0.82, lsHead()),
	});

	const NS = {
		fur: "#2f2a3c",
		dk: "#1b1824",
		lt: "#56506c",
		bone: "#ddd4ea",
		fire: "#a58cff",
		eye: "#ff4040",
	};
	function nsAntlers(p = NS, big = 1) {
		const d =
			"M-10-20 C-18-36 -30-46 -44-50 M-22-36 L-32-58 M-34-46 L-52-42 M-28-42 L-40-68 M10-20 C18-36 30-46 44-50 M22-36 L32-58 M34-46 L52-42 M28-42 L40-68";
		let g = `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${8 * big}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${p.bone}" stroke-width="${4 * big}" stroke-linecap="round" stroke-linejoin="round"/>`;
		for (const [x, y] of [
			[-44, -50],
			[-32, -58],
			[-52, -42],
			[-40, -68],
			[44, -50],
			[32, -58],
			[52, -42],
			[40, -68],
		])
			g += `<circle cx="${x}" cy="${y}" r="5" fill="${p.fire}" opacity=".45"/><circle cx="${x}" cy="${y}" r="2" fill="#fff"/>`;
		return g;
	}
	function nsHead(p = NS) {
		let g = nsAntlers(p);
		g += `<path d="M-14-14 L-36-18 Q-28-4 -14-4 Z M14-14 L36-18 Q28-4 14-4 Z" fill="${p.fur}" ${o()}/><path d="M-17-12 L-30-15 Q-25-8 -17-7 Z M17-12 L30-15 Q25-8 17-7 Z" fill="#6a4a7a"/>`;
		g += `<path d="M0-26 C14-26 20-14 18 2 L12 28 C8 36 -8 36 -12 28 L-18 2 C-20-14 -14-26 0-26 Z" fill="${p.fur}" ${o()}/>`;

		g += `<path d="M0-22 C10-22 15-12 13 0 L8 22 C5 27 -5 27 -8 22 L-13 0 C-15-12 -10-22 0-22 Z" fill="${p.bone}" ${o(3)}/>`;
		g += `<path d="M-12-8 C-8-12 -3-10 -3-4 C-6 0 -11-2 -12-8 Z M12-8 C8-12 3-10 3-4 C6 0 11-2 12-8 Z" fill="${INK}"/>`;
		g += glowEye(-7.5, -6, 3.6, p.eye) + glowEye(7.5, -6, 3.6, p.eye);
		g +=
			`<path d="M-4 16 L-2 20 M4 16 L2 20" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>` +
			ln("M-6 24 L6 24 M-3 22 V26 M0 22 V26 M3 22 V26", INK, 1.6);
		g += ln("M0-18 V-12", dk(p.bone, 0.3), 2);
		return g;
	}
	function nightstag(p = NS) {
		let g = shadow(6, 60, 70);

		g += `<path d="M-60 56 C-50 46 -36 52 -30 46 C-20 40 -8 50 0 46 C10 40 24 50 34 44 C46 40 56 50 70 56 C50 62 -40 62 -60 56 Z" fill="${p.fire}" opacity=".35"/>`;
		const lg = (x, c) =>
			`<path d="M${x - 5} 8 L${x - 4} 52 L${x + 5} 52 L${x + 5} 8 Z" fill="${c}" ${o()}/><path d="M${x - 5} 50 L${x + 6} 50 L${x + 7} 60 L${x - 6} 60 Z" fill="${p.bone}" ${o(3)}/>`;
		g += lg(-14, p.dk) + lg(42, p.dk);
		g += `<path d="M50-12 C58-16 62-6 56-2 Z" fill="${p.fur}" ${o(3)}/>`;
		g += `<path d="M-40-4 C-42-24 -18-30 12-28 C42-28 58-18 58 2 C58 18 48 26 34 26 L-24 26 C-36 26 -40 14 -40-4 Z" fill="${p.fur}" ${o()}/>`;

		g += ln(
			"M4-20 C0-8 0 4 4 14 M14-22 C10-8 10 6 14 16 M24-22 C20-8 20 6 24 16",
			p.bone,
			2.6,
		);
		g += shine("M-14-24 C2-27 18-27 32-24", p.lt, 3);
		g += `<path d="M-34-10 L-48-20 L-40-4 Z" fill="${p.fur}" ${o(3)}/>`;
		g += lg(-30, p.fur) + lg(28, p.fur);

		g += `<path d="M-46-30 C-34-20 -28-12 -24 0 L-34 4 C-38-6 -46-16 -54-22 Z" fill="${p.fire}" opacity=".5"/>`;
		g += G(-42, -42, 1, nsHead(p));
		return g;
	}
	LGMon.add("nightstag", {
		art: () =>
			`<circle cx="150" cy="108" r="86" fill="#b9a8ff" opacity=".22"/>` +
			G(148, 150, 1.18, nightstag()),
		face: () => G(64, 72, 0.78, nsHead()),
	});

	const TH = {
		moss: "#4f7f34",
		mossDk: "#34581f",
		mossLt: "#7cae4e",
		bark: "#5e4532",
		barkDk: "#3a2a1c",
		barkLt: "#86664a",
		mask: "#e8dcbc",
		maskDk: "#b8a882",
		glow: "#7dffb0",
		antler: "#7a5a3a",
	};
	const mossEdge = (x0, x1, y, c) => {
		let d = `M${x0} ${y}`;
		const n = Math.round((x1 - x0) / 10);
		for (let i = 0; i < n; i++) {
			const a = x0 + ((x1 - x0) * i) / n,
				b = x0 + ((x1 - x0) * (i + 1)) / n;
			d += ` Q${(a + b) / 2} ${y + (i % 2 ? 9 : 13)} ${b} ${y}`;
		}
		return `<path d="${d} L${x1} ${y - 8} L${x0} ${y - 8} Z" fill="${c}" ${o(3)}/>`;
	};
	const knot = (x, y, r, c) =>
		`<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.7}" fill="${dk(c, 0.25)}" ${o(2.4)}/><ellipse cx="${x}" cy="${y}" rx="${r * 0.45}" ry="${r * 0.3}" fill="none" stroke="${lt(c, 0.25)}" stroke-width="1.6"/>`;
	function thHead(p = TH) {
		const d =
			"M-14-24 C-22-36 -32-42 -46-44 M-26-36 L-30-54 M-38-42 L-54-32 M-40-43 L-50-58 M14-24 C22-36 32-42 46-44 M26-36 L30-54 M38-42 L54-32 M40-43 L50-58";
		let g = `<path d="${d}" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${p.antler}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`;
		for (const [x, y, r] of [
			[-46, -44, 8],
			[-30, -54, 7],
			[-54, -32, 6.5],
			[-50, -58, 6.5],
			[46, -44, 8],
			[30, -54, 7],
			[54, -32, 6.5],
			[50, -58, 6.5],
		])
			g += `<circle cx="${x}" cy="${y}" r="${r}" fill="${p.moss}" ${o(2.6)}/><circle cx="${x - r * 0.3}" cy="${y - r * 0.3}" r="${r * 0.35}" fill="${p.mossLt}"/>`;
		g += `<path d="M0-36 C26-36 40-18 40 6 L46 22 L34 20 L36 34 L-36 34 L-34 20 L-46 22 L-40 6 C-40-18 -26-36 0-36 Z" fill="${p.moss}" ${o()}/>`;
		g += `<path d="M-30-14 C-20-30 20-30 30-14" fill="none" stroke="${p.mossLt}" stroke-width="3.4" stroke-linecap="round"/>`;
		g += `<path d="M0-28 C18-28 26-16 26 0 C26 14 18 22 12 26 L8 36 L-8 36 L-12 26 C-18 22 -26 14 -26 0 C-26-16 -18-28 0-28 Z" fill="${p.mask}" ${o()}/>`;
		g += ln(
			"M-18-18 C-14-14 -14-8 -16-4 M18-18 C14-14 14-8 16-4 M0-26 V-16 M-22 8 L-16 12",
			p.maskDk,
			2.2,
		);
		g += `<path d="M-21-6 C-15-15 -4-13 -4-2 C-8 5 -19 3 -21-6 Z M21-6 C15-15 4-13 4-2 C8 5 19 3 21-6 Z" fill="${INK}"/>`;
		g += glowEye(-11, -4, 5.8, p.glow) + glowEye(11, -4, 5.8, p.glow);
		g += `<path d="M-3 6 L0 2 L3 6 L0 12 Z" fill="${INK}"/>`;
		g += `<path d="M-12 20 L12 20 L9 32 L-9 32 Z" fill="${INK}"/><path d="M-9 20 L-7 25 L-5 20 M-1 20 L0 26 L1 20 M5 20 L7 25 L9 20 M-6 32 L-4 28 L-2 32 M2 32 L4 28 L6 32" fill="${p.mask}"/>`;
		g += `<path d="M0-24 L-5-17 L0-10 L5-17 Z" fill="none" stroke="${p.glow}" stroke-width="2.4" stroke-linejoin="round"/>`;
		return g;
	}
	function thicket(p = TH) {
		let g = shadow(0, 60, 88);

		for (const sx of [-1, 1]) {
			g += limb(
				`M${sx * 50}-26 C${sx * 72}-20 ${sx * 80} 0 ${sx * 76} 18 L${sx * 72} 44`,
				p.bark,
				17,
			);
			g += ln(
				`M${sx * 64}-20 C${sx * 72}-12 ${sx * 74} 0 ${sx * 72} 10 M${sx * 76} 22 L${sx * 74} 36`,
				p.barkDk,
				2.4,
			);
			g += `<path d="M${sx * 60}-26 C${sx * 72}-24 ${sx * 80}-14 ${sx * 80}-2 L${sx * 72}-6 L${sx * 70} 4 L${sx * 64}-8 Z" fill="${p.moss}" ${o(2.6)}/>`;
			const fd = `M${sx * 72} 44 L${sx * 62} 62 M${sx * 72} 44 L${sx * 72} 64 M${sx * 72} 44 L${sx * 82} 62 M${sx * 72} 44 L${sx * 88} 54`;
			g += `<path d="${fd}" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><path d="${fd}" stroke="${p.barkDk}" stroke-width="5.5" stroke-linecap="round"/>`;

			g +=
				ln(
					`M${sx * 78}-4 C${sx * 88} 10 ${sx * 84} 22 ${sx * 90} 34`,
					"#3f6a24",
					3,
				) +
				`<path d="M${sx * 86} 14 q${sx * 8}-2 ${sx * 8} 6 q${sx * -8} 1 ${sx * -8}-6 Z M${sx * 90} 34 q${sx * 6} 2 ${sx * 3} 8 q${sx * -6}-2 ${sx * -3}-8 Z" fill="${p.mossLt}" ${o(1.8)}/>`;
		}

		for (const sx of [-1, 1]) {
			g += `<path d="M${sx * 10} 26 C${sx * 12} 40 ${sx * 10} 50 ${sx * 6} 62 L${sx * 18} 62 L${sx * 22} 56 L${sx * 28} 63 L${sx * 34} 56 L${sx * 44} 62 L${sx * 54} 60 C${sx * 44} 54 ${sx * 40} 42 ${sx * 40} 26 Z" fill="${p.barkDk}" ${o()}/>`;
			g += ln(
				`M${sx * 20} 32 C${sx * 22} 42 ${sx * 20} 50 ${sx * 18} 56 M${sx * 32} 34 C${sx * 32} 44 ${sx * 34} 50 ${sx * 38} 56`,
				p.bark,
				2.4,
			);
			g += `<path d="M${sx * 12} 36 C${sx * 20} 32 ${sx * 32} 32 ${sx * 40} 38 L${sx * 36} 42 L${sx * 30} 38 L${sx * 24} 43 L${sx * 18} 38 Z" fill="${p.moss}" ${o(2.4)}/>`;
		}

		g += `<path d="M-60-30 C-54-56 54-56 60-30 C68-4 60 28 42 40 L-42 40 C-60 28 -68-4 -60-30 Z" fill="${p.bark}" ${o()}/>`;
		g += ln(
			"M-40-18 C-44 0 -42 18 -36 34 M40-18 C44 0 42 18 36 34 M-24 0 C-26 14 -24 26 -22 36 M24 2 C26 14 24 26 22 36 M-50 4 C-52 14 -50 22 -46 28 M50 4 C52 14 50 22 46 28",
			p.barkDk,
			2.6,
		);
		g += shine("M-50-24 C-54-8 -54 6 -50 18", p.barkLt, 3.2);
		g += knot(-30, 16, 6, p.bark) + knot(34, 22, 5, p.bark);

		g += `<path d="M-10 20 C-10 12 10 12 10 20 L10 30 C10 34 -10 34 -10 30 Z" fill="${INK}"/><circle cx="-3" cy="24" r="2.2" fill="${p.glow}"/><circle cx="4" cy="28" r="1.6" fill="${p.glow}"/>`;
		g += mossEdge(-40, 40, 38, p.moss);

		const rd = "M-10-14 L0-26 L10-14 L0-2 Z M0-2 V10 M-8 4 H8";
		g += `<circle cx="0" cy="-10" r="18" fill="${p.glow}" opacity=".18"/><path d="${rd}" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><path d="${rd}" fill="none" stroke="${p.glow}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;

		g += `<path d="M-66-30 C-60-54 60-54 66-30 L60-12 L52-22 L46-4 L36-18 L28-2 L18-16 L-18-16 L-28-2 L-36-18 L-46-4 L-52-22 L-60-12 Z" fill="${p.moss}" ${o()}/>`;
		g +=
			`<path d="M-56-36 C-40-46 -20-48 0-48" fill="none" stroke="${p.mossLt}" stroke-width="3.4" stroke-linecap="round"/>` +
			ln("M-46-28 l-2 8 M-30-30 l-1 9 M30-30 l1 9 M46-28 l2 8", p.mossDk, 2.2);
		g += `<path d="M-56-42 L-54-50 L-48-50 L-48-42 Z" fill="#f2e6cc" ${o(2)}/><path d="M-60-48 C-60-58 -42-58 -42-48 Z" fill="#d8392b" ${o(2.4)}/><circle cx="-54" cy="-53" r="1.6" fill="#fff"/><circle cx="-47" cy="-51" r="1.3" fill="#fff"/>`;
		g += `<path d="M-42-46 L-41-51 L-37-51 L-37-46 Z" fill="#f2e6cc" ${o(1.8)}/><path d="M-45-50 C-45-56 -33-56 -33-50 Z" fill="#d8392b" ${o(2)}/>`;
		g += `<path d="M46-44 L48-50 L52-50 L52-44 Z" fill="#f2e6cc" ${o(2)}/><path d="M43-49 C43-57 57-57 57-49 Z" fill="#c9752e" ${o(2.4)}/>`;
		g += G(0, -62, 1, thHead(p));
		for (const [x, y] of [
			[-92, -40],
			[-96, 14],
			[94, -24],
			[-70, -96],
			[72, -92],
			[96, 4],
		])
			g += `<circle cx="${x}" cy="${y}" r="6" fill="${p.glow}" opacity=".35"/><circle cx="${x}" cy="${y}" r="2.6" fill="${p.glow}"/>`;
		return g;
	}
	LGMon.add("thicket", {
		art: () =>
			`<circle cx="150" cy="106" r="100" fill="#9fe8b8" opacity=".25"/>` +
			G(150, 148, 1.04, thicket()),
		face: () => G(64, 72, 0.78, thHead()),
	});
})();

(() => {
	const { INK, o, eye, glowEye, shadow, shine, dk, lt } = LGMon;
	const P = (d, f, w) => `<path d="${d}" fill="${f}" ${o(w)}/>`;
	const F = (d, f, op) =>
		`<path d="${d}" fill="${f}"${op != null ? ` opacity="${op}"` : ""}/>`;
	const L = (d, c = INK, w = 2) =>
		`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
	const E = (cx, cy, rx, ry, f, w) =>
		`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${f}" ${w === 0 ? "" : o(w)}/>`;
	const C = (cx, cy, r, f, op) =>
		`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}"${op != null ? ` opacity="${op}"` : ""}/>`;
	const G = (t, s) => `<g transform="${t}">${s}</g>`;
	const leg = (x, y0, w, y1, c) =>
		P(
			`M${x} ${y0} L${x} ${y1 - 5} Q${x} ${y1} ${x + 5} ${y1} L${x + w + 1} ${y1} Q${x + w + 4} ${y1} ${x + w + 3} ${y1 - 5} L${x + w} ${y0} Z`,
			c,
		) +
		L(
			`M${x + w * 0.38} ${y1 - 1} v-4 M${x + w * 0.72} ${y1 - 1} v-4`,
			INK,
			1.6,
		);
	const claws = (x, y, n = 3, c = "#2b1d18", step = 5) =>
		Array.from({ length: n }, (_, i) =>
			P(`M${x + i * step} ${y} q-1 6 -4 8 q1 -5 0 -8 z`, c, 1.4),
		).join("");
	const snow = (x, y, r, c = "#d8f1ff", w = 1.8) =>
		L(
			`M${x - r} ${y}h${2 * r}M${x} ${y - r}v${2 * r}M${x - r * 0.7} ${y - r * 0.7}l${r * 1.4} ${r * 1.4}M${x - r * 0.7} ${y + r * 0.7}l${r * 1.4} ${-r * 1.4}`,
			c,
			w,
		);

	function limb(pts, ws, c, gy, toe = 8, hoof = null) {
		const n = pts.length,
			A = [],
			B = [];
		for (let i = 0; i < n; i++) {
			const a = pts[Math.max(0, i - 1)],
				b = pts[Math.min(n - 1, i + 1)];
			let dx = b[0] - a[0],
				dy = b[1] - a[1];
			const l = Math.hypot(dx, dy) || 1;
			dx /= l;
			dy /= l;
			A.push([pts[i][0] - (dy * ws[i]) / 2, pts[i][1] + (dx * ws[i]) / 2]);
			B.push([pts[i][0] + (dy * ws[i]) / 2, pts[i][1] - (dx * ws[i]) / 2]);
		}
		const cr = (Q) => {
			let s = "";
			for (let i = 0; i < Q.length - 1; i++) {
				const p0 = Q[Math.max(0, i - 1)],
					p1 = Q[i],
					p2 = Q[i + 1],
					p3 = Q[Math.min(Q.length - 1, i + 2)];
				s += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
			}
			return s;
		};
		const an = pts[n - 1],
			w = ws[n - 1],
			al = A[n - 1],
			bl = B[n - 1],
			tx = an[0] - w / 2 - toe;
		let d = `M${A[0][0].toFixed(1)} ${A[0][1].toFixed(1)}` + cr(A);
		d += ` C${(al[0] - toe * 0.4).toFixed(1)} ${(al[1] + 2).toFixed(1)} ${(tx - 1).toFixed(1)} ${(gy - 9).toFixed(1)} ${tx.toFixed(1)} ${(gy - 4).toFixed(1)} Q${tx} ${gy} ${tx + 5} ${gy} L${(an[0] + w / 2 + 1).toFixed(1)} ${gy} Q${(an[0] + w / 2 + 3).toFixed(1)} ${gy} ${bl[0].toFixed(1)} ${(bl[1] + 2).toFixed(1)}`;
		d += cr(B.slice().reverse()).replace(/^/, " ") + " Z";
		let g = P(d, c);
		if (hoof === "claw") g += claws(tx - 1, gy - 7, 3, INK, 4);
		else if (hoof)
			g +=
				P(
					`M${tx - 1} ${gy} L${an[0] + w / 2 + 1} ${gy} L${an[0] + w / 2} ${gy - 9} L${tx + 2} ${gy - 9} Z`,
					hoof,
					3,
				) + L(`M${(tx + an[0] + w / 2) / 2} ${gy - 1} v-6`, lt(hoof, 0.3), 1.6);
		else g += L(`M${tx + 6} ${gy - 1} v-4 M${tx + 11} ${gy - 1} v-4`, INK, 1.6);
		return g;
	}

	function fleg(x, y0, gy, w, c, s = 0, lift = 0, toe = 8, hoof) {
		const h = gy - y0;
		const pts = lift
			? [
					[x, y0],
					[x + 2 + s * 0.4, y0 + h * 0.45],
					[x + s * 0.5 + 8, gy - 16 - lift],
					[x + s * 0.5 + 12, gy - 8 - lift],
				]
			: [
					[x, y0],
					[x + 2 + s * 0.35, y0 + h * 0.45],
					[x + s * 0.85, gy - 15],
					[x + s - 1, gy - 7],
				];
		return limb(pts, [w * 1.25, w, w * 0.72, w * 0.8], c, gy - lift, toe, hoof);
	}
	function hleg(x, y0, gy, w, c, s = 0, toe = 8, hoof) {
		const h = gy - y0;
		return limb(
			[
				[x, y0],
				[x - 7 + s * 0.4, y0 + h * 0.4],
				[x + 9 + s * 0.8, gy - h * 0.3],
				[x + 3 + s, gy - 7],
			],
			[w * 1.5, w * 1.05, w * 0.7, w * 0.8],
			c,
			gy,
			toe,
			hoof,
		);
	}
	const lid = (x, y, r, side, fill) => {
		const A = [x + side * r * 1.35, y - r * 1.1],
			B = [x - side * r * 1.35, y - r * 0.1];
		const [R, Lf] = A[0] > B[0] ? [A, B] : [B, A];
		return (
			P(
				`M${x - r * 1.45} ${y - r * 1.6} L${x + r * 1.45} ${y - r * 1.6} L${R[0]} ${R[1]} L${Lf[0]} ${Lf[1]} Z`,
				fill,
				0,
			) + L(`M${A[0]} ${A[1]} L${B[0]} ${B[1]}`, INK, 2.4)
		);
	};

	const ICE = { c: "#bfeaff", d: "#7cc4e8", l: "#effaff", glow: "#8fe6ff" };
	const crystal = (x, y, h, w, r = 0, c = ICE.c) =>
		G(
			`translate(${x},${y}) rotate(${r})`,
			P(
				`M${-w} 0 L${-w} ${-h * 0.7} L0 ${-h} L${w} ${-h * 0.7} L${w} 0 Z`,
				c,
				2.6,
			) +
				L(`M0 ${-h + 2} V-2`, ICE.l, 1.6) +
				F(
					`M${w * 0.15} ${-h * 0.9} L${w} ${-h * 0.68} L${w} -2 L${w * 0.15} -2 Z`,
					ICE.d,
					0.55,
				),
		);

	const icicles = (pts, c = ICE.c) =>
		pts
			.map(([x, y, h]) =>
				P(`M${x - 3} ${y} L${x + 3} ${y} L${x} ${y + h} Z`, c, 1.6),
			)
			.join("");

	const YT = {
		fur: "#eef2f6",
		dk: "#c2ccd8",
		skin: "#7fa6c9",
		skinD: "#5a7fa4",
		horn: "#b8b0a0",
	};
	function yetiHead(cx, cy, s) {
		const p = YT;
		let g = `<g transform="translate(${cx},${cy}) scale(${s})">`;
		g +=
			P("M-18-24 C-30-30 -36-40 -32-52 C-26-44 -18-38 -10-34 Z", p.horn, 3) +
			P("M18-24 C30-30 36-40 32-52 C26-44 18-38 10-34 Z", p.horn, 3);
		g += P(
			"M0-36 L8-42 L12-33 L22-37 L24-27 L34-26 L32-15 L41-9 L34 0 L41 10 L32 16 L34 28 L22 28 L18 37 L8 31 L0 39 L-8 31 L-18 37 L-22 28 L-34 28 L-32 16 L-41 10 L-34 0 L-41-9 L-32-15 L-34-26 L-24-27 L-22-37 L-12-33 L-8-42 Z",
			p.fur,
		);
		g += L("M-26-18 L-22-12 M26-18 L22-12 M-30 6 L-25 8 M30 6 L25 8", p.dk, 2);
		g += P(
			"M0-20 C16-20 25-10 25 6 C25 22 14 30 0 30 C-14 30 -25 22 -25 6 C-25-10 -16-20 0-20 Z",
			p.skin,
		);
		g += P(
			"M-22-8 C-14-16 -4-14 -1-8 L1-8 C4-14 14-16 22-8 C14-10 6-8 0-4 C-6-8 -14-10 -22-8 Z",
			p.skinD,
			2.4,
		);
		g += eye(-10, -2, 5, "#f2c84a") + eye(10, -2, 5, "#f2c84a");
		g += lid(-10, -2, 5, -1, p.skin) + lid(10, -2, 5, 1, p.skin);
		g +=
			E(-3, 7, 2, 1.4, INK, 0) +
			E(3, 7, 2, 1.4, INK, 0) +
			L("M-6 4 Q0 2 6 4", p.skinD, 2);
		g += P("M-14 12 Q0 8 14 12 Q12 29 0 29 Q-12 29 -14 12 Z", "#5a2a3a", 2.4);
		g += P(
			"M-11 12.5 L-9 19 L-7 12 Z M11 12.5 L9 19 L7 12 Z M-9 28 L-8 22 L-6 28 Z M9 28 L8 22 L6 28 Z",
			"#fff",
			1.2,
		);
		g += F("M-6 22 Q0 19 6 22 Q0 27 -6 22 Z", "#c0566a");
		return g + "</g>";
	}
	function yetiArt() {
		const p = YT;
		let g = shadow(150, 214, 76);
		g +=
			P("M116 176 L112 208 L144 208 L144 180 Z", p.fur) +
			P("M156 180 L156 208 L188 208 L184 176 Z", p.fur);
		g +=
			E(126, 210, 18, 6, p.skin, 3) +
			E(174, 210, 18, 6, p.skin, 3) +
			L("M116 210 v-3 M124 212 v-3 M180 212 v-3 M188 210 v-3", INK, 1.6);
		g += P(
			"M150 64 C188 64 210 92 212 128 L221 136 L212 142 L219 152 L208 156 C204 182 184 194 150 194 C116 194 96 182 92 156 L81 152 L88 142 L79 136 L88 128 C90 92 112 64 150 64 Z",
			p.fur,
		);
		g += F(
			"M150 104 C172 104 184 124 184 148 C184 172 168 186 150 186 C132 186 116 172 116 148 C116 124 128 104 150 104 Z",
			"#d5e0ec",
		);
		g += L(
			"M130 132 L136 140 M164 128 L170 136 M138 160 L144 168 M160 158 L166 166 M126 112 l4 6 M176 112 l-4 6",
			p.dk,
			2.2,
		);
		g += shine("M118 76 C132 68 146 66 158 66");

		g += P(
			"M98 98 C80 108 72 140 74 176 L82 172 L84 182 L94 178 C92 150 98 128 110 116 Z",
			p.fur,
		);
		g +=
			E(84, 190, 15, 12, p.skin, 3.4) +
			L("M74 194 l-2 5 M82 198 l-1 5 M90 197 l0 5", INK, 2);
		g += P(
			"M200 98 C214 88 220 72 222 56 L230 60 L240 58 C240 80 232 100 212 116 L216 106 Z",
			p.fur,
		);
		g +=
			P(
				"M220 52 C218 38 232 32 242 36 C250 40 252 54 244 60 C236 66 222 64 220 52 Z",
				p.skin,
				3.4,
			) + L("M226 40 v6 M234 37 v6 M242 40 v6", p.skinD, 2);

		g += snow(64, 80, 5) + snow(250, 140, 4) + snow(52, 140, 3.4);
		g += yetiHead(150, 78, 1.05);
		return g;
	}

	function iceslime(face) {
		const c = "#8fd0f0",
			d = "#5ea8d0",
			l = "#d8f3ff";
		let g = face ? "" : shadow(150, 214, 62);
		g += P(
			"M150 110 C184 110 206 140 210 172 C214 200 196 212 150 212 C104 212 86 200 90 172 C94 140 116 110 150 110 Z",
			c,
		);
		g +=
			F(
				"M108 196 C104 182 110 168 120 170 C116 180 118 190 126 200 Z",
				d,
				0.6,
			) +
			F("M196 180 C200 192 192 204 180 206 C188 198 192 190 196 180 Z", d, 0.6);

		g +=
			C(122, 182, 5, l, 0.7) +
			C(184, 160, 3.4, l, 0.7) +
			C(176, 196, 4, l, 0.7);
		g += G(
			"translate(182,194) rotate(18)",
			P("M-10-10 L10-10 L10 10 L-10 10 Z", "#c4ebfb", 2) +
				L("M-6-6 L4-6", "#fff", 1.6),
		);

		g +=
			crystal(132, 124, 26, 6, -24) +
			crystal(150, 114, 32, 7, 0) +
			crystal(168, 122, 22, 6, 26);
		g += shine("M110 148 C114 132 126 120 138 116", "rgba(255,255,255,.8)", 4);

		g +=
			eye(134, 160, face ? 10 : 9, "#2f6e9a") +
			eye(166, 160, face ? 10 : 9, "#2f6e9a");
		g += E(122, 176, 5, 3, "#f0a0b8", 0) + E(178, 176, 5, 3, "#f0a0b8", 0);
		g += P("M144 176 Q150 184 156 176 Q150 178 144 176 Z", "#2f5a7a", 2);
		return g;
	}

	const MM = {
		fur: "#7a5440",
		dk: "#523626",
		lt: "#a07a5e",
		tusk: "#f3ead2",
		tuskD: "#cbbf9e",
		frost: "#e8f6fd",
	};
	function mammothArt() {
		const p = MM;
		let g = shadow(164, 216, 100);
		g +=
			fleg(146, 150, 214, 22, p.dk, 6, 0, 2) +
			fleg(240, 150, 214, 21, p.dk, -5, 0, 2);
		g += P("M250 112 C262 116 266 128 262 138 L256 128 Z", p.fur, 3);
		g += P(
			"M106 110 C108 70 150 54 196 60 C236 64 258 90 256 128 C254 156 238 168 214 168 L136 168 C116 168 104 146 106 110 Z",
			p.fur,
		);

		for (const [x, y, l, k] of [
			[118, 158, 18, -3],
			[132, 164, 12, 2],
			[150, 166, 20, -2],
			[166, 166, 10, 3],
			[182, 167, 18, -2],
			[198, 166, 12, 2],
			[214, 165, 16, -3],
			[238, 158, 14, 2],
			[246, 148, 12, 3],
		])
			g +=
				P(
					`M${x - 8} ${y - 6} C${x - 9} ${y + l * 0.5} ${x - 3 + k} ${y + l} ${x + k} ${y + l} C${x + 3 + k} ${y + l * 0.7} ${x + 8} ${y + l * 0.4} ${x + 8} ${y - 6} Z`,
					p.fur,
					2.6,
				) +
				L(
					`M${x} ${y + 1} C${x} ${y + l * 0.5} ${x + k * 0.5} ${y + l * 0.7} ${x + k * 0.6} ${y + l * 0.8}`,
					p.dk,
					1.6,
				);
		g += L(
			"M150 80 C160 92 166 104 168 118 M186 72 C196 86 200 100 200 116 M220 78 C230 92 234 104 234 120",
			p.dk,
			2.4,
		);

		g +=
			F("M168 62 C186 56 210 58 228 66 C210 68 188 68 172 72 Z", p.frost) +
			F("M242 96 C250 106 254 118 252 130 C246 120 242 108 242 96 Z", p.frost);

		g +=
			fleg(224, 148, 214, 26, p.fur, 6, 0, 2) +
			fleg(124, 144, 214, 27, p.fur, -7, 0, 2);
		for (const ax of [229, 116])
			g +=
				E(ax - 7, 212, 4, 2.6, p.tusk, 1.6) +
				E(ax + 2, 213, 4, 2.6, p.tusk, 1.6) +
				E(ax + 11, 212, 4, 2.6, p.tusk, 1.6);

		for (const [x, y, l] of [
			[128, 152, 12],
			[232, 156, 12],
		])
			g += P(
				`M${x - 9} ${y - 6} C${x - 10} ${y + l * 0.5} ${x - 4} ${y + l} ${x} ${y + l} C${x + 4} ${y + l * 0.7} ${x + 9} ${y + l * 0.4} ${x + 9} ${y - 6} Z`,
				p.fur,
				2.6,
			);

		g += P(
			"M70 98 C66 64 90 46 116 50 C138 54 150 74 144 100 C140 122 128 136 110 140 L92 140 C78 134 70 118 70 98 Z",
			p.fur,
		);
		g += E(132, 96, 13, 18, p.dk, 3.4);
		for (const [x, y, l] of [
			[112, 134, 16],
			[124, 128, 14],
			[100, 138, 12],
		])
			g += P(
				`M${x - 6} ${y - 6} Q${x - 4} ${y + l * 0.6} ${x - 1} ${y + l} Q${x + 2} ${y + l * 0.4} ${x + 6} ${y - 6} Z`,
				p.fur,
				2.6,
			);

		g += P(
			"M108 130 C94 160 62 170 48 150 C40 138 42 118 50 110 C56 116 54 130 60 138 C72 150 90 142 100 122 Z",
			p.tuskD,
			3.4,
		);
		g += P(
			"M80 118 C66 134 62 162 68 188 C70 198 84 200 88 192 C84 186 80 182 82 172 C80 156 86 140 98 128 Z",
			p.fur,
		);
		g += L("M72 146 h8 M70 158 h8 M70 170 h8 M72 182 h7", p.dk, 2);
		g += P(
			"M98 130 C82 166 42 176 26 150 C16 134 20 112 30 102 C38 110 34 128 42 140 C56 156 80 146 90 120 Z",
			p.tusk,
			3.6,
		);
		g += L("M28 112 C26 130 34 146 50 152", "#fff", 2.2);

		g +=
			P("M80 66 C90 52 112 48 126 56 L120 72 C108 66 94 68 86 76 Z", ICE.c, 3) +
			L("M90 64 L116 58", ICE.l, 2);
		g +=
			crystal(92, 56, 22, 5, -20) +
			crystal(104, 50, 30, 6, -6) +
			crystal(118, 52, 22, 5, 12);
		g +=
			crystal(168, 64, 22, 5, -8) +
			crystal(190, 60, 30, 6, 4) +
			crystal(214, 64, 22, 5, 14) +
			crystal(234, 74, 16, 4, 24);
		g += glowEye(100, 92, 4.4, ICE.glow) + lid(100, 92, 4.4, -1, p.fur);
		return g;
	}
	function mammothFace() {
		const p = MM;
		let g = '<g transform="translate(64,62) scale(0.92)">';
		g += E(-36, 2, 13, 19, p.dk, 3.4) + E(36, 2, 13, 19, p.dk, 3.4);
		g += P(
			"M0-36 C24-36 34-18 32 2 C30 18 20 26 12 28 L-12 28 C-20 26 -30 18 -32 2 C-34-18 -24-36 0-36 Z",
			p.fur,
		);
		g +=
			P("M-10 22 C-26 30 -42 24 -46 6 C-40 12 -28 18 -12 14 Z", p.tusk, 3) +
			P("M10 22 C26 30 42 24 46 6 C40 12 28 18 12 14 Z", p.tusk, 3);
		g += P(
			"M-9 8 C-10 26 -8 40 -3 48 C1 52 7 50 7 44 C4 38 6 26 9 8 Z",
			p.fur,
			3.4,
		);
		g += L("M-6 24 h8 M-5 34 h8", p.dk, 2);
		g += P(
			"M-20-26 C-10-34 10-34 20-26 L16-16 C6-22 -6-22 -16-16 Z",
			ICE.c,
			2.6,
		);
		g +=
			crystal(-12, -30, 16, 4, -18) +
			crystal(0, -33, 22, 5, 0) +
			crystal(12, -30, 16, 4, 18);
		g += glowEye(-13, -4, 4.6, ICE.glow) + glowEye(13, -4, 4.6, ICE.glow);
		g += lid(-13, -4, 4.6, -1, p.fur) + lid(13, -4, 4.6, 1, p.fur);
		return g + "</g>";
	}

	const FX = { fur: "#f7f8fb", dk: "#cfd8e4", ear: "#e8b8bc", eye: "#e8a83a" };
	function foxHead(cx, cy, s) {
		const p = FX;
		let g = `<g transform="translate(${cx},${cy}) scale(${s})">`;
		g +=
			P("M-28-8 C-30-20 -28-30 -22-32 C-16-30 -10-24 -8-18 Z", p.fur) +
			P("M28-8 C30-20 28-30 22-32 C16-30 10-24 8-18 Z", p.fur);
		g +=
			F("M-24-12 C-25-20 -24-26 -21-27 C-17-25 -14-21 -12-17 Z", p.ear) +
			F("M24-12 C25-20 24-26 21-27 C17-25 14-21 12-17 Z", p.ear);
		g += P(
			"M0-24 C18-24 30-14 32 0 L40 8 L30 12 L32 20 L18 20 C12 28 6 32 0 32 C-6 32 -12 28 -18 20 L-32 20 L-30 12 L-40 8 L-32 0 C-30-14 -18-24 0-24 Z",
			p.fur,
		);
		g += F("M-30 4 L-38 8 L-30 11 Z M30 4 L38 8 L30 11 Z", p.dk);
		g += F(
			"M-14-20 C-8-24 8-24 14-20 C8-18 4-14 0-8 C-4-14 -8-18 -14-20 Z",
			p.dk,
		);
		g += eye(-11, -2, 5.6, p.eye) + eye(11, -2, 5.6, p.eye);
		g += P("M-5 18 Q0 15 5 18 Q4 23 0 24 Q-4 23 -5 18 Z", INK, 1.4);
		g += L("M0 24 V26 M-5 26 Q-2 29 0 26 Q2 29 5 26", INK, 1.8);
		g += E(-18, 10, 4, 2.4, "#f2b8c0", 0) + E(18, 10, 4, 2.4, "#f2b8c0", 0);
		return g + "</g>";
	}
	function foxArt() {
		const p = FX;
		let g =
			`<g transform="translate(150,138) scale(1.36)">` + shadow(6, 56, 50);
		g += P("M-28 56 C-34 30 -26 2 0 0 C26 2 34 30 28 56 Z", p.fur);
		g += L(
			"M-23 28 C-25 38 -24 46 -21 54 M23 28 C25 38 24 46 21 54",
			p.dk,
			2.2,
		);
		g += P(
			"M-14 4 L-19 16 L-11 15 L-15 27 L-5 23 L0 33 L5 23 L15 27 L11 15 L19 16 L14 4 Z",
			"#ffffff",
			2,
		);
		for (const sx of [-1, 1])
			g +=
				P(
					`M${sx * 7} 30 L${sx * 7} 50 Q${sx * 7} 58 ${sx * 14} 58 Q${sx * 21} 58 ${sx * 19} 50 L${sx * 18} 32 Z`,
					p.fur,
				) + L(`M${sx * 11} 56 V52 M${sx * 15} 57 V53`, INK, 1.5);

		g += P(
			"M22 30 C52 20 72 42 64 62 C56 78 10 78 -26 70 C-44 66 -46 48 -34 46 C-28 52 -16 56 0 56 C16 56 26 54 30 48 C28 42 26 38 22 36 Z",
			p.fur,
		);
		g += F("M-26 70 C-44 66 -46 48 -34 46 C-32 56 -28 62 -20 68 Z", p.dk);
		g += L("M-6 66 C12 68 34 66 50 58 M36 30 C46 30 54 36 58 46", p.dk, 2);
		g += foxHead(0, -12, 0.9);
		g += "</g>" + snow(70, 70, 4) + snow(240, 92, 5) + snow(232, 176, 3.4);
		return g;
	}

	function wisp(face) {
		const c = "#9fe6ff",
			d = "#5ec0e8",
			l = "#e4fbff";
		let g = "";
		if (!face)
			g +=
				shadow(150, 216, 34).replace(".22", ".12") + C(150, 150, 64, l, 0.35);
		g += P(
			"M150 200 C120 200 108 176 112 152 C114 136 124 124 128 106 C134 118 136 126 140 132 C140 112 146 96 154 78 C158 98 160 114 164 126 C168 116 172 108 182 100 C184 120 192 136 190 158 C190 182 176 200 150 200 Z",
			c,
		);
		g += F(
			"M150 192 C130 192 122 176 124 160 C126 148 132 142 136 132 C140 140 144 144 148 146 C150 132 154 124 158 116 C160 130 164 140 168 146 C172 140 176 136 178 130 C182 144 182 154 180 166 C178 182 168 192 150 192 Z",
			l,
			0.8,
		);
		g += glowEye(138, 162, 5.4, "#ffffff") + glowEye(162, 162, 5.4, "#ffffff");
		g += `<ellipse cx="138" cy="162" rx="2.2" ry="3.2" fill="${d}"/><ellipse cx="162" cy="162" rx="2.2" ry="3.2" fill="${d}"/>`;
		g += P("M145 176 Q150 181 155 176 Q150 178 145 176 Z", d, 1.8);
		g += shine("M118 160 C118 148 124 138 128 130", "rgba(255,255,255,.85)", 3);
		if (!face)
			for (const [x, y, r] of [
				[92, 120, -20],
				[210, 110, 24],
				[96, 186, 10],
				[206, 184, -14],
			])
				g += crystal(x, y, 14, 3.4, r);
		return g;
	}

	const ZD = {
		skin: "#9fb4c4",
		dk: "#6f8496",
		lt: "#c7d6e0",
		shirt: "#7a6a5a",
		shirtD: "#56483c",
		pants: "#55505e",
		hair: "#dfe8ee",
		glow: "#d6f6ff",
	};
	function deadHead(cx, cy, s) {
		const p = ZD;
		let g = `<g transform="translate(${cx},${cy}) scale(${s})">`;
		g += P("M-26-6 C-32-26 -16-38 2-36 C20-36 32-24 28-6 Z", p.hair, 3.4);
		g += P(
			"M0-28 C18-28 28-16 27 2 C26 18 18 30 2 32 C-14 32 -26 22 -27 4 C-28-14 -18-28 0-28 Z",
			p.skin,
		);

		g += P(
			"M-28-8 L-30 10 L-24 2 L-22 14 L-18-4 L-10-14 L-2-6 L4-16 L12-8 L20-16 L28-6 L30-16 C26-30 10-38 -4-36 C-20-34 -32-24 -28-8 Z",
			p.hair,
			3,
		);
		g +=
			P("M-14-2 C-12-10 -4-10 -2-2 C-4 4 -12 4 -14-2 Z", p.dk, 0) +
			P("M18-2 C16-10 6-10 4-2 C6 5 16 5 18-2 Z", p.dk, 0);
		g += glowEye(-8, -2, 4, p.glow) + glowEye(11, -2, 4.8, p.glow);
		g += L("M18 10 L22 18 M-20 10 L-16 16", p.dk, 1.8);

		g += P("M-8 14 Q2 12 12 14 L10 26 Q2 30 -6 26 Z", "#3a2a36", 2.4);
		g += P(
			"M-5 14.5 L-4 18 L-2 14 Z M4 14 L5 18 L7 14.5 Z M2 27 L3 23 L5 27 Z",
			"#e8e4d6",
			1,
		);
		g += icicles([
			[-14, 24, 9],
			[-6, 30, 11],
			[8, 30, 8],
			[16, 24, 10],
		]);
		g += P("M0 2 L3 9 L-2 9 Z", p.dk, 1.8);
		return g + "</g>";
	}
	function frozendeadArt() {
		const p = ZD;
		let g = shadow(156, 214, 62);
		g +=
			P("M138 156 L130 206 L148 206 L154 158 Z", p.pants) +
			P("M160 156 L172 204 L188 204 L178 156 Z", p.pants);
		g +=
			P("M130 200 L138 206 L130 212 L144 214 L148 204 Z", p.pants, 3) +
			E(136, 210, 12, 5, p.skin, 3) +
			E(182, 208, 12, 5, p.skin, 3);

		g += P(
			"M138 104 C120 104 96 104 78 108 L80 120 C98 118 122 118 140 118 Z",
			p.dk,
			3.6,
		);
		g +=
			P("M80 106 L66 100 M80 110 L62 108 M80 114 L64 116", "none", 4) +
			L("M80 106 L66 100 M80 110 L62 108 M80 114 L64 116", p.dk, 2.4);

		g += P(
			"M126 96 C148 86 176 94 182 116 L186 158 L176 150 L168 162 L158 152 L148 164 L140 152 L130 160 C124 138 118 116 126 96 Z",
			p.shirt,
		);
		g += F(
			"M126 96 C134 92 142 90 150 90 C142 110 140 136 140 152 L130 160 C124 138 118 116 126 96 Z",
			p.shirtD,
			0.5,
		);
		g +=
			P("M150 124 L162 118 L158 136 Z", p.skin, 2) +
			L("M166 134 L174 128 M170 142 L178 140", p.shirtD, 2);
		g += F(
			"M132 94 C146 86 166 88 178 98 C168 100 150 100 136 104 Z",
			"#eef7fc",
		);
		g += icicles([
			[140, 156, 9],
			[156, 156, 12],
			[172, 152, 8],
		]);

		g += P(
			"M152 102 C132 106 110 112 96 118 L100 132 C114 128 132 124 154 122 Z",
			p.shirt,
		);
		g += P(
			"M100 118 C88 120 78 122 70 124 L72 136 C82 134 92 132 102 132 Z",
			p.skin,
			3.6,
		);
		g +=
			L("M72 124 L56 120 M72 128 L54 130 M72 133 L58 140", INK, 5) +
			L("M72 124 L56 120 M72 128 L54 130 M72 133 L58 140", p.skin, 2.6);
		g += icicles([
			[80, 135, 10],
			[88, 134, 7],
			[108, 132, 12],
			[118, 130, 8],
			[94, 120, 7],
		]);
		g += deadHead(122, 76, 1);
		return g;
	}

	const PB = { fur: "#f3efe4", dk: "#cfc6b2", lt: "#ffffff", nose: "#2b1d18" };
	function pbFace(cx, cy, s) {
		const p = PB;
		let g = `<g transform="translate(${cx},${cy}) scale(${s})">`;
		g +=
			E(-24, -22, 9, 8, p.fur) +
			E(24, -22, 9, 8, p.fur) +
			E(-24, -22, 4, 3.4, p.dk, 0) +
			E(24, -22, 4, 3.4, p.dk, 0);
		g += P(
			"M0-30 C20-30 32-18 32 0 C32 14 26 22 16 26 L12 34 C8 40 -8 40 -12 34 L-16 26 C-26 22 -32 14 -32 0 C-32-18 -20-30 0-30 Z",
			p.fur,
		);
		g += F("M-12 6 C-12 0 12 0 12 6 L11 30 C8 36 -8 36 -11 30 Z", p.dk, 0.5);
		g += eye(-13, -6, 4.6, "#3a2a22") + eye(13, -6, 4.6, "#3a2a22");
		g += lid(-13, -6, 4.6, -1, p.fur) + lid(13, -6, 4.6, 1, p.fur);
		g +=
			P("M-8 18 Q0 14 8 18 Q7 25 0 26 Q-7 25 -8 18 Z", p.nose, 1.4) +
			E(-3, 18.5, 2, 1, "#6a6a6a", 0);
		g += L("M0 26 V30 M-6 31 Q-3 34 0 30 Q3 34 6 31", INK, 2);
		g += L("M14-24 L22-6 M18-22 l4 1 M20-14 l4 1", "#d08a7a", 2.4);
		return g + "</g>";
	}
	function polarbearArt() {
		const p = PB;
		let g = shadow(160, 216, 96);
		g +=
			fleg(136, 148, 214, 20, p.dk, 12, 0, 6, "claw") +
			hleg(208, 146, 214, 20, p.dk, -12, 6, "claw");
		g += P("M246 116 C256 116 260 124 256 130 L248 128 Z", p.fur, 3);
		g += P(
			"M100 120 C104 88 140 74 180 78 C220 80 250 100 252 132 C254 158 238 170 214 170 L130 170 C110 170 98 148 100 120 Z",
			p.fur,
		);
		g += F(
			"M120 160 C150 170 200 170 236 158 C230 168 222 170 214 170 L130 170 C124 170 122 166 120 160 Z",
			p.dk,
		);
		g +=
			L("M150 84 C170 80 196 82 216 90", p.dk, 2.2) +
			shine("M126 92 C140 82 158 78 176 78", "rgba(255,255,255,.9)", 3.4);

		g += L("M176 104 L190 128 M188 100 L200 122", "#d08a7a", 2.6);
		g += hleg(222, 144, 214, 22, p.fur, 14, 6, "claw");
		g += P(
			"M200 120 C224 114 244 130 240 154 C236 168 216 170 206 160 Z",
			p.fur,
		);
		g += fleg(114, 138, 214, 24, p.fur, -16, 0, 6, "claw");

		g += '<g transform="translate(116,126) scale(1.3) translate(-116,-126)">';
		g += P(
			"M112 104 C98 98 84 102 72 110 L78 140 C92 138 104 138 120 140 Z",
			p.fur,
		);
		g += P(
			"M86 96 C98 92 104 102 102 114 L96 130 C92 138 80 142 62 142 C46 142 38 136 40 128 C42 120 52 116 62 114 C70 104 76 96 86 96 Z",
			p.fur,
		);
		g += E(94, 96, 7, 6, p.fur, 3.4) + E(94, 96, 3, 2.4, p.dk, 0);
		g += P(
			"M38 124 C38 120 44 118 48 120 C50 124 48 130 42 130 C39 130 38 127 38 124 Z",
			p.nose,
			2,
		);
		g += L("M48 134 C56 136 66 134 74 130", INK, 2.2);
		g += eye(78, 110, 4, "#3a2a22") + lid(78, 110, 4, -1, p.fur);
		g += "</g>";
		g += snow(60, 70, 4) + snow(262, 84, 3.4);
		return g;
	}

	const GL = {
		c: "#a8dcf0",
		d: "#6aaed0",
		l: "#e4f6ff",
		core: "#7fe6ff",
		snow: "#ffffff",
	};
	function golemHead(cx, cy, s) {
		const p = GL;
		let g = `<g transform="translate(${cx},${cy}) scale(${s})">`;
		g +=
			crystal(-18, -20, 20, 5, -24, p.l) +
			crystal(0, -24, 26, 6, 0, p.l) +
			crystal(18, -20, 20, 5, 24, p.l);
		g += P("M-24-24 L24-24 L30 22 L16 32 L-16 32 L-30 22 Z", p.c);
		g += F("M6-24 L24-24 L30 22 L16 32 L8 32 Z", p.d, 0.5);
		g += P(
			"M-26-22 C-14-30 14-30 26-22 L25-14 C12-18 -12-18 -25-14 Z",
			p.snow,
			2.6,
		);
		g +=
			P("M-22-6 L-4-2 L-4 6 L-20 4 Z", "#2e5a78", 0) +
			P("M22-6 L4-2 L4 6 L20 4 Z", "#2e5a78", 0);
		g += glowEye(-12, 1, 4.2, p.core) + glowEye(12, 1, 4.2, p.core);
		g += L("M-24-7 L-4-2 M24-7 L4-2", INK, 3);
		g +=
			P("M-10 16 L10 16 L8 22 L-8 22 Z", "#2e5a78", 2) +
			L("M-18 10 L-24 20 M14 26 L20 18", p.d, 1.8);
		return g + "</g>";
	}
	function golemArt() {
		const p = GL;
		let g = shadow(150, 216, 90);
		g +=
			P("M116 174 L148 174 L146 214 L112 214 Z", p.d) +
			P("M154 174 L188 174 L190 214 L156 214 Z", p.c) +
			L("M120 194 L140 196 M162 190 L182 192", p.l, 2);
		g += P(
			"M108 96 L150 80 L194 96 L200 152 L178 180 L122 180 L100 152 Z",
			p.c,
		);
		g += F("M150 80 L194 96 L200 152 L178 180 L150 180 Z", p.d, 0.45);
		g += L(
			"M108 96 L150 112 L194 96 M150 112 V180 M100 152 L150 112 L200 152",
			p.l,
			2,
		);

		g +=
			C(150, 136, 20, p.core, 0.35) +
			P("M150 120 L162 136 L150 152 L138 136 Z", p.core, 3) +
			P("M150 126 L156 136 L150 146 L144 136 Z", "#ffffff", 0);

		g +=
			crystal(100, 102, 30, 7, -40) +
			crystal(110, 92, 36, 8, -16) +
			crystal(196, 102, 30, 7, 40) +
			crystal(188, 92, 36, 8, 16);

		g +=
			P("M100 104 L76 116 L70 156 L92 160 L104 130 Z", p.c) +
			P("M60 156 L98 154 L102 192 L84 204 L58 194 Z", p.d);
		g +=
			L("M66 172 L96 170 M70 186 L94 186", p.l, 2) +
			P("M60 156 L98 154 L100 166 L62 168 Z", p.snow, 2.2);
		g +=
			P("M200 104 L224 116 L230 156 L208 160 L196 130 Z", p.c) +
			P("M240 156 L202 154 L198 192 L216 204 L242 194 Z", p.c);
		g +=
			F("M222 156 L240 156 L242 194 L226 200 Z", p.d, 0.5) +
			P("M240 156 L202 154 L200 166 L238 168 Z", p.snow, 2.2);
		g += golemHead(150, 70, 0.9);
		g += snow(54, 90, 5) + snow(252, 80, 4);
		return g;
	}

	const FG = {
		skin: "#7ea6d0",
		skinD: "#5a80aa",
		skinL: "#a8c8e6",
		beard: "#f4f8fc",
		beardD: "#c8d8e6",
		fur: "#9a8a78",
		furD: "#6e5f50",
		belt: "#4a3a30",
	};
	function giantHead(cx, cy, s) {
		const p = FG;
		let g = `<g transform="translate(${cx},${cy}) scale(${s})">`;

		g +=
			crystal(-14, -24, 16, 4, -24) +
			crystal(0, -27, 22, 5, 0) +
			crystal(14, -24, 16, 4, 24);
		g +=
			P("M-26-4 L-38-12 L-30 6 Z", p.skin, 3) +
			P("M26-4 L38-12 L30 6 Z", p.skin, 3);
		g += P(
			"M0-28 C18-28 28-16 28 0 C28 16 18 26 0 26 C-18 26 -28 16 -28 0 C-28-16 -18-28 0-28 Z",
			p.skin,
		);
		g += shine("M-14-22 C-8-25 0-26 6-25", "rgba(255,255,255,.5)");

		g += P(
			"M-26 2 C-28 20 -20 36 -12 44 L-10 34 L-4 50 L0 38 L4 50 L10 34 L12 44 C20 36 28 20 26 2 C18 12 10 14 0 14 C-10 14 -18 12 -26 2 Z",
			p.beard,
		);
		g += L("M-14 20 L-12 32 M0 18 V34 M14 20 L12 32", p.beardD, 2);
		g += P(
			"M-14 8 C-8 4 -2 6 0 9 C2 6 8 4 14 8 C8 12 2 12 0 11 C-2 12 -8 12 -14 8 Z",
			p.beard,
			2.4,
		);

		g += P(
			"M-24-8 C-16-16 -4-14 -1-8 L1-8 C4-14 16-16 24-8 C16-9 8-7 0-3 C-8-7 -16-9 -24-8 Z",
			p.skinD,
			2.4,
		);
		g += glowEye(-10, -2, 4.2, "#e8fbff") + glowEye(10, -2, 4.2, "#e8fbff");
		g += P("M-4 0 Q0 9 4 0 Q5 8 0 9 Q-5 8 -4 0 Z", p.skinD, 2);
		return g + "</g>";
	}
	function frostgiantArt() {
		const p = FG;
		let g = shadow(150, 216, 84);

		g += P("M74 120 L82 120 L86 210 L78 210 Z", "#7a5a3e", 3);
		g +=
			P("M58 72 L78 50 L98 72 L96 120 L62 120 Z", ICE.c, 3.6) +
			F("M78 50 L98 72 L96 120 L80 120 Z", ICE.d, 0.5) +
			L("M78 56 V114", ICE.l, 2);
		g +=
			crystal(62, 84, 16, 4, -70) +
			crystal(96, 90, 16, 4, 70) +
			crystal(64, 108, 12, 3.4, -80) +
			crystal(94, 112, 12, 3.4, 80);

		g +=
			P("M124 168 L120 196 L146 196 L146 170 Z", p.skin) +
			P("M154 170 L154 196 L180 196 L176 168 Z", p.skin);
		g +=
			P("M116 192 L150 192 L150 216 L112 216 Z", p.fur) +
			P("M150 192 L184 192 L188 216 L150 216 Z", p.fur);
		g += L("M118 198 h28 M154 198 h30", p.furD, 2);

		g += P("M108 92 C120 82 180 82 192 92 L184 152 L116 152 Z", p.skin);
		g += F("M150 86 C170 86 188 88 192 92 L184 152 L150 152 Z", p.skinD, 0.4);
		g += L(
			"M150 100 V138 M128 112 Q140 120 150 112 Q160 120 172 112 M134 132 h32 M134 142 h32",
			p.skinD,
			2.2,
		);
		g += L("M122 100 L134 120 M128 98 l4 1", "#e8f6fd", 2.4);

		g += P(
			"M112 148 L188 148 L192 176 L178 170 L168 180 L158 170 L150 182 L142 170 L132 180 L122 170 L108 176 Z",
			p.fur,
		);
		g +=
			P("M112 144 L188 144 L189 154 L111 154 Z", p.belt, 3) +
			P("M142 141 L158 141 L158 157 L142 157 Z", "#bfc9d2", 2.4) +
			C(150, 149, 3, ICE.glow);

		g +=
			P(
				"M110 94 C92 100 84 120 82 140 L96 144 C98 126 106 114 118 108 Z",
				p.skin,
			) + E(84, 140, 11, 10, p.skin, 3.4);
		g += L("M78 132 v8 M86 132 v8", p.skinD, 1.8);
		g +=
			P(
				"M190 94 C208 100 218 122 220 148 L206 152 C204 132 198 118 186 110 Z",
				p.skin,
			) + E(214, 156, 12, 11, p.skin, 3.4);
		g += F("M196 96 C204 100 210 106 212 112 L202 116 Z", "#eef8fc");

		g += P(
			"M104 96 C110 82 132 80 144 86 L134 104 C124 100 112 102 104 108 Z",
			p.fur,
			3.4,
		);
		g += giantHead(150, 64, 1.0);
		g += snow(250, 70, 4) + snow(236, 196, 3.4);
		return g;
	}

	const JR = {
		skin: "#c4d6e6",
		skinD: "#94aec6",
		beard: "#f2f6fa",
		beardD: "#bccbd8",
		helm: "#b8c4ce",
		helmD: "#7e8c98",
		wing: "#f4f8fb",
		mail: "#7e8ea0",
		mailD: "#5a6a7c",
		cloak: "#e6e8ec",
		cloakD: "#b6bcc6",
		red: "#3f6aa8",
		gold: "#e8c35a",
	};
	function jarlHead(cx, cy, s, wings = true) {
		const p = JR;
		let g = `<g transform="translate(${cx},${cy}) scale(${s})">`;
		if (wings)
			for (const sd of [-1, 1])
				g +=
					P(
						`M${sd * 22} -20 C${sd * 34} -30 ${sd * 42} -44 ${sd * 42} -58 L${sd * 36} -50 L${sd * 34} -58 L${sd * 28} -46 L${sd * 24} -52 C${sd * 22} -40 ${sd * 18} -30 ${sd * 14} -24 Z`,
						p.wing,
						3,
					) + L(`M${sd * 24} -28 L${sd * 36} -46`, p.beardD, 1.6);
		g += P(
			"M0-24 C16-24 24-14 24 2 C24 18 14 26 0 26 C-14 26 -24 18 -24 2 C-24-14 -16-24 0-24 Z",
			p.skin,
		);

		g += P("M-26-6 C-28-28 -14-38 0-38 C14-38 28-28 26-6 Z", p.helm);
		g += F("M4-38 C16-36 28-28 26-6 L10-6 Z", p.helmD, 0.45);
		g +=
			P("M-27-8 L27-8 L27-1 L-27-1 Z", p.gold, 2.6) +
			L("M0-38 V-8", p.helmD, 2.4);
		g += P("M-4-2 L4-2 L3 12 L-3 12 Z", p.helm, 2.4);
		g += C(-14, -4.5, 1.4, INK) + C(14, -4.5, 1.4, INK);
		g += glowEye(-11, 4, 3.8, "#bff4ff") + glowEye(11, 4, 3.8, "#bff4ff");
		g += L("M-18 0 L-6 4 M18 0 L6 4", INK, 2.4);

		g += P(
			"M-24 8 C-26 20 -18 30 -12 34 L-12 52 L-4 52 L-4 34 L4 34 L4 52 L12 52 L12 34 C18 30 26 20 24 8 C16 16 8 18 0 18 C-8 18 -16 16 -24 8 Z",
			p.beard,
		);
		g += P(
			"M-14 40 L-2 40 L-2 45 L-14 45 Z M2 40 L14 40 L14 45 L2 45 Z",
			p.gold,
			1.8,
		);
		g += P(
			"M-12 14 C-6 10 -2 12 0 15 C2 12 6 10 12 14 C6 17 2 17 0 16 C-2 17 -6 17 -12 14 Z",
			p.beard,
			2.2,
		);
		g += L("M-16 20 L-14 30 M16 20 L14 30", p.beardD, 1.8);
		return g + "</g>";
	}
	function jarlArt() {
		const p = JR;
		let g = shadow(150, 216, 86);

		g += P(
			"M112 92 C90 104 80 150 76 206 L96 200 L104 210 L118 202 L150 206 L182 202 L196 210 L204 200 L224 206 C220 150 210 104 188 92 Z",
			p.cloakD,
		);
		g += L(
			"M90 160 L86 196 M106 150 L102 196 M194 150 L198 196 M210 160 L214 196",
			"#9aa2ae",
			2,
		);

		g +=
			P("M126 176 L122 204 L146 204 L148 176 Z", "#4e5868") +
			P("M152 176 L154 204 L178 204 L174 176 Z", "#4e5868");
		g +=
			P("M118 200 L148 200 L148 216 L114 216 Z", "#5a4232") +
			P("M152 200 L182 200 L186 216 L152 216 Z", "#5a4232");
		g += L(
			"M124 182 L144 190 M124 192 L144 184 M156 182 L172 190 M156 192 L172 184",
			"#3a3226",
			2,
		);

		g += P("M116 96 C128 88 172 88 184 96 L190 180 L110 180 Z", p.mail);
		for (let y = 106; y < 178; y += 9)
			g += L(
				`M${120 + (y - 100) * 0.04} ${y} ${Array.from({ length: 7 }, () => "q4.4 5 8.8 0").join(" ")}`,
				p.mailD,
				1.4,
			);
		g += P("M144 92 L156 92 L158 180 L142 180 Z", p.red, 2.4);
		g +=
			P("M112 140 L188 140 L189 150 L111 150 Z", "#4a3426", 3) +
			P("M141 136 L159 136 L159 154 L141 154 Z", p.gold, 2.4) +
			C(150, 145, 3.4, ICE.glow);

		g += P("M98 206 L210 50 L216 56 L104 212 Z", "#6a4c34", 3);
		g += P(
			"M202 48 C214 28 236 22 252 30 C244 48 246 66 256 80 C238 84 220 76 212 62 Z",
			ICE.c,
			3.6,
		);
		g +=
			F(
				"M206 52 C218 36 234 30 246 34 C240 48 240 62 246 74 C232 74 220 68 214 60 Z",
				ICE.l,
				0.7,
			) + L("M246 34 C240 48 240 62 246 74", ICE.d, 2.4);
		g +=
			C(236, 52, 30, ICE.glow, 0.2) +
			snow(258, 22, 4, "#bff4ff") +
			snow(266, 90, 3.4, "#bff4ff");
		g += P("M208 46 L220 56 M206 54 L214 62", "none", 2.4);

		g +=
			P(
				"M118 100 C104 110 106 140 124 160 L134 152 C124 138 122 120 128 110 Z",
				p.mail,
			) + E(128, 160, 9, 8, p.skin, 3);
		g +=
			P(
				"M182 100 C196 108 200 122 190 128 L178 122 C182 116 180 110 176 106 Z",
				p.mail,
			) + E(184, 124, 9, 8, p.skin, 3);

		g += P(
			"M108 96 C118 84 182 84 192 96 C186 106 170 108 150 108 C130 108 114 106 108 96 Z",
			p.cloak,
			3.4,
		);
		g += L(
			"M118 98 l-2 5 M132 102 l-1 5 M168 102 l1 5 M182 98 l2 5",
			p.cloakD,
			2,
		);
		g += jarlHead(150, 64, 1.0);
		return g;
	}

	const HD = {
		bone: "#d6e2ea",
		boneD: "#9fb2c0",
		helm: "#8e9aa6",
		helmD: "#5e6a76",
		tunic: "#3f6a8a",
		tunicD: "#2c4e68",
		mail: "#7a8696",
		wood: "#8a6440",
		glow: "#9ff3ff",
	};
	function hirdHead(cx, cy, s) {
		const p = HD;
		let g = `<g transform="translate(${cx},${cy}) scale(${s})">`;

		g += P(
			"M0-22 C16-22 22-10 22 4 C22 16 14 26 0 28 C-14 26 -22 16 -22 4 C-22-10 -16-22 0-22 Z",
			p.bone,
		);
		g +=
			P("M-16-2 C-14-10 -4-10 -3-2 C-5 5 -14 5 -16-2 Z", "#2b2a36", 0) +
			P("M16-2 C14-10 4-10 3-2 C5 5 14 5 16-2 Z", "#2b2a36", 0);
		g += glowEye(-9, -2, 3.8, p.glow) + glowEye(9, -2, 3.8, p.glow);

		g += P(
			"M-24-2 C-26-26 -12-36 0-36 C12-36 26-26 24-2 L18-6 C10-10 -10-10 -18-6 Z",
			p.helm,
		);
		g += F("M2-36 C14-34 26-26 24-2 L18-6 C14-8 10-9 8-9 Z", p.helmD, 0.45);
		g += L("M0-36 V-8 M-22-14 C-10-20 10-20 22-14", p.helmD, 2.4);
		g += P("M-3-9 L3-9 L3 10 L-3 10 Z", p.helm, 2.4);

		g +=
			P("M-8 14 L8 14 L7 20 L-7 20 Z", "#2b2a36", 1.8) +
			L("M-4 14 V20 M0 14 V20 M4 14 V20", p.bone, 1.4);
		g += P(
			"M-20 10 C-22 22 -14 32 -6 36 L-2 30 L2 38 L6 30 C14 32 22 22 20 10 C16 18 10 22 8 22 L-8 22 C-10 22 -16 18 -20 10 Z",
			"#c9d6de",
			3,
		);
		g += icicles([
			[-12, 30, 9],
			[0, 37, 10],
			[10, 31, 8],
		]);
		return g + "</g>";
	}
	function hirdmanArt() {
		const p = HD;
		let g = shadow(150, 216, 74);

		g +=
			P("M196 214 L200 214 L204 30 L200 30 Z", p.wood, 3) +
			P("M202 6 L210 30 L202 38 L194 30 Z", "#c9d2d8", 3) +
			L("M202 12 V30", "#fff", 1.4);

		g +=
			P("M132 172 L128 206 L144 206 L148 172 Z", "#5a6070") +
			P("M154 172 L158 206 L174 206 L170 172 Z", "#5a6070");
		g += L(
			"M130 180 L146 186 M130 190 L146 184 M130 198 L146 194 M156 180 L170 186 M156 190 L170 184 M156 198 L170 194",
			"#3a3e48",
			2,
		);
		g +=
			P("M124 204 L148 204 L148 216 L120 216 Z", "#4a3a30") +
			P("M156 204 L178 204 L182 216 L156 216 Z", "#4a3a30");

		g += P(
			"M120 96 C132 88 168 88 180 96 L186 170 L176 164 L170 176 L160 166 L150 178 L140 166 L130 176 L124 164 L114 170 Z",
			p.tunic,
		);
		g += P("M124 98 C134 92 166 92 176 98 L178 136 L122 136 Z", p.mail, 3);
		for (let y = 106; y < 134; y += 8)
			g += L(
				`M126 ${y} ${Array.from({ length: 6 }, () => "q4 4.4 8 0").join(" ")}`,
				"#5a6676",
				1.3,
			);
		g +=
			P("M118 136 L182 136 L183 145 L117 145 Z", "#4a3426", 2.6) +
			P("M144 134 L156 134 L156 147 L144 147 Z", "#bfc9d2", 2);
		g += F(
			"M124 98 C134 92 150 90 160 92 C150 96 136 100 126 108 Z",
			"#eef7fc",
		);

		g +=
			P(
				"M178 100 C192 106 198 118 200 130 L190 134 C188 124 184 116 174 110 Z",
				p.tunic,
			) + E(200, 132, 7.5, 7, p.bone, 2.6);

		g +=
			C(106, 146, 44, "#2b1d18") +
			`<circle cx="106" cy="146" r="40" fill="#e9eef2" ${o()}/>`;
		g +=
			P("M106 106 A40 40 0 0 1 146 146 L106 146 Z", p.tunic, 0) +
			P("M106 186 A40 40 0 0 1 66 146 L106 146 Z", p.tunic, 0);
		g += `<circle cx="106" cy="146" r="40" fill="none" stroke="${p.wood}" stroke-width="4"/><circle cx="106" cy="146" r="42" fill="none" ${o(3)}/>`;
		g +=
			`<circle cx="106" cy="146" r="10" fill="${p.helm}" ${o(3)}/>` +
			C(103, 143, 3, "#fff", 0.7);
		g +=
			L("M128 112 L136 124 L130 128", INK, 2.2) +
			F(
				"M66 140 C70 122 82 110 96 106 C86 116 76 128 72 146 Z",
				"#ffffff",
				0.7,
			);
		g += icicles([
			[80, 182, 10],
			[92, 186, 13],
			[118, 186, 9],
			[132, 180, 11],
		]);
		g += hirdHead(150, 66, 1.05);
		return g;
	}

	const KG = {
		face: "#d4eaf7",
		faceD: "#9cc2dc",
		cape: "#33508a",
		capeD: "#22386a",
		robe: "#cfe6f5",
		robeD: "#9cc2dc",
		fur: "#f6f9fc",
		furD: "#c6d4e0",
		crown: "#bfeaff",
		gem: "#5ad0ff",
		glow: "#e8fbff",
	};
	function kingHead(cx, cy, s, collar = true) {
		const p = KG;
		let g = `<g transform="translate(${cx},${cy}) scale(${s})">`;

		if (collar)
			for (const [x, h, r] of [
				[-30, 30, -40],
				[-22, 38, -22],
				[22, 38, 22],
				[30, 30, 40],
			])
				g += crystal(x, 18, h, 6, r, ICE.c);
		g += P(
			"M0-24 C14-24 22-12 22 2 C22 18 12 32 0 36 C-12 32 -22 18 -22 2 C-22-12 -14-24 0-24 Z",
			p.face,
		);
		g += F(
			"M6-24 C16-20 22-10 22 2 C22 18 12 32 0 36 C6 26 10 10 6-24 Z",
			p.faceD,
			0.45,
		);
		g += L("M-14 8 L-10 22 M14 8 L10 22", p.faceD, 2);

		g += P(
			"M-24-12 L-26-30 L-16-22 L-12-44 L-4-26 L0-52 L4-26 L12-44 L16-22 L26-30 L24-12 C12-18 -12-18 -24-12 Z",
			p.crown,
			3,
		);
		g += L("M0-48 V-24 M-12-40 L-10-24 M12-40 L10-24", "#ffffff", 1.6);
		g +=
			P("M-5-20 L0-27 L5-20 L0-14 Z", p.gem, 2.2) + C(-1.5, -22, 1.2, "#fff");
		g += glowEye(-9, 0, 4.4, p.glow) + glowEye(9, 0, 4.4, p.glow);
		g += L("M-17-6 L-4-2 M17-6 L4-2", INK, 2.6);
		g += L("M0 4 L-2 14 L2 14", p.faceD, 2) + L("M-6 22 Q0 20 6 22", INK, 2.2);
		g += icicles(
			[
				[-6, 34, 8],
				[0, 37, 11],
				[6, 34, 8],
			],
			ICE.c,
		);
		return g + "</g>";
	}
	function icekingArt() {
		const p = KG;
		let g = shadow(150, 218, 104);

		g += P(
			"M118 90 C80 104 52 150 46 212 L74 204 L90 214 L110 206 L150 212 L190 206 L210 214 L226 204 L254 212 C248 150 220 104 182 90 Z",
			p.cape,
		);
		g += L(
			"M80 150 C74 170 70 190 68 206 M104 134 C98 160 96 186 96 208 M196 134 C202 160 204 186 204 208 M220 150 C226 170 230 190 232 206",
			p.capeD,
			2.4,
		);
		g += P(
			"M46 206 L74 198 L90 208 L110 200 L150 206 L190 200 L210 208 L226 198 L254 206 L256 216 L44 216 Z",
			p.fur,
			3,
		);
		g +=
			C(70, 212, 2, INK) +
			C(110, 210, 2, INK) +
			C(150, 212, 2, INK) +
			C(190, 210, 2, INK) +
			C(230, 212, 2, INK);

		g += P("M124 96 C134 90 166 90 176 96 L190 206 L110 206 Z", p.robe);
		g += F("M150 92 C160 92 170 94 176 96 L190 206 L156 206 Z", p.robeD, 0.5);
		g += P("M142 100 L158 100 L164 206 L136 206 Z", p.capeD, 2.4);
		for (const y of [120, 146, 172, 196])
			g += P(`M150 ${y - 7} L156 ${y} L150 ${y + 7} L144 ${y} Z`, ICE.c, 1.8);
		g +=
			P("M120 142 L180 142 L181 151 L119 151 Z", "#bcd0de", 2.6) +
			P("M143 138 L157 138 L157 155 L143 155 Z", p.gem, 2.4);

		g += P("M214 70 L220 70 L222 210 L216 210 Z", "#9cc2dc", 3);
		g +=
			C(217, 52, 26, ICE.glow, 0.25) +
			P(
				"M217 30 L222 46 L238 46 L225 55 L230 70 L217 61 L204 70 L209 55 L196 46 L212 46 Z",
				"#effaff",
				3,
			) +
			C(217, 52, 4.4, p.gem);
		g += P("M208 72 L226 72 L222 80 L212 80 Z", "#bcd0de", 2.4);

		g +=
			P(
				"M178 100 C196 106 210 116 214 130 L204 136 C198 124 188 116 174 112 Z",
				p.robe,
			) + E(214, 132, 8, 7.4, p.face, 2.6);
		g +=
			P(
				"M122 100 C104 104 92 96 84 84 L94 76 C100 86 110 90 124 90 Z",
				p.robe,
			) + E(86, 78, 8, 7.4, p.face, 2.6);

		g +=
			C(80, 56, 16, ICE.glow, 0.35) +
			L(
				"M68 58 C68 46 84 42 90 50 C96 58 86 66 78 62 C72 58 76 52 82 54",
				"#7cc4e8",
				2.6,
			);

		g += P(
			"M110 96 C120 82 180 82 190 96 C184 108 166 110 150 110 C134 110 116 108 110 96 Z",
			p.fur,
			3.4,
		);
		g += C(126, 100, 1.6, INK) + C(150, 104, 1.6, INK) + C(174, 100, 1.6, INK);

		for (const [x, y, r, h] of [
			[40, 110, -30, 18],
			[260, 120, 30, 16],
			[32, 170, 10, 12],
			[270, 176, -16, 14],
			[56, 34, -10, 12],
		])
			g += crystal(x, y, h, 4, r);
		g += kingHead(150, 72, 1.0);
		return g;
	}

	LGMon.add("yeti", { art: yetiArt, face: () => yetiHead(64, 72, 1.08) });
	LGMon.add("iceslime", {
		art: () => iceslime(false),
		face: () =>
			G("translate(64,72) scale(0.82) translate(-150,-160)", iceslime(true)),
	});
	LGMon.add("e_mammoth", { art: mammothArt, face: mammothFace });
	LGMon.add("arcticfox", { art: foxArt, face: () => foxHead(64, 68, 1.18) });
	LGMon.add("icewisp", {
		art: () => wisp(false),
		face: () =>
			G("translate(64,64) scale(0.78) translate(-150,-140)", wisp(true)),
	});
	LGMon.add("frozendead", {
		art: frozendeadArt,
		face: () => deadHead(64, 64, 1.2),
	});
	LGMon.add("polarbear", {
		art: polarbearArt,
		face: () => pbFace(64, 64, 1.18),
	});
	LGMon.add("icegolem", { art: golemArt, face: () => golemHead(64, 70, 1.25) });
	LGMon.add("frostgiant", {
		art: frostgiantArt,
		face: () => giantHead(64, 62, 1.1),
	});
	LGMon.add("jarl", { art: jarlArt, face: () => jarlHead(64, 68, 0.95) });
	LGMon.add("hirdman", { art: hirdmanArt, face: () => hirdHead(64, 66, 1.18) });
	LGMon.add("iceking", {
		art: icekingArt,
		face: () => kingHead(64, 76, 1.05, false),
	});
})();

(() => {
	const { INK, SW, o } = LGMon;
	const PAL = {
		grey: {
			fur: "#9b938a",
			dk: "#6f675f",
			lt: "#c9c0b4",
			belly: "#efe4d2",
			ear: "#e8a9a0",
		},
		tan: {
			fur: "#b08a62",
			dk: "#7d5d3f",
			lt: "#d6b48a",
			belly: "#f3e6cf",
			ear: "#eba69c",
		},
		dark: {
			fur: "#6e6a70",
			dk: "#47434a",
			lt: "#9c97a0",
			belly: "#d9d2cc",
			ear: "#d99a94",
		},
	};
	const eye = (x, y, r = 6.5, look = 0) =>
		`<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 1.08}" fill="#f2b544" ${o(2.6)}/><ellipse cx="${x + look}" cy="${y + 0.6}" rx="${r * 0.56}" ry="${r * 0.66}" fill="${INK}"/><circle cx="${x + look - r * 0.28}" cy="${y - r * 0.3}" r="${r * 0.26}" fill="#fff"/><circle cx="${x + look + r * 0.22}" cy="${y + r * 0.3}" r="${r * 0.11}" fill="#fff"/>`;

	function head(cx, cy, s, p, mood = "calm", tilt = 0) {
		const T = (d) => d;
		let g = `<g transform="translate(${cx},${cy}) rotate(${tilt}) scale(${s})">`;

		g += `<path d="M-22-12 L-30-46 Q-12-40 -6-22 Z" fill="${p.fur}" ${o()}/><path d="M22-12 L30-46 Q12-40 6-22 Z" fill="${p.fur}" ${o()}/>`;
		g += `<path d="M-20-16 L-26-38 Q-15-34 -11-23 Z" fill="${p.ear}"/><path d="M20-16 L26-38 Q15-34 11-23 Z" fill="${p.ear}"/>`;
		g += `<path d="M-24-20 L-28-40" stroke="${p.dk}" stroke-width="2" stroke-linecap="round"/><path d="M24-20 L28-40" stroke="${p.dk}" stroke-width="2" stroke-linecap="round"/>`;

		g += `<path d="M0-30 C18-30 30-20 31-6 L37 2 L31 6 L35 13 L27 15 C22 26 12 31 0 31 C-12 31 -22 26 -27 15 L-35 13 L-31 6 L-37 2 L-31-6 C-30-20 -18-30 0-30 Z" fill="${p.fur}" ${o()}/>`;

		g += `<path d="M-24-17 C-14-30 14-30 24-17 C16-21 8-19 4-12 L0-4 L-4-12 C-8-19 -16-21 -24-17 Z" fill="${p.dk}"/>`;

		g += `<path d="M-26 4 C-22-6 -12-8 -5-3 L0 0 L5-3 C12-8 22-6 26 4 C24 16 14 25 0 25 C-14 25 -24 16 -26 4 Z" fill="${p.belly}"/>`;

		g += `<path d="M-14-24 C-8-27 -2-27 2-26" fill="none" stroke="${p.lt}" stroke-width="3" stroke-linecap="round"/>`;

		g +=
			eye(-11, -4, 6.6, mood === "happy" ? 0.6 : 0) +
			eye(11, -4, 6.6, mood === "happy" ? 0.6 : 0);
		if (mood === "happy")
			g += `<path d="M-17-13 Q-11-16 -5-13" fill="none" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/><path d="M5-13 Q11-16 17-13" fill="none" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/>`;
		if (mood === "snarl")
			g += `<path d="M-18-13 L-5-9" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/><path d="M18-13 L5-9" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`;

		g += `<path d="M-6 7 Q0 4 6 7 Q5 12 0 13 Q-5 12 -6 7 Z" fill="${INK}"/><ellipse cx="-2" cy="7.6" rx="1.8" ry="1" fill="#8a7a72"/>`;
		if (mood === "happy")
			g += `<path d="M0 13 V16 M-8 15 Q-4 21 0 16 Q4 21 8 15" fill="none" ${o(2)}/><path d="M-4 18 Q0 25 4 18 Z" fill="#e2747a" ${o(1.6)}/>`;
		else if (mood === "snarl")
			g += `<path d="M-9 15 Q0 22 9 15 Q0 26 -9 15 Z" fill="#8a2f2f" ${o(1.8)}/><path d="M-6 16 L-5 19 L-4 16 M4 16 L5 19 L6 16" fill="#fff" stroke="${INK}" stroke-width="1"/>`;
		else
			g += `<path d="M0 13 V16 M-7 15 Q-3 19 0 16 Q3 19 7 15" fill="none" ${o(2)}/>`;

		g += `<circle cx="-9" cy="11" r=".9" fill="${p.dk}"/><circle cx="-12" cy="9.5" r=".9" fill="${p.dk}"/><circle cx="9" cy="11" r=".9" fill="${p.dk}"/><circle cx="12" cy="9.5" r=".9" fill="${p.dk}"/>`;
		return g + "</g>";
	}
	const shadow = (x, y, rx) =>
		`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${rx * 0.22}" fill="rgba(43,29,24,.22)"/>`;

	function sitting(x, y, s, p, mood = "calm", tilt = 0) {
		let g =
			`<g transform="translate(${x},${y}) scale(${s})">` + shadow(0, 56, 40);

		g += `<path d="M22 46 C46 46 52 26 44 14 C42 24 36 32 22 34 Z" fill="${p.fur}" ${o()}/><path d="M44 14 C47 20 46 26 43 30 C42 24 43 19 44 14 Z" fill="${p.belly}"/>`;

		g += `<path d="M-24 54 C-30 34 -24 8 0 6 C24 8 30 34 24 54 Z" fill="${p.fur}" ${o()}/>`;
		g += `<path d="M-12 52 C-16 36 -10 20 0 18 C10 20 16 36 12 52 Z" fill="${p.belly}"/>`;
		g += `<path d="M-20 30 C-22 38 -21 46 -18 52" fill="none" stroke="${p.dk}" stroke-width="2.4" stroke-linecap="round"/><path d="M20 30 C22 38 21 46 18 52" fill="none" stroke="${p.dk}" stroke-width="2.4" stroke-linecap="round"/>`;

		for (const sx of [-1, 1])
			g += `<path d="M${sx * 10} 28 L${sx * 10} 50 Q${sx * 10} 58 ${sx * 16} 58 Q${sx * 21} 58 ${sx * 19} 50 L${sx * 19} 30 Z" fill="${p.fur}" ${o()}/><path d="M${sx * 12} 56 V52 M${sx * 15.5} 57 V53" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/>`;
		g += head(0, -14, 1, p, mood, tilt);
		return g + "</g>";
	}

	function play(x, y, s, p) {
		let g =
			`<g transform="translate(${x},${y}) scale(${s})">` + shadow(4, 46, 54);
		g += `<path d="M34 6 C52 -6 62 -24 56 -36 C50 -26 44 -16 30 -10 Z" fill="${p.fur}" ${o()}/><path d="M56 -36 C59 -30 58 -22 54 -18 C54 -26 55 -31 56 -36 Z" fill="${p.belly}"/>`;
		g += `<path d="M22 44 L22 18 L34 14 L38 42 Q38 47 33 47 L27 47 Q22 47 22 44 Z" fill="${p.dk}" ${o()}/>`;
		g += `<path d="M-28 30 C-30 10 -10 -6 14 -12 C34 -16 44 0 40 18 C36 30 22 30 10 28 L-12 30 Z" fill="${p.fur}" ${o()}/>`;
		g += `<path d="M-14 28 C-8 18 6 14 20 18 C14 26 0 30 -14 28 Z" fill="${p.belly}"/>`;
		g += `<path d="M30 20 L32 44 Q32 49 27 49 L21 49 Q17 49 18 44 L20 24 Z" fill="${p.fur}" ${o()}/>`;

		g += `<path d="M-14 26 L-44 38 Q-52 41 -49 46 Q-46 49 -38 47 L-8 38 Z" fill="${p.dk}" ${o()}/><path d="M-8 30 L-36 44 Q-44 48 -40 52 Q-37 54 -30 51 L-2 40 Z" fill="${p.fur}" ${o()}/>`;
		g += `<path d="M-36 50 L-37 47 M-33 51 L-34 48" stroke="${INK}" stroke-width="1.5" stroke-linecap="round"/>`;
		g += head(-22, 6, 0.95, p, "happy", -12);
		return g + "</g>";
	}

	LGMon.add("wolfcub", {
		art: () => sitting(150, 140, 1.6, PAL.grey, "calm"),
		face: () => head(64, 70, 1.12, PAL.grey, "calm"),
	});
})();

(() => {
	const { INK, SW, o, eye, glowEye, shadow, shine, dk, lt } = LGMon;
	const ln = (d, c = INK, w = 2.2) =>
		`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
	const G = (x, y, s, inner, rot = 0) =>
		`<g transform="translate(${x},${y})${rot ? ` rotate(${rot})` : ""} scale(${s})">${inner}</g>`;
	const SCAR = "#d9776a";
	const scar = (d, w = 3.2) => ln(d, INK, w + 2.2) + ln(d, SCAR, w);

	function leg(x, top, bot, w, fill, hoof) {
		const a = x - w / 2,
			b = x + w / 2;
		let s = `<path d="M${a} ${top} L${a} ${bot - 5} Q${a} ${bot} ${a + 5} ${bot} L${b + 2} ${bot} Q${b + 4} ${bot} ${b} ${bot - 5} L${b} ${top} Z" fill="${fill}" ${o()}/>`;
		if (hoof)
			s +=
				`<path d="M${a} ${bot - 8} L${b} ${bot - 8} L${b} ${bot - 5} Q${b + 4} ${bot} ${b + 2} ${bot} L${a + 5} ${bot} Q${a} ${bot} ${a} ${bot - 5} Z" fill="${hoof}" ${o(3)}/>` +
				ln(`M${x} ${bot - 7} V${bot - 1}`, INK, 1.8);
		else
			s += ln(
				`M${a + 4} ${bot - 1} V${bot - 5} M${a + 8.5} ${bot} V${bot - 4}`,
				INK,
				1.6,
			);
		return s;
	}

	function foot(px, py, w, fill, hoof) {
		if (hoof)
			return (
				`<path d="M${px - w * 0.62} ${py} L${px - w * 0.5} ${py - 9} L${px + w * 0.55} ${py - 9} L${px + w * 0.62} ${py} Z" fill="${hoof}" ${o(3)}/>` +
				ln(
					`M${px - w * 0.05} ${py - 8} L${px - w * 0.1} ${py}`,
					lt(hoof, 0.35),
					1.8,
				)
			);
		return (
			`<path d="M${px - w * 0.78} ${py} Q${px - w * 0.8} ${py - 9} ${px - w * 0.1} ${py - 9} Q${px + w * 0.62} ${py - 9} ${px + w * 0.6} ${py} Z" fill="${fill}" ${o()}/>` +
			ln(
				`M${px - w * 0.42} ${py - 0.5} V${py - 4} M${px - w * 0.02} ${py} V${py - 4} M${px + w * 0.32} ${py - 0.5} V${py - 3.5}`,
				INK,
				1.6,
			)
		);
	}

	function fLeg(x, top, bot, w, fill, step = 0, hoof) {
		const a = x - w / 2,
			b = x + w / 2,
			ky = top + (bot - top) * 0.55,
			px = x + step,
			py = bot - Math.abs(step) * 0.35;
		const ks = step * 0.55,
			n = w * 0.36;
		let s = `<path d="M${a - 1} ${top} Q${a - 2} ${ky - 8} ${a + ks + 1} ${ky} Q${a + ks + 2} ${ky + 6} ${px - n} ${py - 7} L${px + n} ${py - 7} Q${b + ks - 1} ${ky + 6} ${b + ks} ${ky} Q${b + 2} ${ky - 10} ${b + 1} ${top} Z" fill="${fill}" ${o()}/>`;
		s += ln(`M${b + ks - 1.5} ${ky - 3} q2.5 3 0 6`, dk(fill, 0.35), 1.8);
		return s + foot(px, py, w, fill, hoof);
	}

	function hLeg(x, top, bot, w, fill, step = 0, hoof) {
		const H = bot - top,
			px = x + step - 2,
			py = bot - Math.abs(step) * 0.35,
			hx = x + w * 0.55 + step * 0.35,
			hy = top + H * 0.6,
			n = w * 0.36;
		let s = `<path d="M${x - w * 0.85} ${top} C${x - w * 1.0} ${top + H * 0.3} ${x - w * 0.3} ${top + H * 0.42} ${hx - w * 0.75} ${hy} L${px - n} ${py - 7} L${px + n} ${py - 7} L${hx + 1} ${hy} C${hx + w * 0.5} ${top + H * 0.4} ${x + w * 0.9} ${top + H * 0.22} ${x + w * 0.75} ${top} Z" fill="${fill}" ${o()}/>`;
		s += ln(
			`M${x - w * 0.5} ${top + H * 0.12} C${x - w * 0.6} ${top + H * 0.3} ${x} ${top + H * 0.42} ${x + w * 0.3} ${top + H * 0.46}`,
			dk(fill, 0.3),
			2,
		);
		return s + foot(px, py, w, fill, hoof);
	}

	const WP = {
		wolf: {
			fur: "#8f8273",
			dk: "#5f5449",
			lt: "#b9ab98",
			belly: "#ece0cc",
			ear: "#d99a8e",
			eye: "#f2b544",
		},
		alpha: {
			fur: "#68717e",
			dk: "#424852",
			lt: "#98a1ad",
			belly: "#ebe6dc",
			ear: "#d39a94",
			eye: "#f7c948",
		},
		dire: {
			fur: "#4b4448",
			dk: "#2c2629",
			lt: "#776c71",
			belly: "#a99a90",
			ear: "#b9706a",
			eye: "#ff9a2e",
		},
		oneeye: {
			fur: "#a35f3a",
			dk: "#6a3a21",
			lt: "#cf8f60",
			belly: "#f0dabd",
			ear: "#e09a86",
			eye: "#ff5537",
		},
		grey: {
			fur: "#cdd2da",
			dk: "#8b93a2",
			lt: "#f5f7fa",
			belly: "#ffffff",
			ear: "#e3b0b5",
			eye: "#8fe8ff",
		},
	};

	function wHead(p, f = {}) {
		let g = "";
		if (f.mane)
			g +=
				`<path d="M0-58 L12-46 L28-54 L32-38 L48-40 L44-24 L56-16 L46-4 L54 10 L42 16 L46 32 L30 32 L26 46 L12 38 L0 50 L-12 38 L-26 46 L-30 32 L-46 32 L-42 16 L-54 10 L-46-4 L-56-16 L-44-24 L-48-40 L-32-38 L-28-54 L-12-46 Z" fill="${p.dk}" ${o()}/>` +
				`<path d="M0-48 L10-38 L24-44 L26-30 L40-30 L36-18 L46-10" fill="none" stroke="${p.lt}" stroke-width="2.4" stroke-linecap="round"/>`;
		if (f.ruff)
			g +=
				`<path d="M-38-2 L-50 12 L-40 16 L-48 30 L-32 28 L-32 42 L-18 34 L-10 46 L0 36 L10 46 L18 34 L32 42 L32 28 L48 30 L40 16 L50 12 L38-2 Z" fill="${p.ruff || p.belly}" ${o()}/>` +
				ln(
					"M-36 26 L-28 22 M-14 36 L-8 30 M14 36 L8 30 M36 26 L28 22",
					dk(p.belly, 0.25),
					2,
				);
		const earL = f.torn
			? "M-24-16 L-31-50 L-25-45 L-23-50 L-19-44 Q-12-38 -8-26 Z"
			: "M-24-16 L-31-50 Q-12-41 -8-26 Z";
		g += `<path d="${earL}" fill="${p.fur}" ${o()}/><path d="M24-16 L31-50 Q12-41 8-26 Z" fill="${p.fur}" ${o()}/>`;
		g += `<path d="M-22-21 L-27-42 Q-17-37 -13-27 Z" fill="${p.ear}"/><path d="M22-21 L27-42 Q17-37 13-27 Z" fill="${p.ear}"/>`;
		g += `<path d="M0-32 C20-32 32-22 33-6 L42 4 L33 9 L38 18 L27 20 C23 30 12 37 0 37 C-12 37 -23 30 -27 20 L-38 18 L-33 9 L-42 4 L-33-6 C-32-22 -20-32 0-32 Z" fill="${p.fur}" ${o()}/>`;
		g += `<path d="M-26-18 C-14-31 14-31 26-18 C16-22 8-20 4-12 L0-3 L-4-12 C-8-20 -16-22 -26-18 Z" fill="${p.dk}"/>`;
		g += `<path d="M-29 6 C-25-4 -14-6 -6-2 L0 1 L6-2 C14-6 25-4 29 6 C27 20 16 32 0 33 C-16 32 -27 20 -29 6 Z" fill="${p.belly}"/>`;
		g += `<path d="M-7 0 C-6-4 6-4 7 0 L9 13 L-9 13 Z" fill="${p.lt}" opacity=".7"/>`;
		g += shine("M-15-26 C-9-29 -3-29 2-28", p.lt, 3);
		const ey = -6,
			angry = f.mood === "snarl";
		if (f.oneEye)
			g +=
				ln(`M-19 ${ey} Q-13 ${ey + 4} -7 ${ey}`, INK, 2.6) +
				scar("M-21-20 L-5 6") +
				ln("M-17-12 l4 2 M-13-5 l4 2", INK, 1.6);
		else g += f.glow ? glowEye(-13, ey, 5.6, p.eye) : eye(-13, ey, 5.8, p.eye);
		g += f.glow ? glowEye(13, ey, 5.6, p.eye) : eye(13, ey, 5.8, p.eye);
		if (angry) g += ln("M-22-15 L-6-10", INK, 3) + ln("M22-15 L6-10", INK, 3);
		else
			g +=
				ln("M-21-14 Q-14-16 -7-13", INK, 2.4) +
				ln("M21-14 Q14-16 7-13", INK, 2.4);
		if (f.scar) g += scar("M22-22 L10 2 M27-14 L18 4", 2.6);
		if (f.moon)
			g += `<path d="M-5-26 A8 8 0 1 0 5-14 A6 6 0 1 1 -5-26 Z" fill="${p.eye}" ${o(1.8)}/>`;
		g += `<path d="M-8 13 Q0 9 8 13 Q7 19 0 20 Q-7 19 -8 13 Z" fill="${INK}"/><ellipse cx="-2.5" cy="13.4" rx="2" ry="1.1" fill="#8a7a72"/>`;
		if (angry)
			g +=
				`<path d="M-13 23 Q0 19 13 23 Q9 35 0 35 Q-9 35 -13 23 Z" fill="#7a2a2a" ${o(2.2)}/><path d="M-11 23 L-8.5 30 L-6 23 Z M6 23 L8.5 30 L11 23 Z" fill="#fff" stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"/>` +
				ln("M-6 7 l-4-3 M6 7 l4-3", p.dk, 1.8);
		else g += ln("M0 20 V23 M-9 22 Q-4 27 0 23 Q4 27 9 22", INK, 2.2);
		g += `<circle cx="-11" cy="17" r="1" fill="${p.dk}"/><circle cx="-14" cy="15" r="1" fill="${p.dk}"/><circle cx="11" cy="17" r="1" fill="${p.dk}"/><circle cx="14" cy="15" r="1" fill="${p.dk}"/>`;
		return g;
	}

	function wolfBody(p, f = {}) {
		let g = shadow(8, 60, 70);
		if (f.tailUp)
			g += `<path d="M50-14 C64-24 78-40 82-62 C92-54 94-34 84-18 C78-8 66-2 54 0 Z" fill="${p.fur}" ${o()}/><path d="M82-62 C90-56 92-46 90-38 C86-44 84-52 82-62 Z" fill="${p.belly}"/>`;
		else
			g += `<path d="M50-12 C70-14 88 0 92 26 C93 35 85 37 81 30 C76 18 66 10 52 8 Z" fill="${p.fur}" ${o()}/><path d="M92 26 C93 35 85 37 81 30 C84 28 88 27 92 26 Z" fill="${p.belly}"/>`;
		const st = f.steps || [0, 0, 0, 0];
		g += fLeg(-16, 10, 60, 12, p.dk, st[1]) + hLeg(44, 4, 60, 12, p.dk, st[3]);
		if (f.hackles)
			g += `<path d="M-28-22 L-24-42 L-14-28 L-6-44 L2-30 L10-44 L16-30 L26-40 L30-24 Z" fill="${p.dk}" ${o()}/>`;
		g += `<path d="M-44-2 C-46-24 -20-32 10-30 C40-30 60-20 62 0 C64 18 54 30 38 30 L-26 30 C-40 30 -44 16 -44-2 Z" fill="${p.fur}" ${o()}/>`;
		g += `<path d="M-22-27 C0-32 32-31 52-20 C36-23 10-23 -18-19 Z" fill="${p.dk}"/>`;
		g += `<path d="M-30 29 C-14 18 18 17 40 29 Z" fill="${p.belly}"/>`;
		g += shine("M-6-25 C8-27 22-27 34-24", p.lt, 3);
		if (f.stripes) g += ln("M20-18 L14 0 M30-16 L26 2 M40-12 L38 4", p.dk, 3);
		if (f.bodyScar) g += scar("M14-14 L34 6 M22-18 L42 2");
		g += fLeg(-32, 8, 60, 13, p.fur, st[0]) + hLeg(30, 2, 60, 14, p.fur, st[2]);
		if (f.extra) g += f.extra;
		g += G(-46, -36 + (f.hdy || 0), f.hs || 0.92, wHead(p, f), f.htilt || 0);
		return g;
	}

	const fangs = (cx, cy, r, n, c = "#f4ecd6") => {
		let s = ln(
			`M${cx - r} ${cy} Q${cx} ${cy + r * 0.7} ${cx + r} ${cy}`,
			"#6a4a2a",
			3,
		);
		for (let i = 0; i < n; i++) {
			const t = (i + 0.5) / n,
				x = cx - r + 2 * r * t,
				y = cy + r * 0.7 * 4 * t * (1 - t) * 0.5;
			s += `<path d="M${x - 3} ${y} L${x} ${y + 9} L${x + 3} ${y} Z" fill="${c}" ${o(1.6)}/>`;
		}
		return s;
	};

	LGMon.add("wolf", {
		art: () =>
			G(
				146,
				144,
				1.08,
				wolfBody(WP.wolf, { mood: "alert", steps: [-10, 4, 6, -6], htilt: -8 }),
			),
		face: () => G(64, 72, 0.95, wHead(WP.wolf, { mood: "alert" })),
	});
	LGMon.add("alpha", {
		art: () =>
			G(
				144,
				140,
				1.16,
				wolfBody(WP.alpha, {
					mood: "alert",
					ruff: 1,
					tailUp: 1,
					scar: 1,
					steps: [-4, 2, 2, -2],
					hdy: -4,
					htilt: 6,
				}),
			),
		face: () =>
			G(64, 70, 0.92, wHead(WP.alpha, { mood: "alert", ruff: 1, scar: 1 })),
	});
	LGMon.add("direwolf", {
		art: () =>
			G(
				144,
				140,
				1.2,
				wolfBody(WP.dire, {
					mood: "snarl",
					hackles: 1,
					bodyScar: 1,
					scar: 1,
					hs: 0.95,
					steps: [-12, -2, 8, -8],
					hdy: 8,
				}),
			),
		face: () =>
			G(64, 72, 0.95, wHead(WP.dire, { mood: "snarl", scar: 1, torn: 1 })),
	});
	LGMon.add("oneeye", {
		art: () =>
			G(
				144,
				138,
				1.22,
				wolfBody(WP.oneeye, {
					mood: "snarl",
					oneEye: 1,
					torn: 1,
					hackles: 1,
					stripes: 1,
					glow: 1,
					ruff: 1,
					steps: [-8, 6, 10, -4],
					htilt: 10,
				}),
			),
		face: () =>
			G(
				64,
				70,
				0.92,
				wHead(WP.oneeye, {
					mood: "snarl",
					oneEye: 1,
					torn: 1,
					glow: 1,
					ruff: 1,
				}),
			),
	});
	LGMon.add("greywolf", {
		art: () =>
			`<circle cx="150" cy="100" r="88" fill="#cfe9f5" opacity=".35"/>` +
			G(
				152,
				142,
				1.26,
				wolfBody(WP.grey, {
					mood: "snarl",
					glow: 1,
					mane: 1,
					moon: 1,
					tailUp: 1,
					stripes: 1,
					steps: [-6, 6, 8, -6],
					extra: fangs(-46, 0, 26, 5),
				}),
			),
		face: () =>
			G(
				64,
				70,
				0.82,
				wHead(WP.grey, { mood: "snarl", glow: 1, mane: 1, moon: 1 }) +
					fangs(0, 36, 24, 5),
			),
	});

	const BP = {
		boar: {
			fur: "#8a5f42",
			dk: "#5e3d29",
			lt: "#b5876a",
			snout: "#e3a291",
			ear: "#d98c80",
			tusk: "#f6eedc",
			eye: "#e8b04a",
		},
		tusker: {
			fur: "#5d4434",
			dk: "#3a2a20",
			lt: "#86685a",
			snout: "#c98a7c",
			ear: "#b97468",
			tusk: "#fff4dc",
			eye: "#f29a3a",
		},
		eboar: {
			fur: "#3a2c2a",
			dk: "#1f1716",
			lt: "#62504c",
			snout: "#a8665c",
			ear: "#9a5a52",
			tusk: "#fff8e4",
			eye: "#ff7a2a",
		},
	};

	function pHead(p, t = 1, f = {}) {
		let g = "";
		g += `<path d="M-16-24 L-42-40 Q-40-16 -30-8 Z" fill="${p.fur}" ${o()}/><path d="M16-24 L42-40 Q40-16 30-8 Z" fill="${p.fur}" ${o()}/>`;
		g += `<path d="M-19-22 L-36-33 Q-35-19 -29-13 Z" fill="${p.ear}"/><path d="M19-22 L36-33 Q35-19 29-13 Z" fill="${p.ear}"/>`;
		g += `<path d="M-10-27 L-6-${38 + t * 4} L-1-29 L4-${40 + t * 4} L8-28 L13-${34 + t * 3} L14-24 Z" fill="${p.dk}" ${o(3)}/>`;
		g += `<path d="M0-30 C24-30 36-14 36 4 C36 24 22 34 0 34 C-22 34 -36 24 -36 4 C-36-14 -24-30 0-30 Z" fill="${p.fur}" ${o()}/>`;
		g += `<path d="M-30-6 C-20-22 20-22 30-6 C20-12 -20-12 -30-6 Z" fill="${p.dk}"/>`;
		g += shine("M-16-24 C-8-27 0-27 6-26", p.lt, 3);
		if (f.paint)
			g += `<path d="M-30 0 L-18-2 L-20 4 L-31 7 Z M30 0 L18-2 L20 4 L31 7 Z" fill="#c8402e"/>`;
		const ey = -5;
		g += f.glow
			? glowEye(-14, ey, 4.8, p.eye) + glowEye(14, ey, 4.8, p.eye)
			: eye(-14, ey, 4.9, p.eye) + eye(14, ey, 4.9, p.eye);
		g +=
			t > 1
				? ln("M-24-14 L-7-9", INK, 3.2) + ln("M24-14 L7-9", INK, 3.2)
				: ln("M-21-13 Q-14-15 -8-12", INK, 2.4) +
					ln("M21-13 Q14-15 8-12", INK, 2.4);
		if (f.scar) g += scar("M-26-18 L-8 6 M-20-20 L-4 0", 2.6);

		const T = [0, 0, 8, 18][t];
		g += `<path d="M-15 19 C${-25 - T * 0.5} 18 ${-30 - T * 0.6} ${6 - T} ${-27 - T * 0.4} ${-5 - T}  C${-23} ${4 - T * 0.2} -18 10 -11 13 Z" fill="${p.tusk}" ${o(2.6)}/>`;
		g += `<path d="M15 19 C${25 + T * 0.5} 18 ${30 + T * 0.6} ${6 - T} ${27 + T * 0.4} ${-5 - T}  C23 ${4 - T * 0.2} 18 10 11 13 Z" fill="${p.tusk}" ${o(2.6)}/>`;
		g += `<ellipse cx="0" cy="14" rx="17" ry="12" fill="${p.snout}" ${o()}/><path d="M-10 9 Q0 5 10 9" fill="none" stroke="${lt(p.snout, 0.4)}" stroke-width="2.4" stroke-linecap="round"/>`;
		g += `<ellipse cx="-6" cy="15" rx="3.2" ry="4.4" fill="${INK}"/><ellipse cx="6" cy="15" rx="3.2" ry="4.4" fill="${INK}"/>`;
		if (f.ring)
			g += `<path d="M-6 24 Q0 36 6 24" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="M-6 24 Q0 36 6 24" fill="none" stroke="#e8c35a" stroke-width="3" stroke-linecap="round"/>`;
		g += ln("M-8 29 Q0 31 8 29", INK, 2);
		return g;
	}
	function boarBody(p, t = 1, f = {}) {
		let g = shadow(8, 60, 74);
		g += `<path d="M60-6 q14-6 13 6 q-2 9 -9 4 q-4-4 1-6" fill="none" stroke="${INK}" stroke-width="3.6" stroke-linecap="round"/>`;
		const st = f.steps || [0, 0, 0, 0];
		g +=
			fLeg(-16, 14, 60, 14, p.dk, st[1], INK) +
			hLeg(42, 8, 60, 14, p.dk, st[3], INK);

		const mh = 6 + t * 5;
		g += `<path d="M-28-28 L-24-${34 + mh} L-14-36 L-6-${40 + mh} L4-40 L12-${40 + mh} L20-40 L30-${36 + mh} L36-34 L46-${28 + mh * 0.7} L50-22 Z" fill="${p.dk}" ${o()}/>`;
		g += `<path d="M-46 4 C-50-22 -26-38 6-40 C38-42 62-26 64 0 C66 22 54 34 36 34 L-26 34 C-42 34 -46 20 -46 4 Z" fill="${p.fur}" ${o()}/>`;
		g += `<path d="M-28 33 C-10 22 20 21 42 33 Z" fill="${p.lt}" opacity=".8"/>`;
		g += ln(
			"M10-28 l-4 10 M22-28 l-4 10 M34-24 l-4 10 M46-16 l-4 9",
			p.dk,
			2.4,
		);
		g += shine("M-4-34 C10-37 26-36 40-30", p.lt, 3);
		if (f.armor)
			g += `<path d="M2-38 C24-40 46-30 56-12 L44-6 C36-20 22-26 4-26 Z" fill="#7d7f86" ${o(3.4)}/><circle cx="16" cy="-31" r="2.4" fill="#d9dbe0"/><circle cx="32" cy="-27" r="2.4" fill="#d9dbe0"/><circle cx="46" cy="-17" r="2.4" fill="#d9dbe0"/>`;
		if (f.bodyScar) g += scar("M18-10 L38 12 M28-14 L46 4");
		g +=
			fLeg(-32, 14, 60, 15, p.fur, st[0], INK) +
			hLeg(28, 8, 60, 15, p.fur, st[2], INK);
		g += G(-44, -8 + (f.hdy || 0), f.hs || 0.95, pHead(p, t, f), f.htilt || 0);
		return g;
	}
	LGMon.add("boar", {
		art: () =>
			G(
				148,
				146,
				1.05,
				boarBody(BP.boar, 1, { steps: [-8, 4, 6, -4], htilt: -6 }),
			),
		face: () => G(64, 66, 1.05, pHead(BP.boar, 1)),
	});
	LGMon.add("tusker", {
		art: () =>
			G(
				148,
				144,
				1.16,
				boarBody(BP.tusker, 2, {
					scar: 1,
					bodyScar: 1,
					steps: [-10, 0, 8, -6],
					hdy: 6,
				}),
			),
		face: () => G(64, 68, 0.98, pHead(BP.tusker, 2, { scar: 1 })),
	});
	LGMon.add("e_boar", {
		art: () =>
			`<circle cx="150" cy="120" r="80" fill="#ffb070" opacity=".22"/>` +
			G(
				146,
				140,
				1.26,
				boarBody(BP.eboar, 3, {
					scar: 1,
					paint: 1,
					ring: 1,
					glow: 1,
					armor: 1,
					steps: [-12, 2, 6, -8],
					hdy: 4,
				}),
			),
		face: () =>
			G(
				64,
				70,
				0.9,
				pHead(BP.eboar, 3, { scar: 1, paint: 1, ring: 1, glow: 1 }),
			),
	});

	const CR = {
		body: "#3b3a4c",
		dk: "#25242f",
		lt: "#6f6f92",
		beak: "#5c5664",
		beakLt: "#8d8696",
		eye: "#ff6a3a",
	};
	function crowArt() {
		let g = shadow(4, 60, 52);

		g += `<path d="M-60 54 L-24 50" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M-60 54 L-24 50" stroke="#efe6d2" stroke-width="4.5" stroke-linecap="round"/><circle cx="-62" cy="51" r="4.5" fill="#efe6d2" ${o(2.4)}/><circle cx="-61" cy="58" r="4.5" fill="#efe6d2" ${o(2.4)}/><circle cx="-22" cy="47" r="4.5" fill="#efe6d2" ${o(2.4)}/><circle cx="-22" cy="54" r="4.5" fill="#efe6d2" ${o(2.4)}/>`;

		g +=
			ln("M-2 26 L-6 58 M-14 60 L-6 58 L2 61 M-6 58 L-8 62", INK, 3.4) +
			ln("M12 26 L14 58 M6 60 L14 58 L22 61", INK, 3.4);

		g += `<path d="M30 6 L76 22 L70 28 L80 34 L66 36 L74 44 L56 40 L28 24 Z" fill="${CR.dk}" ${o()}/>`;

		g += `<path d="M-24-10 C-28-36 -4-48 18-40 C42-32 50-8 42 10 C34 28 10 34 -6 28 C-18 22 -22 6 -24-10 Z" fill="${CR.body}" ${o()}/>`;

		g += `<path d="M-6-22 C16-32 44-20 56 6 L46 4 L50 14 L38 10 L40 20 L26 14 C10 8 -4-2 -6-22 Z" fill="${CR.dk}" ${o()}/>`;
		g += ln("M8-18 C22-20 34-12 42 0 M10-8 C20-8 28-2 34 6", CR.lt, 2.4);
		g += shine("M-14-30 C-6-38 6-40 14-38", CR.lt, 3);

		g += `<path d="M-34-24 L-40-14 L-30-16 L-30-4 L-20-12 L-14 0 L-10-14 Z" fill="${CR.body}" ${o(3.4)}/>`;
		g += `<path d="M-22-68 L-16-80 L-10-68 L-2-76 L-2-62 C6-52 2-36 -14-32 C-30-28 -44-38 -44-52 C-44-62 -36-68 -22-68 Z" fill="${CR.body}" ${o()}/>`;

		g += `<path d="M-40-58 C-56-58 -68-52 -76-44 C-64-44 -52-44 -40-44 Z" fill="${CR.beak}" ${o()}/><path d="M-40-44 L-70-44 C-60-40 -50-38 -40-38 Z" fill="${dk(CR.beak, 0.2)}" ${o(3)}/>`;
		g += shine("M-44-55 C-52-55 -60-52 -66-48", CR.beakLt, 2.4);
		g += eye(-26, -54, 6.4, CR.eye, -1.5) + ln("M-36-62 L-18-58", INK, 3);
		return g;
	}
	function crowFace() {
		let g = "";
		g += `<path d="M40 94 L34 104 L46 102 L50 109 L57 102 L64 110 L71 102 L78 109 L82 102 L94 104 L88 94 Z" fill="${CR.dk}" ${o()}/>`;
		g += `<path d="M52 30 L58 16 L64 28 L72 14 L74 30 C92 34 102 48 102 64 C102 86 86 102 64 102 C42 102 26 86 26 64 C26 46 36 34 52 30 Z" fill="${CR.body}" ${o()}/>`;
		g += shine("M38 46 C44 38 52 34 60 34", CR.lt, 3.4);
		g += eye(46, 58, 8.4, CR.eye) + eye(82, 58, 8.4, CR.eye);
		g += ln("M34 44 L56 52", INK, 3.6) + ln("M94 44 L72 52", INK, 3.6);
		g += `<path d="M50 66 Q64 58 78 66 L64 100 Z" fill="${CR.beak}" ${o()}/><path d="M64 62 L64 96" stroke="${CR.beakLt}" stroke-width="2.6" stroke-linecap="round"/><path d="M53 72 Q64 80 75 72" fill="none" stroke="${INK}" stroke-width="2.2"/>`;
		return g;
	}
	LGMon.add("crow", {
		art: () => G(156, 146, 1.05, crowArt()),
		face: () => crowFace(),
	});

	const RP = {
		fur: "#8c7058",
		dk: "#5f4a3a",
		lt: "#b8977a",
		belly: "#e8d8bf",
		pink: "#e6a49a",
	};
	function rHead(p) {
		let g = "";
		g += `<circle cx="-24" cy="-22" r="15" fill="${p.fur}" ${o()}/><circle cx="24" cy="-22" r="15" fill="${p.fur}" ${o()}/><circle cx="-24" cy="-22" r="9" fill="${p.pink}"/><circle cx="24" cy="-22" r="9" fill="${p.pink}"/>`;
		g += `<path d="M0-26 C18-26 28-14 28 0 C28 12 16 24 0 34 C-16 24 -28 12 -28 0 C-28-14 -18-26 0-26 Z" fill="${p.fur}" ${o()}/>`;
		g += `<path d="M-16 8 C-10 2 10 2 16 8 C12 18 6 26 0 30 C-6 26 -12 18 -16 8 Z" fill="${p.belly}"/>`;
		g += `<path d="M-14-20 C-6-25 6-25 14-20 C6-18 2-14 0-8 C-2-14 -6-18 -14-20 Z" fill="${p.dk}"/>`;
		g += eye(-10, -4, 5.2, "#c0392b") + eye(10, -4, 5.2, "#c0392b");
		g += ln("M-17-11 L-5-8", INK, 2.4) + ln("M17-11 L5-8", INK, 2.4);
		g +=
			`<rect x="-4.5" y="31" width="9" height="8" rx="1.5" fill="#fff8e6" ${o(2)}/>` +
			ln("M0 31 V38", INK, 1.4);
		g += `<ellipse cx="0" cy="29" rx="5" ry="3.6" fill="${p.pink}" ${o(2.2)}/>`;
		g += ln(
			"M-8 22 L-26 18 M-8 25 L-26 27 M8 22 L26 18 M8 25 L26 27",
			INK,
			1.4,
		);
		return g;
	}
	function ratArt(p) {
		let g = shadow(6, 60, 54);
		g += `<path d="M38 40 C64 50 92 40 96 14 C98 4 92-4 86-2" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M38 40 C64 50 92 40 96 14 C98 4 92-4 86-2" fill="none" stroke="${p.pink}" stroke-width="4.5" stroke-linecap="round"/>`;
		g += ln("M60 44 l1 5 M74 42 l2 5 M86 34 l4 3", INK, 1.6);
		g += `<path d="M-30 14 C-34-12 -12-24 12-22 C36-20 48-2 46 18 C44 34 32 42 16 42 L-12 42 C-26 42 -30 28 -30 14 Z" fill="${p.fur}" ${o()}/>`;
		g += `<path d="M-14 40 C-6 30 14 28 28 40 Z" fill="${p.belly}"/>`;
		g += shine("M0-18 C12-19 24-16 32-10", p.lt, 3);
		g += ln("M8-6 l4 6 M20-8 l3 6 M30-4 l3 5", p.dk, 2);

		g += `<ellipse cx="30" cy="56" rx="12" ry="6" fill="${p.pink}" ${o(3)}/><ellipse cx="-10" cy="56" rx="8" ry="5" fill="${p.pink}" ${o(3)}/><ellipse cx="6" cy="57" rx="8" ry="5" fill="${p.pink}" ${o(3)}/>`;
		g += `<path d="M30 30 C40 36 42 48 34 54" fill="none" ${o()}/>`;
		g += G(-26, -8, 0.82, rHead(p));
		return g;
	}
	LGMon.add("rat", {
		art: () => G(144, 150, 1.05, ratArt(RP)),
		face: () => G(64, 62, 1.12, rHead(RP)),
	});

	const SK = { skin: "#f0c49c", dk: "#cf9a72", blush: "#e9967f" };
	const hand = (x, y, r = 5.5) =>
		`<circle cx="${x}" cy="${y}" r="${r}" fill="${SK.skin}" ${o(3)}/>`;

	function hHead(kind, arrows) {
		let g = "";
		const HC = kind === "archer" ? "#557f3c" : "#76583c";
		if (kind === "archer" && arrows)
			g +=
				`<path d="M24-30 L40-58 L44-56 L30-28 Z" fill="#e9e2cf" ${o(2.6)}/>` +
				ln("M38-52 l5 3 M35-46 l5 3 M32-40 l5 3", "#b33", 1.8) +
				`<path d="M18-34 L28-52 M26-30 L40-46" stroke="${INK}" stroke-width="2.4"/><path d="M26-56 L28-52 L32-56 L30-62 Z M38-50 L40-46 L44-50 L42-56 Z" fill="#d9483a" ${o(1.8)}/>`;
		if (kind === "ataman") {
			g += `<ellipse cx="-27" cy="4" rx="6" ry="8" fill="${SK.skin}" ${o(3)}/><ellipse cx="27" cy="4" rx="6" ry="8" fill="${SK.skin}" ${o(3)}/><circle cx="29" cy="15" r="3.4" fill="none" stroke="${INK}" stroke-width="4"/><circle cx="29" cy="15" r="3.4" fill="none" stroke="#e8c35a" stroke-width="2"/>`;
			g += `<ellipse cx="0" cy="4" rx="27" ry="27" fill="${SK.skin}" ${o()}/>`;
			g += `<path d="M-30-12 C-34-40 -22-56 0-56 C22-56 34-40 30-12 C20-17 -20-17 -30-12 Z" fill="#2f2624" ${o()}/>`;
			g +=
				`<path d="M-20-44 C-14-56 14-56 20-44 C12-48 -12-48 -20-44 Z" fill="#b8342a" ${o(2.6)}/>` +
				ln("M0-55 V-46 M-6-50 H6", "#e8c35a", 2.4);
			g += ln(
				"M-26-24 l4-4 M-18-26 l3-5 M-8-28 l2-5 M4-28 l2-5 M14-27 l3-5 M24-24 l3-4",
				"#5a4a44",
				2,
			);
			g += `<path d="M-22-6 L-4-2 M22-6 L4-2" stroke="${INK}" stroke-width="4.2" stroke-linecap="round"/>`;
			g += eye(-10, 3, 4.2, "#6a8ad0") + eye(10, 3, 4.2, "#6a8ad0");
			g += scar("M14 8 L22 22", 2.4);
			g += `<path d="M-4 8 Q0 16 4 8" fill="${SK.dk}" ${o(2)}/>`;
			g += `<path d="M0 16 C-8 12 -22 13 -36 26 C-24 28 -12 24 0 21 C12 24 24 28 36 26 C22 13 8 12 0 16 Z" fill="#4a3226" ${o(2.8)}/>`;
			g += ln("M-8 27 Q0 30 8 27", INK, 2.2);
			g += `<ellipse cx="-17" cy="13" rx="4" ry="2.4" fill="${SK.blush}" opacity=".6"/><ellipse cx="17" cy="13" rx="4" ry="2.4" fill="${SK.blush}" opacity=".6"/>`;
			return g;
		}
		g += `<path d="M0-48 C8-44 14-44 18-42 C32-36 40-22 40-2 C40 20 34 34 26 42 L-26 42 C-34 34 -40 20 -40-2 C-40-24 -28-40 -12-44 C-6-46 -3-47 0-48 Z" fill="${HC}" ${o()}/>`;
		g += shine("M-26-30 C-18-38 -8-42 2-42", lt(HC, 0.3), 3);
		g += `<ellipse cx="0" cy="5" rx="25" ry="27" fill="${SK.skin}" ${o(3.4)}/>`;
		g += `<path d="M-25 2 C-24-17 -12-22 0-22 C12-22 24-17 25 2 C18-10 8-12 0-12 C-8-12 -18-10 -25 2 Z" fill="${dk(HC, 0.35)}"/>`;
		if (kind === "bandit") {
			g += eye(-9, 2, 4.6, "#7a4a2a") + eye(9, 2, 4.6, "#7a4a2a");
			g += ln("M-17-6 L-4-2", INK, 3.2) + ln("M17-6 L4-2", INK, 3.2);
			g += `<path d="M-26 10 C-12 17 12 17 26 10 L25 24 C16 36 -16 36 -25 24 Z" fill="#a8423a" ${o(3.4)}/>`;
			g += ln("M-18 22 Q0 28 18 22 M-12 30 Q0 33 12 30", dk("#a8423a", 0.3), 2);
			g += `<path d="M22 18 L38 28 L34 34 L26 26 L30 38 L22 36 Z" fill="#a8423a" ${o(2.6)}/>`;
		} else {
			g += eye(-9, 3, 4.6, "#5a7a3a") + ln("M5 3 Q9 1 14 3", INK, 2.6);
			g += ln("M-16-5 Q-9-8 -3-5", INK, 2.6) + ln("M16-7 L4-4", INK, 2.8);
			g += `<path d="M0 6 Q-4 12 0 14" fill="none" stroke="${SK.dk}" stroke-width="2.4" stroke-linecap="round"/>`;
			g += ln("M-6 21 Q2 24 9 19", INK, 2.4);
			for (const [x, y] of [
				[-12, 18],
				[-8, 24],
				[12, 17],
				[10, 24],
				[-4, 27],
				[4, 28],
				[-14, 23],
			])
				g += `<circle cx="${x}" cy="${y}" r="1" fill="${SK.dk}"/>`;
			g += `<ellipse cx="-16" cy="12" rx="4" ry="2.4" fill="${SK.blush}" opacity=".6"/>`;
		}
		return g;
	}
	function pants(c, boot, wide) {
		const w = wide ? 4 : 0;
		return (
			`<path d="M${-18 - w} 40 L${-17 - w} 52 L-3 52 L-2 40 Z M${18 + w} 40 L${17 + w} 52 L3 52 L2 40 Z" fill="${c}" ${o()}/>` +
			`<path d="M-18 50 L-3 50 L-3 60 L-22 60 Q-24 54 -18 50 Z M18 50 L3 50 L3 60 L22 60 Q24 54 18 50 Z" fill="${boot}" ${o()}/>`
		);
	}
	function banditArt() {
		let g = shadow(0, 60, 44);
		g += pants("#5a4a3e", "#3a2a22");

		g += `<path d="M-30 18 L-52-38" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="M-30 18 L-52-38" stroke="#9a6a3e" stroke-width="7" stroke-linecap="round"/>`;
		g += `<path d="M-46-30 C-60-34 -66-52 -58-62 C-48-70 -34-62 -36-46 Z" fill="#8a5c34" ${o()}/><circle cx="-54" cy="-50" r="2" fill="${INK}"/><circle cx="-46" cy="-58" r="2" fill="${INK}"/><circle cx="-44" cy="-44" r="2" fill="${INK}"/>`;
		g += `<path d="M-22-8 C-30 10 -30 34 -26 44 L26 44 C30 34 30 10 22-8 C12-14 -12-14 -22-8 Z" fill="#8a6a4a" ${o()}/>`;
		g +=
			`<rect x="6" y="8" width="12" height="11" fill="#a8885e" ${o(2.4)}/>` +
			ln("M8 10 l3 2 M14 10 l3 2 M8 16 l3 2", INK, 1.2);
		g += `<rect x="-28" y="26" width="56" height="8" fill="#4a3020" ${o(3)}/><rect x="-5" y="25" width="10" height="10" fill="#d9b44a" ${o(2.4)}/>`;

		g +=
			`<path d="M-20-4 C-30 2 -34 10 -32 18" fill="none" stroke="${INK}" stroke-width="13" stroke-linecap="round"/><path d="M-20-4 C-30 2 -34 10 -32 18" fill="none" stroke="#8a6a4a" stroke-width="8" stroke-linecap="round"/>` +
			hand(-31, 18);
		g += `<path d="M20-4 C28 4 32 14 32 24" fill="none" stroke="${INK}" stroke-width="13" stroke-linecap="round"/><path d="M20-4 C28 4 32 14 32 24" fill="none" stroke="#8a6a4a" stroke-width="8" stroke-linecap="round"/>`;
		g +=
			`<path d="M32 26 L44 40 L40 42 Z" fill="#d9dde3" ${o(2.4)}/>` +
			hand(32, 25);
		g += G(0, -36, 1, hHead("bandit"));
		return g;
	}
	function archerArt() {
		let g = shadow(0, 60, 44);

		g +=
			`<path d="M14-10 L36-50 L46-44 L26-4 Z" fill="#7a4a2a" ${o()}/>` +
			ln("M38-50 L44-62 M42-47 L50-58 M34-52 L36-66", INK, 2.4);
		g += `<path d="M42-62 l4-6 3 5 Z M48-58 l5-5 2 6 Z M34-66 l2-7 4 5 Z" fill="#d9483a" ${o(1.6)}/>`;
		g += pants("#4a4a3a", "#5a3a24");
		g += `<path d="M-22-8 C-30 10 -30 34 -26 44 L26 44 C30 34 30 10 22-8 C12-14 -12-14 -22-8 Z" fill="#6a7a3e" ${o()}/>`;
		g += `<path d="M14-10 L-20 34" stroke="${INK}" stroke-width="7"/><path d="M14-10 L-20 34" stroke="#7a4a2a" stroke-width="3.4"/>`;
		g += `<rect x="-28" y="26" width="56" height="8" fill="#5a3a24" ${o(3)}/><rect x="-5" y="25" width="10" height="10" fill="#c9c9c9" ${o(2.4)}/>`;

		g += `<path d="M-40-40 Q-70 6 -40 52" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><path d="M-40-40 Q-70 6 -40 52" fill="none" stroke="#b07a3e" stroke-width="5.5" stroke-linecap="round"/>`;
		g += ln("M-40-40 L-40 52", "#efe6d2", 1.6);
		g +=
			`<path d="M-18-4 C-30 0 -40 4 -50 6" fill="none" stroke="${INK}" stroke-width="13" stroke-linecap="round"/><path d="M-18-4 C-30 0 -40 4 -50 6" fill="none" stroke="#6a7a3e" stroke-width="8" stroke-linecap="round"/>` +
			hand(-52, 6);
		g +=
			`<path d="M20-4 C28 4 30 14 28 22" fill="none" stroke="${INK}" stroke-width="13" stroke-linecap="round"/><path d="M20-4 C28 4 30 14 28 22" fill="none" stroke="#6a7a3e" stroke-width="8" stroke-linecap="round"/>` +
			hand(28, 23);
		g += G(0, -36, 1, hHead("archer"));
		return g;
	}
	function atamanArt() {
		let g = shadow(0, 60, 52);
		g += pants("#3a4f8a", "#9a2a22", 1);

		g +=
			`<path d="M38 2 C54-20 58-46 50-74 C62-50 60-22 44 6 Z" fill="#dfe4ea" ${o(3.4)}/>` +
			shine("M50-64 C56-46 54-26 46-8", "#fff", 2);
		g += `<path d="M30 4 L48 12" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M30 4 L48 12" stroke="#e8c35a" stroke-width="3.4" stroke-linecap="round"/>`;
		g += `<path d="M-26-10 C-36 10 -36 34 -30 46 L30 46 C36 34 36 10 26-10 C14-16 -14-16 -26-10 Z" fill="#b03a2e" ${o()}/>`;
		g +=
			`<path d="M0-14 L0 46" stroke="#e8c35a" stroke-width="3.4"/>` +
			ln("M-6-4 h12 M-6 6 h12 M-6 16 h12", "#e8c35a", 2.6);
		g += `<path d="M-32 22 L32 22 L32 34 L-32 34 Z" fill="#e8b23a" ${o(3)}/><path d="M-30 32 L-38 50 L-30 50 L-26 34 Z" fill="#e8b23a" ${o(2.6)}/>`;

		g +=
			`<path d="M-24-4 C-40 2 -42 16 -30 22" fill="none" stroke="${INK}" stroke-width="15" stroke-linecap="round"/><path d="M-24-4 C-40 2 -42 16 -30 22" fill="none" stroke="#b03a2e" stroke-width="10" stroke-linecap="round"/>` +
			hand(-30, 22, 6.5);
		g +=
			`<path d="M24-4 C34-2 38 4 38 8" fill="none" stroke="${INK}" stroke-width="15" stroke-linecap="round"/><path d="M24-4 C34-2 38 4 38 8" fill="none" stroke="#b03a2e" stroke-width="10" stroke-linecap="round"/>` +
			hand(38, 6, 6.5);
		g += G(0, -38, 1, hHead("ataman"));
		return g;
	}
	LGMon.add("bandit", {
		art: () => G(150, 140, 1.12, banditArt()),
		face: () => G(64, 66, 0.98, hHead("bandit")),
	});
	LGMon.add("archer", {
		art: () => G(150, 140, 1.12, archerArt()),
		face: () => G(60, 66, 0.98, hHead("archer", 1)),
	});
	LGMon.add("ataman", {
		art: () => G(146, 136, 1.28, atamanArt()),
		face: () => G(64, 76, 1.0, hHead("ataman")),
	});
})();

(() => {
	const { INK, SW, o, eye, glowEye, shadow, shine, dk, lt } = LGMon;
	const P = (d, f, w = SW) => `<path d="${d}" fill="${f}" ${o(w)}/>`;
	const F = (d, f) => `<path d="${d}" fill="${f}"/>`;
	const L = (d, c = INK, w = 2) =>
		`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
	const E = (x, y, rx, ry, f, w = SW) =>
		`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}" ${o(w)}/>`;
	const C = (x, y, r, f, w = SW) => E(x, y, r, r, f, w);
	const G = (x, y, s, inner, r = 0) =>
		`<g transform="translate(${x},${y})${r ? ` rotate(${r})` : ""}${s !== 1 ? ` scale(${s})` : ""}">${inner}</g>`;
	const MIR = (inner, cx = 150) =>
		`<g transform="translate(${2 * cx},0) scale(-1,1)">${inner}</g>`;
	const both = (fn) => fn(-1) + fn(1);
	const STONE = { c: "#a29b8f", dk: "#7a7369", lt: "#c8c1b4" };

	const rock = (x, y, w, h, c = STONE) =>
		P(
			`M${x - w} ${y} L${x - w * 0.8} ${y - h * 0.7} L${x - w * 0.35} ${y - h} L${x + w * 0.4} ${y - h * 0.92} L${x + w * 0.85} ${y - h * 0.55} L${x + w} ${y} Z`,
			c.c,
		) +
		F(
			`M${x - w * 0.2} ${y} L${x + w * 0.1} ${y - h * 0.5} L${x + w * 0.85} ${y - h * 0.55} L${x + w} ${y} Z`,
			c.dk,
		) +
		L(
			`M${x - w * 0.7} ${y - h * 0.62} L${x - w * 0.35} ${y - h * 0.9} L${x + w * 0.3} ${y - h * 0.84}`,
			"rgba(255,255,255,.5)",
			3,
		);

	const GOAT = {
		fur: "#ece4d3",
		dk: "#bdb09a",
		lt: "#fffaf0",
		horn: "#8f7a5c",
		hdk: "#5e4c38",
		muz: "#e6c8b8",
		hoof: "#4a3a30",
		beard: "#d6cab2",
	};
	const goatEye = (x, y, r) =>
		`<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.95}" fill="#f0c45a" ${o(2.4)}/><rect x="${x - r * 0.7}" y="${y - r * 0.3}" width="${r * 1.4}" height="${r * 0.6}" rx="${r * 0.28}" fill="${INK}"/><circle cx="${x - r * 0.3}" cy="${y - r * 0.45}" r="${r * 0.24}" fill="#fff"/><circle cx="${x + r * 0.3}" cy="${y + r * 0.42}" r="${r * 0.11}" fill="#fff"/>`;
	function goatHead(p = GOAT) {
		let s = "";
		s += both(
			(k) =>
				P(
					`M${k * 7} -22 C${k * 12} -46 ${k * 40} -56 ${k * 50} -36 C${k * 54} -28 ${k * 50} -18 ${k * 44} -12 C${k * 44} -24 ${k * 38} -34 ${k * 28} -32 C${k * 21} -30 ${k * 18} -24 ${k * 17} -18 Z`,
					p.horn,
				) +
				L(
					`M${k * 12} -30 l${k * 7} -6 M${k * 20} -38 l${k * 5} -7 M${k * 30} -42 l${k * 2} -8 M${k * 40} -40 l${k * -2} -7`,
					p.hdk,
					2.2,
				) +
				L(
					`M${k * 10} -32 C${k * 14} -44 ${k * 30} -50 ${k * 42} -46`,
					"rgba(255,255,255,.35)",
					2.4,
				),
		);
		s += both(
			(k) =>
				P(
					`M${k * 17} -10 C${k * 28} -18 ${k * 40} -14 ${k * 44} -7 C${k * 36} -1 ${k * 26} -1 ${k * 18} -3 Z`,
					p.fur,
				) +
				F(
					`M${k * 21} -8 C${k * 28} -12 ${k * 36} -10 ${k * 39} -7 C${k * 33} -4 ${k * 26} -4 ${k * 21} -5 Z`,
					"#e8b0a6",
				),
		);
		s += P(
			`M0 -28 C14 -28 22 -18 21 -4 C20 10 14 26 0 30 C-14 26 -20 10 -21 -4 C-22 -18 -14 -28 0 -28 Z`,
			p.fur,
		);
		s += F(`M-5 -24 L5 -24 L3 6 L-3 6 Z`, p.dk);
		s += F(
			`M-12 14 C-12 6 12 6 12 14 C12 24 6 30 0 30 C-6 30 -12 24 -12 14 Z`,
			p.muz,
		);
		s +=
			P(`M-8 25 C-6 38 -2 46 0 52 C2 46 6 38 8 25 Q0 29 -8 25 Z`, p.beard, 3) +
			L("M-2 32 L-1 44 M3 31 L2 42", dk(p.beard, 0.2), 1.6);
		s += P(`M-9 -25 Q-4 -36 0 -28 Q4 -36 9 -25 Q0 -21 -9 -25 Z`, p.fur, 3);
		s += goatEye(-11, -6, 7) + goatEye(11, -6, 7);
		s +=
			`<ellipse cx="-4" cy="16" rx="1.8" ry="2.6" fill="${INK}"/><ellipse cx="4" cy="16" rx="1.8" ry="2.6" fill="${INK}"/>` +
			L("M-5 23 Q0 26 5 23", INK, 2);
		s += L("M-14 -22 C-10 -26 -6 -27 -2 -27", p.lt, 3);
		return s;
	}
	function goatArt() {
		const p = GOAT;
		let s = shadow(150, 216, 86) + rock(150, 214, 84, 40);
		const leg = (x, c) =>
			P(`M${x} 130 L${x + 1} 174 L${x + 11} 174 L${x + 12} 142 Z`, c) +
			P(`M${x} 172 h12 l1 7 h-14 Z`, p.hoof, 3);
		s += leg(116, p.dk) + leg(182, p.dk);
		s += P(
			`M118 134 L122 152 L130 144 L136 154 L144 145 L150 155 L158 145 L166 154 L172 144 L180 151 L190 134 Z`,
			p.dk,
		);
		s += leg(128, p.fur) + leg(194, p.fur);
		s += '<g transform="translate(0,-14)">';
		s += P(
			`M202 118 C212 106 216 96 209 94 C204 102 200 108 196 114 Z`,
			p.fur,
			3.5,
		);
		s += P(
			`M108 122 C106 104 128 98 160 100 C190 102 206 112 206 132 C206 150 190 160 160 160 C130 160 110 150 108 122 Z`,
			p.fur,
		);
		s += F(
			`M118 146 C140 158 182 158 202 142 C198 152 186 160 160 160 C136 160 122 154 118 146 Z`,
			p.dk,
		);
		s += shine("M128 108 C146 102 172 102 190 110");
		s += P(
			`M112 126 C104 110 100 96 104 84 L126 88 C122 100 124 110 134 120 Z`,
			p.fur,
		);
		s += G(112, 76, 0.95, goatHead(p), -6) + "</g>";
		return s;
	}
	LGMon.add("goat", { art: goatArt, face: () => G(64, 72, 0.8, goatHead()) });

	const KOB = {
		c: "#d4743c",
		dk: "#9a4a22",
		lt: "#eea06a",
		belly: "#f2cc94",
		metal: "#8d939c",
		mdk: "#5f646c",
		wood: "#9a6a3e",
	};
	function kobHead(p = KOB) {
		let s = "";
		s += both(
			(k) =>
				P(
					`M${k * 16} -4 L${k * 42} -20 L${k * 36} -8 L${k * 44} 0 L${k * 34} 3 L${k * 38} 12 L${k * 18} 8 Z`,
					p.c,
				) + L(`M${k * 20} 0 L${k * 36} -10 M${k * 21} 4 L${k * 34} 4`, p.dk, 2),
		);
		s += P(
			`M0 -24 C16 -24 25 -14 25 0 C25 10 19 17 12 19 L-12 19 C-19 17 -25 10 -25 0 C-25 -14 -16 -24 0 -24 Z`,
			p.c,
		);
		s += P(
			`M-14 7 C-14 1 14 1 14 7 C14 19 8 27 0 27 C-8 27 -14 19 -14 7 Z`,
			p.belly,
			3.5,
		);
		s += `<circle cx="-4" cy="11" r="1.8" fill="${INK}"/><circle cx="4" cy="11" r="1.8" fill="${INK}"/>`;
		s +=
			P("M-10 19 Q0 25 10 19 Q0 23 -10 19 Z", "#7a2a2a", 2.2) +
			F("M-7 20 l2 3 l2 -2.4 Z M3 21 l2 2.6 l2 -3 Z", "#fff");
		s +=
			P(`M-23 -10 C-23 -30 23 -30 23 -10 Z`, p.metal) +
			P(
				`M-28 -12 C-20 -8 20 -8 28 -12 L28 -7 C20 -3 -20 -3 -28 -7 Z`,
				p.mdk,
				3.5,
			);
		s +=
			L("M-14 -22 C-8 -26 0 -27 6 -26", "rgba(255,255,255,.6)", 3) +
			`<circle cx="-12" cy="-14" r="1.6" fill="${p.mdk}"/><circle cx="12" cy="-14" r="1.6" fill="${p.mdk}"/>`;
		s +=
			P("M-5 -40 h10 v12 h-10 Z", "#f3ead2", 3) +
			`<circle cx="0" cy="-48" r="9" fill="#ffd25a" opacity=".35"/>` +
			P("M0 -55 C5 -49 5 -44 0 -42 C-5 -44 -5 -49 0 -55 Z", "#ffb43a", 2.4) +
			F("M0 -50 C2 -47 2 -45 0 -44 C-2 -45 -2 -47 0 -50 Z", "#fff2a8");
		s +=
			eye(-10, 0, 6.2, "#f2d34a", 0.5, true) +
			eye(10, 0, 6.2, "#f2d34a", 0.5, true);
		return s;
	}
	function kobArt() {
		const p = KOB;
		let s = shadow(150, 214, 56);
		s +=
			P("M164 192 C192 198 208 186 210 166 C202 178 188 184 168 182 Z", p.c) +
			L("M180 188 l3 -5 M192 186 l2 -6", p.dk, 2);
		s += both(
			(k) =>
				P(
					`M${150 + k * 12 - 8} 176 L${150 + k * 12 - 9} 204 L${150 + k * 12 + 9} 204 L${150 + k * 12 + 8} 176 Z`,
					p.c,
				) +
				E(150 + k * 12 + k * 3, 208, 12, 5.5, p.c, 3.5) +
				L(
					`M${150 + k * 12 + k * 9} 206 l${k * 4} 3 M${150 + k * 12 + k * 3} 207 l${k * 2} 4`,
					INK,
					1.8,
				),
		);
		s += P("M124 186 C118 160 126 132 150 130 C174 132 182 160 176 186 Z", p.c);
		s +=
			F(
				"M136 184 C132 166 138 146 150 144 C162 146 168 166 164 184 Z",
				p.belly,
			) + L("M140 156 h20 M138 166 h24 M138 176 h24", dk(p.belly, 0.15), 1.6);
		s +=
			P(
				"M124 176 C140 182 160 182 176 176 L176 183 C160 189 140 189 124 183 Z",
				"#6a4a30",
				3,
			) + P("M156 180 h12 v10 h-12 Z", "#8a6440", 2.6);
		s += P("M106 196 L196 108 L203 115 L113 203 Z", p.wood, 3.5);
		s +=
			P(
				"M178 100 C192 88 214 92 224 108 C212 102 202 104 196 112 L190 106 C186 104 182 102 178 100 Z",
				p.metal,
				3.5,
			) + L("M184 98 C194 92 206 94 214 100", "rgba(255,255,255,.6)", 2.4);
		s +=
			P("M130 144 C118 154 118 166 126 172", p.c) +
			C(128, 172, 7, p.c, 3.5) +
			P("M170 140 C180 136 184 130 186 126", p.c) +
			C(184, 126, 7, p.c, 3.5);
		s += G(150, 104, 1.15, kobHead(p));
		return s;
	}
	LGMon.add("kobold", { art: kobArt, face: () => G(64, 74, 0.95, kobHead()) });

	const HAR = {
		f: "#8a6aa8",
		dk: "#5d4478",
		lt: "#b49ad0",
		hair: "#3a2650",
		skin: "#c7bccb",
		leg: "#e0b04a",
	};
	function harHead(p = HAR) {
		let s = "";
		s += P(
			"M-26 8 L-40 -6 L-29 -12 L-38 -30 L-23 -27 L-25 -44 L-10 -33 L0 -48 L10 -33 L25 -44 L23 -27 L38 -30 L29 -12 L40 -6 L26 8 Z",
			p.hair,
		);
		s += F(
			"M-18 -24 L-14 -38 L-6 -30 L0 -42 L6 -30 L14 -38 L18 -24 Z",
			lt(p.hair, 0.2),
		);
		s += both((k) =>
			P(`M${k * 19} -2 L${k * 33} -12 L${k * 22} 8 Z`, p.skin, 3.5),
		);
		s += P(
			"M0 -24 C14 -24 22 -14 22 0 C22 14 12 26 0 28 C-12 26 -22 14 -22 0 C-22 -14 -14 -24 0 -24 Z",
			p.skin,
		);
		s += P(
			"M-22 -2 C-20 -20 -10 -27 0 -27 C10 -27 20 -20 22 -2 L15 -10 L9 -2 L3 -13 L-3 -2 L-9 -13 L-15 -2 Z",
			p.hair,
			3.5,
		);
		s += F("M-18 8 L-11 13 L-16 14 Z M18 8 L11 13 L16 14 Z", p.f);
		s += eye(-9, 3, 6, "#ffd84a") + eye(9, 3, 6, "#ffd84a");
		s += L("M-16 -5 L-4 -1 M16 -5 L4 -1", INK, 2.6);
		s += P("M-3 8 L3 8 L0 15 Z", p.leg, 2);
		s +=
			P("M-8 19 Q0 22 8 19 Q0 27 -8 19 Z", "#6e2a3a", 2) +
			F("M-6 20 l1.5 3 l1.5 -2.6 Z M3 20.4 l1.5 2.6 l1.5 -3 Z", "#fff");
		return s;
	}
	function harWing(p) {
		return (
			P(
				"M136 122 C110 96 76 82 48 90 C60 98 66 104 68 110 C58 112 52 118 50 128 C62 128 70 130 76 136 C68 142 66 150 66 158 C88 150 110 146 132 150 Z",
				p.f,
			) +
			F(
				"M68 110 C58 112 52 118 50 128 C62 128 70 130 76 136 C68 142 66 150 66 158 C80 152 92 150 100 148 C92 140 84 128 68 110 Z",
				p.dk,
			) +
			L(
				"M128 128 C110 118 90 110 68 110 M126 138 C110 132 92 130 76 136 M128 146 C112 144 96 146 82 150",
				p.dk,
				2.2,
			) +
			L("M60 94 C84 88 108 96 126 112", "rgba(255,255,255,.4)", 3)
		);
	}
	function harArt() {
		const p = HAR;
		let s = shadow(152, 216, 60) + rock(152, 214, 56, 26);
		s += harWing(p) + MIR(harWing(p), 150);
		s += both(
			(k) =>
				L(`M${150 + k * 9} 166 L${150 + k * 11} 194`, INK, 9) +
				L(`M${150 + k * 9} 166 L${150 + k * 11} 194`, p.leg, 4.5) +
				L(
					`M${150 + k * 11} 194 l${k * -6} 4 M${150 + k * 11} 194 l0 6 M${150 + k * 11} 194 l${k * 7} 3`,
					INK,
					3.4,
				),
		);
		s += P(
			"M128 160 C122 136 130 112 150 110 C170 112 178 136 172 160 C166 174 134 174 128 160 Z",
			p.f,
		);
		s += F(
			"M138 160 C134 144 140 126 150 124 C160 126 166 144 162 160 C158 166 142 166 138 160 Z",
			p.lt,
		);
		s += L(
			"M142 134 q4 4 8 0 q4 4 8 0 M140 144 q5 4 10 0 q5 4 10 0 M141 154 q4.5 4 9 0 q4.5 4 9 0",
			p.dk,
			1.8,
		);
		s += G(150, 92, 1, harHead(p));
		return s;
	}
	LGMon.add("harpy", { art: harArt, face: () => G(64, 72, 0.98, harHead()) });

	const TRO = {
		c: "#87918a",
		dk: "#5c665f",
		lt: "#adb6ad",
		moss: "#6f9a4a",
		mdk: "#4e7432",
		tusk: "#f3ead2",
		wood: "#8a6440",
	};
	function troHead(p = TRO) {
		let s = "";
		s += both(
			(k) =>
				P(`M${k * 24} -6 L${k * 42} -18 L${k * 32} 6 Z`, p.c) +
				F(`M${k * 28} -6 L${k * 37} -13 L${k * 31} 1 Z`, p.dk),
		);
		s += P(
			"M0 -26 C20 -26 31 -14 31 2 C31 20 18 31 0 31 C-18 31 -31 20 -31 2 C-31 -14 -20 -26 0 -26 Z",
			p.c,
		);
		s += L("M-20 -18 l5 6 l-2 5 M22 8 l-5 4 l1 5", p.dk, 2);
		s += P(
			"M-14 -24 Q-10 -36 -4 -26 Q0 -38 6 -26 Q12 -35 15 -23 Q0 -18 -14 -24 Z",
			p.moss,
			3,
		);
		s += F(
			"M-27 -6 C-18 -17 -6 -14 0 -10 C6 -14 18 -17 27 -6 C18 -8 6 -5 0 -3 C-6 -5 -18 -8 -27 -6 Z",
			p.dk,
		);
		s += eye(-11, -1, 4.8, "#f2d34a") + eye(11, -1, 4.8, "#f2d34a");
		s += L("M-22 -9 L-4 -5 M22 -9 L4 -5", INK, 2.6);
		s +=
			P("M-6 -3 C-13 6 -13 15 -4 17 L4 17 C13 15 13 6 6 -3 Z", p.lt, 3.5) +
			L("M-4 13 q-3 -1 -3 -4 M4 13 q3 -1 3 -4", INK, 1.8);
		s += P("M-19 20 Q0 30 19 20 Q0 24 -19 20 Z", "#3a2a24", 2.6);
		s += both((k) =>
			P(`M${k * 14} 23 L${k * 12} 12 L${k * 8} 22.5 Z`, p.tusk, 2),
		);
		s += L("M-16 -18 C-8 -22 4 -22 10 -21", "rgba(255,255,255,.45)", 3);
		return s;
	}
	function troArt() {
		const p = TRO;
		let s = shadow(150, 216, 92);
		s +=
			P("M200 178 L244 210 C250 216 260 210 256 200 L210 168 Z", p.wood) +
			F(
				"M244 210 C250 216 260 210 256 200 L248 196 C252 204 248 208 242 206 Z",
				dk(p.wood),
			) +
			both((k) => "") +
			`<circle cx="236" cy="198" r="2.4" fill="${INK}"/><circle cx="248" cy="204" r="2" fill="${INK}"/>`;
		s += both((k) =>
			P(
				`M${150 + k * 34} 186 L${150 + k * 38} 208 Q${150 + k * 38} 216 ${150 + k * 30} 216 L${150 + k * 14} 216 L${150 + k * 14} 194 Z`,
				p.c,
			),
		);
		s += L("M118 214 v-5 M126 215 v-5 M174 215 v-5 M182 214 v-5", INK, 1.8);
		s += P(
			"M102 190 C86 150 100 98 150 94 C200 98 214 150 198 190 C188 204 112 204 102 190 Z",
			p.c,
		);
		s +=
			F("M122 196 C116 168 128 140 150 140 C172 140 184 168 178 196 Z", p.lt) +
			L("M132 158 q18 6 36 0 M130 172 q20 6 40 0", dk(p.lt, 0.15), 1.8);
		s += F("M104 188 C96 160 98 130 112 112 C106 140 108 170 118 196 Z", p.dk);
		s +=
			P("M110 114 L124 100 L142 104 L134 120 Z", p.dk, 3) +
			P("M190 114 L176 100 L158 104 L166 120 Z", p.dk, 3);
		s +=
			P(
				"M114 110 Q118 96 130 100 Q136 92 146 98 Q140 108 128 110 Q120 116 114 110 Z",
				p.moss,
				3,
			) +
			P(
				"M186 108 Q184 96 172 98 Q166 92 158 98 Q164 106 174 108 Q180 114 186 108 Z",
				p.moss,
				3,
			);
		s +=
			P(
				"M106 124 C86 142 80 180 86 204 L104 206 C104 182 108 158 122 142 Z",
				p.c,
			) +
			C(95, 206, 11, p.c) +
			L("M88 210 l2 -4 M95 213 v-5 M102 211 l-2 -4", INK, 1.8);
		s +=
			P(
				"M194 124 C214 138 222 160 214 178 L198 174 C202 160 198 148 184 140 Z",
				p.c,
			) + C(206, 180, 11, p.c);
		s += G(150, 98, 0.92, troHead(p));
		return s;
	}
	LGMon.add("troll", { art: troArt, face: () => G(64, 66, 1.1, troHead()) });

	const DWF = {
		skin: "#eab48e",
		sdk: "#c88a66",
		beard: "#b0602e",
		bdk: "#7d3e1a",
		metal: "#9aa0a8",
		mdk: "#666b72",
		bone: "#efe4c8",
		tunic: "#5f7a52",
		tdk: "#40563a",
		cloak: "#6e5a4a",
		boot: "#4a3426",
	};
	function dwfHead(p = DWF) {
		let s = "";
		s +=
			P(
				"M-21 -16 C-36 -20 -44 -34 -40 -48 C-34 -38 -28 -32 -19 -27 Z",
				p.bone,
				3.5,
			) + L("M-30 -26 l3 -4 M-36 -34 l4 -2", dk(p.bone, 0.25), 1.8);
		s += P(
			"M21 -16 C29 -18 34 -24 35 -29 L31 -27 L33 -33 L27 -28 L19 -26 Z",
			p.bone,
			3.5,
		);
		s += P("M-21 -4 C-21 12 -14 19 0 19 C14 19 21 12 21 -4 Z", p.skin);
		s +=
			P("M-24 -6 C-24 -32 24 -32 24 -6 Z", p.metal) +
			P("M-27 -9 h54 v7 h-54 Z", p.mdk, 3.5) +
			L("M-14 -24 C-8 -27 0 -28 6 -27", "rgba(255,255,255,.6)", 3) +
			L("M0 -29 v19", p.mdk, 2.4);
		s += both(
			(k) => `<circle cx="${k * 18}" cy="-5.5" r="1.6" fill="${p.bone}"/>`,
		);
		s += eye(-9, 3, 5, "#7aa6d8") + L("M-15 -2 l11 1", p.bdk, 3);
		s +=
			L("M-20 -1 L22 13", INK, 2) +
			E(9, 4, 6, 5.4, INK, 2) +
			L("M16 7 l-4 6", "#c94a4a", 0);
		s += L("M-18 8 l5 4", "#c94a4a", 1.8);
		s += P(
			"M-22 4 C-26 22 -20 40 -8 48 L-4 40 L0 50 L4 40 L8 48 C20 40 26 22 22 4 C16 12 8 15 0 15 C-8 15 -16 12 -22 4 Z",
			p.beard,
		);
		s += L(
			"M-12 22 C-12 30 -8 36 -6 40 M0 22 V42 M12 22 C12 30 8 36 6 40",
			p.bdk,
			2,
		);
		s += E(0, 9, 6.5, 5.4, p.sdk, 3);
		s += P(
			"M-15 15 C-8 11 -2 13 0 15 C2 13 8 11 15 15 C10 20 4 19 0 17 C-4 19 -10 20 -15 15 Z",
			p.bdk,
			2.4,
		);
		return s;
	}
	function dwfArt() {
		const p = DWF;
		let s = shadow(150, 216, 62);
		s += P(
			"M118 132 C100 160 98 194 104 212 L114 204 L122 212 L132 204 L150 210 L168 204 L178 212 L186 204 L196 212 C202 194 200 160 182 132 Z",
			p.cloak,
		);
		s += both(
			(k) =>
				P(
					`M${150 + k * 6} 190 L${150 + k * 6} 206 L${150 + k * 24} 206 L${150 + k * 22} 190 Z`,
					p.tdk,
					3.5,
				) +
				P(
					`M${150 + k * 4} 204 L${150 + k * 4} 214 L${150 + k * 30} 214 C${150 + k * 30} 206 ${150 + k * 24} 204 ${150 + k * 20} 204 Z`,
					p.boot,
					3.5,
				),
		);
		s += P(
			"M118 196 C112 166 120 140 150 138 C180 140 188 166 182 196 Z",
			p.tunic,
		);
		s += F(
			"M120 192 C116 172 120 152 132 142 C126 160 126 178 130 196 Z",
			p.tdk,
		);
		s +=
			P(
				"M116 176 C138 182 162 182 184 176 L184 186 C162 192 138 192 116 186 Z",
				"#5a3e28",
				3,
			) + P("M144 176 h14 v12 h-14 Z", "#d9b44a", 2.6);
		s += L("M180 182 L228 82", INK, 10) + L("M180 182 L228 82", "#8a6440", 5);
		s +=
			P("M212 70 L240 82 L234 98 L206 86 Z", p.metal, 3.5) +
			F("M222 76 L240 82 L234 98 L218 91 Z", p.mdk) +
			L("M214 74 L232 82", "rgba(255,255,255,.6)", 2);
		s +=
			P("M180 148 C194 154 202 150 204 144", p.tunic) +
			C(204, 140, 8, p.skin, 3.5);
		s +=
			P("M120 148 C108 158 108 170 114 176", p.tunic) +
			C(115, 176, 8, p.skin, 3.5);
		s += G(150, 112, 1.05, dwfHead(p));
		return s;
	}
	LGMon.add("dwarf", { art: dwfArt, face: () => G(66, 62, 0.88, dwfHead()) });

	const EAG = {
		body: "#7a5236",
		dk: "#4f3220",
		head: "#d2a466",
		hdk: "#a77a44",
		beak: "#f2c14e",
		bdk: "#b8862a",
		leg: "#f2c14e",
	};
	function eagHead(p = EAG) {
		let s = "";
		s += P("M-10 -24 L-6 -36 L0 -26 L6 -38 L10 -24 Z", p.head, 3);
		s += both((k) =>
			P(
				`M${k * 22} 2 L${k * 34} 8 L${k * 24} 12 L${k * 30} 20 L${k * 14} 20 Z`,
				p.head,
				3.5,
			),
		);
		s += P(
			"M0 -26 C16 -26 26 -14 26 2 C26 14 18 22 0 24 C-18 22 -26 14 -26 2 C-26 -14 -16 -26 0 -26 Z",
			p.head,
		);
		s += F(
			"M-20 10 C-16 18 -8 22 0 22 C8 22 16 18 20 10 C12 14 -12 14 -20 10 Z",
			p.hdk,
		);
		s += L("M-14 -20 C-8 -24 0 -24 6 -23", "rgba(255,255,255,.5)", 3);
		s +=
			P("M-23 -11 L-3 -5 L-4 -1 L-22 -5 Z", p.dk, 2) +
			P("M23 -11 L3 -5 L4 -1 L22 -5 Z", p.dk, 2);
		s += eye(-11, 0, 5.4, "#f2c14e") + eye(11, 0, 5.4, "#f2c14e");
		s +=
			P(
				"M-9 4 C-9 -2 9 -2 9 4 C9 13 4 20 0 25 C-4 20 -9 13 -9 4 Z",
				p.beak,
				3.5,
			) +
			F("M-4 17 C-2 21 -1 23 0 25 C1 23 2 21 4 17 C2 19 -2 19 -4 17 Z", p.bdk) +
			`<circle cx="-3.5" cy="3" r="1.3" fill="${INK}"/><circle cx="3.5" cy="3" r="1.3" fill="${INK}"/>`;
		return s;
	}
	function eagWing(p) {
		return (
			P(
				"M134 128 C112 104 96 74 70 54 C74 70 74 82 70 90 C80 90 86 94 88 100 C80 104 78 110 78 118 C90 116 98 118 102 124 C96 130 96 138 98 146 C112 140 124 140 134 148 Z",
				p.body,
			) +
			F(
				"M70 54 C74 70 74 82 70 90 C80 90 86 94 88 100 C80 104 78 110 78 118 C90 116 98 118 102 124 C96 130 96 138 98 146 C104 142 110 140 114 140 C104 120 92 90 70 54 Z",
				p.dk,
			) +
			L(
				"M128 132 C112 120 100 106 88 100 M128 140 C116 132 108 126 102 124 M126 122 C114 108 104 94 96 84",
				p.dk,
				2.2,
			) +
			L("M84 72 C100 86 116 104 128 118", "rgba(255,255,255,.3)", 3)
		);
	}
	function eagArt() {
		const p = EAG;
		let s = shadow(150, 216, 66) + rock(150, 214, 62, 24);
		s += eagWing(p) + MIR(eagWing(p));
		s += P(
			"M138 182 L130 206 L143 200 L150 210 L157 200 L170 206 L162 182 Z",
			p.dk,
			3.5,
		);
		s += both(
			(k) =>
				P(
					`M${150 + k * 4} 168 C${150 + k * 4} 180 ${150 + k * 10} 186 ${150 + k * 16} 186 C${150 + k * 22} 180 ${150 + k * 22} 170 ${150 + k * 18} 164 Z`,
					p.dk,
					3.5,
				) +
				L(`M${150 + k * 13} 184 L${150 + k * 13} 194`, INK, 8) +
				L(`M${150 + k * 13} 184 L${150 + k * 13} 194`, p.leg, 4) +
				L(
					`M${150 + k * 13} 194 l${k * -7} 3 M${150 + k * 13} 194 l0 6 M${150 + k * 13} 194 l${k * 7} 4`,
					INK,
					3.4,
				),
		);
		s += P(
			"M128 172 C120 148 126 118 150 116 C174 118 180 148 172 172 C164 184 136 184 128 172 Z",
			p.body,
		);
		s += F(
			"M138 170 C134 152 140 132 150 130 C160 132 166 152 162 170 C156 176 144 176 138 170 Z",
			"#9a6e4a",
		);
		s += L(
			"M142 142 q4 4 8 0 q4 4 8 0 M140 152 q5 4 10 0 q5 4 10 0 M141 162 q4.5 4 9 0 q4.5 4 9 0",
			p.dk,
			1.8,
		);
		s += G(150, 96, 1.02, eagHead(p));
		return s;
	}
	LGMon.add("eagle", { art: eagArt, face: () => G(64, 68, 1.12, eagHead()) });

	const GOL = {
		c: "#8f8a82",
		dk: "#625e58",
		lt: "#b8b2a8",
		moss: "#6f9a4a",
		rune: "#7ae0ff",
	};
	function golHead(p = GOL) {
		let s = "";
		s += P("M-22 -20 L16 -25 L27 -6 L23 17 L-17 21 L-27 1 Z", p.c);
		s += F("M16 -25 L27 -6 L23 17 L12 19 L14 -4 Z", p.dk);
		s += P("M-20 -20 Q-14 -31 -6 -22 Q0 -31 8 -23 Q14 -31 17 -24 Z", p.moss, 3);
		s += L("M-4 -18 L0 -13 L4 -18 M0 -13 V-10", p.rune, 2.4);
		s += P("M-25 -8 L25 -11 L23 -2 L-23 0 Z", p.dk, 3);
		s += glowEye(-10, 5, 5.6, p.rune) + glowEye(10, 4, 5.6, p.rune);
		s += P("M-10 13 L10 12 L9 16.5 L-9 17.5 Z", "#2a3238", 2.4);
		s +=
			L("M-19 6 l-4 6 M21 -15 l-4 4 l2 4", dk(p.c, 0.4), 1.8) +
			L("M-18 -16 L8 -20", "rgba(255,255,255,.45)", 3);
		return s;
	}
	function golArm(p) {
		return (
			P("M84 120 L106 124 L104 156 L84 154 Z", p.c) +
			P("M78 156 L108 158 L110 176 L76 176 Z", p.dk) +
			P("M70 172 L112 172 L116 198 L102 208 L76 206 L66 190 Z", p.c) +
			L("M80 186 l2 18 M92 184 l1 22 M104 184 l0 20", dk(p.c, 0.4), 2) +
			P("M80 98 L104 86 L126 96 L124 122 L100 130 L82 118 Z", p.c) +
			F("M104 86 L126 96 L124 122 L108 124 Z", p.dk) +
			P("M86 102 Q92 92 100 98 Q106 90 112 96 Q100 104 86 102 Z", p.moss, 2.6)
		);
	}
	function golArt() {
		const p = GOL;
		let s = shadow(150, 216, 90);
		s += both((k) =>
			P(
				`M${150 + k * 12} 180 L${150 + k * 10} 212 L${150 + k * 38} 212 L${150 + k * 36} 180 Z`,
				k < 0 ? p.c : p.dk,
			),
		);
		s += P("M104 112 L196 108 L208 150 L190 190 L110 192 L92 150 Z", p.c);
		s +=
			F("M196 108 L208 150 L190 190 L168 191 L182 150 Z", p.dk) +
			L("M108 120 L188 116", "rgba(255,255,255,.45)", 3);
		s += L("M110 170 l14 6 l6 12 M184 128 l-8 10", dk(p.c, 0.4), 2);
		s +=
			`<circle cx="150" cy="148" r="20" fill="${p.rune}" opacity=".3"/>` +
			L(
				"M138 148 H116 l-6 8 M162 148 H184 l4 -8 M150 164 V184 M150 132 V118",
				p.rune,
				2.6,
			);
		s +=
			P("M150 131 L163 148 L150 165 L137 148 Z", p.rune, 3.2) +
			F("M150 139 L156 148 L150 157 L144 148 Z", "#fff");
		s += P(
			"M124 186 Q132 176 142 184 Q150 178 158 186 Q150 192 124 186 Z",
			p.moss,
			2.6,
		);
		s += golArm(p) + MIR(golArm(p));
		s += G(150, 90, 1.05, golHead(p));
		return s;
	}
	LGMon.add("stonegolem", {
		art: golArt,
		face: () => G(64, 68, 1.22, golHead()),
	});

	const GRI = {
		head: "#f4eddc",
		hdk: "#cfc3a6",
		dk: "#6a4a2e",
		beak: "#f2c14e",
		bdk: "#b8862a",
		wing: "#c99050",
		wdk: "#8a5a2a",
		lion: "#dca85e",
		ldk: "#a8763a",
		lbel: "#f2dcaa",
		leg: "#f2c14e",
	};
	function griHead(p = GRI) {
		return (
			both(
				(k) =>
					P(`M${k * 14} -20 L${k * 30} -40 L${k * 26} -18 Z`, p.head, 3.5) +
					F(`M${k * 17} -21 L${k * 27} -34 L${k * 24} -20 Z`, p.wdk),
			) + eagHead(p)
		);
	}
	function griWing(p, c, cd) {
		return (
			P(
				"M140 128 C150 96 170 60 212 38 C208 52 208 60 212 68 C202 70 196 76 196 82 C202 84 206 90 206 96 C196 96 188 100 186 106 C190 110 192 116 190 122 C178 120 166 124 158 132 Z",
				c,
			) +
			F(
				"M212 38 C208 52 208 60 212 68 C202 70 196 76 196 82 C202 84 206 90 206 96 C196 96 188 100 186 106 C190 110 192 116 190 122 C184 121 178 122 172 124 C180 100 194 64 212 38 Z",
				cd,
			) +
			L(
				"M152 120 C164 100 180 84 196 82 M156 126 C168 112 178 106 186 106 M150 110 C160 88 176 72 200 60",
				cd,
				2.2,
			) +
			L("M150 104 C160 82 178 62 200 48", "rgba(255,255,255,.35)", 3)
		);
	}
	function griArt() {
		const p = GRI;
		let s = shadow(160, 216, 94);
		s += G(-16, -18, 1, griWing(p, p.wdk, dk(p.wdk, 0.3)));
		s +=
			P(
				"M214 140 C236 132 246 114 240 96 C236 110 228 120 212 126 Z",
				p.lion,
				3.5,
			) + P("M240 96 C232 88 236 78 246 76 C244 84 252 90 250 98 Z", p.ldk, 3);

		s +=
			P(
				"M180 156 C176 172 178 190 180 204 L198 204 C196 188 198 172 202 160 Z",
				p.ldk,
			) + E(190, 207, 13, 6, p.ldk, 3.5);
		s +=
			L("M128 160 L122 200", INK, 15) +
			L("M128 160 L122 200", dk(p.leg, 0.15), 9) +
			L("M122 200 l-9 6 M122 200 l-1 10 M122 200 l8 6", INK, 4.4);

		s += P(
			"M110 132 C108 114 130 108 166 110 C200 112 220 122 218 146 C216 164 198 172 166 172 C136 172 112 160 110 132 Z",
			p.lion,
		);
		s +=
			F(
				"M118 154 C140 168 190 170 212 154 C206 166 190 172 166 172 C140 172 124 166 118 154 Z",
				p.ldk,
			) + shine("M134 114 C156 110 186 112 204 120");

		s +=
			P(
				"M188 132 C218 128 232 154 222 176 L220 202 L198 202 L198 182 C178 176 172 144 188 132 Z",
				p.lion,
			) +
			F(
				"M196 176 C206 178 214 174 220 166 L220 180 C212 184 204 184 198 182 Z",
				p.ldk,
			);
		s +=
			E(210, 205, 16, 7, p.lion, 3.5) +
			L("M201 209 v-5 M209 211 v-5 M217 210 v-5", INK, 2) +
			L("M200 150 C206 146 214 148 218 154", "rgba(255,255,255,.45)", 3);

		s +=
			P(
				"M128 146 C124 160 128 174 140 178 C150 176 152 160 148 148 Z",
				p.head,
				3.5,
			) + L("M132 164 l4 4 M140 168 l3 3", p.hdk, 1.8);
		s +=
			L("M141 176 L144 202", INK, 15) +
			L("M141 176 L144 202", p.leg, 9) +
			L("M140 184 h7 M141 192 h7", dk(p.leg, 0.25), 1.6) +
			L("M144 202 l-10 6 M144 202 l0 11 M144 202 l10 6", INK, 4.4);

		s += P(
			"M116 140 C110 128 112 112 120 104 L142 110 C140 120 142 128 150 134 Z",
			p.head,
		);
		s += P(
			"M112 124 L104 132 L116 132 L112 142 L124 138 L126 148 L134 140 L140 148 L144 136 Z",
			p.head,
			3.5,
		);

		s += G(4, -12, 1, griWing(p, p.wing, p.wdk));
		s += G(122, 92, 1, griHead(p), -6);
		return s;
	}
	LGMon.add("griffin", { art: griArt, face: () => G(64, 70, 1.05, griHead()) });

	const BEAR = {
		c: "#5e4636",
		dk: "#3e2c22",
		lt: "#7f6250",
		snout: "#b08c70",
		claw: "#efe4c8",
		scar: "#e8a0a0",
	};
	function bearHead(p = BEAR) {
		let s = "";
		s += both(
			(k) =>
				C(k * 22, -20, 9.5, p.c) +
				`<circle cx="${k * 22}" cy="-20" r="4.6" fill="${p.dk}"/>`,
		);
		s += P(
			"M0 -26 C18 -26 30 -14 30 2 C30 18 18 28 0 28 C-18 28 -30 18 -30 2 C-30 -14 -18 -26 0 -26 Z",
			p.c,
		);
		s += F(
			"M-24 -12 C-16 -24 16 -24 24 -12 C14 -16 6 -14 0 -8 C-6 -14 -14 -16 -24 -12 Z",
			p.dk,
		);
		s += eye(-12, -6, 4.8, "#f2b544") + eye(12, -6, 4.8, "#f2b544");
		s += L("M-20 -14 L-6 -9 M20 -14 L6 -9", INK, 2.8);
		s +=
			L("M8 -22 L18 4", p.scar, 3) +
			L("M11 -16 l4 -1.5 M13 -10 l4 -1.5 M15 -4 l4 -1.5", p.scar, 1.6);
		s += P(
			"M-15 4 C-15 -5 15 -5 15 4 C15 22 8 31 0 31 C-8 31 -15 22 -15 4 Z",
			p.snout,
			3.5,
		);
		s += P("M-6 0 Q0 -3 6 0 Q5 5 0 6 Q-5 5 -6 0 Z", INK, 1);
		s += P(
			"M-10 13 C-10 10 10 10 10 13 C10 23 6 29 0 29 C-6 29 -10 23 -10 13 Z",
			"#6e2228",
			2.4,
		);
		s +=
			F(
				"M-9 12 L-6.5 18 L-4 12 Z M9 12 L6.5 18 L4 12 Z M-7 27 L-5 22 L-3 28 Z M7 27 L5 22 L3 28 Z",
				"#fff",
			) + E(0, 25, 4.6, 2.6, "#d86a6a", 0);
		s += L("M-16 -20 C-10 -24 -2 -25 4 -24", "rgba(255,255,255,.3)", 3);
		return s;
	}
	function bearArm(p) {
		return (
			P("M110 118 C92 106 80 88 78 68 L98 62 C102 80 110 94 126 104 Z", p.c) +
			E(87, 60, 15, 13, p.c) +
			L("M76 50 l-3 -8 M84 47 l-1 -9 M92 47 l1 -9 M100 51 l3 -8", INK, 5) +
			L("M76 50 l-3 -8 M84 47 l-1 -9 M92 47 l1 -9 M100 51 l3 -8", p.claw, 2.6) +
			E(87, 64, 7, 5, p.dk, 0)
		);
	}
	function bearArt() {
		const p = BEAR;
		let s = shadow(150, 216, 74);
		s += both(
			(k) =>
				P(
					`M${150 + k * 12} 178 L${150 + k * 10} 206 Q${150 + k * 10} 214 ${150 + k * 20} 214 L${150 + k * 40} 214 Q${150 + k * 46} 206 ${150 + k * 40} 196 L${150 + k * 38} 174 Z`,
					p.c,
				) +
				L(
					`M${150 + k * 22} 214 l${k * -1} 4 M${150 + k * 30} 214 v4 M${150 + k * 38} 213 l${k * 1} 4`,
					p.claw,
					2.6,
				),
		);
		s += P(
			"M104 186 C92 150 104 100 150 96 C196 100 208 150 196 186 C186 200 114 200 104 186 Z",
			p.c,
		);
		s += F(
			"M124 190 C118 160 130 128 150 126 C170 128 182 160 176 190 Z",
			p.lt,
		);
		s += F("M104 184 C96 156 98 126 112 108 C108 136 110 166 120 194 Z", p.dk);
		s += L(
			"M158 140 L170 162 M150 142 L162 166 M142 146 L154 168",
			p.scar,
			2.6,
		);
		s += L(
			"M114 132 l-4 4 M190 140 l4 4 M120 160 l-4 3 M184 166 l4 3",
			p.dk,
			2,
		);
		s += bearArm(p) + MIR(bearArm(p));
		s += G(150, 92, 1.08, bearHead(p));
		return s;
	}
	LGMon.add("cavebear", {
		art: bearArt,
		face: () => G(64, 64, 1.18, bearHead()),
	});

	const GIA = {
		c: "#8a8c90",
		dk: "#5e6064",
		lt: "#b4b6ba",
		moss: "#6f9a4a",
		mdk: "#4e7432",
		cr: "#7ae0ff",
		cdk: "#3a9ac0",
		club: "#5c5e62",
	};
	const crystal = (x, y, h, r, p) =>
		G(
			x,
			y,
			1,
			P(
				`M0 0 L${-h * 0.22} ${-h * 0.6} L0 ${-h} L${h * 0.22} ${-h * 0.6} Z`,
				p.cr,
				3,
			) + F(`M0 0 L0 ${-h} L${h * 0.22} ${-h * 0.6} Z`, p.cdk),
			r,
		);
	function giaHead(p = GIA) {
		let s = "";
		s += P("M-24 -18 L-26 -30 L24 -30 L24 -18 Z", p.dk, 3.5);
		s +=
			crystal(-16, -28, 16, -14, p) +
			crystal(0, -29, 24, 0, p) +
			crystal(16, -28, 16, 14, p);
		s += P("M-26 -22 L0 -27 L26 -22 L32 0 L26 22 L0 30 L-26 22 L-32 0 Z", p.c);
		s += F("M26 -22 L32 0 L26 22 L14 26 L20 0 Z", p.dk);
		s += P("M-28 -10 L0 -6 L28 -10 L26 -2 L0 2 L-26 -2 Z", p.dk, 3);
		s += glowEye(-12, 5, 5.6, p.cr) + glowEye(12, 5, 5.6, p.cr);
		s += P("M-5 4 L5 4 L8 15 L-8 15 Z", p.lt, 3);
		s +=
			P("M-14 18 L14 18 L12 23 L-12 23 Z", "#2a2a30", 2.4) +
			F("M-10 18 h4 v3 h-4 Z M2 18 h4 v3 h-4 Z", "#d8d8d0");
		s +=
			P(
				"M-26 18 Q-22 36 -10 36 Q0 44 10 36 Q22 36 26 18 Q14 30 0 28 Q-14 30 -26 18 Z",
				p.moss,
				3,
			) + L("M-14 32 l2 -4 M0 36 v-5 M14 32 l-2 -4", p.mdk, 2);
		s +=
			L("M-22 -16 L-15 -4 M-24 10 L-16 16", p.cr, 2.4) +
			L("M-20 -20 L10 -24", "rgba(255,255,255,.45)", 3);
		return s;
	}
	function giaArt() {
		const p = GIA;
		let s = shadow(150, 218, 108);
		s += both(
			(k) =>
				P(
					`M${150 + k * 14} 182 L${150 + k * 12} 214 L${150 + k * 46} 214 L${150 + k * 44} 182 Z`,
					k < 0 ? p.c : p.dk,
				) + L(`M${150 + k * 20} 200 l${k * 8} 2`, dk(p.c, 0.4), 2),
		);
		s += P("M88 92 L212 92 L232 146 L208 194 L92 194 L68 146 Z", p.c);
		s +=
			F("M212 92 L232 146 L208 194 L182 194 L204 146 Z", p.dk) +
			L("M94 100 L200 98", "rgba(255,255,255,.45)", 3);
		s +=
			L("M150 120 L140 140 L156 156 L146 178", p.cr, 3) +
			`<circle cx="148" cy="146" r="9" fill="${p.cr}" opacity=".35"/>`;
		s +=
			P(
				"M100 170 Q112 160 124 168 Q136 162 144 172 Q120 180 100 170 Z",
				p.moss,
				2.8,
			) + P("M168 120 Q178 112 190 120 Q182 128 168 120 Z", p.moss, 2.6);

		s +=
			P("M70 108 L94 112 L92 150 L66 148 Z", p.c) +
			P("M58 148 L98 148 L102 182 L86 194 L62 192 L52 172 Z", p.c) +
			L("M66 168 l2 20 M78 166 l1 24 M90 166 l0 22", dk(p.c, 0.4), 2);

		s +=
			P("M236 52 L262 58 L256 214 L226 212 Z", p.club) +
			F("M250 56 L262 58 L256 214 L244 213 Z", dk(p.club, 0.3)) +
			L("M232 120 l20 4 M230 170 l22 3", dk(p.club, 0.4), 2);
		s +=
			P("M206 108 L230 112 L232 146 L208 146 Z", p.c) +
			P("M214 142 L250 136 L256 164 L236 176 L214 168 Z", p.c);

		for (const [x, m] of [
			[88, 1],
			[212, -1],
		]) {
			s +=
				P(
					`M${x - 26} 98 L${x - 6} 78 L${x + 18} 82 L${x + 24} 104 L${x} 118 L${x - 22} 114 Z`,
					p.c,
				) +
				F(`M${x + 2} 80 L${x + 18} 82 L${x + 24} 104 L${x + 4} 114 Z`, p.dk);
			s +=
				crystal(x - 10, 84, 22, -18 * m, p) +
				crystal(x + 4, 82, 30, 4 * m, p) +
				crystal(x + 16, 86, 18, 22 * m, p);
		}
		s += G(150, 70, 1, giaHead(p));
		return s;
	}
	LGMon.add("e_giant", { art: giaArt, face: () => G(64, 74, 0.94, giaHead()) });

	const RUN = {
		a: "#6f7c8a",
		dk: "#4c5662",
		lt: "#9aa6b2",
		trim: "#c99a4a",
		tdk: "#8a6424",
		rune: "#ffb84a",
		cloth: "#9a3a34",
		wood: "#6a4a30",
	};
	const runeGlow = (d, p, w = 2.6) =>
		L(d, p.rune, w + 3).replace("stroke-width", 'opacity=".35" stroke-width') +
		L(d, p.rune, w);
	function runHead(p = RUN) {
		let s = "";
		s +=
			P("M-4 -26 C0 -44 16 -52 30 -46 C22 -42 16 -34 14 -24 Z", p.cloth, 3.5) +
			L("M4 -32 C10 -40 18 -44 24 -45", dk(p.cloth), 2);
		s += P(
			"M-22 -8 C-22 -32 22 -32 22 -8 L22 18 C22 24 14 28 0 30 C-14 28 -22 24 -22 18 Z",
			p.a,
		);
		s += F("M10 -26 C18 -22 22 -16 22 -8 L22 18 C22 24 16 27 10 29 Z", p.dk);
		s +=
			P("M-23 -12 h46 v7 h-46 Z", p.trim, 3) +
			both((k) => `<circle cx="${k * 16}" cy="-8.5" r="1.6" fill="${p.tdk}"/>`);
		s += P("M-17 0 h34 v7 h-14 v17 h-6 v-17 h-14 Z", "#1a1e24", 3);
		s +=
			`<circle cx="-9" cy="3.5" r="6" fill="${p.rune}" opacity=".35"/><circle cx="9" cy="3.5" r="6" fill="${p.rune}" opacity=".35"/>` +
			E(-9, 3.5, 4.4, 2.2, p.rune, 0) +
			E(9, 3.5, 4.4, 2.2, p.rune, 0);
		s += runeGlow("M-5 -24 L0 -17 L5 -24", p, 2.2);
		s += L("M-15 -22 C-9 -26 -2 -27 4 -26", "rgba(255,255,255,.5)", 3);
		return s;
	}
	function runArt() {
		const p = RUN;
		let s = shadow(150, 216, 74);
		s += L("M210 40 L210 212", INK, 10) + L("M210 40 L210 212", p.wood, 5);
		s +=
			P("M212 50 C230 50 242 62 244 80 C234 74 222 74 212 78 Z", p.lt, 3.5) +
			P("M208 50 C196 54 190 62 190 70 L208 66 Z", p.lt, 3.5) +
			P("M206 26 L210 14 L214 26 L214 48 L206 48 Z", p.lt, 3) +
			runeGlow("M224 60 l4 6 l-4 6", p, 1.8);
		s +=
			P("M136 168 L164 168 L160 204 L140 204 Z", p.cloth) +
			L("M150 172 v28", dk(p.cloth), 2);
		s += both(
			(k) =>
				P(
					`M${150 + k * 14} 172 L${150 + k * 12} 206 L${150 + k * 32} 206 L${150 + k * 32} 172 Z`,
					p.a,
				) +
				P(
					`M${150 + k * 10} 204 L${150 + k * 10} 214 L${150 + k * 36} 214 L${150 + k * 34} 204 Z`,
					p.dk,
					3.5,
				) +
				P(`M${150 + k * 13} 182 h${k * 20} v8 h${k * -20} Z`, p.trim, 2.6),
		);
		s += P("M114 108 L186 108 L192 150 L178 176 L122 176 L108 150 Z", p.a);
		s +=
			F("M170 108 L186 108 L192 150 L178 176 L166 176 L176 140 Z", p.dk) +
			L("M120 116 L180 116", "rgba(255,255,255,.5)", 3);
		s += P("M112 160 L188 160 L186 172 L114 172 Z", p.trim, 3);
		s += runeGlow(
			"M150 122 V150 M140 128 L150 138 L160 128 M142 146 L158 146",
			p,
			2.8,
		);
		s +=
			P("M186 120 C200 130 206 142 206 152", p.a) + C(206, 152, 8, p.dk, 3.5);
		s +=
			P(
				"M96 116 L134 116 L134 154 C134 176 120 192 115 198 C110 192 96 176 96 154 Z",
				p.a,
			) +
			P(
				"M101 121 L129 121 L129 154 C129 172 120 184 115 190 C110 184 101 172 101 154 Z",
				p.dk,
				0,
			);
		s +=
			P("M96 116 L134 116 L134 122 L96 122 Z", p.trim, 3) +
			runeGlow(
				"M115 130 V176 M106 142 L115 152 L124 142 M107 166 L123 166",
				p,
				2.4,
			);
		s += both(
			(k) =>
				P(
					`M${150 + k * 24} 104 C${150 + k * 34} 92 ${150 + k * 52} 96 ${150 + k * 54} 114 C${150 + k * 54} 124 ${150 + k * 44} 128 ${150 + k * 26} 124 Z`,
					p.a,
				) +
				L(
					`M${150 + k * 30} 112 C${150 + k * 38} 106 ${150 + k * 46} 108 ${150 + k * 50} 116`,
					p.trim,
					2.6,
				),
		);
		s += G(150, 82, 1.02, runHead(p));
		return s;
	}
	LGMon.add("runeguard", {
		art: runArt,
		face: () => G(62, 72, 1.12, runHead()),
	});

	const WYV = {
		c: "#b0453a",
		dk: "#7a2a24",
		lt: "#d8705e",
		bel: "#f0d2a0",
		bdk: "#c9a272",
		mem: "#6a3048",
		mdk: "#4a1e32",
		bone: "#efe4c8",
		eye: "#ffcf3a",
		scar: "#f2b8a8",
	};
	function wyvHead(p = WYV) {
		let s = "";
		s += both(
			(k) =>
				P(
					`M${k * 22} -6 L${k * 44} -14 L${k * 36} -2 L${k * 46} 6 L${k * 32} 8 L${k * 38} 18 L${k * 20} 12 Z`,
					p.mem,
					3.5,
				) +
				L(`M${k * 22} -2 L${k * 40} -10 M${k * 22} 6 L${k * 38} 6`, p.mdk, 1.8),
		);
		s += both(
			(k) =>
				P(
					`M${k * 12} -20 C${k * 18} -36 ${k * 32} -46 ${k * 46} -46 C${k * 38} -38 ${k * 30} -30 ${k * 24} -14 Z`,
					p.bone,
					3.5,
				) +
				L(
					`M${k * 20} -28 l${k * 4} 4 M${k * 28} -36 l${k * 3} 4`,
					dk(p.bone, 0.3),
					1.8,
				),
		);
		s += P(
			"M0 -27 C16 -27 26 -17 26 -3 C26 8 21 14 17 18 L-17 18 C-21 14 -26 8 -26 -3 C-26 -17 -16 -27 0 -27 Z",
			p.c,
		);
		s +=
			P("M-5 -27 L0 -36 L5 -27 Z", p.bone, 2.6) +
			P("M-4 -18 L0 -25 L4 -18 Z", p.dk, 0);
		s += F(
			"M-24 -13 L-4 -6 L-4 -2 L-25 -7 Z M24 -13 L4 -6 L4 -2 L25 -7 Z",
			p.dk,
		);
		s += `<circle cx="-12" cy="-4" r="9" fill="${p.eye}" opacity=".3"/><circle cx="12" cy="-4" r="9" fill="${p.eye}" opacity=".3"/>`;
		s += eye(-12, -4, 5.6, p.eye, 0, true) + eye(12, -4, 5.6, p.eye, 0, true);
		s +=
			L("M-21 -17 L-14 6", p.scar, 2.6) +
			L("M-20 -12 l3 -1 M-18 -6 l3 -1 M-16 0 l3 -1", p.scar, 1.4);
		s += P("M-13 16 L13 16 L10 31 C5 35 -5 35 -10 31 Z", "#4a1418", 2.6);
		s += F(
			"M-12 16 l2.5 6 l2.5 -6 Z M-4 16 l2 5 l2 -5 Z M4 16 l2 5 l2 -5 Z M7 16 l2.5 6 l2.5 -6 Z M-8 32 l2 -5 l2 5.4 Z M4 32.6 l2 -5.6 l2 5 Z",
			"#fff",
		);
		s += E(0, 28, 5, 2.6, "#d86a6a", 0);
		s +=
			P("M-18 8 C-18 2 18 2 18 8 L15 17 L-15 17 Z", p.lt, 3.5) +
			`<ellipse cx="-5" cy="9" rx="1.8" ry="2.4" fill="${INK}"/><ellipse cx="5" cy="9" rx="1.8" ry="2.4" fill="${INK}"/>`;
		s += L("M-14 -21 C-8 -25 0 -26 6 -25", "rgba(255,255,255,.4)", 3);
		return s;
	}
	function wyvWing(p) {
		let s = P(
			"M132 112 L74 38 L62 42 L24 66 C38 74 42 84 42 96 C54 96 62 102 64 114 C76 112 86 118 90 128 C102 124 114 128 122 136 Z",
			p.mem,
		);
		s += F(
			"M74 38 L62 42 L24 66 C38 74 42 84 42 96 C54 96 62 102 64 114 C70 113 76 114 80 116 C78 90 76 60 74 38 Z",
			p.mdk,
		);
		s += L(
			"M74 38 L24 66 M74 38 L42 96 M74 38 L64 114 M74 38 L90 128",
			p.dk,
			2.4,
		);
		s +=
			L("M132 112 L74 38", INK, 10) +
			L("M132 112 L74 38", p.c, 5) +
			P("M74 38 L66 26 L80 34 Z", p.bone, 2.6);
		return s;
	}
	function wyvArt() {
		const p = WYV;
		let s = shadow(150, 218, 100) + rock(150, 216, 70, 22);
		s += wyvWing(p) + MIR(wyvWing(p));
		s +=
			P(
				"M176 188 C214 196 246 186 254 160 C258 146 250 136 242 140 C246 150 240 170 210 176 L178 172 Z",
				p.c,
			) +
			P("M246 140 L240 122 L256 132 Z", p.bone, 3) +
			L("M200 182 l2 -6 M218 180 l2 -6 M234 172 l3 -5", p.dk, 2);
		s += both(
			(k) =>
				P(
					`M${150 + k * 10} 168 C${150 + k * 6} 182 ${150 + k * 10} 194 ${150 + k * 18} 196 L${150 + k * 34} 196 C${150 + k * 38} 184 ${150 + k * 36} 170 ${150 + k * 30} 162 Z`,
					p.c,
				) +
				L(
					`M${150 + k * 18} 196 l${k * -3} 5 M${150 + k * 26} 197 v5 M${150 + k * 34} 196 l${k * 3} 5`,
					p.bone,
					3.2,
				),
		);
		s += P(
			"M120 176 C110 146 120 112 150 108 C180 112 190 146 180 176 C172 190 128 190 120 176 Z",
			p.c,
		);
		s +=
			F(
				"M134 178 C128 156 136 126 150 122 C164 126 172 156 166 178 C160 184 140 184 134 178 Z",
				p.bel,
			) + L("M138 136 h24 M136 148 h28 M135 160 h30 M137 171 h26", p.bdk, 2);
		s += F(
			"M122 170 C116 148 120 124 132 112 C128 132 128 156 134 182 Z",
			p.dk,
		);
		s += L("M168 128 L176 150", p.scar, 2.6);
		s +=
			P(
				"M136 116 C132 102 136 90 144 84 L156 84 C164 90 168 102 164 116 Z",
				p.c,
			) + F("M144 100 C146 96 154 96 156 100 L156 116 L144 116 Z", p.bel);
		s += G(150, 70, 1.05, wyvHead(p));
		return s;
	}
	LGMon.add("wyvern", { art: wyvArt, face: () => G(64, 70, 0.92, wyvHead()) });
})();

(() => {
	const { INK, SW, o, eye, glowEye, shadow, shine, dk, lt } = LGMon;
	const BONE = "#ece3cc";
	const T = (x, y, s = 1, r = 0) =>
		`<g transform="translate(${x},${y})${r ? ` rotate(${r})` : ""}${s !== 1 ? ` scale(${s})` : ""}">`;
	const line = (d, c = INK, w = 2.2) =>
		`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

	const limb = (pts, w = 8, c = BONE) => {
		const d = "M" + pts.map((p) => p.join(" ")).join(" L");
		return `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + SW * 1.6}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
	};

	const stick = (d, w, c) =>
		`<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + SW * 1.6}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
	const knob = (x, y, r, c = BONE) =>
		`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" ${o(2.6)}/>`;

	const bhand = (x, y, ang = 90, c = BONE, s = 1) => {
		let g = T(x, y, s, ang - 90);
		for (const fx of [-4.5, 0, 4.5])
			g += limb(
				[
					[fx * 0.6, 2],
					[fx, 10 + (fx === 0 ? 2 : 0)],
				],
				2.6,
				c,
			);
		return (
			g + `<ellipse cx="0" cy="0" rx="6.5" ry="5.5" fill="${c}" ${o(2.6)}/></g>`
		);
	};

	const fanHand = (x, y, ang = -90, c = BONE, s = 1) => {
		let g = T(x, y, s, ang + 90);
		for (const a of [-30, -10, 10, 30]) {
			const r = ((a - 90) * Math.PI) / 180,
				L = a === -10 || a === 10 ? 17 : 14.5;
			g += limb(
				[
					[Math.cos(r) * 4, Math.sin(r) * 4],
					[Math.cos(r) * L, Math.sin(r) * L],
				],
				2.4,
				c,
			);
		}
		g += limb(
			[
				[-4, 1],
				[-14, -4],
			],
			2.4,
			c,
		);
		return (
			g + `<ellipse cx="0" cy="0" rx="6.5" ry="6" fill="${c}" ${o(2.6)}/></g>`
		);
	};
	const bfoot = (x, sx, c = BONE) =>
		`<path d="M${x} -10 C${x + sx * 4} -9 ${x + sx * 12} -6 ${x + sx * 13} -1 C${x + sx * 13} 2 ${x + sx * 10} 2 ${x} 2 C${x - sx * 4} 2 ${x - sx * 5} -6 ${x} -10 Z" fill="${c}" ${o(3.4)}/>`;

	function skull(cx, cy, s, p = {}) {
		const c = p.c || BONE,
			glow = p.glow || "#a6f59a";
		let g = T(cx, cy, s);

		g += `<path d="M-19 8 L19 8 L17 25 C11 30 -11 30 -17 25 Z" fill="${c}" ${o()}/><path d="M10 12 L17 12 L16 24 C14 26 12 27 9 28 Z" fill="${dk(c, 0.2)}"/>`;

		g += `<path d="M-31 4 C-37-16 -22-36 0-36 C22-36 37-16 31 4 C29 10 25 13 20 14 L-20 14 C-25 13 -29 10 -31 4 Z" fill="${c}" ${o()}/>`;
		g += `<path d="M22-27 C32-17 35-4 30 5 C28 9 25 11 21 12 C26 3 28-12 22-27 Z" fill="${dk(c, 0.2)}"/>`;
		g += `<path d="M-30 2 C-27 6 -24 8 -19 9" fill="none" stroke="${dk(c, 0.25)}" stroke-width="2" stroke-linecap="round"/>`;

		g +=
			`<path d="M-15 10 H15 V21 Q0 23 -15 21 Z" fill="${lt(c, 0.4)}" ${o(2.2)}/>` +
			line("M-15 15.5 H15", INK, 1.8) +
			line("M-9 10.5 V21.5 M-3 10.5 V22 M3 10.5 V22 M9 10.5 V21.5", INK, 1.6);
		if (p.missing)
			g += `<rect x="3" y="10.5" width="6" height="5" fill="${INK}"/>`;

		if (p.angry)
			g += `<path d="M-24-10 L-4-4 C-3 6 -8 10 -14 10 C-21 10 -25 4 -24-10 Z" fill="${INK}"/><path d="M24-10 L4-4 C3 6 8 10 14 10 C21 10 25 4 24-10 Z" fill="${INK}"/>`;
		else
			g += `<ellipse cx="-13" cy="-2" rx="10" ry="11" fill="${INK}"/><ellipse cx="13" cy="-2" rx="10" ry="11" fill="${INK}"/>`;
		if (p.flame)
			g += [-13, 13]
				.map(
					(x) =>
						`<path d="M${x - 5} 2 C${x - 7}-6 ${x - 2}-10 ${x}-20 C${x + 2}-12 ${x + 7}-8 ${x + 5} 2 C${x + 3} 6 ${x - 3} 6 ${x - 5} 2 Z" fill="${glow}" opacity=".85"/>`,
				)
				.join("");
		g +=
			glowEye(-13, p.angry ? 2 : 0, 3.6, glow) +
			glowEye(13, p.angry ? 2 : 0, 3.6, glow);

		g += `<path d="M0 3 L-4 9.5 Q0 11 4 9.5 Z" fill="${INK}"/>`;
		g += shine("M-21-25 C-14-31 -6-33 2-33", "rgba(255,255,255,.7)", 3.2);
		if (p.crack) g += line("M9-35 L5-27 L11-21 L7-13", INK, 2.2);
		return g + "</g>";
	}

	function skelBody(c, wide = 0) {
		let g = "";
		g +=
			limb(
				[
					[-12, -52],
					[-15 - wide, -28],
					[-14 - wide * 1.6, -9],
				],
				8,
				c,
			) +
			limb(
				[
					[12, -52],
					[16 + wide, -28],
					[15 + wide * 1.6, -9],
				],
				8,
				c,
			);
		g += knob(-15 - wide, -28, 5.4, c) + knob(16 + wide, -28, 5.4, c);
		g += `<g transform="translate(${-wide * 1.6},0)">${bfoot(-14, -1, c)}</g><g transform="translate(${wide * 1.6},0)">${bfoot(15, 1, c)}</g>`;
		g +=
			limb(
				[
					[0, -104],
					[0, -54],
				],
				6,
				c,
			) + line("M-4 -60 H4 M-4 -66 H4", INK, 1.8);
		g += `<path d="M-21-58 C-23-48 -13-42 0-46 C13-42 23-48 21-58 C11-54 -11-54 -21-58 Z" fill="${c}" ${o(3.6)}/><ellipse cx="-10" cy="-51" rx="4" ry="2.6" fill="${dk(c, 0.45)}"/><ellipse cx="10" cy="-51" rx="4" ry="2.6" fill="${dk(c, 0.45)}"/>`;
		g += `<path d="M-21-102 C-27-88 -24-72 -13-66 L13-66 C24-72 27-88 21-102 C12-108 -12-108 -21-102 Z" fill="${c}" ${o()}/>`;
		for (const y of [-93, -84, -75])
			g += `<path d="M-19 ${y} Q-10 ${y + 5} -3 ${y + 1} M19 ${y} Q10 ${y + 5} 3 ${y + 1}" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`;
		g += `<path d="M14-96 C20-88 21-78 15-70" fill="none" stroke="${dk(c, 0.2)}" stroke-width="3" stroke-linecap="round"/>`;
		g += shine("M-16-99 C-11-102 -6-103 -2-103", "rgba(255,255,255,.7)", 2.6);
		return g;
	}

	function skeleton() {
		let g = shadow(150, 218, 46) + T(150, 216, 1.04);

		g +=
			limb(
				[
					[40, -70],
					[62, -124],
				],
				9,
			) +
			knob(36, -66, 6) +
			knob(44, -64, 6) +
			knob(58, -130, 6) +
			knob(67, -126, 6);
		g += skelBody(BONE);
		g +=
			limb(
				[
					[-20, -98],
					[-34, -114],
					[-36, -136],
				],
				7,
			) +
			knob(-34, -114, 4.6) +
			fanHand(-37, -143, -100, BONE, 1.05);
		g +=
			limb(
				[
					[20, -98],
					[34, -84],
					[46, -94],
				],
				7,
			) +
			knob(34, -84, 4.6) +
			`<ellipse cx="49" cy="-96" rx="7" ry="6" fill="${BONE}" ${o(2.6)}/>` +
			line("M45 -100 L53 -93 M44 -96 L51 -90", INK, 1.6);
		g += limb(
			[
				[0, -112],
				[0, -102],
			],
			7,
		);
		g += skull(0, -140, 0.95, { crack: true, missing: true, glow: "#a6f59a" });
		return g + "</g>";
	}

	const STEEL = "#8d939b",
		RUST = "#a8643a";
	function helm(s = 1) {
		let g = `<g transform="scale(${s})">`;
		g += `<path d="M-36-6 C-38-32 -21-46 0-46 C21-46 38-32 36-6 C30-10 22-12 12-12 L-12-12 C-22-12 -30-10 -36-6 Z" fill="${STEEL}" ${o()}/>`;
		g += `<path d="M18-40 C30-32 35-20 34-8 C30-10 26-11 22-12 C24-22 23-32 18-40 Z" fill="${dk(STEEL, 0.25)}"/>`;
		g += `<path d="M-37-10 C-26-16 26-16 37-10 L37-2 C26-8 -26-8 -37-2 Z" fill="${dk(STEEL, 0.12)}" ${o(3.4)}/>`;
		g += `<path d="M-4-44 L4-44 L5 8 Q0 11 -5 8 Z" fill="${dk(STEEL, 0.08)}" ${o(3)}/>`;
		for (const x of [-28, -16, 16, 28])
			g += `<circle cx="${x}" cy="-6" r="1.8" fill="${INK}"/>`;
		g += `<ellipse cx="-20" cy="-28" rx="5" ry="3.5" fill="${RUST}" opacity=".85"/><ellipse cx="24" cy="-20" rx="3" ry="2" fill="${RUST}" opacity=".85"/>`;
		g +=
			line("M12-38 Q16-32 12-26", INK, 2) +
			shine("M-24-34 C-16-41 -8-43 -6-43", "rgba(255,255,255,.6)", 3);
		return g + "</g>";
	}
	const WB = "#ddd1ab";
	function skelwarrior() {
		let g = shadow(150, 218, 58) + T(150, 216, 1.08);

		g += `<path d="M47 -104 L52 -166 L58 -172 L60 -164 L55 -103 Z" fill="#b9bfc6" ${o(3.4)}/><path d="M53 -110 L57 -163" stroke="${dk("#b9bfc6", 0.25)}" stroke-width="2"/><ellipse cx="54" cy="-136" rx="3" ry="2" fill="${RUST}"/>`;
		g += `<path d="M40 -104 L64 -102" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M40 -104 L64 -102" stroke="#c99a3e" stroke-width="4.5" stroke-linecap="round"/>`;
		g += skelBody(WB, 4);

		g += `<path d="M-20-60 L20-60 L18-40 L12-30 L8-38 L2-26 L-4-37 L-10-29 L-15-40 Z" fill="#9b3a32" ${o(3.4)}/><path d="M-19-58 H19" stroke="${dk("#9b3a32", 0.3)}" stroke-width="3"/>`;
		g +=
			limb(
				[
					[20, -98],
					[36, -90],
					[48, -102],
				],
				7,
				WB,
			) +
			knob(36, -90, 4.6, WB) +
			`<ellipse cx="50" cy="-103" rx="7" ry="6.5" fill="${WB}" ${o(2.6)}/>` +
			line("M46 -107 L46 -99 M51 -108 L51 -99", INK, 1.6);
		g += limb(
			[
				[0, -112],
				[0, -102],
			],
			7,
			WB,
		);
		g += limb(
			[
				[-20, -98],
				[-32, -86],
				[-38, -92],
			],
			7,
			WB,
		);

		g += T(-44, -86);
		g += `<circle r="33" fill="#8a5a3a" ${o()}/><path d="M-11-31 V31 M11-31 V31" stroke="${dk("#8a5a3a", 0.35)}" stroke-width="2.4"/>`;
		g += `<path d="M-6-32 C-4-10 -4 10 -6 32 L6 32 C4 10 4-10 6-32 Z" fill="#a8463a" opacity=".85"/>`;
		g += `<circle r="33" fill="none" stroke="${STEEL}" stroke-width="6"/><circle r="33" fill="none" ${o(2.4)}/><circle r="27" fill="none" ${o(2)}/>`;
		g += `<circle r="8" fill="${STEEL}" ${o(3)}/><circle cx="-2.5" cy="-2.5" r="2.6" fill="#fff" opacity=".6"/>`;
		g +=
			line("M20 -18 L13 -8 L18 -2", INK, 2.4) +
			shine("M-24-20 C-20-26 -14-29 -10-30", "rgba(255,255,255,.45)", 3);
		g += "</g>";
		g +=
			T(0, -140, 0.95) +
			skull(0, 0, 1, { c: WB, glow: "#8fdcff", angry: true }) +
			helm() +
			"</g>";
		return g + "</g>";
	}

	const HOOD = "#55704a";
	const hoodBack = () =>
		`<path d="M-42 28 C-48-20 -26-50 0-50 C26-50 48-20 42 28 C30 36 -30 36 -42 28 Z" fill="${dk(HOOD, 0.35)}" ${o()}/>`;
	const hoodFront = () =>
		`<path d="M-42 26 C-50-22 -26-52 0-52 C26-52 50-22 42 26 L36 30 L34 18 C34-8 22-30 0-30 C-22-30 -34-8 -34 18 L-36 30 Z" fill="${HOOD}" ${o()}/>` +
		`<path d="M26-44 C40-32 46-12 42 20 L36 26 C38 0 34-20 26-44 Z" fill="${dk(HOOD, 0.22)}"/>` +
		shine("M-30-34 C-22-44 -12-48 -4-49", "rgba(255,255,255,.4)", 3);
	const AB = "#e4ded0";
	function skelarcher() {
		let g = shadow(150, 218, 54) + T(160, 216, 1.04);

		g +=
			`<g transform="translate(18,-98) rotate(28)"><rect x="-9" y="-40" width="18" height="46" rx="4" fill="#7a4e30" ${o(3.6)}/><path d="M-9-30 H9 M-9-4 H9" stroke="${INK}" stroke-width="2"/>` +
			[-5, 0, 5]
				.map(
					(x, i) =>
						`<path d="M${x} -40 L${x} -50" stroke="${INK}" stroke-width="2"/><path d="M${x - 4} -56 L${x} -48 L${x + 4} -56 L${x} -60 Z" fill="${["#c94a3a", "#e8d9b0", "#c94a3a"][i]}" ${o(1.8)}/>`,
				)
				.join("") +
			"</g>";
		g += skelBody(AB, 2);

		g += `<path d="M-26-106 C-12-112 12-112 26-106 L28-90 L22-94 L18-84 L12-92 L4-82 L-2-92 L-10-84 L-16-93 L-22-86 L-28-92 Z" fill="${HOOD}" ${o(3.4)}/>`;
		g += limb(
			[
				[0, -112],
				[0, -102],
			],
			7,
			AB,
		);

		g += stick("M-62 -160 Q-96 -110 -62 -60", 5, "#9a6a3c");
		g +=
			line("M-62 -162 L22 -112 L-62 -58", "#efe6cf", 2) +
			line("M-62 -162 L22 -112 L-62 -58", INK, 0.8);
		g +=
			limb(
				[
					[-20, -100],
					[-46, -106],
					[-74, -110],
				],
				7,
				AB,
			) + knob(-46, -106, 4.4, AB);
		g += `<ellipse cx="-79" cy="-110" rx="7.5" ry="7" fill="${AB}" ${o(2.6)}/>`;

		g +=
			line("M24 -112 L-90 -112", INK, 4.6) +
			line("M24 -112 L-90 -112", "#c79a5c", 2.2) +
			`<path d="M-88 -117 L-100 -112 L-88 -107 Z" fill="#b9bfc6" ${o(2)}/><path d="M26 -112 L34 -118 L38 -118 L32 -112 L38 -106 L34 -106 Z" fill="#c94a3a" ${o(1.6)}/>`;
		g += line("M-82 -116 L-80 -106 M-77 -116 L-75 -106", INK, 1.8);
		g +=
			T(0, -142, 0.92) +
			hoodBack() +
			skull(0, 0, 1, { c: AB, glow: "#ffb24f" }) +
			hoodFront() +
			"</g>";
		g +=
			limb(
				[
					[20, -100],
					[44, -116],
					[24, -112],
				],
				7,
				AB,
			) + knob(44, -116, 4.4, AB);
		g +=
			`<ellipse cx="22" cy="-112" rx="7" ry="6.5" fill="${AB}" ${o(2.6)}/>` +
			limb(
				[
					[17, -118],
					[17, -106],
				],
				2.6,
				AB,
			) +
			limb(
				[
					[22, -119],
					[22, -105],
				],
				2.6,
				AB,
			);
		return g + "</g>";
	}

	const BAT = {
		fur: "#5e4a74",
		dk: "#3f3052",
		mem: "#7c6394",
		belly: "#9b84b3",
		ear: "#e39ab3",
	};
	function batHead(s = 1) {
		let g = `<g transform="scale(${s})">`;
		g += `<path d="M-24-8 L-34-50 Q-14-44 -6-24 Z" fill="${BAT.fur}" ${o()}/><path d="M24-8 L34-50 Q14-44 6-24 Z" fill="${BAT.fur}" ${o()}/>`;
		g += `<path d="M-22-14 L-29-42 Q-16-38 -11-24 Z" fill="${BAT.ear}"/><path d="M22-14 L29-42 Q16-38 11-24 Z" fill="${BAT.ear}"/>`;
		g += `<path d="M0-26 C20-26 31-14 31 2 C31 18 18 28 0 28 C-18 28 -31 18 -31 2 C-31-14 -20-26 0-26 Z" fill="${BAT.fur}" ${o()}/>`;
		g += `<path d="M-8-26 L-4-33 L0-26 L4-33 L8-26 Z" fill="${BAT.fur}" ${o(2.6)}/>`;
		g += `<path d="M18-20 C28-12 31 0 28 10 C24 20 16 25 8 27 C20 16 24 0 18-20 Z" fill="${BAT.dk}"/>`;
		g += `<path d="M-20 10 C-18 0 -8-2 0 2 C8-2 18 0 20 10 C18 20 10 25 0 25 C-10 25 -18 20 -20 10 Z" fill="${BAT.belly}"/>`;
		g += eye(-11, -6, 7, "#ff8a5c") + eye(11, -6, 7, "#ff8a5c");
		g += `<path d="M-6 6 Q0 2 6 6 Q5 11 0 11 Q-5 11 -6 6 Z" fill="${BAT.ear}" ${o(2)}/><circle cx="-2" cy="7.5" r="1.1" fill="${INK}"/><circle cx="2" cy="7.5" r="1.1" fill="${INK}"/>`;
		g += `<path d="M-9 15 Q0 21 9 15" fill="none" ${o(2.2)}/><path d="M-6 16.5 L-4.5 22 L-3 17.5 Z M6 16.5 L4.5 22 L3 17.5 Z" fill="#fff" ${o(1.4)}/>`;
		g += shine("M-16-18 C-10-23 -4-24 2-24", "rgba(255,255,255,.35)", 3);
		return g + "</g>";
	}
	function batWing(sx) {
		const S = (d) =>
			d.replace(
				/(-?\d+(\.\d+)?) (-?\d+(\.\d+)?)/g,
				(m, x, _a, y) => `${sx * x} ${y}`,
			);
		let g = `<path d="${S("M14 -10 L56 -46 L112 -30 Q100 -16 98 0 Q84 -8 74 10 Q62 -2 50 16 Q38 4 16 12 Z")}" fill="${BAT.mem}" ${o()}/>`;
		g += `<path d="${S("M56 -46 L112 -30 Q100 -16 98 0 Q90 -4 84 0 Q90 -22 56 -46 Z")}" fill="${BAT.dk}" opacity=".55"/>`;
		g += line(S("M56 -46 L98 0 M56 -46 L74 10 M56 -46 L50 16"), BAT.dk, 3);
		g +=
			line(S("M14 -10 L56 -46 L112 -30"), INK, 4.5) +
			line(S("M14 -10 L56 -46 L112 -30"), BAT.fur, 2.4);
		g += `<path d="${S("M56 -46 L60 -56 L62 -46 Z")}" fill="#efe6cf" ${o(1.8)}/>`;
		return g;
	}
	function bat() {
		let g = shadow(150, 220, 30) + T(150, 112, 1.05);
		g += batWing(-1) + batWing(1);
		g += `<path d="M-18 6 C-22 30 -10 44 0 44 C10 44 22 30 18 6 Z" fill="${BAT.fur}" ${o()}/><path d="M-9 14 C-11 30 -5 38 0 38 C5 38 11 30 9 14 Z" fill="${BAT.belly}"/>`;
		g += `<path d="M-7 42 L-9 52 M-9 52 L-12 55 M-9 52 L-6 55 M7 42 L9 52 M9 52 L12 55 M9 52 L6 55" fill="none" ${o(2.6)}/>`;
		g += T(0, -18) + batHead(1) + "</g>";
		return g + "</g>";
	}

	const MAR = {
		cloak: "#7a6248",
		dk: "#54412e",
		patch: "#a3845a",
		scarf: "#8f3d2f",
		skin: "#d9a27a",
		sack: "#c5aa76",
	};
	function marHead(s = 1) {
		let g = `<g transform="scale(${s})">`;
		g += `<path d="M0-48 C8-46 14-40 18-34 C30-28 38-14 38 4 C38 24 22 34 0 34 C-22 34 -38 24 -38 4 C-38-16 -26-30 -14-36 C-10-42 -6-46 0-48 Z" fill="${MAR.cloak}" ${o()}/>`;
		g += `<path d="M20-32 C32-22 38-8 37 8 C36 20 28 28 18 32 C28 18 30-6 20-32 Z" fill="${MAR.dk}"/>`;
		g += `<path d="M-26 8 C-28-12 -14-22 0-22 C14-22 28-12 26 8 C22 18 -22 18 -26 8 Z" fill="#3a2a22"/>`;
		g += `<path d="M-22 2 C-20-10 -10-14 0-14 C10-14 20-10 22 2 Z" fill="${MAR.skin}"/>`;
		g += `<path d="M-18-6 L-5-3 M18-6 L5-3" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`;
		g += eye(-11, 2, 5.6, "#e9c35a", 1.8) + eye(11, 2, 5.6, "#e9c35a", 1.8);

		g += `<path d="M-30 6 C-18 12 18 12 30 6 C30 20 18 30 0 30 C-18 30 -30 20 -30 6 Z" fill="${MAR.scarf}" ${o()}/>`;
		g += line(
			"M-22 16 Q0 22 22 16 M-14 24 Q0 28 14 24",
			dk(MAR.scarf, 0.35),
			2.2,
		);
		g +=
			`<rect x="-24" y="-38" width="12" height="10" rx="2" fill="${MAR.patch}" ${o(2)}/>` +
			line("M-21 -36 L-15 -30 M-15 -36 L-21 -30", INK, 1.2);
		g += shine("M-26-20 C-20-30 -12-36 -6-40", "rgba(255,255,255,.3)", 3);
		return g + "</g>";
	}
	function marauder() {
		let g = shadow(150, 218, 52) + T(150, 216, 1.05);

		g += `<path d="M-40-120 C-62-118 -70-90 -62-70 C-56-56 -34-56 -26-70 C-20-84 -22-108 -40-120 Z" fill="${MAR.sack}" ${o()}/>`;
		g +=
			`<path d="M-30-74 C-34-62 -50-60 -58-68 C-50-66 -38-66 -30-74 Z" fill="${dk(MAR.sack, 0.25)}"/>` +
			line(
				"M-52-104 Q-46-96 -50-86 M-40-84 Q-36-78 -40-72",
				dk(MAR.sack, 0.4),
				2,
			);
		g += `<path d="M-42-122 L-36-128 L-30-120" fill="none" ${o(3)}/><circle cx="-62" cy="-60" r="5" fill="#f2c14e" ${o(2)}/><path d="M-63 -62 V-58" stroke="${dk("#f2c14e", 0.3)}" stroke-width="1.4"/>`;

		for (const sx of [-1, 1])
			g +=
				`<path d="M${sx * 6} -34 L${sx * 6} -8 Q${sx * 6} 2 ${sx * 16} 2 L${sx * 22} 2 Q${sx * 26} 0 ${sx * 22} -6 L${sx * 18} -10 L${sx * 18} -34 Z" fill="#6b5a4a" ${o()}/>` +
				line(
					`M${sx * 7} -26 L${sx * 17} -22 M${sx * 7} -18 L${sx * 17} -14`,
					INK,
					1.6,
				);

		g += `<path d="M-14-104 C-30-96 -38-70 -40-40 L-32-32 L-26-40 L-18-30 L-10-38 L0-28 L10-38 L18-30 L26-40 L32-32 L40-40 C38-70 30-96 14-104 Z" fill="${MAR.cloak}" ${o()}/>`;
		g += `<path d="M18-100 C30-90 36-70 38-44 L32-36 C32-60 28-82 18-100 Z" fill="${MAR.dk}"/>`;
		g +=
			`<rect x="12" y="-72" width="14" height="12" rx="2" fill="${MAR.patch}" ${o(2)}/>` +
			line("M15-70 L23-62 M23-70 L15-62", INK, 1.2);
		g += `<path d="M-34-58 C-14-52 14-52 34-58 L34-50 C14-44 -14-44 -34-50 Z" fill="#4a3424" ${o(3)}/><rect x="-6" y="-58" width="12" height="10" rx="2" fill="#c9a24a" ${o(2.4)}/>`;

		g += `<path d="M-20-98 C-30-102 -38-112 -40-118" fill="none" stroke="${INK}" stroke-width="15" stroke-linecap="round"/><path d="M-20-98 C-30-102 -38-112 -40-118" fill="none" stroke="${MAR.cloak}" stroke-width="8" stroke-linecap="round"/>`;
		g += `<circle cx="-40" cy="-120" r="7" fill="${MAR.skin}" ${o(2.6)}/>`;

		g += `<path d="M24-90 C34-84 40-76 44-70" fill="none" stroke="${INK}" stroke-width="15" stroke-linecap="round"/><path d="M24-90 C34-84 40-76 44-70" fill="none" stroke="${MAR.cloak}" stroke-width="8" stroke-linecap="round"/>`;
		g += `<path d="M48-74 L76-92 L80-88 L52-66 Z" fill="#a9aeb3" ${o(3)}/><path d="M60-82 L64-79 M70-88 L72-86" stroke="${RUST}" stroke-width="3" stroke-linecap="round"/>`;
		g += `<path d="M44-78 L52-64" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M44-78 L52-64" stroke="#7a5233" stroke-width="3" stroke-linecap="round"/>`;
		g += `<circle cx="46" cy="-70" r="7" fill="${MAR.skin}" ${o(2.6)}/>`;
		g += T(0, -130) + marHead(1) + "</g>";
		return g + "</g>";
	}

	const GH = {
		skin: "#9fae8c",
		dk: "#72805f",
		lt: "#c6d1b0",
		rag: "#5d4f45",
		gum: "#5a2228",
	};
	function ghoulHead(s = 1) {
		let g = `<g transform="scale(${s})">`;
		g += `<path d="M-26-6 L-52-20 L-44-4 L-50 2 L-28 8 Z" fill="${GH.skin}" ${o()}/><path d="M26-6 L52-20 L44-4 L50 2 L28 8 Z" fill="${GH.skin}" ${o()}/>`;
		g += `<path d="M-30-12 L-44-15 L-32-2 Z M30-12 L44-15 L32-2 Z" fill="${GH.dk}"/>`;
		g += `<path d="M0-36 C20-36 32-24 32-6 C32 4 34 12 30 20 C24 32 12 36 0 36 C-12 36 -24 32 -30 20 C-34 12 -32 4 -32-6 C-32-24 -20-36 0-36 Z" fill="${GH.skin}" ${o()}/>`;
		g += `<path d="M20-28 C30-18 33-4 31 10 C30 20 24 28 16 32 C26 18 28-6 20-28 Z" fill="${GH.dk}"/>`;
		g += line(
			"M-6-35 Q-10-46 -4-50 M2-36 Q4-48 12-50 M8-35 Q14-42 20-42",
			INK,
			2,
		);

		g += `<ellipse cx="-12" cy="-6" rx="9.5" ry="9" fill="${INK}"/><ellipse cx="12" cy="-6" rx="9.5" ry="9" fill="${INK}"/>`;
		g += `<ellipse cx="-12" cy="-5" rx="7" ry="6.5" fill="#f1e35a"/><ellipse cx="12" cy="-5" rx="7" ry="6.5" fill="#f1e35a"/><circle cx="-11" cy="-4" r="2.4" fill="${INK}"/><circle cx="11" cy="-4" r="2.4" fill="${INK}"/><circle cx="-14" cy="-7.5" r="1.8" fill="#fff"/><circle cx="10" cy="-7.5" r="1.8" fill="#fff"/>`;
		g += `<path d="M-24-14 L-3-9 L-4-14 L-22-20 Z M24-14 L3-9 L4-14 L22-20 Z" fill="${GH.dk}" ${o(2.4)}/>`;
		g += `<path d="M-3 4 L0 8 L3 4" fill="none" ${o(2.2)}/>`;

		g += `<path d="M-24 12 Q0 20 24 12 Q18 32 0 32 Q-18 32 -24 12 Z" fill="${GH.gum}" ${o()}/>`;
		g += `<path d="M-21 14 L-17 22 L-13 16 L-9 24 L-5 17 L0 25 L5 17 L9 23 L13 16 L17 21 L21 14 Q0 20 -21 14 Z" fill="#efe6c8" ${o(1.6)}/>`;
		g += `<path d="M-10 30 L-8 25 L-5 30 M5 30 L8 24 L11 29" fill="#efe6c8" ${o(1.4)}/>`;
		g += line("M18-26 L24-18 M20-22 L24-24", dk(GH.skin, 0.4), 1.8);
		g += shine("M-20-27 C-14-32 -6-34 0-34", "rgba(255,255,255,.45)", 3);
		return g + "</g>";
	}
	const claw = (x, y, sx, up = false) =>
		[-6, 0, 6]
			.map(
				(d) =>
					`<path d="M${x + d} ${y} l${sx * 2} ${up ? -10 : 10} l${sx * 3} ${up ? 9 : -9} Z" fill="#efe6c8" ${o(1.8)}/>`,
			)
			.join("");
	function ghoul() {
		let g = shadow(150, 218, 64) + T(150, 216, 1.06);

		g +=
			stick("M-14-46 L-30-26 L-22-6", 14, GH.skin) +
			stick("M14-46 L30-26 L22-6", 14, GH.skin);
		g += `<path d="M-34 0 C-34-8 -12-10 -10-2 L-10 2 L-34 2 Z" fill="${GH.skin}" ${o(3.4)}/><path d="M34 0 C34-8 12-10 10-2 L10 2 L34 2 Z" fill="${GH.skin}" ${o(3.4)}/>`;
		g += line("M-28 2 V-3 M-20 2 V-4 M28 2 V-3 M20 2 V-4", INK, 1.8);

		g += `<path d="M-32-48 C-42-78 -26-112 2-114 C30-114 44-90 36-62 C32-48 16-40 0-40 C-16-40 -28-42 -32-48 Z" fill="${GH.skin}" ${o()}/>`;
		g += `<path d="M24-104 C38-92 42-74 36-58 C32-50 26-46 18-42 C30-60 32-84 24-104 Z" fill="${GH.dk}"/>`;
		for (const y of [-90, -82, -74])
			g += line(
				`M-18 ${y} Q-10 ${y + 4} -4 ${y + 1} M18 ${y} Q10 ${y + 4} 4 ${y + 1}`,
				GH.dk,
				2.4,
			);
		g += `<path d="M-32-56 C-12-48 14-48 36-58 L34-44 L26-36 L20-44 L12-32 L4-42 L-4-30 L-12-42 L-20-32 L-26-42 Z" fill="${GH.rag}" ${o(3.4)}/>`;

		g +=
			stick("M-26-98 L-48-64 L-52-20", 12, GH.skin) +
			`<ellipse cx="-52" cy="-14" rx="10" ry="8" fill="${GH.skin}" ${o(3)}/>` +
			claw(-52, -8, -1);
		g +=
			stick("M28-98 L54-96 L66-122", 12, GH.skin) +
			`<ellipse cx="67" cy="-128" rx="10" ry="8" fill="${GH.skin}" ${o(3)}/>` +
			claw(67, -134, 1, true);
		g += `<path d="M-30-104 C-38-92 -46-80 -50-66" fill="none" stroke="${GH.lt}" stroke-width="2.4" stroke-linecap="round"/>`;
		g += T(0, -112) + ghoulHead(0.98) + "</g>";
		return g + "</g>";
	}

	const GS = { c: "#e4f4f5", dk: "#a9d2d8", glow: "#bff0ff" };
	function ghostFig(chain = true) {
		let g = `<circle cx="0" cy="-20" r="62" fill="${GS.glow}" opacity=".28"/>`;
		g += `<path d="M-40-12 C-58-18 -66-32 -62-42 C-54-40 -44-30 -36-24 Z" fill="${GS.c}" ${o()}/>`;
		g += `<path d="M0-72 C30-72 44-50 44-20 C44 4 40 22 56 38 C38 42 24 34 18 26 Q10 38 0 30 Q-10 40 -20 28 Q-32 38 -42 24 C-46 8 -44-6 -44-20 C-44-50 -30-72 0-72 Z" fill="${GS.c}" ${o()}/>`;
		g += `<path d="M26-62 C38-50 42-34 42-18 C42 4 40 20 52 36 C42 36 34 32 28 26 C36 10 36-30 26-62 Z" fill="${GS.dk}"/>`;
		g += `<path d="M-30 10 Q-24 16 -18 12 M-6 14 Q0 20 6 16" fill="none" stroke="${GS.dk}" stroke-width="2.4" stroke-linecap="round"/>`;
		g += `<path d="M38-22 C54-30 62-44 58-52 C50-50 44-40 38-34 Z" fill="${GS.c}" ${o()}/>`;
		if (chain) {
			g += `<rect x="46" y="-46" width="12" height="9" rx="2" transform="rotate(-30 52 -41)" fill="#8d939b" ${o(2.4)}/>`;
			for (let i = 0; i < 4; i++)
				g += `<ellipse cx="${60 + i * 3}" cy="${-30 + i * 10}" rx="${i % 2 ? 2.4 : 4}" ry="5.4" fill="none" stroke="${INK}" stroke-width="4.2"/><ellipse cx="${60 + i * 3}" cy="${-30 + i * 10}" rx="${i % 2 ? 2.4 : 4}" ry="5.4" fill="none" stroke="#8d939b" stroke-width="2"/>`;
			g += `<circle cx="72" cy="14" r="8" fill="#6f747c" ${o(3)}/><circle cx="70" cy="12" r="2.4" fill="#fff" opacity=".5"/>`;
		}
		g += `<ellipse cx="-14" cy="-36" rx="10" ry="13" fill="${INK}"/><ellipse cx="14" cy="-36" rx="10" ry="13" fill="${INK}"/>`;
		g += glowEye(-14, -34, 3.8, "#7fe6ff") + glowEye(14, -34, 3.8, "#7fe6ff");
		g += `<path d="M-24-52 Q-16-56 -8-52 M8-52 Q16-56 24-52" fill="none" ${o(2.4)}/>`;
		g += `<ellipse cx="0" cy="-12" rx="8" ry="10" fill="${INK}"/><ellipse cx="0" cy="-7" rx="4.5" ry="3.6" fill="#5a8aa0"/>`;
		g += shine("M-30-56 C-24-64 -14-69 -6-70", "rgba(255,255,255,.9)", 3.4);
		return g;
	}
	function ghost() {
		return shadow(150, 220, 36) + T(146, 132, 1.08) + ghostFig(true) + "</g>";
	}

	const KN = {
		st: "#646b78",
		dk: "#3f444e",
		lt: "#949cab",
		tab: "#5b2a3b",
		cape: "#33283a",
		glow: "#ff5545",
	};
	function knightHelm(s = 1, plume = true) {
		let g = `<g transform="scale(${s})">`;

		if (plume) {
			g += `<path d="M-2-56 C4-66 18-70 30-64 C26-62 28-58 32-54 C24-52 24-50 27-45 C20-47 12-50 4-52 Z" fill="#9b2f34" ${o()}/>`;
			g += `<path d="M8-58 C14-62 22-64 28-63 M10-54 C16-55 22-54 27-50" fill="none" stroke="${dk("#9b2f34", 0.35)}" stroke-width="2.2" stroke-linecap="round"/>`;
		} else
			g += `<path d="M-2-56 C2-66 12-70 20-66 C16-62 16-58 20-54 L4-52 Z" fill="#9b2f34" ${o()}/>`;
		g += `<path d="M-36-22 C-38-46 -22-58 0-58 C22-58 38-46 36-22 L34 22 C22 30 -22 30 -34 22 Z" fill="${KN.st}" ${o()}/>`;
		g += `<path d="M22-52 C34-42 36-26 35-10 L33 22 C30 25 27 26 24 27 C28 4 30-30 22-52 Z" fill="${KN.dk}"/>`;
		g += `<path d="M-4-57 L4-57 L4 28 L-4 28 Z" fill="${KN.lt}" ${o(2.6)}/>`;

		g += `<path d="M-30-10 C-20-14 20-14 30-10 L30 0 C20-4 -20-4 -30 0 Z" fill="${INK}"/>`;
		g += `<ellipse cx="0" cy="-6" rx="30" ry="9" fill="${KN.glow}" opacity=".25"/>`;
		g += `<ellipse cx="-13" cy="-6" rx="6" ry="3.6" fill="${KN.glow}"/><ellipse cx="13" cy="-6" rx="6" ry="3.6" fill="${KN.glow}"/><circle cx="-15" cy="-7" r="1.4" fill="#fff"/><circle cx="11" cy="-7" r="1.4" fill="#fff"/>`;
		for (const x of [-18, -10, 10, 18])
			for (const y of [8, 15])
				g += `<circle cx="${x}" cy="${y}" r="1.9" fill="${INK}"/>`;
		g +=
			line("M-24-38 L-16-30 L-20-24", INK, 2.2) +
			`<path d="M14-30 Q20-26 18-20" fill="none" stroke="${KN.dk}" stroke-width="3"/>`;
		g += shine("M-28-34 C-22-46 -12-52 -8-53", "rgba(255,255,255,.5)", 3.2);
		return g + "</g>";
	}
	function fallenknight() {
		let g = shadow(150, 222, 72) + T(150, 220, 1.0);

		g += `<path d="M-38-128 C-54-90 -60-40 -58-6 L-48-14 L-42 0 L-30-12 L-24 -2 L24 -2 L30-12 L42 0 L48-14 L58-6 C60-40 54-90 38-128 Z" fill="${KN.cape}" ${o()}/>`;
		g += `<circle cx="-44" cy="-40" r="4" fill="${lt(KN.cape, 0.2)}"/><circle cx="48" cy="-60" r="3" fill="${lt(KN.cape, 0.2)}"/>`;

		for (const sx of [-1, 1]) {
			g += `<path d="M${sx * 8}-62 L${sx * 9}-12 L${sx * 6} 2 L${sx * 34} 2 L${sx * 30}-12 L${sx * 28}-62 Z" fill="${KN.st}" ${o()}/>`;
			g += `<path d="M${sx * 22}-60 L${sx * 24}-14 L${sx * 28}-12 L${sx * 27}-60 Z" fill="${KN.dk}"/>`;
			g +=
				`<ellipse cx="${sx * 18}" cy="-38" rx="11" ry="8" fill="${KN.lt}" ${o(3)}/>` +
				line(`M${sx * 8}-12 L${sx * 30}-12`, INK, 3);
		}

		g += `<path d="M-34-130 C-38-100 -32-78 -24-64 L24-64 C32-78 38-100 34-130 C20-138 -20-138 -34-130 Z" fill="${KN.st}" ${o()}/>`;
		g += `<path d="M22-132 C32-110 32-86 22-66 L18-66 C26-88 26-110 18-132 Z" fill="${KN.dk}"/>`;

		g += `<path d="M-20-120 L20-120 L22-30 L14-40 L8-24 L0-34 L-8-22 L-14-38 L-22-28 Z" fill="${KN.tab}" ${o(3.6)}/>`;
		g += `<path d="M-10-112 L10-112 L10-96 Q0-86 -10-96 Z" fill="#b9934a" opacity=".55" ${o(1.6)}/>`;
		g += `<path d="M-38-70 C-14-62 14-62 38-70 L38-60 C14-52 -14-52 -38-60 Z" fill="#3b2a22" ${o(3)}/>`;

		g += line("M-10 2 L-4-6 M10 2 L4-6 M0 4 L0-2", INK, 2.2);
		g += `<path d="M-8-68 L8-68 L7-10 L0 2 L-7-10 Z" fill="#aab1ba" ${o()}/><path d="M0-66 L0-8" stroke="${dk("#aab1ba", 0.3)}" stroke-width="2.4"/>`;
		g += `<path d="M7-40 L3-37 L7-33 Z" fill="#e9e3c9" ${o(1.4)}/><path d="M-4-56 L-1-50 L-4-46" fill="none" stroke="${INK}" stroke-width="1.6"/>`;
		g +=
			`<rect x="-28" y="-78" width="56" height="9" rx="4" fill="#b9934a" ${o(3.4)}/>` +
			shine("M-22 -75.5 H18", "rgba(255,255,255,.5)", 2);
		g +=
			`<rect x="-5" y="-96" width="10" height="22" rx="3" fill="#4a3226" ${o(3)}/>` +
			line("M-5-90 H5 M-5-84 H5", "#7a5a46", 1.6);
		g += `<circle cx="0" cy="-100" r="7" fill="#b9934a" ${o(3)}/><circle cx="0" cy="-100" r="2.6" fill="${KN.glow}"/>`;

		for (const sx of [-1, 1]) {
			g += `<path d="M${sx * 36}-122 C${sx * 38}-104 ${sx * 28}-94 ${sx * 10}-90" fill="none" stroke="${INK}" stroke-width="19" stroke-linecap="round"/><path d="M${sx * 36}-122 C${sx * 38}-104 ${sx * 28}-94 ${sx * 10}-90" fill="none" stroke="${KN.st}" stroke-width="10.5" stroke-linecap="round"/>`;
			g += `<path d="M${sx * 2}-96 C${sx * 2}-100 ${sx * 16}-100 ${sx * 16}-92 C${sx * 16}-84 ${sx * 2}-82 ${sx * 2}-88 Z" fill="${KN.dk}" ${o(3)}/>`;
		}

		g += `<path d="M-58-112 C-62-132 -46-144 -26-138 L-20-118 C-34-122 -46-118 -58-112 Z" fill="${KN.lt}" ${o()}/><path d="M-56-116 C-50-122 -40-124 -28-122" fill="none" ${o(2.2)}/>`;
		g += `<path d="M58-112 C62-132 46-144 26-138 L20-118 C34-122 46-118 58-112 Z" fill="${KN.lt}" ${o()}/><path d="M40-140 L44-156 L50-140" fill="${KN.lt}" ${o(3)}/><path d="M56-116 C50-122 40-124 28-122" fill="none" ${o(2.2)}/>`;
		g += `<path d="M-48-130 L-44-122 L-50-118" fill="none" ${o(2)}/>`;

		g += `<path d="M-62-108 C-72-118 -64-128 -74-140" fill="none" stroke="#5a4668" stroke-width="5" stroke-linecap="round" opacity=".55"/><path d="M62-104 C74-112 66-124 76-134" fill="none" stroke="#5a4668" stroke-width="4" stroke-linecap="round" opacity=".55"/>`;
		g += T(0, -146) + knightHelm(0.92) + "</g>";
		return g + "</g>";
	}

	const GR = {
		st: "#8c8f99",
		dk: "#5f626c",
		lt: "#b8bbc4",
		moss: "#7c9b4b",
		eye: "#ff9a3a",
	};
	function gargHead(s = 1) {
		let g = `<g transform="scale(${s})">`;

		g += `<path d="M-18-26 C-30-40 -34-56 -26-66 C-24-54 -16-44 -6-34 Z" fill="${GR.lt}" ${o()}/><path d="M18-26 C30-40 34-56 26-66 C24-54 16-44 6-34 Z" fill="${GR.lt}" ${o()}/>`;
		g += line(
			"M-24-50 L-18-48 M-20-40 L-14-40 M24-50 L18-48 M20-40 L14-40",
			INK,
			1.8,
		);

		g += `<path d="M-28-6 L-50-22 L-42 2 Z" fill="${GR.st}" ${o()}/><path d="M28-6 L50-22 L42 2 Z" fill="${GR.st}" ${o()}/>`;
		g += `<path d="M0-34 C20-34 32-22 32-4 C32 14 22 30 0 32 C-22 30 -32 14 -32-4 C-32-22 -20-34 0-34 Z" fill="${GR.st}" ${o()}/>`;
		g += `<path d="M20-26 C30-16 33-2 30 10 C27 20 20 27 12 30 C24 16 26-4 20-26 Z" fill="${GR.dk}"/>`;
		g += `<path d="M-14-32 C-8-36 4-36 10-33 C4-28 -6-28 -14-32 Z" fill="${GR.moss}" ${o(1.8)}/>`;

		g += `<ellipse cx="-12" cy="-6" rx="8.5" ry="8" fill="${INK}"/><ellipse cx="12" cy="-6" rx="8.5" ry="8" fill="${INK}"/>`;
		g += glowEye(-12, -5, 5.2, GR.eye) + glowEye(12, -5, 5.2, GR.eye);
		g += `<path d="M-26-14 C-16-20 -6-18 -2-12 L2-12 C6-18 16-20 26-14 L24-8 C16-14 8-14 2-8 L-2-8 C-8-14 -16-14 -24-8 Z" fill="${GR.dk}" ${o(2.6)}/>`;

		g += `<path d="M-16 8 C-16 0 16 0 16 8 C16 20 8 26 0 26 C-8 26 -16 20 -16 8 Z" fill="${GR.lt}" ${o(3.4)}/>`;
		g += `<ellipse cx="-5" cy="7" rx="2.6" ry="2" fill="${INK}"/><ellipse cx="5" cy="7" rx="2.6" ry="2" fill="${INK}"/>`;
		g += `<path d="M-11 16 Q0 22 11 16" fill="none" ${o(2.4)}/><path d="M-9 16.5 L-7 25 L-4 18 Z M9 16.5 L7 25 L4 18 Z" fill="#f2ecdc" ${o(1.6)}/>`;
		g +=
			line("M22-22 L16-14 L20-8 L15 0", INK, 2) +
			shine("M-22-22 C-16-28 -10-31 -4-32", "rgba(255,255,255,.5)", 3);
		return g + "</g>";
	}
	function gargWing(sx) {
		const S = (d) =>
			d.replace(
				/(-?\d+(\.\d+)?) (-?\d+(\.\d+)?)/g,
				(m, x, _a, y) => `${sx * x} ${y}`,
			);
		let g = `<path d="${S("M18 -96 L62 -152 L96 -132 Q86 -118 90 -100 Q76 -104 74 -86 Q62 -94 54 -76 Q42 -86 26 -72 Z")}" fill="${GR.dk}" ${o()}/>`;
		g += line(
			S("M62 -152 L90 -100 M62 -152 L74 -86 M62 -152 L54 -76"),
			dk(GR.dk, 0.35),
			3,
		);
		g +=
			line(S("M18 -96 L62 -152 L96 -132"), INK, 9) +
			line(S("M18 -96 L62 -152 L96 -132"), GR.st, 4.5);
		g += `<path d="${S("M62 -152 L58 -164 L68 -154 Z")}" fill="${GR.lt}" ${o(2)}/>`;
		return g;
	}
	function gargoyle() {
		let g = shadow(150, 220, 72) + T(150, 216, 1.04);
		g += gargWing(-1) + gargWing(1);

		g +=
			`<path d="M-50-30 L50-30 L46 2 L-46 2 Z" fill="#a39d8f" ${o()}/><path d="M30-30 L50-30 L46 2 L28 2 Z" fill="#857f72"/>` +
			line("M-30-30 V2 M-10-30 V2 M10-30 V2", dk("#a39d8f", 0.25), 2.4);
		g += `<path d="M-60-42 L60-42 L60-30 L-60-30 Z" fill="#bdb7a8" ${o()}/><path d="M60-42 L46-42 L50-36 L44-30 L60-30 Z" fill="#e9e3c9" ${o(2.4)}/>`;
		g +=
			line("M-20 2 L-16-10 L-22-18", INK, 2) +
			`<path d="M-46-6 C-40-12 -30-12 -26-4 L-30 2 L-46 2 Z" fill="${GR.moss}" ${o(2)}/>`;

		g += `<path d="M28-50 C56-50 66-30 58-14" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="M28-50 C56-50 66-30 58-14" fill="none" stroke="${GR.st}" stroke-width="5.5" stroke-linecap="round"/>`;
		g += `<path d="M58-16 L50-8 L60 2 L68-10 Z" fill="${GR.st}" ${o(3)}/>`;

		for (const sx of [-1, 1]) {
			g += `<ellipse cx="${sx * 30}" cy="-62" rx="17" ry="22" fill="${GR.st}" ${o()}/>`;
			g += `<path d="M${sx * 20}-48 C${sx * 20}-56 ${sx * 44}-56 ${sx * 44}-46 L${sx * 44}-42 L${sx * 20}-42 Z" fill="${GR.st}" ${o(3.4)}/>`;
			g += [0, 8, 16]
				.map(
					(d) =>
						`<path d="M${sx * (22 + d)}-42 l${sx * 2} 8 l${sx * 3}-8 Z" fill="${GR.lt}" ${o(1.6)}/>`,
				)
				.join("");
		}
		g += `<ellipse cx="38" cy="-66" rx="6" ry="10" fill="${GR.dk}" opacity=".7"/>`;

		g += `<path d="M-26-44 C-36-70 -28-102 0-104 C28-102 36-70 26-44 Z" fill="${GR.st}" ${o()}/>`;
		g +=
			`<path d="M-14-50 C-18-70 -12-86 0-88 C12-86 18-70 14-50 Z" fill="${GR.lt}"/>` +
			line("M-14-60 H14 M-15-70 H15 M-12-80 H12", GR.dk, 2.2);
		g += `<path d="M18-98 C30-86 32-64 24-46 L18-46 C24-64 24-84 18-98 Z" fill="${GR.dk}"/>`;

		for (const sx of [-1, 1]) {
			g += `<path d="M${sx * 22}-92 C${sx * 30}-78 ${sx * 20}-60 ${sx * 12}-50" fill="none" stroke="${INK}" stroke-width="17" stroke-linecap="round"/><path d="M${sx * 22}-92 C${sx * 30}-78 ${sx * 20}-60 ${sx * 12}-50" fill="none" stroke="${GR.st}" stroke-width="9" stroke-linecap="round"/>`;
			g +=
				`<ellipse cx="${sx * 11}" cy="-46" rx="9" ry="6" fill="${GR.st}" ${o(3)}/>` +
				[-5, 0, 5]
					.map(
						(d) =>
							`<path d="M${sx * 11 + d - 2}-42 l2 7 l2-7 Z" fill="${GR.lt}" ${o(1.4)}/>`,
					)
					.join("");
		}
		g += T(0, -118) + gargHead(1) + "</g>";
		return g + "</g>";
	}

	const NC = {
		robe: "#4b3a63",
		dk: "#30244a",
		lt: "#6e5b8c",
		skin: "#c9ccb4",
		magic: "#8ff07a",
	};
	function necroHead(s = 1) {
		let g = `<g transform="scale(${s})">`;
		g += `<path d="M0-54 C10-52 18-44 22-36 C34-28 40-12 40 6 C40 26 24 36 0 36 C-24 36 -40 26 -40 6 C-40-12 -34-28 -22-36 C-18-44 -10-52 0-54 Z" fill="${NC.robe}" ${o()}/>`;
		g += `<path d="M22-34 C34-24 40-8 39 8 C38 22 28 31 16 34 C28 20 30-8 22-34 Z" fill="${NC.dk}"/>`;
		g += `<path d="M-27 14 C-31-10 -16-25 0-25 C16-25 31-10 27 14 C21 30 -21 30 -27 14 Z" fill="#1d1528" stroke="${NC.lt}" stroke-width="2.6"/>`;
		g += `<path d="M-17-2 C-17-14 -8-18 0-18 C8-18 17-14 17-2 C17 12 10 22 0 24 C-10 22 -17 12 -17-2 Z" fill="${NC.skin}" ${o(3)}/>`;
		g += `<path d="M-15 6 C-12 10 -10 14 -6 16 M15 6 C12 10 10 14 6 16" fill="none" stroke="${dk(NC.skin, 0.3)}" stroke-width="2" stroke-linecap="round"/>`;
		g += `<ellipse cx="-8" cy="-4" rx="6.4" ry="5.6" fill="${INK}"/><ellipse cx="8" cy="-4" rx="6.4" ry="5.6" fill="${INK}"/>`;
		g += glowEye(-8, -4, 3.4, NC.magic) + glowEye(8, -4, 3.4, NC.magic);
		g += `<path d="M-14-11 L-3-8 M14-11 L3-8" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`;
		g += `<path d="M0-2 L-2 7 L1 8" fill="none" ${o(1.8)}/><path d="M-5 12 Q0 14 5 12" fill="none" ${o(1.8)}/>`;
		g += `<path d="M-8 16 Q0 20 8 16 L2 34 L0 30 L-2 34 Z" fill="#bdb8ad" ${o(2.4)}/>`;
		g += shine("M-28-18 C-22-30 -14-38 -8-42", "rgba(255,255,255,.3)", 3);
		return g + "</g>";
	}
	function necromancer() {
		let g = shadow(150, 220, 64) + T(146, 216, 0.95);

		g +=
			stick("M54 2 C50-60 58-110 52-160", 6, "#5a3c2a") +
			line("M53-60 L57-56 M54-120 L50-116", INK, 2);
		g += `<g transform="translate(0,22)"><path d="M44-184 C40-196 46-204 52-206 C50-198 54-196 52-186 M60-184 C64-196 58-204 52-206" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
		g += `<path d="M40-200 C36-216 46-224 52-236 C56-224 66-214 62-200 C58-192 44-192 40-200 Z" fill="${NC.magic}" opacity=".8" ${o(2)}/><path d="M47-202 C46-210 50-214 52-220 C55-213 58-208 56-202 Z" fill="#e6ffd8"/>`;
		g += skull(52, -186, 0.42, { glow: NC.magic }) + "</g>";

		g += `<path d="M-20-120 C-36-90 -46-40 -50-4 L-40 2 L-30-6 L-20 2 L-10-6 L0 2 L10-6 L20 2 L30-6 L40 2 L50-4 C46-40 36-90 20-120 Z" fill="${NC.robe}" ${o()}/>`;
		g += `<path d="M24-112 C36-80 44-40 46-6 L40-2 C38-40 32-80 20-114 Z" fill="${NC.dk}"/>`;
		g +=
			`<path d="M-8-110 L8-110 L14-4 L-14-4 Z" fill="${NC.dk}" ${o(2.6)}/>` +
			line(
				"M0-96 V-86 M-3-80 L3-74 M3-80 L-3-74 M0-66 V-56 M-3-40 Q0-46 3-40 Q0-34 -3-40",
				NC.magic,
				2,
			);
		g += `<path d="M-40-58 C-14-50 14-50 40-58 L40-48 C14-40 -14-40 -40-48 Z" fill="#2a1f22" ${o(3)}/>`;
		g += skull(0, -52, 0.22, { glow: NC.magic });
		g +=
			limb(
				[
					[-30, -50],
					[-32, -34],
				],
				3,
			) +
			knob(-32, -32, 3.2) +
			knob(-34, -30, 3.2) +
			limb(
				[
					[30, -52],
					[34, -36],
				],
				3,
			) +
			`<circle cx="35" cy="-32" r="4" fill="#c94a3a" ${o(2)}/>`;

		g += `<path d="M-22-118 L-46-162 L-20-138 Z M22-118 L46-162 L20-138 Z" fill="${NC.dk}" ${o(3.4)}/>`;

		g += `<path d="M20-114 C34-110 42-104 50-104" fill="none" stroke="${INK}" stroke-width="20" stroke-linecap="round"/><path d="M20-114 C34-110 42-104 50-104" fill="none" stroke="${NC.robe}" stroke-width="11.5" stroke-linecap="round"/>`;
		g +=
			`<ellipse cx="52" cy="-104" rx="8" ry="7" fill="${NC.skin}" ${o(2.8)}/>` +
			line("M48-108 L48-100 M53-110 L53-100", INK, 1.6);

		g += `<path d="M-20-114 C-34-114 -44-122 -52-130" fill="none" stroke="${INK}" stroke-width="20" stroke-linecap="round"/><path d="M-20-114 C-34-114 -44-122 -52-130" fill="none" stroke="${NC.robe}" stroke-width="11.5" stroke-linecap="round"/>`;
		g += `<path d="M-48-120 L-64-116 L-56-138 Z" fill="${NC.lt}" ${o(3)}/>`;
		g += `<circle cx="-62" cy="-150" r="22" fill="${NC.magic}" opacity=".25"/><circle cx="-62" cy="-150" r="11" fill="${NC.magic}" ${o(2.4)}/><circle cx="-65" cy="-153" r="4" fill="#efffe6"/>`;
		g += `<path d="M-80-160 C-86-146 -76-132 -62-134 M-44-142 C-40-156 -50-170 -64-168" fill="none" stroke="${NC.magic}" stroke-width="3" stroke-linecap="round" opacity=".85"/>`;
		g +=
			`<ellipse cx="-58" cy="-134" rx="7.5" ry="6.5" fill="${NC.skin}" ${o(2.8)}/>` +
			line("M-62-138 L-64-145 M-58-140 L-58-147 M-54-138 L-52-145", INK, 2.2);
		g += T(0, -146) + necroHead(0.95) + "</g>";
		return g + "</g>";
	}

	const VP = {
		skin: "#ebe3ec",
		sh: "#c5b6cf",
		hair: "#2a2230",
		cape: "#2b2133",
		lin: "#a3212e",
		suit: "#3b2f46",
		vest: "#6c1e2b",
		gold: "#e8c35a",
	};
	const vampCollar = (k = 1) =>
		`<path d="M-14 22 L${-50 * k}${-30 * k} L-36-6 L-30 26 Z M14 22 L${50 * k}${-30 * k} L36-6 L30 26 Z" fill="${VP.cape}" ${o()}/><path d="M-16 20 L${-42 * k}${-18 * k} L-30 22 Z M16 20 L${42 * k}${-18 * k} L30 22 Z" fill="${VP.lin}"/>`;
	function vampHead(s = 1) {
		let g = `<g transform="scale(${s})">`;
		g += `<path d="M-27-6 L-46-22 L-30 12 Z M27-6 L46-22 L30 12 Z" fill="${VP.skin}" ${o()}/><path d="M-30-6 L-40-14 L-31 4 Z M30-6 L40-14 L31 4 Z" fill="${VP.sh}"/>`;
		g += `<path d="M0-32 C20-32 30-20 30-2 C30 16 18 32 0 34 C-18 32 -30 16 -30-2 C-30-20 -20-32 0-32 Z" fill="${VP.skin}" ${o()}/>`;
		g += `<path d="M20-20 C28-8 28 8 22 20 C18 26 12 30 6 33 C20 18 24 0 20-20 Z" fill="${VP.sh}"/>`;
		g += `<path d="M-32-2 C-38-30 -18-46 0-44 C18-46 38-30 32-2 C28-14 24-20 16-23 L0-8 L-16-23 C-24-20 -28-14 -32-2 Z" fill="${VP.hair}" ${o()}/>`;
		g +=
			shine("M-24-24 C-18-34 -8-39 0-40", "rgba(255,255,255,.4)", 3) +
			shine("M10-38 C16-36 20-34 24-30", "rgba(255,255,255,.25)", 2.4);
		g += eye(-11, 1, 6, "#e8313d", 0, true) + eye(11, 1, 6, "#e8313d", 0, true);
		g += `<path d="M-20-9 L-4-5 M20-9 L4-5" stroke="${INK}" stroke-width="2.8" stroke-linecap="round"/>`;
		g += `<path d="M-19 8 Q-14 11 -8 9 M19 8 Q14 11 8 9" fill="none" stroke="${VP.sh}" stroke-width="2" stroke-linecap="round"/>`;
		g += `<path d="M0 4 L-2 11 L2 11" fill="none" ${o(1.8)}/>`;
		g += `<path d="M-11 18 Q0 22 12 15" fill="none" ${o(2.4)}/><path d="M-6 19.5 L-4.5 26 L-2.5 20.5 Z M6 18.5 L4.8 25 L3 19.8 Z" fill="#fff" ${o(1.4)}/>`;
		return g + "</g>";
	}
	function vampire() {
		let g = shadow(150, 220, 72) + T(150, 216, 1.0);

		g += `<path d="M-14-124 C-50-122 -88-104 -100-72 L-86-76 L-90-50 L-74-60 L-74-30 L-58-44 L-46-2 L46-2 L58-44 L74-30 L74-60 L90-50 L86-76 L100-72 C88-104 50-122 14-124 Z" fill="${VP.cape}" ${o()}/>`;
		g += `<path d="M-12-114 C-44-110 -72-96 -80-80 L-70-80 L-72-60 L-60-66 L-58-42 L-46-50 L-38-8 L38-8 L46-50 L58-42 L60-66 L72-60 L70-80 L80-80 C72-96 44-110 12-114 Z" fill="${VP.lin}"/>`;
		g += `<path d="M-60-104 C-54-88 -50-70 -46-50 M60-104 C54-88 50-70 46-50" fill="none" stroke="${dk(VP.lin, 0.3)}" stroke-width="2.6" stroke-linecap="round"/>`;

		for (const sx of [-1, 1])
			g +=
				`<path d="M${sx * 4}-44 L${sx * 6}-12 L${sx * 4} 2 L${sx * 24} 2 Q${sx * 26}-4 ${sx * 20}-10 L${sx * 20}-44 Z" fill="#241c2a" ${o()}/>` +
				shine(`M${sx * 7}-8 L${sx * 18}-8`, "rgba(255,255,255,.3)", 2);

		g += `<path d="M-26-118 C-32-92 -32-62 -28-38 L28-38 C32-62 32-92 26-118 C14-124 -14-124 -26-118 Z" fill="${VP.suit}" ${o()}/>`;
		g +=
			`<path d="M-12-118 L12-118 L10-46 L0-38 L-10-46 Z" fill="${VP.vest}" ${o(3)}/>` +
			[-96, -82, -68, -54]
				.map(
					(y) => `<circle cx="0" cy="${y}" r="2" fill="${VP.gold}" ${o(1.2)}/>`,
				)
				.join("");
		g += `<path d="M-26-118 L-12-118 L-4-70 L-26-50 Z M26-118 L12-118 L4-70 L26-50 Z" fill="${dk(VP.suit, 0.2)}" ${o(3)}/>`;
		g += `<path d="M-8-120 C-14-112 -8-106 -12-100 C-6-98 -6-94 0-92 C6-94 6-98 12-100 C8-106 14-112 8-120 Z" fill="#f4eef0" ${o(2.6)}/>`;
		g +=
			line("M-12-112 Q0-80 12-112", VP.gold, 1.8) +
			`<circle cx="0" cy="-86" r="7" fill="${VP.gold}" ${o(2.6)}/><circle cx="0" cy="-86" r="3.2" fill="#c81f2e"/><circle cx="-1" cy="-87.5" r="1" fill="#fff"/>`;

		for (const sx of [-1, 1]) {
			g += `<path d="M${sx * 24}-114 C${sx * 44}-114 ${sx * 60}-106 ${sx * 72}-100" fill="none" stroke="${INK}" stroke-width="17" stroke-linecap="round"/><path d="M${sx * 24}-114 C${sx * 44}-114 ${sx * 60}-106 ${sx * 72}-100" fill="none" stroke="${VP.suit}" stroke-width="8.5" stroke-linecap="round"/>`;
			g += `<path d="M${sx * 66}-104 L${sx * 70}-94 L${sx * 64}-96 Z" fill="#f4eef0" ${o(2)}/>`;
			g +=
				`<ellipse cx="${sx * 76}" cy="-100" rx="7" ry="6.5" fill="${VP.skin}" ${o(2.6)}/>` +
				line(
					`M${sx * 80}-104 l${sx * 4}-4 M${sx * 82}-100 l${sx * 5}-2`,
					INK,
					1.8,
				);
		}
		g += T(0, -146) + vampCollar() + vampHead(0.95) + "</g>";

		g +=
			T(-70, -168, 0.32) +
			batWing(-1) +
			batWing(1) +
			batHead(0.8) +
			"</g>" +
			T(76, -150, 0.26) +
			batWing(-1) +
			batWing(1) +
			batHead(0.8) +
			"</g>";
		return g + "</g>";
	}

	const BN = {
		c: "#cfd1f3",
		dk: "#9ea2d8",
		hair: "#f3f4ff",
		hdk: "#c3c7ec",
		skin: "#e9eaff",
		glow: "#d9ccff",
	};
	function banHair() {
		return (
			`<path d="M0-40 C-30-42 -46-20 -44 10 C-42 30 -54 46 -66 54 C-48 56 -36 46 -30 34 C-32 48 -40 58 -46 66 C-30 62 -22 48 -20 34 L20 34 C22 48 30 62 46 66 C40 58 32 48 30 34 C36 46 48 56 66 54 C54 46 42 30 44 10 C46-20 30-42 0-40 Z" fill="${BN.hair}" ${o()}/>` +
			`<path d="M-38 0 C-38 20 -44 36 -54 48 M38 0 C38 20 44 36 54 48 M-30 20 C-30 34 -34 46 -38 56 M30 20 C30 34 34 46 38 56" fill="none" stroke="${BN.hdk}" stroke-width="2.6" stroke-linecap="round"/>`
		);
	}
	const banHairShort = () =>
		`<path d="M0-40 C-30-42 -44-20 -42 6 C-41 18 -38 26 -32 32 L-20 28 L-12 30 L12 30 L20 28 L32 32 C38 26 41 18 42 6 C44-20 30-42 0-40 Z" fill="${BN.hair}" ${o()}/>` +
		`<path d="M-36 0 C-36 12 -34 20 -30 26 M36 0 C36 12 34 20 30 26" fill="none" stroke="${BN.hdk}" stroke-width="2.6" stroke-linecap="round"/>`;
	const banHairFace = () =>
		`<path d="M0-38 C-26-40 -36-20 -35 2 C-35 14 -30 22 -22 28 L-14 24 L14 24 L22 28 C30 22 35 14 35 2 C36-20 26-40 0-38 Z" fill="#9c95d6" ${o()}/>` +
		`<path d="M-30-4 C-30 8 -27 16 -22 22 M30-4 C30 8 27 16 22 22" fill="none" stroke="#6f68ad" stroke-width="2.6" stroke-linecap="round"/>`;
	function banFace(open = true, fr = BN.hair) {
		let g = `<path d="M0-28 C17-28 25-16 25 0 C25 16 14 28 0 30 C-14 28 -25 16 -25 0 C-25-16 -17-28 0-28 Z" fill="${BN.skin}" ${o()}/>`;
		g += `<path d="M16-20 C24-10 25 6 20 16 C16 23 10 27 5 29 C16 16 20 0 16-20 Z" fill="${BN.c}"/>`;
		g += `<ellipse cx="-10" cy="-4" rx="7.5" ry="9" fill="${INK}"/><ellipse cx="10" cy="-4" rx="7.5" ry="9" fill="${INK}"/>`;
		g += glowEye(-10, -3, 3.2, "#f6f0ff") + glowEye(10, -3, 3.2, "#f6f0ff");
		g += `<path d="M-18-16 Q-12-12 -4-14 M18-16 Q12-12 4-14" fill="none" ${o(2.4)}/>`;
		g += `<path d="M-10 6 C-11 12 -10 16 -9 20 M10 6 C11 12 10 16 9 20" fill="none" stroke="${BN.dk}" stroke-width="2" stroke-linecap="round"/>`;
		g += open
			? `<ellipse cx="0" cy="15" rx="7" ry="10" fill="${INK}"/><ellipse cx="0" cy="20" rx="4" ry="3.4" fill="#7a5aa8"/>`
			: `<path d="M-5 16 Q0 13 5 16" fill="none" ${o(2)}/>`;

		g += `<path d="M0-30 C-14-32 -26-22 -27-6 C-22-14 -14-20 -4-20 L0-24 L4-20 C14-20 22-14 27-6 C26-22 14-32 0-30 Z" fill="${fr}" ${o(3)}/>`;
		g += shine("M-18-22 C-12-27 -6-28 -2-28", "rgba(150,155,210,.7)", 2.4);
		return g;
	}
	const wail = (x, y, sx, s = 1) =>
		[0, 1, 2]
			.map(
				(i) =>
					`<path d="M${x + sx * (6 + i * 9) * s} ${y - (10 + i * 6) * s} Q${x + sx * (12 + i * 11) * s} ${y} ${x + sx * (6 + i * 9) * s} ${y + (10 + i * 6) * s}" fill="none" stroke="#9d86e0" stroke-width="${3.4 - i * 0.6}" stroke-linecap="round" opacity="${0.9 - i * 0.22}"/>`,
			)
			.join("");
	function banshee() {
		let g = shadow(150, 222, 34) + T(150, 140, 1.0);
		g += `<circle cx="0" cy="-34" r="76" fill="${BN.glow}" opacity=".3"/>`;
		g += T(0, -58) + banHair() + "</g>";

		g += `<path d="M-16-36 C-30-10 -38 20 -44 48 Q-34 40 -28 56 Q-18 42 -10 62 Q0 46 8 64 Q16 44 26 58 Q34 40 46 50 C40 20 32-10 16-36 Z" fill="${BN.c}" ${o()}/>`;
		g += `<path d="M10-32 C24-6 32 22 38 46 C34 44 30 46 28 50 C26 20 20-6 6-30 Z" fill="${BN.dk}"/>`;
		g += `<path d="M-20-2 C-6 4 6 4 20-2" fill="none" stroke="${BN.dk}" stroke-width="2.6" stroke-linecap="round"/>`;

		for (const sx of [-1, 1]) {
			g += `<path d="M${sx * 14}-34 C${sx * 30}-30 ${sx * 40}-44 ${sx * 36}-64" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="M${sx * 14}-34 C${sx * 30}-30 ${sx * 40}-44 ${sx * 36}-64" fill="none" stroke="${BN.skin}" stroke-width="5" stroke-linecap="round"/>`;
			g += `<path d="M${sx * 18}-30 C${sx * 30}-24 ${sx * 44}-26 ${sx * 52}-18 C${sx * 42}-36 ${sx * 34}-38 ${sx * 26}-40 Z" fill="${BN.c}" ${o(3)}/>`;
			g += `<path d="M${sx * 36}-62 L${sx * 30}-78 M${sx * 37}-64 L${sx * 36}-81 M${sx * 38}-64 L${sx * 42}-79" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="M${sx * 36}-62 L${sx * 30}-78 M${sx * 37}-64 L${sx * 36}-81 M${sx * 38}-64 L${sx * 42}-79" fill="none" stroke="${BN.skin}" stroke-width="2.2" stroke-linecap="round"/>`;
		}
		g += T(0, -64) + banFace(true) + "</g>";
		g += wail(-52, -64, -1) + wail(52, -64, 1);
		return g + "</g>";
	}

	const LC = {
		robe: "#3b2c52",
		dk: "#251b36",
		lt: "#5c4a7a",
		gold: "#e2b84a",
		gdk: "#a87e2a",
		soul: "#7ff0e6",
		bone: "#e3d8bf",
	};
	function lichCrown() {
		let g = `<path d="M-33-18 L-38-56 L-24-38 L-13-64 L0-42 L13-64 L24-38 L38-56 L33-18 Z" fill="${LC.gold}" ${o()}/>`;
		g += `<path d="M24-38 L38-56 L33-18 L24-18 Z" fill="${LC.gdk}"/>`;
		g += `<path d="M-35-28 C-12-34 12-34 35-28 L34-16 C12-22 -12-22 -34-16 Z" fill="${LC.gdk}" ${o(3)}/>`;
		g += `<path d="M0-38 L6-28 L0-20 L-6-28 Z" fill="#d6283a" ${o(2)}/><circle cx="-1.5" cy="-30" r="1.4" fill="#fff"/>`;
		g += `<circle cx="-20" cy="-25" r="3.2" fill="${LC.soul}" ${o(1.6)}/><circle cx="20" cy="-25" r="3.2" fill="${LC.soul}" ${o(1.6)}/>`;
		g += [
			[-38, -56],
			[-13, -64],
			[13, -64],
			[38, -56],
		]
			.map(
				([x, y]) =>
					`<circle cx="${x}" cy="${y}" r="3.4" fill="${LC.gold}" ${o(2)}/>`,
			)
			.join("");
		g += shine("M-30-24 C-20-28 -10-29 -2-29", "rgba(255,255,255,.6)", 2.4);
		return g;
	}
	const lichCollar = (k = 1) =>
		`<path d="M-28 22 L${-60 * k} 2 L${-50 * k} 16 L${-64 * k} 22 L-40 32 Z M28 22 L${60 * k} 2 L${50 * k} 16 L${64 * k} 22 L40 32 Z" fill="${LC.dk}" ${o()}/><path d="M-32 22 L-52 10 L-42 26 Z M32 22 L52 10 L42 26 Z" fill="${LC.lt}"/>`;
	function lichHead(s = 1, k = 1) {
		return (
			`<g transform="scale(${s})">` +
			lichCollar(k) +
			skull(0, 0, 1, { c: LC.bone, glow: LC.soul, flame: true, angry: true }) +
			lichCrown() +
			"</g>"
		);
	}
	const wisp = (x, y, s, r = 0) =>
		T(x, y, s, r) +
		`<path d="M0 0 C-10-6 -8-20 4-22 C-2-16 2-10 8-12 C14-14 12-26 4-30 C18-28 22-10 10-2 C6 1 2 2 0 0 Z" fill="${LC.soul}" opacity=".7" ${o(2)}/></g>`;
	function lich() {
		let g = shadow(150, 222, 78) + T(150, 218, 0.84);
		g += `<circle cx="0" cy="-110" r="104" fill="${LC.soul}" opacity=".14"/>`;
		g +=
			wisp(-92, -150, 1) + wisp(96, -60, 0.9, 30) + wisp(-100, -40, 0.8, -20);

		g += `<path d="M-40-150 C-70-110 -84-50 -86 0 L-72-10 L-64 4 L-50-8 L50-8 L64 4 L72-10 L86 0 C84-50 70-110 40-150 Z" fill="${LC.dk}" ${o()}/>`;

		g +=
			stick("M78 6 L74-186", 7, "#4a3a5a") +
			`<path d="M70-120 H82 M70-60 H82" stroke="${LC.gold}" stroke-width="4"/>`;
		g += `<path d="M74-186 C60-190 58-208 64-222 M74-186 C88-190 90-208 84-222" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M74-186 C60-190 58-208 64-222 M74-186 C88-190 90-208 84-222" fill="none" stroke="${LC.gold}" stroke-width="4.5" stroke-linecap="round"/>`;
		g += `<circle cx="74" cy="-206" r="26" fill="${LC.soul}" opacity=".3"/><circle cx="74" cy="-206" r="14" fill="${LC.soul}" ${o(3)}/><circle cx="69" cy="-211" r="5" fill="#effffd"/><path d="M68-200 Q74-196 80-202" fill="none" stroke="#3fb8b0" stroke-width="2" stroke-linecap="round"/>`;

		g += `<path d="M-30-150 C-46-110 -56-50 -60 0 L60 0 C56-50 46-110 30-150 Z" fill="${LC.robe}" ${o()}/>`;
		g += `<path d="M34-142 C44-100 52-50 54-4 L46-4 C44-50 38-100 28-146 Z" fill="${LC.dk}"/>`;
		g +=
			`<path d="M-60 0 L60 0 L59-12 L-59-12 Z" fill="${LC.gold}" ${o(3)}/>` +
			[-44, -24, 0, 24, 44]
				.map(
					(x) =>
						`<path d="M${x - 4}-6 L${x} -10 L${x + 4}-6 L${x}-2 Z" fill="${LC.gdk}"/>`,
				)
				.join("");
		g +=
			`<path d="M-12-96 L12-96 L18-12 L-18-12 Z" fill="${LC.dk}" ${o(3)}/>` +
			line(
				"M0-84 V-74 M-4-66 L4-58 M4-66 L-4-58 M0-48 L-4-40 L4-40 Z M0-30 V-20",
				LC.soul,
				2.2,
			);

		g += `<path d="M-22-146 L22-146 L10-104 L-10-104 Z" fill="#1a1222" ${o(3)}/>`;
		for (const y of [-138, -128, -118])
			g += `<path d="M-14 ${y} Q-6 ${y + 4} -2 ${y + 1} M14 ${y} Q6 ${y + 4} 2 ${y + 1}" fill="none" stroke="${LC.bone}" stroke-width="3.4" stroke-linecap="round"/>`;
		g += `<path d="M-1-146 V-108" stroke="${LC.bone}" stroke-width="3"/><circle cx="0" cy="-124" r="4" fill="${LC.soul}" opacity=".9"/>`;

		g += `<path d="M-48-104 C-16-96 16-96 48-104 L48-92 C16-84 -16-84 -48-92 Z" fill="${LC.gold}" ${o(3)}/>`;
		g += skull(0, -94, 0.3, { c: LC.bone, glow: LC.soul });

		g += `<path d="M30-142 C48-136 62-124 72-118" fill="none" stroke="${INK}" stroke-width="24" stroke-linecap="round"/><path d="M30-142 C48-136 62-124 72-118" fill="none" stroke="${LC.robe}" stroke-width="15.5" stroke-linecap="round"/>`;
		g +=
			`<path d="M62-132 L84-112 L64-108 Z" fill="${LC.lt}" ${o(3)}/>` +
			bhand(76, -118, 180, LC.bone, 1.1);
		g += `<path d="M-30-142 C-48-140 -60-150 -68-162" fill="none" stroke="${INK}" stroke-width="24" stroke-linecap="round"/><path d="M-30-142 C-48-140 -60-150 -68-162" fill="none" stroke="${LC.robe}" stroke-width="15.5" stroke-linecap="round"/>`;
		g += `<path d="M-56-150 L-84-150 L-70-170 Z" fill="${LC.lt}" ${o(3)}/>`;
		g += `<path d="M-84-176 C-90-190 -80-198 -74-214 C-70-200 -58-192 -62-178 C-66-170 -80-168 -84-176 Z" fill="${LC.soul}" opacity=".85" ${o(2.2)}/><path d="M-78-178 C-80-186 -76-190 -74-198 C-72-190 -68-186 -70-178 Z" fill="#effffd"/>`;
		g += bhand(-72, -170, -90, LC.bone, 1.1);

		for (const sx of [-1, 1]) {
			g += `<path d="M${sx * 18}-150 C${sx * 26}-170 ${sx * 56}-172 ${sx * 64}-150 C${sx * 56}-140 ${sx * 34}-136 ${sx * 18}-140 Z" fill="${LC.lt}" ${o()}/>`;
			g += `<path d="M${sx * 22}-146 C${sx * 34}-150 ${sx * 50}-150 ${sx * 60}-148" fill="none" stroke="${LC.gold}" stroke-width="3"/>`;
			g += [
				[34, -166],
				[46, -168],
				[57, -162],
			]
				.map(
					([x, y], i) =>
						`<path d="M${sx * (x - 5)} ${y + 2} L${sx * (x + 2)} ${y - 16 + i * 2} L${sx * (x + 5)} ${y + 1} Z" fill="${LC.bone}" ${o(2.4)}/>`,
				)
				.join("");
		}
		g += T(0, -174) + lichHead(0.95) + "</g>";
		return g + "</g>";
	}

	LGMon.add("skeleton", {
		art: skeleton,
		face: () =>
			skull(64, 68, 1.2, { crack: true, missing: true, glow: "#a6f59a" }),
	});
	LGMon.add("bat", {
		art: bat,
		face: () => T(64, 72, 1.12) + batHead(1) + "</g>",
	});
	LGMon.add("marauder", {
		art: marauder,
		face: () => T(64, 70, 1.08) + marHead(1) + "</g>",
	});
	LGMon.add("skelwarrior", {
		art: skelwarrior,
		face: () =>
			T(64, 72, 1.08) +
			skull(0, 0, 1, { c: WB, glow: "#8fdcff", angry: true }) +
			helm() +
			"</g>",
	});
	LGMon.add("skelarcher", {
		art: skelarcher,
		face: () =>
			T(64, 72, 1.0) +
			hoodBack() +
			skull(0, 0, 1, { c: AB, glow: "#ffb24f" }) +
			hoodFront() +
			"</g>",
	});
	LGMon.add("ghoul", {
		art: ghoul,
		face: () => T(64, 68, 1.0) + ghoulHead(1) + "</g>",
	});
	LGMon.add("ghost", {
		art: ghost,
		face: () => T(62, 92, 0.72) + ghostFig(false) + "</g>",
	});
	LGMon.add("fallenknight", {
		art: fallenknight,
		face: () => T(64, 72, 1.08) + knightHelm(1, false) + "</g>",
	});
	LGMon.add("gargoyle", {
		art: gargoyle,
		face: () => T(64, 76, 1.0) + gargHead(1) + "</g>",
	});
	LGMon.add("necromancer", {
		art: necromancer,
		face: () => T(64, 72, 1.04) + necroHead(1) + "</g>",
	});
	LGMon.add("vampire", {
		art: vampire,
		face: () => T(64, 66, 1.08) + vampCollar(0.8) + vampHead(1) + "</g>",
	});
	LGMon.add("banshee", {
		art: banshee,
		face: () =>
			`<circle cx="64" cy="64" r="43" fill="#4b4180"/>` +
			T(64, 66, 1.22) +
			banHairFace() +
			banFace(true, "#9c95d6") +
			"</g>",
	});
	LGMon.add("lich", {
		art: lich,
		face: () => T(64, 78, 0.84) + lichHead(1, 0.78) + "</g>",
	});
})();

(() => {
	const { INK, SW, o, eye, glowEye, shadow, shine, dk, lt } = LGMon;
	const P = (d, f, w = SW) => `<path d="${d}" fill="${f}" ${o(w)}/>`;
	const F = (d, f) => `<path d="${d}" fill="${f}"/>`;
	const L = (d, c = INK, w = 2) =>
		`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
	const E = (x, y, rx, ry, f, w = SW) =>
		`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}" ${o(w)}/>`;
	const C = (x, y, r, f, w = SW) => E(x, y, r, r, f, w);
	const G = (x, y, s, inner, r = 0) =>
		`<g transform="translate(${x},${y})${r ? ` rotate(${r})` : ""}${s !== 1 ? ` scale(${s})` : ""}">${inner}</g>`;
	const MIR = (inner, cx = 150) =>
		`<g transform="translate(${2 * cx},0) scale(-1,1)">${inner}</g>`;
	const both = (fn) => fn(-1) + fn(1);

	const WATER = "#8fb8a4",
		WDK = "#6a9682";
	const pond = (x, y, rx, reeds = true) =>
		`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${rx * 0.2}" fill="${WATER}" ${o(3.5)}/>` +
		L(
			`M${x - rx * 0.6} ${y + 2} q${rx * 0.15} -4 ${rx * 0.3} 0 M${x + rx * 0.25} ${y + rx * 0.08} q${rx * 0.15} -4 ${rx * 0.3} 0`,
			"rgba(255,255,255,.6)",
			2.4,
		) +
		(reeds
			? both(
					(k) =>
						L(
							`M${x + k * rx * 0.86} ${y} q${k * -4} -30 ${k * 2} -52 M${x + k * rx * 0.94} ${y - 2} q${k * 4} -22 ${k * 10} -36`,
							INK,
							5,
						) +
						L(
							`M${x + k * rx * 0.86} ${y} q${k * -4} -30 ${k * 2} -52 M${x + k * rx * 0.94} ${y - 2} q${k * 4} -22 ${k * 10} -36`,
							"#6f9a4a",
							2.4,
						) +
						E(x + k * rx * 0.86 + k * 1.4, y - 50, 3.6, 9, "#7a5236", 2.6),
				)
			: "");

	const TOAD = {
		c: "#6f8f3a",
		dk: "#4f6a28",
		lt: "#93b356",
		belly: "#e0dc9c",
		wart: "#8aaa4a",
	};
	function toadBody(p = TOAD, legs = true) {
		let s = "";
		if (legs)
			s += both(
				(k) =>
					P(
						`M${k * 28} 8 C${k * 52} 2 ${k * 60} 22 ${k * 52} 30 L${k * 30} 30 Z`,
						p.c,
					) +
					E(k * 54, 30, 12, 5, p.c, 3.5) +
					L(`M${k * 48} 31 l${k * 2} 3 M${k * 56} 31 l${k * 2} 3`, INK, 1.6),
			);
		s += P(
			"M-42 22 C-46 -4 -28 -22 0 -22 C28 -22 46 -4 42 22 C34 32 -34 32 -42 22 Z",
			p.c,
		);
		s += F(
			"M-26 26 C-28 12 -16 4 0 4 C16 4 28 12 26 26 C18 31 -18 31 -26 26 Z",
			p.belly,
		);
		s += F("M-40 16 C-42 4 -38 -6 -30 -12 C-34 0 -34 12 -30 26 Z", p.dk);
		s += both(
			(k) =>
				C(k * 20, -20, 13, p.c) +
				eye(k * 20, -21, 8.6, "#eab23a") +
				L(`M${k * 10} -28 Q${k * 20} -36 ${k * 30} -28`, p.dk, 2.6),
		);
		s +=
			L("M-32 0 Q0 14 32 0", INK, 2.8) +
			L("M-34 -3 l3 4 M34 -3 l-3 4", INK, 2.4);
		s += `<circle cx="-4" cy="-6" r="1.5" fill="${INK}"/><circle cx="4" cy="-6" r="1.5" fill="${INK}"/>`;
		s +=
			E(-28, 8, 6, 3.6, "rgba(232,120,110,.45)", 0) +
			E(28, 8, 6, 3.6, "rgba(232,120,110,.45)", 0);
		for (const [x, y, r] of [
			[-30, -6, 3],
			[-14, -8, 2.2],
			[12, -6, 2.6],
			[32, -2, 3],
			[-36, 12, 2.4],
			[36, 14, 2.2],
			[0, -14, 2],
		])
			s += C(x, y, r, p.wart, 1.4);
		if (legs)
			s += both(
				(k) =>
					P(
						`M${k * 26} 14 C${k * 22} 20 ${k * 20} 26 ${k * 18} 29 L${k * 30} 30 C${k * 32} 24 ${k * 32} 18 ${k * 30} 12 Z`,
						p.c,
						3,
					) +
					E(k * 15, 30, 4, 3, p.c, 2.4) +
					E(k * 22, 31.5, 4, 3, p.c, 2.4) +
					E(k * 29, 31, 4, 3, p.c, 2.4),
			);
		s += shine("M-36 2 C-34 -6 -30 -10 -26 -12", "rgba(255,255,255,.4)");
		return s;
	}
	function toadArt() {
		let s = pond(150, 214, 96);
		s +=
			E(150, 214, 64, 13, "#5f9a4a", 3.5) +
			F("M150 214 L196 206 L200 214 Z", WATER);
		s += G(150, 178, 1.32, toadBody());
		return s;
	}
	LGMon.add("toad", {
		art: toadArt,
		face: () => G(64, 70, 0.98, toadBody(TOAD, false)),
	});

	const LEE = {
		c: "#5a4258",
		dk: "#3e2c3e",
		belly: "#8a6a82",
		spot: "#e0a84a",
		mouth: "#7a2a3a",
	};
	function leeFace(p = LEE) {
		let s =
			C(0, 0, 30, p.c) +
			F("M-28 8 C-22 26 22 26 28 8 C20 18 -20 18 -28 8 Z", p.dk);
		s += C(0, 6, 17, p.belly, 3) + C(0, 7, 11, p.mouth, 3);
		for (let i = 0; i < 10; i++) {
			const a = (i / 10) * Math.PI * 2,
				x = Math.cos(a) * 11,
				y = 7 + Math.sin(a) * 11,
				x2 = Math.cos(a) * 6.5,
				y2 = 7 + Math.sin(a) * 6.5,
				t = 0.25;
			s += F(
				`M${x + Math.cos(a + Math.PI / 2) * 2.4} ${y + Math.sin(a + Math.PI / 2) * 2.4} L${x2} ${y2} L${x - Math.cos(a + Math.PI / 2) * 2.4} ${y - Math.sin(a + Math.PI / 2) * 2.4} Z`,
				"#fff",
			);
		}
		s += C(0, 7, 3.6, "#3a1018", 0);
		s += eye(-12, -16, 5.4, "#f2c14e") + eye(12, -16, 5.4, "#f2c14e");
		s += shine("M-20 -16 C-16 -24 -8 -28 0 -28", "rgba(255,255,255,.4)");
		return s;
	}
	function leeArt() {
		const p = LEE,
			d = "M236 204 C204 216 172 214 152 200 C132 186 122 160 120 132";
		let s = shadow(170, 214, 80);
		s += `<path d="${d}" fill="none" stroke="${INK}" stroke-width="40" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${p.c}" stroke-width="31" stroke-linecap="round"/>`;
		s += `<path d="${d}" fill="none" stroke="${p.dk}" stroke-width="31" stroke-dasharray="3 10"/>`;
		s += `<path d="M236 210 C204 222 172 220 152 206" fill="none" stroke="${p.belly}" stroke-width="6" stroke-linecap="round"/>`;
		s += `<path d="${d}" fill="none" stroke="${p.spot}" stroke-width="5" stroke-linecap="round" stroke-dasharray="0.1 13" transform="translate(-3,-6)"/>`;
		s += G(120, 118, 1, leeFace(p), -8);
		return s;
	}
	LGMon.add("leech", { art: leeArt, face: () => G(64, 68, 1.32, leeFace()) });

	const MOS = {
		c: "#8a7060",
		dk: "#5e4a3e",
		belly: "#c84a4a",
		bdk: "#8a2a2a",
		eye: "#b0303a",
		wing: "rgba(205,232,255,.6)",
	};
	function mosHead(p = MOS, nose = 40, ant = 1) {
		let s = both(
			(k) =>
				L(
					`M${k * 6} -15 C${k * 12} ${-15 - 15 * ant} ${k * 20} ${-15 - 21 * ant} ${k * 28 * (0.4 + 0.6 * ant)} ${-15 - 23 * ant}`,
					INK,
					2.6,
				) +
				(ant > 0.8
					? L(
							`M${k * 10} -24 l${k * -5} -4 M${k * 14} -30 l${k * -4} -5 M${k * 18} -34 l${k * -2} -6 M${k * 10} -24 l${k * 5} 2 M${k * 15} -30 l${k * 5} 1 M${k * 20} -34 l${k * 5} 0`,
							INK,
							1.6,
						)
					: L(
							`M${k * 9} -21 l${k * -4} -3 M${k * 12} -25 l${k * -2} -4 M${k * 9} -21 l${k * 4} 1 M${k * 13} -25 l${k * 4} 0`,
							INK,
							1.6,
						)),
		);
		s +=
			L(`M0 12 L-3 ${12 + nose}`, INK, 5.5) +
			L(`M0 12 L-3 ${12 + nose}`, "#3a2a24", 2.2) +
			C(-3, 12 + nose, 1.6, INK, 0);
		s +=
			C(0, 0, 18, p.c) +
			F("M-16 6 C-10 16 10 16 16 6 C10 10 -10 10 -16 6 Z", p.dk);
		s += both(
			(k) =>
				E(k * 8.5, -2, 9, 10.5, p.eye, 2.6) +
				`<circle cx="${k * 8.5 - 3}" cy="-6" r="3" fill="#fff"/><circle cx="${k * 8.5 + 3}" cy="2" r="1.3" fill="#fff"/>` +
				L(
					`M${k * 4} -8 l${k * 3} 2 M${k * 8} 4 l${k * 4} -1`,
					"rgba(0,0,0,.25)",
					1.2,
				),
		);
		s += L("M-5 8 Q0 10 5 8", INK, 1.8);
		return s;
	}

	const mosLeg = (pts, p) => {
		const d = "M" + pts.map((q) => q.join(" ")).join(" L");
		return (
			L(d, INK, 5) +
			L(d, p.dk, 2.2) +
			pts
				.slice(1, -1)
				.map(([x, y]) => C(x, y, 2.4, p.c, 1.6))
				.join("")
		);
	};
	const mosWing = (rx, ry, p) =>
		E(0, -ry, rx, ry, p.wing, 3) +
		L(
			`M0 0 C${rx * 0.1} ${-ry * 0.8} ${rx * 0.2} ${-ry * 1.4} ${rx * 0.1} ${-ry * 1.9} M${rx * 0.05} ${-ry * 0.5} C${-rx * 0.4} ${-ry * 0.8} ${-rx * 0.6} ${-ry * 1.2} ${-rx * 0.5} ${-ry * 1.6} M${rx * 0.1} ${-ry * 0.9} C${rx * 0.5} ${-ry * 1.1} ${rx * 0.7} ${-ry * 1.4} ${rx * 0.5} ${-ry * 1.7} M${-rx * 0.3} ${-ry * 1.1} l${rx * 0.4} ${-ry * 0.2} M${rx * 0.15} ${-ry * 1.4} l${rx * 0.4} ${ry * 0.05}`,
			"rgba(60,80,110,.5)",
			1.6,
		) +
		L(
			`M${-rx * 0.6} ${-ry * 1.2} C${-rx * 0.5} ${-ry * 1.6} ${-rx * 0.2} ${-ry * 1.85} ${rx * 0.1} ${-ry * 1.9}`,
			"rgba(255,255,255,.7)",
			2,
		);
	function mosArt() {
		const p = MOS;
		let s = shadow(156, 214, 44);
		s +=
			G(164, 100, 1, mosWing(19, 44, p), 34) +
			G(150, 102, 1, mosWing(15, 36, p), -16);
		s +=
			mosLeg(
				[
					[144, 118],
					[124, 128],
					[112, 160],
					[100, 196],
				],
				p,
			) +
			mosLeg(
				[
					[150, 122],
					[140, 146],
					[146, 172],
					[138, 204],
				],
				p,
			) +
			mosLeg(
				[
					[158, 120],
					[176, 140],
					[190, 168],
					[206, 196],
				],
				p,
			);
		s +=
			mosLeg(
				[
					[146, 114],
					[118, 110],
					[100, 130],
					[86, 150],
				],
				p,
			) +
			mosLeg(
				[
					[160, 116],
					[190, 120],
					[212, 142],
					[226, 164],
				],
				p,
			);
		s += G(
			186,
			100,
			1,
			P("M-24 -9 C0 -18 36 -14 46 0 C36 14 0 18 -24 9 Z", p.belly) +
				L("M-6 -13 v26 M8 -14 v28 M22 -12 v24 M34 -8 v16", p.bdk, 2.4) +
				shine("M-12 -10 C4 -14 22 -13 34 -8", "rgba(255,255,255,.55)"),
			-24,
		);
		s +=
			C(150, 110, 17, p.c) +
			F("M138 116 C144 124 156 124 162 116 C156 120 144 120 138 116 Z", p.dk) +
			shine("M140 100 C144 96 150 95 156 96", "rgba(255,255,255,.4)");
		s += G(126, 104, 1.3, mosHead(p, 32), 18);
		return s;
	}
	LGMon.add("mosquito", {
		art: mosArt,
		face: () => G(64, 60, 1.52, mosHead(MOS, 18, 0.4)),
	});

	const DRO = {
		c: "#5f8a82",
		dk: "#456860",
		lt: "#86ada4",
		hair: "#2e4a3a",
		hlt: "#4e7050",
		glow: "#d8ff9a",
		rag: "#8a8670",
		rdk: "#66624e",
	};
	function droHead(p = DRO) {
		let s = "";
		s += both((k) =>
			P(
				`M${k * 23} -8 C${k * 28} 10 ${k * 26} 30 ${k * 20} 42 L${k * 15} 26 L${k * 11} 40 L${k * 7} 18 Z`,
				p.hair,
				3.5,
			),
		);
		s += P(
			"M0 -28 C16 -28 24 -16 24 0 C24 16 14 28 0 30 C-14 28 -24 16 -24 0 C-24 -16 -16 -28 0 -28 Z",
			p.c,
		);
		s += F(
			"M-22 8 C-18 22 -8 28 0 28 C8 28 18 22 22 8 C14 18 -14 18 -22 8 Z",
			p.dk,
		);
		s +=
			P(
				"M-23 -8 C-21 -26 -8 -33 4 -31 C15 -30 23 -22 24 -8 L18 -15 L14 -4 L8 -17 L2 -6 L-4 -19 L-10 -6 L-15 -17 Z",
				p.hair,
				3.5,
			) + L("M-6 -26 C0 -29 8 -28 12 -26", p.hlt, 2.4);
		s += both(
			(k) =>
				E(k * 10, 0, 8, 7, p.dk, 0) +
				glowEye(k * 10, 0, 4.6, p.glow) +
				L(
					`M${k * 19} 8 q${k * 3} 2 0 5 M${k * 19} 13 q${k * 3} 2 0 5`,
					p.dk,
					1.8,
				),
		);
		s += L("M-2 6 v3 M2 6 v3", INK, 1.8);
		s +=
			P("M-9 14 Q0 10 9 14 Q8 22 0 23 Q-8 22 -9 14 Z", "#203a30", 2.4) +
			F(
				"M-6 14 l1.2 3.4 l1.2 -3.6 Z M-1.2 13 l1.2 3.4 l1.2 -3.4 Z M3.6 13.6 l1.2 3.4 l1.2 -3 Z M-4 21.4 l1.2 -3 l1.2 3.2 Z M2 21.6 l1.2 -3.2 l1.2 3 Z",
				"#fff",
			);
		s += P("M-26 24 q2 5 0 7 q-2 -2 0 -7 Z", "#9fd0e0", 1.4);
		return s;
	}
	const claws = (x, y, dirs, p) => {
		const d = dirs.map(([dx, dy]) => `M${x} ${y} l${dx} ${dy}`).join(" ");
		return L(d, INK, 6) + L(d, p.c, 2.6) + C(x, y, 6.5, p.c, 3.2);
	};
	function droArt() {
		const p = DRO;
		let s =
			pond(150, 214, 92, false) +
			L("M196 208 q10 -4 20 0", "rgba(255,255,255,.6)", 2.4);

		s +=
			L("M162 176 L178 192 L182 210", INK, 15) +
			L("M162 176 L178 192 L182 210", p.dk, 9) +
			E(186, 211, 11, 4.5, p.dk, 3.2);
		s +=
			L("M140 176 L124 196 L114 210", INK, 15) +
			L("M140 176 L124 196 L114 210", p.c, 9) +
			E(110, 211, 12, 4.8, p.c, 3.2) +
			L("M102 212 l-3 3 M108 214 l-1 4", INK, 1.8);
		s += '<g transform="rotate(-8 150 180)">';

		{
			const d = "M176 132 C188 150 192 170 192 190";
			s +=
				L(d, INK, 17) +
				L(d, p.dk, 11.5) +
				claws(
					192,
					192,
					[
						[-6, 12],
						[0, 14],
						[6, 11],
						[10, 6],
					],
					{ c: p.dk },
				);
		}
		s += P("M120 186 C112 160 118 126 150 120 C182 126 188 160 180 186 Z", p.c);
		s += P(
			"M120 132 C130 124 170 124 180 132 L184 178 L176 172 L172 186 L164 176 L156 190 L150 178 L142 188 L136 174 L128 184 L122 172 L116 178 Z",
			p.rag,
		);
		s +=
			F("M140 146 l6 4 l-4 6 Z M166 160 l6 2 l-2 6 Z", p.c) +
			L("M128 140 L134 170 M170 136 L166 160", p.rdk, 2);
		s +=
			L(
				"M124 128 C130 146 128 162 134 176 M128 126 C140 140 140 152 146 160",
				"#4e7a3a",
				3,
			) + L("M176 128 C180 140 178 150 182 160", "#4e7a3a", 3);

		{
			const d = "M124 132 C106 126 94 112 86 96";
			s +=
				L(d, INK, 17) +
				L(d, p.c, 11.5) +
				claws(
					86,
					94,
					[
						[-12, -4],
						[-9, -11],
						[-2, -14],
						[5, -12],
					],
					p,
				);
		}
		s +=
			P(
				"M130 178 q2 6 0 8 q-2 -2 0 -8 Z M168 176 q2 6 0 8 q-2 -2 0 -8 Z",
				"#9fd0e0",
				1.4,
			) + P("M196 206 q2 5 0 7 q-2 -2 0 -7 Z", "#9fd0e0", 1.4);
		s += G(146, 100, 1.05, droHead(p), -14);
		s += "</g>";
		return s;
	}
	LGMon.add("drowner", { art: droArt, face: () => G(64, 64, 1.18, droHead()) });

	const KIK = {
		skin: "#a8b47a",
		sdk: "#7f8a56",
		hair: "#4e6a3a",
		hlt: "#6f8f4a",
		dress: "#6e5c48",
		ddk: "#4a3c2e",
		leg: "#d8b45a",
		twig: "#7a5236",
	};
	function kikHead(p = KIK) {
		let s = "";
		s += P(
			"M-31 12 C-42 -6 -36 -30 -17 -37 C-7 -45 9 -45 18 -37 C37 -30 42 -6 31 12 C27 4 23 0 19 -2 L-19 -2 C-23 0 -27 4 -31 12 Z",
			p.hair,
		);
		s += L(
			"M-26 -24 l-10 -10 M-32 -30 l-2 -6 M24 -30 l8 -12 M30 -38 l6 0",
			p.twig,
			2.6,
		);
		s += P(
			"M0 -21 C14 -21 20 -10 20 2 C20 14 12 22 0 22 C-12 22 -20 14 -20 2 C-20 -10 -14 -21 0 -21 Z",
			p.skin,
		);
		s += F(
			"M-18 10 C-14 18 -6 22 0 22 C6 22 14 18 18 10 C10 15 -10 15 -18 10 Z",
			p.sdk,
		);
		s +=
			P(
				"M-21 -2 C-21 -18 -8 -25 0 -25 C10 -25 21 -18 21 -2 L15 -9 L10 -3 L4 -12 L-2 -4 L-8 -12 L-13 -4 Z",
				p.hair,
				3.5,
			) + L("M-10 -20 C-4 -23 4 -23 8 -21", p.hlt, 2.4);
		s +=
			C(18, -24, 5, "#e8e0f0", 2.4) +
			`<circle cx="18" cy="-24" r="2" fill="#f2c14e"/>`;
		s +=
			both((k) => E(k * 8, 1, 7.4, 7, p.sdk, 0)) +
			eye(-8, 1, 5.6, "#e8e04a") +
			eye(8, 1, 5.6, "#e8e04a");
		s +=
			P("M-6 2 C-7 14 6 25 25 29 C19 18 11 8 7 2 Z", lt(p.skin, 0.15), 3.2) +
			C(9, 16, 2.8, p.sdk, 1.2) +
			L("M-2 8 C0 14 6 20 14 24", "rgba(255,255,255,.5)", 1.8);
		s +=
			L("M-12 14 Q-6 19 0 17", INK, 2.2) +
			F("M-7 16.6 l1.4 3 l1.6 -2.6 Z", "#fff");
		return s;
	}
	function kikArt() {
		const p = KIK;
		let s = shadow(150, 214, 46);
		s += both(
			(k) =>
				L(`M${150 + k * 6} 186 L${150 + k * 8} 208`, INK, 8) +
				L(`M${150 + k * 6} 186 L${150 + k * 8} 208`, p.leg, 4) +
				L(
					`M${150 + k * 8} 208 l${k * -7} 5 M${150 + k * 8} 208 l${k * 1} 7 M${150 + k * 8} 208 l${k * 9} 4 M${150 + k * 8} 208 l${k * 4} -6`,
					INK,
					3.2,
				),
		);
		s += P(
			"M128 192 L136 140 C140 130 160 130 164 140 L172 192 L164 185 L158 196 L150 187 L142 196 L136 185 Z",
			p.dress,
		);
		s +=
			F(
				"M136 140 C140 132 148 131 152 132 L144 192 L136 185 L130 190 Z",
				p.ddk,
			) + L("M138 160 q12 6 24 0 M136 174 q14 6 28 0", p.ddk, 2);
		s += P(
			"M134 142 Q140 132 150 138 Q160 132 166 142 Q150 148 134 142 Z",
			p.hair,
			2.6,
		);
		s +=
			L("M196 112 L182 196", INK, 7) +
			L("M196 112 L182 196", p.twig, 3.4) +
			E(192, 136, 7, 11, "#d9cbb0", 2.6) +
			L("M186 132 q6 -2 12 2 M186 140 q6 -2 12 2", "#a89a80", 1.4) +
			L("M192 126 C206 120 214 128 222 118", "#d9cbb0", 1.6);
		for (const k of [-1, 1]) {
			const d =
				k < 0
					? "M138 146 C126 156 120 168 118 178"
					: "M162 146 C174 144 182 138 190 134";
			s += L(d, INK, 8) + L(d, p.skin, 4.4);
		}
		s += C(118, 180, 5, p.skin, 2.6) + C(190, 133, 5, p.skin, 2.6);
		s += G(150, 112, 1.12, kikHead(p));
		return s;
	}
	LGMon.add("kikimora", {
		art: kikArt,
		face: () => G(64, 70, 1.12, kikHead()),
	});

	const LIZ = {
		c: "#4f9a6a",
		dk: "#356e4a",
		lt: "#7cc090",
		belly: "#e2d894",
		bdk: "#bfb46a",
		fin: "#e0703a",
		fdk: "#a84a24",
		wood: "#8a6440",
		bone: "#efe4c8",
	};
	function lizHead(p = LIZ) {
		let s = "";
		s +=
			P(
				"M-12 -20 L-16 -36 L-6 -30 L0 -46 L6 -30 L16 -36 L12 -20 Z",
				p.fin,
				3.5,
			) + L("M-6 -24 L-9 -32 M0 -24 V-38 M6 -24 L9 -32", p.fdk, 1.8);
		s += both((k) =>
			P(
				`M${k * 20} -6 L${k * 34} -12 L${k * 28} -2 L${k * 34} 6 L${k * 20} 4 Z`,
				p.fin,
				3,
			),
		);
		s += P(
			"M0 -26 C14 -26 22 -16 22 -4 C22 4 18 8 14 10 L-14 10 C-18 8 -22 4 -22 -4 C-22 -16 -14 -26 0 -26 Z",
			p.c,
		);
		s += P("M-14 2 C-14 -4 14 -4 14 2 L12 20 C8 27 -8 27 -12 20 Z", p.c);
		s +=
			F("M-12.4 14 L12.4 14 L11.4 20 C8 25 -8 25 -11.4 20 Z", p.belly) +
			L("M-13 14 L13 14", INK, 2.4) +
			F("M-9 14 l1.4 3 l1.4 -3 Z M7 14 l1.4 3 l1.4 -3 Z", "#fff");
		s += `<circle cx="-4" cy="4" r="1.5" fill="${INK}"/><circle cx="4" cy="4" r="1.5" fill="${INK}"/>`;
		s += F(
			"M-8 -20 l3 0 l-1 3 Z M4 -18 l3 1 l-2 2 Z M-16 -12 l3 1 l-2 2 Z",
			p.dk,
		);
		s +=
			eye(-12, -8, 6, "#f2d34a", 0, true) + eye(12, -8, 6, "#f2d34a", 0, true);
		s += L("M-12 -20 C-6 -24 2 -24 6 -23", "rgba(255,255,255,.45)", 3);
		return s;
	}
	function lizArt() {
		const p = LIZ;
		let s = shadow(150, 214, 64);
		s +=
			P(
				"M164 186 C196 196 222 186 228 164 C232 152 226 144 220 148 C222 160 210 176 170 176 Z",
				p.c,
			) + L("M196 186 l2 -5 M212 180 l3 -5", p.dk, 2);
		s +=
			L("M208 50 L208 212", INK, 9) +
			L("M208 50 L208 212", p.wood, 4.4) +
			P("M202 50 L208 26 L214 50 Z", p.bone, 3) +
			L("M204 54 l8 6 M204 60 l8 -6", "#a84a24", 2) +
			P(
				"M212 58 C220 62 222 70 218 74 C216 68 214 64 210 62 Z",
				"#e0703a",
				2.2,
			);
		s += both((k) => {
			const d = `M${150 + k * 12} 176 L${150 + k * 20} 196 L${150 + k * 14} 210`;
			return (
				L(d, INK, 16) +
				L(d, p.c, 10) +
				E(150 + k * 17, 211, 11, 4.5, p.c, 3.2) +
				L(
					`M${150 + k * 9} 213 l${k * -3} 3 M${150 + k * 24} 213 l${k * 3} 3`,
					INK,
					1.8,
				)
			);
		});
		s += P("M124 182 C118 156 124 126 150 122 C176 126 182 156 176 182 Z", p.c);
		s +=
			F(
				"M136 180 C132 160 138 136 150 134 C162 136 168 160 164 180 Z",
				p.belly,
			) + L("M140 146 h20 M138 156 h24 M137 166 h26", p.bdk, 2);
		s +=
			P(
				"M128 172 L172 172 L168 194 L160 186 L150 196 L140 186 L132 194 Z",
				"#8a5a3a",
				3.5,
			) + L("M124 172 L176 172", "#5a3a24", 3);
		s +=
			P("M176 136 C190 146 198 150 206 148", p.c) +
			L("M174 136 C190 146 198 150 206 148", INK, 13) +
			L("M174 136 C190 146 198 150 206 148", p.c, 8) +
			C(208, 148, 7, p.c, 3.2);
		s +=
			L("M126 136 C116 146 112 156 112 164", INK, 13) +
			L("M126 136 C116 146 112 156 112 164", p.c, 8);
		s +=
			C(104, 156, 25, p.wood) +
			C(104, 156, 18, dk(p.wood, 0.15), 0) +
			L(
				"M104 142 C116 146 116 164 104 168 C94 166 94 152 104 152 C110 154 108 160 104 160",
				"#e0703a",
				3,
			) +
			C(104, 156, 25, "none", 4.5) +
			both((k) =>
				P(`M${104 + k * 22} 146 l${k * 8} -4 l${k * -4} 8 Z`, p.bone, 2),
			);
		s += G(150, 96, 1.05, lizHead(p));
		return s;
	}
	LGMon.add("lizardman", {
		art: lizArt,
		face: () => G(64, 70, 1.12, lizHead()),
	});

	const MUD = {
		c: "#6e5a3e",
		dk: "#4a3a26",
		lt: "#8e7856",
		moss: "#6f9a4a",
		glow: "#e8f060",
		lily: "#5f9a4a",
		cat: "#7a5236",
	};
	const drop = (x, y, r, c) =>
		P(
			`M${x} ${y - r * 2} C${x + r} ${y - r * 0.6} ${x + r} ${y + r * 0.8} ${x} ${y + r * 0.8} C${x - r} ${y + r * 0.8} ${x - r} ${y - r * 0.6} ${x} ${y - r * 2} Z`,
			c,
			2.4,
		);
	function mudHead(p = MUD, reeds = true) {
		let s = "";
		if (reeds)
			s += both(
				(k) =>
					L(`M${k * 10} -20 q${k * 4} -16 ${k * 12} -28`, INK, 5) +
					L(`M${k * 10} -20 q${k * 4} -16 ${k * 12} -28`, p.moss, 2.4) +
					E(k * 22 + k * 0.5, -48, 3.6, 8, p.cat, 2.4, k * 20),
			);
		s += P(
			"M-27 14 C-31 -6 -22 -27 0 -29 C22 -27 31 -6 27 14 C18 21 -18 21 -27 14 Z",
			p.c,
		);
		s +=
			F(
				"M-24 10 C-22 16 -12 19 0 19 C12 19 22 16 24 10 C14 14 -14 14 -24 10 Z",
				p.dk,
			) +
			drop(-20, 22, 3, p.c) +
			drop(16, 24, 3.4, p.c);
		s +=
			E(-4, -27, 15, 5.4, p.lily, 3) +
			F("M-4 -27 L8 -31 L10 -27 Z", p.c) +
			C(-10, -30, 3.4, "#f0a8c8", 1.8) +
			`<circle cx="-10" cy="-30" r="1.2" fill="#f2d34a"/>`;
		s += both(
			(k) => E(k * 10, -4, 8, 7, p.dk, 0) + glowEye(k * 10, -4, 5, p.glow),
		);
		s += P(
			"M-12 6 C-12 2 12 2 12 6 C12 14 6 18 0 18 C-6 18 -12 14 -12 6 Z",
			"#2a1e12",
			2.6,
		);
		s +=
			C(-18, -14, 2.4, p.lt, 0) +
			C(20, 2, 2, p.lt, 0) +
			C(14, -18, 1.8, p.lt, 0);
		return s;
	}
	function mudArm(p) {
		return (
			P(
				"M106 132 C84 140 72 164 74 190 C76 202 92 202 94 190 C94 172 100 158 114 150 Z",
				p.c,
			) +
			F("M78 186 C80 196 90 196 92 188 C88 192 82 192 78 186 Z", p.dk) +
			drop(84, 210, 3.4, p.c) +
			L("M78 196 l-2 6 M88 198 l1 6", INK, 2.4)
		);
	}
	function mudArt() {
		const p = MUD;
		let s = pond(150, 214, 100);
		s += P(
			"M98 214 C90 180 96 130 120 112 C136 100 164 100 180 112 C204 130 210 180 202 214 Z",
			p.c,
		);
		s +=
			F("M100 206 C96 180 98 150 110 128 C106 156 108 184 116 212 Z", p.dk) +
			F("M110 214 C120 204 180 204 192 214 Z", p.dk);
		s +=
			C(132, 150, 6, "#8a8478", 2.6) +
			C(172, 172, 5, "#8a8478", 2.6) +
			L("M156 142 l14 -4 M158 136 l4 10 M164 134 l4 10", "#e8dcc4", 2) +
			C(118, 180, 2.6, p.lt, 0) +
			C(184, 140, 3, p.lt, 0) +
			C(150, 186, 2.4, p.lt, 0);
		s += P(
			"M126 120 Q136 110 146 118 Q156 110 166 120 Q146 126 126 120 Z",
			p.moss,
			2.6,
		);
		s += mudArm(p) + MIR(mudArm(p));
		s += G(150, 96, 1.12, mudHead(p));
		return s;
	}
	LGMon.add("mudgolem", {
		art: mudArt,
		face: () => G(64, 70, 1.3, mudHead(MUD, false)),
	});

	const CRO = {
		c: "#5f7a3a",
		dk: "#3e5226",
		lt: "#7f9a52",
		bel: "#d8d0a0",
		moss: "#86ac4e",
		scar: "#c9d8a8",
	};
	const teeth = (pts) =>
		F(
			pts
				.map(([x, y, d]) => `M${x - 3} ${y} L${x} ${y + d} L${x + 3} ${y} Z`)
				.join(" "),
			"#fff",
		);
	function croFace(p = CRO) {
		let s = "";
		s += P(
			"M-28 -10 C-28 -26 28 -26 28 -10 L18 30 C14 39 -14 39 -18 30 Z",
			p.c,
		);
		s += F("M-26 -12 C-24 -2 -20 16 -16 30 C-20 26 -26 6 -27 -10 Z", p.dk);
		s += teeth([
			[-21, 6, 5],
			[-19, 14, 5],
			[-17, 22, 5],
			[21, 6, 5],
			[19, 14, 5],
			[17, 22, 5],
		]);
		s += L(
			"M-23 2 C-20 14 -18 26 -14 32 Q0 36 14 32 C18 26 20 14 23 2",
			INK,
			2.4,
		);
		s += both(
			(k) =>
				C(k * 5, 30, 3.4, p.lt, 2) +
				`<circle cx="${k * 5}" cy="30" r="1.2" fill="${INK}"/>`,
		);
		s += F("M-6 -6 l4 2 l-4 2 Z M4 2 l4 2 l-4 2 Z M-4 12 l4 2 l-4 2 Z", p.dk);
		s += both(
			(k) =>
				C(k * 17, -19, 11, p.c) +
				eye(k * 17, -19, 6.4, "#e8c35a", 0, true) +
				P(
					`M${k * 7} -24 Q${k * 17} -32 ${k * 27} -24 Q${k * 17} -27 ${k * 7} -24 Z`,
					p.dk,
					2.4,
				),
		);
		s +=
			L("M10 -8 L22 12", p.scar, 2.6) +
			P("M-10 -30 Q-4 -38 2 -31 Q8 -38 12 -30 Q0 -26 -10 -30 Z", p.moss, 2.4);
		return s;
	}
	function croArt() {
		const p = CRO;
		let s = pond(160, 214, 116, false);
		s +=
			P("M200 168 C230 166 256 158 278 136 C272 158 254 182 206 192 Z", p.c) +
			F("M214 188 C240 184 262 166 274 148 C266 172 248 186 206 192 Z", p.dk);
		for (let i = 0; i < 5; i++) {
			const x = 214 + i * 12,
				y = 166 - i * 5 - (i > 2 ? (i - 2) * 3 : 0);
			s += P(`M${x} ${y} l5 -9 l5 8 Z`, p.dk, 2.4);
		}
		s +=
			P("M186 182 L184 204 L198 204 L200 184 Z", p.dk, 3.5) +
			P("M122 182 L118 204 L132 204 L136 184 Z", p.dk, 3.5);
		s += P(
			"M110 150 C120 128 170 122 204 134 C224 142 224 180 204 190 C170 200 126 196 112 184 Z",
			p.c,
		);
		s += F(
			"M118 182 C140 194 186 196 206 188 C190 198 150 200 116 186 Z",
			p.bel,
		);
		for (let i = 0; i < 6; i++) {
			const x = 126 + i * 15,
				y = 134 - Math.sin(((i + 1) / 7) * Math.PI) * 6;
			s += P(`M${x} ${y} l6 -10 l6 10 Z`, i % 2 ? p.dk : p.lt, 2.6);
		}
		s +=
			P(
				"M140 128 Q150 116 162 126 Q172 118 180 130 Q160 134 140 128 Z",
				p.moss,
				2.6,
			) + L("M168 148 L190 160 M172 142 l-4 6", p.scar, 2.4);
		s +=
			P("M132 186 L128 208 Q128 213 136 213 L150 213 L148 188 Z", p.c, 3.5) +
			P("M194 186 L194 208 Q194 213 202 213 L214 213 L210 186 Z", p.c, 3.5) +
			L("M134 213 v4 M141 213 v4 M200 213 v4 M207 213 v4", "#fff", 2.4);
		s += P("M118 160 L58 168 C50 170 52 180 60 180 L120 186 Z", p.c);
		s +=
			F("M120 156 L56 146 L56 170 L120 174 Z", "#c86a6a") +
			E(80, 162, 16, 5, "#a84a52", 0);
		s +=
			teeth([
				[64, 150, 7],
				[76, 151, 7],
				[88, 153, 7],
				[100, 155, 6],
			]) +
			teeth([
				[66, 168, -7],
				[78, 169, -7],
				[90, 170, -7],
				[102, 172, -6],
			]);
		s += P("M122 152 L60 140 C50 140 46 148 52 152 L58 152 L122 162 Z", p.c);
		s +=
			C(56, 144, 4, p.lt, 2.4) +
			`<circle cx="55" cy="143" r="1.4" fill="${INK}"/>`;
		s +=
			C(110, 138, 10, p.c) +
			eye(110, 137, 6, "#e8c35a", -1.4, true) +
			P("M100 132 Q110 124 120 132 Q110 129 100 132 Z", p.dk, 2.4);
		s +=
			L("M86 144 L100 150", p.scar, 2.4) +
			shine("M70 142 C84 142 100 145 112 148", "rgba(255,255,255,.35)");
		return s;
	}
	LGMon.add("croc", { art: croArt, face: () => G(64, 68, 1.2, croFace()) });

	const HAG = {
		skin: "#9ab878",
		sdk: "#728f56",
		robe: "#4e3a5e",
		rdk: "#33263f",
		rlt: "#6e5a80",
		hair: "#c8c8bc",
		wood: "#6a4a30",
		lamp: "#b8f070",
		bone: "#efe4c8",
	};
	function hagHead(p = HAG) {
		let s = "";
		s += P(
			"M-30 22 C-35 -10 -22 -38 0 -42 C22 -38 35 -10 30 22 C20 12 -20 12 -30 22 Z",
			p.robe,
		);
		s += both((k) =>
			P(
				`M${k * 22} -6 C${k * 27} 10 ${k * 25} 26 ${k * 19} 36 L${k * 15} 20 L${k * 11} 32 L${k * 8} 10 Z`,
				p.hair,
				3,
			),
		);
		s += P(
			"M0 -24 C14 -24 20 -12 20 2 C20 16 12 26 0 28 C-12 26 -20 16 -20 2 C-20 -12 -14 -24 0 -24 Z",
			p.skin,
		);
		s +=
			P(
				"M-25 -4 C-25 -27 -12 -35 0 -35 C12 -35 25 -27 25 -4 C18 -18 10 -22 0 -22 C-10 -22 -18 -18 -25 -4 Z",
				p.robe,
				3.5,
			) + L("M-14 -30 C-8 -33 0 -34 6 -33", p.rlt, 2.6);
		s +=
			`<circle cx="-8" cy="-1" r="9" fill="#f2e04a" opacity=".3"/>` +
			eye(-8, -1, 6.4, "#f2e04a") +
			L("M-15 -9 L-2 -6", INK, 2.4);
		s += L("M4 0 Q9 -3 14 0", INK, 2.4) + L("M3 -6 L15 -4", INK, 2.4);
		s +=
			P(
				"M-5 -1 C-8 10 -3 19 12 21 C14 17 10 14 8 12 C7 7 6 3 5 -1 Z",
				lt(p.skin, 0.12),
				3.2,
			) +
			C(4, 11, 3, "#6a8a4a", 1.4) +
			L("M-2 3 C-3 9 -1 14 4 17", "rgba(255,255,255,.5)", 1.8);
		s +=
			L("M-12 21 Q-5 26 1 23", INK, 2.2) +
			F("M-7 23.4 l1.6 3.4 l1.6 -3 Z", "#f3ead2") +
			C(-9, 27, 1.6, "#6a8a4a", 1);
		return s;
	}
	function hagArt() {
		const p = HAG;
		let s = shadow(150, 216, 66);
		s +=
			L("M204 214 C200 170 210 120 204 70", INK, 10) +
			L("M204 214 C200 170 210 120 204 70", p.wood, 5) +
			L("M204 70 C204 54 218 50 224 60", INK, 9) +
			L("M204 70 C204 54 218 50 224 60", p.wood, 4.4);
		s +=
			L("M224 60 L224 76", INK, 2) +
			`<circle cx="224" cy="88" r="20" fill="${p.lamp}" opacity=".3"/>` +
			P(
				"M214 86 C214 76 234 76 234 86 C234 92 230 94 230 98 L218 98 C218 94 214 92 214 86 Z",
				p.bone,
				3,
			) +
			glowEye(219, 86, 3, p.lamp) +
			glowEye(229, 86, 3, p.lamp) +
			L("M220 98 v-3 M224 98 v-3 M228 98 v-3", INK, 1.4);
		s += P(
			"M112 214 C112 180 120 134 150 120 C180 134 188 180 188 214 L178 206 L170 214 L160 206 L150 214 L140 206 L130 214 L120 206 Z",
			p.robe,
		);
		s +=
			F(
				"M114 210 C114 180 120 148 136 128 C128 156 126 186 130 214 L120 206 Z",
				p.rdk,
			) +
			P("M160 180 h12 v12 h-12 Z", p.rlt, 2.4) +
			L("M162 182 l8 8 M170 182 l-8 8", p.rdk, 1.4);
		s +=
			P(
				"M120 168 C136 174 164 174 180 168 L180 174 C164 180 136 180 120 174 Z",
				"#8a7a5a",
				2.6,
			) +
			L("M134 176 l-2 14 M144 177 v12", "#8a7a5a", 2.4) +
			C(132, 192, 3.4, p.bone, 2) +
			E(144, 192, 3, 4, "#c86a3a", 2);
		s +=
			P(
				"M176 136 C190 142 198 140 202 132 L206 142 C196 152 186 152 172 148 Z",
				p.robe,
				3.5,
			) + C(204, 136, 6.4, p.skin, 3);
		s +=
			P(
				"M126 138 C112 148 104 160 100 170 L110 176 C114 164 122 156 132 150 Z",
				p.robe,
				3.5,
			) +
			C(100, 174, 6, p.skin, 3) +
			L("M96 170 l-6 -4 M98 178 l-7 0 M104 180 l-3 6", INK, 3) +
			L("M96 170 l-6 -4 M98 178 l-7 0 M104 180 l-3 6", p.skin, 1.4);
		s +=
			`<circle cx="86" cy="160" r="9" fill="${p.lamp}" opacity=".35"/>` +
			C(86, 160, 5, p.lamp, 2.4) +
			F(
				"M78 146 l2 4 l4 2 l-4 2 l-2 4 l-2 -4 l-4 -2 l4 -2 Z M96 142 l1.4 3 l3 1.4 l-3 1.4 l-1.4 3 l-1.4 -3 l-3 -1.4 l3 -1.4 Z",
				p.lamp,
			);
		s += G(150, 104, 1.05, hagHead(p), -4);
		return s;
	}
	LGMon.add("hag", { art: hagArt, face: () => G(64, 70, 1.1, hagHead()) });

	const HYD = {
		c: "#3f6a3a",
		dk: "#2c4c28",
		lt: "#5f8a4a",
		bel: "#c8c890",
		fin: "#c8a040",
		fdk: "#8a6a24",
		glow: "#ffe066",
		crown: "#e8c35a",
	};
	function hydHead(p = HYD, crown = false) {
		let s = "";
		s += both(
			(k) =>
				P(
					`M${k * 14} -8 L${k * 32} -18 L${k * 26} -4 L${k * 32} 4 L${k * 16} 4 Z`,
					p.fin,
					3,
				) + L(`M${k * 16} -4 L${k * 28} -12`, p.fdk, 1.6),
		);
		s += P(
			"M0 -22 C14 -22 22 -12 22 0 C22 10 16 18 0 22 C-16 18 -22 10 -22 0 C-22 -12 -14 -22 0 -22 Z",
			p.c,
		);
		if (crown)
			s +=
				P(
					"M-13 -18 L-15 -33 L-7 -25 L0 -38 L7 -25 L15 -33 L13 -18 Z",
					p.crown,
					3,
				) +
				C(0, -24, 2.6, "#c84a6a", 1.4) +
				`<circle cx="-15" cy="-33" r="2" fill="#fff"/><circle cx="15" cy="-33" r="2" fill="#fff"/>`;
		s += F(
			"M-20 -10 L-3 -4 L-3 -1 L-20 -5 Z M20 -10 L3 -4 L3 -1 L20 -5 Z",
			p.dk,
		);
		s +=
			`<circle cx="-10" cy="-3" r="8" fill="${p.glow}" opacity=".3"/><circle cx="10" cy="-3" r="8" fill="${p.glow}" opacity=".3"/>` +
			eye(-10, -3, 5, p.glow, 0, true) +
			eye(10, -3, 5, p.glow, 0, true);
		s +=
			P("M-11 7 Q0 4 11 7 Q9 20 0 22 Q-9 20 -11 7 Z", "#4a1418", 2.4) +
			F("M-8 7 l2 6 l2 -6.4 Z M4 6.4 l2 6.4 l2 -6 Z", "#fff") +
			L("M0 16 L0 28 M0 28 l-3 4 M0 28 l3 4", "#d84a5a", 2);
		s += `<circle cx="-4" cy="3" r="1.3" fill="${INK}"/><circle cx="4" cy="3" r="1.3" fill="${INK}"/>`;
		s += L("M-12 -17 C-6 -21 2 -21 6 -20", "rgba(255,255,255,.4)", 2.6);
		return s;
	}
	const neck = (d, p) =>
		`<path d="${d}" fill="none" stroke="${INK}" stroke-width="27" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${p.c}" stroke-width="19" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${p.dk}" stroke-width="19" stroke-dasharray="2 9"/>`;
	function hydArt() {
		const p = HYD;
		let s = pond(150, 214, 118, false);
		s +=
			P("M74 214 C78 172 116 150 150 150 C184 150 222 172 226 214 Z", p.c) +
			F("M78 210 C82 182 102 164 124 156 C106 172 98 192 96 214 Z", p.dk);
		for (const [x, y] of [
			[112, 166],
			[132, 156],
			[168, 156],
			[188, 166],
		])
			s += P(`M${x - 6} ${y + 2} l6 -12 l6 12 Z`, p.fin, 2.4);
		s +=
			neck("M118 186 C96 170 80 140 74 104", p) +
			neck("M182 186 C204 170 220 140 226 104", p) +
			neck("M150 180 C152 150 140 116 150 76", p);
		s +=
			F("M60 214 C60 200 240 200 240 214 Z", WATER) +
			L(
				"M76 206 q14 -5 28 0 M196 206 q14 -5 28 0 M136 208 q14 -5 28 0",
				"rgba(255,255,255,.6)",
				2.4,
			);
		s +=
			G(72, 96, 0.88, hydHead(p), -14) +
			G(228, 96, 0.88, hydHead(p), 14) +
			G(150, 64, 1.08, hydHead(p, true));
		return s;
	}
	LGMon.add("e_hydra", {
		art: hydArt,
		face: () =>
			G(34, 82, 0.62, hydHead(HYD), -16) +
			G(94, 82, 0.62, hydHead(HYD), 16) +
			G(64, 66, 1, hydHead(HYD, true)),
	});

	const WIS = {
		c: "#a8e060",
		dk: "#5f9a3a",
		lt: "#dcf7a0",
		core: "#fffbe0",
		glow: "#c8f070",
		eye: "#f2ff70",
	};
	function wisBody(p = WIS) {
		let s = `<circle cx="0" cy="2" r="44" fill="${p.glow}" opacity=".22"/><circle cx="0" cy="4" r="32" fill="${p.glow}" opacity=".28"/>`;

		s +=
			P("M-26 10 C-40 6 -44 -10 -40 -22 C-36 -12 -30 -8 -24 -8 Z", p.dk, 3) +
			P("M26 6 C40 4 46 -12 42 -26 C38 -16 32 -10 24 -10 Z", p.dk, 3);
		s += P(
			"M0 -46 C8 -32 30 -24 30 2 C30 20 18 30 8 32 C12 38 14 44 8 50 C4 42 0 40 -4 34 C-6 40 -10 44 -16 46 C-12 38 -12 34 -12 30 C-22 26 -30 16 -30 2 C-30 -16 -20 -22 -13 -32 C-11 -24 -7 -20 -3 -21 C-5 -29 -3 -38 0 -46 Z",
			p.c,
		);
		s += F("M24 -2 C26 14 18 26 6 28 C16 22 20 12 24 -2 Z", p.dk);
		s += F(
			"M0 -26 C6 -18 18 -12 18 2 C18 14 10 20 0 20 C-10 20 -18 14 -18 2 C-18 -8 -10 -14 -6 -20 C-4 -14 -2 -12 0 -12 C-2 -18 -2 -22 0 -26 Z",
			p.lt,
		);

		s += both(
			(k) =>
				P(`M${k * 16} -4 L${k * 4} 1 L${k * 5} 8 L${k * 14} 7 Z`, INK, 1.6) +
				`<circle cx="${k * 9.5}" cy="4" r="4.5" fill="${p.eye}" opacity=".45"/><circle cx="${k * 9.5}" cy="4" r="2" fill="${p.eye}"/>`,
		);
		s += P(
			"M-10 12 L-7 15 L-4 12.5 L-1 16 L2 12.5 L5 15 L8 12 L10 13 Q0 24 -10 13 Z",
			INK,
			1.4,
		);
		return s;
	}
	const spark = (x, y, r, c) =>
		F(
			`M${x} ${y - r} L${x + r * 0.3} ${y - r * 0.3} L${x + r} ${y} L${x + r * 0.3} ${y + r * 0.3} L${x} ${y + r} L${x - r * 0.3} ${y + r * 0.3} L${x - r} ${y} L${x - r * 0.3} ${y - r * 0.3} Z`,
			c,
		);
	function wisArt() {
		const p = WIS;
		let s = pond(150, 214, 78);
		s += `<ellipse cx="150" cy="214" rx="40" ry="7" fill="${p.glow}" opacity=".55"/>`;
		s += G(150, 118, 1.35, wisBody(p));
		s +=
			spark(96, 92, 7, p.lt) +
			spark(206, 80, 6, p.lt) +
			spark(210, 150, 5, p.c) +
			spark(92, 156, 5, p.c) +
			spark(118, 60, 4, p.lt);
		return s;
	}
	LGMon.add("swampwisp", { art: wisArt, face: () => G(64, 62, 1, wisBody()) });

	const VOD = {
		skin: "#5e8a6a",
		sdk: "#40664c",
		bel: "#c8d8a0",
		beard: "#3e6a3a",
		bdk: "#2a4a28",
		crown: "#e8c35a",
		cdk: "#b0862a",
		pearl: "#f4f0ff",
		cloak: "#2f5a6a",
		clk: "#1f4050",
		tri: "#c9a24a",
	};
	function vodHead(p = VOD, angry = false) {
		let s = "";
		s += both(
			(k) =>
				L(`M${k * 22} 8 C${k * 36} 12 ${k * 44} 22 ${k * 46} 36`, INK, 4.6) +
				L(`M${k * 22} 8 C${k * 36} 12 ${k * 44} 22 ${k * 46} 36`, p.sdk, 2),
		);
		s += P(
			"M0 -26 C24 -26 36 -14 36 4 C36 18 24 28 0 28 C-24 28 -36 18 -36 4 C-36 -14 -24 -26 0 -26 Z",
			p.skin,
		);
		s +=
			P(
				"M-26 14 C-30 30 -22 46 -10 52 L-6 40 L0 56 L6 40 L10 52 C22 46 30 30 26 14 C16 22 -16 22 -26 14 Z",
				p.beard,
			) +
			L(
				"M-14 26 C-14 36 -10 42 -8 46 M0 26 V46 M14 26 C14 36 10 42 8 46",
				p.bdk,
				2,
			);
		s +=
			P(
				"M-14 -24 L-17 -44 L-8 -35 L0 -50 L8 -35 L17 -44 L14 -24 Z",
				p.crown,
				3.2,
			) +
			P("M-15 -27 h30 v5 h-30 Z", p.cdk, 2.6) +
			C(0, -32, 3, "#4ab0d8", 1.6);
		s += [
			[-17, -44],
			[0, -50],
			[17, -44],
		]
			.map(([x, y]) => C(x, y, 2.6, p.pearl, 1.4))
			.join("");
		s += both(
			(k) =>
				C(k * 19, -20, 12, p.skin) +
				eye(k * 19, -21, 7.6, "#f2d34a") +
				P(
					`M${k * 8} -26 Q${k * 19} -36 ${k * 30} -26 Q${k * 19} -30 ${k * 8} -26 Z`,
					p.sdk,
					2.4,
				),
		);
		s +=
			L("M-28 8 Q0 20 28 8", INK, 3) + L("M-28 8 l-2 4 M28 8 l2 4", INK, 2.6);
		if (angry) s += L("M-30 -33 L-10 -28 M30 -33 L10 -28", INK, 3);
		s += `<circle cx="-4" cy="0" r="1.6" fill="${INK}"/><circle cx="4" cy="0" r="1.6" fill="${INK}"/>`;
		s +=
			C(-26, -6, 2, p.sdk, 0) +
			C(28, -4, 2.4, p.sdk, 0) +
			C(-20, 2, 1.6, p.sdk, 0);
		return s;
	}
	function vodCloak(p) {
		let s = P("M106 118 C80 146 70 192 82 206 L122 198 Z", p.cloak);
		s += L(
			"M88 150 q6 4 12 0 M84 166 q6 4 12 0 q6 4 12 0 M84 182 q6 4 12 0 q6 4 12 0 M96 134 q6 4 12 0",
			p.clk,
			2,
		);
		s +=
			E(84, 196, 9, 3.6, "#5f9a4a", 2.2) +
			P("M92 128 l-6 6 l8 0 Z", "#f0d8c0", 2);
		return s;
	}
	function vodArt() {
		const p = VOD;
		let s = pond(150, 218, 124, false);
		s += L(
			"M40 214 q8 -4 16 0 M244 214 q8 -4 16 0",
			"rgba(255,255,255,.6)",
			2.4,
		);

		s += G(
			52,
			196,
			1,
			P("M-10 0 C-4 -8 8 -8 12 0 C8 6 -4 6 -10 0 Z", "#d8a04a", 2.4) +
				P("M-10 0 L-18 -6 L-17 6 Z", "#d8a04a", 2.4) +
				`<circle cx="6" cy="-1" r="1.4" fill="${INK}"/>`,
			-30,
		);
		s +=
			C(66, 168, 3, "rgba(255,255,255,.7)", 1.6) +
			C(74, 156, 2, "rgba(255,255,255,.7)", 1.4) +
			C(256, 176, 2.6, "rgba(255,255,255,.7)", 1.6);

		s +=
			P("M88 214 L94 190 L206 188 L214 214 Z", "#6a5a46", 3.5) +
			L("M110 196 l6 14 M150 194 l-4 16 M186 196 l6 12", "#4a3e30", 2) +
			P(
				"M94 194 Q110 184 124 192 Q140 184 152 192 Q170 184 186 192 Q198 186 208 194 Z",
				"#6f9a4a",
				2.6,
			);
		s += vodCloak(p) + MIR(vodCloak(p));

		s += `<circle cx="232" cy="20" r="20" fill="#9fd0e0" opacity=".3"/>`;
		s +=
			L("M232 30 L232 186", INK, 10) +
			L("M232 30 L232 186", p.tri, 5) +
			L("M230 60 v100", "rgba(255,255,255,.45)", 1.6);
		s += P("M214 36 h36 v8 h-36 Z", p.tri, 3) + C(232, 40, 3.4, "#4ab0d8", 1.6);
		s +=
			P("M216 36 L214 12 L219 18 L222 36 Z", p.tri, 3) +
			P("M242 36 L245 18 L250 12 L248 36 Z", p.tri, 3) +
			P("M228 36 L232 2 L236 36 Z", p.tri, 3);
		s += P(
			"M206 16 q2 5 0 7 q-2 -2 0 -7 Z M258 24 q2 5 0 7 q-2 -2 0 -7 Z M250 4 q2 4 0 6 q-2 -2 0 -6 Z",
			"#9fd0e0",
			1.4,
		);

		s += P(
			"M98 192 C88 160 102 114 150 110 C198 114 212 160 202 192 C188 206 112 206 98 192 Z",
			p.skin,
		);
		s +=
			F("M118 196 C112 168 124 140 150 138 C176 140 188 168 182 196 Z", p.bel) +
			L("M128 176 q22 6 44 0 M126 188 q24 6 48 0", dk(p.bel, 0.15), 1.8);
		s +=
			F("M100 188 C94 164 98 136 112 120 C108 146 110 172 118 196 Z", p.sdk) +
			C(112, 150, 2.4, p.sdk, 0) +
			C(190, 160, 2.6, p.sdk, 0) +
			C(186, 176, 1.8, p.sdk, 0);

		s += [0, 1, 2, 3, 4, 5, 6, 7, 8]
			.map((i) =>
				C(
					118 + i * 8,
					154 + Math.sin((i / 8) * Math.PI) * 14,
					3.6,
					p.pearl,
					1.6,
				),
			)
			.join("");
		s +=
			P("M150 170 L140 180 C142 188 158 188 160 180 Z", "#f0c8b0", 2.6) +
			L("M150 172 v13 M145 175 l-2 9 M155 175 l2 9", "#c89a80", 1.4);

		s += both(
			(k) =>
				P(
					`M${150 + k * 26} 184 C${150 + k * 44} 180 ${150 + k * 52} 196 ${150 + k * 40} 200 L${150 + k * 18} 200 Z`,
					p.skin,
				) +
				P(
					`M${150 + k * 22} 198 L${150 + k * 14} 208 L${150 + k * 22} 204 L${150 + k * 26} 212 L${150 + k * 30} 204 L${150 + k * 38} 208 L${150 + k * 34} 198 Z`,
					p.skin,
					3,
				),
		);

		s +=
			L("M198 130 C214 122 224 104 230 82", INK, 16) +
			L("M198 130 C214 122 224 104 230 82", p.skin, 10.5) +
			C(232, 78, 8.5, p.skin, 3.4) +
			L("M226 74 h12 M226 82 h12", INK, 1.6);
		s +=
			L("M102 140 C96 158 104 172 122 176", INK, 15) +
			L("M102 140 C96 158 104 172 122 176", p.skin, 9.5) +
			C(124, 176, 8, p.skin, 3.4) +
			C(128, 172, 2.6, p.crown, 1.4);
		s +=
			E(118, 204, 12, 4, "#5f9a4a", 2.4) +
			C(118, 200, 4, "#f0a8c8", 2) +
			E(196, 207, 10, 3.4, "#5f9a4a", 2.4);
		s += G(150, 92, 1.05, vodHead(p, true));
		return s;
	}
	LGMon.add("vodyanoy", {
		art: vodArt,
		face: () => G(64, 70, 0.82, vodHead()),
	});
})();

(() => {
	const { INK, o, eye, glowEye, shadow, shine, dk, lt } = LGMon;
	const P = (d, f, w) => `<path d="${d}" fill="${f}" ${o(w)}/>`;
	const F = (d, f, op) =>
		`<path d="${d}" fill="${f}"${op != null ? ` opacity="${op}"` : ""}/>`;
	const L = (d, c = INK, w = 2) =>
		`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
	const E = (cx, cy, rx, ry, f, w) =>
		`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${f}" ${w === 0 ? "" : o(w)}/>`;
	const C = (cx, cy, r, f, op) =>
		`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}"${op != null ? ` opacity="${op}"` : ""}/>`;
	const G = (t, s) => `<g transform="${t}">${s}</g>`;

	const leg = (x, y0, w, y1, c) =>
		P(
			`M${x} ${y0} L${x} ${y1 - 5} Q${x} ${y1} ${x + 5} ${y1} L${x + w + 1} ${y1} Q${x + w + 4} ${y1} ${x + w + 3} ${y1 - 5} L${x + w} ${y0} Z`,
			c,
		) +
		L(
			`M${x + w * 0.38} ${y1 - 1} v-4 M${x + w * 0.72} ${y1 - 1} v-4`,
			INK,
			1.6,
		);

	const claws = (x, y, n = 3, c = "#f3ead6", step = 5) =>
		Array.from({ length: n }, (_, i) =>
			P(`M${x + i * step} ${y} q-1 6 -4 8 q1 -5 0 -8 z`, c, 1.6),
		).join("");

	const snow = (x, y, r, c = "#d8f1ff", w = 1.8) =>
		L(
			`M${x - r} ${y}h${2 * r}M${x} ${y - r}v${2 * r}M${x - r * 0.7} ${y - r * 0.7}l${r * 1.4} ${r * 1.4}M${x - r * 0.7} ${y + r * 0.7}l${r * 1.4} ${-r * 1.4}`,
			c,
			w,
		);

	function limb(pts, ws, c, gy, toe = 8, hoof = null) {
		const n = pts.length,
			A = [],
			B = [];
		for (let i = 0; i < n; i++) {
			const a = pts[Math.max(0, i - 1)],
				b = pts[Math.min(n - 1, i + 1)];
			let dx = b[0] - a[0],
				dy = b[1] - a[1];
			const l = Math.hypot(dx, dy) || 1;
			dx /= l;
			dy /= l;
			A.push([pts[i][0] - (dy * ws[i]) / 2, pts[i][1] + (dx * ws[i]) / 2]);
			B.push([pts[i][0] + (dy * ws[i]) / 2, pts[i][1] - (dx * ws[i]) / 2]);
		}
		const cr = (Q) => {
			let s = "";
			for (let i = 0; i < Q.length - 1; i++) {
				const p0 = Q[Math.max(0, i - 1)],
					p1 = Q[i],
					p2 = Q[i + 1],
					p3 = Q[Math.min(Q.length - 1, i + 2)];
				s += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
			}
			return s;
		};
		const an = pts[n - 1],
			w = ws[n - 1],
			al = A[n - 1],
			bl = B[n - 1],
			tx = an[0] - w / 2 - toe;
		let d = `M${A[0][0].toFixed(1)} ${A[0][1].toFixed(1)}` + cr(A);
		d += ` C${(al[0] - toe * 0.4).toFixed(1)} ${(al[1] + 2).toFixed(1)} ${(tx - 1).toFixed(1)} ${(gy - 9).toFixed(1)} ${tx.toFixed(1)} ${(gy - 4).toFixed(1)} Q${tx} ${gy} ${tx + 5} ${gy} L${(an[0] + w / 2 + 1).toFixed(1)} ${gy} Q${(an[0] + w / 2 + 3).toFixed(1)} ${gy} ${bl[0].toFixed(1)} ${(bl[1] + 2).toFixed(1)}`;
		d += cr(B.slice().reverse()).replace(/^/, " ") + " Z";
		let g = P(d, c);
		if (hoof === "claw") g += claws(tx - 1, gy - 7, 3, INK, 4);
		else if (hoof)
			g +=
				P(
					`M${tx - 1} ${gy} L${an[0] + w / 2 + 1} ${gy} L${an[0] + w / 2} ${gy - 9} L${tx + 2} ${gy - 9} Z`,
					hoof,
					3,
				) + L(`M${(tx + an[0] + w / 2) / 2} ${gy - 1} v-6`, lt(hoof, 0.3), 1.6);
		else g += L(`M${tx + 6} ${gy - 1} v-4 M${tx + 11} ${gy - 1} v-4`, INK, 1.6);
		return g;
	}

	function fleg(x, y0, gy, w, c, s = 0, lift = 0, toe = 8, hoof) {
		const h = gy - y0;
		const pts = lift
			? [
					[x, y0],
					[x + 2 + s * 0.4, y0 + h * 0.45],
					[x + s * 0.5 + 8, gy - 16 - lift],
					[x + s * 0.5 + 12, gy - 8 - lift],
				]
			: [
					[x, y0],
					[x + 2 + s * 0.35, y0 + h * 0.45],
					[x + s * 0.85, gy - 15],
					[x + s - 1, gy - 7],
				];
		return limb(pts, [w * 1.25, w, w * 0.72, w * 0.8], c, gy - lift, toe, hoof);
	}
	function hleg(x, y0, gy, w, c, s = 0, toe = 8, hoof) {
		const h = gy - y0;
		return limb(
			[
				[x, y0],
				[x - 7 + s * 0.4, y0 + h * 0.4],
				[x + 9 + s * 0.8, gy - h * 0.3],
				[x + 3 + s, gy - 7],
			],
			[w * 1.5, w * 1.05, w * 0.7, w * 0.8],
			c,
			gy,
			toe,
			hoof,
		);
	}

	const lid = (x, y, r, side, fill) => {
		const A = [x + side * r * 1.35, y - r * 1.1],
			B = [x - side * r * 1.35, y - r * 0.1];
		const [R, Lf] = A[0] > B[0] ? [A, B] : [B, A];
		return (
			P(
				`M${x - r * 1.45} ${y - r * 1.6} L${x + r * 1.45} ${y - r * 1.6} L${R[0]} ${R[1]} L${Lf[0]} ${Lf[1]} Z`,
				fill,
				0,
			) + L(`M${A[0]} ${A[1]} L${B[0]} ${B[1]}`, INK, 2.4)
		);
	};

	const SW_P = {
		fur: "#e9eff6",
		dk: "#a9bccd",
		mid: "#cbd8e5",
		lt: "#ffffff",
		belly: "#ffffff",
		ear: "#c7d5e6",
		eye: "#7fd3f5",
	};
	function wolfHead(cx, cy, s, p, mood = "grim") {
		let g = `<g transform="translate(${cx},${cy}) scale(${s})">`;
		g +=
			P("M-22-10 L-27-46 Q-11-38 -7-24 Z", p.fur) +
			P("M22-10 L27-46 Q11-38 7-24 Z", p.fur);
		g +=
			F("M-20-15 L-24-39 Q-14-34 -11-24 Z", p.ear) +
			F("M20-15 L24-39 Q14-34 11-24 Z", p.ear);

		g += P(
			"M0-28 C16-28 28-20 30-6 L39 0 L31 6 L37 14 L26 16 C22 23 15 27 10 29 L0 31 L-10 29 C-15 27 -22 23 -26 16 L-37 14 L-31 6 L-39 0 L-30-6 C-28-20 -16-28 0-28 Z",
			p.fur,
		);

		g += F(
			"M-25-14 C-14-30 14-30 25-14 C16-19 8-18 4-12 L0-2 L-4-12 C-8-18 -16-19 -25-14 Z",
			p.mid,
		);
		g += F("M-30 4 L-37 13 L-27 14 Z M30 4 L37 13 L27 14 Z", p.mid);

		g += P(
			"M-11 2 C-11-4 -5-6 0-6 C5-6 11-4 11 2 L10 20 C8 27 -8 27 -10 20 Z",
			p.belly,
			2.6,
		);
		g += shine("M-14-23 C-8-26 -2-26 2-25", p.lt);
		g += eye(-12, -8, 5.8, p.eye) + eye(12, -8, 5.8, p.eye);
		g += lid(-12, -8, 5.8, -1, p.mid) + lid(12, -8, 5.8, 1, p.mid);
		g +=
			P("M-6 15 Q0 12 6 15 Q5 20 0 21 Q-5 20 -6 15 Z", INK, 1.4) +
			E(-2, 15.4, 1.8, 1, "#8a8a96", 0);
		if (mood === "snarl")
			g +=
				P("M-8 23 Q0 29 8 23 Q0 34 -8 23 Z", "#8a2f3f", 1.8) +
				P("M-6 24 L-5 28 L-4 24.5 M4 24.5 L5 28 L6 24", "#fff", 1);
		else g += L("M0 21 V24 M-6 23 Q-3 27 0 24 Q3 27 6 23", INK, 2);
		return g + "</g>";
	}
	function snowwolfArt() {
		const p = SW_P;
		let g = shadow(160, 214, 82);
		g +=
			P(
				"M212 136 C236 140 262 120 264 90 L256 96 L258 74 C248 82 240 88 236 98 C230 106 222 110 212 112 Z",
				p.fur,
			) +
			F("M258 76 C262 84 262 92 258 98 L254 96 C252 90 254 82 258 76 Z", p.dk);
		g += L("M226 120 C238 114 246 104 250 94", p.dk, 2.2);
		g += fleg(142, 150, 212, 13, p.dk, 12) + hleg(186, 148, 212, 13, p.dk, -12);
		g += P(
			"M104 132 C108 112 136 106 164 108 C196 106 222 114 224 138 C226 160 212 170 192 170 L132 170 C114 170 102 154 104 132 Z",
			p.fur,
		);
		g += F(
			"M132 112 C156 104 190 106 214 118 C196 120 172 122 152 126 C140 126 134 120 132 112 Z",
			p.mid,
		);
		g += L("M150 160 C160 164 176 164 186 160", p.dk, 2.4);
		g += hleg(206, 150, 212, 14, p.fur, 12);
		g += P(
			"M190 126 C210 122 224 138 220 158 C216 172 198 174 190 164 Z",
			p.fur,
		);
		g += L("M206 132 C214 138 216 148 214 156", p.dk, 2.2);
		g += fleg(122, 146, 212, 14, p.fur, -10, 16);
		g += shine("M140 112 C160 107 186 108 206 116");

		g +=
			snow(170, 138, 6, "#9fd6f2") +
			snow(200, 146, 4, "#9fd6f2") +
			snow(140, 196, 3.5, "#9fd6f2");

		g += P(
			"M86 116 L80 132 L91 134 L86 148 L98 147 L97 160 L110 152 L117 160 L124 144 L122 122 Z",
			p.belly,
			3,
		);
		g += wolfHead(100, 96, 1.08, p, "snarl");

		g +=
			P(
				"M62 128 C54 126 50 132 54 136 C48 138 50 146 58 144 C60 150 70 148 70 142",
				"#eef8ff",
				2.2,
			) + L("M74 132 C70 134 70 138 72 140", "#bfe4f7", 2);
		return g;
	}

	function conelet(face) {
		const c = "#9a6436",
			cd = "#6e4220",
			cl = "#c48a52";
		let g = "";
		if (!face) {
			g += shadow(150, 214, 46);
			g +=
				P(
					"M130 196 L128 210 Q128 215 134 215 L142 215 Q146 214 144 208 L142 196 Z",
					"#5a3a22",
				) +
				P(
					"M158 196 L156 208 Q155 214 160 215 L168 215 Q173 215 172 210 L170 196 Z",
					"#5a3a22",
				);

			g +=
				L("M108 150 L86 138 M94 142 L88 128 M108 156 L90 162", "#5a3a22", 6) +
				L("M108 150 L86 138 M94 142 L88 128 M108 156 L90 162", "#8a5a34", 2.6);
			g +=
				L(
					"M192 150 L214 136 M206 140 L214 128 M192 156 L210 164",
					"#5a3a22",
					6,
				) +
				L(
					"M192 150 L214 136 M206 140 L214 128 M192 156 L210 164",
					"#8a5a34",
					2.6,
				);
		}

		g +=
			P("M150 92 C142 76 130 70 120 72 C130 78 138 86 146 94 Z", "#4f8a3c", 3) +
			P("M150 92 C160 76 172 70 182 72 C172 78 162 86 154 94 Z", "#4f8a3c", 3);
		g += P(
			"M148 92 C144 78 146 64 152 56 C156 66 156 80 152 92 Z",
			"#6aab4a",
			3,
		);
		g += P(
			"M150 88 C186 88 196 120 194 148 C192 178 172 204 150 206 C128 204 108 178 106 148 C104 120 114 88 150 88 Z",
			c,
		);

		const cx = 150,
			cy = 147,
			rx = 42,
			ry = 56;
		let row = 0;
		for (let y = 100; y <= 198; y += 13, row++) {
			const hw = rx * Math.sqrt(Math.max(0, 1 - ((y - cy) / ry) ** 2)) - 7;
			for (let x = cx - hw + (row % 2 ? 9 : 0); x <= cx + hw; x += 18) {
				if (y > 118 && y < 170 && Math.abs(x - cx) < 32) continue;
				g += F(
					`M${x - 9} ${y - 2} Q${x} ${y + 11} ${x + 9} ${y - 2} Q${x} ${y + 3} ${x - 9} ${y - 2} Z`,
					cd,
				);
				g += L(`M${x - 4} ${y + 2} Q${x} ${y + 5} ${x + 4} ${y + 2}`, cl, 1.6);
			}
		}

		g += P(
			"M150 116 C172 116 182 128 182 142 C182 158 168 168 150 168 C132 168 118 158 118 142 C118 128 128 116 150 116 Z",
			"#e8c690",
			2.6,
		);
		g +=
			eye(138, 138, face ? 9 : 8.2, "#7a4a20") +
			eye(162, 138, face ? 9 : 8.2, "#7a4a20");
		g += E(128, 154, 5, 3, "#e8907a", 0) + E(172, 154, 5, 3, "#e8907a", 0);
		g += L("M144 155 Q150 161 156 155", INK, 2.4);
		g += shine("M124 110 C132 100 142 96 150 96");
		return g;
	}

	const OWL = {
		f: "#9a8a78",
		d: "#6e5f50",
		l: "#cbbca6",
		disc: "#e8dcc6",
		rim: "#7a6450",
	};
	function owlHead(face) {
		let g = "";
		if (face)
			g += P(
				"M150 74 C184 74 200 96 200 118 C200 142 180 154 150 154 C120 154 100 142 100 118 C100 96 116 74 150 74 Z",
				OWL.f,
			);

		g += P(
			"M150 96 C136 82 108 86 108 110 C108 132 128 142 150 134 C172 142 192 132 192 110 C192 86 164 82 150 96 Z",
			OWL.disc,
			3,
		);
		g += L(
			"M150 98 C140 88 116 90 114 110 C114 128 130 136 148 130 M152 98 C160 88 184 90 186 110 C186 128 170 136 152 130",
			OWL.rim,
			1.6,
		);
		g += L("M150 98 V116", OWL.rim, 2.4);
		g += eye(130, 111, 11, "#4a2e22") + eye(170, 111, 11, "#4a2e22");
		g += P("M144 118 L156 118 L150 132 Z", "#e8b84a", 2.4);
		g += L("M118 94 Q128 89 138 95 M182 94 Q172 89 162 95", OWL.d, 2.4);
		return g;
	}
	function owlArt() {
		let g = shadow(150, 216, 66);

		g +=
			P(
				"M86 196 L214 196 Q222 206 214 216 L86 216 Q78 206 86 196 Z",
				"#8a6440",
			) +
			E(214, 206, 6, 10, "#c49a6a", 3) +
			L("M100 204 H150 M162 210 H196", "#5e4228", 2);
		g += P("M118 196 C110 210 132 214 146 204 L146 198 Z", OWL.d);

		g += P("M136 186 L132 210 L150 204 L168 210 L164 186 Z", OWL.d, 3.4);
		g += P(
			"M150 70 C190 70 206 100 204 134 C202 170 184 196 150 198 C116 196 98 170 96 134 C94 100 110 70 150 70 Z",
			OWL.f,
		);
		g += F(
			"M150 140 C168 140 180 156 178 174 C174 190 162 196 150 196 C138 196 126 190 122 174 C120 156 132 140 150 140 Z",
			OWL.l,
		);
		for (const [x, y] of [
			[138, 152],
			[150, 148],
			[162, 152],
			[132, 166],
			[144, 164],
			[156, 164],
			[168, 166],
			[138, 180],
			[150, 178],
			[162, 180],
		])
			g += L(`M${x} ${y} l0 7`, OWL.d, 2.4);

		g +=
			P(
				"M102 112 C88 146 96 184 124 196 C118 168 116 140 116 120 Z",
				OWL.d,
				3.6,
			) +
			P(
				"M198 112 C212 146 204 184 176 196 C182 168 184 140 184 120 Z",
				OWL.d,
				3.6,
			);
		g += L(
			"M106 140 L114 146 M104 156 L114 162 M108 172 L118 178 M194 140 L186 146 M196 156 L186 162 M192 172 L182 178",
			OWL.l,
			2.2,
		);
		g += owlHead(false);
		g += shine("M118 80 C128 74 140 72 150 72");

		g +=
			P("M130 194 l-3 8 M136 195 l0 8 M142 194 l3 8", "none", 2.4) +
			P("M158 194 l-3 8 M164 195 l0 8 M170 194 l3 8", "none", 2.4);
		g += E(136, 194, 9, 4, "#e8b84a", 2.4) + E(164, 194, 9, 4, "#e8b84a", 2.4);
		return g;
	}

	const LX = {
		fur: "#cfa36c",
		dk: "#8e6a42",
		spot: "#6e4f32",
		belly: "#f5ead6",
		ear: "#e3b08a",
	};
	function lynxHead(cx, cy, s, mood = "calm") {
		const p = LX;
		let g = `<g transform="translate(${cx},${cy}) scale(${s})">`;
		g += L("M-22-44 L-24-58 M22-44 L24-58", INK, 3.4);
		g +=
			P("M-28-8 L-22-44 Q-8-30 -6-22 Z", p.fur) +
			P("M28-8 L22-44 Q8-30 6-22 Z", p.fur);
		g +=
			F("M-24-14 L-21-36 Q-12-28 -10-22 Z", p.ear) +
			F("M24-14 L21-36 Q12-28 10-22 Z", p.ear);
		g += F("M-23-38 L-22-44 L-17-37 Z M23-38 L22-44 L17-37 Z", INK);

		g += P(
			"M-28-2 C-42 6 -46 20 -42 32 L-34 26 L-32 36 L-22 28 L-14 34 L0 30 L14 34 L22 28 L32 36 L34 26 L42 32 C46 20 42 6 28-2 Z",
			p.belly,
		);
		g += L(
			"M-40 16 L-30 21 M-38 26 L-29 27 M40 16 L30 21 M38 26 L29 27",
			INK,
			2.4,
		);
		g += P(
			"M0-28 C20-28 32-16 32 0 C32 16 20 26 0 26 C-20 26 -32 16 -32 0 C-32-16 -20-28 0-28 Z",
			p.fur,
		);
		g += L("M-5-24 L-4-14 M5-24 L4-14 M0-26 V-15", p.spot, 2.2);
		for (const [x, y] of [
			[-20, -14],
			[-24, -6],
			[20, -14],
			[24, -6],
			[-14, -20],
			[14, -20],
		])
			g += C(x, y, 1.8, p.spot);
		g +=
			E(-7, 11, 9, 7, p.belly, 0) +
			E(7, 11, 9, 7, p.belly, 0) +
			E(0, 19, 6, 4, p.belly, 0);
		g += eye(-12, -4, 6.4, "#d9c548") + eye(12, -4, 6.4, "#d9c548");
		g += L("M-18-2 L-25 2 M18-2 L25 2", INK, 2.2);
		if (mood === "snarl")
			g += lid(-12, -4, 6.4, -1, p.fur) + lid(12, -4, 6.4, 1, p.fur);
		g += P("M-5 3 L5 3 L0 8 Z", "#d98a7a", 1.8);
		if (mood === "snarl")
			g +=
				P("M-7 13 Q0 18 7 13 Q0 24 -7 13 Z", "#8a2f3f", 1.8) +
				P("M-5 14 L-4 18 L-3 14.5 M3 14.5 L4 18 L5 14", "#fff", 1);
		else g += L("M0 8 V11 M-6 13 Q-3 15 0 11 Q3 15 6 13", INK, 2);
		g +=
			C(-11, 12, 0.9, p.spot) +
			C(-14, 10, 0.9, p.spot) +
			C(11, 12, 0.9, p.spot) +
			C(14, 10, 0.9, p.spot);
		return g + "</g>";
	}
	function lynxArt() {
		const p = LX;
		let g =
			`<g transform="translate(150,136) scale(1.42)">` + shadow(4, 56, 44);

		g +=
			P("M20 48 C34 48 40 40 40 32 C34 34 28 38 20 38 Z", p.fur) +
			F("M40 32 C40 38 37 43 33 45 C33 39 36 35 40 32 Z", INK);
		g += P("M-26 54 C-32 32 -24 6 0 4 C24 6 32 32 26 54 Z", p.fur);
		g += F("M-13 52 C-17 36 -10 18 0 16 C10 18 17 36 13 52 Z", p.belly);
		for (const [x, y] of [
			[-20, 26],
			[-22, 38],
			[-17, 46],
			[20, 26],
			[22, 38],
			[17, 46],
		])
			g += C(x, y, 2.2, p.spot);

		for (const sx of [-1, 1])
			g +=
				P(
					`M${sx * 8} 28 L${sx * 8} 50 Q${sx * 8} 59 ${sx * 16} 59 Q${sx * 24} 59 ${sx * 22} 50 L${sx * 20} 30 Z`,
					p.fur,
				) +
				L(
					`M${sx * 12} 57 V52 M${sx * 16} 58 V53 M${sx * 19.5} 57 V52`,
					INK,
					1.6,
				);
		g += lynxHead(0, -16, 1, "calm");
		return g + "</g>";
	}

	const WV = {
		fur: "#5e4232",
		dk: "#3e2a20",
		band: "#c9a26c",
		mask: "#8a7466",
		lt: "#7d5a44",
	};
	function wolverineHead(cx, cy, s) {
		const p = WV;
		let g = `<g transform="translate(${cx},${cy}) scale(${s})">`;
		g +=
			E(-25, -18, 9, 8, p.fur) +
			E(25, -18, 9, 8, p.fur) +
			E(-25, -18, 4, 3.5, p.mask, 0) +
			E(25, -18, 4, 3.5, p.mask, 0);
		g += P(
			"M0-24 C22-24 35-12 35 4 C35 20 22 30 0 30 C-22 30 -35 20 -35 4 C-35-12 -22-24 0-24 Z",
			p.fur,
		);
		g += F(
			"M-31-6 C-24-20 24-20 31-6 C24-10 14-12 0-12 C-14-12 -24-10 -31-6 Z",
			p.band,
		);
		g += F("M-14-2 C-12-10 12-10 14-2 L12 20 L-12 20 Z", p.mask);
		g += eye(-13, -2, 5.4, "#e8a83a") + eye(13, -2, 5.4, "#e8a83a");
		g += lid(-13, -2, 5.4, -1, p.mask) + lid(13, -2, 5.4, 1, p.mask);
		g += E(0, 14, 13, 10, p.lt, 2.6);
		g += P("M-6 6 Q0 3 6 6 Q5 11 0 12 Q-5 11 -6 6 Z", INK, 1.4);

		g += P("M-11 17 Q0 14 11 17 Q8 29 0 29 Q-8 29 -11 17 Z", "#7a2a2a", 2.2);
		g += P(
			"M-9 17.5 L-7 23 L-5 17 Z M9 17.5 L7 23 L5 17 Z M-3 16 L-2 19 L-1 16 Z M1 16 L2 19 L3 16 Z",
			"#fff",
			1,
		);
		g += P("M-6 28.5 L-5 25 L-4 28.5 Z M6 28.5 L5 25 L4 28.5 Z", "#fff", 1);
		return g + "</g>";
	}
	function wolverineArt() {
		const p = WV;
		let g = shadow(160, 214, 80);
		g +=
			P("M218 140 C242 138 256 156 250 180 C240 168 230 162 216 160 Z", p.fur) +
			L("M230 150 C238 156 242 164 244 172", p.dk, 2.2);
		g += leg(130, 168, 18, 212, p.dk) + leg(182, 168, 18, 212, p.dk);
		g += P(
			"M98 150 C100 118 130 100 166 102 C202 104 224 122 226 150 C228 172 212 184 192 184 L122 184 C106 184 96 170 98 150 Z",
			p.fur,
		);
		g += F(
			"M116 136 C140 118 184 116 218 136 C206 142 192 140 176 136 C156 132 138 136 122 146 Z",
			p.band,
		);
		g += F(
			"M108 168 C130 176 180 178 214 170 C210 182 196 184 190 184 L122 184 C114 184 110 176 108 168 Z",
			p.dk,
		);
		g += shine("M136 108 C156 102 182 102 204 112", "rgba(255,255,255,.35)");
		g += P(
			"M192 136 C212 132 226 148 222 166 C218 180 200 182 192 172 Z",
			p.fur,
		);
		g += leg(198, 166, 20, 212, p.fur) + leg(108, 162, 20, 212, p.fur);
		g += claws(104, 209, 3, "#f3ead6", 6) + claws(194, 209, 3, "#f3ead6", 6);

		g += P(
			"M126 106 L130 94 L136 104 L142 90 L148 102 L156 92 L160 104 Z",
			p.fur,
			3,
		);
		g += wolverineHead(100, 152, 1.02);
		return g;
	}

	function trapperHead(cx, cy, s) {
		const skin = "#e3ad86",
			hat = "#7a5a3e",
			hatL = "#a8845e",
			beard = "#6a4628";
		let g = `<g transform="translate(${cx},${cy}) scale(${s})">`;

		g += L(
			"M-27 26 C-28 34 -26 40 -22 44 M27 26 C28 34 26 40 22 44",
			"#5a4030",
			2,
		);
		g +=
			P(
				"M-31-6 C-38 4 -38 20 -31 28 C-27 32 -20 30 -19 24 L-20-2 Z",
				hatL,
				3.6,
			) + P("M31-6 C38 4 38 20 31 28 C27 32 20 30 19 24 L20-2 Z", hatL, 3.6);
		g += L(
			"M-32 6 l3 2 M-33 16 l3 1 M32 6 l-3 2 M33 16 l-3 1",
			dk(hatL, 0.25),
			1.6,
		);
		g += P(
			"M0-26 C18-26 26-14 26 2 C26 22 14 32 0 32 C-14 32 -26 22 -26 2 C-26-14 -18-26 0-26 Z",
			skin,
		);

		g += P(
			"M-24 6 C-22 22 -12 36 0 38 C12 36 22 22 24 6 C18 14 10 16 0 16 C-10 16 -18 14 -24 6 Z",
			beard,
		);
		g += P("M-9 18 Q0 13 9 18 Q0 21 -9 18 Z", "#8a5a3a", 1.6);
		g += L("M-10 26 L-8 32 M0 28 V35 M10 26 L8 32", "#4a3020", 1.8);

		g += P("M-27-14 C-30-32 -16-42 0-42 C16-42 30-32 27-14 Z", hat);
		g += L(
			"M0-42 C-2-32 -2-22 0-16 M-14-36 C-18-28 -20-22 -20-16 M14-36 C18-28 20-22 20-16",
			dk(hat, 0.25),
			1.8,
		);
		g += shine("M-16-34 C-10-38 -4-39 2-39", "rgba(255,255,255,.35)");
		g += P(
			"M-33-6 C-37-13 -33-22 -25-21 C-22-28 -11-28 -7-24 C-3-29 5-29 9-24 C13-28 24-28 27-21 C35-22 37-13 33-6 C21-11 -21-11 -33-6 Z",
			hatL,
			3.6,
		);
		g += L(
			"M-24-14 l2-4 M-14-16 l1-5 M-4-17 l0-5 M6-17 l0-5 M16-16 l-1-5 M25-14 l-2-4",
			dk(hatL, 0.25),
			1.6,
		);

		g += eye(-10, 0, 4.4, "#6e8a5a") + eye(10, 0, 4.4, "#6e8a5a");
		g += lid(-10, 0, 4.4, -1, skin) + lid(10, 0, 4.4, 1, skin);
		g += P("M-3 4 Q0 12 3 4 Q4 11 0 12 Q-4 11 -3 4 Z", dk(skin, 0.15), 2);

		g +=
			L("M14-6 L20 8", "#b0605a", 2.4) +
			L("M15 -2 l4 -1 M17 3 l4 -1", "#b0605a", 1.4);
		return g + "</g>";
	}
	function trapperArt() {
		const coat = "#8a6444",
			coatD = "#634530",
			fur = "#d9c3a0",
			boot = "#4e3a2c";
		let g = shadow(150, 214, 64);

		g +=
			P("M95 44 L101 44 L101 212 L95 212 Z", "#8a6440", 3) +
			P("M98 14 L106 40 L98 50 L90 40 Z", "#c9d2d8", 3) +
			L("M98 22 V42", "#ffffff", 1.6) +
			L("M92 52 L104 56 M92 58 L104 62", "#a8402a", 3);

		g +=
			P("M126 176 L124 204 L146 204 L148 176 Z", "#5e4a3a") +
			P("M152 176 L154 204 L176 204 L174 176 Z", "#5e4a3a");
		g +=
			P("M120 200 L148 200 L148 214 Q134 218 118 214 Z", boot) +
			P("M152 200 L180 200 L182 214 Q166 218 152 214 Z", boot);
		g += L("M122 204 H146 M154 204 H178", fur, 3);

		g += P(
			"M118 96 C130 88 170 88 182 96 L196 182 C176 190 124 190 104 182 Z",
			coat,
		);
		g += F("M150 96 L150 186 C140 188 128 186 118 184 L126 100 Z", coatD, 0.5);
		g += P(
			"M102 178 C124 188 176 188 198 178 L200 190 C176 198 124 198 100 190 Z",
			fur,
			3.4,
		);
		g += L("M150 100 V186", coatD, 2.4);

		g +=
			P("M110 136 L190 136 L191 146 L109 146 Z", "#4a3426", 3) +
			P("M144 134 L156 134 L156 148 L144 148 Z", "#d9b45a", 2.4);
		g +=
			P("M114 146 L122 146 L120 170 L116 170 Z", "#7a5a3e", 2.4) +
			P("M115 170 L121 170 L118 182 Z", "#c9d2d8", 2);
		g +=
			E(176, 158, 13, 11, "#c9a56a", 3) +
			E(176, 158, 6, 5, "none", 2.2) +
			L("M166 152 Q176 146 186 152 M164 160 Q176 154 188 160", "#8a6a3a", 1.6);

		g +=
			P(
				"M120 100 C106 106 100 120 100 134 L112 136 C114 124 118 116 126 112 Z",
				coat,
			) + E(100, 132, 8, 7, "#e3ad86", 2.6);
		g +=
			P(
				"M180 100 C194 108 200 126 202 148 L190 150 C188 132 184 120 176 112 Z",
				coat,
			) + E(196, 152, 8, 7, "#e3ad86", 2.6);

		g += L("M196 158 L196 166", "#7a7f86", 2.4);
		g += P("M178 168 L214 168 L214 174 L178 174 Z", "#6a7078", 2.6);
		g +=
			P("M180 168 C180 154 212 154 212 168", "none", 3.4) +
			L(
				"M182 166 l3 -5 l3 5 l3 -6 l3 6 l3 -6 l3 6 l3 -5 l3 5 l3 -4",
				"#c9d2d8",
				1.6,
			);

		g += P(
			"M118 92 C126 104 140 108 150 108 C160 108 174 104 182 92 C174 84 126 84 118 92 Z",
			fur,
			3.4,
		);
		g += trapperHead(150, 66, 1.05);
		return g;
	}

	const TR = {
		skin: "#8d9a7c",
		dk: "#64715a",
		lt: "#b4bfa0",
		moss: "#6aa04a",
		mossD: "#4a7a34",
		mossL: "#94c46a",
	};
	const moss = (d) => P(d, TR.moss, 3.4);
	function mushroom(x, y, s = 1, c = "#c9583a") {
		return G(
			`translate(${x},${y}) scale(${s})`,
			P("M-2 0 L-2 -8 L2 -8 L2 0 Z", "#efe2c4", 2) +
				P("M-9 -7 C-9 -16 9 -16 9 -7 Z", c, 2.2) +
				C(-3, -11, 1.4, "#fff") +
				C(3, -10, 1, "#fff"),
		);
	}
	function trollHead(cx, cy, s) {
		const p = TR;
		let g = `<g transform="translate(${cx},${cy}) scale(${s})">`;
		g +=
			P("M-34 -2 L-46 -12 L-36 6 Z", p.skin, 3.4) +
			P("M34 -2 L46 -12 L36 6 Z", p.skin, 3.4);
		g += P(
			"M0-30 C22-30 34-16 34 4 C34 24 20 34 0 34 C-20 34 -34 24 -34 4 C-34-16 -22-30 0-30 Z",
			p.skin,
		);

		g += moss(
			"M-34-2 C-40-14 -32-32 -16-34 C-10-44 10-44 16-34 C32-32 40-14 34-2 C28-8 22-4 16-10 C10-4 4-10 0-6 C-6-10 -10-4 -16-10 C-22-4 -28-8 -34-2 Z",
		);
		g += L("M-24-24 C-18-30 -8-32 0-32", p.mossL, 2.6);
		g += mushroom(18, -30, 0.9);

		g += P(
			"M-26-2 C-20-10 -6-10 -2-4 L2-4 C6-10 20-10 26-2 C18-4 8-2 0 2 C-8-2 -18-4 -26-2 Z",
			p.dk,
			2.6,
		);
		g += eye(-12, 2, 4.6, "#f2c84a") + eye(12, 2, 4.6, "#f2c84a");

		g +=
			P(
				"M-8 4 C-14 14 -10 20 0 20 C10 20 14 14 8 4 C6 0 -6 0 -8 4 Z",
				p.lt,
				2.8,
			) +
			C(-4, 16, 1.6, INK) +
			C(4, 16, 1.6, INK);

		g += P("M-16 24 Q0 30 16 24 Q12 31 0 31 Q-12 31 -16 24 Z", "#5a2a2a", 2.4);
		g += P("M-12 27 L-11 18 L-7 27 Z M12 27 L11 18 L7 27 Z", "#f3ead6", 1.8);
		g += C(-22, 14, 2, p.dk) + C(24, 18, 1.5, p.dk);
		return g + "</g>";
	}
	function mosstrollArt() {
		const p = TR;
		let g = shadow(150, 214, 86);

		g +=
			P("M214 196 L240 72 C244 60 262 62 262 76 L236 200 Z", "#7a5636") +
			L("M234 120 L250 112 M228 160 L242 156", "#5a3a22", 2.2) +
			E(251, 71, 10, 6, "#b48a5a", 3);
		g += moss("M240 96 C246 90 256 92 258 100 C254 106 244 106 240 96 Z");
		g +=
			P(
				"M128 186 L124 210 Q124 216 132 216 L148 216 Q152 214 150 208 L148 186 Z",
				p.dk,
			) +
			P(
				"M154 186 L156 208 Q156 214 162 216 L176 216 Q182 216 180 210 L176 186 Z",
				p.dk,
			);
		g += P(
			"M98 124 C96 88 124 72 156 74 C192 76 214 98 212 134 C210 170 194 196 158 198 C122 200 100 170 98 124 Z",
			p.skin,
		);
		g += F(
			"M120 150 C124 130 176 128 186 150 C186 176 170 190 152 190 C134 190 120 176 120 150 Z",
			p.lt,
		);
		g += L("M130 160 Q152 166 176 160 M132 174 Q152 180 172 174", p.dk, 2);

		g += moss(
			"M98 120 C90 100 104 80 124 82 C130 70 176 70 184 82 C204 80 218 100 210 122 C204 114 196 118 190 110 C184 118 176 112 168 116 C160 110 150 116 142 112 C134 118 124 112 118 118 C110 112 104 120 98 120 Z",
		);
		g += F("M116 92 C122 86 136 84 144 86 C138 92 126 96 116 92 Z", p.mossL);
		g +=
			mushroom(112, 94, 1, "#d9a24a") +
			mushroom(196, 96, 1.1) +
			mushroom(206, 104, 0.7);
		g += L(
			"M120 120 L118 132 M150 116 L151 130 M184 116 L186 128",
			p.mossD,
			2.6,
		);

		g +=
			P(
				"M104 112 C84 120 78 150 80 186 L98 188 C98 160 104 140 116 128 Z",
				p.skin,
			) +
			P(
				"M70 196 C68 182 80 176 92 178 C104 180 106 194 100 202 C92 208 74 206 70 196 Z",
				p.skin,
			);
		g += L("M80 196 l-2 6 M88 198 l-1 6 M96 196 l0 6", INK, 2);
		g +=
			P(
				"M200 112 C220 120 226 150 228 176 L212 182 C210 160 204 142 194 130 Z",
				p.skin,
			) +
			P(
				"M208 186 C204 172 220 166 232 170 C242 176 240 190 232 194 C222 198 210 196 208 186 Z",
				p.skin,
			);
		g += moss("M84 150 C86 142 96 140 102 146 C98 154 90 156 84 150 Z");
		g += trollHead(152, 110, 0.88);
		return g;
	}

	const EL = {
		fur: "#5e4330",
		dk: "#3e2a1e",
		lt: "#7e5e44",
		leg: "#b09a80",
		ant: "#e3d0a8",
		antD: "#b8a07a",
		moss: "#7aa84e",
	};
	function elkAntler(side) {
		const s = side;
		return (
			P(
				`M${s * 8} -24 C${s * 14} -34 ${s * 22} -38 ${s * 30} -38 C${s * 36} -46 ${s * 40} -52 ${s * 40} -58 L${s * 46} -50 L${s * 50} -58 L${s * 53} -48 L${s * 58} -52 L${s * 58} -40 C${s * 56} -30 ${s * 46} -24 ${s * 34} -22 L${s * 26} -18 Z`,
				EL.ant,
				3.4,
			) +
			L(`M${s * 18} -26 C${s * 28} -30 ${s * 38} -34 ${s * 46} -42`, EL.antD, 2)
		);
	}
	function elkFace(cx, cy, s) {
		const p = EL;
		let g = `<g transform="translate(${cx},${cy}) scale(${s})">`;
		g += elkAntler(-1) + elkAntler(1);
		g +=
			P("M-14-22 L-34-12 Q-28-4 -14-8 Z", p.fur, 3.4) +
			P("M14-22 L34-12 Q28-4 14-8 Z", p.fur, 3.4);
		g += P(
			"M0-28 C14-28 20-20 18-6 L16 18 C22 26 22 38 12 42 C4 46 -4 46 -12 42 C-22 38 -22 26 -16 18 L-18-6 C-20-20 -14-28 0-28 Z",
			p.fur,
		);
		g += F(
			"M-14 20 C-18 28 -16 38 -8 41 C-2 43 2 43 8 41 C16 38 18 28 14 20 C6 24 -6 24 -14 20 Z",
			p.lt,
		);
		g += E(-7, 34, 3.6, 4.6, INK, 0) + E(7, 34, 3.6, 4.6, INK, 0);
		g += eye(-12, -8, 4.8, "#e0a040") + eye(12, -8, 4.8, "#e0a040");
		g += lid(-12, -8, 4.8, -1, p.fur) + lid(12, -8, 4.8, 1, p.fur);
		g += L("M-6-20 C-2-24 2-24 6-20", p.lt, 2.6);
		return g + "</g>";
	}
	function elkArt() {
		const p = EL;
		let g = shadow(168, 216, 92);

		g +=
			fleg(144, 146, 214, 11, dk(p.leg, 0.25), 12, 0, 3, "#2e211a") +
			hleg(216, 144, 214, 11, dk(p.leg, 0.25), -12, 3, "#2e211a");

		g += P("M240 108 L252 118 L242 124 Z", p.fur, 3);
		g += P(
			"M118 106 C122 78 160 66 190 78 C220 80 246 92 248 120 C250 146 234 158 210 158 L146 158 C126 158 114 134 118 106 Z",
			p.fur,
		);
		g += F(
			"M140 150 C160 156 200 156 228 150 C222 158 214 158 210 158 L146 158 Z",
			p.dk,
		);
		g += shine("M150 78 C166 70 184 72 200 80", "rgba(255,255,255,.3)");

		g += L("M196 98 L206 118 M206 96 L214 112", "#c9a080", 2.4);

		g += hleg(222, 140, 214, 13, p.leg, 14, 3, "#2e211a");
		g += fleg(156, 140, 214, 12, p.leg, -16, 0, 3, "#2e211a");
		g += P(
			"M200 120 C220 114 238 128 234 150 C230 162 214 164 206 156 Z",
			p.fur,
		);

		g += P(
			"M126 98 C112 92 98 92 88 100 L94 130 C108 130 120 132 134 134 Z",
			p.fur,
		);
		g += P("M96 134 C99 150 95 164 88 170 C84 160 85 146 88 134 Z", p.dk);
		g += P(
			"M98 82 C110 80 118 90 116 102 L110 124 C106 138 94 144 78 144 C64 144 56 136 56 128 C56 118 64 112 72 108 C80 96 88 84 98 82 Z",
			p.fur,
		);
		g += F(
			"M58 126 C58 118 66 114 74 112 C70 122 70 134 76 142 C64 142 58 136 58 126 Z",
			p.lt,
		);
		g += E(64, 130, 2.6, 3.6, INK, 0);
		g += eye(100, 100, 4.6, "#e0a040") + lid(100, 100, 4.6, -1, p.fur);
		g += P("M110 86 C120 78 132 76 138 80 C132 86 122 90 112 94 Z", p.fur, 3.4);

		g += P(
			"M96 86 C84 78 72 68 66 54 L56 52 L62 44 L54 38 L64 36 L60 26 L72 32 C80 46 90 62 100 80 Z",
			p.antD,
			3.4,
		);
		g += P(
			"M100 86 C94 72 94 58 102 46 L94 40 L104 36 L100 24 L112 30 L114 16 L124 28 L132 16 L136 30 L148 22 L150 36 L160 32 C156 52 136 70 108 88 Z",
			p.ant,
			3.6,
		);
		g += L("M104 74 C114 60 128 48 146 40", p.antD, 2.2);

		g +=
			P("M126 64 C126 74 130 80 128 88 C134 82 136 72 134 62 Z", p.moss, 2.2) +
			P("M142 50 C144 58 142 64 146 70 C150 62 150 54 148 48 Z", p.moss, 2.2);
		return g;
	}

	const SH = {
		fur: "#5c4c44",
		dk: "#3a2e2a",
		lt: "#8c7a6e",
		muzzle: "#9a8270",
		frost: "#dfeef7",
	};
	function shatunHead(cx, cy, s) {
		const p = SH;
		let g = `<g transform="translate(${cx},${cy}) scale(${s})">`;
		g += E(-26, -22, 11, 10, p.fur) + E(-26, -22, 5, 4.5, p.dk, 0);

		g += P(
			"M18-26 C22-34 34-34 37-24 L31-22 L35-16 C30-10 22-12 18-18 Z",
			p.fur,
		);
		g += P(
			"M0-28 C22-28 36-16 36 2 L40 6 L35 10 C32 24 18 32 0 32 C-18 32 -32 24 -35 10 L-40 6 L-36 2 C-36-16 -22-28 0-28 Z",
			p.fur,
		);
		g += L(
			"M-30-10 L-36-14 M30-10 L36-14 M-20-26 L-22-32 M8-28 L10-34",
			p.fur,
			4,
		);

		g += glowEye(-13, -4, 5, "#ff6a3a") + glowEye(13, -4, 5, "#ff6a3a");
		g += lid(-13, -4, 5, -1, p.fur) + lid(13, -4, 5, 1, p.fur);
		g +=
			L("M6-18 L20 8", "#d08a7a", 3) +
			L("M9-12 l5-1 M13-4 l5-1 M16 3 l5-1", "#d08a7a", 1.6);
		g += E(0, 14, 15, 12, p.muzzle, 2.6);
		g += P("M-7 5 Q0 2 7 5 Q6 10 0 11 Q-6 10 -7 5 Z", INK, 1.4);

		g += P("M-12 16 Q0 12 12 16 Q10 30 0 31 Q-10 30 -12 16 Z", "#6a2228", 2.2);
		g += P(
			"M-10 16.5 L-8 23 L-6 16 Z M10 16.5 L8 23 L6 16 Z M-8 30 L-7 25 L-5 30 Z M8 30 L7 25 L5 30 Z",
			"#f3ead6",
			1,
		);
		g += L("M6 30 Q7 36 5 40", "#cfe6f0", 2);
		return g + "</g>";
	}
	function shatunArt() {
		const p = SH;
		let g = shadow(150, 214, 76);
		g +=
			P(
				"M114 184 L110 210 Q110 216 118 216 L140 216 Q144 214 142 208 L140 184 Z",
				p.dk,
			) +
			P(
				"M160 184 L158 208 Q156 214 162 216 L184 216 Q190 216 188 210 L186 184 Z",
				p.dk,
			);
		g += claws(112, 212, 3, "#efe4cc", 6) + claws(160, 212, 3, "#efe4cc", 6);

		g += P(
			"M150 72 C182 72 200 96 202 128 L208 136 L201 142 L206 152 L198 156 C196 186 180 200 150 200 C120 200 104 186 102 156 L94 152 L99 142 L92 136 L100 128 C100 96 118 72 150 72 Z",
			p.fur,
		);
		g += F(
			"M150 108 C168 108 178 128 178 152 C178 176 166 190 150 190 C134 190 122 176 122 152 C122 128 132 108 150 108 Z",
			p.lt,
		);

		g += L(
			"M130 128 Q150 136 170 128 M128 142 Q150 150 172 142 M130 156 Q150 164 170 156",
			p.dk,
			2.6,
		);
		g += L("M150 118 V170", p.dk, 1.8);

		g +=
			F("M110 96 C118 84 134 80 140 84 C132 90 120 96 110 104 Z", p.frost) +
			F("M190 96 C182 84 166 80 160 84 C168 90 180 96 190 104 Z", p.frost);
		g += L("M108 170 L102 176 M196 170 L202 176 M116 186 L112 194", p.fur, 4);

		g += P("M108 102 C92 92 80 80 72 62 L86 54 C94 70 104 80 118 88 Z", p.fur);
		g += P(
			"M192 102 C208 92 220 80 228 62 L214 54 C206 70 196 80 182 88 Z",
			p.fur,
		);
		g += E(76, 56, 14, 12, p.fur) + E(224, 56, 14, 12, p.fur);
		for (const [x, y, r] of [
			[66, 46, -30],
			[74, 42, -10],
			[83, 42, 10],
		])
			g += G(
				`translate(${x},${y}) rotate(${r})`,
				P("M-2 0 q2 -9 6 -12 q-1 6 0 12 z", "#efe4cc", 1.6),
			);
		for (const [x, y, r] of [
			[234, 46, 30],
			[226, 42, 10],
			[217, 42, -10],
		])
			g += G(
				`translate(${x},${y}) rotate(${r})`,
				P("M2 0 q-2 -9 -6 -12 q1 6 0 12 z", "#efe4cc", 1.6),
			);
		g += shatunHead(150, 76, 1.12);
		return g;
	}

	const VX = {
		robe: "#e6dcc8",
		robeD: "#bfb39c",
		red: "#b8402e",
		pelt: "#8a8580",
		peltD: "#5e5a56",
		skin: "#e6b490",
		beard: "#f4f1ea",
		beardD: "#c9c4ba",
		glow: "#9ff0a8",
	};
	function volkhvHead(cx, cy, s) {
		const p = VX;
		let g = `<g transform="translate(${cx},${cy}) scale(${s})">`;

		g +=
			P("M-22-30 L-28-50 L-12-38 Z", p.pelt, 3.4) +
			P("M22-30 L28-50 L12-38 Z", p.pelt, 3.4);
		g += P(
			"M0-42 C24-42 36-24 36 0 L38 30 L-38 30 L-36 0 C-36-24 -24-42 0-42 Z",
			p.pelt,
		);

		g += P(
			"M-16-36 C-10-44 10-44 16-36 L10-24 C6-20 -6-20 -10-24 Z",
			p.peltD,
			3,
		);
		g +=
			C(-8, -32, 2.2, "#f2c84a") +
			C(8, -32, 2.2, "#f2c84a") +
			E(0, -23, 3, 2, INK, 0);
		g += P("M-6-21 L-5-17 L-4-21 M4-21 L5-17 L6-21", "#f3ead6", 1.2);
		g += P(
			"M0-20 C16-20 24-10 24 4 C24 20 14 26 0 26 C-14 26 -24 20 -24 4 C-24-10 -16-20 0-20 Z",
			p.skin,
		);

		g += P(
			"M-22 6 C-26 26 -18 46 -8 58 L0 52 L8 58 C18 46 26 26 22 6 C16 16 8 18 0 18 C-8 18 -16 16 -22 6 Z",
			p.beard,
		);
		g += L(
			"M-12 24 C-14 34 -10 44 -6 50 M0 22 V46 M12 24 C14 34 10 44 6 50",
			p.beardD,
			2,
		);
		g += P(
			"M-14 10 C-8 6 -3 8 0 12 C3 8 8 6 14 10 C8 14 3 14 0 13 C-3 14 -8 14 -14 10 Z",
			p.beard,
			2.4,
		);

		g += glowEye(-9, -5, 3.8, p.glow) + glowEye(9, -5, 3.8, p.glow);
		g +=
			P("M-19-10 C-14-16 -6-15 -2-11 C-8-12 -14-10 -19-6 Z", p.beard, 2.2) +
			P("M19-10 C14-16 6-15 2-11 C8-12 14-10 19-6 Z", p.beard, 2.2);
		g += P("M-3 0 Q0 9 3 0 Q4 7 0 8 Q-4 7 -3 0 Z", dk(p.skin, 0.12), 2);
		g += L(
			"M-20 0 C-18 2 -18 4 -19 6 M20 0 C18 2 18 4 19 6",
			dk(p.skin, 0.2),
			1.4,
		);
		return g + "</g>";
	}
	function volkhvArt() {
		const p = VX;
		let g = shadow(150, 214, 72);

		g += P("M209 40 L216 40 L218 212 L211 212 Z", "#7a5636", 3);
		g +=
			P(
				"M212 44 C204 34 200 22 204 10 L208 16 L210 6 L214 18 C214 28 216 36 214 44 Z",
				"#e3d0a8",
				3,
			) +
			P(
				"M214 44 C222 36 228 26 228 14 L232 22 L236 14 C236 30 228 42 216 48 Z",
				"#e3d0a8",
				3,
			);
		g +=
			C(212, 30, 9, p.glow, 0.35) +
			C(212, 30, 5, p.glow) +
			L("M210 26 l3 2", "#fff", 2);
		g +=
			L("M204 48 L200 70 M222 48 L226 66", "#8a6a4a", 1.6) +
			C(200, 72, 3.4, "#c9a24a") +
			P("M223 66 l6 0 l-3 7 z", "#b8402e", 1.6);

		g += P(
			"M150 92 C172 92 186 104 190 124 L206 208 C186 216 114 216 94 208 L110 124 C114 104 128 92 150 92 Z",
			p.robe,
		);
		g += F(
			"M150 92 C172 92 186 104 190 124 L206 208 C196 212 182 214 170 214 L160 120 C158 104 154 96 150 92 Z",
			p.robeD,
			0.6,
		);
		g += P(
			"M98 194 C120 202 180 202 202 194 L205 206 C184 214 116 214 95 206 Z",
			p.red,
			3,
		);
		g += L(
			"M104 200 l6 -4 l6 4 l6 -4 l6 4 l6 -4 l6 4 l6 -4 l6 4 l6 -4 l6 4 l6 -4 l6 4 l6 -4 l6 4 l6 -4",
			"#f2d58a",
			1.6,
		);
		g +=
			P("M144 120 L156 120 L160 196 L140 196 Z", p.red, 2.6) +
			L(
				"M150 126 l-4 6 l4 6 l4 -6 z M150 146 l-4 6 l4 6 l4 -6 z M150 166 l-4 6 l4 6 l4 -6 z",
				"#f2d58a",
				1.6,
			);

		g += P(
			"M114 150 C130 156 170 156 186 150 L187 158 C170 164 130 164 113 158 Z",
			"#8a6440",
			2.6,
		);
		g +=
			L("M126 160 L124 176 M174 160 L176 172", "#8a6440", 1.6) +
			C(124, 179, 4, "#e3d0a8") +
			P("M172 172 l8 0 l-4 8 z", "#c9a24a", 1.6);

		g += P(
			"M110 116 C112 96 130 86 150 86 C170 86 188 96 190 116 C176 124 124 124 110 116 Z",
			VX.pelt,
		);
		g += L(
			"M118 116 l-2 6 M130 120 l-1 6 M170 120 l1 6 M182 116 l2 6",
			VX.peltD,
			2,
		);

		g +=
			P(
				"M184 110 C200 116 206 130 208 146 L198 150 C194 136 188 128 180 124 Z",
				p.robe,
			) + E(208, 148, 7.5, 7, p.skin, 2.6);
		g +=
			P(
				"M116 110 C100 108 90 98 86 86 L96 80 C100 90 108 96 120 98 Z",
				p.robe,
			) + E(90, 80, 7.5, 7, p.skin, 2.6);
		g +=
			C(84, 62, 14, p.glow, 0.25) +
			C(84, 62, 8, p.glow, 0.6) +
			snow(84, 62, 6, "#effff0", 2.2);
		g += volkhvHead(150, 74, 1);
		return g;
	}

	const WD = {
		skin: "#4a4549",
		dk: "#2e2a2e",
		lt: "#6e686c",
		bone: "#ece2cc",
		boneD: "#bfb196",
		hide: "#7a6656",
		glow: "#c6f6ff",
	};
	function wendigoSkull(cx, cy, s, ak = 1) {
		const p = WD;
		let g = `<g transform="translate(${cx},${cy}) scale(${s})">`;

		for (const sd of [-1, 1]) {
			g += P(
				`M${sd * 10} -18 C${sd * 18} -34 ${sd * 22} -44 ${sd * 20} -58 L${sd * 26} -58 C${sd * 30} -46 ${sd * 28} -38 ${sd * 24} -30 C${sd * 32} -36 ${sd * 38} -40 ${sd * 40} -50 L${sd * 46} -46 C${sd * 44} -36 ${sd * 36} -28 ${sd * 22} -22 C${sd * 30} -22 ${sd * 40} -20 ${sd * 48} -26 L${sd * 50} -20 C${sd * 42} -12 ${sd * 30} -12 ${sd * 16} -12 Z`.replace(
					/-?\d+(\.\d+)?/g,
					(v) => String(+(v * (Math.abs(+v) > 12 ? ak : 1)).toFixed(1)),
				),
				p.boneD,
				3.2,
			);
		}

		g += P(
			"M0-26 C18-26 24-12 22 2 C20 14 12 22 10 34 C8 42 -8 42 -10 34 C-12 22 -20 14 -22 2 C-24-12 -18-26 0-26 Z",
			p.bone,
			3.6,
		);
		g += F(
			"M-20 4 C-14 8 -8 10 -6 6 L-4 30 C-8 30 -10 24 -12 18 Z",
			p.boneD,
			0.7,
		);

		g +=
			P("M-18-6 C-16-14 -6-14 -4-6 C-6 2 -16 2 -18-6 Z", INK, 0) +
			P("M18-6 C16-14 6-14 4-6 C6 2 16 2 18-6 Z", INK, 0);
		g += glowEye(-11, -6, 3.6, p.glow) + glowEye(11, -6, 3.6, p.glow);

		g += P("M-4 16 L0 10 L4 16 L0 22 Z", INK, 0);
		g +=
			P("M-8 30 L8 30 L7 38 L-7 38 Z", "#2b1d18", 1.8) +
			L("M-5 30 V37 M-1.5 30 V38 M1.5 30 V38 M5 30 V37", p.bone, 1.6);
		g += L("M-14-18 L-10-12 M10-20 L14-14", p.boneD, 1.6);
		return g + "</g>";
	}
	function wendigoArt() {
		const p = WD;
		let g = shadow(150, 216, 70);

		g += P(
			"M84 214 C88 204 102 204 108 210 C114 200 132 202 136 210 C144 202 160 204 164 210 C172 200 190 202 196 212 C206 206 218 210 216 216 L86 218 Z",
			"#e4f3fa",
			2.2,
		);

		g +=
			P(
				"M132 150 L120 180 L132 210 L124 214 L110 182 L122 148 Z",
				p.skin,
				3.6,
			) +
			P("M168 150 L180 180 L168 210 L176 214 L190 182 L178 148 Z", p.skin, 3.6);
		g += claws(116, 211, 3, p.bone, 5) + claws(170, 211, 3, p.bone, 5);

		g += P(
			"M124 140 L176 140 L182 168 L172 160 L168 172 L158 160 L150 176 L142 160 L132 172 L128 160 L118 168 Z",
			p.hide,
			3.4,
		);

		g += P(
			"M130 94 C126 108 124 124 128 142 L172 142 C176 124 174 108 170 94 C160 88 140 88 130 94 Z",
			p.skin,
		);
		g += L(
			"M136 108 Q150 114 164 108 M134 118 Q150 124 166 118 M134 128 Q150 134 166 128",
			p.lt,
			2.2,
		);
		g += L("M150 100 V136", p.dk, 1.8);

		g += P(
			"M132 96 C116 104 106 124 102 150 L96 180 L104 182 L112 152 C116 130 124 116 136 108 Z",
			p.skin,
			3.6,
		);
		g += P(
			"M168 96 C184 104 194 124 198 150 L204 180 L196 182 L188 152 C184 130 176 116 164 108 Z",
			p.skin,
			3.6,
		);
		for (const [x, sd] of [
			[100, -1],
			[200, 1],
		])
			for (let i = 0; i < 4; i++)
				g += P(
					`M${x - 6 + i * 4} 180 q${sd * 2} 12 ${-sd * 4 + (i - 1.5) * 2} 22 q${sd * 2} -10 ${sd * 2} -22 z`,
					p.bone,
					1.8,
				);

		g += P("M144 84 L156 84 L158 96 L142 96 Z", p.skin, 3);
		g +=
			L("M120 98 C116 110 116 118 120 124", p.hide, 2) + C(146, 158, 1, p.bone);
		g += wendigoSkull(150, 68, 0.98);
		return g;
	}

	const CS = {
		body: "#bfe6c2",
		bodyD: "#8fc49a",
		glow: "#eaffd8",
		ndl: "#2f6e4a",
		ndlL: "#4f9a62",
		bark: "#8a6a4e",
		eye: "#fff3a0",
	};
	const needles = (x, y, r, s = 1, c = CS.ndl) =>
		G(
			`translate(${x},${y}) rotate(${r}) scale(${s})`,
			P(
				"M0 0 C6 -10 18 -14 30 -12 L24 -6 L32 -2 L24 2 L30 8 C18 10 6 6 0 0 Z",
				c,
				2.8,
			) + L("M2 0 L28 -2", CS.ndlL, 1.6),
		);
	function cedarHead(cx, cy, s) {
		const p = CS;
		let g = `<g transform="translate(${cx},${cy}) scale(${s})">`;

		g +=
			needles(-6, -24, -150, 1) +
			needles(6, -24, -30, 1) +
			needles(-2, -26, -100, 0.9) +
			needles(2, -26, -80, 0.9);
		g +=
			needles(-14, -18, -175, 0.85, p.ndlL) +
			needles(14, -18, -5, 0.85, p.ndlL);
		g += P(
			"M0-28 C18-28 28-14 28 2 C28 20 16 30 0 30 C-16 30 -28 20 -28 2 C-28-14 -18-28 0-28 Z",
			p.body,
		);

		g += P(
			"M-20-8 C-14-20 14-20 20-8 L16 20 C10 26 -10 26 -16 20 Z",
			p.bark,
			3,
		);
		g += L(
			"M-10-14 L-12 2 M0-17 V-8 M10-14 L12 2 M-6 14 L-4 22 M6 14 L4 22",
			dk(p.bark, 0.3),
			1.6,
		);
		g +=
			P("M-17-2 C-14-8 -6-8 -4-2 C-6 4 -14 4 -17-2 Z", INK, 0) +
			P("M17-2 C14-8 6-8 4-2 C6 4 14 4 17-2 Z", INK, 0);
		g += glowEye(-10, -2, 4, p.eye) + glowEye(10, -2, 4, p.eye);
		g += P("M-5 11 Q0 15 5 11 Q0 19 -5 11 Z", INK, 0);

		g += E(-22, -14, 4, 6, "#8a5a34", 2) + E(22, -14, 4, 6, "#8a5a34", 2);
		return g + "</g>";
	}
	function cedarspiritArt() {
		const p = CS;
		let g = shadow(150, 216, 40).replace(".22", ".12");

		g += C(150, 124, 76, p.glow, 0.35);

		g += P(
			"M118 128 C110 160 124 186 150 196 C170 204 188 200 192 188 C182 194 168 192 162 182 C176 182 184 170 178 156 C176 140 182 128 182 118 Z",
			p.body,
		);
		g +=
			L("M130 150 C134 170 146 182 162 186", p.bodyD, 2.4) +
			L("M170 158 C172 168 168 174 162 178", p.bodyD, 2);

		g += P(
			"M124 124 C108 130 94 128 84 118 L92 112 C100 118 110 120 122 116 Z",
			p.body,
			3.4,
		);
		g += P(
			"M176 124 C192 130 206 128 216 118 L208 112 C200 118 190 120 178 116 Z",
			p.body,
			3.4,
		);
		g +=
			needles(86, 116, -160, 0.8) +
			needles(86, 116, 160, 0.7, p.ndlL) +
			needles(214, 116, -20, 0.8) +
			needles(214, 116, 20, 0.7, p.ndlL);

		g += P(
			"M124 104 C126 92 174 92 176 104 L182 134 C170 146 130 146 118 134 Z",
			p.body,
		);
		g += L("M136 116 Q150 122 164 116", p.bodyD, 2.2);
		g += cedarHead(150, 76, 1.18);

		for (const [x, y, r] of [
			[96, 82, 4],
			[206, 78, 3.4],
			[100, 168, 3],
			[212, 160, 4],
			[232, 112, 2.6],
			[70, 136, 2.6],
		])
			g +=
				C(x, y, r * 2, p.glow, 0.5) +
				C(x, y, r, "#fffbd0") +
				`<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${p.bodyD}" stroke-width="1.4"/>`;
		return g;
	}

	const TL = {
		bark: "#6e4e36",
		barkD: "#4a3222",
		barkL: "#9a7452",
		moss: "#5f9a46",
		mossD: "#3f7030",
		mossL: "#8cc062",
		fir: "#2e5e3e",
		firL: "#4a8a56",
		gold: "#e8c35a",
		amber: "#ffb84a",
		ant: "#d8c49c",
		antD: "#a8946e",
	};
	function lordAntler(sd, big) {
		const k = big ? 1 : 0.62;
		let g = P(
			`M${sd * 14} -30 C${sd * 22} -46 ${sd * 30} -56 ${sd * 44} -62 L${sd * 52} -78 L${sd * 56} -64 C${sd * 64} -66 ${sd * 72} -74 ${sd * 76} -86 L${sd * 82} -78 C${sd * 80} -66 ${sd * 72} -58 ${sd * 60} -54 C${sd * 72} -54 ${sd * 82} -58 ${sd * 90} -66 L${sd * 94} -58 C${sd * 86} -46 ${sd * 70} -44 ${sd * 54} -46 C${sd * 44} -42 ${sd * 32} -32 ${sd * 26} -22 Z`.replace(
				/-?\d+(\.\d+)?/g,
				(v) => String(+(v * k).toFixed(1)),
			),
			TL.ant,
			3.4,
		);
		g +=
			C(sd * 40 * k, -58 * k, 3.4 * k + 1, TL.gold) +
			`<circle cx="${sd * 40 * k}" cy="${-58 * k}" r="${3.4 * k + 1}" fill="none" stroke="${INK}" stroke-width="1.6"/>`;
		return g;
	}
	function lordHead(cx, cy, s, big) {
		const p = TL;
		let g = `<g transform="translate(${cx},${cy}) scale(${s})">`;
		g += lordAntler(-1, big) + lordAntler(1, big);
		if (big)
			g +=
				P(
					"M-62-62 C-60-50 -64-42 -60-34 M62-62 C60-50 64-42 60-34",
					"none",
					2.4,
				) +
				L(
					"M-62-62 C-60-50 -64-42 -60-34 M62-62 C60-50 64-42 60-34 M-80-60 C-82-50 -78-44 -80-38",
					p.moss,
					3,
				);

		g += P(
			"M0-34 C20-34 30-20 30 0 C30 18 22 30 0 32 C-22 30 -30 18 -30 0 C-30-20 -20-34 0-34 Z",
			p.bark,
		);
		g += L(
			"M-18-24 L-16-10 M-6-30 L-5-20 M8-30 L7-18 M20-22 L17-10",
			p.barkD,
			2,
		);

		g += P(
			"M-28-16 L-24-30 L-14-24 L-8-38 L0-28 L8-38 L14-24 L24-30 L28-16 C14-20 -14-20 -28-16 Z",
			p.gold,
			3,
		);
		g +=
			C(0, -24, 3.4, p.amber) +
			`<circle cx="0" cy="-24" r="3.4" fill="none" stroke="${INK}" stroke-width="1.6"/>` +
			C(-1, -25, 1, "#fff");

		g +=
			P("M-22-6 C-18-14 -6-14 -3-6 C-6 2 -18 2 -22-6 Z", p.barkD, 0) +
			P("M22-6 C18-14 6-14 3-6 C6 2 18 2 22-6 Z", p.barkD, 0);
		g += glowEye(-12, -6, 4.6, p.amber) + glowEye(12, -6, 4.6, p.amber);
		g += P(
			"M-24-14 L-4-8 L-4-12 L-22-18 Z M24-14 L4-8 L4-12 L22-18 Z",
			p.barkD,
			2,
		);

		g += P("M-3-4 L3-4 L5 10 L-5 10 Z", p.barkL, 2.4);

		g += P(
			"M-28 6 C-34 24 -28 48 -18 60 L-12 52 L-6 66 L0 56 L6 66 L12 52 L18 60 C28 48 34 24 28 6 C20 16 10 18 0 16 C-10 18 -20 16 -28 6 Z",
			p.moss,
		);
		g += L(
			"M-18 26 C-20 36 -16 46 -14 52 M-6 24 V50 M6 24 V50 M18 26 C20 36 16 46 14 52",
			p.mossD,
			2,
		);
		g += F("M-20 16 C-14 20 -8 22 -2 22 C-8 26 -16 24 -20 16 Z", p.mossL);
		g += P("M-8 12 Q0 16 8 12 Q0 20 -8 12 Z", INK, 0);
		return g + "</g>";
	}
	function taigalordArt() {
		const p = TL;
		let g = shadow(150, 218, 100);

		g +=
			P("M118 196 C110 206 96 208 84 214 L120 216 L132 206 Z", p.barkD) +
			P("M182 196 C190 206 204 208 216 214 L180 216 L168 206 Z", p.barkD);
		g +=
			P("M126 190 L120 216 L144 216 L144 192 Z", p.bark) +
			P("M174 190 L180 216 L156 216 L156 192 Z", p.bark);

		g +=
			P("M234 54 L241 54 L238 216 L231 216 Z", p.barkD, 3) +
			P("M230 58 C222 46 226 34 237 30 C248 34 252 46 244 58 Z", p.barkL, 3);
		g +=
			C(237, 42, 16, p.amber, 0.3) +
			C(237, 42, 8, p.amber) +
			`<circle cx="237" cy="42" r="8" fill="none" stroke="${INK}" stroke-width="2.4"/>` +
			C(234, 39, 2.4, "#fff");

		g += P(
			"M150 82 C190 82 212 108 214 140 L226 196 L210 190 L206 204 L192 194 L184 208 L170 196 L160 210 L150 198 L140 210 L130 196 L116 208 L108 194 L94 204 L90 190 L74 196 L86 140 C88 108 110 82 150 82 Z",
			p.fir,
		);
		for (const [x, y] of [
			[100, 150],
			[120, 170],
			[180, 170],
			[200, 150],
			[96, 180],
			[204, 180],
			[112, 130],
			[188, 130],
		])
			g += L(`M${x} ${y} l-6 10 M${x} ${y} l6 10 M${x} ${y} v12`, p.firL, 2.2);

		g += P("M124 110 C130 98 170 98 176 110 L182 192 L118 192 Z", p.bark);
		g += L(
			"M136 120 L134 150 M150 116 V140 M164 120 L166 156 M140 164 L138 186 M160 160 L162 186",
			p.barkD,
			2,
		);

		g +=
			C(150, 156, 10, p.gold) +
			`<circle cx="150" cy="156" r="10" fill="none" stroke="${INK}" stroke-width="2.6"/>` +
			L("M150 148 V164 M143 152 L150 158 L157 152", p.barkD, 2.2);

		g +=
			P(
				"M118 112 C100 118 92 140 92 166 L104 168 C106 148 112 132 124 124 Z",
				p.bark,
			) +
			P(
				"M84 168 C88 162 108 160 112 170 L106 182 L100 174 L96 186 L92 174 L86 182 Z",
				p.barkL,
				3,
			);
		g +=
			P(
				"M182 112 C204 112 222 100 230 90 L238 100 C230 116 210 128 186 128 Z",
				p.bark,
			) + E(234, 96, 9, 8, p.barkL, 3);
		g += P(
			"M118 100 C130 88 170 88 182 100 C176 112 124 112 118 100 Z",
			p.moss,
			3.4,
		);

		for (const [x, y] of [
			[56, 120],
			[70, 80],
			[252, 120],
			[264, 160],
			[40, 170],
		])
			g += C(x, y, 6, "#fff3a0", 0.4) + C(x, y, 2.6, "#fff8c8");
		g += lordHead(150, 94, 0.9, true);
		return g;
	}

	LGMon.add("snowwolf", {
		art: snowwolfArt,
		face: () => wolfHead(64, 72, 1.12, SW_P, "snarl"),
	});
	LGMon.add("conelet", {
		art: () => conelet(false),
		face: () =>
			G("translate(64,68) scale(0.7) translate(-150,-140)", conelet(true)),
	});
	LGMon.add("owl", {
		art: owlArt,
		face: () =>
			G("translate(64,68) scale(0.88) translate(-150,-114)", owlHead(true)),
	});
	LGMon.add("lynx", { art: lynxArt, face: () => lynxHead(64, 72, 1.0) });
	LGMon.add("wolverine", {
		art: wolverineArt,
		face: () => wolverineHead(64, 64, 1.2),
	});
	LGMon.add("trapper", {
		art: trapperArt,
		face: () => trapperHead(64, 72, 1.15),
	});
	LGMon.add("mosstroll", {
		art: mosstrollArt,
		face: () => trollHead(64, 70, 1.2),
	});
	LGMon.add("elk", { art: elkArt, face: () => elkFace(64, 72, 0.86) });
	LGMon.add("shatun", { art: shatunArt, face: () => shatunHead(64, 70, 1.15) });
	LGMon.add("volkhv", { art: volkhvArt, face: () => volkhvHead(64, 66, 0.98) });
	LGMon.add("wendigo", {
		art: wendigoArt,
		face: () => wendigoSkull(64, 60, 1.15, 0.66),
	});
	LGMon.add("cedarspirit", {
		art: cedarspiritArt,
		face: () => cedarHead(64, 74, 1.25),
	});
	LGMon.add("taigalord", {
		art: taigalordArt,
		face: () => lordHead(64, 68, 0.9, false),
	});
})();
