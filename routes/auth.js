const express = require("express");
const bcrypt = require("bcryptjs");

const router = express.Router();

// Admin login
router.post("/login", async (req, res) => {
    try {
        const db = req.app.get("db")();

        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required"
            });
        }

        const result = await db
            .request()
            .input("username", username)
            .query(`
                SELECT id, username, password_hash, name, role
                FROM admins
                WHERE username = @username
            `);

        if (result.recordset.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password"
            });
        }

        const admin = result.recordset[0];

        const validPassword = await bcrypt.compare(
            password,
            admin.password_hash
        );

        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password"
            });
        }

        req.session.admin = {
            id: admin.id,
            username: admin.username,
            name: admin.name,
            role: admin.role
        };

        res.json({
            success: true,
            message: "Login successful",
            admin: req.session.admin
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});


// Check current session
router.get("/me", (req, res) => {

    if (!req.session.admin) {
        return res.status(401).json({
            success: false,
            message: "Not logged in"
        });
    }

    res.json({
        success: true,
        admin: req.session.admin
    });
});


// Logout
router.post("/logout", (req, res) => {

    req.session.destroy((error) => {

        if (error) {
            return res.status(500).json({
                success: false,
                message: "Logout failed"
            });
        }

        res.json({
            success: true,
            message: "Logged out successfully"
        });
    });
});


module.exports = router;