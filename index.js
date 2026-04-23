const express = require("express");
const app = express();
const mongoose = require("mongoose");
const session = require("express-session");

require("dotenv").config();

// ---------- VIEW ----------
app.set("view engine", "ejs");
app.set("views", __dirname + "/view");
app.use(express.urlencoded({ extended: true }));

console.log("🚀 App starting...");

// ---------- SESSION (kept but lightweight) ----------
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 200000 },
  }),
);
console.log("🔌 Connecting to MongoDB...");
// ---------- FAST DB CONNECT (IMPORTANT FIX) ----------
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    console.log("🔌 Creating new DB connection...");
    cached.promise = mongoose.connect(process.env.DBCONNECTION).then((m) => {
      console.log("✅ MongoDB connected");
      return m;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};
// ---------- MODEL ----------
const schema = new mongoose.Schema({
  name: String,
  link: String,
  desc: String,
});

const collection = mongoose.model("sites", schema);

// ---------- ROUTES ----------
app.get("/", async (req, res) => {
  console.log("📥 / route hit");

  await connectDB(); // 🔥 IMPORTANT FIX

  const result = await collection.find().lean();

  console.log("📦 DB query done");

  res.render("index", {
    result,
    session: req.session?.name || null,
  });
});

// ---------- CRUD ----------
app.post("/add", async (req, res) => {
  try {
    if (req.session.name === "treehouse") {
      await collection.insertMany(req.body);
    }
    res.redirect("/");
  } catch {
    res.redirect("/");
  }
});

app.post("/login", (req, res) => {
  req.session.name = req.body.name;
  res.redirect("/");
});

app.post("/update/:id", async (req, res) => {
  try {
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
console.log("📦 Exporting app...");
// ---------- EXPORT ----------
module.exports = app;
