import { Player, Team, GameResult } from '../types';

export function calculateTeamOVR(players: Player[]): { offense: number; defense: number; overall: number } {
  if (players.length === 0) return { offense: 0, defense: 0, overall: 0 };
  
  const playersWithBonuses = players.map(p => {
    let offBonus = 0;
    let defBonus = 0;
    (p.equipment || []).forEach(e => {
      offBonus += e.bonus.offense || 0;
      defBonus += e.bonus.defense || 0;
    });
    // Effective rating accounts for gear for OVR calculation
    const effectiveRating = p.rating + (offBonus + defBonus) / 2;
    return {
      ...p,
      offense: p.offense + offBonus,
      defense: p.defense + defBonus,
      effectiveRating: effectiveRating
    };
  });

  const defense = playersWithBonuses.reduce((sum, p) => sum + p.defense, 0) / playersWithBonuses.length;
  const offense = playersWithBonuses.reduce((sum, p) => sum + p.offense, 0) / playersWithBonuses.length;
  const overall = playersWithBonuses.reduce((sum, p) => sum + p.effectiveRating, 0) / playersWithBonuses.length;
  
  return { offense, defense, overall };
}

export function simulateGame(homeTeam: Team, homePlayers: Player[], awayTeam: Team, awayPlayers: Player[]): GameResult {
  const homeStats = calculateTeamOVR(homePlayers);
  const awayStats = calculateTeamOVR(awayPlayers);
  
  const quarters = [];
  let homeTotal = 0;
  let awayTotal = 0;
  
  // Home Court Advantage: 2 points
  const homeAdvantage = 2.0; 

  for (let q = 1; q <= 4; q++) {
    // Net Rating: How well offense beats defense
    const homeNet = (homeStats.offense - awayStats.defense);
    const awayNet = (awayStats.offense - homeStats.defense);
    
    // Overall Quality gap (Team depth/execution edge)
    const qualityGap = (homeStats.overall - awayStats.overall);

    // Scoring Formula (Increased weights for OVR impact, reduced variance)
    // 26: Baseline
    // Net Rating * 0.4
    // Quality Gap * 0.3
    // Variance: +/- 4 (Math.random() * 8 - 4)
    
    let homeQ = 26 + (homeNet * 0.4) + (qualityGap * 0.3) + homeAdvantage + (Math.random() * 8 - 4);
    let awayQ = 26 + (awayNet * 0.4) - (qualityGap * 0.3) + (Math.random() * 8 - 4);
    
    // Safety clamp
    const hFinalQ = Math.max(16, Math.floor(homeQ));
    const aFinalQ = Math.max(16, Math.floor(awayQ));
    
    quarters.push({ home: hFinalQ, away: aFinalQ });
    homeTotal += hFinalQ;
    awayTotal += aFinalQ;
  }
  
  // Overtime if draw
  if (homeTotal === awayTotal) {
    const homeOt = Math.floor(Math.random() * 10) + 5;
    const awayOt = Math.floor(Math.random() * 10) + 5;
    quarters.push({ home: homeOt, away: awayOt });
    homeTotal += homeOt;
    awayTotal += awayOt;
  }
  
  return {
    homeTeamId: homeTeam.id,
    awayTeamId: awayTeam.id,
    homeScore: homeTotal,
    awayScore: awayTotal,
    quarters: quarters.map(q => ({ home: q.home, away: q.away })),
    date: new Date().toISOString()
  };
}
