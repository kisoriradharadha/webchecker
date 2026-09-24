// Reads the results of one or more Globalping tests and returns only what the page needs.
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const raw = String(req.query.id || "");
  if (raw === "none") return res.status(200).json({ status: "finished", results: [] });
  const ids = raw.split(",").filter(Boolean);
  if (!ids.length || ids.length > 10 || !ids.every(id => /^[A-Za-z0-9_-]+$/.test(id))) {
    return res.status(400).json({ error: "Bad test id." });
  }

  const headers = {};
  if (process.env.GLOBALPING_TOKEN) headers.Authorization = "Bearer " + process.env.GLOBALPING_TOKEN;

  try {
    const all = await Promise.all(ids.map(async id => {
      const r = await fetch("https://api.globalping.io/v1/measurements/" + id, { headers });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data?.error?.message || "Couldn't read results.");
      return data;
    }));
    const results = all.flatMap(data => (data.results || []).map(x => {
      const p = x.probe || {}, t = x.result || {};
      return {
        country: p.country, city: p.city, network: p.network,
        status: t.status, statusCode: t.statusCode, statusCodeName: t.statusCodeName,
        total: t.timings?.total ?? null,
        error: t.status === "failed" ? String(t.rawOutput || "").split("\n")[0].slice(0, 200) : null,
      };
    }));
    const status = all.some(d => d.status === "in-progress") ? "in-progress" : "finished";
    res.status(200).json({ status, results });
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
}
