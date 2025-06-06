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

const ReportModal = ({ isOpen, onClose, equipments, locations, logoUrl, logoPlaceholder }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');

  const generatePDF = async () => {
    const doc = new jsPDF();
    let currentY = 15;

    if (logoUrl) {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        const imgPromise = new Promise((resolve, reject) => {
          img.onload = () => resolve(img);
          img.onerror = reject;
        });
        img.src = logoUrl;
        await imgPromise;
        
        const aspectRatio = img.width / img.height;
        let imgWidth = 30; 
        let imgHeight = imgWidth / aspectRatio;
        if (imgHeight > 15) {
            imgHeight = 15;
            imgWidth = imgHeight * aspectRatio;
        }
        doc.addImage(img, 'PNG', 15, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 5; 
      } catch (error) {
        console.error("Erro ao carregar logo para PDF:", error);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`(Erro ao carregar logo: ${logoPlaceholder})`, 15, currentY);
        currentY += 10;
      }
    } else if (logoPlaceholder) {
        doc.setFontSize(12);
        doc.setTextColor(0, 80, 157); 
        doc.text(logoPlaceholder, 15, currentY);
        currentY += 10;
    }


    doc.setFontSize(18);
    doc.setTextColor(50, 50, 50); 
    doc.text('Relatório de Equipamentos de TI', 15, currentY);
    currentY += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Data de geração: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, 15, currentY);
    currentY += 7;
    
    let filterInfo = [];
    if (startDate) filterInfo.push(`De: ${format(parseISO(startDate), 'dd/MM/yyyy', { locale: ptBR })}`);
    if (endDate) filterInfo.push(`Até: ${format(parseISO(endDate), 'dd/MM/yyyy', { locale: ptBR })}`);
    if (selectedLocation !== 'all') filterInfo.push(`Localidade: ${selectedLocation}`);
    
    if (filterInfo.length > 0) {
      doc.text(`Filtros: ${filterInfo.join(' | ')}`, 15, currentY);
      currentY += 10;
    } else {
      currentY += 3; 
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
    
    doc.autoTable({
      startY: currentY,
      head: [['Nome', 'Tipo', 'Status', 'Localidade', 'Última Verificação', 'Verificado', 'Observações', 'Foto']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 1.5, overflow: 'linebreak', textColor: [50,50,50] },
      headStyles: { fillColor: [0, 80, 157], textColor: [255,255,255], fontSize: 9 },
      alternateRowStyles: { fillColor: [230, 240, 255] },
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
        doc.setFontSize(9);
        doc.setTextColor(50,50,50);
        doc.text(`Foto de: ${eq.name}`, 15, currentY);
        try {
          doc.addImage(imageMap[eq.id], 'JPEG', 15, currentY + 3, 40, 40);
        } catch (e) {
          console.error("Erro ao adicionar imagem ao PDF:", e);
          doc.text("Erro ao carregar imagem", 15, currentY + 10);
        }
        currentY += 48; 
      }
    }

    const stats = {
      total: filteredEquipments.length,
      checked: filteredEquipments.filter(eq => eq.checked).length,
      functioning: filteredEquipments.filter(eq => eq.status === 'funcionando').length,
      maintenance: filteredEquipments.filter(eq => eq.status === 'manutencao').length,
      broken: filteredEquipments.filter(eq => eq.status === 'defeito').length
    };
    
    if (currentY + 40 > doc.internal.pageSize.height -10) {
        doc.addPage();
        currentY = 20;
    }

    doc.setFontSize(11);
    doc.setTextColor(50,50,50);
    doc.text('Estatísticas:', 15, currentY);
    currentY += 6;
    doc.setFontSize(9);
    doc.text(`Total de equipamentos: ${stats.total}`, 15, currentY);
    currentY += 6;
    doc.text(`Equipamentos verificados: ${stats.checked}`, 15, currentY);
    currentY += 6;
    doc.text(`Funcionando: ${stats.functioning}`, 15, currentY);
    currentY += 6;
    doc.text(`Em manutenção: ${stats.maintenance}`, 15, currentY);
    currentY += 6;
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
          <Card className="bg-company-card-bg border-company-border shadow-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-company-brand">
                  Gerar Relatório
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-company-text-secondary hover:text-company-text-primary"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-company-text-secondary mb-1 block">
                    Data Inicial
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-company-input-bg border-company-border text-company-text-primary focus:ring-company-brand focus:border-company-brand"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-company-text-secondary mb-1 block">
                    Data Final
                  </label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-company-input-bg border-company-border text-company-text-primary focus:ring-company-brand focus:border-company-brand"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-company-text-secondary mb-1 block">
                  Localidade
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-company-input-bg border-company-border rounded-md text-company-text-primary focus:ring-company-brand focus:border-company-brand"
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
                  className="flex-1 bg-company-brand text-company-brand-foreground hover:bg-company-brand/90"
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
                  className="border-company-brand-accent text-company-brand-accent hover:bg-company-brand-accent/10 flex-1"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </Button>

                <Button
                  onClick={() => {
                    toast({
                      title: "Em breve!",
                      description: "Função de compartilhamento será implementada em breve.",
                      variant: "default"
                    });
                  }}
                  variant="outline"
                  className="border-company-brand-accent/70 text-company-brand-accent/80 hover:bg-company-brand-accent/10"
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