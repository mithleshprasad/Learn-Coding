import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Drawer, Grid, Menu } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import navMenu from '../data/nav.json';

const { useBreakpoint } = Grid;

function toMenuItems(items) {
  return items.map((item) =>
    item.children
      ? {
          key: item.key,
          label: item.label,
          children: item.children.map((child) => ({
            key: child.key,
            label: <Link to={child.to}>{child.label}</Link>,
          })),
        }
      : {
          key: item.key,
          label: <Link to={item.to}>{item.label}</Link>,
        },
  );
}

const staticLinks = [
  { key: 'home', label: 'Home', to: '/#home' },
  { key: 'tutorials', label: 'Tutorials', to: '/#tutorials' },
  { key: 'topics', label: 'Topics', to: '/#topics' },
  { key: 'testimonials', label: 'Testimonials', to: '/#testimonials' },
  { key: 'code-editor', label: 'Code Editor', to: '/code-editor' },
];

export default function SiteHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const screens = useBreakpoint();
  const isMobile = screens.md === false;

  const items = useMemo(
    () => [
      ...staticLinks.map((item) => ({ key: item.key, label: <Link to={item.to}>{item.label}</Link> })),
      ...toMenuItems(navMenu),
    ],
    [],
  );

  return (
    <header className="site-header">
      <Link to="/#home" className="site-logo">
        Learn Coding
      </Link>

      {isMobile ? (
        <>
          <Button
            className="hamburger-btn"
            type="text"
            icon={<MenuOutlined style={{ color: '#e6edf3', fontSize: 20 }} />}
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation menu"
          />
          <Drawer
            title="Menu"
            placement="right"
            onClose={() => setDrawerOpen(false)}
            open={drawerOpen}
            size="default"
          >
            <Menu
              mode="inline"
              items={items}
              onClick={() => setDrawerOpen(false)}
              style={{ borderInlineEnd: 'none' }}
            />
          </Drawer>
        </>
      ) : (
        <Menu mode="horizontal" items={items} className="site-nav-menu" theme="dark" />
      )}
    </header>
  );
}
