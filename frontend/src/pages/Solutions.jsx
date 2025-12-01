import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Cpu, BarChart3, Leaf, Factory, Building2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import AOS from "aos";

/* Auto-Demo Hero */
import PredictHeroFull from "../components/PredictHeroFull";

const fadeUp = {
 hidden: { opacity: 0, y: 30 },
 visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const SolutionsPage = () => {
useEffect(() => {
 AOS.init({ duration: 1000, once: true });
}, []);

return (
 <div className="min-h-screen bg-[#FCF5EE] text-gray-800 font-sans py-10">

 {/* ==============================
  SECTION 1 — HERO
 =============================== */}
{/* ================================
 HERO SECTION (UPDATED)
================================ */}
<section
className="relative h-[50vh] w-full flex flex-col justify-center items-center text-center"
style={{
 backgroundImage: "url('/assets/ourhero.png')",
 backgroundSize: "contain contain",
 backgroundPosition: "center",
}}
>
{/* Dark overlay for clarity */}
<div className="absolute inset-0 bg-black/60"></div>

<div className="relative z-10 px- max-w-3xl mx-auto">
 
 <motion.h1
 className="text-white text-5xl md:text-6xl font-extrabold leading-tight"
 variants={fadeUp}
 initial="hidden"
 animate="visible"
 >
 Our Solutions
 </motion.h1>

 <div className="w-28 h-1 bg-red-500 mx-auto mt-5 rounded-full"></div>
</div>
</section>

{/* ================================
 SIDE-BY-SIDE — LEFT (About) | RIGHT (Stacked 3: How It Works/Demo, Why, Who)
================================ */}
<section className="py-20 px-6 md:px-16 max-w-8xl mx-auto pb-0">


<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

 {/* LEFT — ABOUT THE MODEL (Large Container) */}
 <motion.div
 className="bg-white p-10 text-justify shadow-xl border border-[#0b365f] leading-relaxed"
 variants={fadeUp}
 initial="hidden"
 whileInView="visible"
 viewport={{ once: true }}
 >
 <h3 className="text-3xl font-bold text-[#0b365f] mb-3">
  About Our Model
 </h3>
 <p className="text-lg">Our machine learning model is designed to accurately predict a building’s monthly total energy consumption and Energy Use Intensity (EUI).</p>
 <p className="text-lg">The model analyzes key factors influencing energy usage, utilizing comprehensive inputs provided by the user. These inputs include building and operational parameters (such as total area, occupancy level, lighting/equipment density, and domestic hot water usage) as well as envelope-related parameters (like insulation U-values, window-to-wall ratio, and building type—e.g., bungalow, detached). HVAC system efficiency (COP) is also a crucial input.</p>
 <p className="text-lg">By evaluating how these factors affect energy performance, the system identifies inefficiencies and generates tailored, personalized recommendations (e.g., improving envelope insulation or optimizing HVAC performance). Ultimately, this provides building owners with actionable insights to reduce energy consumption, lower operational costs, improve efficiency, and clearly understand their building’s monthly performance.</p>

 <div className="text-center mt-12" data-aos="fade-up">

  {/* TRY MODEL BUTTON */}
  <Link to="/predict" className="no-underline">
  <motion.button
   className="bg-blue-600 text-white px-10 py-3 text-lg rounded-full shadow-md hover:bg-blue-700 transition-all flex items-center gap-2 mx-auto "
   whileHover={{ scale: 1.05 }}
  >
   Try the Prediction Model <ArrowRight className="w-5 h-5" />
  </motion.button>
  </Link>
 </div>
 </motion.div>

 

 {/* RIGHT SIDE STACK (3 CONTAINERS) */}
 <div className="flex flex-col gap-8 w-full text-lg"> 
 
  {/* CONTAINER 1: HOW IT WORKS & DEMO */}
  <motion.div
   variants={fadeUp}
   initial="hidden"
   whileInView="visible"
   viewport={{ once: true }}
   className="bg-white p-6 md:p-8 shadow-xl border border-[#0b365f] leading-relaxed w-full" 
  >
   {/* HOW IT WORKS CONTENT */}
   <div className="mb-4 text-justify">
    <h3 className="text-3xl font-bold text-[#0b365f] mb-5">
     How Model Works
    </h3>
    <p>The model analyzes building, envelope, and HVAC inputs using a trained machine learning system to predict monthly energy consumption and Energy Use Intensity (EUI). The “How It Works (PDF)” button provides a detailed document explaining the model’s process, while the “View Demo” button lets users interactively see how predictions are generated.</p>
    
    <div className="mt-6 d-flex justify-start">
     {/* HOW IT WORKS PDF BUTTON */}
     <a
      href="/assets/howitworks.pdf"
      download
      className="bg-white text-gray-600 px-10 py-3 text-lg rounded-full shadow-md hover:bg-gray-100 transition-all inline-flex items-center gap-2 mx-3"
     >
      📘 How It Works (PDF)
     </a>

     <PredictHeroFull />

    </div>
   </div>

   {/* DEMO COMPONENT */}
   
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
 </div>
);
};

export default SolutionsPage;