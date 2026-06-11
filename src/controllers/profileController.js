import { z } from "zod";

import { query } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { parseOrThrow } from "../utils/validate.js";

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
const timeField = z.string().regex(timeRegex, "Expected HH:MM (24h)").nullish();

const profileSchema = z.object({
  name: z.string().min(1).max(120).nullish(),
  occupation: z.string().max(120).nullish(),
  timezone: z.string().min(1).max(60).optional(),
  sleep_start: timeField,
  sleep_end: timeField,
  work_start: timeField,
  work_end: timeField,
});

export const getProfile = asyncHandler(async (req, res) => {
  const { rows } = await query(
    `SELECT user_id, name, occupation, timezone,
            sleep_start, sleep_end, work_start, work_end, onboarded
     FROM profiles WHERE user_id = $1`,
    [req.user.uid],
  );

  if (rows.length === 0) {
    throw ApiError.notFound("Profile not found. Call /api/auth/sync first.");
  }

  res.status(200).json({ profile: rows[0] });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const data = parseOrThrow(profileSchema, req.body);

  const { rows } = await query(
    `UPDATE profiles SET
        name        = COALESCE($2, name),
        occupation  = COALESCE($3, occupation),
        timezone    = COALESCE($4, timezone),
        sleep_start = COALESCE($5, sleep_start),
        sleep_end   = COALESCE($6, sleep_end),
        work_start  = COALESCE($7, work_start),
        work_end    = COALESCE($8, work_end)
     WHERE user_id = $1
     RETURNING user_id, name, occupation, timezone,
               sleep_start, sleep_end, work_start, work_end, onboarded`,
    [
      req.user.uid,
      data.name ?? null,
      data.occupation ?? null,
      data.timezone ?? null,
      data.sleep_start ?? null,
      data.sleep_end ?? null,
      data.work_start ?? null,
      data.work_end ?? null,
    ],
  );

  if (rows.length === 0) {
    throw ApiError.notFound("Profile not found. Call /api/auth/sync first.");
  }

  res.status(200).json({ profile: rows[0] });
});

/**
 * Marks onboarding as complete. Accepts the same profile fields so the final
 * onboarding step can persist details and flip the flag in one call.
 */
export const completeOnboarding = asyncHandler(async (req, res) => {
  const data = parseOrThrow(profileSchema, req.body ?? {});

  const { rows } = await query(
    `UPDATE profiles SET
        name        = COALESCE($2, name),
        occupation  = COALESCE($3, occupation),
        timezone    = COALESCE($4, timezone),
        sleep_start = COALESCE($5, sleep_start),
        sleep_end   = COALESCE($6, sleep_end),
        work_start  = COALESCE($7, work_start),
        work_end    = COALESCE($8, work_end),
        onboarded   = TRUE
     WHERE user_id = $1
     RETURNING user_id, name, occupation, timezone,
               sleep_start, sleep_end, work_start, work_end, onboarded`,
    [
      req.user.uid,
      data.name ?? null,
      data.occupation ?? null,
      data.timezone ?? null,
      data.sleep_start ?? null,
      data.sleep_end ?? null,
      data.work_start ?? null,
      data.work_end ?? null,
    ],
  );

  if (rows.length === 0) {
    throw ApiError.notFound("Profile not found. Call /api/auth/sync first.");
  }

  res.status(200).json({ profile: rows[0] });
});
