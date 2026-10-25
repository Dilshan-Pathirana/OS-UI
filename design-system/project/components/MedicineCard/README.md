# MedicineCard

MedicineCard lists one dose from the member's Cure prescription with a one-tap check-off.

**Props** — `name` ("Metformin 500 mg"), `detail` ("1 tablet · after breakfast · Dr N. Perera"), `taken`, `takenAt`, `onTake`.

**Data** comes from HMS prescriptions and the dose log (`/hub/members/{id}/medications`, `doses/toggle`). **Do** show the prescribing doctor. **Don't** show dosage advice beyond what the prescription says.
