import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Badge,
  Form,
  Modal,
  Button,
  Row,
  Col,
  Nav
} from "react-bootstrap";
import { useLocation } from "react-router-dom";
import {
  FaSearch,
  FaEye,
  FaCheckCircle,
  FaRulerCombined,
  FaWhatsapp,
  FaExclamationTriangle,
  FaTshirt,
  FaRulerVertical,
  FaEdit,
  FaSave,
  FaTimes
} from "react-icons/fa";
import { useLang } from "../context/LangContext";
import axios from "axios";
import { useToast } from "../context/ToastContext";

// Treats a measurement as "present" if it contains any non-zero digit.
// Works for plain numbers ("6.00") and two-value strings ("12 / 6"); hides "0" / "0.00".
const hasMeasureValue = (v) => v != null && String(v).trim() !== "" && /[1-9]/.test(String(v));

const PendingWork = () => {
  const { t } = useLang();
  const { showToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const location = useLocation();
  const initialTab = location.state?.activeTab || "ALL";
  const [activeTab, setActiveTab] = useState(initialTab);

  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [progress, setProgress] = useState({ shirt: 0, pant: 0 });
  const [modalView, setModalView] = useState("shirt");
  const [isEditingMeas, setIsEditingMeas] = useState(false);
  const [isSavingMeas, setIsSavingMeas] = useState(false);
  const [measForm, setMeasForm] = useState({});

  const startEditMeas = () => {
    setMeasForm({
      shirtLength: selectedOrder.shirtLength ?? "",
      shirtFront: selectedOrder.shirtFront ?? "",
      shirtShoulder: selectedOrder.shirtShoulder ?? "",
      shirtSleeve: selectedOrder.shirtSleeve ?? "",
      shirtCollar: selectedOrder.shirtCollar ?? "",
      shirtChest: selectedOrder.shirtChest ?? "",
      shirtHalfSleeve: selectedOrder.shirtHalfSleeve ?? "",
      pantLength: selectedOrder.pantLength ?? "",
      pantBelowWaist: selectedOrder.pantBelowWaist ?? "",
      pantWaist: selectedOrder.pantWaist ?? "",
      pantThigh: selectedOrder.pantThigh ?? "",
      pantKnee: selectedOrder.pantKnee ?? "",
      pantBottom: selectedOrder.pantBottom ?? "",
    });
    setIsEditingMeas(true);
  };

  const handleSaveMeasurements = async () => {
    if (isSavingMeas) return;
    setIsSavingMeas(true);
    // Number fields must go as numbers (empty -> 0); text fields stay as strings
    const numFields = ["shirtFront", "shirtShoulder", "shirtSleeve", "shirtChest", "pantBelowWaist", "pantWaist", "pantThigh", "pantKnee"];
    const payload = { orderId: selectedOrder.orderId };
    Object.keys(measForm).forEach((k) => {
      if (numFields.includes(k)) {
        const n = parseFloat(measForm[k]);
        payload[k] = isNaN(n) ? 0 : n;
      } else {
        payload[k] = measForm[k] ?? "";
      }
    });
    try {
      await axios.post("https://my-tailor-app-backend.onrender.com/update-measurements", payload);
      showToast(t('measurementsUpdated'), "success");
      setSelectedOrder({ ...selectedOrder, ...payload });
      setIsEditingMeas(false);
      fetchOrders();
    } catch (error) {
      const backendMsg = error.response?.data?.message || t('failedToSave');
      showToast(backendMsg, "danger");
    } finally {
      setIsSavingMeas(false);
    }
  };

  const measInput = (label, field, type = "number") => (
    <Col xs={6} md={4}>
      <Form.Label className="text-muted fw-bold text-uppercase" style={{ fontSize: '10px', marginBottom: '2px' }}>{label}</Form.Label>
      <Form.Control
        size="sm"
        type={type === "text" ? "text" : "number"}
        inputMode="decimal"
        value={measForm[field] ?? ""}
        onChange={(e) => setMeasForm({ ...measForm, [field]: e.target.value })}
      />
    </Col>
  );

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];

    let results = orders.filter(
      (o) =>
        o.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.mobileNo.includes(searchTerm),
    );

    results.sort((a, b) => new Date(a.deadlineDate) - new Date(b.deadlineDate));

    if (activeTab === "ALL") {
      results = results.filter((o) => o.deadlineDate >= today);
    } else if (activeTab === "URGENT") {
      results = results.filter((o) => o.deadlineDate === today);
    } else if (activeTab === "OVERDUE") {
      results = results.filter((o) => o.deadlineDate < today);
    }

    setFilteredOrders(results);
  }, [searchTerm, orders, activeTab]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get("https://my-tailor-app-backend.onrender.com/pending-orders");
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const sendWhatsApp = (e, mobile, name) => {
    e.stopPropagation(); 
    const message = `${t('whatsappMsg1')}${name}${t('whatsappMsg2')}`;
    const url = `https://wa.me/91${mobile}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const getDeadlineStyle = (dateStr) => {
    const today = new Date().toISOString().split("T")[0];
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrow = tomorrowDate.toISOString().split("T")[0];

    if (dateStr < today) return { color: "#dc3545", fontWeight: "bold", label: "OVERDUE" }; 
    if (dateStr === today) return { color: "#dc3545", fontWeight: "bold", animation: "blink 1s infinite", label: "TODAY" }; 
    if (dateStr === tomorrow) return { color: "#fd7e14", fontWeight: "bold", label: "TOMORROW" }; 
    return { color: "#198754", label: "DATE", dateValue: dateStr }; 
  };

  const renderDeadlineLabel = (labelObj) => {
    if (labelObj.label === "TODAY") return t('statusToday');
    if (labelObj.label === "TOMORROW") return t('statusTomorrow');
    if (labelObj.label === "OVERDUE") return t('overdue');
    return formatDate(labelObj.dateValue);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "-");
  };

  const MeasurementStat = ({ label, value, highlight }) => {
    let displayValue = value;
    if (value == null || value === "" || Number(value) === 0) {
        displayValue = "-";
    }

    return (
      <div className={`p-3 rounded text-center border h-100 d-flex flex-column justify-content-center ${highlight ? 'border-primary bg-primary bg-opacity-10' : 'bg-light border-light'}`}>
        <div className="text-muted fw-bold mb-1 text-uppercase" style={{ fontSize: "10px", letterSpacing: "1px" }}>{label}</div>
        <div className={`fw-bolder ${displayValue !== "-" ? "text-dark fs-4" : "text-muted fs-5"}`}>
          {displayValue}
        </div>
      </div>
    );
  };

  const renderLengthBox = (lengthStr) => {
    if (!lengthStr || lengthStr === "0" || lengthStr === "None") {
      return <MeasurementStat label={t('length')} value="-" />;
    }

    if (lengthStr.includes(":")) {
      const parts = lengthStr.split(",").map(s => s.trim());
      
      return (
        <div className="p-2 rounded text-center border bg-light border-light h-100 d-flex flex-column justify-content-center">
          <div className="text-muted fw-bold mb-2 text-uppercase" style={{ fontSize: "10px", letterSpacing: "1px" }}>{t('lengths')}</div>
          <div className="d-flex flex-wrap justify-content-center gap-1">
            {parts.map((part, idx) => {
              const p = part.split(":");
              if (p.length === 2) {
                return (
                  <Badge key={idx} bg="white" text="dark" className="border shadow-sm px-2 py-1" style={{ fontSize: '11px' }}>
                    <span className="text-muted me-1">{p[0].trim().substring(0, 3)}:</span> 
                    <span className="fw-bolder fs-6">{p[1].trim()}</span>
                  </Badge>
                );
              }
              return null;
            })}
          </div>
        </div>
      );
    }

    return <MeasurementStat label={t('length')} value={lengthStr} />;
  };

  const renderStyleBadges = (styleStr) => {
    if (!styleStr || styleStr === "None") return <span className="text-muted fst-italic">{t('noStylesSelected')}</span>;
    return styleStr.split(",").map((part, idx) => {
      const match = part.match(/(.+?)\s*\((\d+)\)/);
      if (match) {
        return (
          <Badge key={idx} bg="dark" text="white" className="p-2 fs-6 shadow-sm d-flex align-items-center gap-2 rounded-pill">
            {match[1].trim()} <Badge bg="light" text="dark" pill style={{fontSize: '12px'}}>{match[2]}</Badge>
          </Badge>
        );
      }
      return <Badge key={idx} bg="dark" text="white" className="p-2 fs-6 shadow-sm rounded-pill">{part.trim()}</Badge>;
    });
  };

  const handleRowClick = async (orderId) => {
    try {
      const res = await axios.get(`https://my-tailor-app-backend.onrender.com/order-details/${orderId}`);
      if (res.data) {
        setSelectedOrder(res.data);
        setProgress({ shirt: res.data.shirtCompletedQty || 0, pant: res.data.pantCompletedQty || 0 });
        if (res.data.shirtQty === 0 && res.data.pantQty > 0) setModalView("pant");
        else setModalView("shirt");
        setIsEditingMeas(false);
        setShowModal(true);
      }
    } catch (err) {
      showToast(t('errorFetchingDetails'), "danger");
    }
  };

  const updateCounter = (type, val) => {
    const max = type === "shirt" ? selectedOrder.shirtQty : selectedOrder.pantQty;
    const current = progress[type];
    let newVal = current + val;
    if (newVal >= 0 && newVal <= max) {
      setProgress({ ...progress, [type]: newVal });
    }
  };

  const maxOutCounter = (type) => {
    const max = type === "shirt" ? selectedOrder.shirtQty : selectedOrder.pantQty;
    setProgress({ ...progress, [type]: max });
  };

  const handleSaveChanges = async () => {
    try {
      await axios.post("https://my-tailor-app-backend.onrender.com/update-progress", {
        orderId: selectedOrder.orderId,
        shirtCompletedQty: progress.shirt,
        pantCompletedQty: progress.pant,
      });
      showToast(t('progressUpdated'), "success");
      setShowModal(false);
      fetchOrders();
    } catch (error) {
      const backendMsg = error.response?.data?.message || t('failedToSave');
      showToast(backendMsg, "danger");
    }
  };

  const getStatusBadge = (completed, total) => {
    if (total === 0) return <span className="text-muted">-</span>;
    if (completed === total) return <Badge bg="success">{t('statusDone')}</Badge>;
    if (completed > 0) return <Badge bg="warning" text="dark">{t('statusPartial')}</Badge>;
    return <Badge bg="secondary">{t('statusPending')}</Badge>;
  };

  return (
    <div className="p-4" style={{ paddingBottom: "100px" }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold text-secondary">{t('pendingWork')}</h5>
        <div className="input-group" style={{ maxWidth: "300px" }}>
          <span className="input-group-text bg-white border-end-0"><FaSearch color="#ccc" /></span>
          <Form.Control placeholder={t('searchPlaceholder')} className="border-start-0 shadow-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <Nav variant="tabs" className="mb-3 border-bottom-0" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
        <Nav.Item><Nav.Link eventKey="ALL" className="text-secondary fw-bold">{t('allOrders')}</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link eventKey="URGENT" className="text-danger fw-bold">🔥 {t('urgentToday')}</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link eventKey="OVERDUE" className="text-dark fw-bold">⚠️ {t('overdue')}</Nav.Link></Nav.Item>
      </Nav>

      <Card className="shadow-sm border-0">
        <Table hover responsive className="mb-0 align-middle">
          <thead className="bg-light">
            <tr>
              <th className="py-3 ps-3">{t('deadline')}</th>
              <th>{t('customerName')}</th>
              <th className="text-center">{t('shirtStatus')}</th>
              <th className="text-center">{t('pantStatus')}</th>
              <th className="text-end pe-4">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => {
              const deadlineStyle = getDeadlineStyle(order.deadlineDate);
              return (
                <tr key={order.orderId} style={{ cursor: "pointer" }} onClick={() => handleRowClick(order.orderId)}>
                  <td className="ps-3" style={{ fontSize: "14px" }}>
                    <div style={{ ...deadlineStyle, fontSize: "15px" }}>
                      {deadlineStyle.label === "TODAY" || deadlineStyle.label === "OVERDUE" ? <FaExclamationTriangle className="me-1" /> : null}
                      {renderDeadlineLabel(deadlineStyle)}
                    </div>
                  </td>
                  <td>
                    <div className="fw-bold text-dark">{order.fullName}</div>
                    <small className="text-muted">{order.mobileNo}</small>
                  </td>
                  <td className="text-center">
                    {getStatusBadge(order.shirtCompletedQty, order.shirtQty)}
                    <div style={{ fontSize: "11px" }} className="text-muted mt-1">{order.shirtCompletedQty} / {order.shirtQty}</div>
                  </td>
                  <td className="text-center">
                    {getStatusBadge(order.pantCompletedQty, order.pantQty)}
                    <div style={{ fontSize: "11px" }} className="text-muted mt-1">{order.pantCompletedQty} / {order.pantQty}</div>
                  </td>
                  <td className="text-end pe-3">
                    <div className="d-flex justify-content-end gap-2 align-items-center">
                      <Button variant="success" size="sm" className="rounded-circle" style={{ width: "32px", height: "32px", padding: 0 }} onClick={(e) => sendWhatsApp(e, order.mobileNo, order.fullName)} title={t('sendReadyUpdate')}>
                        <FaWhatsapp size={16} />
                      </Button>
                      <Button variant="light" size="sm" className="rounded-circle text-primary border" style={{ width: "32px", height: "32px", padding: 0 }}>
                        <FaEye size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        {filteredOrders.length === 0 && <div className="text-center p-4 text-muted">{t('noOrdersFound')}</div>}
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg" backdrop="static" keyboard={false}>
        {selectedOrder && (
          <>
            <Modal.Header closeButton className="bg-white border-0 pb-1">
              <Modal.Title className="fw-bolder fs-4 text-dark d-flex align-items-center">
                <FaRulerCombined className="me-2 text-warning" />
                {selectedOrder.fullName}
              </Modal.Title>
            </Modal.Header>

            {selectedOrder.shirtQty > 0 && selectedOrder.pantQty > 0 && (
              <div className="bg-white px-3 pb-3 border-bottom">
                <Nav variant="pills" className="w-100 d-flex gap-2">
                  <Nav.Item>
                    <Nav.Link 
                      active={modalView === "shirt"} 
                      onClick={() => setModalView("shirt")}
                      style={{ borderRadius: '8px', cursor: 'pointer', padding: '8px 24px', fontWeight: 'bold' }}
                      className={modalView === "shirt" ? "bg-dark text-white shadow-sm" : "bg-light text-secondary border"}
                    >
                      <FaTshirt className="me-2" /> {t('shirtsTab')} ({selectedOrder.shirtQty})
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link 
                      active={modalView === "pant"} 
                      onClick={() => setModalView("pant")}
                      style={{ borderRadius: '8px', cursor: 'pointer', padding: '8px 24px', fontWeight: 'bold' }}
                      className={modalView === "pant" ? "bg-dark text-white shadow-sm" : "bg-light text-secondary border"}
                    >
                      <FaRulerVertical className="me-2" /> {t('pantsTab')} ({selectedOrder.pantQty})
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </div>
            )}

            <Modal.Body className="bg-light pt-4">
              {isEditingMeas && (
                <div className="bg-white p-4 rounded-4 shadow-sm mb-3">
                  {selectedOrder.shirtQty > 0 && (
                    <>
                      <h6 className="text-primary fw-bold text-uppercase mb-3"><FaTshirt className="me-2" />{t('shirt')}</h6>
                      <Row className="g-2 mb-4">
                        {measInput(t('length'), "shirtLength", "text")}
                        {measInput(t('front'), "shirtFront")}
                        {measInput(t('shoulder'), "shirtShoulder")}
                        {measInput(t('sleeve'), "shirtSleeve")}
                        {measInput(t('collarCuff'), "shirtCollar", "text")}
                        {measInput(t('chest'), "shirtChest")}
                        {measInput(t('halfSleeve'), "shirtHalfSleeve", "text")}
                      </Row>
                    </>
                  )}
                  {selectedOrder.pantQty > 0 && (
                    <>
                      <h6 className="text-warning fw-bold text-uppercase mb-3"><FaRulerVertical className="me-2" />{t('pant')}</h6>
                      <Row className="g-2">
                        {measInput(t('length'), "pantLength", "text")}
                        {measInput(t('belowWaist'), "pantBelowWaist")}
                        {measInput(t('waist'), "pantWaist")}
                        {measInput(t('thigh'), "pantThigh")}
                        {measInput(t('knee'), "pantKnee")}
                        {measInput(t('bottom'), "pantBottom", "text")}
                      </Row>
                    </>
                  )}
                </div>
              )}
              {!isEditingMeas && (
              <Row className="g-4">
                
                {modalView === "shirt" && selectedOrder.shirtQty > 0 && (
                  <>
                    <Col md={8}>
                      <Card className="border-0 shadow-sm rounded-4 h-100">
                        <Card.Body className="p-4">
                          <h6 className="text-primary fw-bold text-uppercase mb-3" style={{fontSize: '12px', letterSpacing: '1px'}}>{t('coreMeasurements')}</h6>
                          
                          <Row className="g-2 mb-2">
                            <Col xs={4}>{renderLengthBox(selectedOrder.shirtLength)}</Col>
                            <Col xs={4}><MeasurementStat label={t('front')} value={selectedOrder.shirtFront} /></Col>
                            <Col xs={4}><MeasurementStat label={t('shoulder')} value={selectedOrder.shirtShoulder} /></Col>
                          </Row>

                          <Row className={`g-2 ${hasMeasureValue(selectedOrder.shirtHalfSleeve) ? 'mb-2' : 'mb-4'}`}>
                            <Col xs={4}><MeasurementStat label={t('sleeve')} value={selectedOrder.shirtSleeve} /></Col>
                            <Col xs={4}><MeasurementStat label={t('collarCuff')} value={selectedOrder.shirtCollar} /></Col>
                            
                            {Number(selectedOrder.shirtChest) > 0 ? (
                              <Col xs={4}><MeasurementStat label={t('chest')} value={selectedOrder.shirtChest} /></Col>
                            ) : null}
                          </Row>

                          {hasMeasureValue(selectedOrder.shirtHalfSleeve) ? (
                            <Row className="g-2 mb-4">
                              <Col xs={4}>
                                <MeasurementStat label={t('halfSleeve')} value={selectedOrder.shirtHalfSleeve} highlight={true} />
                              </Col>
                            </Row>
                          ) : null}

                          <h6 className="text-primary fw-bold text-uppercase mb-3 mt-4" style={{fontSize: '12px', letterSpacing: '1px'}}>{t('stylesRequired')}</h6>
                          <div className="d-flex flex-wrap gap-2">
                            {renderStyleBadges(selectedOrder.shirtStyle)}
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col md={4}>
                      <Card className="border-0 shadow-sm rounded-4 bg-white h-100">
                        <Card.Body className="p-4 d-flex flex-column justify-content-center align-items-center text-center">
                          <h6 className="fw-bold text-secondary text-uppercase mb-4" style={{fontSize: '12px', letterSpacing: '1px'}}>{t('stitchingProgress')}</h6>
                          <div className="display-3 fw-bolder text-dark mb-2">{progress.shirt} <span className="fs-3 text-muted">/ {selectedOrder.shirtQty}</span></div>
                          <p className="text-muted small fw-bold mb-4">{t('shirtsCompleted')}</p>
                          <div className="d-flex gap-3 w-100 px-3">
                            <Button variant="outline-danger" className="w-50 fw-bold fs-4 py-2" style={{borderRadius: '12px'}} onClick={() => updateCounter("shirt", -1)}>-</Button>
                            <Button variant="outline-success" className="w-50 fw-bold fs-4 py-2" style={{borderRadius: '12px'}} onClick={() => updateCounter("shirt", 1)}>+</Button>
                          </div>
                          {progress.shirt < selectedOrder.shirtQty && (
                            <div className="w-100 px-3 mt-3">
                              <Button variant="light" className="w-100 fw-bold border text-primary" onClick={() => maxOutCounter("shirt")}>
                                <FaCheckCircle className="me-2" /> {t('markAllDone')}
                              </Button>
                            </div>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                  </>
                )}

                {modalView === "pant" && selectedOrder.pantQty > 0 && (
                  <>
                    <Col md={8}>
                      <Card className="border-0 shadow-sm rounded-4 h-100">
                        <Card.Body className="p-4">
                          <h6 className="text-primary fw-bold text-uppercase mb-3" style={{fontSize: '12px', letterSpacing: '1px'}}>{t('coreMeasurements')}</h6>
                          
                          <Row className="g-2 mb-2">
                            <Col xs={4}><MeasurementStat label={t('length')} value={selectedOrder.pantLength} highlight={true} /></Col>
                            <Col xs={4}><MeasurementStat label={t('belowWaist')} value={selectedOrder.pantBelowWaist} /></Col>
                            <Col xs={4}><MeasurementStat label={t('waist')} value={selectedOrder.pantWaist} /></Col>
                          </Row>

                          <Row className="g-2 mb-4">
                            <Col xs={4}><MeasurementStat label={t('thigh')} value={selectedOrder.pantThigh} /></Col>
                            <Col xs={4}><MeasurementStat label={t('knee')} value={selectedOrder.pantKnee} /></Col>
                            <Col xs={4}><MeasurementStat label={t('bottom')} value={selectedOrder.pantBottom} /></Col>
                          </Row>

                          <h6 className="text-primary fw-bold text-uppercase mb-3 mt-4" style={{fontSize: '12px', letterSpacing: '1px'}}>{t('stylesRequired')}</h6>
                          <div className="d-flex flex-wrap gap-2">
                            {renderStyleBadges(selectedOrder.pantStyle)}
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col md={4}>
                      <Card className="border-0 shadow-sm rounded-4 bg-white h-100">
                        <Card.Body className="p-4 d-flex flex-column justify-content-center align-items-center text-center">
                          <h6 className="fw-bold text-secondary text-uppercase mb-4" style={{fontSize: '12px', letterSpacing: '1px'}}>{t('stitchingProgress')}</h6>
                          <div className="display-3 fw-bolder text-dark mb-2">{progress.pant} <span className="fs-3 text-muted">/ {selectedOrder.pantQty}</span></div>
                          <p className="text-muted small fw-bold mb-4">{t('pantsCompleted')}</p>
                          <div className="d-flex gap-3 w-100 px-3">
                            <Button variant="outline-danger" className="w-50 fw-bold fs-4 py-2" style={{borderRadius: '12px'}} onClick={() => updateCounter("pant", -1)}>-</Button>
                            <Button variant="outline-success" className="w-50 fw-bold fs-4 py-2" style={{borderRadius: '12px'}} onClick={() => updateCounter("pant", 1)}>+</Button>
                          </div>
                          {progress.pant < selectedOrder.pantQty && (
                            <div className="w-100 px-3 mt-3">
                              <Button variant="light" className="w-100 fw-bold border text-primary" onClick={() => maxOutCounter("pant")}>
                                <FaCheckCircle className="me-2" /> {t('markAllDone')}
                              </Button>
                            </div>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                  </>
                )}

                {selectedOrder.remark && (
                  <Col xs={12}>
                    <div className="p-3 border-start border-4 border-warning rounded bg-warning bg-opacity-10 text-dark d-flex align-items-center gap-3">
                      <FaExclamationTriangle className="text-warning fs-4" />
                      <div>
                        <div className="fw-bold" style={{fontSize: '12px', letterSpacing: '0.5px', textTransform: 'uppercase'}}>{t('noteFromMasterji')}</div>
                        <div className="fs-6">{selectedOrder.remark}</div>
                      </div>
                    </div>
                  </Col>
                )}

              </Row>
              )}
            </Modal.Body>
            <Modal.Footer className="bg-white border-top border-2 p-3">
              {!isEditingMeas ? (
                <>
                  <Button variant="light" className="fw-bold px-4 rounded-pill border" onClick={() => setShowModal(false)}>{t('close')}</Button>
                  <Button variant="outline-dark" className="fw-bold px-4 rounded-pill" onClick={startEditMeas}>
                    <FaEdit className="me-2" /> {t('editMeasurements')}
                  </Button>
                  <Button variant="dark" className="fw-bold px-4 rounded-pill" onClick={handleSaveChanges}>
                    <FaCheckCircle className="me-2" /> {t('saveUpdates')}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="secondary" className="fw-bold px-4 rounded-pill" onClick={() => setIsEditingMeas(false)} disabled={isSavingMeas}>
                    <FaTimes className="me-2" /> {t('cancel')}
                  </Button>
                  <Button variant="dark" className="fw-bold px-4 rounded-pill" onClick={handleSaveMeasurements} disabled={isSavingMeas}>
                    <FaSave className="me-2" /> {t('saveChangesBtn')}
                  </Button>
                </>
              )}
            </Modal.Footer>
          </>
        )}
      </Modal>

      <style>
        {`@keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }`}
      </style>
    </div>
  );
};

export default PendingWork;