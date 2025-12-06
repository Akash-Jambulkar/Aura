// Blockchain Service - Simulates blockchain transactions and smart contracts
// Prototype implementation with visual blockchain

class BlockchainService {
  constructor() {
    this.chain = [];
    this.pendingTransactions = [];
    this.blockchainAddress = '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    this.network = 'Tata Capital Blockchain Network';
  }

  // Create a new block
  createBlock(transactions, type = 'TRANSACTION') {
    const block = {
      index: this.chain.length + 1,
      timestamp: new Date().toISOString(),
      transactions: transactions,
      previousHash: this.chain.length > 0 ? this.chain[this.chain.length - 1].hash : '0'.repeat(64),
      hash: this.generateHash(transactions),
      nonce: Math.floor(Math.random() * 10000),
      type: type,
      blockId: `BLK${Date.now()}${Math.floor(Math.random() * 1000)}`
    };
    
    this.chain.push(block);
    this.logBlockchainTransaction(block);
    return block;
  }

  // Generate hash for block
  generateHash(data) {
    const str = JSON.stringify(data) + Date.now();
    return '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
  }

  // Create smart contract for loan sanction
  createSanctionContract(loanData) {
    const contract = {
      contractId: `SC${Date.now()}`,
      type: 'LOAN_SANCTION',
      customerId: loanData.customer.phone,
      customerName: loanData.customer.name,
      loanAmount: loanData.loan.amount,
      tenure: loanData.loan.tenure,
      interestRate: loanData.loan.interestRate,
      emi: this.calculateEMI(loanData.loan.amount, loanData.loan.interestRate, loanData.loan.tenure),
      status: 'APPROVED',
      createdAt: new Date().toISOString(),
      contractHash: this.generateHash(loanData),
      ipfsHash: null, // Will be set when document is uploaded to IPFS
      blockchainAddress: this.blockchainAddress
    };

    // Create blockchain transaction
    const transaction = {
      from: 'Tata Capital',
      to: loanData.customer.phone,
      amount: loanData.loan.amount,
      type: 'LOAN_SANCTION',
      contract: contract,
      timestamp: new Date().toISOString()
    };

    this.createBlock([transaction], 'SMART_CONTRACT');
    return contract;
  }

  // Calculate EMI
  calculateEMI(principal, rate, tenure) {
    const monthlyRate = rate / 12 / 100;
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);
  }

  // Log blockchain transaction to UI
  logBlockchainTransaction(block) {
    const blockchainPanel = document.getElementById('blockchainPanel');
    if (!blockchainPanel) return;

    const blockElement = document.createElement('div');
    blockElement.className = 'blockchain-block';
    blockElement.innerHTML = `
      <div class="block-header">
        <div class="block-number">Block #${block.index}</div>
        <div class="block-type badge bg-${block.type === 'SMART_CONTRACT' ? 'success' : 'primary'}">${block.type}</div>
        <div class="block-time">${new Date(block.timestamp).toLocaleTimeString()}</div>
      </div>
      <div class="block-hash">
        <small>Hash:</small> <code>${block.hash.substring(0, 20)}...</code>
      </div>
      <div class="block-prev-hash">
        <small>Prev:</small> <code>${block.previousHash.substring(0, 20)}...</code>
      </div>
      ${block.transactions.map(tx => `
        <div class="block-transaction">
          <div class="tx-type">${tx.type}</div>
          ${tx.contract ? `
            <div class="tx-contract">
              <strong>Contract ID:</strong> ${tx.contract.contractId}<br>
              <strong>Customer:</strong> ${tx.contract.customerName}<br>
              <strong>Amount:</strong> ₹${tx.amount.toLocaleString('en-IN')}
            </div>
          ` : ''}
        </div>
      `).join('')}
    `;

    blockchainPanel.insertBefore(blockElement, blockchainPanel.firstChild);
    blockchainPanel.scrollTop = 0;

    // Animate
    blockElement.style.opacity = '0';
    blockElement.style.transform = 'translateY(20px)';
    setTimeout(() => {
      blockElement.style.transition = 'all 0.5s ease';
      blockElement.style.opacity = '1';
      blockElement.style.transform = 'translateY(0)';
    }, 10);
  }

  // Get blockchain explorer data
  getExplorerData() {
    return {
      totalBlocks: this.chain.length,
      totalTransactions: this.chain.reduce((sum, block) => sum + block.transactions.length, 0),
      network: this.network,
      address: this.blockchainAddress,
      chain: this.chain.slice(-10) // Last 10 blocks
    };
  }
}

// Initialize blockchain
const blockchainService = new BlockchainService();
window.blockchainService = blockchainService;

