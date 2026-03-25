import Link from "next/link";

const features = [
  {
    title: "Premium Rooms",
    description:
      "Thoughtfully designed spaces with refined finishes, soft lighting, and every essential detail in place.",
  },
  {
    title: "Easy Booking",
    description:
      "A smooth reservation experience that keeps every step simple, transparent, and effortless.",
  },
  {
    title: "24/7 Support",
    description:
      "Warm, responsive assistance at any hour so your stay feels seamless from check-in to departure.",
  },
  {
    title: "Best Price Guarantee",
    description:
      "Exceptional value paired with premium comfort, giving you confidence in every booking decision.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-[#0B0B0C] text-white">
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#E8A317]">
            Our Story
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl md:text-6xl">
            About Us
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-gray-400 md:text-lg">
            Crafting memorable stays with comfort and elegance
          </p>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-3xl">
          <p className="text-center text-base leading-relaxed text-gray-400 md:text-lg">
            We create a premium hotel experience shaped by comfort,
            simplicity, and quiet elegance. Every detail is designed to make
            guests feel at ease, from intuitive booking to refined spaces that
            balance warmth, style, and effortless hospitality.
          </p>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-xl border border-[#1E1F22] bg-[#111214] p-6 shadow-[0_14px_40px_rgba(0,0,0,0.22)]"
              >
                <h2 className="text-lg font-semibold tracking-tight text-white">
                  {feature.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-gray-400">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-4xl rounded-[1.75rem] border border-[#1E1F22] bg-[#111214] px-8 py-12 text-center shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
          <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Ready to book your stay?
          </h2>
          <Link
            href="/rooms"
            className="mt-8 inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-medium text-black shadow-[0_10px_28px_rgba(255,255,255,0.08)] hover:bg-zinc-200"
          >
            View Rooms
          </Link>
        </div>
      </section>
    </div>
  );
}
