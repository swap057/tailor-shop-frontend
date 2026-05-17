import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaExclamationCircle, FaCut } from "react-icons/fa";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useLang } from "../context/LangContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useLang();
  const [data, setData] = useState({
    totalCustomers: 0,
    urgent: 0,
    pending: 0,
    graphData: [],
  });

  useEffect(() => {
    axios
      .get("https://my-tailor-app-backend.onrender.com/dashboard-stats")
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleStatClick = (link, filterType) => {
    if (filterType) {
      navigate(link, { state: { activeTab: filterType } });
    } else {
      navigate(link);
    }
  };

  const StatCard = ({ title, value, icon, color, link, filterType }) => (
    <Card
      className="shadow-sm border-0 h-100 text-white"
      style={{
        backgroundColor: color,
        cursor: "pointer",
        transition: "transform 0.2s",
      }}
      onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
      onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onClick={() => handleStatClick(link, filterType)}
    >
      <Card.Body className="d-flex justify-content-between align-items-center px-4">
        <div>
          <h6 className="opacity-75 mb-1" style={{ fontSize: "14px" }}>
            {title}
          </h6>
          <h2 className="fw-bold mb-0">{value}</h2>
        </div>
        <div style={{ fontSize: "2.5rem", opacity: 0.3 }}>{icon}</div>
      </Card.Body>
    </Card>
  );

  return (
    <Container fluid className="p-4" style={{ paddingBottom: "100px" }}>
      <h4 className="fw-bold text-secondary mb-4">{t('dashboard')}</h4>

      <Row className="g-4 mb-5">
        <Col md={4}>
          <StatCard
            title={t('totalCustomers')}
            value={data.totalCustomers}
            icon={<FaUsers />}
            color="#0d6efd"
            link="/customers"
          />
        </Col>
        <Col md={4}>
          <StatCard
            title={t('todaysUrgentOrders')}
            value={data.urgent}
            icon={<FaExclamationCircle />}
            color="#dc3545"
            link="/pending-work"
            filterType="URGENT"
          />
        </Col>
        <Col md={4}>
          <StatCard
            title={t('totalPendingWork')}
            value={data.pending}
            icon={<FaCut />}
            color="#f0a500"
            link="/pending-work"
            filterType="ALL"
          />
        </Col>
      </Row>

      <Card className="shadow-sm border-0 p-3">
        <h6 className="fw-bold text-secondary mb-4 ps-2">
          {t('completedOrders7Days')}
        </h6>
        <div style={{ width: "100%", height: 300 }}>
          {data.graphData && data.graphData.length > 0 ? (
            <ResponsiveContainer>
              <BarChart data={data.graphData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                  cursor={{ fill: "#f4f4f4" }}
                />
                <Bar
                  dataKey="count"
                  fill="#198754"
                  radius={[4, 4, 0, 0]}
                  barSize={50}
                  name={t('ordersDone')}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="d-flex justify-content-center align-items-center h-100 text-muted">
              {t('noGraphData')}
            </div>
          )}
        </div>
      </Card>
    </Container>
  );
};

export default Dashboard;