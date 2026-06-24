import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'Events', path: '/events' },
    { name: 'Reservations', path: '/reservations' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="bg-[#1A1A1A] p-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <NavLink to="/" className="text-[#F5F5F5] text-2xl font-bold">
          Filament
        </NavLink>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                clsx(
                  'text-[#F5F5F5] hover:text-[#FFB800] transition-colors duration-200',
                  isActive && 'text-[#FFB800]'
                )
              }
            >
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-[#F5F5F5] focus:outline-none">
            {isMenuOpen ? (
              // Close icon (X)
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            ) : (
              // Hamburger icon
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <nav className="md:hidden absolute top-16 left-0 w-full bg-[#1A1A1A] p-4 shadow-lg z-10">
          <div className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={toggleMenu} // Close menu on link click
                className={({ isActive }) =>
                  clsx(
                    'block text-[#F5F5F5] py-2 text-lg',
                    isActive && 'text-[#FFB800]'
                  )
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;