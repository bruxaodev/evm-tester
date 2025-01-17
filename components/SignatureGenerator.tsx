'use client'

import { useState } from 'react'
import { ethers } from 'ethers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export default function Signat() {
  const [error, setError] = useState('')
  const [privateKey, setPrivateKey] = useState('')
  const [userAddress, setUserAddress] = useState('')
  const [contractAddress, setContractAddress] = useState('')
  const [signature, setSignature] = useState('')

  const handleSignMessage = async () => {
    setError('')
    setSignature('')

    try {
      const wallet = new ethers.Wallet(privateKey)
      const message = ethers.utils.solidityKeccak256(
        ['address', 'address'],
        [contractAddress.toLowerCase(), userAddress.toLowerCase()]
      )
      const arrayMessage = ethers.utils.arrayify(message)
      const signature = await wallet.signMessage(arrayMessage)
      setSignature(signature)
    } catch (err) {
      console.error('Error signing message:', err)
      setError('Failed to sign message. Please check the inputs and try again.')
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto my-2">
      <CardHeader>
        <CardTitle>SignatureGenerator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mt-8">
          <div>
            <Label htmlFor="privateKey" className="block text-sm font-medium mb-1">
              Private Key
            </Label>
            <Input
              id="privateKey"
              type="password"
              placeholder="Enter your private key"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="userAddress" className="block text-sm font-medium mb-1">
              contract Address
            </Label>
            <Input
              id="userAddress"
              placeholder="0x..."
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="userAddress" className="block text-sm font-medium mb-1">
              User Address
            </Label>
            <Input
              id="userAddress"
              placeholder="0x..."
              value={userAddress}
              onChange={(e) => setUserAddress(e.target.value)}
              required
            />
          </div>
          <Button onClick={handleSignMessage} className="w-full">
            Generate Signature
          </Button>
          {error && <p className="text-red-500 mt-4">{error}</p>}
          {signature && (
            <div className="mt-4">
              <strong>Signature:</strong>
              <pre className="bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                {signature}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}