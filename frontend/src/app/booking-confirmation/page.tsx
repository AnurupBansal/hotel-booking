"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function formatDate(value: string) {
  if (!value) {
    return "Not provided";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function calculateNights(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) {
    return 0;
  }

  const start = new Date(checkIn);
  const end = new Date(checkOut);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0;
  }

  const differenceInMs = end.getTime() - start.getTime();
  const nights = Math.round(differenceInMs / (1000 * 60 * 60 * 24));

  return nights > 0 ? nights : 0;
}

function formatPrice(value: string) {
  const amount = Number(value);

  if (Number.isNaN(amount)) {
    return value || "Not provided";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function BookingConfirmationContent() {
  const searchParams = useSearchParams();

  const roomName = searchParams.get("roomName") ?? "Your room";
  const checkIn = searchParams.get("checkIn") ?? "";
  const checkOut = searchParams.get("checkOut") ?? "";
  const totalPrice = searchParams.get("totalPrice") ?? "";
  const userName = searchParams.get("userName") ?? "Guest";
  const userEmail = searchParams.get("userEmail") ?? "Not provided";
  const nights = calculateNights(checkIn, checkOut);

  return (
    <div className="bg-white px-6 py-20 text-gray-900">
      <div className="mx-auto max-w-xl">
        <section className="py-20 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-3xl shadow-sm">
            ✓
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-gray-900 sm:text-5xl">
            Booking Confirmed
          </h1>
          <p className="mt-4 text-base text-gray-600">
            Your stay has been reserved successfully.
          </p>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-gray-500">
                Booking details
              </p>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between gap-4 border-b border-gray-200 pb-4">
                  <span className="text-gray-600">Room Name</span>
                  <span className="text-right font-medium text-gray-900">
                    {roomName}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-gray-200 pb-4">
                  <span className="text-gray-600">Dates</span>
                  <span className="text-right font-medium text-gray-900">
                    {formatDate(checkIn)} {"\u2192"} {formatDate(checkOut)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-gray-200 pb-4">
                  <span className="text-gray-600">Nights</span>
                  <span className="font-medium text-gray-900">{nights}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-600">Total Price</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <p className="text-xs uppercase tracking-[0.24em] text-gray-500">
                User details
              </p>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between gap-4 border-b border-gray-200 pb-4">
                  <span className="text-gray-600">Name</span>
                  <span className="text-right font-medium text-gray-900">
                    {userName}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-600">Email</span>
                  <span className="text-right font-medium text-gray-900">
                    {userEmail}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-200 pt-6 sm:flex-row">
              <Link
                href="/rooms"
                className="inline-flex flex-1 items-center justify-center rounded-full border border-gray-300 px-5 py-3 text-sm font-medium text-gray-900 transition hover:bg-gray-50"
              >
                Back to Rooms
              </Link>
              <Link
                href="/"
                className="inline-flex flex-1 items-center justify-center rounded-full bg-gray-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                Go Home
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white px-6 py-20 text-gray-900">
          <div className="mx-auto max-w-xl">
            <section className="py-20 text-center">
              <h1 className="text-4xl font-semibold tracking-[-0.04em] text-gray-900 sm:text-5xl">
                Loading booking confirmation...
              </h1>
            </section>
          </div>
        </div>
      }
    >
      <BookingConfirmationContent />
    </Suspense>
  );
}
