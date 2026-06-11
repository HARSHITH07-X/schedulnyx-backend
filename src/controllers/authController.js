import { query } from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Idempotently creates/updates the user row from the verified token, plus an
 * empty profile shell. Called by the client right after Firebase sign-in.
 */
export const syncUser = asyncHandler(async (req, res) => {
  const { uid, email } = req.user;

  const { rows } = await query(
    `INSERT INTO users (id, email)
     VALUES ($1, $2)
     ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email
     RETURNING id, email, created_at, updated_at`,
    [uid, email],
  );

  await query(
    `INSERT INTO profiles (user_id, name)
     VALUES ($1, $2)
     ON CONFLICT (user_id) DO NOTHING`,
    [uid, req.user.name],
  );

  res.status(200).json({ user: rows[0] });
});

/**
 * Returns the authenticated user joined with their profile and onboarding
 * status.
 */
export const getMe = asyncHandler(async (req, res) => {
  const { uid } = req.user;

  const { rows } = await query(
    `SELECT u.id, u.email, u.created_at,
            p.name, p.occupation, p.timezone,
            p.sleep_start, p.sleep_end, p.work_start, p.work_end,
            p.onboarded
     FROM users u
     LEFT JOIN profiles p ON p.user_id = u.id
     WHERE u.id = $1`,
    [uid],
  );

  if (rows.length === 0) {
    return res.status(200).json({ user: null });
  }

  res.status(200).json({ user: rows[0] });
});
