import { DataSource } from 'typeorm';
import { configService } from './config.service';

export default new DataSource(configService.getTypeOrmConfig());
