// Landing page component for signed-out users
import ScrambledText from '../components/ScrambledText';
import TiltedCard from '../components/TiltedCard';
import AboutSection from '../components/AboutSection';
import CallToAction from '../components/CallToAction';
import PricingSection from '../components/PricingSection';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';
import RecursiveFlow from '../components/RecursiveFlow';
import Beams from '../components/Beams';
import image from "/fixmynotes-ring.svg";

export default function LandingPage() {
  const features = [
    {
      title: "Extract Actionable Items",
      text: "Confused where to start? Let us help you get started",
      image: "https://picsum.photos/id/1011/800/600",
    },
    {
      title: "Research Packs",
      text: "Auto‑research with quotes, dates, and direct URLs.",
      image: "https://picsum.photos/id/1015/800/600",
    },
    {
      title: "Knowledge Graph",
      text: "People ↔ orgs ↔ claims ↔ evidence — all linked.",
      image: "https://picsum.photos/id/1005/800/600",
    },
  ];

  const actionsMap = {
    title: "Investigation Plan",
    children: [
      { title: "Ingest transcript" },
      {
        title: "Extract action items",
        children: [{ title: "Assign owners" }, { title: "Set due dates" }],
      },
      {
        title: "Research & verify",
        children: [
          { title: "Collect citations from source A/B" },
          { title: "Cross-source check conflicting claims" },
        ],
      },
      {
        title: "Build knowledge graph",
        collapsed: true,
        children: [
          { title: "People & orgs" },
        ],
      },
    ],
  };

  return (
    <div className="w-full overflow-x-hidden">
      {/* Persistent background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Beams
          beamWidth={3}
          beamHeight={15}
          beamNumber={12}
          lightColor="#4A6C82"
          speed={2}
          noiseIntensity={1.75}
          scale={0.5}
          rotation={45}
        />
      </div>
      {/* Foreground content */}
      <div className="relative z-10">
        <main className="w-full overflow-x-hidden">
      <section id="home" className="section">
        <div className="section-content">
          <h1>
            <span className="text-4xl font-bold text-zinc-100">FIXMYNOTES</span>
          </h1>
          <div className='section-content flex flex-col md:flex-row items-center justify-center gap-8 min-h-[300px]'>
            <ScrambledText
              className="scrambled-text-demo"
              radius={100}
              duration={1.2}
              speed={0.5}
              scrambleChars=".:"
              >
                The amount of search is not a measure of the amount of intelligence being exhibited. What makes a problem a problem is not that a large amount of search is required for its solution, but that a large amount would be required if a requisite level of intelligence were not applied.
              </ScrambledText>
              <TiltedCard
                imageSrc={image}
                altText="TRACE"
                captionText="Meet TRACE - your AI research assistant"
                containerHeight="250px"
                containerWidth="250px"
                imageHeight="250px"
                imageWidth="250px"
                rotateAmplitude={12}
                scaleOnHover={1.2}
                showMobileWarning={false}
                showTooltip={false}
                displayOverlayContent={true}
                overlayContent={
                  <p className="tilted-card-demo-text">
                    Meet TRACE - your AI research assistant
                  </p>
                }
              />
          </div>
        </div>
      </section>
      <section id="about" className="section">
        <div className="section-content">
          <AboutSection
            eyebrow="About BULB"
            title="From noise to signal."
            subtitle={
              <>
                Extract actions, compile research, and reveal connections.{' '}
                <span className="inline-block rounded-full bg-[rgba(65,105,225,0.35)] text-white/80 px-2 py-0.5 text-xs font-medium shadow-sm align-middle">Fast AF</span>
              </>
            }
            blurb="Built for researchers, journalists, field agents, students or ANYONE who need verifiable truth."
            features={features}
          />
          <RecursiveFlow
            data={actionsMap}
            direction="LR"
            initialCollapsedDepth={1}
          />
        </div>
      </section>
      <section id="call to action" className="section">
        <div className="section-content">
          <CallToAction
            eyebrow="Built for truth-seekers"
            title="Your transcript → action, research, graph."
            subtitle="Spin up a brief with citations in minutes."
            primary={{ label: "Try the Demo", href: "#demo" }}
            secondary={{ label: "Pricing", href: "#pricing" }}
            bullets={[
              "Source-linked statements",
              "Interactive knowledge graph",
              "Export to PDF/Markdown",
            ]}
            showEmail={false}
          />
        </div>
      </section>
      
      <section id="pricing" className="section">
        <div className="section-content">
          <PricingSection />
        </div>
      </section>
      
      <section id="contact" className="section">
        <div className="section-content">
          <ContactSection 
            formspreeEndpoint="https://formspree.io/f/YOUR_FORM_ID"
            eyebrow="Get in Touch"
            title="Let's build something amazing together"
            subtitle="Have questions about BULB? Need a custom research solution? We'd love to hear from you."
          />
        </div>
      </section>
      <Footer className="mt-24" />
    </main>
      </div>
    </div>
  );
}
