import { HttpException, HttpStatus } from '@nestjs/common';
import { FILE_SIZE_LIMIT, FILES_QTY_LIMIT, MIME_TYPES } from '../constants';

// eslint-disable-next-line
require('dotenv').config();

export const multerOptions = {
  limits: {
    files: FILES_QTY_LIMIT,
    fileSize: FILE_SIZE_LIMIT,
  },
  fileFilter: (req: any, file: any, cb: any) => {
    if (!MIME_TYPES.includes(file.mimetype)) {
      cb(
        new HttpException('Unsupported file type', HttpStatus.BAD_REQUEST),
        false,
      );
    }

    cb(null, true);
  },
};
