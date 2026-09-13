'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { isStudentAuthenticated } from '@/lib/auth';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // Login and Signup routes under /student are public
    if (pathname === '/student/login' || pathname === '/student/signup') {
      setIsAuthorized(true);
      return;
    }

    const authenticated = isStudentAuthenticated();
    if (!authenticated) {
      setIsAuthorized(false);
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    } else {
      setIsAuthorized(true);
    }
  }, [pathname, router]);

  if (pathname === '/student/login' || pathname === '/student/signup') {
    return <>{children}</>;
  }

  if (isAuthorized === null || isAuthorized === false) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--text-muted)' }}>
        <i className="fa-solid fa-graduation-cap fa-beat" style={{ fontSize: '36px', color: 'var(--accent-cyan)', marginBottom: '1.25rem' }}></i>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
          VALIDATING STUDENT ACCESS CLEARANCE...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
