import { useEffect } from 'react';
import {getPublicS3Files,getPresignedUrl} from '../utils/aws-utils';
import { useState } from 'react';
import { ImagesGrid } from '../components/ui/ImagesGrid';
function Home() {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    const fetchPublicFiles = async () => {
      
      const publicFiles = await getPublicS3Files("");
      const presignedUrls = await Promise.all(
        publicFiles.map(async (fileKey) => {
          const presignedUrl = await getPresignedUrl(fileKey, "");
          return presignedUrl;
        })
      );
      setImageUrls(presignedUrls);
      setLoading(false);
    };
    fetchPublicFiles();
  }, []);
  return (
    <div>
      {/* <h1>Home Page</h1> */}
      <section className="mt-8 p-2">
        {/* <h2>Share your images</h2> */}
        {loading ? <p>Loading...</p> : <ImagesGrid images={imageUrls} />}
      </section>
    </div>
  )
}

export default Home
