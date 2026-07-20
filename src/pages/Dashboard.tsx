import { useAuth } from "../providers/AuthProvider";
import User from "../components/User";
import { ImageUploader } from "../components/features/files";

function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  
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
        <h3>Upload your image</h3>
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
      </section>
    </div>
  );
}

export default Dashboard;
