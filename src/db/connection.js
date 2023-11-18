const mongoose = require('mongoose');

const connectToDb = () => {
    try{
        const mongoURI = 'mongodb+srv://kvgopikabalagopal:mitju8-fiJnun-ryqpyt@gopika.glzahb7.mongodb.net/note-taking-app';

        mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

        mongoose.connection.on('connected', () => {
            console.log('Mongoose connected to ' + mongoURI);
        });

        mongoose.connection.on('error', (err) => {
            console.log('Mongoose connection error: ' + err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('Mongoose disconnected');
        });
    }
    catch(e){
        console.log('error is mongo connectin: ', e)
    }
}

module.exports = {
    connectToDb
}