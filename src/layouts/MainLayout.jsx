import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { Trophy, Mail, MapPin } from 'lucide-react';

// --- COMPONENTES DEL FOOTER ---

const FooterLink = ({ to, children }) => (
  <li>
    <Link to={to} className="text-xs text-slate-500 hover:text-orange-500 transition-colors flex items-center gap-2 group">
      <span className="w-1 h-1 rounded-full bg-slate-700 group-hover:bg-orange-500 transition-colors"></span>
      {children}
    </Link>
  </li>
);

const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 pt-16 pb-8 relative overflow-hidden">
      {/* Decoración de fondo sutil */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-12">
          
          {/* 1. BRAND COLUMN & MISION (6 Cols para dar espacio al texto) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-orange-600 flex items-center justify-center skew-x-[-10deg] shadow-[0_0_20px_rgba(234,88,12,0.2)] border border-orange-500">
                    <Trophy className="text-white skew-x-[10deg]" size={20} strokeWidth={2.5} />
                </div>
                <div>
                    <span className="text-2xl font-black text-white tracking-tighter italic leading-none block">
                        HOPPING<span className="text-orange-600">WEEK</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em]">Sports Manager</span>
                </div>
            </div>
            <p className="text-xs leading-relaxed text-slate-400 font-medium text-justify pr-0 lg:pr-12">
              Una solución tecnológica diseñada para gestionar de manera ordenada y transparente el préstamo de escenarios deportivos. 
              Nuestra plataforma busca resolver la falta de mecanismos eficientes en la asignación de horarios, previniendo conflictos y promoviendo la inclusión. 
              Facilitamos el acceso equitativo a la práctica deportiva, fortaleciendo la cohesión de la comunidad y optimizando la administración de los espacios disponibles.
            </p>
          </div>

          {/* 2. LINKS COLUMN (Plataforma - 3 Cols) */}
          <div className="lg:col-span-3 lg:col-start-8">
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-6 border-l-2 border-orange-500 pl-3">Plataforma</h4>
            <ul className="space-y-3">
              <FooterLink to="/calendar">Explorar Canchas</FooterLink>
              <FooterLink to="/my-bookings">Mi Agenda</FooterLink>
              <FooterLink to="/my-teams">Mis Equipos</FooterLink>
            </ul>
          </div>

          {/* 3. CONTACT COLUMN (3 Cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-6 border-l-2 border-slate-700 pl-3">Ubicación</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 group">
                <div className="p-1.5 mt-0.5 bg-slate-900 rounded-sm border border-slate-800 group-hover:border-orange-500/50 transition-colors">
                    <MapPin size={14} className="text-orange-500" />
                </div>
                <div>
                    <span className="text-xs font-bold text-slate-300 block uppercase mb-0.5">Universidad de Cartagena</span>
                    <span className="text-xs text-slate-500 block leading-tight">Sede Piedra de Bolívar</span>
                    <span className="text-[10px] text-slate-600 font-mono uppercase mt-1 block">Cartagena, Colombia</span>
                </div>
              </li>
              <li className="flex items-center gap-3 group pt-2">
                <div className="p-1.5 bg-slate-900 rounded-sm border border-slate-800 group-hover:border-orange-500/50 transition-colors">
                    <Mail size={14} className="text-orange-500" />
                </div>
                <span className="text-xs text-slate-400 group-hover:text-white transition-colors">contacto@hoppingweek.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM BAR (Minimalista) */}
        <div className="border-t border-slate-900 pt-8 flex justify-center md:justify-between items-center">
          <div className="text-[10px] text-slate-600 font-mono uppercase tracking-wide">
            &copy; 2025 HoppingWeek
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- LAYOUT PRINCIPAL ---

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Navbar fijo */}
      <Navbar />
      
      {/* Contenido Principal */}
      {/* pt-16 compensa la altura del navbar fijo */}
      <main className="flex-grow w-full flex flex-col relative z-0">
        <Outlet />
      </main>
      
      {/* Footer Profesional */}
      <Footer />
    </div>
  );
};

export default MainLayout;
