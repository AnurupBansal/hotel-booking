"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getRooms, type Room } from "@/services/api";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadRooms() {
      try {
        const data = await getRooms();

        if (isMounted) {
          setRooms(data);
          setError("");
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load rooms",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadRooms();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12 text-zinc-900">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
              Hotel Booking
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Available Rooms</h1>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600">
            Loading rooms...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {error}
          </div>
        ) : rooms.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600">
            No rooms available right now.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <article
                key={room.id}
                className="flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
              >
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">{room.name}</h2>
                  <p className="mt-3 text-sm leading-6 text-zinc-600">
                    {room.description}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between gap-4">
                  <p className="text-lg font-semibold text-zinc-900">
                    ${room.pricePerNight}
                    <span className="ml-1 text-sm font-normal text-zinc-500">
                      / night
                    </span>
                  </p>

                  <Link
                    href={`/rooms/${room.id}`}
                    className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
                  >
                    View Details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
