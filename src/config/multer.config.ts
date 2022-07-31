import { HttpException, HttpStatus } from '@nestjs/common';
import { MIME_TYPES } from '../constants';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

export const multerOptions = {
  limits: {
    files: Number(process.env.FILES_QTY),
    fileSize: Number(process.env.FILE_SIZE),
  },
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedMimeTypes = Object.values(MIME_TYPES);

    if (!allowedMimeTypes.includes(file.mimetype)) {
      cb(
        new HttpException('Unsupported file type', HttpStatus.BAD_REQUEST),
        false,
      );
    }

    cb(null, true);
  },
};
