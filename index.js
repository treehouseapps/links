const express = require('express')
const app = express()
const multer = require("multer");
const path = require("path");
const mongoose = require('mongoose')

require('dotenv').config()
app.set('view engine', 'ejs')
app.set('views', __dirname + '/view')
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"));
app.use('/uploads', express.static('uploads'));


const storage = multer.diskStorage({
    destination: "./uploads/",
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });
const schema = new mongoose.Schema({
    name: {
        type: String
    },
    link: {
        type: String
    },
    desc: {
        type: String
    },
    image: {
        type: String
    }
})
const collection = new mongoose.model('sites', schema)

app.get('/', async (req, res) => {
    const result = await collection.find()
    res.render('index', { result })
})
app.post('/add', upload.single("image"), async (req, res) => {
    const data = {
        ...req.body,
        image: req.file ? req.file.filename : null
    }
    await collection.insertMany(data)
    res.redirect('/')
})
app.get('/delete/:id', async (req, res) => {
    await collection.deleteOne({ _id: req.params.id })
    res.redirect('/')
})
app.get('*', (req, res) => {
    res.render('404')
})
mongoose.connect(process.env.DBCONNECTION)
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log('Server Running in port ' + process.env.PORT)
        })
    })
    .catch(() => { console.log('Error connection to database') })


