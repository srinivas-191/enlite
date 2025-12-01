// PredictHeroFull.jsx
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/*
  PredictHeroFull (updated per request)
  - Uses model feature ranges (from uploaded PDF) under inputs
  - Added Cancel button to stop animation and navigate to /solutions
  - 'New' button in results is now static/disabled (matching Predict Again)
  - Minimal changes elsewhere; preserved original flow & timings
*/

// TIMINGS unchanged
const TIMINGS = {
  initialPause: 800,
  openDropdownDelay: 800,
  dropdownHoverHold: 800,
  dropdownSelectHold: 800,
  moveToEnvelope: 900,
  perFieldBase: 420,
  betweenFields: 700,
  envelopeHold: 1400,
  hvacHold: 1200,
  internalHold: 1400,
  geometryHold: 1200,
  summaryHold: 900,
  resultHold: 1400,
};

const envelopeFields = [
  "Roof_Insulation",
  "Door_Insulation",
  "Floor_Insulation",
  "Window_Insulation",
  "Wall_Insulation",
  "Window_To_Wall_Ratio",
];
const hvacFields = ["Hvac_Efficiency"];
const internalFields = ["Lighting_Density", "Occupancy_Level", "Equipment_Density", "Domestic_Hot_Water_Usage"];
const geometryFields = ["Total_Building_Area"];

const DEFAULTS = {
  Building_Type: "",
  Floor_Insulation: 0.15,
  Door_Insulation: 0.81,
  Roof_Insulation: 0.07,
  Window_Insulation: 0.73,
  Wall_Insulation: 0.10,
  Hvac_Efficiency: 0.30,
  Domestic_Hot_Water_Usage: 0.50,
  Lighting_Density: 1,
  Occupancy_Level: 1,
  Equipment_Density: 1,
  Window_To_Wall_Ratio: 0,
  Total_Building_Area: 85.91,
};

const BUILDING_TYPES = ["bungalow", "terrace", "semi-detached", "detached"];

const fmt2 = (n) => {
  if (n === null || n === undefined) return "";
  const num = Number(n);
  if (isNaN(num)) return "";
  return num.toFixed(2);
};

/*
  FEATURE_RANGES pulled from your uploaded PDF (used to display under inputs).
  See file upload for authoritative ranges. :contentReference[oaicite:1]{index=1}
*/
const FEATURE_RANGES = {
  Floor_Insulation: [0.15, 1.6],
  Door_Insulation: [0.81, 5.7],
  Roof_Insulation: [0.07, 2.28],
  Window_Insulation: [0.73, 5.75],
  Wall_Insulation: [0.10, 2.4],
  Hvac_Efficiency: [0.30, 4.5],
  Domestic_Hot_Water_Usage: [0.50, 3.5],
  Lighting_Density: [1, 9],
  Occupancy_Level: [1, 6],
  Equipment_Density: [1, 21],
  Window_To_Wall_Ratio: [0, 70], // percent
  Total_Building_Area: [85.91, 130.81],
};

export default function PredictHeroFull({ autoPlay = false }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ ...DEFAULTS });
  const [typingHighlight, setTypingHighlight] = useState({});
  const [hoverIndex, setHoverIndex] = useState(null);
  const [result, setResult] = useState(null);

  const [overlayOpen, setOverlayOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [demoEnded, setDemoEnded] = useState(false);

  const timers = useRef([]);
  const typingInterval = useRef(null);
  const playingRef = useRef(false);

  const cardBodyRef = useRef(null);
  const optionListRef = useRef(null);
  const optionItemRefs = useRef([]);
  const fieldRefs = useRef({});
  const cinematicScrollRef = useRef(null);

  const clearAll = () => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
    if (typingInterval.current) {
      clearInterval(typingInterval.current);
      typingInterval.current = null;
    }
    if (cinematicScrollRef.current) {
      clearInterval(cinematicScrollRef.current);
      cinematicScrollRef.current = null;
    }
    playingRef.current = false;
    setPlaying(false);
  };

  useEffect(() => {
    return () => {
      clearAll();
      document.body.style.overflow = "";
    };
  }, []);

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const pickRandomBuilding = () => BUILDING_TYPES[Math.floor(Math.random() * BUILDING_TYPES.length)];

  const humanDelay = (base = TIMINGS.perFieldBase) => {
    const jitter = Math.round((Math.random() * 0.25 - 0.125) * base);
    return Math.max(40, base + jitter);
  };

  const smoothScrollTo = (top, behavior = "smooth") => {
    if (!cardBodyRef.current) return;
    try {
      cardBodyRef.current.scrollTo({ top, behavior });
    } catch {
      cardBodyRef.current.scrollTop = top;
    }
  };

  const getElementOffsetTopRelativeToCard = (el) => {
    if (!el || !cardBodyRef.current) return 0;
    let offset = 0;
    let node = el;
    while (node && node !== cardBodyRef.current) {
      offset += node.offsetTop || 0;
      node = node.offsetParent;
    }
    return offset;
  };

  const scrollFieldIntoView = (fieldKey) => {
    const el = fieldRefs.current[fieldKey];
    if (!el || !cardBodyRef.current) return;
    const cardHeight = cardBodyRef.current.clientHeight;
    const elTop = getElementOffsetTopRelativeToCard(el);
    const elHeight = el.clientHeight || 40;
    const target = Math.max(0, elTop - cardHeight / 2 + elHeight / 2);
    smoothScrollTo(target, "smooth");
  };

  const scrollToBottom = () => {
    if (!cardBodyRef.current) return;
    const h = cardBodyRef.current.scrollHeight;
    smoothScrollTo(Math.max(0, h - cardBodyRef.current.clientHeight), "smooth");
  };

  const scrollOptionIntoViewByIndex = (index, behavior = "smooth") => {
    if (!optionListRef.current) return;
    const list = optionListRef.current;
    const item = optionItemRefs.current[index];
    if (!item) return;

    const top = item.offsetTop;
    const itemHeight = item.clientHeight || 36;
    const centerTarget = Math.max(0, top - list.clientHeight / 2 + itemHeight / 2);

    try {
      list.scrollTo({ top: centerTarget, behavior });
    } catch {
      list.scrollTop = centerTarget;
    }
  };

  useEffect(() => {
    if (hoverIndex == null) return;
    scrollOptionIntoViewByIndex(hoverIndex, "smooth");
  }, [hoverIndex]);

  useEffect(() => {
    if (!form.Building_Type) return;
    const idx = BUILDING_TYPES.findIndex((t) => t === form.Building_Type);
    if (idx >= 0) {
      timers.current.push(setTimeout(() => scrollOptionIntoViewByIndex(idx, "auto"), 80));
    }
  }, [form.Building_Type]);

  const startCinematicScroll = () => {
    if (!cardBodyRef.current) return;

    const el = cardBodyRef.current;
    const total = el.scrollHeight - el.clientHeight;
    if (total <= 0) return;

    if (cinematicScrollRef.current) {
      clearInterval(cinematicScrollRef.current);
      cinematicScrollRef.current = null;
    }

    let pos = 0;
    const duration = 10000; // 10 seconds
    const fps = 60;
    const steps = duration / (1000 / fps);
    const increment = total / steps;

    cinematicScrollRef.current = setInterval(() => {
      pos += increment;
      if (pos >= total) {
        el.scrollTo({ top: total, behavior: "auto" });
        clearInterval(cinematicScrollRef.current);
        cinematicScrollRef.current = null;
        return;
      }
      el.scrollTo({ top: pos, behavior: "auto" });
    }, 1000 / fps);
  };

  const typeIntoField = (fieldKey, value) =>
    new Promise((resolve) => {
      if (typingInterval.current) {
        clearInterval(typingInterval.current);
        typingInterval.current = null;
      }
      const str = String(value);
      let idx = 0;
      setTypingHighlight((p) => ({ ...p, [fieldKey]: true }));

      timers.current.push(setTimeout(() => scrollFieldIntoView(fieldKey), 60));
      setForm((p) => ({ ...p, [fieldKey]: "" }));

      const stepFn = () => {
        idx += 1;
        setForm((p) => ({ ...p, [fieldKey]: str.slice(0, idx) }));
        if (idx >= str.length) {
          clearInterval(typingInterval.current);
          typingInterval.current = null;
          setTypingHighlight((p) => ({ ...p, [fieldKey]: false }));
          timers.current.push(setTimeout(resolve, 240));
        }
      };

      stepFn();
      typingInterval.current = setInterval(stepFn, humanDelay());
    });

  const computeFakeResult = (values) => {
    const area = Number(values.Total_Building_Area) || 100;
    const hvac = Number(values.Hvac_Efficiency) || 1;
    const insulationAvg =
      (Number(values.Roof_Insulation || 0) +
        Number(values.Wall_Insulation || 0) +
        Number(values.Window_Insulation || 0) +
        Number(values.Door_Insulation || 0) +
        Number(values.Floor_Insulation || 0)) /
      5 || 0.2;

    const monthly = Math.max(200, (area * (1.5 / Math.max(0.5, hvac))) * (1 + insulationAvg));
    const eui = +(monthly / area).toFixed(2);
    const cat = eui <= 12.5 ? "Excellent" : eui <= 20.83 ? "Moderate" : "Poor";

    const impacts = [];
    const recs = [];
    if (insulationAvg > 0.7) {
      impacts.push("Insulation values are high (inefficient).");
      recs.push("Improve building envelope; reduce U-values.");
    }
    if (hvac < 2) {
      impacts.push("Low HVAC efficiency.");
      recs.push("Upgrade HVAC: aim for COP > 3.");
    }
    if ((Number(values.Window_To_Wall_Ratio) || 0) > 50) {
      impacts.push("High window-to-wall ratio.");
      recs.push("Add shading or better glazing.");
    }

    return {
      total_energy_month_kwh: Math.round(monthly),
      eui_month_kwh_m2: eui,
      performance_category: cat,
      impacting_factors: impacts,
      recommendations: recs,
    };
  };

  const valueForField = (field) => {
    const f = field.toLowerCase();
    if (f.includes("ratio") || f.includes("window_to_wall")) return "0.23";
    if (f.includes("area")) return "120.00";
    if (f.includes("insulation")) return "0.12";
    if (f.includes("hvac")) return "3.20";
    if (f.includes("lighting")) return "3";
    if (f.includes("occupancy")) return "3";
    if (f.includes("equipment")) return "5";
    if (f.includes("domestic")) return "0.80";
    return "1.00";
  };

  const playSequence = async () => {
    clearAll();
    if (playingRef.current) return;
    playingRef.current = true;
    setPlaying(true);
    setDemoEnded(false);
    setResult(null);

    document.body.style.overflow = "hidden";

    try {
      // Building step
      setStep(1);
      setField("Building_Type", "");
      await new Promise((r) => timers.current.push(setTimeout(r, TIMINGS.openDropdownDelay)));

      const chosen = pickRandomBuilding();
      for (let i = 0; i < BUILDING_TYPES.length; i++) {
        setHoverIndex(i);
        await new Promise((r) => timers.current.push(setTimeout(r, 260)));
      }
      const chosenIndex = BUILDING_TYPES.indexOf(chosen);
      setHoverIndex(chosenIndex);
      await new Promise((r) => timers.current.push(setTimeout(r, TIMINGS.dropdownSelectHold)));
      setHoverIndex(null);

      // set selected and ensure option list scrolls to selected
      setField("Building_Type", chosen);
      await new Promise((r) => timers.current.push(setTimeout(r, 120)));

      await new Promise((r) => timers.current.push(setTimeout(r, TIMINGS.moveToEnvelope)));
      setStep(2);

      // Envelope: type each field (auto scroll into view for each)
      for (let i = 0; i < envelopeFields.length; i++) {
        const fk = envelopeFields[i];
        const val = valueForField(fk);
        await typeIntoField(fk, val);
        await new Promise((r) => timers.current.push(setTimeout(r, TIMINGS.betweenFields)));
      }

      await new Promise((r) => timers.current.push(setTimeout(r, TIMINGS.envelopeHold)));
      scrollToBottom();

      await new Promise((r) => timers.current.push(setTimeout(r, 600)));
      setStep(3);

      // HVAC
      await new Promise((r) => timers.current.push(setTimeout(r, TIMINGS.hvacHold / 3)));
      await typeIntoField(hvacFields[0], valueForField(hvacFields[0]));
      await new Promise((r) => timers.current.push(setTimeout(r, TIMINGS.hvacHold / 2)));
      scrollToBottom();
      setStep(4);

      // Internal loads
      for (let i = 0; i < internalFields.length; i++) {
        await typeIntoField(internalFields[i], valueForField(internalFields[i]));
        await new Promise((r) => timers.current.push(setTimeout(r, 240)));
      }
      await new Promise((r) => timers.current.push(setTimeout(r, TIMINGS.internalHold)));
      scrollToBottom();
      setStep(5);

      // Geometry
      for (let i = 0; i < geometryFields.length; i++) {
        await typeIntoField(geometryFields[i], valueForField(geometryFields[i]));
        await new Promise((r) => timers.current.push(setTimeout(r, 240)));
      }
      await new Promise((r) => timers.current.push(setTimeout(r, TIMINGS.geometryHold)));
      scrollToBottom();

      setStep(6);
      // Smooth full scroll to bottom BEFORE cinematic scroll
      await new Promise((resolve) => {
        let count = 0;
        const interval = setInterval(() => {
          scrollToBottom();
          count++;
          if (count >= 20) {
            clearInterval(interval);
            resolve();
          }
        }, 150);
      });

      // Summary cinematic scroll
      smoothScrollTo(0, "smooth");
      await new Promise((r) => timers.current.push(setTimeout(r, 500)));
      startCinematicScroll();
      await new Promise((r) => timers.current.push(setTimeout(r, 2600 + Object.keys(form).length * 12)));

      // Compute result and show
      const r = computeFakeResult(form);
      setResult(r);
      setStep(7);

      await new Promise((r) => timers.current.push(setTimeout(r, TIMINGS.resultHold)));
      setDemoEnded(true);
      playingRef.current = false;
      setPlaying(false);
    } catch (err) {
      playingRef.current = false;
      setPlaying(false);
    } finally {
      document.body.style.overflow = "";
    }
  };

  const openModalAndStart = () => {
    clearAll();
    setForm({ ...DEFAULTS, Building_Type: "" });
    setResult(null);
    setOverlayOpen(true);
    setStep(0);
    setDemoEnded(false);
    timers.current.push(setTimeout(() => playSequence(), TIMINGS.initialPause));
  };

  const handleRestart = () => {
    clearAll();
    setForm({ ...DEFAULTS, Building_Type: "" });
    setResult(null);
    setStep(0);
    setDemoEnded(false);
    timers.current.push(setTimeout(() => playSequence(), 160));
  };

  const handleExit = () => {
    clearAll();
    setOverlayOpen(false);
    setDemoEnded(false);
    setResult(null);
    setStep(0);
    document.body.style.overflow = "";
  };

  // NEW: Cancel button — stop animation and navigate to /solutions
  const handleCancel = () => {
    clearAll();
    setOverlayOpen(false);
    setDemoEnded(false);
    setResult(null);
    setStep(0);
    document.body.style.overflow = "";
    try {
      window.location.href = "/solutions";
    } catch {
      window.location.href = "/";
    }
  };

  const DemoInput = ({ value, highlight }) => (
    <input
      readOnly
      value={value ?? ""}
      className={`w-full rounded px-3 py-2 border ${highlight ? "border-blue-300 bg-blue-50 ring-2 ring-blue-100" : "bg-white"}`}
    />
  );

  const StaticButton = ({ children, onClick, variant = "primary", className = "" }) => {
    const disabled = playing && !demoEnded;
    const base = variant === "primary" ? "px-4 py-2 rounded" : "px-3 py-1 rounded text-sm";
    return (
      <button
        onClick={disabled ? undefined : onClick}
        className={`${base} ${className} ${disabled ? "opacity-50 pointer-events-none cursor-default" : ""}`}
        aria-disabled={disabled}
      >
        {children}
      </button>
    );
  };

  const CardBody = ({ children }) => (
    <div ref={cardBodyRef} className="p-6 overflow-auto" style={{ maxHeight: "calc(95vh - 160px)", scrollBehavior: "smooth" }}>
      {children}
    </div>
  );

  const SummaryTable = () => {
    const [editValues, setEditValues] = useState({});
    const [backupValues, setBackupValues] = useState({});
    const isBusy = playing && !demoEnded;

    const handleEdit = (key) => {
      if (isBusy) return;
      setBackupValues((p) => ({ ...p, [key]: form[key] }));
      setEditValues((p) => ({ ...p, [key]: form[key] }));
      timers.current.push(setTimeout(() => scrollToBottom(), 80));
    };

    const handleSave = (key) => {
      const proposed = editValues[key];
      if (key !== "Building_Type") {
        if (proposed === "" || proposed === null || proposed === undefined || proposed === "-" || proposed === "." || proposed === "-.") {
          setForm((prev) => ({ ...prev, [key]: fmt2(0) }));
        } else {
          const num = Number(proposed);
          if (isNaN(num)) {
            setForm((prev) => ({ ...prev, [key]: fmt2(0) }));
          } else {
            setForm((prev) => ({ ...prev, [key]: fmt2(num) }));
          }
        }
      } else {
        setForm((prev) => ({ ...prev, [key]: proposed }));
      }

      setEditValues((p) => {
        const n = { ...p };
        delete n[key];
        return n;
      });
      setBackupValues((p) => {
        const n = { ...p };
        delete n[key];
        return n;
      });
    };

    const handleUndo = (key) => {
      setForm((prev) => ({ ...prev, [key]: backupValues[key] }));
      setEditValues((p) => {
        const n = { ...p };
        delete n[key];
        return n;
      });
      setBackupValues((p) => {
        const n = { ...p };
        delete n[key];
        return n;
      });
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">Confirm values before predicting</h3>

        <div className="overflow-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-3 py-2 text-left">Field</th>
                <th className="border px-3 py-2 text-left">Value</th>
                <th className="border px-3 py-2 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {Object.keys(form).map((key) => (
                <tr key={key}>
                  <td className="border px-3 py-2 capitalize" style={{ minWidth: 220 }}>
                    {key.replace(/_/g, " ")}
                  </td>

                  <td className="border px-3 py-2">
                    {editValues[key] !== undefined ? (
                      key === "Building_Type" ? (
                        <select
                          value={editValues[key]}
                          onChange={(e) => setEditValues((p) => ({ ...p, [key]: e.target.value }))}
                          className="border px-2 py-1 rounded w-full"
                        >
                          <option value="">Select building type</option>
                          {BUILDING_TYPES.map((t, i) => (
                            <option key={i} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={editValues[key]}
                          onChange={(e) => setEditValues((p) => ({ ...p, [key]: e.target.value }))}
                          className="border px-2 py-1 rounded w-full"
                        />
                      )
                    ) : (
                      <span>{String(form[key])}</span>
                    )}
                  </td>

                  <td className="border px-3 py-2 text-center">
                    {editValues[key] !== undefined ? (
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleSave(key)} className="px-3 py-1 bg-green-600 text-white rounded" disabled={isBusy}>
                          Save
                        </button>
                        <button onClick={() => handleUndo(key)} className="px-3 py-1 bg-yellow-500 text-white rounded" disabled={isBusy}>
                          Undo
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => handleEdit(key)} className={`px-3 py-1 bg-blue-600 text-white rounded`} disabled={isBusy}>
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={() => (playing ? null : setStep(5))} className="px-4 py-2 border rounded">
            Back
          </button>
          <button
            onClick={() => {
              if (playing) return;
              const r = computeFakeResult(form);
              setResult(r);
              setStep(7);
              setDemoEnded(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Confirm & Predict
          </button>
        </div>
      </div>
    );
  };

  const RenderStep = () => {
    switch (step) {
      case 0:
        return (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="text-center py-6 px-2">
              <p className="text-gray-700">This demo will show the Predict flow — dropdown, typing, summary & results.</p>
            </div>
            <div className="flex justify-center mt-4">
              <StaticButton onClick={() => playSequence()} className="bg-green-600 text-white">
                Play Demo
              </StaticButton>
              <StaticButton onClick={handleExit} className="ml-3 border">
                Close
              </StaticButton>
            </div>
          </motion.div>
        );

      case 1:
        return (
          <motion.div key="building" initial="hidden" animate="visible" exit="exit">
            <label className="block font-semibold mb-2">Building Type</label>
            <div className="relative">
              <button
                className={`w-full p-2 rounded border flex justify-between items-center bg-white ${playing && !demoEnded ? "opacity-90" : ""}`}
                style={{ cursor: playing && !demoEnded ? "default" : "pointer" }}
              >
                <span className="capitalize">{form.Building_Type || "Select Building Type"}</span>
                <span>▾</span>
              </button>

              <div
                ref={optionListRef}
                className="mt-2 border rounded bg-white max-h-44 overflow-y-auto"
                style={{ scrollBehavior: "smooth" }}
              >
                {BUILDING_TYPES.map((t, i) => (
                  <div
                    key={t}
                    ref={(el) => (optionItemRefs.current[i] = el)}
                    className={`p-3 flex items-center justify-between ${hoverIndex === i ? "bg-blue-50" : ""} ${form.Building_Type === t ? "font-semibold" : "font-normal"}`}
                  >
                    <span className="capitalize">{t}</span>
                    {form.Building_Type === t && <span className="text-xs text-blue-600">selected</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <StaticButton onClick={() => { if (!playing) setStep(0); }} className="border">Cancel</StaticButton>
              <StaticButton onClick={() => { if (!playing) setStep(2); }} className="bg-green-600 text-white">Next</StaticButton>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div key="envelope" initial="hidden" animate="visible" exit="exit">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Envelope Properties</h3>
            <div className="space-y-4">
              {envelopeFields.map((f) => (
                <div
                  key={f}
                  id={`field-${f}`}
                  ref={(el) => (fieldRefs.current[f] = el)}
                  className="flex flex-col md:flex-row md:items-center gap-3"
                >
                  <label className="font-medium w-1/3">{f.replace(/_/g, " ")}</label>
                  <div className="w-2/3">
                    <DemoInput value={form[f]} highlight={!!typingHighlight[f]} />
                    {/* SHOW REAL RANGE (from FEATURE_RANGES) */}
                    <div className="text-xs text-gray-400 mt-1">
                      {FEATURE_RANGES[f]
                        ? `${FEATURE_RANGES[f][0]} — ${FEATURE_RANGES[f][1]}${f === "Window_To_Wall_Ratio" ? "%" : ""}`
                        : "—"}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <StaticButton onClick={() => { if (!playing) setStep(1); }} className="border">Back</StaticButton>
              <StaticButton onClick={() => { if (!playing) setStep(3); }} className="bg-green-600 text-white">Next</StaticButton>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div key="hvac" initial="hidden" animate="visible" exit="exit">
            <h3 className="text-lg font-semibold mb-3">Heat, Ventilation &amp; AC</h3>
            {hvacFields.map((f) => (
              <div key={f} id={`field-${f}`} ref={(el) => (fieldRefs.current[f] = el)} className="flex items-center gap-3 mb-3">
                <label className="w-1/3 text-gray-600">{f.replace(/_/g, " ")}</label>
                <div className="w-2/3">
                  <DemoInput value={form[f]} highlight={!!typingHighlight[f]} />
                  <div className="text-xs text-gray-400 mt-1">
                    {FEATURE_RANGES[f] ? `${FEATURE_RANGES[f][0]} — ${FEATURE_RANGES[f][1]}` : "—"}
                  </div>
                </div>
              </div>
            ))}

            <div className="flex gap-3 mt-4">
              <StaticButton onClick={() => { if (!playing) setStep(2); }} className="border">Back</StaticButton>
              <StaticButton onClick={() => { if (!playing) setStep(4); }} className="bg-green-600 text-white">Next</StaticButton>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div key="internal" initial="hidden" animate="visible" exit="exit">
            <h3 className="text-lg font-semibold mb-3">Internal Loads</h3>
            {internalFields.map((f) => (
              <div key={f} id={`field-${f}`} ref={(el) => (fieldRefs.current[f] = el)} className="flex items-center gap-3 mb-3">
                <label className="w-1/3 text-gray-600">{f.replace(/_/g, " ")}</label>
                <div className="w-2/3">
                  <DemoInput value={form[f]} highlight={!!typingHighlight[f]} />
                  <div className="text-xs text-gray-400 mt-1">
                    {FEATURE_RANGES[f] ? `${FEATURE_RANGES[f][0]} — ${FEATURE_RANGES[f][1]}` : "—"}
                  </div>
                </div>
              </div>
            ))}

            <div className="flex gap-3 mt-4">
              <StaticButton onClick={() => { if (!playing) setStep(3); }} className="border">Back</StaticButton>
              <StaticButton onClick={() => { if (!playing) setStep(5); }} className="bg-green-600 text-white">Next</StaticButton>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div key="geometry" initial="hidden" animate="visible" exit="exit">
            <h3 className="text-lg font-semibold mb-3">Building Geometry</h3>
            {geometryFields.map((f) => (
              <div key={f} id={`field-${f}`} ref={(el) => (fieldRefs.current[f] = el)} className="flex items-center gap-3 mb-3">
                <label className="w-1/3 text-gray-600">{f.replace(/_/g, " ")}</label>
                <div className="w-2/3">
                  <DemoInput value={form[f]} highlight={!!typingHighlight[f]} />
                  <div className="text-xs text-gray-400 mt-1">
                    {FEATURE_RANGES[f] ? `${FEATURE_RANGES[f][0]} — ${FEATURE_RANGES[f][1]}${f === "Window_To_Wall_Ratio" ? "%" : ""}` : "—"}
                  </div>
                </div>
              </div>
            ))}

            <div className="flex gap-3 mt-4">
              <StaticButton onClick={() => { if (!playing) setStep(4); }} className="border">Back</StaticButton>
              <StaticButton onClick={() => { if (!playing) setStep(6); }} className="bg-blue-600 text-white">Review &amp; Confirm</StaticButton>
            </div>
          </motion.div>
        );

      case 6:
        return (
          <motion.div key="summary" initial="hidden" animate="visible" exit="exit">
            <SummaryTable />
          </motion.div>
        );

      case 7:
        return (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {result ? (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold">Results</h3>
                  <div className={`text-sm font-semibold px-3 py-1 rounded ${result.performance_category === "Excellent" ? "bg-green-100 text-green-700" : result.performance_category === "Moderate" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                    {result.performance_category}
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-36 text-sm font-medium">Total Energy</div>
                    <div className="flex-1 bg-blue-100 h-3 rounded overflow-hidden">
                      <div className="h-3 rounded bg-blue-600" style={{ width: `${Math.min((result.total_energy_month_kwh / 3000) * 100, 100)}%` }} />
                    </div>
                    <div className="w-24 text-right text-sm font-semibold">{result.total_energy_month_kwh} kWh</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-36 text-sm font-medium">Monthly EUI</div>
                    <div className="flex-1 bg-green-100 h-3 rounded overflow-hidden">
                      <div className="h-3 rounded bg-green-600" style={{ width: `${Math.min((result.eui_month_kwh_m2 / 40) * 100, 100)}%` }} />
                    </div>
                    <div className="w-24 text-right text-sm font-semibold">{result.eui_month_kwh_m2} kWh/m²</div>
                  </div>

                  <div>
                    <h4 className="font-semibold">Impacting Factors</h4>
                    <ul className="mt-2">
                      {result.impacting_factors.length ? result.impacting_factors.map((it, i) => (
                        <li key={i} className="mb-2 flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-green-500 mt-2" />{it}</li>
                      )) : <li>No major issues found.</li>}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold">Recommendations</h4>
                    <ul className="mt-2">
                      {result.recommendations.length ? result.recommendations.map((r, i) => (
                        <li key={i} className="mb-2 flex items-start gap-2"><span className="text-blue-500">💡</span>{r}</li>
                      )) : <li>No recommendations.</li>}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button className="px-4 py-2 border rounded bg-blue-600 text-white opacity-50 pointer-events-none cursor-default">⬇️ Download Report (PDF)</button>

                  <button className="px-4 py-2 border rounded bg-green-200 opacity-50 pointer-events-none cursor-default">🔄 Predict Again (Same)</button>

                  {/* NEW: 'New' is now static/disabled like Predict Again */}
                  <button className="px-4 py-2 border rounded bg-green-200 opacity-50 pointer-events-none cursor-default" aria-disabled="true">🔄 New</button>

                  <button onClick={handleRestart} className={`px-4 py-2 border rounded ${!demoEnded && playing ? "opacity-50 pointer-events-none cursor-default" : "bg-green-600 text-white"}`}>🔁 Restart Demo</button>

                  <button onClick={handleCancel} className={`px-4 py-2 border rounded ${!demoEnded && playing ? "opacity-50 pointer-events-none cursor-default" : "bg-red-600 text-white"}`}>❌ Exit</button>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500 py-8">No results yet.</div>
            )}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* <section className="w-full py-12 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-blue-50 p-8 rounded-2xl shadow-xl border border-gray-100 text-center">
            <h1 className="text-2xl font-bold mb-4">Energy Efficiency — Predict (Demo)</h1>
            <p className="text-gray-700 mb-6">Preview the Predict flow: dropdown, typing, summary & results.</p> */}

            <button onClick={() => setOverlayOpen(true)} 
  className="py-3 mt-3 inline-flex items-center gap-3 px-10 rounded-pill hover:bg-blue-400 shadow text-white bg-blue-600 hover:brightness-95 transition-all">
  ▶ View Demo
</button>

          {/* </div>
        </div>
      </section> */}

      <AnimatePresence>
        {overlayOpen && (
          <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000]" />

            <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
              <motion.div
                variants={{
                  hidden: { opacity: 0, scale: 0.995 },
                  visible: { opacity: 1, scale: 1, transition: { duration: 0.22 } },
                  exit: { opacity: 0, scale: 0.995, transition: { duration: 0.18 } },
                }}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="w-[94%] max-w-[980px] max-h-[95vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
              >
                <div className="flex items-center justify-between px-5 py-4 border-b">
                  <h3 className="text-lg font-semibold">Demo</h3>
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-500">{playing ? "Playing demo..." : demoEnded ? "Demo finished" : "Ready"}</div>
                    {/* Cancel (top-right) - stops animation and navigates back to /solutions */}
                    <button onClick={handleCancel} className="text-white px-3 py-1 rounded border bg-red-500 hover:bg-red-100">Close</button>
                  </div>
                </div>

                <CardBody>
  <div className="w-full">
    <video 
      src="/assets/demo.mp4" 
      controls 
      autoPlay 
      className="w-full h-auto rounded-lg shadow"
    />
  </div>
</CardBody>

              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
