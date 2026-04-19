import { useCallback, useState } from 'react';

interface UseGoogleAuthReturn {
  openGoogleSignIn: () => void;
  closeGoogleSignIn: () => void;
  isGoogleSignInVisible: boolean;
  isLoading: boolean;
}

export function useGoogleAuth(): UseGoogleAuthReturn {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const openGoogleSignIn = useCallback(() => {
    setIsVisible(true);
    setIsLoading(true);
  }, []);

  const closeGoogleSignIn = useCallback(() => {
    setIsVisible(false);
    setIsLoading(false);
  }, []);

  return {
    openGoogleSignIn,
    closeGoogleSignIn,
    isGoogleSignInVisible: isVisible,
    isLoading,
  };
}

export default useGoogleAuth;
