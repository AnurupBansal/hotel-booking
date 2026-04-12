const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
const adminController = require("../controllers/adminController");

router.post("/login", adminController.login);
router.get("/me", authMiddleware, adminController.getMe);
router.post("/bookings", authMiddleware, adminController.createBooking);
router.get("/bookings", authMiddleware, adminController.listBookings);
router.get("/bookings/:id", authMiddleware, adminController.getBooking);
router.put("/bookings/:id", authMiddleware, adminController.updateBooking);
router.delete("/bookings/:id", authMiddleware, adminController.deleteBooking);

module.exports = router;
