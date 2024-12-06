const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

app.use(express.json());
app.set('port', 3000);

app.use((req, res, next) => {
    console.log(`${req.method} request for ${req.url} at ${new Date().toISOString()}`);
    next();
});

app.get('/', (req, res, next) => {
    res.send('Select a collection, e.g., /collections/Lessons');
});

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    next();
});

let db;
MongoClient.connect('mongodb+srv://ramprabumithra:ramasita@cluster0.fyuon.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', (err, client) => {
    if (err) {
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1);
    }
    db = client.db('CourseWork');
    console.log('Connected to MongoDB');
});

app.param('collectionName', (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName);
    next();
});

app.get('/collections/:collectionName', (req, res, next) => {
    if (!req.collection) {
        return res.status(500).send({ msg: 'Collection not found.' });
    }
    req.collection.find({}).toArray((e, results) => {
        if (e) return next(e);
        res.send(results);
    });
});

app.post('/collections/:collectionName', (req, res, next) => {
    if (!req.collection) {
        return res.status(500).send({ msg: 'Collection not found.' });
    }
    req.collection.insert(req.body, (e, results) => {
        if (e) return next(e);
        res.send(results.ops);
    });
});

app.get('/collections/:collectionName/:id', (req, res, next) => {
    if (!req.collection) {
        return res.status(500).send({ msg: 'Collection not found.' });
    }
    req.collection.findOne({ _id: new ObjectID(req.params.id) }, (e, result) => {
        if (e) return next(e);
        res.send(result);
    });
});

app.put('/collections/:collectionName/:lessonTitle', (req, res, next) => {
    if (!req.collection) {
        return res.status(500).send({ msg: 'Collection not found.' });
    }
    req.collection.findOne({ lessonTitle: req.params.lessonTitle }, (err, lesson) => {
        if (err) return next(err);
        if (!lesson) {
            return res.status(404).send({ msg: 'Lesson not found' });
        }
        req.collection.update(
            { lessonTitle: req.params.lessonTitle },
            { $set: req.body },
            { safe: true, multi: false },
            (e, result) => {
                if (e) return next(e);
                res.send((result.result.n === 1) ? { msg: 'success' } : { msg: 'error' });
            }
        );
    });
});

app.post('/placeOrder', async (req, res) => {
    const order = req.body;
    const lessons = order.lessons;
    try {
        for (const lesson of lessons) {
            const Doc = await db.collection('Lessons').findOne({ lessonTitle: lesson.lessonTitle });
            if (!Doc) {
                return res.status(404).json({ msg: `Lesson ${lesson.lessonTitle} not found.` });
            }
            if (Doc.availability < lesson.quantity) {
                return res.status(400).json({ msg: `Not enough availability for ${lesson.lessonTitle}. Only ${Doc.availability} spots available.` });
            }
            await db.collection('Lessons').updateOne(
                { lessonTitle: lesson.lessonTitle },
                { $inc: { availability: -lesson.quantity } }
            );
        }
        await db.collection('Orders').insertOne(order);
        res.status(200).json({ msg: 'Order placed successfully' });
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ msg: 'Failed to place order' });
    }
});

app.delete('/collections/:collectionName/:id', (req, res, next) => {
    if (!req.collection) {
        return res.status(500).send({ msg: 'Collection not found.' });
    }
    req.collection.deleteOne(
        { _id: ObjectID(req.params.id) }, (e, result) => {
            if (e) return next(e);
            res.send((result.result.n === 1) ? { msg: 'success' } : { msg: 'error' });
        });
});

app.listen(3000, () => {
    console.log('Express.js server running at localhost:3000');
});
