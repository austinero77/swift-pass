
import React, { useState } from 'react';
import { Participant, TicketType } from '../types';
import { Search, Eye, Trash2, User, Users, CheckCircle, Copy, Check } from 'lucide-react';
import { Button } from './ui/Button';

interface ParticipantListProps {
  participants: Participant[];
  onView: (p: Participant) => void;
  onDelete: (id: string) => void;
}

export const ParticipantList: React.FC<ParticipantListProps> = ({ participants, onView, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyId = (id: string) => {
    if (!id) return;
    const shortId = id.split('-')[0].toUpperCase();
    navigator.clipboard.writeText(shortId);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = participants.filter(p => {
    const query = searchTerm.toLowerCase();
    const fName = (p.firstName || '').toLowerCase();
    const lName = (p.lastName || '').toLowerCase();
    const fullName = ((p as any).fullName || '').toLowerCase();
    const pId = (p.id || '').toLowerCase();

    return fName.includes(query) ||
      lName.includes(query) ||
      fullName.includes(query) ||
      pId.includes(query);
  });

  return (
    <div className="space-y-6">
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
        <input
          type="text"
          placeholder="Search registrations..."
          className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all backdrop-blur-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-slate-800/40 border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/60 text-slate-500 text-[10px] uppercase tracking-widest font-black border-b border-slate-700/50">
                <th className="px-6 py-5">Guest Name</th>
                <th className="px-6 py-5">Ticket ID</th>
                <th className="px-6 py-5">Category</th>
                <th className="px-6 py-5">Total</th>
                <th className="px-6 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {filtered.length > 0 ? filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-700/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${p.ticketType === TicketType.FAMILY ? 'bg-purple-500/10 text-purple-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                        {p.ticketType === TicketType.FAMILY ? <Users size={18} /> : <User size={18} />}
                      </div>
                      <div className="text-white font-bold text-sm tracking-tight uppercase">
                        {p.lastName || p.firstName ? `${p.lastName} ${p.firstName}` : ((p as any).fullName || 'Unknown')}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => copyId(p.id)}
                      className="flex items-center gap-2 text-slate-400 font-mono text-[11px] hover:text-blue-400 transition-colors bg-slate-900/40 px-2 py-1 rounded-lg border border-white/5"
                    >
                      {(p.id || '').split('-')[0].toUpperCase()}
                      {copiedId === p.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter ${p.ticketType === TicketType.FAMILY ? 'bg-purple-500/20 text-purple-300' : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                        {p.ticketType}
                      </span>
                      <span className="text-slate-500 text-xs font-bold">x{p.familySize || 1}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-white font-black text-sm">₦{(p.totalPrice || 0).toLocaleString()}</div>
                    {p.isVerified && <span className="text-emerald-400 text-[8px] font-black uppercase tracking-widest block mt-1">Check-in OK</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => onView(p)} className="p-2 text-slate-400 hover:text-white">
                        <Eye size={18} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onDelete(p.id)} className="p-2 text-slate-600 hover:text-rose-400">
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-500 text-sm font-medium uppercase tracking-widest">No matching records</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-4">
        {filtered.length > 0 ? filtered.map((p) => (
          <div key={p.id} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4 animate-in fade-in duration-300">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl ${p.ticketType === TicketType.FAMILY ? 'bg-purple-500/10 text-purple-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                  {p.ticketType === TicketType.FAMILY ? <Users size={20} /> : <User size={20} />}
                </div>
                <div>
                  <h3 className="text-white font-black text-base uppercase tracking-tight leading-tight">
                    {p.lastName || p.firstName ? <>{p.lastName}<br />{p.firstName}</> : ((p as any).fullName || 'UNKNOWN GUEST')}
                  </h3>
                  <button
                    onClick={() => copyId(p.id)}
                    className="flex items-center gap-2 text-slate-500 font-mono text-[10px] mt-1 hover:text-blue-400"
                  >
                    #{(p.id || '').split('-')[0].toUpperCase()}
                    {copiedId === p.id ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                  </button>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${p.ticketType === TicketType.FAMILY ? 'bg-purple-500/20 text-purple-300' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                {p.ticketType} x{p.familySize || 1}
              </span>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Paid</p>
                <p className="text-xl font-black text-white">₦{(p.totalPrice || 0).toLocaleString()}</p>
                {p.isVerified && <span className="text-emerald-400 text-[8px] font-black uppercase tracking-widest block mt-1 flex items-center gap-1"><CheckCircle size={10} /> Checked-in</span>}
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => onView(p)} className="p-3 rounded-xl bg-slate-800 text-white shadow-none">
                  <Eye size={20} />
                </Button>
                <Button variant="secondary" size="sm" onClick={() => onDelete(p.id)} className="p-3 rounded-xl bg-rose-500/10 text-rose-500 shadow-none">
                  <Trash2 size={20} />
                </Button>
              </div>
            </div>
          </div>
        ))
          // : (
          //   <div className="text-center py-10 text-slate-500 text-xs font-black uppercase tracking-widest">No : Zero Results</div>
          // )
          : (
            <tr>
              <td colSpan={4} className="px-6 py-16 text-center">
                <div className="flex flex-col items-center gap-2 text-slate-500">
                  <Search size={32} className="opacity-20 mb-2" />
                  <p className="text-sm font-medium">No registrations found in the database.</p>
                </div>
              </td>
            </tr>
          )
        }
      </div>
    </div>
  );
};
