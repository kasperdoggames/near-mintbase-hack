### Mintbase - NEAR - Crypto Tickets

Using NEAR signing, Near blockheight and NFT ownership through Mintbase to perform blockchain based tickets through the ownership of a NFT hosted on Mintbase.

Build from the `create-mintbase-app` boilerplate.

## How it works

It uses a number of criteria to validate an NFT as a ticket.

1. The ability to sign a message (blockheight) with a NEAR access key and validate that at the kiosk end to prove the request came from a specific Near Wallet.
2. The Near Blockheight is used to provide an expiry time by comparing the signed blockheight with the blockheight at the time of verification by the Kiosk. As the block creation time is known and fairly consistent a rough time period before expiration (30s) is defined.
3. Checking the NFT tokenId owner and ensuring it is owned by the same account as that which signed the blockheight in (1).

## Technologies

- Mintbase
- Next-js
- Tailwindcss
- Near blockchain/wallet
