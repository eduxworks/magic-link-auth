import crypto from "crypto";
import { Db } from "mongodb";
import { MagicLink, User } from "./types";

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function createOrGetUser(db: Db, email: string): Promise<User> {
  const usersCollection = db.collection<User>("users");

  let user = await usersCollection.findOne({ email });

  if (!user) {
    const result = await usersCollection.insertOne({
      email,
      createdAt: new Date(),
    });

    user = await usersCollection.findOne({ _id: result.insertedId });
    if (!user) throw new Error("Failed to create user");
  }

  return user;
}

export async function createMagicLink(db: Db, email: string): Promise<string> {
  const magicLinksCollection = db.collection<MagicLink>("magic_links");
  const token = generateToken();

  const expiryMinutes = parseInt(process.env.TOKEN_EXPIRY || "15", 10);
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  await magicLinksCollection.insertOne({
    token,
    email,
    expiresAt,
    used: false,
  });

  return token;
}

export async function verifyMagicLink(
  db: Db,
  token: string,
  email: string
): Promise<boolean> {
  const magicLinksCollection = db.collection<MagicLink>("magic_links");

  const magicLink = await magicLinksCollection.findOne({
    token,
    email,
    used: false,
  });

  if (!magicLink) {
    return false;
  }

  if (magicLink.expiresAt < new Date()) {
    return false;
  }

  await magicLinksCollection.updateOne(
    { _id: magicLink._id },
    { $set: { used: true } }
  );

  return true;
}

export function createJWT(userId: string, email: string): string {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    userId,
    email,
    iat: Math.floor(Date.now() / 1000),
  };

  const secretKey = process.env.SECRET_KEY || "default-secret";

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verifyJWT(token: string): { userId: string; email: string } | null {
  const secretKey = process.env.SECRET_KEY || "default-secret";

  try {
    const [encodedHeader, encodedPayload, signature] = token.split(".");

    const expectedSignature = crypto
      .createHmac("sha256", secretKey)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest("base64url");

    if (signature !== expectedSignature) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString()
    );
    return { userId: payload.userId, email: payload.email };
  } catch (error) {
    return null;
  }
}
