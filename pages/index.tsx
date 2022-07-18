import React from "react";
import Home from "@/components/home";
import Head from "next/head";

const Index = () => {
  return (
    <>
      <Head>
        <title>이창호 ♡ 고예린</title>
        <meta
          name="description"
          content="이창호 ♡ 고예린 9월 24일에 결혼합니다."
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="이창호 ♡ 고예린 청첩장" />
        <meta property="og:description" content="9월 24일에 결혼합니다." />
        <meta
          property="og:image"
          content="http://drive.google.com/uc?export=view&id=1anEs_hzWw-0pWD9_xwvTHfM7kW_2__d4"
        />
      </Head>
      <Home />
    </>
  );
};

export default Index;
