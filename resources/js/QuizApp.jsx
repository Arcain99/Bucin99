import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
    Heart,
    Sparkles,
    Volume2,
    VolumeX,
    ArrowRight,
    ArrowLeft,
    Check,
    RotateCcw,
    Send,
    History,
    Stars,
    PartyPopper
} from 'lucide-react';
import FloatingHearts from './components/FloatingHearts';
import DateCertificate from './components/DateCertificate';
import { sounds } from './utils/soundEffects';
import MusicPlayer from './components/MusicPlayer';

export default function QuizApp() {
    const [partnerName, setPartnerName] = useState('Loili');
    const [isEditingName, setIsEditingName] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);

    const [currentStep, setCurrentStep] = useState(0); // 0 = Welcome, 1..N = Questions, N+1 = Celebration
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [sliderValue, setSliderValue] = useState(90);

    // Runaway "Tidak" button state
    const [noCount, setNoCount] = useState(0);
    const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });

    // Celebration & Sweet message
    const [sweetNote, setSweetNote] = useState('');
    const [isSubmittingNote, setIsSubmittingNote] = useState(false);
    const [noteSubmitted, setNoteSubmitted] = useState(false);

    // History modal
    const [showHistory, setShowHistory] = useState(false);
    const [historyList, setHistoryList] = useState([]);

    // Fetch initial questions from Laravel Backend
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const nameFromUrl = urlParams.get('name') || 'Loili';
        setPartnerName(nameFromUrl);

        fetch(`/api/quiz-data?name=${encodeURIComponent(nameFromUrl)}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.questions) {
                    setQuestions(data.questions);
                }
            })
            .catch((err) => {
                console.error('Failed to load quiz data:', err);
            });
    }, []);

    // Toggle sound
    const toggleSound = () => {
        const nextState = !soundEnabled;
        setSoundEnabled(nextState);
        sounds.enabled = nextState;
        if (nextState) sounds.playDing();
    };

    // Confetti effect triggering
    const triggerBigConfetti = () => {
        sounds.playYay();

        // Immediate central blast
        confetti({
            particleCount: 110,
            spread: 75,
            origin: { y: 0.6 },
            colors: ['#ff4081', '#ff1744', '#ff80ab', '#ffe57f', '#ffd700']
        });

        // Left cannon
        setTimeout(() => {
            confetti({
                particleCount: 65,
                angle: 60,
                spread: 60,
                origin: { x: 0 },
                colors: ['#f43f5e', '#fb7185', '#fda4af', '#fef08a']
            });
        }, 200);

        // Right cannon
        setTimeout(() => {
            confetti({
                particleCount: 65,
                angle: 120,
                spread: 60,
                origin: { x: 1 },
                colors: ['#ec4899', '#f472b6', '#fbcfe8', '#fed7aa']
            });
        }, 400);

        // Falling stars shower
        setTimeout(() => {
            confetti({
                particleCount: 90,
                spread: 100,
                decay: 0.92,
                scalar: 1.2,
                origin: { y: 0.2 }
            });
        }, 700);
    };

    // Handle option click
    const handleSelectOption = (questionId, option) => {
        sounds.playPop();
        setAnswers((prev) => ({
            ...prev,
            [questionId]: option
        }));
    };

    // Proceed next question
    const handleNext = () => {
        sounds.playPop();
        setCurrentStep((prev) => prev + 1);
    };

    // Go back
    const handleBack = () => {
        sounds.playPop();
        setCurrentStep((prev) => Math.max(0, prev - 1));
    };

    // Runaway "Tidak" button logic
    const handleNoHoverOrClick = () => {
        sounds.playPop();
        setNoCount((prev) => prev + 1);

        // Calculate random dodge movement
        const randomX = (Math.random() - 0.5) * 260;
        const randomY = (Math.random() - 0.5) * 180;
        setNoPosition({ x: randomX, y: randomY });
    };

    // Handle "IYA" final answer
    const handleYesClick = async () => {
        triggerBigConfetti();

        const updatedAnswers = {
            ...answers,
            sliderQuestion: sliderValue,
            final: 'Iya! Tentu Saja Mau! 💖'
        };
        setAnswers(updatedAnswers);

        // Move to celebration screen
        setCurrentStep(questions.length + 1);

        // Save to Laravel Backend
        try {
            await fetch('/api/save-response', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    respondent_name: partnerName,
                    answers: updatedAnswers,
                    final_answer: 'Iya',
                    chosen_date_activity: updatedAnswers[2]?.label || 'Kencan Manis'
                })
            });
        } catch (error) {
            console.error('Failed to save response:', error);
        }
    };

    // Submit sweet message on celebration screen
    const handleSendSweetNote = async (e) => {
        e.preventDefault();
        if (!sweetNote.trim()) return;

        setIsSubmittingNote(true);
        sounds.playDing();
        try {
            await fetch('/api/save-response', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    respondent_name: partnerName,
                    answers: answers,
                    final_answer: 'Iya',
                    message: sweetNote,
                    chosen_date_activity: answers[2]?.label || 'Kencan Manis'
                })
            });
            setNoteSubmitted(true);
            triggerBigConfetti();
        } catch (error) {
            console.error('Error saving note:', error);
        } finally {
            setIsSubmittingNote(false);
        }
    };

    // Load history
    const openHistoryModal = async () => {
        sounds.playDing();
        setShowHistory(true);
        try {
            const res = await fetch('/api/responses');
            const data = await res.json();
            setHistoryList(data.responses || []);
        } catch (err) {
            console.error('Error fetching history:', err);
        }
    };

    // Reset quiz
    const resetQuiz = () => {
        sounds.playPop();
        setCurrentStep(0);
        setAnswers({});
        setNoCount(0);
        setNoPosition({ x: 0, y: 0 });
        setNoteSubmitted(false);
        setSweetNote('');
    };

    // Total questions count
    const totalQuestions = questions.length;
    const progressPercent = totalQuestions > 0 ? Math.min(100, Math.round((currentStep / totalQuestions) * 100)) : 0;

    // Playful dodge text for the "Tidak" button
    const noButtonTexts = [
        'Enggak dulu deh... 🙈',
        'Yakin nih nolak? 🥺',
        'Coba pencet lagi kalau bisa 😜',
        'Eits, gabisa dipencet! 🏃‍♂️💨',
        'Jangan gitu dong manis... 😢',
        'Tombol ini otomatis mogok! ⛔',
        'Harus klik yang IYA pokoknya! 💖'
    ];

    return (
        <div className="relative min-h-screen w-full flex flex-col justify-between items-center py-6 px-4 selection:bg-rose-500 selection:text-white">
            {/* Background Floating Elements */}
            <FloatingHearts />

            {/* Musik Pengiring Romantis: Raim Laode - "Dunia Yang Nanti" */}
            <MusicPlayer />

            {/* Top Navigation & Controls */}
            <header className="w-full max-w-2xl flex items-center justify-between z-10 mb-4 px-2">
                <div className="flex items-center gap-2">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                        className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center shadow-lg shadow-rose-200 text-white"
                    >
                        <Heart className="w-5 h-5 fill-white" />
                    </motion.div>
                    <div>
                        <div className="flex items-center gap-1.5 text-xs text-rose-500 font-bold uppercase tracking-wider">
                            <span>Love Match Edition</span>
                            <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        {isEditingName ? (
                            <div className="flex items-center gap-1 mt-0.5">
                                <input
                                    type="text"
                                    value={partnerName}
                                    onChange={(e) => setPartnerName(e.target.value)}
                                    className="text-base font-extrabold text-slate-800 bg-white/90 border border-rose-300 rounded-lg px-2 py-0.5 w-32 focus:outline-none focus:ring-2 focus:ring-rose-400"
                                    autoFocus
                                    onBlur={() => setIsEditingName(false)}
                                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                                />
                                <button
                                    onClick={() => setIsEditingName(false)}
                                    className="text-xs bg-rose-500 text-white px-2 py-1 rounded-md"
                                >
                                    OK
                                </button>
                            </div>
                        ) : (
                            <h1
                                onClick={() => setIsEditingName(true)}
                                className="text-xl md:text-2xl font-black text-slate-800 hover:text-rose-600 cursor-pointer flex items-center gap-1 font-fun"
                                title="Klik untuk mengubah nama"
                            >
                                Untuk: {partnerName} 💖
                                <span className="text-xs text-slate-400 font-normal ml-1">✏️</span>
                            </h1>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={openHistoryModal}
                        className="p-2.5 rounded-2xl bg-white/80 hover:bg-white text-slate-600 hover:text-rose-600 backdrop-blur shadow-sm border border-rose-100 transition-all flex items-center gap-1 text-xs font-semibold"
                        title="Lihat Log Jawaban"
                    >
                        <History className="w-4 h-4 text-rose-500" />
                        <span className="hidden sm:inline">History</span>
                    </button>
                    <button
                        onClick={toggleSound}
                        className="p-2.5 rounded-2xl bg-white/80 hover:bg-white text-slate-600 hover:text-rose-600 backdrop-blur shadow-sm border border-rose-100 transition-all"
                        title={soundEnabled ? 'Matikan Suara' : 'Nyalakan Suara'}
                    >
                        {soundEnabled ? (
                            <Volume2 className="w-4 h-4 text-rose-500" />
                        ) : (
                            <VolumeX className="w-4 h-4 text-slate-400" />
                        )}
                    </button>
                </div>
            </header>

            {/* Main Interactive Stage */}
            <main className="w-full max-w-xl z-10 flex-1 flex flex-col justify-center my-4">
                <AnimatePresence mode="wait">
                    {/* STEP 0: Welcome Screen */}
                    {currentStep === 0 && (
                        <motion.div
                            key="step-welcome"
                            initial={{ opacity: 0, scale: 0.88, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -30 }}
                            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                            className="glass-card p-6 md:p-10 rounded-3xl text-center space-y-6 relative overflow-hidden"
                        >
                            <div className="inline-block p-4 rounded-3xl bg-gradient-to-tr from-rose-200 to-pink-100 text-rose-600 shadow-inner">
                                <motion.div
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                                >
                                    <Heart className="w-16 h-16 fill-rose-500 text-rose-500 mx-auto filter drop-shadow" />
                                </motion.div>
                            </div>

                            <div className="space-y-2">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/80 text-rose-700 text-xs font-bold tracking-wider">
                                    <Stars className="w-3.5 h-3.5" /> PESAN SPESIAL HARI INI
                                </div>
                                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight font-fun">
                                    Hai, {partnerName}! ✨
                                </h2>
                                <p className="text-sm md:text-base text-slate-600 max-w-md mx-auto leading-relaxed">
                                    Ada beberapa pertanyaan rahasia yang cuma bisa dijawab dengan jujur oleh kamu. Siap buat uji chemistry kita?
                                </p>
                            </div>

                            <div className="pt-2">
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        sounds.playPop();
                                        setCurrentStep(1);
                                    }}
                                    className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 text-white font-extrabold text-base md:text-lg shadow-xl shadow-rose-300/60 flex items-center justify-center gap-3 transition-all"
                                >
                                    <span>Mulai Kuis Cinta</span>
                                    <ArrowRight className="w-5 h-5" />
                                </motion.button>
                            </div>

                            <div className="flex items-center justify-center gap-4 text-xs text-slate-400 font-medium">
                                <span className="flex items-center gap-1">🔒 100% Rahasia</span>
                                <span className="flex items-center gap-1">💖 Dibuat dengan cinta</span>
                                <span className="flex items-center gap-1">✨ Bouncy Vibes</span>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 1..N: Question Steps with Bouncy Framer Motion */}
                    {currentStep >= 1 && currentStep <= totalQuestions && (
                        <motion.div
                            key={`step-${currentStep}`}
                            initial={{ opacity: 0, scale: 0.85, y: 40, rotate: -1 }}
                            animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.88, y: -40, rotate: 1 }}
                            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                            className="glass-card p-6 md:p-8 rounded-3xl space-y-6 shadow-xl relative"
                        >
                            {/* Question Progress Bar */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center text-xs font-bold text-rose-500">
                                    <span>
                                        Pertanyaan {currentStep} dari {totalQuestions}
                                    </span>
                                    <span>{progressPercent}% Complete</span>
                                </div>
                                <div className="w-full h-2.5 bg-rose-100 rounded-full overflow-hidden p-0.5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressPercent}%` }}
                                        transition={{ type: 'spring', stiffness: 120, damping: 15 }}
                                        className="h-full bg-gradient-to-r from-rose-400 via-pink-500 to-rose-500 rounded-full"
                                    />
                                </div>
                            </div>

                            {/* Current Question Data */}
                            {(() => {
                                const q = questions[currentStep - 1];
                                if (!q) return null;

                                return (
                                    <div className="space-y-4">
                                        <div className="space-y-1 text-center">
                                            <span className="inline-block text-xs font-extrabold uppercase tracking-wider text-rose-600 bg-rose-100 px-3 py-1 rounded-full">
                                                {q.title}
                                            </span>
                                            <h3 className="text-xl md:text-2xl font-black text-slate-800 leading-snug pt-1 font-fun">
                                                {q.question}
                                            </h3>
                                            {q.subtitle && (
                                                <p className="text-xs md:text-sm text-rose-500 font-semibold">{q.subtitle}</p>
                                            )}
                                        </div>

                                        {/* TYPE: OPTIONS */}
                                        {q.type === 'options' && (
                                            <div className="grid grid-cols-1 gap-3 pt-2">
                                                {q.options.map((opt) => {
                                                    const isSelected = answers[q.id]?.id === opt.id;
                                                    return (
                                                        <motion.button
                                                            key={opt.id}
                                                            whileHover={{ scale: 1.02, y: -2 }}
                                                            whileTap={{ scale: 0.97 }}
                                                            onClick={() => handleSelectOption(q.id, opt)}
                                                            className={`p-4 rounded-2xl text-left border-2 flex items-center justify-between transition-all ${
                                                                isSelected
                                                                    ? 'bg-rose-50/90 border-rose-500 text-rose-950 shadow-md ring-2 ring-rose-300'
                                                                    : 'bg-white/80 border-rose-100 hover:border-rose-300 text-slate-700'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-2xl shrink-0">{opt.emoji}</span>
                                                                <span className="font-semibold text-sm md:text-base leading-snug">
                                                                    {opt.label}
                                                                </span>
                                                            </div>
                                                            {isSelected && (
                                                                <motion.div
                                                                    initial={{ scale: 0 }}
                                                                    animate={{ scale: 1 }}
                                                                    className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 ml-2 shadow-sm"
                                                                >
                                                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                                </motion.div>
                                                            )}
                                                        </motion.button>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* TYPE: SLIDER */}
                                        {q.type === 'slider' && (
                                            <div className="space-y-6 pt-4 text-center">
                                                <div className="p-6 rounded-3xl bg-rose-50/70 border border-rose-100 shadow-inner">
                                                    <motion.div
                                                        key={sliderValue}
                                                        initial={{ scale: 0.8 }}
                                                        animate={{ scale: 1 }}
                                                        className="text-5xl font-black text-rose-600 font-fun"
                                                    >
                                                        {sliderValue}%
                                                    </motion.div>
                                                    <p className="text-sm font-bold text-slate-700 mt-2">
                                                        {sliderValue < 30
                                                            ? q.descriptions['0']
                                                            : sliderValue < 70
                                                            ? q.descriptions['50']
                                                            : sliderValue < 90
                                                            ? q.descriptions['80']
                                                            : q.descriptions['100']}
                                                    </p>
                                                </div>

                                                <div className="px-4">
                                                    <input
                                                        type="range"
                                                        min={q.min || 0}
                                                        max={q.max || 100}
                                                        value={sliderValue}
                                                        onChange={(e) => {
                                                            sounds.playPop();
                                                            setSliderValue(Number(e.target.value));
                                                        }}
                                                        className="w-full h-3 bg-rose-200 rounded-lg appearance-none cursor-pointer accent-rose-500 focus:outline-none"
                                                    />
                                                    <div className="flex justify-between text-xs text-slate-400 mt-2 font-semibold">
                                                        <span>0% (Mustahil)</span>
                                                        <span>50%</span>
                                                        <span>100% (Maksimal!)</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* TYPE: FINAL QUESTION (With Confetti & Runaway "Tidak" button) */}
                                        {q.type === 'final' && (
                                            <div className="space-y-8 pt-4">
                                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative min-h-[140px]">
                                                    {/* The "IYA" button - grows bigger with every "No" attempt */}
                                                    <motion.button
                                                        style={{
                                                            transform: `scale(${1 + Math.min(noCount * 0.12, 0.6)})`
                                                        }}
                                                        whileHover={{ scale: 1.08 }}
                                                        whileTap={{ scale: 0.94 }}
                                                        onClick={handleYesClick}
                                                        className="py-4 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 via-rose-500 to-pink-500 hover:from-emerald-600 hover:to-rose-600 text-white font-extrabold text-lg md:text-xl shadow-xl shadow-rose-300/70 flex items-center justify-center gap-2 transition-all z-20 cursor-pointer"
                                                    >
                                                        <PartyPopper className="w-6 h-6" />
                                                        <span>{q.yesLabel || 'Iya! Mau Banget! 💖'}</span>
                                                    </motion.button>

                                                    {/* The "TIDAK" button - playfully runs away & dodges */}
                                                    <motion.button
                                                        animate={{
                                                            x: noPosition.x,
                                                            y: noPosition.y,
                                                            scale: Math.max(0.65, 1 - noCount * 0.08)
                                                        }}
                                                        transition={{ type: 'spring', stiffness: 350, damping: 18 }}
                                                        onMouseEnter={handleNoHoverOrClick}
                                                        onClick={handleNoHoverOrClick}
                                                        className="py-3 px-5 rounded-2xl bg-slate-200/90 hover:bg-slate-300 text-slate-600 font-semibold text-xs md:text-sm border border-slate-300 select-none cursor-pointer transition-colors shadow-sm"
                                                    >
                                                        {noButtonTexts[noCount % noButtonTexts.length]}
                                                    </motion.button>
                                                </div>

                                                {noCount > 0 && (
                                                    <motion.p
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className="text-xs text-rose-500 text-center font-bold italic"
                                                    >
                                                        Hihihi tombol penolakan lagi mogok kerja, pilih yang kiri aja ya! 😜
                                                    </motion.p>
                                                )}
                                            </div>
                                        )}

                                        {/* Navigation buttons for standard questions */}
                                        {q.type !== 'final' && (
                                            <div className="flex items-center justify-between pt-4 border-t border-rose-100">
                                                <button
                                                    onClick={handleBack}
                                                    className="py-2.5 px-4 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-semibold flex items-center gap-1 hover:bg-rose-50 transition-colors"
                                                >
                                                    <ArrowLeft className="w-4 h-4" /> Kembali
                                                </button>

                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={handleNext}
                                                    className="py-2.5 px-6 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs md:text-sm shadow-md shadow-rose-200 flex items-center gap-1.5 transition-all"
                                                >
                                                    <span>Lanjut</span>
                                                    <ArrowRight className="w-4 h-4" />
                                                </motion.button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </motion.div>
                    )}

                    {/* STEP N+1: Celebration & Love Victory Screen */}
                    {currentStep > totalQuestions && (
                        <motion.div
                            key="step-celebration"
                            initial={{ opacity: 0, scale: 0.8, y: 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                            className="space-y-6"
                        >
                            {/* Victory Card */}
                            <div className="glass-card p-6 md:p-8 rounded-3xl text-center space-y-4 relative overflow-hidden shadow-2xl">
                                <motion.div
                                    animate={{ scale: [1, 1.25, 1], rotate: [0, 5, -5, 0] }}
                                    transition={{ repeat: Infinity, duration: 2.2 }}
                                    className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-300 flex items-center justify-center text-white shadow-xl shadow-rose-300"
                                >
                                    <Sparkles className="w-10 h-10 fill-white" />
                                </motion.div>

                                <div className="space-y-1">
                                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-extrabold uppercase tracking-wider">
                                        Jawaban Diterima! 🎉
                                    </span>
                                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 font-fun mt-2">
                                        She Said YES! 💖🥳
                                    </h2>
                                    <p className="text-sm md:text-base text-slate-600 max-w-md mx-auto">
                                        Horeee! Terima kasih banyak sudah memilih "Iya", {partnerName}! Hari ini resmi jadi hari paling bahagia sedunia!
                                    </p>
                                </div>

                                <div className="flex justify-center gap-2 pt-2">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={triggerBigConfetti}
                                        className="py-2.5 px-5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-xs flex items-center gap-2 transition-colors"
                                    >
                                        <PartyPopper className="w-4 h-4 text-rose-600" />
                                        Ledakkan Confetti Lagi! 🎊
                                    </motion.button>
                                </div>
                            </div>

                            {/* Official Date Certificate */}
                            <DateCertificate
                                partnerName={partnerName}
                                datePlan={answers[2]?.label}
                                onReset={resetQuiz}
                            />

                            {/* Sweet Message to the Sender */}
                            <div className="glass-card p-6 rounded-3xl space-y-4">
                                <div className="flex items-center gap-2 text-rose-600">
                                    <Send className="w-4 h-4" />
                                    <h4 className="font-extrabold text-sm md:text-base">Kirim Pesan Manis Balasan</h4>
                                </div>
                                <p className="text-xs text-slate-500">
                                    Tulis pesan atau harapan kamu buat dia (pesan ini otomatis tersimpan ke server!):
                                </p>

                                {noteSubmitted ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold text-center"
                                    >
                                        ✅ Pesan manismu sudah berhasil terkirim dan tersimpan! Makasih yaa 🥰
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSendSweetNote} className="space-y-3">
                                        <textarea
                                            value={sweetNote}
                                            onChange={(e) => setSweetNote(e.target.value)}
                                            placeholder="Contoh: Jangan lupa jemput tepat waktu yaa, aku tunggu es krimnya! 🍦❤️"
                                            rows={3}
                                            className="w-full p-3 rounded-2xl bg-white/90 border border-rose-200 text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
                                        />
                                        <button
                                            type="submit"
                                            disabled={isSubmittingNote || !sweetNote.trim()}
                                            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                                        >
                                            <Send className="w-3.5 h-3.5" />
                                            {isSubmittingNote ? 'Sedang Mengirim...' : 'Kirim Pesan Balasan 💌'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* History Modal */}
            <AnimatePresence>
                {showHistory && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col"
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <div className="flex items-center gap-2 text-rose-600">
                                    <History className="w-5 h-5" />
                                    <h3 className="font-extrabold text-base text-slate-800">Riwayat Tanggapan (Log)</h3>
                                </div>
                                <button
                                    onClick={() => setShowHistory(false)}
                                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
                                {historyList.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400 text-xs">
                                        Belum ada rekaman jawaban tersimpan.
                                    </div>
                                ) : (
                                    historyList.map((item) => (
                                        <div
                                            key={item.id}
                                            className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100 text-xs space-y-1.5"
                                        >
                                            <div className="flex justify-between items-center font-bold text-slate-700">
                                                <span className="text-rose-600">👤 {item.respondent_name}</span>
                                                <span className="text-[10px] text-slate-400">
                                                    {new Date(item.created_at).toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                            <div className="text-slate-600">
                                                <span className="font-semibold">Jawaban Akhir:</span>{' '}
                                                <span className="text-emerald-600 font-extrabold">{item.final_answer}</span>
                                            </div>
                                            {item.chosen_date_activity && (
                                                <div className="text-slate-600">
                                                    <span className="font-semibold">Rencana Kencan:</span> {item.chosen_date_activity}
                                                </div>
                                            )}
                                            {item.message && (
                                                <div className="p-2 rounded-xl bg-white/80 border border-rose-100 text-rose-900 italic">
                                                    "{item.message}"
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>

                            <button
                                onClick={() => setShowHistory(false)}
                                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                            >
                                Tutup
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer */}
            <footer className="text-center z-10 text-xs text-rose-400/80 font-medium mt-4">
                Dibuat khusus untuk momen terindah bersama {partnerName} • Laravel + React + Framer Motion 💖
            </footer>
        </div>
    );
}
