import { useEffect, useRef } from 'react';
import { Link, Outlet, useLocation } from 'react-router';

/**
 * Client-side navigation does not move focus or announce the new page. Move focus to <main> on
 * pathname change (not on search-param changes such as filters, which must keep focus in place).
 */
export function AppLayout() {
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    mainRef.current?.focus();
  }, [pathname]);

  return (
    <>
      <a href="#main" className="skip-link">
        تخطَّ إلى المحتوى
      </a>
      <header>
        <nav aria-label="التنقل الرئيسي">
          <Link to="/requests/new">طلب جديد</Link>
        </nav>
      </header>
      <main id="main" ref={mainRef} tabIndex={-1}>
        <Outlet />
      </main>
    </>
  );
}
