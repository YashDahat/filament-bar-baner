import React from 'react';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1A1A1A] text-[#F5F5F5] py-8 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        {/* Column 1: Contact Info */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
          <p className="mb-2">123 High Street, Baner, Pune, 411045</p>
          <p className="mb-2">+91-9876543210</p>
          <p>contact@filamentbar.com</p>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Navigate</h3>
          <ul>
            <li className="mb-2"><a href="/" className="hover:text-[#FFB800]">Home</a></li>
            <li className="mb-2"><a href="/menu" className="hover:text-[#FFB800]">Menu</a></li>
            <li className="mb-2"><a href="/events" className="hover:text-[#FFB800]">Events</a></li>
            <li className="mb-2"><a href="/reservations" className="hover:text-[#FFB800]">Reservations</a></li>
            <li className="mb-2"><a href="/contact" className="hover:text-[#FFB800]">Contact</a></li>
          </ul>
        </div>

        {/* Column 3: Social Media */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Follow Us</h3>
          <div className="flex justify-center md:justify-start space-x-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-[#FFB800]">
              <FaFacebook />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-[#FFB800]">
              <FaInstagram />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-[#FFB800]">
              <FaTwitter />
            </a>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="mt-8 pt-4 border-t border-gray-700 text-center">
        <p className="text-sm">© {currentYear} Filament Bar. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;