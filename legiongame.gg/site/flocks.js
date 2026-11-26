window.LGFlocks = (() => {
	var module = { exports: {} };
	var DAY_SHIFT = 2 * 3600e3;
	var dayOf = (ts) => new Date(+ts - DAY_SHIFT).toISOString().slice(0, 10);

	var require = () => ({
		dayOf: dayOf,
		nextDay: (ts) => Date.parse(dayOf(ts) + "T00:00:00Z") + 864e5 + DAY_SHIFT,
	});
	("use strict");

	const RU = require("./rules.js");

	const MIN = 60e3;

	const FLOCK = Object.freeze({
		BACK_FREE_MIN: 60,
		BACK_OWNED_MIN: 20,
		BACK_NOBOSS_MIN: 60,
		GROUP_MAX: 5,
		SHARES: 5,
		DAILY: 10,
		ELITE_DAILY: 5,
		PLACE_MAX: 3,
		HELP: true,
		HELP_GROUPS: 2,
		HELP_MAX: 10,
		PVP: false,
	});

	function backMin(district = {}, P = FLOCK) {
		if (district.owned) return P.BACK_OWNED_MIN;
		return district.boss === false ? P.BACK_NOBOSS_MIN : P.BACK_FREE_MIN;
	}
	const backAt = (killedAt, district, P = FLOCK) =>
		Math.round(+killedAt || 0) + backMin(district, P) * MIN;

	function stateOf(f, now) {
		const live = !!f && (f.alive || (+f.back || 0) <= now);
		return {
			alive: live,
			fight: !!(live && f.busy && f.busy.fight),
			busy: !!(live && f.busy),
			backIn: live ? 0 : Math.max(0, (+f.back || 0) - now),
		};
	}

	const make = (place, i = 0) => ({
		place: String(place),
		i: Math.max(0, Math.floor(+i || 0)),
		alive: true,
		back: 0,
		busy: null,
		wait: [],
	});
	const copy = (f) => ({
		...f,
		busy: f.busy ? { ...f.busy, ids: f.busy.ids.slice() } : null,
		wait: (f.wait || []).map((w) => ({ ...w, ids: w.ids.slice() })),
	});

	function refresh(f, now) {
		if (f.alive || (+f.back || 0) > now) return f;
		return { ...copy(f), alive: true, back: 0, busy: null, wait: [] };
	}

	const placeN = (spot, P = FLOCK) => {
		const n = Math.floor(+(spot && spot.n != null ? spot.n : 1));
		return Math.max(1, Math.min(P.PLACE_MAX, n || 1));
	};

	function makePlace(spot, P = FLOCK) {
		const id = spot && typeof spot === "object" ? spot.id : spot;
		return Array.from(
			{ length: placeN(spot && typeof spot === "object" ? spot : null, P) },
			(_, i) => make(id, i),
		);
	}

	function placeState(flocks, now) {
		const st = (flocks || []).map((f) => stateOf(f, now));
		const dead = st.filter((x) => !x.alive);
		return {
			n: st.length,
			alive: st.length - dead.length,
			free: st.filter((x) => x.alive && !x.busy).length,
			fight: st.filter((x) => x.fight).length,
			dead: dead.length,
			passable: st.length > 0 && dead.length === st.length,
			backIn: dead.length ? Math.min(...dead.map((x) => x.backIn)) : 0,
		};
	}

	const passable = (flocks, now) => placeState(flocks, now).passable;

	function pickFlock(flocks, now) {
		const list = flocks || [];
		for (let k = 0; k < list.length; k++) {
			const s = stateOf(list[k], now);
			if (s.alive && !s.busy) return { i: k, flock: list[k] };
		}
		return {
			i: null,
			why: list.some((f) => stateOf(f, now).alive) ? "busy" : "dead",
		};
	}

	function checkGroup(members, P = FLOCK) {
		const m = Array.isArray(members) ? members.filter(Boolean) : [];
		if (!m.length) return { ok: false, error: "в группе никого" };
		if (new Set(m.map((x) => String(x.id))).size !== m.length)
			return { ok: false, error: "один герой в группе дважды" };
		if (m.length > P.GROUP_MAX)
			return { ok: false, error: `в группе не больше ${P.GROUP_MAX}` };
		const g = m[0].guild != null ? String(m[0].guild) : null;
		if (!g && m.length > 1)
			return { ok: false, error: "без гильдии - только в одиночку" };
		if (m.some((x) => (x.guild != null ? String(x.guild) : null) !== g))
			return { ok: false, error: "группа - только из одной гильдии" };
		return { ok: true, guild: g, n: m.length };
	}

	const sharesOf = (n, P = FLOCK) => (n > 0 ? Math.min(1, P.SHARES / n) : 0);

	function splitReward(reward, ids, P = FLOCK) {
		const list = (ids || []).map(String),
			n = list.length,
			out = {};
		for (const id of list) out[id] = {};
		if (!n) return out;
		for (const [k, v] of Object.entries(reward || {})) {
			if (typeof v !== "number" || !Number.isFinite(v)) continue;
			const per = Math.max(0, Math.floor(v));
			if (n <= P.SHARES) {
				for (const id of list) out[id][k] = per;
				continue;
			}
			const total = per * P.SHARES,
				base = Math.floor(total / n);
			let rest = total - base * n;
			for (const id of list) {
				out[id][k] = base + (rest > 0 ? 1 : 0);
				if (rest > 0) rest--;
			}
		}
		return out;
	}

	function arrive(f0, group, now, P = FLOCK) {
		const f = refresh(f0, now);
		const st = stateOf(f, now);
		if (!st.alive)
			return {
				ok: false,
				error: "стая убита - вернётся позже",
				backIn: st.backIn,
			};
		const ids = ((group && group.ids) || []).map(String);
		if (!ids.length) return { ok: false, error: "в группе никого" };
		if (ids.length > P.GROUP_MAX)
			return { ok: false, error: `в группе не больше ${P.GROUP_MAX}` };
		const g = {
			gid: String(group.gid),
			guild: group.guild != null ? String(group.guild) : null,
			ids,
		};
		const nf = copy(f);
		if (!nf.busy) {
			nf.busy = { ...g, fight: false, parts: 1 };
			return { ok: true, how: "take", can: ["fight", "leave"], flock: nf };
		}
		if (nf.busy.gid === g.gid) return { ok: false, error: "группа уже у стаи" };
		const can = ["wait", "leave"];
		const same = g.guild && nf.busy.guild === g.guild;
		if (nf.busy.fight)
			return {
				ok: true,
				how: "fight",
				can: same && canHelp(nf, ids, P).ok ? ["help", ...can] : can,
				flock: nf,
			};
		if (same && nf.busy.ids.length + ids.length <= P.GROUP_MAX)
			return { ok: true, how: "merge", can: ["merge", ...can], flock: nf };
		return {
			ok: true,
			how: "busy",
			can: !same && P.PVP ? ["attack", ...can] : can,
			flock: nf,
		};
	}

	function wait(f, group, now) {
		const nf = copy(f),
			gid = String(group.gid);
		if ((nf.busy && nf.busy.gid === gid) || nf.wait.some((w) => w.gid === gid))
			return { ok: false, error: "группа уже у стаи" };
		nf.wait.push({
			gid,
			guild: group.guild != null ? String(group.guild) : null,
			ids: (group.ids || []).map(String),
			at: now,
		});
		return { ok: true, flock: nf, place: nf.wait.length };
	}

	function merge(f, group, P = FLOCK) {
		if (!f.busy) return { ok: false, error: "у стаи никого" };
		if (f.busy.fight) return { ok: false, error: "бой уже идёт" };
		const g = group.guild != null ? String(group.guild) : null;
		if (!g || f.busy.guild !== g)
			return {
				ok: false,
				error: "объединиться можно только со своей гильдией",
			};
		const ids = (group.ids || [])
			.map(String)
			.filter((id) => !f.busy.ids.includes(id));
		if (f.busy.ids.length + ids.length > P.GROUP_MAX)
			return { ok: false, error: `вместе больше ${P.GROUP_MAX}` };
		const nf = copy(f);
		nf.busy.ids.push(...ids);
		nf.wait = nf.wait.filter((w) => w.gid !== String(group.gid));
		return { ok: true, flock: nf, n: nf.busy.ids.length };
	}

	function leave(f, gid) {
		const nf = copy(f),
			id = String(gid);
		if (nf.busy && nf.busy.gid === id) {
			if (nf.busy.fight) return { ok: false, error: "бой не прерывается" };
			nf.busy = null;
			return { ok: true, flock: next(nf) };
		}
		const n = nf.wait.length;
		nf.wait = nf.wait.filter((w) => w.gid !== id);
		return n === nf.wait.length
			? { ok: false, error: "группы у стаи нет" }
			: { ok: true, flock: nf };
	}
	function next(nf) {
		if (!nf.busy && nf.wait.length) {
			const w = nf.wait.shift();
			nf.busy = {
				gid: w.gid,
				guild: w.guild,
				ids: w.ids,
				fight: false,
				parts: 1,
			};
		}
		return nf;
	}

	function canHelp(f, ids, P = FLOCK) {
		if (!P.HELP) return { ok: false, error: "подмога в бою выключена" };
		if (!f.busy || !f.busy.fight) return { ok: false, error: "боя у стаи нет" };
		const add = ids.filter((id) => !f.busy.ids.includes(id));
		if ((+f.busy.parts || 1) + 1 > P.HELP_GROUPS)
			return { ok: false, error: `в бою не больше ${P.HELP_GROUPS} групп` };
		if (f.busy.ids.length + add.length > P.HELP_MAX)
			return { ok: false, error: `в бою не больше ${P.HELP_MAX} бойцов` };
		return { ok: true, add };
	}

	function help(f, group, P = FLOCK) {
		const g = group && group.guild != null ? String(group.guild) : null;
		if (!f.busy || !f.busy.fight) return { ok: false, error: "боя у стаи нет" };
		if (!g || f.busy.guild !== g)
			return {
				ok: false,
				error: "вступить в бой можно только к своей гильдии",
			};
		const ids = (group.ids || []).map(String);
		if (!ids.length) return { ok: false, error: "в группе никого" };
		const c = canHelp(f, ids, P);
		if (!c.ok) return c;
		const nf = copy(f);
		nf.busy.ids.push(...c.add);
		nf.busy.parts = (+nf.busy.parts || 1) + 1;
		nf.wait = nf.wait.filter((w) => w.gid !== String(group.gid));
		return { ok: true, flock: nf, ids: nf.busy.ids.slice(), add: c.add };
	}

	function startFight(f, gid) {
		if (!f.busy || f.busy.gid !== String(gid))
			return { ok: false, error: "стаю держит другая группа" };
		if (f.busy.fight) return { ok: false, error: "бой уже идёт" };
		const nf = copy(f);
		nf.busy.fight = true;
		return { ok: true, flock: nf, ids: nf.busy.ids.slice() };
	}

	function endFight(f, win, now, district, P = FLOCK) {
		if (!f.busy || !f.busy.fight) return { ok: false, error: "боя у стаи нет" };
		const nf = copy(f),
			ids = nf.busy.ids.slice();
		nf.busy = null;
		if (win) {
			nf.alive = false;
			nf.back = backAt(now, district, P);
			const gone = nf.wait.map((w) => w.gid);
			nf.wait = [];
			return { ok: true, flock: nf, ids, killed: true, back: nf.back, gone };
		}
		return { ok: true, flock: next(nf), ids, killed: false };
	}

	function dailyLeft(rec, elite, now, P = FLOCK) {
		const d = RU.dayOf(now),
			r = rec && rec.d === d ? rec : { d, n: 0, e: 0 };
		const max = elite ? P.ELITE_DAILY : P.DAILY,
			used = Math.max(0, +(elite ? r.e : r.n) || 0);
		return {
			left: Math.max(0, max - used),
			max,
			used,
			reward: used < max,
			next: RU.nextDay(now),
		};
	}

	function dailyAdd(rec, elite, now) {
		const d = RU.dayOf(now),
			r =
				rec && rec.d === d
					? { d, n: +rec.n || 0, e: +rec.e || 0 }
					: { d, n: 0, e: 0 };
		if (elite) r.e++;
		else r.n++;
		return r;
	}

	module.exports = {
		FLOCK,
		backMin,
		backAt,
		stateOf,
		make,
		makePlace,
		placeN,
		placeState,
		passable,
		pickFlock,
		refresh,
		help,
		canHelp,
		checkGroup,
		sharesOf,
		splitReward,
		arrive,
		wait,
		merge,
		leave,
		startFight,
		endFight,
		dailyLeft,
		dailyAdd,
	};
	return module.exports;
})();
