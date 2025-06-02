import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, MapPin, X } from 'lucide-react';
import { catalogService, MunicipalityOption } from '../services/catalogService';
import LoadingSpinner from './LoadingSpinner';

interface MunicipalitySearchSelectorProps {
  label?: string;
  value?: number | '';
  onChange: (value: number | '') => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  error?: string;
}

const MunicipalitySearchSelector: React.FC<MunicipalitySearchSelectorProps> = ({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder = "Buscar municipio...",
  error
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [municipalities, setMunicipalities] = useState<MunicipalityOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMunicipality, setSelectedMunicipality] = useState<MunicipalityOption | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Cargar municipios iniciales
  useEffect(() => {
    loadMunicipalities(undefined);
  }, []);

  // Encontrar municipio seleccionado cuando cambia el value
  useEffect(() => {
    if (value && municipalities.length > 0) {
      const selected = municipalities.find(m => m.id === value);
      setSelectedMunicipality(selected || null);
    } else {
      setSelectedMunicipality(null);
    }
  }, [value, municipalities]);

  // Búsqueda con debounce
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (isOpen) {
        loadMunicipalities(searchTerm);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm, isOpen]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadMunicipalities = async (search?: string) => {
    try {
      setLoading(true);
      const results = await catalogService.searchMunicipalities(search, 50);
      
      // Asegurar que results sea un array
      if (Array.isArray(results)) {
        setMunicipalities(results);
      } else {
        console.warn('searchMunicipalities no devolvió un array:', results);
        setMunicipalities([]);
      }
    } catch (err) {
      console.error('Error loading municipalities:', err);
      setMunicipalities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleSelect = (municipality: MunicipalityOption) => {
    onChange(municipality.id);
    setSelectedMunicipality(municipality);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSelectedMunicipality(null);
    setSearchTerm('');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative" ref={dropdownRef}>
        {/* Input principal */}
        <div
          className={`
            w-full px-3 py-2 border rounded-md shadow-sm cursor-pointer transition-all duration-200 bg-white 
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}
            ${error ? 'border-red-300 focus-within:border-red-500' : 'border-gray-300 focus-within:border-soltec-primary'}
            ${isOpen ? 'ring-2 ring-soltec-primary/20' : ''}
          `}
          onClick={handleToggle}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1 min-w-0">
              <MapPin className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
              <span className={`truncate ${selectedMunicipality ? 'text-gray-900' : 'text-gray-500'}`}>
                {selectedMunicipality ? selectedMunicipality.displayName : placeholder}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              {selectedMunicipality && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  disabled={disabled}
                >
                  <X className="h-3 w-3 text-gray-400" />
                </button>
              )}
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
            {/* Campo de búsqueda */}
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Buscar municipio..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-soltec-primary/20 focus:border-soltec-primary text-sm"
                />
              </div>
            </div>

            {/* Lista de opciones */}
            <div className="max-h-48 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <LoadingSpinner size="sm" color="primary" />
                  <span className="ml-2 text-sm text-gray-500">Buscando...</span>
                </div>
              ) : municipalities.length === 0 ? (
                <div className="py-4 px-3 text-sm text-gray-500 text-center">
                  {searchTerm ? 'No se encontraron municipios' : 'Sin resultados'}
                </div>
              ) : (
                Array.isArray(municipalities) && municipalities.map((municipality) => (
                  <button
                    key={municipality.id}
                    type="button"
                    onClick={() => handleSelect(municipality)}
                    className={`
                      w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors
                      ${selectedMunicipality?.id === municipality.id ? 'bg-soltec-primary/10 text-soltec-primary' : 'text-gray-900'}
                    `}
                  >
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{municipality.name}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {municipality.department?.name} - Código: {municipality.code}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
};

export default MunicipalitySearchSelector;