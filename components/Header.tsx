import Link from "next/link";
import { useWallet } from "../services/providers/MintbaseWalletContext";

const Header = () => {
  const { wallet, isConnected, details } = useWallet();
  return (
    <header className="w-full px-6 bg-white">
      <div className="container items-center justify-between mx-auto max-w-8xl md:flex">
        <Link href="/" passHref>
          <a className="flex items-center justify-center w-full py-6 text-center text-gray-600 no-underline md:text-left md:w-auto">
            My NFTs
          </a>
        </Link>

        <div className="w-full mb-6 text-center md:w-auto md:mb-0 md:text-right">
          <div className="flex flex-row items-center space-x-2">
            {isConnected && (
              <p className="px-3 py-2 text-sm">
                Hi, {wallet?.activeAccount?.accountId}
              </p>
            )}
            <button
              className="inline-block px-3 py-2 text-sm text-white no-underline bg-black"
              onClick={
                isConnected
                  ? () => {
                      wallet?.disconnect();
                      window.location.reload();
                    }
                  : () => {
                      wallet?.connect({ requestSignIn: true });
                    }
              }
            >
              {isConnected ? "Disconnect" : "Connect"}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
