import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  Card,
  Badge,
  Form,
  Button,
  Row,
  Col,
  Nav,
  InputGroup
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { 
  FaSearch, FaUser, FaPhone, FaMapMarkerAlt, FaWhatsapp, 
  FaHistory, FaRulerCombined, FaPlus, FaArrowLeft, FaTshirt, FaRulerVertical
} from "react-icons/fa";
import { useLang } from "../context/LangContext";
import axios from "axios";
import { useToast } from "../context/ToastContext";

// Treats a measurement as "present" if it contains any non-zero digit.
// Works for plain numbers ("6.00") and two-value strings ("12 / 6"); hides "0" / "0.00".
const hasMeasureValue = (v) => v != null && String(v).trim() !== "" && /[1-9]/.test(String(v));

const FindCustomer = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLang();

  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [activeTab, setActiveTab] = useState("measurements");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get("https://my-tailor-app-backend.onrender.com/customers");
      if (res.data) {
        setCustomers(res.data);
      }
    } catch (err) {
      showToast(t('connFailedMsg'), "danger");
      setCustomers([]);
    }
  };

  const filteredAndSortedCustomers = useMemo(() => {
    let results = customers.filter(c => 
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.mobileNo.includes(searchTerm) ||
      (c.address && c.address.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    return results.sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [customers, searchTerm]);

  const handleCreateOrder = (customer) => {
    const targetCustomer = customer || selectedCustomer;
    navigate("/add-customer", { state: { prefillCustomer: targetCustomer } });
  };

  const openWhatsApp = (mobile) => {
    window.open(`https://wa.me/91${mobile}`, "_blank");
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

  if (!selectedCustomer) {
    return (
      <div style={{ paddingBottom: "100px", padding: "20px" }}>
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <h4 className="fw-bolder text-dark mb-1">{t('customerDirectory')}</h4>
            <p className="text-muted small mb-0">{t('searchManageProfiles')}</p>
          </div>
          <Button variant="primary" style={{ backgroundColor: "#f0a500", border: "none" }} className="fw-bold px-4 rounded-pill shadow-sm" onClick={() => navigate("/add-customer")}>
            <FaPlus className="me-2" /> {t('newCustomer')}
          </Button>
        </div>

        <Card className="border-0 shadow-sm rounded-4 mb-4">
          <Card.Body className="p-3">
            <InputGroup size="lg">
              <InputGroup.Text className="bg-white border-end-0 text-muted px-4"><FaSearch /></InputGroup.Text>
              <Form.Control 
                placeholder={t('searchByName')}
                className="border-start-0 shadow-none fw-bold text-secondary"
                style={{ fontSize: "16px" }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Card.Body>
        </Card>

        <Card className="shadow-sm border-0">
          <Table hover responsive className="mb-0 align-middle">
            <thead className="bg-light">
              <tr>
                <th className="py-3 ps-4">{t('customerName')}</th>
                <th>{t('contactVillage')}</th>
                <th>{t('lastOrder')}</th>
                <th className="text-end pe-4">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedCustomers.map(cust => (
                <tr key={cust.customerId} style={{ cursor: "pointer" }} onClick={() => setSelectedCustomer(cust)}>
                  <td className="ps-4">
                    <div className="d-flex align-items-center gap-3">
                      <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex justify-content-center align-items-center" style={{ width: "40px", height: "40px" }}>
                        <FaUser />
                      </div>
                      <div className="fw-bold text-dark fs-6">{cust.fullName}</div>
                    </div>
                  </td>
                  <td>
                    <div className="fw-bold text-secondary"><FaPhone className="me-1 small"/> {cust.mobileNo}</div>
                    <small className="text-muted"><FaMapMarkerAlt className="me-1"/> {cust.address || t('noVillage')}</small>
                  </td>
                  <td>
                    {cust.lastOrderDate ? (
                        <span className="fw-bold text-secondary">{formatDate(cust.lastOrderDate)}</span>
                    ) : (
                        <Badge bg="light" text="dark" className="border">{t('newBadge')}</Badge>
                    )}
                  </td>
                  <td className="text-end pe-4">
                    <div className="d-flex justify-content-end gap-2">
                      <Button variant="light" size="sm" className="rounded-circle text-primary border" style={{ width: "35px", height: "35px", padding: 0 }} onClick={(e) => { e.stopPropagation(); openWhatsApp(cust.mobileNo); }} title="WhatsApp">
                        <FaWhatsapp size={16} />
                      </Button>
                      <Button variant="dark" size="sm" className="rounded-pill px-3 fw-bold shadow-sm" onClick={(e) => { e.stopPropagation(); handleCreateOrder(cust); }}>
                        <FaPlus className="me-1 text-warning" /> {t('orderBtn')}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {filteredAndSortedCustomers.length === 0 && (
            <div className="text-center py-5 text-muted">
                <FaSearch size={30} className="mb-3 opacity-25" />
                <h6>{t('noCustomersFound')} "{searchTerm}"</h6>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: "100px", padding: "20px" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Button variant="light" className="fw-bold border shadow-sm rounded-pill px-4" onClick={() => setSelectedCustomer(null)}>
          <FaArrowLeft className="me-2" /> {t('backToDirectory')}
        </Button>
        <Button variant="primary" style={{ backgroundColor: "#1a1a2e", border: "none" }} className="fw-bold px-4 rounded-pill shadow-lg" onClick={() => handleCreateOrder()}>
          <FaPlus className="me-2 text-warning" /> {t('createNewOrder')}
        </Button>
      </div>

      <Row className="g-4">
        <Col lg={4}>
          <Card className="border-0 shadow-sm rounded-4 mb-4 text-center overflow-hidden">
            <div style={{ height: "100px", backgroundColor: "#f0a500", opacity: 0.8 }}></div>
            <Card.Body className="px-4 pb-4" style={{ marginTop: "-50px" }}>
              <div className="bg-white rounded-circle d-inline-flex justify-content-center align-items-center shadow-sm mb-3" style={{ width: "100px", height: "100px", border: "4px solid white" }}>
                <FaUser size={40} className="text-secondary" />
              </div>
              <h4 className="fw-bolder text-dark mb-1">{selectedCustomer.fullName}</h4>
              <p className="text-muted mb-3">{t('customerId')}: #{selectedCustomer.customerId}</p>
              
              <div className="d-flex justify-content-center gap-2 mb-4">
                <Button variant="success" className="rounded-pill fw-bold px-4 shadow-sm" onClick={() => openWhatsApp(selectedCustomer.mobileNo)}>
                  <FaWhatsapp className="me-2 fs-5" /> {t('message')}
                </Button>
              </div>

              <div className="text-start bg-light p-3 rounded-4 border">
                <div className="mb-2">
                  <small className="text-muted fw-bold text-uppercase" style={{fontSize: '10px'}}>{t('mobile')}</small>
                  <div className="fw-bold text-dark"><FaPhone className="me-2 text-primary" /> {selectedCustomer.mobileNo}</div>
                </div>
                <div>
                  <small className="text-muted fw-bold text-uppercase" style={{fontSize: '10px'}}>{t('villageAddress')}</small>
                  <div className="fw-bold text-dark"><FaMapMarkerAlt className="me-2 text-danger" /> {selectedCustomer.address || t('notProvided')}</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Header className="bg-white border-bottom-0 pt-3 px-4 pb-0">
              <Nav variant="pills" className="d-flex gap-2">
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === "measurements"} 
                    onClick={() => setActiveTab("measurements")}
                    className={activeTab === "measurements" ? "bg-dark text-white shadow-sm" : "bg-light text-secondary"}
                    style={{ borderRadius: '8px', cursor: 'pointer', padding: '10px 24px', fontWeight: 'bold' }}
                  >
                    <FaRulerCombined className="me-2" /> {t('savedMeasurements')}
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === "history"} 
                    onClick={() => setActiveTab("history")}
                    className={activeTab === "history" ? "bg-dark text-white shadow-sm" : "bg-light text-secondary"}
                    style={{ borderRadius: '8px', cursor: 'pointer', padding: '10px 24px', fontWeight: 'bold' }}
                  >
                    <FaHistory className="me-2" /> {t('orderHistory')}
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>
            
            <Card.Body className="p-4">
              {activeTab === "measurements" && (
                <div className="animation-fade-in">
                  {!selectedCustomer.measurements ? (
                    <div className="text-center py-5 text-muted">
                      <FaRulerCombined size={40} className="mb-3 opacity-50" />
                      <h5>{t('noMeasurements')}</h5>
                    </div>
                  ) : (
                    <>
                      <h6 className="text-primary fw-bold text-uppercase mb-3 d-flex align-items-center" style={{fontSize: '13px', letterSpacing: '1px'}}>
                        <FaTshirt className="me-2 fs-5" /> {t('latestShirtProfile')}
                      </h6>
                      
                      <Row className="g-2 mb-2">
                        <Col xs={4}>{selectedCustomer.measurements.shirtLength && !selectedCustomer.measurements.shirtLength.includes(":") ? <MeasurementStat label={t('length')} value={selectedCustomer.measurements.shirtLength} /> : <MeasurementStat label={t('lengths')} value={selectedCustomer.measurements.shirtLength} />}</Col>
                        <Col xs={4}><MeasurementStat label={t('front')} value={selectedCustomer.measurements.shirtFront} /></Col>
                        <Col xs={4}><MeasurementStat label={t('shoulder')} value={selectedCustomer.measurements.shirtShoulder} /></Col>
                      </Row>
                      
                      <Row className={`g-2 ${hasMeasureValue(selectedCustomer.measurements.shirtHalfSleeve) ? 'mb-2' : 'mb-5'}`}>
                        <Col xs={4}><MeasurementStat label={t('sleeve')} value={selectedCustomer.measurements.shirtSleeve} /></Col>
                        <Col xs={4}><MeasurementStat label={t('collar')} value={selectedCustomer.measurements.shirtCollar} /></Col>
                        {Number(selectedCustomer.measurements.shirtChest) > 0 ? (
                            <Col xs={4}><MeasurementStat label={t('chest')} value={selectedCustomer.measurements.shirtChest} /></Col>
                        ) : null}
                      </Row>

                      {hasMeasureValue(selectedCustomer.measurements.shirtHalfSleeve) ? (
                        <Row className="g-2 mb-5">
                            <Col xs={4}><MeasurementStat label={t('halfSleeve')} value={selectedCustomer.measurements.shirtHalfSleeve} highlight={true}/></Col>
                        </Row>
                      ) : null}

                      <h6 className="text-warning fw-bold text-uppercase mb-3 d-flex align-items-center mt-3" style={{fontSize: '13px', letterSpacing: '1px'}}>
                        <FaRulerVertical className="me-2 fs-5 text-warning" /> {t('latestPantProfile')}
                      </h6>
                      
                      <Row className="g-2 mb-2">
                        <Col xs={4}><MeasurementStat label={t('length')} value={selectedCustomer.measurements.pantLength} highlight={true} /></Col>
                        <Col xs={4}><MeasurementStat label={t('belowWaist')} value={selectedCustomer.measurements.pantBelowWaist} /></Col>
                        <Col xs={4}><MeasurementStat label={t('waist')} value={selectedCustomer.measurements.pantWaist} /></Col>
                      </Row>
                      
                      <Row className="g-2 mb-3">
                        <Col xs={4}><MeasurementStat label={t('thigh')} value={selectedCustomer.measurements.pantThigh} /></Col>
                        <Col xs={4}><MeasurementStat label={t('knee')} value={selectedCustomer.measurements.pantKnee} /></Col>
                        <Col xs={4}><MeasurementStat label={t('bottom')} value={selectedCustomer.measurements.pantBottom} /></Col>
                      </Row>
                    </>
                  )}
                </div>
              )}

              {activeTab === "history" && (
                <div className="animation-fade-in">
                  {!selectedCustomer.history || selectedCustomer.history.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <FaHistory size={40} className="mb-3 opacity-50" />
                      <h5>{t('noPastOrders')}</h5>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {selectedCustomer.history.map((order, idx) => (
                        <div key={idx} className="p-3 border rounded-4 bg-white shadow-sm d-flex justify-content-between align-items-center border-start border-4 border-success">
                          <div>
                            <div className="fw-bold text-dark fs-5 mb-1">{order.items}</div>
                            <div className="text-muted small fw-bold">{t('orderBtn')} #{order.orderId} • {formatDate(order.date)}</div>
                          </div>
                          <Badge bg={order.status === "COMPLETED" ? "success" : "warning"} text={order.status === "COMPLETED" ? "white" : "dark"} className="px-3 py-2 rounded-pill shadow-sm">{order.status}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <style>{`.animation-fade-in { animation: fadeIn 0.3s ease-in-out; } @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
};

export default FindCustomer;