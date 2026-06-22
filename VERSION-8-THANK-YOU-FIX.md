# Version 8 Thank You Fix

Fix included:
- Form action changed to `/thank-you/`.
- Added `/thank-you/index.html`.
- Kept `thank-you.html` as backup.
- Added `_redirects` fallback from `/thank-you.html` and `/thanks` to `/thank-you/`.

After upload:
1. Wait for Netlify deploy to show Published.
2. Open `/thank-you/` directly on the Netlify preview.
3. Submit the Request Service form again.
4. Confirm the submission appears under Netlify Forms.
