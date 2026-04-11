require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const prisma = require("./db");
const { authMiddleware, generateToken } = require("./middleware/auth");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// ─── Public: Room endpoints ─────────────────────────────────────────────────

app.post("/rooms", async (req, res) => {
  try {
    const room = await prisma.room.create({
      data: req.body,
    });
    res.status(201).json(room);
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ error: "Failed to create room" });
  }
});

app.get("/rooms", async (req, res) => {
  try {
    const rooms = await prisma.room.findMany();
    res.json(rooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
});

app.get("/rooms/:id", async (req, res) => {
  try {
    const room = await prisma.room.findUnique({
      where: { id: req.params.id },
    });

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.json(room);
  } catch (error) {
    console.error("Error fetching room:", error);
    res.status(500).json({ error: "Failed to fetch room" });
  }
});

// ─── Public: Availability endpoint ──────────────────────────────────────────

app.get("/rooms/:id/availability", async (req, res) => {
  try {
    const { id } = req.params;
    const { month } = req.query; // expected format: "2026-04"

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res
        .status(400)
        .json({ error: "Invalid month format. Use YYYY-MM" });
    }

    const room = await prisma.room.findUnique({ where: { id } });
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Calculate month boundaries
    const [year, mon] = month.split("-").map(Number);
    const startOfMonth = new Date(Date.UTC(year, mon - 1, 1));
    const endOfMonth = new Date(Date.UTC(year, mon, 0, 23, 59, 59, 999));

    // Fetch only bookings that overlap with the requested month
    // Uses the composite index on (checkIn, checkOut)
    const bookings = await prisma.booking.findMany({
      where: {
        roomId: id,
        status: "confirmed",
        checkIn: { lte: endOfMonth },
        checkOut: { gte: startOfMonth },
      },
      select: {
        checkIn: true,
        checkOut: true,
      },
      orderBy: { checkIn: "asc" },
    });

    // Return only dates — no guest information exposed
    const booked = bookings.map((b) => ({
      from: b.checkIn.toISOString().split("T")[0],
      to: b.checkOut.toISOString().split("T")[0],
    }));

    res.json({ booked });
  } catch (error) {
    console.error("Error fetching availability:", error);
    res.status(500).json({ error: "Failed to fetch availability" });
  }
});

// ─── Admin: Authentication ──────────────────────────────────────────────────

app.post("/admin/login", async (req, res) => {
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
});

app.get("/admin/me", authMiddleware, async (req, res) => {
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
});

// ─── Admin: Booking CRUD ────────────────────────────────────────────────────

// Create booking (admin only)
app.post("/admin/bookings", authMiddleware, async (req, res) => {
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
});

// List bookings with filters (admin only)
app.get("/admin/bookings", authMiddleware, async (req, res) => {
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
});

// Get single booking (admin only)
app.get("/admin/bookings/:id", authMiddleware, async (req, res) => {
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
});

// Update booking (admin only)
app.put("/admin/bookings/:id", authMiddleware, async (req, res) => {
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
});

// Delete booking (admin only)
app.delete("/admin/bookings/:id", authMiddleware, async (req, res) => {
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
});
