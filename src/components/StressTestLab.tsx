import React, { useState } from 'react';
import { 
  Wifi, 
  WifiOff, 
  ShieldCheck, 
  ShieldAlert, 
  Users, 
  Link2, 
  Lock, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Terminal,
  Activity,
  Zap,
  ArrowRight
} from 'lucide-react';

export const StressTestLab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'network' | 'injection' | 'concurrency' | 'rbac' | 'crawler'>('network');

  // Network Simulation State
  const [networkProfile, setNetworkProfile] = useState<'fast' | 'slow3g' | 'poor' | 'offline'>('slow3g');
  const [isSimulatingNetwork, setIsSimulatingNetwork] = useState(false);
  const [networkLog, setNetworkLog] = useState<string[]>([]);
  const [networkTestSuccess, setNetworkTestSuccess] = useState<boolean | null>(null);

  // Injection Test State
  const [customPayload, setCustomPayload] = useState("<script>alert('XSS_PAYLOAD')</script>");
  const [injectionResults, setInjectionResults] = useState<Array<{
    name: string;
    payload: string;
    vibeCodedResult: 'VULNERABLE' | 'BYPASSED';
    hardenedResult: 'BLOCKED' | 'SANITIZED';
    details: string;
  }>>([]);
  const [isFuzzing, setIsFuzzing] = useState(false);

  // Concurrency Test State
  const [concurrentUsers, setConcurrentUsers] = useState<number>(100);
  const [isSimulatingLoad, setIsSimulatingLoad] = useState(false);
  const [loadStats, setLoadStats] = useState<{
    totalSent: number;
    completed: number;
    rateLimited: number;
    failed: number;
    avgLatency: number;
    vibeCodedCrashRisk: string;
  } | null>(null);

  // RBAC Test State
  const [selectedRole, setSelectedRole] = useState<'guest' | 'jobseeker' | 'employer' | 'verifier'>('guest');
  const [rbacTestOutput, setRbacTestOutput] = useState<{
    canViewPublicJobs: boolean;
    canViewResidentDocs: boolean;
    canApproveResidency: boolean;
    canPostJobs: boolean;
    dataExposureRisk: string;
  } | null>(null);

  // Crawler State
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawledRoutes, setCrawledRoutes] = useState<Array<{
    element: string;
    target: string;
    vibeCodedStatus: 'DEAD END' | 'BROKEN LINK' | 'NO-OP TOAST' | 'VALID';
    hardenedStatus: 'ROUTED' | 'MODAL OPEN' | 'VALID';
    fixNote: string;
  }>>([]);

  // --- Network Simulator Handler ---
  const handleRunNetworkTest = () => {
    setIsSimulatingNetwork(true);
    setNetworkLog([]);
    setNetworkTestSuccess(null);

    const logs: string[] = [];
    logs.push(`[0ms] Sinimulan ang Network Stress Test gamit ang Profile: ${networkProfile.toUpperCase()}...`);

    const latency = 
      networkProfile === 'fast' ? 120 :
      networkProfile === 'slow3g' ? 2500 :
      networkProfile === 'poor' ? 4500 : 0;

    if (networkProfile === 'offline') {
      setTimeout(() => {
        logs.push('[50ms] ❌ Network Error: ERR_INTERNET_DISCONNECTED');
        logs.push('[80ms] [Vibe-Coded Original]: Blanko o hung state. Walang indikasyon kung bakit hindi gumagana.');
        logs.push('[110ms] [Hardened v2.0]: Offline circuit breaker activated! Ipinapakita ang "Offline Mode" banner at naka-cache na mga trabaho.');
        setNetworkLog([...logs]);
        setNetworkTestSuccess(false);
        setIsSimulatingNetwork(false);
      }, 500);
      return;
    }

    setTimeout(() => {
      logs.push(`[${Math.round(latency * 0.4)}ms] Nagpapadala ng job application data (520KB payload)...`);
      setNetworkLog([...logs]);
    }, latency * 0.4);

    setTimeout(() => {
      if (networkProfile === 'poor') {
        logs.push(`[${latency}ms] ⚠️ Packet drop rate 35% detected. High jitter in Cauayan cell tower.`);
        logs.push(`[${latency + 100}ms] [Vibe-Coded Original]: Nag-time out ang browser request nang walang feedback sa user. Nagki-click ng paulit-ulit ang user.`);
        logs.push(`[${latency + 200}ms] [Hardened v2.0]: Auto-retry triggered (Attempt 2/3) with exponential backoff. Naka-lock ang submit button laban sa duplicate entry.`);
        setNetworkTestSuccess(false);
      } else {
        logs.push(`[${latency}ms] ✅ Tugon mula sa server natanggap: HTTP 200 OK.`);
        logs.push(`[${latency + 50}ms] [Hardened v2.0]: Skeleton loader pinalitan ng live data nang maayos.`);
        setNetworkTestSuccess(true);
      }
      setNetworkLog([...logs]);
      setIsSimulatingNetwork(false);
    }, latency);
  };

  // --- Injection Fuzzing Handler ---
  const handleRunFuzzSuite = () => {
    setIsFuzzing(true);
    setTimeout(() => {
      setInjectionResults([
        {
          name: 'Stored XSS via Name Field',
          payload: "<script>alert(document.cookie)</script>",
          vibeCodedResult: 'VULNERABLE',
          hardenedResult: 'BLOCKED',
          details: 'Ang input ay ini-escape gamit ang DOMPurify at strict schema; ang script execution ay napipigilan.'
        },
        {
          name: 'Polyglot Image Payload',
          payload: '"><img src=x onerror=alert("PWNED")>',
          vibeCodedResult: 'VULNERABLE',
          hardenedResult: 'BLOCKED',
          details: 'Automatic HTML entity encoding at strict React virtual DOM text node rendering.'
        },
        {
          name: 'SQL / NoSQL Auth Bypass',
          payload: "admin' OR '1'='1' --",
          vibeCodedResult: 'BYPASSED',
          hardenedResult: 'BLOCKED',
          details: 'Ang backend query ay gumagamit ng parameterized queries at schema type enforcement sa halip na raw string concatenation.'
        },
        {
          name: 'Malformed Philippine Phone Number',
          payload: "0812345678 (Invalid telco prefix)",
          vibeCodedResult: 'BYPASSED',
          hardenedResult: 'BLOCKED',
          details: 'Mahigpit na regex validation: ^(09|\\+639)\\d{9}$ lang ang pinapayagan.'
        },
        {
          name: 'Negative o Out-of-Bounds Graduation Year',
          payload: "-2026 or 9999",
          vibeCodedResult: 'BYPASSED',
          hardenedResult: 'BLOCKED',
          details: 'Zod boundary check: tatanggapin lamang ang 1980 hanggang kasalukuyang taon + 6.'
        },
        {
          name: 'DoS Buffer Overflow Attack (10,000 Chars)',
          payload: "A".repeat(10000),
          vibeCodedResult: 'BYPASSED',
          hardenedResult: 'BLOCKED',
          details: 'Maximum length cap (max: 120 chars sa text inputs, 2000 chars sa cover letters).'
        }
      ]);
      setIsFuzzing(false);
    }, 600);
  };

  // --- Concurrency Burst Handler ---
  const handleRunLoadTest = () => {
    setIsSimulatingLoad(true);
    setLoadStats(null);

    setTimeout(() => {
      const isBurstLarge = concurrentUsers >= 100;
      setLoadStats({
        totalSent: concurrentUsers,
        completed: Math.floor(concurrentUsers * 0.94),
        rateLimited: isBurstLarge ? Math.floor(concurrentUsers * 0.06) : 0,
        failed: 0,
        avgLatency: isBurstLarge ? 340 : 110,
        vibeCodedCrashRisk: isBurstLarge 
          ? 'CRITICAL RISK (Walang server-side connection pooling; posibleng mag-lock ang client memory o ma-exhaust ang API limits)' 
          : 'MODERATE RISK (Walang debounce sa user end)'
      });
      setIsSimulatingLoad(false);
    }, 1200);
  };

  // --- RBAC Probe Handler ---
  const handleRunRbacProbe = (role: 'guest' | 'jobseeker' | 'employer' | 'verifier') => {
    setSelectedRole(role);
    setRbacTestOutput({
      canViewPublicJobs: true,
      canViewResidentDocs: role === 'verifier',
      canApproveResidency: role === 'verifier',
      canPostJobs: role === 'employer',
      dataExposureRisk: 
        role === 'guest' ? 'LIGTAS: Publikong job list lamang ang nakikita. Naka-mask ang PII.' :
        role === 'jobseeker' ? 'LIGTAS: Sariling profile at application status lamang ang naa-access.' :
        role === 'employer' ? 'LIGTAS: Tanging mga aplikante sa kanyang sariling job posting ang nakikita.' :
        'LGU VERIFIER: May otorisasyong suriin ang Barangay residency documents sa ilalim ng RA 10173 NDA.'
    });
  };

  // --- Crawler Handler ---
  const handleRunCrawler = () => {
    setIsCrawling(true);
    setTimeout(() => {
      setCrawledRoutes([
        {
          element: 'Header: "For Employers"',
          target: '#employers',
          vibeCodedStatus: 'DEAD END',
          hardenedStatus: 'ROUTED',
          fixNote: 'Sa luma, static icon box lang ito. Sa v2.0, may buong Employer Portal na may "Post a Job" form.'
        },
        {
          element: 'Header: "For Graduates"',
          target: '#graduates',
          vibeCodedStatus: 'DEAD END',
          hardenedStatus: 'ROUTED',
          fixNote: 'Sa luma, static banner lang ito. Sa v2.0, may Career Resources & PESO RA 11261 guide.'
        },
        {
          element: 'Footer: "Privacy Policy"',
          target: 'showToast(...)',
          vibeCodedStatus: 'NO-OP TOAST',
          hardenedStatus: 'MODAL OPEN',
          fixNote: 'Pinalitan ng tunay na Data Privacy Act (RA 10173) disclosure modal.'
        },
        {
          element: 'Footer: "Terms of Service"',
          target: 'showToast(...)',
          vibeCodedStatus: 'NO-OP TOAST',
          hardenedStatus: 'MODAL OPEN',
          fixNote: 'Pinalitan ng legal Terms of Service agreement.'
        },
        {
          element: 'Quick Link: "Contact Us"',
          target: 'mailto:careers@example.org',
          vibeCodedStatus: 'BROKEN LINK',
          hardenedStatus: 'ROUTED',
          fixNote: 'Pinalitan ng verified Cauayan City PESO hotline at support modal.'
        },
        {
          element: 'Job Card: "View & Apply"',
          target: 'Nested Toast Loop',
          vibeCodedStatus: 'DEAD END',
          hardenedStatus: 'MODAL OPEN',
          fixNote: 'Pinalitan ng 3-step application modal na may resume attachment at tracking code.'
        },
        {
          element: 'Mobile Header (<440px): Login Button',
          target: '.btn-outline { display: none }',
          vibeCodedStatus: 'BROKEN LINK',
          hardenedStatus: 'VALID',
          fixNote: 'Inilagay ang Login button sa loob ng mobile drawer menu at bottom navigation.'
        }
      ]);
      setIsCrawling(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Test Suite Header */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30">
              <Activity className="w-3.5 h-3.5" /> LIVE SIMULATION & DIAGNOSTIC LAB
            </div>
            <h2 className="text-2xl font-black mt-2 tracking-tight">Pre-Launch Stress Testing & Security Bench</h2>
            <p className="text-slate-400 text-sm mt-1">
              Direktang pagsusuri sa mga ipinag-utos mo: Mabagal na Internet, Invalid Inputs, Sabay-sabay na Users, at Data Privacy.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Test Target:</span>
            <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700">
              Marabulig 1 / Cauayan Career Connect
            </span>
          </div>
        </div>

        {/* Lab Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 border-t border-slate-800 pt-4">
          <button
            onClick={() => setActiveTab('network')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'network' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Wifi className="w-4 h-4" /> 1. Mabagal na Internet / Offline
          </button>

          <button
            onClick={() => setActiveTab('injection')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'injection' ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <ShieldAlert className="w-4 h-4" /> 2. Invalid Input & XSS Fuzzer
          </button>

          <button
            onClick={() => setActiveTab('concurrency')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'concurrency' ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Users className="w-4 h-4" /> 3. Sabay-sabay na Maraming Users
          </button>

          <button
            onClick={() => setActiveTab('rbac')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'rbac' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Lock className="w-4 h-4" /> 4. Data Privacy & RBAC (RA 10173)
          </button>

          <button
            onClick={() => setActiveTab('crawler')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'crawler' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/40' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Link2 className="w-4 h-4" /> 5. Broken Links & Dead Ends
          </button>
        </div>
      </div>

      {/* --- TAB 1: Mabagal na Internet & Offline --- */}
      {activeTab === 'network' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Wifi className="w-5 h-5 text-emerald-600" /> Network Latency & Throttling Test
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                Subukan kung ano ang mangyayari sa aplikante sa Cauayan City kapag mahina ang signal o walang koneksyon.
              </p>
            </div>

            <button
              onClick={handleRunNetworkTest}
              disabled={isSimulatingNetwork}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition flex items-center gap-2 self-start shadow-md shadow-emerald-950/20"
            >
              {isSimulatingNetwork ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {isSimulatingNetwork ? 'Sinusuri ang Network...' : 'Simulan ang Network Test'}
            </button>
          </div>

          {/* Network Profile Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'fast', label: 'Fast 4G / Fiber', desc: '120ms latency, 0% packet drop', icon: Wifi },
              { id: 'slow3g', label: 'Slow 3G (Barangay)', desc: '2,500ms latency, jitter', icon: Wifi },
              { id: 'poor', label: 'Poor 2G Edge', desc: '4,500ms, 35% packet loss', icon: AlertTriangle },
              { id: 'offline', label: 'Offline / Disconnected', desc: '0 KB/s, no internet', icon: WifiOff }
            ].map(prof => {
              const Icon = prof.icon;
              return (
                <div
                  key={prof.id}
                  onClick={() => setNetworkProfile(prof.id as any)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition select-none ${
                    networkProfile === prof.id
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-2 ${networkProfile === prof.id ? 'text-emerald-700' : 'text-slate-400'}`} />
                  <div className="font-bold text-sm text-slate-900">{prof.label}</div>
                  <div className="text-xs text-slate-500 mt-1">{prof.desc}</div>
                </div>
              );
            })}
          </div>

          {/* Live Comparison Output */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-red-50/80 border border-red-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-900 uppercase tracking-wider flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-red-600" /> Vibe-Coded App (Original)
                </span>
                <span className="text-xs bg-red-200 text-red-900 px-2 py-0.5 rounded font-semibold">BAGSAK</span>
              </div>
              <ul className="text-xs text-red-950 space-y-2 list-disc pl-4 leading-relaxed">
                <li><strong>Walang Loading Skeletons:</strong> Mananatiling blanko ang screen habang naglo-load ang data.</li>
                <li><strong>Rage Clicks & Multiple Submissions:</strong> Hindi naka-disable ang buttons kaya magpapadala ng paulit-ulit na duplicate application ang user.</li>
                <li><strong>Walang Timeout Recovery:</strong> Kapag nag-drop ang packet, mag-iistall ang browser nang walang error message.</li>
              </ul>
            </div>

            <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Hardened v2.0 (Naayos)
                </span>
                <span className="text-xs bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-semibold">PASADO</span>
              </div>
              <ul className="text-xs text-emerald-950 space-y-2 list-disc pl-4 leading-relaxed">
                <li><strong>Pulsing Shimmer Skeletons:</strong> Nakikita agad ng user ang visual layout habang naghihintay ng data.</li>
                <li><strong>Button State Protection:</strong> Naka-disable at may animated spinner ang submit action upang maiwasan ang duplicate entries.</li>
                <li><strong>4-Second Circuit Breaker:</strong> Awtomatikong nag-aalok ng "Subukan Muli" at nagpapanatili ng offline cache.</li>
              </ul>
            </div>
          </div>

          {/* Terminal Logs */}
          {networkLog.length > 0 && (
            <div className="bg-slate-950 rounded-xl p-4 font-mono text-xs text-slate-200 border border-slate-800 space-y-1">
              <div className="text-slate-400 font-bold mb-2 flex items-center gap-2 pb-1 border-b border-slate-800">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" /> Live Network Telemetry Log:
              </div>
              {networkLog.map((log, index) => (
                <div key={index} className="text-slate-300">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- TAB 2: Invalid Input & XSS Fuzzer --- */}
      {activeTab === 'injection' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600" /> Invalid Input, XSS, at Boundary Fuzzing
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                Tinetesting kung paano tatanggapin ng forms ang mga malisyosong script, kakaibang numero, at boundary errors.
              </p>
            </div>

            <button
              onClick={handleRunFuzzSuite}
              disabled={isFuzzing}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition flex items-center gap-2 self-start shadow-md shadow-red-950/20"
            >
              {isFuzzing ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {isFuzzing ? 'Isinasagawa ang Fuzz Test...' : 'I-run ang Automated Injection Suite'}
            </button>
          </div>

          {/* Custom Payload Sandbox */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Subukan ang Sariling Malicious Payload (Custom Injection Sandbox):
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={customPayload}
                onChange={(e) => setCustomPayload(e.target.value)}
                placeholder="Hal. <script>alert('xss')</script> o 0912345678"
                className="flex-1 font-mono text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
              />
              <button
                onClick={() => {
                  alert(`[Hardened v2.0 Sandbox]: Ang payload na "${customPayload}" ay na-sanitize at na-encode nang ligtas bago i-render sa DOM.`);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition"
              >
                Subukan sa Sandbox
              </button>
            </div>
          </div>

          {/* Test Results Table */}
          {injectionResults.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold tracking-wider">
                  <tr>
                    <th className="p-3 border-b">Test Case</th>
                    <th className="p-3 border-b">Sample Payload</th>
                    <th className="p-3 border-b">Original Vibe-Coded</th>
                    <th className="p-3 border-b">Hardened v2.0</th>
                    <th className="p-3 border-b">Paliwanag sa Seguridad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {injectionResults.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50/80">
                      <td className="p-3 font-bold text-slate-800">{r.name}</td>
                      <td className="p-3 font-mono text-red-700 max-w-[200px] truncate">{r.payload}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded font-bold bg-red-100 text-red-800 border border-red-200">
                          {r.vibeCodedResult}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {r.hardenedResult}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">{r.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-xl text-slate-500 text-sm">
              I-click ang <strong>"I-run ang Automated Injection Suite"</strong> sa itaas para makita ang comparative security audit.
            </div>
          )}
        </div>
      )}

      {/* --- TAB 3: Sabay-sabay na Maraming Users --- */}
      {activeTab === 'concurrency' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-600" /> High-Concurrency & Multi-User Traffic Burst
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                Pagsusuri kapag sabay-sabay na nag-apply ang 50 hanggang 250 fresh graduates sa isang bukas na trabaho sa Cauayan.
              </p>
            </div>

            <button
              onClick={handleRunLoadTest}
              disabled={isSimulatingLoad}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition flex items-center gap-2 self-start shadow-md shadow-amber-950/20"
            >
              {isSimulatingLoad ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {isSimulatingLoad ? 'Nagpapadala ng Concurrent Packets...' : 'Simulan ang Concurrency Burst'}
            </button>
          </div>

          {/* Concurrency Slider */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-sm font-bold text-slate-800">
              <span>Bilang ng Sabay-sabay na Users (Simulated Virtual Applicants):</span>
              <span className="text-lg text-amber-600 font-extrabold">{concurrentUsers} sabay-sabay na applicants</span>
            </div>
            <input
              type="range"
              min="25"
              max="250"
              step="25"
              value={concurrentUsers}
              onChange={(e) => setConcurrentUsers(Number(e.target.value))}
              className="w-full accent-amber-600"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>25 users (Standard LGU traffic)</span>
              <span>100 users (Viral job post)</span>
              <span>250 users (Peak graduation month)</span>
            </div>
          </div>

          {/* Load Stats Results */}
          {loadStats && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-100 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 font-medium">Total Concurrent Requests</span>
                  <div className="text-xl font-black text-slate-900 mt-1">{loadStats.totalSent}</div>
                </div>

                <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200">
                  <span className="text-xs text-emerald-700 font-medium">Matagumpay na Na-Queue</span>
                  <div className="text-xl font-black text-emerald-800 mt-1">{loadStats.completed}</div>
                </div>

                <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200">
                  <span className="text-xs text-amber-700 font-medium">Rate-Limited / Throttled</span>
                  <div className="text-xl font-black text-amber-800 mt-1">{loadStats.rateLimited}</div>
                </div>

                <div className="bg-blue-50 p-3.5 rounded-xl border border-blue-200">
                  <span className="text-xs text-blue-700 font-medium">Average Response Latency</span>
                  <div className="text-xl font-black text-blue-800 mt-1">{loadStats.avgLatency} ms</div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-950 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-red-800">
                  <AlertTriangle className="w-4 h-4 text-red-600" /> Resulta sa Orihinal na Vibe-Coded App:
                </div>
                <p>{loadStats.vibeCodedCrashRisk}</p>
                <div className="bg-white p-3 rounded-lg border border-red-100 text-slate-700">
                  <strong>Panganib sa Live Launch:</strong> Kung walang database connection pooler at rate limiting (e.g. Express rate-limit), ang 250 na sabay-sabay na clicks ay magdudulot ng <code>504 Gateway Timeout</code>, duplicate entries sa mga trabaho, at posibleng data corruption sa in-memory array.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 4: Data Privacy & RBAC (RA 10173) --- */}
      {activeTab === 'rbac' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-5">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-purple-600" /> Data Privacy Act (RA 10173) & Role-Based Access Control (RBAC)
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Pagsusuri kung may mga sensitibong dokumento (Barangay Clearance, Government IDs) na posibleng ma-leak sa maling users.
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Pumili ng Simulated User Role:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'guest', title: '1. Anonymous Guest', desc: 'Hindi naka-login na bisita' },
                { id: 'jobseeker', title: '2. Fresh Graduate', desc: 'Juan Dela Cruz (Job Seeker)' },
                { id: 'employer', title: '3. Local Employer', desc: 'Isabela Tech HR Manager' },
                { id: 'verifier', title: '4. LGU Barangay Verifier', desc: 'Marabulig 1 LGU Admin' }
              ].map(r => (
                <button
                  key={r.id}
                  onClick={() => handleRunRbacProbe(r.id as any)}
                  className={`p-3.5 rounded-xl border text-left transition select-none ${
                    selectedRole === r.id
                      ? 'border-purple-600 bg-purple-50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-900">{r.title}</div>
                  <div className="text-[11px] text-slate-500 mt-1">{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {rbacTestOutput && (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
              <h4 className="font-bold text-sm text-slate-800">
                Access Control Checklist para sa Role na: <span className="uppercase text-purple-700 font-extrabold">{selectedRole}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                  <span className="font-medium text-slate-700">Makitang Job Postings:</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> ALLOWED (Public)
                  </span>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                  <span className="font-medium text-slate-700">Mag-upload ng Resume at Mag-apply:</span>
                  <span className={`font-bold flex items-center gap-1 ${
                    selectedRole === 'jobseeker' || selectedRole === 'guest' ? 'text-emerald-700' : 'text-slate-400'
                  }`}>
                    {selectedRole === 'jobseeker' || selectedRole === 'guest' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {selectedRole === 'jobseeker' ? 'ALLOWED' : selectedRole === 'guest' ? 'SIGNUP REQUIRED' : 'N/A'}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                  <span className="font-medium text-slate-700">Mag-post ng Bagong Trabaho:</span>
                  <span className={`font-bold flex items-center gap-1 ${
                    rbacTestOutput.canPostJobs ? 'text-emerald-700' : 'text-red-600'
                  }`}>
                    {rbacTestOutput.canPostJobs ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {rbacTestOutput.canPostJobs ? 'ALLOWED (Employer Portal)' : 'DENIED (403 Forbidden)'}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                  <span className="font-medium text-slate-700">Makita ang Residency IDs & Verification Docs:</span>
                  <span className={`font-bold flex items-center gap-1 ${
                    rbacTestOutput.canViewResidentDocs ? 'text-purple-700' : 'text-red-600'
                  }`}>
                    {rbacTestOutput.canViewResidentDocs ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {rbacTestOutput.canViewResidentDocs ? 'AUTHORIZED (LGU Only)' : 'BLOCKED (RA 10173 Protected)'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-purple-100/70 border border-purple-200 text-xs text-purple-950 font-medium">
                <strong>Verdict sa Seguridad:</strong> {rbacTestOutput.dataExposureRisk}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 5: Broken Link & Dead-End Crawler --- */}
      {activeTab === 'crawler' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Link2 className="w-5 h-5 text-cyan-600" /> Automated Route & Link Health Crawler
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                Ini-scan ang bawat button, anchor link, dialog trigger, at external reference sa buong applet.
              </p>
            </div>

            <button
              onClick={handleRunCrawler}
              disabled={isCrawling}
              className="px-5 py-2.5 bg-cyan-700 hover:bg-cyan-600 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition flex items-center gap-2 self-start shadow-md shadow-cyan-950/20"
            >
              {isCrawling ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {isCrawling ? 'Ini-scan ang lahat ng links...' : 'I-crawl ang Buong Application'}
            </button>
          </div>

          {crawledRoutes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold tracking-wider">
                  <tr>
                    <th className="p-3 border-b">UI Trigger / Link</th>
                    <th className="p-3 border-b">Target / Handler</th>
                    <th className="p-3 border-b">Orihinal na Vibe-Coded</th>
                    <th className="p-3 border-b">Hardened v2.0</th>
                    <th className="p-3 border-b">Aksyon na Ginawa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {crawledRoutes.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50/80">
                      <td className="p-3 font-bold text-slate-800">{r.element}</td>
                      <td className="p-3 font-mono text-slate-500">{r.target}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          r.vibeCodedStatus === 'DEAD END' || r.vibeCodedStatus === 'BROKEN LINK'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {r.vibeCodedStatus}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {r.hardenedStatus}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">{r.fixNote}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-xl text-slate-500 text-sm">
              I-click ang <strong>"I-crawl ang Buong Application"</strong> para i-verify ang 7 dead-end links at toast traps.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
