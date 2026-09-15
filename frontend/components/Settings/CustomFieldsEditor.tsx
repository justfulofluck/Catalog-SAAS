import React from 'react';
import { FormField } from '../../types';
import { Plus, Trash2, ShieldAlert, Package, Layers, CreditCard } from 'lucide-react';
import { useStore } from '../../store/useStore';

interface Props {
  fields: FormField[];
  onChange: (fields: FormField[]) => void;
  maxFields?: number;
  hideOuterWrapper?: boolean;
}

export const CustomFieldsEditor: React.FC<Props> = ({ fields, onChange, maxFields = 50, hideOuterWrapper = false }) => {
  const { uiTheme } = useStore();
  const isDark = uiTheme === 'dark';
  const [error, setError] = React.useState('');

  const addField = (section: 'basic' | 'technical' | 'commercial') => {
    if (fields.length >= maxFields) {
      setError(`You can only add up to ${maxFields} custom fields.`);
      return;
    }
    setError('');
    
    const newField: FormField = {
      id: `custom_${Date.now()}`,
      label: 'New Field',
      type: 'text',
      section,
      required: false,
    };
    const newFields = [...fields, newField];
    onChange(newFields);
  };

  const removeField = (id: string) => {
    onChange(fields.filter(f => f.id !== id));
    setError('');
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    onChange(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const renderFieldEditor = (field: FormField) => (
    <div key={field.id} className={`border rounded-[4px] p-3.5 relative group transition-all ${
      isDark ? 'bg-[#1c1c1c] border-[#262626] hover:border-[#333333]' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
    }`}>
      <button 
        onClick={() => removeField(field.id)}
        className={`absolute -top-2 -right-2 rounded-full p-1 shadow-md border opacity-0 group-hover:opacity-100 transition-opacity ${
          isDark ? 'bg-[#161616] hover:bg-red-950/80 text-[#888888] hover:text-red-400 border-[#262626]' : 'bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 border-slate-200'
        }`}
        title="Remove field"
      >
        <Trash2 size={12} />
      </button>
      
      <div className="space-y-3">
        <div>
          <label className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>Field Label</label>
          <input 
            type="text" 
            value={field.label}
            onChange={(e) => updateField(field.id, { label: e.target.value })}
            className={`w-full mt-1 border rounded-[4px] px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-[#0F3D3E] transition-colors ${
              isDark ? 'bg-[#121212] border-[#262626] text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>Type</label>
            <select
              value={field.type}
              onChange={(e) => updateField(field.id, { type: e.target.value as any })}
              className={`w-full mt-1 border rounded-[4px] px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-[#0F3D3E] transition-colors ${
                isDark ? 'bg-[#121212] border-[#262626] text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <option value="text">Text (Short)</option>
              <option value="textarea">Text (Long)</option>
              <option value="number">Number</option>
              <option value="boolean">Yes/No</option>
            </select>
          </div>
          <div>
            <label className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>Required?</label>
            <div className={`flex items-center h-7 px-2.5 mt-1 border rounded-[4px] ${
              isDark ? 'bg-[#121212] border-[#262626]' : 'bg-slate-50 border-slate-200'
            }`}>
              <input 
                type="checkbox" 
                checked={field.required}
                onChange={(e) => updateField(field.id, { required: e.target.checked })}
                className="rounded border-[#262626] accent-[#0F3D3E] cursor-pointer"
              />
              <span className={`ml-2 text-xs font-medium ${isDark ? 'text-[#cccccc]' : 'text-slate-700'}`}>Yes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const content = (
    <div>
      {error && (
        <div className="mb-6 p-4 bg-red-950/40 border border-red-800/60 text-red-300 rounded-[4px] flex items-start gap-3">
          <ShieldAlert size={18} className="mt-0.5 shrink-0" />
          <p className="text-xs font-semibold">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Basic Section */}
        <div className="space-y-4">
          <div className={`flex items-center justify-between pb-2 border-b ${isDark ? 'border-[#262626]' : 'border-slate-200'}`}>
            <h4 className={`font-space text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${isDark ? 'text-[#cccccc]' : 'text-slate-700'}`}>
              <Package size={14} className={isDark ? "text-[#E2DCC8]" : "text-[#0F3D3E]"} /> Basic Fields
            </h4>
            <button 
              onClick={() => addField('basic')} 
              className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors ${
                isDark ? 'text-[#E2DCC8] hover:text-white' : 'text-[#0F3D3E] hover:underline'
              }`}
            >
              <Plus size={12} /> Add Field
            </button>
          </div>
          <div className="space-y-3 min-h-[100px]">
            {fields.filter(f => f.section === 'basic').map(renderFieldEditor)}
            {fields.filter(f => f.section === 'basic').length === 0 && (
              <p className={`text-xs italic text-center py-6 ${isDark ? 'text-[#555555]' : 'text-slate-400'}`}>No custom basic fields</p>
            )}
          </div>
        </div>

        {/* Technical Section */}
        <div className="space-y-4">
          <div className={`flex items-center justify-between pb-2 border-b ${isDark ? 'border-[#262626]' : 'border-slate-200'}`}>
            <h4 className={`font-space text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${isDark ? 'text-[#cccccc]' : 'text-slate-700'}`}>
              <Layers size={14} className={isDark ? "text-[#E2DCC8]" : "text-[#0F3D3E]"} /> Technical Specs
            </h4>
            <button 
              onClick={() => addField('technical')} 
              className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors ${
                isDark ? 'text-[#E2DCC8] hover:text-white' : 'text-[#0F3D3E] hover:underline'
              }`}
            >
              <Plus size={12} /> Add Field
            </button>
          </div>
          <div className="space-y-3 min-h-[100px]">
            {fields.filter(f => f.section === 'technical').map(renderFieldEditor)}
            {fields.filter(f => f.section === 'technical').length === 0 && (
              <p className={`text-xs italic text-center py-6 ${isDark ? 'text-[#555555]' : 'text-slate-400'}`}>No custom tech fields</p>
            )}
          </div>
        </div>

        {/* Commercial Section */}
        <div className="space-y-4">
          <div className={`flex items-center justify-between pb-2 border-b ${isDark ? 'border-[#262626]' : 'border-slate-200'}`}>
            <h4 className={`font-space text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${isDark ? 'text-[#cccccc]' : 'text-slate-700'}`}>
              <CreditCard size={14} className={isDark ? "text-[#E2DCC8]" : "text-[#0F3D3E]"} /> Commercial Info
            </h4>
            <button 
              onClick={() => addField('commercial')} 
              className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors ${
                isDark ? 'text-[#E2DCC8] hover:text-white' : 'text-[#0F3D3E] hover:underline'
              }`}
            >
              <Plus size={12} /> Add Field
            </button>
          </div>
          <div className="space-y-3 min-h-[100px]">
            {fields.filter(f => f.section === 'commercial').map(renderFieldEditor)}
            {fields.filter(f => f.section === 'commercial').length === 0 && (
              <p className={`text-xs italic text-center py-6 ${isDark ? 'text-[#555555]' : 'text-slate-400'}`}>No custom commercial fields</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (hideOuterWrapper) {
    return content;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className={`rounded-[4px] border overflow-hidden ${
        isDark ? 'bg-[#161616] border-[#262626]' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className={`p-6 border-b flex items-center justify-between ${
          isDark ? 'border-[#262626] bg-[#121212]/50' : 'border-slate-100 bg-slate-50'
        }`}>
          <div>
            <h3 className={`font-space text-lg font-bold tracking-tight flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Custom Product Fields
            </h3>
            <p className={`text-xs font-medium mt-1 ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>
              Add your own specific fields to the product schema. ({fields.length}/{maxFields} used)
            </p>
          </div>
        </div>
        <div className="p-6">
          {content}
        </div>
      </div>
    </div>
  );
};
