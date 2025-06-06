import React, { useState, useRef, useCallback } from 'react';
import { Camera, X, Download, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';

const CameraCapture = ({ onPhotoCapture, isOpen, onClose }) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
        toast({
          title: "Câmera ativada!",
          description: "Pronto para capturar fotos dos equipamentos.",
        });
      }
    } catch (error) {
      console.error('Erro ao acessar a câmera:', error);
      toast({
        title: "Erro na câmera",
        description: "Não foi possível acessar a câmera. Verifique as permissões.",
        variant: "destructive"
      });
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedPhoto(photoDataUrl);
      
      toast({
        title: "Foto capturada!",
        description: "Foto salva com sucesso.",
      });
    }
  }, []);

  const savePhoto = useCallback(() => {
    if (capturedPhoto && onPhotoCapture) {
      onPhotoCapture(capturedPhoto);
      setCapturedPhoto(null);
      stopCamera();
      onClose();
      
      toast({
        title: "Foto adicionada!",
        description: "A foto foi anexada ao equipamento.",
      });
    }
  }, [capturedPhoto, onPhotoCapture, stopCamera, onClose]);

  const downloadPhoto = useCallback(() => {
    if (capturedPhoto) {
      const link = document.createElement('a');
      link.download = `equipamento-${Date.now()}.jpg`;
      link.href = capturedPhoto;
      link.click();
      
      toast({
        title: "Download iniciado!",
        description: "A foto está sendo baixada.",
      });
    }
  }, [capturedPhoto]);

  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    if (isStreaming) {
      stopCamera();
      setTimeout(startCamera, 100);
    }
  }, [isStreaming, stopCamera, startCamera]);

  const retakePhoto = useCallback(() => {
    setCapturedPhoto(null);
  }, []);

  React.useEffect(() => {
    if (isOpen && !isStreaming && !capturedPhoto) {
      startCamera();
    }
    
    return () => {
      if (!isOpen) {
        stopCamera();
        setCapturedPhoto(null);
      }
    };
  }, [isOpen, startCamera, stopCamera, isStreaming, capturedPhoto]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-2xl"
        >
          <Card className="glass-effect border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                  Capturar Foto
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-4">
                {!capturedPhoto ? (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-64 md:h-80 object-cover camera-preview"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    
                    {isStreaming && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
                        <Button
                          onClick={capturePhoto}
                          size="lg"
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg"
                        >
                          <Camera className="h-5 w-5 mr-2" />
                          Capturar
                        </Button>
                        
                        <Button
                          onClick={switchCamera}
                          variant="outline"
                          size="lg"
                          className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                        >
                          <RotateCcw className="h-5 w-5" />
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <img
                      src={capturedPhoto}
                      alt="Foto capturada"
                      className="w-full h-64 md:h-80 object-cover camera-preview"
                    />
                    
                    <div className="flex gap-3 justify-center">
                      <Button
                        onClick={savePhoto}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                      >
                        Usar Foto
                      </Button>
                      
                      <Button
                        onClick={downloadPhoto}
                        variant="outline"
                        className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      
                      <Button
                        onClick={retakePhoto}
                        variant="outline"
                        className="border-gray-500/50 text-gray-400 hover:bg-gray-500/10"
                      >
                        Refazer
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CameraCapture;