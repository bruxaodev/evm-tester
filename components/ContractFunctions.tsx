'use client'

import { useState } from 'react'

// Extend the Window interface to include the ethereum property
declare global {
  interface Window {
    ethereum?: any
  }
}

import { ethers } from 'ethers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Label } from '@/components/ui/label'

interface ContractFunctionsProps {
  abi: any[]
  contractAddress: string
  account: string
}

export default function ContractFunctions({ abi, contractAddress, account }: ContractFunctionsProps) {
  const [results, setResults] = useState<{ [key: string]: string }>({})

  const callFunction = async (functionName: string, inputs: any[], payableAmount: string, stateMutability: string) => {
    if (!window.ethereum) {
      setResults((prev) => ({ ...prev, [functionName]: 'Error: MetaMask is not installed' }))
      return
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(contractAddress, abi, signer)

      let result;
      if (stateMutability === 'payable') {
        if (parseFloat(payableAmount) <= 0) {
          throw new Error('Amount should be greater than 0');
        }
        const options = { value: ethers.utils.parseEther(payableAmount) }
        result = await contract[functionName](...inputs, options)
      } else {
        result = await contract[functionName](...inputs)
      }
      console.log({ result })

      const iface = new ethers.utils.Interface(abi);
      let formattedResult: any;
      try {
        formattedResult = iface.decodeFunctionResult(functionName, result);
      } catch (decodeError) {
        console.error('Error decoding function result:', decodeError);
        formattedResult = result;
      }

      setResults((prev) => ({ ...prev, [functionName]: JSON.stringify(formattedResult) }))
    } catch (error) {
      console.error('Error calling function:', error)
      setResults((prev) => ({ ...prev, [functionName]: 'Error: ' + (error as Error).message }))
    }
  }

  const renderInputs = (inputs: any[], functionName: string, stateMutability: string, setPayableAmount: (value: string) => void) => {
    const inputFields = inputs.map((input, index) => (
      <div key={index} className="mb-2">
        <Label htmlFor={`${functionName}-${input.name}`} className="text-sm font-medium mb-1 block">
          {input.name} ({input.type})
        </Label>
        <Input
          id={`${functionName}-${input.name}`}
          placeholder={`Enter ${input.name}`}
          onChange={(e) => (input.value = e.target.value)}
        />
      </div>
    ))

    if (stateMutability === 'payable') {
      inputFields.push(
        <div key="payableAmount" className="mb-2">
          <Label htmlFor={`${functionName}-payableAmount`} className="text-sm font-medium mb-1 block">
            Amount to Send (ETH)
          </Label>
          <Input
            id={`${functionName}-payableAmount`}
            placeholder="Enter amount in ETH"
            type="number"
            step="0.000000000000000001"
            min="0"
            onChange={(e) => setPayableAmount(e.target.value)}
          />
        </div>
      )
    }

    return inputFields
  }

  const renderFunctions = () => {
    const payableFunctions = abi.filter((item) => item.type === 'function' && item.stateMutability == 'payable');
    const nonPayableFunctions = abi.filter((item) => item.type === 'function' && item.stateMutability !== 'payable' && item.stateMutability !== 'view');
    const viewFunctions = abi.filter((item) => item.type === 'function' && item.stateMutability === 'view');

    const renderFunctionItems = (functions: any[]) => {
      return functions.map((func, index) => (
        <AccordionItem value={func.name} key={index}>
          <AccordionTrigger className="text-left">
            <div>
              <span className="font-semibold">{func.name}</span>
              <span className="ml-2 text-sm text-gray-500">
                ({func.stateMutability})
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              {renderInputs(func.inputs, func.name, func.stateMutability, (value) => func.inputs.payableAmount = value)}
              <Button
                onClick={() => callFunction(
                  func.name,
                  func.inputs.map((input: any) => input.value),
                  func.inputs.payableAmount || '0',
                  func.stateMutability
                )}
              >
                Execute
              </Button>
              {results[func.name] && (
                <div className="mt-2">
                  <strong>Result:</strong>
                  <pre className="bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                    {results[func.name]}
                  </pre>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      ));
    };

    return (
      <>
        {renderFunctionItems(payableFunctions)}
        {renderFunctionItems(nonPayableFunctions)}
        {renderFunctionItems(viewFunctions)}
      </>
    );
  }

  if (!account) {
    return (
      <Card className="mt-6">
        <CardContent>
          <p className="text-center">Please connect your MetaMask wallet to interact with the contract.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Contract Functions</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {renderFunctions()}
        </Accordion>
      </CardContent>
    </Card>
  )
}