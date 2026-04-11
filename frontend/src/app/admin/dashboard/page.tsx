"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAdminAuth } from "@/context/AdminAuth";
import {
  adminGetBookings,
  getRooms,
  type Booking,
  type Room,
} from "@/services/api";

function toMonthString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function BookingCard({ booking }: { booking: Booking }) {
  return (
    <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <p className="font-medium text-gray-900">{booking.guestName}</p>
        <p className="text-sm text-gray-500">
          {booking.room?.name} · {booking.guestPhone}
        </p>
      </div>
      <div className="text-sm text-gray-600 sm:text-right">
        <p>
          {formatDate(booking.checkIn)} — {formatDate(booking.checkOut)}
        </p>
        <p className="font-medium text-gray-900">₹{booking.amountPaid}</p>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { admin, token } = useAdminAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    async function load() {
      try {
        const month = toMonthString(new Date());
        const [b, r] = await Promise.all([
          adminGetBookings(token!, { month }),
          getRooms(),
        ]);
        setBookings(b);
        setRooms(r);
      } catch {
        // silently fail for dashboard
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [token]);

  const todayStr = new Date().toISOString().split("T")[0];
  const todayBookings = bookings.filter(
    (b) =>
      b.status === "confirmed" &&
      b.checkIn.split("T")[0] <= todayStr &&
      b.checkOut.split("T")[0] > todayStr,
  );
  const upcomingBookings = bookings
    .filter(
      (b) => b.status === "confirmed" && b.checkIn.split("T")[0] > todayStr,
    )
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
          Welcome back, {admin?.name}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Here&apos;s what&apos;s happening this month.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading dashboard...</p>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
              <p className="text-xs text-gray-600 sm:text-sm">Rooms</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900 sm:text-3xl">
                {rooms.length}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
              <p className="text-xs text-gray-600 sm:text-sm">Occupied</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900 sm:text-3xl">
                {todayBookings.length}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
              <p className="text-xs text-gray-600 sm:text-sm">This Month</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900 sm:text-3xl">
                {bookings.filter((b) => b.status === "confirmed").length}
              </p>
            </div>
          </div>

          {/* Today's occupancy */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
            <div className="mb-3 flex items-center justify-between sm:mb-4">
              <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
                Currently Occupied
              </h2>
              <Link
                href="/admin/bookings"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View all
              </Link>
            </div>

            {todayBookings.length === 0 ? (
              <p className="text-sm text-gray-500">
                No rooms are occupied right now.
              </p>
            ) : (
              <div className="divide-y divide-gray-100">
                {todayBookings.map((b) => (
                  <BookingCard key={b.id} booking={b} />
                ))}
              </div>
            )}
          </div>

          {/* Upcoming */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
            <div className="mb-3 flex items-center justify-between sm:mb-4">
              <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
                Upcoming Check-ins
              </h2>
              <Link
                href="/admin/bookings/new"
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 sm:px-4"
              >
                New Booking
              </Link>
            </div>

            {upcomingBookings.length === 0 ? (
              <p className="text-sm text-gray-500">
                No upcoming check-ins this month.
              </p>
            ) : (
              <div className="divide-y divide-gray-100">
                {upcomingBookings.map((b) => (
                  <BookingCard key={b.id} booking={b} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
