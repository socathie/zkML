const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const { groth16 } = require("snarkjs");
const wasm_tester = require("circom_tester").wasm;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

const json = require("./mnist_poly_input.json");

const conv2d_weights = [];
const conv2d_bias = [];
const dense_weights = [];
const dense_bias = [];

for (var i=0; i<json.conv2d_weights.length; i++) {
    conv2d_weights.push(Fr.e(json.conv2d_weights[i]));
}

for (var i=0; i<json.conv2d_bias.length; i++) {
    conv2d_bias.push(Fr.e(json.conv2d_bias[i]));
}

for (var i=0; i<json.dense_weights.length; i++) {
    dense_weights.push(Fr.e(json.dense_weights[i]));
}

for (var i=0; i<json.dense_bias.length; i++) {
    dense_bias.push(Fr.e(json.dense_bias[i]));
}

const INPUT = {
    "in": json.in,
    "conv2d_weights": conv2d_weights,
    "conv2d_bias": conv2d_bias,
    "dense_weights": dense_weights,
    "dense_bias": dense_bias
}

describe("Circuit test", function () {

    it("MNIST poly test", async () => {
        const circuit = await wasm_tester("circuits/circuit.circom");
        await circuit.loadConstraints();
        assert.equal(circuit.nVars, 23622);
        assert.equal(circuit.constraints.length, 16067);

        const witness = await circuit.calculateWitness(INPUT, true);

        //console.log(witness[1]);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]),Fr.e(7)));
    });
});

describe("Verifier Contract", function () {
    let Verifier;
    let verifier;

    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("Verifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proofs", async function () {

        const { proof, publicSignals } = await groth16.fullProve(INPUT, "circuits/build/circuit_js/circuit.wasm","circuits/build/circuit_final.zkey");

        const calldata = await groth16.exportSolidityCallData(proof, publicSignals);
    
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
    
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);

        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0];
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});