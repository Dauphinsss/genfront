import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const imageUrl = request.nextUrl.searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'URL de imagen no proporcionada' },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Token de autenticación no proporcionado' },
        { status: 401 }
      );
    }

    const imageResponse = await fetch(imageUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!imageResponse.ok) {
      console.error('Error al obtener imagen:', imageResponse.status);
      return NextResponse.json(
        { error: 'No se pudo obtener la imagen' },
        { status: imageResponse.status }
      );
    }

    const imageBlob = await imageResponse.blob();
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

    return new NextResponse(imageBlob, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error en image proxy:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
