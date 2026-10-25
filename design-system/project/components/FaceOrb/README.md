# FaceOrb

FaceOrb is the centre of Orbit View: a 320 px circular crop of the member's own face from the camera, with the recognition ring around it.

**Props** — `state`: `scanning` (blue arc grows with `progress`), `recognized` (full `cure-green` ring + check badge), `unknown` (grey ring; guest mode), `idle`; `progress` (0–1); `size`. With no Cure photo (or Mirror off, shutter closed, the PIN path) the centre shows the default avatar: a plain grey person on white — no initials.

**In the product** the face comes from the live camera texture drawn in the WebGL layer; this preview shows the privacy silhouette.
**Do** crop to the face only. **Don't** show the body, store the frame, or cover the orb with other UI.
