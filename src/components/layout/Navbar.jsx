import React from 'react';

export default function Navbar({ activeView, setActiveView, isLoggedIn, isAdmin }) {
  return (
    <div className="header-nav">
      <button type="button" className={activeView === 'shop' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActiveView('shop')}>Shop</button>
      <button type="button" className={activeView === 'user' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActiveView('user')} disabled={!isLoggedIn}>Profile</button>
      {isAdmin && (
        <button type="button" className={activeView === 'admin' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActiveView('admin')}>Admin</button>
      )}
    </div>
  );
}

