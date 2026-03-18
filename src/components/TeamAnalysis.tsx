import React, { useMemo } from 'react';
import type { Pokemon } from '../types/pokemon';
import { calculateTypeCoverage, analyzeTeamRoles, generateRecommendations } from '../utils/teamAnalysis';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ShieldAlert, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';
import { POKEMON_TYPES } from '../utils/typeMatrix';

interface TeamAnalysisProps {
  team: Pokemon[];
}

export const TeamAnalysis: React.FC<TeamAnalysisProps> = ({ team }) => {
  const coverage = useMemo(() => calculateTypeCoverage(team), [team]);
  const roles = useMemo(() => analyzeTeamRoles(team), [team]);
  const recommendations = useMemo(() => generateRecommendations(coverage, roles, team.length), [coverage, roles, team]);

  // Aggregate stats for chart
  const statAverages = useMemo(() => {
    const totals = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
    team.forEach(p => {
      totals.hp += p.stats.find(s => s.stat.name === 'hp')?.base_stat || 0;
      totals.atk += p.stats.find(s => s.stat.name === 'attack')?.base_stat || 0;
      totals.def += p.stats.find(s => s.stat.name === 'defense')?.base_stat || 0;
      totals.spa += p.stats.find(s => s.stat.name === 'special-attack')?.base_stat || 0;
      totals.spd += p.stats.find(s => s.stat.name === 'special-defense')?.base_stat || 0;
      totals.spe += p.stats.find(s => s.stat.name === 'speed')?.base_stat || 0;
    });
    return [
      { name: 'HP', value: Math.round(totals.hp / Math.max(1, team.length)) },
      { name: 'ATK', value: Math.round(totals.atk / Math.max(1, team.length)) },
      { name: 'DEF', value: Math.round(totals.def / Math.max(1, team.length)) },
      { name: 'SPA', value: Math.round(totals.spa / Math.max(1, team.length)) },
      { name: 'SPD', value: Math.round(totals.spd / Math.max(1, team.length)) },
      { name: 'SPE', value: Math.round(totals.spe / Math.max(1, team.length)) },
    ];
  }, [team]);

  if (team.length === 0) {
    return (
      <div className="team-analysis glass-panel" style={{ flex: 1, padding: '24px', minWidth: '350px' }}>
        <h2>Team Analysis</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '20px' }}>Add Pokémon to your team to see analysis.</p>
      </div>
    );
  }

  const getStatColor = (name: string) => {
    const colors: Record<string, string> = {
      HP: '#10b981', ATK: '#ef4444', DEF: '#3b82f6', SPA: '#f59e0b', SPD: '#8b5cf6', SPE: '#ec4899'
    };
    return colors[name] || '#8884d8';
  };

  return (
    <div className="team-analysis glass-panel" style={{ flex: 1, padding: '24px', minWidth: '350px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <h2>Team Analysis</h2>
      
      {/* Type Coverage */}
      <section>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <ShieldAlert size={20} color="var(--accent-warning)" />
          Type Coverage
        </h3>
        
        {coverage.duplicateWeaknesses.length > 0 && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid var(--accent-danger)', padding: '12px', marginBottom: '16px', borderRadius: '4px' }}>
            <strong style={{ color: 'var(--accent-danger)' }}>Warning:</strong> Multiple Pokémon are weak to:
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
              {coverage.duplicateWeaknesses.map(type => (
                <span key={type} style={{ background: `var(--type-${type})`, color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  {type} (x{coverage.weaknesses[type]})
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Most Resistances: </span>
            {POKEMON_TYPES
              .sort((a, b) => coverage.resistances[b] - coverage.resistances[a])
              .slice(0, 4)
              .filter(t => coverage.resistances[t] > 0)
              .map(t => <span key={t} style={{ marginRight: '8px', textTransform: 'capitalize' }}>{t}({coverage.resistances[t]})</span>)
              || 'None'
            }
          </div>
        </div>
      </section>

      {/* Stat Distribution */}
      <section>
        <h3 style={{ marginBottom: '16px' }}>Average Base Stats</h3>
        <div style={{ height: '200px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statAverages} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ background: 'var(--bg-secondary)', border: 'none', borderRadius: '8px', color: 'var(--text-primary)' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {statAverages.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getStatColor(entry.name)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Roles & Recommendations */}
      <section>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Lightbulb size={20} color="var(--accent-primary)" />
          Recommendations
        </h3>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {recommendations.map((rec, i) => (
            <li key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: 'var(--bg-secondary)', padding: '12px', borderRadius: 'var(--border-radius-md)' }}>
              <AlertTriangle size={18} color="var(--accent-warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '0.875rem', lineHeight: '1.4' }}>{rec}</span>
            </li>
          ))}
          {recommendations.length === 0 && (
            <li style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: 'var(--border-radius-md)' }}>
              <CheckCircle size={18} color="var(--accent-success)" />
              <span style={{ fontSize: '0.875rem', color: 'var(--accent-success)' }}>Team looks solid!</span>
            </li>
          )}
        </ul>
      </section>
      
    </div>
  );
};
