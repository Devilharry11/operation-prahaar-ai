# OPERATION PRAHAAR AI — HARDWARE ROADMAP
### From Virtual Laptop Edge Appliance to Field-Deployable Mini PC

---

## 1. Phase 1–10: Virtual Edge Appliance (Laptop Prototyping)

During student prototyping and hackathon validation, the developer's standard Windows laptop acts as both:
1. The **Edge Processing Node** (running the edge ingestion and vision loop).
2. The **Central Intelligence Host** (running FastAPI, SQLite, and the React Command Center).

### Hardware Constraint Profile:
- **Host OS:** Windows 10 / 11
- **Available RAM:** 8 GB Total System Memory
- **RAM Allocation Budget:**
  - OS & VS Code: ~4.5 GB
  - Prahaar Edge Node (OpenCV CPU): ~250 MB
  - Prahaar Backend (FastAPI + SQLite): ~70 MB
  - Prahaar Frontend (Vite / Browser): ~300 MB
  - Buffer / Free Headroom: ~2.8 GB
- **Cost:** ₹0 (Zero additional hardware purchases required).

---

## 2. Future Production Deployment: Dedicated Mini PC Edge Nodes

In a real-world public safety deployment (protecting railway stations, religious pilgrimage sites, and public plazas), each physical camera cluster connects to an independent, ruggedized **Edge Computing Appliance**.

```
+-----------------------------------------------------------------------------------+
|                           MINI PC EDGE APPLIANCE SPECIFICATION                    |
+-----------------------------------------------------------------------------------+
| Form Factor         | Fanless Ultra-Compact Mini PC (IP50 / IP65 industrial)      |
| Recommended Chipset | Intel N100 / Intel N97 (Quad-Core, up to 3.4 GHz, 6W TDP)   |
| Memory              | 16 GB DDR5 4800 MHz (single-channel or dual-channel)        |
| Storage             | 256 GB NVMe M.2 SSD (Industrial-grade, high write endurance)|
| Network Interfaces  | Dual Gigabit Ethernet (1 for CCTV VLAN, 1 for Uplink)       |
| Power Consumption   | 10W - 15W typical operating draw                            |
| Operating Temp      | -10 deg C to +50 deg C ambient                              |
| Estimated Unit Cost | ₹14,000 - ₹18,000 INR ($170 - $215 USD)                     |
+-----------------------------------------------------------------------------------+
```

### Alternative High-Efficiency Edge Options:
1. **NVIDIA Jetson Orin Nano (8 GB):** Ideal if lightweight edge TensorRT acceleration is added in the future.
2. **Raspberry Pi 5 (8 GB + AI Kit):** Ultra-low-cost (~₹9,500 INR) alternative for single-camera boundary protection.

---

## 3. Mini PC Architecture Advantages

- **Zero Cloud Dependence (Offline Survivability):** If internet or mobile networks are severed or jammed, the Mini PC continues running local computer vision, logging perimeter events to local encrypted storage.
- **Bandwidth Minimization:** Instead of streaming multiple high-definition RTSP streams over 4G/5G (which requires high bandwidth and costs), only 1 KB JSON event packets are transmitted when an anomaly occurs.
- **Privacy Assurance:** Raw video never leaves the premises of the local edge appliance. Only aggregated counts and coordinates are transmitted to the Command Center.
