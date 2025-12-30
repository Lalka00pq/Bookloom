// Хук для проверки здоровья backend
import { useState, useEffect } from "react";
import { healthApi } from "../utils/api";

export function useHealthCheck(checkInterval: number = 30000) {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  const checkHealth = async () => {
    try {
      setIsChecking(true);
      await healthApi.check();
      setIsHealthy(true);
    } catch (error) {
      setIsHealthy(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, checkInterval);

    return () => clearInterval(interval);
  }, [checkInterval]);

  return {
    isHealthy,
    isChecking,
    checkHealth,
  };
}

