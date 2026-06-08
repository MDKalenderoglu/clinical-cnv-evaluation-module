# Source Map

This document maps major prototype sections to source references and planned validation targets. It does not claim full validation.

| Section | Source | Implementation location in index.html | Validation status | Notes |
| --- | --- | --- | --- | --- |
| Classification thresholds | Riggs et al. 2020 ACMG/ClinGen CNV technical standards | Classification output and threshold logic | pending/manual review | Compare against published pathogenic, likely pathogenic, VUS, likely benign, and benign score boundaries. |
| Section 1: Initial assessment of genomic content | Riggs et al. 2020; Supplemental Material 1 | Section 1 controls for initial CNV content assessment | pending/manual review | Validate loss and gain pathways separately. |
| Section 2: Copy-number loss overlap with HI/benign regions | Riggs et al. 2020; Supplemental Material 1 | Copy-number loss Section 2 controls | pending/manual review | Confirm HI and benign overlap behavior and point values. |
| Section 2: Copy-number gain overlap with TS/HI/benign regions | Riggs et al. 2020; Supplemental Material 1 | Copy-number gain Section 2 controls | pending/manual review | Confirm TS, HI, and benign overlap behavior and point values. |
| Section 3: Gene number | Riggs et al. 2020; Supplemental Material 1 | Gene count scoring controls | pending/manual review | Validate loss and gain scoring ranges independently. |
| Section 4: Literature/database/case-control/population evidence | Riggs et al. 2020; Supplemental Material 1 | Evidence sections 4A-4O | pending/manual review | Check evidence caps, mutually exclusive selections, and range handling. |
| Section 5: Inheritance and family history for patient being studied | Riggs et al. 2020; Supplemental Material 1 | Inheritance and family history controls | pending/manual review | Validate inheritance scenarios for proband and family context. |
| Reporting guidelines | Riggs et al. 2020; ACGS 2023 Best Practice Guidelines | Reporting-related explanatory interface or output text | pending/manual review | Confirm language remains educational and not a validated clinical report. |
| Uncoupling variant classification from patient-specific clinical significance | Riggs et al. 2020; ACGS 2023 Best Practice Guidelines | Disclaimer, interpretation notes, and output context | pending/manual review | Ensure variant classification is not presented as patient-specific diagnosis. |
| Supplemental explanations and caveats | Supplemental Material 1: Using the CNV Scoring Metrics | Help text, section notes, and scoring caveats | pending/manual review | Do not copy long passages; summarize implementation dependencies. |
| ACGS 2023 interpretive additions | ACGS 2023 Best Practice Guidelines | Secondary interpretive notes and documentation | pending/manual review | Use as secondary context, not as a replacement for ACMG/ClinGen CNV standards. |

## External Comparison Target

Representative synthetic cases should be compared against the ClinGen CNV Calculator where applicable. Any differences should be recorded in `docs/scoring-audit.md`.
