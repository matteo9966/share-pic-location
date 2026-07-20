import { useAuth } from "../providers/AuthProvider";
import User from "../components/User";
import { ImageUploader } from "../components/features/files";
import { getPrivateS3Files } from "../utils/aws-utils";
import { useEffect, useState } from "react";
import { PresignedImageGrid } from "../components/ui";

function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [privateFiles, setPrivateFiles] = useState<string[]>([]);
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
    <div className="flex flex-col gap-8 p-6">
      <div className="w-full md:w-[50%]">
      <User user={user} />
      </div>
      <section>
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
          />
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
