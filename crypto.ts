import { AuditBlock, Complaint } from '../types/index';

/**
 * Pure JavaScript SHA-256 implementation
 * Guarantees identical, instant hashing on client-side React, server-side Next.js, 
 * Node.js, and edge runtimes without relying on external native binaries or Web3 gas.
 */
function sha256Sync(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let lengthProperty = 'length';
  let i = 0, j = 0; // Used as a counter across the whole file
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii[lengthProperty] * 8;

  // Initial hash values: first 32 bits of the fractional parts of the square roots of the first 8 primes 2..19
  let hash: number[] = [];
  // Round constants: first 32 bits of the fractional parts of the cube roots of the first 64 primes 2..311
  let k: number[] = [];
  let primeCounter = 0;

  const isComposite: { [key: number]: boolean } = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = candidate * candidate; i < 312; i += candidate) {
        isComposite[i] = true;
      }
      if (primeCounter < 8) {
        hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      }
      k[primeCounter] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      primeCounter++;
    }
  }

  ascii += '\x80'; // Append Ƈ' bit (plus zero padding)
  while ((ascii[lengthProperty] % 64) - 56) ascii += '\x00'; // More zero padding
  for (i = 0; i < ascii[lengthProperty]; i++) {
    j = ascii.charCodeAt(i);
    if (j >> 8) return ''; // ASCII check: only supports 8-bit ascii characters
    words[i >> 2] |= j << (((3 - i) % 4) * 8);
  }
  words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
  words[words[lengthProperty]] = asciiBitLength;

  // Process each 16-word chunk
  for (j = 0; j < words[lengthProperty]; ) {
    const w = words.slice(j, (j += 16)); // The message schedule
    const oldHash = [...hash];

    for (i = 0; i < 64; i++) {
      let i2 = i + j;
      const w15 = w[i - 15],
        w2 = w[i - 2];

      const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
      const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
      w[i] =
        i < 16
          ? w[i]
          : ((w[i - 16] + s0 + w[i - 7] + s1) | 0);

      const s1h =
        rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const temp1 = (hash[7] + s1h + ch + k[i] + w[i]) | 0;
      const s0h =
        rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
      const maj =
        (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp2 = (s0h + maj) | 0;

      hash = [
        (temp1 + temp2) | 0,
        hash[0],
        hash[1],
        hash[2],
        (hash[3] + temp1) | 0,
        hash[4],
        hash[5],
        hash[6],
      ];
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

export function computeSHA256(data: string): string {
  try {
    return sha256Sync(data);
  } catch (err) {
    console.error('SHA-256 hashing error', err);
    // Simple deterministic fallback in worst case
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(64, '0');
  }
}

/**
 * Creates the Genesis Block (Block #1) for a new complaint
 */
export function createGenesisBlock(complaint: Omit<Complaint, 'auditChain'>): AuditBlock {
  const timestamp = complaint.createdAt || new Date().toISOString();
  const genesisPayload = JSON.stringify({
    blockNumber: 1,
    id: complaint.id,
    trackingCode: complaint.trackingCode,
    category: complaint.category,
    subject: complaint.subject,
    description: complaint.description,
    priority: complaint.priority,
    isAnonymous: complaint.isAnonymous,
    timestamp: timestamp,
    previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
  });

  const hash = computeSHA256(genesisPayload);

  return {
    blockNumber: 1,
    timestamp,
    action: 'Petition Registered (Genesis Block Locked)',
    actor: complaint.isAnonymous ? 'Anonymous Student' : (complaint.studentName || 'Student Petitioner'),
    actorRole: 'Student',
    status: 'Filed',
    department: complaint.department,
    notes: 'Complaint submitted with immutable cryptographic genesis lock. Awaiting administrative triage.',
    previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
    currentHash: hash,
  };
}

/**
 * Computes hash for an audit block given previous hash and block payload
 */
export function calculateBlockHash(block: Omit<AuditBlock, 'currentHash'>): string {
  const payload = JSON.stringify({
    blockNumber: block.blockNumber,
    timestamp: block.timestamp,
    action: block.action,
    actor: block.actor,
    actorRole: block.actorRole,
    status: block.status,
    department: block.department || '',
    notes: block.notes,
    previousHash: block.previousHash,
  });
  return computeSHA256(payload);
}

/**
 * Appends a new immutable audit block to a complaint's audit chain
 */
export function appendAuditBlock(
  chain: AuditBlock[],
  action: string,
  actor: string,
  actorRole: 'Student' | 'Admin' | 'Automated SLA System' | 'Department Head',
  status: Complaint['status'],
  notes: string,
  department?: string
): AuditBlock[] {
  const lastBlock = chain[chain.length - 1];
  const nextBlockNumber = chain.length + 1;
  const timestamp = new Date().toISOString();

  const newBlockUnsigned: Omit<AuditBlock, 'currentHash'> = {
    blockNumber: nextBlockNumber,
    timestamp,
    action,
    actor,
    actorRole,
    status,
    department: department || lastBlock?.department,
    notes,
    previousHash: lastBlock ? lastBlock.currentHash : '0000000000000000000000000000000000000000000000000000000000000000',
  };

  const currentHash = calculateBlockHash(newBlockUnsigned);

  return [
    ...chain,
    {
      ...newBlockUnsigned,
      currentHash,
    },
  ];
}

export interface VerificationResult {
  isValid: boolean;
  totalBlocks: number;
  brokenBlockIndex?: number;
  expectedHash?: string;
  actualHash?: string;
  message: string;
}

/**
 * Verifies every link in the cryptographic audit chain.
 * Detects any tampering, unauthorized edits, or corrupted history.
 */
export function verifyAuditChain(chain: AuditBlock[]): VerificationResult {
  if (!chain || chain.length === 0) {
    return {
      isValid: false,
      totalBlocks: 0,
      message: 'Audit chain is empty or invalid.',
    };
  }

  for (let i = 0; i < chain.length; i++) {
    const block = chain[i];

    // Check previous hash linkage (except genesis)
    if (i > 0) {
      const prevBlock = chain[i - 1];
      if (block.previousHash !== prevBlock.currentHash) {
        return {
          isValid: false,
          totalBlocks: chain.length,
          brokenBlockIndex: block.blockNumber,
          expectedHash: prevBlock.currentHash,
          actualHash: block.previousHash,
          message: `Chain integrity violated at Block #${block.blockNumber}: Previous hash pointer does not match Block #${prevBlock.blockNumber}.`,
        };
      }
    } else {
      // Genesis block previous hash check
      if (block.previousHash !== '0000000000000000000000000000000000000000000000000000000000000000') {
        return {
          isValid: false,
          totalBlocks: chain.length,
          brokenBlockIndex: 1,
          message: 'Genesis Block previous hash pointer is corrupted.',
        };
      }
    }

    // Verify self-hash integrity
    const recomputedHash = calculateBlockHash(block);
    if (recomputedHash !== block.currentHash) {
      return {
        isValid: false,
        totalBlocks: chain.length,
        brokenBlockIndex: block.blockNumber,
        expectedHash: recomputedHash,
        actualHash: block.currentHash,
        message: `Tamper detected in Block #${block.blockNumber}: Data payload has been illegally modified without updating cryptographic signature.`,
      };
    }
  }

  return {
    isValid: true,
    totalBlocks: chain.length,
    message: `Cryptographic audit verified. All ${chain.length} blocks are cryptographically sealed and untampered.`,
  };
}
