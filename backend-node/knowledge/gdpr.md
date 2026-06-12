# GDPR — General Data Protection Regulation (EU) 2016/679
## Regulation Knowledge Base for RegulationGuard

---

<!-- section: risk_patterns -->
## HIGH-Risk Patterns for GDPR Compliance

**Data Minimization Violations**
- Access to data beyond what is strictly necessary for the stated processing purpose.
- No specification of which data categories are accessed by the processor.

**Purpose Limitation Violations**
- Processor using controller's data for their own purposes (AI training, analytics, research).
- Secondary use without documented legal basis or re-consent.

**Storage Limitation Violations**
- No deletion timeline specified for personal data.
- Retention "as long as necessary" without defining criteria for necessity.
- Retention periods that are clearly excessive for the stated purpose.

**Processor Agreement Deficiencies (Art. 28)**
- No written data processing agreement or incomplete DPA.
- Processor not required to obtain prior written consent before engaging sub-processors.
- No audit rights for the controller over the processor.
- Processor cannot impose equivalent GDPR obligations on sub-processors.

**Cross-Border Transfer Without Adequate Mechanism**
- Transfer to non-EEA countries without adequacy decision, SCCs, or BCRs.
- "Data may be stored anywhere" language.
- Transfer to US without SCCs post-Schrems II compliance documentation.

**Breach Notification Violations**
- Processor notification to controller longer than "without undue delay."
- Any fixed timeline for processor breach notification exceeding 24 hours.
  (Controller has 72 hours to notify supervisory authority; processor must notify
  controller with enough time for the controller to meet this deadline.)

**Rights of Data Subjects**
- Clauses that would prevent the controller from responding to data subject access requests.
- No data portability provision — data must be returnable in machine-readable format.
- Post-termination vendor retention blocking erasure requests.
<!-- /section -->

---

<!-- section: articles -->
## Key GDPR Articles

**Art. 5 — Principles**
- Lawfulness, fairness, transparency
- Purpose limitation: collected for specified, explicit, legitimate purposes only
- Data minimization: adequate, relevant, limited to what is necessary
- Storage limitation: not kept longer than necessary — retention period must be defined
- Integrity and confidentiality: appropriate security measures required

**Art. 28 — Processor Obligations**
Processing by a processor shall be governed by a contract that stipulates:
- Processes data only on documented instructions from the controller
- Ensures persons authorized to process are under confidentiality obligation
- Implements appropriate technical and organizational security measures (Art. 32)
- **Does not engage sub-processors without prior specific or general written authorization**
  from the controller — this is a hard requirement, not optional
- Assists controller with data subject rights requests
- Deletes or returns all personal data at end of services (controller's choice)
- Provides all information necessary to demonstrate compliance
- Allows for and contributes to audits by the controller

**Art. 32 — Security of Processing**
Appropriate technical and organizational measures must include:
- Pseudonymization and encryption of personal data
- Ability to ensure ongoing confidentiality, integrity, availability
- Ability to restore availability after incidents
- Process for regularly testing and evaluating effectiveness of measures
- Security measures must be specified — "industry standard" language is insufficient

**Art. 33 — Breach Notification to Supervisory Authority**
- Controller must notify supervisory authority within 72 hours of becoming aware
- Processor must notify controller "without undue delay" — in practice this means
  immediately or within hours, not days
- 14-day vendor notification windows make it impossible for controllers to comply

**Art. 44-49 — Cross-Border Transfers**
Transfer to third countries only permitted when:
- Adequacy decision exists (Art. 45), OR
- Appropriate safeguards: Standard Contractual Clauses / BCRs (Art. 46), OR
- Binding Corporate Rules (Art. 47), OR
- Specific derogations for individual transfers (Art. 49) — not for systematic transfers
- "Without additional consent" blanket transfer clauses do not constitute a valid mechanism
<!-- /section -->

---

<!-- section: breach_notification -->
## GDPR Breach Notification Requirements

### Timeline
- Processor → Controller: immediately / without undue delay (best practice: within 2 hours)
- Controller → Supervisory Authority: within 72 hours of becoming aware
- Controller → Data Subjects: without undue delay if high risk to their rights

### Why Vendor 14-Day Clauses Fail GDPR
If a vendor contract specifies 14 days for incident notification:
- Controller cannot notify supervisory authority within 72 hours
- Controller is in violation of Art. 33 even though the breach was the vendor's fault
- This is a VIOLATION, not just a WARNING

### What Contracts Should Require
"The Processor shall notify the Controller without undue delay, and in any event
within 24 hours of becoming aware of a Personal Data Breach, providing at minimum:
the nature of the breach, categories and approximate number of data subjects affected,
likely consequences, and measures taken or proposed to address the breach."
<!-- /section -->

---

<!-- section: cross_border -->
## GDPR Cross-Border Transfer Requirements

### Permitted Transfer Mechanisms (Art. 44-49)

1. **Adequacy Decision** — European Commission has decided the destination country
   provides adequate protection. Currently: UK, Switzerland, Japan, South Korea,
   Canada (commercial), Israel, New Zealand, Uruguay, Argentina.

2. **Standard Contractual Clauses (SCCs)** — Commission-approved template clauses
   (updated June 2021). Most common mechanism for US/Asia transfers.

3. **Binding Corporate Rules (BCRs)** — For intra-group transfers within multinationals.

4. **Individual derogations (Art. 49)** — Only for non-repetitive, necessary transfers.
   Cannot be used as a general mechanism for systematic cross-border data flows.

### What Is Non-Compliant
- "Data may be stored in Singapore, US, or Europe" without specifying the transfer mechanism
- Automatic cross-border transfer without documented legal basis
- Relying on consent as the transfer mechanism for employee or customer data
  (EDPB considers this generally not valid for systematic transfers)
<!-- /section -->

---

<!-- section: retention -->
## GDPR Data Retention

### Storage Limitation Principle (Art. 5(1)(e))
Personal data must be "kept in a form which permits identification of data subjects
for no longer than is necessary for the purposes for which the personal data are processed."

### Contract Requirements
- Specific retention periods must be defined per data category
- Retention justified by legal obligation, legitimate interest, or specific purpose
- Automated deletion or anonymization process should be specified
- No open-ended retention ("as long as needed by vendor")

### Post-Termination (Art. 28(3)(g))
At the choice of the controller, the processor must:
- Delete all personal data, AND provide certification of deletion, OR
- Return all personal data to the controller
After return/deletion, processor must delete existing copies unless required by Union
or Member State law. Vendor "internal audit" purposes are not a valid legal basis for retention.
<!-- /section -->
