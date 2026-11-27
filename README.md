# People Periodic Table – Kasatria Assignment

3D CSS "periodic table" (Three.js CSS3D) that loads people from a Google Sheet after Google login.
Layouts: **Table 20x10**, **Sphere**, **Double Helix**, **Grid 5x4x10**.
Tile colour by Net Worth: **Red < $100K, Orange > $100K, Green > $200K**.

## Files
```
index.html          login screen (Image A) + app shell
css/style.css
js/config.js        <-- put your CLIENT_ID and SHEET_ID here
js/auth.js          Google Identity Services login
js/data.js          Sheets API fetch, parsing, colour rules
js/layouts.js       table / sphere / helix / grid maths (unit-tested)
js/main.js          Three.js scene, tiles, tweening
data/Data_Template.csv   cleaned UTF-8 copy of your CSV
tests/layouts.test.mjs   run: node tests/layouts.test.mjs
```

## Step 1 – Google Sheet
1. sheets.google.com > Blank > File > Import > Upload `data/Data_Template.csv` > "Replace spreadsheet".
   (The original CSV had stray non-breaking spaces; use the cleaned file.)
2. Keep the header row exactly: `Name, Photo, Age, Country, Interest, Net Worth`.
3. Share > add **lisa@kasatria.com** as **Editor**.
4. Copy the Sheet ID from the URL (`/d/<SHEET_ID>/edit`) into `js/config.js`.

## Step 2 – Google Cloud project (login)
1. console.cloud.google.com > New Project.
2. APIs & Services > Library > enable **Google Sheets API**.
3. OAuth consent screen (Google Auth Platform): External, app name, your email.
   Add scope `.../auth/spreadsheets.readonly`.
   While status is "Testing", add **lisa@kasatria.com** and your own account under **Test users**.
4. Credentials > Create credentials > OAuth client ID > **Web application**.
   Authorized JavaScript origins: `http://localhost:8000` and your hosted URL (e.g. `https://<user>.github.io`).
   No redirect URI needed.
5. Copy the Client ID into `js/config.js`.

## Step 3 – Test locally
```
python3 -m http.server 8000
```
- `http://localhost:8000/?demo=1` : skips login, reads the local CSV (check layouts/colours).
- `http://localhost:8000/` : real Google login + Sheet.

## Step 4 – Host & submit
Upload the folder to GitHub Pages / Netlify / Vercel (static, no build step), add that origin in step 2.4,
and send Lisa the URL. Make sure she can log in (Test user or published app).

## Notes
- Login uses Google Identity Services; the access token stays in memory only.
- Tile order = sheet row order; first 200 rows are used (20x10 = 5x4x10 = 200).
