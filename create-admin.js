require("dotenv").config();

const sql = require("mssql");
const bcrypt = require("bcryptjs");

async function createAdmin() {
    const username = "admin";
    const password = "Admin@123";
    const name = "Administrator";
    const role = "admin";

    const config = {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        server: process.env.DB_SERVER,
        database: process.env.DB_DATABASE,
        port: Number(process.env.DB_PORT || 1433),
        options: {
            encrypt: true,
            trustServerCertificate: false
        }
    };

    try {
        const pool = await sql.connect(config);

        const passwordHash = await bcrypt.hash(password, 12);

        await pool
            .request()
            .input("username", sql.NVarChar(50), username)
            .input("password_hash", sql.NVarChar(255), passwordHash)
            .input("name", sql.NVarChar(100), name)
            .input("role", sql.NVarChar(30), role)
            .query(`
                INSERT INTO admins
                (username, password_hash, name, role)
                VALUES
                (@username, @password_hash, @name, @role)
            `);

        console.log("Admin created successfully!");
        console.log("Username:", username);
        console.log("Password:", password);

    } catch (error) {
        console.error("Error creating admin:", error);
    } finally {
        await sql.close();
    }
}

createAdmin();