// 把原本的 import React from 'react'; 改成下面這樣：
import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import { GET_RATING_COLOR, GET_RATING_LABEL } from '../constants';
import { motion } from 'motion/react';
import { User, Shield, Zap, Trophy as TrophyIcon, Shirt, Footprints, Watch, Square, AlertTriangle } from 'lucide-react';

// 👇 1. 直接引入 src/assets 裡的實體檔案 (Vite 會保證絕對抓得到！)
import fallbackImg1 from '../assets/player/001.jpg';
import fallbackImg2 from '../assets/player/002.jpg';
import fallbackImg3 from '../assets/player/003.jpg';
import fallbackImg4 from '../assets/player/004.jpg';
import fallbackImg5 from '../assets/player/005.jpg';
import fallbackImg6 from '../assets/player/006.jpg';
import fallbackImg7 from '../assets/player/007.jpg';
import fallbackImg8 from '../assets/player/008.jpg';

// 👇 2. 把他們裝進陣列裡備用 (注意索引是 0~7)
const FALLBACK_IMAGES = [
  fallbackImg1, fallbackImg2, fallbackImg3, fallbackImg4, 
  fallbackImg5, fallbackImg6, fallbackImg7, fallbackImg8
];

interface PlayerCardProps {
  player: Player;
  isDetailed?: boolean;
  isObtained?: boolean;
  teamName?: string;
}

const GearIcon = ({ type, level, size = 12 }: { type: string, level: string, size?: number }) => {
  const getLevelColor = (l: string) => {
    switch (l) {
      case 'Legendary': return '#eab308'; // Yellow/Gold
      case 'Master': return '#f97316';    // Orange
      case 'Elite': return '#a855f7';     // Purple
      case 'Pro': return '#3b82f6';       // Blue
      case 'Standard': return '#22c55e';  // Green
      default: return '#94a3b8';          // Slate (Basic)
    }
  };

  const color = getLevelColor(level);

  const iconProps = { size, style: { color } };

  switch (type) {
    case 'JERSEY': return <Shirt {...iconProps} />;
    case 'SHORTS': return <Square {...iconProps} />;
    case 'SHOES': return <Footprints {...iconProps} />;
    case 'KNEE_PADS': return <Shield {...iconProps} />;
    case 'WRISTBAND': return <Watch {...iconProps} />;
    case 'HEADBAND': return <Zap {...iconProps} />;
    default: return null;
  }
};

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, isDetailed = false, isObtained = true, teamName }) => {
  const color = GET_RATING_COLOR(player.rating);
  const label = player.isLegend ? "傳奇人物" : GET_RATING_LABEL(player.rating);

  // Calculate total gear bonuses for display
  const gearBonusOffense = player.equipment?.reduce((acc, item) => acc + (item.bonus.offense || 0), 0) || 0;
  const gearBonusDefense = player.equipment?.reduce((acc, item) => acc + (item.bonus.defense || 0), 0) || 0;

  // Stamina Effect Calculation (70% - 100%)
  const staminaFactor = 0.7 + (player.stamina / 100) * 0.3;
  const displayRating = (player.rating + (gearBonusOffense + gearBonusDefense) / 2) * staminaFactor;
  const isFatigued = player.stamina < 30;

  // Avatar selection logic
  let hash = 0;
  for (let i = 0; i < player.id.length; i++) {
    hash = player.id.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const avatarIndex = Math.abs(hash) % 8; 
  const localFallbackImage = FALLBACK_IMAGES[avatarIndex]; 
  const diceBearAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.id}&backgroundColor=b6e3f4,c0aede,d1d4f9&mood=happy`;

  const isSilhouette = !player.avatarUrl || player.avatarUrl.includes('silhouette');
  const initialImage = isSilhouette ? localFallbackImage : player.avatarUrl;

  const [imgSrc, setImgSrc] = useState(initialImage);

  useEffect(() => {
    setImgSrc(initialImage);
  }, [initialImage]);

  return (
    <motion.div
      whileHover={{ y: isObtained ? -5 : 0 }}
      className={`border-2 rounded-3xl p-5 shadow-sm transition-all overflow-hidden relative ${player.isLegend ? 'bg-gradient-to-br from-red-50 to-white' : 'bg-white'}`}
      style={{ 
        borderColor: player.isLegend ? '#ef4444' : color + '33', 
        borderTopColor: player.isLegend ? '#ef4444' : color, 
        borderTopWidth: '8px',
        boxShadow: player.isLegend ? '0 10px 25px -5px rgba(239, 68, 68, 0.3)' : undefined
      }}
    >
      {/* Diamond Sparkle Effect for Legends */}
      {player.isLegend && (
        <>
          <div 
            className="absolute inset-0 pointer-events-none opacity-30" 
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0l2 18 18 2-18 2-2 18-2-18-18-2 18-2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
              backgroundSize: '40px 40px',
              animation: 'spin-slow 20s linear infinite'
            }} 
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none" 
               style={{ 
                 backgroundSize: '200% 200%',
                 animation: 'shimmer 3s infinite linear'
               }}
          />
        </>
      )}
      
      <div className="absolute top-2 right-4 opacity-5">
         <span className="text-5xl font-black italic">{player.position}</span>
      </div>
      
      {player.isLegend && (
        <div className="absolute top-0 left-0 bg-red-600 text-white text-[10px] font-black px-3 py-1.5 rounded-br-2xl shadow-md z-10 flex items-center gap-1.5 uppercase italic tracking-tighter animate-pulse">
          <TrophyIcon size={12} /> Legend
        </div>
      )}
      
      {!player.isLegend && player.isSuperstar && (
        <div className="absolute top-0 left-0 bg-emerald-500 text-white text-[10px] font-black px-3 py-1.5 rounded-br-2xl shadow-md z-10 flex items-center gap-1.5 uppercase italic tracking-tighter">
           <Zap size={12} />
        </div>
      )}

      {isFatigued && isObtained && (
        <div className="absolute top-2 right-2 bg-red-100 text-red-600 p-1.5 rounded-xl z-10 border border-red-200 animate-pulse">
           <AlertTriangle size={14} />
        </div>
      )}
      
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border-2 border-slate-100 relative group overflow-hidden">
          <User className="fallback-user text-slate-300 group-hover:scale-110 transition-transform" size={32} />
          <img
            src={imgSrc}
            alt={player.name}
            loading="lazy"
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
            onError={() => {
              // Priority 1: NBA Image (initial)
              // Priority 2: Local 001-008.jpg (localFallbackImage)
              // Priority 3: DiceBear (ultimate fallback)
              if (imgSrc === localFallbackImage) {
                setImgSrc(diceBearAvatar);
              } else if (imgSrc !== diceBearAvatar) {
                setImgSrc(localFallbackImage);
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-100/50 to-transparent"></div>
        </div>
        <div className="flex-1">
          <h3 className="font-black text-slate-800 text-lg leading-tight mb-1">{player.name}</h3>
          <div className="flex flex-wrap items-center gap-2">
             <span className="text-[10px] font-black px-2 py-1 rounded-lg uppercase italic tracking-tighter" style={{ backgroundColor: color + '15', color: color }}>
               {label}
             </span>
             <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg uppercase tracking-widest">{player.position}</span>
             {teamName && (
               <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg uppercase tracking-widest">{teamName}</span>
             )}
          </div>
        </div>
      </div>

      {/* Equipment Icons */}
      <div className="flex flex-wrap gap-2 mb-6 min-h-[32px]">
        {player.equipment?.map((item) => (
          <div 
            key={item.id} 
            title={`${item.name} (${item.level}) +${item.bonus.offense || 0}/${item.bonus.defense || 0}`}
            className="w-10 h-10 rounded-xl bg-white border-2 flex items-center justify-center shadow-sm hover:scale-110 transition-all cursor-help overflow-hidden"
            style={{ 
              borderColor: item.level === 'Legendary' ? '#eab308' :
                           item.level === 'Master' ? '#f97316' :
                           item.level === 'Elite' ? '#a855f7' :
                           item.level === 'Pro' ? '#3b82f6' :
                           item.level === 'Standard' ? '#22c55e' : '#e2e8f0'
            }}
          >
            <GearIcon type={item.type} level={item.level} size={20} />
          </div>
        ))}
      </div>

      {/* Stamina Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
           <span className="text-[9px] font-black text-slate-400 uppercase italic">體力 (Stamina)</span>
           <span className={`text-[9px] font-black ${player.stamina < 30 ? 'text-red-500' : 'text-slate-500'}`}>{Math.round(player.stamina)}%</span>
        </div>
        <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden shadow-inner">
           <div 
             className={`h-full transition-all duration-700 ease-out ${player.stamina < 30 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]'}`}
             style={{ width: `${player.stamina}%` }}
           />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-slate-50 p-3 rounded-2xl flex flex-col items-center gap-1 border border-slate-100">
          <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase italic">
            <Zap size={12} className="text-orange-500" />
            <span>進攻</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-black text-lg text-slate-800">{player.offense.toFixed(1)}</span>
            {gearBonusOffense > 0 && <span className="text-[10px] text-emerald-500 font-bold">+{gearBonusOffense.toFixed(1)}</span>}
          </div>
        </div>
        <div className="bg-slate-50 p-3 rounded-2xl flex flex-col items-center gap-1 border border-slate-100">
          <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase italic">
            <Shield size={12} className="text-blue-500" />
            <span>防守</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-black text-lg text-slate-800">{player.defense.toFixed(1)}</span>
            {gearBonusDefense > 0 && <span className="text-[10px] text-emerald-500 font-bold">+{gearBonusDefense.toFixed(1)}</span>}
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
        <div className="flex gap-4">
           <div className="text-center">
             <div className="text-[9px] font-black text-slate-400 uppercase mb-1">PPG</div>
             <div className="font-mono font-bold text-sm text-slate-700">{player.stats.ppg.toFixed(1)}</div>
           </div>
           <div className="text-center">
             <div className="text-[9px] font-black text-slate-400 uppercase mb-1">RPG</div>
             <div className="font-mono font-bold text-sm text-slate-700">{player.stats.rpg.toFixed(1)}</div>
           </div>
           <div className="text-center">
             <div className="text-[9px] font-black text-slate-400 uppercase mb-1">APG</div>
             <div className="font-mono font-bold text-sm text-slate-700">{player.stats.apg.toFixed(1)}</div>
           </div>
        </div>
        <div className="text-3xl font-black italic tracking-tighter" style={{ color: isFatigued ? '#94a3b8' : color }}>
          {displayRating.toFixed(1)}
          {isFatigued && <span className="text-[10px] ml-1 opacity-50 block">▼ FATIGUE</span>}
        </div>
      </div>

      <div className="mt-5 pt-5 border-t border-slate-100 flex items-center justify-between">
         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">身價預估</span>
         <span className="font-black text-slate-800 text-base">
           ${(player.price / 1000000).toFixed(1)}M
         </span>
      </div>
    </motion.div>
  );
};
