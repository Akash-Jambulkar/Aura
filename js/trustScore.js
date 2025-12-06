// Trust Score Generation System
// Consolidates financial transactions and generates trust score

class TrustScoreService {
  constructor() {
    this.baseURL = 'https://trustscore.tatacapital.com/v1';
  }

  // Generate trust score from financial data
  async generateTrustScore(customerData) {
    const startTime = Date.now();
    const endpoint = `${this.baseURL}/generate`;
    const method = 'POST';
    const request = {
      phone: customerData.phone,
      age: customerData.age,
      salary: customerData.salary,
      creditScore: customerData.creditScore,
      currentLoan: customerData.currentLoan
    };

    try {
      await new Promise(resolve => setTimeout(resolve, 1800));

      // Calculate trust score based on multiple factors
      let trustScore = 0;
      const maxScore = 100;

      // Credit Score Factor (40%)
      const creditScoreFactor = (customerData.creditScore / 900) * 40;
      trustScore += creditScoreFactor;

      // Salary Factor (25%)
      const salaryFactor = Math.min((customerData.salary / 200000) * 25, 25);
      trustScore += salaryFactor;

      // Age Factor (15%)
      const ageFactor = customerData.age >= 30 && customerData.age <= 50 ? 15 : 10;
      trustScore += ageFactor;

      // Loan History Factor (20%)
      const loanHistoryFactor = customerData.currentLoan.amount > 0 ? 
        Math.min((customerData.currentLoan.amount / 1000000) * 20, 20) : 10;
      trustScore += loanHistoryFactor;

      // Normalize to 0-100
      trustScore = Math.min(Math.round(trustScore), 100);

      // Determine trust level
      let trustLevel = 'LOW';
      if (trustScore >= 80) trustLevel = 'EXCELLENT';
      else if (trustScore >= 65) trustLevel = 'HIGH';
      else if (trustScore >= 50) trustLevel = 'MEDIUM';

      const response = {
        success: true,
        data: {
          phone: customerData.phone,
          trustScore: trustScore,
          trustLevel: trustLevel,
          factors: {
            creditScore: Math.round(creditScoreFactor),
            salary: Math.round(salaryFactor),
            age: ageFactor,
            loanHistory: Math.round(loanHistoryFactor)
          },
          generatedAt: new Date().toISOString(),
          blockchainHash: this.generateBlockchainHash(customerData.phone + trustScore)
        }
      };

      // Create blockchain transaction
      if (window.blockchainService) {
        window.blockchainService.createBlock([{
          from: 'Trust Score Service',
          to: customerData.phone,
          type: 'TRUST_SCORE_GENERATION',
          data: {
            trustScore: trustScore,
            trustLevel: trustLevel
          },
          timestamp: new Date().toISOString()
        }], 'TRUST_SCORE');
      }

      const duration = Date.now() - startTime;
      if (window.apiServers && window.apiServers.logger) {
        window.apiServers.logger.log('Trust Score Service', endpoint, method, request, response, 'SUCCESS', duration);
      }

      // Show trust score visualization
      this.showTrustScoreVisualization(trustScore, trustLevel);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      if (window.apiServers && window.apiServers.logger) {
        window.apiServers.logger.log('Trust Score Service', endpoint, method, request, { error: error.message }, 'ERROR', duration);
      }
      throw error;
    }
  }

  // Generate blockchain hash
  generateBlockchainHash(data) {
    const str = typeof data === 'string' ? data : JSON.stringify(data);
    return '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
  }

  // Show trust score visualization
  showTrustScoreVisualization(score, level) {
    const trustScorePanel = document.getElementById('trustScorePanel');
    if (!trustScorePanel) return;

    const scoreCard = document.createElement('div');
    scoreCard.className = 'trust-score-card';
    
    const levelColors = {
      'EXCELLENT': '#28a745',
      'HIGH': '#17a2b8',
      'MEDIUM': '#ffc107',
      'LOW': '#dc3545'
    };

    scoreCard.innerHTML = `
      <div class="trust-score-header">
        <i class="fas fa-shield-alt"></i>
        <span class="ms-2">Trust Score Generated</span>
      </div>
      <div class="trust-score-body">
        <div class="trust-score-value" style="color: ${levelColors[level]}">
          ${score}/100
        </div>
        <div class="trust-score-level badge bg-${level === 'EXCELLENT' ? 'success' : level === 'HIGH' ? 'info' : level === 'MEDIUM' ? 'warning' : 'danger'}">
          ${level}
        </div>
        <div class="trust-score-gauge">
          <div class="gauge-fill" style="width: ${score}%; background: ${levelColors[level]}"></div>
        </div>
      </div>
    `;

    trustScorePanel.innerHTML = '';
    trustScorePanel.appendChild(scoreCard);

    // Animate
    scoreCard.style.opacity = '0';
    scoreCard.style.transform = 'scale(0.8)';
    setTimeout(() => {
      scoreCard.style.transition = 'all 0.5s ease';
      scoreCard.style.opacity = '1';
      scoreCard.style.transform = 'scale(1)';
    }, 10);
  }
}

// Initialize Trust Score Service
const trustScoreService = new TrustScoreService();
window.trustScoreService = trustScoreService;

