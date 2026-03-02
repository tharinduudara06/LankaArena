import React, { useEffect, useState } from "react";
import "./styles/GM_payments.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faSpinner } from "@fortawesome/free-solid-svg-icons";
import Ground_manager_sideBar from "./Ground_manager_sideBar";
import axios from "axios";

export default function GM_payments() {
  const [paymentStats, setPaymentStats] = useState({
    totalRevenue: 0,
    completedPayments: 0,
    pendingPayments: 0,
    failedPayments: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState({
    months: [],
    revenues: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All Payments');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Fetch payment data
  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        setLoading(true);
        const [statsResponse, transactionsResponse, revenueResponse] = await Promise.all([
          axios.get('http://localhost:8080/api/ground-manager/payments/stats', { withCredentials: true }),
          axios.get('http://localhost:8080/api/ground-manager/payments/transactions', { withCredentials: true }),
          axios.get('http://localhost:8080/api/ground-manager/payments/monthly-revenue', { withCredentials: true })
        ]);

        setPaymentStats(statsResponse.data.data);
        setTransactions(transactionsResponse.data.data);
        setMonthlyRevenue(revenueResponse.data.data);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Error fetching payment data:', err);
        console.error('Error details:', err.response?.data || err.message);
        
        if (err.response?.status === 401) {
          setError('Please log in to view payment data');
          setIsAuthenticated(false);
        } else {
          setError(`Failed to load payment data: ${err.response?.data?.message || err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, []);

  // Filter transactions based on active filter
  const filteredTransactions = transactions.filter(transaction => {
    if (activeFilter === 'All Payments') return true;
    
    // Normalize status for comparison
    const normalizedStatus = transaction.status?.toLowerCase().replace(/[-_]/g, '');
    
    if (activeFilter === 'Completed') return normalizedStatus === 'paid';
    if (activeFilter === 'Pending') return normalizedStatus === 'notpaid';
    if (activeFilter === 'Failed') return normalizedStatus === 'failed';
    return true;
  });

  // Format currency in LKR
  const formatCurrency = (amount) => {
    return `Rs. ${amount.toLocaleString()}`;
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get status class
  const getStatusClass = (status) => {
    // Normalize status to handle case variations
    const normalizedStatus = status?.toLowerCase().replace(/[-_]/g, '');
    
    switch (normalizedStatus) {
      case 'paid':
        return 'gmpstatus-completed';
      case 'notpaid':
        return 'gmpstatus-pending';
      case 'failed':
        return 'gmpstatus-failed';
      default:
        return 'gmpstatus-pending';
    }
  };

  // Get status display text
  const getStatusText = (status) => {
    // Normalize status to handle case variations
    const normalizedStatus = status?.toLowerCase().replace(/[-_]/g, '');
    
    switch (normalizedStatus) {
      case 'paid':
        return 'Completed';
      case 'notpaid':
        return 'Pending';
      case 'failed':
        return 'Failed';
      default:
        return status || 'Unknown';
    }
  };

  // Render line chart
  const renderLineChart = () => {
    if (monthlyRevenue.revenues.length === 0) return null;

    const maxRevenue = Math.max(...monthlyRevenue.revenues);
    if (maxRevenue === 0) return null; // Avoid division by zero

    const chartWidth = 800;
    const chartHeight = 300;
    const padding = 40;
    const pointRadius = 4;
    const strokeWidth = 2;

    // Calculate points
    const points = monthlyRevenue.revenues.map((revenue, index) => {
      const x = padding + (index * (chartWidth - 2 * padding)) / Math.max(monthlyRevenue.revenues.length - 1, 1);
      const y = chartHeight - padding - (revenue / maxRevenue) * (chartHeight - 2 * padding);
      return { x, y, revenue };
    });

    // Create path for line
    const pathData = points.reduce((path, point, index) => {
      if (index === 0) {
        return `M ${point.x} ${point.y}`;
      }
      return `${path} L ${point.x} ${point.y}`;
    }, '');

    return (
      <div className="gmpchart-container">
        <svg width={chartWidth} height={chartHeight} className="gmp-line-chart">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
            <g key={index}>
              <line
                x1={padding}
                y1={chartHeight - padding - ratio * (chartHeight - 2 * padding)}
                x2={chartWidth - padding}
                y2={chartHeight - padding - ratio * (chartHeight - 2 * padding)}
                stroke="#e0e0e0"
                strokeWidth="1"
                opacity="0.3"
              />
              <text
                x={padding - 10}
                y={chartHeight - padding - ratio * (chartHeight - 2 * padding) + 5}
                textAnchor="end"
                fontSize="12"
                fill="#666"
              >
                {Math.round(maxRevenue * ratio).toLocaleString()}
              </text>
            </g>
          ))}

          {/* Line path */}
          <path
            d={pathData}
            fill="none"
            stroke="#4f46e5"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r={pointRadius}
                fill="#4f46e5"
                stroke="#fff"
                strokeWidth="2"
              />
              <text
                x={point.x}
                y={chartHeight - padding + 20}
                textAnchor="middle"
                fontSize="12"
                fill="#666"
              >
                {monthlyRevenue.months[index]}
              </text>
              <title>{`${monthlyRevenue.months[index]}: ${formatCurrency(point.revenue)}`}</title>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="gmppage">
        <Ground_manager_sideBar/>
        <div className="gmpmain-content">
          <div className="gmploading-container">
            <FontAwesomeIcon icon={faSpinner} className="gmpspinner" />
            <p>Loading payment data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gmppage">
        <Ground_manager_sideBar/>
        <div className="gmpmain-content">
          <div className="gmperror-container">
            <p className="gmperror-message">{error}</p>
            {!isAuthenticated ? (
              <div>
                <p style={{ marginBottom: '1rem', color: '#64748b' }}>
                  You need to log in as a ground manager to view payment data.
                </p>
                <button 
                  className="gmpretry-btn"
                  onClick={() => window.location.href = '/login'}
                  style={{ marginRight: '1rem' }}
                >
                  Go to Login
                </button>
                <button 
                  className="gmpretry-btn"
                  onClick={() => window.location.reload()}
                  style={{ backgroundColor: '#6b7280' }}
                >
                  Retry
                </button>
              </div>
            ) : (
              <button 
                className="gmpretry-btn"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gmppage">
        <Ground_manager_sideBar/>
     
      {/* Main Content */}
      <div className="gmpmain-content">
        <div className="gmpcontent-header">
          <div>
            <h1>Payment Management</h1>
            <p>View and manage all payment transactions</p>
          </div>
          <div className="gmpdate-filter">
            <select>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
              <option>Custom Range</option>
            </select>
            <button>Export Report</button>
            <button>Pay Commission</button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="gmpstats-cards">
          <div className="gmpstat-card">
            <div className="gmpvalue">{formatCurrency(paymentStats.totalRevenue)}</div>
            <div className="gmplabel">Total Revenue</div>
          </div>
          <div className="gmpstat-card">
            <div className="gmpvalue">{formatCurrency(paymentStats.completedPayments)}</div>
            <div className="gmplabel">Completed Payments</div>
          </div>
          <div className="gmpstat-card">
            <div className="gmpvalue">{formatCurrency(paymentStats.pendingPayments)}</div>
            <div className="gmplabel">Pending Payments</div>
          </div>
          <div className="gmpstat-card">
            <div className="gmpvalue">{formatCurrency(paymentStats.failedPayments)}</div>
            <div className="gmplabel">Failed Payments</div>
          </div>
        </div>

        {/* Filters */}
        <div className="gmpfilters">
          <button 
            className={`gmpfilter-btn ${activeFilter === 'All Payments' ? 'gmpactive' : ''}`}
            onClick={() => setActiveFilter('All Payments')}
          >
            All Payments
          </button>
          <button 
            className={`gmpfilter-btn ${activeFilter === 'Completed' ? 'gmpactive' : ''}`}
            onClick={() => setActiveFilter('Completed')}
          >
            Completed
          </button>
          <button 
            className={`gmpfilter-btn ${activeFilter === 'Pending' ? 'gmpactive' : ''}`}
            onClick={() => setActiveFilter('Pending')}
          >
            Pending
          </button>
          <button 
            className={`gmpfilter-btn ${activeFilter === 'Failed' ? 'gmpactive' : ''}`}
            onClick={() => setActiveFilter('Failed')}
          >
            Failed
          </button>
        </div>

        {/* Recent Transactions */}
        <div className="gmpcard">
          <div className="gmpcard-header">
            <h2>Recent Transactions</h2>
            <a href="#" className="gmpview-all">
              View All <FontAwesomeIcon icon={faChevronRight} />
            </a>
          </div>
          <table className="gmppayment-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Customer</th>
                <th>Venue</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="gmpno-data">
                    No transactions found
                </td>
              </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td>{transaction.transactionId}</td>
                    <td>{transaction.customer}</td>
                    <td>{transaction.venue}</td>
                    <td>{formatDate(transaction.date)}</td>
                    <td>{formatCurrency(transaction.amount)}</td>
                    <td>{transaction.paymentMethod}</td>
                    <td>
                      <span className={`gmpstatus ${getStatusClass(transaction.status)}`}>
                        {getStatusText(transaction.status)}
                  </span>
                </td>
                <td>
                  <button className="gmpaction-btn">View</button>
                </td>
              </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Revenue Overview */}
        <div className="gmpcard">
          <div className="gmpcard-header">
            <h2>Monthly Revenue Overview</h2>
            <a href="#" className="gmpview-all">
              Detailed Report <FontAwesomeIcon icon={faChevronRight} />
            </a>
          </div>
          {renderLineChart()}
        </div>
      </div>
    </div>
  );
}
