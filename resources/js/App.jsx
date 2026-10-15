import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
    Heart,
    Sparkles,
    Send,
    RotateCcw,
    Calendar,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    ArrowLeft
} from 'lucide-react';
import { sounds } from './utils/soundEffects';
import MusicPlayer from './components/MusicPlayer';

// ============================================================================
// KONFIGURASI NOMOR WHATSAPP (Ganti dengan nomor WhatsApp kamu, format: 628...)
// ============================================================================
const WA_PHONE_NUMBER = "+62895391643059";

const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];
const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const WEEKDAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export default function App() {
    // State Navigasi Antar Layar (Step 1 s/d Step 6)
    const [currentStep, setCurrentStep] = useState(1);

    // State Penyimpan Jawaban Pengguna
    const [answers, setAnswers] = useState({
        reaction: '',      // Step 2
        loveLanguage: '',  // Step 3
        schedule: '',      // Step 5
    });

    // State untuk Custom Date Picker (Step 5)
    const [isCustomDateMode, setIsCustomDateMode] = useState(false);
    const [viewDate, setViewDate] = useState(() => new Date());
    const [clickedDateKey, setClickedDateKey] = useState(null);
    const [selectedDateFeedback, setSelectedDateFeedback] = useState('');

    // State untuk Trick Button "Nggak Dulu" (Step 4)
    const [dodgePos, setDodgePos] = useState({ x: 0, y: 0 });
    const [dodgeCount, setDodgeCount] = useState(0);
    const trickBoxRef = useRef(null);

    // Efek Confetti saat Layar Sukses (Step 6) Aktif
    useEffect(() => {
        if (currentStep === 6) {
            // Ledakan tengah confetti
            confetti({
                particleCount: 100,
                spread: 75,
                origin: { y: 0.6 },
                colors: ['#FF8E9E', '#FFAAA6', '#F8A488', '#FFD3B6', '#DCEDC1', '#FF6B6B']
            });

            // Cannon sisi kiri
            const leftCannon = setTimeout(() => {
                confetti({
                    particleCount: 55,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#FF8E9E', '#FFAAA6', '#FFCCD2']
                });
            }, 200);

            // Cannon sisi kanan
            const rightCannon = setTimeout(() => {
                confetti({
                    particleCount: 55,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#FFAAA6', '#F8A488', '#FFD3B6']
                });
            }, 400);

            // Simpan juga ke database Laravel jika diinginkan
            try {
                fetch('/api/save-response', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                    },
                    body: JSON.stringify({
                        respondent_name: 'Gebetan Spesial',
                        answers: answers,
                        final_answer: 'MAUUU BANGET! 🥰',
                        chosen_date_activity: answers.loveLanguage,
                        message: `Pilihan Reaksi: ${answers.reaction} | Hari: ${answers.schedule}`
                    })
                }).catch(() => { });
            } catch (e) { }

            return () => {
                clearTimeout(leftCannon);
                clearTimeout(rightCannon);
            };
        }
    }, [currentStep]);

    // Logika Trick Button menghindar secara acak saat kursor/jari menyentuh
    const handleTrickDodge = () => {
        setDodgeCount((prev) => prev + 1);

        const container = trickBoxRef.current;
        if (container) {
            const rect = container.getBoundingClientRect();
            // Tentukan batas aman perpindahan agar tidak keluar kartu
            const maxX = Math.max(50, (rect.width - 130) / 2);
            const maxY = Math.max(35, (rect.height - 80) / 2);

            const randomX = (Math.random() * 2 - 1) * maxX;
            const randomY = (Math.random() * 2 - 1) * maxY;
            setDodgePos({ x: randomX, y: randomY });
        } else {
            const randomX = (Math.random() - 0.5) * 180;
            const randomY = (Math.random() - 0.5) * 120;
            setDodgePos({ x: randomX, y: randomY });
        }
    };

    // Logika Redirect WhatsApp pada Step 6
    const handleRedirectWhatsApp = () => {
        // Format teks sesuai spesifikasi prompt:
        // Halo! Aku udah isi surveinya. Aku pilih [Jawaban_Step2] dan [Jawaban_Step3]. Ayo jalan hari [Jawaban_Step5]! ✨
        const step2 = answers.reaction || 'saling cubit pipi';
        const step3 = answers.loveLanguage || 'disuapin makanan manis';
        const step5 = answers.schedule || 'weekend ini';

        const cleanPhone = WA_PHONE_NUMBER.replace(/[^0-9]/g, '');
        const message = `Halo! Aku udah isi surveinya. Aku pilih ${step2} dan ${step3}. Ayo jalan hari ${step5}! ✨`;
        const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
    };

    // Helper navigasi bulan kalender
    const handlePrevMonth = () => {
        sounds.playPop();
        setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        sounds.playPop();
        setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    // Handler saat tanggal pada kalender diklik (disertai animasi)
    const handleSelectDate = (year, month, day) => {
        const selectedDate = new Date(year, month, day);
        const dateKey = `${year}-${month}-${day}`;
        setClickedDateKey(dateKey);

        const formatted = `${DAY_NAMES[selectedDate.getDay()]}, ${day} ${MONTH_NAMES[month]} ${year}`;
        setSelectedDateFeedback(formatted);

        // Suara & Confetti gemes
        try {
            sounds.playDing();
        } catch (e) { }

        confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.65 },
            colors: ['#FF8E9E', '#FFAAA6', '#F8A488', '#FFD3B6', '#FF6B6B']
        });

        // Pindah otomatis ke Step 6 setelah animasi berlangsung sejenak
        setTimeout(() => {
            setAnswers((prev) => ({
                ...prev,
                schedule: formatted,
            }));
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

    // Fungsi reset survei untuk mencoba lagi
    const handleReset = () => {
        setAnswers({
            reaction: '',
            loveLanguage: '',
            schedule: '',
        });
        setDodgePos({ x: 0, y: 0 });
        setDodgeCount(0);
        setIsCustomDateMode(false);
        setClickedDateKey(null);
        setSelectedDateFeedback('');
        setCurrentStep(1);
    };

    // Variasi teks kocak saat tombol "Nggak Dulu" kabur
    const dodgeLabels = [
        'Nggak Dulu',
        'Yakin nolak? 🥺',
        'Eits, gabisa diklik! 😜',
        'Tombolnya kabur 🏃‍♂️💨',
        'Tombol ini mogok kerja ⛔',
        'Klik yang pink aja yaa! 💖'
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
        <div className="min-h-screen w-full bg-[#FDF8F3] flex items-center justify-center p-4 font-sans text-[#5C3D2E] selection:bg-[#FF8E9E] selection:text-white">
            {/* Musik Pengiring Romantis: Raim Laode - "Dunia Yang Nanti" */}
            <MusicPlayer />

            {/* Visual Novel Container bergaya warm pastel (Krem, Coklat Muda Pastel & Pink Blush) */}
            <div className="w-full max-w-sm sm:max-w-md bg-[#FFFDFB]/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-soft border border-[#F3DEC9] relative overflow-hidden flex flex-col justify-between min-h-[640px]">

                {/* Progress Bar & Header Lembut */}
                <div className="w-full mb-4">
                    <div className="flex items-center justify-between text-xs font-bold text-[#AA7D5C] mb-2">
                        <span className="flex items-center gap-1.5 uppercase tracking-wider text-[#8C6246]">
                            <Sparkles className="w-3.5 h-3.5 text-[#FF8E9E]" /> Survei Gemes
                        </span>
                        <span className="bg-[#FFF0E5] px-2.5 py-0.5 rounded-full text-[#8C6246] border border-[#F3DEC9]">
                            {currentStep} / 6
                        </span>
                    </div>
                    {/* Bar Indikator Progres */}
                    <div className="w-full h-2.5 bg-[#FFF0E5] rounded-full overflow-hidden p-0.5 border border-[#F3DEC9]/60">
                        <motion.div
                            className="h-full bg-gradient-to-r from-[#FF8E9E] via-[#FFAAA6] to-[#F8A488] rounded-full"
                            initial={{ width: '16%' }}
                            animate={{ width: `${(currentStep / 6) * 100}%` }}
                            transition={{ type: 'spring', stiffness: 240, damping: 20 }}
                        />
                    </div>
                </div>

                {/* Dynamic Screen Area dengan Transisi Bouncy Framer Motion */}
                <div className="flex-1 flex flex-col justify-center my-2">
                    <AnimatePresence mode="wait">

                        {/* ==================================================================== */}
                        {/* STEP 1: Landing Screen                                               */}
                        {/* ==================================================================== */}
                        {currentStep === 1 && (
                            <motion.div
                                key="step-1"
                                initial={{ opacity: 0, scale: 0.9, y: 25 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -25 }}
                                transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                                className="text-center space-y-5"
                            >
                                {/* Visual: selfie.png */}
                                <div className="relative mx-auto w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center">
                                    <div className="absolute inset-0 bg-[#FFF0E5] rounded-3xl -rotate-2 transform scale-95 border border-[#F3DEC9]"></div>
                                    <motion.img
                                        src="/selfie.png"
                                        alt="Selfie Lucu"
                                        className="relative w-full h-full object-contain mx-auto rounded-3xl drop-shadow-md z-10"
                                        animate={{ y: [0, -6, 0] }}
                                        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                                    />
                                </div>

                                {/* Teks Utama */}
                                <div className="space-y-2 px-1">
                                    <h1 className="text-xl sm:text-2xl font-black text-[#5C3D2E] leading-snug">
                                        Halo! Jawab jujur ya, kalau kita lagi jalan bareng, kamu pengennya gimana? 👀
                                    </h1>
                                    <p className="text-xs sm:text-sm text-[#8C6246] font-medium">
                                        Kuis kecil buat cari tahu vibe jalan santai kita berdua~ 🌸
                                    </p>
                                </div>

                                {/* Tombol Mulai */}
                                <div className="pt-2">
                                    <motion.button
                                        whileHover={{ scale: 1.04, y: -2 }}
                                        whileTap={{ scale: 0.96 }}
                                        onClick={() => setCurrentStep(2)}
                                        className="w-full py-4 px-6 rounded-3xl bg-gradient-to-r from-[#FF8E9E] to-[#F8A488] hover:from-[#FF7588] hover:to-[#E88E70] text-white font-extrabold text-base shadow-md shadow-[#FF8E9E]/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <span>Mulai Survei 🚀</span>
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}

                        {/* ==================================================================== */}
                        {/* STEP 2: The Reaction                                                */}
                        {/* ==================================================================== */}
                        {currentStep === 2 && (
                            <motion.div
                                key="step-2"
                                initial={{ opacity: 0, scale: 0.9, y: 25 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -25 }}
                                transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                                className="space-y-5"
                            >
                                {/* Visual: pouting.png */}
                                <div className="relative mx-auto w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center">
                                    <div className="absolute inset-0 bg-[#FFF0E5] rounded-3xl rotate-1 scale-95 border border-[#F3DEC9]"></div>
                                    <img
                                        src="/pouting.png"
                                        alt="Pouting"
                                        className="relative w-full h-full object-contain mx-auto rounded-3xl drop-shadow-sm z-10"
                                    />
                                </div>

                                {/* Pertanyaan */}
                                <div className="text-center space-y-1">
                                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#FF8E9E] bg-[#FFF0F2] px-3 py-1 rounded-full border border-[#FFCCD2]">
                                        Step 2: Reaksi Kamu
                                    </span>
                                    <h2 className="text-lg sm:text-xl font-black text-[#5C3D2E] pt-2 leading-snug">
                                        Kalau aku tiba-tiba ngeselin, kamu bakal bereaksi gimana?
                                    </h2>
                                </div>

                                {/* 2 Pilihan Jawaban */}
                                <div className="space-y-3 pt-1">
                                    <motion.button
                                        whileHover={{ scale: 1.02, x: 2 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => {
                                            setAnswers((prev) => ({
                                                ...prev,
                                                reaction: 'Bertengkar lucu dan pouting 😤',
                                            }));
                                            setCurrentStep(3);
                                        }}
                                        className="w-full p-3.5 rounded-3xl bg-[#FFF8F0] hover:bg-[#FFF0E5] text-[#5C3D2E] border border-[#F3DEC9] font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center gap-3 cursor-pointer"
                                    >
                                        <img
                                            src="/pouting.png"
                                            alt="Pouting Icon"
                                            className="w-10 h-10 object-contain rounded-2xl bg-white p-1 border border-[#F3DEC9] shrink-0"
                                        />
                                        <span className="flex-1 text-left">
                                            A. Bertengkar lucu dan pouting 😤
                                        </span>
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.02, x: 2 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => {
                                            setAnswers((prev) => ({
                                                ...prev,
                                                reaction: 'Balas dendam saling cubit pipi! 🤏',
                                            }));
                                            setCurrentStep(3);
                                        }}
                                        className="w-full p-3.5 rounded-3xl bg-[#FFF8F0] hover:bg-[#FFF0E5] text-[#5C3D2E] border border-[#F3DEC9] font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center gap-3 cursor-pointer"
                                    >
                                        <img
                                            src="/saling-cubit.png"
                                            alt="Saling Cubit Icon"
                                            className="w-10 h-10 object-contain rounded-2xl bg-white p-1 border border-[#F3DEC9] shrink-0"
                                        />
                                        <span className="flex-1 text-left">
                                            B. Balas dendam saling cubit pipi! 🤏
                                        </span>
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}

                        {/* ==================================================================== */}
                        {/* STEP 3: Love Language / Treatment                                    */}
                        {/* ==================================================================== */}
                        {currentStep === 3 && (
                            <motion.div
                                key="step-3"
                                initial={{ opacity: 0, scale: 0.9, y: 25 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -25 }}
                                transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                                className="space-y-5"
                            >
                                {/* Visual: bagi-makanan.png */}
                                <div className="relative mx-auto w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center">
                                    <div className="absolute inset-0 bg-[#FFF0E5] rounded-3xl -rotate-1 scale-95 border border-[#F3DEC9]"></div>
                                    <img
                                        src="/bagi-makanan.png"
                                        alt="Bagi Makanan"
                                        className="relative w-full h-full object-contain mx-auto rounded-3xl drop-shadow-sm z-10"
                                    />
                                </div>

                                {/* Pertanyaan */}
                                <div className="text-center space-y-1">
                                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#FF8E9E] bg-[#FFF0F2] px-3 py-1 rounded-full border border-[#FFCCD2]">
                                        Step 3: Love Language
                                    </span>
                                    <h2 className="text-lg sm:text-xl font-black text-[#5C3D2E] pt-2 leading-snug">
                                        Terus, kalau lagi santai berdua, kamu lebih suka treatment yang mana nih?
                                    </h2>
                                </div>

                                {/* 2 Pilihan Jawaban */}
                                <div className="space-y-3 pt-1">
                                    <motion.button
                                        whileHover={{ scale: 1.02, x: 2 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => {
                                            setAnswers((prev) => ({
                                                ...prev,
                                                loveLanguage: 'Dibeliin & disuapin makanan manis 🍰',
                                            }));
                                            setCurrentStep(4);
                                        }}
                                        className="w-full p-3.5 rounded-3xl bg-[#FFF8F0] hover:bg-[#FFF0E5] text-[#5C3D2E] border border-[#F3DEC9] font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center gap-3 cursor-pointer"
                                    >
                                        <img
                                            src="/bagi-makanan.png"
                                            alt="Kue Manis"
                                            className="w-10 h-10 object-contain rounded-2xl bg-white p-1 border border-[#F3DEC9] shrink-0"
                                        />
                                        <span className="flex-1 text-left">
                                            A. Dibeliin & disuapin makanan manis 🍰
                                        </span>
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.02, x: 2 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => {
                                            setAnswers((prev) => ({
                                                ...prev,
                                                loveLanguage: 'Diem-diem dielus kepala (pat-pat) 🥺',
                                            }));
                                            setCurrentStep(4);
                                        }}
                                        className="w-full p-3.5 rounded-3xl bg-[#FFF8F0] hover:bg-[#FFF0E5] text-[#5C3D2E] border border-[#F3DEC9] font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center gap-3 cursor-pointer"
                                    >
                                        <img
                                            src="/pat-pat.png"
                                            alt="Pat Pat"
                                            className="w-10 h-10 object-contain rounded-2xl bg-white p-1 border border-[#F3DEC9] shrink-0"
                                        />
                                        <span className="flex-1 text-left">
                                            B. Diem-diem dielus kepala (pat-pat) 🥺
                                        </span>
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}

                        {/* ==================================================================== */}
                        {/* STEP 4: The Ask (WAJIB ADA TRICK BUTTON)                             */}
                        {/* ==================================================================== */}
                        {currentStep === 4 && (
                            <motion.div
                                key="step-4"
                                initial={{ opacity: 0, scale: 0.9, y: 25 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -25 }}
                                transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                                className="space-y-4"
                            >
                                {/* Visual: merangkul.png */}
                                <div className="relative mx-auto w-44 h-44 sm:w-50 sm:h-50 flex items-center justify-center">
                                    <div className="absolute inset-0 bg-[#FFF0E5] rounded-3xl rotate-2 scale-95 border border-[#F3DEC9]"></div>
                                    <img
                                        src="/merangkul.png"
                                        alt="Merangkul"
                                        className="relative w-full h-full object-contain mx-auto rounded-3xl drop-shadow-sm z-10"
                                    />
                                </div>

                                {/* Pertanyaan Inti */}
                                <div className="text-center space-y-1">
                                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#FF8E9E] bg-[#FFF0F2] px-3 py-1 rounded-full border border-[#FFCCD2]">
                                        Pertanyaan Inti 💘
                                    </span>
                                    <h2 className="text-base sm:text-lg font-black text-[#5C3D2E] pt-1 leading-snug">
                                        Kombinasi yang gemes! Kalau gitu... mau nggak jalan bareng weekend ini buat realisasikan pilihan kamu? 👉👈
                                    </h2>
                                </div>

                                {/* Interactive Trick Box Area */}
                                <div
                                    ref={trickBoxRef}
                                    className="relative min-h-[170px] flex flex-col items-center justify-center gap-3 pt-2"
                                >
                                    {/* Tombol 1 (Kiri/Atas): MAUUU BANGET! 🥰 */}
                                    <motion.button
                                        whileHover={{ scale: 1.06 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setCurrentStep(5)}
                                        className="w-full py-4 px-6 rounded-3xl bg-gradient-to-r from-[#FF8E9E] via-[#FFAAA6] to-[#F8A488] hover:from-[#FF7588] hover:to-[#E88E70] text-white font-black text-base sm:text-lg shadow-lg shadow-[#FF8E9E]/40 transition-all z-10 cursor-pointer flex items-center justify-center gap-2"
                                    >
                                        <Heart className="w-5 h-5 fill-white" />
                                        <span>MAUUU BANGET! 🥰</span>
                                    </motion.button>

                                    {/* Tombol 2 (Kanan/Bawah): Nggak Dulu (Trick Button dengan Absolute Positioning & Dodge) */}
                                    <motion.button
                                        animate={{
                                            x: dodgePos.x,
                                            y: dodgePos.y,
                                        }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 450,
                                            damping: 20,
                                        }}
                                        onMouseEnter={handleTrickDodge}
                                        onTouchStart={handleTrickDodge}
                                        onClick={handleTrickDodge}
                                        className="py-2 px-5 rounded-3xl bg-[#E8E2DC]/80 hover:bg-[#DCD5CF] text-[#8C827A] font-semibold text-xs sm:text-sm border border-[#D5CCC3] select-none shadow-xs cursor-pointer z-20"
                                    >
                                        {dodgeLabels[dodgeCount % dodgeLabels.length]}
                                    </motion.button>
                                </div>

                                {dodgeCount > 0 && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-[11px] text-[#FF8E9E] text-center font-bold italic"
                                    >
                                        Hehehe tombolnya nolak buat diklik, pilih yang pink aja yuk! 😜
                                    </motion.p>
                                )}
                            </motion.div>
                        )}

                        {/* ==================================================================== */}
                        {/* STEP 5: Penentuan Jadwal                                             */}
                        {/* ==================================================================== */}
                        {currentStep === 5 && (
                            <motion.div
                                key="step-5"
                                initial={{ opacity: 0, scale: 0.9, y: 25 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -25 }}
                                transition={{ type: 'spring', stiffness: 340, damping: 22 }}
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
                                            {/* Visual: pat-pat.png */}
                                            <div className="relative mx-auto w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center">
                                                <div className="absolute inset-0 bg-[#FFF0E5] rounded-3xl -rotate-2 scale-95 border border-[#F3DEC9]"></div>
                                                <img
                                                    src="/pat-pat.png"
                                                    alt="Pat Pat Lucu"
                                                    className="relative w-full h-full object-contain mx-auto rounded-3xl drop-shadow-sm z-10"
                                                />
                                            </div>

                                            {/* Pertanyaan */}
                                            <div className="text-center space-y-1">
                                                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#FF8E9E] bg-[#FFF0F2] px-3 py-1 rounded-full border border-[#FFCCD2]">
                                                    Step 5: Pilih Hari 🗓️
                                                </span>
                                                <h2 className="text-base sm:text-lg font-black text-[#5C3D2E] pt-1 leading-snug">
                                                    Asyikk! Catat ya, kita jalan hari apa enaknya?
                                                </h2>
                                            </div>

                                            {/* 3 Pilihan Jadwal */}
                                            <div className="space-y-2.5 pt-1">
                                                {/* Pilihan 1: Sabtu */}
                                                <motion.button
                                                    whileHover={{ scale: 1.02, x: 2 }}
                                                    whileTap={{ scale: 0.97 }}
                                                    onClick={() => {
                                                        try { sounds.playDing(); } catch (e) { }
                                                        setAnswers((prev) => ({
                                                            ...prev,
                                                            schedule: 'Sabtu ini dong! ✨',
                                                        }));
                                                        setCurrentStep(6);
                                                    }}
                                                    className="w-full p-3.5 sm:p-4 rounded-3xl bg-[#FFF8F0] hover:bg-[#FFF0E5] text-[#5C3D2E] border border-[#F3DEC9] font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-between cursor-pointer"
                                                >
                                                    <span>Sabtu ini dong! ✨</span>
                                                    <Calendar className="w-4 h-4 text-[#AA7D5C] shrink-0 ml-2" />
                                                </motion.button>

                                                {/* Pilihan 2: Minggu */}
                                                <motion.button
                                                    whileHover={{ scale: 1.02, x: 2 }}
                                                    whileTap={{ scale: 0.97 }}
                                                    onClick={() => {
                                                        try { sounds.playDing(); } catch (e) { }
                                                        setAnswers((prev) => ({
                                                            ...prev,
                                                            schedule: 'Minggu aja biar santai~ 🌅',
                                                        }));
                                                        setCurrentStep(6);
                                                    }}
                                                    className="w-full p-3.5 sm:p-4 rounded-3xl bg-[#FFF8F0] hover:bg-[#FFF0E5] text-[#5C3D2E] border border-[#F3DEC9] font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-between cursor-pointer"
                                                >
                                                    <span>Minggu aja biar santai~ 🌅</span>
                                                    <Calendar className="w-4 h-4 text-[#AA7D5C] shrink-0 ml-2" />
                                                </motion.button>

                                                {/* Pilihan 3: Custom Date Picker dengan Animasi Interaktif */}
                                                <motion.button
                                                    whileHover={{ scale: 1.02, x: 2 }}
                                                    whileTap={{ scale: 0.96 }}
                                                    onClick={() => {
                                                        try { sounds.playPop(); } catch (e) { }
                                                        setIsCustomDateMode(true);
                                                    }}
                                                    className="w-full p-3.5 sm:p-4 rounded-3xl bg-gradient-to-r from-[#FFF5EE] via-[#FFF0F2] to-[#FFE8EC] hover:from-[#FFEBE0] hover:to-[#FFDDE4] text-[#5C3D2E] border-2 border-dashed border-[#FFB6C1] hover:border-[#FF8E9E] font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-between cursor-pointer group"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2.5 h-2.5 rounded-full bg-[#FF8E9E] animate-ping" />
                                                        <span className="font-extrabold text-[#5C3D2E]">
                                                            Pilih tanggal sendiri yuk! 📅✨
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[11px] text-[#FF8E9E] font-black bg-white/90 px-3 py-1 rounded-full border border-[#FFCCD2] shadow-xs group-hover:bg-[#FF8E9E] group-hover:text-white transition-all">
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
                                            {/* Header Kalender & Tombol Kembali */}
                                            <div className="flex items-center justify-between">
                                                <button
                                                    onClick={() => {
                                                        try { sounds.playPop(); } catch (e) { }
                                                        setIsCustomDateMode(false);
                                                    }}
                                                    className="flex items-center gap-1 text-xs font-bold text-[#AA7D5C] hover:text-[#5C3D2E] bg-[#FFF0E5] px-2.5 py-1 rounded-full border border-[#F3DEC9] transition-all cursor-pointer"
                                                >
                                                    <ArrowLeft className="w-3.5 h-3.5" />
                                                    <span>Kembali</span>
                                                </button>
                                                <span className="text-[11px] font-extrabold text-[#FF8E9E] bg-[#FFF0F2] px-3 py-1 rounded-full border border-[#FFCCD2]">
                                                    Pilih Tanggal Kencan 🗓️
                                                </span>
                                            </div>

                                            {/* Kalender Card Container */}
                                            <div className="bg-[#FFF8F0] p-3.5 rounded-3xl border border-[#F3DEC9] shadow-inner space-y-2.5">
                                                {/* Navigasi Bulan */}
                                                <div className="flex items-center justify-between px-1">
                                                    <button
                                                        onClick={handlePrevMonth}
                                                        className="w-7 h-7 rounded-xl bg-white/90 hover:bg-[#FFE8EC] text-[#5C3D2E] border border-[#F3DEC9] flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                                                        aria-label="Bulan Sebelumnya"
                                                    >
                                                        <ChevronLeft className="w-4 h-4 text-[#8C6246]" />
                                                    </button>
                                                    <span className="font-black text-xs sm:text-sm text-[#5C3D2E] tracking-tight">
                                                        {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
                                                    </span>
                                                    <button
                                                        onClick={handleNextMonth}
                                                        className="w-7 h-7 rounded-xl bg-white/90 hover:bg-[#FFE8EC] text-[#5C3D2E] border border-[#F3DEC9] flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                                                        aria-label="Bulan Berikutnya"
                                                    >
                                                        <ChevronRight className="w-4 h-4 text-[#8C6246]" />
                                                    </button>
                                                </div>

                                                {/* Baris Nama Hari */}
                                                <div className="grid grid-cols-7 gap-1 text-center">
                                                    {WEEKDAYS.map((dayName, idx) => (
                                                        <span
                                                            key={dayName}
                                                            className={`text-[10px] font-extrabold ${idx === 0 || idx === 6 ? 'text-[#FF8E9E]' : 'text-[#AA7D5C]'}`}
                                                        >
                                                            {dayName}
                                                        </span>
                                                    ))}
                                                </div>

                                                {/* Grid Tanggal */}
                                                <div className="grid grid-cols-7 gap-1">
                                                    {/* Kotak kosong awal bulan */}
                                                    {blanks.map((blank) => (
                                                        <div key={`blank-${blank}`} className="h-8 sm:h-9" />
                                                    ))}

                                                    {/* Tanggal dalam Bulan */}
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
                                                                        backgroundColor: '#FF8E9E',
                                                                        color: '#ffffff',
                                                                        boxShadow: '0 8px 20px -3px rgba(255, 142, 158, 0.7)'
                                                                    } : {}}
                                                                    transition={{ type: 'spring', stiffness: 500, damping: 14 }}
                                                                    onClick={() => handleSelectDate(currentYear, currentMonth, day)}
                                                                    className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-2xl flex flex-col items-center justify-center font-bold text-xs transition-all cursor-pointer ${isClicked
                                                                            ? 'bg-[#FF8E9E] text-white font-black z-20'
                                                                            : isPast
                                                                                ? 'text-slate-300 cursor-not-allowed bg-transparent'
                                                                                : isToday
                                                                                    ? 'bg-[#FFF0F2] text-[#FF8E9E] border border-[#FFCCD2] font-black hover:bg-[#FF8E9E] hover:text-white'
                                                                                    : 'bg-white hover:bg-[#FFF0E5] text-[#5C3D2E] border border-[#F3DEC9]/70 hover:border-[#FF8E9E]'
                                                                        }`}
                                                                >
                                                                    <span>{day}</span>
                                                                    {isToday && !isClicked && (
                                                                        <span className="w-1 h-1 rounded-full bg-[#FF8E9E] mt-0.5" />
                                                                    )}
                                                                </motion.button>

                                                                {/* Floating Hearts Animation saat tanggal diklik */}
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

                                            {/* Feedback Banner saat Tanggal Dipilih */}
                                            {selectedDateFeedback ? (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    className="p-3 bg-gradient-to-r from-[#FFF0F2] to-[#FFE8EC] border border-[#FFCCD2] rounded-2xl text-center shadow-xs"
                                                >
                                                    <p className="text-xs font-black text-[#5C3D2E]">
                                                        🎉 Tanggal dipilih: <span className="text-[#FF8E9E]">{selectedDateFeedback}</span>
                                                    </p>
                                                    <p className="text-[10px] text-[#8C6246] font-semibold mt-0.5 animate-pulse">
                                                        Bagus banget! Menyimpan pilihan kencan... 💌
                                                    </p>
                                                </motion.div>
                                            ) : (
                                                /* Opsi Shortcut Kalender Sistem */
                                                <div className="flex items-center justify-between px-1 text-[11px] text-[#AA7D5C]">
                                                    <span>Atau pilih via kalender HP:</span>
                                                    <label className="flex items-center gap-1 font-bold text-[#FF8E9E] hover:underline cursor-pointer bg-white px-2.5 py-1 rounded-xl border border-[#FFCCD2] shadow-xs">
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

                        {/* ==================================================================== */}
                        {/* STEP 6: Success Screen & Redirect WhatsApp                          */}
                        {/* ==================================================================== */}
                        {currentStep === 6 && (
                            <motion.div
                                key="step-6"
                                initial={{ opacity: 0, scale: 0.85, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                                className="text-center space-y-4"
                            >
                                {/* Visual: merangkul.png dengan Scale Up Bouncy Animation */}
                                <motion.div
                                    initial={{ scale: 0.7, rotate: -4 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                                    className="relative mx-auto w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center"
                                >
                                    <div className="absolute inset-0 bg-[#FFF0E5] rounded-3xl rotate-1 scale-95 border border-[#F3DEC9]"></div>
                                    <img
                                        src="/merangkul.png"
                                        alt="Merangkul Bahagia"
                                        className="relative w-full h-full object-contain mx-auto rounded-3xl drop-shadow-md z-10"
                                    />
                                </motion.div>

                                {/* Teks Utama */}
                                <div className="space-y-1">
                                    <h2 className="text-xl sm:text-2xl font-black text-[#5C3D2E] tracking-tight leading-snug">
                                        Yeyy! Survei Selesai 🎉
                                    </h2>
                                    <p className="text-xs sm:text-sm text-[#FF8E9E] font-bold">
                                        Nggak sabar nunggu harinya! 🥰✨
                                    </p>
                                </div>

                                {/* Ringkasan Jawaban Bergaya Visual Novel */}
                                <div className="bg-[#FFF8F0] rounded-2xl p-3.5 border border-[#F3DEC9] text-xs text-left space-y-2 text-[#5C3D2E] shadow-inner">
                                    <p className="font-extrabold text-[#8C6246] uppercase tracking-wider text-[10px] pb-1 border-b border-[#F3DEC9]">
                                        PILIHAN KAMU:
                                    </p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[#AA7D5C]">Reaksi Lucu:</span>
                                        <span className="font-bold text-[#5C3D2E]">{answers.reaction}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[#AA7D5C]">Treatment Favorit:</span>
                                        <span className="font-bold text-[#5C3D2E]">{answers.loveLanguage}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[#AA7D5C]">Jadwal Kencan:</span>
                                        <span className="font-bold text-[#FF8E9E]">{answers.schedule}</span>
                                    </div>
                                </div>

                                {/* Tombol Utama WhatsApp */}
                                <div className="space-y-2 pt-1">
                                    <motion.button
                                        whileHover={{ scale: 1.04, y: -2 }}
                                        whileTap={{ scale: 0.96 }}
                                        onClick={handleRedirectWhatsApp}
                                        className="w-full py-4 px-6 rounded-3xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#20BA5A] hover:to-[#0E7064] text-white font-black text-base shadow-lg shadow-[#25D366]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <Send className="w-5 h-5 fill-white" />
                                        <span>Kirim Konfirmasi ke Aku! 💌</span>
                                    </motion.button>

                                    <button
                                        onClick={handleReset}
                                        className="text-xs text-[#AA7D5C] hover:text-[#5C3D2E] font-semibold py-1 transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" /> Ulangi Survei
                                    </button>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>

                {/* Footer Visual Novel Lembut */}
                <div className="pt-3 mt-auto text-center border-t border-[#F3DEC9]/60">
                    <p className="text-[11px] text-[#AA7D5C]/80 font-semibold flex items-center justify-center gap-1">
                        Made with Rizky saputra (arcain99)💖 • Survei Gemes
                    </p>
                </div>

            </div>
        </div>
    );
}
