import React, { useRef, useEffect, useState } from "react";
import { Canvas, FabricImage, Path } from "fabric";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  RotateCcw,
  Trash2,
  Move,
  FlipHorizontal,
  FlipVertical,
  Copy
} from "lucide-react";
import { useToast } from "../hooks/use-toast";

const ShinGuardCanvas = ({ images, guardType, isActive, onImagesChange, onCanvasReady }) => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const { toast } = useToast();

  // Inicializar Canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width: 350,
      height: 450,
      backgroundColor: '#f8fafc',
      selection: true,
    });

    // Forma de canillera
    const shinGuardPath = new Path(
      'M 60 20 C 45 20, 30 30, 30 50 L 30 120 C 30 140, 35 160, 45 175 L 50 200 C 55 220, 60 240, 70 250 L 80 270 C 90 280, 110 280, 120 270 L 130 250 C 140 240, 145 220, 150 200 L 155 175 C 165 160, 170 140, 170 120 L 170 50 C 170 30, 155 20, 140 20 Z',
      {
        left: 80,
        top: 40,
        scaleX: 1.3,
        scaleY: 1.6,
        fill: 'rgba(255, 255, 255, 0.8)',
        stroke: '#94a3b8',
        strokeWidth: 2,
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false,
      }
    );

    canvas.add(shinGuardPath);

    // Eventos
    canvas.on('selection:created', (e) => setSelectedObject(e.selected?.[0]));
    canvas.on('selection:updated', (e) => setSelectedObject(e.selected?.[0]));
    canvas.on('selection:cleared', () => setSelectedObject(null));

    fabricCanvasRef.current = canvas;
    setCanvasReady(true);
    
    if (onCanvasReady) onCanvasReady(canvas);

    return () => canvas.dispose();
  }, []);

  // Cargar imágenes
  useEffect(() => {
    if (!fabricCanvasRef.current || !canvasReady) return;

    const canvas = fabricCanvasRef.current;
    
    // Limpiar imágenes existentes
    const existingImages = canvas.getObjects().filter(obj => obj.type === 'image');
    existingImages.forEach(img => canvas.remove(img));

    // Agregar nuevas imágenes
    images.forEach((image, index) => {
      FabricImage.fromURL(image.url).then((fabricImage) => {
        const scale = Math.min(80 / fabricImage.width, 80 / fabricImage.height, 0.5);
        
        fabricImage.set({
          left: 80 + (index % 2) * 140,
          top: 100 + Math.floor(index / 2) * 120,
          scaleX: scale,
          scaleY: scale,
          cornerSize: 12,
          cornerColor: '#3b82f6',
          borderColor: '#3b82f6',
          customData: image,
        });

        if (image.fabricProps) {
          fabricImage.set(image.fabricProps);
        }

        canvas.add(fabricImage);
        canvas.renderAll();
      });
    });
  }, [images, canvasReady]);

  // Controles
  const zoomIn = () => {
    if (!selectedObject) return;
    selectedObject.scale((selectedObject.scaleX || 1) * 1.1);
    fabricCanvasRef.current.renderAll();
  };

  const zoomOut = () => {
    if (!selectedObject) return;
    selectedObject.scale((selectedObject.scaleX || 1) * 0.9);
    fabricCanvasRef.current.renderAll();
  };

  const rotateClockwise = () => {
    if (!selectedObject) return;
    selectedObject.rotate((selectedObject.angle || 0) + 15);
    fabricCanvasRef.current.renderAll();
  };

  const rotateCounterClockwise = () => {
    if (!selectedObject) return;
    selectedObject.rotate((selectedObject.angle || 0) - 15);
    fabricCanvasRef.current.renderAll();
  };

  const flipHorizontal = () => {
    if (!selectedObject) return;
    selectedObject.set('flipX', !selectedObject.flipX);
    fabricCanvasRef.current.renderAll();
  };

  const flipVertical = () => {
    if (!selectedObject) return;
    selectedObject.set('flipY', !selectedObject.flipY);
    fabricCanvasRef.current.renderAll();
  };

  const deleteObject = () => {
    if (!selectedObject) return;
    fabricCanvasRef.current.remove(selectedObject);
    setSelectedObject(null);
    fabricCanvasRef.current.renderAll();
  };

  const centerObject = () => {
    if (!selectedObject) return;
    selectedObject.center();
    fabricCanvasRef.current.renderAll();
  };

  const duplicateObject = () => {
    if (!selectedObject) return;
    selectedObject.clone().then((cloned) => {
      cloned.set({
        left: cloned.left + 20,
        top: cloned.top + 20,
      });
      fabricCanvasRef.current.add(cloned);
      fabricCanvasRef.current.renderAll();
    });
  };

  return (
    <div className="space-y-4">
      <Card className={`relative overflow-hidden border-2 transition-all duration-300 ${
        isActive ? 'border-blue-500 shadow-lg' : 'border-gray-300'
      }`}>
        <div className="p-4">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold mb-2">
              Canillera {guardType === 'left' ? 'Izquierda' : 'Derecha'}
            </h3>
            <Badge variant={isActive ? 'default' : 'secondary'}>
              {images.length}/4 imágenes
            </Badge>
          </div>
          
          <div className="flex justify-center">
            <div className="relative border rounded-lg overflow-hidden shadow-inner bg-gradient-to-b from-gray-50 to-gray-100">
              <canvas ref={canvasRef} />
              
              {images.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center text-gray-500">
                    <div className="text-4xl mb-2">🦵</div>
                    <p className="text-sm font-medium">
                      Canillera {guardType === 'left' ? 'Izquierda' : 'Derecha'}
                    </p>
                    <p className="text-xs text-gray-400">
                      Sube imágenes para comenzar
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {selectedObject && isActive && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="space-y-4">
            <div className="text-center">
              <h4 className="text-sm font-semibold text-blue-800 mb-3">
                Controles de Imagen
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button size="sm" variant="outline" onClick={zoomOut} className="flex items-center gap-2">
                <ZoomOut className="h-4 w-4" />
                Alejar
              </Button>
              
              <Button size="sm" variant="outline" onClick={zoomIn} className="flex items-center gap-2">
                <ZoomIn className="h-4 w-4" />
                Acercar
              </Button>
              
              <Button size="sm" variant="outline" onClick={rotateCounterClockwise} className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Rotar ←
              </Button>
              
              <Button size="sm" variant="outline" onClick={rotateClockwise} className="flex items-center gap-2">
                <RotateCw className="h-4 w-4" />
                Rotar →
              </Button>

              <Button size="sm" variant="outline" onClick={flipHorizontal} className="flex items-center gap-2">
                <FlipHorizontal className="h-4 w-4" />
                Voltear H
              </Button>
              
              <Button size="sm" variant="outline" onClick={flipVertical} className="flex items-center gap-2">
                <FlipVertical className="h-4 w-4" />
                Voltear V
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Button size="sm" variant="outline" onClick={centerObject} className="flex items-center gap-2">
                <Move className="h-4 w-4" />
                Centrar
              </Button>
              
              <Button size="sm" variant="outline" onClick={duplicateObject} className="flex items-center gap-2">
                <Copy className="h-4 w-4" />
                Duplicar
              </Button>
              
              <Button size="sm" variant="destructive" onClick={deleteObject} className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Eliminar
              </Button>
            </div>

            {selectedObject && (
              <div className="text-xs bg-white p-3 rounded border">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="font-semibold text-gray-600">Zoom</div>
                    <div className="text-lg font-mono text-blue-600">
                      {Math.round((selectedObject?.scaleX || 1) * 100)}%
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-600">Rotación</div>
                    <div className="text-lg font-mono text-green-600">
                      {Math.round(selectedObject?.angle || 0)}°
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      <Card className="p-3 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <div className="text-center space-y-2">
          <h4 className="text-sm font-semibold text-green-800">💡 Controles Fabric.js:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-700">
            <div className="flex items-center justify-center gap-1">
              <span>🖱️</span>
              <span>Clic para seleccionar</span>
            </div>
            <div className="flex items-center justify-center gap-1">
              <span>🔄</span>
              <span>Arrastra esquinas para redimensionar</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ShinGuardCanvas;