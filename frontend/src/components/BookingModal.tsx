"use client";

import { type ChangeEvent, type FormEvent, useEffect } from "react";
import { type Room } from "@/services/api";

type BookingGuestDetails = {
  userName: string;
  userEmail: string;
};

type BookingModalProps = {
  isOpen: boolean;
  room: Room;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalPrice: number;
  guestDetails: BookingGuestDetails;
  formError: string;
  successMessage: string;
  submitting: boolean;
  onClose: () => void;
  onGuestDetailsChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function BookingModal({
  isOpen,
  room,
  checkIn,
  checkOut,
  nights,
  totalPrice,
  guestDetails,
  formError,
  successMessage,
  submitting,
  onClose,
  onGuestDetailsChange,
  onSubmit,
}: BookingModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close booking modal"
        onClick={onClose}
        className="absolute inset-0 bg-blue-950/10 backdrop-blur-sm"
      />

      <div className="absolute inset-x-0 bottom-0 md:flex md:items-center md:justify-center md:p-6">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirm your booking"
          className="relative max-h-[92vh] w-full overflow-hidden rounded-t-[28px] border border-blue-100 bg-white shadow-sm md:max-h-[85vh] md:max-w-2xl md:rounded-[28px]"
        >
          <div className="mx-auto mt-3 h-1.5 w-14 rounded-full bg-blue-100 md:hidden" />

          <div className="flex items-center justify-between border-b border-blue-100 px-5 py-4 md:px-7 md:py-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-blue-600">
                Final Step
              </p>
              <h2 className="mt-2 text-lg font-semibold text-gray-900 md:text-xl">
                Confirm your stay
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-blue-100 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-blue-50 hover:text-gray-900"
            >
              Close
            </button>
          </div>

          <div className="max-h-[calc(92vh-72px)] overflow-y-auto px-5 pb-6 pt-5 md:max-h-[calc(85vh-84px)] md:px-7 md:pb-7">
            <div className="grid gap-6 md:grid-cols-[0.95fr_1.05fr]">
              <section className="rounded-xl border border-blue-100 bg-blue-50 p-5 shadow-sm">
                <p className="text-sm font-medium text-gray-600">
                  Booking summary
                </p>
                <div className="mt-5 space-y-4 text-sm text-gray-900">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-600">
                      Room
                    </p>
                    <p className="mt-2 text-lg font-semibold text-gray-900">
                      {room.name}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-blue-100 bg-white p-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-gray-600">
                        Check-in
                      </p>
                      <p className="mt-2 font-medium text-gray-900">
                        {formatDate(checkIn)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-blue-100 bg-white p-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-gray-600">
                        Check-out
                      </p>
                      <p className="mt-2 font-medium text-gray-900">
                        {formatDate(checkOut)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-white px-4 py-3">
                    <span className="text-gray-600">Nights</span>
                    <span className="font-medium text-gray-900">{nights}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-white px-4 py-4">
                    <span className="text-gray-600">Total price</span>
                    <span className="text-xl font-semibold text-gray-900">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>
              </section>

              <form onSubmit={onSubmit} className="space-y-5">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Guest details
                  </p>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Add the details for the reservation confirmation.
                  </p>
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-900">
                    Name
                  </span>
                  <input
                    type="text"
                    name="userName"
                    value={guestDetails.userName}
                    onChange={onGuestDetailsChange}
                    required
                    className="w-full rounded-lg border border-blue-100 bg-white px-4 py-3.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-blue-200"
                    placeholder="Your full name"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-900">
                    Email
                  </span>
                  <input
                    type="email"
                    name="userEmail"
                    value={guestDetails.userEmail}
                    onChange={onGuestDetailsChange}
                    required
                    className="w-full rounded-lg border border-blue-100 bg-white px-4 py-3.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-blue-200"
                    placeholder="you@example.com"
                  />
                </label>

                {formError ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {formError}
                  </div>
                ) : null}

                {successMessage ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
                    {successMessage}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-blue-600 px-5 py-3.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-200 disabled:text-blue-50"
                >
                  {submitting ? "Confirming booking..." : "Confirm Booking"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
