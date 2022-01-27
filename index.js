const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
// change by another folder
// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jfvuq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run() {
    try {
        await client.connect();
        const database = client.db('travel-blog');
        const blogsCollection = database.collection('blogs');
        const usersCollection = database.collection('users');

        app.get('/blogs', async (req, res) => {
            const cursor = blogsCollection.find({});
            const page = parseInt(req.query.page);
            let blogs;
            const count = await cursor.count();
            if (page>=0) {
                blogs = await cursor.skip(page * 10).limit(10).toArray();
            }
            else {
                blogs = await cursor.toArray();
            }
            res.send({
                count,
                blogs
            });
        });
         // fetch by id
         app.get('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await blogsCollection.findOne(query);
            console.log('load', result);
            res.send(result);
        });
        //add blog
        app.post('/blogs', async (req, res) => {
            const cursor = req.body;
            const result = await blogsCollection.insertOne(cursor);
            res.json(result);
        });
        //set user in database
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });
        //find admin role
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });
         //cancel blog
         app.delete('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await blogsCollection.deleteOne(query);
            res.json(result);
        });
        app.get('/blogs', async (req, res) => {
            const cursor = blogsCollection.find({});
            const books = await cursor.toArray();
            res.send(books);
        });
        //confirmed blog
        app.put('/blogs/:id',async(req,res)=>{
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                  "status": "accepted"
                },
              };
            const result=await blogsCollection.updateOne(query,updateDoc);
            res.json(result);
        });
        //make admin
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email }
            const updateDoc = { $set: { role: 'admin' } }
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        });
        
    }
    finally {
        //a
    }
}
run().catch(console.dir);
app.get('/', (req, res) => {
    res.send('Server start');
});
app.listen(port, () => {
    console.log('Listening to port', port)
})
