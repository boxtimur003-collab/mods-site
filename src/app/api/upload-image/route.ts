import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToRepo } from '@/lib/github';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Файл не передан' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Можно загружать только изображения' },
        { status: 400 }
      );
    }

    // Максимум 5 МБ
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Картинка больше 5 МБ' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
    const safeName = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.${ext}`;
    const path = `images/${safeName}`;

    const imageUrl = await uploadFileToRepo({
      path,
      content: buffer,
      message: `Upload image: ${safeName}`,
    });

    return NextResponse.json({ imageUrl });
  } catch (err: unknown) {
    console.error('upload-image error:', err);
    const msg = err instanceof Error ? err.message : 'Ошибка загрузки';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}