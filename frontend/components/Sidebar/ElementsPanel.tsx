import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { TextBlockDetailView } from './Elements/views/TextBlockDetailView';
import { ChecklistDetailView } from './Elements/views/ChecklistDetailView';
import { VideoEmbedDetailView } from './Elements/views/VideoEmbedDetailView';
import { TablesDetailView } from './Elements/views/TablesDetailView';
import { ImageFramesDetailView } from './Elements/views/ImageFramesDetailView';
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

  if (activeElementDetail === 'image-frames') {
    return (
      <ImageFramesDetailView
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

  if (activeElementDetail === 'video-embed') {
    return (
      <VideoEmbedDetailView
        isDark={isDark}
        onBack={() => setActiveElementDetail(null)}
        onClose={handleClose}
      />
    );
  }

  if (activeElementDetail === 'tables') {
    return (
      <TablesDetailView
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
