import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, Clock, MapPin, 
  ChevronLeft, ChevronRight, Search, Filter, 
  ArrowLeft, GripVertical, LayoutGrid, History,
  MoreHorizontal, User, Shield
} from 'lucide-react';
import Button from '../../components/common/Button';
import EventDetailsPanel from '../../components/bookings/EventDetailsPanel';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// --- HELPERS ---
const isSameDay = (d1, d2) => {
    return d1.getDate() === d2.getDate() && 
           d1.getMonth() === d2.getMonth() && 
           d1.getFullYear() === d2.getFullYear();
};

const MyBookingsPage = () => {
  const { user } = useAuth();
    
  // --- ESTADOS ---
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI States
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [selectedDay, setSelectedDay] = useState(null); 
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isGlobalView, setIsGlobalView] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  // Resizing
  const [sidebarWidth, setSidebarWidth] = useState(window.innerWidth < 1024 ? 350 : 400);
  const [isResizing, setIsResizing] = useState(false);
    
  // 1. CARGAR DATOS
  const fetchMyBookings = async () => {
      if (!user) return;
      try {
          const response = await api.get(`/bookings?userId=${user.id}`);
          const adaptedBookings = response.data.map(evt => ({
              id: evt.id,
              title: evt.title,
              start: new Date(evt.start),
              end: new Date(evt.end),
              court: evt.extendedProps.venueName || 'Cancha Principal',
              status: evt.extendedProps.status,
              extendedProps: {
                  ...evt.extendedProps,
                  bookedBy: evt.extendedProps.bookedBy?.name ? evt.extendedProps.bookedBy : { name: user.fullName, avatar: user.avatar },
              }
          }));
          setMyBookings(adaptedBookings);
      } catch (error) {
          console.error("Error:", error);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => { fetchMyBookings(); }, [user]);

  // 2. CANCELAR
  const handleCancelBooking = async (bookingId) => {
      if (!confirm("¿Confirmar cancelación?")) return;
      try {
          await api.delete(`/bookings/${bookingId}`);
          setMyBookings(prev => prev.filter(b => b.id !== bookingId));
          setSelectedBookingId(null);
      } catch (error) { alert("Error al cancelar."); }
  };

  // --- CALENDARIO LOGIC (INFINITE / 90 DÍAS) ---
  const daysTimeline = useMemo(() => {
      const dates = [];
      const base = new Date(currentDate);
      // Empezar un día antes del actual (ayer)
      base.setDate(base.getDate() - 1); 
      
      // Generar 90 días (3 meses aprox)
      for (let i = 0; i < 90; i++) { 
          const d = new Date(base);
          d.setDate(base.getDate() + i);
          dates.push(d);
      }
      return dates;
  }, [currentDate]);

  // Calcular padding para que el primer día se alinee con el día de la semana correcto
  const paddingArray = useMemo(() => {
      if (daysTimeline.length === 0) return [];
      let dayOfWeek = daysTimeline[0].getDay(); // 0 = Domingo
      // Ajustar para que Lunes sea el inicio (0) y Domingo el final (6)
      dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      return Array(dayOfWeek).fill(null);
  }, [daysTimeline]);

  // --- FILTRADO AVANZADO (FRONTEND) ---
  const filteredBookings = useMemo(() => {
      const now = new Date();
      const lowerTerm = searchTerm.toLowerCase();

      return myBookings.filter(b => {
          // 1. Filtro de Texto (Título, Cancha o ID)
          const matchesSearch = 
              b.title.toLowerCase().includes(lowerTerm) || 
              b.court.toLowerCase().includes(lowerTerm) ||
              b.id.toString().includes(lowerTerm);
          
          // 2. Filtro Tiempo (Historial vs Futuro)
          const isPastEvent = b.end < now;
          const matchesTime = showHistory ? isPastEvent : !isPastEvent;

          // 3. Filtro Fecha Calendario (Día seleccionado vs Vista Global)
          let matchesDate = true;
          if (selectedDay) matchesDate = isSameDay(b.start, selectedDay);
          else if (isGlobalView) matchesDate = true; 

          return matchesSearch && matchesDate && matchesTime;
      }).sort((a, b) => showHistory ? b.start - a.start : a.start - b.start);
  }, [selectedDay, searchTerm, isGlobalView, showHistory, myBookings]);

  const selectedBooking = useMemo(() => myBookings.find(b => b.id === selectedBookingId), [selectedBookingId, myBookings]);

  // --- HANDLERS ---
  const handleDayClick = (day) => { 
      if (!day) return;
      // Toggle selección
      if (selectedDay && isSameDay(selectedDay, day)) {
          setSelectedDay(null);
          setIsGlobalView(true);
      } else {
          setSelectedDay(day); 
          setIsGlobalView(false); 
          setSelectedBookingId(null); 
      }
  };
  const handleViewAll = () => { setIsGlobalView(true); setSelectedDay(null); setSelectedBookingId(null); };
  const toggleHistory = () => { setShowHistory(!showHistory); setSelectedDay(null); setIsGlobalView(true); };
  
  // Navegación por meses
  const changeMonth = (delta) => { 
      const d = new Date(currentDate); 
      d.setMonth(d.getMonth() + delta); 
      if (d.getDate() !== currentDate.getDate()) {
          d.setDate(0);
      }
      setCurrentDate(d); 
  };

  // Resize
  const startResizing = useCallback((e) => { e.preventDefault(); setIsResizing(true); }, []);
  const stopResizing = useCallback(() => { setIsResizing(false); }, []);
  const resize = useCallback((e) => {
    if (isResizing) {
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth > 320 && newWidth < 600) setSidebarWidth(newWidth);
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) { window.addEventListener("mousemove", resize); window.addEventListener("mouseup", stopResizing); }
    return () => { window.removeEventListener("mousemove", resize); window.removeEventListener("mouseup", stopResizing); };
  }, [isResizing, resize, stopResizing]);

  if (loading) return <div className="h-screen bg-slate-950 flex items-center justify-center text-slate-500 font-bold uppercase tracking-widest">Cargando Agenda...</div>;

  return (
    <div className="h-screen bg-slate-950 text-slate-200 pt-16 flex flex-col font-sans overflow-hidden">
       
       <div className="flex-1 flex overflow-hidden relative">
          
          {/* --- PANEL IZQUIERDO: CALENDARIO GRÁFICO (INFINITE) --- */}
          <div className="flex-1 flex flex-col border-r border-slate-800 min-w-[50%] bg-slate-950 relative z-0">
              {/* Header Calendario */}
              <div className="p-6 flex justify-between items-end border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex-shrink-0">
                  <div>
                      <div className="flex items-center gap-2 mb-1">
                          <CalendarIcon size={14} className="text-orange-500" />
                          <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Mi Calendario</span>
                      </div>
                      <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">
                          {currentDate.toLocaleDateString('es-ES', { month: 'long' })} <span className="text-slate-600 font-thin not-italic font-sans">{currentDate.getFullYear()}</span>
                      </h1>
                  </div>
                  
                  <div className="flex gap-2">
                      <div className="flex border border-slate-700 rounded-sm bg-slate-900">
                          <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"><ChevronLeft size={18}/></button>
                          <div className="w-[1px] bg-slate-800"></div>
                          <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"><ChevronRight size={18}/></button>
                      </div>
                      <button onClick={() => { setCurrentDate(new Date()); setSelectedDay(new Date()); setIsGlobalView(false); }} className="px-3 py-2 bg-slate-800 border border-slate-700 text-xs font-bold uppercase hover:bg-slate-700 hover:text-white rounded-sm transition-colors">Hoy</button>
                  </div>
              </div>

              {/* Grid Infinito con Scroll */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                  <div className="min-h-full flex flex-col">
                      
                      {/* Días Semana (Sticky) */}
                      <div className="grid grid-cols-7 mb-2 pb-2 border-b border-slate-800 sticky top-0 bg-slate-950 z-20">
                          {['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'].map(d => (
                              <div key={d} className="text-right pr-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">{d}</div>
                          ))}
                      </div>
                      
                      {/* GRID PRINCIPAL */}
                      <div className="grid grid-cols-7 auto-rows-[minmax(100px,1fr)] gap-[1px] bg-slate-800 border border-slate-800 rounded-sm">
                          {/* Padding inicial */}
                          {paddingArray.map((_, i) => <div key={`pad-${i}`} className="bg-slate-950/50 pointer-events-none"></div>)}

                          {daysTimeline.map((day, index) => {
                              if (!day) return null;

                              const dayEvents = myBookings.filter(b => isSameDay(b.start, day));
                              const isSelected = selectedDay && isSameDay(selectedDay, day);
                              const isToday = isSameDay(day, new Date());
                              const isPast = day < new Date().setHours(0,0,0,0);
                              const isFirstOfMonth = day.getDate() === 1;
                              const monthName = day.toLocaleDateString('es-ES', { month: 'long' });

                              return (
                                  <div 
                                    key={day.toISOString()}
                                    onClick={() => handleDayClick(day)}
                                    className={`
                                        relative bg-slate-950 p-2 cursor-pointer transition-all group flex flex-col justify-between min-h-[100px]
                                        ${isSelected ? 'bg-slate-900 ring-inset ring-2 ring-orange-500 z-10' : 'hover:bg-slate-900'}
                                        ${isFirstOfMonth ? 'bg-slate-900/90' : ''}
                                        ${isPast ? 'opacity-50 hover:opacity-100' : ''}
                                    `}
                                  >
                                      <div className="flex justify-between items-start mb-2">
                                          <div className="flex items-baseline gap-1">
                                              <span className={`text-sm font-mono font-bold ${isToday ? 'text-white bg-orange-600 px-1.5 rounded-sm shadow-lg shadow-orange-900/50' : (isSelected ? 'text-orange-500' : 'text-slate-500 group-hover:text-slate-300')}`}>
                                                  {day.getDate()}
                                              </span>
                                              {isFirstOfMonth && (
                                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                                      {monthName}
                                                  </span>
                                              )}
                                          </div>
                                      </div>

                                      <div className="space-y-1">
                                          {dayEvents.slice(0, 3).map((evt, idx) => (
                                              <div key={idx} className="flex items-center gap-1.5">
                                                  <div className={`w-1 h-3 rounded-full ${evt.status === 'pending' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                                                  <span className="text-[9px] text-slate-400 font-medium truncate leading-tight">{evt.title}</span>
                                              </div>
                                          ))}
                                          {dayEvents.length > 3 && <div className="text-[9px] text-slate-600 pl-2">+ {dayEvents.length - 3} más</div>}
                                      </div>
                                      
                                      {isToday && <div className="absolute top-0 right-0 w-0 h-0 border-t-[8px] border-r-[8px] border-t-transparent border-r-orange-500"></div>}
                                  </div>
                              );
                          })}
                      </div>
                  </div>
              </div>
          </div>

          {/* --- RESIZER --- */}
          <div onMouseDown={startResizing} className={`w-1 bg-slate-950 hover:bg-orange-600 cursor-col-resize flex items-center justify-center z-20 transition-colors ${isResizing ? 'bg-orange-600' : 'border-l border-slate-800'}`}>
             <GripVertical size={12} className="text-slate-700" />
          </div>

          {/* --- PANEL DERECHO: SIDEBAR AGENDA --- */}
          <div style={{ width: `${sidebarWidth}px` }} className="flex-shrink-0 bg-slate-950 flex flex-col relative z-10 shadow-2xl">
              
              {selectedBookingId && selectedBooking ? (
                  // VISTA DETALLE
                  <div className="h-full flex flex-col animate-in slide-in-from-right-8 duration-300 bg-slate-950">
                      <div className="p-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between flex-shrink-0">
                          <button onClick={() => setSelectedBookingId(null)} className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400 hover:text-white transition-colors">
                              <ArrowLeft size={16}/> Volver
                          </button>
                          <div className="px-2 py-0.5 border border-slate-700 rounded text-[9px] text-slate-500 font-mono uppercase">
                              ID: {selectedBooking.id}
                          </div>
                      </div>
                      
                      <div className="flex-1 overflow-hidden relative">
                          <EventDetailsPanel 
                             event={selectedBooking} 
                             onClose={() => setSelectedBookingId(null)}
                          />
                          
                          {!showHistory && (
                             <div className="p-6 border-t border-slate-800 bg-slate-900/90 backdrop-blur-sm absolute bottom-0 left-0 right-0">
                                 <Button variant="danger" fullWidth onClick={() => handleCancelBooking(selectedBooking.id)} className="border-2 border-red-900/50 bg-red-950/30 text-red-500 hover:bg-red-900/50 hover:border-red-500 uppercase font-black italic text-xs tracking-wider py-3 shadow-lg">
                                     Cancelar Reserva
                                 </Button>
                             </div>
                          )}
                      </div>
                  </div>
              ) : (
                  // VISTA LISTA
                  <div className="h-full flex flex-col">
                      {/* Header Sidebar */}
                      <div className="p-6 border-b border-slate-800 space-y-4 flex-shrink-0 bg-slate-950">
                          <div className="flex justify-between items-center">
                              <div>
                                  <h2 className="text-sm font-black text-white uppercase italic tracking-wider flex items-center gap-2">
                                      {showHistory ? 'Historial' : (isGlobalView ? 'Próximos Eventos' : 'Eventos del Día')}
                                  </h2>
                                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                                      {isGlobalView ? 'Todas las fechas' : selectedDay?.toLocaleDateString()}
                                  </p>
                              </div>
                              <div className="flex bg-slate-900 rounded-sm p-0.5 border border-slate-800">
                                  <button onClick={handleViewAll} className={`p-1.5 rounded-sm transition-all ${!showHistory && isGlobalView ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`} title="Todo"><LayoutGrid size={14}/></button>
                                  <button onClick={toggleHistory} className={`p-1.5 rounded-sm transition-all ${showHistory ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`} title="Historial"><History size={14}/></button>
                              </div>
                          </div>

                          <div className="relative group">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-500 transition-colors" size={14}/>
                              <input 
                                  type="text" 
                                  value={searchTerm} 
                                  onChange={(e) => setSearchTerm(e.target.value)} 
                                  placeholder="FILTRAR AGENDA..." 
                                  className="bg-slate-900 border border-slate-800 py-2.5 pl-9 pr-4 text-xs font-bold text-white focus:border-orange-500 focus:outline-none w-full rounded-sm transition-all placeholder:text-slate-600 uppercase tracking-wide"
                              />
                          </div>
                      </div>

                      {/* Lista Items */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-900/20">
                          {filteredBookings.length > 0 ? (
                              filteredBookings.map(booking => {
                                  const isPast = booking.end < new Date();
                                  return (
                                      <div 
                                        key={booking.id}
                                        onClick={() => setSelectedBookingId(booking.id)}
                                        className={`
                                            group relative bg-slate-900 border p-4 cursor-pointer transition-all rounded-sm flex flex-col gap-2
                                            ${isPast ? 'border-slate-800 opacity-60 hover:opacity-100' : booking.status === 'pending' ? 'border-amber-900/30 hover:border-amber-500/50' : 'border-slate-800 hover:border-orange-500 shadow-sm'}
                                        `}
                                      >
                                          <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-sm ${isPast ? 'bg-slate-700' : booking.status === 'pending' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                                          
                                          <div className="flex justify-between items-start pl-2">
                                              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase flex items-center gap-1">
                                                  <CalendarIcon size={10}/> {booking.start.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).toUpperCase()}
                                              </span>
                                              <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-sm border ${booking.status === 'pending' ? 'text-amber-500 border-amber-900/30 bg-amber-900/10' : 'text-emerald-500 border-emerald-900/30 bg-emerald-900/10'}`}>
                                                  {booking.status === 'pending' ? 'Pendiente' : 'Confirmado'}
                                              </span>
                                          </div>

                                          <div className="pl-2">
                                              <h3 className={`text-sm font-black uppercase italic leading-tight mb-1 ${selectedBookingId === booking.id ? 'text-orange-500' : 'text-white'}`}>{booking.title}</h3>
                                              <div className="flex flex-col gap-1 text-[10px] text-slate-400 font-mono mt-2">
                                                  <div className="flex items-center gap-2"><Clock size={12} className="text-slate-600"/> {booking.start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {booking.end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                                  <div className="flex items-center gap-2"><MapPin size={12} className="text-slate-600"/> {booking.court}</div>
                                              </div>
                                          </div>
                                          
                                          <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity text-orange-500 scale-75 group-hover:scale-100 duration-200">
                                              <div className="bg-orange-500/10 p-1 rounded border border-orange-500/20"><MoreHorizontal size={16}/></div>
                                          </div>
                                      </div>
                                  );
                              })
                          ) : (
                              <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50">
                                  {searchTerm ? (
                                      <>
                                          <Search size={32} className="mb-3 stroke-1"/>
                                          <p className="text-xs uppercase font-bold tracking-widest text-center">No se encontraron resultados para "{searchTerm}"</p>
                                      </>
                                  ) : (
                                      <>
                                          <Filter size={32} className="mb-3 stroke-1"/>
                                          <p className="text-xs uppercase font-bold tracking-widest">{showHistory ? 'Historial vacío' : 'Sin eventos'}</p>
                                      </>
                                  )}
                              </div>
                          )}
                      </div>
                  </div>
              )}
          </div>
       </div>
    </div>
  );
};

export default MyBookingsPage;
