require("dotenv").config();

const bcrypt = require("bcryptjs");
const db = require("./config/db");

async function createAdmin() {
    try {
        const name = process.env.ADMIN_NAME;
        const email = process.env.ADMIN_EMAIL;
        const password = process.env.ADMIN_PASSWORD;

        if (!name || !email || !password || password.length < 12) {
            throw new Error(
                "Check ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in your .env file. Password must be at least 12 characters."
            );
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        db.query(
            "SELECT id FROM admin_users WHERE email = ?",
            [email],
            (error, results) => {
                if (error) {
                    console.error("Database error:", error.message);
                    db.end();
                    return;
                }

                if (results.length > 0) {
                    console.log("Admin account already exists!");
                    db.end();
                    return;
                }

                db.query(
                    "INSERT INTO admin_users (name, email, password_hash) VALUES (?, ?, ?)",
                    [name, email, hashedPassword],
                    (insertError) => {
                        if (insertError) {
                            console.error("Admin creation failed:", insertError.message);
                        } else {
                            console.log("Admin account created successfully!");
                            console.log("Admin email:", email);
                        }

                        db.end();
                    }
                );
            }
        );

    } catch (error) {
        console.error(error.message);
        db.end();
    }
}

createAdmin();