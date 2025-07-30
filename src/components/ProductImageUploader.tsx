import React, { useState } from 'react';
import Image from 'next/image';

interface ProductImageUploaderProps {
  productId: number;
  initialImageUrl?: string | null;
  onUploadSuccess?: (newImageUrl: string) => void;
}

const ProductImageUploader: React.FC<ProductImageUploaderProps> = ({
  productId,
  initialImageUrl,
  onUploadSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [displayImageUrl, setDisplayImageUrl] = useState<string>(initialImageUrl || '/nopic.jpg');

  React.useEffect(() => {
    setDisplayImageUrl(initialImageUrl || '/nopic.jpg');
  }, [initialImageUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setMessage('');
      setDisplayImageUrl(URL.createObjectURL(event.target.files[0]));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('Please select an image file first.');
      return;
    }

    setUploading(true);
    setMessage('Uploading image...');

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('productId', String(productId));

    try {
      const response = await fetch('/api/products/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Image uploaded successfully!');
        setSelectedFile(null);
        setDisplayImageUrl(data.imageUrl);
        onUploadSuccess && onUploadSuccess(data.imageUrl);
      } else {
        setMessage(`Upload failed: ${data.message || 'Unknown error'}`);
        setDisplayImageUrl(initialImageUrl || '/nopic.jpg');
      }
    } catch (error) {
      console.error('Error during image upload:', error);
      setMessage('An error occurred while uploading the image.');
      setDisplayImageUrl(initialImageUrl || '/nopic.jpg');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <h3 className="text-lg font-semibold mb-3">Product Image Management</h3>

      <div className="mb-4 relative w-full h-64 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
        <Image
          src={displayImageUrl}
          alt={`Product image for ID ${productId}`}
          fill
          className="object-contain rounded-md"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            if (!target.src.includes('/nopic.jpg')) {
              target.src = '/nopic.jpg';
            }
          }}
        />
      </div>

      <div className="flex flex-col space-y-3">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : 'Upload New Image'}
        </button>
        {message && (
          <p className={`text-sm ${message.includes('failed') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductImageUploader;
