const express = require('express')
const app = express()
require('dotenv').config()
app.set('view engine', 'ejs')
app.set('views', __dirname + '/view')
app.use(express.urlencoded({ extended: true }))

const mongoose = require('mongoose')

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
    res.render('index', { result })
})
app.post('/add', async (req, res) => {
    await collection.insertMany(req.body)
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


