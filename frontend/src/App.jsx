import './App.css'
import Beams from "./components/Beams"
import Navbar from "./components/Navbar";
import DecryptedText from './components/DecryptedText';
import ScrambledText from './components/ScrambledText';
import TiltedCard from './components/TiltedCard'
import AboutSection from './components/AboutSection';

export default function App() {
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
        <Navbar />
        <main className="w-full overflow-x-hidden">
          <section id="home" className="section">
            <div className="section-content">
              <h1>
                <span className="text-4xl font-bold text-zinc-100">BULB</span>
              </h1>
              <div className='section-content flex flex-col md:flex-row items-center justify-center gap-8'>
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
                    imageSrc="https://www.onthisday.com/images/people/allen-newell.jpg?w=360"
                    altText="Allen Newell"
                    captionText="Allen Newell Computer Scientist"
                    containerHeight="300px"
                    containerWidth="300px"
                    imageHeight="300px"
                    imageWidth="300px"
                    rotateAmplitude={12}
                    scaleOnHover={1.2}
                    showMobileWarning={false}
                    showTooltip={false}
                    displayOverlayContent={true}
                    overlayContent={
                      <p className="tilted-card-demo-text">
                        Allen Newell - Computer Scientist
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
                    We extract actions, compile research, and reveal connections.{' '}
                    <span className="inline-block rounded-full bg-[rgba(65,105,225,0.35)] text-white/80 px-2 py-0.5 text-xs font-medium shadow-sm align-middle">fast af</span>
                  </>
                }
                blurb="Built for researchers, journalists, field agents, students or ANYONE who need verifiable truth."
                features={features}
              />
            </div>
          </section>
          <section id="call to action" className="section">
            <div className="section-content">
              <h2>Call to Action</h2>
              <p>Encourage users to take action.</p>
            </div>
          </section>
          <section id="contact" className="section">
            <div className="section-content">
              <h2>Contact</h2>
              <p>Contact info goes here.</p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}