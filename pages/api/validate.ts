// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import * as nearAPI from "near-api-js";
import * as bs58 from "bs58";
import * as nacl from "tweetnacl";
import * as crypto from "crypto";
import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import {
  GRAPH_MAINNET_HTTPS_URI,
  GRAPH_TESTNET_HTTPS_URI,
} from "../../constants/mintbase";

type Data = {
  isValid: boolean;
};

const VALID_BLOCK_AGE = 30; // 30s /1.3s (current avg blocktime)

const {
  keyStores: { InMemoryKeyStore },
  Near,
} = nearAPI;

const FETCH_STORE = gql`
  query FetchToken($tokenId: String!) {
    token(where: { id: { _eq: $tokenId } }) {
      ownerId
    }
  }
`;

const client = new ApolloClient({
  uri: GRAPH_TESTNET_HTTPS_URI,
  cache: new InMemoryCache(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { accountId, tokenId, signature, contractName, blockNumber } = req.body;
  console.log({ accountId, tokenId, signature, contractName, blockNumber });
  const config = {
    networkId: "testnet",
    nodeUrl: "https://rpc.testnet.near.org",
  };

  const getNearAccount = async (accountId: string) => {
    const keyStore = new InMemoryKeyStore();
    const { networkId, nodeUrl } = config;

    const near = new Near({
      networkId,
      nodeUrl,
      deps: { keyStore },
    });

    const nearAccount = await near.account(accountId);
    return nearAccount;
  };

  const validBlock = async (account: any, blockNumber: string) => {
    const currentBlock = (await account.connection.provider.status()).sync_info
      .latest_block_height;
    const givenBlock = Number(blockNumber);
    console.log(
      `comparing current block ${currentBlock} with given block ${givenBlock} with difference ${
        currentBlock - givenBlock
      }`
    );
    if (
      givenBlock <= currentBlock - VALID_BLOCK_AGE ||
      givenBlock > currentBlock
    ) {
      return false;
    }
    return true;
  };

  const verifySignature = async (
    account: any,
    message: string,
    signature: string,
    contractName: string = ""
  ) => {
    try {
      const hash = crypto.createHash("sha256").update(message).digest();
      let accessKeys = await account.getAccessKeys();
      if (contractName.length) {
        accessKeys = accessKeys.filter(
          ({ access_key: { permission } }) =>
            permission &&
            permission.FunctionCall &&
            permission.FunctionCall.receiver_id === contractName
        );
      } else {
        accessKeys = accessKeys.filter(
          ({ access_key: { permission } }) => permission === "FullAccess"
        );
      }
      return accessKeys.some(({ public_key }) => {
        const publicKey = public_key.replace("ed25519:", "");
        const verified = nacl.sign.detached.verify(
          hash,
          Buffer.from(signature, "base64"),
          bs58.decode(publicKey)
        );
        return verified;
      });
    } catch (err) {
      console.log(err);
      throw err;
    }
  };

  const validNFTOwner = async (accountId: string, tokenId: string) => {
    const storeResults = await client.query({
      query: FETCH_STORE,
      variables: {
        tokenId: tokenId,
        limit: 10,
        offset: 0,
      },
    });

    if (
      storeResults.data.token.length > 0 &&
      storeResults.data.token[0].ownerId === accountId
    ) {
      return true;
    }

    return false;
  };

  try {
    const account = await getNearAccount(accountId);

    const isValidBlock = await validBlock(account, blockNumber);
    if (!isValidBlock) {
      console.log("Issue validating blocknumber");
      return res.status(403).json({ validated: false });
    }
    console.log("Validated blocknumber!");

    const isValidSignature = await verifySignature(
      account,
      blockNumber,
      signature,
      contractName
    );
    if (!isValidSignature) {
      console.log("Issue validating signature");
      return res.status(403).json({ validated: false });
    }
    console.log("Validated signature!");

    const isValidNFTOwner = await validNFTOwner(accountId, tokenId);
    if (!isValidNFTOwner) {
      console.log("Issue validating NFT owner");
      return res.status(403).json({ validated: false });
    }
    console.log("Validated NFT owner!");

    return res.status(200).json({ validated: true });
    // }
  } catch (err) {
    console.log("Issue verifying customer", err);
    return res.status(500).json({ validated: false });
  }
}
