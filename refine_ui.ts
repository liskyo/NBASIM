import fs from 'fs';

const path = 'src/App.tsx';
let content = fs.readFileSync(path, 'utf8');

// Update UI: Display current week and season progress more prominently
content = content.replace(
  '<span className="text-xs ml-2 opacity-50">({currentWeek} / 30 週)</span>',
  '<span className="text-sm ml-3 font-black bg-slate-900 text-white px-3 py-1 rounded-full">{currentWeek} / 30 週</span>'
);

// Add a "Play Match" button for the user team in the Dashboard
const searchString = '{userTeam && (';
const buttonInjection = `
                <div className="flex gap-4">
                  <button
                    onClick={simulateWeek}
                    disabled={isSimulating}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-[28px] font-black text-xl uppercase italic transition-all flex items-center justify-center gap-4 shadow-xl shadow-blue-100 group disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    {isSimulating ? <RefreshCw className="animate-spin" /> : <Play fill="currentColor" />}
                    快速模擬本週
                  </button>
                  <button
                    onClick={() => {
                       // Find user game for this week (simulated/mocked for now)
                       const userGame = { home: userTeam, away: teams.find(t => t.id !== userTeamId) };
                       startPlayoffGame(userGame);
                    }}
                    className="px-8 bg-slate-900 hover:bg-slate-800 text-white py-6 rounded-[28px] font-black italic uppercase text-xs transition-all flex items-center justify-center gap-3"
                  >
                    <Basketball className="text-orange-500" />
                    進入球場 (手動)
                  </button>
                </div>`;
// Replace the old simulate button if it exists or insert near the header
content = content.replace(/<button\s+onClick={simulateWeek}[\s\S]+?<\/button>/, buttonInjection);

fs.writeFileSync(path, content);
console.log('UI refined with manual play option');
