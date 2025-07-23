import { useCallback } from 'react';

const useFabricExport = () => {
  
  const exportCanvasAsImage = useCallback((fabricCanvas, options = {}) => {
    if (!fabricCanvas || !fabricCanvas.toDataURL) {
      console.error('Canvas no disponible para exportación');
      return null;
    }

    const defaultOptions = {
      format: 'png',
      quality: 1,
      multiplier: 2,
      enableRetinaScaling: true,
      ...options
    };

    try {
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
          multiplier: 2 
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
            multiplier: 2 
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
      multiplier: 1,
      width: 200,
      height: 250,
      ...options
    };

    return exportCanvasAsImage(fabricCanvas, defaultPreviewOptions);
  }, [exportCanvasAsImage]);

  return {
    exportCanvasAsImage,
    downloadImage,
    exportCanvasAndDownload,
    exportBothCanvases,
    getCanvasPreview
  };
};

export default useFabricExport;