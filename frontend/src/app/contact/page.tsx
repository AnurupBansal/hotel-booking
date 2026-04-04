"use client";

import { FormEvent, useState } from "react";

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitted(true);
    event.currentTarget.reset();
  }

  return (
    <div className="bg-white text-gray-900">
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-semibold tracking-[-0.04em] text-gray-900 sm:text-5xl">
            Mayapur Inspection House
          </h1>
          <p className="mt-4 text-base font-medium text-gray-700 sm:text-lg">
            UP Irrigation & Water Resources Department
          </p>
          <p className="mt-3 text-base text-gray-600 sm:text-lg">
            We&apos;re here to help you plan your stay
          </p>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">Get in touch</h2>
            <div className="mt-6 space-y-2 text-gray-600">
              <p>Phone: +91 9876543210</p>
              <p>Email: support@hotelbooking.com</p>
              <p>Address: New Delhi, India</p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">Send a message</h2>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Name"
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none transition focus:border-gray-900/30"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none transition focus:border-gray-900/30"
              />
              <textarea
                name="message"
                placeholder="Message"
                required
                rows={6}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none transition focus:border-gray-900/30"
              />
              <button
                type="submit"
                className="mt-4 rounded-full bg-gray-900 px-6 py-2 text-white transition hover:bg-gray-800"
              >
                Send Message
              </button>
            </form>

            {isSubmitted ? (
              <p className="mt-4 text-sm text-gray-600">
                Message sent successfully
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm text-gray-600">
            We usually respond within 24 hours
          </p>
        </div>
      </section>
    </div>
  );
}
