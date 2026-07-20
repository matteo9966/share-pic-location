import { useRef, useState } from 'react';
import {  uploadToPrivateFolder } from '../../../utils/aws-utils';

interface ImageUploaderProps {
  idToken: string;
  onUploadSuccess?: (fileName: string) => void;
  onUploadError?: (error: Error) => void;
}

interface UploadStatus {
  fileName: string;
  status: 'idle' | 'uploading' | 'success' | 'error';
  error?: string;
}

export const ImageUploader = ({
  idToken,
  onUploadSuccess,
  onUploadError,
}: ImageUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadStatuses, setUploadStatuses] = useState<UploadStatus[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.currentTarget.files;
    if (files) {
      setSelectedFiles(Array.from(files));
      setUploadStatuses([]);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    const newStatuses: UploadStatus[] = selectedFiles.map(file => ({
      fileName: file.name,
      status: 'uploading',
    }));
    setUploadStatuses(newStatuses);

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
    //   const privateFilename = createKeyForPrivateFolder(file.name, idToken); // Assuming idToken represents the userId
      try {
        const success = await uploadToPrivateFolder(file, idToken);
        if (success) {
          setUploadStatuses(prev => [
            ...prev.slice(0, i),
            { fileName: file.name, status: 'success' },
            ...prev.slice(i + 1),
          ]);
          onUploadSuccess?.(file.name);
        } else {
          throw new Error('Upload failed');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setUploadStatuses(prev => [
          ...prev.slice(0, i),
          {
            fileName: file.name,
            status: 'error',
            error: errorMessage,
          },
          ...prev.slice(i + 1),
        ]);
        onUploadError?.(error instanceof Error ? error : new Error(errorMessage));
      }
    }

    setIsUploading(false);
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearSelected = () => {
    setSelectedFiles([]);
    setUploadStatuses([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-md rounded-lg border border-gray-300 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Upload Images</h2>

      {/* File Input */}
      <div className="mb-4">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          disabled={isUploading}
          className="block w-full cursor-pointer rounded-lg border border-gray-300 bg-gray-50 text-sm text-gray-900 file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-sm font-medium text-gray-700">
            Selected files: {selectedFiles.length}
          </p>
          <ul className="space-y-1">
            {selectedFiles.map(file => (
              <li key={file.name} className="truncate text-sm text-gray-600">
                • {file.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Upload Actions */}
      <div className="mb-4 flex gap-3">
        <button
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || isUploading}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
        <button
          onClick={clearSelected}
          disabled={selectedFiles.length === 0 || isUploading}
          className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Clear
        </button>
      </div>

      {/* Upload Status */}
      {uploadStatuses.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Upload Status:</p>
          <div className="space-y-2">
            {uploadStatuses.map(status => (
              <div
                key={status.fileName}
                className="flex items-start gap-2 rounded-md bg-gray-50 p-3"
              >
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm text-gray-900">{status.fileName}</p>
                  {status.error && (
                    <p className="text-xs text-red-600">{status.error}</p>
                  )}
                </div>
                <div>
                  {status.status === 'uploading' && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600">
                      <div className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                      Uploading
                    </span>
                  )}
                  {status.status === 'success' && (
                    <span className="inline-flex text-xs font-medium text-green-600">
                      ✓ Done
                    </span>
                  )}
                  {status.status === 'error' && (
                    <span className="inline-flex text-xs font-medium text-red-600">
                      ✗ Error
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
