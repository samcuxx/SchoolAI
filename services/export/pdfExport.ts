import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { format } from 'date-fns';

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

const htmlTemplate = (data: AssignmentData) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${data.title}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      margin: 40px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .school-name {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .assignment-info {
      margin-bottom: 30px;
    }
    .student-info {
      margin-bottom: 30px;
      padding: 15px;
      background-color: #f5f5f5;
      border-radius: 5px;
    }
    .content {
      margin-top: 20px;
      white-space: pre-wrap;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    .ai-info {
      margin-top: 20px;
      font-style: italic;
      color: #666;
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
    <p><strong>Due Date:</strong> ${format(new Date(data.dueDate), 'PPP')}</p>
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
    Generated using ${data.provider} on ${format(new Date(data.generatedDate!), 'PPP')}
  </div>
  ` : ''}

  <div class="footer">
    Submitted on: ${format(new Date(), 'PPP')}
  </div>
</body>
</html>
`;

export async function exportToPDF(data: AssignmentData) {
  try {
    // Generate PDF
    const { uri } = await Print.printToFileAsync({
      html: htmlTemplate(data),
      base64: false
    });

    // Share the PDF
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `${data.title} - Assignment`,
      UTI: 'com.adobe.pdf'
    });
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw error;
  }
} 