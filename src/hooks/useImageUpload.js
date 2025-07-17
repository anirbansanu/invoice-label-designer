import { useState, useCallback } from 'react';

export const useImageUpload = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = useCallback(async (file, options = {}) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const processedImage = await processImageFile(file, options);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Reset progress after a delay
      setTimeout(() => {
        setUploadProgress(0);
        setIsUploading(false);
      }, 1000);

      return processedImage;
    } catch (error) {
      setUploadProgress(0);
      setIsUploading(false);
      throw error;
    }
  }, []);

  const processImageFile = useCallback((file, options) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate dimensions
          let { width, height } = img;
          const maxWidth = options.maxWidth || 2000;
          const maxHeight = options.maxHeight || 2000;
          
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Apply filters
          if (options.filters) {
            ctx.filter = `brightness(${options.filters.brightness}%) contrast(${options.filters.contrast}%) saturate(${options.filters.saturation}%)`;
          }
          
          // Draw image
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to blob
          canvas.toBlob((blob) => {
            const imageData = {
              id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              name: file.name,
              src: canvas.toDataURL(),
              width,
              height,
              originalWidth: img.width,
              originalHeight: img.height,
              size: blob.size,
              type: file.type,
              filters: options.filters,
              thumbnail: generateThumbnail(canvas),
              created: new Date().toISOString()
            };
            
            resolve(imageData);
          }, file.type, options.quality || 0.8);
        };
        
        img.onerror = reject;
        img.src = e.target.result;
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  const generateThumbnail = useCallback((canvas) => {
    const thumbCanvas = document.createElement('canvas');
    const thumbCtx = thumbCanvas.getContext('2d');
    
    thumbCanvas.width = 150;
    thumbCanvas.height = 150;
    
    // Calculate crop dimensions for square thumbnail
    const size = Math.min(canvas.width, canvas.height);
    const x = (canvas.width - size) / 2;
    const y = (canvas.height - size) / 2;
    
    thumbCtx.drawImage(canvas, x, y, size, size, 0, 0, 150, 150);
    
    return thumbCanvas.toDataURL();
  }, []);

  const resizeImage = useCallback((imageData, newWidth, newHeight) => {
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        const resizedImageData = {
          ...imageData,
          src: canvas.toDataURL(),
          width: newWidth,
          height: newHeight,
          thumbnail: generateThumbnail(canvas)
        };
        
        resolve(resizedImageData);
      };
      
      img.src = imageData.src;
    });
  }, [generateThumbnail]);

  const cropImage = useCallback((imageData, cropArea) => {
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = cropArea.width;
        canvas.height = cropArea.height;
        
        ctx.drawImage(
          img,
          cropArea.x,
          cropArea.y,
          cropArea.width,
          cropArea.height,
          0,
          0,
          cropArea.width,
          cropArea.height
        );
        
        const croppedImageData = {
          ...imageData,
          src: canvas.toDataURL(),
          width: cropArea.width,
          height: cropArea.height,
          thumbnail: generateThumbnail(canvas)
        };
        
        resolve(croppedImageData);
      };
      
      img.src = imageData.src;
    });
  }, [generateThumbnail]);

  return {
    uploadImage,
    resizeImage,
    cropImage,
    uploadProgress,
    isUploading
  };
};
