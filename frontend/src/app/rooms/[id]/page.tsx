"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import {
  createBooking,
  getRoom,
  type CreateBookingPayload,
  type Room,
} from "@/services/api";

type BookingFormState = Omit<CreateBookingPayload, "roomId">;

const initialFormState: BookingFormState = {
  userName: "",
  userEmail: "",
  checkIn: "",
  checkOut: "",
};

export default function RoomDetailPage() {
  const params = useParams<{ id: string }>();
  const roomId = params.id;

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [formData, setFormData] = useState<BookingFormState>(initialFormState);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!roomId) {
      setLoading(false);
      setPageError("Room not found");
      return;
    }

    let isMounted = true;

    async function loadRoom() {
      try {
        const data = await getRoom(roomId);

        if (isMounted) {
          setRoom(data);
          setPageError("");
        }
      } catch (err) {
        if (isMounted) {
          setPageError(
            err instanceof Error ? err.message : "Failed to load room",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadRoom();

    return () => {
      isMounted = false;
    };
  }, [roomId]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
    setFormError("");
    setSuccessMessage("");
  }

  function validateForm() {
    const { userName, userEmail, checkIn, checkOut } = formData;

    if (!userName || !userEmail || !checkIn || !checkOut) {
      return "All fields are required";
    }

    if (checkIn >= checkOut) {
      return "Check-out date must be after check-in date";
    }

    return "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!roomId) {
      setFormError("Room not found");
      return;
    }

    const validationError = validateForm();

    if (validationError) {
      setFormError(validationError);
      setSuccessMessage("");
      return;
    }

    setSubmitting(true);
    setFormError("");
    setSuccessMessage("");

    try {
      await createBooking({
        roomId,
        ...formData,
      });

      setSuccessMessage("Booking confirmed");
      setFormData(initialFormState);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to create booking",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12 text-zinc-900">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/rooms"
          className="text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
        >
          Back to rooms
        </Link>

        {loading ? (
          <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600">
            Loading room...
          </div>
        ) : pageError ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {pageError}
          </div>
        ) : room ? (
          <div className="mt-6 grid gap-8 lg:grid-cols-[1.3fr_0.9fr]">
            <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
                Room Details
              </p>
              <h1 className="mt-3 text-3xl font-semibold">{room.name}</h1>
              <p className="mt-5 text-base leading-7 text-zinc-600">
                {room.description}
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-zinc-100 p-4">
                  <p className="text-sm text-zinc-500">Price per night</p>
                  <p className="mt-2 text-2xl font-semibold">
                    ${room.pricePerNight}
                  </p>
                </div>
                <div className="rounded-2xl bg-zinc-100 p-4">
                  <p className="text-sm text-zinc-500">Max guests</p>
                  <p className="mt-2 text-2xl font-semibold">{room.maxGuests}</p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-semibold">Book this room</h2>
              <p className="mt-2 text-sm text-zinc-600">
                Enter your stay details and we&apos;ll confirm availability.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-zinc-700">
                    Name
                  </span>
                  <input
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none transition focus:border-zinc-500"
                    placeholder="Your name"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-zinc-700">
                    Email
                  </span>
                  <input
                    type="email"
                    name="userEmail"
                    value={formData.userEmail}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none transition focus:border-zinc-500"
                    placeholder="you@example.com"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-zinc-700">
                    Check-in
                  </span>
                  <input
                    type="date"
                    name="checkIn"
                    value={formData.checkIn}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none transition focus:border-zinc-500"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-zinc-700">
                    Check-out
                  </span>
                  <input
                    type="date"
                    name="checkOut"
                    value={formData.checkOut}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none transition focus:border-zinc-500"
                  />
                </label>

                {formError ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {formError}
                  </div>
                ) : null}

                {successMessage ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {successMessage}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-full bg-zinc-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
                >
                  {submitting ? "Submitting..." : "Confirm Booking"}
                </button>
              </form>
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}
