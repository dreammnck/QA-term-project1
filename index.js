const express = require("express");
const { v4: uuidv4 } = require("uuid");
const mysql = require("mysql2/promise");
const YAML = require("yamljs");
const swaggerUi = require("swagger-ui-express");  
const port = 3000;

//
// Starts the express server.
//
const swaggerDocument = YAML.load("./openapi.yaml");

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "rootpassword",
    database: process.env.DB_NAME || "myappdb",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

async function startServer(config) {
    return new Promise((resolve) => {
        const app = express();
        app.use(express.json()); // parse JSON requests

        app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

        //
        // GET /posts and /posts/:postId
        //
        app.get("/posts/:postId?", async (req, res) => {
            const { postId } = req.params;
            try {
                if (postId) {
                    const [rows] = await pool.query("SELECT * FROM posts WHERE id = ?", [postId]);
                    if (rows.length === 0) return res.status(404).json({ error: "Post not found" });
                    res.json(rows[0]);
                } else {
                    const [rows] = await pool.query("SELECT * FROM posts ORDER BY title");
                    res.json(rows);
                }
            } catch (err) {
                console.error("Fetch error:", err);
                res.status(500).json({ error: "Database query failed" });
            }
        });

        //
        // Simple validation helpers
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

        //
        // POST /posts
        //
        app.post("/posts", async (req, res) => {
            const { userId, title, body } = req.body;

            if (!validateUserId(userId, res) || !validateString(title, res) || !validateString(body, res)) {
                return;
            }

            const id = uuidv4();

            try {
                await pool.execute(
                    "INSERT INTO posts (id, user_id, title, body) VALUES (?, ?, ?, ?)",
                    [id, userId, title, body || null]
                );
                res.status(201).json({ id, userId, title, body });
            } catch (err) {
                console.error("Insert error:", err);
                res.status(500).json({ error: "Database insert failed" });
            }
        });

        const server = app.listen(config.port, () => {
            console.log(`🚀 Server running on port ${config.port}`);
            resolve(server);
        });
    });
}

//
// Main function – waits for DB to be ready, then starts the server.
//
async function main(config) {
    console.log("⏳ Checking MySQL connection...");

    let connected = false;
    while (!connected) {
        try {
            await pool.query("SELECT 1");
            connected = true;
            console.log("MySQL is ready!");
        } catch (err) {
            console.log("MySQL not ready yet, retrying in 3s...");
            await new Promise((r) => setTimeout(r, 3000));
        }
    }

    return await startServer(config);
}

//
// Run if executed directly
//
if (require.main === module) {
    main({ port })
        .then(() => console.log("App started successfully"))
        .catch((err) => {
            console.error("Something went wrong:");
            console.error(err.stack);
            process.exit(1);
        });
} else {
    // For testing
    module.exports = { main };
}
