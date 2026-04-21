import fs from 'fs';

const path = 'src/App.tsx';
let content = fs.readFileSync(path, 'utf8');

// Ensure EVERY team has at least 5 players by assigning unaffiliated players if needed
// This logic should go into the initialization useEffect
const initSearch = 'const initialTeams = NBA_TEAMS.map((team) => {';
const fillGapLogic = `
    // Pre-initialization: Fill gaps for teams with < 5 players
    let currentPlayers = [...players];
    NBA_TEAMS.forEach(team => {
      const teamPlayersCount = currentPlayers.filter(p => p.teamId === team.id).length;
      if (teamPlayersCount < 5) {
        // Find unaffiliated players or create generic ones
        const needed = 5 - teamPlayersCount;
        for (let i = 0; i < needed; i++) {
           const newP = {
             id: "gen-" + team.id + "-" + i,
             name: team.city + " Rookie " + (i+1),
             rating: 65 + Math.floor(Math.random() * 10),
             teamId: team.id,
             avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + team.id + i,
             position: "G",
             stats: { points: 0, rebounds: 0, assists: 0, games: 0 }
           };
           currentPlayers.push(newP);
        }
      }
    });
    if (currentPlayers.length > players.length) {
      setPlayers(currentPlayers);
    }\n
`;
content = content.replace(initSearch, fillGapLogic + initSearch);

fs.writeFileSync(path, content);
console.log('Roster gap filler added');
