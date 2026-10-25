# VisitCard

VisitCard shows the next Cure appointment and, on the day, the live queue: your token, now serving, and how many are ahead.

**Props** — `doctor`, `specialty`, `when`, `place`, `token`, `nowServing`.

**Data** from HMS appointments and the session queue (refresh every 30 s on visit day). Patients ahead = token − now serving − 1. **Do** add a "Leave now" nudge 45 minutes before the estimated turn. **Don't** promise exact times.
