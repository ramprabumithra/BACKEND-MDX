const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

app.use(express.json());
app.set('port', 3000);

app.use(cors({
    origin: 'https://ramprabumithra.github.io',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

app.use((req, res, next) => {
    console.log(`${req.method} request for ${req.url} at ${new Date().toISOString()}`);
    next();
});

app.get('/', (req, res) => {
    res.send('Select a collection, e.g., /collections/Lessons');
});

app.use('/lesson-images/:imageName', (req, res, next) => {
    const imagePath = path.join(__dirname, 'lesson-images', req.params.imageName);
    fs.access(imagePath, fs.constants.F_OK, (err) => {
        if (err) return res.status(404).send({ msg: 'Image not found.' });
        next();
    });
});

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
    next();
});

let db;
MongoClient.connect('mongodb+srv://ramprabumithra:ramasita@cluster0.fyuon.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', (err, client) => {
    if (err) process.exit(1);
    db = client.db('CourseWork');
});

app.param('collectionName', (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName);
    next();
});

app.patch('/collections/:collectionName/:id', (req, res) => {
    req.collection.updateOne(
        { id: req.params.id },
        { $set: req.body },
        (err, result) => {
            if (err) return res.status(500).send({ msg: 'Error updating resource' });
            res.send(result.modifiedCount === 1 ? { msg: 'Success' } : { msg: 'Not updated' });
        }
    );
});

app.get('/collections/:collectionName', (req, res) => {
    req.collection.find({}).toArray((e, results) => {
        if (e) return res.status(500).send({ msg: 'Error fetching data' });
        res.send(results);
    });
});

app.post('/collections/:collectionName', (req, res) => {
    req.collection.insertOne(req.body, (e, result) => {
        if (e) return res.status(500).send({ msg: 'Error inserting data' });
        res.send(result.ops[0]);
    });
});

app.get('/collections/:collectionName/:id', (req, res) => {
    req.collection.findOne({ id: req.params.id }, (e, result) => {
        if (e) return res.status(500).send({ msg: 'Error fetching data' });
        res.send(result);
    });
});

app.put('/collections/:collectionName/:lessonTitle', (req, res) => {
    req.collection.updateOne(
        { lessonTitle: req.params.lessonTitle },
        { $set: req.body },
        (e, result) => {
            if (e) return res.status(500).send({ msg: 'Error updating data' });
            res.send(result.modifiedCount === 1 ? { msg: 'Success' } : { msg: 'Not updated' });
        }
    );
});

app.post('/placeOrder', async (req, res) => {
    const order = req.body;
    try {
        for (const lesson of order.lessons) {
            const lessonDoc = await db.collection('Lessons').findOne({ lessonTitle: lesson.lessonTitle });
            if (!lessonDoc || lessonDoc.availability < lesson.quantity) {
                return res.status(400).send({ msg: `Insufficient availability for ${lesson.lessonTitle}` });
            }
            await db.collection('Lessons').updateOne(
                { lessonTitle: lesson.lessonTitle },
                { $inc: { availability: -lesson.quantity } }
            );
        }
        await db.collection('Orders').insertOne(order);
        res.status(200).send({ msg: 'Order placed successfully' });
    } catch {
        res.status(500).send({ msg: 'Failed to place order' });
    }
});

app.delete('/collections/:collectionName/:id', (req, res) => {
    req.collection.deleteOne(
        { id: req.params.id },
        (e, result) => {
            if (e) return res.status(500).send({ msg: 'Error deleting data' });
            res.send(result.deletedCount === 1 ? { msg: 'Success' } : { msg: 'Not found' });
        }
    );
});

app.listen(3000, () => console.log('Express.js server running at localhost:3000'));
