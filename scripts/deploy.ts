import { ethers } from 'hardhat'
import { readFile, writeFile } from 'fs/promises'

async function main() {
  const [deployer] = await ethers.getSigners()

  console.log('Deploying contracts with the account:', deployer.address)

  const Contract = await ethers.getContractFactory('Realm')
  const contract = await Contract.deploy()

  console.log('Contract deployed:', contract.address)

  // Write contract address into the front end project
  {
    const file = './src/lib/contract.ts'
    const contents = await readFile(file, 'utf8')

    await writeFile(file, contents.replace(/0x[^']+/, contract.address))
  }

  // Write contract address into package.json to verify contract
  {
    const file = './package.json'
    const contents = await readFile(file, 'utf8')

    await writeFile(file, contents.replace(/0x[(^\s|")]+/, contract.address))
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

export {}
