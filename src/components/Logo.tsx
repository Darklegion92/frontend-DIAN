import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'text';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'full',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-24'
  };

  const LogoIcon = () => (
    <div className={`inline-flex items-center ${sizeClasses[size]}`}>
      <div className="relative">
        {/* Cuadrado naranja del logo */}
        <div className="aspect-square h-full bg-gradient-to-br from-soltec-primary to-soltec-accent rounded-lg shadow-soltec">
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-3/4 h-3/4 bg-white/90 rounded backdrop-blur-sm border border-white/30">
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-1/2 h-1/2 bg-gradient-to-br from-soltec-primary to-soltec-accent rounded-sm"></div>
              </div>
            </div>
          </div>
        </div>
        {/* Efecto de brillo */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent rounded-lg"></div>
      </div>
    </div>
  );

  const LogoText = () => (
    <div className="inline-flex items-center">
      <span className="font-bold text-2xl tracking-tight">
        <span className="text-gray-800">Sol</span>
        <span className="text-soltec-primary">Tec</span>
      </span>
      <div className="ml-2">
        <div className="text-xs text-gray-600 leading-tight">
          Tecnología y Desarrollo
        </div>
      </div>
    </div>
  );

  const LogoComplete = () => (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <img 
        src="/logo largo.gif" 
        alt="SolTec - Tecnología y Desarrollo" 
        className={`${sizeClasses[size]} w-auto object-contain`}
      />
    </div>
  );

  if (variant === 'icon') {
    return <LogoIcon />;
  }

  if (variant === 'text') {
    return <LogoText />;
  }

  // Para 'full', usar el logo largo real en GIF
  return <LogoComplete />;
};

export default Logo; 