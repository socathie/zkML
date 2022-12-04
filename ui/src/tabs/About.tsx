import ReactMarkdown from 'react-markdown';

export default function About() {

  const md = `
  # zkML: Demo for circomlib-ml on Goerli testnet

  ## Usage

  ## Repos
  * Circom library for Machine Learning: [https://github.com/socathie/circomlib-ml](https://github.com/socathie/circomlib-ml)
  * Python-Circom ML Translator: _coming soon_
  * Prototype Demo dApp: [https://github.com/socathie/zkML](https://github.com/socathie/zkML)

  zkMachineLearning is now raising fund on [Gitcoin](https://gitcoin.co/grants/6847/zkmachinelearning-an-end-to-end-platform-to-bridg)!

  Zero-Knowledge Machine Learning (zkML) will be the bridge between the Web2 (AI/ML) and the Web3 worlds. With existing projects like Circom and Zk Block, and existing programs like 0xPARC and ZK HACK, the space needs an actual usable dApp to tie these all together. zkMachineLearning is the project that will attract experienced developers in Web2 to join Web3. Traditionally, machine learning bounty platforms, such as Kaggle, require developers to submit their full model to the host for performance verification. The evaluation process is often black-box and rankings cannot be verified. With zkML, we can verify private data with public models, or verify private models with public data [(https://gitcoin.co/grants/4847/zkml)](https://gitcoin.co/grants/4847/zkml). That means we can now host bounties that developers do not need to fully disclose their model, and model architecture and weights are only disclosed when the bounty is paid.
  
  **The application I am building aims to be an all-in-one end-to-end platform that ML developer can quickly convert their models trained in say Tensorflow or PyTorch into a zk-compatible one. The platform will include a library (circomlib-ml, already published and constantly updated) of Circom circuits that compute common layers in Tensorflow/PyTorch, a Python-Circom translator (in development) that will transcribe ML models in Python into a Circom circuit, and a dApp that will host, verify, payout bounties.**

  ## Design
  ![](https://c.gitcoin.co/docs/7ed933278e8f60790c6e0ff67dd61d08/zkML.png)
  `;

  return (
    <ReactMarkdown children={md}/>
  );
}