import React from 'react';

const Seo: React.FC = () => {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "BarOrPub",
    "name": "Filament Bar (Baner)",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 High Street, Baner",
      "addressLocality": "Pune",
      "postalCode": "411045",
      "addressRegion": "MH",
      "addressCountry": "IN"
    },
    "telephone": "+91-9876543210",
    "email": "contact@filamentbar.com",
    "url": "https://www.filamentbar.com",
    "image": "/path/to/logo-or-hero-image.jpg",
    "priceRange": "₹₹",
    "servesCuisine": "Cocktails, Continental",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Sunday"
        ],
        "opens": "18:00",
        "closes": "23:59"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Friday",
          "Saturday"
        ],
        "opens": "18:00",
        "closes": "01:30"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
    </>
  );
};

export default Seo;