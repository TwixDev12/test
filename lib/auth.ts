import jwt from "jsonwebtoken";

export type TokenPayload = {
  id: string;
  email: string;
  username: string;
  role: string;
};

export function signToken(payload: TokenPayload) {
  const secret = process.env.JWT_SECRET || "development-only-secret-change-me";
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  const secret = process.env.JWT_SECRET || "development-only-secret-change-me";
  return jwt.verify(token, secret) as TokenPayload;
}
