import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as Web3 from '@solana/web3.js'
import { FC, useEffect, useState } from 'react'
import styles from '../styles/PingButton.module.css'
import base58 from 'bs58'; 
import { Program ,AnchorProvider, Idl} from '@project-serum/anchor';
import { useAnchorWallet } from "@solana/wallet-adapter-react";

import {
	WalletMultiButton,
	WalletDisconnectButton,
  } from "@solana/wallet-adapter-react-ui";
import nacl from 'tweetnacl';

// import 'dotenv/config'
import idl from '../idl/greeter_example.json'

// const PROGRAM_ID = new Web3.PublicKey("ChT1B39WKLS8qUrkLvFDXMhEJ4F1XZzwUNHUt4AU9aVa")

const PROGRAM_ID = new Web3.PublicKey(idl.metadata.address); 
const PRIVATE_KEY ='YOUR_PRIVATE_KEY';
// const PROGRAM_DATA_PUBLIC_KEY = new Web3.PublicKey("HpeaJ9KvqJiTizS9qVJ8G4CJn3gzBLNptL7CR1eTm9Sd")
// if (!PRIVATE_KEY) {
// 	console.log("error")
// 	throw new Error("PRIVATE_KEY environment variable is not set");
//   }
const privateKey =new Uint8Array(base58.decode(PRIVATE_KEY));

const account = Web3.Keypair.fromSecretKey(privateKey);
const account2 = Web3.Keypair.generate();//to sends funds

//const network = "http://127.0.0.1:8899"; // Adjust for your environment: local, devnet, or mainnet-beta

const opts = {preflightCommitment: "processed" as Web3.Commitment};

export const SendTx: FC = () => {
	const { connection } = useConnection();
	const { publicKey, sendTransaction,connected ,connecting} = useWallet();

	const wallet =  useAnchorWallet();
	console.log("connected",connected, connecting)
	useEffect(()=>{
		if(connected){
	
			console.log("wallet", (wallet.publicKey).toString());
		}

	},[connected])
	// let connection = new web3.Connection(web3.clusterApiUrl("devnet"), "confirmed");

	console.log(publicKey)
const [greetingAccountPublicKey, setGreetingAccountPublicKey] = useState<Web3.PublicKey | null>(null);
const [error , setError] = useState('');
const [textField, setTextField] = useState('');
const [greetingText, setGreetingText] = useState('');

	
const getProvider= ()=>{
	if(!wallet) return null;
	const connection =  new Web3.Connection(Web3.clusterApiUrl("devnet"),opts.preflightCommitment);
	return new AnchorProvider(connection, wallet,{preflightCommitment:opts.preflightCommitment})
}
	
// const {connection,sendAndConfirm,opts} = getProvider();

const setGreeting= async () =>{
	if(!connected){
		setError("Wallet is not connected");
		return;
	}
	const provider = getProvider();
	console.log('provider',provider);
	const program = new Program(idl as Idl,PROGRAM_ID,provider);
	try {
		const greetingAccount = Web3.Keypair.generate();
		console.log('greeting account pubkey',(greetingAccount.publicKey).toString)

		//creating and initialize greeting account
		// const lamports = await provider.connection.getMinimumBalanceForRentExemption(64);
		// const createAccountTx = new Web3.Transaction().add(
		// 	Web3.SystemProgram.createAccount({
		// 		fromPubkey: provider.wallet.publicKey,
		// 		newAccountPubkey: greetingAccount.publicKey,
		// 		space:64,
		// 		lamports,
		// 		programId:PROGRAM_ID
		// 	})
		// )
		// await provider.sendAndConfirm(createAccountTx,[greetingAccount]);
		await program.methods.initialize("hello") // Assuming 'initialize' is the method to create the account
                .accounts({
                    greetingAccount: greetingAccount.publicKey,
                    user: provider.wallet.publicKey,
                    systemProgram: Web3.SystemProgram.programId,
                })
                .signers([greetingAccount])
                .rpc();

		await program.methods.setGreeting(textField)
		.accounts({
		greetingAccount: greetingAccount.publicKey,
		user: provider.wallet.publicKey,
		// systemProgram: Web3.SystemProgram.programId
		}).rpc();

		const account0  = await program.account.greetingAccount.fetch(
			greetingAccount.publicKey
		)
		// console.log(account0.greeting)
		console.log("Fetch details: ", account0)
     console.log("Tx for set Greeting went success");
	 setGreetingAccountPublicKey(greetingAccount.publicKey);
	} catch (error) {
		console.error("Error creating greeting account:", error);
      setError("Failed to create greeting account. Please try again.");
	}
	

}

const getGreeting = async()=>{
	if(!connected){
		setError("Wallet is not connected")
		return;
	} 
	if(!greetingAccountPublicKey){
		setError("Greeting account not created or public key not set.");
		return;
	}
   const provider = getProvider();
   console.log("provider",provider);
   const program = new Program(idl as Idl,PROGRAM_ID,provider);
  
   await program.methods.getGreeting()
   .accounts({
	greetingAccount: new Web3.PublicKey(greetingAccountPublicKey)
   })
   const accountInfo  = await program.account.greetingAccount.fetch(
	new Web3.PublicKey(greetingAccountPublicKey)
)
let greeting;
if(accountInfo.greeting){
	greeting = accountInfo.greeting;

}
else {
	throw new Error("Greeting not found in the account data.");
}
setGreetingText(greeting)	

console.log("Fetch details: ", greeting)
//    setGreetingText(account);
   console.log("Greeting recieved");
   
}
const handleGreetingChange =(e)=>{
	setTextField(e.target.value);
}
	const onClick = async () => {
		if (!connection || !publicKey) { 
			alert("Please connect your wallet first lol")
			return
		}
		const {lastValidBlockHeight, blockhash} = await connection.getLatestBlockhash();

		const manualTransaction = new Web3.Transaction().add(
			Web3.SystemProgram.transfer({
				fromPubkey: account.publicKey,
				toPubkey:account2.publicKey,
				lamports: Web3.LAMPORTS_PER_SOL *0.001,

			})
		)
		console.log("manual Tx",manualTransaction)
		let transactionBuffer = manualTransaction.serializeMessage();
		let signature = nacl.sign.detached(transactionBuffer, account.secretKey);

manualTransaction.addSignature(account.publicKey, Buffer.from(signature));

let isVerifiedSignature = manualTransaction.verifySignatures();
console.log(`The signatures were verified: ${isVerifiedSignature}`);

// let rawTransaction = manualTransaction.serialize();


	let tx =	await Web3.sendAndConfirmTransaction(
			connection,
			manualTransaction,
			[account]
		).then(sig =>{
			console.log(`Explorer URL: https://explorer.solana.com/tx/${sig}?cluster=devnet`)
			console.log("tx signature", sig);
		})

// 		const instruction = new Web3.TransactionInstruction({
// 			keys: [
// 				{
// 					pubkey: PROGRAM_DATA_PUBLIC_KEY,
// 					isSigner: false,
// 					isWritable: true
// 				},
// 			],
// 			programId: PROGRAM_ID,
// 		});
// console.log("instruction",instruction)

// const transactionSignature = await connection.(instruction,[])
		// transaction.add(instruction)
		// Web3.sendAndConfirmTransaction(connection,transaction,).then(sig => {
		// 	console.log(`Explorer URL: https://explorer.solana.com/tx/${sig}?cluster=devnet`)
		// })
	}

	return (
		// <div className={styles.buttonContainer} onClick={onClick}>
		// 	<button className={styles.button}>Click to Send Transaction</button>

		// </div>
		<div>

            <input type='text'  value={textField} onChange={handleGreetingChange}/>
			<button className={styles.buttonContainer} onClick={setGreeting}>Set Greeting</button>

			<button className={styles.buttonContainer} onClick={getGreeting}>Get Greeting</button>
			{greetingText && <div className={styles.greeting}>Greeting: {greetingText}</div>}
		</div>
	)
}