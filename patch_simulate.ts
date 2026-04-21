import fs from 'fs';

const path = 'src/App.tsx';
let content = fs.readFileSync(path, 'utf8');

// Update simulateWeek to handle season progress and strict roster check
content = content.replace(
  'const simulateWeek = async () => {',
  `const simulateWeek = async () => {
    if (isSimulating || isPlayoffs) return;

    // Check if ALL teams have at least 5 players in their roster
    const underweightTeams = teams.filter(t => players.filter(p => p.teamId === t.id).length < 5);
    if (underweightTeams.length > 0) {
      setNews("🚨 無法開賽：聯盟中有 " + underweightTeams.length + " 支球隊球員數不足 5 人 (" + underweightTeams.map(t => t.name).join(", ") + ")。");
      return;
    }

    if (userStarters.length < 5) {
      setNews("🚨 無法開賽：請先進入「球員名單」手動勾選 5 位先發球員！");
      setActiveTab("roster");
      return;
    }`
);

// End of simulateWeek: increment week and check for playoffs
content = content.replace(
  'setIsSimulating(false);',
  `setIsSimulating(false);
      const nextWeek = currentWeek + 1;
      setCurrentWeek(nextWeek);
      if (nextWeek > 30) {
        setIsPlayoffs(true);
        setNews("🏀 例行賽結束！季後賽正式開打！正在生成對陣圖...");
      }`
);

fs.writeFileSync(path, content);
console.log('simulateWeek updated');
