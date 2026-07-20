import React, { useEffect, useState } from 'react';
import { getPresignedUrl } from '../../utils/aws-utils';
import { ImagesGrid } from './ImagesGrid';

interface PresignedImageGridProps {
  fileKeys: string[];
  idToken: string;
  onError?: (error: Error) => void;
}

export const PresignedImageGrid: React.FC<PresignedImageGridProps> = ({
  fileKeys,
  idToken,
  onError,
}) => {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPresignedUrls = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch all presigned URLs in parallel
        const urlPromises = fileKeys.map(key =>
          getPresignedUrl(key, idToken).catch(err => {
            console.error(`Failed to fetch presigned URL for ${key}:`, err);
            return null;
          }),
        );

        const urls = await Promise.all(urlPromises);

        // Filter out any failed requests (null values)
        const validUrls = urls.filter((url): url is string => url !== null);
        setImageUrls(validUrls);

        // If some URLs failed, set an error
        if (validUrls.length < fileKeys.length) {
          const failedCount = fileKeys.length - validUrls.length;
          const errorMsg = `Failed to load ${failedCount} image(s)`;
          setError(errorMsg);
          onError?.(new Error(errorMsg));
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch images';
        setError(errorMessage);
        onError?.(new Error(errorMessage));
        console.error('Error fetching presigned URLs:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (fileKeys.length > 0 && idToken) {
      fetchPresignedUrls();
    } else if (fileKeys.length === 0) {
      setIsLoading(false);
    }
  }, [fileKeys, idToken, onError]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading images...</p>
        </div>
      </div>
    );
  }

  if (error && imageUrls.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-700 font-medium">Error loading images</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (imageUrls.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-gray-500">No images to display</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-yellow-700 text-sm">{error}</p>
        </div>
      )}
      <ImagesGrid images={imageUrls} />
    </div>
  );
};
