# ADR-0012: Family surfaces never interpret readings

*Status: proposed · Date: 2026-10-22 (revised after review the same day) · Deciders: Dilshan Pathirana*

## Context
Inherited from Cure Home (CLAUDE.md rule 4) and extended to the app and all modules (growth, pregnancy, cycles).

## Decision
- **What families see:** values, trends, sources and the doctor's own targets, with fixed words:
  - ● Within your target
  - ▲ Above/Below your target
  - ! Talk to your doctor (when configured)
  - ? Check this reading — only for impossible values and unit mix-ups
- **Growth charts:** neutral WHO reference curves, with no colour zones or percentile labels.
- **No interpretive views against population norms.** For example, no "irregular cycle" label.
- **Alert rules run on the server.** Clinicians set clinical rules. Family admins set safety rules: check-ins, geofences and SOS.
- **Two narrow exceptions**, both recorded and tested:
  1. **Clinician-enabled references.** A clinician may switch on, for one person, a reference that compares against population norms:
     - percentile labels or z-score bands on a growth chart
     - the IOM weight-gain band in pregnancy
     - a CHDR-style growth interpretation

     Once switched on, it is shown as that doctor's target ("set by Dr X"), with the same fixed words.
  2. **Safety-net texts.** A closed register of CSO-approved texts (`CLINICAL_SAFETY.md` §4.1) may appear when:
     - a value falls in a metric's `urgent` band
     - a static rule fires (fever of 38 °C or more in a baby under 3 months)
     - pregnancy BP is in the severe range and no clinician has set attention levels

     These texts say what to do (measure again, call 1990, go to hospital). They never say what the value means.

## Consequences
- Pro: Reduces alarm fatigue and harm from wrong thresholds.
- Pro: The family display stays close to store-and-display.
- Con: Comparing values with targets and the server's alerting are still clinical decision-support functions. `STANDARDS_AND_REGULATIONS.md` §1 assesses them on their own terms; they are not exempt because of this ADR.
- Con: Families without a doctor see trends and the safety net only. The product nudges them to add a doctor, or their clinic as an external contact.

## Alternatives considered
- Population thresholds on family screens: regulatory and safety risk.
- No safety net at all: a parent could dismiss real hypoxia as a device error (HZ-18).
