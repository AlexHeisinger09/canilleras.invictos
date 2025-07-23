// frontend/src/components/FabricToolbar.jsx
import React from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  RotateCcw,
  Move,
  Square,
  Trash2,
  FlipHorizontal,
  FlipVertical,
  Copy,
  Lock,
  Unlock,
  Center,
  Maximize,
  Minimize
} from "lucide-react";

const FabricToolbar = ({ 
  selectedObject, 
  onZoomIn, 
  onZoomOut, 
  onRotateClockwise,
  onRotateCounterClockwise,
  onFlipHorizontal,
  onFlipVertical,
  onDuplicate,
  onDelete,
  onToggleLock,
  onCenter,
  onBringToFront,
  onSendToBack,
  onReset,
  disabled = false
}) => {
  
  if (!selectedObject || disabled) {
    return (
      <Card className="p-4 bg-gray-50 border-gray-200">
        <div className="text-center text-gray-500">
          <Square className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Selecciona una imagen para ver los controles</p>
        </div>
      </Card>
    );
  }

  const isLocked = !selectedObject.selectable;

  return (
    <Card className="p-4 bg-blue-50 border-blue-200">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-blue-800">
            Herramientas de Edición
          </h4>
          <div className="flex items-center gap-2">
            {isLocked && (
              <div className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                🔒 Bloqueado
              </div>
            )}
          </div>
        </div>

        {/* Zoom Controls */}
        <div>
          <div className="text-xs font-medium text-gray-600 mb-2">Tamaño</div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onZoomOut}
              className="flex-1"
              disabled={isLocked}
              title="Reducir tamaño"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onZoomIn}
              className="flex-1"
              disabled={isLocked}
              title="Aumentar tamaño"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Rotation Controls */}
        <div>
          <div className="text-xs font-medium text-gray-600 mb-2">Rotación</div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onRotateCounterClockwise}
              className="flex-1"
              disabled={isLocked}
              title="Rotar izquierda 15°"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onRotateClockwise}
              className="flex-1"
              disabled={isLocked}
              title="Rotar derecha 15°"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Flip Controls */}
        <div>
          <div className="text-xs font-medium text-gray-600 mb-2">Voltear</div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onFlipHorizontal}
              className="flex-1"
              disabled={isLocked}
              title="Voltear horizontalmente"
            >
              <FlipHorizontal className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onFlipVertical}
              className="flex-1"
              disabled={isLocked}
              title="Voltear verticalmente"
            >
              <FlipVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Separator />

        {/* Position Controls */}
        <div>
          <div className="text-xs font-medium text-gray-600 mb-2">Posición</div>
          <div className="grid grid-cols-3 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onCenter}
              disabled={isLocked}
              title="Centrar imagen"
            >
              <Move className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onBringToFront}
              disabled={isLocked}
              title="Traer al frente"
            >
              <Maximize className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onSendToBack}
              disabled={isLocked}
              title="Enviar atrás"
            >
              <Minimize className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Separator />

        {/* Object Actions */}
        <div className="space-y-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onDuplicate}
            className="w-full"
            disabled={isLocked}
            title="Duplicar imagen"
          >
            <Copy className="h-4 w-4 mr-2" />
            Duplicar
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={onToggleLock}
            className="w-full"
            title={isLocked ? "Desbloquear imagen" : "Bloquear imagen"}
          >
            {isLocked ? (
              <>
                <Unlock className="h-4 w-4 mr-2" />
                Desbloquear
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Bloquear
              </>
            )}
          </Button>
        </div>

        <Separator />

        {/* Stats */}
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
          <div className="mt-2 pt-2 border-t text-center">
            <div className="font-semibold text-gray-600">Posición</div>
            <div className="text-sm font-mono text-purple-600">
              {Math.round(selectedObject?.left || 0)}, {Math.round(selectedObject?.top || 0)}
            </div>
          </div>
        </div>

        {/* Destructive Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onReset}
            className="flex-1"
            disabled={isLocked}
            title="Restaurar imagen a estado original"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Restaurar
          </Button>
          
          <Button
            size="sm"
            variant="destructive"
            onClick={onDelete}
            className="flex-1"
            title="Eliminar imagen"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Eliminar
          </Button>
        </div>

        {/* Keyboard Shortcuts Info */}
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <div className="font-medium mb-1">Atajos de teclado:</div>
          <div className="space-y-1">
            <div>• <span className="font-mono">Delete</span> - Eliminar</div>
            <div>• <span className="font-mono">Ctrl+D</span> - Duplicar</div>
            <div>• <span className="font-mono">Ctrl+Z</span> - Deshacer</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FabricToolbar;