import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

type AssignmentData = {
  title: string;
  subject: string;
  studentName: string;
  studentNumber: string;
  schoolName: string;
  dueDate: string;
  content: string;
  provider?: string;
  generatedDate?: string;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const htmlTemplate = (data: AssignmentData) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${data.title}</title>
  <style>
    @page {
      margin: 20px;
    }
    body {
      font-family: 'Helvetica', sans-serif;
      line-height: 1.6;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #333;
      padding-bottom: 20px;
    }
    .school-name {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .assignment-info {
      margin-bottom: 30px;
      border: 1px solid #ddd;
      padding: 15px;
      border-radius: 5px;
    }
    .student-info {
      margin-bottom: 30px;
      padding: 15px;
      background-color: #f8f8f8;
      border-radius: 5px;
      border: 1px solid #ddd;
    }
    .content {
      margin-top: 20px;
      white-space: pre-wrap;
      text-align: justify;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 12px;
      color: #666;
      border-top: 1px solid #ddd;
      padding-top: 20px;
    }
    .ai-info {
      margin-top: 20px;
      font-style: italic;
      color: #666;
      background-color: #f8f8f8;
      padding: 10px;
      border-radius: 5px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="school-name">${data.schoolName}</div>
    <h2>Assignment Submission</h2>
  </div>

  <div class="assignment-info">
    <h3>${data.title}</h3>
    <p><strong>Subject:</strong> ${data.subject}</p>
    <p><strong>Due Date:</strong> ${formatDate(data.dueDate)}</p>
  </div>

  <div class="student-info">
    <h3>Student Information</h3>
    <p><strong>Name:</strong> ${data.studentName}</p>
    <p><strong>Student ID:</strong> ${data.studentNumber}</p>
  </div>

  <div class="content">
    ${data.content.replace(/\n/g, '<br>')}
  </div>

  ${data.provider ? `
  <div class="ai-info">
    Generated using ${data.provider} ${data.generatedDate ? `on ${formatDate(data.generatedDate)}` : ''}
  </div>
  ` : ''}

  <div class="footer">
    Submitted on: ${formatDate(new Date().toISOString())}
  </div>
</body>
</html>
`;

export async function exportToPDF(data: AssignmentData) {
  try {
    console.log('Starting PDF export...');

    // Ensure the cache directory exists
    const cacheDir = FileSystem.cacheDirectory;
    if (!cacheDir) {
      throw new Error('Cache directory not available');
    }

    // Generate PDF
    console.log('Generating PDF...');
    const { uri } = await Print.printToFileAsync({
      html: htmlTemplate(data),
      base64: false,
      width: 612, // Standard US Letter width in points (8.5 inches)
      height: 792, // Standard US Letter height in points (11 inches)
    });

    console.log('PDF generated at:', uri);

    // Check if sharing is available
    const isSharingAvailable = await Sharing.isAvailableAsync();
    if (!isSharingAvailable) {
      throw new Error('Sharing is not available on this device');
    }

    // Share the PDF
    console.log('Sharing PDF...');
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `${data.title} - Assignment`,
      UTI: 'com.adobe.pdf'
    });

    console.log('PDF shared successfully');

    // Clean up the temporary file
    try {
      await FileSystem.deleteAsync(uri, { idempotent: true });
      console.log('Temporary file cleaned up');
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