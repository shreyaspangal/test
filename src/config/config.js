require('dotenv').config();
const { ServerApiVersion } = require("mongodb");

const username = 'shreyas-pangal';
const mongodb_password = process.env.MONGODB_PASSWORD;
const clustername = 'banklist1.nphho3i';
const dbName = "BankList1";


module.exports = {
    port: process.env.PORT,
    mongoose: {
        url: `mongodb+srv://${username}:${mongodb_password}@${clustername}.mongodb.net/${dbName}?retryWrites=true&w=majority`,
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverApi: ServerApiVersion.v1
        },
    }
}