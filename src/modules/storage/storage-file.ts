import { Stream } from 'stream';

export interface StorageFile {
  contentType: string;
  stream: Stream;
  metadata?: { [key: string]: any };
}
