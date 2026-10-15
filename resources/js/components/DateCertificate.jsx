import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Calendar, MapPin, CheckCircle2, Award } from 'lucide-react';

export default function DateCertificate({ partnerName, chosenDate, datePlan, onReset }) {
    const today = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <motion.div
            initial={{ scale: 0.85, opacity: 0, rotate: -2 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            className="w-full max-w-lg mx-auto bg-gradient-to-b from-rose-50 via-white to-pink-50 p-6 md:p-8 rounded-3xl shadow-2xl border-4 border-dashed border-rose-300 relative overflow-hidden"
        >
            {/* Stamp Badge */}
            <div className="absolute top-4 right-4 flex items-center justify-center w-16 h-16 rounded-full border-2 border-rose-400 bg-rose-100/80 text-rose-600 rotate-12 shadow-sm">
                <div className="text-center">
                    <Award className="w-5 h-5 mx-auto text-rose-500" />
                    <span className="text-[9px] font-black tracking-wider uppercase">VERIFIED</span>
                </div>
            </div>

            {/* Header */}
            <div className="text-center space-y-1 mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-600 text-xs font-semibold tracking-wide">
                    <Sparkles className="w-3.5 h-3.5" />
                    SERTIFIKAT RESMI KENCANA CINTA
                    <Sparkles className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-rose-950 font-fun">
                    Kupon Kencan Impian ✨
                </h3>
                <p className="text-xs text-rose-500 font-medium">Berlaku seumur hidup & tidak dapat dikembalikan!</p>
            </div>

            {/* Certificate Body */}
            <div className="bg-white/90 backdrop-blur rounded-2xl p-5 border border-rose-100 shadow-inner space-y-4 text-slate-700">
                <div className="text-center pb-3 border-b border-rose-100">
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Diberikan Khusus Untuk</p>
                    <p className="text-2xl font-black text-rose-600 font-fun mt-1 flex items-center justify-center gap-2">
                        <span>✨</span> {partnerName || 'Loili Cantik'} <span>💖</span>
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="flex items-start gap-2 p-2.5 rounded-xl bg-rose-50/70 border border-rose-100">
                        <Calendar className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                            <span className="font-semibold text-slate-500 block text-[10px]">TANGGAL RESMI</span>
                            <span className="font-bold text-slate-800">{today}</span>
                        </div>
                    </div>
                    <div className="flex items-start gap-2 p-2.5 rounded-xl bg-pink-50/70 border border-pink-100">
                        <MapPin className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
                        <div>
                            <span className="font-semibold text-slate-500 block text-[10px]">AGENDA FAVORIT</span>
                            <span className="font-bold text-slate-800">{datePlan || 'Jalan Santai & Makan Enak'}</span>
                        </div>
                    </div>
                </div>

                <div className="p-3 bg-gradient-to-r from-rose-100/60 to-pink-100/60 rounded-xl text-xs text-center border border-rose-200/60">
                    <p className="font-medium text-rose-900 italic">
                        "Dengan ini menyatakan telah resmi menyetujui ajakan kencan dengan status: Siap Bahagia & Salting Berdua!"
                    </p>
                </div>
            </div>

            {/* Signature Section */}
            <div className="mt-6 flex justify-between items-end px-2">
                <div className="text-center">
                    <div className="font-cursive text-2xl text-rose-600 mb-1 leading-none">Yang Mengajak</div>
                    <div className="w-24 h-0.5 bg-rose-300 mx-auto"></div>
                    <span className="text-[10px] text-slate-400 block mt-1">Pengagum Rahasiamu</span>
                </div>

                <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Resmi Disetujui
                    </div>
                </div>

                <div className="text-center">
                    <div className="font-cursive text-2xl text-rose-600 mb-1 leading-none">{partnerName}</div>
                    <div className="w-24 h-0.5 bg-rose-300 mx-auto"></div>
                    <span className="text-[10px] text-slate-400 block mt-1">Pemilik Senyum Manis</span>
                </div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex gap-2">
                <button
                    onClick={() => window.print()}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                    <Heart className="w-4 h-4 fill-white" /> Cetak / Simpan Kupon
                </button>
                <button
                    onClick={onReset}
                    className="py-2.5 px-4 rounded-xl bg-white hover:bg-rose-50 text-slate-600 font-semibold text-xs border border-rose-200 transition-colors"
                >
                    Ulangi Kuis
                </button>
            </div>
        </motion.div>
    );
}
