# PDPA — Personal Data Protection Act
## Regulation Knowledge Base for RegulationGuard
## Covers: Thailand PDPA (B.E. 2562), Singapore PDPA 2012, and general ASEAN principles

---

<!-- section: risk_patterns -->
## HIGH-Risk Patterns for PDPA Compliance

**Consent Deficiencies**
- Consent obtained through bundled consent (consent to everything or nothing).
- No mechanism for withdrawing consent after it is given.
- Secondary use of data (AI training, analytics) without separate consent.

**Purpose Limitation**
- Data collected for service delivery used for vendor's own commercial purposes.
- No documentation of the purpose for which each data category is processed.

**Cross-Border Transfer**
- Transfer to countries without adequate protection standards without consent or safeguards.
- Blanket permission to transfer data internationally without specifying destinations
  or transfer mechanisms.

**Data Breach Notification**
- Thailand PDPA: notification within 72 hours to regulator, without undue delay to data subjects
  if likely to result in high risk.
- Singapore PDPA: notification within 3 business days to PDPC, and to affected individuals
  if significant harm is likely.
- Any vendor clause specifying 14-day or longer notification is non-compliant.

**Data Subject Rights**
- No mechanism to fulfill access requests within the required timeframe.
- No data portability — data must be returnable in machine-readable format.
- Vendor retaining data after termination blocks erasure rights.
<!-- /section -->

---

<!-- section: articles -->
## Key PDPA Provisions

### Thailand PDPA (PDPA B.E. 2562)

**Section 19-26 — Lawful Basis for Processing**
Personal data may only be processed when:
- Explicit consent has been obtained, OR
- Necessary for contract performance, OR
- Necessary for legal obligation, OR
- Necessary for vital interests, OR
- Necessary for public task, OR
- Necessary for legitimate interests (proportionality test required)

**Section 27 — Sensitive Data**
Financial data, health data, biometric data require explicit consent (opt-in).
Sensitive data cannot be processed under "legitimate interests" basis.

**Section 37 — Cross-Border Transfer**
Personal data may only be transferred to foreign countries that have
adequate personal data protection standards as determined by the PDPC.
If the destination country does not have adequate protection:
- Controller must obtain explicit consent, AND
- Implement appropriate safeguards (SCCs or equivalent)
- Transfer must be documented with risk assessment

**Section 37 Transfer Requirements**
Contracts must specify:
- The destination country and whether it has adequate protection
- The transfer mechanism being relied upon
- The categories of data being transferred
- The purpose of the transfer
Blanket "may be transferred internationally" clauses do not satisfy Section 37.

**Section 40 — Breach Notification**
- Must notify PDPC within 72 hours of becoming aware of a breach
- Must notify affected data subjects without undue delay if likely to result in harm
- Vendor must notify controller immediately to allow controller to meet the 72-hour deadline

### Singapore PDPA 2012 (Amended 2020)

**Accountability Obligation**
Organizations must designate a Data Protection Officer (DPO) and be responsible for
data in the possession or under the control of their data intermediaries (processors/vendors).

**Mandatory Data Breach Notification (Part 6A)**
- Notify PDPC within 3 calendar days if breach is likely to cause significant harm
  OR affects ≥500 individuals
- Notify affected individuals within 3 calendar days if likely to cause significant harm
- Vendor must notify organization immediately upon discovery

**Data Portability Obligation**
Upon request, organization must transmit user's data to another organization
in a machine-readable format. Vendor contracts must enable this — vendor lock-in
on data format violates the portability obligation.
<!-- /section -->

---

<!-- section: cross_border -->
## PDPA Cross-Border Transfer Requirements

### Thailand PDPA Section 37

Transfer to countries with **adequate protection** (PDPC whitelist):
- Can proceed without additional safeguards
- Still requires documenting the transfer

Transfer to countries **without adequate protection** (most countries):
- Requires explicit consent, AND
- Must implement appropriate safeguards:
  * Standard contractual clauses (SCCs)
  * Binding corporate rules
  * Approved certification mechanisms
- Must conduct and document a transfer impact assessment

### Common Non-Compliant Clauses

**"PIHAK KEDUA dapat menyimpan Data di server di Singapura, Amerika Serikat, dan Eropa"**
- VIOLATION under Thailand PDPA Section 37 — blanket permission to transfer without
  specifying transfer mechanism or adequate protection assessment
- Singapore has adequate protection under Thailand PDPA; US and Europe require SCCs

**"Transfer dilakukan tanpa persetujuan khusus untuk setiap perpindahan data"**
- VIOLATION — for countries without adequate protection, per-transfer consent
  or SCCs are required; blanket advance consent is insufficient
<!-- /section -->
