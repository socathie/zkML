import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import { verifyProof } from "../contract";
import Loading from "./components/Loading";

import images from "../mnist/image.json";
import labels from "../mnist/label.json";

import { HeatMapGrid } from "react-grid-heatmap";

export default function Build() {

    const [output, setOutput] = useState("");

    const [error, setError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [Verifying, setVerifying] = useState(false);
    const [fileLoading, setLoading] = useState(false);

    const [index, setIndex] = useState(0);

    const [correct, setCorrect] = useState(0);
    const [total, setTotal] = useState(0);

    const verify = async (event: any) => {
        event.preventDefault();
        setError(false);

        setVerifying(true);

        console.log(selectedJson);
        let json = { ...images[index], ...selectedJson };
        let prediction = await verifyProof(json)
            .catch((error: any) => {
                setErrorMsg(error.toString());
                setError(true);
                setVerifying(false);
            });
        setOutput(prediction);
        setVerifying(false);

        setTotal(total + 1);
        if (prediction.toString() === labels[index].toString()) {
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

    /*
    const [selectedWasm, setSelectedWasm] = useState();
    const [isWasmPicked, setIsWasmPicked] = useState(false);

    const changeWasmHandler = (event: any) => {
        setSelectedWasm(event.target.files[0]);
        setIsWasmPicked(true);
    };
    */

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
        }
    }

    const onJsonLoad = (event: any) => {
        try {
            let loadJson = JSON.parse(event.target.result);

            if (loadJson.constructor == Object) {
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
            <Typography>Upload your own model weights:</Typography>
            <input type="file" name="file" onChange={changeJsonHandler} accept=".json" />
            <br />
            <Button
                onClick={verify}
                disabled={!jsonLoaded}
                variant="contained">
                Classify
            </Button>
            <br /><br />
            {Verifying ? <Loading text="Verifying proof..." /> : <div />}
            {fileLoading ? <Loading text="Loading file..." /> : <div />}
            {error ? <Alert severity="error" sx={{ textAlign: "left" }}>{errorMsg}</Alert> : <div />}
            <Typography>Label: {labels[index]}</Typography>
            <Typography>Prediction: {output}</Typography>
            <Typography>Current accuracy: {(correct * 100 / total).toFixed(2)} %</Typography>
        </Box>
    );
}