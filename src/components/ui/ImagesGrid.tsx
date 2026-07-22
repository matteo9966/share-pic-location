import ImageCard from "./ImageCard";
import "./ImagesGrid.css";

export const ImagesGrid = ({  onImageClick, imageData }: { images?: string[], onImageClick?: (key: string) => void, imageData: { s3_key: string, presignedUrl: string }[] }) => {
    return (
        <div className="images-grid">
            {imageData.filter(img => !!img.presignedUrl).map((image, index) => (
                <div key={index} className="images-grid-item">
                    <ImageCard
                        src={image.presignedUrl}
                        alt={`Image ${index + 1}`}
                        isGridLayout={true}
                        onClick={() => onImageClick?.(image.s3_key)}
                    />
                </div>
            ))}
        </div>
    );
}
                    