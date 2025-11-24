import React, { useState, useEffect } from 'react';
import { 
  X, Clock, Shield, Image as ImageIcon, CheckCircle, 
  Edit2, Check, Send, AlignLeft,
  // NUEVOS ICONOS DEPORTIVOS
  Volleyball,  // Voleibol
  Dribbble,    // Baloncesto (El icono de Dribbble es un balón de basket)
  Goal,        // Futsal/Fútbol (Portería)
  Dumbbell,    // Físico
  Trophy,      // Tenis/Competencia
  MoreHorizontal // Otro
} from 'lucide-react';
import Button from '../common/Button';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// --- CONSTANTES ACTUALIZADAS ---
const SPORT_OPTIONS = [
  { id: 'Voleibol', label: 'Voleibol', icon: Volleyball },
  { id: 'Baloncesto', label: 'Basket', icon: Dribbble }, // Dribbble se ve como un balón
  { id: 'Futsal', label: 'Futsal', icon: Goal }, // Goal es una portería
  { id: 'Físico', label: 'Físico', icon: Dumbbell },
  { id: 'Tenis', label: 'Tenis', icon: Trophy },
  { id: 'Otro', label: 'Otro', icon: MoreHorizontal }, 
];

const PRESET_BANNERS = [
  "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&q=80&w=1000", 
  "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=1000", 
  "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=1000", 
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2093&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop"  
];

const toTimeString = (date) => {
    if (!date) return "00:00";
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};

const BookingFormPanel = ({ draftData, onClose, onSubmit, onManualTimeChange }) => {
  const { user } = useAuth();
  const [myTeams, setMyTeams] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sportType: 'Voleibol',
    selectedTeams: [], 
    banner: PRESET_BANNERS[0] 
  });

  const [isEditingTime, setIsEditingTime] = useState(false);
  const [tempStartTime, setTempStartTime] = useState("");
  const [tempEndTime, setTempEndTime] = useState("");

  useEffect(() => {
      if (draftData.start && draftData.end) {
          setTempStartTime(toTimeString(draftData.start));
          setTempEndTime(toTimeString(draftData.end));
      }
  }, [draftData]);

  useEffect(() => {
      const fetchMyTeams = async () => {
          if (user) {
              try {
                  const response = await api.get(`/teams?userId=${user.id}`);
                  setMyTeams(response.data);
              } catch (error) {
                  console.error("Error cargando equipos", error);
              }
          }
      };
      fetchMyTeams();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleTeam = (teamName) => {
      setFormData(prev => {
          const currentTeams = prev.selectedTeams;
          if (currentTeams.includes(teamName)) {
              return { ...prev, selectedTeams: currentTeams.filter(t => t !== teamName) };
          } else {
              return { ...prev, selectedTeams: [...currentTeams, teamName] };
          }
      });
  };

  const handleSaveTime = () => {
      if (onManualTimeChange) onManualTimeChange(tempStartTime, tempEndTime);
      setIsEditingTime(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      start: draftData.start,
      end: draftData.end
    });
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 text-slate-200 animate-in slide-in-from-right-10 duration-300 border-l-4 border-orange-500">
      
      {/* HEADER */}
      <div className="relative h-40 flex-shrink-0 bg-slate-950 group">
        <img 
            src={formData.banner || "https://via.placeholder.com/800x400?text=Sin+Imagen"} 
            className="w-full h-full object-cover opacity-40 transition-opacity group-hover:opacity-50" 
            alt="Preview"
            onError={(e) => e.target.src = "https://via.placeholder.com/800x400?text=Error+URL"}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
        
        <button onClick={onClose} className="absolute top-4 right-4 bg-black/40 hover:bg-red-600 text-white p-2 rounded-full backdrop-blur-sm transition-all z-10">
          <X size={18} />
        </button>

        <div className="absolute bottom-4 left-6 right-6 flex justify-between items-end">
           <div>
             <span className="text-orange-500 text-[10px] font-bold uppercase tracking-widest mb-0.5 block">Nueva Solicitud</span>
             <h2 className="text-xl font-black text-white italic uppercase leading-none">Crear Reserva</h2>
           </div>
           <button onClick={handleSubmit} className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold uppercase py-2 px-4 rounded shadow-lg shadow-orange-900/50 flex items-center gap-2 transition-all hover:translate-y-[-1px]">
              Enviar <Send size={12} />
           </button>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
         <div className="space-y-6">
            
            {/* 1. SECCIÓN HORARIO */}
            <div className="relative">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Horario</label>
                {!isEditingTime ? (
                    <div onClick={() => setIsEditingTime(true)} className="bg-slate-950 border border-orange-900/30 hover:border-orange-500 rounded-lg p-3 relative overflow-hidden cursor-pointer group transition-all">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 group-hover:bg-orange-400 transition-colors"></div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 text-orange-500">
                                <Clock size={16} />
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase leading-none">Fecha</span>
                                    <span className="text-white font-mono text-xs font-bold leading-tight">{draftData.start?.toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-2 justify-end">
                                    <p className="text-white font-mono text-lg font-black tracking-tighter group-hover:text-orange-500 transition-colors">
                                        {toTimeString(draftData.start)} - {toTimeString(draftData.end)}
                                    </p>
                                    <Edit2 size={12} className="text-slate-600 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all"/>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-800 border border-orange-500 rounded-lg p-3 animate-in zoom-in-95 duration-200">
                        <div className="grid grid-cols-2 gap-3">
                            <div><label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Inicio</label><input type="time" value={tempStartTime} onChange={(e) => setTempStartTime(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-white font-mono text-sm p-1.5 rounded focus:border-orange-500 focus:outline-none"/></div>
                            <div><label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Fin</label><input type="time" value={tempEndTime} onChange={(e) => setTempEndTime(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-white font-mono text-sm p-1.5 rounded focus:border-orange-500 focus:outline-none"/></div>
                        </div>
                        <div className="flex justify-end gap-2 mt-3">
                            <Button variant="secondary" onClick={() => setIsEditingTime(false)} className="py-0.5 px-2 text-[10px] h-7">Cancelar</Button>
                            <button type="button" onClick={handleSaveTime} className="bg-orange-600 hover:bg-orange-700 text-white py-0.5 px-3 h-7 rounded text-[10px] font-bold uppercase flex items-center gap-1 transition-colors"><Check size={12}/> OK</button>
                        </div>
                    </div>
                )}
            </div>

            {/* 2. TÍTULO */}
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Título</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Ej: Partido de Práctica" className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded p-2 focus:border-orange-500 focus:outline-none font-bold" required/>
            </div>

            {/* 3. DEPORTES (ICONOS MEJORADOS) */}
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Actividad</label>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar snap-x">
                    {SPORT_OPTIONS.map((sport) => {
                        const Icon = sport.icon;
                        const isSelected = formData.sportType === sport.id;
                        return (
                            <div key={sport.id} onClick={() => setFormData(prev => ({ ...prev, sportType: sport.id }))} className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 cursor-pointer snap-start flex flex-col items-center justify-center gap-1 transition-all duration-150 ${isSelected ? 'bg-slate-800 border-orange-500 shadow-lg shadow-orange-900/20' : 'bg-slate-900 border-slate-800 hover:border-slate-600'}`}>
                                <Icon size={20} className={isSelected ? 'text-orange-500' : 'text-slate-500'} strokeWidth={isSelected ? 2.5 : 2}/>
                                <span className={`text-[9px] font-bold uppercase leading-none ${isSelected ? 'text-white' : 'text-slate-500'}`}>{sport.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 4. EQUIPOS */}
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex justify-between">
                    <span>Equipos</span>
                    <span className="text-orange-500 text-[10px]">Multi-select</span>
                </label>
                {myTeams.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                        {myTeams.map((team) => {
                            const isSelected = formData.selectedTeams.includes(team.name);
                            return (
                                <div key={team.id} onClick={() => toggleTeam(team.name)} className={`relative p-2 rounded border cursor-pointer flex items-center justify-between transition-all ${isSelected ? 'bg-slate-800 border-orange-500' : 'bg-slate-900 border-slate-700 hover:border-slate-500'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center overflow-hidden border ${isSelected ? 'border-orange-500' : 'border-slate-600'}`}>
                                            {team.logo ? <img src={team.logo} className="w-full h-full object-cover"/> : <Shield size={12} className={isSelected ? 'text-white' : 'text-slate-500'}/>}
                                        </div>
                                        <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-400'}`}>{team.name}</span>
                                    </div>
                                    {isSelected && <CheckCircle size={14} className="text-orange-500" />}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-xs text-slate-500 italic border border-dashed border-slate-800 p-2 rounded text-center">No tienes equipos registrados.</p>
                )}
            </div>

            {/* 5. DESCRIPCIÓN (GRANDE) */}
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                    <AlignLeft size={14} /> Notas / Descripción
                </label>
                <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    rows="5" 
                    placeholder="Describe el propósito del evento, requerimientos especiales, etc..." 
                    className="w-full bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded p-3 focus:border-orange-500 focus:outline-none resize-none leading-relaxed"
                />
            </div>

            {/* 6. BANNERS */}
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Estilo Visual</label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                    {PRESET_BANNERS.map((url, idx) => (
                        <div key={idx} onClick={() => setFormData(prev => ({ ...prev, banner: url }))} className={`relative h-14 rounded border-2 cursor-pointer overflow-hidden transition-all ${formData.banner === url ? 'border-orange-500 opacity-100 scale-105' : 'border-transparent opacity-50 hover:opacity-80'}`}>
                            <img src={url} className="w-full h-full object-cover" alt={`Preset ${idx}`} />
                            {formData.banner === url && <div className="absolute inset-0 bg-orange-500/20 flex items-center justify-center"><CheckCircle size={14} className="text-white drop-shadow-md" /></div>}
                        </div>
                    ))}
                </div>
                <div className="relative group">
                    <ImageIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-500 transition-colors"/>
                    <input type="text" name="banner" value={formData.banner} onChange={handleChange} placeholder="O PEGA TU URL AQUÍ..." className="bg-slate-900 border border-slate-700 py-2 pl-9 pr-4 text-[10px] font-mono text-white focus:border-orange-500 focus:outline-none w-full rounded-sm transition-all placeholder:text-slate-600"/>
                </div>
            </div>

         </div>
      </div>
    </div>
  );
};

export default BookingFormPanel;
