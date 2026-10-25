# Cure Global — Consent text review checklist (en / si / ta)

*v1.0 draft · 23 Oct 2026 · Phase 6 exit item "consent texts in en/si/ta reviewed by counsel and clinicians" (`ROADMAP.md` Phase 6; `STANDARDS_AND_REGULATIONS.md` §5). Lists every consent purpose the platform records, where each text lives today, who reviews it and what to check. The consent model itself: `PRIVACY_CONSENT_SECURITY.md` §2. A text is **approved** only when every row of its sign-off table (§5) is filled for all three languages and the policy version is published through the admin console (`POST /api/v1/admin/consent-policies`).*

## 1. Status today

- Purposes are fixed in code: `services/api/app/consent/sharing.py` `PURPOSES` (11); methods in `METHODS` (`self`, `guardian`, `assisted_staff`, `assisted_family`, `best_interest_proxy`).
- The demo seed (`services/api/app/seed.py` `POLICIES`) creates **placeholder** policies for 9 purposes, jurisdiction LK, version `2026-10-…-1`: `texts.en` = "[version] placeholder text — final wording by counsel", `texts.si` and `texts.ta` = `None`. `research` and `marketing` have no policy at all (off by default; nothing can be consented to until a text exists — `current_policy()` returns 409 `consent-policy-missing`).
- Policy texts are stored in `consent_policy.texts` (JSONB per language) and managed in Super Admin → Consent policies (`apps/admin-web/src/pages/ConsentPoliciesPage.tsx`), which shows per language whether a text is present and lists people needing re-consent after a material change (`GET /api/v1/admin/consent-policies/reconsent`).
- Surface texts that explain a consent at the point of asking live in dictionaries, not in the policy row: hub `packages/i18n/src/{en,si,ta}.ts` (`cons.*`, used by `apps/hub-ui/src/features/family/EnrolScreen.tsx`); app `apps/mobile/src/i18n/{en,si,ta}.ts` (`photo.consent*`, `priv.*`) and `apps/mobile/src/legal/documents.ts` (privacy policy and terms).

### 1.1 Problems found while preparing this checklist

| # | Where | Problem | Fix |
|---|---|---|---|
| P-1 | `packages/i18n/src/*.ts` `cons.faceIntro`, `cons.disclaimer`; `apps/mobile/src/i18n/*.ts` `photo.consentBody` | Say "Cure Home" (the earlier product) | Use the Cure Global hub name decided for the pilot |
| P-2 | `packages/i18n/src/en.ts` `cons.face3` ("Others in the family cannot see them") | Not true in Cure Global: family admins see an adult's readings when the adult granted it, and guardians see children's | Reword: "Being recognised only decides whose readings are shown. Who else can see them is set in 'What can the family see?'." |
| P-3 | `apps/mobile/src/legal/documents.ts` | Privacy policy of the Cure Patient app: "We do not collect your location", "Clinical records from your Cure visits", withdrawal "by deleting your account" | Rewrite for Cure Global (location tracking exists in R2; withdrawal per purpose in settings) with the mobile rebrand (E16-01) |
| P-4 | Seed policies | si/ta missing; en placeholders | Write and review per this checklist; load as new versions |
| P-5 | No policy rows for `research`, `marketing` | Fine while unused; keep them absent until there is a reviewed text and a DPIA addendum | — |

## 2. Purposes and their texts

| Purpose | Asked when / by whom | Text location (policy row + surface strings) | Special rules the text must state | Reviewers |
|---|---|---|---|---|
| `platform_terms` | Registration, by the account holder | `consent_policy` (`2026-10-terms-1`); app terms (`apps/mobile/src/legal/documents.ts` TERMS) | Not an emergency service (1990 in Sri Lanka); not monitored 24/7; no diagnosis | Counsel, DPO |
| `health_data` | Registration and when adding a dependant; guardian for < 16 | `consent_policy` (`2026-10-health-1`) | Explicit consent for special-category data; what is collected; that doctors chosen by the family can see it only with `share_with_care_team` | Counsel, DPO, clinician |
| `share_with_family` | "What can the family see?" step when an adult joins a family | `consent_policy` (`2026-10-family-1`); preset cards (`packages/ui-web/src/form/Controls.tsx`, app onboarding) | Presets Everything / Essentials / Nothing / custom; **reproductive health and mental wellbeing are separate opt-ins, never in "Everything"**; family admins only; withdraw at any time without the admin's approval; withdrawing revokes the grants at once | Counsel, DPO, clinician |
| `share_with_care_team` | Linking a doctor (care request) | `consent_policy` (`2026-10-care-1`) | Which categories that doctor's role sees; ending the care-team link ends access | Counsel, DPO, clinician |
| `biometric_face` | Face sign-in setup on the hub; guardian for a child | `consent_policy` (`2026-10-bio-1`); hub `cons.face*`, `cons.guardian*` | **Face data never leaves the hub**; numbers not photos; camera pictures never saved; optional (picture + PIN instead); "Forget me" deletes at once; **infants are never enrolled**; recognition is not a password for sensitive actions | Counsel, DPO, native-speaker clinicians |
| `profile_photo` | Uploading a profile photo used as the face reference | `consent_policy` (`2026-10-photo-1`); app `photo.consentTitle/Body` | Photo stored privately; the hub turns it into a face code kept only on the hub; turning off removes the code | Counsel, DPO |
| `location_tracking` | Pairing a GPS watch or phone location (R2); proxy only on a recorded best-interest decision | `consent_policy` (`2026-10-loc-1`) | Geofence events, not continuous tracks; raw positions kept ≤ 30 days; who is told; requests for current position are audited and the person is told; safety-concern route for anyone who feels watched | Counsel, DPO, clinician (elder / special needs) |
| `hub_display` | Per module, "Show my pregnancy on the hub" etc. | `consent_policy` (`2026-10-hub-1`) | Everyone in the room can see it; per module; **for teen-confidential data only the teen's own consent counts**; switch off any time | Counsel, DPO, obstetric clinician |
| `teen_confidentiality` | 16–17 acknowledgement; 13–15 request approved by a doctor | `consent_policy` (`2026-10-teen-1`) | From 16 (LK `teen_confidentiality_age`) reproductive health, wellbeing, questionnaires and confidential messages are private from guardians, who see no trace; 13–15 only with a doctor's approval; at 18 everything becomes the person's own | Counsel, DPO, paediatric / adolescent clinician |
| `research` | Not used in the MVP | none | Separate, off by default, ethics approval, de-identified | Counsel, DPO, ethics committee |
| `marketing` | Not used in the MVP | none | Separate, off by default, never health data | Counsel, DPO |

## 3. Checklist (apply to every text, in every language)

| # | Check | en | si | ta |
|---|---|---|---|---|
| C-1 | **Plain language**: short sentences, one idea each; target reading age ≈ 12 years (adult texts) / ≈ 10 years (teen texts); no legal Latin; medical terms only where needed and explained | ☐ | ☐ | ☐ |
| C-2 | **Purpose-specific**: the text covers one purpose only; it is not bundled with terms or another consent | ☐ | ☐ | ☐ |
| C-3 | **What data, who sees it, why**: categories named the way the app names them; recipients named by role (family admins, care-team doctors, people in the room for the hub) | ☐ | ☐ | ☐ |
| C-4 | **Withdrawal** explained: how (the exact settings path on app and hub), that it takes effect everywhere, what stops, what is kept (consent evidence; records already shared with a doctor stay in their notes) | ☐ | ☐ | ☐ |
| C-5 | **Teen rules** (16–17): what becomes private from guardians; guardians see no trace; at 18 the person re-confirms consents given by guardians | ☐ | ☐ | ☐ |
| C-6 | **Guardian consent for under-16s**: the text addresses the guardian ("you agree for {name}"); joint-guardian rule where the country pack requires it | ☐ | ☐ | ☐ |
| C-7 | **Assisted and best-interest methods**: assisted consent (staff or family helping) is attested and the person is told; a proxy's best-interest decision records who, when, why; location only on a recorded decision | ☐ | ☐ | ☐ |
| C-8 | **Hub display**: everyone in the room can see; per module; teen-confidential only by the teen | ☐ | ☐ | ☐ |
| C-9 | **Biometrics**: face data never leaves the hub; not a photo; delete at once; optional; infants never | ☐ | ☐ | ☐ |
| C-10 | **Location**: events not tracks, ≤ 30 days of raw positions, audit + notice on position requests, safety-concern route | ☐ | ☐ | ☐ |
| C-11 | **Research and marketing** are separate and off by default; nothing in other texts implies them | ☐ | ☐ | ☐ |
| C-12 | **No diagnosis claims** (ADR-0012): no promise of monitoring, diagnosis or emergency response; "not monitored 24/7"; emergency number 1990 | ☐ | ☐ | ☐ |
| C-13 | **Version and material flag**: version string set; `material = true` if the change widens use or recipients (everyone is asked again); effective date | ☐ | ☐ | ☐ |
| C-14 | **Translation fidelity**: si/ta translated from the approved en text by a native speaker, back-translated or reviewed by a second native speaker; medical terms reviewed by a native-speaker clinician (CLAUDE.md rule 13) | — | ☐ | ☐ |
| C-15 | **Fits the screen**: shown in full on the hub (kiosk font sizes) and the app at the largest accessibility text size; no truncation | ☐ | ☐ | ☐ |
| C-16 | **Consistent with the privacy notice, `ROPA.md` and `DPIA.md`** (same retention periods, same recipients) | ☐ | ☐ | ☐ |
| C-17 | **Accessible**: screen-reader order; read-aloud on the hub where the hub offers voice | ☐ | ☐ | ☐ |

## 4. Process

1. Product drafts en from §2 and the surface (screen) the text is shown on.
2. Counsel and DPO review en (C-1…C-13, C-16).
3. Native-speaker translators produce si and ta; native-speaker clinicians review medical terms (C-14).
4. Usability check with 3–5 people per language (elders, parents, teens with a guardian's agreement) during the summative usability sessions (C-1, C-15, C-17).
5. Super admin publishes the new version in the console (effective date, material flag); the console's re-consent list shows who will be asked again.
6. Record the sign-offs below; keep the reviewed texts with this checklist in document control.

## 5. Sign-off per purpose and language

Copy this table once per purpose (11 tables). A purpose is approved when all cells are filled.

**Purpose:** `________________` · **Policy version:** `________________` · **Material:** yes / no · **Effective from:** `____-__-__`

| Review | en — name | en — date | si — name | si — date | ta — name | ta — date |
|---|---|---|---|---|---|---|
| Counsel | | | | | | |
| DPO | | | | | | |
| Native-speaker translator | — | — | | | | |
| Native-speaker clinician (medical terms) | | | | | | |
| Usability check done (sessions ref.) | | | | | | |
| Published in console (super admin) | | | | | | |

## 6. Summary tracker

| Purpose | en | si | ta | Approved |
|---|---|---|---|---|
| `platform_terms` | placeholder | missing | missing | ☐ |
| `health_data` | placeholder | missing | missing | ☐ |
| `share_with_family` | placeholder | missing | missing | ☐ |
| `share_with_care_team` | placeholder | missing | missing | ☐ |
| `biometric_face` | placeholder (hub strings drafted, P-1/P-2) | hub strings drafted | hub strings drafted | ☐ |
| `profile_photo` | placeholder (app strings drafted, P-1) | app strings drafted | app strings drafted | ☐ |
| `location_tracking` | placeholder | missing | missing | ☐ |
| `hub_display` | placeholder | missing | missing | ☐ |
| `teen_confidentiality` | placeholder | missing | missing | ☐ |
| `research` | none (unused) | — | — | n/a |
| `marketing` | none (unused) | — | — | n/a |
