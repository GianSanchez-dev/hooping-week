import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Trophy, User, Shield, LogOut, Menu, X, 
  Calendar, Activity, Map, ChevronDown, Settings 
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const isAdmin = user?.role === 'admin_cancha' || user?.role === 'super_admin';

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, children, icon: Icon }) => (
    <Link 
      to={to} 
      className={`
        relative h-full flex items-center gap-2 px-1 text-xs font-bold uppercase tracking-widest transition-all duration-300 border-b-2
        ${isActive(to) 
          ? 'text-white border-orange-500' 
          : 'text-slate-500 border-transparent hover:text-orange-400'
        }
      `}
    >
      {Icon && <Icon size={14} className={`mb-0.5 ${isActive(to) ? 'text-orange-500' : 'text-slate-600 group-hover:text-orange-400'}`}/>}
      {children}
      {isActive(to) && (
        <div className="absolute bottom-0 left-0 w-full h-px bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"></div>
      )}
    </Link>
  );

  const MobileLink = ({ to, children, icon: Icon, onClick }) => (
    <Link 
      to={to} 
      onClick={onClick}
      className={`
        block px-4 py-3 rounded-sm text-sm font-bold uppercase tracking-wide border-l-2 transition-all
        ${isActive(to) 
          ? 'bg-orange-900/10 border-orange-500 text-orange-500' 
          : 'border-transparent text-slate-400 hover:bg-slate-900 hover:text-white'
        }
      `}
    >
      <div className="flex items-center gap-3">
        {Icon && <Icon size={18}/>}
        {children}
      </div>
    </Link>
  );

  return (
    <nav className="fixed w-full h-16 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 z-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          
          {/* --- LOGO --- */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 bg-orange-600 flex items-center justify-center skew-x-[-10deg] shadow-[0_0_15px_rgba(234,88,12,0.3)] transition-transform group-hover:scale-110 duration-300 border border-orange-500">
                    <Trophy className="text-white skew-x-[10deg] drop-shadow-md" size={16} strokeWidth={3} />
                </div>
                <div className="flex flex-col justify-center">
                    <span className="text-xl font-black text-white tracking-tighter italic leading-none group-hover:text-orange-500 transition-colors">
                        HOPPING<span className="text-orange-600">WEEK</span>
                    </span>
                    <span className="text-[8px] font-mono text-slate-500 uppercase tracking-[0.2em] leading-none">Sports Manager</span>
                </div>
            </Link>
          </div>

          {/* --- DESKTOP NAV --- */}
          <div className="hidden md:flex items-center h-full gap-6 lg:gap-8">
            <NavLink to="/calendar" icon={Calendar}>Explorar</NavLink>
            <NavLink to="/my-bookings" icon={Activity}>Agenda</NavLink>
            <NavLink to="/my-teams" icon={Shield}>Equipos</NavLink>
            
            {/* ADMIN SECTION */}
            {isAdmin && (
                <div className="flex items-center gap-4 pl-4 border-l border-slate-800 h-8 my-auto">
                    <Link 
                      to="/admin/bookings" 
                      className={`
                        flex items-center gap-2 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-sm border transition-all hover:-translate-y-0.5
                        ${isActive('/admin/bookings')
                          ? 'bg-orange-600 text-white border-orange-500 shadow-lg shadow-orange-900/20'
                          : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-orange-500 hover:text-orange-500'
                        }
                      `}
                    >
                      <Shield size={12}/> Gestión
                    </Link>

                    <Link 
                      to="/admin/venues" 
                      className={`
                        flex items-center gap-2 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-sm border transition-all hover:-translate-y-0.5
                        ${isActive('/admin/venues')
                          ? 'bg-orange-600 text-white border-orange-500 shadow-lg shadow-orange-900/20'
                          : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-orange-500 hover:text-orange-500'
                        }
                      `}
                    >
                      <Map size={12}/> Escenarios
                    </Link>
                </div>
            )}
          </div>

          {/* --- USER PROFILE --- */}
          <div className="hidden md:flex items-center gap-4">
             {user ? (
                <div className="relative" onMouseLeave={() => setIsProfileMenuOpen(false)}>
                    <button 
                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                        className="flex items-center gap-3 group focus:outline-none"
                    >
                        <div className="text-right hidden lg:block">
                            <p className="text-xs font-bold text-white uppercase group-hover:text-orange-500 transition-colors">{user.fullName}</p>
                            <p className="text-[9px] text-slate-500 font-mono uppercase tracking-wide">{user.role?.replace('_', ' ')}</p>
                        </div>
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center overflow-hidden group-hover:border-orange-500 transition-colors shadow-md">
                                <img src={user.avatar || "https://via.placeholder.com/150"} alt="Avatar" className="w-full h-full object-cover"/>
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-slate-950 rounded-full p-0.5 border border-slate-800">
                                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-950"></div>
                            </div>
                        </div>
                        <ChevronDown size={14} className={`text-slate-500 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`}/>
                    </button>

                    {/* DROPDOWN MENU */}
                    {isProfileMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-800 shadow-2xl rounded-sm py-1 animate-in fade-in slide-in-from-top-2 z-50">
                            <div className="px-4 py-3 border-b border-slate-800 mb-1 lg:hidden">
                                <p className="text-xs font-bold text-white uppercase">{user.fullName}</p>
                                <p className="text-[9px] text-slate-500 font-mono">{user.role}</p>
                            </div>
                            <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 uppercase transition-colors">
                                <User size={14}/> Mi Perfil
                            </Link>
                            <Link to="/settings" className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 uppercase transition-colors">
                                <Settings size={14}/> Configuración
                            </Link>
                            <div className="h-px bg-slate-800 my-1"></div>
                            <button onClick={handleLogout} className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-900/10 uppercase transition-colors">
                                <LogOut size={14}/> Cerrar Sesión
                            </button>
                        </div>
                    )}
                </div>
             ) : (
                 <Link to="/auth/login" className="text-xs font-black text-white bg-orange-600 hover:bg-orange-500 px-5 py-2 rounded-sm shadow-lg shadow-orange-900/20 transition-all hover:-translate-y-0.5 uppercase tracking-wider border border-orange-500">
                    Iniciar Sesión
                 </Link>
             )}
          </div>

          {/* --- MOBILE MENU BTN --- */}
          <div className="flex md:hidden">
            <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                className="text-slate-400 hover:text-white p-2 rounded-sm hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* --- MOBILE MENU OVERLAY --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-slate-950 border-b border-slate-800 shadow-2xl animate-in slide-in-from-top-5 z-40 flex flex-col max-h-[calc(100vh-64px)] overflow-y-auto">
          <div className="p-4 space-y-1">
            {user && (
                <div className="flex items-center gap-3 mb-6 px-3 py-4 bg-slate-900/50 border border-slate-800 rounded-sm">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-700">
                        <img src={user.avatar || "https://via.placeholder.com/150"} alt="Avatar" className="w-full h-full object-cover"/>
                    </div>
                    <div>
                        <p className="text-sm font-black text-white uppercase">{user.fullName}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                            <p className="text-xs text-slate-500 uppercase font-mono tracking-wider">{user.role}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-1">
                <p className="px-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2 mt-2">Navegación</p>
                <MobileLink to="/calendar" icon={Calendar} onClick={() => setIsMobileMenuOpen(false)}>Explorar Canchas</MobileLink>
                <MobileLink to="/my-bookings" icon={Activity} onClick={() => setIsMobileMenuOpen(false)}>Mi Agenda</MobileLink>
                <MobileLink to="/my-teams" icon={Shield} onClick={() => setIsMobileMenuOpen(false)}>Mis Equipos</MobileLink>
            </div>

            {isAdmin && (
                <div className="space-y-1 mt-4 border-t border-slate-800 pt-4">
                    <p className="px-4 text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Shield size={10}/> Admin Zone</p>
                    <MobileLink to="/admin/bookings" onClick={() => setIsMobileMenuOpen(false)}>
                        <span className="text-orange-500">Gestión Solicitudes</span>
                    </MobileLink>
                    <MobileLink to="/admin/venues" onClick={() => setIsMobileMenuOpen(false)}>
                        <span className="text-orange-500">Infraestructura</span>
                    </MobileLink>
                </div>
            )}

            <div className="border-t border-slate-800 mt-4 pt-4 pb-4">
                <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-950/20 rounded-sm uppercase transition-colors">
                    <LogOut size={18}/> Cerrar Sesión
                </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
