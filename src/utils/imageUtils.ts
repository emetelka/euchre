/**
 * Image processing utilities for avatar uploads
 * Handles file validation, loading, cropping, resizing, and compression
 */

export interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Validates and loads an image file into an HTMLImageElement
 * @param file - The image file to load
 * @returns Promise that resolves with the loaded Image element
 * @throws Error if file type is invalid, size too large, or loading fails
 */
export const loadImageFromFile = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      reject(new Error('Please select a valid image (JPG, PNG, or WEBP)'));
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      reject(new Error('Image file too large. Please select an image under 10MB'));
      return;
    }

    // Load file using FileReader
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        resolve(img);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image. Please try a different photo'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read image file'));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Processes a cropped image: extracts crop area, resizes to 200x200, compresses to JPEG
 * @param image - The source HTMLImageElement
 * @param cropArea - The crop area in pixel coordinates from react-easy-crop
 * @returns Promise that resolves with base64 data URL
 * @throws Error if canvas operations fail or compression doesn't meet size target
 */
export const processCroppedImage = async (
  image: HTMLImageElement,
  cropArea: Area
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Create canvas for processing
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Set canvas to final size (200x200)
      const targetSize = 200;
      canvas.width = targetSize;
      canvas.height = targetSize;

      // Draw cropped region to canvas
      ctx.drawImage(
        image,
        cropArea.x,
        cropArea.y,
        cropArea.width,
        cropArea.height, // Source crop from user selection
        0,
        0,
        targetSize,
        targetSize // Destination resize
      );

      // Compress to target size (100KB)
      const targetSizeBytes = 100 * 1024;
      const base64Result = compressToTarget(canvas, targetSizeBytes);

      if (!base64Result) {
        reject(new Error('Failed to compress image. Please try a simpler photo'));
        return;
      }

      resolve(base64Result);
    } catch (error) {
      reject(new Error('Failed to process image. Please try a different photo'));
    }
  });
};

/**
 * Compresses a canvas to JPEG with target file size
 * Starts at 80% quality and reduces until size target is met or quality floor (50%) reached
 * @param canvas - The canvas to compress
 * @param targetBytes - Target size in bytes (100KB default)
 * @returns Base64 data URL or null if compression fails
 */
const compressToTarget = (canvas: HTMLCanvasElement, targetBytes: number): string | null => {
  let quality = 0.8;
  const minQuality = 0.5;
  const qualityStep = 0.1;

  // Base64 increases size by ~37%, factor into calculations
  const base64Overhead = 1.37;
  const adjustedTarget = targetBytes * base64Overhead;

  let result = canvas.toDataURL('image/jpeg', quality);

  // Reduce quality until size target met or minimum quality reached
  while (result.length > adjustedTarget && quality > minQuality) {
    quality -= qualityStep;
    result = canvas.toDataURL('image/jpeg', quality);
  }

  // If still too large at minimum quality, return null (failure)
  if (result.length > adjustedTarget * 1.5) {
    // Allow 50% over target as acceptable
    return null;
  }

  return result;
};

/**
 * Checks if localStorage has enough space for new avatar data
 * @returns Object with success status and optional warning message
 */
export const checkStorageQuota = (): { success: boolean; message?: string } => {
  try {
    const currentData = localStorage.getItem('euchre-settings') || '';
    const currentSize = new Blob([currentData]).size;
    const warningThreshold = 4 * 1024 * 1024; // 4MB (localStorage limit typically 5-10MB)

    if (currentSize > warningThreshold) {
      return {
        success: false,
        message: 'Storage limit approaching. Consider using smaller images or resetting avatars.',
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: 'Unable to check storage quota',
    };
  }
};
