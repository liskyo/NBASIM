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
    "dashboard" | "roster" | "league" | "stats" | "market" | "library"
  >("dashboard");
  const [marketSubTab, setMarketSubTab] = useState<"players" | "gear">(
    "players",
  );
  const [selectedGearPlayerId, setSelectedGearPlayerId] = useState<
    string | null
  >(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [isPlayoffs, setIsPlayoffs] = useState(false);
  const [activePlayoffGame, setActivePlayoffGame] = useState<any | null>(null);
  const [isGeneratingNews, setIsGeneratingNews] = useState(false);
  const [playoffQuarter, setPlayoffQuarter] = useState(1);
  const [isQuarterSimulating, setIsQuarterSimulating] = useState(false);
  const [playoffGameStatus, setPlayoffGameStatus] = useState<'playing' | 'halftime' | 'finished' | 'idle'>('idle');
  const [playoffGameScores, setPlayoffGameScores] = useState({ home: 0, away: 0 });

  const [releaseConfirmId, setReleaseConfirmId] = useState<string | null>(null);

  const startPlayoffGame = (match: any) => {
    setActivePlayoffGame(match);
    setPlayoffQuarter(1);
    setPlayoffGameScores({ home: 0, away: 0 });
    setPlayoffGameStatus('playing');
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

  const autoGenerateNews = async () => {
    setIsGeneratingNews(true);
    try {
      const ctx = generateLeagueContext();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `你是一位資深的 NBA 球評，語氣專業且富有感染力。請針對目前的聯盟形勢寫一段簡短的繁體中文新聞報導（約 60-80 字）。
        
        聯盟現狀：
        1. 龍頭球隊：${ctx.leader}
        2. 聯盟第一人：${ctx.topPlayer}
        3. 使用者球隊（${ctx.userTeamName}）目前排名：第 ${ctx.userStanding} 名
        4. 最近三場戰報：${ctx.recentGames || "賽季初暫無戰報"}
        
        請巧妙地融合這些資訊，並給出一句對未來的預測或評論。`,
      });
      setNews(response.text || "昨日戰況激烈，各隊表現出色。");
    } catch (error) {
      console.error("Failed to generate news:", error);
      setNews("聯盟辦公室目前通訊遺失，請稍後再試。");
    } finally {
      setIsGeneratingNews(false);
    }
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

  // Initialize data
  useEffect(() => {
    const savedTeams = localStorage.getItem("nba-gm-teams");
    if (savedTeams) {
      setTeams(JSON.parse(savedTeams));
    } else {
      // Map players to teams initially
      
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
    }

const initialTeams = NBA_TEAMS.map((team) => {
        const teamPlayers = INITIAL_PLAYERS.filter(
          (p) => p.teamId === team.id,
        ).map((p) => p.id);
        return {
          ...team,
          roster: teamPlayers,
          lineup: teamPlayers.slice(0, 5), // Take first 5 as starters
          budget: INITIAL_BUDGET,
        };
      });
      setTeams(initialTeams);
    }

    const savedGames = localStorage.getItem("nba-gm-games");
    if (savedGames) setGames(JSON.parse(savedGames));

    const savedPlayers = localStorage.getItem("nba-gm-players");
    if (savedPlayers) setPlayers(JSON.parse(savedPlayers));

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
  }, [teams, games, players, userTeamId, lastExploreTime, explorePool]);

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
    // 1. Reset Stats
    const resetTeams = teams.map((t) => ({
      ...t,
      stats: { wins: 0, losses: 0 },
    }));

    // 2. Identify bottom 10 teams
    const sortedByOldPerf = [...teams].sort(
      (a, b) => a.stats.wins - b.stats.wins,
    );
    const bottom10Ids = sortedByOldPerf.slice(0, 10).map((t) => t.id);

    // 3. Create 10 new custom draft players (85-95 OVR)
    const newDraftPlayers: Player[] = bottom10Ids.map((tid, idx) => {
      const rating = Math.floor(Math.random() * 11) + 85;
      const positions: Player["position"][] = ["PG", "SG", "SF", "PF", "C"];
      const pos = positions[Math.floor(Math.random() * positions.length)];
      const names = [
        "Alpha",
        "Beta",
        "Gamma",
        "Delta",
        "Epsilon",
        "Zeta",
        "Eta",
        "Theta",
        "Iota",
        "Kappa",
      ];
      return {
        id: `draft-${Date.now()}-${idx}`,
        name: `新秀 ${names[idx]}`,
        teamId: tid,
        position: pos,
        rating: rating,
        offense: rating + 2,
        defense: rating - 2,
        price: 0, // Free draft pick
        stats: { ppg: 0, rpg: 0, apg: 0, spg: 0, bpg: 0 },
        color: GET_RATING_COLOR(rating),
        equipment: [],
      };
    });

    // 4. Update Global Players & Teams (handling roster cleanup if > 15)
    let updatedPlayers = [...players, ...newDraftPlayers];
    const finalTeams = resetTeams.map((team) => {
      let teamRoster = updatedPlayers.filter((p) => p.teamId === team.id);

      // If team has more than 15 players, release the weakest ones
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
    setNews(
      "🏀 新賽季選秀大會圓滿結束！聯盟注入了 10 位評價 85-95 的頂級新秀，墊底球隊已獲得即戰力。準備開啟新的篇章！",
    );
  };


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

  const simulateWeek = async () => {
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
    }
    if (isSimulating) return;

    // Protection: User must have 5 starters
    if (userStarters.length < 5) {
      setNews(
        "🚨 無法開賽：請先進入「球員名單」手動勾選 5 位先發球員！當前先發人數：" +
          userStarters.length,
      );
      setActiveTab("roster");
      return;
    }

    setIsSimulating(true);
    setNews("各球場開賽中，正在即時模擬本週戰報...");

    try {
      // Pick pairs of teams to play
      const finalResults: GameResult[] = [];
      const updatedTeams = [...teams];

      const gamePairs: { home: Team; away: Team; result: GameResult }[] = [];

      // 1. Pre-calculate all final results
      for (let i = 0; i < updatedTeams.length; i += 2) {
        if (i + 1 >= updatedTeams.length) break;
        const home = updatedTeams[i];
        const away = updatedTeams[i + 1];
        const homeStarters = players.filter((p) =>
          (home.lineup || []).includes(p.id),
        );
        const awayStarters = players.filter((p) =>
          (away.lineup || []).includes(p.id),
        );

        // Logical fix: If a team doesn't have 5 starters (common for CPU),
        // use their top 5 highest rated players instead of the entire roster.
        // This ensures the OVR is represented by their best talent, not diluted by bench.
        const getBestPool = (team: Team, starters: Player[]) => {
          if (starters.length >= 5) return starters;
          const allTeamPlayers = players.filter((p) => p.teamId === team.id);

          // Sort by effective rating (base + gear) to pick the REAL best 5
          const withEffective = allTeamPlayers.map((p) => {
            let bonus = 0;
            (p.equipment || []).forEach(
              (e) => (bonus += (e.bonus.offense || 0) + (e.bonus.defense || 0)),
            );
            return { ...p, eff: p.rating + bonus / 2 };
          });

          return withEffective.sort((a, b) => b.eff - a.eff).slice(0, 5);
        };

        const homePool = getBestPool(home, homeStarters);
        const awayPool = getBestPool(away, awayStarters);

        const result = simulateGame(home, homePool, away, awayPool);
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
      setActiveGames(null);
      setIsSimulating(false);
      const nextWeek = currentWeek + 1;
      setCurrentWeek(nextWeek);
      if (nextWeek > 30) {
        setIsPlayoffs(true);
        setNews("🏀 例行賽結束！季後賽正式開打！正在生成對陣圖...");
      } // UI stops spinning here

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
    window.location.reload();
  };

  const handleExplore = () => {
    if (currentTime - lastExploreTime < EXPLORE_COOLDOWN_MS) return;

    // Pick 3 random players not on user team from other teams
    const otherPlayers = players.filter((p) => p.teamId !== userTeamId);
    const shuffled = [...otherPlayers].sort(() => 0.5 - Math.random());
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
              {activeTab === "league" && "聯盟排名"} {activeTab === "league" && (<span className="text-sm ml-3 font-black bg-slate-900 text-white px-3 py-1 rounded-full">{currentWeek} / 30 週</span>)}
              {activeTab === "stats" && "歷史賽績"}
            </h2>
            <p className="text-slate-500 text-sm font-medium">
              NBA 2026 全球職業聯賽管理中心
            </p>
          </div>

          
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
                  {isQuarterSimulating ? '模擬中...' : `開始第 ${playoffQuarter} 節`}
                </button>
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
                  