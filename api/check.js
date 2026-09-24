// Starts a live test with Globalping from test machines in the requested countries.
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });
  const { url, countries } = req.body || {};
  const target = String(url || "").trim().toLowerCase()
    .replace(/^[a-z]+:\/\//, "").replace(/^www\./, "").split(/[\/?#\s]/)[0];
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(target)) {
    return res.status(400).json({ error: "Enter a website address, like example.com." });
  }
  const list = (Array.isArray(countries) ? countries : [])
    .map(c => String(c).toUpperCase()).filter(c => /^[A-Z]{2}$/.test(c)).slice(0, 250);
  if (!list.length) return res.status(400).json({ error: "Choose at least one country." });

  const headers = { "Content-Type": "application/json" };
  if (process.env.GLOBALPING_TOKEN) headers.Authorization = "Bearer " + process.env.GLOBALPING_TOKEN;

  const r = await fetch("https://api.globalping.io/v1/measurements", {
    method: "POST",
    headers,
    body: JSON.stringify({
      type: "http",
      target,
      locations: list.map(country => ({ country, limit: 1 })),
      measurementOptions: { protocol: "HTTPS", request: { method: "GET", path: "/" } },
    }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const msg = r.status === 429
      ? "The free hourly test limit is used up. Try again later, or add a Globalping token (see the guide)."
      : (data?.error?.message || "The test service didn't accept the request.");
    return res.status(r.status).json({ error: msg });
  }
  res.status(200).json({ id: data.id });
}
