import { Section } from "lucide-react"
import Beams from "./components/Beams"
import Navbar from "./components/Navbar";


export default function App() {
  return (
    <div className="relative w-screen min-h-screen overflow-x-hidden">
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
        {/* Example sections */}
        <section id="about" className="min-h-screen flex items-center justify-center">
          <h2 className="text-2xl">About</h2>
        </section>

        <section id="Projects" className="min-h-screen flex items-center justify-center">
          <h2 className="text-2xl">Projects</h2>
        </section>
        {/* Add more sections as needed */}
      </div>
    </div>
  );
}