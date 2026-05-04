import { connectToDatabase, ensureIndexes } from "@/lib/db";
import { createOrGetUser, createMagicLink } from "@/lib/auth";
import { sendMagicLink } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return Response.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    await ensureIndexes(db);

    await createOrGetUser(db, email);
    const token = await createMagicLink(db, email);

    await sendMagicLink(email, token);

    return Response.json(
      { message: "Magic link sent to your email" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Request link error:", error);
    return Response.json(
      { error: "Failed to send magic link" },
      { status: 500 }
    );
  }
}
