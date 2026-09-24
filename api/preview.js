// Takes a real screenshot of the website through a connection in the chosen country (ScrapingBee).
export default async function handler(req, res) {
  const key = process.env.SCREENSHOT_KEY;
  if (!key) return res.status(503).send("Screenshots aren't set up yet. Add SCREENSHOT_KEY in Vercel (see the guide).");

  const url = String(req.query.url || "").toLowerCase();
  const country = String(req.query.country || "").toLowerCase();
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(url) || !/^[a-z]{2}$/.test(country)) {
    return res.status(400).send("Bad website or country.");
  }

  const api = new URL("https://app.scrapingbee.com/api/v1/");
  api.searchParams.set("api_key", key);
  api.searchParams.set("url", "https://" + url);
  api.searchParams.set("screenshot", "true");
  api.searchParams.set("premium_proxy", "true");
  api.searchParams.set("country_code", country);
  api.searchParams.set("window_width", "1280");
  api.searchParams.set("window_height", "800");

  try {
    const r = await fetch(api);
    if (!r.ok) {
      const text = await r.text();
      return res.status(502).send("The screenshot service couldn't open it from this country. " + text.slice(0, 120));
    }
    res.setHeader("Content-Type", r.headers.get("content-type") || "image/png");
    res.setHeader("Cache-Control", "no-store");
    res.status(200).send(Buffer.from(await r.arrayBuffer()));
  } catch {
    res.status(502).send("The screenshot service didn't respond.");
  }
}
