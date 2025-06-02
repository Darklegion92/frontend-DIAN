import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  onClick,
  type = 'button'
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';

  const variantClasses = {
    primary: 'bg-soltec-primary hover:bg-soltec-600 text-white shadow-soltec hover:shadow-soltec-lg hover:scale-105 focus:ring-soltec-primary/50',
    secondary: 'bg-soltec-secondary hover:bg-soltec-300 text-soltec-dark shadow-md hover:shadow-lg hover:scale-105 focus:ring-soltec-secondary/50',
    outline: 'border-2 border-soltec-primary text-soltec-primary hover:bg-soltec-50 focus:ring-soltec-primary/50',
    ghost: 'text-soltec-primary hover:bg-soltec-50 focus:ring-soltec-primary/50'
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const widthClass = fullWidth ? 'w-full' : '';

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`;

  return (
    <button
      type={type}
      className={combinedClasses}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading && (
        <LoadingSpinner
          size="sm"
          color={variant === 'primary' ? 'white' : 'primary'}
          className="mr-2"
        />
      )}
      {children}
    </button>
  );
};

export default Button; 