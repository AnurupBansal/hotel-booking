"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  type ChangeEvent,
  type FormEvent,
  type MouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import BookingModal from "@/components/BookingModal";
import MobileBookingBar from "@/components/MobileBookingBar";
import { createBooking, getRoom, type Room } from "@/services/api";

type DateSelectionState = {
  checkIn: string;
  checkOut: string;
};

type GuestDetailsState = {
  userName: string;
  userEmail: string;
};

const initialDates: DateSelectionState = {
  checkIn: "",
  checkOut: "",
};

const initialGuestDetails: GuestDetailsState = {
  userName: "",
  userEmail: "",
};

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

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

function calculateNights(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut || checkIn >= checkOut) {
    return 0;
  }

  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const millisecondsPerDay = 1000 * 60 * 60 * 24;

  return Math.round((end.getTime() - start.getTime()) / millisecondsPerDay);
}

function formatDate(value: string) {
  if (!value) {
    return "--";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function RoomDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const roomId = params.id;

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [dateSelection, setDateSelection] = useState<DateSelectionState>(initialDates);
  const [guestDetails, setGuestDetails] = useState<GuestDetailsState>(initialGuestDetails);
  const [bookingError, setBookingError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isDateSectionHighlighted, setIsDateSectionHighlighted] = useState(false);
  const datePickerSectionRef = useRef<HTMLElement | null>(null);
  const checkInInputRef = useRef<HTMLInputElement | null>(null);
  const checkOutInputRef = useRef<HTMLInputElement | null>(null);
  const highlightTimeoutRef = useRef<number | null>(null);

  const nights = calculateNights(dateSelection.checkIn, dateSelection.checkOut);
  const totalPrice = room ? nights * room.pricePerNight : 0;
  const isDateSelected = Boolean(dateSelection.checkIn && dateSelection.checkOut);
  const isValidDateRange = nights > 0;

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        window.clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

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

  function handleDateChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setDateSelection((current) => ({
      ...current,
      [name]: value,
    }));
    setBookingError("");
    setSuccessMessage("");
  }

  function handleGuestDetailsChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setGuestDetails((current) => ({
      ...current,
      [name]: value,
    }));
    setBookingError("");
    setSuccessMessage("");
  }

  function validateDates() {
    const { checkIn, checkOut } = dateSelection;

    if (!checkIn || !checkOut) {
      return "Select both check-in and check-out dates";
    }

    if (checkIn >= checkOut) {
      return "Check-out date must be after check-in date";
    }

    return "";
  }

  function validateBookingDetails() {
    const { userName, userEmail } = guestDetails;

    if (!userName || !userEmail) {
      return "Name and email are required";
    }

    return validateDates();
  }

  function handleContinue() {
    const validationError = validateDates();

    if (validationError) {
      return;
    }

    setBookingError("");
    setSuccessMessage("");
    setIsBookingModalOpen(true);
  }

  function openNativeDatePicker(input: HTMLInputElement | null) {
    if (!input) {
      return;
    }

    const dateInput = input as HTMLInputElement & {
      showPicker?: () => void;
    };

    if (typeof dateInput.showPicker === "function") {
      dateInput.showPicker();
      return;
    }

    input.focus();
  }

  function handleDateInputClick(
    event: MouseEvent<HTMLInputElement>,
    input: HTMLInputElement | null,
  ) {
    event.currentTarget.focus();
    openNativeDatePicker(input);
  }

  function scrollToDatePicker() {
    datePickerSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    setIsDateSectionHighlighted(true);

    if (highlightTimeoutRef.current) {
      window.clearTimeout(highlightTimeoutRef.current);
    }

    highlightTimeoutRef.current = window.setTimeout(() => {
      setIsDateSectionHighlighted(false);
    }, 1000);
  }

  function handleMobileBookingAction() {
    if (!isDateSelected) {
      scrollToDatePicker();
      return;
    }

    if (!isValidDateRange) {
      return;
    }

    handleContinue();
  }

  async function handleConfirmBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!roomId || !room) {
      setBookingError("Room not found");
      return;
    }

    const validationError = validateBookingDetails();

    if (validationError) {
      setBookingError(validationError);
      setSuccessMessage("");
      return;
    }

    setSubmitting(true);
    setBookingError("");
    setSuccessMessage("");

    try {
      await createBooking({
        roomId,
        ...guestDetails,
        ...dateSelection,
      });

      setGuestDetails(initialGuestDetails);
      setSuccessMessage("");

      const confirmationParams = new URLSearchParams({
        roomName: room.name,
        checkIn: dateSelection.checkIn,
        checkOut: dateSelection.checkOut,
        totalPrice: String(totalPrice),
        userName: guestDetails.userName,
        userEmail: guestDetails.userEmail,
      });

      router.push(`/booking-confirmation?${confirmationParams.toString()}`);
    } catch (err) {
      setBookingError(
        err instanceof Error ? err.message : "Failed to create booking",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="px-6 py-12 pb-24 text-white md:py-16 md:pb-16">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/rooms"
          className="text-sm font-medium text-zinc-400 transition hover:text-white"
        >
          Back to rooms
        </Link>

        {loading ? (
          <div className="mt-8 rounded-2xl border border-[#1E1F22] bg-[#111214] p-6 text-sm text-zinc-400 shadow-[0_12px_40px_rgba(0,0,0,0.22)]">
            Loading room...
          </div>
        ) : pageError ? (
          <div className="mt-8 rounded-2xl border border-red-900/60 bg-red-950/30 p-6 text-sm text-red-300 shadow-[0_12px_40px_rgba(0,0,0,0.22)]">
            {pageError}
          </div>
        ) : room ? (
          <div className="mt-8 grid gap-12 xl:grid-cols-[1.2fr_0.8fr] xl:gap-14">
            <section className="overflow-hidden rounded-[28px] border border-[#1E1F22] bg-[#111214] shadow-[0_24px_64px_rgba(0,0,0,0.3)]">
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
                <div className="absolute inset-0 bg-gradient-to-t from-[#060607]/95 via-[#0b0b0c]/55 to-[#0b0b0c]/10" />
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/35 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-end justify-between gap-4 md:bottom-8 md:left-8 md:right-8">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#F3C56B]">
                      Signature Room
                    </p>
                    <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
                      {room.name}
                    </h1>
                  </div>
                  <div className="rounded-full border border-white/15 bg-black/35 px-5 py-2.5 text-sm font-medium text-white shadow-[0_14px_32px_rgba(0,0,0,0.28)] backdrop-blur-xl">
                    From ${room.pricePerNight} / night
                  </div>
                </div>
              </div>

              <div className="grid gap-10 p-6 sm:p-8 md:grid-cols-[1fr_auto] md:items-start">
                <div>
                  <p className="text-base leading-8 text-zinc-400">
                    {room.description}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1">
                  <div className="rounded-2xl border border-white/8 bg-[#141518] p-5">
                    <p className="text-sm text-zinc-400">Price per night</p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      ${room.pricePerNight}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-[#141518] p-5">
                    <p className="text-sm text-zinc-400">Max guests</p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {room.maxGuests}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <aside className="xl:sticky xl:top-24 xl:self-start">
              <section
                ref={datePickerSectionRef}
                className={`rounded-[32px] border bg-[#17181c] p-6 shadow-[0_28px_70px_rgba(0,0,0,0.42)] transition-[border-color,box-shadow] duration-300 md:p-8 ${
                  isDateSectionHighlighted
                    ? "border-white/20 ring-2 ring-white/20"
                    : "border-white/10"
                }`}
              >
                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#E8A317]">
                      Step 1
                    </p>
                    <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">
                      Select your dates
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-zinc-400">
                      Choose your stay dates first. Guest details come in the
                      next step.
                    </p>
                  </div>

                  <div className="border-t border-white/8 pt-6">
                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-zinc-200">
                          Check-in date
                        </span>
                        <input
                          ref={checkInInputRef}
                          type="date"
                          name="checkIn"
                          value={dateSelection.checkIn}
                          onChange={handleDateChange}
                          onClick={(event) =>
                            handleDateInputClick(event, checkInInputRef.current)
                          }
                          min={getTodayDate()}
                          required
                          className="w-full rounded-2xl border border-white/8 bg-[#111216] px-4 py-3.5 text-sm text-white outline-none focus:border-[#E8A317] focus:ring-2 focus:ring-[#E8A317]/20"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-zinc-200">
                          Check-out date
                        </span>
                        <input
                          ref={checkOutInputRef}
                          type="date"
                          name="checkOut"
                          value={dateSelection.checkOut}
                          onChange={handleDateChange}
                          onClick={(event) =>
                            handleDateInputClick(event, checkOutInputRef.current)
                          }
                          min={dateSelection.checkIn || getTodayDate()}
                          required
                          className="w-full rounded-2xl border border-white/8 bg-[#111216] px-4 py-3.5 text-sm text-white outline-none focus:border-[#E8A317] focus:ring-2 focus:ring-[#E8A317]/20"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="border-t border-white/8 pt-6">
                    <div className="rounded-[24px] border border-white/8 bg-[#111216] p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-zinc-200">
                            Booking summary
                          </p>
                          <p className="mt-1 text-sm text-zinc-500">
                            Live pricing updates as you select dates.
                          </p>
                        </div>
                        <div className="rounded-full border border-white/8 bg-white/5 px-3.5 py-1.5 text-sm font-medium text-white">
                          {nights > 0
                            ? `${nights} night${nights > 1 ? "s" : ""}`
                            : "No dates"}
                        </div>
                      </div>

                      <div className="mt-5 space-y-4 border-t border-white/8 pt-5 text-sm text-zinc-300">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-zinc-500">Check-in</span>
                          <span>{formatDate(dateSelection.checkIn)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-zinc-500">Check-out</span>
                          <span>{formatDate(dateSelection.checkOut)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-zinc-500">Price per night</span>
                          <span>${room.pricePerNight}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-zinc-500">Stay duration</span>
                          <span>
                            {nights > 0
                              ? `${nights} night${nights > 1 ? "s" : ""}`
                              : "--"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#E8A317]/15 bg-[#E8A317]/8 px-4 py-3">
                          <span className="text-zinc-300">
                            {nights > 0
                              ? `$${room.pricePerNight} x ${nights} night${nights > 1 ? "s" : ""}`
                              : "Price calculation"}
                          </span>
                          <span className="font-semibold text-white">
                            ${totalPrice || 0}
                          </span>
                        </div>
                        <div className="flex items-end justify-between gap-4 border-t border-white/8 pt-4">
                          <div>
                            <p className="text-sm text-zinc-500">Total price</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#F3C56B]">
                              Before confirmation
                            </p>
                          </div>
                          <span className="text-3xl font-semibold tracking-tight text-white">
                            ${totalPrice || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/8 pt-6">
                    <button
                      type="button"
                      onClick={handleContinue}
                      disabled={!isValidDateRange}
                      className="w-full rounded-2xl bg-white px-5 py-4 text-sm font-semibold text-black shadow-[0_16px_40px_rgba(255,255,255,0.1)] transition duration-200 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:bg-zinc-500 disabled:text-zinc-900"
                    >
                      Check Availability
                    </button>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        ) : null}
      </div>

      {room ? (
        <MobileBookingBar
          pricePerNight={room.pricePerNight}
          totalPrice={totalPrice}
          nights={nights}
          isDateSelected={isDateSelected}
          isContinueDisabled={isDateSelected && !isValidDateRange}
          onAction={handleMobileBookingAction}
        />
      ) : null}

      {room ? (
        <BookingModal
          isOpen={isBookingModalOpen}
          room={room}
          checkIn={dateSelection.checkIn}
          checkOut={dateSelection.checkOut}
          nights={nights}
          totalPrice={totalPrice}
          guestDetails={guestDetails}
          formError={bookingError}
          successMessage={successMessage}
          submitting={submitting}
          onClose={() => setIsBookingModalOpen(false)}
          onGuestDetailsChange={handleGuestDetailsChange}
          onSubmit={handleConfirmBooking}
        />
      ) : null}
    </div>
  );
}
