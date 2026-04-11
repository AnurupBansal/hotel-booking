"use client";

import { useParams, useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { useAdminAuth } from "@/context/AdminAuth";
import {
  adminGetBooking,
  adminUpdateBooking,
  getRooms,
  type Booking,
  type Room,
} from "@/services/api";

function toInputDate(isoDate: string): string {
  return isoDate.split("T")[0];
}

export default function EditBookingPage() {
  const { token } = useAdminAuth();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const bookingId = params.id;

  const [rooms, setRooms] = useState<Room[]>([]);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [status, setStatus] = useState("confirmed");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token || !bookingId) return;

    async function load() {
      try {
        const [b, r] = await Promise.all([
          adminGetBooking(token!, bookingId),
          getRooms(),
        ]);
        setBooking(b);
        setRooms(r);
        setGuestName(b.guestName);
        setGuestPhone(b.guestPhone);
        setGuestEmail(b.guestEmail ?? "");
        setCheckIn(toInputDate(b.checkIn));
        setCheckOut(toInputDate(b.checkOut));
        setAmountPaid(String(b.amountPaid));
        setStatus(b.status);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load booking");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [token, bookingId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!token || !bookingId) return;

    setError("");
    setSubmitting(true);

    try {
      await adminUpdateBooking(token, bookingId, {
        guestName,
        guestPhone,
        guestEmail: guestEmail || "",
        checkIn,
        checkOut,
        amountPaid: Number(amountPaid),
        status,
      });
      router.push("/admin/bookings");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update booking");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-gray-500">Loading booking...</p>;
  }

  if (!booking && error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  const roomName =
    rooms.find((r) => r.id === booking?.roomId)?.name ?? "Unknown room";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Edit Booking</h1>
      <p className="text-sm text-gray-600">Room: {roomName}</p>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border border-gray-200 bg-white p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-900">
              Guest Name *
            </span>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-200"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-900">
              Phone Number *
            </span>
            <input
              type="tel"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-200"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-gray-900">
            Email (optional)
          </span>
          <input
            type="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-200"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-900">
              From (Check-in) *
            </span>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-200"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-900">
              To (Check-out) *
            </span>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              min={checkIn || undefined}
              required
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-200"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-900">
              Amount Paid (₹) *
            </span>
            <input
              type="number"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              required
              min="0"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-200"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-900">
              Status
            </span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
