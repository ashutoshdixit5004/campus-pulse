'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // Login route does not require authentication
    if (pathname === '/admin/login') {
      setIsAuthorized(true);
      return;
    }

    const authenticated = isAdminAuthenticated();
    if (!authenticated) {
      setIsAuthorized(false);
      router.replace(`/login?type=admin&redirect=${encodeURIComponent(pathname)}`);
    } else {
      setIsAuthorized(true);
    }
  }, [pathname, router]);

  // If on login route, render immediately without guarding
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Loading authorization state
  if (isAuthorized === null || isAuthorized === false) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--text-muted)' }}>
        <i className="fa-solid fa-shield-halved fa-beat" style={{ fontSize: '36px', color: 'var(--accent-orange)', marginBottom: '1.25rem' }}></i>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', letterSpacing: '0.05em' }}>
          VERIFYING ADMINISTRATIVE ACCESS PRIVILEGES...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
