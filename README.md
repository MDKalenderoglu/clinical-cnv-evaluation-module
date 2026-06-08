# Klinik CNV Degerlendirme Modulu

**Turkish clinical CNV interpretation and education prototype based on ACMG/ClinGen Riggs et al. 2020 framework.**

## Purpose

Klinik CNV Degerlendirme Modulu is a static, browser-based academic prototype intended to support structured education and review of constitutional copy-number variant (CNV) interpretation. It presents Turkish clinician-facing terminology and workflow elements aligned with the ACMG/ClinGen CNV interpretation framework described by Riggs et al. 2020.

## Scope

This repository contains a single-file HTML prototype and supporting documentation for academic review, manual validation planning, and GitHub Pages deployment. It is intended for constitutional CNV education and structured decision-support exploration.

## Features

- Static single-file HTML application
- Turkish clinician-facing CNV interpretation interface
- Structured copy-number loss and copy-number gain workflow
- Educational scoring framework based on ACMG/ClinGen Riggs et al. 2020
- Documentation scaffold for source mapping, validation, safety, privacy, and deployment
- Manual test templates for future validation

## Intended Users

- Clinical genetics specialists
- Molecular genetics laboratory professionals
- Medical genetics trainees
- Researchers and educators working on CNV interpretation workflows

## Current Status

This project is an educational and structured decision-support prototype. It is not a clinical report generator, not a validated clinical decision system, and not a medical device.

## Clinical Limitations

This prototype is not validated for routine clinical decision-making. It must not replace expert review, laboratory quality systems, multidisciplinary interpretation, local policies, or professional clinical judgment. Expert review and local validation are required before any institutional use.

## Data Privacy

Do not commit real patient data, identifiers, images, screenshots, exported reports, or case examples to this repository. Any testing should use synthetic, non-identifiable examples unless explicit approval and governance are in place.

## GitHub Pages Usage

The app can be hosted as a static GitHub Pages site because it uses `index.html` directly and does not require a build system.

Expected deployment URL:

```text
https://<username>.github.io/<repo-name>/
```

## Local Usage

Open `index.html` directly in a modern browser. No installation, server, package manager, or build step is required.

## Main References

- Riggs ER, Andersen EF, Cherry AM, et al. Technical standards for the interpretation and reporting of constitutional copy number variants: a joint consensus recommendation of ACMG and ClinGen. Genetics in Medicine. 2020;22(2):245-257. doi:10.1038/s41436-019-0686-8
- Supplemental Material 1: Using the Copy Number Variation (CNV) Scoring Metrics.
- ACGS Best Practice Guidelines for Variant Classification in Rare Disease 2023.
- ClinGen CNV Calculator, for external comparison during validation.

## Disclaimer

This repository is provided as an academic prototype for education, review, and development planning. It is not a medical device, not a clinical report, and not validated for routine clinical decision-making. Use requires expert oversight, local validation, and appropriate institutional data governance.

**Warning:** do not commit real patient data, identifiers, images, screenshots, exported reports, or real case examples.
