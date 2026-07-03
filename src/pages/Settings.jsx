import React, { useState, useEffect } from "react";
import { Row, Col, Card, Form, Button, ListGroup, Badge, Spinner } from "react-bootstrap";
import { FaServer, FaDatabase, FaDesktop, FaSyncAlt, FaTrash, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { useToast } from "../context/ToastContext";
import axios from "axios";
import { useLang } from "../context/LangContext";

const Settings = () => {
  const { showToast } = useToast();
  const { t } = useLang();

  const [apiUrl, setApiUrl] = useState("https://my-tailor-app-backend.onrender.com");
  const [apiStatus, setApiStatus] = useState("idle"); 
  const [latency, setLatency] = useState(null);

  useEffect(() => {
    const savedUrl = localStorage.getItem("backendApiUrl");
    if (savedUrl) setApiUrl(savedUrl);
  }, []);

  const handleTestConnection = async () => {
    setApiStatus("testing");
    setLatency(null);
    const startTime = Date.now();

    try {
      await axios.get(`${apiUrl}/pending-orders`, { timeout: 60000 });
      const endTime = Date.now();
      setLatency(endTime - startTime);
      setApiStatus("success");
      showToast(t('connSuccessMsg'), "success");
    } catch (error) {
      setApiStatus("error");
      showToast(t('connFailedMsg'), "danger");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("appPasscode");
    window.location.reload();
  };

  const handleClearCache = (type) => {
    if (window.confirm(`${t('clearConfirm1')}${type}${t('clearConfirm2')}`)) {
      if (type === "Session Storage") sessionStorage.clear();
      if (type === "Local Storage") localStorage.clear();
      
      showToast(`${type} ${t('clearedMsg')}`, "success");
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const cardHeaderStyle = { backgroundColor: '#1a1a2e', color: '#f0a500', fontWeight: 'bold' };
  const codeStyle = { fontFamily: 'monospace', backgroundColor: '#f4f6f9', padding: '4px 8px', borderRadius: '4px', color: '#d63384' };

  return (
    <div style={{ paddingBottom: "100px", padding: "20px" }}>
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h4 className="fw-bolder text-dark mb-1">{t('systemSettings')}</h4>
          <p className="text-muted small mb-0">{t('settingsDesc')}</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Button variant="outline-danger" size="sm" className="fw-bold" onClick={handleLogout}>{t('logout')}</Button>
          <Badge bg="dark" className="p-2 fs-6">v1.0.0-beta</Badge>
        </div>
      </div>

      <Row className="g-4">
        <Col lg={6}>
          <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
            <Card.Header className="py-3" style={cardHeaderStyle}>
              <FaServer className="me-2" /> {t('networkApiConfig')}
            </Card.Header>
            <Card.Body className="p-4">
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold text-secondary small text-uppercase">{t('backendBaseUrl')}</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control
                    type="text"
                    value={apiUrl}
                    readOnly
                    style={{ fontFamily: 'monospace', fontSize: '15px', backgroundColor: '#f8f9fa' }}
                  />
                </div>
                <Form.Text className="text-muted">
                  {t('apiUrlDesc')}
                </Form.Text>
              </Form.Group>

              <div className="p-3 bg-light rounded border">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="fw-bold text-dark">{t('connectionDiag')}</span>
                  <Button 
                    variant={apiStatus === "success" ? "success" : apiStatus === "error" ? "danger" : "dark"} 
                    size="sm" 
                    onClick={handleTestConnection}
                    disabled={apiStatus === "testing"}
                  >
                    {apiStatus === "testing" ? <Spinner size="sm" /> : <><FaSyncAlt className="me-1" /> {t('pingServer')}</>}
                  </Button>
                </div>
                
                <ListGroup variant="flush" className="small">
                  <ListGroup.Item className="bg-transparent px-0 d-flex justify-content-between border-light">
                    <span className="text-muted">{t('statusLabel')}</span>
                    {apiStatus === "idle" && <Badge bg="secondary">{t('untested')}</Badge>}
                    {apiStatus === "testing" && <Badge bg="warning" text="dark">{t('pinging')}</Badge>}
                    {apiStatus === "success" && <Badge bg="success"><FaCheckCircle className="me-1"/> {t('online')}</Badge>}
                    {apiStatus === "error" && <Badge bg="danger"><FaExclamationTriangle className="me-1"/> {t('offline')}</Badge>}
                  </ListGroup.Item>
                  <ListGroup.Item className="bg-transparent px-0 d-flex justify-content-between border-light">
                    <span className="text-muted">{t('latency')}</span>
                    <span className="fw-bold">{latency ? `${latency} ms` : "-"}</span>
                  </ListGroup.Item>
                </ListGroup>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
            <Card.Header className="py-3" style={cardHeaderStyle}>
              <FaDatabase className="me-2" /> {t('storageCache')}
            </Card.Header>
            <Card.Body className="p-4">
              <p className="text-muted small mb-4">
                {t('cacheDesc')}
              </p>

              <ListGroup>
                <ListGroup.Item className="d-flex justify-content-between align-items-center py-3">
                  <div>
                    <h6 className="fw-bold mb-0">{t('clearSession')}</h6>
                    <small className="text-muted">{t('sessionDesc')}</small>
                  </div>
                  <Button variant="outline-warning" onClick={() => handleClearCache("Session Storage")}>
                    <FaTrash className="me-1"/> {t('clearBtn')}
                  </Button>
                </ListGroup.Item>

                <ListGroup.Item className="d-flex justify-content-between align-items-center py-3">
                  <div>
                    <h6 className="fw-bold mb-0 text-danger">{t('hardReset')}</h6>
                    <small className="text-muted">{t('resetDesc')}</small>
                  </div>
                  <Button variant="danger" onClick={() => handleClearCache("Local Storage")}>
                    <FaTrash className="me-1"/> {t('resetBtn')}
                  </Button>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
            <Card.Header className="py-3 bg-light border-bottom text-secondary fw-bold">
              <FaDesktop className="me-2" /> {t('envDetails')}
            </Card.Header>
            <Card.Body className="p-0">
              <ListGroup variant="flush" className="small">
                <ListGroup.Item className="d-flex justify-content-between px-4 py-3">
                  <span className="fw-bold text-muted">{t('reactVersion')}</span>
                  <span style={codeStyle}>{React.version}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between px-4 py-3">
                  <span className="fw-bold text-muted">{t('clientEnv')}</span>
                  <span style={codeStyle}>{process.env.NODE_ENV || "development"}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between px-4 py-3">
                  <span className="fw-bold text-muted">{t('browserAgent')}</span>
                  <span className="text-truncate text-end ms-3 text-muted" style={{maxWidth: '200px'}} title={navigator.userAgent}>
                    {navigator.userAgent}
                  </span>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Settings;