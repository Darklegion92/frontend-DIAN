import React, { forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps {
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  placeholder?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  showPasswordToggle?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  type = 'text',
  placeholder,
  error,
  helperText,
  disabled = false,
  required = false,
  className = '',
  value,
  onChange,
  onBlur,
  showPasswordToggle = false,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const inputType = type === 'password' && showPassword ? 'text' : type;

  const baseClasses = 'w-full px-4 py-3 border rounded-xl transition-all duration-200 bg-white/90 backdrop-blur-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
  
  const focusClasses = error 
    ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
    : 'border-gray-300 focus:border-soltec-primary focus:ring-2 focus:ring-soltec-primary/20';

  const inputClasses = `${baseClasses} ${focusClasses} ${className}`;

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (onBlur) {
      onBlur(e);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={ref}
          type={inputType}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          value={value}
          onChange={onChange}
          onBlur={handleBlur}
          className={inputClasses}
          {...props}
        />
        
        {type === 'password' && showPasswordToggle && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600 animate-fade-in">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input; 