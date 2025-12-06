// Token System - Generate and manage session tokens for loan applications
// Similar to BlockID but for loan application sessions

class TokenService {
  constructor() {
    this.baseURL = 'https://token.tatacapital.com/v1';
    this.activeTokens = new Map(); // Store active tokens
  }

  // Generate a new application token
  async generateToken(phone, customerData = null) {
    const startTime = Date.now();
    const endpoint = `${this.baseURL}/generate`;
    const method = 'POST';
    const request = { phone, type: 'LOAN_APPLICATION' };

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate unique token
      const tokenId = `AURA-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const tokenHash = this.generateTokenHash(tokenId);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const token = {
        tokenId: tokenId,
        tokenHash: tokenHash,
        phone: phone,
        customerData: customerData,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString(),
        blockchainHash: this.generateBlockchainHash(tokenId),
        sessionId: `SESSION-${Date.now()}`
      };

      // Store token
      this.activeTokens.set(tokenId, token);

      // Create blockchain transaction
      if (window.blockchainService) {
        window.blockchainService.createBlock([{
          from: 'Token Service',
          to: phone,
          type: 'TOKEN_GENERATION',
          data: {
            tokenId: tokenId,
            sessionId: token.sessionId
          },
          timestamp: new Date().toISOString()
        }], 'TOKEN');
      }

      const response = {
        success: true,
        data: token
      };

      const duration = Date.now() - startTime;
      if (window.apiServers && window.apiServers.logger) {
        window.apiServers.logger.log('Token Service', endpoint, method, request, response, 'SUCCESS', duration);
      }

      // Show token in UI
      this.showTokenCard(token);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      if (window.apiServers && window.apiServers.logger) {
        window.apiServers.logger.log('Token Service', endpoint, method, request, { error: error.message }, 'ERROR', duration);
      }
      throw error;
    }
  }

  // Verify token
  async verifyToken(tokenId) {
    const token = this.activeTokens.get(tokenId);
    if (!token) {
      return { success: false, error: 'Token not found or expired' };
    }

    // Check if token expired
    if (new Date(token.expiresAt) < new Date()) {
      return { success: false, error: 'Token expired' };
    }

    return {
      success: true,
      data: token
    };
  }

  // Generate token hash
  generateTokenHash(tokenId) {
    const str = tokenId + Date.now();
    return '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
  }

  // Generate blockchain hash
  generateBlockchainHash(data) {
    const str = typeof data === 'string' ? data : JSON.stringify(data);
    return '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
  }

  // Show token card in UI
  showTokenCard(token) {
    const tokenPanel = document.getElementById('tokenPanel');
    if (!tokenPanel) return;

    const tokenCard = document.createElement('div');
    tokenCard.className = 'token-card';
    tokenCard.innerHTML = `
      <div class="token-header">
        <i class="fas fa-key text-warning"></i>
        <span class="ms-2 fw-bold">Application Token</span>
        <span class="badge bg-success ms-2">ACTIVE</span>
      </div>
      <div class="token-body">
        <div class="token-id">
          <strong>Token ID:</strong>
          <div class="token-value" onclick="copyToken('${token.tokenId}')">
            ${token.tokenId}
            <i class="fas fa-copy ms-2"></i>
          </div>
        </div>
        <div class="token-details mt-2">
          <small><strong>Session ID:</strong> ${token.sessionId}</small><br>
          <small><strong>Blockchain Hash:</strong> ${token.blockchainHash.substring(0, 20)}...</small><br>
          <small><strong>Expires:</strong> ${new Date(token.expiresAt).toLocaleString()}</small>
        </div>
        <div class="token-actions mt-2">
          <button class="btn btn-sm btn-outline-primary" onclick="shareToken('${token.tokenId}')">
            <i class="fas fa-share me-1"></i>Share Token
          </button>
        </div>
      </div>
    `;

    tokenPanel.innerHTML = '';
    tokenPanel.appendChild(tokenCard);

    // Animate
    tokenCard.style.opacity = '0';
    tokenCard.style.transform = 'scale(0.9)';
    setTimeout(() => {
      tokenCard.style.transition = 'all 0.5s ease';
      tokenCard.style.opacity = '1';
      tokenCard.style.transform = 'scale(1)';
    }, 10);
  }

  // Use token to resume session
  async useToken(tokenId) {
    const verifyResponse = await this.verifyToken(tokenId);
    if (!verifyResponse.success) {
      return { success: false, error: verifyResponse.error };
    }

    const token = verifyResponse.data;
    return {
      success: true,
      data: {
        token: token,
        customerData: token.customerData,
        canResume: true
      }
    };
  }
}

// Initialize Token Service
const tokenService = new TokenService();
window.tokenService = tokenService;

// Global functions for token actions
window.copyToken = function(tokenId) {
  navigator.clipboard.writeText(tokenId).then(() => {
    alert('Token copied to clipboard!');
  });
};

window.shareToken = function(tokenId) {
  const shareText = `Use this token to resume your loan application: ${tokenId}`;
  if (navigator.share) {
    navigator.share({ text: shareText });
  } else {
    navigator.clipboard.writeText(shareText).then(() => {
      alert('Token link copied to clipboard!');
    });
  }
};

