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

// At least one upper case English letter, (?=.*?[A-Z])
// At least one lower case English letter, (?=.*?[a-z])
// At least one digit, (?=.*?[0-9])
// Minimum eight in length .{8,256} (with the anchors)
export const PASSWORD_REGEX = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,256}$/;
