import React, { type ReactNode, useEffect } from 'react';
import { PageErrorBoundary, usePageErrorLogger } from '@/lib/errorBoundary';
import type { PageName } from '@/lib/logger';
import { logInfo } from '@/lib/logger';

interface PageWrapperProps {
  children: ReactNode;
  page: PageName;
}

export function PageWrapper({ children, page }: PageWrapperProps) {
  const { logRenderError } = usePageErrorLogger(page);

  useEffect(() => {
    logInfo(page, `Page mounted`);
    
    return () => {
      logInfo(page, `Page unmounted`);
    };
  }, [page]);

  return (
    <PageErrorBoundary page={page}>
      {children}
    </PageErrorBoundary>
  );
}

export function withPageLogging<P extends object>(
  Component: React.ComponentType<P>,
  page: PageName
) {
  return function WrappedComponent(props: P) {
    return (
      <PageErrorBoundary page={page}>
        <Component {...props} />
      </PageErrorBoundary>
    );
  };
}
