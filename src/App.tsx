import { useState, type FormEvent } from 'react';
import {
  buildDownloadFilename,
  exportSharedThread,
  isChatGptSharedUrl,
  type ExportFormat,
  type ExportResult,
} from './lib/exporter';

const FORMATS: Array<{
  value: ExportFormat;
  label: string;
  description: string;
}> = [
  {
    value: 'markdown',
    label: 'Markdown',
    description: 'Clean text output for writing, archiving, and reuse.',
  },
  {
    value: 'pdf',
    label: 'PDF',
    description: 'Shareable document output with a familiar reading format.',
  },
];

export default function App() {
  const [sharedUrl, setSharedUrl] = useState('');
  const [format, setFormat] = useState<ExportFormat>('markdown');
  const [status, setStatus] = useState<
    'idle' | 'validating' | 'exporting' | 'success' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [result, setResult] = useState<ExportResult | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setResult(null);
    setErrorMessage('');
    setStatus('validating');

    if (!sharedUrl.trim()) {
      setStatus('error');
      setErrorMessage('Paste a shared ChatGPT link to continue.');
      return;
    }

    if (!isChatGptSharedUrl(sharedUrl)) {
      setStatus('error');
      setErrorMessage(
        'That does not look like a ChatGPT shared link. Use a public share URL and try again.',
      );
      return;
    }

    setStatus('exporting');

    try {
      const exported = await exportSharedThread({
        sharedUrl,
        format,
      });

      setResult(exported);
      setStatus('success');
    } catch (error) {
      setStatus('error');
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'The export failed. Please try again.',
      );
    }
  }

  function handleDownload() {
    if (!result) {
      return;
    }

    const url = URL.createObjectURL(result.blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = result.filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="page-shell">
      <main className="app-card">
        <section className="hero">
          <p className="eyebrow">chatgpt-thread-exporter v1.3</p>
          <h1>Export a shared ChatGPT thread in one step.</h1>
          <p className="hero-copy">
            Paste a public shared link, choose Markdown or PDF, and download the
            export. This frontend stays intentionally small so it can remain the
            hosted companion to the CLI.
          </p>
        </section>

        <section className="panel">
          <form className="export-form" onSubmit={handleSubmit}>
            <label className="field">
              <span className="field-label">Shared link</span>
              <input
                className="text-input"
                type="url"
                placeholder="https://chatgpt.com/share/..."
                value={sharedUrl}
                onChange={(event) => setSharedUrl(event.target.value)}
              />
            </label>

            <div className="field">
              <span className="field-label">Format</span>
              <div className="format-grid" role="radiogroup" aria-label="Export format">
                {FORMATS.map((option) => (
                  <label
                    className={`format-option ${
                      format === option.value ? 'is-selected' : ''
                    }`}
                    key={option.value}
                  >
                    <input
                      checked={format === option.value}
                      name="format"
                      type="radio"
                      value={option.value}
                      onChange={() => setFormat(option.value)}
                    />
                    <span className="format-title">{option.label}</span>
                    <span className="format-description">{option.description}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              className="primary-button"
              disabled={status === 'validating' || status === 'exporting'}
              type="submit"
            >
              {status === 'exporting' ? 'Exporting...' : 'Export'}
            </button>
          </form>
        </section>

        <section className="status-grid">
          <article className="panel status-panel">
            <h2>Status</h2>
            <p>{getStatusMessage(status, errorMessage)}</p>
          </article>

          <article className="panel result-panel">
            <h2>Download</h2>
            {result ? (
              <>
                <p>
                  Ready: <strong>{result.filename}</strong>
                </p>
                <button className="secondary-button" onClick={handleDownload} type="button">
                  Download {format === 'markdown' ? 'Markdown' : 'PDF'}
                </button>
              </>
            ) : (
              <p>
                Your export will appear here after processing. File names follow the
                CLI-style unique naming approach.
              </p>
            )}
          </article>
        </section>

        <section className="panel privacy-panel">
          <h2>Privacy note</h2>
          <p>
            This scaffold currently uses a local mock export service so we can build the
            UI and app shape first. The production version can switch to a thin backend
            helper for reliable Markdown and Playwright-based PDF generation without
            changing the frontend flow.
          </p>
          <p className="technical-note">
            Current filename preview: {buildDownloadFilename(format)}
          </p>
        </section>
      </main>
    </div>
  );
}

function getStatusMessage(
  status: 'idle' | 'validating' | 'exporting' | 'success' | 'error',
  errorMessage: string,
) {
  switch (status) {
    case 'validating':
      return 'Checking your shared link before the export starts.';
    case 'exporting':
      return 'Creating your export now.';
    case 'success':
      return 'Export complete. Your file is ready to download.';
    case 'error':
      return errorMessage;
    default:
      return 'Paste a shared link and choose a format to begin.';
  }
}
