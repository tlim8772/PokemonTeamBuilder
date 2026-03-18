import React from 'react';
import type { Pokemon } from '../types/pokemon';
import { X } from 'lucide-react';

interface PokemonCardProps {
  pokemon: Pokemon;
  onRemove: (id: number) => void;
}

export const PokemonCard: React.FC<PokemonCardProps> = ({ pokemon, onRemove }) => {
  const formatStatName = (name: string) => {
    const statMap: Record<string, string> = {
      'hp': 'HP',
      'attack': 'ATK',
      'defense': 'DEF',
      'special-attack': 'SPA',
      'special-defense': 'SPD',
      'speed': 'SPE'
    };
    return statMap[name] || name.toUpperCase();
  };

  const getStatColor = (value: number) => {
    if (value < 50) return 'var(--accent-danger)';
    if (value < 80) return 'var(--accent-warning)';
    if (value < 110) return 'var(--accent-success)';
    return 'var(--accent-primary)';
  };

  return (
    <div className="pokemon-card glass-panel" style={{
      position: 'relative',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      transition: 'transform var(--transition-normal), box-shadow var(--transition-normal)'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'none';
      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
    }}>
      <button 
        onClick={() => onRemove(pokemon.id)}
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'rgba(239, 68, 68, 0.2)',
          borderRadius: '50%',
          padding: '4px',
          color: 'var(--accent-danger)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background var(--transition-fast)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.4)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
      >
        <X size={16} />
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--border-radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img 
            src={pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default} 
            alt={pokemon.name} 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            loading="lazy"
          />
        </div>
        
        <div style={{ flex: 1 }}>
          <h3 style={{ textTransform: 'capitalize', marginBottom: '8px' }}>{pokemon.name}</h3>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {pokemon.types.map(t => (
              <span 
                key={t.type.name}
                style={{
                  background: `var(--type-${t.type.name})`,
                  color: '#fff',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                }}
              >
                {t.type.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="pokemon-stats" style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
        {pokemon.stats.map(s => (
          <div key={s.stat.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem' }}>
            <span style={{ width: '32px', color: 'var(--text-secondary)', fontWeight: 600 }}>{formatStatName(s.stat.name)}</span>
            <span style={{ width: '24px', textAlign: 'right' }}>{s.base_stat}</span>
            <div style={{ flex: 1, height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${Math.min((s.base_stat / 255) * 100, 100)}%`,
                background: getStatColor(s.base_stat),
                borderRadius: '3px'
              }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <span style={{ fontWeight: 600 }}>Abilities:</span>{' '}
        {pokemon.abilities.map(a => <span key={a.ability.name} style={{ textTransform: 'capitalize', marginRight: '6px' }}>{a.ability.name.replace('-', ' ')} {a.is_hidden ? '(H)' : ''}</span>)}
      </div>
    </div>
  );
};
