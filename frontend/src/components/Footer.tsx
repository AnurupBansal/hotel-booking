import Link from "next/link";

const footerLinks = [
  { href: "/rooms", label: "Rooms" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto w-full max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">Mayapur Inspection House</h2>
            <p className="max-w-sm text-gray-600">
              UP Irrigation & Water Resources Department
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Links</h3>
            <nav className="flex flex-col space-y-4 text-gray-600">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="transition hover:text-gray-900"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-6 text-gray-600">© 2026 Mayapur Inspection House</div>
      </div>
    </footer>
  );
}
