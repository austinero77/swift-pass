
import React, { useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react'; // QRCodeSVG,
import { Participant, TicketType } from '../types';
import { Button } from './ui/Button';
import { Download, CheckCircle2, MapPin, Calendar, Clock, ReceiptText, Copy, Check, Share2, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Toaster, toast } from 'sonner';

interface TicketCardProps {
  participant: Participant;
  onExit: () => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({ participant, onExit }) => {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const currentUrl = window.location.href.split('#')[0];
  const verificationUrl = `${currentUrl}#/verify/${participant.id}`;

  const isFamily = participant.ticketType === TicketType.FAMILY;
  const shortId = participant.id.split('-')[0].toUpperCase();

  const copyId = () => {
    navigator.clipboard.writeText(shortId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPDF = async () => {
    if (!ticketRef.current || isDownloading) return;

    setIsDownloading(true); // Start loader
    try {
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: '#0f172a',
        scale: 2,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`swiftpass-${shortId}.pdf`);
    } catch (e) {
      toast.error(`Failed to generate PDF ${e}`);
    } finally {
      setIsDownloading(false); // Stop loader
    }
  };

  const sharePDF = async () => {
    if (!ticketRef.current || isSharing) return;

    setIsSharing(true); // Start loader

    try {
      // 1. Same logic as your download
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: '#0f172a',
        scale: 2,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);

      // 2. Convert PDF to a Blob instead of downloading
      const pdfBlob = pdf.output('blob');
      const fileName = `swiftpass-${shortId}.pdf`;
      const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

      // 3. Trigger Native Share
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'SwiftPass Ticket',
          text: `Here is the ticket for ${participant.firstName} ${participant.lastName}`,
        });
      } else {
        // Fallback if browser doesn't support file sharing (e.g. some Desktop browsers)
        // pdf.save(fileName);
        toast.info("Sharing not supported on this browser. File downloaded instead.");
      }
    } catch (error) {
      console.error("Error sharing PDF:", error);
      toast.error("Could not open share menu.");
    } finally {
      setIsSharing(false); // Stop loader
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div
        ref={ticketRef}
        className={`relative w-full rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ${isFamily ? 'bg-gradient-to-br from-indigo-900 to-purple-900' : 'bg-gradient-to-br from-emerald-900 to-cyan-900'
          }`}
      >
        {/* Top Perforation Circles */}
        <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-slate-950 rounded-full z-10"></div>
        <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-slate-950 rounded-full z-10"></div>

        {/* Dash Perforation Line */}
        <div className="absolute top-1/2 left-0 w-full border-t-2 border-dashed border-white/20 z-0"></div>

        <div className="p-8 border-b border-white/10 flex justify-between items-start">
          <div>

            <h2 className="text-2xl font-bold text-white tracking-tight"><span className="text-yellow-400">CGDC</span> Picnic<span className="text-blue-400">PASS</span></h2>
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Official E-Ticket</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${isFamily ? 'bg-purple-500/20 text-purple-300' : 'bg-emerald-500/20 text-emerald-300'
            }`}>
            {participant.ticketType} Category
          </div>
        </div>

        {/* Top Stub */}
        <div className="p-8 pb-10 space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-white/40 text-[9px] uppercase font-black mb-1 tracking-widest">Main Attendee</p>
              <h3 className="text-1xl font-black text-white leading-tight uppercase">
                {participant.firstName} {participant.lastName}
              </h3>
            </div>
            <div className="text-right group">
              <p className="text-white/40 text-[9px] uppercase font-black mb-1 tracking-widest">Pass ID</p>
              <button
                onClick={copyId}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-all px-2 py-1 rounded-lg text-sm font-mono text-blue-400 font-bold border border-white/5"
              >
                #{shortId}
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-white/40 text-[9px] uppercase font-black mb-1 tracking-widest">Quantity</p>
              <div className="flex items-center text-white gap-2">
                <span className="font-bold text-md">{participant.familySize} PAX</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/40 text-[9px] uppercase font-black mb-1 tracking-widest">Status</p>
              <div className="flex items-center justify-end text-emerald-400 gap-1">
                <CheckCircle2 size={16} />
                <span className="font-black text-sm uppercase">Secure</span>
              </div>
            </div>
          </div>
          <p className="text-[8px] font-bold text-white/70 uppercase tracking-[0.3em]">ADDRESS : ALAUSA, SECRETARIATE IKEJA,LAGOS.</p>
          <div className="bg-black/10 p-4 flex justify-center items-center gap-2 border-t border-white/5">
            <MapPin size={14} className="text-yellow-400" />
            <span className="text-[6px] font-bold text-yellow-400 uppercase tracking-[0.3em]">Venue: JOHNSON  JAKANDE TINUBU PARK</span>
          </div>
        </div>



        {/* Bottom Stub */}
        <div className="p-8 pt-10 space-y-6">
          {/* <div className="flex justify-center p-6 bg-white rounded-3xl shadow-xl transform hover:scale-105 transition-transform duration-300"> */}
          <div className="flex justify-center p-6 bg-white rounded-3xl shadow-xl md:hover:scale-105 transition-transform duration-300">

            <QRCodeCanvas
              value={verificationUrl}
              size={150}
              includeMargin={false}
              level="H"
              fgColor="#0f172a"
              bgColor="#ffffff"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white/70 text-xs font-bold uppercase">
                <Calendar size={14} className="text-blue-400" />
                <span>March 20, 2026</span>
              </div>
              <div className="flex items-center gap-2 text-white/70 text-xs font-bold uppercase">
                <Clock size={14} className="text-blue-400" />
                <span>08:00 AM</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/40 text-[9px] uppercase font-black mb-1 tracking-widest">Total Value</p>
              <p className="text-2xl font-black text-white leading-none">₦{participant.totalPrice.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-black/30 p-6 flex justify-center items-center gap-2 border-t border-white/5">
          <MapPin size={14} className="text-white/40" />
          <span className="text-[7px] font-bold text-white/50 uppercase tracking-[0.3em]">JOHNSON JAKANDE TINUBU PARK • Lagos</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Button
          variant="primary"
          className="flex-1 gap-2 py-4 font-bold text-base shadow-xl disabled:opacity-70"
          onClick={downloadPDF}
          disabled={isDownloading || isSharing}
        >
          {/* <Download size={20} />
          Download PDf */}

          {isDownloading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <Download size={20} />
          )}
          {isDownloading ? "Generating..." : "Download PDF"}

        </Button>

        <Button
          variant="primary"
          className="flex-1 gap-2 py-4 font-bold text-base bg-emerald-600 hover:bg-emerald-700 shadow-xl border-none disabled:opacity-70"
          onClick={sharePDF}
          disabled={isDownloading || isSharing}
        >
          {/* <Share2 size={20} />
          Share Ticket */}
          {isSharing ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <Share2 size={20} />
          )}
          {isSharing ? "Preparing..." : "Share Ticket"}
        </Button>

        {/* <Button
          variant="outline"
          className="flex-1 py-4 font-bold text-base border-slate-700 text-slate-300"
          onClick={onExit}
        >
          Return to Hub
        </Button> */}
      </div>
    </div>
  );
};
