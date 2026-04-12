const bcrypt = require("bcrypt");
const prisma = require("../db");
const { generateToken } = require("../middleware/auth");

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    const admin = await prisma.admin.findUnique({ where: { username } });

    if (!admin) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, admin.passwordHash);

    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(admin);

    res.json({
      token,
      admin: { id: admin.id, username: admin.username, name: admin.name },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

const getMe = async (req, res) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.admin.id },
      select: { id: true, username: true, name: true, createdAt: true },
    });

    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.json(admin);
  } catch (error) {
    console.error("Error fetching admin:", error);
    res.status(500).json({ error: "Failed to fetch admin info" });
  }
};

const createBooking = async (req, res) => {
  try {
    const { roomId, guestName, guestPhone, guestEmail, checkIn, checkOut, amountPaid } =
      req.body;

    // Validate required fields
    if (!roomId || !guestName || !guestPhone || !checkIn || !checkOut || amountPaid == null) {
      return res.status(400).json({
        error: "Required fields: roomId, guestName, guestPhone, checkIn, checkOut, amountPaid",
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (
      Number.isNaN(checkInDate.getTime()) ||
      Number.isNaN(checkOutDate.getTime())
    ) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    if (checkInDate >= checkOutDate) {
      return res
        .status(400)
        .json({ error: "Check-out must be after check-in" });
    }

    // Verify room exists
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Check for overlapping bookings
    const conflict = await prisma.booking.findFirst({
      where: {
        roomId,
        status: "confirmed",
        checkIn: { lt: checkOutDate },
        checkOut: { gt: checkInDate },
      },
    });

    if (conflict) {
      return res.status(409).json({
        error: "Room is already booked for the selected dates",
        conflictingDates: {
          from: conflict.checkIn.toISOString().split("T")[0],
          to: conflict.checkOut.toISOString().split("T")[0],
        },
      });
    }

    const booking = await prisma.booking.create({
      data: {
        roomId,
        guestName,
        guestPhone,
        guestEmail: guestEmail || null,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        amountPaid,
        status: "confirmed",
      },
      include: { room: true },
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ error: "Failed to create booking" });
  }
};

const listBookings = async (req, res) => {
  try {
    const { roomId, month, status } = req.query;

    const where = {};

    if (roomId) {
      where.roomId = roomId;
    }

    if (status) {
      where.status = status;
    }

    // Always require a month filter for efficiency
    if (month && /^\d{4}-\d{2}$/.test(month)) {
      const [year, mon] = month.split("-").map(Number);
      const startOfMonth = new Date(Date.UTC(year, mon - 1, 1));
      const endOfMonth = new Date(Date.UTC(year, mon, 0, 23, 59, 59, 999));

      where.checkIn = { lte: endOfMonth };
      where.checkOut = { gte: startOfMonth };
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: { room: { select: { id: true, name: true } } },
      orderBy: { checkIn: "asc" },
    });

    res.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
};

const getBooking = async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { room: true },
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({ error: "Failed to fetch booking" });
  }
};

const updateBooking = async (req, res) => {
  try {
    const existing = await prisma.booking.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const { guestName, guestPhone, guestEmail, checkIn, checkOut, amountPaid, status } =
      req.body;

    const updateData = {};

    if (guestName !== undefined) updateData.guestName = guestName;
    if (guestPhone !== undefined) updateData.guestPhone = guestPhone;
    if (guestEmail !== undefined) updateData.guestEmail = guestEmail || null;
    if (amountPaid !== undefined) updateData.amountPaid = amountPaid;
    if (status !== undefined) updateData.status = status;

    // If dates are changing, validate and check for conflicts
    if (checkIn !== undefined || checkOut !== undefined) {
      const newCheckIn = checkIn ? new Date(checkIn) : existing.checkIn;
      const newCheckOut = checkOut ? new Date(checkOut) : existing.checkOut;

      if (newCheckIn >= newCheckOut) {
        return res
          .status(400)
          .json({ error: "Check-out must be after check-in" });
      }

      // Check conflicts excluding the current booking
      const conflict = await prisma.booking.findFirst({
        where: {
          roomId: existing.roomId,
          status: "confirmed",
          id: { not: req.params.id },
          checkIn: { lt: newCheckOut },
          checkOut: { gt: newCheckIn },
        },
      });

      if (conflict) {
        return res.status(409).json({
          error: "Room is already booked for the selected dates",
        });
      }

      updateData.checkIn = newCheckIn;
      updateData.checkOut = newCheckOut;
    }

    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: updateData,
      include: { room: true },
    });

    res.json(booking);
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({ error: "Failed to update booking" });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const existing = await prisma.booking.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Booking not found" });
    }

    await prisma.booking.delete({ where: { id: req.params.id } });

    res.json({ message: "Booking deleted" });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({ error: "Failed to delete booking" });
  }
};

module.exports = {
  login,
  getMe,
  createBooking,
  listBookings,
  getBooking,
  updateBooking,
  deleteBooking,
};
