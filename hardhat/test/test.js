const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const { groth16 } = require("snarkjs");
const wasm_tester = require("circom_tester").wasm;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

const { Keypair } = require("../modules/maci-domainobjs");
const { decrypt } = require("../modules/maci-crypto");

const json = require("./mnist_latest_input.json");

describe("Model test", function () {
    let Verifier;
    let verifier;
    let INPUT = {};

    for (const [key, value] of Object.entries(json)) {
        if (Array.isArray(value)) {
            let tmpArray = [];
            for (let i = 0; i < value.flat().length; i++) {
                tmpArray.push(Fr.e(value.flat()[i]));
            }
            INPUT[key] = tmpArray;
        } else {
            INPUT[key] = Fr.e(value);
        }
    }

    before(async function () {
        Verifier = await ethers.getContractFactory("Verifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Model circuit test", async () => {
        const circuit = await wasm_tester("circuits/model/circuit.circom");

        const witness = await circuit.calculateWitness(INPUT, true);

        console.log("hash", witness[2]);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]),Fr.e(7)));
    });

    it("Verifier should return true for correct proofs", async function () {

        const { proof, publicSignals } = await groth16.fullProve(INPUT, "circuits/model/build/circuit_js/circuit.wasm","circuits/model/build/circuit_final.zkey");

        const calldata = await groth16.exportSolidityCallData(proof, publicSignals);
    
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
    
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);

        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });

    it("Verifier should return false for invalid proof", async function () {
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0, 0];
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Encrypt test", function () {

    let Verifier;
    let verifier;

    let INPUT = {};
    let plaintext = [
        ...json['conv2d_1_weights'],
        ...json['conv2d_1_bias'],
        ...json['bn_1_a'],
        ...json['bn_1_b'],
        ...json['conv2d_2_weights'],
        ...json['conv2d_2_bias'],
        ...json['bn_2_a'],
        ...json['bn_2_b'],
        ...json['dense_weights'],
        ...json['dense_bias'],
    ];

    for (const [key, value] of Object.entries(json)) {
        if (Array.isArray(value)) {
            let tmpArray = [];
            for (let i = 0; i < value.flat().length; i++) {
                tmpArray.push(Fr.e(value.flat()[i]));
            }
            INPUT[key] = tmpArray;
        } else {
            INPUT[key] = Fr.e(value);
        }
    }

    delete INPUT.in;

    before(async function () {
        Verifier = await ethers.getContractFactory("EncryptVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Encrypt circuit test", async () => {
        const circuit = await wasm_tester("circuits/encrypt/circuit.circom");

        const keypair = new Keypair();
        const keypair2 = new Keypair();

        const ecdhSharedKey = Keypair.genEcdhSharedKey(
            keypair.privKey,
            keypair2.pubKey,
        );

        INPUT['private_key'] = keypair.privKey.asCircuitInputs();
        INPUT['public_key'] = keypair2.pubKey.asCircuitInputs();

        const witness = await circuit.calculateWitness(INPUT, true);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));

        const ciphertext = {
            iv: witness[1],
            data: witness.slice(2,2372),
        }

        decryptedText = decrypt(ciphertext, ecdhSharedKey);

        for (let i=0; i<2370; i++) {
            assert(Fr.eq(Fr.e(decryptedText[i]), Fr.e(plaintext[i])));
        }

        console.log("iv", ciphertext.iv);
    });

    it("EncryptVerifier should return true for correct proofs", async function () {

        const { proof, publicSignals } = await groth16.fullProve(INPUT, "circuits/encrypt/build/circuit_js/circuit.wasm","circuits/encrypt/build/circuit_final.zkey");

        const calldata = await groth16.exportSolidityCallData(proof, publicSignals);
    
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
    
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);

        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });
    it("EncryptVerifier should return false for invalid proof", async function () {
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = new Array(2371).fill(0);
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});