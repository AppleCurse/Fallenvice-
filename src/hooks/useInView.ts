import { useEffect, useRef, useState } from 'react';

/**
 * Tek bir elemanın görünürlüğünü IntersectionObserver ile izler.
 *
 * `ManifestoVurgusu` daha önce her mousemove olayında getBoundingClientRect()
 * çağırıyordu; sayfada 10 örneği olduğu için bu, fare her kıpırdadığında
 * 10 zorunlu layout hesabı (forced reflow) demekti. Observer bu maliyeti
 * tarayıcıya devrediyor.
 */
export function useInView<T extends Element>(options?: {
  /** Görünür sayılmak için gereken kesişim oranı */
  threshold?: number;
  /** Viewport'u daraltıp "orta bant" tetiklemesi yapmak için */
  rootMargin?: string;
  /** true ise ilk görünmeden sonra izlemeyi bırakır */
  once?: boolean;
}) {
  const { threshold = 0.15, rootMargin = '0px', once = false } = options ?? {};
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      // Çok eski tarayıcı: içeriği gizli bırakmaktansa görünür kabul et.
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, inView };
}
