# How to put "Where does this website work?" online

This guide assumes you've never done this before. Follow the parts in order. It takes about 30 minutes. You don't need to write any code.

What you'll end up with: a public link (like `where-does-it-work.vercel.app`) where anyone can test a website live from different countries and see a real screenshot from a chosen country.

What's in the folder:

- `index.html` is the page people see.
- `api/check.js` and `api/result.js` run the live tests (free, through Globalping).
- `api/preview.js` takes the real screenshots (through ScrapingBee, which has a free trial and is paid after).
- `package.json` and `vercel.json` are settings files. Leave them as they are.

---

## Part 1: Unzip the project

1. Download `where-does-it-work.zip`.
2. Unzip it (on Windows: right-click, then Extract All; on Mac: double-click).
3. Open the folder. You should see `index.html`, `package.json`, `vercel.json`, `GUIDE.md`, and a folder named `api`.

## Part 2: Put the files on GitHub

GitHub stores your files online so Vercel can publish them.

1. Go to github.com and select **Sign up**. Create a free account and confirm your email.
2. Once signed in, select the **+** at the top right, then **New repository**.
3. Under Repository name, type `where-does-it-work`. Leave it **Public** and select **Create repository**.
4. On the next page, select the link **uploading an existing file**.
5. Open your unzipped folder, select **everything inside it** (including the `api` folder), and drag it into the browser window. Use Chrome or Edge, because they keep the `api` folder intact.
6. Check the list. You should see `api/check.js`, `api/result.js`, and `api/preview.js`, not just `check.js` on its own. If the `api` folder is missing, drag the `api` folder in again by itself.
7. Scroll down and select **Commit changes**.

## Part 3: Publish it with Vercel

Vercel turns your GitHub files into a live website and runs the small backend files in `api`.

1. Go to vercel.com and select **Sign Up**. Choose the free **Hobby** plan and select **Continue with GitHub**, then allow access.
2. Select **Add New**, then **Project**.
3. Find `where-does-it-work` in the list and select **Import**.
4. Don't change any settings. Select **Deploy**.
5. Wait about a minute. When you see "Congratulations", select the preview image or **Continue to Dashboard**, then **Visit**.

Your website is now live. Copy the link from the address bar.

**Test it:** type `wikipedia.org` and select **Test all countries**. After 10 to 30 seconds, you should see which countries it works in. The One country tab will show live results too, but the screenshot will say it isn't set up yet. Part 4 fixes that.

## Part 4: Turn on real screenshots

1. Go to scrapingbee.com and create an account. New accounts get free trial credits.
2. In your ScrapingBee dashboard, find your **API key** and copy it. Treat it like a password and don't share it.
3. Go back to Vercel, open your project, and select **Settings**, then **Environment Variables**.
4. In **Key**, type exactly `SCREENSHOT_KEY`. In **Value**, paste your ScrapingBee key. Select **Save**.
5. Go to the **Deployments** tab. On the top deployment, select the **⋯** menu, then **Redeploy**, then **Redeploy** again.
6. When it's done, open your site, select the **One country** tab, pick a country, and test a website. A real screenshot should appear within a minute.

Each screenshot uses paid ScrapingBee credits (country connections cost more than normal ones). Keep an eye on your usage in the ScrapingBee dashboard.

## Part 5 (optional): Allow more live tests

Globalping is free but limits how many tests can run per hour. Testing all countries uses a lot of that allowance at once, so without an account you may only get a few full checks per hour.

1. Go to globalping.io and sign in to its dashboard (you can use your GitHub account).
2. Create an **access token** and copy it.
3. In Vercel, go to **Settings**, then **Environment Variables**, and add a key named `GLOBALPING_TOKEN` with your token as the value.
4. Redeploy, the same way as in Part 4, step 5.

## Making changes later

To change anything, open the file on GitHub, select the pencil icon, edit, and select **Commit changes**. Vercel republishes automatically within a minute.

## If something goes wrong

- **"The test couldn't start" or a 404 error:** the `api` folder probably didn't upload. On GitHub, check that `api/check.js` exists. If it doesn't, upload the `api` folder again.
- **"The free hourly test limit is used up":** wait an hour, or do Part 5.
- **"Screenshots aren't set up yet":** the `SCREENSHOT_KEY` name must match exactly, and you must redeploy after adding it.
- **Screenshot says the service couldn't open it:** some sites block automated browsers, or ScrapingBee may not have a connection in that country. Try another country.
- **Many countries show "No test machine":** Globalping has volunteers in many countries but not all 235. Those can't be tested live.

## Good to know before sharing it widely

- Anyone with your link can use up your ScrapingBee credits. Share it with people you trust at first.
- Blocking can differ between internet providers in the same country. A result shows what one test machine on one network saw.
- Show results, and don't present the site as a way to get around blocks. Doing that can be legally risky in some countries.
