import React from 'react';
import { Player } from '../types';
import { GET_RATING_COLOR, GET_RATING_LABEL } from '../constants';
import { motion } from 'motion/react';
import { User, Shield, Zap, Trophy as TrophyIcon, Shirt, Footprints, Watch, Square, AlertTriangle } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
  isDetailed?: boolean;
  isObtained?: boolean;
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

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, isDetailed = false, isObtained = true }) => {
  const color = GET_RATING_COLOR(player.rating);
  const label = GET_RATING_LABEL(player.rating);

  // Calculate total gear bonuses for display
  const gearBonusOffense = player.equipment?.reduce((acc, item) => acc + (item.bonus.offense || 0), 0) || 0;
  const gearBonusDefense = player.equipment?.reduce((acc, item) => acc + (item.bonus.defense || 0), 0) || 0;

  // Stamina Effect Calculation (70% - 100%)
  const staminaFactor = 0.7 + (player.stamina / 100) * 0.3;
  const displayRating = (player.rating + (gearBonusOffense + gearBonusDefense) / 2) * staminaFactor;
  const isFatigued = player.stamina < 30;

  return (
    <motion.div
      whileHover={{ y: isObtained ? -5 : 0 }}
      className={`border-2 rounded-3xl p-5 shadow-sm transition-all overflow-hidden relative ${isObtained ? "bg-white" : "bg-slate-50 grayscale opacity-60 contrast-75"}`}
      style={{ 
        borderColor: isObtained ? color + '33' : '#e2e8f0', 
        borderTopColor: isObtained ? color : '#cbd5e1', 
        borderTopWidth: '8px' 
      }}
    >
      <div className="absolute top-2 right-4 opacity-5">
         <span className="text-5xl font-black italic">{player.position}</span>
      </div>
      
      {player.isLegend && (
        <div className="absolute top-0 left-0 bg-yellow-500 text-white text-[10px] font-black px-3 py-1.5 rounded-br-2xl shadow-md z-10 flex items-center gap-1.5 uppercase italic tracking-tighter">
          <TrophyIcon size={12} /> Legend
        </div>
      )}

      {isFatigued && isObtained && (
        <div className="absolute top-2 right-2 bg-red-100 text-red-600 p-1.5 rounded-xl z-10 border border-red-200 animate-pulse">
           <AlertTriangle size={14} />
        </div>
      )}
      
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border-2 border-slate-100 relative group overflow-hidden">
          <User className="text-slate-300 group-hover:scale-110 transition-transform" size={32} />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-100/50 to-transparent"></div>
        </div>
        <div className="flex-1">
          <h3 className="font-black text-slate-800 text-lg leading-tight mb-1">{player.name}</h3>
          <div className="flex flex-wrap items-center gap-2">
             <span className="text-[10px] font-black px-2 py-1 rounded-lg uppercase italic tracking-tighter" style={{ backgroundColor: color + '15', color: color }}>
               {label}
             </span>
             <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg uppercase tracking-widest">{player.position}</span>
          </div>
        </div>
      </div>

      {/* Equipment Icons */}
      <div className="flex flex-wrap gap-2 mb-6 min-h-[32px]">
        {player.equipment?.map((item) => (
          <div 
            key={item.id} 
            title={`${item.name} (${item.level}) +${item.bonus.offense || 0}/${item.bonus.defense || 0}`}
            className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm hover:scale-110 transition-transform cursor-help overflow-hidden"
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
