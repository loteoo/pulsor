import { EnhanceLinkClicks } from '../../../pkg/location'
import Header from './components/Header'
import Router from './components/Router'
import Footer from './components/Footer'
import './style.css'

export default (
  <main onclick={EnhanceLinkClicks}>
    {Header}
    <Router />
    {Footer}
  </main>
)
