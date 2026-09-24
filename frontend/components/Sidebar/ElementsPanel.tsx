import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { TextBlockDetailView } from './Elements/views/TextBlockDetailView';
import { ChecklistDetailView } from './Elements/views/ChecklistDetailView';
import { ElementsOverview } from './Elements/views/ElementsOverview';

export const ElementsPanel: React.FC = () => {
  const { uiTheme, setSidebarExpanded } = useStore();
  const isDark = uiTheme === 'dark';
  const [activeElementDetail, setActiveElementDetail] = useState<string | null>(null);

  const handleClose = () => {
    setSidebarExpanded(false);
  };

  if (activeElementDetail === 'text-blocks') {
    return (
      <TextBlockDetailView
        isDark={isDark}
        onBack={() => setActiveElementDetail(null)}
        onClose={handleClose}
      />
    );
  }

  if (activeElementDetail === 'checklist') {
    return (
      <ChecklistDetailView
        isDark={isDark}
        onBack={() => setActiveElementDetail(null)}
        onClose={handleClose}
      />
    );
  }

  return (
    <ElementsOverview
      isDark={isDark}
      onSelectCategory={(categoryId) => setActiveElementDetail(categoryId)}
      onClose={handleClose}
    />
  );
};

export default ElementsPanel;
