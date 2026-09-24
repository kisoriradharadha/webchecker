// Reads the results of a Globalping test and returns only what the page needs.
export default async function handler(req, res) {
  const id = String(req.query.id || "");
  if (!/^[A-Za-z0-9_-]+$/.test(id)) return res.status(400).json({ error: "Bad test id." });

  const headers = {};
  if (process.env.GLOBALPING_TOKEN) headers.Authorization = "Bearer " + process.env.GLOBALPING_TOKEN;
  const r = await fetch("https://api.globalping.io/v1/measurements/" + id, { headers });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) return res.status(r.status).json({ error: data?.error?.message || "Couldn't read results." });

  const results = (data.results || []).map(x => {
    const p = x.probe || {}, t = x.result || {};
    return {
      country: p.country, city: p.city, network: p.network,
      status: t.status, statusCode: t.statusCode, statusCodeName: t.statusCodeName,
      total: t.timings?.total ?? null,
      error: t.status === "failed" ? String(t.rawOutput || "").split("\n")[0].slice(0, 200) : null,
    };
  });
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({ status: data.status, results });
}
