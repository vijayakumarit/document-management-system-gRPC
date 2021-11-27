const mongoose = require('mongoose');

//Mongodb connection 
mongoose.connect(process.env.DATABASE_URI, {
    useNewUrlParser: true
});
mongoose.Promise = global.Promise;
mongoose.connection.on('error', (err) => {
    console.log(`Mongo is not connected`);
});