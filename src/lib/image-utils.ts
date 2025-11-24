import React from 'react';

export function getAuthenticatedImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) {
    return '/placeholder.svg';
  }

  if (imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
    return imageUrl;
  }

  if (imageUrl.includes('localhost:4000') || imageUrl.includes('http://') || imageUrl.includes('https://')) {
    const encodedUrl = encodeURIComponent(imageUrl);
    return `/api/image-proxy?url=${encodedUrl}`;
  }

  return imageUrl;
}

export function useAuthenticatedImage(imageUrl: string | null | undefined) {
  const [imageSrc, setImageSrc] = React.useState<string>('/placeholder.svg');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (!imageUrl) {
      setImageSrc('/placeholder.svg');
      return;
    }

    if (imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
      setImageSrc(imageUrl);
      return;
    }

    if (!imageUrl.includes('localhost:4000')) {
      setImageSrc(imageUrl);
      return;
    }

    const loadImage = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('pyson_token');
        if (!token) {
          throw new Error('Token no disponible');
        }

        const response = await fetch(`/api/image-proxy?url=${encodeURIComponent(imageUrl)}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Error al cargar imagen');
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        setImageSrc(blobUrl);
      } catch (err) {
        console.error('Error cargando imagen:', err);
        setError(err instanceof Error ? err : new Error('Error desconocido'));
        setImageSrc('/placeholder.svg');
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();

    return () => {
      if (imageSrc.startsWith('blob:')) {
        URL.revokeObjectURL(imageSrc);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl]);

  return { imageSrc, isLoading, error };
}
