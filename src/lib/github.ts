const GITHUB_API = 'https://api.github.com';

function getHeaders() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN не задан в env variables');
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

export function getOwner() {
  const owner = process.env.GITHUB_OWNER;
  if (!owner) throw new Error('GITHUB_OWNER не задан');
  return owner;
}

export function getRepo() {
  const repo = process.env.GITHUB_REPO;
  if (!repo) throw new Error('GITHUB_REPO не задан');
  return repo;
}

/**
 * Загружает файл в репозиторий GitHub (в указанную папку).
 * Возвращает публичную raw-ссылку на файл.
 */
export async function uploadFileToRepo(params: {
  path: string;        // например "images/abc123.png"
  content: Buffer;     // содержимое файла
  message: string;     // commit message
}): Promise<string> {
  const owner = getOwner();
  const repo = getRepo();
  const { path, content, message } = params;

  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`;

  // Проверяем существует ли файл (для обновления нужен sha)
  let sha: string | undefined;
  const checkRes = await fetch(url, { headers: getHeaders() });
  if (checkRes.ok) {
    const existing = await checkRes.json();
    sha = existing.sha;
  }

  const res = await fetch(url, {
    method: 'PUT',
    headers: { ...getHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      content: content.toString('base64'),
      ...(sha && { sha }),
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub upload failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  // raw ссылка для отображения на сайте
  return data.content?.download_url || 
    `https://raw.githubusercontent.com/${owner}/${repo}/main/${path}`;
}

/**
 * Создаёт GitHub Release и прикрепляет к нему файл.
 * Возвращает ссылку на скачивание.
 */
export async function createRelease(params: {
  tag: string;         // например "mymod-v1.0.0"
  name: string;        // заголовок релиза
  body?: string;       // описание
  fileName: string;    // например "mymod-1.0.0.zip"
  fileBuffer: Buffer;  // содержимое файла
}): Promise<{ downloadUrl: string; releaseUrl: string }> {
  const owner = getOwner();
  const repo = getRepo();
  const { tag, name, body, fileName, fileBuffer } = params;

  // 1. Создаём релиз
  const releaseRes = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/releases`,
    {
      method: 'POST',
      headers: { ...getHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tag_name: tag,
        name,
        body: body || '',
        draft: false,
        prerelease: false,
      }),
    }
  );

  if (!releaseRes.ok) {
    const err = await releaseRes.text();
    throw new Error(`Ошибка создания релиза: ${releaseRes.status} ${err}`);
  }

  const release = await releaseRes.json();
  const uploadUrlTemplate: string = release.upload_url;
  // upload_url вида: https://uploads.github.com/repos/.../releases/123/assets{?name,label}
  const uploadUrl = `${uploadUrlTemplate.split('{')[0]}?name=${encodeURIComponent(fileName)}`;

  // 2. Загружаем файл в релиз
  const uploadRes = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      ...getHeaders(),
      'Content-Type': 'application/octet-stream',
    },
    body: new Uint8Array(fileBuffer),
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    throw new Error(`Ошибка загрузки файла: ${uploadRes.status} ${err}`);
  }

  const asset = await uploadRes.json();

  return {
    downloadUrl: asset.browser_download_url,
    releaseUrl: release.html_url,
  };
}