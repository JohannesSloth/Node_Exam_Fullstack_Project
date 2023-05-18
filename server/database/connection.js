import { MongoClient } from "mongodb";

const url = "mongodb://127.0.0.1:27017";

const client = new MongoClient(url);

const db = client.db("wowchatter");

export default {
    users: db.collection("users")
}