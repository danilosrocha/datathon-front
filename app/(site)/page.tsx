import { FinalCta } from "@/components/home/final-cta";
import { Hero } from "@/components/home/hero";
import { ProtectionBenefits } from "@/components/home/protection-benefits";

import "@/components/home/landing.css";

export default function HomePage() {
  return (
    <div className="landing-page">
      <Hero />
      <ProtectionBenefits />
      <FinalCta />
    </div>
  );
}
