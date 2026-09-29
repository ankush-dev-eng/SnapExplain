import { Cpu, Wifi, WifiOff } from 'lucide-react';

interface ProviderBadgeProps {
  providerName: string;
  isLocal: boolean;
  isDemo: boolean;
}

export function ProviderBadge({ providerName, isLocal, isDemo }: ProviderBadgeProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
          isLocal
            ? 'bg-emerald-950/60 border-emerald-700/40 text-emerald-400'
            : 'bg-yellow-950/60 border-yellow-700/40 text-yellow-400'
        }`}
        title={providerName}
        aria-label={`AI Provider: ${providerName}`}
      >
        {isLocal ? (
          <WifiOff className="w-3 h-3" aria-hidden="true" />
        ) : (
          <Wifi className="w-3 h-3" aria-hidden="true" />
        )}
        {isLocal ? 'On-Device AI (Demo NLP)' : 'Cloud AI'}
      </div>

      {isDemo && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border bg-violet-950/60 border-violet-700/40 text-violet-400">
          <Cpu className="w-3 h-3" aria-hidden="true" />
          Demo Mode
        </div>
      )}
    </div>
  );
}
