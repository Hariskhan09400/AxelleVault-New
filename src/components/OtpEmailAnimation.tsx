import { useEffect, useRef, useState, ClipboardEvent, KeyboardEvent } from "react";

interface OtpEmailAnimationProps {
  email: string;
  length?: number;
  // true return karo agar OTP sahi hai, warna false
  onVerify: (code: string) => Promise<boolean> | boolean;
  // false return karo (ya throw) agar resend fail hua — tab timer reset nahi hoga
  onResend?: () => Promise<boolean | void> | boolean | void;
}

const RESEND_SECONDS = 30;

export default function OtpEmailAnimation({
  email,
  length = 6,
  onVerify,
  onResend,
}: OtpEmailAnimationProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(""));
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(RESEND_SECONDS);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const submittingRef = useRef(false); // double submit rokne ke liye

  // Resend countdown
  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  // Pehle box par auto focus
  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const triggerError = () => {
    setError(true);
    setTimeout(() => {
      setError(false);
      setValues(Array(length).fill(""));
      inputsRef.current[0]?.focus();
    }, 600);
  };

  const submit = async (code: string) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    try {
      const ok = await onVerify(code);
      if (ok) setSuccess(true);
      else triggerError();
    } catch {
      triggerError();
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  const handleChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...values];
    next[index] = digit;
    setValues(next);

    if (digit && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
    if (next.every((d) => d !== "")) {
      submit(next.join(""));
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !values[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) inputsRef.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < length - 1)
      inputsRef.current[index + 1]?.focus();
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    const next: string[] = Array(length).fill("");
    pasted.split("").forEach((ch, i) => {
      next[i] = ch;
    });
    setValues(next);
    inputsRef.current[Math.min(pasted.length, length - 1)]?.focus();
    if (pasted.length === length) submit(pasted);
  };

  const handleResend = async () => {
    if (timer > 0) return;
    try {
      const result = await onResend?.();
      if (result === false) return; // resend fail hua, timer wahi rehne do
    } catch {
      return;
    }
    setTimer(RESEND_SECONDS);
    setValues(Array(length).fill(""));
    inputsRef.current[0]?.focus();
  };

  return (
    <div className="w-full mx-auto text-center">
      <style>{`
        @keyframes otp-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes otp-pulse-ring {
          0% { transform: scale(0.9); opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes otp-pop {
          0% { transform: scale(0.7); }
          60% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        @keyframes otp-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        @keyframes otp-fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes otp-check {
          from { stroke-dashoffset: 40; }
          to { stroke-dashoffset: 0; }
        }
        .otp-float { animation: otp-float 3s ease-in-out infinite; }
        .otp-ring { animation: otp-pulse-ring 2s ease-out infinite; }
        .otp-ring-delay { animation: otp-pulse-ring 2s ease-out 1s infinite; }
        .otp-pop { animation: otp-pop 0.25s ease-out; }
        .otp-shake { animation: otp-shake 0.5s ease-in-out; }
        .otp-fade-up { animation: otp-fade-up 0.5s ease-out both; }
        .otp-check { stroke-dasharray: 40; animation: otp-check 0.5s ease-out 0.1s both; }
      `}</style>

      {/* Mail icon with pulse rings */}
      <div className="otp-fade-up relative mx-auto mb-5 h-20 w-20">
        {!success && (
          <>
            <span className="otp-ring absolute inset-0 rounded-full bg-[#0b1f3d]/20" />
            <span className="otp-ring-delay absolute inset-0 rounded-full bg-[#0b1f3d]/10" />
          </>
        )}
        <div
          className={`otp-float relative flex h-20 w-20 items-center justify-center rounded-full shadow-lg transition-colors duration-300 ${
            success ? "bg-[#3f7d58]" : "bg-[#0b1f3d]"
          }`}
        >
          {success ? (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#f4f1ea" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path className="otp-check" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#f4f1ea" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M3 7l9 6 9-6" />
            </svg>
          )}
        </div>
      </div>

      <h3 className="otp-fade-up text-lg font-bold text-[#1c2333]" style={{ animationDelay: "0.1s" }}>
        {success ? "Verified!" : "Check your email"}
      </h3>
      <p className="otp-fade-up mt-1 text-sm text-[#8a8272]" style={{ animationDelay: "0.2s" }}>
        {success ? (
          "Email verified successfully."
        ) : (
          <>
            We sent a {length}-digit code to{" "}
            <span className="font-semibold text-[#1c2333] break-all">{email}</span>
          </>
        )}
      </p>

      {/* OTP boxes */}
      {!success && (
        <>
          <div className={`mt-6 flex justify-center gap-2 ${error ? "otp-shake" : ""}`}>
            {values.map((val, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputsRef.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                autoComplete={i === 0 ? "one-time-code" : "off"}
                maxLength={1}
                value={val}
                disabled={loading}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                onFocus={(e) => e.target.select()}
                aria-label={`Digit ${i + 1}`}
                className={`h-12 w-10 sm:w-11 rounded-2xl border bg-white text-center text-lg font-semibold outline-none transition-all duration-200
                  ${
                    error
                      ? "border-[#c0503e] text-[#c0503e]"
                      : val
                      ? "otp-pop border-[#0b1f3d] text-[#1c2333]"
                      : "border-[#e4ddc9] text-[#1c2333]"
                  }
                  focus:border-[#0b1f3d]/50 focus:shadow-[0_0_0_4px_rgba(11,31,61,0.10)] focus:scale-105
                  disabled:opacity-60`}
              />
            ))}
          </div>

          <div className="mt-4 flex h-5 items-center justify-center">
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#0b1f3d] border-t-transparent" />
            ) : (
              <p className="text-xs text-[#8a8272]">Paste or type the code — it verifies automatically.</p>
            )}
          </div>

          <div className="mt-3 text-xs text-[#8a8272]">
            {timer > 0 ? (
              <span>
                Resend code in <span className="font-semibold text-[#1c2333]">{timer}s</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="font-semibold text-[#0b1f3d] transition-colors hover:text-[#b7972f]"
              >
                Resend code
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}