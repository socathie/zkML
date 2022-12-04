# zkML-hardhat

## Setup

Run `npm i` to install.

If `circom` and/or `snarkjs` is not installed on your machine, run `npm run setup:circom` to install latest version of `circom` and `snarkjs@0.4.19`.

## Testing

To test on precompiled contracts, run `npx hardhat test`.

To compile circuits from scratch and create contracts, run `npm run test:full`.

## Deploy

To deploy on Goerli testnet, run the above commands first, then change the private key in `hardhat.config.js` to your own private key (Please be careful not to include your private key in any commit!). The contracts have also been deployed to the addresses to `address.json` on Goerli and can be accessed directly.

```shell
npx hardhat deploy --network goerli
```

## Remark

`EncryptVerifier` contract is currently too large to be deployed on Goerli. You can test it locally by running `npx hardhat node`.

Check out `package.json` for other commands to compile circuits and contracts.
