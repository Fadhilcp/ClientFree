

import React, { useEffect, useState } from 'react';

interface OtpResendTimerProps {
  onResend: () => Promise<void>;
  initialSeconds?: number;      
  label?: string; 
  cooldownMessage?: (seconds: number) => string; 
  className?: string;
}

const OtpResendTimer: React.FC<OtpResendTimerProps> = ({
  onResend,
  initialSeconds = 60,
  label = 'Resend OTP',
  cooldownMessage = (s) => `You can resend OTP in ${s}s`,
  className = '',
}) => {

  const [seconds, setSeconds] = useState(initialSeconds);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (seconds === 0) return;
    const interval = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  
  const handleResend = async () => {
    setLoading(true);
    try {
      await onResend();
      setSeconds(initialSeconds);
    } catch (err) {
      console.error('Resend failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`text-center mt-4 ${className}`}>
      {seconds > 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {cooldownMessage(seconds)}
        </p>
      ) : (
        <button
          onClick={handleResend}
          disabled={loading}
          className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline"
        >
          {loading ? 'Resending...' : label}
        </button>
      )}
    </div>
  );
};

export default OtpResendTimer;