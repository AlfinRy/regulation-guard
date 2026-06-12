# OJK — Otoritas Jasa Keuangan
## Regulation Knowledge Base for RegulationGuard

Primary regulations covered:
- POJK 1/POJK.07/2013 — Perlindungan Konsumen Sektor Jasa Keuangan
- POJK 38/POJK.03/2019 — Penerapan Manajemen Risiko dalam Penggunaan Teknologi Informasi
- POJK 11/POJK.03/2022 — Penyelenggaraan Teknologi Informasi oleh Bank Umum
- UU No. 27/2022 — Pelindungan Data Pribadi (UU PDP)

---

<!-- section: risk_patterns -->
## HIGH-Risk Patterns for OJK Compliance

The following clause patterns are HIGH risk under OJK regulations. Flag any clause
matching these patterns as HIGH severity:

**Data Access Without Granular Controls**
- Granting "full access" or "complete access" to customer databases without specifying
  role-based access controls or the principle of least privilege.
- Access that becomes "automatic" or requires no additional authorization per transaction.
- Vendor access to customer data that is not limited to what is strictly necessary
  for the stated service purpose.

**Incident Reporting Timeline Violations**
- Any security incident reporting timeline longer than 1×24 hours for critical incidents
  (system compromise, data breach affecting consumers).
- Any reporting timeline longer than 3×24 hours for non-critical incidents.
- Language that allows the vendor to "assess" before reporting, effectively delaying
  notification beyond the required window.
- 14-day, 7-day, or "promptly" language for security incidents — all non-compliant.

**Cross-Border Data Transfer**
- Storing or processing customer financial data on servers located outside Indonesia
  without explicit OJK approval and a documented legal transfer mechanism.
- Clauses that allow cross-border transfer "without additional consent" or "automatically."
- Transfer to any jurisdiction without specifying that the destination provides equivalent
  data protection to Indonesian standards.

**Subprocessor / Third-Party Vendor**
- Vendor using subcontractors without being required to notify the principal (data controller).
- No requirement for the principal to approve or have oversight rights over subprocessors.
- Chain of responsibility that breaks at the subprocessor level.

**Log Retention Below 5 Years**
- Any clause specifying transaction log or audit log retention shorter than 5 years.
- This applies to the data controller (financial institution), not the vendor.
- Note: vendor retention of data POST-TERMINATION is a separate issue (unauthorized
  retention) and is HIGH risk regardless of duration.

**Unauthorized Post-Termination Data Retention**
- Vendor retaining ANY copy of customer data after contract termination without a
  specific legal basis (e.g., regulatory obligation).
- This is NOT about duration — even 1 day of post-termination vendor retention without
  legal basis is a violation. Distinguish from the 5-year retention obligation which
  applies to the data CONTROLLER, not the vendor.

**Liability Cap Disproportionate to Risk**
- Liability limited to 1× monthly service fee for incidents involving consumer data.
- Any liability cap that would be insufficient to cover mandatory consumer compensation
  under OJK consumer protection rules.
- Exclusion of all indirect/consequential damages in the context of data breaches.

**Confidentiality Ending at Contract Termination**
- Confidentiality obligations for customer data that expire when the contract ends.
- Customer financial data confidentiality must survive contract termination indefinitely.

**Security Standards Not Defined**
- Encryption standards left entirely to vendor discretion with no minimum defined.
- Encryption standards that "may change without notice."
- No requirement for periodic penetration testing or vulnerability assessment.

**Force Majeure Covering Cyber Attacks**
- Classifying cyber attacks, ransomware, or cloud infrastructure failures as force majeure.
- These are operational risks within the vendor's control and responsibility, not
  acts of God. Exempting them from liability violates POJK 38 IT risk management obligations.

**Foreign Jurisdiction / Arbitration**
- Dispute resolution in foreign arbitration (e.g., SIAC) with foreign law governing.
- This creates a risk of OJK consumer protection regulations being unenforceable.
- Mark as WARNING unless the clause explicitly removes OJK regulatory proceedings
  from its scope (in which case: VIOLATION).

**Data Portability Violation**
- Vendor not required to return customer data in a usable, machine-readable format
  upon contract termination.
- "Format of the vendor's choosing" language that effectively creates data lock-in.
<!-- /section -->

---

<!-- section: articles -->
## Key Articles and Requirements

### POJK 1/POJK.07/2013 — Consumer Protection

**Art. 4 — Principles**
Financial service providers must treat consumers fairly, transparently, reliably,
confidentially, and securely. Any contract clause that creates an unfair imbalance
of obligations violates Art. 4.

**Art. 12 — Transparency and Purpose Limitation**
Consumer data may only be used for the purpose for which it was originally collected.
Using consumer data for AI model training, product development, or internal research
by a third-party vendor requires explicit consumer consent and falls outside the
original collection purpose.

**Art. 13 — Purpose and Consent**
Any secondary use of consumer data (beyond the stated service purpose) requires
separate, explicit consent from the consumer. "Anonymized" data used for vendor's
own AI training is still a secondary use requiring consent documentation.

**Art. 14 — Data Confidentiality**
Financial service providers (and their vendors) must maintain strict confidentiality
of consumer data. This obligation:
- Applies to all parties with access to the data
- Survives contract termination — confidentiality does not end when the contract ends
- Prohibits disclosure to any third party (including the vendor's investors or subcontractors)
  without explicit authorization

**Art. 26 — Fair Contract Terms**
Contracts with consumers (and by extension, vendor contracts affecting consumers) must not:
- Contain unfairly low liability caps for data breaches
- Exclude liability for gross negligence or willful misconduct
- Create one-sided obligations that systematically disadvantage the consumer

### POJK 38/POJK.03/2019 — IT Risk Management

**Art. 15 — Data Localization**
Data processing systems for financial services, including servers storing consumer
financial data, must be located within Indonesian territory. Cross-border data transfer
or storage requires:
1. Prior OJK notification/approval
2. Documented legal transfer mechanism
3. Guarantee that destination jurisdiction provides equivalent data protection
4. Ability for OJK to conduct inspections on foreign-stored data

**Art. 16 — IT Security Standards**
Financial institutions must implement and document minimum security standards including:
- Encryption of consumer data in transit and at rest (minimum AES-256 or equivalent)
- Security standards must be contractually specified with vendors
- Changes to security standards require advance notice and approval
- Vendors cannot unilaterally change encryption or security configurations

**Art. 18 — Third-Party / Vendor Management**
When using IT vendors:
- Financial institution must maintain oversight rights over vendor's operations
- Vendor must notify principal of any subcontractors used
- Principal must be able to audit the vendor and its subcontractors
- Chain of accountability must extend through the entire supply chain

**Art. 20 — Security Incident Reporting**
Security incidents must be reported to OJK and relevant stakeholders:
- Critical incidents (affecting consumer data, system compromise): within 1×24 hours
- Significant incidents: within 3×24 hours
- All incidents affecting consumers: must be escalated to OJK
- 14-day reporting windows are grossly non-compliant

**Lampiran (Annex) — IT Security Assessment**
Financial institutions must conduct:
- Annual penetration testing by qualified independent parties
- Quarterly vulnerability assessments
- Vendors must contractually agree to allow and cooperate with these assessments
- Excluding mandatory security testing in vendor contracts is non-compliant

**Records Management**
Transaction logs and audit trails must be retained for a minimum of 5 years to:
- Support regulatory audits by OJK
- Support criminal/civil investigations
- Meet anti-money laundering (AML) record-keeping requirements
- 1-year retention is non-compliant; 3-year retention is insufficient
<!-- /section -->

---

<!-- section: incident_reporting -->
## Incident Reporting Requirements (OJK)

### Reporting Timelines

| Incident Type | Report To | Deadline |
|---|---|---|
| Critical — consumer data breach, system compromise | OJK + Board | 1×24 hours |
| Significant — service disruption >2 hours | OJK | 3×24 hours |
| Minor — contained incidents, no consumer impact | Internal only | 30 days (monthly report) |

### What Must Be Reported

A security incident report to OJK must include:
1. Time and nature of the incident
2. Number of consumers potentially affected
3. Data types involved
4. Immediate mitigation actions taken
5. Planned remediation timeline

### Vendor Contract Requirements

Vendor contracts must require:
- Vendor notifies financial institution within 1 hour of detecting a security incident
- This gives the financial institution time to assess and report to OJK within 1×24 hours
- Any clause requiring vendor notification within "14 days", "7 days", or even "72 hours"
  is non-compliant because it makes the financial institution unable to meet its own OJK obligations
- Vendor must cooperate fully with any OJK investigation

### Common Violations

- "PIHAK KEDUA wajib melaporkan Insiden Keamanan dalam waktu 14 (empat belas) hari"
  → VIOLATION — 14 days far exceeds 1×24 hour critical reporting requirement
- "PIHAK KEDUA akan melaporkan insiden secara segera setelah asesmen selesai"
  → VIOLATION — "after assessment" language creates undefined delay
- No incident reporting clause at all → VIOLATION — reporting obligation is mandatory
<!-- /section -->

---

<!-- section: data_localization -->
## Data Localization Requirements (OJK POJK 38/2019 Art. 15)

### The Rule

Consumer financial data processed by Indonesian financial institutions (bank, fintech,
insurance, securities) must be stored and processed on servers physically located
in Indonesia, UNLESS:

1. OJK has granted a specific exemption for the data category, AND
2. A documented legal transfer mechanism is in place, AND
3. The destination country provides equivalent data protection, AND
4. OJK retains the ability to inspect and audit the foreign-stored data

### What This Means for Vendor Contracts

**Non-compliant clauses:**
- "PIHAK KEDUA dapat menyimpan Data Nasabah di server yang berlokasi di luar Indonesia"
  → VIOLATION — no mechanism specified, no OJK approval mentioned
- "Data may be stored in Singapore, US, or Europe without additional consent"
  → VIOLATION — blanket cross-border storage permission

**Compliant alternative wording:**
- "All customer data shall be stored on servers located within Indonesian territory.
  Cross-border data transfer, if required, shall only occur with prior written OJK
  approval and in compliance with applicable data localization requirements."

### Response to Foreign Authority Requests

When a foreign authority requests consumer data stored abroad:
- Vendor CANNOT comply without first notifying the Indonesian financial institution
- Financial institution must assess whether compliance would violate Indonesian law
- Financial institution must notify OJK before disclosing data to foreign authorities
- Clause allowing vendor to respond to foreign authorities autonomously = VIOLATION
<!-- /section -->

---

<!-- section: retention -->
## Data Retention Requirements

### Retention Obligations (for the Data Controller / Financial Institution)

| Data Type | Minimum Retention | Legal Basis |
|---|---|---|
| Transaction logs & audit trails | 5 years | POJK 38/2019 + UU AML |
| Customer identity documents (KYC) | 5 years after relationship ends | POJK AML/CFT |
| Security event logs | 5 years | POJK 38/2019 Annex |
| Contract documents | 5 years after expiry | General legal requirement |
| Consumer complaints records | 5 years | POJK 1/2013 |

**Important:** The 5-year minimum applies to the **data controller** (the financial
institution). Vendor contracts should require the vendor to assist with retention
and NOT independently determine retention periods.

### Post-Termination Retention by Vendor — Unauthorized

This is a fundamentally different scenario from the retention obligation above.

When a contract terminates, the vendor (as data processor) should:
1. Return all customer data to the financial institution in a usable format
2. Delete all copies from vendor systems within 30 days
3. Provide written confirmation of deletion

**A vendor retaining customer data post-termination for "audit purposes" is non-compliant
because:**
- The vendor has no independent legal basis to retain third-party consumer data
- "Audit purposes" of the vendor is not a legitimate interest that overrides consumer data rights
- Even 6 months of post-termination vendor retention is a violation — the issue is the
  lack of legal authority, not the duration

**Do NOT reason about this as "the retention period is too short."**
Reason about this as "the vendor has no legal authority to retain any data post-termination."

### Common Violations

- "Menyimpan log selama 1 (satu) tahun" → VIOLATION (too short, must be 5 years) — data controller obligation
- "Setelah pengakhiran, PIHAK KEDUA berhak menyimpan salinan selama 6 bulan" → VIOLATION
  (no legal basis for any post-termination vendor retention) — unauthorized retention
- No retention clause → WARNING (ambiguous, needs clarification)
<!-- /section -->
