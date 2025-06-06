import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';

const AddEquipmentForm = ({ onAdd, isOpen, onClose, locations }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    status: 'funcionando',
    location: '',
    notes: ''
  });

  const equipmentTypes = [
    'TV', 'Tablet', 'Switch', 'Monitor', 'Notebook', 'Desktop', 'Impressora', 'Roteador'
  ];

  const statusOptions = [
    { value: 'funcionando', label: 'Funcionando', color: 'bg-green-500' },
    { value: 'manutencao', label: 'Manutenção', color: 'bg-yellow-500' },
    { value: 'defeito', label: 'Defeito', color: 'bg-red-500' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.type || !formData.location) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o nome, tipo e localização do equipamento.",
        variant: "destructive"
      });
      return;
    }

    const newEquipment = {
      id: Date.now(),
      ...formData,
      checked: false,
      lastCheck: new Date().toISOString(),
      photo: null
    };

    onAdd(newEquipment);
    setFormData({
      name: '',
      type: '',
      status: 'funcionando',
      location: '',
      notes: ''
    });
    onClose();

    toast({
      title: "Equipamento adicionado!",
      description: `${formData.name} foi adicionado à lista.`,
    });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
          className="w-full max-w-md"
        >
          <Card className="glass-effect border-green-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                  Adicionar Equipamento
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Nome do Equipamento *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Ex: TV Sala de Reunião"
                    className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Tipo *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {equipmentTypes.map((type) => (
                      <Button
                        key={type}
                        type="button"
                        variant={formData.type === type ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleChange('type', type)}
                        className={formData.type === type 
                          ? "bg-green-500 hover:bg-green-600" 
                          : "border-gray-600 text-gray-300 hover:bg-gray-700"
                        }
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Status
                  </label>
                  <div className="flex gap-2">
                    {statusOptions.map((status) => (
                      <Button
                        key={status.value}
                        type="button"
                        variant={formData.status === status.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleChange('status', status.value)}
                        className={formData.status === status.value 
                          ? `${status.color} hover:opacity-80` 
                          : "border-gray-600 text-gray-300 hover:bg-gray-700"
                        }
                      >
                        {status.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Localização *
                  </label>
                  <select
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="" disabled>Selecione uma localização</option>
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Observações
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Observações adicionais..."
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddEquipmentForm;