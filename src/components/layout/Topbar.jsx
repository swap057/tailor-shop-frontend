import React from "react";
import { useLang } from "../../context/LangContext";
import { useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";

const Topbar = () => {
  const { language, setLanguage, t } = useLang();
  const navigate = useNavigate();

  const localeMap = { 'English': 'en-GB', 'Marathi': 'mr-IN', 'Hindi': 'hi-IN' };
  const currentLocale = localeMap[language] || 'en-GB';
  
  const today = new Date().toLocaleDateString(currentLocale, { 
    weekday: 'short', day: 'numeric', month: 'short' 
  });

  const topbarStyle = {
    height: "70px", 
    backgroundColor: "#fff",
    borderBottom: "1px solid #e0e0e0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 30px",
    position: "fixed", 
    top: 0,
    right: 0,          
    left: '260px',     
    zIndex: 900        
  };

  return (
    <div style={topbarStyle}>
      
      <div className="d-flex flex-column">
        <span className="fw-bold text-dark" style={{fontSize: '18px', lineHeight: '1.2'}}>
            {today}
        </span>
        <small className="text-muted" style={{fontSize: '12px'}}>{t('productiveDay')}</small>
      </div>

      <div className="d-flex align-items-center gap-3">
        
        <select
          className="form-select shadow-sm"
          style={{ 
              width: "130px", height: '38px', fontSize: '14px', 
              border: '1px solid #dee2e6', borderRadius: '8px', fontWeight: '600', color: '#495057',
              cursor: 'pointer'
          }}
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="English">🇬🇧 English</option>
          <option value="Marathi">🚩 मराठी</option>
          <option value="Hindi">🇮🇳 हिंदी</option>
        </select>

        <button 
          className="btn btn-dark d-flex align-items-center shadow-sm" 
          style={{ height: '38px', borderRadius: '8px', fontWeight: '600', padding: '0 16px', fontSize: '14px' }}
          onClick={() => navigate('/add-customer')}
        >
          <FaPlus className="me-2 text-warning" /> {t('newOrder')}
        </button>

      </div>
    </div>
  );
};

export default Topbar;