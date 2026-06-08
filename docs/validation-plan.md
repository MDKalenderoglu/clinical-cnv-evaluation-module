# Validation Plan

This plan describes manual validation activities required before any institutional or clinical use. Completion of this document does not imply that validation has been performed.

## Required Checks

- Compare scoring against Riggs 2020 Table 1 and Table 2
- Compare detailed scoring behavior against Supplemental Material 1
- Compare representative cases against ClinGen CNV Calculator
- Test classification thresholds
- Test copy-number loss cases
- Test copy-number gain cases
- Test Section 4 caps and ranges
- Test Section 5 inheritance scenarios
- Test VUS/LB/B/P/LP boundaries
- Test patient-data privacy behavior
- Test no patient data in localStorage except theme preference if applicable
- Test print/PDF output
- Test unsafe HTML input rendering
- Test GitHub Pages deployment
- Record all deviations in `docs/scoring-audit.md`

## Evidence Recording

Each validation run should record the tested version, date, reviewer, source reference, expected result, actual result, pass/fail status, and notes. Only synthetic or otherwise approved non-identifiable examples should be used.
