# 🎨 Frontend - Hotel Booking App

Frontend of the Hotel Booking application, built with Next.js for high performance and modern UI/UX.

---

## 🚀 Tech Stack

- Next.js (App Router)
- Tailwind CSS
- Deployed on Vercel

---

## 📂 Project Structure
```text
app/
├── page.tsx
├── rooms/
│ ├── page.tsx
│ └── [id]/page.tsx
├── booking/
│ └── confirmation/
├── about/
├── contact/

components/
├── Navbar.tsx
├── Footer.tsx
├── RoomCard.tsx
├── BookingModal.tsx
```

---

## ✨ Features

- 🏠 Home page
- 🛏️ Rooms listing
- 🔍 Room detail page
- 📅 Multi-step booking modal
- ✅ Booking confirmation page
- 📱 Mobile-first responsive UI
- 📌 Sticky mobile booking CTA

---

## 🔌 API Integration

```http
GET /rooms
GET /rooms/:id
POST /bookings
```

Backend is hosted on Railway and connected to PostgreSQL (Supabase).

---

## ⚠️ Improvements Needed

- Add hamburger menu (mobile navigation)
- Improve UI consistency (remove dark sections)
- Add loading & error states
- Improve state management

---

## 🚀 Future Improvements

- React Query / SWR for data fetching
- SEO optimization
- Performance tuning
- Enhanced UX for booking flow

---

## 🌐 Deployment

Hosted on **Vercel**

---

## 🧑‍💻 Author

Built by **Anurup Bansal**