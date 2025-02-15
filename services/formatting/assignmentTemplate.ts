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

export function formatAssignment(data: AssignmentData): string {
  return `
${data.schoolName.toUpperCase()}
===========================================

ASSIGNMENT SUBMISSION
-------------------

Title: ${data.title}
Subject: ${data.subject}
Due Date: ${format(new Date(data.dueDate), 'PPP')}

Student Information:
------------------
Name: ${data.studentName}
Student ID: ${data.studentNumber}

Content:
--------
${data.content}

Submitted on: ${format(new Date(), 'PPP')}
`;
} 