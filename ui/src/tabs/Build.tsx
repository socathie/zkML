import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import { verifyProofLocal } from "../contract";
import Loading from "./components/Loading";

import images from "../mnist/image.json";
import labels from "../mnist/label.json";

import { HeatMapGrid } from "react-grid-heatmap";

export default function Build() {

    const [output, setOutput] = useState("");
    const [hash, setHash] = useState("");

    const [error, setError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [Verifying, setVerifying] = useState(false);
    const [fileLoading, setLoading] = useState(false);

    const [index, setIndex] = useState(0);

    const [correct, setCorrect] = useState(0);
    const [total, setTotal] = useState(0);

    // read model from json, add input, then generate witness
    const verify = async (event: any) => {
        event.preventDefault();
        setError(false);

        setVerifying(true);
        
        let image = images[index].in.flat();

        let json = { ...{ "in": image }, ...selectedJson };

        let witness = await verifyProofLocal(json, selectedWasm!, 2)
            .catch((error: any) => {
                setErrorMsg(error.toString());
                setError(true);
                setVerifying(false);
            });
        setOutput(witness![0].toString());
        setHash(witness![1].toString());
        setVerifying(false);

        setTotal(total + 1);
        if (witness![0].toString() === labels[index].toString()) {
            setCorrect(correct + 1);
        }
        event.preventDefault();
    }

    const roll = async (event: any) => {
        event.preventDefault();
        setOutput("");
        setIndex(Math.floor(Math.random() * 100));
        event.preventDefault();
    }

    const [selectedWasm, setSelectedWasm] = useState<ArrayBuffer>();
    const [wasmLoaded, setWasmLoaded] = useState(false);

    let wasmReader = new FileReader();

    const changeWasmHandler = (event: any) => {
        let file = event.target.files[0];
        if (file) {
            setLoading(true);
            setError(false);
            setWasmLoaded(false);
            wasmReader.onload = onWasmLoad;
            wasmReader.readAsArrayBuffer(file);
        } else {
            setError(false);
            setWasmLoaded(false);
        }
    }

    const onWasmLoad = (event: any) => {
        setSelectedWasm(event.target.result);
        setWasmLoaded(true);
        setLoading(false);
    }

    const [selectedJson, setSelectedJson] = useState({});
    const [jsonLoaded, setJsonLoaded] = useState(false);

    let jsonReader = new FileReader();

    const changeJsonHandler = (event: any) => {
        let file = event.target.files[0];
        if (file) {
            setLoading(true);
            setError(false);
            setJsonLoaded(false);
            jsonReader.onload = onJsonLoad;
            jsonReader.readAsText(file);
        } else {
            setError(false);
            setJsonLoaded(false);
        }
    }

    const onJsonLoad = (event: any) => {
        try {
            let loadJson = JSON.parse(event.target.result);

            if (loadJson.constructor === Object) {
                setSelectedJson(loadJson);
                setJsonLoaded(true);
            }
            else {
                setErrorMsg("Invalid json format");
                setError(true);
            }
        }
        catch (error: any) {
            setErrorMsg(error.toString());
            setError(true);
        };
        setLoading(false);
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
            <Typography>Classify with public model</Typography>
            <Button
                onClick={roll}
                disabled={false}
                variant="contained">
                new digit
            </Button>
            <br /><br />
            <HeatMapGrid
                data={images[index].in}
                square={true}
                cellHeight="1rem"
            />
            <br />
            <Typography>Upload your own model WebAssembly file:</Typography>
            <input type="file" name="file" onChange={changeWasmHandler} accept=".wasm" />
            <Button
                href={process.env.PUBLIC_URL + "/mnist_latest_test.wasm"}
                download="mnist_convnet_test.wasm"
                variant="contained">
                Download sample wasm
            </Button>
            <Typography>Upload your own model weights:</Typography>
            <input type="file" name="file" onChange={changeJsonHandler} accept=".json" />
            <Button
                href={process.env.PUBLIC_URL + "/mnist_latest_model.json"}
                download="mnist_convnet_model.json"
                variant="contained">
                Download sample json
            </Button>
            <br />
            <Button
                onClick={verify}
                disabled={!jsonLoaded || !wasmLoaded }// || factorDisable}
                variant="contained">
                Classify
            </Button>
            <br /><br />
            {Verifying ? <Loading text="Verifying proof..." /> : <div />}
            {fileLoading ? <Loading text="Loading file..." /> : <div />}
            {error ? <Alert severity="error" sx={{ textAlign: "left" }}>{errorMsg}</Alert> : <div />}
            <Typography>Label: {labels[index]}</Typography>
            <Typography>Prediction: {output}</Typography>
            <Typography>Model hash: {hash}</Typography>
            <Typography>Current accuracy: {(correct * 100 / total).toFixed(2)} %</Typography>
        </Box>
    );
}