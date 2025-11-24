import React from 'react';
import { Users, Trophy, Shield } from 'lucide-react';

const TeamListItem = ({ team, isSelected, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        group relative w-full h-28 cursor-pointer overflow-hidden transition-all duration-300 border-l-[6px]
        ${isSelected 
          ? 'border-l-orange-500 bg-slate-800' 
          : 'border-l-slate-700 bg-slate-900 hover:bg-slate-800 hover:border-l-slate-500'
        }
      `}
      // Clip path sutil para darle forma tecnológica
      style={{ clipPath: 'polygon(0 0, 100% 0, 100% 80%, 95% 100%, 0 100%)' }}
    >
      {/* 1. IMAGEN DE FONDO (BANNER) */}
      <div className="absolute inset-0 z-0">
         <img 
            src={team.banner} 
            alt="" 
            className={`w-full h-full object-cover opacity-40 transition-transform duration-700 ${isSelected ? 'scale-110' : 'grayscale group-hover:grayscale-0 scale-100'}`}
         />
         {/* DEGRADADO SÓLIDO PARA TEXTO: Soluciona el problema de lectura */}
         <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent"></div>
      </div>

      {/* 2. CONTENIDO */}
      <div className="relative z-10 h-full flex items-center p-4 gap-4">
         {/* Logo */}
         <div className={`
             w-14 h-14 flex items-center justify-center bg-slate-900 border border-slate-700 shadow-lg flex-shrink-0
             transition-transform duration-300 ${isSelected ? 'scale-110 border-orange-500' : 'group-hover:border-slate-500'}
         `}>
             {team.logo ? <img src={team.logo} className="w-full h-full object-cover" alt=""/> : <Shield className="text-slate-600"/>}
         </div>

         {/* Textos */}
         <div className="flex-1 min-w-0">
             <div className="flex items-center gap-2 mb-1">
                <span className="text-[8px] font-black text-white bg-orange-600 px-1.5 py-0.5 uppercase tracking-wider">
                    {team.category}
                </span>
                {isSelected && <span className="text-[8px] font-mono text-orange-400 animate-pulse">EDITANDO</span>}
             </div>
             
             <h3 className={`text-lg font-black italic uppercase leading-none mb-1 truncate ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                 {team.name}
             </h3>
             
             <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500">
                 <span className="flex items-center gap-1"><Users size={10} /> {team.players.length}</span>
                 <span className="flex items-center gap-1 text-emerald-500 font-bold"><Trophy size={10} /> {team.stats.wins}W</span>
             </div>
         </div>
      </div>
    </div>
  );
};

export default TeamListItem;
