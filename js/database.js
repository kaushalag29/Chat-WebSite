const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = callback => {
  MongoClient.connect(
    'mongodb+srv://bugbounty110:Armaan.123@strangechat-aujko.mongodb.net/test?retryWrites=true', { useNewUrlParser: true }
  )
    .then(client => {
      console.log('Database Connected!');
      _db = client.db();
      callback();
    })
    .catch(err => {
      console.log(err);
      throw err;
    });
};

const getDb = () => {
  if(_db){
    return _db;
  }
  throw 'No Database Found';
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;