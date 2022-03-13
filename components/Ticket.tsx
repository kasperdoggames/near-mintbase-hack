import * as jsSHA256 from "js-sha256";
import { useWallet } from "../services/providers/MintbaseWalletContext";
import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XIcon } from "@heroicons/react/outline";
import { getBlockNumber } from "../support/nearUtils";

const Ticket = ({ tokenId }: { tokenId: string }) => {
  const [open, setOpen] = useState(false);
  const [fullPath, setFullPath] = useState("");
  const [counter, setCounter] = useState(30);
  const [locationOrigin, setLocationOrigin] = useState("");
  const { wallet } = useWallet();

  const accountId = "dogfood20.testnet";

  useEffect(() => {
    function getLocationOrigin() {
      const { protocol, hostname, port } = window.location;
      return `${protocol}//${hostname}${port ? ":" + port : ""}`;
    }
    setLocationOrigin(getLocationOrigin());
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timer | undefined;
    if (counter > 0) {
      timer = setInterval(() => setCounter(counter - 1), 1000);
    } else {
      generateQRCode();
    }
    return () => timer && clearInterval(timer);
  }, [counter]);

  const getSignature = async (message: string, wallet: any) => {
    const hash = new Uint8Array(jsSHA256.sha256.array(message));
    const keyPair = await wallet?.keyStore?.getKey(
      "testnet",
      wallet.activeAccount.accountId
    );

    const signed = keyPair.sign(hash);
    const signature = Buffer.from(signed.signature).toString("base64");
    return signature;
  };

  const generateQRCode = async () => {
    const blockNumber = await getBlockNumber(wallet);
    const signature = await getSignature(blockNumber, wallet);

    setCounter(30);

    const googleQRPath =
      "https://chart.googleapis.com/chart?chs=334x334&cht=qr&chl=200x200&chld=M%7C0&cht=qr&chl=";
    const fullPath = `${googleQRPath}${signature}|${accountId}|${blockNumber}|${tokenId}`;
    console.log({ fullPath });
    setFullPath(fullPath);
  };

  const OnUseTicket = async (tokenId: string) => {
    generateQRCode();
    setOpen(true);
  };

  return (
    <>
      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={() => {
            setCounter(0);
            setOpen(false);
          }}
        >
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div className="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
                  <button
                    type="button"
                    className="text-gray-400 bg-white rounded-md hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => setOpen(false)}
                  >
                    <span className="sr-only">Close</span>
                    <XIcon className="w-6 h-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div className="qr-code">
                    <img src={fullPath} alt="this should be a QR code" />
                  </div>
                  <div className="text-2xl font-bold text-center">
                    <div>{counter}</div>
                  </div>
                  <button
                    className="w-full p-4 text-white bg-purple-600 rounded sm:hidden"
                    onClick={() => setOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
      <div className="flex w-full py-3 mb-4">
        <button
          className="p-2 text-white bg-purple-600 rounded"
          onClick={() => OnUseTicket(tokenId)}
        >
          Use NFT Ticket
        </button>
      </div>
    </>
  );
};

export default Ticket;
