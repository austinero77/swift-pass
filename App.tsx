
import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import { Participant } from './types';
import { storageService } from './services/storageService';
import { Button } from './components/ui/Button';
import { RegistrationForm } from './components/RegistrationForm';
import { ParticipantList } from './components/ParticipantList';
import { TicketCard } from './components/TicketCard';
import jsQR from 'jsqr';
import {
  ShieldCheck,
  LayoutDashboard,
  UserPlus,
  ListFilter,
  LogOut,
  Settings,
  QrCode,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Search,
  Zap,
  Lock,
  Camera,
  X,
  AlertTriangle
} from 'lucide-react';
import { Toaster } from 'sonner';

// Live Scanner Page Component
const ScannerPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanning, setScanning] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let stream: MediaStream | null = null;
    let animationId: number;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.play();
          requestAnimationFrame(tick);
        }
      } catch (err) {
        setError("Camera access denied. Please check permissions.");
      }
    };

    const tick = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (canvas && video) {
          const ctx = canvas.getContext('2d');
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
          if (imageData) {
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "dontInvert",
            });
            if (code) {
              const url = code.data;
              // Support both standard and hash-based URLs
              const idMatch = url.match(/\/verify\/([^/?#]+)/);
              if (idMatch && idMatch[1]) {
                setScanning(false);
                stream?.getTracks().forEach(track => track.stop());
                navigate(`/verify/${idMatch[1]}`);
                return;
              }
            }
          }
        }
      }
      animationId = requestAnimationFrame(tick);
    };

    startCamera();

    return () => {
      cancelAnimationFrame(animationId);
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[100] p-6">
      <div className="absolute top-6 left-6 z-10">
        <Button variant="ghost" onClick={() => navigate('/')} className="text-white bg-white/10 p-4 rounded-full">
          <ArrowLeft size={24} />
        </Button>
      </div>

      <div className="relative w-full max-w-sm aspect-square border-4 border-blue-500/30 rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/20">
        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" />
        <canvas ref={canvasRef} className="hidden" />

        {scanning && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
            <div className="w-64 h-64 border-2 border-white/20 rounded-2xl relative">
              <div className="scan-line"></div>
            </div>
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-8 animate-pulse">Align QR Code Within Frame</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-8 bg-rose-500/10 border border-rose-500/30 p-4 rounded-2xl text-rose-400 text-sm font-bold flex items-center gap-3">
          <AlertTriangle size={20} /> {error}
        </div>
      )}

      <div className="mt-12 text-center">
        <h2 className="text-white text-xl font-black uppercase tracking-tight mb-2">SwiftScan Terminal</h2>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-relaxed max-w-xs">Auto-verifying secure passes via military-grade encryption</p>
      </div>
    </div>
  );
};

// Advanced Delete Confirmation Modal
const DeleteModal = ({ isOpen, onClose, onConfirm, itemName }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, itemName: string }) => {
  const [confirmText, setConfirmText] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-[200] p-6">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-start mb-6">
          <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center border border-rose-500/20">
            <AlertTriangle className="text-rose-500" size={28} />
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Destructive Action</h2>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          You are about to permanently delete <span className="text-white font-bold">"{itemName}"</span>. This action cannot be reversed.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Type "DELETE" to proceed</label>
            <input
              type="text"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all font-mono placeholder:text-slate-700 uppercase"
              placeholder="CONFIRMATION"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1 py-4 border-slate-800 shadow-none" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1 py-4 font-bold"
              disabled={confirmText.trim() !== 'DELETE'}
              onClick={() => {
                onConfirm();
                setConfirmText('');
              }}
            >
              Delete Record
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Public Check Portal with better UX
const PublicCheckPortal = () => {
  const [ticketId, setTicketId] = useState('');
  const [result, setResult] = useState<Participant | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketId) return;
    setLoading(true);
    setError(false);
    setResult(null);

    try {
      const p = await storageService.getParticipantById(ticketId);
      if (p) {
        setResult(p);
      } else {
        setError(true);
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/30">
            <Zap className="text-blue-500" size={32} />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white text-center mb-2 uppercase tracking-tighter">Identity Check</h1>
        <p className="text-slate-500 text-center mb-8 text-xs font-bold uppercase tracking-widest">Manual Ticket Authentication</p>

        <form onSubmit={handleCheck} className="space-y-4 mb-8">
          <div className="relative">
            <input
              type="text"
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-center tracking-[0.3em] font-mono uppercase"
              placeholder="TICKET ID"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
            />
          </div>
          <Button type="submit" variant="primary" className="w-full py-4 font-black text-base shadow-xl" isLoading={loading}>
            Query Database
          </Button>
        </form>

        {result && (
          <div className="animate-in zoom-in-95 fade-in duration-300 bg-slate-800/30 rounded-3xl p-6 border border-emerald-500/20">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="text-emerald-500" size={24} />
              <h3 className="text-emerald-400 font-black uppercase tracking-widest text-[10px]">Registry Confirmed</h3>
            </div>
            <p className="text-2xl font-black text-white mb-1 uppercase leading-tight">
              {result.lastName || result.firstName ? `${result.lastName} ${result.firstName}` : ((result as any).fullName || 'Legacy Guest')}
            </p>
            <div className="flex justify-between items-center text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2">
              <span>{result.ticketType || 'Standard'} Access</span>
              <span>{result.familySize || 1} Person(s)</span>
            </div>
            <div className={`mt-6 px-4 py-2 text-center rounded-xl text-[10px] font-black uppercase tracking-[0.2em] w-full ${result.isVerified ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
              {result.isVerified ? 'Checked-In Active' : 'Waiting for Entry'}
            </div>
          </div>
        )}

        {error && (
          <div className="animate-in shake duration-300 bg-rose-500/5 rounded-2xl p-8 border border-rose-500/20 text-center">
            <AlertCircle className="text-rose-500 mx-auto mb-4" size={40} />
            <p className="text-rose-400 font-black uppercase tracking-widest">Access Refused</p>
            <p className="text-slate-600 text-[10px] font-bold mt-2 uppercase">Invalid or Revoked ID Code</p>
          </div>
        )}

        <button
          onClick={() => navigate('/')}
          className="w-full text-center text-slate-600 text-[10px] font-black uppercase tracking-widest mt-12 hover:text-slate-400 transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft size={14} /> Back to Entry Point
        </button>
      </div>
    </div>
  );
};

// Verification Route
const VerificationRoute = () => {
  const { id } = useParams<{ id: string }>();
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      storageService.getParticipantById(id).then(async p => {
        if (p) {
          const updated = { ...p, isVerified: true };
          await storageService.updateParticipant(updated);
          setParticipant(updated);
        }
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6">
      <div className="animate-pulse flex flex-col items-center gap-6">
        <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center border border-blue-500/20">
          <QrCode className="text-blue-500 animate-bounce" size={40} />
        </div>
        <div className="text-center">
          <p className="text-white font-black uppercase tracking-[0.3em] text-[10px]">Syncing with Mainframe...</p>
          <div className="mt-4 h-1 w-48 bg-slate-900 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 animate-[scan_2s_infinite]"></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl overflow-hidden relative">
        {participant ? (
          <>
            <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500"></div>
            <div className="mb-8 flex justify-center">
              <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center border-4 border-emerald-500/30 shadow-2xl shadow-emerald-500/20">
                <CheckCircle2 className="text-emerald-500" size={48} />
              </div>
            </div>
            <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Access Authorized</h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-10 leading-relaxed">Identity Verified Successfully.<br />Welcome to the Environment.</p>

            <div className="bg-slate-800/50 rounded-3xl p-8 text-left border border-slate-700 shadow-inner">
              <div className="mb-6">
                <p className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Primary Holder</p>
                <p className="text-2xl font-black text-white uppercase leading-none">
                  {participant.lastName || participant.firstName ? `${participant.lastName} ${participant.firstName}` : ((participant as any).fullName || 'Legacy Guest')}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Type</p>
                  <p className="text-white font-black text-sm uppercase tracking-tight">{participant.ticketType || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Group Size</p>
                  <p className="text-white font-black text-sm uppercase tracking-tight">{participant.familySize || 1} PAX</p>
                </div>
              </div>
            </div>

            <div className="mt-10 text-slate-600 text-[10px] uppercase font-black tracking-widest leading-loose">
              Hash Code: {(participant.id || '').split('-')[0].toUpperCase()}
              <br />
              Auth Date: {new Date().toLocaleDateString()}
            </div>
          </>
        ) : (
          <>
            <div className="absolute top-0 left-0 w-full h-1.5 bg-rose-500"></div>
            <div className="mb-8 flex justify-center">
              <div className="w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center border-4 border-rose-500/30">
                <AlertCircle className="text-rose-500" size={48} />
              </div>
            </div>
            <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Security Alert</h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-10 leading-relaxed">System failed to locate record.<br />Access protocol blocked.</p>
            <Button variant="outline" className="w-full py-5 rounded-2xl font-black border-slate-700" onClick={() => window.location.hash = '/'}>
              Terminate Session
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

const ADMIN_PASSKEY = import.meta.env.VITE_ADMIN_PASSKEY;

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [passkey, setPasskey] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'register'>('list');
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: '', name: '' });

  useEffect(() => {
    if (isAdmin) {
      storageService.getParticipants().then(setParticipants);
    }
  }, [isAdmin]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passkey === ADMIN_PASSKEY) {
      setIsAdmin(true);
      navigate('/dashboard');
    } else {
      alert('Invalid admin passkey!');
      // toast.error('Access Denied: Invalid Passkey');
      setPasskey('');
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    await storageService.deleteParticipant(deleteModal.id);
    const updated = await storageService.getParticipants();
    setParticipants(updated);
    setDeleteModal({ isOpen: false, id: '', name: '' });
  };

  const handleRegistrationSuccess = (participant: Participant) => {
    setSelectedParticipant(participant);
    storageService.getParticipants().then(setParticipants);
  };

  // <Toaster position="top-center" richColors closeButton expand={true} />

  if (!isAdmin && location.pathname.startsWith('/dashboard')) {
    return (

      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 px-6">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/30">
              <Lock className="text-blue-500" size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white text-center mb-2 uppercase tracking-tighter">Admin Vault</h1>
          <p className="text-slate-500 text-center mb-10 text-[10px] font-black uppercase tracking-[0.3em]">Identity Verification Required</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-center tracking-[0.5em] font-mono text-xl"
                placeholder="PIN"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
              />
            </div>
            <Button type="submit" variant="primary" className="w-full py-5 font-black text-lg shadow-2xl">
              Unlock Terminal
            </Button>
          </form>
          <div className="mt-8 text-center">
            <p className="text-slate-700 text-[10px] uppercase font-bold tracking-widest">Demo Key: <span className="text-slate-500 font-mono">admin123</span></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 md:pb-0">
      <Routes>
        <Route path="/" element={
          <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
            <div className="space-y-8 max-w-2xl animate-in fade-in duration-700">
              <div className="inline-block p-6 bg-blue-500/10 rounded-[2.5rem] border border-blue-500/20 mb-4 shadow-2xl shadow-blue-500/10">
                <ShieldCheck className="text-blue-500" size={56} />
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase leading-none">
                SWIFT<span className="text-blue-500">PASS</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-500 font-bold uppercase tracking-widest leading-relaxed max-w-lg mx-auto">
                Secure Registry • Live Verification • KV Storage v2
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-10">
                <Button size="lg" className="w-full sm:w-auto px-16 py-8 rounded-[2rem] text-xl font-black uppercase tracking-tighter" onClick={() => navigate('/dashboard')}>
                  Open Terminal
                </Button>
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-16 py-8 rounded-[2rem] text-xl font-black uppercase tracking-tighter flex items-center gap-3 border-slate-800 shadow-none" onClick={() => navigate('/scan')}>
                  <Camera size={24} className="text-blue-500" /> Scanner
                </Button>
              </div>
              <button
                onClick={() => navigate('/check')}
                className="block mx-auto text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] hover:text-blue-500 transition-colors"
              >
                Manual Ticket Search
              </button>
            </div>
          </div>
        } />

        <Route path="/scan" element={<ScannerPage />} />
        <Route path="/check" element={<PublicCheckPortal />} />
        <Route path="/verify/:id" element={<VerificationRoute />} />

        <Route path="/dashboard" element={
          <div className="max-w-6xl mx-auto p-6 md:p-12">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/40">
                  <LayoutDashboard className="text-white" size={28} />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white tracking-tight uppercase">Dashboard</h1>
                  <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span> Live KV Node
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="danger" size="sm" className="items-center gap-2 rounded-xl px-6 py-4 font-bold" onClick={() => { setIsAdmin(false); navigate('/'); }}>
                  <LogOut size={18} /> Exit Console
                </Button>
              </div>
            </header>

            {selectedParticipant ? (
              <div className="animate-in fade-in duration-500">
                <div className="flex items-center gap-4 mb-8">
                  <Button variant="ghost" size="sm" className="p-3 bg-slate-900 rounded-2xl" onClick={() => setSelectedParticipant(null)}>
                    <ArrowLeft size={24} />
                  </Button>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">Active E-Pass</h2>
                </div>
                <TicketCard
                  participant={selectedParticipant}
                  onExit={() => setSelectedParticipant(null)}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <nav className="lg:col-span-3 space-y-3">
                  <button
                    onClick={() => setActiveTab('list')}
                    className={`w-full flex items-center gap-4 px-6 py-5 rounded-[1.5rem] transition-all duration-300 ${activeTab === 'list'
                      ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/40 transform -translate-y-1'
                      : 'text-slate-500 hover:bg-slate-800/50 hover:text-white'
                      }`}
                  >
                    <ListFilter size={24} />
                    <span className="font-black text-base uppercase tracking-tight">Guest List</span>
                    <span className="ml-auto bg-black/20 px-3 py-1 rounded-full text-[10px] font-black">{participants.length}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('register')}
                    className={`w-full flex items-center gap-4 px-6 py-5 rounded-[1.5rem] transition-all duration-300 ${activeTab === 'register'
                      ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/40 transform -translate-y-1'
                      : 'text-slate-500 hover:bg-slate-800/50 hover:text-white'
                      }`}
                  >
                    <UserPlus size={24} />
                    <span className="font-black text-base uppercase tracking-tight">Register</span>
                  </button>
                  <div className="pt-6 border-t border-slate-900 mt-6">
                    <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest px-6 mb-4">Verification Tools</p>
                    <button
                      onClick={() => navigate('/scan')}
                      className="w-full flex items-center gap-4 px-6 py-5 rounded-[1.5rem] text-slate-500 hover:text-blue-400 transition-colors"
                    >
                      <Camera size={24} />
                      <span className="font-black text-base uppercase tracking-tight">QR Scanner</span>
                    </button>
                  </div>
                </nav>

                <main className="lg:col-span-9">
                  {activeTab === 'list' ? (
                    <ParticipantList
                      participants={participants}
                      onView={setSelectedParticipant}
                      onDelete={(id) => {
                        const p = participants.find(x => x.id === id);
                        const name = p ? (p.lastName || p.firstName ? `${p.lastName} ${p.firstName}` : ((p as any).fullName || 'Legacy Guest')) : 'Unknown';
                        setDeleteModal({ isOpen: true, id, name });
                      }}
                    />
                  ) : (
                    <RegistrationForm onSuccess={handleRegistrationSuccess} />
                  )}
                </main>
              </div>
            )}
          </div>
        } />
      </Routes>

      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false, id: '', name: '' })}
        onConfirm={confirmDelete}
        itemName={deleteModal.name}
      />
    </div>
  );
};

export default App;
