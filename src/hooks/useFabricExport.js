import { useCallback } from 'react';

const useFabricExport = () => {
  
  const exportCanvasAsImage = useCallback(async (fabricCanvas, options = {}) => {
    if (!fabricCanvas || !fabricCanvas.toDataURL) {
      console.error('Canvas no disponible para exportación');
      return null;
    }

    const defaultOptions = {
      format: 'png',
      quality: 1,
      multiplier: 3, // Aumentado para mejor calidad
      enableRetinaScaling: true,
      ...options
    };

    try {
      // Asegurar que el marco esté al frente antes de exportar
      const frameImg = fabricCanvas.getObjects().find(obj => obj.name === 'backgroundCanillera');
      if (frameImg) {
        try {
          const objects = fabricCanvas.getObjects();
          const index = objects.indexOf(frameImg);
          const lastIndex = objects.length - 1;
          
          if (index < lastIndex) {
            fabricCanvas.remove(frameImg);
            fabricCanvas.add(frameImg);
            fabricCanvas.renderAll();
            // Pequeña pausa para asegurar el renderizado
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error) {
          console.warn('Error reordenando marco para exportación:', error);
        }
      }

      const dataURL = fabricCanvas.toDataURL(defaultOptions);
      return dataURL;
    } catch (error) {
      console.error('Error al exportar canvas:', error);
      return null;
    }
  }, []);

  const downloadImage = useCallback((dataURL, filename = 'canillera-diseño.png') => {
    if (!dataURL) {
      console.error('No hay datos de imagen para descargar');
      return false;
    }

    try {
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataURL;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return true;
    } catch (error) {
      console.error('Error al descargar imagen:', error);
      return false;
    }
  }, []);

  const exportCanvasAndDownload = useCallback((fabricCanvas, filename = 'canillera-diseño.png', options = {}) => {
    if (!fabricCanvas) {
      console.error('Canvas no proporcionado para exportación');
      return false;
    }

    try {
      const dataURL = exportCanvasAsImage(fabricCanvas, options);
      if (dataURL) {
        return downloadImage(dataURL, filename);
      }
      return false;
    } catch (error) {
      console.error('Error en exportCanvasAndDownload:', error);
      return false;
    }
  }, [exportCanvasAsImage, downloadImage]);

  const exportBothCanvases = useCallback((leftCanvas, rightCanvas) => {
    const results = [];
    
    try {
      if (leftCanvas && leftCanvas.toDataURL) {
        const leftDataURL = exportCanvasAsImage(leftCanvas, { 
          format: 'png',
          quality: 1,
          multiplier: 3 // Alta calidad para exportación final
        });
        
        if (leftDataURL) {
          const success = downloadImage(leftDataURL, 'canillera-izquierda.png');
          results.push({ side: 'left', success, dataURL: leftDataURL });
        } else {
          results.push({ side: 'left', success: false });
        }
      }

      if (rightCanvas && rightCanvas.toDataURL) {
        setTimeout(() => {
          const rightDataURL = exportCanvasAsImage(rightCanvas, { 
            format: 'png',
            quality: 1,
            multiplier: 3 // Alta calidad para exportación final
          });
          
          if (rightDataURL) {
            const success = downloadImage(rightDataURL, 'canillera-derecha.png');
            results.push({ side: 'right', success, dataURL: rightDataURL });
          } else {
            results.push({ side: 'right', success: false });
          }
        }, 500);
      }

      return results;
    } catch (error) {
      console.error('Error en exportBothCanvases:', error);
      return [];
    }
  }, [exportCanvasAsImage, downloadImage]);

  const getCanvasPreview = useCallback((fabricCanvas, options = {}) => {
    if (!fabricCanvas) {
      return null;
    }

    const defaultPreviewOptions = {
      format: 'png',
      quality: 0.8,
      multiplier: 1.5, // Mejor calidad para vista previa
      width: 200,
      height: 250,
      ...options
    };

    return exportCanvasAsImage(fabricCanvas, defaultPreviewOptions);
  }, [exportCanvasAsImage]);

  // Nueva función para verificar si el canvas tiene imagen de fondo
  const hasBackgroundImage = useCallback((fabricCanvas) => {
    if (!fabricCanvas) return false;
    
    const backgroundImg = fabricCanvas.getObjects().find(obj => obj.name === 'backgroundCanillera');
    return !!backgroundImg;
  }, []);

  // Nueva función para obtener estadísticas del canvas
  const getCanvasStats = useCallback((fabricCanvas) => {
    if (!fabricCanvas) return null;
    
    const objects = fabricCanvas.getObjects();
    const backgroundImg = objects.find(obj => obj.name === 'backgroundCanillera');
    const userImages = objects.filter(obj => obj.type === 'image' && obj.name !== 'backgroundCanillera');
    
    return {
      totalObjects: objects.length,
      hasBackground: !!backgroundImg,
      userImagesCount: userImages.length,
      canExport: userImages.length > 0 || !!backgroundImg
    };
  }, []);

  return {
    exportCanvasAsImage,
    downloadImage,
    exportCanvasAndDownload,
    exportBothCanvases,
    getCanvasPreview,
    hasBackgroundImage,
    getCanvasStats
  };
};

export default useFabricExport;