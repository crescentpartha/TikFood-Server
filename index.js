const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const userCollection = client.db('tikfoodDB').collection('users');

        // 01. get all menu data (json format) from database
        app.get('/menu', async (req, res) => {
            const query = {};
            const cursor = menuCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });

        // 02. POST a new menu item from server-side to database
        app.post('/menu', async (req, res) => {
            const newMenu = req.body;
            console.log('Adding a new menu item', newMenu);
            const result = await menuCollection.insertOne(newMenu);
            res.send(result);
        });

        // 03. Load a particular menu item data from database - (id-wise)
        app.get('/menu/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            const query = { _id: new ObjectId(id) };
            const menuItem = await menuCollection.findOne(query);
            res.send(menuItem);
        });

        // 04. DELETE a menu item from server-side to database
        app.delete('/menu/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await menuCollection.deleteOne(query);
            console.log('One menu item is deleted');
            res.send(result);
        });

        // 05. Update a menu item in server-side and send to the database
        app.put('/menu/:id', async (req, res) => {
            const id = req.params.id;
            const menuItemData = req.body;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    name: menuItemData.name,
                    price: menuItemData.price,
                    availability: menuItemData.availability
                }
            };
            const result = await menuCollection.updateOne(filter, updatedDoc, options);
            console.log('Product is updated');
            res.send(result);
        });

        // 06. User Creation Process | put user to userCollection
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });

        // 07. get all user's data (json format) from database
        app.get('/user', async (req, res) => {
            const query = {};
            const cursor = userCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });

        // 08. get particular user to check user role (admin or not)
        app.get('/user/admin', async (req, res) => {
            console.log(req.query);
            const adminUser = await userCollection.findOne({ email: req.query.email });
            res.send(adminUser);
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