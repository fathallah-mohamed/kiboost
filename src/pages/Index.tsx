import { HeroSection } from '@/components/home/HeroSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { ExploreSection } from '@/components/home/ExploreSection';
import { PremiumTeaser } from '@/components/home/PremiumTeaser';
import { Link } from 'react-router-dom';
import { useSession } from "@supabase/auth-helpers-react";
import { Button } from '@/components/ui/button';

const Index = () => {
  const session = useSession();

  return (
    <div className="min-h-screen bg-[#FFF5E4]">
      <nav className="p-4 flex justify-end">
        {!session && (
          <Link 
            to="/login"
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Se connecter
          </Link>
        )}
      </nav>
      <HeroSection />
      <FeaturesSection />
      <ExploreSection />
      <PremiumTeaser />
    </div>
  );
};

export default Index;