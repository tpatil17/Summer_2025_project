import React, { useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import Webcam from "react-webcam";
import { parseReceiptText } from "./ParseReceipt";
import { getFunctions, httpsCallable } from "firebase/functions";
import Tesseract from "tesseract.js";

export interface EnrichedLineItem {
  name: string;
  price: number;
  quantity: number;
  category: string;
}

export interface ReceiptData {
  image: File;
  extracted: {
    store: string;
    total: number | null;
    date: string | null;
    items: EnrichedLineItem[];
  };
}

interface Props {
  onClose: () => void;
  onExtract: (data: ReceiptData) => void;
}

const ImageCaptureModal: React.FC<Props> = ({ onClose, onExtract }) => {
  const webcamRef = useRef<Webcam>(null);
  const [mode, setMode] = useState<"camera" | "upload">("camera");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const convertToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleProcessImage = async (file: File) => {
    setLoading(true);
    setStatus("🔍 Parsing receipt text...");

    try {
      const worker = await Tesseract.createWorker("eng");
      const { data } = await worker.recognize(file);
      await worker.terminate();

      const parsed = parseReceiptText(data.text);

      setStatus("🧠 Enriching with GPT via Firebase...");
      const functions = getFunctions();
      const enrichParsedReceipt = httpsCallable(functions, "enrichParsedReceipt");

      const result = await enrichParsedReceipt({ parsed });
      const enriched = result.data as {
        store: string;
        date: string;
        total: number;
        items: EnrichedLineItem[];
      };

      setStatus("✅ Done!");

      onExtract({
        image: file,
        extracted: {
          store: enriched.store,
          date: enriched.date,
          total: enriched.total,
          items: enriched.items,
        },
      });

      setTimeout(() => {
        setLoading(false);
        setStatus(null);
        onClose();
      }, 1000);
    } catch (error) {
      console.error("Error processing receipt:", error);
      alert("Failed to parse receipt.");
      setLoading(false);
      setStatus(null);
    }
  };

  const capturePhoto = async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;

    setCapturedImage(imageSrc);

    const blob = await fetch(imageSrc).then((res) => res.blob());
    const file = new File([blob], "receipt.jpg", { type: "image/jpeg" });

    await handleProcessImage(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setCapturedImage(URL.createObjectURL(file));
        await handleProcessImage(file);
      }
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/10">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-xl"
        >
          ×
        </button>

        <h2 className="text-lg font-semibold mb-4 text-center">
          Upload or Capture Receipt
        </h2>

        {/* Mode Toggle */}
        <div className="flex justify-center gap-4 mb-4">
          <button
            className={`px-3 py-1 rounded border text-sm ${
              mode === "camera"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700"
            }`}
            onClick={() => setMode("camera")}
          >
            📸 Camera
          </button>
          <button
            className={`px-3 py-1 rounded border text-sm ${
              mode === "upload"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700"
            }`}
            onClick={() => setMode("upload")}
          >
            📁 Upload
          </button>
        </div>

        {/* Camera Mode */}
        {mode === "camera" && !loading && (
          <>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full rounded mb-4"
              videoConstraints={{ facingMode: "environment" }}
            />
            <button
              onClick={capturePhoto}
              className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 mb-2"
            >
              Capture Photo
            </button>
          </>
        )}

        {/* Upload Mode */}
        {mode === "upload" && !loading && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${
              isDragActive
                ? "border-indigo-600 bg-indigo-50"
                : "border-gray-300"
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

        {/* Receipt Preview */}
        {capturedImage}

        {/* Loading State */}
        {loading && (
          <div className="mt-4 text-sm text-gray-700 flex flex-col items-center animate-pulse">
            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2" />
            <p>{status}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageCaptureModal;
