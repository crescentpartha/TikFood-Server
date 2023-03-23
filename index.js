const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// connection setup with database with secure password on environment variable
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uxegwwi.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// client.connect(err => {
//     const collection = client.db("test").collection("devices");
//     console.log('TikFood database connected');
//     // perform actions on the collection object
//     client.close();
// });

// Create dynamic data and send to the database
async function run() {
    try {
        await client.connect();
        const menuCollection = client.db('tikfoodDB').collection('menu');

        // 01. get all menu data (json format) from database
        app.get('/menu', async (req, res) => {
            const query = {};
            const cursor = menuCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });

        // 02. POST a new menu item from server-side to database
        app.post('/menu', async(req, res) => {
            const newMenu = req.body;
            console.log('Adding a new menu item', newMenu);
            const result = await menuCollection.insertOne(newMenu);
            res.send(result);
        });
    }
    finally {
        // await client.close(); // commented, if I want to keep connection active;
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running TikFood Server');
});

app.listen(port, () => {
    console.log('Listening to port', port);
});