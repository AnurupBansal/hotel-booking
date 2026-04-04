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
    <div className="bg-white text-gray-900">
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#E8A317]">
            About
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-gray-900 sm:text-5xl md:text-6xl">
            Mayapur Inspection House
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base font-medium text-gray-700 md:text-lg">
            UP Irrigation & Water Resources Department
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-gray-600 md:text-lg">
            A comfortable and dependable stay experience with a simple, minimal interface.
          </p>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-3xl">
          <p className="text-center text-base leading-relaxed text-gray-600 md:text-lg">
            Mayapur Inspection House provides orderly, comfortable accommodation
            designed to support official visits and a smooth guest experience from
            arrival through departure.
          </p>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <h2 className="text-lg font-semibold tracking-tight text-gray-900">
                  {feature.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-4xl rounded-[1.75rem] border border-gray-200 bg-gray-50 px-8 py-12 text-center shadow-sm">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 md:text-3xl">
            Ready to book your stay?
          </h2>
          <Link
            href="/rooms"
            className="mt-8 inline-flex items-center rounded-full bg-gray-900 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-gray-800"
          >
            View Rooms
          </Link>
        </div>
      </section>
    </div>
  );
}
