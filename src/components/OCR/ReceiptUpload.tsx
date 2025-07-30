import React, { useState } from 'react';
import Tesseract from 'tesseract.js';

interface ReceiptData {
  store: string;
  total: number | null;
  date: string | null;
}

interface ReceiptUploadProps {
    onExtract: (data: ReceiptData) => void;
}

const ReceiptUpload: React.FC<ReceiptUploadProps> = ({ onExtract }) =>  {
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
    const [ocrProgress, setOcrProgress] = useState(0);
    const [loading, setLoading] = useState(false);
  
    const handleImageUpload = async (file: File) => {
      setImagePreviewUrl(URL.createObjectURL(file));
      setLoading(true);
      setOcrProgress(0);
  
      const { data } = await Tesseract.recognize(file, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setOcrProgress(Math.floor(m.progress * 100));
          }
        },
      });
  
      const text = data.text;
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      const store = lines[0] || 'Unknown';
  
      const amountMatch = text.match(/(?:total|amount)[^\d]{0,5}([\d,.]+)/i);
      const dateMatch = text.match(/\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\b/);
  
      onExtract({
        total: amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : null,
        date: dateMatch ? dateMatch[1] : null,
        store,
      });
  
      setLoading(false);
    };
  
    return (
      <div>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file);
          }}
        />
  
        {imagePreviewUrl && (
          <img src={imagePreviewUrl} alt="Preview" className="max-h-48 mt-2 rounded" />
        )}
  
        {loading && (
          <div className="w-full bg-gray-200 rounded h-4 mt-3">
            <div
              className="bg-indigo-600 h-4 rounded"
              style={{ width: `${ocrProgress}%` }}
            ></div>
          </div>
        )}
      </div>
    );
  };
  
  export default ReceiptUpload;