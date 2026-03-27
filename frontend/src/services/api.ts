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

export type CreateBookingPayload = {
  roomId: string;
  userName: string;
  userEmail: string;
  checkIn: string;
  checkOut: string;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
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

export async function getRooms(): Promise<Room[]> {
  return request<Room[]>("/rooms");
}

export async function getRoom(id: string): Promise<Room> {
  return request<Room>(`/rooms/${id}`);
}

export async function createBooking(data: CreateBookingPayload) {
  return request("/book", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
