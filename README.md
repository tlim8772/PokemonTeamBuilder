# Pokémon Team Builder & Analyzer

## Overview

This application is a Pokémon Team Builder and Analysis tool designed to help users create balanced Pokémon teams. It allows users to search for Pokémon, add them to a team (up to 6 members), and get real-time analysis on their team's type coverage, base stat distribution, and competitive roles.

### Architecture & Approach
- **Frontend Framework**: The app is built with **React** (via Vite) and **TypeScript** for strong typing, fast compilations, and predictable behavior.
- **State Management**: React hooks (`useState`, `useMemo`) efficiently manage the team composition and calculate derived analysis without unnecessary re-renders. 
- **Styling**: Custom modern CSS (`index.css`) relying heavily on CSS variables is used to create a clean, responsive, and glassmorphic UI without the overhead of heavy component libraries.
- **API Integration**: The application pulls live data from **PokéAPI** (`https://pokeapi.co/`). To ensure a fast search experience without hammering the API, a lightweight list of all Pokémon names is fetched once and cached to power the search autocomplete, while detailed stat data is only fetched upon selecting a Pokémon.
- **Component Breakdown**:
  - `TeamBuilder`: Manages the display and layout of the selected team members.
  - `Search`: A typeahead search component featuring debounce-like behavior and automatic list filtering.
  - `PokemonCard`: Renders individual Pokémon data including their sprite, typings, abilities, and stat bars.
  - `TeamAnalysis`: The analytical engine computing the strengths, weaknesses, and role distribution (via Recharts for visualizations) of the current team.

## Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### How to install dependencies
Navigate into the project directory and install the required NPM packages:
```bash
npm install
```

### How to run the app
Start the local Vite development server by running:
```bash
npm run dev
```
The application will launch and be available in your browser at `http://localhost:5173` (or the next available port).

## Testing Instructions

*Note: Automated unit/integration tests are not currently configured for this repository. However, the app includes strict TypeScript type safety to prevent common runtime errors.*

### Manual Testing Procedures
1. **Search functionality:** Type a Pokémon name (e.g., "charizard" or "gengar") in the search bar. The typeahead autocomplete should give immediate suggestions.
2. **Team Building:** Select suggestions to add them to your team. Verify that the Pokémon card appears. Attempt to add more than 6 Pokémon to verify that the UI restricts the team to the standard maximum.
3. **Analysis Engine:** Observe the "Team Analysis" panel update instantaneously. Add Pokémon with similar typings to verify that duplicate weaknesses (e.g., "Multiple Pokémon are weak to...") appear.
4. **Remove Pokémon:** Click the 'X' on a Pokémon card to remove it and confirm that the analysis panel dynamically recalculates the stats.

## Assumptions / Challenges

### Design Decisions
- **Local Type Calculations:** Type interactions are multiplicative. While PokéAPI offers endpoints for type matchups, doing this network-side per team update is slow. I decided to build a static type chart (`typeMatrix.ts`) to achieve instant, zero-latency coverage calculations locally in the browser.
- **Stat Analysis Heuristics:** To provide intelligent team recommendations, basic heuristic formulas were introduced to guess a Pokémon's battle role (e.g., classifying a Pokémon as a "Physical Attacker" if its Attack heavily outweighs its Special Attack and ranks highly overall).

### Limitations
- **Generations & Forms:** The autocomplete fetches the main list from PokéAPI via `?limit=2000`, which includes all regional variants and obscure alternate forms. Some very specific forms might lack high-res official artwork, falling back to lower-resolution pixel sprites.
- **Persistent Storage:** The current team is held entirely in React state memory. A page refresh will reset the team to empty. Implementing `localStorage` or a backend database would be required for persistent team saving.
