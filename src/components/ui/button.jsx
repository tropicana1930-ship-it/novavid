import React from "react";
import clsx from "clsx";

/**
 * Componente de Botón simple con variantes predefinidas.
 * Esta versión reemplaza la implementación de cva/shadcn con una estructura simple basada en clsx.
 * * NOTA: Esta implementación simplificada solo soporta las variantes 'default', 'primary' y 'ghost'.
 */
export function Button({ children, className, variant = "default", ...props }) {
  // Clases base compartidas por todos los botones
  const base = "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

  // Definición de las variantes de estilo con los paddings y colores solicitados
  const variants = {
    // Estilo default: bg-slate-700
    default: "h-10 px-4 py-2 bg-slate-700 text-white hover:bg-slate-600 shadow-md",
    
    // Estilo primary: degradado de indigo a sky (con padding y shadow adecuados para ser 'primary')
    primary: "h-11 px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-sky-500 text-white shadow-xl hover:shadow-2xl transition-shadow",
    
    // Estilo ghost: fondo transparente con hover en slate-800
    ghost: "h-10 px-3 py-1 bg-transparent text-slate-200 hover:bg-slate-800",
  };
  
  // Combina las clases base, la variante seleccionada y cualquier clase personalizada
  return (
    <button className={clsx(base, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}