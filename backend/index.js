require("dotenv").config();

const express = require("express");
const cors = require("cors");
const roomRoutes = require("./routes/rooms");
const adminRoutes = require("./routes/admin");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

app.use("/rooms", roomRoutes);
app.use("/admin", adminRoutes);

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
