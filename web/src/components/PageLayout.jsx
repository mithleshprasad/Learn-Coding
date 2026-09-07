import { Typography } from 'antd';
import SiteHeader from './SiteHeader.jsx';
import SiteFooter from './SiteFooter.jsx';
import './PageLayout.css';

const { Title, Paragraph } = Typography;

/**
 * Shared shell for content/tutorial/visualizer pages: header, a navy title
 * band, a white content container, and the footer. `wide` widens the
 * content container for pages with canvases/wide tables (visualizers).
 */
export default function PageLayout({ title, subtitle, wide = false, children }) {
  const widthClass = wide ? 'page-content-wide' : '';
  return (
    <>
      <SiteHeader />
      <section className={`page-banner ${widthClass}`}>
        <div className="page-banner-inner">
          <Title level={1} className="page-banner-title">
            {title}
          </Title>
          {subtitle ? <Paragraph className="page-banner-subtitle">{subtitle}</Paragraph> : null}
        </div>
      </section>
      <main className={`page-content ${widthClass}`}>{children}</main>
      <SiteFooter />
    </>
  );
}
