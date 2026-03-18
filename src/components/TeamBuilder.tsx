import React from 'react';
import type { Pokemon } from '../types/pokemon';
import { Search } from './Search';
import { PokemonCard } from './PokemonCard';

interface TeamBuilderProps {
  team: Pokemon[];
  setTeam: React.Dispatch<React.SetStateAction<Pokemon[]>>;
}

export const TeamBuilder: React.FC<TeamBuilderProps> = ({ team, setTeam }) => {
  const handleAddPokemon = (pokemon: Pokemon) => {
    if (team.length < 6) {
      setTeam([...team, pokemon]);
    }
  };

  const handleRemovePokemon = (id: number) => {
    setTeam(team.filter(p => p.id !== id));
  };

  return (
    <div className="team-builder-section" style={{ flex: 2 }}>
      <h2 style={{ marginBottom: '16px' }}>Build Your Team</h2>
      <Search onAddPokemon={handleAddPokemon} disabled={team.length >= 6} />
      
      <div className="pokemon-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px',
        marginTop: '20px'
      }}>
        {team.map((pokemon, index) => (
          <PokemonCard 
            key={`${pokemon.id}-${index}`} 
            pokemon={pokemon} 
            onRemove={handleRemovePokemon} 
          />
        ))}
        {Array.from({ length: Math.max(0, 6 - team.length) }).map((_, i) => (
          <div key={`empty-${i}`} className="empty-slot glass-panel" style={{
            height: '240px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed var(--text-muted)',
            background: 'transparent',
            boxShadow: 'none',
            color: 'var(--text-muted)',
            borderRadius: 'var(--border-radius-lg)',
            transition: 'border-color var(--transition-fast)'
          }}>
            Empty Slot {team.length + i + 1}
          </div>
        ))}
      </div>
    </div>
  );
};
