(() => {
	var C = window.LG_ERR || {},
		rate = typeof C.rate === "number" ? C.rate : 0.2,
		page = C.page || "other",
		ver = C.v || "";
	var sent = 0,
		seen = {};
	function scrub(s) {
		return String(s || "")
			.replace(/(\/(?:o|sd|ov|overlay|ext)\/)[A-Za-z0-9_-]{12,}/g, "$1[ключ]")
			.replace(
				/([?&](?:key|token|access_token|code|state|sig|signature|auth|session|k)=)[^&#\s"']+/gi,
				"$1[скрыто]",
			)
			.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[почта]");
	}

	var URL_RE = /\b[a-z][a-z0-9+.-]*:\/\/[^\s)'"]+/i,
		FRAME = /^\s*at\s|@/;
	function firstUrl(s) {
		var ls = String(s || "").split("\n"),
			framed = false,
			i,
			m;
		for (i = 0; i < ls.length; i++) {
			if (!FRAME.test(ls[i])) continue;
			framed = true;
			m = URL_RE.exec(ls[i]);
			if (m) return m[0];
		}
		m = framed ? null : URL_RE.exec(String(s || ""));
		return m ? m[0] : "";
	}
	function ours(s) {
		return firstUrl(s).indexOf(location.origin + "/") === 0;
	}
	function beacon(path, body) {
		if (
			navigator.sendBeacon &&
			navigator.sendBeacon(path, new Blob([body], { type: "text/plain" }))
		)
			return;
		var x = new XMLHttpRequest();
		x.open("POST", path);
		x.setRequestHeader("Content-Type", "text/plain");
		x.send(body);
	}
	function report(t, m, s) {
		try {
			if (!ours(s)) return;
			m = scrub(m).slice(0, 1000);
			if (!m || sent >= 5 || seen[m] || Math.random() >= rate) return;
			seen[m] = 1;
			sent++;
			beacon(
				"/api/err",
				JSON.stringify({
					t: String(t || "Error").slice(0, 100),
					m: m,
					s: scrub(s).slice(0, 8000),
					u: scrub(location.origin + location.pathname),
					p: page,
					v: ver,
				}),
			);
		} catch (e) {}
	}

	var perf = typeof C.perf === "number" ? C.perf : 0.02;
	try {
		var P = window.performance,
			wasHidden = document.visibilityState === "hidden";
		if (
			perf > 0 &&
			Math.random() < perf &&
			P &&
			P.getEntriesByType &&
			!wasHidden
		) {
			var lcp,
				cls = 0,
				done = false;
			if (window.PerformanceObserver) {
				try {
					new window.PerformanceObserver((l) => {
						var es = l.getEntries();
						if (es.length) lcp = es[es.length - 1].startTime;
					}).observe({ type: "largest-contentful-paint", buffered: true });
				} catch (e) {}
				try {
					new window.PerformanceObserver((l) => {
						l.getEntries().forEach((x) => {
							if (!x.hadRecentInput) cls += x.value;
						});
					}).observe({ type: "layout-shift", buffered: true });
				} catch (e) {}
			}
			var flush = (hiding) => {
				if (done || wasHidden) return;
				var n = P.getEntriesByType("navigation")[0],
					f =
						P.getEntriesByName &&
						P.getEntriesByName("first-contentful-paint")[0];
				if (!n || !n.loadEventEnd) {
					if (hiding) wasHidden = true;
					return;
				}
				done = true;
				var r = (v) =>
					typeof v === "number" && v > 0 ? Math.round(v) : undefined;
				beacon(
					"/api/perf",
					JSON.stringify({
						p: page,
						v: ver,
						u: scrub(location.origin + location.pathname),
						t: Math.round(P.timeOrigin || Date.now() - P.now()),
						m: {
							ttfb: r(n.responseStart),
							fcp: r(f && f.startTime),
							lcp: r(lcp),
							dcl: r(n.domContentLoadedEventEnd),
							load: r(n.loadEventEnd),
							cls: Math.round(cls * 1000) / 1000,
						},
					}),
				);
			};
			document.addEventListener("visibilitychange", () => {
				if (document.visibilityState === "hidden") {
					try {
						flush(true);
					} catch (e) {}
				}
			});
			window.addEventListener("load", () => {
				setTimeout(() => {
					try {
						flush(false);
					} catch (e) {}
				}, 5000);
			});
		}
	} catch (e) {}
	window.addEventListener("error", (e) => {
		if (!e || !e.message || e.message === "Script error.") return;
		report(
			e.error && e.error.name,
			e.message,
			(e.error && e.error.stack) || e.filename + ":" + e.lineno + ":" + e.colno,
		);
	});
	window.addEventListener("unhandledrejection", (e) => {
		var r = e && e.reason;
		report(
			r && r.name ? r.name : "UnhandledRejection",
			r && r.message ? r.message : String(r),
			r && r.stack,
		);
	});
	window.LG_ERR_REPORT = report;
})();
