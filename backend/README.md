# ⚙️ Backend - Hotel Booking App

Backend service handling room data, bookings, and business logic for the Hotel Booking platform.

---

## 🚀 Tech Stack

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL (Supabase)
- Hosted on Railway

---

## 📂 Project Structure

```text
src/
├── controllers/
├── routes/
├── prisma/
├── services/
└── server.ts
```


---

## ✨ Features

- 📄 Fetch all rooms
- 🔍 Fetch room by ID
- 📅 Create booking
- ✅ Booking validation (date & pricing logic)

---

## 🔌 API Endpoints

```http
GET /rooms
GET /rooms/:id
POST /bookings
```

---

## 🧠 Database

- PostgreSQL (via Supabase)
- Managed cloud database
- Persistent storage
- Scalable and production-ready

---

## ⚠️ Current Gaps

- No authentication system
- No rate limiting
- Limited logging/monitoring

---

## 🔄 Upcoming Improvements

- Add authentication (JWT / OAuth)
- Add validation layer (Zod)
- Logging (Winston / Pino)
- Rate limiting & security middleware
- API documentation (Swagger)

---

## 🚀 Deployment

Hosted on **Railway**

---

## 🧑‍💻 Author

Built by **Anurup Bansal**