import { useWaitingAnimals, useAnimalStats, useLostAnimals } from '@/hooks/useAnimals';
import HeroSection from '@/components/home/HeroSection';
import LostPetsCarousel from '@/components/home/LostPetsCarousel';
import RecentAnimals from '@/components/home/RecentAnimals';
import AboutFaqSection from '@/components/home/AboutFaqSection';
import { usePageMeta } from '@/hooks/usePageMeta';
import { PAGE_META } from '@/lib/seo';

export default function Index() {
  usePageMeta(PAGE_META['/']);
  const { data: animals, isLoading } = useWaitingAnimals();
  const { data: lostAnimals } = useLostAnimals();
  const { data: stats } = useAnimalStats();
  const recentAnimals = animals?.slice(0, 9) || [];

  return (
    <div>
      {/* Top Dashboard Section */}
      <HeroSection stats={stats} />

      {/* Lost Pets Carousel - Thin, catchy alerts before stray listings */}
      {lostAnimals && lostAnimals.length > 0 && (
        <LostPetsCarousel animals={lostAnimals} />
      )}

      {/* Recent Animals (Waiting only) */}
      <RecentAnimals animals={recentAnimals} isLoading={isLoading} />

      <AboutFaqSection />
    </div>
  );
}
