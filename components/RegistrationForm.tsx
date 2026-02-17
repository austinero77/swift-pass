
import React, { useState, useEffect } from 'react';
import { TicketType, Participant } from '../types';
import { Button } from './ui/Button';
import { storageService } from '../services/storageService';
import { UserPlus, Calculator, Tag, Users } from 'lucide-react';
import { Toaster, toast } from 'sonner';

export const RegistrationForm: React.FC<{ onSuccess: (p: Participant) => void }> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    ticketType: TicketType.INDIVIDUAL,
    familySize: 1,
    pricePerTicket: 7000,
    discount: 3000
  });

  const [total, setTotal] = useState(7000);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const base = formData.pricePerTicket * formData.familySize;
    const discountToApply = formData.ticketType === TicketType.FAMILY ? formData.discount : 0;
    setTotal(Math.max(0, base - discountToApply));
  }, [formData]);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);


    try {
      const cleanFirstName = formData.firstName.trim().toUpperCase();
      const cleanLastName = formData.lastName.trim().toUpperCase();

      const newParticipant: Participant = {
        id: crypto.randomUUID(),
        ...formData,
        firstName: cleanFirstName,
        lastName: cleanLastName,
        discount: formData.ticketType === TicketType.FAMILY ? formData.discount : 0,
        totalPrice: total,
        registrationDate: new Date().toISOString(),
        isVerified: false
      };

      // Attempt to save
      await storageService.saveParticipant(newParticipant);

      // If successful:
      toast.success("Ticket generated successfully!")

      onSuccess(newParticipant);


    } catch (error) {
      console.error("Submission failed:", error);

      toast.error(`Failed to save ticket. ${error}.`);
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleNumericChange = (field: string, value: string) => {
    // If empty string, set to 0 to allow typing, but keep as empty in logic if needed
    // Actually, setting to 0 works better if we handle the display logic
    const numValue = value === '' ? 0 : parseFloat(value);
    setFormData(prev => ({ ...prev, [field]: numValue }));
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <UserPlus className="text-blue-400" size={24} />
        </div>
        <h2 className="text-xl font-bold text-white">New Registration</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2 uppercase text-[10px] tracking-widest font-bold">First Name</label>
            <input
              type="text"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all uppercase"
              placeholder="CHINUA"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2 uppercase text-[10px] tracking-widest font-bold">Last Name</label>
            <input
              type="text"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all uppercase"
              placeholder="ACHEBE"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2 uppercase text-[10px] tracking-widest font-bold">Ticket Category</label>
            <select
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={formData.ticketType}
              onChange={(e) => {
                const val = e.target.value as TicketType;
                setFormData({
                  ...formData,
                  ticketType: val,
                  familySize: val === TicketType.INDIVIDUAL ? 1 : Math.max(2, formData.familySize)
                });
              }}
            >
              <option value={TicketType.INDIVIDUAL}>Individual</option>
              <option value={TicketType.FAMILY}>Family / Group</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2 uppercase text-[10px] tracking-widest font-bold">
              {formData.ticketType === TicketType.INDIVIDUAL ? 'Number of Tickets' : 'Group Size'}
            </label>
            <div className="relative">
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="number"
                min={formData.ticketType === TicketType.FAMILY ? 2 : 1}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={formData.familySize || ''}
                onChange={(e) => handleNumericChange('familySize', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className={`grid grid-cols-1 ${formData.ticketType === TicketType.FAMILY ? 'sm:grid-cols-2' : ''} gap-4`}>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2 uppercase text-[10px] tracking-widest font-bold">Price Per Ticket (₦)</label>
            <div className="relative">
              <Calculator className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="number"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={formData.pricePerTicket || ''}
                onChange={(e) => handleNumericChange('pricePerTicket', e.target.value)}
              />
            </div>
          </div>

          {formData.ticketType === TicketType.FAMILY && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-sm font-medium text-slate-400 mb-2 uppercase text-[10px] tracking-widest font-bold">Total Discount (₦)</label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="number"
                  min="0"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={formData.discount || ''}
                  onChange={(e) => handleNumericChange('discount', e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-900/80 rounded-xl border border-blue-500/20 flex justify-between items-center">
          <div>
            <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">Checkout Total</p>
            <p className="text-sm text-slate-400">
              {formData.familySize} x ₦{formData.pricePerTicket.toLocaleString()}
              {formData.ticketType === TicketType.FAMILY && formData.discount > 0 && ` - ₦${formData.discount.toLocaleString()}`}
            </p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-white">₦{total.toLocaleString()}</span>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full py-4 text-lg font-bold"
          isLoading={isSubmitting}
        >
          Generate Ticket
        </Button>
      </form>

    </div>

  );
};
