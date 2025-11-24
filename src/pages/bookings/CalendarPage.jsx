import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Activity } from 'lucide-react';
import api from '../../services/api'; 
import CourtCard from '../../components/ui/CourtCard';
import MorphingHeader from '../../components/ui/MorphingHeader';
import FullCalendarView from '../../components/bookings/FullCalendarView';
import Button from '../../components/common/Button';

// --- HELPER: GENERAR DÍAS DE LA SEMANA ACTUAL ---
const getCurrentWeekDays = () => {
  const days = [];
  const curr = new Date();
  const dayNames = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];

  for (let i = 0; i < 6; i++) { 
    const next = new Date(curr); 
    next.setDate(curr.getDate() + i);
    const isToday = new Date().toDateString() === next.toDateString();
    
    days.push({
      id: dayNames[next.getDay()] + '-' + next.getDate(), 
      label: dayNames[next.getDay()],
      full: next.toLocaleDateString('es-ES', { weekday: 'long' }),
      dayNumber: next.getDate(),
      dateDisplay: next.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).toUpperCase().replace('.', ''),
      dateObj: next,
      isToday: isToday
    });
  }
  return days;
};

const WEEK_DAYS_DYNAMIC = getCurrentWeekDays();

// --- SIDEBAR (IGUAL QUE ANTES) ---
const LiveEventsSidebar = ({ selectedDayId, onSelectDay, allEvents }) => {
   // ... (Código del sidebar igual que en la respuesta anterior) ...
   // Por brevedad, asumo que mantienes el componente LiveEventsSidebar intacto
   // Si lo necesitas completo pídemelo, pero es el mismo diseño que te gustó.
   const selectedDayObj = WEEK_DAYS_DYNAMIC.find(d => d.id === selectedDayId) || WEEK_DAYS_DYNAMIC[0];
   const dayEvents = allEvents.filter(evt => {
      const evtDate = new Date(evt.start);
      const selDate = selectedDayObj.dateObj;
      return evtDate.getDate() === selDate.getDate() && evtDate.getMonth() === selDate.getMonth();
   }).sort((a, b) => new Date(a.start) - new Date(b.start));

   return (
      <div className="w-full lg:w-80 flex-shrink-0 flex flex-col bg-slate-950 border-r border-slate-800 lg:h-[calc(100vh-64px)] lg:sticky lg:top-16 overflow-hidden">
          {/* ... Header y Tabs ... */}
          <div className="flex flex-col border-b border-slate-800 bg-slate-900/50">
             <div className="p-4 flex items-center gap-2 border-b border-slate-800/50">
                 <Activity size={16} className="text-orange-500"/>
                 <span className="text-xs font-black text-white uppercase tracking-widest">Agenda Rápida</span>
             </div>
             <div className="flex overflow-x-auto no-scrollbar bg-slate-950">
                 {WEEK_DAYS_DYNAMIC.map((day) => (
                     <button key={day.id} onClick={() => onSelectDay(day.id)} className={`flex-1 min-w-[4rem] py-3 flex flex-col items-center justify-center border-b-2 transition-all duration-200 ${selectedDayId === day.id ? 'border-orange-500 bg-slate-900' : 'border-transparent hover:bg-slate-900/50 border-slate-800'}`}>
                         <span className={`text-[9px] font-bold uppercase tracking-wider mb-0.5 ${selectedDayId === day.id ? 'text-orange-500' : 'text-slate-500'}`}>{day.label}</span>
                         <span className={`text-sm font-black leading-none font-mono ${selectedDayId === day.id ? 'text-white' : 'text-slate-600'}`}>{day.dayNumber}</span>
                     </button>
                 ))}
             </div>
          </div>
          {/* ... Lista Eventos ... */}
          <div className="flex-1 overflow-y-auto p-0 custom-scrollbar">
             {dayEvents.length > 0 ? (
                 <div className="divide-y divide-slate-800/50">
                     {dayEvents.map((evt, idx) => (
                         <div key={idx} className="group relative p-4 hover:bg-slate-900 transition-colors flex gap-3 cursor-default">
                             <div className="flex flex-col items-center min-w-[3rem]">
                                 <span className="text-xs font-mono font-bold text-white">{new Date(evt.start).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                 <div className={`h-full w-0.5 mt-1 ${evt.extendedProps.status === 'approved' ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}></div>
                             </div>
                             <div className="flex-1 min-w-0">
                                 <h4 className="text-sm font-bold text-slate-200 leading-tight mb-1 truncate">{evt.title}</h4>
                                 <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono truncate"><MapPin size={10} /><span>{evt.extendedProps.venueName}</span></div>
                             </div>
                         </div>
                     ))}
                 </div>
             ) : (<div className="h-40 flex flex-col items-center justify-center text-slate-600 opacity-50"><p className="text-[10px] font-bold uppercase">Sin eventos</p></div>)}
          </div>
      </div>
   );
};

const CalendarPage = () => {
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [heroRect, setHeroRect] = useState(null); 
  const [showCalendar, setShowCalendar] = useState(false); 
  
  const [selectedDaySidebar, setSelectedDaySidebar] = useState(WEEK_DAYS_DYNAMIC[0].id); 
  const [allWeekEvents, setAllWeekEvents] = useState([]); // Para el sidebar
  
  const [courts, setCourts] = useState([]); // Canchas + Sus eventos
  const [calendarEvents, setCalendarEvents] = useState([]); // Para el modal FullCalendar
  const [loading, setLoading] = useState(true);

  // 1. CARGAR DATOS INICIALES (Canchas + Eventos de la semana)
  useEffect(() => {
    const initData = async () => {
        try {
            // A. Rango de la semana (Hoy a +7 días)
            const start = new Date();
            start.setHours(0,0,0,0);
            const end = new Date();
            end.setDate(end.getDate() + 7);
            end.setHours(23,59,59,999);

            // B. Peticiones paralelas
            const [resVenues, resBookings] = await Promise.all([
                api.get('/venues'),
                api.get(`/bookings?start=${start.toISOString()}&end=${end.toISOString()}`)
            ]);

            // C. Procesar eventos globales para Sidebar
            setAllWeekEvents(resBookings.data);

            // D. Inyectar eventos en cada Cancha para que CourtCard calcule ocupación
            const courtsWithEvents = resVenues.data.map(venue => {
                // Filtrar eventos que pertenecen a esta cancha
                const venueEvents = resBookings.data.filter(
                    b => parseInt(b.extendedProps.venueId || b.resourceId) === venue.id // Ajusta según tu API
                         || b.extendedProps.venueName === venue.name // Fallback
                );
                
                return {
                    ...venue,
                    events: venueEvents // Pasamos el array real a CourtCard
                };
            });
            
            setCourts(courtsWithEvents);

        } catch (error) {
            console.error("Error inicializando:", error);
        } finally {
            setLoading(false);
        }
    };
    initData();
  }, []);

  // 2. Cargar Detalle Profundo (Incluyendo bloqueos recurrentes del venue settings)
  const fetchCourtDetails = async (court) => {
      try {
          const resBookings = await api.get(`/bookings?venueId=${court.id}`);
          
          // Procesar eventos normales + bloqueos únicos
          const events = resBookings.data.map(b => {
              if (b.extendedProps.status === 'blocked') {
                  return { ...b, display: 'background', backgroundColor: '#ef4444', editable: false };
              }
              // Asegurar nombre
              if (!b.extendedProps.venueName) b.extendedProps.venueName = court.name;
              return b;
          });

          // Procesar recurrentes (desde el objeto court que ya tenemos en memoria o refrescamos)
          const recurring = court.settings?.recurringBlocks || [];
          const recurringEvents = recurring.map((r, i) => ({
              id: `rec-${i}`,
              title: r.title,
              startTime: r.startTime,
              endTime: r.endTime,
              daysOfWeek: r.daysOfWeek,
              display: 'background',
              backgroundColor: '#ef4444',
              editable: false
          }));

          setCalendarEvents([...events, ...recurringEvents]);

      } catch (error) { console.error(error); }
  };

  const handleCardClick = async (court, element) => {
    const rect = element.getBoundingClientRect();
    setHeroRect({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
    setSelectedCourt(court);
    
    await fetchCourtDetails(court); // Carga detalles completos para el modal
    
    setTimeout(() => setShowCalendar(true), 50);
  };

  const handleBack = () => {
    setShowCalendar(false);
    setTimeout(() => { setSelectedCourt(null); setHeroRect(null); }, 500);
  };

  const handleRefreshEvents = () => {
      if (selectedCourt) fetchCourtDetails(selectedCourt);
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500 font-bold uppercase tracking-widest">Cargando Plataforma...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      <div className="flex flex-col lg:flex-row min-h-screen pt-16">
        
        <LiveEventsSidebar 
            selectedDayId={selectedDaySidebar} 
            onSelectDay={setSelectedDaySidebar} 
            allEvents={allWeekEvents} 
        />

        <div className="flex-1 flex flex-col relative bg-slate-950 border-l border-slate-800 overflow-hidden">
            
            {/* Header */}
            <div className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-6 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">En Tiempo Real</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tighter leading-none">
                        Escenarios <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Disponibles</span>
                    </h1>
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-500 transition-colors" size={14}/>
                        <input type="text" placeholder="BUSCAR..." className="bg-slate-900 border border-slate-800 py-2 pl-9 pr-4 text-xs font-bold text-white focus:border-orange-500 focus:bg-slate-900 focus:outline-none w-full sm:w-64 rounded-sm transition-all placeholder:text-slate-600 uppercase"/>
                    </div>
                    <Button variant="ghost" className="h-[34px] px-3 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 rounded-sm"><Filter size={14}/></Button>
                </div>
            </div>

            {/* LISTA CON DATOS REALES INYECTADOS */}
            <div className="flex-1 p-6 lg:p-8 overflow-y-auto custom-scrollbar">
                <div className={`flex flex-col gap-6 transition-all duration-500 max-w-5xl mx-auto ${selectedCourt ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
                    {courts.map(court => (
                        <div key={court.id} className="w-full">
                            {/* CourtCard ahora recibe 'court' con 'events' dentro */}
                            <CourtCard 
                                court={court} 
                                onClick={(c, el) => handleCardClick(c, el)} 
                                isHidden={selectedCourt?.id === court.id}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {selectedCourt && heroRect && (
        <>
            <MorphingHeader court={selectedCourt} initialRect={heroRect} onBack={handleBack} />
            <FullCalendarView 
                isVisible={showCalendar} 
                initialEvents={calendarEvents} 
                venueId={selectedCourt.id} 
                onBookingCreated={handleRefreshEvents} 
            />
        </>
      )}
    </div>
  );
};

export default CalendarPage;
