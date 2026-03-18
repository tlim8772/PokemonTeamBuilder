import React, { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, Loader2, Plus } from 'lucide-react';
import { fetchAllPokemonNames, fetchPokemonDetails } from '../services/pokeapi';
import type { Pokemon } from '../types/pokemon';

interface SearchProps {
  onAddPokemon: (pokemon: Pokemon) => void;
  disabled: boolean;
}

export const Search: React.FC<SearchProps> = ({ onAddPokemon, disabled }) => {
  const [query, setQuery] = useState('');
  const [pokemonList, setPokemonList] = useState<{name: string, url: string}[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAllPokemonNames().then(list => setPokemonList(list));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.toLowerCase();
    setQuery(v);
    if (v.trim().length > 0) {
      const matches = pokemonList
        .map(p => p.name)
        .filter(name => name.includes(v))
        .slice(0, 5); // top 5 suggestions
      setSuggestions(matches);
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  const handleSelect = async (name: string) => {
    if (disabled) return;
    setQuery(name);
    setIsOpen(false);
    setIsLoading(true);
    
    const pokemon = await fetchPokemonDetails(name);
    if (pokemon) {
      onAddPokemon(pokemon);
      setQuery('');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="search-container" ref={dropdownRef} style={{ position: 'relative', width: '100%', maxWidth: '400px', marginBottom: '20px' }}>
      <div className="search-input-wrapper" style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--border-radius-lg)', padding: '8px 16px', border: '1px solid var(--text-muted)' }}>
        <SearchIcon size={20} color="var(--text-muted)" />
        <input
          type="text"
          value={query}
          onChange={handleSearchChange}
          placeholder={disabled ? "Team is full (Max 6)" : "Search Pokémon by name..."}
          disabled={disabled || isLoading}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            padding: '8px',
            outline: 'none',
            fontSize: '1rem'
          }}
          onFocus={() => query.trim().length > 0 && setIsOpen(true)}
        />
        {isLoading && <Loader2 size={20} color="var(--accent-primary)" className="spinner" style={{ animation: 'spin 1s linear infinite' }} />}
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul className="search-suggestions glass-panel" style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '8px',
          listStyle: 'none',
          padding: '8px 0',
          zIndex: 10
        }}>
          {suggestions.map(name => (
            <li
              key={name}
              onClick={() => handleSelect(name)}
              style={{
                padding: '10px 16px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                textTransform: 'capitalize',
                transition: 'background var(--transition-fast)'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-tertiary)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {name}
              <Plus size={16} color="var(--accent-success)" />
            </li>
          ))}
        </ul>
      )}
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
