import { Injectable, Logger } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { ConfigService } from '../../config/config.service';
import { StorageFile } from './storage-file';

@Injectable()
export class StorageService {
  private LOGGER_PREFIX = '[StorageService]:';
  private logger = new Logger();

  private storage: Storage;
  private bucket: string;
  private storageConfigs;

  constructor(private readonly configService: ConfigService) {
    this.storageConfigs = configService.getStorageConfig();
    this.storage = new Storage({
      projectId: this.storageConfigs.projectId,
      credentials: {
        client_email: this.storageConfigs.client_email,
        private_key: this.storageConfigs.private_key,
      },
    });
    this.bucket = this.storageConfigs.bucket;
  }

  async save(
    path: string,
    contentType: string,
    buffer: Buffer,
    metadata: { [key: string]: string }[],
  ) {
    this.logger.log(`${this.LOGGER_PREFIX} save a file`);

    const object = metadata.reduce((obj, item) => Object.assign(obj, item), {});
    const file = this.storage.bucket(this.bucket).file(path);
    const stream = file.createWriteStream();

    stream.on('finish', async () => {
      return await file.setMetadata({
        contentType,
        metadata: object,
      });
    });
    stream.end(buffer);
  }

  async delete(path: string) {
    this.logger.log(`${this.LOGGER_PREFIX} delete a file`);

    await this.storage
      .bucket(this.bucket)
      .file(path)
      .delete({ ignoreNotFound: true });
  }

  async get(path: string, includeMetadata = false): Promise<StorageFile> {
    this.logger.log(`${this.LOGGER_PREFIX} get a file`);

    const fileStream = await this.storage
      .bucket(this.bucket)
      .file(path)
      .createReadStream();
    const [metadata] = await this.storage
      .bucket(this.bucket)
      .file(path)
      .getMetadata();

    return {
      contentType: metadata.contentType,
      stream: fileStream,
      ...(includeMetadata && { metadata }),
    };
  }
}
