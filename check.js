// Starts live tests with Globalping from test machines in the requested countries.
// Countries are sent in groups, and any country the service rejects is skipped.
const GROUP = 40;

function authHeaders() {
  const h = { "Content-Type": "application/json" };
  if (process.env.GLOBALPING_TOKEN) h.Authorization = "Bearer " + process.env.GLOBALPING_TOKEN;
  return h;
}

async function startGroup(target, codes) {
  let list = [...codes];
  for (let attempt = 0; attempt < 4 && list.length; attempt++) {
    const r = await fetch("https://api.globalping.io/v1/measurements", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        type: "http",
        target,
        locations: list.map(country => ({ country, limit: 1 })),
        measurementOptions: { protocol: "HTTPS", request: { method: "GET", path: "/" } },
      }),
    });
    const data = await r.json().catch(() => ({}));
    if (r.ok && data.id) return data.id;

    const msg = data?.error?.message || "";
    const params = data?.error?.params || {};
    // No test machines at all in this group: nothing to run.
    if (/no suitable probes/i.test(msg)) return null;
    // Drop the specific countries the service says are invalid, then try again.
    const bad = new Set();
    for (const k of Object.keys(params)) {
      const m = k.match(/locations\[(\d+)\]/);
      if (m) bad.add(Number(m[1]));
    }
    if (bad.size) { list = list.filter((_, i) => !bad.has(i)); continue; }

    const err = new Error(
      r.status === 429
        ? "The free hourly test limit is used up. Try again later, or add a Globalping token (see the guide)."
        : (msg || "The test service didn't accept the request.") +
          (Object.keys(params).length ? " Details: " + JSON.stringify(params).slice(0, 300) : "")
    );
    err.status = r.status;
    throw err;
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });
  const { url, countries } = req.body || {};
  const target = String(url || "").trim().toLowerCase()
    .replace(/^[a-z]+:\/\//, "").replace(/^www\./, "").split(/[\/?#\s]/)[0];
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(target)) {
    return res.status(400).json({ error: "Enter a website address, like example.com." });
  }
  const list = [...new Set((Array.isArray(countries) ? countries : [])
    .map(c => String(c).toUpperCase()).filter(c => /^[A-Z]{2}$/.test(c)))].slice(0, 250);
  if (!list.length) return res.status(400).json({ error: "Choose at least one country." });

  const groups = [];
  for (let i = 0; i < list.length; i += GROUP) groups.push(list.slice(i, i + GROUP));

  try {
    const ids = (await Promise.all(groups.map(g => startGroup(target, g)))).filter(Boolean);
    // Several test ids are joined into one so the page doesn't need to change.
    res.status(200).json({ id: ids.length ? ids.join(",") : "none" });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
}
