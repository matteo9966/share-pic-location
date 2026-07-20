import ImageCard from "./ImageCard";
import "./ImagesGrid.css";

export const ImagesGrid = ({ images }: { images: string[] }) => {
    return (
        <div className="images-grid">
            {images.map((image, index) => (
                <div key={index} className="images-grid-item">
                    <ImageCard
                        src={image}
                        alt={`Image ${index + 1}`}
                        isGridLayout={true}
                    />
                </div>
            ))}
        </div>
    );
}
                    