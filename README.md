# India manpower potential map — JSW One (Vercel)

Website jo sirf JSW company email (@jsw.in) se khulegi. Login: email daalo → Outlook pe code aayega → code daalo → andar.
IT se kuch nahi chahiye. Teen free accounts chahiye: **GitHub**, **Vercel**, **Clerk** (login service).

---

## Step 1 — Clerk (login) setup · 10 min
1. https://clerk.com pe jao → **Sign up** (apni email se, free).
2. **Create application** → naam: `JSW Map`.
3. Sign-in options mein sirf **Email** ON rakho. Google, Phone, baaki sab OFF.
4. Left menu → **Configure → Email, phone, username** (ya "User & authentication"):
   - **Email verification code** = ON
   - **Password** = OFF (taaki sirf Outlook code se login ho)
5. Left menu → **API keys** → ye do keys copy karke notepad mein rakh lo:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (pk_test_… se shuru)
   - `CLERK_SECRET_KEY` (sk_test_… se shuru)

> Note: shuru mein Clerk "Development" mode mein chalega, screen ke neeche ek chhota "Development mode" label dikhega. Kaam poora chalega. Baad mein apna domain lagaoge toh Production mode on kar sakte ho.

## Step 2 — GitHub pe code daalna · 5 min
1. https://github.com pe account banao (ya login karo).
2. Upar **+ → New repository** → naam `jsw-manpower-map` → **Private** chuno → **Create**.
3. **uploading an existing file** link pe click karo.
4. Is folder ke **andar ki saari files aur folders** drag karke daalo (folder khud nahi, uske andar ka sab).
5. Neeche **Commit changes** dabao.

## Step 3 — Vercel pe deploy · 5 min
1. https://vercel.com → **Sign up with GitHub**.
2. **Add New → Project** → apni `jsw-manpower-map` repo pe **Import**.
3. **Environment Variables** kholo aur ye add karo:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk wali pk_test… key |
| `CLERK_SECRET_KEY` | Clerk wali sk_test… key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `ALLOWED_EMAIL_DOMAINS` | `jsw.in` (aur domains ho toh comma se: `jsw.in,jswone.in`) |
| `ANTHROPIC_API_KEY` | Optional — Ask Claude ke liye (Step 5) |

4. **Deploy** dabao. 2–3 minute mein link milega, jaise `jsw-manpower-map.vercel.app`.
5. Link kholo → apni @jsw.in email daalo → Outlook mein code aayega → andar map.

Ye link team ko bhej do. Koi bhi non-JSW email se login kare toh "Access is limited to JSW company emails" dikhega.

## Step 4 — Data update karna
1. `data/area_data.xlsx` download karo (GitHub repo se), peeli columns bharo, save karo.
2. GitHub repo → `data` folder → **Add file → Upload files** → nayi `area_data.xlsx` daalo → **Commit**.
3. Vercel apne aap 1–2 minute mein site update kar dega. Banner batayega kitne districts bhare hain.

Jab tak Excel khaali hai, map sample numbers dikhata hai.

## Step 5 (optional) — Ask Claude
1. https://console.anthropic.com pe account banao → billing mein credit daalo → **API Keys → Create key**.
2. Vercel → Project → **Settings → Environment Variables** → `ANTHROPIC_API_KEY` add karo → **Deployments → Redeploy**.
Key sirf server pe rehti hai. Claude ko sirf map ke numbers jaate hain, koi customer naam nahi.

## Agar kuch na chale
- **Outlook mein code nahi aaya:** Junk/Quarantine folder check karo. Company filter block kare toh sender `clerk` wala email allow karwana padega.
- **Login ke baad "Access is limited…":** `ALLOWED_EMAIL_DOMAINS` mein apna exact domain likho (jaise `jsw.in`), phir Redeploy.
- **Map khaali / grey:** Excel mein State/District ke naam badle toh nahi? Wo exactly waise hi rehne chahiye.

## Files
- `app/` — pages (map, sign-in) aur APIs (`/api/data` Excel padhta hai, `/api/ask` Claude se poochta hai)
- `lib/mapEngine.js` — map, hover, drill-down, GST/PAN, priority list
- `data/area_data.xlsx` — aapka data
- `public/geo/india.json` — India state + district boundaries (2011 census)
- `middleware.js` + `lib/access.js` — login aur @jsw.in check
