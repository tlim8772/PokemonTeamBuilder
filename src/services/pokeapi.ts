import axios from 'axios';
import type { Pokemon, PokemonListResponse } from '../types/pokemon';

const BASE_URL = 'https://pokeapi.co/api/v2';

// Cache the full list to avoid re-fetching
let cachedPokemonList: { name: string; url: string }[] | null = null;

/**
 * Fetches the basic list of all pokemon to power the local search typeahead.
 */
export const fetchAllPokemonNames = async (): Promise<{ name: string; url: string }[]> => {
  if (cachedPokemonList) return cachedPokemonList;
  
  try {
    // 1302 is roughly the amount of distinct species in PokeAPI including variants
    const response = await axios.get<PokemonListResponse>(`${BASE_URL}/pokemon?limit=2000`);
    cachedPokemonList = response.data.results;
    return cachedPokemonList;
  } catch (error) {
    console.error('Failed to fetch Pokemon list', error);
    return [];
  }
};

/**
 * Fetch detailed stats and typings for a single pokemon by name or ID.
 */
export const fetchPokemonDetails = async (identifier: string | number): Promise<Pokemon | null> => {
  try {
    // Normalize string identifiers
    const query = typeof identifier === 'string' ? identifier.toLowerCase().trim() : identifier;
    const response = await axios.get<Pokemon>(`${BASE_URL}/pokemon/${query}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch details for Pokemon: ${identifier}`, error);
    return null;
  }
};
