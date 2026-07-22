import React, { useEffect, useState } from 'react';
import { getPresignedUrl } from '../../utils/aws-utils';
import { ImagesGrid } from './ImagesGrid';

interface PresignedImageGridProps {
  fileKeys: string[];
  idToken: string;
  onError?: (error: Error) => void;
  onImageClick?: (key: string,url:string) => void;
}

export const PresignedImageGrid: React.FC<PresignedImageGridProps> = ({
  fileKeys,
  idToken,
  onError,
  onImageClick
}) => {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageData,setImageData] = useState<{ s3_key:string,presignedUrl:string }[]>([]);

  useEffect(() => {
    const loadImages = async () => {
      if (fileKeys.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch all presigned URLs in parallel with error handling
        const urlResults = await Promise.all(
          fileKeys.map(key =>
            getPresignedUrl(key, idToken)
              .then(url => ({ key, url }))
              .catch(err => {
                console.error(`Failed to fetch presigned URL for ${key}:`, err);
                return { key, url: null };
              }),
          ),
        );

        // Separate successful and failed URLs
        const images = urlResults
          .filter((result): result is { key: string; url: string } => result.url !== null)
          .map(({ key, url }) => ({ s3_key: key, presignedUrl: url }));

        const urls = images.map(img => img.presignedUrl);

        setImageData(images);
        setImageUrls(urls);

        // Report partial failures as warning
        if (images.length < fileKeys.length) {
          const failedCount = fileKeys.length - images.length;
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

    loadImages();
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
      <ImagesGrid
        onImageClick={(key) => {
          const url = imageData.find(img => img.s3_key === key)?.presignedUrl || '';
          onImageClick?.(key, url);
        }}
        imageData={imageData}
      />
    </div>
  );
};
