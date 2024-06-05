import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as Web3 from '@solana/web3.js'
import { FC } from 'react'
import styles from '../styles/PingButton.module.css'
import base58 from 'bs58'; 
const PROGRAM_ID = new Web3.PublicKey("ChT1B39WKLS8qUrkLvFDXMhEJ4F1XZzwUNHUt4AU9aVa")
const PRIVATE_KEY ='YOUR PRIVATE KEY';
const PROGRAM_DATA_PUBLIC_KEY = new Web3.PublicKey("HpeaJ9KvqJiTizS9qVJ8G4CJn3gzBLNptL7CR1eTm9Sd")
// if (!PRIVATE_KEY) {
// 	console.log("error")
// 	throw new Error("PRIVATE_KEY environment variable is not set");
//   }
const privateKey =new Uint8Array(base58.decode(PRIVATE_KEY));

const account = Web3.Keypair.fromSecretKey(privateKey);
const account2 = Web3.Keypair.generate();//to sends funds
export const SendTx: FC = () => {
	const { connection } = useConnection();
	const { publicKey, sendTransaction } = useWallet();
	
	console.log(PROGRAM_DATA_PUBLIC_KEY.toString())
	
	const onClick = async () => {
		if (!connection || !publicKey) { 
			alert("Please connect your wallet first lol")
			return
		}
		const {lastValidBlockHeight, blockhash} = await connection.getLatestBlockhash();

		const transaction = new Web3.Transaction().add(
			Web3.SystemProgram.transfer({
				fromPubkey: account.publicKey,
				toPubkey:account2.publicKey,
				lamports: Web3.LAMPORTS_PER_SOL *0.001,

			})
		)
		console.log("transaction",transaction)

		await Web3.sendAndConfirmTransaction(
			connection,
			transaction,
			[account]
		).then(sig =>{
			console.log(`Explorer URL: https://explorer.solana.com/tx/${sig}?cluster=devnet`)
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
		<div className={styles.buttonContainer} onClick={onClick}>
			<button className={styles.button}>Click to Send Transaction</button>
		</div>
	)
}