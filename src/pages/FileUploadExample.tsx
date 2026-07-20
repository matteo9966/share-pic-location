import { useContext } from 'react';
import { ImageUploader } from '../components/features/files';
import { AuthContext } from '../providers/AuthProvider';

/**
 * Example usage of ImageUploader component
 * This demonstrates how to integrate the image upload functionality into your pages
 */
export const FileUploadExample = () => {
  const authContext = useContext(AuthContext);
  const idToken = authContext?.user?.id_token || '';

  const handleUploadSuccess = (fileName: string) => {
    console.log(`File uploaded successfully: ${fileName}`);
    // You can add additional logic here, like refreshing the file list
  };

  const handleUploadError = (error: Error) => {
    console.error(`Upload error: ${error.message}`);
    // You can add error handling logic here
  };

  if (!idToken) {
    return <div className="p-4 text-red-600">Please log in to upload images</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">File Upload</h1>
      <ImageUploader
        idToken={idToken}
        onUploadSuccess={handleUploadSuccess}
        onUploadError={handleUploadError}
      />
    </div>
  );
};
