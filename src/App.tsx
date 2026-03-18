import React, { useState } from 'react';
import { TeamBuilder } from './components/TeamBuilder';
import { TeamAnalysis } from './components/TeamAnalysis';
import type { Pokemon } from './types/pokemon';
import './index.css';

function App() {
  const [team, setTeam] = useState<Pokemon[]>([]);

  return (
    <div className="app-container" style={{
      maxWidth: '1440px',
      margin: '0 auto',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '32px'
    }}>
      <header className="app-header glass-panel" style={{ textAlign: 'center', padding: '32px 24px', borderRadius: 'var(--border-radius-xl)' }}>
        <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '8px' }}>Pokémon Team Builder</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Analyze and optimize your team composition</p>
      </header>
      
      <main className="app-main" style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '32px',
        flexWrap: 'wrap',
        alignItems: 'flex-start'
      }}>
        <TeamBuilder team={team} setTeam={setTeam} />
        <TeamAnalysis team={team} />
      </main>
    </div>
  );
}

export default App;
