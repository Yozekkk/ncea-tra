import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const credentialsPath = resolve(process.cwd(), ".env.admin-bootstrap.local");
const values = Object.fromEntries(
  readFileSync(credentialsPath, "utf8")
    .split(/\r?\n/)
    .filter((line) => line.trim() && !line.trim().startsWith("#"))
    .map((line) => {
      const separator = line.indexOf("=");
      return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
    }),
);

const email = values.ADMIN_EMAIL;
const password = values.ADMIN_PASSWORD;
const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!email || !password)
  throw new Error("Bootstrap file must contain ADMIN_EMAIL and ADMIN_PASSWORD");
if (!url || !key) throw new Error("Public Supabase runtime variables are missing");

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});
let result = await supabase.auth.signInWithPassword({ email, password });
if (result.error) {
  const base = email
    .split("@")[0]
    .replace(/[^A-Za-z0-9_.-]/g, "")
    .slice(0, 32);
  const username = base.length >= 3 ? base : `admin_${crypto.randomUUID().slice(0, 8)}`;
  const { error: registrationError } = await supabase.functions.invoke("register-account", {
    body: { email, password, username },
    headers: { Origin: "https://www.ncea-studio.com" },
  });
  if (registrationError) throw new Error("Owner bootstrap registration failed");
  result = await supabase.auth.signInWithPassword({ email, password });
  if (result.error) throw new Error("Owner bootstrap login failed");
}
if (!result.data.user) throw new Error("Owner bootstrap did not return a user ID");
process.stdout.write(`${result.data.user.id}\n`);
