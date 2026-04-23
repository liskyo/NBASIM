import { Player } from '../types';
import { GET_RATING_COLOR, CALCULATE_PLAYER_PRICE } from '../constants';
import { generateRandomName } from '../lib/names';

import nbaRaw from './nba_player_ids.json'; 
import espnRaw from './espn_player_ids.json'; 
import legendsRaw from './legends.json'; 
import activeRaw from './active_rosters.json'; // 💡 引入新的現役名單

// --- 1. 名稱標準化工具 (確保 100% 匹配照片) ---
const normalize = (n: string) => n
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "") 
  .replace(/\s*\(.*?\)\s*/g, '')   
  .replace(/[.'-]/g, '')           
  .trim();

// --- 2. 建立 ID 快速索引 ---
const nbaLookup = (nbaRaw as any).default || nbaRaw;
const espnLookup = (espnRaw as any).default || espnRaw;
const normalizedNbaMap = new Map(Object.entries(nbaLookup).map(([k, v]) => [normalize(k), v as string]));
const normalizedEspnMap = new Map(Object.entries(espnLookup).map(([k, v]) => [normalize(k), v as string]));

const allRealNames = Array.from(new Set([...Object.keys(nbaLookup), ...Object.keys(espnLookup)]));
const USED_NAMES = new Set<string>();

function pickRealName(): string {
  const available = allRealNames.filter(name => !USED_NAMES.has(name));
  if (available.length === 0) return generateRandomName();
  const picked = available[Math.floor(Math.random() * available.length)];
  USED_NAMES.add(picked);
  return picked;
}

// --- 3. 處理傳奇球員 (Rating 97-99) ---
const legendsData = (legendsRaw as any).default || legendsRaw;
const LEGEND_PLAYERS = (legendsData as any[]).map(l => {
  const rating = Math.max(97, l.rating); // 💡 強制傳奇至少 97 分
  USED_NAMES.add(l.name);
  return {
    ...l,
    rating,
    color: GET_RATING_COLOR(rating),
    price: CALCULATE_PLAYER_PRICE(rating)
  };
});

// --- 4. 處理現役 30 隊名單 (來自 JSON) ---
const activeData = (activeRaw as any).default || activeRaw;
const ACTIVE_PLAYERS = (activeData as any[]).map(p => {
  USED_NAMES.add(p.name);
  return {
    ...p,
    color: GET_RATING_COLOR(p.rating),
    price: CALCULATE_PLAYER_PRICE(p.rating)
  };
});

// --- 5. 生成剩餘自由球員 (補足至 1500 人) ---
const FA_PLAYERS: any[] = [];
const POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C'];

while (LEGEND_PLAYERS.length + ACTIVE_PLAYERS.length + FA_PLAYERS.length < 1500) {
  const r = 65 + Math.floor(Math.random() * 25);
  FA_PLAYERS.push({
    id: `fa-${USED_NAMES.size}`,
    name: pickRealName(),
    teamId: 'FA',
    position: POSITIONS[FA_PLAYERS.length % 5],
    rating: r,
    offense: r + 2,
    defense: r - 2,
    stats: { ppg: 4.0, rpg: 2.0, apg: 1.0, spg: 0.5, bpg: 0.5 },
    color: GET_RATING_COLOR(r),
    price: CALCULATE_PLAYER_PRICE(r)
  });
}

const ALL_DATA = [...LEGEND_PLAYERS, ...ACTIVE_PLAYERS, ...FA_PLAYERS];

// --- 6. 最終初始化與圖片映射 ---
export const INITIAL_PLAYERS: Player[] = ALL_DATA.map(p => {
  const searchKey = normalize(p.name);
  const espnId = normalizedEspnMap.get(searchKey);
  const nbaId = normalizedNbaMap.get(searchKey);

  let finalUrl = p.avatarUrl;
  if (!finalUrl || finalUrl.includes('silhouette')) {
    if (espnId) {
      finalUrl = `https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/${espnId}.png&w=350`;
    } else if (nbaId) {
      finalUrl = `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${nbaId}.png`;
    } else {
      finalUrl = 'https://www.nba.com/assets/img/default-player-silhouette.png';
    }
  }

  const playerObj = { 
    ...p, 
    avatarUrl: finalUrl, 
    stamina: 100, 
    endurance: 1.0 
  } as Player;

  // 🛡️ 鎖定機制：傳奇與高分現役球星
  if (playerObj.isLegend || playerObj.rating >= 95) {
    Object.freeze(playerObj);
  }

  return playerObj;
});