import React, { useState, useMemo } from 'react';
import { MapPin, Flame, BarChart3, CalendarClock } from 'lucide-react';

// --- HELPERS ---

// Genera etiquetas LUN, MAR, etc. a partir de HOY
const getWeekDaysLabels = () => {
  const days = [];
  const curr = new Date();
  const dayNames = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
  
  for(let i=0; i<7; i++) {
      const d = new Date();
      d.setDate(curr.getDate() + i);
      days.push(dayNames[d.getDay()]);
  }
  return days;
};

// LÓGICA MATEMÁTICA: Convierte lista de eventos en [0, 2.5, 4, ...] horas por día
const getOccupancyData = (events) => {
  // Inicializar 7 días en 0
  const dailyHours = Array(7).fill(0);
  
  // Normalizar "Hoy" a medianoche para comparar fechas sin horas
  const today = new Date();
  today.setHours(0,0,0,0);

  if (!events || !Array.isArray(events)) return dailyHours;

  events.forEach(evt => {
      // 1. Filtramos: Solo cuentan eventos APROBADOS o BLOQUEOS (Mantenimiento)
      const status = evt.extendedProps?.status || evt.status; 
      if (status !== 'approved' && status !== 'blocked') return;

      const start = new Date(evt.start);
      const end = new Date(evt.end);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) return;

      // 2. Calcular en qué índice (0-6) cae este evento respecto a HOY
      const checkDate = new Date(start);
      checkDate.setHours(0,0,0,0); 

      // Diferencia en milisegundos -> Días
      const diffTime = checkDate.getTime() - today.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      // 3. Si cae en la semana actual (0=Hoy ... 6=Dentro de una semana)
      if (diffDays >= 0 && diffDays < 7) {
          const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // ms -> horas
          dailyHours[diffDays] += durationHours;
      }
  });

  return dailyHours;
};

const CourtCard = ({ court, onClick, isHidden }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const weekDays = useMemo(() => getWeekDaysLabels(), []);
  
  // Procesar eventos para la gráfica
  const occupancyData = useMemo(() => getOccupancyData(court.events), [court.events]);
  
  // Calcular máximo para la escala (mínimo 4h para evitar barras gigantes con 1h)
  const maxOccupancy = Math.max(4, ...occupancyData);
  
  // Total horas ocupadas en la semana
  const totalWeeklyHours = occupancyData.reduce((a, b) => a + b, 0);

  if (isHidden) {
    return <div className="h-48 w-full opacity-0 pointer-events-none" />;
  }

  return (
    <div 
      onClick={(e) => onClick(court, e.currentTarget)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        group relative h-48 w-full cursor-pointer bg-slate-950 border-2 transition-all duration-300 overflow-hidden rounded-sm
        ${isHovered 
            ? 'border-orange-500 shadow-[0_0_30px_rgba(234,88,12,0.15)] transform scale-[1.005] z-10' 
            : 'border-slate-800'
        }
      `}
    >
      <div className="flex h-full">
        
        {/* --- IZQUIERDA: IMAGEN --- */}
        <div className="relative w-[65%] h-full overflow-hidden">
          <img 
            src={court.image || "https://via.placeholder.com/400x200?text=Cancha"} 
            alt={court.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Gradiente para legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent" />
          
          <div className="absolute bottom-0 left-0 p-5 w-full z-10">
              <div className="backdrop-blur-sm bg-slate-950/60 border-l-4 border-orange-500 p-3 max-w-md">
                 <h3 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tight leading-none truncate">
                    {court.name}
                 </h3>
                 <p className="text-xs text-slate-300 mt-1.5 font-mono flex items-center gap-1.5">
                   <MapPin size={12} className="text-orange-500"/> {court.location}
                 </p>
              </div>
          </div>
        </div>

        {/* --- DERECHA: GRÁFICA REAL --- */}
        <div className="relative w-[35%] bg-slate-950 border-l border-slate-800 flex flex-col p-4">
           
           {/* Header Stats */}
           <div className="flex justify-between items-start mb-auto">
               <div className="flex flex-col">
                   <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1 mb-0.5">
                      <BarChart3 size={10}/> Ocupación
                   </span>
                   <span className="text-sm font-black text-white font-mono leading-none">
                       {totalWeeklyHours.toFixed(1)}h <span className="text-[8px] text-slate-600 font-normal text-xs">/ 7 DÍAS</span>
                   </span>
               </div>
               <CalendarClock size={16} className="text-orange-500 opacity-50 group-hover:opacity-100 transition-opacity"/>
           </div>

           {/* Gráfica de Barras */}
           <div className="flex justify-between items-end h-20 gap-1 w-full pb-1 border-b border-slate-800/50">
              {weekDays.map((day, index) => {
                 const hours = occupancyData[index];
                 const isToday = index === 0;
                 
                 // Es el día más ocupado (y tiene al menos algo de ocupación)
                 const isHottest = hours > 0 && hours === Math.max(...occupancyData);
                 
                 // Altura porcentual (mínimo 10% para que se vea la barra vacía)
                 const heightPercent = Math.max(10, (hours / maxOccupancy) * 100);

                 return (
                   <div key={index} className="flex flex-col items-center gap-1 flex-1 min-w-[8px] h-full justify-end group/bar">
                      
                      {/* Barra Vertical */}
                      <div className="w-full relative flex items-end h-full">
                          {/* Contenedor de la barra */}
                          <div 
                             style={{ height: `${heightPercent}%` }} 
                             className={`
                                 w-full rounded-t-sm relative transition-all duration-500 ease-out
                                 ${isHottest 
                                    ? 'bg-gradient-to-t from-orange-600 to-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.4)]' // Fuego
                                    : isToday 
                                        ? 'bg-white' // Hoy
                                        : 'bg-slate-800 group-hover/bar:bg-slate-700' // Normal
                                 }
                             `}
                          >
                             {/* ICONO DE FUEGO (Solo si es Hottest) */}
                             {isHottest && (
                                 <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-full flex justify-center pointer-events-none">
                                     <Flame size={12} className="text-orange-500 fill-orange-500 animate-bounce drop-shadow-md" style={{ animationDuration: '2s' }}/>
                                 </div>
                             )}
                          </div>
                      </div>

                      {/* Letra del día */}
                      <span className={`text-[8px] font-bold font-mono ${isToday ? 'text-white' : 'text-slate-600'}`}>
                        {day.charAt(0)}
                      </span>
                   </div>
                 );
              })}
           </div>

           {/* Footer */}
           <div className="mt-2 text-right">
              <span className="text-[9px] font-bold uppercase text-slate-500 group-hover:text-orange-500 transition-colors flex justify-end items-center gap-1">
                 Ver Disponibilidad &rarr;
              </span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CourtCard;
