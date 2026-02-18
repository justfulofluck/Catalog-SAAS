import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Plus, Trash2, Edit2, Save, X, GripVertical, ChevronRight, Layers, CreditCard, Package } from 'lucide-react';
import { BusinessTemplate, FormField, FieldType } from '../../types';

const BusinessManager: React.FC = () => {
    const { businessTemplates, addBusinessTemplate, updateBusinessTemplate } = useStore();
    const [isEditing, setIsEditing] = useState(false);
    const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);

    // Editor State
    const [templateName, setTemplateName] = useState('');
    const [templateDesc, setTemplateDesc] = useState('');
    const [fields, setFields] = useState<FormField[]>([]);

    const handleCreateNew = () => {
        setTemplateName('');
        setTemplateDesc('');
        setFields([]);
        setActiveTemplateId(null);
        setIsEditing(true);
    };

    const handleEdit = (template: BusinessTemplate) => {
        setTemplateName(template.name);
        setTemplateDesc(template.description);
        setFields([...template.schema]);
        setActiveTemplateId(template.id);
        setIsEditing(true);
    };

    const handleSave = () => {
        if (!templateName) return;

        const newTemplate: BusinessTemplate = {
            id: activeTemplateId || `biz-${Date.now()}`,
            name: templateName,
            description: templateDesc,
            schema: fields
        };

        if (activeTemplateId) {
            updateBusinessTemplate(activeTemplateId, newTemplate);
        } else {
            addBusinessTemplate(newTemplate);
        }
        setIsEditing(false);
    };

    const addField = (section: 'basic' | 'technical' | 'commercial') => {
        const newField: FormField = {
            id: `field-${Date.now()}`,
            label: 'New Field',
            type: 'text',
            section,
            required: false
        };
        setFields([...fields, newField]);
    };

    const updateField = (id: string, updates: Partial<FormField>) => {
        setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const removeField = (id: string) => {
        setFields(fields.filter(f => f.id !== id));
    };

    const renderFieldEditor = (field: FormField) => (
        <div key={field.id} className="p-4 bg-white border border-slate-200 rounded-xl flex items-start gap-4 group hover:border-indigo-300 transition-all shadow-sm">
            <div className="mt-2 text-slate-300 cursor-grab active:cursor-grabbing"><GripVertical size={16} /></div>
            <div className="flex-1 space-y-3">
                <div className="flex gap-3">
                    <div className="flex-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Label</label>
                        <input
                            type="text"
                            value={field.label}
                            onChange={(e) => updateField(field.id, { label: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold focus:border-indigo-500 outline-none"
                        />
                    </div>
                    <div className="w-1/3">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Type</label>
                        <select
                            value={field.type}
                            onChange={(e) => updateField(field.id, { type: e.target.value as FieldType })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold outline-none"
                        >
                            <option value="text">Text</option>
                            <option value="number">Number</option>
                            <option value="textarea">Long Text</option>
                            <option value="select">Dropdown</option>
                            <option value="boolean">Yes/No</option>
                            <option value="image">Image</option>
                        </select>
                    </div>
                </div>

                {field.type === 'select' && (
                    <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Options (Comma separated)</label>
                        <input
                            type="text"
                            value={field.options?.join(', ') || ''}
                            onChange={(e) => updateField(field.id, { options: e.target.value.split(',').map(s => s.trim()) })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold focus:border-indigo-500 outline-none"
                            placeholder="Option 1, Option 2..."
                        />
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => updateField(field.id, { required: e.target.checked })}
                        className="w-3 h-3 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-[10px] font-bold text-slate-500">Required Field</span>
                </div>
            </div>
            <button onClick={() => removeField(field.id)} className="text-slate-300 hover:text-red-500 p-1"><Trash2 size={14} /></button>
        </div>
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-[calc(100vh-200px)] flex">
            {/* Sidebar List */}
            <div className="w-80 border-r border-slate-100 bg-slate-50/50 flex flex-col">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Templates</h3>
                    <button onClick={handleCreateNew} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                        <Plus size={16} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {businessTemplates.map(t => (
                        <button
                            key={t.id}
                            onClick={() => handleEdit(t)}
                            className={`w-full text-left p-3 rounded-xl flex items-center justify-between group transition-all ${activeTemplateId === t.id && isEditing ? 'bg-white shadow-md border border-indigo-100' : 'hover:bg-white hover:shadow-sm'}`}
                        >
                            <div>
                                <p className="text-xs font-bold text-slate-800">{t.name}</p>
                                <p className="text-[10px] text-slate-400">{t.schema.length} Fields</p>
                            </div>
                            <ChevronRight size={14} className="text-slate-300" />
                        </button>
                    ))}
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 flex flex-col bg-slate-50">
                {isEditing ? (
                    <>
                        <div className="p-6 bg-white border-b border-slate-100 flex justify-between items-start">
                            <div className="flex-1 mr-8 space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Template Name</label>
                                    <input
                                        type="text"
                                        value={templateName}
                                        onChange={(e) => setTemplateName(e.target.value)}
                                        className="w-full text-2xl font-black text-slate-900 placeholder:text-slate-300 outline-none border-b border-transparent focus:border-slate-200 bg-transparent py-1"
                                        placeholder="E.g. Electronics Store"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                                    <input
                                        type="text"
                                        value={templateDesc}
                                        onChange={(e) => setTemplateDesc(e.target.value)}
                                        className="w-full text-sm font-medium text-slate-500 placeholder:text-slate-300 outline-none border-b border-transparent focus:border-slate-200 bg-transparent py-1"
                                        placeholder="Short description for user selection screen..."
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg">Cancel</button>
                                <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 flex items-center gap-2">
                                    <Save size={14} /> Save Schema
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Basic Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                                        <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2"><Package size={14} /> Basic Fields</h4>
                                        <button onClick={() => addField('basic')} className="text-[10px] font-bold text-indigo-600 hover:underline">+ Add Field</button>
                                    </div>
                                    <div className="space-y-3 min-h-[100px]">
                                        {fields.filter(f => f.section === 'basic').map(renderFieldEditor)}
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
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <Edit2 size={48} className="mb-4 text-slate-200" />
                        <p className="text-sm font-bold">Select a template to edit or create a new one.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BusinessManager;