import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    const trackPageVisit = async () => {
      try {
        await supabase.from("page_visits").insert({
          page_path: location.pathname,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
          device_type: getDeviceType(),
        });
      } catch (error) {
        console.error("Error tracking page visit:", error);
      }
    };

    trackPageVisit();
  }, [location]);
};

const getDeviceType = (): string => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet";
  }
  if (
    /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
      ua
    )
  ) {
    return "mobile";
  }
  return "desktop";
};