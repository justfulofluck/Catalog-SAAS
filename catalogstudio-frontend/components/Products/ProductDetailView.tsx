import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingBag, Heart, Share2, Star, Truck, Shield, RotateCcw, Edit, Maximize2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useToast } from '../../components/Shared/ToastProvider';

const ProductDetailView: React.FC = () => {
    const { products, viewingProductId, setView, setEditingProductId, categories } = useStore();
    const { success } = useToast();
    const [isVisible, setIsVisible] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const product = products.find(p => p.id === viewingProductId);
    const category = categories.find(c => c.id === product?.categoryId);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 50);
        return () => clearTimeout(timer);
    }, []);

    if (!product) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#f8fafc] dark:bg-slate-950">
                <div className="text-center space-y-4">
                    <p className="text-slate-400 font-medium">Product not found</p>
                    <button
                        onClick={() => setView('products-list')}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold"
                    >
                        Back to Library
                    </button>
                </div>
            </div>
        );
    }

    // Mock data for rich UI
    const images = [product.image, ...Array(3).fill(product.image)]; // Simulate gallery
    const features = [
        { icon: Truck, label: 'Free Shipping', desc: 'On orders over $500' },
        { icon: Shield, label: '2 Year Warranty', desc: 'Full coverage' },
        { icon: RotateCcw, label: '30 Day Returns', desc: 'No questions asked' }
    ];

    const handleEdit = () => {
        setEditingProductId(product.id);
        setView('edit-product');
    };

    const handleAddToCart = () => {
        success("Added to cart (Demo Mode)");
    };

    return (
        <div className={`flex-1 overflow-y-auto bg-[#f8fafc] dark:bg-slate-950 p-6 lg:p-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Navigation Header */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => setView('products-list')}
                        className="flex items-center gap-2 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:text-indigo-700 transition-colors"
                    >
                        <ArrowLeft size={14} /> Back to Library
                    </button>
                    <div className="flex items-center gap-3">
                        <button className="p-3 bg-white dark:bg-slate-900 rounded-full shadow-sm border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-rose-500 transition-colors">
                            <Heart size={20} />
                        </button>
                        <button className="p-3 bg-white dark:bg-slate-900 rounded-full shadow-sm border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-indigo-600 transition-colors">
                            <Share2 size={20} />
                        </button>
                        <button
                            onClick={handleEdit}
                            className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest hover:shadow-lg transition-all flex items-center gap-2"
                        >
                            <Edit size={14} /> Edit Asset
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                    {/* Left Column: Gallery */}
                    <div className="space-y-6">
                        <div className="aspect-square bg-white dark:bg-slate-900 rounded-[32px] p-8 flex items-center justify-center relative shadow-2xl shadow-indigo-900/5 group border border-slate-100 dark:border-slate-800 overflow-hidden">
                            <img
                                src={images[activeImageIndex]}
                                alt={product.name}
                                className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-500 group-hover:scale-110"
                            />
                            <button className="absolute top-6 right-6 p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl text-slate-600 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
                                <Maximize2 size={20} />
                            </button>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImageIndex(idx)}
                                    className={`aspect-square rounded-2xl p-2 bg-white dark:bg-slate-900 border-2 transition-all ${activeImageIndex === idx ? 'border-indigo-600 dark:border-indigo-400' : 'border-slate-100 dark:border-slate-800 hover:border-indigo-200'}`}
                                >
                                    <img src={img} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: details */}
                    <div className="space-y-10 py-4">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                {category && (
                                    <span
                                        className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
                                        style={{ backgroundColor: `${category.color}20`, color: category.color }}
                                    >
                                        {category.name}
                                    </span>
                                )}
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500`}>
                                    SKU: {product.sku}
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                                {product.name}
                            </h1>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center text-amber-500 gap-1">
                                    <Star size={18} fill="currentColor" />
                                    <Star size={18} fill="currentColor" />
                                    <Star size={18} fill="currentColor" />
                                    <Star size={18} fill="currentColor" />
                                    <Star size={18} className="text-slate-200 dark:text-slate-700" />
                                </div>
                                <span className="text-sm font-bold text-slate-400 dark:text-slate-500">(128 Reviews)</span>
                            </div>
                            <div className="text-3xl font-black text-slate-900 dark:text-white flex items-baseline gap-2">
                                <span>{product.currency}{product.price.toFixed(2)}</span>
                                <span className="text-lg text-slate-400 line-through font-bold">{product.currency}{(product.price * 1.2).toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="prose prose-slate dark:prose-invert">
                            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
                                {product.description || "Experience premium quality and timeless design. This piece is crafted with attention to detail, making it a perfect addition to your collection. Designed for both functionality and aesthetic appeal."}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {features.map((feat, i) => (
                                <div key={i} className="flex gap-4 items-start p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                    <div className="p-2 bg-indigo-600/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400 rounded-lg shrink-0">
                                        <feat.icon size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black uppercase tracking-wide text-slate-900 dark:text-white mb-1">{feat.label}</h4>
                                        <p className="text-[10px] font-bold text-slate-400">{feat.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 py-5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                            >
                                <ShoppingBag size={20} /> Add to Cart
                            </button>
                            <button className="px-8 py-5 border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-600 dark:hover:border-indigo-500 text-slate-900 dark:text-white rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 transition-all">
                                Buy Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailView;
