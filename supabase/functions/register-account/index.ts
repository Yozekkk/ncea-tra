import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.115.0";

const allowedOrigins = new Set([
  "https://www.ncea-studio.com",
  "https://ncea-studio.com",
  "https://ncea-tra.vercel.app",
  "https://ncea-tra-rose.vercel.app",
  "https://ncea-tra-admin-panel-hunmaster.vercel.app",
]);

function isAllowedOrigin(origin: string) {
  if (allowedOrigins.has(origin)) return true;
  if (/^https:\/\/(?:ncea|ncea-tra)-[a-z0-9-]+-admin-panel-hunmaster\.vercel\.app$/.test(origin))
    return true;
  return /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
}

function response(
  origin: string,
  status: number,
  body: Record<string, unknown>,
  extraHeaders: Record<string, string> = {},
) {
  return new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": origin,
      "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-max-age": "600",
      "cache-control": "no-store",
      vary: "Origin",
      ...extraHeaders,
    },
  });
}

async function hashRateLimitKey(secret: string, value: string) {
  const bytes = new TextEncoder().encode(`${secret}:${value}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function isCompromisedPassword(password: string) {
  const digest = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(password));
  const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
  const response = await fetch(`https://api.pwnedpasswords.com/range/${hash.slice(0, 5)}`, {
    headers: {
      "Add-Padding": "true",
      "User-Agent": "NCEA-registration-security",
    },
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error(`Pwned Passwords returned ${response.status}`);
  const suffix = hash.slice(5);
  return (await response.text()).split(/\r?\n/).some((line) => {
    const [candidate, count] = line.split(":");
    return candidate === suffix && Number(count) > 0;
  });
}

Deno.serve(async (request) => {
  const origin = request.headers.get("origin") ?? "";
  if (!isAllowedOrigin(origin)) {
    return new Response(JSON.stringify({ error: "origin_not_allowed" }), {
      status: 403,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }
  if (request.method === "OPTIONS") return response(origin, 204, {});
  if (request.method !== "POST") return response(origin, 405, { error: "method_not_allowed" });

  let input: { username?: unknown; email?: unknown; password?: unknown };
  try {
    input = await request.json();
  } catch {
    return response(origin, 400, { error: "invalid_request" });
  }

  const username = typeof input.username === "string" ? input.username.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const password = typeof input.password === "string" ? input.password : "";
  if (!/^[A-Za-z0-9_.-]{3,32}$/.test(username)) {
    return response(origin, 400, { error: "invalid_username" });
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return response(origin, 400, { error: "invalid_email" });
  }
  if (password.length < 8 || password.length > 72) {
    return response(origin, 400, { error: "invalid_password" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return response(origin, 503, { error: "unavailable" });

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const clientAddress = request.headers.get("cf-connecting-ip") ?? forwardedFor ?? "unknown";
  const [ipKey, emailKey] = await Promise.all([
    hashRateLimitKey(serviceRoleKey, `ip:${clientAddress}`),
    hashRateLimitKey(serviceRoleKey, `email:${email}`),
  ]);
  const [{ data: ipAllowed, error: ipRateError }, { data: emailAllowed, error: emailRateError }] =
    await Promise.all([
      admin.rpc("consume_registration_attempt", { _key_hash: ipKey, _limit: 10 }),
      admin.rpc("consume_registration_attempt", { _key_hash: emailKey, _limit: 3 }),
    ]);
  if (ipRateError || emailRateError) return response(origin, 503, { error: "unavailable" });
  if (!ipAllowed || !emailAllowed)
    return response(origin, 429, { error: "rate_limited" }, { "retry-after": "3600" });

  try {
    if (await isCompromisedPassword(password))
      return response(origin, 400, { error: "compromised_password" });
  } catch {
    return response(origin, 503, { error: "password_check_unavailable" });
  }

  const { data: existingUsername, error: lookupError } = await admin
    .from("profiles")
    .select("id")
    .ilike("username", username)
    .limit(1);
  if (lookupError) return response(origin, 503, { error: "unavailable" });
  if (existingUsername?.length) return response(origin, 409, { error: "username_taken" });

  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username },
  });
  if (error) {
    if (/already|registered|exists/i.test(error.message)) {
      return response(origin, 409, { error: "account_exists" });
    }
    if (/password/i.test(error.message))
      return response(origin, 400, { error: "invalid_password" });
    return response(origin, 503, { error: "registration_failed" });
  }

  return response(origin, 201, { ok: true });
});
