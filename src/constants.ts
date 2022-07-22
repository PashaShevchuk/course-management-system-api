export enum UserRoles {
  ADMIN = 'admin',
  INSTRUCTOR = 'instructor',
  STUDENT = 'student',
}

export enum EmailTemplates {
  CHANGE_STATUS = 'change-status',
}

export const MIN_PERCENTAGE_OF_FINAL_MARK = 80; // %

export const MIME_TYPES = {
  plain: 'text/plain',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  doc: 'application/msword',
};
