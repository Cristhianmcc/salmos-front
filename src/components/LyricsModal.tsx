import { X, Loader2, Music2 } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { useMemo, useState, useRef, useEffect } from "react";

interface LyricsModalProps {
    isOpen: boolean;
    onClose: () => void;
    songTitle: string;
    artist: string;
    cover?: string;
    lyrics: string | null;
    loading: boolean;
}

export function LyricsModal({
    isOpen,
    onClose,
    songTitle,
    artist,
    cover,
    lyrics,
    loading,
}: LyricsModalProps) {
    const [activeTab, setActiveTab] = useState<'siguiente' | 'letra' | 'relacionado'>('letra');
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const mobileScrollRef = useRef<HTMLDivElement>(null);

    // Inyectar estilos de scrollbar directamente
    useEffect(() => {
        const styleId = 'custom-lyrics-scrollbar';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                .scrollbar-desktop::-webkit-scrollbar {
                    width: 10px;
                }
                .scrollbar-desktop::-webkit-scrollbar-track {
                    background: rgba(30, 30, 30, 0.3);
                    border-radius: 5px;
                }
                .scrollbar-desktop::-webkit-scrollbar-thumb {
                    background: rgba(100, 100, 100, 0.5);
                    border-radius: 5px;
                    border: 2px solid transparent;
                    background-clip: padding-box;
                }
                .scrollbar-desktop::-webkit-scrollbar-thumb:hover {
                    background: rgba(130, 130, 130, 0.7);
                }
                .scrollbar-mobile::-webkit-scrollbar {
                    width: 8px;
                }
                .scrollbar-mobile::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.15);
                    border-radius: 4px;
                }
                .scrollbar-mobile::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.4);
                    border-radius: 4px;
                    border: 1px solid rgba(0, 0, 0, 0.1);
                    background-clip: padding-box;
                }
                .scrollbar-mobile::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.6);
                }
            `;
            document.head.appendChild(style);
        }
    }, []);

    const formattedLyrics = useMemo(() => {
        if (!lyrics) return [];
        // Dividir las letras por líneas y filtrar líneas vacías
        return lyrics.trim().split('\n').filter(line => line.trim().length > 0);
    }, [lyrics]);

    return (
        <>
            {/* Mobile: Overlay con imagen de fondo - ajustado entre header y player */}
            {isOpen && (
                <div 
                    className="fixed z-20 md:hidden"
                    style={{ 
                        top: '72px', // Altura del header móvil
                        bottom: '168px', // Altura del player + navegación
                        left: 0,
                        right: 0
                    }}
                >
                    {/* Imagen de fondo completa */}
                    {cover && (
                        <div 
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ 
                                backgroundImage: `url(${cover})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}
                        >
                            {/* Overlay oscuro gradiente */}
                            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/75 to-black/90" />
                        </div>
                    )}
                    
                    {/* Header con handle para deslizar */}
                    <div className="relative z-10 flex flex-col items-center pt-3 pb-2 flex-shrink-0">
                        {/* Handle bar para deslizar hacia abajo */}
                        <button
                            onClick={onClose}
                            className="w-full flex justify-center py-1"
                        >
                            <div className="w-12 h-1.5 bg-white/50 rounded-full" />
                        </button>
                    </div>

                    {/* Contenido de letras - scroll suave manual con scrollbar visible */}
                    <div 
                        ref={mobileScrollRef}
                        className="flex-1 relative z-10 scrollbar-mobile"
                        style={{ 
                            height: 'calc(100% - 40px)',
                            scrollBehavior: 'smooth',
                            WebkitOverflowScrolling: 'touch',
                            overflowY: 'scroll',
                            overflowX: 'hidden'
                        }}
                    >
                        <div className="px-6 py-12">
                            {loading ? (
                                <div className="flex flex-col items-center gap-4 text-white/70 min-h-[300px] justify-center">
                                    <Loader2 className="w-8 h-8 animate-spin" />
                                    <p className="text-sm">Cargando letra...</p>
                                </div>
                            ) : formattedLyrics && formattedLyrics.length > 0 ? (
                                <div className="text-center w-full space-y-4">
                                    {formattedLyrics.map((line, index) => (
                                        <p 
                                            key={index}
                                            className="lyrics-text-content-mobile animate-fade-in"
                                            style={{ 
                                                animationDelay: `${index * 0.05}s`,
                                                animationFillMode: 'both'
                                            }}
                                        >
                                            {line}
                                        </p>
                                    ))}
                                    {/* Espaciado adicional al final para scroll completo */}
                                    <div className="h-96"></div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-4 text-white/40">
                                    <Music2 className="w-12 h-12" />
                                    <p className="text-sm">No hay letra disponible</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            {/* Desktop: Panel lateral - solo se muestra cuando isOpen es true */}
            {isOpen && (
                <aside 
                    className="fixed top-0 right-0 bottom-0 bg-[#000000] border-l border-white/10 z-40 hidden md:flex flex-col w-[420px] max-w-[420px]"
                    style={{ width: '420px', backgroundColor: '#000000' }}
                >
                {/* Header con tabs */}
            <div className="flex-shrink-0 border-b border-white/10">
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex gap-8">
                        <button
                            className={`text-xs font-semibold uppercase tracking-widest pb-2 transition-colors relative ${
                                activeTab === 'siguiente' 
                                    ? 'text-white' 
                                    : 'text-white/50 hover:text-white/70'
                            }`}
                            onClick={() => setActiveTab('siguiente')}
                        >
                            Siguiente
                            {activeTab === 'siguiente' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
                            )}
                        </button>
                        <button
                            className={`text-xs font-semibold uppercase tracking-widest pb-2 transition-colors relative ${
                                activeTab === 'letra' 
                                    ? 'text-white' 
                                    : 'text-white/50 hover:text-white/70'
                            }`}
                            onClick={() => setActiveTab('letra')}
                        >
                            Letra
                            {activeTab === 'letra' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
                            )}
                        </button>
                        <button
                            className={`text-xs font-semibold uppercase tracking-widest pb-2 transition-colors relative ${
                                activeTab === 'relacionado' 
                                    ? 'text-white' 
                                    : 'text-white/50 hover:text-white/70'
                            }`}
                            onClick={() => setActiveTab('relacionado')}
                        >
                            Relacionado
                            {activeTab === 'relacionado' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
                            )}
                        </button>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Song Info */}
            <div className="flex-shrink-0 px-6 py-5 border-b border-white/10">
                <h2 className="text-xl font-semibold text-white">{songTitle}</h2>
                <p className="text-sm text-white/60 mt-1">{artist}</p>
            </div>

            {/* Content */}
            <div 
                ref={scrollContainerRef}
                className="flex-1 px-6 py-8 pb-32 scrollbar-desktop"
                style={{ 
                    scrollBehavior: 'smooth',
                    overflowY: 'scroll',
                    overflowX: 'hidden'
                }}
            >
                <div>
                    {activeTab === 'letra' && (
                        loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4 text-white/50">
                                <Loader2 className="w-8 h-8 animate-spin" />
                                <p className="text-sm">Cargando letra...</p>
                            </div>
                        ) : formattedLyrics && formattedLyrics.length > 0 ? (
                            <div>
                                <div className="space-y-5">
                                    {formattedLyrics.map((line, index) => (
                                        <div 
                                            key={index}
                                            className="lyrics-text-content animate-fade-in"
                                            style={{ 
                                                animationDelay: `${index * 0.05}s`,
                                                animationFillMode: 'both'
                                            }}
                                        >
                                            {line}
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-16 pb-32 opacity-40">
                                    <p className="text-xs text-white/60 uppercase tracking-wider">
                                        Fuente: YouTube Music
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 gap-4 text-white/30">
                                <Music2 className="w-12 h-12" />
                                <p className="text-sm">No hay letra disponible</p>
                            </div>
                        )
                    )}
                    {activeTab === 'siguiente' && (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 text-white/30">
                            <Music2 className="w-12 h-12" />
                            <p className="text-sm">Siguiente en cola</p>
                        </div>
                    )}
                    {activeTab === 'relacionado' && (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 text-white/30">
                            <Music2 className="w-12 h-12" />
                            <p className="text-sm">Canciones relacionadas</p>
                        </div>
                    )}
                </div>
            </div>
                </aside>
            )}
        </>
    );
}