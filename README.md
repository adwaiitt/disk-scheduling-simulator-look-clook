# Disk Scheduling Algorithms Simulator: LOOK & C-LOOK
### Operating System Self-Learning Activity (SLA) — Stage 2 Implementation
**Shah & Anchor Kutchhi Engineering College (Autonomous)**  
*Department of Computer Engineering | Semester III (A.Y. 2026–2027)*

---

## 👥 Student & Project Details
- **Student 1:** Adwait Jangam — SYCM2-69 (Roll No: `126BTCM2007`)
- **Student 2:** Vedika Jadhav — SYCM2-70 (Roll No: `126BTCM2019`)
- **Subject Guide:** Mrs. Deepshikha Chaturvedi
- **Topic:** Disk Scheduling & Algorithms – LOOK & C-LOOK (Standard vs. IEEE Research Formulations)
- **SLA Stage:** Stage 2 (Interactive Working Model & Comparative Simulation)

---

## 🚀 Key Features & Algorithmic Implementations

### 1. Four Comprehensive Algorithmic Implementations
The simulator evaluates and compares four distinct scheduling models:

1. **Standard LOOK (Elevator Algorithm)**:
   - Sweeps in the user-specified direction up to the boundary pending request without traveling to physical edges ($0$ or $199$).
   - Reverses direction dynamically once the boundary request is serviced.
2. **Standard C-LOOK (Circular LOOK)**:
   - Sweeps in one direction, then performs a circular return jump to the outermost pending track without servicing requests on the return path.
3. **Research Paper LOOK (Javed & Khan, IEEE 2000)**:
   - Evaluates bidirectional passes (*Upward* vs. *Downward*).
   - Proves mathematically that selecting the optimal direction (typically Downward when starting head is near lower cylinders) eliminates large turnaround swings, cutting total seek travel significantly.
   - Reorders requests into monotonic subsets: $Q = [R_{\text{lower}} \downarrow, R_{\text{higher}} \uparrow]$.
4. **Research Paper C-LOOK (Javed & Khan, IEEE 2000)**:
   - Formulates a strict unidirectional upward sweep from initial head to the highest pending cylinder, followed by a mechanical return swing to the lowest cylinder.
   - Fully accounts for return swing actuator slew distance in the mechanical seek cost metric to reflect physical hardware latency.

---

### 2. Tab Navigation & Interactive Analysis Views
- **LOOK (Basic)**: Live step-by-step table, trajectory graph, physical rail, and rotary disk platter.
- **C-LOOK (Basic)**: Dedicated circular jump tracing, jump vs. service-only seek breakdown.
- **LOOK (Research Paper)**: Directional optimization analysis, mathematical closed-form formula breakdown, and dedicated section highlighting architectural differences against Basic LOOK.
- **C-LOOK (Research Paper)**: Actuator return swing accounting, load-dependent efficiency analysis, and dedicated section highlighting architectural differences against Basic C-LOOK.
- **Comparison of All (4 Algorithms)**:
  - 4-way comparative metric overview cards.
  - Multi-bar comparative performance chart with word-wrapped labels.
  - Comprehensive 4-way technical comparison matrix.
  - Live dynamic performance table computed exclusively from active input parameters.

---

### 3. Realistic Hardware Visualization Engine
- **Rotary Disk Platter & Voice-Coil Actuator Arm**:
  - Realistic 2D HDD simulation showing rotating magnetic platter, central spindle hub, outer boundary track (84mm), and inner boundary track (30mm).
  - Actuator arm angles calculated using exact triangle trigonometry ($PC^2 + L^2 - r(T)^2$).
  - Real-time HUD readout displaying **Active Cylinder**, **Head Radius (mm)**, and **Radial Travel (tracks)**.
- **Synchronized 1D Physical Cylinder Rail & 2D Trajectory Graph**:
  - Shared 1:1 horizontal track projection ($0$ to maximum cylinder).
  - Dynamic vertical cursor glides across the trajectory graph in exact synchronization with the physical actuator rail needle during playback.
- **Step-by-Step Playback Controller**:
  - Full animation controls: Play/Pause, Step Forward, Step Backward, and Reset with live step counters.

---

### 4. Presets System
Directly below the Simulation Parameters sidebar card, an interactive **Presets** card allows one-click loading of benchmark test scenarios from Javed & Khan (IEEE 2000, Table 1), with request queues capped to a maximum of 10 requests:
- **Sample 1: Primary Benchmark (8 Tracks)** — Evaluates asymmetric cross-head request distribution and shows how downward sweep eliminates an upward turnaround swing.
- **Sample 2: All Below Head (10 Tracks)** — Evaluates monotonic sweep with zero turnaround reversals in LOOK vs. unnecessary return jumps in C-LOOK.
- **Sample 3: High Density (10 Tracks)** — Evaluates dense alternating inner/outer cylinders under multiprogramming conditions.
- **Sample 4: Wide Platter Spread (10 Tracks)** — Evaluates boundary sweeps across wide radial platter distances (track 1 to track 250).
- **Dynamic Scenario Info Box**: Selecting any preset displays the starting head position, tested direction, and specific seek conditions examined.

---

### 5. Academic UI Design Standards
- **Light Theme Only**: Clean off-white and warm stone palette designed for classroom presentations and projector visibility.
- **Zero Blue Palette**: Strictly adheres to the institutional non-blue palette:
  - Forest Emerald (`#15803D`) — LOOK / Primary Success
  - Terracotta Rust (`#C2410C`) — C-LOOK
  - Teal (`#0F766E`) — Research Paper LOOK
  - Amber / Ochre (`#B45309`) — Research Paper C-LOOK / Return Swings
  - Warm Stone Neutrals (`#1C1917`, `#FAF9F5`, `#E7E5DF`)

---

## 📂 Project Structure

```
OS SLA 2/
├── index.html            # Main semantic HTML structure, sidebar, and 5 interactive tabs
├── css/
│   └── styles.css        # Clean, modular CSS styling (Light theme, zero-blue palette)
├── js/
│   ├── algorithms.js     # Standard LOOK and C-LOOK engine and input validation
│   ├── javed_algorithms.js # Javed & Khan (IEEE 2000) algorithms and benchmark samples
│   ├── visualizer.js     # SVG seek trajectories, physical rail, rotary platter & bar charts
│   └── app.js            # Main controller, state manager, DOM wiring & preset handlers
└── README.md             # Project documentation and academic reference guide
```

---

## 🏃 How to Run the Simulator

Simply open `index.html` in any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Brave, Safari).

---

## 🎓 Academic Alignment & Viva Discussion Points

1. **Why LOOK over SCAN?**
   - SCAN forces the actuator arm to travel to the physical disk boundaries ($0$ and $\text{max}$) even if no requests reside there.
   - LOOK reverses immediately upon servicing the outermost pending request, eliminating empty boundary travel.

2. **Why C-LOOK over LOOK?**
   - LOOK services cylinders on both forward and reverse passes, which can create non-uniform waiting times for newly arrived requests at the opposite end of the platter.
   - C-LOOK treats cylinders as a circular list, providing uniform waiting times and lower variance in response time, preventing starvation under heavy workloads.

3. **What is the contribution of Javed & Khan's IEEE 2000 Research Paper?**
   - Standard LOOK blindly follows whatever initial direction is passed by the caller. Javed & Khan demonstrate that checking pending cylinder distribution to pick the optimal directional pass saves significant head movement by avoiding large turnaround swings.
   - Standard C-LOOK often neglects return jump mechanical latency in theoretical metrics. Javed & Khan explicitly account for the physical return swing cost to accurately model physical drive latency.
