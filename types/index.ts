export interface User {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  school_details?: SchoolDetails;
}

export interface SchoolDetails {
  school_name: string;
  student_number: string;
  program: string;
  class: string;
  department?: string;
}

export interface Assignment {
  id: string;
  user_id: string;
  title: string;
  content: string;
  ai_response: string;
  created_at: string;
  updated_at: string;
  status: "draft" | "completed";
}

export interface PDFOptions {
  includeSchoolDetails: boolean;
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
}
