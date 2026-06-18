const mongoose = require('mongoose');

const uri = 'mongodb+srv://belen:abelen2009@cluster0.ktfhew2.mongodb.net/?appName=Cluster0';

async function conectarBD() {
try {
await mongoose.connect(uri);
console.log('Conectado correctamente a MongoDB local con Mongoose');
} catch (error) {
console.log('Error conectando con Mongoose:', error.message);
}
}

module.exports = conectarBD;