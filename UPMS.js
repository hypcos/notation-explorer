;(() => {
  // Unupgrading Projection Matrix System support for hypcos/notation-explorer.
  // Matrix representation: columns are arrays, top-to-bottom, 0-based internally.
  // Example: (0,0)(1,1)(2,1) is represented as [[0,0],[1,1],[2,1]].

  const STRICT_BASE_COLUMN = true;
  // true follows the prompt literally: for z=A(i,k), use the first k+1 entries
  // of column i, and add 1 to the first k entries.  Set to false only if you
  // need to mimic an older standalone demo that used first k entries instead.

  const isPseudoInfinity = expr => '' + expr === 'Infinity';
  const keyOf = (col, row) => col + ',' + row;
  const cloneColumn = col => col.slice();
  const cloneMatrix = matrix => matrix.map(cloneColumn);

  const isNatural = value =>
    Number.isInteger(value) && value >= 0 && Number.isFinite(value);

  const standardizeMatrix = matrix => {
    if (!Array.isArray(matrix) || matrix.length === 0) return [];
    let rows = 1;
    for (const col of matrix) {
      if (!Array.isArray(col)) return [];
      rows = Math.max(rows, col.length);
    }

    const result = matrix.map(col => {
      const out = col.slice();
      while (out.length < rows) out.push(0);
      return out;
    });

    // Notation Explorer displays columns directly, so remove rows that are
    // globally trailing zeroes.  This is the usual omitted-zero convention.
    while (rows > 1 && result.every(col => col[rows - 1] === 0)) {
      result.forEach(col => col.pop());
      rows--;
    }
    return result;
  };

  const isLegalUPMSMatrix = matrix => {
    if (isPseudoInfinity(matrix)) return true;
    if (!Array.isArray(matrix)) return false;
    if (matrix.length === 0) return true;

    for (const col of matrix) {
      if (!Array.isArray(col)) return false;
      for (const value of col) {
        if (!isNatural(value)) return false;
      }
    }

    const m = standardizeMatrix(matrix);
    if (m.length === 0) return true;
    const rows = m[0].length;

    for (let r = 0; r < rows; r++) {
      if (m[0][r] !== 0) return false;
    }
    for (const col of m) {
      for (let r = 1; r < rows; r++) {
        if (col[r] > col[r - 1]) return false;
      }
    }
    return true;
  };

  const sequenceCompare = (seq1, seq2) => {
    const len = Math.max(seq1.length, seq2.length);
    for (let i = 0; i < len; i++) {
      const a = i < seq1.length ? seq1[i] : 0;
      const b = i < seq2.length ? seq2[i] : 0;
      if (a < b) return -1;
      if (a > b) return 1;
    }
    return 0;
  };

  const matrixCompare = (m1, m2) => {
    const inf1 = isPseudoInfinity(m1);
    const inf2 = isPseudoInfinity(m2);
    if (inf1 || inf2) return inf1 === inf2 ? 0 : (inf1 ? 1 : -1);

    const a = standardizeMatrix(m1);
    const b = standardizeMatrix(m2);
    const len = Math.max(a.length, b.length);
    for (let c = 0; c < len; c++) {
      if (c >= a.length) return -1;
      if (c >= b.length) return 1;
      const cmp = sequenceCompare(a[c], b[c]);
      if (cmp !== 0) return cmp;
    }
    return 0;
  };

  const matrixLexCompare = (m1, m2) => {
    // Raw matrix lexicographic comparison used inside UPMS verification roots.
    const cols = Math.min(m1.length, m2.length);
    for (let c = 0; c < cols; c++) {
      const rows = Math.min(m1[c].length, m2[c].length);
      for (let r = 0; r < rows; r++) {
        if (m1[c][r] < m2[c][r]) return -1;
        if (m1[c][r] > m2[c][r]) return 1;
      }
      if (m1[c].length < m2[c].length) return -1;
      if (m1[c].length > m2[c].length) return 1;
    }
    if (m1.length < m2.length) return -1;
    if (m1.length > m2.length) return 1;
    return 0;
  };

  const columnPrefixCompare = (column, reference) => {
    for (let r = 0; r < reference.length; r++) {
      const a = r < column.length ? column[r] : 0;
      const b = reference[r];
      if (a < b) return -1;
      if (a > b) return 1;
    }
    return 0;
  };

  const matrixDisplay = expr => {
    if (isPseudoInfinity(expr)) return 'Limit';
    return standardizeMatrix(expr).map(col => '(' + col.join(',') + ')').join('');
  };

  const makeContext = matrix => {
    const m = standardizeMatrix(matrix);
    const colCount = m.length;
    const rowCount = colCount === 0 ? 0 : m[0].length;
    const parentCache = new Map();
    const ancestorCache = new Map();

    const getZeroParent = colIndex => colIndex > 0 ? colIndex - 1 : null;

    const getBParent = (colIndex, b) => {
      const cacheKey = colIndex + ',' + b;
      if (parentCache.has(cacheKey)) return parentCache.get(cacheKey);

      const row = b - 1;
      if (row < 0 || row >= rowCount) {
        parentCache.set(cacheKey, null);
        return null;
      }

      const value = m[colIndex][row];
      const ancestors = getAAncestors(colIndex, b - 1);
      let best = null;
      for (const candidate of ancestors) {
        if (candidate >= colIndex) continue;
        if (m[candidate][row] < value && (best === null || candidate > best)) {
          best = candidate;
        }
      }
      parentCache.set(cacheKey, best);
      return best;
    };

    const getAAncestors = (colIndex, a) => {
      const cacheKey = colIndex + ',' + a;
      if (ancestorCache.has(cacheKey)) return ancestorCache.get(cacheKey);

      const ancestors = new Set([colIndex]);
      let changed = true;
      let guard = 0;
      while (changed && guard++ <= colCount + 2) {
        changed = false;
        const current = Array.from(ancestors);
        for (const col of current) {
          const parent = a === 0 ? getZeroParent(col) : getBParent(col, a);
          if (parent !== null && !ancestors.has(parent)) {
            ancestors.add(parent);
            changed = true;
          }
        }
      }
      ancestorCache.set(cacheKey, ancestors);
      return ancestors;
    };

    return { m, colCount, rowCount, getBParent, getAAncestors };
  };

  const lastColumnIsZero = matrix => {
    if (matrix.length === 0) return true;
    return matrix[matrix.length - 1].every(value => value === 0);
  };

  const findLastNonZeroRowLabel = matrix => {
    if (matrix.length === 0) return null;
    const last = matrix[matrix.length - 1];
    for (let r = last.length - 1; r >= 0; r--) {
      if (last[r] !== 0) return r + 1; // 1-based row label
    }
    return null;
  };

  const findBadRoot = ctx => {
    const lastCol = ctx.colCount - 1;
    const t = findLastNonZeroRowLabel(ctx.m);
    if (t === null) return null;
    const rootCol = ctx.getBParent(lastCol, t);
    if (rootCol === null) return null;
    return { rootCol, t };
  };

  const computeDelta = (ctx, rootCol, t) => {
    const lastCol = ctx.colCount - 1;
    const delta = [];
    for (let r = 0; r < ctx.rowCount; r++) {
      delta.push(r >= t - 1 ? 0 : ctx.m[lastCol][r] - ctx.m[rootCol][r]);
    }
    return delta;
  };

  const maxEntry = matrix => {
    let max = 0;
    for (const col of matrix) {
      for (const value of col) max = Math.max(max, value);
    }
    return max;
  };

  const computeUPMSVerificationRoots = (ctx, rootCol, t) => {
    const m = ctx.m;
    const alpha = ctx.colCount - 1; // 0-based last-column index
    const y = rootCol;             // 0-based bad-root column index
    const vr = new Map();

    const inBadPart = (col, row) => col >= y && col < alpha && row < t - 1;
    const getVR = (col, row) => inBadPart(col, row) ? vr.get(keyOf(col, row)) : undefined;
    const setVR = (col, row, value) => vr.set(keyOf(col, row), value);

    for (let row = 0; row < t - 1; row++) {
      for (let col = y; col < alpha; col++) {
        const k = row + 1; // 1-based row label of z=A(i,k)

        if (col === y || row === 0) {
          setVR(col, row, 1);
          continue;
        }

        const kAncestors = ctx.getAAncestors(col, k);
        let ancestorHasVR0 = false;
        for (const ancCol of kAncestors) {
          if (getVR(ancCol, row) === 0) {
            ancestorHasVR0 = true;
            break;
          }
        }

        const kParent = ctx.getBParent(col, k);
        if (!kAncestors.has(y) || ancestorHasVR0 || kParent === null) {
          setVR(col, row, 0);
          continue;
        }

        if (kParent !== y) {
          setVR(col, row, 1);
          continue;
        }

        let earlierRowHasVR0 = false;
        for (let wRow = 0; wRow < row; wRow++) {
          if (getVR(col, wRow) === 0) {
            earlierRowHasVR0 = true;
            break;
          }
        }
        if (earlierRowHasVR0) {
          setVR(col, row, 0);
          continue;
        }

        let higherParentEscapesBadRoot = false;
        for (let vRow = row + 1; vRow < t - 1; vRow++) {
          const v = vRow + 1;
          if (ctx.getBParent(col, v) !== y) {
            higherParentEscapesBadRoot = true;
            break;
          }
        }
        if (higherParentEscapesBadRoot) {
          setVR(col, row, 0);
          continue;
        }

        // Baseline column.  In strict mode this has rows 1..k+1 and adds 1
        // to rows 1..k.  Non-strict mode mimics the old standalone demo.
        const baseCol = [];
        if (STRICT_BASE_COLUMN) {
          for (let r = 0; r <= k; r++) baseCol.push(m[col][r] + (r < k ? 1 : 0));
        } else {
          for (let r = 0; r <= row; r++) baseCol.push(m[col][r] + (r < row ? 1 : 0));
        }

        let u = null; // 0-based index of the least column u>i satisfying A_u < baseCol
        for (let candidate = col + 1; candidate <= alpha; candidate++) {
          if (columnPrefixCompare(m[candidate], baseCol) < 0) {
            u = candidate;
            break;
          }
        }

        if (u === null) {
          setVR(col, row, 1);
          continue;
        }

        const XStart = col;
        const XEnd = u - 1;
        const X = m.slice(XStart, XEnd + 1).map(cloneColumn);

        const Ayk = m[y][row];
        const alphaAncestors = ctx.getAAncestors(alpha, k);
        let j = null;
        for (const ancCol of alphaAncestors) {
          if (m[ancCol][row] === Ayk + 1) {
            j = ancCol;
            break;
          }
        }
        if (j === null) j = alpha;

        const YStart = j;
        const Y = m.slice(YStart, alpha + 1).map(cloneColumn);
        const x = maxEntry(m) * 2;

        const Xc = X.map(cloneColumn);
        for (let s = 1; s <= k - 1; s++) {
          const sRow = s - 1;
          const deltaX = x - m[col][sRow];
          for (let localCol = 0; localCol < Xc.length; localCol++) {
            const originalCol = XStart + localCol;
            if (getVR(originalCol, sRow) === 1) Xc[localCol][sRow] += deltaX;
          }
        }

        const Yc = Y.map(cloneColumn);
        for (let s = 1; s <= k - 1; s++) {
          const sRow = s - 1;
          const deltaY = x - m[j][sRow];
          for (let localCol = 0; localCol < Yc.length; localCol++) {
            const originalCol = YStart + localCol;
            const isJColumn = originalCol === j;
            const sAncestors = ctx.getAAncestors(originalCol, s);
            if (isJColumn || sAncestors.has(j)) Yc[localCol][sRow] += deltaY;
          }
        }

        setVR(col, row, matrixLexCompare(Xc, Yc) < 0 ? 0 : 1);
      }
    }
    return vr;
  };

  const generateBh = (ctx, B, delta, t, h, rootCol, vr) => {
    return B.map((col, localCol) => {
      const originalCol = rootCol + localCol;
      const next = [];
      for (let r = 0; r < ctx.rowCount; r++) {
        const hasVerificationRoot = r < t - 1 && vr.get(keyOf(originalCol, r)) === 1;
        next.push(col[r] + h * delta[r] * (hasVerificationRoot ? 1 : 0));
      }
      return next;
    });
  };

  const expandUPMS = (matrix, FSterm) => {
    if (!isLegalUPMSMatrix(matrix)) return [];
    const ctx = makeContext(matrix);
    const m = ctx.m;
    const n = Math.max(0, Math.floor(FSterm));

    if (m.length === 0) return [];
    if (lastColumnIsZero(m)) return standardizeMatrix(m.slice(0, -1).map(cloneColumn));

    const badRoot = findBadRoot(ctx);
    if (badRoot === null) return [];

    const { rootCol, t } = badRoot;
    const G = m.slice(0, rootCol).map(cloneColumn);
    const B = m.slice(rootCol, ctx.colCount - 1).map(cloneColumn);
    const delta = computeDelta(ctx, rootCol, t);
    const vr = computeUPMSVerificationRoots(ctx, rootCol, t);

    const result = [...G, ...B.map(cloneColumn)];
    for (let h = 1; h <= n; h++) {
      const Bh = generateBh(ctx, B, delta, t, h, rootCol, vr);
      for (const col of Bh) result.push(col);
    }
    return standardizeMatrix(result);
  };

  const upmsLimit = expr => {
    if (isPseudoInfinity(expr)) return true;
    if (!isLegalUPMSMatrix(expr)) return false;
    const ctx = makeContext(expr);
    return ctx.m.length > 0 && !lastColumnIsZero(ctx.m) && findBadRoot(ctx) !== null;
  };

  const UPMS_FS = (() => {
    const cache = new Map();
    return (expr, FSterm) => {
      const n = Math.max(0, Math.floor(FSterm));

      if (isPseudoInfinity(expr)) {
        return [Array(n + 1).fill(0), Array(n + 1).fill(1)];
      }

      const standardized = standardizeMatrix(expr);
      const cacheKey = matrixDisplay(standardized) + '[' + n + ']';
      if (cache.has(cacheKey)) return cloneMatrix(cache.get(cacheKey));

      const result = expandUPMS(standardized, n);
      cache.set(cacheKey, cloneMatrix(result));
      return result;
    };
  })();

  register.push({
    id: 'upms',
    name: 'Unupgrading projection matrix system',
    display: matrixDisplay,
    able: upmsLimit,
    compare: matrixCompare,
    FS: UPMS_FS,
    init: () => ([
      { expr: [[Infinity]], low: [[]], subitems: [] },
      { expr: [], low: [[]], subitems: [] }
    ])
  });
})();
