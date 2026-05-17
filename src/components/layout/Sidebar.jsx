import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaUserPlus, FaUsers, FaClipboardList, FaCog } from 'react-icons/fa';
import { useLang } from '../../context/LangContext';

const Sidebar = () => {
  const location = useLocation();
  const { t } = useLang(); 

  const THEME = {
      bg: '#1a1a2e',
      text: '#a0a0c0',
      activeText: '#fff',
      highlight: '#f0a500'
  };

  const sidebarStyle = {
    height: '100vh',
    width: '260px',
    position: 'fixed',
    top: 0,
    left: 0,
    backgroundColor: THEME.bg,
    color: '#fff',
    boxShadow: '4px 0 15px rgba(0,0,0,0.4)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    paddingTop: '25px'
  };

  const linkStyle = {
    color: THEME.text, 
    textDecoration: 'none',
    padding: '14px 25px',
    display: 'flex',
    alignItems: 'center',
    fontSize: '15px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    borderLeft: '5px solid transparent'
  };

  const activeLinkStyle = {
    ...linkStyle,
    color: THEME.activeText, 
    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
    borderLeft: `5px solid ${THEME.highlight}`,
    fontWeight: '600'
  };

  return (
    <div style={sidebarStyle}>
      
      <div className="mb-5 px-4">
        <h4 className="fw-bold m-0 text-uppercase" style={{ color: THEME.highlight, letterSpacing: '1px', fontSize: '20px', lineHeight: '1.2' }}>
            New Star <br/> Mens Wear
        </h4>
        <small style={{ color: '#6c757d', fontSize: '12px', display: 'block', marginTop: '5px' }}>{t('tailorManagement')}</small>
      </div>

      <Nav className="flex-column gap-1">
          <Link to="/" style={location.pathname === '/' ? activeLinkStyle : linkStyle}>
             <FaHome className="me-3" size={18} /> {t('dashboard')}
          </Link>

          <Link to="/add-customer" style={location.pathname === '/add-customer' ? activeLinkStyle : linkStyle}>
             <FaUserPlus className="me-3" size={18} /> {t('newOrder')}
          </Link>

          <Link to="/customers" style={location.pathname === '/customers' ? activeLinkStyle : linkStyle}>
             <FaUsers className="me-3" size={18} /> {t('customerDirectory')}
          </Link>

          <Link to="/pending-work" style={location.pathname === '/pending-work' ? activeLinkStyle : linkStyle}>
             <FaClipboardList className="me-3" size={18} /> {t('pendingOrders')}
          </Link>
      </Nav>

      <div className="mt-auto mb-4"> 
        <Link to="/settings" style={location.pathname === '/settings' ? activeLinkStyle : linkStyle}>
            <FaCog className="me-3" size={18} /> {t('settings')}
        </Link>
      </div>

    </div>
  );
};

export default Sidebar;