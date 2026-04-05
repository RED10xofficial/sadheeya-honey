import Navbar from './components/Navbar';
import BannerSequence from './components/BannerSequence';
import ProcessSequence from './components/Process';
import Footer from './components/Footer';

export default function Home() {
  return (
    <main>
      <Navbar />
      <BannerSequence />
      <ProcessSequence />
      <Footer />
    </main>
  );
}
