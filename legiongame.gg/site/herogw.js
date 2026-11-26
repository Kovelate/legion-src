(() => {
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
		let s = "";
		try {
			s = String(
				(window.MDDoodle && window.MDDoodle.active) ||
					(window.LG_STYLES && window.LG_STYLES[0]) ||
					"",
			);
		} catch (e) {
			s = "";
		}
		return GST.includes(s) ? s : "legion";
	};
	const mode = () =>
		window.innerHeight < 520 && window.innerWidth > window.innerHeight
			? "l"
			: window.innerWidth < 700
				? "p"
				: "";

	const O = 'stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round"';
	const slab = (
		top,
		side,
		line,
		hi,
		sh,
		r,
	) => `<ellipse cx="110" cy="74" rx="96" ry="8" fill="rgba(0,0,0,.18)"/>
    <path d="M14 30v26c0 ${r ? "12 43 20 96 20s96-8 96-20V30z" : "0 0 20 0 20H206V30z"}" fill="${side}" stroke="${line}" ${O}/>
    <path d="M14 46c0 12 43 20 96 20s96-8 96-20" fill="none" stroke="${sh}" stroke-width="3" opacity=".55"/>
    <ellipse cx="110" cy="30" rx="96" ry="20" fill="${top}" stroke="${line}" ${O}/>
    <path d="M38 26c18-8 50-11 86-9" fill="none" stroke="${hi}" stroke-width="4" stroke-linecap="round" opacity=".8"/>`;
	const PED = {
		legion:
			() => `${slab("#f3e6c8", "#d9c49a", "#2b1d18", "#fffaf0", "#8a6f3e", 1)}
      <path d="M14 40c0 12 43 20 96 20s96-8 96-20" fill="none" stroke="#ffcf4a" stroke-width="5"/>
      <path d="M96 68c6-5 10-5 14 0c4-5 8-5 14 0" fill="#7fae5a" stroke="#2b1d18" stroke-width="3" stroke-linejoin="round"/>`,

		cats: () => `<ellipse cx="110" cy="74" rx="92" ry="8" fill="rgba(122,60,70,.2)"/>
      <path d="M18 42c0-18 40-24 92-24s92 6 92 24s-40 30-92 30s-92-12-92-30z" fill="#ffb3c4" stroke="#4a2f22" ${O}/>
      <path d="M30 40c10-12 44-16 80-16" fill="none" stroke="#ffe3ea" stroke-width="5" stroke-linecap="round"/>
      <path d="M36 54c20 10 46 14 74 14s54-4 74-14" fill="none" stroke="#e0607a" stroke-width="3" stroke-linecap="round" opacity=".7"/>
      <g fill="#fff4ea" stroke="#4a2f22" stroke-width="2.5"><ellipse cx="110" cy="50" rx="9" ry="7"/><circle cx="97" cy="40" r="4"/><circle cx="106" cy="35" r="4"/><circle cx="116" cy="35" r="4"/><circle cx="124" cy="40" r="4"/></g>`,

		monkeys:
			() => `<ellipse cx="110" cy="76" rx="98" ry="7" fill="rgba(42,26,18,.3)"/>
      <path d="M12 26h196v18H12z" fill="#e8c48a" stroke="#3a2412" ${O}/><path d="M20 44h180v24H20z" fill="#c99a5e" stroke="#3a2412" ${O}/>
      <path d="M76 26v18M142 26v18M60 44v24M110 44v24M160 44v24" stroke="#3a2412" stroke-width="3"/>
      <path d="M22 31h44M84 31h50" stroke="#fff0c8" stroke-width="3.5" stroke-linecap="round" opacity=".8"/>
      <g fill="#3a2412"><circle cx="24" cy="36" r="3"/><circle cx="196" cy="36" r="3"/><circle cx="30" cy="60" r="3"/><circle cx="190" cy="60" r="3"/></g>
      <path d="M96 58c6 6 22 6 28 0" fill="none" stroke="#ffd23f" stroke-width="5" stroke-linecap="round"/>`,

		veggies:
			() => `<ellipse cx="110" cy="76" rx="96" ry="7" fill="rgba(47,58,30,.25)"/>
      <path d="M18 40h184l-10 30H28z" fill="#e0a86a" stroke="#2f3a1e" ${O}/><path d="M72 42l-4 28M148 42l4 28" stroke="#2f3a1e" stroke-width="3"/>
      <ellipse cx="110" cy="38" rx="94" ry="16" fill="#7a4e2a" stroke="#2f3a1e" ${O}/>
      <path d="M40 34c16-6 40-8 66-8" fill="none" stroke="#a8743e" stroke-width="4" stroke-linecap="round"/>
      <g fill="#8fd16a" stroke="#2f3a1e" stroke-width="2.5" stroke-linejoin="round"><path d="M34 40c-6-10 0-16 6-10c2-8 10-6 8 4z"/><path d="M178 42c-4-10 2-16 8-8c4-8 10-2 6 6z"/></g>
      <path d="M30 54h160" stroke="#fff0a8" stroke-width="3" stroke-linecap="round" opacity=".6"/>`,

		"42brothers":
			() => `<ellipse cx="110" cy="76" rx="100" ry="8" fill="rgba(255,95,168,.28)"/>
      ${slab("#3a2747", "#241530", "#ffc83d", "#7a5a92", "#120a18", 1).replace(/<ellipse cx="110" cy="74"[^>]*>/, "")}
      <path d="M14 42c0 12 43 20 96 20s96-8 96-20" fill="none" stroke="#ff5fa8" stroke-width="4"/>
      <path d="M110 22l3 6 6 1-4.5 4 1 6-5.5-3-5.5 3 1-6-4.5-4 6-1z" fill="#ffc83d" stroke="#7a4e10" stroke-width="2" stroke-linejoin="round"/>`,

		cherts:
			() => `<ellipse cx="110" cy="74" rx="100" ry="10" fill="rgba(255,106,42,.38)"/>
      <path d="M16 30l8 34 30 8h112l30-8 8-34z" fill="#3d2828" stroke="#0e0606" ${O}/>
      <path d="M12 30l22-14h152l22 14-24 12H36z" fill="#5a3a36" stroke="#0e0606" ${O}/>
      <path d="M44 22h60" stroke="#8a5a50" stroke-width="4" stroke-linecap="round"/>
      <path d="M70 42l8 12-6 10M132 42l-4 10 10 12M176 40l-6 14" fill="none" stroke="#ff6a2a" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M96 30l8 6-4 4" fill="none" stroke="#ffcf3f" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,

		ugabugi: () => `<path d="M22 70h184v8H22z" fill="rgba(36,32,26,.45)"/>
      <path d="M8 22h204v20H8z" fill="#efe6d4" stroke="#24201a" stroke-width="4.5"/><path d="M20 42h180v28H20z" fill="#b8ad98" stroke="#24201a" stroke-width="4.5"/>
      <path d="M16 28h60v4H16zM88 28h20v4H88z" fill="#fff" opacity=".8"/>
      <g fill="#24201a" opacity=".35"><path d="M40 50h8v8h-8zM92 56h8v8h-8zM150 48h8v8h-8zM176 58h8v8h-8z"/></g>
      <path d="M100 48h8v-4h8v4h8v8h-4v8h-16v-8h-4z" fill="#f2a63b" stroke="#24201a" stroke-width="3"/>`,
	};
	const pedSvg = (s) =>
		`<svg viewBox="0 0 220 84" aria-hidden="true">${(PED[s] || PED.legion)()}</svg>`;

	const K = (line, body) =>
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28"><g stroke="${line}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">${body}</g></svg>`;
	const HEART =
		"M14 24C7 19 3.5 15 3.5 10.5A5.5 5.5 0 0 1 14 8a5.5 5.5 0 0 1 10.5 2.5C24.5 15 21 19 14 24z";
	const KNOB = {
		legion: [
			K(
				"#2b1d18",
				'<circle cx="14" cy="14" r="11" fill="#ffcf4a"/><circle cx="14" cy="14" r="6.5" fill="#f2a63b" stroke-width="1.8"/><path d="M9 9c2-1.5 4-2 6-1.5" fill="none" stroke="#fff6d0" stroke-width="2"/><path d="M11 15l3-4 3 4-3 3z" fill="#fff1c4" stroke-width="1.6"/>',
			),
			K(
				"#2b1d18",
				'<path d="M14 3l9.5 3v7c0 6-4 10-9.5 12.5C8.5 23 4.5 19 4.5 13V6z" fill="#d6453a"/><path d="M14 7v14M8 12h12" stroke="#ffcf4a" stroke-width="2.6"/><path d="M8 7.5l4-1.3" fill="none" stroke="#ff9a8a" stroke-width="2"/>',
			),
		],
		cats: [
			K(
				"#4a2f22",
				'<circle cx="14" cy="14" r="11" fill="#ffb84a"/><path d="M5 11c5 1 10 5 12 13M8 6c5 2 11 7 14 14M14 3.5c4 2 8 6 9.5 10M4 17c3 1 6 3 8 7" fill="none" stroke="#c9741a" stroke-width="1.7"/><path d="M8 8.5c1.5-1.5 3.5-2.3 5.5-2.5" fill="none" stroke="#ffe3a8" stroke-width="2"/>',
			),
			K(
				"#4a2f22",
				'<circle cx="14" cy="14" r="11" fill="#ff8fa3"/><path d="M5 11c5 1 10 5 12 13M8 6c5 2 11 7 14 14M14 3.5c4 2 8 6 9.5 10M4 17c3 1 6 3 8 7" fill="none" stroke="#c2304e" stroke-width="1.7"/><path d="M8 8.5c1.5-1.5 3.5-2.3 5.5-2.5" fill="none" stroke="#ffe0e6" stroke-width="2"/>',
			),
		],
		monkeys: [
			K(
				"#3a2412",
				'<path d="M5 8c1 9 7 15 17 15 2 0 3-1 3-2-7-1-12-5-14-13-.5-2-2-3-4-3-1.5 0-2.2 1-2 3z" fill="#ffd23f"/><path d="M4.5 5l3 1" stroke-width="3.2"/><path d="M9 12c1.5 4 4.5 7 8.5 8.5" fill="none" stroke="#fff3b0" stroke-width="2"/>',
			),
			K(
				"#3a2412",
				'<path d="M7 13c0-5.5 3.5-9 8-9s8 3.5 8 8.5V17c0 3-2 5-5 5h-6c-3 0-5-2-5-5z" fill="#e0453a"/><path d="M7 13c-2.5 0-3.5 1.5-3.5 3.5S5 20 7 20" fill="#e0453a"/><path d="M9 21.5h10v3.5H9z" fill="#fff0c8"/><path d="M12 8c1.5-1 3.5-1.3 5-1" fill="none" stroke="#ff9a8a" stroke-width="2"/>',
			),
		],
		veggies: [
			K(
				"#2f3a1e",
				'<circle cx="14" cy="14.5" r="11" fill="#8fd16a"/><path d="M14 3.5c-5 3-7 8-6 14 1 4 3 6 6 7.5M14 3.5c5 3 7 8 6 14-1 4-3 6-6 7.5" fill="#b6e68a" stroke-width="1.9"/><path d="M14 8c-2 3-2.5 7-1 11 .3 1 .6 1.5 1 2 .4-.5.7-1 1-2 1.5-4 1-8-1-11z" fill="#d8f4b8" stroke-width="1.7"/><path d="M4.5 11c1 5 3 9 6 12M23.5 11c-1 5-3 9-6 12" fill="none" stroke="#3f8a2a" stroke-width="1.7"/><path d="M7 8c1-1.5 2.5-2.5 4-3" fill="none" stroke="#eaffd0" stroke-width="2"/>',
			),
			K(
				"#2f3a1e",
				'<circle cx="14" cy="16" r="9.5" fill="#e4533f"/><path d="M14 8.5l-4-3.5 1.5 4.5L7 10l5 1.5 2 3 2-3 5-1.5-4.5-.5L18 5z" fill="#6fae4a" stroke-width="1.8"/><path d="M8 15c.5-2 2-3.5 3.5-4" fill="none" stroke="#ffb0a0" stroke-width="2"/>',
			),
		],
		"42brothers": [
			K(
				"#7a4e10",
				'<circle cx="14" cy="14" r="11" fill="#241530" stroke="#ffc83d"/><path d="M14 5.5l2.6 5.3 5.900.8-4.3 4.100 1 5.8L14 18.8 8.8 21.5l1-5.8-4.3-4.100 5.900-.8z" fill="#ffc83d" stroke-width="1.5"/>',
			),
			K(
				"#ffc83d",
				`<path d="${HEART}" fill="#ff5fa8"/><path d="M8 9.5c.8-1.3 2-2 3.5-2" fill="none" stroke="#ffd0e6" stroke-width="2"/>`,
			),
		],
		cherts: [
			K(
				"#0e0606",
				'<path d="M14 2.5c1 4 6 6.5 6 12.5a6.5 6.5 0 0 1-13 0c0-2.5 1-4 2.5-5.5.5 2 1.5 3 2.5 3C11 9 12 5.5 14 2.5z" fill="#ff6a2a"/><path d="M14 13c.5 2 2.5 3 2.5 5.5a2.8 2.8 0 0 1-5.6 0c0-1.5.8-2.5 1.6-3.2" fill="#ffcf3f" stroke-width="1.6"/>',
			),
			K(
				"#0e0606",
				`<path d="M5 9C3 7 2.5 4.5 3.5 2.5 5.5 4 7.5 5 9 7zM23 9c2-2 2.5-4.5 1.5-6.5C22.5 4 20.5 5 19 7z" fill="#ffcf3f"/><path d="${HEART}" fill="#d81e1e"/><path d="M8 10c.8-1.3 2-2 3.5-2" fill="none" stroke="#ff8a76" stroke-width="2"/>`,
			),
		],
		ugabugi: [
			`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" shape-rendering="crispEdges"><path d="M10 2h8v4h4v4h4v8h-4v4h-4v4h-8v-4H6v-4H2v-8h4V6h4z" fill="#24201a"/><path d="M10 6h8v4h4v8h-4v4h-8v-4H6v-8h4z" fill="#f2a63b"/><path d="M10 10h4v4h-4z" fill="#ffe0a0"/><path d="M14 14h4v4h-4z" fill="#c9741a"/></svg>`,
			`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" shape-rendering="crispEdges"><path d="M4 4h8v4h4V4h8v4h4v8h-4v4h-4v4h-4v4h-4v-4H8v-4H4v-4H0V8h4z" fill="#24201a"/><path d="M4 8h8v4h4V8h8v8h-4v4h-4v4h-4v-4H8v-4H4z" fill="#e0523a"/><path d="M6 10h4v4H6z" fill="#ffb0a0"/></svg>`,
		],
	};
	const DO = 'stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';
	const DECO = {
		legion: `<path d="M6 31c8-3 18-11 26-27" fill="none" stroke="#2b1d18" ${DO}/><g fill="#ffcf4a" stroke="#2b1d18" ${DO}><path d="M10 27c-5-2-7-6-6-11 5 1 8 5 6 11z"/><path d="M18 21c-5-3-6-8-4-13 5 2 7 7 4 13z"/><path d="M25 13c-3-4-2-8 1-12 4 4 4 8-1 12z"/><path d="M15 28c3-5 8-6 13-4-2 5-7 7-13 4z"/><path d="M23 19c3-4 8-5 13-2-3 5-8 6-13 2z"/></g><path d="M7 18c.5 1.5 1 3 2 4.5M16 11c0 2 .5 4 1.5 5.5" fill="none" stroke="#fff3c4" stroke-width="2" stroke-linecap="round"/>`,

		cats: `<path d="M3 34C5 21 10 9 18 3q3-2 6 1c8 7 14 18 17 30z" fill="var(--gw-card)"/><path d="M11 34c1-9 4-16 9-22 6 6 10 13 12 22z" fill="#ff8fa3"/><path d="M20 12c6 6 10 13 12 22h-7c-1-8-3-15-5-22z" fill="#e0607a" opacity=".55"/><path d="M3 33C5 21 10 9 18 3q3-2 6 1c8 7 14 18 17 29" fill="none" stroke="var(--gw-line)" ${DO}/><path d="M9 18c2-5 5-9 8-12" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".85"/><path d="M15 33l1-6M21 33v-8M27 33l-1-6" fill="none" stroke="#fff4ea" stroke-width="2.2" stroke-linecap="round"/>`,

		monkeys: `<g stroke="#2a1a12" ${DO}><path d="M22 32C12 28 4 20 3 8c11 2 19 10 19 24z" fill="#5a9a3a"/><path d="M22 32C20 20 24 9 35 3c5 11 1 22-13 29z" fill="#7ab04a"/></g><path d="M7 12c5 5 10 11 14 19M33 7c-5 7-9 15-11 24" fill="none" stroke="#2a1a12" stroke-width="2" stroke-linecap="round"/><path d="M26 12c1.5-2.5 3.5-4.5 6-6" fill="none" stroke="#c9e0a8" stroke-width="2.5" stroke-linecap="round"/>`,

		veggies: `<g stroke="#2f3a1e" ${DO}><path d="M20 32C10 30 4 24 3 15c8 0 15 6 17 17z" fill="#6fae4a"/><path d="M20 32c-4-10-2-20 4-29 7 8 7 19-4 29z" fill="#8fd16a"/><path d="M22 32c2-9 8-15 18-16 0 9-7 15-18 16z" fill="#5aa83a"/></g><path d="M22 10c-1.5 5-2 11-1.5 18" fill="none" stroke="#2f3a1e" stroke-width="2" stroke-linecap="round"/><path d="M25 9c1 1.5 1.5 3 2 5" fill="none" stroke="#d4f0b8" stroke-width="2.5" stroke-linecap="round"/>`,

		"42brothers": `<path d="M5 31V10l9 9 8-15 8 15 9-9v21z" fill="#ffc83d" stroke="#7a4e10" ${DO}/><path d="M5 25h34" stroke="#7a4e10" stroke-width="2.5"/><circle cx="22" cy="5" r="3.5" fill="#ff5fa8" stroke="#7a4e10" stroke-width="2.5"/><circle cx="5" cy="10" r="3" fill="#ffe39a" stroke="#7a4e10" stroke-width="2.5"/><circle cx="39" cy="10" r="3" fill="#ffe39a" stroke="#7a4e10" stroke-width="2.5"/><path d="M10 21l4 4M19 13l3-5" fill="none" stroke="#fff3c4" stroke-width="2.5" stroke-linecap="round"/>`,

		cherts: `<path d="M8 32C4 20 6 9 16 2c-2 8 2 13 9 17 5 3 9 7 10 13z" fill="#a8323e" stroke="#0e0606" ${DO}/><path d="M11 22c1 3 4 6 9 8" fill="none" stroke="#0e0606" stroke-width="2" stroke-linecap="round" opacity=".5"/><path d="M11 9c-1.5 3-2 6-1.5 9" fill="none" stroke="#ff8a76" stroke-width="2.5" stroke-linecap="round"/>`,

		ugabugi: `<g shape-rendering="crispEdges"><path d="M4 32V20h4v-8h4V4h12v8h-4v8h-4v12z" fill="#24201a"/><path d="M8 32V20h4v-8h4V8h4v4h-4v8h-4v12z" fill="#f6f0e4"/><path d="M8 24h4v8H8z" fill="#c4baa6"/></g>`,
	};
	const decoSvg = (s) => {
		const d = DECO[s] || DECO.legion,
			one = `<svg viewBox="0 0 44 32" aria-hidden="true">${d}</svg>`;
		return one + one;
	};
	const uri = (svg) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
	(function knobCss() {
		const e = document.createElement("style");
		e.id = "hw-knobs";
		e.textContent = GST.map(
			(s) =>
				`.hw[data-gst="${s}"]{--hw-kxp:${uri(KNOB[s][0])};--hw-khp:${uri(KNOB[s][1])}}`,
		).join("\n");
		(document.head || document.documentElement).appendChild(e);
	})();

	const CTX = { hero: null, who: "", api: null, apply: null };
	const hwOn = () => {
		const t = document.getElementById("tab-hero");
		return !!(t && t.classList.contains("hw"));
	};
	let lastVw = "";
	let pane = "bag";
	try {
		if (localStorage.getItem("lgHwPane") === "stats") pane = "stats";
	} catch (e) {}

	function frame(tab, s, m, v0, bar) {
		if (tab.dataset.gst !== s) tab.dataset.gst = s;
		if (m) {
			if (tab.dataset.m !== m) tab.dataset.m = m;
		} else if (tab.dataset.m) delete tab.dataset.m;
		if ((tab.dataset.hwv || "") !== v0) tab.dataset.hwv = v0;
		if (bar) {
			bar.classList.add("hw-bar", "hw-pop");
			if (bar.dataset.gst !== s) bar.dataset.gst = s;
			const x = bar.querySelector(".gu-wc");
			if (x && !x.getAttribute("aria-label"))
				x.setAttribute("aria-label", "Закрыть");
		}
		const hv = tab.querySelector(":scope > .hero-views");
		if (!hv) return;
		if (!hv.querySelector(".hw-title")) {
			const t = document.createElement("h2");
			t.className = "hw-title";
			t.textContent = "Герой";
			hv.append(t);
		}
		const og = hv.querySelector('.views [data-view="gear"]');
		if (!og) return;
		let pt = hv.querySelector(".views .hw-vhero");
		if (!pt) {
			pt = document.createElement("button");
			pt.type = "button";
			pt.className = "hw-vhero";
			pt.textContent = "Персонаж";
			pt.addEventListener("click", () => {
				const g = tab.querySelector('.hero-views .views [data-view="gear"]');
				if (g) g.click();
			});
			og.parentElement.append(pt);
		}
		const inHero = String(v0 === "gear" || v0 === "look");
		if (pt.getAttribute("aria-pressed") !== inHero)
			pt.setAttribute("aria-pressed", inHero);
	}
	function sync() {
		const tab = document.getElementById("tab-hero");
		if (!tab) return;

		const H0 = heroNow(),
			vb = tab.querySelector(
				':scope > .hero-views .views [data-view][aria-pressed="true"]',
			),
			v0 = vb ? vb.dataset.view : "";
		const R = document.documentElement,
			s = gst(),
			fr =
				!!(H0 && H0.hg) &&
				R.classList.contains("gu-whero") &&
				tab.classList.contains("gu-win") &&
				!!v0;
		const open = fr && (v0 === "gear" || v0 === "look"),
			m = fr ? mode() : "";
		if (tab.classList.contains("hw") !== open) tab.classList.toggle("hw", open);
		if (tab.classList.contains("hw-fr") !== fr)
			tab.classList.toggle("hw-fr", fr);
		if (tab.classList.contains("gw-tok") !== fr)
			tab.classList.toggle("gw-tok", fr);

		const dk =
			open || (fr && (v0 === "skills" || v0 === "log" || v0 === "ach"));
		if (tab.classList.contains("gw-dk") !== dk)
			tab.classList.toggle("gw-dk", dk);
		if (R.classList.contains("hw-m") !== !!m) R.classList.toggle("hw-m", !!m);
		if (!open) {
			for (const k of fr ? ["hwp"] : ["gst", "m", "hwv", "hwp"])
				if (k in tab.dataset) delete tab.dataset[k];
			[...tab.classList]
				.filter((c) => /^hw-/.test(c) && c !== "hw-fr")
				.forEach((c) => tab.classList.remove(c));
			document
				.querySelectorAll(".ctxm.hw-pop, .lgi-tip.hw-pop")
				.forEach((e) => {
					e.classList.remove("hw-pop", "gw-dk");
					delete e.dataset.gst;
				});
			const b0 = document.getElementById("gu-wbar");
			if (!fr) {
				if (b0 && b0.classList.contains("hw-bar")) {
					b0.classList.remove("hw-bar", "hw-pop");
					b0.classList.remove("gw-dk");
					delete b0.dataset.gst;
				}
				return;
			}

			frame(tab, s, m, v0, b0);
			if (b0) b0.classList.toggle("gw-dk", dk);
			return;
		}
		const b1 = document.getElementById("gu-wbar");
		frame(tab, s, m, v0, b1);
		if (b1) b1.classList.add("gw-dk");
		if (tab.dataset.hwp !== pane && m) tab.dataset.hwp = pane;
		document
			.querySelectorAll(".ctxm:not(.hw-pop), .lgi-tip:not(.hw-pop)")
			.forEach((e) => {
				e.classList.add("hw-pop", "gw-dk");
				e.dataset.gst = s;
			});
		const hv = tab.querySelector(":scope > .hero-views");
		const lf = tab.querySelector(".lc-fig");
		if (lf) {
			let p = lf.querySelector(":scope > .hw-ped");
			if (!p) {
				p = document.createElement("span");
				p.className = "hw-ped";
				lf.append(p);
			}
			if (p.dataset.s !== s) {
				p.dataset.s = s;
				p.innerHTML = pedSvg(s);
			}
		}
		const ped = tab.querySelector(".lgi-ped");
		if (ped) {
			let p = ped.querySelector(":scope > .hw-ped");
			if (!p) {
				p = document.createElement("span");
				p.className = "hw-ped";
				ped.append(p);
			}
			if (p.dataset.s !== s) {
				p.dataset.s = s;
				p.innerHTML = pedSvg(s);
			}
			const fig = ped.querySelector(":scope > svg");
			if (fig && fig.getAttribute("preserveAspectRatio") !== "xMidYMax meet")
				fig.setAttribute("preserveAspectRatio", "xMidYMax meet");
		}

		const og = hv && hv.querySelector('.views [data-view="gear"]'),
			ol = hv && hv.querySelector('.views [data-view="look"]');
		if (og && ol) {
			const vw =
				ol.getAttribute("aria-pressed") === "true"
					? "look"
					: og.getAttribute("aria-pressed") === "true"
						? "gear"
						: "";
			if ((tab.dataset.hwv || "") !== vw) tab.dataset.hwv = vw;
			const st = tab.querySelector(":scope > .hero-grid > .stage");
			if (st) {
				let sw = st.querySelector(":scope > .hw-vsw");
				if (!sw) {
					sw = document.createElement("div");
					sw.className = "hw-vsw";
					sw.setAttribute("role", "group");
					sw.setAttribute("aria-label", "Что показать");
					sw.innerHTML =
						'<button type="button" data-hwv="gear">Снаряжение</button><button type="button" data-hwv="look">Облик</button>';
					sw.addEventListener("click", (e) => {
						const b = e.target.closest("button[data-hwv]");
						if (!b) return;
						const o = tab.querySelector(
							'.hero-views .views [data-view="' + b.dataset.hwv + '"]',
						);
						if (o) o.click();
					});
					st.append(sw);
				}
				if (!sw.dataset.on) {
					sw.dataset.on = lastVw || vw;
					if (lastVw && lastVw !== vw) {
						tab.classList.add("hw-swap");
						setTimeout(() => tab.classList.remove("hw-swap"), 320);
						requestAnimationFrame(() =>
							requestAnimationFrame(() => {
								sw.dataset.on = vw;
							}),
						);
					}
				} else if (sw.dataset.on !== vw && vw) sw.dataset.on = vw;
				if (vw) lastVw = vw;
				sw.querySelectorAll("button").forEach((b) => {
					const on = String(
						(b.dataset.hwv === "gear" ? og : ol).getAttribute(
							"aria-pressed",
						) === "true",
					);
					if (b.getAttribute("aria-pressed") !== on)
						b.setAttribute("aria-pressed", on);
				});
			}
		}
		const grid = tab.querySelector(":scope > .hero-grid");
		if (grid && !grid.querySelector(":scope > .hw-seg")) {
			const g = document.createElement("div");
			g.className = "hw-seg";
			g.setAttribute("role", "group");
			g.setAttribute("aria-label", "Что показать");
			g.innerHTML =
				'<button type="button" data-hwp="bag">Сумка</button><button type="button" data-hwp="stats">Характеристики</button>';
			g.addEventListener("click", (e) => {
				const b = e.target.closest("button[data-hwp]");
				if (!b) return;
				pane = b.dataset.hwp;
				try {
					localStorage.setItem("lgHwPane", pane);
				} catch (er) {}
				sync();
			});
			grid.appendChild(g);
		}
		if (grid)
			for (const k of ["vitals", "stage", "bag"]) {
				if (!grid.querySelector(":scope > ." + k)) continue;
				let d = grid.querySelector(':scope > .hw-deco[data-for="' + k + '"]');
				if (!d) {
					d = document.createElement("span");
					d.className = "hw-deco";
					d.dataset.for = k;
					d.setAttribute("aria-hidden", "true");
					grid.appendChild(d);
				}
				if (d.dataset.s !== s) {
					d.dataset.s = s;
					d.innerHTML = decoSvg(s);
				}
			}
		if (grid)
			grid
				.querySelectorAll(":scope > .hw-seg button")
				.forEach((b) =>
					b.setAttribute("aria-pressed", String(b.dataset.hwp === pane)),
				);
		v14(tab, s, m, grid);
		v15tpl(tab, m);
		v17(tab, m);
		v18gear(tab, m);
	}

	const SW =
		'stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round"';
	const shd = (rx = 40) =>
		`<ellipse cx="64" cy="119" rx="${rx}" ry="6" fill="rgba(0,0,0,.2)"/>`;
	const HRT =
		"M64 112C30 88 12 68 12 44a26 26 0 0 1 52-8a26 26 0 0 1 52 8c0 24-18 44-52 68z";
	const heart = (
		c,
	) => `${shd(36)}${c.back || ""}<path d="${HRT}" fill="${c.f}" stroke="${c.l}" ${SW}/>
    <path d="M22 66c9 15 22 28 42 42 20-14 33-27 42-42-9 11-22 21-42 31-20-10-33-20-42-31z" fill="${c.d}"/>
    <path d="M26 42c1-9 7-15 15-16" fill="none" stroke="${c.hi}" stroke-width="7" stroke-linecap="round"/>${c.extra || ""}`;
	const SHLD = "M64 10l44 14v30c0 30-18 52-44 64C38 106 20 84 20 54V24z";
	const shield = (
		c,
	) => `${shd(34)}<path d="${SHLD}" fill="${c.f}" stroke="${c.l}" ${SW}/>
    <path d="M64 14l40 13v27c0 27-16 47-40 59z" fill="${c.d}" opacity=".55"/>
    <path d="M32 32v22c0 10 3 19 8 27" fill="none" stroke="${c.hi}" stroke-width="6" stroke-linecap="round"/>${c.extra || ""}<path d="${SHLD}" fill="none" stroke="${c.l}" ${SW}/>`;
	const sword = (
		c,
	) => `${shd(34)}<path d="M100 12h16v16L60 84 44 68z" fill="${c.f}" stroke="${c.l}" ${SW}/><path d="M112 16L56 72l4 4 52-52z" fill="${c.d}"/>
    <path d="M96 22L58 60" fill="none" stroke="${c.hi}" stroke-width="5" stroke-linecap="round"/>
    <path d="M30 62l36 36" fill="none" stroke="${c.l}" stroke-width="17" stroke-linecap="round"/><path d="M30 62l36 36" fill="none" stroke="${c.g}" stroke-width="8" stroke-linecap="round"/>
    <path d="M44 84L20 108" fill="none" stroke="${c.l}" stroke-width="16" stroke-linecap="round"/><path d="M44 84L20 108" fill="none" stroke="${c.h}" stroke-width="7" stroke-linecap="round"/>
    <circle cx="16" cy="112" r="9" fill="${c.g}" stroke="${c.l}" stroke-width="4"/>`;
	const STAR =
		"M64 6c5 32 14 41 46 46-32 6-41 14-46 46-5-32-14-40-46-46 32-5 41-14 46-46z";
	const star = (
		c,
	) => `${shd(30)}<path d="${STAR}" fill="${c.f}" stroke="${c.l}" ${SW}/><path d="M64 52h46c-32 6-41 14-46 46z" fill="${c.d}"/>
    <path d="M58 30c-2 10-6 16-14 19" fill="none" stroke="${c.hi}" stroke-width="5" stroke-linecap="round"/>
    <path d="M104 86c2 10 5 13 14 15-9 2-12 5-14 15-2-10-5-13-14-15 9-2 12-5 14-15z" fill="${c.s || c.f}" stroke="${c.l}" stroke-width="4" stroke-linejoin="round"/>${c.extra || ""}`;
	const FLAME =
		"M64 8c6 22 38 34 38 68a38 38 0 0 1-76 0c0-15 7-26 15-34 2 13 8 19 15 19-4-21 0-39 8-53z";
	const flame = (
		c,
	) => `${shd(34)}<path d="${FLAME}" fill="${c.f}" stroke="${c.l}" ${SW}/><path d="M86 56c8 8 14 18 14 30a36 36 0 0 1-30 30c16-8 22-24 16-60z" fill="${c.d}"/>
    <path d="M64 62c3 12 18 18 18 34a18 18 0 0 1-36 0c0-8 4-13 8-17 1 6 4 9 7 9-2-10-1-18 3-26z" fill="${c.i}" stroke="${c.l}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M40 66c2-6 5-11 9-15" fill="none" stroke="${c.hi}" stroke-width="5" stroke-linecap="round"/>`;
	const FIST =
		"M26 56c0-9 6-14 13-14h52c9 0 15 7 15 15v25c0 17-13 30-30 30H50c-14 0-24-10-24-24z";
	const fist = (
		c,
	) => `${shd(38)}<path d="${FIST}" fill="${c.f}" stroke="${c.l}" ${SW}/><path d="M104 74v8c0 17-13 30-30 30H50c-10 0-18-5-22-13 7 5 14 6 22 6h24c16 0 28-12 30-31z" fill="${c.d}"/>
    <path d="M48 42v22M68 42v22M88 43v21" fill="none" stroke="${c.l}" stroke-width="4" stroke-linecap="round"/>
    <path d="M26 72h30c8 0 9 12 1 12H34" fill="${c.f}" stroke="${c.l}" ${SW}/><path d="M34 50h8M54 50h8M74 50h8" fill="none" stroke="${c.hi}" stroke-width="5" stroke-linecap="round"/>${c.extra || ""}`;
	const PELT =
		"M40 12c8 6 16 9 24 9s16-3 24-9c5 8 5 16 0 22l14 8c-2 10-8 15-14 15 5 16 5 33-4 50-6 5-13 7-20 7s-14-2-20-7c-9-17-9-34-4-50-6 0-12-5-14-15l14-8c-5-6-5-14 0-22z";
	const pelt = (
		c,
	) => `${shd(34)}<path d="${PELT}" fill="${c.f}" stroke="${c.l}" ${SW}/><path d="M84 57c4 15 4 32-4 48-5 4-10 6-16 7 12-14 16-34 12-55z" fill="${c.d}"/>
    <g fill="${c.sp}"><ellipse cx="54" cy="58" rx="7" ry="5"/><ellipse cx="74" cy="78" rx="6" ry="5"/><ellipse cx="52" cy="90" rx="5" ry="4"/></g>
    <path d="M46 40c6 3 12 4 18 4" fill="none" stroke="${c.hi}" stroke-width="5" stroke-linecap="round"/>${c.extra || ""}`;
	const STI = {
		legion: {
			l: "#2b1d18",
			hp: (l) =>
				heart({
					l,
					f: "#d6453a",
					d: "#a8302a",
					hi: "#ff9a8a",
					extra: `<path d="M44 58h40M64 40v40" stroke="#ffcf4a" stroke-width="9" stroke-linecap="round"/><path d="M44 58h40M64 40v40" fill="none" stroke="${l}" stroke-width="2" opacity=".35"/>`,
				}),
			atk: (l) =>
				sword({
					l,
					f: "#e8eef2",
					d: "#a9b6c0",
					hi: "#ffffff",
					g: "#ffcf4a",
					h: "#8a5a2b",
				}),
			mag: (l) =>
				star({ l, f: "#6ab0ff", d: "#3a78c8", hi: "#e0f0ff", s: "#ffcf4a" }),
			def: (l) =>
				shield({
					l,
					f: "#c8352d",
					d: "#8f221c",
					hi: "#ff8a7a",
					extra: `<path d="M64 22v86" stroke="#ffcf4a" stroke-width="6"/><circle cx="64" cy="58" r="13" fill="#ffcf4a" stroke="${l}" stroke-width="4"/><path d="M59 53l5-3" stroke="#fff6d0" stroke-width="3" stroke-linecap="round"/>`,
				}),
		},
		cats: {
			l: "#4a2f22",
			hp: (l) =>
				heart({
					l,
					f: "#ff6f8e",
					d: "#e0405e",
					hi: "#ffd0dc",
					back: `<path d="M20 34L22 8l24 18zM108 34l-2-26-24 18z" fill="#ff6f8e" stroke="${l}" ${SW}/><path d="M26 26l1-10 9 7zM102 26l-1-10-9 7z" fill="#ffd0dc"/>`,
				}),
			atk: (
				l,
			) => `${shd(36)}<g fill="none" stroke-linecap="round"><path d="M30 104L74 20M54 112L98 28M78 116l36-68" stroke="${l}" stroke-width="20"/><path d="M30 104L74 20M54 112L98 28M78 116l36-68" stroke="#ff8fa3" stroke-width="10"/><path d="M58 46l10-19M82 54l10-19" stroke="#ffe3ea" stroke-width="4"/></g>
        <path d="M12 52c6-18 20-30 34-32-6 10-8 22-4 34-10-6-20-6-30-2z" fill="#fff4ea" stroke="${l}" ${SW}/>`,
			mag: (l) =>
				star({
					l,
					f: "#b48cff",
					d: "#8a5ad8",
					hi: "#efe4ff",
					s: "#ff8fa3",
					extra: `<g fill="#fff4ea" stroke="${l}" stroke-width="3"><ellipse cx="64" cy="60" rx="8" ry="6.5"/><circle cx="54" cy="50" r="3.5"/><circle cx="61" cy="45" r="3.5"/><circle cx="69" cy="45" r="3.5"/><circle cx="75" cy="50" r="3.5"/></g>`,
				}),
			def: (
				l,
			) => `${shd(40)}<path d="M30 100c-14 0-22-10-20-22 1-10 9-16 17-16-2-14 8-26 22-26 4-12 14-20 27-18 14 2 22 14 21 26 12 0 21 10 21 22 0 18-12 34-28 34z" fill="#f6d6b8" stroke="${l}" ${SW}/>
        <path d="M108 70c4 18-8 30-20 30H34c10-2 50-2 64-14 6-5 9-10 10-16z" fill="#e0b48c"/><path d="M34 74c0-8 4-14 10-17M56 44c3-8 9-12 16-12" fill="none" stroke="#fffaf2" stroke-width="6" stroke-linecap="round"/>
        <path d="M50 78c4 4 10 4 14 0M70 78c4 4 10 4 14 0" fill="none" stroke="${l}" stroke-width="3.5" stroke-linecap="round"/>`,
		},
		monkeys: {
			l: "#2a1a12",
			hp: (l) =>
				heart({
					l,
					f: "#e0453a",
					d: "#b02f26",
					hi: "#ff9a8a",
					extra: `<path d="M48 54c6 12 18 18 32 14 2-1 2-3 1-4-10 1-18-3-23-12-2-2-4-3-7-2-2 1-3 2-3 4z" fill="#ffd23f" stroke="${l}" stroke-width="3.5" stroke-linejoin="round"/>`,
				}),
			atk: (l) => fist({ l, f: "#c99a5e", d: "#9a6e38", hi: "#f0d0a0" }),
			mag: (
				l,
			) => `${shd(30)}<path d="M84 8c22 22 20 62-14 98L58 116l4-20C40 70 52 30 84 8z" fill="#7ab04a" stroke="${l}" ${SW}/><path d="M84 8c10 30 4 62-22 88l-4 20 12-10c34-36 36-76 14-98z" fill="#5a9a3a"/>
        <path d="M84 8C76 40 70 70 62 96" fill="none" stroke="${l}" stroke-width="4" stroke-linecap="round"/><path d="M84 8c10 6 14 14 12 22-6-2-10-8-12-22z" fill="#e0453a" stroke="${l}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M66 40c-4 8-6 16-6 24" fill="none" stroke="#c9e0a8" stroke-width="5" stroke-linecap="round"/><path d="M58 116l4-20" stroke="${l}" stroke-width="6" stroke-linecap="round"/>`,
			def: (l) =>
				pelt({ l, f: "#b07a48", d: "#7e5028", hi: "#e0b080", sp: "#5a3a1e" }),
		},
		veggies: {
			l: "#2f3a1e",
			hp: (l) =>
				heart({
					l,
					f: "#e4533f",
					d: "#b8392a",
					hi: "#ffb0a0",
					extra: `<path d="M64 34l-14-12 6 14-14 2 16 4 6 10 6-10 16-4-14-2 6-14z" fill="#6fae4a" stroke="${l}" stroke-width="3.5" stroke-linejoin="round"/>`,
				}),
			atk: (
				l,
			) => `${shd(36)}<path d="M104 10c8 6 8 16 2 24L56 84 40 70z" fill="#e8eef2" stroke="${l}" ${SW}/><path d="M106 34L56 84l-6-5 52-54c4 3 4 6 4 9z" fill="#a9b6c0"/>
        <path d="M96 20L56 62" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/><path d="M48 78L20 106" fill="none" stroke="${l}" stroke-width="20" stroke-linecap="round"/><path d="M48 78L20 106" fill="none" stroke="#a8743e" stroke-width="11" stroke-linecap="round"/>
        <circle cx="30" cy="96" r="3" fill="${l}"/><circle cx="40" cy="86" r="3" fill="${l}"/>`,
			mag: (
				l,
			) => `${shd(30)}<path d="M50 30c22-4 40 8 44 30 4 24-10 48-34 58-6 2-10-2-8-8 12-18 14-36 4-54-4-6-10-10-16-12-6-2-6-12 10-14z" fill="#e4533f" stroke="${l}" ${SW}/>
        <path d="M92 52c4 26-8 50-30 64 20-4 34-20 36-44 0-8-2-14-6-20z" fill="#b8392a"/><path d="M48 30c-4-12 2-22 14-24 0 8-4 14-10 18" fill="#6fae4a" stroke="${l}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M44 32c-8 4-12 10-12 16 10 0 18-4 22-10" fill="#8fd16a" stroke="${l}" stroke-width="4" stroke-linejoin="round"/><path d="M62 44c8 2 14 8 16 16" fill="none" stroke="#ffb0a0" stroke-width="5" stroke-linecap="round"/>`,
			def: (l) =>
				shield({
					l,
					f: "#c48ad8",
					d: "#8a52a8",
					hi: "#f0d8ff",
					extra: `<path d="M64 18c-14 18-20 50-12 90M64 18c14 18 20 50 12 90M64 18v94" fill="none" stroke="#f6e8ff" stroke-width="3.5" opacity=".75"/><path d="M58 12c2-6 10-6 12 0" fill="#8fd16a" stroke="${l}" stroke-width="4"/>`,
				}),
		},
		"42brothers": {
			l: "#120a18",
			hp: (l) =>
				heart({
					l,
					f: "#ff5fa8",
					d: "#d83a86",
					hi: "#ffd0e6",
					extra: `<path d="M12 44a26 26 0 0 1 52-8a26 26 0 0 1 52 8" fill="none" stroke="#ffc83d" stroke-width="3.5"/>`,
				}),
			atk: (l) =>
				fist({
					l,
					f: "#f2c8a0",
					d: "#d0a07a",
					hi: "#fff0dc",
					extra: `<path d="M38 42h60v12H38z" fill="#ffc83d" stroke="${l}" stroke-width="4" stroke-linejoin="round"/><path d="M44 46h18" stroke="#fff3c4" stroke-width="3" stroke-linecap="round"/>`,
				}),
			mag: (l) =>
				star({ l, f: "#ffc83d", d: "#d89a10", hi: "#fff3c4", s: "#ff5fa8" }),
			def: (l) =>
				pelt({
					l,
					f: "#8a5ab8",
					d: "#5a3a82",
					hi: "#d0b0f0",
					sp: "#c8a0ec",
					extra: `<circle cx="64" cy="62" r="5" fill="#ffc83d" stroke="${l}" stroke-width="3"/><circle cx="64" cy="82" r="5" fill="#ffc83d" stroke="${l}" stroke-width="3"/>`,
				}),
		},
		cherts: {
			l: "#0e0606",
			hp: (l) =>
				heart({
					l,
					f: "#d81e1e",
					d: "#a01010",
					hi: "#ff8a76",
					back: `<path d="M24 34C14 26 12 14 16 4c6 10 14 14 24 16zM104 34c10-8 12-20 8-30-6 10-14 14-24 16z" fill="#ffcf3f" stroke="${l}" ${SW}/>`,
				}),
			atk: (
				l,
			) => `${shd(30)}<path d="M64 52v66" stroke="${l}" stroke-width="16" stroke-linecap="round"/><path d="M64 52v66" stroke="#7a4a30" stroke-width="7" stroke-linecap="round"/>
        <path d="M30 8v28c0 12 14 20 34 20s34-8 34-20V8M64 8v48" fill="none" stroke="${l}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/><path d="M30 8v28c0 12 14 20 34 20s34-8 34-20V8M64 8v48" fill="none" stroke="#c8c0c0" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M22 16l8-12 8 12zM56 16l8-12 8 12zM90 16l8-12 8 12z" fill="#ff6a2a" stroke="${l}" stroke-width="4" stroke-linejoin="round"/>`,
			mag: (l) =>
				flame({ l, f: "#ff6a2a", d: "#d8401a", i: "#ffcf3f", hi: "#ffd0a0" }),
			def: (l) =>
				shield({
					l,
					f: "#7a2630",
					d: "#4a1218",
					hi: "#d86a70",
					extra: `<path d="M34 46c5 6 11 6 16 0 5 6 11 6 16 0 5 6 11 6 16 0 5 6 11 6 16 0M38 66c5 6 11 6 16 0 5 6 11 6 16 0 5 6 11 6 16 0M46 86c5 6 11 6 16 0 5 6 11 6 16 0" fill="none" stroke="#a8323e" stroke-width="4" stroke-linecap="round"/>`,
				}),
		},
	};

	const pxArt = (rows, pal) => {
		let o = "";
		rows.forEach((r, y) => {
			for (let x = 0; x < 16; x++) {
				const c = r[x];
				if (c && c !== ".")
					o += `<rect x="${x * 8}" y="${y * 8}" width="8" height="8" fill="${pal[c]}"/>`;
			}
		});
		return `<g shape-rendering="crispEdges">${o}</g>`;
	};
	const UPAL = {
		k: "#24201a",
		s: "rgba(36,32,26,.25)",
		r: "#e0523a",
		d: "#a83a28",
		w: "#fff0d8",
		b: "#b07a48",
		e: "#7e5028",
		h: "#5a3a1e",
		y: "#f2a63b",
		o: "#c9741a",
		p: "#c4935a",
		q: "#8a6030",
	};
	STI.ugabugi = {
		l: UPAL.k,
		hp: () =>
			pxArt(
				[
					"................",
					"..kkkk....kkkk..",
					".krrwwk..krrrrk.",
					"krrwrrrkkrrrrrdk",
					"krwrrrrrrrrrrrdk",
					"krrrrrrrrrrrrrdk",
					"krrrrrrrrrrrrrdk",
					".krrrrrrrrrrrdk.",
					"..krrrrrrrrrdk..",
					"...krrrrrrrdk...",
					"....krrrrrdk....",
					".....krrrdk.....",
					"......krdk......",
					".......kk.......",
					"...ssssssssss...",
					"................",
				],
				UPAL,
			),
		atk: () =>
			pxArt(
				[
					"................",
					"..........kkkk..",
					".........kbwbbk.",
					"........kbwbbbek",
					"........kbbbbbek",
					".......kbbbbbek.",
					"......khkbbeek..",
					".....khhkkkkk...",
					"....khhk........",
					"...khhk.........",
					"..khhk..........",
					".khhk...........",
					".kkk............",
					"................",
					"..ssssssssssss..",
					"................",
				],
				UPAL,
			),
		mag: () =>
			pxArt(
				[
					"................",
					".......kk.......",
					"......kwyk......",
					"......kyyk......",
					".....kyyyyk.....",
					"..kkkkyyyykkkk..",
					".kwyyyyyyyyyyok.",
					"..kkkkyyyykkkk..",
					".....kyyyok.....",
					"......kyok......",
					"......kyok......",
					".......kk.......",
					".............k..",
					"............kyk.",
					"...ssssssss..k..",
					"................",
				],
				UPAL,
			),
		def: () =>
			pxArt(
				[
					"................",
					"...kk......kk...",
					"..kppk....kppk..",
					"..kpppkkkkpppk..",
					"...kppppppppk...",
					"...kpwppppppk...",
					"..kppppqqppppk..",
					".kppppppppppppk.",
					".kpppqqpppppqpk.",
					".kppppppppppppk.",
					"..kppppppppppk..",
					"..kpppkkkkpppk..",
					"..kppk....kppk..",
					"...kk......kk...",
					"..ssssssssssss..",
					"................",
				],
				UPAL,
			),
	};
	const stiSvg = (s, k) => {
		const S = STI[s] || STI.legion;
		return `<svg viewBox="0 0 128 128" aria-hidden="true">${S[k](S.l)}</svg>`;
	};

	const GLOW = {
		legion: "#ffcf4a",
		cats: "#ff9ab0",
		monkeys: "#ffd23f",
		veggies: "#b6e68a",
		"42brothers": "#ff5fa8",
		cherts: "#ff6a2a",
		ugabugi: "#f2a63b",
	};
	const glowSvg = (s) => {
		const c = GLOW[s] || GLOW.legion;
		if (s === "ugabugi")
			return `<svg viewBox="0 0 160 160" aria-hidden="true" shape-rendering="crispEdges"><path d="M48 8h64v16h16v16h16v80h-16v16h-16v16H48v-16H32v-16H16V40h16V24h16z" fill="${c}" opacity=".22"/><path d="M56 32h48v16h16v64h-16v16H56v-16H40V48h16z" fill="${c}" opacity=".3"/><path d="M64 56h32v48H64z" fill="${c}" opacity=".35"/></svg>`;
		return `<svg viewBox="0 0 160 160" aria-hidden="true"><circle cx="80" cy="80" r="78" fill="${c}" opacity=".14"/><circle cx="80" cy="80" r="60" fill="${c}" opacity=".18"/><circle cx="80" cy="80" r="40" fill="${c}" opacity=".22"/>${s === "42brothers" || s === "cherts" ? `<g fill="${c}" opacity=".6"><circle cx="22" cy="44" r="4"/><circle cx="140" cy="34" r="3"/><circle cx="132" cy="120" r="4"/><circle cx="30" cy="126" r="3"/></g>` : ""}</svg>`;
	};

	const UP =
		'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l8 9h-5v9H9v-9H4z" style="fill:var(--gw-acc);stroke:var(--gw-line)" stroke-width="2.2" stroke-linejoin="round"/><path d="M12 6.5l-4 4.5" stroke="rgba(255,255,255,.75)" stroke-width="1.8" stroke-linecap="round"/></svg>';
	const RIB =
		'<svg viewBox="0 0 16 26" aria-hidden="true"><path d="M2 0h12v24l-6-5-6 5z" style="fill:var(--rc, var(--gw-acc));stroke:var(--gw-line)" stroke-width="2" stroke-linejoin="round"/><path d="M5 2v12" stroke="rgba(255,255,255,.6)" stroke-width="2" stroke-linecap="round"/></svg>';
	const PLUS =
		'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" style="fill:var(--gw-acc);stroke:var(--gw-line)" stroke-width="2.2"/><path d="M12 7v10M7 12h10" style="stroke:var(--gw-on-acc)" stroke-width="3" stroke-linecap="round"/></svg>';

	const POW = {
		atk: 1,
		mag: 1,
		def: 1,
		hp: 0.25,
		crit: 0.8,
		critDmg: 0.2,
		dodge: 0.8,
		pierce: 0.8,
		heal: 0.5,
		luck: 0.5,
		res: 0.5,
	};
	const powOf = (it) => {
		const st = (it && (it.slotStats || it.stats)) || {};
		let p = 0;
		for (const k of Object.keys(st))
			p += (+st[k] || 0) * (POW[k] == null ? 0.3 : POW[k]);
		return p + (+it.en || 0) * 2;
	};

	const heroNow = () => CTX.hero || null;
	const whoNow = () => CTX.who || "hero";

	function v14slots(tab) {
		const H = heroNow(),
			items = (H && H.items) || [],
			role = H && H.role;
		tab.querySelectorAll(".lgi-dollx .lgi-slot").forEach((b) => {
			const sl = b.dataset.slot,
				uid = b.dataset.ig,
				empty = !uid;
			const it = uid ? items.find((x) => x.uid === uid) : null;
			const best = items
				.filter(
					(x) =>
						!x.on &&
						!x.ob &&
						x.slot === sl &&
						(!x.role || !role || x.role === role),
				)
				.reduce((a, x) => (!a || powOf(x) > powOf(a) ? x : a), null);
			const up = !!best && (empty || powOf(best) > (it ? powOf(it) : 0) + 0.5);
			const want =
				(up ? "u" : "") +
				(!empty && /^(rare|epic|legendary|mythic)$/.test(b.dataset.r || "")
					? "r"
					: "");
			let w = b.querySelector(":scope > .hw-sb");
			if (!want) {
				if (w) w.remove();
			} else {
				if (!w) {
					w = document.createElement("span");
					w.className = "hw-sb";
					w.setAttribute("aria-hidden", "true");
					b.append(w);
				}
				if (w.dataset.k !== want) {
					w.dataset.k = want;
					w.innerHTML =
						(want.includes("p") ? `<span class="hw-plus">${PLUS}</span>` : "") +
						(want.includes("u") ? `<span class="hw-up">${UP}</span>` : "") +
						(want.includes("r") ? `<span class="hw-rib">${RIB}</span>` : "");
				}
			}
			const du0 = b.querySelector(":scope > i.du"),
				dv = du0 ? parseInt(du0.textContent.replace(/\D+/g, ""), 10) : NaN;
			const tip = [
				up ? `В сумке есть сильнее: ${best.name}` : "",
				Number.isFinite(dv) ? `Прочность ${dv}%` : "",
			]
				.filter(Boolean)
				.join(". ");

			const cur = b.getAttribute("title") || "",
				base =
					cur === (b.dataset.hwts || "\u0000") ? b.dataset.hwtb || "" : cur,
				nt = [base, tip].filter(Boolean).join(". ");
			if (cur !== nt) {
				if (nt) b.setAttribute("title", nt);
				else b.removeAttribute("title");
			}
			b.dataset.hwtb = base;
			b.dataset.hwts = nt;

			const du = b.querySelector(":scope > i.du");
			if (du) {
				const d = Math.max(
					0,
					Math.min(100, parseInt(du.textContent.replace(/\D+/g, ""), 10) || 0),
				);
				if (du.style.getPropertyValue("--hw-d") !== d + "%")
					du.style.setProperty("--hw-d", d + "%");
			}
		});

		tab.querySelectorAll(".bag .cy-sc > i.du").forEach((du) => {
			const d = Math.max(
				0,
				Math.min(100, parseInt(du.textContent.replace(/\D+/g, ""), 10) || 0),
			);
			if (du.style.getPropertyValue("--hw-d") !== d + "%")
				du.style.setProperty("--hw-d", d + "%");
		});
	}

	let accKey = "";

	function lcLay(tab, m) {
		const lc =
			tab.dataset.hwv === "look" && tab.querySelector(".lc[data-lcard]");
		if (!lc || !lc.querySelector(".lc-in")) {
			tab.classList.remove("hw-lcside");
			return;
		}

		const st0 = tab.querySelector(":scope > .hero-grid > .stage"),
			side = !m && innerHeight <= 760 && !!st0 && st0.clientWidth < 540;
		tab.classList.toggle("hw-lcside", side);
		const rows = [...lc.querySelectorAll(".lc-in .lc-row")].filter(
			(r) => getComputedStyle(r).display !== "none",
		);
		const half = Math.ceil(rows.length / 2);
		rows.forEach((r, k) => {
			const gr = side ? String(2 + (k < half ? k : k - half)) : "",
				gc = side ? (k < half ? "1" : "3") : "";
			if (r.style.gridRow !== gr) r.style.gridRow = gr;
			if (r.style.gridColumn !== gc) r.style.gridColumn = gc;
		});
		if (side)
			lc.querySelector(".lc-in").style.setProperty(
				"--hw-rows",
				String(Math.max(half, 1)),
			);
		else lc.querySelector(".lc-in").style.removeProperty("--hw-rows");

		if (!m)
			rows.forEach((r) => {
				const n = r.querySelector(".lc-n"),
					v = r.querySelector(".lc-v"),
					mid = r.querySelector(".lc-m");
				if (!n || !v) return;
				const k =
					n.textContent +
					"|" +
					v.textContent +
					"|" +
					r.clientWidth +
					"|" +
					gst();
				if (r.dataset.fitk === k) return;
				r.dataset.fitk = k;
				for (const [e, max, min, ok] of [
					[n, 15, 9, () => n.scrollWidth <= n.clientWidth + 1],
					[
						v,
						12.5,
						8.5,
						() =>
							v.scrollHeight <= v.clientHeight + 1 &&
							v.scrollWidth <= v.clientWidth + 1 &&
							(!mid || mid.scrollHeight <= mid.clientHeight + 1),
					],
				]) {
					let f = max;
					e.style.fontSize = f + "px";
					while (!ok() && f > min) {
						f -= 0.5;
						e.style.fontSize = f + "px";
					}
				}

				if (mid) {
					let f = parseFloat(n.style.fontSize) || 15;
					while (mid.scrollHeight > mid.clientHeight + 1 && f > 10) {
						f -= 0.5;
						n.style.fontSize = f + "px";
					}
				}
			});

		if (!m)
			lc.querySelectorAll(".lc-row").forEach((r) => {
				const t = [...r.querySelectorAll(".lc-n, .lc-v")]
					.map((e) => e.textContent.replace(/\s+/g, " ").trim())
					.join(": ");
				const mid = r.querySelector(".lc-m");
				if (mid && mid.title !== t) mid.title = t;
			});
	}
	function v14acc(tab, s, m, grid) {
		const look = tab.dataset.hwv === "look",
			lc = tab.querySelector(".lc[data-lcard]"),
			real = lc ? [...lc.querySelectorAll(".lc-acc [data-lcacc]")] : [];
		let box = tab.querySelector(".hw-acc");
		if (!look || !real.length) {
			if (box) box.remove();
			return;
		}
		const host = m ? lc : grid;
		if (!host) return;
		if (!box) {
			box = document.createElement("section");
			box.className = "panel hw-acc";
			box.setAttribute("aria-label", "Аксессуары");
			box.innerHTML =
				'<div class="hw-acch"><h2 class="h2">Аксессуары</h2><span class="hw-accn"></span></div><p class="note hw-accm" hidden></p><div class="hw-accg" role="group" aria-label="Аксессуары"></div>';
			box.addEventListener("click", (e) => {
				const t = e.target.closest("button[data-acc]");
				if (!t || t.disabled) return;
				const id = t.dataset.acc;

				const go = () => {
					const r = tab.querySelector(
						`.lc-acc [data-lcacc="${CSS.escape(id)}"]`,
					);
					if (r && !r.disabled) {
						r.click();
						[60, 400, 1200].forEach((ms) => setTimeout(later, ms));
					}
				};
				const w = DOTW.get(id);
				if (w) {
					t.setAttribute("aria-busy", "true");
					w.then(() => {
						t.removeAttribute("aria-busy");
						go();
					});
				} else go();
			});
		}
		if (box.parentElement !== host) host.append(box);

		const Hc = (heroNow() || {}).wardrobe,
			hcur = (Hc && Hc.cur) || {};
		const colOf = (id) => {
			const who2 = String(whoNow()).toLowerCase(),
				F = dotField(who2, id),
				p = DOTP.get(id + "|" + F);
			let v = dotVal(hcur, id, F || "accColor");
			if (p && F) {
				const o = dotOpts(heroNow(), who2, F)[p.k];
				if (o) v = o.v;
			}
			if (F !== "capeColor") return { accColor: v };
			let pv = hcur.capePat;
			const pp = DOTP.get(id + "|capePat");
			if (pp) {
				const o = dotOpts(heroNow(), who2, "capePat")[pp.k];
				if (o) pv = o.v;
			}
			return { capeColor: v, capePat: pv };
		};
		const colr = {
			c: hcur.capeColor,
			cp: hcur.capePat,
			a: hcur.accColor,
			m: hcur.accColors || {},
			p: [...DOTP],
		};
		const D = window.MDDoodle,
			who = whoNow(),
			key = s + "|" + who + "|" + real.map((r) => r.dataset.lcacc).join(",");
		const g = box.querySelector(".hw-accg");
		if (accKey !== key || g.children.length !== real.length) {
			accKey = key;
			const pic = (id) => {
				try {
					return D.jDoodle(
						D.jhash(who.toLowerCase()),
						"happy",
						false,
						{ who: who.toLowerCase() },
						{ acc: [id], ...colOf(id) },
					).replace(
						/<animate[^>]*\/>|<animate[^>]*>[\s\S]*?<\/animate[^>]*>/g,
						"",
					);
				} catch (e) {
					return "";
				}
			};
			g.innerHTML = real
				.map(
					(r) =>
						`<div class="hw-accc" role="listitem" data-acci="${r.dataset.lcacc.replace(/"/g, "&quot;")}"><button type="button" class="hw-acct" data-acc="${r.dataset.lcacc.replace(/"/g, "&quot;")}" aria-pressed="false"><span class="hw-acci" aria-hidden="true">${pic(r.dataset.lcacc)}</span><span class="hw-accl">${r.textContent.trim().replace(/[<>&]/g, "")}</span></button></div>`,
				)
				.join("");
		}

		void colr;
		g.querySelectorAll(".hw-accc").forEach((c) => {
			const id = c.dataset.acci,
				col = colOf(id),
				ck = JSON.stringify(col),
				im = c.querySelector(".hw-acci");
			if (im && c.dataset.ck !== ck) {
				const first = c.dataset.ck == null;
				c.dataset.ck = ck;
				if (!first) {
					try {
						im.innerHTML = D.jDoodle(
							D.jhash(who.toLowerCase()),
							"happy",
							false,
							{ who: who.toLowerCase() },
							{ acc: [id], ...col },
						).replace(
							/<animate[^>]*\/>|<animate[^>]*>[\s\S]*?<\/animate[^>]*>/g,
							"",
						);
					} catch (e) {}
				}
			}
		});
		const byId = new Map(real.map((r) => [r.dataset.lcacc, r]));
		g.querySelectorAll("button[data-acc]").forEach((t) => {
			const r = byId.get(t.dataset.acc);
			if (!r) return;
			const on = r.getAttribute("aria-pressed") || "false";
			if (t.getAttribute("aria-pressed") !== on)
				t.setAttribute("aria-pressed", on);
			if (t.disabled !== r.disabled) t.disabled = r.disabled;
			const ti = r.getAttribute("title") || "";
			if ((t.getAttribute("title") || "") !== ti) {
				if (ti) t.title = ti;
				else t.removeAttribute("title");
			}
		});
		v16dots(tab, box, lc, who);
		const k = lc.querySelector(".lc-acc .lc-k"),
			n = box.querySelector(".hw-accn");
		if (k && n.textContent !== k.textContent) n.textContent = k.textContent;
		const full = real.some(
				(r) => r.disabled && r.getAttribute("aria-pressed") !== "true",
			),
			msg = box.querySelector(".hw-accm"),
			mt = full ? (real.find((r) => r.title) || {}).title || "" : "";
		if (msg.hidden !== !mt) msg.hidden = !mt;
		if (mt && msg.textContent !== mt) msg.textContent = mt;
	}

	let FOPEN = false;
	function v14filt(tab, m) {
		const bag = tab.querySelector(":scope > .hero-grid > .bag");
		if (!bag) return;
		const head = bag.querySelector(":scope > .bag-h");
		let fb = head && head.querySelector(":scope > .hw-fbtn");
		if (!m) {
			if (fb) fb.remove();
			bag.classList.remove("hw-fopen");
			return;
		}
		if (!head) return;
		if (!fb) {
			fb = document.createElement("button");
			fb.type = "button";
			fb.className = "hw-fbtn";
			fb.setAttribute("aria-expanded", "false");
			fb.addEventListener("click", () => {
				FOPEN = !FOPEN;
				const b2 = tab.querySelector(":scope > .hero-grid > .bag");
				if (b2) b2.classList.toggle("hw-fopen", FOPEN);
				fb.setAttribute("aria-expanded", String(FOPEN));
			});
			head.append(fb);
		}
		const ch = bag.querySelector('.lgi-f .lgi-chip[aria-pressed="true"]'),
			sel = bag.querySelector(".clsf select"),
			cls =
				sel && sel.selectedIndex > 0
					? sel.options[sel.selectedIndex].textContent.trim()
					: "";
		const html = `<span class="hw-fl">Фильтр</span>${ch ? `<span class="hw-fc">${ch.innerHTML}</span>` : ""}${cls ? `<span class="hw-fk">${cls.replace(/[<>&]/g, "")}</span>` : ""}<i class="hw-fch" aria-hidden="true"></i>`;
		if (fb.dataset.h !== html) {
			fb.dataset.h = html;
			fb.innerHTML = html;
		}

		if (bag.classList.contains("hw-fopen") !== FOPEN)
			bag.classList.toggle("hw-fopen", FOPEN);
		const o = FOPEN;
		if (fb.getAttribute("aria-expanded") !== String(o))
			fb.setAttribute("aria-expanded", String(o));
	}

	function v14(tab, s, m, grid) {
		tab
			.querySelectorAll("dl.stats:not(.xstats) .stat[data-k]")
			.forEach((st) => {
				const k = st.dataset.k;
				if (!["hp", "atk", "mag", "def"].includes(k)) return;
				let i = st.querySelector(":scope > .hw-sti");
				if (!i) {
					i = document.createElement("span");
					i.className = "hw-sti";
					st.append(i);
				}
				if (i.dataset.s !== s) {
					i.dataset.s = s;
					i.innerHTML = stiSvg(s, k);
				}
			});

		for (const f of tab.querySelectorAll(".lgi-dollx .lgi-ped, .lc-fig")) {
			let g = f.querySelector(":scope > .hw-glow");
			if (!g) {
				g = document.createElement("span");
				g.className = "hw-glow";
				g.setAttribute("aria-hidden", "true");
				f.append(g);
			}
			if (g.dataset.s !== s) {
				g.dataset.s = s;
				g.innerHTML = glowSvg(s);
			}
		}
		lcLay(tab, m);
		v14slots(tab);
		v14acc(tab, s, m, grid);
		v14filt(tab, m);
	}

	const TPL_N = 3;
	const tpEsc = (x) =>
		String(x == null ? "" : x).replace(
			/[&<>"]/g,
			(c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
		);
	const tpNorm = (o) =>
		JSON.stringify(
			Object.keys(o || {})
				.sort()
				.filter((k) => o[k] != null && !(Array.isArray(o[k]) && !o[k].length))
				.map((k) => [k, Array.isArray(o[k]) ? o[k].slice().sort() : o[k]]),
		);

	const tpApi = (p, body) =>
		Promise.resolve()
			.then(() =>
				CTX.api ? CTX.api(p, body) : { ok: false, error: "нет связи с сайтом" },
			)
			.catch(() => ({ ok: false, error: "нет связи с сайтом" }))
			.then((r) => {
				if (r && r.ok && r.hero && CTX.apply) {
					try {
						CTX.apply(r);
					} catch (e) {
						console.warn("[окно «Персонаж»]", e);
					}
				}
				return r || { ok: false, error: "нет связи с сайтом" };
			});

	const TP_PEN =
		'<svg viewBox="0 0 128 128" aria-hidden="true"><path d="M86 18l24 24-60 60-30 6 6-30z" fill="var(--gw-acc)" stroke="var(--gw-line)" stroke-width="4.5" stroke-linejoin="round"/><path d="M74 30l24 24" stroke="var(--gw-line)" stroke-width="4.5"/><path d="M26 78l24 24-30 6z" fill="var(--gw-card)" stroke="var(--gw-line)" stroke-width="4.5" stroke-linejoin="round"/><path d="M84 28l8-8" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".6"/></svg>';
	const TP_PEN_PX =
		'<svg viewBox="0 0 128 128" aria-hidden="true" shape-rendering="crispEdges"><path d="M88 16h8v8h8v8h8v8h8v8h-8v8h-8v8h-8v8h-8v8h-8v8h-8v8h-8v8H40v8H16V88h8V72h8v-8h8v-8h8v-8h8v-8h8v-8h8v-8h8v-8h8z" fill="var(--gw-line)"/><path d="M88 24h8v8h8v8h8v8h-8v8h-8v8h-8v8h-8v8h-8v8h-8v8H48v-8H40v-8h-8v-8h8v-8h8v-8h8v-8h8v-8h8v-8h8v-8h8z" fill="var(--gw-acc)"/><path d="M24 96h8v8h8v8H24z" fill="var(--gw-card)"/></svg>';

	const TPV = 3,
		TPS = {};
	function tplRow(cfg, tab) {
		const D0 = cfg.data();
		const host = cfg.host();
		if (!D0 || !host) return null;
		const S =
			TPS[cfg.id] ||
			(TPS[cfg.id] = {
				sel: -1,
				key: "",
				busy: false,
				msg: "",
				edit: -1,
				start: 0,
			});
		let box = tab.querySelector(`.hw-tpl[data-tk="${cfg.id}"]`);
		if (!box) {
			box = document.createElement("div");
			box.className = "hw-tpl";
			box.dataset.tk = cfg.id;
			S.key = "";
			box.innerHTML = `<div class="hw-tpr"><button type="button" class="hw-tpnav" data-nav="-1" aria-label="Предыдущие шаблоны" hidden>‹</button><div class="hw-tpg" role="group" aria-label="${cfg.aria}" data-on="0"></div><button type="button" class="hw-tpnav" data-nav="1" aria-label="Следующие шаблоны" hidden>›</button><button type="button" class="hw-tped" data-tped="0"></button><button type="button" class="hw-tpsv"></button></div><p class="note hw-tpm" role="status" aria-live="polite" hidden></p>`;
			box.addEventListener("click", (e) => {
				if (e.target.closest(".hw-tpin")) return;
				const nv = e.target.closest("button[data-nav]");
				if (nv && !nv.disabled) {
					S.start = Math.max(0, S.start + TPV * +nv.dataset.nav);
					S.key = "";
					S.paint();
					return;
				}
				const pen = e.target.closest("button[data-tped]");
				if (pen && !pen.disabled) {
					S.edit = +pen.dataset.tped;
					S.key = "";
					S.paint();
					const f = box.querySelector(".hw-tpin");
					if (f) {
						f.focus();
						f.select();
					}
					return;
				}
				const t = e.target.closest("button[data-tpi]");
				if (t && !t.disabled) {
					S.pick(+t.dataset.tpi);
					return;
				}
				if (e.target.closest(".hw-tpsv")) void S.save(null);
			});
			box.addEventListener("keydown", (e) => {
				const f = e.target.closest(".hw-tpin");
				if (!f) return;
				if (e.key === "Enter") {
					e.preventDefault();
					void S.save(f.value);
				} else if (e.key === "Escape") {
					e.preventDefault();
					e.stopPropagation();
					S.edit = -1;
					S.key = "";
					S.paint();
				}
			});
			box.addEventListener("focusout", (e) => {
				const f = e.target.closest(".hw-tpin");
				if (f && S.edit >= 0 && !S.busy)
					setTimeout(() => {
						if (S.edit >= 0 && document.activeElement !== f)
							void S.save(f.value);
					}, 0);
			});
		}
		if (box.parentElement !== host) host.append(box);
		const max = Math.max(0, Math.min(10, +D0.max || 0)),
			list = D0.list || [];
		const pick = (i) => {
			S.sel = i;
			S.snap = true;
			S.msg = "";
			S.edit = -1;
			const x = list[i];
			S.paint();
			if (x && !cfg.on(x)) {
				void Promise.resolve(cfg.load(i)).then((r) => {
					if (r && r.ok === false) {
						S.msg = r.error || "Не получилось";
						S.key = "";
						S.paint();
					}
				});
				[80, 400, 1200, 2500].forEach((ms) => setTimeout(later, ms));
			}
		};
		async function save(nameIn) {
			const D = cfg.data(),
				L = (D && D.list) || [],
				i = S.edit >= 0 ? S.edit : S.sel,
				x = L[i];
			if (S.busy || i < 0) return;
			const name =
				nameIn == null
					? ""
					: String(nameIn)
							.replace(/[<>\u0000-\u001f]/g, "")
							.trim()
							.slice(0, 24);
			if (nameIn != null && (!name || (x && name === x.n))) {
				S.edit = -1;
				S.key = "";
				S.paint();
				return;
			}
			S.busy = true;
			S.paint();
			const r =
				nameIn != null && cfg.rename && x
					? await cfg.rename(i, name)
					: await cfg.save(i < L.length ? i : -1, name);
			S.busy = false;
			S.edit = -1;
			S.msg = !r || !r.ok ? (r && r.error) || "Не получилось" : r.note || "";
			const D2 = cfg.data();
			if (D2 && S.sel >= D2.list.length + 1)
				S.sel = Math.max(0, D2.list.length - 1);
			S.key = "";
			S.paint();
			[400, 1200].forEach((ms) => setTimeout(later, ms));
		}
		function paint() {
			const D = cfg.data() || D0,
				L = D.list || [],
				N = Math.max(0, Math.min(10, +D.max || 0)),
				i = S.sel,
				x = L[i];
			if (S.snap && i >= 0 && (i < S.start || i >= S.start + TPV))
				S.start = Math.floor(i / TPV) * TPV;
			S.snap = false;
			S.start = Math.max(0, Math.min(S.start, Math.max(0, N - TPV)));
			const pen = gst() === "ugabugi" ? TP_PEN_PX : TP_PEN,
				w = Math.min(TPV, N),
				word = cfg.word;
			const g = box.querySelector(".hw-tpg");
			g.style.setProperty("--n", String(w));
			g.innerHTML = Array.from({ length: w }, (_, j) => {
				const k = S.start + j,
					y = L[k],
					on = !!y && cfg.on(y),
					sel = k === i;
				const nm = y ? tpEsc(y.n || word + " " + (k + 1)) : "Пусто";
				if (S.edit === k && y)
					return `<span class="hw-tpc hw-tpc-ed"><input class="hw-tpin" type="text" maxlength="24" value="${nm}" aria-label="Новое название шаблона" autocomplete="off" spellcheck="false"${S.busy ? " disabled" : ""}></span>`;
				return `<span class="hw-tpc"><button type="button" class="hw-tpt${y ? "" : " hw-tpt0"}${on ? " hw-tpt-on" : ""}" data-tpi="${k}" aria-pressed="${sel}"${!y && k > L.length ? " disabled" : ""} title="${y ? (on ? nm + " - надет" : "Надеть «" + nm + "»") : "Пустой шаблон " + (k + 1) + " - сохрани сюда то, что надето"}"><span class="hw-tptn">${nm}</span></button></span>`;
			}).join("");
			const vis = i >= S.start && i < S.start + w;
			g.dataset.on = vis ? String(i - S.start) : "x";

			const [pv, nx] = box.querySelectorAll(".hw-tpnav");
			pv.hidden = nx.hidden = N <= TPV;
			pv.disabled = S.start <= 0;
			nx.disabled = S.start + TPV >= N;
			box.classList.toggle("hw-tpmore", N > TPV);
			box.dataset.page =
				N > TPV ? `${S.start + 1}-${Math.min(N, S.start + TPV)} из ${N}` : "";
			if (N > TPV) {
				const pg = ` (сейчас ${S.start + 1}-${Math.min(N, S.start + TPV)} из ${N})`;
				pv.title = "Предыдущие шаблоны" + pg;
				nx.title = "Следующие шаблоны" + pg;
			}

			const pb = box.querySelector(".hw-tped"),
				pOn = !!x && (cfg.rename || cfg.on(x)) && !S.busy && S.edit < 0,
				pnm = x ? tpEsc(x.n || word + " " + (i + 1)) : "";
			pb.dataset.tped = String(i);
			pb.disabled = !pOn;
			if (pb.dataset.pen !== gst()) {
				pb.dataset.pen = gst();
				pb.innerHTML = pen;
			}
			pb.title = !x
				? "Сначала сохрани шаблон"
				: pOn
					? "Переименовать «" + pnm + "»"
					: S.edit >= 0
						? "Введи название и нажми Enter"
						: "Переименовать можно надетый шаблон";
			pb.setAttribute("aria-label", pb.title);
			const same = !!x && cfg.on(x),
				bt = box.querySelector(".hw-tpsv"),
				msg = box.querySelector(".hw-tpm");
			bt.textContent = S.busy
				? "..."
				: !x
					? "Сохранить"
					: same
						? "Сохранён"
						: "Перезаписать";
			bt.disabled = S.busy || i < 0 || same;
			bt.title = !x
				? "Сохранить сюда то, что надето сейчас"
				: same
					? "Этот шаблон сейчас надет"
					: `Сохранить сюда то, что надето сейчас (старый ${word.toLowerCase()} шаблона заменится)`;
			if (msg.textContent !== S.msg) msg.textContent = S.msg;
			msg.hidden = !S.msg;
		}
		S.pick = pick;
		S.save = save;
		S.paint = paint;
		const key = [
			list.map((y) => (cfg.on(y) ? 1 : 0)).join(""),
			JSON.stringify(list),
			max,
			gst(),
		].join("|");
		if (S.sel < 0 || S.sel >= max || S.sel > list.length) {
			const k = list.findIndex((y, j) => j < max && cfg.on(y));
			S.sel = k >= 0 ? k : Math.min(list.length, Math.max(0, max - 1));
			S.snap = true;
			S.key = "";
		}
		if (key !== S.key && S.edit < 0) {
			S.key = key;
			paint();
		}
		return box;
	}
	function v15tpl(tab, m) {
		const lc = tab.querySelector(".lc[data-lcard]"),
			sec = lc && lc.querySelector(".lc-sl"),
			H = heroNow(),
			W = H && H.wardrobe,
			sl = W && W.sl;
		if (!sec || !sl || !Array.isArray(sl.list)) return;
		sec.classList.add("hw-tpon");
		const cur = tpNorm((W && W.cur) || H.look);
		const box = tplRow(
			{
				id: "look",
				aria: "Шаблоны облика",
				word: "Облик",
				host: () => lc,
				data: () => (heroNow().wardrobe || {}).sl,
				on: (x) =>
					tpNorm(x.look) ===
					tpNorm((heroNow().wardrobe || {}).cur || heroNow().look),
				load: (i) => {
					if (heroNow().busy)
						return { ok: false, error: "Идёт бой - облик сменится после боя" };
					const b = document.createElement("button");
					b.type = "button";
					b.hidden = true;
					b.dataset.lsl = "load";
					b.dataset.i = String(i);
					sec.append(b);
					b.click();
					setTimeout(() => b.remove(), 6000);
					return { ok: true };
				},
				save: async (i, name) => {
					const r = await tpApi("/api/lookSlot", {
						a: "save",
						i,
						...(name ? { name } : {}),
					});
					const W2 = heroNow().wardrobe;
					if (r && r.ok && r.slots && W2) W2.sl = r.slots;
					return r;
				},
			},
			tab,
		);
		if (!box) return;
		void cur;
		const side = tab.classList.contains("hw-lcside");

		if (!m) {
			const bot = side
					? lc.querySelector(".lc-in")
					: lc.querySelector(".lc-bot") || lc.querySelector(".lc-in"),
				bs = bot
					? [...bot.querySelectorAll("[data-lcs]")].filter(
							(e) => e.offsetParent,
						)
					: [];
			if (bs.length) {
				const L = Math.min(...bs.map((e) => e.getBoundingClientRect().left)),
					R = Math.max(...bs.map((e) => e.getBoundingClientRect().right)),
					w = Math.round(R - L) + "px";
				if (box.style.maxWidth !== w) box.style.maxWidth = w;
			}
		} else if (box.style.maxWidth) box.style.maxWidth = "";

		const acc = !m && tab.querySelector(".hw-acc");
		tab.classList.toggle("hw-tpside", !!acc);
		if (acc) {
			const tip = lc.querySelector(".lk-tip");
			let t2 = acc.querySelector(":scope > .hw-tptip");
			if (tip) {
				if (!t2) {
					t2 = document.createElement("p");
					t2.className = "note hw-tptip";
					acc.append(t2);
				}
				if (t2.textContent !== tip.textContent)
					t2.textContent = tip.textContent;
			}
		}
	}

	const DOT_PROBE = new Map();
	const dotField = (who, id) => {
		const k = who + "|" + id;
		if (DOT_PROBE.has(k)) return DOT_PROBE.get(k);
		const D = window.MDDoodle;
		let f = "";
		try {
			const seed = D.jhash(who),
				draw = (lk) =>
					String(
						D.jDoodle(
							seed,
							"happy",
							false,
							{ alive: true, noAura: true, who },
							lk,
						),
					).replace(/(id="|url\(#|href="#)([A-Za-z_-]+)\d+/g, "$1$2");
			for (const F of ["capeColor", "accColor"]) {
				const b = { hat: "none", acc: [id] };
				if (draw({ ...b, [F]: "#010203" }) !== draw({ ...b, [F]: "#fdfcfb" })) {
					f = F;
					break;
				}
			}
		} catch (e) {
			f = "";
		}
		if (DOT_PROBE.size > 200) DOT_PROBE.clear();
		DOT_PROBE.set(k, f);
		return f;
	};
	const dotSw = (v) =>
		/^#?[0-9a-f]{3,8}$/i.test(String(v))
			? String(v).replace(/^#?/, "#")
			: /^hsl\([\d\s.,%]+\)$/i.test(String(v))
				? String(v)
				: "#888";
	const dotSame = (a, b) =>
		a != null &&
		b != null &&
		String(a).replace(/^#/, "").toLowerCase() ===
			String(b).replace(/^#/, "").toLowerCase();
	const dotOpts = (H, who, F) => {
		const D = window.MDDoodle,
			W = H.wardrobe || {},
			own = (W.own && W.own[F]) || [];
		if (F === "capePat") {
			let pp = [];
			try {
				pp =
					W.pl &&
					Array.isArray(W.pl.p) &&
					window.LGPremium &&
					+window.LGPremium.tier() >= 2
						? W.pl.p
						: [];
			} catch (e) {
				pp = [];
			}
			return pp.length
				? [{ v: null, name: "Без узора", pat: "" }].concat(
						pp.map(([pid, pn]) => ({ v: pid, name: pn + " ★", pat: pid })),
					)
				: [];
		}
		let def = null;
		try {
			def = D.defaultsFor ? (D.defaultsFor(who) || {})[F] : null;
		} catch (e) {
			def = null;
		}
		const same = (a, b) => {
			try {
				return D.sameLook(F, a, b);
			} catch (e) {
				return dotSame(a, b);
			}
		};
		const nameOf = (v) => {
			try {
				const L = (D.CATALOG && D.CATALOG.colors) || [],
					h = String(v).replace(/^#?/, "#").toLowerCase();
				const f = L.find(
					([id]) =>
						String(id).toLowerCase() === h ||
						String(id).toLowerCase() === String(v).toLowerCase(),
				);
				return f ? f[1] : String(v);
			} catch (e) {
				return String(v);
			}
		};
		const list = def ? own.filter((v) => !same(v, def.v)) : own;
		let pm = [];
		try {
			pm =
				W.pl &&
				Array.isArray(W.pl.c) &&
				window.LGPremium &&
				+window.LGPremium.tier() >= 1
					? W.pl.c
					: [];
		} catch (e) {
			pm = [];
		}
		return [
			{
				v: null,
				name: def ? def.name : "Как по нику",
				sw: def ? def.v : null,
				nick: true,
			},
		]
			.concat(list.map((v) => ({ v, name: nameOf(v), sw: v })))
			.concat(
				pm
					.filter(([hx]) => !list.some((v) => same(v, hx)))
					.map(([hx, nm]) => ({ v: hx, name: nm + " ★", sw: hx })),
			);
	};

	const dotVal = (cur, id, F) =>
		F === "capePat"
			? cur.capePat
			: F === "capeColor"
				? cur.capeColor
				: cur.accColors && Object.hasOwn(cur.accColors, id)
					? cur.accColors[id]
					: cur.accColor;
	const DOTP = new Map();

	const PAT_ICO = {
		none: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 15L15 5" stroke="var(--gw-line)" stroke-width="2.2" stroke-linecap="round"/></svg>',
		hem: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M2 13h16v5H2z" fill="#ffd23f" stroke="var(--gw-line)" stroke-width="1.4"/></svg>',
		stars:
			'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 3.5l1.9 4 4.4.5-3.3 3 .9 4.4L10 13.2 6.1 15.4l.9-4.4-3.3-3 4.4-.5z" fill="#ffe9a8" stroke="var(--gw-line)" stroke-width="1.2" stroke-linejoin="round"/></svg>',
		dots: '<svg viewBox="0 0 20 20" aria-hidden="true" fill="#fff" stroke="var(--gw-line)" stroke-width="1.1"><circle cx="6" cy="7" r="2.2"/><circle cx="14" cy="7" r="2.2"/><circle cx="10" cy="13.5" r="2.2"/></svg>',
		runes:
			'<svg viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="#bfe3ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4v12M6 8l5-3M6 12l5 3M14 4v12"/></svg>',
	};
	const DOTW = new Map();
	let dotKey = "";
	function v16dots(tab, box, lc, who0) {
		const H = heroNow();
		if (!H || !H.wardrobe) return;
		const who = String(who0 || "").toLowerCase(),
			W = H.wardrobe,
			cur = W.cur || {};
		if (!box.dataset.dots) {
			box.dataset.dots = "1";
			box.addEventListener("click", (e) => {
				const d = e.target.closest("button[data-dotk]");
				if (!d || d.disabled) return;
				e.stopPropagation();
				void dotPick(
					tab,
					d.closest(".hw-accc").dataset.acci,
					d.dataset.dotf,
					+d.dataset.dotk,
					who,
				);
			});
		}
		tab.classList.add("hw-dotson");
		const now = Date.now();
		DOTP.forEach((x, k0) => {
			if (now - x.at > 6000) DOTP.delete(k0);
		});
		const st = gst(),
			key = [
				st,
				who,
				JSON.stringify(W.own && [W.own.capeColor, W.own.accColor]),
				cur.capeColor,
				cur.capePat,
				cur.accColor,
				JSON.stringify(cur.accColors || {}),
				JSON.stringify([...DOTP]),
				box.querySelectorAll(".hw-accc").length,
			].join("|");
		if (key === dotKey && box.querySelector(".hw-accc[data-dotf]")) return;
		dotKey = key;
		box.querySelectorAll(".hw-accc").forEach((c) => {
			const id = c.dataset.acci,
				F = dotField(who, id),
				t = c.querySelector(".hw-acct");
			let strip = c.querySelector(":scope > .hw-accd");
			const opts = F ? dotOpts(H, who, F) : [];
			if (!F || opts.length < 2) {
				if (strip) strip.remove();
				c.removeAttribute("data-dotf");
				if (t) t.style.paddingBottom = "";
				return;
			}
			c.dataset.dotf = F;
			const kOf = (F2, o2) => {
				const v = dotVal(cur, id, F2),
					pend = DOTP.get(id + "|" + F2);
				let k =
					v == null
						? 0
						: o2.findIndex(
								(o, j) =>
									j > 0 && (F2 === "capePat" ? o.v === v : dotSame(o.v, v)),
							);
				if (pend) {
					if (pend.k === k) DOTP.delete(id + "|" + F2);
					else k = pend.k;
				}
				return k;
			};
			const k = kOf(F, opts),
				popts = F === "capeColor" ? dotOpts(H, who, "capePat") : [],
				pk = popts.length ? kOf("capePat", popts) : -1;
			const nm = ((t && t.querySelector(".hw-accl")) || {}).textContent || "",
				lbl = F === "capeColor" ? "Цвет плаща" : "Цвет";
			const html = opts
				.map(
					(o, j) =>
						`<button type="button" class="hw-dot${o.nick ? " hw-dot-n" : ""}" data-dotf="${F}" data-dotk="${j}" aria-pressed="${j === k}" style="--c:${dotSw(o.sw)}" title="${tpEsc(lbl + ": " + o.name + (o.nick ? " (по нику)" : ""))}" aria-label="${tpEsc(nm + " - " + o.name + (o.nick ? ", по нику" : ""))}"></button>`,
				)
				.join("");

			const csw = dotSw((opts[k] || opts[0]).sw);
			const phtml = popts.length
				? '<i class="hw-accbr" aria-hidden="true"></i>' +
					popts
						.map(
							(o, j) =>
								`<button type="button" class="hw-dot hw-dot-p" data-dotf="capePat" data-dotk="${j}" aria-pressed="${j === pk}" style="--c:${csw}" title="${tpEsc("Узор плаща: " + o.name)}" aria-label="${tpEsc(nm + " - узор: " + o.name)}">${PAT_ICO[o.pat || "none"] || ""}</button>`,
						)
						.join("")
				: "";
			if (!strip) {
				strip = document.createElement("div");
				strip.className = "hw-accd";
				strip.setAttribute("role", "group");
				c.append(strip);
			}
			strip.setAttribute("aria-label", lbl + ": " + nm);
			if (strip.dataset.h !== html + phtml) {
				strip.dataset.h = html + phtml;
				strip.innerHTML = html + phtml;
			}
			if (t) {
				const pb = strip.offsetHeight + 12 + "px";
				if (t.style.paddingBottom !== pb) t.style.paddingBottom = pb;
			}
		});
	}
	async function dotPick(tab, id, F, k, who) {
		const H = heroNow();
		if (!H || !H.wardrobe || H.busy) return;
		const o = dotOpts(H, who, F)[k];
		if (!o) return;
		DOTP.set(id + "|" + F, { k, at: Date.now() });
		dotKey = "";
		later();
		let done;
		const wait = new Promise((ok) => {
			done = ok;
		});
		DOTW.set(id, wait);
		const r = await tpApi("/api/wear", {
			field: F,
			value: o.v,
			...(F === "accColor" ? { acc: id } : {}),
		});

		setTimeout(
			() => {
				done();
				if (DOTW.get(id) === wait) DOTW.delete(id);
			},
			r && r.ok ? 450 : 0,
		);
		if (!r || !r.ok) {
			DOTP.delete(id + "|" + F);
			const msg = tab.querySelector(".hw-accm");
			if (msg) {
				msg.hidden = false;
				msg.textContent = (r && r.error) || "Цвет не сменился";
			}
		}
		dotKey = "";
		[60, 400, 1200].forEach((ms) => setTimeout(later, ms));
	}
	new MutationObserver((ms) => {
		if (!hwOn()) return;
		for (const mu of ms)
			for (const n of mu.addedNodes)
				if (n.nodeType === 1 && n.classList.contains("ctxm"))
					n.querySelectorAll('button[role="menuitem"]').forEach((b) => {
						if (/^(Заточка|Починить)(\s|$)/.test(b.textContent.trim()))
							b.remove();
					});
	}).observe(document.body, { childList: true });
	const ST17 = {
		fold: (() => {
			try {
				return localStorage.getItem("hwBagFold") === "1";
			} catch (e) {
				return false;
			}
		})(),
	};

	const DD_VARS = [
		"--gw-card",
		"--gw-line",
		"--gw-ink",
		"--gw-mute",
		"--gw-sel",
		"--gw-on-sel",
		"--gw-hi",
		"--gw-on-hi",
		"--gw-chip",
		"--gw-focus",
		"--gw-rc",
		"--gw-rt",
		"--gw-bt",
		"--gw-btw",
		"--gw-tx",
		"--gw-sep",
		"--gw-acc",
		"--gw-on-acc",
	];
	let ddOpen = null;
	const ddClose = (focusBtn) => {
		if (!ddOpen) return;
		const { pop, btn } = ddOpen;
		ddOpen = null;
		pop.remove();
		btn.setAttribute("aria-expanded", "false");
		document.removeEventListener("pointerdown", ddOut, true);
		window.removeEventListener("resize", ddClose0);
		document.removeEventListener("scroll", ddClose0, true);
		if (focusBtn) btn.focus();
	};
	const ddClose0 = () => ddClose(false);
	const ddOut = (e) => {
		if (
			ddOpen &&
			!ddOpen.pop.contains(e.target) &&
			!ddOpen.btn.contains(e.target)
		)
			ddClose(false);
	};
	function ddPick(sel, v) {
		if (sel.value !== v) {
			sel.value = v;
			sel.dispatchEvent(new Event("change", { bubbles: true }));
		} else if (sel.dataset.bsort) {
			sel.dispatchEvent(new Event("change", { bubbles: true }));
		}
	}
	function ddShow(btn, sel, skip) {
		ddClose(false);
		const tab = btn.closest(".hw"),
			cs = getComputedStyle(tab),
			pop = document.createElement("div");
		pop.className = "hw-ddp";
		pop.setAttribute("role", "listbox");
		pop.id = "hw-ddp";
		pop.dataset.gst = tab.dataset.gst || "";
		pop.setAttribute("aria-label", btn.getAttribute("aria-label") || "");
		DD_VARS.forEach((k) => pop.style.setProperty(k, cs.getPropertyValue(k)));
		const opts = [...sel.options].filter((o) => !skip.includes(o.value));
		pop.innerHTML = opts
			.map(
				(o, i) =>
					`<div class="hw-ddo" role="option" id="hw-ddo${i}" data-v="${tpEsc(o.value)}" aria-selected="${!sel.dataset.bsort && o.value === sel.value}" tabindex="-1">${tpEsc(o.textContent)}</div>`,
			)
			.join("");
		document.body.append(pop);
		const r = btn.getBoundingClientRect(),
			W = innerWidth,
			H = innerHeight,
			pw = Math.max(r.width, pop.offsetWidth),
			ph = pop.offsetHeight;
		pop.style.minWidth = r.width + "px";
		pop.style.left = Math.max(8, Math.min(r.left, W - pw - 8)) + "px";
		pop.style.top =
			(r.bottom + 6 + ph < H - 8 ? r.bottom + 6 : Math.max(8, r.top - 6 - ph)) +
			"px";
		ddOpen = { pop, btn, sel };
		btn.setAttribute("aria-expanded", "true");
		btn.setAttribute("aria-controls", "hw-ddp");
		const items = [...pop.querySelectorAll(".hw-ddo")];
		let k = Math.max(
			0,
			items.findIndex((x) => x.getAttribute("aria-selected") === "true"),
		);
		const go = (j) => {
			k = (j + items.length) % items.length;
			items.forEach((x, n) => x.classList.toggle("hw-ddf", n === k));
			items[k].focus();
		};
		go(k);
		pop.addEventListener("click", (e) => {
			const o = e.target.closest(".hw-ddo");
			if (!o) return;
			ddClose(true);
			ddPick(sel, o.dataset.v);
		});
		pop.addEventListener("keydown", (e) => {
			if (e.key === "ArrowDown") {
				e.preventDefault();
				go(k + 1);
			} else if (e.key === "ArrowUp") {
				e.preventDefault();
				go(k - 1);
			} else if (e.key === "Home") {
				e.preventDefault();
				go(0);
			} else if (e.key === "End") {
				e.preventDefault();
				go(items.length - 1);
			} else if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				const v = items[k].dataset.v;
				ddClose(true);
				ddPick(sel, v);
			} else if (e.key === "Escape") {
				e.preventDefault();
				e.stopPropagation();
				ddClose(true);
			} else if (e.key === "Tab") ddClose(false);
		});
		setTimeout(() => {
			document.addEventListener("pointerdown", ddOut, true);
			window.addEventListener("resize", ddClose0);
			document.addEventListener("scroll", ddClose0, true);
		}, 0);
	}
	function ddFor(sel, o) {
		const host = o.host || sel.parentElement;
		if (!host) return;
		const getSel = () =>
			o.host ? o.get() : host.querySelector(":scope > select");
		let btn = host.querySelector(`:scope > .hw-dd[data-dd="${o.key}"]`);

		document.querySelectorAll(`.hw .hw-dd[data-dd="${o.key}"]`).forEach((x) => {
			if (x.parentElement !== host) x.remove();
		});
		if (!btn) {
			btn = document.createElement("button");
			btn.type = "button";
			btn.className = "hw-dd";
			btn.setAttribute("aria-haspopup", "listbox");
			btn.setAttribute("aria-expanded", "false");
			btn.dataset.dd = o.key;
			btn.innerHTML =
				'<span class="hw-ddl"></span><i class="hw-ddc" aria-hidden="true"></i>';
			host.append(btn);
			btn.addEventListener("click", () => {
				const s2 = getSel();
				if (!s2) return;
				if (ddOpen && ddOpen.btn === btn) ddClose(true);
				else ddShow(btn, s2, o.skip || []);
			});
			btn.addEventListener("keydown", (e) => {
				if (e.key === "ArrowDown" || e.key === "ArrowUp") {
					e.preventDefault();
					const s2 = getSel();
					if (s2) ddShow(btn, s2, o.skip || []);
				}
			});
		}
		sel.classList.add("hw-ddsel");
		sel.tabIndex = -1;
		sel.setAttribute("aria-hidden", "true");
		const l = o.label(sel);
		const lb = btn.querySelector(".hw-ddl");
		if (lb.textContent !== l) lb.textContent = l;
		if (btn.getAttribute("aria-label") !== o.aria)
			btn.setAttribute("aria-label", o.aria);
		btn.classList.toggle("hw-dd-on", !!o.on);
	}
	function v17(tab, m) {
		const repl = tab.querySelector(":scope > .hero-grid > .vitals .repl"),
			stage = tab.querySelector(":scope > .hero-grid > .stage");
		let rp = stage && stage.querySelector(":scope > .hw-repl");
		if (repl && stage && tab.dataset.hwv !== "look") {
			if (!rp) {
				rp = document.createElement("div");
				rp.className = "repl hw-repl";
				rp.setAttribute("role", "note");
				stage.append(rp);
			}
			if (rp.innerHTML !== repl.innerHTML) rp.innerHTML = repl.innerHTML;
			const tt = repl.textContent.replace(/\s+/g, " ").trim();
			if (rp.title !== tt) rp.title = tt;
			rp.classList.toggle("br", repl.classList.contains("br"));
			tab.classList.add("hw-replmv");
		} else {
			if (rp) rp.remove();
			tab.classList.toggle("hw-replmv", !!repl && tab.dataset.hwv === "look");
		}

		const kit = stage && stage.querySelector(":scope > .kit"),
			coins = stage && stage.querySelector(".plate-coins"),
			kcOn =
				!m &&
				innerHeight <= 760 &&
				!!kit &&
				!!coins &&
				tab.dataset.hwv !== "look";
		let kc = kit && kit.querySelector(":scope > .hw-kc");
		if (kcOn) {
			if (!kc) {
				kc = document.createElement("span");
				kc.className = "hw-kc";
				kit.append(kc);
			}
			if (kc.innerHTML !== coins.innerHTML) kc.innerHTML = coins.innerHTML;
		} else if (kc) kc.remove();
		tab.classList.toggle("hw-kcin", kcOn);

		tab
			.querySelectorAll(".clsf > select[data-cls]")
			.forEach((sel) =>
				ddFor(sel, {
					key: "cls",
					aria: "Вещи для какого класса",
					label: (s0) =>
						(s0.options[s0.selectedIndex] || {}).textContent || "Все классы",
					on: s0v(sel) !== "all",
				}),
			);

		const clsf = tab.querySelector(".bag > .clsf"),
			bsel = tab.querySelector(".bag select[data-bsort]");
		if (bsel)
			ddFor(bsel, {
				key: "sort",
				aria: "Сортировать сумку",
				label: () => "Сортировать",
				skip: ["new"],
				...(!m && clsf
					? {
							host: clsf,
							get: () => tab.querySelector(".bag select[data-bsort]"),
						}
					: {}),
			});
		tab.classList.toggle("hw-bagrow", !m && !!clsf);

		tab.querySelectorAll(".bag .hw-bsort").forEach((x) => x.remove());

		const bag = tab.querySelector(":scope > .hero-grid > .bag"),
			head = bag && bag.querySelector(":scope > .bag-h");
		if (head) {
			let fb = head.querySelector(":scope > .hw-bfold");
			if (!fb) {
				fb = document.createElement("button");
				fb.type = "button";
				fb.className = "hw-bfold";
				head.append(fb);
				fb.addEventListener("click", () => {
					ST17.fold = !ST17.fold;
					try {
						localStorage.setItem("hwBagFold", ST17.fold ? "1" : "0");
					} catch (e) {}
					v17(tab, m);
				});
			}
			const t = ST17.fold ? "Развернуть сумку" : "Свернуть сумку";
			if (fb.getAttribute("aria-expanded") !== String(!ST17.fold))
				fb.setAttribute("aria-expanded", String(!ST17.fold));
			if (fb.title !== t) {
				fb.title = t;
				fb.setAttribute("aria-label", t);
			}
			tab.classList.toggle("hw-bagfold", ST17.fold);
			const ob = bag.querySelector(".lgi-ob .lgi-foldbt");
			if (ob && !ob.title.includes("рудную"))
				ob.title =
					(ob.getAttribute("aria-expanded") === "true"
						? "Свернуть"
						: "Развернуть") + " рудную сумку";
		}
	}
	const s0v = (sel) => sel.value;

	{
		const fix = (tip) => {
			const cmp = tip.querySelector(":scope :is(.t-cmp, .d-cmp)"),
				ul = tip.querySelector(":scope :is(.t-st, .d-st)");
			if (!cmp || !ul || ul.querySelector(".hw-cmph")) return;
			const name = (cmp.querySelector("b") || cmp).textContent
					.replace(/^Сравнение с надетым:\s*/, "")
					.trim(),
				ems = [...ul.querySelectorAll(":scope > li > em")];
			const up = ems.filter((e) => e.classList.contains("up")).length,
				dn = ems.filter((e) => e.classList.contains("dn")).length;
			ems.forEach((e) => {
				if (e.classList.contains("up"))
					e.textContent = "▲ " + e.textContent.replace(/^\+/, "");
				else if (e.classList.contains("dn"))
					e.textContent = "▼ " + e.textContent.replace(/^[−-]/, "");
			});
			const head = document.createElement("li");
			head.className = "hw-cmph";
			head.innerHTML = "<span></span><b>эта</b><em>к надетой</em>";
			ul.prepend(head);
			const box = document.createElement("p");
			box.className = "hw-cmpv";
			box.innerHTML =
				`Сравниваем с надетой: <b>${tpEsc(name)}</b>` +
				(up + dn
					? `<span class="${up > dn ? "up" : up < dn ? "dn" : "eq"}">${up > dn ? "лучше" : up < dn ? "слабее" : "наравне"}: ▲${up} ▼${dn}</span>`
					: "");
			ul.before(box);
			cmp.remove();
		};
		const hook = () => {
			const tip = document.getElementById("lg-tip");
			if (!tip) return setTimeout(hook, 500);
			new MutationObserver(() => {
				if (hwOn()) fix(tip);
			}).observe(tip, { childList: true });
			if (hwOn()) fix(tip);
		};
		hook();
	}

	const eqNow = (H) => {
		const o = {};
		for (const x of (H && H.items) || []) if (x.on && x.slot) o[x.slot] = x.uid;
		return o;
	};
	const eqKey = (o) =>
		JSON.stringify(
			Object.keys(o || {})
				.sort()
				.map((k) => [k, o[k]]),
		);
	function v18gear(tab, m) {
		const stage = tab.querySelector(":scope > .hero-grid > .stage"),
			H = heroNow();
		if (!stage || !H || H.ghost) return;
		if (!H.gsl || !Array.isArray(H.gsl.list)) return;
		tplRow(
			{
				id: "gear",
				aria: "Шаблоны снаряжения",
				word: "Набор",
				host: () => stage,
				data: () => heroNow().gsl,
				on: (x) => eqKey(x.eq) === eqKey(eqNow(heroNow())),
				load: async (i) => {
					if (heroNow().busy)
						return {
							ok: false,
							error: "Идёт бой - снаряжение сменится после боя",
						};
					const r = await tpApi("/api/gearSlot", { a: "load", i });
					if (r && r.ok && r.gslots) heroNow().gsl = r.gslots;
					if (r && r.note) {
						TPS.gear.msg = r.note;
						TPS.gear.key = "";
					}
					return r;
				},
				save: async (i, name) => {
					const r = await tpApi("/api/gearSlot", {
						a: "save",
						i,
						...(name ? { name } : {}),
					});
					if (r && r.ok && r.gslots) heroNow().gsl = r.gslots;
					return r;
				},
				rename: async (i, name) => {
					const r = await tpApi("/api/gearSlot", { a: "name", i, name });
					if (r && r.ok && r.gslots) heroNow().gsl = r.gslots;
					return r;
				},
			},
			tab,
		);
	}

	let raf = 0;
	const later = () => {
		if (raf || (!(CTX.hero && CTX.hero.hg) && !hwOn())) return;
		raf = requestAnimationFrame(() => {
			raf = 0;
			sync();
		});
	};
	new MutationObserver(later).observe(document.documentElement, {
		attributes: true,
		attributeFilter: ["class"],
	});
	const boot = () => {
		const tab = document.getElementById("tab-hero");
		if (tab)
			new MutationObserver(later).observe(tab, {
				childList: true,
				subtree: true,
				attributes: true,
				attributeFilter: ["class"],
			});
		new MutationObserver((ms) => {
			for (const m of ms)
				for (const n of m.addedNodes)
					if (
						n.nodeType === 1 &&
						(n.matches(".ctxm, .lgi-tip") || n.querySelector(".ctxm, .lgi-tip"))
					)
						return later();
		}).observe(document.body, { childList: true, subtree: true });
		sync();
	};
	if (document.body) boot();
	else document.addEventListener("DOMContentLoaded", boot);
	window.addEventListener("resize", later);

	window.LGHeroGw = {
		sync: (o) => {
			if (o) Object.assign(CTX, o);
			sync();
		},
		gst,
		ped: pedSvg,
		deco: decoSvg,
	};
})();
