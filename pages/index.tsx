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
          content="https://drive.google.com/uc?id=1kf4TQN50LQyEybKT844g6CLq7nXeG6cl"
        />
      </Head>
      <Home />
    </>
  );
};

export default Index;
