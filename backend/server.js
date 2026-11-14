require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const db = require("./config/db");

// Import routes
const bikeRoutes = require("./routes/bikeRoutes");
const sparePartRoutes = require("./routes/sparePartRoutes");
const enquiryRoutes = require("./routes/enquiryRoutes");
const authRoutes = require("./routes/authRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();

// Middleware
app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

// Serve uploaded images
app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);

// API routes
app.use("/api/bikes", bikeRoutes);

app.use("/api/parts", sparePartRoutes);

app.use("/api/enquiries", enquiryRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/upload", uploadRoutes);

// Home route
app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "Welcome to Jogniya Motors Backend!"
    });

});

// Database test
app.get("/api/test-db", (req, res) => {

    db.query("SELECT 1 AS result", (error, results) => {

        if (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }

        res.json({
            success: true,
            message: "MySQL Database Connected Successfully!",
            data: results
        });

    });

});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(
        `Jogniya Motors Backend running on port ${PORT}`
    );

});