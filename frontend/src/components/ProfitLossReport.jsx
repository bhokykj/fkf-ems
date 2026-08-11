import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Download, Filter, Award, ShieldAlert, FileSpreadsheet, Printer } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#10B981', '#0EA5E9', '#6366F1', '#F59E0B', '#EF4444'];

export default function ProfitLossReport({ pnlData, onFilterChange }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');

  const handleApplyFilter = () => {
    onFilterChange({ start_date: startDate, end_date: endDate, branch: selectedBranch });
  };

  const exportCSV = () => {
    if (!pnlData?.branch_rankings) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Branch Code,Branch Name,Interest Revenue (TSH),Fee Revenue (TSH),Penalty Revenue (TSH),Total Revenue (TSH),Bad Debt Loss (TSH),NPL Provision Loss (TSH),Net Profit (TSH),Recovery Rate (%)\n";
    
    pnlData.branch_rankings.forEach(row => {
      csvContent += `"${row.branch_code}","${row.branch_name}",${row.interest_revenue},${row.fee_revenue},${row.penalty_revenue},${row.total_revenue},${row.bad_debt_loss},${row.npl_provision_loss},${row.net_profit},${row.recovery_rate_pct}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `FKF-MicroCredit-TZ-PL-Report-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const summary = pnlData?.summary || {
    global_total_revenue: 0,
    global_total_losses: 0,
    global_net_profit: 0,
    global_recovery_rate_pct: 0
  };

  const branchRankings = pnlData?.branch_rankings || [];

  const pieData = [
    { name: 'Riba (Interest)', value: branchRankings.reduce((acc, b) => acc + b.interest_revenue, 0) },
    { name: 'Ada za Maombi (Fees)', value: branchRankings.reduce((acc, b) => acc + b.fee_revenue, 0) },
    { name: 'Faini za Ucheleweshaji', value: branchRankings.reduce((acc, b) => acc + b.penalty_revenue, 0) },
    { name: 'Mikopo Sugu (Bad Debt)', value: branchRankings.reduce((acc, b) => acc + b.bad_debt_loss, 0) },
    { name: 'Akiba ya NPL', value: branchRankings.reduce((acc, b) => acc + b.npl_provision_loss, 0) }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header & Export Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src="/fkf-logo.png" alt="FKF Micro-Credit" style={{ height: '48px', width: 'auto', borderRadius: '8px' }} />
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff' }}>Ripoti ya Faida na Hasara (P&L Engine Tanzania)</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Uchambuzi wa mapato ya matawi, riba zilizokusanywa (TSH), faini, na mikopo chechefu ya FKF Micro-Credit Tanzania
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={exportCSV} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
            <FileSpreadsheet size={16} /> Pakua Excel (TSH)
          </button>
          <button onClick={handlePrintPDF} className="btn-primary" style={{ fontSize: '0.85rem' }}>
            <Printer size={16} /> Chapisha / PDF Statement
          </button>
        </div>
      </div>

      {/* Date Range Filter Bar */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: '600', fontSize: '0.85rem' }}>
          <Filter size={18} /> Chagua Tarehe:
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Kuanzia Tarehe</label>
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)}
            style={{ padding: '0.45rem 0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Hadi Tarehe</label>
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)}
            style={{ padding: '0.45rem 0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
          />
        </div>

        <button onClick={handleApplyFilter} className="btn-primary" style={{ marginTop: 'auto', padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
          Onyesha Ripoti
        </button>
      </div>

      {/* Key Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
            <span>Jumla ya Mapato (TSH)</span>
            <TrendingUp size={20} color="#10B981" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#10B981' }}>
            TSH {summary.global_total_revenue.toLocaleString('sw-TZ', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
            Riba + Ada za Maombi + Faini
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
            <span>Jumla ya Hasara / NPL (TSH)</span>
            <TrendingDown size={20} color="#EF4444" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#EF4444' }}>
            TSH {summary.global_total_losses.toLocaleString('sw-TZ', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
            Mikopo Sugu na Faini Isiyolipika
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
            <span>Faida Safi ya Mfumo (Net Profit)</span>
            <DollarSign size={20} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: summary.global_net_profit >= 0 ? '#0EA5E9' : '#EF4444' }}>
            TSH {summary.global_net_profit.toLocaleString('sw-TZ', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
            Mapato Baada ya Trimming ya Hasara
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
            <span>Kiwango cha Urejeshaji Mikopo</span>
            <Award size={20} color="#F59E0B" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#F59E0B' }}>
            {summary.global_recovery_rate_pct}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
            Recovery Success Rate Tanzania
          </div>
        </div>

      </div>

      {/* Visual Analytics Grid (Recharts) */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        
        {/* Branch Profitability Ranking Bar Chart */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} color="var(--primary)" /> Ulinganisho wa Faida ya Matawi ya Tanzania (TSH)
          </h3>
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchRankings} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="branch_name" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} />
                <Tooltip 
                  contentStyle={{ background: '#0F172A', borderColor: 'var(--border-active)', borderRadius: '8px' }} 
                  formatter={(val) => `TSH ${val.toLocaleString()}`}
                />
                <Legend />
                <Bar dataKey="total_revenue" name="Mapato (TSH)" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="total_losses" name="Hasara (TSH)" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="net_profit" name="Faida Safi (TSH)" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue vs Loss Breakdown Pie Chart */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#fff' }}>Muundo wa Mapato na Hasara</h3>
          <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: '#0F172A', borderColor: 'var(--border-active)', borderRadius: '8px' }}
                  formatter={(val) => `TSH ${val.toLocaleString()}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Detailed Branch Segregated Financial Table */}
      <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '16px', padding: '1.5rem', overflowX: 'auto', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          📊 Mchanganuo wa Kila Tawi (Tanzania Branches P&L Financial Statement)
        </h3>
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ background: '#0F172A', color: '#FFFFFF', fontWeight: '900', padding: '0.9rem 1rem' }}>Tawi (Branch)</th>
              <th style={{ background: '#0F172A', color: '#FFFFFF', fontWeight: '900', padding: '0.9rem 1rem' }}>Mapato ya Riba</th>
              <th style={{ background: '#0F172A', color: '#FFFFFF', fontWeight: '900', padding: '0.9rem 1rem' }}>Ada za Maombi</th>
              <th style={{ background: '#0F172A', color: '#FFFFFF', fontWeight: '900', padding: '0.9rem 1rem' }}>Faini</th>
              <th style={{ background: '#0F172A', color: '#FFFFFF', fontWeight: '900', padding: '0.9rem 1rem' }}>Jumla ya Mapato</th>
              <th style={{ background: '#0F172A', color: '#FFFFFF', fontWeight: '900', padding: '0.9rem 1rem' }}>Hasara ya NPL</th>
              <th style={{ background: '#0F172A', color: '#FFFFFF', fontWeight: '900', padding: '0.9rem 1rem' }}>Faida Safi (TSH)</th>
              <th style={{ background: '#0F172A', color: '#FFFFFF', fontWeight: '900', padding: '0.9rem 1rem' }}>Kiwango cha Urejeshaji</th>
              <th style={{ background: '#0F172A', color: '#FFFFFF', fontWeight: '900', padding: '0.9rem 1rem' }}>Hali ya Tawi</th>
            </tr>
          </thead>
          <tbody>
            {branchRankings.map((b, idx) => (
              <tr key={b.branch_id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ fontWeight: '900', color: '#0F172A', fontSize: '0.9rem' }}>{b.branch_name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#0284C7', fontWeight: '800' }}>{b.branch_code}</div>
                </td>
                <td style={{ color: '#047857', fontWeight: '800' }}>TSH {b.interest_revenue.toLocaleString()}</td>
                <td style={{ color: '#0284C7', fontWeight: '800' }}>TSH {b.fee_revenue.toLocaleString()}</td>
                <td style={{ color: '#D97706', fontWeight: '800' }}>TSH {b.penalty_revenue.toLocaleString()}</td>
                <td style={{ fontWeight: '900', color: '#047857', fontSize: '0.92rem' }}>TSH {b.total_revenue.toLocaleString()}</td>
                <td style={{ color: '#DC2626', fontWeight: '800' }}>TSH {b.bad_debt_loss.toLocaleString()}</td>
                <td style={{ fontWeight: '900', fontSize: '0.95rem', color: b.net_profit >= 0 ? '#0284C7' : '#DC2626' }}>
                  TSH {b.net_profit.toLocaleString()}
                </td>
                <td>
                  <span className={`badge ${b.recovery_rate_pct >= 90 ? 'badge-success' : 'badge-warning'}`} style={{ fontWeight: '800', fontSize: '0.8rem' }}>
                    {b.recovery_rate_pct}%
                  </span>
                </td>
                <td>
                  {idx === 0 ? (
                    <span className="badge badge-success" style={{ background: '#DCFCE7', color: '#047857', border: '1px solid #86EFAC', fontWeight: '900' }}>#1 TAWI BORA</span>
                  ) : b.net_profit < 0 ? (
                    <span className="badge badge-danger" style={{ fontWeight: '900' }}>HASARA</span>
                  ) : (
                    <span className="badge badge-info" style={{ fontWeight: '900' }}>LINASAIDIWA / LINAFIDA</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
