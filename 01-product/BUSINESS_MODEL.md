# Cure Global — Business model

*v0.1 · 22 Oct 2026 · Hypotheses to test in the pilot. Prices are placeholders for structure; set them after the pilot and a cost model per country.*

## 1. Customers and what they buy

| Segment | Who pays | Job to be done | Offer |
|---|---|---|---|
| **Families (B2C)** | The family owner, often an adult child | "Keep everyone's health in one place and know my parents and kids are OK" | App plans; hub bundle or lease; GPS tracker add-on |
| **Remote caregivers (B2C, diaspora)** | Sri Lankans working or living abroad, paying for parents at home | "See that Amma checked her BP and took her medicine; be told if something is wrong" | Caregiver plan; hub + cuff installed at the parents' home; GPS watch |
| **Doctors and clinics (B2B2C)** | Clinics, Cure branches, private practitioners | "Follow my patients between visits without phone calls" | Practice seats; programme fees (hypertension, diabetes, pregnancy, elder care) shared with the platform |
| **Corporates and insurers (B2B, later)** | Employers, insurers | Healthier members, fewer claims | Group plans, aggregated (anonymised) programme outcomes with separate consent |
| **Hospitals (B2B, later)** | Hospital groups | Discharge follow-up, maternity, paediatrics | Licensed programmes and HMS/EHR integration |

## 2. Plans (structure)

| Plan | Includes | Notes |
|---|---|---|
| **Free** | One family, up to 6 members, manual entry, vaccine records, documents (limited storage), one doctor link | Acquisition; data always exportable |
| **Family** | Unlimited members, BLE devices, Health Connect, reminders for everyone, full modules (pregnancy, child, elder, special needs), 5 GB documents | Monthly or yearly |
| **Family + Hub** | Family plan + Family Hub (lease or purchase), installation, device kit (scale + validated cuff), replacement within 48 h | Lease recovers hardware over 18–24 months (Cure Home model) |
| **Care** | Family + Hub + doctor review programme (review cadence, coordinator follow-up) | Revenue shared with the doctor/clinic |
| **Safety add-on** | GPS watch/pendant + SIM data + safety module | Per tracker per month |
| **Practice** | Doctor seats, panel analytics, programme tools | Per seat per month; free for doctors linked by families in the pilot |

**Never:** selling health data, advertising based on health data, locking people out of their records when they stop paying (lapse = read-only + export).

## 3. Revenue and cost structure

| Revenue | Cost |
|---|---|
| Subscriptions (family, care, safety) | Cloud hosting (database, storage, compute) per active family |
| Hub lease/sales, device kits | Hub BOM (Cure Home estimate ≈ USD 270–300 for the Pi 10" build before peripherals; Android-tablet "Lite" far lower), peripherals (validated cuff, scale), logistics, import duty |
| Practice seats, programme fees | Doctor review fees (share), coordinators |
| Corporate/insurer contracts (later) | Support (WhatsApp/phone), installation |
| | SMS/push/email, GPS SIM data |
| | Compliance (DPO, audits, pen tests, ISO certification) |

**Unit economics to model in the pilot:** cost per active family per month (cloud + messaging + support), hardware payback months, doctor review minutes per member per month, churn by plan, attach rate of hub and safety add-ons.

## 4. Go-to-market (Sri Lanka first)

1. **Pilot (MVP):** 50–100 families, recruited through Cure branches and Dilshan's network; mix of life stages (≥ 20 infants/children, ≥ 20 elders, ≥ 10 pregnancies, ≥ 5 special-needs members); 5–10 doctors (family physicians, a paediatrician, an obstetrician); 20–30 hubs.
2. **Diaspora channel:** campaigns to Sri Lankans abroad ("Look after Amma from Dubai"), installation partners in Sri Lanka, payment from abroad.
3. **Clinics:** Cure branches first (existing patients and doctors), then private GPs and paediatricians; the doctor console is the hook.
4. **Pharmacies and device retailers:** kits and hubs (later).
5. **Next markets:** countries with similar family structures and diaspora flows (regional South Asia, Gulf for diaspora services) — each needs a country pack, local hosting decision and regulatory review.

Marketing content follows the existing Cure compliance rules (no diagnosis or accuracy claims beyond the certified peripherals).

## 5. Partnerships

| Partner | Why |
|---|---|
| Medical devices distributor (NMRA-registered) | Validated BP cuffs (incl. pregnancy-validated), scales, oximeters, thermometers, glucometers |
| Mobile operator | Data SIMs for GPS trackers and hubs without broadband |
| Cure HMS / Cure branches | Doctors, programmes, appointment and prescription data (connector, R3) |
| Professional bodies | Doctor verification (medical council register), clinical content review |
| Insurers / employers | Group plans (later) |

## 6. KPIs

| Area | KPI |
|---|---|
| Growth | Families created, members per family, % with ≥ 1 linked doctor |
| Engagement | Weekly active families, readings per active member per week, hub daily uses |
| Clinical loop | Members reviewed in last 30 days, median time from urgent alert to doctor acknowledgement |
| Child health | Vaccine records complete; growth measurements per child per quarter |
| Safety | Check-in adherence; alert acknowledgement time |
| Revenue | ARPU per family, hub attach rate, churn, payback months |
| Trust | Consent withdrawal rate, privacy complaints, DSAR turnaround |
