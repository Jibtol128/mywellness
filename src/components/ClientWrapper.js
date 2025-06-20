'use client';

import BadgeRemover from './BadgeRemover';

export default function ClientWrapper({ children }) {
  return (
    <>
      {children}
      <BadgeRemover />
    </>
  );
}
