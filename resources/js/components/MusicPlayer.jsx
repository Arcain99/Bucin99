import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Music, Disc3, Sparkles } from 'lucide-react';

export default function MusicPlayer() {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    // Menggunakan path /bgm.mp3 sebagai sumber utama yang bersih dari karakter khusus
    const songSrc = '/bgm.mp3';
    const songTitle = 'Dunia Yang Nanti';
    const artistName = 'Raim Laode';

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.volume = 0.8;

        // Coba putar langsung saat halaman dimuat
        const startAudio = () => {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        setIsPlaying(true);
                        setHasInteracted(true);
                        setShowHint(false);
                    })
                    .catch((err) => {
                        console.log('Autoplay ditahan browser (menunggu interaksi pertama):', err);
                        setIsPlaying(false);
                        setShowHint(true);
                    });
            }
        };

        startAudio();

        // Handler saat pengguna menyentuh/mengklik di mana saja pertama kali
        const handleInteraction = () => {
            if (audio && audio.paused) {
                audio.play()
                    .then(() => {
                        setIsPlaying(true);
                        setHasInteracted(true);
                        setShowHint(false);
                    })
                    .catch(() => {});
            }
        };

        const events = ['click', 'touchstart', 'touchend', 'pointerdown', 'keydown'];
        events.forEach(evt => window.addEventListener(evt, handleInteraction, { passive: true }));

        return () => {
            events.forEach(evt => window.removeEventListener(evt, handleInteraction));
        };
    }, []);

    const togglePlay = (e) => {
        e.stopPropagation();
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            audio.play()
                .then(() => {
                    setIsPlaying(true);
                    setHasInteracted(true);
                    setShowHint(false);
                })
                .catch((err) => console.log('Audio play error:', err));
        }
    };

    const toggleMute = (e) => {
        e.stopPropagation();
        const audio = audioRef.current;
        if (!audio) return;

        audio.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    return (
        <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50 select-none">
            {/* Audio Element Tersembunyi */}
            <audio
                ref={audioRef}
                src="/bgm.mp3"
                loop
                preload="auto"
                playsInline
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
            >
                <source src="/bgm.mp3" type="audio/mpeg" />
                <source src="/Raim Laode _Dunia Yang Nanti_ (Lirik Lagu).mp3" type="audio/mpeg" />
            </audio>

            {/* Hint Popup jika Browser Memblokir Autoplay Awal */}
            <AnimatePresence>
                {!isPlaying && showHint && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.9 }}
                        onClick={togglePlay}
                        className="mb-2 cursor-pointer bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg shadow-rose-300/60 flex items-center gap-1.5 border border-white/40 hover:scale-105 transition-transform"
                    >
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        <span>Klik untuk putar lagu romantis 🎶</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Music Widget Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => setIsExpanded(!isExpanded)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl backdrop-blur-md bg-white/85 border border-[#F3DEC9] shadow-lg shadow-rose-200/40 transition-all cursor-pointer ${
                    isPlaying ? 'ring-2 ring-rose-300/60' : 'opacity-90'
                }`}
            >
                {/* Animasi Disc / Piringan Hitam Berputar */}
                <div className="relative flex items-center justify-center">
                    <motion.div
                        animate={{ rotate: isPlaying ? 360 : 0 }}
                        transition={{
                            repeat: isPlaying ? Infinity : 0,
                            duration: 5,
                            ease: 'linear',
                        }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isPlaying
                                ? 'bg-gradient-to-tr from-rose-400 to-pink-500 text-white shadow-md shadow-rose-300'
                                : 'bg-[#FFF0E5] text-[#AA7D5C]'
                        }`}
                    >
                        <Disc3 className="w-5 h-5" />
                    </motion.div>

                    {/* Titik indikator bermain */}
                    {isPlaying && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                        </span>
                    )}
                </div>

                {/* Info Lagu & Equalizer Animasi */}
                <div className="flex flex-col text-left">
                    <div className="flex items-center gap-1.5">
                        <span className="text-[11px] sm:text-xs font-black text-[#5C3D2E] tracking-tight truncate max-w-[110px] sm:max-w-[145px]">
                            {songTitle}
                        </span>
                        {/* Mini Equalizer Bar Animasi */}
                        {isPlaying ? (
                            <div className="flex items-end gap-0.5 h-3">
                                <span className="w-0.5 bg-rose-500 rounded-full animate-[bounce_0.6s_ease-in-out_infinite] h-3"></span>
                                <span className="w-0.5 bg-pink-400 rounded-full animate-[bounce_0.8s_ease-in-out_infinite_0.15s] h-2"></span>
                                <span className="w-0.5 bg-rose-500 rounded-full animate-[bounce_0.5s_ease-in-out_infinite_0.3s] h-3.5"></span>
                            </div>
                        ) : (
                            <span className="text-[9px] text-[#AA7D5C]/70">⏸</span>
                        )}
                    </div>
                    <span className="text-[10px] font-semibold text-[#FF8E9E]">
                        {artistName}
                    </span>
                </div>

                {/* Kontrol Tombol Play / Pause & Mute */}
                <div className="flex items-center gap-1 ml-1" onClick={(e) => e.stopPropagation()}>
                    <button
                        type="button"
                        onClick={togglePlay}
                        className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                            isPlaying
                                ? 'bg-rose-100 hover:bg-rose-200 text-rose-600'
                                : 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm shadow-rose-400'
                        }`}
                        title={isPlaying ? 'Jeda Lagu' : 'Putar Lagu'}
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                        {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                    </button>

                    <button
                        type="button"
                        onClick={toggleMute}
                        className="w-7 h-7 rounded-xl bg-[#FFF8F0] hover:bg-[#FFF0E5] text-[#AA7D5C] hover:text-[#5C3D2E] flex items-center justify-center transition-colors"
                        title={isMuted ? 'Bunyikan' : 'Senyap'}
                        aria-label={isMuted ? 'Unmute' : 'Mute'}
                    >
                        {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
