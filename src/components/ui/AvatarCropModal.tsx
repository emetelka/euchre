/**
 * AvatarCropModal - Interactive modal for cropping and zooming avatar photos
 * Uses react-easy-crop for smooth drag/zoom interactions
 */

import { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { processCroppedImage } from '../../utils/imageUtils';

interface AvatarCropModalProps {
  imageFile: File;
  playerName: string;
  onSave: (base64: string) => void;
  onCancel: () => void;
}

export const AvatarCropModal: React.FC<AvatarCropModalProps> = ({
  imageFile,
  playerName,
  onSave,
  onCancel,
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load image on mount
  useEffect(() => {
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
    };
    reader.onerror = () => {
      setError('Failed to load image');
    };
    reader.readAsDataURL(imageFile);
  }, [imageFile]);

  // Callback when crop completes
  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Handle save
  const handleSave = async () => {
    if (!croppedAreaPixels || !imageSrc) return;

    setProcessing(true);
    setError(null);

    try {
      // Load image into HTMLImageElement
      const image = new Image();
      image.src = imageSrc;
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('Failed to load image'));
      });

      // Process and compress cropped image
      const base64 = await processCroppedImage(image, croppedAreaPixels);
      onSave(base64);
    } catch (err) {
      console.error('Failed to process image:', err);
      setError(err instanceof Error ? err.message : 'Failed to process image');
    } finally {
      setProcessing(false);
    }
  };

  // Handle background click
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !processing) {
      onCancel();
    }
  };

  return (
    <>
      {/* Background overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-75 z-50"
        onClick={handleBackgroundClick}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col pointer-events-auto">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">
              Crop Avatar for {playerName}
            </h2>
          </div>

          {/* Crop Area */}
          <div className="relative flex-1 bg-gray-900 min-h-[400px]">
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>

          {/* Controls */}
          <div className="p-4 border-t border-gray-200 space-y-4">
            {/* Zoom Slider */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Zoom</label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
                disabled={processing}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
                {error}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={onCancel}
                disabled={processing}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={processing || !croppedAreaPixels}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {processing ? 'Processing...' : 'Save Avatar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
