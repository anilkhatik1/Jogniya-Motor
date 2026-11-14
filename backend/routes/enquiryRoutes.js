// =============================================
// JOGNIYA MOTORS - CUSTOMER ENQUIRY ROUTES
// =============================================

const express = require("express");
const router = express.Router();

const db = require("../config/db");
const verifyAdmin = require("../middleware/authMiddleware");


// =============================================
// PUBLIC: SUBMIT CUSTOMER ENQUIRY
// POST /api/enquiries
// =============================================

router.post("/", (req, res) => {

    const {
        customer_name,
        phone,
        enquiry_type,
        message
    } = req.body;

    if (!customer_name || !phone) {
        return res.status(400).json({
            success: false,
            message: "Customer name and phone number are required."
        });
    }

    const name = String(customer_name).trim();
    const phoneValue = String(phone).trim();
    const type = String(enquiry_type || "General Enquiry").trim();
    const customerMessage = String(message || "").trim();

    if (name.length < 2 || name.length > 100) {
        return res.status(400).json({
            success: false,
            message: "Please enter a valid customer name."
        });
    }

    if (!/^[0-9+\-\s]{7,15}$/.test(phoneValue)) {
        return res.status(400).json({
            success: false,
            message: "Please enter a valid phone number."
        });
    }

    const sql = `
        INSERT INTO enquiries
        (customer_name, phone, enquiry_type, message)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [name, phoneValue, type, customerMessage],
        (error, result) => {

            if (error) {
                console.error("Enquiry Insert Error:", error);

                return res.status(500).json({
                    success: false,
                    message: "Unable to submit enquiry."
                });
            }

            return res.status(201).json({
                success: true,
                message: "Your enquiry has been submitted successfully!",
                enquiryId: result.insertId
            });

        }
    );

});


// =============================================
// ADMIN: GET ALL ENQUIRIES
// GET /api/enquiries
// =============================================

router.get("/", verifyAdmin, (req, res) => {

    const sql = `
        SELECT *
        FROM enquiries
        ORDER BY created_at DESC
    `;

    db.query(sql, (error, results) => {

        if (error) {
            console.error("Enquiry Fetch Error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to fetch enquiries."
            });
        }

        res.json({
            success: true,
            count: results.length,
            data: results
        });

    });

});


// =============================================
// ADMIN: GET SINGLE ENQUIRY
// GET /api/enquiries/:id
// =============================================

router.get("/:id", verifyAdmin, (req, res) => {

    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid enquiry ID."
        });
    }

    db.query(
        "SELECT * FROM enquiries WHERE id = ?",
        [id],
        (error, results) => {

            if (error) {
                console.error("Single Enquiry Error:", error);

                return res.status(500).json({
                    success: false,
                    message: "Unable to fetch enquiry."
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Enquiry not found."
                });
            }

            res.json({
                success: true,
                data: results[0]
            });

        }
    );

});


// =============================================
// ADMIN: UPDATE ENQUIRY STATUS
// PATCH /api/enquiries/:id/status
// =============================================

router.patch("/:id/status", verifyAdmin, (req, res) => {

    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
        "new",
        "contacted",
        "completed"
    ];

    if (!/^\d+$/.test(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid enquiry ID."
        });
    }

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid enquiry status."
        });
    }

    const sql = `
        UPDATE enquiries
        SET status = ?
        WHERE id = ?
    `;

    db.query(sql, [status, id], (error, result) => {

        if (error) {
            console.error("Status Update Error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to update enquiry status."
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Enquiry not found."
            });
        }

        res.json({
            success: true,
            message: "Enquiry status updated successfully."
        });

    });

});


// =============================================
// ADMIN: DELETE ENQUIRY
// DELETE /api/enquiries/:id
// =============================================

router.delete("/:id", verifyAdmin, (req, res) => {

    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid enquiry ID."
        });
    }

    db.query(
        "DELETE FROM enquiries WHERE id = ?",
        [id],
        (error, result) => {

            if (error) {
                console.error("Enquiry Delete Error:", error);

                return res.status(500).json({
                    success: false,
                    message: "Unable to delete enquiry."
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Enquiry not found."
                });
            }

            res.json({
                success: true,
                message: "Customer enquiry deleted successfully."
            });

        }
    );

});


module.exports = router;