import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Image as ImageIcon, Loader2, Sparkles, X, Camera, RefreshCw, AlertCircle } from 'lucide-react';
import { analyzeContent } from './services/geminiService';
import { SentenceCapResponse, AnalysisMode } from './types';
import ResultCard from './components/ResultCard';

const App: React.FC = () => {
  const [mode, setMode] = useState<AnalysisMode>(AnalysisMode.CAMERA);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SentenceCapResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Camera State
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setResult(null);
      setError(null);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    // Stop any existing stream first
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Camera API not supported in this browser.");
      return;
    }

    try {
      // Attempt 1: Environment (Rear) Camera
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment'
        } 
      });
      
      streamRef.current = stream;
      setCameraActive(true);
    } catch (err: any) {
      console.warn("Primary camera attempt failed:", err);
      
      // CRITICAL: If permission is denied, do NOT try fallback. It will just fail again.
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError("Camera access denied. Please allow camera permissions in your browser settings.");
        return;
      }

      // Attempt 2: Fallback to any available video source
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ 
            video: true 
        });
        streamRef.current = fallbackStream;
        setCameraActive(true);
      } catch (fallbackErr: any) {
        console.error("Fallback camera failed:", fallbackErr);

        let errorMessage = "Unable to access camera.";
        const errorName = fallbackErr?.name || err?.name;
        
        if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
            errorMessage = "Camera permission denied. Please allow camera access in your browser settings.";
        } else if (errorName === 'NotFoundError') {
            errorMessage = "No camera found on this device.";
        } else if (errorName === 'NotReadableError') {
            errorMessage = "Camera is in use by another app or hardware error.";
        } else {
            errorMessage = `Camera error: ${fallbackErr.message || "Unknown error"}`;
        }
        
        setError(errorMessage);
      }
    }
  }, []);

  const capturePhoto = () => {
    if (videoRef.current && streamRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        stopCamera();
        setResult(null);
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setResult(null);
    setError(null);
    startCamera();
  };

  // Effect: Start/Stop Camera based on Mode
  useEffect(() => {
    let isMounted = true;

    if (mode === AnalysisMode.CAMERA && !capturedImage) {
        // Small delay to ensure DOM is ready
        const timer = setTimeout(() => {
            if (isMounted) startCamera();
        }, 100);
        
        return () => {
            isMounted = false;
            clearTimeout(timer);
            stopCamera();
        };
    } else {
        stopCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, capturedImage, startCamera]); // stopCamera excluded to avoid loop

  // Effect: Attach Stream to Video Element
  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(e => console.error("Video play failed:", e));
    }
  }, [cameraActive]);

  const handleAnalyze = async () => {
    if (mode === AnalysisMode.IMAGE && !selectedFile) {
      setError("Please select an image to analyze.");
      return;
    }
    if (mode === AnalysisMode.CAMERA && !capturedImage) {
      setError("Please capture a photo to analyze.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let input: string | File;
      if (mode === AnalysisMode.IMAGE) {
        input = selectedFile!;
      } else {
        input = capturedImage!;
      }

      const data = await analyzeContent(input);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              SeWdCap AI
            </h1>
          </div>
          <a
             href="https://ai.google.dev"
             target="_blank"
             rel="noopener noreferrer"
             className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Powered by Gemini
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-3xl mx-auto p-4 md:p-8 flex flex-col gap-8">
        
        {/* Intro */}
        <div className="text-center space-y-2 mt-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Snap & Translate
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto">
            Extract text from images or take photos of objects. We'll detect, translate, and tag key concepts automatically.
          </p>
        </div>

        {/* Input Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-2 shadow-lg backdrop-blur-sm">
          {/* Tabs */}
          <div className="grid grid-cols-2 gap-2 mb-4 p-1 bg-slate-900/50 rounded-xl">
            <button
              onClick={() => { setMode(AnalysisMode.CAMERA); setResult(null); setError(null); }}
              className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
                mode === AnalysisMode.CAMERA
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Camera className="w-4 h-4 hidden sm:block" />
              Camera
            </button>
            <button
              onClick={() => { setMode(AnalysisMode.IMAGE); setResult(null); setError(null); }}
              className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
                mode === AnalysisMode.IMAGE
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <ImageIcon className="w-4 h-4 hidden sm:block" />
              Upload
            </button>
          </div>

          {/* Input Area */}
          <div className="p-4">
            {mode === AnalysisMode.IMAGE && (
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="hidden"
                  id="file-upload"
                />
                
                {!previewUrl ? (
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer bg-slate-900/30 hover:bg-slate-900/50 hover:border-blue-500/50 transition-all group"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <div className="bg-slate-800 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8 text-blue-400" />
                      </div>
                      <p className="mb-2 text-sm text-slate-300">
                        <span className="font-semibold text-blue-400">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-slate-500">SVG, PNG, JPG or GIF</p>
                    </div>
                  </label>
                ) : (
                  <div className="relative w-full h-64 bg-slate-900 rounded-xl overflow-hidden border border-slate-700 flex items-center justify-center">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="max-w-full max-h-full object-contain" 
                    />
                    <button 
                      onClick={clearFile}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500/80 text-white rounded-full backdrop-blur-sm transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {mode === AnalysisMode.CAMERA && (
              <div className="relative w-full h-64 md:h-80 bg-slate-900 rounded-xl overflow-hidden border border-slate-700 flex items-center justify-center group">
                {!capturedImage ? (
                  <>
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      muted 
                      onLoadedMetadata={() => videoRef.current?.play().catch(e => console.log(e))}
                      className={`w-full h-full object-cover ${!cameraActive ? 'hidden' : ''}`}
                    />
                    {!cameraActive && !error && (
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                        <p>Initializing Camera...</p>
                      </div>
                    )}
                    {error && !cameraActive && (
                        <div className="flex flex-col items-center justify-center text-red-400 p-4 text-center z-10">
                            <AlertCircle className="w-8 h-8 mb-2" />
                            <p className="text-sm mb-3 max-w-xs">{error}</p>
                            <button 
                                onClick={() => startCamera()}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm font-medium transition-colors"
                            >
                                Retry Camera
                            </button>
                        </div>
                    )}
                    {cameraActive && (
                        <button
                        onClick={capturePhoto}
                        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/20 hover:bg-white/30 border-4 border-white/50 w-16 h-16 rounded-full backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg z-10"
                        title="Capture Photo"
                        >
                        <div className="w-12 h-12 bg-white rounded-full" />
                        </button>
                    )}
                  </>
                ) : (
                  <>
                     <img 
                      src={capturedImage} 
                      alt="Captured" 
                      className="w-full h-full object-contain" 
                    />
                    <button 
                      onClick={retakePhoto}
                      className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-colors flex items-center gap-2 px-3"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span className="text-xs font-medium">Retake</span>
                    </button>
                  </>
                )}
              </div>
            )}
            
            {/* General Error Message (Logic Errors, not Camera Permission which are handled in the camera view) */}
            {error && mode !== AnalysisMode.CAMERA && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                {error}
              </div>
            )}

            {/* Action Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleAnalyze}
                disabled={loading || (mode === AnalysisMode.IMAGE && !selectedFile) || (mode === AnalysisMode.CAMERA && !capturedImage)}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white shadow-lg shadow-blue-900/20 transition-all ${
                  loading 
                    ? 'bg-blue-600/50 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:scale-[1.02] active:scale-[0.98]'
                } disabled:opacity-50 disabled:hover:scale-100`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Analyze Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results Area */}
        {result && <ResultCard data={result} />}
        
      </main>
    </div>
  );
};

export default App;