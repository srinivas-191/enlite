import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import AOS from "aos";


const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);
  return (
    <nav
      className="bg-white text-black shadow-sm border-b border-gray-300 fixed w-full top-0 z-50"
      data-aos="fade-down"
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

        {/* LOGO */}
        <NavLink
          to="/"
          className="flex items-center space-x-2 text-2xl no-underline font-extrabold tracking-wider"
        >
          <img
            src="/assets/ELogo.png"
            alt="logo"
            className="w-9 h-9 rounded-full border border-gray-300 shadow-sm"
          />
          <span className="text-black">Enlite</span>
        </NavLink>

        {/* DESKTOP MENU */}
        <ul className="hidden md:flex space-x-10 text-lg font-medium mx-auto">

          <li>
            <NavLink
              to="/home"
              className={({ isActive }) =>
                `p-2 px-3 relative transition no-underline
                 ${isActive ? "bg-sia-blue text-white rounded-md" : "text-black"}

                 after:absolute after:left-0 after:-bottom-1 after:h-[2px]
                 after:w-0 after:bg-sia-blue hover:after:w-full after:transition-all
                `
              }
            >
              Home
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `p-2 px-3 relative transition no-underline
                 ${isActive ? "bg-sia-blue text-white rounded-md" : "text-black"}

                 after:absolute after:left-0 after:-bottom-1 after:h-[2px]
                 after:w-0 after:bg-sia-blue hover:after:w-full after:transition-all
                `
              }
            >
              About
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/solutions"
              className={({ isActive }) =>
                `p-2 px-3 relative transition no-underline
                 ${isActive ? "bg-sia-blue text-white rounded-md" : "text-black"}

                 after:absolute after:left-0 after:-bottom-1 after:h-[2px]
                 after:w-0 after:bg-sia-blue hover:after:w-full after:transition-all
                `
              }
            >
              Solutions
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `p-2 px-3 relative transition no-underline
                 ${isActive ? "bg-sia-blue text-white rounded-md" : "text-black"}

                 after:absolute after:left-0 after:-bottom-1 after:h-[2px]
                 after:w-0 after:bg-sia-blue hover:after:w-full after:transition-all
                `
              }
            >
              Contact
            </NavLink>
          </li>

        </ul>

        {/* MOBILE TOGGLE */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-black focus:outline-none"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* MOBILE MENU */}
{isOpen && (
  <div className="md:hidden bg-white border-t border-gray-200 ">
    <ul className="flex flex-col space-y-4 py-4 px-6 text-lg font-medium">

      <li>
        <NavLink
          to="/home"
          className={({ isActive }) =>
  `inline-block p-2 px-3 relative transition no-underline
   ${isActive ? "bg-sia-blue text-white rounded-md" : "text-black"}

   after:absolute after:left-0 after:-bottom-1 after:h-[2px]
   after:w-0 after:bg-sia-blue hover:after:w-full after:transition-all
  `
}

          onClick={() => setIsOpen(false)}
        >
          Home
        </NavLink>
      </li>

      <li>
        <NavLink
          to="/about"
          className={({ isActive }) =>
  `inline-block p-2 px-3 relative transition no-underline
   ${isActive ? "bg-sia-blue text-white rounded-md" : "text-black"}

   after:absolute after:left-0 after:-bottom-1 after:h-[2px]
   after:w-0 after:bg-sia-blue hover:after:w-full after:transition-all
  `
}

          onClick={() => setIsOpen(false)}
        >
          About
        </NavLink>
      </li>

      <li>
        <NavLink
          to="/solutions"
          className={({ isActive }) =>
  `inline-block p-2 px-3 relative transition no-underline
   ${isActive ? "bg-sia-blue text-white rounded-md" : "text-black"}

   after:absolute after:left-0 after:-bottom-1 after:h-[2px]
   after:w-0 after:bg-sia-blue hover:after:w-full after:transition-all
  `
}

          onClick={() => setIsOpen(false)}
        >
          Our AI
        </NavLink>
      </li>

      <li>
        <NavLink
          to="/contact"
          className={({ isActive }) =>
  `inline-block p-2 px-3 relative transition no-underline
   ${isActive ? "bg-sia-blue text-white rounded-md" : "text-black"}

   after:absolute after:left-0 after:-bottom-1 after:h-[2px]
   after:w-0 after:bg-sia-blue hover:after:w-full after:transition-all
  `
}

          onClick={() => setIsOpen(false)}
        >
          Contact
        </NavLink>
      </li>



    </ul>
  </div>
)}

    </nav>
  );
};

export default Navbar;