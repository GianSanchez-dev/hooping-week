import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { 
  MapPin, Plus, Search, Save, Trash2, AlertTriangle, 
  Check, X, Settings, Image as ImageIcon, Power, 
  Maximize2, Minimize2, Clock, GripVertical, 
  Repeat, Calendar as CalendarIcon, Layout
} from 'lucide-react';
import api from '../../services/api';

const AdminVenuesPage = () => {
  // --- ESTADOS ---
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedVenueId, setSelectedVenueId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', location: '', status: 'active', image: '' });
  const [currentBlocks, setCurrentBlocks] = useState([]);

  // BÚSQUEDA
  const [searchTerm, setSearchTerm] = useState('');

  // UI States
  const [isCalendarFocused, setIsCalendarFocused] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarSize, setSidebarSize] = useState(300); // Ancho fijo inicial para desktop
  const [isResizing, setIsResizing] = useState(false);

  const calendarRef = useRef(null);
  
  // Clases de estilo compartidas (Design System)
  const labelClass = "text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block font-mono";
  const inputClass = "w-full bg-slate-950 border border-slate-800 text-white text-xs p-2.5 focus:border-orange-500 focus:bg-slate-900 outline-none transition-all rounded-sm placeholder:text-slate-700 font-medium";

  // 1. CARGAR DATOS
  const fetchVenues = async () => {
      try {
          const response = await api.get('/venues');
          setVenues(response.data);
      } catch (error) {
          console.error("Error:", error);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => { fetchVenues(); }, []);

  // Filtrado de Venues (Frontend)
  const filteredVenues = useMemo(() => {
      if (!searchTerm) return venues;
      const lowerTerm = searchTerm.toLowerCase();
      return venues.filter(v => 
          v.name.toLowerCase().includes(lowerTerm) || 
          v.location.toLowerCase().includes(lowerTerm)
      );
  }, [venues, searchTerm]);

  // 2. SELECCIONAR VENUE
  const handleSelectVenue = async (venue) => {
      setSelectedVenueId(venue.id);
      setIsCreating(false);
      setFormData({ 
          name: venue.name, 
          location: venue.location, 
          status: venue.status, 
          image: venue.image || '' 
      });
      setIsCalendarFocused(false);

      // A. Recurrentes
      const recurringRaw = venue.settings?.recurringBlocks || [];
      const recurringEvents = recurringRaw.map((r, index) => ({
          id: `rec-${index}`,
          title: r.title,
          startTime: r.startTime,
          endTime: r.endTime,
          daysOfWeek: r.daysOfWeek,
          display: 'background',
          backgroundColor: '#ef4444', 
          classNames: ['striped-bg'], // Clase custom para CSS
          editable: false,
          extendedProps: { type: 'recurring', originalIndex: index }
      }));

      // B. Únicos
      try {
          const res = await api.get(`/bookings?venueId=${venue.id}`);
          const oneOffEvents = res.data
            .filter(b => b.extendedProps.status === 'blocked')
            .map(b => ({
                id: b.id,
                title: b.title,
                start: b.start,
                end: b.end,
                display: 'background',
                backgroundColor: '#f59e0b',
                editable: false,
                extendedProps: { type: 'one-off' }
            }));
          
          setCurrentBlocks([...recurringEvents, ...oneOffEvents]);
      } catch (error) { console.error(error); }
  };

  const handleCreateNew = () => {
      setIsCreating(true);
      setSelectedVenueId(null);
      setFormData({ name: '', location: '', status: 'active', image: '' });
      setCurrentBlocks([]);
      setIsCalendarFocused(false);
  };

  // 3. GUARDAR
  const handleSave = async (e) => {
      e.preventDefault();
      if (!formData.name) return alert("Nombre requerido");
      try {
          const payload = { ...formData };
          if (selectedVenueId) {
              const currentVenue = venues.find(v => v.id === selectedVenueId);
              payload.settings = currentVenue.settings; 
          }

          if (isCreating) {
              const res = await api.post('/venues', payload);
              setVenues([...venues, res.data]);
              handleSelectVenue(res.data); 
          } else {
              const res = await api.put(`/venues/${selectedVenueId}`, payload);
              setVenues(venues.map(v => v.id === selectedVenueId ? { ...res.data, settings: res.data.settings } : v));
          }
          alert("Datos guardados.");
      } catch (error) { alert("Error al guardar."); }
  };

  const handleDeleteVenue = async () => {
      if(!confirm("¿Eliminar escenario?")) return;
      try {
          await api.delete(`/venues/${selectedVenueId}`);
          setVenues(venues.filter(v => v.id !== selectedVenueId));
          setSelectedVenueId(null);
          setIsCreating(false);
      } catch (error) { alert("Error al eliminar"); }
  };

  // 4. LÓGICA BLOQUEOS
  const handleDateSelect = async (selectInfo) => {
      if (!selectedVenueId) return alert("Guarda primero el escenario.");
      const calendarApi = selectInfo.view.calendar;
      calendarApi.unselect();

      const isRecurring = confirm("¿Bloqueo recurrente (Semanal)?\n\n[ACEPTAR] = Sí, se repite cada semana\n[CANCELAR] = No, solo esta fecha");
      const title = prompt("Motivo del bloqueo:") || "Mantenimiento";

      if (isRecurring) {
          const dayOfWeek = selectInfo.start.getDay();
          const toTime = (date) => date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
          
          const newRecBlock = { 
              title: title + " (R)", 
              startTime: toTime(selectInfo.start), 
              endTime: toTime(selectInfo.end), 
              daysOfWeek: [dayOfWeek]
          };
          
          const currentVenue = venues.find(v => v.id === selectedVenueId);
          const currentSettings = currentVenue.settings || {};
          const updatedSettings = { 
              ...currentSettings, 
              recurringBlocks: [...(currentSettings.recurringBlocks || []), newRecBlock] 
          };

          try {
              const res = await api.put(`/venues/${selectedVenueId}`, { settings: updatedSettings });
              const updatedVenue = res.data;
              setVenues(prev => prev.map(v => v.id === selectedVenueId ? updatedVenue : v));
              handleSelectVenue(updatedVenue);
          } catch (e) { alert("Error guardando recurrencia"); }

      } else {
          try {
              await api.post('/bookings', {
                  venueId: selectedVenueId,
                  title: `Bloqueo: ${title}`,
                  start: selectInfo.start,
                  end: selectInfo.end,
                  status: 'blocked',
                  description: 'Bloqueo administrativo'
              });
              const venue = venues.find(v => v.id === selectedVenueId);
              handleSelectVenue(venue); 
          } catch (e) { alert("Error creando bloqueo"); }
      }
  };

  const removeBlock = async (blockInfo) => {
      if(!confirm("¿Eliminar este bloqueo?")) return;
      const type = blockInfo.extendedProps?.type;
      const originalIndex = blockInfo.extendedProps?.originalIndex;

      if (type === 'one-off') {
          try {
              await api.delete(`/bookings/${blockInfo.id}`);
              setCurrentBlocks(prev => prev.filter(b => b.id !== blockInfo.id));
          } catch (e) { alert("Error borrando bloqueo"); }

      } else if (type === 'recurring') {
          const currentVenue = venues.find(v => v.id === selectedVenueId);
          const currentRec = currentVenue.settings?.recurringBlocks || [];
          const updatedRec = currentRec.filter((_, idx) => idx !== originalIndex);
          
          try {
              const res = await api.put(`/venues/${selectedVenueId}`, { 
                  settings: { ...currentVenue.settings, recurringBlocks: updatedRec } 
              });
              setVenues(prev => prev.map(v => v.id === selectedVenueId ? res.data : v));
              handleSelectVenue(res.data);
          } catch (e) { alert("Error borrando recurrencia"); }
      }
  };

  // --- RESIZING LOGIC ---
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startResizing = useCallback((e) => { e.preventDefault(); setIsResizing(true); }, []);
  const stopResizing = useCallback(() => { setIsResizing(false); setTimeout(() => calendarRef.current?.getApi().updateSize(), 100) }, []);
  const resize = useCallback((e) => {
    if (isResizing && !isMobile) {
      const newWidth = e.clientX - 350; // Restamos el ancho del sidebar izquierdo
      if (newWidth > 200 && newWidth < 600) setSidebarSize(newWidth);
    }
  }, [isResizing, isMobile]);

  useEffect(() => {
    if (isResizing) { window.addEventListener("mousemove", resize); window.addEventListener("mouseup", stopResizing); }
    return () => { window.removeEventListener("mousemove", resize); window.removeEventListener("mouseup", stopResizing); };
  }, [isResizing, resize, stopResizing]);


  return (
    <div className="h-screen bg-slate-950 text-slate-200 pt-16 flex flex-col font-sans overflow-hidden selection:bg-orange-500 selection:text-white">
      
      {/* CSS CUSTOM PARA FULLCALENDAR DARK MODE */}
      <style>{`
        .fc-theme-standard td, .fc-theme-standard th { border-color: #1e293b; }
        .fc-timegrid-slot { height: 24px !important; border-bottom: 1px solid #0f172a; }
        .fc-timegrid-slot-label-cushion { font-size: 10px !important; color: #475569; font-family: monospace; font-weight: bold; }
        .fc-col-header-cell-cushion { color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; padding: 12px 0 !important; font-weight: 800; }
        .fc-bg-event { opacity: 0.8 !important; }
        .striped-bg { background-image: repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.1) 5px, rgba(0,0,0,0.1) 10px); }
        .custom-calendar-wrapper { --fc-border-color: #1e293b; --fc-now-indicator-color: #f97316; }
      `}</style>

      <div className="flex-1 flex overflow-hidden">
         
         {/* --- 1. LISTA DE ESCENARIOS (IZQUIERDA) --- */}
         <div className={`
             border-r border-slate-800 flex flex-col bg-slate-950 flex-shrink-0 transition-all duration-500 ease-in-out z-20
             ${isCalendarFocused ? 'w-0 opacity-0 overflow-hidden border-none' : 'w-full lg:w-[320px] xl:w-[360px] opacity-100'}
         `}>
            {/* Header Lista */}
            <div className="p-6 border-b border-slate-800 pb-6">
                <div className="flex items-center gap-2 mb-2">
                    <Settings size={14} className="text-orange-500" />
                    <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Admin Panel</span>
                </div>
                <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none mb-4">
                    Infraestructura
                </h1>
                
                <div className="relative group mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-500 transition-colors" size={14}/>
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="BUSCAR ESCENARIO..." 
                        className="bg-slate-900 border border-slate-800 py-2.5 pl-9 pr-4 text-xs font-bold text-white focus:border-orange-500 focus:outline-none w-full rounded-sm uppercase tracking-wide placeholder:text-slate-600"
                    />
                </div>
            </div>

            {/* Items Lista */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {/* Botón Nuevo */}
                <button onClick={handleCreateNew} className={`w-full group relative border border-dashed rounded-sm p-4 flex items-center gap-4 transition-all ${isCreating ? 'border-orange-500 bg-orange-900/10' : 'border-slate-800 hover:border-slate-600 hover:bg-slate-900'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${isCreating ? 'bg-orange-500 border-orange-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-500 group-hover:border-orange-500 group-hover:text-orange-500'}`}>
                        <Plus size={18} />
                    </div>
                    <div className="text-left">
                        <span className={`block text-xs font-black uppercase ${isCreating ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>Nuevo Escenario</span>
                        <span className="text-[10px] text-slate-600 font-mono">Agregar a la red</span>
                    </div>
                </button>

                {filteredVenues.map(venue => (
                    <div key={venue.id} onClick={() => handleSelectVenue(venue)} className={`group relative flex gap-3 p-2 border rounded-sm cursor-pointer transition-all ${selectedVenueId === venue.id ? 'bg-slate-900 border-orange-500 shadow-[0_0_15px_rgba(234,88,12,0.1)]' : 'bg-slate-950 border-slate-800 hover:border-slate-600 hover:bg-slate-900'}`}>
                        {selectedVenueId === venue.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 animate-pulse"></div>}
                        
                        <div className="w-16 h-16 bg-slate-900 border border-slate-700 flex-shrink-0 overflow-hidden rounded-sm relative">
                            {venue.image ? (
                                <img src={venue.image} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"/>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-700"><Layout size={20}/></div>
                            )}
                            <div className={`absolute bottom-1 right-1 w-2 h-2 rounded-full border border-slate-900 ${venue.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <h3 className={`text-sm font-black uppercase italic truncate mb-1 ${selectedVenueId === venue.id ? 'text-white' : 'text-slate-300'}`}>{venue.name}</h3>
                            <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1"><MapPin size={10} className="text-slate-600"/> {venue.location}</p>
                        </div>
                        
                        {selectedVenueId === venue.id && <div className="flex items-center text-orange-500 pr-2"><Settings size={14} className="animate-spin-slow"/></div>}
                    </div>
                ))}
                
                {/* ESTADO VACÍO MEJORADO */}
                {filteredVenues.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-600 opacity-50">
                        {searchTerm ? (
                            <>
                                <Search size={32} className="mb-2 opacity-50"/>
                                <p className="text-[10px] font-bold uppercase tracking-widest">Sin coincidencias</p>
                            </>
                        ) : (
                            venues.length === 0 && (
                                <>
                                    <Layout size={32} className="mb-2 opacity-50"/>
                                    <p className="text-[10px] font-bold uppercase tracking-widest">Sin escenarios</p>
                                </>
                            )
                        )}
                    </div>
                )}
            </div>
         </div>

         {/* --- 2. EDITOR (DERECHA) --- */}
         <div className="flex-1 bg-slate-950 flex flex-col h-full overflow-hidden relative">
            {(selectedVenueId || isCreating) ? (
                <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-300">
                    
                    {/* A. FORMULARIO EDITAR (Top) */}
                    <div className={`border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm transition-all duration-500 ease-in-out overflow-hidden ${isCalendarFocused ? 'max-h-0 opacity-0 py-0 border-none' : 'max-h-[500px] opacity-100'}`}>
                        <div className="p-6 lg:p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-widest ${isCreating ? 'bg-orange-500/20 text-orange-500' : 'bg-blue-500/20 text-blue-400'}`}>
                                            {isCreating ? 'MODO CREACIÓN' : 'MODO EDICIÓN'}
                                        </span>
                                    </div>
                                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tight">{isCreating ? 'Nuevo Escenario' : 'Editar Escenario'}</h2>
                                </div>
                                <div className="flex gap-3">
                                    {selectedVenueId && <button onClick={handleDeleteVenue} className="h-9 w-9 flex items-center justify-center rounded-sm border border-slate-700 text-slate-500 hover:text-red-500 hover:border-red-500 hover:bg-red-900/10 transition-all" title="Eliminar"><Trash2 size={16}/></button>}
                                    <button onClick={handleSave} className="h-9 px-4 bg-orange-600 hover:bg-orange-500 text-white font-bold uppercase italic text-xs tracking-wider flex items-center gap-2 rounded-sm shadow-lg shadow-orange-900/20 skew-x-[-3deg] transition-all hover:translate-y-[-1px]"><Check size={14} className="skew-x-[3deg]"/> <span className="skew-x-[3deg]">Guardar Cambios</span></button>
                                </div>
                            </div>

                            <form className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* Preview Imagen */}
                                <div className="lg:col-span-3">
                                    <div className="aspect-video lg:aspect-square bg-slate-950 border border-slate-700 rounded-sm relative overflow-hidden group">
                                        {formData.image ? (
                                            <>
                                                <img src={formData.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Preview"/>
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                    <span className="text-[10px] font-bold text-white uppercase border border-white/30 px-2 py-1">Cambiar URL</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                                                <ImageIcon size={32} className="mb-2 opacity-50"/>
                                                <span className="text-[9px] font-bold uppercase">Sin Imagen</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Campos */}
                                <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className={labelClass}>Nombre del Escenario</label>
                                        <input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className={inputClass} placeholder="EJ: ARENA CENTRAL" />
                                    </div>
                                    
                                    <div>
                                        <label className={labelClass}>Ubicación</label>
                                        <div className="relative">
                                            <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
                                            <input value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className={`${inputClass} pl-9`} placeholder="EJ: ZONA NORTE" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelClass}>Estado Operativo</label>
                                        <button type="button" onClick={() => setFormData({...formData, status: formData.status === 'active' ? 'maintenance' : 'active'})} className={`w-full p-2.5 flex items-center justify-between rounded-sm border transition-all ${formData.status === 'active' ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-500 hover:border-emerald-500' : 'bg-red-950/30 border-red-500/30 text-red-500 hover:border-red-500'}`}>
                                            <span className="text-xs font-bold uppercase flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${formData.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                                {formData.status === 'active' ? 'Habilitado' : 'Mantenimiento'}
                                            </span>
                                            <Power size={14}/>
                                        </button>
                                    </div>
                                    
                                    <div className="md:col-span-2">
                                        <label className={labelClass}>URL de Imagen</label>
                                        <input value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} className={`${inputClass} font-mono text-[10px] text-slate-400`} placeholder="https://..." />
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* B. DISPONIBILIDAD (Calendario) */}
                    <div className="flex-1 flex flex-col bg-slate-950 relative overflow-hidden">
                        {/* Toolbar Calendario */}
                        <div className="flex justify-between items-center px-6 py-3 border-b border-slate-800 bg-slate-900/80">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-sm bg-orange-900/20 flex items-center justify-center text-orange-500 border border-orange-500/20">
                                    <AlertTriangle size={16}/>
                                </div>
                                <div>
                                    <h3 className="text-xs font-black text-white uppercase tracking-wide">Gestor de Bloqueos</h3>
                                    <span className="text-[10px] text-slate-500 font-mono hidden md:inline-block">Arrastra en el calendario para bloquear horas.</span>
                                </div>
                            </div>
                            <button onClick={() => setIsCalendarFocused(!isCalendarFocused)} className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase border transition-all ${isCalendarFocused ? 'bg-slate-800 text-white border-slate-600' : 'bg-transparent text-slate-500 border-slate-800 hover:border-slate-600'}`}>
                                {isCalendarFocused ? <Minimize2 size={12}/> : <Maximize2 size={12}/>} 
                                {isCalendarFocused ? 'RESTAURAR VISTA' : 'EXPANDIR'}
                            </button>
                        </div>
                        
                        <div className="flex-1 flex overflow-hidden relative">
                            {/* SIDEBAR REGLAS (Redimensionable) */}
                            <div style={{ width: isMobile ? '0px' : `${sidebarSize}px` }} className={`flex-shrink-0 bg-slate-950 border-r border-slate-800 flex flex-col transition-all duration-75 ${isMobile ? 'overflow-hidden opacity-0' : 'opacity-100'}`}>
                                <div className="p-3 bg-slate-900/50 border-b border-slate-800 flex justify-between items-center">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Reglas Activas</span>
                                    <span className="text-[9px] font-mono text-orange-500 bg-orange-900/20 px-1.5 py-0.5 rounded">{currentBlocks.length}</span>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                                    {currentBlocks.length === 0 && (
                                        <div className="text-center py-8 opacity-50">
                                            <CalendarIcon size={24} className="mx-auto mb-2 text-slate-600"/>
                                            <p className="text-[10px] text-slate-500 uppercase font-bold">Sin bloqueos</p>
                                        </div>
                                    )}
                                    {currentBlocks.map((block, idx) => (
                                        <div key={block.id || idx} className="group relative bg-slate-900 border border-slate-800 hover:border-slate-600 p-2 rounded-sm transition-colors pl-3 overflow-hidden">
                                            {/* Indicador lateral de color */}
                                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${block.extendedProps?.type === 'recurring' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                                            
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        {block.extendedProps?.type === 'recurring' 
                                                            ? <Repeat size={10} className="text-red-500 flex-shrink-0"/> 
                                                            : <Clock size={10} className="text-amber-500 flex-shrink-0"/>
                                                        }
                                                        <span className="text-[10px] font-bold text-slate-200 uppercase truncate">{block.title}</span>
                                                    </div>
                                                    <div className="text-[9px] text-slate-500 font-mono leading-tight">
                                                        {block.daysOfWeek 
                                                            ? <span className="text-red-400">Semanal (Día {block.daysOfWeek[0]})</span> 
                                                            : <span className="text-amber-400">{new Date(block.start).toLocaleDateString()}</span>
                                                        }
                                                        <span className="block text-slate-600 mt-0.5">
                                                            {block.startTime || new Date(block.start).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})} - {block.endTime || new Date(block.end).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button onClick={() => removeBlock({ id: block.id, extendedProps: block.extendedProps })} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-900/30 text-slate-600 hover:text-red-500 rounded transition-all">
                                                    <X size={12}/>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* DRAG HANDLE */}
                            {!isMobile && (
                                <div 
                                    onMouseDown={startResizing} 
                                    className={`w-1 h-full cursor-col-resize z-10 hover:bg-orange-500 transition-colors flex items-center justify-center ${isResizing ? 'bg-orange-500' : 'bg-slate-800 hover:bg-slate-700'}`}
                                >
                                    <GripVertical size={8} className="text-slate-950 opacity-50"/>
                                </div>
                            )}

                            {/* AREA CALENDARIO */}
                            <div className="flex-1 bg-slate-900 p-2 overflow-hidden custom-calendar-wrapper">
                                <FullCalendar
                                    ref={calendarRef}
                                    plugins={[timeGridPlugin, interactionPlugin]}
                                    initialView="timeGridWeek"
                                    headerToolbar={{ left: 'prev,next today', center: 'title', right: 'timeGridDay,timeGridWeek' }}
                                    buttonText={{ week: 'SEMANA', day: 'DÍA', today: 'HOY' }}
                                    titleFormat={{ month: 'long', year: 'numeric' }}
                                    dayHeaderFormat={{ weekday: 'short', day: 'numeric', omitCommas: true }}
                                    slotLabelFormat={{ hour: '2-digit', minute: '2-digit', omitZeroMinute: false, meridiem: false, hour12: false }}
                                    locale={esLocale}
                                    slotMinTime="06:00:00" 
                                    slotMaxTime="24:00:00" 
                                    allDaySlot={false} 
                                    slotDuration="01:00:00" 
                                    snapDuration="00:30:00"
                                    scrollTime="08:00:00"
                                    selectable={true} 
                                    editable={true} 
                                    selectMirror={true} 
                                    height="100%"
                                    events={currentBlocks}
                                    select={handleDateSelect}
                                    eventClick={(info) => removeBlock({ id: info.event.id, extendedProps: info.event.extendedProps })}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 p-8 text-center animate-in fade-in duration-500">
                    <div className="w-24 h-24 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center mb-6 shadow-2xl">
                        <Settings size={40} className="opacity-40 animate-spin-slow duration-[10s]"/>
                    </div>
                    <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">Selecciona un Escenario</h3>
                    <p className="text-sm text-slate-500 max-w-sm">
                        Elige un escenario del panel izquierdo para editar sus detalles, imagen y gestionar sus horarios de disponibilidad.
                    </p>
                </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default AdminVenuesPage;
