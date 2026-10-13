/**
 * Disk Scheduling Simulator - Visualizer Engine
 * Handles 2D SVG seek trajectory plots, 1D cylinder rail slider, and comparative bar charts.
 * SAKEC Department of Computer Engineering
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.DiskVisualizer = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function Visualizer() {
    this.currentResult = null;
    this.activeStepIndex = 0;
    this.isPlaying = false;
    this.stepIntervalMs = 800;
    this.timerId = null;
    this.onStepChange = null;
  }

  Visualizer.prototype.renderTrajectoryGraph = function (svgElement, result, options = {}) {
    if (!svgElement || !result || !result.steps || result.steps.length === 0) return;

    const { diskSize, steps, initialHead } = result;
    const prefix = result.prefix || (result.algorithm === 'C-LOOK' ? 'clook' : 'look');
    const isCLOOK = prefix.includes('clook');

    const width = options.width || 760;
    const height = options.height || 340;
    const padding = { top: 38, right: 48, bottom: 44, left: 54 };

    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    let lineColor = '#15803D';
    let nodeFill = '#F0FDF4';
    let nodeStroke = '#166534';
    const jumpColor = '#B45309';

    if (prefix === 'clook') {
      lineColor = '#C2410C';
      nodeFill = '#FFF7ED';
      nodeStroke = '#9A3412';
    } else if (prefix === 'javed-look') {
      lineColor = '#0F766E';
      nodeFill = '#F0FDFA';
      nodeStroke = '#115E59';
    } else if (prefix === 'javed-clook') {
      lineColor = '#B45309';
      nodeFill = '#FEF3C7';
      nodeStroke = '#92400E';
    }

    const scaleX = track => padding.left + (track / (diskSize - 1)) * chartW;
    const scaleY = index => padding.top + (index / steps.length) * chartH;

    let svgHtml = '<g class="grid-layer">';

    const ticks = [0, Math.floor(diskSize * 0.25), Math.floor(diskSize * 0.5), Math.floor(diskSize * 0.75), diskSize - 1];
    ticks.forEach(t => {
      const x = scaleX(t);
      svgHtml += `
        <line x1="${x}" y1="${padding.top - 8}" x2="${x}" y2="${height - padding.bottom + 8}"
              stroke="#E7E5E0" stroke-width="1" stroke-dasharray="2,3" />
        <text x="${x}" y="${height - padding.bottom + 24}"
              text-anchor="middle" font-size="11" fill="#78716C" font-weight="500">${t}</text>
      `;
    });

    svgHtml += `
      <line x1="${padding.left}" y1="${height - padding.bottom + 8}"
            x2="${width - padding.right}" y2="${height - padding.bottom + 8}"
            stroke="#D6D3CD" stroke-width="1.5" />
      <text x="${width / 2}" y="${height - 8}" text-anchor="middle" font-size="12" fill="#57534E" font-weight="600">
        Cylinder / Track Number (0 to ${diskSize - 1})
      </text>
    </g>`;

    svgHtml += '<g class="trajectory-lines">';
    let currentX = scaleX(initialHead);
    let currentY = scaleY(0);

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const nextX = scaleX(step.toTrack);
      const nextY = scaleY(i + 1);

      if (step.isJump) {
        svgHtml += `
          <line x1="${currentX}" y1="${currentY}" x2="${nextX}" y2="${nextY}"
                stroke="${jumpColor}" stroke-width="2.2" stroke-dasharray="4,4" opacity="0.9" />
          <text x="${(currentX + nextX) / 2}" y="${(currentY + nextY) / 2 - 6}"
                text-anchor="middle" font-size="10.5" font-weight="700" fill="${jumpColor}">
            ${step.direction === 'Swing' ? 'Return Swing' : 'Return Jump'} (${step.distance} tr)
          </text>
        `;
      } else {
        svgHtml += `
          <line x1="${currentX}" y1="${currentY}" x2="${nextX}" y2="${nextY}"
                stroke="${lineColor}" stroke-width="2.5" />
        `;
      }

      currentX = nextX;
      currentY = nextY;
    }
    svgHtml += '</g>';

    const startX = scaleX(initialHead);
    const startY = scaleY(0);
    svgHtml += `
      <g class="start-point" id="${prefix}-point-start">
        <circle cx="${startX}" cy="${startY}" r="7" fill="#1C1917" stroke="#FAF9F5" stroke-width="2" />
        <text x="${startX}" y="${startY - 12}" text-anchor="middle" font-size="11" font-weight="700" fill="#1C1917">
          Start (${initialHead})
        </text>
      </g>
      <g class="trajectory-nodes">
    `;

    currentX = startX;
    currentY = startY;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const nextX = scaleX(step.toTrack);
      const nextY = scaleY(i + 1);
      const isTurning = step.isReverse;
      const ptStroke = isTurning ? '#B91C1C' : (step.isJump ? jumpColor : nodeStroke);
      const ptFill = isTurning ? '#FEF2F2' : (step.isJump ? '#FFFBEB' : nodeFill);
      const ptRadius = isTurning ? 8 : (step.isJump ? 5 : 6);

      svgHtml += `
        <g class="step-point" id="${prefix}-point-step-${i + 1}" data-step="${i + 1}">
          <circle cx="${nextX}" cy="${nextY}" r="${ptRadius}" fill="${ptFill}" stroke="${ptStroke}" stroke-width="2.2" />
          <text x="${nextX}" y="${nextY + (step.isJump ? 14 : 16)}" text-anchor="middle" font-size="11" font-weight="700" fill="#1C1917">
            ${step.toTrack}
          </text>
          ${isTurning ? `
            <text x="${nextX}" y="${nextY - 13}" text-anchor="middle" font-size="10" font-weight="700" fill="#B91C1C">
              (Turn Around)
            </text>
          ` : ''}
        </g>
      `;

      currentX = nextX;
      currentY = nextY;
    }
    svgHtml += '</g>';

    svgHtml += `
      <g class="trajectory-tracker" id="${prefix}-tracker-group"
         style="transform: translate(${startX}px, 0px); transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);">
        <line id="${prefix}-tracker-line"
              x1="0" y1="${startY}" x2="0" y2="${height - padding.bottom + 8}"
              stroke="#DC2626" stroke-width="1.6" stroke-dasharray="3,3" opacity="0.85"
              style="transition: y1 0.4s cubic-bezier(0.4, 0, 0.2, 1);" />
      </g>
    `;

    svgElement.innerHTML = svgHtml;
  };

  Visualizer.prototype.renderPhysicalTrackBar = function (containerElement, result) {
    if (!containerElement || !result) return;

    const { diskSize, initialHead, requests = [] } = result;

    let html = `
      <div class="physical-strip-wrapper">
        <div class="strip-header">
          <span class="strip-title">Physical Cylinder Rail</span>
          <span class="strip-range">0 to ${diskSize - 1} tracks</span>
        </div>
        <div class="physical-track-rail-container">
          <div class="physical-track-rail">
            <div class="rail-ticks">
    `;

    const tickStep = Math.max(1, Math.floor(diskSize / 10));
    for (let t = 0; t < diskSize; t += tickStep) {
      const pct = ((t / (diskSize - 1)) * 100).toFixed(1);
      html += `<span class="rail-tick-mark" style="left: ${pct}%;"><i></i><label>${t}</label></span>`;
    }
    html += `<span class="rail-tick-mark" style="left: 100%;"><i></i><label>${diskSize - 1}</label></span>`;

    requests.forEach(req => {
      const pct = ((req / (diskSize - 1)) * 100).toFixed(1);
      html += `
        <div class="rail-request-pin" data-track="${req}" style="left: ${pct}%;" title="Requested Cylinder ${req}">
          <div class="pin-dot"></div>
          <span class="pin-label">${req}</span>
        </div>
      `;
    });

    const initialPct = ((initialHead / (diskSize - 1)) * 100).toFixed(1);
    html += `
            <div class="rail-head-cursor" style="left: ${initialPct}%;">
              <div class="cursor-arm"></div>
              <div class="cursor-needle"></div>
              <span class="cursor-badge">${initialHead}</span>
            </div>
          </div>
        </div>
      </div>
    `;

    containerElement.innerHTML = html;
  };

  function calculateActuatorGeometry(track, diskSize) {
    const Cx = 185, Cy = 115;
    const Px = 65, Py = 65;
    const L = 105;
    const R0 = 84, Rmax = 30;

    const PC = Math.hypot(Cx - Px, Cy - Py);
    const alpha = Math.atan2(Cy - Py, Cx - Px);

    const clampedTrack = Math.max(0, Math.min(diskSize - 1, track));
    const frac = clampedTrack / (diskSize - 1);
    const radius = R0 - frac * (R0 - Rmax);

    const cosCph = (PC * PC + L * L - radius * radius) / (2 * PC * L);
    const clampedCos = Math.max(-1, Math.min(1, cosCph));
    const cph = Math.acos(clampedCos);
    const theta = alpha + cph;

    return {
      radius: parseFloat(radius.toFixed(1)),
      angleDeg: parseFloat(((theta * 180) / Math.PI).toFixed(2))
    };
  }

  Visualizer.prototype.renderDiskPlatter = function (containerElement, result) {
    if (!containerElement || !result) return;

    const { diskSize, initialHead, requests = [], algorithm } = result;
    const prefix = result.prefix || (algorithm === 'C-LOOK' ? 'clook' : 'look');
    let accentColor = '#15803D';
    let accentClass = 'emerald';
    if (prefix === 'clook') {
      accentColor = '#C2410C';
      accentClass = 'terracotta';
    } else if (prefix === 'javed-look') {
      accentColor = '#0F766E';
      accentClass = 'emerald';
    } else if (prefix === 'javed-clook') {
      accentColor = '#B45309';
      accentClass = 'terracotta';
    }

    const geo = calculateActuatorGeometry(initialHead, diskSize);

    let requestedTrackRingsHtml = '';
    requests.forEach(req => {
      const r = calculateActuatorGeometry(req, diskSize).radius;
      requestedTrackRingsHtml += `
        <circle cx="185" cy="115" r="${r}" fill="none" stroke="#D6D3CD" stroke-width="0.8" stroke-dasharray="2,2" />
        <circle cx="${185 + r}" cy="115" r="2.2" fill="${accentColor}" opacity="0.75" />
      `;
    });

    const html = `
      <div class="disk-platter-card">
        <div class="platter-card-header">
          <div class="platter-card-title">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Drive Mechanism: Physical Disk Platter &amp; Rotary Actuator Arm
          </div>
          <span class="badge-tag badge-academic" style="font-size: 10px;">Hardware Simulation</span>
        </div>

        <div class="platter-body">
          <div class="platter-svg-wrapper">
            <svg id="${prefix}-platter-svg" viewBox="0 0 340 240" width="100%" height="100%">
              <defs>
                <radialGradient id="${prefix}-platter-metal" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stop-color="#E7E5E4" />
                  <stop offset="40%" stop-color="#F5F5F4" />
                  <stop offset="75%" stop-color="#E2DFD8" />
                  <stop offset="96%" stop-color="#D6D3CD" />
                  <stop offset="100%" stop-color="#A8A29E" />
                </radialGradient>
                <linearGradient id="${prefix}-arm-metal" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#78716C" />
                  <stop offset="50%" stop-color="#A8A29E" />
                  <stop offset="100%" stop-color="#57534E" />
                </linearGradient>
              </defs>

              <!-- Chassis Baseplate -->
              <rect x="6" y="2" width="328" height="236" rx="8" fill="#FBF9F5" stroke="#E2DFD8" stroke-width="1.5" />

              <!-- Outer Boundary Label (Strictly Above Disk Platter) -->
              <g class="track-boundary-badge" id="${prefix}-outer-badge">
                <rect x="105" y="4" width="160" height="17" rx="8.5" fill="#FFFFFF" stroke="#E2DFD8" stroke-width="1" />
                <text x="185" y="16" text-anchor="middle" font-size="9.5" font-weight="700" fill="#57534E" font-family="'JetBrains Mono', monospace">Track 0 (Outer: 84mm)</text>
              </g>

              <!-- Spinning Magnetic Platter -->
              <g class="spinning-platter" style="transform-origin: 185px 115px;">
                <!-- Disk Outer Rim -->
                <circle cx="185" cy="115" r="92" fill="url(#${prefix}-platter-metal)" stroke="#A8A29E" stroke-width="2" />
                <circle cx="185" cy="115" r="88" fill="none" stroke="#E7E5E0" stroke-width="1" />

                <!-- Surface Reflection Sheens -->
                <line x1="185" y1="25" x2="185" y2="205" stroke="#FFFFFF" stroke-width="1.5" opacity="0.4" />
                <line x1="95" y1="115" x2="275" y2="115" stroke="#FFFFFF" stroke-width="1.5" opacity="0.4" />
                <line x1="121" y1="51" x2="249" y2="179" stroke="#FFFFFF" stroke-width="1" opacity="0.3" />

                <!-- Concentric Physical Tracks -->
                <circle cx="185" cy="115" r="84" fill="none" stroke="#D6D3CD" stroke-width="0.9" stroke-dasharray="3,3" />
                <circle cx="185" cy="115" r="57" fill="none" stroke="#E2DFD8" stroke-width="0.8" stroke-dasharray="2,3" />
                <circle cx="185" cy="115" r="30" fill="none" stroke="#D6D3CD" stroke-width="0.9" stroke-dasharray="3,3" />

                <!-- Track Rings for Pending Requests -->
                ${requestedTrackRingsHtml}
              </g>

              <!-- Central Spindle Motor Hub -->
              <circle cx="185" cy="115" r="18" fill="#57534E" stroke="#292524" stroke-width="2" />
              <circle cx="185" cy="115" r="12" fill="#78716C" />
              <circle cx="185" cy="115" r="4.5" fill="#1C1917" />

              <!-- Active Concentric Cylinder Ring -->
              <circle class="active-cylinder-ring" cx="185" cy="115" r="${geo.radius}"
                      fill="none" stroke="${accentColor}" stroke-width="2.2" stroke-dasharray="4,2.5" />

              <!-- Actuator Base & Voice-Coil Magnet Housing -->
              <path d="M 40 45 Q 65 30 80 45 L 85 75 Q 65 90 40 75 Z" fill="#44403C" stroke="#292524" stroke-width="1.5" />
              <circle cx="58" cy="55" r="8" fill="#292524" opacity="0.6" />

              <!-- Pivoting Actuator Arm & Read/Write Head Assembly -->
              <g class="actuator-arm-group" id="${prefix}-actuator-arm" style="transform: rotate(${geo.angleDeg}deg);">
                <!-- Pivot Bearing -->
                <circle cx="65" cy="65" r="14" fill="url(#${prefix}-arm-metal)" stroke="#44403C" stroke-width="2" />
                <circle cx="65" cy="65" r="6" fill="#292524" />

                <!-- Tapered Actuator Arm Body -->
                <polygon points="65,58 160,63.5 170,65 160,66.5 65,72" fill="url(#${prefix}-arm-metal)" stroke="#44403C" stroke-width="1.2" />
                <line x1="75" y1="65" x2="155" y2="65" stroke="#FFFFFF" stroke-width="1" opacity="0.5" />

                <!-- Head Gimbal Flexure -->
                <line x1="162" y1="65" x2="170" y2="65" stroke="#1C1917" stroke-width="1.8" />

                <!-- Read/Write Head Slider Block -->
                <rect x="166" y="62" width="8" height="6" rx="1.5" fill="#1C1917" stroke="#44403C" stroke-width="0.8" />

                <!-- Active Magnetic Sensor LED at Head Tip -->
                <circle cx="170" cy="65" r="2.8" fill="${accentColor}" stroke="#FFFFFF" stroke-width="1" />
              </g>

              <!-- Inner Boundary Label (Strictly Below Disk Platter) -->
              <g class="track-boundary-badge" id="${prefix}-inner-badge">
                <rect x="110" y="215" width="150" height="17" rx="8.5" fill="#FFFFFF" stroke="#E2DFD8" stroke-width="1" />
                <text x="185" y="227" text-anchor="middle" font-size="9.5" font-weight="700" fill="#57534E" font-family="'JetBrains Mono', monospace">Inner: Track ${diskSize - 1} (30mm)</text>
              </g>
            </svg>
          </div>

          <!-- Drive Mechanism HUD Monitor -->
          <div class="platter-hud">
            <div class="platter-hud-grid">
              <div class="platter-hud-box">
                <div class="platter-hud-label">Active Cylinder</div>
                <div class="platter-hud-val ${accentClass}" id="${prefix}-platter-track">${initialHead}</div>
              </div>
              <div class="platter-hud-box">
                <div class="platter-hud-label">Head Radius</div>
                <div class="platter-hud-val mono" id="${prefix}-platter-radius">${geo.radius} mm</div>
              </div>
              <div class="platter-hud-box">
                <div class="platter-hud-label">Radial Travel</div>
                <div class="platter-hud-val mono" id="${prefix}-platter-travel">0 tr</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    containerElement.innerHTML = html;
  };

  Visualizer.prototype.updateDiskPlatter = function (prefix, result, stepIndex) {
    const isStepZero = stepIndex === 0;
    const currentStep = isStepZero ? null : result.steps[stepIndex - 1];
    const currentTrack = isStepZero ? result.initialHead : currentStep.toTrack;
    const distance = isStepZero ? 0 : currentStep.distance;

    const geo = calculateActuatorGeometry(currentTrack, result.diskSize);

    const arm = document.getElementById(`${prefix}-actuator-arm`);
    if (arm) {
      arm.style.transform = `rotate(${geo.angleDeg}deg)`;
    }

    const ring = document.querySelector(`#${prefix}-platter-svg .active-cylinder-ring`);
    if (ring) {
      ring.setAttribute('r', geo.radius);
    }

    const trackEl = document.getElementById(`${prefix}-platter-track`);
    const radiusEl = document.getElementById(`${prefix}-platter-radius`);
    const travelEl = document.getElementById(`${prefix}-platter-travel`);

    if (trackEl) trackEl.textContent = currentTrack;
    if (radiusEl) radiusEl.textContent = `${geo.radius} mm`;
    if (travelEl) travelEl.textContent = isStepZero ? '0 tr' : `+${distance} tr`;
  };

  Visualizer.prototype.highlightStep = function (stepIndex, result) {
    if (!result || !result.steps) return;
    this.activeStepIndex = stepIndex;

    const steps = result.steps;
    const currentTrack = stepIndex === 0 ? result.initialHead : steps[stepIndex - 1].toTrack;
    const pct = ((currentTrack / (result.diskSize - 1)) * 100).toFixed(1);
    const prefix = result.prefix || (result.algorithm === 'C-LOOK' ? 'clook' : 'look');
    const isCLOOK = prefix.includes('clook');

    const containerId = `rail-container-${prefix}`;
    const container = document.getElementById(containerId);

    if (container) {
      const railCursor = container.querySelector('.rail-head-cursor');
      const railBadge = container.querySelector('.cursor-badge');
      if (railCursor) railCursor.style.left = `${pct}%`;
      if (railBadge) railBadge.textContent = currentTrack;

      const servicedTracks = new Set(
        steps.slice(0, stepIndex).filter(s => s.isService).map(s => s.toTrack)
      );

      container.querySelectorAll('.rail-request-pin').forEach(pin => {
        const pinTrack = parseInt(pin.getAttribute('data-track'), 10);
        pin.classList.toggle('serviced', servicedTracks.has(pinTrack));
      });
    }

    const svgId = `svg-chart-${prefix}`;
    const svgElem = document.getElementById(svgId);
    if (svgElem) {
      svgElem.querySelectorAll('.step-point').forEach(pt => pt.classList.remove('active-step-point'));
      if (stepIndex > 0) {
        const activePt = svgElem.querySelector(`.step-point[data-step="${stepIndex}"]`);
        if (activePt) activePt.classList.add('active-step-point');
      }

      const trackerGroup = document.getElementById(`${prefix}-tracker-group`);
      const trackerLine = document.getElementById(`${prefix}-tracker-line`);
      if (trackerGroup && trackerLine) {
        const width = 760;
        const height = 340;
        const padding = { top: 38, right: 48, bottom: 44, left: 54 };
        const chartW = width - padding.left - padding.right;
        const chartH = height - padding.top - padding.bottom;
        const currentX = padding.left + (currentTrack / (result.diskSize - 1)) * chartW;
        const currentY = padding.top + (stepIndex / steps.length) * chartH;

        trackerGroup.style.transform = `translate(${currentX}px, 0px)`;
        trackerLine.setAttribute('y1', currentY);
      }
    }

    const tbodyId = `steps-table-body-${prefix}`;
    const tableRows = document.querySelectorAll(`#${tbodyId} tr`);
    tableRows.forEach(tr => tr.classList.remove('active-row'));
    if (stepIndex > 0 && tableRows[stepIndex - 1]) {
      tableRows[stepIndex - 1].classList.add('active-row');
    }

    this.updateDiskPlatter(prefix, result, stepIndex);

    if (this.onStepChange) {
      this.onStepChange(stepIndex, steps[stepIndex - 1] || null);
    }
  };

  Visualizer.prototype.startAnimation = function (result, onStep) {
    if (!result || !result.steps || result.steps.length === 0) return;
    this.currentResult = result;
    this.onStepChange = onStep;
    this.isPlaying = true;

    if (this.activeStepIndex >= result.steps.length) {
      this.activeStepIndex = 0;
    }

    this.timerId = setInterval(() => {
      if (this.activeStepIndex < result.steps.length) {
        this.activeStepIndex++;
        this.highlightStep(this.activeStepIndex, result);
        if (this.activeStepIndex >= result.steps.length) {
          this.pauseAnimation();
          if (onStep) onStep(this.activeStepIndex, result.steps[this.activeStepIndex - 1], true);
        }
      } else {
        this.pauseAnimation();
      }
    }, this.stepIntervalMs);
  };

  Visualizer.prototype.pauseAnimation = function () {
    this.isPlaying = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  };

  Visualizer.prototype.stepForward = function (result) {
    if (!result || !result.steps) return;
    this.pauseAnimation();
    if (this.activeStepIndex < result.steps.length) {
      this.activeStepIndex++;
      this.highlightStep(this.activeStepIndex, result);
    }
  };

  Visualizer.prototype.stepBackward = function (result) {
    if (!result || !result.steps) return;
    this.pauseAnimation();
    if (this.activeStepIndex > 0) {
      this.activeStepIndex--;
      this.highlightStep(this.activeStepIndex, result);
    }
  };

  Visualizer.prototype.resetAnimation = function (result) {
    this.pauseAnimation();
    this.activeStepIndex = 0;
    this.highlightStep(0, result);
  };

  Visualizer.prototype.renderComparisonChart = function (svgElement, comparisonSuite) {
    if (!svgElement || !comparisonSuite || !comparisonSuite.LOOK || !comparisonSuite['C-LOOK']) return;

    const lookTotal = comparisonSuite.LOOK.totalHeadMovement;
    const clookTotal = comparisonSuite['C-LOOK'].totalHeadMovement;
    const lookAvg = comparisonSuite.LOOK.averageSeekDistance;
    const clookAvg = comparisonSuite['C-LOOK'].averageSeekDistance;

    const totalCeiling = Math.max(50, Math.ceil((Math.max(lookTotal, clookTotal, 10) * 1.25) / 50) * 50);
    const avgCeiling = Math.max(10, Math.ceil((Math.max(lookAvg, clookAvg, 5) * 1.25) / 10) * 10);

    const topY = 48;
    const chartH = 170;
    const baseY = topY + chartH;
    const barW = 52;

    const scaleY = (val, max) => topY + chartH - (val / max) * chartH;

    let svgHtml = `
      <defs>
        <linearGradient id="emeraldBarGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#16A34A" />
          <stop offset="100%" stop-color="#15803D" />
        </linearGradient>
        <linearGradient id="terracottaBarGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#EA580C" />
          <stop offset="100%" stop-color="#C2410C" />
        </linearGradient>
      </defs>
    `;

    const panels = [
      {
        title: 'Total Head Movement (tracks)',
        padLeft: 52,
        ceiling: totalCeiling,
        lookVal: lookTotal,
        clookVal: clookTotal,
        format: v => `${v} tr`
      },
      {
        title: 'Average Seek Distance (tracks/req)',
        padLeft: 380,
        ceiling: avgCeiling,
        lookVal: lookAvg,
        clookVal: clookAvg,
        format: v => `${v.toFixed(2)} tr`
      }
    ];

    panels.forEach(p => {
      const panelWidth = 236;
      const xLook = p.padLeft + 36;
      const xClook = p.padLeft + 144;

      svgHtml += `
        <text x="${p.padLeft + panelWidth / 2}" y="24" text-anchor="middle" font-size="12" font-weight="700" fill="#1C1917">
          ${p.title}
        </text>
      `;

      for (let i = 0; i <= 4; i++) {
        const val = Math.round((p.ceiling / 4) * i);
        const y = scaleY(val, p.ceiling);
        svgHtml += `
          <line x1="${p.padLeft}" y1="${y}" x2="${p.padLeft + panelWidth}" y2="${y}" stroke="#E7E5E0" stroke-width="1" stroke-dasharray="2,3" />
          <text x="${p.padLeft - 8}" y="${y + 4}" text-anchor="end" font-size="10.5" font-family="'JetBrains Mono', monospace" fill="#78716C">${val}</text>
        `;
      }
      svgHtml += `<line x1="${p.padLeft}" y1="${baseY}" x2="${p.padLeft + panelWidth}" y2="${baseY}" stroke="#D6D3CD" stroke-width="1.5" />`;

      const hLook = Math.max(3, baseY - scaleY(p.lookVal, p.ceiling));
      svgHtml += `
        <g class="bar-group">
          <rect x="${xLook}" y="${baseY - hLook}" width="${barW}" height="${hLook}" rx="5" fill="url(#emeraldBarGrad)" stroke="#166534" stroke-width="1.5" />
          <rect x="${xLook + barW / 2 - 34}" y="${baseY - hLook - 22}" width="68" height="17" rx="4" fill="#FFFFFF" stroke="#E2DFD8" stroke-width="1" />
          <text x="${xLook + barW / 2}" y="${baseY - hLook - 10}" text-anchor="middle" font-size="10" font-weight="800" font-family="'JetBrains Mono', monospace" fill="#1C1917">
            ${p.format(p.lookVal)}
          </text>
          <text x="${xLook + barW / 2}" y="${baseY + 18}" text-anchor="middle" font-size="12" font-weight="700" fill="#1C1917">LOOK</text>
        </g>
      `;

      const hClook = Math.max(3, baseY - scaleY(p.clookVal, p.ceiling));
      svgHtml += `
        <g class="bar-group">
          <rect x="${xClook}" y="${baseY - hClook}" width="${barW}" height="${hClook}" rx="5" fill="url(#terracottaBarGrad)" stroke="#9A3412" stroke-width="1.5" />
          <rect x="${xClook + barW / 2 - 34}" y="${baseY - hClook - 22}" width="68" height="17" rx="4" fill="#FFFFFF" stroke="#E2DFD8" stroke-width="1" />
          <text x="${xClook + barW / 2}" y="${baseY - hClook - 10}" text-anchor="middle" font-size="10" font-weight="800" font-family="'JetBrains Mono', monospace" fill="#1C1917">
            ${p.format(p.clookVal)}
          </text>
          <text x="${xClook + barW / 2}" y="${baseY + 18}" text-anchor="middle" font-size="12" font-weight="700" fill="#1C1917">C-LOOK</text>
        </g>
      `;
    });

    svgHtml += `<line x1="330" y1="16" x2="330" y2="${baseY + 8}" stroke="#E2DFD8" stroke-width="1.2" stroke-dasharray="3,3" />`;

    svgElement.innerHTML = svgHtml;
  };

  Visualizer.prototype.renderAllComparisonChart = function (svgElement, allResults) {
    if (!svgElement || !allResults) return;

    const lookTotal = allResults.look.totalHeadMovement;
    const clookTotal = allResults.clook.totalHeadMovement;
    const jLookTotal = allResults.javedLook.totalHeadMovement;
    const jCLookTotal = allResults.javedCLook.totalHeadMovement;

    const lookAvg = allResults.look.averageSeekDistance;
    const clookAvg = allResults.clook.averageSeekDistance;
    const jLookAvg = allResults.javedLook.averageSeekDistance;
    const jCLookAvg = allResults.javedCLook.averageSeekDistance;

    const maxTotal = Math.max(lookTotal, clookTotal, jLookTotal, jCLookTotal, 10);
    const totalCeiling = Math.max(50, Math.ceil((maxTotal * 1.25) / 50) * 50);

    const maxAvg = Math.max(lookAvg, clookAvg, jLookAvg, jCLookAvg, 5);
    const avgCeiling = Math.max(10, Math.ceil((maxAvg * 1.25) / 10) * 10);

    const topY = 46;
    const chartH = 175;
    const baseY = topY + chartH;
    const barW = 42;
    const gap = 24;
    const panelWidth = 350;

    const scaleY = (val, max) => topY + chartH - (val / max) * chartH;

    let svgHtml = `
      <defs>
        <linearGradient id="allLookGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#16A34A" />
          <stop offset="100%" stop-color="#15803D" />
        </linearGradient>
        <linearGradient id="allCLookGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#EA580C" />
          <stop offset="100%" stop-color="#C2410C" />
        </linearGradient>
        <linearGradient id="allJLookGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#14B8A6" />
          <stop offset="100%" stop-color="#0F766E" />
        </linearGradient>
        <linearGradient id="allJCLookGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#D97706" />
          <stop offset="100%" stop-color="#B45309" />
        </linearGradient>
      </defs>
    `;

    const panels = [
      {
        title: 'Total Head Movement (tracks - lower is better)',
        padLeft: 56,
        ceiling: totalCeiling,
        items: [
          { line1: 'Basic', line2: 'LOOK', val: lookTotal, grad: 'allLookGrad', stroke: '#166534', format: v => `${v} tr` },
          { line1: 'Basic', line2: 'C-LOOK', val: clookTotal, grad: 'allCLookGrad', stroke: '#9A3412', format: v => `${v} tr` },
          { line1: 'Paper', line2: 'LOOK', val: jLookTotal, grad: 'allJLookGrad', stroke: '#115E59', format: v => `${v} tr` },
          { line1: 'Paper', line2: 'C-LOOK', val: jCLookTotal, grad: 'allJCLookGrad', stroke: '#92400E', format: v => `${v} tr` }
        ]
      },
      {
        title: 'Average Seek Distance (tracks/req - lower is better)',
        padLeft: 494,
        ceiling: avgCeiling,
        items: [
          { line1: 'Basic', line2: 'LOOK', val: lookAvg, grad: 'allLookGrad', stroke: '#166534', format: v => `${v.toFixed(2)}` },
          { line1: 'Basic', line2: 'C-LOOK', val: clookAvg, grad: 'allCLookGrad', stroke: '#9A3412', format: v => `${v.toFixed(2)}` },
          { line1: 'Paper', line2: 'LOOK', val: jLookAvg, grad: 'allJLookGrad', stroke: '#115E59', format: v => `${v.toFixed(2)}` },
          { line1: 'Paper', line2: 'C-LOOK', val: jCLookAvg, grad: 'allJCLookGrad', stroke: '#92400E', format: v => `${v.toFixed(2)}` }
        ]
      }
    ];

    panels.forEach(p => {

      svgHtml += `
        <text x="${p.padLeft + panelWidth / 2}" y="24" text-anchor="middle" font-size="12.5" font-weight="700" fill="#1C1917">
          ${p.title}
        </text>
      `;

      for (let i = 0; i <= 4; i++) {
        const val = Math.round((p.ceiling / 4) * i);
        const y = scaleY(val, p.ceiling);
        svgHtml += `
          <line x1="${p.padLeft}" y1="${y}" x2="${p.padLeft + panelWidth}" y2="${y}" stroke="#E7E5E0" stroke-width="1" stroke-dasharray="2,3" />
          <text x="${p.padLeft - 10}" y="${y + 4}" text-anchor="end" font-size="11" font-family="'JetBrains Mono', monospace" fill="#78716C">${val}</text>
        `;
      }
      svgHtml += `<line x1="${p.padLeft}" y1="${baseY}" x2="${p.padLeft + panelWidth}" y2="${baseY}" stroke="#D6D3CD" stroke-width="1.5" />`;

      const startX = p.padLeft + (panelWidth - (4 * barW + 3 * gap)) / 2;
      p.items.forEach((item, idx) => {
        const x = startX + idx * (barW + gap);
        const h = Math.max(3, baseY - scaleY(item.val, p.ceiling));

        svgHtml += `
          <g class="bar-group">
            <rect x="${x}" y="${baseY - h}" width="${barW}" height="${h}" rx="5" fill="url(#${item.grad})" stroke="${item.stroke}" stroke-width="1.3" />
            <rect x="${x + barW / 2 - 30}" y="${baseY - h - 22}" width="60" height="17" rx="3.5" fill="#FFFFFF" stroke="#E2DFD8" stroke-width="0.9" />
            <text x="${x + barW / 2}" y="${baseY - h - 10}" text-anchor="middle" font-size="9.5" font-weight="800" font-family="'JetBrains Mono', monospace" fill="#1C1917">
              ${item.format(item.val)}
            </text>
            <text x="${x + barW / 2}" y="${baseY + 16}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#292524">
              <tspan x="${x + barW / 2}" dy="0">${item.line1}</tspan>
              <tspan x="${x + barW / 2}" dy="13">${item.line2}</tspan>
            </text>
          </g>
        `;
      });
    });

    svgHtml += `<line x1="450" y1="18" x2="450" y2="${baseY + 22}" stroke="#E2DFD8" stroke-width="1.2" stroke-dasharray="3,3" />`;

    svgElement.innerHTML = svgHtml;
  };

  return new Visualizer();
});
