const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const cors = require('cors');
app.use(express.json());
app.set('port', 3000);

app.use(cors({
    origin: 'https://ramprabumithra.github.io', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH','OPTIONS'], 
    allowedHeaders: ['Content-Type', 'Authorization'], 
    credentials: true, 
}));

app.use((req, res, next) => {
    console.log(`${req.method} request for ${req.url} at ${new Date().toISOString()}`);
    next();
});

app.use('/lesson-images', express.static(path.join(__dirname, 'lesson-images')));

app.use('/lesson-images/:imageName', (req, res, next) => {
    const imagePath = path.join(__dirname, 'lesson-images', req.params.imageName);
    fs.access(imagePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).send({ msg: 'Image not found.' });
        }
        next();
    });
});

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,PATCH");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    next();
});

const MongoClient = require('mongodb').MongoClient;
let db;
MongoClient.connect('mongodb+srv://ramprabumithra:ramasita@cluster0.fyuon.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', (err, client) => {
    if (err) {
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1);
    }
    db = client.db('CourseWork');
    console.log('Connected to MongoDB');
});

app.get('/', (req, res, next) => {
    res.send('Select a collection, e.g., /collections/Lessons');
});

app.param('collectionName', (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName);
    return next();
});

app.get('/collections/:collectionName', (req, res, next) => {
    req.collection.find({}).toArray((e, results) => {
        if (e) return next(e);
        res.send(results);
    });
});

app.post('/collections/:collectionName', (req, res, next) => {
    req.collection.insert(req.body, (e, results) => {
        if (e) return next(e);
        res.send(results.ops);
    });
});

const ObjectID = require('mongodb').ObjectID;
app.get('/collections/:collectionName/:id', (req, res, next) => {
    req.collection.findOne({ _id: new ObjectID(req.params.id) }, (e, result) => {
        if (e) return next(e);
        res.send(result);
    });
});

app.put('/collections/:collectionName/:lessonTitle', (req, res, next) => {
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



app.put('/collections/:collectionName/:productId', async (req, res) => {
    const { collectionName, productId } = req.params;
    const { availability, name, price, description } = req.body;  // Assuming you may have other fields to update

    console.log('Received PUT request');
    console.log('Collection:', collectionName);
    console.log('Product ID:', productId);
    console.log('Availability:', availability);
    console.log('Name:', name);
    console.log('Price:', price);
    console.log('Description:', description);

    // You might want to check that other fields are present if necessary
    if (!availability || !name || !price) {
        return res.status(400).json({ msg: 'Availability, name, and price are required.' });
    }

    try {
        const collection = db.collection(collectionName);

        // Find the document based on productId
        const document = await collection.findOne({ productId: productId });
        
        console.log('Found document:', document);

        if (!document) {
            return res.status(404).json({ msg: 'Document not found.' });
        }

        // Update the document (replace the whole document)
        const result = await collection.updateOne(
            { productId: productId },  // Match by productId
            { $set: { availability, name, price, description } }  // Replace the entire document
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ msg: 'Document not found.' });
        }

        res.status(200).json({ msg: 'Document updated successfully.' });
    } catch (error) {
        console.error('Error updating document:', error);
        res.status(500).json({ msg: 'Internal server error.' });
    }
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
    req.collection.deleteOne(
        { _id: ObjectID(req.params.id) }, (e, result) => {
            if (e) return next(e);
            res.send((result.result.n === 1) ? { msg: 'success' } : { msg: 'error' });
        });
});

app.listen(3000, () => {
    console.log('Express.js server running at localhost:3000');
});
