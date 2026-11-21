# OPERATION PRAHAAR AI — RESPONSIBLE AI & PRIVACY FRAMEWORK
### Ethical Governance, Non-Discrimination, and Public Safety Compliance

---

## 1. Ethical Foundation

Operation Prahaar AI is built with the fundamental conviction that **technology must protect democratic public life, uphold individual privacy, and support authorized security personnel without infringing on civil liberties**.

Counter-terrorism and public safety decision-support platforms must be held to the highest standard of accountability, transparency, and data minimization.

---

## 2. Mandatory Negative Constraints (The "NEVER" Rules)

Under no circumstances shall Operation Prahaar AI:

1. **Never perform facial recognition:**
   - No face detection models, facial landmark extractors, or face embeddings shall be loaded or executed.
   - No comparison against photograph databases or national ID repositories.

2. **Never maintain suspect watchlists:**
   - No biometric, facial, or individual suspect lists are accepted or stored.
   - The platform tracks *spatial safety events* (crowd surges, perimeter breaches), never *people*.

3. **Never track individuals across cameras:**
   - No Re-Identification (Re-ID) algorithms.
   - No multi-camera trajectory linking of individual persons.

4. **Never classify persons based on clothing or appearance:**
   - No garment-based, headwear-based, or visual trait profiling.

5. **Never profile based on protected characteristics:**
   - Absolute prohibition against using religion, race, ethnicity, caste, gender, or appearance in any heuristic, model, or correlation rule.

6. **Never execute autonomous legal or policing actions:**
   - The AI engine has zero authority to issue autonomous police dispatches, arrest recommendations, or automated accusations.
   - All alerts are explicitly classified as `UNVERIFIED` until an authorized human operator validates the situation.

---

## 3. Mandatory Positive Requirements (The "ALWAYS" Rules)

Operation Prahaar AI shall always enforce:

1. **Non-Identifying Spatial Analytics:**
   - All computer vision routines operate on aggregate physical properties: motion optical flow, crowd density percentages, and polygon perimeter breach vectors.

2. **Explainable Intelligence:**
   - Every incident generated must display an explainability card:
     - Exact triggering condition (e.g., "Density exceeded 75% for >15 seconds").
     - Confidence score (0.00 to 1.00) alongside an explicit **Uncertainty Rating** (Low / Moderate / High).
     - Matched security advisory reference (if applicable).

3. **Mandatory Human-in-the-Loop (HITL):**
   - An alert cannot transition to `CONFIRMED` or `ESCALATED` without an explicit operator review action recording the operator's badge ID and operational notes.

4. **Immutable Audit Trail:**
   - Every system event, rule trigger, operator review, and alert escalation is recorded in an append-only audit table with timestamps.

5. **Data Minimization & Ephemeral Processing:**
   - CCTV frames are buffered in volatile RAM only for the duration of the 5-frame calculation window and then immediately discarded.
   - No raw video recordings or human imagery are saved to disk unless an operator specifically flags an authorized synthetic test artifact.

---

## 4. Compliance Checklist for Developers

| Requirement | Implementation Mechanism | Verification Method |
| :--- | :--- | :--- |
| **No Facial Models** | Only OpenCV background subtraction and contour detectors loaded. | Code audit + automated dependency scan. |
| **Unverified Defaults** | Default status in database schema is `ReviewStatus.UNVERIFIED`. | Unit test asserting initial alert state. |
| **Explainability** | Pydantic schema requires `explanation` and `uncertainty` fields. | Schema validation test. |
| **Audit Coverage** | DB triggers / service hooks log every state change to `audit_logs`. | Integration test verifying audit log count. |
