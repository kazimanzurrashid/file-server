import config from '../../config';

import FileRepository from './file-repository';
import InMemoryFileRepository from './in-memory-file-repository';

export default function fileRepositoryProvider(): FileRepository {
  switch (config.db.provider.toLowerCase()) {
   case 'in-memory':
    case 'local': {
       return new InMemoryFileRepository();
     }
    default:
    {
      throw new Error(
        `Unsupported file repository provider: "${config.db.provider}"!`
      );
    }
  }
}
