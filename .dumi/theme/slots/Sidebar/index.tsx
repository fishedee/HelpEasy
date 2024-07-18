import { NavLink, useFullSidebarData, useLocale, useLocation, useRouteMeta, useSidebarData, useSiteData } from 'dumi';
import Toc from 'dumi/theme/slots/Toc';
import React, { type FC } from 'react';
import './index.less';
import { getLocaleClearPath, getRouteParentPath } from 'dumi/dist/client/theme-api/useSidebarData';

const useMySidebarData = () => {
  const locale = useLocale();
  const sidebar = useFullSidebarData();
  const { _2_level_nav_available: is2LevelNav } = useSiteData();
  //固定获取/all路径的路由
  const { pathname } = {pathname:'/all'}
  const meta = useRouteMeta();
  const clearPath = getLocaleClearPath(pathname.slice(1), locale);
  // extract parent path from location pathname
  // /a => /a
  // /a/b => /a
  // /en-US/a => /en-US/a
  // /en-US/a/b => /en-US/a
  // /en-US/a/b/ => /en-US/a (also strip trailing /)
  const parentPath = clearPath
    ? pathname.replace(clearPath, (s) =>
        getRouteParentPath(s, { is2LevelNav, meta, locale }),
      )
    : pathname;

  return parentPath ? sidebar[parentPath] : [];
};

const Sidebar: FC = () => {
  const { pathname } = useLocation();
  const meta = useRouteMeta();
  const sidebar = useMySidebarData();
  if (!sidebar) return null;


  return (
    <div className="dumi-default-sidebar">
      {sidebar.map((item, i) => (
        <dl className="dumi-default-sidebar-group" key={String(i)}>
          {item.title && <dt onClick={(e) => {
            const allDD = e.currentTarget.parentNode.querySelectorAll('dd');
            if (allDD.length != 0) {
              allDD[0].querySelector('a').click();
            }
          }}>{item.title}</dt>}
          {item.children.map((child) => (
            <dd key={child.link}>
              <NavLink to={child.link} title={child.title} end>
                {child.title}
              </NavLink>
            </dd>
          ))}
        </dl>
      ))}
    </div>
  );
};

export default Sidebar;