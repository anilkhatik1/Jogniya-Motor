const verifyAdmin = require("../middleware/authMiddleware");
const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ==========================================
// GET ALL BIKES
// URL: GET /api/bikes
// ==========================================

router.get("/", (req, res) => {
    const sql = "SELECT * FROM bikes ORDER BY id DESC";

    db.query(sql, (error, results) => {
        if (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }

        res.json({
            success: true,
            count: results.length,
            data: results
        });
    });
});


// ==========================================
// SEARCH AND FILTER BIKES
// URL: GET /api/bikes/search?name=Splendor
// ==========================================

router.get("/search", (req, res) => {
    const { name, minPrice, maxPrice, category } = req.query;

    let sql = "SELECT * FROM bikes WHERE 1=1";
    const values = [];

    if (name) {
        sql += " AND name LIKE ?";
        values.push(`%${name}%`);
    }

    if (minPrice !== undefined) {
        sql += " AND price >= ?";
        values.push(Number(minPrice));
    }

    if (maxPrice !== undefined) {
        sql += " AND price <= ?";
        values.push(Number(maxPrice));
    }

    if (category) {
        sql += " AND category = ?";
        values.push(category);
    }

    db.query(sql, values, (error, results) => {
        if (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }

        res.json({
            success: true,
            count: results.length,
            data: results
        });
    });
});


// ==========================================
// GET SINGLE BIKE
// URL: GET /api/bikes/1
// ==========================================

router.get("/:id", (req, res) => {
    const sql = "SELECT * FROM bikes WHERE id = ?";

    db.query(sql, [req.params.id], (error, results) => {
        if (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Bike not found."
            });
        }

        res.json({
            success: true,
            data: results[0]
        });
    });
});


// ==========================================
// ADD NEW BIKE
// URL: POST /api/bikes
// ==========================================

router.post("/", verifyAdmin, (req, res) =>  {
    const {
        name,
        brand,
        category,
        price,
        model_year,
        kilometers,
        description,
        image,
        stock,
        status
    } = req.body;

    if (!name || price === undefined || Number(price) <= 0) {
        return res.status(400).json({
            success: false,
            message: "Valid bike name and price are required."
        });
    }

    const sql = `
        INSERT INTO bikes
        (
            name,
            brand,
            category,
            price,
            model_year,
            kilometers,
            description,
            image,
            stock,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        name,
        brand || "Hero",
        category || "new",
        Number(price),
        model_year || null,
        kilometers ?? 0,
        description || null,
        image || null,
        stock ?? 1,
        status || "available"
    ];

    db.query(sql, values, (error, result) => {
        if (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }

        res.status(201).json({
            success: true,
            message: "Bike added successfully!",
            bikeId: result.insertId
        });
    });
});


// ==========================================
// UPDATE BIKE
// URL: PUT /api/bikes/1
// ==========================================

router.put("/:id", verifyAdmin, (req, res) => {
    const allowedFields = [
        "name",
        "brand",
        "category",
        "price",
        "model_year",
        "kilometers",
        "description",
        "image",
        "stock",
        "status"
    ];

    const fields = [];
    const values = [];

    allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
            fields.push(`${field} = ?`);
            values.push(req.body[field]);
        }
    });

    if (fields.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Please provide at least one field to update."
        });
    }

    const sql = `
        UPDATE bikes
        SET ${fields.join(", ")}
        WHERE id = ?
    `;

    values.push(req.params.id);

    db.query(sql, values, (error, result) => {
        if (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Bike not found."
            });
        }

        res.json({
            success: true,
            message: "Bike updated successfully!"
        });
    });
});


// ==========================================
// DELETE BIKE
// URL: DELETE /api/bikes/1
// ==========================================

router.delete("/:id", verifyAdmin, (req, res) => {
    const sql = "DELETE FROM bikes WHERE id = ?";

    db.query(sql, [req.params.id], (error, result) => {
        if (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Bike not found."
            });
        }

        res.json({
            success: true,
            message: "Bike deleted successfully!"
        });
    });
});


module.exports = router;