import ContractTester from '@/components/ContractTester'
import SignatureGenerator from '@/components/SignatureGenerator'

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">EVM Contract Tester</h1>
      <SignatureGenerator />
      <ContractTester />
    </main>
  )
}