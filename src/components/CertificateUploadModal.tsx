import React, { useState } from 'react';
import { Upload, X, AlertCircle, FileText, Lock, Shield } from 'lucide-react';
import Button from './Button';
import Input from './Input';
import LoadingSpinner from './LoadingSpinner';
import { certificateService } from '../services/certificateService';

interface CertificateUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: number;
  companyName: string;
  onSuccess?: () => void;
  bearerToken: string;
}

const CertificateUploadModal: React.FC<CertificateUploadModalProps> = ({
  isOpen,
  onClose,
  companyId,
  companyName,
  onSuccess,
  bearerToken
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.name.toLowerCase().endsWith('.p12')) {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Solo se permiten archivos .p12');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remover el prefijo "data:application/x-pkcs12;base64," para obtener solo el base64
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Seleccione un archivo .p12');
      return;
    }

    if (!password.trim()) {
      setError('Ingrese la contraseña del certificado');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Convertir archivo a base64
      const base64Content = await convertToBase64(file);



      // Preparar datos para el servicio (formato que espera el backend)
      const certificateData = {
        certificate: base64Content,
        password: password.trim(),
        bearerToken
      };

      // Llamar al servicio de certificados
      await certificateService.uploadCertificate(certificateData);
      
      onSuccess?.();
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Error al cargar el certificado');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFile(null);
      setPassword('');
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
      
      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-soltec-primary" />
              <h3 className="text-lg font-medium text-gray-900">
                Cargar Certificado
              </h3>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Empresa */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Empresa:</p>
              <p className="font-medium text-gray-900 truncate">{companyName}</p>
            </div>

            {/* Área de drop de archivo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Archivo del Certificado (.p12) *
              </label>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`
                  border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
                  ${dragOver ? 'border-soltec-primary bg-soltec-primary/5' : 'border-gray-300 hover:border-gray-400'}
                  ${file ? 'border-green-300 bg-green-50' : ''}
                `}
              >
                <input
                  type="file"
                  accept=".p12"
                  onChange={handleFileChange}
                  className="hidden"
                  id="certificate-file"
                  disabled={loading}
                />
                <label htmlFor="certificate-file" className="cursor-pointer">
                  {file ? (
                    <div className="space-y-2">
                      <FileText className="h-8 w-8 text-green-500 mx-auto" />
                      <p className="text-sm font-medium text-green-700">{file.name}</p>
                      <p className="text-xs text-green-600">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                      <p className="text-sm text-gray-600">
                        Arrastra y suelta tu archivo .p12 aquí
                      </p>
                      <p className="text-xs text-gray-500">
                        o haz clic para seleccionar
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <Input
                label="Contraseña del Certificado"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa la contraseña"
                required
                disabled={loading}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              
              <Button
                type="submit"
                variant="primary"
                disabled={loading || !file || !password.trim()}
                className="w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" color="white" />
                    <span className="ml-2">Cargando...</span>
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Cargar Certificado
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CertificateUploadModal; 