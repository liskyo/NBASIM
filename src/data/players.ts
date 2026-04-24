import { Player } from '../types';
import { GET_RATING_COLOR, CALCULATE_PLAYER_PRICE } from '../constants';
import { generateRandomName } from '../lib/names';

import nbaRaw from './nba_player_ids.json'; 
import legendsRaw from './legends.json'; 
import activeRaw from './active_rosters_new.json'; // 💡 引入新的現役名單

// --- 1. 名稱標準化工具 (確保 100% 匹配照片) ---
const normalize = (n: string) => n
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "") 
  .replace(/\s*\(.*?\)\s*/g, '')   
  .replace(/[.'-]/g, '')           
  .trim();

// --- 2. 建立 ID 快速索引 (僅保留 NBA 官方完整名單) ---
const nbaLookup = (nbaRaw as any).default || nbaRaw;
const normalizedNbaMap = new Map(Object.entries(nbaLookup).map(([k, v]) => [normalize(k), v as string]));

// 僅從 NBA 官方 ID 檔提取真實姓名清單
const allRealNames = Array.from(new Set(Object.keys(nbaLookup)));
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
const LEGEND_PLAYERS = (legendsData as any[]).map((l, index) => {
  const rank = index + 1;
  let buff = 3;
  if (rank <= 10) buff = 7;
  else if (rank <= 30) buff = 6;
  else if (rank <= 50) buff = 5;
  else if (rank <= 70) buff = 4;
  
  const rating = Math.max(97, l.rating + buff); 
  USED_NAMES.add(l.name);
  return {
    ...l,
    rating,
    offense: l.offense + buff,
    defense: l.defense + buff,
    color: GET_RATING_COLOR(rating),
    price: CALCULATE_PLAYER_PRICE(rating, true)
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

// 1. 計算還需要補充多少名自由球員 (總數 1500 扣掉傳奇與現役)
const targetFACount = 1500 - LEGEND_PLAYERS.length - ACTIVE_PLAYERS.length;

// 2. 依照你的要求比例分配能力值 (總計約 1100 多人)
const tier1Count = Math.round(targetFACount * (100 / 1100)); // 90-95 分 (約 100 人)
const tier2Count = Math.round(targetFACount * (600 / 1100)); // 85-89 分 (約 600 人)
const tier3Count = targetFACount - tier1Count - tier2Count;  // 80-84 分 (約 400 人)

const faRatings: number[] = [];
for(let i = 0; i < tier1Count; i++) faRatings.push(90 + Math.floor(Math.random() * 6)); // 90-95
for(let i = 0; i < tier2Count; i++) faRatings.push(85 + Math.floor(Math.random() * 5)); // 85-89
for(let i = 0; i < tier3Count; i++) faRatings.push(80 + Math.floor(Math.random() * 5)); // 80-84

// 3. 將數值陣列打亂 (洗牌)，確保高分與低分球員隨機出現
faRatings.sort(() => Math.random() - 0.5);

for (let i = 0; i < targetFACount; i++) {
  const r = faRatings[i];
  
  // 💡 動態模擬合理數據：分數越高的人，場均得分 (ppg) 等數據也會越高
  const simulatedPpg = parseFloat(((r - 70) * 0.8 + Math.random() * 6).toFixed(1));
  const simulatedRpg = parseFloat(((r - 70) * 0.3 + Math.random() * 3).toFixed(1));
  const simulatedApg = parseFloat(((r - 70) * 0.2 + Math.random() * 3).toFixed(1));

  FA_PLAYERS.push({
    id: `fa-${USED_NAMES.size}`,
    name: pickRealName(),
    teamId: 'FA',
    position: POSITIONS[i % 5],
    rating: r,
    offense: r + Math.floor(Math.random() * 4),
    defense: r - Math.floor(Math.random() * 4),
    stats: { ppg: simulatedPpg, rpg: simulatedRpg, apg: simulatedApg, spg: 1.0, bpg: 0.8 },
    color: GET_RATING_COLOR(r),
    price: CALCULATE_PLAYER_PRICE(r)
  });
}

const ALL_DATA = [...LEGEND_PLAYERS, ...ACTIVE_PLAYERS, ...FA_PLAYERS];

// --- 6. 最終初始化與圖片映射 (讓所有人都有機會抓官方圖) ---
export const INITIAL_PLAYERS: Player[] = ALL_DATA.map(p => {
  const searchKey = normalize(p.name);
  const nbaId = normalizedNbaMap.get(searchKey);

  let finalUrl = p.avatarUrl;
  
  // 1. 如果沒有自訂圖片，先統一嘗試配對 NBA 官方圖庫
  if (!finalUrl || finalUrl.includes('silhouette')) {
    if (nbaId) {
      finalUrl = `https://cdn.nba.com/headshots/nba/latest/260x190/${nbaId}.png`;
    } 
  }

  return { 
    ...p, 
    avatarUrl: finalUrl, 
    stamina: 100, 
    endurance: 1.0 
  } as Player;
});