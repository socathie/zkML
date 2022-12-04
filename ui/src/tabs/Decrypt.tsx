import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import { verifyProofLocal } from "../contract";
import Loading from "./components/Loading";

import { Keypair } from "../modules/maci-domainobjs";
import { decrypt } from "../modules/maci-crypto";

import model from "../mnist/public_model.json";

interface Ciphertext {
    iv: BigInt,
    data: BigInt[],
}

export default function Decrypt() {

    const [error, setError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [encrypting, setEncrypting] = useState(false);  
    const [decrypting, setDecrypting] = useState(false); 

    const [keypair, setKeypair] = useState(new Keypair());
    const [keypair2, setKeypair2] = useState(new Keypair());

    const ecdhSharedKey = Keypair.genEcdhSharedKey(
        keypair.privKey,
        keypair2.pubKey,
    );
    
    const [iv, setIV] = useState("");
    const [data, setData] = useState("");
    const [encrypted, setEncrypted] = useState(false);
    const [ciphertext, setCiphertext] = useState<Ciphertext>({iv: BigInt(0), data: [BigInt(0)]});

    const generateKeys = async (event: any) => {
        event.preventDefault();
        setError(false);
        setKeypair(new Keypair());
        setKeypair2(new Keypair());
        console.log(keypair.pubKey);
        event.preventDefault();
    }

    const encryptBtn = async (event: any) => {
        event.preventDefault();
        setError(false);

        const response = await fetch('encrypt.wasm');
        const buffer = await response.arrayBuffer();

        setEncrypting(true);

        let json = {
            ...{
                "private_key": keypair.privKey.asCircuitInputs(), 
                'public_key': keypair2.pubKey.asCircuitInputs(),
            },
            ...model,
        }

        let witness = await verifyProofLocal(json, buffer!, 2371)
            .catch((error: any) => {
                setErrorMsg(error.toString());
                setError(true);
                setEncrypting(false);
            });
        
        // console.log(witness);
        
        setCiphertext({
            'iv': witness![0],
            'data': witness!.slice(1),
        });

        setIV(witness![0].toString());
        setData(witness!.slice(1).toString().split(',').join("\r\n"));

        setEncrypting(false);
        setEncrypted(true);
        event.preventDefault();
    }

    const decryptBtn = async (event: any) => {
        event.preventDefault();
        setError(false);

        setDecrypting(true);

        // console.log(ciphertext);

        let decryptedText = decrypt(ciphertext, ecdhSharedKey);
        // console.log(decryptedText);

        setIV("NA");
        setData(decryptedText.toString().split(',').join("\r\n"));

        setDecrypting(false);
        event.preventDefault();
    }

    return (
        <Box
            component="form"
            sx={{
                "& .MuiTextField-root": { m: 1, width: "25ch" },
                width: "99%", maxWidth: 600, margin: 'auto'
            }}
            noValidate
            autoComplete="off"
            textAlign="center"
        >
            <Typography>Encrypt public model</Typography>
            <Button
                onClick={generateKeys}
                variant="contained">
                Generate Keys
            </Button>
            <br />
            <TextField
                id="priv-key-1"
                label="private key 1"
                type="text"
                value={keypair.privKey.rawPrivKey.toString()}
                disabled={true}
                variant="filled"
            />
            <TextField
                id="priv-key-2"
                label="private key 2"
                type="text"
                value={keypair2.privKey.rawPrivKey.toString()}
                disabled={true}
                variant="filled"
            /><br />
            <TextField
                id="pub-key-1"
                label="public key 1"
                type="text"
                value={keypair.pubKey.rawPubKey.toString()}
                disabled={true}
                variant="filled"
            />
            <TextField
                id="pub-key-2"
                label="public key 2"
                type="text"
                value={keypair2.pubKey.rawPubKey.toString()}
                disabled={true}
                variant="filled"
            /><br />
            <Button
                onClick={encryptBtn}
                variant="contained">
                Encrypt
            </Button>
            <br />
            <Button
                onClick={decryptBtn}
                disabled={!encrypted}
                variant="contained">
                Decrypt
            </Button>
            <br /><br />
            {encrypting ? <Loading text="Encrypting model..." /> : <div />}
            {decrypting ? <Loading text="Decrypting model..." /> : <div />}
            {error ? <Alert severity="error" sx={{ textAlign: "left" }}>{errorMsg}</Alert> : <div />}
            <Typography>IV (model hash): {iv}</Typography>
            <Typography>Data: {data}</Typography>
        </Box>
    );
}