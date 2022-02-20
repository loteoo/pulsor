import { CaptureLinkClicks } from "@pulsor/location";
import { Router, TrackLocation } from "/src/components/core/Router";
import Header from "/src/components/core/Header";
import Footer from "/src/components/core/Footer";
import NotFoundPage from "/src/components/core/404";


import hljs from 'highlight.js/lib/core';
import xml from 'highlight.js/lib/languages/xml';
import typescript from 'highlight.js/lib/languages/typescript';

hljs.registerLanguage('xml', xml);
hljs.registerLanguage('typescript', typescript);

const HighlightPage = ({
  effect: () => {
    document.querySelectorAll('.markdown-content code').forEach(el => {
      //@ts-ignore
      hljs.highlightElement(el);
    });
  }
});

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
    {state => ({
      key: `${state.location.path}${state.location.status}`,
      init: HighlightPage,
    })}
  </div>
)
