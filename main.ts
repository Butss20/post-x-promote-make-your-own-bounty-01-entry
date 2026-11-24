// A working post-x-promote-make-your-own-bounty-01 entry (Node 22, standard library only):
// it copies POST.json from the repository root to /output/POST.json, where the gate reads it.
// That is all the program has to do. The entry is the post itself: one post of your own on X
// that quotes make.fun's make-your-own-bounty post
// (https://x.com/makefunai/status/2124915864336236646) or links to it, a photo of its own
// attached, make.fun or the @makefunai tag and your play code in its text; POST.json names
// the post, and the house reads its replies, reposts and quotes from X. Nothing this program
// writes about the post is scored.
//
// The POST.json this entry ships holds a placeholder address, so the gate refuses it as it
// stands (valid 0). Replace it with your post's address before you submit.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR stand in for
// /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// An X post address, as the gate reads it: https://x.com/<handle>/status/<id> or the same
// on twitter.com, with an optional www. or mobile. prefix, or /i/web/status/<id>, and an
// optional query or fragment after it. The id is digits only. Anything else is refused
// before anything is copied, so a placeholder or a mistyped address can never be handed in
// as if it were the post.
const POST_URL_PATTERN =
  /^https?:\/\/(www\.|mobile\.)?(x\.com|twitter\.com)\/(i\/web\/status\/\d+|[A-Za-z0-9_]+\/status\/\d+)([?#].*)?$/;

mkdirSync(OUTPUT_DIR, { recursive: true });
try {
  const raw = readFileSync(join(BOT_DIR, 'POST.json'), 'utf8');
  const parsed: unknown = JSON.parse(raw);
  const url = (parsed as { url?: unknown }).url;
  if (typeof url !== 'string' || !POST_URL_PATTERN.test(url)) {
    console.error(`POST.json does not name an X post address: ${JSON.stringify(url)}`);
    process.exit(1);
  }
  copyFileSync(join(BOT_DIR, 'POST.json'), join(OUTPUT_DIR, 'POST.json'));
} catch (err) {
  if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
    console.error(`POST.json could not be read from ${BOT_DIR}: ${(err as Error).message}`);
  } else if (err instanceof SyntaxError) {
    console.error(`POST.json is not valid JSON: ${err.message}`);
  } else {
    console.error(`POST.json could not be copied from ${BOT_DIR}: ${(err as Error).message}`);
  }
  process.exit(1);
}
