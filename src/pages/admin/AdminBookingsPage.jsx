import React, { useState, useMemo, useEffect } from 'react';
import { 
  CheckCircle, XCircle, Clock, Calendar, User, 
  Search, Filter, ChevronRight, Shield, MapPin, 
  AlertTriangle, Users, Check, X, LayoutGrid, ChevronDown, ChevronUp, ArrowLeft,
  MoreHorizontal, BarChart3
} from 'lucide-react';
import Button from '../../components/common/Button';
import PlayerCard from '../../components/ui/PlayerCard';
import api from '../../services/api'; 

// --- HELPERS (Sin cambios) ---
const generateDays = () => {
  const days = [];
  days.push({ iso: 'ALL', day: '∞', weekday: 'TODO' });
  const today = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      iso: d.toISOString().split('T')[0], 
      day: d.getDate(),
      weekday: d.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase()
    });
  }
  return days;
};

const DAYS_STRIP = generateDays();

const formatDateBox = (dateStr) => {
    if (dateStr === 'ALL' || !dateStr) return { month: 'TODO', day: '∞' };
    const date = new Date(dateStr + 'T00:00:00'); 
    const month = date.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase().replace('.', '');
    const day = date.getDate();
    return { month, day };
};

// --- TIMELINE MEJORADO ---
const ConflictTimeline = ({ currentRequest, allRequests }) => {
  const targetDate = currentRequest.date;
  
  const dayBookings = allRequests.filter(b => 
      b.court === currentRequest.court && 
      b.date === targetDate && 
      b.status === 'approved' 
  );
  
  const otherPendings = allRequests.filter(r => 
    r.court === currentRequest.court && 
    r.date === targetDate && 
    r.id !== currentRequest.id && 
    r.status === 'pending'
  );

  const START_HOUR = 6;
  const TOTAL_HOURS = 16; 
  
  const getPosition = (start, end) => {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const startDecimal = sh + sm/60;
    const endDecimal = eh + em/60;
    const top = ((startDecimal - START_HOUR) / TOTAL_HOURS) * 100;
    const height = ((endDecimal - startDecimal) / TOTAL_HOURS) * 100;
    return { top: `${Math.max(0, top)}%`, height: `${height}%` };
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-sm p-4 w-full h-full flex flex-col flex-1 min-h-[300px] relative overflow-hidden">
      {/* Grid Background Decoration */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:20px_20px]"></div>

      <div className="flex justify-between items-center mb-4 relative z-10">
         <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
            <BarChart3 size={12} className="text-orange-500"/> 
            <span className="text-white">Ocupación: {currentRequest.court}</span>
         </h4>
         <div className="flex gap-3 text-[9px] font-bold uppercase font-mono">
            <span className="flex items-center gap-1.5 text-slate-500"><div className="w-2 h-2 bg-slate-700 rounded-sm"></div> Ocupado</span>
            <span className="flex items-center gap-1.5 text-emerald-500"><div className="w-2 h-2 bg-emerald-500 rounded-sm shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div> Selección</span>
         </div>
      </div>

      <div className="relative flex-1 border-l border-slate-800 ml-4 relative z-10">
         {/* Horas */}
         {Array.from({ length: TOTAL_HOURS + 1 }).map((_, i) => (
            <div key={i} className="absolute w-full border-t border-slate-800/50 flex items-center" style={{ top: `${(i / TOTAL_HOURS) * 100}%` }}>
               <span className="absolute -left-5 text-[9px] text-slate-600 font-mono -translate-y-1/2">{i + START_HOUR}</span>
            </div>
         ))}

         {/* Bloques Ocupados */}
         {dayBookings.map((b) => (
            <div key={b.id} className="absolute left-1 right-1 bg-slate-800/80 border-l-2 border-slate-600 rounded-sm z-10 flex items-center pl-2 opacity-80 overflow-hidden" style={getPosition(b.startTime, b.endTime)}>
               <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,rgba(0,0,0,0.2)_5px,rgba(0,0,0,0.2)_10px)]"></div>
               <span className="text-[9px] text-slate-400 font-bold truncate relative z-10">{b.title}</span>
            </div>
         ))}

         {/* Otras Pendientes (Fantasma) */}
         {otherPendings.map((p) => (
            <div key={p.id} className="absolute left-4 right-4 bg-amber-500/5 border-l border-amber-500/20 border-dashed z-20" style={getPosition(p.startTime, p.endTime)}></div>
         ))}

         {/* Selección Actual */}
         <div className="absolute left-0 right-0 mx-0 bg-emerald-500/10 border-y border-emerald-500/50 z-30 flex items-center justify-center backdrop-blur-[1px] shadow-[0_0_15px_rgba(16,185,129,0.1)] transition-all duration-500" style={getPosition(currentRequest.startTime, currentRequest.endTime)}>
            <div className="bg-slate-950/90 border border-emerald-500/50 px-2 py-0.5 rounded shadow-lg">
                <span className="text-[9px] text-emerald-400 font-mono font-bold uppercase tracking-widest">{currentRequest.startTime} - {currentRequest.endTime}</span>
            </div>
         </div>
      </div>
    </div>
  );
};


// --- PÁGINA PRINCIPAL ---
const AdminBookingsPage = () => {
  const [selectedDate, setSelectedDate] = useState('ALL'); 
  const [statusFilter, setStatusFilter] = useState('all'); 
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [openTeamIndex, setOpenTeamIndex] = useState(null); 
  
  const [requests, setRequests] = useState([]); 
  const [loading, setLoading] = useState(true);

  // BÚSQUEDA
  const [searchTerm, setSearchTerm] = useState('');

  // 1. CARGAR RESERVAS
  const fetchRequests = async () => {
      try {
          const response = await api.get('/bookings');
          
          const formattedRequests = response.data.map(b => {
             const start = new Date(b.start);
             const end = new Date(b.end);
             
             const dateStr = start.toISOString().split('T')[0]; 
             const startTime = start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false});
             const endTime = end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false});

             let teams = [];
             if (b.extendedProps.teams) {
                 const rawTeams = b.extendedProps.teams;
                 const parsedTeams = typeof rawTeams === 'string' ? JSON.parse(rawTeams) : rawTeams;
                 teams = Array.isArray(parsedTeams) ? parsedTeams : [];
             }
             
             const requestedBy = b.extendedProps.bookedBy || { name: 'Usuario', avatar: null };
             if (b.user) {
                 requestedBy.name = b.user.fullName;
                 requestedBy.avatar = b.user.avatar;
             }

             return {
                 id: parseInt(b.id),
                 title: b.title,
                 court: b.extendedProps.venueName || 'Cancha Desconocida',
                 date: dateStr,
                 startTime,
                 endTime,
                 status: b.extendedProps.status || 'pending',
                 type: b.extendedProps.sportType || 'General',
                 description: b.extendedProps.description || '',
                 requestedBy: b.extendedProps.bookedBy,
                 teams: teams
             };
          });

          setRequests(formattedRequests);
      } catch (error) {
          console.error("Error cargando solicitudes:", error);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => { fetchRequests(); }, []);

  // FILTROS COMBINADOS (Fecha, Estado y Búsqueda)
  const filteredRequests = useMemo(() => {
    const lowerTerm = searchTerm.toLowerCase();

    return requests.filter(req => {
      const matchDate = selectedDate === 'ALL' ? true : req.date === selectedDate;
      const matchStatus = statusFilter === 'all' ? true : req.status === statusFilter;
      const isNotBlocked = req.status !== 'blocked' && req.status !== 'maintenance' && req.type !== 'maintenance';
      
      // Lógica de Búsqueda
      const matchSearch = 
          req.title.toLowerCase().includes(lowerTerm) ||
          req.court.toLowerCase().includes(lowerTerm) ||
          req.requestedBy.name.toLowerCase().includes(lowerTerm) ||
          req.id.toString().includes(lowerTerm);

      return matchDate && matchStatus && isNotBlocked && matchSearch;
    });
  }, [selectedDate, statusFilter, requests, searchTerm]);

  const selectedRequest = requests.find(r => r.id === selectedRequestId);

  const kpis = {
    pending: requests.filter(r => (selectedDate === 'ALL' || r.date === selectedDate) && r.status === 'pending').length,
    approved: requests.filter(r => (selectedDate === 'ALL' || r.date === selectedDate) && r.status === 'approved').length,
  };

  const handleAction = async (id, newStatus) => {
    try {
        await api.patch(`/bookings/${id}/status`, { status: newStatus });
        
        // Actualización optimista local
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
        
        if (selectedRequestId === id) setSelectedRequestId(null);
        
        // Feedback visual simple
        if(newStatus === 'approved') alert("Solicitud Aprobada con éxito");

    } catch (error) {
        // AQUÍ CAPTURAMOS EL MENSAJE DEL BACKEND
        const serverMessage = error.response?.data?.error || "Error al actualizar estado";
        
        // Mostramos alerta con el error específico (ej: "CONFLICTO: Ya existe...")
        alert(serverMessage); 
        
        console.error(error);
    }
  };

  if (loading) return <div className="h-screen bg-slate-950 flex items-center justify-center text-slate-500 uppercase font-bold tracking-widest animate-pulse">Cargando Datos...</div>;

  return (
    <div className="h-screen bg-slate-950 text-slate-200 pt-16 overflow-hidden font-sans selection:bg-orange-500 selection:text-white">
      <div className="grid grid-cols-1 lg:grid-cols-12 h-full relative">
         
         {/* --- COLUMNA IZQUIERDA (LISTA) --- */}
         <div className={`lg:col-span-4 flex flex-col border-r border-slate-800 bg-slate-950 h-full pl-4 lg:pl-6 transition-all overflow-hidden z-20 ${selectedRequestId ? 'hidden lg:flex' : 'flex'}`}>
            
            {/* HEADER IZQUIERDO */}
            <div className="py-6 pr-4 lg:pr-6 border-b border-slate-800 space-y-6 flex-shrink-0">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Shield size={14} className="text-orange-500" />
                        <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Admin Panel</span>
                    </div>
                    <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">
                       Solicitudes
                    </h1>
                </div>

                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-500 transition-colors" size={14}/>
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="BUSCAR RESERVA..." 
                        className="bg-slate-900 border border-slate-800 py-2.5 pl-9 pr-4 text-xs font-bold text-white focus:border-orange-500 focus:outline-none w-full rounded-sm transition-all placeholder:text-slate-600 uppercase tracking-wide"
                    />
                </div>

                {/* Date Strip */}
                <div className="flex justify-between gap-1 overflow-x-auto pb-2 no-scrollbar">
                    {DAYS_STRIP.map(d => (
                        <button key={d.iso} onClick={() => setSelectedDate(d.iso)} className={`flex-1 min-w-[3rem] h-12 flex flex-col items-center justify-center border transition-all rounded-sm group relative overflow-hidden ${selectedDate === d.iso ? 'bg-slate-800 border-orange-500 text-white shadow-lg z-10' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'}`}>
                            {selectedDate === d.iso && <div className="absolute top-0 left-0 w-full h-0.5 bg-orange-500"></div>}
                            <span className="text-[8px] font-bold uppercase tracking-widest">{d.weekday}</span>
                            <span className={`text-base font-black leading-none font-mono ${selectedDate === d.iso ? 'text-white' : 'text-slate-600 group-hover:text-slate-400'}`}>{d.day}</span>
                        </button>
                    ))}
                </div>

                {/* KPI Buttons */}
                <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => setStatusFilter('all')} className={`h-9 flex items-center justify-center rounded-sm border transition-all ${statusFilter === 'all' ? 'bg-slate-800 text-white border-slate-600' : 'text-slate-500 border-slate-800 hover:bg-slate-900 hover:text-slate-300'}`} title="Todos"><LayoutGrid size={16}/></button>
                    <button onClick={() => setStatusFilter('pending')} className={`h-9 flex items-center justify-center gap-2 rounded-sm border transition-all ${statusFilter === 'pending' ? 'bg-amber-900/10 text-amber-500 border-amber-500/50' : 'text-slate-500 border-slate-800 hover:bg-amber-900/5 hover:text-amber-500 hover:border-amber-500/30'}`} title="Pendientes"><AlertTriangle size={14}/> <span className="font-bold text-xs font-mono">{kpis.pending}</span></button>
                    <button onClick={() => setStatusFilter('approved')} className={`h-9 flex items-center justify-center gap-2 rounded-sm border transition-all ${statusFilter === 'approved' ? 'bg-emerald-900/10 text-emerald-500 border-emerald-500/50' : 'text-slate-500 border-slate-800 hover:bg-emerald-900/5 hover:text-emerald-500 hover:border-emerald-500/30'}`} title="Aprobados"><CheckCircle size={14}/> <span className="font-bold text-xs font-mono">{kpis.approved}</span></button>
                </div>
            </div>

            {/* LISTA DE ITEMS */}
            <div className="flex-1 overflow-y-auto min-h-0 p-2 pr-4 space-y-2 custom-scrollbar bg-slate-900/30">
                {filteredRequests.length === 0 ? (
                   <div className="h-full flex flex-col items-center justify-center text-slate-600 p-8 text-center">
                      {searchTerm ? (
                          <>
                              <Search size={32} className="mb-2 opacity-50"/>
                              <p className="text-[10px] font-bold uppercase tracking-widest">Sin coincidencias</p>
                          </>
                      ) : (
                          <>
                              <Shield size={32} className="mb-2 opacity-50"/>
                              <p className="text-[10px] font-bold uppercase tracking-widest">Sin registros</p>
                          </>
                      )}
                   </div>
                ) : (
                   filteredRequests.map(req => {
                      const { month, day } = formatDateBox(req.date);
                      return (
                          <div 
                            key={req.id}
                            onClick={() => setSelectedRequestId(req.id)}
                            className={`group relative flex gap-3 p-3 border rounded-sm cursor-pointer transition-all duration-200
                               ${selectedRequestId === req.id 
                                  ? 'bg-slate-900 border-orange-500 shadow-[0_0_15px_rgba(234,88,12,0.1)]' 
                                  : req.status === 'approved' 
                                     ? 'bg-slate-950 border-slate-800 border-l-emerald-500 border-l-[3px]' 
                                     : 'bg-slate-950 border-slate-800 border-l-slate-700 border-l-[3px] hover:border-slate-600 hover:bg-slate-900'
                               }
                            `}
                          >
                             {selectedRequestId === req.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 animate-pulse"></div>}
                             
                             {/* Date Box */}
                             <div className={`flex flex-col items-center justify-center w-10 h-12 border-r border-slate-800 pr-3 shrink-0 ${selectedRequestId === req.id ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
                                <span className="text-[8px] text-slate-500 uppercase font-black leading-none">{month}</span>
                                <span className="text-xl font-black text-white leading-none mt-0.5 font-mono">{day}</span>
                             </div>

                             <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <div className="flex justify-between items-center mb-1">
                                   <div className="flex items-center gap-1.5">
                                      <span className="text-[9px] font-bold text-orange-500 uppercase tracking-wide truncate border border-orange-500/20 px-1 rounded-sm bg-orange-500/5">{req.court}</span>
                                      {req.status === 'pending' && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>}
                                   </div>
                                   <span className="text-[9px] font-mono text-slate-500 font-bold">{req.startTime}</span>
                                </div>
                                <h3 className={`text-xs font-bold uppercase italic leading-tight mb-1 truncate ${selectedRequestId === req.id ? 'text-white' : 'text-slate-300'}`}>{req.title}</h3>
                                <div className="flex items-center gap-1.5">
                                   {req.requestedBy.avatar ? <img src={req.requestedBy.avatar} className="w-3.5 h-3.5 rounded-full bg-slate-800 border border-slate-700" alt=""/> : <div className="w-3.5 h-3.5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center"><User size={8} className="text-slate-500"/></div>}
                                   <span className="text-[9px] text-slate-500 font-bold truncate uppercase group-hover:text-slate-400 transition-colors">{req.requestedBy.name}</span>
                                </div>
                             </div>
                             
                             <div className={`absolute right-2 top-1/2 -translate-y-1/2 text-orange-500 transition-all duration-300 ${selectedRequestId === req.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`}>
                                 <ChevronRight size={14}/>
                             </div>
                          </div>
                      );
                   })
                )}
            </div>
         </div>

         {/* --- COLUMNA DERECHA (INSPECTOR) --- */}
         <div className={`lg:col-span-8 h-full bg-slate-950 relative flex-col overflow-hidden ${selectedRequestId ? 'flex absolute inset-0 lg:static z-20' : 'hidden lg:flex'}`}>
            
            {selectedRequest ? (
               <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-8 duration-300 bg-slate-950">
                  
                  {/* HEADER INSPECTOR */}
                  <div className="p-6 lg:p-8 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm flex-shrink-0">
                      <button onClick={() => setSelectedRequestId(null)} className="lg:hidden mb-4 flex items-center gap-2 text-slate-500 hover:text-white font-bold text-xs uppercase transition-colors">
                          <ArrowLeft size={16}/> Volver a la lista
                      </button>

                      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                          <div className="flex-1">
                               <div className="flex items-center gap-3 mb-3">
                                  <span className="text-slate-500 text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm bg-slate-800 border border-slate-700">ID: {selectedRequest.id.toString().padStart(4, '0')}</span>
                                  <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm border text-[9px] font-bold uppercase tracking-wider ${selectedRequest.status === 'pending' ? 'bg-amber-900/20 text-amber-500 border-amber-500/50' : 'bg-emerald-900/20 text-emerald-500 border-emerald-500/50'}`}>
                                           {selectedRequest.status === 'pending' ? <AlertTriangle size={10}/> : <CheckCircle size={10}/>}
                                           {selectedRequest.status === 'pending' ? 'Pendiente' : 'Aprobada'}
                                  </div>
                               </div>
                               <h2 className="text-3xl md:text-4xl font-black text-white italic uppercase leading-none mb-3 tracking-tight">{selectedRequest.title}</h2>
                               <p className="text-xs text-slate-400 font-mono flex items-center gap-3 uppercase">
                                  <span className="flex items-center gap-1.5"><Calendar size={12} className="text-orange-500"/> {selectedRequest.date}</span>
                                  <span className="text-slate-700">|</span>
                                  <span className="flex items-center gap-1.5"><MapPin size={12} className="text-orange-500"/> {selectedRequest.court}</span>
                               </p>
                          </div>

                          <div className="text-right mt-1 self-end md:self-auto bg-slate-950 border border-slate-800 px-5 py-3 rounded-sm min-w-[140px]">
                              <p className="text-[9px] text-slate-500 uppercase font-bold mb-1 tracking-wider flex items-center justify-end gap-1"><Clock size={10}/> Horario</p>
                              <div className="flex items-baseline justify-end gap-1 text-white">
                                  <span className="text-2xl font-black font-mono tracking-tighter leading-none">{selectedRequest.startTime}</span>
                                  <span className="text-lg font-thin text-slate-600 mx-1">-</span>
                                  <span className="text-2xl font-black font-mono tracking-tighter leading-none text-slate-400">{selectedRequest.endTime}</span>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* CONTENIDO SPLIT */}
                  <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
                      
                      {/* A. INFO (IZQUIERDA INTERNA) */}
                      <div className="w-full lg:w-3/5 overflow-y-auto p-6 lg:p-8 custom-scrollbar space-y-8 border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-950/30">
                          {/* Solicitante */}
                          <div>
                              <h4 className="text-[10px] font-black text-slate-500 uppercase mb-3 tracking-widest border-b border-slate-800 pb-1">Datos del Solicitante</h4>
                              <div className="flex items-center gap-4 p-4 bg-slate-900 border border-slate-800 rounded-sm">
                                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-700 bg-slate-800">
                                      {selectedRequest.requestedBy.avatar ? <img src={selectedRequest.requestedBy.avatar} className="w-full h-full object-cover" alt=""/> : <User size={24} className="m-auto mt-2 text-slate-600"/>}
                                  </div>
                                  <div>
                                      <p className="text-base font-bold text-white uppercase">{selectedRequest.requestedBy.name}</p>
                                      <div className="flex gap-2 mt-1">
                                         <span className="text-[9px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 uppercase font-bold tracking-wide">Coach</span>
                                         <span className="text-[9px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 uppercase font-bold tracking-wide">Nvl. 5</span>
                                      </div>
                                  </div>
                              </div>
                          </div>

                          {/* Descripción */}
                          <div>
                              <h4 className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest border-b border-slate-800 pb-1">Notas Adicionales</h4>
                              <div className="bg-slate-900/50 p-4 border-l-2 border-orange-500 rounded-r-sm">
                                  <p className="text-sm text-slate-300 leading-relaxed italic">"{selectedRequest.description || "Sin descripción adicional."}"</p>
                              </div>
                          </div>

                          {/* Equipos */}
                          <div>
                             <h4 className="text-[10px] font-black text-slate-500 uppercase mb-3 flex items-center gap-2 tracking-widest border-b border-slate-800 pb-1"><Users size={12}/> Equipos Involucrados</h4>
                             <div className="space-y-2">
                                {selectedRequest.teams.length > 0 ? selectedRequest.teams.map((team, idx) => (
                                  <div key={idx} className="bg-slate-900 border border-slate-800 rounded-sm overflow-hidden transition-all hover:border-slate-600">
                                     <button onClick={() => setOpenTeamIndex(openTeamIndex === idx ? null : idx)} className="w-full flex items-center justify-between p-3">
                                        <div className="flex items-center gap-3">
                                           <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 overflow-hidden">
                                              {team.logo ? <img src={team.logo} className="w-full h-full object-cover" alt=""/> : <Shield size={14} className="text-slate-500"/>}
                                           </div>
                                           <span className="font-bold text-white uppercase text-xs tracking-wide">{team.name}</span>
                                        </div>
                                        {openTeamIndex === idx ? <ChevronUp size={14} className="text-orange-500"/> : <ChevronDown size={14} className="text-slate-600"/>}
                                     </button>
                                     {openTeamIndex === idx && (
                                        <div className="p-4 bg-slate-950/50 border-t border-slate-800 overflow-x-auto animate-in slide-in-from-top-2 duration-200">
                                            <div className="flex gap-3 pb-2">
                                               {team.players && team.players.length > 0 ? (
                                                 team.players.map((player, pIdx) => <PlayerCard key={pIdx} player={player} />)
                                               ) : (
                                                 <p className="text-[10px] text-slate-500 italic w-full text-center py-2 uppercase">Roster no disponible</p>
                                               )}
                                            </div>
                                        </div>
                                     )}
                                  </div>
                                )) : <p className="text-xs text-slate-600 italic">No hay equipos registrados.</p>}
                             </div>
                          </div>
                      </div>

                      {/* B. TIMELINE (DERECHA INTERNA) */}
                      <div className="w-full lg:w-2/5 p-6 bg-slate-950 flex flex-col min-h-[350px] lg:min-h-0 border-l border-slate-800/50">
                          <ConflictTimeline currentRequest={selectedRequest} allRequests={requests} />
                          
                          <div className="mt-4 p-3 bg-blue-900/10 border border-blue-500/20 rounded-sm">
                             <h5 className="text-[9px] font-bold text-blue-400 uppercase mb-1 flex items-center gap-1"><AlertTriangle size={10}/> Análisis IA</h5>
                             <p className="text-[10px] text-blue-200/70 leading-relaxed">
                                No se detectan conflictos directos con otras reservas aprobadas. El horario es compatible con la disponibilidad de la cancha.
                             </p>
                          </div>
                      </div>
                  </div>

                  {/* FOOTER ACCIONES */}
                  {selectedRequest.status === 'pending' && (
                      <div className="p-6 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md flex justify-between items-center z-20">
                          <button className="text-slate-500 hover:text-white p-2 transition-colors"><MoreHorizontal size={20}/></button>
                          <div className="flex gap-3">
                              <button onClick={() => handleAction(selectedRequest.id, 'rejected')} className="px-6 py-3 rounded-sm border border-slate-700 text-slate-400 hover:border-red-500 hover:text-red-500 hover:bg-red-900/10 transition-all font-bold uppercase text-xs flex items-center gap-2">
                                  <X size={16}/> Rechazar
                              </button>
                              <button onClick={() => handleAction(selectedRequest.id, 'approved')} className="px-8 py-3 rounded-sm bg-orange-600 text-white hover:bg-orange-500 shadow-lg shadow-orange-900/20 transition-all font-bold uppercase text-xs flex items-center gap-2 transform hover:-translate-y-0.5 skew-x-[-2deg]">
                                  <span className="skew-x-[2deg] flex items-center gap-2"><Check size={16}/> Aprobar Solicitud</span>
                              </button>
                          </div>
                      </div>
                  )}
               </div>
            ) : (
               <div className="h-full flex flex-col items-center justify-center text-slate-700 opacity-50 p-8 text-center hidden lg:flex animate-in fade-in zoom-in-95 duration-500">
                  <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mb-6 border border-slate-800 shadow-2xl">
                      <Shield size={48} className="stroke-[0.5] text-slate-600"/>
                  </div>
                  <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">Panel de Control</h3>
                  <p className="text-sm text-slate-500 mt-2 max-w-sm font-medium">Selecciona una solicitud entrante para gestionar su estado y verificar conflictos.</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default AdminBookingsPage;
