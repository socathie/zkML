/* global BigInt */

import { generateWitness, generateWitnessPlain } from './generate_witness';
import { groth16 } from 'snarkjs';

import { F1Field, Scalar } from "ffjavascript";
const Fr = new F1Field(Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617"));

export async function generateCalldata(input, wasmBuffer) {

    let generateWitnessSuccess = true;

    let formattedInput = {};

    for (const [key, value] of Object.entries(input)) {
        if (Array.isArray(value)) {
            let tmpArray = [];
            for (let i = 0; i < value.flat().length; i++) {
                tmpArray.push(Fr.e(value.flat()[i]));
            }
            formattedInput[key] = tmpArray;
        } else {
            formattedInput[key] = Fr.e(value);
        }
    }
    /*
    const conv2d_weights = [];
    const conv2d_bias = [];
    const dense_weights = [];
    const dense_bias = [];

    var i;

    for (i=0; i<input.conv2d_weights.length; i++) {
        conv2d_weights.push(Fr.e(input.conv2d_weights[i]));
    }

    for (i=0; i<input.conv2d_bias.length; i++) {
        conv2d_bias.push(Fr.e(input.conv2d_bias[i]));
    }

    for (i=0; i<input.dense_weights.length; i++) {
        dense_weights.push(Fr.e(input.dense_weights[i]));
    }

    for (i=0; i<input.dense_bias.length; i++) {
        dense_bias.push(Fr.e(input.dense_bias[i]));
    }

    const formattedInput = {
        "in": input.in,
        "conv2d_weights": conv2d_weights,
        "conv2d_bias": conv2d_bias,
        "dense_weights": dense_weights,
        "dense_bias": dense_bias
    }
    */
    console.log(formattedInput);

    let witness = await generateWitness(formattedInput, wasmBuffer).then()
        .catch((error) => {
            console.error(error);
            generateWitnessSuccess = false;
        });

    //console.log(witness);

    if (!generateWitnessSuccess) { return; }

    const { proof, publicSignals } = await groth16.prove('circuit_final.zkey', witness); //TODO: switch to accept general zkey file

    const calldata = await groth16.exportSolidityCallData(proof, publicSignals);

    const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());

    //console.log(argv);

    const a = [argv[0], argv[1]];
    const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
    const c = [argv[6], argv[7]];
    const Input = argv.slice(8);

    return [a, b, c, Input];
}

export async function generateWitnessOnly(input, wasmBuffer, numOutputs) {

    let formattedInput = {};

    for (const [key, value] of Object.entries(input)) {
        if (Array.isArray(value)) {
            let tmpArray = [];
            for (let i = 0; i < value.flat().length; i++) {
                tmpArray.push(Fr.e(value.flat()[i]));
            }
            formattedInput[key] = tmpArray;
        } else {
            formattedInput[key] = Fr.e(value);
        }
    }

    console.log(formattedInput);

    let witness = await generateWitnessPlain(formattedInput, wasmBuffer);

    //console.log(witness);
    
    return witness.slice(1,numOutputs+1);
}