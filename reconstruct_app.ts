import fs from 'fs';
const path = 'src/App.tsx';
let content = fs.readFileSync(path, 'utf8');

// The file is truncated at 1691.
// Let's find where we left off.
// 1690: <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
// 1691: <br/>

const missingMarket = \`
                      {explorePool.map((p) => (
                        <div key={p.id} className="space-y-4">
                          <PlayerCard player={p} />
                          <button
                            onClick={() => buyPlayer(p.id)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-4 font-black italic uppercase text-sm transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-100"
                          >
                            <DollarSign size={18} />
                            簽約球員 ($\${(p.price / 1000000).toFixed(1)}M)
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {EQUIPMENT_MARKET.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border-2 border-slate-100 rounded-3xl p-6 hover:shadow-xl transition-all relative group"
                    >
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-50 transition-colors">
                        <item.icon size={32} className="text-slate-400 group-hover:text-orange-500" />
                      </div>
                      <div className="space-y-1 mb-6">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {item.level} {item.type}
                        </div>
                        <h4 className="text-xl font-black text-slate-900 italic uppercase">
                          {item.name}
                        </h4>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-8">
                        {item.bonus.offense && (
                          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black">
                            OFF +{item.bonus.offense}
                          </span>
                        )}
                        {item.bonus.defense && (
                          <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-lg text-[10px] font-black">
                            DEF +{item.bonus.defense}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => setSelectedGearPlayerId(item.id)}
                        className="w-full bg-slate-900 text-white rounded-2xl py-4 font-black italic uppercase text-xs transition-all hover:bg-slate-800"
                      >
                        購買裝備 ($\${(item.price / 1000000).toFixed(1)}M)
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "library" && (
            <div className="space-y-8">
              <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 flex items-center gap-4 focus-within:border-blue-500 transition-colors">
                <Search className="text-slate-400" />
                <input
                   type="text"
                   placeholder="搜尋 2026 屆所有球員..."
                   className="bg-transparent border-none outline-none w-full font-bold text-slate-900"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {players.slice(0, 100).map(p => (
                   <PlayerCard key={p.id} player={p} />
                ))}
              </div>
            </div>
          )}

          {activeTab === "league" && (
            <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
              <div className="grid grid-cols-12 gap-4 p-8 border-b bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <div className="col-span-1">Rank</div>
                <div className="col-span-4">Team</div>
                <div className="col-span-2 text-center">W - L</div>
                <div className="col-span-2 text-center">WIN%</div>
                <div className="col-span-3 text-right">Budget</div>
              </div>
              {standings.map((team, idx) => (
                <div key={team.id} className="grid grid-cols-12 gap-4 p-8 border-b last:border-0 items-center hover:bg-slate-50 transition-colors">
                  <div className="col-span-1 font-black text-2xl italic text-slate-200">#{idx + 1}</div>
                  <div className="col-span-4 flex items-center gap-4">
                    <img src={team.logo} className="w-10 h-10" alt="logo" />
                    <div>
                      <div className="font-black text-slate-900 uppercase italic">{team.name}</div>
                      <div className="text-[10px] font-bold text-slate-400">{team.city}</div>
                    </div>
                  </div>
                  <div className="col-span-2 text-center font-mono font-black text-xl">{team.stats.wins} - {team.stats.losses}</div>
                  <div className="col-span-2 text-center">
                    <div className="text-xs font-black text-blue-600 bg-blue-50 py-1 rounded-lg">
                      {((team.stats.wins || 0) / ((team.stats.wins || 0) + (team.stats.losses || 1)) * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="col-span-3 text-right font-black text-slate-400">$\${(team.budget / 1000000).toFixed(1)}M</div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "stats" && (
            <div className="space-y-6">
              {games.length === 0 ? (
                <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-20 text-center">
                  <Calendar className="mx-auto text-slate-100 mb-6" size={48} />
                  <h3 className="font-black text-2xl text-slate-900">尚無歷史賽事</h3>
                </div>
              ) : (
                <div className="grid gap-4">
                  {[...games].reverse().map((game, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-3xl border-2 border-slate-100 flex items-center justify-between hover:border-blue-200 transition-all">
                       <div className="flex items-center gap-12 flex-1">
                          <div className="flex items-center gap-4 min-w-[150px]">
                            <img src={teams.find(t => t.id === game.homeTeamId)?.logo} className="w-10 h-10" alt="h" />
                            <span className="font-black uppercase italic">{teams.find(t => t.id === game.homeTeamId)?.abbreviation}</span>
                          </div>
                          <div className="text-4xl font-black italic tracking-tighter">
                            <span className={game.homeScore > game.awayScore ? "text-blue-600" : "text-slate-300"}>{game.homeScore}</span>
                            <span className="text-slate-100 mx-4">:</span>
                            <span className={game.awayScore > game.homeScore ? "text-blue-600" : "text-slate-300"}>{game.awayScore}</span>
                          </div>
                          <div className="flex items-center gap-4 min-w-[150px] justify-end">
                            <span className="font-black uppercase italic">{teams.find(t => t.id === game.awayTeamId)?.abbreviation}</span>
                            <img src={teams.find(t => t.id === game.awayTeamId)?.logo} className="w-10 h-10" alt="a" />
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <AnimatePresence>
        {news && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200]"
          >
            <div className="bg-slate-900 text-white px-8 py-5 rounded-[2rem] shadow-2xl flex items-center gap-6 border-2 border-white/10 backdrop-blur-xl">
              <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center animate-pulse">
                <Basketball size={20} />
              </div>
              <p className="font-black italic uppercase tracking-tight text-sm pr-4">
                {news}
              </p>
              <button
                onClick={() => setNews(null)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedGearPlayerId && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedGearPlayerId(null)}></div>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-full max-w-xl bg-white rounded-[40px] p-10 shadow-2xl"
            >
              <h3 className="text-3xl font-black text-slate-900 italic mb-8 uppercase">選擇裝備球員</h3>
              <div className="grid grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto mb-8 pr-2">
                {userRoster.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      const item = EQUIPMENT_MARKET.find(i => i.id === selectedGearPlayerId);
                      if (item) buyEquipment(p.id, item);
                      setSelectedGearPlayerId(null);
                    }}
                    className="flex items-center gap-4 p-4 bg-slate-50 hover:bg-blue-50 rounded-2xl border-2 border-slate-100 hover:border-blue-200 transition-all text-left"
                  >
                    <img src={p.avatar} className="w-10 h-10 rounded-full" alt="p" />
                    <div>
                      <div className="font-black text-slate-800 text-xs">{p.name}</div>
                      <div className="text-[10px] font-bold text-slate-400 italic">OVR {p.rating}</div>
                    </div>
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setSelectedGearPlayerId(null)}
                className="w-full bg-slate-100 text-slate-400 py-4 rounded-2xl font-black uppercase text-xs"
              >
                取消購買
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
\`;

// Concatenate
fs.writeFileSync(path, content.slice(0, content.lastIndexOf('<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">')) + \`
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">\` + missingMarket);

console.log('App.tsx RECONSTRUCTED successfully');
创新 v86建设成功建设中 v247建設成功
