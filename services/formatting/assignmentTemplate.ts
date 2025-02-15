import { format } from 'date-fns';

type AssignmentData = {
  title: string;
  subject: string;
  studentName: string;
  studentNumber: string;
  schoolName: string;
  dueDate: string;
  content: string;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export function formatAssignment(data: AssignmentData): string {
  return `
${data.schoolName.toUpperCase()}
===========================================

ASSIGNMENT SUBMISSION
-------------------

Title: ${data.title}
Subject: ${data.subject}
Due Date: ${formatDate(data.dueDate)}

Student Information:
------------------
Name: ${data.studentName}
Student ID: ${data.studentNumber}

Content:
--------
${data.content}

Submitted on: ${formatDate(new Date().toISOString())}
`;
} 