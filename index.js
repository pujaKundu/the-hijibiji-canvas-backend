const express = require("express");
const cors = require("cors");
const app = express();
const ObjectId = require("mongodb").ObjectId;
const port = process.env.PORT || 5000;
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
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", async (req, res) => {
  res.send("Server started");
});

app.listen(port, () => {
  console.log("Server running on port", port);
});
