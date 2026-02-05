import { NextResponse } from "next/server";
import { Resend } from "resend";

type BookingEmailPayload = {
  to: string;
  booking: {
    contactName?: string;
    date?: string;
    time?: string;
    duration?: string;
    tourTypeLabelEn?: string;
    locationNameEn?: string;
    partySize?: number;
    addons?: {
      guide?: boolean;
      meals?: boolean;
      pickup?: boolean;
    };
    priceTotal?: number;
    notes?: string;
  };
  locale?: "th" | "en";
};

const formatTHB = (value: number) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(value);

const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    return NextResponse.json(
      { error: "Missing RESEND_API_KEY or RESEND_FROM_EMAIL" },
      { status: 500 }
    );
  }

  let payload: BookingEmailPayload;
  try {
    payload = (await request.json()) as BookingEmailPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  if (!payload?.to || !isValidEmail(payload.to)) {
    return NextResponse.json({ error: "Invalid recipient email" }, { status: 400 });
  }
  if (!payload?.booking) {
    return NextResponse.json({ error: "Missing booking data" }, { status: 400 });
  }

  const booking = payload.booking;
  const durationLabel =
    booking.duration === "full"
      ? "Full day"
      : booking.duration === "half"
      ? "Half day"
      : booking.duration ?? "-";
  const addons = booking.addons ?? {};
  const addonsEn = [
    addons.guide ? "Guide" : null,
    addons.meals ? "Meals" : null,
    addons.pickup ? "Pickup" : null,
  ]
    .filter(Boolean)
    .join(", ");

  const text = [
    "Booking details",
    `Name: ${booking.contactName ?? "-"}`,
    `Date: ${booking.date ?? "-"}`,
    `Time: ${booking.time ?? "-"}`,
    `Duration: ${durationLabel}`,
    `Tour type: ${booking.tourTypeLabelEn ?? "-"}`,
    `Location: ${booking.locationNameEn ?? "-"}`,
    `Party size: ${booking.partySize ?? "-"}`,
    `Add-ons: ${addonsEn || "-"}`,
    `Total: ${formatTHB(booking.priceTotal ?? 0)}`,
    `Notes: ${booking.notes ? booking.notes : "-"}`,
  ].join("\n");

  const resend = new Resend(apiKey);
  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: payload.to,
      subject: "Tour booking details",
      text,
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data?.id) {
      return NextResponse.json(
        { error: "Email not accepted by provider." },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to send email",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
