import { useState, useEffect } from "react";
import { QrReader } from "react-qr-reader";

const Kiosk = () => {
  const [verificationStatus, setVerificationStatus] = useState(0);
  const [verified, setVerified] = useState(false);
  const [locationOrigin, setLocationOrigin] = useState("");

  useEffect(() => {
    function getLocationOrigin() {
      const { protocol, hostname, port } = window.location;
      return `${protocol}//${hostname}${port ? ":" + port : ""}`;
    }
    setLocationOrigin(getLocationOrigin());
  }, []);

  const contractName = "mintspace2.testnet";

  const handleScan = async (data: any) => {
    if (data) {
      const dataBlob = data.text.split("|");
      const signature = dataBlob[0].replace(/ /g, "+");
      const accountId = dataBlob[1];
      const blockNumber = dataBlob[2];
      const tokenId = dataBlob[3];
      const origin = locationOrigin;

      setVerificationStatus(0);
      setResetTimeout();

      try {
        const result = await fetch(`${origin}/api/validate`, {
          method: "POST",
          body: JSON.stringify({
            accountId,
            tokenId,
            signature,
            contractName,
            blockNumber,
          }),
          headers: { "Content-Type": "application/json" },
        });

        setVerified(true);

        const json = await result.json();
        if (json.validated) {
          setResetTimeout();
          setVerificationStatus(1);
          return;
        }
        setResetTimeout();
        setVerificationStatus(2);
      } catch (err) {
        console.log("this is the error from get:", err);
        setResetTimeout();
        setVerificationStatus(-1);
      }
    }
  };

  const setResetTimeout = () => {
    setTimeout(() => reset(), 4000);
  };

  const reset = () => {
    setVerified(false);
    setVerificationStatus(0);
  };

  const renderVerificationIndicator = () => {
    if (verificationStatus === 0) {
      return <div className="font-[Kanit] text-center text-3xl">Ready...</div>;
    }
    if (verificationStatus === 1) {
      return (
        <div className="flex flex-col items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-48 h-48"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
            />
          </svg>
          <p className="font-[Kanit] text-2xl">Verification Successful</p>
        </div>
      );
    }
    if (verificationStatus === 2) {
      return (
        <div className="flex flex-col items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-48 h-48"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
          <p className="font-[Kanit] text-2xl">Verification Failed</p>
        </div>
      );
    }
    if (verificationStatus === -1) {
      return (
        <div className="flex flex-col items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-48 h-48"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
          <p className="font-[Kanit] text-2xl">Verification Failed</p>
        </div>
      );
    }
  };

  return (
    <div
      className={`h-screen bg-repeat ${
        verified
          ? verificationStatus === 1
            ? "bg-green-600"
            : "bg-red-600"
          : "bg-violet-600"
      } `}
      style={{ backgroundImage: "url('/mintbase_logo.png')" }}
    >
      <header>
        <h1 className="w-full py-8 text-5xl font-bold text-center text-white font-[Kanit]">
          NFT Ticket Kiosk
        </h1>
      </header>
      <main>
        <div className="">
          {!verified ? (
            <div className="w-1/2 mx-auto">
              <div className="rounded-2xl">
                <QrReader
                  onResult={(result, error) => {
                    if (result) {
                      handleScan(result);
                    }
                    if (error) {
                      console.log(error);
                    }
                  }}
                  containerStyle={{
                    backgroundColor: "white",
                    paddingLeft: "35px",
                    paddingRight: "35px",
                    borderWidth: "2px",
                    borderRadius: "25px",
                  }}
                  // style={{ width: "100%" }}
                />
              </div>
            </div>
          ) : null}
          <div className="w-full py-10 text-white">
            {renderVerificationIndicator()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Kiosk;
