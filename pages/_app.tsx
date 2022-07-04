import type { AppProps } from "next/app";
import "../styles/globals.css";
import { useEffect } from "react";
import { Reset } from "styled-reset";

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hostname.indexOf("yerinko.id") < 0) return;
  }, []);

  return (
    <>
      <Reset />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
