# Cure Family Hub — TRCSL position note (radio type approval)

*v0.1 draft · 23 Oct 2026 · Phase 6 regulatory · Status: **position for discussion with TRCSL and counsel; nothing here is confirmed by TRCSL**. Sources: `docs/cure-home/reference/MARKET_REGULATORY_RESEARCH.md` §B7 (RTTE Type Approval Rules, the Raspberry Pi 5 letter [41]), `docs/cure-home/01-product/PRODUCT_SPEC.md` §4.3 and P4, `docs/reference/DEVICES_WEARABLES_RESEARCH.md` §3 and §7, `STANDARDS_AND_REGULATIONS.md` §1 and §4. Markers: ⚠ = confirm with TRCSL.*

## 1. Summary

The Family Hub is not a medical device (see `NMRA_CATEGORISATION_REQUEST.md`, function F6) but it is **radio equipment**: it uses Wi-Fi and Bluetooth Low Energy. In Sri Lanka, radio equipment falls under the Telecommunications Regulatory Commission of Sri Lanka (TRCSL) and the RTTE Type Approval Rules (in force since 16 Dec 2020; approvals last 4 years; labelling mandatory). Our position:

1. **Pi 5 hub:** rely on the existing TRCSL letter for the Raspberry Pi 5, which exempts it from type approval at 2.4 and 5 GHz with EIRP under 20 dBm (valid 4 years) [41] — ⚠ confirm that it covers a Pi 5 **built into our enclosure and sold as the Cure Family Hub**, and whether a **Compute Module 5** (CM5 with wireless) carrier design needs its own letter or approval.
2. **Surface Pro hub:** a laptop/tablet PC with embedded Wi-Fi/Bluetooth — the Rules exempt Wi-Fi/BT embedded in PCs [MARKET_REGULATORY_RESEARCH §B7] — ⚠ confirm the exemption applies when we resell it configured as a hub.
3. **Android tablet "Lite":** a consumer tablet whose maker or importer holds the approval; buy only models already type-approved for Sri Lanka (check the TRCSL approved-equipment list) — ⚠ confirm we may supply it pre-configured without a new approval. If the tablet has a cellular modem, the approval must cover it.
4. **Whatever the hardware:** Cure (or its importer) needs a **TRCSL vendor/dealer licence** to import and sell radio equipment, and an application per model; frequency charges may apply [41].
5. **Add-ons with their own radios** (below) each need their own position before they ship in a kit.

## 2. Radios in each hub variant

| Variant (decision D-12) | Radios | Not radios | Approval route (proposed) |
|---|---|---|---|
| **Pi 5 / CM5 hub** (10" Touch Display 2, UVC camera, speaker) | On-board Wi-Fi 2.4/5 GHz and Bluetooth 5.0 / BLE (Pi 5; CM5 "with wireless" SKU) | Camera (USB/UVC), display, microphone, speaker, optional secure element / TPM | Pi 5 TRCSL exemption letter [41] + vendor licence; ⚠ CM5 coverage; ⚠ whether an enclosure/antenna change voids the exemption (keep the on-board antenna, no external antenna in v1) |
| **Surface Pro running Ubuntu** (Cure Home's production test hub) | Embedded Wi-Fi + Bluetooth | USB webcam | PC embedded-radio exemption [§B7]; ⚠ confirm for resale as a configured appliance |
| **Android tablet "Lite"** | Wi-Fi, Bluetooth; possibly LTE | Cameras | Tablet's existing approval; ⚠ confirm for supply as part of a Cure kit |
| Optional **ESPHome Bluetooth proxy** (ESP32) to extend BLE range (`DEVICES_WEARABLES_RESEARCH.md` §6) | 2.4 GHz Wi-Fi/BLE | — | Below 50 mW transmitters are exempt [§B7] — ⚠ confirm and keep a declaration per module; not in pilot kits unless needed |
| Optional **mmWave presence/fall sensor** (60 GHz, e.g. TI IWR6843; later item) | 60 GHz radar transmitter | — | ⚠ ask TRCSL about 57–64 GHz short-range devices; not in pilot kits |
| Optional **4G router / USB modem** for homes without broadband | Cellular | — | Use a TRCSL-approved router supplied by the mobile operator partner (`BUSINESS_MODEL.md` §5); do not import modems ourselves |
| **GPS trackers / 4G watches** (Traccar, R2) — separate devices, not the hub | Cellular (> 50 mW), GNSS receiver | — | Type approval applies to cellular trackers above 50 mW (`DEVICES_WEARABLES_RESEARCH.md` §3); approved models only (R-12); 4G Cat-1/LTE-M, no 3G-only devices |

Third-party Bluetooth measuring devices (cuffs, oximeters, scales, glucometers — `packages/module-catalogue/catalogue/peripherals.yaml`) are low-power BLE transmitters; their importer/distributor holds any approval. ⚠ confirm for devices Cure imports directly.

## 3. Labelling and documents

- TRCSL labelling is mandatory for approved equipment [§B7]: approval/exemption reference on the hub's label or packaging and in the quick-start leaflet (en/si/ta). ⚠ confirm wording, size and whether an e-label on the hub's About screen is accepted.
- Keep per shipped model: the TRCSL letter or approval, the radio module's test reports (Raspberry Pi publishes its compliance documents, including the Sri Lanka letter [41]), the bill of materials showing the radio module is unchanged, and the vendor licence.
- Product-safety labelling (power supply: use the official 27 W PSU or a locally approved adapter) — ⚠ check Sri Lanka Standards Institution (SLSI) requirements for the power adapter.

## 4. Questions for TRCSL

1. Does the Raspberry Pi 5 exemption letter cover a Pi 5 installed in a third-party enclosure and sold as a branded appliance (the Cure Family Hub), unchanged on-board antenna?
2. Does a Compute Module 5 with wireless on our own carrier board need a separate approval or letter? What evidence is required (module test reports, host integration tests)?
3. Is a Microsoft Surface Pro (embedded Wi-Fi/BT, already sold in Sri Lanka) exempt when we resell it pre-configured?
4. May we supply an already type-approved Android tablet as part of a kit without a new approval?
5. Which vendor/dealer licence category applies to importing and leasing hubs, and what are the fees and frequency charges?
6. Labelling: what must appear on the device and packaging; is an electronic label acceptable?
7. Optional add-ons (ESP32 BLE proxy, 60 GHz presence radar): exempt as short-range devices or approval needed?

## 5. Outside Sri Lanka (later)

- **EU:** Radio Equipment Directive (RED) with the delegated-act cybersecurity requirements via **EN 18031-1/2/3** (applicable from 1 Aug 2025), then the **Cyber Resilience Act** (reporting since 11 Sep 2026; full application 11 Dec 2027). The Pi 5 module's RED documentation helps but the finished hub needs its own Declaration of Conformity and an EN 18031 assessment (no default passwords, secure updates, vulnerability handling — already in the Cure Home hub baseline, ETSI EN 303 645). ⚠ counsel.
- **US:** FCC Part 15 (modular approval of the Pi 5 radio; host device labelling).

## 6. Actions

| # | Action | Owner | Needs people? | Status |
|---|---|---|---|---|
| T1 | Fix the pilot hardware mix (D-12) — determines which questions in §4 matter | Dilshan | Yes | Open |
| T2 | Obtain the TRCSL vendor/dealer licence for the importing entity | Ops / company secretary | Yes | Open |
| T3 | Send the §4 questions to TRCSL (letter or meeting); record answers here | Regulatory lead | Yes | Open |
| T4 | Collect the Raspberry Pi 5 Sri Lanka letter [41] and module test reports into the evidence folder | Hardware lead | Yes | Open |
| T5 | Check each Lite tablet model against the TRCSL approved-equipment list before buying | Ops | Yes | Open |
| T6 | Design the hub label and quick-start leaflet text (en/si/ta) with the TRCSL reference | Design + regulatory | Yes | Open |
| T7 | Keep the on-board antenna and radio module unchanged in the enclosure design (no external antenna in v1) | Hardware lead | Yes | Design rule |
| T8 | Before any EU sale: EN 18031 assessment and DoC | Regulatory lead | Yes | Later |

[41] https://pip.raspberrypi.com/categories/894-approvals/documents/RP-005217-CF/rpi-5-Sri-Lanka.pdf (via `MARKET_REGULATORY_RESEARCH.md`).
