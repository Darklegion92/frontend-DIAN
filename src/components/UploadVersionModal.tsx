import React, { useState, useRef } from 'react';
import { X, Upload, FileCode, Plus, Minus, AlertCircle, CheckCircle } from 'lucide-react';
import { CreateVersionData, systemService } from '../services/systemService';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';

interface UploadVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const UploadVersionModal: React.FC<UploadVersionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<CreateVersionData>({
    version: '',
    changeLog: [''],
    forceUpdate: false,
    releaseDate: new Date().toISOString().split('T')[0],
    description: '',
    isLatest: true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleChangeLogUpdate = (index: number, value: string) => {
    const newChangeLog = [...formData.changeLog];
    newChangeLog[index] = value;
    setFormData(prev => ({ ...prev, changeLog: newChangeLog }));
  };

  const addChangeLogItem = () => {
    setFormData(prev => ({
      ...prev,
      changeLog: [...prev.changeLog, '']
    }));
  };

  const removeChangeLogItem = (index: number) => {
    if (formData.changeLog.length > 1) {
      const newChangeLog = formData.changeLog.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, changeLog: newChangeLog }));
    }
  };

  const handleFileSelect = (file: File) => {
    const validation = systemService.validateExeFile(file);
    if (!validation.isValid) {
      setError(validation.error || 'Archivo no válido');
      return;
    }

    setSelectedFile(file);
    setError(null);

    // Auto-completar el nombre de la versión si está vacío
    if (!formData.version) {
      const fileName = file.name.replace('.exe', '');
      const versionMatch = fileName.match(/v?(\d+\.\d+\.\d+)/);
      if (versionMatch) {
        setFormData(prev => ({ ...prev, version: versionMatch[1] }));
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Debes seleccionar un archivo .exe');
      return;
    }

    if (!formData.version.trim()) {
      setError('La versión es requerida');
      return;
    }

    const validChangeLog = formData.changeLog.filter(item => item.trim() !== '');
    if (validChangeLog.length === 0) {
      setError('Debes agregar al menos un cambio en el changelog');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const uploadData: CreateVersionData = {
        ...formData,
        changeLog: validChangeLog
      };

      await systemService.uploadVersion(uploadData, selectedFile);
      onSuccess();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Upload className="h-6 w-6 text-soltec-primary mr-2" />
            Subir Nueva Versión
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* File Upload */}
          <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                Archivo .exe *
              </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive
                  ? 'border-soltec-primary bg-blue-50'
                  : selectedFile
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="flex items-center justify-center space-x-3">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {systemService.formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div>
                  <FileCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-2">
                    Arrastra tu archivo .exe aquí o{' '}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-soltec-primary hover:text-soltec-primary/80 font-medium"
                    >
                      selecciona un archivo
                    </button>
                  </p>
                  <p className="text-xs text-gray-500">
                    Solo archivos .exe (máximo 500MB)
                  </p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".exe"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>

          {/* Version */}
          <div>
            <label htmlFor="version" className="block text-sm font-medium text-gray-700 mb-2">
              Versión *
            </label>
            <input
              type="text"
              id="version"
              name="version"
              value={formData.version}
              onChange={handleInputChange}
              placeholder="ej: 1.0.0"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soltec-primary focus:border-transparent"
            />
          </div>

          {/* Release Date */}
          <div>
            <label htmlFor="releaseDate" className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Lanzamiento *
            </label>
            <input
              type="date"
              id="releaseDate"
              name="releaseDate"
              value={formData.releaseDate}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soltec-primary focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Descripción breve de esta versión..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soltec-primary focus:border-transparent"
            />
          </div>

          {/* Change Log */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lista de Cambios *
            </label>
            <div className="space-y-2">
              {formData.changeLog.map((change, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={change}
                    onChange={(e) => handleChangeLogUpdate(index, e.target.value)}
                    placeholder={`Cambio ${index + 1}...`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soltec-primary focus:border-transparent"
                  />
                  {formData.changeLog.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeChangeLogItem(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addChangeLogItem}
                className="flex items-center space-x-1 text-soltec-primary hover:text-soltec-primary/80 text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Agregar cambio</span>
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isLatest"
                name="isLatest"
                checked={formData.isLatest}
                onChange={handleInputChange}
                className="h-4 w-4 text-soltec-primary focus:ring-soltec-primary border-gray-300 rounded"
              />
              <label htmlFor="isLatest" className="ml-2 block text-sm text-gray-700">
                Marcar como versión más reciente
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="forceUpdate"
                name="forceUpdate"
                checked={formData.forceUpdate}
                onChange={handleInputChange}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="forceUpdate" className="ml-2 block text-sm text-gray-700">
                Actualización crítica (forzar actualización)
              </label>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={uploading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={uploading || !selectedFile}
              className="flex items-center space-x-2"
            >
              {uploading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Subiendo...</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>Subir Versión</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadVersionModal; 