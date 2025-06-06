import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toaster } from '@/components/ui/toaster';
import EquipmentCard from '@/components/EquipmentCard';
import AddEquipmentForm from '@/components/AddEquipmentForm';
import CameraCapture from '@/components/CameraCapture';
import PhotoViewer from '@/components/PhotoViewer';
import ReportModal from '@/components/ReportModal';
import { 
  Plus, 
  Search,
  FileDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';

const PREDEFINED_LOCATIONS = [
  'Fábrica Jaboatão', 
  'Fábrica Raposo', 
  'Fábrica Mogi das Cruzes', 
  'CV João Pessoa', 
  'CV Caruaru', 
  'Brasília', 
  'Jaguariúna', 
  'Osasco', 
  'Fábrica Rio de Janeiro',
  'Juiz de Fora',
  'Pouso Alegre',
  'Gravataí'
];

function App() {
  const [equipments, setEquipments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [currentEquipmentId, setCurrentEquipmentId] = useState(null);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(null);

  // Carregar dados do localStorage
  useEffect(() => {
    const savedEquipments = localStorage.getItem('equipments');
    if (savedEquipments) {
      setEquipments(JSON.parse(savedEquipments));
    } else {
      // Dados de exemplo
      const sampleData = [
        {
          id: 1,
          name: 'TV Samsung 55"',
          type: 'TV',
          status: 'funcionando',
          location: PREDEFINED_LOCATIONS[0],
          notes: 'Instalada em 2023, funcionando perfeitamente',
          checked: false,
          lastCheck: new Date().toISOString(),
          photo: null
        },
        {
          id: 2,
          name: 'Switch Cisco 24 portas',
          type: 'Switch',
          status: 'manutencao',
          location: PREDEFINED_LOCATIONS[1],
          notes: 'Necessita atualização de firmware',
          checked: true,
          lastCheck: new Date(Date.now() - 86400000).toISOString(),
          photo: null
        }
      ];
      setEquipments(sampleData);
      localStorage.setItem('equipments', JSON.stringify(sampleData));
    }
  }, []);

  // Salvar no localStorage sempre que equipments mudar
  useEffect(() => {
    localStorage.setItem('equipments', JSON.stringify(equipments));
  }, [equipments]);

  const addEquipment = (newEquipment) => {
    setEquipments(prev => [...prev, newEquipment]);
  };

  const toggleEquipmentCheck = (id) => {
    setEquipments(prev => 
      prev.map(eq => 
        eq.id === id 
          ? { ...eq, checked: !eq.checked, lastCheck: new Date().toISOString() }
          : eq
      )
    );
  };

  const deleteEquipment = (id) => {
    setEquipments(prev => prev.filter(eq => eq.id !== id));
    toast({
      title: "Equipamento removido",
      description: "O equipamento foi removido da lista.",
    });
  };

  const openCamera = (equipmentId) => {
    setCurrentEquipmentId(equipmentId);
    setShowCamera(true);
  };

  const handlePhotoCapture = (photoDataUrl) => {
    if (currentEquipmentId) {
      setEquipments(prev =>
        prev.map(eq =>
          eq.id === currentEquipmentId
            ? { ...eq, photo: photoDataUrl }
            : eq
        )
      );
    }
    setShowCamera(false);
    setCurrentEquipmentId(null);
  };

  const viewPhoto = (photo) => {
    setCurrentPhoto(photo);
    setShowPhotoViewer(true);
  };

  // Filtros
  const filteredEquipments = equipments.filter(equipment => {
    const matchesSearch = equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         equipment.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         equipment.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || equipment.status === filterStatus;
    const matchesType = filterType === 'all' || equipment.type === filterType;
    const matchesLocation = filterLocation === 'all' || equipment.location === filterLocation;
    
    return matchesSearch && matchesStatus && matchesType && matchesLocation;
  });

  // Estatísticas
  const stats = {
    total: equipments.length,
    checked: equipments.filter(eq => eq.checked).length,
    functioning: equipments.filter(eq => eq.status === 'funcionando').length,
    maintenance: equipments.filter(eq => eq.status === 'manutencao').length,
    broken: equipments.filter(eq => eq.status === 'defeito').length
  };

  // Listas únicas para filtros
  const uniqueTypes = [...new Set(equipments.map(eq => eq.type))];
  const uniqueLocations = [...new Set(equipments.map(eq => eq.location).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-4">
            CheckList TI
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Gerencie seus equipamentos de informática com facilidade e capture fotos em tempo real
          </p>
        </motion.div>

        {/* Estatísticas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
        >
          <Card className="glass-effect border-blue-500/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.total}</div>
              <div className="text-sm text-gray-400">Total</div>
            </CardContent>
          </Card>
          
          <Card className="glass-effect border-green-500/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{stats.checked}</div>
              <div className="text-sm text-gray-400">Verificados</div>
            </CardContent>
          </Card>
          
          <Card className="glass-effect border-green-500/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{stats.functioning}</div>
              <div className="text-sm text-gray-400">Funcionando</div>
            </CardContent>
          </Card>
          
          <Card className="glass-effect border-yellow-500/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">{stats.maintenance}</div>
              <div className="text-sm text-gray-400">Manutenção</div>
            </CardContent>
          </Card>
          
          <Card className="glass-effect border-red-500/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-400">{stats.broken}</div>
              <div className="text-sm text-gray-400">Defeito</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Controles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="glass-effect border-green-500/20">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full md:w-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar equipamentos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 w-full"
                  />
                </div>
                
                <div className="flex gap-2 flex-wrap justify-center md:justify-start">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white text-sm"
                  >
                    <option value="all">Todos os Status</option>
                    <option value="funcionando">Funcionando</option>
                    <option value="manutencao">Manutenção</option>
                    <option value="defeito">Defeito</option>
                  </select>
                  
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white text-sm"
                  >
                    <option value="all">Todos os Tipos</option>
                    {uniqueTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>

                  <select
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                    className="px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white text-sm"
                  >
                    <option value="all">Todas Localidades</option>
                    {PREDEFINED_LOCATIONS.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                    {uniqueLocations.filter(loc => !PREDEFINED_LOCATIONS.includes(loc)).map(loc => (
                       <option key={loc} value={loc}>{loc} (Outra)</option>
                    ))}
                  </select>
                  
                  <Button
                    onClick={() => setShowAddForm(true)}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>

                  <Button
                    onClick={() => setShowReportModal(true)}
                    variant="outline"
                    className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                  >
                    <FileDown className="h-4 w-4 mr-2" />
                    Relatório
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Lista de Equipamentos */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredEquipments.map((equipment) => (
              <EquipmentCard
                key={equipment.id}
                equipment={equipment}
                onToggleCheck={toggleEquipmentCheck}
                onDelete={deleteEquipment}
                onTakePhoto={openCamera}
                onViewPhoto={viewPhoto}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredEquipments.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">📱</div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              Nenhum equipamento encontrado
            </h3>
            <p className="text-gray-400 mb-6">
              {searchTerm || filterStatus !== 'all' || filterType !== 'all' || filterLocation !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Comece adicionando seu primeiro equipamento'
              }
            </p>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Equipamento
            </Button>
          </motion.div>
        )}

        {/* Modais */}
        <AddEquipmentForm
          isOpen={showAddForm}
          onClose={() => setShowAddForm(false)}
          onAdd={addEquipment}
          locations={PREDEFINED_LOCATIONS}
        />

        <CameraCapture
          isOpen={showCamera}
          onClose={() => {
            setShowCamera(false);
            setCurrentEquipmentId(null);
          }}
          onPhotoCapture={handlePhotoCapture}
        />

        <PhotoViewer
          photo={currentPhoto}
          isOpen={showPhotoViewer}
          onClose={() => {
            setShowPhotoViewer(false);
            setCurrentPhoto(null);
          }}
        />

        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          equipments={equipments}
          locations={PREDEFINED_LOCATIONS}
        />

        <Toaster />
      </div>
    </div>
  );
}

export default App;