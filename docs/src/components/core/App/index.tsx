import { CaptureLinkClicks } from "@pulsor/location";
import { Router, TrackLocation } from "/src/components/core/Router";
import Header from "/src/components/core/Header";
import Footer from "/src/components/core/Footer";
import NotFoundPage from "/src/components/core/404";

import hljs from 'highlight.js/lib/core';
import xml from 'highlight.js/lib/languages/xml';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';

hljs.registerLanguage('xml', xml);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);


export default (
  <div
    init={TrackLocation}
    onclick={CaptureLinkClicks}
  >
    {Header}
    <main>
      <Router notFound={NotFoundPage} />
    </main>
    {Footer}
  </div>
)
