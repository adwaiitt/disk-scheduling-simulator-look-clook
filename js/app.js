/**
 * Disk Scheduling Simulator - Application Controller
 * Handles user interactions, form validation, tab routing, animation controls,
 * and comparative evaluation with Javed & Khan (IEEE 2000) research methods.
 * SAKEC Department of Computer Engineering
 */

(function () {
  'use strict';

  const DEFAULT_CONFIG = {
    diskSize: 200,
    headPos: 50,
    direction: 'UP',
    queue: '176, 79, 34, 60, 92, 11, 41, 114'
  };

  const state = {
    activeTab: 'look',
    simulationData: null,
    isPlaying: false
  };

  const elements = {

    diskSize: document.getElementById('input-disk-size'),
    labelMaxTrack: document.getElementById('label-max-track'),
    headPos: document.getElementById('input-head-pos'),
    requestQueue: document.getElementById('input-request-queue'),
    dirUpRadio: document.getElementById('label-dir-up'),
    dirDownRadio: document.getElementById('label-dir-down'),
    dirRadios: document.getElementsByName('direction-radio'),

    btnSimulate: document.getElementById('btn-simulate'),
    btnReset: document.getElementById('btn-reset'),

    playbackBar: document.getElementById('playback-bar'),
    btnPlayPause: document.getElementById('btn-play-pause'),
    iconPlay: document.getElementById('icon-play'),
    iconPause: document.getElementById('icon-pause'),
    labelPlayPause: document.getElementById('label-play-pause'),
    btnStepPrev: document.getElementById('btn-step-prev'),
    btnStepNext: document.getElementById('btn-step-next'),
    btnStepReset: document.getElementById('btn-step-reset'),
    stepCounterBadge: document.getElementById('step-counter-badge'),

    validationAlert: document.getElementById('validation-alert'),
    validationErrorsList: document.getElementById('validation-errors-list'),

    tabButtons: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),

    platterContainerLook: document.getElementById('disk-platter-container-look'),
    svgChartLook: document.getElementById('svg-chart-look'),
    railContainerLook: document.getElementById('rail-container-look'),
    lookMetricTotal: document.getElementById('look-metric-total'),
    lookMetricAvg: document.getElementById('look-metric-avg'),
    lookMetricCount: document.getElementById('look-metric-count'),
    lookMetricDir: document.getElementById('look-metric-dir'),
    formulaTextLook: document.getElementById('formula-text-look'),
    tableBodyLook: document.getElementById('steps-table-body-look'),

    platterContainerClook: document.getElementById('disk-platter-container-clook'),
    svgChartClook: document.getElementById('svg-chart-clook'),
    railContainerClook: document.getElementById('rail-container-clook'),
    clookMetricTotal: document.getElementById('clook-metric-total'),
    clookMetricAvg: document.getElementById('clook-metric-avg'),
    clookMetricCount: document.getElementById('clook-metric-count'),
    clookMetricDir: document.getElementById('clook-metric-dir'),
    formulaTextClook: document.getElementById('formula-text-clook'),
    tableBodyClook: document.getElementById('steps-table-body-clook'),

    platterContainerJavedLook: document.getElementById('disk-platter-container-javed-look'),
    svgChartJavedLook: document.getElementById('svg-chart-javed-look'),
    railContainerJavedLook: document.getElementById('rail-container-javed-look'),
    javedLookOptBanner: document.getElementById('javed-look-opt-banner'),
    javedLookDownSeek: document.getElementById('javed-look-down-seek'),
    javedLookUpSeek: document.getElementById('javed-look-up-seek'),
    javedLookOptReason: document.getElementById('javed-look-opt-reason'),
    javedLookBadgeOpt: document.getElementById('javed-look-badge-opt'),
    javedLookOptDirText: document.getElementById('javed-look-opt-dir-text'),
    javedLookMetricTotal: document.getElementById('javed-look-metric-total'),
    javedLookMetricAvg: document.getElementById('javed-look-metric-avg'),
    javedLookMetricCount: document.getElementById('javed-look-metric-count'),
    javedLookMetricDir: document.getElementById('javed-look-metric-dir'),
    formulaTextJavedLook: document.getElementById('formula-text-javed-look'),
    tableBodyJavedLook: document.getElementById('steps-table-body-javed-look'),

    platterContainerJavedClook: document.getElementById('disk-platter-container-javed-clook'),
    platterContainerJavedCLook: document.getElementById('disk-platter-container-javed-clook'),
    svgChartJavedClook: document.getElementById('svg-chart-javed-clook'),
    svgChartJavedCLook: document.getElementById('svg-chart-javed-clook'),
    railContainerJavedClook: document.getElementById('rail-container-javed-clook'),
    railContainerJavedCLook: document.getElementById('rail-container-javed-clook'),
    javedClookMetricTotal: document.getElementById('javed-clook-metric-total'),
    javedCLookMetricTotal: document.getElementById('javed-clook-metric-total'),
    javedClookMetricAvg: document.getElementById('javed-clook-metric-avg'),
    javedCLookMetricAvg: document.getElementById('javed-clook-metric-avg'),
    javedClookMetricCount: document.getElementById('javed-clook-metric-count'),
    javedCLookMetricCount: document.getElementById('javed-clook-metric-count'),
    javedClookMetricDir: document.getElementById('javed-clook-metric-dir'),
    javedCLookMetricDir: document.getElementById('javed-clook-metric-dir'),
    formulaTextJavedClook: document.getElementById('formula-text-javed-clook'),
    formulaTextJavedCLook: document.getElementById('formula-text-javed-clook'),
    tableBodyJavedClook: document.getElementById('steps-table-body-javed-clook'),
    tableBodyJavedCLook: document.getElementById('steps-table-body-javed-clook'),

    svgChartCompareAll: document.getElementById('svg-chart-compare-all'),
    allLookTotal: document.getElementById('all-look-total'),
    allLookAvg: document.getElementById('all-look-avg'),
    allClookTotal: document.getElementById('all-clook-total'),
    allClookAvg: document.getElementById('all-clook-avg'),
    allClookJump: document.getElementById('all-clook-jump'),
    allJLookTotal: document.getElementById('all-jlook-total'),
    allJLookAvg: document.getElementById('all-jlook-avg'),
    allJLookOpt: document.getElementById('all-jlook-opt'),
    allJCLookTotal: document.getElementById('all-jclook-total'),
    allJCLookAvg: document.getElementById('all-jclook-avg'),
    allJCLookSwing: document.getElementById('all-jclook-swing'),

    matrixLookTotal: document.getElementById('matrix-look-total'),
    matrixClookTotal: document.getElementById('matrix-clook-total'),
    matrixJlookTotal: document.getElementById('matrix-jlook-total'),
    matrixJclookTotal: document.getElementById('matrix-jclook-total'),
    matrixLookAvg: document.getElementById('matrix-look-avg'),
    matrixClookAvg: document.getElementById('matrix-clook-avg'),
    matrixJlookAvg: document.getElementById('matrix-jlook-avg'),
    matrixJclookAvg: document.getElementById('matrix-jclook-avg'),

    tblLookHead: document.getElementById('tbl-look-head'),
    tblLookDir: document.getElementById('tbl-look-dir'),
    tblLookTotal: document.getElementById('tbl-look-total'),
    tblLookAvg: document.getElementById('tbl-look-avg'),
    tblLookNoSwing: document.getElementById('tbl-look-noswing'),

    tblClookHead: document.getElementById('tbl-clook-head'),
    tblClookDir: document.getElementById('tbl-clook-dir'),
    tblClookTotal: document.getElementById('tbl-clook-total'),
    tblClookAvg: document.getElementById('tbl-clook-avg'),
    tblClookNoSwing: document.getElementById('tbl-clook-noswing'),
    tblClookJump: document.getElementById('tbl-clook-jump'),

    tblJlookHead: document.getElementById('tbl-jlook-head'),
    tblJlookDir: document.getElementById('tbl-jlook-dir'),
    tblJlookTotal: document.getElementById('tbl-jlook-total'),
    tblJlookAvg: document.getElementById('tbl-jlook-avg'),
    tblJlookNoSwing: document.getElementById('tbl-jlook-noswing'),

    tblJclookHead: document.getElementById('tbl-jclook-head'),
    tblJclookDir: document.getElementById('tbl-jclook-dir'),
    tblJclookTotal: document.getElementById('tbl-jclook-total'),
    tblJclookAvg: document.getElementById('tbl-jclook-avg'),
    tblJclookNoSwing: document.getElementById('tbl-jclook-noswing'),
    tblJclookSwing: document.getElementById('tbl-jclook-swing'),

    presetButtons: document.querySelectorAll('.btn-preset-card')
  };

  function init() {
    setupInputListeners();
    setupTabListeners();
    setupPlaybackListeners();
    setupPresetListeners();

    runSimulation();
  }

  function setupInputListeners() {

    elements.diskSize.addEventListener('input', () => {
      const val = parseInt(elements.diskSize.value, 10);
      if (!isNaN(val) && val > 1) {
        elements.labelMaxTrack.textContent = val - 1;
        elements.headPos.max = val - 1;
      }
    });

    elements.dirUpRadio.addEventListener('click', () => {
      setDirection('UP');
    });

    elements.dirDownRadio.addEventListener('click', () => {
      setDirection('DOWN');
    });

    elements.btnSimulate.addEventListener('click', runSimulation);

    elements.btnReset.addEventListener('click', () => {
      elements.diskSize.value = DEFAULT_CONFIG.diskSize;
      elements.labelMaxTrack.textContent = DEFAULT_CONFIG.diskSize - 1;
      elements.headPos.value = DEFAULT_CONFIG.headPos;
      elements.headPos.max = DEFAULT_CONFIG.diskSize - 1;
      elements.requestQueue.value = DEFAULT_CONFIG.queue;
      setDirection(DEFAULT_CONFIG.direction);
      clearActivePresets();
      runSimulation();
    });
  }

  function setDirection(dir) {
    const isUp = dir.toUpperCase() === 'UP';
    elements.dirUpRadio.classList.toggle('checked', isUp);
    elements.dirDownRadio.classList.toggle('checked', !isUp);

    const targetRadio = isUp
      ? elements.dirUpRadio.querySelector('input')
      : elements.dirDownRadio.querySelector('input');
    if (targetRadio) targetRadio.checked = true;
  }

  const PRESET_CONDITIONS = {
    1: {
      title: 'Sample 1: Primary Asymmetric Benchmark',
      html: `
        <div><strong>Starting Head:</strong> Cylinder 53 (Low sector)</div>
        <div><strong>Direction Tested:</strong> Evaluates Downward vs. Upward sweep</div>
        <div style="margin-top: 4px;"><strong>Conditions Tested:</strong></div>
        <ul style="margin: 3px 0 0 16px; padding: 0;">
          <li>Requests span across head: lower [14, 37] &amp; higher [65, 67, 98, 122, 124, 183].</li>
          <li><strong>Downward sweep eliminates a 130-track turnaround swing</strong> to track 183, achieving 208 tracks vs. 299 tracks upward.</li>
        </ul>
      `
    },
    2: {
      title: 'Sample 2: Unidirectional All-Below-Head',
      html: `
        <div><strong>Starting Head:</strong> Cylinder 53 (Above all requests)</div>
        <div><strong>Direction Tested:</strong> Downward Sweep (Zero turnaround)</div>
        <div style="margin-top: 4px;"><strong>Conditions Tested:</strong></div>
        <ul style="margin: 3px 0 0 16px; padding: 0;">
          <li>100% of pending requests [2...29] are clustered below initial head (53).</li>
          <li>Tests single monotonic sweep with <strong>0 turnaround reversals</strong> in LOOK, while C-LOOK incurs an unneeded circular return jump.</li>
        </ul>
      `
    },
    3: {
      title: 'Sample 3: High Density & Multiprogramming',
      html: `
        <div><strong>Starting Head:</strong> Cylinder 53 | Disk: 250 cylinders</div>
        <div><strong>Direction Tested:</strong> Downward priority on dense cylinders</div>
        <div style="margin-top: 4px;"><strong>Conditions Tested:</strong></div>
        <ul style="margin: 3px 0 0 16px; padding: 0;">
          <li>High request density alternating across inner and outer cylinders [5...210].</li>
          <li>Tests LOOK Downward's ability to match SSTF latency without experiencing SSTF cylinder starvation.</li>
        </ul>
      `
    },
    4: {
      title: 'Sample 4: Wide Platter Boundary Spread',
      html: `
        <div><strong>Starting Head:</strong> Cylinder 53 | Disk: 300 cylinders</div>
        <div><strong>Direction Tested:</strong> Boundary sweep to cylinder 1</div>
        <div style="margin-top: 4px;"><strong>Conditions Tested:</strong></div>
        <ul style="margin: 3px 0 0 16px; padding: 0;">
          <li>Wide radial spread from outer track 1 to inner track 250.</li>
          <li>Tests sweep to platter edge (track 1) first, then continuous upward sweep to maximize actuator momentum.</li>
        </ul>
      `
    }
  };

  function setupPresetListeners() {
    const presetCards = document.querySelectorAll('.btn-preset-card');
    const condTitleEl = document.getElementById('preset-cond-title');
    const condDescEl = document.getElementById('preset-cond-desc');

    presetCards.forEach(btn => {
      btn.addEventListener('click', () => {
        const sampleId = parseInt(btn.getAttribute('data-preset') || btn.getAttribute('data-sample'), 10);
        const sample = JavedScheduler.PAPER_TEST_SAMPLES.find(s => s.id === sampleId);
        if (!sample) return;

        presetCards.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (PRESET_CONDITIONS[sampleId] && condTitleEl && condDescEl) {
          condTitleEl.textContent = PRESET_CONDITIONS[sampleId].title;
          condDescEl.innerHTML = PRESET_CONDITIONS[sampleId].html;
        }

        elements.diskSize.value = sample.diskSize;
        elements.labelMaxTrack.textContent = sample.diskSize - 1;
        elements.headPos.value = sample.initialHead;
        elements.headPos.max = sample.diskSize - 1;

        const cappedTracks = sample.tracks.slice(0, 10);
        elements.requestQueue.value = cappedTracks.join(', ');
        setDirection(sample.direction || 'DOWN');

        runSimulation();
      });
    });
  }

  function clearActivePresets() {
    const presetCards = document.querySelectorAll('.btn-preset-card');
    presetCards.forEach(b => b.classList.remove('active'));
    const condTitleEl = document.getElementById('preset-cond-title');
    const condDescEl = document.getElementById('preset-cond-desc');
    if (condTitleEl) condTitleEl.textContent = 'Test Scenario Conditions:';
    if (condDescEl) condDescEl.textContent = 'Select a preset below to see the specific head starting position, directional sweeps, and seek conditions it tests.';
  }

  function setupTabListeners() {
    elements.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        setActiveTab(targetTab);
      });
    });
  }

  function setActiveTab(tabKey) {
    state.activeTab = tabKey;

    elements.tabButtons.forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-tab') === tabKey);
    });

    elements.tabContents.forEach(content => {
      content.classList.toggle('active', content.id === `tab-content-${tabKey}`);
    });

    if (elements.playbackBar) {
      const isCompareTab = tabKey === 'compare-all' || tabKey === 'compare';
      elements.playbackBar.style.display = isCompareTab ? 'none' : 'flex';
    }

    pausePlayback();
    const activeResult = getActiveResult();
    if (activeResult) {
      DiskVisualizer.resetAnimation(activeResult);
    }
    updatePlaybackCounter(0);
  }

  function setupPlaybackListeners() {
    elements.btnPlayPause.addEventListener('click', togglePlayPause);

    elements.btnStepNext.addEventListener('click', () => {
      const activeResult = getActiveResult();
      if (!activeResult) return;
      DiskVisualizer.stepForward(activeResult);
      updatePlaybackCounter(DiskVisualizer.activeStepIndex);
    });

    elements.btnStepPrev.addEventListener('click', () => {
      const activeResult = getActiveResult();
      if (!activeResult) return;
      DiskVisualizer.stepBackward(activeResult);
      updatePlaybackCounter(DiskVisualizer.activeStepIndex);
    });

    elements.btnStepReset.addEventListener('click', () => {
      const activeResult = getActiveResult();
      if (!activeResult) return;
      DiskVisualizer.resetAnimation(activeResult);
      pausePlayback();
      updatePlaybackCounter(0);
    });
  }

  function runSimulation() {
    let selectedDir = 'UP';
    for (const r of elements.dirRadios) {
      if (r.checked) {
        selectedDir = r.value;
        break;
      }
    }

    const rawInput = {
      diskSize: elements.diskSize.value,
      initialHead: elements.headPos.value,
      initialDirection: selectedDir,
      requestQueue: elements.requestQueue.value
    };

    const validation = DiskScheduler.validateAndParseInputs(rawInput);
    if (!validation.valid) {
      showValidationErrors(validation.errors);
      return;
    }
    hideValidationErrors();

    const { diskSize, initialHead, initialDirection, requests } = validation.data;

    const basicLOOK = DiskScheduler.solveLOOK(diskSize, initialHead, initialDirection, requests);
    const basicCLOOK = DiskScheduler.solveCLOOK(diskSize, initialHead, initialDirection, requests);

    const javedLOOK = JavedScheduler.solveJavedLOOK(diskSize, initialHead, initialDirection, requests);
    const javedCLOOK = JavedScheduler.solveJavedCLOOK(diskSize, initialHead, initialDirection, requests);

    state.simulationData = {
      look: basicLOOK,
      clook: basicCLOOK,
      javedLook: javedLOOK,
      javedCLook: javedCLOOK
    };

    updateLOOKDisplay(basicLOOK, requests);
    updateCLOOKDisplay(basicCLOOK, requests);
    updateJavedLOOKDisplay(javedLOOK, requests);
    updateJavedCLOOKDisplay(javedCLOOK, requests);

    updateAllComparisonDisplay(state.simulationData);

    pausePlayback();
    DiskVisualizer.resetAnimation(getActiveResult());
    updatePlaybackCounter(0);
  }

  function showValidationErrors(errors) {
    elements.validationErrorsList.innerHTML = errors.map(e => `<li>${e}</li>`).join('');
    elements.validationAlert.style.display = 'block';
  }

  function hideValidationErrors() {
    elements.validationAlert.style.display = 'none';
  }

  function getActiveResult() {
    if (!state.simulationData) return null;
    switch (state.activeTab) {
      case 'clook':
        return state.simulationData.clook;
      case 'javed-look':
        return state.simulationData.javedLook;
      case 'javed-clook':
        return state.simulationData.javedCLook;
      case 'look':
      default:
        return state.simulationData.look;
    }
  }

  function updateLOOKDisplay(lookResult, originalRequests) {
    if (elements.lookMetricTotal) elements.lookMetricTotal.textContent = lookResult.totalHeadMovement;
    if (elements.lookMetricAvg) elements.lookMetricAvg.textContent = lookResult.averageSeekDistance.toFixed(2);
    if (elements.lookMetricCount) elements.lookMetricCount.textContent = lookResult.serviceCount;
    if (elements.lookMetricDir) elements.lookMetricDir.textContent = lookResult.initialDirection;

    const formulaSum = lookResult.steps.map(s => s.distance).join(' + ');
    elements.formulaTextLook.innerHTML = `
      <strong>Total Head Movement:</strong> ${formulaSum} = <span class="formula-highlight">${lookResult.totalHeadMovement} tracks</span>.
      <br><strong>Average Seek Distance:</strong> ${lookResult.totalHeadMovement} / ${lookResult.serviceCount} ≈ <span class="formula-highlight">${lookResult.averageSeekDistance.toFixed(2)} tracks/request</span>.
    `;

    DiskVisualizer.renderDiskPlatter(elements.platterContainerLook, lookResult);
    DiskVisualizer.renderTrajectoryGraph(elements.svgChartLook, lookResult);
    lookResult.requests = originalRequests;
    DiskVisualizer.renderPhysicalTrackBar(elements.railContainerLook, lookResult);
    populateStepsTable(elements.tableBodyLook, lookResult.steps);
  }

  function updateCLOOKDisplay(clookResult, originalRequests) {
    if (elements.clookMetricTotal) elements.clookMetricTotal.textContent = clookResult.totalHeadMovement;
    if (elements.clookMetricAvg) elements.clookMetricAvg.textContent = clookResult.averageSeekDistance.toFixed(2);
    if (elements.clookMetricCount) elements.clookMetricCount.textContent = clookResult.serviceCount;
    if (elements.clookMetricDir) elements.clookMetricDir.textContent = clookResult.initialDirection;

    const jumpStep = clookResult.steps.find(s => s.isJump);
    const formulaItems = clookResult.steps.map(s => s.isJump ? `${s.distance} (jump)` : `${s.distance}`);
    elements.formulaTextClook.innerHTML = `
      <strong>Total Head Movement (including return jump):</strong> ${formulaItems.join(' + ')} = <span class="formula-highlight">${clookResult.totalHeadMovement} tracks</span>.
      <br><strong>Average Seek Distance:</strong> ${clookResult.totalHeadMovement} / ${clookResult.serviceCount} ≈ <span class="formula-highlight">${clookResult.averageSeekDistance.toFixed(2)} tracks/request</span>.
      <br><span style="color: var(--text-muted); font-size: 11px;">*Note: If return jump of ${clookResult.jumpCount > 0 && jumpStep ? jumpStep.distance : 0} tracks is excluded (service-only seek), Total = <strong>${clookResult.seekWithoutJump} tracks</strong> (avg: ${clookResult.averageSeekNoJump.toFixed(2)} tracks/req).</span>
    `;

    DiskVisualizer.renderDiskPlatter(elements.platterContainerClook, clookResult);
    DiskVisualizer.renderTrajectoryGraph(elements.svgChartClook, clookResult);
    clookResult.requests = originalRequests;
    DiskVisualizer.renderPhysicalTrackBar(elements.railContainerClook, clookResult);
    populateStepsTable(elements.tableBodyClook, clookResult.steps);
  }

  function updateJavedLOOKDisplay(javedLookResult, originalRequests) {
    if (!elements.javedLookMetricTotal) return;

    elements.javedLookMetricTotal.textContent = javedLookResult.totalHeadMovement;
    elements.javedLookMetricAvg.textContent = javedLookResult.averageSeekDistance.toFixed(2);
    if (elements.javedLookMetricCount) elements.javedLookMetricCount.textContent = javedLookResult.serviceCount;
    if (elements.javedLookMetricDir) elements.javedLookMetricDir.textContent = javedLookResult.optimalDirection;

    if (elements.javedLookOptBanner) {
      if (elements.javedLookDownSeek) elements.javedLookDownSeek.textContent = javedLookResult.downwardHeadMovement;
      if (elements.javedLookUpSeek) elements.javedLookUpSeek.textContent = javedLookResult.upwardHeadMovement;
      if (elements.javedLookOptDirText) elements.javedLookOptDirText.textContent = javedLookResult.optimalDirection === 'DOWN' ? 'DOWNWARD' : 'UPWARD';

      if (elements.javedLookOptReason) {
        if (javedLookResult.downwardHeadMovement < javedLookResult.upwardHeadMovement) {
          const saved = javedLookResult.upwardHeadMovement - javedLookResult.downwardHeadMovement;
          elements.javedLookOptReason.textContent = `Downward direction eliminates wild turnaround swings and saves ${saved} tracks of head movement!`;
          elements.javedLookOptBanner.className = 'optimization-banner';
        } else if (javedLookResult.downwardHeadMovement > javedLookResult.upwardHeadMovement) {
          const saved = javedLookResult.downwardHeadMovement - javedLookResult.upwardHeadMovement;
          elements.javedLookOptReason.textContent = `Upward direction is optimal for this distribution, saving ${saved} tracks of head movement!`;
          elements.javedLookOptBanner.className = 'optimization-banner alert-amber';
        } else {
          elements.javedLookOptReason.textContent = 'Both directional sweeps yield identical total seek distance for this request layout.';
          elements.javedLookOptBanner.className = 'optimization-banner';
        }
      }
    }

    const formulaSum = javedLookResult.steps.map(s => s.distance).join(' + ');
    elements.formulaTextJavedLook.innerHTML = `
      <strong>Arithmetic Sum:</strong> ${formulaSum} = <span class="formula-highlight">${javedLookResult.totalHeadMovement} tracks</span>.
      <br><strong>Javed &amp; Khan Directional Formula (${javedLookResult.initialDirection}):</strong>
      ${javedLookResult.initialDirection === 'DOWN'
        ? `(${javedLookResult.initialHead} - ${javedLookResult.minTrack}) + (${javedLookResult.maxTrack} - ${javedLookResult.minTrack}) = ${javedLookResult.initialHead - javedLookResult.minTrack} + ${javedLookResult.maxTrack - javedLookResult.minTrack} = <span class="formula-highlight">${javedLookResult.totalHeadMovement} tracks</span>.`
        : `(${javedLookResult.maxTrack} - ${javedLookResult.initialHead}) + (${javedLookResult.maxTrack} - ${javedLookResult.minTrack}) = ${javedLookResult.maxTrack - javedLookResult.initialHead} + ${javedLookResult.maxTrack - javedLookResult.minTrack} = <span class="formula-highlight">${javedLookResult.totalHeadMovement} tracks</span>.`}
      <br><strong>Average Seek Distance:</strong> ${javedLookResult.totalHeadMovement} / ${javedLookResult.serviceCount} ≈ <span class="formula-highlight">${javedLookResult.averageSeekDistance.toFixed(2)} tracks/request</span>.
    `;

    javedLookResult.requests = originalRequests;
    DiskVisualizer.renderDiskPlatter(elements.platterContainerJavedLook, javedLookResult);
    DiskVisualizer.renderTrajectoryGraph(elements.svgChartJavedLook, javedLookResult);
    DiskVisualizer.renderPhysicalTrackBar(elements.railContainerJavedLook, javedLookResult);
    populateStepsTable(elements.tableBodyJavedLook, javedLookResult.steps);
  }

  function updateJavedCLOOKDisplay(javedCLookResult, originalRequests) {
    if (!elements.javedClookMetricTotal) return;

    elements.javedClookMetricTotal.textContent = javedCLookResult.totalHeadMovement;
    elements.javedClookMetricAvg.textContent = javedCLookResult.averageSeekDistance.toFixed(2);
    if (elements.javedClookMetricCount) elements.javedClookMetricCount.textContent = javedCLookResult.serviceCount;
    if (elements.javedClookMetricDir) elements.javedClookMetricDir.textContent = 'UP';

    const formulaItems = javedCLookResult.steps.map(s => s.isJump ? `${s.distance} (return swing)` : `${s.distance}`);
    if (elements.formulaTextJavedCLook) {
      elements.formulaTextJavedCLook.innerHTML = `
        <strong>Total Head Movement (with Return Swing):</strong> ${formulaItems.join(' + ')} = <span class="formula-highlight">${javedCLookResult.totalHeadMovement} tracks</span>.
        <br><strong>Average Seek Distance:</strong> ${javedCLookResult.totalHeadMovement} / ${javedCLookResult.serviceCount} ≈ <span class="formula-highlight">${javedCLookResult.averageSeekDistance.toFixed(2)} tracks/request</span>.
        <br><span style="color: var(--text-muted); font-size: 11px;">*In Javed &amp; Khan (IEEE 2000), the return swing of <strong>${javedCLookResult.returnSwingDistance} tracks</strong> is explicitly included in the total seek movement metric to reflect physical hardware latency.</span>
      `;
    }

    javedCLookResult.requests = originalRequests;
    DiskVisualizer.renderDiskPlatter(elements.platterContainerJavedClook, javedCLookResult);
    DiskVisualizer.renderTrajectoryGraph(elements.svgChartJavedClook, javedCLookResult);
    DiskVisualizer.renderPhysicalTrackBar(elements.railContainerJavedClook, javedCLookResult);
    populateStepsTable(elements.tableBodyJavedClook, javedCLookResult.steps);
  }

  function updateAllComparisonDisplay(results) {
    if (!elements.allLookTotal) return;

    const clookJump = results.clook.steps.find(s => s.isJump);
    const clookJumpDist = clookJump ? clookJump.distance : 0;

    elements.allLookTotal.textContent = `${results.look.totalHeadMovement} tracks`;
    elements.allLookAvg.textContent = `${results.look.averageSeekDistance.toFixed(2)} tr/req`;

    elements.allClookTotal.textContent = `${results.clook.totalHeadMovement} tracks`;
    elements.allClookAvg.textContent = `${results.clook.averageSeekDistance.toFixed(2)} tr/req`;
    elements.allClookJump.textContent = `${clookJumpDist} tracks`;

    elements.allJLookTotal.textContent = `${results.javedLook.totalHeadMovement} tracks`;
    elements.allJLookAvg.textContent = `${results.javedLook.averageSeekDistance.toFixed(2)} tr/req`;
    elements.allJLookOpt.textContent = results.javedLook.optimalDirection === 'DOWN' ? 'DOWNWARD' : 'UPWARD';

    elements.allJCLookTotal.textContent = `${results.javedCLook.totalHeadMovement} tracks`;
    elements.allJCLookAvg.textContent = `${results.javedCLook.averageSeekDistance.toFixed(2)} tr/req`;
    elements.allJCLookSwing.textContent = `${results.javedCLook.returnSwingDistance} tracks`;

    if (elements.matrixLookTotal) elements.matrixLookTotal.textContent = `${results.look.totalHeadMovement} tracks`;
    if (elements.matrixClookTotal) elements.matrixClookTotal.textContent = `${results.clook.totalHeadMovement} tracks`;
    if (elements.matrixJlookTotal) elements.matrixJlookTotal.textContent = `${results.javedLook.totalHeadMovement} tracks`;
    if (elements.matrixJclookTotal) elements.matrixJclookTotal.textContent = `${results.javedCLook.totalHeadMovement} tracks`;

    if (elements.matrixLookAvg) elements.matrixLookAvg.textContent = `${results.look.averageSeekDistance.toFixed(2)} tr/req`;
    if (elements.matrixClookAvg) elements.matrixClookAvg.textContent = `${results.clook.averageSeekDistance.toFixed(2)} tr/req`;
    if (elements.matrixJlookAvg) elements.matrixJlookAvg.textContent = `${results.javedLook.averageSeekDistance.toFixed(2)} tr/req`;
    if (elements.matrixJclookAvg) elements.matrixJclookAvg.textContent = `${results.javedCLook.averageSeekDistance.toFixed(2)} tr/req`;

    if (elements.tblLookHead) elements.tblLookHead.textContent = results.look.initialHead;
    if (elements.tblLookDir) elements.tblLookDir.textContent = results.look.initialDirection;
    if (elements.tblLookTotal) elements.tblLookTotal.textContent = `${results.look.totalHeadMovement} tracks`;
    if (elements.tblLookAvg) elements.tblLookAvg.textContent = `${results.look.averageSeekDistance.toFixed(2)} tr/req`;
    if (elements.tblLookNoSwing) elements.tblLookNoSwing.textContent = `${results.look.seekWithoutJump} tracks`;

    if (elements.tblClookHead) elements.tblClookHead.textContent = results.clook.initialHead;
    if (elements.tblClookDir) elements.tblClookDir.textContent = results.clook.initialDirection;
    if (elements.tblClookTotal) elements.tblClookTotal.textContent = `${results.clook.totalHeadMovement} tracks`;
    if (elements.tblClookAvg) elements.tblClookAvg.textContent = `${results.clook.averageSeekDistance.toFixed(2)} tr/req`;
    if (elements.tblClookNoSwing) elements.tblClookNoSwing.textContent = `${results.clook.seekWithoutJump} tracks`;
    if (elements.tblClookJump) elements.tblClookJump.textContent = `${clookJumpDist} tracks`;

    if (elements.tblJlookHead) elements.tblJlookHead.textContent = results.javedLook.initialHead;
    if (elements.tblJlookDir) elements.tblJlookDir.textContent = `${results.javedLook.initialDirection} (Optimal: ${results.javedLook.optimalDirection})`;
    if (elements.tblJlookTotal) elements.tblJlookTotal.textContent = `${results.javedLook.totalHeadMovement} tracks`;
    if (elements.tblJlookAvg) elements.tblJlookAvg.textContent = `${results.javedLook.averageSeekDistance.toFixed(2)} tr/req`;
    if (elements.tblJlookNoSwing) elements.tblJlookNoSwing.textContent = `${results.javedLook.seekWithoutJump} tracks`;

    if (elements.tblJclookHead) elements.tblJclookHead.textContent = results.javedCLook.initialHead;
    if (elements.tblJclookDir) elements.tblJclookDir.textContent = 'UP (Strict)';
    if (elements.tblJclookTotal) elements.tblJclookTotal.textContent = `${results.javedCLook.totalHeadMovement} tracks`;
    if (elements.tblJclookAvg) elements.tblJclookAvg.textContent = `${results.javedCLook.averageSeekDistance.toFixed(2)} tr/req`;
    if (elements.tblJclookNoSwing) elements.tblJclookNoSwing.textContent = `${results.javedCLook.seekWithoutJump} tracks`;
    if (elements.tblJclookSwing) elements.tblJclookSwing.textContent = `${results.javedCLook.returnSwingDistance} tracks`;

    DiskVisualizer.renderAllComparisonChart(elements.svgChartCompareAll, results);
  }

  function populateStepsTable(tbody, steps) {
    if (!tbody) return;
    tbody.innerHTML = '';
    for (let i = 0; i < steps.length; i++) {
      const s = steps[i];
      const tr = document.createElement('tr');
      tr.id = `step-row-${s.stepNumber}`;

      const dirClass = s.direction === 'Up'
        ? 'up'
        : (s.direction === 'Jump' || s.direction === 'Swing' ? 'jump' : 'down');
      let dirText = s.direction;
      if (s.isReverse) dirText += ' (Turn)';

      tr.innerHTML = `
        <td class="mono font-bold">${s.stepNumber}</td>
        <td class="mono font-bold">${s.fromTrack} &rarr; ${s.toTrack}</td>
        <td class="mono">${s.fromTrack}</td>
        <td class="mono">${s.toTrack}</td>
        <td class="mono font-bold">+${s.distance}</td>
        <td><span class="direction-badge ${dirClass}">${dirText}</span></td>
        <td class="mono font-bold">${s.cumulativeDistance}</td>
        <td>${s.description}</td>
      `;

      tbody.appendChild(tr);
    }
  }

  function togglePlayPause() {
    const activeResult = getActiveResult();
    if (!activeResult) return;

    if (state.isPlaying) {
      pausePlayback();
    } else {
      startPlayback(activeResult);
    }
  }

  function startPlayback(result) {
    state.isPlaying = true;
    elements.iconPlay.style.display = 'none';
    elements.iconPause.style.display = 'inline';
    elements.labelPlayPause.textContent = 'Pause';

    DiskVisualizer.startAnimation(result, (stepIndex, stepData, isFinished) => {
      updatePlaybackCounter(stepIndex);
      if (isFinished) {
        pausePlayback();
      }
    });
  }

  function pausePlayback() {
    state.isPlaying = false;
    elements.iconPlay.style.display = 'inline';
    elements.iconPause.style.display = 'none';
    elements.labelPlayPause.textContent = 'Play';
    DiskVisualizer.pauseAnimation();
  }

  function updatePlaybackCounter(currentStep) {
    const activeResult = getActiveResult();
    const total = activeResult ? activeResult.steps.length : 0;
    elements.stepCounterBadge.textContent = `Step: ${currentStep} / ${total}`;
  }

  document.addEventListener('DOMContentLoaded', init);
})();
