import MapApp from './components/MapApp';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div className="app">
      <div className="top">
        <div className="brand">
          <div className="logo">JSW</div>
          <div>
            <h1>India manpower potential map</h1>
            <div className="sub">Market potential, JSW One business, manpower and upcoming projects by area</div>
          </div>
        </div>
      </div>
      <MapApp askEnabled={!!process.env.ANTHROPIC_API_KEY} />
    </div>
  );
}
