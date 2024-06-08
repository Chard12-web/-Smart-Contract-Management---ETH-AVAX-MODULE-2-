import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [points, setPoints] = useState(undefined);
  const [transactionHistory, setTransactionHistory] = useState([]);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  useEffect(() => {
    const initWallet = async () => {
      if (window.ethereum) {
        setEthWallet(window.ethereum);
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          initializeContract();
        }
      }
    };
    initWallet();
  }, []);

  useEffect(() => {
    if (atm) {
      fetchPoints();
    }
  }, [atm]);

  const initializeContract = () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, atmABI, signer);
    setATM(contract);
  };

  const fetchPoints = async () => {
    if (atm) {
      const balance = await atm.getBalance();
      setPoints(balance.toNumber());
    }
  };

  const handleTransaction = async (type, amount) => {
    if (atm) {
      try {
        const tx = type === "add" ? await atm.add(amount) : await atm.redeem(amount);
        await tx.wait();
        fetchPoints();
        logTransaction(type, amount);
      } catch (error) {
        console.error("Transaction failed:", error);
      }
    }
  };

  const logTransaction = (type, amount) => {
    setTransactionHistory([...transactionHistory, { type, amount, timestamp: Date.now() }]);
  };

  const renderTransactionHistory = () => (
    <div className="history">
      <h3>YOUR TRANSACTION HISTORY</h3>
      <ul>
        {transactionHistory.map((txn, index) => (
          <li key={index} className={`transaction ${txn.type}`}>
            {txn.type === "add" ? "Added" : "Redeemed"} {txn.amount} Points - {new Date(txn.timestamp).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );

  const renderUI = () => {
    if (!ethWallet) {
      return <p>Hey Brother/Sister Install MetaMAsk First THANKS!</p>;
    }

    if (!account) {
      return <button style={{

        background: "skyblue",
        padding: "30px",
        paddingTop: "20px",
        paddingBottom: "20px",
        cursor: "pointer",
        fontSize: "15px",
        fontFamily: "monospace",
        fontStyle: "bold",
        borderStyle: "solid",
        borderRadius: "20px",
        borderColor: "white",
        color: "black",
      }}onClick={() => window.ethereum.request({ method: "eth_requestAccounts" }).then(accounts => setAccount(accounts[0])).then(initializeContract)}>Enter METAMASK</button>;
    }

    return (
      <div className="atm-interface">
        <p style={{
          marginTop: "-40px",
          fontFamily: "cursive",
          fontSize: "20px",
        }}>Your Account: {account}</p>
        <p style={{
          fontFamily: "cursive",
          fontSize: "20px",
        }}
        >Your Points: {points}</p>
        <div className="actions">
          <div style={{

            display: "flex",
            alignItems: "center",
            flexDirection: "space-between",

          }}>
        <div>
            <input style={{
              width: "200px",
              padding: "10px",
              backgroundColor: "white",
              borderStyle: "solid",
              color: "black",
            }} type="number" id="addAmount" placeholder="Points to Add" />
            <button style={{
              width: "150px",
              padding: "10px",
              color: "white",
              backgroundColor: "skyblue",
              borderStyle: "none",
              borderTopRightRadius: "30px",
              borderBottomRightRadius: "30px",
              cursor: "pointer",
            }}
            onClick={() => handleTransaction("add", document.getElementById("addAmount").value)}>Add Points</button>
          </div>
          <div>
            <input  style={{
              width: "200px",
              padding: "10px",
              backgroundColor: "white",
              borderStyle: "solid",
              color: "black",
            }} type="number" id="redeemAmount" placeholder="Points to Redeem" />
            <button style={{
              width: "150px",
              padding: "10px",
              color: "white",
              backgroundColor: "skyblue",
              borderStyle: "none",
              borderTopRightRadius: "30px",
              borderBottomRightRadius: "30px",
              cursor: "pointer",
            }} onClick={() => handleTransaction("redeem", document.getElementById("redeemAmount").value)}>Redeem Points</button>
          </div>
        </div>
      </div>
          
        {renderTransactionHistory()}
      </div>
    );
  };
          
  return (
    <main className="container">
      <header>
        <h1>RICHARD PELARIOS <span><br></br>SYSTEM <br></br><br></br> <button style={{
          background: "black",
          padding: "30px",
          border: "none",
          color: "skyblue",
          marginTop: "-30px",
          borderRadius: "20px", 
          cursor: "pointer",
          width: "140px",
        }} onClick={() => handleTransaction("logout", document.getElementById("Logout").value)}>logout</button> </span></h1>
      </header>
      {renderUI()}
      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: black;
          color: skyblue;
          font-family: 'Arial', sans-serif;
          padding: 20px;
        }
        header {
          margin-bottom: 30px;
          text-align: center;
        }
        .atm-interface {
          background: #ffffff;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .actions {
          margin-top: 20px;
        }
        .actions div {
          margin-bottom: 10px;
        }

        h1 {
          background-color: skyblue;
          color: black;
          font-family: monospace;
          font-size: 50px;
          padding: 150px;
          border-radius: 250px;
        }
        

      `}</style>
    </main>
  );
}
