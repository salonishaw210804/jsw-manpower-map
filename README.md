# India manpower potential map — JSW One (Vercel)

Website jo link se khulti hai (koi login nahi). Link sirf apni team ke saath share karo.

## Data update karna
1. GitHub repo mein `data/area_data.xlsx` download karo, peeli columns (D–J) bharo, save karo.
2. GitHub repo → `data` folder → **Add file → Upload files** → nayi `area_data.xlsx` daalo → **Commit changes**.
3. Vercel 1–2 minute mein site update kar dega. Banner batayega kitne districts bhare hain.

Jab tak Excel khaali hai, map sample numbers dikhata hai.

## Ask Claude (optional)
Vercel → Settings → Environment Variables → `ANTHROPIC_API_KEY` add karo → Redeploy.
Note: login nahi hai, toh link wala koi bhi Claude se pooch sakta hai aur API ka kharcha aapke account pe aayega. Link soch-samajh ke share karna.

## Files
- `app/` — page aur APIs (`/api/data` Excel padhta hai, `/api/ask` Claude se poochta hai)
- `lib/mapEngine.js` — map, hover, drill-down, GST/PAN, priority list
- `data/area_data.xlsx` — aapka data
- `public/geo/india.json` — India state + district boundaries (2011 census)
