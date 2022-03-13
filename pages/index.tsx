import Head from "next/head";

import Header from "../components/Header";
import Hero from "../components/Hero";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Products from "../components/Products";
import MusicPlayer from "../components/MusicPlayer";
import Minter from "../components/Minter";

const Home = () => {
  return (
    <>
      <Head>
        <title>My NFTs</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <Products storeId="dogfood20.mintspace2.testnet" />
      <Footer />
    </>
  );
};

export default Home;
