import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import AOS from "aos";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

// ====================================================================
// NEW COMPONENT: Floating/Sticky Prediction Button
// ====================================================================
const FloatingPredictionButton = ({ isFixed }) => {
  // Common button styling
  const buttonContent = (
    <div className="flex items-center">
      {/* Animated Hand */}
      <motion.div
        animate={{ x: [0, -8, 0] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className="text-4xl select-none"
      >
        👉
      </motion.div>

      {/* Button */}
      <motion.button
        className="
          bg-gradient-to-r from-blue-600 to-cyan-500 
          text-white px-8 py-3 text-lg font-bold 
          rounded-full shadow-xl flex items-center 
          hover:shadow-2xl transition-all select-none
        "
        whileHover={{ scale: 1.1 }}
      >
        Try the Prediction Model <ArrowRight className="w-5 h-5 ml-2" />
      </motion.button>
    </div>
  );

  return (
    <Link 
      to="/predict" 
      className="no-underline hover:no-underline focus:no-underline active:no-underline"
      // Apply fixed positioning and styling when isFixed is true
      style={isFixed ? { 
        position: 'fixed', 
        top: '5rem',    // <--- ADJUSTED: Set to 5rem to clear a standard fixed Navbar (~4rem tall)
        right: '2rem',  
        zIndex: 50,     
      } : {}}
    >
      {buttonContent}
    </Link>
  );
};


const SolutionsPage = () => {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  const [isFixed, setIsFixed] = useState(false);
  const buttonContainerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (buttonContainerRef.current) {
        // Get the bottom edge of the button's initial container
        const bottomOfContainer = buttonContainerRef.current.getBoundingClientRect().bottom;
        
        // If the bottom of the container is past the top of the viewport (e.g., less than 50px away),
        // we set isFixed to true to float the button.
        setIsFixed(bottomOfContainer < 50);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  return (
    <div className="min-h-screen bg-[#FCF5EE] text-gray-800 font-sans py-10">

      {/* ==============================
          SECTION 1 — HERO
      =============================== */}
      <section
        className="relative h-[50vh] w-full flex flex-col justify-center items-center text-center"
        style={{
          backgroundImage: "url('/assets/ourhero.png')",
          backgroundSize: "contain contain",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>

        <div className="relative z-10 px- max-w-3xl mx-auto">
          
          <motion.h1
            className="text-white text-5xl md:text-6xl font-extrabold leading-tight"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
          >
            Our AI
          </motion.h1>

          <div className="w-28 h-1 bg-red-500 mx-auto mt-5 rounded-full"></div>
        </div>
      </section>

      {/* ================================
          SIDE-BY-SIDE — ABOUT/HOW IT WORKS
      ================================ */}
      <section className="py-20 px-6 md:px-16 max-w-8xl mx-auto pb-0">
        <div className="grid grid-cols-1 gap-12 items-start">
          {/* LEFT — ABOUT THE MODEL (Large Container) */}
          <motion.div
            className="bg-white p-10 text-justify shadow-xl border border-[#0b365f] leading-relaxed"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            ref={buttonContainerRef} // Assign the ref here
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-bold text-[#0b365f]">About Our Model</h3>
              
              {/* === BUTTON IN ITS DEFAULT POSITION (Visible only when not fixed) === */}
              {!isFixed && (
                <div className="text-center" data-aos="fade-up">
                  <FloatingPredictionButton isFixed={false} />
                </div>
              )}
              {/* =================================================================== */}

            </div>
            <p className="text-lg">Our machine learning model is designed to accurately predict a building’s monthly total energy consumption and **Energy Use Intensity (EUI)**.</p>
            <p className="text-lg">The model analyzes key factors influencing energy usage, utilizing comprehensive inputs provided by the user. These inputs include **building and operational parameters** (such as total area, occupancy level, lighting/equipment density, and domestic hot water usage) as well as **envelope-related parameters** (like insulation U-values, window-to-wall ratio, and building type—e.g., bungalow, detached). HVAC system efficiency (COP) is also a crucial input.</p>
            <p className="text-lg">By evaluating how these factors affect energy performance, the system identifies inefficiencies and generates tailored, personalized recommendations (e.g., improving envelope insulation or optimizing HVAC performance). Ultimately, this provides building owners with actionable insights to reduce energy consumption, lower operational costs, improve efficiency, and clearly understand their building’s monthly performance.</p>
          </motion.div>

          {/* RIGHT SIDE STACK (2 CONTAINERS) */}
          <div className="flex flex-col gap-8 w-full text-lg"> 
            
            {/* CONTAINER 1: HOW IT WORKS & DEMO */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-white p-6 md:p-8 shadow-xl border border-[#0b365f] leading-relaxed w-full" 
            >
              <div className="mb-4 text-justify">
                <h3 className="text-3xl font-bold text-[#0b365f] mb-5">
                  How Model Works
                </h3>
                <p>The model analyzes building, envelope, and HVAC inputs using a trained machine learning system to predict monthly energy consumption and Energy Use Intensity (EUI). The “How It Works (PDF)” button provides a detailed document explaining the model’s process, while the “View Demo” button lets users interactively see how predictions are generated.</p>
                
                <div className="mt-6 flex justify-start">
                  <a
                    href="/assets/howitworks.pdf"
                    download
                    className="bg-white text-gray-600 px-10 py-3 text-lg rounded-full shadow-md hover:bg-gray-100 transition-all inline-flex items-center gap-2 mx-3"
                  >
                    📘 How It Works (PDF)
                  </a>

                </div>
              </div>

            </motion.div>

            
            {/* CONTAINER 2: WHY CLIENTS NEED IT */}
            <motion.div
              className="bg-white p-6 shadow-xl border border-gray-200 text-lg"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              
              <h2 className="text-2xl font-semibold mb-3">Why Organizations Use This Model</h2>
              <ul className="text-gray-700 space-y-3 leading-relaxed">
                <li>• Lower energy and operational costs</li>
                <li>• Improve HVAC and building system performance</li>
                <li>• Prevent over-designed systems and energy leakage</li>
                <li>• Achieve sustainability compliance and certifications</li>
              </ul>
            </motion.div>

          </div> {/* End of Right Side Stack */}
        </div>
      </section>

      {/* ================================
          SECTION 5 — FUTURE SCOPE (Full Width)
      ================================ */}
      <section className="pt-5 px-6 md:px-16 max-w-8xl mx-auto">
        <motion.div
          className="bg-white p-10 shadow-2xl leading-relaxed text-gray-700 text-lg"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-[#0b365f] mb-3 flex items-center gap-3">
            Future Scope
          </h2>
          <p className="text-justify">In future releases, the system will evolve into a fully real-time, adaptive energy intelligence platform. We plan to integrate live inputs from smart meters, IoT sensors, and dynamic weather data to deliver continuously updated and more context-aware predictions. The architecture will further expand to support multi-building, industrial, and smart-grid environments with scalable data pipelines. Over time, the platform will also build detailed user-specific energy profiles, enabling deeper trend insights, personalized benchmarks, and long-term optimization paths.</p>
        </motion.div>
      </section>

      {/* === FLOATING BUTTON (Visible only when fixed) === */}
      {isFixed && <FloatingPredictionButton isFixed={true} />}
      {/* ============================================== */}

    </div>
  );
};

export default SolutionsPage;