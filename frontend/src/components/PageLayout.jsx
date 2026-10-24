/**
 * Layout-component die de algemene structuur van de pagina definieert.
 * Bevat een navigatiebalk (SiteHeader), de dynamische pagina-inhoud (children)
 * en een vaste footer met de naam 'BoekHaven' en slogan.
 */
import SiteHeader from './SiteHeader.jsx';

export default function PageLayout({ children }) {
    return <div className="app"><SiteHeader />{children}<footer className="site-footer"><span>BoekHaven</span><span>Een rustige plek voor verhalen.</span></footer></div>;
}
