import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAnalyticsSummary } from '../redux/analyticsSlice';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { logout } from '../redux/authSlice';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// --- Reusable Card Component ---
const Card = ({ title, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-md transition-shadow hover:shadow-lg">
    <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">{title}</h2>
    <div className="h-64">{children}</div>
  </div>
);

// --- KPI Card Component ---
const KpiCard = ({ title, value }) => (
  <div className="bg-white p-6 rounded-lg shadow-md text-center transition-shadow hover:shadow-lg">
    <h3 className="text-lg font-semibold text-gray-600">{title}</h3>
    <p className="text-3xl font-bold text-indigo-600">{value}</p>
  </div>
);

// --- Main Analytics Page ---
function Analytics() {
  const dispatch = useDispatch();
  const { summary, loading, error } = useSelector((state) => state.analytics);
  const navigate = useNavigate();

  //session expired handling
  useEffect(() => {
    if (error) {
      console.log('entering analytics error useEffect');
      toast.error("Session expired. Please log in again.");
      dispatch(logout());
      navigate('/login'); // Ensure the toast is shown only once
    }
  }, [dispatch, navigate, error]);;

  useEffect(() => {
    dispatch(getAnalyticsSummary());
  }, [dispatch]);

  if (loading) return <p className="text-center text-gray-500 mt-10">Loading analytics dashboard...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">Error: {error.msg || 'Could not fetch analytics'}</p>;
  if (!summary) return <p className="text-center text-gray-500 mt-10">No analytics data available.</p>;

  const COLORS = { positive: '#4caf50', neutral: '#ffc107', negative: '#f44336' };
  const sentimentData = Object.entries(summary.sentiment || {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-2 text-gray-800">Analytics Dashboard</h1>
      <p className="text-md text-gray-600 mb-6">A quick summary of your business performance.</p>

      {/* Business Summary Card */}
      {summary.businessSummary && (
        <div className="bg-indigo-600 text-white p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-xl font-semibold mb-2">Gemini Business Summary</h2>
          <p>{summary.businessSummary}</p>
        </div>
      )}

      {/* KPI Cards */}
      {summary.kpis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <KpiCard title="Total Revenue (Last 7 Days)" value={`${summary.kpis.totalRevenueThisWeek}`} />
          <KpiCard title="Average Bill Size" value={`${summary.kpis.averageBillSize}`} />
          <KpiCard title="Total Feedback Received" value={summary.kpis.feedbackCount} />
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {summary.revenueOverTime && summary.revenueOverTime.length > 0 && (
          <Card title="Revenue Over Time">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={summary.revenueOverTime} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}

        {summary.topItems && summary.topItems.length > 0 && (
          <Card title="Top Selling Items">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.topItems} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="item" width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {sentimentData.length > 0 && (
          <Card title="Feedback Sentiment">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sentimentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}

        
      </div>
    </div>
  );
}

export default Analytics;