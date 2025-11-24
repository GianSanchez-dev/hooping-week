import React, { useState, useEffect } from 'react';
import { ChevronLeft, MapPin } from 'lucide-react';

const MorphingHeader = ({ court, initialRect, onBack }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsExpanded(true), 10);
    const contentTimer = setTimeout(() => setShowContent(true), 500); 
    return () => {
      clearTimeout(timer);
      clearTimeout(contentTimer);
    };
  }, []);

  const style = isExpanded ? {
    top: '64px', 
    left: '0px',
    width: '100%',
    height: '80px', // Altura reducida de 96px a 80px para dejar más espacio al contenido
    borderRadius: '0px'
  } : {
    top: `${initialRect.top}px`,
    left: `${initialRect.left}px`,
    width: `${initialRect.width}px`,
    height: `${initialRect.height}px`, 
    borderRadius: '0px'
  };

  return (
    <div 
      className={`fixed z-40 bg-slate-900 shadow-lg transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] 
                 ${isExpanded ? 'border-b border-slate-700' : ''} 
                 overflow-hidden`}
      style={style}
    >
      {/* IMAGEN DE FONDO QUE SE ADAPTA */}
      <div 
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-500`}
        style={{ backgroundImage: `url(${court.image})`, opacity: isExpanded ? 0.2 : 1 }} // Opacidad reducida al expandir
      >
        {/* Capa de degradado oscuro para legibilidad del texto */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-950/40 to-slate-900/50" />
      </div>

      <div className="w-full h-full relative flex items-center justify-between max-w-7xl mx-auto px-4">
        
        {/* Contenido Izquierdo (Botón Volver y Título/Detalles) */}
        <div className={`flex items-center gap-6 h-full relative z-10 transition-opacity duration-300 ${showContent ? 'opacity-100 delay-200' : 'opacity-0'}`}>
          {/* Botón Volver Minimalista */}
          <button 
            onClick={onBack} 
            className="h-full px-4 border-r border-slate-700 text-slate-400 hover:text-orange-500 hover:bg-slate-800 transition-colors duration-200 flex items-center gap-2"
          >
            <ChevronLeft size={20} className="text-orange-500"/> 
            <span className="hidden sm:inline font-bold text-sm tracking-wide">VOLVER</span>
          </button>
          
          {/* Detalles de la Cancha */}
          <div className="flex items-center gap-4">
            {/* NO se usa miniatura, la imagen principal es el fondo */}
            <div>
              <h2 className="text-xl font-bold text-white uppercase italic tracking-tight leading-none">{court.name}</h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-mono mt-1">
                <span className="flex items-center gap-1">
                  <MapPin size={12} className="text-orange-500"/> {court.location}
                </span>
                <span className="text-emerald-400 font-bold tracking-wider">
                  DISPONIBLE
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Título que aparece durante la transición (para mantenerlo centrado en la tarjeta) */}
        {!showContent && (
          <div className="absolute bottom-4 left-4 z-20">
            <h3 className="text-2xl font-black text-white uppercase italic">{court.name}</h3>
          </div>
        )}

        {/* --- REMOVIDO: Contenido Derecho (Botón de Reserva) --- */}
        {/* El botón de reserva ha sido eliminado, ya no hay contenido a la derecha */}

      </div>
    </div>
  );
};

export default MorphingHeader;
