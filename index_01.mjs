import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
import express from "express";
dotenv.config();

const db_username = process.env.MONGO_DB_USERNAME;
const db_password = process.env.MONGO_DB_PASSWORD;
const db_url = process.env.MONGO_DB_URL;
const uri = `mongodb+srv://${db_username}:${db_password}@${db_url}?retryWrites=true&w=majority`;

const client = new MongoClient(uri);
const app = express();
app.set("port", process.env.PORT || 3000);

app.use(express.json());

app.post("/findOne", async (req, res) => {
    try {
        const dbName = req.body.database || "sample_airbnb";
        const collectionName = req.body.collection || "listingsAndReviews";
        const filter = req.body.filter || {};
        const projection = req.body.projection || {};
        console.log('dbName:', dbName, 'collectionName:', collectionName);

        const database = client.db(dbName);
        const collection = database.collection(collectionName);

        for (const key in filter) {
            if (key === "bedrooms" || key === "beds") {
                filter[key] = parseInt(filter[key]);
            } else if (filter[key] == null) {
                delete filter[key];
            }
        }

        const document = await collection.findOne(filter, { projection: projection });

        res.type("json");
        res.status(200);
        res.json({ document: document });
    } catch (error) {
        console.log(error);
    }
});

app.use((req, res) => {
    res.type("text/plain");
    res.status(404);
    res.send("404 - Not found");
});

(async () => {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
        app.listen(app.get("port"), () => {
            console.log("Express started");
        });
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
})();

