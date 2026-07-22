import { useAuth } from "../providers/AuthProvider";
import User from "../components/User";
import { ImageUploader } from "../components/features/files";
import { getPrivateS3Files } from "../utils/aws-utils";
import { useEffect, useState } from "react";
import { ImageCard, PresignedImageGrid } from "../components/ui";
import Modal from "../components/ui/modal/Modal";
import ModalActions from "../components/ui/modal/ModalActions";
import EditPictureData from "../components/features/picture-forms/EditPictureData";

function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const [privateFiles, setPrivateFiles] = useState<string[]>([]);
  const [selectedImageData, setSelectedImageData] = useState<{ key: string, url: string } | null>(null);
  useEffect(() => {
    if (isAuthenticated && user?.id_token) {
      // Fetch private files from S3 
      getPrivateS3Files(user.id_token)
        .then((files) => {
          setPrivateFiles(files);
          console.log("Private files:", files);
        })
        .catch((error) => {

          console.error("Error fetching private files:", error);
        });
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Please log in to view the dashboard.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-8 p-6">
        <div className="w-full md:w-[50%]">
          <User user={user} />
        </div>

        <div>
          <ImageUploader
            idToken={user?.id_token || ""}
            onUploadSuccess={(fileName) => {
              console.log(`File uploaded successfully: ${fileName}`);
            }}
            onUploadError={(error) => {
              console.error(`Upload error: ${error.message}`);
            }}
          />
        </div>
        <div className="mt-6">
          <PresignedImageGrid
            fileKeys={privateFiles}
            idToken={user?.id_token || ""}
            onError={(error) => {
              console.error("Error loading images:", error);
            }

            }
            onImageClick={(imageKey, imageUrl) => { 
              setIsModalOpen(true);
              setSelectedImageData({ key: imageKey, url: imageUrl });
              console.log(`Image clicked: ${imageKey}`);
            }}
          />
        </div>


      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirm Action"
        showCloseButton
      >
        <ImageCard
          src={selectedImageData?.url || ""} // Replace with the actual image URL
          alt="Selected image"
          isGridLayout={false}
        />
        <EditPictureData
         initialData={{
           s3_key:selectedImageData?.key,
           picture_id: ""// find picture by id
         }}
         onSubmit={async ()=>{}} 
        >

        </EditPictureData>

        <ModalActions
          onConfirm={() => {
            // Handle confirm action
            setIsModalOpen(false);
          }}
          onCancel={() => setIsModalOpen(false)}
          confirmLabel="Conferma"
          isDestructive={false}
        />
      </Modal>
    </>
  );
}

export default Dashboard;
