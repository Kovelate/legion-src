((root, factory) => {
	const api = factory();
	if (typeof module === "object" && module.exports) module.exports = api;
	if (typeof window !== "undefined") window.LGCityMonArt = api;
})(typeof self !== "undefined" ? self : this, () => {
	const ln = (c) =>
		`stroke="${c}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"`;
	const OUT = "#2a1f1a";

	const eyes = (pts, r = 2.6, col = "#1b1410", glow) =>
		`<g class="cm-ey">${pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${r + 1.4}" fill="${glow || "#fff8e6"}"/><circle cx="${x - 0.8}" cy="${y}" r="${r}" fill="${col}"/>`).join("")}</g>` +
		`<g class="cm-x">${pts.map(([x, y]) => `<path d="M${x - 3} ${y - 3}l6 6M${x + 3} ${y - 3}l-6 6" stroke="${col}" stroke-width="2" stroke-linecap="round"/>`).join("")}</g>`;
	const shadow = (w = 70, cx = 60) =>
		`<ellipse class="cm-sh" cx="${cx}" cy="96" rx="${w / 2}" ry="4.5" fill="#000" opacity=".22"/>`;
	const crown = (x, y, s = 1) =>
		`<g class="cm-crown" transform="translate(${x} ${y}) scale(${s})"><path d="M-11 4l-2-12 7 6 6-10 6 10 7-6-2 12z" fill="#ffd34d" ${ln("#7a5200")}/><circle cx="0" cy="-1" r="2" fill="#e5484d"/><circle cx="-7" cy="1" r="1.4" fill="#4d9de5"/><circle cx="7" cy="1" r="1.4" fill="#4d9de5"/></g>`;
	const legs = (xs, top, h, w, c) =>
		`<g class="cm-lg">${xs.map((x, i) => `<rect class="l${i % 2}" x="${x}" y="${top}" width="${w}" height="${h}" rx="${w / 2}" fill="${c}" ${ln(OUT)}/>`).join("")}</g>`;

	function quad(o) {
		const c = o.c,
			c2 = o.c2 || c,
			L = o.legH || 18,
			by = o.by || 58,
			bw = o.bw || 34,
			bh = o.bh || 20,
			hx = o.hx || 28,
			hy = o.hy || by - 8,
			hr = o.hr || 13;
		let s = shadow(o.sw || 78);
		s += legs(
			[60 - bw * 0.7, 60 - bw * 0.35, 60 + bw * 0.25, 60 + bw * 0.6].map(
				(x) => x - 3,
			),
			by + bh * 0.4,
			L + (96 - (by + bh * 0.4) - L),
			o.legW || 7,
			c2,
		);
		s += `<g class="cm-b">`;
		if (o.tail === "bush")
			s += `<path d="M${60 + bw - 4} ${by - 6} q18 -6 22 10 q-12 2 -22 -2z" fill="${c}" ${ln(OUT)}/>`;
		else if (o.tail === "curl")
			s += `<path d="M${60 + bw - 2} ${by - 4} q10 -8 6 4 q-4 6 -8 0" fill="none" ${ln(OUT)}/>`;
		else if (o.tail)
			s += `<path d="M${60 + bw - 3} ${by - 4} l12 -6" ${ln(OUT)}/>`;
		s += `<ellipse cx="60" cy="${by}" rx="${bw}" ry="${bh}" fill="${c}" ${ln(OUT)}/>`;
		s += `<ellipse cx="60" cy="${by + bh * 0.45}" rx="${bw * 0.7}" ry="${bh * 0.35}" fill="${c2}" opacity=".55"/>`;
		if (o.mane)
			s += `<path d="M${hx + 6} ${hy - hr + 2} ${Array.from({ length: 7 }, (_, i) => `l${4 + i * 0.3} ${i % 2 ? 6 : -7}`).join(" ")} L${60 + bw * 0.3} ${by - bh + 4} L${hx + 10} ${hy + 4}z" fill="${o.mane}" ${ln(OUT)}/>`;
		if (o.spots)
			s += [
				[50, by - 6],
				[66, by - 10],
				[74, by + 2],
				[58, by + 4],
			]
				.map(
					([x, y]) =>
						`<circle cx="${x}" cy="${y}" r="3.2" fill="${o.spots}" opacity=".8"/>`,
				)
				.join("");
		if (o.fur)
			s += `<path d="M${60 - bw + 6} ${by + bh - 4} ${Array.from({ length: 8 }, (_, i) => `l${bw * 0.22} ${i % 2 ? -5 : 5}`).join(" ")}" fill="none" ${ln(OUT)} opacity=".6"/>`;
		s += `<g class="cm-hd" style="transform-origin:${hx + 10}px ${hy}px">`;
		if (o.ears === "point")
			s += `<path d="M${hx + 2} ${hy - hr + 4} l2 -12 l7 9z M${hx + 9} ${hy - hr + 3} l4 -11 l5 10z" fill="${c}" ${ln(OUT)}/>`;
		if (o.ears === "round")
			s += `<circle cx="${hx + 2}" cy="${hy - hr + 2}" r="5" fill="${c}" ${ln(OUT)}/><circle cx="${hx + 13}" cy="${hy - hr + 1}" r="5" fill="${c}" ${ln(OUT)}/>`;
		s += `<circle cx="${hx + 4}" cy="${hy}" r="${hr}" fill="${c}" ${ln(OUT)}/>`;

		const sx = hx - hr * 0.6,
			sl = o.snout || 12;
		s += `<g class="cm-mo" style="transform-origin:${sx + 4}px ${hy + 5}px"><path d="M${sx + 4} ${hy + 3} l${-sl} 2 q-2 5 3 6 l${sl - 2} -1z" fill="${c2}" ${ln(OUT)}/>${o.teeth ? `<path d="M${sx - sl + 6} ${hy + 5} l2 3 l2 -3 l2 3 l2 -3" fill="#fff" stroke="${OUT}" stroke-width="1"/>` : ""}</g>`;
		s += `<path d="M${sx + 6} ${hy - 3} l${-sl - 2} 3 q-3 4 1 6 l${sl + 4} 0z" fill="${c}" ${ln(OUT)}/>`;
		if (o.nose === "pig")
			s += `<ellipse cx="${sx - sl + 1}" cy="${hy + 1.5}" rx="3" ry="4" fill="#d98a8a" ${ln(OUT)}/>`;
		else s += `<circle cx="${sx - sl + 1}" cy="${hy}" r="2.6" fill="${OUT}"/>`;
		if (o.tusk)
			s += `<path d="M${sx - sl * 0.4} ${hy + 4} q-5 -2 -6 -10 q4 4 9 6z" fill="#fff6dc" ${ln(OUT)}/>`;
		if (o.trunk)
			s += `<path d="M${sx - 2} ${hy} q-14 6 -10 30 q2 4 6 0 q-2 -18 8 -22z" fill="${c}" ${ln(OUT)}/>`;
		if (o.bigTusk)
			s += `<path d="M${sx + 2} ${hy + 8} q-22 6 -26 -10 q6 10 26 2z" fill="#fff6dc" ${ln(OUT)}/>`;
		if (o.horns === "goat")
			s += `<path d="M${hx + 8} ${hy - hr + 2} q10 -16 20 -6 q-9 -4 -15 9z" fill="#d9cbb0" ${ln(OUT)}/>`;
		if (o.beard)
			s += `<path d="M${sx + 2} ${hy + 8} l-2 10 l6 -8z" fill="${c2}" ${ln(OUT)}/>`;
		s += eyes([[hx + 1, hy - 4]], 2.6, "#1b1410", o.glow);
		if (o.brow) s += `<path d="M${hx - 4} ${hy - 9} l9 3" ${ln(OUT)}/>`;
		if (o.crown) s += crown(hx + 6, hy - hr - 4, 1.1);
		s += `</g></g>`;
		return s;
	}

	function biped(o) {
		const c = o.c,
			c2 = o.c2 || c,
			k = o.k || 1;
		const top = 96 - 70 * k,
			hy = top + 10 * k;
		let s = shadow(54 * k);
		s += `<g class="cm-lg"><rect class="l0" x="${60 - 12 * k}" y="${96 - 26 * k}" width="${9 * k}" height="${26 * k}" rx="${4 * k}" fill="${c2}" ${ln(OUT)}/><rect class="l1" x="${60 + 3 * k}" y="${96 - 26 * k}" width="${9 * k}" height="${26 * k}" rx="${4 * k}" fill="${c2}" ${ln(OUT)}/></g>`;
		s += `<g class="cm-b">`;
		s += `<path d="M${60 + 16 * k} ${top + 24 * k} q10 14 4 30" fill="none" stroke="${c}" stroke-width="${8 * k}" stroke-linecap="round"/>`;
		s += `<rect x="${60 - 18 * k}" y="${top + 16 * k}" width="${36 * k}" height="${38 * k}" rx="${14 * k}" fill="${c}" ${ln(OUT)}/>`;
		if (o.belly)
			s += `<ellipse cx="60" cy="${top + 40 * k}" rx="${11 * k}" ry="${11 * k}" fill="${o.belly}" opacity=".7"/>`;
		if (o.wrap)
			s += [0, 1, 2, 3, 4]
				.map(
					(i) =>
						`<path d="M${60 - 18 * k} ${top + (22 + i * 7) * k} l${36 * k} ${(i % 2 ? -4 : 4) * k}" stroke="#bfae8a" stroke-width="1.6" opacity=".9"/>`,
				)
				.join("");
		if (o.rock)
			s += `<path d="M${60 - 10 * k} ${top + 24 * k} l8 6 l-4 8 M${60 + 6 * k} ${top + 34 * k} l6 4 l-2 7" fill="none" stroke="${OUT}" stroke-width="1.6" opacity=".7"/>`;
		if (o.leaves)
			s += `<path d="M${60 - 16 * k} ${top + 18 * k} q-10 -6 -6 -16 q8 4 10 12z M${60 + 12 * k} ${top + 14 * k} q4 -12 14 -10 q-4 10 -12 12z" fill="${o.leaves}" ${ln(OUT)}/>`;
		if (o.fin)
			s += `<path d="M${60 + 14 * k} ${top + 18 * k} l14 -6 l-6 16z" fill="${o.fin}" ${ln(OUT)}/>`;

		s += `<g class="cm-hd" style="transform-origin:60px ${top + 20 * k}px">`;
		s += `<path d="M${60 - 10 * k} ${top + 24 * k} q-16 6 -18 22" fill="none" stroke="${c}" stroke-width="${8 * k}" stroke-linecap="round"/>`;
		if (o.club)
			s += `<path d="M${60 - 28 * k} ${top + 46 * k} l-6 -26 q4 -6 10 0 l2 26z" fill="${o.club}" ${ln(OUT)}/>`;
		if (o.claw)
			s += `<path d="M${60 - 30 * k} ${top + 46 * k} l-4 4 m6 -2 l-2 5 m6 -5 l0 5" stroke="${OUT}" stroke-width="1.8" stroke-linecap="round"/>`;
		s += `<circle cx="${60 - 4 * k}" cy="${hy + 6 * k}" r="${13 * k}" fill="${c}" ${ln(OUT)}/>`;
		if (o.hair)
			s += `<path d="M${60 - 16 * k} ${hy} q8 -14 22 -8 q-6 2 -4 8 q-8 -6 -18 0z" fill="${o.hair}" ${ln(OUT)}/>`;
		if (o.horns)
			s += `<path d="M${60 - 12 * k} ${hy - 2 * k} l-4 -12 l8 8z M${60 + 4 * k} ${hy - 4 * k} l2 -12 l5 10z" fill="#e8dcc0" ${ln(OUT)}/>`;
		s += `<g class="cm-mo" style="transform-origin:${60 - 10 * k}px ${hy + 12 * k}px"><path d="M${60 - 16 * k} ${hy + 11 * k} q6 5 12 0" fill="${o.mouth || "#5a1e1e"}" ${ln(OUT)}/>${o.fangs ? `<path d="M${60 - 14 * k} ${hy + 11 * k} l1.5 3 l1.5 -3 M${60 - 8 * k} ${hy + 11 * k} l1.5 3 l1.5 -3" stroke="#fff" stroke-width="1.4"/>` : ""}</g>`;
		s += eyes(
			[
				[60 - 12 * k, hy + 4 * k],
				[60 - 4 * k, hy + 3 * k],
			],
			2.2 * Math.min(1.2, k),
			"#1b1410",
			o.glow,
		);
		if (o.crown) s += crown(60 - 4 * k, hy - 12 * k, 1.1 * k);
		s += `</g></g>`;
		return s;
	}

	function bird(o) {
		const c = o.c,
			c2 = o.c2 || c;
		let s = shadow(44);
		s += `<g class="cm-lg"><path class="l0" d="M56 74 l-2 22 m0 0 l-5 0" ${ln("#c98a2a")} fill="none"/><path class="l1" d="M66 74 l2 22 m0 0 l-5 0" ${ln("#c98a2a")} fill="none"/></g>`;
		s += `<g class="cm-b"><path d="M84 54 l18 -6 l-4 10 l8 4 l-20 2z" fill="${c2}" ${ln(OUT)}/>`;
		s += `<ellipse cx="62" cy="60" rx="24" ry="17" fill="${c}" ${ln(OUT)}/>`;
		s += `<g class="cm-wing"><path d="M70 50 q20 -24 34 -16 q-8 4 -6 10 q-12 0 -26 18z" fill="${c2}" ${ln(OUT)}/></g>`;
		s += `<g class="cm-hd" style="transform-origin:46px 46px"><circle cx="42" cy="42" r="12" fill="${c}" ${ln(OUT)}/>`;
		if (o.hair)
			s += `<path d="M44 30 q12 -6 18 6 q4 12 -2 22 q-4 -14 -14 -18z" fill="${o.hair}" ${ln(OUT)}/>`;
		if (o.crest)
			s += `<path d="M44 30 l-2 -8 l5 6 l2 -8 l3 9z" fill="${o.crest}" ${ln(OUT)}/>`;
		s += `<g class="cm-mo" style="transform-origin:32px 46px"><path d="M33 45 l-12 3 l11 2z" fill="${o.beak || "#e3a33a"}" ${ln(OUT)}/></g>`;
		s += `<path d="M33 40 l-14 4 l14 2z" fill="${o.beak || "#e3a33a"}" ${ln(OUT)}/>`;
		s += eyes([[38, 39]], 2.4, "#1b1410", o.glow) + `</g></g>`;
		return s;
	}

	function blob(o) {
		const c = o.c,
			c2 = o.c2 || c;
		let s = shadow(66);
		s += `<g class="cm-lg">${o.frog ? `<path class="l0" d="M36 86 q-8 10 4 10 l10 0" fill="${c2}" ${ln(OUT)}/><path class="l1" d="M84 82 q14 6 4 14 l-12 0" fill="${c2}" ${ln(OUT)}/>` : ""}</g>`;
		s += `<g class="cm-b"><path d="M22 92 q-4 -40 38 -44 q40 4 38 44z" fill="${c}" ${ln(OUT)} ${o.alpha ? `fill-opacity="${o.alpha}"` : ""}/>`;
		if (o.shine)
			s += `<path d="M34 68 q4 -12 14 -14" stroke="#fff" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/>`;
		if (o.warts)
			s += [
				[70, 62],
				[80, 74],
				[58, 58],
			]
				.map(
					([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="${o.warts}"/>`,
				)
				.join("");
		if (o.ice)
			s += `<path d="M48 50 l4 -10 l4 10 M64 50 l6 -12 l2 12 M78 56 l6 -8 l0 10" fill="#e6f6ff" ${ln(OUT)}/>`;
		s += `<g class="cm-hd" style="transform-origin:40px 70px">`;
		s += `<g class="cm-mo" style="transform-origin:40px 76px"><path d="M24 76 q16 8 30 0 q-14 10 -30 0z" fill="#6b2030" ${ln(OUT)}/></g>`;
		s += eyes(
			o.frog
				? [
						[34, 52],
						[50, 50],
					]
				: [
						[36, 64],
						[50, 62],
					],
			3,
			"#1b1410",
			o.glow,
		);
		if (o.frog)
			s += `<path d="M28 50 q6 -10 12 0 M44 48 q6 -10 12 0" fill="none" ${ln(OUT)}/>`;
		s += `</g></g>`;
		return s;
	}

	function shroom(o) {
		let s = shadow(50);
		s += `<g class="cm-lg"><rect class="l0" x="50" y="80" width="7" height="16" rx="3" fill="#f2e6cc" ${ln(OUT)}/><rect class="l1" x="62" y="80" width="7" height="16" rx="3" fill="#f2e6cc" ${ln(OUT)}/></g>`;
		s += `<g class="cm-b"><rect x="46" y="52" width="28" height="32" rx="12" fill="#f2e6cc" ${ln(OUT)}/>`;
		s += `<g class="cm-hd" style="transform-origin:60px 54px"><path d="M26 56 q2 -34 34 -36 q32 2 34 36z" fill="${o.c}" ${ln(OUT)}/>`;
		s += [
			[40, 40],
			[58, 30],
			[74, 40],
			[50, 50],
			[84, 50],
		]
			.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#fff6e6"/>`)
			.join("");
		s += `<g class="cm-mo" style="transform-origin:52px 74px"><path d="M47 72 q5 4 10 0" fill="#5a1e1e" ${ln(OUT)}/></g>`;
		s +=
			eyes(
				[
					[51, 64],
					[61, 64],
				],
				2.2,
			) + `</g></g>`;
		return s;
	}

	function bug(o) {
		const c = o.c,
			c2 = o.c2 || c;
		let s = shadow(80);
		const L = o.kind === "crab" ? [34, 48, 72, 86] : [30, 42, 70, 84];
		s += `<g class="cm-lg">${L.map((x, i) => `<path class="l${i % 2}" d="M${x + (x < 60 ? 14 : -14)} 74 q${x < 60 ? -8 : 8} -16 ${x < 60 ? -14 : 14} -4 l${x < 60 ? -2 : 2} 26" fill="none" stroke="${c2}" stroke-width="4" stroke-linecap="round"/>`).join("")}</g>`;
		s += `<g class="cm-b">`;
		if (o.kind === "scorpion")
			s += `<path d="M78 70 q26 -4 26 -26 q0 -16 -14 -18 q-4 0 -4 4 l4 4 q8 4 4 14 q-4 12 -18 12z" fill="${c}" ${ln(OUT)}/><path d="M86 24 l-6 -6 l4 10z" fill="#e8e0d0" ${ln(OUT)}/>`;
		if (o.kind === "spider")
			s += `<ellipse cx="80" cy="64" rx="20" ry="17" fill="${c}" ${ln(OUT)}/><path d="M74 56 l12 0 l-6 10z" fill="#c2342e"/>`;
		if (o.kind === "crab")
			s += `<path d="M30 80 q-2 -32 30 -34 q32 2 30 34z" fill="${c}" ${ln(OUT)}/>`;
		else
			s += `<ellipse cx="56" cy="72" rx="20" ry="13" fill="${c}" ${ln(OUT)}/>`;
		if (o.shell)
			s += `<path d="M64 52 q30 -10 36 20 q-10 12 -30 6z" fill="${o.shell}" ${ln(OUT)}/><path d="M72 58 q12 2 18 14" fill="none" ${ln(OUT)}/>`;
		s += `<g class="cm-hd" style="transform-origin:44px 68px">`;
		if (o.kind !== "spider")
			s += `<g class="cm-mo" style="transform-origin:30px 64px"><path d="M34 66 q-16 -14 -24 -4 q4 2 8 0 q-2 6 4 8 q6 0 12 -4z" fill="${c2}" ${ln(OUT)}/></g>`;
		else
			s += `<g class="cm-mo" style="transform-origin:38px 74px"><path d="M38 72 l-6 8 m10 -8 l-2 9" stroke="${OUT}" stroke-width="2.4" stroke-linecap="round"/></g><circle cx="42" cy="66" r="11" fill="${c}" ${ln(OUT)}/>`;
		if (o.kind === "crab")
			s += `<path d="M48 48 l-4 -12 M58 46 l0 -12" ${ln(OUT)}/>`;
		const ey =
			o.kind === "spider"
				? [
						[37, 62],
						[43, 60],
						[47, 64],
					]
				: o.kind === "crab"
					? [
							[44, 35],
							[58, 33],
						]
					: [
							[42, 66],
							[48, 64],
						];
		s +=
			eyes(ey, o.kind === "spider" ? 1.8 : 2.4, "#1b1410", o.glow) + `</g></g>`;
		return s;
	}

	function worm(o) {
		const c = o.c,
			c2 = o.c2 || c;
		let s = shadow(84);
		s += `<g class="cm-lg"></g><g class="cm-b">`;
		if (o.ground)
			s += `<path d="M62 96 q-4 -8 6 -10 q14 -2 24 4 q10 4 8 6z" fill="${o.ground}" ${ln(OUT)}/>`;
		s += `<path d="M100 92 q8 -24 -14 -26 q-24 -2 -26 -20 q-2 -14 -20 -16" fill="none" stroke="${OUT}" stroke-width="${o.w + 4}" stroke-linecap="round"/>`;
		s += `<path d="M100 92 q8 -24 -14 -26 q-24 -2 -26 -20 q-2 -14 -20 -16" fill="none" stroke="${c}" stroke-width="${o.w}" stroke-linecap="round"/>`;
		s += `<path d="M98 88 q6 -18 -12 -18 q-20 -2 -24 -18" fill="none" stroke="${c2}" stroke-width="${o.w * 0.35}" stroke-linecap="round" opacity=".6"/>`;
		if (o.rings)
			s += [
				[90, 72],
				[76, 66],
				[64, 54],
			]
				.map(
					([x, y]) =>
						`<path d="M${x - 2} ${y - o.w / 2} q4 ${o.w / 2} 0 ${o.w}" stroke="${OUT}" stroke-width="1.4" fill="none" opacity=".6"/>`,
				)
				.join("");
		if (o.heads)
			s += [
				[74, 34, -20],
				[86, 44, -10],
			]
				.map(
					([x, y, r]) =>
						`<g transform="rotate(${r} ${x} ${y})"><path d="M${x + 14} 70 q-6 -20 0 -30" fill="none" stroke="${c}" stroke-width="${o.w * 0.7}" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="${o.w * 0.55}" fill="${c}" ${ln(OUT)}/><circle cx="${x - 3}" cy="${y - 2}" r="2" fill="${o.glow || "#ffe066"}"/></g>`,
				)
				.join("");
		if (o.fin)
			s += `<path d="M56 34 l8 -12 l4 14 l8 -8 l0 14z" fill="${o.fin}" ${ln(OUT)}/>`;
		s += `<g class="cm-hd" style="transform-origin:40px 32px"><circle cx="34" cy="30" r="${o.w * 0.75}" fill="${c}" ${ln(OUT)}/>`;
		if (o.sucker)
			s += `<g class="cm-mo" style="transform-origin:24px 32px"><circle cx="22" cy="32" r="6" fill="#7a2a3a" ${ln(OUT)}/><circle cx="22" cy="32" r="2.4" fill="#2a0a10"/></g>`;
		else
			s += `<g class="cm-mo" style="transform-origin:28px 36px"><path d="M30 34 l-14 4 q2 6 14 2z" fill="#6b2030" ${ln(OUT)}/>${o.teeth ? '<path d="M18 38 l2 -3 l2 3 l2 -3 l2 3" fill="#fff" stroke="#2a1f1a" stroke-width="1"/>' : ""}</g>`;
		s += eyes([[32, 25]], 2.4, "#1b1410", o.glow);
		if (o.crown) s += crown(36, 15, 1.1);
		s += `</g></g>`;
		return s;
	}

	const ART = {
		boar: () =>
			quad({
				c: "#8a5a3a",
				c2: "#5e3a24",
				tusk: 1,
				nose: "pig",
				mane: "#3e2618",
				ears: "point",
				legH: 14,
				tail: "curl",
				snout: 10,
				brow: 1,
			}),
		wolf: () =>
			quad({
				c: "#8e8e9a",
				c2: "#5d5d68",
				ears: "point",
				tail: "bush",
				snout: 15,
				teeth: 1,
				bh: 17,
				legW: 6,
				glow: "#ffe8a0",
			}),
		crow: () =>
			bird({ c: "#2f2f3d", c2: "#1d1d28", beak: "#5a5a62", glow: "#ff7a5a" }),
		bear: () =>
			quad({
				c: "#7a4e30",
				c2: "#54331d",
				ears: "round",
				bw: 38,
				bh: 25,
				by: 54,
				hr: 15,
				snout: 9,
				legW: 9,
				sw: 90,
				tail: 0,
				teeth: 1,
			}),
		spider: () =>
			bug({ kind: "spider", c: "#3d3546", c2: "#2a2430", glow: "#ff4d4d" }),
		shroom: () => shroom({ c: "#d63b32" }),
		goat: () =>
			quad({
				c: "#d8d0c0",
				c2: "#a89c86",
				horns: "goat",
				beard: 1,
				ears: "point",
				bh: 17,
				legW: 6,
				legH: 22,
				snout: 12,
				tail: 1,
			}),
		troll: () =>
			biped({
				c: "#7d8577",
				c2: "#5c6457",
				k: 1.1,
				rock: 1,
				club: "#7a5a3a",
				fangs: 1,
				belly: "#9aa08f",
			}),
		harpy: () =>
			bird({
				c: "#8a6aa8",
				c2: "#5d4478",
				hair: "#3a2650",
				beak: "#d9b25a",
				glow: "#ffe066",
			}),
		toad: () =>
			blob({ c: "#6f8f3a", c2: "#4f6a28", frog: 1, warts: "#8aaa4a" }),
		leech: () =>
			worm({ c: "#4e3a4a", c2: "#7a5a6a", w: 14, sucker: 1, rings: 1 }),
		drowner: () =>
			biped({
				c: "#5f8a82",
				c2: "#456860",
				hair: "#2e4a3a",
				claw: 1,
				fangs: 1,
				glow: "#d8ff9a",
				mouth: "#203a30",
			}),
		scorpion: () => bug({ kind: "scorpion", c: "#c08a3a", c2: "#8a5e22" }),
		sandworm: () =>
			worm({
				c: "#d9b06a",
				c2: "#a8803e",
				w: 18,
				teeth: 1,
				rings: 1,
				ground: "#e8cf8f",
			}),
		hyena: () =>
			quad({
				c: "#c8a36a",
				c2: "#8f7040",
				spots: "#6a4e2a",
				mane: "#5a4026",
				ears: "round",
				snout: 13,
				teeth: 1,
				tail: 1,
				bh: 17,
				legW: 6,
			}),
		snowwolf: () =>
			quad({
				c: "#e8eef6",
				c2: "#aab8c8",
				ears: "point",
				tail: "bush",
				snout: 15,
				teeth: 1,
				bh: 17,
				legW: 6,
				glow: "#9fe0ff",
			}),
		yeti: () =>
			biped({
				c: "#eef2f6",
				c2: "#c4ccd6",
				k: 1.1,
				hair: "#dfe6ee",
				fangs: 1,
				claw: 1,
				belly: "#c4d4e4",
				mouth: "#5a2a3a",
			}),
		iceslime: () =>
			blob({ c: "#8fd0f0", c2: "#5ea8d0", alpha: 0.85, shine: 1, ice: 1 }),
		crab: () => bug({ kind: "crab", c: "#d0563a", c2: "#a43a24" }),
		gull: () =>
			bird({ c: "#f2f2f2", c2: "#a8b0b8", beak: "#f2b33a", crest: "#c0c8d0" }),
		fishman: () =>
			biped({
				c: "#4a8aa8",
				c2: "#356a84",
				fin: "#2e5a78",
				belly: "#9ad0d8",
				glow: "#ffe066",
				fangs: 1,
			}),
		e_boar: () =>
			quad({
				c: "#5a3a2a",
				c2: "#3a2418",
				tusk: 1,
				bigTusk: 1,
				nose: "pig",
				mane: "#2a1810",
				ears: "point",
				bw: 40,
				bh: 24,
				by: 54,
				hr: 15,
				legH: 14,
				legW: 9,
				sw: 96,
				tail: "curl",
				crown: 1,
				glow: "#ff8a4a",
				brow: 1,
			}),
		e_leshy: () =>
			biped({
				c: "#6a5236",
				c2: "#4a3824",
				k: 1.25,
				leaves: "#5f9a3a",
				hair: "#4f8a2e",
				horns: 1,
				glow: "#b8ff6a",
				crown: 1,
				claw: 1,
			}),
		e_giant: () =>
			biped({
				c: "#8a8c90",
				c2: "#66686c",
				k: 1.3,
				rock: 1,
				club: "#5c5e62",
				glow: "#7ae0ff",
				crown: 1,
			}),
		e_hydra: () =>
			worm({
				c: "#3f6a3a",
				c2: "#2c4c28",
				w: 18,
				heads: 1,
				teeth: 1,
				glow: "#ffe066",
				fin: "#2f5a2a",
				crown: 1,
			}),
		e_pharaoh: () =>
			biped({
				c: "#d8c8a0",
				c2: "#b0a078",
				k: 1.2,
				wrap: 1,
				glow: "#4dffd2",
				crown: 1,
				mouth: "#3a2a1a",
			}),
		e_mammoth: () =>
			quad({
				c: "#7a5a46",
				c2: "#523a2a",
				fur: 1,
				trunk: 1,
				bigTusk: 1,
				ears: "round",
				bw: 42,
				bh: 26,
				by: 52,
				hr: 17,
				legW: 11,
				legH: 16,
				sw: 100,
				snout: 4,
				crown: 1,
				glow: "#9fe0ff",
			}),
		e_serpent: () =>
			worm({
				c: "#2e6a8a",
				c2: "#1e4a64",
				w: 20,
				fin: "#5ab0c8",
				teeth: 1,
				glow: "#ffe066",
				crown: 1,
			}),
	};
	const IDS = Object.freeze(Object.keys(ART));

	function fig(id, o = {}) {
		const f = ART[id] || ART.boar,
			el = /^e_/.test(id);
		return `<svg class="cm-svg${el ? " cm-elite" : ""}${o.cls ? " " + o.cls : ""}" viewBox="0 0 120 100" overflow="visible" aria-hidden="true">${el ? '<ellipse class="cm-aura" cx="60" cy="62" rx="56" ry="40"/>' : ""}<ellipse class="cm-sh2" cx="60" cy="96" rx="34" ry="4.5" fill="#000" opacity="0"/><g class="cm-all">${f()}</g></svg>`;
	}
	return { fig, IDS };
});

(() => {
	if (window.LGCityMon) return;

	if (!document.querySelector("link[data-cm]")) {
		const l = document.createElement("link");
		l.rel = "stylesheet";
		l.href = `/site/citymon.css?v=${(window.LG_SITEF || {})["citymon.css"] || ""}`;
		l.dataset.cm = "1";
		document.head.appendChild(l);
	}
	const esc = (s) =>
		String(s == null ? "" : s).replace(
			/[&<>"']/g,
			(c) =>
				({
					"&": "&amp;",
					"<": "&lt;",
					">": "&gt;",
					'"': "&quot;",
					"'": "&#39;",
				})[c],
		);
	const ART = () => window.LGCityMonArt;
	const fig = (id, cls) => (ART() ? ART().fig(id, cls ? { cls } : {}) : "");
	const RM = () => {
		try {
			return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		} catch (e) {
			return false;
		}
	};
	const plural = (n, a, b, c) => {
		const m = n % 10,
			h = n % 100;
		return m === 1 && h !== 11
			? a
			: m >= 2 && m <= 4 && (h < 10 || h >= 20)
				? b
				: c;
	};
	const ROLE_RU = {
		legionary: "Легионер",
		paladin: "Паладин",
		rogue: "Разбойник",
		archer: "Лучник",
		mage: "Маг",
		priest: "Жрец",
		necromancer: "Некромант",
		recruit: "Новобранец",
	};
	const S = {
		W: null,
		X: null,
		layer: null,
		view: null,
		at: 0,
		key: "",
		busy: false,
		dlg: null,
		walkT: 0,
		back: null,
		retryAt: 0,
		vt: null,
	};
	const hero = () => {
		try {
			return S.X && S.X.hero ? S.X.hero() : null;
		} catch (e) {
			return null;
		}
	};

	function cityX() {
		if (!(S.X && S.X.api)) {
			try {
				const W =
					window.LGCity && window.LGCity.wall ? window.LGCity.wall() : null;
				if (W && W.X) S.X = W.X;
			} catch (e) {}
		}
		return !!(S.X && S.X.api);
	}

	const NET = { ok: false, error: "Нет связи - попробуй ещё раз" };
	const api = (p, b) =>
		cityX()
			? S.X.api(p, b)
			: fetch((window.LG_BASE || "") + p, {
					credentials: "same-origin",
					...(b
						? {
								method: "POST",
								headers: { "content-type": "application/json" },
								body: JSON.stringify(b),
							}
						: {}),
				}).then(
					(r) =>
						r
							.json()
							.then((x) =>
								window.LGSiteUi && window.LGSiteUi.withCode
									? window.LGSiteUi.withCode(x)
									: x,
							)
							.catch(() => ({ ok: false, error: "не вышло" })),
					() => NET,
				);
	const toast = (t, bad) => {
		try {
			if (S.X && S.X.toast) S.X.toast(t, bad);
		} catch (e) {}
	};

	const respT = (m) => {
		const v = Math.max(0, Math.round((m == null ? 0.25 : +m) * 60)),
			mm = Math.floor(v / 60),
			ss = v % 60;
		return mm ? `${mm} мин${ss ? ` ${ss} с` : ""}` : `${ss} с`;
	};
	const left = (ms) => {
		const m = Math.max(1, Math.round(ms / 60000)),
			h = Math.floor(m / 60);
		return h ? `${h} ч ${m % 60} мин` : `${m} мин`;
	};
	const rwText = (r) =>
		r
			? [
					r.coins
						? `${r.coins} ${plural(r.coins, "монета", "монеты", "монет")}`
						: "",
					r.xp ? `${r.xp} опыта` : "",
					r.item ? "трофей" : "",
				]
					.filter(Boolean)
					.join(", ")
			: "";

	function wallOf() {
		try {
			return window.LGCity && window.LGCity.wall ? window.LGCity.wall() : null;
		} catch (e) {
			return null;
		}
	}
	function drop() {
		if (S.layer) S.layer.remove();
		S.layer = null;
		S.key = "";
		clearInterval(S.walkT);
		S.walkT = 0;
		S.walk = null;
		if (S.io) {
			S.io.disconnect();
			S.io = null;
		}
		const b = document.querySelector(".cm-badge");
		if (b) b.remove();
	}

	function offWatch(L) {
		if (S.io) S.io.disconnect();
		S.io = null;
		if (typeof IntersectionObserver !== "function") return;
		S.io = new IntersectionObserver(
			(es) => {
				for (const e of es)
					e.target.classList.toggle("cm-off", !e.isIntersecting);
			},
			{ rootMargin: "160px" },
		);
		for (const b of L.querySelectorAll(".cmw")) {
			b.classList.add("cm-off");
			S.io.observe(b);
		}
	}

	const srvNow = () =>
		S.view && S.view.now
			? S.view.now + (Date.now() - S.at)
			: typeof window.LGGameNow === "function"
				? window.LGGameNow()
				: Date.now();

	const townNow = () => {
		const W = S.W || wallOf();
		return W && W.town ? String(W.town) : "";
	};

	const cmTtl = () =>
		window.LGPushOn && window.LGPushOn("citymon") ? 300000 : 60000;
	async function load(force, sv) {
		if (S.busy) {
			if (sv) S.again = sv;
			return S.view;
		}
		if (!force && S.view && Date.now() - S.at < cmTtl() && S.vt === townNow())
			return S.view;
		S.busy = true;
		try {
			const t = townNow(),
				qs = [
					t ? "town=" + encodeURIComponent(t) : "",
					sv ? "sv=" + encodeURIComponent(sv) : "",
				]
					.filter(Boolean)
					.join("&");
			const r = await api("/api/citymon" + (qs ? "?" + qs : ""));
			if (r && r.ok) {
				S.view = r;
				S.vt = t;
				S.at = Date.now();
				if (S.back) S.back.reset();
				S.retryAt = 0;
			} else if (r && r.closed) {
				S.view = null;
				S.at = Date.now();
			} else {
				const U = window.LGSiteUi;
				if (!S.back)
					S.back =
						U && U.backoff
							? U.backoff({ steps: [5000, 10000, 30000, 60000], jitter: 0.5 })
							: { next: () => 30000, reset() {} };
				S.retryAt =
					Date.now() + Math.max(S.back.next(), U && U.hold ? U.hold.left() : 0);
			}
		} finally {
			S.busy = false;
		}
		if (S.again) {
			const v = S.again;
			S.again = 0;
			return load(true, v);
		}
		return S.view;
	}
	window.addEventListener("lg-snap", (e) => {
		const d = e.detail;
		if (!d || d.n !== "citymon" || document.hidden || !S.W) return;
		void load(true, String(d.v || Date.now()))
			.then(() => draw())
			.catch((er) => console.warn("[монстры у стен] толчок", er));
	});

	const FORM = {
		1: [[0, 0]],
		2: [
			[-52, -6],
			[52, 8],
		],
		3: [
			[-80, -10],
			[0, 14],
			[80, -8],
		],
		4: [
			[-74, -20],
			[24, -24],
			[-30, 20],
			[70, 16],
		],
	};

	function spotsBy(W) {
		const SP = (W.glade && W.glade.spots) || [],
			g = W.glade || {},
			gx = g.cx != null ? g.cx : W.x,
			gy = g.y0 != null ? g.y0 : W.y,
			by = {};
		SP.forEach((p, k) => {
			(by[p.t] = by[p.t] || []).push([p, k]);
		});
		for (const t of Object.keys(by))
			by[t].sort(
				(a, b) =>
					Math.hypot(a[0].x - gx, a[0].y - gy) -
					Math.hypot(b[0].x - gx, b[0].y - gy),
			);
		return { SP, by };
	}
	function placeAll(W, packs, elites, soon = [], eSoon = []) {
		const { SP, by } = spotsBy(W),
			used = new Set(),
			out = { packs: [], elites: [], soon: [], free: [] };

		if (window.__cmAllSpots && SP.length && packs.length) {
			SP.forEach((p, k) => {
				if (p.t === "e") {
					if (elites.length)
						out.elites.push({ E: elites[k % elites.length], p, k });
				} else
					out.packs.push({
						D: {
							...(packs.find((x) => x.tier === p.t) || packs[k % packs.length]),
							pid: (packs.find((x) => x.tier === p.t) || packs[0]).pid,
						},
						p,
						k,
					});
			});
			return out;
		}

		const pick = (t, D) => {
			const L = by[t] || [];
			if (!L.length) return null;
			const n = D.n || 1,
				own = String(t) === String(D.tier);
			const s0 =
				n >= L.length && D.idx != null
					? D.idx
					: own && D.tier === 2 && D.idx != null
						? L.length - n + D.idx
						: D.slot || 0;
			for (let j = 0; j < L.length; j++) {
				const [p, k] = L[(s0 + j) % L.length];
				if (!used.has(k)) {
					used.add(k);
					return { p, k };
				}
			}
			return null;
		};
		const rest = [];
		packs.forEach((D, i) => {
			const q = pick(D.tier, D);
			if (q) out.packs.push({ D, ...q });
			else rest.push([D, i]);
		});
		rest.forEach(([D, i]) => {
			const q = pick(1, D) ||
				pick(2, D) ||
				pick(0, D) || {
					p: {
						x: W.x + 40 + (i - (packs.length - 1) / 2) * 340,
						y: W.y + 170,
						over: [],
					},
					k: -1,
				};
			out.packs.push({ D, ...q });
		});
		elites.forEach((E, i) => {
			const q = pick("e", { slot: i, ...E }) || {
				p: { x: W.x - 300 - i * 190, y: W.y + 196, over: [] },
				k: -1,
			};
			out.elites.push({ E, ...q });
		});
		soon.forEach((D) => {
			const q = pick(D.tier, D) || pick(1, D) || pick(2, D);
			if (q) out.soon.push({ D, ...q });
		});
		eSoon.forEach((D, i) => {
			const q = pick("e", { slot: i, ...D });
			if (q) out.soon.push({ D: { ...D, el: 1 }, ...q });
		});
		SP.forEach((p, k) => {
			if (!used.has(k)) out.free.push({ p, k });
		});
		return out;
	}
	const zOf = (y) => Math.max(1, Math.round(y));
	const TIER_RU = ["слабая", "обычная", "сильная"];

	const SKULL =
		'<svg class="cm-sk" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><path fill="currentColor" fill-rule="evenodd" stroke="#2b1d18" stroke-width="1" stroke-linejoin="round" d="M8 1.2C4.3 1.2 1.8 3.7 1.8 6.9c0 1.9.9 3.4 2.3 4.3v2.1c0 .8.6 1.5 1.4 1.5h5c.8 0 1.4-.7 1.4-1.5v-2.1c1.4-.9 2.3-2.4 2.3-4.3 0-3.2-2.5-5.7-6.2-5.7ZM5.5 5.9a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 1 0 0-3.2Zm5 0a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 1 0 0-3.2ZM8 9.6l-1 1.6h2Z"/><path d="M6.5 12.4v2.2M8 12.4v2.2M9.5 12.4v2.2" stroke="#2b1d18" stroke-width=".9"/></svg>';
	const skulls = (t, label) =>
		`<span class="cm-sks" role="img" aria-label="${esc(label || ["слабая", "обычная", "сильная", "очень сильная"][t] || "")}">${SKULL.repeat(Math.max(1, t + 1))}</span>`;

	const INK = "#2b1d18";
	const NAT_SPOTS = [
		[2262, 3116],
		[2420, 3236],
		[2640, 3150],
		[2716, 3226],
		[3006, 3226],
		[3236, 3236],
		[3380, 3132],
		[3470, 3214],
		[2560, 3092],
		[3330, 3060],
	];
	const NAT = {
		meadow: (x, y, i) =>
			i % 2
				? `<path d="M${x - 12} ${y} l4 -14 M${x} ${y} l0 -18 M${x + 12} ${y} l-4 -14" stroke="#c9b25a" stroke-width="4" stroke-linecap="round"/>`
				: ["#fff4e0", "#ffd0dc", "#ffe27a"]
						.map(
							(c, k) =>
								`<circle cx="${x - 12 + k * 12}" cy="${y - 4 - (k % 2) * 6}" r="5" fill="${c}" stroke="${INK}" stroke-width="1.8"/>`,
						)
						.join(""),
		forest: (x, y, i) =>
			i % 2
				? `<path d="M${x - 16} ${y} q-10 -22 4 -34 M${x} ${y} q0 -26 12 -36 M${x + 14} ${y} q10 -18 2 -30" fill="none" stroke="#3f7a3a" stroke-width="6" stroke-linecap="round"/>`
				: `<rect x="${x - 4}" y="${y - 14}" width="8" height="14" rx="3" fill="#f3ead6" stroke="${INK}" stroke-width="2"/><path d="M${x - 14} ${y - 12} q14 -20 28 0 z" fill="#d9483b" stroke="${INK}" stroke-width="2.2"/><circle cx="${x - 3}" cy="${y - 18}" r="2.4" fill="#fff"/>`,
		mount: (x, y, i) =>
			`<path d="M${x - 26 + (i % 3) * 4} ${y} q-2 -22 18 -26 q22 -2 30 18 q2 8 -6 8 z" fill="#a39890" stroke="${INK}" stroke-width="2.6"/><path d="M${x - 8} ${y - 16} q8 -6 16 -2" stroke="#c2b8b0" stroke-width="4" fill="none" stroke-linecap="round"/>${i % 2 ? `<ellipse cx="${x + 30}" cy="${y - 2}" rx="8" ry="5" fill="#82766f" stroke="${INK}" stroke-width="2"/>` : ""}`,
		swamp: (x, y, i) =>
			i % 2
				? `<path d="M${x - 40} ${y - 6} q10 -14 40 -12 q34 0 38 12 q-8 10 -40 10 q-32 0 -38 -10 z" fill="#4a7563" stroke="#3a5a3a" stroke-width="3" opacity=".9"/><path d="M${x - 18} ${y - 8} q14 -4 28 0" stroke="#8fb8a4" stroke-width="3" fill="none" stroke-linecap="round"/>`
				: `<path d="M${x - 8} ${y} q-4 -26 -2 -44 M${x} ${y} q2 -30 0 -52 M${x + 8} ${y} q6 -22 4 -40" fill="none" stroke="#5f7a3a" stroke-width="4" stroke-linecap="round"/><rect x="${x - 3}" y="${y - 62}" width="7" height="16" rx="3" fill="#7a4a2a" stroke="${INK}" stroke-width="1.6"/>`,
		desert: (x, y, i) =>
			i % 3 === 2
				? `<path d="M${x} ${y} v-34 q0 -8 7 -8 q7 0 7 8 v34 z M${x} ${y - 18} h-8 v-10 q0 -5 4 -5 q4 0 4 5" fill="#7fa04a" stroke="${INK}" stroke-width="2.4"/>`
				: `<path d="M${x - 46} ${y} q20 -16 46 -14 q30 2 46 14 z" fill="#f2dcaa" opacity=".9"/><path d="M${x - 30} ${y - 4} q16 -6 30 -4" stroke="#d4b072" stroke-width="3" fill="none" stroke-linecap="round"/>`,
		ice: (x, y, i) =>
			i % 3 === 2
				? `<path d="M${x - 10} ${y} l4 -26 l6 10 l4 -18 l6 34 z" fill="#d4f0fa" stroke="#6aa8c6" stroke-width="2.4" stroke-linejoin="round"/>`
				: `<path d="M${x - 50} ${y} q8 -18 34 -18 q14 -10 32 -2 q22 2 34 20 z" fill="#f4f9fc" stroke="#a6c4d6" stroke-width="3" stroke-linejoin="round"/><path d="M${x - 24} ${y - 8} q18 -6 34 -2" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>`,
		coast: (x, y, i) =>
			i % 2
				? `<path d="M${x - 40} ${y} q16 -14 40 -12 q28 2 40 12 z" fill="#f0dba6" opacity=".9"/><path d="M${x - 6} ${y - 6} l6 -10 l6 10 l10 2 l-8 6 l2 10 l-10 -6 l-10 6 l2 -10 l-8 -6 z" fill="#ff9a6a" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`
				: `<path d="M${x - 12} ${y} q0 -16 12 -18 q12 2 12 18 z" fill="#ffe0d0" stroke="${INK}" stroke-width="2"/><path d="M${x - 6} ${y - 2} l4 -12 M${x + 6} ${y - 2} l-4 -12" stroke="${INK}" stroke-width="1.4"/><path d="M${x + 18} ${y} l40 -8" stroke="#a07a4a" stroke-width="7" stroke-linecap="round"/>`,
	};
	const NAT_OF = { taiga: "ice", ash: "mount", blight: "swamp", ruin: "mount" };

	const NAT_AT = [
		[-120, 6],
		[118, 10],
		[-8, 34],
	];
	function natSvg(p, bio, k) {
		const f = NAT[bio] || NAT[NAT_OF[bio]] || NAT.meadow,
			x0 = p.x - 180,
			y0 = p.y - 80,
			w = 360,
			h = 130;
		return `<svg class="cm-nat" data-bio="${esc(bio || "")}" style="left:${x0}px;top:${y0}px" width="${w}" height="${h}" viewBox="${x0} ${y0} ${w} ${h}" aria-hidden="true">${NAT_AT.map(([dx, dy], i) => f(p.x + dx, p.y + dy, i + k)).join("")}</svg>`;
	}

	const overSvg = (p) =>
		(p.over || [])
			.map((t) => {
				const [a, b, c, d] = t.box;
				return `<svg class="cm-over" data-k="${esc(t.k)}" style="left:${a}px;top:${b}px;z-index:${zOf(t.y)}" width="${c - a}" height="${d - b}" viewBox="${a} ${b} ${c - a} ${d - b}" aria-hidden="true">${t.svg}</svg>`;
			})
			.join("");

	function trailSvg(p, k, bio) {
		const x0 = p.x - 160,
			y0 = p.y - 70,
			w = 320,
			h = 120,
			R = (i) => ((k * 7 + i * 13) % 10) / 10;
		const paw = (x, y, a) =>
			`<g transform="translate(${x} ${y}) rotate(${a})" fill="#5a4630" opacity=".42"><ellipse cx="0" cy="0" rx="6" ry="5"/><circle cx="-6" cy="-7" r="2.4"/><circle cx="0" cy="-9" r="2.4"/><circle cx="6" cy="-7" r="2.4"/></g>`;
		let g = "";
		for (let i = 0; i < 6; i++)
			g += paw(
				p.x - 110 + i * 42,
				p.y + 10 + (i % 2 ? 12 : -4) + R(i) * 6,
				70 + R(i + 3) * 30,
			);
		for (let i = 0; i < 3; i++) {
			const x = p.x - 70 + i * 66 + R(i) * 20,
				y = p.y - 18 + R(i + 1) * 30;
			g += `<path d="M${x - 14} ${y} q10 -4 22 -10 M${x - 6} ${y + 2} q12 -2 24 -6 M${x + 2} ${y + 4} q10 0 20 -2" stroke="#8a9a4a" stroke-width="3.2" fill="none" stroke-linecap="round" opacity=".7"/>`;
		}
		return `<svg class="cm-nat cm-trail" data-spot="${k}" data-bio="${esc(bio || "")}" style="left:${x0}px;top:${y0}px" width="${w}" height="${h}" viewBox="${x0} ${y0} ${w} ${h}" aria-hidden="true">${g}</svg>`;
	}
	const retLeft = (at) => Math.max(0, at - srvNow());
	const retText = (D) =>
		`${D.el ? "Элитный вернётся" : "Вернутся"} через <b>${mmss(retLeft(D.at))}</b>`;
	function retTick() {
		if (S.layer)
			for (const t of S.layer.querySelectorAll(".cm-ret[data-at]")) {
				const b = t.querySelector("b"),
					v = mmss(retLeft(+t.dataset.at));
				if (b && b.textContent !== v) b.textContent = v;
			}
	}

	function walkBox(p, half, elite) {
		const rx = p.rx || (p.gate ? 150 : 170),
			dx = Math.max(
				24,
				Math.min(elite ? 60 : 70, rx - half - (elite ? 130 : 90)),
			);
		return p.gate ? [dx, -8, 8] : [dx, -22, 20];
	}
	function walkStart(L, PL) {
		S.walk = [];
		if (RM()) return;
		const T0 = performance.now(),
			grp = (sel, tagSel, p, half, elite) => {
				const els = [...L.querySelectorAll(sel)].map((b) => ({
					b,
					x: +b.dataset.x,
					y: +b.dataset.y,
				}));
				if (!els.length) return;
				S.walk.push({
					els,
					tag: L.querySelector(tagSel),
					box: walkBox(p, half, elite),
					v: elite ? 24 : 32,
					x: 0,
					y: 0,
					moving: 0,
					next: T0 + 400 + Math.random() * 2600,
				});
			};
		for (const { D, p } of PL.packs) {
			const F = FORM[Math.min(4, D.pack.length)] || FORM[4];
			grp(
				`.cmw[data-pid="${CSS.escape(D.pid)}"]`,
				`.cm-tag[data-pid="${CSS.escape(D.pid)}"]`,
				p,
				Math.max(...F.map((f) => Math.abs(f[0]))) + 56,
				false,
			);
		}
		for (const { E, p } of PL.elites) {
			const k = E.epid || E.eid;
			grp(
				`.cmw.el[data-eid="${CSS.escape(k)}"]`,
				`.cm-tag[data-eid="${CSS.escape(k)}"]`,
				p,
				90,
				true,
			);
		}
		if (S.walk.length) S.walkT = setInterval(walkStep, 400);
	}
	function walkStep() {
		if (document.hidden || !S.layer || !S.walk) return;
		const t = performance.now();
		for (const G of S.walk) {
			if (G.moving && t >= G.moving) {
				G.moving = 0;
				for (const e of G.els) e.b.classList.remove("mv");
				G.next = t + 1500 + Math.random() * 3500;
			}
			if (!G.moving && t >= G.next) {
				if (G.els.every((e) => e.b.classList.contains("cm-off"))) {
					G.next = t + 1500;
					continue;
				}
				walkGo(G, t);
			}
		}
	}
	function walkGo(G, t) {
		if (
			G.els.some((e) => e.b.matches(":hover, :focus-visible")) ||
			(G.tag && G.tag.matches(":hover, :focus-visible"))
		) {
			G.next = t + 1500;
			return;
		}
		const [bx, y0, y1] = G.box;
		let nx = (Math.random() * 2 - 1) * bx;
		if (Math.abs(nx - G.x) < 18)
			nx =
				G.x > 0
					? G.x - 18 - Math.random() * bx * 0.6
					: G.x + 18 + Math.random() * bx * 0.6;
		nx = Math.max(-bx, Math.min(bx, nx));
		const ny = y0 + Math.random() * (y1 - y0),
			d = Math.hypot(nx - G.x, ny - G.y),
			dur = Math.max(0.8, Math.min(3.2, d / G.v)),
			right = nx > G.x;
		for (const e of G.els) {
			const x = e.x + nx,
				y = e.y + ny;
			e.b.classList.toggle("flip", right);
			e.b.classList.add("mv");
			e.b.style.transition = `transform ${dur.toFixed(2)}s linear ${(Math.random() * 0.25).toFixed(2)}s`;
			e.b.style.transform = `translate(${Math.round(x)}px,${Math.round(y)}px)`;
			e.b.style.zIndex = zOf(y);
		}
		if (G.tag) {
			G.tag.style.transition = `transform ${dur.toFixed(2)}s linear`;
			G.tag.style.transform = `translateX(calc(-50% + ${Math.round(nx)}px))`;
		}
		G.x = nx;
		G.y = ny;
		G.moving = t + (dur + 0.3) * 1000;
	}
	function draw() {
		const W = S.W,
			V = S.view;
		if (!W || !V) {
			drop();
			return;
		}
		const packs =
				V.packs ||
				(V.pack
					? [
							{
								pid: V.pid || "",
								tier: 1,
								slot: 0,
								lvl: V.hero && V.hero.level,
								pack: V.pack,
								power: V.power,
								reward: V.reward,
							},
						]
					: []),
			el = V.elites || [];
		const soon = V.daily && (V.ft || V.daily.left > 0) ? V.soon || [] : [],
			eSoon = V.eSoon || [];
		const key = `${W.town}|${V.biome || ""}|${W.glade ? "g" : ""}|${V.daily.n}|${packs.map((P) => P.pid + ":" + P.lvl + ":" + P.pack.map((m) => m.mon).join(",")).join(";")}|${el.map((e) => e.epid || e.eid).join(",")}|${(V.lobby && V.lobby.id) || ""}|${[...soon, ...eSoon].map((x) => x.line + "@" + x.at).join(",")}`;
		if (
			S.layer &&
			S.layer.isConnected &&
			S.layer.parentNode === W.cam &&
			key === S.key
		) {
			retTick();
			badge(W);
			return;
		}
		drop();
		S.key = key;
		const L = document.createElement("div");
		L.className = "cm-wall";
		L.setAttribute("aria-label", "Монстры у стен");
		if (W.glade) L.dataset.glade = "1";
		const PL = placeAll(W, packs, el, soon, eSoon);
		S.spots = [];
		let h = "";
		const overs = new Set();
		PL.packs.forEach(({ D, p, k: sk }, k) => {
			const F = FORM[Math.min(4, D.pack.length)] || FORM[4];
			h += natSvg(p, V.biome, k);
			h += D.pack
				.map((m, i) => {
					const x = p.x + F[i][0],
						y = p.y + F[i][1];
					return `<button type="button" class="cmw t${D.tier}" data-cm="pack" data-pid="${esc(D.pid)}" data-spot="${sk}" data-x="${x}" data-y="${y}" style="transform:translate(${x}px,${y}px);z-index:${zOf(y)}" title="${esc(m.name)} - напасть?" aria-label="${esc(m.name)}, ${TIER_RU[D.tier] || ""} стая у стен, ${D.lvl} ур. - напасть?"><span class="cm-br">${fig(m.mon)}</span></button>`;
				})
				.join("");
			h += `<button type="button" class="cm-tag t${D.tier}" data-cm="pack" data-pid="${esc(D.pid)}" data-spot="${sk}" style="left:${p.x}px;top:${p.y - 152}px" title="Стая: ${TIER_RU[D.tier] || ""}, ${D.lvl} ур.${D.power ? ", сила " + D.power : ""}"><i>${skulls(D.tier)}</i> ${D.lvl} ур.</button>`;
			overs.add(p);
			S.spots.push({ x: p.x, y: p.y - 60, pid: D.pid });
		});
		if (!packs.length && V.hero && !PL.soon.some((x) => !x.D.el)) {
			const T = (W.glade &&
				W.glade.spots &&
				W.glade.spots.find((x) => x.gate)) || { x: W.x + 260, y: W.y + 200 };

			h +=
				(V.ft || V.daily.left > 0) && (V.soon || []).length
					? `<div class="cm-tag gone back" role="status" style="left:${T.x}px;top:${T.y - 150}px">Новая стая придёт через ${esc(mmss(nextBack()))}</div>`
					: `<div class="cm-tag gone" role="status" style="left:${T.x}px;top:${T.y - 150}px">Монстры ушли · следующие придут через ${esc(left(V.daily.next - srvNow()))}</div>`;
		}
		PL.elites.forEach(({ E, p, k: sk }) => {
			h += natSvg(p, V.biome, 1);
			const eKey = E.epid || E.eid,
				et = E.tier == null ? 1 : E.tier;
			h += `<button type="button" class="cmw el" data-cm="elite" data-eid="${esc(eKey)}" data-spot="${sk}" data-x="${p.x}" data-y="${p.y}" style="transform:translate(${p.x}px,${p.y}px);z-index:${zOf(p.y)}" title="${esc(E.name)} (элитный)" aria-label="${esc(E.name)}, элитный монстр у стен"><span class="cm-br">${fig(E.eid)}</span></button>`;
			h += `<button type="button" class="cm-tag te" data-cm="elite" data-eid="${esc(eKey)}" data-spot="${sk}" style="left:${p.x}px;top:${p.y - 196}px" title="Элитный ${E.tier != null ? (et ? "посложнее" : "попроще") : ""}${E.lvl ? ", " + E.lvl + " ур." : ""}">Элитный${E.tier != null ? ` <i>${skulls(et + 1, et ? "посложнее" : "попроще")}</i>` : ""}${E.lvl ? ` ${E.lvl} ур.` : ""}</button>`;
			overs.add(p);
			S.spots.push({ x: p.x, y: p.y - 70, eid: eKey });
		});

		PL.soon.forEach(({ D, p, k }) => {
			h += trailSvg(p, k, V.biome);
			h += `<div class="cm-tag cm-ret${D.el ? " te" : ` t${D.tier}`}" role="status" data-spot="${k}" data-at="${D.at}" data-el="${D.el ? 1 : ""}" style="left:${p.x}px;top:${p.y - (D.el ? 150 : 120)}px">${retText(D)}</div>`;
		});
		PL.free.forEach(({ p, k }) => {
			h += trailSvg(p, k, V.biome);
		});
		for (const p of overs) h += overSvg(p);
		L.innerHTML = h;
		W.cam.appendChild(L);
		S.layer = L;
		L.addEventListener("click", (ev) => {
			const b = ev.target.closest("[data-cm]");
			if (!b) return;
			ev.stopPropagation();
			if (b.dataset.cm === "pack") attackDlg(b.dataset.pid);
			else eliteDlg(b.dataset.eid);
		});

		L.addEventListener("pointerdown", (ev) => {
			if (ev.target.closest("[data-cm]")) ev.stopPropagation();
		});
		walkStart(L, PL);
		offWatch(L);
		badge(W);
	}

	function badge(W) {
		const hud =
			W.cam && W.cam.closest
				? (W.cam.closest(".cy") || document).querySelector(".cy-hud")
				: null;
		let b = document.querySelector(".cm-badge");
		if (!hud) {
			if (b) b.remove();
			return;
		}
		if (!b || b.parentNode !== hud) {
			if (b) b.remove();
			b = document.createElement("button");
			b.type = "button";
			b.className = "cm-badge";
			b.addEventListener("click", () => {
				const t = nearest();
				if (t && window.LGCity && window.LGCity.center)
					window.LGCity.center(t.x, t.y);
			});
			hud.insertBefore(b, hud.children[1] || null);
		}
		const V = S.view,
			n = (S.spots || []).filter((x) => x.pid).length,
			ne = (S.spots || []).filter((x) => x.eid).length,
			nx = nextBack();
		b.hidden = !V;

		b.innerHTML = `${SKULL} Монстры: <b>${n}</b>${ne ? ` <small>+${ne} элит.</small>` : ""}${nx ? ` <small class="cm-back">· новая через ${mmss(nx)}</small>` : ""}`;
		b.title =
			n || nx
				? `Стаи у города: ${n}${nx ? `, новая придёт через ${mmss(nx)}` : ""}. ${V.ft ? `Силы героя: ${V.ft.p} из ${V.ft.max}` : `Боёв с наградой сегодня: ${V.daily.left} из ${V.daily.max}`}. Нажми - камера к ближайшей стае`
				: `Монстры ушли - следующие придут через ${left(V.daily.next - srvNow())}`;
		b.setAttribute("aria-label", b.title);
		b.classList.toggle("none", !n);
	}

	function nearest() {
		const L = (S.spots || []).filter((x) => x.pid);
		const A = L.length ? L : S.spots || [];
		if (!A.length) return null;
		let cx = 0,
			cy = 0;
		try {
			const d = window.LGCity.debug();
			if (d && d.me) {
				cx = d.me[0];
				cy = d.me[1];
			}
		} catch (e) {}
		const order = A.slice().sort(
			(a, b) => Math.hypot(a.x - cx, a.y - cy) - Math.hypot(b.x - cx, b.y - cy),
		);
		S.navI = ((S.navI == null ? -1 : S.navI) + 1) % order.length;
		return order[S.navI];
	}

	function nextBack() {
		const V = S.view;
		if (!V) return 0;
		const at = [...(V.soon || []), ...(V.eSoon || [])].map((x) => x.at);
		if (!at.length) return 0;
		return Math.max(0, Math.min(...at) - srvNow());
	}
	const mmss = (ms) => {
		const s = Math.ceil(ms / 1000);
		return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
	};
	async function tick() {
		if (document.hidden) return;
		const W = wallOf(),
			h = W && W.X && W.X.hero ? W.X.hero() : null;
		if (!W || !W.own || !h || !h.cm) {
			if (S.layer) drop();
			S.W = null;
			if (PT.el) {
				PT.el.remove();
				PT.el = null;
			}
			return;
		}
		S.W = W;
		S.X = W.X;
		const back =
			S.view &&
			[...(S.view.soon || []), ...(S.view.eSoon || [])].length &&
			nextBack() <= 0;

		const tot =
			S.view && S.view.daily
				? S.view.daily.tot != null
					? S.view.daily.tot
					: S.view.daily.n
				: null;
		if (
			(!S.view ||
				back ||
				S.vt !== String(W.town || "") ||
				Date.now() - S.at > cmTtl() ||
				(h.cm && tot != null && h.cm.n !== tot)) &&
			Date.now() >= (S.retryAt || 0)
		)
			await load(true);
		draw();
		await ptick(h);
	}
	setInterval(() => {
		void tick().catch((e) => console.warn("[монстры у стен]", e));
	}, 1500);

	function dialog(html, wide, bare) {
		close();
		const d = document.createElement("div");
		d.className = "cm-dlg";
		d.setAttribute("role", "dialog");
		d.setAttribute("aria-modal", "true");
		d.innerHTML = bare
			? `<div class="cm-box${wide ? " wide" : ""}">${html}</div>`
			: `<div class="cm-box cm-gw gw-tok gw-dk${wide ? " wide" : ""}" data-gst="${gst()}"><button type="button" class="cm-cl" data-x aria-label="Закрыть">✕</button>${html}</div>`;
		d.addEventListener("click", (e) => {
			if (e.target === d || e.target.closest("[data-x]")) close();
		});
		d.addEventListener("keydown", (e) => {
			if (e.key === "Escape") {
				e.stopPropagation();
				close();
			}
		});
		document.body.appendChild(d);
		S.dlg = d;
		const f = d.querySelector("[data-go], .cm-btns .cm-bt:not([hidden])");
		if (f) f.focus();
		return d;
	}
	function close() {
		if (S.dlg) {
			S.dlg.remove();
			S.dlg = null;
		}
	}
	const card = (m) =>
		`<div class="cm-card${m.elite ? " el" : ""}"${m.hint ? ` title="${esc(m.hint)}"` : ""}><div class="cm-pic">${fig(m.mon || m.eid)}</div><b>${esc(m.name)}</b><small>${m.lvl ? `${m.lvl} ур.` : ""}${m.lvl && m.hp != null ? " · " : ""}${m.hp != null ? `<span class="cm-st" title="здоровье">♥ ${m.hp}</span> <span class="cm-st" title="удар">⚔ ${m.atk}</span>` : ""}</small><small>${esc(m.hint || "")}</small></div>`;

	const rewardRow = (R) =>
		R
			? `<div class="cm-rw"><span>Победа: <b>${esc(rwText(R.win))}</b>${R.dropPct ? `, шанс трофея ${R.dropPct}%` : ""}</span><span>Поражение: ${esc(rwText(R.lose)) || "без награды"} - герой не станет призраком, вещи целы</span></div>`
			: "";

	const hpRow = (h) => {
		if (!h || !(h.max > 0) || h.hp == null) return "";
		const p = h.hp / h.max,
			low = h.hp <= 1 || p < 0.1,
			mid = !low && p < 0.4;
		return (
			`<div class="cm-hp${low ? " low" : mid ? " mid" : ""}"><span>Здоровье героя: <b>${h.hp} / ${h.max}</b></span><i style="--p:${Math.round(p * 100)}%"></i>` +
			`<small>${low ? "Здоровья почти нет - бой начнётся с него. Лучше подлечиться: съесть или выпить что-нибудь, или подождать - раны заживают сами." : mid ? "Герой ранен - бой начнётся с текущего здоровья." : "Бой начинается с текущего здоровья; раны после боя останутся (заживают сами). Пал - останется 1 ХП."}</small></div>`
		);
	};
	const hpAfter = (x) =>
		x && x.hp != null
			? ` · здоровье ${x.hp}${x.max ? " / " + x.max : ""}${x.fell ? " (пал - остался 1 ХП)" : ""}`
			: "";

	const TIER_HINT = [
		"Слабая стая - бой полегче, награда меньше",
		"Обычная стая",
		"Сильная стая - бой тяжелее, награда больше и шанс трофея выше",
	];

	function powScale(pw, my) {
		if (!(my > 0) || !(pw >= 0)) return "";
		const r = pw / my,
			x = Math.max(0, Math.min(1, Math.log2(r) / 2 + 0.5));
		const word = r > 1.15 ? "тяжело" : r < 0.85 ? "легко" : "на равных",
			cls = r > 1.15 ? "hi" : r < 0.85 ? "lo" : "";
		return (
			`<div class="cm-sc" role="img" aria-label="Сила стаи ${pw}, твоя сила ${my} - ${word}"><div class="cm-scb" aria-hidden="true"><i style="left:${(x * 100).toFixed(1)}%"></i></div>` +
			`<div class="cm-scl" aria-hidden="true"><span>Ты <b>${my}</b></span><em class="${cls}">${word}</em><span>Стая <b>${pw}</b></span></div></div>`
		);
	}

	const ftNote = (F) =>
		`<p class="cm-note cm-ft">Силы героя: <b>${+F.p} из ${+F.max}</b>. Бой со стаей - ${+F.pack}, с элитным - ${+F.elite}; сил не хватает - бой без награды (помогать группе можно). Силы копятся сами${F.p < F.max && F.full ? `, полная шкала - через ${esc(left(F.full - srvNow()))}` : ""}.</p>`;
	async function attackDlg(pid) {
		const V = await load(true);
		if (!V) return;
		const P =
			(V.packs || []).find((x) => x.pid === pid) ||
			(V.packs || []).find((x) => x.pid === V.pid) ||
			(V.pack
				? {
						pid: V.pid || "",
						tier: 1,
						lvl: V.hero && V.hero.level,
						pack: V.pack,
						power: V.power,
						reward: V.reward,
					}
				: null);
		if (!P && (V.ft || V.daily.left > 0)) {
			dialog(
				`<h3>Этой стаи уже нет</h3><p class="cm-sub">${(V.soon || []).length ? `Новая стая придёт через ${esc(mmss(nextBack()))}.` : ""} Другие стаи - по значку «Монстры» в шапке города.</p><div class="cm-btns"><button type="button" class="cm-bt acc" data-x>Понятно</button></div>`,
			);
			return;
		}
		if (!P || (!V.ft && V.daily.left <= 0)) {
			dialog(
				`<h3>Монстры ушли</h3><p class="cm-sub">Сегодня ты отбил всех (${V.daily.max} из ${V.daily.max}). Следующие придут через ${esc(left(V.daily.next - srvNow()))} - в 05:00 по Москве.</p><div class="cm-btns"><button type="button" class="cm-bt acc" data-x>Понятно</button></div>`,
			);
			return;
		}
		const pw = P.power,
			my = V.myPower,
			cls = my ? (pw > my * 1.15 ? "hi" : pw < my * 0.85 ? "lo" : "") : "";

		const G = V.group,
			busy =
				(V.hero && V.hero.busy) ||
				(G && !G.lead
					? "В группе на стаю нападает лидер - или выйди из группы, чтобы биться одному"
					: ""),
			t = P.tier == null ? 1 : P.tier;
		const goT = G && G.lead ? `Напасть группой (${+G.n})` : "Напасть",
			gNote = G
				? `<p class="cm-note cm-gnote">Ты в группе из ${+G.n}: бьётесь вместе, бой с наградой тратится у каждого, награда - каждому.</p>`
				: "";

		const lvN =
			V.hero && V.hero.level
				? ` Твой герой - ${+V.hero.level} ур.${V.cityLvl ? `, монстры этого города - около ${+V.cityLvl} ур.` : ""}`
				: "";

		const d = dialog(
			V.cmp
				? `<div class="cm-atk"><h3>Стая у стен <span class="cm-tier t${t}"><i>${skulls(t)}</i> ${esc(TIER_RU[t] || "")}, ${P.lvl} ур.</span></h3>
      <p class="cm-sub">${esc(V.biomeName)}: ${P.pack.length} у города. ${esc(TIER_HINT[t] || "")}. Бой - как на арене, бьются сами.${esc(lvN)}</p>
      <div class="cm-pack">${P.pack.map(card).join("")}</div>
      ${my ? powScale(pw, my) : `<div class="cm-row"><span>Сила стаи: <b class="pw ${cls}">${pw}</b></span></div>`}
      ${rewardRow(P.reward)}${hpRow(V.hero)}
      ${V.ft ? ftNote(V.ft) : `<p class="cm-note">Боёв с наградой сегодня: <b>${V.daily.n} из ${V.daily.max}</b> (на все стаи). Стая вернётся новой через ${respT(V.respawnMin)}; после ${V.daily.max}-го боя - в 05:00 МСК.</p>`}
      ${gNote}<p class="cm-err" role="alert">${busy ? esc(busy) : ""}</p></div>
      <div class="cm-btns"><button type="button" class="cm-bt" data-x>Не сейчас</button><button type="button" class="cm-bt acc" data-go${busy ? " disabled" : ""}>${esc(goT)}</button></div>`
				: `<h3>Напасть на монстров у стен?</h3>
      <p class="cm-sub">${esc(V.biomeName)}: стая из ${P.pack.length} у города. <span class="cm-tier t${t}"><i>${skulls(t)}</i> ${esc(TIER_RU[t] || "")}, ${P.lvl} ур.</span> ${esc(TIER_HINT[t] || "")}.${esc(lvN)} Бой - как на арене: твой герой против стаи, бьются сами.</p>
      <div class="cm-pack">${P.pack.map(card).join("")}</div>
      <div class="cm-row"><span>Сила стаи: <b class="pw ${cls}">${pw}</b></span>${my ? `<span>Твоя сила: <b class="pw">${my}</b></span>` : ""}<span>${V.ft ? `Силы героя: ${V.ft.p} из ${V.ft.max}` : `Боёв с наградой сегодня: ${V.daily.n} из ${V.daily.max}`}</span></div>
      ${rewardRow(P.reward)}${hpRow(V.hero)}
      ${V.ft ? ftNote(V.ft) : `<p class="cm-note">Боёв с наградой в день у стен этого города - ${V.daily.max} на все его стаи (у каждого твоего города - свои); какие выбрать - решай сам. Стая, с которой бился, вернётся новой через ${respT(V.respawnMin)}. После ${V.daily.max}-го боя уходят все до 05:00 МСК.</p>`}
      ${gNote}<p class="cm-err" role="alert">${busy ? esc(busy) : ""}</p>
      <div class="cm-btns"><button type="button" class="cm-bt" data-x>Не сейчас</button><button type="button" class="cm-bt acc" data-go${busy ? " disabled" : ""}>${esc(goT)}</button></div>`,
		);
		d.querySelector("[data-go]").addEventListener("click", async (e) => {
			const b = e.currentTarget;
			b.disabled = true;
			b.textContent = "Секунду…";
			const r = await api("/api/citymon/act", {
				op: "attack",
				...(P.pid ? { pid: P.pid } : {}),
				...(S.vt ? { town: S.vt } : {}),
			});
			if (!r || !r.ok) {
				b.disabled = false;
				b.textContent = goT;
				d.querySelector(".cm-err").textContent = (r && r.error) || "не вышло";
				if (r && r.gone) {
					S.view = null;
					void load(true).then(draw);
				}
				return;
			}
			S.view = null;
			void load(true).then(() => draw());
			if (r.group)
				void pload(true).then(() => {
					PT.seen = Math.max(
						PT.seen,
						(PT.v && PT.v.party && PT.v.party.fight && PT.v.party.fight.at) ||
							0,
					);
					pdraw();
				});
			fightDlg(r.fight, r.hp);
		});
	}

	let fieldP = null;
	function field() {
		if (window.LGArenaField) return Promise.resolve(true);
		if (fieldP) return fieldP;
		const css = (h) =>
			new Promise((ok) => {
				const l = document.createElement("link");
				l.rel = "stylesheet";
				l.href = h;
				l.onload = ok;
				l.onerror = ok;
				document.head.appendChild(l);
			});
		const js = (src) =>
			new Promise((ok, no) => {
				const s = document.createElement("script");
				s.src = src;
				s.onload = ok;
				s.onerror = no;
				document.head.appendChild(s);
			});
		fieldP = css("/site/arena-field.css")
			.then(() => js("/site/arena-field.js"))
			.then(
				() => true,
				() => {
					fieldP = null;
					return false;
				},
			);
		return fieldP;
	}
	const monFig = (h) =>
		h && h.mon
			? `<span class="cm-fig${h.elite ? " el" : ""}">${fig(h.mon)}</span>`
			: null;
	async function fightDlg(F, hpX) {
		if (F && Array.isArray(F.duels)) {
			chainDlg(F, hpX);
			return;
		}
		const d = dialog(
			`<h3>${F.kind === "elite" ? "Бой с элитным" : F.kind === "group" ? "Бой группы у стен" : "Бой у стен"}</h3><div class="cm-fight" aria-live="polite"><p class="cm-note">Поле боя загружается…</p></div><div class="cm-out"></div>
      <div class="cm-btns"><button type="button" class="cm-bt" data-x>Закрыть</button></div>`,
			true,
		);
		const ok = await field();
		const box = d.querySelector(".cm-fight");
		const done = () => {
			const win = F.winner === "atk",
				out = d.querySelector(".cm-out");
			out.innerHTML = `<div class="cm-res ${win ? "win" : "lose"}" role="status"><b>${win ? "Победа!" : "Поражение"}</b>${F.rw ? `<span>${F.rw.over ? "Без награды - бои с наградой на сегодня кончились" : esc(rwText(F.rw)) || "без награды"}${!win ? " · не призрак, вещи целы" : ""}${esc(hpAfter(hpX))}</span>` : ""}</div>`;
		};
		if (!ok || !window.LGArenaField) {
			box.innerHTML = `<p class="cm-note">Поле боя не загрузилось - итог ниже.</p>`;
			done();
			return;
		}
		const labels = {
			atk: F.kind === "elite" ? "Группа гильдии" : "Твой герой",
			def: F.kind === "elite" ? "Элитный" : "Стая",
		};

		window.LGArenaField.play(
			box,
			{ ...F, kind: "pve" },
			{
				figure: monFig,
				labels,
				bare: true,
				marks: true,
				speed: 2,
				onDone: done,
				bg: F.biome || (S.view && S.view.biome) || "meadow",
			},
		);
	}

	const LOGV = [2];
	function logText(F) {
		if (F && Array.isArray(F.duels) && F.duels.length)
			return F.duels
				.map(
					(x, i) =>
						`<h4 class="cm-tlh">Бой ${+x.n || i + 1}: группа против отряда ${+x.sq || i + 1}</h4>${logText({ ...x, duels: null, acts: x.acts || F.acts })}`,
				)
				.join("");
		const nm = {};
		for (const h of [
			...((F.teams && F.teams.atk) || []),
			...((F.teams && F.teams.def) || []),
		])
			nm[h.k] = h.name;
		const n = (k) => esc(nm[k] || k),
			act = (id) => esc((F.acts && F.acts[id]) || "");
		const out = [];
		for (const e of F.log || []) {
			if (!e || !e.t) continue;
			const sk = e.sk && act(e.sk) ? ` <i>${act(e.sk)}</i>` : "";
			if (e.t === "round")
				out.push(`<li class="r">Раунд ${+e.r || out.length + 1}</li>`);
			else if (e.t === "hit")
				out.push(
					`<li>${n(e.s || e.a)} → ${n(e.sg || e.d)}: ${e.dodged ? "уклонился" : `<b>−${+e.dmg || 0}</b>${e.crit ? " крит" : ""}`}${sk}${e.kill ? " - пал" : ""} <small>(${+(e.sg ? e.shp : e.hp) || 0})</small></li>`,
				);
			else if (e.t === "heal")
				out.push(
					`<li>${n(e.a)} лечит ${n(e.d)}: <b>+${+e.amt || 0}</b>${sk} <small>(${+e.hp || 0})</small></li>`,
				);
			else if (e.t === "act")
				out.push(`<li>${n(e.a)}: ${act(e.sk) || esc(e.sk || "действие")}</li>`);
			else if (e.t === "ab")
				out.push(
					`<li>${n(e.a)}: ${esc(e.name || "") || act(e.id) || "способность"}${e.slot === "ult" ? " (ульта)" : ""}</li>`,
				);
			else if (e.t === "dot")
				out.push(
					`<li>${n(e.d)}: яд <b>−${+e.dmg || 0}</b>${e.kill ? " - пал" : ""} <small>(${+e.hp || 0})</small></li>`,
				);
			else if (e.t === "phoenix")
				out.push(`<li>${n(e.d)}: «Слеза Феникса» спасла</li>`);
			else if (e.t === "revive")
				out.push(
					`<li>${n(e.d)} встаёт снова <small>(${+e.hp || 0})</small></li>`,
				);
			else if (e.t === "end")
				out.push(
					`<li class="r">Итог: ${e.winner === "atk" ? "победа" : "поражение"}, раундов ${+e.rounds || 0}</li>`,
				);
		}
		return `<ol class="cm-tlog" aria-label="Ход боя">${out.join("") || "<li>Журнал пуст</li>"}</ol>`;
	}

	async function replay(R, o = {}) {
		const F = (R && R.fight) || null;
		const old = !!(R && R.same === false),
			known = !!(R && LOGV.includes(+R.lv));

		if (
			F &&
			Array.isArray(F.duels) &&
			F.duels.length &&
			known &&
			F.teams &&
			Array.isArray(F.teams.def)
		)
			return chainDlg(F, null, { rec: true, old, title: o.title, sub: o.sub });
		const d = dialog(
			`<h3>${esc(o.title || "Запись боя")}</h3>${o.sub ? `<p class="cm-sub">${esc(o.sub)}</p>` : ""}
      <p class="cm-note cm-rec">Запись боя - смотреть можно сколько угодно: награды и раны не меняются.${old ? " <b>Бой записан прежней версией правил боя - показан по записанному журналу ходов.</b>" : ""}</p>
      <div class="cm-fight" aria-live="polite"><p class="cm-note">Поле боя загружается…</p></div><div class="cm-out"></div>
      <div class="cm-btns"><button type="button" class="cm-bt" data-pause hidden aria-pressed="false">Пауза</button><button type="button" class="cm-bt" data-tlog>Ход боя текстом</button><button type="button" class="cm-bt" data-x>Закрыть</button></div>`,
			true,
		);
		d.classList.add("cm-replay");
		const box = d.querySelector(".cm-fight"),
			out = d.querySelector(".cm-out");
		const res = () => {
			if (!F) return;
			const win = F.winner === "atk";
			out.innerHTML = `<div class="cm-res ${win ? "win" : "lose"}" role="status"><b>${win ? "Победа" : "Поражение"}</b><span>раундов ${+F.rounds || 0} · запись, ничего не начислено</span></div>`;
		};
		const text = (why) => {
			box.innerHTML = `${why ? `<p class="cm-note cm-old">${esc(why)}</p>` : ""}${F ? logText(F) : ""}`;
			res();
		};
		d.querySelector("[data-tlog]").addEventListener("click", (e) => {
			const b = e.currentTarget;
			const t = d.querySelector(".cm-tlog");
			if (t) {
				t.remove();
				b.textContent = "Ход боя текстом";
				return;
			}
			box.insertAdjacentHTML("afterend", F ? logText(F) : "");
			b.textContent = "Скрыть ход боя";
		});
		if (!F || !Array.isArray(F.log)) {
			text("Записи этого боя нет - только итог.");
			return { dlg: d, stop() {} };
		}
		if (!known) {
			text(
				"Эту запись нынешнее поле боя показать не может (другая версия журнала) - ход боя текстом.",
			);
			d.querySelector("[data-tlog]").hidden = true;
			return { dlg: d, stop() {} };
		}
		const ok = await field();
		if (!ok || !window.LGArenaField) {
			text("Поле боя не загрузилось - ход боя текстом.");
			d.querySelector("[data-tlog]").hidden = true;
			return { dlg: d, stop() {} };
		}
		let paused = false;
		const pb = d.querySelector("[data-pause]");
		pb.hidden = false;
		const labels = {
			atk: F.kind === "elite" ? "Группа гильдии" : "Твой герой",
			def: F.kind === "elite" ? "Элитный" : "Стая",
		};
		let P = null;
		try {
			P = window.LGArenaField.play(
				box,
				{ ...F, kind: "pve" },
				{
					figure: monFig,
					labels,
					bare: true,
					marks: true,
					speed: 1,
					paused: () => paused,
					onDone: () => {
						res();
						pb.hidden = true;
					},
					bg: F.biome || "meadow",
				},
			);
		} catch (e) {
			console.warn("[монстры у стен] запись боя", e);
			text("Поле боя не смогло показать запись - ход боя текстом.");
			return { dlg: d, stop() {} };
		}
		pb.addEventListener("click", () => {
			paused = !paused;
			pb.textContent = paused ? "Дальше" : "Пауза";
			pb.setAttribute("aria-pressed", String(paused));
		});

		box.addEventListener("click", (e) => {
			if (e.target.closest(".af-replay")) {
				paused = false;
				pb.hidden = false;
				pb.textContent = "Пауза";
				pb.setAttribute("aria-pressed", "false");
				out.innerHTML = "";
			}
		});
		return {
			dlg: d,
			field: P,
			pause: (v) => {
				paused = v == null ? !paused : !!v;
				pb.textContent = paused ? "Дальше" : "Пауза";
			},
			stop() {
				if (P) P.destroy();
			},
		};
	}

	const RES_RU = {
		win: "отряд разбит",
		wipe: "группа пала",
		limit: "предел раундов - отряд устоял",
	};
	function chainDlg(F, hpX, o = {}) {
		const D = F.duels,
			heroes = F.teams.atk,
			sqs = F.teams.def,
			K = sqs.length,
			rec = !!o.rec;
		const eName = String((sqs[0] && sqs[0].name) || "Элитный").replace(
			/ - отряд \d+$/,
			"",
		);
		const d = dialog(
			`<h3>${esc(o.title || `Бой с элитным: ${K} ${plural(K, "отряд", "отряда", "отрядов")}`)}</h3>
      <p class="cm-sub">${o.sub ? `${esc(o.sub)} · ` : ""}«${esc(eName)}»: вся группа бьётся с отрядами подряд - 1, 2, 3. Здоровье между боями не восстанавливается, павший дальше не идёт.</p>
      ${rec ? `<p class="cm-note cm-rec">Запись боя - смотреть можно сколько угодно: награды и раны не меняются.${o.old ? " <b>Бой записан прежней версией правил боя - показан по записанному журналу ходов.</b>" : ""}</p>` : ""}
      <div class="cm-chain" aria-live="polite"></div><div class="cm-out"></div><div class="cm-fight"><p class="cm-note">Поле боя загружается…</p></div>
      <div class="cm-btns">${rec ? '<button type="button" class="cm-bt" data-pause hidden aria-pressed="false">Пауза</button><button type="button" class="cm-bt" data-tlog>Ход боя текстом</button>' : ""}<button type="button" class="cm-bt" data-all>Пропустить всё</button><button type="button" class="cm-bt" data-x>Закрыть</button></div>`,
			true,
		);
		const top = d.querySelector(".cm-chain"),
			box = d.querySelector(".cm-fight");

		if (rec) {
			d.classList.add("cm-replay");
			d.querySelector("[data-tlog]").addEventListener("click", (e) => {
				const b = e.currentTarget,
					t = d.querySelector(".cm-tlogs");
				if (t) {
					t.remove();
					b.textContent = "Ход боя текстом";
					return;
				}
				box.insertAdjacentHTML(
					"afterend",
					`<div class="cm-tlogs">${logText(F)}</div>`,
				);
				b.textContent = "Скрыть ход боя";
			});
		}

		const stateAt = (k) => {
			const sh = sqs.map((q) => q.hp),
				hh = {};
			for (const h of heroes) hh[h.login] = h.hp0 != null ? h.hp0 : h.hp;
			for (const x of D.slice(0, k)) {
				sh[x.sq - 1] = x.s1;
				for (const [l, v] of Object.entries(x.h1 || {})) hh[l] = v;
			}
			return { sh, hh };
		};
		const draw = (k, cur) => {
			const { sh, hh } = stateAt(k),
				X = cur >= 0 ? D[cur] : null,
				end = k >= D.length && cur < 0;
			const sqHtml = sqs
				.map((q, i) => {
					const v = Math.max(0, Math.round(sh[i])),
						p = Math.round((v / Math.max(1, q.hp)) * 100),
						dead = v <= 0,
						on = X && X.sq === i + 1;
					const lab = dead
						? "разбит"
						: on
							? `в бою · ${v} / ${q.hp}`
							: i < k
								? `устоял · ${v} / ${q.hp}`
								: `ждёт · ${v} / ${q.hp}`;
					return `<div class="cm-sq${dead ? " dead" : ""}${on ? " on" : ""}" data-sq="${i + 1}"><b>Отряд ${i + 1}</b><i style="--p:${p}%"></i><small>${esc(lab)}</small></div>`;
				})
				.join("");
			const qHtml = heroes
				.map((h) => {
					const v = Math.max(0, Math.round(hh[h.login])),
						gone = v <= 0,
						on = X && (X.who || []).includes(h.login);
					return `<li class="${on ? "on" : ""}${gone ? " gone" : ""}"><span>${esc(h.name)}</span><small>${gone ? "пал - дальше не идёт" : `${v} / ${h.hp} ХП`}</small></li>`;
				})
				.join("");
			const last = D[D.length - 1];
			const now = X
				? `Бой ${X.n || cur + 1} из ${K}: группа (${(X.who || []).length}) против отряда ${X.sq}`
				: end
					? `${F.winner === "atk" ? `Все ${K} ${plural(K, "отряд", "отряда", "отрядов")} разбиты.` : `Бой ${last ? last.n || D.length : 1} из ${K}: ${esc(RES_RU[last && last.res] || "отряд устоял")}.`}`
					: k
						? `Бой ${k} из ${K}: ${esc(RES_RU[D[k - 1].res] || "")}. Дальше - отряд ${k + 1}…`
						: "Сейчас начнётся…";
			top.innerHTML = `<div class="cm-sqs" aria-label="Отряды элитного">${sqHtml}</div><p class="cm-now">${now}</p><ol class="cm-q cm-grp" aria-label="Здоровье группы">${qHtml}</ol>`;
		};
		let run = 0,
			P = null,
			speed = rec ? 1 : 2,
			paused = false;
		const pb = d.querySelector("[data-pause]");
		if (pb)
			pb.addEventListener("click", () => {
				paused = !paused;
				pb.textContent = paused ? "Дальше" : "Пауза";
				pb.setAttribute("aria-pressed", String(paused));
			});
		const fin = () => {
			run++;
			if (P) {
				try {
					speed = P.speed();
				} catch (e) {}
			}
			draw(D.length, -1);
			if (pb) pb.hidden = true;
			const win = F.winner === "atk",
				out = d.querySelector(".cm-out"),
				all = d.querySelector("[data-all]");
			if (all) all.disabled = true;
			const beat = D.filter((x) => x.res === "win").length;
			const mine = rec
				? " · запись, ничего не начислено"
				: F.rw
					? ` · ${F.rw.over ? "тебе - без награды: бои с наградой на сегодня кончились" : esc(rwText(F.rw)) || "без награды"}`
					: "";
			out.innerHTML = `<div class="cm-res ${win ? "win" : "lose"}" role="status"><b>${win ? "Победа!" : "Поражение"}</b><span>${win ? `Все ${K} ${plural(K, "отряд", "отряда", "отрядов")} разбиты - награда всем участникам сбора` : `Разбито отрядов: ${beat} из ${K} - никто ничего не получает`}${mine}${rec ? "" : esc(hpAfter(hpX))}</span></div>`;
		};
		d.querySelector("[data-all]").addEventListener("click", () => {
			if (P) {
				try {
					P.destroy();
				} catch (e) {}
				P = null;
			}
			box.innerHTML = "";
			fin();
		});
		const step = async (k, my) => {
			if (my !== run || !d.isConnected) return;
			if (k >= D.length) {
				fin();
				return;
			}
			draw(k, k);
			const X = D[k];
			if (P) {
				try {
					speed = P.speed();
					P.destroy();
				} catch (e) {}
			}
			let done = false;
			P = window.LGArenaField.play(
				box,
				{ ...X, kind: "pve", me: rec ? "atk" : F.me || null },
				{
					figure: monFig,
					labels: { atk: "Группа гильдии", def: `Отряд ${X.sq}` },
					bare: true,
					marks: true,
					speed,
					bg: F.biome || (S.view && S.view.biome) || "meadow",
					...(rec ? { paused: () => paused } : {}),
					onDone: () => {
						if (done || my !== run) return;
						done = true;
						draw(k + 1, -1);
						if (k + 1 >= D.length) {
							fin();
							return;
						}

						const go = () => {
							if (paused && my === run) {
								setTimeout(go, 150);
								return;
							}
							void step(k + 1, my);
						};
						setTimeout(go, RM() ? 400 : 1600 / Math.max(1, speed));
					},
				},
			);
			if (pb) pb.hidden = false;
		};
		draw(0, -1);
		void field().then((ok) => {
			if (!d.isConnected) return;
			if (!ok || !window.LGArenaField || !D.length) {
				box.innerHTML = `<p class="cm-note">Поле боя не загрузилось - итог ниже.</p>`;
				fin();
				return;
			}
			if (pb) pb.hidden = false;
			void step(0, run);
		});
		return {
			dlg: d,
			stop() {
				run++;
				if (P) {
					try {
						P.destroy();
					} catch (e) {}
				}
			},
			skipAll: () => d.querySelector("[data-all]").click(),
		};
	}

	const memList = (L) =>
		`<ul class="cm-mem">${L.members.map((m) => `<li>${m.login === L.leader ? "★ " : ""}${esc(m.name)} · ${esc(ROLE_RU[m.role] || m.role)}, ${m.level} ур.</li>`).join("")}</ul>`;
	async function eliteDlg(eid) {
		const V = await load(true);
		if (!V) return;

		if (V.lobby && V.lobby.epid) eid = V.lobby.epid;
		const E =
			(V.elites || []).find((x) => x.epid === eid) ||
			(V.elites || []).find((x) => x.eid === eid) ||
			(V.lobby
				? {
						eid: V.lobby.eid,
						name: V.lobby.name,
						hint: V.lobby.hint,
						tier: V.lobby.tier,
					}
				: { eid, name: "Элитный", hint: "" });
		const mon = E.eid || eid,
			key = E.epid || eid;
		const L = V.lobby;
		const head = `<h3>${esc(E.name)} - элитный</h3><p class="cm-sub">${esc(E.hint)}. В одиночку не одолеть: нужна группа 2-5 из своей гильдии. Сила элитного - по группе.</p>
      <p class="cm-note">У элитного ${V.eSquads || 3} ${plural(V.eSquads || 3, "отряд", "отряда", "отрядов")}: вся группа бьётся с ними подряд - с 1-м, потом со 2-м, потом с 3-м. Здоровье между боями не восстанавливается, павший дальше не идёт. Разбиты все отряды - награда всем, проиграли на любом - никому.</p>
      ${E.tier != null ? `<p class="cm-note"><span class="cm-tier t${E.tier ? 2 : 1}"><i>${skulls(E.tier + 1, E.tier ? "посложнее" : "попроще")}</i> ${E.tier ? "посложнее" : "попроще"}${E.lvl ? `, ${E.lvl} ур.` : ""}</span> - твой элитный: собранная группа бьётся с ним, награда - каждому в счёт его боёв с элитными.</p>` : ""}
      <div class="cm-pack">${card({ ...E, mon, elite: 1 })}</div>${rewardRow(E.reward || V.eReward)}${hpRow(V.hero)}${V.eDaily ? `<p class="cm-note">Боёв с элитными с наградой сегодня: ${V.eDaily.n} из ${V.eDaily.max}</p>` : ""}`;
		if (L) {
			lobbyDlg(L, head);
			return;
		}
		const d = dialog(
			`${head}<p class="cm-err" role="alert"></p><div class="cm-btns"><button type="button" class="cm-bt" data-x>Не сейчас</button><button type="button" class="cm-bt acc" data-go>Собрать группу</button></div>`,
		);
		d.querySelector("[data-go]").addEventListener("click", async (e) => {
			const b = e.currentTarget;
			b.disabled = true;
			const r = await api("/api/citymon/act", {
				op: "ecreate",
				eid: key,
				...(S.vt ? { town: S.vt } : {}),
			});
			if (!r || !r.ok) {
				b.disabled = false;
				d.querySelector(".cm-err").textContent = (r && r.error) || "не вышло";
				return;
			}
			S.view = null;
			await load(true);
			draw();
			lobbyDlg(r.lobby, head);
		});
	}

	const LIVE_MS = 5000;
	const leftS = (ms) => (ms >= 3600e3 ? left(ms) : mmss(Math.max(0, ms)));

	const seenF = new Set();
	function showLobbyFight(L) {
		if (!L || L.st !== "done" || !L.fight || !L.mine || seenF.has(L.fight))
			return false;
		seenF.add(L.fight);
		void api("/api/citymon/fight?id=" + encodeURIComponent(L.fight)).then(
			(x) => {
				if (x && x.ok) fightDlg(x.fight);
			},
		);
		return true;
	}
	function lobbyDlg(L, head) {
		const d =
			dialog(`${head || `<h3>Сбор на «${esc(L.name)}»</h3>`}<div class="cm-lobl"></div><p class="cm-err" role="alert"></p>
      <div class="cm-btns">${L.lead ? '<button type="button" class="cm-bt bad" data-op="edisband">Распустить</button>' : '<button type="button" class="cm-bt" data-op="eleave">Выйти</button>'}
      <button type="button" class="cm-bt" data-x>Закрыть</button>${L.lead ? '<button type="button" class="cm-bt acc" data-op="estart">Начать бой</button>' : ""}</div>`);
		const box = d.querySelector(".cm-lobl"),
			go = d.querySelector('[data-op="estart"]');
		let cur = L,
			mine = 0,
			gone = false;
		const paint = () => {
			const can = cur.lead && cur.members.length >= cur.min;
			box.innerHTML = `<p class="cm-note">Сбор гильдии: <b data-n>${cur.members.length} из ${cur.max}</b>. Видно в окне гильдии, вкладка «Сбор». Распустится сам через <time data-until="${+cur.until}">${esc(leftS(cur.until - srvNow()))}</time>, если не начать.</p>${memList(cur)}`;
			if (go) {
				go.disabled = !can || gone;
				go.title = can ? "" : `Нужно хотя бы ${cur.min} в группе`;
			}
		};
		const end = (t) => {
			gone = true;
			clearInterval(T);
			box.innerHTML = `<p class="cm-note">${esc(t)}</p>`;
			d.querySelectorAll("[data-op]").forEach((b) => {
				b.disabled = true;
			});
		};
		paint();
		const T = setInterval(() => {
			if (!d.isConnected) {
				clearInterval(T);
				return;
			}
			const tm = box.querySelector("time[data-until]");
			if (tm) {
				const ms = +tm.dataset.until - srvNow();
				tm.textContent = leftS(ms);
				if (ms <= 0 && !gone) end("Сбор распустился сам: бой так и не начали.");
			}
			if (document.hidden || gone || ++mine % Math.round(LIVE_MS / 1000))
				return;
			void api("/api/citymon/act", { op: "elist" }).then((r) => {
				if (!d.isConnected || gone || !r || !r.ok) return;
				const x = (r.list || []).find((y) => y.id === cur.id);
				if (x && x.st === "open") {
					const was = cur.members.map((m) => m.login).join();
					cur = x;
					if (
						was !== x.members.map((m) => m.login).join() ||
						!box.querySelector("time[data-until]")
					)
						paint();
					return;
				}
				if (x && x.st === "done") {
					end("Бой прошёл.");
					S.view = null;
					void load(true).then(draw);
					if (!showLobbyFight(x)) close();
					return;
				}
				if (!x || !x.mine) {
					end(
						cur.lead ? "Сбор закрыт." : "Сбор распущен или ты больше не в нём.",
					);
					S.view = null;
					void load(true).then(draw);
				}
			});
		}, 1000);
		d.addEventListener("click", async (e) => {
			const b = e.target.closest("[data-op]");
			if (!b) return;
			b.disabled = true;
			const r = await api("/api/citymon/act", { op: b.dataset.op });
			if (!r || !r.ok) {
				b.disabled = false;
				d.querySelector(".cm-err").textContent = (r && r.error) || "не вышло";
				return;
			}
			gone = true;
			clearInterval(T);
			S.view = null;
			void load(true).then(draw);
			if (r.fight) {
				seenF.add(r.fight.id);
				fightDlg(r.fight, r.hp);
			} else {
				close();
				toast(
					b.dataset.op === "edisband" ? "Сбор распущен" : "Ты вышел из сбора",
				);
			}
		});
	}

	async function lobbies(pane, opt) {
		if (!pane.querySelector(".cm-lobs"))
			pane.innerHTML = '<p class="cm-note">Загрузка…</p>';
		const r = await api("/api/citymon/act", { op: "elist" });
		if (!pane.isConnected) return 0;
		if (!r || !r.ok) {
			pane.innerHTML = `<p class="cm-note">${esc((r && r.error) || "Сборы недоступны")}</p>`;
			return 0;
		}
		if (!r.guild) {
			pane.innerHTML =
				'<p class="cm-note">Сборы на элитных - для участников гильдии.</p>';
			return 0;
		}
		const list =
			opt && opt.open
				? r.list.filter((L) => L.st === "open" || (L.st === "done" && L.mine))
				: r.list;

		const was = pane._cmOpen || new Set();
		for (const L of r.list)
			if (L.st === "done" && L.mine && was.has(L.id) && !L.lead)
				showLobbyFight(L);
		pane._cmOpen = new Set(
			r.list.filter((L) => L.st === "open" && L.mine).map((L) => L.id),
		);
		const row = (L) => {
			const st =
				L.st === "done" ? "бой прошёл" : `${L.members.length} из ${L.max}`;
			const btn =
				L.st === "done"
					? L.fight && L.mine
						? `<button type="button" class="gl-btn ghost" data-fight="${L.fight}">Смотреть бой</button>`
						: ""
					: L.mine
						? L.lead
							? `<button type="button" class="gl-btn" data-op="estart"${L.members.length >= L.min ? "" : " disabled"}>Начать бой</button><button type="button" class="gl-btn ghost" data-op="edisband">Распустить</button>`
							: '<button type="button" class="gl-btn ghost" data-op="eleave">Выйти</button>'
						: r.mine
							? ""
							: `<button type="button" class="gl-btn" data-join="${esc(L.id)}"${L.members.length >= L.max ? " disabled" : ""}>Присоединиться</button>`;
			return `<div class="cm-lob${L.st === "done" ? " done" : ""}"><div class="cm-pic">${fig(L.eid)}</div><div><h4>${esc(L.name)}${L.tier != null ? ` <span class="cm-tier t${L.tier ? 2 : 1}"><i>${skulls(L.tier + 1, L.tier ? "посложнее" : "попроще")}</i></span>` : ""} · ${esc(st)}</h4><p>Собирает: ${esc((L.members.find((m) => m.login === L.leader) || {}).name || L.leader)}${L.st === "open" ? ` · распустится через <time data-until="${+L.until}">${esc(leftS(L.until - srvNow()))}</time>` : ""}</p><p>${L.members.map((m) => esc(m.name) + " " + m.level + " ур.").join(", ")}</p></div><div class="cm-btns">${btn}</div></div>`;
		};
		const err = (pane.querySelector(".cm-err") || {}).textContent || "";
		pane.innerHTML = `<p class="cm-note">Элитные монстры бродят у стен города. Собрать группу - кликни по элитному в «Городе». Бой начинает собравший, когда в группе 2-5.</p>
      <div class="cm-lobs">${list.length ? list.map(row).join("") : '<p class="cm-note">Открытых сборов нет.</p>'}</div><p class="cm-err" role="alert">${esc(err)}</p>`;
		pane.onclick = async (e) => {
			const j = e.target.closest("[data-join]"),
				o = e.target.closest("[data-op]"),
				f = e.target.closest("[data-fight]");
			if (f) {
				const x = await api(
					"/api/citymon/fight?id=" + encodeURIComponent(f.dataset.fight),
				);
				if (x && x.ok) fightDlg(x.fight);
				else
					pane.querySelector(".cm-err").textContent =
						(x && x.error) || "Бой не загрузился";
				return;
			}
			if (!j && !o) return;
			const b = j || o;
			b.disabled = true;
			const x = await api(
				"/api/citymon/act",
				j ? { op: "ejoin", id: j.dataset.join } : { op: o.dataset.op },
			);
			if (!x || !x.ok) {
				b.disabled = false;
				pane.querySelector(".cm-err").textContent =
					(x && x.error) || "не вышло";
				return;
			}
			if (x.fight) {
				seenF.add(x.fight.id);
				fightDlg(x.fight, x.hp);
			}
			S.view = null;
			void lobbies(pane, opt);
		};

		if (!pane._cmLive) {
			let n = 0;
			pane._cmLive = setInterval(() => {
				if (!pane.isConnected) {
					clearInterval(pane._cmLive);
					pane._cmLive = 0;
					return;
				}
				if (document.hidden) return;
				let out = false;
				pane.querySelectorAll("time[data-until]").forEach((t) => {
					const ms = +t.dataset.until - srvNow();
					t.textContent = leftS(ms);
					if (ms <= 0) out = true;
				});

				if (pane._cmBusy || (S.dlg && S.dlg.isConnected)) return;
				if (out || ++n % Math.round(LIVE_MS / 1000) === 0) {
					n = 0;
					pane._cmBusy = true;
					void lobbies(pane, opt).finally(() => {
						pane._cmBusy = false;
					});
				}
			}, 1000);
		}
		return r.open || 0;
	}

	async function openCount() {
		const r = await api("/api/citymon/act", { op: "elist" });
		return r && r.ok ? r.open || 0 : 0;
	}

	const PT = {
		v: null,
		at: 0,
		g: -1,
		busy: false,
		el: null,
		seen: 0,
		live: 5000,
	};
	const GST = [
		"legion",
		"cats",
		"monkeys",
		"veggies",
		"42brothers",
		"cherts",
		"ugabugi",
	];
	const gst = () => {
		let s0 = "legion";
		try {
			s0 = String(
				(window.MDDoodle && window.MDDoodle.active) ||
					(window.LG_STYLES && window.LG_STYLES[0]) ||
					"legion",
			);
		} catch (e) {
			s0 = "legion";
		}
		return GST.includes(s0) ? s0 : "legion";
	};
	const groupOn = () => {
		const h = hero();
		return !!(h && h.cm && PT.v && PT.v.on);
	};
	async function pload(force) {
		if (PT.busy) return PT.v;
		if (!force && PT.v && Date.now() - PT.at < PT.live) return PT.v;
		PT.busy = true;
		try {
			const t = townNow(),
				r = await api(
					"/api/citymon/party" + (t ? "?town=" + encodeURIComponent(t) : ""),
				);
			if (r && r.ok) {
				PT.v = r;
				PT.at = Date.now();
			} else if (r && r.closed) {
				PT.v = { ok: true, on: false, inv: [] };
				PT.at = Date.now();
			}
		} finally {
			PT.busy = false;
		}
		return PT.v;
	}

	async function ptick(h) {
		const g = h && h.cm ? (+h.cm.g || 0) * 10 + (+h.cm.pi || 0) : 0;
		const has = PT.v && (PT.v.party || (PT.v.inv && PT.v.inv.length));
		if (
			g !== PT.g ||
			(has && Date.now() - PT.at >= PT.live) ||
			(!PT.v && h && h.cm)
		) {
			PT.g = g;
			await pload(true);
		}
		pdraw();
	}
	const hpCls = (p) => (p < 0.25 ? " low" : p < 0.5 ? " mid" : "");
	function pmem(m, P) {
		const p =
			m.max > 0 && m.hp != null ? Math.max(0, Math.min(1, m.hp / m.max)) : null;
		return (
			`<li class="cm-pm${m.me ? " me" : ""}" data-l="${esc(m.login)}"><div class="cm-pn"><b>${m.login === P.leader ? '<span class="cm-lead" title="Лидер группы" aria-label="Лидер">★</span> ' : ""}${esc(m.name)}</b>` +
			`${P.lead && !m.me ? `<button type="button" class="cm-pk" data-pkick="${esc(m.login)}" aria-label="Исключить ${esc(m.name)}" title="Исключить из группы">✕</button>` : ""}</div>` +
			`<small>${+m.level || 1} ур. · ${esc(ROLE_RU[m.role] || m.role || "")}${m.left === 0 ? " · боёв нет" : ""}</small>` +
			(p == null
				? ""
				: `<div class="cm-php${hpCls(p)}" role="img" aria-label="Здоровье ${m.hp} из ${m.max}"><i style="transform:scaleX(${p.toFixed(3)})"></i><span>${m.hp} / ${m.max}</span></div>`) +
			"</li>"
		);
	}
	function pdraw() {
		const W = S.W || wallOf(),
			root = W && W.cam && W.cam.closest ? W.cam.closest(".cy") : null,
			V = PT.v;
		const show = !!(root && V && V.on && (V.party || (V.inv && V.inv.length)));
		if (!show) {
			if (PT.el) {
				PT.el.remove();
				PT.el = null;
			}
			return;
		}
		let el = PT.el;
		if (!el || el.parentNode !== root) {
			if (el) el.remove();
			el = PT.el = document.createElement("section");
			el.className = "cm-pty gw-dk";
			el.setAttribute("aria-label", "Группа");
			el.addEventListener("click", pclick);
			root.appendChild(el);
		}
		el.dataset.gst = gst();
		const P = V.party,
			now = srvNowP();
		const inv = (V.inv || [])
			.map(
				(x) =>
					`<div class="cm-pinv" data-g="${esc(x.g)}"><p><b>${esc(x.name)}</b> зовёт в группу${x.n > 1 ? ` (${x.n} из ${V.max})` : ""} <small>· ${Math.max(0, Math.ceil((x.until - now) / 1000))} с</small></p>` +
					`<div class="cm-pbt"><button type="button" class="cm-pb acc" data-pacc="${esc(x.g)}">Принять</button><button type="button" class="cm-pb" data-pdec="${esc(x.g)}">Отказаться</button></div></div>`,
			)
			.join("");
		const fx =
			P &&
			P.fight &&
			P.fight.at > PT.seen &&
			P.fight.by !== (S.X && S.X.login ? S.X.login() : "")
				? P.fight
				: null;
		const html =
			(P
				? `<header><h3>Группа <span>${P.members.length} из ${V.max}</span></h3><button type="button" class="cm-pb sm" data-pleave title="Выйти из группы">Выйти</button></header>` +
					`<ul class="cm-pms">${P.members.map((m) => pmem(m, P)).join("")}</ul>` +
					((P.pend || []).length
						? `<p class="cm-pend">Ждём ответа: ${P.pend.map((x) => `${esc(x.name)}${P.lead ? ` <button type="button" class="cm-pk" data-pkick="${esc(x.login)}" aria-label="Отозвать приглашение ${esc(x.name)}" title="Отозвать">✕</button>` : ""}`).join(", ")}</p>`
						: "") +
					(fx
						? `<div class="cm-pfx"><span>Бой группы: <b>${fx.win ? "победа" : "поражение"}</b></span><button type="button" class="cm-pb sm" data-pfight="${+fx.id}">Смотреть</button></div>`
						: "") +
					(P.lead && P.members.length + (P.pend || []).length < V.max
						? '<button type="button" class="cm-pb acc wide" data-pfr>Пригласить друга</button>'
						: "") +
					`<p class="cm-ph">${P.lead ? (P.members.length > 1 ? "Нападай на стаю у стен - группа бьётся вместе." : "Позови игроков: правой кнопкой по герою или нику в чате.") : "На стаю нападает лидер - бьётесь вместе."}</p>`
				: "") + inv;
		if (el._h !== html) {
			el._h = html;
			el.innerHTML = html;
		}
	}
	const srvNowP = () =>
		PT.v && PT.v.now ? PT.v.now + (Date.now() - PT.at) : Date.now();
	async function pact(b, btn) {
		if (btn) btn.disabled = true;
		const r = await api("/api/citymon/act", b);
		if (btn && btn.isConnected) btn.disabled = false;
		if (r && r.ok) {
			if (r.party !== undefined || r.inv) {
				PT.v = { ...(PT.v || {}), ...r };
				if (!r.party) delete PT.v.party;
				PT.at = Date.now();
			} else await pload(true);
		} else toast((r && r.error) || "не вышло", true);
		pdraw();
		return r;
	}
	function pclick(e) {
		const b = e.target.closest && e.target.closest("button");
		if (!b) return;
		if (b.dataset.pacc)
			void pact({ op: "paccept", g: b.dataset.pacc }, b).then((r) => {
				if (r && r.ok) toast("Ты в группе");
			});
		else if (b.dataset.pdec)
			void pact({ op: "pdecline", g: b.dataset.pdec }, b);
		else if (b.dataset.pkick)
			void pact({ op: "pkick", who: b.dataset.pkick }, b);
		else if (b.hasAttribute("data-pleave"))
			void pact({ op: "pleave" }, b).then((r) => {
				if (r && r.ok) toast("Ты вышел из группы");
			});
		else if (b.hasAttribute("data-pfr")) void friendsDlg();
		else if (b.dataset.pfight) {
			const id = b.dataset.pfight;
			PT.seen =
				(PT.v && PT.v.party && PT.v.party.fight && PT.v.party.fight.at) ||
				PT.seen;
			pdraw();
			void api("/api/citymon/fight?id=" + encodeURIComponent(id)).then((r) => {
				if (r && r.ok) fightDlg(r.fight);
				else toast((r && r.error) || "не вышло", true);
			});
		}
	}

	async function invite(nk, name) {
		const r = await pact({ op: "pinvite", to: String(nk || "").toLowerCase() });
		if (r && r.ok)
			toast(
				`Приглашение в группу отправлено: ${(r.sent && r.sent.name) || name || nk}`,
			);
		return r;
	}

	function menuItems(nk) {
		if (!groupOn()) return [];
		const l = String(nk || "").toLowerCase(),
			P = PT.v.party,
			my = S.X && S.X.login ? S.X.login() : "";
		if (!l || l === my) return [];
		if (P && P.members.some((m) => m.login === l))
			return P.lead ? [["cmp-kick", "Исключить из группы"]] : [];
		if (P && !P.lead) return [];
		return [
			["cmp-inv", "Пригласить в группу", !!(P && P.members.length >= PT.v.max)],
		];
	}
	function menuAct(k, nk, name) {
		if (k === "cmp-inv") void invite(nk, name);
		else if (k === "cmp-kick")
			void pact({ op: "pkick", who: String(nk || "").toLowerCase() });
	}

	async function friendsDlg() {
		const r = await api("/api/citymon/friends");
		const L = r && r.ok ? r.list || [] : [];
		const row = (f) =>
			`<li><span><b>${esc(f.name || f.login)}</b><small>${f.level ? `${+f.level} ур. · ` : ""}${esc(ROLE_RU[f.role] || "")}${f.on ? ` · ${f.on.here ? "здесь" : "в сети"}` : ""}</small></span>` +
			(f.ok && r.can
				? `<button type="button" class="cm-pb acc sm" data-finv="${esc(f.login)}">Позвать</button>`
				: `<em>${esc(f.why || r.why || "")}</em>`) +
			"</li>";
		const body =
			!r || !r.ok
				? `<p class="cm-ph">${esc((r && r.error) || "Не вышло")}</p>`
				: r.closed
					? '<p class="cm-ph">Друзья пока закрыты.</p>'
					: !L.length
						? '<p class="cm-ph">Друзей пока нет - добавь их правой кнопкой по герою или нику в чате.</p>'
						: `<ul class="cm-pfl">${L.map(row).join("")}</ul>`;
		const d = dialog(
			`<div class="cm-pdlg gw-dk" data-gst="${gst()}"><h3>Пригласить в группу</h3>${r && r.why ? `<p class="cm-ph">${esc(r.why)}</p>` : ""}${body}<div class="cm-btns"><button type="button" class="cm-pb" data-x>Закрыть</button></div></div>`,
			false,
			true,
		);
		d.classList.add("cm-pdw");
		d.addEventListener("click", (e) => {
			const b = e.target.closest && e.target.closest("[data-finv]");
			if (!b) return;
			b.disabled = true;
			void invite(b.dataset.finv).then((x) => {
				if (x && x.ok) {
					b.textContent = "Позвали";
				} else b.disabled = false;
			});
		});
	}

	window.LGCityMon = {
		tick,
		attackDlg,
		eliteDlg,
		fightDlg,
		replay,
		logText,
		lobbies,
		openCount,
		close,
		view: () => S.view,
		menuItems,
		menuAct,
		invite,
		groupOn,
		party: () => PT.v,
		pload,
		friendsDlg,
	};
})();
