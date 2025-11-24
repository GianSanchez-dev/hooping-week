import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Trophy, ArrowRight, AlertTriangle, Loader2, Lock, Mail } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // Estado para animación de entrada
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate('/calendar');
    } else {
      setError(result.message || "Credenciales incorrectas.");
    }
    
    setLoading(false);
  };

  // Estilos compartidos (Design System)
  const labelClass = "text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block font-mono";
  const inputWrapperClass = "relative group";
  const inputClass = "w-full bg-slate-950 border border-slate-800 text-white text-sm p-3 pl-10 focus:border-orange-500 focus:bg-slate-900 outline-none transition-all rounded-sm placeholder:text-slate-700 font-medium";
  const iconClass = "absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-orange-500 transition-colors";

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-200 font-sans selection:bg-orange-500 selection:text-white">
      
      {/* --- COLUMNA IZQUIERDA: IMAGEN & ANIMACIÓN --- */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-slate-900 items-center justify-center">
         <div className="absolute inset-0 opacity-30">
             <img 
               src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2093&auto=format&fit=crop" 
               className="w-full h-full object-cover grayscale" 
               alt="Stadium Tunnel"
             />
             <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900/80 to-orange-900/20 mix-blend-multiply"></div>
         </div>

         <div className="relative z-10 max-w-lg p-12 text-right">
             {/* Bloque 1: Icono (Animado) */}
             <div className={`flex justify-end mb-6 transition-all duration-1000 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                 <div className="w-16 h-16 bg-orange-600 flex items-center justify-center skew-x-[-10deg] shadow-lg shadow-orange-900/50 border-2 border-white/10">
                    <Trophy size={32} className="text-white skew-x-[10deg]"/>
                 </div>
             </div>

             {/* Bloque 2: Título (Animado) */}
             <div className="overflow-hidden mb-2">
                 <h1 className={`text-7xl font-black text-white uppercase italic tracking-tighter leading-none drop-shadow-2xl transition-transform duration-1000 delay-150 ease-out ${isLoaded ? 'translate-y-0' : 'translate-y-[120%]'}`}>
                    Bienvenido
                 </h1>
             </div>

             {/* Bloque 3: Subtítulo (Animado) */}
             <div className="overflow-hidden mb-6">
                 <h1 className={`text-7xl font-black text-transparent bg-clip-text bg-gradient-to-l from-orange-500 to-amber-500 uppercase italic tracking-tighter leading-none transition-transform duration-1000 delay-300 ease-out ${isLoaded ? 'translate-y-0' : 'translate-y-[120%]'}`}>
                    De Nuevo
                 </h1>
             </div>

             {/* Bloque 4: Descripción (Fade) */}
             <p className={`text-lg text-slate-400 font-mono mt-4 transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
                El campo de juego está listo para ti.
             </p>
         </div>
      </div>

      {/* --- COLUMNA DERECHA: FORMULARIO --- */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-24 relative bg-slate-950 overflow-y-auto custom-scrollbar">
         
         {/* Logo Móvil */}
         <div className="lg:hidden mb-12 flex justify-center">
             <div className="w-12 h-12 bg-orange-600 flex items-center justify-center skew-x-[-10deg]">
                <Trophy size={24} className="text-white skew-x-[10deg]"/>
             </div>
         </div>

         <div className={`max-w-md w-full mx-auto transition-opacity duration-700 delay-200 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
             <div className="mb-10">
                 <h2 className="text-3xl font-black text-white uppercase italic mb-2 flex items-center gap-3">
                    <Lock size={28} className="text-slate-600"/> Acceso
                 </h2>
                 <p className="text-sm text-slate-500">Ingresa tus credenciales para continuar.</p>
             </div>

             {error && (
                 <div className="mb-6 bg-red-900/10 border-l-4 border-red-500 p-3 flex items-center gap-3 text-red-500 text-xs font-bold uppercase tracking-wide animate-in slide-in-from-left-2">
                     <AlertTriangle size={16} />
                     {error}
                 </div>
             )}

             <form onSubmit={handleSubmit} className="space-y-6">
                 
                 <div>
                     <label className={labelClass}>Correo Electrónico</label>
                     <div className={inputWrapperClass}>
                         <Mail size={16} className={iconClass} />
                         <input 
                           type="email" 
                           name="email"
                           value={formData.email}
                           onChange={handleChange}
                           className={inputClass}
                           placeholder="usuario@ejemplo.com"
                           autoFocus
                           required
                         />
                     </div>
                 </div>

                 <div>
                     <div className="flex justify-between items-center mb-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Contraseña</label>
                        <a href="#" className="text-[9px] text-orange-500 hover:text-orange-400 hover:underline uppercase font-bold transition-colors">¿Olvidaste tu contraseña?</a>
                     </div>
                     <div className={inputWrapperClass}>
                         <Lock size={16} className={iconClass} />
                         <input 
                           type="password" 
                           name="password"
                           value={formData.password}
                           onChange={handleChange}
                           className={inputClass}
                           placeholder="••••••"
                           required
                         />
                     </div>
                 </div>

                 <button 
                   type="submit" 
                   disabled={loading}
                   className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black uppercase italic tracking-widest py-4 px-6 flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_20px_rgba(234,88,12,0.4)] disabled:opacity-50 disabled:cursor-not-allowed group mt-8 skew-x-[-2deg]"
                 >
                    {loading ? <Loader2 size={20} className="animate-spin"/> : <span className="skew-x-[2deg] flex items-center gap-2">Ingresar <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/></span>}
                 </button>

             </form>

             <div className="mt-10 pt-6 border-t border-slate-800 text-center">
                 <p className="text-xs text-slate-500 font-mono">
                    ¿No tienes cuenta? {' '}
                    <Link to="/auth/register" className="text-orange-500 font-bold hover:text-orange-400 hover:underline uppercase transition-colors">
                        Regístrate
                    </Link>
                 </p>
             </div>
         </div>
      </div>
    </div>
  );
};

export default LoginPage;
