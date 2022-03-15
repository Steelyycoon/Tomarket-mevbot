import '../styles/global.scss';
import { useRouter } from 'next/router';
import clsx from 'clsx';
import Script from 'next/script';

import Metadata from 'components/general/metadata';
import RestrictedRoute from 'components/general/restrictedRoute';
import AppProviders from 'components/general/appProviders';
import MessageBanner from '../components/messagebanner/messagebanner.js';
import Navigation from '../components/navigation/navigation.js';
import Footer from '../components/footer/footer.js';

/**
 * App root Component
 */
const App = ({ Component, pageProps }: any) => {
  const { pathname } = useRouter();
  const productRoutes = ['/login', '/account', '/tokens'];
  // const marketingRoutes = ['/', '/pricing', '/about', '/faq', '/terms'];
  const productApp = productRoutes.includes(pathname);

  return (
    <AppProviders authorizationProps={{ ...pageProps }}>
      <Script id="browser-update-lib">
        {`var $buoop = {required:{e:-2,f:-2,o:-2,s:-2,c:-2},insecure:true,api:2022.03 }; 
        function $buo_f(){
          var e = document.createElement("script"); 
          e.src = "//browser-update.org/update.min.js"; 
          document.body.appendChild(e);
        };
        try {document.addEventListener("DOMContentLoaded", $buo_f,false)}
        catch(e){window.attachEvent("onload", $buo_f)}`}
      </Script>
      <Metadata {...pageProps} />
      <RestrictedRoute {...pageProps}>
        <div id="master-container" className={clsx(productApp ? 'product-app' : 'marketing-site')}>
          {productApp && <div className="corkscrew-background"></div>}
          <MessageBanner />
          <Navigation isProductApp={productApp} />
          <Component {...pageProps} />
          <Footer isProductApp={productApp} />
        </div>
      </RestrictedRoute>
    </AppProviders>
  );
};

export default App;
