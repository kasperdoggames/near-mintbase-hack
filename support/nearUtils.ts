export const getBlockNumber = async (wallet: any) => {
  const block = await wallet.activeAccount.connection.provider.block({
    finality: "final",
  });
  const blockNumber = block.header.height.toString();
  return blockNumber;
};
