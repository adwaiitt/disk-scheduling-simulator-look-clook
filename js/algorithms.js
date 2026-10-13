/**
 * Disk Scheduling Simulator - Algorithmic Core
 * LOOK and C-LOOK scheduling algorithms with input validation and execution tracing.
 * SAKEC Department of Computer Engineering
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.DiskScheduler = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function validateAndParseInputs(rawInput) {
    const errors = [];
    const diskSize = parseInt(rawInput.diskSize, 10);
    const initialHead = parseInt(rawInput.initialHead, 10);
    const dir = String(rawInput.initialDirection || 'UP').toUpperCase().trim();

    if (isNaN(diskSize) || diskSize <= 1) {
      errors.push('Disk size must be an integer greater than 1.');
    }

    if (isNaN(initialHead)) {
      errors.push('Initial head position must be a valid integer.');
    } else if (!isNaN(diskSize) && (initialHead < 0 || initialHead >= diskSize)) {
      errors.push(`Initial head position (${initialHead}) must be within track range [0, ${diskSize - 1}].`);
    }

    if (dir !== 'UP' && dir !== 'DOWN') {
      errors.push("Direction must be either 'UP' (higher tracks) or 'DOWN' (lower tracks).");
    }

    let parsedRequests = [];
    if (Array.isArray(rawInput.requestQueue)) {
      parsedRequests = rawInput.requestQueue.map(n => parseInt(n, 10));
    } else if (typeof rawInput.requestQueue === 'string') {
      const tokens = rawInput.requestQueue.split(/[\s,]+/).filter(Boolean);
      if (tokens.length === 0) {
        errors.push('Request queue cannot be empty.');
      } else {
        for (const token of tokens) {
          const val = parseInt(token, 10);
          if (isNaN(val)) {
            errors.push(`Invalid track request value: "${token}". Must be an integer.`);
            break;
          }
          parsedRequests.push(val);
        }
      }
    } else {
      errors.push('Request queue format is invalid.');
    }

    if (!isNaN(diskSize) && parsedRequests.length > 0) {
      const outOfBounds = parsedRequests.filter(r => r < 0 || r >= diskSize);
      if (outOfBounds.length > 0) {
        const uniqueOut = [...new Set(outOfBounds)].join(', ');
        errors.push(`Requests [${uniqueOut}] fall outside disk range [0, ${diskSize - 1}].`);
      }
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    const uniqueRequests = Array.from(new Set(parsedRequests));

    return {
      valid: true,
      errors: [],
      data: {
        diskSize,
        initialHead,
        initialDirection: dir,
        requests: uniqueRequests
      }
    };
  }

  function buildExecutionPlan(pathList, headStart) {
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
    const averageSeekDistance = serviceCount > 0 ? (totalHeadMovement / serviceCount) : 0;
    const averageSeekNoJump = serviceCount > 0 ? (seekWithoutJump / serviceCount) : 0;

    return {
      steps,
      totalHeadMovement,
      averageSeekDistance: parseFloat(averageSeekDistance.toFixed(2)),
      seekWithoutJump,
      averageSeekNoJump: parseFloat(averageSeekNoJump.toFixed(2)),
      serviceCount,
      jumpCount,
      path: [headStart, ...pathList.map(p => p.track)]
    };
  }

  function solveLOOK(diskSize, initialHead, initialDirection, requests) {
    const higher = requests.filter(r => r > initialHead).sort((a, b) => a - b);
    const lower = requests.filter(r => r < initialHead).sort((a, b) => a - b);
    const onHead = requests.filter(r => r === initialHead);

    const pathList = [];

    if (onHead.length > 0) {
      pathList.push({
        track: initialHead,
        isService: true,
        directionLabel: 'Current Track',
        description: `Request at track ${initialHead} serviced immediately`
      });
    }

    if (initialDirection === 'UP') {
      for (const track of higher) {
        pathList.push({
          track,
          isService: true,
          directionLabel: 'Up',
          description: `Service request at track ${track}`
        });
      }

      if (lower.length > 0) {
        const lowerDesc = [...lower].sort((a, b) => b - a);
        lowerDesc.forEach((track, idx) => {
          pathList.push({
            track,
            isService: true,
            isReverse: idx === 0,
            directionLabel: 'Down',
            description: idx === 0
              ? `Reverse direction and service track ${track}`
              : `Service request at track ${track}`
          });
        });
      }
    } else {
      const lowerDesc = [...lower].sort((a, b) => b - a);
      for (const track of lowerDesc) {
        pathList.push({
          track,
          isService: true,
          directionLabel: 'Down',
          description: `Service request at track ${track}`
        });
      }

      if (higher.length > 0) {
        higher.forEach((track, idx) => {
          pathList.push({
            track,
            isService: true,
            isReverse: idx === 0,
            directionLabel: 'Up',
            description: idx === 0
              ? `Reverse direction and service track ${track}`
              : `Service request at track ${track}`
          });
        });
      }
    }

    return {
      algorithm: 'LOOK',
      fullName: 'LOOK (Elevator without Edge Travel)',
      diskSize,
      initialHead,
      initialDirection,
      ...buildExecutionPlan(pathList, initialHead)
    };
  }

  function solveCLOOK(diskSize, initialHead, initialDirection, requests) {
    const higher = requests.filter(r => r > initialHead).sort((a, b) => a - b);
    const lower = requests.filter(r => r < initialHead).sort((a, b) => a - b);
    const onHead = requests.filter(r => r === initialHead);

    const pathList = [];

    if (onHead.length > 0) {
      pathList.push({
        track: initialHead,
        isService: true,
        directionLabel: 'Current Track',
        description: `Request at track ${initialHead} serviced immediately`
      });
    }

    if (initialDirection === 'UP') {
      for (const track of higher) {
        pathList.push({
          track,
          isService: true,
          directionLabel: 'Up',
          description: `Service request at track ${track}`
        });
      }

      if (lower.length > 0) {
        const lowestTrack = lower[0];
        pathList.push({
          track: lowestTrack,
          isService: false,
          isJump: true,
          directionLabel: 'Jump',
          description: `Circular jump to lowest pending track ${lowestTrack} (no requests serviced)`
        });

        pathList.push({
          track: lowestTrack,
          isService: true,
          directionLabel: 'Up',
          description: `Service lowest track ${lowestTrack}`
        });

        for (let i = 1; i < lower.length; i++) {
          pathList.push({
            track: lower[i],
            isService: true,
            directionLabel: 'Up',
            description: `Service request at track ${lower[i]}`
          });
        }
      }
    } else {
      const lowerDesc = [...lower].sort((a, b) => b - a);
      for (const track of lowerDesc) {
        pathList.push({
          track,
          isService: true,
          directionLabel: 'Down',
          description: `Service request at track ${track}`
        });
      }

      if (higher.length > 0) {
        const highestTrack = higher[higher.length - 1];
        pathList.push({
          track: highestTrack,
          isService: false,
          isJump: true,
          directionLabel: 'Jump',
          description: `Circular jump to highest pending track ${highestTrack} (no requests serviced)`
        });

        pathList.push({
          track: highestTrack,
          isService: true,
          directionLabel: 'Down',
          description: `Service highest track ${highestTrack}`
        });

        for (let i = higher.length - 2; i >= 0; i--) {
          pathList.push({
            track: higher[i],
            isService: true,
            directionLabel: 'Down',
            description: `Service request at track ${higher[i]}`
          });
        }
      }
    }

    return {
      algorithm: 'C-LOOK',
      fullName: 'C-LOOK (Circular LOOK)',
      diskSize,
      initialHead,
      initialDirection,
      ...buildExecutionPlan(pathList, initialHead)
    };
  }

  function compareAll(diskSize, initialHead, initialDirection, requests) {
    return {
      LOOK: solveLOOK(diskSize, initialHead, initialDirection, requests),
      'C-LOOK': solveCLOOK(diskSize, initialHead, initialDirection, requests)
    };
  }

  return {
    validateAndParseInputs,
    solveLOOK,
    solveCLOOK,
    compareAll
  };
});
