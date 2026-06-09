import { useState } from 'react'
import { ethers } from 'ethers'

const CONTRACT_ADDRESS = "0xA74D8a6ed9A7f91608fB6E36611EB9A758F7A790"

const ABI = [
  "function issueCertificate(bytes32 hash) public",
  "function verifyCertificate(bytes32 hash) public view returns (bool)"
]

function App() {
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('')
  const [hashHex, setHashHex] = useState('')

  const getHash = async () => {
    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    return '0x' + hex
  }

  const handleIssue = async () => {
    if (!file) return alert('Please select a certificate first!')
    try {
      setStatus('⏳ Issuing certificate on blockchain...')
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer)
      const hash = await getHash()
      setHashHex(hash)
      const tx = await contract.issueCertificate(hash)
      await tx.wait()
      setStatus('✅ Certificate issued on blockchain successfully!')
    } catch (err) {
      setStatus('❌ Error: ' + err.message)
    }
  }

  const handleVerify = async () => {
    if (!file) return alert('Please select a certificate first!')
    try {
      setStatus('⏳ Verifying on blockchain...')
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer)
      const hash = await getHash()
      setHashHex(hash)
      const result = await contract.verifyCertificate(hash)
      setStatus(result
        ? '✅ VALID! Certificate is authentic and found on blockchain!'
        : ' INVALID! Certificate not found on blockchain!')
    } catch (err) {
      setStatus(' Error: ' + err.message)
    }
  }

  return (
    <section style={{
      textAlign: 'center',
      marginTop: '80px',
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    }}>
      <h1 style={{ color: '#2c3e50', marginBottom: '10px' }}>
         Blockchain Certificate Authentication
      </h1>
      <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>
        Upload a certificate to issue or verify it on Ethereum Sepolia blockchain
      </p>

      <input
        type="file"
        accept=".pdf,.jpg,.png"
        onChange={(e) => {
          setFile(e.target.files[0])
          setStatus('')
          setHashHex('')
        }}
        style={{ marginBottom: '20px' }}
      />

      <br />

      <button
        onClick={handleIssue}
        style={{
          marginRight: '15px',
          padding: '12px 25px',
          background: '#2980b9',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          cursor: 'pointer'
        }}>
         Issue Certificate
      </button>

      <button
        onClick={handleVerify}
        style={{
          padding: '12px 25px',
          background: '#27ae60',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          cursor: 'pointer'
        }}>
        🔍 Verify Certificate
      </button>

      <br /><br />

      {hashHex && (
        <div style={{
          background: '#f4f4f4',
          padding: '10px',
          borderRadius: '8px',
          margin: '10px auto',
          maxWidth: '700px',
          wordBreak: 'break-all',
          fontSize: '13px',
          color: '#555'
        }}>
          <strong>SHA-256 Hash:</strong> {hashHex}
        </div>
      )}

      {status && (
        <h2 style={{
          marginTop: '20px',
          color: status.includes('VALID!') ? 'green' : status.includes('INVALID') ? 'red' : '#e67e22'
        }}>
          {status}
        </h2>
      )}
    </section>
  )
}

export default App