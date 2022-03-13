import { useForm } from "react-hook-form";

import { MetadataField } from "mintbase";

import { gql } from "apollo-boost";
import { useLazyQuery } from "@apollo/client";

import { useState, useEffect } from "react";

import { useWallet } from "../services/providers/MintbaseWalletContext";

const FETCH_MINTER_STORE = gql`
  query FetchMinterStores($minter: String!) {
    store(where: { minters: { account: { _eq: $minter } } }) {
      id
    }
  }
`;

const Minter = () => {
  const { wallet, isConnected, details } = useWallet();
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [isMinting, setIsMinting] = useState<boolean>(false);

  const [fetchStores, { called, loading, data }] = useLazyQuery(
    FETCH_MINTER_STORE,
    { variables: { minter: details.accountId } }
  );

  useEffect(() => {
    if (!isConnected) return;

    fetchStores();
  }, [isConnected]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleCoverImage = (e: any) => {
    const file = e.target.files[0];

    setCoverImage(file);
  };

  const onSubmit = async (data: any) => {
    if (!wallet || !wallet.minter) return;
    if (!coverImage) return;

    setIsMinting(true);

    const { data: fileUploadResult, error: fileError } =
      await wallet.minter.uploadField(MetadataField.Media, coverImage);

    if (fileError) {
      console.error(fileError);
      return;
    }

    wallet.minter.setMetadata({
      title: data.title,
      description: data.description,
    });

    setIsMinting(false);

    wallet.mint(1, data.store, undefined, undefined, undefined);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="w-full">
      <form
        className="px-8 pt-6 pb-8 mb-4 bg-white rounded"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="mb-4">
          <h1 className="mb-2 text-xl font-semibold leading-tight sm:leading-normal">
            Simple Minter
          </h1>
        </div>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-bold text-gray-700">
            Contract
          </label>

          <select
            {...register("store", { required: true })}
            className="text-sm"
          >
            {data?.store.map((store: { id: string }) => (
              <option key={store.id} value={store.id}>
                {store.id}
              </option>
            ))}
          </select>

          {errors.store && (
            <p className="text-xs italic text-red-500">
              Please select a store.
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-sm font-bold text-gray-700">
            Title
          </label>
          <input
            {...register("title", { required: true })}
            className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
            placeholder="Title"
          />
          {errors.title && (
            <p className="text-xs italic text-red-500">Please add title.</p>
          )}
        </div>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-bold text-gray-700">
            Description
          </label>
          <input
            {...register("description", { required: true })}
            className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
            placeholder="Description"
          />
          {errors.description && (
            <p className="text-xs italic text-red-500">
              Please add a description.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 mb-4">
          <label className="block mb-2 text-sm font-bold text-gray-700">
            Attach Cover Image
          </label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col w-full p-10 text-center border-4 border-dashed rounded-lg h-60 group">
              <div className="flex flex-col items-center justify-center w-full h-full text-center">
                {!coverImage && (
                  <p className="text-gray-500 pointer-none ">Select a file</p>
                )}
                {coverImage && (
                  <p className="text-gray-500 pointer-none">
                    {coverImage.name}
                  </p>
                )}
              </div>
              <input
                {...register("coverImage", { required: true })}
                type="file"
                className="hidden"
                onChange={handleCoverImage}
              />
            </label>
          </div>
          {errors.coverImage && (
            <p className="text-xs italic text-red-500">
              Please add a cover image.
            </p>
          )}
        </div>

        {isMinting ? (
          <div className="w-full px-4 py-2 mb-2 font-bold text-center text-black bg-gray-200 rounded">
            Creating your mint transaction...
          </div>
        ) : (
          <div className="flex flex-row-reverse items-center justify-between">
            <input
              className="w-full px-4 py-2 font-bold text-white bg-black rounded hover:bg-gray-700 focus:outline-none focus:shadow-outline"
              type="submit"
              value="Mint"
            />
          </div>
        )}
      </form>
    </div>
  );
};

export default Minter;
