import React, { useState } from 'react';
import { X } from 'lucide-react';

const PlayerCard = ({ player }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* MINI CARD (EN LISTA) */}
      <div 
        onClick={() => setIsExpanded(true)}
        className="relative group cursor-pointer flex-shrink-0 w-20 h-28 bg-slate-800 rounded-md overflow-hidden border border-slate-700 shadow-md hover:border-orange-500 transition-all duration-300 transform hover:-translate-y-1"
      >
        <img src={player.image} alt={player.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
        <div className="absolute top-1 right-1 bg-orange-600 text-white text-[8px] font-black px-1 rounded-sm">#{player.number}</div>
        <div className="absolute bottom-0 left-0 w-full p-1.5">
           <p className="text-[6px] text-orange-400 font-bold uppercase mb-0.5">{player.position}</p>
           <p className="text-[10px] text-white font-bold leading-none truncate">{player.name}</p>
        </div>
      </div>

      {/* MODAL EXPANDIDO */}
      {isExpanded && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-slate-900 border-2 border-orange-600 rounded-xl overflow-hidden shadow-2xl">
             <button onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }} className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-orange-600 text-white p-2 rounded-full transition-colors"><X size={20} /></button>
             <div className="h-80 w-full relative">
                <img src={player.image} alt={player.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-6">
                   <h2 className="text-4xl font-black text-white italic uppercase drop-shadow-lg">{player.name}</h2>
                   <div className="flex items-center gap-3 mt-2">
                      <span className="bg-orange-600 text-white text-lg font-bold px-3 py-1 skew-x-[-10deg]">#{player.number}</span>
                      <span className="text-slate-300 text-sm font-mono uppercase tracking-widest">{player.position}</span>
                   </div>
                </div>
             </div>
             <div className="p-6 grid grid-cols-3 gap-4 border-t border-slate-800 bg-slate-900">
                <div className="text-center"><p className="text-slate-500 text-[10px] uppercase font-bold">Altura</p><p className="text-white font-mono font-bold">{player.stats?.height}</p></div>
                <div className="text-center border-l border-slate-800"><p className="text-slate-500 text-[10px] uppercase font-bold">Edad</p><p className="text-white font-mono font-bold">{player.stats?.age}</p></div>
                <div className="text-center border-l border-slate-800"><p className="text-slate-500 text-[10px] uppercase font-bold">Partidos</p><p className="text-white font-mono font-bold">12</p></div>
             </div>
          </div>
          <div className="absolute inset-0 -z-10" onClick={() => setIsExpanded(false)} />
        </div>
      )}
    </>
  );
};

export default PlayerCard;
