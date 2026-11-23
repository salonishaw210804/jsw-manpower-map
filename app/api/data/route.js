import { readFile } from 'node:fs/promises';
import path from 'node:path';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const COLS = {
  potential: 'Potential customers', gst: 'JSW One customers (GST)', pan: 'JSW One customers (PAN)',
  mt: 'JSW One volume (MT)', manpower: 'Current manpower', projects: 'Upcoming projects', projMt: 'Project demand est. (MT)'
};
const num = v => { const x = Number(String(v).replace(/,/g, '')); return Number.isFinite(x) && x >= 0 ? x : 0; };

export async function GET() {
  try {
    const buf = await readFile(path.join(process.cwd(), 'data', 'area_data.xlsx'));
    const wb = XLSX.read(buf, { type: 'buffer' });
    const ws = wb.Sheets['Area data'] || wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: '' })
      .filter(r => String(r['State']).trim() && String(r['District']).trim())
      .map(r => {
        const filled = r[COLS.potential] !== '' && r[COLS.potential] != null;
        const d = {};
        for (const [k, col] of Object.entries(COLS)) d[k] = num(r[col]);
        return { state: String(r['State']).trim(), district: String(r['District']).trim(), zone: String(r['Zone'] || '').trim(), filled, d };
      });
    return Response.json({ rows }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error('data load failed', e.message);
    return Response.json({ error: 'Could not read area_data.xlsx' }, { status: 500 });
  }
}
