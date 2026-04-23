const express = require("express");
const app = express();
const mongoose = require("mongoose");
const session = require("express-session");

require("dotenv").config();

// ---------- VIEW + BODY ----------
app.set("view engine", "ejs");
app.set("views", __dirname + "/view");
app.use(express.urlencoded({ extended: true }));

// ---------- SESSION (KEEPING IT) ----------
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 200000 },
  }),
);

// ---------- MONGOOSE CACHE (IMPORTANT FOR VERCEL) ----------
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.DBCONNECTION).then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// ---------- MODEL ----------
const schema = new mongoose.Schema({
  name: String,
  link: String,
  desc: String,
});

const collection = mongoose.model("sites", schema);

// ---------- ROUTES ----------

app.get("/", async (req, res) => {
  try {
    await connectDB(); // 🔥 critical fix for timeout

    const result = await collection.find().lean();

    res.render("index", {
      result,
      session: req.session?.name || null,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Database error");
  }
});

app.post("/add", async (req, res) => {
  try {
    await connectDB();

    if (req.session.name === "treehouse") {
      await collection.insertMany(req.body);
    }
    res.redirect("/");
  } catch {
    res.redirect("/");
  }
});

app.post("/login", (req, res) => {
  try {
    req.session.name = req.body.name;
    res.redirect("/");
  } catch {
    res.redirect("/");
  }
});

app.post("/update/:id", async (req, res) => {
  try {
    await connectDB();

    if (req.session.name === "treehouse") {
      await collection.findByIdAndUpdate(req.params.id, req.body);
    }
    res.redirect("/");
  } catch {
    res.redirect("/");
  }
});

app.get("/delete/:id", async (req, res) => {
  try {
    await connectDB();

    if (req.session.name === "treehouse") {
      await collection.deleteOne({ _id: req.params.id });
    }
    res.redirect("/");
  } catch {
    res.redirect("/");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.get("*", (req, res) => {
  res.render("404");
});

// ---------- EXPORT ----------
module.exports = app;
