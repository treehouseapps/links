const express = require("express");
const app = express();
const mongoose = require("mongoose");
const session = require("express-session");

require("dotenv").config();

app.set("view engine", "ejs");
app.set("views", __dirname + "/view");
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 200000 },
  }),
);

mongoose
  .connect(process.env.DBCONNECTION)
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log("DB error", err));

const schema = new mongoose.Schema({
  name: String,
  link: String,
  desc: String,
});

const collection = mongoose.model("sites", schema);

app.get("/", async (req, res) => {
  try {
    const result = await collection.find();

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

module.exports = app;
