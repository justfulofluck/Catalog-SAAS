import React from 'react';
import { FormField } from '../../types';
import { Plus, Trash2, ShieldAlert, Package, Layers, CreditCard } from 'lucide-react';

interface Props {
  fields: FormField[];
  onChange: (fields: FormField[]) => void;
  maxFields?: number;
  hideOuterWrapper?: boolean;
}

export const CustomFieldsEditor: React.FC<Props> = ({ fields, onChange, maxFields = 50, hideOuterWrapper = false }) => {
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
    <div key={field.id} className="bg-[#1c1c1c] border border-[#262626] rounded-[4px] p-3.5 relative group transition-all hover:border-[#333333]">
      <button 
        onClick={() => removeField(field.id)}
        className="absolute -top-2 -right-2 bg-[#161616] hover:bg-red-950/80 text-[#888888] hover:text-red-400 rounded-full p-1 shadow-md border border-[#262626] opacity-0 group-hover:opacity-100 transition-opacity"
        title="Remove field"
      >
        <Trash2 size={12} />
      </button>
      
      <div className="space-y-3">
        <div>
          <label className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">Field Label</label>
          <input 
            type="text" 
            value={field.label}
            onChange={(e) => updateField(field.id, { label: e.target.value })}
            className="w-full mt-1 bg-[#121212] border border-[#262626] text-white rounded-[4px] px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-[#0F3D3E] transition-colors"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">Type</label>
            <select
              value={field.type}
              onChange={(e) => updateField(field.id, { type: e.target.value as any })}
              className="w-full mt-1 bg-[#121212] border border-[#262626] text-white rounded-[4px] px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-[#0F3D3E] transition-colors"
            >
              <option value="text">Text (Short)</option>
              <option value="textarea">Text (Long)</option>
              <option value="number">Number</option>
              <option value="boolean">Yes/No</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">Required?</label>
            <div className="flex items-center h-7 px-2.5 mt-1 bg-[#121212] border border-[#262626] rounded-[4px]">
              <input 
                type="checkbox" 
                checked={field.required}
                onChange={(e) => updateField(field.id, { required: e.target.checked })}
                className="rounded border-[#262626] bg-[#1c1c1c] accent-[#0F3D3E] cursor-pointer"
              />
              <span className="ml-2 text-xs font-medium text-[#cccccc]">Yes</span>
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
              <div className="flex items-center justify-between pb-2 border-b border-[#262626]">
                <h4 className="font-space text-xs font-bold text-[#cccccc] uppercase tracking-wider flex items-center gap-2">
                  <Package size={14} className="text-[#E2DCC8]" /> Basic Fields
                </h4>
                <button 
                  onClick={() => addField('basic')} 
                  className="text-[10px] font-bold text-[#E2DCC8] hover:text-[#E2DCC8] uppercase tracking-wider flex items-center gap-1 transition-colors"
                >
                  <Plus size={12} /> Add Field
                </button>
              </div>
              <div className="space-y-3 min-h-[100px]">
                {fields.filter(f => f.section === 'basic').map(renderFieldEditor)}
                {fields.filter(f => f.section === 'basic').length === 0 && (
                  <p className="text-xs text-[#555555] italic text-center py-6">No custom basic fields</p>
                )}
              </div>
            </div>

            {/* Technical Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#262626]">
                <h4 className="font-space text-xs font-bold text-[#cccccc] uppercase tracking-wider flex items-center gap-2">
                  <Layers size={14} className="text-[#E2DCC8]" /> Technical Specs
                </h4>
                <button 
                  onClick={() => addField('technical')} 
                  className="text-[10px] font-bold text-[#E2DCC8] hover:text-[#E2DCC8] uppercase tracking-wider flex items-center gap-1 transition-colors"
                >
                  <Plus size={12} /> Add Field
                </button>
              </div>
              <div className="space-y-3 min-h-[100px]">
                {fields.filter(f => f.section === 'technical').map(renderFieldEditor)}
                {fields.filter(f => f.section === 'technical').length === 0 && (
                  <p className="text-xs text-[#555555] italic text-center py-6">No custom tech fields</p>
                )}
              </div>
            </div>

            {/* Commercial Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#262626]">
                <h4 className="font-space text-xs font-bold text-[#cccccc] uppercase tracking-wider flex items-center gap-2">
                  <CreditCard size={14} className="text-[#E2DCC8]" /> Commercial Info
                </h4>
                <button 
                  onClick={() => addField('commercial')} 
                  className="text-[10px] font-bold text-[#E2DCC8] hover:text-[#E2DCC8] uppercase tracking-wider flex items-center gap-1 transition-colors"
                >
                  <Plus size={12} /> Add Field
                </button>
              </div>
              <div className="space-y-3 min-h-[100px]">
                {fields.filter(f => f.section === 'commercial').map(renderFieldEditor)}
                {fields.filter(f => f.section === 'commercial').length === 0 && (
                  <p className="text-xs text-[#555555] italic text-center py-6">No custom commercial fields</p>
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
      <div className="bg-[#161616] rounded-[4px] border border-[#262626] overflow-hidden">
        <div className="p-6 border-b border-[#262626] flex items-center justify-between bg-[#121212]/50">
          <div>
            <h3 className="font-space text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Custom Product Fields
            </h3>
            <p className="text-xs text-[#888888] font-medium mt-1">
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
