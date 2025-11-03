const { MongoClient, ObjectId } = require("mongodb");
const express = require("express");

const dbConnection = "mongodb://127.0.0.1:27017/my-test-project";
const dbName = "my-test-project";
const port = 3000;

//
// Starts the express server.
//
async function startServer(config, db) {
    return new Promise(resolve => {
        const app = express();
        app.use(express.json()); // middleware?? parse json request

        app.get("/posts/:postId?", async (req, res) => {
            const postId = (req.params.postId && new ObjectId(req.params.postId)) || undefined;
            if (postId) {
                const post = await db.collection("posts").findOne({ _id: postId });
                if (!post) {
                    res.sendStatus(404);
                }
                else {
                    res.json(post);
                }
            }
            else {
                const posts = await db.collection("posts").find().toArray();
                res.json(posts);
            }
        });

        //
        // Validates a user id (just a number in this simple example).
        //
        function validateUserId(value, res) {
            if (typeof value !== "number" || value <= 0) {
                res.sendStatus(400);
                return false;
            }
            return true;
        }

        function validateString(value, res) {
            if (typeof value !== "string" || value.length === 0) {
                res.sendStatus(400);
                return false;
            }
            return true;
        }

        app.post("/posts", async (req, res) => {
            const { userId, title, body } = req.body;

            if (!validateUserId(userId, res) || !validateString(title, res) || !validateString(body, res)) {  // Some very simple validation.
                return;
            }

            const result = await db.collection("posts").insertOne({ userId, title, body });

            res.status(201).json({
                _id: result.insertedId.toString(),
            })
        });

        const server = app.listen(config.port, () => {
            resolve(server);
        });
    });
}

async function main(config) {

    const client = new MongoClient(config.dbConnection);
    await client.connect();

    const db = client.db(config.dbName);

    return await startServer(config, db);
}

if (require.main === module) {
    //
    // A normal run.
    //
    main({ dbConnection, dbName, port })
        .catch(err => {
            console.error(`Something went wrong:`);
            console.error(err.stack);
        });
}
else {
    //
    // Invoked from tests.
    //
    module.exports = {
        main,
    }
}

