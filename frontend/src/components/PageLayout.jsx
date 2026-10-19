import SiteHeader from './SiteHeader.jsx';

export default function PageLayout({ children }) {
    return <div className="app"><SiteHeader />{children}<footer className="site-footer"><span>BoekHaven</span><span>Een rustige plek voor verhalen.</span></footer></div>;
}
