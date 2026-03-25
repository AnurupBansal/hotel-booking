import Link from "next/link";

const footerLinks = [
  { href: "/rooms", label: "Rooms" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="border-t border-[#1E1F22] bg-[#0B0B0C]">
      <div className="mx-auto w-full max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="space-y-4">
            <h2 className="text-white font-semibold">Hotel Booking</h2>
            <p className="max-w-sm text-gray-400">
              Premium stays for your perfect getaway
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-white font-semibold">Links</h3>
            <nav className="flex flex-col space-y-4 text-gray-400">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="transition hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-6 text-gray-400">© 2026 Hotel Booking</div>
      </div>
    </footer>
  );
}
