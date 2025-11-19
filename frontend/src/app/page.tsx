import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import ShowcaseSection from "@/components/ShowcaseSection";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-linear-to-br from-amber-50 via-rose-50 to-orange-50 overflow-hidden">
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Showcase Section */}
      <ShowcaseSection />

      {/* Contact Section - Placeholder */}
      <section id="contact" className="min-h-screen w-full flex items-center justify-center px-8 bg-white/30">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold bg-linear-to-b from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent mb-4">
            Contact
          </h2>
          <p className="text-xl text-gray-600">Coming soon...</p>
        </div>
      </section>
    </div>
  );
}
