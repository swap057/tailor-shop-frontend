import React from 'react';
import { Card, Row, Col, Form, Button } from 'react-bootstrap';
import { FaMinus, FaPlus, FaTrash, FaCheckCircle } from 'react-icons/fa';
import { useLang } from '../../context/LangContext';

const MeasurementCard = ({ 
    title, icon, fields, 
    styleOptions, selectedStyles, onStyleChange, 
    formData, handleChange,
    onSmartEnter,
    selectName 
}) => {
  
  const { t } = useLang();
  
  const labelStyle = { fontSize: '14px', marginBottom: '4px', fontWeight: '600', color: '#6c757d' };
  const inputStyle = { fontSize: '16px', padding: '8px 12px', height: '45px', borderRadius: '8px' };

  const handleDropdownSelect = (e) => {
    const styleName = e.target.value;
    if (styleName) {
        onStyleChange(styleName, 'increment');
        e.target.value = ""; 
    }
  };

  const getHelperHint = (fieldName, value) => {
    if (fieldName !== "shirt_collar_cuff") return null;

    const currentCount = value ? value.toString().split('/').filter(v => v.trim() !== '').length : 0;
    const isDone = currentCount >= 2; 

    return (
        <small 
            className={`fw-bold ${isDone ? 'text-success' : 'text-primary'}`} 
            style={{ fontSize: '11px', transition: '0.3s' }}
        >
            {isDone ? <FaCheckCircle className="me-1"/> : null}
            {isDone ? t('ready') : t('enterTwoValues')}
        </small>
    );
  };

  return (
    <Card className="shadow-sm border-0 h-100">
      <Card.Header className="py-2 px-3" style={{ backgroundColor: '#1a1a2e', color: '#f0a500', fontSize: '16px', fontWeight: 'bold' }}>
        <span className="me-2">{icon}</span> {title}
      </Card.Header>
      
      <Card.Body className="p-3 d-flex flex-column h-100"> 
        
        <div className="mb-4 border-bottom pb-3">
            <Form.Label style={{...labelStyle, color: '#f0a500', fontSize: '13px', textTransform: 'uppercase'}}>{t('selectStylesHeading')}</Form.Label>
            
            <Form.Select 
                id={selectName}
                name={selectName}
                style={{...inputStyle, backgroundColor: '#f8f9fa'}} 
                onChange={handleDropdownSelect} 
                onKeyDown={onSmartEnter}
                defaultValue=""
            >
                <option value="" disabled>{t('addStylePlaceholder')}</option>
                {styleOptions.map(option => (<option key={option} value={option}>{option}</option>))}
            </Form.Select>
            
            <div className="mt-2 d-flex flex-column gap-2">
                {Object.entries(selectedStyles).map(([style, qty]) => (
                    <div key={style} className="d-flex justify-content-between align-items-center p-2 border rounded bg-white shadow-sm">
                        <div className="fw-bold text-dark ps-2" style={{fontSize: '14px'}}>{style}</div>
                        <div className="d-flex align-items-center gap-2">
                            <Button variant="outline-danger" size="sm" style={{borderRadius:'50%', width:'30px', height:'30px', padding:0}} onClick={() => onStyleChange(style, 'decrement')}>
                                {qty === 1 ? <FaTrash size={10}/> : <FaMinus size={10}/>}
                            </Button>
                            <span className="fw-bold" style={{minWidth:'20px', textAlign:'center'}}>{qty}</span>
                            <Button variant="outline-success" size="sm" style={{borderRadius:'50%', width:'30px', height:'30px', padding:0}} onClick={() => onStyleChange(style, 'increment')}>
                                <FaPlus size={10}/>
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div>
            <Form.Label style={{...labelStyle, color: '#f0a500', fontSize: '13px', textTransform: 'uppercase'}}>{t('enterMeasurementsHeading')}</Form.Label>
            <Row className="g-3"> 
              {fields.map((field) => {
                const isCollar = field.name === "shirt_collar_cuff";
                const currentCount = formData[field.name] ? formData[field.name].toString().split('/').filter(v=>v.trim()!=='').length : 0;
                const isWarningBorder = isCollar && currentCount < 2;

                return (
                  <Col xs={12} key={field.name}>
                    <div className="d-flex justify-content-between align-items-end mb-1">
                      <Form.Label style={{...labelStyle, marginBottom: 0}}>{field.label}</Form.Label>
                      {getHelperHint(field.name, formData[field.name])}
                    </div>
                    
                    <Form.Control 
                      type={field.type === 'text' ? 'text' : 'number'} 
                      inputMode={field.type === 'text' ? 'text' : 'decimal'} 
                      name={field.name} 
                      value={formData[field.name]} 
                      onChange={handleChange}
                      onKeyDown={onSmartEnter}
                      style={{
                          ...inputStyle,
                          borderColor: isWarningBorder ? '#ffeeba' : '#ced4da',
                          backgroundColor: field.name.includes("shirt_length") ? "#f4f8ff" : "#fff" 
                      }} 
                      autoComplete="off"
                      placeholder={field.ph || ''}
                    />
                  </Col>
                )
              })}
            </Row>
        </div>
      </Card.Body>
    </Card>
  );
};

export default MeasurementCard;