'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Fingerprint, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

// ─── Inline SVG Art Components ──────────────────────────────────────────────

const MandalaCorner = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="0" cy="0" r="80" stroke="#C9A84C" strokeWidth="0.6" strokeDasharray="4 3" fill="none" opacity="0.5"/>
    <circle cx="0" cy="0" r="60" stroke="#C9A84C" strokeWidth="0.8" fill="none" opacity="0.6"/>
    <circle cx="0" cy="0" r="40" stroke="#E2C97E" strokeWidth="1" fill="none" opacity="0.7"/>
    <circle cx="0" cy="0" r="20" stroke="#E2C97E" strokeWidth="1.5" fill="none" opacity="0.8"/>
    {[0,15,30,45,60,75].map((angle, i) => (
      <line key={i} x1="0" y1="0" x2={Math.cos((angle*Math.PI)/180)*80} y2={Math.sin((angle*Math.PI)/180)*80}
        stroke="#C9A84C" strokeWidth="0.5" opacity="0.4"/>
    ))}
    {[0,30,60].map((angle, i) => (
      <ellipse key={i} cx={Math.cos(((angle+15)*Math.PI)/180)*50} cy={Math.sin(((angle+15)*Math.PI)/180)*50}
        rx="8" ry="4" fill="#C9A84C" opacity="0.3"
        transform={`rotate(${angle+15} ${Math.cos(((angle+15)*Math.PI)/180)*50} ${Math.sin(((angle+15)*Math.PI)/180)*50})`}/>
    ))}
  </svg>
);

const LotusIcon = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Outer petals */}
    {[0,45,90,135,180,225,270,315].map((angle, i) => (
      <ellipse key={i} cx="40" cy="40" rx="7" ry="18" fill="#C9A84C" opacity="0.6"
        transform={`rotate(${angle} 40 40) translate(0 -12)`}/>
    ))}
    {/* Inner petals */}
    {[22.5,67.5,112.5,157.5,202.5,247.5,292.5,337.5].map((angle, i) => (
      <ellipse key={i} cx="40" cy="40" rx="5" ry="13" fill="#E2C97E" opacity="0.8"
        transform={`rotate(${angle} 40 40) translate(0 -10)`}/>
    ))}
    <circle cx="40" cy="40" r="10" fill="#C9A84C" opacity="0.9"/>
    <circle cx="40" cy="40" r="6" fill="#E2C97E"/>
    <circle cx="40" cy="40" r="3" fill="#7B3F00"/>
  </svg>
);

const PeacockFeather = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 60 180" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M30 180 Q32 120 35 80 Q45 40 42 10" stroke="#1B5E20" strokeWidth="2" fill="none"/>
    <path d="M30 180 Q28 120 25 80 Q15 40 18 10" stroke="#1B5E20" strokeWidth="1.5" fill="none"/>
    {[30,50,70,90,110].map((y, i) => (
      <ellipse key={i} cx={30 + (i%2===0?3:-3)} cy={y} rx={18-i*2} ry={12-i*1.5}
        fill="none" stroke="#388E3C" strokeWidth="1" opacity={0.8-i*0.1}/>
    ))}
    <ellipse cx="35" cy="20" rx="12" ry="18" fill="#0D47A1" opacity="0.6"/>
    <ellipse cx="35" cy="20" rx="8" ry="12" fill="#1565C0" opacity="0.7"/>
    <ellipse cx="35" cy="20" rx="5" ry="8" fill="#42A5F5" opacity="0.8"/>
    <circle cx="35" cy="18" r="4" fill="#0D47A1" opacity="0.9"/>
    <circle cx="35" cy="18" r="2" fill="#E3F2FD"/>
  </svg>
);

const WarliDancer = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 40 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="8" r="5" fill="#F5E6C8"/>
    <line x1="20" y1="13" x2="20" y2="32" stroke="#F5E6C8" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="20" y1="32" x2="8" y2="48" stroke="#F5E6C8" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="20" y1="32" x2="32" y2="48" stroke="#F5E6C8" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="20" y1="19" x2="5" y2="26" stroke="#F5E6C8" strokeWidth="2" strokeLinecap="round"/>
    <line x1="20" y1="19" x2="35" y2="14" stroke="#F5E6C8" strokeWidth="2" strokeLinecap="round"/>
    <polygon points="20,32 10,24 30,24" fill="#F5E6C8" opacity="0.7"/>
  </svg>
);

const BorderPattern = () => (
  <svg viewBox="0 0 400 20" className="w-full" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    {Array.from({length: 20}).map((_, i) => (
      <g key={i} transform={`translate(${i*20} 0)`}>
        <polygon points="10,2 18,10 10,18 2,10" fill="none" stroke="#C9A84C" strokeWidth="0.8" opacity="0.8"/>
        <circle cx="10" cy="10" r="2" fill="#C9A84C" opacity="0.6"/>
      </g>
    ))}
  </svg>
);

const GondPattern = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    {/* Gond art: dots and dashes forming tree/nature motif */}
    <g opacity="0.12" fill="#7B3F00">
      {/* Tree trunk */}
      <rect x="95" y="120" width="10" height="60" rx="5"/>
      {/* Branches */}
      {[[-30,-20,20,-40],[30,-20,-20,-40],[-15,-40,10,-55],[15,-40,-10,-55]].map(([x1,y1,x2,y2],i)=>(
        <line key={i} x1={100+x1} y1={120+y1} x2={100+x2} y2={120+y2} stroke="#7B3F00" strokeWidth="4" strokeLinecap="round"/>
      ))}
      {/* Dots/leaves pattern */}
      {[[-35,-25],[35,-25],[-20,-45],[20,-45],[-50,-10],[50,-10],[0,-60],[-10,-75],[10,-75]].map(([x,y],i)=>(
        <circle key={i} cx={100+x} cy={120+y} r={5-i*0.3} fill="#388E3C"/>
      ))}
      {/* Ground dots */}
      {Array.from({length:12}).map((_,i)=>(
        <circle key={i} cx={40+i*12} cy={185} r="3" fill="#8B4513" opacity="0.6"/>
      ))}
    </g>
  </svg>
);

// ─── Main Component ──────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams?.get('role') || 'citizen';

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [activeTab, setActiveTab] = useState(role);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useAuth();

  const roles = {
    citizen: { hindi: 'नागरिक', english: 'Citizen', color: '#E65100', light: '#FFF3E0' },
    officer: { hindi: 'अधिकारी', english: 'Officer', color: '#1A237E', light: '#E8EAF6' },
    admin:   { hindi: 'प्रशासक', english: 'Admin',   color: '#4A148C', light: '#F3E5F5' },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      if (res.data.success) {
        // Double-check role matches the tab
        if (res.data.data.role !== activeTab) {
           setErrorMsg(`You are registered as a ${res.data.data.role}, not ${activeTab}.`);
           setLoading(false);
           return;
        }

        login(res.data.token, res.data.data);
        router.push(`/${activeTab}/dashboard`);
      }
    } catch (error: any) {
      console.error('Login error', error);
      if (error.response && error.response.data && error.response.data.message) {
         setErrorMsg(error.response.data.message);
      } else {
         setErrorMsg('An error occurred during login. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Yatra+One&family=Tiro+Devanagari+Hindi:ital@0;1&family=Cinzel+Decorative:wght@400;700&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');

        :root {
          --gold: #C9A84C;
          --gold-light: #E2C97E;
          --gold-deep: #8B6914;
          --saffron: #FF6F00;
          --vermilion: #C62828;
          --ivory: #FDF8EE;
          --parchment: #F5E6C8;
          --bark: #3E2723;
          --ink: #1A0A00;
          --jade: #1B5E20;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Lora', serif;
          background: var(--ivory);
          min-height: 100vh;
          overflow-x: hidden;
        }

        .page-wrapper {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          position: relative;
        }

        /* ── Left Panel ── */
        .left-panel {
          background: linear-gradient(160deg, #1a0a00 0%, #3E2723 40%, #4E342E 70%, #5D4037 100%);
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 2.5rem;
        }

        .left-panel::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at 20% 30%, rgba(201,168,76,0.15) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 70%, rgba(198,40,40,0.1) 0%, transparent 60%);
        }

        /* Tanjore gold texture overlay */
        .gold-texture {
          position: absolute;
          inset: 0;
          background-image:
            url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23C9A84C' fill-opacity='0.05'%3E%3Cpath d='M5 0h1L0 6V5z'/%3E%3Cpath d='M6 5v1H5z'/%3E%3C/g%3E%3C/svg%3E");
        }

        .mandala-bg {
          position: absolute;
          width: 500px;
          height: 500px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          opacity: 0.08;
          animation: slowRotate 60s linear infinite;
        }

        @keyframes slowRotate {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        .left-content {
          position: relative;
          z-index: 2;
          text-align: center;
        }

        .portal-title {
          font-family: 'Cinzel Decorative', cursive;
          font-size: 1.8rem;
          font-weight: 700;
          background: linear-gradient(135deg, #E2C97E 0%, #C9A84C 40%, #FFD700 70%, #C9A84C 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.3;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }

        .portal-hindi {
          font-family: 'Tiro Devanagari Hindi', serif;
          font-size: 2.2rem;
          color: #E2C97E;
          margin-bottom: 0.25rem;
          text-shadow: 0 0 20px rgba(201,168,76,0.4);
        }

        .portal-sub {
          font-family: 'Lora', serif;
          font-style: italic;
          font-size: 0.85rem;
          color: rgba(226,201,126,0.7);
          letter-spacing: 0.15em;
          margin-bottom: 2.5rem;
        }

        .lotus-container {
          width: 120px;
          height: 120px;
          margin: 0 auto 2rem;
          position: relative;
        }

        .lotus-glow {
          position: absolute;
          inset: -20px;
          background: radial-gradient(circle, rgba(201,168,76,0.3) 0%, transparent 70%);
          animation: pulse 3s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }

        .divider-gold {
          width: 200px;
          height: 1px;
          background: linear-gradient(90deg, transparent, #C9A84C, transparent);
          margin: 1.5rem auto;
        }

        .warli-row {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          margin: 1.5rem 0;
          opacity: 0.6;
        }

        .peacock-row {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-top: 1.5rem;
        }

        .feature-pills {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 2rem;
        }

        .feature-pill {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.6rem 1.2rem;
          background: rgba(201,168,76,0.1);
          border: 1px solid rgba(201,168,76,0.25);
          border-radius: 50px;
          color: rgba(226,201,126,0.9);
          font-size: 0.8rem;
          font-family: 'Lora', serif;
        }

        .feature-pill-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #C9A84C;
          flex-shrink: 0;
        }

        /* ── Pattachitra corner borders ── */
        .corner-tl, .corner-tr, .corner-bl, .corner-br {
          position: absolute;
          width: 100px;
          height: 100px;
          overflow: hidden;
          z-index: 3;
        }
        .corner-tl { top: 0; left: 0; }
        .corner-tr { top: 0; right: 0; transform: scaleX(-1); }
        .corner-bl { bottom: 0; left: 0; transform: scaleY(-1); }
        .corner-br { bottom: 0; right: 0; transform: scale(-1); }

        /* ── Right Panel ── */
        .right-panel {
          background: var(--ivory);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          overflow: hidden;
        }

        .right-panel::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23C9A84C' fill-opacity='0.04'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3Ccircle cx='0' cy='0' r='1'/%3E%3Ccircle cx='40' cy='0' r='1'/%3E%3Ccircle cx='0' cy='40' r='1'/%3E%3Ccircle cx='40' cy='40' r='1'/%3E%3C/g%3E%3C/svg%3E");
        }

        .gond-bg {
          position: absolute;
          inset: 0;
          opacity: 1;
          pointer-events: none;
        }

        .login-card {
          position: relative;
          width: 100%;
          max-width: 460px;
          z-index: 2;
        }

        /* Tanjore-style ornate frame */
        .tanjore-frame {
          position: relative;
          background: #FFFEF8;
          border: 2px solid #C9A84C;
          border-radius: 4px;
          box-shadow:
            0 0 0 6px #FDF8EE,
            0 0 0 8px rgba(201,168,76,0.3),
            0 0 0 10px #FDF8EE,
            0 0 0 12px rgba(201,168,76,0.15),
            0 20px 60px rgba(62,39,35,0.2);
        }

        .frame-top-border, .frame-bottom-border {
          height: 16px;
          background: linear-gradient(90deg, #8B6914, #C9A84C, #E2C97E, #C9A84C, #8B6914);
          position: relative;
          overflow: hidden;
        }

        .frame-top-border::after, .frame-bottom-border::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='8' cy='8' r='2' fill='rgba(255,255,255,0.4)'/%3E%3C/svg%3E");
        }

        .frame-inner {
          padding: 2rem 2.5rem 2.5rem;
        }

        .frame-corner-ornament {
          position: absolute;
          width: 28px;
          height: 28px;
          background: #C9A84C;
          z-index: 5;
        }
        .frame-corner-ornament.tl { top: -2px; left: -2px; clip-path: polygon(0 0, 100% 0, 0 100%); }
        .frame-corner-ornament.tr { top: -2px; right: -2px; clip-path: polygon(0 0, 100% 0, 100% 100%); }
        .frame-corner-ornament.bl { bottom: -2px; left: -2px; clip-path: polygon(0 0, 0 100%, 100% 100%); }
        .frame-corner-ornament.br { bottom: -2px; right: -2px; clip-path: polygon(100% 0, 100% 100%, 0 100%); }

        .form-header {
          text-align: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(201,168,76,0.3);
          position: relative;
        }

        .form-header::after {
          content: '◆';
          position: absolute;
          bottom: -9px;
          left: 50%;
          transform: translateX(-50%);
          color: #C9A84C;
          font-size: 0.8rem;
          background: #FFFEF8;
          padding: 0 0.5rem;
        }

        .form-title-hindi {
          font-family: 'Tiro Devanagari Hindi', serif;
          font-size: 1.7rem;
          color: var(--bark);
          line-height: 1.2;
        }

        .form-title-eng {
          font-family: 'Cinzel Decorative', cursive;
          font-size: 0.8rem;
          color: var(--gold);
          letter-spacing: 0.2em;
          margin-top: 0.25rem;
        }

        .error-message {
          background-color: #fee2e2;
          color: #b91c1c;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 0.85rem;
          margin-bottom: 1rem;
          text-align: center;
          border-left: 3px solid #b91c1c;
        }

        /* Role Tabs */
        .role-tabs {
          display: flex;
          background: rgba(201,168,76,0.08);
          border: 1px solid rgba(201,168,76,0.2);
          border-radius: 4px;
          padding: 4px;
          margin-bottom: 1.5rem;
          gap: 4px;
        }

        .role-tab {
          flex: 1;
          padding: 0.6rem 0.5rem;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 3px;
          transition: all 0.3s ease;
          text-align: center;
        }

        .role-tab.active {
          background: linear-gradient(135deg, #8B6914, #C9A84C);
          box-shadow: 0 2px 8px rgba(139,105,20,0.4);
        }

        .role-tab-hindi {
          font-family: 'Tiro Devanagari Hindi', serif;
          font-size: 0.85rem;
          color: #7B3F00;
          display: block;
        }

        .role-tab.active .role-tab-hindi { color: #FFF8E1; }

        .role-tab-eng {
          font-family: 'Lora', serif;
          font-size: 0.65rem;
          font-style: italic;
          color: rgba(123,63,0,0.6);
          display: block;
        }

        .role-tab.active .role-tab-eng { color: rgba(255,248,225,0.8); }

        /* Form Fields */
        .field-group {
          margin-bottom: 1.25rem;
        }

        .field-label {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .label-hindi {
          font-family: 'Tiro Devanagari Hindi', serif;
          font-size: 0.9rem;
          color: #4E342E;
        }

        .label-eng {
          font-family: 'Lora', serif;
          font-size: 0.7rem;
          font-style: italic;
          color: #8D6E63;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #C9A84C;
          font-size: 1rem;
        }

        .form-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border: 1.5px solid rgba(201,168,76,0.4);
          border-radius: 3px;
          background: rgba(253,248,238,0.8);
          font-family: 'Lora', serif;
          font-size: 0.9rem;
          color: var(--bark);
          outline: none;
          transition: all 0.3s ease;
        }

        .form-input::placeholder { color: #BCAAA4; font-style: italic; }

        .form-input:focus {
          border-color: #C9A84C;
          background: #FFFEF8;
          box-shadow: 0 0 0 3px rgba(201,168,76,0.1), 0 0 0 1px rgba(201,168,76,0.3);
        }

        .eye-btn {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #A1887F;
          padding: 4px;
          transition: color 0.2s;
        }

        .eye-btn:hover { color: #C9A84C; }

        .form-footer-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .remember-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .custom-checkbox {
          width: 16px;
          height: 16px;
          border: 1.5px solid #C9A84C;
          border-radius: 2px;
          background: rgba(201,168,76,0.1);
          appearance: none;
          cursor: pointer;
          position: relative;
        }

        .custom-checkbox:checked::after {
          content: '✓';
          position: absolute;
          top: -2px;
          left: 2px;
          font-size: 11px;
          color: #8B6914;
          font-weight: bold;
        }

        .remember-text {
          font-family: 'Lora', serif;
          font-size: 0.78rem;
          color: #6D4C41;
        }

        .forgot-link {
          font-family: 'Lora', serif;
          font-style: italic;
          font-size: 0.78rem;
          color: #C9A84C;
          text-decoration: none;
          transition: color 0.2s;
        }

        .forgot-link:hover { color: #8B6914; }

        /* Submit Button */
        .submit-btn {
          width: 100%;
          padding: 0.9rem;
          background: linear-gradient(135deg, #8B6914 0%, #C9A84C 40%, #E2C97E 60%, #C9A84C 80%, #8B6914 100%);
          border: none;
          border-radius: 3px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(139,105,20,0.4);
          margin-bottom: 1.25rem;
        }

        .submit-btn::before {
          content: '';
          position: absolute;
          inset: 1px;
          background: linear-gradient(135deg, #9B7A24, #D4A836);
          border-radius: 2px;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .submit-btn:hover::before { opacity: 1; }
        .submit-btn:hover { box-shadow: 0 6px 20px rgba(139,105,20,0.6); transform: translateY(-1px); }

        .submit-btn-text {
          position: relative;
          font-family: 'Cinzel Decorative', cursive;
          font-size: 0.9rem;
          color: var(--ink);
          letter-spacing: 0.1em;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }

        .btn-ornament { color: #4E2B00; font-size: 0.7rem; }

        .signup-row {
          text-align: center;
          margin-bottom: 1.25rem;
        }

        .signup-text {
          font-family: 'Lora', serif;
          font-size: 0.8rem;
          color: #8D6E63;
        }

        .signup-link {
          color: #C9A84C;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s;
        }

        .signup-link:hover { color: #8B6914; }

        /* Divider */
        .or-divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 1.25rem 0;
        }

        .or-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent);
        }

        .or-text {
          font-family: 'Tiro Devanagari Hindi', serif;
          font-size: 0.75rem;
          color: #A1887F;
          white-space: nowrap;
        }

        /* Alt Login Buttons */
        .alt-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          margin-bottom: 1.25rem;
        }

        .alt-btn {
          padding: 0.6rem;
          border: 1.5px solid rgba(201,168,76,0.3);
          border-radius: 3px;
          background: rgba(253,248,238,0.5);
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .alt-btn:hover {
          border-color: #C9A84C;
          background: rgba(201,168,76,0.08);
          box-shadow: 0 2px 8px rgba(201,168,76,0.2);
        }

        .alt-btn-text {
          font-family: 'Lora', serif;
          font-size: 0.78rem;
          color: #5D4037;
        }

        .alt-btn-sub {
          font-style: italic;
          font-size: 0.65rem;
          color: #A1887F;
        }

        /* Security note */
        .security-note {
          display: flex;
          align-items: flex-start;
          gap: 0.6rem;
          padding: 0.75rem 1rem;
          background: linear-gradient(135deg, rgba(201,168,76,0.05), rgba(27,94,32,0.05));
          border: 1px solid rgba(201,168,76,0.2);
          border-radius: 3px;
          border-left: 3px solid #C9A84C;
        }

        .security-icon { color: #C9A84C; flex-shrink: 0; margin-top: 2px; }

        .security-text {
          font-family: 'Lora', serif;
          font-size: 0.72rem;
          color: #6D4C41;
          line-height: 1.6;
        }

        .security-text strong { color: #4E342E; }

        /* Bottom footer */
        .page-footer {
          text-align: center;
          margin-top: 1.5rem;
        }

        .footer-text {
          font-family: 'Lora', serif;
          font-style: italic;
          font-size: 0.72rem;
          color: #A1887F;
        }

        .footer-flag {
          font-size: 1rem;
          margin: 0 0.25rem;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .page-wrapper {
            grid-template-columns: 1fr;
          }
          .left-panel {
            padding: 2rem 1.5rem;
            min-height: auto;
          }
          .portal-title { font-size: 1.3rem; }
          .portal-hindi { font-size: 1.7rem; }
          .peacock-row, .warli-row { display: none; }
          .feature-pills { display: none; }
        }
      `}</style>

      <div className="page-wrapper">
        {/* ── LEFT PANEL ── */}
        <div className="left-panel">
          <div className="gold-texture" />

          {/* Mandala BG */}
          <svg className="mandala-bg" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            {[20,40,60,80,100,120,140,160,180,200].map((r,i) => (
              <circle key={i} cx="200" cy="200" r={r} stroke="#C9A84C" strokeWidth={i%3===0?1:0.5}
                strokeDasharray={i%2===0?"8 4":"4 8"} opacity={0.6-i*0.04}/>
            ))}
            {Array.from({length:12}).map((_,i)=>(
              <line key={i} x1="200" y1="200" x2={200+Math.cos((i*30*Math.PI)/180)*200}
                y2={200+Math.sin((i*30*Math.PI)/180)*200} stroke="#C9A84C" strokeWidth="0.5" opacity="0.3"/>
            ))}
            {[60,90,120,150].map((r,i)=>(
              Array.from({length:12}).map((_,j)=>(
                <circle key={`${i}-${j}`}
                  cx={200+Math.cos((j*30*Math.PI)/180)*r}
                  cy={200+Math.sin((j*30*Math.PI)/180)*r}
                  r={3-i*0.5} fill="#C9A84C" opacity={0.4-i*0.07}/>
              ))
            ))}
          </svg>

          {/* Corner ornaments */}
          <div className="corner-tl"><MandalaCorner className="w-full h-full" /></div>
          <div className="corner-tr"><MandalaCorner className="w-full h-full" /></div>
          <div className="corner-bl"><MandalaCorner className="w-full h-full" /></div>
          <div className="corner-br"><MandalaCorner className="w-full h-full" /></div>

          <div className="left-content">
            {/* Lotus */}
            <div className="lotus-container">
              <div className="lotus-glow" />
              <LotusIcon />
            </div>

            <div className="divider-gold" />

            <h1 className="portal-hindi">ग्राम ई-सेवा</h1>
            <h2 className="portal-title">Gram e-Seva</h2>
            <p className="portal-sub">Rural e-Governance Portal</p>

            <div className="divider-gold" />

            {/* Warli Dancers */}
            <div className="warli-row">
              {[0,1,2,3,4].map(i=>(
                <WarliDancer key={i} className={`w-8 h-12 ${i%2===0?'':'scale-x-[-1]'}`} />
              ))}
            </div>

            {/* Peacock feathers */}
            <div className="peacock-row">
              <PeacockFeather className="w-10 h-28 opacity-70" />
              <PeacockFeather className="w-10 h-32 opacity-90" />
              <PeacockFeather className="w-10 h-28 opacity-70" style={{transform:'scaleX(-1)'}} />
            </div>

            {/* Feature pills */}
            <div className="feature-pills">
              {[
                'सेवा याचिका / Service Requests',
                'सरकारी योजनाएँ / Government Schemes',
                'शिकायत प्रबंधन / Grievance Portal',
                'डिजिटल दस्तावेज़ / Digital Documents',
              ].map((text, i) => (
                <div key={i} className="feature-pill">
                  <div className="feature-pill-dot" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="right-panel">
          <div className="gond-bg">
            <GondPattern />
          </div>

          <div className="login-card">
            <div className="tanjore-frame">
              <div className="frame-corner-ornament tl" />
              <div className="frame-corner-ornament tr" />
              <div className="frame-corner-ornament bl" />
              <div className="frame-corner-ornament br" />

              <div className="frame-top-border">
                <BorderPattern />
              </div>

              <div className="frame-inner">
                {/* Header */}
                <div className="form-header">
                  <div className="form-title-hindi">प्रवेश करें</div>
                  <div className="form-title-eng">◈ ENTER THE PORTAL ◈</div>
                </div>

                {/* Role Tabs */}
                <div className="role-tabs">
                  {Object.entries(roles).map(([key, val]) => (
                    <button key={key} className={`role-tab ${activeTab===key?'active':''}`}
                      onClick={() => setActiveTab(key)}>
                      <span className="role-tab-hindi">{val.hindi}</span>
                      <span className="role-tab-eng">{val.english}</span>
                    </button>
                  ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                  {errorMsg && <div className="error-message">{errorMsg}</div>}
                  <div className="field-group">
                    <div className="field-label">
                      <span className="label-hindi">ईमेल पता</span>
                      <span className="label-eng">/ Email Address</span>
                    </div>
                    <div className="input-wrapper">
                      <span className="input-icon">✉</span>
                      <input type="email" required className="form-input"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        placeholder="अपना ईमेल दर्ज करें" />
                    </div>
                  </div>

                  <div className="field-group">
                    <div className="field-label">
                      <span className="label-hindi">पासवर्ड</span>
                      <span className="label-eng">/ Password</span>
                    </div>
                    <div className="input-wrapper">
                      <span className="input-icon">🗝</span>
                      <input type={showPassword ? 'text' : 'password'} required
                        className="form-input" style={{paddingRight:'2.5rem'}}
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                        placeholder="पासवर्ड दर्ज करें" />
                      <button type="button" className="eye-btn" onClick={()=>setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                      </button>
                    </div>
                  </div>

                  <div className="form-footer-row">
                    <label className="remember-label">
                      <input type="checkbox" className="custom-checkbox" />
                      <span className="remember-text">मुझे याद रखें</span>
                    </label>
                    <Link href="/forgot-password" className="forgot-link">
                      पासवर्ड भूल गए?
                    </Link>
                  </div>

                  <button type="submit" className="submit-btn" disabled={loading}>
                    <span className="submit-btn-text">
                      <span className="btn-ornament">◈</span>
                      {loading ? 'प्रवेश कर रहा है...' : 'प्रवेश करें · Sign In'}
                      <span className="btn-ornament">◈</span>
                    </span>
                  </button>
                </form>

                <div className="signup-row">
                  <span className="signup-text">
                    खाता नहीं है?{' '}
                    <Link href={`/register?role=${activeTab}`} className="signup-link">
                      पंजीकरण करें / Register
                    </Link>
                  </span>
                </div>

                <div className="or-divider">
                  <div className="or-line" />
                  <span className="or-text">या इसके साथ / Or with</span>
                  <div className="or-line" />
                </div>

                <div className="alt-buttons">
                  <button className="alt-btn">
                    <Fingerprint size={18} color="#1565C0" />
                    <div>
                      <div className="alt-btn-text">आधार</div>
                      <div className="alt-btn-sub">Aadhaar</div>
                    </div>
                  </button>
                  <button className="alt-btn">
                    <ShieldCheck size={18} color="#2E7D32" />
                    <div>
                      <div className="alt-btn-text">डिजी लॉकर</div>
                      <div className="alt-btn-sub">DigiLocker</div>
                    </div>
                  </button>
                </div>

                <div className="security-note">
                  <ShieldCheck size={14} className="security-icon" />
                  <p className="security-text">
                    <strong>सुरक्षा नोट:</strong> आपका डेटा सुरक्षित है।{' '}
                    We adhere strictly to Indian digital privacy policies &amp; IT Act 2000.
                  </p>
                </div>
              </div>

              <div className="frame-bottom-border" />
            </div>

            <div className="page-footer">
              <p className="footer-text">
                <span className="footer-flag">🇮🇳</span>
                एक डिजिटल भारत पहल · A Digital India Initiative
                <span className="footer-flag">🇮🇳</span>
              </p>
              <p className="footer-text" style={{marginTop:'0.25rem', opacity:0.7}}>
                ग्रामीण विकास मंत्रालय · Ministry of Rural Development
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}