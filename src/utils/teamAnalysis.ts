import type { Pokemon, PokemonType } from '../types/pokemon';
import { typeChart, POKEMON_TYPES, type PokemonTypeName } from './typeMatrix';

export interface TypeCoverage {
  weaknesses: Record<string, number>; // type name -> number of team members weak to it
  resistances: Record<string, number>;
  immunities: Record<string, number>;
  duplicateWeaknesses: string[]; // types that 2 or more pokemon are weak to
}

export interface TeamRoles {
  physicalAttackers: number;
  specialAttackers: number;
  mixedAttackers: number;
  physicalDefenders: number;
  specialDefenders: number;
  fastPokemon: number;
  roleDetails: Array<{ pokemonName: string; roles: string[] }>;
}

export interface TeamAnalysisResult {
  coverage: TypeCoverage;
  roles: TeamRoles;
  recommendations: string[];
}

/**
 * Calculate team's total type weaknesses and resistances
 */
export const calculateTypeCoverage = (team: Pokemon[]): TypeCoverage => {
  const coverage: TypeCoverage = {
    weaknesses: {},
    resistances: {},
    immunities: {},
    duplicateWeaknesses: [],
  };

  POKEMON_TYPES.forEach(type => {
    coverage.weaknesses[type] = 0;
    coverage.resistances[type] = 0;
    coverage.immunities[type] = 0;
  });

  team.forEach(pokemon => {
    const types = pokemon.types.map(t => t.type.name as PokemonTypeName);
    
    POKEMON_TYPES.forEach(attackingType => {
      let multiplier = 1;

      // Type interactions are multiplicative
      types.forEach(defendingType => {
        const interaction = typeChart[defendingType]?.[attackingType];
        if (interaction !== undefined) {
          multiplier *= interaction;
        }
      });

      if (multiplier > 1) {
        coverage.weaknesses[attackingType]++;
      } else if (multiplier === 0) {
        coverage.immunities[attackingType]++;
      } else if (multiplier < 1) {
        coverage.resistances[attackingType]++;
      }
    });
  });

  coverage.duplicateWeaknesses = Object.keys(coverage.weaknesses).filter(
    type => coverage.weaknesses[type] >= 2
  );

  return coverage;
};

/**
 * Statistically classify the team based on base stats
 */
export const analyzeTeamRoles = (team: Pokemon[]): TeamRoles => {
  const roles: TeamRoles = {
    physicalAttackers: 0,
    specialAttackers: 0,
    mixedAttackers: 0,
    physicalDefenders: 0,
    specialDefenders: 0,
    fastPokemon: 0,
    roleDetails: []
  };

  team.forEach(pokemon => {
    const hp = pokemon.stats.find(s => s.stat.name === 'hp')?.base_stat || 0;
    const atk = pokemon.stats.find(s => s.stat.name === 'attack')?.base_stat || 0;
    const def = pokemon.stats.find(s => s.stat.name === 'defense')?.base_stat || 0;
    const spa = pokemon.stats.find(s => s.stat.name === 'special-attack')?.base_stat || 0;
    const spd = pokemon.stats.find(s => s.stat.name === 'special-defense')?.base_stat || 0;
    const spe = pokemon.stats.find(s => s.stat.name === 'speed')?.base_stat || 0;

    const pokemonRoles = [];

    // Simple Heuristics for roles
    const isPhysical = atk >= 90 && atk > spa + 15;
    const isSpecial = spa >= 90 && spa > atk + 15;
    const isMixed = atk >= 85 && spa >= 85 && Math.abs(atk - spa) <= 15;
    
    if (isPhysical) { roles.physicalAttackers++; pokemonRoles.push('Physical Attacker'); }
    else if (isSpecial) { roles.specialAttackers++; pokemonRoles.push('Special Attacker'); }
    else if (isMixed) { roles.mixedAttackers++; pokemonRoles.push('Mixed Attacker'); }

    if (def >= 100 || (hp >= 90 && def >= 85)) { roles.physicalDefenders++; pokemonRoles.push('Physical Wall'); }
    if (spd >= 100 || (hp >= 90 && spd >= 85)) { roles.specialDefenders++; pokemonRoles.push('Special Wall'); }
    
    if (spe >= 100) { roles.fastPokemon++; pokemonRoles.push('Fast Sweeper/Support'); }

    if (pokemonRoles.length === 0) {
      pokemonRoles.push('Balanced / Support');
    }

    roles.roleDetails.push({ pokemonName: pokemon.name, roles: pokemonRoles });
  });

  return roles;
};

/**
 * Generate actionable recommendations
 */
export const generateRecommendations = (coverage: TypeCoverage, roles: TeamRoles, teamSize: number): string[] => {
  const recommendations: string[] = [];

  if (teamSize === 0) return recommendations;

  // Type recommendations
  if (coverage.duplicateWeaknesses.length > 0) {
    recommendations.push(`Watch out! You have multiple Pokémon weak to ${coverage.duplicateWeaknesses.map(t => t.toUpperCase()).join(', ')} attacks.`);
  }

  // A team missing resistances to common attacking types
  const unresistedTypes = POKEMON_TYPES.filter(t => coverage.resistances[t] === 0 && coverage.immunities[t] === 0);
  if (unresistedTypes.length > 0 && teamSize >= 3) {
    // only recommend if a few critical ones are missing
    const dangerousTypes = ['ground', 'ice', 'fighting', 'fire'].filter(t => unresistedTypes.includes(t as PokemonTypeName));
    if (dangerousTypes.length > 0) {
      recommendations.push(`Your team lacks answers to ${dangerousTypes.map(t => t.toUpperCase()).join(', ')} threats. Consider adding a Pokémon with those resistances.`);
    }
  }

  // Stat / Role recommendations
  if (teamSize >= 4) {
    if (roles.physicalAttackers === 0 && roles.mixedAttackers === 0) {
      recommendations.push("Your team lacks a Physical Attacker. You might struggle against Special Walls like Blissey.");
    }
    if (roles.specialAttackers === 0 && roles.mixedAttackers === 0) {
      recommendations.push("Your team lacks a Special Attacker. You might struggle against Physical Walls like Skarmory.");
    }
    if (roles.physicalDefenders === 0 && roles.specialDefenders === 0) {
      recommendations.push("Your team lacks defensive pivots. A strong attacker might easily sweep your team.");
    }
    if (roles.fastPokemon === 0) {
      recommendations.push("Your team is quite slow. Faster teams might constantly attack first. Consider adding a Choice Scarf user or naturally fast Pokémon (Speed > 100).");
    }
  }

  if (recommendations.length === 0 && teamSize === 6) {
    recommendations.push("Your team looks quite balanced! Good luck in battle!");
  }

  return recommendations;
};
