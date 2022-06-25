import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import { verifyProof } from "../contract";
import Loading from "./components/Loading";

import model from "../mnist/public_model.json";
import images from "../mnist/image.json";
import labels from "../mnist/label.json";

import { HeatMapGrid } from "react-grid-heatmap";


export default function Classify() {

    const [output, setOutput] = useState("");

    const [error, setError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [Verifying, setVerifying] = useState(false);

    const [index, setIndex] = useState(0);

    const [correct, setCorrect] = useState(0);
    const [total, setTotal] = useState(0);

    const [factor, setFactor] = useState(1000000);
    const [factorDisable, setFactorDisable] = useState(false);

    const verify = async (event: any) => {
        event.preventDefault();
        setError(false);

        const response = await fetch('circuit.wasm');
        const buffer = await response.arrayBuffer();

        setVerifying(true);
        

        let image = images[index].in.flat().map(x => x*factor);

        let json = { ...{ "in": image }, ...model };

        let prediction = await verifyProof(json, buffer)
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

    const inputHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.value !== "" && event.target.value !== "0") {
            setFactor(parseInt(event.target.value));
            setFactorDisable(false);
        }
        else {
            setFactorDisable(true);
        }
    };

    const enterHandler = async (event: any) => {
        if (event.which === "13") {
            event.preventDefault();
        }
    };

    const keyHandler = async (event: any) => {
        if (['e', 'E', '+', '-', '.', 'Enter'].includes(event.key)) {
            event.preventDefault();
        }
    };

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
            <HeatMapGrid
                data={images[index].in}
                square={true}
                cellHeight="1rem"
            />
            <TextField
                id="scaling-factor"
                label="Pixel Scaling Factor"
                type="number"
                InputLabelProps={{
                    shrink: true,
                }}
                InputProps={{
                    inputProps: { min: 1 }
                }}
                value={1000000}
                disabled={true}
                variant="filled"
                onKeyDown={keyHandler}
                onChange={inputHandler}
                onKeyPress={enterHandler}
            /><br />
            <Button
                onClick={verify}
                disabled={factorDisable}
                variant="contained">
                Classify
            </Button>
            <br /><br />
            {Verifying ? <Loading text="Verifying proof..." /> : <div />}
            {error ? <Alert severity="error" sx={{ textAlign: "left" }}>{errorMsg}</Alert> : <div />}
            <Typography>Label: {labels[index]}</Typography>
            <Typography>Prediction: {output}</Typography>
            <Typography>Current accuracy: {(correct * 100 / total).toFixed(2)} %</Typography>
        </Box>
    );
}