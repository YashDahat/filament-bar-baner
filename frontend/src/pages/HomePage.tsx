import React from 'react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section
        className="relative h-[600px] bg-cover bg-center flex items-center justify-center text-center"
        style={{ backgroundImage: "url('/images/hero-cocktail.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 p-4 max-w-2xl">
          <h1 className="text-5xl md:text-6xl font-bold text-[#F5F5F5] mb-4">
            Experience the Spark.
          </h1>
          <p className="text-xl md:text-2xl text-[#F5F5F5] mb-8">
            Craft Cocktails & Live Music in the Heart of Baner.
          </p>
          <Link
            to="/reservations"
            className="inline-block px-8 py-3 bg-[#FFB800] text-[#1A1A1A] font-semibold rounded-full hover:bg-[#E0A000] transition-colors duration-300"
          >
            Book Your Table
          </Link>
        </div>
      </section>

      {/* Featured Cocktails Section */}
      <section className="py-16 bg-[#1A1A1A] text-[#F5F5F5] px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            Our Signature Creations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Cocktail Card 1 */}
            <div className="bg-[#2A2A2A] rounded-lg shadow-lg overflow-hidden">
              <img
                src="/images/cocktail1.jpg"
                alt="The Filament"
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-2xl font-semibold mb-2">The Filament</h3>
                <p className="text-gray-400">
                  A vibrant blend of gin, elderflower, and fresh citrus, topped with a hint of sparkle.
                </p>
              </div>
            </div>
            {/* Cocktail Card 2 */}
            <div className="bg-[#2A2A2A] rounded-lg shadow-lg overflow-hidden">
              <img
                src="/images/cocktail2.jpg"
                alt="Electric Elixir"
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-2xl font-semibold mb-2">Electric Elixir</h3>
                <p className="text-gray-400">
                  Vodka infused with exotic fruits and a secret ingredient that gives it a subtle glow.
                </p>
              </div>
            </div>
            {/* Cocktail Card 3 */}
            <div className="bg-[#2A2A2A] rounded-lg shadow-lg overflow-hidden">
              <img
                src="/images/cocktail3.jpg"
                alt="Neon Nectar"
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-2xl font-semibold mb-2">Neon Nectar</h3>
                <p className="text-gray-400">
                  A refreshing mix of tequila, agave, and a splash of grapefruit, garnished with a twist.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events Preview Section */}
      <section className="py-16 bg-[#2A2A2A] text-[#F5F5F5] px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">This Week at Filament</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            From live jazz to DJ nights, there's always a vibe. Check our events page for the latest lineup.
          </p>
          <Link
            to="/events"
            className="inline-block px-8 py-3 border border-[#FFB800] text-[#FFB800] font-semibold rounded-full hover:bg-[#FFB800] hover:text-[#1A1A1A] transition-colors duration-300"
          >
            See All Events
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;