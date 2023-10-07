import { MongoClient } from "mongodb";

let database;

async function connectToDb(cb){
    const client = new MongoClient('mongodb://127.0.0.1:27017');
        await client.connect();
        database = client.db('wowtask');
    cb();
}

export { database, connectToDb };