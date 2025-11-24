import React from 'react';

const Button = ({ children, variant = 'primary', className = '', onClick, style, ...props }) => {
  const baseStyles = "px-6 py-3 font-bold text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 border-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-orange-600 border-orange-600 text-white hover:bg-orange-700 hover:border-orange-700 hover:shadow-[0_0_15px_rgba(234,88,12,0.5)]",
    secondary: "bg-slate-900 border-slate-700 text-slate-300 hover:border-orange-500 hover:text-white",
    ghost: "border-transparent text-slate-400 hover:text-orange-500 hover:bg-slate-900",
    danger: "bg-red-900/20 border-red-600 text-red-500 hover:bg-red-900/40",
    outline: "bg-transparent text-orange-500 border-orange-500 hover:bg-orange-500 hover:text-white"
  };

  return (
    <button 
      onClick={onClick} 
      style={style} 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
