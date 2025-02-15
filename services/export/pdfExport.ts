import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import MarkdownIt from 'markdown-it';

type AssignmentData = {
  content: string;
  title: string;
  format: {
    font: string;
    fontSize: number;
    lineHeight: number;
  };
};

const md = new MarkdownIt({
  html: true,
  breaks: true,
  typographer: true
});

const htmlTemplate = (data: AssignmentData) => {
  // Convert markdown to HTML
  const htmlContent = md.render(data.content);
  const baseFontSize = data.format.fontSize;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${data.title}</title>
  <style>
    @page {
      margin: 1in;
      size: letter portrait;
    }
    * {
      font-family: "${data.format.font}", serif;
      line-height: ${data.format.lineHeight};
      box-sizing: border-box;
    }
    body {
      font-size: ${baseFontSize}pt;
      margin: 0;
      padding: 0;
      color: #000;
    }
    h1 {
      font-size: ${baseFontSize * 1.6}pt;
      font-weight: bold;
      margin: 1em 0 0.5em;
    }
    h2 {
      font-size: ${baseFontSize * 1.4}pt;
      font-weight: bold;
      margin: 1em 0 0.5em;
    }
    h3 {
      font-size: ${baseFontSize * 1.2}pt;
      font-weight: bold;
      margin: 1em 0 0.5em;
    }
    h4, h5, h6 {
      font-size: ${baseFontSize}pt;
      font-weight: bold;
      margin: 1em 0 0.5em;
    }
    p {
      font-size: ${baseFontSize}pt;
      margin: 0.5em 0;
    }
    strong {
      font-weight: bold;
    }
    code {
      font-family: monospace;
      font-size: ${baseFontSize * 0.9}pt;
      background-color: #f5f5f5;
      padding: 0.2em 0.4em;
      border-radius: 3px;
    }
    pre {
      font-family: monospace;
      font-size: ${baseFontSize * 0.9}pt;
      background-color: #f5f5f5;
      padding: 1em;
      border-radius: 5px;
      overflow-x: auto;
      white-space: pre-wrap;
      page-break-inside: avoid;
    }
    ul, ol {
      font-size: ${baseFontSize}pt;
      margin: 0.5em 0;
      padding-left: 2em;
    }
    li {
      margin: 0.3em 0;
    }
    table {
      font-size: ${baseFontSize}pt;
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 0.5em;
      text-align: left;
    }
    th {
      font-weight: bold;
      background-color: #f5f5f5;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    blockquote {
      font-size: ${baseFontSize}pt;
      font-style: italic;
      margin: 1em 0;
      padding-left: 1em;
      border-left: 4px solid #ddd;
      color: #666;
    }
    hr {
      border: none;
      border-top: 1px solid #ddd;
      margin: 1em 0;
    }
    @media print {
      body {
        width: 8.5in;
        height: 11in;
      }
      pre, code {
        white-space: pre-wrap;
        word-wrap: break-word;
      }
    }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>
`;
};

export async function exportToPDF(data: AssignmentData) {
  try {
    console.log('Starting PDF export...');

    const cacheDir = FileSystem.cacheDirectory;
    if (!cacheDir) {
      throw new Error('Cache directory not available');
    }

    console.log('Generating PDF...');
    const { uri } = await Print.printToFileAsync({
      html: htmlTemplate(data),
      base64: false,
      width: 612, // Standard US Letter width in points (8.5 inches)
      height: 792, // Standard US Letter height in points (11 inches)
    });

    console.log('PDF generated at:', uri);

    const isSharingAvailable = await Sharing.isAvailableAsync();
    if (!isSharingAvailable) {
      throw new Error('Sharing is not available on this device');
    }

    console.log('Sharing PDF...');
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `${data.title} - Assignment`,
      UTI: 'com.adobe.pdf'
    });

    try {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    } catch (cleanupError) {
      console.warn('Failed to clean up temporary file:', cleanupError);
    }

    return true;
  } catch (error) {
    console.error('Error in exportToPDF:', error);
    if (error instanceof Error) {
      throw new Error(`PDF export failed: ${error.message}`);
    } else {
      throw new Error('PDF export failed with unknown error');
    }
  }
} 