import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
const WindTurbine = ({ x, sizeScale = 1.0, floatDelay = 0 }) => {
    const MAST_Z_INDEX = 9;
    const BLADE_Z_INDEX = 12;

    return (
        <motion.div
            style={{
                position: "absolute",
                bottom: `${150 * sizeScale}px`,
                left: `${x}%`,
                transform: "translateX(-50%)",
                pointerEvents: "none",
                zIndex: MAST_Z_INDEX,
                scale: sizeScale,
            }}
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: floatDelay }}
        >
            <div className="flex flex-col items-center">
                <motion.div
                    style={{
                        width: 110,
                        height: 110,
                        position: "relative",
                        zIndex: BLADE_Z_INDEX,
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 7 * (2 - sizeScale), ease: "linear", repeat: Infinity }}
                >
                    {/* Blades */}
                    {[0, 120, 240].map((deg, i) => (
                        <div
                            key={i}
                            style={{
                                width: 9,
                                height: 80,
                                background: "white",
                                borderRadius: 8,
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: `translate(-50%, -100%) rotate(${deg}deg)`,
                                transformOrigin: "50% 100%",
                                boxShadow: "0 0 4px rgba(0,0,0,0.2)",
                            }}
                        />
                    ))}
                </motion.div>

                {/* Mast (Pole) - hidden behind panels */}
                <div
                    style={{
                        width: 10,
                        height: 250,
                        background: "#d9d9d9",
                        borderRadius: 12,
                        marginTop: -60,
                        zIndex: 1,
                    }}
                />
            </div>
        </motion.div>
    );
};

/* ---------------------------------------------------------------
    2. TURBINE GROUP (Wider Gap Fix)
------------------------------------------------------------------ */
const TurbineGroup = ({ count, isRightSide }) => {
    if (count === 0) return null;

    const positions = [
        { x: isRightSide ? 75 : 3, sizeScale: 1.35, floatDelay: 0.5 },
        { x: isRightSide ? 65 : 13, sizeScale: 0.85, floatDelay: 1.5 },
        { x: isRightSide ? 55 : 23, sizeScale: 0.65, floatDelay: 2.5 },
    ];

    const activePositions = positions.slice(0, count);

    return (
        <>
            {activePositions.map((p, i) => (
                <WindTurbine
                    key={i}
                    x={p.x}
                    sizeScale={p.sizeScale}
                    floatDelay={p.floatDelay}
                />
            ))}
        </>
    );
};

/* ---------------------------------------------------------------
    3. SOLAR PANEL ROW
------------------------------------------------------------------ */
const SolarPanelRow = ({ count = 8, sunP, yOffset = 0, zIndex = 10, staggerDelay = 0, xOffset = 0 }) => {
    const panels = Array.from({ length: count });
    const panelTiltX = 50;
    const panelTiltZ = -5;
    const clampedSunP = Math.max(0, Math.min(1, sunP * 1.5));
    const darknessFactor = 1 - clampedSunP;
    const baseGradientStart = `rgba(10, 46, 79, ${0.5 + clampedSunP * 0.5})`;
    const baseGradientEnd = `rgba(23, 135, 255, ${0.7 + clampedSunP * 0.3})`;
    const cellColor = `rgba(180, 210, 255, ${clampedSunP})`;
    const shineOpacity = clampedSunP;

    if (count <= 0) return null;

    return (
        <div
            className="flex justify-center"
            style={{
                position: "absolute",
                left: `calc(50% + ${xOffset}px)`,
                transform: "translateX(-50%)",
                bottom: `${60 + yOffset}px`,
                zIndex: zIndex,
                gap: "1.5rem",
            }}
        >
            {panels.map((_, i) => (
                <motion.div
                    key={i}
                    className="relative pointerEvents-none"
                    animate={{ y: [0, -3, 0] }}
                    transition={{
                        duration: 5 + i * 0.3 + staggerDelay,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    {/* Stand/Grounding Structure */}
                    <div style={{ position: "absolute", bottom: "-4px", left: "50%", transform: "translateX(-50%)", width: "100px", height: "10px", background: "#505050", borderRadius: "4px", zIndex: -2 }}/>
                    <div style={{ position: "absolute", bottom: "0px", left: "50%", transform: `translateX(-50%) translateY(0px) rotate(${panelTiltX / 2}deg)`, transformOrigin: "bottom center", width: "8px", height: "70px", background: "linear-gradient(to bottom, #6a6a6a, #4a4a4a)", borderRadius: "4px", zIndex: -1, boxShadow: `0 0 3px rgba(0,0,0,${0.2 * sunP})` }}/>
                    <div style={{ position: "absolute", bottom: `${70 - panelTiltX*0.8}px`, left: "50%", transform: `translateX(-50%) rotate(${panelTiltX}deg)`, width: "80px", height: "6px", background: "linear-gradient(to right, #7a7a7a, #5a5a5a)", borderRadius: "2px", zIndex: 0 }}/>

                    {/* The Solar Panel Itself */}
                    <motion.div
                        className="w-32 h-16 rounded-md shadow-lg overflow-hidden"
                        style={{
                            position: 'relative',
                            transform: `perspective(600px) rotateX(${panelTiltX}deg) rotateZ(${panelTiltZ}deg) translateY(-${panelTiltX * 1.5}px)`,
                            transformOrigin: 'bottom center',
                            background: "linear-gradient(145deg, " + baseGradientStart + " 0%, " + baseGradientEnd + " 50%, " + baseGradientStart + " 100%)",
                            border: "1px solid #3c5d79",
                            boxShadow: `0 8px 20px rgba(0,0,0,${0.4 * clampedSunP})`,
                            transition: "background 1s linear, box-shadow 1s linear",
                            zIndex: 1,
                        }}
                        animate={{ y: [0, -2, 0] }}
                        transition={{
                            duration: 4 + i * 0.2 + staggerDelay,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.5,
                        }}
                    >
                        {/* Darkness Overlay */}
                        <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(10, 15, 26, 0.9)", opacity: darknessFactor, transition: "opacity 1s linear", zIndex: 0 }}/>

                        {/* Cells */}
                        <div className="absolute inset-0 grid grid-cols-4 grid-rows-2 gap-px p-1" style={{ zIndex: 1 }}>
                            {Array.from({ length: 8 }).map((_, cellIdx) => (
                                <div
                                    key={cellIdx}
                                    className="rounded-sm"
                                    style={{ backgroundColor: cellColor, transition: "background-color 1s linear" }}
                                />
                            ))}
                        </div>

                        {/* Shine effect */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                            style={{ opacity: shineOpacity, transition: "opacity 0.5s", zIndex: 2 }}
                            animate={{ x: ["-100%", "200%"] }}
                            transition={{ duration: 2 + i * 0.1 + staggerDelay, repeat: Infinity, ease: "linear" }}
                        />
                    </motion.div>
                </motion.div>
            ))}
        </div>
    );
};

/* ---------------------------------------------------------------
    4. SOLAR FARM
------------------------------------------------------------------ */
const SolarFarm = ({ sunP, counts }) => {
    return (
        <>
            <SolarPanelRow count={counts.middleBack} sunP={sunP} yOffset={100} zIndex={9} staggerDelay={0.3} xOffset={10} />
            <SolarPanelRow count={counts.middleFront} sunP={sunP} yOffset={28} zIndex={10} staggerDelay={2.5} xOffset={15} />
            <SolarPanelRow count={counts.front} sunP={sunP} yOffset={-50} zIndex={11} staggerDelay={0.7} xOffset={0} />
        </>
    );
};


const DynamicHero = () => {
    const heroRef = useRef(null);
    const [dims, setDims] = useState({ w: 1000, h: 500 });
    const [t, setT] = useState(0.25); // Start in the day mode

    // Constants for Panel Sizing
    const PANEL_WIDTH = 128;
    const GAP_WIDTH = 24;

    useEffect(() => {
        const measure = () => {
            if (heroRef.current) {
                const r = heroRef.current.getBoundingClientRect();
                setDims({ w: r.width, h: r.height });
            }
        };
        measure();
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
    }, []);

    useEffect(() => {
        let current = t;
        const cycle = 14000;
        let raf;

        const frame = () => {
            current += 16 / cycle;
            if (current >= 1) current = 0;
            setT(current);
            raf = requestAnimationFrame(frame);
        };
        raf = requestAnimationFrame(frame);
        return () => cancelAnimationFrame(raf);
    }, [t]);

    const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
    const fade = (p) => (p < 0.1 ? p / 0.1 : p > 0.9 ? (1 - p) / 0.1 : 1);

    const sunP_raw = t < 0.5 ? t / 0.5 : 0;
    const moonP = t >= 0.5 ? (t - 0.5) / 0.5 : 0;

    const sunOpacity = fade(sunP_raw);
    const moonOpacity = fade(moonP);

    // Text Color Logic
    const isDay = t < 0.5;
    const defaultTextColor = isDay ? "text-gray-800" : "text-white";
    const secondaryTextColor = isDay ? "text-gray-600" : "text-gray-300";

    const { w, h } = dims;

    const startX = w + w * 0.1;
    const endX = -w * 0.1;
    const baseY = h * 0.70;
    const peak = h * 0.50;
    const arcY = (p) => baseY - peak * 4 * p * (1 - p);
    const arcX = (p) => startX + (endX - startX) * p;

    const sunX = arcX(sunP_raw);
    const sunY = arcY(sunP_raw);
    const moonX = arcX(moonP);
    const moonY = arcY(moonP);

    const sunSize = Math.max(60, Math.min(120, h * 0.12));
    const moonSize = sunSize * 0.7;

    const getSky = () => {
        if (t < 0.25) return "linear-gradient(to bottom,#9fd9ff,#d7efff)";
        if (t < 0.5) return "linear-gradient(to bottom,#6bb5ff,#ffd397)";
        if (t < 0.75) return "linear-gradient(to bottom,#1b1d3a,#0a0f1a)";
        return "linear-gradient(to bottom,#081229,#2d456d)";
    };

    const stars = t >= 0.5 ? clamp(moonP, 0, 1) : 0;

    const getTurbineCount = (width) => (width < 480 ? 0 : width < 800 ? 1 : 3);
    const currentTurbineCount = getTurbineCount(w);

    const getPanelCount = (maxCount) => {
        const requiredWidth = maxCount * PANEL_WIDTH + (maxCount - 1) * GAP_WIDTH;
        const effectiveWidth = w * 0.90;
        if (requiredWidth <= effectiveWidth) return maxCount;
        const possibleCount = Math.floor((effectiveWidth + GAP_WIDTH) / (PANEL_WIDTH + GAP_WIDTH));
        return Math.max(0, possibleCount);
    };

    const maxFrontCount = 9;
    const currentFrontCount = getPanelCount(maxFrontCount);

    const solarCounts = {
        front: currentFrontCount,
        middleFront: Math.max(0, currentFrontCount - 1),
        middleBack: Math.max(0, currentFrontCount - 2),
        far: Math.max(0, currentFrontCount - 3),
    };

    return (
        <section
            ref={heroRef}
            className="relative flex items-center text-center py-40 px-6 overflow-hidden"
            style={{
                background: getSky(),
                transition: "background 1s linear",
                minHeight: "100vh",
            }}
        >
            {/* SUN */}
            <div
                style={{
                    position: "absolute",
                    width: sunSize,
                    height: sunSize,
                    left: sunX - sunSize / 2,
                    top: sunY - sunSize / 2,
                    opacity: sunOpacity,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, #fff6c7 30%, #ffcb47 60%, #ff9a2b 100%)",
                    boxShadow: "0 0 40px 12px rgba(255,200,80,0.6)",
                    pointerEvents: "none",
                    zIndex: 5,
                }}
            />

            {/* MOON */}
            <div
                style={{
                    position: "absolute",
                    width: moonSize,
                    height: moonSize,
                    left: moonX - moonSize / 2,
                    top: moonY - moonSize / 2,
                    opacity: moonOpacity,
                    borderRadius: "50%",
                    background: "radial-gradient(circle,#cfd3d8 40%, #aab1b9 80%)",
                    boxShadow: "0 0 24px 8px rgba(255,255,255,0.5)",
                    pointerEvents: "none",
                    zIndex: 5,
                }}
            />

            {/* STARS overlay */}
            <div
                className="absolute inset-0"
                style={{
                    opacity: stars,
                    transition: "opacity 1s linear",
                    backgroundImage: `
                        radial-gradient(2px 2px at 20% 30%, white, transparent),
                        radial-gradient(1.5px 1.5px at 70% 10%, white, transparent),
                        radial-gradient(2px 2px at 85% 60%, white, transparent),
                        radial-gradient(1.2px 1.2px at 10% 80%, white, transparent)
                    `,
                    zIndex: 8,
                    pointerEvents: "none",
                }}
            />

            <TurbineGroup count={currentTurbineCount} isRightSide={true} />

            {/* SOLAR FARM */}
            <SolarFarm sunP={sunP_raw} counts={solarCounts} />

            {/* GREEN LAND BASE */}
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    width: "100%",
                    height: "200px",
                    background: "radial-gradient(circle at center top, #6fcf73, #4b8f4d)",
                    borderTopLeftRadius: "50%",
                    borderTopRightRadius: "50%",
                    transform: "scaleX(1.4)",
                    zIndex: 2,
                    pointerEvents: "none",
                }}
            />

            {/* TEXT CONTENT - LEFT SIDE WITHOUT BLUR */}
            <div className="text-left relative z-10 max-w-7xl mx-auto w-full">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-xl lg:max-w-2xl xl:max-w-3xl"
                >
                    <motion.h1
                        className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <span className={defaultTextColor}>
                            Smarter
                        </span>
                        <br />
                        <span className={defaultTextColor}>
                            Sustainable
                        </span>
                        <br />
                        <span className={defaultTextColor}>Energy Future</span>
                    </motion.h1>

                    <motion.p
                        className={`text-xl md:text-2xl ${secondaryTextColor} mb-8 leading-relaxed`}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        We combine AI and data analytics to predict and optimize energy resources across homes and industries.
                    </motion.p>
                </motion.div>
            </div>
        </section>
    );
};
export default DynamicHero;