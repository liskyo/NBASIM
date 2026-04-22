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
} from "lucide-react";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
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
  const [collectedPlayerIds, setCollectedPlayerIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("nba-gm-collected");
    return saved ? JSON.parse(saved) : [];
  });
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

  useEffect(() => {
    localStorage.setItem("nba-gm-collected", JSON.stringify(collectedPlayerIds));
  }, [collectedPlayerIds]);

  // Update collected players whenever roster changes
  useEffect(() => {
    const rosterIds = players.filter(p => p.teamId === userTeamId).map(p => p.id);
    setCollectedPlayerIds(prev => {
      const newIds = rosterIds.filter(id => !prev.includes(id));
      if (newIds.length > 0) return [...prev, ...newIds];
      return prev;
    });
  }, [players, userTeamId]);

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
    match.scores = { home: hScore, away: aScore };
    
    setPlayoffBracket(newBracket);
    
    // Check if round is finished
    const finished = newBracket.every(m => m.winner);
    if (finished) {
       if (playoffRound === 3) {
          setNews(`🏁 傳奇誕生！${match.winner.name} 奪得 2026 NBA 總冠軍！`);
          // Trigger season transition after finals
          setTimeout(startNextSeason, 2000); 
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

  const autoGenerateNews = () => {
    setIsGeneratingNews(true);
    const ctx = generateLeagueContext();
    
    // Find legendary or major signings
    const legendsOnTeams = players.filter(p => p.isLegend && p.teamId !== 'FA');
    const recentLegend = legendsOnTeams.length > 0 
      ? legendsOnTeams[Math.floor(Math.random() * legendsOnTeams.length)] 
      : null;

    const newsList = [
      `【聯盟頭條】${ctx.leader} 展現無人能敵的統治力，目前橫掃聯盟穩坐榜首！`,
      `【MVP 觀察】球評指出：${ctx.topPlayer} 以其全能數據，目前是 MVP 的頭號候選人。`,
      `【球隊快訊】${ctx.userTeamName} 目前戰績排名第 ${ctx.userStanding}，總經理正積極調整陣容拚搶每一勝利。`,
      `【賽事分析】例行賽已進入白熱化階段，${ctx.leader} 的連勝勢頭引起聯盟各方關注。`
    ];

    if (recentLegend) {
      const ownerTeam = teams.find(t => t.id === recentLegend.teamId);
      newsList.push(`【震撼交易】傳奇球星 ${recentLegend.name} 已正式加盟 ${ownerTeam?.city}${ownerTeam?.name}！聯盟實力版圖面臨大洗牌！`);
    }

    if (ctx.recentGames) {
      const g = ctx.recentGames.split(',')[0];
      newsList.push(`【焦點戰報】昨日 ${g} 之戰打得火熱，頂級對決讓全場球迷驚呼連連！`);
    }

    const selectedNews = newsList[Math.floor(Math.random() * newsList.length)];
    setNews(selectedNews);
    setIsGeneratingNews(false);
  };
  const [activeGames, setActiveGames] = useState<GameResult[] | null>(null);
  const [news, setNews] = useState<string>(
    "歡迎來到 NBA 2024-25 賽季。點擊「模擬本週」開始你的經理生涯！",
  );
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

      // Feature: Merge new players from INITIAL_PLAYERS that are not in the save
      const currentIds = new Set(loadedPlayers.map(p => p.id));
      const missingPlayers = INITIAL_PLAYERS.filter(p => !currentIds.has(p.id));
      if (missingPlayers.length > 0) {
        currentPlayers = [...loadedPlayers, ...missingPlayers.map(p => ({ ...p, teamId: 'FA' }))];
      } else {
        currentPlayers = loadedPlayers;
      }
      
      // Validation & Self-Healing: Check if any team has < 8 players
      let playersModified = missingPlayers.length > 0;
      let teamsModified = false;

      currentTeams.forEach(team => {
        const teamPlayers = currentPlayers.filter(p => p.teamId === team.id);
        if (teamPlayers.length < 8) {
          const needed = 8 - teamPlayers.length;
          // Find FAs to fill the gap
          const faPool = currentPlayers.filter(p => p.teamId === 'FA');
          const fillers = faPool.sort(() => 0.5 - Math.random()).slice(0, needed);
          
          fillers.forEach(p => {
             const idx = currentPlayers.findIndex(cp => cp.id === p.id);
             if (idx !== -1) {
               const rating = 85 + Math.floor(Math.random() * 6);
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
      // New Game Initialiation
      currentPlayers = INITIAL_PLAYERS.map(p => ({ ...p, teamId: 'FA' }));
      
      NBA_TEAMS.forEach(team => {
        const pool = currentPlayers.filter(p => p.teamId === 'FA');
        const candidates = pool.sort(() => 0.5 - Math.random()).slice(0, 8);
        
        candidates.forEach(p => {
          const rating = 85 + Math.floor(Math.random() * 6); // 85-90 as requested
          const idx = currentPlayers.findIndex(cp => cp.id === p.id);
          if (idx !== -1) {
             currentPlayers[idx] = {
               ...currentPlayers[idx],
               teamId: team.id,
               rating: rating,
               offense: rating + 1,
               defense: rating - 1,
               price: 500000 + (rating - 60) * 100000,
             };
          }
        });
      });

      setPlayers(currentPlayers);

      currentTeams = NBA_TEAMS.map((team) => {
        const teamPlayerIds = currentPlayers.filter(
          (p) => p.teamId === team.id,
        ).map((p) => p.id);
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
  }, [teams, games, players, userTeamId, lastExploreTime, explorePool, currentWeek, isPlayoffs, playoffBracket, playoffRound, activePlayoffGame, playoffQuarter, playoffGameScores, playoffGameStatus]);

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

  const startNextSeason = () => {
    // 1. Reset Stats & Playoff Status
    const resetTeams = teams.map((t) => ({
      ...t,
      stats: { wins: 0, losses: 0 },
    }));
    setIsPlayoffs(false);
    setPlayoffRound(0);
    setPlayoffBracket([]);

    // 2. Identify bottom 10 teams based on FINAL stats (wins)
    const sortedByOldPerf = [...teams].sort(
      (a, b) => a.stats.wins - b.stats.wins,
    );
    const bottom10Ids = sortedByOldPerf.slice(0, 10).map((t) => t.id);

    // 3. Create 10 new custom draft players (90-95 OVR)
    const newDraftPlayers: Player[] = bottom10Ids.map((tid, idx) => {
      const rating = Math.floor(Math.random() * 6) + 90; // 90-95 OVR
      const positions: Player["position"][] = ["PG", "SG", "SF", "PF", "C"];
      const pos = positions[Math.floor(Math.random() * positions.length)];
      
      return {
        id: `draft-${Date.now()}-${idx}`,
        name: generateRandomName(),
        teamId: tid,
        position: pos,
        rating: rating,
        offense: rating + 2,
        defense: rating - 2,
        isSuperstar: true,
        price: 0,
        stats: { ppg: 0, rpg: 0, apg: 0, spg: 0, bpg: 0, games: 0 },
        stamina: 100,
        endurance: 0.8 + Math.random() * 0.4,
        color: GET_RATING_COLOR(rating),
        equipment: [],
      };
    });

    // 4. Update Global Players & Teams (handling roster cleanup if > 15)
    let updatedPlayers = [...players, ...newDraftPlayers];
    const finalTeams = resetTeams.map((team) => {
      let teamRoster = updatedPlayers.filter((p) => p.teamId === team.id);

      if (teamRoster.length > 15) {
        const sortedRoster = [...teamRoster].sort(
          (a, b) => a.rating - b.rating,
        );
        const toRelease = sortedRoster.slice(0, teamRoster.length - 15);
        const toReleaseIds = toRelease.map((p) => p.id);

        updatedPlayers = updatedPlayers.map((p) =>
          toReleaseIds.includes(p.id) ? { ...p, teamId: "FA" } : p,
        );
        teamRoster = updatedPlayers.filter((p) => p.teamId === team.id);
      }

      return {
        ...team,
        roster: teamRoster.map((p) => p.id),
        lineup: teamRoster
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 5)
          .map((p) => p.id),
      };
    });

    setTeams(finalTeams);
    setPlayers(updatedPlayers);
    setGames([]); // Reset schedule
    setCurrentWeek(1); // Back to week 1
    
    setNews(
      "🏀 賽季圓滿結束！墊底的 10 支球隊已獲得評價 90-95 的超級新星！新賽季正式開打！",
    );
  };


  const simulatePlayoffQuarter = async () => {
    if (!activePlayoffGame || isQuarterSimulating) return;
    setIsQuarterSimulating(true);
    
    // Calculate quarter performance based on OVR with more realistic scoring and lineup penalty
    const homePool = players.filter(p => activePlayoffGame.home.lineup?.includes(p.id));
    const awayPool = players.filter(p => activePlayoffGame.away.lineup?.includes(p.id));
    
    const homeOVR = calculateTeamOVR(homePool.length >= 5 ? homePool : players.filter(p => p.teamId === activePlayoffGame.home.id).slice(0,5));
    const awayOVR = calculateTeamOVR(awayPool.length >= 5 ? awayPool : players.filter(p => p.teamId === activePlayoffGame.away.id).slice(0,5));
    
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

    // Stamina decay and Auto-Substitution logic
    setPlayers(prev => prev.map(p => {
      const isHome = p.teamId === activePlayoffGame.home.id;
      const isAway = p.teamId === activePlayoffGame.away.id;
      if (!isHome && !isAway) return p;
      
      const team = isHome ? activePlayoffGame.home : activePlayoffGame.away;
      let lineup = team.lineup || [];
      const isStarter = lineup?.includes(p.id);
      
      // 1. Calculate decay
      const decay = (isStarter ? 6 : 3) * (p.endurance || 1);
      let newStamina = Math.max(0, p.stamina - decay);
      
      // 2. Auto-Substitution Logic (ONLY for CPU teams)
      if (p.teamId !== userTeamId) {
          const threshold = isPlayoffs ? 80 : 70;
          
          // Forced substitution if stamina < 60
          if (newStamina < 60 && isStarter) {
            lineup = lineup.filter(id => id !== p.id);
            // Find best bench player (highest rating)
            const benchPlayers = prev.filter(bp => bp.teamId === p.teamId && !lineup.includes(bp.id));
            if (benchPlayers.length > 0) {
                const bestBench = benchPlayers.sort((a,b) => b.rating - a.rating)[0];
                lineup.push(bestBench.id);
            }
          }
          // Strategic substitution if stamina < threshold
          else if (newStamina < threshold && isStarter) {
             // Try finding same position bench player
             const samePosBench = prev.filter(bp => bp.teamId === p.teamId && !lineup.includes(bp.id) && bp.position === p.position);
             if (samePosBench.length > 0) {
                 lineup = lineup.filter(id => id !== p.id);
                 lineup.push(samePosBench.sort((a,b) => b.rating - a.rating)[0].id);
             }
          }
          
          // Update team lineup
          if (isHome) {
            activePlayoffGame.home.lineup = lineup;
          } else {
            activePlayoffGame.away.lineup = lineup;
          }
      }
      
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
      
      const allPlayerUpdates: { id: string, staminaChange: number }[] = [];
      const gamePairs: { home: Team; away: Team; result: GameResult }[] = [];

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

            const staminaThreshold = isPlayoffs ? 0.8 : 0.7; // 80% playoff, 70% reg
            const starters = teamRoster.filter(p => newLineup.includes(p.id));
            const reserves = teamRoster.filter(p => !newLineup.includes(p.id));
            
            // 處理換人邏輯
            starters.forEach(star => {
              let shouldSwap = false;
              let bestReserve: Player | undefined;

              // 體力 < 60%：緊急強制換人（不考慮位置）
              if (star.stamina < 60) {
                 shouldSwap = true;
                 bestReserve = reserves.sort((a,b) => b.rating - a.rating)[0];
              } 
              // 體力 < 門檻：按位置換人
              else if (star.stamina < (staminaThreshold * 100)) {
                 const freshReserves = reserves.filter(r => r.position === star.position && r.stamina > 85);
                 if (freshReserves.length > 0) {
                    shouldSwap = true;
                    bestReserve = freshReserves.sort((a,b) => b.rating - a.rating)[0];
                 }
              }

              if (shouldSwap && bestReserve) {
                 newLineup = newLineup.map(id => id === star.id ? bestReserve.id : id);
                 // 重新整理現有板凳清單
                 const resIdx = reserves.findIndex(r => r.id === bestReserve.id);
                 if(resIdx > -1) reserves.splice(resIdx, 1);
                 reserves.push(star);
              }
            });

            // Ensure lineup is valid: Optimization towards 1C, 2F, 2G
            const optimizeLineup = (currentIds: string[]) => {
               const rosterPlayers = teamRoster.filter(p => currentIds.includes(p.id));
               let c = rosterPlayers.filter(p => p.position === 'C');
               let f = rosterPlayers.filter(p => p.position === 'SF' || p.position === 'PF');
               let g = rosterPlayers.filter(p => p.position === 'PG' || p.position === 'SG');

               // 若位置不足，嘗試從板凳補強該位置
               const fillVoid = (category: string[], targetCount: number, available: Player[]) => {
                   if (category.length < targetCount && available.length > 0) {
                      const needed = targetCount - category.length;
                      const bestAvailable = available.sort((a,b) => b.rating - a.rating).slice(0, needed);
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

            // AI Recruitment: Occasional talent search for weak teams
            if (teamAvg < 88 && t.budget > 10000000 && Math.random() > 0.7) {
              const faPool = newPlayers.filter(p => p.teamId === 'FA' && p.rating > teamAvg + 5);
              const target = faPool.sort((a,b) => b.rating - a.rating)[0];
              if (target && t.budget >= target.price) {
                // Perform sign
                updatedTeam.budget -= target.price;
                updatedTeam.roster = [...updatedTeam.roster, target.id];
                newPlayers = newPlayers.map(p => p.id === target.id ? { ...p, teamId: t.id } : p);
                console.log(`[AI] ${t.name} signed ${target.name}`);
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

    // Pick 3 random free agent players (not in any team)
    const faPlayers = players.filter((p) => p.teamId === "FA");
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
              alert("先發名單最多只能有 5 人！請先將其他球員移至候補。");
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
      alert(`球隊人數已達上限 (${MAX_ROSTER_SIZE}人)！請先釋出球員。`);
      return;
    }

    if (userTeam.budget < player.price) {
      alert("經費不足！請繼續模擬賽季賺取獎金。");
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
  };

  const releasePlayer = (playerId: string) => {
    const player = players.find((p) => p.id === playerId);
    if (!player || !userTeam) {
      setReleaseConfirmId(null);
      return;
    }

    if (userRoster.length <= MIN_ROSTER_SIZE) {
      alert(`球隊人數不能少於 ${MIN_ROSTER_SIZE} 人！`);
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
      alert("預算不足！");
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
          const existingOfSameType = currentGear.find(
            (g) => g.type === item.type,
          );

          let baselineOff = p.offense;
          let baselineDef = p.defense;

          if (existingOfSameType) {
            baselineOff -= existingOfSameType.bonus.offense || 0;
            baselineDef -= existingOfSameType.bonus.defense || 0;
          }

          const filteredGear = currentGear.filter((g) => g.type !== item.type);
          const newEquipment = [...filteredGear, item];

          const finalOffense = baselineOff + (item.bonus.offense || 0);
          const finalDefense = baselineDef + (item.bonus.defense || 0);
          const finalRating = (finalOffense + finalDefense) / 2;

          return {
            ...p,
            equipment: newEquipment,
            offense: finalOffense,
            defense: finalDefense,
            rating: finalRating,
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed inset-y-0 shadow-2xl z-20">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
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
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <item.icon size={18} />
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
              <div className="font-bold text-sm">{userTeam?.name}</div>
            </div>
          </div>
          <button
            onClick={resetGame}
            className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-red-400 text-xs transition-colors py-2"
          >
            <RotateCcw size={14} />
            <span>重設所有遊戲數據</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
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
                  <button
                    onClick={() => {
                      const nextMatch = getNextPlayoffMatch();
                      if (nextMatch) startPlayoffGame(nextMatch);
                    }}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-6 rounded-[28px] font-black italic uppercase text-sm transition-all flex items-center justify-center gap-3"
                  >
                    <Basketball className="text-orange-500" />
                    下一場季後賽:{" "}
                    {getNextPlayoffMatch()?.home.abbreviation || "N/A"} VS{" "}
                    {getNextPlayoffMatch()?.away.abbreviation || "N/A"}
                  </button>
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
                  onClick={autoGenerateNews}
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
                               <img src={p.avatar} className="w-12 h-12 rounded-full bg-slate-100" alt="avatar" />
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
                                      if (currentLineup.length >= 5) return alert("先發限制 5 人");
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
                           <img src={activePlayoffGame.home.logo} className="w-40 h-40 mx-auto drop-shadow-[0_20px_30px_rgba(0,0,0,0.1)]" alt="logo" />
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
                           <img src={activePlayoffGame.away.logo} className="w-40 h-40 mx-auto drop-shadow-[0_20px_30px_rgba(0,0,0,0.1)]" alt="logo" />
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
                        <div className="grid grid-cols-5 gap-3">
                          {players.filter(p => activePlayoffGame.home.lineup?.includes(p.id)).slice(0,5).map(p => (
                            <div key={p.id} className="relative group flex flex-col items-center">
                              <div className="w-full aspect-square bg-white rounded-2xl border-2 border-slate-100 flex flex-col items-center justify-center gap-1 overflow-hidden relative shadow-sm hover:border-blue-200 transition-colors">
                                <img src={p.avatar} className="w-10 h-10 rounded-full" alt="p" />
                                <div className="text-[10px] font-black text-slate-900">OVR {p.rating}</div>
                                <div className={`absolute bottom-0 left-0 right-0 h-1.5 ${p.stamina > 70 ? 'bg-emerald-500' : p.stamina > 40 ? 'bg-orange-500' : 'bg-red-500'}`} style={{ width: `${p.stamina}%` }}></div>
                              </div>
                              <div className="mt-2 text-[9px] font-black text-slate-500 uppercase truncate w-full text-center px-1">{p.name.split(' ').pop()}</div>
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
                         <div className="grid grid-cols-5 gap-3">
                          {players.filter(p => activePlayoffGame.away.lineup?.includes(p.id)).slice(0,5).map(p => (
                            <div key={p.id} className="flex flex-col items-center">
                              <div className="w-full aspect-square bg-slate-50/50 rounded-2xl border-2 border-slate-100 flex flex-col items-center justify-center gap-1 opacity-70 relative overflow-hidden shadow-sm">
                                <img src={p.avatar} className="w-10 h-10 rounded-full grayscale" alt="p" />
                                <div className="text-[10px] font-black text-slate-400">OVR {p.rating}</div>
                              </div>
                              <div className="mt-2 text-[9px] font-black text-slate-400 uppercase truncate w-full text-center px-1">{p.name.split(' ').pop()}</div>
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
                            return alert("兩隊先發陣容皆須滿 5 人方可開賽");
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
                        <div className="space-y-2">
                          <div className="text-5xl font-black text-white italic tracking-tighter">
                            {formatTime(timeToNextExplore)}
                          </div>
                          <p className="text-slate-500 font-bold max-w-xs mx-auto">
                            正在分析聯盟球探報告，請稍後再次探索...
                          </p>
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
                      <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-20 text-center shadow-sm">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Users className="text-slate-100" size={40} />
                        </div>
                        <h3 className="font-black text-2xl text-slate-900 mb-2 uppercase italic tracking-tight italic">
                          尚無探索結果
                        </h3>
                        <p className="text-slate-400 font-bold max-w-sm mx-auto">
                          當冷卻時間結束後，點擊上方按鈕開始全聯盟範圍的球員探索。
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                                簽約球員 ($${(p.price / 1000000).toFixed(1)}M)
                              </button>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {EQUIPMENT_MARKET.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border-2 border-slate-100 rounded-3xl p-6 hover:shadow-xl transition-all relative group"
                    >
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-50 transition-colors">
                        <item.icon
                          size={32}
                          className="text-slate-400 group-hover:text-orange-500"
                        />
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
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 flex flex-1 items-center gap-4 focus-within:border-blue-500 transition-colors w-full">
                  <Search className="text-slate-400" />
                  <input
                    type="text"
                    value={librarySearch}
                    onChange={(e) => setLibrarySearch(e.target.value)}
                    placeholder="搜尋全聯盟球星資料庫..."
                    className="bg-transparent border-none outline-none w-full font-bold text-slate-900"
                  />
                </div>
                <div className="bg-slate-900 px-8 py-6 rounded-3xl text-white flex items-center gap-6 shadow-xl">
                  <div className="text-center">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">球員總數</div>
                    <div className="text-2xl font-black italic">{players.filter(p => !p.id.startsWith('rp-')).length} 傳奇/球星</div>
                  </div>
                  <div className="w-px h-10 bg-slate-800"></div>
                  <div className="text-center">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">已取得</div>
                    <div className="text-2xl font-black italic text-blue-400">{players.filter(p => collectedPlayerIds.includes(p.id)).length}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {players
                  .filter(p => !p.id.startsWith('rp-')) 
                  .filter(p => p.name.toLowerCase().includes(librarySearch.toLowerCase()) || p.position.toLowerCase().includes(librarySearch.toLowerCase()))
                  .sort((a, b) => b.rating - a.rating)
                  .slice(0, 650).map((p) => (
                  <PlayerCard 
                    key={p.id} 
                    player={p} 
                    isObtained={true}
                    teamName={p.teamId === 'FA' ? '自由市場' : teams.find(t => t.id === p.teamId)?.name}
                  />
                ))}
              </div>
              
              {players.filter(p => !p.id.startsWith('rp-') && p.name.toLowerCase().includes(librarySearch.toLowerCase())).length > 650 && (
                <div className="text-center py-10">
                  <p className="text-slate-400 font-bold italic">僅顯示前 650 名匹配球員...</p>
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
                        <img src={t.logo} className="w-16 h-16" alt={t.name} />
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
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSelectedGearPlayerId(null)}
          ></div>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-xl bg-white rounded-[40px] p-10 shadow-2xl"
          >
            <h3 className="text-3xl font-black text-slate-900 italic mb-8 uppercase">
              選擇裝備球員
            </h3>
            <div className="grid grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto mb-8 pr-2 custom-scrollbar">
              {userRoster.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    const item = EQUIPMENT_MARKET.find((i) => i.id === selectedGearPlayerId);
                    if (item) buyEquipment(p.id, item);
                    setSelectedGearPlayerId(null);
                  }}
                  className="flex items-center gap-4 p-4 bg-slate-50 hover:bg-blue-50 rounded-2xl border-2 border-slate-100 hover:border-blue-200 transition-all text-left"
                >
                  <img src={p.avatar} className="w-10 h-10 rounded-full" alt="p" />
                  <div>
                    <div className="font-black text-slate-800 text-xs">
                      {p.name}
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 italic">
                      OVR {Math.round(p.rating)}
                    </div>
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
