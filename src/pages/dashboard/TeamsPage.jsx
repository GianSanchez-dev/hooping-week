import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, Users, Plus, Search, X, Camera, UserPlus, 
  ArrowLeft, Image as ImageIcon, Trash2, Trophy,
  Ruler, Activity
} from 'lucide-react';
import Button from '../../components/common/Button';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// --- CONSTANTES ---
const POSITIONS_BY_SPORT = {
    'Voleibol': ['Setter', 'Libero', 'Rematador', 'Opuesto', 'Bloqueo Central'],
    'Baloncesto': ['Base', 'Escolta', 'Alero', 'Ala-Pívot', 'Pívot'],
    'Fútbol Sala': ['Portero', 'Cierre', 'Ala', 'Pívot'],
    'Handball': ['Portero', 'Extremo', 'Lateral', 'Central', 'Pivote'],
    'default': ['Jugador', 'Capitán', 'Suplente']
};

const TeamsPage = () => {
  const { user } = useAuth();
  
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);

  // Form States
  const [newTeamData, setNewTeamData] = useState({ name: '', category: 'Elite', sport: 'Voleibol', logo: '', banner: '' });
  const [newPlayerData, setNewPlayerData] = useState({ 
      name: '', position: '', number: '', age: '', height: '', image: '' 
  });

  // BÚSQUEDA
  const [searchTerm, setSearchTerm] = useState('');

  const selectedTeam = teams.find(t => t.id === selectedTeamId);
  const currentPositions = selectedTeam 
      ? (POSITIONS_BY_SPORT[selectedTeam.sport] || POSITIONS_BY_SPORT['default'])
      : POSITIONS_BY_SPORT['default'];

  // 1. CARGAR EQUIPOS
  const fetchTeams = async () => {
      if (!user) return;
      try {
          const response = await api.get(`/teams?userId=${user.id}`);
          setTeams(response.data);
          if (!selectedTeamId && response.data.length > 0) {
              setSelectedTeamId(response.data[0].id);
          }
      } catch (error) {
          console.error("Error cargando equipos:", error);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => { fetchTeams(); }, [user]);

  // Filtrado de Equipos (Frontend Instantáneo)
  const filteredTeams = useMemo(() => {
      if (!searchTerm) return teams;
      const lowerTerm = searchTerm.toLowerCase();
      return teams.filter(team => 
          team.name.toLowerCase().includes(lowerTerm) || 
          team.sport.toLowerCase().includes(lowerTerm) ||
          team.category.toLowerCase().includes(lowerTerm)
      );
  }, [teams, searchTerm]);

  // 2. CREAR EQUIPO
  const handleCreateTeam = async (e) => {
      e.preventDefault();
      if (!newTeamData.name) return alert("Nombre requerido");
      try {
          const response = await api.post('/teams', { ...newTeamData, userId: user.id });
          setTeams([...teams, response.data]);
          setIsCreatingTeam(false);
          setSelectedTeamId(response.data.id);
          setNewTeamData({ name: '', category: 'Elite', sport: 'Voleibol', logo: '', banner: '' });
      } catch (error) { alert("Error al crear equipo"); }
  };

  // 3. AÑADIR JUGADOR
  const handleAddPlayer = async (e) => {
      e.preventDefault();
      if (!newPlayerData.name || !newPlayerData.number) return alert("Nombre y Dorsal requeridos");

      try {
          const finalImage = newPlayerData.image || `https://ui-avatars.com/api/?name=${newPlayerData.name}&background=random&color=fff&size=512`;
          const response = await api.post(`/teams/${selectedTeamId}/players`, {
              ...newPlayerData,
              position: newPlayerData.position || currentPositions[0],
              image: finalImage
          });

          const updatedTeams = teams.map(t => {
              if (t.id === selectedTeamId) {
                  return { ...t, players: [...(t.players || []), response.data] };
              }
              return t;
          });
          
          setTeams(updatedTeams);
          setIsAddingPlayer(false);
          setNewPlayerData({ name: '', position: '', number: '', age: '', height: '', image: '' });
      } catch (error) {
          alert("Error al agregar jugador");
      }
  };

  // 4. BORRAR JUGADOR
  const handleDeletePlayer = async (playerId) => {
      if(!confirm("¿Liberar a este jugador?")) return;
      try {
          await api.delete(`/teams/players/${playerId}`);
          const updatedTeams = teams.map(t => {
              if (t.id === selectedTeamId) {
                  return { ...t, players: t.players.filter(p => p.id !== playerId) };
              }
              return t;
          });
          setTeams(updatedTeams);
      } catch (error) { alert("Error al eliminar"); }
  };

  // Styles
  const labelClass = "text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block font-mono";
  const inputClass = "w-full bg-slate-950 border border-slate-800 text-white text-xs p-2.5 focus:border-orange-500 focus:bg-slate-900 outline-none transition-all rounded-sm placeholder:text-slate-700 font-medium";

  if (loading) return <div className="h-screen bg-slate-950 flex items-center justify-center text-slate-500 font-bold uppercase tracking-widest">Cargando Roster...</div>;

  return (
    <div className="h-screen bg-slate-950 text-slate-200 pt-16 flex flex-col font-sans overflow-hidden selection:bg-orange-500 selection:text-white">
      
      <div className="flex-1 flex overflow-hidden">
         
         {/* --- COLUMNA IZQUIERDA: LISTA DE EQUIPOS --- */}
         <div className={`w-full lg:w-[340px] border-r border-slate-800 flex-col bg-slate-950 flex-shrink-0 z-20 transition-all duration-300 ${(selectedTeamId || isCreatingTeam) ? 'hidden lg:flex' : 'flex'}`}>
            <div className="p-6 border-b border-slate-800 pb-6">
                <div className="flex items-center gap-2 mb-2">
                    <Trophy size={14} className="text-orange-500" />
                    <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Gestión Deportiva</span>
                </div>
                <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none mb-4">
                    Mis Franquicias
                </h1>
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-500 transition-colors" size={14}/>
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="BUSCAR EQUIPO..." 
                        className="bg-slate-900 border border-slate-800 py-2.5 pl-9 pr-4 text-xs font-bold text-white focus:border-orange-500 focus:outline-none w-full rounded-sm transition-all placeholder:text-slate-600 uppercase tracking-wide"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {/* Crear Nuevo Botón */}
                <button onClick={() => { setIsCreatingTeam(true); setSelectedTeamId(null); }} className={`w-full group relative border border-dashed rounded-sm p-4 flex items-center gap-4 transition-all ${isCreatingTeam ? 'border-orange-500 bg-orange-900/10' : 'border-slate-800 hover:border-slate-600 hover:bg-slate-900'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${isCreatingTeam ? 'bg-orange-500 border-orange-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-500 group-hover:border-orange-500 group-hover:text-orange-500'}`}>
                        <Plus size={18} />
                    </div>
                    <div className="text-left">
                        <span className={`block text-xs font-black uppercase ${isCreatingTeam ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>Registrar Equipo</span>
                        <span className="text-[10px] text-slate-600 font-mono">Nueva temporada</span>
                    </div>
                </button>

                {/* Lista Filtrada */}
                {filteredTeams.map(team => (
                    <div 
                        key={team.id} 
                        onClick={() => { setSelectedTeamId(team.id); setIsCreatingTeam(false); setIsAddingPlayer(false); }}
                        className={`group relative flex gap-3 p-2 border rounded-sm cursor-pointer transition-all ${selectedTeamId === team.id && !isCreatingTeam ? 'bg-slate-900 border-orange-500 shadow-[0_0_15px_rgba(234,88,12,0.1)]' : 'bg-slate-950 border-slate-800 hover:border-slate-600 hover:bg-slate-900'}`}
                    >
                        {selectedTeamId === team.id && !isCreatingTeam && <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 animate-pulse"></div>}
                        
                        <div className="w-14 h-14 bg-slate-900 border border-slate-700 flex-shrink-0 overflow-hidden rounded-sm flex items-center justify-center">
                            {team.logo ? <img src={team.logo} alt="" className="w-full h-full object-cover opacity-90 group-hover:opacity-100"/> : <Shield size={20} className="text-slate-700"/>}
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[9px] font-bold bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase">{team.sport}</span>
                            </div>
                            <h3 className={`text-sm font-black uppercase italic truncate ${selectedTeamId === team.id && !isCreatingTeam ? 'text-white' : 'text-slate-300'}`}>{team.name}</h3>
                            <p className="text-[10px] text-slate-500 font-mono">{team.players?.length || 0} Jugadores • {team.category}</p>
                        </div>
                    </div>
                ))}
                
                {/* Estado Vacío Mejorado */}
                {filteredTeams.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-600 opacity-50">
                        {searchTerm ? (
                            <>
                                <Search size={32} className="mb-3 stroke-1"/>
                                <p className="text-xs uppercase font-bold tracking-widest text-center">No se encontraron resultados</p>
                            </>
                        ) : (
                            // Solo si no hay equipos y no hay búsqueda (lista vacía inicial)
                            teams.length === 0 && (
                                <>
                                    <Shield size={32} className="mb-3 stroke-1"/>
                                    <p className="text-xs uppercase font-bold tracking-widest text-center">Sin equipos registrados</p>
                                </>
                            )
                        )}
                    </div>
                )}
            </div>
         </div>

         {/* --- COLUMNA DERECHA: DETALLE --- */}
         <div className={`flex-1 bg-slate-950 flex-col h-full overflow-hidden relative ${(selectedTeamId || isCreatingTeam) ? 'flex' : 'hidden lg:flex'}`}>
            
            {/* 1. FORMULARIO CREAR */}
            {isCreatingTeam ? (
                <div className="h-full overflow-y-auto p-6 lg:p-12 animate-in fade-in zoom-in-95 duration-300">
                    <div className="max-w-2xl mx-auto mt-10">
                         <button onClick={() => { setIsCreatingTeam(false); setSelectedTeamId(teams[0]?.id); }} className="lg:hidden mb-6 flex items-center gap-2 text-slate-400 hover:text-white font-bold text-xs uppercase"><ArrowLeft size={16}/> Cancelar</button>
                         
                         <div className="border border-slate-800 bg-slate-900/50 p-8 rounded-sm">
                             <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-6">
                                 <div>
                                     <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-1 block">Nueva Franquicia</span>
                                     <h2 className="text-3xl font-black text-white italic uppercase">Registrar Equipo</h2>
                                 </div>
                                 <Trophy size={32} className="text-slate-700"/>
                             </div>
                             
                             <form onSubmit={handleCreateTeam} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className={labelClass}>Nombre del Equipo</label>
                                        <input value={newTeamData.name} onChange={(e) => setNewTeamData({...newTeamData, name: e.target.value})} className={inputClass} placeholder="EJ: ÁGUILAS DORADAS" autoFocus/>
                                    </div>
                                    
                                    <div>
                                        <label className={labelClass}>Deporte</label>
                                        <select value={newTeamData.sport} onChange={(e) => setNewTeamData({...newTeamData, sport: e.target.value})} className={inputClass}>
                                            <option>Voleibol</option>
                                            <option>Baloncesto</option>
                                            <option>Fútbol Sala</option>
                                            <option>Handball</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Categoría</label>
                                        <select value={newTeamData.category} onChange={(e) => setNewTeamData({...newTeamData, category: e.target.value})} className={inputClass}>
                                            <option>Elite</option>
                                            <option>Sub-23</option>
                                            <option>Amateur</option>
                                            <option>Veteranos</option>
                                        </select>
                                    </div>
                                    
                                    <div><label className={labelClass}>Logo URL</label><input value={newTeamData.logo} onChange={(e) => setNewTeamData({...newTeamData, logo: e.target.value})} className={inputClass} placeholder="https://..."/></div>
                                    <div><label className={labelClass}>Banner URL</label><input value={newTeamData.banner} onChange={(e) => setNewTeamData({...newTeamData, banner: e.target.value})} className={inputClass} placeholder="https://..."/></div>
                                </div>
                                
                                <div className="pt-4 flex justify-end gap-3">
                                    <Button variant="secondary" onClick={() => { setIsCreatingTeam(false); setSelectedTeamId(teams[0]?.id); }} className="lg:hidden bg-slate-800">Cancelar</Button>
                                    <Button type="submit" variant="primary" className="px-8 font-black italic uppercase tracking-wider">Fundar Equipo</Button>
                                </div>
                             </form>
                         </div>
                    </div>
                </div>
            ) : selectedTeam ? (
                // 2. DASHBOARD EQUIPO
                <div className="flex flex-col h-full animate-in fade-in duration-500">
                    
                    {/* HERO SECTION */}
                    <div className="h-56 lg:h-64 relative flex-shrink-0 bg-slate-900 group overflow-hidden">
                        {/* Mobile Back */}
                        <button onClick={() => setSelectedTeamId(null)} className="absolute top-4 left-4 z-30 bg-black/50 p-2 rounded-full text-white backdrop-blur-md border border-white/10 lg:hidden"><ArrowLeft size={20}/></button>
                        
                        {/* Imagen Banner */}
                        <div className="absolute inset-0">
                            <img src={selectedTeam.banner || "https://via.placeholder.com/1200x400/0f172a/334155?text=..."} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-70 transition-all duration-1000 group-hover:scale-105"/>
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"/>
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                        </div>

                        {/* Info Overlay */}
                        <div className="absolute bottom-0 left-0 w-full p-6 lg:p-8 flex flex-col md:flex-row items-center md:items-end justify-between gap-6 z-10">
                             <div className="flex items-center gap-5">
                                  {/* Logo Box */}
                                  <div className="w-20 h-20 lg:w-24 lg:h-24 bg-slate-950 border-2 border-slate-700 shadow-2xl flex items-center justify-center overflow-hidden rounded-sm group-hover:border-orange-500 transition-colors duration-300">
                                      {selectedTeam.logo ? <img src={selectedTeam.logo} className="w-full h-full object-cover" /> : <Shield size={36} className="text-slate-700"/>}
                                  </div>
                                  <div className="mb-1">
                                      <div className="flex gap-2 mb-2">
                                          <span className="bg-orange-600 text-white text-[9px] font-black px-2 py-0.5 uppercase skew-x-[-10deg] tracking-wider border border-orange-500 shadow-lg shadow-orange-900/50">{selectedTeam.sport}</span>
                                          <span className="bg-slate-800 border border-slate-600 text-slate-300 text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider">{selectedTeam.category}</span>
                                      </div>
                                      <h2 className="text-3xl lg:text-5xl font-black text-white italic uppercase leading-none drop-shadow-2xl">{selectedTeam.name}</h2>
                                  </div>
                             </div>
                             
                             <div className="flex gap-4 text-right hidden md:flex">
                                 <div>
                                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Plantilla</p>
                                     <p className="text-2xl font-mono font-bold text-white">{selectedTeam.players?.length || 0} <span className="text-xs text-slate-600">JUG</span></p>
                                 </div>
                                 <div className="w-[1px] bg-slate-700 h-8 my-auto"></div>
                                 <div>
                                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Estado</p>
                                     <p className="text-emerald-500 text-sm font-bold uppercase flex items-center gap-1 mt-1"><Activity size={14}/> Activo</p>
                                 </div>
                             </div>
                        </div>
                    </div>

                    {/* CONTENT SECTION */}
                    <div className="flex-1 overflow-y-auto bg-slate-950 p-6 lg:p-8 custom-scrollbar">
                        <div className="flex justify-between items-end mb-6 border-b border-slate-800 pb-2">
                            <h3 className="text-lg font-black text-white uppercase italic tracking-wider flex items-center gap-2">
                                <Users size={18} className="text-orange-500"/> Roster Oficial
                            </h3>
                            <div className="flex gap-2">
                                <button onClick={() => setIsAddingPlayer(true)} className="text-[10px] font-bold text-slate-500 hover:text-orange-500 uppercase transition-colors flex items-center gap-1">
                                    <Plus size={12}/> Añadir Jugador
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 pb-20">
                            
                            {/* CARD: AÑADIR JUGADOR */}
                            {isAddingPlayer && (
                                <div className="w-full aspect-[3/4] bg-slate-900 border-2 border-orange-500 relative flex flex-col animate-in zoom-in-95 duration-200 shadow-[0_0_30px_rgba(234,88,12,0.15)]">
                                    <div className="absolute top-0 left-0 bg-orange-500 text-white text-[9px] font-black px-2 py-1 uppercase tracking-widest z-10">Fichaje</div>
                                    <button onClick={() => setIsAddingPlayer(false)} className="absolute top-2 right-2 text-slate-500 hover:text-white z-10"><X size={16}/></button>
                                    
                                    <div className="flex-1 p-4 flex flex-col justify-center gap-3">
                                        <div className="flex justify-center">
                                            <div className="w-16 h-16 rounded-full bg-slate-950 border-2 border-dashed border-slate-700 flex items-center justify-center overflow-hidden relative">
                                                {newPlayerData.image ? <img src={newPlayerData.image} className="w-full h-full object-cover"/> : <Camera size={20} className="text-slate-600"/>}
                                            </div>
                                        </div>
                                        <input value={newPlayerData.name} onChange={(e) => setNewPlayerData({...newPlayerData, name: e.target.value})} className="bg-slate-950 border-b border-slate-700 p-1 text-center text-xs font-bold text-white placeholder:text-slate-600 uppercase outline-none focus:border-orange-500 transition-colors" placeholder="NOMBRE" autoFocus/>
                                        
                                        <div className="grid grid-cols-2 gap-2">
                                            <input type="number" value={newPlayerData.number} onChange={(e) => setNewPlayerData({...newPlayerData, number: e.target.value})} className="bg-slate-950 border border-slate-700 p-1 text-center text-[10px] font-mono text-white placeholder:text-slate-600 outline-none focus:border-orange-500 rounded-sm" placeholder="#"/>
                                            <select value={newPlayerData.position} onChange={(e) => setNewPlayerData({...newPlayerData, position: e.target.value})} className="bg-slate-950 border border-slate-700 p-1 text-[9px] font-bold text-white uppercase outline-none focus:border-orange-500 rounded-sm">
                                                <option value="">POS</option>
                                                {currentPositions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                                            </select>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-2">
                                            <input value={newPlayerData.height} onChange={(e) => setNewPlayerData({...newPlayerData, height: e.target.value})} className="bg-slate-950 border border-slate-700 p-1 text-center text-[10px] text-white placeholder:text-slate-600 outline-none rounded-sm" placeholder="ALT (m)"/>
                                            <input type="number" value={newPlayerData.age} onChange={(e) => setNewPlayerData({...newPlayerData, age: e.target.value})} className="bg-slate-950 border border-slate-700 p-1 text-center text-[10px] text-white placeholder:text-slate-600 outline-none rounded-sm" placeholder="EDAD"/>
                                        </div>
                                        
                                        <input value={newPlayerData.image} onChange={(e) => setNewPlayerData({...newPlayerData, image: e.target.value})} className="bg-slate-950 border-b border-slate-700 p-1 text-[9px] text-slate-400 placeholder:text-slate-700 outline-none" placeholder="URL FOTO..."/>
                                    </div>
                                    
                                    <button onClick={handleAddPlayer} className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-black uppercase py-3 transition-colors">Confirmar</button>
                                </div>
                            )}

                            {/* CARD: BOTÓN AÑADIR */}
                            {!isAddingPlayer && (
                                <button onClick={() => setIsAddingPlayer(true)} className="w-full aspect-[3/4] border-2 border-dashed border-slate-800 hover:border-orange-500 hover:bg-slate-900/50 rounded-sm flex flex-col items-center justify-center gap-3 group transition-all">
                                    <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-700 group-hover:border-orange-500 flex items-center justify-center text-slate-500 group-hover:text-orange-500 transition-colors">
                                        <UserPlus size={24}/>
                                    </div>
                                    <span className="text-xs font-black uppercase text-slate-500 group-hover:text-white tracking-widest">Reclutar</span>
                                </button>
                            )}

                            {/* JUGADORES REALES */}
                            {selectedTeam.players?.map(player => (
                                <div key={player.id} className="group relative w-full aspect-[3/4] bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-sm overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl">
                                    {/* Fondo Gradiente */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-800/50 opacity-50"></div>
                                    
                                    {/* Imagen Jugador */}
                                    <div className="absolute top-0 left-0 w-full h-[70%] overflow-hidden">
                                        <img src={player.image} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-110 group-hover:scale-100"/>
                                    </div>

                                    {/* Dorsal Gigante Fondo */}
                                    <span className="absolute top-2 right-2 text-6xl font-black text-white/5 font-mono z-0 group-hover:text-white/10 transition-colors">{player.number}</span>

                                    {/* Info Overlay Bottom */}
                                    <div className="absolute bottom-0 left-0 w-full h-[40%] bg-gradient-to-t from-slate-950 via-slate-950 to-transparent flex flex-col justify-end p-4 z-10">
                                        <div className="flex justify-between items-end mb-1">
                                            <div>
                                                <span className="text-[9px] font-bold text-orange-500 uppercase tracking-wider block mb-0.5">{player.position}</span>
                                                <h4 className="text-lg font-black text-white uppercase italic leading-none truncate w-32">{player.name}</h4>
                                            </div>
                                            <span className="text-2xl font-mono font-bold text-white border-b-2 border-orange-500 leading-none">{player.number}</span>
                                        </div>
                                        
                                        {/* Stats Mini */}
                                        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                                            <div className="flex items-center gap-1 text-[9px] text-slate-400 font-mono"><Ruler size={10}/> {player.height || '-'}m</div>
                                            <div className="flex items-center gap-1 text-[9px] text-slate-400 font-mono"><Activity size={10}/> {player.age || '-'} años</div>
                                        </div>
                                    </div>

                                    {/* Acciones Hover */}
                                    <button onClick={(e) => { e.stopPropagation(); handleDeletePlayer(player.id); }} className="absolute top-2 left-2 p-2 bg-black/50 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all z-20 backdrop-blur-sm">
                                        <Trash2 size={14}/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 p-8 text-center animate-in fade-in">
                    <div className="w-24 h-24 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center mb-6 shadow-2xl">
                        <Trophy size={40} className="opacity-40"/>
                    </div>
                    <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">Selecciona un Equipo</h3>
                    <p className="text-sm text-slate-500 max-w-sm">Gestiona tus franquicias, edita alineaciones y prepara a tus jugadores para la próxima temporada.</p>
                </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default TeamsPage;
