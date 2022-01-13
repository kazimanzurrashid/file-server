import { v4 as uuid } from 'uuid';

export default {
  generate: () => {
    return uuid().toLowerCase().replace(/-/g, '');
  }
};
