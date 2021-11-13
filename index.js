const express = require("express");
const app = express();
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const { MongoClient } = require("mongodb");

require("dotenv").config();
const port = process.env.PORT || 5000;
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
    const reviewsCollection = database.collection("reviews");
    const usersCollection = database.collection("users");

    //post product
    app.post("/services", async (req, res) => {
      const service = req.body;
      const result = await servicesCollection.insertOne(service);
      res.json(result);
    });
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
    //delete service api
    app.delete("/services/:id", async (req, res) => {
      const id = req.params.id;
      console.log("deleted", id);
      const query = { _id: ObjectId(id) };
      const result = await servicesCollection.deleteOne(query);
      res.json(result);
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
    app.get("/allOrders/:id", async (req, res) => {
      const id = req.params.id;
      console.log("Hitting id", id);
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.findOne(query);
      res.send(result);
    });
    app.put("/allOrders/:id", async (req, res) => {
      const id = req.params.id;

      const filter = { _id: ObjectId(id) };

      ordersCollection
        .updateOne(filter, {
          $set: {
            state: "Shipped",
          },
        })
        .then((result) => {
          res.send(result);
        });
    });
    //delete api
    app.delete("/allOrders/:id", async (req, res) => {
      const id = req.params.id;
      console.log("deleted", id);
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.json(result);
    });

    //get users
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
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
    //post review
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.send(result);
    });
    //get review
    app.get("/reviews", async (req, res) => {
      const cursor = reviewsCollection.find({});
      const results = await cursor.toArray();
      res.send(results);
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
