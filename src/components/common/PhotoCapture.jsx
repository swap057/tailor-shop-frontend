import React, { useState, useEffect } from 'react';
import { FaCamera } from 'react-icons/fa';
import { useLang } from '../../context/LangContext';

const PhotoCapture = ({ onPhotoSelect, existingPhoto }) => {
  const [preview, setPreview] = useState(null);
  const { t } = useLang(); 

  useEffect(() => {
    if (existingPhoto) {
      setPreview(URL.createObjectURL(existingPhoto));
    }
  }, [existingPhoto]);

  // --- NEW: IMAGE COMPRESSION LOGIC ---
  const compressImage = (file, callback) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIMENSION = 600; // Max width/height in pixels
        let { width, height } = img;

        // Calculate aspect ratio
        if (width > height && width > MAX_DIMENSION) {
          height *= MAX_DIMENSION / width;
          width = MAX_DIMENSION;
        } else if (height > MAX_DIMENSION) {
          width *= MAX_DIMENSION / height;
          height = MAX_DIMENSION;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to a compressed JPEG Blob (0.7 quality = 70%)
        canvas.toBlob((blob) => {
          if (!blob) return; // Fallback safety
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          callback(compressedFile);
        }, 'image/jpeg', 0.7);
      };
    };
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 1. Show an immediate preview using the original file so UI feels instant
      setPreview(URL.createObjectURL(file)); 
      
      // 2. Compress the image in the background, then send to parent component's state
      compressImage(file, (compressedFile) => {
        console.log(`Original: ${(file.size / 1024).toFixed(2)} KB -> Compressed: ${(compressedFile.size / 1024).toFixed(2)} KB`);
        onPhotoSelect(compressedFile); 
      });
    }
  };

  const boxStyle = {
    border: '2px dashed #ccc',
    borderRadius: '10px',
    height: '120px', 
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    backgroundColor: '#f8f9fa',
    position: 'relative',
    overflow: 'hidden'
  };

  return (
    <div className="mb-2">
      <label style={{width: '100%', margin: 0}}>
        <div style={boxStyle} className="hover-effect">
          
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange} 
            style={{ display: 'none' }} 
          />

          {preview ? (
            <img 
              src={preview} 
              alt="Customer" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          ) : (
            <>
              <FaCamera size={20} color="#f0a500" className="mb-1" />
              <span className="text-muted fw-bold" style={{fontSize: '11px'}}>
                {t('photoTap') || "Tap to Add Photo"} 
              </span>
            </>
          )}
        </div>
      </label>
      
      {preview && (
        <div className="text-center mt-1">
            <span 
              className="text-danger fw-bold" 
              style={{cursor:'pointer', fontSize: '11px'}} 
              onClick={(e) => {
                e.preventDefault(); 
                setPreview(null); 
                onPhotoSelect(null);
              }}
            >
              Remove Photo
            </span>
        </div>
      )}
    </div>
  );
};

export default PhotoCapture;