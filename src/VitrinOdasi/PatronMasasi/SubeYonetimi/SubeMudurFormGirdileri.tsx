import React from 'react';
import { Phone, Lock, User } from 'lucide-react';

interface FormGirdileriProps {
  adSoyad: string;
  telefon: string;
  sifre: string;
  onAdChange: (v: string) => void;
  onTelefonChange: (v: string) => void;
  onSifreChange: (v: string) => void;
}

export const SubeMudurFormGirdileri: React.FC<FormGirdileriProps> = ({
  adSoyad, telefon, sifre, onAdChange, onTelefonChange, onSifreChange
}) => (
  <div className="space-y-3 text-xs">
    <div>
      <label className="text-gray-300 font-bold block mb-1">Müdür Adı Soyadı *</label>
      <div className="relative">
        <User className="w-4 h-4 text-purple-400 absolute left-3 top-2.5" />
        <input type="text" required value={adSoyad} onChange={e => onAdChange(e.target.value)}
          placeholder="Örn: Ahmet Usta"
          className="w-full bg-[#120415] border border-purple-900/80 rounded-xl pl-9 pr-3 py-2 text-white" />
      </div>
    </div>
    <div>
      <label className="text-gray-300 font-bold block mb-1">Telefon Numarası (Giriş Kimliği) *</label>
      <div className="relative">
        <Phone className="w-4 h-4 text-purple-400 absolute left-3 top-2.5" />
        <input type="tel" required value={telefon} onChange={e => onTelefonChange(e.target.value)}
          placeholder="0555 123 45 67"
          className="w-full bg-[#120415] border border-purple-900/80 rounded-xl pl-9 pr-3 py-2 text-white" />
      </div>
    </div>
    <div>
      <label className="text-gray-300 font-bold block mb-1">Giriş Şifresi *</label>
      <div className="relative">
        <Lock className="w-4 h-4 text-purple-400 absolute left-3 top-2.5" />
        <input type="text" required value={sifre} onChange={e => onSifreChange(e.target.value)}
          placeholder="Örn: 1234"
          className="w-full bg-[#120415] border border-purple-900/80 rounded-xl pl-9 pr-3 py-2 text-white" />
      </div>
    </div>
  </div>
);
