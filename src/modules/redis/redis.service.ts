import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
  ) {}

  async get(key): Promise<string> {
    return await this.cache.get(key);
  }

  async set(key, value) {
    await this.cache.set(key, value);
  }

  async del(key) {
    await this.cache.del(key);
  }
}
