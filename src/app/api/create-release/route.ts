import { NextRequest, NextResponse } from 'next/server';
import { createRelease } from '@/lib/github';

export const runtime = 'nodejs';
export const maxDuration = 60; // до 60 сек на большие файлы

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const version = formData.get('version') as string | null;
    const modTitle = formData.get('modTitle') as string | null;
    const modSlug = formData.get('modSlug') as string | null;
    const changelog = (formData.get('changelog') as string) || '';

    if (!file || !version || !modSlug || !modTitle) {
      return NextResponse.json(
        { error: 'Не хватает обязательных полей' },
        { status: 400 }
      );
    }

    // Максимум 100 МБ
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Файл больше 100 МБ' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    // Тег не может содержать пробелы и спецсимволы
    const cleanSlug = modSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const cleanVersion = version.trim().replace(/\s+/g, '-');
    const tag = `${cleanSlug}-v${cleanVersion}`;

    const { downloadUrl, releaseUrl } = await createRelease({
      tag,
      name: `${modTitle} v${version}`,
      body: changelog || `Версия ${version}`,
      fileName: file.name,
      fileBuffer: buffer,
    });

    return NextResponse.json({
      downloadUrl,
      releaseUrl,
      fileSize: file.size,
    });
  } catch (err: unknown) {
    console.error('create-release error:', err);
    const msg = err instanceof Error ? err.message : 'Ошибка создания релиза';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}