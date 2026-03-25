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
    <div className="bg-[#0B0B0C] text-white">
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
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,11,12,0.28)_0%,rgba(11,11,12,0.62)_38%,rgba(11,11,12,0.96)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(232,163,23,0.16),transparent_28%)]" />
        </div>

        <div className="relative mx-auto flex min-h-[78vh] w-full max-w-7xl items-end px-6 pb-16 pt-24 md:min-h-[84vh] md:pb-24">
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-[#E8A317]">
              Refined Escapes
            </p>
            <h1 className="mt-6 max-w-2xl text-5xl font-semibold tracking-[-0.04em] text-white sm:text-6xl md:text-7xl">
              Find your perfect stay
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-300 md:text-xl">
              Curated rooms for comfort and luxury
            </p>
            <Link
              href="/rooms"
              className="mt-10 inline-flex items-center rounded-full bg-white px-7 py-3.5 text-sm font-medium text-black shadow-[0_18px_45px_rgba(255,255,255,0.08)] hover:bg-zinc-200"
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
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-5xl">
                Handpicked for a remarkable stay
              </h2>
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
          ) : featuredRooms.length === 0 ? (
            <div className="rounded-2xl border border-[#1E1F22] bg-[#111214] p-6 text-sm text-zinc-400 shadow-[0_12px_40px_rgba(0,0,0,0.22)]">
              No rooms available right now.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3">
              {featuredRooms.map((room) => (
                <article
                  key={room.id}
                  className="group overflow-hidden rounded-2xl border border-[#1E1F22] bg-[#111214] shadow-[0_12px_36px_rgba(0,0,0,0.24)] transition duration-300 hover:scale-[1.015] hover:shadow-[0_20px_48px_rgba(0,0,0,0.38)]"
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
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0c]/80 via-[#0b0b0c]/25 to-transparent" />
                    <div className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/10 px-3.5 py-1.5 text-sm font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-md">
                      ${room.pricePerNight}/night
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-6 pt-5">
                    <div className="flex-1">
                      <h3 className="text-2xl font-semibold tracking-tight text-white">
                        {room.name}
                      </h3>
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
      </section>

      <section className="px-6 pb-20 md:pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] border border-[#1E1F22] bg-[linear-gradient(180deg,rgba(17,18,20,0.96)_0%,rgba(14,14,16,0.96)_100%)] px-8 py-12 shadow-[0_18px_60px_rgba(0,0,0,0.28)] md:px-12 md:py-14">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#E8A317]">
                  Reserve Your Stay
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                  Ready to book your stay?
                </h2>
              </div>

              <Link
                href="/rooms"
                className="inline-flex items-center rounded-full border border-white/10 bg-white px-6 py-3 text-sm font-medium text-black shadow-[0_14px_32px_rgba(255,255,255,0.06)] hover:bg-zinc-200"
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
