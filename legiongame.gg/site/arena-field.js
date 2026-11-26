window.LGArenaField = (() => {
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
	const ROLE = {
		legionary: "Легионер",
		paladin: "Паладин",
		rogue: "Разбойник",
		recruit: "Новобранец",
		archer: "Лучник",
		mage: "Маг",
		necromancer: "Некромант",
		priest: "Жрец",
	};
	const KIND = {
		legionary: "melee",
		paladin: "melee",
		rogue: "melee",
		recruit: "melee",
		archer: "ranged",
		mage: "magic",
		necromancer: "magic",
		priest: "heal",
	};
	const SLOT_LINE = [0, 1, 1, 2, 2];
	const LINE_RU = ["Впереди", "Середина", "Сзади"];

	const POS = [
		[38, 50],
		[24, 31],
		[24, 69],
		[10, 21],
		[10, 79],
	];

	const FY = [50, 32, 68, 18, 82];
	const FY_PC = FY.map((y) => 50 + (y - 50) * 0.75);
	const ICON = {
		melee: '<path d="M5 19l9-9m-6 9l-3-3m4-1l9-9 3-1-1 3-9 9" />',
		ranged:
			'<path d="M5 19c8-2 12-6 14-14M5 19l4-1-3-3zM19 5l-6 2m6-2l-2 6M8 8c3 0 6 3 8 8" />',
		magic:
			'<path d="M12 3l1.8 4.7L19 9l-4 3.3L16.2 18 12 15.2 7.8 18 9 12.3 5 9l5.2-1.3z" />',
		heal: '<path d="M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z" />',
	};
	const RM = () => {
		try {
			return (
				window.matchMedia &&
				window.matchMedia("(prefers-reduced-motion: reduce)").matches
			);
		} catch (e) {
			return false;
		}
	};
	const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
	const plural = (n, a, b, c) => {
		const m = n % 10,
			h = n % 100;
		return m === 1 && h !== 11
			? a
			: m >= 2 && m <= 4 && (h < 10 || h >= 20)
				? b
				: c;
	};
	const icon = (role) =>
		`<svg class="af-ico" viewBox="0 0 24 24" aria-hidden="true">${ICON[KIND[role] || "melee"]}</svg>`;

	function figure(h) {
		try {
			const D = window.MDDoodle;
			if (D && D.jDoodle && h.login) {
				const seed =
					h.seed != null && Number.isFinite(+h.seed)
						? +h.seed >>> 0
						: D.jhash
							? D.jhash(
									String(
										/^lab:/.test(h.login) ? h.name : h.login,
									).toLowerCase(),
								)
							: 1;
				const svg = String(
					D.jDoodle(
						seed,
						"stern",
						false,
						{
							alive: true,
							armed: true,
							gear: h.gear || {},
							who: String(h.login).toLowerCase(),
						},
						h.look || null,
					) || "",
				).replace(
					/<(animate|animateTransform|animateMotion|set)\b[^>]*?(\/>|>[\s\S]*?<\/\1>)/g,
					"",
				);
				if (svg) return `<span class="af-doodle">${svg}</span>`;
			}
		} catch (e) {}
		return `<span class="af-badge k-${KIND[h.role] || "melee"}">${icon(h.role)}</span>`;
	}

	function luckOrder(list) {
		const xs = list
			.filter((h) => h && h.luck != null)
			.sort((a, b) => b.luck - a.luck);
		const out = {};
		let n = 0,
			prev = null;
		xs.forEach((h, i) => {
			if (prev == null || h.luck !== prev) n = i + 1;
			prev = h.luck;
			out[h.login] = n;
		});
		return out;
	}

	function wedge(el, o) {
		let slots = o.slots.slice(),
			sel = -1,
			drag = null,
			tapAt = 0;
		const byL = () =>
			Object.fromEntries((o.heroes || []).map((h) => [h.login, h]));
		function render() {
			const H = byL(),
				ord = luckOrder(slots.map((l) => H[l]));
			const hasLuck = slots.some((l) => H[l] && H[l].luck != null);

			const zones = o.skin
				? [2, 1, 0]
						.map((z) => `<span class="aw-z z${z}" aria-hidden="true"></span>`)
						.join("")
				: "";
			const uid = "awt" + Math.random().toString(36).slice(2, 7);
			el.innerHTML = `<div class="aw${o.mirror ? " mirror" : ""}${o.skin ? " aw-b" : ""}" role="group" aria-label="${esc(o.title || "Расстановка клином")}">
        <div class="aw-field">${o.skin ? o.bg || "" : ""}${zones}${slots
					.map((l, i) => {
						const h = H[l] || { login: l, name: l, role: "recruit", level: 1 };
						const [x, y] = POS[i];
						return `<div class="aw-s" data-i="${i}" style="left:${o.mirror ? 100 - (x / 0.48) : x / 0.48}%;top:${y}%">
            <button type="button" class="aw-c${sel === i ? " sel" : ""}" data-i="${i}" aria-pressed="${sel === i}" ${o.readonly ? "disabled" : ""}
              aria-label="${esc(`${h.name}, ${ROLE[h.role] || h.role}, ${LINE_RU[SLOT_LINE[i]]}${sel === i ? ", выбран" : ""}`)}"${o.skin ? ` aria-describedby="${uid}-${i}"` : ""}>
              ${
								o.skin
									? `<span class="aw-fig">${figure(h)}</span><b class="aw-n">${esc(h.name)}</b>
              <span class="aw-tip" role="tooltip" id="${uid}-${i}"><b>${esc(h.name)}</b>${esc(ROLE[h.role] || h.role)} · ${+h.level || 1} ур.${h.luck != null ? `<br>Удача ${esc(h.luck)}` : ""}${hasLuck && ord[l] ? ` · ход ${ord[l]}` : ""}</span>`
									: `${hasLuck && ord[l] ? `<b class="aw-ord" title="Порядок хода по удаче: у кого больше удачи - ходит раньше">${ord[l]}</b>` : ""}
              <span class="aw-fig">${figure(h)}</span>
              <b class="aw-n">${esc(h.name)}</b>
              <span class="aw-m">${esc(ROLE[h.role] || h.role)} · ${+h.level || 1} ур.</span>
              ${h.luck != null ? `<span class="aw-l">Удача ${esc(h.luck)}</span>` : ""}`
							}
            </button>${o.extra ? o.extra(h, i) : ""}</div>`;
					})
					.join("")}
        <span class="aw-ln l0">Впереди</span><span class="aw-ln l1">Середина</span><span class="aw-ln l2">Сзади</span></div>
        ${o.readonly ? "" : `<p class="aw-hint">${sel >= 0 ? "Теперь нажми героя, с которым поменять" : "Перетащи героя на другое место или нажми двух героев по очереди - они поменяются"}${o.skin ? ". Класс, уровень и удача - наведи на героя или подержи палец" : hasLuck ? ". Цифра - порядок хода по удаче" : ""}</p>`}
      </div>`;
			if (!o.readonly) bind();
		}
		function press(i) {
			if (sel < 0) {
				sel = i;
				render();
			} else if (sel === i) {
				sel = -1;
				render();
			} else {
				swap(sel, i);
			}
			const f = el.querySelector(`.aw-c[data-i="${i}"]`);
			if (f) f.focus();
		}
		function swap(a, b) {
			if (a === b || a < 0 || b < 0) return;
			[slots[a], slots[b]] = [slots[b], slots[a]];
			sel = -1;
			render();
			if (o.onChange) o.onChange(slots.slice());
		}
		function bind() {
			el.querySelectorAll(".aw-c").forEach((c) => {
				c.addEventListener("click", (e) => {
					if ((drag && drag.moved) || Date.now() - tapAt < 600) {
						e.preventDefault();
						return;
					}
					press(+c.dataset.i);
				});
				c.addEventListener("keydown", (e) => {
					if (e.key === "Escape" && sel >= 0) {
						sel = -1;
						render();
					}
				});
				c.addEventListener("pointerdown", (e) => {
					if (e.button !== 0 && e.pointerType === "mouse") return;
					el.querySelectorAll(".aw-c.tip").forEach((x) =>
						x.classList.remove("tip"),
					);
					drag = {
						i: +c.dataset.i,
						x: e.clientX,
						y: e.clientY,
						moved: false,
						id: e.pointerId,
						ghost: null,
						c,
						tip: false,
					};

					if (o.skin && e.pointerType !== "mouse") {
						const d0 = drag;
						d0.tt = setTimeout(() => {
							if (drag === d0 && !d0.moved) {
								d0.tip = true;
								c.classList.add("tip");
							}
						}, 500);
					}
					try {
						c.setPointerCapture(e.pointerId);
					} catch (er) {}
				});
				c.addEventListener("pointermove", (e) => {
					if (!drag || drag.id !== e.pointerId) return;
					const dx = e.clientX - drag.x,
						dy = e.clientY - drag.y;
					if (!drag.moved && Math.hypot(dx, dy) < 8) return;
					if (!drag.moved) {
						drag.moved = true;
						clearTimeout(drag.tt);
						c.classList.remove("tip");
						const g = c.cloneNode(true);
						g.classList.add("aw-ghost");
						g.removeAttribute("data-i");
						const r = c.getBoundingClientRect();
						g.style.width = r.width + "px";
						g.style.left = r.left + "px";
						g.style.top = r.top + "px";

						((o.skin && el.closest(".arb")) || document.body).appendChild(g);
						drag.ghost = g;
						drag.r = r;
						c.classList.add("drag");
						const fl = el.querySelector(".aw-field");
						if (fl) fl.classList.add("aw-dz");
					}
					drag.ghost.style.transform = `translate(${dx}px, ${dy}px)${o.skin ? " scale(1.08)" : ""}`;
					el.querySelectorAll(".aw-c.over, .aw-z.on").forEach((x) =>
						x.classList.remove("over", "on"),
					);
					const t = target(e);
					if (t >= 0 && t !== drag.i) {
						el.querySelector(`.aw-c[data-i="${t}"]`).classList.add("over");
						const z = el.querySelector(`.aw-z.z${SLOT_LINE[t]}`);
						if (z) z.classList.add("on");
					}
				});
				const end = (e) => {
					if (!drag || drag.id !== e.pointerId) return;
					const d = drag;
					clearTimeout(d.tt);
					if (d.ghost) d.ghost.remove();
					if (d.tip && !d.moved) {
						drag = null;
						tapAt = Date.now();
						return;
					}
					c.classList.remove("drag");
					el.querySelectorAll(".aw-c.over, .aw-z.on").forEach((x) =>
						x.classList.remove("over", "on"),
					);
					const fl = el.querySelector(".aw-field");
					if (fl) fl.classList.remove("aw-dz");
					if (d.moved && e.type === "pointerup") {
						const t = target(e);
						setTimeout(() => {
							drag = null;
						}, 0);
						if (t >= 0) swap(d.i, t);
						return;
					}
					drag = null;
					if (e.type === "pointerup") {
						tapAt = Date.now();
						press(d.i);
					}
				};
				c.addEventListener("pointerup", end);
				c.addEventListener("pointercancel", end);
			});
		}
		function target(e) {
			const prev = drag && drag.ghost ? drag.ghost.style.display : "";
			if (drag && drag.ghost) drag.ghost.style.display = "none";
			const x = document.elementFromPoint(e.clientX, e.clientY);
			if (drag && drag.ghost) drag.ghost.style.display = prev;
			const s = x && x.closest ? x.closest(".aw-s") : null;
			return s && el.contains(s) ? +s.dataset.i : -1;
		}
		render();
		return {
			slots: () => slots.slice(),
			set(s) {
				slots = s.slice();
				sel = -1;
				render();
			},
			setHeroes(hs) {
				o.heroes = hs;
				render();
			},
			destroy() {
				el.innerHTML = "";
			},
		};
	}

	const STYLE_SKIN = {
		legion: "forge",
		cats: "den",
		monkeys: "rage",
		veggies: "garden",
		"42brothers": "club",
		cherts: "inferno",
		ugabugi: "cave",
	};
	function skinNow(style) {
		try {
			if (style && STYLE_SKIN[style]) return STYLE_SKIN[style];
			const s = document.documentElement.getAttribute("data-skin");
			if (s) return s;
			const D = window.MDDoodle,
				st = D && (D.active || (D.style && D.style.id));
			return (st && STYLE_SKIN[st]) || "";
		} catch (e) {
			return "";
		}
	}
	let BG = "";
	function arenaBg() {
		if (BG) return BG;
		const r = (v) => Math.round(v * 10) / 10;
		const nz = (i) => {
			const x = Math.sin(i * 12.9898 + 4.1) * 43758.5453;
			return x - Math.floor(x);
		};

		const glow = (x, y, R) =>
			`<circle class="af-gl" cx="${r(x)}" cy="${r(y)}" r="${r(R)}" opacity=".07"/><circle class="af-gl" cx="${r(x)}" cy="${r(y)}" r="${r(R * 0.62)}" opacity=".1"/><circle class="af-gl" cx="${r(x)}" cy="${r(y)}" r="${r(R * 0.32)}" opacity=".16"/>`;
		const flame = (x, y, s = 1) =>
			`<path class="af-fl" d="M${r(x)} ${r(y - 30 * s)}q${r(11 * s)} ${r(13 * s)} ${r(9 * s)} ${r(22 * s)}q${r(-2 * s)} ${r(9 * s)} ${r(-9 * s)} ${r(9 * s)}q${r(-7 * s)} 0 ${r(-9 * s)} ${r(-9 * s)}q${r(-2 * s)} ${r(-9 * s)} ${r(9 * s)} ${r(-22 * s)}z"/><path class="af-fl2" d="M${r(x)} ${r(y - 16 * s)}q${r(5 * s)} ${r(7 * s)} ${r(4 * s)} ${r(11 * s)}q${r(-1 * s)} ${r(4 * s)} ${r(-4 * s)} ${r(4 * s)}q${r(-3 * s)} 0 ${r(-4 * s)} ${r(-4 * s)}q${r(-1 * s)} ${r(-4 * s)} ${r(4 * s)} ${r(-11 * s)}z"/>`;
		const crystal = (x, y, s = 1) =>
			`<path class="af-cr" d="M${r(x - 16 * s)} ${r(y)}l${r(6 * s)} ${r(-30 * s)} ${r(8 * s)} ${r(30 * s)}zM${r(x - 6 * s)} ${r(y)}l${r(8 * s)} ${r(-46 * s)} ${r(10 * s)} ${r(46 * s)}zM${r(x + 8 * s)} ${r(y)}l${r(5 * s)} ${r(-24 * s)} ${r(8 * s)} ${r(24 * s)}z"/><path class="af-cr2" d="M${r(x + 2 * s)} ${r(y - 40 * s)}l${r(-3 * s)} ${r(34 * s)}"/>`;

		const pts = [];
		for (let x = -4, i = 0; x <= 3204; x += 40, i++)
			pts.push(`${x} ${r(36 + nz(i) * 30 + (i % 9 === 4 ? 28 : 0))}`);
		let seams = "M0 104H3200M0 134H3200";
		for (let x = 0, i = 0; x < 3200; x += 64, i++)
			seams += `M${x + (i % 2) * 32} 104V134M${x} 134V160`;
		let ivy = "";
		for (let i = 1; i < 80; i += 5) {
			const x = -4 + i * 40,
				y = 36 + nz(i) * 30 + (i % 9 === 4 ? 28 : 0);
			ivy += `<path d="M${x - 6} ${r(y + 2)}q-3 ${r(16 + nz(i + 9) * 18)} 4 ${r(30 + nz(i + 3) * 20)}q5-14 2-${r(30 + nz(i + 3) * 20)}z"/>`;
		}
		let arches = "",
			cols = "",
			torch = "",
			crys = "";
		for (let k = 0; k < 10; k++) {
			const ax = 160 + k * 320,
				cx = k * 320;
			arches += `<path class="af-arch" d="M${ax - 56} 160V112a56 42 0 0 1 112 0V160z"/><path class="af-arch2" d="M${ax - 68} 160V112a68 54 0 0 1 136 0V160"/>`;

			const top = r(18 + nz(k + 50) * 66),
				whole = nz(k + 70) > 0.62;
			cols +=
				`<path class="af-col" d="M${cx - 22} 152V${whole ? top : r(top + 8)}${whole ? `h44` : `l10 -8 8 10 10 -12 16 14`}V152z"/>` +
				`<path class="af-flute" d="M${cx - 8} ${r(top + 14)}V150M${cx + 8} ${r(top + 18)}V150"/>` +
				(whole
					? `<rect class="af-col" x="${cx - 30}" y="${r(top - 10)}" width="60" height="12"/>`
					: "") +
				`<rect class="af-col" x="${cx - 30}" y="148" width="60" height="12"/>`;
			if (k % 2) {
				const ty = Math.max(96, top + 40);
				torch +=
					glow(cx, ty - 18, 120) +
					`<path class="af-br" d="M${cx - 9} ${ty + 16}h18l-4-16h-10z"/>` +
					flame(cx, ty, 1.5);
				crys += glow(cx + 40, 136, 80) + crystal(cx + 40, 160);
			}
		}
		const wall = `<svg viewBox="0 0 3200 160" preserveAspectRatio="xMidYMax slice" focusable="false">
      <rect class="af-dark" x="0" y="0" width="3200" height="160"/>
      <path class="af-wface" d="M-4 160L${pts.join("L")}L3204 160z"/><path class="af-seam" d="${seams}"/>
      ${arches}<g class="af-ivy">${ivy}</g>${cols}<g class="af-torch">${torch}</g><g class="af-crys">${crys}</g></svg>`;

		const VP = 1500;
		let grid = "";
		for (let t = 1; t <= 7; t++) {
			const y = r(1000 * (t / 7.4) ** 1.45);
			grid += `M0 ${y}H1600`;
		}
		for (let xb = -1000; xb <= 2600; xb += 200) {
			if (xb === 800) continue;
			const xt = 800 + (xb - 800) * (VP / (VP + 1000));
			grid += `M${r(xt)} 0L${xb} 1000`;
		}
		let fcr = "",
			moss = "";
		for (let i = 0; i < 16; i++) {
			let x = 60 + nz(i + 100) * 1480,
				y = 60 + nz(i + 200) * 900;
			fcr += `M${r(x)} ${r(y)}`;
			for (let s = 0; s < 4; s++) {
				x += (nz(i * 7 + s) - 0.5) * 90;
				y += 20 + nz(i * 5 + s + 30) * 40;
				fcr += `L${r(x)} ${r(y)}`;
			}
		}
		for (let i = 0; i < 18; i++) {
			const x =
					(i % 2 ? 1400 : 0) +
					nz(i + 300) * 200 +
					(i % 3 === 0 ? (i % 2 ? -380 : 380) * nz(i + 310) : 0),
				y = 80 + nz(i + 400) * 880;
			moss += `<ellipse cx="${r(x)}" cy="${r(y)}" rx="${r(30 + nz(i + 500) * 50)}" ry="${r(10 + nz(i + 600) * 14)}"/>`;
		}
		const floor = `<svg class="af-floor" viewBox="0 0 1600 1000" preserveAspectRatio="none" focusable="false">
      <g class="af-moss">${moss}</g>
      <path class="af-plates" d="${grid}" vector-effect="non-scaling-stroke"/>
      <path class="af-fcrack" d="${fcr}" vector-effect="non-scaling-stroke"/>
      <path class="af-edge" d="M0 3H1600" vector-effect="non-scaling-stroke"/>
      <path class="af-clg" d="M800 0V1000" vector-effect="non-scaling-stroke"/><path class="af-cl" d="M800 0V1000" vector-effect="non-scaling-stroke"/></svg>`;

		const GLYPH = [
			"M-6 8V-8M-6-2l8-6M-6 4l8-6",
			"M-6 8V-8l10 8-10 8",
			"M0 8V-8M-7-4l7 4 7-4",
			"M-7 8l7-16 7 16M-4 2h8",
			"M-6-8l12 16M6-8L-6 8",
			"M0-8v16M-6-2h12",
		];
		let runes = "";
		for (let i = 0; i < 12; i++) {
			const a = (i / 12) * Math.PI * 2;
			runes += `<path transform="translate(${r(800 + Math.cos(a) * 134)} ${r(372 + Math.sin(a) * 52)}) scale(1.1 .65)" d="${GLYPH[i % GLYPH.length]}"/>`;
		}
		const rune = `<svg class="af-runes" viewBox="0 0 1600 820" preserveAspectRatio="xMidYMid slice" focusable="false">
      <ellipse class="af-rg" cx="800" cy="372" rx="152" ry="62"/><ellipse class="af-ring" cx="800" cy="372" rx="152" ry="62"/><ellipse class="af-ring" cx="800" cy="372" rx="116" ry="44"/>
      <g class="af-rgl">${runes}</g><g class="af-rgt">${runes}</g></svg>`;

		const rub = (x, y, s, seed) => {
			let o = "";
			for (let i = 0; i < 6; i++) {
				const w = (14 + nz(seed + i) * 26) * s,
					h = (10 + nz(seed + i + 20) * 16) * s,
					px = x + (nz(seed + i + 40) - 0.5) * 90 * s,
					py = y - nz(seed + i + 60) * 22 * s;
				o += `<path d="M${r(px - w / 2)} ${r(py)}l${r(w * 0.15)} ${r(-h)} ${r(w * 0.6)} ${r(-h * 0.2)} ${r(w * 0.25)} ${r(h * 1.2)}z"/>`;
			}
			return `<g class="af-rubble">${o}</g>`;
		};
		const at = (x, y, sc, rot, body) =>
			`<g transform="translate(${x} ${y})${rot ? ` rotate(${rot})` : ""} scale(${sc})">${body}</g>`;
		const M = {
			fish: '<g class="m3"><path d="M-50 0h100M-50 0l-22-14v28zM50 0l18-12M50 0l18 12M-28 0l-7-14M-28 0l-7 14M-10 0l-7-16M-10 0l-7 16M8 0l-7-14M8 0l-7 14M26 0l-6-11M26 0l-6 11"/><circle cx="61" cy="-2" r="3"/></g>',
			yarn: '<circle class="m1" cx="0" cy="0" r="24"/><path class="m2" d="M-22-8q22-24 44 4M-20 10q20-18 40 6M-8-20q20 10 26 40"/><path class="m3" d="M22 12q30 4 50 22"/>',
			shield:
				'<rect class="m1" x="-30" y="-42" width="60" height="84" rx="11"/><circle class="m2" cx="0" cy="0" r="11"/><path class="m3" d="M-30-6h60M-12-42l7 28-10 20 9 36"/>',
			pilum:
				'<path class="m3" d="M-60 10l110-40"/><path class="m2" d="M48-34l20-8-10 16z"/>',
			banana:
				'<path class="m1" d="M-40 10q30-40 70-30q-30 0-46 34zM-10-8q-4-34 16-50q-6 26 0 48zM2-4q26-20 48-10q-26 6-40 22z"/>',
			shroom:
				'<path class="m3" d="M-60-30q50 10 80 40"/><path class="m2" d="M-14 0v-26h10v26zM16 0v-18h8v18z"/><path class="m1" d="M-32-24q23-34 46 0zM6-16q14-22 28 0z"/>',
			coins:
				'<g class="m1"><ellipse cx="-20" cy="-4" rx="15" ry="7"/><ellipse cx="10" cy="4" rx="15" ry="7"/><ellipse cx="-32" cy="8" rx="15" ry="7"/><ellipse cx="22" cy="-10" rx="15" ry="7"/></g><path class="m2" d="M-28-4h16M2 4h16M14-10h16"/>',
			bones:
				'<path class="m1" d="M-40 6l80-22"/><g class="m1"><circle cx="-44" cy="0" r="7"/><circle cx="-38" cy="12" r="7"/><circle cx="38" cy="-22" r="7"/><circle cx="46" cy="-12" r="7"/></g>',
			skull:
				'<path class="m1" d="M-30 0q0-32 30-32t30 32v14h-60z"/><g class="m2"><circle cx="-11" cy="-6" r="7"/><circle cx="11" cy="-6" r="7"/><path d="M-6 12v-6M6 12v-6"/></g>',
			lavapool:
				'<ellipse class="m2" cx="0" cy="0" rx="46" ry="12" opacity=".45"/><ellipse class="m1" cx="0" cy="0" rx="30" ry="7"/>',
		};
		const mot = (cls, body) => `<g class="af-m af-${cls}">${body}</g>`;
		const prop = (cls, body) =>
			`<svg class="af-prop ${cls}" viewBox="0 0 160 90" focusable="false">${body}</svg>`;
		const props =
			prop(
				"p-bl",
				rub(56, 88, 0.85, 31) +
					mot("fish", at(104, 76, 0.55, -8, M.fish)) +
					mot("shield", at(112, 58, 0.55, -20, M.shield)) +
					mot("banana", at(110, 80, 0.7, 0, M.banana)) +
					mot("shroom", at(112, 88, 0.8, 0, M.shroom)) +
					mot("coins", at(112, 80, 0.8, 0, M.coins)) +
					mot("bones", at(110, 78, 0.7, 0, M.bones)) +
					mot("lavapool", at(112, 80, 0.8, 0, M.lavapool)),
			) +
			prop(
				"p-br",
				rub(104, 88, 0.85, 62) +
					mot("yarn", at(52, 66, 0.8, 0, M.yarn)) +
					mot("shield", at(48, 70, 0.6, 0, M.pilum)) +
					mot("banana", at(50, 82, 0.6, 0, M.banana)) +
					mot("shroom", at(46, 88, 0.7, 0, M.shroom)) +
					mot("coins", at(48, 80, 0.8, 0, M.coins)) +
					mot("bones", at(50, 82, 0.7, 0, M.skull)) +
					mot("lavapool", at(48, 80, 0.7, 0, M.lavapool)),
			) +
			prop(
				"p-bc",
				'<g class="af-drum"><rect x="20" y="44" width="110" height="40" rx="6"/><ellipse cx="130" cy="64" rx="11" ry="20"/><path d="M44 48v32M72 46v36M100 46v36"/></g>' +
					rub(30, 88, 0.45, 93),
			) +
			prop("p-tl", rub(80, 88, 0.6, 124)) +
			prop("p-tr", rub(80, 88, 0.6, 155));

		const paw = (x, y, a, s) =>
			`<g transform="translate(${r(x)} ${r(y)}) rotate(${r(a)}) scale(${s})"><ellipse cx="0" cy="3" rx="7" ry="6"/><circle cx="-7" cy="-6" r="2.6"/><circle cx="-2.4" cy="-9.5" r="2.6"/><circle cx="2.4" cy="-9.5" r="2.6"/><circle cx="7" cy="-6" r="2.6"/></g>`;
		let paws = "";
		const trail = (x0, y0, x1, y1, n, s) => {
			const a = Math.atan2(y1 - y0, x1 - x0),
				deg = (a * 180) / Math.PI + 90;
			for (let i = 0; i < n; i++) {
				const t = i / (n - 1),
					sd = i % 2 ? 9 : -9;
				paws += paw(
					x0 + (x1 - x0) * t - Math.sin(a) * sd,
					y0 + (y1 - y0) * t + Math.cos(a) * sd,
					deg,
					s,
				);
			}
		};
		trail(220, 560, 560, 300, 8, 1.25);
		trail(1400, 280, 1060, 560, 8, 1.25);
		const lava =
			"M200 520l60-30 30 20 70-40 40 12M1420 500l-50-36-40 18-60-30-30 10M660 560l40-46 50 6 20-30M300 330l50 20 20-24 44 6M1320 340l-46 22-24-18-40 10";
		const deco = `<svg class="af-deco" viewBox="0 0 1600 820" preserveAspectRatio="xMidYMid slice" focusable="false">
      <g class="af-m af-paws">${paws}</g><g class="af-m af-lava"><path class="m2" d="${lava}"/><path class="m1" d="${lava}"/></g></svg>${props}`;

		const pillar = `<path class="af-col" d="M14 560V118l12-14 10 16 14-22 12 18 16-10V560z"/><path class="af-flute" d="M32 136V556M50 126V556M66 130V556"/>
      <g class="af-ivy"><path d="M26 104q-8 70 6 130q8-60-6-130zM70 110q8 50-4 96q-6-50 4-96z"/></g>
      <rect class="af-col" x="2" y="556" width="96" height="44"/><path class="af-seam" d="M2 576h96"/>`;
		const side = (cls, ar, flip) =>
			`<svg class="af-pil ${cls}" viewBox="0 0 120 600" preserveAspectRatio="${ar} meet" focusable="false"><g${flip ? ' transform="translate(120 0) scale(-1 1)"' : ""}>${pillar}</g></svg>`;
		BG = `<div class="af-bg" aria-hidden="true"><div class="af-stone"></div>${floor}${rune}${deco}<div class="af-wall">${wall}</div>${side("l", "xMinYMax", false)}${side("r", "xMaxYMax", true)}<div class="af-vig"></div></div>`;
		return BG;
	}

	function locBg(loc) {
		try {
			const L = window.LGArenaLocs;
			return loc && L && L.bg ? L.bg(String(loc)) : null;
		} catch (e) {
			return null;
		}
	}
	const locName = (loc) => {
		try {
			const L = window.LGArenaLocs;
			return loc && L ? L.name(String(loc)) : "";
		} catch (e) {
			return "";
		}
	};

	const BIO_OF = { taiga: "ice", ash: "mount", blight: "swamp", ruin: "mount" };
	const NAT_BIO = [
		"forest",
		"meadow",
		"mount",
		"swamp",
		"desert",
		"ice",
		"coast",
	];
	const natBio = (b) =>
		NAT_BIO.includes(b) ? b : NAT_BIO.includes(BIO_OF[b]) ? BIO_OF[b] : null;
	const NBG = {};
	function natBg(bio) {
		if (NBG[bio]) return NBG[bio];
		const r = (v) => Math.round(v * 10) / 10;
		const nz = (i) => {
			const x = Math.sin(i * 12.9898 + 7.3) * 43758.5453;
			return x - Math.floor(x);
		};

		const crowns = (y0, h, step, cls, seed) => {
			let d = `M-10 160V${y0}`;
			for (let x = -10, i = 0; x < 3220; x += step, i++) {
				const t = y0 - h * (0.5 + nz(seed + i) * 0.5);
				d += `Q${r(x + step / 2)} ${r(t - h * 0.5)} ${r(x + step)} ${r(y0 - nz(seed + i + 50) * h * 0.3)}`;
			}
			return `<path class="${cls}" d="${d}V160z"/>`;
		};
		const pine = (x, y, s, cls) =>
			`<path class="${cls}" d="M${r(x)} ${r(y - 70 * s)}l${r(18 * s)} ${r(30 * s)}h${r(-8 * s)}l${r(16 * s)} ${r(24 * s)}h${r(-9 * s)}l${r(17 * s)} ${r(22 * s)}h${r(-68 * s)}l${r(17 * s)} ${r(-22 * s)}h${r(-9 * s)}l${r(16 * s)} ${r(-24 * s)}h${r(-8 * s)}z"/>`;
		const hills = (y0, amp, n, cls, seed) => {
			let d = `M-10 160V${y0}`;
			const w = 3220 / n;
			for (let i = 0; i < n; i++)
				d += `Q${r(-10 + w * i + w / 2)} ${r(y0 - amp * (0.4 + nz(seed + i) * 0.6))} ${r(-10 + w * (i + 1))} ${r(y0 + nz(seed + i + 9) * 8)}`;
			return `<path class="${cls}" d="${d}V160z"/>`;
		};
		let hz = '<rect class="nb-sky" x="0" y="0" width="3200" height="160"/>';
		if (bio === "forest") {
			hz += crowns(70, 40, 90, "nb-far", 1) + crowns(110, 46, 120, "nb-mid", 2);
			for (let i = 0; i < 26; i++)
				hz += pine(
					60 + i * 124 + nz(i) * 40,
					160,
					0.9 + nz(i + 3) * 0.5,
					"nb-near",
				);
		} else if (bio === "meadow") {
			hz += hills(80, 40, 6, "nb-far", 3) + hills(118, 26, 9, "nb-mid", 4);
			for (let i = 0; i < 12; i++) {
				const x = 140 + i * 260 + nz(i) * 80;
				hz += `<path class="nb-near" d="M${r(x - 3)} 160v-26h6v26zM${r(x)} ${r(118 - nz(i + 5) * 10)}a22 18 0 1 1 0.1 0z"/>`;
			}
			hz += `<path class="nb-line" d="M0 146H3200${Array.from({ length: 40 }, (_, i) => `M${i * 80 + 10} 138v20`).join("")}"/>`;
		} else if (bio === "mount") {
			let d = "M-10 160V90";
			for (let x = -10, i = 0; x < 3220; x += 220, i++)
				d += `L${r(x + 110)} ${r(14 + nz(i) * 40)}L${r(x + 220)} ${r(80 + nz(i + 7) * 30)}`;
			hz += `<path class="nb-far" d="${d}V160z"/>`;
			let cap = "";
			for (let x = -10, i = 0; x < 3220; x += 220, i++) {
				const t = 14 + nz(i) * 40;
				cap += `M${r(x + 110)} ${r(t)}l26 ${r(24)}l-12 -4l-10 8l-8 -10l-10 6z`;
			}
			hz +=
				`<path class="nb-snow" d="${cap}"/>` + hills(124, 34, 8, "nb-mid", 6);
			for (let i = 0; i < 14; i++) {
				const x = 100 + i * 230 + nz(i) * 60;
				hz += `<path class="nb-near" d="M${r(x - 40)} 160q6 -30 40 -34q34 4 40 34z"/>`;
			}
		} else if (bio === "swamp") {
			hz +=
				crowns(96, 26, 140, "nb-far", 7) +
				`<rect class="nb-mist" x="0" y="100" width="3200" height="30"/>`;
			for (let i = 0; i < 16; i++) {
				const x = 90 + i * 200 + nz(i) * 70;
				hz += `<path class="nb-dead" d="M${r(x)} 160v-70l-24 -26M${r(x)} 118l20 -22l14 4M${r(x)} 104l-16 -8"/>`;
			}
			let reeds = "";
			for (let i = 0; i < 90; i++) {
				const x = i * 36 + nz(i) * 20;
				reeds += `M${r(x)} 160q${r(-4 + nz(i + 1) * 8)} -20 ${r(-2 + nz(i + 2) * 4)} -${r(20 + nz(i + 3) * 16)}`;
			}
			hz += `<path class="nb-reed" d="${reeds}"/>`;
		} else if (bio === "desert") {
			hz += hills(84, 30, 5, "nb-far", 8) + hills(122, 22, 7, "nb-mid", 9);
			for (let i = 0; i < 6; i++) {
				const x = 260 + i * 520 + nz(i) * 140;
				hz +=
					i % 2
						? `<path class="nb-near" d="M${r(x - 8)} 160v-58q0-10 8-10t8 10v58zM${r(x - 8)} 132h-14v-20q0-6 6-6t6 6v8h2M${r(x + 8)} 124h14v-18q0-6 -6-6t-6 6v6h-2"/>`
						: `<path class="nb-ruin" d="M${r(x - 16)} 160v-74l6 -6l10 8l8 -10l8 6v76z"/>`;
			}
		} else if (bio === "ice") {
			hz += hills(76, 36, 6, "nb-far", 10) + hills(116, 24, 9, "nb-mid", 11);
			for (let i = 0; i < 22; i++)
				hz += pine(
					80 + i * 146 + nz(i) * 50,
					160,
					0.7 + nz(i + 4) * 0.4,
					"nb-near",
				);
		} else if (bio === "coast") {
			hz += `<rect class="nb-sea" x="0" y="70" width="3200" height="90"/>`;
			let w = "";
			for (let i = 0; i < 70; i++) {
				const x = i * 48 + nz(i) * 20,
					y = 84 + nz(i + 2) * 60;
				w += `M${r(x)} ${r(y)}q8 -5 16 0q8 5 16 0`;
			}
			hz +=
				`<path class="nb-wave" d="${w}"/>` +
				`<path class="nb-foam" d="M-10 150Q200 136 400 150T800 150T1200 150T1600 150T2000 150T2400 150T2800 150T3210 150V160H-10z"/>`;
			for (let i = 0; i < 5; i++) {
				const x = 300 + i * 640 + nz(i) * 200;
				hz += `<path class="nb-near" d="M${r(x - 50)} 160q10 -40 50 -46q40 8 46 46z"/>`;
			}
		}
		const wall = `<svg viewBox="0 0 3200 160" preserveAspectRatio="xMidYMax slice" focusable="false">${hz}</svg>`;

		let g = "";
		for (let i = 0; i < 70; i++) {
			const x = r(30 + nz(i + 100) * 1540),
				y = r(30 + nz(i + 200) * 760),
				k = i % 5;
			if (Math.abs(x - 800) < 260 && Math.abs(y - 400) < 170) continue;
			if (bio === "forest" || bio === "meadow")
				g +=
					k < 3
						? `<path class="nb-tuft" d="M${x - 8} ${y}l3 -12M${x} ${y}v-15M${x + 8} ${y}l-3 -12"/>`
						: k === 3
							? `<circle class="nb-fl" cx="${x}" cy="${y}" r="5"/>`
							: `<ellipse class="nb-pat" cx="${x}" cy="${y}" rx="40" ry="10"/>`;
			else if (bio === "mount")
				g +=
					k < 2
						? `<path class="nb-pebble" d="M${x - 12} ${y}q2 -12 12 -12q12 2 12 12z"/>`
						: k < 4
							? `<path class="nb-crack" d="M${x - 30} ${y}l14 -6l10 8l16 -4"/>`
							: `<path class="nb-tuft" d="M${x - 6} ${y}l2 -10M${x} ${y}v-12M${x + 6} ${y}l-2 -10"/>`;
			else if (bio === "swamp")
				g +=
					k < 2
						? `<ellipse class="nb-pud" cx="${x}" cy="${y}" rx="${r(34 + nz(i) * 30)}" ry="${r(9 + nz(i + 1) * 6)}"/>`
						: k < 4
							? `<path class="nb-tuft" d="M${x - 6} ${y}q-2 -14 -6 -20M${x} ${y}v-22M${x + 6} ${y}q2 -14 6 -20"/>`
							: `<path class="nb-crack" d="M${x - 24} ${y}q12 -6 24 0t24 0"/>`;
			else if (bio === "desert")
				g +=
					k < 3
						? `<path class="nb-rip" d="M${x - 50} ${y}q25 -10 50 0t50 0"/>`
						: k === 3
							? `<path class="nb-pebble" d="M${x - 10} ${y}q2 -10 10 -10q10 2 10 10z"/>`
							: `<path class="nb-bone" d="M${x - 16} ${y}l32 -8"/>`;
			else if (bio === "ice")
				g +=
					k < 3
						? `<path class="nb-rip" d="M${x - 46} ${y}q23 -8 46 0t46 0"/>`
						: k === 3
							? `<path class="nb-ice" d="M${x - 30} ${y}l20 -10l30 4l10 8z"/>`
							: `<circle class="nb-fl" cx="${x}" cy="${y}" r="3"/>`;
			else if (bio === "coast")
				g +=
					k < 2
						? `<path class="nb-rip" d="M${x - 40} ${y}q20 -8 40 0t40 0"/>`
						: k === 2
							? `<path class="nb-shell" d="M${x - 9} ${y}q0 -14 9 -14q9 0 9 14z"/>`
							: k === 3
								? `<path class="nb-star" d="M${x} ${y - 10}l3 7l7 1l-5 5l1 7l-6 -3l-6 3l1 -7l-5 -5l7 -1z"/>`
								: `<path class="nb-pebble" d="M${x - 10} ${y}q2 -10 10 -10q10 2 10 10z"/>`;
		}
		const floor = `<svg class="af-deco nb-ground" viewBox="0 0 1600 820" preserveAspectRatio="xMidYMid slice" focusable="false"><ellipse class="nb-trod" cx="800" cy="420" rx="560" ry="230"/>${g}</svg>`;

		const SIDE = {
			forest:
				'<path class="nb-trunk" d="M52 600V330h18v270z"/><path class="nb-leaf" d="M60 120q50 10 54 70q20 40 -10 80q-10 50 -50 50q-50 4 -56 -50q-30 -40 0 -80q4 -60 62 -70z"/><path class="nb-leaf2" d="M30 200q20 -50 60 -40" fill="none" stroke-width="10"/>',
			meadow:
				'<path class="nb-leaf" d="M10 600q-6 -90 40 -110q46 -10 60 40q20 40 4 70z"/><circle class="nb-fl" cx="40" cy="520" r="7"/><circle class="nb-fl" cx="80" cy="540" r="6"/>',
			mount:
				'<path class="nb-rock" d="M0 600V420l30 -60l40 10l30 50l20 30V600z"/><path class="nb-crack" d="M30 400l14 40l-10 30M80 430l-6 50"/>',
			swamp:
				'<path class="nb-trunk" d="M48 600V300l-30 -60M60 360l40 -50l16 6M54 300l-10 -40" fill="none" stroke-width="14"/><path class="nb-reed" d="M10 600q4 -60 0 -110M24 600q-4 -70 6 -130M100 600q-6 -60 -2 -100"/>',
			desert:
				'<path class="nb-leaf" d="M50 600V330q0 -24 16 -24t16 24v270zM50 440H22v-60q0 -14 12 -14t12 14v34h4M82 410h26v-50q0 -14 -12 -14t-12 14v24h-2"/>',
			ice: '<path class="nb-trunk" d="M54 600v-50h14v50z"/><path class="nb-leaf" d="M61 260l40 80h-18l34 70h-20l36 80H-3l36 -80H13l34 -70H29z"/><path class="nb-snow" d="M61 260l16 34l-16 -6l-16 6zM40 340l20 -6l20 6l-10 10zM30 410l30 -6l30 6l-14 12z"/>',
			coast:
				'<path class="nb-rock" d="M0 600V470q20 -40 60 -40q50 10 60 60V600z"/><path class="nb-foam" d="M0 590q30 -16 60 0t60 0V600H0z"/>',
		};
		const side = (cls, ar, flip) =>
			`<svg class="af-pil nb-side ${cls}" viewBox="0 0 120 600" preserveAspectRatio="${ar} meet" focusable="false"><g${flip ? ' transform="translate(120 0) scale(-1 1)"' : ""}>${SIDE[bio] || ""}</g></svg>`;
		NBG[bio] =
			`<div class="af-bg af-nat" data-bio="${bio}" aria-hidden="true"><div class="af-stone"></div>${floor}<div class="af-wall">${wall}</div>${side("l", "xMinYMax", false)}${side("r", "xMaxYMax", true)}<div class="af-vig"></div></div>`;
		return NBG[bio];
	}

	const BASE = {
		round: 650,
		hit: 760,
		heal: 620,
		act: 560,
		dot: 520,
		phoenix: 900,
		ab: 900,
		ult: 1500,
		st: 260,
		revive: 1000,
		skel: 520,
		skeld: 620,
	};
	const ST_ICON = {
		mark: "☠",
		guard: "⛨",
		shield: "◈",
		ward: "◈",
		buff: "▲",
		curse: "✶",
		poison: "☣",
		burn: "♨",
		chill: "❄",
		dodge: "≋",
		holy: "✧",
		last: "♥",
		judged: "☀",
		vuln: "◎",
	};
	const SPEEDS = [1, 2, 4];

	const ST_RU = {
		mark: "Метка: получает больше урона",
		guard: "Стойка",
		shield: "Щит",
		buff: "Усиление",
		curse: "Проклятие: бьёт слабее",
		poison: "Яд",
	};

	function play(el, F, o = {}) {
		const units = {},
			order = {};
		const all = [
			...F.teams.atk.map((h) => ({ ...h, side: "atk" })),
			...F.teams.def.map((h) => ({ ...h, side: "def" })),
		];
		const hasAb = (F.log || []).some((e) => e.t === "ab");
		const me = F.me;
		const lab = o.labels || {
			atk:
				F.kind === "duel"
					? F.atkName
						? `Нападение: ${F.atkName}`
						: "Нападение"
					: "Команда 1",
			def:
				F.kind === "duel"
					? F.defName
						? `Оборона: ${F.defName}`
						: "Оборона"
					: "Команда 2",
		};
		let speed = SPEEDS.includes(+o.speed) ? +o.speed : 1,
			run = 0,
			idx = 0,
			done = false,
			turns = {},
			actor = null,
			curOrder = [],
			roundNo = 0;
		const logLines = [];
		const sk = skinNow(o.style);

		const nb = o.bg ? natBio(String(o.bg)) : null;
		const glowAt = turnGlow(F.log || []);
		let glowK = null;
		el.innerHTML = `<div class="af${o.noTurnNum ? " af-nonum" : ""}" data-state="play"${sk ? ` data-ask="${esc(sk)}"` : ""}${nb ? ` data-bio="${nb}"` : ""} style="--af-sp:${speed}">
      <div class="af-top"><b class="af-side atk"><span class="af-sn">${esc(lab.atk)}</span></b><span class="af-round" aria-live="polite">Раунд 1</span><b class="af-side def"><span class="af-sn">${esc(lab.def)}</span></b></div>
      <div class="af-qrow">${!nb && locName(F.loc) ? `<span class="af-locn" title="Где идёт бой">${esc(locName(F.loc))}</span>` : ""}${F.lt ? '<span class="af-lt" title="Решение стримера 10.11: на Арене первой ходит наибольшая удача">Ход по удаче</span>' : ""}<div class="af-queue" aria-label="Очередь хода раунда${F.lt ? " (по удаче)" : ""}"></div></div>
      <div class="af-stage"><div class="af-field" role="img" aria-label="Поле боя: два клина друг напротив друга"><div class="af-cam">
        ${nb ? natBg(nb) : locBg(F.loc) || arenaBg()}
        ${all
					.map((h) => {
						const i = +h.k.slice(1),
							ln = SLOT_LINE[i] == null ? 1 : SLOT_LINE[i],
							y = FY_PC[i] == null ? 50 : FY_PC[i],
							dy = FY[i] == null ? 0 : FY[i] - 50;

						return `<div class="af-u ${h.side}${h.shadow ? " shadow" : ""}${me && h.side === me ? " mine" : ""}${y < 30 ? " af-up" : ""}${ln === 2 ? " af-b2" : ""}${y <= 50 ? " af-oc" : ""}" data-k="${h.k}" style="--ln:${ln};--z:${1 + [2, 1, 3, 0, 4][i]};--dy:${dy}">
            <b class="af-ord" hidden></b><div class="af-st"></div><div class="af-cap" hidden></div>
            <div class="af-fig">${(o.figure && o.figure(h)) || figure(h)}</div>
            <div class="af-hp" role="meter" aria-label="Здоровье ${esc(h.name)}" aria-valuemin="0" aria-valuemax="${h.hp}" aria-valuenow="${h.hp}"><i></i><i class="w"></i></div>
            <span class="af-nm">${esc(h.name)}</span>
            ${hasAb ? '<div class="af-cnt" aria-hidden="true"><span class="d"><i></i><i></i><i></i></span><svg class="r" viewBox="0 0 20 20">' + [0, 1, 2, 3, 4].map((n) => `<path data-n="${n}" d="${arc(n)}"/>`).join("") + "</svg></div>" : ""}
          </div>`;
					})
					.join("")}
        <div class="af-fx" aria-hidden="true"></div>
        <div class="af-ult" hidden></div>
      </div></div></div>
      <div class="af-bar">
        <div class="af-speed" role="group" aria-label="Скорость повтора">
          ${SPEEDS.map((n) => `<button type="button" class="btn ghost sm" data-sp="${n}" aria-pressed="${n === speed}">×${n}</button>`).join("")}
          <span class="af-alt"><button type="button" class="btn ghost sm" data-sp="skip">Пропустить</button><button type="button" class="btn sm ghost af-replay" hidden>Повтор</button></span>
        </div>
      </div>
      <ol class="af-log" aria-label="Лог хода" aria-live="off"></ol>
      <div class="af-res" hidden></div>
    </div>`;

		const root = el.querySelector(".af"),
			field = root.querySelector(".af-field"),
			cam = field.querySelector(".af-cam"),
			layer = field.querySelector(".af-fx");

		const hp0 = (h) => (h.hp0 > 0 && h.hp0 < h.hp ? h.hp0 : h.hp);
		for (const h of all)
			units[h.k] = {
				h,
				el: field.querySelector(`.af-u[data-k="${h.k}"]`),
				hp: hp0(h),
				max: h.hp,
				dead: false,
				st: {},
			};

		const skels = {},
			skAt = {};
		const hasSkel = (F.log || []).some((e) => e.t === "skel");
		const nameOf = (k) =>
			units[k]
				? units[k].h.name
				: skAt[k]
					? `скелет (${units[skAt[k].a] ? units[skAt[k].a].h.name : ""})`
					: k;
		const actName = (id, e) =>
			(e && (e.name || e.ab)) || (F.acts && F.acts[id]) || null;

		function later(fn, ms) {
			const my = run;
			if (!(ms > 0)) {
				fn();
				return;
			}
			setTimeout(() => {
				if (my === run) fn();
			}, ms / speed);
		}

		function bar(u, instant) {
			const p = u.max ? (u.hp / u.max) * 100 : 0;
			const b = u.el.querySelector(".af-hp"),
				[fill, wake] = b.querySelectorAll("i");
			fill.style.width = p + "%";
			b.classList.toggle("low", p < 30);
			if (instant) wake.style.width = p + "%";
			else {
				const my = run;
				setTimeout(() => {
					if (my === run) wake.style.width = p + "%";
				}, 280 / speed);
			}
		}
		function setHp(u, hp, instant, delay) {
			u.hp = Math.max(0, Math.min(u.max, hp));
			u.el
				.querySelector(".af-hp")
				.setAttribute("aria-valuenow", String(Math.round(u.hp)));
			if (instant || !delay) bar(u, instant);
			else later(() => bar(u, false), delay);
		}
		function die(u, on, delay) {
			u.dead = on;
			if (delay) later(() => u.el.classList.toggle("dead", u.dead), delay);
			else u.el.classList.toggle("dead", on);
		}
		function sync() {
			for (const u of Object.values(units)) {
				bar(u, true);
				u.el.classList.toggle("dead", u.dead);
			}
		}

		function pos(k) {
			const u = units[k] || skAt[k];
			if (!u) return { x: 0, y: 0, w: 60, h: 66 };
			const f = u.el.querySelector(units[k] ? ".af-fig" : ".af-skf"),
				fr = field.getBoundingClientRect(),
				r = f.getBoundingClientRect();
			return {
				x: r.left - fr.left + r.width / 2,
				y: r.top - fr.top + r.height / 2,
				w: r.width || 60,
				h: r.height || 66,
			};
		}
		const X = fxKit({
			field,
			cam,
			layer,
			units,
			pos,
			speed: () => speed,
			later,
			rm: RM,
			sideOf: (k) =>
				skAt[k] && units[skAt[k].a] ? units[skAt[k].a].h.side : "atk",
		});
		X.skelLive = hasSkel;

		function skLayout(a) {
			(skels[a] || []).forEach((x, j) => {
				x.el.classList.remove("j0", "j1", "j2");
				x.el.classList.add("j" + Math.min(2, j));
			});
		}
		function skBar(x) {
			const b = x.el.querySelector(".af-skhp"),
				p = x.max ? Math.max(0, x.hp / x.max) * 100 : 0;
			b.firstElementChild.style.width = p + "%";
			b.setAttribute("aria-valuenow", String(Math.max(0, Math.round(x.hp))));
		}
		function skAdd(e, live) {
			const U = units[e.a];
			if (!U || skAt[e.s]) return 0;
			const i = +U.h.k.slice(1),
				ln = SLOT_LINE[i] == null ? 1 : SLOT_LINE[i],
				dy = FY[i] == null ? 0 : FY[i] - 50;
			const el = document.createElement("div");
			el.className = `af-sk ${U.h.side}${dy < 0 ? " up" : ""}`;
			el.dataset.s = e.s;
			el.dataset.a = e.a;
			el.style.cssText = `--ln:${ln};--dy:${dy};--z:${1 + [2, 1, 3, 0, 4][i]}`;
			el.innerHTML = `<div class="af-skf">${sk === "den" ? SVG.skelCat : SVG.skelMan}</div><div class="af-skhp" role="meter" aria-label="Здоровье скелета ${esc(U.h.name)}" aria-valuemin="0" aria-valuemax="${+e.hp || 1}" aria-valuenow="${+e.hp || 1}"><i></i></div>`;
			cam.insertBefore(el, layer);
			const x = { s: e.s, a: e.a, el, hp: +e.hp || 1, max: +e.hp || 1 };
			(skels[e.a] = skels[e.a] || []).push(x);
			skAt[e.s] = x;
			skLayout(e.a);
			skBar(x);
			if (!live) return 0;

			const p = pos(e.s);
			X.ring(p, "nec", { k: 1.4, ms: 600, foot: 0.4 });
			X.parts({ x: p.x, y: p.y + p.h * 0.35, w: p.w }, "dirt", {
				n: 5,
				up: -0.5,
				spread: 0.6,
				ms: 520,
			});
			X.play(
				el.querySelector(".af-skf"),
				RM()
					? [{ opacity: 0 }, { opacity: 1 }]
					: [
							{ transform: "translateY(55%) scaleY(.15)", opacity: 0 },
							{
								transform: "translateY(-6%) scaleY(1.08)",
								opacity: 1,
								offset: 0.6,
							},
							{ transform: "translateY(0) scaleY(1)", opacity: 1 },
						],
				480,
				{ keep: true, ease: "ease-out" },
			);
			return 480;
		}
		function skDel(e, live) {
			const x = skAt[e.s];
			if (!x) return 0;
			delete skAt[e.s];
			skels[x.a] = (skels[x.a] || []).filter((y) => y !== x);
			skLayout(x.a);
			if (!live) {
				x.el.remove();
				return 0;
			}
			const p = pos(e.s),
				f = x.el.querySelector(".af-skf");
			x.el.classList.add("gone");
			if (e.why === "kill") {
				X.parts(p, "bone", {
					n: 6,
					from: 1,
					spread: 0.8,
					up: 0.45,
					ms: 620,
					stagger: 15,
					end: 1,
				});
				X.parts({ x: p.x, y: p.y + p.h * 0.3, w: p.w }, "dust", {
					n: 3,
					up: -0.2,
					spread: 0.5,
					ms: 520,
				});
				X.play(
					f,
					RM()
						? [{ opacity: 1 }, { opacity: 0 }]
						: [
								{ transform: "none", opacity: 1 },
								{
									transform: "translateY(10%) rotate(-10deg) scaleY(.75)",
									opacity: 0.9,
									offset: 0.35,
								},
								{
									transform: "translateY(40%) rotate(8deg) scaleY(.15)",
									opacity: 0,
								},
							],
					520,
					{ keep: true, ease: "ease-in" },
				);
			} else {
				X.parts({ x: p.x, y: p.y + p.h * 0.35, w: p.w }, "dirt", {
					n: 3,
					up: -0.3,
					spread: 0.5,
					ms: 480,
				});
				X.play(
					f,
					RM()
						? [{ opacity: 1 }, { opacity: 0 }]
						: [
								{ transform: "none", opacity: 1 },
								{ transform: "translateY(55%) scaleY(.15)", opacity: 0 },
							],
					520,
					{ keep: true, ease: "ease-in" },
				);
			}
			x.el.querySelector(".af-skhp").style.opacity = "0";
			const my = run;
			setTimeout(() => {
				x.el.remove();
			}, 560 / speed);
			void my;
			return 520;
		}
		function skClear() {
			for (const k of Object.keys(skAt)) delete skAt[k];
			for (const k of Object.keys(skels)) delete skels[k];
			cam.querySelectorAll(".af-sk").forEach((n) => n.remove());
		}
		const skFront = (k) => (skels[k] && skels[k].length ? skels[k][0] : null);

		const safe = (fn, dflt) => {
			try {
				return fn();
			} catch (er) {
				setTimeout(() => {
					throw er;
				}, 0);
				return dflt;
			}
		};

		function stopFx() {
			layer.textContent = "";
			try {
				for (const a of field.getAnimations({ subtree: true }))
					if (
						!(
							a.effect &&
							a.effect.target &&
							a.effect.target.closest &&
							a.effect.target.closest(".af-bg")
						)
					)
						a.cancel();
			} catch (er) {}
			root.classList.remove("dim", "ultdim");
			const b = root.querySelector(".af-ult");
			if (b) b.hidden = true;
			for (const u of Object.values(units)) {
				const c = u.el.querySelector(".af-cap");
				c.hidden = true;
				clearTimeout(c._t);
			}
			unglow();
		}

		function glow(k, slot) {
			unglow();
			if (!slot || !units[k]) return;
			glowK = k;
			const cls = slot === "ult" ? "glow-ult" : "glow-ab";
			for (const q of [".af-nm", ".af-hp"])
				units[k].el.querySelector(q).classList.add(cls);
		}
		function unglow() {
			if (!glowK || !units[glowK]) {
				glowK = null;
				return;
			}
			for (const q of [".af-nm", ".af-hp"])
				units[glowK].el
					.querySelector(q)
					.classList.remove("glow-ab", "glow-ult");
			glowK = null;
		}

		const elOf = (k) => (units[k] ? units[k].el : skAt[k] ? skAt[k].el : null);
		function xy(k) {
			const el = elOf(k),
				W = field.clientWidth || 1,
				H = field.clientHeight || 1;
			return el
				? { x: (el.offsetLeft / W) * 100, y: (el.offsetTop / H) * 100 }
				: { x: 50, y: 50 };
		}

		function float(k, text, cls, o = {}) {
			const u = units[k] || skAt[k];
			if (!u) return;
			const p = xy(k),
				f = document.createElement("span"),
				now = performance.now(),
				big = /\bcrit\b/.test(cls || "");
			const dur = (big ? 1300 : 1100) / speed;
			f.className = "af-num " + (cls || "");
			f.textContent = text;
			f.style.left = p.x + "%";
			f.style.top = p.y + "%";
			cam.appendChild(f);
			const w = (f.offsetWidth || 30) * (big ? 1.3 : 1.08) + 6,
				fs = parseFloat(getComputedStyle(f).fontSize) || 16;
			u.nums = (u.nums || []).filter((n) => n.end > now && n.el.isConnected);
			let lx = 0;
			if (u.nums.length) {
				const R = Math.max(...u.nums.map((n) => n.x + n.w / 2)),
					L = Math.min(...u.nums.map((n) => n.x - n.w / 2));
				lx = u.nums.length % 2 ? R + w / 2 : L - w / 2;
			}
			const away =
					o.from && units[o.from] && !u.nums.length
						? Math.sign(u.el.offsetLeft - units[o.from].el.offsetLeft) || 0
						: 0,
				dr = away * fs * 0.5;
			u.nums.push({
				x: lx + dr / 2,
				w: w + Math.abs(dr),
				end: now + dur,
				el: f,
			});
			const tr = (x, y, sc) =>
				`translate(calc(-50% + ${(lx + x).toFixed(1)}px), ${y}%) scale(${sc})`;
			const fr = RM()
				? [
						{ transform: tr(0, -120, 1), opacity: 0 },
						{ transform: tr(0, -120, 1), opacity: 1, offset: 0.15 },
						{ transform: tr(0, -120, 1), opacity: 1, offset: 0.75 },
						{ transform: tr(0, -120, 1), opacity: 0 },
					]
				: big
					? [
							{ transform: tr(0, -60, 0.4), opacity: 0, easing: EASE.back },
							{
								transform: tr(dr * 0.4, -125, 1.3),
								opacity: 1,
								offset: 0.16,
								easing: EASE.out,
							},
							{ transform: tr(dr * 0.6, -130, 1), opacity: 1, offset: 0.3 },
							{
								transform: tr(dr, -165, 1),
								opacity: 1,
								offset: 0.75,
								easing: EASE.in,
							},
							{ transform: tr(dr, -190, 0.95), opacity: 0 },
						]
					: [
							{ transform: tr(0, -50, 0.6), opacity: 0, easing: EASE.back },
							{
								transform: tr(dr * 0.5, -115, 1.08),
								opacity: 1,
								offset: 0.18,
								easing: EASE.out,
							},
							{ transform: tr(dr * 0.7, -125, 1), opacity: 1, offset: 0.3 },
							{
								transform: tr(dr, -160, 1),
								opacity: 1,
								offset: 0.72,
								easing: EASE.in,
							},
							{ transform: tr(dr, -185, 0.95), opacity: 0 },
						];
			const a = f.animate(fr, { duration: dur, easing: "linear" });
			a.onfinish = () => f.remove();
			setTimeout(() => f.remove(), dur + 200);
		}
		function caption(k, text, ult, col) {
			const c = units[k].el.querySelector(".af-cap");
			c.textContent = text;
			c.hidden = false;
			c.classList.toggle("ult", !!ult);
			if (col) c.style.setProperty("--cc", col);
			else c.style.removeProperty("--cc");
			clearTimeout(c._t);
			c._t = setTimeout(
				() => {
					c.hidden = true;
				},
				(ult ? 1400 : 900) / speed,
			);
		}
		function flash(k, cls) {
			const u = elOf(k);
			if (!u) return;
			u.classList.remove("f-hit", "f-heal", "f-dodge", "f-crit");
			void u.offsetWidth;
			u.classList.add(cls);
			setTimeout(() => u.classList.remove(cls), 450 / speed);
		}
		function addLog(text, cls) {
			logLines.push([text, cls]);
			const ol = root.querySelector(".af-log"),
				li = document.createElement("li");
			li.className = cls || "";
			li.textContent = text;
			ol.prepend(li);
			while (ol.children.length > 120) ol.lastChild.remove();
		}
		function setStatus(k, st, on) {
			const u = units[k];
			if (!u) return;
			u.st[st] = !!on;
			u.el.classList.toggle("s-" + String(st).replace(/[^\w-]/g, ""), !!on);
			u.el.querySelector(".af-st").innerHTML = Object.keys(u.st)
				.filter((s) => u.st[s])
				.map(
					(s) =>
						`<i class="s-${esc(s)}" title="${esc(ST_RU[s] || s)}">${ST_ICON[s] || "•"}</i>`,
				)
				.join("");
		}
		function counters(k) {
			if (!hasAb) return;
			const u = units[k],
				n = turns[k] || 0,
				c = u.el.querySelector(".af-cnt");
			if (!c) return;
			c.querySelectorAll(".d i").forEach((d, i) =>
				d.classList.toggle("on", i < n % 3),
			);
			c.querySelectorAll(".r path").forEach((p, i) =>
				p.classList.toggle("on", i < n % 5),
			);
			c.classList.toggle("ready", n % 5 === 4);
		}
		function setActor(k) {
			if (!k || k === actor || !units[k]) return;
			if (actor && units[actor]) units[actor].el.classList.remove("act");
			actor = k;
			units[k].el.classList.add("act");
			const g = glowAt[idx - 1];
			glow(k, g && g.k === k ? g.slot : null);
			turns[k] = (turns[k] || 0) + 1;
			counters(k);
			const q = root.querySelectorAll(".af-queue i");
			q.forEach((x) => x.classList.toggle("now", x.dataset.k === k));
		}
		function showRound(e) {
			roundNo = e.r;
			curOrder = e.order || [];
			root.querySelector(".af-round").textContent = `Раунд ${e.r}`;
			for (const u of Object.values(units)) {
				const b = u.el.querySelector(".af-ord");
				b.hidden = true;
			}
			if (!o.noTurnNum)
				curOrder.forEach((k, i) => {
					const u = units[k];
					if (!u) return;
					const b = u.el.querySelector(".af-ord");
					b.textContent = String(i + 1);
					b.hidden = false;
				});

			const next = (k) => (turns[k] || 0) + 1;
			const mark = (k) =>
				!hasAb
					? ""
					: next(k) % 5 === 0
						? '<b class="q-ult" title="Ульта">★</b>'
						: next(k) % 3 === 0
							? '<b class="q-ab" title="Способность">◆</b>'
							: "";
			const luckT = (k) =>
				units[k].h.luck != null ? `, удача ${units[k].h.luck}` : "";
			root.querySelector(".af-queue").innerHTML = curOrder
				.map((k, i) =>
					units[k]
						? `<i class="${units[k].h.side}" data-k="${k}" title="${esc(nameOf(k) + luckT(k))}">${i + 1}<span>${esc(nameOf(k))}</span>${mark(k)}</i>`
						: "",
				)
				.join("");
			curOrder.forEach((k) => {
				if (units[k])
					units[k].el.querySelector(".af-ord").title =
						`Ход ${curOrder.indexOf(k) + 1} в раунде${luckT(k)}`;
			});
			if (actor && units[actor]) units[actor].el.classList.remove("act");
			actor = null;
			unglow();
			addLog(`Раунд ${e.r}`, "r");
		}
		let lastAb = null;
		let prevHit = null;
		const roleOf = (k) => (units[k] ? units[k].h.role : "recruit");
		const sameAb = (e, id) =>
			lastAb &&
			lastAb.a === e.a &&
			(lastAb.id === id ||
				(lastAb.d && lastAb.d === abFx(id, actName(id, e), roleOf(e.a))));

		function runAb(d, a, ts, e) {
			if (!d || !units[a]) return 0;
			return safe(
				() =>
					+d.ab(
						X,
						a,
						ts.filter((k) => units[k]),
						e,
					) || 0,
				0,
			);
		}

		function hitFx(e, chain) {
			const role = roleOf(e.a);
			if (e.sk === "skel") {
				const from = e.s && skAt[e.s] ? e.s : e.a;
				if (from !== e.a && !RM())
					X.play(
						skAt[from].el.querySelector(".af-skf"),
						[
							{ transform: "none" },
							{
								transform: `translateX(${X.dir(e.a) * 14}%) translateY(-8%) rotate(${X.dir(e.a) * 8}deg)`,
								offset: 0.4,
							},
							{ transform: "none" },
						],
						300,
						{ keep: true },
					);
				const c = X.proj(pos(from), pos(e.d), "bone", {
					ms: 300,
					arc: 0.2,
					spin: 540,
					miss: e.dodged,
				});
				impact(X, e.d, e, "steel", c);
				return { imp: c, wait: 520 };
			}
			if (e.cl) {
				X.slash(pos(e.d), 30 * X.dir(e.a), "sl-glad", { ms: 220 });
				impact(X, e.d, e, "steel", 60);
				return { imp: 60, wait: 380 };
			}
			const d = e.sk ? abFx(e.sk, actName(e.sk, e), role) : null;
			if (d) {
				let imp = 0,
					wait = d.chain || 320;
				if (!sameAb(e, e.sk) && ENGINE_ID.test(String(e.sk))) {
					impact(X, e.d, e, "steel", 0);
					return { imp: 0, wait: 420 };
				}
				if (!sameAb(e, e.sk)) {
					lastAb = { a: e.a, id: e.sk, d, n: 0, auto: 1 };
					imp = runAb(d, e.a, [e.d], e);
					wait = Math.max(BASE.hit, imp + 300);
					if (typeof d.hit !== "function") {
						if (d.hit === "atk") {
							imp = safe(() => (ATK[role] || ATK.recruit)(X, e.a, e.d, e), 0);
						} else if (!e.dodged && !imp) impact(X, e.d, e, "steel", 0);
						else if (e.crit || e.dodged) impact(X, e.d, e, "steel", imp);
						lastAb.n++;
						return { imp, wait: Math.max(wait, imp + 300) };
					}
				}
				const i = lastAb.n++;
				if (typeof d.hit === "function") {
					imp = safe(() => +d.hit(X, e.a, e.d, e, i) || 0, 0);
					if (e.crit || e.dodged) impact(X, e.d, e, "steel", imp);
				} else if (d.hit === "atk") {
					imp = safe(() => (ATK[role] || ATK.recruit)(X, e.a, e.d, e), 0);
					wait = BASE.hit;
				} else if (lastAb.auto && i === 0) {
					if (e.crit || e.dodged) impact(X, e.d, e, "steel", 0);
				} else impact(X, e.d, e, "steel", 0);
				return { imp, wait: Math.max(wait, imp + 160) };
			}
			if (chain) {
				const k = KIND[role] || "melee";
				let c = 60;
				if (k === "ranged")
					c = X.proj(pos(e.a), pos(e.d), "arrow", {
						ms: 300,
						arc: 0.16,
						rot: true,
						miss: e.dodged,
					});
				else if (role === "necromancer")
					c = X.proj(pos(e.a), pos(e.d), "orb-nec", {
						ms: 320,
						arc: 0.1,
						html: SVG.skull,
						miss: e.dodged,
					});
				else if (k === "magic")
					c = X.proj(pos(e.a), pos(e.d), "orb-arc", {
						ms: 300,
						arc: 0.08,
						miss: e.dodged,
					});
				else if (k === "heal") {
					X.column(pos(e.d), "beam-light", { sky: true, ms: 420, k: 0.35 });
					c = 120;
				} else X.slash(pos(e.d), 30 * X.dir(e.a), "sl-glad", { ms: 220 });
				impact(
					X,
					e.d,
					e,
					k === "magic"
						? role === "necromancer"
							? "nec"
							: "arc"
						: k === "ranged"
							? "arrow"
							: k === "heal"
								? "light"
								: "steel",
					c,
				);
				return { imp: c, wait: Math.max(420, c + 160) };
			}
			const imp = safe(() => (ATK[role] || ATK.recruit)(X, e.a, e.d, e), 0);
			return { imp, wait: Math.max(BASE.hit, imp + 300) };
		}

		function apply(e, live) {
			const A = e.a && units[e.a],
				T = e.d && units[e.d];
			const chain = !!(
				prevHit &&
				e.t === "hit" &&
				prevHit.a === e.a &&
				!e.sk &&
				!prevHit.sk
			);
			prevHit =
				e.t === "hit" ? e : e.t === "heal" || e.t === "st" ? prevHit : null;
			if (
				e.t === "round" ||
				(e.a && lastAb && e.a !== lastAb.a && e.t !== "st")
			)
				lastAb = null;
			switch (e.t) {
				case "round":
					if (live) showRound(e);
					else {
						roundNo = e.r;
					}
					return BASE.round;
				case "hit": {
					if (!T) return 0;
					if (live) setActor(e.a);
					const nm = e.sk
						? actName(e.sk, e) ||
							(abFx(e.sk, null, roleOf(e.a)) || {}).name ||
							null
						: null;

					const SG = e.sg ? skAt[e.sg] || null : null;
					const ev = SG ? { ...e, d: e.sg } : e;
					let imp = 0,
						wait = BASE.hit;
					if (live && A) {
						const ab0 = !!(lastAb && lastAb.a === e.a && sameAb(e, e.sk));
						const r = safe(() => hitFx(ev, chain), { imp: 0, wait: BASE.hit });
						imp = r.imp;
						wait = r.wait;

						if (nm && e.sk !== "skel" && !e.cl && !ab0) caption(e.a, nm);
					}
					if (e.sg) {
						const kx = e.sg;
						if (SG) {
							SG.hp = Math.max(0, +e.shp || 0);
							if (live) later(() => skBar(SG), imp);
							else skBar(SG);
						}

						if (live && SG && A)
							safe(() => {
								dtParts(X, pos(kx), dtOf(e, roleOf(e.a)), imp, e.crit);
								if (e.crit) X.hitstop(imp + 50, 90);
							});
						if (live && SG)
							later(() => {
								float(
									kx,
									(e.crit ? "КРИТ! " : "") + "−" + e.dmg,
									(e.crit ? "crit" : "dmg") + " dt-" + dtOf(e, roleOf(e.a)),
									{ from: e.a },
								);
								flash(kx, e.crit ? "f-crit" : "f-hit");
							}, imp);
						addLog(
							`${nameOf(e.a)} → скелет (${nameOf(e.d)}): −${e.dmg}${e.crit ? " (крит)" : ""}${nm ? ` [${nm}]` : ""}${e.shp === 0 ? " - рассыпался" : ""}`,
							e.crit ? "cr" : "sk",
						);
						return wait;
					}

					const dt = dtOf(e, roleOf(e.a));
					const blk =
						!e.dodged &&
						e.dmg > 0 &&
						!!(e.blk || e.ward || T.st.guard || T.st.shield || T.st.ward);
					if (live && A) safe(() => hitReact(X, e, dt, imp, blk));
					if (e.dodged) {
						if (live)
							later(() => {
								float(e.d, "Уклон", "dodge", { from: e.a });
								flash(e.d, "f-dodge");
							}, imp);
						addLog(`${nameOf(e.a)} → ${nameOf(e.d)}: уклонение`, "dg");
						return wait;
					}
					setHp(T, e.hp, !live, imp);
					if (live)
						later(() => {
							if (e.ward && !e.dmg) float(e.d, "Оберег", "ward");
							else
								float(
									e.d,
									(e.crit ? "КРИТ! " : "") + "−" + e.dmg + (blk ? " ⛨" : ""),
									(e.crit ? "crit" : "dmg") + " dt-" + dt + (blk ? " blk" : ""),
									{ from: e.a },
								);
							flash(e.d, e.crit ? "f-crit" : "f-hit");
							if (e.last) caption(e.d, "Последний рубеж!");
						}, imp);
					addLog(
						`${nameOf(e.a)} → ${nameOf(e.d)}: −${e.dmg}${e.crit ? " (крит)" : ""}${nm ? ` [${nm}]` : ""}${e.cl ? " (замах)" : ""}${e.ward ? ` (оберег поглотил ${e.ward})` : ""}${e.kill ? " - пал" : ""}`,
						e.crit ? "cr" : e.kill ? "k" : "",
					);
					if (e.kill) {
						die(T, true, live ? imp + 520 : 0);
						if (live) later(() => float(e.d, "Пал", "dead"), imp + 300);
					}
					if (
						live &&
						T &&
						lastAb &&
						lastAb.d &&
						lastAb.d.burn &&
						e.sk &&
						sameAb(e, e.sk)
					)
						T.burn = true;
					return wait;
				}
				case "heal": {
					if (!T) return 0;
					if (
						live &&
						e.a &&
						e.sk !== "regen" &&
						e.sk !== "leech" &&
						e.sk !== "drain" &&
						!e.au
					)
						setActor(e.a);
					const nm =
						e.sk && !["regen", "leech", "drain"].includes(e.sk)
							? actName(e.sk, e) ||
								(abFx(e.sk, null, roleOf(e.a)) || {}).name ||
								null
							: null;
					let imp = 0;
					if (live) {
						const d = e.sk && A ? abFx(e.sk, nm, roleOf(e.a)) : null;
						if (d && sameAb(e, e.sk) && typeof d.heal === "function")
							imp = safe(() => +d.heal(X, e.a, e.d, e) || 0, 0);
						else if (d && !sameAb(e, e.sk) && ENGINE_ID.test(String(e.sk)))
							X.parts(pos(e.d), "plus gold", {
								n: 2,
								up: -0.6,
								html: "+",
								ms: 600,
							});
						else if (
							d &&
							!sameAb(e, e.sk) &&
							!["regen", "leech"].includes(e.sk)
						) {
							lastAb = { a: e.a, id: e.sk, d, n: 0, auto: 1 };
							imp = runAb(d, e.a, [e.d], e);
							if (typeof d.heal === "function")
								safe(() => d.heal(X, e.a, e.d, e));
						} else if (e.sk === "regen" || e.au)
							X.parts(pos(e.d), "plus", { n: 2, up: -0.6, html: "+", ms: 600 });
						else
							imp = safe(
								() =>
									healFx(
										X,
										e.a,
										e.d,
										e,
										roleOf(e.a) === "paladin" || (d && d.healTheme)
											? "gold"
											: roleOf(e.a) === "necromancer"
												? "nec"
												: "",
									),
								0,
							);
					}
					setHp(T, e.hp, !live, imp);
					if (live)
						later(() => {
							float(e.d, "+" + e.amt, "heal" + (e.crit ? " crit" : ""));
							flash(e.d, "f-heal");
						}, imp);
					if (
						live &&
						nm &&
						!(lastAb && lastAb.a === e.a && sameAb(e, e.sk) && !lastAb.auto)
					)
						caption(e.a, nm);
					const why =
						e.au === "vesta"
							? "аура Весты"
							: e.sk === "regen"
								? "восстановление"
								: e.sk === "leech"
									? "вампиризм"
									: e.sk === "drain"
										? "вытягивание"
										: nm;
					addLog(
						`${e.a && e.a !== e.d && !e.au ? nameOf(e.a) + " лечит " : ""}${nameOf(e.d)}: +${e.amt}${why ? ` (${why})` : ""}${e.crit ? " (крит)" : ""}`,
						"h",
					);
					const base =
						e.au || e.sk === "regen"
							? BASE.heal * 0.5
							: lastAb && lastAb.d && sameAb(e, e.sk) && lastAb.d.chain
								? lastAb.d.chain
								: BASE.heal;
					return Math.max(base, imp + 200);
				}
				case "act": {
					if (live) setActor(e.a);
					const nm =
						actName(e.sk, e) ||
						(e.sk === "skel"
							? "Скелет"
							: (abFx(e.sk, null, roleOf(e.a)) || {}).name || e.sk);
					let wait = BASE.act;
					if (live && A) {
						const d =
							e.sk === "skel"
								? abFx("podnyat", null, "necromancer")
								: abFx(e.sk, nm, roleOf(e.a));
						if (d && !sameAb(e, e.sk === "skel" ? "podnyat" : e.sk)) {
							lastAb = { a: e.a, id: e.sk, d, n: 0, auto: 1 };
							wait = Math.max(
								wait,
								runAb(d, e.a, e.to && units[e.to] ? [e.to] : [], {
									...e,
									act: 1,
								}) + 200,
							);
						} else if (d && e.to && units[e.to])
							safe(() => ST_FX.ward(X, e.to));
						if (
							!(lastAb && lastAb.a === e.a && !lastAb.auto && sameAb(e, e.sk))
						)
							caption(e.a, nm);
					}
					if (e.to && units[e.to] && live) setStatus(e.to, "shield", true);
					if (e.sk === "stoyka" && A) setStatus(e.a, "guard", true);
					addLog(
						`${nameOf(e.a)}: ${nm}${e.to ? ` → ${nameOf(e.to)}` : ""}`,
						"a",
					);
					return wait;
				}
				case "dot": {
					if (!T) return 0;
					if (live) setActor(e.d);
					const burn = !!(e.burn || e.kind === "burn" || T.burn || T.st.burn);
					setHp(T, e.hp, !live, live ? 120 : 0);
					if (live) {
						if (burn)
							X.parts(pos(e.d), "flame", {
								n: 3,
								up: -0.6,
								spread: 0.35,
								ms: 520,
							});
						else
							X.parts(pos(e.d), "drop-poison", {
								n: 3,
								up: 0.5,
								spread: 0.4,
								ms: 520,
							});
						if (e.kill) X.fall(e.d, null, { delay: 120 });
						else X.react(e.d, null, { delay: 120, k: 0.04, ms: 320 });
						later(() => {
							float(e.d, "−" + e.dmg, burn ? "dot burn" : "dot");
							flash(e.d, "f-hit");
						}, 120);
					}
					addLog(
						`${nameOf(e.d)}: ${burn ? "горение" : "яд"} −${e.dmg}${e.kill ? " - пал" : ""}`,
						"p",
					);
					if (e.kill) die(T, true, live ? 640 : 0);
					return BASE.dot;
				}
				case "phoenix": {
					if (!T) return 0;
					die(T, false);
					setHp(T, T.max, !live);
					if (live) {
						float(e.d, "Феникс!", "heal crit");
						caption(e.d, "Слеза Феникса");
						X.column(pos(e.d), "col-fire", { ms: 900, k: 1.2 });
						X.parts(pos(e.d), "ember", { n: 6, up: -1, spread: 0.5, ms: 800 });
					}
					addLog(`${nameOf(e.d)}: Слеза Феникса - снова в строю`, "h");
					return BASE.phoenix;
				}

				case "ab": {
					if (!A) return 0;
					if (live) setActor(e.a);
					const d = abFx(e.id, actName(e.id, e), A.h.role);
					const nm = actName(e.id, e) || (d && d.name) || e.id;
					const ult = e.slot === "ult";
					lastAb = { a: e.a, id: e.id, d, n: 0 };
					let wait = ult ? BASE.ult : BASE.ab;
					if (live) {
						const col = abCol(d);
						caption(e.a, nm.toUpperCase() + "!", ult, col);

						const ts = (Array.isArray(e.to) ? e.to : e.to ? [e.to] : [])
							.filter((k) => units[k])
							.map((k) =>
								X.side(k) !== A.h.side && skFront(k) ? skFront(k).s : k,
							);
						if (ult) {
							const b = root.querySelector(".af-ult");
							b.innerHTML = `<i>Ульта</i><b>${esc(A.h.name)}</b><span>${esc(nm)}</span>`;
							b.hidden = false;
							root.classList.add("dim", "ultdim");
							b.style.setProperty("--uc", col);
							b.dataset.side = A.h.side;
							const tf =
								getComputedStyle(b).transform === "none"
									? ""
									: "translateX(-50%) ";

							const mv = tf
									? `translateX(${A.h.side === "def" ? 24 : -24}px)`
									: "translateY(-10px)",
								ov = tf ? 1.04 : 1;
							if (!RM())
								X.play(
									b,
									[
										{
											opacity: 0,
											transform: `${tf}${mv} scale(.9)`,
											easing: EASE.back,
										},
										{
											opacity: 1,
											transform: `${tf}translate(0, 0) scale(${ov})`,
											offset: 0.6,
											easing: EASE.out,
										},
										{ opacity: 1, transform: `${tf}scale(1)` },
									],
									320,
									{ keep: true, ease: "linear" },
								);
							safe(() => {
								X.spot(e.a, col, { ms: 1450 });
								X.gather(e.a, col, { ms: 360, k: 2.6 });
							});
							X.shake(3, 300, 120);
							const my = run;
							setTimeout(() => {
								if (my !== run) return;
								b.hidden = true;
								root.classList.remove("dim", "ultdim");
							}, 1500 / speed);

							X.off = 240;
							const imp = d ? runAb(d, e.a, ts, e) + X.off : 0;
							X.off = 0;
							wait = Math.max(wait, imp + 300);
						} else if (d) {
							safe(() => X.gather(e.a, col, { ms: 300, k: 1.8 }));
							wait = Math.max(wait, runAb(d, e.a, ts, e) + 260);
						} else X.pulse(e.a, { k: 1.1, ms: 400 });
					}
					addLog(
						`${nameOf(e.a)}: ${ult ? "ульта" : "способность"} «${nm}»${Array.isArray(e.to) && e.to.length ? ` → ${e.to.map(nameOf).join(", ")}` : ""}`,
						ult ? "u" : "a",
					);
					return wait;
				}
				case "st": {
					if (!T) return 0;
					setStatus(e.d, e.st, !!e.on);
					if (e.st === "burn" && e.on) T.burn = true;
					if ((e.st === "poison" || e.st === "burn") && !e.on) T.burn = false;
					if (live && e.on && ST_FX[e.st]) safe(() => ST_FX[e.st](X, e.d));
					return live && e.on && ST_FX[e.st] ? BASE.st : BASE.st * 0.4;
				}
				case "revive": {
					if (!T) return 0;
					die(T, false);
					setHp(T, e.hp, !live);
					if (live) {
						float(e.d, "Воскрешён", "heal");
						flash(e.d, "f-heal");
						X.column(pos(e.d), "col-revive", { ms: 1000, k: 1.2 });
						X.fig(
							e.d,
							[
								{ transform: "rotate(-80deg) translateY(30%)", opacity: 0.4 },
								{
									transform: "rotate(-30deg) translateY(10%)",
									opacity: 0.8,
									offset: 0.4,
								},
								{
									transform: "rotate(4deg) translateY(-6%)",
									opacity: 1,
									offset: 0.75,
								},
								{ transform: "rotate(0) translateY(0)", opacity: 1 },
							],
							900,
							{ ease: "ease-out" },
						);
						X.parts(pos(e.d), "plus", {
							n: 4,
							delay: 400,
							up: -0.9,
							html: "+",
						});
					}
					addLog(
						`${e.a ? nameOf(e.a) + " воскрешает " : ""}${nameOf(e.d)}`,
						"h",
					);
					return BASE.revive;
				}

				case "skel": {
					if (!A) return 0;
					const w = skAdd(e, live);
					addLog(
						`${nameOf(e.a)}: скелет встал перед ним (${e.hp} здоровья)`,
						"sk",
					);
					return live ? Math.max(BASE.skel, w + 80) : 0;
				}
				case "skeld": {
					const nm = nameOf(e.s);
					const w = skDel(e, live);
					const why =
						e.why === "kill"
							? "рассыпался"
							: e.why === "time"
								? "ушёл в землю - срок вышел"
								: e.why === "cap"
									? "ушёл - место новому"
									: "рассыпался - некромант пал";
					addLog(`${nm}: ${why}`, "sk");
					return live
						? e.why === "kill"
							? Math.max(BASE.skeld * 0.6, w * 0.6)
							: BASE.skeld * 0.5
						: 0;
				}
				case "end":
					return 0;
				default:
					return 0;
			}
		}
		function result() {
			done = true;
			unglow();
			if (actor && units[actor]) units[actor].el.classList.remove("act");
			root.dataset.state = "done";
			const end = (F.log || []).find((e) => e.t === "end") || {};
			const win = me ? F.winner === me : null;
			const head =
				win === true
					? "Победа"
					: win === false
						? "Поражение"
						: F.winner === "atk"
							? `Победа: ${lab.atk}`
							: `Победа: ${lab.def}`;
			const why =
				F.why === "wipe"
					? "пала вся команда"
					: `предел раундов - больше здоровья у ${F.winner === "atk" ? "нападения" : "обороны"}`;
			const rt = me && F.rating && F.rating[me] ? F.rating[me] : null;
			const hp = end.hp
				? ` · здоровье ${Math.round(end.hp.atk)}% / ${Math.round(end.hp.def)}%`
				: "";
			const res = root.querySelector(".af-res");
			marks(true);
			if (o.bare) {
				root.querySelector('[data-sp="skip"]').disabled = true;
				root.querySelector(".af-replay").hidden = false;
				if (o.onDone) o.onDone();
				return;
			}
			res.innerHTML = `<div class="af-rbox ${win === true ? "win" : win === false ? "lose" : ""}" role="status">
        <b class="af-rh">${esc(head)}</b>
        ${rt ? `<span class="af-rr${rt.d >= 0 ? " up" : " dn"}">Рейтинг ${rt.d >= 0 ? "+" : "−"}${Math.abs(rt.d)} <small>(${rt.from} → ${Math.max(0, rt.from + rt.d)})</small></span>` : ""}
        <span class="af-rm">${F.rounds} ${plural(F.rounds, "раунд", "раунда", "раундов")} · ${esc(why)}${hp}</span>
        <div class="af-rb"><button type="button" class="btn sm ghost" data-r="again">Смотреть ещё раз</button>${o.onClose ? '<button type="button" class="btn primary sm" data-r="close">' + esc(o.closeText || "К арене") + "</button>" : ""}</div></div>`;
			res.hidden = false;
			root.querySelector(".af-replay").hidden = false;
			res.querySelector('[data-r="again"]').onclick = restart;
			const cl = res.querySelector('[data-r="close"]');
			if (cl) cl.onclick = () => o.onClose();
			root.querySelector('[data-sp="skip"]').disabled = true;
			if (o.onDone) o.onDone();
		}

		function marks(on) {
			if (!o.marks) return;
			for (const sd of ["atk", "def"]) {
				const b = root.querySelector(`.af-side.${sd}`);
				if (!b) continue;
				const won = on && F.winner === sd,
					lost = on && !!F.winner && F.winner !== sd;
				b.classList.toggle("af-won", won);
				b.classList.toggle("af-lost", lost);
				const w = b.querySelector(".af-wl");
				if (w) w.remove();
				if (won || lost)
					b.insertAdjacentHTML(
						sd === "def" ? "afterbegin" : "beforeend",
						`<small class="af-wl" data-s="${won ? "✓" : "✗"}">${won ? "Победитель" : "Проигравший"}</small>`,
					);
			}
		}
		function reset() {
			marks(false);
			for (const u of Object.values(units)) {
				die(u, false);
				setHp(u, hp0(u.h), true);
				u.st = {};
				u.burn = false;
				setStatus(u.h.k, "_", false);
				u.el.classList.remove("act");
				u.el.querySelector(".af-ord").hidden = true;
			}
			turns = {};
			actor = null;
			idx = 0;
			done = false;
			logLines.length = 0;
			lastAb = null;
			prevHit = null;
			skClear();
			root.querySelector(".af-log").innerHTML = "";
			root.querySelector(".af-res").hidden = true;
			root.querySelector(".af-replay").hidden = true;
			root.querySelector('[data-sp="skip"]').disabled = false;
			root.dataset.state = "play";
			for (const k of Object.keys(units)) counters(k);
		}
		async function loop(my) {
			const L = F.log || [];
			while (idx < L.length && my === run) {
				while ((document.hidden || (o.paused && o.paused())) && my === run)
					await sleep(o.paused ? 150 : 400);
				if (my !== run) return;
				const e = L[idx++];
				const ms = apply(e, true);
				if (o.onStep) {
					try {
						o.onStep(idx, L.length, roundNo);
					} catch (er) {}
				}
				if (ms) await sleep(ms / speed);
			}
			if (my === run && idx >= L.length) result();
		}
		function skip() {
			run++;
			stopFx();
			const L = F.log || [];
			while (idx < L.length) {
				const e = L[idx++];
				if (e.t === "round") {
					roundNo = e.r;
					root.querySelector(".af-round").textContent = `Раунд ${e.r}`;
					addLog(`Раунд ${e.r}`, "r");
				} else apply(e, false);
			}
			sync();
			result();
		}
		function restart() {
			run++;
			stopFx();
			reset();
			const my = run;
			void loop(my);
		}
		root.querySelectorAll("[data-sp]").forEach((b) => {
			b.onclick = () => {
				if (b.dataset.sp === "skip") {
					skip();
					return;
				}
				speed = +b.dataset.sp;
				root.style.setProperty("--af-sp", String(speed));
				root
					.querySelectorAll('[data-sp]:not([data-sp="skip"])')
					.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
			};
		});
		root.querySelector(".af-replay").onclick = restart;
		for (const k of Object.keys(units)) setHp(units[k], hp0(units[k].h), true);
		if (o.auto !== false) {
			const my = ++run;
			void loop(my);
		}

		const setSpeed = (n) => {
			if (!SPEEDS.includes(+n)) return;
			speed = +n;
			root.style.setProperty("--af-sp", String(speed));
			root
				.querySelectorAll('[data-sp]:not([data-sp="skip"])')
				.forEach((x) =>
					x.setAttribute("aria-pressed", String(+x.dataset.sp === speed)),
				);
		};
		return {
			destroy() {
				run++;
				stopFx();
				el.innerHTML = "";
			},
			skip,
			restart,
			setSpeed,
			speed: () => speed,
			state: () => ({
				idx,
				done,
				total: (F.log || []).length,
				round: roundNo,
				lines: logLines.length,
				fx: X.count,
				fxPeak: X.peak,
				skels: Object.keys(skAt),
			}),
		};
	}

	function turnGlow(L) {
		const who = (e) =>
			e.t === "hit" || e.t === "act" || e.t === "ab"
				? e.a
				: e.t === "heal"
					? e.a && !["regen", "leech", "drain"].includes(e.sk) && !e.au
						? e.a
						: null
					: e.t === "dot"
						? e.d
						: null;
		const out = new Array(L.length).fill(null);
		let k = null,
			from = 0,
			slot = null;
		const close = (to) => {
			if (k && slot) for (let j = from; j < to; j++) out[j] = { k, slot };
		};
		for (let i = 0; i < L.length; i++) {
			const e = L[i],
				w = e.t === "round" || e.t === "end" ? "" : who(e);
			if (w == null) continue;
			if (w !== k) {
				close(i);
				k = w || null;
				from = i;
				slot = null;
			}
			if (e.t === "ab" && e.a === k)
				slot = slot === "ult" || e.slot === "ult" ? "ult" : "ab";
		}
		close(L.length);
		return out;
	}

	const SVG = {
		hammer:
			'<svg viewBox="0 0 40 40"><path d="M18 14h4v24h-4z" fill="#8a5a2b"/><path d="M8 4h24v12H8z" fill="#ffe08a" stroke="#7a5a10" stroke-width="2"/></svg>',
		shield:
			'<svg viewBox="0 0 40 46"><path d="M20 2l16 6v14c0 11-7 18-16 22C11 40 4 33 4 22V8z" fill="#c9a24a" stroke="#5a3e0e" stroke-width="2.5"/><path d="M20 9v30M10 20h20" stroke="#7a1a1a" stroke-width="3"/></svg>',
		tower:
			'<svg viewBox="0 0 30 46"><rect x="2" y="2" width="26" height="42" rx="4" fill="#a3122a" stroke="#ffd36a" stroke-width="2.5"/><circle cx="15" cy="23" r="5" fill="#ffd36a"/></svg>',
		skull:
			'<svg viewBox="0 0 32 32"><path d="M16 3C8 3 4 9 4 15c0 4 2 7 5 8v5h14v-5c3-1 5-4 5-8 0-6-4-12-12-12z" fill="#e8f5d8" stroke="#2a1b3a" stroke-width="2"/><circle cx="11" cy="15" r="3.2" fill="#3a1f5a"/><circle cx="21" cy="15" r="3.2" fill="#3a1f5a"/><path d="M13 27v-3M16 27v-3M19 27v-3" stroke="#2a1b3a" stroke-width="1.6"/></svg>',
		skel: '<svg viewBox="0 0 40 60"><circle cx="20" cy="10" r="8" fill="#ece6d6" stroke="#2a2420" stroke-width="2"/><circle cx="17" cy="10" r="2" fill="#2a2420"/><circle cx="23" cy="10" r="2" fill="#2a2420"/><path d="M20 18v22M10 26h20M12 32h16M20 40l-7 16M20 40l7 16M10 26l-5 12M30 26l5 12" stroke="#ece6d6" stroke-width="4" stroke-linecap="round"/><path d="M20 18v22M10 26h20M20 40l-7 16M20 40l7 16" stroke="#2a2420" stroke-width="1" stroke-linecap="round" opacity=".5"/></svg>',

		skelMan:
			'<svg viewBox="0 0 44 62" aria-hidden="true"><path class="bl" d="M36 30l5-15" /><path class="bl2" d="M33 33l7-4" />' +
			'<g class="bn"><path d="M22 3c-7 0-11 5-11 10 0 4 2 6 4 7v4h14v-4c2-1 4-3 4-7 0-5-4-10-11-10z"/><path d="M20 24h4v18h-4z"/>' +
			'<path d="M13 29c3-2 15-2 18 0v3c-3-2-15-2-18 0zM14 34c3-1.6 13-1.6 16 0v3c-3-1.6-13-1.6-16 0z"/><path d="M15 42h14l-2 4H17z"/>' +
			'<path d="M17 46l-4 13h4l3-12zM27 46l4 13h-4l-3-12z"/><path d="M13 29l-6 11 3 1 6-10zM31 29l5 3-1 3-5-3z"/></g>' +
			'<circle class="eye" cx="18" cy="13" r="2.6"/><circle class="eye" cx="26" cy="13" r="2.6"/><path class="ol" d="M19 20.5v2M22 20.5v2M25 20.5v2"/></svg>',

		skelCat:
			'<svg viewBox="0 0 44 62" aria-hidden="true"><path class="tl" d="M28 48c8 0 12-5 10-11-1-3-4-3-5 0" />' +
			'<g class="bn"><path d="M12 4l4 6h12l4-6 2 10c0 6-5 10-12 10S10 20 10 14z"/><path d="M20 24h4v17h-4z"/>' +
			'<path d="M14 28c3-1.6 13-1.6 16 0v2.6c-3-1.6-13-1.6-16 0zM15 33c3-1.4 11-1.4 14 0v2.4c-3-1.4-11-1.4-14 0z"/><path d="M16 41h12l-1.5 4h-9z"/>' +
			'<path d="M17 45l-3 12h5l2-11zM27 45l3 12h-5l-2-11z"/><path d="M14 28l-5 7 2.5 1.5 5-6zM30 28l5 7-2.5 1.5-5-6z"/></g>' +
			'<path class="eye" d="M14.5 13.5c1.5-2 4.5-2 5 0-1 1.6-4 1.6-5 0zM24.5 13.5c.5-2 3.5-2 5 0-1 1.6-4 1.6-5 0z"/><path class="ol" d="M22 17l-1.2 1.4h2.4zM21 20c.6.6 1.4.6 2 0"/></svg>',
		scythe:
			'<svg viewBox="0 0 80 80"><path d="M14 76L52 10" stroke="#3a2a1a" stroke-width="5" stroke-linecap="round"/><path d="M50 12C30 4 12 10 4 24c14-8 30-8 44-2z" fill="#cfe8d0" stroke="#24142e" stroke-width="2.5"/></svg>',
		palm: '<svg viewBox="0 0 40 44"><path d="M12 42V22l-5-7c-1-2 1-4 3-3l4 4V6c0-2 3-2 3 0v12-15c0-2 3-2 3 0v15V5c0-2 3-2 3 0v13-10c0-2 3-2 3 0v20c0 8-4 14-11 14z" fill="#fff3c0" stroke="#b8902a" stroke-width="2"/></svg>',
		cross:
			'<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="15" fill="none" stroke="#ff4d5a" stroke-width="2.5"/><circle cx="20" cy="20" r="6" fill="none" stroke="#ff4d5a" stroke-width="2"/><path d="M20 0v12M20 28v12M0 20h12M28 20h12" stroke="#ff4d5a" stroke-width="2.5"/></svg>',
		flag: '<svg viewBox="0 0 40 70"><path d="M8 68V4" stroke="#5a3e1e" stroke-width="4" stroke-linecap="round"/><path d="M10 6h26l-6 10 6 10H10z" fill="#a3122a" stroke="#ffd36a" stroke-width="2"/><circle cx="8" cy="4" r="3.5" fill="#ffd36a"/></svg>',
		bolt: '<svg viewBox="0 0 30 100" preserveAspectRatio="none"><path d="M18 0L6 44h10L8 100 26 38H15L24 0z" fill="#f4fbff" stroke="#8fd3ff" stroke-width="2"/></svg>',
		flask:
			'<svg viewBox="0 0 24 30"><path d="M9 2h6v8l6 12c1 4-2 6-5 6H8c-3 0-6-2-5-6l6-12z" fill="#7be06a" stroke="#1e3a14" stroke-width="2"/></svg>',
		meteor:
			'<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="18" fill="#ffb03a" stroke="#7a2a0a" stroke-width="3"/><circle cx="24" cy="26" r="5" fill="#ffd36a"/><circle cx="36" cy="36" r="3.5" fill="#c4521a"/></svg>',
		heart:
			'<svg viewBox="0 0 40 36"><path d="M20 34S2 22 2 11C2 5 7 2 11 2c4 0 7 3 9 6 2-3 5-6 9-6 4 0 9 3 9 9 0 11-18 23-18 23z" fill="#ff4d6d" stroke="#5a0a1a" stroke-width="2"/></svg>',
		eagle:
			'<svg viewBox="0 0 60 40"><path d="M30 8l4 6 14-8-6 12 16-2-14 10 8 4-14 2-8 8-8-8-14-2 8-4L2 16l16 2-6-12 14 8z" fill="#ffd36a" stroke="#6a4a0a" stroke-width="2"/></svg>',
		hex: '<svg viewBox="0 0 60 66"><path d="M30 3l25 14v32L30 63 5 49V17z" fill="rgba(170,140,255,.18)" stroke="#c8b6ff" stroke-width="3"/><path d="M30 15l14 8v18l-14 8-14-8V23z" fill="none" stroke="#c8b6ff" stroke-width="1.5" opacity=".7"/></svg>',
		rune: '<svg viewBox="0 0 60 60"><rect x="4" y="4" width="52" height="52" rx="6" fill="none" stroke="#ffd36a" stroke-width="3"/><path d="M4 30h8M48 30h8M30 4v8M30 48v8" stroke="#ffd36a" stroke-width="3"/></svg>',
		paw: '<svg viewBox="0 0 24 24"><ellipse cx="12" cy="15" rx="6" ry="5"/><circle cx="5.5" cy="9" r="2.4"/><circle cx="9.5" cy="5.5" r="2.4"/><circle cx="14.5" cy="5.5" r="2.4"/><circle cx="18.5" cy="9" r="2.4"/></svg>',
		flake:
			'<svg viewBox="0 0 20 20"><path d="M10 1v18M2 5.5l16 9M2 14.5l16-9" stroke="#eaf8ff" stroke-width="2" stroke-linecap="round"/></svg>',
	};

	const rr = (i, s = 1) => {
		const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453;
		return x - Math.floor(x);
	};

	const EASE = {
		out: "cubic-bezier(.22,1,.36,1)",
		in: "cubic-bezier(.55,0,1,.45)",
		io: "cubic-bezier(.65,0,.35,1)",
		back: "cubic-bezier(.34,1.56,.64,1)",
		soft: "cubic-bezier(.33,.0,.2,1)",
	};

	const FX_MAX = 60,
		FX_SOFT = 46;

	const DT_COL = {
		phys: "#f1ece2",
		arc: "#c3b4ff",
		fire: "#ff9a3a",
		ice: "#9fe6ff",
		poison: "#b6ec5a",
		light: "#ffe08a",
		dark: "#d08cff",
		guard: "#9fe6ff",
		heal: "#7be3a0",
	};
	const CLS_DT = { mage: "arc", necromancer: "dark", priest: "light" };

	function fxKit(c) {
		const T = (s) => `translate(-50%, -50%) ${s || ""}`;
		const X = {
			T,
			rr,
			svg: SVG,
			rm: () => c.rm(),
			P: (k) => c.pos(k),
			side: (k) =>
				c.units[k] ? c.units[k].h.side : c.sideOf ? c.sideOf(k) : "atk",
			dir: (k) => (X.side(k) === "def" ? -1 : 1),
			alive: (k) => !!c.units[k] && !c.units[k].dead,
			skelLive: false,
			allies: (k) =>
				Object.keys(c.units).filter(
					(x) => X.side(x) === X.side(k) && X.alive(x),
				),
			foes: (k) =>
				Object.keys(c.units).filter(
					(x) => X.side(x) !== X.side(k) && X.alive(x),
				),
			count: 0,
			peak: 0,
			off: 0,
			at: (fn, ms) => c.later(fn, (ms || 0) + X.off),
			W: () => c.field.clientWidth || 1,
			H: () => c.field.clientHeight || 1,

			el(cls, p, html) {
				const d = document.createElement("i");
				d.className = "fx " + cls;
				d.style.left = Math.round(p.x) + "px";
				d.style.top = Math.round(p.y) + "px";
				d.style.setProperty("--s", Math.max(24, Math.round(p.w || 60)) + "px");
				if (html) d.innerHTML = html;
				X.count++;
				const n = c.layer.childElementCount;
				if (n < FX_MAX) {
					c.layer.appendChild(d);
					if (n + 1 > X.peak) X.peak = n + 1;
				}
				return d;
			},

			room: (n) =>
				Math.max(0, Math.min(n, FX_SOFT - c.layer.childElementCount)),

			play(el, frames, ms, o = {}) {
				const sp = c.speed(),
					dur = Math.max(40, ms / sp),
					del = Math.max(0, ((o.delay || 0) + X.off) / sp);
				let a = null;
				try {
					a = el.animate(frames, {
						duration: dur,
						delay: del,
						easing: o.ease || EASE.out,
						fill: o.keep ? "none" : "both",
					});
				} catch (e) {
					a = null;
				}
				if (!o.keep) {
					const rm = () => el.remove();
					if (a) a.onfinish = rm;
					setTimeout(rm, del + dur + 300);
				}
				return a;
			},

			proj(a, b, cls, o = {}) {
				const ms = o.ms || 320,
					del = o.delay || 0;
				if (X.rm()) return del + ms * 0.6;
				const el = X.el("pj " + cls, a, o.html),
					dx = b.x - a.x,
					dy = b.y - a.y,
					m = o.miss ? 1.35 : 1,
					len = Math.hypot(dx, dy),
					H = (o.arc || 0) * len;
				el.style.setProperty(
					"--mrot",
					Math.round((Math.atan2(dy, dx) * 180) / Math.PI) + "deg",
				);
				const fr = [];
				for (let i = 0; i <= 8; i++) {
					const t = i / 8,
						x = dx * t * m,
						y = dy * t * m - H * 4 * t * (1 - t);
					const ang =
						(Math.atan2(dy * m - H * 4 * (1 - 2 * t), dx * m) * 180) / Math.PI;
					const rot = o.rot
						? ` rotate(${ang.toFixed(1)}deg)`
						: o.spin
							? ` rotate(${Math.round(t * o.spin)}deg)`
							: "";
					fr.push({
						transform: T(
							`translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)${rot}`,
						),
						opacity:
							i === 0
								? 0.3
								: o.miss && t > 0.75
									? Math.max(0, 1 - (t - 0.75) * 4)
									: 1,
					});
				}
				X.play(el, fr, ms, { delay: del, ease: "linear" });
				return del + ms;
			},

			burst(p, cls, o = {}) {
				const q = {
					x: p.x + (o.dx || 0) * (p.w || 60),
					y: p.y + (o.dy || 0) * (p.w || 60),
					w: (p.w || 60) * (o.k || 1),
				};
				const el = X.el("bu " + cls, q, o.html),
					rm = X.rm();
				X.play(
					el,
					rm
						? [
								{ opacity: 0, transform: T() },
								{ opacity: 1, transform: T(), offset: 0.3 },
								{ opacity: 0, transform: T() },
							]
						: [
								{
									opacity: 0,
									transform: T(`scale(.3) rotate(${o.rot || 0}deg)`),
								},
								{
									opacity: 1,
									transform: T(`scale(1) rotate(${o.rot || 0}deg)`),
									offset: 0.3,
								},
								{
									opacity: 0,
									transform: T(
										`scale(${o.grow || 1.35}) rotate(${o.rot || 0}deg)`,
									),
								},
							],
					o.ms || 380,
					{ delay: o.delay },
				);
				return el;
			},

			slash(p, deg, cls, o = {}) {
				const q = {
					x: p.x + (o.dx || 0) * (p.w || 60),
					y: p.y + (o.dy || 0) * (p.w || 60),
					w: (p.w || 60) * (o.k || 1),
				};
				const el = X.el("sl " + cls, q);
				X.play(
					el,
					X.rm()
						? [
								{ opacity: 0, transform: T(`rotate(${deg}deg)`) },
								{ opacity: 1, transform: T(`rotate(${deg}deg)`), offset: 0.3 },
								{ opacity: 0, transform: T(`rotate(${deg}deg)`) },
							]
						: [
								{ opacity: 0, transform: T(`rotate(${deg}deg) scaleX(.1)`) },
								{
									opacity: 1,
									transform: T(`rotate(${deg}deg) scaleX(1.1)`),
									offset: 0.35,
								},
								{ opacity: 0, transform: T(`rotate(${deg}deg) scaleX(1.25)`) },
							],
					o.ms || 260,
					{ delay: o.delay },
				);
			},

			column(p, cls, o = {}) {
				const sky = !!o.sky,
					w = (p.w || 60) * (o.k || 1),
					foot = p.y + (p.h || p.w || 60) * 0.5;
				const h = sky ? foot : (p.h || p.w || 60) * 2.2;
				const el = X.el("co " + cls, { x: p.x, y: foot - h / 2, w });
				el.style.height = Math.round(h) + "px";
				X.play(
					el,
					X.rm()
						? [
								{ opacity: 0, transform: T() },
								{ opacity: 1, transform: T(), offset: 0.25 },
								{ opacity: 0, transform: T() },
							]
						: [
								{
									opacity: 0,
									transform: T("scaleY(.05) scaleX(.6)"),
									transformOrigin: sky ? "50% 0" : "50% 100%",
								},
								{
									opacity: 1,
									transform: T("scaleY(1) scaleX(1)"),
									offset: 0.3,
									transformOrigin: sky ? "50% 0" : "50% 100%",
								},
								{
									opacity: 0.9,
									transform: T("scaleY(1) scaleX(.9)"),
									offset: 0.7,
									transformOrigin: sky ? "50% 0" : "50% 100%",
								},
								{
									opacity: 0,
									transform: T("scaleY(1) scaleX(.2)"),
									transformOrigin: sky ? "50% 0" : "50% 100%",
								},
							],
					o.ms || 700,
					{ delay: o.delay },
				);
			},

			sigil(p, html, cls, o = {}) {
				const el = X.el(
					"sg " + cls,
					{
						x: p.x + (o.dx || 0) * (p.w || 60),
						y: p.y - (p.h || p.w || 60) * (o.up == null ? 0.72 : o.up),
						w: (p.w || 60) * (o.k || 1),
					},
					html,
				);
				const rm = X.rm(),
					sp = o.spin || 0;
				X.play(
					el,
					rm
						? [
								{ opacity: 0, transform: T() },
								{ opacity: 1, transform: T(), offset: 0.2 },
								{ opacity: 1, transform: T(), offset: 0.8 },
								{ opacity: 0, transform: T() },
							]
						: [
								{ opacity: 0, transform: T(`scale(.2) rotate(${-sp}deg)`) },
								{
									opacity: 1,
									transform: T("scale(1.2) rotate(0deg)"),
									offset: 0.2,
								},
								{ opacity: 1, transform: T("scale(1)"), offset: 0.3 },
								{
									opacity: 1,
									transform: T(`scale(1) translateY(-6%)`),
									offset: 0.8,
								},
								{ opacity: 0, transform: T(`scale(.8) translateY(-14%)`) },
							],
					o.ms || 900,
					{ delay: o.delay },
				);
				return el;
			},

			rise(p, cls, html, o = {}) {
				const w = (p.w || 60) * (o.k || 1),
					el = X.el("ri " + cls, { x: p.x, y: p.y, w }, html);
				const rm = X.rm();
				X.play(
					el,
					rm
						? [
								{ opacity: 0, transform: T() },
								{ opacity: 1, transform: T(), offset: 0.2 },
								{ opacity: 1, transform: T(), offset: 0.8 },
								{ opacity: 0, transform: T() },
							]
						: [
								{
									opacity: 0,
									transform: T("translateY(45%) scaleY(.1)"),
									transformOrigin: "50% 100%",
								},
								{
									opacity: 1,
									transform: T("translateY(0) scaleY(1.08)"),
									offset: 0.22,
									transformOrigin: "50% 100%",
								},
								{
									opacity: 1,
									transform: T("translateY(0) scaleY(1)"),
									offset: 0.3,
									transformOrigin: "50% 100%",
								},
								{
									opacity: 1,
									transform: T("translateY(0) scaleY(1)"),
									offset: 0.8,
									transformOrigin: "50% 100%",
								},
								{
									opacity: 0,
									transform: T("translateY(30%) scaleY(.4)"),
									transformOrigin: "50% 100%",
								},
							],
					o.ms || 1000,
					{ delay: o.delay },
				);
				return el;
			},

			parts(p, cls, o = {}) {
				if (X.rm() && !o.keepRm) return;
				const n = X.room(o.n || 4),
					w = p.w || 60,
					sp = o.spread == null ? 0.5 : o.spread,
					up = o.up == null ? -0.6 : o.up,
					seed = o.seed || 1;
				for (let i = 0; i < n; i++) {
					const ox = (rr(i, seed) - 0.5) * 2 * sp * w,
						oy = (rr(i, seed + 3) - 0.5) * sp * w;
					const el = X.el(
						"pt " + cls,
						{ x: p.x + (o.from ? 0 : ox), y: p.y + (o.from ? 0 : oy), w },
						o.html,
					);
					const ex = o.from ? ox * 1.6 : ox * 0.15,
						ey = up * w + (o.from ? oy : 0);
					X.play(
						el,
						[
							{ opacity: 0, transform: T("scale(.4)") },
							{ opacity: 1, transform: T("scale(1)"), offset: 0.2 },
							{
								opacity: 0,
								transform: T(
									`translate(${ex.toFixed(1)}px, ${ey.toFixed(1)}px) scale(${o.end || 0.7})`,
								),
							},
						],
						(o.ms || 700) * (0.8 + rr(i, seed + 7) * 0.4),
						{
							delay: (o.delay || 0) + i * (o.stagger == null ? 40 : o.stagger),
							ease: o.ease || "ease-out",
						},
					);
				}
			},

			ring(p, cls, o = {}) {
				const w = (p.w || 60) * (o.k || 1),
					el = X.el("rg " + cls, {
						x: p.x,
						y: p.y + (p.h || p.w || 60) * (o.foot == null ? 0.42 : o.foot),
						w,
					});
				X.play(
					el,
					X.rm()
						? [
								{ opacity: 0, transform: T() },
								{ opacity: 1, transform: T(), offset: 0.3 },
								{ opacity: 0, transform: T() },
							]
						: [
								{ opacity: 0.9, transform: T("scale(.2)") },
								{ opacity: 0.8, transform: T("scale(1)"), offset: 0.6 },
								{ opacity: 0, transform: T(`scale(${o.grow || 1.3})`) },
							],
					o.ms || 600,
					{ delay: o.delay },
				);
			},

			dome(keys, cls, o = {}) {
				const ps = keys.map(X.P);
				if (!ps.length) return;
				const x0 = Math.min(...ps.map((p) => p.x - p.w * 0.7)),
					x1 = Math.max(...ps.map((p) => p.x + p.w * 0.7));
				const y0 = Math.min(...ps.map((p) => p.y - p.h * 0.75)),
					y1 = Math.max(...ps.map((p) => p.y + p.h * 0.6));
				const el = X.el("dm " + cls, {
					x: (x0 + x1) / 2,
					y: (y0 + y1) / 2,
					w: x1 - x0,
				});
				el.style.width = Math.round(x1 - x0) + "px";
				el.style.height = Math.round(y1 - y0) + "px";
				X.play(
					el,
					X.rm()
						? [
								{ opacity: 0, transform: T() },
								{ opacity: 1, transform: T(), offset: 0.25 },
								{ opacity: 1, transform: T(), offset: 0.75 },
								{ opacity: 0, transform: T() },
							]
						: [
								{ opacity: 0, transform: T("scale(.6)") },
								{ opacity: 1, transform: T("scale(1.04)"), offset: 0.25 },
								{ opacity: 1, transform: T("scale(1)"), offset: 0.75 },
								{ opacity: 0, transform: T("scale(1.1)") },
							],
					o.ms || 1100,
					{ delay: o.delay },
				);
			},

			band(side, cls, o = {}) {
				const W = X.W(),
					H = X.H(),
					w = side === "all" ? W : W / 2;
				const el = X.el("bd " + cls, {
					x: side === "def" ? W * 0.75 : side === "atk" ? W * 0.25 : W / 2,
					y: H / 2,
					w,
				});
				el.style.width = Math.round(w) + "px";
				el.style.height = H + "px";
				X.play(
					el,
					[
						{ opacity: 0, transform: T() },
						{ opacity: o.op || 1, transform: T(), offset: 0.2 },
						{ opacity: o.op || 1, transform: T(), offset: 0.7 },
						{ opacity: 0, transform: T() },
					],
					o.ms || 900,
					{ delay: o.delay },
				);
			},

			fig(k, frames, ms, o = {}) {
				if (X.rm() || !c.units[k]) return null;
				const f = c.units[k].el.querySelector(".af-fig");
				return X.play(f, frames, ms, { ...o, keep: true });
			},

			lunge(a, t, o = {}) {
				const ms = o.ms || 420,
					del = o.delay || 0,
					A = X.P(a),
					B = X.P(t),
					k = o.k == null ? 0.42 : o.k,
					hop = (o.hop || 0) * A.h;
				const dx = (B.x - A.x) * k,
					dy = (B.y - A.y) * k,
					s = Math.sign(dx) || X.dir(a),
					ln = (o.lean == null ? 7 : o.lean) * s;
				const f = (x, y, r, sx, sy) =>
					`translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${r.toFixed(1)}deg) scale(${sx || 1}, ${sy || 1})`;
				X.fig(
					a,
					[
						{
							transform: f(0, 0, 0),
							easing: EASE.out,
							transformOrigin: "50% 92%",
						},
						{
							transform: f(-dx * 0.12, -dy * 0.12, -ln * 0.8, 1.04, 0.93),
							offset: 0.26,
							easing: EASE.in,
							transformOrigin: "50% 92%",
						},
						{
							transform: f(dx * 0.7, dy * 0.7 - hop, ln * 0.5, 0.97, 1.05),
							offset: 0.4,
							easing: "linear",
							transformOrigin: "50% 92%",
						},
						{
							transform: f(dx, dy, ln, 1.05, 0.97),
							offset: 0.48,
							easing: EASE.out,
							transformOrigin: "50% 92%",
						},
						{
							transform: f(dx * 1.07, dy * 1.07, ln * 1.3),
							offset: 0.62,
							easing: EASE.io,
							transformOrigin: "50% 92%",
						},
						{ transform: f(0, 0, 0), transformOrigin: "50% 92%" },
					],
					ms,
					{ delay: del, ease: "linear" },
				);
				return del + ms * 0.48;
			},

			swing(p, from, to, cls, o = {}) {
				const w = (p.w || 60) * (o.k || 1.15),
					el = X.el("sw " + (cls || ""), {
						x: p.x + (o.dx || 0) * (p.w || 60),
						y: p.y + (o.dy || 0) * (p.w || 60),
						w,
					});
				if (X.rm()) {
					X.play(
						el,
						[
							{ opacity: 0, transform: T(`rotate(${to}deg)`) },
							{ opacity: 0.9, transform: T(`rotate(${to}deg)`), offset: 0.3 },
							{ opacity: 0, transform: T(`rotate(${to}deg)`) },
						],
						o.ms || 240,
						{ delay: o.delay },
					);
					return;
				}
				const fl = o.flip ? " scaleX(-1)" : "";
				X.play(
					el,
					[
						{ opacity: 0, transform: T(`rotate(${from}deg)${fl} scale(.85)`) },
						{
							opacity: 1,
							transform: T(
								`rotate(${from + (to - from) * 0.55}deg)${fl} scale(1)`,
							),
							offset: 0.35,
						},
						{ opacity: 0, transform: T(`rotate(${to}deg)${fl} scale(1.06)`) },
					],
					o.ms || 240,
					{ delay: o.delay, ease: EASE.out },
				);
			},

			react(t, a, o = {}) {
				if (!c.units[t]) return;
				const B = X.P(t),
					A = a && c.units[a] ? X.P(a) : null,
					s = A ? Math.sign(B.x - A.x) || -X.dir(t) : -X.dir(t),
					kb = B.w * (o.k || 0.12);
				if (X.rm()) {
					X.fig(t, [{ opacity: 1 }, { opacity: 0.5 }, { opacity: 1 }], 200, {
						delay: o.delay,
					});
					return;
				}
				X.fig(
					t,
					[
						{
							transform: "translate(0,0) rotate(0deg)",
							opacity: 1,
							easing: EASE.out,
							transformOrigin: "50% 92%",
						},
						{
							transform: `translate(${(s * kb).toFixed(1)}px, ${(-B.h * 0.03).toFixed(1)}px) rotate(${s * 7}deg)`,
							opacity: 0.35,
							offset: 0.16,
							transformOrigin: "50% 92%",
						},
						{
							transform: `translate(${(s * kb * 1.12).toFixed(1)}px, 0) rotate(${s * 5}deg)`,
							opacity: 1,
							offset: 0.3,
							transformOrigin: "50% 92%",
						},
						{
							transform: `translate(${(s * kb * 0.9).toFixed(1)}px, 0) rotate(${s * 3}deg)`,
							opacity: 0.55,
							offset: 0.42,
							easing: EASE.io,
							transformOrigin: "50% 92%",
						},
						{
							transform: "translate(0,0) rotate(0deg)",
							opacity: 1,
							transformOrigin: "50% 92%",
						},
					],
					o.ms || 420,
					{ delay: o.delay, ease: "linear" },
				);
			},

			evade(t, a, o = {}) {
				if (!c.units[t]) return;
				const B = X.P(t),
					A = a && c.units[a] ? X.P(a) : null,
					s = A ? Math.sign(B.x - A.x) || -X.dir(t) : -X.dir(t);
				const v = B.y < X.H() * 0.5 ? 1 : -1,
					sx = s * B.w * 0.22,
					sy = v * B.h * 0.32;
				X.burst(B, "ghost", { delay: o.delay, ms: 420, k: 0.9 });
				X.fig(
					t,
					[
						{
							transform: "translate(0,0) rotate(0deg)",
							easing: EASE.out,
							opacity: 1,
						},
						{
							transform: `translate(${sx.toFixed(1)}px, ${sy.toFixed(1)}px) rotate(${-s * 8}deg)`,
							opacity: 0.8,
							offset: 0.28,
						},
						{
							transform: `translate(${sx.toFixed(1)}px, ${sy.toFixed(1)}px) rotate(${-s * 4}deg)`,
							opacity: 1,
							offset: 0.6,
							easing: EASE.io,
						},
						{ transform: "translate(0,0) rotate(0deg)", opacity: 1 },
					],
					o.ms || 560,
					{ delay: o.delay, ease: "linear" },
				);
			},

			clang(t, a, o = {}) {
				const B = X.P(t),
					A = a && c.units[a] ? X.P(a) : null,
					s = A ? Math.sign(A.x - B.x) || X.dir(t) : X.dir(t),
					q = { ...B, x: B.x + s * B.w * 0.34 };
				X.burst(q, "clang" + (o.ward ? " ward" : ""), {
					delay: o.delay,
					k: 0.95,
					ms: 340,
					grow: 1.25,
				});
				X.burst(q, "clang-star", { delay: o.delay, k: 0.9, ms: 260, rot: 22 });
				X.parts(q, "spark steel", {
					n: 4,
					delay: o.delay,
					from: 1,
					spread: 0.45,
					up: -0.25,
					ms: 360,
					stagger: 10,
				});
				X.react(t, a, { delay: o.delay, k: 0.05, ms: 300 });
			},

			fall(t, a, o = {}) {
				if (!c.units[t]) return;
				const B = X.P(t),
					A = a && c.units[a] ? X.P(a) : null,
					s = A ? Math.sign(B.x - A.x) || -X.dir(t) : -X.dir(t);
				X.ring(B, "dust", { delay: (o.delay || 0) + 260, k: 1.4, ms: 520 });
				X.parts({ ...B, y: B.y - B.h * 0.1 }, "soul-up", {
					n: 4,
					delay: (o.delay || 0) + 320,
					up: -1.1,
					spread: 0.35,
					ms: 900,
					stagger: 70,
					keepRm: true,
				});
				if (X.rm()) return;
				X.fig(
					t,
					[
						{
							transform: "translate(0,0) rotate(0deg)",
							opacity: 1,
							easing: EASE.out,
							transformOrigin: "50% 95%",
						},
						{
							transform: `translate(${(s * B.w * 0.16).toFixed(1)}px, ${(-B.h * 0.05).toFixed(1)}px) rotate(${s * 10}deg)`,
							opacity: 0.45,
							offset: 0.14,
							transformOrigin: "50% 95%",
						},
						{
							transform: `translate(${(s * B.w * 0.18).toFixed(1)}px, 0) rotate(${s * 8}deg)`,
							opacity: 1,
							offset: 0.28,
							easing: EASE.in,
							transformOrigin: "50% 95%",
						},
						{
							transform: `translate(${(s * B.w * 0.12).toFixed(1)}px, ${(B.h * 0.08).toFixed(1)}px) rotate(${s * 34}deg) scale(.96)`,
							opacity: 1,
							offset: 0.62,
							easing: EASE.out,
							transformOrigin: "50% 95%",
						},
						{
							transform: `translate(${(s * B.w * 0.06).toFixed(1)}px, ${(B.h * 0.08).toFixed(1)}px) rotate(${s * 18}deg) scale(.95)`,
							opacity: 1,
							offset: 0.8,
							transformOrigin: "50% 95%",
						},
						{
							transform: `translate(0, ${(B.h * 0.06).toFixed(1)}px) rotate(${s * 12}deg) scale(.95)`,
							opacity: 1,
							transformOrigin: "50% 95%",
						},
					],
					o.ms || 900,
					{ delay: o.delay, ease: "linear" },
				);
			},

			hitstop(at, ms) {
				if (X.rm()) return;
				X.at(() => {
					let as = [];
					try {
						as = c.field
							.getAnimations({ subtree: true })
							.filter(
								(x) =>
									x.playState === "running" &&
									!(
										x.effect &&
										x.effect.target &&
										x.effect.target.closest &&
										x.effect.target.closest(".af-bg")
									),
							);
					} catch (e) {
						return;
					}
					as.forEach((x) => {
						try {
							x.pause();
						} catch (e) {}
					});
					setTimeout(
						() =>
							as.forEach((x) => {
								try {
									if (x.playState === "paused") x.play();
								} catch (e) {}
							}),
						Math.max(40, (ms || 80) / c.speed()),
					);
				}, at);
			},

			gather(a, col, o = {}) {
				const p = X.P(a),
					el = X.el("gather", { x: p.x, y: p.y, w: p.w * (o.k || 2.2) });
				if (col) el.style.setProperty("--c", col);
				X.play(
					el,
					X.rm()
						? [
								{ opacity: 0, transform: T() },
								{ opacity: 0.8, transform: T(), offset: 0.4 },
								{ opacity: 0, transform: T() },
							]
						: [
								{ opacity: 0, transform: T("scale(1.3)") },
								{ opacity: 0.9, transform: T("scale(.9)"), offset: 0.45 },
								{ opacity: 0, transform: T("scale(.25)") },
							],
					o.ms || 420,
					{ delay: o.delay, ease: EASE.in },
				);
			},

			spot(a, col, o = {}) {
				const p = X.P(a),
					el = X.el("spot", { x: p.x, y: p.y, w: p.w * 3 });
				if (col) el.style.setProperty("--c", col);
				X.play(
					el,
					[
						{ opacity: 0, transform: T("scale(.7)") },
						{ opacity: 1, transform: T("scale(1)"), offset: 0.2 },
						{ opacity: 0.85, transform: T("scale(1)"), offset: 0.75 },
						{ opacity: 0, transform: T("scale(1.05)") },
					],
					o.ms || 1300,
					{ delay: o.delay },
				);
			},

			draw(a, t, o = {}) {
				const A = X.P(a),
					B = X.P(t || a),
					d = Math.sign(B.x - A.x || X.dir(a)) * A.w * (o.k || 0.1);

				X.fig(
					a,
					[
						{
							transform: "translate(0,0) rotate(0deg)",
							easing: EASE.io,
							transformOrigin: "50% 92%",
						},
						{
							transform: `translate(${(-d).toFixed(1)}px, 0) rotate(${(o.tilt || 0) * Math.sign(d)}deg) scale(1.02, .97)`,
							offset: 0.55,
							easing: EASE.out,
							transformOrigin: "50% 92%",
						},
						{
							transform: `translate(${(d * 0.45).toFixed(1)}px, 0) rotate(${(-(o.tilt || 0) * 0.3 * Math.sign(d)).toFixed(1)}deg)`,
							offset: 0.72,
							easing: EASE.io,
							transformOrigin: "50% 92%",
						},
						{
							transform: "translate(0,0) rotate(0deg)",
							transformOrigin: "50% 92%",
						},
					],
					o.ms || 300,
					{ delay: o.delay, ease: "linear" },
				);
			},

			pulse(a, o = {}) {
				X.fig(
					a,
					[
						{
							transform: "scale(1)",
							easing: EASE.back,
							transformOrigin: "50% 92%",
						},
						{
							transform: `scale(${o.k || 1.12}) translateY(-4%)`,
							offset: 0.4,
							easing: EASE.io,
							transformOrigin: "50% 92%",
						},
						{ transform: "scale(1)", transformOrigin: "50% 92%" },
					],
					o.ms || 420,
					{ delay: o.delay, ease: "linear" },
				);
			},

			shake(px, ms, delay) {
				if (X.rm()) return;
				const a = px,
					b = -px;

				X.play(
					c.cam || c.field,
					[
						{ transform: "translate(0,0)" },
						{ transform: `translate(${b}px, ${a / 2}px)` },
						{ transform: `translate(${a * 0.8}px, ${b / 2}px)` },
						{ transform: `translate(${b * 0.5}px, ${a * 0.3}px)` },
						{ transform: `translate(${a * 0.25}px, 0)` },
						{ transform: "translate(0,0)" },
					],
					ms || 260,
					{ delay, keep: true, ease: EASE.out },
				);
			},

			mid(a, b, t = 0.5) {
				const A = X.P(a),
					B = X.P(b);
				return {
					x: A.x + (B.x - A.x) * t,
					y: A.y + (B.y - A.y) * t,
					w: A.w,
					h: A.h,
				};
			},
			center(keys) {
				const ps = keys.map(X.P);
				if (!ps.length) return { x: X.W() / 2, y: X.H() / 2, w: 60, h: 66 };
				const s = (f) => ps.reduce((m, p) => m + f(p), 0) / ps.length;
				return { x: s((p) => p.x), y: s((p) => p.y), w: ps[0].w, h: ps[0].h };
			},
			sky(p, dx) {
				return { x: p.x + (dx || 0) * p.w, y: -p.h * 0.6, w: p.w, h: p.h };
			},
		};
		return X;
	}

	function impact(X, t, e, theme, at) {
		const p = X.P(t);
		if (e.dodged) {
			X.burst(p, "miss", { delay: at, dx: X.dir(t) * 0.35, ms: 300 });
			return;
		}
		if (e.ward && !e.dmg) {
			X.burst(p, "ward-hit", { delay: at, k: 1.2 });
			return;
		}

		const s = e.a ? Math.sign(X.P(e.a).x - p.x) || X.dir(t) : X.dir(t),
			q = { ...p, x: p.x + s * p.w * 0.14, y: p.y - p.h * 0.04 };
		X.burst(q, "imp " + theme, {
			delay: at,
			k: e.crit ? 1.8 : 1.05,
			rot: Math.round(rr(at + 1) * 90),
			ms: e.crit ? 420 : 340,
		});
		if (e.crit) {
			X.burst(q, "crit-star", {
				delay: at,
				k: 2.1,
				ms: 520,
				grow: 1.6,
				rot: 12,
			});
			X.burst(q, "crit-ring", { delay: at, k: 2.4, ms: 460, grow: 1.5 });
			X.shake(5, 300, at + 90);
		}
	}

	function dtParts(X, p, dt, at, crit) {
		const n = crit ? 6 : 4,
			o = {
				n,
				delay: at,
				from: 1,
				spread: 0.55,
				up: -0.25,
				ms: 440,
				stagger: 12,
				seed: (Math.round(at) % 7) + 1,
			};
		switch (dt) {
			case "fire":
				X.parts(p, "ember", {
					...o,
					from: 0,
					up: -0.75,
					spread: 0.45,
					ms: 640,
				});
				X.parts(p, "flame", {
					...o,
					n: 2,
					from: 0,
					up: -0.5,
					spread: 0.3,
					ms: 520,
				});
				break;
			case "ice":
				X.parts(p, "shard-p", { ...o, ms: 480 });
				break;
			case "poison":
				X.parts(p, "drop-poison", {
					...o,
					from: 0,
					up: 0.45,
					spread: 0.42,
					ms: 600,
				});
				break;
			case "light":
				X.burst(p, "rays", {
					delay: at,
					k: crit ? 1.9 : 1.4,
					ms: 440,
					rot: Math.round(rr(at) * 40),
				});
				X.parts(p, "spark gold", { ...o, n: n - 1 });
				break;
			case "dark":
				X.parts(p, "smoke-nec", { ...o, n: 3, from: 0, up: -0.5, ms: 660 });
				X.parts(p, "mote dark", { ...o, n: 3 });
				break;
			case "arc":
				X.parts(p, "mote", { ...o });
				break;
			default:
				X.parts(p, "spark", { ...o });
				X.parts({ ...p, y: p.y + p.h * 0.4 }, "dust", {
					n: 2,
					delay: at,
					up: -0.12,
					spread: 0.5,
					ms: 480,
				});
		}
	}

	function dtOf(e, role) {
		if (e.t === "dot") return e.burn ? "fire" : "poison";
		if (e.sk === "skel" || e.cl) return "phys";
		const d = e.sk ? abFx(e.sk, null, role) : null;
		return (d && d.dt) || CLS_DT[role] || "phys";
	}

	function hitReact(X, e, dt, at, blk) {
		const t = e.d,
			a = e.a,
			p = X.P(t);
		if (e.dodged) {
			X.evade(t, a, { delay: Math.max(0, at - 150) });
			return;
		}
		if (e.ward && !e.dmg) {
			X.clang(t, a, { delay: at, ward: 1 });
			return;
		}
		dtParts(X, p, dt, at, e.crit);
		if (blk) X.clang(t, a, { delay: at, ward: !!e.ward });
		if (e.crit) X.hitstop(at + 50, 90);
		if (e.kill) X.fall(t, a, { delay: at });
		else if (!blk)
			X.react(t, a, {
				delay: at,
				k: e.crit ? 0.2 : 0.11,
				ms: e.crit ? 520 : 420,
			});
	}

	const ATK = {
		legionary(X, a, t, e) {
			const c = X.lunge(a, t, { k: 0.5, ms: 470 }),
				d = X.dir(a),
				dx = e.dodged ? d * 0.4 : 0;
			X.burst(X.mid(a, t, 0.62), "shield-flash", {
				delay: c - 90,
				ms: 260,
				k: 0.7,
			});
			X.swing(X.P(t), -95, 55, "steel", {
				delay: c - 70,
				ms: 230,
				dx: dx - d * 0.12,
				flip: d < 0,
			});
			X.slash(X.P(t), -35 * d, "sl-glad", { delay: c - 20, dx });
			impact(X, t, e, "steel", c);
			return c;
		},
		paladin(X, a, t, e) {
			const c = X.lunge(a, t, { k: 0.42, ms: 520, hop: 0.14, lean: 12 }),
				p = X.P(t),
				d = X.dir(a);
			if (!X.rm())
				X.play(
					X.el(
						"hammer",
						{ x: p.x - d * p.w * 0.25, y: p.y - p.h * 0.3, w: p.w },
						SVG.hammer,
					),
					[
						{
							opacity: 0,
							transform: X.T(`rotate(${-95 * d}deg)`),
							easing: EASE.out,
						},
						{
							opacity: 1,
							transform: X.T(`rotate(${-110 * d}deg)`),
							offset: 0.4,
							easing: EASE.in,
						},
						{
							opacity: 1,
							transform: X.T(`rotate(${28 * d}deg)`),
							offset: 0.75,
						},
						{ opacity: 0, transform: X.T(`rotate(${34 * d}deg)`) },
					],
					360,
					{ delay: c - 250, ease: "linear" },
				);
			X.swing(p, -120, 30, "gold", {
				delay: c - 80,
				ms: 240,
				k: 1.25,
				dx: -d * 0.15,
				flip: d < 0,
			});
			impact(X, t, e, "gold", c);
			if (!e.dodged) {
				X.ring(p, "gold", { delay: c, k: 1.4, ms: 520 });
				X.parts({ ...p, y: p.y + p.h * 0.42 }, "dust", {
					n: 3,
					delay: c,
					up: -0.15,
					spread: 0.6,
					ms: 520,
				});
			}
			return c;
		},
		rogue(X, a, t, e) {
			const c = X.lunge(a, t, { k: 0.52, ms: 380, hop: 0.32, lean: 14 }),
				d = X.dir(a),
				dx = e.dodged ? d * 0.4 : 0;
			X.swing(X.P(t), -60, 70, "dag", {
				delay: c - 50,
				ms: 170,
				k: 0.95,
				dx,
				flip: d < 0,
			});
			X.swing(X.P(t), 60, -70, "dag", {
				delay: c + 30,
				ms: 170,
				k: 0.95,
				dx,
				flip: d < 0,
			});
			X.slash(X.P(t), 40, "sl-dag", { delay: c - 30, ms: 200, dx });
			X.slash(X.P(t), -40, "sl-dag", { delay: c + 50, ms: 200, dx });
			impact(X, t, e, "dag", c);
			return c;
		},
		archer(X, a, t, e) {
			X.draw(a, t, { ms: 340, k: 0.13, tilt: -6 });
			X.burst(X.P(a), "twang", {
				delay: 190,
				ms: 220,
				k: 0.6,
				dx: X.dir(a) * 0.3,
			});
			const c = X.proj(X.P(a), X.P(t), "arrow", {
				delay: 200,
				ms: 320,
				arc: 0.16,
				rot: true,
				miss: e.dodged,
			});
			impact(X, t, e, "arrow", c);
			return c;
		},
		mage(X, a, t, e) {
			X.gather(a, DT_COL.arc, { ms: 300, k: 1.6 });
			X.draw(a, t, { ms: 340, k: 0.07, tilt: -12, delay: 60 });
			X.burst(X.P(a), "charge arc", { ms: 260, k: 0.7, dy: -0.3, delay: 80 });
			const c = X.proj(X.P(a), X.P(t), "orb-arc", {
				delay: 220,
				ms: 300,
				arc: 0.08,
				miss: e.dodged,
			});
			impact(X, t, e, "arc", c);
			return c;
		},
		necromancer(X, a, t, e) {
			X.gather(a, DT_COL.dark, { ms: 300, k: 1.6 });
			X.draw(a, t, { ms: 320, k: 0.06, tilt: -8, delay: 40 });
			const c = X.proj(X.P(a), X.P(t), "orb-nec", {
				delay: 200,
				ms: 340,
				arc: 0.1,
				html: SVG.skull,
				miss: e.dodged,
				spin: 30,
			});
			impact(X, t, e, "nec", c);
			return c;
		},
		priest(X, a, t, e) {
			X.pulse(a, { ms: 360, k: 1.07 });
			X.sigil(X.P(t), "", "sun", { ms: 420, k: 0.7, up: 0.85 });
			X.column(X.P(t), "beam-light", {
				sky: true,
				delay: 140,
				ms: 440,
				k: 0.38,
			});
			impact(X, t, e, "light", 250);
			return 250;
		},

		mbeast(X, a, t, e) {
			const c = X.lunge(a, t, { k: 0.5, ms: 400, hop: 0.22, lean: 10 }),
				d = X.dir(a),
				dx = e.dodged ? d * 0.4 : 0;
			X.slash(X.P(t), 50, "sl-dag", { delay: c - 30, ms: 200, dx });
			X.slash(X.P(t), 20, "sl-dag", { delay: c + 20, ms: 200, dx });
			impact(X, t, e, "dag", c);
			return c;
		},
		mspit(X, a, t, e) {
			X.draw(a, t, { ms: 300, k: 0.1, tilt: -8 });
			const c = X.proj(X.P(a), X.P(t), "orb-nec", {
				delay: 180,
				ms: 320,
				arc: 0.18,
				miss: e.dodged,
			});
			impact(X, t, e, "nec", c);
			return c;
		},
		recruit(X, a, t, e) {
			const c = X.lunge(a, t, { k: 0.4, ms: 380 });
			X.swing(X.P(t), -70, 50, "steel", {
				delay: c - 60,
				ms: 200,
				k: 0.9,
				flip: X.dir(a) < 0,
			});
			impact(X, t, e, "steel", c);
			return c;
		},
	};

	function healFx(X, a, t, e, theme) {
		const p = X.P(t);
		let at = 0;
		if (a && a !== t && !e.au && X.side(a) === X.side(t))
			at = X.proj(X.P(a), p, "orb-heal " + (theme || ""), {
				ms: 260,
				arc: 0.2,
			});
		X.column(p, "col-heal " + (theme || ""), { delay: at, ms: 720, k: 0.9 });
		X.parts(p, "plus " + (theme || ""), {
			n: e.crit ? 5 : 3,
			delay: at + 80,
			up: -0.8,
			spread: 0.45,
			ms: 760,
			html: "+",
		});
		return at;
	}

	const B = (X, t, cls, at, k) =>
		X.burst(X.P(t), "imp " + cls, { delay: at || 0, k: k || 1 });
	const AB = [
		{
			cls: "legionary",
			br: "Клинок",
			slot: "ab",
			ids: ["leg_natisk", "natisk", "onslaught", "charge"],
			name: "Натиск",
			dt: "phys",
			col: "#ffb070",
			tg: "one",
			ab(X, a, ts) {
				const t = ts[0];
				X.parts(X.P(a), "dust", { n: 3, up: -0.1, spread: 0.4, ms: 500 });
				const c = X.lunge(a, t, { k: 0.66, ms: 540, lean: 12 });
				X.swing(X.P(t), -110, 60, "steel big", {
					delay: c - 80,
					ms: 260,
					k: 1.45,
					flip: X.dir(a) < 0,
				});
				X.slash(X.P(t), -30 * X.dir(a), "sl-glad big", {
					delay: c - 40,
					k: 1.3,
				});
				X.burst(X.P(t), "imp steel", { delay: c, k: 1.4 });
				X.shake(3, 220, c);
				return c;
			},
		},
		{
			cls: "legionary",
			br: "Клинок",
			slot: "ult",
			ids: [
				"leg_empire",
				"imperium",
				"empire",
				"imperial_strike",
				"udar_imperii",
			],
			name: "Удар Империи",
			dt: "phys",
			col: "#ffd36a",
			tg: "two",
			ab(X, a, ts) {
				const t = ts[0];
				X.sigil(X.P(a), SVG.eagle, "eagle", { ms: 900, k: 1.1 });
				const c = X.lunge(a, t, { k: 0.66, ms: 640, delay: 260 }),
					d = X.dir(a);
				X.swing(X.P(t), -120, 60, "gold big", {
					delay: c - 90,
					ms: 280,
					k: 1.7,
					flip: d < 0,
				});
				X.swing(X.P(t), 120, -60, "gold big", {
					delay: c,
					ms: 280,
					k: 1.7,
					flip: d < 0,
				});
				X.slash(X.P(t), -35 * d, "sl-glad big gold", { delay: c - 30, k: 1.6 });
				X.slash(X.P(t), 35 * d, "sl-glad big gold", { delay: c + 40, k: 1.6 });
				X.burst(X.P(t), "imp gold", { delay: c, k: 2 });
				X.shake(5, 300, c);
				if (ts[1]) {
					X.proj(X.P(t), X.P(ts[1]), "shock", { delay: c + 40, ms: 260 });
					B(X, ts[1], "steel", c + 300);
				}
				return c;
			},
			hit: () => 0,
		},
		{
			cls: "legionary",
			br: "Щит",
			slot: "ab",
			ids: ["leg_bash", "shieldbash", "shield_bash", "shitovoy", "stoyka"],
			name: "Щитовой удар",
			dt: "phys",
			col: "#9fe6ff",
			tg: "one",
			st: "guard",
			ab(X, a, ts) {
				const t = ts[0];
				if (!t) {
					X.burst(X.P(a), "guard-pop", { ms: 600, k: 1.3 });
					return 200;
				}
				const c = X.lunge(a, t, { k: 0.5, ms: 440 });
				if (!X.rm())
					X.play(
						X.el("shieldbash", X.mid(a, t, 0.7), SVG.shield),
						[
							{ opacity: 0, transform: X.T("scale(.5)") },
							{ opacity: 1, transform: X.T("scale(1.15)"), offset: 0.5 },
							{ opacity: 0, transform: X.T("scale(1.3)") },
						],
						320,
						{ delay: c - 120 },
					);
				X.burst(X.P(t), "imp steel", { delay: c, k: 1.3 });
				X.burst(X.P(a), "guard-pop", { delay: c + 180, ms: 600, k: 1.3 });
				return c;
			},
		},
		{
			cls: "legionary",
			br: "Щит",
			slot: "ult",
			ids: ["leg_wall", "wall", "legion_wall", "stena"],
			name: "Стена Легиона",
			dt: "phys",
			col: "#9fe6ff",
			tg: "one",
			st: "shield",
			stTo: "team",
			ab(X, a) {
				const al = X.allies(a),
					d = X.dir(a);
				al.forEach((k, i) => {
					const p = X.P(k);
					X.rise(
						{ x: p.x + d * p.w * 0.45, y: p.y + p.h * 0.05, w: p.w },
						"tower",
						SVG.tower,
						{ delay: i * 70, ms: 1300, k: 0.55 },
					);
				});
				X.dome(al, "blue", { delay: 200, ms: 1300 });
				X.burst(X.P(a), "guard-pop", { delay: 300, ms: 700, k: 1.3 });
				X.shake(3, 240, 250);
				return 650;
			},
			hit(X, a, t) {
				const c = X.lunge(a, t, { k: 0.35, ms: 360 });
				B(X, t, "steel", c);
				return c;
			},
		},
		{
			cls: "legionary",
			br: "Ветеран",
			slot: "ab",
			ids: ["leg_cry", "warcry", "battlecry", "battle_cry", "klich"],
			name: "Боевой клич",
			dt: "phys",
			col: "#ff7a6a",
			tg: "one",
			st: "buff",
			stTo: "team",
			ab(X, a) {
				X.pulse(a, { k: 1.16, ms: 460 });
				[0, 120, 240].forEach((dl) =>
					X.ring(X.P(a), "cry", { delay: dl, k: 2.4, foot: 0, ms: 520 }),
				);
				X.allies(a).forEach((k, i) =>
					X.parts(X.P(k), "buff-up", {
						n: 2,
						delay: 200 + i * 50,
						up: -0.9,
						spread: 0.3,
						ms: 600,
						html: "▲",
					}),
				);
				return 320;
			},
			hit: "atk",
		},
		{
			cls: "legionary",
			br: "Ветеран",
			slot: "ult",
			ids: ["leg_stand", "laststand", "last_stand", "legion_stand", "rubezh"],
			name: "Последний рубеж легиона",
			dt: "phys",
			col: "#ff5a6a",
			tg: "one",
			st: "last",
			stTo: "team",
			ab(X, a) {
				const p = X.P(a);
				X.rise(
					{ x: p.x - X.dir(a) * p.w * 0.5, y: p.y - p.h * 0.2, w: p.w },
					"flag",
					SVG.flag,
					{ ms: 1500, k: 0.8 },
				);
				X.pulse(a, { k: 1.2, ms: 600, delay: 150 });
				X.column(p, "col-gold", { delay: 150, ms: 900, k: 1.1 });
				X.allies(a).forEach((k, i) => {
					X.sigil(X.P(k), SVG.heart, "heart-sh", {
						delay: 300 + i * 80,
						ms: 900,
						k: 0.4,
					});
					X.ring(X.P(k), "gold", { delay: 300 + i * 80, ms: 600 });
				});
				return 700;
			},
			hit: "atk",
		},

		{
			cls: "paladin",
			br: "Свет",
			slot: "ab",
			ids: ["pal_judge", "judgement", "judgment", "pravosudie"],
			name: "Правосудие",
			dt: "light",
			tg: "one",
			hl: "wounded1",
			ab(X, a, ts) {
				const t = ts.find((k) => X.side(k) !== X.side(a)) || ts[0];
				X.pulse(a, { k: 1.08, ms: 360 });
				const c = X.proj(X.sky(X.P(t), -0.3), X.P(t), "hammer-fall", {
					delay: 120,
					ms: 340,
					html: SVG.hammer,
					spin: 200,
				});
				X.burst(X.P(t), "imp gold", { delay: c, k: 1.5 });
				X.ring(X.P(t), "gold", { delay: c, k: 1.6 });
				return c;
			},
			hit: () => 0,
			healTheme: "gold",
		},
		{
			cls: "paladin",
			br: "Свет",
			slot: "ult",
			ids: [
				"pal_smite",
				"heavens",
				"heaven_smite",
				"kara_nebes",
				"divine_smite",
			],
			name: "Кара небес",
			dt: "light",
			tg: "fm",
			ab(X, a, ts) {
				X.pulse(a, { k: 1.14, ms: 500 });
				X.column(X.P(a), "col-gold", { ms: 700 });
				ts.forEach((t, i) => {
					X.column(X.P(t), "beam-gold", {
						sky: true,
						delay: 300 + i * 110,
						ms: 700,
						k: 0.9,
					});
					X.ring(X.P(t), "gold", { delay: 420 + i * 110, k: 1.6 });
				});
				X.shake(4, 300, 450);
				return 520;
			},
			hit: (X, a, t) => {
				B(X, t, "gold", 0, 1.2);
				return 0;
			},
			chain: 220,
		},
		{
			cls: "paladin",
			br: "Милость",
			slot: "ab",
			ids: ["pal_dlan", "dlan", "hand_of_light", "lay_on_hands", "dlan_sveta"],
			name: "Длань света",
			dt: "light",
			tg: "wounded",
			also: "foes2",
			ab(X, a, ts) {
				const al = ts.filter((k) => X.side(k) === X.side(a)),
					fo = ts.filter((k) => X.side(k) !== X.side(a));
				al.forEach((k) => {
					X.sigil(X.P(k), SVG.palm, "palm", { ms: 900, k: 0.7, up: 0.1 });
					X.column(X.P(k), "col-gold", { delay: 150, ms: 800 });
				});
				fo.forEach((k, i) =>
					X.proj(X.P(a), X.P(k), "orb-gold", {
						delay: 250 + i * 80,
						ms: 280,
						arc: 0.12,
					}),
				);
				return 300;
			},
			hit: (X, a, t) => {
				B(X, t, "gold", 0);
				return 0;
			},
			heal: (X, a, t) => {
				X.parts(X.P(t), "plus gold", { n: 3, up: -0.8, html: "+" });
				return 0;
			},
			chain: 260,
		},
		{
			cls: "paladin",
			br: "Милость",
			slot: "ult",
			ids: [
				"pal_aegis",
				"aegis",
				"divine_shield",
				"bozh_shield",
				"bozhestvenny",
			],
			name: "Божественный щит",
			dt: "light",
			col: "#ffd36a",
			tg: "team",
			st: "shield",
			stTo: "team",
			ab(X, a) {
				const al = X.allies(a);
				X.pulse(a, { k: 1.15, ms: 520 });
				X.dome(al, "gold", { delay: 150, ms: 1400 });
				al.forEach((k, i) =>
					X.parts(X.P(k), "spark gold", {
						n: 4,
						delay: 300 + i * 60,
						up: -0.9,
						ms: 700,
					}),
				);
				return 650;
			},
		},
		{
			cls: "paladin",
			br: "Оплот",
			slot: "ab",
			ids: ["pal_aura", "aura", "aura_guard", "bulwark_aura"],
			name: "Аура защиты",
			dt: "phys",
			col: "#ffd36a",
			tg: "one",
			st: "buff",
			stTo: "team",
			ab(X, a) {
				X.ring(X.P(a), "aura", { k: 4, ms: 800, grow: 1.1 });
				X.allies(a).forEach((k, i) =>
					X.sigil(X.P(k), "", "halo", {
						delay: 200 + i * 50,
						ms: 700,
						up: 0.6,
						k: 0.6,
					}),
				);
				return 300;
			},
			hit: "atk",
		},
		{
			cls: "paladin",
			br: "Оплот",
			slot: "ult",
			ids: [
				"pal_firm",
				"unshaken",
				"steadfast",
				"unbreakable",
				"nekolebimy",
				"zastupnik",
			],
			name: "Заступник",
			dt: "phys",
			col: "#ffe9a0",
			tg: "self",
			st: "guard",
			ab(X, a) {
				const p = X.P(a);
				X.column(p, "col-gold", { ms: 1000, k: 1.2 });
				X.pulse(a, { k: 1.18, ms: 600 });
				X.sigil({ ...p, y: p.y + p.h * 0.72 }, SVG.rune, "rune", {
					delay: 200,
					ms: 1200,
					k: 1.5,
					spin: 90,
				});
				X.ring(p, "quake", { delay: 260, k: 2.4, ms: 600 });
				X.shake(4, 260, 280);
				return 600;
			},
		},

		{
			cls: "rogue",
			br: "Клинки",
			slot: "ab",
			ids: ["rog_step", "shadowstep", "shadow_step", "shag_v_ten"],
			name: "Шаг в тень",
			dt: "phys",
			col: "#9aa6ff",
			tg: "one",
			ab(X, a, ts) {
				const t = ts[0],
					A = X.P(a),
					P = X.P(t),
					d = X.dir(a),
					bx = P.x - A.x - d * P.w * 0.55,
					by = P.y - A.y;
				X.parts(A, "smoke", { n: 4, up: -0.4, spread: 0.4, ms: 600 });
				X.fig(
					a,
					[
						{ transform: "translate(0,0)", opacity: 1 },
						{ transform: "translate(0,0)", opacity: 0, offset: 0.15 },
						{
							transform: `translate(${bx}px, ${by}px)`,
							opacity: 0,
							offset: 0.25,
						},
						{
							transform: `translate(${bx}px, ${by}px)`,
							opacity: 1,
							offset: 0.35,
						},
						{
							transform: `translate(${bx}px, ${by}px)`,
							opacity: 1,
							offset: 0.7,
						},
						{
							transform: `translate(${bx}px, ${by}px)`,
							opacity: 0,
							offset: 0.8,
						},
						{ transform: "translate(0,0)", opacity: 1 },
					],
					900,
				);
				X.parts({ ...P, x: P.x - d * P.w * 0.55 }, "smoke", {
					n: 3,
					delay: 200,
					up: -0.3,
					spread: 0.3,
					ms: 500,
				});
				X.slash(P, 45, "sl-dag big", { delay: 330, ms: 220 });
				X.slash(P, -45, "sl-dag big", { delay: 390, ms: 220 });
				X.burst(P, "imp dag", { delay: 360, k: 1.3 });
				return 360;
			},
		},
		{
			cls: "rogue",
			br: "Клинки",
			slot: "ult",
			ids: ["rog_dance", "dance", "blade_dance", "tanets_klinkov"],
			name: "Танец клинков",
			dt: "phys",
			col: "#e6f0ff",
			tg: "r3",
			hits: 3,
			ab(X, a) {
				X.fig(
					a,
					[
						{ transform: "rotate(0deg) scale(1)", easing: EASE.in },
						{
							transform: "rotate(360deg) scale(1.12)",
							offset: 0.5,
							easing: EASE.out,
						},
						{ transform: "rotate(720deg) scale(1)" },
					],
					600,
					{ ease: "linear" },
				);
				X.burst(X.P(a), "blade-ring", { ms: 700, k: 2.2 });
				[0, 120, 240].forEach((r, i) =>
					X.swing(X.P(a), r, r + 200, "dag big", {
						delay: 80 + i * 90,
						ms: 260,
						k: 1.8,
					}),
				);
				return 300;
			},
			hit(X, a, t, e, i) {
				const c = X.lunge(a, t, { k: 0.3, ms: 300, hop: 0.2, lean: 16 });
				X.swing(X.P(t), -60 + i * 40, 80 + i * 40, "dag", {
					delay: c - 60,
					ms: 180,
					flip: X.dir(a) < 0,
				});
				X.slash(X.P(t), 40 + i * 25, "sl-dag big", { delay: c - 30, ms: 200 });
				X.slash(X.P(t), -40 - i * 25, "sl-dag big", { delay: c + 30, ms: 200 });
				return c;
			},
			chain: 340,
		},
		{
			cls: "rogue",
			br: "Яды",
			slot: "ab",
			ids: ["rog_venom", "poisonblade", "poison_blade", "yad", "venom_blade"],
			name: "Ядовитый клинок",
			dt: "poison",
			tg: "one",
			st: "poison",
			ab(X, a, ts) {
				const t = ts[0],
					c = X.lunge(a, t, { k: 0.5, ms: 380, hop: 0.25 });
				X.slash(X.P(t), 35, "sl-poison", { delay: c - 30, ms: 240 });
				X.slash(X.P(t), -35, "sl-poison", { delay: c + 40, ms: 240 });
				X.burst(X.P(t), "imp poison", { delay: c });
				X.parts(X.P(t), "drop-poison", {
					n: 4,
					delay: c + 60,
					up: 0.5,
					spread: 0.4,
					ms: 700,
				});
				return c;
			},
		},
		{
			cls: "rogue",
			br: "Яды",
			slot: "ult",
			ids: [
				"rog_cloud",
				"poisoncloud",
				"poison_cloud",
				"toxic_cloud",
				"oblako_yada",
			],
			name: "Облако яда",
			dt: "poison",
			tg: "all",
			st: "poison",
			nohit: 1,
			ab(X, a, ts) {
				const ce = X.center(ts.length ? ts : X.foes(a)),
					c = X.proj(X.P(a), ce, "flask", {
						ms: 480,
						arc: 0.35,
						html: SVG.flask,
						spin: 540,
					});
				X.burst(ce, "imp poison", { delay: c, k: 2.2 });
				(ts.length ? ts : X.foes(a)).forEach((k, i) => {
					X.parts(X.P(k), "cloud-poison", {
						n: 3,
						delay: c + i * 60,
						up: -0.2,
						spread: 0.6,
						ms: 1100,
						end: 1.5,
						stagger: 90,
						keepRm: true,
					});
					X.parts(X.P(k), "drop-poison", {
						n: 2,
						delay: c + 300 + i * 60,
						up: 0.5,
						ms: 600,
					});
				});
				return c + 200;
			},
		},
		{
			cls: "rogue",
			br: "Тень",
			slot: "ab",
			ids: ["rog_back", "backstab", "vspinu", "back_stab", "udar_v_spinu"],
			name: "Удар в спину",
			dt: "phys",
			col: "#8a7cff",
			tg: "one",
			ab(X, a, ts) {
				const t = ts[0],
					A = X.P(a),
					P = X.P(t),
					d = X.dir(a),
					bx = P.x - A.x + d * P.w * 0.6,
					by = P.y - A.y;
				X.fig(
					a,
					[
						{ transform: "translate(0,0)", opacity: 1 },
						{ transform: "translate(0,0)", opacity: 0, offset: 0.15 },
						{
							transform: `translate(${bx}px, ${by}px) scaleX(-1)`,
							opacity: 0,
							offset: 0.25,
						},
						{
							transform: `translate(${bx}px, ${by}px) scaleX(-1)`,
							opacity: 1,
							offset: 0.35,
						},
						{
							transform: `translate(${bx - d * P.w * 0.2}px, ${by}px) scaleX(-1)`,
							opacity: 1,
							offset: 0.45,
						},
						{
							transform: `translate(${bx}px, ${by}px) scaleX(-1)`,
							opacity: 0,
							offset: 0.8,
						},
						{ transform: "translate(0,0)", opacity: 1 },
					],
					900,
				);
				X.parts(A, "smoke", { n: 3, up: -0.3, ms: 500 });
				X.slash(P, 0, "sl-dag big stab", { delay: 380, ms: 220, dx: d * 0.15 });
				X.burst(P, "imp dag", { delay: 400, k: 1.4 });
				return 400;
			},
		},
		{
			cls: "rogue",
			br: "Тень",
			slot: "ult",
			ids: ["rog_vanish", "vanish", "disappear", "ischeznovenie"],
			name: "Исчезновение",
			dt: "phys",
			col: "#aab4c8",
			tg: "self",
			st: "dodge",
			ab(X, a) {
				const p = X.P(a);
				X.burst(p, "smokebomb", { ms: 700, k: 2.4 });
				X.parts(p, "smoke", {
					n: 7,
					up: -0.5,
					spread: 0.8,
					ms: 900,
					end: 1.6,
					keepRm: true,
				});
				X.fig(
					a,
					[
						{ opacity: 1 },
						{ opacity: 0, offset: 0.2 },
						{ opacity: 0.15, offset: 0.6 },
						{ opacity: 0.5, offset: 0.8 },
						{ opacity: 1 },
					],
					1100,
				);
				return 600;
			},
		},

		{
			cls: "archer",
			br: "Меткость",
			slot: "ab",
			ids: [
				"arc_pierce",
				"pierce",
				"piercing_arrow",
				"pronzayushchaya",
				"pricel",
			],
			name: "Пронзающая стрела",
			dt: "phys",
			col: "#ffe9a8",
			tg: "two",
			ab(X, a, ts) {
				const t = ts[0];
				X.draw(a, t, { ms: 420, k: 0.14 });
				X.burst(X.P(a), "charge gold", { ms: 360, k: 0.7 });
				const A = X.P(a),
					P = X.P(t),
					c = X.proj(A, P, "arrow long", { delay: 300, ms: 200, rot: true });
				const tr = X.el("trail", {
					x: (A.x + P.x) / 2,
					y: (A.y + P.y) / 2,
					w: A.w,
				});
				tr.style.width = Math.hypot(P.x - A.x, P.y - A.y) + "px";
				X.play(
					tr,
					[
						{
							opacity: 0,
							transform: X.T(
								`rotate(${Math.atan2(P.y - A.y, P.x - A.x)}rad) scaleX(.1)`,
							),
						},
						{
							opacity: 1,
							transform: X.T(
								`rotate(${Math.atan2(P.y - A.y, P.x - A.x)}rad) scaleX(1)`,
							),
							offset: 0.4,
						},
						{
							opacity: 0,
							transform: X.T(
								`rotate(${Math.atan2(P.y - A.y, P.x - A.x)}rad) scaleX(1)`,
							),
						},
					],
					420,
					{ delay: 300 },
				);
				if (ts[1])
					X.proj(P, X.P(ts[1]), "arrow long", { delay: c, ms: 180, rot: true });
				X.burst(P, "imp arrow", { delay: c, k: 1.3 });
				return c;
			},
			hit: (X, a, t, e, i) => {
				if (i) B(X, t, "arrow", 0);
				return 0;
			},
		},
		{
			cls: "archer",
			br: "Меткость",
			slot: "ult",
			ids: ["arc_heart", "heartshot", "heart_shot", "vystrel_v_serdce"],
			name: "Выстрел в сердце",
			dt: "phys",
			col: "#ff4d5a",
			tg: "one",
			ab(X, a, ts) {
				const t = ts[0];
				X.sigil(X.P(t), SVG.cross, "crosshair", {
					ms: 900,
					k: 1.3,
					up: 0,
					spin: 180,
				});
				X.draw(a, t, { ms: 700, k: 0.18 });
				X.burst(X.P(a), "charge red", { ms: 640, k: 0.9 });
				const c = X.proj(X.P(a), X.P(t), "arrow big", {
					delay: 640,
					ms: 180,
					rot: true,
				});
				X.burst(X.P(t), "heart-burst", {
					delay: c,
					k: 1.4,
					html: SVG.heart,
					ms: 520,
				});
				X.burst(X.P(t), "crit-star", { delay: c, k: 2.4, ms: 500 });
				X.shake(6, 300, c);
				return c;
			},
		},
		{
			cls: "archer",
			br: "Охотник",
			slot: "ab",
			ids: ["arc_grad", "grad", "arrow_hail", "volley", "grad_strel"],
			name: "Град стрел",
			dt: "phys",
			col: "#e8d8b0",
			tg: "r3",
			hits: 3,
			ab(X, a) {
				X.draw(a, null, { ms: 320, k: 0.12 });
				const A = X.P(a);
				[0, 1, 2].forEach((i) =>
					X.proj(
						A,
						{ x: A.x + X.dir(a) * A.w * (0.6 + i * 0.4), y: -A.h },
						"arrow",
						{ delay: 120 + i * 50, ms: 300, rot: true },
					),
				);
				return 250;
			},
			hit(X, a, t, e, i) {
				const P = X.P(t);
				const c = X.proj(
					{ x: P.x - X.dir(a) * P.w * 0.8, y: -P.h * 0.5 },
					P,
					"arrow",
					{ ms: 260, rot: true, miss: e.dodged, delay: i ? 0 : 150 },
				);
				B(X, t, "arrow", c);
				return c;
			},
			chain: 300,
		},
		{
			cls: "archer",
			br: "Охотник",
			slot: "ult",
			ids: ["arc_rain", "rain", "arrow_rain", "liven_strel"],
			name: "Ливень стрел",
			dt: "phys",
			col: "#e8d8b0",
			tg: "all",
			ab(X, a, ts) {
				X.draw(a, null, { ms: 420, k: 0.15 });
				const A = X.P(a);
				for (let i = 0; i < 5; i++)
					X.proj(
						A,
						{ x: A.x + X.dir(a) * A.w * (0.3 + i * 0.3), y: -A.h },
						"arrow",
						{ delay: 100 + i * 40, ms: 280, rot: true },
					);
				(ts.length ? ts : X.foes(a)).forEach((k, j) => {
					const P = X.P(k);
					for (let i = 0; i < 3; i++)
						X.proj(
							{
								x: P.x + (rr(i + j * 3) - 0.6) * P.w - X.dir(a) * P.w * 0.4,
								y: -P.h * 0.5,
							},
							{
								x: P.x + (rr(i + j * 3, 2) - 0.5) * P.w * 0.6,
								y: P.y + P.h * 0.1,
							},
							"arrow fall",
							{ delay: 420 + j * 50 + i * 70, ms: 260, rot: true },
						);
					X.parts(P, "dust", { n: 2, delay: 700 + j * 50, up: -0.1, ms: 400 });
				});
				X.shake(3, 300, 700);
				return 720;
			},
			hit: (X, a, t) => {
				B(X, t, "arrow", 0);
				return 0;
			},
			chain: 200,
		},
		{
			cls: "archer",
			br: "Тень",
			slot: "ab",
			ids: [
				"arc_leap",
				"backstep",
				"leap_back",
				"otskok",
				"disengage",
				"podsechka",
			],
			name: "Подсечка",
			dt: "phys",
			col: "#a8d8ff",
			tg: "one",
			st: "dodge",
			stTo: "self",
			ab(X, a, ts) {
				const t = ts[0],
					A = X.P(a),
					d = X.dir(a),
					bx = -d * A.w * 0.5;
				X.burst(A, "ghost", { ms: 500, k: 1 });
				X.fig(
					a,
					[
						{ transform: "translate(0,0)" },
						{
							transform: `translate(${bx}px, ${-A.h * 0.3}px) rotate(${-12 * d}deg)`,
							offset: 0.35,
						},
						{ transform: `translate(${bx}px, 0)`, offset: 0.6 },
						{ transform: "translate(0,0)" },
					],
					700,
				);
				const c = X.proj(
					{ ...A, x: A.x + bx, y: A.y - A.h * 0.3 },
					X.P(t),
					"arrow",
					{ delay: 230, ms: 300, rot: true, arc: 0.1 },
				);
				B(X, t, "arrow", c);
				return c;
			},
		},
		{
			cls: "archer",
			br: "Тень",
			slot: "ult",
			ids: [
				"arc_ghost",
				"ghostarrows",
				"ghost_arrows",
				"spectral_arrows",
				"prizrachnye",
			],
			name: "Призрачные стрелы",
			dt: "arc",
			col: "#7fd8ff",
			tg: "r3",
			hits: 5,
			ab(X, a) {
				const A = X.P(a);
				X.burst(A, "charge ghost", { ms: 600, k: 1.3 });
				for (let i = 0; i < 5; i++)
					X.sigil({ ...A, x: A.x + (i - 2) * A.w * 0.25 }, "", "ghost-arrow", {
						delay: i * 60,
						ms: 700,
						up: 0.9,
						k: 0.5,
					});
				return 400;
			},
			hit(X, a, t, e) {
				const A = X.P(a),
					c = X.proj({ ...A, y: A.y - A.h * 0.9 }, X.P(t), "arrow ghost", {
						ms: 300,
						rot: true,
						arc: 0.15,
						miss: e.dodged,
					});
				B(X, t, "ghost", c);
				return c;
			},
			chain: 320,
		},

		{
			cls: "mage",
			br: "Пламя",
			slot: "ab",
			ids: ["mag_fireball", "fireball", "fire_ball", "vspyshka", "ogneny_shar"],
			name: "Огненный шар",
			dt: "fire",
			tg: "line",
			ab(X, a) {
				X.draw(a, null, { ms: 380, k: 0.08, tilt: -14 });
				X.burst(X.P(a), "charge fire", { ms: 380, k: 1, dy: -0.3 });
				return 160;
			},
			hit(X, a, t, e, i) {
				const c = X.proj(X.P(a), X.P(t), "orb-fire", {
					ms: 360,
					arc: 0.1,
					delay: i ? 0 : 60,
					miss: e.dodged,
				});
				if (!e.dodged) {
					X.burst(X.P(t), "boom", { delay: c, k: 1.6 });
					X.parts(X.P(t), "ember", {
						n: 4,
						delay: c,
						from: 1,
						spread: 0.7,
						up: -0.4,
						ms: 520,
					});
				}
				return c;
			},
			chain: 380,
		},
		{
			cls: "mage",
			br: "Пламя",
			slot: "ult",
			ids: ["mag_meteor", "meteor", "meteor_strike"],
			name: "Метеор",
			dt: "fire",
			tg: "all",
			st: "burn",
			burn: 1,
			ab(X, a, ts) {
				const fo = ts.length ? ts : X.foes(a),
					ce = X.center(fo);
				X.pulse(a, { k: 1.15, ms: 600 });
				X.burst(X.P(a), "charge fire", { ms: 600, k: 1.4, dy: -0.4 });
				X.burst({ ...ce, y: ce.y + ce.h * 0.4 }, "meteor-shadow", {
					ms: 900,
					k: 3,
					grow: 1.05,
				});
				const c = X.proj(
					{ x: ce.x - X.dir(a) * X.W() * 0.3, y: -ce.h },
					ce,
					"meteor",
					{ delay: 250, ms: 600, html: SVG.meteor },
				);
				X.burst(ce, "boom big", { delay: c, k: 4.5, ms: 600 });
				X.ring(ce, "shock", { delay: c, k: 6, ms: 700 });
				X.shake(8, 420, c);
				fo.forEach((k, i) =>
					X.parts(X.P(k), "flame", {
						n: 3,
						delay: c + 60 + i * 40,
						up: -0.6,
						spread: 0.35,
						ms: 700,
					}),
				);
				return c;
			},
			hit: (X, a, t) => {
				B(X, t, "fire", 0);
				return 0;
			},
			chain: 180,
		},
		{
			cls: "mage",
			br: "Лёд",
			slot: "ab",
			ids: [
				"mag_ice",
				"icebolt",
				"ice_bolt",
				"frostbolt",
				"oznob",
				"ledyanaya",
				"kopye",
			],
			name: "Ледяное копьё",
			dt: "ice",
			tg: "line",
			st: "chill",

			ab(X, a, ts) {
				X.draw(a, ts[0], { ms: 320, k: 0.08, tilt: -10 });
				X.burst(X.P(a), "charge ice", { ms: 300, k: 0.8, dy: -0.3 });
				let c = 0;
				ts.forEach((t, i) => {
					c = Math.max(
						c,
						X.proj(X.P(a), X.P(t), "shard", {
							delay: 150 + i * 60,
							ms: 300,
							rot: true,
						}),
					);
					X.burst(X.P(t), "imp ice", { delay: c, k: 1.4 });
					X.parts(X.P(t), "flake-p", {
						n: 4,
						delay: c,
						from: 1,
						spread: 0.6,
						up: -0.3,
						ms: 600,
						html: SVG.flake,
					});
				});
				return c;
			},
		},
		{
			cls: "mage",
			br: "Лёд",
			slot: "ult",
			ids: ["mag_blizzard", "blizzard", "buran", "snowstorm"],
			name: "Буран",
			dt: "ice",
			tg: "all",
			st: "chill",
			ab(X, a, ts) {
				const fo = ts.length ? ts : X.foes(a),
					side = X.side(a) === "atk" ? "def" : "atk",
					W = X.W(),
					H = X.H(),
					d = X.dir(a);
				X.pulse(a, { k: 1.14, ms: 600 });
				X.band(side, "frost", { ms: 1300, op: 0.85 });
				if (!X.rm())
					for (let i = 0; i < 14; i++) {
						const x0 =
								(side === "def" ? W * 0.45 : W * 0.05) + rr(i, 5) * W * 0.5,
							y0 = rr(i, 9) * H * 0.4;
						X.proj(
							{ x: x0, y: y0, w: 20 },
							{ x: x0 + d * W * 0.12, y: y0 + H * 0.6 },
							"flake-pj",
							{ delay: i * 45, ms: 800, html: SVG.flake, spin: 240 },
						);
					}
				fo.forEach((k, i) =>
					X.burst(X.P(k), "imp ice", { delay: 450 + i * 50, k: 1.4 }),
				);
				return 520;
			},
			hit: (X, a, t) => {
				B(X, t, "ice", 0);
				return 0;
			},
			chain: 200,
		},
		{
			cls: "mage",
			br: "Тайное знание",
			slot: "ab",
			ids: [
				"mag_shield",
				"arcshield",
				"arcane_shield",
				"mana_shield",
				"chardeysky",
			],
			name: "Чародейский щит",
			dt: "arc",
			col: "#c8b6ff",
			tg: "selfn",
			st: "shield",
			ab(X, a, ts) {
				X.draw(a, null, { ms: 300, k: 0.05, tilt: -10 });
				(ts.length ? ts : [a]).forEach((k, i) => {
					if (k !== a)
						X.proj(X.P(a), X.P(k), "orb-arc", { delay: 100, ms: 240 });
					X.burst(X.P(k), "hex", {
						delay: 150 + i * 120,
						ms: 900,
						k: 1.3,
						html: SVG.hex,
						grow: 1.05,
					});
				});
				return 400;
			},
		},
		{
			cls: "mage",
			br: "Тайное знание",
			slot: "ult",
			ids: ["mag_siphon", "siphon", "lifesteal", "life_steal", "pohishchenie"],
			name: "Похищение жизни",
			dt: "arc",
			tg: "r3",
			hl: "team",
			ab(X, a, ts) {
				const fo = ts.filter((k) => X.side(k) !== X.side(a));
				X.pulse(a, { k: 1.14, ms: 600 });
				X.burst(X.P(a), "charge arc", { ms: 500, k: 1.3 });
				fo.forEach((k, i) => {
					const c = X.proj(X.P(a), X.P(k), "orb-arc", {
						delay: 150 + i * 70,
						ms: 280,
					});
					X.burst(X.P(k), "imp arc", { delay: c });
					X.proj(X.P(k), X.P(a), "soul red", {
						delay: c + 120,
						ms: 380,
						arc: 0.25,
					});
				});
				return 470;
			},
			hit: () => 0,
			heal(X, a, t) {
				const c = X.proj(X.P(a), X.P(t), "orb-heal", { ms: 300, arc: 0.2 });
				X.parts(X.P(t), "plus", { n: 2, delay: c, up: -0.8, html: "+" });
				return c;
			},
			chain: 220,
		},

		{
			cls: "necromancer",
			br: "Кости",
			slot: "ab",
			ids: ["nec_raise", "podnyat", "raise", "raise_skeleton", "skeleton"],
			name: "Поднять скелета",
			dt: "dark",
			tg: "one",
			ab(X, a, ts) {
				const A = X.P(a),
					d = X.dir(a),
					sp = { x: A.x + d * A.w * 0.75, y: A.y + A.h * 0.1, w: A.w };

				if (X.skelLive) {
					X.pulse(a, { k: 1.12, ms: 420 });
					X.burst(A, "charge nec", { ms: 420, k: 1.1 });
					return 260;
				}
				X.ring(sp, "nec", { k: 1.2, ms: 600, foot: 0.3 });
				X.rise(sp, "skel", SVG.skel, { delay: 80, ms: 1300, k: 0.6 });
				X.parts(sp, "dirt", {
					n: 4,
					delay: 80,
					up: -0.3,
					spread: 0.4,
					ms: 500,
				});
				if (!ts[0]) return 400;
				const c = X.proj(A, X.P(ts[0]), "orb-nec", {
					delay: 250,
					ms: 320,
					arc: 0.1,
					html: SVG.skull,
				});
				X.burst(X.P(ts[0]), "imp nec", { delay: c });
				return c;
			},
			hit(X, a, t, e) {
				if (!X.skelLive) {
					if (e.crit || e.dodged) return 0;
					impact(X, t, e, "nec", 0);
					return 0;
				}
				const c = X.proj(X.P(a), X.P(t), "orb-nec", {
					ms: 320,
					arc: 0.1,
					html: SVG.skull,
					miss: e.dodged,
				});
				if (!e.crit && !e.dodged) impact(X, t, e, "nec", c);
				return c;
			},
		},
		{
			cls: "necromancer",
			br: "Кости",
			slot: "ult",
			ids: ["nec_army", "legion", "army", "army_of_dead", "armiya_myortvyh"],
			name: "Армия мёртвых",
			dt: "dark",
			tg: "all",
			st: "curse",
			nohit: 1,
			ab(X, a, ts) {
				const A = X.P(a),
					d = X.dir(a);
				X.pulse(a, { k: 1.16, ms: 700 });
				X.ring(A, "nec", { k: 3.5, ms: 900 });
				if (!X.skelLive)
					[
						[0.8, 0],
						[1.25, -0.55],
						[1.25, 0.55],
					].forEach(([fx, fy], i) => {
						const sp = {
							x: A.x + d * A.w * fx,
							y: A.y + A.h * fy * 0.5,
							w: A.w,
						};
						X.rise(sp, "skel", SVG.skel, {
							delay: 150 + i * 160,
							ms: 1500,
							k: 0.6,
						});
						X.parts(sp, "dirt", {
							n: 3,
							delay: 150 + i * 160,
							up: -0.3,
							ms: 500,
						});
					});
				const side = X.side(a) === "atk" ? "def" : "atk";
				X.band(side, "fog-nec", { delay: 300, ms: 1200, op: 0.8 });
				(ts.length ? ts : X.foes(a)).forEach((k, i) =>
					X.sigil(X.P(k), "✶", "curse-s", {
						delay: 500 + i * 60,
						ms: 800,
						k: 0.5,
					}),
				);
				return 750;
			},
		},
		{
			cls: "necromancer",
			br: "Жизнь",
			slot: "ab",
			ids: ["nec_drain", "vytyanut", "drain", "life_drain", "vytyagivanie"],
			name: "Вытягивание",
			dt: "dark",
			tg: "one",
			hl: "self",
			ab(X, a, ts) {
				const t = ts[0],
					c = X.proj(X.P(a), X.P(t), "orb-nec", {
						delay: 120,
						ms: 320,
						arc: 0.1,
						html: SVG.skull,
					});
				X.burst(X.P(t), "imp nec", { delay: c });
				for (let i = 0; i < 4; i++)
					X.proj(X.P(t), X.P(a), "soul", {
						delay: c + 100 + i * 70,
						ms: 420,
						arc: 0.15 + i * 0.05,
					});
				return c;
			},
			heal(X, a, t) {
				X.column(X.P(t), "col-nec", { ms: 600, k: 0.8 });
				return 0;
			},
		},
		{
			cls: "necromancer",
			br: "Жизнь",
			slot: "ult",
			ids: ["nec_harvest", "reap", "soul_harvest", "harvest", "zhatva_dush"],
			name: "Жатва душ",
			dt: "dark",
			tg: "all",
			hl: "team",
			ab(X, a, ts) {
				const fo = ts.length ? ts : X.foes(a),
					ce = X.center(fo),
					d = X.dir(a);
				X.pulse(a, { k: 1.15, ms: 600 });
				if (!X.rm())
					X.play(
						X.el("scythe", { ...ce, w: ce.w * 3.2 }, SVG.scythe),
						[
							{ opacity: 0, transform: X.T(`scaleX(${-d}) rotate(-70deg)`) },
							{
								opacity: 1,
								transform: X.T(`scaleX(${-d}) rotate(-50deg)`),
								offset: 0.2,
							},
							{
								opacity: 1,
								transform: X.T(`scaleX(${-d}) rotate(60deg)`),
								offset: 0.7,
							},
							{ opacity: 0, transform: X.T(`scaleX(${-d}) rotate(80deg)`) },
						],
						800,
						{ delay: 150 },
					);
				X.band(X.side(a) === "atk" ? "def" : "atk", "fog-nec", {
					delay: 200,
					ms: 900,
					op: 0.5,
				});
				fo.forEach((k, i) => {
					X.burst(X.P(k), "imp nec", { delay: 450 + i * 40 });
					X.proj(X.P(k), X.P(a), "soul", {
						delay: 600 + i * 60,
						ms: 500,
						arc: 0.3,
					});
				});
				return 480;
			},
			hit: () => 0,
			heal(X, a, t) {
				X.column(X.P(t), "col-nec", { ms: 600, k: 0.8 });
				return 0;
			},
			chain: 200,
		},
		{
			cls: "necromancer",
			br: "Тьма",
			slot: "ab",
			ids: ["nec_mark", "mark", "death_mark", "metka_smerti", "proklyat"],
			name: "Метка смерти",
			dt: "dark",
			tg: "one",
			st: "mark",
			ab(X, a, ts) {
				const t = ts[0],
					c = X.proj(X.P(a), X.P(t), "orb-nec big", {
						delay: 120,
						ms: 360,
						arc: 0.12,
						html: SVG.skull,
					});
				X.burst(X.P(t), "imp nec", { delay: c, k: 1.4 });
				X.sigil(X.P(t), SVG.skull, "mark-s", {
					delay: c + 60,
					ms: 1000,
					k: 0.55,
				});
				X.ring(X.P(t), "nec", { delay: c, k: 1.4 });
				return c;
			},
		},
		{
			cls: "necromancer",
			br: "Тьма",
			slot: "ult",
			ids: ["nec_plague", "plague", "plague_curse", "chumnoe"],
			name: "Чумное проклятие",
			dt: "poison",
			tg: "all",
			st: "curse",
			st2: "poison",
			nohit: 1,
			ab(X, a, ts) {
				X.pulse(a, { k: 1.18, ms: 700 });
				X.burst(X.P(a), "charge nec", { ms: 600, k: 1.4, dy: -0.3 });
				(ts.length ? ts : X.foes(a)).forEach((k, i) => {
					const p = X.P(k);
					X.parts(p, "cloud-plague", {
						n: 3,
						delay: 250 + i * 70,
						up: -0.3,
						spread: 0.6,
						ms: 1100,
						end: 1.6,
						stagger: 90,
						keepRm: true,
					});
					X.sigil(p, "✶", "curse-s", { delay: 400 + i * 70, ms: 800, k: 0.5 });
					X.parts(p, "drop-poison", {
						n: 2,
						delay: 600 + i * 70,
						up: 0.5,
						ms: 600,
					});
				});
				return 700;
			},
		},

		{
			cls: "priest",
			br: "Исцеление",
			slot: "ab",
			ids: ["pri_prayer", "prayer", "molitva", "siyanie", "mass_heal"],
			name: "Молитва",
			dt: "light",
			col: "#7be3a0",
			tg: "wounded",
			hl: "tg",
			ab(X, a, ts) {
				X.sigil(X.P(a), "", "halo", { ms: 800, up: 0.62, k: 0.8 });
				X.pulse(a, { k: 1.1, ms: 500 });
				ts.forEach((k, i) =>
					X.column(X.P(k), "col-heal", { delay: 200 + i * 80, ms: 900 }),
				);
				return 300;
			},
			heal(X, a, t) {
				X.parts(X.P(t), "plus", { n: 3, up: -0.8, spread: 0.45, html: "+" });
				return 0;
			},
			chain: 200,
		},

		{
			cls: "priest",
			br: "Исцеление",
			slot: "ult",
			ids: ["pri_bless", "bless", "blessing", "blagoslovenie"],
			name: "Благословение",
			dt: "light",
			col: "#ffe08a",
			tg: "wounded",
			hl: "tg",
			cleanse: 1,
			ab(X, a, ts) {
				const al = X.allies(a),
					P = X.P(a);
				X.pulse(a, { k: 1.16, ms: 700 });
				X.sigil(P, "", "halo", { ms: 1100, up: 0.62, k: 1 });
				X.ring(P, "aura", { k: 5, ms: 900, grow: 1.1 });
				X.dome(al, "gold", { delay: 150, ms: 1100 });
				(ts.length ? ts : al).forEach((k, i) => {
					const p = X.P(k);
					X.column(p, "col-heal gold", {
						sky: true,
						delay: 250 + i * 80,
						ms: 900,
						k: 0.9,
					});
					X.parts(p, "cleanse", {
						n: 3,
						delay: 350 + i * 80,
						up: -0.9,
						spread: 0.4,
						ms: 700,
					});
					X.parts(p, "spark gold", {
						n: 3,
						delay: 450 + i * 80,
						up: -1,
						ms: 800,
					});
				});
				return 500;
			},
			heal(X, a, t) {
				X.parts(X.P(t), "plus gold", { n: 3, up: -0.8, html: "+" });
				return 0;
			},
			chain: 200,
		},
		{
			cls: "priest",
			br: "Вера",
			slot: "ab",
			ids: ["pri_ward", "obereg", "ward", "blessing_ward"],
			name: "Оберег",
			dt: "light",
			col: "#9fe6ff",
			tg: "a3",
			st: "shield",
			ab(X, a, ts) {
				X.pulse(a, { k: 1.08, ms: 400 });
				(ts.length ? ts : [a]).forEach((k, i) => {
					if (k !== a)
						X.proj(X.P(a), X.P(k), "orb-light", {
							delay: 100 + i * 70,
							ms: 260,
							arc: 0.2,
						});
					X.burst(X.P(k), "ward-pop", {
						delay: 340 + i * 70,
						ms: 800,
						k: 1.3,
						grow: 1.05,
					});
				});
				return 450;
			},
		},
		{
			cls: "priest",
			br: "Вера",
			slot: "ult",
			ids: [
				"pri_ground",
				"holyground",
				"holy_ground",
				"sacred_ground",
				"svyataya_zemlya",
			],
			name: "Святая земля",
			dt: "light",
			col: "#ffe08a",
			tg: "team",
			st: "holy",
			stTo: "team",
			ab(X, a) {
				const al = X.allies(a),
					ce = X.center(al),
					ps = al.map(X.P),
					w =
						Math.max(...ps.map((p) => p.x)) -
						Math.min(...ps.map((p) => p.x)) +
						ce.w * 2;
				X.pulse(a, { k: 1.14, ms: 600 });
				const g = X.el("holy-circle", { x: ce.x, y: ce.y + ce.h * 0.3, w });
				g.style.width = Math.round(w) + "px";
				g.style.height =
					Math.round(
						Math.max(...ps.map((p) => p.y)) -
							Math.min(...ps.map((p) => p.y)) +
							ce.h * 1.2,
					) + "px";
				X.play(
					g,
					[
						{ opacity: 0, transform: X.T("scale(.5)") },
						{ opacity: 1, transform: X.T("scale(1)"), offset: 0.3 },
						{ opacity: 1, transform: X.T("scale(1)"), offset: 0.75 },
						{ opacity: 0, transform: X.T("scale(1.05)") },
					],
					1500,
				);
				al.forEach((k, i) =>
					X.parts(X.P(k), "spark gold", {
						n: 4,
						delay: 300 + i * 60,
						up: -1,
						ms: 900,
					}),
				);
				return 650;
			},
		},
		{
			cls: "priest",
			br: "Кара",
			slot: "ab",
			ids: ["pri_smite", "smite", "kara", "svet", "retribution"],
			name: "Кара",
			dt: "light",
			tg: "one",
			st: "judged",
			ab(X, a, ts) {
				const t = ts[0];
				X.pulse(a, { k: 1.1, ms: 400 });
				X.sigil(X.P(t), "", "sun", { ms: 900, k: 0.9, up: 0.8 });
				X.column(X.P(t), "beam-light big", {
					sky: true,
					delay: 200,
					ms: 520,
					k: 0.6,
				});
				X.burst(X.P(t), "imp light", { delay: 320, k: 1.5 });
				X.shake(3, 200, 320);
				return 320;
			},
		},
		{
			cls: "priest",
			br: "Кара",
			slot: "ult",
			ids: ["pri_heaven", "wrath", "heavens_wrath", "gnev_nebes"],
			name: "Гнев небес",
			dt: "light",
			tg: "all",
			ab(X, a, ts) {
				X.pulse(a, { k: 1.16, ms: 600 });
				X.band("all", "flash", { delay: 250, ms: 380, op: 0.7 });
				(ts.length ? ts : X.foes(a)).forEach((k, i) => {
					const p = X.P(k),
						el = X.el(
							"bolt",
							{ x: p.x, y: (p.y + p.h * 0.5) / 2, w: p.w * 0.5 },
							SVG.bolt,
						);
					el.style.height = Math.round(p.y + p.h * 0.5) + "px";
					X.play(
						el,
						[
							{ opacity: 0, transform: X.T() },
							{ opacity: 1, transform: X.T(), offset: 0.1 },
							{ opacity: 0.2, transform: X.T(), offset: 0.3 },
							{ opacity: 1, transform: X.T(), offset: 0.45 },
							{ opacity: 0, transform: X.T() },
						],
						520,
						{ delay: 300 + i * 80 },
					);
					X.burst(p, "imp light", { delay: 340 + i * 80, k: 1.5 });
				});
				X.shake(6, 380, 320);
				return 520;
			},
			hit: (X, a, t) => {
				B(X, t, "light", 0);
				return 0;
			},
			chain: 200,
		},
	];
	const AB_BY = {},
		AB_NAME = {};
	const norm = (s) =>
		String(s || "")
			.toLowerCase()
			.replace(/ё/g, "е")
			.replace(/[^a-zа-я0-9]/g, "");
	AB.forEach((d, i) => {
		d.n = i;
		d.key = d.cls + ":" + d.ids[0];
		for (const id of d.ids) if (!AB_BY[id]) AB_BY[id] = d;
		AB_NAME[norm(d.name)] = d;
	});

	const ENGINE_ID = /^(leg|pal|rog|arc|mag|nec|pri)_/;

	function abCol(d) {
		return (
			(d &&
				(d.col ||
					DT_COL[d.dt] ||
					(d.st === "shield" || d.st === "guard"
						? DT_COL.guard
						: d.hl
							? DT_COL.heal
							: null))) ||
			"#ffd36a"
		);
	}
	function abFx(id, name, cls) {
		const byId = id != null ? AB_BY[String(id).toLowerCase()] : null;
		if (
			byId &&
			(!cls ||
				byId.cls === cls ||
				!AB.some(
					(d) => d.cls === cls && d.ids.includes(String(id).toLowerCase()),
				))
		)
			return byId;
		if (id != null && cls) {
			const own = AB.find(
				(d) => d.cls === cls && d.ids.includes(String(id).toLowerCase()),
			);
			if (own) return own;
		}
		return (name && AB_NAME[norm(name)]) || byId || null;
	}

	const ST_FX = {
		guard: (X, k) => X.burst(X.P(k), "guard-pop", { ms: 520, k: 1.3 }),
		shield: (X, k) =>
			X.burst(X.P(k), "ward-pop", { ms: 520, k: 1.3, grow: 1.05 }),
		ward: (X, k) =>
			X.burst(X.P(k), "ward-pop", { ms: 520, k: 1.3, grow: 1.05 }),
		mark: (X, k) => X.sigil(X.P(k), SVG.skull, "mark-s", { ms: 600, k: 0.5 }),
		curse: (X, k) => {
			X.sigil(X.P(k), "✶", "curse-s", { ms: 600, k: 0.5 });
			X.parts(X.P(k), "smoke-nec", { n: 2, up: -0.4, ms: 600 });
		},
		poison: (X, k) =>
			X.parts(X.P(k), "drop-poison", { n: 3, up: 0.5, ms: 600 }),
		burn: (X, k) =>
			X.parts(X.P(k), "flame", { n: 3, up: -0.6, spread: 0.35, ms: 600 }),
		buff: (X, k) =>
			X.parts(X.P(k), "buff-up", {
				n: 2,
				up: -0.9,
				spread: 0.3,
				ms: 600,
				html: "▲",
			}),
		chill: (X, k) =>
			X.parts(X.P(k), "flake-p", {
				n: 3,
				up: -0.4,
				from: 1,
				spread: 0.5,
				ms: 600,
				html: SVG.flake,
			}),
		dodge: (X, k) => X.burst(X.P(k), "ghost", { ms: 500 }),
		holy: (X, k) => X.ring(X.P(k), "gold", { ms: 500 }),
		last: (X, k) => X.sigil(X.P(k), SVG.heart, "heart-sh", { ms: 600, k: 0.4 }),
		judged: (X, k) => X.sigil(X.P(k), "", "sun", { ms: 600, k: 0.8, up: 0.8 }),
		vuln: (X, k) => X.ring(X.P(k), "nec", { ms: 500 }),
	};

	const SHOW_CLS = [
		"legionary",
		"paladin",
		"rogue",
		"archer",
		"mage",
		"necromancer",
		"priest",
	];

	function showList() {
		const out = [];
		for (const cls of SHOW_CLS) {
			out.push({
				key: cls + ":atk",
				cls,
				kind: "atk",
				name: "Обычная атака: попадание, крит, уклон",
			});
			if (cls === "priest")
				out.push({ key: cls + ":heal", cls, kind: "heal", name: "Лечение" });
			for (const d of AB.filter((x) => x.cls === cls))
				out.push({
					key: d.key,
					cls,
					kind: d.slot,
					name: d.name,
					br: d.br,
					id: d.ids[0],
				});
		}
		return out;
	}

	function demoFight(key, dress) {
		const [cls, what] = String(key).split(":");
		const kind = KIND[cls] || "melee",
			slot = kind === "melee" ? 0 : kind === "heal" ? 3 : 1;
		const fill = ["legionary", "rogue", "archer", "mage", "priest"],
			foes = ["paladin", "legionary", "necromancer", "archer", "priest"];
		const atk = [0, 1, 2, 3, 4].map((i) => ({
			k: "a" + i,
			login: `show-a${i}`,
			name: i === slot ? ROLE[cls] : `Синий ${i + 1}`,
			role: i === slot ? cls : fill[i] === cls ? "recruit" : fill[i],
			level: 20,
			line: SLOT_LINE[i],
			hp: 300,
		}));
		const def = [0, 1, 2, 3, 4].map((i) => ({
			k: "d" + i,
			login: `show-d${i}`,
			name: `Красный ${i + 1}`,
			role: foes[i],
			level: 20,
			line: SLOT_LINE[i],
			hp: 300,
		}));
		if (typeof dress === "function")
			for (const [side, L] of [
				["atk", atk],
				["def", def],
			])
				L.forEach((h, i) => {
					try {
						Object.assign(h, dress(h, side, i) || {});
					} catch (e) {}
				});
		const hp = {};
		[...atk, ...def].forEach((h) => {
			hp[h.k] = h.hp;
		});
		const log = [],
			a = "a" + slot,
			D = ["d0", "d1", "d2", "d3", "d4"];
		const hit = (x, d, dmg, o = {}) => {
			if (!o.dodged) hp[d] = Math.max(0, hp[d] - dmg);
			log.push({
				t: "hit",
				r: 1,
				a: x,
				d,
				dmg: o.dodged ? 0 : dmg,
				hp: hp[d],
				...o,
				...(hp[d] <= 0 && !o.dodged ? { kill: 1 } : {}),
			});
		};
		const heal = (x, d, amt, o = {}) => {
			const got = Math.min(300 - hp[d], amt);
			hp[d] += got;
			log.push({ t: "heal", r: 1, a: x, d, amt: got, hp: hp[d], ...o });
		};
		const st = (d, s) => log.push({ t: "st", r: 1, d, st: s, on: 1 });
		log.push({ t: "round", r: 1, order: [a] });

		const wound = () => {
			hit("d0", "a0" === a ? "a1" : "a0", 120);
			hit("d3", "a2", 90);
		};
		let acts = {};
		if (what === "atk") {
			hit(a, kind === "melee" || kind === "heal" ? "d0" : "d3", 34);
			log.push({ t: "round", r: 2, order: [a] });
			hit(a, kind === "melee" || kind === "heal" ? "d0" : "d4", 71, {
				crit: 1,
			});
			log.push({ t: "round", r: 3, order: [a] });
			hit(a, kind === "melee" || kind === "heal" ? "d0" : "d1", 0, {
				dodged: 1,
			});

			const tb = kind === "melee" || kind === "heal" ? "d0" : "d3";
			log.push({ t: "round", r: 4, order: [a] });
			log.push({ t: "st", r: 4, d: tb, st: "guard", on: 1 });
			hit(a, tb, 14, { blk: 1 });
			log.push({ t: "st", r: 4, d: tb, st: "guard", on: 0 });
			log.push({ t: "round", r: 5, order: [a] });
			hit(a, tb, hp[tb]);
		} else if (what === "heal") {
			wound();
			log.push({ t: "round", r: 2, order: [a] });
			heal(a, "a0", 64);
			heal(a, "a2", 88, { crit: 1 });
		} else {
			const d = AB.find((x) => x.key === key);
			if (!d) return null;
			const id = d.ids[0];
			acts = { [id]: d.name };
			const allies = ["a0", "a1", "a2", "a3", "a4"];
			let to = [];
			if (d.hl || d.tg === "wounded" || d.tg === "dead") wound();
			if (d.tg === "dead") {
				hit("d0", "a0" === a ? "a1" : "a0", 400);
			}
			if (log.length > 1) log.push({ t: "round", r: 2, order: [a] });
			switch (d.tg) {
				case "one":
					to = [kind === "melee" || kind === "heal" ? "d0" : "d3"];
					break;
				case "two":
					to = [kind === "melee" ? "d0" : "d3", kind === "melee" ? "d1" : "d4"];
					break;
				case "line":
					to = ["d3", "d4"];
					break;
				case "fm":
					to = ["d0", "d1", "d2"];
					break;
				case "all":
					to = D.slice();
					break;
				case "r3":
					to = ["d1", "d3", "d0"];
					break;
				case "self":
					to = [a];
					break;
				case "selfn":
					to = [a, a === "a1" ? "a2" : "a1"];
					break;
				case "team":
					to = allies.slice();
					break;
				case "a3":
					to = ["a0", "a1", "a2"];
					break;
				case "wounded":
					to = ["a0" === a ? "a1" : "a0", "a2"];
					break;
				case "dead":
					to = ["a0" === a ? "a1" : "a0"];
					break;
				default:
					to = ["d0"];
			}
			const tAll = d.also === "foes2" ? [...to, "d0", "d1"] : to;
			log.push({
				t: "ab",
				r: log[log.length - 1].r,
				a,
				id,
				slot: d.slot,
				to: tAll,
			});

			const nSk = id === "nec_raise" ? 1 : id === "nec_army" ? 3 : 0;
			for (let i = 0; i < nSk; i++)
				log.push({
					t: "skel",
					r: log[log.length - 1].r,
					a,
					s: `${a}s${i + 1}`,
					hp: nSk > 1 ? 24 : 36,
					i,
					n: 3,
				});
			const foesHit = tAll.filter((k) => k[0] === "d");
			const n = d.nohit ? 0 : d.hits || foesHit.length;
			const big = d.slot === "ult" ? 60 : 45;
			for (let i = 0; i < n && foesHit.length; i++)
				hit(a, foesHit[i % foesHit.length], big - i * 4, {
					sk: id,
					...(i === 0 && d.slot === "ult" && n === 1 ? { crit: 1 } : {}),
				});
			if (d.hit === "atk" && !foesHit.length)
				hit(a, kind === "melee" ? "d0" : "d3", 40, { sk: id });
			if (d.tg === "dead") log.push({ t: "revive", r: 2, a, d: to[0], hp: 90 });
			const healTo =
				d.hl === "self"
					? [a]
					: d.hl === "team"
						? allies
						: d.hl === "wounded1"
							? ["a0" === a ? "a1" : "a0"]
							: d.hl === "tg" || d.tg === "wounded"
								? tAll.filter((k) => k[0] === "a")
								: [];
			for (const k of healTo) heal(a, k, 40, { sk: id });
			if (d.st) {
				const sTo = d.stTo === "team" ? allies : d.stTo === "self" ? [a] : to;
				for (const k of sTo) st(k, d.st);
			}
			if (d.st2) for (const k of to) st(k, d.st2);
			if (nSk) {
				const r3 = log[log.length - 1].r + 1,
					s1 = `${a}s1`;
				log.push({ t: "round", r: r3, order: ["d3", "d4", a] });
				log.push({
					t: "hit",
					r: r3,
					a: "d3",
					d: a,
					dmg: nSk > 1 ? 14 : 20,
					hp: hp[a],
					sg: s1,
					shp: nSk > 1 ? 10 : 16,
				});
				log.push({
					t: "hit",
					r: r3,
					a: "d4",
					d: a,
					dmg: nSk > 1 ? 10 : 16,
					hp: hp[a],
					sg: s1,
					shp: 0,
				});
				log.push({ t: "skeld", r: r3, a, s: s1, why: "kill" });
				if (nSk > 1)
					log.push({
						t: "hit",
						r: r3,
						a: "d3",
						d: a,
						dmg: 12,
						hp: hp[a],
						sg: `${a}s2`,
						shp: 12,
					});
				hit(a, "d1", 9, { sk: "skel", s: `${a}s${nSk}` });
				if (nSk === 1) hit("d3", a, 18);
			}
			if (d.st === "poison" || d.st2 === "poison" || d.st === "burn") {
				log.push({ t: "round", r: 3, order: to.filter((k) => k[0] === "d") });
				for (const k of to.filter((x) => x[0] === "d" && hp[x] > 0)) {
					hp[k] = Math.max(1, hp[k] - 12);
					log.push({
						t: "dot",
						r: 3,
						d: k,
						dmg: 12,
						hp: hp[k],
						...(d.st === "burn" ? { burn: 1 } : {}),
					});
				}
			}
		}
		log.push({
			t: "end",
			winner: "atk",
			rounds: 1,
			why: "limit",
			hp: { atk: 100, def: 80 },
		});
		return {
			kind: "lab",
			teams: { atk, def },
			log,
			acts,
			winner: "atk",
			rounds: 1,
			why: "limit",
			me: null,
		};
	}

	function arc(n) {
		const a0 = (n / 5) * Math.PI * 2 - Math.PI / 2 + 0.12,
			a1 = ((n + 1) / 5) * Math.PI * 2 - Math.PI / 2 - 0.12,
			R = 8;
		const p = (a) =>
			`${(10 + R * Math.cos(a)).toFixed(2)} ${(10 + R * Math.sin(a)).toFixed(2)}`;
		return `M${p(a0)} A${R} ${R} 0 0 1 ${p(a1)}`;
	}

	return {
		wedge,
		play,
		figure,
		luckOrder,
		ROLE,
		KIND,
		POS,
		showList,
		demoFight,
		abFx,
		AB,
		ENGINE_ID,
		natBio,
	};
})();
