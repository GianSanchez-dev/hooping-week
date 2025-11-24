import React, { useState, useEffect, useRef, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { Clock, GripVertical, GripHorizontal } from 'lucide-react';
import api from '../../services/api'; 
import EventDetailsPanel from './EventDetailsPanel';
import BookingFormPanel from './BookingFormPanel';
import { useAuth } from '../../context/AuthContext';

const FullCalendarView = ({ isVisible, initialEvents = [], venueId, onBookingCreated }) => {
  const { user } = useAuth(); // Si user es null, es un visitante
  const [events, setEvents] = useState(initialEvents);
  
  useEffect(() => { if (initialEvents) setEvents(initialEvents); }, [initialEvents]);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [bookingDraft, setBookingDraft] = useState(null);
  
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarSize, setSidebarSize] = useState(window.innerWidth < 1024 ? 300 : window.innerWidth * 0.30);
  const [isResizing, setIsResizing] = useState(false);
  
  const sidebarRef = useRef(null);
  const calendarRef = useRef(null);

  // --- RESIZE LOGIC ---
  useEffect(() => {
    const handleResize = () => { setIsMobile(window.innerWidth < 1024); if (!window.innerWidth < 1024) setSidebarSize(window.innerWidth * 0.30); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const startResizing = useCallback((e) => { e.preventDefault(); setIsResizing(true); }, []);
  const stopResizing = useCallback(() => { setIsResizing(false); }, []);
  const resize = useCallback((e) => { if (isResizing) { if (isMobile) { const newHeight = window.innerHeight - e.clientY; if (newHeight > 80 && newHeight < window.innerHeight - 100) setSidebarSize(newHeight); } else { const newWidth = window.innerWidth - e.clientX; if (newWidth > 300 && newWidth < window.innerWidth - 50) setSidebarSize(newWidth); } } }, [isResizing, isMobile]);
  useEffect(() => { if (isResizing) { window.addEventListener("mousemove", resize); window.addEventListener("mouseup", stopResizing); } return () => { window.removeEventListener("mousemove", resize); window.removeEventListener("mouseup", stopResizing); window.removeEventListener("touchend", stopResizing); }; }, [isResizing, resize, stopResizing]);

  // --- HANDLERS ---

  const handleDateSelect = (selectInfo) => {
    // SEGURIDAD EXTRA: Si no hay usuario, no hacer nada (aunque selectable=false ya lo previene)
    if (!user) return;

    if(sidebarSize < 100) setSidebarSize(isMobile ? 300 : window.innerWidth * 0.30);
    setSelectedEvent(null);
    setBookingDraft({ start: selectInfo.start, end: selectInfo.end, allDay: selectInfo.allDay });
  };

  const handleEventClick = (clickInfo) => {
    // Permitimos VER detalles incluso si no está logueado, pero no editar
    if (clickInfo.event.display === 'background') return;

    if(sidebarSize < 100) setSidebarSize(isMobile ? 300 : window.innerWidth * 0.30);
    setBookingDraft(null);
    setSelectedEvent({ 
        title: clickInfo.event.title, 
        start: clickInfo.event.start, 
        end: clickInfo.event.end, 
        extendedProps: clickInfo.event.extendedProps 
    });
  };

  const handleManualTimeUpdate = (startTimeStr, endTimeStr) => {
    if (!bookingDraft) return;
    const baseDate = new Date(bookingDraft.start);
    const [startHour, startMin] = startTimeStr.split(':').map(Number);
    const [endHour, endMin] = endTimeStr.split(':').map(Number);
    const newStart = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), startHour, startMin);
    const newEnd = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), endHour, endMin);
    if (newEnd <= newStart) return alert("Hora fin incorrecta");
    setBookingDraft({ start: newStart, end: newEnd, allDay: false });
    if (calendarRef.current) calendarRef.current.getApi().select({ start: newStart, end: newEnd, allDay: false });
  };

  const handleCreateBooking = async (formData) => {
    if (!user) return; // Bloqueo final
    try {
        const payload = {
            venueId: venueId,
            title: formData.title,
            start: formData.start,
            end: formData.end,
            sportType: formData.sportType,
            description: formData.description,
            banner: formData.banner,
            team: formData.selectedTeams,
            userId: user.id 
        };
        const response = await api.post('/bookings', payload);
        
        if (onBookingCreated) onBookingCreated();
        setBookingDraft(null);
        if (calendarRef.current) calendarRef.current.getApi().unselect();
        alert("Solicitud enviada.");
    } catch (error) {
        console.error(error);
        alert("Error al crear reserva.");
    }
  };

  return (
    <div className={`fixed left-0 right-0 bottom-0 top-[144px] z-30 overflow-hidden bg-slate-950 transition-all duration-700 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'} ${isResizing ? 'select-none cursor-col-resize' : ''}`}>
      
      <div className="absolute top-0 bottom-0 left-0 z-0 p-4 transition-[width] duration-500" style={{ width: isMobile ? '100%' : '70%' }}>
         <div className="h-full w-full bg-slate-900 border border-slate-800 rounded-lg overflow-hidden p-2 custom-calendar-wrapper shadow-inner">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              headerToolbar={{ left: 'prev,next', center: 'title', right: 'today timeGridWeek,timeGridDay' }}
              buttonText={{ today: 'Hoy', month: 'Mes', week: 'Semana', day: 'Día', list: 'Lista' }}
              titleFormat={{ month: 'long', year: 'numeric' }}
              dayHeaderFormat={{ weekday: 'short', day: 'numeric', omitCommas: true }}
              slotLabelFormat={{ hour: '2-digit', minute: '2-digit', omitZeroMinute: false, meridiem: false, hour12: false }}
              allDaySlot={false}
              slotMinTime="06:00:00"
              slotMaxTime="23:00:00"
              nowIndicator={true}
              slotDuration="01:00:00"
              snapDuration="00:30:00"
              initialView={isMobile ? "timeGridDay" : "timeGridWeek"}
              locale={esLocale}
              selectMirror={true}
              unselectAuto={false}
              dayMaxEvents={true}
              height="100%"
              events={events}
              eventClick={handleEventClick}
              select={handleDateSelect}
              
              // --- LÓGICA PÚBLICA / PRIVADA ---
              // Si hay usuario (!null), es editable y seleccionable. Si no, solo lectura.
              editable={!!user} 
              selectable={!!user} 
              
              // Impedir selección sobre bloqueos (solo si hay usuario)
              selectOverlap={(event) => event.display !== 'background'}
            />
         </div>
      </div>

      <div ref={sidebarRef} style={{ width: isMobile ? '100%' : `${sidebarSize}px`, height: isMobile ? `${sidebarSize}px` : '100%' }} className={`absolute z-40 bg-slate-900/95 backdrop-blur-md border-slate-800 shadow-2xl transition-none flex flex-col ${isMobile ? 'bottom-0 left-0 right-0 border-t' : 'top-0 right-0 bottom-0 border-l'}`}>
         <div onMouseDown={startResizing} onTouchStart={startResizing} className={`absolute flex items-center justify-center z-50 bg-slate-900 border-slate-700 hover:bg-orange-600 hover:border-orange-600 transition-colors group shadow-lg ${isResizing ? 'bg-orange-600 border-orange-600' : ''} ${isMobile ? 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-5 rounded-full border cursor-row-resize' : 'left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 h-16 w-5 rounded-full border cursor-col-resize'}`}>
             {isMobile ? <GripHorizontal size={14} className={`text-slate-400 group-hover:text-white ${isResizing ? 'text-white' : ''}`} /> : <GripVertical size={14} className={`text-slate-400 group-hover:text-white ${isResizing ? 'text-white' : ''}`} />}
         </div>

         <div className="w-full h-full overflow-hidden bg-slate-900">
            {/* VER DETALLES (Público y Privado) */}
            {selectedEvent && (
                <EventDetailsPanel event={selectedEvent} onClose={() => setSelectedEvent(null)} />
            )}

            {/* CREAR RESERVA (Solo con usuario) */}
            {!selectedEvent && bookingDraft && user && (
                <BookingFormPanel 
                    draftData={bookingDraft}
                    onClose={() => { setBookingDraft(null); calendarRef.current?.getApi().unselect(); }}
                    onSubmit={handleCreateBooking}
                    onManualTimeChange={handleManualTimeUpdate}
                />
            )}

            {/* ESTADO VACÍO / MODO VISITANTE */}
            {!selectedEvent && !bookingDraft && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50 p-6">
                    <Clock size={isMobile ? 32 : 48} className="text-slate-700 mb-4"/>
                    <h3 className="text-lg font-bold text-white uppercase">
                        {user ? 'Detalles' : 'Modo Visitante'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 max-w-[200px]">
                        {user 
                           ? 'Selecciona una reserva para ver info o toca el calendario para reservar.'
                           : 'Inicia sesión para realizar una reserva. Puedes explorar los eventos haciendo clic en ellos.'
                        }
                    </p>
                </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default FullCalendarView;
