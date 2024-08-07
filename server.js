const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 4000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/moneyTracker")
    .then(() => {
        console.log("Database connected successfully");
    })
    .catch((error) => {
        console.error("Error connecting to database:", error);
    });

const moneySchema = new mongoose.Schema({
    category: {
        type: String,
        enum: ['saree', 'kurti','Dress','Shirt','Pant','Innerwear'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    mode: {
        type: String,
        enum: ['cash','upi','cre'],
        required: true
    },
    date: {
        type: Date,
        required: true
    }
});
//collection created 
const Money = mongoose.model('Money', moneySchema);

app.post('/submit', async (req, res) => {
    try {
        const newData = new Money({
            category: req.body.category,
            amount: req.body.amount,
            mode: req.body.mode,
            date: req.body.date,
        });

        const result=await newData.save();
        res.redirect('/');
        // res.status(201).send("Data inserted successfully");
    } catch (error) {
        console.error("Error storing data:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// app.get('/submit',(req,res)=>{
//     database.collection('Money').find({}).toArray((err,result)=>{
//         if (err) throw err
//             res.send(result)
//     })
// })

app.get('/data', async (req, res) => {
    try {
        const data = await Money.find({});
        res.json(data);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.delete('/delete/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const deletedData = await Money.findByIdAndDelete(id);
        if (!deletedData) {
            return res.status(404).json({ message: "Data not found" });
        }
        res.json({ message: "Data deleted successfully" });
    } catch (error) {
        console.error("Error deleting data:", error);
        res.status(500).send("Internal Server Error");
    }
});


const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Close MongoDB connection when the application exits
process.on('SIGINT', () => {
    mongoose.connection.close(() => {
        console.log('MongoDB connection closed');
        server.close();
    });
});


