import React from 'react';
import { Trash2, Edit2, User } from 'lucide-react';

const BigPlayerCard = ({ player, onEdit, onDelete }) => {
  return (
    <div className="group relative w-full aspect-[3/4] bg-slate-900 overflow-hidden border-2 border-slate-800 hover:border-orange-500 transition-all duration-300 shadow-xl hover:shadow-orange-900/20 rounded-sm">
      
      {/* 1. FONDO Y EFECTOS */}
      <div className="absolute inset-0 bg-slate-800">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-500 to-slate-900"></div>
      </div>

      {/* 2. IMAGEN JUGADOR */}
      <div className="absolute inset-0 z-10">
          {player.image ? (
            <img src={player.image} alt={player.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-700"><User size={64}/></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
      </div>

      {/* 3. NÚMERO (DORSAL) */}
      <div className="absolute top-0 left-0 z-20 bg-slate-950 border-r-2 border-b-2 border-orange-600 px-2 py-1 md:px-3 md:py-2 shadow-lg">
          <span className="text-2xl md:text-3xl font-black text-white font-mono leading-none block">
              {player.number}
          </span>
          <span className="text-[6px] md:text-[8px] text-orange-500 font-bold uppercase tracking-widest block text-center">
              POS
          </span>
      </div>

      {/* 4. OVERLAY ACCIONES */}
      <div className="absolute top-2 right-2 z-30 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 duration-300">
          <button onClick={onEdit} className="p-2 bg-slate-950 text-blue-400 hover:text-white border border-slate-700 hover:border-blue-500 rounded-sm shadow-lg"><Edit2 size={14}/></button>
          <button onClick={onDelete} className="p-2 bg-slate-950 text-red-500 hover:text-white border border-slate-700 hover:border-red-500 rounded-sm shadow-lg"><Trash2 size={14}/></button>
      </div>

      {/* 5. INFO INFERIOR */}
      <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 z-20">
          <div className="flex items-center gap-2 mb-1">
             <div className="h-0.5 w-3 md:w-4 bg-orange-500"></div>
             <span className="text-orange-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest truncate">
                  {player.position}
             </span>
          </div>
          
          <h3 className="text-xl md:text-2xl font-black text-white uppercase italic leading-none mb-3 drop-shadow-md truncate">
              {player.name}
          </h3>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-1 border-t border-slate-700/50 pt-2 bg-slate-950/50 backdrop-blur-sm p-1 md:p-2 rounded-sm">
              <div className="text-center">
                  <p className="text-[8px] md:text-[9px] text-slate-400 uppercase font-bold">ALT</p>
                  <p className="text-[10px] md:text-xs text-white font-mono font-bold">{player.stats.height}</p>
              </div>
              <div className="text-center border-l border-slate-700">
                  <p className="text-[8px] md:text-[9px] text-slate-400 uppercase font-bold">EDAD</p>
                  <p className="text-[10px] md:text-xs text-white font-mono font-bold">{player.stats.age}</p>
              </div>
              <div className="text-center border-l border-slate-700">
                  <p className="text-[8px] md:text-[9px] text-slate-400 uppercase font-bold">PJ</p>
                  <p className="text-[10px] md:text-xs text-white font-mono font-bold">12</p>
              </div>
          </div>
      </div>
    </div>
  );
};

export default BigPlayerCard;
