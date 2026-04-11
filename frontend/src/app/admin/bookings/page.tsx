"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAdminAuth } from "@/context/AdminAuth";
import {
  adminGetBookings,
  adminDeleteBooking,
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

export default function AdminBookingsPage() {
  const { token } = useAdminAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [filterMonth, setFilterMonth] = useState(toMonthString(new Date()));
  const [filterRoom, setFilterRoom] = useState("");

  async function loadBookings() {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const params: { month?: string; roomId?: string } = {};
      if (filterMonth) params.month = filterMonth;
      if (filterRoom) params.roomId = filterRoom;

      const [b, r] = await Promise.all([
        adminGetBookings(token, params),
        rooms.length ? Promise.resolve(rooms) : getRooms(),
      ]);
      setBookings(b);
      if (!rooms.length) setRooms(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, filterMonth, filterRoom]);

  async function handleDelete(id: string, guestName: string) {
    if (!token) return;
    if (
      !window.confirm(
        `Delete booking for "${guestName}"? This cannot be undone.`,
      )
    )
      return;

    try {
      await adminDeleteBooking(token, id);
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete booking");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
          Bookings
        </h1>
        <Link
          href="/admin/bookings/new"
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          New Booking
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <label className="block min-w-0 flex-1 sm:flex-none">
          <span className="mb-1 block text-xs font-medium text-gray-600">
            Month
          </span>
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-200 sm:w-auto"
          />
        </label>

        <label className="block min-w-0 flex-1 sm:flex-none">
          <span className="mb-1 block text-xs font-medium text-gray-600">
            Room
          </span>
          <select
            value={filterRoom}
            onChange={(e) => setFilterRoom(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-200 sm:w-auto"
          >
            <option value="">All rooms</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Content */}
      {loading ? (
        <p className="text-sm text-gray-500">Loading bookings...</p>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          No bookings found for the selected filters.
        </div>
      ) : (
        <>
          {/* Mobile card layout */}
          <div className="flex flex-col gap-3 md:hidden">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="rounded-xl border border-gray-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900">{b.guestName}</p>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {b.guestPhone}
                      {b.guestEmail ? ` · ${b.guestEmail}` : ""}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                      b.status === "confirmed"
                        ? "bg-green-100 text-green-700"
                        : b.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {b.status}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-gray-100 pt-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Room</p>
                    <p className="font-medium text-gray-900">
                      {b.room?.name ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Amount</p>
                    <p className="font-medium text-gray-900">₹{b.amountPaid}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">From</p>
                    <p className="text-gray-700">{formatDate(b.checkIn)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">To</p>
                    <p className="text-gray-700">{formatDate(b.checkOut)}</p>
                  </div>
                </div>

                <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
                  <Link
                    href={`/admin/bookings/${b.id}/edit`}
                    className="flex-1 rounded-lg border border-gray-200 py-2.5 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(b.id, b.guestName)}
                    className="flex-1 rounded-lg border border-red-200 py-2.5 text-center text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-xl border border-gray-200 bg-white md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-600">Guest</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Phone</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Room</th>
                  <th className="px-4 py-3 font-medium text-gray-600">From</th>
                  <th className="px-4 py-3 font-medium text-gray-600">To</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Amount</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{b.guestName}</p>
                      {b.guestEmail && (
                        <p className="text-xs text-gray-500">{b.guestEmail}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{b.guestPhone}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {b.room?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {formatDate(b.checkIn)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {formatDate(b.checkOut)}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      ₹{b.amountPaid}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                          b.status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : b.status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/bookings/${b.id}/edit`}
                          className="rounded border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(b.id, b.guestName)}
                          className="rounded border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
