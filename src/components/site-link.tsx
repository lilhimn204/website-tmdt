import type { ReactNode } from 'react';
import { NavLink } from 'react-router';
import type { NavigationItem } from './navigation-data';

interface SiteLinkProps {
  item: NavigationItem;
  children?: ReactNode;
  className?: string;
  onNavigate?: () => void;
}

export function SiteLink({ item, children, className = '', onNavigate }: SiteLinkProps) {
  if (!item.available) {
    return <span role="link" aria-disabled="true" className={`site-link is-unavailable ${className}`} title="Trang này chưa mở trong bản xem trước.">{children ?? item.label}</span>;
  }
  return <NavLink to={item.to} end={item.to === '/'} onClick={onNavigate} className={`site-link ${className}`}>{children ?? item.label}</NavLink>;
}
