import fs from 'fs';

const path = 'src/App.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add interactive quarters state and handlers
const injectionPoint = 'const [isGeneratingNews, setIsGeneratingNews] = useState(false);';
const newStates = `
  const [playoffQuarter, setPlayoffQuarter] = useState(1);
  const [isQuarterSimulating, setIsQuarterSimulating] = useState(false);
  const [playoffGameStatus, setPlayoffGameStatus] = useState<'playing' | 'halftime' | 'finished' | 'idle'>('idle');
  const [playoffGameScores, setPlayoffGameScores] = useState({ home: 0, away: 0 });
`;
content = content.replace(injectionPoint, injectionPoint + newStates);

// 2. Add interactive quarter simulation logic
const quarterSimLogic = `
  const simulatePlayoffQuarter = async () => {
    if (!activePlayoffGame || isQuarterSimulating) return;
    setIsQuarterSimulating(true);
    
    // Calculate quarter performance based on OVR
    const homePool = players.filter(p => activePlayoffGame.home.lineup?.includes(p.id));
    const awayPool = players.filter(p => activePlayoffGame.away.lineup?.includes(p.id));
    const homeOVR = calculateTeamOVR(homePool.length >= 5 ? homePool : players.filter(p => p.teamId === activePlayoffGame.home.id).slice(0,5));
    const awayOVR = calculateTeamOVR(awayPool.length >= 5 ? awayPool : players.filter(p => p.teamId === activePlayoffGame.away.id).slice(0,5));
    
    // Baseline points per quarter
    const getQPoints = (ovr: any) => Math.floor(Math.random() * 10) + 15 + (ovr.offense / 4);
    const hQ = getQPoints(homeOVR);
    const aQ = getQPoints(awayOVR);
    
    // Animation
    for (let i = 1; i <= 10; i++) {
       setPlayoffGameScores(prev => ({
         home: prev.home + Math.round(hQ/10),
         away: prev.away + Math.round(aQ/10)
       }));
       await new Promise(r => setTimeout(r, 100));
    }
    
    setPlayoffQuarter(prev => prev + 1);
    if (playoffQuarter >= 4) {
      setPlayoffGameStatus('finished');
    } else {
      setPlayoffGameStatus('halftime');
    }
    setIsQuarterSimulating(false);
  };
`;
// Insert after simulateWeek
content = content.replace('  const simulateWeek = async () => {', quarterSimLogic + '\n  const simulateWeek = async () => {');

// 3. Simple Playoff Interface in Dashboard
content = content.replace(
  'const generateLeagueContext = () => {',
  `const startPlayoffGame = (match: any) => {
    setActivePlayoffGame(match);
    setPlayoffQuarter(1);
    setPlayoffGameScores({ home: 0, away: 0 });
    setPlayoffGameStatus('playing');
  };\n\n  const generateLeagueContext = () => {`
);

// 4. Inject Playoff Modal/UI at the check for overlays
// (I'll find a good spot near the end of the file)
const playoffUI = `
      {activePlayoffGame && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl" onClick={() => !isQuarterSimulating && setActivePlayoffGame(null)}></div>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-4xl bg-white rounded-[40px] overflow-hidden shadow-2xl border-2 border-slate-100 flex flex-col h-[80vh]"
          >
            <div className="p-8 bg-slate-50 border-b flex justify-between items-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
              <div>
                <h2 className="text-3xl font-black text-slate-900 italic uppercase">
                  🏆 季後賽對決 <span className="text-blue-600">Q{playoffQuarter > 4 ? 4 : playoffQuarter}</span>
                </h2>
                <p className="text-sm font-bold text-slate-400">目前狀況: {playoffGameStatus === 'halftime' ? '節間休息' : playoffGameStatus === 'finished' ? '比賽結束' : '比賽進行中'}</p>
              </div>
              <button 
                 onClick={() => setActivePlayoffGame(null)} 
                 className="w-12 h-12 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-100 transition-all"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-12 space-y-12">
               <div className="flex items-center justify-between gap-12">
                  <div className="text-center space-y-4 flex-1">
                    <img src={activePlayoffGame.home.logo} className="w-32 h-32 mx-auto drop-shadow-xl" alt="logo" />
                    <div className="text-2xl font-black text-slate-900 uppercase italic">{activePlayoffGame.home.name}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-8xl font-black text-slate-900 tracking-tighter flex gap-4">
                       <motion.span key={playoffGameScores.home}>{playoffGameScores.home}</motion.span>
                       <span className="text-slate-200">:</span>
                       <motion.span key={playoffGameScores.away}>{playoffGameScores.away}</motion.span>
                    </div>
                  </div>
                   <div className="text-center space-y-4 flex-1">
                    <img src={activePlayoffGame.away.logo} className="w-32 h-32 mx-auto drop-shadow-xl" alt="logo" />
                    <div className="text-2xl font-black text-slate-900 uppercase italic">{activePlayoffGame.away.name}</div>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-8">
                  <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                    <h4 className="font-bold text-slate-400 mb-4 inline-block px-3 py-1 bg-white rounded-lg uppercase tracking-widest text-[10px]">我的先發</h4>
                    <div className="grid grid-cols-5 gap-2">
                      {players.filter(p => activePlayoffGame.home.lineup?.includes(p.id)).slice(0,5).map(p => (
                        <div key={p.id} className="w-full aspect-square bg-white rounded-xl border border-slate-100 flex flex-col items-center justify-center">
                          <img src={p.avatar} className="w-8 h-8 rounded-full" alt="p" />
                          <div className="text-[8px] font-black">{p.rating}</div>
                        </div>
                      ))}
                    </div>
                    {playoffGameStatus === 'halftime' && (
                      <button 
                        onClick={() => { setActiveTab('roster'); setActivePlayoffGame(null); }}
                        className="mt-4 w-full bg-blue-600 text-white rounded-xl py-2 font-black italic text-xs uppercase"
                      >
                        調整陣容
                      </button>
                    )}
                  </div>
                  <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                    <h4 className="font-bold text-slate-400 mb-4 inline-block px-3 py-1 bg-white rounded-lg uppercase tracking-widest text-[10px]">對手先發</h4>
                     <div className="grid grid-cols-5 gap-2 opacity-50">
                      {players.filter(p => p.teamId === activePlayoffGame.away.id).slice(0,5).map(p => (
                        <div key={p.id} className="w-full aspect-square bg-white rounded-xl border border-slate-100 flex flex-col items-center justify-center">
                          <img src={p.avatar} className="w-8 h-8 rounded-full" alt="p" />
                          <div className="text-[8px] font-black">{p.rating}</div>
                        </div>
                      ))}
                    </div>
                  </div>
               </div>
            </div>

            <div className="p-8 bg-white border-t flex gap-4">
              {playoffGameStatus === 'finished' ? (
                 <button 
                  onClick={() => setActivePlayoffGame(null)}
                  className="flex-1 bg-slate-900 text-white py-6 rounded-3xl font-black text-xl uppercase italic shadow-lg"
                 >
                   離開球場
                 </button>
              ) : (
                <button 
                  disabled={isQuarterSimulating}
                  onClick={simulatePlayoffQuarter}
                  className="flex-1 bg-blue-600 text-white py-6 rounded-3xl font-black text-xl uppercase italic shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:bg-slate-200 transition-all"
                >
                  {isQuarterSimulating ? '模擬中...' : \`開始第 \${playoffQuarter} 節\`}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
`;
// Find the last closing brace before the end and insert
const parts = content.split('      <AnimatePresence>');
content = parts[0] + playoffUI + '      <AnimatePresence>' + parts[1];

fs.writeFileSync(path, content);
console.log('Playoff UI and interaction added');
