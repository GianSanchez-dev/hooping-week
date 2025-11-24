import React, { useState } from 'react';
import { X, Shield, Users, ChevronDown, ChevronUp, CheckCircle, Calendar } from 'lucide-react';
import PlayerCard from '../ui/PlayerCard';
import Button from '../common/Button';

const EventDetailsPanel = ({ event, onClose }) => {
  // Extraemos con seguridad
  const ext = event.extendedProps || {};
  
  const { description, banner, sportType, bookedBy, approvedBy } = ext;
  
  // Manejo seguro de teams (puede venir como JSON string o array)
  let teams = [];
  if (ext.teams) {
      teams = typeof ext.teams === 'string' ? JSON.parse(ext.teams) : ext.teams;
  }

  const [openTeamIndex, setOpenTeamIndex] = useState(0);

  return (
    <div className="h-full flex flex-col bg-slate-900 text-slate-200 animate-in slide-in-from-right-10 duration-300">
      
      {/* HEADER BANNER */}
      <div className="relative h-48 flex-shrink-0 bg-slate-950">
        <img src={banner || "https://via.placeholder.com/400x200/0f172a/334155?text=Sin+Imagen"} alt="Banner" className="w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-900" />
        
        <button onClick={onClose} className="absolute top-4 right-4 bg-black/40 hover:bg-orange-600 text-white p-2 rounded-full backdrop-blur-sm transition-all z-10"><X size={20} /></button>
        
        <div className="absolute top-4 left-4"><span className="bg-orange-600 text-white text-xs font-black px-3 py-1 uppercase tracking-widest skew-x-[-10deg] shadow-lg">{sportType || 'Evento'}</span></div>
        
        <div className="absolute bottom-4 left-6 right-6">
           <h2 className="text-2xl font-black text-white italic uppercase leading-none mb-2 drop-shadow-lg">{event.title}</h2>
           <div className="flex items-center gap-4 text-xs font-mono text-slate-300">
              <span className="flex items-center gap-1"><Calendar size={12} className="text-orange-500"/> {event.start ? event.start.toLocaleDateString() : ''}</span>
              <span className="flex items-center gap-1"><CheckCircle size={12} className="text-emerald-500"/> {ext.status}</span>
           </div>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
         <div className="mb-8">
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Descripción</h4>
            <p className="text-sm text-slate-300 leading-relaxed border-l-2 border-slate-700 pl-3 italic">{description || "Sin descripción."}</p>
         </div>

         {/* EQUIPOS (AQUI ESTÁ LA CORRECCIÓN DE RENDERIZADO) */}
         {teams.length > 0 && (
           <div className="mb-8">
              <div className="flex items-center gap-2 mb-4"><Users size={16} className="text-orange-500"/><h4 className="text-xs font-bold text-slate-500 uppercase">Equipos & Plantilla</h4></div>
              
              <div className="space-y-3">
                {teams.map((team, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                     <button onClick={() => setOpenTeamIndex(openTeamIndex === idx ? null : idx)} className="w-full flex items-center justify-between p-3 hover:bg-slate-800 transition-colors">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 overflow-hidden">
                               {team.logo ? <img src={team.logo} className="w-full h-full object-cover"/> : <Shield size={14} className="text-slate-500"/>}
                           </div>
                           <span className="font-bold text-white uppercase text-sm">{team.name}</span>
                        </div>
                        {openTeamIndex === idx ? <ChevronUp size={16} className="text-orange-500"/> : <ChevronDown size={16} className="text-slate-500"/>}
                     </button>

                     {/* LISTA DE JUGADORES */}
                     {openTeamIndex === idx && (
                        <div className="p-3 bg-slate-950/50 border-t border-slate-800 overflow-x-auto">
                           <div className="flex gap-3 pb-2">
                              {/* Verificamos si hay jugadores y los mapeamos */}
                              {team.players && team.players.length > 0 ? (
                                 team.players.map((player, pIdx) => (
                                    <PlayerCard key={pIdx} player={player} />
                                 ))
                              ) : (
                                 <div className="w-full text-center py-4 text-xs text-slate-500 italic">
                                    No hay jugadores registrados en este equipo.
                                 </div>
                              )}
                           </div>
                        </div>
                     )}
                  </div>
                ))}
              </div>
           </div>
         )}

         {/* INFO ADMIN */}
         <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-800">
            <div>
               <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Reservado Por</h4>
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-800 rounded-full overflow-hidden border border-slate-700"><img src={bookedBy?.avatar || "https://via.placeholder.com/150"} className="w-full h-full object-cover"/></div>
                  <div><p className="text-white text-xs font-bold">{bookedBy?.name || "Anónimo"}</p></div>
               </div>
            </div>
            <div>
               <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Estado</h4>
               <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${ext.status === 'pending' ? 'border-amber-500 text-amber-500' : 'border-emerald-500 text-emerald-500'}`}>
                      <Shield size={14} />
                  </div>
                  <div><p className="text-white text-xs font-bold uppercase">{ext.status}</p></div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default EventDetailsPanel;
