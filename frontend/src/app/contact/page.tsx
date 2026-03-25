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
    <div className="bg-[#0B0B0C] text-white">
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
            Contact Us
          </h1>
          <p className="mt-4 text-base text-gray-400 sm:text-lg">
            We&apos;re here to help you plan your perfect stay
          </p>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <div className="rounded-2xl border border-[#1E1F22] bg-[#111214] p-8">
            <h2 className="text-xl font-semibold text-white">Get in touch</h2>
            <div className="mt-6 space-y-2 text-gray-400">
              <p>Phone: +91 9876543210</p>
              <p>Email: support@hotelbooking.com</p>
              <p>Address: New Delhi, India</p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#1E1F22] bg-[#111214] p-8">
            <h2 className="text-xl font-semibold text-white">Send a message</h2>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Name"
                required
                className="w-full rounded-lg border border-[#1E1F22] bg-[#111214] px-4 py-2 text-white outline-none transition focus:border-white/30"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                className="w-full rounded-lg border border-[#1E1F22] bg-[#111214] px-4 py-2 text-white outline-none transition focus:border-white/30"
              />
              <textarea
                name="message"
                placeholder="Message"
                required
                rows={6}
                className="w-full rounded-lg border border-[#1E1F22] bg-[#111214] px-4 py-2 text-white outline-none transition focus:border-white/30"
              />
              <button
                type="submit"
                className="mt-4 rounded-full bg-white px-6 py-2 text-black transition hover:bg-zinc-200"
              >
                Send Message
              </button>
            </form>

            {isSubmitted ? (
              <p className="mt-4 text-sm text-gray-400">
                Message sent successfully
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm text-gray-400">
            We usually respond within 24 hours
          </p>
        </div>
      </section>
    </div>
  );
}
