import { useState, useEffect, useMemo } from "react";
import {
  NBA_TEAMS,
  GET_RATING_COLOR,
  INITIAL_BUDGET,
  WIN_BONUS,
  LOSS_BONUS,
  EXPLORE_COOLDOWN_MS,
  MAX_ROSTER_SIZE,
  MIN_ROSTER_SIZE,
  EQUIPMENT_MARKET, REGULAR_SEASON_GAMES,
  CALCULATE_PLAYER_PRICE,
} from "./constants";
import { INITIAL_PLAYERS } from "./data/players";
import { Team, Player, GameResult, Equipment } from "./types";
import { PlayerCard } from "./components/PlayerCard";
import { simulateGame, calculateTeamOVR } from "./lib/simulation";
import { generateRandomName } from "./lib/names";
import { motion, AnimatePresence } from "motion/react";
import {
  Trophy,
  Users,
  Calendar,
  BarChart3,
  Play,
  RotateCcw,
  ChevronRight,
  Target,
  Trophy as TrophyIcon,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Search,
  ShoppingCart,
  Clock,
  Dribbble as Basketball,
  Shirt,
  Footprints,
  Watch,
  Plus,
  Square,
  Shield,
  Zap,
  AlertTriangle,
  Sparkles,
  Crown,
  XCircle,
  Menu,
  X,
} from "lucide-react";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  // 💡 自動抓取裝備圖片路徑的小工具
  const getGearImage = (type: string, level: string) => {
    const typeMap: Record<string, string> = {
      'JERSEY': 'jersey', 'SHORTS': 'shorts', 'SHOES': 'shoes',
      'KNEE_PADS': 'kneepad', 'WRISTBAND': 'wristband', 'HEADBAND': 'headband'
    };
    const levelMap: Record<string, number> = {
      'Basic': 1, 'Standard': 2, 'Pro': 3, 'Elite': 4, 'Master': 5, 'Legendary': 6
    };
    return `/image/gear/${typeMap[type]}_${levelMap[level]}.jpg`;
  };

  const IconMap: Record<string, any> = {
    Shirt,
    Square,
    Footprints,
    Shield,
    Watch,
    Zap
  };

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userTeamId, setUserTeamId] = useState<string | null>(
    localStorage.getItem("nba-gm-team"),
  );
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [games, setGames] = useState<GameResult[]>([]);
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "roster" | "league" | "stats" | "market" | "library" | "team_rosters"
  >("dashboard");
  const [librarySearch, setLibrarySearch] = useState("");
  const [libraryPage, setLibraryPage] = useState(0);
  const [librarySort, setLibrarySort] = useState<"rating" | "price" | "name" | "position">("rating");
  const [librarySortOrder, setLibrarySortOrder] = useState<"asc" | "desc">("desc");
  const [libraryPositionFilter, setLibraryPositionFilter] = useState<string>("ALL");
  const ITEMS_PER_PAGE = 500;
  const [marketSubTab, setMarketSubTab] = useState<"players" | "gear">(
    "players",
  );
  const [selectedGearPlayerId, setSelectedGearPlayerId] = useState<
    string | null
  >(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(() => {
    return Number(localStorage.getItem("nba-gm-current-week") || 1);
  });
  const [isPlayoffs, setIsPlayoffs] = useState(() => {
    return localStorage.getItem("nba-gm-is-playoffs") === "true";
  });
  const [playoffBracket, setPlayoffBracket] = useState<any[]>(() => {
    const saved = localStorage.getItem("nba-gm-po-bracket");
    return saved ? JSON.parse(saved) : [];
  });
  const [playoffRound, setPlayoffRound] = useState(() => {
    return Number(localStorage.getItem("nba-gm-po-round") || 0);
  });
  const [activePlayoffGame, setActivePlayoffGame] = useState<any | null>(() => {
    const saved = localStorage.getItem("nba-gm-po-active");
    return saved ? JSON.parse(saved) : null;
  });
  const [showPlayoffRoster, setShowPlayoffRoster] = useState(false);
  const [isGeneratingNews, setIsGeneratingNews] = useState(false);

  const [playoffQuarter, setPlayoffQuarter] = useState(() => {
    return Number(localStorage.getItem("nba-gm-po-q") || 1);
  });
  const [isQuarterSimulating, setIsQuarterSimulating] = useState(false);
  const [playoffGameStatus, setPlayoffGameStatus] = useState<'playing' | 'halftime' | 'finished' | 'idle'>(() => {
    return (localStorage.getItem("nba-gm-po-status") as any) || 'idle';
  });
  const [playoffGameScores, setPlayoffGameScores] = useState(() => {
    const saved = localStorage.getItem("nba-gm-po-scores");
    return saved ? JSON.parse(saved) : { home: 0, away: 0 };
  });

  const [releaseConfirmId, setReleaseConfirmId] = useState<string | null>(null);

  const [playoffEliminations, setPlayoffEliminations] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem("nba-gm-po-elims");
    return saved ? JSON.parse(saved) : {};
  });
  const [regularSeasonStandings, setRegularSeasonStandings] = useState<string[]>(() => {
    const saved = localStorage.getItem("nba-gm-reg-standings");
    return saved ? JSON.parse(saved) : [];
  });
  const [isOffseason, setIsOffseason] = useState(() => {
    return localStorage.getItem("nba-gm-is-offseason") === "true";
  });
  // 自創隊伍相關 State
  const [showCustomTeamModal, setShowCustomTeamModal] = useState(false);
  const [customTeamData, setCustomTeamData] = useState({
    name: "",
    city: "",
    logo: "",
  });
  const [isTradePhase, setIsTradePhase] = useState(false); // 創隊後的補強階段
  const [offseasonUserRookie, setOffseasonUserRookie] = useState<Player | null>(() => {
    const saved = localStorage.getItem("nba-gm-offseason-rookie");
    return saved ? JSON.parse(saved) : null;
  });
  const [offseasonLegendPool, setOffseasonLegendPool] = useState<Player[]>(() => {
    const saved = localStorage.getItem("nba-gm-offseason-legends");
    return saved ? JSON.parse(saved) : [];
  });
  const [offseasonStep, setOffseasonStep] = useState(0);

  const trainPlayer = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    // 定義限制
    const maxTraining = player.isLegend ? 10 : 6;
    const currentTraining = player.trainingCount || 0;

    if (currentTraining >= maxTraining) {
      setNews(`⚠️ ${player.name} 已達到修煉上限 (${maxTraining}次)！`);
      return;
    }

    const cost = player.isLegend ? 1000000000 : 500000000; // $1000M for Legend, $500M for Regular
    if (!userTeam || userTeam.budget < cost) {
      setNews(`⚠️ 經費不足！修煉需要 $${(cost / 1000000).toLocaleString()}M！`);
      return;
    }

    // Update Player
    const newOffense = player.offense + 0.5;
    const newDefense = player.defense + 0.5;
    const newRating = player.rating + 0.5;
    const newTrainingCount = currentTraining + 1;

    setPlayers(prev => prev.map(p => {
      if (p.id === playerId) {
        return {
          ...p,
          offense: newOffense,
          defense: newDefense,
          rating: newRating,
          trainingCount: newTrainingCount,
          color: GET_RATING_COLOR(newRating)
        };
      }
      return p;
    }));

    // Deduct Budget
    setTeams(prev => prev.map(t => {
      if (t.id === userTeamId) {
        return { ...t, budget: t.budget - cost };
      }
      return t;
    }));

    setNews(`💥 ${player.name} 完成第 ${newTrainingCount} 次修煉！各項能力提升 0.5 次世代點！`);
  };

  const startPlayoffGame = (match: any) => {
    // Resume detection
    if (activePlayoffGame && activePlayoffGame.home.id === match.home.id && activePlayoffGame.away.id === match.away.id && playoffGameStatus !== 'finished') {
       // Already in progress, just open the modal (handled by state)
       return; 
    }
    // Sync with latest team data
    const latestHome = teams.find(t => t.id === match.home.id) || match.home;
    const latestAway = teams.find(t => t.id === match.away.id) || match.away;
    setActivePlayoffGame({ home: latestHome, away: latestAway });
    setPlayoffQuarter(1);
    setPlayoffGameScores({ home: 0, away: 0 });
    setPlayoffGameStatus('playing');
    setShowPlayoffRoster(false);
  };

  const generateLeagueContext = () => {
    const sortedTeams = [...teams].sort((a, b) => {
      const winRateA =
        a.stats.wins + a.stats.losses === 0
          ? 0
          : a.stats.wins / (a.stats.wins + a.stats.losses);
      const winRateB =
        b.stats.wins + b.stats.losses === 0
          ? 0
          : b.stats.wins / (b.stats.wins + b.stats.losses);
      return winRateB - winRateA;
    });

    const leader = sortedTeams[0];
    const topPlayer = [...players].sort((a, b) => b.rating - a.rating)[0];
    const userTeamIndex = sortedTeams.findIndex((t) => t.id === userTeamId) + 1;

    return {
      leader: leader ? `${leader.city}${leader.name}` : "無",
      topPlayer: topPlayer ? topPlayer.name : "無",
      userStanding: userTeamIndex,
      userTeamName: userTeam ? `${userTeam.city}${userTeam.name}` : "無",
      recentGames: games
        .slice(-3)
        .map((g) => {
          const h = teams.find((t) => t.id === g.homeTeamId)?.abbreviation;
          const a = teams.find((t) => t.id === g.awayTeamId)?.abbreviation;
          return `${h} ${g.homeScore} : ${g.awayScore} ${a}`;
        })
        .join(", "),
    };
  };

  const startPlayoffTournament = (sortedTeams: Team[]) => {
    // Top 8 teams enter playoffs
    const top8 = sortedTeams.slice(0, 8);
    // Round 1 Matchups (NBA Style 1-8, 4-5, 2-7, 3-6)
    const matchups = [
      { home: top8[0], away: top8[7], winner: null, scores: { home: 0, away: 0 } }, // 1 v 8
      { home: top8[3], away: top8[4], winner: null, scores: { home: 0, away: 0 } }, // 4 v 5
      { home: top8[1], away: top8[6], winner: null, scores: { home: 0, away: 0 } }, // 2 v 7
      { home: top8[2], away: top8[5], winner: null, scores: { home: 0, away: 0 } }, // 3 v 6
    ];
    setRegularSeasonStandings(sortedTeams.map(t => t.id));
    setPlayoffEliminations({});
    setPlayoffBracket(matchups);
    setPlayoffRound(1);
    setIsPlayoffs(true);
    setNews("🎉 例行賽正式結束！季後賽對陣圖已生成，強強對決即刻開打！");
  };

  const getNextPlayoffMatch = () => {
    if (!isPlayoffs || playoffBracket.length === 0) return null;
    // Find first unfinished match
    return playoffBracket.find(m => !m.winner);
  };

  const finalizePlayoffGame = (matchIndex: number, homeWin: boolean, hScore: number, aScore: number) => {
    const newBracket = [...playoffBracket];
    const match = newBracket[matchIndex];
    match.winner = homeWin ? match.home : match.away;
    const loserId = homeWin ? match.away.id : match.home.id;
    match.scores = { home: hScore, away: aScore };
    
    setPlayoffBracket(newBracket);
    
    // 全局體力恢復 (季後賽模擬了一場比賽，其餘球員應恢復)
    setPlayers(prev => prev.map(p => {
      const isHome = p.teamId === match.home.id;
      const isAway = p.teamId === match.away.id;
      // 正在比賽的球隊，非先發(休息者)恢復 15，先發在 simulatePlayoffQuarter 已扣除
      // 其他沒比賽的球隊球員 恢復 20
      if (!isHome && !isAway) {
        return { ...p, stamina: Math.min(100, p.stamina + 20) };
      }
      
      const team = isHome ? match.home : match.away;
      const isStarter = team.lineup?.includes(p.id);
      if (!isStarter) {
        return { ...p, stamina: Math.min(100, p.stamina + 15) };
      }
      return p;
    }));
    
    // Check if round is finished
    const finished = newBracket.every(m => m.winner);
    if (finished) {
       // Save eliminations
       const newElims = { ...playoffEliminations };
       newBracket.forEach(m => {
          const lId = m.winner.id === m.home.id ? m.away.id : m.home.id;
          if (playoffRound === 1) newElims[lId] = 8;
          else if (playoffRound === 2) newElims[lId] = 4;
          else if (playoffRound === 3) {
             newElims[lId] = 2;
             newElims[m.winner.id] = 1;
          }
       });
       setPlayoffEliminations(newElims);

       if (playoffRound === 3) {
          setNews(`🏁 傳奇誕生！${match.winner.name} 奪得 2026 NBA 總冠軍！`);
          // Trigger season transition after finals
          setTimeout(() => startOffseason(newElims), 2000); 
       } else {
          setNews(`第 ${playoffRound} 輪結束！準備進入下一階段...`);
       }
    }
  };

  const proceedToNextPlayoffRound = () => {
    const winners = playoffBracket.map(m => m.winner);
    if (playoffRound === 1) {
       // Semis: Winner of (1v8) vs Winner of (4v5) | Winner of (2v7) vs Winner of (3v6)
       const nextMatchups = [
         { home: winners[0], away: winners[1], winner: null, scores: { home: 0, away: 0 } },
         { home: winners[2], away: winners[3], winner: null, scores: { home: 0, away: 0 } }
       ];
       setPlayoffBracket(nextMatchups);
       setPlayoffRound(2);
    } else if (playoffRound === 2) {
       // Finals
       const nextMatchups = [
         { home: winners[0], away: winners[1], winner: null, scores: { home: 0, away: 0 } }
       ];
       setPlayoffBracket(nextMatchups);
       setPlayoffRound(3);
    } else {
       // End of post-season
       setNews("賽季圓滿結束，您可以重設數據開啟新賽季，或繼續留在球員百科研究！");
    }
  };

  const autoSimulateAiPlayoffGames = () => {
    let currentPlayers = [...players];
    const newBracket = [...playoffBracket];
    let bracketUpdated = false;
    let allUpdatedStaminas = new Map<string, number>();
    let participantIds = new Set<string>();
    let updatedTeamsMap = new Map<string, Team>();

    const applyAiRotation = (team: Team) => {
        const teamRoster = currentPlayers.filter(p => p.teamId === team.id);
        let newLineup = [...(team.lineup || [])];
        const teamRosterIds = new Set(teamRoster.map(p => p.id));
        newLineup = newLineup.filter(id => teamRosterIds.has(id));

        const staminaThreshold = 80;
        const starters = teamRoster.filter(p => newLineup.includes(p.id));
        const reserves = teamRoster.filter(p => !newLineup.includes(p.id));

        starters.forEach(star => {
          if (star.stamina < staminaThreshold) {
            let bestReserve = reserves.filter(r => r.position === star.position).sort((a,b) => b.stamina - a.stamina)[0];
            if (!bestReserve) {
               bestReserve = reserves.sort((a,b) => b.stamina - a.stamina)[0];
            }
            if (bestReserve && bestReserve.stamina > star.stamina) {
               newLineup = newLineup.map(id => id === star.id ? bestReserve!.id : id);
               const resIdx = reserves.findIndex(r => r.id === bestReserve!.id);
               if(resIdx > -1) reserves.splice(resIdx, 1);
               reserves.push(star);
            }
          }
        });
        team.lineup = newLineup;
    };

    newBracket.forEach((m) => {
      if (m.winner) return;
      if (m.home.id === userTeamId || m.away.id === userTeamId) return; // Leave user games alone

      // 1. Prepare Teams
      const homeTeam = teams.find(t => t.id === m.home.id) || m.home;
      const awayTeam = teams.find(t => t.id === m.away.id) || m.away;
      const mutableHome = { ...homeTeam };
      const mutableAway = { ...awayTeam };
      
      // 2. AI Rotation
      applyAiRotation(mutableHome);
      applyAiRotation(mutableAway);
      updatedTeamsMap.set(mutableHome.id, mutableHome);
      updatedTeamsMap.set(mutableAway.id, mutableAway);

      const homeRoster = currentPlayers.filter(p => p.teamId === mutableHome.id);
      const awayRoster = currentPlayers.filter(p => p.teamId === mutableAway.id);

      // Track participants for recovery later
      homeRoster.forEach(p => participantIds.add(p.id));
      awayRoster.forEach(p => participantIds.add(p.id));

      // 3. Simulate Fast Game
      const result = simulateGame(mutableHome, homeRoster, mutableAway, awayRoster, true);
      
      // 4. Update bracket
      m.winner = result.homeScore > result.awayScore ? mutableHome : mutableAway;
      m.scores = { home: result.homeScore, away: result.awayScore };
      bracketUpdated = true;

      // 5. Track stamina changes
      result.playerUpdates?.forEach(u => {
         const current = allUpdatedStaminas.get(u.id) || 0;
         allUpdatedStaminas.set(u.id, current + u.staminaChange);
      });
    });

    if (bracketUpdated) {
        setPlayoffBracket(newBracket);
        
        const finished = newBracket.every(m => m.winner);
        if (finished) {
           // Save eliminations
           const newElims = { ...playoffEliminations };
           newBracket.forEach(m => {
              const lId = m.winner.id === m.home.id ? m.away.id : m.home.id;
              if (playoffRound === 1) newElims[lId] = 8;
              else if (playoffRound === 2) newElims[lId] = 4;
              else if (playoffRound === 3) {
                 newElims[lId] = 2;
                 newElims[m.winner.id] = 1;
              }
           });
           setPlayoffEliminations(newElims);

           if (playoffRound === 3) {
              setNews(`🏁 傳奇誕生！${newBracket[0].winner.name} 奪得 2026 NBA 總冠軍！`);
              setTimeout(() => startOffseason(newElims), 2000); 
           } else {
              setNews(`第 ${playoffRound} 輪結束！準備進入下一階段...`);
           }
        }
        
        if (updatedTeamsMap.size > 0) {
            setTeams(prev => prev.map(t => updatedTeamsMap.has(t.id) ? updatedTeamsMap.get(t.id)! : t));
        }

        setPlayers(prev => prev.map(p => {
           if (allUpdatedStaminas.has(p.id)) {
              // Participating AI players: Final stamina = base + decay + recovery
              return { ...p, stamina: Math.min(100, Math.max(0, p.stamina + allUpdatedStaminas.get(p.id)!) + 20) };
           }
           if (!participantIds.has(p.id)) {
              // Non-participating players (including user team if resting) recover
              return { ...p, stamina: Math.min(100, p.stamina + 20) };
           }
           return p;
        }));
    }
  };

  const autoGenerateNews = async (force = false) => {
    // Reduce production: only generate new news every 4 weeks unless forced
    if (!force && newsCache.length > 0 && currentWeek < lastNewsWeek + 4 && currentWeek > 1) {
      // Rotate news from cache if available
      const randomNews = newsCache[Math.floor(Math.random() * newsCache.length)];
      setNews(randomNews);
      localStorage.setItem("nba-gm-current-news", randomNews);
      return;
    }

    setIsGeneratingNews(true);
    try {
      const sortedTeams = [...teams].sort((a, b) => {
        const winRateA = (a.stats.wins + a.stats.losses === 0) ? 0 : a.stats.wins / (a.stats.wins + a.stats.losses);
        const winRateB = (b.stats.wins + b.stats.losses === 0) ? 0 : b.stats.wins / (b.stats.wins + b.stats.losses);
        return winRateB - winRateA;
      });

      const leader = sortedTeams[0];
      const bottom = sortedTeams[sortedTeams.length - 1];
      const userTeamIndex = sortedTeams.findIndex((t) => t.id === userTeamId);
      const userTeamData = sortedTeams[userTeamIndex];

      const newNewsList: string[] = [];

      // 1. My Team Status (Priority)
      if (userTeamData) {
        const myTeamName = `${userTeamData.city}${userTeamData.name}`;
        if (userTeamData.stats.wins > userTeamData.stats.losses) {
          newNewsList.push(`【戰報】${myTeamName} 展現強大進攻火力，目前的戰績穩居聯盟第 ${userTeamIndex + 1} 位！`);
        } else {
          newNewsList.push(`【球隊觀測】${myTeamName} 目前排名第 ${userTeamIndex + 1}，總經理正在尋求突破困境的方法。`);
        }

        // Streak news
        const lastGames = games.filter(g => g.homeTeamId === userTeamId || g.awayTeamId === userTeamId).slice(-3);
        const winStreak = lastGames.every(g => (g.homeTeamId === userTeamId && g.homeScore > g.awayScore) || (g.awayTeamId === userTeamId && g.awayScore > g.homeScore));
        if (winStreak && lastGames.length >= 2) {
          newNewsList.push(`【連勝特報】${myTeamName} 已豪取 ${lastGames.length} 連勝！球隊氣勢正值巔峰。`);
        }
      }

      // 2. League Leaders & Bottoms
      if (leader) {
        newNewsList.push(`【聯盟霸主】${leader.city}${leader.name} 以驚人的勝率橫掃全聯盟，目前坐穩排行榜第一！`);
      }
      if (bottom && bottom.id !== userTeamId) {
        newNewsList.push(`【低迷警訊】${bottom.city}${bottom.name} 目前陷入連敗泥淖，排名掉至聯盟墊底。`);
      }

      // 3. Trade Market Elite (Rating > 95)
      const eliteFreeAgents = players.filter(p => p.teamId === 'FA' && p.rating >= 95);
      if (eliteFreeAgents.length > 0) {
        const topFA = eliteFreeAgents[0];
        newNewsList.push(`【交易焦點】超級巨星 ${topFA.name} (評分: ${topFA.rating}) 目前仍在自由市場，引發各隊瘋狂競逐！`);
      }

      // 4. Ranking Changes (General)
      const top3 = sortedTeams.slice(0, 3).map(t => t.abbreviation).join(', ');
      newNewsList.push(`【勢力版圖】目前聯盟前三強分別由 ${top3} 佔據，季後賽席分爭奪激烈。`);

      setNewsCache(newNewsList);
      setLastNewsWeek(currentWeek);
      localStorage.setItem("nba-gm-news-cache", JSON.stringify(newNewsList));
      localStorage.setItem("nba-gm-last-news-week", currentWeek.toString());

      const selectedNews = newNewsList[Math.floor(Math.random() * newNewsList.length)];
      setNews(selectedNews);
      localStorage.setItem("nba-gm-current-news", selectedNews);
    } catch (error) {
      console.error("Failed to generate news:", error);
    } finally {
      setIsGeneratingNews(false);
    }
  };
  const [activeGames, setActiveGames] = useState<GameResult[] | null>(null);
  const [news, setNews] = useState<string | null>(() => {
    const saved = localStorage.getItem("nba-gm-current-news");
    return saved || "歡迎來到 NBA 2024-25 賽季。點擊「模擬本週」開始你的經理生涯！";
  });
  const [newsCache, setNewsCache] = useState<string[]>(() => {
    const saved = localStorage.getItem("nba-gm-news-cache");
    return saved ? JSON.parse(saved) : [];
  });
  const [lastNewsWeek, setLastNewsWeek] = useState<number>(() => {
    const saved = localStorage.getItem("nba-gm-last-news-week");
    return saved ? parseInt(saved) : 0;
  });
  const [selectedViewTeamId, setSelectedViewTeamId] = useState<string | null>(
    userTeamId,
  );

  // Explore state
  const [lastExploreTime, setLastExploreTime] = useState<number>(
    Number(localStorage.getItem("nba-gm-last-explore") || 0),
  );
  const [explorePool, setExplorePool] = useState<string[]>(
    JSON.parse(localStorage.getItem("nba-gm-explore-pool") || "[]"),
  );
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Playoff season transition effect
  useEffect(() => {
    if (currentWeek > REGULAR_SEASON_GAMES && !isPlayoffs && teams.length > 0) {
      const sorted = [...teams].sort((a,b) => {
        const winA = a.stats.wins / (a.stats.wins + a.stats.losses || 1);
        const winB = b.stats.wins / (b.stats.wins + b.stats.losses || 1);
        return winB - winA;
      });
      startPlayoffTournament(sorted);
    }
  }, [currentWeek, isPlayoffs, teams]);

  // Initialize data
  useEffect(() => {
    const savedTeams = localStorage.getItem("nba-gm-teams");
    const savedPlayers = localStorage.getItem("nba-gm-players");
    
    let currentTeams: Team[] = [];
    let currentPlayers: Player[] = [];

    if (savedTeams && savedPlayers) {
      currentTeams = JSON.parse(savedTeams);
      let loadedPlayers: Player[] = JSON.parse(savedPlayers);
      
      // Deduplicate logic: Fix cases where duplicate IDs might have entered the save
      const uniqueLoadedPlayers: Player[] = [];
      const seenIdsForDedupe = new Set();
      loadedPlayers.forEach(p => {
        if (!seenIdsForDedupe.has(p.id)) {
          // Anti-Fake Name: Rename existing "Reserve" players from old saves
          if (p.name.startsWith("Reserve ")) {
             const HISTORICAL_FOR_CLEANUP = ["Larry Bird", "Magic Johnson", "Kobe Bryant", "LeBron James", "Shaq", "MJ", "Tim Duncan", "Kevin Garnett", "Dirk", "AI"];
             const base = HISTORICAL_FOR_CLEANUP[Math.floor(Math.random() * HISTORICAL_FOR_CLEANUP.length)];
             p.name = `${base} (Legacy)`;
          }
          uniqueLoadedPlayers.push(p);
          seenIdsForDedupe.add(p.id);
        }
      });
      loadedPlayers = uniqueLoadedPlayers;

      // Feature: Merge new players & Re-sync avatarUrls/names from INITIAL_PLAYERS
      const initialMap = new Map(INITIAL_PLAYERS.map(p => [p.id, p]));
      
      currentPlayers = loadedPlayers.map(p => {
        const initial = initialMap.get(p.id);
        if (initial) {
          // 重新同步名稱與大頭照路徑，確保讀取到最新的 ID 映射結果
          return { 
            ...p, 
            name: initial.name, 
            avatarUrl: initial.avatarUrl
          };
        }
        return p;
      });

      const currentIds = new Set(currentPlayers.map(p => p.id));
      const missingPlayers = INITIAL_PLAYERS.filter(p => !currentIds.has(p.id));
      if (missingPlayers.length > 0) {
        currentPlayers = [...currentPlayers, ...missingPlayers.map(p => ({ ...p, teamId: 'FA' }))];
      }
      
      // Validation & Self-Healing: Check if any team has < 10 players (Updated for 10-star era)
      let playersModified = missingPlayers.length > 0;
      let teamsModified = false;

      currentTeams.forEach(team => {
        const teamPlayers = currentPlayers.filter(p => p.teamId === team.id);
        if (teamPlayers.length < 10) {
          const needed = 10 - teamPlayers.length;
          // Find FAs to fill the gap
          const faPool = currentPlayers.filter(p => p.teamId === 'FA');
          const fillers = faPool.sort(() => 0.5 - Math.random()).slice(0, needed);
          
          fillers.forEach(p => {
             const idx = currentPlayers.findIndex(cp => cp.id === cp.id && cp.id === p.id);
             if (idx !== -1) {
               const rating = 78 + Math.floor(Math.random() * 8); // 78-85 star rating
               currentPlayers[idx] = { ...currentPlayers[idx], teamId: team.id, rating, offense: rating + 1, defense: rating - 1 };
               playersModified = true;
             }
          });
          
          // Update team roster
          const updatedTeamPlayers = currentPlayers.filter(p => p.teamId === team.id).map(p => p.id);
          team.roster = updatedTeamPlayers;
          team.lineup = updatedTeamPlayers.slice(0, 5);
          teamsModified = true;
        }
      });

      setPlayers(currentPlayers);
      setTeams(currentTeams);
    } else {
      // New Game Initialization: Respect pre-defined team assignments from INITIAL_PLAYERS
      currentPlayers = [...INITIAL_PLAYERS];

      setPlayers(currentPlayers);

      currentTeams = NBA_TEAMS.map((team) => {
        const teamPlayerIds = currentPlayers
          .filter((p) => p.teamId === team.id)
          .map((p) => p.id);
        
        return {
          ...team,
          roster: teamPlayerIds,
          lineup: teamPlayerIds.slice(0, 5),
          budget: INITIAL_BUDGET,
          stats: { wins: 0, losses: 0 }
        };
      });
      setTeams(currentTeams);
    }

    const savedGames = localStorage.getItem("nba-gm-games");
    if (savedGames) setGames(JSON.parse(savedGames));

    // Initial news generation
    autoGenerateNews();

    // Timer for cooldown
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Save changes
  useEffect(() => {
    if (teams.length > 0)
      localStorage.setItem("nba-gm-teams", JSON.stringify(teams));
    if (games.length > 0)
      localStorage.setItem("nba-gm-games", JSON.stringify(games));
    if (players.length > 0)
      localStorage.setItem("nba-gm-players", JSON.stringify(players));
    if (userTeamId) localStorage.setItem("nba-gm-team", userTeamId);
    localStorage.setItem("nba-gm-last-explore", lastExploreTime.toString());
    localStorage.setItem("nba-gm-explore-pool", JSON.stringify(explorePool));
    
    // Playoff states
    localStorage.setItem("nba-gm-current-week", currentWeek.toString());
    localStorage.setItem("nba-gm-is-playoffs", isPlayoffs.toString());
    localStorage.setItem("nba-gm-po-bracket", JSON.stringify(playoffBracket));
    localStorage.setItem("nba-gm-po-round", playoffRound.toString());
    localStorage.setItem("nba-gm-po-active", JSON.stringify(activePlayoffGame));
    localStorage.setItem("nba-gm-po-q", playoffQuarter.toString());
    localStorage.setItem("nba-gm-po-scores", JSON.stringify(playoffGameScores));
    localStorage.setItem("nba-gm-po-status", playoffGameStatus);
    
    // Offseason states
    localStorage.setItem("nba-gm-po-elims", JSON.stringify(playoffEliminations));
    localStorage.setItem("nba-gm-reg-standings", JSON.stringify(regularSeasonStandings));
    localStorage.setItem("nba-gm-is-offseason", isOffseason.toString());
    if (offseasonUserRookie) localStorage.setItem("nba-gm-offseason-rookie", JSON.stringify(offseasonUserRookie));
    else localStorage.removeItem("nba-gm-offseason-rookie");
    localStorage.setItem("nba-gm-offseason-legends", JSON.stringify(offseasonLegendPool));
    
  }, [teams, games, players, userTeamId, lastExploreTime, explorePool, currentWeek, isPlayoffs, playoffBracket, playoffRound, activePlayoffGame, playoffQuarter, playoffGameScores, playoffGameStatus, playoffEliminations, regularSeasonStandings, isOffseason, offseasonUserRookie, offseasonLegendPool]);

  const userTeam = teams.find((t) => t.id === userTeamId);
  const userRoster = players.filter((p) => p.teamId === userTeamId);

  // Sanitize lineup to only include players currently on the team
  const sanitizedLineup = useMemo(() => {
    const currentLineup = userTeam?.lineup || [];
    const rosterIds = new Set(userRoster.map((p) => p.id));
    return currentLineup.filter((id) => rosterIds.has(id));
  }, [userTeam?.lineup, userRoster]);

  const userStarters = userRoster.filter((p) => sanitizedLineup.includes(p.id));
  const userReserves = userRoster
    .filter((p) => !sanitizedLineup.includes(p.id))
    .sort((a, b) => b.rating - a.rating); // Sort reserves by rating for better visibility

  // Calculate the most recent game for the user's team
  const lastUserGame = useMemo(() => {
    return games.find(
      (g) => g.homeTeamId === userTeamId || g.awayTeamId === userTeamId,
    );
  }, [games, userTeamId]);

  const lastGameOpponent = useMemo(() => {
    if (!lastUserGame) return null;
    const opponentId =
      lastUserGame.homeTeamId === userTeamId
        ? lastUserGame.awayTeamId
        : lastUserGame.homeTeamId;
    return teams.find((t) => t.id === opponentId);
  }, [lastUserGame, userTeamId, teams]);

  // Auto-sync lineup to ensure no ghost entries from old saves or trades
  useEffect(() => {
    if (!userTeamId || teams.length === 0 || players.length === 0) return;

    setTeams((prev) =>
      prev.map((t) => {
        const teamPlayers = players.filter((p) => p.teamId === t.id);
        const rosterIds = new Set(teamPlayers.map((p) => p.id));
        const currentLineup = t.lineup || [];
        const validLineup = currentLineup.filter((id) => rosterIds.has(id));

        if (validLineup.length !== currentLineup.length) {
          return { ...t, lineup: validLineup };
        }
        return t;
      }),
    );
  }, [userTeamId, players]);

  const standings = useMemo(() => {
    return [...teams].sort(
      (a, b) => b.stats.wins - a.stats.wins || a.stats.losses - b.stats.losses,
    );
  }, [teams]);

  // Market Filtering/Sorting Logic - Removed UI, keeping simplified for internal use if needed
  // (Market now only shows results from the Explore Pool which is already filtered/assigned)

  // Library Filtering Logic (Paginated and Sorted)
  const filteredLibraryPlayers = useMemo(() => {
    let list = players.filter(p => !p.id.startsWith('rp-'));
    
    // Search filter
    if (librarySearch) {
      const search = librarySearch.toLowerCase();
      list = list.filter(p => 
        p.name.toLowerCase().includes(search) || 
        p.position.toLowerCase().includes(search)
      );
    }

    // Position filter
    if (libraryPositionFilter !== "ALL") {
      list = list.filter(p => p.position === libraryPositionFilter);
    }

    // Sort
    list.sort((a, b) => {
      let valA = a[librarySort as keyof Player];
      let valB = b[librarySort as keyof Player];

      if (librarySort === "position") {
        const POS_ORDER = { 'PG': 1, 'SG': 2, 'SF': 3, 'PF': 4, 'C': 5 };
        const orderA = POS_ORDER[a.position] || 99;
        const orderB = POS_ORDER[b.position] || 99;
        return librarySortOrder === 'asc' ? orderA - orderB : orderB - orderA;
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        return librarySortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      
      const numA = (valA as number) || 0;
      const numB = (valB as number) || 0;
      return librarySortOrder === 'asc' ? numA - numB : numB - numA;
    });

    return list;
  }, [players, librarySearch, librarySort, librarySortOrder, libraryPositionFilter]);

  const libraryTotalPages = Math.ceil(filteredLibraryPlayers.length / ITEMS_PER_PAGE);
  const displayedLibraryPlayers = useMemo(() => {
    const start = libraryPage * ITEMS_PER_PAGE;
    return filteredLibraryPlayers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredLibraryPlayers, libraryPage]);

  const startOffseason = (finalElims?: Record<string, number>) => {
    // 1. Prepare Regular Season Budgets
    let updatedTeams = [...teams];
    let updatedPlayers = [...players];
    let userRookie: Player | null = null;
    
    // Reverse standings to give Rank 30 the most money (index 29 gives 30 * 5M = 150M)
    updatedTeams = updatedTeams.map(t => {
       const rankIndex = regularSeasonStandings.indexOf(t.id); // 0 (1st) to 29 (30th)
       const bonus = (rankIndex === -1 ? 31 : rankIndex + 1) * 5000000;
       return { ...t, budget: t.budget + bonus };
    });

    // 2. Identify bottom 10 teams from Regular Season
    const bottom10Ids = regularSeasonStandings.slice(-10);

    // 3. Create Draft Players
    bottom10Ids.forEach((tid, idx) => {
      const rating = Math.floor(Math.random() * 6) + 90; // 90-95 OVR
      const positions: Player["position"][] = ["PG", "SG", "SF", "PF", "C"];
      const pos = positions[Math.floor(Math.random() * positions.length)];
      
      const newPlayer: Player = {
        id: `draft-${Date.now()}-${idx}`,
        name: generateRandomName(),
        teamId: tid,
        position: pos,
        rating: rating,
        offense: rating + 2,
        defense: rating - 2,
        isSuperstar: true,
        price: CALCULATE_PLAYER_PRICE(rating), // Need a price for future trades
        stats: { ppg: 0, rpg: 0, apg: 0, spg: 0, bpg: 0 },
        stamina: 100,
        endurance: 0.8 + Math.random() * 0.4,
        color: GET_RATING_COLOR(rating),
        equipment: [],
      };

      if (tid === userTeamId) {
          // Keep for user to accept/decline in UI
          newPlayer.teamId = 'FA'; // Temporary holding state
          userRookie = newPlayer;
      } else {
          // Auto assign to AI
          updatedPlayers.push(newPlayer);
          const tIdx = updatedTeams.findIndex(t => t.id === tid);
          if (tIdx > -1) {
              const r = updatedPlayers.filter(p => p.teamId === tid);
              if (r.length >= 15) {
                 const lowest = r.sort((a,b) => a.rating - b.rating)[0];
                 updatedPlayers = updatedPlayers.map(p => p.id === lowest.id ? { ...p, teamId: 'FA' } : p);
              }
              updatedTeams[tIdx].roster = updatedPlayers.filter(p => p.teamId === tid).map(p => p.id);
          }
      }
    });

    // 4. Prepare Legends Pool
    const elims = finalElims || playoffEliminations;
    const userPlayoffRank = elims[userTeamId as string];
    let legendsToPick: Player[] = [];
    if (userPlayoffRank) {
       const legendsAmount = userPlayoffRank === 1 ? 8 : (userPlayoffRank === 2 ? 4 : 2);
       const availableLegends = players.filter(p => p.teamId === 'FA' && p.isLegend);
       const shuffledL = [...availableLegends].sort(() => 0.5 - Math.random());
       legendsToPick = shuffledL.slice(0, legendsAmount);
    }

    setTeams(updatedTeams);
    setPlayers(updatedPlayers);
    setOffseasonUserRookie(userRookie);
    setOffseasonLegendPool(legendsToPick);
    setOffseasonStep(0);
    setIsOffseason(true);
  };

  const startNextSeason = () => {
    // 1. Reset Stats & Playoff Status
    const resetTeams = teams.map((t) => ({
      ...t,
      stats: { wins: 0, losses: 0 },
    }));
    setIsPlayoffs(false);
    setPlayoffRound(0);
    setPlayoffBracket([]);
    setIsOffseason(false);
    setOffseasonUserRookie(null);
    setOffseasonLegendPool([]);

    // 2. Clear old state
    setTeams(resetTeams);
    setGames([]); // Reset schedule
    setCurrentWeek(1); // Back to week 1
    
    setNews(
      "🏀 休賽季結束！新賽季正式開打，所有戰績歸零！",
    );
  };


  const simulatePlayoffQuarter = async () => {
    if (!activePlayoffGame || isQuarterSimulating) return;
    setIsQuarterSimulating(true);

    // Apply AI substitution for computer-controlled teams
    let opponentUpdated = false;
    const aiTeamsToSub = [activePlayoffGame.home, activePlayoffGame.away].filter(t => t.id !== userTeamId);
    let mutableActiveGame = { ...activePlayoffGame, home: { ...activePlayoffGame.home }, away: { ...activePlayoffGame.away } };
    
    aiTeamsToSub.forEach(aiTeam => {
        const teamRoster = players.filter(p => p.teamId === aiTeam.id);
        let newLineup = [...(aiTeam.lineup || [])];
        const teamRosterIds = new Set(teamRoster.map(p => p.id));
        newLineup = newLineup.filter(id => teamRosterIds.has(id));

        const staminaThreshold = 80;
        const starters = teamRoster.filter(p => newLineup.includes(p.id));
        const reserves = teamRoster.filter(p => !newLineup.includes(p.id));

        starters.forEach(star => {
          if (star.stamina < staminaThreshold) {
            let bestReserve = reserves.filter(r => r.position === star.position).sort((a,b) => b.stamina - a.stamina)[0];
            if (!bestReserve) {
               bestReserve = reserves.sort((a,b) => b.stamina - a.stamina)[0];
            }
            if (bestReserve && bestReserve.stamina > star.stamina) {
               newLineup = newLineup.map(id => id === star.id ? bestReserve!.id : id);
               const resIdx = reserves.findIndex(r => r.id === bestReserve!.id);
               if(resIdx > -1) reserves.splice(resIdx, 1);
               reserves.push(star);
               opponentUpdated = true;
            }
          }
        });
        
        if (opponentUpdated) {
            if (activePlayoffGame.home.id === aiTeam.id) mutableActiveGame.home.lineup = newLineup;
            if (activePlayoffGame.away.id === aiTeam.id) mutableActiveGame.away.lineup = newLineup;
        }
    });

    if (opponentUpdated) {
      setActivePlayoffGame(mutableActiveGame);
    }
    
    // Calculate quarter performance based on OVR with more realistic scoring and lineup penalty
    const homePool = players.filter(p => mutableActiveGame.home.lineup?.includes(p.id));
    const awayPool = players.filter(p => mutableActiveGame.away.lineup?.includes(p.id));
    
    const homeOVR = calculateTeamOVR(homePool.length >= 5 ? homePool : players.filter(p => p.teamId === mutableActiveGame.home.id).slice(0,5));
    const awayOVR = calculateTeamOVR(awayPool.length >= 5 ? awayPool : players.filter(p => p.teamId === mutableActiveGame.away.id).slice(0,5));
    
    // Realistic points: OVR / 2 + random(0-6)
    const getQPoints = (ovr: any) => Math.floor(ovr.offense * 0.35) + Math.floor(Math.random() * 6);
    const hQ = getQPoints(homeOVR);
    const aQ = getQPoints(awayOVR);
    
    // Animation
    const startH = playoffGameScores.home;
    const startA = playoffGameScores.away;
    for (let i = 1; i <= 10; i++) {
       setPlayoffGameScores({
         home: startH + Math.round((hQ / 10) * i),
         away: startA + Math.round((aQ / 10) * i)
       });
       await new Promise(r => setTimeout(r, 50));
    }
    
    // Ensure accurate final score for the quarter added to previous total
    setPlayoffGameScores(prev => ({
        home: prev.home + hQ - Math.round((hQ / 10) * 10), // Adjust for rounding error if any
        away: prev.away + aQ - Math.round((aQ / 10) * 10)
    }));
    
    setPlayoffQuarter(prev => prev + 1);
    
    // 檢查是否結束：第四節後 若平分則繼續
    const isTied = (startH + hQ) === (startA + aQ);
    
    if (playoffQuarter >= 4 && !isTied) {
      setPlayoffGameStatus('finished');
      // Update bracket winner using the FINAL total score
      const finalHomeScore = startH + hQ;
      const finalAwayScore = startA + aQ;
      const mIdx = playoffBracket.findIndex(m => m.home.id === activePlayoffGame.home.id && m.away.id === activePlayoffGame.away.id);
      if (mIdx !== -1) {
         finalizePlayoffGame(mIdx, finalHomeScore > finalAwayScore, finalHomeScore, finalAwayScore);
      }
    } else {
      setPlayoffGameStatus('halftime');
      if (playoffQuarter >= 4 && isTied) {
          setNews(`⚡ 激戰平手！進入延長賽！`);
      }
    }

    // Stamina decay
    setPlayers(prev => prev.map(p => {
      const isHome = p.teamId === activePlayoffGame.home.id;
      const isAway = p.teamId === activePlayoffGame.away.id;
      if (!isHome && !isAway) return p;
      
      const team = isHome ? activePlayoffGame.home : activePlayoffGame.away;
      let lineup = team.lineup || [];
      const isStarter = lineup?.includes(p.id);
      
      // Calculate decay
      const decay = (isStarter ? 6 : 3) * (p.endurance || 1);
      let newStamina = Math.max(0, p.stamina - decay);
      
      return { ...p, stamina: newStamina };
    }));

    setIsQuarterSimulating(false);
  };

  const simulateWeek = async () => {
    if (isSimulating || isPlayoffs) return;

    // Check if ALL teams have at least 8 players in their roster
    const underweightTeams = teams.filter(t => players.filter(p => p.teamId === t.id).length < 8);
    if (underweightTeams.length > 0) {
      setNews("🚨 無法開賽：聯盟中有 " + underweightTeams.length + " 支球隊球員數不足 8 人 (" + underweightTeams.map(t => t.name).join(", ") + ")。");
      return;
    }

    // Check if ALL teams have at least 5 starters defined in lineup
    const invalidLineupTeams = teams.filter(t => (t.lineup?.length || 0) < 5);
    if (invalidLineupTeams.length > 0) {
        setNews("🚨 無法開賽：以下球隊先發陣容未滿 5 人: " + invalidLineupTeams.map(t => t.name).join(", "));
        return;
    }

    if (userStarters.length < 5) {
      setNews("🚨 無法開賽：請先進入「球員名單」手動勾選 5 位先發球員！");
      setActiveTab("roster");
      return;
    }

    setIsSimulating(true);
    setNews("各球場開賽中，正在即時模擬本週戰報...");

    try {
      // Pick pairs of teams to play - Shuffle teams to ensure variety in matchups
      const finalResults: GameResult[] = [];
      const shuffledTeamsForMatchup = [...teams].sort(() => 0.5 - Math.random());
      
      // 31st Team logic: If odd, one team gets a 'Bye' (simulated as easy win or just skipped)
      // For simplicity, we'll let the last team play a "Ghost Team" or just skip them.
      // But for record consistency, let's just pair as many as possible. 
      // If 31 teams, 15 games will happen. The 31st team gets a small rest bonus.
      
      const allPlayerUpdates: { id: string, staminaChange: number }[] = [];
      const gamePairs: { home: Team; away: Team; result: GameResult }[] = [];

      // Handle odd team count (e.g., 31 teams)
      if (shuffledTeamsForMatchup.length % 2 !== 0) {
        // The last team gets a "Rest Week" (Wins 10M but no game recorded)
        const restTeam = shuffledTeamsForMatchup.pop()!;
        setTeams(prev => prev.map(t => t.id === restTeam.id ? { ...t, budget: t.budget + 10000000 } : t));
        // No result added to gamePairs
      }

      // 1. Pre-calculate all final results
      for (let i = 0; i < shuffledTeamsForMatchup.length; i += 2) {
        if (i + 1 >= shuffledTeamsForMatchup.length) break;
        const home = shuffledTeamsForMatchup[i];
        const away = shuffledTeamsForMatchup[i + 1];
        
        const homeRoster = players.filter(p => p.teamId === home.id);
        const awayRoster = players.filter(p => p.teamId === away.id);

        const result = simulateGame(home, homeRoster, away, awayRoster, true);
        if (result.playerUpdates) {
          allPlayerUpdates.push(...result.playerUpdates);
        }
        gamePairs.push({ home, away, result });
      }

      // Sort gamePairs: User team always at index 0 (top/first)
      gamePairs.sort((a, b) => {
        const aIsUser = a.home.id === userTeamId || a.away.id === userTeamId;
        const bIsUser = b.home.id === userTeamId || b.away.id === userTeamId;
        if (aIsUser && !bIsUser) return -1;
        if (!aIsUser && bIsUser) return 1;
        return 0;
      });

      // 2. Animate the scores (Pulse by Pulse)
      const totalTicks = 20;
      for (let t = 1; t <= totalTicks; t++) {
        const currentActive: GameResult[] = gamePairs.map((p) => ({
          ...p.result,
          homeScore: Math.floor((p.result.homeScore / totalTicks) * t),
          awayScore: Math.floor((p.result.awayScore / totalTicks) * t),
        }));
        setActiveGames(currentActive);
        // Varying speed for a more "authentic" feel
        const delay = 100 + (t > 15 ? 100 : 0);
        await new Promise((r) => setTimeout(r, delay));
      }

      setNews("比賽結束！正在統整各隊數據並撰寫本週戰報...");

      // 3. Finalize
      setTeams((prevTeams) => {
        const nextTeams = [...prevTeams];
        gamePairs.forEach(({ result }) => {
          finalResults.push(result);
          const homeIdx = nextTeams.findIndex(
            (t) => t.id === result.homeTeamId,
          );
          const awayIdx = nextTeams.findIndex(
            (t) => t.id === result.awayTeamId,
          );

          if (homeIdx === -1 || awayIdx === -1) return;

          if (result.homeScore > result.awayScore) {
            nextTeams[homeIdx] = {
              ...nextTeams[homeIdx],
              stats: {
                ...nextTeams[homeIdx].stats,
                wins: nextTeams[homeIdx].stats.wins + 1,
              },
              budget: nextTeams[homeIdx].budget + WIN_BONUS,
            };
            nextTeams[awayIdx] = {
              ...nextTeams[awayIdx],
              stats: {
                ...nextTeams[awayIdx].stats,
                losses: nextTeams[awayIdx].stats.losses + 1,
              },
              budget: nextTeams[awayIdx].budget + LOSS_BONUS,
            };
          } else {
            nextTeams[homeIdx] = {
              ...nextTeams[homeIdx],
              stats: {
                ...nextTeams[homeIdx].stats,
                losses: nextTeams[homeIdx].stats.losses + 1,
              },
              budget: nextTeams[homeIdx].budget + LOSS_BONUS,
            };
            nextTeams[awayIdx] = {
              ...nextTeams[awayIdx],
              stats: {
                ...nextTeams[awayIdx].stats,
                wins: nextTeams[awayIdx].stats.wins + 1,
              },
              budget: nextTeams[awayIdx].budget + WIN_BONUS,
            };
          }
        });
        return nextTeams;
      });

      setGames((prev) => [...finalResults, ...prev].slice(0, 50));

      // 4. Apply stamina updates and AI Team Management
      setPlayers((prevPlayers) => {
        const updateMap = new Map(allPlayerUpdates.map(u => [u.id, u.staminaChange]));
        let newPlayers = prevPlayers.map(p => {
          const change = updateMap.get(p.id) || 0;
          const recovery = 20; 
          const playedGame = allPlayerUpdates.some(u => u.id === p.id);
          const finalRecovery = playedGame ? recovery : recovery + 10;

          return {
            ...p,
            stamina: Math.min(100, Math.max(0, p.stamina + change + finalRecovery))
          };
        });

        // AI AI Team Logic: Self-Sign if weak (< 85 team avg) and have budget
        setTeams(currentTeams => {
          return currentTeams.map(t => {
            if (t.id === userTeamId) return t;
            
            let updatedTeam = { ...t };
            const teamRoster = newPlayers.filter(p => p.teamId === t.id);
            const teamAvg = teamRoster.reduce((sum, p) => sum + p.rating, 0) / (teamRoster.length || 1);

            // AI Rotation: Optimized Swap with Position Balance (1C, 2F, 2G)
            let newLineup = [...(t.lineup || [])];
            const teamRosterIds = new Set(teamRoster.map(p => p.id));
            newLineup = newLineup.filter(id => teamRosterIds.has(id));

            const staminaThreshold = isPlayoffs ? 80 : 70; // 80% playoff, 70% reg
            const starters = teamRoster.filter(p => newLineup.includes(p.id));
            const reserves = teamRoster.filter(p => !newLineup.includes(p.id));
            
            // 處理換人邏輯
            starters.forEach(star => {
              if (star.stamina < staminaThreshold) {
                let bestReserve = reserves.filter(r => r.position === star.position).sort((a,b) => b.stamina - a.stamina)[0];
                if (!bestReserve) {
                   bestReserve = reserves.sort((a,b) => b.stamina - a.stamina)[0];
                }

                if (bestReserve && bestReserve.stamina > star.stamina) {
                   newLineup = newLineup.map(id => id === star.id ? bestReserve!.id : id);
                   // 重新整理現有板凳清單
                   const resIdx = reserves.findIndex(r => r.id === bestReserve!.id);
                   if(resIdx > -1) reserves.splice(resIdx, 1);
                   reserves.push(star);
                }
              }
            });

            // Ensure lineup is valid: Optimization towards 1C, 2F, 2G
            const optimizeLineup = (currentIds: string[]) => {
               const rosterPlayers = teamRoster.filter(p => currentIds.includes(p.id));
               let c = rosterPlayers.filter(p => p.position === 'C');
               let f = rosterPlayers.filter(p => p.position === 'SF' || p.position === 'PF');
               let g = rosterPlayers.filter(p => p.position === 'PG' || p.position === 'SG');

               // 若位置不足，嘗試從板凳補強該位置
               const fillVoid = (category: Player[], targetCount: number, available: Player[]) => {
                   if (category.length < targetCount && available.length > 0) {
                      const needed = targetCount - category.length;
                      const bestAvailable = [...available].sort((a,b) => b.rating - a.rating).slice(0, needed);
                      return [...category, ...bestAvailable];
                   }
                   return category;
               };

               const targetC = fillVoid(c, 1, teamRoster.filter(p => p.position === 'C' && !currentIds.includes(p.id)));
               const targetF = fillVoid(f, 2, teamRoster.filter(p => (p.position === 'SF' || p.position === 'PF') && !currentIds.includes(p.id)));
               const targetG = fillVoid(g, 2, teamRoster.filter(p => (p.position === 'PG' || p.position === 'SG') && !currentIds.includes(p.id)));

               return [...targetC, ...targetF, ...targetG].slice(0, 5).map(p => p.id);
            };

            updatedTeam.lineup = optimizeLineup(newLineup);

            // AI Roster Management: Release players to gain budget if roster > 12
            let currentRoster = newPlayers.filter(p => p.teamId === t.id);
            if (currentRoster.length > 12) {
               const nonStarters = currentRoster.filter(p => !updatedTeam.lineup?.includes(p.id));
               const toRelease = [...nonStarters].sort((a,b) => a.rating - b.rating); // Release weakest reserves first
               let releaseCount = currentRoster.length - 12;
               
               for (let i = 0; i < Math.min(releaseCount, toRelease.length); i++) {
                   const pTarget = toRelease[i];
                   const refund = Math.floor(pTarget.price * 0.5); // Fixed refund value
                   updatedTeam.budget += refund;
                   updatedTeam.roster = updatedTeam.roster.filter(id => id !== pTarget.id);
                   newPlayers = newPlayers.map(p => p.id === pTarget.id ? { ...p, teamId: 'FA' } : p);
               }
               currentRoster = newPlayers.filter(p => p.teamId === t.id); // Update roster after release
            }

            // AI Trading Market: Sign free agents to strengthen team if budget allows
            const affordableFA = newPlayers.filter(p => p.teamId === 'FA' && !p.isLegend && p.price <= updatedTeam.budget);
            if (affordableFA.length > 0 && currentRoster.length < 15) {
               const bestFA = [...affordableFA].sort((a,b) => b.rating - a.rating)[0];
               const worstPlayer = [...currentRoster].sort((a,b) => a.rating - b.rating)[0];
               
               // Buy if FA is a noticeable upgrade straight away, or if team is desperate for players (< 12)
               if ((worstPlayer && bestFA.rating > worstPlayer.rating + 2) || currentRoster.length < 12) {
                   updatedTeam.budget -= bestFA.price;
                   updatedTeam.roster = [...(updatedTeam.roster || []), bestFA.id];
                   newPlayers = newPlayers.map(p => p.id === bestFA.id ? { ...p, teamId: t.id } : p);
               }
            }
            return updatedTeam;
          });
        });

        return newPlayers;
      });

      setActiveGames(null);
      setIsSimulating(false);
      const nextWeek = currentWeek + 1;
      setCurrentWeek(nextWeek);
      // Removed startPlayoffTournament from here to avoid async state issues
      // It will be handled by useEffect instead

      // Automatic News Generation
      autoGenerateNews();
    } catch (error) {
      console.error("Simulation error:", error);
      setIsSimulating(false);
    }
  };

  const resetGame = () => {
    localStorage.removeItem("nba-gm-teams");
    localStorage.removeItem("nba-gm-games");
    localStorage.removeItem("nba-gm-team");
    localStorage.removeItem("nba-gm-players");
    localStorage.removeItem("nba-gm-last-explore");
    localStorage.removeItem("nba-gm-explore-pool");
    localStorage.removeItem("nba-gm-current-week");
    // Clear playoff-related storage
    localStorage.removeItem("nba-gm-is-playoffs");
    localStorage.removeItem("nba-gm-po-bracket");
    localStorage.removeItem("nba-gm-po-round");
    localStorage.removeItem("nba-gm-po-active");
    localStorage.removeItem("nba-gm-po-q");
    localStorage.removeItem("nba-gm-po-scores");
    localStorage.removeItem("nba-gm-po-status");
    window.location.reload();
  };

  const handleExplore = () => {
    if (currentTime - lastExploreTime < EXPLORE_COOLDOWN_MS) return;

    // Pick 3 random free agent players (not in any team, and not Legend)
    // 確保包含黃卡 (95+)，原本邏輯其實已經包含，只要不是 isLegend 即可
    const faPlayers = players.filter((p) => p.teamId === "FA" && !p.isLegend);
    const shuffled = [...faPlayers].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3).map((p) => p.id);

    setExplorePool(selected);
    setLastExploreTime(Date.now());
  };

  const toggleStarter = (playerId: string) => {
    if (!userTeam) return;
    const isStarter = sanitizedLineup.includes(playerId);

    setTeams((prev) =>
      prev.map((t) => {
        if (t.id === userTeamId) {
          // Use sanitized lineup for logic to prevent ghost entries
          const rosterIds = new Set(
            players.filter((p) => p.teamId === userTeamId).map((p) => p.id),
          );
          const currentLineup = (t.lineup || []).filter((id) =>
            rosterIds.has(id),
          );

          if (isStarter) {
            return {
              ...t,
              lineup: currentLineup.filter((id) => id !== playerId),
            };
          } else {
            if (currentLineup.length >= 5) {
              setNews("⚠️ 先發名單最多只能有 5 人！請先將其他球員移至候補。");
              return t;
            }
            return { ...t, lineup: [...currentLineup, playerId] };
          }
        }
        return t;
      }),
    );
  };

  const buyPlayer = (playerId: string) => {
    const player = players.find((p) => p.id === playerId);
    if (!player || !userTeam) return;

    if (userRoster.length >= MAX_ROSTER_SIZE) {
      setNews(`⚠️ 球隊人數已達上限 (${MAX_ROSTER_SIZE}人)！請先釋出球員。`);
      return;
    }

    if (userTeam.budget < player.price) {
      setNews("⚠️ 經費不足！請繼續模擬賽季賺取獎金。");
      return;
    }

    const currentTeamId = player.teamId;

    // Deduct budget, update rosters
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id === userTeamId) {
          const teamRoster = t.roster || [];
          const rosterIds = new Set(
            players.filter((p) => p.teamId === userTeamId).map((p) => p.id),
          );
          const currentLineup = (t.lineup || []).filter((id) =>
            rosterIds.has(id),
          );

          const newRoster = [...teamRoster, playerId];
          const newLineup =
            currentLineup.length < 5
              ? [...currentLineup, playerId]
              : currentLineup;
          return {
            ...t,
            budget: t.budget - player.price,
            roster: newRoster,
            lineup: newLineup,
          };
        }
        if (t.id === currentTeamId) {
          return {
            ...t,
            budget: t.budget + player.price, // Selling team gets money
            roster: t.roster.filter((id) => id !== playerId),
            lineup: (t.lineup || []).filter((id) => id !== playerId),
          };
        }
        return t;
      }),
    );

    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === playerId) {
          return { ...p, teamId: userTeamId! };
        }
        return p;
      }),
    );

    // Remove from pool
    setExplorePool((prev) => prev.filter((id) => id !== playerId));
    setNews(`交易成功！${player.name} 正式加盟 ${userTeam.name}！`);

    // 如果在創隊補強階段，檢查是否補齊 10 人
    if (isTradePhase) {
      const teamPlayers = players.filter(p => p.teamId === userTeamId);
      const currentRosterCount = teamPlayers.length + 1; // +1 because state hasn't updated yet in this render but we know it will
      
      // 創隊補強邏輯：如果預算不足且人數不足 10，自動補強 80-85 分球員
      const remainingSlots = 10 - currentRosterCount;
      const budgetAfterThis = userTeam.budget - player.price;
      
      if (budgetAfterThis < 10000000 && remainingSlots > 0) {
        // 預算不足 (少於 10M)，自動補強
        const faCandidates = players.filter(p => p.teamId === 'FA' && p.rating >= 80 && p.rating <= 85);
        const shuffled = [...faCandidates].sort(() => 0.5 - Math.random());
        const toAdd = shuffled.slice(0, remainingSlots);
        
        setPlayers(prev => prev.map(p => {
          const found = toAdd.find(a => a.id === p.id);
          if (found) return { ...p, teamId: userTeamId! };
          return p;
        }));
        
        setTeams(prev => prev.map(t => {
          if (t.id === userTeamId) {
            return {
              ...t,
              roster: [...t.roster, ...toAdd.map(a => a.id)],
              budget: 0, // 耗盡預算
            };
          }
          return t;
        }));

        setIsTradePhase(false);
        setNews(`經費已耗盡！系統自動補強 ${toAdd.length} 名 80-85 分球員。${userTeam.name} 訓練營正式展開！`);
      } else if (currentRosterCount >= 10) {
        setIsTradePhase(false);
        setNews(`隊伍編制完成！${userTeam.name} 已經準備好挑戰聯盟！`);
      }
    }
  };

  const releasePlayer = (playerId: string) => {
    const player = players.find((p) => p.id === playerId);
    if (!player || !userTeam) {
      setReleaseConfirmId(null);
      return;
    }

    if (userRoster.length <= MIN_ROSTER_SIZE) {
      setNews(`⚠️ 球隊人數不能少於 ${MIN_ROSTER_SIZE} 人！`);
      setReleaseConfirmId(null);
      return;
    }

    const refund = Math.floor(player.price * 0.5);

    // Calculate new market price for FA
    let newMarketPrice = player.price;
    if (player.rating >= 95) {
      newMarketPrice = Math.floor(player.price * 1.5);
    } else if (player.rating >= 85) {
      newMarketPrice = Math.floor(player.price * 1.2);
    }

    setTeams((prev) =>
      prev.map((t) => {
        if (t.id === userTeamId) {
          return {
            ...t,
            budget: t.budget + refund,
            roster: t.roster.filter((id) => id !== playerId),
            lineup: (t.lineup || []).filter((id) => id !== playerId),
          };
        }
        return t;
      }),
    );

    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === playerId) {
          return { ...p, teamId: "FA", price: newMarketPrice };
        }
        return p;
      }),
    );

    const tierMsg =
      player.rating >= 95
        ? "，且其身價因史詩級身分大幅上漲 1.5 倍"
        : player.rating >= 85
          ? "，且其身價因全明星身分上漲 1.2 倍"
          : "";
    setNews(`${player.name} 已被釋出成為自由球員${tierMsg}。`);
    setReleaseConfirmId(null);
  };

  const buyEquipment = (playerId: string, item: Equipment) => {
    const player = players.find((p) => p.id === playerId);
    if (!player || !userTeam) return;

    if (userTeam.budget < item.price) {
      setNews("⚠️ 預算不足！");
      return;
    }

    setTeams((prev) =>
      prev.map((t) => {
        if (t.id === userTeamId) {
          return { ...t, budget: t.budget - item.price };
        }
        return t;
      }),
    );

    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === playerId) {
          const currentGear = p.equipment || [];
          const filteredGear = currentGear.filter((g) => g.type !== item.type);
          const newEquipment = [...filteredGear, item];

          return {
            ...p,
            equipment: newEquipment,
          };
        }
        return p;
      }),
    );

    setNews(
      `成功為 ${player.name} 更換裝備：${item.name}！原本同類型裝備已移除。`,
    );
  };

  const timeToNextExplore = Math.max(
    0,
    EXPLORE_COOLDOWN_MS - (currentTime - lastExploreTime),
  );
  const formatTime = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return `${Math.floor(mins / 60)}小時 ${mins % 60}分 ${secs}秒`;
  };

  if (isOffseason) {
    const userRankIndex = regularSeasonStandings.indexOf(userTeamId);
    const userBonus = (userRankIndex + 1) * 5000000;
    
    return (
      <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-50 overflow-y-auto p-4 flex flex-col items-center py-12">
        <div className="max-w-5xl w-full bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl p-8 mb-8">
           <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2 text-center">新賽季準備階段</h2>
           <p className="text-slate-400 text-center mb-8 font-bold">檢視你的例行賽獎勵與休賽季補強機會</p>

           {offseasonStep === 0 && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="bg-slate-700/50 p-6 rounded-2xl text-center border border-slate-600">
                   <h3 className="text-2xl font-bold text-white mb-2">例行賽結算獎金</h3>
                   <p className="text-slate-300">您在例行賽名列第 <span className="text-blue-400 font-bold">{userRankIndex === -1 ? 31 : userRankIndex + 1}</span> 名</p>
                   <p className="text-3xl font-black text-emerald-400 mt-4">+${userBonus.toLocaleString()}</p>
                </div>

                {offseasonUserRookie && (
                   <div className="bg-slate-700/50 p-6 rounded-2xl border border-yellow-500/30">
                      <h3 className="text-2xl font-bold text-yellow-400 mb-2 flex items-center justify-center gap-2">
                        <Sparkles /> 超級新星加盟機會！
                      </h3>
                      <p className="text-slate-300 text-center mb-6">因為名列例行賽後段班，球團獲得了一名潛力新秀，是否要將他納入麾下？</p>
                      
                      <div className="flex justify-center mb-6">
                        <div className="w-64">
                          <PlayerCard player={offseasonUserRookie} />
                        </div>
                      </div>

                      {userRoster.length >= 15 ? (
                         <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-center">
                            <p className="text-red-400 font-bold mb-4">⚠️ 球隊人數已達 15 人上限！必須返回釋出球員才能招募新星。</p>
                            <div className="text-left text-sm space-y-2 mt-4 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
                               <p className="text-slate-400 text-center mb-2">當前陣容 (點擊釋出)</p>
                               {userRoster.map(p => (
                                 <div key={p.id} className="flex justify-between items-center bg-slate-800 p-2 rounded border border-slate-700">
                                    <span className="text-white font-bold">{p.name} <span className="text-slate-500">[{p.position}] {p.rating}</span></span>
                                    <button onClick={() => releasePlayer(p.id)} className="px-3 py-1 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white rounded text-xs font-bold transition-colors">釋出</button>
                                 </div>
                               ))}
                            </div>
                         </div>
                      ) : (
                         <div className="flex justify-center gap-4">
                            <button onClick={() => {
                               setPlayers(prev => prev.map(p => p.id === offseasonUserRookie.id ? { ...p, teamId: userTeamId } : p));
                               setTeams(prev => prev.map(t => t.id === userTeamId ? { ...t, roster: [...t.roster, offseasonUserRookie.id] } : t));
                               setOffseasonUserRookie(null);
                            }} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl uppercase tracking-wider transition-colors">
                               招募新星
                            </button>
                         </div>
                      )}
                      
                      <div className="flex justify-center mt-4">
                         <button onClick={() => setOffseasonUserRookie(null)} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold rounded-xl transition-colors text-sm">
                            放棄招募
                         </button>
                      </div>
                   </div>
                )}

                {!offseasonUserRookie && (
                   <div className="flex justify-center mt-8">
                     <button onClick={() => setOffseasonStep(1)} className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white text-xl font-black rounded-xl uppercase tracking-wider transition-colors flex items-center gap-2 shadow-lg hover:shadow-blue-500/25">
                       前往下一步 <ChevronRight />
                     </button>
                   </div>
                )}
             </motion.div>
           )}

           {offseasonStep === 1 && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                {offseasonLegendPool.length > 0 ? (
                   <div>
                      <div className="text-center mb-8">
                        <h3 className="text-3xl font-black text-amber-400 mb-2 flex items-center justify-center gap-2 uppercase italic tracking-tighter">
                          <Crown size={28} /> 季後賽殊榮：傳奇招募
                        </h3>
                        <p className="text-slate-300">因為您達成了季後賽前八名的成就，傳奇球星願意與您簽約！<br/>(你只能選擇 <span className="font-bold text-white">1</span> 名，若經費不足或不需要可跳過)</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                         {offseasonLegendPool.map(p => (
                            <div key={p.id} className="space-y-4">
                               <PlayerCard player={p} />
                               <div className="text-center">
                                 <button onClick={() => {
                                    if (userTeam!.budget < p.price) {
                                      setNews(`⚠️ 經費不足！需要 $${p.price.toLocaleString()}！`);
                                      return;
                                    }
                                    if (userRoster.length >= 15) {
                                      setNews(`⚠️ 球隊人數已達 15 人上限！請先釋出球員。`);
                                      return;
                                    }
                                    // Process Purchase
                                    setTeams((prev) => prev.map((t) => t.id === userTeamId ? { ...t, budget: t.budget - p.price, roster: [...t.roster, p.id] } : t));
                                    setPlayers((prev) => prev.map((playerObj) => playerObj.id === p.id ? { ...playerObj, teamId: userTeamId } : playerObj));
                                    setOffseasonLegendPool([]); // Clears pool forcing them to next page
                                 }} className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-amber-950 font-black rounded-xl uppercase tracking-wider shadow-lg">
                                    花費 ${p.price.toLocaleString()} 購買
                                 </button>
                               </div>
                            </div>
                         ))}
                      </div>
                      
                      {userRoster.length >= 15 && (
                         <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-8 max-w-2xl mx-auto">
                            <p className="text-red-400 font-bold mb-4 text-center">⚠️ 陣容已滿 15 人，若要購買請先釋出：</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[30vh] overflow-y-auto px-2 custom-scrollbar">
                               {userRoster.map(p => (
                                 <div key={p.id} className="flex justify-between items-center bg-slate-900 p-2 rounded border border-slate-700">
                                    <span className="text-white text-sm font-bold truncate pr-2">{p.name}</span>
                                    <button onClick={() => releasePlayer(p.id)} className="px-3 py-1 bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white rounded text-xs font-bold transition-colors whitespace-nowrap">釋出</button>
                                 </div>
                               ))}
                            </div>
                         </div>
                      )}
                   </div>
                ) : (
                   <div className="text-center py-12">
                     <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle size={40} className="text-slate-500" />
                     </div>
                     <h3 className="text-2xl font-bold text-slate-300 mb-2">未達成傳奇招募條件</h3>
                     <p className="text-slate-500">很遺憾，本賽季您未能在季後賽取得前八名成績，沒有傳奇球星願意加盟。</p>
                   </div>
                )}

                <div className="flex justify-center pt-8 border-t border-slate-700">
                   <button onClick={() => startNextSeason()} className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white text-xl font-black rounded-xl uppercase tracking-wider transition-colors flex items-center gap-2">
                     {offseasonLegendPool.length > 0 ? "跳過購買並迎接新賽季" : "迎接新賽季"} <ChevronRight />
                   </button>
                </div>
             </motion.div>
           )}
        </div>
      </div>
    );
  }

  if (!userTeamId) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 to-slate-950">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl w-full bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-8 shadow-2xl"
        >
          <div className="text-center mb-10">
            <h1 className="text-6xl font-black text-white mb-4 tracking-tighter italic uppercase text-balance leading-none">
              <span className="text-blue-500">2026</span>
              <br />
              NBA SIM
            </h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest">
              選擇你的主隊，開啟傳奇經理之路
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
            {/* 新增自創隊伍按鈕 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCustomTeamModal(true)}
              className="group relative p-6 bg-blue-600/20 hover:bg-blue-600/30 rounded-2xl border-2 border-dashed border-blue-500/50 transition-all text-center flex flex-col items-center justify-center gap-2"
            >
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg">
                <Plus size={32} />
              </div>
              <div className="text-white font-black italic uppercase tracking-tighter">創建自訂隊伍</div>
              <div className="text-blue-400 text-xs font-bold">成為聯盟第 31 支球隊</div>
            </motion.button>

            {NBA_TEAMS.map((team) => (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                key={team.id}
                onClick={() => setUserTeamId(team.id)}
                className="group relative p-6 bg-slate-700/50 hover:bg-slate-600/50 rounded-2xl border border-slate-600 transition-all text-center"
              >
                <img
                  src={team.logo}
                  alt={team.name}
                  className="w-16 h-16 mx-auto mb-4 drop-shadow-lg group-hover:scale-110 transition-transform"
                  referrerPolicy="no-referrer"
                />
                <div className="text-white font-bold">{team.city}</div>
                <div className="text-slate-400 text-sm">{team.name}</div>
                <div
                  className="absolute bottom-0 left-0 w-full h-1 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: team.color }}
                />
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* 自創隊伍 Modal (放在這裡確保在選隊畫面也能顯示) */}
        <AnimatePresence>
          {showCustomTeamModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-slate-800 border border-slate-700 rounded-3xl p-8 max-w-md w-full shadow-2xl"
              >
                <h2 className="text-3xl font-black text-white italic uppercase mb-6 tracking-tighter">創建您的夢幻隊伍</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase mb-1">所在城市 / 區域</label>
                    <input
                      type="text"
                      value={customTeamData.city}
                      onChange={(e) => setCustomTeamData({ ...customTeamData, city: e.target.value })}
                      placeholder="例如: 台北, 洛杉磯..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase mb-1">隊伍名稱</label>
                    <input
                      type="text"
                      value={customTeamData.name}
                      onChange={(e) => setCustomTeamData({ ...customTeamData, name: e.target.value })}
                      placeholder="例如: 噴火龍, 戰神..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase mb-1">隊徽 URL (選填)</label>
                    <input
                      type="text"
                      value={customTeamData.logo}
                      onChange={(e) => setCustomTeamData({ ...customTeamData, logo: e.target.value })}
                      placeholder="輸入圖片網址..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <p className="text-[10px] text-slate-500 mt-1 italic">若留空則使用預設隊徽</p>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => setShowCustomTeamModal(false)}
                    className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-colors"
                  >
                    取消
                  </button>
                  <button
                    disabled={!customTeamData.city || !customTeamData.name}
                    onClick={() => {
                      const newTeamId = `custom-${Date.now()}`;
                      const newTeam: Team = {
                        id: newTeamId,
                        name: customTeamData.name,
                        city: customTeamData.city,
                        abbreviation: (customTeamData.name.length >= 3 ? customTeamData.name.substring(0, 3) : customTeamData.name.padEnd(3, 'X')).toUpperCase(),
                        logo: customTeamData.logo || "/image/team/NewTeam.png",
                        color: "#3B82F6",
                        roster: [],
                        lineup: [],
                        budget: 1000000000, // 1000M
                        stats: { wins: 0, losses: 0 },
                        isCustom: true,
                      };

                      const skyPlayer = players.find(p => p.name.includes("sky 哥哥"));
                      let updatedPlayers = [...players];
                      if (skyPlayer) {
                        updatedPlayers = updatedPlayers.map(p => p.id === skyPlayer.id ? { ...p, teamId: newTeamId } : p);
                        newTeam.roster = [skyPlayer.id];
                        newTeam.lineup = [skyPlayer.id];
                      }

                      setTeams([...teams, newTeam]);
                      setPlayers(updatedPlayers);
                      setUserTeamId(newTeamId);
                      setShowCustomTeamModal(false);
                      setIsTradePhase(true);
                      setActiveTab("market");
                      setNews("歡迎來到聯盟！您已獲得起始經費 1000M 及傳奇球員 Sky 哥哥。請至少補齊 10 名球員以開始賽季。");
                    }}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-xl transition-colors"
                  >
                    創建隊伍
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const renderSidebar = () => (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl overflow-y-auto`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-14 relative rounded-md overflow-hidden flex shadow-xl border border-white/10">
              <div className="w-1/2 h-full bg-[#1D428A]" />
              <div className="w-1/2 h-full bg-[#C8102E]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-[#EF6C00] rounded-full flex items-center justify-center shadow-inner border border-black/20">
                  <Basketball
                    size={20}
                    className="text-black/80 rotate-12"
                    strokeWidth={1.5}
                  />
                </div>
              </div>
            </div>
            <span className="font-black italic text-2xl tracking-tighter leading-tight">
              2026
              <br />
              <span className="text-blue-500">NBA SIM</span>
            </span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-2 text-slate-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="space-y-1">
          {[
            { id: "dashboard", icon: BarChart3, label: "概覽" },
            { id: "roster", icon: Users, label: "球員名單" },
            { id: "market", icon: ShoppingCart, label: "交易市場" },
            { id: "library", icon: BarChart3, label: "球員百科" },
            { id: "league", icon: Trophy, label: "聯盟排名" },
            { id: "team_rosters", icon: Shield, label: "球隊陣容總覽" },
            { id: "stats", icon: Calendar, label: "歷史賽績" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {(() => {
                const Icon = item.icon;
                return <Icon size={18} />;
              })()}
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 space-y-4">
        <div className="p-4 bg-blue-600/10 rounded-2xl border border-blue-600/20">
          <div className="text-[10px] text-blue-400 mb-1 font-black uppercase tracking-widest flex items-center gap-2">
            <DollarSign size={10} /> 球隊總經費
          </div>
          <div className="text-xl font-black text-white italic tracking-tighter">
            ${((userTeam?.budget || 0) / 1000000).toFixed(1)}M
          </div>
        </div>

        <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
          <div className="text-xs text-slate-500 mb-1 font-bold uppercase flex justify-between">
            <span>球圈人數</span>
            <span>
              {userRoster.length} / {MAX_ROSTER_SIZE}
            </span>
          </div>
          <div className="w-full bg-slate-700 h-1 rounded-full overflow-hidden mt-1">
            <div
              className={`h-full transition-all ${userRoster.length >= MAX_ROSTER_SIZE ? "bg-red-500" : "bg-blue-500"}`}
              style={{
                width: `${(userRoster.length / MAX_ROSTER_SIZE) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
          <div className="text-xs text-slate-500 mb-1 font-bold uppercase">
            當前執教
          </div>
          <div className="flex items-center gap-3">
            <img
              src={userTeam?.logo}
              className="w-8 h-8"
              alt="Logo"
              referrerPolicy="no-referrer"
            />
            <div className="font-bold text-sm text-white">{userTeam?.name}</div>
          </div>
          <button
            onClick={resetGame}
            className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-red-400 text-xs transition-colors py-2"
          >
            <RotateCcw size={14} />
            <span>重設所有遊戲數據</span>
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-x-hidden">
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:bg-blue-700 active:scale-95 transition-all"
      >
        <Menu size={24} />
      </button>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {renderSidebar()}

      {/* Main Content */}
      <main className="flex-1 w-full lg:max-w-none overflow-y-auto p-4 md:p-8">
        <header className="flex justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            {/* Mobile Sidebar Toggle (Alternative) */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              <Menu size={24} />
            </button>
            <div>
            <h2 className="text-3xl font-black text-slate-900 italic uppercase">
              {activeTab === "dashboard" && "儀表板"}
              {activeTab === "roster" && "球員名單"}
              {activeTab === "market" && "交易市場"}
              {activeTab === "library" && "球員百科 (2026)"}
              {activeTab === "league" && "聯盟排名"} {activeTab === "league" && (<span className="text-sm ml-3 font-black bg-slate-900 text-white px-3 py-1 rounded-full">{currentWeek} / {REGULAR_SEASON_GAMES} 週 (例行賽共 {REGULAR_SEASON_GAMES} 輪)</span>)}
              {activeTab === "stats" && "歷史賽績"}
            </h2>
            <p className="text-slate-500 text-sm font-medium">
              NBA 2026 全球職業聯賽管理中心
            </p>
          </div>
        </div>

          
          <div className="flex gap-4">
            {!isPlayoffs ? (
              <button
                onClick={simulateWeek}
                disabled={isSimulating}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-[28px] font-black text-sm sm:text-base uppercase italic transition-all flex items-center justify-center gap-4 shadow-xl shadow-blue-100 group disabled:bg-slate-100 disabled:text-slate-400 px-4"
              >
                {isSimulating ? (
                  <RefreshCw className="animate-spin" />
                ) : (
                  <Play fill="currentColor" />
                )}
                快速模擬本週
              </button>
            ) : (
              <>
                {playoffBracket.every((m) => m.winner) ? (
                  <button
                    onClick={proceedToNextPlayoffRound}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-6 rounded-[28px] font-black text-sm uppercase italic transition-all flex items-center justify-center gap-4 shadow-xl"
                  >
                    進入下一輪季後賽
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4 w-full">
                    {(() => {
                      const unfinishedUserMatch = playoffBracket.find(m => !m.winner && (m.home.id === userTeamId || m.away.id === userTeamId));
                      const aiMatchesToSimulate = playoffBracket.filter(m => !m.winner && m.home.id !== userTeamId && m.away.id !== userTeamId);
                      
                      return (
                        <>
                          {unfinishedUserMatch && (
                            <button
                              onClick={() => startPlayoffGame(unfinishedUserMatch)}
                              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-6 rounded-[28px] font-black italic uppercase text-sm transition-all flex items-center justify-center gap-3"
                            >
                              <Basketball className="text-orange-500" />
                              親自出戰: {unfinishedUserMatch.home.abbreviation} VS {unfinishedUserMatch.away.abbreviation}
                            </button>
                          )}
                          {aiMatchesToSimulate.length > 0 && (
                            <button
                              onClick={autoSimulateAiPlayoffGames}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-[28px] font-black italic uppercase text-sm transition-all flex items-center justify-center gap-3 shadow-xl"
                            >
                              <Play fill="currentColor" />
                              一鍵模擬其餘 {aiMatchesToSimulate.length} 場賽事
                            </button>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </>
            )}
          </div>
        </header>

        {/* News Bar */}
        <div className="relative mb-8">
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 flex items-start gap-4 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 bg-blue-600 h-full" />
            <div className="shrink-0 pt-1">
              <div className="bg-blue-600 text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 italic">
                <Trophy size={12} /> 聯盟報報
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div
                  className={`transition-all duration-500 ${isGeneratingNews ? "opacity-40 blur-[1px]" : "opacity-100"}`}
                >
                  <p className="text-slate-800 text-[15px] font-bold leading-relaxed tracking-tight">
                    {news}
                  </p>
                </div>
                <button
                  onClick={() => autoGenerateNews(true)}
                  disabled={isGeneratingNews || isSimulating}
                  className={`p-2 rounded-xl transition-all shrink-0 ${isGeneratingNews ? "animate-spin text-blue-500" : "text-slate-300 hover:bg-slate-100 hover:text-blue-600 active:scale-90"}`}
                >
                  <RefreshCw size={18} />
                </button>
              </div>
            </div>
          </div>

    
      {activePlayoffGame && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-3xl" onClick={() => !isQuarterSimulating && setActivePlayoffGame(null)}></div>
          <motion.div 
            initial={{ scale: 0.8, opacity: 0, rotate: -2 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            className="relative w-full max-w-5xl bg-white rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border-4 border-slate-200 flex flex-col h-[90vh]"
          >
            <div className="p-10 bg-slate-900 flex justify-between items-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
              <div className="relative z-10">
                <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter flex items-center gap-4">
                  <Trophy className="text-yellow-400" size={32} />
                  NBA <span className="text-blue-500">PLAYOFFS</span> 2026
                </h2>
                <div className="flex items-center gap-3 mt-2">
                   <div className="px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase italic animate-pulse">Live Broadcast</div>
                   <p className="text-sm font-bold text-slate-400">
                    目前階段: {playoffGameStatus === 'halftime' ? '🏀 節間休息' : playoffGameStatus === 'finished' ? '🏁 比賽結束' : `🔥 第 ${playoffQuarter} 節熱鬥中`}
                   </p>
                </div>
              </div>
              <button 
                 onClick={() => setActivePlayoffGame(null)} 
                 className="w-12 h-12 bg-white/10 hover:bg-red-500 text-white rounded-2xl flex items-center justify-center transition-all border border-white/10 relative z-10"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-12 space-y-12 bg-slate-50/50">
               {showPlayoffRoster ? (
                 <div className="space-y-8">
                    <div className="flex items-center justify-between">
                       <h3 className="text-2xl font-black text-slate-900 italic uppercase">調整戰術陣容</h3>
                       <button 
                        onClick={() => setShowPlayoffRoster(false)}
                        className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold text-sm"
                       >
                        返回球場
                       </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {players.filter(p => p.teamId === userTeamId).map(p => {
                          const isStarter = activePlayoffGame.home.lineup?.includes(p.id);
                          return (
                            <div key={p.id} className="p-4 bg-white rounded-2xl border-2 border-slate-100 flex items-center gap-4 shadow-sm relative overflow-hidden">
                               <img src={p.avatar} loading="lazy" className="w-12 h-12 rounded-full bg-slate-100" alt="avatar" />
                               <div className="flex-1 min-w-0">
                                  <div className="font-black italic text-slate-900 truncate">{p.name}</div>
                                  <div className="text-[10px] font-bold text-slate-400">{p.position} | OVR {p.rating} | 🔋 {Math.round(p.stamina)}%</div>
                               </div>
                               <button 
                                onClick={() => {
                                   const currentLineup = activePlayoffGame.home.lineup || [];
                                   if (isStarter) {
                                      const newLineup = currentLineup.filter((id: string) => id !== p.id);
                                      toggleStarter(p.id); 
                                      setActivePlayoffGame({
                                        ...activePlayoffGame,
                                        home: { ...activePlayoffGame.home, lineup: newLineup }
                                      });
                                   } else {
                                      if (currentLineup.length >= 5) {
                                         setNews("⚠️ 先發限制 5 人");
                                         return;
                                      }
                                      const newLineup = [...currentLineup, p.id];
                                      toggleStarter(p.id); 
                                      setActivePlayoffGame({
                                        ...activePlayoffGame,
                                        home: { ...activePlayoffGame.home, lineup: newLineup }
                                      });
                                   }
                                }}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase italic transition-all ${isStarter ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                               >
                                {isStarter ? '先發' : '入替'}
                               </button>
                            </div>
                          )
                       })}
                    </div>
                 </div>
               ) : (
                 <>
                   <div className="flex items-center justify-between gap-8 py-8 px-12 bg-white rounded-[3rem] shadow-xl border border-slate-100 relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-100 font-black text-9xl italic uppercase select-none opacity-50 z-0 tracking-tighter">VS</div>
                      
                      <div className="text-center space-y-6 flex-1 z-10">
                         <motion.div 
                           initial={{ x: -20, opacity: 0 }}
                           animate={{ x: 0, opacity: 1 }}
                           className="relative inline-block"
                         >
                           <img src={activePlayoffGame.home.logo} loading="lazy" className="w-40 h-40 mx-auto drop-shadow-[0_20px_30px_rgba(0,0,0,0.1)]" alt="logo" />
                           <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase italic tracking-widest border-2 border-white">HOME</div>
                         </motion.div>
                         <div className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">{activePlayoffGame.home.name}</div>
                      </div>

                      <div className="text-center z-10 px-8 flex-1">
                         <div className="bg-slate-900 text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest mb-6 inline-block">Scoreboard</div>
                         <div className="text-[10rem] font-black leading-none text-slate-900 tracking-tighter flex items-center justify-center gap-10">
                            <div className="flex-1 text-right tabular-nums">{playoffGameScores.home}</div>
                            <div className="text-slate-200 text-8xl pb-4 select-none">:</div>
                            <div className="flex-1 text-left tabular-nums">{playoffGameScores.away}</div>
                         </div>
                         <div className="flex justify-center gap-4 mt-8">
                            {[1,2,3,4].map(q => (
                              <div key={q} className="flex flex-col items-center gap-2">
                                <div className={`w-4 h-4 rounded-full border-2 ${playoffQuarter >= q ? (playoffQuarter === q && isQuarterSimulating ? 'bg-orange-500 border-orange-200 animate-ping' : 'bg-blue-600 border-blue-200 shadow-[0_0_10px_rgba(37,99,235,0.5)]') : 'bg-slate-200 border-slate-100'}`}></div>
                                <span className={`text-[10px] font-black ${playoffQuarter === q ? 'text-blue-600' : 'text-slate-300'}`}>Q{q}</span>
                              </div>
                            ))}
                         </div>
                      </div>

                       <div className="text-center space-y-6 flex-1 z-10">
                         <motion.div 
                           initial={{ x: 20, opacity: 0 }}
                           animate={{ x: 0, opacity: 1 }}
                           className="relative inline-block"
                         >
                           <img src={activePlayoffGame.away.logo} loading="lazy" className="w-40 h-40 mx-auto drop-shadow-[0_20px_30px_rgba(0,0,0,0.1)]" alt="logo" />
                           <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase italic tracking-widest border-2 border-white">AWAY</div>
                         </motion.div>
                         <div className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">{activePlayoffGame.away.name}</div>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-12">
                      <div className="bg-white rounded-[2.5rem] p-8 border-2 border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="font-black text-slate-900 uppercase italic tracking-tight flex items-center gap-2">
                            <Users size={16} className="text-blue-600" />
                            我的球隊陣容
                          </h4>
                          {playoffGameStatus === 'halftime' && (
                             <button 
                               onClick={() => setShowPlayoffRoster(true)}
                               className="px-4 py-2 bg-blue-600 text-white rounded-xl font-black italic text-[10px] uppercase shadow-lg shadow-blue-200"
                             >
                               點擊換人
                             </button>
                          )}
                        </div>
                        <div className="grid grid-cols-5 gap-4">
                          {players.filter(p => activePlayoffGame.home.lineup?.includes(p.id)).slice(0,5).map(p => (
                            <div key={p.id} className="relative group flex flex-col items-center">
                              <div className="w-full aspect-[3/4] bg-slate-900 rounded-3xl border-2 border-slate-700 flex flex-col items-center justify-center gap-1 overflow-hidden relative shadow-2xl transition-all group-hover:border-blue-500">
                                {/* 背景裝飾 */}
                                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-blue-600/20 to-transparent" />
                                {p.avatarUrl ? (
                                  <img src={p.avatarUrl} loading="lazy" className="w-full h-full object-cover z-0" alt={p.name} />
                                ) : (
                                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 font-black text-xl border-2 border-slate-700">
                                    {p.name.split(' ').map(n => n[0]).join('')}
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                                <div className="absolute top-1 left-1 bg-blue-600 px-1.5 py-0.5 rounded text-[8px] font-black text-white">{p.position}</div>
                                <div className="absolute top-1 right-1 bg-slate-800/80 backdrop-blur-md px-1 py-0.5 rounded text-[7px] font-black text-slate-300 border border-slate-700">🔋 {Math.round(p.stamina)}%</div>
                                <div className="absolute bottom-1 left-0 right-0 px-1 text-center">
                                  <div className="text-[9px] font-black text-white truncate leading-tight uppercase italic tracking-tighter shadow-sm">{p.name}</div>
                                  <div className="text-[11px] font-black text-blue-400 italic tracking-tighter">OVR {p.rating}</div>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
                                  <div className={`h-full ${p.stamina > 70 ? 'bg-emerald-500' : p.stamina > 40 ? 'bg-orange-500' : 'bg-red-500'}`} style={{ width: `${p.stamina}%` }}></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white rounded-[2.5rem] p-8 border-2 border-slate-100 shadow-sm opacity-80">
                         <div className="flex items-center justify-between mb-6">
                          <h4 className="font-black text-slate-900 uppercase italic tracking-tight flex items-center gap-2">
                            <Shield size={16} className="text-slate-400" />
                            對手防守陣容
                          </h4>
                        </div>
                         <div className="grid grid-cols-5 gap-4">
                          {players.filter(p => activePlayoffGame.away.lineup?.includes(p.id)).slice(0,5).map(p => (
                            <div key={p.id} className="flex flex-col items-center">
                              <div className="w-full aspect-[3/4] bg-slate-200 rounded-3xl border-2 border-slate-300 flex flex-col items-center justify-center gap-1 opacity-70 relative overflow-hidden">
                                {p.avatarUrl ? (
                                  <img src={p.avatarUrl} loading="lazy" className="w-full h-full object-cover grayscale" alt={p.name} />
                                ) : (
                                  <div className="w-12 h-12 rounded-full bg-slate-300 flex items-center justify-center text-slate-500 font-bold text-xs grayscale">
                                    {p.name.split(' ').map(n => n[0]).join('')}
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-200/80 via-transparent to-transparent" />
                                <div className="absolute top-2 left-2 bg-slate-200 px-1.5 py-0.5 rounded text-[8px] font-black text-slate-500">{p.position}</div>
                                <div className="absolute bottom-2 left-0 right-0 px-1 text-center">
                                  <div className="text-[9px] font-black text-slate-500 truncate leading-tight uppercase italic tracking-tighter">{p.name}</div>
                                  <div className="text-[11px] font-black text-slate-600 italic tracking-tighter text-center">OVR {p.rating}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                   </div>
                </>
               )}
            </div>

            <div className="p-10 bg-white border-t-2 border-slate-100 flex gap-6">
              {!showPlayoffRoster && (
                playoffGameStatus === 'finished' ? (
                  <button 
                    onClick={() => setActivePlayoffGame(null)}
                    className="flex-1 bg-slate-900 text-white py-8 rounded-[2rem] font-black text-2xl uppercase italic shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-4"
                  >
                    <Basketball /> 離開球場
                  </button>
                ) : (
                  <button 
                    disabled={isQuarterSimulating}
                    onClick={() => {
                        const homeLineupCount = activePlayoffGame.home.lineup?.length || 0;
                        const awayLineupCount = activePlayoffGame.away.lineup?.length || 0;
                        if (homeLineupCount < 5 || awayLineupCount < 5) {
                            setNews("⚠️ 兩隊先發陣容皆須滿 5 人方可開賽");
                            return;
                        }
                        simulatePlayoffQuarter();
                    }}
                    className="flex-1 bg-blue-600 text-white py-8 rounded-[2rem] font-black text-2xl uppercase italic shadow-[0_20px_50px_-10px_rgba(37,99,235,0.5)] hover:bg-blue-700 disabled:bg-slate-200 transition-all flex items-center justify-center gap-4"
                  >
                    {isQuarterSimulating ? <RefreshCw className="animate-spin" /> : <Play fill="currentColor" />}
                    {isQuarterSimulating ? '模擬激戰中...' : `開始第 ${playoffQuarter} 節 (${playoffQuarter === 4 ? '末節' : playoffQuarter === 1 ? '開賽' : playoffQuarter})`}
                  </button>
                )
              )}
            </div>
          </motion.div>
        </div>
      )}
      <AnimatePresence>
            {activeGames && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-4 z-50 overflow-x-auto pb-4 no-scrollbar"
              >
                <div className="flex gap-4">
                  {activeGames.map((game, idx) => {
                    const homeTeam = teams.find(
                      (t) => t.id === game.homeTeamId,
                    );
                    const awayTeam = teams.find(
                      (t) => t.id === game.awayTeamId,
                    );
                    const isUserGame =
                      game.homeTeamId === userTeamId ||
                      game.awayTeamId === userTeamId;

                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl border transition-all min-w-[220px] shadow-2xl flex flex-col gap-2 
                          ${
                            isUserGame
                              ? "bg-blue-900/90 border-blue-400 ring-2 ring-blue-400/50 scale-105 z-10"
                              : "bg-slate-900/95 border-slate-700 opacity-80 scale-95 hover:opacity-100 hover:scale-100"
                          }`}
                      >
                        <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase">
                          <span
                            className={
                              isUserGame ? "text-blue-200" : "text-slate-500"
                            }
                          >
                            {isUserGame
                              ? "YOUR TEAM - Q4 LIVE"
                              : "NBA LIVE - Q4"}
                          </span>
                          <span
                            className={`${isUserGame ? "text-yellow-400" : "text-blue-500"} animate-pulse`}
                          >
                            ●
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <img
                              src={homeTeam?.logo}
                              className="w-6 h-6"
                              alt="Home"
                              referrerPolicy="no-referrer"
                            />
                            <span className="font-bold">
                              {homeTeam?.abbreviation}
                            </span>
                          </div>
                          <span
                            className={`font-mono text-xl font-black leading-none ${isUserGame ? "text-white" : "text-blue-400"}`}
                          >
                            {game.homeScore}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <img
                              src={awayTeam?.logo}
                              className="w-6 h-6"
                              alt="Away"
                              referrerPolicy="no-referrer"
                            />
                            <span className="font-bold">
                              {awayTeam?.abbreviation}
                            </span>
                          </div>
                          <span
                            className={`font-mono text-xl font-black leading-none text-white`}
                          >
                            {game.awayScore}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid gap-8">
          {activeTab === "dashboard" && (
            <>
              {isPlayoffs && (
                <div className="bg-slate-900 p-8 rounded-[2rem] border-2 border-slate-800 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Trophy size={120} className="text-white" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 text-yellow-400 mb-6">
                      <Trophy size={24} />
                      <h3 className="text-2xl font-black italic uppercase tracking-tighter">季後賽對陣圖 (Playoff Bracket)</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {playoffBracket.map((match, idx) => (
                        <div key={idx} className={`p-5 rounded-2xl border-2 transition-all ${match.winner ? 'bg-slate-800/50 border-slate-700' : 'bg-blue-600/10 border-blue-500/30 ring-1 ring-blue-500/20'}`}>
                           <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex justify-between">
                             <span>Match {idx + 1}</span>
                             {match.winner && <span className="text-emerald-400">Finished</span>}
                           </div>
                           <div className="space-y-3">
                              <div className={`flex items-center justify-between gap-3 ${match.winner && match.winner.id !== match.home.id ? 'opacity-40' : ''}`}>
                                 <div className="flex items-center gap-2">
                                    <img src={match.home.logo} className="w-6 h-6" alt="h" />
                                    <span className="text-sm font-black text-white">{match.home.abbreviation}</span>
                                 </div>
                                 <span className="text-lg font-mono text-blue-400">{match.scores.home}</span>
                              </div>
                              <div className="h-px bg-slate-800"></div>
                              <div className={`flex items-center justify-between gap-3 ${match.winner && match.winner.id !== match.away.id ? 'opacity-40' : ''}`}>
                                 <div className="flex items-center gap-2">
                                    <img src={match.away.logo} className="w-6 h-6" alt="a" />
                                    <span className="text-sm font-black text-white">{match.away.abbreviation}</span>
                                 </div>
                                 <span className="text-lg font-mono text-blue-400">{match.scores.away}</span>
                              </div>
                           </div>
                        </div>
                      ))}
                    </div>
                    {playoffBracket.every(m => m.winner) && (
                       <div className="mt-8 p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-xl text-yellow-400 text-sm font-bold text-center italic">
                         本輪季後賽已完賽，請點擊上方按鈕進入下一輪！
                       </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-slate-400 mb-4">
                      <Target size={16} />
                      <span className="text-xs font-bold uppercase tracking-widest">
                        當季戰績
                      </span>
                    </div>
                    <div className="text-6xl font-black text-slate-900 italic tracking-tighter">
                      {userTeam?.stats.wins}
                      <span className="text-slate-200 mx-2">/</span>
                      {userTeam?.stats.losses}
                    </div>
                  </div>
                  <div className="mt-8 flex items-center gap-3">
                    <div className="flex-1 bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${((userTeam?.stats.wins || 0) / ((userTeam?.stats.wins || 0) + (userTeam?.stats.losses || 1))) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-black text-slate-400 italic">
                      WIN%
                    </span>
                  </div>
                </div>

                {/* Recent Game Card */}
                <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 text-slate-400 mb-4">
                      <Clock size={16} />
                      <span className="text-xs font-bold uppercase tracking-widest">
                        最近賽果
                      </span>
                    </div>

                    {lastUserGame ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img
                              src={userTeam?.logo}
                              className="w-8 h-8"
                              alt="Me"
                              referrerPolicy="no-referrer"
                            />
                            <span className="font-black text-slate-900">
                              {userTeam?.abbreviation}
                            </span>
                          </div>
                          <span
                            className={`text-2xl font-mono font-black ${(lastUserGame.homeTeamId === userTeamId ? lastUserGame.homeScore : lastUserGame.awayScore) > (lastUserGame.homeTeamId === userTeamId ? lastUserGame.awayScore : lastUserGame.homeScore) ? "text-blue-600" : "text-slate-400"}`}
                          >
                            {lastUserGame.homeTeamId === userTeamId
                              ? lastUserGame.homeScore
                              : lastUserGame.awayScore}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img
                              src={lastGameOpponent?.logo}
                              className="w-8 h-8"
                              alt="Opp"
                              referrerPolicy="no-referrer"
                            />
                            <span className="font-black text-slate-900">
                              {lastGameOpponent?.abbreviation}
                            </span>
                          </div>
                          <span
                            className={`text-2xl font-mono font-black ${(lastUserGame.homeTeamId === userTeamId ? lastUserGame.awayScore : lastUserGame.homeScore) > (lastUserGame.homeTeamId === userTeamId ? lastUserGame.homeScore : lastUserGame.awayScore) ? "text-blue-600" : "text-slate-400"}`}
                          >
                            {lastUserGame.homeTeamId === userTeamId
                              ? lastUserGame.awayScore
                              : lastUserGame.homeScore}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-20 flex items-center justify-center text-slate-300 font-bold italic text-sm">
                        尚無比賽紀錄
                      </div>
                    )}
                  </div>

                  {lastUserGame && (
                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                      <div
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${
                          (lastUserGame.homeTeamId === userTeamId
                            ? lastUserGame.homeScore
                            : lastUserGame.awayScore) >
                          (lastUserGame.homeTeamId === userTeamId
                            ? lastUserGame.awayScore
                            : lastUserGame.homeScore)
                            ? "bg-blue-100 text-blue-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {(lastUserGame.homeTeamId === userTeamId
                          ? lastUserGame.homeScore
                          : lastUserGame.awayScore) >
                        (lastUserGame.homeTeamId === userTeamId
                          ? lastUserGame.awayScore
                          : lastUserGame.homeScore)
                          ? "勝利"
                          : "敗戰"}
                      </div>
                      <span className="text-[10px] text-slate-300 font-bold italic">
                        Latest Game
                      </span>
                    </div>
                  )}

                  <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-8 -mt-8 -z-0 opacity-50" />
                </div>

                <div className="bg-slate-900 p-6 rounded-3xl shadow-2xl overflow-hidden relative border border-slate-800 flex flex-col justify-between">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 text-slate-500 mb-4">
                      <Users size={16} />
                      <span className="text-xs font-bold uppercase tracking-widest">
                        主隊實力
                      </span>
                    </div>
                    <div className="flex items-end gap-4">
                      <div className="text-6xl font-black text-white italic tracking-tighter leading-none">
                        {Math.round(
                          calculateTeamOVR(
                            userStarters.length > 0 ? userStarters : userRoster,
                          ).overall,
                        )}
                      </div>
                      <div className="pb-1 space-y-1">
                        <div className="flex items-center gap-3 text-[10px]">
                          <span className="text-slate-500 font-bold uppercase">
                            OFF
                          </span>
                          <span className="text-blue-400 font-black text-sm">
                            {Math.round(
                              calculateTeamOVR(
                                userStarters.length > 0
                                  ? userStarters
                                  : userRoster,
                              ).offense,
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px]">
                          <span className="text-slate-500 font-bold uppercase">
                            DEF
                          </span>
                          <span className="text-orange-500 font-black text-sm">
                            {Math.round(
                              calculateTeamOVR(
                                userStarters.length > 0
                                  ? userStarters
                                  : userRoster,
                              ).defense,
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-2 right-2 opacity-10">
                    <img
                      src={userTeam?.logo}
                      alt="Logo"
                      className="w-20 h-20"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black text-slate-900 text-xl flex items-center gap-3 uppercase italic">
                      <span className="w-1.5 h-8 bg-blue-600 rounded-full"></span>
                      先發名單
                    </h3>
                    <button
                      onClick={() => setActiveTab("roster")}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2"
                    >
                      詳細名單 <ChevronRight size={14} />
                    </button>
                  </div>
                  <div className="grid gap-4">
                    {(userStarters.length > 0
                      ? userStarters
                      : userRoster.slice(0, 5)
                    ).map((p) => (
                      <PlayerCard key={p.id} player={p} />
                    ))}
                  </div>
                </section>

                <section>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black text-slate-900 text-xl flex items-center gap-3 uppercase italic">
                      <span className="w-1.5 h-8 bg-orange-600 rounded-full"></span>
                      聯盟龍頭榜
                    </h3>
                    <button
                      onClick={() => setActiveTab("league")}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2"
                    >
                      聯盟大表 <ChevronRight size={14} />
                    </button>
                  </div>
                  <div className="bg-white border-2 border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                    {standings.slice(0, 8).map((team, idx) => (
                      <div
                        key={team.id}
                        className="flex items-center gap-6 p-5 border-b last:border-0 hover:bg-slate-50 transition-all group"
                      >
                        <span className="text-slate-200 font-black italic text-2xl w-8 group-hover:text-blue-500 transition-colors">
                          {idx + 1}
                        </span>
                        <div className="relative">
                          <img
                            src={team.logo}
                            className="w-10 h-10 relative z-10"
                            alt="Logo"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-slate-100 rounded-full scale-125 -z-10 group-hover:bg-blue-50 transition-colors"></div>
                        </div>
                        <div className="flex-1">
                          <div className="font-black text-base text-slate-800 tracking-tight">
                            {team.name}
                          </div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {team.city}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-black text-xl text-slate-900">
                            {team.stats.wins} - {team.stats.losses}
                          </div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase">
                            W/L Record
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </>
          )}

          {activeTab === "roster" && (
            <div className="space-y-12">
              <section>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-black text-slate-900 text-2xl flex items-center gap-3 uppercase italic">
                    <span className="w-2 h-10 bg-blue-600 rounded-full"></span>
                    先發名單 (Starters) {userStarters.length}/5
                  </h3>
                  <div className="text-sm font-bold text-slate-400">
                    總球員數 {userRoster.length} / {MAX_ROSTER_SIZE}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {userStarters.map((p) => (
                    <div key={p.id} className="space-y-4">
                      <PlayerCard player={p} />
                      <button
                        onClick={() => toggleStarter(p.id)}
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl py-3 font-black italic uppercase text-xs transition-all flex items-center justify-center gap-2"
                      >
                        移至候補
                      </button>
                      <button
                        onClick={() => trainPlayer(p.id)}
                        className="w-full bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-2xl py-3 font-black italic uppercase text-[10px] transition-all flex flex-col items-center justify-center gap-0.5 leading-tight shadow-sm hover:shadow-orange-200"
                      >
                         <div className="flex items-center gap-1 text-[11px]">
                           <Crown size={12} className="text-orange-500" /> 修煉 (+0.5)
                         </div>
                         <div className="opacity-80 flex items-center gap-1 font-mono">
                            <span className="text-orange-600">${p.isLegend ? '1000M' : '500M'}</span>
                            <span className="text-slate-400">({p.trainingCount || 0}/{p.isLegend ? 10 : 6})</span>
                         </div>
                      </button>
                      <button
                        onClick={() => setReleaseConfirmId(p.id)}
                        className={`w-full border-2 rounded-2xl py-2 font-black italic uppercase text-[10px] transition-all flex items-center justify-center gap-2 ${releaseConfirmId === p.id ? "bg-red-500 border-red-500 text-white" : "border-slate-100 hover:border-red-100 hover:text-red-500 text-slate-400"}`}
                      >
                        {releaseConfirmId === p.id ? "確定釋出？" : "釋出球員"}
                      </button>
                      {releaseConfirmId === p.id && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => releasePlayer(p.id)}
                            className="flex-1 bg-red-600 text-white rounded-xl py-2 text-[10px] font-black uppercase italic"
                          >
                            最後確認
                          </button>
                          <button
                            onClick={() => setReleaseConfirmId(null)}
                            className="flex-1 bg-slate-100 text-slate-400 rounded-xl py-2 text-[10px] font-black uppercase italic"
                          >
                            取消
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-black text-slate-900 text-2xl flex items-center gap-3 uppercase italic">
                    <span className="w-2 h-10 bg-slate-300 rounded-full"></span>
                    候補名單 (Reserves)
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {userReserves.map((p) => (
                    <div key={p.id} className="space-y-4">
                      <PlayerCard player={p} />
                      <button
                        onClick={() => toggleStarter(p.id)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-3 font-black italic uppercase text-xs transition-all flex items-center justify-center gap-2"
                      >
                        設為先發
                      </button>
                      <button
                        onClick={() => trainPlayer(p.id)}
                        className="w-full bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-2xl py-3 font-black italic uppercase text-[10px] transition-all flex flex-col items-center justify-center gap-0.5 leading-tight shadow-sm hover:shadow-orange-200"
                      >
                         <div className="flex items-center gap-1 text-[11px]">
                           <Crown size={12} className="text-orange-500" /> 修煉 (+0.5)
                         </div>
                         <div className="opacity-80 flex items-center gap-1 font-mono">
                            <span className="text-orange-600">${p.isLegend ? '1000M' : '500M'}</span>
                            <span className="text-slate-400">({p.trainingCount || 0}/{p.isLegend ? 10 : 6})</span>
                         </div>
                      </button>
                      <button
                        onClick={() => setReleaseConfirmId(p.id)}
                        className={`w-full border-2 rounded-2xl py-2 font-black italic uppercase text-[10px] transition-all flex items-center justify-center gap-2 ${releaseConfirmId === p.id ? "bg-red-500 border-red-500 text-white" : "border-slate-100 hover:border-red-100 hover:text-red-500 text-slate-400"}`}
                      >
                        {releaseConfirmId === p.id ? "確定釋出？" : "釋出球員"}
                      </button>
                      {releaseConfirmId === p.id && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => releasePlayer(p.id)}
                            className="flex-1 bg-red-600 text-white rounded-xl py-2 text-[10px] font-black uppercase italic"
                          >
                            最後確認
                          </button>
                          <button
                            onClick={() => setReleaseConfirmId(null)}
                            className="flex-1 bg-slate-100 text-slate-400 rounded-xl py-2 text-[10px] font-black uppercase italic"
                          >
                            取消
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => setActiveTab("market")}
                    className="bg-white border-4 border-dashed border-slate-200 rounded-3xl p-10 flex flex-col items-center justify-center gap-4 text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all group shadow-sm min-h-[300px]"
                  >
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <Search size={28} />
                    </div>
                    <div className="text-center">
                      <span className="font-black text-lg uppercase italic block">
                        前往市場
                      </span>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        探索潛力新星
                      </span>
                    </div>
                  </button>
                </div>
              </section>
            </div>
          )}

          {activeTab === "market" && (
            <div className="space-y-12">
              {/* Market Sub-tabs */}
              <div className="flex bg-slate-100 p-1.5 rounded-3xl w-fit mb-12">
                <button
                  onClick={() => setMarketSubTab("players")}
                  className={`px-10 py-4 rounded-2xl font-black italic uppercase text-sm tracking-tighter transition-all flex items-center gap-3 ${marketSubTab === "players" ? "bg-white text-blue-600 shadow-xl scale-105" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <Users size={18} />
                  球員探索
                </button>
                <button
                  onClick={() => setMarketSubTab("gear")}
                  className={`px-10 py-4 rounded-2xl font-black italic uppercase text-sm tracking-tighter transition-all flex items-center gap-3 ${marketSubTab === "gear" ? "bg-white text-orange-600 shadow-xl scale-105" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <ShoppingCart size={18} />
                  裝備商店
                </button>
              </div>

              {marketSubTab === "players" ? (
                <div className="space-y-12">
                  <div className="bg-slate-900 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl">
                    <div className="relative z-10 space-y-6">
                      <div className="bg-blue-600/20 text-blue-400 px-4 py-2 rounded-2xl inline-flex items-center gap-3 border border-blue-600/30">
                        <Clock size={16} />
                        <span className="font-black italic uppercase tracking-tighter">
                          探索冷卻時間
                        </span>
                      </div>
                      <div className="text-xs font-black text-blue-400 bg-blue-900/50 px-4 py-2 rounded-full inline-block uppercase tracking-widest border border-blue-800">
                        目前自由市場共有 {players.filter(p => p.teamId === 'FA').length} 位球員
                      </div>

                      {timeToNextExplore > 0 ? (
                        <div className="space-y-4">
                          <div className="text-5xl font-black text-white italic tracking-tighter">
                            {formatTime(timeToNextExplore)}
                          </div>
                          <p className="text-slate-500 font-bold max-w-xs mx-auto">
                            正在分析聯盟球探報告，請稍後再次探索...
                          </p>
                          <button
                            onClick={() => {
                              setLastExploreTime(0); // Force cool down reset
                              setExplorePool([]);
                              setNews("🛠️ 球探報告已手動刷新！現在可以立即探索新球員。");
                            }}
                            className="bg-slate-800 text-slate-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-700 hover:text-white hover:border-slate-500 transition-all flex items-center gap-2 mx-auto"
                          >
                             <RefreshCw size={12} /> 手動重整球探報告 (Manual Refresh)
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="text-5xl font-black text-emerald-400 italic tracking-tighter uppercase">
                            準備就緒！
                          </div>
                          <button
                            onClick={handleExplore}
                            className="bg-white text-slate-900 px-10 py-5 rounded-3xl font-black italic uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all transform hover:scale-105 shadow-xl flex items-center gap-3 mx-auto"
                          >
                            <Search size={20} />
                            立即探索交易
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                      <div className="grid grid-cols-12 gap-1 w-full h-full opacity-20">
                        {Array.from({ length: 48 }).map((_, i) => (
                          <div
                            key={i}
                            className="border border-slate-700 h-20 w-full"
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-black text-slate-900 text-2xl flex items-center gap-3 uppercase italic mb-8">
                      <span className="w-2 h-10 bg-blue-600 rounded-full"></span>
                      本週探索到的球員 ({explorePool.length})
                    </h3>

                    {explorePool.length === 0 ? (
                      <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-20 text-center shadow-sm mb-12">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Users className="text-slate-100" size={40} />
                        </div>
                        <h3 className="font-black text-2xl text-slate-900 mb-2 uppercase italic tracking-tight">
                          尚無探索結果
                        </h3>
                        <p className="text-slate-400 font-bold max-w-sm mx-auto">
                          當冷卻時間結束後，點擊上方按鈕開始全聯盟範圍的球員探索。
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                        {players
                          .filter((p) => explorePool.includes(p.id))
                          .map((p) => (
                            <div key={p.id} className="space-y-4">
                              <PlayerCard player={p} />
                              <button
                                onClick={() => buyPlayer(p.id)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-4 font-black italic uppercase text-sm transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-100"
                              >
                                <DollarSign size={18} />
                                簽約球員 (${(p.price / 1000000).toFixed(1)}M)
                              </button>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Market Sub-tabs (Gear only now for this part) */}
                    <div className="space-y-8">
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {EQUIPMENT_MARKET.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border-2 border-slate-100 rounded-3xl p-6 hover:shadow-xl transition-all relative group"
                    >
                      <div className="w-full aspect-square bg-slate-900 rounded-2xl flex items-center justify-center mb-6 relative overflow-hidden group-hover:scale-[1.02] transition-transform p-4 shadow-inner border border-slate-800">
                      {/* 背景發光特效 */}
                      <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      
                      <img
                        src={getGearImage(item.type, item.level)}
                        alt={item.name}
                        // mix-blend-screen 可以完美把黑色背景濾掉，保留霓虹發光感
                        className="w-full h-full object-contain mix-blend-screen relative z-10"
                        onError={(e) => {
                          // 如果圖檔真的找不到，優雅地降級回原本的 Icon
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                          (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                        }}
                      />
                      
                      {/* 找不到圖片時的預設 Icon */}
                      <div className="hidden relative z-10 items-center justify-center w-full h-full">
                        {(() => {
                          const IconComponent = IconMap[item.icon as string] || Shirt;
                          return (
                            <IconComponent 
                              size={48} 
                              style={{
                                color: item.level === 'Legendary' ? '#eab308' :
                                       item.level === 'Master' ? '#f97316' :
                                       item.level === 'Elite' ? '#a855f7' :
                                       item.level === 'Pro' ? '#3b82f6' :
                                       item.level === 'Standard' ? '#22c55e' : '#94a3b8'
                              }}
                              className="animate-pulse"
                            />
                          );
                        })()}
                      </div>
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
                        購買裝備 ($${(item.price / 1000000).toFixed(1)}M)
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "library" && (
            <div className="space-y-8">
              {/* Encyclopedia Filters */}
              <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      value={librarySearch}
                      onChange={(e) => {
                        setLibrarySearch(e.target.value);
                        setLibraryPage(0);
                      }}
                      placeholder="搜尋球員名稱、位置或特徵..."
                      className="w-full pl-16 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-[1.5rem] outline-none transition-all font-black italic text-slate-900"
                    />
                  </div>
                  
                  <div className="flex gap-4 w-full md:w-auto">
                    <select 
                      className="flex-1 md:flex-none bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-black italic outline-none focus:border-blue-500 cursor-pointer text-slate-900 text-sm uppercase"
                      value={librarySort}
                      onChange={(e) => {
                        setLibrarySort(e.target.value as any);
                        setLibraryPage(0);
                      }}
                    >
                      <option value="rating">依評分排序</option>
                      <option value="price">依身價排序</option>
                      <option value="name">依字母排序</option>
                      <option value="position">依位置排序</option>
                    </select>

                    <button 
                      onClick={() => setLibrarySortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                      className="bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-black italic hover:bg-white transition-all text-slate-900 flex items-center gap-2 text-sm uppercase"
                    >
                      {librarySortOrder === 'desc' ? "高 -> 低" : "低 -> 高"}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {["ALL", "PG", "SG", "SF", "PF", "C"].map((pos) => (
                    <button
                      key={pos}
                      onClick={() => {
                        setLibraryPositionFilter(pos);
                        setLibraryPage(0);
                      }}
                      className={`px-8 py-3 rounded-xl font-black italic text-xs transition-all border-2 ${
                        libraryPositionFilter === pos
                          ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100 scale-105"
                          : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                      }`}
                    >
                      {pos === "ALL" ? "所有位置" : pos}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 px-8 py-6 rounded-[2rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
                   <Basketball size={120} />
                </div>
                <div className="flex items-center gap-8 relative z-10">
                   <div className="text-center">
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">球員庫存量</div>
                      <div className="text-3xl font-black italic tracking-tighter">
                        {players.filter(p => !p.id.startsWith('rp-')).length} <span className="text-sm text-slate-500 not-italic">PLAYERS</span>
                      </div>
                   </div>
                   <div className="w-px h-12 bg-slate-800"></div>
                   <div className="text-center">
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">當前隊內</div>
                      <div className="text-3xl font-black italic tracking-tighter text-blue-400">
                        {players.filter(p => p.teamId === userTeamId).length} <span className="text-sm text-slate-500 not-italic">OWNED</span>
                      </div>
                   </div>
                </div>
                <div className="text-right relative z-10">
                   <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">符合條件</div>
                   <div className="text-2xl font-black italic">{filteredLibraryPlayers.length} 位球星</div>
                </div>
              </div>

              {libraryTotalPages > 1 && (
                <div className="flex justify-center items-center gap-4 py-4">
                  <button
                    disabled={libraryPage === 0}
                    onClick={() => setLibraryPage(p => p - 1)}
                    className="px-6 py-2 bg-white rounded-xl font-black disabled:opacity-30 border-2 border-slate-100 hover:bg-slate-50 transition-all text-slate-900"
                  >
                    上一頁
                  </button>
                  <span className="font-black text-slate-500 bg-slate-100 px-4 py-2 rounded-xl text-sm">
                    第 {libraryPage + 1} / {libraryTotalPages} 頁 (共 {filteredLibraryPlayers.length} 人)
                  </span>
                  <button
                    disabled={libraryPage >= libraryTotalPages - 1}
                    onClick={() => setLibraryPage(p => p + 1)}
                    className="px-6 py-2 bg-white rounded-xl font-black disabled:opacity-30 border-2 border-slate-100 hover:bg-slate-50 transition-all text-slate-900"
                  >
                    下一頁
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {displayedLibraryPlayers.map((p) => {
                  const isUserPlayer = p.teamId === userTeamId;
                  const playerTeam = teams.find(t => t.id === p.teamId);
                  
                  return (
                    <PlayerCard 
                      key={p.id} 
                      player={p} 
                      isObtained={isUserPlayer}
                      teamName={p.teamId === 'FA' ? '自由市場' : (playerTeam ? playerTeam.name : '未知球隊')}
                    />
                  );
                })}
              </div>
              
              {libraryTotalPages > 1 && (
                <div className="flex justify-center items-center gap-4 py-12">
                  <button
                    disabled={libraryPage === 0}
                    onClick={() => {
                        setLibraryPage(p => p - 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-6 py-2 bg-white rounded-xl font-black disabled:opacity-30 border-2 border-slate-100 hover:bg-slate-50 transition-all text-slate-900"
                  >
                    上一頁
                  </button>
                  <span className="font-black text-slate-500 bg-slate-100 px-4 py-2 rounded-xl text-sm">
                    第 {libraryPage + 1} / {libraryTotalPages} 頁
                  </span>
                  <button
                    disabled={libraryPage >= libraryTotalPages - 1}
                    onClick={() => {
                        setLibraryPage(p => p + 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-6 py-2 bg-white rounded-xl font-black disabled:opacity-30 border-2 border-slate-100 hover:bg-slate-50 transition-all text-slate-900"
                  >
                    下一頁
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "team_rosters" && (
            <div className="space-y-12">
              {teams.map((t) => (
                <div key={t.id} className="bg-white p-8 rounded-3xl border-2 border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between gap-4 mb-8">
                     <div className="flex items-center gap-4">
                        <img src={t.logo} loading="lazy" className="w-16 h-16" alt={t.name} />
                        <h3 className="text-3xl font-black text-slate-900 italic uppercase">{t.name} ({t.abbreviation})</h3>
                     </div>
                     <div className="bg-slate-100 px-6 py-2 rounded-xl font-black italic text-slate-900">
                        經費: $${(t.budget / 1000000).toFixed(1)}M
                     </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                     {players.filter(p => p.teamId === t.id).map(p => {
                       const isStarter = t.lineup?.includes(p.id);
                       return (
                         <div key={p.id} className="relative">
                           <PlayerCard key={p.id} player={p} teamName={t.name} />
                           {isStarter && (
                             <div className="absolute top-2 right-2 bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded italic uppercase">
                               先發
                             </div>
                           )}
                         </div>
                       )
                     })}
                  </div>
                </div>
              ))}
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
                <div
                  key={team.id}
                  className="grid grid-cols-12 gap-4 p-8 border-b last:border-0 items-center hover:bg-slate-50 transition-colors"
                >
                  <div className="col-span-1 font-black text-2xl italic text-slate-200">
                    #{idx + 1}
                  </div>
                  <div className="col-span-4 flex items-center gap-4">
                    <img src={team.logo} className="w-10 h-10" alt="logo" />
                    <div>
                      <div className="font-black text-slate-900 uppercase italic">
                        {team.name}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400">
                        {team.city}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 text-center font-mono font-black text-xl">
                    {team.stats.wins} - {team.stats.losses}
                  </div>
                  <div className="col-span-2 text-center">
                    <div className="text-xs font-black text-blue-600 bg-blue-50 py-1 rounded-lg">
                      {((team.stats.wins || 0) / ((team.stats.wins || 0) + (team.stats.losses || 1)) * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="col-span-3 text-right font-black text-slate-400">
                    $${(team.budget / 1000000).toFixed(1)}M
                  </div>
                </div>
              ))}
            </div>
          )}

          
          {activeTab === "stats" && (
            <div className="space-y-6">
              {games.length === 0 ? (
                <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-20 text-center">
                  <Calendar className="mx-auto text-slate-100 mb-6" size={48} />
                  <h3 className="font-black text-2xl text-slate-900">
                    尚無歷史賽事
                  </h3>
                </div>
              ) : (
                <div className="grid gap-4">
                  {[...games].reverse().map((game, idx) => {
                    const hTeam = teams.find((t) => t.id === game.homeTeamId);
                    const aTeam = teams.find((t) => t.id === game.awayTeamId);
                    return (
                      <div
                        key={idx}
                        className="bg-white p-6 rounded-3xl border-2 border-slate-100 flex items-center justify-between hover:border-blue-200 transition-all"
                      >
                        <div className="flex items-center gap-12 flex-1">
                          <div className="flex items-center gap-4 min-w-[150px]">
                            <img src={hTeam?.logo} className="w-10 h-10" alt="h" />
                            <span className="font-black uppercase italic">
                              {hTeam?.abbreviation}
                            </span>
                          </div>
                          <div className="text-4xl font-black italic tracking-tighter">
                            <span
                              className={
                                game.homeScore > game.awayScore
                                  ? "text-blue-600"
                                  : "text-slate-300"
                              }
                            >
                              {game.homeScore}
                            </span>
                            <span className="text-slate-100 mx-4">:</span>
                            <span
                              className={
                                game.awayScore > game.homeScore
                                  ? "text-blue-600"
                                  : "text-slate-300"
                              }
                            >
                              {game.awayScore}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 min-w-[150px] justify-end">
                            <span className="font-black uppercase italic">
                              {aTeam?.abbreviation}
                            </span>
                            <img src={aTeam?.logo} className="w-10 h-10" alt="a" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

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
          <div
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
            onClick={() => setSelectedGearPlayerId(null)}
          ></div>
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative w-full max-w-4xl bg-slate-50 rounded-[40px] p-10 shadow-2xl border border-slate-200 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500"></div>
            
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-4xl font-black text-slate-900 italic uppercase tracking-tighter">
                選擇裝備球員
              </h3>
              <button 
                onClick={() => setSelectedGearPlayerId(null)}
                className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center hover:bg-red-100 hover:text-red-500 transition-all"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto mb-8 pr-4 custom-scrollbar p-1">
              {userRoster.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    const item = EQUIPMENT_MARKET.find((i) => i.id === selectedGearPlayerId);
                    if (item) buyEquipment(p.id, item);
                    setSelectedGearPlayerId(null);
                  }}
                  className="group relative flex flex-col items-center bg-white hover:bg-blue-50 rounded-[2.5rem] p-6 border-2 border-slate-100 hover:border-blue-300 transition-all text-center shadow-sm hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center border-2 border-slate-100 mb-4 overflow-hidden group-hover:scale-110 transition-transform">
                     <img 
                       src={p.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}&backgroundColor=b6e3f4,c0aede,d1d4f9&mood=happy`} 
                       className="w-full h-full object-cover" 
                       alt="avatar" 
                     />
                  </div>
                  
                  <div className="font-black text-slate-800 text-lg mb-1 truncate w-full">
                    {p.name}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                     <span className="text-[10px] font-black px-2 py-1 bg-slate-100 text-slate-400 rounded-lg uppercase tracking-widest">{p.position}</span>
                     <span className="text-[10px] font-black px-2 py-1 rounded-lg uppercase italic tracking-tighter" style={{ backgroundColor: p.color + '15', color: p.color }}>
                       OVR {Math.round(p.rating)}
                     </span>
                  </div>

                  <div className="w-full flex gap-1 justify-center">
                    {p.equipment?.map((gear, gearIdx) => (
                      <div 
                        key={gearIdx} 
                        className="w-6 h-6 rounded-lg border border-slate-100 flex items-center justify-center bg-slate-50 overflow-hidden"
                        style={{ borderColor: 
                          gear.level === 'Legendary' ? '#eab308' :
                          gear.level === 'Master' ? '#f97316' :
                          gear.level === 'Elite' ? '#a855f7' :
                          gear.level === 'Pro' ? '#3b82f6' :
                          gear.level === 'Standard' ? '#22c55e' : '#94a3b8' 
                        }}
                      >
                         {/* Here we'd ideally show the icon, but let's stick to a colored dot or simple shape for brevity in selection list */}
                         <div 
                           className="w-2 h-2 rounded-full" 
                           style={{ backgroundColor: 
                            gear.level === 'Legendary' ? '#eab308' :
                            gear.level === 'Master' ? '#f97316' :
                            gear.level === 'Elite' ? '#a855f7' :
                            gear.level === 'Pro' ? '#3b82f6' :
                            gear.level === 'Standard' ? '#22c55e' : '#94a3b8' 
                           }}
                         />
                      </div>
                    ))}
                  </div>
                  
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 text-white p-2 rounded-xl shadow-lg">
                    點擊裝備
                  </div>
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setSelectedGearPlayerId(null)}
              className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black uppercase italic tracking-widest hover:bg-slate-800 transition-all shadow-xl"
            >
              取消購買 (Cancel)
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  </div>
  );
}
