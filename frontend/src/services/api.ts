const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export type Room = {
  id: string;
  name: string;
  description: string;
  pricePerNight: number;
  maxGuests: number;
  images: string;
  createdAt: string;
  updatedAt: string;
};

export type BookedRange = {
  from: string;
  to: string;
};

export type AvailabilityResponse = {
  booked: BookedRange[];
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const { headers: optionHeaders, ...restOptions } = options ?? {};
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...restOptions,
    headers: {
      "Content-Type": "application/json",
      ...(optionHeaders ?? {}),
    },
  });

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      (typeof payload === "object" &&
        payload !== null &&
        ("message" in payload || "error" in payload) &&
        String(payload.message ?? payload.error)) ||
      "Something went wrong";

    throw new Error(message);
  }

  return payload as T;
}

// ─── Public endpoints ───────────────────────────────────────────────────────

export async function getRooms(): Promise<Room[]> {
  return request<Room[]>("/rooms");
}

export async function getRoom(id: string): Promise<Room> {
  return request<Room>(`/rooms/${id}`);
}

export async function getRoomAvailability(
  roomId: string,
  month: string,
): Promise<AvailabilityResponse> {
  return request<AvailabilityResponse>(
    `/rooms/${roomId}/availability?month=${month}`,
  );
}

// ─── Admin endpoints ────────────────────────────────────────────────────────

export type AdminLoginResponse = {
  token: string;
  admin: { id: string; username: string; name: string };
};

export type Booking = {
  id: string;
  roomId: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string | null;
  checkIn: string;
  checkOut: string;
  amountPaid: number;
  status: string;
  createdAt: string;
  room?: { id: string; name: string };
};

export type CreateBookingPayload = {
  roomId: string;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  checkIn: string;
  checkOut: string;
  amountPaid: number;
};

function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

export async function adminLogin(
  username: string,
  password: string,
): Promise<AdminLoginResponse> {
  return request<AdminLoginResponse>("/admin/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function adminGetMe(
  token: string,
): Promise<{ id: string; username: string; name: string }> {
  return request("/admin/me", { headers: authHeaders(token) });
}

export async function adminGetBookings(
  token: string,
  params?: { roomId?: string; month?: string; status?: string },
): Promise<Booking[]> {
  const query = new URLSearchParams();
  if (params?.roomId) query.set("roomId", params.roomId);
  if (params?.month) query.set("month", params.month);
  if (params?.status) query.set("status", params.status);

  const qs = query.toString();
  return request<Booking[]>(`/admin/bookings${qs ? `?${qs}` : ""}`, {
    headers: authHeaders(token),
  });
}

export async function adminGetBooking(
  token: string,
  id: string,
): Promise<Booking> {
  return request<Booking>(`/admin/bookings/${id}`, {
    headers: authHeaders(token),
  });
}

export async function adminCreateBooking(
  token: string,
  data: CreateBookingPayload,
): Promise<Booking> {
  return request<Booking>("/admin/bookings", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function adminUpdateBooking(
  token: string,
  id: string,
  data: Partial<CreateBookingPayload> & { status?: string },
): Promise<Booking> {
  return request<Booking>(`/admin/bookings/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function adminDeleteBooking(
  token: string,
  id: string,
): Promise<{ message: string }> {
  return request<{ message: string }>(`/admin/bookings/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}
