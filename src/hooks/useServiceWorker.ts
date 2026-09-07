import { useEffect, useState } from 'react';

interface SWState {
  /** Bekleyen yeni bir sürüm var */
  updateReady: boolean;
  /** İçerik önbelleğe alındı — çevrimdışı çalışır */
  offlineReady: boolean;
  /** Bekleyen worker'ı devreye alıp sayfayı yeniler */
  applyUpdate: () => void;
}

/**
 * Service worker kaydı ve güncelleme akışı.
 *
 * Kritik nokta: kullanıcıya sessizce eski sürüm servis etmemek.
 * Yeni bir worker kurulduğunda otomatik geçmiyoruz — okuma akışını
 * bölmemek için önce soruyoruz, onay gelince skipWaiting + reload.
 */
export function useServiceWorker(): SWState {
  const [updateReady, setUpdateReady] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    // Geliştirmede kayıt yapma: HMR ile çakışır ve bayat modül servis eder.
    if (import.meta.env.DEV) return;
    if (!('serviceWorker' in navigator)) return;

    let registration: ServiceWorkerRegistration | null = null;
    let reloading = false;

    // Yeni worker kontrolü devraldığında tam bir yenileme yap.
    const onControllerChange = () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    const register = async () => {
      try {
        // base './' olduğu için kayıt, sayfanın bulunduğu dizine göre çözülür
        // (GitHub Pages proje alt yolu ile uyumlu).
        registration = await navigator.serviceWorker.register('./sw.js', {
          scope: './',
          // SW betiğinin kendisi HTTP önbelleğinden gelmesin; aksi halde
          // güncelleme statik barındırmada saatlerce fark edilmeyebilir.
          updateViaCache: 'none',
        });

        // Zaten bekleyen bir sürüm varsa hemen bildir.
        if (registration.waiting && navigator.serviceWorker.controller) {
          setWaiting(registration.waiting);
          setUpdateReady(true);
        }

        registration.addEventListener('updatefound', () => {
          const installing = registration?.installing;
          if (!installing) return;

          installing.addEventListener('statechange', () => {
            if (installing.state !== 'installed') return;

            if (navigator.serviceWorker.controller) {
              // Eski bir sürüm çalışıyordu → bu bir güncelleme.
              setWaiting(installing);
              setUpdateReady(true);
            } else {
              // İlk kurulum → artık çevrimdışı çalışır.
              setOfflineReady(true);
            }
          });
        });
      } catch {
        // Kayıt başarısızsa site normal (ağa bağımlı) çalışmaya devam eder.
      }
    };

    // Kayıt ilk boyamayı yavaşlatmasın.
    if (document.readyState === 'complete') void register();
    else window.addEventListener('load', () => void register(), { once: true });

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
    };
  }, []);

  const applyUpdate = () => {
    if (!waiting) {
      window.location.reload();
      return;
    }
    waiting.postMessage('SKIP_WAITING');
    setUpdateReady(false);
  };

  return { updateReady, offlineReady, applyUpdate };
}
