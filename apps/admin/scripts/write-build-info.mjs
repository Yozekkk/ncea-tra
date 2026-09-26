import process from "node:process";
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
const sha =
  process.env.VERCEL_GIT_COMMIT_SHA ||
  execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
if (!/^[a-f0-9]{40}$/.test(sha))
  throw new Error("A valid Git revision is required for build verification.");
mkdirSync("public", { recursive: true });
writeFileSync("public/build-info.json", JSON.stringify({ sha }) + "\n");
