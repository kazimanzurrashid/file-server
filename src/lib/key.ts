import { v4 as uuid } from 'uuid';

export default {
  generate: () => uuid().toLowerCase().replace(/-/g, '')
};
