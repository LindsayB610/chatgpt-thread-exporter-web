export type ExportFormat = 'markdown' | 'pdf';

export type ExportRequest = {
  sharedUrl: string;
  format: ExportFormat;
};

export type ExportResult = {
  blob: Blob;
  filename: string;
};

export function isChatGptSharedUrl(value: string) {
  try {
    const url = new URL(value);
    const isExpectedHost =
      url.hostname === 'chatgpt.com' || url.hostname === 'chat.openai.com';

    return isExpectedHost && url.pathname.includes('/share/');
  } catch {
    return false;
  }
}

export async function exportSharedThread(
  request: ExportRequest,
): Promise<ExportResult> {
  await wait(900);

  const filename = buildDownloadFilename(request.format);

  if (request.format === 'markdown') {
    const content = [
      '# ChatGPT Thread Export',
      '',
      `Source: ${request.sharedUrl}`,
      '',
      '> Frontend scaffold placeholder',
      '',
      'This is a temporary Markdown export used to prove the v1.3 frontend flow.',
      'The next step is wiring this request into the existing CLI/export engine.',
    ].join('\n');

    return {
      blob: new Blob([content], { type: 'text/markdown;charset=utf-8' }),
      filename,
    };
  }

  const content = [
    '%PDF-1.4',
    '1 0 obj',
    '<< /Type /Catalog /Pages 2 0 R >>',
    'endobj',
    '2 0 obj',
    '<< /Type /Pages /Count 1 /Kids [3 0 R] >>',
    'endobj',
    '3 0 obj',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Font << /F1 5 0 R >> >>',
    'endobj',
    '4 0 obj',
    '<< /Length 122 >>',
    'stream',
    'BT',
    '/F1 18 Tf',
    '72 720 Td',
    '(ChatGPT Thread Export Placeholder) Tj',
    '0 -28 Td',
    '/F1 11 Tf',
    `(Source: ${escapePdfText(request.sharedUrl)}) Tj`,
    '0 -18 Td',
    '(Frontend scaffold for v1.3 local run.) Tj',
    'ET',
    'endstream',
    'endobj',
    '5 0 obj',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    'endobj',
    'xref',
    '0 6',
    '0000000000 65535 f ',
    '0000000009 00000 n ',
    '0000000058 00000 n ',
    '0000000115 00000 n ',
    '0000000241 00000 n ',
    '0000000414 00000 n ',
    'trailer',
    '<< /Size 6 /Root 1 0 R >>',
    'startxref',
    '484',
    '%%EOF',
  ].join('\n');

  return {
    blob: new Blob([content], { type: 'application/pdf' }),
    filename,
  };
}

export function buildDownloadFilename(format: ExportFormat) {
  const timestamp = new Date().toISOString().slice(0, 10);
  return `chatgpt-thread-export-${timestamp}.${format === 'markdown' ? 'md' : 'pdf'}`;
}

function wait(durationMs: number) {
  return new Promise((resolve) => window.setTimeout(resolve, durationMs));
}

function escapePdfText(value: string) {
  return value.split('\\').join('\\\\').split('(').join('\\(').split(')').join('\\)');
}
