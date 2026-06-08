# Product Brief

## Overview

Klinik CNV Degerlendirme Modulu, constitutional CNV yorumlamasinda Riggs et al. 2020 ACMG/ClinGen puanlama sistemini Turkce, klinisyen-dostu, egitim ve yapilandirilmis karar destek formatina donusturen statik HTML prototipidir.

## Why It Exists

Constitutional CNV interpretation requires structured assessment of genomic content, known dosage-sensitive regions, gene content, evidence from literature and databases, population evidence, inheritance, and reporting context. This project exists to make that framework easier to review and teach in Turkish clinical settings.

## Clinical Problem

CNV interpretation can be complex, especially when multiple evidence categories must be combined consistently. Clinician-facing educational tools can help trainees and professionals understand how evidence sections contribute to variant classification, while still preserving the need for expert review.

## Need for Turkish Clinician-Facing CNV Education

Many core CNV interpretation standards are published in English. A Turkish interface and documentation layer can improve accessibility for Turkish clinicians, trainees, and laboratories during education, internal review, and structured discussion.

## What It Does

- Provides a static HTML prototype for CNV interpretation education
- Presents structured sections for copy-number loss and copy-number gain review
- Supports manual exploration of scoring concepts based on Riggs et al. 2020
- Provides documentation for validation planning, source mapping, safety, and deployment

## What It Does Not Do

- It does not generate validated clinical reports
- It does not diagnose patients
- It does not replace expert review
- It does not provide automated clinical decision-making
- It does not validate patient-specific treatment recommendations
- It does not constitute a medical device

## Current Prototype Status

The project is an educational and structured decision-support prototype. Manual validation against primary source materials and external comparison tools remains pending.

## Future Development Directions

- Complete source mapping against Riggs et al. 2020 and supplemental materials
- Add manually validated synthetic test cases
- Compare representative outputs with the ClinGen CNV Calculator
- Document deviations and local implementation decisions
- Add institutional validation records if used in a governed environment
