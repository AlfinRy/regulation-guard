import {
  Navbar,
  HeroSection,
  PipelineSection,
  RiskTableSection,
  CoverageSection,
  LedgerSection,
  CTASection,
  Footer,
} from './components/sections';
import SectionDivider from './components/ui/SectionDivider';

export default function App() {
  return (
    <div className="min-h-screen bg-bg-base text-text-primary">
      <Navbar />

      <main>
        <HeroSection />
        <SectionDivider />
        <PipelineSection />
        <SectionDivider />
        <RiskTableSection />
        <SectionDivider />
        <CoverageSection />
        <SectionDivider />
        <LedgerSection />
        <SectionDivider />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
