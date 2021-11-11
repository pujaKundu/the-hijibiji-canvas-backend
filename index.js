const express = require("express");
const cors = require("cors");
const app = express();
const ObjectId = require("mongodb").ObjectId;
const port = process.env.PORT || 8000;
const { MongoClient } = require("mongodb");

require("dotenv").config();

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lzwpo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    console.log("hijibiji db connected");
    const database = client.db("hijibiji_canvas");
    const servicesCollection = database.collection("services");
    const ordersCollection = database.collection("orders");
    const usersCollection = database.collection("users");

    //get services api
    app.get("/services", async (req, res) => {
      const cursor = servicesCollection.find({});
      const services = await cursor.toArray();
      res.send(services);
    });
    //single service api
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      console.log("Hitting id", id);
      const query = { _id: ObjectId(id) };
      const result = await servicesCollection.findOne(query);
      res.send(result);
    });
    //post order api
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await ordersCollection.insertOne(order);
      res.json(result);
    });
    //api email based
    app.get("/orders", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const cursor = ordersCollection.find(query);
      const orders = await cursor.toArray();
      res.json(orders);
    });
    //get all orders api
    app.get("/allOrders", async (req, res) => {
      const cursor = ordersCollection.find({});
      const results = await cursor.toArray();
      res.send(results);
    });
    //delete api
    app.delete("/allOrders/:id", async (req, res) => {
      const id = req.params.id;
      console.log("deleted", id);
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.json(result);
    });

    //users collection post api
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      console.log(result);
      res.json(result);
    });

    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", async (req, res) => {
  res.send("Hijibiji Server started");
});

app.listen(port, () => {
  console.log("Server running on port", port);
});
