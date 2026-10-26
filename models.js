/*
 * Grade-adjusted pace models shared by flat_to_hill.html and hill_to_flat.html.
 *
 * All paces are decimal minutes per mile; gradients are percentages.
 * Most models are a multiplier M(g[, flatSpeed]) with hillPace = flatPace * M.
 * Ported from race-pace-calculator (src/engine/models).
 */
(function () {
  const METERS_PER_MILE = 1609.344;
  const MPS_TO_MPH = 2.2369362920544;

  // min/mile <-> m/s
  function paceToMps(pace) { return METERS_PER_MILE / (pace * 60); }
  function mpsToPace(mps) { return METERS_PER_MILE / (mps * 60) ; }

  function bisect(f, lo, hi, tol, maxIter) {
    tol = tol || 1e-9;
    maxIter = maxIter || 100;
    let a = lo, b = hi, fa = f(a), fb = f(b);
    if (fa === 0) return a;
    if (fb === 0) return b;
    if (fa * fb > 0) throw new Error("Root not bracketed");
    for (let i = 0; i < maxIter; i++) {
      const m = 0.5 * (a + b), fm = f(m);
      if (Math.abs(fm) < tol || (b - a) / 2 < tol) return m;
      if (fa * fm <= 0) { b = m; fb = fm; } else { a = m; fa = fm; }
    }
    return 0.5 * (a + b);
  }

  // Linear interpolation over sorted [x, y] points, clamped outside the range.
  function interp1d(points, x) {
    const p = points.slice().sort((a, b) => a[0] - b[0]);
    if (x <= p[0][0]) return p[0][1];
    if (x >= p[p.length - 1][0]) return p[p.length - 1][1];
    for (let i = 1; i < p.length; i++) {
      if (x <= p[i][0]) {
        const t = (x - p[i - 1][0]) / (p[i][0] - p[i - 1][0]);
        return p[i - 1][1] + t * (p[i][1] - p[i - 1][1]);
      }
    }
    return p[p.length - 1][1];
  }

  function quadratic(g) { return 1 + 0.029 * g + 0.0015 * g * g; }

  // Builds a model from a multiplier M(g, flatSpeedMps).
  // speedDependent models need a solve to get flat pace from hill pace.
  function multiplierModel(info, multiplier, speedDependent) {
    const model = Object.assign({}, info);
    if (!speedDependent) {
      model.hillPace = (flat, g) => flat * multiplier(g);
      model.flatPace = (hill, g) => hill / multiplier(g);
    } else {
      model.hillPace = (flat, g) => flat * multiplier(g, paceToMps(flat));
      model.flatPace = (hill, g) => {
        // Solve flat * M(g, speed(flat)) = hill for flat.
        const f = (flat) => flat * multiplier(g, paceToMps(flat)) - hill;
        // The surface isn't monotonic everywhere, so scan for a bracket
        // (nearest to the hill pace) rather than assuming a single one.
        let best = null;
        let prev = hill / 10, fPrev = f(prev);
        for (let i = 1; i <= 400; i++) {
          const cur = (hill / 10) + (hill * 10 - hill / 10) * i / 400, fCur = f(cur);
          if (fPrev === 0 || fPrev * fCur < 0) {
            if (best === null || Math.abs(prev - hill) < Math.abs(best[0] - hill)) best = [prev, cur];
          }
          prev = cur; fPrev = fCur;
        }
        if (best === null) throw new Error("No solution");
        return bisect(f, best[0], best[1], 1e-10, 200);
      };
    }
    return model;
  }

  // --- strava_legacy: the original table of this calculator (default) ---
  const LEGACY_DATA = {
    "35.045392399364": 3.54848473644633,
    "32.2338445590991": 3.33040621169615,
    "27.7642044027805": 2.96459707340553,
    "23.7992010383043": 2.61989230847783,
    "20.3388344656706": 2.32443108139695,
    "17.311013714616": 2.05007422767898,
    "14.6436478148775": 1.81089132956588,
    "12.336736766455": 1.6209519692996,
    "10.3181895990853": 1.48025614688013,
    "8.58800631276845": 1.36769948894455,
    "7.00200496697799": 1.2762472043719,
    "5.70436750224032": 1.21293408428314,
    "4.62300294829228": 1.15665575531535,
    "3.61372936460744": 1.11444700858951,
    "2.8207286917122": 1.08630784410561,
    "2.09981898908017": 1.05816867962172,
    "1.45100025671134": 1.03002951513783,
    "0.946363464868917": 1.01595993289588,
    "0.513817643289698": 1.00189035065393,
    "0.00918085144727598": 1.00189035065393,
    "-0.495455940395139": 0.994855559532959,
    "-0.928001761974358": 0.987820768411985,
    "-1.43263855381678": 0.973751186170038,
    "-2.15354825644881": 0.952646812807117,
    "-2.80236698881764": 0.938577230565171,
    "-3.59536766171287": 0.924507648323223,
    "-4.46045930487131": 0.910438066081277,
    "-5.54182385881936": 0.89636848383933,
    "-6.98364326408342": 0.882298901597383,
    "-8.35337169908428": 0.875264110476409,
    "-10.2998278961908": 0.875264110476409,
    "-12.3183750635604": 0.889333692718356,
    "-14.6252861119829": 0.931542439444197,
    "-17.2926520117215": 0.994855559532959,
    "-20.320472762776": 1.09334263522659,
    "-23.9971122461993": 1.23403845764606,
    "-27.7458426998859": 1.38880386230747,
    "-32.3596647967309": 1.59984759593668,
    "-34.9549397262062": 1.70536946275128
  };
  const LEGACY_KEYS = Object.keys(LEGACY_DATA).map(Number).sort((a, b) => a - b);

  function legacyMultiplier(x) {
    const minKey = LEGACY_KEYS[0], maxKey = LEGACY_KEYS[LEGACY_KEYS.length - 1];
    if (x >= minKey && x <= maxKey) {
      for (let i = 1; i < LEGACY_KEYS.length; i++) {
        if (x <= LEGACY_KEYS[i]) {
          const x1 = LEGACY_KEYS[i - 1], x2 = LEGACY_KEYS[i];
          const y1 = LEGACY_DATA[x1.toString()], y2 = LEGACY_DATA[x2.toString()];
          return y1 + ((x - x1) / (x2 - x1)) * (y2 - y1);
        }
      }
    }
    return quadratic(x);
  }

  // --- strava_inferred ---
  const STRAVA_INFERRED_POINTS = [
    [-20, 1.10], [-18, 1.00], [-15, 0.92], [-12, 0.88], [-10, 0.87],
    [-8, 0.88], [-6, 0.90], [-4, 0.93], [-2, 0.96], [0, 1.00],
    [2, 1.07], [4, 1.15], [6, 1.25], [8, 1.37], [10, 1.50],
    [12, 1.68], [15, 2.02], [18, 2.42], [20, 2.80],
  ];

  function stravaInferredMultiplier(g) {
    const pts = STRAVA_INFERRED_POINTS;
    if (g >= pts[0][0] && g <= pts[pts.length - 1][0]) return interp1d(pts, g);
    return quadratic(g);
  }

  // --- minetti ---
  function minettiMultiplier(gradePct) {
    const g = gradePct / 100;
    const cr = 155.4 * Math.pow(g, 5) - 30.4 * Math.pow(g, 4) - 43.3 * Math.pow(g, 3) +
      46.3 * g * g + 19.5 * g + 3.6;
    return cr / 3.6;
  }

  // --- ultrapacer_default ---
  function ultrapacerMultiplier(g) {
    let f;
    if (g < -22) f = -0.0584 * g - 0.0164;
    else if (g > 16) f = 0.1012 * g - 0.4624;
    else f = 0.0021 * g * g + 0.034 * g;
    return 1 + f;
  }

  // --- the_pacing_project_reconstructed (depends on flat speed) ---
  function pacingProjectMultiplier(g, flatSpeedMps) {
    const v = flatSpeedMps * MPS_TO_MPH;
    const A = -0.00591634465 + 0.00490138698 * v - 0.0000905647596 * v * v;
    const B = -0.00015589027 + 0.000197125972 * v - 0.00000287665249 * v * v;
    const C = 0.00000241550499 - 0.00000138939861 * v + 0.0000000192599697 * v * v;
    return 1 + A * g + B * g * g + C * g * g * g;
  }

  // --- re3 (reconstructed metabolic demand; S in m/s, G decimal grade) ---
  function re3Demand(S, gradePct) {
    const G = gradePct / 100;
    return 4.43 + 1.51 * S + 0.37 * S * S +
      30.43 * S * G * (1 - 1.133 / (1 - Math.pow(1.056, 100 * G + 43)));
  }

  function re3HillSpeed(flatSpeed, g) {
    if (Math.abs(g) < 0.001) return flatSpeed;
    const target = re3Demand(flatSpeed, 0);
    return bisect((vh) => re3Demand(vh, g) - target, 0.1, 15);
  }

  function re3FlatSpeed(hillSpeed, g) {
    if (Math.abs(g) < 0.001) return hillSpeed;
    const target = re3Demand(hillSpeed, g);
    return bisect((vf) => re3Demand(vf, 0) - target, 0.1, 15);
  }

  const MODELS = [
    multiplierModel({
      id: "strava_legacy",
      label: "Strava-style GAP (original table)",
      notes: "The original table of this calculator, with a quadratic fallback outside its range.",
      gradeMin: -35, gradeMax: 35,
    }, legacyMultiplier),
    multiplierModel({
      id: "strava_inferred",
      label: "Strava GAP (user-inferred)",
      notes: "Approximation from digitized public graph data, with a quadratic fallback outside the data range.",
      warning: "This is a user-inferred approximation from digitized public graph data, not the official Strava formula.",
      gradeMin: -20, gradeMax: 20,
    }, stravaInferredMultiplier),
    multiplierModel({
      id: "minetti",
      label: "Minetti",
      notes: "Classic metabolic-cost model. Tends to over-credit steep downhills for real-world racing.",
      gradeMin: -40, gradeMax: 40,
    }, minettiMultiplier),
    multiplierModel({
      id: "ultrapacer_default",
      label: "Ultrapacer default",
      notes: "Piecewise quadratic/linear grade-to-multiplier heuristic from ultrapacer core defaults.",
      gradeMin: -45, gradeMax: 45,
    }, ultrapacerMultiplier),
    multiplierModel({
      id: "the_pacing_project_reconstructed",
      label: "The Pacing Project (reconstructed)",
      notes: "Speed-dependent multiplier: the adjustment varies with your flat pace.",
      warning: "A reconstructed approximation fitted from observed calculator outputs, not the official The Pacing Project formula.",
      gradeMin: -26, gradeMax: 26,
    }, pacingProjectMultiplier, true),
    {
      id: "re3",
      label: "Updated RE3 (reconstructed)",
      notes: "Modern metabolic model intended to improve both uphill and downhill handling.",
      warning: "Reconstructed from OCR/PDF text and may not be character-perfect versus the typeset manuscript.",
      gradeMin: -20, gradeMax: 35,
      hillPace: (flat, g) => mpsToPace(re3HillSpeed(paceToMps(flat), g)),
      flatPace: (hill, g) => mpsToPace(re3FlatSpeed(paceToMps(hill), g)),
    },
  ];

  const DEFAULT_ID = "strava_legacy";

  window.PaceModels = {
    list: MODELS,
    defaultId: DEFAULT_ID,
    get: function (id) {
      return MODELS.find((m) => m.id === id) || MODELS.find((m) => m.id === DEFAULT_ID);
    },
    // Fills a <select> with the models and selects `id` (or the default).
    populateSelect: function (select, id) {
      MODELS.forEach((m) => {
        const opt = document.createElement("option");
        opt.value = m.id;
        opt.textContent = m.label;
        select.appendChild(opt);
      });
      select.value = this.get(id).id;
    },
    // Text describing the model (notes + warning) for display under the select.
    describe: function (model) {
      return model.notes + (model.warning ? " Warning: " + model.warning : "");
    },
    // Returns a note if the gradient is outside the model's validated range.
    rangeNote: function (model, g) {
      if (g < model.gradeMin || g > model.gradeMax) {
        return "Note: " + g + "% is outside this model's validated range (" +
          model.gradeMin + "% to " + model.gradeMax + "%).";
      }
      return "";
    },
  };
})();
