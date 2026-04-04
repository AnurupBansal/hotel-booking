"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getRooms, type Room } from "@/services/api";

const roomPlaceholder =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f5e6c8" />
          <stop offset="100%" stop-color="#dbeafe" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#g)" />
      <rect x="125" y="140" width="950" height="520" rx="48" fill="rgba(255,255,255,0.45)" />
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#3f3f46" font-family="Arial, sans-serif" font-size="52">
        Hotel Room
      </text>
    </svg>
  `);

function getRoomImage(room: Room) {
  return room.images?.trim() || roomPlaceholder;
}

const imageLoader = ({ src }: { src: string }) => src;

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
    <div className="bg-white px-6 py-12 text-gray-900 md:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex items-end justify-between gap-4 md:mb-14">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#E8A317]">
              Rooms
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900 md:text-5xl">
              Mayapur Inspection House
            </h1>
            <p className="mt-4 max-w-2xl text-base font-medium text-gray-700">
              UP Irrigation & Water Resources Department
            </p>
            <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600">
              Explore available rooms with a clean and straightforward booking flow.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
            Loading rooms...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
            {error}
          </div>
        ) : rooms.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
            No rooms available right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3">
            {rooms.map((room) => (
              <article
                key={room.id}
                className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="relative m-3 mb-0 h-56 overflow-hidden rounded-2xl">
                  <Image
                    loader={imageLoader}
                    unoptimized
                    src={getRoomImage(room)}
                    alt={room.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
                  <div className="absolute right-4 top-4 rounded-full border border-white/70 bg-white/90 px-3.5 py-1.5 text-sm font-medium text-gray-900 shadow-sm backdrop-blur-md">
                    ₹{room.pricePerNight}/night
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-6 pt-5">
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
                      {room.name}
                    </h2>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">
                      {room.description}
                    </p>
                  </div>

                  <Link
                    href={`/rooms/${room.id}`}
                    className="mt-8 inline-flex w-fit items-center rounded-full bg-gray-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-gray-800"
                  >
                    View Details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
