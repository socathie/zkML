const fs = require("fs");
const solidityRegex = /pragma solidity \^\d+\.\d+\.\d+/
const verifierRegex = /contract Verifier/

let content = fs.readFileSync("./contracts/Verifier.sol", { encoding: 'utf-8' });
let bumped = content.replace(solidityRegex, 'pragma solidity ^0.8.4');

fs.writeFileSync("./contracts/Verifier.sol", bumped);

content = fs.readFileSync("./contracts/EncryptVerifier.sol", { encoding: 'utf-8' });
bumped = content.replace(solidityRegex, 'pragma solidity ^0.8.4');
renamed = bumped.replace(verifierRegex, 'contract EncryptVerifier');

fs.writeFileSync("./contracts/EncryptVerifier.sol", renamed);
