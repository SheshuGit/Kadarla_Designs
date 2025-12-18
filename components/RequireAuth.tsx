import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getUser } from '../utils/api';

type RequireAuthProps = {
  children: React.ReactNode;
};

const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const location = useLocation();
  const user = getUser();

  if (!user) {
    const redirect = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirect)}`} replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;


