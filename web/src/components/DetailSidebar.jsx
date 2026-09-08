import { Link, useLocation } from 'react-router-dom';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import groups from '../data/tutorialGroups.json';
import './DetailSidebar.css';

/**
 * GFG-style left rail: a site-wide list of topic categories (collapsed to a
 * single link each), with the category matching the current route expanded
 * to show every question/section on that page so a reader can jump straight
 * to one.
 */
export default function DetailSidebar({ heading = 'On This Page', items, activeKey, onSelect }) {
  const { pathname } = useLocation();

  return (
    <nav className="detail-sidebar" aria-label="Topics">
      <ul className="category-group-list">
        {groups.map((group) => {
          const isActive = group.to === pathname;
          return (
            <li key={group.key} className="category-group">
              {isActive ? (
                <div className="category-group-header category-group-header-active">
                  <DownOutlined className="category-group-chevron" />
                  {group.label}
                </div>
              ) : (
                <Link to={group.to} className="category-group-header">
                  <RightOutlined className="category-group-chevron" />
                  {group.label}
                </Link>
              )}

              {isActive ? (
                <div className="detail-sidebar-active-panel">
                  <div className="detail-sidebar-heading">{heading}</div>
                  <ul className="detail-sidebar-list">
                    {items.map((item) => (
                      <li key={item.key}>
                        <button
                          type="button"
                          className={
                            'detail-sidebar-link' +
                            (item.key === activeKey ? ' detail-sidebar-link-active' : '')
                          }
                          onClick={() => onSelect(item.key)}
                        >
                          {item.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
