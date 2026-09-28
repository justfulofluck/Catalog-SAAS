import React from 'react';
import { VideosPanel } from '../../VideosPanel';

interface VideoEmbedDetailViewProps {
  isDark: boolean;
  onBack: () => void;
  onClose: () => void;
}

export const VideoEmbedDetailView: React.FC<VideoEmbedDetailViewProps> = ({
  isDark,
  onBack,
  onClose,
}) => {
  return (
    <VideosPanel
      isDark={isDark}
      onBack={onBack}
      onClose={onClose}
    />
  );
};

export default VideoEmbedDetailView;
