import { useState } from 'react';
import { Alert, Button, Card, Select, Space, Steps, Tag, Typography, InputNumber } from 'antd';
import PageLayout from '../components/PageLayout.jsx';
import CodeBlock from '../components/CodeBlock.jsx';

const { Title, Paragraph, Text } = Typography;

const stepBoxStyle = {
  margin: '20px 0',
  padding: 15,
  backgroundColor: '#f8f9fa',
  borderRadius: 4,
  borderLeft: '4px solid #3498db',
};

const keyDisplayStyle = {
  fontFamily: 'monospace',
  backgroundColor: '#f0f0f0',
  padding: 10,
  borderRadius: 4,
  overflowX: 'auto',
};

const mathStyle = {
  fontFamily: "'Courier New', monospace",
  backgroundColor: '#f0f0f0',
  padding: '2px 5px',
  borderRadius: 3,
};

// Sieve of Eratosthenes to find primes up to max
function getPrimesUpTo(max) {
  const sieve = new Array(max + 1).fill(true);
  sieve[0] = sieve[1] = false;

  for (let i = 2; i <= Math.sqrt(max); i++) {
    if (sieve[i]) {
      for (let j = i * i; j <= max; j += i) {
        sieve[j] = false;
      }
    }
  }

  return sieve.map((isPrime, num) => (isPrime ? num : 0)).filter((num) => num > 1);
}

// Greatest Common Divisor (Euclidean algorithm)
function gcd(a, b) {
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}

// Find a number coprime with phi (usually 65537 is used in practice)
function findCoprime(phi) {
  const commonEs = [3, 5, 17, 257, 65537];
  for (const candidate of commonEs) {
    if (candidate < phi && gcd(candidate, phi) === 1) {
      return candidate;
    }
  }

  for (let i = 2; i < phi; i++) {
    if (gcd(i, phi) === 1) {
      return i;
    }
  }

  return 0;
}

// Modular inverse (extended Euclidean algorithm)
function modInverse(a, m) {
  let [oldR, r] = [a, m];
  let [oldS, s] = [1, 0];

  while (r !== 0) {
    const quotient = Math.floor(oldR / r);
    [oldR, r] = [r, oldR - quotient * r];
    [oldS, s] = [s, oldS - quotient * s];
  }

  return oldS < 0 ? oldS + m : oldS;
}

// Modular exponentiation (fast power, for large numbers)
function modExp(base, exp, mod) {
  let result = 1;
  base = base % mod;

  while (exp > 0) {
    if (exp % 2 === 1) {
      result = (result * base) % mod;
    }
    exp = Math.floor(exp / 2);
    base = (base * base) % mod;
  }

  return result;
}

const pseudocode = `function generateKeys(p, q):
    n = p * q
    phi = (p - 1) * (q - 1)
    e = smallest value coprime with phi (try 3, 5, 17, 257, 65537 first)
    d = modInverse(e, phi)          // e * d ≡ 1 (mod phi)
    return publicKey (e, n), privateKey (d, n)

function encrypt(m, e, n):
    return modExp(m, e, n)          // c ≡ m^e mod n

function decrypt(c, d, n):
    return modExp(c, d, n)          // m ≡ c^d mod n`;

export default function RsaVisualizer() {
  const [primeRangeValue, setPrimeRangeValue] = useState('50');
  const [primes, setPrimes] = useState([]);
  const [selectedP, setSelectedP] = useState(null);
  const [selectedQ, setSelectedQ] = useState(null);

  const [keysGenerated, setKeysGenerated] = useState(false);
  const [n, setN] = useState(0);
  const [phi, setPhi] = useState(0);
  const [e, setE] = useState(0);
  const [d, setD] = useState(0);

  const [messageValue, setMessageValue] = useState(42);
  const [encryptResult, setEncryptResult] = useState(null);
  const [decryptResult, setDecryptResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  function reset() {
    setPrimes([]);
    setSelectedP(null);
    setSelectedQ(null);
    setKeysGenerated(false);
    setN(0);
    setPhi(0);
    setE(0);
    setD(0);
    setEncryptResult(null);
    setDecryptResult(null);
    setErrorMsg(null);
  }

  function generatePrimes() {
    const range = parseInt(primeRangeValue, 10);
    setPrimes(getPrimesUpTo(range));
  }

  function handlePrimeClick(prime) {
    if (selectedP === null) {
      setSelectedP(prime);
    } else if (selectedQ === null && prime !== selectedP) {
      setSelectedQ(prime);
    }
  }

  function generateKeys() {
    if (selectedP === null || selectedQ === null) return;

    const nextN = selectedP * selectedQ;
    const nextPhi = (selectedP - 1) * (selectedQ - 1);
    const nextE = findCoprime(nextPhi);
    const nextD = modInverse(nextE, nextPhi);

    setN(nextN);
    setPhi(nextPhi);
    setE(nextE);
    setD(nextD);
    setKeysGenerated(true);
  }

  function encrypt() {
    const m = parseInt(messageValue, 10);
    if (m >= n) {
      setErrorMsg(`Message must be less than n (${n})`);
      return;
    }
    setErrorMsg(null);
    const c = modExp(m, e, n);
    setEncryptResult({ m, c });
  }

  function decrypt() {
    const c = parseInt(messageValue, 10);
    const m = modExp(c, d, n);
    setDecryptResult({ c, m });
  }

  const stepsCurrent = keysGenerated ? 4 : 0;

  return (
    <PageLayout
      title="RSA Encryption Visualizer"
      subtitle="Generate keys, then encrypt and decrypt a message using modular exponentiation."
      wide
    >
      <Card style={{ marginBottom: 20 }}>
        <Title level={2}>Key Generation</Title>

        <Steps
          current={stepsCurrent}
          size="small"
          style={{ marginBottom: 20 }}
          items={[
            { title: 'Select primes' },
            { title: 'n and φ(n)' },
            { title: 'Choose e' },
            { title: 'Compute d' },
          ]}
        />

        <Space orientation="vertical" style={{ width: '100%' }} size="middle">
          <Space wrap>
            <Select
              value={primeRangeValue}
              onChange={setPrimeRangeValue}
              style={{ width: 220 }}
              options={[
                { value: '10', label: 'Very Small (3-19)' },
                { value: '50', label: 'Small (3-53)' },
                { value: '100', label: 'Medium (3-101)' },
              ]}
            />
            <Button type="primary" onClick={generatePrimes}>
              Generate Primes
            </Button>
            <Button onClick={generateKeys} disabled={selectedP === null || selectedQ === null}>
              Generate Keys
            </Button>
            <Button onClick={reset}>Reset</Button>
          </Space>

          <div style={stepBoxStyle}>
            <Title level={3}>Step 1: Select Two Prime Numbers</Title>
            <Paragraph>First, we need to select two distinct prime numbers (p and q).</Paragraph>
            <Space wrap>
              {primes.map((prime) => {
                const isSelected = prime === selectedP || prime === selectedQ;
                return (
                  <Tag
                    key={prime}
                    color={isSelected ? 'success' : 'default'}
                    style={{ cursor: 'pointer', padding: '5px 10px', fontSize: 14 }}
                    onClick={() => handlePrimeClick(prime)}
                  >
                    {prime}
                  </Tag>
                );
              })}
            </Space>
            {selectedP !== null && <Paragraph style={{ marginTop: 10 }}>Selected p = {selectedP}</Paragraph>}
            {selectedQ !== null && <Paragraph>Selected q = {selectedQ}</Paragraph>}
          </div>

          {keysGenerated && (
            <div style={stepBoxStyle}>
              <Title level={3}>Step 2: Calculate n and φ(n)</Title>
              <Paragraph>
                Compute <Text style={mathStyle}>n = p × q</Text> and{' '}
                <Text style={mathStyle}>φ(n) = (p-1) × (q-1)</Text>
              </Paragraph>
              <Paragraph>
                n = p × q = {selectedP} × {selectedQ} = <Text style={mathStyle}>{n}</Text>
              </Paragraph>
              <Paragraph>
                φ(n) = (p-1) × (q-1) = {selectedP - 1} × {selectedQ - 1} = <Text style={mathStyle}>{phi}</Text>
              </Paragraph>
            </div>
          )}

          {keysGenerated && (
            <div style={stepBoxStyle}>
              <Title level={3}>Step 3: Choose Public Exponent e</Title>
              <Paragraph>
                Select <Text style={mathStyle}>e</Text> such that{' '}
                <Text style={mathStyle}>1 &lt; e &lt; φ(n)</Text> and{' '}
                <Text style={mathStyle}>gcd(e, φ(n)) = 1</Text>
              </Paragraph>
              <Paragraph>
                Selected e = <Text style={mathStyle}>{e}</Text> (coprime with φ(n))
              </Paragraph>
            </div>
          )}

          {keysGenerated && (
            <div style={stepBoxStyle}>
              <Title level={3}>Step 4: Calculate Private Exponent d</Title>
              <Paragraph>
                Find <Text style={mathStyle}>d</Text> such that{' '}
                <Text style={mathStyle}>d × e ≡ 1 mod φ(n)</Text>
              </Paragraph>
              <Paragraph>
                Calculated d = <Text style={mathStyle}>{d}</Text> ({e} × {d} ≡ 1 mod {phi})
              </Paragraph>
            </div>
          )}
        </Space>
      </Card>

      {keysGenerated && (
        <Card style={{ marginBottom: 20 }}>
          <Title level={2}>Generated Keys</Title>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 220, padding: 15, backgroundColor: '#e8f4fc', borderRadius: 4, textAlign: 'center' }}>
              <Title level={3}>Public Key</Title>
              <Paragraph>(e, n)</Paragraph>
              <div style={keyDisplayStyle}>({e}, {n})</div>
            </div>
            <div style={{ flex: 1, minWidth: 220, padding: 15, backgroundColor: '#e8f4fc', borderRadius: 4, textAlign: 'center' }}>
              <Title level={3}>Private Key</Title>
              <Paragraph>(d, n)</Paragraph>
              <div style={keyDisplayStyle}>({d}, {n})</div>
            </div>
          </div>
        </Card>
      )}

      {keysGenerated && (
        <Card style={{ marginBottom: 20 }}>
          <Title level={2}>Encryption &amp; Decryption</Title>

          <Space orientation="vertical" style={{ width: '100%' }} size="middle">
            <div>
              <Text strong style={{ display: 'block', marginBottom: 5 }}>
                Message (Number):
              </Text>
              <Space wrap align="center">
                <InputNumber min={1} value={messageValue} onChange={(val) => setMessageValue(val ?? 0)} />
                <Button type="primary" onClick={encrypt}>
                  Encrypt
                </Button>
                <Button onClick={decrypt}>Decrypt</Button>
              </Space>
              <Paragraph type="secondary" style={{ marginTop: 5 }}>
                Note: In real RSA, messages are converted to numbers first.
              </Paragraph>
            </div>

            {errorMsg && <Alert type="error" title={errorMsg} showIcon closable onClose={() => setErrorMsg(null)} />}

            {encryptResult && (
              <div style={stepBoxStyle}>
                <Title level={3}>Encryption Process</Title>
                <Paragraph>
                  To encrypt message <Text style={mathStyle}>m</Text>, compute:
                </Paragraph>
                <Paragraph>
                  <Text style={mathStyle}>
                    c ≡ m<sup>e</sup> mod n
                  </Text>
                </Paragraph>
                <Paragraph>
                  c ≡ m<sup>e</sup> mod n ≡ {encryptResult.m}<sup>{e}</sup> mod {n}
                </Paragraph>
                <Paragraph>c ≡ {encryptResult.c} mod {n}</Paragraph>
                <Paragraph>
                  Ciphertext: <Text style={mathStyle}>{encryptResult.c}</Text>
                </Paragraph>
              </div>
            )}

            {decryptResult && (
              <div style={stepBoxStyle}>
                <Title level={3}>Decryption Process</Title>
                <Paragraph>
                  To decrypt ciphertext <Text style={mathStyle}>c</Text>, compute:
                </Paragraph>
                <Paragraph>
                  <Text style={mathStyle}>
                    m ≡ c<sup>d</sup> mod n
                  </Text>
                </Paragraph>
                <Paragraph>
                  m ≡ c<sup>d</sup> mod n ≡ {decryptResult.c}<sup>{d}</sup> mod {n}
                </Paragraph>
                <Paragraph>m ≡ {decryptResult.m} mod {n}</Paragraph>
                <Paragraph>
                  Decrypted message: <Text style={mathStyle}>{decryptResult.m}</Text>
                </Paragraph>
              </div>
            )}
          </Space>
        </Card>
      )}

      <Card>
        <Title level={2}>How RSA Works</Title>

        <Title level={3}>Key Generation</Title>
        <ol>
          <li>
            Choose two distinct prime numbers <Text style={mathStyle}>p</Text> and <Text style={mathStyle}>q</Text>
          </li>
          <li>
            Compute <Text style={mathStyle}>n = p × q</Text>
          </li>
          <li>
            Compute <Text style={mathStyle}>φ(n) = (p-1)(q-1)</Text>
          </li>
          <li>
            Choose integer <Text style={mathStyle}>e</Text> such that{' '}
            <Text style={mathStyle}>1 &lt; e &lt; φ(n)</Text> and <Text style={mathStyle}>gcd(e, φ(n)) = 1</Text>
          </li>
          <li>
            Determine <Text style={mathStyle}>d</Text> as modular inverse of <Text style={mathStyle}>e</Text> modulo{' '}
            <Text style={mathStyle}>φ(n)</Text>
          </li>
        </ol>

        <Title level={3}>Encryption</Title>
        <Paragraph>
          <Text style={mathStyle}>
            c ≡ m<sup>e</sup> mod n
          </Text>
        </Paragraph>

        <Title level={3}>Decryption</Title>
        <Paragraph>
          <Text style={mathStyle}>
            m ≡ c<sup>d</sup> mod n
          </Text>
        </Paragraph>

        <Title level={3}>Why It Works</Title>
        <Paragraph>Euler's theorem guarantees that for any message m:</Paragraph>
        <Paragraph>
          <Text style={mathStyle}>
            m<sup>φ(n)</sup> ≡ 1 mod n
          </Text>
        </Paragraph>
        <Paragraph>
          Since <Text style={mathStyle}>e × d ≡ 1 mod φ(n)</Text>, we have:
        </Paragraph>
        <Paragraph>
          <Text style={mathStyle}>
            (m<sup>e</sup>)<sup>d</sup> ≡ m<sup>e×d</sup> ≡ m<sup>kφ(n)+1</sup> ≡ (m<sup>φ(n)</sup>)<sup>k</sup> × m ≡
            m mod n
          </Text>
        </Paragraph>

        <Title level={3}>Algorithm Summary</Title>
        <CodeBlock language="text" code={pseudocode} />
      </Card>
    </PageLayout>
  );
}
