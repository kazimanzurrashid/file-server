// noinspection JSUnresolvedVariable
// eslint-disable-next-line no-undef
db.createUser({
  user: process.env.MONGO_INITDB_ROOT_USERNAME,
  pwd: process.env.MONGO_INITDB_ROOT_PASSWORD,
  roles: ['dbOwner']
});
