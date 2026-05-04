import { connectToDatabase, ensureIndexes } from "@/lib/db";
import { verifyMagicLink, createJWT } from "@/lib/auth";
import { User } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");
    const email = url.searchParams.get("email");

    if (!token || !email) {
      return Response.json(
        { error: "Token and email are required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    await ensureIndexes(db);

    const isValid = await verifyMagicLink(db, token, email);

    if (!isValid) {
      return Response.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const user = await db.collection<User>("users").findOne({ email });

    if (!user) {
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const jwtToken = createJWT(user._id!.toString(), email);

    return Response.json(
      { token: jwtToken, email, userId: user._id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verify link error:", error);
    return Response.json(
      { error: "Failed to verify token" },
      { status: 500 }
    );
  }
}
