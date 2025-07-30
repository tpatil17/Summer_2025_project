import React, { useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Webcam from 'react-webcam';
import Tesseract from 'tesseract.js';
import { parseReceiptText } from './ParseReceipt';


export interface ReceiptData {
  image: File;
  extracted: {
    store: string;
    total: number | null;
    date: string | null;
  };
}

interface Props {
  onClose: () => void;
  onExtract: (data: ReceiptData) => void;
}

const ImageCaptureModal: React.FC<Props> = ({ onClose, onExtract }) => {
  const webcamRef = useRef<Webcam>(null);
  const [mode, setMode] = useState<'camera' | 'upload'>('camera');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleOCR = async (file: File) => {
    setLoading(true);
    setProgress(0);

    const { data } = await Tesseract.recognize(file, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          setProgress(Math.floor(m.progress * 100));
        }
      },
    });

    const text = data.text;

    const extracted = parseReceiptText(text)



    setLoading(false);
    onExtract({ image: file, extracted });
    onClose();
  };

  const capturePhoto = async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;

    setCapturedImage(imageSrc);

    const blob = await fetch(imageSrc).then(res => res.blob());
    const file = new File([blob], 'receipt.jpg', { type: 'image/jpeg' });

    await handleOCR(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    multiple: false,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setCapturedImage(URL.createObjectURL(file));
        await handleOCR(file);
      }
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-xl"
        >
          ×
        </button>

        <h2 className="text-lg font-semibold mb-4 text-center">Upload or Capture Receipt</h2>

        {/* Mode Toggle */}
        <div className="flex justify-center gap-4 mb-4">
          <button
            className={`px-3 py-1 rounded border text-sm ${
              mode === 'camera' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'
            }`}
            onClick={() => setMode('camera')}
          >
            📸 Camera
          </button>
          <button
            className={`px-3 py-1 rounded border text-sm ${
              mode === 'upload' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'
            }`}
            onClick={() => setMode('upload')}
          >
            📁 Upload
          </button>
        </div>

        {/* Image Input Section */}
        {mode === 'camera' && !loading && (
          <>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full rounded mb-4"
              videoConstraints={{ facingMode: 'environment' }}
            />
            <button
              onClick={capturePhoto}
              className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 mb-2"
            >
              Capture Photo
            </button>
          </>
        )}

        {mode === 'upload' && !loading && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${
              isDragActive ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300'
            }`}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the image here...</p>
            ) : (
              <p>Drag & drop or click to select a receipt image.</p>
            )}
          </div>
        )}

        {/* Preview and Loading */}
        {capturedImage && (
          <img
            src={capturedImage}
            alt="Receipt Preview"
            className="w-full rounded mt-4 mb-2"
          />
        )}

        {loading && (
          <div className="w-full bg-gray-200 rounded h-4 mt-3">
            <div
              className="bg-indigo-600 h-4 rounded"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageCaptureModal;
