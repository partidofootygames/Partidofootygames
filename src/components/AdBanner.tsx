import React, { useEffect, useRef } from "react";

interface AdBannerProps {
  dataAdSlot: string;
  dataAdFormat?: "auto" | "fluid" | "rectangle";
  dataFullWidthResponsive?: boolean;
}

export default function AdBanner({ 
  dataAdSlot, 
  dataAdFormat = "auto", 
  dataFullWidthResponsive = true 
}: AdBannerProps) {
  const adRef = useRef<boolean>(false);
  
  useEffect(() => {
    try {
      if (!adRef.current) {
        // Dit zorgt ervoor dat Google de advertentie rendert zodra het component op het scherm komt
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        adRef.current = true;
      }
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, []);

  return (
    <div className="my-8 w-full overflow-hidden flex justify-center min-h-[100px]">
      {/* De werkelijke AdSense code */}
      <ins
        className="adsbygoogle w-full"
        style={{ display: "block", minWidth: "250px" }}
        data-ad-client="ca-pub-8468918555277859" // Jouw Pub-ID
        data-ad-slot={dataAdSlot}
        data-ad-format={dataAdFormat}
        data-full-width-responsive={dataFullWidthResponsive.toString()}
      ></ins>
    </div>
  );
}
