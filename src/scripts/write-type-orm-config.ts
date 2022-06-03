import { configService } from '../config/config.service';
import fs = require('fs');

configService.getTypeOrmConfig().then((config) => {
  fs.writeFileSync('ormconfig.json', JSON.stringify(config, null, 2));
});
