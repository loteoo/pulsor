import { CaptureLinkClicks } from '@pulsor/location'
import Header from '/src/components/Header'
import Footer from '/src/components/Footer'
import { TrackLocation, Router } from './utils/location'
import './style.css'

export default (
  <main
    init={TrackLocation}
    onclick={CaptureLinkClicks}
  >
    {Header}
    <Router />
    {Footer}
  </main>
)
