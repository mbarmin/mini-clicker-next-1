'use client';

import React from 'react';
import StyledComponentsRegistry from './StyledComponentsRegistry';
import GlobalStyles from '@/styles/GlobalStyles';

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <StyledComponentsRegistry>
      <GlobalStyles />
      {children}
    </StyledComponentsRegistry>
  );
}
