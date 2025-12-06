// Agent Orchestrator - Handles agent handoffs and data transfer visualization

class AgentOrchestrator {
  constructor() {
    this.activeAgent = null;
    this.agentQueue = [];
    this.dataFlow = [];
  }

  // Show agent handoff with visual animation
  async handoffToAgent(fromAgent, toAgent, data = {}) {
    // Update UI
    this.updateAgentStatus(fromAgent, 'idle');
    this.updateAgentStatus(toAgent, 'active');
    
    // Show handoff animation
    this.showHandoffAnimation(fromAgent, toAgent, data);
    
    // Log data transfer
    this.logDataTransfer(fromAgent, toAgent, data);
    
    // Update active agent
    this.activeAgent = toAgent;
  }

  updateAgentStatus(agentName, status) {
    const statusMap = {
      'Master Agent': 'masterStatus',
      'Sales Agent': 'salesStatus',
      'Verification Agent': 'verifyStatus',
      'Underwriting Agent': 'underStatus',
      'Sanction Letter Agent': 'letterStatus'
    };

    const elementId = statusMap[agentName];
    if (!elementId) return;

    const element = document.getElementById(elementId);
    if (element) {
      const statusClasses = {
        'idle': 'bg-secondary',
        'active': 'bg-primary',
        'processing': 'bg-warning',
        'complete': 'bg-success',
        'error': 'bg-danger'
      };

      element.className = `badge ${statusClasses[status] || 'bg-secondary'}`;
      element.textContent = status.toUpperCase();
      
      // Add pulse animation
      element.style.animation = 'pulse 0.5s ease';
      setTimeout(() => {
        element.style.animation = '';
      }, 500);
    }
  }

  showHandoffAnimation(fromAgent, toAgent, data) {
    const handoffContainer = document.getElementById('agentHandoffContainer');
    if (!handoffContainer) return;

    const handoffCard = document.createElement('div');
    handoffCard.className = 'handoff-card';
    handoffCard.innerHTML = `
      <div class="handoff-header">
        <i class="fas fa-exchange-alt text-primary"></i>
        <span class="ms-2">Agent Handoff</span>
      </div>
      <div class="handoff-content">
        <div class="handoff-from">
          <i class="fas fa-robot"></i>
          <span>${fromAgent}</span>
        </div>
        <div class="handoff-arrow">
          <i class="fas fa-arrow-right"></i>
          <div class="data-packet">
            <i class="fas fa-database"></i>
            <small>Data Transfer</small>
          </div>
        </div>
        <div class="handoff-to">
          <i class="fas fa-robot"></i>
          <span>${toAgent}</span>
        </div>
      </div>
      ${Object.keys(data).length > 0 ? `
        <div class="handoff-data">
          <strong>Data:</strong>
          <pre>${JSON.stringify(data, null, 2)}</pre>
        </div>
      ` : ''}
    `;

    handoffContainer.appendChild(handoffCard);
    handoffContainer.scrollTop = handoffContainer.scrollHeight;

    // Animate
    handoffCard.style.opacity = '0';
    handoffCard.style.transform = 'translateY(20px)';
    setTimeout(() => {
      handoffCard.style.transition = 'all 0.5s ease';
      handoffCard.style.opacity = '1';
      handoffCard.style.transform = 'translateY(0)';
    }, 10);

    // Remove after 5 seconds
    setTimeout(() => {
      handoffCard.style.opacity = '0';
      handoffCard.style.transform = 'translateY(-20px)';
      setTimeout(() => handoffCard.remove(), 500);
    }, 5000);
  }

  logDataTransfer(fromAgent, toAgent, data) {
    const transfer = {
      timestamp: new Date().toLocaleTimeString(),
      from: fromAgent,
      to: toAgent,
      data: data,
      size: JSON.stringify(data).length
    };

    this.dataFlow.push(transfer);

    // Update data flow visualization
    this.updateDataFlowVisualization();
  }

  updateDataFlowVisualization() {
    const flowContainer = document.getElementById('dataFlowContainer');
    if (!flowContainer) return;

    // Show last 5 transfers
    const recentTransfers = this.dataFlow.slice(-5);
    
    flowContainer.innerHTML = recentTransfers.map(transfer => `
      <div class="data-flow-item">
        <div class="flow-time">${transfer.timestamp}</div>
        <div class="flow-path">
          <span class="flow-agent">${transfer.from}</span>
          <i class="fas fa-arrow-right mx-2"></i>
          <span class="flow-agent">${transfer.to}</span>
        </div>
        <div class="flow-size"><i class="fas fa-database me-1"></i>${transfer.size} bytes</div>
      </div>
    `).join('');
  }

  showAgentActivity(agentName, activity) {
    const activityContainer = document.getElementById('agentActivityContainer');
    if (!activityContainer) return;

    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    activityItem.innerHTML = `
      <div class="activity-time">${new Date().toLocaleTimeString()}</div>
      <div class="activity-agent">${agentName}</div>
      <div class="activity-message">${activity}</div>
    `;

    activityContainer.appendChild(activityItem);
    activityContainer.scrollTop = activityContainer.scrollHeight;

    // Animate
    activityItem.style.opacity = '0';
    setTimeout(() => {
      activityItem.style.transition = 'opacity 0.3s';
      activityItem.style.opacity = '1';
    }, 10);
  }
}

// Initialize orchestrator
const agentOrchestrator = new AgentOrchestrator();
window.agentOrchestrator = agentOrchestrator;

