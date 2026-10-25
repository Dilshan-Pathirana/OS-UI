# ADR-0011: Sensitive modules never render on the shared hub, unless the person opts in

*Status: proposed · Date: 2026-10-22 (revised after review the same day) · Deciders: Dilshan Pathirana*

## Context
The hub is a shared screen in a living room; face identification does not make the screen private. Some people still want a sensitive module on the family screen: a pregnant mother who wants the week card and her BP readings there, or a family that wants "Amma's watch: at home" on the hub.

## Decision
- Modules declare `hub_safe`, `hub_opt_in` and `sensitivity` in the catalogue. Data categories the hub may ever receive are one shared constant, `HUB_CATEGORIES` (`packages/module-catalogue/python/cure_catalogue/categories.py`), used by both the access policy and the catalogue validator.
- By default the hub API returns only `hub_safe` modules. Reproductive health, mental wellbeing and teen-confidential data are not sent to the hub.
- **Exception: `hub_opt_in` modules** (pregnancy status and readings, postpartum check-ins, the elder location banner) are sent to the hub only while the person has an active `hub_display` consent for that module. For an adult lacking capacity, their health proxy may give it. For teen-confidential data, only the person's own consent counts. Withdrawal removes the cards at the next sync and purges the hub cache.
- Mental-wellbeing modules, cycle, contraception and confidential messages have no hub opt-in.
- The validator enforces the rules: a hub-safe module needs a hub category; a module shown on the hub must be `hub_safe` or `hub_opt_in`; sensitive or teen-confidential modules can't be `hub_safe`.

## Consequences
- Pro: Privacy by design that holds even if the hub is compromised, except for what a person chose to show.
- Pro: Pregnant mothers can use the home BP cuff and scale on the hub.
- Con: One more consent purpose to explain.
- Con: Some users will ask for cycle tracking on the hub; the answer is the app.

## Alternatives considered
- Rely on face sign-in plus discreet mode: insufficient for a shared screen.
- No opt-in at all: safest, but pushes pregnant mothers off the hub's validated BP cuff.
