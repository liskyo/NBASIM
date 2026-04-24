export type PlayerRating = number; // 0-99

export type EquipmentType = 'JERSEY' | 'SHORTS' | 'SHOES' | 'KNEE_PADS' | 'WRISTBAND' | 'HEADBAND';

export interface Equipment {
  id: string;
  type: EquipmentType;
  name: string;
  level: 'Basic' | 'Standard' | 'Pro' | 'Elite' | 'Master' | 'Legendary';
  price: number;
  bonus: {
    offense?: number;
    defense?: number;
  };
  icon: string;
}

export interface Player {
  id: string;
  name: string;
  avatarUrl?: string; // 更新為 avatarUrl
  teamId: string;
  position: 'PG' | 'SG' | 'SF' | 'PF' | 'C';
  rating: PlayerRating;
  offense: number;
  defense: number;
  price: number; // Added: Cost to buy
  stats: {
    ppg: number;
    rpg: number;
    apg: number;
    spg: number;
    bpg: number;
  };
  color: string;
  isLegend?: boolean;
  isSuperstar?: boolean; // 新增此屬性
  equipment?: Equipment[];
  stamina: number; // 0-100
  endurance: number; // 0.5 - 1.5 multiplier for decay
  trainingCount?: number; // 新增：修煉次數
  effectiveRating?: number; // Calculated rating based on stamina and equipment
}

export interface Team {
  id: string;
  name: string;
  city: string;
  abbreviation: string;
  logo: string;
  color: string;
  roster: string[]; // All player IDs
  lineup: string[]; // Added: Starting 5 player IDs
  budget: number; // Added: Team budget
  stats: {
    wins: number;
    losses: number;
  };
}

export interface GameResult {
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  quarters: { [key: string]: number }[];
  date: string;
  playerUpdates?: {
    id: string;
    staminaChange: number;
  }[];
}

export interface Season {
  year: number;
  standings: { teamId: string; wins: number; losses: number }[];
  schedule: GameResult[];
  status: 'Drafting' | 'Regular Season' | 'Playoffs' | 'Offseason';
}
