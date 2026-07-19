// XSS protection for free-text input, in one shared place.
//
// The primary defense already exists structurally: every screen in this app
// renders user-provided text as JSX children (never `dangerouslySetInnerHTML`
// or raw `innerHTML`), and React escapes JSX text content automatically —
// a patient name of `<script>alert(1)</script>` renders as that literal
// string, never as markup. That's not a convention to remember, it's just
// how JSX works, and it covers every field in the app today.
//
// This module is the defense-in-depth layer on top of that: sanitizing
// free-text at the point it's written to storage, so the same guarantee
// holds even for a sink that doesn't go through JSX — a future CSV/PDF
// export, an emailed report, or a regression that introduces
// `dangerouslySetInnerHTML` somewhere. Every hook that persists a free-text
// field (patient name/address, visit notes/diagnosis, group names, the
// prescription letterhead fields, ...) runs it through `sanitizeText` before
// it's stored, alongside the `.trim()` cleanup those hooks already did.

/** Strips characters with no legitimate purpose in user-typed text — C0/C1
 *  control and DEL, excluding tab/newline/carriage-return, which are
 *  legitimate in multi-line fields like notes or an address — then trims
 *  surrounding whitespace. Deliberately does not escape/encode `<`, `>`,
 *  `&`, etc.: those are ordinary, legal characters in a name or note, and
 *  encoding them here would show up mangled everywhere the value is
 *  displayed (JSX already renders them completely inertly, so there's
 *  nothing to protect against by mangling the text). */
export function sanitizeText(value: string): string {
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '').trim()
}

/** HTML-entity-encodes a string for the rare case something needs to build
 *  a raw HTML string outside JSX (e.g. an emailed report, a generated
 *  static page) — nothing in this app does that today, since every screen
 *  renders through JSX, which already escapes on its own. Reach for this
 *  only if that changes. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
