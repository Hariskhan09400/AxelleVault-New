import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Hero artwork. Files live in /public:
 *   public/hero-hacker.webp  (126 KB, used by all modern browsers)
 *   public/hero-hacker.png   (fallback)
 */
export function HeroHacker() {
  const reduce = useReducedMotion();
  const [loaded, setLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
  );

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const onChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return (
    <motion.div
      className="mx-auto w-full max-w-[22rem] sm:max-w-md lg:max-w-xl"
      animate={reduce || isMobile ? undefined : { y: [0, -6, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
    >
      <picture>
        <source srcSet="/hero-hacker.webp" type="image/webp" />
        <img
          src="/hero-hacker.png"
          alt="Masked hacker at a laptop showing the AxelleVault logo"
          width={1000}
          height={822}
          loading="eager"
          decoding="async"
          draggable={false}
          onLoad={() => setLoaded(true)}
          className={`h-auto w-full select-none transition-opacity duration-500 motion-reduce:transition-none ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </picture>
    </motion.div>
  );
}