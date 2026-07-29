import React from 'react';
import { FormField } from '../../types';
import { Plus, Trash2, ShieldAlert, Package, Layers, CreditCard } from 'lucide-react';

interface Props {
  fields: FormField[];
  onChange: (fields: FormField[]) => void;
  maxFields?: number;
}

export const CustomFieldsEditor: React.FC<Props> = ({ fields, onChange, maxFields = 50 }) => {
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
    <div key={field.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3 relative group">
      <button 
        onClick={() => removeField(field.id)}
        className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full p-1 shadow-sm border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 size={12} />
      </button>
      
      <div className="space-y-3">
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase">Field Label</label>
          <input 
            type="text" 
            value={field.label}
            onChange={(e) => updateField(field.id, { label: e.target.value })}
            className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase">Type</label>
            <select
              value={field.type}
              onChange={(e) => updateField(field.id, { type: e.target.value as any })}
              className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-xs font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="text">Text (Short)</option>
              <option value="textarea">Text (Long)</option>
              <option value="number">Number</option>
              <option value="boolean">Yes/No</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase">Required?</label>
            <div className="flex items-center h-7 px-2 bg-white border border-slate-200 rounded">
              <input 
                type="checkbox" 
                checked={field.required}
                onChange={(e) => updateField(field.id, { required: e.target.checked })}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-xs font-medium text-slate-700">Yes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Custom Product Fields
            </h3>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Add your own specific fields to the product form. ({fields.length}/{maxFields} used)
            </p>
          </div>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 border border-red-100">
              <ShieldAlert size={18} className="mt-0.5" />
              <p className="text-sm font-semibold">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Basic Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2"><Package size={14} /> Basic Fields</h4>
                    <button onClick={() => addField('basic')} className="text-[10px] font-bold text-indigo-600 hover:underline">+ Add Field</button>
                </div>
                <div className="space-y-3 min-h-[100px]">
                    {fields.filter(f => f.section === 'basic').map(renderFieldEditor)}
                    {fields.filter(f => f.section === 'basic').length === 0 && <p className="text-xs text-slate-400 italic text-center py-4">No custom basic fields</p>}
                </div>
            </div>

            {/* Technical Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2"><Layers size={14} /> Technical Specs</h4>
                    <button onClick={() => addField('technical')} className="text-[10px] font-bold text-indigo-600 hover:underline">+ Add Field</button>
                </div>
                <div className="space-y-3 min-h-[100px]">
                    {fields.filter(f => f.section === 'technical').map(renderFieldEditor)}
                    {fields.filter(f => f.section === 'technical').length === 0 && <p className="text-xs text-slate-400 italic text-center py-4">No custom tech fields</p>}
                </div>
            </div>

            {/* Commercial Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2"><CreditCard size={14} /> Commercial Info</h4>
                    <button onClick={() => addField('commercial')} className="text-[10px] font-bold text-indigo-600 hover:underline">+ Add Field</button>
                </div>
                <div className="space-y-3 min-h-[100px]">
                    {fields.filter(f => f.section === 'commercial').map(renderFieldEditor)}
                    {fields.filter(f => f.section === 'commercial').length === 0 && <p className="text-xs text-slate-400 italic text-center py-4">No custom commercial fields</p>}
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
