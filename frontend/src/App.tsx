import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { TorrentTable, TorrentRow } from './components/TorrentTable';
import './style.css';

const demoRows: TorrentRow[] = [
  { id: 1, name: 'Sandbox Ubuntu ISO mirror test', category: 'linux', size: 134217728, seeders: 42, leechers: 3, completed: 9001, createdAt: '2026-05-04T10:00:00Z' },
  { id: 2, name: 'Public domain dataset pack', category: 'data', size: 2147483648, seeders: 9, leechers: 11, completed: 230, createdAt: '2026-05-03T09:20:00Z' },
];

function App() {
  const [query, setQuery] = useState('');
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return demoRows;
    return demoRows.filter((row) => `${row.name} ${row.category}`.toLowerCase().includes(q));
  }, [query]);

  return (
    <main className="shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Private tracker sandbox</p>
          <h1>Recherche rapide, ratio visible, seeders en temps réel</h1>
        </div>
        <input className="search" placeholder="Rechercher un torrent légal de test…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </section>
      <TorrentTable rows={rows} />
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
