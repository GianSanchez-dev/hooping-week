import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Trophy, ArrowRight, AlertTriangle, Loader2, User, Check, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';

// Avatares predefinidos
const PRESET_AVATARS = [
  "https://img.freepik.com/free-vector/mysterious-mafia-man-smoking-cigarette_52683-34828.jpg",
  "https://img.freepik.com/free-vector/work-out-concept-illustration_114360-1181.jpg",
  "https://img.freepik.com/free-vector/hand-drawn-nft-style-ape-illustration_23-2149622021.jpg",
  "https://img.freepik.com/free-vector/cool-monkey-wearing-sunglasses-hat-listening-music-with-headphone-cartoon-vector-icon-illustration_138676-2978.jpg",
  "https://img.freepik.com/free-vector/cute-cool-baby-waving-hand-cartoon-vector-icon-illustration-people-holiday-icon-concept-isolated_138676-5666.jpg"
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth(); 
  
  // Estado para controlar la animación de entrada
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Activa la animación al montar el componente
    setIsLoaded(true);
  }, []);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatar: '' 
  });
  
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleAvatarSelect = (url) => {
    setFormData(prev => ({ ...prev, avatar: url }));
    setCustomAvatarUrl(''); // Limpiar el input manual si selecciona un preset
  };

  const handleCustomAvatarChange = (e) => {
    const url = e.target.value;
    setCustomAvatarUrl(url);
    setFormData(prev => ({ ...prev, avatar: url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    
    const result = await register(formData);

    if (result.success) {
      navigate('/auth/login');
    } else {
      setError(result.message || "Error al registrarse.");
    }
    setLoading(false);
  };

  const labelClass = "text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block font-mono";
  const inputClass = "w-full bg-slate-950 border border-slate-800 text-white text-sm p-3 focus:border-orange-500 focus:bg-slate-900 outline-none transition-all rounded-sm placeholder:text-slate-700 font-medium";

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-200 font-sans selection:bg-orange-500 selection:text-white">
      
      {/* --- COLUMNA IZQUIERDA: IMAGEN Y ANIMACIÓN --- */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-slate-900 items-center justify-center">
         <div className="absolute inset-0 opacity-40">
             <img 
               src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2069&auto=format&fit=crop" 
               className="w-full h-full object-cover grayscale" 
               alt="Background"
             />
             <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/50 to-transparent mix-blend-multiply"></div>
             <div className="absolute inset-0 bg-orange-900/20 mix-blend-overlay"></div>
         </div>

         <div className="relative z-10 max-w-lg p-12">
             {/* Bloque 1: Icono */}
             <div className={`transition-all duration-1000 ease-out transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="w-16 h-16 bg-orange-600 flex items-center justify-center mb-6 skew-x-[-10deg] shadow-lg shadow-orange-900/50 border-2 border-white/10">
                   <Trophy size={32} className="text-white skew-x-[10deg]"/>
                </div>
             </div>

             {/* Bloque 2: Título Principal (con delay) */}
             <div className="overflow-hidden mb-2">
                 <h1 className={`text-6xl font-black text-white uppercase italic tracking-tighter leading-none drop-shadow-2xl transition-transform duration-1000 delay-150 ease-out ${isLoaded ? 'translate-y-0' : 'translate-y-[120%]'}`}>
                    Únete a la
                 </h1>
             </div>

             {/* Bloque 3: Subtítulo (con más delay) */}
             <div className="overflow-hidden mb-6">
                 <h1 className={`text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500 uppercase italic tracking-tighter leading-none transition-transform duration-1000 delay-300 ease-out ${isLoaded ? 'translate-y-0' : 'translate-y-[120%]'}`}>
                    Élite
                 </h1>
             </div>

             {/* Bloque 4: Descripción (Fade in) */}
             <p className={`text-lg text-slate-400 font-mono border-l-2 border-orange-500 pl-4 transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                Gestiona tus equipos, reserva escenarios y domina la liga.
             </p>
         </div>
      </div>

      {/* --- COLUMNA DERECHA: FORMULARIO --- */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-24 relative bg-slate-950 overflow-y-auto custom-scrollbar">
         
         {/* Mobile Header */}
         <div className="lg:hidden mb-8 flex items-center gap-3">
             <div className="w-10 h-10 bg-orange-600 flex items-center justify-center skew-x-[-10deg]">
                <Trophy size={20} className="text-white skew-x-[10deg]"/>
             </div>
             <span className="text-xl font-black italic uppercase tracking-tighter text-white">HoppingWeek</span>
         </div>

         <div className={`max-w-md w-full mx-auto transition-opacity duration-700 delay-200 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
             <div className="mb-8">
                 <h2 className="text-3xl font-black text-white uppercase italic mb-2">Crear Cuenta</h2>
                 <p className="text-sm text-slate-500">Configura tu perfil de jugador.</p>
             </div>

             {error && (
                 <div className="mb-6 bg-red-900/10 border border-red-900/30 p-3 flex items-center gap-3 text-red-500 text-xs font-bold uppercase tracking-wide">
                     <AlertTriangle size={16} />
                     {error}
                 </div>
             )}

             <form onSubmit={handleSubmit} className="space-y-5">
                 
                 {/* --- SECCIÓN DE AVATAR MEJORADA --- */}
                 <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-sm">
                    <label className={labelClass}>Elige tu Avatar</label>
                    
                    {/* Lista Horizontal de Presets */}
                    <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar mb-4">
                        <div 
                           onClick={() => handleAvatarSelect('')}
                           className={`
                              flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center cursor-pointer border-2 transition-all
                              ${formData.avatar === '' && !customAvatarUrl
                                ? 'bg-slate-800 border-orange-500 text-white shadow-[0_0_15px_rgba(234,88,12,0.3)]' 
                                : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'
                              }
                           `}
                           title="Automático (Iniciales)"
                        >
                           <User size={20} />
                        </div>

                        {PRESET_AVATARS.map((url, idx) => (
                           <div 
                              key={idx}
                              onClick={() => handleAvatarSelect(url)}
                              className={`
                                 flex-shrink-0 w-12 h-12 rounded-full overflow-hidden cursor-pointer border-2 transition-all relative
                                 ${formData.avatar === url 
                                    ? 'border-orange-500 scale-105 shadow-[0_0_15px_rgba(234,88,12,0.3)]' 
                                    : 'border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-600'
                                 }
                              `}
                           >
                              <img src={url} className="w-full h-full object-cover" alt={`Avatar ${idx}`} />
                           </div>
                        ))}
                    </div>

                    {/* Input para URL Personalizada */}
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                            <LinkIcon size={14} />
                        </div>
                        <input 
                            type="text" 
                            placeholder="O pega el enlace de tu imagen..." 
                            value={customAvatarUrl}
                            onChange={handleCustomAvatarChange}
                            className={`${inputClass} pl-9 pr-12 text-xs`}
                        />
                        {/* Pequeña previsualización si hay URL válida */}
                        {customAvatarUrl && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full overflow-hidden border border-slate-600 bg-slate-800">
                                <img 
                                    src={customAvatarUrl} 
                                    onError={(e) => e.target.style.display = 'none'} // Ocultar si está rota
                                    className="w-full h-full object-cover" 
                                    alt="Preview" 
                                />
                            </div>
                        )}
                    </div>
                 </div>

                 {/* Resto del formulario */}
                 <div>
                     <label className={labelClass}>Nombre Completo</label>
                     <input 
                       type="text" 
                       name="fullName" 
                       value={formData.fullName}
                       onChange={handleChange}
                       className={inputClass}
                       placeholder="EJ: JUAN PÉREZ"
                       required
                     />
                 </div>

                 <div>
                     <label className={labelClass}>Correo Electrónico</label>
                     <input 
                       type="email" 
                       name="email"
                       value={formData.email}
                       onChange={handleChange}
                       className={inputClass}
                       placeholder="usuario@ejemplo.com"
                       required
                     />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                     <div>
                         <label className={labelClass}>Contraseña</label>
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
                     <div>
                         <label className={labelClass}>Confirmar</label>
                         <input 
                           type="password" 
                           name="confirmPassword"
                           value={formData.confirmPassword}
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
                   className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black uppercase italic tracking-widest py-4 px-6 flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_20px_rgba(234,88,12,0.4)] disabled:opacity-50 disabled:cursor-not-allowed group mt-4 skew-x-[-2deg]"
                 >
                    {loading ? <Loader2 size={20} className="animate-spin"/> : <>Registrarse <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/></>}
                 </button>

             </form>

             <div className="mt-8 pt-6 border-t border-slate-800 text-center">
                 <p className="text-xs text-slate-500 font-mono">
                    ¿Ya tienes una cuenta? {' '}
                    <Link to="/auth/login" className="text-orange-500 font-bold hover:text-orange-400 hover:underline uppercase">
                        Inicia Sesión
                    </Link>
                 </p>
             </div>
         </div>
      </div>
    </div>
  );
};

export default RegisterPage;
