import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import ShinGuardCanvas from "./ShinGuardCanvas";
import PhotoUploader from "./PhotoUploader";
import { mockData } from "../data/mockData";
import { useToast } from "../hooks/use-toast";
import useFabricExport from "../hooks/useFabricExport";
import { 
  Download, 
  Save, 
  RotateCcw, 
  Palette, 
  Eye,
  FileImage,
  Layers,
  Image as ImageIcon
} from "lucide-react";

const ShinGuardCustomizer = () => {
  const [leftGuardImages, setLeftGuardImages] = useState([]);
  const [rightGuardImages, setRightGuardImages] = useState([]);
  const [activeGuard, setActiveGuard] = useState('left');
  const [designs, setDesigns] = useState(mockData.designs);
  const [previewMode, setPreviewMode] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Referencias para los canvas de Fabric
  const leftCanvasRef = useRef(null);
  const rightCanvasRef = useRef(null);
  
  const { toast } = useToast();
  const { exportBothCanvases, exportCanvasAndDownload } = useFabricExport();

  const handleImageUpload = (guard, images) => {
    if (guard === 'left') {
      setLeftGuardImages(images);
    } else {
      setRightGuardImages(images);
    }
    
    toast({
      title: "Imágenes cargadas",
      description: `Se han cargado ${images.length} imágenes para la canillera ${guard === 'left' ? 'izquierda' : 'derecha'}`,
    });
  };

  const handleSaveDesign = () => {
    const newDesign = {
      id: Date.now().toString(),
      name: `Diseño ${designs.length + 1}`,
      leftImages: leftGuardImages,
      rightImages: rightGuardImages,
      createdAt: new Date().toLocaleDateString()
    };
    
    setDesigns([...designs, newDesign]);
    toast({
      title: "Diseño guardado",
      description: "Tu diseño personalizado ha sido guardado exitosamente",
    });
  };

  const handleExportDesign = async () => {
    setIsExporting(true);
    
    try {
      const results = [];
      
      if (leftGuardImages.length > 0 && leftCanvasRef.current) {
        const success = exportCanvasAndDownload(
          leftCanvasRef.current, 
          'canillera-izquierda.png',
          { format: 'png', quality: 1, multiplier: 3 }
        );
        results.push({ side: 'izquierda', success });
      }
      
      if (rightGuardImages.length > 0 && rightCanvasRef.current) {
        // Delay para evitar problemas con múltiples descargas
        setTimeout(() => {
          const success = exportCanvasAndDownload(
            rightCanvasRef.current, 
            'canillera-derecha.png',
            { format: 'png', quality: 1, multiplier: 3 }
          );
          results.push({ side: 'derecha', success });
        }, 500);
      }
      
      toast({
        title: "Exportación iniciada",
        description: `Descargando ${getTotalImages() > 0 ? 'diseños' : 'diseño'} en alta resolución...`,
      });
      
    } catch (error) {
      console.error('Error durante la exportación:', error);
      toast({
        title: "Error en la exportación",
        description: "Hubo un problema al exportar el diseño. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleReset = () => {
    if (activeGuard === 'left') {
      setLeftGuardImages([]);
    } else {
      setRightGuardImages([]);
    }
    
    toast({
      title: "Diseño reiniciado",
      description: `Se han eliminado las imágenes de la canillera ${activeGuard === 'left' ? 'izquierda' : 'derecha'}`,
    });
  };

  const handleResetAll = () => {
    setLeftGuardImages([]);
    setRightGuardImages([]);
    
    toast({
      title: "Diseño completo reiniciado",
      description: "Se han eliminado todas las imágenes de ambas canilleras",
      variant: "destructive",
    });
  };

  const getTotalImages = () => leftGuardImages.length + rightGuardImages.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Personalizador de Canilleras Pro
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-4">
            Crea diseños únicos con controles profesionales powered by Fabric.js
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <FileImage className="h-4 w-4" />
              <span>{getTotalImages()}/8 imágenes totales</span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              <span>Controles precisos</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>Vista en tiempo real</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Controles del Diseño
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">

                {/* Guard Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Canillera Activa</label>
                  <div className="flex gap-2">
                    <Button
                      variant={activeGuard === 'left' ? 'default' : 'outline'}
                      onClick={() => setActiveGuard('left')}
                      className="flex-1"
                    >
                      Izquierda ({leftGuardImages.length}/4)
                    </Button>
                    <Button
                      variant={activeGuard === 'right' ? 'default' : 'outline'}
                      onClick={() => setActiveGuard('right')}
                      className="flex-1"
                    >
                      Derecha ({rightGuardImages.length}/4)
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Photo Uploader */}
                <PhotoUploader
                  onImagesChange={(images) => handleImageUpload(activeGuard, images)}
                  maxImages={4}
                  currentImages={activeGuard === 'left' ? leftGuardImages : rightGuardImages}
                />

                <Separator />

                {/* Preview Mode Toggle */}
                <div className="space-y-2">
                  <Button
                    onClick={() => setPreviewMode(!previewMode)}
                    variant={previewMode ? 'default' : 'outline'}
                    className="w-full"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {previewMode ? 'Salir de Vista Previa' : 'Vista Previa'}
                  </Button>
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button onClick={handleReset} variant="outline" className="w-full">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reiniciar {activeGuard === 'left' ? 'Izquierda' : 'Derecha'}
                  </Button>
                  <Button onClick={handleResetAll} variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reiniciar Todo
                  </Button>
                  <Button onClick={handleSaveDesign} className="w-full" disabled={getTotalImages() === 0}>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Diseño
                  </Button>
                  <Button onClick={handleExportDesign} variant="secondary" className="w-full" disabled={getTotalImages() === 0 || isExporting}>
                    <Download className="h-4 w-4 mr-2" />
                    {isExporting ? 'Exportando...' : 'Exportar PNG'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Canvas */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  <span>🦵</span>
                  Canilleras de Fútbol Profesional
                  <span>🦵</span>
                </CardTitle>
                <p className="text-gray-600">
                  Usa los controles visuales de Fabric.js para posicionar tus imágenes con precisión
                </p>
              </CardHeader>
              <CardContent>
                {!previewMode ? (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <ShinGuardCanvas
                        images={leftGuardImages}
                        guardType="left"
                        isActive={activeGuard === 'left'}
                        onImagesChange={(images) => setLeftGuardImages(images)}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <ShinGuardCanvas
                        images={rightGuardImages}
                        guardType="right"
                        isActive={activeGuard === 'right'}
                        onImagesChange={(images) => setRightGuardImages(images)}
                      />
                    </div>
                  </div>
                ) : (
                  /* Vista Previa */
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-xl font-semibold mb-2 text-gray-800">Vista Previa del Diseño Final</h3>
                      <p className="text-gray-600">Así se verán tus canilleras personalizadas</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gradient-to-br from-gray-100 to-gray-200 p-8 rounded-xl">
                      <div className="space-y-4">
                        <div className="text-center">
                          <Badge variant="outline" className="mb-4">Canillera Izquierda</Badge>
                        </div>
                        <ShinGuardCanvas
                          images={leftGuardImages}
                          guardType="left"
                          isActive={false}
                          onImagesChange={() => {}} // Solo vista, sin edición
                        />
                      </div>
                      
                      <div className="space-y-4">
                        <div className="text-center">
                          <Badge variant="outline" className="mb-4">Canillera Derecha</Badge>
                        </div>
                        <ShinGuardCanvas
                          images={rightGuardImages}
                          guardType="right"
                          isActive={false}
                          onImagesChange={() => {}} // Solo vista, sin edición
                        />
                      </div>
                    </div>
                    
                    {getTotalImages() > 0 && (
                      <div className="text-center space-y-4">
                        <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span>{leftGuardImages.length} imágenes izquierda</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                            <span>{rightGuardImages.length} imágenes derecha</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span>{getTotalImages()} total</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-4 justify-center">
                          <Button onClick={handleSaveDesign} className="px-8">
                            <Save className="h-4 w-4 mr-2" />
                            Guardar Diseño Final
                          </Button>
                          <Button onClick={handleExportDesign} variant="secondary" className="px-8">
                            <Download className="h-4 w-4 mr-2" />
                            Descargar PNG
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Tips */}
        <div className="mt-8 text-center">
          <Card className="inline-block p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <div className="text-sm text-gray-700">
              <span className="font-semibold">💡 Tip Pro:</span> Selecciona una imagen y usa los controles visuales para transformaciones precisas. 
              Los handles de las esquinas mantienen la proporción, los laterales estiran libremente.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ShinGuardCustomizer;