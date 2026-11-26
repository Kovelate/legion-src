(() => {
	const BASE = "/site/bake/";
	const KV = 1;
	const BUDGET = 28e6;
	const PAR = 4;
	const WAIT_MS = 8000;
	const MISS_MAX = 40;
	const UP = 1.08;

	function hasher() {
		let h1 = 0xdeadbeef,
			h2 = 0x41c6ce57;
		const add = (s) => {
			s = String(s ?? "");
			for (let i = 0; i < s.length; i++) {
				const c = s.charCodeAt(i);
				h1 = Math.imul(h1 ^ c, 2654435761);
				h2 = Math.imul(h2 ^ c, 1597334677);
			}
			h1 = Math.imul(h1 ^ 0x1f, 2654435761);
			h2 = Math.imul(h2 ^ 0x1f, 1597334677);
			return api;
		};
		const hex = () => {
			const a =
				Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
				Math.imul(h2 ^ (h2 >>> 13), 3266489909);
			const b =
				Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
				Math.imul(a ^ (a >>> 13), 3266489909);
			return (
				(b >>> 0).toString(16).padStart(8, "0") +
				(a >>> 0).toString(16).padStart(8, "0")
			);
		};
		const api = { add, hex };
		return api;
	}

	const gKey = (o) => {
		const h = hasher()
			.add("g")
			.add(KV)
			.add(o.W)
			.add(o.H)
			.add(o.top || 0)
			.add(o.sky || "");
		if (o.ext) h.add("ext").add(o.ext.join(","));
		for (const l of o.layers || [])
			h.add(l.x).add(l.y).add(l.w).add(l.h).add(l.svg);
		for (const p of o.props || []) if (!p.var) h.add(p.dx || 0).add(p.svg);
		return h.hex();
	};
	const dKey = (o, g, da) => {
		const h = hasher()
			.add("d")
			.add(KV)
			.add(g)
			.add(o.skyDead || "");
		for (const l of o.layers || []) h.add(l.dead || "");
		return h
			.add((da && da.under) || "")
			.add((da && da.over) || "")
			.hex();
	};
	const pKey = (p, md) =>
		md === "d"
			? hasher()
					.add("pd")
					.add(KV)
					.add(p.dx || 0)
					.add(p.svgDead || "")
					.add(p.svg)
					.hex()
			: hasher()
					.add("p")
					.add(KV)
					.add(p.dx || 0)
					.add(p.svg)
					.hex();
	const oKeys = new WeakMap();
	const oKey = (sources) => {
		let k = oKeys.get(sources);
		if (k) return k;
		const h = hasher().add("o").add(KV);
		for (const s of sources) if (s && !s.tag) h.add(s.dx || 0).add(s.svg);
		k = h.hex();
		oKeys.set(sources, k);
		return k;
	};

	let IDX = null,
		IDXR = null;
	const getIdx = (V, opt) =>
		fetch(BASE + "index.json?v=" + encodeURIComponent((V && V.bk) || ""), {
			credentials: "same-origin",
			...(opt || {}),
		})
			.then((r) => {
				if (!r.ok) throw new Error("index.json: " + r.status);
				return r.json();
			})
			.then((j) => {
				if (!j || j.v !== KV || !j.m)
					throw new Error("index.json: не та версия");
				return j;
			});
	const index = (V) =>
		IDX ||
		(IDX = getIdx(V).catch((e) => {
			IDX = null;
			throw e;
		}));

	const indexFresh = (V) =>
		IDXR ||
		(IDXR = getIdx(V, { cache: "reload" })
			.then((j) => {
				IDX = Promise.resolve(j);
				return j;
			})
			.catch((e) => {
				IDXR = null;
				throw e;
			}));
	const MAN = new Map();
	const manifest = (f) => {
		let p = MAN.get(f);
		if (!p) {
			p = fetch(BASE + f, { credentials: "same-origin" }).then((r) => {
				if (!r.ok) throw new Error(f + ": " + r.status);
				return r.json();
			});
			p.catch(() => MAN.delete(f));
			MAN.set(f, p);
		}
		return p;
	};
	const stat = { bytes: 0, imgs: 0, decMs: 0, px: 0 };
	async function image(f) {
		const r = await fetch(BASE + f, { credentials: "same-origin" });
		if (!r.ok) throw new Error(f + ": " + r.status);
		const b = await r.blob(),
			t0 = performance.now();
		stat.bytes += b.size;
		stat.imgs++;
		let im;

		if (window.createImageBitmap) im = await createImageBitmap(b);
		else {
			const u = URL.createObjectURL(b);
			try {
				im = new Image();
				im.src = u;
				await im.decode();
			} finally {
				URL.revokeObjectURL(u);
			}
		}
		stat.decMs += performance.now() - t0;
		stat.px += im.width * im.height;
		return im;
	}
	const freeImg = (im) => {
		if (im) {
			stat.px -= im.width * im.height;
			if (im.close) im.close();
		}
	};
	const pick = (levels, k) => {
		const ls = levels.map(Number).sort((a, b) => a - b);
		for (const L of ls) if (L * UP >= k) return L;
		return ls[ls.length - 1];
	};
	const withTimeout = (p, ms, what) =>
		Promise.race([
			p,
			new Promise((_, no) =>
				setTimeout(
					() => no(new Error(what + ": нет ответа " + ms + " мс")),
					ms,
				),
			),
		]);

	const LIVE = new Set();

	function attach(o, env) {
		const P = env.P,
			need = env.need;
		let dead = false;
		const g = { s: "wait", m: null, key: gKey(o) },
			d = { s: "wait", m: null, key: "", da: undefined, p: null };
		const tiles = new Map();
		const sheets = new Map();
		const ptex = new Map();
		const st = { hit: 0, miss: 0, olHit: 0, tl: 0, reuse: 0 };

		const MISS = new Map();
		const B = { o, g, d };
		LIVE.add(B);

		B.ready = withTimeout(
			(async () => {
				let idx = await index(o.V);
				if (!idx.m[g.key]) {
					try {
						idx = await indexFresh(o.V);
					} catch (e) {
						console.warn(
							"[город] индекс запечённых мимо кэша не взялся",
							e && e.message ? e.message : e,
						);
					}
				}
				B.idx = idx;
				const f = idx.m[g.key];
				if (!f) {
					g.s = "off";
					g.why = "ключа города нет в index.json (рисунок не тот, что запечён)";
					return;
				}
				const m = await manifest(f);
				if (m.W !== o.W || m.H !== o.H || m.key !== g.key)
					throw new Error("манифест не того города");
				g.m = m;
				g.s = "on";
				g.why = "";
			})(),
			WAIT_MS,
			"запечённый город",
		)
			.catch((e) => {
				if (g.s === "wait") {
					g.s = "off";
					g.why = String(e && e.message ? e.message : e);
				}
				console.warn(
					"[город] запечённого нет - рисуем из SVG:",
					e && e.message ? e.message : e,
				);
			})
			.then(() => {
				if (d.s === "wait" && !B.idx) d.s = "off";
				need();
			});

		function deadState() {
			const da = env.dart ? env.dart() : null;
			if (da === d.da) return d.s;
			d.da = da;
			d.m = null;
			if (!B.idx) {
				d.s = g.s === "wait" ? "wait" : "off";
				if (d.s === "wait") d.da = undefined;
				return d.s;
			}
			d.key = dKey(o, g.key, da);
			const f = B.idx.m[d.key];
			if (!f) {
				d.s = "off";
				return d.s;
			}
			d.s = "wait";
			const key = d.key;
			d.p = withTimeout(manifest(f), WAIT_MS, "вариант hw")
				.then((m) => {
					if (d.key !== key) return;
					d.m = m;
					d.s = "on";
					need();
				})
				.catch((e) => {
					if (d.key === key) {
						d.s = "off";
						need();
					}
					console.warn(
						"[город] варианта hw нет - рисуем из SVG:",
						e && e.message ? e.message : e,
					);
				});
			return d.s;
		}
		B.mode = (md) => (dead ? "off" : md === "d" ? deadState() : g.s);

		const Q = [];
		let run = 0;
		function pump() {
			while (run < PAR && Q.length && !dead) {
				Q.sort((a, b) => a.pri - b.pri);
				const t = Q.shift();
				if (tiles.get(t.key) !== t) continue;
				run++;
				image(t.f)
					.then(
						(im) => {
							if (dead || tiles.get(t.key) !== t) {
								freeImg(im);
								return;
							}
							const src = new P.ImageSource({ resource: im });
							const tex = new P.Texture({
								source: src,
								frame: new P.Rectangle(1, 1, t.T, t.T),
							});
							const spr = new P.Sprite(tex);
							spr.position.set(t.x, t.y);
							spr.scale.set(1 / t.L);
							t.img = im;
							t.spr = spr;
							st.tl++;

							if (t.L === t.lv()) t.cont.addChild(spr);
							else {
								spr.visible = false;
								t.cont.addChildAt(spr, 0);
							}
							need();
						},
						(e) => {
							console.warn("[город] плитка", t.f, e);
							t.err = 1;
							if (tiles.get(t.key) === t) tiles.delete(t.key);
						},
					)
					.finally(() => {
						run--;
						pump();
					});
			}
		}
		const dropTile = (key, t) => {
			if (t.spr) {
				t.spr.destroy({ texture: true, textureSource: true });
				t.spr = null;
			}
			freeImg(t.img);
			t.img = null;
			tiles.delete(key);
		};
		const cur = { "": 0, d: 0 };

		B.tiles = (cont, vx, vy, vw, vh, md, k, now) => {
			const M = md === "d" ? d.m : g.m;
			if (!M) return 1;
			const L = pick(M.levels, k),
				T = M.T,
				s = T / L,
				TL = M.tiles[String(L)] || {};

			if (cur[md] !== L) {
				for (const t of tiles.values())
					if (t.md === md && t.L === L && t.spr && t.spr.parent === cont)
						cont.addChild(t.spr);
			}
			cur[md] = L;

			const [X0, Y0, X1, Y1] = o.ext || [0, 0, o.W, o.H];
			const i0 = Math.max(Math.floor(X0 / s), Math.floor((vx - s * 0.25) / s)),
				i1 = Math.min(
					Math.ceil(X1 / s) - 1,
					Math.floor((vx + vw + s * 0.25) / s),
				);
			const j0 = Math.max(
					Math.floor(Y0 / s),
					Math.floor((Math.max(o.ext ? Y0 : o.top || 0, vy) - s * 0.25) / s),
				),
				j1 = Math.min(
					Math.ceil(Y1 / s) - 1,
					Math.floor((vy + vh + s * 0.25) / s),
				);
			const cx = vx + vw / 2,
				cy = vy + vh / 2;
			let missing = 0,
				add = false;
			for (let i = i0; i <= i1; i++)
				for (let j = j0; j <= j1; j++) {
					const f = TL[i + "," + j];
					if (!f) continue;
					const key = md + "|" + L + "|" + i + "," + j,
						inView =
							(i + 1) * s > vx &&
							i * s < vx + vw &&
							(j + 1) * s > vy &&
							j * s < vy + vh;
					let t = tiles.get(key);
					if (!t) {
						t = {
							key,
							f,
							md,
							L,
							T,
							x: i * s,
							y: j * s,
							cont,
							used: now,
							spr: null,
							img: null,
							lv: () => cur[md],
							pri: 0,
						};
						tiles.set(key, t);
						Q.push(t);
						add = true;
					} else if (t.spr && !t.spr.visible) st.reuse++;
					t.used = now;
					t.pri =
						(inView ? 0 : 5) +
						Math.hypot(t.x + s / 2 - cx, t.y + s / 2 - cy) / 1e5;
					if (t.spr) t.spr.visible = true;
					else if (inView) missing++;
				}
			if (add) pump();

			for (const [key, t] of tiles) {
				if (t.md !== md) continue;
				if (t.L === L) {
					if (t.spr && t.used < now) t.spr.visible = false;
					continue;
				}
				if (!t.spr) {
					tiles.delete(key);
					continue;
				}
				const sz = T / t.L,
					show =
						missing > 0 &&
						t.x + sz > vx &&
						t.x < vx + vw &&
						t.y + sz > vy &&
						t.y < vy + vh;
				t.spr.visible = show;
				if (show) t.used = now;
			}

			let px = 0;
			for (const t of tiles.values()) if (t.spr) px += (T + 2) * (T + 2);
			if (px > BUDGET) {
				const far = [...tiles.entries()]
					.filter(([, t]) => t.spr && t.used < now)
					.sort((a, b) => a[1].used - b[1].used);
				while (px > BUDGET && far.length) {
					const [key, t] = far.shift();
					dropTile(key, t);
					px -= (T + 2) * (T + 2);
				}
			}
			return missing;
		};

		B.after = (mort, wave, missing) => {
			if (mort && !wave && !missing) {
				for (const t of tiles.values())
					if (t.md === "" && t.spr) t.spr.visible = false;
			} else if (!mort)
				for (const [key, t] of tiles) if (t.md === "d") dropTile(key, t);
		};

		function sheet(M, si) {
			const key = M.key + "|" + si;
			let p = sheets.get(key);
			if (!p) {
				p = image(M.sheets[si].f).then((im) => {
					if (dead) {
						freeImg(im);
						return null;
					}
					return { img: im, src: new P.ImageSource({ resource: im }) };
				});
				p.catch((e) => {
					sheets.delete(key);
					console.warn("[город] лист предметов", M.sheets[si].f, e);
				});
				sheets.set(key, p);
			}
			return p;
		}
		async function frameOf(M, table, key, k) {
			const e = M && M[table] && M[table][key];
			if (!e) return null;
			const L = pick(Object.keys(e), k),
				fr = e[String(L)];
			const sh = await sheet(M, fr[0]);
			if (!sh || dead) return null;
			const tk = M.key + "|" + table + "|" + key + "|" + L;
			let tex = ptex.get(tk);
			if (!tex) {
				tex = new P.Texture({
					source: sh.src,
					frame: new P.Rectangle(fr[1], fr[2], fr[3], fr[4]),
				});
				ptex.set(tk, tex);
			}
			return {
				tex,
				x0: fr[5],
				y0: fr[6],
				k: fr[7] || L,
				cw: fr[3],
				ch: fr[4],
				sh,
				fr,
			};
		}
		B.prop = async (p, k, md) => {
			if (dead) return null;
			await B.ready;
			const dd = md === "d",
				key = dd
					? p.__bkd || (p.__bkd = pKey(p, "d"))
					: p.__bk || (p.__bk = pKey(p, ""));
			let r = null;
			if (dd) {
				if (d.p) await d.p;
				r = d.m ? await frameOf(d.m, "dprops", key, k) : null;
			} else {
				r = g.m ? await frameOf(g.m, "props", key, k) : null;

				if (!r && p.tag) {
					if (env.dart) deadState();
					if (d.p) await d.p;
					r = d.m ? await frameOf(d.m, "props", key, k) : null;
				}
			}
			if (r) st.hit++;
			else {
				st.miss++;
				if (!MISS.has(key) && MISS.size < MISS_MAX)
					MISS.set(key, {
						key,
						md: md || "",
						ref: p.ref || p.tag || "",
						var: p.var || "",
						x: Math.round(p.x + (p.dx || 0)),
						y: Math.round(p.y),
						w: Math.round(p.w),
						h: Math.round(p.h),
						len: String(dd ? p.svgDead || p.svg : p.svg).length,
						why: !(dd ? d.m : g.m)
							? "город не запечён (" + (dd ? d.s : g.s) + ")"
							: "нет в листе предметов",
					});
			}
			return r;
		};

		B.ol = (sources, id, k) => {
			const M = g.m;
			if (!M || !M.ol || M.ol.key !== oKey(sources)) return null;

			for (const s of sources)
				if (
					s &&
					s.tag &&
					new RegExp(
						'data-ol="[^"]*\\b' + id.replace(/[^\w-]/g, "") + "\\b",
					).test(s.svg)
				)
					return null;
			return frameOf(M.ol, "ids", id, k).then((r) => {
				if (!r || dead) return null;
				const c = document.createElement("canvas");
				c.width = r.cw;
				c.height = r.ch;
				c.getContext("2d").drawImage(
					r.sh.img,
					r.fr[1],
					r.fr[2],
					r.cw,
					r.ch,
					0,
					0,
					r.cw,
					r.ch,
				);
				st.olHit++;
				return { c, x: r.x0, y: r.y0, k: r.k };
			});
		};

		B.stats = () => {
			let n = 0,
				vis = 0;
			for (const t of tiles.values())
				if (t.spr) {
					n++;
					if (t.spr.visible) vis++;
				}
			return {
				s: g.s,
				d: d.s,
				key: g.key,
				...(g.why ? { why: g.why } : {}),
				lv: cur[""],
				lvD: cur.d,
				tiles: n,
				vis,
				queue: Q.length + run,
				sheets: sheets.size,
				...st,
				bytes: stat.bytes,
				imgs: stat.imgs,
				decMs: Math.round(stat.decMs),
				px: stat.px,
			};
		};
		B.misses = () => [...MISS.values()];
		B.inIdx = () => (B.idx ? !!B.idx.m[g.key] : null);
		B.destroy = () => {
			if (dead) return;
			dead = true;
			LIVE.delete(B);
			for (const [key, t] of [...tiles]) dropTile(key, t);
			for (const tex of ptex.values()) tex.destroy(false);
			ptex.clear();
			for (const p of sheets.values())
				p.then(
					(sh) => {
						if (sh) {
							sh.src.destroy();
							freeImg(sh.img);
						}
					},
					() => null,
				);
			sheets.clear();
		};
		return B;
	}

	function live(sources) {
		for (const B of LIVE)
			if (
				B.g.s === "wait" ||
				(B.g.m && B.g.m.ol && B.g.m.ol.key === oKey(sources))
			)
				return B;
		return null;
	}
	const olReady = (sources) => !!live(sources);
	function olMask(sources, id, k) {
		const B = live(sources);
		if (!B) return null;
		return B.ready.then(() => (B.g.s === "on" ? B.ol(sources, id, k) : null));
	}

	function report() {
		const out = [...LIVE].map((B) => ({
			...B.stats(),
			inIdx: B.inIdx(),
			idxKeys: B.idx ? Object.keys(B.idx.m).length : null,
			misses: B.misses(),
		}));
		if (typeof console !== "undefined") {
			if (!out.length)
				console.log(
					"[город] запечённый город не подключён: «Город» не открыт или запечённое выключено (нет флага cb у героя)",
				);
			for (const r of out) {
				console.log(
					`[город] s=${r.s}${r.why ? " (" + r.why + ")" : ""} ключ ${r.key}, в индексе: ${r.inIdx}, предметы из листа ${r.hit}, из SVG ${r.miss}`,
				);
				if (r.misses.length && console.table) console.table(r.misses);
			}
		}
		return out;
	}

	window.LGCityBake = {
		attach,
		olReady,
		olMask,
		gKey,
		dKey,
		pKey,
		oKey,
		pick,
		KV,
		stat,
		report,
	};
})();
