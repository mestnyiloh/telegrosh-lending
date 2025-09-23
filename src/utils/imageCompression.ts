import imageCompression from 'browser-image-compression';

export const compressImage = async (file: File, maxSizeKB: number = 150): Promise<File> => {
  const options = {
    maxSizeMB: maxSizeKB / 1024, // Конвертируем KB в MB
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    maxIteration: 10,
    fileType: 'image/jpeg',
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw error;
  }
};

export const compressImages = async (files: File[], maxSizeKB: number = 150): Promise<File[]> => {
  const compressionPromises = files.map(file => compressImage(file, maxSizeKB));
  return Promise.all(compressionPromises);
};