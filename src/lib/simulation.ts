import { Player, Team, GameResult } from '../types';

export function calculateTeamOVR(players: Player[]): { offense: number; defense: number; overall: number } {
  if (players.length === 0) return { offense: 0, defense: 0, overall: 0 };
  
  // Lineup Penalty Logic: 1 C, 2 F, 2 G
  let c = 0, f = 0, g = 0;
  players.forEach(p => {
     if (p.position === 'C') c++;
     else if (p.position === 'SF' || p.position === 'PF') f++;
     else if (p.position === 'PG' || p.position === 'SG') g++;
  });
  
  const missing = Math.max(0, 1 - c) + Math.max(0, 2 - f) + Math.max(0, 2 - g);
  const penalty = 1 - (missing * 0.05);

  const playersWithStaminaEffect = players.map(p => {
    let offBonus = 0;
    let defBonus = 0;
    (p.equipment || []).forEach(e => {
      offBonus += e.bonus.offense || 0;
      defBonus += e.bonus.defense || 0;
    });

    // Stamina Effect: Scale performance between 70% and 100% based on stamina
    // Formula: 0.7 + (stamina / 100) * 0.3
    const staminaFactor = 0.7 + (p.stamina / 100) * 0.3;

    const baseOff = (p.offense + offBonus) * staminaFactor * penalty;
    const baseDef = (p.defense + defBonus) * staminaFactor * penalty;
    
    // Effective rating accounts for gear and stamina
    const effectiveRating = (p.rating + (offBonus + defBonus) / 2) * staminaFactor * penalty;
    
    return {
      ...p,
      offense: baseOff,
      defense: baseDef,
      effectiveRating: effectiveRating
    };
  });

  const defense = playersWithStaminaEffect.reduce((sum, p) => sum + p.defense, 0) / playersWithStaminaEffect.length;
  const offense = playersWithStaminaEffect.reduce((sum, p) => sum + p.offense, 0) / playersWithStaminaEffect.length;
  const overall = playersWithStaminaEffect.reduce((sum, p) => sum + p.effectiveRating, 0) / playersWithStaminaEffect.length;
  
  return { offense, defense, overall };
}

export function simulateGame(
  homeTeam: Team, 
  homePlayers: Player[], 
  awayTeam: Team, 
  awayPlayers: Player[],
  isFastSim: boolean = false
): GameResult {
  const quarters = [];
  let homeTotal = 0;
  let awayTotal = 0;
  
  // Home Court Advantage: 2 points
  const homeAdvantage = 2.0; 

  // Clone players to track stamina changes during the game
  const currentHomePlayers = homePlayers.map(p => ({ ...p }));
  const currentAwayPlayers = awayPlayers.map(p => ({ ...p }));
  
  const hLineup = new Set(homeTeam.lineup);
  const aLineup = new Set(awayTeam.lineup);

  for (let q = 1; q <= 4; q++) {
    // Determine active players for this quarter based on simulation mode
    // In fastSim, only the starters play (no substitutions)
    // In normal sim, we'll assume a balanced rotation for the calculation
    
    let activeHomePlayers = currentHomePlayers;
    let activeAwayPlayers = currentAwayPlayers;

    if (isFastSim) {
      // Filter to only starters
      activeHomePlayers = currentHomePlayers.filter(p => hLineup.has(p.id));
      activeAwayPlayers = currentAwayPlayers.filter(p => aLineup.has(p.id));
    }

    const homeStats = calculateTeamOVR(activeHomePlayers);
    const awayStats = calculateTeamOVR(activeAwayPlayers);

    // Net Rating: How well offense beats defense
    const homeNet = (homeStats.offense - awayStats.defense);
    const awayNet = (awayStats.offense - homeStats.defense);
    
    // Overall Quality gap (Team depth/execution edge)
    const qualityGap = (homeStats.overall - awayStats.overall);

    let homeQ = 26 + (homeNet * 0.4) + (qualityGap * 0.3) + homeAdvantage + (Math.random() * 8 - 4);
    let awayQ = 26 + (awayNet * 0.4) - (qualityGap * 0.3) + (Math.random() * 8 - 4);
    
    const hFinalQ = Math.max(16, Math.floor(homeQ));
    const aFinalQ = Math.max(16, Math.floor(awayQ));
    
    quarters.push({ home: hFinalQ, away: aFinalQ });
    homeTotal += hFinalQ;
    awayTotal += aFinalQ;

    // Stamina Decay Logic
    const applyDecay = (players: any[], lineup: Set<string>) => {
      players.forEach(p => {
        const isStarter = lineup.has(p.id);
        let minutesPlayed = 0;
        
        if (isFastSim) {
          minutesPlayed = isStarter ? 12 : 0;
        } else {
          // Balanced rotation: starters play 8 mins, bench plays 4 mins per quarter
          minutesPlayed = isStarter ? 8 : 4;
        }

        // Decay = Base (0.5 per minute) * Endurance Multiplier
        // Low endurance (e.g. 1.2) = faster decay. High endurance (0.8) = slower.
        const decay = minutesPlayed * 0.5 * (p.endurance || 1);
        p.stamina = Math.max(0, p.stamina - decay);
      });
    };

    applyDecay(currentHomePlayers, hLineup);
    applyDecay(currentAwayPlayers, aLineup);
  }
  
  // Overtime if draw
  if (homeTotal === awayTotal) {
    const homeOt = Math.floor(Math.random() * 10) + 5;
    const awayOt = Math.floor(Math.random() * 10) + 5;
    quarters.push({ home: homeOt, away: awayOt });
    homeTotal += homeOt;
    awayTotal += awayOt;
  }

  // Calculate final player updates
  const playerUpdates = [
    ...currentHomePlayers.map(p => ({ id: p.id, staminaChange: p.stamina - homePlayers.find(op => op.id === p.id)!.stamina })),
    ...currentAwayPlayers.map(p => ({ id: p.id, staminaChange: p.stamina - awayPlayers.find(op => op.id === p.id)!.stamina })),
  ];
  
  return {
    homeTeamId: homeTeam.id,
    awayTeamId: awayTeam.id,
    homeScore: homeTotal,
    awayScore: awayTotal,
    quarters: quarters.map(q => ({ home: q.home, away: q.away })),
    date: new Date().toISOString(),
    playerUpdates
  };
}
