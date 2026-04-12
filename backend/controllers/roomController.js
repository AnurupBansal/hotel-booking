const prisma = require("../db");

const createRoom = async (req, res) => {
  try {
    const room = await prisma.room.create({
      data: req.body,
    });
    res.status(201).json(room);
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ error: "Failed to create room" });
  }
};

const listRooms = async (req, res) => {
  try {
    const rooms = await prisma.room.findMany();
    res.json(rooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
};

const getRoom = async (req, res) => {
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
};

const getRoomAvailability = async (req, res) => {
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
};

module.exports = {
  createRoom,
  listRooms,
  getRoom,
  getRoomAvailability,
};
