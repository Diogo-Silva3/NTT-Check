import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Camera, Trash2, Eye, Calendar, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';

const EquipmentCard = ({ 
  equipment, 
  onToggleCheck, 
  onDelete, 
  onTakePhoto, 
  onViewPhoto 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'funcionando':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'manutencao':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'defeito':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      'TV': '📺',
      'Tablet': '📱',
      'Switch': '🔌',
      'Monitor': '🖥️',
      'Notebook': '💻',
      'Desktop': '🖥️',
      'Impressora': '🖨️',
      'Roteador': '📡'
    };
    return icons[type] || '💻';
  };

  const handleDelete = () => {
    setShowDeleteConfirm(false);
    onDelete(equipment.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group"
    >
      <Card className="equipment-card glass-effect border-green-500/20 hover:border-green-500/40 transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{getTypeIcon(equipment.type)}</div>
              <div>
                <CardTitle className="text-lg text-white group-hover:text-green-400 transition-colors">
                  {equipment.name}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={getStatusColor(equipment.status)}>
                    {equipment.status}
                  </Badge>
                  <span className="text-sm text-gray-400">{equipment.type}</span>
                </div>
              </div>
            </div>
            
            <Checkbox
              checked={equipment.checked}
              onCheckedChange={() => onToggleCheck(equipment.id)}
              className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {equipment.location && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <MapPin className="h-4 w-4" />
              {equipment.location}
            </div>
          )}

          {equipment.lastCheck && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Calendar className="h-4 w-4" />
              Última verificação: {new Date(equipment.lastCheck).toLocaleDateString('pt-BR')}
            </div>
          )}

          {equipment.notes && (
            <p className="text-sm text-gray-300 bg-gray-800/50 p-3 rounded-lg">
              {equipment.notes}
            </p>
          )}

          {equipment.photo && (
            <div className="relative">
              <img
                src={equipment.photo}
                alt={`Foto de ${equipment.name}`}
                className="w-full h-32 object-cover rounded-lg border border-green-500/20"
              />
              <Button
                onClick={() => onViewPhoto(equipment.photo)}
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          )}

          <motion.div 
            className="flex gap-2 pt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0.7 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              onClick={() => onTakePhoto(equipment.id)}
              variant="outline"
              size="sm"
              className="flex-1 border-green-500/50 text-green-400 hover:bg-green-500/10 hover:border-green-500"
            >
              <Camera className="h-4 w-4 mr-2" />
              {equipment.photo ? 'Nova Foto' : 'Adicionar Foto'}
            </Button>
            
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              variant="outline"
              size="sm"
              className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </motion.div>
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        equipmentName={equipment.name}
      />
    </motion.div>
  );
};

export default EquipmentCard;