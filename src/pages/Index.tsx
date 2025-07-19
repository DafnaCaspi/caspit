import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { SchemaAnalyzer } from "@/components/SchemaAnalyzer";
import { Features } from "@/components/Features";
import { Pricing } from "@/components/Pricing";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <SchemaAnalyzer />
      <Features />
      <Pricing />
      <Footer />
    </div>
  );
};

export default Index;
