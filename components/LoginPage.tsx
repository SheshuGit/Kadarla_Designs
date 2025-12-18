import React, { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LoginModal from './LoginModal';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);

  const redirectTo = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const redirect = params.get('redirect');
    return redirect && redirect.startsWith('/') ? redirect : '/';
  }, [location.search]);

  const handleClose = useCallback(() => {
    setOpen(false);
    navigate('/', { replace: true });
  }, [navigate]);

  const handleLoginSuccess = useCallback(() => {
    setOpen(false);
    navigate(redirectTo, { replace: true });
  }, [navigate, redirectTo]);

  return (
    <div className="min-h-screen bg-mint-50 selection:bg-pink-200 selection:text-pink-900 font-sans">
      <LoginModal isOpen={open} onClose={handleClose} onLoginSuccess={handleLoginSuccess} />
    </div>
  );
};

export default LoginPage;


