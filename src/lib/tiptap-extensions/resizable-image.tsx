import Image from '@tiptap/extension-image';
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import { NodeViewProps } from '@tiptap/core';
import { useRef, useState } from 'react';

// Componente React para la imagen redimensionable
function ImageNodeView({ node, updateAttributes, selected }: NodeViewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dimensions, setDimensions] = useState({
    width: node.attrs.width || 'auto',
    height: node.attrs.height || 'auto',
  });
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeStartPos = useRef({ x: 0, y: 0, width: 0 });

  const handleImageLoad = () => {
    console.log("Imagen cargada correctamente:", node.attrs.src?.substring(0, 100));
    setIsLoading(false);
    setError(false);
    // Si no hay width definido, usar el ancho natural
    if (!node.attrs.width && imgRef.current) {
      const naturalWidth = imgRef.current.naturalWidth;
      const maxWidth = 600;
      const width = Math.min(naturalWidth, maxWidth);
      setDimensions({ width, height: 'auto' });
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error("Error cargando imagen:", {
      src: node.attrs.src,
      error: e,
      type: e.type
    });
    setIsLoading(false);
    setError(true);
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    resizeStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      width: imgRef.current?.offsetWidth || 0,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - resizeStartPos.current.x;
      const newWidth = Math.max(100, resizeStartPos.current.width + deltaX);
      
      requestAnimationFrame(() => {
        setDimensions({ width: newWidth, height: 'auto' });
      });
    };

    const handleMouseUp = () => {
      requestAnimationFrame(() => {
        setIsResizing(false);
        
        const currentStyle = node.attrs.style || '';
        const newWidth = dimensions.width;
        
        let updatedStyle = currentStyle;
        if (currentStyle.includes('width:')) {
          updatedStyle = currentStyle.replace(/width:\s*[^;]+;?/, `width: ${newWidth}px;`);
        } else {
          updatedStyle = currentStyle + ` width: ${newWidth}px;`;
        }
        
        updateAttributes({
          width: newWidth,
          height: dimensions.height,
          style: updatedStyle.trim(),
        });
      });
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const getPosition = () => {
    const style = node.attrs.style || '';
    if (style.includes('float: left')) return 'left';
    if (style.includes('float: right')) return 'right';
    if (style.includes('margin-left: auto') && style.includes('margin-right: auto')) return 'center';
    return 'left';
  };

  const setPosition = (position: 'left' | 'center' | 'right') => {
    const currentWidth = dimensions.width !== 'auto' ? `width: ${dimensions.width}px;` : '';
    
    let positionStyle = '';
    if (position === 'left') {
      positionStyle = 'float: left; margin-right: 1rem; margin-bottom: 0.5rem;';
    } else if (position === 'right') {
      positionStyle = 'float: right; margin-left: 1rem; margin-bottom: 0.5rem;';
    } else if (position === 'center') {
      positionStyle = 'display: block; margin-left: auto; margin-right: auto;';
    }
    
    const style = `${positionStyle} ${currentWidth}`.trim();
    
    requestAnimationFrame(() => {
      updateAttributes({ style });
    });
  };

  const currentPosition = getPosition();

  return (
    <NodeViewWrapper
      ref={containerRef}
      className="image-node-view relative"
      style={{
        display: currentPosition === 'center' ? 'block' : 'inline-block',
        float: currentPosition === 'center' ? 'none' : (currentPosition as 'left' | 'right'),
        marginRight: currentPosition === 'left' ? '1rem' : '0',
        marginLeft: currentPosition === 'right' ? '1rem' : '0',
        marginBottom: '0.5rem',
        marginTop: '0',
        position: 'relative',
      }}
    >
      {/* Barra de herramientas FIJA y flotante - solo cuando está seleccionada */}
      {selected && !isLoading && !error && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 bg-background/95 dark:bg-background/90 backdrop-blur-md border border-border shadow-lg rounded-lg px-3 py-2">
            <span className="text-xs font-medium text-muted-foreground mr-1">
              Posición:
            </span>
            <button
              onClick={() => setPosition('left')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all text-xs font-medium ${
                currentPosition === 'left' 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'bg-muted hover:bg-muted/80 text-foreground'
              }`}
              title="Alinear a la izquierda"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" />
              </svg>
              <span>Izq</span>
            </button>
            <button
              onClick={() => setPosition('center')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all text-xs font-medium ${
                currentPosition === 'center' 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'bg-muted hover:bg-muted/80 text-foreground'
              }`}
              title="Centrar"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M4 18h16" />
              </svg>
              <span>Centro</span>
            </button>
            <button
              onClick={() => setPosition('right')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all text-xs font-medium ${
                currentPosition === 'right' 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'bg-muted hover:bg-muted/80 text-foreground'
              }`}
              title="Alinear a la derecha"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M4 18h16" />
              </svg>
              <span>Der</span>
            </button>
          </div>
        </div>
      )}

        {/* Loading Spinner */}
      {isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg"
          style={{
            width: dimensions.width === 'auto' ? '300px' : dimensions.width,
            height: dimensions.height === 'auto' ? '200px' : dimensions.height,
          }}
        >
          <div className="flex flex-col items-center gap-2">
            <svg
              className="animate-spin h-8 w-8 text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-sm text-muted-foreground">Cargando imagen...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div
          className="flex items-center justify-center bg-destructive/10 border-2 border-dashed border-destructive/50 rounded-lg"
          style={{
            width: dimensions.width === 'auto' ? '400px' : dimensions.width,
            height: dimensions.height === 'auto' ? '200px' : dimensions.height,
          }}
        >
          <div className="flex flex-col items-center gap-2 p-4 text-center max-w-sm">
            <svg
              className="h-8 w-8 text-destructive"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <p className="text-sm font-semibold text-destructive mb-1">Error al cargar imagen</p>
              <p className="text-xs text-muted-foreground break-all">
                {node.attrs.src?.substring(0, 80)}...
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Verifica que la URL sea correcta y accesible
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Imagen */}
      <img
        ref={imgRef}
        src={node.attrs.src}
        alt={node.attrs.alt || 'Imagen del contenido'}
        title={node.attrs.title || ''}
        onLoad={handleImageLoad}
        onError={handleImageError}
        crossOrigin="anonymous"
        className={`rounded-lg transition-all ${
          selected 
            ? 'ring-4 ring-primary shadow-xl' 
            : 'hover:ring-2 hover:ring-primary/30'
        } ${isLoading ? 'invisible' : ''}`}
        style={{
          width: dimensions.width,
          height: dimensions.height,
          maxWidth: '100%',
          objectFit: 'cover',
          cursor: isResizing ? 'ew-resize' : selected ? 'move' : 'pointer',
        }}
        draggable={false}
      />

      {/* Handle de redimensionado - relativo a la imagen */}
      {selected && !isLoading && !error && (
        <div
          className="absolute -bottom-2 -right-2 w-6 h-6 bg-background dark:bg-background border-2 border-primary rounded-full cursor-nwse-resize shadow-lg hover:scale-110 transition-transform z-10"
          onMouseDown={handleResizeStart}
          title="Arrastra para cambiar el tamaño"
        >
          <svg 
            className="w-3 h-3 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </div>
      )}
    </NodeViewWrapper>
  );
}

export const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: element => {
          const width = element.getAttribute('width');
          return width ? parseInt(width) : null;
        },
        renderHTML: attributes => {
          if (!attributes.width) {
            return {};
          }
          return { width: attributes.width };
        },
      },
      height: {
        default: null,
        parseHTML: element => {
          const height = element.getAttribute('height');
          return height ? parseInt(height) : null;
        },
        renderHTML: attributes => {
          if (!attributes.height) {
            return {};
          }
          return { height: attributes.height };
        },
      },
      style: {
        default: null,
        parseHTML: element => element.getAttribute('style'),
        renderHTML: attributes => {
          if (!attributes.style) {
            return {};
          }
          return { style: attributes.style };
        },
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', HTMLAttributes];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },
});
