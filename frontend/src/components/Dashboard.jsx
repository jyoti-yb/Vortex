import React, { useState } from 'react';
import { policyAPI } from '../services/api';

const SEVERITY_COLOR = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444', critical: '#7c3aed' };
const PLAN_DETAILS = {
  basic:    { label: 'Basic',    covers: 'Rain only',                 maxPayout: '₹500/wk' },
  standard: { label: 'Standard', covers: 'Rain + AQI + Traffic',      maxPayout: '₹1,200/wk' },
  premium:  { label: 'Premium',  covers: 'All risks incl. Civic',     maxPayout: '₹2,500/wk' }
};

export default function Dashboard({ user, data, onLogout, onRefresh }) {
  const { policy, payouts, summary, risk, events } = data;
  const [subscribing, setSubscribing] = useState(false);
  const [premiumInfo, setPremiumInfo] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('standard');

  const handlePlanSelect = async (plan) => {
    setSelectedPlan(plan);
    try {
      const res = await policyAPI.calculatePremium(plan);
      setPremiumInfo(res.data);
    } catch (e) {
      setPremiumInfo(null);
    }
  };

  const handleSubscribe = async () => {
    if (subscribing) return;
    setSubscribing(true);
    try {
      await policyAPI.subscribe(selectedPlan);
      await onRefresh();
      setPremiumInfo(null);
    } catch (e) {
      alert(e.response?.data?.error || 'Subscription failed. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  const riskColor = risk
    ? risk.disruptionScore > 75 ? '#7c3aed'
    : risk.disruptionScore > 50 ? '#ef4444'
    : risk.disruptionScore > 25 ? '#f59e0b' : '#22c55e'
    : '#22c55e';

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: 'system-ui, sans-serif', color: '#f1f5f9' }}>
      {/* Header */}
      <div style={{ background: '#1e293b', borderBottom: '1px solid #334155', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28 }}>🛡️</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>GigShield</div>
            <div style={{ color: '#94a3b8', fontSize: 13 }}>{user.name} · {user.platform} · {user.city}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={onRefresh} style={{ padding: '6px 14px', background: '#334155', border: 'none', borderRadius: 8, color: '#f1f5f9', cursor: 'pointer', fontSize: 13 }}>↻ Refresh</button>
          <button onClick={onLogout} style={{ padding: '6px 14px', background: 'transparent', border: '1px solid #475569', borderRadius: 8, color: '#94a3b8', cursor: 'pointer', fontSize: 13 }}>Sign out</button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
        {/* Alert Banner for high-risk events */}
        {risk && risk.disruptionScore > 50 && (
          <div style={{ background: '#450a0a', border: '1px solid #991b1b', borderRadius: 12, padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 600, color: '#fca5a5' }}>High disruption detected in {user.city}</div>
              <div style={{ color: '#f87171', fontSize: 14 }}>Risk score: {risk.disruptionScore} · Rain: {risk.rainfall?.toFixed(1)}mm · AQI: {risk.aqi}</div>
            </div>
            {policy && <div style={{ marginLeft: 'auto', background: '#16a34a', borderRadius: 8, padding: '6px 14px', fontSize: 13, color: '#fff', fontWeight: 600 }}>Auto-payout active</div>}
          </div>
        )}

        {/* Top stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Disruption score', value: risk?.disruptionScore ?? '—', sub: risk ? `${user.city} now` : 'Loading...', color: riskColor },
            { label: 'This week payouts', value: `₹${summary.thisWeekAmount ?? 0}`, sub: 'Zero-touch auto-paid', color: '#22c55e' },
            { label: 'Total received', value: `₹${summary.totalAmount ?? 0}`, sub: `${summary.totalPayouts ?? 0} payouts`, color: '#60a5fa' },
            { label: 'Risk score', value: user.riskScore ?? 50, sub: 'Your profile risk', color: '#f59e0b' }
          ].map(({ label, value, sub, color }) => (
            <div key={label} style={{ background: '#1e293b', borderRadius: 12, padding: '20px', border: '1px solid #334155' }}>
              <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8 }}>{label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
              <div style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>{sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Left: Policy + subscription */}
          <div>
            {policy ? (
              <div style={{ background: '#1e293b', borderRadius: 12, padding: 24, border: '1px solid #334155', marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Active Policy</h2>
                  <span style={{ background: '#166534', color: '#86efac', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>ACTIVE</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    ['Plan', PLAN_DETAILS[policy.plan]?.label ?? policy.plan],
                    ['Weekly premium', `₹${policy.weeklyPremium}`],
                    ['Max weekly payout', `₹${policy.maxWeeklyPayout}`],
                    ['Expires', new Date(policy.endDate).toLocaleDateString('en-IN')]
                  ].map(([k, v]) => (
                    <div key={k} style={{ background: '#0f172a', borderRadius: 8, padding: 12 }}>
                      <div style={{ color: '#64748b', fontSize: 12 }}>{k}</div>
                      <div style={{ fontWeight: 600, fontSize: 15, marginTop: 2 }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 16 }}>
                  <div style={{ color: '#64748b', fontSize: 12, marginBottom: 8 }}>Covers</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {policy.coverageTypes.map(c => (
                      <span key={c} style={{ background: '#1d4ed8', color: '#bfdbfe', borderRadius: 20, padding: '4px 12px', fontSize: 12 }}>
                        {c === 'rain' ? '🌧️ Rain' : c === 'aqi' ? '😷 Air quality' : c === 'traffic' ? '🚦 Traffic' : '🚨 Civic'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ background: '#1e293b', borderRadius: 12, padding: 24, border: '1px solid #334155', marginBottom: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Subscribe to a Plan</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                  {['basic', 'standard', 'premium'].map(plan => (
                    <div key={plan} onClick={() => handlePlanSelect(plan)}
                      style={{ background: selectedPlan === plan ? '#1d4ed8' : '#0f172a', borderRadius: 10, padding: 14, cursor: 'pointer', border: `1px solid ${selectedPlan === plan ? '#3b82f6' : '#334155'}`, transition: 'all 0.2s' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>{PLAN_DETAILS[plan].label}</div>
                          <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>{PLAN_DETAILS[plan].covers}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, color: '#60a5fa' }}>{PLAN_DETAILS[plan].maxPayout}</div>
                          <div style={{ color: '#64748b', fontSize: 11 }}>max payout</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {premiumInfo && (
                  <div style={{ background: '#0f172a', borderRadius: 8, padding: 14, marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#94a3b8' }}>Weekly premium</span>
                      <span style={{ fontSize: 22, fontWeight: 700, color: '#60a5fa' }}>₹{premiumInfo.weeklyPremium}</span>
                    </div>
                    <div style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>Adjusted for your risk score ({premiumInfo.riskScore})</div>
                  </div>
                )}
                <button onClick={handleSubscribe} disabled={subscribing}
                  style={{ width: '100%', padding: 12, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
                  {subscribing ? 'Activating...' : 'Activate Shield'}
                </button>
              </div>
            )}

            {/* Live conditions */}
            {risk && (
              <div style={{ background: '#1e293b', borderRadius: 12, padding: 24, border: '1px solid #334155' }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Live conditions — {user.city}</h2>
                {[
                  { label: '🌧️ Rainfall', value: `${risk.rainfall?.toFixed(1) ?? 0} mm/hr`, threshold: '5mm', triggered: (risk.rainfall ?? 0) >= 5 },
                  { label: '😷 AQI', value: risk.aqi != null ? String(Math.round(risk.aqi)) : '—', threshold: '200', triggered: (risk.aqi ?? 0) >= 200 },
                  { label: '🚦 Traffic', value: `${(((risk.trafficIndex ?? 0)) * 100).toFixed(0)}%`, threshold: '70%', triggered: (risk.trafficIndex ?? 0) >= 0.7 }
                ].map(({ label, value, threshold, triggered }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #334155' }}>
                    <div>
                      <div style={{ fontSize: 14 }}>{label}</div>
                      <div style={{ color: '#64748b', fontSize: 12 }}>Trigger: {threshold}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: triggered ? '#ef4444' : '#22c55e', fontSize: 18 }}>{value}</div>
                      {triggered && <div style={{ fontSize: 11, color: '#ef4444' }}>⚡ TRIGGERED</div>}
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: 16, background: '#0f172a', borderRadius: 8, padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#94a3b8', fontSize: 14 }}>Disruption score</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 120, height: 8, background: '#334155', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${risk.disruptionScore}%`, height: '100%', background: riskColor, borderRadius: 4, transition: 'width 0.5s' }} />
                    </div>
                    <span style={{ fontWeight: 700, color: riskColor }}>{risk.disruptionScore}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Payouts + Events feed */}
          <div>
            <div style={{ background: '#1e293b', borderRadius: 12, padding: 24, border: '1px solid #334155', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Recent Payouts <span style={{ background: '#166534', color: '#86efac', borderRadius: 20, padding: '3px 10px', fontSize: 12, marginLeft: 8 }}>Zero-touch</span></h2>
              {payouts.length === 0
                ? <div style={{ color: '#64748b', textAlign: 'center', padding: '32px 0' }}>No payouts yet. Triggers activate automatically.</div>
                : payouts.slice(0, 8).map(p => (
                  <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #1e293b' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{p.reason?.split(':')[1]?.trim().split('(')[0]?.trim() || p.reason}</div>
                      <div style={{ color: '#64748b', fontSize: 12 }}>{new Date(p.createdAt).toLocaleString('en-IN')}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: p.status === 'flagged' ? '#f59e0b' : '#22c55e', fontSize: 16 }}>₹{p.amount}</div>
                      <div style={{ fontSize: 11, color: p.status === 'flagged' ? '#f59e0b' : '#64748b' }}>{p.status}</div>
                    </div>
                  </div>
                ))
              }
            </div>

            <div style={{ background: '#1e293b', borderRadius: 12, padding: 24, border: '1px solid #334155' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Recent Events</h2>
              {events.length === 0
                ? <div style={{ color: '#64748b', textAlign: 'center', padding: '20px 0' }}>No events recorded yet.</div>
                : events.slice(0, 6).map(ev => (
                  <div key={ev._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #334155' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, textTransform: 'capitalize' }}>
                        {ev.eventType === 'rain' ? '🌧️' : ev.eventType === 'aqi' ? '😷' : ev.eventType === 'traffic' ? '🚦' : '🚨'} {ev.eventType} — {ev.city}
                      </div>
                      <div style={{ color: '#64748b', fontSize: 12 }}>{new Date(ev.triggeredAt).toLocaleString('en-IN')}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 12, color: SEVERITY_COLOR[ev.severity], fontWeight: 600 }}>{ev.severity?.toUpperCase()}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{ev.payoutsTriggered} paid</div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
    }