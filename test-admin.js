require("dotenv").config();

const sql = require("mssql");
const bcrypt = require("bcryptjs");

async function testAdmin() {
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

        const result = await pool
            .request()
            .input("username", sql.NVarChar(50), "admin")
            .query(`
                SELECT username, password_hash
                FROM admins
                WHERE username = @username
            `);

        if (result.recordset.length === 0) {
            console.log("Admin account NOT found.");
            return;
        }

        const admin = result.recordset[0];

        console.log("Admin account found.");
        console.log("Username:", admin.username);
        console.log("Password hash exists:", !!admin.password_hash);
        console.log(
            "Password length:",
            admin.password_hash ? admin.password_hash.length : 0
        );

        const passwordCorrect = await bcrypt.compare(
            "Admin@123",
            admin.password_hash
        );

        console.log("Password matches:", passwordCorrect);

    } catch (error) {
        console.error("Test error:", error);
    } finally {
        await sql.close();
    }
}

testAdmin();