const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod;

async function conectarDB() {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
}

async function desconectarDB() {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
}

async function limpiarDB() {
  const colecciones = mongoose.connection.collections;
  for (const clave in colecciones) {
    await colecciones[clave].deleteMany({});
  }
}

module.exports = { conectarDB, desconectarDB, limpiarDB };
