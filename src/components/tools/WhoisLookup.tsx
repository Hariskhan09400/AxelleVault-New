import { useState } from 'react';
import { Globe, Info, Search, Calendar, MapPin, Building, Sun, Moon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useRequestSignal } from '../../hooks/useAbortableFetch';

interface WhoisResult {
  domain: string;
  registrar: string;
  expiryDate: string;
  country: string;
  createdDate: string;
  status: string;
}

export const WhoisLookup = ({ isDark }: { isDark: boolean }) => {
  const { user } = useAuth();
  const getRequestSignal = useRequestSignal();
  const [domain, setDomain] = useState('');
  const [result, setResult] = useState<WhoisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const lookupWhois = async () => {
    if (!domain.trim()) return;

    setLoading(true);

    // Mock WHOIS data - in real app, use WHOIS API
    const mockData: Record<string, WhoisResult> = {
      'google.com': {
        domain: 'google.com',
        registrar: 'MarkMonitor Inc.',
        expiryDate: '2024-09-14',
        country: 'United States',
        createdDate: '1997-09-15',
        status: 'Active',
      },
      'github.com': {
        domain: 'github.com',
        registrar: 'GoDaddy.com, LLC',
        expiryDate: '2024-10-09',
        country: 'United States',
        createdDate: '2007-10-09',
        status: 'Active',
      },
      'example.com': {
        domain: 'example.com',
        registrar: 'RESERVED-INTERNET ASSIGNED NUMBERS AUTHORITY',
        expiryDate: '2024-08-14',
        country: 'United States',
        createdDate: '1992-01-01',
        status: 'Reserved',
      },
    };

    // Default mock data for unknown domains
    const defaultData: WhoisResult = {
      domain: domain.toLowerCase(),
      registrar: 'Unknown Registrar',
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      country: 'Unknown',
      createdDate: new Date().toISOString().split('T')[0],
      status: 'Active',
    };

    const whoisResult = mockData[domain.toLowerCase()] || defaultData;
    setResult(whoisResult);

    if (user) {
      const { error } = await supabase.from('security_logs').insert({
        user_id: user.id,
        event_type: 'whois_lookup',
        event_data: { domain: domain.toLowerCase() },
        risk_level: 'low',
      }).abortSignal(getRequestSignal());
      if (error) console.error('[WhoisLookup] security log failed:', error.message);
    }

    setLoading(false);
  };

  const shellBg = isDark ? 'bg-[#0b1f3d]' : 'bg-[#f4f1ea]';
  const primaryText = isDark ? 'text-[#f4f1ea]' : 'text-[#1c2333]';
  const secondaryText = isDark ? 'text-[#c9c2ae]' : 'text-[#8a8272]';
  const borderColor = isDark ? 'border-[#1e3a5f]' : 'border-[#e4ddc9]';
  const inputBg = isDark ? 'bg-[#0d2440]' : 'bg-white';
  const inputText = isDark ? 'text-[#f4f1ea]' : 'text-[#1c2333]';
  const placeholderText = isDark ? 'placeholder-[#c9c2ae]' : 'placeholder-[#a39c8c]';
  const resultCard = isDark ? 'bg-[#0d2440] border-[#1e3a5f]' : 'bg-[#faf7f0] border-[#e4ddc9]';
  const primaryButton = isDark
    ? 'bg-[#e8b74a] text-[#0b1f3d] hover:opacity-90 active:scale-[0.98]'
    : 'bg-[#0b1f3d] text-[#f4f1ea] hover:opacity-90 active:scale-[0.98]';
  const toggleButton = isDark
    ? 'border-[#1e3a5f] bg-[#0d2440] text-[#e8b74a]'
    : 'border-[#e4ddc9] bg-white text-[#0b1f3d]';

  return (
    <div className={`w-full min-h-full ${shellBg} ${primaryText} transition-colors duration-200`}>
      <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-6">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              isDark ? 'bg-[#0d2440] text-[#e8b74a]' : 'bg-[#f6f1e8] text-[#0b1f3d]'
            }`}
          >
            <Globe className="h-5 w-5" />
          </div>
          <h3 className={`text-lg font-semibold sm:text-xl ${primaryText}`}>WHOIS Lookup</h3>
        </div>

        <button
          type="button"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-200 ${toggleButton}`}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>

      <div className="px-4 pb-4 sm:px-6 sm:pb-6">
        <div className="space-y-4">
          <div>
            <label className={`mb-1.5 block text-[11px] font-semibold uppercase tracking-wide ${secondaryText}`}>
              Domain Name
            </label>

            <div className="relative">
              <Search
                className={`pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${
                  isDark ? 'text-[#c9c2ae]' : 'text-[#8a8272]'
                }`}
              />
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className={`w-full rounded-2xl border py-3.5 pl-11 pr-4 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[#0b1f3d]/10 focus:border-[#0b1f3d]/40 ${inputBg} ${borderColor} ${inputText} ${placeholderText}`}
                placeholder="example.com"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={lookupWhois}
            disabled={!domain.trim() || loading}
            className={`w-full rounded-full py-3.5 text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${primaryButton}`}
          >
            <span className="flex items-center justify-center gap-2">
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Lookup WHOIS
            </span>
          </button>

          {result && (
            <div className="mt-6 space-y-4">
              <div className={`rounded-2xl border p-4 ${resultCard}`}>
                <h4 className={`mb-4 flex items-center gap-2 text-base font-semibold ${primaryText}`}>
                  <Info className="h-4 w-4" style={{ color: isDark ? '#e8b74a' : '#0b1f3d' }} />
                  WHOIS Information
                </h4>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Globe className={`mt-0.5 h-4 w-4 ${secondaryText}`} />
                      <div className="min-w-0">
                        <p className={`text-[11px] font-semibold uppercase tracking-wide ${secondaryText}`}>Domain</p>
                        <p className={`mt-1 text-sm font-medium ${isDark ? 'text-[#f4f1ea]' : 'text-[#1c2333]'}`}>
                          {result.domain}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Building className={`mt-0.5 h-4 w-4 ${secondaryText}`} />
                      <div className="min-w-0">
                        <p className={`text-[11px] font-semibold uppercase tracking-wide ${secondaryText}`}>Registrar</p>
                        <p className={`mt-1 text-sm font-medium ${isDark ? 'text-[#f4f1ea]' : 'text-[#1c2333]'}`}>
                          {result.registrar}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className={`mt-0.5 h-4 w-4 ${secondaryText}`} />
                      <div className="min-w-0">
                        <p className={`text-[11px] font-semibold uppercase tracking-wide ${secondaryText}`}>Country</p>
                        <p className={`mt-1 text-sm font-medium ${isDark ? 'text-[#f4f1ea]' : 'text-[#1c2333]'}`}>
                          {result.country}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Calendar className={`mt-0.5 h-4 w-4 ${secondaryText}`} />
                      <div className="min-w-0">
                        <p className={`text-[11px] font-semibold uppercase tracking-wide ${secondaryText}`}>Created</p>
                        <p className={`mt-1 text-sm font-medium ${isDark ? 'text-[#f4f1ea]' : 'text-[#1c2333]'}`}>
                          {result.createdDate}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Calendar className={`mt-0.5 h-4 w-4 ${secondaryText}`} />
                      <div className="min-w-0">
                        <p className={`text-[11px] font-semibold uppercase tracking-wide ${secondaryText}`}>Expires</p>
                        <p className={`mt-1 text-sm font-medium ${isDark ? 'text-[#f4f1ea]' : 'text-[#1c2333]'}`}>
                          {result.expiryDate}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Info className={`mt-0.5 h-4 w-4 ${secondaryText}`} />
                      <div className="min-w-0">
                        <p className={`text-[11px] font-semibold uppercase tracking-wide ${secondaryText}`}>Status</p>
                        <p className={`mt-1 text-sm font-medium ${isDark ? 'text-[#f4f1ea]' : 'text-[#1c2333]'}`}>
                          {result.status}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};