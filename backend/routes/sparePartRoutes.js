const verifyAdmin = require("../middleware/authMiddleware");
const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ==========================================
// GET ALL SPARE PARTS
// GET /api/parts
// ==========================================

router.get("/", (req, res) => {
    const sql = "SELECT * FROM spare_parts ORDER BY id DESC";

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
// SEARCH AND FILTER SPARE PARTS
// GET /api/parts/search?name=Brake
// ==========================================

router.get("/search", (req, res) => {
    const { name, category, minPrice, maxPrice } = req.query;

    let sql = "SELECT * FROM spare_parts WHERE 1=1";
    const values = [];

    if (name) {
        sql += " AND name LIKE ?";
        values.push(`%${name}%`);
    }

    if (category) {
        sql += " AND category = ?";
        values.push(category);
    }

    if (minPrice !== undefined) {
        sql += " AND price >= ?";
        values.push(Number(minPrice));
    }

    if (maxPrice !== undefined) {
        sql += " AND price <= ?";
        values.push(Number(maxPrice));
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
// GET SINGLE SPARE PART
// GET /api/parts/1
// ==========================================

router.get("/:id", (req, res) => {
    db.query(
        "SELECT * FROM spare_parts WHERE id = ?",
        [req.params.id],
        (error, results) => {
            if (error) {
                return res.status(500).json({
                    success: false,
                    message: error.message
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Spare part not found."
                });
            }

            res.json({
                success: true,
                data: results[0]
            });
        }
    );
});


// ==========================================
// ADD SPARE PART
// POST /api/parts
// ==========================================
router.post("/", verifyAdmin, (req, res) => {
    const { name, category, price, stock, image, description } = req.body;

    if (!name || price === undefined || Number(price) <= 0) {
        return res.status(400).json({
            success: false,
            message: "Valid name and price are required."
        });
    }

    const sql = `
        INSERT INTO spare_parts
        (name, category, price, stock, image, description)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [
        name,
        category || null,
        Number(price),
        stock ?? 0,
        image || null,
        description || null
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
            message: "Spare part added successfully!",
            partId: result.insertId
        });
    });
});


// ==========================================
// UPDATE SPARE PART
// PUT /api/parts/1
// ==========================================

router.put("/:id", verifyAdmin, (req, res) => {
    const allowedFields = [
        "name",
        "category",
        "price",
        "stock",
        "image",
        "description"
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
            message: "Provide at least one field to update."
        });
    }

    const sql = `
        UPDATE spare_parts
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
                message: "Spare part not found."
            });
        }

        res.json({
            success: true,
            message: "Spare part updated successfully!"
        });
    });
});


// ==========================================
// DELETE SPARE PART
// DELETE /api/parts/1
// ==========================================

router.delete("/:id", verifyAdmin, (req, res) => {
    db.query(
        "DELETE FROM spare_parts WHERE id = ?",
        [req.params.id],
        (error, result) => {
            if (error) {
                return res.status(500).json({
                    success: false,
                    message: error.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Spare part not found."
                });
            }

            res.json({
                success: true,
                message: "Spare part deleted successfully!"
            });
        }
    );
});

module.exports = router;