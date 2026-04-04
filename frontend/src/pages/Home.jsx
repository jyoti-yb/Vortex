import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { policyAPI, payoutsAPI, eventsAPI } from '../services/api';
import Dashboard from '../components/Dashboard';

export default function Home() {
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [data, setData] = useState({ policy: null, payouts: [], summary: {}, risk: null, events: [] });
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      const [policyRes, payoutsRes, summaryRes, riskRes, eventsRes] = await Promise.allSettled([
        policyAPI.getPolicy(),
        payoutsAPI.getPayouts(),
        payoutsAPI.getSummary(),
        policyAPI.getRiskSnapshot(),
        eventsAPI.getEvents(user.city)
      ]);
      setData({
        policy:  policyRes.status === 'fulfilled' ? policyRes.value.data : null,
        payouts: payoutsRes.status === 'fulfilled' ? payoutsRes.value.data : [],
        summary: summaryRes.status === 'fulfilled' ? summaryRes.value.data : {},
        risk:    riskRes.status === 'fulfilled' ? riskRes.value.data : null,
        events:  eventsRes.status === 'fulfilled' ? eventsRes.value.data : []
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem('token')) { nav('/login'); return; }
    if (!user.city) { nav('/login'); return; }  // guard: corrupted localStorage
    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    nav('/login');
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontFamily: 'system-ui' }}>
      Loading your shield...
    </div>
  );

  return <Dashboard user={user} data={data} onLogout={handleLogout} onRefresh={fetchAll} />;
}