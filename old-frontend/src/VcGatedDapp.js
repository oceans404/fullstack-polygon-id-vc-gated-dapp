import { useState, useEffect } from "react";
import { ConnectButton, darkTheme } from "@rainbow-me/rainbowkit";
import { createPublicClient, http } from "viem";
import { polygonZkEvmTestnet } from "viem/chains";
import { Box, Container, Flex, Heading, Button } from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { getAccount, getContract } from "@wagmi/core";

function VcGatedDapp() {
  const [client, setClient] = useState();
  const [connectedAddress, setConnectedAddress] = useState();
  const [addressIsConnected, setAddressIsConnected] = useState(false);
  const [currentBlockNumber, setCurrentBlockNumber] = useState();
  // set this to false if not testing
  const [showConnectionInfo, setShowConnectionInfo] = useState(true);

  // variables specific to demo
  const myZkEVMSmartContractAddress =
    "0xF6C5DDd37F0203100030E79EEF6397D37767Be1E";
  const [count, setCount] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const contract = getContract({
    address: myZkEVMSmartContractAddress,
    abi: ensRegistryABI,
  });

  useEffect(() => {
    const publicClient = createPublicClient({
      chain: polygonZkEvmTestnet,
      transport: http(),
    });

    setClient(publicClient);

    // declare the data fetching function
    const fetchCount = async () => {
      // const data = await readCounterValue();
      // return data;
    };

    const checkCurrentBlockNumber = async () => {
      const blockNumber = await publicClient.getBlockNumber();
      setCurrentBlockNumber(blockNumber);
    };

    fetchCount().catch(console.error);
    checkCurrentBlockNumber();

    // interval check whether user has connected or disconnected wallet
    const interval = setInterval(() => {
      const { address, isConnected } = getAccount();
      setConnectedAddress(address);
      setAddressIsConnected(isConnected);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // async function readCounterValue() {
  //   if (typeof window.ethereum !== "undefined") {
  //     const provider = new ethers.providers.Web3Provider(window.ethereum);
  //     console.log("provider", provider);
  //     const contract = new ethers.Contract(
  //       counterAddress,
  //       Counter.abi,
  //       provider
  //     );
  //     console.log("contract", contract);
  //     try {
  //       const data = await contract.retrieve();
  //       console.log(data);
  //       console.log("data: ", parseInt(data.toString()));
  //       setCount(parseInt(data.toString()));
  //     } catch (err) {
  //       console.log("Error: ", err);
  //       alert(
  //         "Switch your MetaMask network to Polygon zkEVM testnet and refresh this page!"
  //       );
  //     }
  //   }
  // }

  // async function requestAccount() {
  //   await window.ethereum.request({ method: "eth_requestAccounts" });
  // }

  // async function updateCounter() {
  //   if (typeof window.ethereum !== "undefined") {
  //     await requestAccount();
  //     const provider = new ethers.providers.Web3Provider(window.ethereum);
  //     console.log({ provider });
  //     const signer = provider.getSigner();
  //     const contract = new ethers.Contract(counterAddress, Counter.abi, signer);
  //     const transaction = await contract.increment();
  //     setIsLoading(true);
  //     await transaction.wait();
  //     setIsLoading(false);
  //     readCounterValue();
  //   }
  // }

  // const incrementCounter = async () => {
  //   await updateCounter();
  // };
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
            <>
              {addressIsConnected ? (
                <p>Address {connectedAddress} is connected to this dapp</p>
              ) : (
                <p>No account connected. Connect wallet to continue</p>
              )}

              {client ? (
                <ul style={{ marginLeft: "20px" }}>
                  <li>
                    Currently using a{" "}
                    <a
                      href="https://viem.sh/docs/clients/public.html"
                      target="_blank"
                    >
                      public client
                    </a>{" "}
                    with Chain: {client?.chain?.name} and Chain ID:{" "}
                    {client?.chain?.id}
                  </li>
                  <li>
                    Instructions:{" "}
                    <a href="https://www.youtube.com/watch?v=eYZAPkTCgwg">
                      How to Get Polygon zkEVM Testnet ETH
                    </a>
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
            </>
          )}
        </Container>
      </Box>
    </div>
  );
}

export default VcGatedDapp;
