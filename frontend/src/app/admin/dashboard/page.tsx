"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAdminAuth } from "@/context/AdminAuth";
import { adminGetBookings, getRooms, type Booking, type Room } from "@/services/api";

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
    (b) => b.status === "confirmed" && b.checkIn.split("T")[0] <= todayStr && b.checkOut.split("T")[0] > todayStr,
  );
  const upcomingBookings = bookings
    .filter((b) => b.status === "confirmed" && b.checkIn.split("T")[0] > todayStr)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
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
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-sm text-gray-600">Total Rooms</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">
                {rooms.length}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-sm text-gray-600">Occupied Today</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">
                {todayBookings.length}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-sm text-gray-600">Bookings This Month</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">
                {bookings.filter((b) => b.status === "confirmed").length}
              </p>
            </div>
          </div>

          {/* Today's occupancy */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
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
                  <div key={b.id} className="flex items-center justify-between gap-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">
                        {b.guestName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {b.room?.name} · {b.guestPhone}
                      </p>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <p>{formatDate(b.checkIn)} — {formatDate(b.checkOut)}</p>
                      <p className="font-medium text-gray-900">₹{b.amountPaid}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Upcoming Check-ins
              </h2>
              <Link
                href="/admin/bookings/new"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
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
                  <div key={b.id} className="flex items-center justify-between gap-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">
                        {b.guestName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {b.room?.name} · {b.guestPhone}
                      </p>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <p>{formatDate(b.checkIn)} — {formatDate(b.checkOut)}</p>
                      <p className="font-medium text-gray-900">₹{b.amountPaid}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
