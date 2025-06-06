import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, FileDown, Printer, Share2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format, parseISO, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ReportModal = ({ isOpen, onClose, equipments, locations }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');

  const generatePDF = async () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Relatório de Equipamentos de TI', 15, 20);
    
    doc.setFontSize(12);
    doc.text(`Data de geração: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, 15, 30);
    
    let filterInfo = [];
    if (startDate) filterInfo.push(`De: ${format(parseISO(startDate), 'dd/MM/yyyy', { locale: ptBR })}`);
    if (endDate) filterInfo.push(`Até: ${format(parseISO(endDate), 'dd/MM/yyyy', { locale: ptBR })}`);
    if (selectedLocation !== 'all') filterInfo.push(`Localidade: ${selectedLocation}`);
    
    if (filterInfo.length > 0) {
      doc.text(`Filtros: ${filterInfo.join(' | ')}`, 15, 40);
    }

    let filteredEquipments = equipments;

    if (startDate) {
      const start = startOfDay(parseISO(startDate));
      filteredEquipments = filteredEquipments.filter(eq => {
        const checkDate = parseISO(eq.lastCheck);
        return checkDate >= start;
      });
    }
    if (endDate) {
      const end = endOfDay(parseISO(endDate));
      filteredEquipments = filteredEquipments.filter(eq => {
        const checkDate = parseISO(eq.lastCheck);
        return checkDate <= end;
      });
    }
    if (selectedLocation !== 'all') {
      filteredEquipments = filteredEquipments.filter(eq => eq.location === selectedLocation);
    }

    const tableData = [];
    const imagePromises = [];

    filteredEquipments.forEach(eq => {
      const row = [
        eq.name,
        eq.type,
        eq.status,
        eq.location,
        format(parseISO(eq.lastCheck), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
        eq.checked ? 'Sim' : 'Não',
        eq.notes || '-',
        eq.photo ? 'Carregando...' : 'Sem foto' 
      ];
      tableData.push(row);

      if (eq.photo) {
        imagePromises.push(
          new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous"; 
            img.onload = () => {
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0);
              const dataUrl = canvas.toDataURL('image/jpeg', 0.5); 
              resolve({ id: eq.id, dataUrl });
            };
            img.onerror = () => {
              resolve({ id: eq.id, dataUrl: null }); 
            };
            img.src = eq.photo;
          })
        );
      }
    });
    
    const images = await Promise.all(imagePromises);
    const imageMap = images.reduce((acc, img) => {
      if (img.dataUrl) acc[img.id] = img.dataUrl;
      return acc;
    }, {});

    tableData.forEach((row, index) => {
      const eq = filteredEquipments[index];
      if (imageMap[eq.id]) {
        row[7] = 'Foto incluída'; 
      } else if (eq.photo) {
        row[7] = 'Erro ao carregar foto';
      }
    });
    
    let currentY = 50;
    if (filterInfo.length > 0) currentY = 60;


    doc.autoTable({
      startY: currentY,
      head: [['Nome', 'Tipo', 'Status', 'Localidade', 'Última Verificação', 'Verificado', 'Observações', 'Foto']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 1.5, overflow: 'linebreak' },
      headStyles: { fillColor: [46, 125, 50], textColor: [255,255,255] },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      columnStyles: {
        0: { cellWidth: 30 }, 
        1: { cellWidth: 15 }, 
        2: { cellWidth: 18 }, 
        3: { cellWidth: 25 }, 
        4: { cellWidth: 22 }, 
        5: { cellWidth: 15 }, 
        6: { cellWidth: 'auto' },
        7: { cellWidth: 20 }
      },
      didDrawPage: (data) => {
        currentY = data.cursor.y;
      }
    });
    
    currentY = doc.previousAutoTable.finalY + 10;

    for (const eq of filteredEquipments) {
      if (imageMap[eq.id]) {
        if (currentY + 45 > doc.internal.pageSize.height - 10) { 
          doc.addPage();
          currentY = 20;
        }
        doc.setFontSize(10);
        doc.text(`Foto de: ${eq.name}`, 15, currentY);
        try {
          doc.addImage(imageMap[eq.id], 'JPEG', 15, currentY + 5, 40, 40);
        } catch (e) {
          console.error("Erro ao adicionar imagem ao PDF:", e);
          doc.text("Erro ao carregar imagem", 15, currentY + 10);
        }
        currentY += 50; 
      }
    }


    const stats = {
      total: filteredEquipments.length,
      checked: filteredEquipments.filter(eq => eq.checked).length,
      functioning: filteredEquipments.filter(eq => eq.status === 'funcionando').length,
      maintenance: filteredEquipments.filter(eq => eq.status === 'manutencao').length,
      broken: filteredEquipments.filter(eq => eq.status === 'defeito').length
    };
    
    if (currentY + 50 > doc.internal.pageSize.height -10) {
        doc.addPage();
        currentY = 20;
    }

    doc.setFontSize(12);
    doc.text('Estatísticas:', 15, currentY);
    currentY += 7;
    doc.setFontSize(10);
    doc.text(`Total de equipamentos: ${stats.total}`, 15, currentY);
    currentY += 7;
    doc.text(`Equipamentos verificados: ${stats.checked}`, 15, currentY);
    currentY += 7;
    doc.text(`Funcionando: ${stats.functioning}`, 15, currentY);
    currentY += 7;
    doc.text(`Em manutenção: ${stats.maintenance}`, 15, currentY);
    currentY += 7;
    doc.text(`Com defeito: ${stats.broken}`, 15, currentY);

    doc.save(`relatorio-equipamentos-${format(new Date(), 'dd-MM-yyyy_HH-mm')}.pdf`);
    
    toast({
      title: "Relatório gerado com sucesso!",
      description: "O relatório foi baixado em PDF.",
    });
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
          className="w-full max-w-lg"
        >
          <Card className="glass-effect border-blue-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  Gerar Relatório
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

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Data Inicial
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-gray-800/50 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Data Final
                  </label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-gray-800/50 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Localidade
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white"
                >
                  <option value="all">Todas as localidades</option>
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={generatePDF}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Baixar PDF
                </Button>
                
                <Button
                  onClick={() => {
                    generatePDF().then(() => {
                       setTimeout(() => window.print(), 500); 
                    });
                  }}
                  variant="outline"
                  className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </Button>

                <Button
                  onClick={() => {
                    toast({
                      title: "Em breve!",
                      description: "Função de compartilhamento será implementada em breve.",
                    });
                  }}
                  variant="outline"
                  className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReportModal;