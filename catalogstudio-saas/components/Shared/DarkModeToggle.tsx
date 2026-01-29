import React from 'react';
import { useStore } from '../../store/useStore';
import { Sun, Moon, Star } from 'lucide-react';

interface DarkModeToggleProps {
    className?: string;
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ className }) => {
    const { uiTheme, toggleUiTheme } = useStore();

    return (
        <label className={`relative inline-flex items-center cursor-pointer group ${className}`}>
            <input
                type="checkbox"
                className="sr-only"
                checked={uiTheme === 'dark'}
                onChange={toggleUiTheme}
            />
            <div className={`w-[64px] h-[26px] rounded-full relative overflow-hidden shadow-xl transition-all duration-500 border ${uiTheme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[18px] after:w-[18px] after:shadow-sm after:transition-all after:duration-500 ${uiTheme === 'dark' ? 'after:translate-x-[38px]' : 'after:translate-x-0'}`}>
                {/* Text Labels */}
                <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase tracking-widest transition-all duration-500 ${uiTheme === 'dark' ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0 text-slate-900'}`}>
                    Dark
                </span>
                <span className={`absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase tracking-widest transition-all duration-500 ${uiTheme === 'dark' ? 'opacity-100 translate-x-0 text-white' : 'opacity-0 -translate-x-10'}`}>
                    Light
                </span>

                {/* Icons */}
                <div className={`absolute left-[5px] top-[5px] z-10 pointer-events-none transition-all duration-500 ${uiTheme === 'dark' ? 'opacity-0 -rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`}>
                    <Sun size={14} className="text-amber-500 fill-amber-500" />
                </div>
                <div className={`absolute right-[5px] top-[5px] z-10 pointer-events-none transition-all duration-500 ${uiTheme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-0'}`}>
                    <div className="relative">
                        <Moon size={14} className="text-indigo-400 fill-indigo-400" />
                        <div className="absolute -top-1 -right-1 animate-pulse">
                            <Star size={6} className="text-yellow-200 fill-yellow-200" />
                        </div>
                    </div>
                </div>
            </div>
        </label>
    );
};

export default DarkModeToggle;
