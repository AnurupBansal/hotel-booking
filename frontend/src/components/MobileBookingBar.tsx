"use client";

type MobileBookingBarProps = {
  pricePerNight: number;
  totalPrice: number;
  nights: number;
  isDateSelected: boolean;
  isContinueDisabled: boolean;
  onAction: () => void;
};

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function MobileBookingBar({
  pricePerNight,
  totalPrice,
  nights,
  isDateSelected,
  isContinueDisabled,
  onAction,
}: MobileBookingBarProps) {
  const hasNights = nights > 0;
  const buttonLabel = isDateSelected ? "Continue" : "Select dates";

  return (
    <div className="fixed bottom-0 left-0 z-40 w-full border-t border-[#232428] bg-[#111214] px-4 py-3 md:hidden">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-white font-semibold">
            {isDateSelected ? formatPrice(totalPrice) : formatPrice(pricePerNight)}{" "}
            <span className="font-medium text-zinc-400">
              {isDateSelected ? "total" : "/ night"}
            </span>
          </p>
          {isDateSelected ? (
            <p className="truncate text-xs text-zinc-400 transition duration-200">
              {hasNights
                ? `${nights} night${nights > 1 ? "s" : ""} · ${formatPrice(pricePerNight)} / night`
                : "Select a valid stay to continue"}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onAction}
          disabled={isDateSelected && isContinueDisabled}
          className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black transition duration-200 hover:bg-gray-200 disabled:cursor-not-allowed disabled:bg-zinc-500 disabled:text-zinc-900"
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}
