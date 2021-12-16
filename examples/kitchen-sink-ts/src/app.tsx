import { EnhanceLinkClicks } from '../../../pkg/location'
import Header from '/src/components/Header'
import Router from '/src/components/Router'
import Footer from '/src/components/Footer'
import './style.css'

export default (
  <main onclick={EnhanceLinkClicks}>
    {Header}
    <Router />
    {Footer}
  </main>
)
