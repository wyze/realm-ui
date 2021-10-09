# Realm &middot; [![Website][website-image]][website-url]

> A Web3 front-end to interact with [Realm](https://realm.jona.land).

## Setup

- Clone Project
  ```sh
  $ git clone https://github.com/wyze/realm-ui.git
  $ cd realm-ui
  $ yarn
  ```
- Install [MetaMask](https://metamask.io)
- Setup Environment Variables
  - `ETHERSCAN_API_KEY`: This will be used to verify contracts on Etherscan
  - `RINKEBY_ACCOUNTS`: Your wallet's private key (**Recommended: Make new wallet just for this**)
  - `RINKEBY_URL`: Url to Alchemy or Infura

## Development

### Smart Contract

The contracts here were developed by the awesome [@jona](https://github.com/jona) and are copied in here for easier development and ABI generation. You can find the source code for the contracts at [jona/realm](https://github.com/jona/realm).

The deployment script for the contract will automatically update the front-end code to use the latest contract address and ABI.

```sh
$ yarn contract:deploy
$ yarn contract:verify
```

### Frontend

```sh
$ yarn dev
```

## Test

```sh
$ yarn test
```

## Build

```sh
$ yarn build
```

## License

MIT © [Neil Kistner](https://neilkistner.com)

[website-image]: https://img.shields.io/website-up-down-green-red/https/realm.wyze.dev.svg?style=flat-square
[website-url]: https://realm.wyze.dev
