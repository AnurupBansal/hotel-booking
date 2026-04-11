"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getRooms, type Room } from "@/services/api";

const roomPlaceholder =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1c1917" />
          <stop offset="45%" stop-color="#2b2113" />
          <stop offset="100%" stop-color="#09090b" />
        </linearGradient>
      </defs>
      <rect width="1600" height="1000" fill="url(#g)" />
      <rect x="140" y="130" width="1320" height="740" rx="48" fill="rgba(255,255,255,0.06)" />
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="rgba(255,255,255,0.72)" font-family="Arial, sans-serif" font-size="64">
        Luxury Stay
      </text>
    </svg>
  `);

function getRoomImage(room?: Room | null) {
  return room?.images?.trim() || roomPlaceholder;
}

const imageLoader = ({ src }: { src: string }) => src;

export default function Home() {
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
            err instanceof Error ? err.message : "Failed to load featured rooms",
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

  const featuredRooms = rooms.slice(0, 3);
  const heroImage = getRoomImage(featuredRooms[0]);

  return (
    <div className="bg-white text-gray-900">
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0">
          <Image
            loader={imageLoader}
            unoptimized
            src={heroImage}
            alt="Luxury hotel room"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0.72)_45%,rgba(255,255,255,0.96)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(232,163,23,0.08),transparent_30%)]" />
        </div>

        <div className="relative mx-auto flex min-h-[78vh] w-full max-w-7xl items-end px-6 pb-16 pt-24 md:min-h-[84vh] md:pb-24">
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-[#E8A317]">
              Government Guest House
            </p>
            <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-[-0.04em] text-gray-900 sm:text-6xl md:text-7xl">
              Mayapur Inspection House
            </h1>
            <p className="mt-4 max-w-2xl text-lg font-medium text-gray-700 md:text-xl">
              UP Irrigation & Water Resources Department
            </p>
            <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600 md:text-xl">
              Comfortable accommodation with a clean, straightforward booking experience.
            </p>
            <Link
              href="/rooms"
              className="mt-10 inline-flex items-center rounded-full bg-gray-900 px-7 py-3.5 text-sm font-medium text-white shadow-sm hover:bg-gray-800"
            >
              Explore Rooms
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-end justify-between gap-4 md:mb-14">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#E8A317]">
                Featured Rooms
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900 md:text-5xl">
                Rooms ready for your stay
              </h2>
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
          ) : featuredRooms.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
              No rooms available right now.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3">
              {featuredRooms.map((room) => (
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
                      <h3 className="text-2xl font-semibold tracking-tight text-gray-900">
                        {room.name}
                      </h3>
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
      </section>

      <section className="px-6 pb-20 md:pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] border border-gray-200 bg-gray-50 px-8 py-12 shadow-sm md:px-12 md:py-14">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#E8A317]">
                  Plan Your Stay
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
                  Check room availability
                </h2>
              </div>

              <Link
                href="/rooms"
                className="inline-flex items-center rounded-full bg-gray-900 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-gray-800"
              >
                View All Rooms
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
