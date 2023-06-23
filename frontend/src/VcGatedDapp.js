import { useState, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { createPublicClient, http } from "viem";
import { polygonZkEvmTestnet } from "viem/chains";
import {
  Box,
  Container,
  Flex,
  Heading,
  Button,
  Spinner,
  Card,
  Center,
  VStack,
} from "@chakra-ui/react";
import {
  getAccount,
  readContract,
  writeContract,
  waitForTransaction,
} from "@wagmi/core";
import demoAbi from "./demoSmartContract/demoAbi.json";

function VcGatedDapp() {
  const chain = polygonZkEvmTestnet;
  const chainId = polygonZkEvmTestnet.id;

  const [publicClient, setPublicClient] = useState();
  const [connectedAddress, setConnectedAddress] = useState();
  const [addressIsConnected, setAddressIsConnected] = useState(false);
  const [currentBlockNumber, setCurrentBlockNumber] = useState();
  const [showConnectionInfo, setShowConnectionInfo] = useState(false);

  // variables specific to demo
  const myZkEVMSmartContractAddress =
    "0x3Baf2aa2aD287949590cD39a731fD17606c7D10F";

  const contractConfig = {
    address: myZkEVMSmartContractAddress,
    abi: demoAbi,
    chainId,
  };

  const [count, setCount] = useState();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // A Public Client is an interface to "public" JSON-RPC API methods
    // such as retrieving block numbers, transactions, reading from smart contracts, etc
    const newPublicClient = createPublicClient({
      chain,
      transport: http(),
    });
    setPublicClient(newPublicClient);

    // interval check whether user has connected or disconnected wallet
    const interval = setInterval(() => {
      const { address, isConnected } = getAccount();
      setConnectedAddress(address);
      setAddressIsConnected(isConnected);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (publicClient) {
      const readCount = async () => {
        await readCounterValue();
      };
      const checkCurrentBlockNumber = async () => {
        const blockNumber = await publicClient.getBlockNumber();
        setCurrentBlockNumber(blockNumber);
      };

      readCount();
      checkCurrentBlockNumber();
    }
  }, [publicClient]);

  async function readCounterValue() {
    try {
      const data = await readContract({
        ...contractConfig,
        functionName: "retrieve",
        chainId,
      });
      const newCount = JSON.parse(data);
      setCount(newCount);
      return newCount;
    } catch (err) {
      console.log("Error: ", err);
    }
  }

  const incrementCounter = async () => {
    if (addressIsConnected) {
      const { hash } = await writeContract({
        ...contractConfig,
        functionName: "increment",
        // args: [69],
      });
      setIsLoading(true);
      const data = await waitForTransaction({
        hash,
      });
      await readCounterValue();
      setIsLoading(false);
    } else {
      alert("Connect wallet to update blockchain data");
    }
  };

  return (
    <div id="vc-gated-dapp">
      <Box background="black" color="white" py={4}>
        <Container maxW={"80%"}>
          <Flex justifyContent="space-between">
            <Heading>My VC Gated Dapp</Heading>
            <ConnectButton showBalance={false} />
          </Flex>
        </Container>
      </Box>

      <Box>
        <Container maxW={"80%"} py={4}>
          <Button onClick={() => setShowConnectionInfo(!showConnectionInfo)}>
            {showConnectionInfo ? "Hide" : "Show"} connection information
          </Button>
          {showConnectionInfo && (
            <Box py={4}>
              {addressIsConnected ? (
                <p>Address {connectedAddress} is connected to this dapp</p>
              ) : (
                <p>
                  No account connected. Connect wallet to interact with dapp
                </p>
              )}

              {publicClient ? (
                <ul>
                  <li>
                    Currently using a{" "}
                    <a
                      href="https://viem.sh/docs/clients/public.html"
                      target="_blank"
                    >
                      public client
                    </a>{" "}
                    with Chain: {publicClient?.chain?.name} and Chain ID:{" "}
                    {publicClient?.chain?.id}
                  </li>

                  <li>
                    The current block number is {currentBlockNumber?.toString()}
                  </li>
                </ul>
              ) : (
                <>
                  Please install{" "}
                  <a href="https://metamask.io/" target="_blank">
                    Metamask
                  </a>
                </>
              )}
            </Box>
          )}
          <div>
            <Card my={4} p={4}>
              <Center>
                <VStack>
                  <Heading>Counter Dapp</Heading>

                  <p>The current count is</p>
                  <Heading>{isLoading ? <Spinner></Spinner> : count}</Heading>
                  <Button onClick={() => incrementCounter()}>
                    Increment counter
                  </Button>
                </VStack>
              </Center>
            </Card>
            <ul>
              <li>
                Check out the Counter{" "}
                <a
                  href={`https://testnet-zkevm.polygonscan.com/address/${myZkEVMSmartContractAddress}`}
                  target="_blank"
                >
                  contract on Polygonscan
                </a>{" "}
                and the{" "}
                <a
                  href="https://github.com/oceans404/fullstack-zkevm/blob/complete/contracts/Counter.sol"
                  target="_blank"
                >
                  {" "}
                  contract code on Github
                </a>
              </li>
              <li>
                You need Polygon zkEVM Testnet ETH to update the counter value.{" "}
                <a
                  href="https://www.youtube.com/watch?v=eYZAPkTCgwg"
                  target="_blank"
                >
                  Here's how to Get Polygon zkEVM Testnet ETH
                </a>{" "}
                Use the{" "}
                <a
                  href="https://wallet.polygon.technology/?redirectOnConnect=%2FzkEVM-Bridge%2Fbridge"
                  target="_blank"
                >
                  Native Bridge
                </a>{" "}
                to bridge Ethereum Goerli ETH to Polygon zkEVM testnet ETH
              </li>
            </ul>
          </div>
        </Container>
      </Box>
    </div>
  );
}

export default VcGatedDapp;
