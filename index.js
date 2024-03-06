const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

//middlewares
app.use(express.json());
app.use(cors());

const uri = process.env.URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    //db collections
    const wishlistCollection = client
      .db("BlogVista")
      .collection("wishCollection");
    const allBlogsCollection = client.db("BlogVista").collection("allBlogs");
    const commentCollection = client.db("BlogVista").collection("comment");

    //get api's
    app.get("/allBlogs", async (req, res) => {
      const result = await allBlogsCollection.find().toArray();
      res.send(result);
    });
    app.get("/recentBlogs", async (req, res) => {
      const sort = { createdAt: -1 };
      const result = await allBlogsCollection
        .find()
        .sort(sort)
        .limit(6)
        .toArray();
      res.send(result);
    });

    app.delete("/delete-wishlist/:id", async (req, res) => {
      const wishlistId = req.params.id;
      const query = { _id: new ObjectId(wishlistId) };
      const result = await wishlistCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/featured-blogs", async (req, res) => {
      const pipeline = [
        {
          $addFields: {
            wordCount: { $size: { $split: ["$longdescription", " "] } }, // Count words in long_description
          },
        },
        {
          $sort: { wordCount: -1 }, // Sort by word count (descending)
        },
        {
          $limit: 10, // Limit to top 10 documents
        },
      ];
      const result = await allBlogsCollection.aggregate(pipeline).toArray();
      res.send(result);
    });

    app.get("/allBlogs/:id", async (req, res) => {
      const id = req.params.id;
      const blogId = { _id: new ObjectId(id) };
      const result = await allBlogsCollection.findOne(blogId);
      res.send(result);
    });
    app.get("/wishlist", async (req, res) => {
      const result = await wishlistCollection.find().toArray();
      res.send(result);
    });
    app.get("/comments/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        comment_id: id,
      };
      const result = await commentCollection.find(query).toArray();
      res.send(result);
    });

    //post api's
    app.post("/addblogs", async (req, res) => {
      const blog = req.body;
      blog.createdAt = new Date();
      const result = await allBlogsCollection.insertOne(blog);
      res.send(result);
    });
    app.post("/wishlist", async (req, res) => {
      const wishBlog = req.body;
      const result = await wishlistCollection.insertOne(wishBlog);
      res.send(result);
    });

    app.post("/comment-blogs", async (req, res) => {
      const comment = req.body;
      const result = await commentCollection.insertOne(comment);
      res.send(result);
    });

    //patch api's

    app.patch(`/update/:id`, async (req, res) => {
      const id = req.params.id;
      const { title, image, description, longdescription, category } =
        req.body;
      const filter = { _id: new ObjectId(id) };
      const updateProduct = {
        $set: {
          title,
          image,
          description,
          longdescription,
          category,
        },
      };
      console.log(updateProduct)
      const result = await allBlogsCollection.updateOne(filter, updateProduct);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("blogVista server is runnig");
});

app.listen(PORT, () => {
  console.log(`the blogVista server is runing port is ${PORT}`);
});
