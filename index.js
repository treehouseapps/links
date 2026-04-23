const express = require('express')
const app = express()
const mongoose = require('mongoose')
const session = require("express-session");

require('dotenv').config()
app.set('view engine', 'ejs')
app.set('views', __dirname + '/view')
app.use(express.urlencoded({ extended: true }))

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        cookie: { maxAge: 200000 },
        resave: false,
        saveUninitialized: false,
    })
);
const schema = new mongoose.Schema({
    name: {
        type: String
    },
    link: {
        type: String
    },
    desc: {
        type: String
    }
})
const collection = new mongoose.model('sites', schema)

app.get('/', async (req, res) => {
    const result = await collection.find()
    if (req.session) {
        res.render('index', { result, session: req.session.name })
    }
    else {
        res.render('index', { result })
    }
})
app.post('/add', async (req, res) => {
    try {
        if (req.session.name == 'treehouse') {
            await collection.insertMany(req.body);
            res.redirect('/');
        }
        else {
            res.redirect('/');
        }
    }
    catch {
        res.redirect('/')
    }
})
app.post('/login', (req, res) => {
    try {
        req.session.name = req.body.name
        res.redirect('/')
    }
    catch {
        res.redirect('/')
    }
})
app.post('/update/:id', async (req, res) => {
    try {
        if (req.session.name == 'treehouse') {
            let id = req.params.id;
            let updatedData = req.body
            await collection.findByIdAndUpdate(id, updatedData, { new: true });
            res.redirect('/')
        }
        else {
            res.redirect('/')
        }
    }
    catch {
        res.redirect('/');
    }
})
app.get('/delete/:id', async (req, res) => {
    try {
        if (req.session.name == 'treehouse') {
            await collection.deleteOne({ _id: req.params.id })
            res.redirect('/');
        }
        else {
            res.redirect('/');
        }
    }
    catch {
        res.redirect('/')
    }
})
app.get('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/')
})
app.get('*', (req, res) => {
    res.render('404')
})
mongoose.connect(process.env.DBCONNECTION)
    .then(() => {
        // app.listen(process.env.PORT, () => {
        //     console.log('Server Running in port ' + process.env.PORT)
        // })
        module.exports = app;
    })
    .catch(() => { console.log('Error connection to database') })


