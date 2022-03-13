import { useQuery } from "@apollo/client";
import { gql } from "apollo-boost";
import { useEffect, useState, useContext } from "react";
import Ticket from "../components/Ticket";
import { WalletContext } from "../services/providers/MintbaseWalletContext";

const FETCH_STORE = gql`
  query FetchStore(
    $storeId: String!
    $ownerId: String!
    $limit: Int = 20
    $offset: Int = 0
  ) {
    store(where: { id: { _eq: $storeId } }) {
      id
      name
      symbol
      baseUri
      owner
      minters {
        account
        enabled
      }

      tokens(
        order_by: { thingId: asc }
        where: {
          storeId: { _eq: $storeId }
          burnedAt: { _is_null: true }
          ownerId: { _eq: $ownerId }
        }
        limit: $limit
        offset: $offset
        distinct_on: thingId
      ) {
        id
        thingId
        thing {
          id
          metaId
          memo
          tokens {
            minter
          }
          metadata {
            title
            media
            extra
          }
        }
      }
    }
  }
`;

const NFT = ({
  tokenId,
  media,
  title,
}: {
  tokenId: string;
  media: string;
  title: string;
}) => {
  return (
    <div className="flex flex-col items-center">
      <div className="">
        <a href={`${media}`}>
          <img className="object-scale-down" alt={title} src={media} />
        </a>
      </div>
      <Ticket tokenId={tokenId} />
    </div>
  );
};

type Store = {
  id: string;
  name: string;
  symbol: string;
  baseUri: string;
  owner: string;
  minters: {
    account: string;
    enabled: string;
  }[];
};

type TokenThing = {
  tokenId: string;
  thing: {
    metadata: {
      title: string;
      media: string;
    };
    memo: string;
    metaId: string;
  };
};

const Products = ({ storeId }: { storeId: string }) => {
  const [store, setStore] = useState<Store | null>(null);
  const [things, setThings] = useState<TokenThing[] | []>([]);
  const { wallet, isConnected } = useContext(WalletContext);

  const { data, loading } = useQuery(FETCH_STORE, {
    variables: {
      storeId: storeId,
      ownerId: wallet?.activeAccount?.accountId,
      limit: 10,
      offset: 0,
    },
  });

  useEffect(() => {
    if (!data) return;
    if (data?.store.length === 0) return;

    setStore({
      ...data.store[0],
    });

    const things = data.store[0].tokens.map((token: any) => ({
      thing: token.thing,
      tokenId: token.id,
    }));

    setThings(things);
  }, [data]);

  return (
    <div className="w-full px-6 bg-gray-100 border-t">
      {!loading && (
        <>
          <h1 className="px-6 py-4 text-xl text-center text-gray-600 uppercase bold md:text-4xl">
            My NFT Collection
          </h1>

          {isConnected ? (
            <ul
              role="list"
              className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8"
            >
              {things.map((tokenThing: TokenThing, index: number) => (
                <li key={index} className="relative">
                  <div className="relative block w-full overflow-hidden bg-gray-100 rounded-lg group aspect-w-10 aspect-h-7 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-indigo-500">
                    <img
                      src={tokenThing.thing.metadata?.media}
                      alt="tokenThing.thing.metadata.title"
                      className="object-cover pointer-events-none group-hover:opacity-75"
                    />
                    <div className="absolute inset-0 p-2 text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-0">
                    <p className="block mt-2 text-sm font-light text-gray-900 truncate pointer-events-none">
                      {tokenThing.thing.metadata?.extra?.artist.value
                        ? tokenThing.thing.metadata?.extra?.artist.value
                        : "..."}
                    </p>
                    <p className="block mt-2 text-sm font-medium text-gray-900 truncate pointer-events-none">
                      {tokenThing.thing.metadata?.extra?.event_title?.value
                        ? tokenThing.thing.metadata?.extra?.event_title?.value
                        : "..."}
                    </p>
                  </div>
                  <Ticket tokenId={tokenThing.tokenId} />
                </li>
              ))}
            </ul>
          ) : (
            <p>Connect to NEAR</p>
          )}
        </>
      )}
    </div>
  );
};

export default Products;
