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

app.listen(8080, () => {
  console.log("Server running on port 8080");
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
    const {
      roomId,
      userName,
      userEmail,
      checkIn,
      checkOut,
      totalPrice,
    } = req.body;

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

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

    res.status(201).json(booking);
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ error: "Failed to create booking" });
  }
});
