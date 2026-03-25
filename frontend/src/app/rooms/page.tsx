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
    <div className="px-6 py-12 text-white md:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex items-end justify-between gap-4 md:mb-14">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#E8A317]">
              Curated Stays
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-5xl">
              Rooms worth staying in
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400">
              Explore refined rooms designed for short breaks, long weekends,
              and everything in between.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-[#1E1F22] bg-[#111214] p-6 text-sm text-zinc-400 shadow-[0_12px_40px_rgba(0,0,0,0.22)]">
            Loading rooms...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-900/60 bg-red-950/30 p-6 text-sm text-red-300 shadow-[0_12px_40px_rgba(0,0,0,0.22)]">
            {error}
          </div>
        ) : rooms.length === 0 ? (
          <div className="rounded-2xl border border-[#1E1F22] bg-[#111214] p-6 text-sm text-zinc-400 shadow-[0_12px_40px_rgba(0,0,0,0.22)]">
            No rooms available right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3">
            {rooms.map((room) => (
              <article
                key={room.id}
                className="group overflow-hidden rounded-2xl border border-[#1E1F22] bg-[#111214] shadow-[0_12px_36px_rgba(0,0,0,0.24)] transition duration-300 hover:scale-[1.015] hover:shadow-[0_20px_48px_rgba(0,0,0,0.38)]"
              >
                <div className="relative h-56 overflow-hidden rounded-2xl m-3 mb-0">
                  <Image
                    loader={imageLoader}
                    unoptimized
                    src={getRoomImage(room)}
                    alt={room.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0c]/80 via-[#0b0b0c]/25 to-transparent" />
                  <div className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/10 px-3.5 py-1.5 text-sm font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-md">
                    ${room.pricePerNight}/night
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-6 pt-5">
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold tracking-tight text-white">
                      {room.name}
                    </h2>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-400">
                      {room.description}
                    </p>
                  </div>

                  <Link
                    href={`/rooms/${room.id}`}
                    className="mt-8 inline-flex w-fit items-center rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black shadow-[0_10px_30px_rgba(255,255,255,0.08)] hover:bg-zinc-200"
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
