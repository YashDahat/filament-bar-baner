import React from 'react';
import Layout from '@/components/Layout';

const ContactPage: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto py-12 px-4 bg-[#1A1A1A] text-[#F5F5F5] min-h-screen">
        <h1 className="text-4xl font-bold text-center mb-10 text-[#F5F5F5]">Get In Touch</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left Column: Contact Details */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-[#FFB800]">Contact Details</h2>
            <p className="mb-2">
              <span className="font-bold">Address:</span> 123 High Street, Baner, Pune, 411045
            </p>
            <p className="mb-2">
              <span className="font-bold">Phone:</span>{' '}
              <a href="tel:+919876543210" className="text-[#FFB800] hover:underline">
                +91-9876543210
              </a>{' '}
              (Click to Call)
            </p>
            <p className="mb-2">
              <span className="font-bold">Email:</span>{' '}
              <a href="mailto:contact@filamentbar.com" className="text-[#FFB800] hover:underline">
                contact@filamentbar.com
              </a>
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#FFB800]">Opening Hours</h3>
            <ul className="list-disc list-inside ml-4">
              <li>Monday: 18:00 - 23:59</li>
              <li>Tuesday: 18:00 - 23:59</li>
              <li>Wednesday: 18:00 - 23:59</li>
              <li>Thursday: 18:00 - 23:59</li>
              <li>Friday: 18:00 - 01:30</li>
              <li>Saturday: 18:00 - 01:30</li>
              <li>Sunday: 18:00 - 23:59</li>
            </ul>
          </div>

          {/* Right Column: Google Map */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-[#FFB800]">Our Location</h2>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3782.164807490059!2d73.77452137500001!3d18.567000099999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2bf387342152f%3A0x7770a599b5a0e71!2sBaner%2C%20Pune%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1678912345678!5m2!1sen!2sin"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Filament Bar Location"
              className="rounded-lg shadow-lg"
            ></iframe>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContactPage;