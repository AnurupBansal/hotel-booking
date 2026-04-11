"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import { getRoom, type Room } from "@/services/api";

const roomPlaceholder =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 900">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fde68a" />
          <stop offset="100%" stop-color="#bfdbfe" />
        </linearGradient>
      </defs>
      <rect width="1400" height="900" fill="url(#g)" />
      <rect x="160" y="140" width="1080" height="620" rx="54" fill="rgba(255,255,255,0.35)" />
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#27272a" font-family="Arial, sans-serif" font-size="62">
        Room Preview
      </text>
    </svg>
  `);

function getRoomImage(room: Room) {
  return room.images?.trim() || roomPlaceholder;
}

const imageLoader = ({ src }: { src: string }) => src;

export default function RoomDetailPage() {
  const params = useParams<{ id: string }>();
  const roomId = params.id;

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

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

  return (
    <div className="px-6 py-12 text-gray-900 md:py-16">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/rooms"
          className="text-sm font-medium text-gray-600 transition hover:text-gray-900"
        >
          Back to rooms
        </Link>

        {loading ? (
          <div className="mt-8 rounded-2xl border border-blue-100 bg-white p-6 text-sm text-gray-600 shadow-sm">
            Loading room...
          </div>
        ) : pageError ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600 shadow-sm">
            {pageError}
          </div>
        ) : room ? (
          <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr] xl:gap-8">
            {/* Room info */}
            <section className="overflow-hidden rounded-[28px] border border-blue-100 bg-white shadow-sm">
              <div className="relative h-56 sm:h-72 lg:h-[28rem]">
                <Image
                  loader={imageLoader}
                  unoptimized
                  src={getRoomImage(room)}
                  alt={room.name}
                  fill
                  sizes="(max-width: 1280px) 100vw, 60vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/15 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-end justify-between gap-4 md:bottom-8 md:left-8 md:right-8">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.28em] text-blue-100">
                      Signature Room
                    </p>
                    <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
                      {room.name}
                    </h1>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-[1fr_auto] md:items-start">
                <div>
                  <p className="text-base leading-8 text-gray-600">
                    {room.description}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1">
                  <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-600">Price per night</p>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                      ₹{room.pricePerNight}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-600">Max guests</p>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                      {room.maxGuests}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Availability calendar */}
            <aside className="xl:sticky xl:top-24 xl:self-start">
              <section className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.28em] text-blue-600">
                      Availability
                    </p>
                    <h2 className="mt-4 text-2xl font-semibold tracking-tight text-gray-900">
                      Check availability
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-gray-600">
                      Browse the calendar to see which dates are available. Click
                      two dates to check a specific range.
                    </p>
                  </div>

                  <div className="border-t border-blue-100 pt-6">
                    <AvailabilityCalendar roomId={roomId} />
                  </div>
                </div>
              </section>
            </aside>
          </div>
        ) : null}
      </div>
    </div>
  );
}
