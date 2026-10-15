import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
    Cat,
    Smile,
    Sparkles,
    Heart,
    Send,
    RotateCcw,
    Calendar,
    Utensils,
    Flame,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    ArrowLeft
} from 'lucide-react';
import { sounds } from './utils/soundEffects';
import MusicPlayer from './components/MusicPlayer';

// ============================================================================
// KONFIGURASI NOMOR WHATSAPP (Ubah nomor di bawah ini dengan format: 628...)
// ============================================================================
const WA_PHONE_NUMBER = "+62895391643059"; // <-- Ganti dengan nomor WhatsApp kamu!

const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];
const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const WEEKDAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export default function Survey() {
    // State Navigasi Antar Layar (1 sampai 6)
    const [currentStep, setCurrentStep] = useState(1);

    // State Penyimpanan Jawaban Pengguna
    const [answers, setAnswers] = useState({
        busyLevel: '',
        askAnswer: '',
        dateActivity: '',
        dateDay: '',
    });

    // State untuk Custom Date Picker (Step 5)
    const [isCustomDateMode, setIsCustomDateMode] = useState(false);
    const [viewDate, setViewDate] = useState(() => new Date());
    const [clickedDateKey, setClickedDateKey] = useState(null);
    const [selectedDateFeedback, setSelectedDateFeedback] = useState('');

    // State Trick Button "Nggak Dulu" (Step 3)
    const [dodgePos, setDodgePos] = useState({ x: 0, y: 0 });
    const [dodgeAttempts, setDodgeAttempts] = useState(0);
    const trickContainerRef = useRef(null);

    // Animasi Confetti saat Layar Sukses (Step 6) Muncul
    useEffect(() => {
        if (currentStep === 6) {
            // Ledakan confetti awal
            confetti({
                particleCount: 90,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#f43f5e', '#ec4899', '#fb7185', '#f472b6', '#fef08a']
            });

            // Tembakan samping kiri & kanan
            const timer1 = setTimeout(() => {
                confetti({
                    particleCount: 50,
                    angle: 60,
                    spread: 60,
                    origin: { x: 0 },
                    colors: ['#fb7185', '#fda4af', '#fed7aa']
                });
            }, 250);

            const timer2 = setTimeout(() => {
                confetti({
                    particleCount: 50,
                    angle: 120,
                    spread: 60,
                    origin: { x: 1 },
                    colors: ['#ec4899', '#f472b6', '#fbcfe8']
                });
            }, 450);

            // Simpan juga ke backend Laravel secara otomatis
            try {
                fetch('/api/save-response', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                    },
                    body: JSON.stringify({
                        respondent_name: 'Gebetan Gemes',
                        answers: answers,
                        final_answer: 'MAUUU BANGET! 🙋‍♀️',
                        chosen_date_activity: answers.dateActivity,
                        message: `Jadwal: ${answers.dateDay}`
                    })
                }).catch(() => { });
            } catch (err) { }

            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
            };
        }
    }, [currentStep]);

    // Handle Trick Button "Nggak Dulu" menghindar saat disentuh / didekati
    const handleTrickDodge = () => {
        setDodgeAttempts((prev) => prev + 1);

        const container = trickContainerRef.current;
        if (container) {
            const rect = container.getBoundingClientRect();
            // Jangkauan perpindahan acak dalam batas container
            const maxX = Math.max(40, (rect.width - 120) / 2);
            const maxY = Math.max(30, (rect.height - 80) / 2);

            const newX = (Math.random() * 2 - 1) * maxX;
            const newY = (Math.random() * 2 - 1) * maxY;

            setDodgePos({ x: newX, y: newY });
        } else {
            // Fallback offset jika container ref belum terukur
            const randomX = (Math.random() - 0.5) * 180;
            const randomY = (Math.random() - 0.5) * 120;
            setDodgePos({ x: randomX, y: randomY });
        }
    };

    // Fungsi kirim hasil ke WhatsApp
    const handleRedirectWhatsApp = () => {
        const cleanPhone = WA_PHONE_NUMBER.replace(/[^0-9]/g, '');
        const textMessage = `Halo! Aku udah isi surveinya. Aku mau diajak jalan buat ${answers.dateActivity || 'jalan seru'} di hari ${answers.dateDay || 'weekend'}! Kapan nih?`;
        const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(textMessage)}`;
        window.open(waUrl, '_blank');
    };

    // Helper navigasi bulan kalender
    const handlePrevMonth = () => {
        try { sounds.playPop(); } catch (e) { }
        setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        try { sounds.playPop(); } catch (e) { }
        setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    // Handler saat tanggal pada kalender diklik
    const handleSelectDate = (year, month, day) => {
        const selectedDate = new Date(year, month, day);
        const dateKey = `${year}-${month}-${day}`;
        setClickedDateKey(dateKey);

        const formatted = `${DAY_NAMES[selectedDate.getDay()]}, ${day} ${MONTH_NAMES[month]} ${year}`;
        setSelectedDateFeedback(formatted);

        try { sounds.playDing(); } catch (e) { }

        confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.65 },
            colors: ['#f43f5e', '#ec4899', '#fb7185', '#f472b6', '#fef08a']
        });

        setTimeout(() => {
            setAnswers((prev) => ({ ...prev, dateDay: formatted }));
            setIsCustomDateMode(false);
            setCurrentStep(6);
        }, 850);
    };

    // Handler jika memilih tanggal via native date input
    const handleNativeDateChange = (e) => {
        const val = e.target.value;
        if (!val) return;
        const [y, m, d] = val.split('-').map(Number);
        handleSelectDate(y, m - 1, d);
    };

    // Reset Survei
    const handleRestart = () => {
        setAnswers({
            busyLevel: '',
            askAnswer: '',
            dateActivity: '',
            dateDay: '',
        });
        setDodgePos({ x: 0, y: 0 });
        setDodgeAttempts(0);
        setIsCustomDateMode(false);
        setClickedDateKey(null);
        setSelectedDateFeedback('');
        setCurrentStep(1);
    };

    // Variasi teks lucu saat tombol "Nggak Dulu" kabur
    const dodgeRemarks = [
        'Nggak Dulu',
        'Yakin nih? 🥺',
        'Eits, gabisa diklik! 😜',
        'Tombol ini mogok kerja 🏃💨',
        'Mau aja kan yaa? 💖'
    ];

    // Perhitungan Tanggal Kalender (Step 5)
    const currentYear = viewDate.getFullYear();
    const currentMonth = viewDate.getMonth();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);
    const monthDays = Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1);

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-rose-50 via-pink-100 to-rose-100 flex items-center justify-center p-4 font-sans text-slate-800 selection:bg-pink-400 selection:text-white">
            {/* Musik Pengiring Romantis: Raim Laode - "Dunia Yang Nanti" */}
            <MusicPlayer />

            {/* Mobile-First Card Frame */}
            <div className="w-full max-w-sm sm:max-w-md bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-soft border border-pink-200/70 relative overflow-hidden flex flex-col justify-between min-h-[580px]">

                {/* Header & Progress Indicator */}
                <div className="w-full mb-6">
                    <div className="flex items-center justify-between text-xs font-semibold text-pink-400 mb-2">
                        <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-pink-500">
                            <Sparkles className="w-3.5 h-3.5" /> Survei Gemes
                        </span>
                        <span>Langkah {currentStep} dari 6</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-pink-100 rounded-full overflow-hidden p-0.5">
                        <motion.div
                            className="h-full bg-gradient-to-r from-pink-400 to-rose-500 rounded-full"
                            initial={{ width: '16%' }}
                            animate={{ width: `${(currentStep / 6) * 100}%` }}
                            transition={{ type: 'spring', stiffness: 220, damping: 20 }}
                        />
                    </div>
                </div>

                {/* Body / Screen Switcher dengan Bouncy Framer Motion */}
                <div className="flex-1 flex flex-col justify-center">
                    <AnimatePresence mode="wait">

                        {/* STEP 1: Landing Screen */}
                        {currentStep === 1 && (
                            <motion.div
                                key="step-1"
                                initial={{ opacity: 0, y: 25, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -25, scale: 0.95 }}
                                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                                className="text-center space-y-6"
                            >
                                <motion.div
                                    animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
                                    transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
                                    className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-pink-300 to-rose-200 flex items-center justify-center shadow-lg shadow-pink-200/60"
                                >
                                    <Cat className="w-14 h-14 text-pink-600 stroke-[2.2]" />
                                </motion.div>

                                <div className="space-y-2">
                                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight leading-snug">
                                        Haloo! ✨
                                    </h1>
                                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed px-2">
                                        Ada survei super penting nih yang butuh jawaban jujur dari kamu. 🐱💖
                                    </p>
                                </div>

                                <div className="pt-4">
                                    <motion.button
                                        whileHover={{ scale: 1.04, y: -2 }}
                                        whileTap={{ scale: 0.96 }}
                                        onClick={() => setCurrentStep(2)}
                                        className="w-full py-4 px-6 rounded-3xl bg-gradient-to-r from-pink-400 to-rose-500 hover:from-pink-500 hover:to-rose-600 text-white font-bold text-base shadow-lg shadow-pink-300/50 transition-all flex items-center justify-center gap-2"
                                    >
                                        <span>Mulai Survei 🚀</span>
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: Cek Kesibukan */}
                        {currentStep === 2 && (
                            <motion.div
                                key="step-2"
                                initial={{ opacity: 0, y: 25, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -25, scale: 0.95 }}
                                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                                className="space-y-6"
                            >
                                <div className="text-center space-y-1">
                                    <span className="text-xs font-bold uppercase tracking-wider text-pink-500 bg-pink-100 px-3 py-1 rounded-full">
                                        Pertanyaan 1
                                    </span>
                                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 pt-2 leading-snug">
                                        Skala 1-10, seberapa sibuk hidup kamu minggu ini?
                                    </h2>
                                </div>

                                <div className="space-y-3 pt-2">
                                    {[
                                        { id: 'A', text: 'Sibuk banget, butuh healing 🤯' },
                                        { id: 'B', text: 'Lumayan, rutinitas biasa 🚶‍♀️' },
                                        { id: 'C', text: 'Santai kok 🦦' },
                                    ].map((opt) => (
                                        <motion.button
                                            key={opt.id}
                                            whileHover={{ scale: 1.02, x: 3 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => {
                                                setAnswers((prev) => ({ ...prev, busyLevel: opt.text }));
                                                setCurrentStep(3);
                                            }}
                                            className="w-full p-4 rounded-3xl bg-pink-50/80 hover:bg-pink-100/90 text-slate-700 hover:text-pink-900 border border-pink-200/80 text-left font-semibold text-sm sm:text-base transition-all shadow-sm flex items-center justify-between"
                                        >
                                            <span>{opt.text}</span>
                                            <span className="text-xs bg-white text-pink-500 w-6 h-6 rounded-full flex items-center justify-center font-bold shadow-xs">
                                                {opt.id}
                                            </span>
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: The Ask (Pertanyaan Inti - WAJIB ADA TRICK BUTTON) */}
                        {currentStep === 3 && (
                            <motion.div
                                key="step-3"
                                initial={{ opacity: 0, y: 25, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -25, scale: 0.95 }}
                                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                                className="space-y-6"
                            >
                                <div className="text-center space-y-1">
                                    <span className="text-xs font-bold uppercase tracking-wider text-rose-500 bg-rose-100 px-3 py-1 rounded-full">
                                        Pertanyaan Spesial 💘
                                    </span>
                                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 pt-2 leading-snug">
                                        Karena kamu butuh refreshing, kalau aku ajak jalan weekend ini, jawaban kamu...
                                    </h2>
                                </div>

                                {/* Container Interaktif dengan Trick Button */}
                                <div
                                    ref={trickContainerRef}
                                    className="relative min-h-[190px] flex flex-col items-center justify-center gap-4 pt-4"
                                >
                                    {/* Tombol 1: MAUUU BANGET! 🙋‍♀️ (Warna pink terang, memikat & bouncy) */}
                                    <motion.button
                                        whileHover={{ scale: 1.07 }}
                                        whileTap={{ scale: 0.94 }}
                                        onClick={() => {
                                            setAnswers((prev) => ({ ...prev, askAnswer: 'MAUUU BANGET! 🙋‍♀️' }));
                                            setCurrentStep(4);
                                        }}
                                        className="w-full py-4 px-6 rounded-3xl bg-gradient-to-r from-pink-400 via-rose-500 to-pink-500 hover:from-pink-500 hover:to-rose-600 text-white font-extrabold text-base sm:text-lg shadow-lg shadow-pink-300/60 transition-all z-10 cursor-pointer flex items-center justify-center gap-2"
                                    >
                                        <Heart className="w-5 h-5 fill-white" />
                                        <span>MAUUU BANGET! 🙋‍♀️</span>
                                    </motion.button>

                                    {/* Tombol 2: Nggak Dulu (Trick Button dengan Absolute Positioning & Dodge) */}
                                    <motion.button
                                        animate={{
                                            x: dodgePos.x,
                                            y: dodgePos.y,
                                        }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 420,
                                            damping: 20,
                                        }}
                                        onMouseEnter={handleTrickDodge}
                                        onTouchStart={handleTrickDodge}
                                        onClick={handleTrickDodge}
                                        className="py-2.5 px-5 rounded-3xl bg-slate-200/90 hover:bg-slate-300 text-slate-600 font-semibold text-xs sm:text-sm border border-slate-300 select-none shadow-sm cursor-pointer z-20"
                                    >
                                        {dodgeRemarks[dodgeAttempts % dodgeRemarks.length]}
                                    </motion.button>
                                </div>

                                {dodgeAttempts > 0 && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-xs text-pink-500 text-center font-medium italic"
                                    >
                                        Hihihi tombolnya gamau diklik tuh, pilih yang pink aja ya! 😜
                                    </motion.p>
                                )}
                            </motion.div>
                        )}

                        {/* STEP 4: Preferensi Kencan */}
                        {currentStep === 4 && (
                            <motion.div
                                key="step-4"
                                initial={{ opacity: 0, y: 25, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -25, scale: 0.95 }}
                                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                                className="space-y-6"
                            >
                                <div className="text-center space-y-1">
                                    <span className="text-xs font-bold uppercase tracking-wider text-pink-500 bg-pink-100 px-3 py-1 rounded-full">
                                        Pertanyaan 3
                                    </span>
                                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 pt-2 leading-snug">
                                        Kalau jalan, kamu tipe yang lebih suka ngapain nih?
                                    </h2>
                                </div>

                                <div className="space-y-3 pt-2">
                                    {[
                                        { id: 'A', text: 'Makan cantik / Kulineran 🍜' },
                                        { id: 'B', text: 'Nonton bioskop 🍿' },
                                        { id: 'C', text: 'Nongkrong di cafe aesthetic ☕' },
                                    ].map((opt) => (
                                        <motion.button
                                            key={opt.id}
                                            whileHover={{ scale: 1.02, x: 3 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => {
                                                setAnswers((prev) => ({ ...prev, dateActivity: opt.text }));
                                                setCurrentStep(5);
                                            }}
                                            className="w-full p-4 rounded-3xl bg-pink-50/80 hover:bg-pink-100/90 text-slate-700 hover:text-pink-900 border border-pink-200/80 text-left font-semibold text-sm sm:text-base transition-all shadow-sm flex items-center justify-between"
                                        >
                                            <span>{opt.text}</span>
                                            <span className="text-xs bg-white text-pink-500 w-6 h-6 rounded-full flex items-center justify-center font-bold shadow-xs">
                                                {opt.id}
                                            </span>
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 5: Penentuan Jadwal */}
                        {currentStep === 5 && (
                            <motion.div
                                key="step-5"
                                initial={{ opacity: 0, y: 25, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -25, scale: 0.95 }}
                                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                                className="space-y-4"
                            >
                                <AnimatePresence mode="wait">
                                    {!isCustomDateMode ? (
                                        <motion.div
                                            key="date-options"
                                            initial={{ opacity: 0, x: -15 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 15 }}
                                            transition={{ duration: 0.2 }}
                                            className="space-y-4"
                                        >
                                            <div className="text-center space-y-1">
                                                <span className="text-xs font-bold uppercase tracking-wider text-pink-500 bg-pink-100 px-3 py-1 rounded-full">
                                                    Pertanyaan Terakhir 🗓️
                                                </span>
                                                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 pt-2 leading-snug">
                                                    Catat ya! Kira-kira hari apa yang paling asyik?
                                                </h2>
                                            </div>

                                            <div className="space-y-3 pt-1">
                                                {/* Pilihan 1: Sabtu */}
                                                <motion.button
                                                    whileHover={{ scale: 1.02, x: 3 }}
                                                    whileTap={{ scale: 0.97 }}
                                                    onClick={() => {
                                                        try { sounds.playDing(); } catch (e) { }
                                                        setAnswers((prev) => ({ ...prev, dateDay: 'Sabtu ini dong! ✨' }));
                                                        setCurrentStep(6);
                                                    }}
                                                    className="w-full p-4 rounded-3xl bg-pink-50/80 hover:bg-pink-100/90 text-slate-700 hover:text-pink-900 border border-pink-200/80 text-left font-semibold text-sm sm:text-base transition-all shadow-sm flex items-center justify-between cursor-pointer"
                                                >
                                                    <span>Sabtu (Vibe paling santai ✨)</span>
                                                    <Calendar className="w-4 h-4 text-pink-400" />
                                                </motion.button>

                                                {/* Pilihan 2: Minggu */}
                                                <motion.button
                                                    whileHover={{ scale: 1.02, x: 3 }}
                                                    whileTap={{ scale: 0.97 }}
                                                    onClick={() => {
                                                        try { sounds.playDing(); } catch (e) { }
                                                        setAnswers((prev) => ({ ...prev, dateDay: 'Minggu (Bisa recharge energi 🌅)' }));
                                                        setCurrentStep(6);
                                                    }}
                                                    className="w-full p-4 rounded-3xl bg-pink-50/80 hover:bg-pink-100/90 text-slate-700 hover:text-pink-900 border border-pink-200/80 text-left font-semibold text-sm sm:text-base transition-all shadow-sm flex items-center justify-between cursor-pointer"
                                                >
                                                    <span>Minggu (Bisa recharge energi 🌅)</span>
                                                    <Calendar className="w-4 h-4 text-pink-400" />
                                                </motion.button>

                                                {/* Pilihan 3: Custom Date Picker dengan Animasi */}
                                                <motion.button
                                                    whileHover={{ scale: 1.02, x: 3 }}
                                                    whileTap={{ scale: 0.96 }}
                                                    onClick={() => {
                                                        try { sounds.playPop(); } catch (e) { }
                                                        setIsCustomDateMode(true);
                                                    }}
                                                    className="w-full p-4 rounded-3xl bg-gradient-to-r from-rose-50 via-pink-50 to-pink-100/70 hover:from-rose-100/80 hover:to-pink-200/80 text-pink-900 border-2 border-dashed border-pink-300 hover:border-pink-500 font-bold text-sm sm:text-base transition-all shadow-sm flex items-center justify-between cursor-pointer group"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping" />
                                                        <span>Pilih tanggal sendiri yuk! 📅✨</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-pink-600 font-extrabold bg-white/90 px-3 py-1 rounded-full border border-pink-200 shadow-xs group-hover:bg-pink-500 group-hover:text-white transition-all">
                                                        <span>Buka Kalender</span>
                                                        <Calendar className="w-3.5 h-3.5" />
                                                    </div>
                                                </motion.button>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="calendar-picker"
                                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: -15 }}
                                            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                                            className="space-y-3"
                                        >
                                            <div className="flex items-center justify-between">
                                                <button
                                                    onClick={() => {
                                                        try { sounds.playPop(); } catch (e) { }
                                                        setIsCustomDateMode(false);
                                                    }}
                                                    className="flex items-center gap-1 text-xs font-bold text-pink-700 hover:text-pink-900 bg-pink-100/80 px-2.5 py-1 rounded-full border border-pink-200 transition-all cursor-pointer"
                                                >
                                                    <ArrowLeft className="w-3.5 h-3.5" />
                                                    <span>Kembali</span>
                                                </button>
                                                <span className="text-[11px] font-extrabold text-pink-600 bg-pink-50 px-3 py-1 rounded-full border border-pink-200">
                                                    Pilih Tanggal Kencan 🗓️
                                                </span>
                                            </div>

                                            <div className="bg-pink-50/70 p-3.5 rounded-3xl border border-pink-200 shadow-inner space-y-2.5">
                                                <div className="flex items-center justify-between px-1">
                                                    <button
                                                        onClick={handlePrevMonth}
                                                        className="w-7 h-7 rounded-xl bg-white hover:bg-pink-100 text-pink-800 border border-pink-200 flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                                                        aria-label="Bulan Sebelumnya"
                                                    >
                                                        <ChevronLeft className="w-4 h-4 text-pink-600" />
                                                    </button>
                                                    <span className="font-extrabold text-xs sm:text-sm text-slate-800 tracking-tight">
                                                        {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
                                                    </span>
                                                    <button
                                                        onClick={handleNextMonth}
                                                        className="w-7 h-7 rounded-xl bg-white hover:bg-pink-100 text-pink-800 border border-pink-200 flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                                                        aria-label="Bulan Berikutnya"
                                                    >
                                                        <ChevronRight className="w-4 h-4 text-pink-600" />
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-7 gap-1 text-center">
                                                    {WEEKDAYS.map((dayName, idx) => (
                                                        <span
                                                            key={dayName}
                                                            className={`text-[10px] font-bold ${idx === 0 || idx === 6 ? 'text-rose-500' : 'text-slate-500'}`}
                                                        >
                                                            {dayName}
                                                        </span>
                                                    ))}
                                                </div>

                                                <div className="grid grid-cols-7 gap-1">
                                                    {blanks.map((blank) => (
                                                        <div key={`blank-${blank}`} className="h-8 sm:h-9" />
                                                    ))}

                                                    {monthDays.map((day) => {
                                                        const dateObj = new Date(currentYear, currentMonth, day);
                                                        dateObj.setHours(0, 0, 0, 0);
                                                        const isPast = dateObj < today;
                                                        const isToday = dateObj.getTime() === today.getTime();
                                                        const dateKey = `${currentYear}-${currentMonth}-${day}`;
                                                        const isClicked = clickedDateKey === dateKey;

                                                        return (
                                                            <div key={day} className="relative flex justify-center items-center">
                                                                <motion.button
                                                                    disabled={isPast || !!clickedDateKey}
                                                                    whileHover={!isPast && !clickedDateKey ? { scale: 1.18, y: -2 } : {}}
                                                                    whileTap={!isPast && !clickedDateKey ? { scale: 0.9 } : {}}
                                                                    animate={isClicked ? {
                                                                        scale: [1, 1.45, 1.15],
                                                                        rotate: [0, -10, 10, 0],
                                                                        backgroundColor: '#f43f5e',
                                                                        color: '#ffffff',
                                                                        boxShadow: '0 8px 20px -3px rgba(244, 63, 94, 0.7)'
                                                                    } : {}}
                                                                    transition={{ type: 'spring', stiffness: 500, damping: 14 }}
                                                                    onClick={() => handleSelectDate(currentYear, currentMonth, day)}
                                                                    className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-2xl flex flex-col items-center justify-center font-bold text-xs transition-all cursor-pointer ${isClicked
                                                                            ? 'bg-rose-500 text-white font-black z-20'
                                                                            : isPast
                                                                                ? 'text-slate-300 cursor-not-allowed bg-transparent'
                                                                                : isToday
                                                                                    ? 'bg-pink-100 text-pink-600 border border-pink-300 font-extrabold hover:bg-rose-500 hover:text-white'
                                                                                    : 'bg-white hover:bg-pink-100/70 text-slate-700 border border-pink-100 hover:border-pink-300'
                                                                        }`}
                                                                >
                                                                    <span>{day}</span>
                                                                    {isToday && !isClicked && (
                                                                        <span className="w-1 h-1 rounded-full bg-pink-500 mt-0.5" />
                                                                    )}
                                                                </motion.button>

                                                                {isClicked && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, scale: 0, y: 0 }}
                                                                        animate={{ opacity: 1, scale: [0.8, 1.3, 1], y: -28 }}
                                                                        exit={{ opacity: 0 }}
                                                                        className="absolute -top-1 pointer-events-none text-base z-30"
                                                                    >
                                                                        💖
                                                                    </motion.div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {selectedDateFeedback ? (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    className="p-3 bg-pink-100/80 border border-pink-300 rounded-2xl text-center shadow-xs"
                                                >
                                                    <p className="text-xs font-black text-pink-900">
                                                        🎉 Tanggal dipilih: <span className="text-rose-600">{selectedDateFeedback}</span>
                                                    </p>
                                                    <p className="text-[10px] text-pink-600 font-semibold mt-0.5 animate-pulse">
                                                        Menyiapkan hasil survei kamu... 💌
                                                    </p>
                                                </motion.div>
                                            ) : (
                                                <div className="flex items-center justify-between px-1 text-[11px] text-pink-700">
                                                    <span>Atau pilih via kalender HP:</span>
                                                    <label className="flex items-center gap-1 font-bold text-pink-600 hover:underline cursor-pointer bg-white px-2.5 py-1 rounded-xl border border-pink-200 shadow-xs">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        <span>Buka Sistem</span>
                                                        <input
                                                            type="date"
                                                            min={new Date().toISOString().split('T')[0]}
                                                            onChange={handleNativeDateChange}
                                                            className="sr-only"
                                                        />
                                                    </label>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}

                        {/* STEP 6: Success Screen & Redirect WhatsApp */}
                        {currentStep === 6 && (
                            <motion.div
                                key="step-6"
                                initial={{ opacity: 0, scale: 0.88, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                                className="text-center space-y-5"
                            >
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], rotate: [0, 8, -8, 0] }}
                                    transition={{ repeat: Infinity, duration: 2.5 }}
                                    className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-pink-400 to-rose-400 flex items-center justify-center shadow-lg shadow-pink-300 text-white"
                                >
                                    <CheckCircle2 className="w-12 h-12 stroke-[2.2]" />
                                </motion.div>

                                <div className="space-y-2">
                                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight leading-snug">
                                        Yeyy! Survei Selesai 🎉
                                    </h2>
                                    <p className="text-xs sm:text-sm text-pink-600 font-semibold">
                                        Jawaban kamu udah direkam dengan selamat! 🥰
                                    </p>
                                </div>

                                {/* Ringkasan Jawaban Cantik */}
                                <div className="bg-pink-50/70 rounded-2xl p-4 border border-pink-200 text-xs text-left space-y-2 text-slate-700 shadow-inner">
                                    <p className="font-bold text-pink-600 uppercase tracking-wider text-[10px] pb-1 border-b border-pink-200">
                                        HASIL PILIHAN KAMU:
                                    </p>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Aktivitas:</span>
                                        <span className="font-bold text-slate-800">{answers.dateActivity}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Waktu / Hari:</span>
                                        <span className="font-bold text-slate-800">{answers.dateDay}</span>
                                    </div>
                                </div>

                                {/* Tombol Utama WhatsApp */}
                                <div className="space-y-2 pt-2">
                                    <motion.button
                                        whileHover={{ scale: 1.04, y: -2 }}
                                        whileTap={{ scale: 0.96 }}
                                        onClick={handleRedirectWhatsApp}
                                        className="w-full py-4 px-6 rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-base shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <Send className="w-5 h-5 fill-white" />
                                        <span>Kirim Hasilnya ke Aku! 💌</span>
                                    </motion.button>

                                    <button
                                        onClick={handleRestart}
                                        className="text-xs text-slate-400 hover:text-pink-500 font-medium py-1 transition-colors flex items-center justify-center gap-1 mx-auto"
                                    >
                                        <RotateCcw className="w-3 h-3" /> Ulangi Survei
                                    </button>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>

                {/* Footer Lembut */}
                <div className="pt-4 mt-auto text-center border-t border-pink-100">
                    <p className="text-[11px] text-pink-400/80 font-medium flex items-center justify-center gap-1">
                        Made with Rizky saputra (arcain99)💖 • Survei Gemes
                    </p>
                </div>

            </div>
        </div>
    );
}
