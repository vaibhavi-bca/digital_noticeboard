const express = require("express");
const path = require("path");
const session = require("express-session");
const sql = require("mssql");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false,
            maxAge: 1000 * 60 * 60
        }
    })
);

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// Azure SQL configuration
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    port: Number(process.env.DB_PORT) || 1433,

    options: {
        encrypt: true,
        trustServerCertificate: false
    }
};

// Connect to database
let pool;

async function connectDatabase() {
    try {
        pool = await sql.connect(dbConfig);
        console.log("Connected to Azure SQL Database");
    } catch (error) {
        console.error("Database connection failed:");
        console.error(error.message);
    }
}

connectDatabase();

// Make pool available to routes
app.set("db", () => pool);

// Routes
const authRoutes = require("./routes/auth");
const noticeRoutes = require("./routes/notices");

app.use("/api/auth", authRoutes);
app.use("/api/notices", noticeRoutes);

// Default route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});