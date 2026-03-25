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
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      <div className="absolute inset-x-0 bottom-0 md:flex md:items-center md:justify-center md:p-6">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirm your booking"
          className="relative max-h-[92vh] w-full overflow-hidden rounded-t-[28px] border border-white/8 bg-[#111214] shadow-[0_-20px_60px_rgba(0,0,0,0.45)] md:max-h-[85vh] md:max-w-2xl md:rounded-[28px] md:shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
        >
          <div className="mx-auto mt-3 h-1.5 w-14 rounded-full bg-white/15 md:hidden" />

          <div className="flex items-center justify-between border-b border-white/8 px-5 py-4 md:px-7 md:py-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#E8A317]">
                Final Step
              </p>
              <h2 className="mt-2 text-lg font-semibold text-white md:text-xl">
                Confirm your stay
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-zinc-300 hover:bg-white/10 hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="max-h-[calc(92vh-72px)] overflow-y-auto px-5 pb-6 pt-5 md:max-h-[calc(85vh-84px)] md:px-7 md:pb-7">
            <div className="grid gap-6 md:grid-cols-[0.95fr_1.05fr]">
              <section className="rounded-[24px] border border-white/8 bg-[#0d0e10] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.24)]">
                <p className="text-sm font-medium text-zinc-400">
                  Booking summary
                </p>
                <div className="mt-5 space-y-4 text-sm text-zinc-300">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                      Room
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {room.name}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/8 bg-white/3 p-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                        Check-in
                      </p>
                      <p className="mt-2 font-medium text-white">
                        {formatDate(checkIn)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/3 p-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                        Check-out
                      </p>
                      <p className="mt-2 font-medium text-white">
                        {formatDate(checkOut)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/3 px-4 py-3">
                    <span className="text-zinc-400">Nights</span>
                    <span className="font-medium text-white">{nights}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-[#E8A317]/20 bg-[#E8A317]/8 px-4 py-4">
                    <span className="text-zinc-300">Total price</span>
                    <span className="text-xl font-semibold text-[#F5C766]">
                      ${totalPrice}
                    </span>
                  </div>
                </div>
              </section>

              <form onSubmit={onSubmit} className="space-y-5">
                <div>
                  <p className="text-sm font-medium text-zinc-400">
                    Guest details
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    Add the details for the reservation confirmation.
                  </p>
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-zinc-200">
                    Name
                  </span>
                  <input
                    type="text"
                    name="userName"
                    value={guestDetails.userName}
                    onChange={onGuestDetailsChange}
                    required
                    className="w-full rounded-2xl border border-white/8 bg-[#0d0e10] px-4 py-3.5 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#E8A317] focus:ring-2 focus:ring-[#E8A317]/20"
                    placeholder="Your full name"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-zinc-200">
                    Email
                  </span>
                  <input
                    type="email"
                    name="userEmail"
                    value={guestDetails.userEmail}
                    onChange={onGuestDetailsChange}
                    required
                    className="w-full rounded-2xl border border-white/8 bg-[#0d0e10] px-4 py-3.5 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#E8A317] focus:ring-2 focus:ring-[#E8A317]/20"
                    placeholder="you@example.com"
                  />
                </label>

                {formError ? (
                  <div className="rounded-2xl border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300">
                    {formError}
                  </div>
                ) : null}

                {successMessage ? (
                  <div className="rounded-2xl border border-emerald-900/50 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-300">
                    {successMessage}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-full bg-white px-5 py-3.5 text-sm font-medium text-black shadow-[0_10px_30px_rgba(255,255,255,0.08)] hover:bg-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-500 disabled:text-zinc-900"
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
