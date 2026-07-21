// EditPictureData.tsx
import { useState } from 'react';

interface PictureFormData {
  picture_id: string;
  s3_key: string;
  location: {
    latitude: number;
    longitude: number;
  };
  description: string;
}

interface EditPictureDataProps {
  onSubmit: (data: PictureFormData) => Promise<void>;
  initialData?: Partial<PictureFormData>;
}

export default function EditPictureData({
  onSubmit,
  initialData,
}: EditPictureDataProps) {
  const [formData, setFormData] = useState<PictureFormData>({
    picture_id: initialData?.picture_id || '',
    s3_key: initialData?.s3_key || '',
    location: initialData?.location || { latitude: 0, longitude: 0 },
    description: initialData?.description || '',
  });

  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name.includes('location.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [field]: parseFloat(value),
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: null, message: '' });

    try {
      await onSubmit(formData);
      setStatus({ type: 'success', message: 'Picture data updated successfully!' });
      setFormData({
        picture_id: '',
        s3_key: '',
        location: { latitude: 0, longitude: 0 },
        description: '',
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-4 p-4">
      {status.type && (
        <div
          className={`p-4 rounded-lg ${
            status.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
          role="alert"
        >
          {status.message}
        </div>
      )}

      <div>
        <label htmlFor="picture_id" className="block text-sm font-medium mb-1">
          Picture ID
        </label>
        <input
          id="picture_id"
          name="picture_id"
          type="text"
          value={formData.picture_id}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="s3_key" className="block text-sm font-medium mb-1">
          S3 Key
        </label>
        <input
          id="s3_key"
          name="s3_key"
          type="text"
          value={formData.s3_key}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Location</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="latitude" className="block text-xs text-gray-600 mb-1">
              Latitude
            </label>
            <input
              id="latitude"
              name="location.latitude"
              type="number"
              step="0.000001"
              value={formData.location.latitude}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="longitude" className="block text-xs text-gray-600 mb-1">
              Longitude
            </label>
            <input
              id="longitude"
              name="location.longitude"
              type="number"
              step="0.000001"
              value={formData.location.longitude}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={4}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Saving...' : 'Save Picture Data'}
      </button>
    </form>
  );
}