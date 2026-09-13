'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import RoleBar from './RoleBar';
import AdminNavbar from './AdminNavbar';
import StudentNavbar from './StudentNavbar';

export default function HeaderNavigation() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <>
      <RoleBar />
      {isAdmin ? <AdminNavbar /> : <StudentNavbar />}
    </>
  );
}
