import { devAuthEnabled, firebaseConfigured } from "../config/env.js";
import { verifyIdToken } from "../config/firebase.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function extractBearerToken(req) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme === "Bearer" && token) return token;
  return null;
}

/**
 * Authenticates a request using a Firebase ID token in the Authorization
 * header. When Firebase is not yet configured and dev auth is enabled, an
 * `x-dev-uid` header is accepted instead so the API can be exercised locally.
 *
 * On success, `req.user` is populated with `{ uid, email, name }`.
 */
export const authenticate = asyncHandler(async (req, _res, next) => {
  const token = extractBearerToken(req);

  if (firebaseConfigured) {
    if (!token) throw ApiError.unauthorized("Missing bearer token");
    try {
      const decoded = await verifyIdToken(token);
      req.user = {
        uid: decoded.uid,
        email: decoded.email || null,
        name: decoded.name || null,
      };
      return next();
    } catch {
      throw ApiError.unauthorized("Invalid or expired token");
    }
  }

  if (devAuthEnabled) {
    const devUid = req.headers["x-dev-uid"];
    if (!devUid) {
      throw ApiError.unauthorized(
        "Firebase is not configured. Provide an 'x-dev-uid' header in dev mode.",
      );
    }
    req.user = {
      uid: String(devUid),
      email: req.headers["x-dev-email"]
        ? String(req.headers["x-dev-email"])
        : `${devUid}@dev.local`,
      name: req.headers["x-dev-name"] ? String(req.headers["x-dev-name"]) : null,
    };
    return next();
  }

  throw ApiError.unauthorized("Authentication is not available");
});
