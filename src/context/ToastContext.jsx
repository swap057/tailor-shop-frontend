import React, { createContext, useState, useContext, useCallback } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('success'); // 'success', 'danger', 'warning'

  // Function to trigger the toast
  const showToast = useCallback((msg, type = 'success') => {
    setMessage(msg);
    setVariant(type);
    setShow(true);
    // Auto-hide is handled by the Toast component's 'delay' prop
  }, []);

  // Icon Helper
  const getIcon = () => {
    if (variant === 'success') return <FaCheckCircle className="me-2" />;
    if (variant === 'danger') return <FaExclamationCircle className="me-2" />;
    return <FaInfoCircle className="me-2" />;
  };

  // Color Helper
  const getBgColor = () => {
    if (variant === 'success') return '#28a745'; // Green
    if (variant === 'danger') return '#dc3545';  // Red
    return '#f0a500'; // Gold/Warning
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* GLOBAL TOAST CONTAINER (Fixed Top-Right) */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999, position: 'fixed' }}>
        <Toast 
            onClose={() => setShow(false)} 
            show={show} 
            delay={3000} 
            autohide 
            style={{
                backgroundColor: 'white',
                borderLeft: `5px solid ${getBgColor()}`,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
        >
          <Toast.Header closeButton={true} style={{border: 'none', backgroundColor: 'white'}}>
            <strong className="me-auto" style={{ color: getBgColor(), display: 'flex', alignItems: 'center' }}>
                {getIcon()} 
                {variant === 'success' ? 'Success' : variant === 'danger' ? 'Error' : 'Info'}
            </strong>
            <small className="text-muted">Just now</small>
          </Toast.Header>
          <Toast.Body style={{fontSize: '14px', fontWeight: '500'}}>
            {message}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </ToastContext.Provider>
  );
};