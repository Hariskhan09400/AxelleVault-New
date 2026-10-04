import {
  createPath,
  Link,
  NavLink,
  resolvePath,
  useLocation,
  useNavigate,
  type LinkProps,
  type NavigateOptions,
  type NavLinkProps,
  type To,
} from 'react-router-dom';
import { useCallback, type MouseEventHandler } from 'react';

const sameLocation = (to: To, pathname: string, search: string, hash: string) => {
  const target = createPath(resolvePath(to, pathname));
  const current = createPath({ pathname, search, hash });
  return target === current;
};

const shouldKeepBrowserNavigation = (event: React.MouseEvent<HTMLAnchorElement>, target?: string, reloadDocument?: boolean) =>
  event.defaultPrevented ||
  event.button !== 0 ||
  event.metaKey ||
  event.altKey ||
  event.ctrlKey ||
  event.shiftKey ||
  target === '_blank' ||
  reloadDocument;

export function useSafeNavigate() {
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(
    (to: To | number, options?: NavigateOptions) => {
      if (typeof to === 'number') {
        navigate(to);
        return;
      }

      if (sameLocation(to, location.pathname, location.search, location.hash)) {
        return;
      }

      navigate(to, options);
    },
    [location.hash, location.pathname, location.search, navigate],
  );
}

export function SafeLink({ onClick, state, target, reloadDocument, to, ...props }: LinkProps) {
  const location = useLocation();

  const handleClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
    onClick?.(event);
    if (shouldKeepBrowserNavigation(event, target, reloadDocument)) return;
    if (sameLocation(to, location.pathname, location.search, location.hash)) event.preventDefault();
  };

  return <Link {...props} reloadDocument={reloadDocument} state={state} target={target} to={to} onClick={handleClick} />;
}

export function SafeNavLink({ onClick, state, target, reloadDocument, to, ...props }: NavLinkProps) {
  const location = useLocation();

  const handleClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
    onClick?.(event);
    if (shouldKeepBrowserNavigation(event, target, reloadDocument)) return;
    if (sameLocation(to, location.pathname, location.search, location.hash)) event.preventDefault();
  };

  return <NavLink {...props} reloadDocument={reloadDocument} state={state} target={target} to={to} onClick={handleClick} />;
}