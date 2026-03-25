require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

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

app.post("/book", async (req, res) => {
  try {
    const { roomId, userName, userEmail, checkIn, checkOut } = req.body;

    if (!roomId || !userName || !userEmail || !checkIn || !checkOut) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(userEmail)) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (
      Number.isNaN(checkInDate.getTime()) ||
      Number.isNaN(checkOutDate.getTime())
    ) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    checkInDate.setHours(0, 0, 0, 0);
    checkOutDate.setHours(0, 0, 0, 0);

    if (checkInDate >= checkOutDate || checkInDate < today) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const nights = Math.floor(
      (checkOutDate.getTime() - checkInDate.getTime()) / millisecondsPerDay
    );
    const totalPrice = nights * room.pricePerNight;

    const existingBooking = await prisma.booking.findFirst({
      where: {
        roomId,
        status: "confirmed",
        checkIn: {
          lt: checkOutDate,
        },
        checkOut: {
          gt: checkInDate,
        },
      },
    });

    if (existingBooking) {
      return res.status(400).json({ message: "Room not available" });
    }

    const booking = await prisma.booking.create({
      data: {
        roomId,
        userName,
        userEmail,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        totalPrice,
        status: "confirmed",
      },
    });

    res.status(200).json(booking);
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ error: "Failed to create booking" });
  }
});
