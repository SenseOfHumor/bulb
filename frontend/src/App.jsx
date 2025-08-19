import './App.css'
import Beams from "./components/Beams"
import Navbar from "./components/Navbar";
import DecryptedText from './components/DecryptedText';
import ScrambledText from './components/ScrambledText';
import TiltedCard from './components/TiltedCard';

export default function App() {
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
              <h2>About</h2>
              <p>About content goes here.</p>
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