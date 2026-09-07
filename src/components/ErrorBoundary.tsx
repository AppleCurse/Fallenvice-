import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Beklenmedik bir render hatasında beyaz ekran yerine, deneyimin
 * diline sadık bir kapanış gösterir. Sayfayı yeniden yüklemek tek
 * kurtarma yolu — uygulamada kalıcı durum olmadığı için kayıp yaşanmaz.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    // Telemetri yok; yalnızca geliştirici konsoluna düşsün.
    if (import.meta.env.DEV) console.error('[manifesto]', error);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="min-h-screen bg-[#040303] text-[#f5eedf] flex flex-col items-center justify-center px-6 text-center gap-6">
        <div
          aria-hidden="true"
          className="w-3 h-3 rounded-full bg-[#7a6f60] shadow-[0_0_25px_rgba(122,111,96,0.5)]"
        />
        <h1 className="unicase text-2xl sm:text-3xl tracking-[0.3em] text-[#c5a26f] font-light">
          KOR SÖNDÜ
        </h1>
        <p className="garamond italic text-[#7a6f60] max-w-sm">
          Oda beklenmedik bir şekilde karardı. Kibriti yeniden çakabilirsin.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-6 py-2.5 rounded-full border border-[rgba(184,136,74,0.35)] bg-[rgba(10,8,7,0.85)] text-[#e5a758] text-[10px] uppercase tracking-[0.3em] inter-ui hover:border-[#e5a758] hover:bg-[rgba(184,136,74,0.15)] transition-all cursor-pointer"
        >
          Yeniden Ateşle
        </button>
      </div>
    );
  }
}
