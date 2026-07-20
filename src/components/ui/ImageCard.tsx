import React from 'react';

interface ImageCardProps {
  src: string;
  alt: string;
  title?: string;
  description?: string;
  onClick?: () => void;
  isGridLayout?: boolean;
}

const ImageCard: React.FC<ImageCardProps> = ({
  src,
  alt,
  title,
  description,
  onClick,
  isGridLayout = false,
}) => {
  return (
    <div
      className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer bg-white h-full flex flex-col"
      onClick={onClick}
    >
      <div className={`relative overflow-hidden bg-gray-200 ${isGridLayout ? 'flex-1' : 'h-48'} w-full`}>
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      {(title || description) && (
        <div className="p-4">
          {title && <h3 className="text-lg font-semibold text-gray-800">{title}</h3>}
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageCard;
