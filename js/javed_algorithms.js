/**
 * Javed & Khan (IEEE 2000) Disk Scheduling Algorithms Engine
 * Reference: "Simulation and Performance Comparison of Four Disk Scheduling Algorithms"
 * Authors: Dr. Muhammad Younus Javed and Mr. Ihsan Ullah Khan
 * College of Electrical and Mechanical Engineering, NUST / IEEE 2000
 *
 * Implements:
 * 1. Javed's LOOK Algorithm (Upward & Downward directional optimization)
 * 2. Javed's C-LOOK Algorithm (Strict unidirectional upward scan with mechanical return swing)
 * 3. Companion FCFS & SSTF algorithms for reproducing research benchmarks
 * 4. Official 5 Test Samples from the Research Paper
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.JavedScheduler = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const PAPER_TEST_SAMPLES = [
    {
      id: 1,
      name: 'Sample 1 (8 Tracks - Benchmark)',
      diskSize: 200,
      initialHead: 53,
      direction: 'DOWN',
      tracks: [98, 183, 37, 122, 14, 124, 65, 67],
      expectedResults: {
        fcfs: 640,
        sstf: 236,
        lookUp: 299,
        lookDown: 208,
        clook: 322
      },
      note: 'LOOK (Downward) provides the lowest head movement (208 tracks), beating SSTF (236 tracks) by avoiding the upward turn swing.'
    },
    {
      id: 2,
      name: 'Sample 2 (12 Tracks - All Below Head)',
      diskSize: 200,
      initialHead: 53,
      direction: 'DOWN',
      tracks: [2, 5, 7, 10, 15, 17, 19, 23, 26, 29, 31, 35],
      expectedResults: {
        fcfs: 84,
        sstf: 51,
        lookUp: 51,
        lookDown: 51,
        clook: 84
      },
      note: 'All requests are below initial head (53) in ascending order. Downward sweep achieves 51 tracks without any reversal.'
    },
    {
      id: 3,
      name: 'Sample 3 (24 Tracks - High Load)',
      diskSize: 250,
      initialHead: 53,
      direction: 'DOWN',
      tracks: [47, 35, 180, 132, 156, 23, 34, 5, 210, 83, 96, 103, 88, 76, 113, 128, 73, 120, 169, 123, 111, 179, 136, 40],
      expectedResults: {
        fcfs: 1255,
        sstf: 253,
        lookUp: 362,
        lookDown: 253,
        clook: 404
      },
      note: 'LOOK Downward matches SSTF (253 tracks) while C-LOOK experiences 404 tracks due to the 210 -> 5 return jump.'
    },
    {
      id: 4,
      name: 'Sample 4 (24 Tracks - Broad Platter Spread)',
      diskSize: 300,
      initialHead: 53,
      direction: 'DOWN',
      tracks: [77, 5, 11, 175, 25, 38, 1, 20, 250, 17, 211, 15, 37, 285, 149, 42, 19, 32, 2, 31, 6, 34, 48, 125],
      expectedResults: {
        fcfs: 2290,
        sstf: 336,
        lookUp: 516,
        lookDown: 336,
        clook: 563
      },
      note: 'LOOK Downward achieves 336 tracks by sweeping downward to track 1 first, then sweeping uninterrupted to track 285.'
    },
    {
      id: 5,
      name: 'Sample 5 (50 Tracks - Intensive Multiprogramming)',
      diskSize: 350,
      initialHead: 53,
      direction: 'DOWN',
      tracks: [272, 69, 23, 58, 190, 205, 39, 117, 25, 213, 121, 290, 310, 19, 80, 8, 94, 222, 40, 176, 312, 303, 260, 150, 167, 32, 27, 253, 122, 73, 134, 11, 5, 83, 50, 2, 240, 301, 4, 263, 138, 7, 291, 319, 9, 15, 230, 88, 1],
      expectedResults: {
        fcfs: 5804,
        sstf: 590,
        lookUp: 584,
        lookDown: 370,
        clook: 633
      },
      note: 'Major Paper Finding: LOOK Downward (370 tracks) heavily outperforms SSTF (590) and LOOK Upward (584), cutting unnecessary head travel.'
    }
  ];

  function buildJavedPlan(pathList, headStart, algorithmKey) {
    const steps = [];
    let current = headStart;
    let cumulative = 0;
    let serviceCount = 0;
    let jumpCount = 0;
    let seekWithoutJump = 0;

    for (let i = 0; i < pathList.length; i++) {
      const item = pathList[i];
      const target = item.track;
      const distance = Math.abs(target - current);
      cumulative += distance;

      if (item.isJump) {
        jumpCount++;
      } else {
        seekWithoutJump += distance;
        if (item.isService) serviceCount++;
      }

      steps.push({
        stepNumber: i + 1,
        fromTrack: current,
        toTrack: target,
        distance,
        direction: item.directionLabel || (target > current ? 'Up' : (target < current ? 'Down' : 'Same')),
        isService: Boolean(item.isService),
        isJump: Boolean(item.isJump),
        isReverse: Boolean(item.isReverse),
        description: item.description || '',
        cumulativeDistance: cumulative
      });

      current = target;
    }

    const totalHeadMovement = cumulative;
    const averageSeekDistance = serviceCount > 0 ? parseFloat((totalHeadMovement / serviceCount).toFixed(2)) : 0;
    const averageSeekNoJump = serviceCount > 0 ? parseFloat((seekWithoutJump / serviceCount).toFixed(2)) : 0;

    return {
      steps,
      totalHeadMovement,
      averageSeekDistance,
      seekWithoutJump,
      averageSeekNoJump,
      serviceCount,
      jumpCount,
      path: [headStart, ...pathList.map(p => p.track)]
    };
  }

  function solveJavedLOOK(diskSize, initialHead, requestedDirection, requests) {
    const uniqueReqs = Array.from(new Set(requests));
    const higher = uniqueReqs.filter(r => r > initialHead).sort((a, b) => a - b);
    const lower = uniqueReqs.filter(r => r < initialHead).sort((a, b) => a - b);
    const onHead = uniqueReqs.filter(r => r === initialHead);

    const minTrack = Math.min(...uniqueReqs);
    const maxTrack = Math.max(...uniqueReqs);

    let thmDownward = 0;
    let thmUpward = 0;

    if (higher.length > 0 && lower.length > 0) {
      thmDownward = (initialHead - minTrack) + (maxTrack - minTrack);
      thmUpward = (maxTrack - initialHead) + (maxTrack - minTrack);
    } else if (higher.length > 0 && lower.length === 0) {
      thmDownward = maxTrack - initialHead;
      thmUpward = maxTrack - initialHead;
    } else {
      thmDownward = initialHead - minTrack;
      thmUpward = initialHead - minTrack;
    }

    const optimalDirection = thmDownward <= thmUpward ? 'DOWN' : 'UP';
    const effectiveDir = (requestedDirection || optimalDirection).toUpperCase();

    const pathList = [];

    if (onHead.length > 0) {
      pathList.push({
        track: initialHead,
        isService: true,
        directionLabel: 'Current Track',
        description: `Servicing request immediately at initial head track ${initialHead}`
      });
    }

    const reorderedQueue = [];

    if (effectiveDir === 'DOWN') {
      const lowerDesc = [...lower].sort((a, b) => b - a);
      lowerDesc.forEach((track, idx) => {
        reorderedQueue.push(track);
        pathList.push({
          track,
          isService: true,
          directionLabel: 'Down',
          description: idx === 0 && onHead.length === 0
            ? `Move downward from ${initialHead} to service track ${track}`
            : `Service pending downward request at track ${track}`
        });
      });

      if (higher.length > 0) {
        higher.forEach((track, idx) => {
          reorderedQueue.push(track);
          pathList.push({
            track,
            isService: true,
            isReverse: idx === 0,
            directionLabel: 'Up',
            description: idx === 0
              ? `Reached lowest track (${pathList[pathList.length - 1].track}); reverse direction and sweep upward to track ${track}`
              : `Service request at track ${track}`
          });
        });
      }
    } else {

      higher.forEach((track, idx) => {
        reorderedQueue.push(track);
        pathList.push({
          track,
          isService: true,
          directionLabel: 'Up',
          description: idx === 0 && onHead.length === 0
            ? `Move upward from ${initialHead} to service track ${track}`
            : `Service pending upward request at track ${track}`
        });
      });

      if (lower.length > 0) {
        const lowerDesc = [...lower].sort((a, b) => b - a);
        lowerDesc.forEach((track, idx) => {
          reorderedQueue.push(track);
          pathList.push({
            track,
            isService: true,
            isReverse: idx === 0,
            directionLabel: 'Down',
            description: idx === 0
              ? `Reached highest track (${pathList[pathList.length - 1].track}); reverse direction and sweep downward to track ${track}`
              : `Service request at track ${track}`
          });
        });
      }
    }

    const plan = buildJavedPlan(pathList, initialHead, 'javed-look');

    return {
      algorithm: 'Javed-LOOK',
      fullName: "Javed's LOOK Algorithm (IEEE 2000)",
      prefix: 'javed-look',
      diskSize,
      initialHead,
      initialDirection: effectiveDir,
      optimalDirection,
      reorderedQueue,
      requests: uniqueReqs,
      downwardHeadMovement: thmDownward,
      upwardHeadMovement: thmUpward,
      isOptimalDirection: effectiveDir === optimalDirection,
      minTrack,
      maxTrack,
      ...plan
    };
  }

  function solveJavedCLOOK(diskSize, initialHead, requestedDirection, requests) {
    const uniqueReqs = Array.from(new Set(requests));
    const higher = uniqueReqs.filter(r => r > initialHead).sort((a, b) => a - b);
    const lower = uniqueReqs.filter(r => r < initialHead).sort((a, b) => a - b);
    const onHead = uniqueReqs.filter(r => r === initialHead);

    const pathList = [];
    const reorderedQueue = [];

    if (onHead.length > 0) {
      pathList.push({
        track: initialHead,
        isService: true,
        directionLabel: 'Current Track',
        description: `Servicing request immediately at initial head track ${initialHead}`
      });
    }

    higher.forEach((track, idx) => {
      reorderedQueue.push(track);
      pathList.push({
        track,
        isService: true,
        directionLabel: 'Up',
        description: idx === 0 && onHead.length === 0
          ? `Move upward from initial head ${initialHead} to service track ${track}`
          : `Service pending upward request at track ${track}`
      });
    });

    let returnSwingDistance = 0;

    if (lower.length > 0) {
      const highestUpward = higher.length > 0 ? higher[higher.length - 1] : initialHead;
      const lowestPending = lower[0];
      returnSwingDistance = Math.abs(highestUpward - lowestPending);

      reorderedQueue.push(lowestPending);

      pathList.push({
        track: lowestPending,
        isService: true,
        isJump: true,
        directionLabel: 'Swing',
        description: `Fast circular return swing: ${highestUpward} → ${lowestPending} (${returnSwingDistance} tracks without intermediate servicing)`
      });

      for (let i = 1; i < lower.length; i++) {
        reorderedQueue.push(lower[i]);
        pathList.push({
          track: lower[i],
          isService: true,
          directionLabel: 'Up',
          description: `Resume upward scan and service track ${lower[i]}`
        });
      }
    }

    const plan = buildJavedPlan(pathList, initialHead, 'javed-clook');

    return {
      algorithm: 'Javed-C-LOOK',
      fullName: "Javed's C-LOOK Algorithm (IEEE 2000)",
      prefix: 'javed-clook',
      diskSize,
      initialHead,
      initialDirection: 'UP',
      returnSwingDistance,
      reorderedQueue,
      requests: uniqueReqs,
      ...plan
    };
  }

  function solveFCFS(diskSize, initialHead, requests) {
    const uniqueReqs = Array.from(new Set(requests));
    const pathList = [];

    for (let i = 0; i < uniqueReqs.length; i++) {
      const track = uniqueReqs[i];
      pathList.push({
        track,
        isService: true,
        directionLabel: track > (i === 0 ? initialHead : uniqueReqs[i - 1]) ? 'Up' : 'Down',
        description: `Service request in arrival order at track ${track}`
      });
    }

    return {
      algorithm: 'FCFS',
      fullName: 'First-Come First-Served (Paper Baseline)',
      prefix: 'fcfs',
      diskSize,
      initialHead,
      reorderedQueue: [...uniqueReqs],
      ...buildJavedPlan(pathList, initialHead, 'fcfs')
    };
  }

  function solveSSTF(diskSize, initialHead, requests) {
    const pending = Array.from(new Set(requests));
    const pathList = [];
    const reorderedQueue = [];
    let currentHead = initialHead;

    while (pending.length > 0) {
      let minDistance = Infinity;
      let chosenIdx = -1;

      for (let i = 0; i < pending.length; i++) {
        const dist = Math.abs(pending[i] - currentHead);
        if (dist < minDistance) {
          minDistance = dist;
          chosenIdx = i;
        }
      }

      const target = pending.splice(chosenIdx, 1)[0];
      reorderedQueue.push(target);
      pathList.push({
        track: target,
        isService: true,
        directionLabel: target > currentHead ? 'Up' : (target < currentHead ? 'Down' : 'Same'),
        description: `Service closest request at track ${target} (Seek distance: ${minDistance})`
      });
      currentHead = target;
    }

    return {
      algorithm: 'SSTF',
      fullName: 'Shortest Seek Time First (Paper Greedy Benchmark)',
      prefix: 'sstf',
      diskSize,
      initialHead,
      reorderedQueue,
      ...buildJavedPlan(pathList, initialHead, 'sstf')
    };
  }

  function compareAllWithPaper(diskSize, initialHead, initialDirection, requests) {
    return {
      javedLook: solveJavedLOOK(diskSize, initialHead, initialDirection, requests),
      javedCLook: solveJavedCLOOK(diskSize, initialHead, initialDirection, requests),
      fcfs: solveFCFS(diskSize, initialHead, requests),
      sstf: solveSSTF(diskSize, initialHead, requests)
    };
  }

  return {
    PAPER_TEST_SAMPLES,
    solveJavedLOOK,
    solveJavedCLOOK,
    solveFCFS,
    solveSSTF,
    compareAllWithPaper
  };
});
