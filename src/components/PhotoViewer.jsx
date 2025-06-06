import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';

const PhotoViewer = ({ photo, isOpen, onClose }) => {
  const downloadPhoto = () => {
    if (photo) {
      const link = document.createElement('a');
      link.download = `equipamento-foto-${Date.now()}.jpg`;
      link.href = photo;
      link.click();
      
      toast({
        title: "Download iniciado!",
        description: "A foto está sendo baixada.",
      });
    }
  };

  if (!isOpen || !photo) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="relative max-w-4xl max-h-[90vh] w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <Button
              onClick={downloadPhoto}
              variant="outline"
              size="icon"
              className="bg-black/50 border-white/20 text-white hover:bg-black/70"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              size="icon"
              className="bg-black/50 border-white/20 text-white hover:bg-black/70"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <img
            src={photo}
            alt="Foto do equipamento"
            className="w-full h-full object-contain rounded-lg"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PhotoViewer;