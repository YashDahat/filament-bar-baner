import React from 'react';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div>
      {/* <Seo /> // Removed as module './Seo' was not found in context */}
      <Header />
      <main>{children}</main>
      {/* <Footer /> // Removed as module './Footer' was not found in context */}
    </div>
  );
};

export default Layout;