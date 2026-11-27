((root, factory) => {
	if (typeof module === "object" && module.exports) module.exports = factory();
	else root.LGGwent = factory();
})(typeof self !== "undefined" ? self : this, () => {
	const ROWS = ["m", "r", "s"];
	const ROWN = { m: "Ближний бой", r: "Стрелки", s: "Осада" };
	const NAMES = {
		legion: [
			"Легионер-щитоносец",
			"Рубака когорты",
			"Знаменосец",
			"Лазутчик",
			"Центурион Максим",
			"Лучник когорты",
			"Лекарь легиона",
			"Пращник",
			"Сагиттарий Луций",
			"Баллиста",
			"Таран",
			"Онагр",
		],
		cats: [
			"Кот-щитоносец",
			"Кот-задира",
			"Котёнок-барабанщик",
			"Кот-лазутчик",
			"Мурзик Великий",
			"Кошка-лучница",
			"Кошка-лекарь",
			"Метатель клубков",
			"Снайпер Пушок",
			"Клубкомёт",
			"Таран-лежанка",
			"Когтемёт",
		],
		monkeys: [
			"Горилла-щитоносец",
			"Горилла-вышибала",
			"Бабуин-барабанщик",
			"Мартышка-лазутчик",
			"Вожак Кинг",
			"Мартышка с рогаткой",
			"Шимпанзе-знахарь",
			"Метатель кокосов",
			"Орангутан Бо",
			"Банановая катапульта",
			"Бревно-таран",
			"Пальмомёт",
		],
		veggies: [
			"Картофель-страж",
			"Свёкла-рубака",
			"Морковка-знаменосец",
			"Горошина-лазутчик",
			"Генерал Кабачок",
			"Горох-стрелок",
			"Ромашка-лекарь",
			"Редисомёт",
			"Лучница Луковка",
			"Тыквомёт",
			"Таран-кочан",
			"Арбузомёт",
		],
		"42brothers": [
			"Братуха-щитоносец",
			"Братуха-вышибала",
			"Братуха с бумбоксом",
			"Братуха-шпион",
			"Сорок Второй",
			"Снайпер в очках",
			"Братуха-доктор",
			"Метатель дисков",
			"Золотой стрелок",
			"Золотая пушка",
			"Лимузин-таран",
			"Колонка-мортира",
		],
		cherts: [
			"Чертёнок-щитоносец",
			"Чертёнок с вилами",
			"Чертёнок-барабанщик",
			"Чертёнок-шпион",
			"Рогатый воевода",
			"Огнеплюй",
			"Чёрт-знахарь",
			"Метатель угольков",
			"Бес Азазелька",
			"Котёл-катапульта",
			"Адский таран",
			"Серномёт",
		],
		ugabugi: [
			"Уг со щитом",
			"Уг с дубиной",
			"Шаман с бубном",
			"Уг-лазутчик",
			"Вождь Уга",
			"Метатель камней",
			"Уг-знахарь",
			"Копьеметатель",
			"Охотница Ыга",
			"Камнемёт",
			"Бревно-таран",
			"Мамонтобой",
		],
	};

	const DECK = [
		["shield", "m", 4, "bond", 3],
		["brute", "m", 5, "", 2],
		["banner", "m", 2, "morale", 1],
		["spy", "m", 4, "spy", 1],
		["heroM", "m", 10, "hero", 1],
		["archer", "r", 4, "muster", 3],
		["medic", "r", 3, "medic", 1],
		["thrower", "r", 6, "", 1],
		["heroR", "r", 8, "hero", 1],
		["catapult", "s", 8, "bond", 2],
		["ram", "s", 6, "", 1],
		["treb", "s", 5, "", 1],
		["frost", "w", 0, "wm", 1],
		["fog", "w", 0, "wr", 1],
		["rain", "w", 0, "ws", 1],
		["clear", "w", 0, "clear", 1],
		["horn", "x", 0, "horn", 1],
		["decoy", "x", 0, "decoy", 1],
		["scorch", "x", 0, "scorch", 1],
	];
	const SPECIAL = {
		frost: "Трескучий мороз",
		fog: "Густой туман",
		rain: "Проливной дождь",
		clear: "Ясное небо",
		horn: "Рог командира",
		decoy: "Чучело",
		scorch: "Пекло",
	};
	const AB = {
		bond: "Узы: рядом с такими же картами сила умножается на их число.",
		morale: "Боевой дух: +1 всем остальным картам своего ряда.",
		spy: "Шпион: ложится на сторону соперника, а вы берёте 2 карты из колоды.",
		muster:
			"Сбор: вместе с ней на стол выходят все такие же карты - из руки и из колоды.",
		medic: "Лекарь: вернуть одну карту отряда из своего сброса на поле.",
		hero: "Герой: погода, рог и пекло на него не действуют.",
		wm: "Мороз: сила всех карт ближнего боя на поле - 1.",
		wr: "Туман: сила всех стрелков на поле - 1.",
		ws: "Дождь: сила всей осады на поле - 1.",
		clear: "Убирает с поля всю погоду.",
		horn: "Удваивает силу выбранного своего ряда (кроме героев).",
		decoy: "Забирает карту отряда со своей стороны поля обратно в руку.",
		scorch:
			"Сжигает самые сильные карты отряда на всём поле (героев не трогает).",
		"": "Обычная карта отряда.",
	};
	const FAC = {
		legion: [
			"Легион",
			"После каждого раунда одна случайная карта отряда остаётся на поле.",
		],
		cats: ["Котики", "Ничья в раунде засчитывается вам."],
		monkeys: ["Обезьяны", "В начале боя вы берёте одну лишнюю карту."],
		veggies: [
			"Овощи",
			"Первая карта отряда в каждом раунде прорастает: +2 силы.",
		],
		"42brothers": ["42 Братухи", "Вы решаете, кто ходит первым."],
		cherts: ["Чертики", "Погода не задевает ваш ближний бой."],
		ugabugi: [
			"Уга-Буги",
			"Проиграли раунд - случайная карта отряда из сброса возвращается в руку.",
		],
	};
	const facOf = (f) => (FAC[f] ? f : "legion");
	const MULL = 2;
	const rnd = (n) => Math.floor(Math.random() * n);
	const shuffle = (a) => {
		for (let i = a.length - 1; i > 0; i--) {
			const j = rnd(i + 1);
			[a[i], a[j]] = [a[j], a[i]];
		}
		return a;
	};

	function cardOf(fac, i, uid) {
		const [key, row, base, ab] = DECK[i],
			names = NAMES[facOf(fac)];
		return {
			uid: uid || 0,
			key,
			row,
			base,
			ab,
			fac: facOf(fac),
			name: i < 12 ? names[i] : SPECIAL[key],
			unit: row !== "w" && row !== "x",
		};
	}
	function makeDeck(G, fac) {
		const out = [];
		DECK.forEach((d, i) => {
			for (let q = 0; q < d[4]; q++) out.push(cardOf(fac, i, G.uid++));
		});
		return shuffle(out);
	}
	function player(G, name, fac) {
		fac = facOf(fac);
		const P = {
			name: String(name),
			fac,
			deck: makeDeck(G, fac),
			hand: [],
			grave: [],
			rows: { m: [], r: [], s: [] },
			horn: { m: null, r: null, s: null },
			gems: 2,
			passed: false,
			sprouted: false,
			won: 0,
		};
		for (let i = 0; i < 10 + (fac === "monkeys" ? 1 : 0); i++)
			P.hand.push(P.deck.pop());
		return P;
	}

	function create(o) {
		const G = {
			uid: 1,
			p: [],
			turn: rnd(2),
			round: 1,
			weather: { m: 0, r: 0, s: 0 },
			log: [],
			over: false,
			winner: null,
			banner: null,
			note: null,
			phase: "mull",
			mull: [0, 0],
			ready: [false, false],
			chooser: null,
		};
		G.p = [player(G, o.n0, o.f0), player(G, o.n1, o.f1)];
		const b0 = G.p[0].fac === "42brothers",
			b1 = G.p[1].fac === "42brothers";
		if (b0 !== b1) {
			G.phase = "first";
			G.chooser = b0 ? 0 : 1;
		}
		log(G, "Можно заменить до 2 карт - нажми на карту в руке");
		return G;
	}

	function power(G, pi, row, c) {
		if (c.ab === "hero") return c.base;
		if (c.key === "decoy") return 0;
		const P = G.p[pi],
			list = P.rows[row];
		let v = c.base + (c.bonus || 0);
		if (G.weather[row] && !(P.fac === "cherts" && row === "m")) v = 1;
		if (c.ab === "bond") v *= list.filter((x) => x.key === c.key).length;
		v += list.filter((x) => x.ab === "morale" && x !== c).length;
		if (P.horn[row]) v *= 2;
		return v;
	}
	const rowSum = (G, pi, row) =>
		G.p[pi].rows[row].reduce((s, c) => s + power(G, pi, row, c), 0);
	const total = (G, pi) => ROWS.reduce((s, r) => s + rowSum(G, pi, r), 0);
	function draw(P, n) {
		for (let i = 0; i < n && P.deck.length; i++) P.hand.push(P.deck.pop());
	}
	function log(G, t) {
		G.log.unshift(t);
		G.log.length = Math.min(G.log.length, 8);
	}
	function bestRow(G, pi) {
		let best = "m",
			bv = -1;
		for (const r of ROWS) {
			if (G.p[pi].horn[r]) continue;
			const v = rowSum(G, pi, r);
			if (v > bv) {
				bv = v;
				best = r;
			}
		}
		return best;
	}
	function decoyPick(G, pi) {
		const P = G.p[pi];
		for (const r of ROWS) {
			const spy = P.rows[r].find((x) => x.ab === "spy");
			if (spy) return spy.uid;
		}
		for (const r of ROWS) {
			const m = P.rows[r].find((x) => x.ab === "medic");
			if (m) return m.uid;
		}
		return null;
	}

	function apply(G, pi, uid, o, fromGrave) {
		o = o || {};
		const P = G.p[pi],
			O = G.p[1 - pi];
		const src = fromGrave ? P.grave : P.hand,
			ix = src.findIndex((c) => c.uid === uid);
		if (ix < 0) return false;
		const c = src.splice(ix, 1)[0];
		let txt = `${P.name}: «${c.name}»`;
		if (c.unit) {
			if (c.ab === "spy") {
				O.rows[c.row].push(c);
				draw(P, 2);
				txt += " - шпион к сопернику, +2 карты";
				G.note = `Шпион! ${P.name} берёт 2 карты`;
			} else {
				if (P.fac === "veggies" && !P.sprouted) {
					c.bonus = 2;
					P.sprouted = true;
					txt += " (проросла +2)";
				}
				P.rows[c.row].push(c);
				if (c.ab === "muster") {
					const fromDeck = P.deck.filter((x) => x.key === c.key),
						fromHand = P.hand.filter((x) => x.key === c.key);
					P.deck = P.deck.filter((x) => x.key !== c.key);
					P.hand = P.hand.filter((x) => x.key !== c.key);
					fromDeck.concat(fromHand).forEach((x) => P.rows[x.row].push(x));
					const n = fromDeck.length + fromHand.length,
						where = [
							fromHand.length ? `из руки ${fromHand.length}` : "",
							fromDeck.length ? `из колоды ${fromDeck.length}` : "",
						]
							.filter(Boolean)
							.join(", ");
					if (n) {
						txt += ` и ещё ${n} (${where})`;
						G.note = `Сбор! Вышли ещё ${n} «${c.name}»: ${where}`;
					}
				}
				if (c.ab === "medic") {
					const pool = P.grave.filter((x) => x.unit && x.ab !== "hero");
					if (pool.length) {
						let t = pool.find((x) => x.uid === o.target);
						if (!t) t = pool.slice().sort((a, b) => b.base - a.base)[0];
						log(G, txt + " - лечит");
						G.note = `Лекарь вернул «${t.name}» из сброса`;
						return apply(G, pi, t.uid, {}, true);
					}
				}
			}
		} else if (c.ab[0] === "w") {
			G.weather[c.ab[1]] = 1;
			P.grave.push(c);
			txt += " - погода";
		} else if (c.ab === "clear") {
			G.weather = { m: 0, r: 0, s: 0 };
			P.grave.push(c);
		} else if (c.ab === "horn") {
			const row =
				ROWS.includes(o.row) && !P.horn[o.row] ? o.row : bestRow(G, pi);
			if (P.horn[row]) P.grave.push(P.horn[row]);
			P.horn[row] = c;
			txt += ` - ряд «${ROWN[row]}»`;
		} else if (c.ab === "decoy") {
			let found = null;
			for (const r of ROWS) {
				const i = P.rows[r].findIndex(
					(x) => x.uid === o.target && x.ab !== "hero" && x.unit,
				);
				if (i >= 0) {
					found = [r, i];
					break;
				}
			}
			if (!found) {
				const t = decoyPick(G, pi);
				if (t)
					for (const r of ROWS) {
						const i = P.rows[r].findIndex((x) => x.uid === t);
						if (i >= 0) found = [r, i];
					}
			}
			if (found) {
				const [r, i] = found,
					back = P.rows[r][i];
				back.bonus = 0;
				P.rows[r].splice(i, 1, c);
				P.hand.push(back);
				txt += ` - вернул «${back.name}»`;
			} else P.grave.push(c);
		} else if (c.ab === "scorch") {
			let max = 0;
			[0, 1].forEach((q) =>
				ROWS.forEach((r) =>
					G.p[q].rows[r].forEach((x) => {
						if (x.unit && x.ab !== "hero")
							max = Math.max(max, power(G, q, r, x));
					}),
				),
			);
			let burnt = 0;
			if (max > 0)
				[0, 1].forEach((q) =>
					ROWS.forEach((r) => {
						const keep = [],
							gone = [];
						G.p[q].rows[r].forEach((x) =>
							(x.unit && x.ab !== "hero" && power(G, q, r, x) === max
								? gone
								: keep
							).push(x),
						);
						if (gone.length) {
							G.p[q].rows[r] = keep;
							G.p[q].grave.push(...gone);
							burnt += gone.length;
						}
					}),
				);
			P.grave.push(c);
			txt += burnt ? ` - сгорело карт: ${burnt}` : " - гореть нечему";
			G.note = burnt
				? `Пекло! Сгорело карт: ${burnt}`
				: "Пекло - гореть нечему";
		}
		log(G, txt);
		return true;
	}
	function next(G, pi) {
		const O = G.p[1 - pi];
		if (G.p[0].passed && G.p[1].passed) return endRound(G);
		G.turn = O.passed ? pi : 1 - pi;
		if (!G.p[G.turn].hand.length) passRaw(G, G.turn);
	}
	function passRaw(G, pi) {
		G.p[pi].passed = true;
		log(G, `${G.p[pi].name} пасует`);
		next(G, pi);
	}
	function endRound(G) {
		const s = [total(G, 0), total(G, 1)];
		let win = s[0] > s[1] ? 0 : s[1] > s[0] ? 1 : -1;
		if (win < 0) {
			const c0 = G.p[0].fac === "cats",
				c1 = G.p[1].fac === "cats";
			if (c0 !== c1) win = c0 ? 0 : 1;
		}
		const lose = win < 0 ? [0, 1] : [1 - win];
		lose.forEach((q) => {
			G.p[q].gems--;
		});
		if (win >= 0) G.p[win].won++;
		G.banner = {
			round: G.round,
			s,
			win,
			text:
				win < 0
					? `Раунд ${G.round}: ничья`
					: `Раунд ${G.round}: побеждает ${G.p[win].name}`,
		};

		lose.forEach((q) => {
			const P = G.p[q];
			if (P.fac !== "ugabugi") return;
			const pool = P.grave.filter((x) => x.unit);
			if (pool.length) {
				const c = pool[rnd(pool.length)];
				P.grave.splice(P.grave.indexOf(c), 1);
				c.bonus = 0;
				P.hand.push(c);
				log(G, `${P.name}: «${c.name}» вернулась в руку`);
			}
		});
		[0, 1].forEach((q) => {
			const P = G.p[q];
			let keep = null;
			if (P.fac === "legion") {
				const all = [];
				ROWS.forEach((r) =>
					P.rows[r].forEach((x) => {
						if (x.unit) all.push([r, x]);
					}),
				);
				if (all.length) keep = all[rnd(all.length)];
			}
			ROWS.forEach((r) => {
				P.rows[r].forEach((x) => {
					if (!keep || x !== keep[1]) {
						if (x.key !== "decoy") x.bonus = 0;
						P.grave.push(x);
					}
				});
				P.rows[r] = [];
				if (P.horn[r]) P.grave.push(P.horn[r]);
				P.horn[r] = null;
			});
			if (keep) {
				P.rows[keep[0]].push(keep[1]);
				log(G, `${P.name}: «${keep[1].name}» остаётся на поле`);
			}
			P.passed = false;
			P.sprouted = false;
		});
		G.weather = { m: 0, r: 0, s: 0 };
		if (G.p[0].gems <= 0 || G.p[1].gems <= 0 || G.round >= 3) {
			G.over = true;
			G.winner =
				G.p[0].gems > G.p[1].gems ? 0 : G.p[1].gems > G.p[0].gems ? 1 : -1;
			return;
		}
		G.round++;
		G.turn = win < 0 ? G.turn : 1 - win;
	}

	const canPlay = (G, pi) =>
		!!G && !G.over && G.phase === "play" && G.turn === pi && !G.p[pi].passed;

	function chooseFirst(G, pi, first) {
		if (
			!G ||
			G.phase !== "first" ||
			G.chooser !== pi ||
			(first !== 0 && first !== 1)
		)
			return false;
		G.turn = first;
		G.phase = "mull";
		return true;
	}

	function mulligan(G, pi, uid) {
		if (!G || G.phase !== "mull" || G.ready[pi] || G.mull[pi] >= MULL)
			return false;
		const P = G.p[pi],
			i = P.hand.findIndex((c) => c.uid === uid);
		if (i < 0 || !P.deck.length) return false;
		P.deck.unshift(P.hand[i]);
		P.hand[i] = P.deck.pop();
		shuffle(P.deck);
		G.mull[pi]++;
		return true;
	}

	function ready(G, pi) {
		if (!G || G.phase !== "mull" || G.ready[pi]) return false;
		G.ready[pi] = true;
		if (G.ready[0] && G.ready[1]) {
			G.phase = "play";
			log(G, `Первым ходит ${G.p[G.turn].name}`);
		}
		return true;
	}

	function play(G, pi, uid, o) {
		if (!canPlay(G, pi)) return false;
		o = o || {};
		const P = G.p[pi],
			c = P.hand.find((x) => x.uid === uid);
		if (!c) return false;
		if (
			c.ab === "horn" &&
			o.row != null &&
			(!ROWS.includes(o.row) || P.horn[o.row])
		)
			return false;
		if (
			c.ab === "decoy" &&
			o.target != null &&
			!ROWS.some((r) =>
				P.rows[r].some((x) => x.uid === o.target && x.unit && x.ab !== "hero"),
			)
		)
			return false;
		if (
			c.ab === "medic" &&
			o.target != null &&
			!P.grave.some((x) => x.uid === o.target && x.unit && x.ab !== "hero")
		)
			return false;
		G.note = null;
		if (!apply(G, pi, uid, o)) return false;
		next(G, pi);
		return true;
	}
	function pass(G, pi) {
		if (!canPlay(G, pi)) return false;
		G.note = null;
		passRaw(G, pi);
		return true;
	}

	function surrender(G, pi) {
		if (!G || G.over) return false;
		G.over = true;
		G.winner = 1 - pi;
		G.p[pi].gems = 0;
		G.banner = null;
		log(G, `${G.p[pi].name} сдаётся`);
		return true;
	}

	const clone = (G) =>
		typeof structuredClone === "function"
			? structuredClone(G)
			: JSON.parse(JSON.stringify(G));
	function ai(G, pi) {
		if (!canPlay(G, pi)) return false;
		const P = G.p[pi],
			O = G.p[1 - pi],
			my = total(G, pi),
			op = total(G, 1 - pi);
		G.note = null;
		if (!P.hand.length) {
			passRaw(G, pi);
			return true;
		}
		if (O.passed && my > op) {
			passRaw(G, pi);
			return true;
		}
		const mustWin = P.gems === 1;
		if (
			!O.passed &&
			!mustWin &&
			op > 0 &&
			my - op >= 12 &&
			P.hand.length <= O.hand.length
		) {
			passRaw(G, pi);
			return true;
		}
		let best = null;
		for (const c of P.hand) {
			const opts =
				c.ab === "horn"
					? [{ row: bestRow(G, pi) }]
					: c.ab === "decoy"
						? [{ target: decoyPick(G, pi) }]
						: [{}];
			for (const o of opts) {
				if (c.ab === "decoy" && !o.target) continue;
				const T = clone(G);
				T.log = [];
				apply(T, pi, c.uid, o);
				let d = total(T, pi) - total(T, 1 - pi) - (my - op);
				if (c.ab === "spy") d += 7;
				if (c.ab === "hero" && G.round === 1) d -= 3;
				if (c.ab[0] === "w" && G.weather[c.ab[1]]) d -= 20;
				if (c.ab === "clear" && !(G.weather.m || G.weather.r || G.weather.s))
					d -= 20;
				if (O.passed) {
					const after = total(T, pi) - total(T, 1 - pi);
					d = after > 0 ? 100 - (total(T, pi) - my) : d;
				}
				if (!best || d > best.d) best = { c, o, d };
			}
		}
		if (!best || (best.d <= 0 && my >= op && !O.passed)) {
			passRaw(G, pi);
			return true;
		}
		if (
			O.passed &&
			my + best.d <= op &&
			!mustWin &&
			G.round < 3 &&
			best.d < 100
		) {
			passRaw(G, pi);
			return true;
		}
		apply(G, pi, best.c.uid, best.o);
		next(G, pi);
		return true;
	}

	function view(G, pi) {
		const side = (P, q) => {
			const mine = pi === q;
			return {
				name: P.name,
				fac: P.fac,
				hand: mine ? P.hand : [],
				handN: P.hand.length,
				deck: [],
				deckN: P.deck.length,
				grave: P.grave,
				rows: P.rows,
				horn: P.horn,
				gems: P.gems,
				passed: P.passed,
				won: P.won,
			};
		};
		return {
			p: [side(G.p[0], 0), side(G.p[1], 1)],
			turn: G.turn,
			round: G.round,
			weather: G.weather,
			log: G.log.slice(0, 6),
			over: G.over,
			winner: G.winner,
			banner: G.banner,
			note: G.note,
			phase: G.phase,
			mull: G.mull,
			ready: G.ready,
			chooser: G.chooser,
		};
	}

	function affect(G, c, bot, top) {
		const rows = [],
			cards = [];
		if (c.unit) rows.push(c.ab === "spy" ? [top, c.row] : [bot, c.row]);
		else if (c.ab[0] === "w") [0, 1].forEach((pi) => rows.push([pi, c.ab[1]]));
		else if (c.ab === "clear")
			[0, 1].forEach((pi) =>
				ROWS.forEach((r) => {
					if (G.weather[r]) rows.push([pi, r]);
				}),
			);
		else if (c.ab === "horn")
			ROWS.forEach((r) => {
				if (!G.p[bot].horn[r]) rows.push([bot, r]);
			});
		else if (c.ab === "decoy")
			ROWS.forEach((r) =>
				G.p[bot].rows[r].forEach((x) => {
					if (x.unit && x.ab !== "hero") cards.push(x.uid);
				}),
			);
		else if (c.ab === "scorch") {
			let max = 0;
			[0, 1].forEach((q) =>
				ROWS.forEach((r) =>
					G.p[q].rows[r].forEach((x) => {
						if (x.unit && x.ab !== "hero")
							max = Math.max(max, power(G, q, r, x));
					}),
				),
			);
			if (max > 0)
				[0, 1].forEach((q) =>
					ROWS.forEach((r) =>
						G.p[q].rows[r].forEach((x) => {
							if (x.unit && x.ab !== "hero" && power(G, q, r, x) === max)
								cards.push(x.uid);
						}),
					),
				);
		}
		return { rows, cards };
	}

	function targets(G, c, bot, top) {
		if (c.unit) return c.ab === "spy" ? [[top, c.row]] : [[bot, c.row]];
		if (c.ab === "horn")
			return ROWS.filter((r) => !G.p[bot].horn[r]).map((r) => [bot, r]);
		if (c.ab === "decoy") return ROWS.map((r) => [bot, r]);
		return [0, 1].flatMap((pi) => ROWS.map((r) => [pi, r]));
	}

	return {
		ROWS,
		ROWN,
		NAMES,
		DECK,
		SPECIAL,
		AB,
		FAC,
		MULL,
		facOf,
		cardOf,
		create,
		power,
		rowSum,
		total,
		bestRow,
		chooseFirst,
		mulligan,
		ready,
		play,
		pass,
		surrender,
		ai,
		view,
		affect,
		targets,
		canPlay,
	};
});

(() => {
	const TV_W = 4400,
		TV_H = 2300,
		FL = { 2: 700, 1: 1640, 0: 2240 },
		GAL_X = 3330;
	const TH = {
		legion: {
			name: "Щит и кружка",
			wall: "#ecd8ae",
			wallD: "#b8553a",
			up: "#f1e0bc",
			beam: "#7a4a2c",
			beamL: "#9a6238",
			stone: "#b4a694",
			stoneD: "#8a7c6c",
			cellar: "#7c6e62",
			acc: "#a3242c",
			acc2: "#e8b030",
			ink: "#2b1d18",
			sign: "#6e4a2f",
			signTx: "#ffe39a",
			cloth: "#3f7a4a",
			glw: "#ff9d1f",
			sky: "#24305e",
			metal: "#c8963a",
			top: "#b07448",
			cush: "#a3242c",
			floor: "#7a4a2c",
			k: {
				wall: "plaster",
				beam: "wood",
				floor: "planks",
				lamp: "oil",
				shelf: "amphora",
				hearth: "stone",
				door: "studded",
				stool: "wood",
				table: "wood",
				win: "drape",
				mug: "tankard",
			},
		},
		cats: {
			name: "Сытый кот",
			wall: "#f9dfd0",
			wallD: "#c98a72",
			up: "#fce9dd",
			beam: "#9a6248",
			beamL: "#c08460",
			stone: "#d4b4a6",
			stoneD: "#a8887a",
			cellar: "#9a7c70",
			acc: "#ff8fa3",
			acc2: "#7fd6e6",
			ink: "#4a2f22",
			sign: "#a83a58",
			signTx: "#fff4ea",
			cloth: "#5aa88a",
			glw: "#ff4f86",
			sky: "#2e3466",
			metal: "#e0b860",
			top: "#d39a6e",
			cush: "#ff8fa3",
			floor: "#9a6248",
			k: {
				wall: "paper",
				beam: "wood",
				floor: "planks",
				lamp: "lantern",
				shelf: "milk",
				hearth: "stone",
				door: "round",
				stool: "cushion",
				table: "wood",
				win: "polka",
				mug: "fish",
			},
		},
		monkeys: {
			name: "Банановая бочка",
			wall: "#c99a5e",
			wallD: "#8a6a3a",
			up: "#d6aa70",
			beam: "#5a3a1a",
			beamL: "#a8843a",
			stone: "#9a8a6a",
			stoneD: "#7a6a4c",
			cellar: "#6e5a3e",
			acc: "#ffd23f",
			acc2: "#5aa83a",
			ink: "#2a1a12",
			sign: "#3a2412",
			signTx: "#ffd23f",
			cloth: "#4a8a3a",
			glw: "#ff6a1a",
			sky: "#1f3a3a",
			metal: "#b88a3a",
			top: "#a8703a",
			cush: "#5aa83a",
			floor: "#6a4420",
			k: {
				wall: "bamboo",
				beam: "bamboo",
				floor: "planks",
				lamp: "tiki",
				shelf: "coconut",
				hearth: "stone",
				door: "bamboo",
				stool: "barrel",
				table: "wood",
				win: "leaves",
				mug: "coco",
			},
		},
		veggies: {
			name: "Тыквенный погребок",
			wall: "#f6f1d4",
			wallD: "#fbf8ea",
			up: "#f8f5de",
			beam: "#7a5a34",
			beamL: "#9a7444",
			stone: "#b4ad8c",
			stoneD: "#948c6c",
			cellar: "#8a8262",
			acc: "#ff9a4d",
			acc2: "#5aa83a",
			ink: "#2f3a1e",
			sign: "#2f6a1e",
			signTx: "#fffbea",
			cloth: "#6aa84a",
			glw: "#ff6a2a",
			sky: "#2a3a5a",
			metal: "#c0a060",
			top: "#c4945c",
			cush: "#e85a4a",
			floor: "#7a5a34",
			k: {
				wall: "check",
				beam: "wood",
				floor: "planks",
				lamp: "lantern",
				shelf: "jar",
				hearth: "stone",
				door: "arch",
				stool: "check",
				table: "wood",
				win: "gingham",
				mug: "tankard",
			},
		},
		"42brothers": {
			name: "Сорок два бокала",
			wall: "#2c1a3a",
			wallD: "#1a0f24",
			up: "#341f44",
			beam: "#24140c",
			beamL: "#4a2a14",
			stone: "#5a4a6a",
			stoneD: "#2a2036",
			cellar: "#1e1628",
			acc: "#ff5fa8",
			acc2: "#ffc83d",
			ink: "#120a18",
			sign: "#1d1226",
			signTx: "#ffc83d",
			cloth: "#7a2a5a",
			glw: "#ff6ac0",
			sky: "#140c24",
			metal: "#ffc83d",
			top: "#3a2018",
			cush: "#8a2a6a",
			floor: "#2a1818",
			k: {
				wall: "velvet",
				beam: "gold",
				floor: "carpet",
				lamp: "gold",
				shelf: "champagne",
				hearth: "marble",
				door: "padded",
				stool: "chrome",
				table: "gold",
				win: "velvet",
				mug: "glass",
			},
		},
		cherts: {
			name: "Котёл",
			wall: "#3a2626",
			wallD: "#241616",
			up: "#432c2c",
			beam: "#1e1212",
			beamL: "#3a2a2a",
			stone: "#4a3434",
			stoneD: "#2e2020",
			cellar: "#241818",
			acc: "#ff6a2a",
			acc2: "#ffcf3f",
			ink: "#0e0606",
			sign: "#1a0e0e",
			signTx: "#ffb35c",
			cloth: "#6a2a1a",
			glw: "#ffb020",
			sky: "#5a1410",
			metal: "#6a6a72",
			top: "#4a2c26",
			cush: "#8a1a14",
			floor: "#2a1a1a",
			k: {
				wall: "rock",
				beam: "iron",
				floor: "lava",
				lamp: "skull",
				shelf: "potion",
				hearth: "cauldron",
				door: "iron",
				stool: "bone",
				table: "iron",
				win: "bars",
				mug: "skull",
			},
		},
		ugabugi: {
			name: "Пещера Уга",
			wall: "#c9bea8",
			wallD: "#a89c84",
			up: "#d6ccb6",
			beam: "#6e5a3e",
			beamL: "#8a7452",
			stone: "#a89c84",
			stoneD: "#867a64",
			cellar: "#7a6e58",
			acc: "#f2a63b",
			acc2: "#7ab04a",
			ink: "#24201a",
			sign: "#4f4536",
			signTx: "#f2a63b",
			cloth: "#8a6a4a",
			glw: "#ff7a10",
			sky: "#1e2a44",
			metal: "#8a7a6a",
			top: "#a89c84",
			cush: "#a8784a",
			floor: "#867a64",
			k: {
				wall: "cave",
				beam: "log",
				floor: "stone",
				lamp: "torch",
				shelf: "stonejar",
				hearth: "campfire",
				door: "hide",
				stool: "stump",
				table: "slab",
				win: "hole",
				mug: "horn",
			},
		},
	};
	const GLOW = "#ffd27a",
		FIRE = "#ff8a2a",
		FIRE2 = "#ffd24a",
		FIRE3 = "#fff3b0",
		MOON = "#fff3c4";
	const BOTTLES = [
		"#3fa89a",
		"#a3245a",
		"#5aa86a",
		"#c97a2a",
		"#6a7ad8",
		"#d8c04a",
	];

	function tvMix(a, b, t) {
		const p = (c, i) => parseInt(c.substr(i, 2), 16);
		return (
			"#" +
			[1, 3, 5]
				.map((i) =>
					Math.round(p(a, i) * (1 - t) + p(b, i) * t)
						.toString(16)
						.padStart(2, "0"),
				)
				.join("")
		);
	}
	function tvRng(seed) {
		let a = seed >>> 0;
		return () => {
			a = (a + 0x6d2b79f5) >>> 0;
			let t = a;
			t = Math.imul(t ^ (t >>> 15), t | 1);
			t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
	}

	function tvArt(T, sty) {
		const K = T.k,
			k = T.ink,
			r = tvRng(sty.length * 977 + 13);
		const lt = (c, t) => tvMix(c, "#ffffff", t),
			dk = (c, t) => tvMix(c, "#000000", t);
		const f1 = (v) => Math.round(v * 10) / 10;
		const S = (w) =>
			`stroke="${k}" stroke-width="${w || 7}" stroke-linejoin="round" stroke-linecap="round"`;
		const N = 'stroke="none"';
		const R = (x, y, w, h, f, o) =>
			`<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="${f}" ${o === undefined ? S() : o}/>`;
		const RR = (x, y, w, h, rr, f, o) =>
			`<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${rr}" fill="${f}" ${o === undefined ? S() : o}/>`;
		const C = (x, y, rad, f, o) =>
			`<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(rad)}" fill="${f}" ${o === undefined ? S() : o}/>`;
		const E = (x, y, rx, ry, f, o) =>
			`<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="${f}" ${o === undefined ? S() : o}/>`;
		const P = (d, f, o) =>
			`<path d="${d}" fill="${f}" ${o === undefined ? S() : o}/>`;
		const L = (x1, y1, x2, y2, w, c, op) =>
			`<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${c || k}" stroke-width="${w || 6}" stroke-linecap="round"${op ? ` opacity="${op}"` : ""}/>`;
		const TX = (x, y, s, f, txt, extra) =>
			`<text x="${x}" y="${y}" font-size="${s}" fill="${f}" text-anchor="middle" dominant-baseline="central" style="font-family:var(--gw-hd);font-weight:var(--gw-hdw,400)" ${extra || ""}>${txt}</text>`;
		const H = (id, svg) =>
			`<g class="ho" data-h="${id}"><g class="gl">${svg}</g>${svg}</g>`;
		const SH = (x, y, rx) =>
			E(x, y, rx, rx * 0.12, "#000", 'stroke="none" opacity=".16"');
		const flame = (x, y, s) =>
			`<g class="flick">${P(`M${f1(x - 14 * s)} ${y} Q${f1(x - 18 * s)} ${f1(y - 26 * s)} ${x} ${f1(y - 52 * s)} Q${f1(x + 18 * s)} ${f1(y - 26 * s)} ${f1(x + 14 * s)} ${y} Z`, FIRE, N)}${P(`M${f1(x - 7 * s)} ${y} Q${f1(x - 9 * s)} ${f1(y - 16 * s)} ${x} ${f1(y - 32 * s)} Q${f1(x + 9 * s)} ${f1(y - 16 * s)} ${f1(x + 7 * s)} ${y} Z`, FIRE2, N)}${E(x, y - 6 * s, 4 * s, 7 * s, FIRE3, N)}</g>`;
		const pool = (x, y, rad, op) =>
			C(x, y, rad, GLOW, `stroke="none" opacity="${op || 0.14}"`) +
			C(
				x,
				y,
				rad * 0.55,
				GLOW,
				`stroke="none" opacity="${f1((op || 0.14) * 8) / 10}"`,
			);
		const plank = (x, y, w, h, c, grain) => {
			let s =
				R(x, y, w, h, c) +
				R(x + 4, y + 4, w - 8, Math.max(3, h * 0.16), lt(c, 0.18), N);
			if (grain !== false)
				for (let i = 0; i < Math.max(1, w / 140); i++) {
					const gx = x + 20 + r() * (w - 60),
						gy = y + h * (0.35 + r() * 0.4);
					s += P(
						`M${f1(gx)} ${f1(gy)} q30 -8 60 0`,
						"none",
						`stroke="${dk(c, 0.22)}" stroke-width="3" stroke-linecap="round"`,
					);
				}
			return s;
		};

		const plaque = (x, y, txt, sz) => {
			sz = sz || 34;
			const w = Math.round(txt.length * sz * 0.62 + 44),
				h = sz + 26;
			const shape =
				K.wall === "cave"
					? P(
							`M${x - w / 2} ${y - h / 2 + 4} Q${x} ${y - h / 2 - 8} ${x + w / 2} ${y - h / 2 + 4} L${x + w / 2 - 6} ${y + h / 2} Q${x} ${y + h / 2 + 8} ${x - w / 2 + 6} ${y + h / 2} Z`,
							T.sign,
							S(6),
						)
					: RR(
							x - w / 2,
							y - h / 2,
							w,
							h,
							K.wall === "paper" || K.wall === "velvet" ? h / 2 : 8,
							T.sign,
							K.wall === "velvet"
								? `stroke="${T.acc2}" stroke-width="5"`
								: S(6),
						);
			return (
				shape +
				(K.wall === "paper" || K.wall === "velvet"
					? ""
					: C(x - w / 2 + 14, y, 4, T.signTx, N) +
						C(x + w / 2 - 14, y, 4, T.signTx, N)) +
				TX(x, y + 2, sz, T.signTx, txt)
			);
		};
		const nail = (x, y) => C(x, y, 5, dk(T.metal, 0.2), S(2.5));
		let bg = "",
			fg = "";

		function wallTex(x0, y0, x1, y1, base) {
			let s = R(x0, y0, x1 - x0, y1 - y0, base, N);
			const W = x1 - x0,
				Hh = y1 - y0;
			switch (K.wall) {
				case "plaster":
					for (let i = 0; i < (W * Hh) / 90000; i++)
						s += E(
							x0 + r() * W,
							y0 + r() * Hh,
							50 + r() * 120,
							24 + r() * 50,
							r() < 0.5 ? lt(base, 0.25) : dk(base, 0.05),
							'stroke="none" opacity=".55"',
						);
					for (let i = 0; i < W / 900; i++) {
						const bx = x0 + 80 + r() * (W - 300),
							by = y0 + 60 + r() * (Hh - 240);
						for (let j = 0; j < 3; j++)
							for (let q = 0; q < 2 + (j % 2); q++)
								s += R(
									bx + q * 58 + (j % 2) * 28,
									by + j * 30,
									54,
									26,
									j % 2 ? "#c87a52" : "#b8693e",
									S(3),
								);
					}
					break;
				case "paper":
					for (let x = x0; x < x1; x += 120)
						s += R(x, y0, 60, Hh, lt(base, 0.35), N);
					for (let y = y0 + 70, row = 0; y < y1 - 30; y += 150, row++)
						for (let x = x0 + 40 + (row % 2) * 60; x < x1; x += 240) {
							const c = dk(base, 0.09);
							s +=
								E(x, y + 12, 14, 11, c, N) +
								C(x - 14, y - 6, 5, c, N) +
								C(x - 4, y - 12, 5, c, N) +
								C(x + 7, y - 12, 5, c, N) +
								C(x + 16, y - 5, 5, c, N);
						}
					break;
				case "bamboo":
					for (let x = x0, i = 0; x < x1; x += 66, i++) {
						const c =
							i % 3 === 0
								? dk(base, 0.08)
								: i % 3 === 1
									? base
									: lt(base, 0.08);
						s +=
							R(x, y0, 64, Hh, c, S(3)) + R(x + 8, y0, 10, Hh, lt(c, 0.25), N);
						for (let y = y0 + ((i * 53) % 140) + 40; y < y1; y += 170)
							s +=
								L(x + 2, y, x + 62, y, 6, dk(c, 0.35)) +
								L(x + 6, y + 6, x + 58, y + 6, 3, lt(c, 0.3));
					}
					break;
				case "check":
					for (let y = y0; y < y1; y += 100)
						s += R(x0, y, W, 50, T.acc2, 'stroke="none" opacity=".1"');
					for (let x = x0; x < x1; x += 100)
						s += R(x, y0, 50, Hh, T.acc2, 'stroke="none" opacity=".1"');
					for (let y = y0 + 50, row = 0; y < y1; y += 200, row++)
						for (let x = x0 + 50 + (row % 2) * 200; x < x1; x += 400)
							s +=
								C(x, y, 9, T.acc, 'stroke="none" opacity=".35"') +
								C(x, y, 4, "#fff", N);
					break;
				case "velvet":
					for (let x = x0; x < x1; x += 150)
						s +=
							R(x, y0, 75, Hh, dk(base, 0.18), N) +
							L(x, y0, x, y1, 3, T.acc2, 0.35);
					for (let y = y0 + 60, row = 0; y < y1; y += 120, row++)
						for (let x = x0 + (row % 2) * 75 + 37; x < x1; x += 150)
							s += P(
								`M${x} ${y - 14} l12 14 l-12 14 l-12 -14 z`,
								T.acc2,
								'stroke="none" opacity=".4"',
							);
					break;
				case "rock": {
					for (let y = y0, row = 0; y < y1; row++) {
						const h = 110 + r() * 50;
						let x = x0 - (row % 2) * 90;
						while (x < x1) {
							const w = 160 + r() * 140,
								j = () => (r() - 0.5) * 18;
							s += `<polygon points="${f1(x + 8 + j())},${f1(y + 8 + j())} ${f1(x + w - 8 + j())},${f1(y + 8 + j())} ${f1(x + w - 6 + j())},${f1(Math.min(y + h, y1) - 8 + j())} ${f1(x + 10 + j())},${f1(Math.min(y + h, y1) - 6 + j())}" fill="${r() < 0.5 ? base : lt(base, 0.06)}" stroke="${dk(base, 0.5)}" stroke-width="6" stroke-linejoin="round"/>`;
							x += w;
						}
						y += h;
					}
					for (let i = 0; i < W / 600; i++) {
						let px = x0 + r() * W,
							py = y0 + 40 + r() * (Hh - 80),
							d = `M${f1(px)} ${f1(py)}`;
						for (let q = 0; q < 4; q++) {
							px += 30 + r() * 50;
							py += (r() - 0.5) * 80;
							d += ` L${f1(px)} ${f1(py)}`;
						}
						s +=
							P(
								d,
								"none",
								`stroke="${T.acc}" stroke-width="16" stroke-linecap="round" opacity=".15"`,
							) +
							P(
								d,
								"none",
								`stroke="${T.acc}" stroke-width="5" stroke-linecap="round" opacity=".8"`,
							);
					}
					break;
				}
				case "cave":
					for (let i = 0; i < (W * Hh) / 60000; i++)
						s += E(
							x0 + r() * W,
							y0 + r() * Hh,
							60 + r() * 160,
							40 + r() * 90,
							r() < 0.5 ? lt(base, 0.12) : dk(base, 0.07),
							'stroke="none" opacity=".7"',
						);
					for (let i = 0; i < (W * Hh) / 9000; i++)
						s += C(
							x0 + r() * W,
							y0 + r() * Hh,
							3 + r() * 4,
							dk(base, 0.3),
							'stroke="none" opacity=".45"',
						);
					break;
			}
			return s;
		}
		function wainscot(x0, x1, y0, y1) {
			const h = y1 - y0;
			let s = "";
			switch (K.wall) {
				case "plaster":
					s +=
						R(x0, y0, x1 - x0, h, T.wallD, N) +
						L(x0, y0, x1, y0, 7) +
						R(x0, y0 + 6, x1 - x0, 14, T.acc2, N);
					for (let x = x0 + 10; x < x1; x += 90)
						s += P(
							`M${x} ${y0 + Math.min(110, h - 20)} h70 v-56 h-50 v34 h28 v-14`,
							"none",
							`stroke="#f2d9a6" stroke-width="7" stroke-linejoin="miter"`,
						);
					break;
				case "bamboo":
					s += R(x0, y0, x1 - x0, h, T.wallD, N) + L(x0, y0, x1, y0, 7);
					for (let x = x0 - h; x < x1; x += 34)
						s +=
							L(x, y1, x + h, y0, 4, dk(T.wallD, 0.25)) +
							L(x + h, y1, x, y0, 4, lt(T.wallD, 0.15));
					break;
				case "rock":
					s += R(x0, y0, x1 - x0, h, "#2a2a30", N) + L(x0, y0, x1, y0, 7);
					for (let x = x0; x < x1; x += 200)
						s +=
							R(x + 6, y0 + 10, 188, h - 20, "#3a3a42", S(4)) +
							nail(x + 20, y0 + 24) +
							nail(x + 180, y0 + 24) +
							nail(x + 20, y1 - 24) +
							nail(x + 180, y1 - 24);
					break;
				case "cave":
					for (let x = x0; x < x1; x += 70 + r() * 40)
						s += E(
							x,
							y1 - 24,
							50 + r() * 30,
							24 + r() * 26,
							r() < 0.5 ? T.stone : T.stoneD,
							S(5),
						);
					break;
				default: {
					const c = T.wallD;
					s +=
						R(x0, y0, x1 - x0, h, c, N) +
						L(x0, y0, x1, y0, 7) +
						R(x0, y0 + 4, x1 - x0, 12, lt(c, 0.2), N);
					for (let x = x0 + 20; x < x1 - 40; x += 230)
						s += RR(
							x,
							y0 + 30,
							200,
							h - 50,
							6,
							sty === "42brothers" ? dk(c, 0.1) : lt(c, 0.08),
							sty === "42brothers"
								? `stroke="${T.acc2}" stroke-width="3"`
								: `stroke="${dk(c, 0.25)}" stroke-width="4"`,
						);
				}
			}
			return s;
		}
		function beamH(x, y, w, h) {
			switch (K.beam) {
				case "bamboo": {
					let s =
						RR(x, y, w, h, h / 2, T.beamL) +
						R(x, y + 6, w, h * 0.25, lt(T.beamL, 0.25), N);
					for (let q = x + 100; q < x + w; q += 160)
						s += L(q, y + 3, q, y + h - 3, 6, dk(T.beamL, 0.35));
					return s;
				}
				case "gold":
					return (
						R(x, y, w, h, T.beam) +
						R(x, y + 4, w, 8, T.acc2, N) +
						R(x, y + h - 12, w, 8, T.acc2, N)
					);
				case "iron": {
					let s = R(x, y, w, h, "#2a2a30") + R(x, y + 4, w, 6, "#4a4a54", N);
					for (let q = x + 30; q < x + w; q += 90) s += nail(q, y + h / 2);
					return s;
				}
				case "log":
					return (
						RR(x, y, w, h, h / 2, T.beamL) +
						P(
							`M${x + 20} ${f1(y + h * 0.35)} H${x + w - 20}`,
							"none",
							`stroke="${dk(T.beamL, 0.3)}" stroke-width="4" stroke-dasharray="40 30"`,
						)
					);
				default:
					return (
						plank(x, y, w, h, T.beam) +
						nail(x + 24, y + h / 2) +
						nail(x + w - 24, y + h / 2)
					);
			}
		}
		function post(x, y0, y1, w) {
			const h = y1 - y0;
			switch (K.beam) {
				case "bamboo": {
					let s =
						RR(x - w / 2, y0, w, h, w / 2, T.beamL) +
						R(x - w / 2 + 6, y0, 8, h, lt(T.beamL, 0.3), N);
					for (let y = y0 + 120; y < y1; y += 200)
						s += L(x - w / 2 + 3, y, x + w / 2 - 3, y, 6, dk(T.beamL, 0.35));
					s += P(
						`M${x - w / 2 - 6} ${y0 + 30} l${w + 12} 16 M${x - w / 2 - 6} ${y0 + 46} l${w + 12} 16`,
						"none",
						`stroke="#c8a870" stroke-width="7" stroke-linecap="round"`,
					);
					return s;
				}
				case "gold":
					return (
						R(x - w / 2, y0, w, h, T.beam) +
						R(x - w / 2 + 6, y0, 6, h, T.acc2, N) +
						R(x + w / 2 - 12, y0, 6, h, T.acc2, N) +
						R(x - w / 2 - 8, y1 - 40, w + 16, 40, T.acc2)
					);
				case "iron": {
					let s =
						R(x - w / 2, y0, w, h, "#2a2a30") +
						R(x - w / 2 + 5, y0, 6, h, "#4a4a54", N);
					for (let y = y0 + 40; y < y1; y += 120) s += nail(x, y);
					return s;
				}
				case "log":
					return (
						RR(x - w / 2, y0, w, h, w / 2, T.beamL) +
						P(
							`M${x - 6} ${y0 + 40} V${y1 - 40}`,
							"none",
							`stroke="${dk(T.beamL, 0.3)}" stroke-width="4" stroke-dasharray="50 40"`,
						)
					);
				default: {
					let s =
						R(x - w / 2, y0, w, h, T.beamL) +
						R(x - w / 2 + 5, y0, 7, h, lt(T.beamL, 0.2), N);
					for (let y = y0 + 80; y < y1; y += 260)
						s += P(
							`M${x - 8} ${y} q8 30 0 60`,
							"none",
							`stroke="${dk(T.beamL, 0.25)}" stroke-width="3"`,
						);
					return s + R(x - w / 2 - 6, y1 - 24, w + 12, 24, T.beam);
				}
			}
		}
		function slab(x0, x1, y, h) {
			let s = "";
			switch (K.floor) {
				case "carpet":
					s +=
						R(x0, y, x1 - x0, h, T.floor) +
						R(x0, y, x1 - x0, 16, T.acc, N) +
						L(x0, y + 16, x1, y + 16, 3, T.acc2) +
						L(x0, y + 4, x1, y + 4, 3, T.acc2);
					for (let x = x0 + 60; x < x1; x += 200)
						s += L(x, y + 24, x, y + h - 4, 3, dk(T.floor, 0.4));
					break;
				case "lava":
					s += R(x0, y, x1 - x0, h, T.floor);
					for (let x = x0, i = 0; x < x1; x += 170 + (i++ % 3) * 30)
						s +=
							L(x, y + 4, x + 10, y + h - 2, 18, T.acc, 0.18) +
							L(x, y + 4, x + 10, y + h - 2, 7, T.acc, 0.85);
					s += L(x0, y + 3, x1, y + 3, 4, dk(T.floor, 0.5));
					break;
				case "stone":
					s += R(x0, y, x1 - x0, h, T.floor);
					for (let x = x0, i = 0; x < x1; x += 110 + (i++ % 4) * 20)
						s += L(
							x,
							y + 6,
							x + (i % 2 ? 8 : -6),
							y + h - 4,
							5,
							dk(T.floor, 0.35),
						);
					s += R(x0, y, x1 - x0, 10, lt(T.floor, 0.18), N);
					break;
				default:
					s +=
						R(x0, y, x1 - x0, h, T.floor) +
						R(x0, y, x1 - x0, 10, lt(T.floor, 0.22), N);
					for (let x = x0 + 30, i = 0; x < x1; x += 150, i++) {
						s +=
							L(x, y + 12, x, y + h - 2, 4, dk(T.floor, 0.35)) +
							nail(x + 14, y + 22) +
							nail(x + 14, y + h - 14);
						if (i % 2)
							s += P(
								`M${x + 40} ${f1(y + h * 0.55)} q30 -6 60 0`,
								"none",
								`stroke="${dk(T.floor, 0.25)}" stroke-width="3"`,
							);
					}
			}
			return s;
		}
		function win(x, y, w, h) {
			let s = "";
			const sky = T.sky,
				frame =
					K.win === "bars" ? "#2a2a30" : K.win === "hole" ? T.stoneD : T.beamL;
			if (K.win === "hole") {
				s += P(
					`M${x} ${y + h} Q${x - 10} ${y + 20} ${x + w / 2} ${y} Q${x + w + 10} ${y + 20} ${x + w} ${y + h} Z`,
					sky,
					S(10),
				);
				s +=
					C(x + w * 0.62, y + h * 0.35, 18, MOON, N) +
					C(x + w * 0.3, y + h * 0.5, 5, MOON, N);
				return (
					s +
					P(
						`M${x - 10} ${y + h} Q${x - 20} ${y + 10} ${x + w / 2} ${y - 14} Q${x + w + 20} ${y + 10} ${x + w + 10} ${y + h}`,
						"none",
						`stroke="${T.stoneD}" stroke-width="22" stroke-linecap="round"`,
					)
				);
			}
			s += R(x - 12, y - 12, w + 24, h + 24, frame) + R(x, y, w, h, sky, S(4));
			s +=
				C(
					x + w * 0.66,
					y + h * 0.3,
					Math.min(w, h) * 0.12,
					K.win === "bars" ? "#ff8a5a" : MOON,
					N,
				) +
				C(x + w * 0.25, y + h * 0.6, 4, MOON, N) +
				C(x + w * 0.4, y + h * 0.25, 3, MOON, N);
			if (K.win === "bars") {
				for (let q = x + w / 5; q < x + w - 2; q += w / 5)
					s += L(q, y, q, y + h, 8, "#2a2a30");
				s += L(x, y + h / 2, x + w, y + h / 2, 8, "#2a2a30");
			} else
				s +=
					L(x + w / 2, y, x + w / 2, y + h, 7, frame) +
					L(x, y + h / 2, x + w, y + h / 2, 7, frame);
			s += R(x - 22, y + h + 6, w + 44, 20, lt(frame, 0.1));
			const cur = (cx, dir, col, pat) => {
				let c = P(
					`M${cx} ${y - 24} H${f1(cx + dir * w * 0.36)} Q${f1(cx + dir * w * 0.2)} ${f1(y + h * 0.5)} ${f1(cx + dir * w * 0.3)} ${y + h + 4} H${cx} Z`,
					col,
					S(5),
				);
				if (pat === "dots")
					for (let i = 0; i < 6; i++)
						c += C(
							cx + dir * (14 + (i % 2) * 26),
							y + 10 + (i * h) / 6,
							6,
							"#fff",
							N,
						);
				if (pat === "check")
					for (let i = 0; i < 4; i++)
						c += L(
							cx + dir * 6,
							y + (i * h) / 4 + 10,
							cx + dir * w * 0.28,
							y + (i * h) / 4 + 10,
							6,
							"#fff",
							0.6,
						);
				return c;
			};
			if (K.win === "drape")
				s +=
					cur(x - 16, 1, T.acc) +
					cur(x + w + 16, -1, T.acc) +
					L(x - 40, y - 26, x + w + 40, y - 26, 8, T.metal);
			if (K.win === "polka")
				s += cur(x - 16, 1, T.acc, "dots") + cur(x + w + 16, -1, T.acc, "dots");
			if (K.win === "gingham")
				s +=
					cur(x - 16, 1, T.cush, "check") +
					cur(x + w + 16, -1, T.cush, "check");
			if (K.win === "velvet")
				s +=
					cur(x - 16, 1, T.cush) +
					cur(x + w + 16, -1, T.cush) +
					C(x + w * 0.2, y + h * 0.6, 10, T.acc2) +
					C(x + w * 0.8, y + h * 0.6, 10, T.acc2) +
					L(x - 40, y - 26, x + w + 40, y - 26, 10, T.acc2);
			if (K.win === "leaves")
				for (let i = 0; i < 5; i++)
					s += P(
						`M${f1(x + (i * w) / 4)} ${y - 20} q${20 - i * 8} ${40 + i * 10} ${-10 + i * 6} ${80 + (i % 2) * 30}`,
						"none",
						`stroke="${T.acc2}" stroke-width="14" stroke-linecap="round"`,
					);
			return s;
		}

		function lamp(x, y) {
			const holder = (c) =>
				R(x - 15, y + 34, 30, 56, c || T.metal, S(5)) +
				C(x, y + 50, 4, k, N) +
				C(x, y + 76, 4, k, N) +
				L(x, y + 34, x, y + 18, 8, c || T.metal);
			const s = pool(x, y - 10, 130);
			switch (K.lamp) {
				case "oil":
					return (
						s +
						holder() +
						P(
							`M${x - 36} ${y + 2} Q${x - 30} ${y + 22} ${x} ${y + 22} Q${x + 30} ${y + 22} ${x + 36} ${y + 2} Z`,
							T.metal,
						) +
						E(x, y + 2, 36, 7, lt(T.metal, 0.2)) +
						flame(x, y - 2, 0.8)
					);
				case "lantern":
					return (
						s +
						holder() +
						R(x - 30, y + 8, 60, 12, T.metal) +
						R(x - 22, y - 52, 44, 60, "#fff3c4", S(5)) +
						L(x - 8, y - 52, x - 8, y + 8, 3, T.metal) +
						L(x + 8, y - 52, x + 8, y + 8, 3, T.metal) +
						R(x - 5, y - 16, 10, 22, "#fff", S(3)) +
						flame(x, y - 16, 0.45) +
						P(
							`M${x - 30} ${y - 52} L${x} ${y - 80} L${x + 30} ${y - 52} Z`,
							T.metal,
						) +
						C(x, y - 88, 8, "none", S(5))
					);
				case "tiki":
					return (
						s +
						holder(T.beamL) +
						RR(x - 10, y - 30, 20, 50, 6, T.beamL) +
						P(
							`M${x - 24} ${y - 30} H${x + 24} L${x + 18} ${y + 4} H${x - 18} Z`,
							"#c8a870",
						) +
						L(x - 20, y - 18, x + 20, y - 18, 4, "#8a6a3a") +
						L(x - 19, y - 6, x + 19, y - 6, 4, "#8a6a3a") +
						flame(x, y - 30, 1.1)
					);
				case "gold":
					return (
						s +
						holder(T.acc2) +
						P(
							`M${x - 44} ${y - 4} Q${x - 44} ${y + 22} ${x} ${y + 22} Q${x + 44} ${y + 22} ${x + 44} ${y - 4}`,
							"none",
							`stroke="${T.acc2}" stroke-width="9" stroke-linecap="round"`,
						) +
						E(x - 44, y - 6, 14, 5, T.acc2) +
						E(x + 44, y - 6, 14, 5, T.acc2) +
						R(x - 51, y - 40, 14, 34, "#fff", S(4)) +
						R(x + 37, y - 40, 14, 34, "#fff", S(4)) +
						flame(x - 44, y - 40, 0.55) +
						flame(x + 44, y - 40, 0.55) +
						C(x, y + 22, 9, T.acc2)
					);
				case "skull":
					return (
						s +
						holder("#3a3a42") +
						R(x - 28, y + 8, 56, 12, "#3a3a42") +
						P(
							`M${x - 24} ${y + 8} Q${x - 26} ${y - 34} ${x} ${y - 34} Q${x + 26} ${y - 34} ${x + 24} ${y + 8} Z`,
							"#e8d8c0",
						) +
						C(x - 9, y - 12, 6, k, N) +
						C(x + 9, y - 12, 6, k, N) +
						R(x - 6, y - 60, 12, 26, "#c03a2a", S(4)) +
						flame(x, y - 60, 0.6)
					);
				case "torch":
					return (
						s +
						R(x - 22, y + 8, 44, 14, "#5a5a62") +
						R(x - 15, y + 22, 30, 60, "#5a5a62", S(5)) +
						P(
							`M${x - 9} ${y + 70} L${x - 12} ${y - 20} H${x + 12} L${x + 9} ${y + 70} Z`,
							T.beamL,
						) +
						P(
							`M${x - 18} ${y - 20} H${x + 18} L${x + 14} ${y + 4} H${x - 14} Z`,
							"#8a6a4a",
						) +
						flame(x, y - 20, 1.2)
					);
			}
			return s;
		}
		function shelfItem(x, base, i) {
			const c = BOTTLES[(i * 5) % BOTTLES.length];
			switch (K.shelf) {
				case "amphora": {
					const col = i % 2 ? "#c8693e" : "#d88a52";
					return (
						P(`M${x} ${base} q-14 -40 0 -76 h22 q14 36 0 76 z`, col, S(4)) +
						R(x + 2, base - 92, 18, 18, col, S(4)) +
						P(
							`M${x - 2} ${base - 70} q-12 -4 -6 -20 M${x + 24} ${base - 70} q12 -4 6 -20`,
							"none",
							S(4),
						) +
						L(x - 4, base - 40, x + 26, base - 40, 3, "#2b1d18", 0.4)
					);
				}
				case "milk":
					return i % 3 === 2
						? P(`M${x - 4} ${base} h32 v-40 h-32 z`, "#9fd8e8", S(4)) +
								P(`M${x} ${base - 20} l10 -6 l10 6 l-10 6 z`, T.acc, N)
						: R(x, base - 70, 26, 70, "#fff", S(4)) +
								R(x + 4, base - 90, 18, 22, "#fff", S(4)) +
								R(x + 3, base - 96, 20, 10, T.acc2, S(3)) +
								R(x, base - 36, 26, 16, T.acc, N);
				case "coconut":
					return i % 2
						? E(x + 13, base - 26, 24, 26, "#7a5228") +
								P(`M${x - 6} ${base - 30} q20 -10 40 0`, "none", S(3)) +
								C(x + 8, base - 40, 3, k, N) +
								C(x + 18, base - 40, 3, k, N)
						: P(
								`M${x} ${base} q-6 -50 6 -70 q4 -30 14 -30 q10 0 14 30 q12 20 6 70 z`,
								"#ffd23f",
								S(4),
							);
				case "jar":
					return (
						R(x - 4, base - 66, 34, 66, i % 2 ? "#a8d48a" : "#ffb07a", S(4)) +
						R(x - 6, base - 76, 38, 12, T.cush, S(4)) +
						(i % 2
							? E(x + 8, base - 30, 6, 14, "#5aa83a", N) +
								E(x + 18, base - 40, 6, 14, "#5aa83a", N)
							: C(x + 13, base - 30, 9, "#ff6a3a", N))
					);
				case "champagne":
					return (
						P(
							`M${x} ${base} v-58 q0 -14 8 -20 v-24 h10 v24 q8 6 8 20 v58 z`,
							"#1e4a2a",
							S(4),
						) +
						R(x + 6, base - 104, 14, 16, T.acc2, S(3)) +
						R(x + 2, base - 46, 22, 20, T.acc2, N)
					);
				case "potion":
					return (
						C(x + 13, base - 28, 26, c, S(4)) +
						R(x + 6, base - 72, 14, 22, c, S(4)) +
						C(x + 13, base - 28, 12, lt(c, 0.5), 'stroke="none" opacity=".7"') +
						R(x + 4, base - 80, 18, 10, "#6a4a2a", S(3))
					);
				case "stonejar":
					return (
						P(
							`M${x - 6} ${base} q-6 -40 6 -60 h20 q12 20 6 60 z`,
							i % 2 ? "#a8784a" : "#8a7a6a",
							S(4),
						) +
						P(
							`M${x - 2} ${base - 30} h26`,
							"none",
							`stroke="${k}" stroke-width="3" stroke-dasharray="6 6"`,
						)
					);
			}
			return "";
		}
		function mug(x, y, i) {
			switch (K.mug) {
				case "glass":
					return (
						P(`M${x} ${y} h44 l-22 28 z`, "#ffe3f0", S(4)) +
						L(x + 22, y + 28, x + 22, y + 54, 4) +
						L(x + 10, y + 56, x + 34, y + 56, 4) +
						C(x + 30, y + 8, 5, T.acc, N)
					);
				case "skull":
					return (
						P(
							`M${x} ${y + 56} V${y + 18} Q${x} ${y} ${x + 22} ${y} Q${x + 44} ${y} ${x + 44} ${y + 18} V${y + 56} Z`,
							"#e8d8c0",
							S(4),
						) +
						C(x + 14, y + 22, 5, k, N) +
						C(x + 30, y + 22, 5, k, N)
					);
				case "horn":
					return (
						P(`M${x} ${y} q40 10 44 56 q-30 -6 -44 -56 z`, "#e8dcc0", S(4)) +
						L(x + 6, y + 10, x + 30, y + 20, 3, "#8a7452")
					);
				case "coco":
					return (
						E(x + 22, y + 30, 22, 24, "#7a5228", S(4)) +
						P(`M${x} ${y + 22} q22 -10 44 0`, "none", S(3))
					);
				case "fish":
					return (
						R(x, y, 44, 56, i % 2 ? "#fff" : "#ffe0e6", S(4)) +
						P(`M${x + 44} ${y + 12} q20 0 20 16 q0 16 -20 16`, "none", S(4)) +
						P(
							`M${x + 10} ${y + 28} l14 -8 v16 z M${x + 24} ${y + 28} h8`,
							T.acc,
							N,
						)
					);
				default:
					return (
						R(x, y, 44, 56, i % 2 ? "#e0c89a" : "#c9ccd6", S(5)) +
						R(x - 2, y + 18, 48, 6, dk(T.metal, 0.1), N) +
						P(`M${x + 44} ${y + 10} q20 0 20 18 q0 18 -20 18`, "none", S(5))
					);
			}
		}
		function stool(x) {
			const sh = SH(x, 1640, 60);
			switch (K.stool) {
				case "cushion":
					return (
						sh +
						L(x - 30, 1596, x - 40, 1640, 8) +
						L(x + 30, 1596, x + 40, 1640, 8) +
						E(x, 1590, 52, 12, T.beamL) +
						E(x, 1576, 46, 14, T.cush) +
						C(x, 1574, 4, "#fff", N)
					);
				case "barrel":
					return (
						sh +
						RR(x - 40, 1570, 80, 70, 18, T.beamL) +
						L(x - 40, 1590, x + 40, 1590, 5, T.metal) +
						L(x - 40, 1620, x + 40, 1620, 5, T.metal)
					);
				case "check":
					return (
						sh +
						L(x - 30, 1596, x - 40, 1640, 8) +
						L(x + 30, 1596, x + 40, 1640, 8) +
						E(x, 1588, 52, 14, T.cush) +
						L(x - 30, 1588, x + 30, 1588, 4, "#fff", 0.7)
					);
				case "chrome":
					return (
						sh +
						L(x, 1596, x, 1636, 8, "#c9ccd6") +
						E(x, 1638, 34, 6, "#c9ccd6", S(4)) +
						E(x, 1584, 50, 16, T.cush) +
						E(x, 1580, 30, 6, lt(T.cush, 0.25), N)
					);
				case "bone":
					return (
						sh +
						L(x - 30, 1596, x - 40, 1636, 10, "#e8d8c0") +
						L(x + 30, 1596, x + 40, 1636, 10, "#e8d8c0") +
						C(x - 40, 1636, 8, "#e8d8c0", S(3)) +
						C(x + 40, 1636, 8, "#e8d8c0", S(3)) +
						E(x, 1588, 52, 13, "#3a2a2a")
					);
				case "stump":
					return (
						sh +
						RR(x - 40, 1580, 80, 60, 10, T.beamL) +
						E(x, 1580, 40, 10, "#c8a878") +
						E(
							x,
							1580,
							22,
							5,
							"none",
							`stroke="${dk("#c8a878", 0.3)}" stroke-width="3"`,
						)
					);
				default:
					return (
						sh +
						L(x - 30, 1596, x - 40, 1640, 8) +
						L(x + 30, 1596, x + 40, 1640, 8) +
						L(x - 34, 1622, x + 34, 1622, 5, T.beam) +
						E(x, 1588, 52, 14, T.beamL)
					);
			}
		}
		function table(x0, x1, y, round) {
			const top = T.top,
				w = x1 - x0,
				cx = (x0 + x1) / 2;
			let s = SH(cx, 1640, w * 0.48);
			switch (K.table) {
				case "slab":
					return (
						s +
						E(x0 + 40, 1610, 40, 30, T.stoneD) +
						E(x1 - 40, 1610, 40, 30, T.stoneD) +
						P(
							`M${x0} ${y + 6} Q${cx} ${y - 10} ${x1} ${y + 4} L${x1 - 10} ${y + 30} Q${cx} ${y + 40} ${x0 + 8} ${y + 30} Z`,
							top,
						)
					);
				case "iron":
					return (
						s +
						L(x0 + 30, y + 24, x0 + 30, 1640, 12, "#2a2a30") +
						L(x1 - 30, y + 24, x1 - 30, 1640, 12, "#2a2a30") +
						L(x0 + 30, 1600, x1 - 30, 1600, 8, "#2a2a30") +
						R(x0, y, w, 26, top) +
						nail(x0 + 16, y + 13) +
						nail(x1 - 16, y + 13)
					);
				case "gold":
					s += round
						? R(cx - 14, y + 20, 28, 1640 - y - 24, T.acc2) +
							E(cx, 1636, w * 0.22, 10, T.acc2)
						: L(x0 + 30, y + 24, x0 + 30, 1640, 10, T.acc2) +
							L(x1 - 30, y + 24, x1 - 30, 1640, 10, T.acc2);
					return (
						s +
						(round
							? E(cx, y + 2, w / 2, 22, top) +
								E(
									cx,
									y - 2,
									w / 2 - 10,
									14,
									lt(top, 0.1),
									`stroke="${T.acc2}" stroke-width="4"`,
								)
							: R(x0, y, w, 24, top) + L(x0, y + 4, x1, y + 4, 4, T.acc2))
					);
				default:
					if (round)
						return (
							s +
							R(cx - 16, y + 20, 32, 1640 - y - 26, T.beam) +
							E(cx, 1634, w * 0.24, 12, T.beam) +
							E(cx, y + 2, w / 2, 22, top) +
							E(cx, y - 4, w / 2 - 16, 10, lt(top, 0.15), N)
						);
					return (
						s +
						R(x0 + 18, y + 24, 22, 1640 - y - 24, T.beam) +
						R(x1 - 40, y + 24, 22, 1640 - y - 24, T.beam) +
						R(x0 + 18, 1600, w - 36, 10, T.beam, S(4)) +
						plank(x0, y, w, 24, top, false)
					);
			}
		}
		function door(cx, yb, w, h) {
			const x0 = cx - w / 2,
				x1 = cx + w / 2,
				yt = yb - h;
			let s = "";
			switch (K.door) {
				case "hide": {
					const arc = `M${x0 - 30} ${yb} Q${x0 - 40} ${yt + 10} ${cx} ${yt - 30} Q${x1 + 40} ${yt + 10} ${x1 + 30} ${yb}`;
					s +=
						P(
							arc,
							"none",
							`stroke="${k}" stroke-width="48" stroke-linecap="round"`,
						) +
						P(
							arc,
							"none",
							`stroke="${T.stoneD}" stroke-width="36" stroke-linecap="round"`,
						);
					s += P(
						`M${x0} ${yt + 30} Q${cx} ${yt + 6} ${x1} ${yt + 30} L${x1 + 4} ${yb} Q${f1(x1 - w * 0.25)} ${yb - 20} ${cx} ${yb} Q${f1(x0 + w * 0.25)} ${yb - 20} ${x0 - 4} ${yb} Z`,
						T.cush,
					);
					for (let q = x0 + 20; q < x1; q += 30)
						s += P(
							`M${q} ${yt + 40} q6 ${f1(h * 0.3)} -4 ${f1(h * 0.6)}`,
							"none",
							`stroke="${dk(T.cush, 0.25)}" stroke-width="4" stroke-linecap="round"`,
						);
					return s + L(x0 - 6, yt + 26, x1 + 6, yt + 26, 12, T.beamL);
				}
				case "iron":
					s +=
						R(x0 - 18, yt - 18, w + 36, h + 18, "#1a1a20") +
						P(
							`M${x0} ${yb} V${yt + 40} Q${cx} ${yt - 10} ${x1} ${yt + 40} V${yb} Z`,
							"#3a3a44",
						);
					for (let y = yt + 60; y < yb; y += 70)
						s +=
							L(x0 + 4, y, x1 - 4, y, 6, "#2a2a30") +
							nail(x0 + 16, y) +
							nail(x1 - 16, y);
					return (
						s +
						R(cx - 34, yt + 44, 68, 24, T.acc, 'stroke="none" opacity=".25"') +
						R(
							cx - 30,
							yt + 50,
							60,
							12,
							T.acc,
							`stroke="${k}" stroke-width="4"`,
						) +
						C(x1 - 24, yb - h * 0.45, 9, T.acc, S(4))
					);
				case "padded":
					s +=
						R(x0 - 18, yt - 18, w + 36, h + 18, T.acc2) +
						R(x0, yt, w, h, T.cush);
					for (let y = yt + 30, row = 0; y < yb - 10; y += 50, row++)
						for (let x = x0 + 22 + (row % 2) * 24; x < x1 - 10; x += 48)
							s += C(x, y, 6, T.acc2, S(2));
					return s + C(x1 - 24, yb - h * 0.45, 10, T.acc2, S(4));
				case "bamboo":
					s += R(x0 - 14, yt - 14, w + 28, h + 14, T.beamL);
					for (let x = x0; x < x1 - 2; x += w / 5)
						s +=
							RR(x, yt, w / 5, h, 10, T.beamL, S(4)) +
							L(x + 6, yt + 10, x + 6, yb - 10, 4, lt(T.beamL, 0.3));
					return (
						s +
						L(x0, yt + h * 0.3, x1, yt + h * 0.3, 8, "#c8a870") +
						L(x0, yt + h * 0.7, x1, yt + h * 0.7, 8, "#c8a870")
					);
				case "round":
					s += P(
						`M${x0 - 16} ${yb} V${yt + w / 2} A${w / 2 + 16} ${w / 2 + 16} 0 0 1 ${x1 + 16} ${yt + w / 2} V${yb} Z`,
						T.stoneD,
					);
					s += P(
						`M${x0} ${yb} V${yt + w / 2} A${w / 2} ${w / 2} 0 0 1 ${x1} ${yt + w / 2} V${yb} Z`,
						T.beam,
					);
					for (let x = x0 + w / 4; x < x1 - 2; x += w / 4)
						s += L(x, yt + 30, x, yb - 4, 4, T.beamL);
					s +=
						C(cx, yt + w / 2, w * 0.18, T.sky, S(5)) +
						L(cx, yt + w / 2 - w * 0.18, cx, yt + w / 2 + w * 0.18, 4) +
						L(cx - w * 0.18, yt + w / 2, cx + w * 0.18, yt + w / 2, 4);
					return (
						s +
						E(x1 - 26, yb - h * 0.42, 12, 10, T.acc2, S(4)) +
						C(x1 - 32, yb - h * 0.42 - 12, 4, T.acc2, N) +
						C(x1 - 20, yb - h * 0.42 - 12, 4, T.acc2, N)
					);
				default: {
					s +=
						P(
							`M${x0 - 18} ${yb} V${yt + 66} Q${cx} ${yt - 44} ${x1 + 18} ${yt + 66} V${yb} Z`,
							K.door === "studded" ? T.stone : T.beamL,
						) +
						P(
							`M${x0} ${yb} V${yt + 70} Q${cx} ${yt - 20} ${x1} ${yt + 70} V${yb} Z`,
							T.beam,
						);
					for (let x = x0 + w / 4; x < x1 - 2; x += w / 4)
						s += L(x, yt + 20, x, yb - 4, 4, T.beamL);
					if (K.door === "studded") {
						for (const y of [yt + 90, yb - 60]) {
							s += R(x0 + 4, y - 10, w - 8, 20, "#4a4a52", S(4));
							for (let x = x0 + 20; x < x1 - 10; x += 34)
								s += C(x, y, 4, "#9a9aa2", N);
						}
					} else
						s += P(
							`M${cx - 18} ${yt + 70} q18 -24 36 0 q-18 24 -36 0`,
							T.acc,
							S(4),
						);
					return s + C(x1 - 22, yb - h * 0.45, 10, T.metal, S(4));
				}
			}
		}

		bg += wallTex(0, 0, TV_W, 1640, T.wall);
		bg += wallTex(0, 0, GAL_X, 700, T.up);
		bg += wainscot(0, TV_W, 1470, 1640) + wainscot(0, GAL_X, 560, 700);
		bg += R(0, 1700, TV_W, 540, T.cellar, N);
		for (let y = 1700, row = 0; y < 2240; y += 90, row++)
			for (let x = (row % 2) * 90 - 90; x < TV_W; x += 180)
				bg +=
					R(
						x + 4,
						y + 4,
						172,
						82,
						r() < 0.5 ? T.cellar : lt(T.cellar, 0.06),
						`stroke="${dk(T.cellar, 0.35)}" stroke-width="5"`,
					) + R(x + 10, y + 8, 160, 8, lt(T.cellar, 0.12), N);
		for (const ax of [1560, 2660, 3460])
			bg += P(
				`M${ax - 40} 2240 V1820 Q${ax + 60} 1700 ${ax + 160} 1820 V2240`,
				"none",
				`stroke="${dk(T.cellar, 0.4)}" stroke-width="18"`,
			);
		bg +=
			P(
				"M0 1700 L130 1700 Q60 1750 0 1830 M0 1760 Q40 1730 90 1700",
				"none",
				`stroke="${lt(T.cellar, 0.4)}" stroke-width="3"`,
			) +
			P(
				`M${TV_W} 1700 L${TV_W - 150} 1700 Q${TV_W - 60} 1760 ${TV_W} 1850`,
				"none",
				`stroke="${lt(T.cellar, 0.4)}" stroke-width="3"`,
			);
		bg += beamH(-10, -10, TV_W + 20, 60) + beamH(-10, 760, GAL_X + 10, 44);
		bg += win(3740, 260, 320, 460);
		bg += L(3600, 50, 3600, 300, 6, sty === "42brothers" ? T.acc2 : k);
		if (sty === "42brothers") {
			bg += C(3600, 360, 70, "#d8d8e8", S(5));
			for (let a = 0; a < 6; a++)
				for (let b = 0; b < 4; b++)
					bg += R(
						3546 + a * 18,
						316 + b * 22,
						14,
						18,
						b % 2 === a % 2 ? "#fff" : "#a8a8c8",
						N,
					);
			bg += pool(3600, 360, 260, 0.1);
		} else if (sty === "ugabugi" || sty === "cherts") {
			bg += P(
				"M3460 330 Q3600 400 3740 330",
				"none",
				`stroke="${sty === "cherts" ? "#2a2a30" : T.beamL}" stroke-width="14"`,
			);
			for (const dx of [-100, 0, 100])
				bg +=
					(sty === "cherts"
						? C(3600 + dx, 380, 26, "#e8d8c0") +
							C(3592 + dx, 376, 5, k, N) +
							C(3608 + dx, 376, 5, k, N)
						: E(3600 + dx, 380, 30, 16, "#e8dcc0")) +
					flame(3600 + dx, 356, 0.7);
			bg += pool(3600, 360, 240, 0.12);
		} else {
			bg +=
				E(3600, 360, 160, 26, T.metal) +
				E(3600, 354, 120, 10, lt(T.metal, 0.3), N);
			for (const dx of [-120, -60, 0, 60, 120])
				bg +=
					R(3600 + dx - 9, 302, 18, 50, "#fff4dc", S(4)) +
					flame(3600 + dx, 302, 0.6);
			bg += pool(3600, 330, 260, 0.12);
		}
		for (const x of [590, 1520, 1940, 2790]) bg += post(x, 800, 1640, 46);
		for (const x of [1240, 2310]) bg += post(x, 50, 700, 40);
		bg += post(GAL_X, 0, 1640, 60);
		bg +=
			slab(-10, GAL_X + 10, 700, 60) +
			slab(-10, TV_W + 10, 1640, 60) +
			slab(-10, TV_W + 10, 2240, 70);

		bg += H(
			"exit",
			door(180, 1640, 180, 320) +
				plaque(180, 1226, "Выход") +
				R(95, 1612, 170, 28, GLOW, 'stroke="none" opacity=".3"'),
		);
		{
			let s =
				R(326, 1186, 238, 258, T.beam) +
				R(342, 1202, 206, 226, "#c8935a", S(4));
			for (let i = 0; i < 40; i++)
				s += C(350 + r() * 190, 1210 + r() * 210, 2.5, "#a8743a", N);
			const notes = [
				[360, 1220, 74, 86, "#fff8e0", -6],
				[446, 1214, 86, 72, "#ffe9a8", 5],
				[366, 1320, 80, 88, "#ffd6cc", 4],
				[458, 1300, 74, 98, "#e8f4ff", -4],
			];
			for (const [x, y, w, h, f, a] of notes)
				s += `<g transform="rotate(${a} ${x + w / 2} ${y + h / 2})">${R(x, y, w, h, f, S(4))}${R(x + 3, y + h - 14, w - 6, 11, dk(f, 0.06), N)}${L(x + 12, y + 26, x + w - 12, y + 26, 3, "#8a6a4a")}${L(x + 12, y + 42, x + w - 22, y + 42, 3, "#8a6a4a")}${L(x + 12, y + 58, x + w - 30, y + 58, 3, "#8a6a4a")}${C(x + w / 2, y + 8, 7, T.acc, S(3))}</g>`;
			s +=
				P("M500 1420 l30 -60 l14 6 l-30 60 z", "#c9ccd6", S(4)) +
				R(488, 1416, 24, 16, T.beam, S(3)) +
				plaque(445, 1166, "Доска слухов", 30);
			bg += H("rum", s);
		}
		{
			let s = "";
			if (sty === "42brothers")
				s +=
					R(
						640,
						880,
						640,
						160,
						"#3a2a4a",
						`stroke="${T.acc2}" stroke-width="8"`,
					) +
					L(700, 910, 760, 1010, 6, "#fff", 0.3) +
					L(740, 910, 800, 1010, 4, "#fff", 0.2);
			s +=
				plank(640, 1180, 640, 18, T.beamL, false) +
				plank(640, 1320, 640, 18, T.beamL, false);
			for (const x of [650, 1250])
				s += P(
					`M${x} 1198 l0 30 l20 -30 z M${x} 1338 l0 30 l20 -30 z`,
					T.beam,
					S(4),
				);
			for (let i = 0; i < 14; i++) s += shelfItem(660 + i * 44, 1180, i);
			for (let i = 0; i < 9; i++)
				s +=
					L(692 + i * 66, 1236, 692 + i * 66, 1252, 4) +
					mug(670 + i * 66, 1252, i);
			for (let i = 0; i < 3; i++)
				s +=
					RR(690 + i * 120, 1400, 90, 90, 22, T.beamL) +
					L(690 + i * 120, 1420, 780 + i * 120, 1420, 5, T.metal) +
					L(690 + i * 120, 1470, 780 + i * 120, 1470, 5, T.metal) +
					C(735 + i * 120, 1445, 10, T.beam, S(4));
			s +=
				L(780, 800, 780, 1040, 5, T.metal) +
				L(1140, 800, 1140, 1040, 5, T.metal);
			if (sty === "42brothers")
				s +=
					RR(
						690,
						1030,
						540,
						110,
						50,
						"#1d1226",
						`stroke="${T.acc}" stroke-width="10"`,
					) +
					TX(
						960,
						1086,
						52,
						"none",
						T.name,
						`stroke="${T.acc}" stroke-width="5"`,
					) +
					TX(960, 1086, 52, "#ffe3f0", T.name);
			else if (sty === "ugabugi")
				s +=
					P(
						"M690 1050 Q960 1010 1230 1050 L1220 1140 Q960 1160 700 1140 Z",
						T.stone,
						S(8),
					) + TX(960, 1094, 46, k, T.name);
			else if (sty === "cherts")
				s +=
					P(
						"M700 1040 L1220 1040 L1200 1140 L960 1130 L720 1140 Z",
						T.sign,
						S(8),
					) +
					R(720, 1050, 480, 80, T.acc, 'stroke="none" opacity=".12"') +
					TX(960, 1090, 50, T.signTx, T.name);
			else
				s +=
					R(700, 1040, 520, 100, T.sign, S(8)) +
					R(
						714,
						1052,
						492,
						76,
						"none",
						`stroke="${T.signTx}" stroke-width="3" opacity=".5"`,
					) +
					TX(960, 1092, sty === "veggies" ? 40 : 52, T.signTx, T.name);
			bg += H("bar", s);
			let f =
				R(600, 1490, 720, 32, T.beamL) +
				R(604, 1494, 712, 8, lt(T.beamL, 0.25), N) +
				R(620, 1522, 680, 118, T.beam);
			for (let x = 640; x < 1290; x += 110)
				f += RR(
					x,
					1534,
					90,
					82,
					6,
					sty === "42brothers" ? T.cush : lt(T.beam, 0.08),
					sty === "42brothers"
						? `stroke="${T.acc2}" stroke-width="4"`
						: `stroke="${dk(T.beam, 0.3)}" stroke-width="4"`,
				);
			f +=
				L(610, 1626, 1310, 1626, 8, T.metal) +
				E(690, 1452, 46, 36, T.beamL) +
				L(670, 1420, 670, 1486, 4, T.metal) +
				L(710, 1420, 710, 1486, 4, T.metal) +
				R(732, 1446, 28, 12, T.metal, S(4));
			[1060, 1100, 1140].forEach((x, i) => {
				f +=
					L(x, 1490, x, 1440, 8, T.metal) +
					RR(x - 8, 1420, 16, 28, 6, [T.acc, T.acc2, T.cush][i], S(3));
			});
			f +=
				mug(840, 1434, 0) +
				mug(920, 1434, 1) +
				R(1200, 1434, 44, 56, "#ffcf3f", S(5)) +
				R(1198, 1452, 48, 6, "#c8963a", N) +
				P("M1244 1444 q20 0 20 18 q0 18 -20 18", "none", S(5)) +
				P(
					"M1222 1458 l4 8 l9 1 l-7 6 l2 9 l-8 -5 l-8 5 l2 -9 l-7 -6 l9 -1 z",
					"#fff8e0",
					N,
				);
			fg += H("bar", f);
		}
		bg += SH(960, 1640, 380);
		{
			let s =
				R(1366, 1640, 108, 60, "#1a100c", S(5)) +
				P("M1474 1640 l70 -110 l14 8 l-62 102 z", T.beamL);
			s +=
				L(1392, 1600, 1392, 2240, 10, T.beamL) +
				L(1448, 1600, 1448, 2240, 10, T.beamL);
			for (let y = 1660; y < 2240; y += 70)
				s += L(1392, y, 1448, y, 8, T.beamL);
			bg +=
				H("hatch", plaque(1420, 1460, "Подвал ↓", 28)) +
				H("ladder", plaque(1290, 1960, "Наверх ↑", 28)) +
				H("hatch ladder", s);
		}
		{
			let s = "";
			if (K.hearth === "campfire") {
				for (let i = 0; i < 7; i++)
					s += E(1990 + i * 54, 1622, 30, 22, i % 2 ? T.stone : T.stoneD, S(5));
				s +=
					L(2070, 1610, 2230, 1580, 18, "#6a4a2a") +
					L(2230, 1610, 2070, 1580, 18, "#7a5a3a") +
					flame(2150, 1600, 2.6) +
					pool(2150, 1540, 220, 0.16);
				s +=
					L(2040, 1640, 2080, 1380, 10, T.beamL) +
					L(2260, 1640, 2220, 1380, 10, T.beamL) +
					L(2060, 1420, 2240, 1420, 8, T.beamL) +
					P("M2120 1420 l0 60 M2180 1420 l0 50", "none", S(4)) +
					E(2120, 1500, 30, 18, "#8a3a2a") +
					E(2180, 1484, 20, 14, "#c8a878");
			} else if (K.hearth === "cauldron") {
				s +=
					R(1980, 1220, 340, 420, T.stoneD) +
					P("M2030 1640 V1420 Q2150 1330 2270 1420 V1640 Z", "#1a0a08");
				s +=
					flame(2150, 1640, 2.2) +
					P("M2070 1500 h160 q10 90 -80 100 q-90 -10 -80 -100 z", "#2a2a30") +
					E(2150, 1500, 80, 14, T.acc2) +
					C(2120, 1494, 8, "#fff3b0", N) +
					C(2180, 1498, 6, "#fff3b0", N);
				s +=
					L(2060, 1440, 2240, 1440, 8, "#2a2a30") +
					L(2150, 1440, 2150, 1486, 6, "#2a2a30") +
					pool(2150, 1560, 230, 0.2);
				for (let i = 0; i < 4; i++)
					s +=
						C(2000 + i * 100, 1236, 22, "#e8d8c0") +
						C(1993 + i * 100, 1234, 5, k, N) +
						C(2007 + i * 100, 1234, 5, k, N);
			} else {
				const marble = K.hearth === "marble";
				const st = marble ? "#e8d8e8" : T.stone,
					stD = marble ? "#c8b8d0" : T.stoneD;
				s += R(2060, 800, 180, 440, stD) + R(1980, 1240, 340, 400, st);
				if (!marble)
					for (let y = 1250, row = 0; y < 1636; y += 64, row++)
						for (let x = 1984 + (row % 2) * 40; x < 2316; x += 80)
							s += R(
								x,
								y,
								Math.min(76, 2316 - x),
								Math.min(60, 1636 - y),
								r() < 0.5 ? st : lt(st, 0.08),
								`stroke="${dk(st, 0.25)}" stroke-width="4"`,
							);
				else
					s +=
						P(
							"M2000 1300 q60 40 30 120 M2280 1280 q-50 60 -20 140",
							"none",
							`stroke="${dk(st, 0.2)}" stroke-width="4"`,
						) +
						R(
							1980,
							1240,
							340,
							400,
							"none",
							`stroke="${T.acc2}" stroke-width="8"`,
						);
				s +=
					P("M2050 1640 V1500 Q2150 1410 2250 1500 V1640 Z", "#2a1410") +
					P(
						"M2070 1640 V1510 Q2150 1440 2230 1510",
						"none",
						'stroke="#000" stroke-width="10" opacity=".3"',
					);
				s +=
					R(2080, 1604, 140, 24, "#7a4a2c", S(5)) +
					R(2096, 1584, 112, 22, "#9a6238", S(5)) +
					L(2080, 1640, 2090, 1590, 6, "#3a3a42") +
					L(2220, 1640, 2210, 1590, 6, "#3a3a42");
				s +=
					flame(2120, 1600, 1.6) +
					flame(2175, 1600, 2.1) +
					C(2110, 1630, 5, "#ffcf3f", N) +
					C(2190, 1626, 4, "#ffcf3f", N);
				s +=
					L(2240, 1520, 2260, 1460, 5, "#3a3a42") +
					E(2150, 1450, 34, 24, "#3a3a42") +
					L(2150, 1380, 2150, 1426, 4) +
					P("M2184 1440 l20 -10", "none", S(4));
				s +=
					R(1960, 1222, 380, 28, marble ? T.acc2 : T.beamL) +
					pool(2150, 1560, 200, 0.14);
			}
			bg += H("fire", s + plaque(2150, 1010, "Камин", 30));
		}
		for (const [x, y] of [
			[590, 1100],
			[1520, 1100],
			[1940, 1100],
			[2790, 1100],
			[GAL_X, 1100],
			[1240, 330],
			[2310, 330],
			[800, 1950],
			[2706, 1890],
		])
			bg += lamp(x, y);
		{
			const n = 16,
				x0 = 4300,
				y0 = 1640,
				x1 = 3360,
				y1 = 700,
				dx = (x0 - x1) / n,
				dy = (y0 - y1) / n;
			const wood = K.beam === "iron" ? "#3a3a42" : T.beamL,
				rail = K.beam === "gold" ? T.acc2 : T.beam;
			let pts = `${x0 + 20},${y0}`;
			for (let i = 0; i < n; i++) {
				const x = x0 - i * dx,
					y = y0 - (i + 1) * dy;
				pts += ` ${f1(x + 20)},${f1(y)} ${f1(x - dx + 20)},${f1(y)}`;
			}
			pts += ` ${GAL_X + 30},${y1} ${GAL_X + 30},${y1 + 60} ${x0 - 70},${y0}`;
			let s =
				`<polygon points="${pts}" fill="${dk(wood, 0.1)}" ${S(6)}/>` +
				R(
					GAL_X + 30,
					y1,
					x1 - GAL_X - 10 + dx,
					12,
					sty === "42brothers" ? T.acc : lt(wood, 0.2),
					S(3),
				);
			for (let i = 0; i < n; i++) {
				const x = x0 - i * dx,
					y = y0 - (i + 1) * dy;
				s += R(
					x - dx + 20,
					y,
					dx,
					12,
					sty === "42brothers" ? T.acc : lt(wood, 0.2),
					S(3),
				);
			}
			for (let i = 0; i < n; i += 2) {
				const x = x0 - i * dx - dx / 2,
					y = y0 - (i + 1) * dy;
				s += L(x, y, x, y - 190, 8, rail) + C(x, y - 100, 7, rail, N);
			}
			s +=
				L(x0 + 10, y0 - 210, x1 + 10, y1 - 190, 14, rail) +
				R(x0 - 8, y0 - 236, 36, 236, T.beam) +
				C(x0 + 10, y0 - 246, 20, K.beam === "gold" ? T.acc2 : T.beamL);
			bg +=
				H("up down2", s) +
				H("up", plaque(4190, 1350, "Наверх ↑", 30)) +
				H("down2", plaque(3440, 610, "Вниз ↓", 28));
		}

		[400, 950, 1500, 2050].forEach((cx, i) => {
			let s = door(cx, 700, 184, 290);
			s +=
				C(cx, 340, 30, i === 2 ? T.acc : T.sign, S(5)) +
				TX(cx, 342, 34, i === 2 ? "#fff" : T.signTx, String(i + 1));
			if (i < 2)
				s +=
					R(cx + 20, 560, 50, 30, "#fff8e0", S(3)) +
					L(cx + 45, 540, cx + 45, 560, 3);
			if (i === 2) s += plaque(cx, 270, "Твоя комната", 26);
			bg += H(`room${i + 1}`, s);
		});
		for (const x of [675, 1225, 1775]) bg += win(x - 60, 420, 120, 140);
		{
			let s =
				plank(2480, 610, 320, 24, T.beamL) +
				L(2500, 634, 2500, 700, 8) +
				L(2780, 634, 2780, 700, 8) +
				plank(2480, 520, 320, 20, T.beamL) +
				L(2490, 540, 2490, 610, 6) +
				L(2790, 540, 2790, 610, 6) +
				RR(2530, 580, 80, 30, 12, T.cush) +
				RR(2650, 580, 80, 30, 12, T.acc2);
			s +=
				P(
					"M2980 700 L2960 610 H3100 L3080 700 Z",
					sty === "ugabugi" ? T.stoneD : T.acc,
				) +
				P(
					"M3030 610 Q2980 520 3000 460 Q3040 520 3030 610 Q3070 500 3110 480 Q3080 560 3030 610",
					T.acc2,
				) +
				P("M3030 610 Q3020 540 3060 500", "none", S(4));
			s += L(2380, 600, GAL_X - 30, 600, 12, T.beam);
			for (let x = 2400; x < GAL_X - 30; x += 60)
				s += L(x, 604, x, 698, 7, T.beam) + C(x, 650, 6, T.beam, N);
			bg += H("gal", s + plaque(2860, 460, "Галерея", 30));
		}

		{
			let s = R(330, 1880, 360, 360, T.stone) + R(470, 1700, 80, 180, T.stoneD);
			for (let y = 1890, row = 0; y < 2236; y += 60, row++)
				for (let x = 334 + (row % 2) * 40; x < 686; x += 80)
					s += R(
						x,
						y,
						Math.min(76, 686 - x),
						Math.min(56, 2236 - y),
						lt(T.stone, r() * 0.1),
						`stroke="${dk(T.stone, 0.25)}" stroke-width="4"`,
					);
			s +=
				P("M410 2240 V2100 Q510 2020 610 2100 V2240 Z", "#2a1410") +
				flame(480, 2236, 1.6) +
				flame(540, 2236, 1.3) +
				pool(510, 2160, 180, 0.16);
			s += L(760, 1760, 1240, 1760, 10, T.beam);
			for (const [x, rr] of [
				[820, 40],
				[940, 52],
				[1080, 36],
				[1190, 44],
			])
				s +=
					L(x, 1760, x, 1800, 4) +
					`<path d="M${x - rr} 1800 h${2 * rr} a${rr} ${rr} 0 0 1 -${2 * rr} 0z" fill="#4a4a56" ${S(5)}/>` +
					P(
						`M${x - rr + 8} 1806 h${rr}`,
						"none",
						'stroke="#fff" stroke-width="4" opacity=".3"',
					);
			s +=
				plank(780, 2110, 440, 30, T.beamL) +
				L(800, 2140, 800, 2240, 10) +
				L(1200, 2140, 1200, 2240, 10);
			s +=
				E(880, 2090, 60, 26, "#d8a05a") +
				P("M850 2080 q30 -14 60 0", "none", S(3)) +
				P("M980 2110 L1060 2060 L1080 2110 Z", "#ffd24a") +
				C(1030, 2098, 6, "#e8b830", N) +
				E(1150, 2096, 44, 16, "#c0503a") +
				R(1100, 2060, 30, 50, "#e8e8f0", S(4));
			s +=
				P("M1250 2240 Q1240 2120 1300 2110 Q1350 2120 1340 2240 Z", "#c8a878") +
				P("M1270 2120 l20 16 l20 -16", "none", S(4));
			bg += H("kitchen", s + plaque(870, 1990, "Кухня", 30));
		}
		{
			let s = "";
			const barrel = (x, y, rad) =>
				C(x, y, rad, T.beamL) +
				C(x, y, rad * 0.68, "none", `stroke="${T.metal}" stroke-width="8"`) +
				C(x, y, rad * 0.68, "none", S(3)) +
				C(x, y, rad * 0.18, T.beam, S(4)) +
				L(x - rad * 0.9, y, x - rad * 0.7, y, 4) +
				L(x + rad * 0.7, y, x + rad * 0.9, y, 4) +
				R(x - 10, y + rad * 0.45, 20, 20, T.metal, S(3));
			for (let i = 0; i < 4; i++) s += barrel(1700 + i * 230, 2125, 105);
			for (let i = 0; i < 3; i++) s += barrel(1815 + i * 230, 1940, 90);
			s += plank(1590, 2228, 920, 12, T.beam, false);
			s +=
				L(2706, 1700, 2706, 2240, 10, T.beam) +
				L(3314, 1700, 3314, 2240, 10, T.beam);
			for (const y of [1780, 1960, 2140]) {
				s += plank(2700, y, 620, 18, T.beamL, false);
				for (let i = 0; i < 12; i++) s += shelfItem(2716 + i * 50, y, i + y);
			}
			for (let i = 0; i < 3; i++) {
				const x = 3500 + i * 240;
				s +=
					R(x, 1980, 200, 260, T.beamL) +
					R(x + 8, 1988, 184, 10, lt(T.beamL, 0.2), N) +
					L(x, 1980, x + 200, 2240, 7, T.beam) +
					L(x + 200, 1980, x, 2240, 7, T.beam);
			}
			const sackCol =
				sty === "monkeys"
					? "#ffd23f"
					: sty === "veggies"
						? T.acc
						: sty === "cats"
							? "#9fd8e8"
							: "#c8a878";
			s +=
				P("M4180 2240 Q4170 2130 4230 2120 Q4290 2130 4280 2240 Z", "#c8a878") +
				E(4250, 2210, 70, 30, "#ffd24a") +
				E(4250, 2170, 60, 24, "#ffe07a") +
				C(3600, 1956, 26, sackCol, S(4)) +
				C(3644, 1952, 22, sackCol, S(4)) +
				C(3840, 1954, 24, sackCol, S(4));

			s +=
				P("M3350 2240 V2050 Q3410 1990 3470 2050 V2240 Z", dk(T.beam, 0.25)) +
				L(3380, 2040, 3380, 2236, 3, T.beamL) +
				L(3410, 2020, 3410, 2236, 3, T.beamL) +
				L(3440, 2040, 3440, 2236, 3, T.beamL);
			s +=
				P(
					"M3350 2120 Q3410 2150 3470 2110",
					"none",
					'stroke="#8a8a92" stroke-width="7" stroke-dasharray="10 6"',
				) +
				RR(3396, 2120, 28, 30, 4, "#c8963a", S(4)) +
				P("M3402 2120 v-10 q8 -12 16 0 v10", "none", S(4));
			s += P(
				"M3350 2050 L3390 2050 M3350 2050 L3380 2080 M3350 2050 L3352 2090 M3362 2050 Q3366 2066 3352 2070",
				"none",
				`stroke="${lt(T.cellar, 0.45)}" stroke-width="2"`,
			);
			bg += H("cellar", s + plaque(2120, 1770, "Погреб", 30));
		}

		bg += decor(T, sty, { R, RR, C, E, P, L, TX, S, N, flame, pool, lt, dk });

		for (const x of [1650, 1820, 2470, 2690, 3090, 3300, 3520, 3960]) {
			const c =
				K.table === "iron"
					? "#2a2a30"
					: K.table === "slab"
						? T.stoneD
						: T.beamL;
			if (K.stool === "stump")
				bg += E(x, 1560, 70, 70, c, S(6)) + E(x, 1540, 50, 46, lt(c, 0.1), N);
			else
				bg +=
					R(x - 60, 1400, 14, 240, c) +
					R(x + 46, 1400, 14, 240, c) +
					RR(
						x - 66,
						1390,
						132,
						26,
						10,
						K.stool === "chrome" || K.stool === "cushion" || K.stool === "check"
							? T.cush
							: c,
					) +
					R(x - 50, 1430, 100, 12, c, S(4)) +
					R(x - 50, 1470, 100, 12, c, S(4));
		}

		const hang = (x, y, txt, id) =>
			H(
				id,
				L(x - 60, y - 120, x - 60, y - 30, 4, T.metal) +
					L(x + 60, y - 120, x + 60, y - 30, 4, T.metal) +
					plaque(x, y, txt, 30),
			);
		bg +=
			hang(1730, 1250, "Кости", "dice") +
			hang(2995, 1250, "Стол силачей", "arm") +
			hang(3630, 1250, "Гвинт", "gw");

		bg +=
			C(2450, 250, 56, "#fff8e8", S(7)) +
			C(2450, 250, 46, "none", `stroke="${T.beamL}" stroke-width="4"`) +
			L(2450, 250, 2450, 214, 6) +
			L(2450, 250, 2476, 262, 5) +
			TX(2450, 282, 18, "#c0304a", "LIVE") +
			C(2428, 282, 4, "#e0304a", N) +
			C(2450, 250, 5, k, N);
		bg +=
			RR(110, 1915, 110, 90, 10, T.stoneD, S(5)) +
			TX(165, 1962, 54, lt(T.stoneD, 0.6), "F");
		bg +=
			L(287, 1170, 287, 1190, 5, T.metal) +
			L(270, 1170, 300, 1170, 6, T.metal) +
			P("M268 1226 Q268 1190 287 1188 Q306 1190 306 1226 Z", T.acc2) +
			C(287, 1230, 6, T.metal);
		bg += `<g transform="rotate(-32 1395 1220)">${R(1388, 1170, 14, 130, T.beamL)}${RR(1350, 1150, 92, 46, 6, "#6a6a72")}${TX(1396, 1174, 24, "#fff", "БАН", 'style="font-family:Russo One"')}</g>`;
		if (sty === "monkeys")
			bg += P(
				"M2340 1640 q10 -22 26 -14 q16 -12 28 8 q-12 -6 -18 4 q-10 -10 -22 2 z",
				"#ffd23f",
				S(4),
			);
		if (sty === "veggies")
			bg += `<g id="tv-pumpface">${P("M2116 1150 l14 -18 l14 18 z M2158 1150 l14 -18 l14 18 z", "#ffcf3f", S(3))}${P("M2112 1180 q38 20 76 0 l-8 12 l-10 -6 l-10 8 l-10 -8 l-10 8 l-10 -8 l-10 6 z", "#ffcf3f", S(3))}</g>`;

		fg += stool(760) + stool(1010) + stool(1220);
		{
			let s = table(1550, 1910, 1558, true);
			s +=
				R(1650, 1522, 30, 30, "#fff", S(4)) +
				C(1665, 1537, 4, k, N) +
				R(1700, 1526, 30, 30, "#fff", S(4)) +
				C(1708, 1534, 4, k, N) +
				C(1722, 1548, 4, k, N);
			s +=
				P("M1780 1554 L1790 1500 H1840 L1850 1554 Z", T.beam) +
				E(1815, 1500, 25, 6, dk(T.beam, 0.3)) +
				E(1890, 1550, 22, 8, "#e8b030") +
				E(1890, 1542, 18, 7, "#ffd24a");
			fg += H("dice", s);
		}
		fg +=
			table(2380, 2780, 1560) +
			mug(2440, 1504, 0) +
			E(2580, 1554, 54, 12, "#fff8e8") +
			E(2580, 1544, 34, 10, "#c0503a") +
			mug(2680, 1504, 1);
		{
			let s = table(2830, 3160, 1552);
			s +=
				E(2930, 1548, 36, 9, T.acc) +
				E(3060, 1548, 36, 9, T.acc) +
				L(2995, 1504, 2995, 1550, 4) +
				C(2995, 1500, 8, T.acc2, S(3));
			s +=
				RR(
					3100,
					1460,
					54,
					86,
					6,
					"#2a2a30",
					`stroke="${T.beamL}" stroke-width="6"`,
				) +
				L(3112, 1480, 3142, 1480, 3, "#fff", 0.7) +
				L(3112, 1494, 3136, 1494, 3, "#fff", 0.7) +
				L(3112, 1508, 3140, 1508, 3, "#fff", 0.7);
			fg += H("arm", s);
		}
		{
			let s = "";
			for (const x0 of [3230, 3670]) {
				s +=
					table(x0, x0 + 360, 1560) +
					RR(x0 + 20, 1550, 320, 14, 4, T.cloth, S(4)) +
					R(x0 + 30, 1554, 300, 4, lt(T.cloth, 0.2), N);
				s +=
					R(x0 + 168, 1498, 22, 54, "#fff4dc", S(4)) +
					P(
						`M${x0 + 170} 1510 q4 10 0 18`,
						"none",
						'stroke="#fff" stroke-width="3"',
					) +
					flame(x0 + 179, 1498, 0.6);
				if (x0 === 3230)
					for (let i = 0; i < 5; i++)
						s +=
							R(
								x0 + 50 + i * 22,
								1538,
								34,
								14,
								i % 2 ? "#fff8e0" : T.acc2,
								S(3),
							) + R(x0 + 230 + i * 18, 1538, 30, 14, "#fff8e0", S(3));
				else
					s +=
						R(x0 + 80, 1536, 60, 16, T.acc, S(3)) +
						R(x0 + 230, 1536, 60, 16, T.acc, S(3)) +
						E(x0 + 300, 1548, 16, 5, "#e8b030");
			}
			fg += H("gw", s);
		}
		return { bg, fg };
	}

	function decor(T, sty, h) {
		const { R, RR, C, E, P, L, TX, S, N, flame, lt, dk } = h,
			k = T.ink;
		const A = [470, 1010],
			Cc = [2580, 1100],
			D = [2700, 330],
			B = [2150, 1222];
		const frame = (x, y, w, hh, inner) =>
			R(x - 12, y - 12, w + 24, hh + 24, T.beamL) +
			R(x, y, w, hh, "#fff8e8", S(4)) +
			inner;
		const bone = (x1, y1, x2, y2, w) =>
			L(x1, y1, x2, y2, w + 12) +
			L(x1, y1, x2, y2, w, "#f3ead8") +
			C(x1, y1 - w * 0.4, w * 0.55, "#f3ead8") +
			C(x1, y1 + w * 0.4, w * 0.55, "#f3ead8") +
			C(x2, y2 - w * 0.4, w * 0.55, "#f3ead8") +
			C(x2, y2 + w * 0.4, w * 0.55, "#f3ead8");
		switch (sty) {
			case "legion":
				return (
					C(A[0], A[1], 74, T.acc) +
					C(A[0], A[1], 54, "none", `stroke="${T.acc2}" stroke-width="6"`) +
					C(A[0], A[1], 22, T.acc2) +
					L(A[0] - 116, A[1] + 94, A[0] + 116, A[1] - 94, 9, T.beam) +
					L(A[0] - 116, A[1] - 94, A[0] + 116, A[1] + 94, 9, T.beam) +
					P(
						`M${A[0] + 116} ${A[1] - 94} l14 -30 l6 34 z M${A[0] - 116} ${A[1] - 94} l-14 -30 l-6 34 z`,
						"#c9ccd6",
						S(4),
					) +
					P(
						`M${Cc[0] - 76} 880 H${Cc[0] + 76} V1230 L${Cc[0]} 1186 L${Cc[0] - 76} 1230 Z`,
						T.acc,
					) +
					L(Cc[0] - 90, 880, Cc[0] + 90, 880, 12, T.metal) +
					C(Cc[0], 980, 38, "none", `stroke="${T.acc2}" stroke-width="10"`) +
					P(
						`M${Cc[0] - 30} 980 q30 -40 60 0`,
						"none",
						`stroke="${T.acc2}" stroke-width="6"`,
					) +
					TX(Cc[0], 1082, 40, T.acc2, "LEGIO") +
					L(Cc[0] - 50, 1120, Cc[0] + 50, 1120, 5, T.acc2) +
					frame(
						D[0] - 110,
						D[1] - 110,
						220,
						200,
						C(
							D[0],
							D[1] - 10,
							70,
							"none",
							`stroke="${T.acc2}" stroke-width="14"`,
						) +
							P(
								`M${D[0] - 40} ${D[1] + 30} q40 -60 80 0`,
								"none",
								`stroke="${T.acc}" stroke-width="10"`,
							),
					) +
					P(
						`M${B[0] - 52} ${B[1]} Q${B[0] - 52} ${B[1] - 92} ${B[0]} ${B[1] - 92} Q${B[0] + 52} ${B[1] - 92} ${B[0] + 52} ${B[1]} Z`,
						"#c9ccd6",
					) +
					R(B[0] - 8, B[1] - 70, 16, 70, dk("#c9ccd6", 0.2), N) +
					P(
						`M${B[0] - 12} ${B[1] - 92} Q${B[0]} ${B[1] - 166} ${B[0] + 74} ${B[1] - 134}`,
						"none",
						`stroke="${T.acc}" stroke-width="22" stroke-linecap="round"`,
					) +
					P("M1250 2240 q-14 -50 0 -90 h26 q14 40 0 90 z", "#c8693e") +
					P("M3420 1640 q-16 -60 0 -110 h30 q16 50 0 110 z", "#d88a52") +
					R(3424, 1516, 22, 16, "#d88a52", S(4))
				);
			case "cats":
				return (
					P(
						`M${A[0] - 104} ${A[1]} L${A[0] + 62} ${A[1]} L${A[0] + 104} ${A[1] - 44} L${A[0] + 104} ${A[1] + 44} L${A[0] + 62} ${A[1]}`,
						"#fff4ea",
					) +
					C(A[0] - 74, A[1], 20, "#fff4ea") +
					C(A[0] - 80, A[1] - 6, 5, k, N) +
					[-60, -24, 12, 44]
						.map((d) => L(A[0] + d, A[1] - 32, A[0] + d, A[1] + 32, 6))
						.join("") +
					frame(
						Cc[0] - 120,
						900,
						240,
						260,
						P(
							`M${Cc[0] - 74} 1130 V996 L${Cc[0] - 52} 940 L${Cc[0] - 20} 984 H${Cc[0] + 20} L${Cc[0] + 52} 940 L${Cc[0] + 74} 996 V1130 Z`,
							"#ffb27a",
						) +
							C(Cc[0] - 26, 1034, 9, k, N) +
							C(Cc[0] + 26, 1034, 9, k, N) +
							C(Cc[0] - 23, 1030, 3, "#fff", N) +
							C(Cc[0] + 29, 1030, 3, "#fff", N) +
							P(
								`M${Cc[0] - 10} 1062 L${Cc[0] + 10} 1062 L${Cc[0]} 1074 Z`,
								T.acc,
								N,
							) +
							P(
								`M${Cc[0] - 70} 1062 h40 M${Cc[0] - 70} 1076 h40 M${Cc[0] + 30} 1062 h40 M${Cc[0] + 30} 1076 h40`,
								"none",
								S(3),
							),
					) +
					C(D[0] - 60, D[1] + 50, 50, T.acc) +
					P(
						`M${D[0] - 100} ${D[1] + 40} q40 -30 80 10 M${D[0] - 90} ${D[1] + 70} q40 -30 80 0`,
						"none",
						`stroke="${dk(T.acc, 0.2)}" stroke-width="4"`,
					) +
					C(D[0] + 50, D[1] + 60, 40, T.acc2) +
					P(`M${D[0] - 50} ${D[1] + 40} q60 -80 140 -10`, "none", S(4)) +
					E(B[0], B[1] - 40, 92, 46, "#ffb27a") +
					P(`M${B[0] - 72} ${B[1] - 66} l10 -42 l28 32 Z`, "#ffb27a") +
					P(`M${B[0] - 30} ${B[1] - 80} l14 -38 l22 36 Z`, "#ffb27a") +
					P(
						`M${B[0] - 64} ${B[1] - 46} q12 8 24 0 M${B[0] - 26} ${B[1] - 46} q12 8 24 0`,
						"none",
						S(4),
					) +
					P(
						`M${B[0] + 80} ${B[1] - 30} q50 0 40 -40`,
						"none",
						`stroke="${k}" stroke-width="26" stroke-linecap="round"`,
					) +
					P(
						`M${B[0] + 80} ${B[1] - 30} q50 0 40 -40`,
						"none",
						'stroke="#ffb27a" stroke-width="16" stroke-linecap="round"',
					) +
					P(
						`M${B[0] + 20} ${B[1] - 70} q20 -10 40 0 M${B[0] - 10} ${B[1] - 60} q20 -10 40 0`,
						"none",
						`stroke="${dk("#ffb27a", 0.2)}" stroke-width="5"`,
					) +
					RR(3380, 1500, 140, 140, 20, T.beamL) +
					RR(3400, 1360, 100, 140, 14, T.cush) +
					C(3450, 1360, 40, T.cush) +
					C(3450, 1360, 16, T.beamL) +
					P(
						"M3520 1580 q40 0 30 -40",
						"none",
						`stroke="${T.acc2}" stroke-width="8"`,
					) +
					C(3550, 1540, 14, T.acc2)
				);
			case "monkeys":
				return (
					[0, 1, 2, 3, 4]
						.map((i) =>
							P(
								`M${A[0] - 40 + i * 20} ${A[1] - 70} Q${A[0] - 82 + i * 30} ${A[1] + 10} ${A[0] - 20 + i * 24} ${A[1] + 82} Q${A[0] - 18 + i * 24} ${A[1] + 10} ${A[0] - 30 + i * 20} ${A[1] - 70}`,
								T.acc,
							),
						)
						.join("") +
					L(A[0], A[1] - 130, A[0], A[1] - 70, 6) +
					R(A[0] - 20, A[1] - 80, 40, 14, "#5a8a2a") +
					P(
						`M${Cc[0] - 94} 896 l-30 -50 M${Cc[0] + 94} 896 l30 -50`,
						"none",
						`stroke="${T.acc2}" stroke-width="16" stroke-linecap="round"`,
					) +
					P(
						`M${Cc[0] - 94} 896 H${Cc[0] + 94} V1150 Q${Cc[0]} 1250 ${Cc[0] - 94} 1150 Z`,
						"#8a5a2a",
					) +
					R(Cc[0] - 64, 956, 44, 44, "#fff", S(6)) +
					R(Cc[0] + 20, 956, 44, 44, "#fff", S(6)) +
					R(Cc[0] - 48, 970, 16, 16, k, N) +
					R(Cc[0] + 36, 970, 16, 16, k, N) +
					R(Cc[0] - 54, 1060, 108, 44, "#ffd23f", S(6)) +
					[0, 1, 2, 3]
						.map((i) =>
							L(Cc[0] - 40 + i * 26, 1060, Cc[0] - 40 + i * 26, 1104, 4),
						)
						.join("") +
					P(
						`M${D[0] - 150} ${D[1] + 80} Q${D[0]} ${D[1] - 130} ${D[0] + 150} ${D[1] + 60} Q${D[0]} ${D[1] - 40} ${D[0] - 150} ${D[1] + 80}`,
						T.acc2,
					) +
					P(
						`M${D[0] - 150} ${D[1] - 60} Q${D[0]} ${D[1] + 130} ${D[0] + 150} ${D[1] - 40} Q${D[0]} ${D[1] + 40} ${D[0] - 150} ${D[1] - 60}`,
						lt(T.acc2, 0.15),
					) +
					C(B[0] - 50, B[1] - 40, 40, "#7a5228") +
					C(B[0] + 30, B[1] - 40, 40, "#7a5228") +
					C(B[0] - 10, B[1] - 100, 40, "#7a5228") +
					C(B[0] - 14, B[1] - 108, 5, k, N) +
					C(B[0] - 2, B[1] - 108, 5, k, N) +
					[300, 1300, 2380, 3180]
						.map(
							(x) =>
								P(
									`M${x} 50 q-20 120 10 240 q20 80 -10 160`,
									"none",
									`stroke="${T.acc2}" stroke-width="10" stroke-linecap="round"`,
								) +
								E(x - 10, 200, 26, 12, T.acc2, S(3)) +
								E(x + 12, 330, 26, 12, T.acc2, S(3)),
						)
						.join("") +
					R(3380, 1540, 150, 100, T.beamL) +
					TX(3455, 1590, 24, k, "БАНАНЫ", 'style="font-family:Russo One"') +
					P("M3420 1540 q20 -50 60 -40 q-10 30 -60 40", T.acc)
				);
			case "veggies":
				return (
					L(A[0], A[1] - 150, A[0], A[1] + 90, 5) +
					[0, 1, 2, 3, 4]
						.map(
							(i) =>
								C(
									A[0] + (i % 2 ? 26 : -26),
									A[1] - 100 + i * 46,
									32,
									"#f0d8a0",
								) +
								P(
									`M${A[0] + (i % 2 ? 26 : -26)} ${A[1] - 132 + i * 46} l0 -14`,
									"none",
									`stroke="${T.acc2}" stroke-width="6"`,
								),
						)
						.join("") +
					[-70, -20, 30, 80]
						.map((d, i) => {
							const y = 960 + (i % 2) * 20;
							return (
								L(Cc[0] + d, 860, Cc[0] + d, y, 4) +
								P(
									`M${Cc[0] + d - 22} ${y} L${Cc[0] + d + 22} ${y} L${Cc[0] + d} ${y + 170} Z`,
									i % 2 ? "#e84a3a" : T.acc,
								) +
								P(
									`M${Cc[0] + d} ${y} l-16 -30 M${Cc[0] + d} ${y} l14 -34`,
									"none",
									`stroke="${T.acc2}" stroke-width="8"`,
								)
							);
						})
						.join("") +
					frame(
						D[0] - 110,
						D[1] - 110,
						220,
						210,
						C(D[0], D[1] + 10, 72, "#e8503a") +
							P(
								`M${D[0] - 32} ${D[1] - 56} l32 20 l32 -20 l-32 -14 Z`,
								T.acc2,
							) +
							E(
								D[0] - 26,
								D[1] - 10,
								14,
								8,
								"#fff",
								'stroke="none" opacity=".5"',
							),
					) +
					P(
						`M${B[0] - 92} ${B[1]} Q${B[0] - 102} ${B[1] - 112} ${B[0]} ${B[1] - 112} Q${B[0] + 102} ${B[1] - 112} ${B[0] + 92} ${B[1]} Z`,
						T.acc,
					) +
					P(
						`M${B[0] - 40} ${B[1]} Q${B[0] - 44} ${B[1] - 100} ${B[0]} ${B[1] - 108} M${B[0] + 40} ${B[1]} Q${B[0] + 44} ${B[1] - 100} ${B[0]} ${B[1] - 108}`,
						"none",
						`stroke="${dk(T.acc, 0.2)}" stroke-width="5"`,
					) +
					R(B[0] - 7, B[1] - 142, 14, 36, T.acc2, S(4)) +
					RR(
						1270,
						880,
						210,
						160,
						8,
						"#2f3a2e",
						`stroke="${T.beamL}" stroke-width="12"`,
					) +
					TX(1375, 912, 24, "#fffbea", "Меню дня") +
					L(1300, 950, 1450, 950, 3, "#fffbea", 0.6) +
					L(1300, 980, 1420, 980, 3, "#fffbea", 0.6) +
					L(1300, 1010, 1440, 1010, 3, "#fffbea", 0.6) +
					R(3380, 1560, 160, 80, T.beamL) +
					C(3420, 1550, 26, "#e8503a") +
					C(3470, 1548, 24, "#5aa83a") +
					C(3510, 1552, 22, T.acc)
				);
			case "42brothers":
				return (
					TX(
						A[0],
						A[1],
						156,
						"none",
						"42",
						`stroke="${T.acc}" stroke-width="24" opacity=".22"`,
					) +
					TX(
						A[0],
						A[1],
						156,
						"none",
						"42",
						`stroke="${T.acc}" stroke-width="10"`,
					) +
					TX(
						A[0],
						A[1],
						156,
						"none",
						"42",
						'stroke="#ffe3f0" stroke-width="3"',
					) +
					R(
						Cc[0] - 124,
						886,
						248,
						288,
						"#3a2747",
						`stroke="${T.acc2}" stroke-width="14"`,
					) +
					C(Cc[0], 1000, 56, "#ffd6e6", S(5)) +
					R(Cc[0] - 54, 980, 108, 20, k, N) +
					P(
						`M${Cc[0] - 80} 1174 Q${Cc[0]} 1060 ${Cc[0] + 80} 1174`,
						"#5a3a6a",
						S(5),
					) +
					R(Cc[0] - 40, 1120, 80, 30, T.acc2, N) +
					P(
						`M${D[0]} ${D[1] - 124} L${D[0] + 32} ${D[1] - 32} L${D[0] + 124} ${D[1]} L${D[0] + 32} ${D[1] + 32} L${D[0]} ${D[1] + 124} L${D[0] - 32} ${D[1] + 32} L${D[0] - 124} ${D[1]} L${D[0] - 32} ${D[1] - 32} Z`,
						T.acc2,
					) +
					C(D[0], D[1], 30, "#fff", 'stroke="none" opacity=".6"') +
					P(
						`M${B[0] - 46} ${B[1] - 132} H${B[0] + 46} Q${B[0] + 46} ${B[1] - 60} ${B[0]} ${B[1] - 50} Q${B[0] - 46} ${B[1] - 60} ${B[0] - 46} ${B[1] - 132} Z`,
						T.acc2,
					) +
					L(B[0], B[1] - 50, B[0], B[1] - 10, 10, T.acc2) +
					R(B[0] - 34, B[1] - 14, 68, 14, T.acc2) +
					TX(B[0], B[1] - 96, 30, k, "42") +
					[
						[1400, 900],
						[2950, 330],
					]
						.map(
							([x, y]) =>
								C(x, y, 70, "#111", `stroke="${T.acc2}" stroke-width="10"`) +
								C(x, y, 50, "none", 'stroke="#333" stroke-width="3"') +
								C(x, y, 22, T.acc, S(3)),
						)
						.join("") +
					P("M3360 110 Q3520 300 3360 540 Z", T.cush) +
					P("M4400 110 Q4240 300 4400 540 Z", T.cush) +
					L(3340, 110, 4400, 110, 10, T.acc2) +
					C(3400, 330, 12, T.acc2) +
					C(4360, 330, 12, T.acc2)
				);
			case "cherts":
				return (
					P(
						`M${A[0] - 60} ${A[1] - 52} Q${A[0] - 134} ${A[1] - 82} ${A[0] - 112} ${A[1] - 156} Q${A[0] - 92} ${A[1] - 92} ${A[0] - 40} ${A[1] - 76}`,
						"#e8d8c0",
					) +
					P(
						`M${A[0] + 60} ${A[1] - 52} Q${A[0] + 134} ${A[1] - 82} ${A[0] + 112} ${A[1] - 156} Q${A[0] + 92} ${A[1] - 92} ${A[0] + 40} ${A[1] - 76}`,
						"#e8d8c0",
					) +
					P(
						`M${A[0] - 62} ${A[1]} Q${A[0] - 62} ${A[1] - 82} ${A[0]} ${A[1] - 82} Q${A[0] + 62} ${A[1] - 82} ${A[0] + 62} ${A[1]} L${A[0] + 30} ${A[1] + 52} H${A[0] - 30} Z`,
						"#e8d8c0",
					) +
					C(A[0] - 24, A[1] - 20, 17, k, N) +
					C(A[0] + 24, A[1] - 20, 17, k, N) +
					C(A[0] - 24, A[1] - 20, 6, T.acc, N) +
					C(A[0] + 24, A[1] - 20, 6, T.acc, N) +
					[-20, 0, 20]
						.map((d) => R(A[0] + d - 6, A[1] + 30, 12, 16, "#fff", S(2)))
						.join("") +
					[Cc[0] - 120, Cc[0] + 120]
						.map(
							(x) =>
								L(x, 860, x, 1046, 8, "#3a3a42") +
								[0, 1, 2, 3, 4]
									.map((i) =>
										E(
											x,
											880 + i * 34,
											10,
											16,
											"none",
											'stroke="#5a5a62" stroke-width="6"',
										),
									)
									.join(""),
						)
						.join("") +
					RR(
						Cc[0] - 80,
						1040,
						160,
						170,
						10,
						"none",
						'stroke="#3a3a42" stroke-width="10"',
					) +
					[0, 1, 2, 3]
						.map((i) =>
							L(
								Cc[0] - 50 + i * 34,
								1040,
								Cc[0] - 50 + i * 34,
								1210,
								6,
								"#3a3a42",
							),
						)
						.join("") +
					C(Cc[0], 1150, 26, "#e8d8c0") +
					C(Cc[0] - 8, 1146, 5, k, N) +
					C(Cc[0] + 8, 1146, 5, k, N) +
					L(D[0] - 124, D[1] + 124, D[0] + 124, D[1] - 124, 12, T.beamL) +
					P(
						`M${D[0] + 90} ${D[1] - 154} l34 34 l44 -44 M${D[0] + 124} ${D[1] - 120} l44 0 M${D[0] + 124} ${D[1] - 120} l0 -44`,
						"none",
						`stroke="${T.metal}" stroke-width="12" stroke-linecap="round"`,
					) +
					C(B[0], B[1] - 50, 46, "#e8d8c0") +
					C(B[0] - 16, B[1] - 54, 10, k, N) +
					C(B[0] + 16, B[1] - 54, 10, k, N) +
					R(B[0] - 8, B[1] - 134, 16, 40, "#c03a2a", S(4)) +
					flame(B[0], B[1] - 134, 0.7) +
					[
						[700, 2238],
						[2600, 2238],
						[3900, 2238],
					]
						.map(
							([x, y]) =>
								E(x, y, 120, 12, T.acc, 'stroke="none" opacity=".35"') +
								E(x, y, 60, 6, T.acc2, 'stroke="none" opacity=".5"'),
						)
						.join("") +
					[
						[1240, 200],
						[2900, 470],
					]
						.map(([x, y]) =>
							P(
								`M${x} ${y - 40} V${y + 40} M${x} ${y} l-28 -30 M${x} ${y} l28 -30 M${x} ${y + 20} l-20 20 M${x} ${y + 20} l20 20`,
								"none",
								`stroke="${T.acc}" stroke-width="7" stroke-linecap="round" opacity=".85"`,
							),
						)
						.join("")
				);
			case "ugabugi":
				return (
					bone(A[0] - 130, A[1] + 70, A[0] + 130, A[1] - 70, 26) +
					bone(A[0] - 130, A[1] - 70, A[0] + 130, A[1] + 70, 26) +
					P(
						`M${Cc[0] - 40} 1080 Q${Cc[0] - 40} 1000 ${Cc[0] + 40} 1000 Q${Cc[0] + 124} 1000 ${Cc[0] + 124} 1080 L${Cc[0] + 114} 1140 M${Cc[0] - 30} 1080 L${Cc[0] - 30} 1140 M${Cc[0] - 40} 1040 Q${Cc[0] - 84} 1060 ${Cc[0] - 74} 1120 M${Cc[0] + 30} 1140 L${Cc[0] + 30} 1100 M${Cc[0] + 80} 1140 L${Cc[0] + 80} 1100`,
						"none",
						'stroke="#8a3a1a" stroke-width="10" stroke-linecap="round"',
					) +
					[Cc[0] - 180, Cc[0] - 126]
						.map(
							(x) =>
								C(x, 1010, 14, "none", 'stroke="#8a3a1a" stroke-width="8"') +
								L(x, 1024, x, 1080, 8, "#8a3a1a") +
								L(x - 20, 1112, x, 1080, 8, "#8a3a1a") +
								L(x + 20, 1112, x, 1080, 8, "#8a3a1a") +
								L(x, 1040, x + 42, 1018, 8, "#8a3a1a"),
						)
						.join("") +
					L(Cc[0] - 80, 1016, Cc[0] - 40, 1040, 6, "#8a3a1a") +
					[0, 1, 2]
						.map((i) =>
							P(
								`M${Cc[0] + 180 + i * 40} 1000 l14 -30 l14 30 z`,
								"none",
								'stroke="#c87a3a" stroke-width="7" stroke-linejoin="round"',
							),
						)
						.join("") +
					bone(D[0] - 124, D[1], D[0] + 124, D[1], 32) +
					bone(B[0] - 60, B[1] - 30, B[0] + 60, B[1] - 30, 22) +
					E(3460, 1630, 120, 20, T.cloth) +
					P(
						"M3340 1630 q30 -40 60 -10 q30 -40 60 -10 q30 -40 60 -10 q30 -40 60 -10",
						"none",
						`stroke="${dk(T.cloth, 0.25)}" stroke-width="6"`,
					) +
					[
						[900, 300],
						[3000, 900],
					]
						.map(
							([x, y]) =>
								E(x, y, 70, 40, "#7a6a5a", S(5)) +
								E(x + 40, y + 10, 30, 30, "#7a6a5a", S(5)) +
								C(x + 50, y + 4, 4, k, N) +
								P(
									`M${x + 66} ${y + 26} q30 30 0 60`,
									"none",
									'stroke="#f3ead8" stroke-width="10" stroke-linecap="round"',
								),
						)
						.join("")
				);
		}
		return "";
	}

	window.LGTavernArt = { TV_W, TV_H, FL, GAL_X, TH, tvArt, tvMix, tvRng };
})();

(() => {
	const { TH, tvMix } = window.LGTavernArt;
	const GW_ROLE = {
		shield: "shield",
		brute: "brute",
		banner: "banner",
		spy: "spy",
		heroM: "heroM",
		archer: "archer",
		medic: "medic",
		thrower: "thrower",
		heroR: "heroR",
	};

	const GW_ROLES = {
		shield: {
			seed: "gw_shield",
			gear: {
				w: "sword",
				wr: "common",
				s: "scutum",
				sr: "common",
				a: "lorica",
				ar: "common",
			},
		},
		brute: {
			seed: "gw_brute",
			gear: { w: "axe", wr: "common", a: "leather", ar: "common" },
		},
		banner: {
			seed: "gw_banner",
			gear: { w: "spear", wr: "common", a: "lorica", ar: "common" },
		},
		spy: {
			seed: "gw_spy",
			gear: {
				w: "dagger",
				wr: "common",
				s: "oknife",
				sr: "common",
				a: "leather",
				ar: "common",
			},
		},
		heroM: {
			seed: "gw_heroM",
			gear: {
				w: "sword",
				wr: "common",
				s: "round",
				sr: "common",
				a: "plate",
				ar: "uncommon",
			},
		},
		archer: {
			seed: "gw_archer",
			gear: { w: "bow", wr: "common", a: "leather", ar: "common" },
		},
		medic: {
			seed: "gw_medic",
			gear: { w: "staff", wr: "common", a: "robe", ar: "common" },
		},
		thrower: {
			seed: "gw_thrower",
			gear: { w: "club", wr: "common", a: "leather", ar: "common" },
		},
		heroR: {
			seed: "gw_heroR",
			gear: { w: "bow", wr: "common", a: "plate", ar: "uncommon" },
		},
		crew: {
			seed: "gw_crew",
			gear: { w: "hammer", wr: "common", a: "leather", ar: "common" },
		},
	};
	function cardArt(fac) {
		const D = window.MDDoodle,
			out = {};
		if (!D || !D.draw || !D.jhash) return out;
		for (const [k, v] of Object.entries(GW_ROLES)) {
			try {
				out[k] = String(
					D.draw(
						fac,
						D.jhash(v.seed + fac),
						"stern",
						false,
						{ kit: "battle", armed: true, gear: v.gear },
						null,
					),
				).replace(
					/<(animate|animateTransform|animateMotion|set)\b[^>]*?(\/>|>[\s\S]*?<\/\1>)/g,
					"",
				);
			} catch (e) {
				console.warn("[таверна] карта Гвинта", k, e);
			}
		}
		return out;
	}
	const gwSprites = new Set();
	function gwSprite(fac) {
		if (gwSprites.has(fac)) return;
		const CA = cardArt(fac);
		if (!Object.keys(CA).length) return;
		gwSprites.add(fac);
		let host = document.getElementById("tv-gwsprite");
		if (!host) {
			host = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			host.id = "tv-gwsprite";
			host.setAttribute("width", "0");
			host.setAttribute("height", "0");
			host.style.position = "absolute";
			document.body.append(host);
		}
		let s = "";
		for (const [role, svg] of Object.entries(CA))
			s += svg
				.replace(
					/^<svg[^>]*?viewBox="([^"]+)"[^>]*>/,
					`<symbol id="gwa-${fac}-${role}" class="jl-doodle" viewBox="$1">`,
				)
				.replace(/<\/svg>$/, "</symbol>");
		host.insertAdjacentHTML("beforeend", s);
	}
	const GW_AMMO = {
		legion: "#9a8a7a",
		cats: "#ff8fa3",
		monkeys: "#7a5228",
		veggies: "#ff8a2a",
		"42brothers": "#e8e8f8",
		cherts: "#ff6a2a",
		ugabugi: "#8a7a6a",
	};
	function gwArt(fac, c) {
		const T = TH[fac] || TH.legion,
			k = T.ink,
			dark = fac === "42brothers" || fac === "cherts";
		const lt = (x, t) => tvMix(x, "#ffffff", t),
			dk = (x, t) => tvMix(x, "#000000", t);
		const S = (w) =>
			`stroke="${k}" stroke-width="${w || 2.4}" stroke-linejoin="round" stroke-linecap="round"`;
		let s = "";

		const sky = dark
			? fac === "cherts"
				? "#4a1a14"
				: "#24163a"
			: c.row === "r"
				? "#bfe0f0"
				: c.row === "s"
					? "#f0dcb0"
					: lt(T.wall, 0.25);
		s += `<rect width="100" height="76" fill="${sky}"/>`;
		if (c.row === "r")
			s += `<ellipse cx="22" cy="18" rx="14" ry="6" fill="#fff" opacity="${dark ? 0.15 : 0.8}"/><ellipse cx="74" cy="12" rx="11" ry="5" fill="#fff" opacity="${dark ? 0.15 : 0.8}"/>`;
		if (c.row === "s")
			s += `<path d="M0 56 Q20 36 40 50 Q62 30 100 48 V76 H0 Z" fill="${dark ? dk(T.stone, 0.2) : lt(T.acc2, 0.35)}"/>`;
		if (dark)
			s += `<circle cx="80" cy="14" r="6" fill="${fac === "cherts" ? "#ff8a3a" : "#fff3c4"}" opacity=".8"/>`;
		s += `<path d="M0 62 Q50 56 100 62 V76 H0 Z" fill="${dark ? dk(T.floor, 0.1) : fac === "ugabugi" ? T.stoneD : tvMix(T.acc2, "#6a8a3a", 0.4)}"/>`;
		const hero = c.ab === "hero";
		if (hero) {
			s += `<g opacity=".55">${[0, 30, 60, 90, 120, 150].map((a) => `<rect x="49" y="-10" width="2.5" height="96" fill="#ffe27a" transform="rotate(${a} 50 38)"/>`).join("")}</g><circle cx="50" cy="36" r="22" fill="#ffe27a" opacity=".35"/>`;
		}
		const unit = (role, x, y, h) =>
			`<use href="#gwa-${fac}-${role}" x="${x}" y="${y}" width="${(h * 120) / 170}" height="${h}"/>`;
		if (GW_ROLE[c.key])
			s += unit(GW_ROLE[c.key], 50 - (104 * 120) / 170 / 2, -26, 104);

		const wood = T.beamL,
			woodD = T.beam,
			metal = "#8a8a92",
			ammo = GW_AMMO[fac];
		const wheel = (x, y, r) =>
			`<circle cx="${x}" cy="${y}" r="${r}" fill="${woodD}" ${S()}/><circle cx="${x}" cy="${y}" r="${r * 0.3}" fill="${metal}" ${S(1.6)}/>`;
		if (c.key === "catapult")
			s +=
				unit("crew", 2, 26, 46) +
				`<path d="M40 60 L86 60 L80 50 L46 50 Z" fill="${wood}" ${S()}/><path d="M58 50 L52 26 M66 50 L60 26" ${S(3)}/><path d="M56 30 L90 14" ${S(4)}/><path d="M56 30 L90 14" stroke="${wood}" stroke-width="2.4" stroke-linecap="round"/><path d="M86 8 q8 0 8 8 q-8 2 -10 -6 z" fill="${woodD}" ${S(1.8)}/><circle cx="90" cy="9" r="5" fill="${ammo}" ${S(1.8)}/>` +
				wheel(48, 62, 6) +
				wheel(78, 62, 6);
		if (c.key === "ram")
			s +=
				unit("crew", 0, 26, 46) +
				`<path d="M38 38 L92 38 L86 28 L44 28 Z" fill="${dk(wood, 0.15)}" ${S()}/><rect x="40" y="38" width="50" height="14" fill="${wood}" ${S()}/><rect x="30" y="42" width="66" height="7" rx="3.5" fill="${woodD}" ${S()}/><path d="M96 45.5 l-6 -6 v12 z" fill="${metal}" ${S(1.6)}/>` +
				wheel(48, 58, 6) +
				wheel(82, 58, 6);
		if (c.key === "treb")
			s +=
				unit("crew", 0, 26, 46) +
				`<path d="M50 62 L64 20 L78 62" fill="none" ${S(3)}/><path d="M50 62 L64 20 L78 62" fill="none" stroke="${wood}" stroke-width="1.6"/><path d="M46 44 L92 10" ${S(3.4)}/><rect x="40" y="40" width="12" height="12" fill="${metal}" ${S()}/><circle cx="92" cy="10" r="4.5" fill="${ammo}" ${S(1.6)}/><rect x="44" y="60" width="40" height="5" fill="${woodD}" ${S()}/>`;

		if (c.key === "frost")
			s =
				`<rect width="100" height="76" fill="#cfe8f8"/><path d="M0 64 Q50 56 100 64 V76 H0Z" fill="#fff"/>` +
				[
					[50, 34, 20],
					[20, 20, 9],
					[80, 22, 10],
					[26, 54, 7],
					[78, 54, 8],
				]
					.map(
						([x, y, r]) =>
							`<g ${S(2)} stroke="#3a7ab0">${[0, 60, 120].map((a) => `<line x1="${x}" y1="${y - r}" x2="${x}" y2="${y + r}" transform="rotate(${a} ${x} ${y})"/>`).join("")}</g>`,
					)
					.join("");
		if (c.key === "fog")
			s =
				`<rect width="100" height="76" fill="#b8bcc4"/>` +
				[
					[24, 30, 22],
					[62, 22, 26],
					[46, 50, 30],
					[84, 52, 18],
				]
					.map(
						([x, y, r]) =>
							`<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.45}" fill="#eef0f4" opacity=".85"/>`,
					)
					.join("");
		if (c.key === "rain")
			s =
				`<rect width="100" height="76" fill="#4a5a7a"/><ellipse cx="34" cy="18" rx="24" ry="10" fill="#6a7a9a" ${S()}/><ellipse cx="66" cy="16" rx="22" ry="11" fill="#7a8aaa" ${S()}/>` +
				Array.from(
					{ length: 12 },
					(_, i) =>
						`<line x1="${12 + i * 7}" y1="${32 + (i % 3) * 8}" x2="${8 + i * 7}" y2="${44 + (i % 3) * 8}" stroke="#bfe0ff" stroke-width="2" stroke-linecap="round"/>`,
				).join("");
		if (c.key === "clear")
			s = `<rect width="100" height="76" fill="#bfe8ff"/><g>${Array.from({ length: 12 }, (_, i) => `<line x1="50" y1="8" x2="50" y2="0" stroke="#ffb020" stroke-width="3" stroke-linecap="round" transform="rotate(${i * 30} 50 30)"/>`).join("")}</g><circle cx="50" cy="30" r="15" fill="#ffd24a" ${S()}/><path d="M0 64 Q50 56 100 64 V76 H0Z" fill="#8ac85a"/>`;
		if (c.key === "horn")
			s = `<rect width="100" height="76" fill="${lt(T.acc, 0.6)}"/><path d="M18 52 Q40 46 62 22 L74 30 Q56 62 22 62 Z" fill="${T.acc2}" ${S()}/><ellipse cx="68" cy="26" rx="8" ry="5" transform="rotate(35 68 26)" fill="${dk(T.acc2, 0.2)}" ${S()}/><path d="M80 16 q6 6 0 12 M86 10 q10 10 0 22" fill="none" ${S(2)}/><rect x="28" y="52" width="8" height="5" fill="${T.metal}" ${S(1.4)}/>`;
		if (c.key === "decoy")
			s = `<rect width="100" height="76" fill="${lt(T.acc2, 0.5)}"/><path d="M0 64 Q50 58 100 64 V76 H0Z" fill="#c8a858"/><line x1="50" y1="24" x2="50" y2="72" ${S(3)}/><line x1="26" y1="38" x2="74" y2="38" ${S(3)}/><circle cx="50" cy="22" r="10" fill="#e8d8a8" ${S()}/><path d="M36 14 h28 l-4 -8 h-20 z" fill="${T.acc}" ${S()}/><path d="M44 22 l3 2 M53 22 l3 2 M45 27 q5 3 10 0" fill="none" ${S(1.6)}/><path d="M38 38 l-4 18 h32 l-4 -18 z" fill="${T.cush}" ${S()}/>`;
		if (c.key === "scorch")
			s = `<rect width="100" height="76" fill="#3a140c"/><path d="M14 72 Q10 40 30 26 Q28 44 40 40 Q36 18 52 6 Q56 30 66 30 Q64 16 76 20 Q92 40 86 72 Z" fill="#ff6a2a"/><path d="M28 72 Q26 52 40 46 Q42 58 50 54 Q50 40 60 34 Q72 50 70 72 Z" fill="#ffcf3f"/><path d="M42 72 Q42 62 50 58 Q58 64 56 72 Z" fill="#fff3b0"/>`;
		return `<svg class="gart" viewBox="0 0 100 76" preserveAspectRatio="xMidYMid slice">${s}</svg>`;
	}

	window.LGGwentArt = { sprite: gwSprite, art: gwArt };
})();

(() => {
	if (window.LGTavern && !window.LGTavern.lite) return;
	const A = window.LGTavernArt,
		GWA = window.LGGwentArt,
		GWR = window.LGGwent;
	if (!A || !GWA || !GWR) {
		console.warn("[таверна] нет рисунка или правил Гвинта");
		return;
	}
	const { TV_W, TV_H, FL, GAL_X, TH, tvArt, tvMix, tvRng } = A;
	const lite =
		window.LGTavern && window.LGTavern.lite && window.LGTavern.take
			? window.LGTavern.take()
			: null;
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
	const coins = (n) => {
		n = Math.max(0, Math.round(+n || 0));
		const g = Math.floor(n / 10000),
			s = Math.floor(n / 100) % 100,
			b = n % 100;
		return (
			(g ? `${g}<i class="cg"></i>` : "") +
			(s ? `${s}<i class="cs"></i>` : "") +
			(b || (!s && !g) ? `${b}<i class="cb"></i>` : "")
		);
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

	const styleNow = () => {
		let s = "legion";
		try {
			s =
				(window.MDDoodle && window.MDDoodle.active) ||
				(Array.isArray(window.LG_STYLES) && window.LG_STYLES[0]) ||
				"legion";
		} catch (e) {
			s = "legion";
		}
		return GST.includes(s) ? s : "legion";
	};

	const BASE = () => window.LG_BASE || "";
	async function api(body) {
		try {
			const r = await fetch(
				BASE() + "/api/tavern" + (body ? "/act" : ""),
				body
					? {
							method: "POST",
							credentials: "same-origin",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify(body),
						}
					: { credentials: "same-origin" },
			);
			let x = null;
			try {
				x = await r.json();
			} catch (e) {
				x = null;
			}
			if (x && typeof x === "object") return x;
			return {
				ok: false,
				error:
					r.status === 429
						? "Слишком часто - подожди немного"
						: "Нет ответа - попробуй ещё раз",
			};
		} catch (e) {
			return { ok: false, error: "Нет связи - проверь интернет" };
		}
	}
	let IDX = lite && lite.IDX ? lite.IDX : null,
		idxAt = lite ? lite.idxAt || 0 : 0,
		idxP = null;
	function index(force) {
		if (!force && IDX && Date.now() - idxAt < (IDX.ok ? 60e3 : 600e3))
			return Promise.resolve(IDX);
		if (idxP) return idxP;
		idxP = api(null).then((r) => {
			IDX = r;
			idxAt = Date.now();
			idxP = null;
			return r;
		});
		return idxP;
	}

	async function act(op, args) {
		const r = await api({ op, ...(args || {}) });
		if (r && r.money != null) {
			S.money = r.money;
			showCoins();
		}
		if (!r || !r.ok) toast((r && r.error) || "Не вышло", true);
		return r || { ok: false };
	}

	async function refresh() {
		const r = await index(true);
		if (r && r.ok) {
			S.D = r;
			S.money = r.money;
			showCoins();
		}
		return r;
	}

	const S = {
		sty: "legion",
		money: 0,
		D: null,
		eggs: new Set(),
		town: "",
		act: "",
	};
	let root = null,
		game = null,
		view = null,
		world = null,
		OPEN = false;
	const $ = (id) => (root ? root.querySelector("#tv-" + id) : null);

	const HOT = [
		{
			id: "exit",
			lvl: 1,
			r: [70, 1180, 290, 1640],
			x: 200,
			t: "Выход",
			act: "exit",
		},
		{
			id: "rum",
			lvl: 1,
			r: [300, 1120, 590, 1450],
			x: 445,
			t: "Доска слухов",
			act: "rum",
		},
		{
			id: "bar",
			lvl: 1,
			r: [600, 1040, 1320, 1640],
			x: 980,
			t: "Стойка трактирщика",
			act: "bar",
		},
		{
			id: "hatch",
			lvl: 1,
			r: [1320, 1420, 1510, 1680],
			x: 1420,
			t: "Люк в подвал",
			act: "down",
		},
		{
			id: "dice",
			lvl: 1,
			r: [1540, 1120, 1920, 1640],
			x: 1730,
			t: "Кости",
			act: "dice",
		},
		{
			id: "fire",
			lvl: 1,
			r: [1960, 960, 2340, 1640],
			x: 2150,
			t: "Камин",
			act: "fire",
		},
		{
			id: "arm",
			lvl: 1,
			r: [2820, 1120, 3170, 1640],
			x: 2995,
			t: "Стол силачей",
			act: "arm",
		},
		{
			id: "gw",
			lvl: 1,
			r: [3220, 1120, 4040, 1640],
			x: 3640,
			t: "Гвинт",
			act: "gw",
		},
		{
			id: "up",
			lvl: 1,
			r: [4080, 1300, 4340, 1640],
			x: 4300,
			t: "Наверх",
			act: "up",
		},
		{
			id: "room1",
			lvl: 2,
			r: [300, 360, 500, 700],
			x: 400,
			t: "Комната 1",
			act: "room",
		},
		{
			id: "room2",
			lvl: 2,
			r: [850, 360, 1050, 700],
			x: 950,
			t: "Комната 2",
			act: "room",
		},
		{
			id: "room3",
			lvl: 2,
			r: [1380, 230, 1620, 700],
			x: 1500,
			t: "Твоя комната",
			act: "room",
		},
		{
			id: "room4",
			lvl: 2,
			r: [1950, 360, 2150, 700],
			x: 2050,
			t: "Комната 4",
			act: "room",
		},
		{
			id: "gal",
			lvl: 2,
			r: [2380, 410, 3200, 700],
			x: 2700,
			t: "Галерея",
			act: "gal",
		},
		{
			id: "down2",
			lvl: 2,
			r: [3220, 560, 3520, 700],
			x: 3330,
			t: "Вниз",
			act: "down2",
		},
		{
			id: "kitchen",
			lvl: 0,
			r: [320, 1720, 1360, 2240],
			x: 760,
			t: "Кухня - смены",
			act: "job",
		},
		{
			id: "cellar",
			lvl: 0,
			r: [1580, 1720, 4300, 2240],
			x: 2500,
			t: "Погреб - поручения",
			act: "cellar",
		},
		{
			id: "ladder",
			lvl: 0,
			r: [1190, 1700, 1480, 2240],
			x: 1420,
			t: "Наверх",
			act: "up0",
		},
	];
	const RANGE = { 2: [180, GAL_X - 10], 1: [180, 4300], 0: [180, 4280] };
	const CONN = {
		stB: { x: 4300, y: 1640, lvl: 1 },
		stT: { x: GAL_X + 30, y: 700, lvl: 2 },
		haT: { x: 1420, y: 1640, lvl: 1 },
		haB: { x: 1420, y: 2240, lvl: 0 },
	};

	const NPC = [
		{
			id: "keeper",
			who: "Трактирщик Бочонок",
			art: "keeper",
			x: 980,
			lvl: 1,
			back: true,
			say: "Чего желаешь, путник?",
		},
		{
			id: "n1",
			who: "Бородач",
			art: 3,
			x: 780,
			lvl: 1,
			say: "Эль сегодня - огонь!",
		},
		{ id: "n2", who: "Мурка", art: 4, x: 1650, lvl: 1, back: true },
		{
			id: "n3",
			who: "Котлета",
			art: 6,
			x: 1820,
			lvl: 1,
			back: true,
			flip: true,
		},
		{ id: "n4", who: "Пивовар", art: 8, x: 2470, lvl: 1, back: true },
		{ id: "n5", who: "Сова", art: 9, x: 2690, lvl: 1, back: true, flip: true },
		{
			id: "strong",
			who: "Силач Громобой",
			art: "strong",
			x: 3090,
			lvl: 1,
			back: true,
			flip: true,
			say: "Кто рискнёт?",
		},
		{ id: "g1", who: "Картёжник Гриня", art: 1, x: 3300, lvl: 1, back: true },
		{
			id: "g2",
			who: "Картёжница Ната",
			art: 2,
			x: 3520,
			lvl: 1,
			back: true,
			flip: true,
		},
		{
			id: "old",
			who: "Завсегдатай Яков",
			art: "old",
			x: 3960,
			lvl: 1,
			back: true,
			flip: true,
			say: "Партейку в Гвинт?",
		},
		{ id: "n6", who: "Зубастик", art: 7, x: 2900, lvl: 2 },
		{
			id: "n7",
			who: "Поварёнок",
			art: 5,
			x: 980,
			lvl: 0,
			say: "Ещё 30 мешков...",
		},
	];
	const hero = {
		x: 520,
		y: 1640,
		lvl: 1,
		face: 1,
		pts: [],
		arrive: null,
		key: 0,
	};
	let lastTalk = 0;

	const SEEDS = [
		"гость",
		"гриня",
		"ната",
		"бородач",
		"мурка",
		"поварёнок",
		"котлета",
		"зубастик",
		"пивовар",
		"сова",
	];
	const NAMED = {
		keeper: ["трактирщик_бочонок", "chill"],
		strong: ["силач_громобой", "stern"],
		old: ["старый_игрок_гвинт", "chill"],
	};
	const noAnim = (svg) =>
		String(svg).replace(
			/<(animate|animateTransform|animateMotion|set)\b[^>]*?(\/>|>[\s\S]*?<\/\1>)/g,
			"",
		);
	const DDC = new Map();

	function dd(kind, i) {
		const D = window.MDDoodle,
			key = S.sty + "|" + kind + "|" + i;
		if (DDC.has(key)) return DDC.get(key);
		let svg = '<svg viewBox="0 0 120 170"></svg>';
		try {
			if (D && D.draw && D.jhash) {
				if (typeof i === "string") {
					const [seed, mood] = NAMED[i] || [i, "chill"];
					svg = D.draw(S.sty, D.jhash(seed), mood, false, {}, null);
				} else
					svg = D.draw(
						S.sty,
						D.jhash(SEEDS[i % SEEDS.length]),
						kind,
						false,
						{},
						null,
					);
			}
		} catch (e) {
			console.warn("[таверна] человечек", e);
		}
		svg = noAnim(svg);
		DDC.set(key, svg);
		return svg;
	}

	function heroSvg(mood) {
		const D = window.MDDoodle,
			me = (S.D && S.D.login) || "герой",
			lk = S.D && S.D.look;
		try {
			if (D && D.jDoodle)
				return noAnim(
					D.jDoodle(
						D.jhash(me),
						mood,
						false,
						{ alive: true, gear: (lk && lk.g) || {}, who: me, kit: "peace" },
						(lk && lk.lk) || null,
					),
				);
		} catch (e) {
			console.warn("[таверна] облик героя", e);
		}
		return dd(mood, 0);
	}
	function chEl(o, me) {
		const e = document.createElement("div");
		e.className = "ch" + (me ? " me" : "") + (o.flip ? " flip" : "");
		e.innerHTML = `<div class="sh"></div><div class="dd"></div><div class="nick">${esc(o.who)}</div><div class="bub"></div>`;
		return e;
	}
	const npcEls = {};
	let heroEl;
	function buildChars() {
		$("npcB").innerHTML = "";
		$("npcF").innerHTML = "";
		$("heroL").innerHTML = "";
		for (const n of NPC) {
			const e = chEl(n);
			npcEls[n.id] = e;
			e.querySelector(".dd").innerHTML = dd("chill", n.art);
			if (n.id === "keeper") e._dy = 278 + 110;
			else if (n.back) e._dy = 278 + 95;
			place(e, n.x, FL[n.lvl]);
			(n.back ? $("npcB") : $("npcF")).append(e);
		}
		heroEl = chEl({ who: (S.D && S.D.login) || "ты" }, true);
		$("heroL").append(heroEl);
		heroMood = "";
		heroArt();
		place(heroEl, hero.x, hero.y);
	}
	let heroMood = "";
	function heroArt() {
		const m = hero.pts.length || hero.key ? "walk" : "chill";
		if (heroEl && m !== heroMood) {
			heroMood = m;
			heroEl.querySelector(".dd").innerHTML = heroSvg(m);
		}
	}
	function place(e, x, y) {
		e.style.transform = `translate(${x - 100}px, ${y - (e._dy || 278)}px)`;
	}
	function say(id, txt, ms) {
		const e = npcEls[id] || heroEl;
		if (!e) return;
		const b = e.querySelector(".bub");
		b.textContent = txt;
		b.classList.add("on");
		clearTimeout(b._t);
		b._t = setTimeout(() => b.classList.remove("on"), ms || 2600);
	}
	function cheer(ms) {
		for (const n of NPC) {
			const e = npcEls[n.id];
			if (!e || typeof n.art !== "number") continue;
			e.querySelector(".dd").innerHTML = dd("happy", n.art);
		}
		setTimeout(() => {
			for (const n of NPC) {
				const e = npcEls[n.id];
				if (e && typeof n.art === "number")
					e.querySelector(".dd").innerHTML = dd("chill", n.art);
			}
		}, ms || 2500);
	}

	function draw() {
		const T = TH[S.sty],
			a = tvArt(T, S.sty);
		$("bg").innerHTML = a.bg;
		$("fg").innerHTML = a.fg;
		$("tname").textContent = `Таверна «${T.name}»`;
		S.tname = T.name;
		buildChars();
		showCoins();
		game.style.setProperty("--glw", T.glw);
		hilite();
	}
	function showCoins() {
		$("coins").innerHTML = coins(S.money);
	}

	const cam = { x: 0, y: 0, s: 1, init: false, free: false, fx: 0, fy: 0 };
	function vsize() {
		return { w: game.clientWidth, h: game.clientHeight };
	}
	let zoom = 1;
	function scale() {
		const { w, h } = vsize();
		return Math.min(h / 1750, w / (w < 600 ? 990 : 1570)) * zoom;
	}
	function camClamp(tx, ty) {
		const { w, h } = vsize(),
			s = scale(),
			vw = w / s,
			vh = h / s;
		tx = Math.max(0, Math.min(TV_W - vw, tx));
		ty = Math.max(-40, Math.min(TV_H - vh + 10, ty));
		if (vw > TV_W) tx = (TV_W - vw) / 2;
		return { x: tx, y: ty, s };
	}
	function camTarget() {
		if (cam.free) return camClamp(cam.fx, cam.fy);
		const { w, h } = vsize(),
			s = scale(),
			vw = w / s,
			vh = h / s;
		let tx = hero.x - vw / 2,
			ty = hero.y - vh * 0.8;
		tx = Math.max(0, Math.min(TV_W - vw, tx));
		ty = Math.max(-40, Math.min(TV_H - vh + 10, ty));
		if (vw > TV_W) tx = (TV_W - vw) / 2;
		return { x: tx, y: ty, s };
	}
	function applyCam() {
		world.style.transform = `scale(${cam.s}) translate(${-cam.x}px, ${-cam.y}px)`;
		labels();
	}

	function lvlAt(x, y) {
		if (y < 730 && x < GAL_X) return 2;
		if (y < 1690) return 1;
		return 0;
	}
	function route(lvl, x) {
		const out = [],
			P = (c) => out.push({ x: c.x, y: c.y, lvl: c.lvl });
		let cur = hero.lvl;

		if (Math.abs(hero.y - FL[hero.lvl]) > 1) {
			const ladder = Math.abs(hero.x - CONN.haT.x) < 5 && hero.y > FL[1];
			const top = ladder ? CONN.haT : CONN.stT,
				bot = ladder ? CONN.haB : CONN.stB;
			const end = (ladder ? lvl >= 1 : lvl === 2) ? top : bot;
			P(end);
			cur = end.lvl;
		}
		while (cur !== lvl) {
			if (cur === 1 && lvl === 2) {
				P(CONN.stB);
				P(CONN.stT);
				cur = 2;
			} else if (cur === 2) {
				P(CONN.stT);
				P(CONN.stB);
				cur = 1;
			} else if (cur === 1 && lvl === 0) {
				P(CONN.haT);
				P(CONN.haB);
				cur = 0;
			} else if (cur === 0) {
				P(CONN.haB);
				P(CONN.haT);
				cur = 1;
			}
		}
		const [a, b] = RANGE[lvl];
		out.push({ x: Math.max(a, Math.min(b, x)), y: FL[lvl], lvl });
		return out;
	}
	function go(lvl, x, arrive) {
		if (![0, 1, 2].includes(lvl) || typeof x !== "number" || !isFinite(x))
			return;
		heal();
		camFollow();
		hero.pts = route(lvl, x);
		hero.arrive = arrive || null;
		heroArt();
		kick();
	}

	let raf = 0,
		last = 0;
	function kick() {
		if (OPEN && !raf && !document.hidden) {
			last = performance.now();
			raf = requestAnimationFrame(tick);
		}
	}
	function tick(t) {
		try {
			tickBody(t);
		} catch (e) {
			raf = 0;
			protoErr(e);
		}
	}
	function protoErr(e) {
		console.warn("[таверна] кадр", e);
	}
	function heal() {
		const bad = (v) => typeof v !== "number" || !isFinite(v);
		if (![0, 1, 2].includes(hero.lvl)) hero.lvl = 1;
		if (bad(hero.x) || bad(hero.y)) {
			hero.x = Math.max(
				RANGE[hero.lvl][0],
				Math.min(RANGE[hero.lvl][1], bad(hero.x) ? 2000 : hero.x),
			);
			hero.y = FL[hero.lvl];
			hero.pts = [];
		}
		hero.pts = hero.pts.filter(
			(q) => q && !bad(q.x) && !bad(q.y) && [0, 1, 2].includes(q.lvl),
		);
		if (bad(cam.x) || bad(cam.y) || bad(cam.s) || !(cam.s > 0)) {
			cam.x = 0;
			cam.y = 0;
			cam.s = scale();
			cam.free = false;
			cam.init = false;
		}
		if (bad(cam.fx) || bad(cam.fy)) {
			cam.fx = cam.x;
			cam.fy = cam.y;
		}
		if (!(zoom > 0)) zoom = 1;
	}
	function tickBody(t) {
		raf = 0;
		heal();
		const dt = Math.max(0, Math.min(0.05, (t - last) / 1000));
		last = t;
		let busy = false,
			moved = false;
		const sp = 620;

		if (
			hero.key > 0 &&
			!hero.pts.length &&
			hero.lvl === 2 &&
			hero.x >= RANGE[2][1] - 1
		)
			hero.pts = [
				{ x: CONN.stT.x, y: CONN.stT.y, lvl: 2 },
				{ x: CONN.stB.x, y: CONN.stB.y, lvl: 1 },
			];
		if (hero.key && !hero.pts.length) {
			const [a, b] = RANGE[hero.lvl];
			const nx = Math.max(a, Math.min(b, hero.x + hero.key * sp * dt));
			hero.face = hero.key;
			if (nx !== hero.x) {
				hero.x = nx;
				moved = true;
			}
			busy = true;
		}
		if (hero.pts.length) {
			busy = true;
			moved = true;
			const p = hero.pts[0],
				dx = p.x - hero.x,
				dy = p.y - hero.y,
				d = Math.hypot(dx, dy),
				st = sp * dt * (Math.abs(dy) > Math.abs(dx) * 3 ? 0.7 : 1);
			if (Math.abs(dx) > 2) hero.face = dx > 0 ? 1 : -1;
			if (d <= Math.max(st, 0.5)) {
				hero.x = p.x;
				hero.y = p.y;
				hero.lvl = p.lvl;
				hero.pts.shift();
				if (!hero.pts.length) {
					heroArt();
					const f = hero.arrive;
					hero.arrive = null;
					if (f) f();
				}
			} else {
				hero.x += (dx / d) * st;
				hero.y += (dy / d) * st;
			}
		}
		if (othersStep(dt)) busy = true;
		heroEl.classList.toggle("flip", hero.face < 0);
		heroEl.classList.toggle("walk", moved);
		place(heroEl, hero.x, hero.y);
		const tg = camTarget(),
			k = cam.init ? Math.min(1, dt * 6) : 1;
		cam.init = true;
		const ox = cam.x,
			oy = cam.y;
		cam.x += (tg.x - cam.x) * k;
		cam.y += (tg.y - cam.y) * k;
		cam.s = tg.s;
		if (Math.abs(tg.x - cam.x) > 0.5 || Math.abs(tg.y - cam.y) > 0.5)
			busy = true;
		else {
			cam.x = tg.x;
			cam.y = tg.y;
		}
		if (ox !== cam.x || oy !== cam.y || busy) applyCam();

		if (t - lastTalk > 2500)
			for (const n of NPC)
				if (n.say && n.lvl === hero.lvl && Math.abs(n.x - hero.x) < 120) {
					say(n.id, n.say);
					lastTalk = t;
					break;
				}
		if (busy) eggStep();
		if (busy) raf = requestAnimationFrame(tick);
		else {
			heroEl.classList.remove("walk");
			hilite();
		}
	}
	function onVis() {
		if (!game) return;
		game.classList.toggle("paused", document.hidden);
		if (document.hidden) void api({ op: "leave" });
		else {
			presence();
			kick();
		}
	}

	function toWorld(ev) {
		const r = game.getBoundingClientRect(),
			k = r.width / game.clientWidth;
		return {
			x: (ev.clientX - r.left) / k / cam.s + cam.x,
			y: (ev.clientY - r.top) / k / cam.s + cam.y,
		};
	}
	function hotAt(p) {
		return HOT.find(
			(h) => p.x >= h.r[0] && p.x <= h.r[2] && p.y >= h.r[1] && p.y <= h.r[3],
		);
	}
	let hover = null;
	let drag = null,
		dragged = false;
	function camFollow() {
		if (cam.free) {
			cam.free = false;
			$("toHero").hidden = true;
			kick();
		}
	}
	function camFree(x, y) {
		const c = camClamp(x, y);
		cam.free = true;
		cam.fx = c.x;
		cam.fy = c.y;
		cam.x = c.x;
		cam.y = c.y;
		$("toHero").hidden = false;
		applyCam();
	}

	function bindView() {
		view.addEventListener("pointermove", (ev) => {
			if (ev.pointerType !== "mouse") return;
			const h = hotAt(toWorld(ev));
			if (h !== hover) {
				hover = h;
				hilite();
				labels();
			}
		});
		view.addEventListener("pointerleave", () => {
			hover = null;
			hilite();
			labels();
		});

		view.addEventListener("pointerdown", (ev) => {
			if (ev.button !== 0) return;
			drag = {
				x: ev.clientX,
				y: ev.clientY,
				cx: cam.x,
				cy: cam.y,
				id: ev.pointerId,
				moved: false,
			};
			dragged = false;
		});
		view.addEventListener("pointermove", (ev) => {
			if (!drag || ev.pointerId !== drag.id) return;
			const k = game.getBoundingClientRect().width / game.clientWidth,
				dx = (ev.clientX - drag.x) / k,
				dy = (ev.clientY - drag.y) / k;
			if (!drag.moved && Math.hypot(dx, dy) < 8) return;
			if (!drag.moved) {
				drag.moved = true;
				view.setPointerCapture(ev.pointerId);
				view.classList.add("drag");
			}
			camFree(drag.cx - dx / cam.s, drag.cy - dy / cam.s);
		});
		const dragEnd = () => {
			if (drag && drag.moved) {
				dragged = true;
				view.classList.remove("drag");
			}
			drag = null;
		};
		view.addEventListener("pointerup", dragEnd);
		view.addEventListener("pointercancel", dragEnd);
		view.addEventListener(
			"wheel",
			(ev) => {
				ev.preventDefault();
				if (ev.ctrlKey) {
					const r = game.getBoundingClientRect(),
						k = r.width / game.clientWidth,
						sx = (ev.clientX - r.left) / k,
						sy = (ev.clientY - r.top) / k;
					const wx = sx / cam.s + cam.x,
						wy = sy / cam.s + cam.y;
					zoom = Math.max(
						0.78,
						Math.min(2.2, zoom * Math.exp(-ev.deltaY * 0.0015)),
					);
					cam.s = scale();
					if (cam.free) camFree(wx - sx / cam.s, wy - sy / cam.s);
					else {
						cam.x = wx - sx / cam.s;
						cam.y = wy - sy / cam.s;
						applyCam();
						kick();
					}
					return;
				}
				const base = cam.free
					? { x: cam.fx, y: cam.fy }
					: { x: cam.x, y: cam.y };
				const dx = ev.shiftKey ? ev.deltaY : ev.deltaX,
					dy = ev.shiftKey ? 0 : ev.deltaY;
				camFree(base.x + dx / cam.s, base.y + dy / cam.s);
			},
			{ passive: false },
		);
		$("toHero").onclick = () => camFollow();
		view.addEventListener("click", (ev) => {
			if (dragged) {
				dragged = false;
				return;
			}
			const hn = $("hint");
			if (hn && hn.style.opacity !== "0") hn.style.opacity = "0";
			const p = toWorld(ev),
				eg = eggAt(p);
			if (eg) return eggFx(eg);
			const ow = otherAt(p);
			if (ow) return winPlayer(ow.l);
			const h = hotAt(p);
			if (h) {
				go(h.lvl, h.x, () => act0(h));
				return;
			}
			go(lvlAt(p.x, p.y), p.x);
		});
	}
	function hilite() {
		const near = new Set();
		if (!hero.pts.length)
			for (const h of HOT)
				if (h.lvl === hero.lvl && Math.abs(h.x - hero.x) < 240) near.add(h.id);
		world.querySelectorAll(".ho").forEach((g) => {
			const ids = g.dataset.h.split(" ");
			g.classList.toggle("on", !!hover && ids.includes(hover.id));
			g.classList.toggle(
				"near",
				ids.some((i) => near.has(i)),
			);
		});
	}
	const held = new Map();
	const heldDir = () => {
		let d = 0;
		for (const v of held.values()) d = v;
		return d;
	};
	function onKeyDown(ev) {
		if (!OPEN) return;
		if (
			ev.target &&
			ev.target.closest &&
			ev.target.closest("input, textarea, select, [contenteditable]")
		)
			return;
		if (ev.key === "Escape") {
			if (modal) close();
			else if (!GW) leave();
			return;
		}
		if (GW) return;
		if (modal) {
			if (ev.code === "Space" && armGame) {
				ev.preventDefault();
				armPush();
			}
			if (ev.code === "Space" && pourG) {
				ev.preventDefault();
				pourG.down();
			}
			return;
		}
		const dirKey =
			ev.key === "ArrowLeft" || ev.code === "KeyA"
				? -1
				: ev.key === "ArrowRight" || ev.code === "KeyD"
					? 1
					: 0;
		if (dirKey) {
			const id = ev.code || ev.key;
			held.delete(id);
			held.set(id, dirKey);
		}
		if (ev.repeat) {
			if (dirKey && hero.key !== heldDir()) {
				hero.key = heldDir();
				heroArt();
				kick();
			}
			return;
		}
		const vKey =
			ev.key === "ArrowUp" || ev.code === "KeyW"
				? 1
				: ev.key === "ArrowDown" || ev.code === "KeyS"
					? -1
					: 0;

		if ((dirKey || vKey) && Math.abs(hero.y - FL[hero.lvl]) > 1) {
			camFollow();
			const ladder = Math.abs(hero.x - CONN.haT.x) < 5 && hero.y > FL[1];
			const top = ladder ? CONN.haT : CONN.stT,
				bot = ladder ? CONN.haB : CONN.stB;
			let end = null;
			if (vKey) end = vKey > 0 ? top : bot;
			else if (!ladder) end = dirKey < 0 ? top : bot;
			if (end) {
				hero.pts = [{ x: end.x, y: end.y, lvl: end.lvl }];
				hero.arrive = null;
			}
			if (dirKey) hero.key = dirKey;
			heroArt();
			kick();
			return;
		}
		if (dirKey) {
			camFollow();
			hero.key = heldDir();
			hero.pts = [];
			heroArt();
			kick();
		}
		if (
			ev.key === "ArrowUp" ||
			ev.key === "ArrowDown" ||
			ev.code === "KeyW" ||
			ev.code === "KeyS"
		) {
			const up = ev.key === "ArrowUp" || ev.code === "KeyW";
			if (hero.lvl === 1 && up && Math.abs(hero.x - CONN.stB.x) < 260)
				go(2, CONN.stT.x - 60);
			else if (hero.lvl === 2 && !up && Math.abs(hero.x - CONN.stT.x) < 260)
				go(1, CONN.stB.x - 60);
			else if (hero.lvl === 1 && !up && Math.abs(hero.x - CONN.haT.x) < 200)
				go(0, CONN.haB.x + 120);
			else if (hero.lvl === 0 && up && Math.abs(hero.x - CONN.haB.x) < 200)
				go(1, CONN.haT.x + 120);
		}
	}
	function onKeyUp(ev) {
		if (!OPEN) return;
		if (ev.code === "Space" && (armGame || pourG)) ev.preventDefault();
		if (ev.code === "Space" && pourG) pourG.up();
		if (
			["ArrowLeft", "ArrowRight"].includes(ev.key) ||
			ev.code === "KeyA" ||
			ev.code === "KeyD"
		) {
			held.delete(ev.code || ev.key);
			held.delete(ev.key);
			hero.key = heldDir();
			heroArt();
			kick();
		}
	}
	function onBlur() {
		held.clear();
		hero.key = 0;
		heroArt();
		kick();
	}

	function labels() {}

	let modal = null,
		onClose = null,
		armGame = null;
	function win(html, mount, done) {
		close();
		S.act = S.pendAct || "";
		S.pendAct = "";
		held.clear();
		hero.key = 0;

		modal = document.createElement("div");
		modal.className = "gl-modal gw-tok gw-dk";
		modal.dataset.gst = S.sty;
		modal.innerHTML = `<div class="gl-win" role="dialog" aria-modal="true"><button class="gl-x" aria-label="Закрыть">×</button><div class="gl-body"></div></div>`;
		modal.addEventListener("click", (e) => {
			if (e.target === modal || e.target.closest(".gl-x")) close();
		});
		game.append(modal);
		const body = modal.querySelector(".gl-body");
		const render = (h) => {
			body.innerHTML = h;
			if (mount) mount(body, render);
		};
		render(html);
		onClose = done || null;
		return body;
	}
	function close() {
		S.act = "";
		if (!modal) return;
		modal.remove();
		modal = null;
		armStop();
		oddStop();
		if (onClose) {
			const f = onClose;
			onClose = null;
			f();
		}
	}

	const alive = (m) => modal === m;
	let toastT;
	function toast(txt, bad) {
		if (!game) return;
		let t = game.querySelector(".gl-toast");
		if (!t) {
			t = document.createElement("div");
			t.className = "gl-toast gw-tok gw-dk";
			t.dataset.gst = S.sty;
			game.append(t);
		}
		t.textContent = txt;
		t.classList.toggle("bad", !!bad);
		t.classList.add("on");
		clearTimeout(toastT);
		toastT = setTimeout(() => t.classList.remove("on"), 2600);
	}
	const tabs = (list, cur) =>
		`<div class="gl-tabs" role="tablist">${list.map(([id, t]) => `<button role="tab" data-tab="${id}" aria-selected="${id === cur}">${t}</button>`).join("")}</div>`;

	function ico(kind) {
		const T = TH[S.sty],
			k = T.ink,
			s = `stroke="${k}" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round"`;
		const m = {
			ale: `<rect x="30" y="40" width="54" height="66" rx="8" fill="#e8b84a" ${s}/><path d="M84 54 q24 0 24 22 q0 22 -24 22" fill="none" ${s}/><path d="M26 44 q6 -20 22 -14 q8 -14 24 -6 q14 -10 20 8 z" fill="#fffaf0" ${s}/>`,
			soup: `<path d="M18 62 h92 q-4 42 -46 42 q-42 0 -46 -42z" fill="${T.beamL}" ${s}/><ellipse cx="64" cy="62" rx="46" ry="10" fill="#e8a050" ${s}/><path d="M50 40 q-6 -10 2 -20 M70 40 q-6 -10 2 -20" fill="none" ${s}/>`,
			mead: `<path d="M40 24 q-20 50 10 82 h28 q30 -32 10 -82 z" fill="#f2a63b" ${s}/><path d="M44 46 h40" ${s}/><circle cx="64" cy="72" r="8" fill="#ffd24a" ${s}/>`,
			meat: `<ellipse cx="58" cy="70" rx="38" ry="28" fill="#b8573a" ${s}/><path d="M88 54 l22 -20 M100 30 a6 6 0 1 1 12 8" fill="none" ${s}/><path d="M38 66 q14 -10 30 0" fill="none" ${s}/>`,
			pie: `<path d="M16 76 q48 -50 96 0 v14 h-96z" fill="#e0a04a" ${s}/><path d="M36 62 l8 10 M58 54 l4 12 M80 58 l-4 12" ${s}/><rect x="14" y="88" width="100" height="12" rx="6" fill="${T.acc}" ${s}/>`,
			all: `<rect x="14" y="48" width="38" height="50" rx="6" fill="#e8b84a" ${s}/><rect x="76" y="48" width="38" height="50" rx="6" fill="#e8b84a" ${s}/><path d="M44 50 l20 -26 l20 26" fill="none" ${s}/><circle cx="64" cy="20" r="8" fill="${T.acc2}" ${s}/>`,
			bed: `<rect x="14" y="60" width="100" height="30" rx="6" fill="${T.acc}" ${s}/><rect x="20" y="46" width="34" height="18" rx="8" fill="#fffaf0" ${s}/><path d="M14 90 v14 M114 90 v14 M14 40 v50" ${s}/>`,
			pot: `<path d="M24 50 h80 v30 q0 26 -40 26 q-40 0 -40 -26z" fill="#5a5a66" ${s}/><path d="M44 40 q-6 -12 2 -22 M70 40 q-6 -12 2 -22" fill="none" ${s}/>`,
		};
		return `<svg class="ico" viewBox="0 0 128 128">${m[kind] || ""}</svg>`;
	}
	function d20(n, hot) {
		const T = TH[S.sty];
		return `<svg class="d20" viewBox="0 0 100 100"><polygon points="50,4 92,28 92,72 50,96 8,72 8,28" fill="${hot ? T.acc2 : "#fffaf0"}" stroke="${T.ink}" stroke-width="5" stroke-linejoin="round"/><polygon points="50,22 76,64 24,64" fill="none" stroke="${T.ink}" stroke-width="3" opacity=".35"/><text x="50" y="54" text-anchor="middle" dominant-baseline="central" font-size="32" fill="${T.ink}" style="font-family:'Russo One'">${n}</text></svg>`;
	}
	function heroCheer() {
		if (!heroEl) return;
		heroMood = "happy";
		heroEl.querySelector(".dd").innerHTML = heroSvg("happy");
		setTimeout(() => {
			heroMood = "";
			heroArt();
		}, 1800);
	}
	const D = () => S.D || {};
	const busyBtn = (b, on) => {
		if (b) {
			b.disabled = !!on;
			b.setAttribute("aria-busy", on ? "true" : "false");
		}
	};

	const hhmm = (at, def) =>
		+at > 0 ? new Date(+at + 3 * 3600e3).toISOString().slice(11, 16) : def;
	const nextAt = () => hhmm(D().nx, "00:00");
	const weekAt = () => hhmm(D().nw, "00:00");
	const mins = (ms) => {
		const m = Math.max(0, Math.ceil(ms / 60000));
		return m >= 60 ? `${Math.floor(m / 60)} ч ${m % 60} мин` : `${m} мин`;
	};
	const mmss = (ms) => {
		const s = Math.max(0, Math.ceil(ms / 1000));
		return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
	};

	function winBar() {
		say("keeper", "Чего желаешь, путник?");
		win("", (b, re) => {
			const d = D(),
				B = d.buff && d.buff.until > Date.now() ? d.buff : null;
			const bf = B
				? `<div class="card hi"><div class="grow"><b>Действует: ${esc(B.name)}</b><small>${esc((d.menu.find((m) => m.n === B.name) || {}).e || "")} - ещё ${mins(B.until - Date.now())}. Новый бафф таверны заменит этот.</small></div></div>`
				: `<p class="gl-note">Бафф таверны действует один - новый заменяет старый.</p>`;
			b.innerHTML = `<h2>Стойка трактирщика</h2><p>Трактирщик Бочонок протирает кружку: «Чего желаешь, путник?»</p>${bf}
        ${(d.menu || []).map((m) => `<div class="card">${ico(m.id)}<div class="grow"><b>${esc(m.n)}</b><small>${esc(m.e)}</small></div><span class="price">${coins(m.p)}</span><button class="gl-btn" data-buy="${esc(m.id)}">Купить</button></div>`).join("")}
        ${d.ghost ? '<p class="gl-warn">Призраку не наливают - сначала оживи героя.</p>' : ""}`;
			b.querySelectorAll("[data-buy]").forEach(
				(x) =>
					(x.onclick = async () => {
						const m = modal;
						busyBtn(x, true);
						const r = await act("buy", { id: x.dataset.buy });
						if (!alive(m)) return;
						if (r.ok) {
							toast(r.said || "Готово");
							heroCheer();
							await refresh();
							if (alive(m)) re("");
						} else busyBtn(x, false);
					}),
			);
		});
	}

	function winRum() {
		win("", (b, re) => {
			const d = D(),
				R = d.rumors || [];
			b.innerHTML = `<h2>Доска слухов</h2><p class="gl-note">Три слуха в день, новые - в ${nextAt()}. Подсказки об округах, что говорят в таверне, заказы трактирщика.</p>
        ${R.map((x) => `<div class="card"><div class="grow"><span class="tag">${esc(x.k)}</span><b>${esc(x.t)}</b><small>${esc(x.x)}</small></div>${x.k === "Заказ" ? '<button class="gl-mini" data-job>На кухню</button>' : ""}</div>`).join("")}
        ${
					d.secret
						? `<div class="card hi"><div class="grow"><span class="tag">Шёпот</span><b>${esc(d.secret.t)}</b><small>${esc(d.secret.x)}</small></div></div>`
						: `<div class="card"><div class="grow"><span class="tag">Шёпот</span><b>Ещё один слух</b><small>Рассказчик у камина знает больше, если его угостить.</small></div><span class="price">${coins(d.secretPrice || 20)}</span><button class="gl-btn" data-sec>Угостить</button></div>`
				}`;
			const j = b.querySelector("[data-job]");
			if (j)
				j.onclick = () => {
					close();
					go(0, 760, () => act0(HOT.find((h) => h.id === "kitchen")));
				};
			const sc = b.querySelector("[data-sec]");
			if (sc)
				sc.onclick = async () => {
					const m = modal;
					busyBtn(sc, true);
					const r = await act("secret");
					if (!alive(m)) return;
					if (r.ok) {
						await refresh();
						if (alive(m)) re("");
					} else busyBtn(sc, false);
				};
		});
	}

	function winRoom(h) {
		let iv = 0;
		win(
			"",
			(b, re) => {
				clearInterval(iv);
				const d = D(),
					R = d.room || {},
					now = Date.now();
				let body;
				if (R.until && R.until > now) {
					const p = 1 - (R.until - now) / ((R.min || 10) * 60000);
					body = `<div class="card hi">${ico("bed")}<div class="grow"><b>Отдыхаешь</b><small>Осталось ${mmss(R.until - now)}. Сайт можно закрыть - отдых идёт.</small></div></div><div class="gl-xp prog"><i style="transform:scaleX(${Math.max(0, Math.min(1, p)).toFixed(3)})"></i></div>`;
					iv = setInterval(() => {
						if (!modal || !OPEN) return clearInterval(iv);
						if (Date.now() >= R.until) {
							clearInterval(iv);
							R.until = 0;
							R.ready = true;
						}
						re("");
					}, 1000);
				} else if (R.ready)
					body = `<div class="card ok">${ico("bed")}<div class="grow"><b>Отдых окончен</b><small>Проснись - здоровье станет полным.</small></div><button class="gl-btn" data-wake>Проснуться</button></div>`;
				else if (R.next && R.next > now)
					body = `<div class="card">${ico("bed")}<div class="grow"><b>Ты недавно отдыхал</b><small>Снова - через ${mins(R.next - now)}.</small></div></div>`;
				else
					body = `<div class="card">${ico("bed")}<div class="grow"><b>Снять комнату</b><small>Отдых ${R.min || 10} минут - потом здоровье полное. Снова отдохнуть - через 2 часа.</small></div><span class="price">${coins(R.price || 20)}</span><button class="gl-btn" data-rent>Снять</button></div>
        <p class="gl-note">Любая дверь ведёт в твою комнату - у каждого игрока своя.</p>`;
				b.innerHTML = `<h2>${esc(h.t)}</h2>${body}`;
				const go2 = (sel, op, okTxt) => {
					const x = b.querySelector(sel);
					if (x)
						x.onclick = async () => {
							const m = modal;
							busyBtn(x, true);
							const r = await act(op);
							if (!alive(m)) return;
							if (r.ok) {
								if (okTxt) toast(okTxt(r));
								await refresh();
								if (alive(m)) re("");
							} else busyBtn(x, false);
						};
				};
				go2("[data-rent]", "room.rent", () => "Ты снял комнату. Отдыхай");
				go2("[data-wake]", "room.wake", (r) =>
					r.healed ? `Ты выспался: +${r.healed} здоровья` : "Ты выспался",
				);
			},
			() => clearInterval(iv),
		);
	}

	function winJob() {
		let tab = "shift",
			hrs = 2,
			iv = 0;
		win(
			"",
			(b, re) => {
				clearInterval(iv);
				const J = D().job || {},
					per = (J.pay || [])[Math.max(0, (J.lvl || 1) - 1)] || 0,
					sh = J.shift,
					now = Date.now();
				let body = "";
				if (tab === "shift") {
					if (sh && sh.end > now) {
						const p = 1 - (sh.end - now) / (sh.h * 3600000);
						body = `<div class="card hi">${ico("pot")}<div class="grow"><b>На смене: ${sh.h} ч</b><small>Моешь кружки, таскаешь бочки. Осталось ${mins(sh.end - now)}. Сайт можно закрыть.</small></div></div><div class="gl-xp prog"><i style="transform:scaleX(${Math.max(0, Math.min(1, p)).toFixed(4)})"></i></div>
            ${sh.fight ? `<div class="card"><div class="grow"><span class="tag">Событие</span><b>Драка в таверне!</b><small>Двое не поделили последнюю кружку. Разними за полчаса - бонус ${coins(J.fightBonus || 15)}.</small></div><button class="gl-btn" data-fight>Разнять</button></div>` : ""}
            <div class="gl-btns"><button class="gl-btn ghost" data-quit>Уйти со смены без оплаты</button></div>`;
						iv = setInterval(() => {
							if (!modal || !OPEN) return clearInterval(iv);
							re("");
						}, 30000);
					} else if (sh)
						body = `<div class="card ok">${ico("pot")}<div class="grow"><b>Смена окончена</b><small>${sh.h} ч - ${coins(per * sh.h)}</small></div><button class="gl-btn" data-claim>Получить плату</button></div>`;
					else {
						const left = (J.dayMax || 8) - (J.today || 0);
						if (!(J.hours || [1, 2, 4]).includes(hrs) || hrs > left)
							hrs = (J.hours || [1, 2, 4]).filter((h) => h <= left).pop() || 1;
						body = `<h3>Длина смены</h3><div class="gl-btns">${(J.hours || [1, 2, 4]).map((h) => `<button class="gl-mini" data-h="${h}" aria-pressed="${hrs === h}" ${h > left ? "disabled" : ""}>${h} ч</button>`).join("")}</div>
            <div class="card"><div class="grow"><b>Заработок: ${coins(per * hrs)}</b><small>${per} бронзы в час (уровень ${J.lvl || 1})</small></div></div>
            <div class="lim"><span>Сегодня отработано: ${J.today || 0} из ${J.dayMax || 8} ч</span></div>
            <div class="gl-btns"><button class="gl-btn" data-start ${left <= 0 ? "disabled" : ""}>Выйти на смену</button></div>`;
					}
				} else {
					const xp = J.xp || 0,
						need = J.xpLevel || 100;
					body = `<div class="card"><div class="grow"><b>Помощник трактирщика - уровень ${J.lvl || 1} из ${(J.pay || []).length || 5}</b><small>Опыт профессии: ${xp} / ${need}. Каждый час смены - +10.</small></div></div><div class="gl-xp prog"><i style="transform:scaleX(${Math.min(1, xp / need).toFixed(3)})"></i></div>
          <table class="gl-tbl"><tr><th>Уровень</th><th>В час</th></tr>${(J.pay || []).map((p, i) => `<tr class="${i + 1 === J.lvl ? "me" : ""}"><td>${i + 1}</td><td>${p} бронзы</td></tr>`).join("")}</table>
          <p class="gl-note">В городах ★2 и выше откроются другие работы - платят больше.</p>`;
				}
				b.innerHTML = `<h2>Помощник трактирщика</h2>${tabs(
					[
						["shift", "Смена"],
						["prof", "Профессия"],
					],
					tab,
				)}${body}`;
				b.querySelectorAll("[data-tab]").forEach(
					(x) =>
						(x.onclick = () => {
							tab = x.dataset.tab;
							re("");
						}),
				);
				b.querySelectorAll("[data-h]").forEach(
					(x) =>
						(x.onclick = () => {
							hrs = +x.dataset.h;
							re("");
						}),
				);
				const doIt = (sel, op, args, okTxt) => {
					const x = b.querySelector(sel);
					if (x)
						x.onclick = async () => {
							const m = modal;
							busyBtn(x, true);
							const r = await act(op, args);
							if (!alive(m)) return;
							if (r.ok) {
								const t = okTxt(r);
								if (t) toast(t);
								await refresh();
								if (alive(m)) re("");
							} else busyBtn(x, false);
						};
				};
				doIt(
					"[data-start]",
					"job.start",
					{ h: hrs },
					() => "Ты на смене. Сайт можно закрыть",
				);
				doIt(
					"[data-fight]",
					"job.fight",
					null,
					(r) => `Драка разнята: +${r.pay}`,
				);
				doIt("[data-claim]", "job.claim", null, (r) =>
					r.up
						? `Новый уровень профессии: ${r.lvl}! Плата +${r.pay}`
						: `Смена окончена: +${r.pay}`,
				);
				doIt("[data-quit]", "job.quit", null, () => "Ты ушёл со смены");
			},
			() => clearInterval(iv),
		);
	}

	function winDice() {
		let tab = "keeper",
			a = "?",
			z = "?",
			res = "",
			cls = "",
			rolling = false,
			bet = 25;
		win("", (b, re) => {
			const d = D(),
				X = d.dice || {};
			if (!(X.bets || []).includes(bet)) bet = (X.bets || [25])[0];
			const lim = `<div class="lim"><span>Ставок сегодня: ${X.n || 0} / ${X.perDay || 10}</span><span>Проигрыш за день: ${X.lost || 0} / ${X.lossDay || 300}</span></div>`;
			let body = "";
			if (tab === "keeper")
				body = `<div class="gl-btns">${(X.bets || []).map((v) => `<button class="gl-mini" data-bet="${v}" aria-pressed="${bet === v}">${v}</button>`).join("")}</div>
        <p class="gl-note">Выше бросок - ставка ×2. Выпало 20 - ×3. Ничья - ставка трактирщику.</p>
        <div class="dice"><figure>${d20(a, cls === "win")}<figcaption>Ты</figcaption></figure><figure>${d20(z, cls === "lose")}<figcaption>Трактирщик</figcaption></figure></div><div class="res ${cls}">${res}</div>
        <div class="gl-btns" style="justify-content:center"><button class="gl-btn" data-roll ${rolling ? "disabled" : ""}>Бросить кости (${bet})</button></div>`;
			else body = pvpPickHtml("dice");
			b.innerHTML = `<h2>Кости</h2>${tabs(
				[
					["keeper", "С трактирщиком"],
					["player", "С игроком"],
				],
				tab,
			)}${tab === "keeper" ? lim : ""}${body}`;
			b.querySelectorAll("[data-tab]").forEach(
				(x) =>
					(x.onclick = () => {
						tab = x.dataset.tab;
						a = z = "?";
						res = cls = "";
						re("");
					}),
			);
			b.querySelectorAll("[data-bet]").forEach(
				(x) =>
					(x.onclick = () => {
						bet = +x.dataset.bet;
						re("");
					}),
			);
			if (tab === "player") pvpPickBind(b, "dice", re);
			const rb = b.querySelector("[data-roll]");
			if (rb)
				rb.onclick = async () => {
					const m = modal;
					rolling = true;
					res = cls = "";
					re("");

					let spin = true;
					const iv = setInterval(() => {
						if (!spin || !alive(m)) return clearInterval(iv);
						a = 1 + Math.floor(Math.random() * 20);
						z = 1 + Math.floor(Math.random() * 20);
						re("");
					}, 60);
					const [r] = await Promise.all([
						act("dice", { bet }),
						new Promise((ok) => setTimeout(ok, 700)),
					]);
					spin = false;
					clearInterval(iv);
					rolling = false;
					if (!alive(m)) return;
					if (!r.ok) {
						a = z = "?";
						return re("");
					}
					const R = r.roll;
					a = R.a;
					z = R.z;
					if (R.res === "win") {
						res = `Победа! +${R.pay}${R.a === 20 ? " (двадцатка, ×3)" : ""}`;
						cls = "win";
						heroCheer();
					} else if (R.res === "tie") {
						res = "Ничья - ставка трактирщику";
						cls = "lose";
					} else {
						res = `Проигрыш: -${bet}`;
						cls = "lose";
					}
					if (S.D) S.D.dice = { ...S.D.dice, ...r.dice };
					re("");
				};
		});
	}

	function winArm() {
		let tab = "npc";
		say("strong", "Кто рискнёт?");
		win(
			"",
			(b, re) => {
				const d = D(),
					X = d.arm || {},
					top = (d.tops && d.tops.arm) || { rows: [] };
				let body = "";
				if (tab === "npc")
					body = `<div class="card"><div class="grow"><b>Силач Громобой</b><small>Попыток сегодня: ${X.n || 0} / ${X.perDay || 3}. Победа - ${coins(X.prize || 0)}.</small></div><button class="gl-btn" data-go ${(X.n || 0) >= (X.perDay || 3) ? "disabled" : ""}>Бороться</button></div>`;
				if (tab === "pl") body = pvpPickHtml("arm");
				if (tab === "top")
					body =
						topTbl(top, "Побед за неделю") +
						'<p class="gl-note">Таблица недели - с понедельника ' +
						weekAt() +
						".</p>";
				b.innerHTML = `<h2>Стол силачей</h2>${tabs(
					[
						["npc", "Силач"],
						["pl", "С игроком"],
						["top", "Неделя"],
					],
					tab,
				)}
        <p class="gl-note">По полосе бежит метка. Жми (кнопка или пробел), когда она в зелёной зоне: в самой середине - сильнее всего. Кто точнее, тот перетягивает. Сила героя даёт не больше +6%.</p>${body}<div id="tv-armBox"></div>`;
				b.querySelectorAll("[data-tab]").forEach(
					(x) =>
						(x.onclick = () => {
							armStop();
							tab = x.dataset.tab;
							re("");
						}),
				);
				if (tab === "pl") pvpPickBind(b, "arm", re);
				const g = b.querySelector("[data-go]");
				if (g)
					g.onclick = async () => {
						const m = modal;
						busyBtn(g, true);
						const r = await act("arm.start");
						if (!alive(m)) return;
						if (!r.ok) return busyBtn(g, false);
						if (S.D && S.D.arm) S.D.arm.n = r.n;
						armStart(
							b.querySelector("#tv-armBox"),
							{
								n: "Силач Громобой",
								art: "strong",
								beats: r.beats,
								acc: r.acc,
								bonus: r.bonus,
							},
							() => {
								refresh().then(() => {
									if (alive(m)) re("");
								});
							},
						);
					};
			},
			() => armStop(),
		);
	}
	const topTbl = (t, what) =>
		t && t.rows && t.rows.length
			? `<table class="gl-tbl"><tr><th>#</th><th>Игрок</th><th>${esc(what)}</th></tr>${t.rows.map((x, i) => `<tr class="${S.D && x.n === S.D.login ? "me" : ""}"><td>${i + 1}</td><td>${esc(x.n)}</td><td>${esc(x.v)}</td></tr>`).join("")}</table>${t.me && t.me.place > t.rows.length ? `<p class="gl-note">Ты - ${t.me.place} место (${esc(t.me.v)}).</p>` : ""}`
			: '<p class="gl-note">На этой неделе ещё никого.</p>';
	function armStart(box, o, done) {
		armStop();
		const bonus = o.bonus || 1.06;
		box.innerHTML = `<div class="arena"><div class="tv-arow"><div class="av dd">${heroSvg("walk")}</div><div class="tv-abar"><i id="tv-am"></i></div><div class="av dd" style="transform:scaleX(-1)">${dd("chill", o.art)}</div></div>
      <div class="meta"><span>${esc((S.D && S.D.login) || "ты")} (сила +${Math.round((bonus - 1) * 100)}%)</span><span id="tv-at">ход 1</span><span>${esc(o.n)}</span></div>
      <div class="tm-track"><div class="tm-zone" id="tv-az"><i></i></div><div class="tm-mark" id="tv-ak"></div></div>
      <div class="tm-fb"><span id="tv-f1"></span><span id="tv-f2"></span></div></div>
      <button class="gl-btn push" id="tv-ap">Жми!</button>`;
		if (document.activeElement && document.activeElement.blur)
			document.activeElement.blur();
		box
			.closest(".gl-body")
			.querySelectorAll("[data-go],[data-tab]")
			.forEach((x) => {
				x.disabled = true;
			});
		const B = o.beats || [],
			pvp = !!o.pvp;
		const st = {
			pos: 50,
			beat: 0,
			t0: 0,
			dur: 1150,
			zone: 50,
			zw: 26,
			hit: null,
			o,
			done,
			box,
			raf: 0,
			presses: [],
		};
		armGame = st;
		const q = (id) => box.querySelector("#tv-" + id);
		const newBeat = (t) => {
			const x = B[st.beat] || B[B.length - 1];
			st.beat++;
			st.t0 = t;
			st.dur = x.dur;
			st.zw = x.zw;
			st.zone = x.zone;
			st.ai = x.ai;
			st.hit = null;
			const z = q("az");
			z.style.left = st.zone - st.zw / 2 + "%";
			z.style.width = st.zw + "%";
			q("at").textContent = `ход ${st.beat}`;
		};
		const grade = (p) => {
			const d = Math.abs(p - st.zone);
			return d <= st.zw * 0.18
				? ["Отлично!", 12]
				: d <= st.zw / 2 + 2
					? ["Хорошо", 7]
					: ["Мимо", -4];
		};
		const aiGrade = (r, acc) =>
			r < acc * 0.45
				? ["Отлично!", 12]
				: r < acc
					? ["Хорошо", 7]
					: ["Мимо", -4];
		const fb = (id, g, who) => {
			const el = q(id);
			if (el) {
				el.className = g[1] > 0 ? "ok" : "no";
				el.textContent = `${who}: ${g[0]} ${g[1] > 0 ? "+" : ""}${g[1]}`;
			}
		};
		const bar = () => {
			q("am").style.left = Math.max(0, Math.min(100, st.pos)) + "%";
		};

		st.press = () => {
			if (st.hit || st.mark === undefined || st.over) return;
			st.hit = grade(st.mark);
			st.frozen = st.mark;
			st.presses[st.beat - 1] = Math.round(st.mark * 10) / 10;
			st.pos += st.hit[1] > 0 ? st.hit[1] * bonus : st.hit[1];
			fb("f1", st.hit, "Ты");
			bar();
			const btn = q("ap");
			if (btn) {
				btn.style.transform = "translateY(3px)";
				setTimeout(() => {
					btn.style.transform = "";
				}, 120);
			}
			if (st.pos >= 100 && !pvp) {
				cancelAnimationFrame(st.raf);
				armEnd();
			}
		};
		q("ap").onclick = st.press;
		const loop = (t) => {
			if (armGame !== st) return;
			if (!st.t0) newBeat(t);
			const k = (t - st.t0) / st.dur;
			st.mark = Math.min(100, k * 100);
			const shown = st.hit ? st.frozen : st.mark;
			q("ak").style.transform =
				`translateX(${(shown / 100) * q("ak").parentNode.clientWidth}px)`;
			if (k >= 1) {
				if (!st.hit) {
					st.pos -= 4;
					st.presses[st.beat - 1] = null;
					fb("f1", ["Не нажал", -4], "Ты");
				}

				if (!pvp) {
					const theirs = aiGrade(st.ai, o.acc || 0.62);
					st.pos -= theirs[1];
					fb("f2", theirs, o.n);
				}
				bar();
				q("at").textContent = "ход " + Math.min(B.length, st.beat + 1);
				if ((!pvp && st.pos <= 0) || st.beat >= B.length) return armEnd();
				newBeat(t);
			}
			st.raf = requestAnimationFrame(loop);
		};
		st.raf = requestAnimationFrame(loop);
	}
	function armPush() {
		if (armGame) armGame.press();
	}
	async function armEnd() {
		const st = armGame;
		armGame = null;
		if (!st) return;
		st.over = true;
		cancelAnimationFrame(st.raf);
		const m = modal;
		if (st.o.pvp)
			return st.o.pvp(
				st.presses.slice(0, st.beat).map((x) => (x === undefined ? null : x)),
			);
		const r = await act("arm.end", {
			presses: st.presses
				.slice(0, st.beat)
				.map((x) => (x === undefined ? null : x)),
		});
		if (!alive(m) || !st.box.isConnected) return;
		const won = !!(r.ok && r.arm && r.arm.won);
		if (won) heroCheer();
		st.box.innerHTML = `<div class="card ${won ? "ok" : ""}"><div class="grow"><b>${!r.ok ? "Не засчитано" : won ? "Победа!" : "Не в этот раз"}</b><small>${!r.ok ? esc(r.error || "") : won ? (r.prize ? `+${r.prize} бронзы. ` : "") + "Победа записана в таблицу недели." : `${esc(st.o.n)} оказался сильнее. Попробуй ещё.`}</small></div></div>`;
		setTimeout(() => {
			if (alive(m) && st.done) st.done();
		}, 1700);
	}
	function armStop() {
		if (armGame) {
			cancelAnimationFrame(armGame.raf);
			armGame = null;
		}
	}

	const GW_NAMES = GWR.NAMES,
		GW_DECK = GWR.DECK,
		GW_SPECIAL = GWR.SPECIAL,
		GW_AB = GWR.AB,
		GW_FAC = GWR.FAC,
		GW_ROWS = GWR.ROWS,
		GW_ROWN = GWR.ROWN;
	const exCard = (fac, i) => GWR.cardOf(fac, i, 0);
	function gwHelpHtml() {
		const F = GW_FAC[S.sty],
			ex = (i) => gwCard(exCard(S.sty, i));
		return `<div class="gwh">
      <h3>Цель</h3><p>Выиграть два раунда из трёх. В раунде побеждает тот, у кого в конце больше общей силы карт на столе.</p>
      <h3>Ход</h3><ol>
        <li>В начале можно заменить до 2 карт из руки: нажми карту - она уйдёт в колоду, придёт новая. Потом «Начать бой».</li>
        <li>За ход кладёшь <b>одну</b> карту: перетащи её на подсвеченный ряд или нажми карту и «Сыграть».</li>
        <li>Не хочешь больше класть - жми «Пас». Ты больше не ходишь в этом раунде, соперник может доложить карты.</li>
        <li>Раунд кончается, когда спасовали оба. Карты со стола уходят в сброс.</li></ol>
      <div class="gl-warn"><b>Главное:</b> новых карт между раундами не дают. Иногда выгоднее проиграть раунд, но сберечь карты на два следующих.</div>
      <h3>Ряды</h3><p>Карта отряда ложится только в свой ряд: ближний бой, стрелки или осада (значок внизу карты). Число в кружке - сила.</p>
      <h3>Умения карт</h3>
      <div class="gwh-ab">${[
				[ex(0), "Узы", GW_AB.bond],
				[ex(2), "Боевой дух", GW_AB.morale],
				[ex(3), "Шпион", GW_AB.spy],
				[ex(5), "Сбор", GW_AB.muster],
				[ex(6), "Лекарь", GW_AB.medic],
				[ex(4), "Герой", GW_AB.hero],
			]
				.map(
					([c, t, d]) =>
						`<div class="gwh-row">${c}<div><b>${t}</b><p>${esc(d)}</p></div></div>`,
				)
				.join("")}</div>
      <h3>Особые карты</h3>
      <div class="gwh-ab">${[
				[
					ex(12),
					"Погода",
					"Мороз, туман и дождь: сила всех карт своего ряда у обоих игроков становится 1. Героев не трогает.",
				],
				[ex(15), "Ясное небо", GW_AB.clear],
				[ex(16), "Рог командира", GW_AB.horn],
				[
					ex(17),
					"Чучело",
					GW_AB.decoy +
						" Например, забрать шпиона соперника и сыграть его самому.",
				],
				[ex(18), "Пекло", GW_AB.scorch + " Осторожно: горят и твои карты."],
			]
				.map(
					([c, t, d]) =>
						`<div class="gwh-row">${c}<div><b>${t}</b><p>${esc(d)}</p></div></div>`,
				)
				.join("")}</div>
      <h3>Умение твоей колоды - «${F[0]}»</h3><p>${esc(F[1])} Колода - по стилю канала, у соперника может быть другая.</p>
      <h3>Подсказки</h3><ul><li>Наведи мышь на карту - появится её описание, а ряды, на которые она действует, подсветятся.</li><li>Зелёная сила - карта усилена (узы, дух, рог), красная - ослаблена (погода).</li><li>Камни у ника - сколько раундов ещё можно проиграть.</li></ul>
    </div>`;
	}
	function winGw() {
		let tab = "tables",
			help = false;
		GWA.sprite(S.sty);
		win("", (b, re) => {
			const w = b.closest(".gl-win");
			if (!w.querySelector(".gl-i")) {
				w.insertAdjacentHTML(
					"afterbegin",
					'<button class="gl-i" aria-label="Как играть">i</button>',
				);
				w.querySelector(".gl-i").onclick = () => {
					help = !help;
					re("");
				};
			}
			if (help) {
				b.innerHTML = `<h2>Как играть в Гвинт</h2>${gwHelpHtml()}<div class="gl-btns"><button class="gl-btn" data-back>Понятно, к столам</button></div>`;
				b.querySelector("[data-back]").onclick = () => {
					help = false;
					re("");
				};
				w.scrollTop = 0;
				return;
			}
			const d = D(),
				G = d.gw || {},
				F = GW_FAC[S.sty];
			let body = "";
			const gwLow = lowLvlTxt("gw");
			if (tab === "tables" && gwLow)
				body = `<div class="card"><div class="grow"><b>${gwLow}</b><small>Твой герой - ${d.lvl || 0} уровня. Пока можно посмотреть «Мою колоду» и правила (i), сыграть в кости и на руку.</small></div></div>`;
			else if (tab === "tables")
				body = `${G.game && !G.game.over ? `<div class="card hi"><div class="grow"><b>Партия с Яковым не доиграна</b><small>Можно вернуться за стол.</small></div><button class="gl-btn" data-back2>Вернуться</button></div>` : ""}
        <div class="card"><div class="grow"><b>Стол Завсегдатая Якова</b><small>Тренировка · за победу ${coins(G.prize || 0)} · сегодня ${G.t || 0} / ${G.perDay || 3} · колода «${esc(GW_FAC[(G.yakov && G.yakov.fac) || "ugabugi"][0])}»</small></div><button class="gl-btn" data-yak>Сыграть</button></div>
        <h3>Стол с игроком</h3>${pvpPickHtml("gw")}`;
			if (tab === "deck")
				body = `<div class="card hi"><div class="grow"><b>Колода «${F[0]}»</b><small>Умение: ${esc(F[1])} Колода - по стилю канала.</small></div></div>
        <div class="lim"><span>25 карт</span><span>Ближний бой 8</span><span>Стрелки 6</span><span>Осада 4</span><span>Погода 4</span><span>Особые 3</span></div>
        <div class="gw-deck">${GW_DECK.map((x, i) => gwCard(exCard(S.sty, i))).join("")}</div>`;
			if (tab === "top")
				body =
					topTbl(G.top, "Побед над Яковым") +
					'<p class="gl-note">Таблица недели - с понедельника ' +
					weekAt() +
					".</p>";
			b.innerHTML = `<h2>Гвинт</h2>${tabs(
				[
					["tables", "Столы"],
					["deck", "Моя колода"],
					["top", "Неделя"],
				],
				tab,
			)}${body}`;
			b.querySelectorAll("[data-tab]").forEach(
				(x) =>
					(x.onclick = () => {
						tab = x.dataset.tab;
						re("");
					}),
			);
			if (tab === "tables") pvpPickBind(b, "gw", re);
			const yk = b.querySelector("[data-yak]");
			if (yk)
				yk.onclick = async () => {
					const m = modal;
					busyBtn(yk, true);
					say("old", "Садись, не пожалеешь!");
					const r = await act("gw.new", { fac: S.sty });
					if (!alive(m)) return;
					if (!r.ok) return busyBtn(yk, false);
					close();
					gwOpen(r);
				};
			const bk = b.querySelector("[data-back2]");
			if (bk)
				bk.onclick = async () => {
					const m = modal;
					busyBtn(bk, true);
					const r = await act("gw.view");
					if (!alive(m)) return;
					if (!r.ok) {
						await refresh();
						if (alive(m)) re("");
						return;
					}
					close();
					gwOpen(r);
				};
		});
	}

	function winGal() {
		let tab = "rec";
		win("", (b, re) => {
			const T = (S.D && S.D.tops) || {};
			let body = "";
			if (tab === "rec")
				body =
					[
						["Гвинт - побед над Яковым", T.gw, "Побед"],
						["Партии с игроками - побед", T.pvp, "Побед"],
						["Силачи - побед", T.arm, "Побед"],
						["Кости - чистый выигрыш", T.dice, "Бронзы"],
						["Поручения погреба", T.odd, "Сделано"],
					]
						.map(([t, rows, w]) => `<h3>${t}</h3>${topTbl(rows, w)}`)
						.join("") +
					'<p class="gl-note">Рекорды - за эту неделю, с понедельника ' +
					weekAt() +
					".</p>";
			else
				body = `<p class="gl-note">С галереи виден весь зал. Партии игроков этой таверны:</p>${galLiveHtml()}`;
			b.innerHTML = `<h2>Галерея</h2>${tabs(
				[
					["rec", "Рекорды таверны"],
					["live", "Сейчас играют"],
				],
				tab,
			)}${body}`;
			b.querySelectorAll("[data-tab]").forEach(
				(x) =>
					(x.onclick = () => {
						tab = x.dataset.tab;
						re("");
					}),
			);
			b.querySelectorAll("[data-watch]").forEach(
				(x) =>
					(x.onclick = () => {
						const g = PV.games.find((y) => y.id === x.dataset.watch);
						if (g) pvpWatch(g);
					}),
			);
			galRe = tab === "live" ? re : null;
		});
	}

	let pourG = null,
		mouseG = null,
		oddT = [];
	const ODD = {
		keg: 1,
		pour: 1,
		mouse: 1,
		sort: 1,
		mark: 1,
		count: 1,
		tables: 1,
		wood: 1,
		web: 1,
		apples: 1,
		recipe: 1,
		nail: 1,
		order: 1,
	};
	function winCellar() {
		let mode = "list";
		win(
			"",
			(b, re) => {
				oddStop();
				const O = (S.D && S.D.odd) || { list: [], done: 0, max: 5 },
					back = () => {
						mode = "list";
						refresh().then(() => {
							if (modal) re("");
						});
					};
				if (mode !== "list") {
					const o = O.list.find((x) => x.id === mode);
					b.innerHTML = `<h2>${esc(o.t)}</h2><div id="tv-oddBox"></div>`;
					return ODDPLAY[mode](b.querySelector("#tv-oddBox"), o, back);
				}
				b.innerHTML = `<h2>Погреб</h2><p>Трактирщик кричит сверху: «Эй, есть пара дел, пока не ушёл!»</p>
        <div class="lim"><span>Поручений сегодня: ${O.done} / ${O.max}</span><span>Новые - в ${nextAt()}</span></div>
        ${O.list.map((o) => `<div class="card${o.done ? " ok" : ""}"><div class="grow"><b>${esc(o.t)}</b><small>${esc(o.d)}</small></div><span class="price">${coins(o.pay)}</span><button class="gl-btn" data-t="${esc(o.id)}" ${o.done || !ODD[o.id] ? "disabled" : ""}>${o.done ? "Сделано" : "Взяться"}</button></div>`).join("")}
        <div class="card"><div class="grow"><span class="tag">Тайна</span><b>Старая дверь за бочками</b><small>На цепи, с ржавым замком. Говорят, за ней что-то есть. Откроется позже.</small></div><button class="gl-mini" disabled>Заперто</button></div>
        <p class="gl-note">Длинные смены «Помощника трактирщика» - на кухне (рядом, слева).</p>`;
				b.querySelectorAll("[data-t]").forEach(
					(x) =>
						(x.onclick = async () => {
							const o = O.list.find((y) => y.id === x.dataset.t),
								m = modal;
							busyBtn(x, true);
							const r = await act("odd.start", { id: o.id });
							if (!alive(m)) return;
							if (!r.ok) return busyBtn(x, false);
							oddAt = performance.now();
							if (o.walk) {
								close();
								return ODDPLAY[o.id](null, o);
							}
							mode = o.id;
							re("");
						}),
				);
			},
			() => oddStop(),
		);
	}
	function oddStop() {
		oddT.forEach(clearTimeout);
		oddT = [];
		if (pourG) {
			cancelAnimationFrame(pourG.raf);
			pourG = null;
		}
		if (mouseG) {
			clearTimeout(mouseG.tm);
			mouseG = null;
		}
	}
	let oddAt = 0;
	async function oddDone(o, ok, txt) {
		const wait = ok
			? (+o.min || 0) * 1000 + 400 - (performance.now() - oddAt)
			: 0;
		if (wait > 0) await new Promise((res) => setTimeout(res, wait));
		const r = await act("odd.done", { id: o.id, ok: !!ok });
		if (!r.ok) return;
		if (ok && !r.failed) {
			heroCheer();
			toast(`${txt || o.t + " - готово."} +${r.pay}`);
		} else toast(txt || "Не вышло. Можно попробовать ещё раз", true);
		refresh();
	}
	const later = (f, ms) => {
		const t = setTimeout(f, ms);
		oddT.push(t);
		return t;
	};
	const resCard = (box, ok, title, sub) => {
		box.innerHTML = `<div class="card ${ok ? "ok" : ""}"><div class="grow"><b>${title}</b><small>${sub || ""}</small></div></div>`;
	};

	function timingBar(box, beats, onBeat, onEnd) {
		box.innerHTML = `<div class="tm-track"><div class="tm-zone" id="tz"><i></i></div><div class="tm-mark" id="tk"></div></div><div class="tm-fb"><span id="tf"></span><span id="tn"></span></div><button class="gl-btn push" id="tp">Бей!</button>`;
		const st = {
			beat: 0,
			t0: 0,
			dur: 1100,
			zone: 50,
			zw: 20,
			hit: null,
			raf: 0,
		};
		pourG = st;
		const nb = (t) => {
			st.beat++;
			st.t0 = t;
			st.zone = 15 + Math.random() * 70;
			st.hit = null;
			const z = box.querySelector("#tz");
			z.style.left = st.zone - st.zw / 2 + "%";
			z.style.width = st.zw + "%";
			box.querySelector("#tn").textContent = `${st.beat} / ${beats}`;
		};
		st.down = () => {
			if (st.hit) return;
			const d = Math.abs(st.mark - st.zone);
			st.hit = d <= st.zw * 0.15 ? 2 : d <= st.zw / 2 ? 1 : 0;
		};
		st.up = () => {};
		box.querySelector("#tp").onclick = st.down;
		const loop = (t) => {
			if (pourG !== st) return;
			if (!st.t0) nb(t);
			const k = (t - st.t0) / st.dur;
			st.mark = Math.min(100, k * 100);
			box.querySelector("#tk").style.transform =
				`translateX(${(st.mark / 100) * box.querySelector(".tm-track").clientWidth}px)`;
			if (k >= 1) {
				const h = st.hit || 0;
				box.querySelector("#tf").innerHTML =
					`<span class="${h ? "ok" : "no"}">${["Мимо", "Хорошо", "Отлично!"][h]}</span>`;
				onBeat(h);
				if (st.beat >= beats) {
					pourG = null;
					return onEnd();
				}
				nb(t);
			}
			st.raf = requestAnimationFrame(loop);
		};
		st.raf = requestAnimationFrame(loop);
	}

	function walkTask(o, pts, carry) {
		let i = 0;
		const step = () => {
			if (i >= pts.length) {
				heroEl.classList.remove("carry", "carryw", "carryp");
				return oddDone(o, true);
			}
			const [lvl, x, sayId, txt, take] = pts[i++];
			go(lvl, x, () => {
				if (take) heroEl.classList.add(carry);
				if (sayId) say(sayId, txt);
				if (txt && !sayId) toast(txt);
				setTimeout(step, 350);
			});
		};
		step();
	}
	const ODDPLAY = {
		keg: (box, o) => {
			say("keeper", "Неси сюда, к стойке!");
			walkTask(
				o,
				[
					[0, 1900, null, "Взял бочку", 1],
					[1, 1040, "keeper", "Вот это я понимаю!"],
				],
				"carry",
			);
		},
		tables: (box, o) =>
			walkTask(o, [
				[1, 1730, null, "Стол для костей - чисто"],
				[1, 2580, null, "Длинный стол - чисто"],
				[1, 3410, "g1", "Спасибо, а то карты липли!"],
			]),
		wood: (box, o) =>
			walkTask(
				o,
				[
					[0, 3700, null, "Взял охапку дров", 1],
					[1, 2150, null, "Камин снова трещит"],
				],
				"carryw",
			),
		order: (box, o) =>
			walkTask(
				o,
				[
					[0, 900, "n7", "Жаркое готово, неси!", 1],
					[1, 2470, "n4", "О, моё жаркое! Спасибо!"],
				],
				"carryp",
			),
		pour: (box, o, back) => {
			let n = 0,
				ok = 0;
			const T = TH[S.sty],
				f1 = (v) => Math.round(v * 10) / 10;
			const draw = (lvl, foam) =>
				`<div style="display:flex;justify-content:center;gap:18px;margin:10px 0">${[
					0, 1, 2,
				]
					.map((i) => {
						const l = i < n ? 100 : i === n ? lvl : 0,
							f = i === n && foam;
						return `<svg viewBox="0 0 100 130" width="90" height="117"><rect x="14" y="20" width="62" height="96" rx="8" fill="#fff8e8" stroke="${T.ink}" stroke-width="5"/><rect x="18" y="${f1(112 - (88 * Math.min(l, 100)) / 100)}" width="54" height="${f1((88 * Math.min(l, 100)) / 100)}" fill="${f ? "#fffaf0" : "#e8a020"}"/><path d="M76 40 q20 0 20 22 q0 22 -20 22" fill="none" stroke="${T.ink}" stroke-width="5"/><line x1="10" y1="${f1(112 - 88 * 0.72)}" x2="80" y2="${f1(112 - 88 * 0.72)}" stroke="#2f8a3a" stroke-width="3"/><line x1="10" y1="${f1(112 - 88 * 0.86)}" x2="80" y2="${f1(112 - 88 * 0.86)}" stroke="#c0504a" stroke-width="3"/></svg>`;
					})
					.join("")}</div>`;
			box.innerHTML = `<p class="gl-note">Держи кнопку (или пробел) - эль льётся. Отпусти между зелёной и красной чертой. Перелил - кружка в пене.</p><div id="pw"></div><div class="res" id="pr">Кружка 1 из 3</div><button class="gl-btn push" id="pb">Лить</button>`;
			const st = { lvl: 0, hold: false, last: performance.now(), raf: 0 };
			pourG = st;
			const paint = () => {
				box.querySelector("#pw").innerHTML = draw(st.lvl, st.lvl > 86);
			};
			paint();
			const finish = () => {
				const good = st.lvl >= 72 && st.lvl <= 86;
				if (good) ok++;
				box.querySelector("#pr").textContent = good
					? "Ровно по черте!"
					: st.lvl > 86
						? "Перелил - одна пена"
						: "Маловато";
				n++;
				st.lvl = 0;
				if (n >= 3) {
					pourG = null;
					paint();
					box.querySelector("#pb").disabled = true;
					later(() => {
						oddDone(
							o,
							ok >= 2,
							ok >= 2
								? `Разлито ровно: ${ok} из 3.`
								: `Ровно только ${ok} из 3 - трактирщик недоволен`,
						);
						back();
					}, 1200);
					return;
				}
				later(() => {
					if (pourG === st) {
						box.querySelector("#pr").textContent = `Кружка ${n + 1} из 3`;
						paint();
					}
				}, 700);
			};
			const loop = (t) => {
				if (pourG !== st) return;
				const dt = Math.min(0.05, (t - st.last) / 1000);
				st.last = t;
				if (st.hold) {
					st.lvl += 46 * dt;
					paint();
				}
				st.raf = requestAnimationFrame(loop);
			};
			st.down = () => {
				if (!st.hold && n < 3) st.hold = true;
			};
			st.up = () => {
				if (st.hold) {
					st.hold = false;
					finish();
				}
			};
			const pb = box.querySelector("#pb");
			pb.addEventListener("pointerdown", st.down);
			pb.addEventListener("pointerup", st.up);
			pb.addEventListener("pointerleave", st.up);
			st.raf = requestAnimationFrame(loop);
		},
		mouse: (box, o, back) => {
			const T = TH[S.sty],
				st = { hits: 0, at: -1, t0: performance.now(), tm: 0 };
			mouseG = st;
			const barrel = (i) =>
				`<button class="gl-mini" data-b="${i}" aria-label="Бочка ${i + 1}"><svg viewBox="0 0 80 70" width="64" height="56"><ellipse cx="40" cy="38" rx="30" ry="28" fill="${T.beamL}" stroke="${T.ink}" stroke-width="4"/><path d="M12 30 h56 M12 46 h56" stroke="${T.metal}" stroke-width="5"/>${st.at === i ? `<ellipse cx="40" cy="14" rx="14" ry="11" fill="#9a9aa2" stroke="${T.ink}" stroke-width="3"/><circle cx="30" cy="6" r="6" fill="#c8c8d0" stroke="${T.ink}" stroke-width="3"/><circle cx="50" cy="6" r="6" fill="#c8c8d0" stroke="${T.ink}" stroke-width="3"/><circle cx="35" cy="13" r="2.5" fill="${T.ink}"/><circle cx="45" cy="13" r="2.5" fill="${T.ink}"/>` : ""}</svg></button>`;
			const paint = () => {
				const l = Math.max(0, 15 - (performance.now() - st.t0) / 1000);
				box.innerHTML = `<p class="gl-note">Мышь выглядывает из бочек. Поймай её 3 раза за 15 секунд.</p><div class="lim"><span>Поймано: ${st.hits} / 3</span><span>Осталось: ${l.toFixed(0)} с</span></div><div class="mini-grid" style="grid-template-columns:repeat(3,1fr)">${[0, 1, 2, 3, 4, 5, 6, 7, 8].map(barrel).join("")}</div>`;
				box.querySelectorAll("[data-b]").forEach(
					(x) =>
						(x.onclick = () => {
							if (+x.dataset.b === st.at) {
								st.hits++;
								st.at = -1;
								if (st.hits >= 3) return end(true);
								paint();
							}
						}),
				);
			};
			const end = (ok) => {
				if (mouseG) clearTimeout(mouseG.tm);
				mouseG = null;
				resCard(
					box,
					ok,
					ok ? "Поймал!" : "Убежала...",
					ok ? "Мешки с зерном спасены." : "Мышь шустрее тебя.",
				);
				later(() => {
					oddDone(o, ok, ok ? "Мышь поймана." : null);
					back();
				}, 1300);
			};
			const step = () => {
				if (mouseG !== st) return;
				if ((performance.now() - st.t0) / 1000 >= 15) return end(false);
				let n;
				do n = Math.floor(Math.random() * 9);
				while (n === st.at);
				st.at = n;
				paint();
				st.tm = setTimeout(() => {
					if (mouseG !== st) return;
					st.at = -1;
					paint();
					st.tm = setTimeout(step, 350 + Math.random() * 500);
				}, 850);
			};
			paint();
			st.tm = setTimeout(step, 600);
		},
		sort: (box, o, back) => {
			const COL = [
				["#c0504a", "красная"],
				["#3f9e5a", "зелёная"],
				["#4a7ad8", "синяя"],
			];
			let bottles = [0, 0, 1, 1, 2, 2]
					.sort(() => Math.random() - 0.5)
					.map((c, i) => ({ c, i, done: false })),
				pick = null,
				miss = 0;
			const t0 = performance.now();
			const paint = () => {
				box.innerHTML = `<p class="gl-note">Нажми бутылку, потом полку её цвета. Две ошибки - трактирщик сам переставит.</p>
          <div class="mini-grid" style="grid-template-columns:repeat(6,1fr)">${bottles.map((b) => `<button class="gl-mini${pick === b.i ? " good" : ""}" data-b="${b.i}" ${b.done ? "disabled" : ""}><svg viewBox="0 0 30 70" width="24" height="56"><path d="M8 68 v-38 q0 -8 5 -12 v-14 h4 v14 q5 4 5 12 v38 z" fill="${b.done ? "#ccc" : COL[b.c][0]}" stroke="#2b1d18" stroke-width="3"/></svg></button>`).join("")}</div>
          <div class="gl-btns">${COL.map(([c, n], i) => `<button class="gl-btn ghost" data-s="${i}" style="border-bottom:8px solid ${c}">Полка: ${n} (${bottles.filter((b) => b.done && b.c === i).length}/2)</button>`).join("")}</div><div class="lim"><span>Ошибок: ${miss} / 2</span></div>`;
				box.querySelectorAll("[data-b]").forEach(
					(x) =>
						(x.onclick = () => {
							pick = +x.dataset.b;
							paint();
						}),
				);
				box.querySelectorAll("[data-s]").forEach(
					(x) =>
						(x.onclick = () => {
							if (pick === null) return toast("Сначала выбери бутылку", true);
							const bt = bottles[pick];
							if (bt.c === +x.dataset.s) bt.done = true;
							else miss++;
							pick = null;
							if (miss >= 2) {
								resCard(
									box,
									false,
									"Перепутал полки",
									"Трактирщик ворчит и переставляет сам.",
								);
								return later(() => {
									oddDone(o, false);
									back();
								}, 1300);
							}
							if (bottles.every((b) => b.done)) {
								resCard(
									box,
									true,
									"Всё по полкам!",
									`За ${((performance.now() - t0) / 1000).toFixed(0)} с.`,
								);
								return later(() => {
									oddDone(o, true);
									back();
								}, 1200);
							}
							paint();
						}),
				);
			};
			paint();
		},
		mark: (box, o, back) => {
			const M = ["★", "☾", "♣", "♦", "♠", "✿"],
				order = M.slice().sort(() => Math.random() - 0.5),
				want = M[Math.floor(Math.random() * 6)];
			const paint = (show) => {
				box.innerHTML = `<p class="gl-note">${show ? "Запоминай метки на бочках!" : `Трактирщик: «Неси бочку с меткой <b style="font-size:20px">${want}</b>!»`}</p><div class="mini-grid" style="grid-template-columns:repeat(3,1fr)">${order.map((m, i) => `<button class="gl-mini" data-m="${i}" ${show ? "disabled" : ""} style="font-size:30px">${show ? m : "?"}</button>`).join("")}</div>`;
				if (!show)
					box.querySelectorAll("[data-m]").forEach(
						(x) =>
							(x.onclick = () => {
								const ok = order[+x.dataset.m] === want;
								resCard(
									box,
									ok,
									ok
										? "Та самая бочка!"
										: `Не та - там была ${order[+x.dataset.m]}`,
								);
								later(() => {
									oddDone(o, ok);
									back();
								}, 1300);
							}),
					);
			};
			paint(true);
			later(() => paint(false), 2600);
		},
		count: (box, o, back) => {
			const n = 8 + Math.floor(Math.random() * 7),
				opts = [n, n - 1, n + 1, n + 2].sort(() => Math.random() - 0.5);
			const sacks = Array.from(
				{ length: n },
				(_, i) =>
					`<svg viewBox="0 0 50 50" width="44" height="44" style="transform:rotate(${((i * 37) % 20) - 10}deg)"><path d="M10 46 Q4 20 18 14 L16 6 h18 l-2 8 Q46 20 40 46 Z" fill="#c8a878" stroke="#2b1d18" stroke-width="3"/></svg>`,
			).join("");
			box.innerHTML = `<p class="gl-note">Смотри внимательно - мешки видно 3 секунды.</p><div style="display:flex;flex-wrap:wrap;gap:4px;justify-content:center;min-height:100px">${sacks}</div>`;
			later(() => {
				box.innerHTML = `<p class="gl-note">Трактирщик: «Ну, сколько там мешков?»</p><div class="gl-btns" style="justify-content:center">${opts.map((v) => `<button class="gl-btn" data-v="${v}">${v}</button>`).join("")}</div>`;
				box.querySelectorAll("[data-v]").forEach(
					(x) =>
						(x.onclick = () => {
							const ok = +x.dataset.v === n;
							resCard(box, ok, ok ? "Точно!" : `Было ${n}`);
							later(() => {
								oddDone(o, ok);
								back();
							}, 1200);
						}),
				);
			}, 3000);
		},
		web: (box, o, back) => {
			const st = { webs: new Set(), got: 0, t0: performance.now(), tm: 0 };
			mouseG = st;
			const paint = () => {
				const l = Math.max(0, 12 - (performance.now() - st.t0) / 1000);
				box.innerHTML = `<p class="gl-note">Смахни 8 паутин за 12 секунд.</p><div class="lim"><span>Смахнуто: ${st.got} / 8</span><span>${l.toFixed(0)} с</span></div><div class="mini-grid" style="grid-template-columns:repeat(4,1fr)">${Array.from({ length: 12 }, (_, i) => `<button class="gl-mini" data-w="${i}">${st.webs.has(i) ? '<svg viewBox="0 0 40 40" width="40" height="40"><path d="M20 20 L2 2 M20 20 L38 2 M20 20 L2 38 M20 20 L38 38 M20 20 L20 0 M20 20 L0 20 M8 8 Q20 14 32 8 Q26 20 32 32 Q20 26 8 32 Q14 20 8 8" fill="none" stroke="#8a8a92" stroke-width="2"/></svg>' : ""}</button>`).join("")}</div>`;
				box.querySelectorAll("[data-w]").forEach(
					(x) =>
						(x.onclick = () => {
							const i = +x.dataset.w;
							if (st.webs.delete(i)) {
								st.got++;
								if (st.got >= 8) return end(true);
								paint();
							}
						}),
				);
			};
			const end = (ok) => {
				clearTimeout(st.tm);
				mouseG = null;
				resCard(box, ok, ok ? "Чистота!" : "Паука не обгонишь", "");
				later(() => {
					oddDone(o, ok);
					back();
				}, 1200);
			};
			const spawn = () => {
				if (mouseG !== st) return;
				if ((performance.now() - st.t0) / 1000 > 12) return end(false);
				if (st.webs.size < 4) {
					let i;
					do i = Math.floor(Math.random() * 12);
					while (st.webs.has(i));
					st.webs.add(i);
				}
				paint();
				st.tm = setTimeout(spawn, 550);
			};
			spawn();
		},
		apples: (box, o, back) => {
			const ap = Array.from({ length: 12 }, (_, i) => ({
				bad: false,
				gone: false,
			}));
			[0, 1, 2, 3].forEach(() => {
				let i;
				do i = Math.floor(Math.random() * 12);
				while (ap[i].bad);
				ap[i].bad = true;
			});
			let miss = 0;
			const paint = () => {
				box.innerHTML = `<p class="gl-note">Нажми все гнилые яблоки (коричневые с пятнами). Хорошие не трогай - одна ошибка прощается.</p><div class="mini-grid" style="grid-template-columns:repeat(6,1fr)">${ap.map((a, i) => `<button class="gl-mini" data-a="${i}" ${a.gone ? "disabled" : ""}>${a.gone ? "" : `<svg viewBox="0 0 40 40" width="38" height="38"><circle cx="20" cy="23" r="15" fill="${a.bad ? "#8a6a3a" : "#e04a3a"}" stroke="#2b1d18" stroke-width="3"/><path d="M20 8 v-5 M20 8 q8 -6 12 0" fill="none" stroke="#3a6a2a" stroke-width="3"/>${a.bad ? '<circle cx="14" cy="20" r="3" fill="#4a3a1a"/><circle cx="24" cy="28" r="4" fill="#4a3a1a"/>' : '<circle cx="14" cy="18" r="3" fill="#fff" opacity=".6"/>'}</svg>`}</button>`).join("")}</div><div class="lim"><span>Ошибок: ${miss} / 1</span></div>`;
				box.querySelectorAll("[data-a]").forEach(
					(x) =>
						(x.onclick = () => {
							const a = ap[+x.dataset.a];
							a.gone = true;
							if (!a.bad) miss++;
							if (miss > 1) {
								resCard(
									box,
									false,
									"Выбросил хорошие яблоки",
									"Трактирщик не доволен.",
								);
								return later(() => {
									oddDone(o, false);
									back();
								}, 1200);
							}
							if (ap.every((y) => !y.bad || y.gone)) {
								resCard(box, true, "Перебрано!", "");
								return later(() => {
									oddDone(o, true);
									back();
								}, 1100);
							}
							paint();
						}),
				);
			};
			paint();
		},
		recipe: (box, o, back) => {
			const ING = ["Лук", "Соль", "Мёд", "Хмель", "Перец", "Сыр"],
				seq = Array.from(
					{ length: 4 },
					() => ING[Math.floor(Math.random() * 6)],
				);
			let i = 0,
				got = [];
			const show = () => {
				box.innerHTML = `<p class="gl-note">Трактирщик называет, что класть в похлёбку. Запоминай порядок!</p><div class="res" style="font-size:32px;min-height:48px">${i < seq.length ? seq[i] : ""}</div><div class="lim"><span>${Math.min(i + 1, 4)} из 4</span></div>`;
				if (i < seq.length) {
					i++;
					later(show, 1000);
				} else later(ask, 300);
			};
			const ask = () => {
				box.innerHTML = `<p class="gl-note">Теперь положи в том же порядке:</p><div class="res">${got.join(" → ") || "..."}</div><div class="mini-grid" style="grid-template-columns:repeat(3,1fr)">${ING.map((n) => `<button class="gl-mini" data-i="${n}">${n}</button>`).join("")}</div>`;
				box.querySelectorAll("[data-i]").forEach(
					(x) =>
						(x.onclick = () => {
							got.push(x.dataset.i);
							const ok = got.every((g, k) => g === seq[k]);
							if (!ok || got.length === 4) {
								resCard(
									box,
									ok,
									ok ? "Похлёбка удалась!" : "Не то!",
									`Надо было: ${seq.join(" → ")}`,
								);
								return later(() => {
									oddDone(o, ok);
									back();
								}, 1500);
							}
							ask();
						}),
				);
			};
			show();
		},
		nail: (box, o, back) => {
			let good = 0;
			box.insertAdjacentHTML("beforebegin", "");
			timingBar(
				box,
				3,
				(h) => {
					if (h) good++;
				},
				() => {
					const ok = good >= 2;
					resCard(
						box,
						ok,
						ok ? "Бочка как новая!" : "Гвозди погнулись",
						`Точных ударов: ${good} из 3`,
					);
					later(() => {
						oddDone(o, ok);
						back();
					}, 1300);
				},
			);
		},
	};

	const EGGS = [
		{
			id: "clock",
			lvl: 2,
			r: [2390, 190, 2510, 310],
			say: "Часы показывают «В эфире 4:20». Чат, не спать!",
			fx: "spark",
		},
		{
			id: "f",
			lvl: 0,
			r: [100, 1910, 230, 2010],
			say: "Здесь покоится донат, который не дошёл до алерта. F",
			fx: "f",
		},
		{
			id: "bell",
			lvl: 1,
			r: [262, 1160, 312, 1236],
			say: "РЕЙД! 42 зрителя врываются в таверну!",
			fx: "raid",
		},
		{
			id: "ban",
			lvl: 1,
			r: [1330, 1140, 1460, 1300],
			say: "Бан-молот. Только для модераторов канала",
			fx: "ban",
		},
		{
			id: "sub",
			lvl: 1,
			r: [1196, 1418, 1270, 1492],
			say: "Золотая кружка - только для подписчиков канала",
			fx: "spark",
		},
		{
			id: "afk",
			lvl: 2,
			r: [2840, 480, 2960, 700],
			say: "Зубастик: «А? Я не сплю! Я в лурке»",
			fx: "afk",
		},
		{
			id: "l1",
			sty: "legion",
			lvl: 1,
			r: [2070, 1050, 2240, 1222],
			say: "Шлем центуриона: «Ave, чат! Идущие на стрим приветствуют тебя»",
			fx: "spark",
		},
		{
			id: "l2",
			sty: "legion",
			lvl: 1,
			r: [2490, 870, 2680, 1240],
			say: "LEGIO XLII - легион чата. Девиз: «Пришёл, увидел, зафолловил»",
			fx: "spark",
		},
		{
			id: "c1",
			sty: "cats",
			lvl: 1,
			r: [2050, 1110, 2260, 1222],
			say: "Кот на камине: «Мррр... кто разбудил? Я на стриме с самого начала»",
			fx: "spark",
		},
		{
			id: "c2",
			sty: "cats",
			lvl: 1,
			r: [2460, 890, 2700, 1180],
			say: "Портрет: Барсик I, основатель таверны. Первым написал «мяу» в чат",
			fx: "spark",
		},
		{
			id: "m1",
			sty: "monkeys",
			lvl: 1,
			r: [2480, 880, 2680, 1240],
			say: "Маска тики: «У-у-а-а-а!» - маска одобряет твой донат",
			fx: "spark",
		},
		{
			id: "m2",
			sty: "monkeys",
			lvl: 1,
			r: [2330, 1610, 2400, 1645],
			say: "Банановая кожура! Классика",
			fx: "slip",
			step: 2365,
		},
		{
			id: "v1",
			sty: "veggies",
			lvl: 1,
			r: [2050, 1100, 2250, 1222],
			say: "Тыква: «Бу! Я тыква-стример, смотрю на тебя»",
			fx: "pump",
		},
		{
			id: "v2",
			sty: "veggies",
			lvl: 1,
			r: [2480, 860, 2680, 1170],
			say: "Морковки созрели! Чат, кто будет салат?",
			fx: "spark",
		},
		{
			id: "b1",
			sty: "42brothers",
			lvl: 2,
			r: [2576, 206, 2824, 454],
			say: "Дискотека! 42 бокала за счёт заведения",
			fx: "disco",
		},
		{
			id: "b2",
			sty: "42brothers",
			lvl: 1,
			r: [340, 900, 600, 1120],
			say: "42 - ответ на главный вопрос жизни, вселенной и стрима",
			fx: "spark",
		},
		{
			id: "h1",
			sty: "cherts",
			lvl: 1,
			r: [2090, 1060, 2210, 1222],
			say: "Череп со свечой: «Я тоже когда-то был зрителем... смотрел без перерыва»",
			fx: "spark",
		},
		{
			id: "h2",
			sty: "cherts",
			lvl: 1,
			r: [2490, 860, 2680, 1220],
			say: "Голос из клетки: «Выпустите! Я только спросить, когда розыгрыш!»",
			fx: "spark",
		},
		{
			id: "u1",
			sty: "ugabugi",
			lvl: 1,
			r: [2380, 980, 2720, 1150],
			say: "Наскальный рисунок: первый в истории стрим. Зрителей - 2 (мамонт и Уга)",
			fx: "spark",
		},
		{
			id: "u2",
			sty: "ugabugi",
			lvl: 2,
			r: [2550, 280, 2850, 380],
			say: "Уга нашёл кость! Уга доволен. Уга фолловит",
			fx: "spark",
		},
	];

	try {
		for (const k of JSON.parse(localStorage.getItem("tvEggs") || "[]"))
			S.eggs.add(String(k));
	} catch (e) {}
	const eggsHere = () => EGGS.filter((e) => !e.sty || e.sty === S.sty);
	function eggAt(p) {
		return eggsHere().find(
			(e) => p.x >= e.r[0] && p.x <= e.r[2] && p.y >= e.r[1] && p.y <= e.r[3],
		);
	}
	function eggScreen(e) {
		return {
			x: ((e.r[0] + e.r[2]) / 2 - cam.x) * cam.s,
			y: (e.r[1] - cam.y) * cam.s,
		};
	}
	function eggFx(e) {
		const key = S.sty + ":" + e.id,
			first = !S.eggs.has(key);
		S.eggs.add(key);
		try {
			localStorage.setItem("tvEggs", JSON.stringify([...S.eggs].slice(-200)));
		} catch (e) {}
		const n = eggsHere().filter((x) => S.eggs.has(S.sty + ":" + x.id)).length,
			all = eggsHere().length;
		toast(e.say + (first ? `  (пасхалка ${n} из ${all})` : ""));
		$("eggs").hidden = false;
		$("eggs").textContent = `Пасхалки: ${n} / ${all}`;
		const p = eggScreen(e),
			burst = (txt, k, dx, dy, delay) => {
				const d = document.createElement("div");
				d.className = "egg-fx";
				d.textContent = txt;
				d.style.left = p.x + (dx || 0) + "px";
				d.style.top = p.y + (dy || 0) + "px";
				d.style.animationDelay = (delay || 0) + "ms";
				game.append(d);
				setTimeout(() => d.remove(), 1800 + (delay || 0));
			};
		if (e.fx === "spark")
			for (let i = 0; i < 5; i++)
				burst("✦", 0, (i - 2) * 26, (i % 2) * 14, i * 90);
		if (e.fx === "f")
			for (let i = 0; i < 12; i++)
				burst("F", 0, (Math.random() - 0.5) * 220, Math.random() * 40, i * 110);
		if (e.fx === "raid") {
			cheer(3500);
			say("keeper", "Гости! Наливаем всем!", 3000);
			for (let i = 0; i < 8; i++)
				burst("!", 0, (Math.random() - 0.5) * 300, 0, i * 120);
		}
		if (e.fx === "ban") {
			say("keeper", "Не трогай! Это для модераторов!", 2600);
			burst("⚒", 0, 0, 0, 0);
		}
		if (e.fx === "afk") {
			say("n6", "А? Я в лурке!", 2600);
			burst("Z", 0, -20, 0, 0);
			burst("z", 0, 10, 10, 200);
		}
		if (e.fx === "pump") {
			const f = root && root.querySelector("#tv-pumpface");
			if (f) {
				f.classList.add("on");
				setTimeout(() => f.classList.remove("on"), 5000);
			}
		}
		if (e.fx === "slip") {
			heroEl.classList.add("slip");
			setTimeout(() => heroEl.classList.remove("slip"), 950);
		}
		if (e.fx === "disco") {
			const d = document.createElement("div");
			d.className = "disco";
			d.innerHTML = [
				"#ff5fa8",
				"#ffc83d",
				"#5fd8ff",
				"#9a5fff",
				"#5fff9a",
				"#ff8a3a",
			]
				.map(
					(c, i) =>
						`<i style="background:${c};left:${(i * 17) % 70}%;top:${(i * 29) % 50}%;animation-delay:${i * 180}ms"></i>`,
				)
				.join("");
			game.append(d);
			setTimeout(() => d.remove(), 6000);
			cheer(5500);
		}
	}

	let slipAt = 0;
	function eggStep() {
		for (const e of eggsHere())
			if (
				e.step &&
				hero.lvl === e.lvl &&
				Math.abs(hero.x - e.step) < 30 &&
				Math.abs(hero.y - FL[e.lvl]) < 2 &&
				performance.now() - slipAt > 10000
			) {
				slipAt = performance.now();
				eggFx(e);
			}
	}

	let GW = null;
	const gwPower = (G, pi, row, c) => GWR.power(G, pi, row, c);
	const gwRow = (G, pi, row) => GWR.rowSum(G, pi, row);
	const gwTotal = (G, pi) => GWR.total(G, pi);
	const gwArt = (fac, c) => GWA.art(fac, c);
	const rowIco = (r) =>
		({
			m: '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M5 19 L17 7 M14 4 l6 6 M4 20 l3 -1 l-2 -2 z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
			r: '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M6 3 q12 9 0 18 M6 3 v18 M3 12 h16 l-3 -3 M19 12 l-3 3" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
			s: '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M3 18 h18 M6 18 l3 -8 l9 -5 M18 5 a2 2 0 1 0 0.1 0 M7 21 a2 2 0 1 0 0.1 0 M17 21 a2 2 0 1 0 0.1 0" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
		})[r] || "";
	const abShort = {
		bond: "Узы",
		morale: "+1",
		spy: "Шпион",
		muster: "Сбор",
		medic: "Лекарь",
		hero: "Герой",
	};
	function gwCard(c, pw, cls) {
		const special = !c.unit,
			base = c.ab === "hero" ? c.base : c.base + (c.bonus || 0);
		const pcls =
			pw === undefined ? "" : pw > base ? " up" : pw < base ? " down" : "";
		const fresh = GW && c.uid && !GW.seen.has(c.uid);
		if (fresh) GW.seen.add(c.uid);
		return `<div class="gc${fresh ? " new" : ""}${special ? " sp" : ""}${c.ab === "hero" ? " hero" : ""}${cls || ""}" data-uid="${c.uid}" title="${esc(c.name + " - " + (GW_AB[c.ab] || ""))}">
      <div class="gimg">${gwArt(c.fac, c)}</div>
      ${special ? `<span class="gpw sp">${c.ab[0] === "w" ? "❄" : c.ab === "clear" ? "☀" : c.ab === "horn" ? "♪" : c.ab === "decoy" ? "?" : "✹"}</span>` : `<span class="gpw${pcls}">${pw === undefined ? base : pw}</span>`}
      <span class="gnm">${esc(c.name)}</span><span class="gft">${c.unit ? rowIco(c.row) : ""}${abShort[c.ab] ? `<i>${abShort[c.ab]}</i>` : ""}</span></div>`;
	}

	function gwOpen(r, o) {
		gwClose();
		held.clear();
		hero.key = 0;
		const G = r.g;
		GWA.sprite(G.p[0].fac);
		GWA.sprite(G.p[1].fac);
		GWA.sprite(S.sty);
		const el = document.createElement("div");
		el.className = "gw-full gw-tok gw-dk";
		el.dataset.gst = S.sty;
		game.append(el);
		GW = {
			G,
			el,
			sel: null,
			pend: null,
			t: 0,
			q: [],
			busy: false,
			seen: new Set(),
			done: false,
			pvp: (o && o.pvp) || "",
			watch: (o && o.watch) || "",
		};
		gwFrames(r);
	}
	function gwClose() {
		pvpStop();
		if (GW) {
			clearTimeout(GW.t);
			GW.el.remove();
			GW = null;
		}
		held.clear();
		hero.key = 0;
		dragged = false;
		drag = null;
		if (view) view.classList.remove("drag");
		camFollow();
		heroArt();
		kick();
	}

	function gwFrames(r) {
		if (!GW) return;
		const fr = (r.frames || []).slice();
		if (!fr.length) fr.push(r.g);
		GW.q = fr;
		GW.end = r.end || null;
		GW.busy = true;
		GW.sel = null;
		GW.pend = null;
		gwStep();
	}
	function gwStep() {
		if (!GW) return;
		clearTimeout(GW.t);
		if (GW.down) {
			GW.t = setTimeout(gwStep, 150);
			return;
		}
		const f = GW.q.shift();
		if (!f) {
			GW.busy = false;
			if (GW.G.banner) {
				GW.G = { ...GW.G, banner: null };
			}
			gwRender();
			if (GW.G.over) gwFinish();
			return;
		}
		GW.G = f;
		gwRender();
		const wait = f.banner ? 1900 : f.note ? 1700 : GW.q.length ? 900 : 0;
		if (GW.q.length || f.banner) GW.t = setTimeout(gwStep, wait);
		else {
			GW.busy = false;
			gwRender();
			if (GW.G.over) gwFinish();
		}
	}
	async function gwSend(op, args) {
		if (!GW || GW.busy) return;
		GW.busy = true;
		gwRender();
		if (GW.watch) {
			GW.busy = false;
			return;
		}
		const r = GW.pvp
			? await act("pvp.move", { id: GW.pvp, op2: op, ...(args || {}) })
			: await act("gw." + op, args);
		if (!GW) return;
		if (GW.pvp) {
			if (r.m) pvpGw(r.m, true);
			else if (r.gone) gwClose();
			GW && (GW.busy = false);
			if (GW) gwRender();
			return;
		}
		if (!r.ok) {
			GW.busy = false;
			if (r.g) GW.G = r.g;
			if (r.gone) {
				gwClose();
				return;
			}
			gwRender();
			return;
		}
		gwFrames(r);
	}
	function gwRender() {
		if (!GW) return;
		const { G, el } = GW,
			me = 0,
			top = 1,
			bot = 0;
		const phase = G.phase,
			myTurn =
				!GW.watch &&
				phase === "play" &&
				G.turn === me &&
				!G.p[me].passed &&
				!G.over &&
				!GW.busy;
		const side = (pi, mine) => {
			const P = G.p[pi],
				f = GW_FAC[P.fac];
			return `<div class="gw-pl${G.turn === pi && !G.over && phase === "play" ? " turn" : ""}${P.passed ? " passed" : ""}">
        <b>${esc(P.name)}</b><small>${f[0]}${P.passed ? " · пас" : ""}</small>
        <div class="gw-gems">${[0, 1].map((i) => `<i class="${i < P.gems ? "on" : ""}"></i>`).join("")}</div>
        <div class="gw-sum">${gwTotal(G, pi)}</div>
        <small title="${esc(f[1])}">${mine ? "Умение: " + esc(f[1]) : `В руке: ${P.handN} · колода ${P.deckN}`}</small></div>`;
		};
		const rowHtml = (pi, r) => {
			const P = G.p[pi],
				w = G.weather[r] && !(P.fac === "cherts" && r === "m");
			const target =
				GW.pend === "decoy" && pi === bot
					? " pick"
					: GW.sel && pi === bot && GW.pend === "horn"
						? " hornpick"
						: "";
			return `<div class="gw-row${w ? " wet w-" + r : ""}${target}" data-pi="${pi}" data-row="${r}"><span class="gw-rs">${gwRow(G, pi, r)}</span><span class="gw-horn">${P.horn[r] ? "♪" : ""}</span><span class="gw-ri">${rowIco(r)}</span><div class="gw-cards">${P.rows[r].map((c) => gwCard(c, gwPower(G, pi, r, c), GW.pend === "decoy" && pi === bot && c.unit && c.ab !== "hero" ? " can" : "")).join("")}</div></div>`;
		};
		const sel = GW.sel && G.p[bot].hand.find((c) => c.uid === GW.sel);
		const mullN = G.mull[me] || 0,
			mullDone = mullN >= GWR.MULL;
		let bar = "";
		if (GW.watch && !G.over)
			bar = `<span>Смотришь партию: ${esc(G.p[0].name)} - ${esc(G.p[1].name)}${phase === "play" ? `. Ходит ${esc(G.p[G.turn].name)}` : ". Замена карт"}</span><button class="gl-btn" data-gw="exit">Уйти с галереи</button>`;
		else if (GW.watch)
			bar = `<b>${G.winner == null || G.winner < 0 ? "Ничья" : `Победил ${esc(G.p[G.winner].name)}`}</b><button class="gl-btn" data-gw="exit">Уйти с галереи</button>`;
		else if (phase === "mull" && G.ready[me])
			bar = "<span>Ждём соперника...</span>";
		else if (phase === "mull")
			bar = `<span>Замена карт: нажми карту в руке, чтобы заменить её (осталось ${GWR.MULL - mullN}).</span>`;
		else if (phase === "first") bar = "<span>Выбери, кто ходит первым.</span>";
		else if (G.over) {
			const w = G.winner,
				E = GW.end;
			bar = `<b>${w == null || w < 0 ? "Ничья" : w === me ? "Победа!" : "Поражение"}</b>${E && E.why ? `<span>${esc(E.why)}</span>` : ""}${E && E.prize ? `<span>+${E.prize} бронзы</span>` : w === me && E && !GW.pvp ? "<span>Награда за тренировки на сегодня кончилась</span>" : ""}<button class="gl-btn" data-gw="exit">Выйти из-за стола</button>`;
		} else if (GW.busy)
			bar = `<span>${G.turn === me ? "..." : `Ходит ${esc(G.p[top].name)}...`}</span>`;
		else if (sel) {
			bar = `<span class="gw-tip"><b>${esc(sel.name)}</b> ${esc(GW_AB[sel.ab] || "")}</span>`;
			if (sel.ab === "horn")
				bar += GW_ROWS.map(
					(r) =>
						`<button class="gl-btn" data-gw="horn:${r}" ${G.p[bot].horn[r] ? "disabled" : ""}>${GW_ROWN[r]}</button>`,
				).join("");
			else if (sel.ab === "decoy")
				bar += "<span>Нажми свою карту на поле, которую вернуть в руку</span>";
			else if (
				sel.ab === "medic" &&
				G.p[bot].grave.some((x) => x.unit && x.ab !== "hero")
			)
				bar +=
					"<span>Кого вернуть из сброса:</span>" +
					G.p[bot].grave
						.filter((x) => x.unit && x.ab !== "hero")
						.slice(-6)
						.map(
							(x) =>
								`<button class="gl-mini" data-gw="med:${x.uid}">${esc(x.name)} (${x.base})</button>`,
						)
						.join("");
			else bar += '<button class="gl-btn" data-gw="play">Сыграть</button>';
			bar += '<button class="gl-btn ghost" data-gw="unsel">Отмена</button>';
		} else if (myTurn)
			bar =
				'<span>Твой ход: выбери карту в руке или спасуй.</span><button class="gl-btn ghost" data-gw="pass">Пас</button>';
		else
			bar = `<span>${G.p[me].passed ? "Ты спасовал. " : ""}Ходит ${esc(G.p[G.turn].name)}...</span>`;
		const wz = GW_ROWS.filter((r) => G.weather[r])
			.map((r) => ({ m: "Мороз", r: "Туман", s: "Дождь" })[r])
			.join(", ");
		const mullPanel =
			phase === "mull" && !G.ready[me]
				? `<div class="gw-mull"><b>Замена карт</b><p>Ходить пока нельзя. Можно заменить до 2 карт, которые не нравятся: нажми карту в руке - она уйдёт в колоду, а придёт случайная новая.</p>
        <div class="gw-mslots">${[0, 1].map((i) => `<i class="${i < mullN ? "on" : ""}">${i < mullN ? "✓" : i + 1}</i>`).join("")}<span>Заменено: ${mullN} из 2</span></div>
        <button class="gl-btn gw-mgo" data-gw="start" ${GW.busy ? "disabled" : ""}>${mullN ? "Начать бой" : "Оставить руку и начать бой"}</button></div>`
				: phase === "first" && G.chooser === me
					? `<div class="gw-mull"><b>Кто ходит первым?</b><p>Умение 42 Братух: решаешь ты.</p><div class="gl-btns" style="justify-content:center"><button class="gl-btn" data-gw="first0">Я первый</button><button class="gl-btn ghost" data-gw="first1">Соперник первый</button></div></div>`
					: "";
		const mullOn = phase === "mull" && !G.ready[me];
		el.innerHTML = `<div class="gw-in${mullOn || phase === "first" ? " mull" : ""}${mullDone ? " mulldone" : ""}">
      <div class="gw-side">${side(top, false)}<div class="gw-wx">${wz ? "Погода: " + wz : "Погода ясная"}<small>Раунд ${G.round} из 3</small></div>${side(bot, true)}
        <button class="gl-btn ghost gw-rules" data-gw="help">i  Как играть</button>
        <button class="gl-btn ghost gw-leave" data-gw="${GW.watch ? "exit" : "leave"}">${GW.watch ? "Уйти с галереи" : G.over ? "Выйти из-за стола" : "Сдаться"}</button></div>
      <div class="gw-board">
        <div class="gw-half gw-htop">${["s", "r", "m"].map((r) => rowHtml(top, r)).join("")}</div>
        <div class="gw-half gw-hbot">${["m", "r", "s"].map((r) => rowHtml(bot, r)).join("")}</div>
        ${mullPanel}
        <div class="gw-bar">${bar}</div>
        <div class="gw-hand">${G.p[bot].hand
					.slice()
					.sort((a, b) =>
						a.unit === b.unit
							? GW_ROWS.indexOf(a.row) - GW_ROWS.indexOf(b.row) ||
								b.base - a.base
							: a.unit
								? -1
								: 1,
					)
					.map((c) => gwCard(c, undefined, c.uid === GW.sel ? " sel" : ""))
					.join("")}</div>
        <div class="gw-log">${(G.log || []).slice(0, 3).map(esc).join("<br>")}</div>
      </div>
      <div class="gw-tipbox" hidden></div>
      ${GW.help ? `<div class="gw-help"><div class="gw-help-in"><button class="gl-x" data-gw="help" aria-label="Закрыть">×</button><h2>Как играть в Гвинт</h2>${gwHelpHtml()}</div></div>` : ""}
      ${G.note ? `<div class="gw-note">${esc(G.note)}</div>` : ""}
      ${G.banner ? `<div class="gw-banner"><b>${esc(G.banner.text)}</b><span>${G.banner.s[bot]} : ${G.banner.s[top]}</span></div>` : ""}
    </div>`;
		gwDragBind(el, myTurn);
		const findCard = (uid) => {
			for (const P of G.p) {
				for (const r of GW_ROWS) {
					const c = P.rows[r].find((x) => x.uid === uid);
					if (c) return c;
				}
				const h = P.hand.find((x) => x.uid === uid);
				if (h) return h;
			}
			return null;
		};
		el.onpointerover = (ev) => {
			if (ev.pointerType && ev.pointerType !== "mouse") return;
			const gc = ev.target.closest(".gc");
			if (!gc || gc.classList.contains("ghost")) return;
			const c = findCard(+gc.dataset.uid);
			if (c) gwHover(el, c, true);
		};
		el.onpointerout = (ev) => {
			const gc = ev.target.closest(".gc");
			if (gc && !gc.contains(ev.relatedTarget)) gwHover(el, null, false);
		};
		if (sel) gwHover(el, sel, true);
		el.onclick = (ev) => {
			if (GW.dragged && performance.now() - GW.dragged < 350) {
				GW.dragged = 0;
				return;
			}
			GW.dragged = 0;
			const b = ev.target.closest("[data-gw]"),
				card = ev.target.closest(".gc"),
				rowEl = ev.target.closest(".gw-row");
			if (b) return gwBtn(b.dataset.gw);
			if (G.over || G.banner || GW.busy) return;
			if (card && card.closest(".gw-hand")) {
				const uid = +card.dataset.uid;
				if (phase === "first") return;
				if (phase === "mull") {
					if (!G.ready[me] && mullN < GWR.MULL) gwSend("mull", { uid });
					return;
				}
				if (!myTurn) return;
				if (GW.sel === uid) {
					const c = G.p[me].hand.find((x) => x.uid === uid);
					if (c && !["horn", "decoy", "medic"].includes(c.ab))
						return gwSend("play", { uid });
				}
				GW.sel = uid;
				const c = G.p[me].hand.find((x) => x.uid === uid);
				GW.pend =
					c && c.ab === "decoy"
						? "decoy"
						: c && c.ab === "horn"
							? "horn"
							: null;
				gwRender();
				return;
			}
			if (GW.pend === "decoy" && card && rowEl && +rowEl.dataset.pi === me)
				return gwSend("play", { uid: GW.sel, target: +card.dataset.uid });
			if (GW.pend === "horn" && rowEl && +rowEl.dataset.pi === me) {
				const r = rowEl.dataset.row;
				if (G.p[me].horn[r]) return;
				return gwSend("play", { uid: GW.sel, row: r });
			}
		};
	}

	function gwDragBind(el, myTurn) {
		const { G } = GW,
			me = 0,
			top = 1;
		let d = null;
		el.onpointerdown = (ev) => {
			GW.down = true;
			const card = ev.target.closest(".gw-hand .gc");
			if (!card || !myTurn || G.banner) return;
			const c = G.p[me].hand.find((x) => x.uid === +card.dataset.uid);
			if (!c) return;
			d = {
				c,
				card,
				x0: ev.clientX,
				y0: ev.clientY,
				ghost: null,
				id: ev.pointerId,
			};
		};
		el.onpointermove = (ev) => {
			if (!d || ev.pointerId !== d.id) return;
			const r = game.getBoundingClientRect(),
				k = r.width / game.clientWidth;
			if (!d.ghost) {
				if (Math.hypot(ev.clientX - d.x0, ev.clientY - d.y0) < 8) return;
				el.setPointerCapture(ev.pointerId);
				d.ghost = d.card.cloneNode(true);
				d.ghost.classList.add("ghost");
				d.ghost.classList.remove("new", "sel");
				el.append(d.ghost);
				d.card.style.opacity = ".3";
				d.ok = GWR.targets(G, d.c, me, top);
				gwHover(el, d.c, true);
				el.querySelectorAll(".gw-row").forEach((row) => {
					if (
						d.ok.some(
							([pi, rr]) => +row.dataset.pi === pi && row.dataset.row === rr,
						)
					)
						row.classList.add("drop");
				});
			}
			d.ghost.style.transform = `translate(${(ev.clientX - r.left) / k - 46}px, ${(ev.clientY - r.top) / k - 66}px) rotate(-4deg)`;
			const under = document.elementFromPoint(ev.clientX, ev.clientY),
				row = under && under.closest(".gw-row");
			el.querySelectorAll(".gw-row.over").forEach((x) => {
				if (x !== row) x.classList.remove("over");
			});
			if (row && row.classList.contains("drop")) row.classList.add("over");
		};
		const end = (ev) => {
			if (!d) return;
			const was = d;
			d = null;
			if (!was.ghost) return;
			GW.dragged = performance.now();
			const under = document.elementFromPoint(ev.clientX, ev.clientY),
				row = under && under.closest(".gw-row.drop"),
				onCard = under && under.closest(".gw-row .gc");
			was.ghost.remove();
			was.card.style.opacity = "";
			el.querySelectorAll(".gw-row.drop").forEach((x) =>
				x.classList.remove("drop", "over"),
			);
			gwHover(el, null, false);
			if (!row) return;
			const c = was.c,
				r = row.dataset.row;
			if (c.ab === "decoy") {
				const t = onCard && +onCard.dataset.uid,
					ok =
						t &&
						G.p[me].rows[r].some(
							(x) => x.uid === t && x.unit && x.ab !== "hero",
						);
				if (!ok) return toast("Чучело кладут на свою карту отряда", true);
				return gwSend("play", { uid: c.uid, target: t });
			}
			if (
				c.ab === "medic" &&
				G.p[me].grave.filter((x) => x.unit && x.ab !== "hero").length > 1
			) {
				GW.sel = c.uid;
				GW.pend = null;
				gwRender();
				return toast("Лекарь: выбери, кого вернуть из сброса");
			}
			gwSend("play", c.ab === "horn" ? { uid: c.uid, row: r } : { uid: c.uid });
		};
		el.onpointerup = (ev) => {
			GW.down = false;
			end(ev);
		};
		el.onpointercancel = () => {
			GW.down = false;
			if (d && d.ghost) {
				d.ghost.remove();
				d.card.style.opacity = "";
				el.querySelectorAll(".gw-row.drop").forEach((x) =>
					x.classList.remove("drop", "over"),
				);
			}
			d = null;
		};
	}
	const GW_FX = {
		wm: "мороз",
		wr: "туман",
		ws: "дождь",
		clear: "погода уйдёт",
		horn: "сила ×2",
		scorch: "сгорит",
		decoy: "можно забрать",
	};
	function gwHover(el, c, on) {
		el.querySelectorAll(".gw-row.aff, .gc.aff, .gc.burn").forEach((x) =>
			x.classList.remove("aff", "burn"),
		);
		el.querySelectorAll(".gw-row .gw-fx").forEach((x) => x.remove());
		const tip = el.querySelector(".gw-tipbox");
		if (!on || !c) {
			if (tip) tip.hidden = true;
			return;
		}
		const A2 = GWR.affect(GW.G, c, 0, 1);
		A2.rows.forEach(([pi, r]) => {
			const row = el.querySelector(`.gw-row[data-pi="${pi}"][data-row="${r}"]`);
			if (row) {
				row.classList.add("aff");
				if (!c.unit)
					row.insertAdjacentHTML(
						"beforeend",
						`<span class="gw-fx">${GW_FX[c.ab] || ""}</span>`,
					);
			}
		});
		A2.cards.forEach((uid) => {
			const x = el.querySelector(`.gw-row .gc[data-uid="${uid}"]`);
			if (x) x.classList.add(c.ab === "scorch" ? "burn" : "aff");
		});
		if (tip) {
			const rowTxt = c.unit
				? GW_ROWN[c.row] + (c.ab === "spy" ? " соперника" : "")
				: "особая карта";
			tip.innerHTML = `<b>${esc(c.name)}</b><span>${c.unit ? `Сила ${c.base}${c.bonus ? " +" + c.bonus : ""} · ` : ""}${rowTxt}</span><p>${esc(GW_AB[c.ab] || "")}</p>`;
			tip.hidden = false;
		}
	}
	function gwBtn(k) {
		if (!GW) return;
		if (k === "help") {
			GW.help = !GW.help;
			return gwRender();
		}
		const { G } = GW;
		if (k === "start") return gwSend("ready");
		if (k === "first0" || k === "first1")
			return gwSend("first", { first: k === "first0" ? 0 : 1 });
		if (k === "pass") return gwSend("pass");
		if (k === "unsel") {
			GW.sel = null;
			GW.pend = null;
			return gwRender();
		}
		if (k === "play") return gwSend("play", { uid: GW.sel });
		if (k.startsWith("horn:"))
			return gwSend("play", { uid: GW.sel, row: k.slice(5) });
		if (k.startsWith("med:"))
			return gwSend("play", { uid: GW.sel, target: +k.slice(4) });
		if (k === "leave") {
			if (!G.over) {
				if (GW.busy) return;
				return gwSend("quit");
			}
			return gwExit();
		}
		if (k === "exit") return gwExit();
	}
	function gwExit() {
		if (GW && (GW.pvp || GW.watch)) {
			gwClose();
			refresh();
			return;
		}
		void api({ op: "gw.close" });
		gwClose();
		refresh();
	}
	function gwFinish() {
		if (!GW || GW.done) return;
		GW.done = true;
		if (GW.G.winner === 0 && !GW.watch) heroCheer();
	}

	const PV = {
		inv: [],
		sent: null,
		game: null,
		games: [],
		gsig: "",
		id: "",
		watch: "",
		t: 0,
		v: -1,
		busy: false,
		dice: null,
		kindOf: {},
	};
	let galRe = null,
		pvBet = { dice: 0, gw: 0, arm: 0 },
		pvQ = { dice: "", gw: "", arm: "" };

	const lowLvlTxt = (kind) => {
		const d = D(),
			n = d.minLvl && +d.minLvl[kind];
		return n && (+d.lvl || 0) < n
			? `${kind === "gw" ? "Гвинт" : "Эта игра"} - с ${n} уровня героя`
			: "";
	};
	const KIND_N = { dice: "кости", gw: "Гвинт", arm: "борьбу на руку" };
	const KIND_T = { dice: "Кости", gw: "Гвинт", arm: "На руку" };
	const callTxt = (kind) =>
		kind === "arm" ? "бороться на руку" : "в " + (KIND_N[kind] || kind);
	function otherAt(p) {
		for (const w of others.values())
			if (
				Math.abs(p.x - w.x) < 70 &&
				p.y <= FL[w.lvl] + 10 &&
				p.y >= FL[w.lvl] - 240
			)
				return w;
		return null;
	}
	function pvpSync(r) {
		PV.inv = Array.isArray(r.inv) ? r.inv : [];
		PV.sent = r.sent || null;
		PV.games = Array.isArray(r.games) ? r.games : [];

		if (r.game && r.game !== PV.id && !PV.busy) pvpOpen(r.game);
		pvpBar();
		const sig = JSON.stringify(PV.games);
		if (galRe && modal && sig !== PV.gsig) galRe("");
		PV.gsig = sig;
	}

	function pvpBar() {
		if (!game) return;
		let el = game.querySelector(".tv-inv");
		if (!el) {
			el = document.createElement("div");
			el.className = "tv-inv";
			game.append(el);
		}
		const cards = PV.inv
			.filter((v) => !PV.kindOf[v.id])
			.map(
				(v) =>
					`<div class="tv-ic"><b>${esc(v.from)}</b> зовёт ${callTxt(v.kind)}${v.bet ? ` · ставка ${coins(v.bet)}` : " · на интерес"}<span class="tv-icb"><button class="gl-btn" data-pva="${esc(v.id)}">Принять</button><button class="gl-btn ghost" data-pvd="${esc(v.id)}">Нет</button></span></div>`,
			);
		if (PV.sent)
			cards.push(
				`<div class="tv-ic">Ждём ответа <b>${esc(PV.sent.to)}</b> (${KIND_T[PV.sent.kind] || ""}${PV.sent.bet ? `, ${coins(PV.sent.bet)}` : ""})<span class="tv-icb"><button class="gl-btn ghost" data-pvc="${esc(PV.sent.id)}">Отменить</button></span></div>`,
			);
		el.innerHTML = cards.join("");
		el.hidden = !cards.length;
		el.querySelectorAll("[data-pva]").forEach(
			(b) =>
				(b.onclick = async () => {
					busyBtn(b, true);
					PV.busy = true;
					const r = await act("pvp.accept", { id: b.dataset.pva, fac: S.sty });
					PV.busy = false;
					PV.kindOf[b.dataset.pva] = 1;
					if (r.ok && r.m) pvpShow(r.m);
					else pvpBar();
				}),
		);
		el.querySelectorAll("[data-pvd]").forEach(
			(b) =>
				(b.onclick = () => {
					PV.kindOf[b.dataset.pvd] = 1;
					void api({ op: "pvp.decline", id: b.dataset.pvd });
					pvpBar();
				}),
		);
		el.querySelectorAll("[data-pvc]").forEach(
			(b) =>
				(b.onclick = async () => {
					busyBtn(b, true);
					await act("pvp.cancel", { id: b.dataset.pvc });
					PV.sent = null;
					pvpBar();
				}),
		);
	}
	async function pvpInvite(to, kind, bet) {
		const r = await act("pvp.invite", { to, kind, bet, fac: S.sty });
		if (!r.ok) return false;
		PV.sent = r.inv;
		pvpBar();
		toast(`Позвал ${to} - ждём ответа`);
		return true;
	}

	function pvpPickHtml(kind) {
		const bets = (D().pvp && D().pvp.bets) || [0, 5, 10, 25, 50, 100],
			fee = Math.round(((D().pvp && D().pvp.fee) || 0.05) * 100);
		const rule =
			kind === "dice"
				? "До двух побед: у кого больше на d20, тот берёт раунд, ничья - переброс. Проигрыш идёт в дневной предел костей."
				: kind === "arm"
					? "Оба жмут на одних и тех же ходах, кто точнее - перетягивает. Сила героя не считается - на равных."
					: "Обычная партия: колода каждого - по стилю его канала.";
		return `<p class="gl-note">${rule} Ставку вносят оба, победитель забирает обе (сбор ${fee}%).</p>
      <div class="gl-btns">${bets.map((v) => `<button class="gl-mini" data-pvb="${v}" aria-pressed="${pvBet[kind] === v}">${v ? v : "На интерес"}</button>`).join("")}</div>
      <input class="tv-pvq" type="search" maxlength="25" placeholder="Найти игрока по нику" value="${esc(pvQ[kind])}" autocomplete="off" spellcheck="false">
      <div class="tv-pvl">${pvpRows(pvQ[kind] ? null : [...others.keys()].sort(), kind)}</div>
      ${PV.sent ? `<p class="gl-note">Ждём ответа ${esc(PV.sent.to)}...</p>` : ""}`;
	}
	const PICK_N = 12;
	function pvpRows(ls, kind) {
		if (ls == null) return '<p class="gl-note">Ищу...</p>';
		if (!ls.length)
			return pvQ[kind]
				? '<div class="card"><div class="grow"><b>Никого не нашли</b><small>Игрока с таким ником сейчас нет в этой таверне.</small></div></div>'
				: '<div class="card"><div class="grow"><b>В таверне больше никого</b><small>Позови друзей в эту таверну - их будет видно в зале.</small></div></div>';
		const more =
			ls.length > PICK_N && !pvQ[kind]
				? `<p class="gl-note">Рядом ещё ${ls.length - PICK_N} - найди по нику.</p>`
				: "";
		return (
			ls
				.slice(0, PICK_N)
				.map(
					(l) =>
						`<div class="card"><div class="grow"><b>${esc(l)}</b><small>в таверне</small></div><button class="gl-btn" data-pvi="${esc(l)}" ${PV.sent ? "disabled" : ""}>Позвать</button></div>`,
				)
				.join("") + more
		);
	}
	function pvpPickBind(b, kind, re) {
		b.querySelectorAll("[data-pvb]").forEach(
			(x) =>
				(x.onclick = () => {
					pvBet[kind] = +x.dataset.pvb;
					re("");
				}),
		);
		const bindRows = () =>
			b.querySelectorAll("[data-pvi]").forEach(
				(x) =>
					(x.onclick = async () => {
						const m = modal;
						busyBtn(x, true);
						await pvpInvite(x.dataset.pvi, kind, pvBet[kind]);
						if (alive(m)) re("");
					}),
			);
		bindRows();
		const q = b.querySelector(".tv-pvq"),
			box = b.querySelector(".tv-pvl");
		if (!q || !box) return;
		let t = 0,
			n = 0;
		const find = async () => {
			const v = pvQ[kind],
				my = ++n;
			if (!v) {
				box.innerHTML = pvpRows([...others.keys()].sort(), kind);
				return bindRows();
			}
			const r = await api({ op: "who", q: v });
			if (my !== n || !box.isConnected) return;
			box.innerHTML = pvpRows(r && r.ok ? r.ls || [] : [], kind);
			bindRows();
		};
		q.oninput = () => {
			pvQ[kind] = q.value
				.toLowerCase()
				.replace(/[^a-z0-9_]/g, "")
				.slice(0, 25);
			if (q.value !== pvQ[kind]) q.value = pvQ[kind];
			clearTimeout(t);
			box.innerHTML = pvpRows(null, kind);
			t = setTimeout(find, 250);
		};
		if (pvQ[kind]) void find();
	}

	function winPlayer(l) {
		let kind = "dice";
		win("", (b, re) => {
			const bets = (D().pvp && D().pvp.bets) || [0, 5, 10, 25, 50, 100];
			b.innerHTML = `<h2>${esc(l)}</h2>${tabs(
				[
					["dice", "Кости"],
					["arm", "На руку"],
					["gw", "Гвинт"],
				],
				kind,
			)}
        <p class="gl-note">Ставка (вносят оба, победитель забирает обе):</p>
        <div class="gl-btns">${bets.map((v) => `<button class="gl-mini" data-pvb="${v}" aria-pressed="${pvBet[kind] === v}">${v ? v : "На интерес"}</button>`).join("")}</div>
        <div class="gl-btns" style="justify-content:center">${lowLvlTxt(kind) ? `<p class="gl-note">${lowLvlTxt(kind)}</p>` : ""}<button class="gl-btn" data-go ${PV.sent || lowLvlTxt(kind) ? "disabled" : ""}>Позвать ${callTxt(kind)}</button></div>`;
			b.querySelectorAll("[data-tab]").forEach(
				(x) =>
					(x.onclick = () => {
						kind = x.dataset.tab;
						re("");
					}),
			);
			b.querySelectorAll("[data-pvb]").forEach(
				(x) =>
					(x.onclick = () => {
						pvBet[kind] = +x.dataset.pvb;
						re("");
					}),
			);
			const go = b.querySelector("[data-go]");
			go.onclick = async () => {
				busyBtn(go, true);
				if (await pvpInvite(l, kind, pvBet[kind])) close();
				else busyBtn(go, false);
			};
		});
	}
	function galLiveHtml() {
		if (!PV.games.length)
			return '<div class="card"><div class="grow"><b>Сейчас никто не играет</b><small>Позови кого-нибудь в кости или Гвинт - партия появится здесь.</small></div></div>';
		return PV.games
			.map(
				(g) =>
					`<div class="card"><div class="grow"><b>${esc(g.names[0])} - ${esc(g.names[1])}</b><small>${KIND_T[g.kind] || g.kind} · счёт ${g.sc[0]}:${g.sc[1]}${g.bet ? ` · ставка ${coins(g.bet)}` : ""}${g.over ? " · кончилась" : ""}</small></div><button class="gl-btn" data-watch="${esc(g.id)}">Смотреть</button></div>`,
			)
			.join("");
	}

	async function pvpOpen(id) {
		PV.busy = true;
		const r = await api({ op: "pvp.state", id });
		PV.busy = false;
		if (r && r.ok && r.m && r.m.me && !r.m.over) pvpShow(r.m);
	}
	function pvpShow(m) {
		PV.sent = null;
		pvpBar();
		close();
		if (m.kind === "gw") gwOpen({ g: m.g }, { pvp: m.id });
		else if (m.kind === "arm") winPvpArm(m);
		else winPvpDice(m);
		PV.id = m.id;
		PV.watch = "";
		PV.v = m.v;
		pvpPoll();
	}
	function pvpWatch(g) {
		close();
		void api({ op: "pvp.state", id: g.id }).then((r) => {
			if (!r || !r.ok || !r.m)
				return toast((r && r.error) || "Партия кончилась", true);
			if (r.m.kind === "gw") gwOpen({ g: r.m.g }, { watch: g.id });
			else if (r.m.kind === "arm") winPvpArm(r.m);
			else winPvpDice(r.m);
			PV.watch = g.id;
			PV.id = "";
			PV.v = r.m.v;
			pvpPoll();
		});
	}

	function pvpGw(m) {
		if (!GW) return;
		if (m.v === PV.v && !m.over) return;
		PV.v = m.v;
		gwFrames({
			g: m.g,
			end: m.over
				? {
						winner: m.winner,
						prize: m.me && m.winner === 0 ? m.prize : 0,
						why: m.why,
					}
				: null,
		});
	}
	function pvpPoll() {
		clearInterval(PV.t);
		PV.t = setInterval(async () => {
			const id = PV.id || PV.watch;
			if (!id || !OPEN || document.hidden || PV.busy) return;
			if (GW && GW.busy && !GW.watch) return;
			PV.busy = true;
			const r = await api({ op: "pvp.state", id });
			PV.busy = false;
			if ((PV.id || PV.watch) !== id) return;
			if (!r || !r.ok || !r.m) {
				if (r && r.gone) {
					pvpStop();
					if (PV.dice && modal) PV.dice.re("");
				}
				return;
			}
			if (r.m.kind === "gw") pvpGw(r.m);
			else if (r.m.kind === "arm") {
				if (PV.arm) PV.arm.upd(r.m);
			} else if (
				PV.dice &&
				(r.m.v !== PV.dice.m.v || r.m.over !== PV.dice.m.over)
			) {
				PV.dice.m = r.m;
				if (alive(PV.dice.modal)) PV.dice.re("");
			}
			if (r.m.over && r.m.kind !== "arm") {
				if (r.m.me && r.m.winner === 0 && r.m.kind === "dice") heroCheer();
				pvpStop();
				refresh();
			}
		}, 1000);
	}
	function pvpStop() {
		clearInterval(PV.t);
		PV.t = 0;
		PV.id = "";
		PV.watch = "";
	}

	function winPvpArm(m0) {
		const st = { m: m0, phase: "", played: false, modal: null, re: null, t: 0 };
		PV.arm = st;
		const done = () => {
			clearTimeout(st.t);
			clearInterval(st.t);
			if (PV.arm === st) PV.arm = null;
			armStop();
			pvpStop();
		};
		st.upd = (m) => {
			const was = st.m;
			st.m = m;
			if (m.over) pvpStop();
			if (m.over && !was.over && alive(st.modal)) st.re("");
			else if (!st.phase && alive(st.modal) && m.arm.his !== was.arm.his) {
				const w = st.modal.querySelector(".tv-armw");
				if (w) w.textContent = waitTxt(m);
			}
		};
		const waitTxt = (m) =>
			m.me
				? m.arm.his
					? "Соперник уже закончил - ждём итог"
					: "Ждём соперника..."
				: "Смотришь с галереи";
		win(
			"",
			(b, re) => {
				st.re = re;
				st.modal = modal;
				const m = st.m,
					A = m.arm,
					me = m.me;
				const head = `<h2>На руку: ${esc(m.names[0])} - ${esc(m.names[1])}</h2>
        <div class="lim"><span>${me ? "На равных, без силы героя" : "Галерея"}</span><span>${m.bet ? `Ставка ${coins(m.bet)}, банк ${coins(m.prize)}` : "На интерес"}</span></div>`;
				if (m.over && A.res) {
					b.innerHTML = `${head}<div class="arena"><div class="tv-arow"><div class="av dd">${heroSvg("walk")}</div><div class="tv-abar"><i id="tv-am"></i></div><div class="av dd" style="transform:scaleX(-1)">${dd("chill", "strong")}</div></div>
          <div class="meta"><span>${esc(m.names[0])}</span><span id="tv-at">ход 1</span><span>${esc(m.names[1])}</span></div><div class="tm-fb"><span id="tv-f1"></span><span id="tv-f2"></span></div></div>
          <div class="res" id="tv-ares"></div>`;
					const q = (id) => b.querySelector("#tv-" + id),
						gN = (g) => (g === 12 ? "Отлично!" : g === 7 ? "Хорошо" : "Мимо");
					let pos = 50,
						i = 0;
					const fin = () => {
						const r = q("ares");
						if (!r) return;
						const w = m.winner;
						r.className = "res " + (w === 0 ? "win" : w === 1 ? "lose" : "");
						r.textContent =
							w == null
								? "Ничья - ставки назад"
								: me
									? w === 0
										? `Победа!${m.prize ? ` +${m.prize}` : ""}`
										: "Поражение"
									: `Победил ${m.names[w]}`;
						if (me && w === 0 && !st.played) heroCheer();
						st.played = true;
						refresh();
					};
					if (st.played) {
						pos = A.res.pos;
						q("am").style.left = pos + "%";
						return fin();
					}
					const step = () => {
						if (!alive(st.modal) || !q("am")) return;
						if (i >= A.res.log.length) return fin();
						const [a, z] = A.res.log[i++];
						pos = Math.max(0, Math.min(100, pos + a - z));
						q("am").style.left = pos + "%";
						q("at").textContent = "ход " + i;
						const f1 = q("f1"),
							f2 = q("f2");
						f1.className = a > 0 ? "ok" : "no";
						f1.textContent = `${me ? "Ты" : m.names[0]}: ${gN(a)}`;
						f2.className = z > 0 ? "ok" : "no";
						f2.textContent = `${m.names[1]}: ${gN(z)}`;
						st.t = setTimeout(step, 320);
					};
					st.t = setTimeout(step, 300);
					return;
				}
				if (m.over) {
					b.innerHTML = `${head}<div class="res">${m.winner == null ? "Ничья - ставки назад" : me ? (m.winner === 0 ? "Победа!" : "Поражение") : `Победил ${esc(m.names[m.winner])}`}${m.why ? ` (${esc(m.why)})` : ""}</div>`;
					refresh();
					return;
				}
				if (!me || A.mine || st.phase === "sent") {
					b.innerHTML = `${head}<p class="gl-note tv-armw" style="text-align:center">${waitTxt(m)}</p>`;
					return;
				}
				if (st.phase === "play") return;

				b.innerHTML = `${head}<div id="tv-armBox"><div class="res" id="tv-acd">Приготовься...</div></div>`;
				const t0 = performance.now() + A.in;
				const cd = () => {
					const left = t0 - performance.now(),
						el = b.querySelector("#tv-acd");
					if (!alive(st.modal) || !el) return;
					if (left > 0) {
						el.textContent = `Начинаем через ${Math.ceil(left / 1000)}`;
						st.t = setTimeout(cd, 200);
						return;
					}
					st.phase = "play";
					armStart(
						b.querySelector("#tv-armBox"),
						{
							n: m.names[1],
							art: "strong",
							beats: A.beats,
							bonus: 1,
							pvp: async (presses) => {
								st.phase = "sent";
								if (alive(st.modal)) re("");
								const r = await act("pvp.move", {
									id: m.id,
									op2: "arm",
									presses,
								});
								if (r.m) {
									st.m = r.m;
									if (alive(st.modal)) re("");
								}
							},
						},
						null,
					);
				};
				cd();
			},
			done,
		);
	}

	function winPvpDice(m0) {
		const st = { m: m0, re: null, modal: null, rolling: false };
		PV.dice = st;
		win(
			"",
			(b, re) => {
				st.re = re;
				st.modal = modal;
				const m = st.m,
					X = m.dice,
					me = m.me,
					n0 = me ? "Ты" : m.names[0],
					n1 = m.names[1];
				const last = X.hist.length ? X.hist[X.hist.length - 1] : null;
				const a = X.cur[0] != null ? X.cur[0] : last ? last[0] : "?",
					z =
						X.cur[1] != null && X.cur[1] !== 0
							? X.cur[1]
							: X.cur[1] === 0
								? "✓"
								: last
									? last[1]
									: "?";
				const res = m.over
					? (m.winner == null
							? "Ничья - ставки назад"
							: m.winner === 0
								? me
									? `Победа!${m.prize ? ` +${m.prize}` : ""}`
									: `Победил ${esc(m.names[0])}`
								: me
									? "Поражение"
									: `Победил ${esc(m.names[1])}`) +
						(m.why ? ` (${esc(m.why)})` : "")
					: !me
						? "Смотришь с галереи"
						: X.cur[0] != null
							? "Ждём бросок соперника..."
							: "Твой бросок!";
				b.innerHTML = `<h2>Кости: ${esc(m.names[0])} - ${esc(m.names[1])}</h2>
        <div class="lim"><span>До ${X.need} побед</span><span>Счёт ${X.won[0]} : ${X.won[1]}</span><span>${m.bet ? `Ставка ${coins(m.bet)}, банк ${coins(m.prize)}` : "На интерес"}</span></div>
        <div class="dice"><figure>${d20(a, m.over && m.winner === 0)}<figcaption>${esc(n0)}</figcaption></figure><figure>${d20(z, m.over && m.winner === 1)}<figcaption>${esc(n1)}</figcaption></figure></div>
        <div class="res ${m.over ? (m.winner === 0 ? "win" : "lose") : ""}">${res}</div>
        ${X.hist.length ? `<p class="gl-note">Раунды: ${X.hist.map((h) => `${h[0]}:${h[1]}`).join(", ")}</p>` : ""}
        <div class="gl-btns" style="justify-content:center">${me && !m.over ? `<button class="gl-btn" data-roll ${X.cur[0] != null || st.rolling ? "disabled" : ""}>Бросить</button><button class="gl-btn ghost" data-quit>Сдаться</button>` : ""}</div>`;
				const rb = b.querySelector("[data-roll]");
				if (rb)
					rb.onclick = async () => {
						st.rolling = true;
						re("");
						const r = await act("pvp.move", { id: m.id, op2: "roll" });
						st.rolling = false;
						if (r.m) st.m = r.m;
						if (alive(st.modal)) re("");
						if (r.m && r.m.over) {
							if (r.m.winner === 0) heroCheer();
							pvpStop();
							refresh();
						}
					};
				const q = b.querySelector("[data-quit]");
				if (q)
					q.onclick = async () => {
						busyBtn(q, true);
						const r = await act("pvp.move", { id: m.id, op2: "quit" });
						if (r.m) st.m = r.m;
						pvpStop();
						if (alive(st.modal)) re("");
						refresh();
					};
			},
			() => {
				if (PV.dice === st) PV.dice = null;
				pvpStop();
			},
		);
	}

	const PRES_MS = 3000,
		LOOK = new Map(),
		others = new Map();
	let presT = 0,
		presBusy = false,
		looksBusy = false;
	async function presence(first) {
		if (first) {
			clearInterval(presT);
			presT = setInterval(() => presence(), PRES_MS);
		}
		if (!OPEN || document.hidden || presBusy || !heroEl) return;
		presBusy = true;
		const r = await api({
			op: "here",
			town: S.town,
			lvl: hero.lvl,
			x: Math.round(hero.x),
			act: S.act || "",
		});
		presBusy = false;
		if (!OPEN || !r || !r.ok) return;
		syncOthers(r.online || [], r.n || 0);
		pvpSync(r);
	}
	function otherSvg(w, mood) {
		const D = window.MDDoodle,
			lk = LOOK.get(w.l);
		try {
			if (D && D.jDoodle)
				return noAnim(
					D.jDoodle(
						D.jhash(w.l),
						mood,
						false,
						{ alive: true, gear: (lk && lk.g) || {}, who: w.l, kit: "peace" },
						(lk && lk.lk) || null,
					),
				);
		} catch (e) {
			console.warn("[таверна] облик игрока", e);
		}
		return dd(mood, 1 + (D && D.jhash ? D.jhash(w.l) % 9 : 0));
	}
	function otherArt(w, force) {
		const m = w.moving ? "walk" : w.act ? "happy" : "chill";
		if (force || w.mood !== m) {
			w.mood = m;
			w.el.querySelector(".dd").innerHTML = otherSvg(
				w,
				m === "happy" ? "chill" : m,
			);
		}
	}
	function syncOthers(list, n) {
		if (!OPEN) return;
		const seen = new Set(),
			me = S.D && S.D.login;
		for (const p of list) {
			const l = String(p.l || "");
			if (!l || l === me) continue;
			seen.add(l);
			const lvl = Math.max(0, Math.min(2, +p.lvl || 0)),
				x = Math.max(RANGE[lvl][0], Math.min(RANGE[lvl][1], +p.x || 0));
			let w = others.get(l);
			if (!w) {
				w = {
					l,
					lvl,
					x,
					tx: x,
					face: 1,
					act: p.act || "",
					el: chEl({ who: l }),
					moving: false,
					mood: "",
				};
				w.el.classList.add("pl");
				$("npcF").append(w.el);
				others.set(l, w);
				otherArt(w, true);
				place(w.el, w.x, FL[w.lvl]);
			} else if (w.lvl !== lvl || Math.abs(w.x - x) > 900) {
				w.lvl = lvl;
				w.x = x;
				w.tx = x;
				place(w.el, w.x, FL[w.lvl]);
			} else w.tx = x;
			if (w.act !== (p.act || "")) {
				w.act = p.act || "";
				otherArt(w);
			}
		}
		for (const [l, w] of others)
			if (!seen.has(l)) {
				w.el.remove();
				others.delete(l);
			}
		S.here = n;
		const c = $("here");
		if (c) {
			c.hidden = n < 2;
			c.textContent = `В таверне: ${n}`;
		}
		askLooks();
		kick();
	}
	async function askLooks() {
		if (looksBusy) return;
		const ls = [...others.keys()].filter((l) => !LOOK.has(l)).slice(0, 20);
		if (!ls.length) return;
		looksBusy = true;
		const r = await api({ op: "looks", ls });
		looksBusy = false;
		if (!r || !r.ok || !r.looks) return;
		for (const l of ls) LOOK.set(l, r.looks[l] || null);
		for (const w of others.values()) if (ls.includes(w.l)) otherArt(w, true);
	}

	function othersStep(dt) {
		let any = false;
		for (const w of others.values()) {
			const d = w.tx - w.x;
			const mv = Math.abs(d) > 2;
			if (mv) {
				const st = Math.sign(d) * Math.min(Math.abs(d), 480 * dt);
				w.x += st;
				w.face = d > 0 ? 1 : -1;
				any = true;
			}
			if (mv !== w.moving) {
				w.moving = mv;
				otherArt(w);
			}
			w.el.classList.toggle("flip", w.face < 0);
			w.el.classList.toggle("walk", mv);
			if (mv) place(w.el, w.x, FL[w.lvl]);
		}
		return any;
	}

	const FRESH = {
		room: 1,
		job: 1,
		cellar: 1,
		dice: 1,
		arm: 1,
		gw: 1,
		gal: 1,
		bar: 1,
		rum: 1,
	};
	let freshAt = 0;
	function act0(h) {
		if (FRESH[h.act] && Date.now() - freshAt > 3000) {
			freshAt = Date.now();
			return refresh().then(() => {
				if (OPEN) act1(h);
			});
		}
		return act1(h);
	}
	function act1(h) {
		S.pendAct = [
			"bar",
			"dice",
			"rum",
			"arm",
			"gw",
			"room",
			"job",
			"cellar",
			"gal",
			"fire",
		].includes(h.act)
			? h.act
			: "";
		switch (h.act) {
			case "bar":
				return winBar();
			case "dice":
				return winDice();
			case "rum":
				return winRum();
			case "arm":
				return winArm();
			case "gw":
				return winGw();
			case "room":
				return winRoom(h);
			case "job":
				return winJob();
			case "cellar":
				return winCellar();
			case "exit":
				return leave();
			case "fire":
				return toast(
					"У камина тепло. Тут сидят те, кто зашёл просто поболтать",
				);
			case "gal":
				return winGal();
			case "up":
				return go(2, CONN.stT.x - 80);
			case "down2":
				return go(1, CONN.stB.x - 80);
			case "down":
				return go(0, CONN.haB.x + 140);
			case "up0":
				return go(1, CONN.haT.x + 140);
		}
	}

	function shell() {
		return `<div id="tv-game" class="gw-tok gw-dk" data-gst="${esc(S.sty)}">
      <div id="tv-view"><div id="tv-world"><svg id="tv-bg" viewBox="0 0 4400 2300"></svg><div id="tv-npcB"></div><svg id="tv-fg" viewBox="0 0 4400 2300"></svg><div id="tv-npcF"></div><div id="tv-heroL"></div></div></div>
      <div class="hud tl"><button class="chip" id="tv-back" title="Выйти на улицу">‹ На улицу</button><span class="chip t" id="tv-tname">Таверна</span></div>
      <div class="hud tr"><button class="chip" id="tv-toHero" hidden>К герою</button><span class="chip" id="tv-here" hidden></span><span class="chip" id="tv-eggs" hidden></span><span class="chip" id="tv-coins"></span></div>
      <div class="hint" id="tv-hint">${matchMedia("(pointer: coarse)").matches ? "Нажми место - герой подойдёт. Потяни пальцем - осмотреться" : "Клик - подойти, WASD - ходить (W / S - лестница и люк), тянуть мышью - смотреть, Ctrl + колесо - масштаб, Esc - выйти"}</div>
      <p class="tv-load">Входишь в таверну…</p>
    </div>`;
	}
	async function enter(o) {
		if (OPEN) return;
		S.town = o && o.town ? String(o.town).slice(0, 40) : "";
		const r = await index(true);
		if (!r || !r.ok) {
			const code =
				(window.LGSiteUi &&
					window.LGSiteUi.closedCode &&
					r &&
					r.closed &&
					window.LGSiteUi.closedCode(r)) ||
				"";
			const t =
				r && r.closed
					? "Таверна скоро откроется" + code
					: (r && r.error) || "Таверна не открылась - попробуй ещё раз";
			if (window.LGSiteUi && window.LGSiteUi.toast)
				window.LGSiteUi.toast(t, true);
			else console.warn("[таверна]", t);
			return;
		}
		if (r.streamer) {
			const t = "Стример в таверну не ходит - зайди как игрок";
			if (window.LGSiteUi && window.LGSiteUi.toast)
				window.LGSiteUi.toast(t, true);
			return;
		}
		OPEN = true;
		S.sty = styleNow();
		S.D = r;
		S.money = r.money || 0;
		root = document.createElement("div");
		root.className = "tv-root";
		root.setAttribute("role", "region");
		root.setAttribute("aria-label", "Таверна");
		root.innerHTML = shell();
		(document.fullscreenElement || document.body).appendChild(root);
		document.documentElement.classList.add("tv-full");
		try {
			if (window.LGChatOne && window.LGChatOne.dock)
				window.LGChatOne.dock("tavern", root);
		} catch (e) {
			console.warn("[таверна] чат", e);
		}
		try {
			if (window.LGCity && window.LGCity.sleep) window.LGCity.sleep();
		} catch (e) {
			console.warn("[таверна] город не уснул", e);
		}
		game = $("game");
		view = $("view");
		world = $("world");
		root.addEventListener("contextmenu", (e) => {
			if (!e.target.closest("input, textarea")) e.preventDefault();
		});
		$("back").onclick = () => leave();
		bindView();
		document.addEventListener("keydown", onKeyDown);
		document.addEventListener("keyup", onKeyUp);
		document.addEventListener("visibilitychange", onVis);
		window.addEventListener("blur", onBlur);
		window.addEventListener("resize", onResize);
		hero.x = 520;
		hero.y = FL[1];
		hero.lvl = 1;
		hero.face = 1;
		hero.pts = [];
		hero.key = 0;
		held.clear();
		cam.init = false;
		cam.free = false;
		zoom = 1;
		draw();
		const ld = root.querySelector(".tv-load");
		if (ld) ld.remove();
		kick();
		presence(true);
		later(() => {
			const h = $("hint");
			if (h) h.style.opacity = "0";
		}, 9000);

		if (r.gw && r.gw.game && !r.gw.game.over)
			toast("Партия в Гвинт ждёт тебя у стола Якова");
	}
	function onResize() {
		if (OPEN) {
			cam.init = false;
			kick();
		}
	}
	function leave() {
		if (!OPEN) return;
		OPEN = false;
		close();
		gwClose();
		oddStop();
		armStop();
		if (raf) cancelAnimationFrame(raf);
		raf = 0;
		clearInterval(presT);
		presT = 0;
		others.clear();
		void api({ op: "leave" });
		pvpStop();
		PV.inv = [];
		PV.sent = null;
		pvpBar();
		document.removeEventListener("keydown", onKeyDown);
		document.removeEventListener("keyup", onKeyUp);
		document.removeEventListener("visibilitychange", onVis);
		window.removeEventListener("blur", onBlur);
		window.removeEventListener("resize", onResize);
		try {
			if (window.LGChatOne && window.LGChatOne.dock)
				window.LGChatOne.dock("tavern", null);
		} catch (e) {
			console.warn("[таверна] чат", e);
		}
		if (root) root.remove();
		root = null;
		game = null;
		view = null;
		world = null;
		heroEl = null;
		document.documentElement.classList.remove("tv-full");
		try {
			if (window.LGCity && window.LGCity.wake) window.LGCity.wake();
		} catch (e) {
			console.warn("[таверна] город не проснулся", e);
		}
	}

	window.LGTavern = {
		on() {
			if (!IDX || Date.now() - idxAt > (IDX.ok ? 60e3 : 600e3)) void index();
			return IDX ? !!IDX.ok : null;
		},
		index: (force) => index(force),
		enter: (o) => enter(o),
		close: () => leave(),
		open: () => OPEN,

		debug: () => ({
			others: [...others.values()].map((w) => ({
				l: w.l,
				lvl: w.lvl,
				x: Math.round(w.x),
				act: w.act,
			})),
			here: S.here || 0,
			open: OPEN,
			ready: !!(OPEN && heroEl),
			hero: {
				x: Math.round(hero.x),
				y: Math.round(hero.y),
				lvl: hero.lvl,
				pts: hero.pts.length,
			},
			modal: !!modal,
			gw: GW
				? { phase: GW.G.phase, turn: GW.G.turn, over: GW.G.over, busy: GW.busy }
				: null,
			sty: S.sty,
			money: S.money,
		}),

		goHot: (id) => {
			const h = HOT.find((x) => x.id === id);
			if (h) go(h.lvl, h.x, () => act0(h));
		},
		act: (id) => {
			const h = HOT.find((x) => x.id === id);
			if (h) act0(h);
		},
	};
})();
