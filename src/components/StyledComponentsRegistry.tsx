'use client';

import React, { useState } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { ServerStyleSheet, StyleSheetManager } from 'styled-components';

export default function StyledComponentsRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  // Создаём «лист стилей» для сервера
  const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());

  // Вставляем стили в HTML на сервере
  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement();
    styledComponentsStyleSheet.instance.clearTag();
    return <>{styles}</>;
  });

  // На клиенте — просто рендерим детей
  if (typeof window !== 'undefined') return <>{children}</>;

  // На сервере — оборачиваем в StyleSheetManager
  return (
    <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>
      {children}
    </StyleSheetManager>
  );
}
