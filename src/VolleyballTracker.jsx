import React from 'react';
import PlayersPanel from './components/Players/PlayersPanel';

export default function VolleyballTracker() {
  return (
    <div style={{ padding: 20 }}>
      <h1>🏐 Volleyball Match Tracker</h1>

      <section style={{ marginTop: 20 }}>
        <h2>Spelersbeheer</h2>
        <PlayersPanel />
      </section>
    </div>
  );
}
