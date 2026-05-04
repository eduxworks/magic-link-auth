import { verifyJWT } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json(
        { error: "No authorization token" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyJWT(token);

    if (!decoded) {
      return Response.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    return Response.json(
      { userId: decoded.userId, email: decoded.email },
      { status: 200 }
    );
  } catch (error) {
    console.error("Auth me error:", error);
    return Response.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
