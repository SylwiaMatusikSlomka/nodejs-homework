const mongoose = require('mongoose');
const app = require('./app')

const url = "mongodb+srv://sylwia:ASlomka123@basecluster.4nqy1.mongodb.net/db-contacts";

const server = async() => {
    try {
        await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Database connection successful");
        app.listen(3000, () => {
            console.log("Server is running localhost:3000");
        });
    } catch (err) {
        console.error("MongoDB connection filled!!", err);
        console.err(err), process.exit(1);
    }
};

server();