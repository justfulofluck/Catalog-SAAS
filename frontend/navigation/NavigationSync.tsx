import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { setGlobalNavigate, PATH_TO_VIEW } from './navigationBridge';

export const NavigationSync: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentView = useStore((s) => s.currentView);
  const openPublicViewer = useStore((s) => s.openPublicViewer);
  const viewingCatalogId = useStore((s) => s.viewingCatalogId);

  useEffect(() => {
    setGlobalNavigate(navigate);
    return () => {
      setGlobalNavigate(null);
    };
  }, [navigate]);

  useEffect(() => {
    const pathname = location.pathname;

    // Handle /viewer or /viewer/:uuid
    const viewerMatch = pathname.match(/^\/viewer(?:\/([^\/]+))?/);
    if (viewerMatch) {
      const uuid = viewerMatch[1];
      if (uuid && uuid !== viewingCatalogId) {
        openPublicViewer(uuid);
      }
      if (currentView !== 'public-viewer') {
        useStore.setState({ currentView: 'public-viewer' });
      }
      return;
    }

    // Handle /editor or /editor/:id
    if (pathname === '/editor' || pathname.startsWith('/editor/')) {
      if (currentView !== 'editor') {
        useStore.setState({ currentView: 'editor' });
      }
      return;
    }

    // Handle exact or prefix paths
    const mappedView = PATH_TO_VIEW[pathname];
    if (mappedView && mappedView !== currentView) {
      useStore.setState({ currentView: mappedView });
    }
  }, [location.pathname, currentView, viewingCatalogId, openPublicViewer]);

  return null;
};
