import type { ReactElement, ReactNode } from 'react';

interface RootGroupLayoutProps {
  children: ReactNode;
}

export default function RootGroupLayout({ children }: RootGroupLayoutProps): ReactElement {
  return <>{children}</>;
}
