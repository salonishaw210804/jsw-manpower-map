'use client';
import { useEffect, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { mountMap } from '@/lib/mapEngine';

export default function MapApp({ askEnabled }) {
  const [error, setError] = useState('');
  useEffect(() => {
    let cleanup = null, cancelled = false;
    (async () => {
      try {
        const [topoRes, dataRes] = await Promise.all([fetch('/geo/india.json'), fetch('/api/data', { cache: 'no-store' })]);
        if (!topoRes.ok) throw new Error('Map boundaries didn’t load');
        const topo = await topoRes.json();
        const data = dataRes.ok ? await dataRes.json() : { rows: [] };
        if (cancelled) return;
        cleanup = mountMap({ d3, topojson, topo, rows: data.rows || [], askEnabled });
      } catch (e) { setError('Could not load the map. ' + e.message); }
    })();
    return () => { cancelled = true; cleanup && cleanup(); };
  }, [askEnabled]);

  return (
    <>
      <div className="banner" id="banner">{error || 'Loading data…'}</div>
      <div className="controls">
        <div className="ctl"><span className="ctl-label">Zone</span><div className="chips" id="zones"></div></div>
        <div className="ctl"><span className="ctl-label">Colour map by</span><select id="metric" aria-label="Colour map by"></select></div>
        <div className="ctl"><span className="ctl-label">Customer count level</span>
          <div className="chips" id="lvl">
            <button className="ds-chip active" data-l="gst">GST level</button>
            <button className="ds-chip" data-l="pan">PAN level</button>
          </div>
        </div>
      </div>
      <div className="grid">
        <div className="card map-card" id="mapcard">
          <div className="crumbs" id="crumbs"></div>
          <svg id="map" role="img" aria-label="India map coloured by selected metric"></svg>
          <div className="legend" id="legend"></div>
          <div className="tip" id="tip"></div>
        </div>
        <div className="card panel" id="panel"></div>
      </div>
    </>
  );
}
