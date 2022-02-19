import { CaptureLinkClicks } from "@pulsor/location";
import { Router, TrackLocation } from "/src/components/core/Router";
import Header from "/src/components/core/Header";
import Footer from "/src/components/core/Footer";
import NotFoundPage from "/src/components/core/404";

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
