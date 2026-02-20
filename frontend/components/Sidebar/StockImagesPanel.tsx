
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Image as ImageIcon, ExternalLink, Loader2, Plus, Download } from 'lucide-react';
import { useStore } from '../../store/useStore';

// Note: In a real production app, you'd store this in .env
// For demo purposes, we provide a placeholder. The user should replace this with their own API key.
const UNSPLASH_ACCESS_KEY = '';

interface UnsplashImage {
    id: string;
    urls: {
        regular: string;
        small: string;
        thumb: string;
    };
    user: {
        name: string;
        links: {
            html: string;
        };
    };
    alt_description: string;
}

const StockImagesPanel: React.FC = () => {
    const { addElement, currentPageIndex, setDraggingItem, uiTheme, setEditorTab } = useStore();
    const [search, setSearch] = useState('nature');
    const [images, setImages] = useState<UnsplashImage[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [apiKey, setApiKey] = useState(UNSPLASH_ACCESS_KEY);

    const fetchImages = async (query: string) => {
        if (!apiKey) {
            setError('Please provide an Unsplash Access Key to search for stock images.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `https://api.unsplash.com/search/photos?query=${query}&per_page=10&client_id=${apiKey}`
            );

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Invalid Unsplash Access Key. Please check your credentials.');
                }
                throw new Error('Failed to fetch images from Unsplash.');
            }

            const data = await response.json();
            setImages(data.results);
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
            setImages([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (apiKey) {
            fetchImages(search);
        }
    }, []);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchImages(search);
    };

    const handleDragStart = (e: React.DragEvent, img: UnsplashImage) => {
        const dragData = {
            type: 'image',
            url: img.urls.regular,
            name: img.alt_description || 'Stock Image',
            source: 'stock'
        };
        e.dataTransfer.setData('application/json', JSON.stringify(dragData));
        e.dataTransfer.effectAllowed = 'copy';
        setDraggingItem(dragData);
    };

    const handleAddImage = (img: UnsplashImage) => {
        addElement(currentPageIndex, {
            id: `stock-${Date.now()}`,
            type: 'image',
            x: 100,
            y: 100,
            width: 400,
            height: 300,
            rotation: 0,
            opacity: 1,
            src: img.urls.regular,
            zIndex: 20
        });
    };

    return (
        <div className={`flex flex-col h-full border-r w-[320px] shrink-0 z-10 shadow-[20px_0_60px_rgba(0,0,0,0.05)] animate-in slide-in-from-left-4 duration-500 font-sans transition-colors ${uiTheme === 'dark' ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className={`p-6 border-b flex items-center justify-between transition-colors ${uiTheme === 'dark' ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
                <div>
                    <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 mb-1">
                        <ImageIcon size={14} className={uiTheme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'} />
                        <span className={uiTheme === 'dark' ? 'text-white' : 'text-slate-400'}>Stock Images</span>
                    </h3>
                </div>
                <button
                    onClick={() => setEditorTab(null)}
                    className={`p-1.5 rounded-lg transition-colors ${uiTheme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-400'}`}
                >
                    <X size={14} />
                </button>
            </div>

            <div className={`p-4 border-b transition-colors ${uiTheme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50/50 border-slate-100'}`}>
                {!apiKey ? (
                    <div className="space-y-3">
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Enter Unsplash Access Key</p>
                        <div className="flex gap-2">
                            <input
                                type="password"
                                placeholder="Access Key..."
                                className={`flex-1 border rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 ${uiTheme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        setApiKey(e.currentTarget.value);
                                        setSearch(search); // trigger fetch if key added
                                    }
                                }}
                            />
                            <button
                                onClick={(e) => {
                                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                    setApiKey(input.value);
                                }}
                                className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors"
                            >
                                Set
                            </button>
                        </div>
                        <a href="https://unsplash.com/developers" target="_blank" rel="noopener noreferrer" className="text-[10px] text-indigo-500 flex items-center gap-1 hover:underline">
                            Get Key <ExternalLink size={10} />
                        </a>
                    </div>
                ) : (
                    <form onSubmit={handleSearchSubmit} className="relative group">
                        <Search size={14} className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${uiTheme === 'dark' ? 'text-slate-500 group-focus-within:text-indigo-400' : 'text-slate-300 group-focus-within:text-indigo-600'}`} />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search Unsplash..."
                            className={`w-full border rounded-2xl pl-10 pr-4 py-3 text-xs font-bold outline-none transition-all focus:ring-4 ${uiTheme === 'dark' ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:ring-indigo-500/20 focus:border-indigo-500' : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-300 focus:ring-indigo-600/5 focus:border-indigo-600'}`}
                        />
                        {loading && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-indigo-500" />}
                    </form>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {error && (
                    <div className="py-12 text-center px-6">
                        <p className="text-xs text-red-500 font-medium mb-2">{error}</p>
                        {!apiKey && (
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest leading-relaxed">
                                Authentication Required
                            </p>
                        )}
                    </div>
                )}

                {!loading && !error && images.length === 0 && apiKey && (
                    <div className="py-24 text-center px-6">
                        <div className={`w-16 h-16 rounded-[28px] flex items-center justify-center mx-auto mb-6 border shadow-inner transition-colors ${uiTheme === 'dark' ? 'bg-slate-800/50 border-slate-700 text-slate-600' : 'bg-slate-50 border-slate-100 text-slate-200'}`}>
                            <Download size={32} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                            Find beautiful free images <br /> to use in your catalog
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3 content-start">
                    {images.map((img) => (
                        <div
                            key={img.id}
                            draggable="true"
                            onDragStart={(e) => handleDragStart(e, img)}
                            onDragEnd={() => setDraggingItem(null)}
                            className={`group rounded-2xl overflow-hidden relative border transition-all cursor-grab active:cursor-grabbing shadow-sm hover:shadow-xl ${uiTheme === 'dark' ? 'bg-slate-800 border-slate-700 hover:border-indigo-500' : 'bg-slate-50 border-slate-100 hover:border-indigo-600'}`}
                            onClick={() => handleAddImage(img)}
                        >
                            <img
                                src={img.urls.small}
                                className="w-full aspect-square object-cover transition-transform group-hover:scale-110 duration-700 pointer-events-none"
                                alt={img.alt_description}
                            />

                            <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none">
                                <p className="text-[8px] font-black text-white truncate shadow-sm">{img.user.name}</p>
                            </div>

                            <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className={`w-5 h-5 backdrop-blur-md rounded-lg flex items-center justify-center shadow-lg ${uiTheme === 'dark' ? 'bg-slate-900/90 text-indigo-400' : 'bg-white/90 text-indigo-600'}`}>
                                    <Plus size={10} strokeWidth={4} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StockImagesPanel;
