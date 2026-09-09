import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { ShapeType, CanvasElement } from '../../types';
import { ChevronDown, Search, Link as LinkIcon, Sparkles, X, Globe, Phone, Mail, MessageCircle, ArrowRight } from 'lucide-react';

export interface IconDefinition {
    id: string;
    name: string;
    category: 'contact' | 'social' | 'shopping' | 'media' | 'trust' | 'nav';
    icon: string;
    unicode: string;
    library: 'solid' | 'brands';
    defaultLinkType?: 'url' | 'whatsapp' | 'phone' | 'email';
}

export const BUTTON_ICONS: IconDefinition[] = [
    // ── CONTACT & COMMUNICATION ───────────────────────────────────────────
    { id: 'phone', name: 'Phone Call', category: 'contact', icon: 'fa-solid fa-phone', unicode: '\uf095', library: 'solid', defaultLinkType: 'phone' },
    { id: 'whatsapp-contact', name: 'WhatsApp Chat', category: 'contact', icon: 'fa-brands fa-whatsapp', unicode: '\uf232', library: 'brands', defaultLinkType: 'whatsapp' },
    { id: 'envelope', name: 'Send Email', category: 'contact', icon: 'fa-solid fa-envelope', unicode: '\uf0e0', library: 'solid', defaultLinkType: 'email' },
    { id: 'paper-plane', name: 'Send Message', category: 'contact', icon: 'fa-solid fa-paper-plane', unicode: '\uf1d8', library: 'solid', defaultLinkType: 'email' },
    { id: 'comment-dots', name: 'Live Chat', category: 'contact', icon: 'fa-solid fa-comment-dots', unicode: '\uf4ad', library: 'solid', defaultLinkType: 'whatsapp' },
    { id: 'comments', name: 'Discussion', category: 'contact', icon: 'fa-solid fa-comments', unicode: '\uf086', library: 'solid' },
    { id: 'headset', name: 'Customer Support', category: 'contact', icon: 'fa-solid fa-headset', unicode: '\uf590', library: 'solid', defaultLinkType: 'phone' },
    { id: 'mobile', name: 'Mobile Cell', category: 'contact', icon: 'fa-solid fa-mobile-screen-button', unicode: '\uf3cd', library: 'solid', defaultLinkType: 'phone' },
    { id: 'location-dot', name: 'Store Location', category: 'contact', icon: 'fa-solid fa-location-dot', unicode: '\uf3c5', library: 'solid', defaultLinkType: 'url' },
    { id: 'map', name: 'Directions Map', category: 'contact', icon: 'fa-solid fa-map-location-dot', unicode: '\uf5a0', library: 'solid', defaultLinkType: 'url' },
    { id: 'address-book', name: 'Address Book', category: 'contact', icon: 'fa-solid fa-address-book', unicode: '\uf2b9', library: 'solid' },
    { id: 'user', name: 'Profile Contact', category: 'contact', icon: 'fa-solid fa-user', unicode: '\uf007', library: 'solid' },

    // ── SOCIAL MEDIA & BRANDS ─────────────────────────────────────────────
    { id: 'whatsapp-brand', name: 'WhatsApp', category: 'social', icon: 'fa-brands fa-whatsapp', unicode: '\uf232', library: 'brands', defaultLinkType: 'whatsapp' },
    { id: 'instagram', name: 'Instagram', category: 'social', icon: 'fa-brands fa-instagram', unicode: '\uf16d', library: 'brands', defaultLinkType: 'url' },
    { id: 'facebook', name: 'Facebook', category: 'social', icon: 'fa-brands fa-facebook-f', unicode: '\uf39e', library: 'brands', defaultLinkType: 'url' },
    { id: 'youtube', name: 'YouTube Channel', category: 'social', icon: 'fa-brands fa-youtube', unicode: '\uf167', library: 'brands', defaultLinkType: 'url' },
    { id: 'linkedin', name: 'LinkedIn Profile', category: 'social', icon: 'fa-brands fa-linkedin-in', unicode: '\uf0e1', library: 'brands', defaultLinkType: 'url' },
    { id: 'x-twitter', name: 'X / Twitter', category: 'social', icon: 'fa-brands fa-x-twitter', unicode: '\ue61b', library: 'brands', defaultLinkType: 'url' },
    { id: 'telegram', name: 'Telegram Channel', category: 'social', icon: 'fa-brands fa-telegram', unicode: '\uf2c6', library: 'brands', defaultLinkType: 'url' },
    { id: 'tiktok', name: 'TikTok', category: 'social', icon: 'fa-brands fa-tiktok', unicode: '\ue07b', library: 'brands', defaultLinkType: 'url' },
    { id: 'pinterest', name: 'Pinterest', category: 'social', icon: 'fa-brands fa-pinterest-p', unicode: '\uf231', library: 'brands', defaultLinkType: 'url' },
    { id: 'messenger', name: 'Messenger', category: 'social', icon: 'fa-brands fa-facebook-messenger', unicode: '\uf39f', library: 'brands', defaultLinkType: 'url' },
    { id: 'discord', name: 'Discord Server', category: 'social', icon: 'fa-brands fa-discord', unicode: '\uf392', library: 'brands', defaultLinkType: 'url' },
    { id: 'snapchat', name: 'Snapchat', category: 'social', icon: 'fa-brands fa-snapchat', unicode: '\uf2ab', library: 'brands', defaultLinkType: 'url' },
    { id: 'skype', name: 'Skype Call', category: 'social', icon: 'fa-brands fa-skype', unicode: '\uf17e', library: 'brands', defaultLinkType: 'url' },
    { id: 'google', name: 'Google Review', category: 'social', icon: 'fa-brands fa-google', unicode: '\uf1a0', library: 'brands', defaultLinkType: 'url' },
    { id: 'apple', name: 'Apple App', category: 'social', icon: 'fa-brands fa-apple', unicode: '\uf179', library: 'brands', defaultLinkType: 'url' },
    { id: 'android', name: 'Google Play App', category: 'social', icon: 'fa-brands fa-android', unicode: '\uf17b', library: 'brands', defaultLinkType: 'url' },
    { id: 'amazon', name: 'Amazon Store', category: 'social', icon: 'fa-brands fa-amazon', unicode: '\uf270', library: 'brands', defaultLinkType: 'url' },
    { id: 'spotify', name: 'Spotify Music', category: 'social', icon: 'fa-brands fa-spotify', unicode: '\uf1bc', library: 'brands', defaultLinkType: 'url' },
    { id: 'threads', name: 'Threads', category: 'social', icon: 'fa-brands fa-threads', unicode: '\ue618', library: 'brands', defaultLinkType: 'url' },
    { id: 'reddit', name: 'Reddit Community', category: 'social', icon: 'fa-brands fa-reddit-alien', unicode: '\uf281', library: 'brands', defaultLinkType: 'url' },

    // ── SHOPPING & COMMERCE ───────────────────────────────────────────────
    { id: 'cart-shopping', name: 'Shopping Cart', category: 'shopping', icon: 'fa-solid fa-cart-shopping', unicode: '\uf07a', library: 'solid', defaultLinkType: 'url' },
    { id: 'bag-shopping', name: 'Shopping Bag', category: 'shopping', icon: 'fa-solid fa-bag-shopping', unicode: '\uf290', library: 'solid', defaultLinkType: 'url' },
    { id: 'tag', name: 'Price Tag', category: 'shopping', icon: 'fa-solid fa-tag', unicode: '\uf02b', library: 'solid' },
    { id: 'tags', name: 'Offers / Deals', category: 'shopping', icon: 'fa-solid fa-tags', unicode: '\uf02c', library: 'solid' },
    { id: 'percent', name: 'Discount %', category: 'shopping', icon: 'fa-solid fa-percent', unicode: '\u0025', library: 'solid' },
    { id: 'credit-card', name: 'Payment / Card', category: 'shopping', icon: 'fa-solid fa-credit-card', unicode: '\uf09d', library: 'solid', defaultLinkType: 'url' },
    { id: 'money-bill', name: 'Cash on Delivery', category: 'shopping', icon: 'fa-solid fa-money-bill-wave', unicode: '\uf53a', library: 'solid' },
    { id: 'rupee', name: 'Indian Rupee', category: 'shopping', icon: 'fa-solid fa-indian-rupee-sign', unicode: '\ue1bc', library: 'solid' },
    { id: 'dollar', name: 'US Dollar', category: 'shopping', icon: 'fa-solid fa-dollar-sign', unicode: '\u0024', library: 'solid' },
    { id: 'euro', name: 'Euro Currency', category: 'shopping', icon: 'fa-solid fa-euro-sign', unicode: '\uf153', library: 'solid' },
    { id: 'store', name: 'Storefront', category: 'shopping', icon: 'fa-solid fa-store', unicode: '\uf54e', library: 'solid', defaultLinkType: 'url' },
    { id: 'truck', name: 'Shipping Delivery', category: 'shopping', icon: 'fa-solid fa-truck', unicode: '\uf0d1', library: 'solid' },
    { id: 'truck-fast', name: 'Express Delivery', category: 'shopping', icon: 'fa-solid fa-truck-fast', unicode: '\uf48b', library: 'solid' },
    { id: 'box-open', name: 'Package / Box', category: 'shopping', icon: 'fa-solid fa-box-open', unicode: '\uf49e', library: 'solid' },
    { id: 'gift', name: 'Gift / Bonus', category: 'shopping', icon: 'fa-solid fa-gift', unicode: '\uf06b', library: 'solid' },
    { id: 'receipt', name: 'Invoice / Receipt', category: 'shopping', icon: 'fa-solid fa-receipt', unicode: '\uf543', library: 'solid' },
    { id: 'qrcode', name: 'Scan QR Code', category: 'shopping', icon: 'fa-solid fa-qrcode', unicode: '\uf029', library: 'solid', defaultLinkType: 'url' },
    { id: 'barcode', name: 'Barcode Scan', category: 'shopping', icon: 'fa-solid fa-barcode', unicode: '\uf02a', library: 'solid' },

    // ── MEDIA & DOCUMENTS ─────────────────────────────────────────────────
    { id: 'play', name: 'Play Video', category: 'media', icon: 'fa-solid fa-play', unicode: '\uf04b', library: 'solid', defaultLinkType: 'url' },
    { id: 'video', name: 'Video Tour', category: 'media', icon: 'fa-solid fa-video', unicode: '\uf03d', library: 'solid', defaultLinkType: 'url' },
    { id: 'download', name: 'Download Catalog', category: 'media', icon: 'fa-solid fa-download', unicode: '\uf019', library: 'solid', defaultLinkType: 'url' },
    { id: 'upload', name: 'Upload File', category: 'media', icon: 'fa-solid fa-upload', unicode: '\uf093', library: 'solid' },
    { id: 'file-pdf', name: 'PDF Spec Sheet', category: 'media', icon: 'fa-solid fa-file-pdf', unicode: '\uf1c1', library: 'solid', defaultLinkType: 'url' },
    { id: 'file-lines', name: 'Document Specs', category: 'media', icon: 'fa-solid fa-file-lines', unicode: '\uf15c', library: 'solid' },
    { id: 'image', name: 'High-Res Image', category: 'media', icon: 'fa-solid fa-image', unicode: '\uf03e', library: 'solid' },
    { id: 'eye', name: 'View 360 / Demo', category: 'media', icon: 'fa-solid fa-eye', unicode: '\uf06e', library: 'solid', defaultLinkType: 'url' },
    { id: 'camera', name: 'Camera Gallery', category: 'media', icon: 'fa-solid fa-camera', unicode: '\uf030', library: 'solid' },
    { id: 'music', name: 'Audio Sample', category: 'media', icon: 'fa-solid fa-music', unicode: '\uf001', library: 'solid', defaultLinkType: 'url' },
    { id: 'volume-high', name: 'Sound Listen', category: 'media', icon: 'fa-solid fa-volume-high', unicode: '\uf028', library: 'solid' },
    { id: 'bookmark', name: 'Bookmark Page', category: 'media', icon: 'fa-solid fa-bookmark', unicode: '\uf02e', library: 'solid' },
    { id: 'print', name: 'Print Brochure', category: 'media', icon: 'fa-solid fa-print', unicode: '\uf02f', library: 'solid' },

    // ── BADGES, TRUST & UTILITY ───────────────────────────────────────────
    { id: 'circle-check', name: 'Verified Guarantee', category: 'trust', icon: 'fa-solid fa-circle-check', unicode: '\uf058', library: 'solid' },
    { id: 'check', name: 'Checkmark Mark', category: 'trust', icon: 'fa-solid fa-check', unicode: '\uf00c', library: 'solid' },
    { id: 'shield-halved', name: 'Warranty Shield', category: 'trust', icon: 'fa-solid fa-shield-halved', unicode: '\uf3ed', library: 'solid' },
    { id: 'star', name: '5-Star Rating', category: 'trust', icon: 'fa-solid fa-star', unicode: '\uf005', library: 'solid' },
    { id: 'heart', name: 'Favorites / Wishlist', category: 'trust', icon: 'fa-solid fa-heart', unicode: '\uf004', library: 'solid' },
    { id: 'thumbs-up', name: 'Recommended Like', category: 'trust', icon: 'fa-solid fa-thumbs-up', unicode: '\uf164', library: 'solid' },
    { id: 'trophy', name: 'Award Winner', category: 'trust', icon: 'fa-solid fa-trophy', unicode: '\uf091', library: 'solid' },
    { id: 'award', name: 'Certified Badge', category: 'trust', icon: 'fa-solid fa-award', unicode: '\uf559', library: 'solid' },
    { id: 'fire', name: 'Hot Trending', category: 'trust', icon: 'fa-solid fa-fire', unicode: '\uf06d', library: 'solid' },
    { id: 'sparkles', name: 'New Arrival', category: 'trust', icon: 'fa-solid fa-wand-magic-sparkles', unicode: '\ue2ca', library: 'solid' },
    { id: 'crown', name: 'Premium Edition', category: 'trust', icon: 'fa-solid fa-crown', unicode: '\uf521', library: 'solid' },
    { id: 'bell', name: 'Alert Notification', category: 'trust', icon: 'fa-solid fa-bell', unicode: '\uf0f3', library: 'solid' },
    { id: 'lock', name: '100% Secure', category: 'trust', icon: 'fa-solid fa-lock', unicode: '\uf023', library: 'solid' },
    { id: 'circle-info', name: 'Product Info', category: 'trust', icon: 'fa-solid fa-circle-info', unicode: '\uf05a', library: 'solid' },
    { id: 'circle-question', name: 'FAQ / Help', category: 'trust', icon: 'fa-solid fa-circle-question', unicode: '\uf059', library: 'solid' },
    { id: 'warning', name: 'Notice Warning', category: 'trust', icon: 'fa-solid fa-triangle-exclamation', unicode: '\uf071', library: 'solid' },
    { id: 'clock', name: 'Operating Hours', category: 'trust', icon: 'fa-solid fa-clock', unicode: '\uf017', library: 'solid' },
    { id: 'calendar-days', name: 'Schedule Booking', category: 'trust', icon: 'fa-solid fa-calendar-days', unicode: '\uf073', library: 'solid', defaultLinkType: 'url' },
    { id: 'gear', name: 'Settings / Setup', category: 'trust', icon: 'fa-solid fa-gear', unicode: '\uf013', library: 'solid' },

    // ── WEB & NAVIGATION ──────────────────────────────────────────────────
    { id: 'globe', name: 'Official Website', category: 'nav', icon: 'fa-solid fa-globe', unicode: '\uf0ac', library: 'solid', defaultLinkType: 'url' },
    { id: 'link', name: 'External Link', category: 'nav', icon: 'fa-solid fa-link', unicode: '\uf0c1', library: 'solid', defaultLinkType: 'url' },
    { id: 'up-right-from-square', name: 'Open Webpage', category: 'nav', icon: 'fa-solid fa-up-right-from-square', unicode: '\uf08e', library: 'solid', defaultLinkType: 'url' },
    { id: 'house', name: 'Home Page', category: 'nav', icon: 'fa-solid fa-house', unicode: '\uf015', library: 'solid', defaultLinkType: 'url' },
    { id: 'share-nodes', name: 'Share Catalog', category: 'nav', icon: 'fa-solid fa-share-nodes', unicode: '\uf1e0', library: 'solid' },
    { id: 'reply', name: 'Go Back', category: 'nav', icon: 'fa-solid fa-reply', unicode: '\uf3e5', library: 'solid' },
    { id: 'magnifying-glass', name: 'Search Product', category: 'nav', icon: 'fa-solid fa-magnifying-glass', unicode: '\uf002', library: 'solid' },
    { id: 'list', name: 'Index / Contents', category: 'nav', icon: 'fa-solid fa-list', unicode: '\uf03a', library: 'solid' },
    { id: 'arrow-right', name: 'Next Page', category: 'nav', icon: 'fa-solid fa-arrow-right', unicode: '\uf061', library: 'solid' },
    { id: 'arrow-left', name: 'Previous Page', category: 'nav', icon: 'fa-solid fa-arrow-left', unicode: '\uf060', library: 'solid' },
    { id: 'chevron-right', name: 'Forward Arrow', category: 'nav', icon: 'fa-solid fa-chevron-right', unicode: '\uf054', library: 'solid' },
    { id: 'plus', name: 'Zoom In / Add', category: 'nav', icon: 'fa-solid fa-plus', unicode: '\uf067', library: 'solid' },
    { id: 'minus', name: 'Zoom Out', category: 'nav', icon: 'fa-solid fa-minus', unicode: '\uf068', library: 'solid' },
    { id: 'xmark', name: 'Close', category: 'nav', icon: 'fa-solid fa-xmark', unicode: '\uf00d', library: 'solid' },
    { id: 'font', name: 'Typography', category: 'nav', icon: 'fa-solid fa-font', unicode: '\uf031', library: 'solid' },
];

const CATEGORIES: { id: string; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'contact', label: 'Contact' },
    { id: 'social', label: 'Social' },
    { id: 'shopping', label: 'Shopping' },
    { id: 'media', label: 'Media' },
    { id: 'trust', label: 'Trust & Badges' },
    { id: 'nav', label: 'Navigation' },
];

const COLOR_PRESETS = [
    { name: 'Teal', color: '#0F3D3E' },
    { name: 'WhatsApp', color: '#25D366' },
    { name: 'Blue', color: '#2563EB' },
    { name: 'Instagram', color: '#E1306C' },
    { name: 'Red', color: '#DC2626' },
    { name: 'Amber', color: '#D97706' },
    { name: 'Slate', color: '#475569' },
    { name: 'Dark', color: '#18181B' },
    { name: 'White', color: '#FFFFFF' },
];

const ButtonsPanel: React.FC = () => {
    const { catalog, currentPageIndex, addElement, uiTheme } = useStore();
    const isDark = uiTheme === 'dark';
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedStyle, setSelectedStyle] = useState<'solid-circle' | 'outline-circle' | 'solid-square' | 'outline-square' | 'rounded-square'>('solid-circle');
    const [buttonColor, setButtonColor] = useState<string>('#0F3D3E');
    const [buttonSize, setButtonSize] = useState<number>(48);

    // Optional Action / Link setup
    const [isLinkConfigOpen, setIsLinkConfigOpen] = useState(false);
    const [linkType, setLinkType] = useState<'url' | 'whatsapp' | 'phone' | 'email'>('url');
    const [targetLink, setTargetLink] = useState('');

    const filteredIcons = useMemo(() => {
        return BUTTON_ICONS.filter(icon => {
            const matchesCat = selectedCategory === 'all' || icon.category === selectedCategory;
            const matchesSearch = !searchQuery.trim() ||
                icon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                icon.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                icon.id.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCat && matchesSearch;
        });
    }, [selectedCategory, searchQuery]);

    const handleAddButton = (icon: IconDefinition) => {
        const id = `btn-${Date.now()}`;
        const size = buttonSize;

        let shapeType: ShapeType = 'circle';
        let fill = buttonColor;
        let stroke = 'transparent';
        let strokeWidth = 0;

        if (selectedStyle === 'outline-circle') {
            shapeType = 'circle';
            fill = 'transparent';
            stroke = buttonColor;
            strokeWidth = 2.5;
        } else if (selectedStyle === 'solid-square') {
            shapeType = 'rect';
            fill = buttonColor;
        } else if (selectedStyle === 'outline-square') {
            shapeType = 'rect';
            fill = 'transparent';
            stroke = buttonColor;
            strokeWidth = 2.5;
        } else if (selectedStyle === 'rounded-square') {
            shapeType = 'roundedRect';
            fill = buttonColor;
        }

        const iconColor = (selectedStyle === 'outline-circle' || selectedStyle === 'outline-square')
            ? buttonColor
            : (buttonColor === '#FFFFFF' ? '#0F3D3E' : '#FFFFFF');

        // Automatically format link if specified
        let finalLinkUrl = targetLink.trim();
        if (finalLinkUrl) {
            if (linkType === 'whatsapp' && !finalLinkUrl.startsWith('http')) {
                const cleanPhone = finalLinkUrl.replace(/[^0-9]/g, '');
                finalLinkUrl = `https://wa.me/${cleanPhone}`;
            } else if (linkType === 'phone' && !finalLinkUrl.startsWith('tel:')) {
                finalLinkUrl = `tel:${finalLinkUrl}`;
            } else if (linkType === 'email' && !finalLinkUrl.startsWith('mailto:')) {
                finalLinkUrl = `mailto:${finalLinkUrl}`;
            } else if (linkType === 'url' && !finalLinkUrl.startsWith('http://') && !finalLinkUrl.startsWith('https://')) {
                finalLinkUrl = `https://${finalLinkUrl}`;
            }
        }

        const newElement: CanvasElement = {
            id,
            type: 'shape',
            shapeType,
            x: 200,
            y: 200,
            width: size,
            height: size,
            rotation: 0,
            opacity: 1,
            fill,
            stroke,
            strokeWidth,
            zIndex: (catalog.pages[currentPageIndex]?.elements?.length || 0) + 1,
            linkUrl: finalLinkUrl || undefined,
            linkType: finalLinkUrl ? linkType : undefined,
            iconConfig: {
                iconName: icon.unicode,
                iconLibrary: 'fontawesome',
                color: iconColor,
                size: size * 0.48,
                fontWeight: icon.library === 'brands' ? '400' : '900',
                fontFamily: icon.library === 'brands' ? 'Font Awesome 6 Brands' : 'Font Awesome 6 Free',
                linkUrl: finalLinkUrl || undefined,
                linkType: finalLinkUrl ? linkType : undefined,
            }
        };

        addElement(currentPageIndex, newElement);
    };

    return (
        <div className={`w-full h-full flex flex-col font-sans animate-in slide-in-from-left duration-300 transition-colors ${
            isDark ? 'bg-[#161616] text-white' : 'bg-white text-slate-800'
        }`}>
            {/* Top Header */}
            <div className={`h-14 px-3 py-2 border-b flex items-center justify-between transition-colors ${
                isDark ? 'bg-[#161616] border-[#262626]' : 'bg-slate-50 border-slate-200'
            }`}>
                <div className="flex items-center gap-2">
                    <Sparkles size={14} className={isDark ? "text-[#E2DCC8]" : "text-[#0F3D3E]"} />
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>Interactive Icons & Buttons</span>
                </div>
                <button
                    onClick={() => useStore.getState().setEditorTab(null)}
                    className={`p-1.5 rounded-[4px] transition-colors ${
                        isDark ? 'hover:bg-[#262626] text-[#888] hover:text-white' : 'hover:bg-slate-200 text-slate-400 hover:text-slate-700'
                    }`}
                    title="Close"
                >
                    <ChevronDown size={14} className="rotate-90" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
                {/* Search Bar */}
                <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search 100+ free icons (whatsapp, cart, call...)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full pl-8 pr-8 py-1.5 text-xs rounded-[4px] focus:outline-none focus:border-[#0F3D3E] transition-colors ${
                            isDark 
                                ? 'bg-[#121212] border border-[#262626] text-white placeholder-slate-500' 
                                : 'bg-white border border-slate-200 text-slate-800 placeholder-slate-400'
                        }`}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className={`absolute right-2.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}
                        >
                            <X size={12} />
                        </button>
                    )}
                </div>

                {/* Categories */}
                <div>
                    <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-2.5 py-1 text-[10px] font-semibold rounded-[4px] whitespace-nowrap transition-all ${
                                    selectedCategory === cat.id
                                        ? 'bg-[#0F3D3E] text-white shadow-sm border border-[#E2DCC8]/20'
                                        : (isDark ? 'bg-[#1a1a1a] text-[#aaa] border border-[#262626] hover:text-white hover:bg-[#222]' : 'bg-slate-100 text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-200')
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Shape & Style Selector */}
                <div>
                    <span className={`block text-[9px] font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-[#888]' : 'text-slate-500'}`}>Button Shape & Style</span>
                    <div className={`flex border rounded-[4px] overflow-hidden h-9 ${isDark ? 'border-[#262626] bg-[#121212]' : 'border-slate-200 bg-slate-50'}`}>
                        <button
                            onClick={() => setSelectedStyle('solid-circle')}
                            className={`flex-1 flex items-center justify-center transition-all ${selectedStyle === 'solid-circle' ? 'bg-[#0F3D3E] text-white' : (isDark ? 'text-[#888] hover:bg-[#1a1a1a] hover:text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-800')}`}
                            title="Solid Circle"
                        >
                            <div className="w-3.5 h-3.5 rounded-full bg-current" />
                        </button>
                        <button
                            onClick={() => setSelectedStyle('outline-circle')}
                            className={`flex-1 flex items-center justify-center border-l transition-all ${isDark ? 'border-[#262626]' : 'border-slate-200'} ${selectedStyle === 'outline-circle' ? 'bg-[#0F3D3E] text-white' : (isDark ? 'text-[#888] hover:bg-[#1a1a1a] hover:text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-800')}`}
                            title="Outline Circle"
                        >
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-current" />
                        </button>
                        <button
                            onClick={() => setSelectedStyle('rounded-square')}
                            className={`flex-1 flex items-center justify-center border-l transition-all ${isDark ? 'border-[#262626]' : 'border-slate-200'} ${selectedStyle === 'rounded-square' ? 'bg-[#0F3D3E] text-white' : (isDark ? 'text-[#888] hover:bg-[#1a1a1a] hover:text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-800')}`}
                            title="Rounded Square"
                        >
                            <div className="w-3.5 h-3.5 rounded-[4px] bg-current" />
                        </button>
                        <button
                            onClick={() => setSelectedStyle('solid-square')}
                            className={`flex-1 flex items-center justify-center border-l transition-all ${isDark ? 'border-[#262626]' : 'border-slate-200'} ${selectedStyle === 'solid-square' ? 'bg-[#0F3D3E] text-white' : (isDark ? 'text-[#888] hover:bg-[#1a1a1a] hover:text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-800')}`}
                            title="Solid Square"
                        >
                            <div className="w-3.5 h-3.5 rounded-[1px] bg-current" />
                        </button>
                        <button
                            onClick={() => setSelectedStyle('outline-square')}
                            className={`flex-1 flex items-center justify-center border-l transition-all ${isDark ? 'border-[#262626]' : 'border-slate-200'} ${selectedStyle === 'outline-square' ? 'bg-[#0F3D3E] text-white' : (isDark ? 'text-[#888] hover:bg-[#1a1a1a] hover:text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-800')}`}
                            title="Outline Square"
                        >
                            <div className="w-3.5 h-3.5 rounded-[1px] border-2 border-current" />
                        </button>
                    </div>
                </div>

                {/* Color Palette & Custom Picker */}
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${isDark ? 'text-[#888]' : 'text-slate-500'}`}>Button Color</span>
                        <span className={`text-[10px] font-mono ${isDark ? 'text-[#aaa]' : 'text-slate-600'}`}>{buttonColor}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {COLOR_PRESETS.map(preset => (
                            <button
                                key={preset.name}
                                onClick={() => setButtonColor(preset.color)}
                                className={`w-6 h-6 rounded-[3px] border transition-all ${
                                    buttonColor.toLowerCase() === preset.color.toLowerCase()
                                        ? 'border-white scale-110 shadow-md ring-2 ring-[#0F3D3E]/40'
                                        : (isDark ? 'border-[#333] hover:scale-105' : 'border-slate-300 hover:scale-105')
                                }`}
                                style={{ backgroundColor: preset.color }}
                                title={preset.name}
                            />
                        ))}
                        {/* Custom color input */}
                        <label className={`w-6 h-6 rounded-[3px] border flex items-center justify-center cursor-pointer relative overflow-hidden ${
                            isDark ? 'border-[#333] bg-[#1e1e1e] hover:border-[#666]' : 'border-slate-300 bg-slate-100 hover:border-slate-400'
                        }`} title="Pick Custom Color">
                            <span className="text-[10px] font-bold text-slate-400">+</span>
                            <input
                                type="color"
                                value={buttonColor}
                                onChange={(e) => setButtonColor(e.target.value)}
                                className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
                            />
                        </label>
                    </div>
                </div>

                {/* Button Size Preset */}
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${isDark ? 'text-[#888]' : 'text-slate-500'}`}>Button Size</span>
                        <span className="text-[10px] text-slate-400">{buttonSize}px</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                        {[
                            { label: 'Small', size: 36 },
                            { label: 'Medium', size: 48 },
                            { label: 'Large', size: 60 }
                        ].map(s => (
                            <button
                                key={s.size}
                                onClick={() => setButtonSize(s.size)}
                                className={`py-1 text-[10px] font-semibold rounded-[4px] border transition-all ${
                                    buttonSize === s.size
                                        ? 'bg-[#0F3D3E] text-white border-[#E2DCC8]/30'
                                        : (isDark ? 'bg-[#181818] text-[#888] border-[#262626] hover:text-white' : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900')
                                }`}
                            >
                                {s.label} ({s.size}px)
                            </button>
                        ))}
                    </div>
                </div>

                {/* Optional Interactive Action / Link */}
                <div className={`border rounded-[4px] overflow-hidden ${isDark ? 'border-[#262626] bg-[#121212]' : 'border-slate-200 bg-slate-50'}`}>
                    <button
                        onClick={() => setIsLinkConfigOpen(!isLinkConfigOpen)}
                        className={`w-full px-3 py-2 flex items-center justify-between text-left transition-colors ${
                            isDark ? 'hover:bg-[#181818]' : 'hover:bg-slate-100'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <LinkIcon size={12} className={isDark ? "text-[#E2DCC8]" : "text-[#0F3D3E]"} />
                            <span className={`text-[10px] font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Attach Link / Action (Optional)</span>
                        </div>
                        <ChevronDown size={13} className={`text-slate-400 transition-transform ${isLinkConfigOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isLinkConfigOpen && (
                        <div className={`p-3 border-t space-y-2 ${isDark ? 'border-[#262626] bg-[#161616]' : 'border-slate-200 bg-white'}`}>
                            <div className="grid grid-cols-4 gap-1">
                                {[
                                    { id: 'url', label: 'Web URL', icon: Globe },
                                    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
                                    { id: 'phone', label: 'Call Phone', icon: Phone },
                                    { id: 'email', label: 'Email', icon: Mail },
                                ].map(lt => {
                                    const IconComponent = lt.icon;
                                    return (
                                        <button
                                            key={lt.id}
                                            onClick={() => setLinkType(lt.id as any)}
                                            className={`py-1.5 px-1 flex flex-col items-center gap-1 rounded-[3px] border text-[9px] font-medium transition-all ${
                                                linkType === lt.id
                                                    ? 'bg-[#0F3D3E] text-white border-[#E2DCC8]/30'
                                                    : (isDark ? 'bg-[#121212] text-slate-400 border-[#262626] hover:text-white' : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900')
                                            }`}
                                        >
                                            <IconComponent size={11} />
                                            <span>{lt.label}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            <input
                                type="text"
                                value={targetLink}
                                onChange={(e) => setTargetLink(e.target.value)}
                                placeholder={
                                    linkType === 'whatsapp' ? 'Phone number (e.g. 919876543210)' :
                                    linkType === 'phone' ? 'Phone with country code (+91...)' :
                                    linkType === 'email' ? 'Email (sales@brand.com)' :
                                    'URL (https://yourwebsite.com)'
                                }
                                className={`w-full px-2.5 py-1.5 text-xs rounded-[3px] outline-none focus:border-[#0F3D3E] ${
                                    isDark 
                                        ? 'bg-[#121212] border border-[#262626] text-white placeholder-slate-500' 
                                        : 'bg-white border border-slate-200 text-slate-800 placeholder-slate-400'
                                }`}
                            />
                            <p className="text-[9px] text-slate-500 italic">
                                Clicking an icon below will insert an interactive button with this action attached.
                            </p>
                        </div>
                    )}
                </div>

                {/* Available Icons Grid */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${isDark ? 'text-[#888]' : 'text-slate-500'}`}>
                            Available Free Icons ({filteredIcons.length})
                        </span>
                        <span className="text-[9px] text-slate-400">Click to insert on page</span>
                    </div>

                    {filteredIcons.length === 0 ? (
                        <div className={`py-8 text-center text-xs border border-dashed rounded-[4px] ${
                            isDark ? 'text-slate-500 border-[#262626]' : 'text-slate-400 border-slate-200'
                        }`}>
                            No icons found for "{searchQuery}"
                        </div>
                    ) : (
                        <div className="grid grid-cols-5 gap-2">
                            {filteredIcons.map((icon) => (
                                <button
                                    key={icon.id}
                                    onClick={() => handleAddButton(icon)}
                                    className={`group relative flex flex-col items-center justify-center h-12 rounded-[4px] transition-all border active:scale-95 ${
                                        isDark 
                                            ? 'bg-[#1a1a1a] border-[#262626] hover:border-[#0F3D3E] hover:bg-[#222]' 
                                            : 'bg-slate-50 border-slate-200 hover:border-[#0F3D3E] hover:bg-slate-100'
                                    }`}
                                    title={icon.name}
                                >
                                    <i className={`${icon.icon} text-base transition-transform group-hover:scale-110 ${
                                        isDark ? 'text-slate-300 group-hover:text-[#E2DCC8]' : 'text-slate-600 group-hover:text-[#0F3D3E]'
                                    }`} />
                                    <span className={`mt-1 text-[8px] truncate max-w-[42px] ${
                                        isDark ? 'text-slate-400 group-hover:text-slate-200' : 'text-slate-500 group-hover:text-slate-800'
                                    }`}>
                                        {icon.name.split(' ')[0]}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ButtonsPanel;
