'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import ContractFunctions from './ContractFunctions'

export default function ContractTester() {
  const [abi, setAbi] = useState('')
  const [contractAddress, setContractAddress] = useState('')
  const [account, setAccount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [parsedAbi, setParsedAbi] = useState<any[] | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const parsedAbi = JSON.parse(abi)
      setParsedAbi(parsedAbi)
    } catch (err) {
      setError('Invalid ABI format')
      setParsedAbi(null)
    }

    setIsLoading(false)
  }

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' })
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        setAccount(accounts[0])
      } catch (error) {
        console.error('Failed to connect to MetaMask:', error)
        setError('Failed to connect to MetaMask. Please make sure it is installed and unlocked.')
      }
    } else {
      setError('MetaMask is not installed. Please install it to use this application.')
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Contract Tester</CardTitle>
        <CardDescription>Enter contract details to interact with EVM-compatible contracts</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="abi" className="block text-sm font-medium mb-1">
              Contract ABI
            </label>
            <Textarea
              id="abi"
              placeholder="Paste contract ABI here"
              value={abi}
              onChange={(e) => setAbi(e.target.value)}
              className="min-h-[100px]"
              required
            />
          </div>
          <div>
            <label htmlFor="contractAddress" className="block text-sm font-medium mb-1">
              Contract Address
            </label>
            <Input
              id="contractAddress"
              placeholder="0x..."
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              required
            />
          </div>
          <Button onClick={connectWallet} className="w-full mb-4">
            {account ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect MetaMask'}
          </Button>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Load Contract'}
          </Button>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        {parsedAbi && (
          <ContractFunctions abi={parsedAbi} contractAddress={contractAddress} account={account} />
        )}
      </CardContent>
    </Card>
  )
}