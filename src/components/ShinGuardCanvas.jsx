import React, { useRef, useEffect, useState } from "react";
import { Canvas, FabricImage } from "fabric";
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
  const [backgroundImageLoaded, setBackgroundImageLoaded] = useState(false);
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

    // Cargar imagen de fondo de la canillera
    const loadBackgroundImage = () => {
      FabricImage.fromURL('/canillera.png')
        .then((backgroundImg) => {
          // Calcular escala para que la imagen se ajuste al canvas
          const scaleX = canvas.width / backgroundImg.width;
          const scaleY = canvas.height / backgroundImg.height;
          const scale = Math.min(scaleX, scaleY); // 0.9 para dejar un pequeño margen

          backgroundImg.set({
            left: canvas.width / 2,
            top: canvas.height / 2,
            originX: 'center',
            originY: 'center',
            scaleX: scale,
            scaleY: scale,
            selectable: false,
            evented: false,
            excludeFromExport: false, // Incluir en exportación
            name: 'backgroundCanillera', // Identificador para el marco
            // Propiedades importantes para que actúe como marco transparente
            globalCompositeOperation: 'source-over' // Asegurar que esté encima
          });

          // Agregar como MARCO AL FRENTE
          canvas.add(backgroundImg);
          canvas.renderAll();

          setBackgroundImageLoaded(true);
          console.log('Imagen de fondo de canillera cargada correctamente');
        })
        .catch((error) => {
          console.error('Error cargando imagen de fondo:', error);
          toast({
            title: "Advertencia",
            description: "No se pudo cargar la imagen de fondo de la canillera",
            variant: "destructive",
          });
          setBackgroundImageLoaded(true); // Continuar sin imagen de fondo
        });
    };

    // Eventos
    canvas.on('selection:created', (e) => {
      const selected = e.selected?.[0];
      // Solo seleccionar si no es la imagen de fondo
      if (selected && selected.name !== 'backgroundCanillera') {
        setSelectedObject(selected);
      }
    });

    canvas.on('selection:updated', (e) => {
      const selected = e.selected?.[0];
      if (selected && selected.name !== 'backgroundCanillera') {
        setSelectedObject(selected);
      }
    });

    canvas.on('selection:cleared', () => setSelectedObject(null));

    // Prevenir selección de la imagen de marco
    canvas.on('mouse:down', (e) => {
      if (e.target && e.target.name === 'backgroundCanillera') {
        canvas.discardActiveObject();
        canvas.renderAll();
      }
    });

    fabricCanvasRef.current = canvas;

    // Cargar imagen de fondo
    loadBackgroundImage();

    setCanvasReady(true);

    if (onCanvasReady) onCanvasReady(canvas);

    return () => canvas.dispose();
  }, []);

  // Cargar imágenes de usuario
  useEffect(() => {
    if (!fabricCanvasRef.current || !canvasReady || !backgroundImageLoaded) return;

    const canvas = fabricCanvasRef.current;

    // Guardar referencia al marco de canillera
    const frameImg = canvas.getObjects().find(obj => obj.name === 'backgroundCanillera');

    // Limpiar solo las imágenes de usuario (no el marco)
    const userImages = canvas.getObjects().filter(obj =>
      obj.type === 'image' && obj.name !== 'backgroundCanillera'
    );
    userImages.forEach(img => canvas.remove(img));

    // Agregar nuevas imágenes de usuario DETRÁS del marco
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
          name: 'userImage' // Identificador para imágenes de usuario
        });

        if (image.fabricProps) {
          fabricImage.set(image.fabricProps);
        }

        canvas.add(fabricImage);

        // IMPORTANTE: Después de agregar cada imagen, asegurar que el marco esté al frente
        setTimeout(() => {
          ensureFramePosition();
        }, 100);

        canvas.renderAll();
      });
    });

    // Asegurar que el marco esté al frente después de cargar todas las imágenes
    setTimeout(() => {
      ensureFramePosition();
    }, 500);
  }, [images, canvasReady, backgroundImageLoaded]);

  // Función auxiliar para mantener la canillera como marco (al frente)
  const moveFrameToFront = (canvas, frameObject) => {
    if (!canvas || !frameObject) return;

    try {
      const objects = canvas.getObjects();
      const index = objects.indexOf(frameObject);
      const lastIndex = objects.length - 1;

      if (index < lastIndex) {
        // Remover el marco de su posición actual
        canvas.remove(frameObject);
        // Insertarlo al final (al frente)
        canvas.add(frameObject);
      }
    } catch (error) {
      console.warn('Error al mover marco al frente:', error);
    }
  };

  // Función para mantener la canillera como marco al frente
  const ensureFramePosition = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const frameImg = canvas.getObjects().find(obj => obj.name === 'backgroundCanillera');
    if (frameImg) {
      moveFrameToFront(canvas, frameImg);
      canvas.renderAll();
    }
  };

  // Controles (mismas funciones que antes)
  const zoomIn = () => {
    if (!selectedObject) return;
    selectedObject.scale((selectedObject.scaleX || 1) * 1.1);
    fabricCanvasRef.current.renderAll();
    ensureBackgroundPosition();
  };

  const zoomOut = () => {
    if (!selectedObject) return;
    selectedObject.scale((selectedObject.scaleX || 1) * 0.9);
    fabricCanvasRef.current.renderAll();
    ensureBackgroundPosition();
  };

  const rotateClockwise = () => {
    if (!selectedObject) return;
    selectedObject.rotate((selectedObject.angle || 0) + 15);
    fabricCanvasRef.current.renderAll();
    ensureBackgroundPosition();
  };

  const rotateCounterClockwise = () => {
    if (!selectedObject) return;
    selectedObject.rotate((selectedObject.angle || 0) - 15);
    fabricCanvasRef.current.renderAll();
    ensureBackgroundPosition();
  };

  const flipHorizontal = () => {
    if (!selectedObject) return;
    selectedObject.set('flipX', !selectedObject.flipX);
    fabricCanvasRef.current.renderAll();
    ensureBackgroundPosition();
  };

  const flipVertical = () => {
    if (!selectedObject) return;
    selectedObject.set('flipY', !selectedObject.flipY);
    fabricCanvasRef.current.renderAll();
    ensureBackgroundPosition();
  };

  const deleteObject = () => {
    if (!selectedObject || selectedObject.name === 'backgroundCanillera') return;
    fabricCanvasRef.current.remove(selectedObject);
    setSelectedObject(null);
    fabricCanvasRef.current.renderAll();
    ensureBackgroundPosition();
  };

  const centerObject = () => {
    if (!selectedObject || selectedObject.name === 'backgroundCanillera') return;
    selectedObject.center();
    fabricCanvasRef.current.renderAll();
    ensureBackgroundPosition();
  };

  const duplicateObject = () => {
    if (!selectedObject || selectedObject.name === 'backgroundCanillera') return;
    selectedObject.clone().then((cloned) => {
      cloned.set({
        left: cloned.left + 20,
        top: cloned.top + 20,
        name: 'userImage' // Asegurar que la copia también sea una imagen de usuario
      });
      fabricCanvasRef.current.add(cloned);
      // Asegurar que el fondo permanezca atrás después de duplicar
      setTimeout(() => {
        ensureBackgroundPosition();
      }, 50);
      fabricCanvasRef.current.renderAll();
    });
  };

  return (
    <div className="space-y-4">
      <Card className={`relative overflow-hidden border-2 transition-all duration-300 ${isActive ? 'border-blue-500 shadow-lg' : 'border-gray-300'
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

              {!backgroundImageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center text-gray-500">
                    <div className="animate-spin text-2xl mb-2">⚽</div>
                    <p className="text-sm font-medium">
                      Cargando canillera...
                    </p>
                  </div>
                </div>
              )}

              {backgroundImageLoaded && images.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center text-gray-500 bg-white/80 p-2 rounded-lg max-w-xs">
                    <div className="text-xl mb-1">📸</div>
                    <p className="text-xs font-medium">
                      Sube imágenes para personalizar
                    </p>
                    <p className="text-[0.65rem] text-gray-400">
                      Canillera {guardType === 'left' ? 'Izquierda' : 'Derecha'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {selectedObject && selectedObject.name !== 'backgroundCanillera' && isActive && (
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
          <div className="text-xs text-gray-600">
            La imagen de la canillera actúa como marco transparente sobre las imágenes
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ShinGuardCanvas;